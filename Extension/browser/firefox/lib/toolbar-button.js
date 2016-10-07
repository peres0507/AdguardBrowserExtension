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

/* global exports */

/**
 * Firefox toolbar button
 */
var ToolbarButton = exports.ToolbarButton = function () {
    var id = location.host + '-button';
    var type = 'view';
    var viewId = location.host + '-panel';
    //TODO: Load localizations
    var label = "Adguard";
    var tooltiptext = "Adguard";

    var init = function() {
        //if ( vAPI.fennec ) {
        //    // Menu UI for Fennec
        //    var tb = {
        //        menuItemIds: new WeakMap(),
        //        label: vAPI.app.name,
        //        tabs: {}
        //    };
        //    vAPI.toolbarButton = tb;
        //
        //    tb.getMenuItemLabel = function(tabId) {
        //        var label = this.label;
        //        if ( tabId === undefined ) {
        //            return label;
        //        }
        //        var tabDetails = this.tabs[tabId];
        //        if ( !tabDetails ) {
        //            return label;
        //        }
        //        if ( !tabDetails.img ) {
        //            label += ' (' + vAPI.i18n('fennecMenuItemBlockingOff') + ')';
        //        } else if ( tabDetails.badge ) {
        //            label += ' (' + tabDetails.badge + ')';
        //        }
        //        return label;
        //    };
        //
        //    tb.onClick = function() {
        //        var win = Services.wm.getMostRecentWindow('navigator:browser');
        //        var curTabId = vAPI.tabs.getTabId(getTabBrowser(win).selectedTab);
        //        vAPI.tabs.open({
        //            url: 'popup.html?tabId=' + curTabId,
        //            index: -1,
        //            select: true
        //        });
        //    };
        //
        //    tb.updateState = function(win, tabId) {
        //        var id = this.menuItemIds.get(win);
        //        if ( !id ) {
        //            return;
        //        }
        //        win.NativeWindow.menu.update(id, {
        //            name: this.getMenuItemLabel(tabId)
        //        });
        //    };
        //
        //    // Only actually expecting one window under Fennec (note, not tabs, windows)
        //    for ( var win of vAPI.tabs.getWindows() ) {
        //        var label = tb.getMenuItemLabel();
        //        var id = win.NativeWindow.menu.add({
        //            name: label,
        //            callback: tb.onClick
        //        });
        //        tb.menuItemIds.set(win, id);
        //    }
        //
        //    cleanupTasks.push(function() {
        //        for ( var win of vAPI.tabs.getWindows() ) {
        //            var id = tb.menuItemIds.get(win);
        //            if ( id ) {
        //                win.NativeWindow.menu.remove(id);
        //                tb.menuItemIds.delete(win);
        //            }
        //        }
        //    });
        //
        //    return;
        //}

        //vAPI.messaging.globalMessageManager.addMessageListener(
        //    location.host + ':closePopup',
        //    vAPI.toolbarButton.onPopupCloseRequested
        //);
        //
        //cleanupTasks.push(function() {
        //    vAPI.messaging.globalMessageManager.removeMessageListener(
        //        location.host + ':closePopup',
        //        vAPI.toolbarButton.onPopupCloseRequested
        //    );
        //});
        //
        //var CustomizableUI;
        //
        //var forceLegacyToolbarButton = vAPI.localStorage.getBool("forceLegacyToolbarButton");
        //if (!forceLegacyToolbarButton) {
        //    try {
        //        CustomizableUI = Cu.import('resource:///modules/CustomizableUI.jsm', null).CustomizableUI;
        //    } catch (ex) {
        //    }
        //}
        //
        //if (!CustomizableUI) {
        //    // Create a fallback non-customizable UI button
        //    var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
        //    var styleSheetUri = Services.io.newURI(vAPI.getURL("css/legacy-toolbar-button.css"), null, null);
        //    var legacyButtonId = "uBlock-legacy-button"; // NOTE: must match legacy-toolbar-button.css
        //    this.id = legacyButtonId;
        //    this.viewId = legacyButtonId + "-panel";
        //
        //    if (!sss.sheetRegistered(styleSheetUri, sss.AUTHOR_SHEET)) {
        //        sss.loadAndRegisterSheet(styleSheetUri, sss.AUTHOR_SHEET); // Register global so it works in all windows, including palette
        //    }
        //
        //    var addLegacyToolbarButton = function(window) {
        //        var document = window.document;
        //        var toolbox = document.getElementById('navigator-toolbox') || document.getElementById('mail-toolbox');
        //
        //        if (toolbox) {
        //            var palette = toolbox.palette;
        //
        //            if (!palette) {
        //                // palette might take a little longer to appear on some platforms, give it a small delay and try again
        //                window.setTimeout(function() {
        //                    if (toolbox.palette) {
        //                        addLegacyToolbarButton(window);
        //                    }
        //                }, 250);
        //                return;
        //            }
        //
        //            var toolbarButton = document.createElement('toolbarbutton');
        //            toolbarButton.setAttribute('id', legacyButtonId);
        //            toolbarButton.setAttribute('type', 'menu'); // type = panel would be more accurate, but doesn't look as good
        //            toolbarButton.setAttribute('removable', 'true');
        //            toolbarButton.setAttribute('class', 'toolbarbutton-1 chromeclass-toolbar-additional');
        //            toolbarButton.setAttribute('label', vAPI.toolbarButton.label);
        //
        //            var toolbarButtonPanel = document.createElement("panel");
        //            // toolbarButtonPanel.setAttribute('level', 'parent'); NOTE: Setting level to parent breaks the popup for PaleMoon under linux (mouse pointer misaligned with content). For some reason.
        //            vAPI.toolbarButton.populatePanel(document, toolbarButtonPanel);
        //            toolbarButtonPanel.addEventListener('popupshowing', vAPI.toolbarButton.onViewShowing);
        //            toolbarButtonPanel.addEventListener('popuphiding', vAPI.toolbarButton.onViewHiding);
        //            toolbarButton.appendChild(toolbarButtonPanel);
        //
        //            palette.appendChild(toolbarButton);
        //
        //            vAPI.toolbarButton.closePopup = function() {
        //                toolbarButtonPanel.hidePopup();
        //            }
        //
        //            if (!vAPI.localStorage.getBool('legacyToolbarButtonAdded')) {
        //                // No button yet so give it a default location. If forcing the button, just put in in the palette rather than on any specific toolbar (who knows what toolbars will be available or visible!)
        //                var toolbar = !forceLegacyToolbarButton && document.getElementById('nav-bar');
        //                if (toolbar) {
        //                    toolbar.appendChild(toolbarButton);
        //                    toolbar.setAttribute('currentset', toolbar.currentSet);
        //                    document.persist(toolbar.id, 'currentset');
        //                }
        //                vAPI.localStorage.setBool('legacyToolbarButtonAdded', 'true');
        //            } else {
        //                // Find the place to put the button
        //                var toolbars = toolbox.externalToolbars.slice();
        //                for (var child of toolbox.children) {
        //                    if (child.localName === 'toolbar') {
        //                        toolbars.push(child);
        //                    }
        //                }
        //
        //                for (var toolbar of toolbars) {
        //                    var currentsetString = toolbar.getAttribute('currentset');
        //                    if (currentsetString) {
        //                        var currentset = currentsetString.split(',');
        //                        var index = currentset.indexOf(legacyButtonId);
        //                        if (index >= 0) {
        //                            // Found our button on this toolbar - but where on it?
        //                            var before = null;
        //                            for (var i = index + 1; i < currentset.length; i++) {
        //                                before = document.getElementById(currentset[i]);
        //                                if (before) {
        //                                    toolbar.insertItem(legacyButtonId, before);
        //                                    break;
        //                                }
        //                            }
        //                            if (!before) {
        //                                toolbar.insertItem(legacyButtonId);
        //                            }
        //                        }
        //                    }
        //                }
        //            }
        //        }
        //    }
        //
        //    vAPI.toolbarButton.attachToNewWindow = function(win) {
        //        addLegacyToolbarButton(win);
        //    }
        //
        //    cleanupTasks.push(function() {
        //        for ( var win of vAPI.tabs.getWindows() ) {
        //            var toolbarButton = win.document.getElementById(legacyButtonId);
        //            if (toolbarButton) {
        //                toolbarButton.parentNode.removeChild(toolbarButton);
        //            }
        //        }
        //
        //        if (sss.sheetRegistered(styleSheetUri, sss.AUTHOR_SHEET)) {
        //            sss.unregisterSheet(styleSheetUri, sss.AUTHOR_SHEET);
        //        }
        //    }.bind(this));
        //    return;
        //}
        //
        //this.CustomizableUI = CustomizableUI;
        //
        //this.defaultArea = CustomizableUI.AREA_NAVBAR;
        //this.styleURI = [
        //    '#' + this.id + '.off {',
        //    'list-style-image: url(',
        //    vAPI.getURL('img/browsericons/icon16-off.svg'),
        //    ');',
        //    '}',
        //    '#' + this.id + ' {',
        //    'list-style-image: url(',
        //    vAPI.getURL('img/browsericons/icon16.svg'),
        //    ');',
        //    '}',
        //    '#' + this.viewId + ' {',
        //    'width: 160px;',
        //    'height: 290px;',
        //    'overflow: hidden !important;',
        //    '}'
        //];
        //
        //var platformVersion = Services.appinfo.platformVersion;
        //
        //if ( Services.vc.compare(platformVersion, '36.0') < 0 ) {
        //    this.styleURI.push(
        //        '#' + this.id + '[badge]:not([badge=""])::after {',
        //        'position: absolute;',
        //        'margin-left: -16px;',
        //        'margin-top: 3px;',
        //        'padding: 1px 2px;',
        //        'font-size: 9px;',
        //        'font-weight: bold;',
        //        'color: #fff;',
        //        'background: #666;',
        //        'content: attr(badge);',
        //        '}'
        //    );
        //} else {
        //    this.CUIEvents = {};
        //    var updateBadge = function() {
        //        var wId = vAPI.toolbarButton.id;
        //        var buttonInPanel = CustomizableUI.getWidget(wId).areaType === CustomizableUI.TYPE_MENU_PANEL;
        //
        //        for ( var win of vAPI.tabs.getWindows() ) {
        //            var button = win.document.getElementById(wId);
        //            if ( buttonInPanel ) {
        //                button.classList.remove('badged-button');
        //                continue;
        //            }
        //            if ( button === null ) {
        //                continue;
        //            }
        //            button.classList.add('badged-button');
        //        }
        //
        //        if ( buttonInPanel ) {
        //            return;
        //        }
        //
        //        // Anonymous elements need some time to be reachable
        //        setTimeout(this.updateBadgeStyle, 250);
        //    }.bind(this.CUIEvents);
        //    this.CUIEvents.onCustomizeEnd = updateBadge;
        //    this.CUIEvents.onWidgetUnderflow = updateBadge;
        //
        //    this.CUIEvents.updateBadgeStyle = function() {
        //        var css = [
        //            'background: #666',
        //            'color: #fff'
        //        ].join(';');
        //
        //        for ( var win of vAPI.tabs.getWindows() ) {
        //            var button = win.document.getElementById(vAPI.toolbarButton.id);
        //            if ( button === null ) {
        //                continue;
        //            }
        //            var badge = button.ownerDocument.getAnonymousElementByAttribute(
        //                button,
        //                'class',
        //                'toolbarbutton-badge'
        //            );
        //            if ( !badge ) {
        //                return;
        //            }
        //
        //            badge.style.cssText = css;
        //        }
        //    };
        //
        //    this.onCreated = function(button) {
        //        button.setAttribute('badge', '');
        //        setTimeout(updateBadge, 250);
        //    };
        //
        //    CustomizableUI.addListener(this.CUIEvents);
        //}
        //
        //this.styleURI = Services.io.newURI(
        //    'data:text/css,' + encodeURIComponent(this.styleURI.join('')),
        //    null,
        //    null
        //);
        //
        //this.closePopup = function(tabBrowser) {
        //    CustomizableUI.hidePanelForNode(
        //        tabBrowser.ownerDocument.getElementById(vAPI.toolbarButton.viewId)
        //    );
        //};
        //
        //CustomizableUI.createWidget(this);
        //
        //
        //cleanupTasks.push(function() {
        //    if ( this.CUIEvents ) {
        //        CustomizableUI.removeListener(this.CUIEvents);
        //    }
        //
        //    CustomizableUI.destroyWidget(this.id);
        //
        //    for ( var win of vAPI.tabs.getWindows() ) {
        //        var panel = win.document.getElementById(this.viewId);
        //        panel.parentNode.removeChild(panel);
        //        win.QueryInterface(Ci.nsIInterfaceRequestor)
        //            .getInterface(Ci.nsIDOMWindowUtils)
        //            .removeSheet(this.styleURI, 1);
        //    }
        //}.bind(this));
        //
        //this.init = null;
    };

    return {
        init: init
    }
};