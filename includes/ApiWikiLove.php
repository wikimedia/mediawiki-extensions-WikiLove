<?php

namespace MediaWiki\Extension\WikiLove;

use LqtDispatch;
use MediaWiki\Api\ApiBase;
use MediaWiki\Api\ApiMain;
use MediaWiki\Api\ApiMessage;
use MediaWiki\Context\DerivativeContext;
use MediaWiki\Deferred\DeferredUpdates;
use MediaWiki\MediaWikiServices;
use MediaWiki\Parser\ParserFactory;
use MediaWiki\Parser\Sanitizer;
use MediaWiki\Permissions\PermissionManager;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\Request\DerivativeRequest;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use Wikimedia\ParamValidator\ParamValidator;
use Wikimedia\Rdbms\DBQueryError;
use Wikimedia\Rdbms\IConnectionProvider;

class ApiWikiLove extends ApiBase {
	private IConnectionProvider $dbProvider;
	private ParserFactory $parserFactory;
	private PermissionManager $permissionManager;

	public function __construct(
		ApiMain $main,
		string $action,
		IConnectionProvider $dbProvider,
		ParserFactory $parserFactory,
		PermissionManager $permissionManager
	) {
		parent::__construct( $main, $action );
		$this->dbProvider = $dbProvider;
		$this->parserFactory = $parserFactory;
		$this->permissionManager = $permissionManager;
	}

	/** @inheritDoc */
	public function execute() {
		$params = $this->extractRequestParams();

		// In some cases we need the wiki mark-up stripped from the subject
		$strippedSubject = $this->parserFactory->getInstance()->stripSectionName( $params['subject'] );

		$title = Title::newFromText( $params['title'] );
		if ( $title === null ) {
			$this->dieWithError( [ 'nosuchusershort', $params['title'] ], 'nosuchuser' );
		}

		$talk = Hooks::getUserTalkPage( $this->permissionManager, $title, $this->getUser() );
		// getUserTalkPage() returns an ApiMessage on error
		if ( $talk instanceof ApiMessage ) {
			$this->dieWithError( $talk );
		}

		if ( $this->getConfig()->get( 'WikiLoveLogging' ) ) {
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
				'token' => $params['token'],
			];
		// If Flow is installed and enabled, use it.
		} elseif ( $extReg->isLoaded( 'Flow' ) && $talk->hasContentModel( CONTENT_MODEL_FLOW_BOARD ) ) {
			$apiParamArray = [
				'action' => 'flow',
				'submodule' => 'new-topic',
				'page' => $talk->getFullText(),
				'nttopic' => $params['subject'],
				'ntcontent' => $params['text'],
				'token' => $params['token'],
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
				'notminor' => true,
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
			DeferredUpdates::addCallableUpdate( static function () use ( $revId ) {
				MediaWikiServices::getInstance()->getChangeTagsStore()
					->addTags( [ 'wikilove' ], null, $revId );
			} );
		}

		if ( isset( $params['email'] ) ) {
			$this->emailUser( $talk, $strippedSubject, $params['email'], $params['token'] );
		}

		$this->getResult()->addValue( 'redirect', 'pageName', $talk->getPrefixedDBkey() );
		$this->getResult()->addValue( 'redirect', 'fragment',
			Sanitizer::escapeIdForLink( $strippedSubject )
		);
		// note that we cannot use Title::makeTitle here as it doesn't sanitize the fragment
	}

	private function saveInDb( Title $talk, string $subject, string $message, string $type, int $email ): void {
		$dbw = $this->dbProvider->getPrimaryDatabase();
		$receiver = User::newFromName( $talk->getSubjectPage()->getBaseText() );
		if ( $receiver === false || $receiver->isAnon() || $receiver->isTemp() ) {
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

		try {
			$dbw->newInsertQueryBuilder()
				->insertInto( 'wikilove_log' )
				->row( $values )
				->caller( __METHOD__ )
				->execute();
		} catch ( DBQueryError $dbqe ) {
			$this->addWarning( 'Action was not logged' );
		}
	}

	private function emailUser( Title $talk, string $subject, string $text, string $token ): void {
		$context = new DerivativeContext( $this->getContext() );
		$context->setRequest( new DerivativeRequest(
			$this->getRequest(),
			[
				'action' => 'emailuser',
				'target' => User::newFromName( $talk->getSubjectPage()->getBaseText() )->getName(),
				'subject' => $subject,
				'text' => $text,
				'token' => $token,
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
				ParamValidator::PARAM_TYPE => 'string',
				ParamValidator::PARAM_REQUIRED => true,
			],
			'text' => [
				ParamValidator::PARAM_TYPE => 'string',
				ParamValidator::PARAM_REQUIRED => true,
			],
			'message' => [
				ParamValidator::PARAM_TYPE => 'string',
			],
			'token' => [
				ParamValidator::PARAM_TYPE => 'string',
				ParamValidator::PARAM_REQUIRED => true,
			],
			'subject' => [
				ParamValidator::PARAM_TYPE => 'string',
				ParamValidator::PARAM_REQUIRED => true,
			],
			'type' => [
				ParamValidator::PARAM_TYPE => 'string',
			],
			'email' => [
				ParamValidator::PARAM_TYPE => 'string',
			],
			'tags' => [
				ParamValidator::PARAM_TYPE => 'tags',
				ParamValidator::PARAM_ISMULTI => true,
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
