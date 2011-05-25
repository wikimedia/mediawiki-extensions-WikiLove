( function( $ ) {
$.wikiLove.optionsHook = function() { return {
	defaultText: '{| style="background-color: $5; border: 1px solid $6;"\n\
|rowspan="2" style="vertical-align: middle; padding: 5px;" | [[Image:$3|$4]]\n\
|style="font-size: x-large; padding: 3px; height: 1.5em;" | \'\'\'$2\'\'\'\n\
|-\n\
|style="vertical-align: middle; padding: 3px;" | $1 ~~~~\n\
|}',
	defaultBackgroundColor: '#fdffe7',
	defaultBorderColor: '#fceb92',
	defaultImageSize: '100px',
	
	types: {
		// example type, could be removed later (also no i18n)
		'barnstar': {
			name: 'Barnstar', // name of the type (appears in the types menu)
			select: 'Select a barnstar:', // subtype select label
			subtypes: { // some different subtypes
				// note that when not using subtypes you should use these subtype options
				// for the top-level type
				'original': {
					fields: [ 'notify' ], // fields to ask for in form
					option: 'Original barnstar', // option listed in the select list
					descr: 'This barnstar is given to recognize particularly fine contributions to Wikipedia, to let people know that their hard work is seen and appreciated.', // description
					header: 'A barnstar for you!', // header that appears at the top of the talk page post (optional)
					title: 'The Original Barnstar', // title that appears inside the award box (optional)
					image: 'Original Barnstar Hires.png', // image for the award
					mail: 'Hello $7!\n\nI just awarded you a barnstar.' // message to use in email notification; $7 is replaced by the recipient's username
				},
				'editors': {
					fields: [ 'notify' ],
					option: 'Editor\'s barnstar',
					descr: 'The Editor\'s Barnstar is awarded to individuals who display particularly fine decisions in general editing.',
					header: 'A barnstar for you!',
					title: 'The Editor\'s Barnstar',
					image: 'Editors Barnstar Hires.png',
					mail: 'Hello $7!\n\nI just awarded you a barnstar.'
				},
				'tireless': {
					fields: [ 'title', 'notify' ],
					option: 'Tireless contributor barnstar',
					descr: 'The Tireless Contributor Barnstar is awarded to especially tireless Wikipedians who contribute an especially large body of work without sacrificing quality.',
					header: 'A barnstar for you!',
					title: 'Tireless contributor barnstar',
					image: 'Tireless Contributor Barnstar Hires.gif',
					mail: 'Hello $7!\n\nI just awarded you a barnstar.'
				}
			},
			icon: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/extensions/WikiLove/modules/ext.wikiLove/images/icons/wikilove-icon-barnstar.png' // icon for left-side menu
		},
		'beer': {
			name: 'Beer',
			fields: [ 'header' ],
			header: 'A beer for you!',
			text: '[[$3|left|150px]]\n$1\n\n~~~~\n<br style="clear: both"/>', // custom text
			gallery: {
				// right now we can only query the local wiki (not e.g. commons)
				category: 'Category:Beer',
				total: 100, // total number of pictures to retrieve, and to randomise
				num: 3, // number of pictures to show from the randomised set
				width: 145 // width of each picture in pixels in the interface (not in the template)
			},
			icon: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/extensions/WikiLove/modules/ext.wikiLove/images/icons/wikilove-icon-beer.png' // icon for left-side menu
		},
		'kitten': {
			name: 'Kitten',
			fields: [ 'header' ],
			header: 'A kitten for you!',
			text: '[[$3|left|150px]]\n$1\n\n~~~~\n<br style="clear: both"/>', // $3 is the image filename
			gallery: {
				imageList: ['File:Cucciolo gatto Bibo.jpg','File:Kitten (06) by Ron.jpg','File:Kitten-stare.jpg'],
				width: 145
			},
			icon: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/extensions/WikiLove/modules/ext.wikiLove/images/icons/wikilove-icon-kitten.png' // icon for left-side menu
		},
		// default type, nice to leave this one in place when adding other types
		'makeyourown': {
			name: mw.msg( 'wikilove-type-makeyourown' ),
			fields: [ 'header', 'title', 'image', 'notify' ],
			imageSize: '150px'
		}
	}
}; };
} )( jQuery );
