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

	private static $config;

	/**
	 * ResourceLoaderGetConfigVars hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetConfigVars
	 *
	 * @param array &$vars
	 */
	public static function onResourceLoaderGetConfigVars( &$vars ) {
		$varNames = [
			'SuggestedAmounts',
			'DefaultAmount',
			'MinimumAmount',
			'MaximumAmount',
			'NewsletterSubscriptionUrl',
			'NewsletterSubscriptionChecked',
			'TranzilaTerminalName',
			'HotjarTrigger'
		];

		foreach ( $varNames as $name ) {
			$vars[ 'wg' . self::EXTENSION_NAME . $name ] = self::getConfigVar( $name );
		}

	}

	/**
	 * @param string $name
	 *
	 * @return Config|null
	 */
	protected static function getConfigVar( string $name ) {
		if ( !isset( self::$config ) ) {
			self::$config = MediaWikiServices::getInstance()
			                                 ->getConfigFactory()
			                                 ->makeConfig( strtolower( self::EXTENSION_NAME ) );
		}
		try {
			return self::$config->get( self::EXTENSION_NAME . $name );
		} catch ( ConfigException $e ) {
			return null;
		}
	}


}
