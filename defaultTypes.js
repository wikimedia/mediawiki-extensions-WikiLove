$.wikiLove.types = {
	// example type, could be removed later (also no i18n)
	'barnstar': {
		name: 'Barnstar', // name of the type (appears in the types menu)
		fields: [ 'header', 'title', 'image' ], // fields to ask for in form if not specified in config
		select: 'Select a barnstar:', // subtype select label
		subtypes: { // some different subtypes
			// note that when not using subtypes you should use these subtype options
			// for the top-level type
			'original': {
				option: 'Original barnstar', // option listed in the select list
				descr: 'This barnstar is given to recognize particularly fine contributions to Wikipedia, to let people know that their hard work is seen and appreciated.', // description
				header: mw.msg( 'wikilove-barnstar-header' ), // header that appears at the top of the talk page post (optional)
				title: 'The Original Barnstar', // title that appears inside the award box (optional)
				image: 'Original Barnstar Hires.png', // image for the award
				mail: 'Hello $7!\n\nI just awarded you a barnstar.' // message to use in email notification; $7 is replaced by the recipient's username
			},
			'editors': {
				option: 'Editor\'s barnstar',
				descr: 'The Editor\'s Barnstar is awarded to individuals who display particularly fine decisions in general editing.',
				header: mw.msg( 'wikilove-barnstar-header' ),
				title: 'The Editor\'s Barnstar',
				image: 'Editors Barnstar Hires.png',
				mail: 'Hello $7!\n\nI just awarded you a barnstar.'
			},
			'tireless': {
				option: 'Tireless contributor barnstar',
				descr: 'The Tireless Contributor Barnstar is awarded to especially tireless Wikipedians who contribute an especially large body of work without sacrificing quality.',
				header: mw.msg( 'wikilove-barnstar-header' ),
				title: 'The Editor\'s Barnstar',
				image: 'Tireless Contributor Barnstar Hires.gif',
				mail: 'Hello $7!\n\nI just awarded you a barnstar.'
			}
		},
		showNotify: true, // add email notices as an option for each award of this type
		icon: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/extensions/WikiLove/images/icons/wikilove-icon-barnstar.png' // icon for left-side menu
	},
	'cats': {
		name: 'Cat',
		fields: [ 'header' ],
		header: 'A kitten for you!',
		text: '[[$3|left|150px]]\n$1\n\n~~~~\n<br style="clear: both"/>', // $3 is the image filename
		gallery: {
			// right now we can only query the local wiki (not e.g. commons)
			category: 'Category:Cats',
			total: 100, // total number of pictures to retrieve, and to randomise
			num: 3, // number of pictures to show from the randomised set
			width: 145 // width of each picture in pixels in the interface (not in the template)
		}
	},
	// default type, nice to leave this one in place when adding other types
	'makeyourown': {
		name: mw.msg( 'wikilove-type-makeyourown' ),
		fields: [ 'header', 'title', 'image' ],
		imageSize: '150px'
	}
}