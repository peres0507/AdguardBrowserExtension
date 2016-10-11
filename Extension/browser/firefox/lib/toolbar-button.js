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

/* global Components, Prefs, Services, WorkaroundUtils */

/**
 * Firefox toolbar toggle button
 */
var ToolbarButton = (function (api) {

    var TOOLBAR_BUTTON_ID = 'adguard-toggle-button';
    var TOOLBAR_TYPE = 'view';
    var TOOLBAR_VIEW_ID = 'adguard-toggle-panel';
    var LABEL = "AG";
    var TOOLTIP_TEXT = "AG tooltip";

    var ICON_GRAY = {
        '16': Prefs.getUrl('skin/firefox-gray-16.png'),
        '32': Prefs.getUrl('skin/firefox-gray-32.png')
    };
    var ICON_BLUE = {
        '16': Prefs.getUrl('content/skin/firefox-blue-16.png'),
        '32': Prefs.getUrl('content/skin/firefox-blue-32.png')
    };
    var ICON_GREEN = {
        '16': Prefs.getUrl('content/skin/firefox-16.png'),
        '32': Prefs.getUrl('content/skin/firefox-32.png')
    };

    var CustomizableUI;
    var defaultArea;
    var styleURI;
    var CUIEvents;

    var init = function (UI) {
        console.log('Init toolbar button');

        //vAPI.messaging.globalMessageManager.addMessageListener(
        //    location.host + ':closePopup',
        //    vAPI.toolbarButton.onPopupCloseRequested
        //);

        //cleanupTasks.push(function() {
        //    vAPI.messaging.globalMessageManager.removeMessageListener(
        //        location.host + ':closePopup',
        //        vAPI.toolbarButton.onPopupCloseRequested
        //    );
        //});

        try {
            CustomizableUI = Components.utils.import('resource:///modules/CustomizableUI.jsm', null).CustomizableUI;
        } catch (ex) {
            //Ignore exception
        }

        //if (!CustomizableUI) {
        //    // Create a fallback non-customizable UI button
        //    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
        //    var styleSheetUri = Services.io.newURI(vAPI.getURL("css/legacy-toolbar-button.css"), null, null);
        //
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

        defaultArea = CustomizableUI.AREA_NAVBAR;
        styleURI = [
            '#' + TOOLBAR_BUTTON_ID + '.off {',
            'list-style-image: url(',
            ICON_GRAY['16'],
            ');',
            '}',
            '#' + TOOLBAR_BUTTON_ID + ' {',
            'list-style-image: url(',
            ICON_GRAY['16'],
            ');',
            '}',
            '#' + TOOLBAR_VIEW_ID + ' {',
            'width: 160px;',
            'height: 290px;',
            'overflow: hidden !important;',
            '}'
        ];

        var platformVersion = Services.appinfo.platformVersion;

        if (Services.vc.compare(platformVersion, '36.0') < 0) {
            // Legacy support
            styleURI.push(
                '#' + TOOLBAR_BUTTON_ID + '[badge]:not([badge=""])::after {',
                'position: absolute;',
                'margin-left: -16px;',
                'margin-top: 3px;',
                'padding: 1px 2px;',
                'font-size: 9px;',
                'font-weight: bold;',
                'color: #fff;',
                'background: #666;',
                'content: attr(badge);',
                '}'
            );
        } else {
            CUIEvents = {};
            var updateBadge = function () {
                var buttonInPanel = CustomizableUI.getWidget(TOOLBAR_BUTTON_ID).areaType === CustomizableUI.TYPE_MENU_PANEL;

                //for (var win of vAPI.tabs.getWindows()) {
                //    var button = win.document.getElementById(TOOLBAR_BUTTON_ID);
                //    if ( buttonInPanel ) {
                //        button.classList.remove('badged-button');
                //        continue;
                //    }
                //    if ( button === null ) {
                //        continue;
                //    }
                //    button.classList.add('badged-button');
                //}

                if (buttonInPanel) {
                    return;
                }

                // Anonymous elements need some time to be reachable
                setTimeout(this.updateBadgeStyle, 250);
            }.bind(CUIEvents);

            CUIEvents.onCustomizeEnd = updateBadge;
            CUIEvents.onWidgetUnderflow = updateBadge;

            CUIEvents.updateBadgeStyle = function () {
                var css = [
                    'background: #666',
                    'color: #fff'
                ].join(';');

                //for ( var win of vAPI.tabs.getWindows() ) {
                //    var button = win.document.getElementById(vAPI.toolbarButton.id);
                //    if ( button === null ) {
                //        continue;
                //    }
                //    var badge = button.ownerDocument.getAnonymousElementByAttribute(
                //        button,
                //        'class',
                //        'toolbarbutton-badge'
                //    );
                //    if ( !badge ) {
                //        return;
                //    }
                //
                //    badge.style.cssText = css;
                //}
            };

            var onCreated = function (button) {
                button.setAttribute('badge', '');
                setTimeout(updateBadge, 250);
            };

            CustomizableUI.addListener(CUIEvents);
        }

        styleURI = Services.io.newURI(
            'data:text/css,' + encodeURIComponent(styleURI.join('')),
            null,
            null
        );

        CustomizableUI.createWidget({
            id: TOOLBAR_BUTTON_ID,
            type: TOOLBAR_TYPE,
            viewId: TOOLBAR_VIEW_ID,
            tooltiptext: TOOLTIP_TEXT,
            label: LABEL,
            defaultArea: defaultArea,

            onBeforeCreated: onBeforeCreated,
            onViewShowing: onViewShowing,
            onViewHiding: onViewHiding,
            onCreated: onCreated,

            closePopup: closePopup,
            styleURI: styleURI,
            updateBadge: updateBadge
        });

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
    };

    /**
     * On before widget create handler
     *
     * @param doc
     */
    var onBeforeCreated = function (doc) {
        var panel = doc.createElement('panelview');

        populatePanel(doc, panel);

        doc.getElementById('PanelUI-multiView').appendChild(panel);

        doc.defaultView.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindowUtils)
            .loadSheet(styleURI, 1);
    };

    var populatePanel = function (doc, panel) {
        panel.setAttribute('id', TOOLBAR_VIEW_ID);

        var iframe = doc.createElement('iframe');
        iframe.setAttribute('type', 'content');

        panel.appendChild(iframe);

        var updateTimer = null;
        var delayedResize = function (attempts) {
            if (updateTimer) {
                return;
            }

            // Sanity check
            attempts = (attempts || 0) + 1;
            if (attempts > 1000) {
                console.error('delayedResize: giving up after too many attemps');
                return;
            }

            updateTimer = setTimeout(resizePopup, 10, attempts);
        };

        var resizePopup = function (attempts) {
            updateTimer = null;
            var body = iframe.contentDocument.body;
            panel.parentNode.style.maxWidth = 'none';
            // https://github.com/chrisaljoudi/uBlock/issues/730
            // Voodoo programming: this recipe works
            var toPixelString = function (pixels) {
                return pixels.toString() + 'px';
            };

            var clientHeight = body.clientHeight;
            iframe.style.height = toPixelString(clientHeight);
            panel.style.height = toPixelString(clientHeight + (panel.boxObject.height - panel.clientHeight));

            var clientWidth = body.clientWidth;
            iframe.style.width = toPixelString(clientWidth);
            panel.style.width = toPixelString(clientWidth + (panel.boxObject.width - panel.clientWidth));

            if (iframe.clientHeight !== body.clientHeight || iframe.clientWidth !== body.clientWidth) {
                delayedResize(attempts);
            }
        };

        var onPopupReady = function () {
            var win = this.contentWindow;

            if (!win || win.location.host !== location.host) {
                return;
            }

            if (CustomizableUI) {
                var placement = CustomizableUI.getPlacementOfWidget(TOOLBAR_BUTTON_ID);
                if (placement.area === CustomizableUI.AREA_PANEL) {
                    // Add some overrides for displaying the popup correctly in a panel
                    win.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils)
                        .loadSheet(Services.io.newURI(Prefs.getURL("skin/badge.css"), null, null), Components.interfaces.nsIDOMWindowUtils.AUTHOR_SHEET);
                }
            }

            new win.MutationObserver(delayedResize).observe(win.document.body, {
                attributes: true,
                characterData: true,
                subtree: true
            });

            delayedResize();
        };

        iframe.addEventListener('load', onPopupReady, true);
    };

    var onViewShowing = function (e) {
        e.target.firstChild.setAttribute('src', 'chrome://adguard/content/popup.html');

        //TODO: Send message to content page
        console.log(contentScripts);
        contentScripts.sendMessageToWorker(e.target, {type: 'resizePanelPopup'});
    };

    var onViewHiding = function (e) {
        e.target.parentNode.style.maxWidth = '';
        e.target.firstChild.setAttribute('src', 'about:blank');
    };


    var closePopup = function (tabBrowser) {
        CustomizableUI.hidePanelForNode(
            tabBrowser.ownerDocument.getElementById(TOOLBAR_VIEW_ID)
        );
    };


    var updateBadgeText = function (text) {
        var blockedText = WorkaroundUtils.getBlockedCountText(text);
        //TODO: Implement

        //contentScripts.sendMessageToWorker(e.target, {type: 'initPanelPopup', tabInfo: {}, filteringInfo: {}});
    };

    var updateIconState = function (options) {
        var icon;
        if (options.disabled) {
            icon = ICON_GRAY;
        } else if (options.adguardDetected) {
            icon = ICON_BLUE;
        } else {
            icon = ICON_GREEN;
        }

        //TODO: Implement
    };


    //EXPOSE API

    /**
     * Initializes toolbar button
     *
     * @param UI
     * @type {Function}
     */
    api.init = init;

    /**
     * Updates button badge text
     *
     * @param text
     * @type {Function}
     */
    api.updateBadgeText = updateBadgeText;

    /**
     * Update button icon
     *
     * @param options icon display options
     * @type {Function}
     */
    api.updateIconState = updateIconState;

    return api;
})(ToolbarButton || {});