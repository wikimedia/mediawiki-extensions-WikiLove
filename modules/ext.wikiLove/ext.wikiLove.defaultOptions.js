( function( $ ) {
$.wikiLoveOptions = {
	defaultText: '{| style="background-color: $5; border: 1px solid $6;"\n\
|rowspan="2" style="vertical-align: middle; padding: 5px;" | [[$3|$4]]\n\
|style="font-size: x-large; padding: 3px; height: 1.5em;" | \'\'\'$2\'\'\'\n\
|-\n\
|style="vertical-align: middle; padding: 3px;" | $1 ~~~~\n\
|}',
	defaultBackgroundColor: '#fdffe7',
	defaultBorderColor: '#fceb92',
	defaultImageSize: '100px',
	defaultImage: 'Trophy.png',
	
	types: {
		// example type, could be removed later (also no i18n)
		'barnstar': {
			name: 'Barnstars', // name of the type (appears in the types menu)
			select: 'Select a barnstar:', // subtype select label
			subtypes: { // some different subtypes
				// note that when not using subtypes you should use these subtype options
				// for the top-level type
				'original': {
					fields: [ 'message' ], // fields to ask for in form
					option: 'Original Barnstar', // option listed in the select list
					descr: 'This barnstar is given to recognize particularly fine contributions to Wikipedia, to let people know that their hard work is seen and appreciated.', // description
					header: 'A barnstar for you!', // header that appears at the top of the talk page post (optional)
					title: 'The Original Barnstar', // title that appears inside the award box (optional)
					image: 'Original Barnstar Hires.png' // image for the award
				},
				'admins': {
					fields: [ 'message' ],
					option: 'Admin\'s Barnstar',
					descr: 'The Admin\'s Barnstar may be awarded to an administrator who made a particularly difficult decision or performed a tedious but needed admin task.',
					header: 'A barnstar for you!',
					title: 'The Admin\'s Barnstar',
					image: 'Administrator Barnstar Hires.png'
				},
				'antivandalism': {
					fields: [ 'message' ],
					option: 'Anti-Vandalism Barnstar',
					descr: 'The Anti-Vandalism Barnstar may be awarded to those who show great contributions to protecting and reverting attacks of vandalism on Wikipedia.',
					header: 'A barnstar for you!',
					title: 'The Anti-Vandalism Barnstar',
					image: 'Barnstar of Reversion Hires.png'
				},
				'diligence': {
					fields: [ 'message' ],
					option: 'Barnstar of Diligence',
					descr: 'The Barnstar of Diligence may be awarded in recognition of a combination of extraordinary scrutiny, precision and community service.',
					header: 'A barnstar for you!',
					title: 'The Barnstar of Diligence',
					image: 'Barnstar of Diligence Hires.png'
				},
				'diplomacy': {
					fields: [ 'message' ],
					option: 'Barnstar of Diplomacy',
					descr: 'The Barnstar of Diplomacy is awarded to users who have helped to resolve, peacefully, conflicts on Wikipedia.',
					header: 'A barnstar for you!',
					title: 'The Barnstar of Diplomacy',
					image: 'Peace Barnstar Hires.png'
				},
				'goodhumor': {
					fields: [ 'message' ],
					option: 'Barnstar of Good Humor',
					descr: 'The Barnstar of Good Humor may be awarded to Wikipedians who consistently lighten the mood, defuse conflicts, and make Wikipedia a better place to be.',
					header: 'A barnstar for you!',
					title: 'The Barnstar of Good Humor',
					image: 'Barnstar of Reversion Hires.png'
				},
				'brilliant': {
					fields: [ 'message' ],
					option: 'Brilliant Idea Barnstar',
					descr: 'The Brilliant Idea Barnstar may be awarded to a user who figures out an elegant solution to a particularly difficult problem.',
					header: 'A barnstar for you!',
					title: 'The Brilliant Idea Barnstar',
					image: 'Brilliant Idea Barnstar Hires.png'
				},
				'citation': {
					fields: [ 'message' ],
					option: 'Citation Barnstar',
					descr: 'The Citation Barnstar is awarded to users who provide references and in-line citations to previously unsourced articles.',
					header: 'A barnstar for you!',
					title: 'The Citation Barnstar',
					image: 'Citation Barnstar Hires.png'
				},
				'civility': {
					fields: [ 'message' ],
					option: 'Civility Barnstar',
					descr: 'The Civility Barnstar may be awarded to any user who excels at maintaining civility in the midst of contentious situations.',
					header: 'A barnstar for you!',
					title: 'The Civility Barnstar',
					image: 'Civility Barnstar Hires.png'
				},
				'copyeditor': {
					fields: [ 'message' ],
					option: 'Copyeditor\'s Barnstar',
					descr: 'The Copyeditor\'s Barnstar is awarded for excellence in correcting spelling, grammar, punctuation, and style issues.',
					header: 'A barnstar for you!',
					title: 'The Copyeditor\'s Barnstar',
					image: 'Copyeditor Barnstar Hires.png'
				},
				'defender': {
					fields: [ 'message' ],
					option: 'Defender of the Wiki Barnstar',
					descr: 'The Defender of the Wiki may be awarded to those who have gone above and beyond to prevent Wikipedia from being used for fraudulent purposes.',
					header: 'A barnstar for you!',
					title: 'The Defender of the Wiki Barnstar',
					image: 'WikiDefender Barnstar Hires.png'
				},
				'editors': {
					fields: [ 'message' ],
					option: 'Editor\'s Barnstar',
					descr: 'The Editor\'s Barnstar is awarded to individuals who display particularly fine decisions in general editing.',
					header: 'A barnstar for you!',
					title: 'The Editor\'s Barnstar',
					image: 'Editors Barnstar Hires.png'
				},
				'designers': {
					fields: [ 'message' ],
					option: 'Graphic Designer\'s Barnstar',
					descr: 'The Graphic Designer\'s Barnstar may be awarded to those who work tirelessly to provide Wikipedia with free, high-quality graphics.',
					header: 'A barnstar for you!',
					title: 'The Graphic Designer\'s Barnstar',
					image: 'Rosetta Barnstar Hires.png'
				},
				'half': {
					fields: [ 'message' ],
					option: 'Half Barnstar',
					descr: 'The Half Barnstar is awarded for excellence in cooperation, especially for productive editing with someone who holds an opposing viewpoint.',
					header: 'A barnstar for you!',
					title: 'The Half Barnstar',
					image: 'Halfstar Hires.png'
				},
				'minor': {
					fields: [ 'message' ],
					option: 'Minor Barnstar',
					descr: 'Minor edits are often overlooked, but are essential contributions to Wikipedia. The Minor Barnstar is awarded for making minor edits of the utmost quality.',
					header: 'A barnstar for you!',
					title: 'The Minor barnstar',
					image: 'Minor Barnstar Hires.png'
				},
				'antispam': {
					fields: [ 'message' ],
					option: 'No Spam Barnstar',
					descr: 'The Anti-Spam Barnstar is awarded to users who do an exceptional job fighting against spam on Wikipedia.',
					header: 'A barnstar for you!',
					title: 'The No Spam Barnstar',
					image: 'No Spam Barnstar Hires.png'
				},
				'photographers': {
					fields: [ 'message' ],
					option: 'Photographer\'s Barnstar',
					descr: 'The Photographer\'s Barnstar is awarded to those individuals who tirelessly improve the Wikipedia with their photographic skills and contributions.',
					header: 'A barnstar for you!',
					title: 'The Photographer\'s Barnstar',
					image: 'Camera Barnstar Hires.png'
				},
				'kindness': {
					fields: [ 'message' ],
					option: 'Random Acts of Kindness Barnstar',
					descr: 'The Random Acts of Kindness Barnstar may be awarded to those that show a pattern of going the extra mile to be nice, without being asked.',
					header: 'A barnstar for you!',
					title: 'The Random Acts of Kindness Barnstar',
					image: 'Kindness Barnstar Hires.png'
				},
				'reallife': {
					fields: [ 'message' ],
					option: 'Real Life Barnstar',
					descr: 'The Real Life Barnstar is awarded to editors who make contributions both online and offline, by organizing wiki-related real-life events.',
					header: 'A barnstar for you!',
					title: 'The Real Life Barnstar',
					image: 'Real Life Barnstar.jpg'
				},
				'resilient': {
					fields: [ 'message' ],
					option: 'Resilient Barnstar',
					descr: 'The Resilient Barnstar may be given to any editor who learns and improves from criticisms, never letting mistakes impede their growth as a Wikipedian.',
					header: 'A barnstar for you!',
					title: 'The Resilient Barnstar',
					image: 'Resilient Barnstar Hires.png'
				},
				'rosetta': {
					fields: [ 'message' ],
					option: 'Rosetta Barnstar',
					descr: 'The Rosetta Barnstar may be given to any editor who exhibits outstanding translation efforts on Wikipedia.',
					header: 'A barnstar for you!',
					title: 'The Rosetta Barnstar',
					image: 'Rosetta Barnstar Hires.png'
				},
				'special': {
					fields: [ 'message' ],
					option: 'Special Barnstar',
					descr: 'The Special Barnstar may be awarded to a user as a gesture of appreciation when there is no other barnstar which would be appropriate.',
					header: 'A barnstar for you!',
					title: 'The Special Barnstar',
					image: 'Special Barnstar Hires.png'
				},
				'surreal': {
					fields: [ 'message' ],
					option: 'Surreal Barnstar',
					descr: 'The Surreal Barnstar may be awarded to any Wikipedian who adds "special flavor" to the community by acting as a sort of wildcard.',
					header: 'A barnstar for you!',
					title: 'The Surreal Barnstar',
					image: 'Surreal Barnstar Hires.png'
				},
				'teamwork': {
					fields: [ 'message' ],
					option: 'Teamwork Barnstar',
					descr: 'The Teamwork Barnstar may be awarded when several editors work together to improve an article.',
					header: 'A barnstar for you!',
					title: 'The Teamwork Barnstar',
					image: 'Team Barnstar Hires.png'
				},
				'technical': {
					fields: [ 'message' ],
					option: 'Technical Barnstar',
					descr: 'The Technical Barnstar may be awarded to anyone who has enhanced Wikipedia through their technical work (programming, bot building, link repair, etc.).',
					header: 'A barnstar for you!',
					title: 'The Technical Barnstar',
					image: 'Vitruvian Barnstar Hires.png'
				},
				'tireless': {
					fields: [ 'message' ],
					option: 'Tireless Contributor Barnstar',
					descr: 'The Tireless Contributor Barnstar is awarded to especially tireless Wikipedians who contribute an especially large body of work without sacrificing quality.',
					header: 'A barnstar for you!',
					title: 'The Tireless Contributor Barnstar',
					image: 'Tireless Contributor Barnstar Hires.gif'
				},
				'writers': {
					fields: [ 'message' ],
					option: 'Writer\'s Barnstar',
					descr: 'The Writer\'s Barnstar may be awarded to any user who has written a large number of articles or has contributed a large number of edits.',
					header: 'A barnstar for you!',
					title: 'The Writer\'s Barnstar',
					image: 'Writers Barnstar Hires.png'
				}
			},
			icon: mw.config.get( 'wgExtensionAssetsPath' ) + '/WikiLove/modules/ext.wikiLove/images/icons/wikilove-icon-barnstar.png' // icon for left-side menu
		},
		'food': {
			name: 'Food and drink', // name of the type (appears in the types menu)
			select: 'Select food or drink item:', // subtype select label
			text: '{| style="background-color: $5; border: 1px solid $6;"\n\
|style="vertical-align: middle; padding: 5px;" | [[$3|$4]]\n\
|style="vertical-align: middle; padding: 3px;" | $1 ~~~~\n\
|}', // custom text
			subtypes: { // some different subtypes
				// note that when not using subtypes you should use these subtype options
				// for the top-level type
				'baklava': {
					fields: [ 'header', 'message' ], // fields to ask for in form
					option: 'Baklava', // option listed in the select list
					header: 'Some baklava for you!', // header that appears at the top of the talk page post (optional)
					image: 'Baklava - Turkish special, 80-ply.JPEG', // image for the award
					imageSize: '135px' // size to display image
				},
				'beer': {
					fields: [ 'header', 'message' ],
					option: 'Beer',
					header: 'A beer for you!',
					image: 'Export hell seidel steiner.png',
					imageSize: '70px'
				},
				'brownie': {
					fields: [ 'header', 'message' ],
					option: 'Brownie',
					header: 'A brownie for you!',
					image: 'Brownie transparent.png',
					imageSize: '120px'
				},
				'bubble tea': {
					fields: [ 'header', 'message' ],
					option: 'Bubble tea',
					header: 'Some bubble tea for you!',
					image: 'Bubble_Tea.png',
					imageSize: '65px'
				},
				'cheeseburger': {
					fields: [ 'header', 'message' ],
					option: 'Cheeseburger',
					header: 'A cheeseburger for you!',
					image: 'Cheeseburger.png',
					imageSize: '120px'
				},
				'cookie': {
					fields: [ 'header', 'message' ],
					option: 'Cookie',
					header: 'A cookie for you!',
					image: 'Choco_chip_cookie.png',
					imageSize: '120px'
				},
				'coffee': {
					fields: [ 'header', 'message' ],
					option: 'Cup of coffee',
					header: 'A cup of coffee for you!',
					image: 'A small cup of coffee.JPG',
					imageSize: '120px'
				},
				'tea': {
					fields: [ 'header', 'message' ],
					option: 'Cup of tea',
					header: 'A cup of tea for you!',
					image: 'Meissen-teacup pinkrose01.jpg',
					imageSize: '120px'
				},
				'cupcake': {
					fields: [ 'header', 'message' ],
					option: 'Cupcake',
					header: 'A cupcake for you!',
					image: 'Choco-Nut Bake with Meringue Top cropped.jpg',
					imageSize: '120px'
				},
				'pie': {
					fields: [ 'header', 'message' ],
					option: 'Pie',
					header: 'A pie for you!',
					image: 'A very beautiful Nectarine Pie.jpg',
					imageSize: '120px'
				},
				'stroopwafels': {
					fields: [ 'header', 'message' ],
					option: 'Stroopwafels',
					header: 'Some stroopwafels for you!',
					image: 'Gaufre biscuit.jpg',
					imageSize: '135px'
				}
			},
			icon: mw.config.get( 'wgExtensionAssetsPath' ) + '/WikiLove/modules/ext.wikiLove/images/icons/wikilove-icon-food.png'
		},
		'kitten': {
			name: 'Kittens',
			fields: [ 'header', 'message' ],
			header: 'A kitten for you!',
			text: '[[$3|left|150px]]\n$1\n\n~~~~\n<br style="clear: both"/>', // $3 is the image filename
			gallery: {
				imageList: [ 'Cucciolo gatto Bibo.jpg', 'Kitten (06) by Ron.jpg', 'Kitten-stare.jpg', 'Red Kitten 01.jpg', 'Kitten in a helmet.jpg', 'Cute grey kitten.jpg' ],
				width: 145,
				height: 150,
				number: 3
			},
			icon: mw.config.get( 'wgExtensionAssetsPath' ) + '/WikiLove/modules/ext.wikiLove/images/icons/wikilove-icon-kitten.png'
		},
		// default type, nice to leave this one in place when adding other types
		'makeyourown': {
			name: mw.msg( 'wikilove-type-makeyourown' ),
			fields: [ 'header', 'title', 'image', 'message' ],
			icon: mw.config.get( 'wgExtensionAssetsPath' ) + '/WikiLove/modules/ext.wikiLove/images/icons/wikilove-icon-create.png'
		}
	}
};

} )( jQuery );
