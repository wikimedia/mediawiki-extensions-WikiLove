<?php
class ApiWikiLove extends ApiBase {
	public function execute() {
		global $wgWikiLoveLogging, $wgParser;

		$params = $this->extractRequestParams();

		// In some cases we need the wiki mark-up stripped from the subject
		$strippedSubject = $wgParser->stripSectionName( $params['subject'] );

		$title = Title::newFromText( $params['title'] );
		if ( is_null( $title ) ) {
			$this->dieUsageMsg( array( 'invaliduser', $params['title'] ) );
		}

		$talk = WikiLoveHooks::getUserTalkPage( $title, $this->getUser() );
		// getUserTalkPage() returns a string on error
		if ( is_string( $talk ) ) {
			$this->dieUsage( $talk, 'nowikilove' );
		}

		if ( $wgWikiLoveLogging ) {
			$this->saveInDb( $talk, $params['subject'], $params['message'], $params['type'], isset( $params['email'] ) ? 1 : 0 );
		}

		// If LQT is installed and enabled, use it.
		$summary = $this->msg( 'wikilove-summary', $strippedSubject )->inContentLanguage()
			->text();
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

		if ( defined( 'ApiResult::META_CONTENT' ) ) {
			$result = $api->getResult()->getResultData();
		} else {
			$result = $api->getResult()->getData();
		}
		if ( isset( $result['edit'] ) && $result['edit']['result'] === "Success" ) {
				$revId = $result['edit']['newrevid'];
				ChangeTags::addTags( "wikilove", null, $revId );
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
		wfProfileIn( __METHOD__ );

		$dbw = wfGetDB( DB_MASTER );
		$receiver = User::newFromName( $talk->getSubjectPage()->getBaseText() );
		if ( $receiver === false || $receiver->isAnon() ) {
			$this->setWarning( 'Not logging unregistered recipients' );
			wfProfileOut( __METHOD__ );
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
			$this->setWarning( 'Action was not logged' );
		}
		wfProfileOut( __METHOD__ );
	}

	/**
	 * @param $talk Title
	 * @param $subject string
	 * @param $text string
	 * @param $token string
	 */
	private function emailUser( $talk, $subject, $text, $token ) {
		wfProfileIn( __METHOD__ );
		$api = new ApiMain( new FauxRequest(
			array(
				'action' => 'emailuser',
				'target' => User::newFromName( $talk->getSubjectPage()->getBaseText() )->getName(),
				'subject' => $subject,
				'text' => $text,
				'token' => $token
			),
			false,
			array( 'wsEditToken' => $this->getRequest()->getSessionData( 'wsEditToken' ) )
		), true );

		try {
			$api->execute();
		} catch( DBQueryError $dbqe ) {
			$this->setWarning( 'Email was not sent' );
		}
		wfProfileOut( __METHOD__ );
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

	/**
	 * @deprecated since MediaWiki core 1.25
	 */
	public function getParamDescription() {
		return array(
			'title' => 'Full pagename of the user page or user talk page of the user to send WikiLove to',
			'text' => 'Raw wikitext to add in the new section',
			'message' => 'Actual message the user has entered, for logging purposes',
			'token' => array( 'Edit token. You can get one of these through the API with prop=info,',
				'or when on a MediaWiki page through mw.user.tokens',
			),
			'subject' => 'Subject header of the new section',
			'email' => array( 'Content of the optional email message to send to the user.',
				'A warning will be returned if the user cannot be emailed. WikiLove will be sent to user talk page either way.',
			),
			'type' => array( 'Type of WikiLove (for statistics); this corresponds with a type',
				'selected in the left menu, and optionally a subtype after that',
				'(e.g. "barnstar-normal" or "kitten")',
			),
		);
	}

	/**
	 * @deprecated since MediaWiki core 1.25
	 */
	public function getDescription() {
		return array(
			'Give WikiLove to another user.',
			"WikiLove is a positive message posted to a user's talk page through a",
			'convenient interface with preset or locally defined templates. This action',
			'adds the specified wikitext to a certain talk page. For statistical purposes,',
			'the type and other data are logged.',
		);
	}

	/**
	 * @deprecated since MediaWiki core 1.25
	 */
	public function getExamples() {
		return array(
			'api.php?action=wikilove&title=User:Dummy&text=Love&subject=Hi&token=%2B\\',
		);
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
