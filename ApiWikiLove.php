<?php
class ApiWikiLove extends ApiBase {
	public function execute() {
		global $wgWikiLoveLogging, $wgParser;

		$params = $this->extractRequestParams();

		// In some cases we need the wiki mark-up stripped from the subject
		$strippedSubject = $wgParser->stripSectionName( $params['subject'] );

		$title = Title::newFromText( $params['title'] );
		if ( is_null( $title ) ) {
			$this->dieWithError( [ 'nosuchusershort', $params['title'] ], 'nosuchuser' );
		}

		$talk = WikiLoveHooks::getUserTalkPage( $title, $this->getUser() );
		// getUserTalkPage() returns an ApiMessage on error
		if ( $talk instanceof ApiMessage ) {
			$this->dieWithError( $talk );
		}

		if ( $wgWikiLoveLogging ) {
			$this->saveInDb( $talk, $params['subject'], $params['message'], $params['type'], isset( $params['email'] ) ? 1 : 0 );
		}

		// Create edit summary
		$summary = $this->msg( 'wikilove-summary', $strippedSubject )->inContentLanguage()
			->text();

		// If LQT is installed and enabled, use it.
		if ( class_exists( 'LqtDispatch' ) && LqtDispatch::isLqtPage( $talk ) ) {
			$apiParamArray = array(
				'action' => 'threadaction',
				'threadaction' => 'newthread',
				'talkpage' => $talk->getFullText(),
				'subject' => $params['subject'],
				'reason' => $summary,
				'text' => $params['text'],
				'token' => $params['token']
			);
		// If Flow is installed and enabled, use it.
		} elseif ( defined( 'CONTENT_MODEL_FLOW_BOARD' ) && $talk->hasContentModel( CONTENT_MODEL_FLOW_BOARD ) ) {
			$apiParamArray = array(
				'action' => 'flow',
				'submodule' => 'new-topic',
				'page' => $talk->getFullText(),
				'nttopic' => $params['subject'],
				'ntcontent' => $params['text'],
				'token' => $params['token']
			);
		} else {
			// Requires MediaWiki 1.19 or later
			$apiParamArray = array(
				'action' => 'edit',
				'title' => $talk->getFullText(),
				'section' => 'new',
				'sectiontitle' => $params['subject'],
				'text' => $params['text'],
				'token' => $params['token'],
				'summary' => $summary,
				'notminor' => true
			);
		}

		$api = new ApiMain(
			new DerivativeRequest(
				$this->getRequest(),
				$apiParamArray,
				true // was posted?
			),
			true // enable write?
		);

		$api->execute();

		$result = $api->getResult()->getResultData();
		if ( isset( $result['edit'] ) && $result['edit']['result'] === "Success" ) {
			$revId = $result['edit']['newrevid'];
			DeferredUpdates::addCallableUpdate( function() use ( $revId ) {
				ChangeTags::addTags( "wikilove", null, $revId );
			} );
		}

		if ( isset( $params['email'] ) ) {
			$this->emailUser( $talk, $strippedSubject, $params['email'], $params['token'] );
		}

		$this->getResult()->addValue( 'redirect', 'pageName', $talk->getPrefixedDBkey() );
		$this->getResult()->addValue( 'redirect', 'fragment', Title::escapeFragmentForURL( $strippedSubject ) );
		// note that we cannot use Title::makeTitle here as it doesn't sanitize the fragment
	}

	/**
	 * @param $talk Title
	 * @param $subject
	 * @param $message
	 * @param $type
	 * @param $email
	 * @return void
	 */
	private function saveInDb( $talk, $subject, $message, $type, $email ) {
		$dbw = wfGetDB( DB_MASTER );
		$receiver = User::newFromName( $talk->getSubjectPage()->getBaseText() );
		if ( $receiver === false || $receiver->isAnon() ) {
			$this->addWarning( 'apiwarn-wikilove-ignoringunregistered' );
			return;
		}

		$user = $this->getUser();
		$values = array(
			'wll_timestamp' => $dbw->timestamp(),
			'wll_sender' => $user->getId(),
			'wll_sender_editcount' => $user->getEditCount(),
			'wll_sender_registration' => $user->getRegistration(),
			'wll_receiver' => $receiver->getId(),
			'wll_receiver_editcount' => $receiver->getEditCount(),
			'wll_receiver_registration' => $receiver->getRegistration(),
			'wll_type' => $type,
			'wll_subject' => $subject,
			'wll_message' => $message,
			'wll_email' => $email,
		);

		try{
			$dbw->insert( 'wikilove_log', $values, __METHOD__ );
		} catch( DBQueryError $dbqe ) {
			$this->addWarning( 'Action was not logged' );
		}
	}

	/**
	 * @param $talk Title
	 * @param $subject string
	 * @param $text string
	 * @param $token string
	 */
	private function emailUser( $talk, $subject, $text, $token ) {
		$context = new DerivativeContext( $this->getContext() );
		$context->setRequest( new DerivativeRequest(
			$this->getRequest(),
			array(
				'action' => 'emailuser',
				'target' => User::newFromName( $talk->getSubjectPage()->getBaseText() )->getName(),
				'subject' => $subject,
				'text' => $text,
				'token' => $token
			),
			true
		) );
		$api = new ApiMain( $context, true );
		$api->execute();
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
			'message' => array(
				ApiBase::PARAM_TYPE => 'string',
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
			'email' => array(
				ApiBase::PARAM_TYPE => 'string',
			),
		);
	}

	public function needsToken() {
		return 'csrf';
	}

	public function isWriteMode() {
		return true;
	}

	/**
	 * @see ApiBase::getExamplesMessages()
	 */
	protected function getExamplesMessages() {
		return array(
			'action=wikilove&title=User:Dummy&text=Love&subject=Hi&token=123ABC'
				=> 'apihelp-wikilove-example-1',
		);
	}
}
