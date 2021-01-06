<?php

/**
 * Generic Donation API
 * API to accept donation submissions and process them through Tranzila API
 * Call with api.php?action=donate
 */
class DonationApi extends ApiBase {
	public function execute() {
		$isValid = $this->validate();
		if ( !$isValid ) {
			return;
		}

		$paymentResult = $this->doPayment();

		$errors = $this->doPayment();

		if ( !empty( $errors ) ) {
		}

		$this->getResult()->addValue( null, 'result', $outputResult );
	}

	/**
	 * @todo flesh this out
	 * @return bool
	 */
	public function validate() {
		return true;
	}

	public function doPayment() {
		return true;
	}

	/**
	 * @see ApiBase::getAllowedParams
	 *
	 * @return array
	 */
	public function getAllowedParams() {
		return [
			'amount' => [ ApiBase::PARAM_TYPE => 'integer', ApiBase::PARAM_REQUIRED => true ],
			'currency' => [ ApiBase::PARAM_TYPE => [ 'ILS', 'USD' ], [ ApiBase::PARAM_DFLT => 'ILS' ], ],
			'name' => [ ApiBase::PARAM_TYPE => 'string' ],
			'email' => [ ApiBase::PARAM_TYPE => 'string' ],
			'card_num' => [ ApiBase::PARAM_TYPE => 'string' ],
			'card_token' => [ ApiBase::PARAM_TYPE => 'integer', ApiBase::PARAM_REQUIRED => true ],
			'card_type' => [ ApiBase::PARAM_TYPE => 'string' ],
			'language' => [ ApiBase::PARAM_TYPE => [ 'he', 'ar', 'en' ], ApiBase::PARAM_DFLT => 'he' ],
			'utm_source' => [ ApiBase::PARAM_TYPE => 'string' ],
			'utm_campaign' => [ ApiBase::PARAM_TYPE => 'string' ],
			'utm_medium' => [ ApiBase::PARAM_TYPE => 'string' ],
			'referrer' => [ ApiBase::PARAM_TYPE => 'string' ],
			'recurring' => [ ApiBase::PARAM_TYPE => 'boolean', ApiBase::PARAM_DFLT => false ],
			'newsletter_opt_in' => [ ApiBase::PARAM_TYPE => 'boolean', ApiBase::PARAM_DFLT => false ],
		];
	}

	/**
	 * @see ApiBase::getExamplesMessages()
	 * @return array
	 */
	protected function getExamplesMessages() {
		return [
			'action=donate&amount=25&currency=ILS'
				=> 'apihelp-donate-example-1',
		];
	}
}
