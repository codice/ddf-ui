import { __read, __spreadArray } from "tslib";
/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'underscore';
import _merge from 'lodash/merge';
import _debounce from 'lodash/debounce';
import $ from 'jquery';
import wreqr from '../../js/wreqr';
import GoldenLayout from 'golden-layout';
import user from '../singletons/user-instance';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'sani... Remove this comment to see the full error message
import sanitize from 'sanitize-html';
import Button from '@mui/material/Button';
import ExtensionPoints from '../../extension-points/extension-points';
import { Visualizations } from '../visualization/visualizations';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import { Dialog, DialogActions, DialogContent, DialogTitle, } from '@mui/material';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { StackToolbar, HeaderHeight, MinimizedHeight } from './stack-toolbar';
import { GoldenLayoutComponentHeader } from './visual-toolbar';
import { UseSubwindowConsumeNavigationChange, useCrossWindowGoldenLayoutCommunication, GoldenLayoutWindowCommunicationEvents, } from './cross-window-communication';
import { useVerifyMapExistsWhenDrawing } from './verify-map';
var treeMap = function (obj, fn, path) {
    if (path === void 0) { path = []; }
    if (Array.isArray(obj)) {
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        return obj.map(function (v, i) { return treeMap(v, fn, path.concat(i)); });
    }
    if (obj !== null && typeof obj === 'object') {
        return (Object.keys(obj)
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            .map(function (k) { return [k, treeMap(obj[k], fn, path.concat(k))]; })
            .reduce(function (o, _a) {
            var _b = __read(_a, 2), k = _b[0], v = _b[1];
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            o[k] = v;
            return o;
        }, {}));
    }
    return fn(obj, path);
};
// @ts-expect-error ts-migrate(6133) FIXME: 'sanitizeTree' is declared but its value is never ... Remove this comment to see the full error message
var sanitizeTree = function (tree) {
    return treeMap(tree, function (obj) {
        if (typeof obj === 'string') {
            return sanitize(obj, {
                allowedTags: [],
                allowedAttributes: [],
            });
        }
        return obj;
    });
};
function getGoldenLayoutSettings() {
    return {
        settings: {
            showPopoutIcon: false,
            popoutWholeStack: true,
            responsiveMode: 'none',
        },
        dimensions: {
            borderWidth: 8,
            minItemHeight: HeaderHeight,
            minItemWidth: 50,
            headerHeight: HeaderHeight,
            dragProxyWidth: 300,
            dragProxyHeight: 200,
        },
        labels: {
            close: 'close',
            maximise: 'maximize',
            minimise: 'minimize',
            popout: 'open in new window',
            popin: 'pop in',
            tabDropdown: 'additional tabs',
        },
    };
}
/**
 *  For some reason golden layout removes configs from local storage upon first load of popout window, which means refreshing doesn't work.
 *  This prevents this line from doing so: https://github.com/golden-layout/golden-layout/blob/v1.5.9/src/js/LayoutManager.js#L797
 */
;
(function preventRemovalFromStorage() {
    var normalRemoveItem = window.localStorage.removeItem;
    window.localStorage.removeItem = function (key) {
        if (key.includes('gl-window')) {
            return;
        }
        else {
            normalRemoveItem(key);
        }
    };
})();
/**
 *  We attach this at the component level due to how popouts work.
 *  Essentially golden layout disconnects us from React and our providers in popouts to fullscreen visuals,
 *  so we can't use Dialog further up the tree.
 */
