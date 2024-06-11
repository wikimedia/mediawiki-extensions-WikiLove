<?php

namespace MediaWiki\Extension\WikiLove;

use MediaWiki\Installer\DatabaseUpdater;
use MediaWiki\Installer\Hook\LoadExtensionSchemaUpdatesHook;

/**
 * Schema hooks for WikiLove extension
 *
 * @file
 * @ingroup Extensions
 */

class SchemaHooks implements LoadExtensionSchemaUpdatesHook {

	/**
	 * LoadExtensionSchemaUpdates hook
	 *
	 * @param DatabaseUpdater $updater
	 */
	public function onLoadExtensionSchemaUpdates( $updater ) {
		$dbType = $updater->getDB()->getType();
		$path = dirname( __DIR__ ) . '/patches';
		if ( $dbType === 'mysql' ) {
			$updater->addExtensionTable( 'wikilove_log',
				$path . '/tables-generated.sql'
			);
			$updater->modifyExtensionField(
				'wikilove_log',
				'wll_timestamp',
				$path . '/patch-wikilove_log-cleanup.sql'
			);
		} elseif ( $dbType === 'sqlite' ) {
			$updater->addExtensionTable( 'wikilove_log',
				$path . '/sqlite/tables-generated.sql'
			);
			$updater->modifyExtensionField(
				'wikilove_log',
				'wll_timestamp',
				$path . '/sqlite/patch-wikilove_log-cleanup.sql'
			);
		} elseif ( $dbType === 'postgres' ) {
			$updater->addExtensionTable( 'wikilove_log',
				$path . '/postgres/tables-generated.sql'
			);
			$updater->modifyExtensionField(
				'wikilove_log',
				'wll_timestamp',
				$path . '/postgres/patch-wikilove_log-cleanup.sql'
			);
		}
	}

}
