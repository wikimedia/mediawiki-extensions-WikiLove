<?php
/**
 * MediaWiki WikiLove extension
 * http://www.mediawiki.org/wiki/Extension:WikiLove
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * http://www.gnu.org/copyleft/gpl.html
 *
 * Heart icon by Mark James (Creative Commons Attribution 3.0 License)
 * Interface design by Brandon Harris
 */

/**
 * @file
 * @ingroup Extensions
 * @author Ryan Kaldari, Jan Paul Posma
 */

# Alert the user that this is not a valid entry point to MediaWiki if they try to access the file directly.
if ( !defined( 'MEDIAWIKI' ) ) {
	echo <<<EOT
To install this extension, put the following line in LocalSettings.php:
require_once( "\$IP/extensions/WikiLove/WikiLove.php" );
EOT;
	exit( 1 );
}

// Extension credits that will show up on Special:Version
$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'WikiLove',
	'version' => '1.0',
	'url' => 'http://www.mediawiki.org/wiki/Extension:WikiLove',
	'author' => array(
		'Ryan Kaldari', 'Jan Paul Posma'
	),
	'descriptionmsg' => 'wikilove-desc',
);

// default user options
$wgWikiLoveGlobal  = false; // enable the extension for all users, removing the user preference
$wgWikiLoveTabIcon = true;  // use an icon for skins that support them (i.e. Vector)
$wgWikiLoveLogging = false; // enable logging of giving of WikiLove

// current directory including trailing slash
$dir = dirname( __FILE__ ) . '/';

// add autoload classes
$wgAutoloadClasses['WikiLoveApi']                 = $dir . 'WikiLove.api.php';
$wgAutoloadClasses['WikiLoveImageLogApi']         = $dir . 'WikiLoveImageLog.api.php';
$wgAutoloadClasses['WikiLoveHooks']               = $dir . 'WikiLove.hooks.php';
$wgAutoloadClasses['WikiLoveLocal']               = $dir . 'WikiLove.local.php';

// i18n messages
$wgExtensionMessagesFiles['WikiLove']             = $dir . 'WikiLove.i18n.php';

// register hooks
$wgHooks['GetPreferences'][]                      = 'WikiLoveHooks::getPreferences';
$wgHooks['SkinTemplateNavigation'][]              = 'WikiLoveHooks::skinTemplateNavigation';
$wgHooks['SkinTemplateTabs'][]                    = 'WikiLoveHooks::skinTemplateTabs';
$wgHooks['BeforePageDisplay'][]                   = 'WikiLoveHooks::beforePageDisplay';
$wgHooks['LoadExtensionSchemaUpdates'][]          = 'WikiLoveHooks::loadExtensionSchemaUpdates';
$wgHooks['MakeGlobalVariablesScript'][]           = 'WikiLoveHooks::makeGlobalVariablesScript';

// api modules
$wgAPIModules['wikilove'] = 'WikiLoveApi';
$wgAPIModules['wikiloveimagelog'] = 'WikiLoveImageLogApi';

$extWikiLoveTpl = array(
	'localBasePath' => dirname( __FILE__ ) . '/modules/ext.wikiLove',
	'remoteExtPath' => 'WikiLove/modules/ext.wikiLove',
);

// messages for default options, because we want to use them in the default
// options module, but also for the user in the user options module
$wgWikiLoveOptionMessages = array(
	'wikilove-type-makeyourown',
);

// resources
// it is much better to have a chain like: startup -> default -> local -> init,
// but because of this bug that isn't possible right now: https://bugzilla.wikimedia.org/29608
$wgResourceModules += array(
	'ext.wikiLove.icon' => $extWikiLoveTpl + array(
		'styles' => 'ext.wikiLove.icon.css',
		'position' => 'top',
	),
	'ext.wikiLove.startup' => $extWikiLoveTpl + array(
		'scripts' => array(
			'ext.wikiLove.core.js',
		),
		'styles' => 'ext.wikiLove.css',
		'messages' => array(
			'wikilove-dialog-title',
			'wikilove-select-type',
			'wikilove-get-started-header',
			'wikilove-get-started-list-1',
			'wikilove-get-started-list-2',
			'wikilove-get-started-list-3',
			'wikilove-add-details',
			'wikilove-image',
			'wikilove-select-image',
			'wikilove-header',
			'wikilove-title',
			'wikilove-enter-message',
			'wikilove-omit-sig',
			'wikilove-image-example',
			'wikilove-button-preview',
			'wikilove-preview',
			'wikilove-notify',
			'wikilove-button-send',
			'wikilove-err-header',
			'wikilove-err-title',
			'wikilove-err-msg',
			'wikilove-err-image',
			'wikilove-err-image-bad',
			'wikilove-err-image-api',
			'wikilove-err-sig',
			'wikilove-err-gallery',
			'wikilove-err-gallery-again',
			'wikilove-what-is-this',
			'wikilove-anon-warning',
			'wikilove-commons-text',
			'wikilove-commons-link',
			'wikilove-commons-url',
			'wikilove-err-preview-api',
			'wikilove-err-send-api',
		),
		'dependencies' => array(
			'jquery.ui.dialog',
			'jquery.ui.button',
			'jquery.localize',
			'jquery.elastic',
		),
	),
	'ext.wikiLove.local' => array(
		'class' => 'WikiLoveLocal',
		/* for information only, this is actually in the class!
		'messages' => $wgWikiLoveOptionMessages,
		'dependencies' => 'ext.wikiLove.startup'
		*/
	),
	'ext.wikiLove.defaultOptions' => $extWikiLoveTpl + array(
		'scripts' => array(
			'ext.wikiLove.defaultOptions.js',
		),
		'messages' => $wgWikiLoveOptionMessages,
		'dependencies' => 'ext.wikiLove.startup'
	),
	'jquery.elastic' => array(
		'localBasePath' => dirname( __FILE__ ) . '/modules/jquery.elastic',
		'remoteExtPath' => 'WikiLove/modules/jquery.elastic',
		'scripts' => 'jquery.elastic.js',
	),
);
