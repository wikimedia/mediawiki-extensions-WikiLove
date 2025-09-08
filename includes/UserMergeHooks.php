<?php

namespace MediaWiki\Extension\WikiLove;

use MediaWiki\Config\Config;
use MediaWiki\Extension\UserMerge\Hooks\AccountFieldsHook;
use Wikimedia\Rdbms\ILoadBalancer;

/**
 * All hooks from the UserMerge extension which is optional to use with this extension.
 *
 * @ingroup Extensions
 */
class UserMergeHooks implements AccountFieldsHook {
	public function __construct(
		private readonly Config $config,
		private readonly ILoadBalancer $loadBalancer,
	) {
	}

	/**
	 * Tables that Extension:UserMerge needs to update
	 */
	public function onUserMergeAccountFields( array &$updateFields ): void {
		$dbr = $this->loadBalancer->getMaintenanceConnectionRef( DB_REPLICA );
		// FIXME HACK: The extension never actually required the 'wikilove_log' table
		// and would suppress db errors if it didn't exist
		if (
			$this->config->get( 'WikiLoveLogging' ) &&
			$dbr->tableExists( 'wikilove_log', __METHOD__ )
		) {
			$updateFields[] = [ 'wikilove_log', 'wll_sender' ];
			$updateFields[] = [ 'wikilove_log', 'wll_receiver' ];
		}
	}

}
