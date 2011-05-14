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
					text: '{{subst:The Original Barnstar|$1}}', // message text, $1 is replaced by the user message
					template: 'The Original Barnstar', // template that is used, for statistics
					message: 'Hello '+wgTitle+'!\n\nI just awarded you a barnstar.' // message to use in email notification
				},
				'special': {
					title: null, // no predefined title, allows the user to enter a title
					descr: 'Special barnstar',
					text: '{{subst:The Special Barnstarl|$1}}',
					template: 'The Special Barnstar',
					message: 'Hello '+wgTitle+'!\n\nI just awarded you the special barnstar.'
				}
			},
			email: true, // add email notices as an option for each award of this type
			icon: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/extensions/WikiLove/images/icons/wikilove-icon-barnstar.png'
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
	
	/*
	 * Opens the dialog and builds it if necessary.
	 */
	openDialog: function() {
		if ( $.wikiLove.$dialog === null ) {
			// Find out if we can email the user
			$.wikiLove.getEmailable();
			// Build a type list like this:
			// <ul id="wlTypes">
			//   <li tabindex="0"><span>Barnstar</span></li>
			//   <li tabindex="0"><span>Make your own</span></li>
			// </ul>
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
				$typeList.append( $( '<li></li>' ).append( $button ) );
			}
			
			// Build the left menu for selecting a type:
			// <div id="wlSelectType">
			//   <h3>Select Type:</h3>
			//   <ul id="wlTypes">...</ul>
			// </div>
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
			// <div id="wlAddDetails">
			//   <h3>Add Details:</h3>
			//
			//   <label for="wlSubtype" id="wlSubtypeLabel">...</label>   (label depends on type)
			//   <select id="wlSubtype">...</select>                      (also depends on type)
			//
			//   <label for="wlTitle" id="wlTitleLabel">Title:</label>    (hidden for some (sub)types)
			//   <input type="text" class="text" id="wlTitle"/>
			//
			//   <label for="wlMessage" id="wlMessageLabel">Enter a message:</label>
			//   <span class="wlOmitSig">(without a signature)</span>     (this span floats right)
			//   <textarea id="wlMessage"></textarea>                     (textarea grows automatically with content)
			//
			//   <input id="wlButtonPreview" class="submit" type="submit" value="Preview"/>
			//   <img class="wlSpinner" src="..."/>                       (spinner for the preview button)
			// </div>
			var $addDetails = $( '<div id="wlAddDetails"></div>' )
				.append( '<span class="wlNumber">2</span>' )
				.append( '<h3>' + mw.msg( 'wikilove-add-details' ) + '</h3>' )
				.append( '<label for="wlSubtype" id="wlSubtypeLabel"></label>' )
				.append( $( '<form id="wlPreviewForm"></form>' )
					.append( '<select id="wlSubtype"></select>' )				
					.append( '<label for="wlTitle" id="wlTitleLabel">' + mw.msg( 'wikilove-title' ) + '</label>'  )
					.append( '<input type="text" class="text" id="wlTitle"/>' )
					.append( '<label for="wlMessage" id="wlMessageLabel">' + mw.msg( 'wikilove-enter-message' ) + '</label>'  )
					.append( '<span class="wlOmitSig">' + mw.msg( 'wikilove-omit-sig' ) + '</span>'  )
					.append( '<textarea id="wlMessage"></textarea>' )
					.append( $('<div id="wlNotify"></div>').html('<input type="checkbox" id="wlNotifyCheckbox" name="notify"/> Notify user by email') )
					.append( '<input id="wlButtonPreview" class="submit" type="submit" value="'
						+ mw.msg( 'wikilove-button-preview' ) + '"/>' )
					.append( '<img class="wlSpinner" src="' + mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' )
						+ '/extensions/WikiLove/images/spinner.gif"/>' )
				)
				.hide();
			
			// Build the right bottom preview section
			// <div id="wlPreview">
			//   <h3>Preview:</h3>
			//   <div id="wlPreviewArea">...</div>                        (preview gets loaded here)
			//   <input id="wlButtonSend" class="submit" type="submit" value="Send WikiLove"/>
			//   <img class="wlSpinner" src="..."/>                       (another spinner for the send button)
			// </div>
			var $preview = $( '<div id="wlPreview"></div>' )
				.append( '<span class="wlNumber">3</span>' )
				.append( '<h3>' + mw.msg( 'wikilove-preview' ) + '</h3>' )
				.append( '<div id="wlPreviewArea"></div>' )
				.append( $( '<form id="wlSendForm"></form>' )
					.append( '<input id="wlButtonSend" class="submit" type="submit" value="'
						+ mw.msg( 'wikilove-button-send' ) + '"/>' )
					.append( '<img class="wlSpinner" src="' + mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' )
						+ '/extensions/WikiLove/images/spinner.gif"/>' )
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
	
	getEmailable: function() {
		// Test to see if the 'E-mail this user' link exists
		$.wikiLove.emailable = $('#t-emailuser').length ? true : false;
	},
	
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
		var title = '==' + $( '#wlTitle' ).val() + "==\n";
		var rawMessage = $( '#wlMessage' ).val();
		// If there isn't a signature already in the message, add one to the end.
		if ( rawMessage.indexOf( '~~~' ) == -1 ) {
			rawMessage += ' ~~~~';
		}
		var msg = $.wikiLove.currentTypeOrSubtype.text.replace( '$1', rawMessage );
		$.wikiLove.doPreview( title + msg );
		$.wikiLove.previewData = {
			'title': title,
			'msg': msg,
			'type': $.wikiLove.currentTypeId
				+ ($.wikiLove.currentSubtypeId != null ? '-' + $.wikiLove.currentSubtypeId : ''),
			'template': $.wikiLove.currentTypeOrSubtype.template,
			'notify': $( '#wlNotifyCheckbox:checked' ).val()
		};
		return false;
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
				mw.log( data );
				mw.log( 'wgPageName: ' + mw.config.get( 'wgPageName' ) );
				
				if ( notify && $.wikiLove.emailable ) {
					$.wikiLove.sendEmail( $.wikiLove.currentTypeOrSubtype.title, $.wikiLove.currentTypeOrSubtype.message );
				}
				
				$( '#wlPreview .wlSpinner' ).fadeOut( 200 );
				
				if ( typeof data.redirect !== 'undefined'
					&&  data.redirect.pageName == mw.config.get( 'wgPageName' ) ) {
					// unfortunately, when on the talk page we cannot reload and then
					// jump to the correct section, because when we set the hash (#...)
					// the page won't reload...
					window.location.reload();
				}
				else if ( typeof data.error !== 'undefined' ) {
					$( '<div class="wlError">' + data.error.info + '<div>' ).insertBefore( '#wlSendForm' );
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
