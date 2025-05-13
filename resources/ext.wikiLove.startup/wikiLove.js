/* eslint-disable no-jquery/no-global-selector */
const overlayContainer = document.createElement( 'div' );
const WikiLoveDialog = require( './WikiLoveDialog.vue' );
const Vue = require( 'vue' );
let options = {}, // options modifiable by the user
	currentTypeId = null, // id of the currently selected type (e.g. 'barnstar' or 'makeyourown')
	currentSubtypeId = null, // id of the currently selected subtype (e.g. 'original' or 'special')
	currentTypeOrSubtype = null, // content of the current (sub)type (i.e. an object with title, descr, text, etc.)
	rememberData = null, // input data to remember when switching types or subtypes
	emailable = false, // whether or not the target user is emailable
	redirect = true, // whether or not to redirect the user to the WikiLove message after it has been posted
	targets = []; // the recipients of the WikiLove
const maxRecipients = 10; // maximum number of simultaneous recipients
let gallery = {};
const api = new mw.Api();

module.exports = {
	/**
	 * Opens the dialog and builds it if necessary.
	 *
	 * @param {string[]} recipients Usernames of recipients (without namespace prefix)
	 * @param {string[]} [extraTags] Extra tags to apply
	 */
	openDialog: function ( recipients, extraTags ) {
		let type, typeId, $button;
		// If a list of recipients are specified, this will override the normal
		// behavior of WikiLove, which is to post on the Talk page of the
		// current page. It will also disable redirecting the user after submitting.
		if ( recipients ) {
			if ( recipients.length > maxRecipients ) {
				// TODO: Don't use window.alert
				// eslint-disable-next-line no-alert
				alert( mw.msg( 'wikilove-err-max-exceeded', maxRecipients ) );
				return;
			}
			targets = recipients;
			redirect = false;
			// TODO: See if recipients are emailable
		} else {
			targets.push( mw.config.get( 'wgTitle' ) );
			// Test to see if the 'E-mail this user' link exists
			emailable = !!$( '#t-emailuser' ).length;
		}

		options.extraTags = extraTags || [];

		// Build a type list like this:
		const $typeList = $( '<ul>' ).attr( 'id', 'mw-wikilove-types' );
		for ( typeId in options.types ) {
			type = options.types[ typeId ];
			if ( !$.isPlainObject( type ) ) {
				continue;
			}
			$button = $( '<a>' ).attr( 'href', '#' );

			if ( typeof type.icon === 'string' ) {
				$button.append( $( '<img>' ).attr( 'src', type.icon ) );
			} else {
				$button.addClass( 'mw-wikilove-no-icon' );
			}

			$button.append( $( '<span>' ).text( type.name ) );

			$button.data( 'typeId', typeId );
			$typeList.append( $( '<li>' ).append( $button ) );
		}

		const commonsLink = mw.html.element( 'a', {
			href: mw.msg( 'wikilove-commons-url' ),
			target: '_blank'
		}, mw.msg( 'wikilove-commons-link' ) );
		const termsLink = mw.html.element( 'a', {
			href: mw.msg( 'wikilove-terms-url' ),
			target: '_blank'
		}, mw.msg( 'wikilove-terms-link' ) );

		overlayContainer.classList.add( 'wikilove-overlay-container' );
		overlayContainer.style.display = '';

		if ( overlayContainer.parentNode ) {
			return;
		}
		// render.
		document.body.appendChild( overlayContainer );
		Vue.createMwApp( WikiLoveDialog, {
			commonsLink,
			termsLink,
			onClose: () => {
				this.reset();
			}
		} ).mount( overlayContainer );

		// @todo: Move logic to WikiLoveDialog.vue
		$( '#mw-wikilove-add-details' ).hide();
		$( '#mw-wikilove-preview' ).hide();
		$( '#mw-wikilove-anon-warning' ).hide();
		$( '#mw-wikilove-types' ).replaceWith( $typeList );
		$( '#mw-wikilove-gallery-error-again' ).on( 'click', $.wikiLove.showGallery );
		$( '#mw-wikilove-types a' ).on( 'click', $.wikiLove.clickType );
		$( '#mw-wikilove-subtype' ).on( 'change', $.wikiLove.changeSubtype );
		$( '#mw-wikilove-preview-form' ).on( 'submit', $.wikiLove.validatePreviewForm );
		$( '#mw-wikilove-send-form' ).on( 'click', $.wikiLove.submitSend );

		if ( mw.util.isIPAddress( mw.config.get( 'wikilove-recipient' ) ) ||
			mw.util.isTemporaryUser( mw.config.get( 'wikilove-recipient' ) )
		) {
			$( '#mw-wikilove-anon-warning' ).show();
		}

		// When the image changes, we want to reset the preview and error message.
		$( '#mw-wikilove-image' ).on( 'change', () => {
			$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
			$( '#mw-wikilove-preview' ).hide();
		} );
	},

	/**
	 * Handler for the left menu. Selects a new type and initialises next section
	 * depending on whether or not to show subtypes.
	 *
	 * @param {jQuery.Event} e Click event
	 */
	clickType: function ( e ) {
		let subtypeId, subtype;
		const newTypeId = $( this ).data( 'typeId' );

		e.preventDefault();
		$.wikiLove.rememberInputData(); // remember previously entered data
		$( '#mw-wikilove-get-started' ).hide(); // always hide the get started section

		if ( currentTypeId !== newTypeId ) { // only do stuff when a different type is selected
			currentTypeId = newTypeId;
			currentSubtypeId = null; // reset the subtype id

			$( '#mw-wikilove-types' ).find( 'a' ).removeClass( 'selected' );
			$( this ).addClass( 'selected' ); // highlight the new type in the menu

			if ( typeof options.types[ currentTypeId ].subtypes === 'object' ) {
				// we're dealing with subtypes here
				currentTypeOrSubtype = null; // reset the (sub)type object until a subtype is selected
				$( '#mw-wikilove-subtype' ).empty(); // clear the subtype menu

				for ( subtypeId in options.types[ currentTypeId ].subtypes ) {
					// add all the subtypes to the menu while setting their subtype ids in jQuery data
					subtype = options.types[ currentTypeId ].subtypes[ subtypeId ];
					if ( typeof subtype.option !== 'undefined' ) {
						$( '#mw-wikilove-subtype' ).append(
							$( '<option>' ).text( subtype.option ).data( 'subtypeId', subtypeId )
						);
					}
				}
				$( '#mw-wikilove-subtype' ).show();

				// change and show the subtype label depending on the type
				$( '#mw-wikilove-subtype-label' ).text(
					options.types[ currentTypeId ].select || mw.msg( 'wikilove-select-type' )
				);
				$( '#mw-wikilove-subtype-label' ).show();
				$.wikiLove.changeSubtype(); // update controls depending on the currently selected (i.e. first) subtype
			} else {
				// there are no subtypes, just use this type for the current (sub)type
				currentTypeOrSubtype = options.types[ currentTypeId ];
				$( '#mw-wikilove-subtype' ).hide();
				$( '#mw-wikilove-subtype-label' ).hide();
				$( '#mw-wikilove-image-preview' ).hide();
				$.wikiLove.updateAllDetails(); // update controls depending on this type
			}

			$( '#mw-wikilove-add-details' ).show();
			$( '#mw-wikilove-preview' ).hide();
		}
	},

	/**
	 * Handler for changing the subtype.
	 */
	changeSubtype: function () {
		// eslint-disable-next-line no-jquery/no-sizzle
		const newSubtypeId = $( '#mw-wikilove-subtype option:selected' ).first().data( 'subtypeId' );

		$.wikiLove.rememberInputData(); // remember previously entered data

		// find out which subtype is selected
		if ( currentSubtypeId !== newSubtypeId ) { // only change stuff when a different subtype is selected
			currentSubtypeId = newSubtypeId;
			currentTypeOrSubtype = options.types[ currentTypeId ]
				.subtypes[ currentSubtypeId ];

			if ( currentTypeOrSubtype.gallery === undefined && currentTypeOrSubtype.image ) { // not a gallery
				$.wikiLove.showImagePreview();
			} else {
				$( '#mw-wikilove-image-preview' ).hide();
			}

			$.wikiLove.updateAllDetails();
			$( '#mw-wikilove-preview' ).hide();
		}
	},

	/**
	 * Remember data the user entered if it is different from the default.
	 */
	rememberInputData: function () {
		if ( rememberData === null ) {
			rememberData = {
				header: '',
				title: '',
				message: '',
				image: ''
			};
		}
		if ( currentTypeOrSubtype !== null ) {
			if ( currentTypeOrSubtype.fields.includes( 'header' ) &&
				( !currentTypeOrSubtype.header || $( '#mw-wikilove-header' ).val() !== currentTypeOrSubtype.header )
			) {
				rememberData.header = $( '#mw-wikilove-header' ).val();
			}
			if ( currentTypeOrSubtype.fields.includes( 'title' ) &&
				( !currentTypeOrSubtype.title || $( '#mw-wikilove-title' ).val() !== currentTypeOrSubtype.title )
			) {
				rememberData.title = $( '#mw-wikilove-title' ).val();
			}
			if ( currentTypeOrSubtype.fields.includes( 'message' ) &&
				( !currentTypeOrSubtype.message || $( '#mw-wikilove-message' ).val() !== currentTypeOrSubtype.message )
			) {
				rememberData.message = $( '#mw-wikilove-message' ).val();
			}
			if ( currentTypeOrSubtype.gallery === undefined && currentTypeOrSubtype.fields.includes( 'image' ) &&
				( !currentTypeOrSubtype.image || $( '#mw-wikilove-image' ).val() !== currentTypeOrSubtype.image )
			) {
				rememberData.image = $( '#mw-wikilove-image' ).val();
			}
		}
	},

	/**
	 * Show a preview of the image for a subtype.
	 */
	showImagePreview: function () {
		let $img;
		const title = $.wikiLove.normalizeFilename( currentTypeOrSubtype.image );
		const loadingType = currentTypeOrSubtype;
		$( '#mw-wikilove-image-preview' ).show();
		$( '#mw-wikilove-image-preview-content' ).empty();
		// TODO: Use CSS transitions
		// eslint-disable-next-line no-jquery/no-fade
		$( '#mw-wikilove-image-preview-spinner' ).fadeIn( 200 );
		api.post( {
			formatversion: 2,
			action: 'query',
			prop: 'imageinfo',
			iiprop: 'mime|url',
			titles: title,
			iiurlwidth: 75,
			iiurlheight: 68
		} )
			.done( ( data ) => {
				if ( !data || !data.query || !data.query.pages ) {
					// TODO: Use CSS transitions
					// eslint-disable-next-line no-jquery/no-fade
					$( '#mw-wikilove-image-preview-spinner' ).fadeOut( 200 );
					return;
				}
				if ( loadingType !== currentTypeOrSubtype ) {
					return;
				}
				data.query.pages.forEach( ( page ) => {
					if ( page.imageinfo && page.imageinfo.length ) {
						// build an image tag with the correct url
						$img = $( '<img>' )
							.attr( 'src', page.imageinfo[ 0 ].thumburl )
							.hide()
							.on( 'load', function () {
								$( '#mw-wikilove-image-preview-spinner' ).hide();
								$( this ).css( 'display', 'inline-block' );
							} );
						$( '#mw-wikilove-image-preview-content' ).append( $img );
					}
				} );
			} )
			.fail( () => {
				// TODO: Use CSS transitions
				// eslint-disable-next-line no-jquery/no-fade
				$( '#mw-wikilove-image-preview-spinner' ).fadeOut( 200 );
			} );
	},

	/**
	 * Called when type or subtype changes, updates controls.
	 */
	updateAllDetails: function () {
		// use remembered data for fields that can be set by the user
		const currentRememberData = {
			header: ( currentTypeOrSubtype.fields.includes( 'header' ) ? rememberData.header : '' ),
			title: ( currentTypeOrSubtype.fields.includes( 'title' ) ? rememberData.title : '' ),
			message: ( currentTypeOrSubtype.fields.includes( 'message' ) ? rememberData.message : '' ),
			image: ( currentTypeOrSubtype.fields.includes( 'image' ) ? rememberData.image : '' )
		};

		$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();

		// only show the description if it exists for this type or subtype
		if ( typeof currentTypeOrSubtype.descr === 'string' ) {
			// Replace {{SITENAME}} in messages. Yes, we could have mediawiki.jqueryMsg
			// handle this, but this is a much more lightweight solution.
			currentTypeOrSubtype.descr = currentTypeOrSubtype.descr.replace( /\{\{SITENAME\}\}/g, mw.config.get( 'wgSiteName' ) );
			$( '#mw-wikilove-subtype-description' ).text( currentTypeOrSubtype.descr );
			$( '#mw-wikilove-subtype-description' ).show();
		} else {
			$( '#mw-wikilove-subtype-description' ).hide();
		}

		// show or hide header label and textbox depending on fields configuration
		$( '#mw-wikilove-header, #mw-wikilove-header-label' )
			.toggle( currentTypeOrSubtype.fields.includes( 'header' ) );

		// set the new text for the header textbox
		$( '#mw-wikilove-header' ).val( currentRememberData.header || currentTypeOrSubtype.header || '' );

		// show or hide title label and textbox depending on fields configuration
		$( '#mw-wikilove-title, #mw-wikilove-title-label' )
			.toggle( currentTypeOrSubtype.fields.includes( 'title' ) );

		// set the new text for the title textbox
		$( '#mw-wikilove-title' ).val( currentRememberData.title || currentTypeOrSubtype.title || '' );

		// show or hide image label and textbox depending on fields configuration
		$( '#mw-wikilove-image, #mw-wikilove-image-label, #mw-wikilove-image-note, #mw-wikilove-commons-text' )
			.toggle( currentTypeOrSubtype.fields.includes( 'image' ) );

		// set the new text for the image textbox
		$( '#mw-wikilove-image' ).val( currentRememberData.image || currentTypeOrSubtype.image || '' );

		if ( typeof currentTypeOrSubtype.gallery === 'object' &&
			Array.isArray( currentTypeOrSubtype.gallery.imageList )
		) {
			$( '#mw-wikilove-gallery, #mw-wikilove-gallery-label' ).show();
			$.wikiLove.showGallery(); // build gallery from array of images
		} else {
			$( '#mw-wikilove-gallery, #mw-wikilove-gallery-label' ).hide();
		}

		// show or hide message label and textbox depending on fields configuration
		$( '#mw-wikilove-message, #mw-wikilove-message-label, #mw-wikilove-message-note' )
			.toggle( currentTypeOrSubtype.fields.includes( 'message' ) );

		// set the new text for the message textbox
		$( '#mw-wikilove-message' ).val( currentRememberData.message || currentTypeOrSubtype.message || '' );

		if ( currentTypeOrSubtype.fields.includes( 'notify' ) && emailable ) {
			$( '#mw-wikilove-notify' ).show();
		} else {
			$( '#mw-wikilove-notify' ).hide();
			$( '#mw-wikilove-notify-checkbox' ).prop( 'checked', false );
		}
	},

	/**
	 * Handler for clicking the preview button.
	 *
	 * @param {jQuery.Event} e Click event
	 * @return {boolean} Event propagates
	 */
	validatePreviewForm: function ( e ) {
		let imageTitle;

		e.preventDefault();
		$( '#mw-wikilove-success' ).hide();
		$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
		$( '#mw-wikilove-preview' ).hide();

		// Check for a header if it is required
		if ( currentTypeOrSubtype.fields.includes( 'header' ) && $( '#mw-wikilove-header' ).val().length === 0 ) {
			$.wikiLove.showAddDetailsError( 'wikilove-err-header' );
			return false;
		}

		// Check for a title if it is required, and otherwise use the header text
		if ( currentTypeOrSubtype.fields.includes( 'title' ) && $( '#mw-wikilove-title' ).val().length === 0 ) {
			$( '#mw-wikilove-title' ).val( $( '#mw-wikilove-header' ).val() );
		}

		if ( currentTypeOrSubtype.fields.includes( 'message' ) ) {
			// Check for a message if it is required
			if ( $( '#mw-wikilove-message' ).val().length <= 0 ) {
				$.wikiLove.showAddDetailsError( 'wikilove-err-msg' );
				return false;
			}
			// If there's a signature already in the message, throw an error
			if ( $( '#mw-wikilove-message' ).val().includes( '~~~' ) ) {
				$.wikiLove.showAddDetailsError( 'wikilove-err-sig' );
				return false;
			}
		}

		// Split image validation depending on whether or not it is a gallery
		if ( typeof currentTypeOrSubtype.gallery === 'undefined' ) { // not a gallery
			if ( currentTypeOrSubtype.fields.includes( 'image' ) ) { // asks for an image
				if ( $( '#mw-wikilove-image' ).val().length === 0 ) { // no image entered
					// Give them the default image and continue with preview.
					$( '#mw-wikilove-image' ).val( options.defaultImage );
					$.wikiLove.submitPreview();
				} else { // image was entered by user
					// Make sure the image exists
					imageTitle = $.wikiLove.normalizeFilename( $( '#mw-wikilove-image' ).val() );
					// TODO: Use CSS transitions
					// eslint-disable-next-line no-jquery/no-fade
					$( '#mw-wikilove-preview-spinner' ).fadeIn( 200 );

					api.get( {
						formatversion: 2,
						action: 'query',
						titles: imageTitle,
						prop: 'imageinfo'
					} )
						.done( ( data ) => {
							const page = data.query.pages[ 0 ];
							// See if image exists locally or through InstantCommons
							if ( !page.missing || page.imageinfo ) {
								// Image exists
								$.wikiLove.submitPreview();
							} else {
								// Image does not exist
								$.wikiLove.showAddDetailsError( 'wikilove-err-image-bad' );
								// TODO: Use CSS transitions
								// eslint-disable-next-line no-jquery/no-fade
								$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
							}
						} )
						.fail( () => {
							$.wikiLove.showAddDetailsError( 'wikilove-err-image-api' );
							// TODO: Use CSS transitions
							// eslint-disable-next-line no-jquery/no-fade
							$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
						} );
				}
			} else { // doesn't ask for an image
				$.wikiLove.submitPreview();
			}
		} else { // a gallery
			if ( $( '#mw-wikilove-image' ).val().length === 0 ) { // no image selected
				// Display an error telling them to select an image.
				$.wikiLove.showAddDetailsError( 'wikilove-err-image' );
				return false;
			} else { // image was selected
				$.wikiLove.submitPreview();
			}
		}
		return true;
	},

	/**
	 * After the form is validated, perform preview.
	 */
	submitPreview: function () {
		const text = $.wikiLove.prepareMsg( currentTypeOrSubtype.text || options.types[ currentTypeId ].text || options.defaultText );
		$.wikiLove.doPreview( text, $( '#mw-wikilove-header' ).val() );
	},

	showAddDetailsError: function ( errmsg ) {
		// eslint-disable-next-line mediawiki/msg-doc
		$( '#mw-wikilove-add-details' ).append( $( '<div>' ).addClass( 'mw-wikilove-error' ).text( mw.msg( errmsg ) ) );
	},

	showPreviewError: function ( errmsg ) {
		// eslint-disable-next-line mediawiki/msg-doc
		$( '#mw-wikilove-preview' ).append( $( '<div>' ).addClass( 'mw-wikilove-error' ).text( mw.msg( errmsg ) ) );
	},

	showSuccessMsg: function ( msg ) {
		$( '#mw-wikilove-success' ).text( msg ).show();
	},

	/**
	 * Prepares a message or e-mail body by replacing placeholders.
	 * $1: message entered by the user
	 * $2: title of the item
	 * $3: title of the image
	 * $4: image size
	 * $5: background color
	 * $6: border color
	 * $7: username of the recipient
	 *
	 * @param {string} msg Message with placeholders
	 * @return {string} Prepared message
	 */
	prepareMsg: function ( msg ) {
		msg = msg.replace( '$1', $( '#mw-wikilove-message' ).val() ); // replace the raw message
		msg = msg.replace( '$2', $( '#mw-wikilove-title' ).val() ); // replace the title
		msg = msg.replace( '$3', $.wikiLove.normalizeFilename( $( '#mw-wikilove-image' ).val() ) ); // replace the image
		msg = msg.replace( '$4', currentTypeOrSubtype.imageSize || options.defaultImageSize ); // replace the image size
		msg = msg.replace( '$5', currentTypeOrSubtype.backgroundColor || options.defaultBackgroundColor ); // replace the background color
		msg = msg.replace( '$6', currentTypeOrSubtype.borderColor || options.defaultBorderColor ); // replace the border color
		msg = msg.replace( '$7', '<nowiki>' + mw.config.get( 'wikilove-recipient', '' ) + '</nowiki>' ); // replace the username we're sending to
		msg = msg.replace( '$8', currentTypeOrSubtype.defaultColor || options.defaultColor ); // replace the text color

		return msg;
	},

	/**
	 * Normalize a filename.
	 * This function will extract a filename from a URL or add a "File:" prefix if there isn't
	 * already a media namespace prefix.
	 *
	 * @param {string} filename Filename or URL from user input
	 * @return {string} Normalized filename with prefix
	 */
	normalizeFilename: function ( filename ) {
		const title = mw.Title.newFromImg( { src: filename } ) || mw.Title.newFromText( filename, mw.config.get( 'wgNamespaceIds' ).file );
		if ( !title ) {
			return filename;
		}
		return title.getPrefixedText();
	},

	/**
	 * Fires AJAX request for previewing wikitext.
	 *
	 * @param {string} wikitext Body of the message
	 * @param {string} sectiontitle Title of the message
	 */
	doPreview: function ( wikitext, sectiontitle ) {
		// TODO: Use CSS transitions
		// eslint-disable-next-line no-jquery/no-fade
		$( '#mw-wikilove-preview-spinner' ).fadeIn( 200 );
		api.parse( wikitext, {
			prop: 'text',
			title: mw.config.get( 'wgPageName' ),
			section: 'new',
			sectiontitle: sectiontitle,
			disableeditsection: true,
			sectionpreview: true,
			pst: true
		} )
			.done( ( html ) => {
				$.wikiLove.showPreview( html );
				// TODO: Use CSS transitions
				// eslint-disable-next-line no-jquery/no-fade
				$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
			} )
			.fail( () => {
				$.wikiLove.showAddDetailsError( 'wikilove-err-preview-api' );
				// TODO: Use CSS transitions
				// eslint-disable-next-line no-jquery/no-fade
				$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
			} );
	},

	/**
	 * Callback for the preview function. Sets the preview area with the HTML and fades it in.
	 *
	 * @param {string} html HTML to preview
	 */
	showPreview: function ( html ) {
		$( '#mw-wikilove-preview-area' ).html( html );
		// TODO: Use CSS transitions
		// eslint-disable-next-line no-jquery/no-fade
		$( '#mw-wikilove-preview' ).fadeIn( 200 );
	},

	/**
	 * Handler for the send (final submit) button. Builds the data for the AJAX request.
	 * The type sent for statistics is 'typeId-subtypeId' when using subtypes,
	 * or simply 'typeId' otherwise.
	 *
	 * @param {jQuery.Event} e Click event
	 * @return {boolean} Event propagates
	 */
	submitSend: function ( e ) {
		e.preventDefault();
		$( '#mw-wikilove-success' ).hide();
		$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();

		// Check for a header if it is required
		if ( currentTypeOrSubtype.fields.includes( 'header' ) && $( '#mw-wikilove-header' ).val().length === 0 ) {
			$.wikiLove.showAddDetailsError( 'wikilove-err-header' );
			return false;
		}

		// Check for a title if it is required, and otherwise use the header text
		if ( currentTypeOrSubtype.fields.includes( 'title' ) && $( '#mw-wikilove-title' ).val().length === 0 ) {
			$( '#mw-wikilove-title' ).val( $( '#mw-wikilove-header' ).val() );
		}

		if ( currentTypeOrSubtype.fields.includes( 'message' ) ) {
			// If there's a signature already in the message, throw an error
			if ( $( '#mw-wikilove-message' ).val().includes( '~~~' ) ) {
				$.wikiLove.showAddDetailsError( 'wikilove-err-sig' );
				return false;
			}
		}

		// We don't need to do any image validation here since its not actually possible to click
		// Send WikiLove without having a valid image entered.

		const submitData = {
			header: $( '#mw-wikilove-header' ).val(),
			text: $.wikiLove.prepareMsg( currentTypeOrSubtype.text || options.types[ currentTypeId ].text || options.defaultText ),
			message: $( '#mw-wikilove-message' ).val(),
			type: currentTypeId + ( currentSubtypeId !== null ? '-' + currentSubtypeId : '' ),
			extraTags: options.extraTags
		};
		if ( $( '#mw-wikilove-notify-checkbox:checked' ).val() && emailable ) {
			submitData.email = $.wikiLove.prepareMsg( currentTypeOrSubtype.email );
		}
		$.wikiLove.doSend( submitData.header, submitData.text,
			submitData.message, submitData.type, submitData.email, submitData.extraTags );
		return true;
	},

	/**
	 * Fires the final AJAX request and then redirects to the talk page where the content is added.
	 *
	 * @param {string} subject Subject
	 * @param {string} wikitext Wikitext
	 * @param {string} message Message
	 * @param {string} type Type ID
	 * @param {string} email E-mail
	 * @param {string[]} extraTags Additional tags to apply to the edit
	 */
	doSend: function ( subject, wikitext, message, type, email, extraTags ) {
		let targetBaseUrl, currentBaseUrl,
			wikiLoveNumberAttempted = 0,
			wikiLoveNumberPosted = 0;

		// TODO: Use CSS transitions
		// eslint-disable-next-line no-jquery/no-fade
		$( '#mw-wikilove-send-spinner' ).fadeIn( 200 );

		// If the talk page is not a Wikitext page, remove the signature
		if ( mw.config.get( 'wgPageContentModel' ) !== 'wikitext' ) {
			wikitext = wikitext.replace( /\s*~~~~/, '' );
		}

		targets.forEach( ( target ) => {
			const sendData = {
				action: 'wikilove',
				title: 'User:' + target,
				type: type,
				text: wikitext,
				message: message,
				subject: subject,
				tags: extraTags
			};

			if ( email ) {
				sendData.email = email;
			}
			api.postWithToken( 'csrf', sendData )
				.done( ( data ) => {
					wikiLoveNumberAttempted++;
					if ( wikiLoveNumberAttempted === targets.length ) {
						// TODO: Use CSS transitions
						// eslint-disable-next-line no-jquery/no-fade
						$( '#mw-wikilove-send-spinner' ).fadeOut( 200 );
					}

					if ( data.error !== undefined ) {
						if ( data.error.info === 'Invalid token' ) {
							$.wikiLove.showPreviewError( 'wikilove-err-invalid-token' );
						} else {
							$.wikiLove.showPreviewError( 'wikilove-err-send-api' );
						}
						return;
					}

					if ( data.redirect !== undefined ) {
						wikiLoveNumberPosted++;
						if ( redirect ) {
							targetBaseUrl = mw.util.getUrl( data.redirect.pageName );
							// currentBaseUrl is the current URL minus the hash fragment
							currentBaseUrl = location.href.split( '#' )[ 0 ];

							// Set window location to user talk page URL + WikiLove anchor hash.
							// Unfortunately, in the most common scenario (starting from the user talk
							// page) this won't reload the page since the browser will simply try to jump
							// to the anchor within the existing page (which doesn't exist). This does,
							// however, prepare us for the subsequent reload, making sure that the user is
							// directed to the WikiLove message instead of just being left at the top of
							// the page. In the case that we are starting from a different page, this sends
							// the user immediately to the new WikiLove message on the user talk page.
							location.href = targetBaseUrl + '#' + data.redirect.fragment; // data.redirect.fragment is already encoded

							// If we were already on the user talk page, then reload the page so that the
							// new WikiLove message is displayed.
							// @todo: an expandUrl() would be very nice indeed!
							if (
								mw.config.get( 'wgServer' ) + targetBaseUrl === currentBaseUrl ||
								// Compatibility with protocol-relative URLs in MediaWiki 1.18+
								location.protocol + mw.config.get( 'wgServer' ) + targetBaseUrl === currentBaseUrl
							) {
								location.reload();
							}
						} else {
							$.wikiLove.showSuccessMsg( mw.msg( 'wikilove-success-number', wikiLoveNumberPosted ) );
							// If there were no errors, close the dialog and reset WikiLove
							if ( wikiLoveNumberPosted === targets.length ) {
								setTimeout( () => {
									this.reset();
								}, 1000 );
							}
						}
					} else { // API did not return appropriate information
						$.wikiLove.showPreviewError( 'wikilove-err-send-api' );
					}
				} )
				.fail( () => {
					$.wikiLove.showPreviewError( 'wikilove-err-send-api' );
					wikiLoveNumberAttempted++;
					if ( wikiLoveNumberAttempted === targets.length ) {
						// TODO: Use CSS transitions
						// eslint-disable-next-line no-jquery/no-fade
						$( '#mw-wikilove-send-spinner' ).fadeOut( 200 );
					}
				} );
		} );
	},

	/**
	 * Hides the WikiLove overlay. The overlay is retained in the DOM for future clicks.
	 */
	reset: function () {
		overlayContainer.style.display = 'none';
	},

	/**
	 * This function is called if the gallery is an array of images. It retrieves the image
	 * thumbnails from the API, and constructs a thumbnail gallery with them.
	 */
	showGallery: function () {
		let i, id, index, loadingIndex, galleryNumber, $img;
		const titles = [];
		const imageList = currentTypeOrSubtype.gallery.imageList.slice();

		$( '#mw-wikilove-gallery-content' ).empty();
		gallery = {};
		// TODO: Use CSS transitions
		// eslint-disable-next-line no-jquery/no-fade
		$( '#mw-wikilove-gallery-spinner' ).fadeIn( 200 );
		$( '#mw-wikilove-gallery-error' ).hide();

		if (
			currentTypeOrSubtype.gallery.number === undefined ||
			currentTypeOrSubtype.gallery.number <= 0
		) {
			currentTypeOrSubtype.gallery.number = currentTypeOrSubtype.gallery.imageList.length;
		}

		for ( i = 0; i < currentTypeOrSubtype.gallery.number; i++ ) {
			// get a random image from imageList and add it to the list of titles to be retrieved
			id = Math.floor( Math.random() * imageList.length );
			titles.push( $.wikiLove.normalizeFilename( imageList[ id ] ) );

			// remove the randomly selected image from imageList so that it can't be added twice
			imageList.splice( id, 1 );
		}

		index = 0;
		const loadingType = currentTypeOrSubtype;
		loadingIndex = 0;
		api.post( {
			formatversion: 2,
			action: 'query',
			prop: 'imageinfo',
			iiprop: 'mime|url',
			titles: titles,
			iiurlwidth: currentTypeOrSubtype.gallery.width,
			iiurlheight: currentTypeOrSubtype.gallery.height
		} )
			.done( ( data ) => {
				if ( !data || !data.query || !data.query.pages ) {
					$( '#mw-wikilove-gallery-error' ).show();
					// TODO: Use CSS transitions
					// eslint-disable-next-line no-jquery/no-fade
					$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
					return;
				}

				if ( loadingType !== currentTypeOrSubtype ) {
					return;
				}
				galleryNumber = currentTypeOrSubtype.gallery.number;

				data.query.pages.forEach( ( page ) => {
					if ( page.imageinfo && page.imageinfo.length ) {
						// build an image tag with the correct url
						$img = $( '<img>' )
							.attr( 'src', page.imageinfo[ 0 ].thumburl )
							.hide()
							.on( 'load', function () {
								$( this ).css( 'display', 'inline-block' );
								loadingIndex++;
								if ( loadingIndex >= galleryNumber ) {
									// TODO: Use CSS transitions
									// eslint-disable-next-line no-jquery/no-fade
									$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
								}
							} );
						$( '#mw-wikilove-gallery-content' ).append(
							$( '<a>' )
								.attr( 'href', '#' )
								.attr( 'id', 'mw-wikilove-gallery-img-' + index )
								.append( $img )
								.on( 'click', function ( e ) {
									e.preventDefault();
									$( '#mw-wikilove-gallery a' ).removeClass( 'selected' );
									$( this ).addClass( 'selected' );
									$( '#mw-wikilove-image' ).val( gallery[ $( this ).attr( 'id' ) ] );
								} )
						);
						gallery[ 'mw-wikilove-gallery-img-' + index ] = page.title;
						index++;
					}
				} );
				// Pre-select first image
				/* $( '#mw-wikilove-gallery-img-0 img' ).trigger( 'click' ); */
			} )
			.fail( () => {
				$( '#mw-wikilove-gallery-error' ).show();
				// TODO: Use CSS transitions
				// eslint-disable-next-line no-jquery/no-fade
				$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
			} );
	},

	/**
	 * Init function which is called upon page load. Binds the WikiLove icon to opening the dialog.
	 */
	init: function () {
		let $wikiLoveLink = $( [] );
		options = $.wikiLoveOptions;

		if ( $( '#ca-wikilove' ).length ) {
			$wikiLoveLink = $( '#ca-wikilove' ).find( 'a' );
		} else { // legacy skins
			$wikiLoveLink = $( '#topbar a:contains(' + mw.msg( 'wikilove-tab-text' ) + ')' );
		}
		$wikiLoveLink.off( 'click' );
		$wikiLoveLink.on( 'click', ( e ) => {
			e.preventDefault();
			$.wikiLove.openDialog();
		} );
	}
};
