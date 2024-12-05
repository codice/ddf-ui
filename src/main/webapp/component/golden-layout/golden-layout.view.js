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
import _debounce from 'lodash/debounce';
import $ from 'jquery';
import wreqr from '../../js/wreqr';
import GoldenLayout from 'golden-layout';
import Button from '@mui/material/Button';
import ExtensionPoints from '../../extension-points/extension-points';
import { Visualizations } from '../visualization/visualizations';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import { Dialog, DialogActions, DialogContent, DialogTitle, } from '@mui/material';
import { StackToolbar, MinimizedHeight } from './stack-toolbar';
import { GoldenLayoutComponentHeader } from './visual-toolbar';
import { UseSubwindowConsumeNavigationChange, useCrossWindowGoldenLayoutCommunication, GoldenLayoutWindowCommunicationEvents, } from './cross-window-communication';
import { useVerifyMapExistsWhenDrawing } from './verify-map';
import { VisualSettingsProvider } from './visual-settings.provider';
import { getInstanceConfig } from './golden-layout.layout-config-handling';
import { getGoldenLayoutConfig } from './golden-layout.layout-config-handling';
import { handleGoldenLayoutStateChange } from './golden-layout.layout-config-handling';
import { getGoldenLayoutSettings } from './golden-layout.layout-config-handling';
/**
 *  For some reason golden layout removes configs from local storage upon first load of popout window, which means refreshing doesn't work.
 *  This prevents this line from doing so: https://github.com/golden-layout/golden-layout/blob/v1.5.9/src/js/LayoutManager.js#L797
 */
