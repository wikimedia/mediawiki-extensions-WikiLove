<?php

namespace MediaWiki\Extension\WikiLove\Tests\Integration;

use MediaWiki\Extension\WikiLove\UserWikiLoveReceivedEvent;
use MediaWiki\Tests\Api\ApiTestCase;
use MediaWiki\Tests\ExpectCallbackTrait;
use MediaWiki\Title\Title;
use Wikimedia\Timestamp\TimestampFormat as TS;

/**
 * @covers \MediaWiki\Extension\WikiLove\ApiWikiLove
 * @covers \MediaWiki\Extension\WikiLove\UserWikiLoveReceivedEvent
 * @group API
 * @group Database
 */
class ApiWikiLoveTest extends ApiTestCase {
	use ExpectCallbackTrait;

	private function doWikiLoveRequest( string $title ): array {
		return $this->doApiRequestWithToken(
			[
				'action' => 'wikilove',
				'title' => $title,
				'text' => 'A barnstar for you!',
				'message' => 'Thanks for your work',
				'subject' => 'A barnstar for you!',
				'type' => 'barnstar',
			],
			null,
			$this->getTestSysop()->getUser()
		);
	}

	public function testDispatchesEventOnSuccess() {
		$performer = $this->getTestSysop()->getUser();
		$recipient = $this->getTestUser()->getUser();
		$talkPage = $recipient->getTalkPage();

		$this->expectDomainEvent(
			UserWikiLoveReceivedEvent::TYPE,
			1,
			function ( UserWikiLoveReceivedEvent $event ) use ( $performer, $recipient, $talkPage ): void {
				$this->assertTrue( $performer->equals( $event->getPerformer() ), 'Performer' );
				$this->assertTrue( $recipient->equals( $event->getRecipient() ), 'Recipient' );
				$this->assertTrue( $talkPage->isSamePageAs( $event->getTalkPage() ), 'Talk page' );

				$revision = $this->getServiceContainer()->getRevisionLookup()
					->getRevisionByTitle( $talkPage );
				$this->assertSame( $revision->getId(), $event->getRevision()->getId(), 'Revision ID' );
				$this->assertSame(
					$revision->getTimestamp(),
					$event->getEventTimestamp()->getTimestamp( TS::MW ),
					'Timestamp'
				);
			}
		);

		$this->doWikiLoveRequest( $recipient->getUserPage()->getPrefixedText() );
	}

	public function testNoEventForIPRecipient() {
		$this->expectDomainEvent( UserWikiLoveReceivedEvent::TYPE, 0 );

		$this->doWikiLoveRequest( 'User talk:127.0.0.1' );

		// Sanity check that the message was actually posted
		$this->assertNotNull(
			$this->getServiceContainer()->getRevisionLookup()
				->getRevisionByTitle( Title::makeTitle( NS_USER_TALK, '127.0.0.1' ) )
		);
	}

	public function testNoEventOnError() {
		$this->expectDomainEvent( UserWikiLoveReceivedEvent::TYPE, 0 );
		$this->expectApiErrorCode( 'no-self-wikilove' );

		$this->doWikiLoveRequest( $this->getTestSysop()->getUser()->getUserPage()->getPrefixedText() );
	}
}
