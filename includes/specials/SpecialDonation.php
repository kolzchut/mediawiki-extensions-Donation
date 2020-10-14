<?php

class SpecialDonation extends SpecialPage {

	public function __construct() {
		parent::__construct( 'Donation' );
	}

	/**
	 * Show the page to the user
	 *
	 * @param string $sub The subpage string argument (if any).
	 */
	public function execute( $sub ) {
		$out = $this->getOutput();

		$out->addModules( 'ext.donation.bootstrap' );


		$request = $this->getRequest();
		$currency = $request->getVal( 'currency' );
		$sum = $request->getInt( 'sum' );
		$frequency = $request->getInt( 'frequency' );
		$out->setPageTitle( $this->msg( 'donation-title' )->text() );
	}

}
