import { __assign, __read, __spreadArray } from "tslib";
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
import _cloneDeep from 'lodash.clonedeep';
import _isEqualWith from 'lodash.isequalwith';
import $ from 'jquery';
import wreqr from '../../js/wreqr';
import GoldenLayout from 'golden-layout';
import user from '../singletons/user-instance';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'sani... Remove this comment to see the full error message
import sanitize from 'sanitize-html';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AllOutIcon from '@mui/icons-material/AllOut';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ExtensionPoints from '../../extension-points/extension-points';
import { Visualizations } from '../visualization/visualizations';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks';
import { TypedUserInstance } from '../singletons/TypedUser';
import PopoutIcon from '@mui/icons-material/OpenInNew';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, } from '@mui/material';
import { StartupDataStore } from '../../js/model/Startup/startup';
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
            minItemHeight: 50,
            minItemWidth: 50,
            headerHeight: 44,
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
var GoldenLayoutWindowCommunicationEvents = {
    requestInitialState: 'requestInitialState',
    consumeInitialState: 'consumeInitialState',
    consumeStateChange: 'consumeStateChange',
    consumePreferencesChange: 'consumePreferencesChange',
    consumeSubwindowLayoutChange: 'consumeSubwindowLayoutChange',
    consumeNavigationChange: 'consumeNavigationChange',
    consumeWreqrEvent: 'consumeWreqrEvent',
};
var GoldenLayoutComponentHeader = function (_a) {
    var viz = _a.viz, tab = _a.tab, options = _a.options, componentState = _a.componentState, container = _a.container, name = _a.name;
    var _b = __read(React.useState(tab.header.element.width()), 2), width = _b[0], setWidth = _b[1];
    React.useEffect(function () {
        if (tab) {
            tab.header.parent.on('resize', function () {
                setWidth(tab.header.element.width());
            });
        }
    }, [tab]);
    var isMinimized = width <= 100;
    return (React.createElement(ExtensionPoints.providers, null,
        React.createElement("div", { "data-id": "".concat(name, "-tab"), className: "flex flex-row items-center flex-nowrap ".concat(isMinimized ? 'hidden' : '') },
            React.createElement(Grid, { item: true, className: "px-2 text-lg" },
                React.createElement("div", null, tab.titleElement.text())),
            React.createElement(Grid, { item: true }, viz.header ? (React.createElement(viz.header, __assign({}, _.extend({}, options, componentState, {
                container: container,
            })))) : null),
            React.createElement(Grid, { item: true }, !tab.contentItem.layoutManager.isSubWindow &&
                tab.closeElement[0].style.display !== 'none' ? (React.createElement(Button, { "data-id": "popout-tab-button", onClick: function () {
                    tab.contentItem.popout();
                } },
                React.createElement(PopoutIcon, null))) : null),
            React.createElement(Grid, { item: true }, tab.closeElement[0].style.display !== 'none' ? (React.createElement(Button, { "data-id": "close-tab-button", onClick: function (e) {
                    tab._onCloseClickFn(e);
                } },
                React.createElement(CloseIcon, null))) : null))));
};
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
 *  Overrides navigation functionality within subwindows of golden layout, so that navigation is handled by the main window.
 *
 *  Notice we do this as a component rather than a hook so we can override the same useHistory instance that the visualization is using.
 *  (we temporarily eject from react to use golden layout, and rewrap each visual in it's own instance of the various providers, like react router)
 *
 *  We could rewrite it as a hook and put it further down in the tree, but this is the same thing so no need.
 *
 *  Also notice we attach this at the visual level for that reason, rather than at the single golden layout instance level.
 */
var UseSubwindowConsumeNavigationChange = function (_a) {
    var goldenLayout = _a.goldenLayout;
    var history = useHistory();
    React.useEffect(function () {
        if (goldenLayout && history && goldenLayout.isSubWindow) {
            var callback_1 = function (e) {
                var _a, _b;
                if (((_a = e.target) === null || _a === void 0 ? void 0 : _a.constructor) === HTMLAnchorElement &&
                    !((_b = e.target) === null || _b === void 0 ? void 0 : _b.href.startsWith('blob'))) {
                    e.preventDefault();
                    goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.consumeNavigationChange, {
                        href: e.target.href,
                    });
                }
            };
            document.addEventListener('click', callback_1);
            history.replace = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.consumeNavigationChange, {
                    replace: args,
                });
            };
            history.push = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.consumeNavigationChange, {
                    push: args,
                });
            };
            return function () {
                document.removeEventListener('click', callback_1);
            };
        }
        return function () { };
    }, [history, goldenLayout]);
    return null;
};
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
/**
 *  Tells the main window of golden layout to listen for navigation changes in the subwindow.  These are translated to be handled by the main window instead.
 *  Notice we attach this in the single instance of gl, not the individual components like the subwindows who send the event.
 */
