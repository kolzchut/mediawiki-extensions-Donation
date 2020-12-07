( function () {
	'use strict';

	mw.donation = mw.donation || {};

	mw.donation.modal = {
		$modal: null,
		isInitialized: false,

		get: function () {
			var $modal, $modalDialog, $modalContent, $modalHeader, $modalBody;
			if ( this.$modal ) {
				return this.$modal;
			}

			$modal = $( '<div>' ).attr( {
				class: 'modal donationModal',
				tabindex: '-1',
				role: 'dialog'
			} );
			$modalDialog = $( '<div>' ).addClass( 'modal-dialog' ).attr( 'role', 'document' ).css( {
				width: 'min-content',
				'min-width': '300px',
				'margin-right': 'auto',
				'margin-left': 'auto'
			} );
			$modalContent = $( '<div>' ).attr( 'class', 'modal-content' );
			$modalHeader = $( '<div>' ).addClass( 'modal-header' ).html( '<button type="button" class="close" data-dismiss="modal" aria-label="' + mw.msg( 'donation-modal-close-btn' ) + '"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">' + mw.msg( 'donation-modal-title' ) + '</h4>' );
			$modalBody = $( '<div>' ).attr( 'class', 'modal-body' );

			$modal.append( $modalDialog );
			$modalDialog.append( $modalContent );
			$modalContent.append( $modalHeader, $modalBody );

			$modal.modal( { backdrop: 'static' } );

			this.$modal = $modal;
			return $modal;
		},

		show: function () {
			mw.loader.using( 'ext.donation.form' ).then( function () {
				var $modal = mw.donation.modal.get();

				if ( !mw.donation.modal.isInitialized ) {
					mw.donation.form.init( $modal.find( '.modal-body' ) );
					mw.donation.modal.isInitialized = true;
				}

				$modal.modal( 'show' );
				mw.track( 'kz.donation', {
					action: 'modal-loaded',
					label: '' // Pass an empty label, or GTM will pick up the previous one
				} );
			} );
		}

	};

	$( '.donationBtn' ).on( 'click', function () {
		mw.donation.modal.show();
	} );
}() );
