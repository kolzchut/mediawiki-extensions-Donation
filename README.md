## Installation
See MediaWiki's generic extension installation instructions:
https://www.mediawiki.org/wiki/Manual:Extensions#Installing_an_extension

## Configuration
- `$wgDonationTranzilaTerminalName`: Tranzila terminal name
- `$wgDonationSuggestedAmounts`: array of suggested amounts for donation. Must be 3 items.
   See the following section for information on how to set it properly.
- `$wgDonationDefaultAmount`: the default amount for donation. Must be one of `$wgDonationSuggestedAmounts`.
- `$wgDonationMinimumAmount`: The minimum amount allowed for a donation. Cannot be lower than 1.
- `$wgDonationMaximumAmount`: The maximum amount allowed for a donation. Set to 0 to disable.
- `$wgDonationNewsletterSubscriptionUrl`: Mailchimp API url. The checkbox will not show if this is null (default)
- `$wgDonationNewsletterSubscriptionChecked`: Boolean. Should the subscription checkbox be checked by default
- `$wgDonationHotjarTrigger`: A trigger name for hotjar to start recording, etc. Keep null to disable.
  Recording will also be tagged with the trigger name.

### Important notice for `wgDonationSuggestedAmounts`!
MediaWiki doesn't allow overriding flat arrays in its configuration - it always merges the arrays.
Therefore, the only way to override $wgDonationSuggestedAmounts is to do the following:
```php
// Workaround for T142663 - override flat arrays
$wgExtensionFunctions[] = function() {
	global $wgDonationSuggestedAmounts;
	$wgDonationSuggestedAmounts = [ 5, 10, 50 ];
};
```
