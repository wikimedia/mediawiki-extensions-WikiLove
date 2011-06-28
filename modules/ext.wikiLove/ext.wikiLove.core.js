( function( $ ) { 
$.wikiLove = (function(){

var	options = {}, // options modifiable by the user
	$dialog = null, // dialog jQuery object
	currentTypeId = null, // id of the currently selected type (e.g. 'barnstar' or 'makeyourown')
	currentSubtypeId = null, // id of the currently selected subtype (e.g. 'original' or 'special')
	currentTypeOrSubtype = null, // content of the current (sub)type (i.e. an object with title, descr, text, etc.)
	previewData = null, // data of the currently previewed thing is set here
	emailable = false,
	gallery = {};
	
return {
	/*
	 * Opens the dialog and builds it if necessary.
	 */
	openDialog: function() {
		if ( $dialog === null ) {
			// Test to see if the 'E-mail this user' link exists
			emailable = $( '#t-emailuser' ).length ? true : false;
			
			// Build a type list like this:
			var $typeList = $( '<ul id="mw-wikilove-types"></ul>' );
			for( var typeId in options.types ) {
				var $button = $( '<a href="#"></a>' );
				var $buttonInside = $( '<div class="mw-wikilove-inside"></div>' );
				
				if( typeof options.types[typeId].icon == 'string' ) {
					$buttonInside.append( '<div class="mw-wikilove-icon-box"><img src="'
						+ mw.html.escape( options.types[typeId].icon ) + '"/></div>' );
				}
				else {
					$buttonInside.addClass( 'mw-wikilove-no-icon' );
				}
				
				$buttonInside.append( '<div class="mw-wikilove-link-text">' + options.types[typeId].name + '</div>' );
				
				$button.append( '<div class="mw-wikilove-left-cap"></div>');
				$button.append( $buttonInside );
				$button.append( '<div class="mw-wikilove-right-cap"></div>');
				$button.data( 'typeId', typeId );
				$typeList.append( $( '<li tabindex="0"></li>' ).append( $button ) );
			}
			
			$dialog = $( '\
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
	<p><a target="_blank" href="http://www.mediawiki.org/wiki/WikiLove">\
		<html:msg key="wikilove-what-is-this"/>\
	</a></p>\
	<p id="mw-wikilove-anon-warning"><strong><html:msg key="wikilove-anon-warning"/></strong></p>\
</div>\
<div id="mw-wikilove-add-details">\
	<span class="mw-wikilove-number">2</span>\
	<h3><html:msg key="wikilove-add-details"/></h3>\
	<form id="mw-wikilove-preview-form">\
		<label for="mw-wikilove-subtype" id="mw-wikilove-subtype-label"></label>\
		<select id="mw-wikilove-subtype"></select>\
		<div id="mw-wikilove-subtype-description"></div>\
		<label id="mw-wikilove-gallery-label"><html:msg key="wikilove-select-image"/></label>\
		<div id="mw-wikilove-gallery">\
			<div id="mw-wikilove-gallery-error">\
				<html:msg key="wikilove-err-gallery"/>\
				<a href="#" id="mw-wikilove-gallery-error-again"><html:msg key="wikilove-err-gallery-again"/></a>\
			</div>\
			<div id="mw-wikilove-gallery-spinner" class="mw-wikilove-spinner"></div>\
			<div id="mw-wikilove-gallery-content"></div>\
		</div>\
		<label for="mw-wikilove-header" id="mw-wikilove-header-label"><html:msg key="wikilove-header"/></label>\
		<input type="text" class="text" id="mw-wikilove-header"/>\
		<label for="mw-wikilove-title" id="mw-wikilove-title-label"><html:msg key="wikilove-title"/></label>\
		<input type="text" class="text" id="mw-wikilove-title"/>\
		<label for="mw-wikilove-image" id="mw-wikilove-image-label"><html:msg key="wikilove-image"/></label>\
		<span class="mw-wikilove-note" id="mw-wikilove-image-note"><html:msg key="wikilove-image-example"/></span>\
		<input type="text" class="text" id="mw-wikilove-image"/>\
		<label for="mw-wikilove-message" id="mw-wikilove-message-label"><html:msg key="wikilove-enter-message"/></label>\
		<span class="mw-wikilove-note" id="mw-wikilove-message-note"><html:msg key="wikilove-omit-sig"/></span>\
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
			$dialog.localize();
			
			$dialog.dialog({
					width: 800,
					position: ['center', 80],
					autoOpen: false,
					title: mw.msg( 'wikilove-dialog-title' ),
					modal: true,
					resizable: false
				});
			
			if ( skin == 'vector' ) {
				$( '#mw-wikilove-button-preview' ).button( { label: mw.msg( 'wikilove-button-preview' ), icons: { primary:'ui-icon-search' } } );
			} else {
				$( '#mw-wikilove-button-preview' ).button( { label: mw.msg( 'wikilove-button-preview' ) } );
			}
			$( '#mw-wikilove-button-send' ).button( { label: mw.msg( 'wikilove-button-send' ) } );
			$( '#mw-wikilove-add-details' ).hide();
			$( '#mw-wikilove-preview' ).hide();
			$( '#mw-wikilove-types' ).replaceWith( $typeList );
			$( '#mw-wikilove-gallery-error-again' ).click( $.wikiLove.showGallery );
			$( '#mw-wikilove-types a' ).click( $.wikiLove.clickType );
			$( '#mw-wikilove-subtype' ).change( $.wikiLove.changeSubtype );
			$( '#mw-wikilove-preview-form' ).submit( $.wikiLove.validatePreviewForm );
			$( '#mw-wikilove-send-form' ).click( $.wikiLove.submitSend );
			$( '#mw-wikilove-message' ).elastic(); // have the message textarea grow automatically
			
			if ( mw.config.get( 'wikilove-anon' ) === 0 ) $( '#mw-wikilove-anon-warning' ).hide();
			
			// when the input changes, we want to disable the send button
			$( '#mw-wikilove-header' ).change( $.wikiLove.changeInput );
			$( '#mw-wikilove-header' ).keyup( $.wikiLove.changeInput );
			$( '#mw-wikilove-title' ).change( $.wikiLove.changeInput );
			$( '#mw-wikilove-title' ).keyup( $.wikiLove.changeInput );
			$( '#mw-wikilove-image' ).change( $.wikiLove.changeInput );
			$( '#mw-wikilove-image' ).keyup( $.wikiLove.changeInput );
			$( '#mw-wikilove-message' ).change( $.wikiLove.changeInput );
			$( '#mw-wikilove-message' ).keyup( $.wikiLove.changeInput );
		}
		
		$dialog.dialog( 'open' );
	},
	
	/*
	 * Handler for the left menu. Selects a new type and initialises next section
	 * depending on whether or not to show subtypes.
	 */
	clickType: function( e ) {
		e.preventDefault();
		$( '#mw-wikilove-get-started' ).hide(); // always hide the get started section
		
		var newTypeId = $( this ).data( 'typeId' );
		if( currentTypeId != newTypeId ) { // only do stuff when a different type is selected
			currentTypeId = newTypeId;
			currentSubtypeId = null; // reset the subtype id
			
			$( '#mw-wikilove-types' ).find( 'a' ).removeClass( 'selected' );
			$( this ).addClass( 'selected' ); // highlight the new type in the menu
			
			if( typeof options.types[currentTypeId].subtypes == 'object' ) {
				// we're dealing with subtypes here
				currentTypeOrSubtype = null; // reset the (sub)type object until a subtype is selected
				$( '#mw-wikilove-subtype' ).html( '' ); // clear the subtype menu
				
				for( var subtypeId in options.types[currentTypeId].subtypes ) {
					// add all the subtypes to the menu while setting their subtype ids in jQuery data
					var subtype = options.types[currentTypeId].subtypes[subtypeId];
					if ( typeof subtype.option != 'undefined' ) {
						$( '#mw-wikilove-subtype' ).append(
							$( '<option></option>' ).text( subtype.option ).data( 'subtypeId', subtypeId )
						);
					}
				}
				$( '#mw-wikilove-subtype' ).show();
				
				// change and show the subtype label depending on the type
				$( '#mw-wikilove-subtype-label' ).text( options.types[currentTypeId].select || mw.msg( 'wikilove-select-type' ) );
				$( '#mw-wikilove-subtype-label' ).show();
				$.wikiLove.changeSubtype(); // update controls depending on the currently selected (i.e. first) subtype
			}
			else {
				// there are no subtypes, just use this type for the current (sub)type
				currentTypeOrSubtype = options.types[currentTypeId];
				$( '#mw-wikilove-subtype' ).hide();
				$( '#mw-wikilove-subtype-label' ).hide();
				$.wikiLove.updateAllDetails(); // update controls depending on this type
			}
			
			$( '#mw-wikilove-add-details' ).show();
			$( '#mw-wikilove-preview' ).hide();
			previewData = null;
		}
	},
	
	/*
	 * Handler for changing the subtype.
	 */
	changeSubtype: function() {
		// find out which subtype is selected
		var newSubtypeId = $( '#mw-wikilove-subtype option:selected' ).first().data( 'subtypeId' );
		if( currentSubtypeId != newSubtypeId ) { // only change stuff when a different subtype is selected
			currentSubtypeId = newSubtypeId;
			currentTypeOrSubtype = options.types[currentTypeId]
				.subtypes[currentSubtypeId];
			$( '#mw-wikilove-subtype-description' ).html( currentTypeOrSubtype.descr );
			$.wikiLove.updateAllDetails();
			$( '#mw-wikilove-preview' ).hide();
			previewData = null;
		}
	},
	
	/*
	 * Called when type or subtype changes, updates controls.
	 */
	updateAllDetails: function() {
		$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
		
		// only show the description if it exists for this type or subtype
		if( typeof currentTypeOrSubtype.descr == 'string' ) {
			$( '#mw-wikilove-subtype-description').show();
		} else {
			$( '#mw-wikilove-subtype-description').hide();
		}
		
		// show or hide header label and textbox depending on fields configuration
		$( '#mw-wikilove-header, #mw-wikilove-header-label' )
			.toggle( $.inArray( 'header', currentTypeOrSubtype.fields ) >= 0 );
		
		// set the new text for the header textbox
		$( '#mw-wikilove-header' ).val( currentTypeOrSubtype.header || '' );
		
		// show or hide title label and textbox depending on fields configuration
		$( '#mw-wikilove-title, #mw-wikilove-title-label')
			.toggle( $.inArray( 'title', currentTypeOrSubtype.fields ) >= 0 );
		
		// set the new text for the title textbox
		$( '#mw-wikilove-title' ).val( currentTypeOrSubtype.title || '' );
		
		// show or hide image label and textbox depending on fields configuration
		$( '#mw-wikilove-image, #mw-wikilove-image-label, #mw-wikilove-image-note' )
			.toggle( $.inArray( 'image', currentTypeOrSubtype.fields ) >= 0 );
		
		// set the new text for the image textbox
		$( '#mw-wikilove-image' ).val( currentTypeOrSubtype.image || '' );
		
		if( typeof currentTypeOrSubtype.gallery == 'object' 
			&& $.isArray( currentTypeOrSubtype.gallery.imageList )
		) {
			$( '#mw-wikilove-gallery, #mw-wikilove-gallery-label' ).show();
			$.wikiLove.showGallery(); // build gallery from array of images
		}
		else {
			$( '#mw-wikilove-gallery, #mw-wikilove-gallery-label' ).hide();
		}
		
		// show or hide message label and textbox depending on fields configuration
		$( '#mw-wikilove-message, #mw-wikilove-message-label, #mw-wikilove-message-note' )
			.toggle( $.inArray( 'message', currentTypeOrSubtype.fields ) >= 0 );
			
		// set the new text for the message textbox
		$( '#mw-wikilove-message' ).val( currentTypeOrSubtype.message || '' );
		
		if( $.inArray( 'notify', currentTypeOrSubtype.fields ) >= 0 && emailable ) {
			$( '#mw-wikilove-notify' ).show();
		} else {
			$( '#mw-wikilove-notify' ).hide();
			$( '#mw-wikilove-notify-checkbox' ).attr('checked', false);
		}
	},
	
	/*
	 * Handler for clicking the preview button.
	 */
	validatePreviewForm: function( e ) {
		e.preventDefault();
		$( '#mw-wikilove-preview' ).hide();
		$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
		
		// Check for a header if it is required
		if( $.inArray( 'header', currentTypeOrSubtype.fields ) >= 0 && $( '#mw-wikilove-header' ).val().length <= 0 ) {
			$.wikiLove.showError( 'wikilove-err-header' ); return false;
		}
		
		// Check for a title if it is required
		if( $.inArray( 'title', currentTypeOrSubtype.fields ) >= 0 && $( '#mw-wikilove-title' ).val().length <= 0 ) {
			$.wikiLove.showError( 'wikilove-err-title' ); return false;
		}
		
		if( $.inArray( 'message', currentTypeOrSubtype.fields ) >= 0 ) {
			// Check for a message if it is required
			if ( $( '#mw-wikilove-message' ).val().length <= 0 ) {
				$.wikiLove.showError( 'wikilove-err-msg' ); return false;
			}
			
			// If there isn't a signature already in the message, throw an error
			if ( $( '#mw-wikilove-message' ).val().indexOf( '~~~' ) >= 0 ) {
				$.wikiLove.showError( 'wikilove-err-sig' ); return false;
			}
		}
		
		// Split image validation depending on whether or not it is a gallery
		if ( typeof currentTypeOrSubtype.gallery == 'undefined' ) { // not a gallery
			if ( $( '#mw-wikilove-image' ).val().length <= 0 ) {
				// Give them the default image and continue with preview.
				$( '#mw-wikilove-image' ).val( options.defaultImage );
				$.wikiLove.submitPreview();
			} else {
				// Make sure the image exists
				var imageTitle = $.wikiLove.addFilePrefix( $( '#mw-wikilove-image' ).val() );
				$( '#mw-wikilove-preview-spinner' ).fadeIn( 200 );
				
				$.ajax( {
					url: mw.util.wikiScript( 'api' ),
					data: {
						'action': 'query',
						'format': 'json',
						'titles': imageTitle,
						'prop': 'imageinfo'
					},
					dataType: 'json',
					success: function( data ) {
						if ( !data.query.pages[-1].imageinfo ) {
							// Image does not exist
							$.wikiLove.showError( 'wikilove-err-image-bad' );
							$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
						} else {
							// Image exists. Proceed with preview.
							$.wikiLove.submitPreview();
						}
					},
					error: function() {
						$.wikiLove.showError( 'wikilove-err-image-api' );
						$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
					}
				} );
			}
		} else { // a gallery
			if ( $( '#mw-wikilove-image' ).val().length <= 0 ) {
				// Display an error telling them to select an image.
				$.wikiLove.showError( 'wikilove-err-image' ); return false;
			} else {
				// Proceed with preview.
				$.wikiLove.submitPreview();
			}
		}
	},
	
	/*
	 * After the form is validated, perform preview, and build data for the final AJAX request.
	 */
	submitPreview: function() {
		var text = $.wikiLove.prepareMsg( currentTypeOrSubtype.text || options.defaultText );
		
		$.wikiLove.doPreview( '==' + $( '#mw-wikilove-header' ).val() + "==\n" + text );
		previewData = {
			'header': $( '#mw-wikilove-header' ).val(),
			'text': text,
			'message': $( '#mw-wikilove-message' ).val(),
			'title':  $( '#mw-wikilove-title' ).val(),
			'image': $( '#mw-wikilove-image' ).val(),
			'type': currentTypeId
				+ (currentSubtypeId !== null ? '-' + currentSubtypeId : '')
		};
		
		if ( $( '#mw-wikilove-notify-checkbox:checked' ).val() && emailable ) {
			previewData.email = $.wikiLove.prepareMsg( currentTypeOrSubtype.email );
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
	prepareMsg: function( msg ) {
		
		msg = msg.replace( '$1', $( '#mw-wikilove-message' ).val() ); // replace the raw message
		msg = msg.replace( '$2', $( '#mw-wikilove-title' ).val() ); // replace the title
		var imageName = $.wikiLove.addFilePrefix( $( '#mw-wikilove-image' ).val() );
		msg = msg.replace( '$3', imageName ); // replace the image
		msg = msg.replace( '$4', currentTypeOrSubtype.imageSize || options.defaultImageSize ); // replace the image size
		msg = msg.replace( '$5', currentTypeOrSubtype.backgroundColor || options.defaultBackgroundColor ); // replace the background color
		msg = msg.replace( '$6', currentTypeOrSubtype.borderColor || options.defaultBorderColor ); // replace the border color
		msg = msg.replace( '$7', mw.config.get( 'wikilove-recipient' ) ); // replace the username we're sending to
		
		return msg;
	},
	
	/*
	 * Adds a "File:" prefix if there isn't already a media namespace prefix.
	 */
	addFilePrefix: function( filename ) {
		if ( filename.indexOf( 'File:' ) !== 0 && filename.indexOf( 'Image:' ) !== 0 && filename.indexOf( wgFormattedNamespaces[6] + ':' ) !== 0  ) {
			filename = 'File:' + filename;
		}
		return filename;
	},
	
	/*
	 * Fires AJAX request for previewing wikitext.
	 */
	doPreview: function( wikitext ) {
		$( '#mw-wikilove-preview-spinner' ).fadeIn( 200 );
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action': 'parse',
				'title': mw.config.get( 'wgPageName' ),
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
	 * It also (re-)enables the send button.
	 */
	showPreview: function( html ) {
		$( '#mw-wikilove-preview-area' ).html( html );
		$( '#mw-wikilove-preview' ).fadeIn( 200 );
		$( '#mw-wikilove-button-send' ).button( 'enable' );
	},
	
	changeInput: function() {
		if( previewData !== null &&
			( previewData.message   != $( '#mw-wikilove-message' ).val()
			|| previewData.title  != $( '#mw-wikilove-title' ).val()
			|| previewData.header != $( '#mw-wikilove-header' ).val()
			|| previewData.image  != $( '#mw-wikilove-image' ).val()
		)) {
			$( '#mw-wikilove-button-send' ).button( 'disable' );
		}
		else {
			$( '#mw-wikilove-button-send' ).button( 'enable' );
		}
	},
	
	/*
	 * Handler for the send (final submit) button.
	 * The type sent for statistics is 'typeId-subtypeId' when using subtypes,
	 * or simply 'typeId' otherwise.
	 */
	submitSend: function( e ) {
		$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
		
		if( !$( '#mw-wikilove-button-send' ).button( 'option', 'disabled' ) ) {
			e.preventDefault();
			$.wikiLove.doSend( previewData.header, previewData.text,
				previewData.message, previewData.type, previewData.email );
		}
	},
	
	/*
	 * Fires the final AJAX request and then redirects to the talk page where the content is added.
	 */
	doSend: function( subject, wikitext, message, type, email ) {
		$( '#mw-wikilove-send-spinner' ).fadeIn( 200 );
		
		var sendData = {
			'action': 'wikilove',
			'format': 'json',
			'title': mw.config.get( 'wgPageName' ),
			'type': type,
			'text': wikitext,
			'message': message,
			'subject': subject,
			'token': mw.config.get( 'wikilove-edittoken' ) // after 1.17 this can become mw.user.tokens.get( 'editToken' )
		};
		
		if ( email ) {
			sendData.email = email;
		}
		
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: sendData,
			dataType: 'json',
			type: 'POST',
			success: function( data ) {
				$( '#mw-wikilove-send-spinner' ).fadeOut( 200 );
				
				if ( typeof data.error !== 'undefined' ) {
					$( '#mw-wikilove-preview' ).append( '<div class="mw-wikilove-error">' + mw.html.escape( data.error.info ) + '<div>' );
					return;
				}
				
				if ( typeof data.redirect !== 'undefined'
					&&  data.redirect.pageName == mw.config.get( 'wgPageName' ) ) {
					// unfortunately, when on the talk page we cannot reload and then
					// jump to the correct section, because when we set the hash (#...)
					// the page won't reload...
					window.location.reload();
				} else {
					window.location = encodeURI( 
						mw.config.get( 'wgArticlePath' ).replace( '$1', mw.util.wikiUrlencode( data.redirect.pageName ) ) 
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
		gallery = {};
		$( '#mw-wikilove-gallery-spinner' ).fadeIn( 200 );
		$( '#mw-wikilove-gallery-error' ).hide();
		
		if( typeof currentTypeOrSubtype.gallery.number == 'undefined'
		    || currentTypeOrSubtype.gallery.number <= 0
		) {
			currentTypeOrSubtype.gallery.number = currentTypeOrSubtype.gallery.imageList.length;
		}
		
		var titles = '';
		var imageList = currentTypeOrSubtype.gallery.imageList.slice( 0 );
		for( var i=0; i<currentTypeOrSubtype.gallery.number; i++ ) {
			// get a random image from imageList and add it to the list of titles to be retrieved
			var id = Math.floor( Math.random() * imageList.length );
			titles = titles + $.wikiLove.addFilePrefix( imageList[id] ) + '|';
			
			// remove the randomly selected image from imageList so that it can't be added twice 
			imageList.splice(id, 1);
		}
		
		var	index = 0,
			loadingType = currentTypeOrSubtype,
			loadingIndex = 0;
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action'      : 'query',
				'format'      : 'json',
				'prop'        : 'imageinfo',
				'iiprop'      : 'mime|url',
				'titles'      : titles,
				'iiurlwidth'  : currentTypeOrSubtype.gallery.width,
				'iiurlheight' : currentTypeOrSubtype.gallery.height
			},
			dataType: 'json',
			type: 'POST',
			success: function( data ) {
				if ( !data || !data.query || !data.query.pages ) {
					$( '#mw-wikilove-gallery-error' ).show();
					$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
					return;
				}
				
				if ( loadingType != currentTypeOrSubtype ) {
					return;
				}
				
				$.each( data.query.pages, function( id, page ) {
					if ( page.imageinfo && page.imageinfo.length ) {
						// build an image tag with the correct url
						var $img = $( '<img/>' )
							.attr( 'src', page.imageinfo[0].thumburl )
							.hide()
							.load( function() { 
								$( this ).css( 'display', 'inline-block' );
								loadingIndex++;
								if ( loadingIndex >= currentTypeOrSubtype.gallery.number ) {
									$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
								}
							} );
						$( '#mw-wikilove-gallery-content' ).append( 
							$( '<a href="#"></a>' )
								.attr( 'id', 'mw-wikilove-gallery-img-' + index )
								.append( $img )
								.click( function( e ) {
									e.preventDefault();
									$( '#mw-wikilove-gallery a' ).removeClass( 'selected' );
									$( this ).addClass( 'selected' );
									$( '#mw-wikilove-image' ).val( gallery[$( this ).attr( 'id' )] );
									$.wikiLove.changeInput();
								}) 
						);
						gallery['mw-wikilove-gallery-img-' + index] = page.title;
						index++;
					}
				} );
			},
			error: function() {
				$( '#mw-wikilove-gallery-error' ).show();
				$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
			}
		});
	},
	
	/*
	 * Init function which is called upon page load. Binds the WikiLove icon to opening the dialog.
	 */
	init: function() {
		if( typeof $.wikiLoveOptions == 'function' ) options = $.wikiLoveOptions();
		
		var $wikiLoveLink = $( '#ca-wikilove' ).find( 'a' );
		$wikiLoveLink.unbind( 'click' );
		$wikiLoveLink.click( function( e ) {
			$.wikiLove.openDialog();
			e.preventDefault();
		});
	}
	
	/*
	 * This is a bit of a hack to show some random images. A predefined set of image infos are
	 * retrieved using the API. Then we randomise this set ourselves and select some images to
	 * show. Eventually we probably want to make a custom API call that does this properly and
	 * also allows for using remote galleries such as Commons, which is now prohibited by JS.
	 *
	 * For now this function is disabled. It also shares code with the current gallery function,
	 * so when enabling it again it should be implemented cleaner with a custom API call, and
	 * without duplicate code between functions
	 */
	/*
	makeGallery: function() {
		$( '#mw-wikilove-gallery-content' ).html( '' );
		gallery = {};
		$( '#mw-wikilove-gallery-spinner' ).fadeIn( 200 );
		
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action'      : 'query',
				'format'      : 'json',
				'prop'        : 'imageinfo',
				'iiprop'      : 'mime|url',
				'iiurlwidth'  : currentTypeOrSubtype.gallery.width,
				'generator'   : 'categorymembers',
				'gcmtitle'    : currentTypeOrSubtype.gallery.category,
				'gcmnamespace': 6,
				'gcmsort'     : 'timestamp',
				'gcmlimit'    : currentTypeOrSubtype.gallery.total
			},
			dataType: 'json',
			type: 'POST',
			success: function( data ) {
				// clear
				$( '#mw-wikilove-gallery-content' ).html( '' );
				gallery = {};
				
				// if we have any images at all
				if( data.query) {
					// get the page keys which are just ids
					var keys = Object.keys( data.query.pages );
					
					// try to find "num" images to show
					for( var i=0; i<currentTypeOrSubtype.gallery.num; i++ ) {
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
									.attr( 'width', currentTypeOrSubtype.gallery.width )
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
											$( '#mw-wikilove-image' ).val( gallery[$( this ).attr( 'id' )] );
										})
								);
								
								// save the page title into an array so we know which image id maps to which title
								gallery['mw-wikilove-gallery-img-' + i] = page.title;
								break;
							}
						}
					}
				}
				if( gallery.length <= 0 ) {
					$( '#mw-wikilove-gallery' ).hide();
					$( '#mw-wikilove-gallery-label' ).hide();
				}
				
				$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
			}
		});
	},
	*/
};

}());

$( document ).ready( $.wikiLove.init );
} ) ( jQuery );
