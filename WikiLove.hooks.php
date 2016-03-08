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
	 */
	public static function onLoadExtensionSchemaUpdates( $updater = null ) {
		if ( $updater === null ) {
			global $wgExtNewTables;
			$wgExtNewTables[] = array( 'wikilove_log', dirname( __FILE__ ) . '/patches/WikiLoveLog.sql' );
		} else {
			$updater->addExtensionUpdate( array( 'addTable', 'wikilove_log',
				dirname( __FILE__ ) . '/patches/WikiLoveLog.sql', true ) );
		}
	}

	/**
	 * Add the preference in the user preferences with the GetPreferences hook.
	 *
	 * @param User $user
	 * @param array $preferences
	 */
	public static function onGetPreferences( $user, &$preferences ) {
		global $wgWikiLoveGlobal;
		if ( !$wgWikiLoveGlobal ) {
			$preferences['wikilove-enabled'] = array(
				'type' => 'check',
				'section' => 'editing/advancedediting',
				'label-message' => 'wikilove-enable-preference',
			);
		}
	}

	/**
	 * Adds the required module if we are on a user (talk) page.
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public static function onBeforePageDisplay( $out, $skin ) {
		global $wgWikiLoveGlobal;

		if ( !$wgWikiLoveGlobal && !$out->getUser()->getOption( 'wikilove-enabled' ) ) {
			return true;
		}

		$title = self::getUserTalkPage( $skin->getTitle(), $skin->getUser() );
		// getUserTalkPage() returns a string on error
		if ( !is_string( $title ) ) {
			$out->addModules( 'ext.wikiLove.init' );
			$out->addModuleStyles( 'ext.wikiLove.icon' );
			self::$recipient = $title->getBaseText();
		}
	}

	/**
	 * Export page/user specific WikiLove variables to JS
	 *
	 * @param array $vars
	 */
	public static function onMakeGlobalVariablesScript( &$vars ) {
		$vars['wikilove-recipient'] = self::$recipient;

		$vars['wikilove-anon'] = 0;
		if ( self::$recipient !== '' ) {
			$receiver = User::newFromName( self::$recipient );
			if ( $receiver === false || $receiver->isAnon() ) $vars['wikilove-anon'] = 1;
		}
	}

	/**
	 * Add a tab or an icon the new way (MediaWiki 1.18+)
	 *
	 * @param SkinTemplate $skin
	 * @param array $links Navigation links
	 */
	public static function onSkinTemplateNavigation( &$skin, &$links ) {
		if ( self::showIcon( $skin ) ) {
			self::skinConfigViewsLinks( $skin, $links['views']);
		} else {
			self::skinConfigViewsLinks( $skin, $links['actions']);
		}
	}

	/**
	 * Configure views links.
	 *
	 * Helper function for SkinTemplateTabs and SkinTemplateNavigation hooks
	 * to configure views links.
	 *
	 * @param Skin $skin
	 * @param array $views
	 */
	private static function skinConfigViewsLinks( $skin, &$views ) {
		global $wgWikiLoveGlobal;

		// If WikiLove is turned off for this user, don't display tab.
		if ( !$wgWikiLoveGlobal && !$skin->getUser()->getOption( 'wikilove-enabled' ) ) {
			return;
		}

		// getUserTalkPage() returns a string on error
		if ( !is_string( self::getUserTalkPage( $skin->getTitle(), $skin->getUser() ) ) ) {
			$views['wikilove'] = array(
				'text' => $skin->msg( 'wikilove-tab-text' )->text(),
				'href' => '#',
			);
			if ( self::showIcon( $skin ) ) {
				$views['wikilove']['class'] = 'icon';
				$views['wikilove']['primary'] = true;
			}
		}
	}

	/**
	 * Only show an icon when the global preference is enabled and the current skin is Vector.
	 *
	 * @param Skin $skin
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
	 * @param User $user the current user
	 * @return Title|string Returns either the Title object for the talk page or an error string
	 */
	public static function getUserTalkPage( $title, $user ) {
		// Exit early if the sending user isn't logged in
		if ( !$user->isLoggedIn() ) {
			return wfMessage( 'wikilove-err-not-logged-in' )->plain();
		}

		// Exit early if the page is in the wrong namespace
		$ns = $title->getNamespace();
		if ( $ns != NS_USER && $ns != NS_USER_TALK ) {
			return wfMessage( 'wikilove-err-invalid-username' )->plain();
		}

		// If we're on a subpage, get the root page title
		$baseTitle = $title->getRootTitle();

		// Users can't send WikiLove to themselves
		if ( $user->getName() === $baseTitle->getText() ) {
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
		if ( !$talkTitle->quickUserCan( 'edit' ) ) {
			return wfMessage( 'wikilove-err-cannot-edit' )->plain();
		}

		return $talkTitle;
	}

	/**
	 * ListDefinedTags and ChangeTagsListActive hook handler
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ListDefinedTags
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ChangeTagsListActive
	 * @param array $tags
	 */
	public static function onListDefinedTags( &$tags ) {
		$tags[] = 'wikilove';
	}

	/**
	 * Tables that Extension:UserMerge needs to update
	 *
	 * @param array $updateFields
	 */
	public static function onUserMergeAccountFields( array &$updateFields ) {
		global $wgWikiLoveLogging;
		$dbr = wfGetDB( DB_SLAVE );
		// FIXME HACK: The extension never actually required the 'wikilove_log' table
		// and would suppress db errors if it didn't exist
		if ( $wgWikiLoveLogging && $dbr->tableExists( 'wikilove_log' ) ) {
			$updateFields[] = array( 'wikilove_log', 'wll_sender' );
			$updateFields[] = array( 'wikilove_log', 'wll_receiver' );
		}
	}

}
