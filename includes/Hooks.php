<?php

namespace MediaWiki\WikiRights\Donation;

use Config;
use ConfigException;
use MediaWiki\MediaWikiServices;

/**
 * Hooks definitions for Donation extension
 */
class Hooks {
	const EXTENSION_NAME = 'Donation';

	private static Config $config;

	/**
	 * ResourceLoaderGetConfigVars hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetConfigVars
	 *
	 * @param array &$vars
	 */
	public static function onResourceLoaderGetConfigVars( &$vars ) {
		$vars += [
			'wgDonationNewsletterSubscriptionUrl' => self::getConfigVar( 'NewsletterSubscriptionUrl' ),
			'wgDonationTranzilaTerminalName' => self::getConfigVar( 'NewsletterSubscriptionUrl' )
		];

	}

	/**
	 * @param string $name
	 *
	 * @return Config
	 */
	protected static function getConfigVar( $name ) {
		if ( !isset( self::$config ) ) {
			self::$config = MediaWikiServices::getInstance()
			                                 ->getConfigFactory()
			                                 ->makeConfig( strtolower( self::EXTENSION_NAME ) );
		}
		try {
			return self::$config->get( self::EXTENSION_NAME . $name );
		} catch ( ConfigException ) {
			return null;
		}
	}


}
