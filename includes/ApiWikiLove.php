<?php

use Wikimedia\Rdbms\DBQueryError;
use MediaWiki\MediaWikiServices;

class ApiWikiLove extends ApiBase {
	/** @inheritDoc */
	public function execute() {
		global $wgWikiLoveLogging;

		$params = $this->extractRequestParams();

		// In some cases we need the wiki mark-up stripped from the subject
		$strippedSubject = MediaWikiServices::getInstance()->getParser()
			->stripSectionName( $params['subject'] );

		$title = Title::newFromText( $params['title'] );
		if ( is_null( $title ) ) {
			$this->dieWithError( [ 'nosuchusershort', $params['title'] ], 'nosuchuser' );
		}

		// @phan-suppress-next-line PhanTypeMismatchArgumentNullable T240141
		$talk = WikiLoveHooks::getUserTalkPage( $title, $this->getUser() );
		// getUserTalkPage() returns an ApiMessage on error
		if ( $talk instanceof ApiMessage ) {
			$this->dieWithError( $talk );
		}

		if ( $wgWikiLoveLogging ) {
			$this->saveInDb( $talk, $params['subject'], $params['message'], $params['type'],
				isset( $params['email'] ) ? 1 : 0 );
		}

		// Create edit summary
		$summary = $this->msg( 'wikilove-summary', $strippedSubject )->inContentLanguage()
			->text();

		$extReg = ExtensionRegistry::getInstance();

		// If LQT is installed and enabled, use it.
		if ( $extReg->isLoaded( 'Liquid Threads' ) && LqtDispatch::isLqtPage( $talk ) ) {
			$apiParamArray = [
				'action' => 'threadaction',
				'threadaction' => 'newthread',
				'talkpage' => $talk->getFullText(),
				'subject' => $params['subject'],
				'reason' => $summary,
				'text' => $params['text'],
				'token' => $params['token']
			];
		// If Flow is installed and enabled, use it.
		} elseif ( $extReg->isLoaded( 'Flow' ) && $talk->hasContentModel( CONTENT_MODEL_FLOW_BOARD ) ) {
			$apiParamArray = [
				'action' => 'flow',
				'submodule' => 'new-topic',
				'page' => $talk->getFullText(),
				'nttopic' => $params['subject'],
				'ntcontent' => $params['text'],
				'token' => $params['token']
			];
		} else {
			// Requires MediaWiki 1.19 or later
			$apiParamArray = [
				'action' => 'edit',
				'title' => $talk->getFullText(),
				'section' => 'new',
				'sectiontitle' => $params['subject'],
				'text' => $params['text'],
				'token' => $params['token'],
				'summary' => $summary,
				'tags' => implode( '|', $params['tags'] ?? [] ),
				'notminor' => true
			];
		}

		$api = new ApiMain(
			new DerivativeRequest(
				$this->getRequest(),
				$apiParamArray,
				/* $wasPosted */ true
			),
			/* $enableWrite */ true
		);

		$api->execute();

		$result = $api->getResult()->getResultData();
		if ( isset( $result['edit'] ) && $result['edit']['result'] === "Success" ) {
			$revId = $result['edit']['newrevid'];
			DeferredUpdates::addCallableUpdate( function () use ( $revId ) {
				ChangeTags::addTags( "wikilove", null, $revId );
			} );
		}

		if ( isset( $params['email'] ) ) {
			$this->emailUser( $talk, $strippedSubject, $params['email'], $params['token'] );
		}

		$this->getResult()->addValue( 'redirect', 'pageName', $talk->getPrefixedDBkey() );
		$this->getResult()->addValue( 'redirect', 'fragment',
			Sanitizer::escapeIdForLink( $strippedSubject ) );
		// note that we cannot use Title::makeTitle here as it doesn't sanitize the fragment
	}

	/**
	 * @param Title $talk
	 * @param string $subject
	 * @param string $message
	 * @param string $type
	 * @param int $email
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
		$values = [
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
		];

		try{
			$dbw->insert( 'wikilove_log', $values, __METHOD__ );
		} catch ( DBQueryError $dbqe ) {
			$this->addWarning( 'Action was not logged' );
		}
	}

	/**
	 * @param Title $talk
	 * @param string $subject
	 * @param string $text
	 * @param string $token
	 */
	private function emailUser( $talk, $subject, $text, $token ) {
		$context = new DerivativeContext( $this->getContext() );
		$context->setRequest( new DerivativeRequest(
			$this->getRequest(),
			[
				'action' => 'emailuser',
				'target' => User::newFromName( $talk->getSubjectPage()->getBaseText() )->getName(),
				'subject' => $subject,
				'text' => $text,
				'token' => $token
			],
			true
		) );
		$api = new ApiMain( $context, true );
		$api->execute();
	}

	/** @inheritDoc */
	public function getAllowedParams() {
		return [
			'title' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'text' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'message' => [
				ApiBase::PARAM_TYPE => 'string',
			],
			'token' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'subject' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'type' => [
				ApiBase::PARAM_TYPE => 'string',
			],
			'email' => [
				ApiBase::PARAM_TYPE => 'string',
			],
			'tags' => [
				self::PARAM_TYPE => 'tags',
				self::PARAM_ISMULTI => true,
			],
		];
	}

	/** @inheritDoc */
	public function needsToken() {
		return 'csrf';
	}

	/** @inheritDoc */
	public function isWriteMode() {
		return true;
	}

	/** @inheritDoc */
	protected function getExamplesMessages() {
		return [
			'action=wikilove&title=User:Dummy&text=Love&subject=Hi&token=123ABC'
				=> 'apihelp-wikilove-example-1',
		];
	}
}
