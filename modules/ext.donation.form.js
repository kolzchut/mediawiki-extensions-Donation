( function () {
	'use strict';

	var $form,
		fields,
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

	function setFocusOnFirstField() {
		$( '.donation-form' ).find( 'input' ).first().trigger( 'focus' );
	}

	function toggleSubmitButton( forcedValue ) {
		btnChargeEnabled = forcedValue !== 'undefined' ? forcedValue : !btnChargeEnabled;
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
		// toggleSubmitButton( false );
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
		mw.track( 'kz.donation', {
			action: 'amount-changed',
			label: value,
			value: value
		} );
		$( '.btn-amount' ).text( value );
		remErr( 'amount' );
	}

	function validateAmount() {
		var amount, parsedAmount;

		amount = $suggestedAmount.is( ':checked' ) ? $suggestedAmount.filter( ':checked' ).val() : $amount.val();

		parsedAmount = parseInt( amount ); // Make sure it's an integer
		if ( !parsedAmount ) {
			addErr( 'amount', 'יש לבחור או להקליד סכום' ); // @todo i18n
		} else if ( parsedAmount < 5 ) { // @todo get from config
			addErr( 'amount', 'יש להקליד סכום שלם - לפחות 5 ש"ח' ); // @todo i18n + get from config
		} else {
			// Success!
			changeAmount( parsedAmount );
			return true;
		}

		return false;
	}

	function validateEmail() {
		var email = $( '#email' ).val(),
			// eslint-disable-next-line no-useless-escape
			re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if ( re.test( email ) ) {
			remErr( 'email' );
			return true;
		}

		addErr( 'email', 'Invalid email address' ); // @todo i18n
		return false;
	}

	function getCurrencySignFromInt( code ) {
		switch ( code ) {
			case 1: return '₪';
			default: return null;
		}
	}

	function subscribeToNewsletter( email, name ) {
		var data,
			deferred = $.Deferred(),
			subscriptionUrl = mw.config.get( 'wgDonationNewsletterSubscriptionUrl' );

		data = {
			name: name,
			EMAIL: email,
			'group[9113][1]': 1
		};

		$.getJSON( subscriptionUrl, data ).then( function ( response ) {
			var msg;
			if ( response.result !== 'success' ) {
				if ( response.msg && response.msg.match( /already subscribed|כבר מנוי/i ) ) {
					msg = mw.msg( 'donation-newsletter-sub-already-subscribed' );
				} else {
					msg = mw.msg( 'donation-newsletter-sub-fail' );
				}
				deferred.reject( response.result, msg );
				mw.track( 'kz.donation', {
					action: 'newsletter-subscription-failed',
					label: msg,
					value: ''
				} );
			} else {
				msg = mw.msg( 'donation-newsletter-sub-success' );
				deferred.resolve( response.result, msg );

				mw.track( 'kz.donation', {
					action: 'newsletter-subscribed',
					label: '',
					value: ''
				} );
			}
		} );

		return deferred.promise();
	}

	function onSuccess( result ) {
		var amount, name, email, subscribe, $thanksMsg;

		mw.log( 'Payment successful' + result );

		amount = result.transaction_response.amount;
		email = result.transaction_response.user_form_data.email.trim();
		name = result.transaction_response.user_form_data.contact.trim();
		subscribe = result.transaction_response.user_form_data.subscribe;

		mw.track( 'kz.donation', {
			action: 'success',
			label: '', // Pass an empty label, or GTM will pick up the previous one
			value: amount
		} );

		$thanksMsg = $( '<div>' ).attr( 'class', 'donation-thanks' ).append( mw.message(
			'donation-thank-you',
			name,
			amount,
			getCurrencySignFromInt( result.transaction_response.currency_code )
		).parseDom() );

		removeAllErrors();
		$form.hide();

		// It seems tranzilla returns our boolean as a string, so check for 'true'
		if ( mw.config.get( 'wgDonationNewsletterSubscriptionUrl' ) !== null && subscribe === 'true' ) {
			subscribeToNewsletter(
				email,
				name
			).always( function ( status, msg ) {
				$thanksMsg.append( msg ).insertBefore( $form );
			} );
		} else {
			mw.track( 'kz.donation', {
				action: 'newsletter-declined',
				label: '', // Pass an empty label, or GTM will pick up the previous one
				value: ''
			} );
			$thanksMsg.insertBefore( $form );
		}
	}

	function chargeCCData() {
		var $statusIcon = $( '<i>' ).attr( 'class', 'fa fa-spinner fa-spin' );

		validateAmount();
		validateEmail();

		$btn.append( $statusIcon );
		toggleSubmitButton();

		fields.charge(
			{
				// expiry_month: $('#expiry').val().substring(0,2),
				// expiry_year: $('#expiry').val().substring(3,7),
				// eslint-disable-next-line camelcase
				terminal_name: mw.config.get( 'wgDonationTranzilaTerminalName' ),
				amount: $suggestedAmount.is( ':checked' ) ? $suggestedAmount.filter( ':checked' ).val() : $amount.val(),
				// tokenize: true,
				// eslint-disable-next-line camelcase
				response_language: mw.config.get( 'wgContentLanguage' ) === 'he' ? 'hebrew' : 'english',
				subscribe: $( '#subscribe' ).is( ':checked' ),
				email: $( '#email' ).val(),
				// Must use "contact" here. While it can be changed in tranzila interface,
				// it's not clear if the receipts will reflect that
				contact: $( '#name' ).val()
			},
			function ( err, result ) {
				$statusIcon.hide();
				if (
					err.messages || result.errors
				) {
					mw.track( 'kz.donation', {
						action: 'pre-charge-failed',
						label: err.messages || result.errors
					} );
					toggleSubmitButton();
					handleErrors(
						err.messages || result.errors );
				} else if ( result.transaction_response.success === false ) {
					addErr( 'submit', mw.msg( 'donation-charge-failed' ) );
					mw.track( 'kz.donation', {
						action: 'charge-failed',
						label: result.transaction_response.error
					} );
				} else {
					onSuccess( result );
				}
			}
		);
	}

	function registerDomEvents() {
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
				},
				cvv: {
					selector: '#cvv',
					placeholder: 'xxx'
				},
				// eslint-disable-next-line camelcase
				card_holder_id_number: {
					selector: '#card_holder_id_number',
					placeholder: 'xxxxxxxxx'
				},
				expiry: {
					selector: '#expiry',
					placeholder: 'MM/YY',
					version: '1'
				}
			}
		} );

		fields.onEvent( 'ready', function () {
			mw.log( 'donation.form.hostedFields.ready' );
			mw.track( 'kz.donation', {
				action: 'loaded',
				label: ''
			} );
			$( '.donation-loading' ).hide();
			$( '.donation-form' ).removeClass( 'disabled' );
			// setFocusOnCCnumber();
			toggleSubmitButton( true );
		} );

		fields.onEvent( 'focus', function ( event ) {
			var $focusedF = $( '#' + event.field );
			$focusedF.addClass( 'focusedBorder' );
		} );

		fields.onEvent( 'validityChange', function ( event ) {
			mw.log( 'donation.form.hostedFields.validityChange: ' + event.field + ' = ' + event.isValid );
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
			$unfocusedF.removeClass( 'focusedBorder' );

			switch ( event.field ) {
				case 'credit_card_number':
					if ( !validCCN && !emptyCCN ) {
						addErr( event.field, 'מספר כרטיס אשראי לא תקין' ); // @todo i18n
					} else {
						remErr( event.field );
					}
					break;
				case 'cvv':
					if ( !validCCV && !emptyCCV ) {
						addErr( event.field, 'CVV לא תקין' ); // @todo i18n
					} else {
						remErr( event.field );
					}
					break;
				case 'expiry':
					if ( !validExp && !emptyExp ) {
						addErr( event.field, 'תאריך תום תוקף כרטיס לא תקין' ); // @todo i18n
					} else {
						remErr( event.field );
					}
					break;
				case 'card_holder_id_number':
					if ( !validCHID && !emptyCHID ) {
						addErr( event.field, 'מספר תעודת זהות אינו תקין' ); // @todo i18n
					} else {
						remErr( event.field );
					}
					break;
			}
		} );

		fields.onEvent( 'cardTypeChange', function ( event ) {
			$( '#card-img' ).attr( 'class', 'card-img-' + event.cardType );
		} );
	}

	function getForm() {
		var templateData,
			$el,
			defaultSum = 200, // @todo Get this from config,
			defaultCurrency = '₪'; // @todo Get this from config

		templateData = {
			sum: defaultSum,
			currency: defaultCurrency,
			newsletterSubscriptionEnabled: mw.config.get( 'wgDonationNewsletterSubscriptionUrl' ) !== null,
			newsletterSubscriptionChecked: mw.config.get( 'wgDonationNewsletterSubscriptionChecked' ) === true ? 'checked' : '',
			'donation-required-indicator': mw.msg( 'donation-required-indicator' ),
			'donation-btn-text': mw.msg( 'donation-btn-text', defaultSum, defaultCurrency ),
			'donation-newsletter-subscribe': mw.msg( 'donation-newsletter-subscribe' ),
			'donation-email': mw.msg( 'donation-email' ),
			'donation-cc-holder-id': mw.msg( 'donation-cc-holder-id' ),
			'donation-cc-holder-name': mw.msg( 'donation-cc-holder-name' ),
			'donation-cc-cvv': mw.msg( 'donation-cc-cvv' ),
			'donation-cc-cvv-tooltip': mw.msg( 'donation-cc-cvv-tooltip' ),
			'donation-cc-expiry-date': mw.msg( 'donation-cc-expiry-date' ),
			'donation-cc-number': mw.msg( 'donation-cc-number' ),
			'donation-amount-other': mw.msg( 'donation-amount-other' ),
			'donation-freq-once': mw.msg( 'donation-freq-once' ),
			'donation-freq-monthly': mw.msg( 'donation-freq-monthly' ),
			'donation-freq-annually': mw.msg( 'donation-freq-annually' ),
			'donation-loading': mw.msg( 'donation-loading' )
		};

		$el = mw.template.get( 'ext.donation.form', 'donationForm.mustache' )
			.render( templateData );

		// For some reason, this returns an extra text node, so we return the 1st node
		return $el.first();
	}

	function init( $elem ) {
		$elem = $elem || $( '#bodyContent' );
		$.ajaxSetup( {
			cache: true
		} );
		$.getScript( 'https://hf.tranzila.com/assets/js/thostedf.js' )
			.done( function () {
				$form = getForm();
				registerDomEvents();
				$elem.append( $form );
				initTranzilaHostedFields();
				setFocusOnFirstField();
			} );
	}
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

	mw.donation = mw.donation || {};

	mw.donation.form = {
		init: init,
		getErrors: getErrors,
		onSuccess: onSuccess,
		params: {
			campaign: mw.util.getParamValue( 'campaign' ),
			sum: parseInt( mw.util.getParamValue( 'sum' ) ),
			freq: parseInt( mw.util.getParamValue( 'frequency' ) )
		}
	};
}() );
