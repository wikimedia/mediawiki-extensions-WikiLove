/*
 * Init function which is called upon page load. Binds the WikiLove icon to opening the dialog.
 */

( function( $ ) {
$.wikiLove.init = function() {
	$.wikiLove.options = $.wikiLove.optionsHook();
	$( '#ca-wikilove a' ).click( function( e ) {
		$.wikiLove.openDialog();
		e.preventDefault();
	});
}

$( document ).ready( $.wikiLove.init );
} )( jQuery );
