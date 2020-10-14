( function () {
	'use strict';

	var fields,
		errors = {},
		$cardErrors,
		$amount,
		$suggestedAmount,
		$btn,
		btnChargeEnabled = true,
		prefixErrCls = 'errcls-',
		validCCN = false,
		validCCV = false,
		validExp = false,
		validCHID = false,
		emptyCCN = true,
		emptyCCV = true,
		emptyExp = true,
		emptyCHID = true;

	function setFocusOnCCnumber() {
		var iframeCC = $( '#tranzi\\.credit_card_number' )[ 0 ];
		iframeCC.contentWindow.focus();
	}

	function toggleSubmitButton( forcedValue ) {
		btnChargeEnabled = forcedValue || !btnChargeEnabled;
		$btn.prop( 'disabled', !btnChargeEnabled );
	}

	function removeAllErrors() {
		$cardErrors.empty();
		errors = {};
	}

	function remErr( fld ) {
		delete errors[ fld ];
		$( '.' + prefixErrCls + fld ).remove();

		if ( Object.keys( errors ).length === 0 ) {
			toggleSubmitButton( true );
		}
	}

	function addErr( fld, err ) {
		remErr( fld );
		errors[ fld ] = err;
		$cardErrors.attr( 'role', 'alert' ).prepend( '<li class="' + prefixErrCls + fld + '">' + err + '</li>' );
		toggleSubmitButton( false );
	}

	function handleErrors( err ) {
		if ( Array.isArray( err ) ) {
			err.forEach( function ( errMsg ) {
				// $cardErrors.append('<p>' + errMsg.message + '</p>');
				addErr( errMsg.param, errMsg.message );
			} );
		} else {
			// $cardErrors.append('<p>' + errAll + '</p>');
			addErr( 'generic', err );
		}
	}

	function changeAmount( value ) {
		mw.log( 'amount changed: ' + value );
		$( '.btn-amount' ).text( value );
		remErr( 'amount' );
	}

	function validateAmount() {
		var amount, parsedAmount;

		amount = $suggestedAmount.is( ':checked' ) ? $suggestedAmount.filter( ':checked' ).val() : $amount.val();

		parsedAmount = parseInt( amount ); // Make sure it's an integer
		if ( !parsedAmount ) {
			addErr( 'amount', 'יש לבחור או להקליד סכום' );
		} else if ( parsedAmount < 5 ) {
			addErr( 'amount', 'יש להקליד סכום שלם - לפחות 5 ש"ח' );
		} else {
			// Success!
			changeAmount( parsedAmount );
			return true;
		}

		return false;
	}

	function chargeCCData() {
		validateAmount();

		fields.charge(
			{
				// expiry_month: $('#expiry').val().substring(0,2),
				// expiry_year: $('#expiry').val().substring(3,7),
				// eslint-disable-next-line camelcase
				terminal_name: 'kolzchut',
				amount: $suggestedAmount.is( ':checked' ) ? $suggestedAmount.filter( ':checked' ).val() : $amount.val(),
				// tokenize: true,
				// eslint-disable-next-line camelcase
				response_language: mw.config.get( 'wgContentLanguage' ) === 'he' ? 'hebrew' : 'english',
				subscribe: $( '#subscribe' ).val(),
				email: $( '#email' ).val()
			},
			function ( err, result ) {
				if (
					err.messages || result.errors || result.transaction_response.success === false
				) {
					toggleSubmitButton();
					handleErrors(
						err.messages || result.errors || result.transaction_response.error );
				} else {
					removeAllErrors();
					mw.notify( 'Payment charge success!' + result, { autoHide: false } );
					mw.log( 'Payment successful' + result );
				}
			}
		);
	}

	function registerDomEvents( $form ) {
		$cardErrors = $form.find( '.Card-Errors' );
		$amount = $form.find( '#amount' );
		$suggestedAmount = $form.find( 'input[name=suggested_amount]' );
		$btn = $form.find( '.donation-form .btn' );

		$form.find( '.donation-form' ).on( 'submit', function ( e ) {
			e.preventDefault();
			toggleSubmitButton( false );
			chargeCCData();
		} );

		$suggestedAmount.on( 'click', function () {
			$amount.val( '' );
			changeAmount( $suggestedAmount.filter( ':checked' ).val() );
		} );

		$amount.on( 'keypress', function () {
			$suggestedAmount.prop( 'checked', false );
		} );

		$amount.on( 'change', function () {
			// De-select the suggested amounts
			$suggestedAmount.prop( 'checked', false );
			validateAmount();
		} );
	}

	function initTranzilaHostedFields() {
		fields = TzlaHostedFields.create( {
			sandbox: false,
			styles: {
				input: {
					'background-color': 'transparent',
					border: 'none',
					display: 'block',
					'font-family': "Assistant, 'Helvetica Neue', Helvetica, Arial, sans-serif",
					margin: '0',
					// padding: '0',
					width: '100%',
					'font-size': '17px',
					'-webkit-font-smoothing': 'antialiased',
					'-moz-osx-font-smoothing': 'grayscale',
					color: '#32325d',
					position: 'absolute',
					'line-height': '24px',
					height: '24px',
					top: '0'
				},
				'input:-ms-input-placeholder': {
					opacity: '1',
					color: '#b9b9b9'
					// 'text-align': 'right'
				},
				'input::placeholder': {
					opacity: '1',
					color: '#b9b9b9'
					// 'text-align': 'right'
				},
				'input::-webkit-input-placeholder': {
					opacity: '1',
					color: '#b9b9b9'
					// 'text-align': 'right'
				},
				'input::-moz-placeholder': {
					opacity: '1',
					color: '#b9b9b9'
					// 'text-align': 'right'
				},

				'.hosted-fields-invalid:not(:focus)': {
					color: '#f00'
				}
			},

			fields: {
				// eslint-disable-next-line camelcase
				credit_card_number: {
					selector: '#credit_card_number',
					placeholder: 'xxxx xxxx xxxx xxxx'
					// tabindex: 1
				},
				cvv: {
					selector: '#cvv',
					placeholder: 'xxx'
					// tabindex: 4
				},
				// eslint-disable-next-line camelcase
				card_holder_id_number: {
					selector: '#card_holder_id_number',
					placeholder: 'xxxxxxxxx'
					// tabindex: 2
				},
				expiry: {
					selector: '#expiry',
					placeholder: 'MM/YY',
					version: '1'
					// tabindex: 3
				}
			}
		} );

		fields.onEvent( 'ready', function () {
			mw.log( 'ready01---' );
			$( '.donation-loading' ).hide();
			$( '.donation-form' ).removeClass( 'disabled' );
			setFocusOnCCnumber();
			toggleSubmitButton( true );
		} );

		fields.onEvent( 'focus', function ( event ) {
			var $focusedF = $( '#' + event.field );

			mw.log( 'focus01--- ' + event.field );
			$focusedF.addClass( 'focusedBorder' );
		} );

		fields.onEvent( 'validityChange', function ( event ) {
			mw.log( 'ready01---validityChange-' );

			switch ( event.field ) {
				case 'credit_card_number':
					validCCN = event.isValid;
					break;
				case 'cvv':
					validCCV = event.isValid;
					break;
				case 'expiry':
					validExp = event.isValid;
					break;
				case 'card_holder_id_number':
					validCHID = event.isValid;
					break;
			}

			// if (validCCN && validCCV && validExp && validCHID) {
			// $cardErrors.addClass("Display-None");
			// }
		} );

		fields.onEvent( 'empty', function ( event ) {
			mw.log( 'ready01---empty-' );

			switch ( event.field ) {
				case 'credit_card_number':
					emptyCCN = true;
					break;
				case 'cvv':
					emptyCCV = true;
					break;
				case 'expiry':
					emptyExp = true;
					break;
				case 'card_holder_id_number':
					emptyCHID = true;
					break;
			}
		} );

		fields.onEvent( 'notEmpty', function ( event ) {
			mw.log( 'ready01---empty-' );

			switch ( event.field ) {
				case 'credit_card_number':
					emptyCCN = false;
					break;
				case 'cvv':
					emptyCCV = false;
					break;
				case 'expiry':
					emptyExp = false;
					break;
				case 'card_holder_id_number':
					emptyCHID = false;
					break;
			}
		} );

		fields.onEvent( 'blur', function ( event ) {
			var $unfocusedF = $( '#' + event.field );

			mw.log( 'ready03---blur- ' + event.field );
			$unfocusedF.removeClass( 'focusedBorder' );

			switch ( event.field ) {
				case 'credit_card_number':
					if ( !validCCN && !emptyCCN ) {
						addErr( event.field, 'מספר כרטיס אשראי לא תקין' );
					} else {
						remErr( event.field );
					}
					break;
				case 'cvv':
					if ( !validCCV && !emptyCCV ) {
						addErr( event.field, 'CVV לא תקין' );
					} else {
						remErr( event.field );
					}
					break;
				case 'expiry':
					if ( !validExp && !emptyExp ) {
						addErr( event.field, 'תאריך תום תוקף כרטיס לא תקין' );
					} else {
						remErr( event.field );
					}
					break;
				case 'card_holder_id_number':
					if ( !validCHID && !emptyCHID ) {
						addErr( event.field, 'מספר תעודת זהות לקוח לא תקינה' );
					} else {
						remErr( event.field );
					}
					break;
			}
		} );

		fields.onEvent( 'inputSubmitRequest', function ( event ) {
			mw.log( 'ready04---keypress- ' + event.field );
		} );

		fields.onEvent( 'cardTypeChange', function ( event ) {
			mw.log( 'ready01---cardTypeChange- ' + event.cardType );
			$( '#card-img' ).attr( 'class', 'card-img-' + event.cardType );
		} );

	}

	function getForm() {
		var templateData,
			$el,
			defaultSum = 200, // Get this from config,
			defaultCurrency = '₪'; // Get this from config

		templateData = {
			sum: defaultSum,
			currency: defaultCurrency,
			'donation-btn-text': mw.msg( 'donation-btn-text', defaultSum, defaultCurrency ),
			'donation-newsletter-subscribe': mw.msg( 'donation-newsletter-subscribe' ),
			'donation-email': mw.msg( 'donation-email' ),
			'donation-cc-holder-id': mw.msg( 'donation-cc-holder-id' ),
			'donation-cc-cvv': mw.msg( 'donation-cc-cvv' ),
			'donation-cc-expiry-date': mw.msg( 'donation-cc-expiry-date' ),
			'donation-cc-number': mw.msg( 'donation-cc-number' ),
			'donation-amount-other': mw.msg( 'donation-amount-other' ),
			'donation-freq-once': mw.msg( 'donation-freq-once' ),
			'donation-freq-monthly': mw.msg( 'donation-freq-monthly' ),
			'donation-freq-annually': mw.msg( 'donation-freq-annually' ),
			'donation-thank-you': mw.msg( 'donation-thank-you' )
		};

		$el = mw.template.get( 'ext.donation.bootstrap', 'donationForm.mustache' )
			.render( templateData );

		return $el;
	}

	$.ajaxSetup( {
		cache: true
	} );
	$.getScript( 'https://hf.tranzila.com/assets/js/thostedf.js' )
		.done( function ( script, textStatus ) {
			var $form = getForm();
			registerDomEvents( $form );
			$form.appendTo( '#bodyContent' );
			initTranzilaHostedFields();
		} );

	/*
		recordGAEvent: function (type, optionalValue) {
			if ( this.params.force ) {
				return;
			}

			if( mw.loader.getState( 'ext.googleUniversalAnalytics.utils' ) === null ) {
				return;
			}

			var label = this.params.campaign + '.' + this.params.banner;

			var gaEventProps = {
				eventCategory: 'fundraising',
				eventAction: type,
				eventLabel: label,
				nonInteraction: ( type === 'impression' )
			};

			if ( optionalValue) {
				gaEventProps.eventValue = optionalValue;
			}

			mw.loader.using( 'ext.googleUniversalAnalytics.utils' ).then( function() {
				mw.googleAnalytics.utils.recordEvent(
					gaEventProps
				);
			});
		},

		translateFreqValue: function( freq ) {
			freq = parseInt( freq ); // Make sure it's an integer

			switch ( freq ) {
				case 2: return 'monthly';
				case 3: return 'annually';
				default: return 'onetime';
			}
		},

		recordDonation: function() {
			var typeWithFreq = 'donate-' + this.translateFreqValue( this.params.freq );
			this.recordGAEvent( typeWithFreq, this.params.sum );
		}
	};

	mw.fundraisingBanner.recordDonation();
	*/

	function getErrors() {
		return errors;
	}

	mw.donationForm = {
		getErrors: getErrors,
		params: {
			campaign: mw.util.getParamValue( 'campaign' ),
			sum: parseInt( mw.util.getParamValue( 'sum' ) ),
			freq: parseInt( mw.util.getParamValue( 'frequency' ) )
		}
	};
}() );