import { getDefaultComponentState } from '../visualization/settings-helpers';
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
    var ComponentView = _a.ComponentView, options = _a.options, container = _a.container, goldenLayout = _a.goldenLayout, componentState = _a.componentState;
    var height = useContainerSize(container).height;
    var isMinimized = height && height <= MinimizedHeight;
    var normalizedComponentState = React.useMemo(function () {
        return __assign(__assign({}, getDefaultComponentState(componentState.componentName)), { componentState: componentState });
    }, [componentState]);
    return (React.createElement(ExtensionPoints.providers, null,
        React.createElement(VisualSettingsProvider, { container: container, goldenLayout: goldenLayout },
            React.createElement(UseSubwindowConsumeNavigationChange, { goldenLayout: goldenLayout }),
            React.createElement(UseMissingParentWindow, { goldenLayout: goldenLayout }),
            React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full ".concat(isMinimized ? 'hidden' : ''), square: true },
                React.createElement(ComponentView, { selectionInterface: options.selectionInterface, componentState: normalizedComponentState })))));
};
// see https://github.com/deepstreamIO/golden-layout/issues/239 for details on why the setTimeout is necessary
// The short answer is it mostly has to do with making sure these ComponentViews are able to function normally (set up events, etc.)
function registerComponent(marionetteView, name, ComponentView, componentOptions, viz) {
    var options = _.extend({}, marionetteView.options, componentOptions);
    marionetteView.goldenLayout.registerComponent(name, function (container, componentState) {
        container.on('open', function () {
            setTimeout(function () {
                var root = createRoot(container.getElement()[0]);
                root.render(React.createElement(GoldenLayoutComponent, { goldenLayout: marionetteView.goldenLayout, options: options, ComponentView: ComponentView, container: container, componentState: componentState }));
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
function handleGoldenLayoutStateChangeInSubwindow(_a) {
    var goldenLayout = _a.goldenLayout;
    // shouldn't need to send anything, as the main window can determine the config from the subwindow
    goldenLayout.eventHub.emit(GoldenLayoutWindowCommunicationEvents.consumeSubwindowLayoutChange, null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC52aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDN0MsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzFCLE9BQU8sU0FBUyxNQUFNLGlCQUFpQixDQUFBO0FBR3ZDLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLFlBQVksTUFBTSxlQUFlLENBQUE7QUFDeEMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxlQUFlLE1BQU0seUNBQXlDLENBQUE7QUFDckUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBRWhFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUNwRSxPQUFPLEtBQUssTUFBTSxxQkFBcUIsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDM0MsT0FBTyxFQUNMLE1BQU0sRUFDTixhQUFhLEVBQ2IsYUFBYSxFQUNiLFdBQVcsR0FDWixNQUFNLGVBQWUsQ0FBQTtBQUN0QixPQUFPLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQy9ELE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQzlELE9BQU8sRUFDTCxtQ0FBbUMsRUFDbkMsdUNBQXVDLEVBQ3ZDLHFDQUFxQyxHQUN0QyxNQUFNLDhCQUE4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QUFVLFlBQUEsRUFBRSxDQUFDLENBQUE7SUFDNUUsSUFBTSxtQ0FBbUMsR0FDdkMsbUNBQW1DLENBQUMsRUFBRSxZQUFZLGNBQUEsRUFBRSxDQUFDLENBQUE7SUFFakQsSUFBQSxLQUNKLG1CQUFtQixDQUFDO1FBQ2xCLFlBQVksRUFBRTtZQUNaLGdDQUFnQztZQUNoQyxtQ0FBbUM7WUFDbkMsbUNBQW1DO1NBQ3BDO1FBQ0QsWUFBWSxjQUFBO0tBQ2IsQ0FBQyxFQVJJLFFBQVEsY0FBQSxFQUFFLEtBQUssV0FBQSxFQUFFLHFCQUFxQiwyQkFBQSxFQUFFLGtCQUFrQix3QkFROUQsQ0FBQTtJQUVKLHVDQUF1QyxDQUFDO1FBQ3RDLFlBQVksY0FBQTtRQUNaLGFBQWEsRUFBRSxDQUFDLEtBQUssSUFBSSxRQUFRO1FBQ2pDLE9BQU8sU0FBQTtLQUNSLENBQUMsQ0FBQTtJQUVGLDZCQUE2QixDQUFDO1FBQzVCLFlBQVksY0FBQTtRQUNaLGFBQWEsRUFBRSxDQUFDLEtBQUssSUFBSSxRQUFRO0tBQ2xDLENBQUMsQ0FBQTtJQUVGLE9BQU8sQ0FDTCw2Q0FBa0IsZUFBZSxFQUFDLFNBQVMsRUFBQyw0QkFBNEI7UUFDckUsa0JBQWtCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUNsQyxvQkFBQyxvQkFBb0IsSUFDbkIsWUFBWSxFQUFFLFlBQVksRUFDMUIscUJBQXFCLEVBQUUscUJBQXFCLEdBQzVDLENBQ0gsQ0FBQyxDQUFDLENBQUMsSUFBSTtRQUNSLDZCQUNFLEdBQUcsRUFBRSw0QkFBNEIsRUFDakMsU0FBUyxFQUFDLHVDQUF1QyxHQUNqRCxDQUNFLENBQ1AsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSAncmVhY3QtZG9tL2NsaWVudCdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgX2RlYm91bmNlIGZyb20gJ2xvZGFzaC9kZWJvdW5jZSdcbmltcG9ydCBfY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC5jbG9uZWRlZXAnXG5pbXBvcnQgX2lzRXF1YWxXaXRoIGZyb20gJ2xvZGFzaC5pc2VxdWFsd2l0aCdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi9qcy93cmVxcidcbmltcG9ydCBHb2xkZW5MYXlvdXQgZnJvbSAnZ29sZGVuLWxheW91dCdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgRXh0ZW5zaW9uUG9pbnRzIGZyb20gJy4uLy4uL2V4dGVuc2lvbi1wb2ludHMvZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCB7IFZpc3VhbGl6YXRpb25zIH0gZnJvbSAnLi4vdmlzdWFsaXphdGlvbi92aXN1YWxpemF0aW9ucydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyBFbGV2YXRpb25zIH0gZnJvbSAnLi4vdGhlbWUvdGhlbWUnXG5pbXBvcnQge1xuICBEaWFsb2csXG4gIERpYWxvZ0FjdGlvbnMsXG4gIERpYWxvZ0NvbnRlbnQsXG4gIERpYWxvZ1RpdGxlLFxufSBmcm9tICdAbXVpL21hdGVyaWFsJ1xuaW1wb3J0IHsgU3RhY2tUb29sYmFyLCBNaW5pbWl6ZWRIZWlnaHQgfSBmcm9tICcuL3N0YWNrLXRvb2xiYXInXG5pbXBvcnQgeyBHb2xkZW5MYXlvdXRDb21wb25lbnRIZWFkZXIgfSBmcm9tICcuL3Zpc3VhbC10b29sYmFyJ1xuaW1wb3J0IHtcbiAgVXNlU3Vid2luZG93Q29uc3VtZU5hdmlnYXRpb25DaGFuZ2UsXG4gIHVzZUNyb3NzV2luZG93R29sZGVuTGF5b3V0Q29tbXVuaWNhdGlvbixcbiAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cyxcbn0gZnJvbSAnLi9jcm9zcy13aW5kb3ctY29tbXVuaWNhdGlvbidcbmltcG9ydCB7IHVzZVZlcmlmeU1hcEV4aXN0c1doZW5EcmF3aW5nIH0gZnJvbSAnLi92ZXJpZnktbWFwJ1xuaW1wb3J0IHsgVmlzdWFsU2V0dGluZ3NQcm92aWRlciB9IGZyb20gJy4vdmlzdWFsLXNldHRpbmdzLnByb3ZpZGVyJ1xuaW1wb3J0IHsgZ2V0SW5zdGFuY2VDb25maWcgfSBmcm9tICcuL2dvbGRlbi1sYXlvdXQubGF5b3V0LWNvbmZpZy1oYW5kbGluZydcbmltcG9ydCB7IGdldEdvbGRlbkxheW91dENvbmZpZyB9IGZyb20gJy4vZ29sZGVuLWxheW91dC5sYXlvdXQtY29uZmlnLWhhbmRsaW5nJ1xuaW1wb3J0IHsgaGFuZGxlR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2UgfSBmcm9tICcuL2dvbGRlbi1sYXlvdXQubGF5b3V0LWNvbmZpZy1oYW5kbGluZydcbmltcG9ydCB7IGdldEdvbGRlbkxheW91dFNldHRpbmdzIH0gZnJvbSAnLi9nb2xkZW4tbGF5b3V0LmxheW91dC1jb25maWctaGFuZGxpbmcnXG5cbi8qKlxuICogIEZvciBzb21lIHJlYXNvbiBnb2xkZW4gbGF5b3V0IHJlbW92ZXMgY29uZmlncyBmcm9tIGxvY2FsIHN0b3JhZ2UgdXBvbiBmaXJzdCBsb2FkIG9mIHBvcG91dCB3aW5kb3csIHdoaWNoIG1lYW5zIHJlZnJlc2hpbmcgZG9lc24ndCB3b3JrLlxuICogIFRoaXMgcHJldmVudHMgdGhpcyBsaW5lIGZyb20gZG9pbmcgc286IGh0dHBzOi8vZ2l0aHViLmNvbS9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQvYmxvYi92MS41Ljkvc3JjL2pzL0xheW91dE1hbmFnZXIuanMjTDc5N1xuICovXG5pbXBvcnQgeyBnZXREZWZhdWx0Q29tcG9uZW50U3RhdGUgfSBmcm9tICcuLi92aXN1YWxpemF0aW9uL3NldHRpbmdzLWhlbHBlcnMnXG5pbXBvcnQgeyBDb21wb25lbnROYW1lVHlwZSB9IGZyb20gJy4vZ29sZGVuLWxheW91dC50eXBlcydcbjsoZnVuY3Rpb24gcHJldmVudFJlbW92YWxGcm9tU3RvcmFnZSgpIHtcbiAgY29uc3Qgbm9ybWFsUmVtb3ZlSXRlbSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbVxuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0gPSAoa2V5OiBzdHJpbmcpID0+IHtcbiAgICBpZiAoa2V5LmluY2x1ZGVzKCdnbC13aW5kb3cnKSkge1xuICAgICAgcmV0dXJuXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vcm1hbFJlbW92ZUl0ZW0oa2V5KVxuICAgIH1cbiAgfVxufSkoKVxuXG4vKipcbiAqICBXZSBhdHRhY2ggdGhpcyBhdCB0aGUgY29tcG9uZW50IGxldmVsIGR1ZSB0byBob3cgcG9wb3V0cyB3b3JrLlxuICogIEVzc2VudGlhbGx5IGdvbGRlbiBsYXlvdXQgZGlzY29ubmVjdHMgdXMgZnJvbSBSZWFjdCBhbmQgb3VyIHByb3ZpZGVycyBpbiBwb3BvdXRzIHRvIGZ1bGxzY3JlZW4gdmlzdWFscyxcbiAqICBzbyB3ZSBjYW4ndCB1c2UgRGlhbG9nIGZ1cnRoZXIgdXAgdGhlIHRyZWUuXG4gKi9cbmNvbnN0IFVzZU1pc3NpbmdQYXJlbnRXaW5kb3cgPSAoeyBnb2xkZW5MYXlvdXQgfTogeyBnb2xkZW5MYXlvdXQ6IGFueSB9KSA9PiB7XG4gIGNvbnN0IFttaXNzaW5nV2luZG93LCBzZXRNaXNzaW5nV2luZG93XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQgJiYgZ29sZGVuTGF5b3V0LmlzU3ViV2luZG93ICYmIHdpbmRvdy5vcGVuZXIgPT09IG51bGwpIHtcbiAgICAgIHNldE1pc3NpbmdXaW5kb3codHJ1ZSlcbiAgICB9XG4gIH0sIFtnb2xkZW5MYXlvdXRdKVxuXG4gIGlmIChtaXNzaW5nV2luZG93KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxEaWFsb2cgb3Blbj17dHJ1ZX0gY2xhc3NOYW1lPVwiIHotWzEwMDAwMDBdXCI+XG4gICAgICAgIDxEaWFsb2dUaXRsZT5Db3VsZCBub3QgZmluZCBwYXJlbnQgdmlzdWFsaXphdGlvbjwvRGlhbG9nVGl0bGU+XG4gICAgICAgIDxEaWFsb2dDb250ZW50PlBsZWFzZSBjbG9zZSB0aGUgd2luZG93LjwvRGlhbG9nQ29udGVudD5cbiAgICAgICAgPERpYWxvZ0FjdGlvbnM+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBDbG9zZSBXaW5kb3dcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgICAgPC9EaWFsb2c+XG4gICAgKVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmNvbnN0IEdvbGRlbkxheW91dENvbXBvbmVudCA9ICh7XG4gIENvbXBvbmVudFZpZXcsXG4gIG9wdGlvbnMsXG4gIGNvbnRhaW5lcixcbiAgZ29sZGVuTGF5b3V0LFxuICBjb21wb25lbnRTdGF0ZSxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgb3B0aW9uczogYW55XG4gIENvbXBvbmVudFZpZXc6IGFueVxuICBjb250YWluZXI6IEdvbGRlbkxheW91dC5Db250YWluZXJcbiAgY29tcG9uZW50U3RhdGU6IHtcbiAgICBjb21wb25lbnROYW1lOiBDb21wb25lbnROYW1lVHlwZVxuICB9XG59KSA9PiB7XG4gIGNvbnN0IHsgaGVpZ2h0IH0gPSB1c2VDb250YWluZXJTaXplKGNvbnRhaW5lcilcbiAgY29uc3QgaXNNaW5pbWl6ZWQgPSBoZWlnaHQgJiYgaGVpZ2h0IDw9IE1pbmltaXplZEhlaWdodFxuICBjb25zdCBub3JtYWxpemVkQ29tcG9uZW50U3RhdGUgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZ2V0RGVmYXVsdENvbXBvbmVudFN0YXRlKGNvbXBvbmVudFN0YXRlLmNvbXBvbmVudE5hbWUpLFxuICAgICAgY29tcG9uZW50U3RhdGUsXG4gICAgfVxuICB9LCBbY29tcG9uZW50U3RhdGVdKVxuXG4gIHJldHVybiAoXG4gICAgPEV4dGVuc2lvblBvaW50cy5wcm92aWRlcnM+XG4gICAgICA8VmlzdWFsU2V0dGluZ3NQcm92aWRlciBjb250YWluZXI9e2NvbnRhaW5lcn0gZ29sZGVuTGF5b3V0PXtnb2xkZW5MYXlvdXR9PlxuICAgICAgICA8VXNlU3Vid2luZG93Q29uc3VtZU5hdmlnYXRpb25DaGFuZ2UgZ29sZGVuTGF5b3V0PXtnb2xkZW5MYXlvdXR9IC8+XG4gICAgICAgIDxVc2VNaXNzaW5nUGFyZW50V2luZG93IGdvbGRlbkxheW91dD17Z29sZGVuTGF5b3V0fSAvPlxuICAgICAgICA8UGFwZXJcbiAgICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFuZWxzfVxuICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBoLWZ1bGwgJHtpc01pbmltaXplZCA/ICdoaWRkZW4nIDogJyd9YH1cbiAgICAgICAgICBzcXVhcmVcbiAgICAgICAgPlxuICAgICAgICAgIDxDb21wb25lbnRWaWV3XG4gICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e29wdGlvbnMuc2VsZWN0aW9uSW50ZXJmYWNlfVxuICAgICAgICAgICAgY29tcG9uZW50U3RhdGU9e25vcm1hbGl6ZWRDb21wb25lbnRTdGF0ZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhcGVyPlxuICAgICAgPC9WaXN1YWxTZXR0aW5nc1Byb3ZpZGVyPlxuICAgIDwvRXh0ZW5zaW9uUG9pbnRzLnByb3ZpZGVycz5cbiAgKVxufVxuLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWVwc3RyZWFtSU8vZ29sZGVuLWxheW91dC9pc3N1ZXMvMjM5IGZvciBkZXRhaWxzIG9uIHdoeSB0aGUgc2V0VGltZW91dCBpcyBuZWNlc3Nhcnlcbi8vIFRoZSBzaG9ydCBhbnN3ZXIgaXMgaXQgbW9zdGx5IGhhcyB0byBkbyB3aXRoIG1ha2luZyBzdXJlIHRoZXNlIENvbXBvbmVudFZpZXdzIGFyZSBhYmxlIHRvIGZ1bmN0aW9uIG5vcm1hbGx5IChzZXQgdXAgZXZlbnRzLCBldGMuKVxuZnVuY3Rpb24gcmVnaXN0ZXJDb21wb25lbnQoXG4gIG1hcmlvbmV0dGVWaWV3OiB7IGdvbGRlbkxheW91dDogYW55OyBvcHRpb25zOiBhbnkgfSxcbiAgbmFtZTogYW55LFxuICBDb21wb25lbnRWaWV3OiBhbnksXG4gIGNvbXBvbmVudE9wdGlvbnM6IGFueSxcbiAgdml6OiBhbnlcbikge1xuICBjb25zdCBvcHRpb25zID0gXy5leHRlbmQoe30sIG1hcmlvbmV0dGVWaWV3Lm9wdGlvbnMsIGNvbXBvbmVudE9wdGlvbnMpXG4gIG1hcmlvbmV0dGVWaWV3LmdvbGRlbkxheW91dC5yZWdpc3RlckNvbXBvbmVudChcbiAgICBuYW1lLFxuICAgIChjb250YWluZXI6IGFueSwgY29tcG9uZW50U3RhdGU6IGFueSkgPT4ge1xuICAgICAgY29udGFpbmVyLm9uKCdvcGVuJywgKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCByb290ID0gY3JlYXRlUm9vdChjb250YWluZXIuZ2V0RWxlbWVudCgpWzBdKVxuICAgICAgICAgIHJvb3QucmVuZGVyKFxuICAgICAgICAgICAgPEdvbGRlbkxheW91dENvbXBvbmVudFxuICAgICAgICAgICAgICBnb2xkZW5MYXlvdXQ9e21hcmlvbmV0dGVWaWV3LmdvbGRlbkxheW91dH1cbiAgICAgICAgICAgICAgb3B0aW9ucz17b3B0aW9uc31cbiAgICAgICAgICAgICAgQ29tcG9uZW50Vmlldz17Q29tcG9uZW50Vmlld31cbiAgICAgICAgICAgICAgY29udGFpbmVyPXtjb250YWluZXJ9XG4gICAgICAgICAgICAgIGNvbXBvbmVudFN0YXRlPXtjb21wb25lbnRTdGF0ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKVxuICAgICAgICAgIGNvbnRhaW5lci5vbignZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgICAgIHJvb3QudW5tb3VudCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgMClcbiAgICAgIH0pXG4gICAgICBjb250YWluZXIub24oJ3RhYicsICh0YWI6IGFueSkgPT4ge1xuICAgICAgICB0YWIuY2xvc2VFbGVtZW50Lm9mZignY2xpY2snKS5vbignY2xpY2snLCAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHRhYi5oZWFkZXIucGFyZW50LmlzTWF4aW1pc2VkICYmXG4gICAgICAgICAgICB0YWIuaGVhZGVyLnBhcmVudC5jb250ZW50SXRlbXMubGVuZ3RoID09PSAxXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0YWIuaGVhZGVyLnBhcmVudC50b2dnbGVNYXhpbWlzZSgpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRhYi5fb25DbG9zZUNsaWNrRm4oZXZlbnQpXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICB0YWIuZWxlbWVudC5hcHBlbmQocm9vdClcbiAgICAgICAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbmRlclJvb3QgPSBjcmVhdGVSb290KHRhYi5lbGVtZW50WzBdKVxuICAgICAgICAgICAgcmVuZGVyUm9vdC5yZW5kZXIoXG4gICAgICAgICAgICAgIDxHb2xkZW5MYXlvdXRDb21wb25lbnRIZWFkZXJcbiAgICAgICAgICAgICAgICB2aXo9e3Zpen1cbiAgICAgICAgICAgICAgICB0YWI9e3RhYn1cbiAgICAgICAgICAgICAgICBvcHRpb25zPXtvcHRpb25zfVxuICAgICAgICAgICAgICAgIGNvbXBvbmVudFN0YXRlPXtjb21wb25lbnRTdGF0ZX1cbiAgICAgICAgICAgICAgICBjb250YWluZXI9e2NvbnRhaW5lcn1cbiAgICAgICAgICAgICAgICBuYW1lPXtuYW1lfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgdGFiLmhlYWRlci5vbignZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgICAgICAgcmVuZGVyUm9vdC51bm1vdW50KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgICAgICB9LCAxMDApXG4gICAgICB9KVxuICAgIH1cbiAgKVxufVxuZXhwb3J0IHR5cGUgR29sZGVuTGF5b3V0Vmlld1Byb3BzID0ge1xuICBsYXlvdXRSZXN1bHQ/OiBMYXp5UXVlcnlSZXN1bHRbJ3BsYWluJ11cbiAgZWRpdExheW91dFJlZj86IFJlYWN0Lk11dGFibGVSZWZPYmplY3Q8YW55PlxuICBjb25maWdOYW1lPzogc3RyaW5nXG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG4gIHNldEdvbGRlbkxheW91dDogKGluc3RhbmNlOiBhbnkpID0+IHZvaWRcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJHb2xkZW5MYXlvdXRDb21wb25lbnRzKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBvcHRpb25zLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBvcHRpb25zOiBHb2xkZW5MYXlvdXRWaWV3UHJvcHNcbn0pIHtcbiAgVmlzdWFsaXphdGlvbnMuZm9yRWFjaCgodml6KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJlZ2lzdGVyQ29tcG9uZW50KFxuICAgICAgICB7IGdvbGRlbkxheW91dCwgb3B0aW9ucyB9LFxuICAgICAgICB2aXouaWQsXG4gICAgICAgIHZpei52aWV3LFxuICAgICAgICB2aXoub3B0aW9ucyxcbiAgICAgICAgdml6XG4gICAgICApXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBsaWtlbHkgYWxyZWFkeSByZWdpc3RlcmVkLCBpbiBkZXZcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGhhbmRsZUdvbGRlbkxheW91dFN0YXRlQ2hhbmdlSW5TdWJ3aW5kb3coe1xuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG59KSB7XG4gIC8vIHNob3VsZG4ndCBuZWVkIHRvIHNlbmQgYW55dGhpbmcsIGFzIHRoZSBtYWluIHdpbmRvdyBjYW4gZGV0ZXJtaW5lIHRoZSBjb25maWcgZnJvbSB0aGUgc3Vid2luZG93XG4gIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZVN1YndpbmRvd0xheW91dENoYW5nZSxcbiAgICBudWxsXG4gIClcbn1cblxuLyoqXG4gKiAgUmVwbGFjZSB0aGUgdG9vbGJhciB3aXRoIG91ciBvd25cbiAqL1xuZnVuY3Rpb24gaGFuZGxlR29sZGVuTGF5b3V0U3RhY2tDcmVhdGVkKHN0YWNrOiBhbnkpIHtcbiAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlbmRlclJvb3QgPSBjcmVhdGVSb290KHN0YWNrLmhlYWRlci5jb250cm9sc0NvbnRhaW5lclswXSlcbiAgICAgIHJlbmRlclJvb3QucmVuZGVyKDxTdGFja1Rvb2xiYXIgc3RhY2s9e3N0YWNrfSAvPilcbiAgICAgIHN0YWNrLm9uKCdhY3RpdmVDb250ZW50SXRlbUNoYW5nZWQnLCBmdW5jdGlvbiAoY29udGVudEl0ZW06IGFueSkge1xuICAgICAgICB3cmVxci52ZW50LnRyaWdnZXIoJ2FjdGl2ZUNvbnRlbnRJdGVtQ2hhbmdlZCcsIGNvbnRlbnRJdGVtKVxuICAgICAgfSlcbiAgICAgIHN0YWNrLm9uKCdkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICByZW5kZXJSb290LnVubW91bnQoKVxuICAgICAgfSlcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICB9IGNhdGNoIChlcnIpIHt9XG4gIH0sIDEwMClcbn1cblxuZnVuY3Rpb24gdXNlQ29udGFpbmVyU2l6ZShjb250YWluZXI6IEdvbGRlbkxheW91dC5Db250YWluZXIpIHtcbiAgY29uc3QgW3dpZHRoLCBzZXRXaWR0aF0gPSBSZWFjdC51c2VTdGF0ZTxudW1iZXIgfCB1bmRlZmluZWQ+KGNvbnRhaW5lci53aWR0aClcbiAgY29uc3QgW2hlaWdodCwgc2V0SGVpZ2h0XSA9IFJlYWN0LnVzZVN0YXRlPG51bWJlciB8IHVuZGVmaW5lZD4oXG4gICAgY29udGFpbmVyLmhlaWdodFxuICApXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICBjb25zdCByZXNpemVDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgc2V0V2lkdGgoY29udGFpbmVyLndpZHRoKVxuICAgICAgICBzZXRIZWlnaHQoY29udGFpbmVyLmhlaWdodClcbiAgICAgIH1cbiAgICAgIGNvbnRhaW5lci5vbigncmVzaXplJywgcmVzaXplQ2FsbGJhY2spXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjb250YWluZXIub2ZmKCdyZXNpemUnLCByZXNpemVDYWxsYmFjaylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtjb250YWluZXJdKVxuICByZXR1cm4geyBoZWlnaHQsIHdpZHRoIH1cbn1cblxuY29uc3QgdXNlVXBkYXRlR29sZGVuTGF5b3V0U2l6ZSA9ICh7XG4gIHdyZXFyLFxuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIHdyZXFyOiBhbnlcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbn0pID0+IHtcbiAgdXNlTGlzdGVuVG8oKHdyZXFyIGFzIGFueSkudmVudCwgJ2dsLXVwZGF0ZVNpemUnLCAoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCAmJiBnb2xkZW5MYXlvdXQuaXNJbml0aWFsaXNlZCkgZ29sZGVuTGF5b3V0LnVwZGF0ZVNpemUoKVxuICB9KVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQpIHtcbiAgICAgIGNvbnN0IHJhbmRvbVN0cmluZyA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKVxuICAgICAgJCh3aW5kb3cpLm9uKFxuICAgICAgICAncmVzaXplLicgKyByYW5kb21TdHJpbmcsXG4gICAgICAgIF9kZWJvdW5jZShcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZ29sZGVuTGF5b3V0LmlzSW5pdGlhbGlzZWQpIGdvbGRlbkxheW91dC51cGRhdGVTaXplKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIDEwMCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsZWFkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHRyYWlsaW5nOiB0cnVlLFxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLicgKyByYW5kb21TdHJpbmcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0XSlcbn1cblxuY29uc3QgdXNlU2VuZEdvbGRlbkxheW91dFJlZmVyZW5jZVVwd2FyZHMgPSAoe1xuICBvcHRpb25zLFxuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG4gIG9wdGlvbnM6IEdvbGRlbkxheW91dFZpZXdQcm9wc1xufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQpIHtcbiAgICAgIG9wdGlvbnMuc2V0R29sZGVuTGF5b3V0KGdvbGRlbkxheW91dClcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChnb2xkZW5MYXlvdXQpIHtcbiAgICAgICAgZ29sZGVuTGF5b3V0LmRlc3Ryb3koKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW2dvbGRlbkxheW91dF0pXG59XG5cbmNvbnN0IHVzZUF0dGFjaEdvbGRlbkxheW91dCA9ICh7XG4gIGdvbGRlbkxheW91dEF0dGFjaEVsZW1lbnQsXG4gIHNldEdvbGRlbkxheW91dCxcbiAgb3B0aW9ucyxcbn06IHtcbiAgb3B0aW9uczogR29sZGVuTGF5b3V0Vmlld1Byb3BzXG4gIHNldEdvbGRlbkxheW91dDogUmVhY3QuRGlzcGF0Y2g8YW55PlxuICBnb2xkZW5MYXlvdXRBdHRhY2hFbGVtZW50OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudCkge1xuICAgICAgc2V0R29sZGVuTGF5b3V0KFxuICAgICAgICBuZXcgR29sZGVuTGF5b3V0KFxuICAgICAgICAgIGdldEdvbGRlbkxheW91dENvbmZpZyhvcHRpb25zKSxcbiAgICAgICAgICBnb2xkZW5MYXlvdXRBdHRhY2hFbGVtZW50XG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gIH0sIFtnb2xkZW5MYXlvdXRBdHRhY2hFbGVtZW50XSlcbn1cblxuY29uc3QgdXNlUmVnaXN0ZXJHb2xkZW5MYXlvdXRDb21wb25lbnRzID0gKHtcbiAgb3B0aW9ucyxcbiAgZ29sZGVuTGF5b3V0LFxufToge1xuICBvcHRpb25zOiBHb2xkZW5MYXlvdXRWaWV3UHJvcHNcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbn0pID0+IHtcbiAgY29uc3QgW2ZpbmlzaGVkLCBzZXRGaW5pc2hlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0KSB7XG4gICAgICByZWdpc3RlckdvbGRlbkxheW91dENvbXBvbmVudHMoe1xuICAgICAgICBnb2xkZW5MYXlvdXQsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICB9KVxuICAgICAgc2V0RmluaXNoZWQodHJ1ZSlcbiAgICB9XG4gIH0sIFtnb2xkZW5MYXlvdXRdKVxuICByZXR1cm4gZmluaXNoZWRcbn1cblxuY29uc3QgdXNlTGlzdGVuVG9Hb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZXMgPSAoe1xuICBvcHRpb25zLFxuICBnb2xkZW5MYXlvdXQsXG4gIGxhc3RDb25maWcsXG59OiB7XG4gIG9wdGlvbnM6IEdvbGRlbkxheW91dFZpZXdQcm9wc1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBsYXN0Q29uZmlnOiBSZWFjdC5NdXRhYmxlUmVmT2JqZWN0PGFueT5cbn0pID0+IHtcbiAgY29uc3QgW2ZpbmlzaGVkLCBzZXRGaW5pc2hlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQpIHtcbiAgICAgIGNvbnN0IGRlYm91bmNlZEhhbmRsZUdvbGRlbkxheW91dFN0YXRlQ2hhbmdlID0gXy5kZWJvdW5jZShcbiAgICAgICAgKHsgY3VycmVudENvbmZpZyB9OiB7IGN1cnJlbnRDb25maWc6IGFueSB9KSA9PiB7XG4gICAgICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcigncmVzaXplJykgLy8gdHJpZ2dlciByZXNpemUgb2YgdGhpbmdzIGxpa2UgbWFwXG4gICAgICAgICAgaWYgKCFnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgZnVuY3Rpb24gYXBwbGllcyBvbmx5IHRvIHRoZSBtYWluIHdpbmRvdywgd2UgaGF2ZSB0byBjb21tdW5pY2F0ZSBzdWJ3aW5kb3cgdXBkYXRlcyBiYWNrIHRvIHRoZSBvcmlnaW5hbCB3aW5kb3cgaW5zdGVhZFxuICAgICAgICAgICAgaGFuZGxlR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2Uoe1xuICAgICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgICBjdXJyZW50Q29uZmlnLFxuICAgICAgICAgICAgICBnb2xkZW5MYXlvdXQsXG4gICAgICAgICAgICAgIGxhc3RDb25maWcsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVHb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZUluU3Vid2luZG93KHsgZ29sZGVuTGF5b3V0IH0pXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAyMDBcbiAgICAgIClcbiAgICAgIC8qKlxuICAgICAgICogIFRoZXJlIGlzIGEgYnVnIGluIGdvbGRlbiBsYXlvdXQgYXMgZm9sbG93czpcbiAgICAgICAqICBJZiB5b3UgaGF2ZSBhIGxheW91dCB3aXRoIDIgaXRlbXMgKGluc3BlY3RvciBhYm92ZSBpbnNwZWN0b3IgZm9yIGluc3RhbmNlKSwgY2xvc2UgYW4gaXRlbSwgdGhlbiBjbG9zZSB0aGUgb3RoZXIsXG4gICAgICAgKiAgdGhlIGZpbmFsIHN0YXRlIGNoYW5nZSBldmVudCBpcyBub3QgdHJpZ2dlcmVkIHRvIHNob3cgY29udGVudCBhcyBbXSBvciBlbXB0eS4gIE9kZGx5IGVub3VnaCBpdCB3b3JrcyBpbiBvdGhlciBzY2VuYXJpb3MuXG4gICAgICAgKiAgSSBoYXZlbid0IGRldGVybWluZWQgYSB3b3JrYXJvdW5kIGZvciB0aGlzLCBidXQgaXQncyBub3QgYm90aGVyaW5nIHVzZXJzIGFzIGZhciBhcyBJIGtub3cgYXQgdGhlIG1vbWVudC5cbiAgICAgICAqICBCYXNpY2FsbHkgdGhlIGJ1ZyBpcyB0aGF0IGVtcHR5IGxheW91dHMgYXJlbid0IGd1YXJhbnRlZWQgdG8gYmUgc2F2ZWQsIGJ1dCBub24gZW1wdHkgd2lsbCBhbHdheXMgc2F2ZSBhcHByb3ByaWF0ZWx5LlxuICAgICAgICovXG4gICAgICBnb2xkZW5MYXlvdXQub24oJ3N0YXRlQ2hhbmdlZCcsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxseUluaXRpYWxpemVkID1cbiAgICAgICAgICBnb2xkZW5MYXlvdXQuaXNJbml0aWFsaXNlZCAmJlxuICAgICAgICAgICEoZ29sZGVuTGF5b3V0Py5vcGVuUG9wb3V0cyBhcyBBcnJheTxhbnk+KT8uc29tZShcbiAgICAgICAgICAgIChwb3BvdXQ6IGFueSkgPT4gIXBvcG91dC5pc0luaXRpYWxpc2VkXG4gICAgICAgICAgKVxuICAgICAgICBpZiAoIWZ1bGx5SW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGdvbGRlbkxheW91dC5lbWl0KCdzdGF0ZUNoYW5nZWQnLCAncmV0cnknKVxuICAgICAgICAgIH0sIDIwMClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdXJyZW50Q29uZmlnID0gZ2V0SW5zdGFuY2VDb25maWcoeyBnb2xkZW5MYXlvdXQgfSlcbiAgICAgICAgLyoqXG4gICAgICAgICAqICBHZXQgdGhlIGNvbmZpZyBpbnN0YW50bHksIHRoYXQgd2F5IGlmIHdlIG5hdmlnYXRlIGF3YXkgYW5kIHRoZSBjb21wb25lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBkb2N1bWVudCB3ZSBzdGlsbCBnZXQgdGhlIGNvcnJlY3QgY29uZmlnXG4gICAgICAgICAqICBIb3dldmVyLCBkZWxheSB0aGUgYWN0dWFsIGF0dGVtcHQgdG8gc2F2ZSB0aGUgY29uZmlnLCBzbyB3ZSBkb24ndCBzYXZlIHRvbyBvZnRlbi5cbiAgICAgICAgICovXG4gICAgICAgIGRlYm91bmNlZEhhbmRsZUdvbGRlbkxheW91dFN0YXRlQ2hhbmdlKHtcbiAgICAgICAgICBjdXJyZW50Q29uZmlnLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIHNldEZpbmlzaGVkKHRydWUpXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnb2xkZW5MYXlvdXQub2ZmKCdzdGF0ZUNoYW5nZWQnKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2dvbGRlbkxheW91dF0pXG4gIHJldHVybiBmaW5pc2hlZFxufVxuXG4vKipcbiAqICBUaGlzIHdpbGwgYXR0YWNoIG91ciBjdXN0b20gdG9vbGJhciB0byB0aGUgZ29sZGVuIGxheW91dCBzdGFjayBoZWFkZXJcbiAqL1xuY29uc3QgdXNlTGlzdGVuVG9Hb2xkZW5MYXlvdXRTdGFja0NyZWF0ZWQgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG59KSA9PiB7XG4gIGNvbnN0IFtmaW5pc2hlZCwgc2V0RmluaXNoZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0KSB7XG4gICAgICBnb2xkZW5MYXlvdXQub24oJ3N0YWNrQ3JlYXRlZCcsIGhhbmRsZUdvbGRlbkxheW91dFN0YWNrQ3JlYXRlZClcbiAgICAgIHNldEZpbmlzaGVkKHRydWUpXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnb2xkZW5MYXlvdXQub2ZmKCdzdGFja0NyZWF0ZWQnKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2dvbGRlbkxheW91dF0pXG4gIHJldHVybiBmaW5pc2hlZFxufVxuXG50eXBlIHBvcHVwSGFuZGxpbmdTdGF0ZVR5cGUgPSAnYWxsb3dlZCcgfCAnYmxvY2tlZCcgfCAncHJvY2VlZCdcblxuY29uc3QgdXNlSW5pdEdvbGRlbkxheW91dCA9ICh7XG4gIGRlcGVuZGVuY2llcyxcbiAgZ29sZGVuTGF5b3V0LFxufToge1xuICBkZXBlbmRlbmNpZXM6IEFycmF5PGJvb2xlYW4+XG4gIGdvbGRlbkxheW91dDogYW55XG59KSA9PiB7XG4gIGNvbnN0IFtmaW5pc2hlZCwgc2V0RmluaXNoZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtwb3B1cEhhbmRsaW5nU3RhdGUsIHNldFBvcHVwSGFuZGxpbmdTdGF0ZV0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPHBvcHVwSGFuZGxpbmdTdGF0ZVR5cGU+KCdhbGxvd2VkJylcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkZXBlbmRlbmNpZXMuZXZlcnkoKGRlcGVuZGVuY3kpID0+IGRlcGVuZGVuY3kpKSB7XG4gICAgICBpZiAoZ29sZGVuTGF5b3V0LmlzU3ViV2luZG93ICYmIHdpbmRvdy5vcGVuZXIgPT09IG51bGwpIHtcbiAgICAgICAgc2V0RXJyb3IodHJ1ZSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9uSW5pdCA9ICgpID0+IHtcbiAgICAgICAgc2V0RmluaXNoZWQodHJ1ZSlcbiAgICAgIH1cbiAgICAgIGdvbGRlbkxheW91dC5vbignaW5pdGlhbGlzZWQnLCBvbkluaXQpXG4gICAgICBpZiAoZ29sZGVuTGF5b3V0LmlzU3ViV2luZG93KSB7XG4gICAgICAgIC8vIGZvciBzb21lIHJlYXNvbiBzdWJ3aW5kb3cgc3RhY2tzIGxvc2UgZGltZW5zaW9ucywgc3BlY2lmaWNhbGx5IHRoZSBoZWFkZXIgaGVpZ2h0IChzZWUgX2NyZWF0ZUNvbmZpZyBpbiBnb2xkZW4gbGF5b3V0IHNvdXJjZSBjb2RlKVxuICAgICAgICBnb2xkZW5MYXlvdXQuY29uZmlnLmRpbWVuc2lvbnMgPSBnZXRHb2xkZW5MYXlvdXRTZXR0aW5ncygpLmRpbWVuc2lvbnNcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGdvbGRlbkxheW91dC5pbml0KClcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUudHlwZSA9PT0gJ3BvcG91dEJsb2NrZWQnKSB7XG4gICAgICAgICAgc2V0UG9wdXBIYW5kbGluZ1N0YXRlKCdibG9ja2VkJylcbiAgICAgICAgICBnb2xkZW5MYXlvdXQub3BlblBvcG91dHM/LmZvckVhY2goKHBvcG91dDogYW55KSA9PiB7XG4gICAgICAgICAgICBwb3BvdXQuY2xvc2UoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZ29sZGVuTGF5b3V0Lm9mZignaW5pdGlhbGlzZWQnLCBvbkluaXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbLi4uZGVwZW5kZW5jaWVzLCBwb3B1cEhhbmRsaW5nU3RhdGVdKVxuICByZXR1cm4ge1xuICAgIGZpbmlzaGVkLFxuICAgIGVycm9yLFxuICAgIHNldFBvcHVwSGFuZGxpbmdTdGF0ZSxcbiAgICBwb3B1cEhhbmRsaW5nU3RhdGUsXG4gIH1cbn1cblxuY29uc3QgSGFuZGxlUG9wb3V0c0Jsb2NrZWQgPSAoe1xuICBzZXRQb3B1cEhhbmRsaW5nU3RhdGUsXG4gIGdvbGRlbkxheW91dCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgc2V0UG9wdXBIYW5kbGluZ1N0YXRlOiBSZWFjdC5EaXNwYXRjaDxwb3B1cEhhbmRsaW5nU3RhdGVUeXBlPlxufSkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxEaWFsb2cgb3Blbj17dHJ1ZX0+XG4gICAgICA8RGlhbG9nVGl0bGU+VmlzdWFsaXphdGlvbiBwb3B1cHMgYmxvY2tlZDwvRGlhbG9nVGl0bGU+XG4gICAgICA8RGlhbG9nQ29udGVudD5cbiAgICAgICAgUGxlYXNlIGFsbG93IHBvcHVwcyBmb3IgdGhpcyBzaXRlLCB0aGVuIGNsaWNrIHRoZSBidXR0b24gYmVsb3cgdG8gcmV0cnlcbiAgICAgICAgbG9hZGluZyB5b3VyIHZpc3VhbGl6YXRpb24gbGF5b3V0LlxuICAgICAgPC9EaWFsb2dDb250ZW50PlxuICAgICAgPERpYWxvZ0FjdGlvbnM+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBjb2xvcj1cImVycm9yXCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBnb2xkZW5MYXlvdXQuY29uZmlnLm9wZW5Qb3BvdXRzID0gW11cbiAgICAgICAgICAgIHNldFBvcHVwSGFuZGxpbmdTdGF0ZSgncHJvY2VlZCcpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIFByb2NlZWQgd2l0aG91dCBwb3B1cHNcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIC8vIHRyeSBvcGVuaW5nIHR3byB3aW5kb3dzLCBhcyBvbmUgaXMgYWxsb3dlZCBzaW5jZSB0aGUgdXNlciBpbnRlcmFjdHMgd2l0aCB0aGUgYnV0dG9uXG4gICAgICAgICAgICBjb25zdCB3aW5kb3cxID0gd2luZG93Lm9wZW4oJycsICdfYmxhbmsnKVxuICAgICAgICAgICAgY29uc3Qgd2luZG93MiA9IHdpbmRvdy5vcGVuKCcnLCAnX2JsYW5rJylcbiAgICAgICAgICAgIGlmICh3aW5kb3cxICYmIHdpbmRvdzIpIHtcbiAgICAgICAgICAgICAgc2V0UG9wdXBIYW5kbGluZ1N0YXRlKCdhbGxvd2VkJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdzE/LmNsb3NlKClcbiAgICAgICAgICAgIHdpbmRvdzI/LmNsb3NlKClcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgUmV0cnlcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0RpYWxvZ0FjdGlvbnM+XG4gICAgPC9EaWFsb2c+XG4gIClcbn1cblxuZXhwb3J0IGNvbnN0IEdvbGRlbkxheW91dFZpZXdSZWFjdCA9IChvcHRpb25zOiBHb2xkZW5MYXlvdXRWaWV3UHJvcHMpID0+IHtcbiAgY29uc3QgW2dvbGRlbkxheW91dEF0dGFjaEVsZW1lbnQsIHNldEdvbGRlbkxheW91dEF0dGFjaEVsZW1lbnRdID1cbiAgICBSZWFjdC51c2VTdGF0ZTxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtnb2xkZW5MYXlvdXQsIHNldEdvbGRlbkxheW91dF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG4gIGNvbnN0IGxhc3RDb25maWcgPSBSZWFjdC51c2VSZWY8YW55PihnZXRHb2xkZW5MYXlvdXRDb25maWcob3B0aW9ucykpXG4gIHVzZVVwZGF0ZUdvbGRlbkxheW91dFNpemUoeyB3cmVxciwgZ29sZGVuTGF5b3V0IH0pXG4gIHVzZVNlbmRHb2xkZW5MYXlvdXRSZWZlcmVuY2VVcHdhcmRzKHsgb3B0aW9ucywgZ29sZGVuTGF5b3V0IH0pXG4gIHVzZUF0dGFjaEdvbGRlbkxheW91dCh7IGdvbGRlbkxheW91dEF0dGFjaEVsZW1lbnQsIHNldEdvbGRlbkxheW91dCwgb3B0aW9ucyB9KVxuICBjb25zdCBnb2xkZW5MYXlvdXRDb21wb25lbnRzUmVnaXN0ZXJlZCA9IHVzZVJlZ2lzdGVyR29sZGVuTGF5b3V0Q29tcG9uZW50cyh7XG4gICAgb3B0aW9ucyxcbiAgICBnb2xkZW5MYXlvdXQsXG4gIH0pXG4gIGNvbnN0IGxpc3RlbmluZ1RvR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2VzID1cbiAgICB1c2VMaXN0ZW5Ub0dvbGRlbkxheW91dFN0YXRlQ2hhbmdlcyh7IG9wdGlvbnMsIGdvbGRlbkxheW91dCwgbGFzdENvbmZpZyB9KVxuICBjb25zdCBsaXN0ZW5pbmdUb0dvbGRlbkxheW91dFN0YWNrQ3JlYXRlZCA9XG4gICAgdXNlTGlzdGVuVG9Hb2xkZW5MYXlvdXRTdGFja0NyZWF0ZWQoeyBnb2xkZW5MYXlvdXQgfSlcblxuICBjb25zdCB7IGZpbmlzaGVkLCBlcnJvciwgc2V0UG9wdXBIYW5kbGluZ1N0YXRlLCBwb3B1cEhhbmRsaW5nU3RhdGUgfSA9XG4gICAgdXNlSW5pdEdvbGRlbkxheW91dCh7XG4gICAgICBkZXBlbmRlbmNpZXM6IFtcbiAgICAgICAgZ29sZGVuTGF5b3V0Q29tcG9uZW50c1JlZ2lzdGVyZWQsXG4gICAgICAgIGxpc3RlbmluZ1RvR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2VzLFxuICAgICAgICBsaXN0ZW5pbmdUb0dvbGRlbkxheW91dFN0YWNrQ3JlYXRlZCxcbiAgICAgIF0sXG4gICAgICBnb2xkZW5MYXlvdXQsXG4gICAgfSlcblxuICB1c2VDcm9zc1dpbmRvd0dvbGRlbkxheW91dENvbW11bmljYXRpb24oe1xuICAgIGdvbGRlbkxheW91dCxcbiAgICBpc0luaXRpYWxpemVkOiAhZXJyb3IgJiYgZmluaXNoZWQsXG4gICAgb3B0aW9ucyxcbiAgfSlcblxuICB1c2VWZXJpZnlNYXBFeGlzdHNXaGVuRHJhd2luZyh7XG4gICAgZ29sZGVuTGF5b3V0LFxuICAgIGlzSW5pdGlhbGl6ZWQ6ICFlcnJvciAmJiBmaW5pc2hlZCxcbiAgfSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgZGF0YS1lbGVtZW50PVwiZ29sZGVuLWxheW91dFwiIGNsYXNzTmFtZT1cImlzLW1pbmltaXNlZCBoLWZ1bGwgdy1mdWxsXCI+XG4gICAgICB7cG9wdXBIYW5kbGluZ1N0YXRlID09PSAnYmxvY2tlZCcgPyAoXG4gICAgICAgIDxIYW5kbGVQb3BvdXRzQmxvY2tlZFxuICAgICAgICAgIGdvbGRlbkxheW91dD17Z29sZGVuTGF5b3V0fVxuICAgICAgICAgIHNldFBvcHVwSGFuZGxpbmdTdGF0ZT17c2V0UG9wdXBIYW5kbGluZ1N0YXRlfVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17c2V0R29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudH1cbiAgICAgICAgY2xhc3NOYW1lPVwiZ29sZGVuLWxheW91dC1jb250YWluZXIgdy1mdWxsIGgtZnVsbFwiXG4gICAgICAvPlxuICAgIDwvZGl2PlxuICApXG59XG4iXX0=