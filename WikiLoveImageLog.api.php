<?php

/**
 * This API is for logging each time a user attempts to use a custom image via the Make your own
 * feature. This is basically just to see if users can grok the concept. Once usage analysis is 
 * complete, this API can be deleted.
 */
class WikiLoveImageLogApi extends ApiBase {
	public function execute() {
		global $wgRequest, $wgWikiLoveLogging, $wgParser;
		
		$params = $this->extractRequestParams();
		
		if ( $wgWikiLoveLogging ) {
			$this->saveInDb( $params['image'], $params['success'] );
		}
	}

	/**
	 * @param $user User ID
	 * @param $image string
	 * @param $success integer
	 */
	private function saveInDb( $image, $success ) {
		global $wgUser;
		$dbw = wfGetDB( DB_MASTER );
		
		$values = array(
			'wlil_timestamp' => $dbw->timestamp(),
			'wlil_user_id' => $wgUser->getId(),
			'wlil_image' => $image,
			'wlil_success' => $success,
		);
				
		try{
			$dbw->insert( 'wikilove_image_log', $values, __METHOD__ );
		} catch( DBQueryError $dbqe ) {
			$this->setWarning( 'Action was not logged' );
		}
	}

	public function getDescription() {
		return array(
			'This API is for logging each time a user attempts to use a custom image via WikiLove.',
		);
	}
	
	public function getAllowedParams() {
		return array(
			'image' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			),
			'success' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => true,
			)
		);
	}
	
	public function getVersion() {
		return __CLASS__ . ': $Id: WikiLoveImageLog.api.php XXXXX 2011-06-28 15:32:13Z kaldari $';
	}
}
