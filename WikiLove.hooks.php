<?php
/**
 * Hooks for WikiLove extension
 *
 * @file
 * @ingroup Extensions
 */

class WikiLoveHooks {
	private static $recipient = '';

	/**
	 * LoadExtensionSchemaUpdates hook
	 *
	 * @param DatabaseUpdater $updater
	 *
	 * @return bool true
	 */
	public static function loadExtensionSchemaUpdates( $updater = null ) {
		if ( $updater === null ) {
			global $wgExtNewTables;
			$wgExtNewTables[] = array( 'wikilove_log', dirname( __FILE__ ) . '/patches/WikiLoveLog.sql' );
			$wgExtNewTables[] = array( 'wikilove_image_log', dirname( __FILE__ ) . '/patches/WikiLoveImageLog.sql' );
		} else {
			$updater->addExtensionUpdate( array( 'addTable', 'wikilove_log',
				dirname( __FILE__ ) . '/patches/WikiLoveLog.sql', true ) );
			$updater->addExtensionUpdate( array( 'addTable', 'wikilove_image_log',
				dirname( __FILE__ ) . '/patches/WikiLoveImageLog.sql', true ) );
		}
		return true;
	}

	/**
	 * Add the preference in the user preferences with the GetPreferences hook.
	 * @param User $user
	 * @param array $preferences
	 *
	 * @return bool true
	 */
	public static function getPreferences( $user, &$preferences ) {
		global $wgWikiLoveGlobal;
		if ( !$wgWikiLoveGlobal ) {
			$preferences['wikilove-enabled'] = array(
				'type' => 'check',
				'section' => 'misc/user-pages',
				'label-message' => 'wikilove-enable-preference',
			);
		}
		return true;
	}

	/**
	 * Adds the required module if we are on a user (talk) page.
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 *
	 * @return bool true
	 */
	public static function beforePageDisplay( $out, $skin ) {
		global $wgWikiLoveGlobal;

		if ( !$wgWikiLoveGlobal && !$out->getUser()->getOption( 'wikilove-enabled' ) ) {
			return true;
		}

		$title = self::getUserTalkPage( $skin->getTitle() );
		// getUserTalkPage() returns a string on error
		if ( !is_string( $title ) ) {
			$out->addModules( array( 'ext.wikiLove.icon', 'ext.wikiLove.init' ) );
			self::$recipient = $title->getBaseText();
		}
		return true;
	}

	/**
	 * Exports wikilove-recipient and wikilove-anon variables to JS
	 *
	 * @param array $vars
	 *
	 * @return bool true
	 */
	public static function makeGlobalVariablesScript( &$vars ) {
		$vars['wikilove-recipient'] = self::$recipient;

		$vars['wikilove-anon'] = 0;
		if ( self::$recipient !== '' ) {
			$receiver = User::newFromName( self::$recipient );
			if ( $receiver === false || $receiver->isAnon() ) $vars['wikilove-anon'] = 1;
		}
		return true;
	}

	/**
	 * Adds a tab or an icon the new way (MediaWiki 1.18+)
	 * @param SkinTemplate $skin
	 * @param array $links Navigation links
	 * @return boolean
	 */
	public static function skinTemplateNavigation( &$skin, &$links ) {
		if ( self::showIcon( $skin ) ) {
			self::skinConfigViewsLinks( $skin, $links['views']);
		} else {
			self::skinConfigViewsLinks( $skin, $links['actions']);
		}
		return true;
	}

	/**
	 * Configure views links.
	 * Helper function for SkinTemplateTabs and SkinTemplateNavigation hooks
	 * to configure views links.
	 *
	 * @param Skin $skin
	 * @param array $views
	 * @return boolean
	 */
	private static function skinConfigViewsLinks( $skin, &$views ) {
		global $wgWikiLoveGlobal;

		// If WikiLove is turned off for this user, don't display tab.
		if ( !$wgWikiLoveGlobal && !$skin->getUser()->getOption( 'wikilove-enabled' ) ) {
			return true;
		}

		// getUserTalkPage() returns a string on error
		if ( !is_string( self::getUserTalkPage( $skin->getTitle() ) ) ) {
			$views['wikilove'] = array(
				'text' => $skin->msg( 'wikilove-tab-text' )->text(),
				'href' => '#',
			);
			if ( self::showIcon( $skin ) ) {
				$views['wikilove']['class'] = 'icon';
				$views['wikilove']['primary'] = true;
			}
		}
		return true;
	}

	/**
	 * Only show an icon when the global preference is enabled and the current skin is Vector.
	 *
	 * @param Skin $skin
	 *
	 * @return boolean
	 */
	private static function showIcon( $skin ) {
		global $wgWikiLoveTabIcon;
		return $wgWikiLoveTabIcon && $skin->getSkinName() == 'vector';
	}

	/**
	 * Find the editable talk page of the user we want to send WikiLove to. This
	 * function also does some sanity checking to make sure we will actually 
	 * be able to send WikiLove to the target.
	 *
	 * @param Title $title The title of a user page or user talk page
	 *
	 * @return Title|string Returns either the Title object for the talk page or an error string
	 */
	public static function getUserTalkPage( $title ) {
		global $wgUser;

		// Exit early if the sending user isn't logged in
		if ( !$wgUser->isLoggedIn() ) {
			return wfMessage( 'wikilove-err-not-logged-in' )->plain();
		}

		// Exit early if the page is in the wrong namespace
		$ns = $title->getNamespace();
		if ( $ns != NS_USER && $ns != NS_USER_TALK ) {
			return wfMessage( 'wikilove-err-invalid-username' )->plain();
		}

		// If we're on a subpage, get the base page title
		$baseTitle = $title->getBaseTitle();

		// Users can't send WikiLove to themselves
		if ( $wgUser->getName() === $baseTitle->getText() ) {
			return wfMessage( 'wikilove-err-no-self-wikilove' )->plain();
		}

		// Get the user talk page
		if ( $ns == NS_USER_TALK ) {
			// We're already on the user talk page
			$talkTitle = $baseTitle;
		} elseif ( $ns == NS_USER ) {
			// We're on the user page, so retrieve the user talk page instead
			$talkTitle = $baseTitle->getTalkPage();
		}

		// If it's a redirect, exit. We don't follow redirects since it might confuse the user or
		// lead to an endless loop (like if the talk page redirects to the user page or a subpage).
		// This means that the WikiLove tab will not appear on user pages or user talk pages if
		// the user talk page is a redirect.
		if ( $talkTitle->isRedirect() ) {
			return wfMessage( 'wikilove-err-redirect' )->plain();
		}

		// Make sure we can edit the page
		if ( $talkTitle->quickUserCan( 'edit' ) ) {
			return $talkTitle;
		} else {
			return wfMessage( 'wikilove-err-cannot-edit' )->plain();
		}
	}
}
