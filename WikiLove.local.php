<?php
/*
 * Custom ResourceLoader module that loads a custom WikiLove.js per-wiki.
 */
class WikiLoveLocal extends ResourceLoaderWikiModule {
	protected function getPages( ResourceLoaderContext $context ) {
		return array(
			'MediaWiki:WikiLove.js'      => array( 'type' => 'script' ),
		);
	}
	
	public function getDependencies() {
		return array(
			'ext.wikiLove.startup',
		);
	}
	
	public function getMessages() {
		global $wgWikiLoveOptionMessages;
		return $wgWikiLoveOptionMessages;
	}
}
