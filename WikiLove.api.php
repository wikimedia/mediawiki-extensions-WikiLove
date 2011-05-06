<?php
class WikiLoveApi extends ApiBase {
	public function execute() {
		global $wgRequest;
		
		$params = $this->extractRequestParams();
		
		$title = Title::newFromText( $params['title'] );
		if ( is_null( $title ) ) {
			$this->dieUsageMsg( array( 'invalidtitle', $params['title'] ) );
		}
		
		$talk = WikiLoveHooks::getUserTalkPage( $title );
		if ( is_null( $talk ) ) {
			$this->dieUsageMsg( array( 'invalidtitle', $params['title'] ) );
		}
		
		if ( stripos( $params['text'], $params['template'] ) === false ) {
			// error
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
		
		$this->saveInDb( $talk, $params['subject'], $params['text'], $params['type'], $params['template'] );
	}

	/**
	 * @param $talk Title
	 * @param $subject
	 * @param $text
	 * @param $type
	 * @param $template
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
			'wl_template' => $template,
			'wl_subject' => $subject,
			'wl_message' => $text,
			'wl_email' => 0,
		);
		$dbw->insert( 'wikilove_log', $values, __METHOD__ );
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
			'template' => array(
				ApiBase::PARAM_TYPE => 'string',
			),
			'type' => array(
				ApiBase::PARAM_TYPE => 'string',
			),
		);
	}

	public function getParamDescription() {
		return array(
			'title' => 'Title of the user or user talk page to send WikiLove to',
			'text' => 'Wikitext to add in the new section',
			'token' => 'Edit token. You can get one of these through prop=info',
			'subject' => 'Subject header of the new section',
			'template' => 'Template used in the wikitext (for statistics)',
			'type' => 'Type of WikiLove (for statistics)',
		);
	}

	public function getDescription() {
		return array(
			'Give WikiLove to another user.',
			"WikiLove is a positive message posted to a user's talk page through a",
			'convenient interface with preset images and templates. For statistical',
			'purposes, the type and template (among the other data) are logged.',
		);
	}

	public function getPossibleErrors() {
		return array_merge( parent::getPossibleErrors(), array(
			array( 'invalidtitle', 'title' ),
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
