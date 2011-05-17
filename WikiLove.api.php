<?php
class WikiLoveApi extends ApiBase {
	public function execute() {
		global $wgRequest, $wgWikiLoveLogging;
		
		$params = $this->extractRequestParams();
		
		$title = Title::newFromText( $params['title'] );
		if ( is_null( $title ) ) {
			$this->dieUsageMsg( array( 'invalidtitle', $params['title'] ) );
		}
		
		$talk = WikiLoveHooks::getUserTalkPage( $title );
		if ( is_null( $talk ) ) {
			$this->dieUsageMsg( array( 'invalidtitle', $params['title'] ) );
		}
		
		if ( $wgWikiLoveLogging ) {
			$this->saveInDb( $talk, $params['subject'], $params['text'], $params['type'], $params['template'] );
		}
		
		$api = new ApiMain( new FauxRequest( array(
			'action' => 'edit',
			'title'  => $talk->getFullText(),
			'section' => 'new',
			'text' => $params['text'],
			'token'  => $params['token'],
			'summary' => $params['subject'],
			'notminor' => true,
		), false, array( 'wsEditToken' => $wgRequest->getSessionData( 'wsEditToken' ) ) ), true );

		$api->execute();
		
		$result = $api->getResult();
		$data = $result->getData();
		
		$talk->setFragment( '#' . $params['subject'] );
		$this->getResult()->addValue( 'redirect', 'pageName', $talk->getPrefixedDBkey() );
		$this->getResult()->addValue( 'redirect', 'fragment', $talk->getFragmentForURL() );
	}

	/**
	 * @param $talk Title
	 * @param $subject
	 * @param $text
	 * @param $type
	 * @return void
	 */
	private function saveInDb( $talk, $subject, $text, $type, $template ) {
		global $wgUser;
		$dbw = wfGetDB( DB_MASTER );
		$values = array(
			'wl_timestamp' => $dbw->timestamp(),
			'wl_sender_id' => $wgUser->getId(),
			'wl_receiver_id' => User::newFromName( $talk->getSubjectPage()->getBaseText() )->getId(),
			'wl_type' => $type,
			'wl_subject' => $subject,
			'wl_message' => $text,
			'wl_email' => 0,
		);
		try{
			$dbw->insert( 'wikilove_log', $values, __METHOD__ );
		} catch( DBQueryError $dbqe ) {
			$this->dieUsage( 'Warning: action was not logged!', 'nologging' );
			return false;
		}
	}

	public function getAllowedParams() {
		return array(
			'title' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			),
			'text' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			),
			'token' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			),
			'subject' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			),
			'type' => array(
				ApiBase::PARAM_TYPE => 'string',
			),
		);
	}

	public function getParamDescription() {
		return array(
			'title' => 'Title of the user or user talk page to send WikiLove to',
			'text' => 'Raw wikitext to add in the new section',
			'token' => 'Edit token. You can get one of these through prop=info',
			'subject' => 'Subject header of the new section',
			'type' => array( 'Type of WikiLove (for statistics); this corresponds with a type',
			                 'selected in the left menu, and optionally a subtype after that',
			                 '(e.g. "barnstar-normal" or "kitten")',
			                ),
		);
	}

	public function getDescription() {
		return array(
			'Give WikiLove to another user.',
			"WikiLove is a positive message posted to a user's talk page through a",
			'convenient interface with preset or locally defined templates. This action',
			'adds the specified wikitext to a certain talk page. For statistical purposes,',
			'the type and other data are logged.',
		);
	}

	public function getPossibleErrors() {
		return array_merge( parent::getPossibleErrors(), array(
			array( 'invalidtitle', 'title' ),
			array(
				'code' => 'nologging',
				'info' => 'Warning: action was not logged!'
			),
		) );
	}

	public function getExamples() {
		return array(
			'api.php?action=wikiLove&title=User:Dummy&text=Love&subject=Hi&token=%2B\\',
		);
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}
}
