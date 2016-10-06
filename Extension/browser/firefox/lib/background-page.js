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
/* global Components, Prefs, Log, BaseEvent, RequestTypes, Utils, OnMessageEvent, SendMessageFunction */

const {Services} = Components.utils.import('resource://gre/modules/Services.jsm', null);

var console = null;
// PaleMoon doesn't support new devtools path
try {
    console = Components.utils.import('resource://gre/modules/Console.jsm', {}).console;
} catch (ex) {
    console = Components.utils.import('resource://gre/modules/devtools/Console.jsm', {}).console;
}

console.log('Initializing background-page');


var ext = ext || {};
var exports = exports || {};

console.log('Initializing i18n');
var i18n = (function () {

    // Randomize URI to work around bug 719376
    var stringBundle = Services.strings.createBundle('chrome://adguard/locale/messages.properties?' + Math.random());

    function getText(text, args) {
        if (!text) {
            return "";
        }
        if (args && args.length > 0) {
            text = text.replace(/\$(\d+)/g, function (match, number) {
                return typeof args[number - 1] != "undefined" ? args[number - 1] : match;
            });
        }
        return text;
    }

    return {
        getMessage: function (key, args) {
            try {
                return getText(stringBundle.GetStringFromName(key), args);
            } catch (ex) {
                // Key not found, simply return it as a translation
                return key;
            }
        }
    };
})();

