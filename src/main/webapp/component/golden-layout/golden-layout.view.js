import { __assign, __read } from "tslib";
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
import * as ReactDOM from 'react-dom';
import _ from 'underscore';
import _merge from 'lodash/merge';
import _debounce from 'lodash/debounce';
import $ from 'jquery';
import wreqr from '../../js/wreqr';
import GoldenLayout from 'golden-layout';
import properties from '../../js/properties';
import user from '../singletons/user-instance';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'sani... Remove this comment to see the full error message
import sanitize from 'sanitize-html';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import AllOutIcon from '@material-ui/icons/AllOut';
import MinimizeIcon from '@material-ui/icons/Minimize';
import MaximizeIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import ExtensionPoints from '../../extension-points/extension-points';
import { Visualizations } from '../visualization/visualizations';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import Paper from '@material-ui/core/Paper';
import { Elevations } from '../theme/theme';
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
                allowedAttributes: []
            });
        }
        return obj;
    });
};
function getGoldenLayoutSettings() {
    return {
        settings: {
            showPopoutIcon: false,
            responsiveMode: 'none'
        },
        dimensions: {
            borderWidth: 8,
            minItemHeight: 50,
            minItemWidth: 50,
            headerHeight: 44,
            dragProxyWidth: 300,
            dragProxyHeight: 200
        },
        labels: {
            close: 'close',
            maximise: 'maximize',
            minimise: 'minimize',
            popout: 'open in new window',
            popin: 'pop in',
            tabDropdown: 'additional tabs'
        }
    };
}
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
                container: container
            })))) : null),
            React.createElement(Grid, { item: true }, tab.closeElement[0].style.display !== 'none' ? (React.createElement(Button, { "data-id": "close-tab-button", onClick: function (e) {
                    tab._onCloseClickFn(e);
                } },
                React.createElement(CloseIcon, null))) : null))));
};
var GoldenLayoutComponent = function (_a) {
    var ComponentView = _a.ComponentView, options = _a.options, container = _a.container;
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
                ReactDOM.render(React.createElement(GoldenLayoutComponent, { options: options, ComponentView: ComponentView, container: container }), container.getElement()[0]);
                container.on('destroy', function () {
                    ReactDOM.unmountComponentAtNode(container.getElement()[0]);
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
                    ReactDOM.render(React.createElement(GoldenLayoutComponentHeader, { viz: viz, tab: tab, options: options, componentState: componentState, container: container, name: name }), tab.element[0]);
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
function removeEphemeralState(config) {
    removeMaximisedInformation(config);
    removeActiveTabInformation(config);
    return config;
}
var FALLBACK_GOLDEN_LAYOUT = [
    {
        type: 'stack',
        content: [
            {
                type: 'component',
                componentName: 'cesium',
                title: '3D Map'
            },
            {
                type: 'component',
                componentName: 'inspector',
                title: 'Inspector'
            },
        ]
    },
];
export var DEFAULT_GOLDEN_LAYOUT_CONTENT = {
    content: properties.defaultLayout || FALLBACK_GOLDEN_LAYOUT
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
function handleGoldenLayoutStateChange(_a) {
    var options = _a.options, goldenLayout = _a.goldenLayout, currentConfig = _a.currentConfig, lastConfig = _a.lastConfig;
    ;
    wreqr.vent.trigger('resize'); // do we need this?
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
            layoutId: 'custom'
        }, {
            internal: true
        });
    }
}
/**
 *  Replace the toolbar with our own
 */
function handleGoldenLayoutStackCreated(stack) {
    var intervalId = setInterval(function () {
        try {
            ReactDOM.render(React.createElement(GoldenLayoutToolbar, { stack: stack }), stack.header.controlsContainer[0]);
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
            React.createElement(Grid, { item: true }, stack.header._isClosable() ? (React.createElement(Button, { "data-id": "close-layout-button", onClick: function () {
                    if (stack.isMaximised) {
                        stack.toggleMaximise();
                    }
                    stack.remove();
                } },
                React.createElement(CloseIcon, null))) : null))))));
};
export var GoldenLayoutViewReact = function (options) {
    var _a = __read(React.useState(null), 2), goldenLayoutAttachElement = _a[0], setGoldenLayoutAttachElement = _a[1];
    var _b = __read(React.useState(null), 2), goldenLayout = _b[0], setGoldenLayout = _b[1];
    var lastConfig = React.useRef(null);
    useListenTo(wreqr.vent, 'gl-updateSize', function () {
        goldenLayout.updateSize();
    });
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
    React.useEffect(function () {
        var randomString = Math.random().toString();
        $(window).on('resize.' + randomString, _debounce(function () {
            goldenLayout.updateSize();
        }, 100, {
            leading: false,
            trailing: true
        }));
        return function () {
            $(window).off('resize.' + randomString);
        };
    }, [goldenLayout]);
    React.useEffect(function () {
        if (goldenLayoutAttachElement) {
            setGoldenLayout(new GoldenLayout(getGoldenLayoutConfig(options), goldenLayoutAttachElement));
        }
    }, [goldenLayoutAttachElement]);
    React.useEffect(function () {
        if (goldenLayout) {
            registerGoldenLayoutComponents({
                goldenLayout: goldenLayout,
                options: options
            });
            var debouncedHandleGoldenLayoutStateChange_1 = _.debounce(function (_a) {
                var currentConfig = _a.currentConfig;
                handleGoldenLayoutStateChange({
                    options: options,
                    currentConfig: currentConfig,
                    goldenLayout: goldenLayout,
                    lastConfig: lastConfig
                });
            }, 200);
            /**
             *  There is a bug in golden layout as follows:
             *  If you have a layout with 2 items (inspector above inspector for instance), close an item, then close the other,
             *  the final state change event is not triggered to show content as [] or empty.  Oddly enough it works in other scenarios.
             *  I haven't determined a workaround for this, but it's not bothering users as far as I know at the moment.
             *  Basically the bug is that empty layouts aren't guaranteed to be saved, but non empty will always save appropriately.
             */
            goldenLayout.on('stateChanged', function () {
                var currentConfig = getInstanceConfig({ goldenLayout: goldenLayout });
                /**
                 *  Get the config instantly, that way if we navigate away and the component is removed from the document we still get the correct config
                 *  However, delay the actual attempt to save the config, so we don't save too often.
                 */
                debouncedHandleGoldenLayoutStateChange_1({
                    currentConfig: currentConfig
                });
            });
            goldenLayout.on('stackCreated', handleGoldenLayoutStackCreated);
            goldenLayout.on('initialised', function () {
                // can do empty and max detections here
                /**
                 *  This is necessary to properly save pref on the first change that happens from a completely empty layout on first load.
                 *  Used to be done in handleStateChange (if null, set), but that did not trigger for empty layouts on first load.
                 */
                lastConfig.current = getInstanceConfig({ goldenLayout: goldenLayout });
            });
            goldenLayout.init();
            return function () {
                goldenLayout.off('stateChanged');
                goldenLayout.off('stackCreated');
            };
        }
        return function () { };
    }, [goldenLayout]);
    return (React.createElement("div", { "data-element": "golden-layout", className: "is-minimised h-full w-full" },
        React.createElement("div", { ref: setGoldenLayoutAttachElement, className: "golden-layout-container w-full h-full" })));
};
//# sourceMappingURL=golden-layout.view.js.map