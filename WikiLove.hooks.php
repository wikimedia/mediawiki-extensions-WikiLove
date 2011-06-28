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
	 * @param $updater DatabaseUpdater
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
	 * @param $user User
	 * @param $preferences
	 */
	public static function getPreferences( $user, &$preferences ) {
		global $wgWikiLoveGlobal;
		if ( !$wgWikiLoveGlobal ) {
			$preferences['wikilove-enabled'] = array(
				'type' => 'check',
				'section' => 'editing/labs',
				'label-message' => 'wikilove-enable-preference',
			);
		}
		return true;
	}
	
	/**
	 * Adds the required module if we are on a user (talk) page.
	 *
	 * @param $output
	 * @param $skin Skin
	 */
	public static function beforePageDisplay( $out, $skin ) {
		global $wgWikiLoveGlobal, $wgWikiLoveEnableLocalConfig, $wgUser;
		if ( !$wgWikiLoveGlobal && !$wgUser->getOption( 'wikilove-enabled' ) ) {
			return true;
		}
		
		$title = self::getUserTalkPage( $skin->getTitle() );
		if ( !is_null( $title ) ) {
			$out->addModules( 'ext.wikiLove.icon' );
			
			// it is much better to have a chain like: startup -> default -> local -> init,
			// but because of this bug that isn't possible right now: https://bugzilla.wikimedia.org/29608
			$optionsTitle = Title::newFromText( "MediaWiki:WikiLove.js" );
			if( $optionsTitle->exists() && $optionsTitle->isCssOrJsPage() ) {
				$out->addModules( 'ext.wikiLove.local' );
			}
			else {
				$out->addModules( 'ext.wikiLove.defaultOptions' );
			}
			
			self::$recipient = $title->getBaseText();
		}
		return true;
	}
	
	/**
	 * Exports wikilove-recipient and edittoken variables to JS
	 */
	public static function makeGlobalVariablesScript( &$vars ) {
		global $wgUser;
		$vars['wikilove-recipient'] = self::$recipient;
		$vars['wikilove-edittoken'] = $wgUser->edittoken();
		
		$vars['wikilove-anon'] = 0;
		if ( self::$recipient !== '' ) {
			$receiver = User::newFromName( self::$recipient );
			if ( $receiver === false || $receiver->isAnon() ) $vars['wikilove-anon'] = 1;
		}
		return true;
	}
	
	/**
	 * Adds a tab the old way (before MW 1.18)
	 */
	public static function skinTemplateTabs( $skin, &$contentActions ) {
		self::skinConfigViewsLinks( $skin, $contentActions );
		return true;
	}
	
	/**
	 * Adds a tab or an icon the new way (MW >1.18)
	 */
	public static function skinTemplateNavigation( &$skin, &$links ) {
		if ( self::showIcon( $skin ) ) {
			self::skinConfigViewsLinks( $skin, $links['views']);
		}
		else {
			self::skinConfigViewsLinks( $skin, $links['actions']);
		}
		return true;
	}
	
	/**
	 * Configure views links.
	 * Helper function for SkinTemplateTabs and SkinTemplateNavigation hooks
	 * to configure views links.
	 *
	 * @param $skin Skin
	 * @param $views
	 */
	private static function skinConfigViewsLinks( $skin, &$views ) {
		global $wgWikiLoveGlobal, $wgUser;
		if ( !$wgWikiLoveGlobal && !$wgUser->getOption( 'wikilove-enabled' ) ) {
			return true;
		}
		
		if ( !is_null( self::getUserTalkPage( $skin->getTitle() ) ) ) {
			$views['wikilove'] = array(
				'text' => wfMsg( 'wikilove-tab-text' ),
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
	 * @param $skin Skin
	 */
	private static function showIcon( $skin ) {
		global $wgWikiLoveTabIcon;
		return $wgWikiLoveTabIcon && $skin->getSkinName() == 'vector';
	}
	
	/**
	 * Find the editable talk page of the user we're looking at, or null
	 * if such page does not exist.
	 *
	 * @param $title Title
	 *
	 * @return Title|null
	 */
	public static function getUserTalkPage( $title ) {
		global $wgUser;
		if ( !$wgUser->isLoggedIn() ) {
			return null;
		}
		
		$ns = $title->getNamespace();
		// return quickly if we're in the wrong namespace anyway
		if ( $ns != NS_USER && $ns != NS_USER_TALK ) {
			return null;
		}
		
		$baseTitle = Title::newFromText( $title->getBaseText(), $ns );
		
		if ( $ns == NS_USER_TALK && $baseTitle->quickUserCan( 'edit' ) ) {
			return $baseTitle;
		} elseif ( $ns == NS_USER ) {
			$talk = $baseTitle->getTalkPage();
			if ( $talk->quickUserCan( 'edit' ) ) {
				return $talk;
			}
		}
		return null;
	}
}