var UseMissingParentWindow = function (_a) {
    var goldenLayout = _a.goldenLayout;
    var _b = __read(React.useState(false), 2), missingWindow = _b[0], setMissingWindow = _b[1];
    React.useEffect(function () {
        if (goldenLayout && goldenLayout.isSubWindow && window.opener === null) {
            setMissingWindow(true);
        }
    }, [goldenLayout]);
    if (missingWindow) {
        return (React.createElement(Dialog, { open: true, className: " z-[1000000]" },
            React.createElement(DialogTitle, null, "Could not find parent visualization"),
            React.createElement(DialogContent, null, "Please close the window."),
            React.createElement(DialogActions, null,
                React.createElement(Button, { variant: "contained", onClick: function () {
                        window.close();
                    }, color: "primary" }, "Close Window"))));
    }
    return null;
};
var GoldenLayoutComponent = function (_a) {
    var ComponentView = _a.ComponentView, options = _a.options, container = _a.container, goldenLayout = _a.goldenLayout;
    var height = useContainerSize(container).height;
    var isMinimized = height && height <= MinimizedHeight;
    return (React.createElement(ExtensionPoints.providers, null,
        React.createElement(UseSubwindowConsumeNavigationChange, { goldenLayout: goldenLayout }),
        React.createElement(UseMissingParentWindow, { goldenLayout: goldenLayout }),
        React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full ".concat(isMinimized ? 'hidden' : ''), square: true },
            React.createElement(ComponentView, { selectionInterface: options.selectionInterface }))));
};
// see https://github.com/deepstreamIO/golden-layout/issues/239 for details on why the setTimeout is necessary
// The short answer is it mostly has to do with making sure these ComponentViews are able to function normally (set up events, etc.)
function registerComponent(marionetteView, name, ComponentView, componentOptions, viz) {
    var options = _.extend({}, marionetteView.options, componentOptions);
    marionetteView.goldenLayout.registerComponent(name, function (container, componentState) {
        container.on('open', function () {
            setTimeout(function () {
                var root = createRoot(container.getElement()[0]);
                root.render(React.createElement(GoldenLayoutComponent, { goldenLayout: marionetteView.goldenLayout, options: options, ComponentView: ComponentView, container: container }));
                container.on('destroy', function () {
                    root.unmount();
                });
            }, 0);
        });
        container.on('tab', function (tab) {
            tab.closeElement.off('click').on('click', function (event) {
                if (tab.header.parent.isMaximised &&
                    tab.header.parent.contentItems.length === 1) {
                    tab.header.parent.toggleMaximise();
                }
                tab._onCloseClickFn(event);
            });
            var root = document.createElement('div');
            tab.element.append(root);
            var intervalId = setInterval(function () {
                try {
                    var renderRoot_1 = createRoot(tab.element[0]);
                    renderRoot_1.render(React.createElement(GoldenLayoutComponentHeader, { viz: viz, tab: tab, options: options, componentState: componentState, container: container, name: name }));
                    tab.header.on('destroy', function () {
                        renderRoot_1.unmount();
                    });
                    clearInterval(intervalId);
                }
                catch (err) { }
            }, 100);
        });
    });
}
function removeActiveTabInformation(config) {
    if (config.activeItemIndex !== undefined) {
        config.activeItemIndex = 0;
    }
    if (config.content === undefined || config.content.length === 0) {
        return;
    }
    else {
        return _.forEach(config.content, removeActiveTabInformation);
    }
}
function removeMaximisedInformation(config) {
    delete config.maximisedItemId;
}
function removeOpenPopoutDimensionInformation(config) {
    delete config.dimensions;
    if (config.openPopouts === undefined || config.openPopouts.length === 0) {
        return;
    }
    else {
        return _.forEach(config.openPopouts, removeOpenPopoutDimensionInformation);
    }
}
function removeEphemeralState(config) {
    removeMaximisedInformation(config);
    removeActiveTabInformation(config);
    removeOpenPopoutDimensionInformation(config);
    return config;
}
var FALLBACK_GOLDEN_LAYOUT = [
    {
        type: 'stack',
        content: [
            {
                type: 'component',
                componentName: 'cesium',
                title: '3D Map',
            },
            {
                type: 'component',
                componentName: 'inspector',
                title: 'Inspector',
            },
        ],
    },
];
export var DEFAULT_GOLDEN_LAYOUT_CONTENT = {
    content: StartupDataStore.Configuration.getDefaultLayout() || FALLBACK_GOLDEN_LAYOUT,
};
export var getStringifiedDefaultLayout = function () {
    try {
        return JSON.stringify(DEFAULT_GOLDEN_LAYOUT_CONTENT);
    }
    catch (err) {
        console.warn(err);
        return JSON.stringify(FALLBACK_GOLDEN_LAYOUT);
    }
};
function getGoldenLayoutConfig(_a) {
    var layoutResult = _a.layoutResult, editLayoutRef = _a.editLayoutRef, configName = _a.configName;
    var currentConfig = undefined;
    if (layoutResult) {
        try {
            currentConfig = JSON.parse(layoutResult.metacard.properties.layout);
        }
        catch (err) {
            console.warn('issue parsing a saved layout, falling back to default');
        }
    }
    else if (editLayoutRef) {
        currentConfig = editLayoutRef.current;
    }
    else {
        currentConfig = user.get('user').get('preferences').get(configName);
    }
    if (currentConfig === undefined) {
        currentConfig = DEFAULT_GOLDEN_LAYOUT_CONTENT;
    }
    _merge(currentConfig, getGoldenLayoutSettings());
    return currentConfig;
}
function registerGoldenLayoutComponents(_a) {
    var goldenLayout = _a.goldenLayout, options = _a.options;
    Visualizations.forEach(function (viz) {
        try {
            registerComponent({ goldenLayout: goldenLayout, options: options }, viz.id, viz.view, viz.options, viz);
        }
        catch (err) {
            // likely already registered, in dev
        }
    });
}
export function getInstanceConfig(_a) {
    var goldenLayout = _a.goldenLayout;
    var currentConfig = goldenLayout.toConfig();
    return removeEphemeralState(currentConfig);
}
function handleGoldenLayoutStateChangeInSubwindow(_a) {
    var goldenLayout = _a.goldenLayout;
    // shouldn't need to send anything, as the main window can determine the config from the subwindow
    goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.consumeSubwindowLayoutChange, null);
}
function handleGoldenLayoutStateChange(_a) {
    var options = _a.options, goldenLayout = _a.goldenLayout, currentConfig = _a.currentConfig, lastConfig = _a.lastConfig;
    if (_.isEqual(removeEphemeralState(lastConfig.current), removeEphemeralState(currentConfig))) {
        return;
    }
    lastConfig.current = currentConfig;
    /**
     * If we have this option, then we're editing a layout in the layout editor.
     * Otherwise, we're using a layout (or possibly custom) and need to take a change as indication of moving to custom.
     */
    if (options.editLayoutRef) {
        options.editLayoutRef.current = currentConfig;
    }
    else {
        // can technically do detections of max or empty here
        //https://github.com/deepstreamIO/golden-layout/issues/253
        if (goldenLayout.isInitialised) {
            user.get('user').get('preferences').set(options.configName, currentConfig);
            wreqr.vent.trigger('resize');
            //do not add a window resize event, that will cause an endless loop.  If you need something like that, listen to the wreqr resize event.
        }
        user.get('user').get('preferences').set({
            layoutId: 'custom',
        }, {
            internal: true,
        });
    }
}
/**
 *  Replace the toolbar with our own
 */
