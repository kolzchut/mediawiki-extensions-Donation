<?php

namespace MediaWiki\WikiRights\Donation;

use Config;
use ConfigException;
use MediaWiki\MediaWikiServices;
use OutputPage;
use Parser;
use Skin;

/**
 * Hooks definitions for Donation extension
 */
class Hooks {
	const EXTENSION_NAME = 'Donation';

	private static $config;
	private static $parserFunctionUsed = false;


	/**
	 * Register any render callbacks with the parser
	 *
	 * @param Parser &$parser
	 */
	public static function onParserFirstCallInit( Parser &$parser ) {
		$parser->setFunctionHook(
			'DonationForm', [ __class__, 'renderDonationForm' ]
		);
	}

	/**
	 * Parser hook to add a donation form in a specific location on page
	 *
	 * @param Parser $parser
	 *
	 * @return array|string
	 */
	public static function renderDonationForm( $parser ) {
		// Never run more than once
		if ( self::$parserFunctionUsed ) {
			return '';
		}

		self::$parserFunctionUsed = true;
		$parser->getOutput()->addModules( 'ext.donation.parserFunctionHelper' );
		$element = '<div class="donation-form-inline"></div>';

		return [ $element, 'noparse' => true, 'isHTML' => true ];
	}

	/**
	 * BeforePageDisplay hook
	 * Adds the modules to the page
	 *
	 * @param OutputPage &$out
	 * @param Skin &$skin current skin
	 */
	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
		// Don't add the module if we don't have a terminal name or we're on the donation special page
		$tranzilaTerminalName = self::getConfigVar( 'TranzilaTerminalName' );
		if ( !$out->getTitle()->isSpecial( 'Donation' ) && !empty( $tranzilaTerminalName ) ) {
			$out->addModules( 'ext.donation.modal' );
		};
	}

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
