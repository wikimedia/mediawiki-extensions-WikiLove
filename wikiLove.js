( function( $ ) { $.wikiLove = {
	types: {
		// example type, could be removed later (also no i18n)
		'barnstar': {
			descr: 'Barnstar', // description in the types menu
			select: 'Select a barnstar:', // subtype select label
			subtypes: { // some different subtypes
				// note that when not using subtypes you should use these subtype options
				// for the top-level type
				'original': {
					title: 'An Original Barnstar for you!', // subject title for the message
					descr: 'Original barnstar', // description in the menu
					text: '{{subst:The Original Barnstar|$1 ~~~~}}', // message text, $1 is replaced by the user message
					template: 'The Original Barnstar', // template that is used, for statistics
					mail: 'Hello $2!\n\nI just awarded you a barnstar.' // message to use in email notification
					// $2 is replaced by the recipient's username
				},
				'special': {
					title: null, // no predefined title, allows the user to enter a title
					descr: 'Special barnstar',
					text: '{{subst:The Special Barnstarl|$1 ~~~~}}',
					template: 'The Special Barnstar',
					mail: 'Hello $2!\n\nI just awarded you the special barnstar.'
				}
			},
			email: true, // add email notices as an option for each award of this type
			icon: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/extensions/WikiLove/images/icons/wikilove-icon-barnstar.png'
		},
		'cat': {
			descr: 'Cat',
			title: null,
			text: '[[$3|left|150px]]\n$1\n\n~~~~\n<br style="clear: both"/>', // $3 is the image filename
			template: '',
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
			title: null,
			descr: mw.msg( 'wikilove-type-makeyourown' ),
			text: "$1",
			template: ''
		}
	},
	$dialog: null, // dialog jQuery object
	editToken: '', // edit token used for the final AJAX call
	currentTypeId: null, // id of the currently selected type (e.g. 'barnstar' or 'makeyourown')
	currentSubtypeId: null, // id of the currently selected subtype (e.g. 'original' or 'special')
	currentTypeOrSubtype: null, // content of the current (sub)type (i.e. an object with title, descr, text, etc.)
	previewData: null, // data of the currently previewed thing is set here
	emailable: false,
	gallery: {},
	imageTitle: '',
	
	/*
	 * Opens the dialog and builds it if necessary.
	 */
	openDialog: function() {
		if ( $.wikiLove.$dialog === null ) {
			// Load local configuration
			var wikiLoveConfigUrl = wgServer + wgScript + '?' + $.param( { 'title': 'MediaWiki:WikiLove.js', 'action': 'raw', 'ctype': 'text/javascript' } );
			mw.loader.load( wikiLoveConfigUrl );
			
			// Find out if we can email the user
			$.wikiLove.getEmailable();
			
			// Reusable spinner string
			var spinner = '<img class="wlSpinner" src="' + mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' )
						+ '/extensions/WikiLove/images/spinner.gif"/>';
			
			// Build a type list like this:
			var $typeList = $( '<ul id="wlTypes"></ul>' );
			for( var typeId in $.wikiLove.types ) {
				$button = $( '<a href="#"></a>' );
				$buttonInside = $( '<div class="wlInside"></div>' );
				
				if( typeof $.wikiLove.types[typeId].icon == 'string' ) {
					$buttonInside.append( '<div class="wlIconBox"><img src="'
						+ $.wikiLove.types[typeId].icon + '"/></div>' );
				}
				else {
					$buttonInside.addClass( 'wlNoIcon' );
				}
				
				$buttonInside.append( '<div class="wlLinkText">' + $.wikiLove.types[typeId].descr + '</div>' );
				
				$button.append( '<div class="wlLeftCap"></div>');
				$button.append( $buttonInside );
				$button.append( '<div class="wlRightCap"></div>');
				$button.data( 'typeId', typeId );
				$typeList.append( $( '<li tabindex="0"></li>' ).append( $button ) );
			}
			
			// Build the left menu for selecting a type:
			var $selectType = $( '<div id="wlSelectType"></div>' )
				.append( '<span class="wlNumber">1</span>' )
				.append( '<h3>' + mw.msg( 'wikilove-select-type' ) + '</h3>' )
				.append( $typeList );
				
			var $getStarted = $( '<div id="wlGetStarted"></div>' )
				.append( '<h2>' + mw.msg( 'wikilove-get-started-header' ) + '</h2>' )
				.append( $( '<ol></ol>' )
					.append( '<li>' + mw.msg( 'wikilove-get-started-list-1' ) + '</li>' )
					.append( '<li>' + mw.msg( 'wikilove-get-started-list-2' ) + '</li>' )
					.append( '<li>' + mw.msg( 'wikilove-get-started-list-3' ) + '</li>' )
				);
			
			// Build the right top section for selecting a subtype and entering a title (optional) and message
			var $addDetails = $( '<div id="wlAddDetails"></div>' )
				.append( '<span class="wlNumber">2</span>' )
				.append( '<h3>' + mw.msg( 'wikilove-add-details' ) + '</h3>' )
				.append( '<label for="wlSubtype" id="wlSubtypeLabel"></label>' )
				.append( $( '<form id="wlPreviewForm"></form>' )
					.append( '<select id="wlSubtype"></select>' )
					.append( '<label id="wlGalleryLabel">' + mw.msg( 'wikilove-gallery' ) + '</label>'  )
					.append( '<div id="wlGallerySpinner">' + spinner + '</div>' )
					.append( '<div id="wlGallery"/>' )
					.append( '<label for="wlTitle" id="wlTitleLabel">' + mw.msg( 'wikilove-title' ) + '</label>'  )
					.append( '<input type="text" class="text" id="wlTitle"/>' )
					.append( '<label for="wlMessage" id="wlMessageLabel">' + mw.msg( 'wikilove-enter-message' ) + '</label>'  )
					.append( '<span class="wlOmitSig">' + mw.msg( 'wikilove-omit-sig' ) + '</span>'  )
					.append( '<textarea id="wlMessage"></textarea>' )
					.append( $('<div id="wlNotify"></div>').html('<input type="checkbox" id="wlNotifyCheckbox" name="notify"/> <label for="wlNotifyCheckbox">Notify user by email</label>') )
					.append( $('<button class="submit" id="wlButtonPreview" type="submit"></button>').button({ label: mw.msg( 'wikilove-button-preview' ) }) )
					.append( spinner )
				)
				.hide();
			
			// Build the right bottom preview section
			var $preview = $( '<div id="wlPreview"></div>' )
				.append( '<span class="wlNumber">3</span>' )
				.append( '<h3>' + mw.msg( 'wikilove-preview' ) + '</h3>' )
				.append( '<div id="wlPreviewArea"></div>' )
				.append( $( '<form id="wlSendForm"></form>' )
					.append( $('<button class="submit" id="wlButtonSend" type="submit"></button>').button({ label: mw.msg( 'wikilove-button-send' ) }) )
					.append( spinner )
				)
				.hide();
			
			// Build a modal, hidden dialog with the 3 different sections
			$.wikiLove.$dialog = $( '<div id="wikiLoveDialog"></div>' )
				.append( $selectType )
				.append( $getStarted )
				.append( $addDetails )
				.append( $preview )
				.dialog({
					width: 800,
					autoOpen: false,
					title: mw.msg( 'wikilove-dialog-title' ),
					modal: true,
					resizable: false
				});

			$( '#wlTypes a' ).click( $.wikiLove.clickType );
			$( '#wlSubtype' ).change( $.wikiLove.changeSubtype );
			$( '#wlPreviewForm' ).submit( $.wikiLove.submitPreview );
			$( '#wlSendForm' ).click( $.wikiLove.submitSend );
			$( '#wlMessage' ).elastic(); // have the message textarea grow automatically
		}
		
		$.wikiLove.$dialog.dialog( 'open' );
	},
	
	/*
	 * Handler for the left menu. Selects a new type and initialises next section
	 * depending on whether or not to show subtypes.
	 */
	clickType: function( e ) {
		e.preventDefault();
		$( '#wlGetStarted' ).hide(); // always hide the get started section
		
		var newTypeId = $( this ).data( 'typeId' );
		if( $.wikiLove.currentTypeId != newTypeId ) { // only do stuff when a different type is selected
			$.wikiLove.currentTypeId = newTypeId;
			$.wikiLove.currentSubtypeId = null; // reset the subtype id
			
			$( '#wlTypes a' ).removeClass( 'selected' );
			$( this ).addClass( 'selected' ); // highlight the new type in the menu
			
			if( typeof $.wikiLove.types[$.wikiLove.currentTypeId].subtypes == 'object' ) {
				// we're dealing with subtypes here
				$.wikiLove.currentTypeOrSubtype = null; // reset the (sub)type object until a subtype is selected
				$( '#wlSubtype' ).html( '' ); // clear the subtype menu
				
				for( var subtypeId in $.wikiLove.types[$.wikiLove.currentTypeId].subtypes ) {
					// add all the subtypes to the menu while setting their subtype ids in jQuery data
					var subtype = $.wikiLove.types[$.wikiLove.currentTypeId].subtypes[subtypeId];
					$( '#wlSubtype' ).append(
						$( '<option>' + subtype.descr + '</option>' ).data( 'subtypeId', subtypeId )
					);
				}
				$( '#wlSubtype' ).show();
				
				// change and show the subtype label depending on the type
				$( '#wlSubtypeLabel' ).text( $.wikiLove.types[$.wikiLove.currentTypeId].select );
				$( '#wlSubtypeLabel' ).show();
				$.wikiLove.changeSubtype(); // update controls depending on the currently selected (i.e. first) subtype
			}
			else {
				// there are no subtypes, just use this type for the current (sub)type
				$.wikiLove.currentTypeOrSubtype = $.wikiLove.types[$.wikiLove.currentTypeId];
				$( '#wlSubtype' ).hide();
				$( '#wlSubtypeLabel' ).hide();
				$.wikiLove.updateAllDetails(); // update controls depending on this type
			}
			
			$( '#wlAddDetails' ).show();
			$( '#wlPreview' ).hide();
			$.wikiLove.previewData = null;
		}
		return false;
	},
	
	/*
	 * Handler for changing the subtype.
	 */
	changeSubtype: function() {
		// find out which subtype is selected
		var newSubtypeId = $( '#wlSubtype option:selected' ).first().data( 'subtypeId' );
		if( $.wikiLove.currentSubtypeId != newSubtypeId ) { // only change stuff when a different subtype is selected
			$.wikiLove.currentSubtypeId = newSubtypeId;
			$.wikiLove.currentTypeOrSubtype = $.wikiLove.types[$.wikiLove.currentTypeId]
				.subtypes[$.wikiLove.currentSubtypeId];
			$.wikiLove.updateAllDetails();
			$( '#wlPreview' ).hide();
			$.wikiLove.previewData = null;
		}
	},
	
	/*
	 * Find out whether we can e-mail this user. Probably needs to be moved to the API.
	 */
	getEmailable: function() {
		// Test to see if the 'E-mail this user' link exists
		$.wikiLove.emailable = $('#t-emailuser').length ? true : false;
	},
	
	/*
	 * Actually send the notification e-mail. Probably needs to be moved to the API.
	 */
	sendEmail: function( subject, text ) {
		$.ajax({
			url: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/api.php?',
			data: {
				'action': 'emailuser',
				'target': wgTitle,
				'subject': subject,
				'text': text,
				'format': 'json',
				'token': $.wikiLove.editToken
			},
			dataType: 'json',
			type: 'POST'
		});
	},
	
	/*
	 * Called when type or subtype changes, updates controls. Currently only updates title label and textbox.
	 */
	updateAllDetails: function() {
		$( '#wikiLoveDialog' ).find( '.wlError' ).remove();
		
		// show or hide title label and textbox depending on whether a predefined title exists
		if( typeof $.wikiLove.currentTypeOrSubtype.title == 'string' ) {
			$( '#wlTitleLabel').hide();
			$( '#wlTitle' ).hide();
			$( '#wlTitle' ).val( $.wikiLove.currentTypeOrSubtype.title );
		} else {
			$( '#wlTitleLabel').show();
			$( '#wlTitle' ).show();
			$( '#wlTitle' ).val( '' );
		}
		
		if( typeof $.wikiLove.currentTypeOrSubtype.gallery == 'object' ) {
			$( '#wlGalleryLabel' ).show();
			$( '#wlGallery' ).show();
			$.wikiLove.makeGallery();
		}
		else {
			$( '#wlGalleryLabel' ).hide();
			$( '#wlGallery' ).hide();
		}
		
		if( $.wikiLove.types[$.wikiLove.currentTypeId].email ) {
			$( '#wlNotify' ).show();
		} else {
			$( '#wlNotify' ).hide();
			$( '#wlNotifyCheckbox' ).attr('checked', false);
		}
	},
	
	/*
	 * Handler for clicking the preview button. Builds data for AJAX request.
	 */
	submitPreview: function( e ) {
		e.preventDefault();
		$( '#wlPreview' ).hide();
		$( '#wikiLoveDialog' ).find( '.wlError' ).remove();
		
		if( typeof $.wikiLove.currentTypeOrSubtype.gallery == 'object' ) {
			if ( !$.wikiLove.imageTitle ) {
				$.wikiLove.showError( 'wikilove-err-image' ); return false;
			}
		}
		if( $( '#wlTitle' ).val().length <= 0 ) {
			$.wikiLove.showError( 'wikilove-err-title' ); return false;
		}
		if( $( '#wlMessage' ).val().length <= 0 ) {
			$.wikiLove.showError( 'wikilove-err-msg' ); return false;
		}
		
		// If there isn't a signature already in the message, throw an error
		if ( $( '#wlMessage' ).val().indexOf( '~~~' ) >= 0 ) {
			$.wikiLove.showError( 'wikilove-err-sig' ); return false;
		}
		
		var msg = $.wikiLove.prepareMsg( $.wikiLove.currentTypeOrSubtype.text );
		
		$.wikiLove.doPreview( '==' + $( '#wlTitle' ).val() + "==\n" + msg );
		$.wikiLove.previewData = {
			'title': $( '#wlTitle' ).val(),
			'msg': msg,
			'type': $.wikiLove.currentTypeId
				+ ($.wikiLove.currentSubtypeId != null ? '-' + $.wikiLove.currentSubtypeId : ''),
			'template': $.wikiLove.currentTypeOrSubtype.template,
			'notify': $( '#wlNotifyCheckbox:checked' ).val()
		};
		return false;
	},
	
	showError: function( errmsg ) {
		$( '#wlAddDetails' ).append( $( '<div class="wlError"></div>' ).html( mw.msg( errmsg ) ) );
	},
	
	/*
	 * Prepares a message or e-mail body by replacing placeholders.
	 * $1: message entered by the user
	 * $2: username of the recipient
	 * $3: title of the chosen image
	 */
	prepareMsg: function( msg ) {
		// replace the raw message
		msg = msg.replace( '$1', $( '#wlMessage' ).val() );
		
		// replace the username we're sending to
		msg = msg.replace( '$2', wgTitle );
		
		// replace the image filename
		if ( $.wikiLove.imageTitle ) {
			msg = msg.replace( '$3', $.wikiLove.imageTitle );
		}
		
		return msg;
	},
	
	/*
	 * Fires AJAX request for previewing wikitext.
	 */
	doPreview: function( wikitext ) {
		$( '#wlAddDetails .wlSpinner' ).fadeIn( 200 );
		$.ajax({
			url: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/api.php?',
			data: {
				'action': 'parse',
				'format': 'json',
				'text': wikitext,
				'prop': 'text',
				'pst': true
			},
			dataType: 'json',
			type: 'POST',
			success: function( data ) {
				$.wikiLove.showPreview( data.parse.text['*'] );
				$( '#wlAddDetails .wlSpinner' ).fadeOut( 200 );
			}
		});
	},
	
	/*
	 * Callback for the preview function. Sets the preview area with the HTML and fades it in.
	 */
	showPreview: function( html ) {
		$( '#wlPreviewArea' ).html( html );
		$( '#wlPreview' ).fadeIn( 200 );
	},
	
	/*
	 * Handler for the send (final submit) button. Builds data for AJAX request.
	 * The type sent for statistics is 'typeId-subtypeId' when using subtypes,
	 * or simply 'typeId' otherwise.
	 */
	submitSend: function( e ) {
		e.preventDefault();
		$.wikiLove.doSend( $.wikiLove.previewData.title, $.wikiLove.previewData.msg,
			$.wikiLove.previewData.type, $.wikiLove.previewData.template, $.wikiLove.previewData.notify );
		return false;
	},
	
	/*
	 * Fires the final AJAX request and then redirects to the talk page where the content is added.
	 */
	doSend: function( subject, wikitext, type, template, notify ) {
		$( '#wlPreview .wlSpinner' ).fadeIn( 200 );
		$.ajax({
			url: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/api.php?',
			data: {
				'action': 'wikiLove',
				'format': 'json',
				'title': mw.config.get( 'wgPageName' ),
				'template': template,
				'type': type,
				'text': wikitext,
				'subject': subject,
				'token': $.wikiLove.editToken
			},
			dataType: 'json',
			type: 'POST',
			success: function( data ) {
				if ( notify && $.wikiLove.emailable && typeof $.wikiLove.currentTypeOrSubtype.mail != 'undefined' ) {
					$.wikiLove.sendEmail( 
						$.wikiLove.currentTypeOrSubtype.title, 
						$.wikiLove.prepareMsg( $.wikiLove.currentTypeOrSubtype.mail )
					);
				}
				
				$( '#wlPreview .wlSpinner' ).fadeOut( 200 );
				
				if ( typeof data.error !== 'undefined' ) {
					$( '#wlPreview' ).append( '<div class="wlError">' + data.error.info + '<div>' );
					return;
				}
				
				if ( typeof data.redirect !== 'undefined'
					&&  data.redirect.pageName == mw.config.get( 'wgPageName' ) ) {
					// unfortunately, when on the talk page we cannot reload and then
					// jump to the correct section, because when we set the hash (#...)
					// the page won't reload...
					window.location.reload();
				}
				else {
					window.location = mw.config.get( 'wgArticlePath' ).replace('$1', data.redirect.pageName) 
						+ data.redirect.fragment;
				}
			}
		});
	},
	
	/*
	 * This is a bit of a hack to show some random images. A predefined set of image infos are
	 * retrieved using the API. Then we randomise this set ourselves and select some images to
	 * show. Eventually we probably want to make a custom API call that does this properly and
	 * also allows for using remote galleries such as Commons, which is now prohibited by JS.
	 */
	makeGallery: function() {
		$( '#wlGallery' ).html( '' );
		$.wikiLove.gallery = {};
		$( '#wlGallerySpinner .wlSpinner' ).fadeIn( 200 );
		
		$.ajax({
			url: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/api.php',
			data: {
				'action'      : 'query',
				'format'      : 'json',
				'prop'        : 'imageinfo',
				'iiprop'      : 'mime|url',
				'iiurlwidth'  : $.wikiLove.currentTypeOrSubtype.gallery.width,
				'generator'   : 'categorymembers',
				'gcmtitle'    : $.wikiLove.currentTypeOrSubtype.gallery.category,
				'gcmnamespace': 6,
				'gcmsort'     : 'timestamp',
				'gcmlimit'    : $.wikiLove.currentTypeOrSubtype.gallery.total
			},
			dataType: 'json',
			type: 'POST',
			success: function( data ) {
				// clear
				$( '#wlGallery' ).html( '' );
				$.wikiLove.gallery = {};
				
				// if we have any images at all
				if( data.query) {
					// get the page keys which are just ids
					var keys = Object.keys( data.query.pages );
					
					// try to find "num" images to show
					for( var i=0; i<$.wikiLove.currentTypeOrSubtype.gallery.num; i++ ) {
						// continue looking for a new image until we have found one thats valid
						// or until we run out of images
						while( keys.length > 0 ) {
							// get a random page
							var id = Math.floor( Math.random() * keys.length );
							var page = data.query.pages[keys[id]];
							
							// remove the random page from the keys array
							keys.splice(id, 1);
							
							// only add the image if it's actually an image
							if( page.imageinfo[0].mime.substr(0,5) == 'image' ) {
								// build an image tag with the correct url and width
								$img = $( '<img/>' )
									.attr( 'src', page.imageinfo[0].url )
									.attr( 'width', $.wikiLove.currentTypeOrSubtype.gallery.width )
									.hide()
									.load( function() { $( this ).fadeIn( 400 ); } );
								
								
								// append the image to the gallery and also make sure it's selectable
								$( '#wlGallery' ).append( 
									$( '<a href="#"></a>' )
										.attr( 'id', 'wlGalleryImg' + i )
										.append( $img )
										.click( function( e ) {
											e.preventDefault();
											$( '#wlGallery a' ).removeClass( 'selected' );
											$( this ).addClass( 'selected' );
											$.wikiLove.imageTitle = $.wikiLove.gallery[$( this ).attr( 'id' )];
											return false;
										})
								);
								
								// save the page title into an array so we know which image id maps to which title
								$.wikiLove.gallery['wlGalleryImg' + i] = page.title;
								break;
							}
						}
					}
				}
				if( $.wikiLove.gallery.length <= 0 ) {
					$( '#wlGallery' ).hide();
					$( '#wlGalleryTitle' ).hide();
				}
				
				$( '#wlGallerySpinner .wlSpinner' ).fadeOut( 200 );
			}
		});
	},
	
	/*
	 * Init function which is called upon page load. Binds the WikiLove icon to opening the dialog.
	 */
	init: function() {
		$( '#ca-wikilove a' ).click( function( e ) {
			$.wikiLove.openDialog();
			e.preventDefault();
			return false;
		});
	}
};
$.wikiLove.init();
} ) ( jQuery );
