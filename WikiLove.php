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
	'version' => '0.1',
	'url' => 'http://www.mediawiki.org/wiki/Extension:WikiLove',
	'author' => array(
		'Ryan Kaldari', 'Jan Paul Posma'
	),
	'descriptionmsg' => 'wikilove-desc',
);

// current directory including trailing slash
$dir = dirname( __FILE__ ) . '/';

// add autoload classes
$wgAutoloadClasses['WikiLoveApi']                 = $dir . 'WikiLove.api.php';
$wgAutoloadClasses['WikiLoveHooks']               = $dir . 'WikiLove.hooks.php';

// i18n messages
$wgExtensionMessagesFiles['WikiLove']             = $dir . 'WikiLove.i18n.php';

// register hooks
$wgHooks['GetPreferences'][]                      = 'WikiLoveHooks::getPreferences';
$wgHooks['SkinTemplateNavigation'][]              = 'WikiLoveHooks::skinTemplateNavigation';
$wgHooks['SkinTemplateTabs'][]                    = 'WikiLoveHooks::skinTemplateTabs';
$wgHooks['BeforePageDisplay'][]                   = 'WikiLoveHooks::beforePageDisplay';
//$wgHooks['LoadExtensionSchemaUpdates'][]          = 'WikiLoveHooks::loadExtensionSchemaUpdates';
// Not a final schema, please apply patches/WikiLoveLog.sql manually for now!

// api modules
$wgAPIModules['wikiLove'] = 'WikiLoveApi';

// default user options
$wgWikiLoveTabIcon = true;

// resources
$wikiLoveTpl = array(
	'localBasePath' => dirname( __FILE__ ),
	'remoteExtPath' => 'WikiLove',
	'group'         => 'ext.wikiLove',
);

$wgResourceModules += array(
	'ext.wikiLove' => $wikiLoveTpl + array(
		'scripts'      => 'wikiLove.js',
		'styles'       => 'wikiLove.css',
		'messages' => array(
			'wikilove-dialog-title',
			'wikilove-select-type',
			'wikilove-add-details',
			'wikilove-title',
			'wikilove-enter-message',
			'wikilove-omit-sig',
			'wikilove-button-preview',
			'wikilove-preview',
			'wikilove-button-send',
			'wikilove-type-makeyourown',
		),
		'dependencies' => array(
			'jquery.ui.dialog',
		),
	),
);
