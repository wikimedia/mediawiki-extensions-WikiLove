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
 */

/**
 * @file
 * @ingroup Extensions
 * @author Ryan Kaldari
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
		'Ryan Kaldari'
	),
	'descriptionmsg' => 'wikilove-desc',
);

$dir = dirname( __FILE__ ) . '/';

$wgHooks['LoadExtensionSchemaUpdates'][] = 'efWikiLoveSchema';

$wgExtensionMessagesFiles['WikiLove'] = $dir . 'WikiLove.i18n.php';

function efWikiLoveSchema( $updater = null ) {
	$dir = dirname( __FILE__ ) . '/';
	if ( $updater === null ) {
		global $wgDBtype, $wgExtNewTables;

		if ( $wgDBtype == 'mysql' ) {
			$wgExtNewTables[] = array( 'wikilove_log', $dir . 'WikiLove.sql' );
		}
	} else {
		if ( $updater->getDB()->getType() == 'mysql' ) {
			$updater->addExtensionUpdate( array( 'addTable', 'wikilove_log', $dir . 'WikiLove.sql', true ) );
		}
	}
	return true;
}
