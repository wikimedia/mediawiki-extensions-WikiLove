//See http://www.mediawiki.org/wiki/Extension:WikiLove for basic documentation on configuration.
//<nowiki>
( function( $ ) {
$.wikiLoveOptions = {
	defaultText: '{| style="background-color: $5; border: 1px solid $6;"\n\
|rowspan="2" style="vertical-align: middle; padding: 5px;" | [[$3|$4]]\n\
|style="font-size: x-large; padding: 3px 3px 0 3px; height: 1.5em;" | \'\'\'$2\'\'\'\n\
|-\n\
|style="vertical-align: middle; padding: 3px;" | $1 ~~~~\n\
|}',
	defaultBackgroundColor: '#fdffe7',
	defaultBorderColor: '#fceb92',
	defaultImageSize: '100px',
	defaultImage: 'Trophy.png',
	
	types: {
		// example type, could be removed later
		'barnstar': {
			name: mw.msg( 'wikilove-type-barnstars' ), // name of the type (appears in the types menu)
			select: mw.msg( 'wikilove-barnstar-select' ), // subtype select label
			subtypes: { // some different subtypes
				// note that when not using subtypes you should use these subtype options
				// for the top-level type
				'original': {
					fields: [ 'message' ], // fields to ask for in form
					option: mw.msg( 'wikilove-barnstar-admin-' ), // option listed in the select list
					descr: mw.msg( 'wikilove-barnstar-admin-' ), // description
					header: mw.msg( 'wikilove-barnstar-header' ), // header that appears at the top of the talk page post (optional)
					title: mw.msg( 'wikilove-barnstar-admin-' ), // title that appears inside the award box (optional)
					image: 'Original Barnstar Hires.png' // image for the award
				},
				'admins': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-admins-option' ),
					descr: mw.msg( 'wikilove-barnstar-admins-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-admins-title' ),
					image: 'Administrator Barnstar Hires.png'
				},
				'antivandalism': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-antivandalism-option' ),
					descr: mw.msg( 'wikilove-barnstar-antivandalism-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-antivandalism-title' ),
					image: 'Barnstar of Reversion Hires.png'
				},
				'diligence': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-diligence-option' ),
					descr: mw.msg( 'wikilove-barnstar-diligence-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-diligence-title' ),
					image: 'Barnstar of Diligence Hires.png'
				},
				'diplomacy': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-diplomacy-option' ),
					descr: mw.msg( 'wikilove-barnstar-diplomacy-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-diplomacy-title' ),
					image: 'Peace Barnstar Hires.png'
				},
				'goodhumor': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-goodhumor-option' ),
					descr: mw.msg( 'wikilove-barnstar-goodhumor-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-goodhumor-title' ),
					image: 'Barnstar of Humour Hires.png'
				},
				'brilliant': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-brilliant-option' ),
					descr: mw.msg( 'wikilove-barnstar-brilliant-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-brilliant-title' ),
					image: 'Brilliant Idea Barnstar Hires.png'
				},
				'citation': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-citation-option' ),
					descr: mw.msg( 'wikilove-barnstar-citation-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-citation-title' ),
					image: 'Citation Barnstar Hires.png'
				},
				'civility': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-civility-option' ),
					descr: mw.msg( 'wikilove-barnstar-civility-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-civility-title' ),
					image: 'Civility Barnstar Hires.png'
				},
				'copyeditor': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-copyeditor-option' ),
					descr: mw.msg( 'wikilove-barnstar-copyeditor-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-copyeditor-title' ),
					image: 'Copyeditor Barnstar Hires.png'
				},
				'defender': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-defender-option' ),
					descr: mw.msg( 'wikilove-barnstar-defender-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-defender-title' ),
					image: 'WikiDefender Barnstar Hires.png'
				},
				'editors': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-editors-option' ),
					descr: mw.msg( 'wikilove-barnstar-editors-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-editors-title' ),
					image: 'Editors Barnstar Hires.png'
				},
				'designers': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-designers-option' ),
					descr: mw.msg( 'wikilove-barnstar-designers-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-designers-title' ),
					image: 'Graphic Designer Barnstar Hires.png'
				},
				'half': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-half-option' ),
					descr: mw.msg( 'wikilove-barnstar-half-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-half-title' ),
					image: 'Halfstar Hires.png',
					imageSize: '60px'
				},
				'minor': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-minor-option' ),
					descr: mw.msg( 'wikilove-barnstar-minor-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-minor-title' ),
					image: 'Minor Barnstar Hires.png'
				},
				'antispam': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-antispam-option' ),
					descr: mw.msg( 'wikilove-barnstar-antispam-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-antispam-title' ),
					image: 'No Spam Barnstar Hires.png'
				},
				'photographers': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-photographers-option' ),
					descr: mw.msg( 'wikilove-barnstar-photographers-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-photographers-title' ),
					image: 'Camera Barnstar Hires.png'
				},
				'kindness': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-kindness-option' ),
					descr: mw.msg( 'wikilove-barnstar-kindness-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-kindness-title' ),
					image: 'Kindness Barnstar Hires.png'
				},
				'reallife': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-reallife-option' ),
					descr: mw.msg( 'wikilove-barnstar-reallife-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-reallife-title' ),
					image: 'Real Life Barnstar.jpg'
				},
				'resilient': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-resilient-option' ),
					descr: mw.msg( 'wikilove-barnstar-resilient-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-resilient-title' ),
					image: 'Resilient Barnstar Hires.png'
				},
				'rosetta': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-rosetta-option' ),
					descr: mw.msg( 'wikilove-barnstar-rosetta-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-rosetta-title' ),
					image: 'Rosetta Barnstar Hires.png'
				},
				'special': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-special-option' ),
					descr: mw.msg( 'wikilove-barnstar-special-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-special-title' ),
					image: 'Special Barnstar Hires.png'
				},
				'surreal': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-surreal-option' ),
					descr: mw.msg( 'wikilove-barnstar-surreal-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-surreal-title' ),
					image: 'Surreal Barnstar Hires.png'
				},
				'teamwork': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-teamwork-option' ),
					descr: mw.msg( 'wikilove-barnstar-teamwork-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-teamwork-title' ),
					image: 'Team Barnstar Hires.png'
				},
				'technical': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-technical-option' ),
					descr: mw.msg( 'wikilove-barnstar-technical-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-technical-title' ),
					image: 'Vitruvian Barnstar Hires.png'
				},
				'tireless': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-tireless-option' ),
					descr: mw.msg( 'wikilove-barnstar-tireless-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-tireless-title' ),
					image: 'Tireless Contributor Barnstar Hires.gif'
				},
				'writers': {
					fields: [ 'message' ],
					option: mw.msg( 'wikilove-barnstar-writers-option' ),
					descr: mw.msg( 'wikilove-barnstar-writers-desc' ),
					header: mw.msg( 'wikilove-barnstar-header' ),
					title: mw.msg( 'wikilove-barnstar-writers-title' ),
					image: 'Writers Barnstar Hires.png'
				}
			},
			icon: mw.config.get( 'wgExtensionAssetsPath' ) + '/WikiLove/modules/ext.wikiLove/images/icons/wikilove-icon-barnstar.png' // icon for left-side menu
		},
		'food': {
			name: mw.msg( 'wikilove-type-food' ), // name of the type (appears in the types menu)
			select: mw.msg( 'wikilove-food-select' ), // subtype select label
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
					descr: 'Baklava is a rich, sweet pastry made of layers of filo pastry filled with chopped nuts and sweetened with syrup or honey.',
					header: 'Some baklava for you!', // header that appears at the top of the talk page post (optional)
					image: 'Baklava - Turkish special, 80-ply.JPEG', // image for the award
					imageSize: '135px' // size to display image
				},
				'beer': {
					fields: [ 'header', 'message' ],
					option: 'Beer',
					descr: 'Beer is the world\'s most widely consumed and probably oldest alcoholic beverage. It is the third most popular drink after water and tea.',
					header: 'A beer for you!',
					image: 'Export hell seidel steiner.png',
					imageSize: '70px'
				},
				'brownie': {
					fields: [ 'header', 'message' ],
					option: 'Brownie',
					descr: 'A brownie is a flat, baked treat made of dense, rich chocolate cake. They are usually served as squares or bars.',
					header: 'A brownie for you!',
					image: 'Brownie transparent.png',
					imageSize: '120px'
				},
				'bubble tea': {
					fields: [ 'header', 'message' ],
					option: 'Bubble tea',
					descr: 'Bubble tea is a tea or juice beverage containing small chewy balls made of tapioca starch or jelly. First invented in Taiwan, it is now popular in many areas of the world.',
					header: 'Some bubble tea for you!',
					image: 'Bubble_Tea.png',
					imageSize: '65px'
				},
				'cheeseburger': {
					fields: [ 'header', 'message' ],
					option: 'Cheeseburger',
					descr: 'A staple of diners and fast-food restaurants, cheeseburgers were first popularized in the United States during the 1920s and 30s.',
					header: 'A cheeseburger for you!',
					image: 'Cheeseburger.png',
					imageSize: '120px'
				},
				'cookie': {
					fields: [ 'header', 'message' ],
					option: 'Cookie',
					descr: 'Cookies (known as biscuits in the UK) are small baked treats that come in a wide array of flavors, shapes, and sizes.',
					header: 'A cookie for you!',
					image: 'Choco_chip_cookie.png',
					imageSize: '120px'
				},
				'coffee': {
					fields: [ 'header', 'message' ],
					option: 'Cup of coffee',
					descr: 'Appreciated the world over, coffee is known for its energizing effect on people.',
					header: 'A cup of coffee for you!',
					image: 'A small cup of coffee.JPG',
					imageSize: '120px'
				},
				'tea': {
					fields: [ 'header', 'message' ],
					option: 'Cup of tea',
					descr: 'After water, tea is the most widely consumed beverage in the world. It can be enjoyed hot or cold, with milk or sugar.',
					header: 'A cup of tea for you!',
					image: 'Meissen-teacup pinkrose01.jpg',
					imageSize: '120px'
				},
				'cupcake': {
					fields: [ 'header', 'message' ],
					option: 'Cupcake',
					descr: 'A cupcake is a small cake designed to serve one person. They are often served with frosting and sprinkles on top.',
					header: 'A cupcake for you!',
					image: 'Choco-Nut Bake with Meringue Top cropped.jpg',
					imageSize: '120px'
				},
				'pie': {
					fields: [ 'header', 'message' ],
					option: 'Pie',
					descr: 'Pies can be filled with a wide variety of sweet or savory ingredients. Popular varieties include apple, cherry, peach, chocolate, and pecan.',
					header: 'A pie for you!',
					image: 'A very beautiful Nectarine Pie.jpg',
					imageSize: '120px'
				},
				'strawberries': {
					fields: [ 'header', 'message' ],
					option: 'Strawberries',
					descr: 'The strawberry fruit (which is not actually a berry) is widely appreciated for its characteristic aroma, bright red color, juicy texture, and sweetness.',
					header: 'A bowl of strawberries for you!',
					image: 'Erdbeerteller01.jpg',
					imageSize: '120px'
				},
				'stroopwafels': {
					fields: [ 'header', 'message' ],
					option: 'Stroopwafels',
					descr: 'A stroopwafel is a Dutch snack made from two thin layers of baked batter with a caramel-like syrup filling in the middle.',
					header: 'Some stroopwafels for you!',
					image: 'Gaufre biscuit.jpg',
					imageSize: '135px'
				}
			},
			icon: mw.config.get( 'wgExtensionAssetsPath' ) + '/WikiLove/modules/ext.wikiLove/images/icons/wikilove-icon-food.png'
		},
		'kitten': {
			name: mw.msg( 'wikilove-type-kittens' ),
			fields: [ 'header', 'message' ],
			header: mw.msg( 'wikilove-kittens-header' ),
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
//</nowiki>
