const wikiLove = require( './wikiLove.js' );
const defaultOptions = require( './defaultOptions.js' );

$.wikiLoveOptions = defaultOptions;
$.wikiLove = wikiLove;
$( wikiLove.init );