(function () {
    //try {
    //
    //    var {Log} = loadAdguardModule('./utils/log');
    //    var {FS} = loadAdguardModule('./utils/file-storage');
    //    var {LS} = loadAdguardModule('./utils/local-storage');
    //    if (options.loadReason == 'install' || options.loadReason == 'downgrade') {
    //        LS.clean();
    //        FS.removeAdguardDir();
    //    }
    //
    //    // In case of firefox browser we move application data from simple-storage to prefs.
    //    // So we need move app-version to prefs for properly update
    //    var appVersion = simpleStorage.storage['app-version'];
    //    if (appVersion) {
    //        LS.setItem('app-version', appVersion);
    //        delete simpleStorage.storage['app-version'];
    //    }
    //
    //    var SdkPanel = null;
    //    // PaleMoon (25) and fennec doesn't support sdk/panel
    //    try {
    //        SdkPanel = require('sdk/panel').Panel;
    //    } catch (ex) {
    //        Log.info("Module sdk/panel is not supported");
    //    }
    //
    //    var SdkContextMenu = null;
    //    try {
    //        SdkContextMenu = require('sdk/context-menu');
    //    } catch (ex) {
    //        Log.info("Module sdk/context-menu is not supported");
    //    }
    //
    //    //load module 'sdk/ui/button/toggle'. This module supported from 29 version
    //    var SdkButton;
    //    try {
    //        SdkButton = require('sdk/ui/button/toggle').ToggleButton;
    //    } catch (ex) {
    //        Log.info('Module sdk/ui/button/toggle is not supported');
    //    }
    //
    //    var {Prefs} = loadAdguardModule('./prefs');
    //    var {AntiBannerFiltersId} = loadAdguardModule('./utils/common');
    //    var {Utils} = loadAdguardModule('./utils/browser-utils');
    //    var {TabsMap} = loadAdguardModule('./tabsMap');
    //    var {FramesMap} = loadAdguardModule('./utils/frames');
    //    var {AdguardApplication} = loadAdguardModule('./filter/integration');
    //    var {filterRulesHitCount} = loadAdguardModule('./filter/filters-hit');
    //    var {FilteringLog} = loadAdguardModule('./filter/filtering-log');
    //    var {WebRequestService}= loadAdguardModule('./filter/request-blocking');
    //    var {AntiBannerService} = loadAdguardModule('./filter/antibanner');
    //    var {ElemHide} = loadAdguardModule('./elemHide');
    //    var {WebRequestImpl} = loadAdguardModule('./contentPolicy');
    //    var {InterceptHandler} = loadAdguardModule('./elemHideIntercepter');
    //    var {UI} = loadAdguardModule('./ui');
    //    var {ContentMessageHandler}= loadAdguardModule('./content-message-handler');
    //    var {contentScripts} = loadAdguardModule('./contentScripts');
    //
    //    // These require-calls are needed for proper build by cfx.
    //    // It does nothing in case of "jpm"-packed add-on
    //    require('./prefs');
    //    require('./elemHide');
    //    require('./tabsMap');
    //    require('./contentPolicy');
    //    require('./elemHideIntercepter');
    //    require('./content-message-handler');
    //    require('./ui');
    //    require('./utils/frames');
    //    require('./utils/common');
    //    require('./utils/browser-utils');
    //    require('./utils/user-settings');
    //    require('./filter/integration');
    //    require('./filter/filtering-log');
    //
    //    Log.info('Starting adguard addon...');
    //
    //    var antiBannerService = new AntiBannerService();
    //    var framesMap = new FramesMap(antiBannerService, TabsMap);
    //    var adguardApplication = new AdguardApplication(framesMap);
    //    var filteringLog = new FilteringLog(TabsMap, framesMap, UI);
    //    var webRequestService = new WebRequestService(framesMap, antiBannerService, filteringLog, adguardApplication);
    //
    //    WebRequestImpl.init(antiBannerService, adguardApplication, ElemHide, framesMap, filteringLog, webRequestService);
    //    ElemHide.init(framesMap, antiBannerService, webRequestService);
    //    InterceptHandler.init(framesMap, antiBannerService);
    //    filterRulesHitCount.setAntiBannerService(antiBannerService);
    //
    //    // Initialize content-message handler
    //    var contentMessageHandler = new ContentMessageHandler();
    //    contentMessageHandler.init(antiBannerService, webRequestService, framesMap, adguardApplication, filteringLog, UI);
    //    contentMessageHandler.setSendMessageToSender(function (worker, message) {
    //        contentScripts.sendMessageToWorker(worker, message);
    //    });
    //    contentScripts.init(contentMessageHandler);
    //
    //    // Initialize overlay toolbar button
    //    UI.init(antiBannerService, framesMap, filteringLog, adguardApplication, SdkPanel, SdkContextMenu, SdkButton);
    //
    //    var AdguardModules = {
    //
    //        antiBannerService: antiBannerService,
    //        framesMap: framesMap,
    //        filteringLog: filteringLog,
    //        Prefs: Prefs,
    //        UI: UI,
    //        i18n: i18n,
    //        Utils: Utils,
    //        AntiBannerFiltersId: AntiBannerFiltersId,
    //        //for popup script
    //        tabs: tabs
    //    };
    //
    //    /**
    //     * Observer for loaded adguard modules.
    //     * This observer is used for scripts on "chrome" pages to get access to Adguard modules.
    //     * Look at loadAdguardModule method in modules.js file.
    //     */
    //    var RequireObserver = {
    //
    //        LOAD_MODULE_TOPIC: "adguard-load-module",
    //
    //        observe: function (subject, topic, data) {
    //            if (topic == RequireObserver.LOAD_MODULE_TOPIC) {
    //                var service = AdguardModules[data];
    //                if (!service) {
    //                    throw 'Module "' + data + '" is undefined';
    //                }
    //                subject.wrappedJSObject.exports = service;
    //            }
    //        },
    //
    //        QueryInterface: XPCOMUtils.generateQI([Ci.nsISupportsWeakReference, Ci.nsIObserver])
    //    };
    //    Services.obs.addObserver(RequireObserver, RequireObserver.LOAD_MODULE_TOPIC, true);
    //    // Remove observer on unload
    //    unload.when(function () {
    //        Services.obs.removeObserver(RequireObserver, RequireObserver.LOAD_MODULE_TOPIC);
    //    });
    //
    //    var antiBannerCallback = function (runInfo) {
    //        if (runInfo.isFirstRun) {
    //            // Show filters download page on first run of addon
    //            UI.openFiltersDownloadPage();
    //        }
    //    };
    //    antiBannerService.init({
    //        runCallback: antiBannerCallback
    //    });
    //} catch (ex) {
    //    console.log(ex);
    //    throw  ex;
    //}
    //
    //// Cleanup stored frames
    //tabs.on('close', function (tab) {
    //    framesMap.removeFrame(tab);
    //});
    //
    //// Language detect on tab ready event
    //tabs.on('ready', function (tab) {
    //    antiBannerService.checkTabLanguage(tab.id, tab.url);
    //});
    //
    //// Initialize filtering log
    //filteringLog.synchronizeOpenTabs();
    //tabs.on('open', function (tab) {
    //    filteringLog.addTab(tab);
    //    framesMap.checkTabIncognitoMode(tab);
    //});
    //tabs.on('close', function (tab) {
    //    filteringLog.removeTab(tab);
    //});
    //tabs.on('ready', function (tab) {
    //    filteringLog.updateTab(tab);
    //});

    console.log('Initializing background-page..OK');

})();

