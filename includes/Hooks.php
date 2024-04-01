<?php

// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

namespace MediaWiki\Extension\WikiLove;

use ApiMessage;
use IApiMessage;
use MediaWiki\ChangeTags\Hook\ChangeTagsListActiveHook;
use MediaWiki\ChangeTags\Hook\ListDefinedTagsHook;
use MediaWiki\Config\Config;
use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Hook\SkinTemplateNavigation__UniversalHook;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\OutputPage;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\Title\Title;
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\User;
use Skin;
use SkinTemplate;

/**
 * Hooks for WikiLove extension
 *
 * @file
 * @ingroup Extensions
 */

class Hooks implements
	GetPreferencesHook,
	SkinTemplateNavigation__UniversalHook,
	BeforePageDisplayHook,
	ListDefinedTagsHook,
	ChangeTagsListActiveHook
{

	/** @var Config */
	private $config;

	/** @var UserOptionsLookup */
	private $userOptionsLookup;

	/**
	 * @param Config $config
	 * @param UserOptionsLookup $userOptionsLookup
	 */
	public function __construct(
		Config $config,
		UserOptionsLookup $userOptionsLookup
	) {
		$this->config = $config;
		$this->userOptionsLookup = $userOptionsLookup;
	}

	/**
	 * Add the preference in the user preferences with the GetPreferences hook.
	 *
	 * @param User $user
	 * @param array &$preferences
	 */
	public function onGetPreferences( $user, &$preferences ) {
		if ( !$this->config->get( 'WikiLoveGlobal' ) ) {
			$preferences['wikilove-enabled'] = [
				'type' => 'check',
				'section' => 'editing/advancedediting',
				'label-message' => 'wikilove-enable-preference',
			];
		}
	}

	/**
	 * Adds the required module if we are on a user (talk) page.
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		if (
			!$this->config->get( 'WikiLoveGlobal' ) &&
			!$this->userOptionsLookup->getOption( $out->getUser(), 'wikilove-enabled' )
		) {
			return;
		}

		$title = self::getUserTalkPage( $skin->getTitle(), $skin->getUser() );
		// getUserTalkPage() returns an ApiMessage on error
		if ( !$title instanceof ApiMessage ) {
			$recipient = $title->getBaseText();

			$out->addJsConfigVars( [ 'wikilove-recipient' => $recipient ] );

			$out->addModules( 'ext.wikiLove.init' );
			$out->addModuleStyles( 'ext.wikiLove.icon' );
		}
	}

	/**
	 * Add a tab or an icon the new way (MediaWiki 1.18+)
	 *
	 * @param SkinTemplate $skin
	 * @param array &$links Navigation links
	 */
	public function onSkinTemplateNavigation__Universal( $skin, &$links ): void {
		if ( $this->showIcon( $skin ) ) {
			$this->skinConfigViewsLinks( $skin, $links['views'] );
		} else {
			$this->skinConfigViewsLinks( $skin, $links['actions'] );
		}
	}

	/**
	 * Configure views links.
	 *
	 * Helper function for SkinTemplateNavigation hooks
	 * to configure views links.
	 *
	 * @param Skin $skin
	 * @param array &$views
	 */
	private function skinConfigViewsLinks( $skin, &$views ) {
		// If WikiLove is turned off for this user, don't display tab.
		if (
			!$this->config->get( 'WikiLoveGlobal' ) &&
			!$this->userOptionsLookup->getOption( $skin->getUser(), 'wikilove-enabled' )
		) {
			return;
		}

		// getUserTalkPage() returns an ApiMessage on error
		if ( !self::getUserTalkPage( $skin->getTitle(), $skin->getUser() ) instanceof ApiMessage ) {
			$views['wikilove'] = [
				'text' => $skin->msg( 'wikilove-tab-text' )->text(),
				'href' => '#',
			];
			if ( $this->showIcon( $skin ) ) {
				$views['wikilove']['icon'] = 'heart';
				$views['wikilove']['button'] = true;
				$views['wikilove']['primary'] = true;
			}
		}
	}

	/**
	 * Only show an icon when the global preference is enabled and the current skin isn't CologneBlue.
	 *
	 * @param Skin $skin
	 * @return bool
	 */
	private function showIcon( $skin ) {
		return $this->config->get( 'WikiLoveTabIcon' ) &&
			$skin->getSkinName() !== 'cologneblue';
	}

	/**
	 * Find the editable talk page of the user we want to send WikiLove to. This
	 * function also does some sense-checking to make sure we will actually
	 * be able to send WikiLove to the target.
	 *
	 * Phan false positives are suppressed
	 *
	 * @param Title $title The title of a user page or user talk page
	 * @param User $user the current user
	 * @return Title|IApiMessage Returns either the Title object for the talk page or an error message
	 * @suppress PhanPossiblyUndeclaredVariable,PhanTypeMismatchReturnNullable,PhanTypeMismatchArgumentNullable
	 */
	public static function getUserTalkPage( $title, $user ) {
		// Exit early if the sending user isn't logged in
		if ( !$user->isRegistered() || $user->isTemp() ) {
			return ApiMessage::create( 'wikilove-err-not-logged-in', 'notloggedin' );
		}

		// Exit early if the page is in the wrong namespace
		$ns = $title->getNamespace();
		if ( $ns !== NS_USER && $ns !== NS_USER_TALK ) {
			return ApiMessage::create( 'wikilove-err-invalid-username', 'invalidusername' );
		}

		// If we're on a subpage, get the root page title
		$baseTitle = $title->getRootTitle();

		// Users can't send WikiLove to themselves
		if ( $user->getName() === $baseTitle->getText() ) {
			return ApiMessage::create( 'wikilove-err-no-self-wikilove', 'no-self-wikilove' );
		}

		// Get the user talk page
		if ( $ns === NS_USER_TALK ) {
			// We're already on the user talk page
			$talkTitle = $baseTitle;
		} elseif ( $ns === NS_USER ) {
			// We're on the user page, so retrieve the user talk page instead
			$talkTitle = $baseTitle->getTalkPage();
		}

		// If it's a redirect, exit. We don't follow redirects since it might confuse the user or
		// lead to an endless loop (like if the talk page redirects to the user page or a subpage).
		// This means that the WikiLove tab will not appear on user pages or user talk pages if
		// the user talk page is a redirect.
		if ( $talkTitle->isRedirect() ) {
			return ApiMessage::create( 'wikilove-err-redirect', 'isredirect' );
		}

		// Make sure we can edit the page
		if ( !MediaWikiServices::getInstance()->getPermissionManager()
			->quickUserCan( 'edit', $user, $talkTitle ) ) {
			return ApiMessage::create( 'wikilove-err-cannot-edit', 'cannotedit' );
		}

		return $talkTitle;
	}

	/**
	 * ListDefinedTags hook handler
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ListDefinedTags
	 * @param array &$tags
	 */
	public function onListDefinedTags( &$tags ) {
		$tags[] = 'wikilove';
	}

	/**
	 * ChangeTagsListActive hook handler
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ChangeTagsListActive
	 * @param array &$tags
	 */
	public function onChangeTagsListActive( &$tags ) {
		$tags[] = 'wikilove';
	}

}
