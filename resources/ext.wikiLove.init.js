$.when(
	mw.loader.using( 'ext.wikiLove.local' ),
	$.ready,
).then( $.wikiLove.init );
