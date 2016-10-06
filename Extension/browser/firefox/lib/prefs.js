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

//var self = require('sdk/self');
//var platform = require('sdk/system').platform;
//var simplePrefs = require('sdk/simple-prefs');
//var unload = require('sdk/system/unload');

//var EventNotifier = require('./utils/notifier').EventNotifier;
//var EventNotifierTypes = require('./utils/common').EventNotifierTypes;

var locale = (function () {
	return Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService(Components.interfaces.nsIXULChromeRegistry).getSelectedLocale('global');
})();

/**
 * Global preferences for Firefox extension
 * TODO: FF Fix Prefs
 */
var Prefs = exports.Prefs = {
	//appId: self.id,
	//version: self.version,
	locale: locale,
	//getLocalFilterPath: function (filterId) {
	//	var url = "filters/filter_" + filterId + ".txt";
	//	return self.data.url(url);
	//},
	//getLocalMobileFilterPath: function (filterId) {
	//	var url = "filters/filter_mobile_" + filterId + ".txt";
	//	return self.data.url(url);
	//},
	//localGroupsMetadataPath: self.data.url('filters/groups.xml'),
	//localFiltersMetadataPath: self.data.url('filters/filters.xml'),
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