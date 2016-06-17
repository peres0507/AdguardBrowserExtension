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

var Log = require('utils/log').Log;
var SafariContentBlockerConverter = require('converter').SafariContentBlockerConverter;
var EventNotifier = require('utils/notifier').EventNotifier;
var EventNotifierTypes = require('utils/common').EventNotifierTypes;
var Utils = require('utils/browser-utils').Utils;
var userSettings = require('utils/user-settings').userSettings;
var whiteListService = require('filter/whitelist').whiteListService;

/**
 * Safari Content Blocker helper
 */
exports.SafariContentBlocker = {

    RULES_LIMIT: 50000,

    emptyBlockerUrl: 'config/empty.json',
    emptyBlockerJSON: null,

    contentBlockListDirty: true,

    /**
     * Load content blocker
     */
    updateContentBlocker: function () {
        this._loadAndConvertRules(this.RULES_LIMIT, function (result) {

            //TODO: Check somehow if it is not the same set of rules
            this.contentBlockListDirty = true;

            if (!result) {
                this._clearFilters();
                return;
            }

            var json = JSON.parse(result.converted);
            this._setSafariContentBlocker(json, function (error) {
                EventNotifier.notifyListeners(EventNotifierTypes.CONTENT_BLOCKER_UPDATED,
                    {rulesCount: json.length, rulesOverLimit: result.overLimit, error: error});
            });

        }.bind(this));
    },

    /**
     * Disables content blocker
     * @private
     */
    _clearFilters: function () {
        this._setSafariContentBlocker(this._getEmptyBlockerJson());
    },

    /**
     * @returns JSON for empty content blocker
     * @private
     */
    _getEmptyBlockerJson: function () {
        if (!this.emptyBlockerJSON) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", this.emptyBlockerUrl, false);
            xhr.send(null);
            this.emptyBlockerJSON = JSON.parse(xhr.responseText);
        }
        return this.emptyBlockerJSON;
    },

    /**
     * Load rules from requestFilter and WhiteListService and convert for ContentBlocker
     * @private
     */
    _loadAndConvertRules: Utils.debounce(function (rulesLimit, callback) {

        if (userSettings.isFilteringDisabled()) {
            Log.info('Disabling content blocker.');
            callback(null);
            return;
        }

        Log.info('Starting loading content blocker.');

        var rules = antiBannerService.getRequestFilter().getRules();

        if (userSettings.isDefaultWhiteListMode()) {
            rules = rules.concat(whiteListService.getRules());
        } else {
            var invertedWhitelistRule = this._constructInvertedWhitelistRule();
            if (invertedWhitelistRule) {
                rules = rules.concat(invertedWhitelistRule);
            }
        }

        var result = SafariContentBlockerConverter.convertArray(rules, rulesLimit);
        if (result && result.converted) {
            callback(result);
        } else {
            callback(null);
        }

    }, 500),

    _setSafariContentBlocker: function (json, onContentBlockerSetCallback) {
        try {
            Log.info('Setting content blocker. Length=' + json.length);

            var self = this;

            function setContentBlocker(callback) {
                // When given the same rules as last time setContentBlocker will always give
                // null (success) to the callback, even when there was actually an error. We
                // cache the last result therefore so that we can provide a consistent result
                // and also to avoid wastefully regenerating an identical blocklist.
                if (!self.contentBlockListDirty) {
                    callback(self.lastSetContentBlockerError);
                    return;
                }

                this.contentBlockListDirty = false;
                safari.extension.setContentBlocker(
                    // There is a strange bug in setContentBlocker for Safari 9 where if both
                    // the callback parameter is provided and the rules aren't converted to a
                    // JSON string it fails. Worse still it actually performs the callback twice
                    // too, firstly with an empty string and then with an Error:
                    //   "Extension compilation failed: Failed to parse the JSON String."
                    // To mitigate this we convert the rules to JSON here and also ignore
                    // callback values of "". (Usually the callback is performed with either
                    // null for success or an Error on failure.)
                    // Bug #26322821 filed on bugreport.apple.com
                    JSON.stringify(json),
                    function (error) {
                        if (error == "") {
                            callback();
                            return;
                        }

                        self.lastSetContentBlockerError = error;
                        callback(error);
                    }
                );
            }

            setContentBlocker(function (error) {
                if (error) {
                    Log.error('Error setting content blocker: ' + error);
                } else {
                    Log.info('Content blocker has been set.');
                }

                if (onContentBlockerSetCallback) {
                    onContentBlockerSetCallback(error);
                }

            });
        } catch (ex) {
            Log.error('Error while setting content blocker: ' + ex);

            if (onContentBlockerSetCallback) {
                onContentBlockerSetCallback(ex);
            }
        }
    },

    _constructInvertedWhitelistRule: function () {
        var domains = whiteListService.getWhiteList();
        var invertedWhitelistRule = '@@||*$document';
        if (domains && domains.length > 0) {
            invertedWhitelistRule += ",domain=";
            for (var i = 0, len = domains.length; i < len; i++) {
                if (i > 0) {
                    invertedWhitelistRule += '|';
                }

                invertedWhitelistRule += '~' + domains[i];
            }
        }

        return invertedWhitelistRule;
    }
};