function handleGoldenLayoutStackCreated(stack) {
    var intervalId = setInterval(function () {
        try {
            var renderRoot_2 = createRoot(stack.header.controlsContainer[0]);
            renderRoot_2.render(React.createElement(StackToolbar, { stack: stack }));
            stack.on('activeContentItemChanged', function (contentItem) {
                wreqr.vent.trigger('activeContentItemChanged', contentItem);
            });
            stack.on('destroy', function () {
                renderRoot_2.unmount();
            });
            clearInterval(intervalId);
        }
        catch (err) { }
    }, 100);
}
function useContainerSize(container) {
    var _a = __read(React.useState(container.width), 2), width = _a[0], setWidth = _a[1];
    var _b = __read(React.useState(container.height), 2), height = _b[0], setHeight = _b[1];
    React.useEffect(function () {
        if (container) {
            var resizeCallback_1 = function () {
                setWidth(container.width);
                setHeight(container.height);
            };
            container.on('resize', resizeCallback_1);
            return function () {
                container.off('resize', resizeCallback_1);
            };
        }
        return function () { };
    }, [container]);
    return { height: height, width: width };
}
var useUpdateGoldenLayoutSize = function (_a) {
    var wreqr = _a.wreqr, goldenLayout = _a.goldenLayout;
    useListenTo(wreqr.vent, 'gl-updateSize', function () {
        if (goldenLayout && goldenLayout.isInitialised)
            goldenLayout.updateSize();
    });
    React.useEffect(function () {
        if (goldenLayout) {
            var randomString_1 = Math.random().toString();
            $(window).on('resize.' + randomString_1, _debounce(function () {
                if (goldenLayout.isInitialised)
                    goldenLayout.updateSize();
            }, 100, {
                leading: false,
                trailing: true,
            }));
            return function () {
                $(window).off('resize.' + randomString_1);
            };
        }
        return function () { };
    }, [goldenLayout]);
};
var useSendGoldenLayoutReferenceUpwards = function (_a) {
    var options = _a.options, goldenLayout = _a.goldenLayout;
    React.useEffect(function () {
        if (goldenLayout) {
            options.setGoldenLayout(goldenLayout);
        }
        return function () {
            if (goldenLayout) {
                goldenLayout.destroy();
            }
        };
    }, [goldenLayout]);
};
var useAttachGoldenLayout = function (_a) {
    var goldenLayoutAttachElement = _a.goldenLayoutAttachElement, setGoldenLayout = _a.setGoldenLayout, options = _a.options;
    React.useEffect(function () {
        if (goldenLayoutAttachElement) {
            setGoldenLayout(new GoldenLayout(getGoldenLayoutConfig(options), goldenLayoutAttachElement));
        }
    }, [goldenLayoutAttachElement]);
};
var useRegisterGoldenLayoutComponents = function (_a) {
    var options = _a.options, goldenLayout = _a.goldenLayout;
    var _b = __read(React.useState(false), 2), finished = _b[0], setFinished = _b[1];
    React.useEffect(function () {
        if (goldenLayout) {
            registerGoldenLayoutComponents({
                goldenLayout: goldenLayout,
                options: options,
            });
            setFinished(true);
        }
    }, [goldenLayout]);
    return finished;
};
var useListenToGoldenLayoutStateChanges = function (_a) {
    var options = _a.options, goldenLayout = _a.goldenLayout, lastConfig = _a.lastConfig;
    var _b = __read(React.useState(false), 2), finished = _b[0], setFinished = _b[1];
    React.useEffect(function () {
        if (goldenLayout) {
            var debouncedHandleGoldenLayoutStateChange_1 = _.debounce(function (_a) {
                var currentConfig = _a.currentConfig;
                ;
                wreqr.vent.trigger('resize'); // trigger resize of things like map
                if (!goldenLayout.isSubWindow) {
                    // this function applies only to the main window, we have to communicate subwindow updates back to the original window instead
                    handleGoldenLayoutStateChange({
                        options: options,
                        currentConfig: currentConfig,
                        goldenLayout: goldenLayout,
                        lastConfig: lastConfig,
                    });
                }
                else {
                    handleGoldenLayoutStateChangeInSubwindow({ goldenLayout: goldenLayout });
                }
            }, 200);
            /**
             *  There is a bug in golden layout as follows:
             *  If you have a layout with 2 items (inspector above inspector for instance), close an item, then close the other,
             *  the final state change event is not triggered to show content as [] or empty.  Oddly enough it works in other scenarios.
             *  I haven't determined a workaround for this, but it's not bothering users as far as I know at the moment.
             *  Basically the bug is that empty layouts aren't guaranteed to be saved, but non empty will always save appropriately.
             */
            goldenLayout.on('stateChanged', function (event) {
                var _a;
                if (!event) {
                    return;
                }
                var fullyInitialized = goldenLayout.isInitialised &&
                    !((_a = goldenLayout === null || goldenLayout === void 0 ? void 0 : goldenLayout.openPopouts) === null || _a === void 0 ? void 0 : _a.some(function (popout) { return !popout.isInitialised; }));
                if (!fullyInitialized) {
                    setTimeout(function () {
                        goldenLayout.emit('stateChanged', 'retry');
                    }, 200);
                    return;
                }
                var currentConfig = getInstanceConfig({ goldenLayout: goldenLayout });
                /**
                 *  Get the config instantly, that way if we navigate away and the component is removed from the document we still get the correct config
                 *  However, delay the actual attempt to save the config, so we don't save too often.
                 */
                debouncedHandleGoldenLayoutStateChange_1({
                    currentConfig: currentConfig,
                });
            });
            setFinished(true);
            return function () {
                goldenLayout.off('stateChanged');
            };
        }
        return function () { };
    }, [goldenLayout]);
    return finished;
};
/**
 *  This will attach our custom toolbar to the golden layout stack header
 */
