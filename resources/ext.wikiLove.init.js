( function ( $, mw ) {
	$.when(
		mw.loader.using( 'ext.wikiLove.local' ),
		$.ready
	).done( $.wikiLove.init );
}( jQuery, mediaWiki ) );
