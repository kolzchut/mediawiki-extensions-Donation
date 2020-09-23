( function () {
	'use strict';

	var fields,
		$cardErrors = $( '.Card-Errors' ),
		$amount = $( '#amount' ),
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

	function remErr( fld ) {
		$( '.' + prefixErrCls + fld ).remove();
	}

	function addErr( fld, err ) {
		remErr( fld );
		$cardErrors.prepend( '<p class="' + prefixErrCls + fld + '">' + err + '</p>' );
	}

	function handleErrors( err ) {
		var errAll;

		$cardErrors.empty();

		if ( Array.isArray( err ) ) {
			err.forEach( function ( errMsg ) {
				errAll += ' - ' + errMsg.message;
				// $cardErrors.append('<p>' + errMsg.message + '</p>');
				addErr( errMsg.param, errMsg.message );
			} );
		} else {
			errAll = 'Unknown server error.';
			// $cardErrors.append('<p>' + errAll + '</p>');
			addErr( '', errAll );
		}

		$cardErrors.removeClass( 'Display-None' );
	}

	function chargeCCData() {
		fields.charge(
			{
				// expiry_month: $('#expiry').val().substring(0,2),
				// expiry_year: $('#expiry').val().substring(3,7),
				// eslint-disable-next-line camelcase
				terminal_name: 'kolzchut',
				amount: $amount.val(),
				tokenize: true
			},
			function ( err, result ) {
				var $btn = $( '.CardField-button' );

				if ( Object.prototype.hasOwnProperty.call( result, 'errors' ) ) {
					btnChargeEnabled = true;
					$btn.prop( 'disabled', false );
					$btn.removeClass( 'disabled-CardField-button' );
					handleErrors( result.errors );
				} else {
					$cardErrors.addClass( 'Display-None' );
					// eslint-disable-next-line no-alert
					alert( 'Payment charge success!' + result );
				}
			}
		);
	}

	$( '#payment_form' ).on( 'submit', function ( e ) {
		var $btn = $( '.CardField-button' );

		e.preventDefault();
		if ( btnChargeEnabled ) {
			btnChargeEnabled = false;
			$btn.prop( 'disabled', true );
			$btn.addClass( 'disabled-CardField-button' );
			chargeCCData();
		}
	} );

	$amount.on( 'change', function () {
		if ( this.checkValidity() && this.value !== '' ) {
			mw.log( 'amount changed: ' + $( this ).val() );
			$( '#amount-on-btn' ).text( $( this ).val() );
			$( '#errors_for_amount' ).text( '' );
		} else {
			$( '#errors_for_amount' ).text( 'יש להקליד סכום שלם מעל 5 ש"ח' );
		}
	} );

	fields = TzlaHostedFields.create( {
		sandbox: false,
		styles: {
			input: {
				'background-color': 'transparent',
				border: 'none',
				display: 'block',
				'font-family': 'Helvetica Neue, Helvetica, sans-serif',
				margin: '0',
				padding: '0',
				width: '100%',
				'font-size': '16px',
				'line-height': '1.2em',
				height: '1.2em',
				'-webkit-font-smoothing': 'antialiased',
				'-moz-osx-font-smoothing': 'grayscale',
				color: '#32325d',
				position: 'absolute',
				top: '0'
			},
			'input:-ms-input-placeholder': {
				opacity: '1',
				color: '#aab7c4bd',
				'text-align': 'right'
			},
			'input::placeholder': {
				opacity: '1',
				color: '#aab7c4bd',
				'text-align': 'right'
			},
			'input::-webkit-input-placeholder': {
				opacity: '1',
				color: '#aab7c4bd',
				'text-align': 'right'
			},
			'input::-moz-placeholder': {
				opacity: '1',
				color: '#aab7c4bd',
				'text-align': 'right'
			},

			'.hosted-fields-invalid:not(:focus)': {
				color: 'red'
			}
		},

		fields: {
			// eslint-disable-next-line camelcase
			credit_card_number: {
				selector: '#credit_card_number',
				placeholder: 'מספר כרטיס אשראי',
				tabindex: 1
			},
			cvv: {
				selector: '#cvv',
				placeholder: 'CVV',
				tabindex: 4
			},
			// eslint-disable-next-line camelcase
			card_holder_id_number: {
				selector: '#card_holder_id_number',
				placeholder: 'ת.ז',
				tabindex: 2
			},
			expiry: {
				selector: '#expiry',
				placeholder: 'MM/YY',
				version: '1',
				tabindex: 3
			}
		}
	} );

	fields.onEvent( 'ready', function () {
		mw.log( 'ready01---' );
		setFocusOnCCnumber();
		$( '.CardField-button' ).prop( 'disabled', false );
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

	mw.donationForm = {
		params: {
			campaign: mw.util.getParamValue( 'campaign' ),
			sum: parseInt( mw.util.getParamValue( 'sum' ) ),
			freq: parseInt( mw.util.getParamValue( 'frequency' ) )
		}
	};

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

}() );