var useListenToGoldenLayoutStackCreated = function (_a) {
    var goldenLayout = _a.goldenLayout;
    var _b = __read(React.useState(false), 2), finished = _b[0], setFinished = _b[1];
    React.useEffect(function () {
        if (goldenLayout) {
            goldenLayout.on('stackCreated', handleGoldenLayoutStackCreated);
            setFinished(true);
            return function () {
                goldenLayout.off('stackCreated');
            };
        }
        return function () { };
    }, [goldenLayout]);
    return finished;
};
var useInitGoldenLayout = function (_a) {
    var dependencies = _a.dependencies, goldenLayout = _a.goldenLayout;
    var _b = __read(React.useState(false), 2), finished = _b[0], setFinished = _b[1];
    var _c = __read(React.useState(false), 2), error = _c[0], setError = _c[1];
    var _d = __read(React.useState('allowed'), 2), popupHandlingState = _d[0], setPopupHandlingState = _d[1];
    React.useEffect(function () {
        var _a;
        if (dependencies.every(function (dependency) { return dependency; })) {
            if (goldenLayout.isSubWindow && window.opener === null) {
                setError(true);
            }
            var onInit_1 = function () {
                setFinished(true);
            };
            goldenLayout.on('initialised', onInit_1);
            if (goldenLayout.isSubWindow) {
                // for some reason subwindow stacks lose dimensions, specifically the header height (see _createConfig in golden layout source code)
                goldenLayout.config.dimensions = getGoldenLayoutSettings().dimensions;
            }
            try {
                goldenLayout.init();
            }
            catch (e) {
                if (e.type === 'popoutBlocked') {
                    setPopupHandlingState('blocked');
                    (_a = goldenLayout.openPopouts) === null || _a === void 0 ? void 0 : _a.forEach(function (popout) {
                        popout.close();
                    });
                }
            }
            return function () {
                goldenLayout.off('initialised', onInit_1);
            };
        }
        return function () { };
    }, __spreadArray(__spreadArray([], __read(dependencies), false), [popupHandlingState], false));
    return {
        finished: finished,
        error: error,
        setPopupHandlingState: setPopupHandlingState,
        popupHandlingState: popupHandlingState,
    };
};
var HandlePopoutsBlocked = function (_a) {
    var setPopupHandlingState = _a.setPopupHandlingState, goldenLayout = _a.goldenLayout;
    return (React.createElement(Dialog, { open: true },
        React.createElement(DialogTitle, null, "Visualization popups blocked"),
        React.createElement(DialogContent, null, "Please allow popups for this site, then click the button below to retry loading your visualization layout."),
        React.createElement(DialogActions, null,
            React.createElement(Button, { color: "error", onClick: function () {
                    goldenLayout.config.openPopouts = [];
                    setPopupHandlingState('proceed');
                } }, "Proceed without popups"),
            React.createElement(Button, { variant: "contained", color: "primary", onClick: function () {
                    // try opening two windows, as one is allowed since the user interacts with the button
                    var window1 = window.open('', '_blank');
                    var window2 = window.open('', '_blank');
                    if (window1 && window2) {
                        setPopupHandlingState('allowed');
                    }
                    window1 === null || window1 === void 0 ? void 0 : window1.close();
                    window2 === null || window2 === void 0 ? void 0 : window2.close();
                } }, "Retry"))));
};
export var GoldenLayoutViewReact = function (options) {
    var _a = __read(React.useState(null), 2), goldenLayoutAttachElement = _a[0], setGoldenLayoutAttachElement = _a[1];
    var _b = __read(React.useState(null), 2), goldenLayout = _b[0], setGoldenLayout = _b[1];
    var lastConfig = React.useRef(getGoldenLayoutConfig(options));
    useUpdateGoldenLayoutSize({ wreqr: wreqr, goldenLayout: goldenLayout });
    useSendGoldenLayoutReferenceUpwards({ options: options, goldenLayout: goldenLayout });
    useAttachGoldenLayout({ goldenLayoutAttachElement: goldenLayoutAttachElement, setGoldenLayout: setGoldenLayout, options: options });
    var goldenLayoutComponentsRegistered = useRegisterGoldenLayoutComponents({
        options: options,
        goldenLayout: goldenLayout,
    });
    var listeningToGoldenLayoutStateChanges = useListenToGoldenLayoutStateChanges({ options: options, goldenLayout: goldenLayout, lastConfig: lastConfig });
    var listeningToGoldenLayoutStackCreated = useListenToGoldenLayoutStackCreated({ goldenLayout: goldenLayout });
    var _c = useInitGoldenLayout({
        dependencies: [
            goldenLayoutComponentsRegistered,
            listeningToGoldenLayoutStateChanges,
            listeningToGoldenLayoutStackCreated,
        ],
        goldenLayout: goldenLayout,
    }), finished = _c.finished, error = _c.error, setPopupHandlingState = _c.setPopupHandlingState, popupHandlingState = _c.popupHandlingState;
    useCrossWindowGoldenLayoutCommunication({
        goldenLayout: goldenLayout,
        isInitialized: !error && finished,
        options: options,
    });
    useVerifyMapExistsWhenDrawing({
        goldenLayout: goldenLayout,
        isInitialized: !error && finished,
    });
    return (React.createElement("div", { "data-element": "golden-layout", className: "is-minimised h-full w-full" },
        popupHandlingState === 'blocked' ? (React.createElement(HandlePopoutsBlocked, { goldenLayout: goldenLayout, setPopupHandlingState: setPopupHandlingState })) : null,
        React.createElement("div", { ref: setGoldenLayoutAttachElement, className: "golden-layout-container w-full h-full" })));
};
//# sourceMappingURL=golden-layout.view.js.map