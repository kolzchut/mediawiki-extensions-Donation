<?php

class SpecialDonation extends SpecialPage {

	// Currency "constants"
	private $currency = [ '', '₪', '$', 'C$', '£', '€' ];

	// Donation frequency "constants"
	private $frequency = [ '', 'once', 'monthly', 'anually' ];

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

		$out->addHeadItem(
			'TranzillaHostedFields', '<script src="https://hf.tranzila.com/assets/js/thostedf.js"></script>'
		);
		$out->addModules( 'ext.donation.bootstrap' );

		$request = $this->getRequest();
		$currency = $request->getVal( 'currency' );
		$sum = $request->getInt( 'sum' );
		$frequency = $request->getInt( 'frequency' );
		$frequencyReadable = $this->frequency[ $frequency ];
		// donation-freq-once, donation-freq-monthly, donation-freq-annually
		$frequencyHuman = $this->msg( 'donation-freq-' . $frequencyReadable )->text();
		$out->setPageTitle( $this->msg( 'donation-title' )->text() );


		$templateParser = new TemplateParser( __DIR__ . '/templates' );

		$html = $templateParser->processTemplate( 'donationForm', [
			'sum' => 50,
			'freq' => 1,
			'currency' => '₪',
			'donation-freq-annually' => wfMessage( 'donation-freq-annually' )->text()
		] );

		$out->addHTML( $html );

		/* // thank you message
		$msgname = 'donation-msg';
		$out->addWikiText( $this->msg( $msgname )
			->numParams( $sum )
			->params( $currencySign, $frequencyHuman )
			->plain()
		);
		*/

	}

}
