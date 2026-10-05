<?php

declare( strict_types=1 );

namespace MediaWiki\Extension\WikiLove;

use MediaWiki\DomainEvent\DomainEvent;
use MediaWiki\Page\PageReference;
use MediaWiki\Revision\RevisionRecord;
use MediaWiki\User\UserIdentity;

/**
 * Domain event emitted after a user has received WikiLove, i.e. after a WikiLove
 * message has been successfully posted to their talk page.
 *
 * The event is always associated with the talk page revision that added the
 * WikiLove message, and the event timestamp is that revision's timestamp.
 */
class UserWikiLoveReceivedEvent extends DomainEvent {
	public const TYPE = 'UserWikiLoveReceived';

	public function __construct(
		private readonly UserIdentity $performer,
		private readonly UserIdentity $recipient,
		private readonly PageReference $talkPage,
		private readonly RevisionRecord $revision,
	) {
		parent::__construct( $revision->getTimestamp() );
		$this->declareEventType( self::TYPE );
	}

	/**
	 * The user who sent the WikiLove.
	 */
	public function getPerformer(): UserIdentity {
		return $this->performer;
	}

	/**
	 * The user who received the WikiLove.
	 */
	public function getRecipient(): UserIdentity {
		return $this->recipient;
	}

	/**
	 * The talk page the WikiLove message was posted to.
	 */
	public function getTalkPage(): PageReference {
		return $this->talkPage;
	}

	/**
	 * The revision that added the WikiLove message.
	 */
	public function getRevision(): RevisionRecord {
		return $this->revision;
	}
}
