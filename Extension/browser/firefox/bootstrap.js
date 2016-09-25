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

/* global APP_SHUTDOWN, APP_STARTUP, ADDON_UNINSTALL, Components */
/* exported startup, shutdown, install, uninstall */

'use strict';

/******************************************************************************/

const {classes: Cc, interfaces: Ci} = Components;

// Accessing the context of the background page:
// var win = Services.appShell.hiddenDOMWindow.document.querySelector('iframe[src*=adguard]').contentWindow;

var bgProcess;
var version;
const hostName = 'adguard';
const restartListener = {
    get messageManager() {
        return Components.classes['@mozilla.org/parentprocessmessagemanager;1']
            .getService(Components.interfaces.nsIMessageListenerManager);
    },

    receiveMessage: function () {
        shutdown();
        startup();
    }
};

function startup(data, reason) {
    if (data !== undefined) {
        version = data.version;
    }

    // Already started?
    if (bgProcess !== null) {
        return;
    }

    var appShell = Cc['@mozilla.org/appshell/appShellService;1']
        .getService(Ci.nsIAppShellService);

    var isReady = function () {
        var hiddenDoc;

        try {
            hiddenDoc = appShell.hiddenDOMWindow &&
                appShell.hiddenDOMWindow.document;
        } catch (ex) {
            //Ignore
        }

        // Do not test against `loading`: it does appear `readyState` could be
        // undefined if looked up too early.
        if (!hiddenDoc || hiddenDoc.readyState !== 'complete') {
            return false;
        }

        bgProcess = hiddenDoc.documentElement.appendChild(
            hiddenDoc.createElementNS('http://www.w3.org/1999/xhtml', 'iframe')
        );
        bgProcess.setAttribute(
            'src',
            'chrome://' + hostName + '/content/background.html#' + version
        );

        // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMessageListenerManager#addMessageListener%28%29
        // "If the same listener registers twice for the same message, the
        // "second registration is ignored."
        restartListener.messageManager.addMessageListener(
            hostName + '-restart',
            restartListener
        );

        return true;
    };

    if (isReady()) {
        return;
    }

    // https://github.com/gorhill/uBlock/issues/749
    // Poll until the proper environment is set up -- or give up eventually.
    // We poll frequently early on but relax poll delay as time pass.

    var tryDelay = 5;
    var trySum = 0;
    // https://trac.torproject.org/projects/tor/ticket/19438
    // Try for a longer period.
    var tryMax = 600011;
    var timer = Cc['@mozilla.org/timer;1']
        .createInstance(Ci.nsITimer);

    var checkLater = function () {
        trySum += tryDelay;
        if (trySum >= tryMax) {
            timer = null;
            return;
        }
        timer.init(timerObserver, tryDelay, timer.TYPE_ONE_SHOT);
        tryDelay *= 2;
        if (tryDelay > 503) {
            tryDelay = 503;
        }
    };

    var timerObserver = {
        observe: function () {
            timer.cancel();
            if (isReady()) {
                timer = null;
            } else {
                checkLater();
            }
        }
    };

    checkLater();
}

function shutdown(data, reason) {
    if (reason === APP_SHUTDOWN) {
        return;
    }

    bgProcess.parentNode.removeChild(bgProcess);

    if (data === undefined) {
        return;
    }

    // Remove the restartObserver only when the extension is being disabled
    restartListener.messageManager.removeMessageListener(
        hostName + '-restart',
        restartListener
    );
}

/**
 * On addon install
 */
function install() {
    // https://bugzil.la/719376
    Components.classes['@mozilla.org/intl/stringbundle;1']
        .getService(Components.interfaces.nsIStringBundleService)
        .flushBundles();
}

/**
 * On addon uninstall
 *
 * @param data
 * @param reason
 */
function uninstall(data, reason) {
    if (reason !== ADDON_UNINSTALL) {
        return;
    }

    // Clean up local storage
    Components.utils.import('resource://gre/modules/Services.jsm', null)
        .Services.prefs.getBranch('extensions.' + hostName + '.').deleteBranch('');
}
