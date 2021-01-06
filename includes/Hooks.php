<?php

namespace MediaWiki\WikiRights\Donation;

use Config;
use MediaWiki\MediaWikiServices;

/**
 * Hooks definitions for Donation extension
 */
class Hooks {
	/**
	 * ResourceLoaderGetConfigVars hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetConfigVars
	 *
	 * @param array $vars
	 */
	public static function onResourceLoaderGetConfigVars( &$vars ) {
		$vars += [
			'wgDonationNewsletterSubscriptionUrl' => self::getConfig()->get( 'DonationNewsletterSubscriptionUrl' )
		];

	}

	/**
	 * @return Config
	 */
	private static function getConfig() {
		return MediaWikiServices::getInstance()
		                        ->getConfigFactory()
		                        ->makeConfig( 'donation' );
	}
}