var useWindowConsumeNavigationChange = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized;
    var history = useHistory();
    React.useEffect(function () {
        if (isInitialized && goldenLayout && history && !goldenLayout.isSubWindow) {
            var callback_2 = function (params) {
                if (params.href && params.href.startsWith('http')) {
                    // didn't not see a way to handle full urls with react router dom, but location works just as well I think
                    location = params.href;
                }
                else if (params.href) {
                    history.location = params.href;
                }
                else if (params.replace) {
                    history.replace.apply(undefined, params.replace);
                }
                else if (params.push) {
                    history.push.apply(undefined, params.push);
                }
            };
            goldenLayout.eventHub.on(GoldenLayoutWindowCommunicationEvents.consumeNavigationChange, callback_2);
            return function () {
                goldenLayout.eventHub.off(GoldenLayoutWindowCommunicationEvents.consumeNavigationChange, callback_2);
            };
        }
        return function () { };
    }, [history, goldenLayout, isInitialized]);
    return null;
};
var GoldenLayoutComponent = function (_a) {
    var ComponentView = _a.ComponentView, options = _a.options, container = _a.container, goldenLayout = _a.goldenLayout;
    var _b = __read(React.useState(container.width), 2), width = _b[0], setWidth = _b[1];
    React.useEffect(function () {
        if (container) {
            container.on('resize', function () {
                setWidth(container.width);
            });
        }
    }, [container]);
    var isMinimized = width <= 100;
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
                    var renderRoot = createRoot(tab.element[0]);
                    renderRoot.render(React.createElement(GoldenLayoutComponentHeader, { viz: viz, tab: tab, options: options, componentState: componentState, container: container, name: name }));
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
            var renderRoot = createRoot(stack.header.controlsContainer[0]);
            renderRoot.render(React.createElement(GoldenLayoutToolbar, { stack: stack }));
            clearInterval(intervalId);
        }
        catch (err) { }
    }, 100);
}
var GoldenLayoutToolbar = function (_a) {
    var stack = _a.stack;
    var _b = __read(React.useState(stack.header.element.width()), 2), width = _b[0], setWidth = _b[1];
    React.useEffect(function () {
        if (stack) {
            stack.on('resize', function () {
                setWidth(stack.header.element.width());
            });
        }
    }, [stack]);
    var isMinimized = width <= 100;
    return (React.createElement(ExtensionPoints.providers, null,
        React.createElement(Grid, { container: true, direction: "row", wrap: "nowrap" }, isMinimized ? (React.createElement(React.Fragment, null,
            ' ',
            React.createElement(Grid, { item: true },
                React.createElement(Button, { "data-id": "maximise-tab-button", onClick: function () {
                        var prevWidth = stack.config.prevWidth || 500;
                        var prevHeight = stack.config.prevHeight || 500;
                        stack.contentItems[0].container.setSize(prevWidth, prevHeight);
                    } },
                    React.createElement(MaximizeIcon, null))))) : (React.createElement(React.Fragment, null,
            React.createElement(Grid, { item: true },
                React.createElement(Button, { "data-id": "minimise-layout-button", onClick: function () {
                        stack.config.prevWidth =
                            stack.getActiveContentItem().container.width;
                        stack.config.prevHeight =
                            stack.getActiveContentItem().container.height;
                        stack.contentItems[0].container.setSize(10, 45);
                    } },
                    React.createElement(MinimizeIcon, null))),
            React.createElement(Grid, { item: true },
                React.createElement(Button, { "data-id": "maximise-layout-button", onClick: function () {
                        stack.toggleMaximise();
                    } },
                    React.createElement(AllOutIcon, null))),
            stack.layoutManager.isSubWindow ? null : (React.createElement(Grid, { item: true },
                React.createElement(Button, { "data-id": "popout-layout-button", onClick: function () {
                        stack.popout();
                    } },
                    React.createElement(PopoutIcon, null)))),
            React.createElement(Grid, { item: true }, stack.header._isClosable() ? (React.createElement(Button, { "data-id": "close-layout-button", onClick: function () {
                    if (stack.isMaximised) {
                        stack.toggleMaximise();
                    }
                    stack.remove();
                } },
                React.createElement(CloseIcon, null))) : null))))));
};
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
var useListenToGoldenLayoutWindowClosed = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized;
    React.useEffect(function () {
        if (goldenLayout && isInitialized && !goldenLayout.isSubWindow) {
            goldenLayout.on('windowClosed', function (event) {
                // order of eventing is a bit off in golden layout, so we need to wait for reconciliation of windows to actually finish
                // while gl does emit a stateChanged, it's missing an event, and it's before the popouts reconcile
                setTimeout(function () {
                    goldenLayout.emit('stateChanged', event);
                }, 0);
            });
            return function () {
                goldenLayout.off('windowClosed');
            };
        }
        return function () { };
    }, [goldenLayout, isInitialized]);
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
var useProvideStateChange = function (_a) {
    var goldenLayout = _a.goldenLayout, lazyResults = _a.lazyResults, isInitialized = _a.isInitialized;
    React.useEffect(function () {
        if (isInitialized && goldenLayout && lazyResults) {
            var callback = function () {
                goldenLayout.eventHub._childEventSource = null;
                goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.consumeStateChange, {
                    lazyResults: lazyResults,
                });
            };
            var filteredResultsSubscription_1 = lazyResults.subscribeTo({
                subscribableThing: 'filteredResults',
                callback: callback,
            });
            var selectedResultsSubscription_1 = lazyResults.subscribeTo({
                subscribableThing: 'selectedResults',
                callback: callback,
            });
            var statusSubscription_1 = lazyResults.subscribeTo({
                subscribableThing: 'status',
                callback: callback,
            });
            var filterTreeSubscription_1 = lazyResults.subscribeTo({
                subscribableThing: 'filterTree',
                callback: callback,
            });
            return function () {
                filteredResultsSubscription_1();
                selectedResultsSubscription_1();
                statusSubscription_1();
                filterTreeSubscription_1();
            };
        }
        return function () { };
    }, [lazyResults, lazyResults === null || lazyResults === void 0 ? void 0 : lazyResults.results, isInitialized, goldenLayout]);
};
var useProvideInitialState = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized, lazyResults = _a.lazyResults;
    React.useEffect(function () {
        if (isInitialized &&
            goldenLayout &&
            lazyResults &&
            !goldenLayout.isSubWindow) {
            var handleInitializeState = function () {
                // golden layout doesn't properly clear this flag
                goldenLayout.eventHub._childEventSource = null;
                goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.consumeInitialState, {
                    lazyResults: lazyResults,
                });
            };
            goldenLayout.eventHub.on(GoldenLayoutWindowCommunicationEvents.requestInitialState, handleInitializeState);
            return function () {
                try {
                    goldenLayout.eventHub.off(GoldenLayoutWindowCommunicationEvents.requestInitialState);
                }
                catch (err) {
                    console.log(err);
                }
            };
        }
        return function () { };
    }, [isInitialized, goldenLayout, lazyResults, lazyResults === null || lazyResults === void 0 ? void 0 : lazyResults.results]);
};
var useConsumeInitialState = function (_a) {
    var goldenLayout = _a.goldenLayout, lazyResults = _a.lazyResults, isInitialized = _a.isInitialized;
    var _b = __read(React.useState(false), 2), hasConsumedInitialState = _b[0], setHasConsumedInitialState = _b[1];
    React.useEffect(function () {
        if (isInitialized &&
            !hasConsumedInitialState &&
            goldenLayout &&
            lazyResults &&
            goldenLayout.isSubWindow) {
            var onSyncStateCallback_1 = function (eventData) {
                setHasConsumedInitialState(true);
                lazyResults.reset({
                    filterTree: eventData.lazyResults.filterTree,
                    results: Object.values(eventData.lazyResults.results).map(function (result) {
                        return _cloneDeep(result.plain);
                    }),
                    highlights: eventData.lazyResults.highlights,
                    sorts: eventData.lazyResults.persistantSorts,
                    sources: eventData.lazyResults.sources,
                    status: eventData.lazyResults.status,
                    didYouMeanFields: eventData.lazyResults.didYouMeanFields,
                    showingResultsForFields: eventData.lazyResults.showingResultsForFields,
                });
                lazyResults._resetSelectedResults();
                Object.values(eventData.lazyResults.selectedResults).forEach(function (result) {
                    lazyResults.results[result.plain.id].controlSelect();
                });
            };
            goldenLayout.eventHub.on(GoldenLayoutWindowCommunicationEvents.consumeInitialState, onSyncStateCallback_1);
            goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.requestInitialState, {});
            return function () {
                goldenLayout.eventHub.off(GoldenLayoutWindowCommunicationEvents.consumeInitialState, onSyncStateCallback_1);
            };
        }
        return function () { };
    }, [goldenLayout, lazyResults, isInitialized]);
};
var useConsumeStateChange = function (_a) {
    var goldenLayout = _a.goldenLayout, lazyResults = _a.lazyResults, isInitialized = _a.isInitialized;
    React.useEffect(function () {
        if (goldenLayout && lazyResults && isInitialized) {
            var onSyncStateCallback_2 = function (eventData) {
                var results = Object.values(lazyResults.results).map(function (lazyResult) {
                    return {
                        plain: lazyResult.plain,
                        isSelected: lazyResult.isSelected,
                    };
                });
                var callbackResults = Object.values(eventData.lazyResults.results).map(function (lazyResult) {
                    return {
                        plain: lazyResult.plain,
                        isSelected: lazyResult.isSelected,
                    };
                });
                var filterTree = lazyResults.filterTree;
                var callbackFilterTree = eventData.lazyResults.filterTree;
                if (!_isEqualWith(results, callbackResults) ||
                    !_isEqualWith(filterTree, callbackFilterTree)) {
                    lazyResults.reset({
                        filterTree: eventData.lazyResults.filterTree,
                        results: Object.values(eventData.lazyResults.results).map(function (result) { return _cloneDeep(result.plain); }),
                        highlights: eventData.lazyResults.highlights,
                        sorts: eventData.lazyResults.persistantSorts,
                        sources: eventData.lazyResults.sources,
                        status: eventData.lazyResults.status,
                        didYouMeanFields: eventData.lazyResults.didYouMeanFields,
                        showingResultsForFields: eventData.lazyResults.showingResultsForFields,
                    });
                    lazyResults._resetSelectedResults();
                    Object.values(eventData.lazyResults.selectedResults).forEach(function (result) {
                        lazyResults.results[result.plain.id].controlSelect();
                    });
                }
            };
            goldenLayout.eventHub.on(GoldenLayoutWindowCommunicationEvents.consumeStateChange, onSyncStateCallback_2);
            return function () {
                goldenLayout.eventHub.off(GoldenLayoutWindowCommunicationEvents.consumeStateChange, onSyncStateCallback_2);
            };
        }
        return function () { };
    }, [goldenLayout, lazyResults, isInitialized]);
};
var useConsumePreferencesChange = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized;
    useListenTo(TypedUserInstance.getPreferences(), 'sync', function () {
        if (goldenLayout && isInitialized) {
            goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.consumePreferencesChange, {
                preferences: TypedUserInstance.getPreferences().toJSON(),
            });
        }
    });
    React.useEffect(function () {
        if (goldenLayout && isInitialized) {
            goldenLayout.eventHub.on(GoldenLayoutWindowCommunicationEvents.consumePreferencesChange, function (_a) {
                var preferences = _a.preferences;
                TypedUserInstance.sync(preferences);
            });
            return function () { };
        }
        return function () { };
    }, [goldenLayout, isInitialized]);
};
function useConsumeSubwindowLayoutChange(_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized;
    React.useEffect(function () {
        if (goldenLayout && isInitialized && !goldenLayout.isSubWindow) {
            goldenLayout.eventHub.on(GoldenLayoutWindowCommunicationEvents.consumeSubwindowLayoutChange, function () {
                goldenLayout.emit('stateChanged', 'subwindow');
            });
            return function () {
                goldenLayout.eventHub.off(GoldenLayoutWindowCommunicationEvents.consumeSubwindowLayoutChange);
            };
        }
        return function () { };
    }, [goldenLayout, isInitialized]);
}
/**
 *  Notice that we are only forwarding events that start with 'search' for now, as these are drawing events.
 */
