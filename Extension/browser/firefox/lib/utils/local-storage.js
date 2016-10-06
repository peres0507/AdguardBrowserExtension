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

/* global exports, Components */

/**
 * Local storage adapter
 */

var LS = exports.LS = {

    branch: Services.prefs.getBranch('extensions.' + location.host + '.'),
    str: Components.classes['@mozilla.org/supports-string;1']
        .createInstance(Components.interfaces.nsISupportsString),

    getItem: function (key) {
        try {
            return this.branch.getComplexValue(
                key,
                Components.interfaces.nsISupportsString
            ).data;
        } catch (ex) {
            return null;
        }
    },

    setItem: function (key, value) {
        this.str.data = value;
        this.branch.setComplexValue(
            key,
            Components.interfaces.nsISupportsString,
            this.str
        );
    },

    removeItem: function (key) {
        this.branch.clearUserPref(key);
    },
    clean: function () {
        this.branch.deleteBranch('');
    }
};