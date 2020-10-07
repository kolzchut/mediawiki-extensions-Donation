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
			'amount' => $this->defineParam( true, 'integer' ),
			'currency' => $this->defineParam( false ),
			'first_name' => $this->defineParam( false ),
			'last_name' => $this->defineParam( false ),
			'email' => $this->defineParam( false ),
			'card_num' => $this->defineParam( false ),
			'card_token' => $this->defineParam( true, 'integer' ),
			'card_type' => $this->defineParam( false ),
			'language' => $this->defineParam( false ),
			'utm_source' => $this->defineParam( false ),
			'utm_campaign' => $this->defineParam( false ),
			'utm_medium' => $this->defineParam( false ),
			'referrer' => $this->defineParam( false ),
			'recurring' => $this->defineParam( false ),
			'opt_in' => $this->defineParam( false ),
		];
	}

	private function defineParam( $required = false, $type = 'string' ) {
		if ( $required ) {
			$param = [ ApiBase::PARAM_TYPE => $type, ApiBase::PARAM_REQUIRED => true ];
		} else {
			$param = [ ApiBase::PARAM_TYPE => $type ];
		}
		return $param;
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