var useProvideWreqrEvents = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized;
    useListenTo(wreqr.vent, 'all', function (event, args, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.doNotPropagate, doNotPropagate = _c === void 0 ? false : _c;
        if (goldenLayout && isInitialized) {
            if (event.startsWith('search') && !doNotPropagate) {
                goldenLayout.eventHub._childEventSource = null; // golden layout doesn't properly clear this flag
                goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.consumeWreqrEvent, {
                    event: event,
                    args: args,
                });
            }
        }
    });
};
var useConsumeWreqrEvents = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized;
    React.useEffect(function () {
        if (goldenLayout && isInitialized) {
            goldenLayout.eventHub.on(GoldenLayoutWindowCommunicationEvents.consumeWreqrEvent, function (_a) {
                var event = _a.event, args = _a.args;
                wreqr.vent.trigger(event, args, { doNotPropagate: true });
            });
            return function () {
                goldenLayout.eventHub.off(GoldenLayoutWindowCommunicationEvents.consumeWreqrEvent);
            };
        }
        return function () { };
    }, [goldenLayout, isInitialized]);
};
var useCrossWindowGoldenLayoutCommunication = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized, options = _a.options;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: options.selectionInterface,
    });
    useProvideStateChange({
        goldenLayout: goldenLayout,
        lazyResults: lazyResults,
        isInitialized: isInitialized,
    });
    useProvideInitialState({ goldenLayout: goldenLayout, isInitialized: isInitialized, lazyResults: lazyResults });
    useConsumeInitialState({ goldenLayout: goldenLayout, lazyResults: lazyResults, isInitialized: isInitialized });
    useConsumeStateChange({ goldenLayout: goldenLayout, lazyResults: lazyResults, isInitialized: isInitialized });
    useConsumePreferencesChange({ goldenLayout: goldenLayout, isInitialized: isInitialized });
    useConsumeSubwindowLayoutChange({ goldenLayout: goldenLayout, isInitialized: isInitialized });
    useListenToGoldenLayoutWindowClosed({ goldenLayout: goldenLayout, isInitialized: isInitialized });
    useWindowConsumeNavigationChange({ goldenLayout: goldenLayout, isInitialized: isInitialized });
    useProvideWreqrEvents({ goldenLayout: goldenLayout, isInitialized: isInitialized });
    useConsumeWreqrEvents({ goldenLayout: goldenLayout, isInitialized: isInitialized });
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
    return (React.createElement("div", { "data-element": "golden-layout", className: "is-minimised h-full w-full" },
        popupHandlingState === 'blocked' ? (React.createElement(HandlePopoutsBlocked, { goldenLayout: goldenLayout, setPopupHandlingState: setPopupHandlingState })) : null,
        React.createElement("div", { ref: setGoldenLayoutAttachElement, className: "golden-layout-container w-full h-full" })));
};
//# sourceMappingURL=golden-layout.view.js.map