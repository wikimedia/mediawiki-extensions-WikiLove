( function( $ ) { $.wikiLove = {
	
	options: {}, // options modifiable by the user
	optionsHook: function() { return {}; }, // hook that can be overridden by the user to modify options
	$dialog: null, // dialog jQuery object
	currentTypeId: null, // id of the currently selected type (e.g. 'barnstar' or 'makeyourown')
	currentSubtypeId: null, // id of the currently selected subtype (e.g. 'original' or 'special')
	currentTypeOrSubtype: null, // content of the current (sub)type (i.e. an object with title, descr, text, etc.)
	previewData: null, // data of the currently previewed thing is set here
	emailable: false,
	gallery: {},
	
	/*
	 * Opens the dialog and builds it if necessary.
	 */
	openDialog: function() {
		if ( $.wikiLove.$dialog === null ) {
			// Test to see if the 'E-mail this user' link exists
			$.wikiLove.emailable = $( '#t-emailuser' ).length ? true : false;
			
			// Build a type list like this:
			var $typeList = $( '<ul id="mw-wikilove-types"></ul>' );
			for( var typeId in $.wikiLove.options.types ) {
				var $button = $( '<a href="#"></a>' );
				var $buttonInside = $( '<div class="mw-wikilove-inside"></div>' );
				
				if( typeof $.wikiLove.options.types[typeId].icon == 'string' ) {
					$buttonInside.append( '<div class="mw-wikilove-icon-box"><img src="'
						+ mw.html.escape( $.wikiLove.options.types[typeId].icon ) + '"/></div>' );
				}
				else {
					$buttonInside.addClass( 'mw-wikilove-no-icon' );
				}
				
				$buttonInside.append( '<div class="mw-wikilove-link-text">' + $.wikiLove.options.types[typeId].name + '</div>' );
				
				$button.append( '<div class="mw-wikilove-left-cap"></div>');
				$button.append( $buttonInside );
				$button.append( '<div class="mw-wikilove-right-cap"></div>');
				$button.data( 'typeId', typeId );
				$typeList.append( $( '<li tabindex="0"></li>' ).append( $button ) );
			}
			
			$.wikiLove.$dialog = $( '\
<div id="mw-wikilove-dialog">\
<div id="mw-wikilove-select-type">\
	<span class="mw-wikilove-number">1</span>\
	<h3><html:msg key="wikilove-select-type"/></h3>\
	<ul id="mw-wikilove-types"></ul>\
</div>\
<div id="mw-wikilove-get-started">\
	<h2><html:msg key="wikilove-get-started-header"/></h2>\
	<ol>\
		<li><html:msg key="wikilove-get-started-list-1"/></li>\
		<li><html:msg key="wikilove-get-started-list-2"/></li>\
		<li><html:msg key="wikilove-get-started-list-3"/></li>\
	</ol>\
</div>\
<div id="mw-wikilove-add-details">\
	<span class="mw-wikilove-number">2</span>\
	<h3><html:msg key="wikilove-add-details"/></h3>\
	<form id="mw-wikilove-preview-form">\
		<label for="mw-wikilove-subtype" id="mw-wikilove-subtype-label"></label>\
		<select id="mw-wikilove-subtype"></select>\
		<div id="mw-wikilove-subtype-description"></div>\
		<label id="mw-wikilove-gallery-label"><html:msg key="wikilove-image"/></label>\
		<div id="mw-wikilove-gallery">\
			<div id="mw-wikilove-gallery-spinner" class="mw-wikilove-spinner"></div>\
			<div id="mw-wikilove-gallery-content"></div>\
		</div>\
		<label for="mw-wikilove-header" id="mw-wikilove-header-label"><html:msg key="wikilove-header"/></label>\
		<input type="text" class="text" id="mw-wikilove-header"/>\
		<label for="mw-wikilove-title" id="mw-wikilove-title-label"><html:msg key="wikilove-title"/></label>\
		<input type="text" class="text" id="mw-wikilove-title"/>\
		<label for="mw-wikilove-image" id="mw-wikilove-image-label"><html:msg key="wikilove-image"/></label>\
		<input type="text" class="text" id="mw-wikilove-image"/>\
		<label for="mw-wikilove-message" id="mw-wikilove-message-label"><html:msg key="wikilove-enter-message"/></label>\
		<span class="mw-wikilove-note"><html:msg key="wikilove-omit-sig"/></span>\
		<textarea id="mw-wikilove-message"></textarea>\
		<div id="mw-wikilove-notify">\
			<input type="checkbox" id="mw-wikilove-notify-checkbox" name="notify"/>\
			<label for="mw-wikilove-notify-checkbox"><html:msg key="wikilove-notify"/></label>\
		</div>\
		<button class="submit" id="mw-wikilove-button-preview" type="submit"></button>\
		<div id="mw-wikilove-preview-spinner" class="mw-wikilove-spinner"></div>\
	</form>\
</div>\
<div id="mw-wikilove-preview">\
	<span class="mw-wikilove-number">3</span>\
	<h3><html:msg key="wikilove-preview"/></h3>\
	<div id="mw-wikilove-preview-area"></div>\
	<form id="mw-wikilove-send-form">\
		<button class="submit" id="mw-wikilove-button-send" type="submit"></button>\
		<div id="mw-wikilove-send-spinner" class="mw-wikilove-spinner"></div>\
	</form>\
</div>\
</div>' );
			$.wikiLove.$dialog.localize();
			
			$.wikiLove.$dialog.dialog({
					width: 800,
					position: ['center', 80],
					autoOpen: false,
					title: mw.msg( 'wikilove-dialog-title' ),
					modal: true,
					resizable: false
				});
			
			$( '#mw-wikilove-button-preview' ).button( { label: mw.msg( 'wikilove-button-preview' ), icons: { primary:'ui-icon-search' } } );
			$( '#mw-wikilove-button-send' ).button( { label: mw.msg( 'wikilove-button-send' ) } );
			$( '#mw-wikilove-add-details' ).hide();
			$( '#mw-wikilove-preview' ).hide();
			$( '#mw-wikilove-types' ).replaceWith( $typeList );
			
			$( '#mw-wikilove-types a' ).click( $.wikiLove.clickType );
			$( '#mw-wikilove-subtype' ).change( $.wikiLove.changeSubtype );
			$( '#mw-wikilove-preview-form' ).submit( $.wikiLove.submitPreview );
			$( '#mw-wikilove-send-form' ).click( $.wikiLove.submitSend );
			$( '#mw-wikilove-message' ).elastic(); // have the message textarea grow automatically
		}
		
		$.wikiLove.$dialog.dialog( 'open' );
	},
	
	/*
	 * Handler for the left menu. Selects a new type and initialises next section
	 * depending on whether or not to show subtypes.
	 */
	clickType: function( e ) {
		e.preventDefault();
		$( '#mw-wikilove-get-started' ).hide(); // always hide the get started section
		
		var newTypeId = $( this ).data( 'typeId' );
		if( $.wikiLove.currentTypeId != newTypeId ) { // only do stuff when a different type is selected
			$.wikiLove.currentTypeId = newTypeId;
			$.wikiLove.currentSubtypeId = null; // reset the subtype id
			
			$( '#mw-wikilove-types a' ).removeClass( 'selected' );
			$( this ).addClass( 'selected' ); // highlight the new type in the menu
			
			if( typeof $.wikiLove.options.types[$.wikiLove.currentTypeId].subtypes == 'object' ) {
				// we're dealing with subtypes here
				$.wikiLove.currentTypeOrSubtype = null; // reset the (sub)type object until a subtype is selected
				$( '#mw-wikilove-subtype' ).html( '' ); // clear the subtype menu
				
				for( var subtypeId in $.wikiLove.options.types[$.wikiLove.currentTypeId].subtypes ) {
					// add all the subtypes to the menu while setting their subtype ids in jQuery data
					var subtype = $.wikiLove.options.types[$.wikiLove.currentTypeId].subtypes[subtypeId];
					if ( typeof subtype.option != 'undefined' ) {
						$( '#mw-wikilove-subtype' ).append(
							$( '<option></option>' ).text( subtype.option ).data( 'subtypeId', subtypeId )
						);
					}
				}
				$( '#mw-wikilove-subtype' ).show();
				
				// change and show the subtype label depending on the type
				$( '#mw-wikilove-subtype-label' ).text( $.wikiLove.options.types[$.wikiLove.currentTypeId].select || mw.msg( 'wikilove-select-type' ) );
				$( '#mw-wikilove-subtype-label' ).show();
				$.wikiLove.changeSubtype(); // update controls depending on the currently selected (i.e. first) subtype
			}
			else {
				// there are no subtypes, just use this type for the current (sub)type
				$.wikiLove.currentTypeOrSubtype = $.wikiLove.options.types[$.wikiLove.currentTypeId];
				$( '#mw-wikilove-subtype' ).hide();
				$( '#mw-wikilove-subtype-label' ).hide();
				$.wikiLove.updateAllDetails(); // update controls depending on this type
			}
			
			$( '#mw-wikilove-add-details' ).show();
			$( '#mw-wikilove-preview' ).hide();
			$.wikiLove.previewData = null;
		}
	},
	
	/*
	 * Handler for changing the subtype.
	 */
	changeSubtype: function() {
		// find out which subtype is selected
		var newSubtypeId = $( '#mw-wikilove-subtype option:selected' ).first().data( 'subtypeId' );
		if( $.wikiLove.currentSubtypeId != newSubtypeId ) { // only change stuff when a different subtype is selected
			$.wikiLove.currentSubtypeId = newSubtypeId;
			$.wikiLove.currentTypeOrSubtype = $.wikiLove.options.types[$.wikiLove.currentTypeId]
				.subtypes[$.wikiLove.currentSubtypeId];
			$( '#mw-wikilove-subtype-description' ).html( $.wikiLove.currentTypeOrSubtype.descr );
			$.wikiLove.updateAllDetails();
			$( '#mw-wikilove-preview' ).hide();
			$.wikiLove.previewData = null;
		}
	},
	
	/*
	 * Called when type or subtype changes, updates controls.
	 */
	updateAllDetails: function() {
		$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
		
		// only show the description if it exists for this type or subtype
		if( typeof $.wikiLove.currentTypeOrSubtype.descr == 'string' ) {
			$( '#mw-wikilove-subtype-description').show();
		} else {
			$( '#mw-wikilove-subtype-description').hide();
		}
		
		// show or hide header label and textbox depending on whether a predefined header exists
		if( $.inArray( 'header', $.wikiLove.currentTypeOrSubtype.fields ) >= 0 ) {
			$( '#mw-wikilove-header-label').show();
			$( '#mw-wikilove-header' ).show();
		} else {
			$( '#mw-wikilove-header-label').hide();
			$( '#mw-wikilove-header' ).hide();
		}
		$( '#mw-wikilove-header' ).val( $.wikiLove.currentTypeOrSubtype.header || '' );
		
		// show or hide title label and textbox depending on whether a predefined title exists
		if( $.inArray( 'title', $.wikiLove.currentTypeOrSubtype.fields ) >= 0 ) {
			$( '#mw-wikilove-title-label').show();
			$( '#mw-wikilove-title' ).show();
		} else {
			$( '#mw-wikilove-title-label').hide();
			$( '#mw-wikilove-title' ).hide();
		}
		$( '#mw-wikilove-title' ).val( $.wikiLove.currentTypeOrSubtype.title || '' );
		
		// show or hide image label and textbox depending on whether a predefined image exists
		if( $.inArray( 'image', $.wikiLove.currentTypeOrSubtype.fields ) >= 0 ) {
			$( '#mw-wikilove-image-label').show();
			$( '#mw-wikilove-image' ).show();
		} else {
			$( '#mw-wikilove-image-label').hide();
			$( '#mw-wikilove-image' ).hide();
		}
		$( '#mw-wikilove-image' ).val( $.wikiLove.currentTypeOrSubtype.image || '' );
		
		if( typeof $.wikiLove.currentTypeOrSubtype.gallery == 'object' ) {
			if( $.wikiLove.currentTypeOrSubtype.gallery.imageList instanceof Array) {
				$( '#mw-wikilove-gallery-label' ).show();
				$( '#mw-wikilove-gallery' ).show();
				$.wikiLove.showGallery(); // build gallery from array of images
			} else {
				// gallery is a category
				$( '#mw-wikilove-gallery-label' ).show();
				$( '#mw-wikilove-gallery' ).show();
				$.wikiLove.makeGallery(); // build gallery from category
			}
		}
		else {
			$( '#mw-wikilove-gallery-label' ).hide();
			$( '#mw-wikilove-gallery' ).hide();
		}
		
		if( $.inArray( 'notify', $.wikiLove.currentTypeOrSubtype.fields ) >= 0 && $.wikiLove.emailable ) {
			$( '#mw-wikilove-notify' ).show();
		} else {
			$( '#mw-wikilove-notify' ).hide();
			$( '#mw-wikilove-notify-checkbox' ).attr('checked', false);
		}
	},
	
	/*
	 * Handler for clicking the preview button. Builds data for AJAX request.
	 */
	submitPreview: function( e ) {
		e.preventDefault();
		$( '#mw-wikilove-preview' ).hide();
		$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
		
		if( typeof $.wikiLove.currentTypeOrSubtype.gallery == 'object' ) {
			if ( $( '#mw-wikilove-image' ).val().length <= 0 ) {
				$.wikiLove.showError( 'wikilove-err-image' ); return false;
			}
		}
		if( $( '#mw-wikilove-header' ).val().length <= 0 ) {
			$.wikiLove.showError( 'wikilove-err-header' ); return false;
		}
		if( $( '#mw-wikilove-message' ).val().length <= 0 ) {
			$.wikiLove.showError( 'wikilove-err-msg' ); return false;
		}
		
		// If there isn't a signature already in the message, throw an error
		if ( $( '#mw-wikilove-message' ).val().indexOf( '~~~' ) >= 0 ) {
			$.wikiLove.showError( 'wikilove-err-sig' ); return false;
		}
		
		var msg = $.wikiLove.prepareMsg(
			$.wikiLove.currentTypeOrSubtype.text || $.wikiLove.options.defaultText,
			$.wikiLove.currentTypeOrSubtype.imageSize,
			$.wikiLove.currentTypeOrSubtype.backgroundColor,
			$.wikiLove.currentTypeOrSubtype.borderColor
		);
		
		$.wikiLove.doPreview( '==' + $( '#mw-wikilove-header' ).val() + "==\n" + msg );
		$.wikiLove.previewData = {
			'header': $( '#mw-wikilove-header' ).val(),
			'msg': msg,
			'type': $.wikiLove.currentTypeId
				+ ($.wikiLove.currentSubtypeId !== null ? '-' + $.wikiLove.currentSubtypeId : '')
		};
		
		if ( $( '#mw-wikilove-notify-checkbox:checked' ).val() && $.wikiLove.emailable ) {
			$.wikiLove.previewData.mail = $.wikiLove.prepareMsg( $.wikiLove.currentTypeOrSubtype.mail );
		}
	},
	
	showError: function( errmsg ) {
		$( '#mw-wikilove-add-details' ).append( $( '<div class="mw-wikilove-error"></div>' ).text( mw.msg( errmsg ) ) );
	},
	
	/*
	 * Prepares a message or e-mail body by replacing placeholders.
	 * $1: message entered by the user
	 * $2: title of the item
	 * $3: title of the image
	 * $4: image size
	 * $5: background color
	 * $6: border color
	 * $7: username of the recipient
	 */
	prepareMsg: function( msg, imageSize, backgroundColor, borderColor ) {
		
		msg = msg.replace( '$1', $( '#mw-wikilove-message' ).val() ); // replace the raw message
		msg = msg.replace( '$2', $( '#mw-wikilove-title' ).val() ); // replace the title
		msg = msg.replace( '$3', $( '#mw-wikilove-image' ).val() ); // replace the image
		
		var myImageSize = imageSize || $.wikiLove.options.defaultImageSize;
		var myBackgroundColor = backgroundColor || $.wikiLove.options.defaultBackgroundColor;
		var myBorderColor = borderColor || $.wikiLove.options.defaultBorderColor;
		
		msg = msg.replace( '$4', myImageSize ); // replace the image size
		msg = msg.replace( '$5', myBackgroundColor ); // replace the background color
		msg = msg.replace( '$6', myBorderColor ); // replace the border color
		
		msg = msg.replace( '$7', wgTitle ); // replace the username we're sending to
		
		return msg;
	},
	
	/*
	 * Fires AJAX request for previewing wikitext.
	 */
	doPreview: function( wikitext ) {
		$( '#mw-wikilove-preview-spinner' ).fadeIn( 200 );
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
				$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
			}
		});
	},
	
	/*
	 * Callback for the preview function. Sets the preview area with the HTML and fades it in.
	 */
	showPreview: function( html ) {
		$( '#mw-wikilove-preview-area' ).html( html );
		$( '#mw-wikilove-preview' ).fadeIn( 200 );
	},
	
	/*
	 * Handler for the send (final submit) button. Builds data for AJAX request.
	 * The type sent for statistics is 'typeId-subtypeId' when using subtypes,
	 * or simply 'typeId' otherwise.
	 */
	submitSend: function( e ) {
		e.preventDefault();
		$.wikiLove.doSend( $.wikiLove.previewData.header, $.wikiLove.previewData.msg,
			$.wikiLove.previewData.type, $.wikiLove.previewData.notify );
	},
	
	/*
	 * Fires the final AJAX request and then redirects to the talk page where the content is added.
	 */
	doSend: function( subject, wikitext, type, mail ) {
		$( '#mw-wikilove-send-spinner' ).fadeIn( 200 );
		
		var sendData = {
			'action': 'wikilove',
			'format': 'json',
			'title': mw.config.get( 'wgPageName' ),
			'type': type,
			'text': wikitext,
			'subject': subject,
			'token': mw.user.tokens.get( 'editToken' )
		};
		
		if ( mail ) {
			sendData.email = mail;
		}
		
		$.ajax({
			url: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/api.php?',
			data: sendData,
			dataType: 'json',
			type: 'POST',
			success: function( data ) {
				$( '#mw-wikilove-send-spinner' ).fadeOut( 200 );
				
				if ( typeof data.error !== 'undefined' ) {
					$( '#mw-wikilove-preview' ).append( '<div class="wlError">' + mw.html.escape( data.error.info ) + '<div>' );
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
					window.location = mw.util.wikiUrlencode( 
						mw.config.get( 'wgArticlePath' ).replace( '$1', data.redirect.pageName ) 
						+ '#' + data.redirect.fragment );
				}
			}
		});
	},
	
	/*
	 * This function is called if the gallery is an array of images. It retrieves the image 
	 * thumbnails from the API, and constructs a thumbnail gallery with them.
	 */
	showGallery: function() {
		$( '#mw-wikilove-gallery-content' ).html( '' );
		$.wikiLove.gallery = {};
		$( '#mw-wikilove-gallery-spinner' ).fadeIn( 200 );
		
		$.each( $.wikiLove.currentTypeOrSubtype.gallery.imageList, function(index, value) {
		
			$.ajax({
				url: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/api.php',
				data: {
					'action'      : 'query',
					'format'      : 'json',
					'prop'        : 'imageinfo',
					'iiprop'      : 'mime|url',
					'titles'      : value,
					'iiurlwidth'  : $.wikiLove.currentTypeOrSubtype.gallery.width
				},
				dataType: 'json',
				type: 'POST',
				success: function( data ) {
					$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
					
					if ( !data || !data.query || !data.query.pages ) {
						return;
					}
					$.each( data.query.pages, function( id, page ) {
						if ( page.imageinfo && page.imageinfo.length ) {
							// build an image tag with the correct url and width
							$img = $( '<img/>' )
								.attr( 'src', page.imageinfo[0].thumburl )
								.attr( 'width', $.wikiLove.currentTypeOrSubtype.gallery.width )
								.hide()
								.load( function() { $( this ).css( 'display', 'inline-block' ); } );
							$( '#mw-wikilove-gallery-content' ).append( 
								$( '<a href="#"></a>' )
									.attr( 'id', 'mw-wikilove-gallery-img-' + index )
									.append( $img )
									.click( function( e ) {
										e.preventDefault();
										$( '#mw-wikilove-gallery a' ).removeClass( 'selected' );
										$( this ).addClass( 'selected' );
										$( '#mw-wikilove-image' ).val( $.wikiLove.gallery[$( this ).attr( 'id' )] );
									}) 
							);
							$.wikiLove.gallery['mw-wikilove-gallery-img-' + index] = page.title;
						}
					} );
				}
			});
		
		});
	},
	
	/*
	 * This is a bit of a hack to show some random images. A predefined set of image infos are
	 * retrieved using the API. Then we randomise this set ourselves and select some images to
	 * show. Eventually we probably want to make a custom API call that does this properly and
	 * also allows for using remote galleries such as Commons, which is now prohibited by JS.
	 */
	makeGallery: function() {
		$( '#mw-wikilove-gallery-content' ).html( '' );
		$.wikiLove.gallery = {};
		$( '#mw-wikilove-gallery-spinner' ).fadeIn( 200 );
		
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
				$( '#mw-wikilove-gallery-content' ).html( '' );
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
								var $img = $( '<img/>' )
									.attr( 'src', page.imageinfo[0].url )
									.attr( 'width', $.wikiLove.currentTypeOrSubtype.gallery.width )
									.hide()
									.load( function() { $( this ).css( 'display', 'inline-block' ); } );
								
								// append the image to the gallery and also make sure it's selectable
								$( '#mw-wikilove-gallery-content' ).append( 
									$( '<a href="#"></a>' )
										.attr( 'id', 'mw-wikilove-gallery-img-' + i )
										.append( $img )
										.click( function( e ) {
											e.preventDefault();
											$( '#mw-wikilove-gallery a' ).removeClass( 'selected' );
											$( this ).addClass( 'selected' );
											$( '#mw-wikilove-image' ).val( $.wikiLove.gallery[$( this ).attr( 'id' )] );
										})
								);
								
								// save the page title into an array so we know which image id maps to which title
								$.wikiLove.gallery['mw-wikilove-gallery-img-' + i] = page.title;
								break;
							}
						}
					}
				}
				if( $.wikiLove.gallery.length <= 0 ) {
					$( '#mw-wikilove-gallery' ).hide();
					$( '#mw-wikilove-gallery-label' ).hide();
				}
				
				$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
			}
		});
	},
};
} ) ( jQuery );

mw.log( 'core loaded' );