<?php

declare( strict_types=1 );

namespace MediaWiki\Extension\WikiLove;

interface UserWikiLoveReceivedListener {
	public function handleUserWikiLoveReceivedEvent( UserWikiLoveReceivedEvent $event ): void;
}
