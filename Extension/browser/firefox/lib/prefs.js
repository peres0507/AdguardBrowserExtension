/**
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Adguard Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global Components, exports, LS */

var locale = (function () {
	return Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService(Components.interfaces.nsIXULChromeRegistry).getSelectedLocale('global');
})();

/**
 * Global preferences for Firefox extension
 */
var Prefs = exports.Prefs = {
	version: location.hash.slice(1),
	locale: locale,
	getLocalFilterPath: function (filterId) {
		return "chrome://adguard/content/data/filters/filter_" + filterId + ".txt";
	},
	getLocalMobileFilterPath: function (filterId) {
		return "chrome://adguard/content/data/filters/filter_mobile_" + filterId + ".txt";
	},
	localGroupsMetadataPath: 'chrome://adguard/content/data/filters/groups.xml',
	localFiltersMetadataPath: 'chrome://adguard/content/data/filters/filters.xml',
	safebrowsingPagePath: 'sb.html',
	platform: "firefox",
	mobile: window.navigator.platform.indexOf('android') > -1,
	getBrowser: function () {
		if (!Prefs.browser) {
			var browser;
			if (Prefs.mobile) {
				browser = "Android";
			} else {
				browser = "Firefox";
			}
			Prefs.browser = browser;
		}
		return Prefs.browser;
	},
    speedupStartup: function () {
		return LS.getItem('speedup_startup');
    },
    collapseByContentScript: LS.getItem('collapse_by_content_script'),
    useGlobalStyleSheet: LS.getItem('use_global_style_sheet')
};

//TODO: FF Fix Prefs
//var unload = require('sdk/system/unload');

//var onPreferenceChanged = function(prefName) {
//    Prefs.collapseByContentScript = LS.getItem('collapse_by_content_script');
//    Prefs.useGlobalStyleSheet = LS.getItem('use_global_style_sheet');
//	EventNotifier.notifyListeners(EventNotifierTypes.CHANGE_PREFS, prefName);
//};

//simplePrefs.on('collapse_by_content_script', onPreferenceChanged);
//simplePrefs.on('use_global_style_sheet', onPreferenceChanged);
//
//unload.when(function() {
//    simplePrefs.removeListener('collapse_by_content_script', onPreferenceChanged);
//    simplePrefs.removeListener('use_global_style_sheet', onPreferenceChanged);
//});