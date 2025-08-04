import { __assign, __read, __spreadArray } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { PatchReactRouterContextForGoldenLayoutSubwindows } from '../app/react-router.patches';
function preventRemovalFromStorage() {
    var normalRemoveItem = window.localStorage.removeItem;
    window.localStorage.removeItem = function (key) {
        if (key.includes('gl-window')) {
            return;
        }
        else {
            normalRemoveItem(key);
        }
    };
}
preventRemovalFromStorage();
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
        return (_jsxs(Dialog, { open: true, className: " z-[1000000]", children: [_jsx(DialogTitle, { children: "Could not find parent visualization" }), _jsx(DialogContent, { children: "Please close the window." }), _jsx(DialogActions, { children: _jsx(Button, { variant: "contained", onClick: function () {
                            window.close();
                        }, color: "primary", children: "Close Window" }) })] }));
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
    return (_jsx(PatchReactRouterContextForGoldenLayoutSubwindows, { goldenLayout: goldenLayout, children: _jsx(ExtensionPoints.providers, { children: _jsxs(VisualSettingsProvider, { container: container, goldenLayout: goldenLayout, children: [_jsx(UseSubwindowConsumeNavigationChange, { goldenLayout: goldenLayout }), _jsx(UseMissingParentWindow, { goldenLayout: goldenLayout }), _jsx(Paper, { elevation: Elevations.panels, className: "w-full h-full ".concat(isMinimized ? 'hidden' : ''), square: true, children: _jsx(ComponentView, { selectionInterface: options.selectionInterface, componentState: normalizedComponentState }) })] }) }) }));
};
// see https://github.com/deepstreamIO/golden-layout/issues/239 for details on why the setTimeout is necessary
// The short answer is it mostly has to do with making sure these ComponentViews are able to function normally (set up events, etc.)
function registerComponent(marionetteView, name, ComponentView, componentOptions, viz) {
    var options = _.extend({}, marionetteView.options, componentOptions);
    marionetteView.goldenLayout.registerComponent(name, function (container, componentState) {
        container.on('open', function () {
            setTimeout(function () {
                var root = createRoot(container.getElement()[0]);
                root.render(_jsx(GoldenLayoutComponent, { goldenLayout: marionetteView.goldenLayout, options: options, ComponentView: ComponentView, container: container, componentState: componentState }));
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
                    renderRoot_1.render(_jsx(GoldenLayoutComponentHeader, { viz: viz, tab: tab, options: options, componentState: componentState, container: container, name: name }));
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
            renderRoot_2.render(_jsx(StackToolbar, { stack: stack }));
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
    return (_jsxs(Dialog, { open: true, children: [_jsx(DialogTitle, { children: "Visualization popups blocked" }), _jsx(DialogContent, { children: "Please allow popups for this site, then click the button below to retry loading your visualization layout." }), _jsxs(DialogActions, { children: [_jsx(Button, { color: "error", onClick: function () {
                            goldenLayout.config.openPopouts = [];
                            setPopupHandlingState('proceed');
                        }, children: "Proceed without popups" }), _jsx(Button, { variant: "contained", color: "primary", onClick: function () {
                            // try opening two windows, as one is allowed since the user interacts with the button
                            var window1 = window.open('', '_blank');
                            var window2 = window.open('', '_blank');
                            if (window1 && window2) {
                                setPopupHandlingState('allowed');
                            }
                            window1 === null || window1 === void 0 ? void 0 : window1.close();
                            window2 === null || window2 === void 0 ? void 0 : window2.close();
                        }, children: "Retry" })] })] }));
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
    return (_jsxs("div", { "data-element": "golden-layout", className: "is-minimised h-full w-full", children: [popupHandlingState === 'blocked' ? (_jsx(HandlePopoutsBlocked, { goldenLayout: goldenLayout, setPopupHandlingState: setPopupHandlingState })) : null, _jsx("div", { ref: setGoldenLayoutAttachElement, className: "golden-layout-container w-full h-full" })] }));
};
export default GoldenLayoutViewReact;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC52aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQzdDLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQTtBQUd2QyxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEMsT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFBO0FBQ3hDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sZUFBZSxNQUFNLHlDQUF5QyxDQUFBO0FBQ3JFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUVoRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDcEUsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQzNDLE9BQU8sRUFDTCxNQUFNLEVBQ04sYUFBYSxFQUNiLGFBQWEsRUFDYixXQUFXLEdBQ1osTUFBTSxlQUFlLENBQUE7QUFDdEIsT0FBTyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUMvRCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUM5RCxPQUFPLEVBQ0wsbUNBQW1DLEVBQ25DLHVDQUF1QyxFQUN2QyxxQ0FBcUMsR0FDdEMsTUFBTSw4QkFBOEIsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDNUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUE7QUFDbkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDMUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDOUUsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDdEYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFFaEY7OztHQUdHO0FBQ0gsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sbUNBQW1DLENBQUE7QUFFNUUsT0FBTyxFQUFFLGdEQUFnRCxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFFOUYsU0FBUyx5QkFBeUI7SUFDaEMsSUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQTtJQUN2RCxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxVQUFDLEdBQVc7UUFDM0MsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDOUIsT0FBTTtRQUNSLENBQUM7YUFBTSxDQUFDO1lBQ04sZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkIsQ0FBQztJQUNILENBQUMsQ0FBQTtBQUNILENBQUM7QUFDRCx5QkFBeUIsRUFBRSxDQUFBO0FBRTNCOzs7O0dBSUc7QUFDSCxJQUFNLHNCQUFzQixHQUFHLFVBQUMsRUFBdUM7UUFBckMsWUFBWSxrQkFBQTtJQUN0QyxJQUFBLEtBQUEsT0FBb0MsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUF4RCxhQUFhLFFBQUEsRUFBRSxnQkFBZ0IsUUFBeUIsQ0FBQTtJQUMvRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSxZQUFZLElBQUksWUFBWSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3ZFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3hCLENBQUM7SUFDSCxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFBO0lBRWxCLElBQUksYUFBYSxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUNMLE1BQUMsTUFBTSxJQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDLGNBQWMsYUFDMUMsS0FBQyxXQUFXLHNEQUFrRCxFQUM5RCxLQUFDLGFBQWEsMkNBQXlDLEVBQ3ZELEtBQUMsYUFBYSxjQUNaLEtBQUMsTUFBTSxJQUNMLE9BQU8sRUFBQyxXQUFXLEVBQ25CLE9BQU8sRUFBRTs0QkFDUCxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7d0JBQ2hCLENBQUMsRUFDRCxLQUFLLEVBQUMsU0FBUyw2QkFHUixHQUNLLElBQ1QsQ0FDVixDQUFBO0lBQ0gsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQyxDQUFBO0FBRUQsSUFBTSxxQkFBcUIsR0FBRyxVQUFDLEVBYzlCO1FBYkMsYUFBYSxtQkFBQSxFQUNiLE9BQU8sYUFBQSxFQUNQLFNBQVMsZUFBQSxFQUNULFlBQVksa0JBQUEsRUFDWixjQUFjLG9CQUFBO0lBVU4sSUFBQSxNQUFNLEdBQUssZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE9BQWhDLENBQWdDO0lBQzlDLElBQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxNQUFNLElBQUksZUFBZSxDQUFBO0lBQ3ZELElBQU0sd0JBQXdCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUM3Qyw2QkFDSyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLEtBQ3pELGNBQWMsZ0JBQUEsSUFDZjtJQUNILENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7SUFFcEIsT0FBTyxDQUNMLEtBQUMsZ0RBQWdELElBQy9DLFlBQVksRUFBRSxZQUFZLFlBRTFCLEtBQUMsZUFBZSxDQUFDLFNBQVMsY0FDeEIsTUFBQyxzQkFBc0IsSUFDckIsU0FBUyxFQUFFLFNBQVMsRUFDcEIsWUFBWSxFQUFFLFlBQVksYUFFMUIsS0FBQyxtQ0FBbUMsSUFBQyxZQUFZLEVBQUUsWUFBWSxHQUFJLEVBQ25FLEtBQUMsc0JBQXNCLElBQUMsWUFBWSxFQUFFLFlBQVksR0FBSSxFQUN0RCxLQUFDLEtBQUssSUFDSixTQUFTLEVBQUUsVUFBVSxDQUFDLE1BQU0sRUFDNUIsU0FBUyxFQUFFLHdCQUFpQixXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFFLEVBQ3pELE1BQU0sa0JBRU4sS0FBQyxhQUFhLElBQ1osa0JBQWtCLEVBQUUsT0FBTyxDQUFDLGtCQUFrQixFQUM5QyxjQUFjLEVBQUUsd0JBQXdCLEdBQ3hDLEdBQ0ksSUFDZSxHQUNDLEdBQ3FCLENBQ3BELENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCw4R0FBOEc7QUFDOUcsb0lBQW9JO0FBQ3BJLFNBQVMsaUJBQWlCLENBQ3hCLGNBQW1ELEVBQ25ELElBQVMsRUFDVCxhQUFrQixFQUNsQixnQkFBcUIsRUFDckIsR0FBUTtJQUVSLElBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtJQUN0RSxjQUFjLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUMzQyxJQUFJLEVBQ0osVUFBQyxTQUFjLEVBQUUsY0FBbUI7UUFDbEMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUU7WUFDbkIsVUFBVSxDQUFDO2dCQUNULElBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FDVCxLQUFDLHFCQUFxQixJQUNwQixZQUFZLEVBQUUsY0FBYyxDQUFDLFlBQVksRUFDekMsT0FBTyxFQUFFLE9BQU8sRUFDaEIsYUFBYSxFQUFFLGFBQWEsRUFDNUIsU0FBUyxFQUFFLFNBQVMsRUFDcEIsY0FBYyxFQUFFLGNBQWMsR0FDOUIsQ0FDSCxDQUFBO2dCQUNELFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFO29CQUN0QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7Z0JBQ2hCLENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ1AsQ0FBQyxDQUFDLENBQUE7UUFDRixTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFDLEdBQVE7WUFDM0IsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFDLEtBQVU7Z0JBQ25ELElBQ0UsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVztvQkFDN0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQzNDLENBQUM7b0JBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUE7Z0JBQ3BDLENBQUM7Z0JBQ0QsR0FBRyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUM1QixDQUFDLENBQUMsQ0FBQTtZQUNGLElBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDMUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDeEIsSUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDO2dCQUMzQixJQUFJLENBQUM7b0JBQ0gsSUFBTSxZQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtvQkFDN0MsWUFBVSxDQUFDLE1BQU0sQ0FDZixLQUFDLDJCQUEyQixJQUMxQixHQUFHLEVBQUUsR0FBRyxFQUNSLEdBQUcsRUFBRSxHQUFHLEVBQ1IsT0FBTyxFQUFFLE9BQU8sRUFDaEIsY0FBYyxFQUFFLGNBQWMsRUFDOUIsU0FBUyxFQUFFLFNBQVMsRUFDcEIsSUFBSSxFQUFFLElBQUksR0FDVixDQUNILENBQUE7b0JBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFO3dCQUN2QixZQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7b0JBQ3RCLENBQUMsQ0FBQyxDQUFBO29CQUNGLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDM0IsQ0FBQztnQkFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUEsQ0FBQztZQUNsQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDVCxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FDRixDQUFBO0FBQ0gsQ0FBQztBQVNELFNBQVMsOEJBQThCLENBQUMsRUFNdkM7UUFMQyxZQUFZLGtCQUFBLEVBQ1osT0FBTyxhQUFBO0lBS1AsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUc7UUFDekIsSUFBSSxDQUFDO1lBQ0gsaUJBQWlCLENBQ2YsRUFBRSxZQUFZLGNBQUEsRUFBRSxPQUFPLFNBQUEsRUFBRSxFQUN6QixHQUFHLENBQUMsRUFBRSxFQUNOLEdBQUcsQ0FBQyxJQUFJLEVBQ1IsR0FBRyxDQUFDLE9BQU8sRUFDWCxHQUFHLENBQ0osQ0FBQTtRQUNILENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2Isb0NBQW9DO1FBQ3RDLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRCxTQUFTLHdDQUF3QyxDQUFDLEVBSWpEO1FBSEMsWUFBWSxrQkFBQTtJQUlaLGtHQUFrRztJQUNsRyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDeEIscUNBQXFDLENBQUMsNEJBQTRCLEVBQ2xFLElBQUksQ0FDTCxDQUFBO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyw4QkFBOEIsQ0FBQyxLQUFVO0lBQ2hELElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQztRQUMzQixJQUFJLENBQUM7WUFDSCxJQUFNLFlBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2hFLFlBQVUsQ0FBQyxNQUFNLENBQUMsS0FBQyxZQUFZLElBQUMsS0FBSyxFQUFFLEtBQUssR0FBSSxDQUFDLENBQUE7WUFDakQsS0FBSyxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxVQUFVLFdBQWdCO2dCQUM3RCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxXQUFXLENBQUMsQ0FBQTtZQUM3RCxDQUFDLENBQUMsQ0FBQTtZQUNGLEtBQUssQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFO2dCQUNsQixZQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDdEIsQ0FBQyxDQUFDLENBQUE7WUFDRixhQUFhLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDM0IsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQSxDQUFDO0lBQ2xCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNULENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLFNBQWlDO0lBQ25ELElBQUEsS0FBQSxPQUFvQixLQUFLLENBQUMsUUFBUSxDQUFxQixTQUFTLENBQUMsS0FBSyxDQUFDLElBQUEsRUFBdEUsS0FBSyxRQUFBLEVBQUUsUUFBUSxRQUF1RCxDQUFBO0lBQ3ZFLElBQUEsS0FBQSxPQUFzQixLQUFLLENBQUMsUUFBUSxDQUN4QyxTQUFTLENBQUMsTUFBTSxDQUNqQixJQUFBLEVBRk0sTUFBTSxRQUFBLEVBQUUsU0FBUyxRQUV2QixDQUFBO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQUksU0FBUyxFQUFFLENBQUM7WUFDZCxJQUFNLGdCQUFjLEdBQUc7Z0JBQ3JCLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ3pCLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDN0IsQ0FBQyxDQUFBO1lBQ0QsU0FBUyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsZ0JBQWMsQ0FBQyxDQUFBO1lBQ3RDLE9BQU87Z0JBQ0wsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsZ0JBQWMsQ0FBQyxDQUFBO1lBQ3pDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFDRCxPQUFPLGNBQU8sQ0FBQyxDQUFBO0lBQ2pCLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFDZixPQUFPLEVBQUUsTUFBTSxRQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQTtBQUMxQixDQUFDO0FBRUQsSUFBTSx5QkFBeUIsR0FBRyxVQUFDLEVBTWxDO1FBTEMsS0FBSyxXQUFBLEVBQ0wsWUFBWSxrQkFBQTtJQUtaLFdBQVcsQ0FBRSxLQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtRQUNoRCxJQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsYUFBYTtZQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUMzRSxDQUFDLENBQUMsQ0FBQTtJQUNGLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2pCLElBQU0sY0FBWSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtZQUM3QyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUNWLFNBQVMsR0FBRyxjQUFZLEVBQ3hCLFNBQVMsQ0FDUDtnQkFDRSxJQUFJLFlBQVksQ0FBQyxhQUFhO29CQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtZQUMzRCxDQUFDLEVBQ0QsR0FBRyxFQUNIO2dCQUNFLE9BQU8sRUFBRSxLQUFLO2dCQUNkLFFBQVEsRUFBRSxJQUFJO2FBQ2YsQ0FDRixDQUNGLENBQUE7WUFDRCxPQUFPO2dCQUNMLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLGNBQVksQ0FBQyxDQUFBO1lBQ3pDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFDRCxPQUFPLGNBQU8sQ0FBQyxDQUFBO0lBQ2pCLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7QUFDcEIsQ0FBQyxDQUFBO0FBRUQsSUFBTSxtQ0FBbUMsR0FBRyxVQUFDLEVBTTVDO1FBTEMsT0FBTyxhQUFBLEVBQ1AsWUFBWSxrQkFBQTtJQUtaLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2pCLE9BQU8sQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDdkMsQ0FBQztRQUNELE9BQU87WUFDTCxJQUFJLFlBQVksRUFBRSxDQUFDO2dCQUNqQixZQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDeEIsQ0FBQztRQUNILENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7QUFDcEIsQ0FBQyxDQUFBO0FBRUQsSUFBTSxxQkFBcUIsR0FBRyxVQUFDLEVBUTlCO1FBUEMseUJBQXlCLCtCQUFBLEVBQ3pCLGVBQWUscUJBQUEsRUFDZixPQUFPLGFBQUE7SUFNUCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO1lBQzlCLGVBQWUsQ0FDYixJQUFJLFlBQVksQ0FDZCxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFDOUIseUJBQXlCLENBQzFCLENBQ0YsQ0FBQTtRQUNILENBQUM7SUFDSCxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUE7QUFDakMsQ0FBQyxDQUFBO0FBRUQsSUFBTSxpQ0FBaUMsR0FBRyxVQUFDLEVBTTFDO1FBTEMsT0FBTyxhQUFBLEVBQ1AsWUFBWSxrQkFBQTtJQUtOLElBQUEsS0FBQSxPQUEwQixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFBLEVBQTlDLFFBQVEsUUFBQSxFQUFFLFdBQVcsUUFBeUIsQ0FBQTtJQUNyRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQiw4QkFBOEIsQ0FBQztnQkFDN0IsWUFBWSxjQUFBO2dCQUNaLE9BQU8sU0FBQTthQUNSLENBQUMsQ0FBQTtZQUNGLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNuQixDQUFDO0lBQ0gsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQTtJQUNsQixPQUFPLFFBQVEsQ0FBQTtBQUNqQixDQUFDLENBQUE7QUFFRCxJQUFNLG1DQUFtQyxHQUFHLFVBQUMsRUFRNUM7UUFQQyxPQUFPLGFBQUEsRUFDUCxZQUFZLGtCQUFBLEVBQ1osVUFBVSxnQkFBQTtJQU1KLElBQUEsS0FBQSxPQUEwQixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFBLEVBQTlDLFFBQVEsUUFBQSxFQUFFLFdBQVcsUUFBeUIsQ0FBQTtJQUVyRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixJQUFNLHdDQUFzQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQ3ZELFVBQUMsRUFBeUM7b0JBQXZDLGFBQWEsbUJBQUE7Z0JBQ2QsQ0FBQztnQkFBQyxLQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQSxDQUFDLG9DQUFvQztnQkFDM0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDOUIsOEhBQThIO29CQUM5SCw2QkFBNkIsQ0FBQzt3QkFDNUIsT0FBTyxTQUFBO3dCQUNQLGFBQWEsZUFBQTt3QkFDYixZQUFZLGNBQUE7d0JBQ1osVUFBVSxZQUFBO3FCQUNYLENBQUMsQ0FBQTtnQkFDSixDQUFDO3FCQUFNLENBQUM7b0JBQ04sd0NBQXdDLENBQUMsRUFBRSxZQUFZLGNBQUEsRUFBRSxDQUFDLENBQUE7Z0JBQzVELENBQUM7WUFDSCxDQUFDLEVBQ0QsR0FBRyxDQUNKLENBQUE7WUFDRDs7Ozs7O2VBTUc7WUFDSCxZQUFZLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxVQUFDLEtBQVU7O2dCQUN6QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ1gsT0FBTTtnQkFDUixDQUFDO2dCQUNELElBQU0sZ0JBQWdCLEdBQ3BCLFlBQVksQ0FBQyxhQUFhO29CQUMxQixDQUFDLENBQUEsTUFBQyxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsV0FBMEIsMENBQUUsSUFBSSxDQUM5QyxVQUFDLE1BQVcsSUFBSyxPQUFBLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBckIsQ0FBcUIsQ0FDdkMsQ0FBQSxDQUFBO2dCQUNILElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUN0QixVQUFVLENBQUM7d0JBQ1QsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUE7b0JBQzVDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtvQkFDUCxPQUFNO2dCQUNSLENBQUM7Z0JBQ0QsSUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsRUFBRSxZQUFZLGNBQUEsRUFBRSxDQUFDLENBQUE7Z0JBQ3pEOzs7bUJBR0c7Z0JBQ0gsd0NBQXNDLENBQUM7b0JBQ3JDLGFBQWEsZUFBQTtpQkFDZCxDQUFDLENBQUE7WUFDSixDQUFDLENBQUMsQ0FBQTtZQUNGLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNqQixPQUFPO2dCQUNMLFlBQVksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7WUFDbEMsQ0FBQyxDQUFBO1FBQ0gsQ0FBQztRQUNELE9BQU8sY0FBTyxDQUFDLENBQUE7SUFDakIsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQTtJQUNsQixPQUFPLFFBQVEsQ0FBQTtBQUNqQixDQUFDLENBQUE7QUFFRDs7R0FFRztBQUNILElBQU0sbUNBQW1DLEdBQUcsVUFBQyxFQUk1QztRQUhDLFlBQVksa0JBQUE7SUFJTixJQUFBLEtBQUEsT0FBMEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUE5QyxRQUFRLFFBQUEsRUFBRSxXQUFXLFFBQXlCLENBQUE7SUFFckQsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsOEJBQThCLENBQUMsQ0FBQTtZQUMvRCxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDakIsT0FBTztnQkFDTCxZQUFZLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1lBQ2xDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFDRCxPQUFPLGNBQU8sQ0FBQyxDQUFBO0lBQ2pCLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7SUFDbEIsT0FBTyxRQUFRLENBQUE7QUFDakIsQ0FBQyxDQUFBO0FBSUQsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLEVBTTVCO1FBTEMsWUFBWSxrQkFBQSxFQUNaLFlBQVksa0JBQUE7SUFLTixJQUFBLEtBQUEsT0FBMEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUE5QyxRQUFRLFFBQUEsRUFBRSxXQUFXLFFBQXlCLENBQUE7SUFDL0MsSUFBQSxLQUFBLE9BQW9CLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUEsRUFBeEMsS0FBSyxRQUFBLEVBQUUsUUFBUSxRQUF5QixDQUFBO0lBQ3pDLElBQUEsS0FBQSxPQUNKLEtBQUssQ0FBQyxRQUFRLENBQXlCLFNBQVMsQ0FBQyxJQUFBLEVBRDVDLGtCQUFrQixRQUFBLEVBQUUscUJBQXFCLFFBQ0csQ0FBQTtJQUVuRCxLQUFLLENBQUMsU0FBUyxDQUFDOztRQUNkLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxVQUFDLFVBQVUsSUFBSyxPQUFBLFVBQVUsRUFBVixDQUFVLENBQUMsRUFBRSxDQUFDO1lBQ25ELElBQUksWUFBWSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUN2RCxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDaEIsQ0FBQztZQUNELElBQU0sUUFBTSxHQUFHO2dCQUNiLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNuQixDQUFDLENBQUE7WUFDRCxZQUFZLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFNLENBQUMsQ0FBQTtZQUN0QyxJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDN0Isb0lBQW9JO2dCQUNwSSxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyx1QkFBdUIsRUFBRSxDQUFDLFVBQVUsQ0FBQTtZQUN2RSxDQUFDO1lBQ0QsSUFBSSxDQUFDO2dCQUNILFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtZQUNyQixDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDWCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssZUFBZSxFQUFFLENBQUM7b0JBQy9CLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFBO29CQUNoQyxNQUFBLFlBQVksQ0FBQyxXQUFXLDBDQUFFLE9BQU8sQ0FBQyxVQUFDLE1BQVc7d0JBQzVDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtvQkFDaEIsQ0FBQyxDQUFDLENBQUE7Z0JBQ0osQ0FBQztZQUNILENBQUM7WUFFRCxPQUFPO2dCQUNMLFlBQVksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFFBQU0sQ0FBQyxDQUFBO1lBQ3pDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFDRCxPQUFPLGNBQU8sQ0FBQyxDQUFBO0lBQ2pCLENBQUMseUNBQU0sWUFBWSxZQUFFLGtCQUFrQixVQUFFLENBQUE7SUFDekMsT0FBTztRQUNMLFFBQVEsVUFBQTtRQUNSLEtBQUssT0FBQTtRQUNMLHFCQUFxQix1QkFBQTtRQUNyQixrQkFBa0Isb0JBQUE7S0FDbkIsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELElBQU0sb0JBQW9CLEdBQUcsVUFBQyxFQU03QjtRQUxDLHFCQUFxQiwyQkFBQSxFQUNyQixZQUFZLGtCQUFBO0lBS1osT0FBTyxDQUNMLE1BQUMsTUFBTSxJQUFDLElBQUksRUFBRSxJQUFJLGFBQ2hCLEtBQUMsV0FBVywrQ0FBMkMsRUFDdkQsS0FBQyxhQUFhLDZIQUdFLEVBQ2hCLE1BQUMsYUFBYSxlQUNaLEtBQUMsTUFBTSxJQUNMLEtBQUssRUFBQyxPQUFPLEVBQ2IsT0FBTyxFQUFFOzRCQUNQLFlBQVksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQTs0QkFDcEMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUE7d0JBQ2xDLENBQUMsdUNBR00sRUFDVCxLQUFDLE1BQU0sSUFDTCxPQUFPLEVBQUMsV0FBVyxFQUNuQixLQUFLLEVBQUMsU0FBUyxFQUNmLE9BQU8sRUFBRTs0QkFDUCxzRkFBc0Y7NEJBQ3RGLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFBOzRCQUN6QyxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQTs0QkFDekMsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFLENBQUM7Z0NBQ3ZCLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFBOzRCQUNsQyxDQUFDOzRCQUNELE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxLQUFLLEVBQUUsQ0FBQTs0QkFDaEIsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLEtBQUssRUFBRSxDQUFBO3dCQUNsQixDQUFDLHNCQUdNLElBQ0ssSUFDVCxDQUNWLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxxQkFBcUIsR0FBRyxVQUFDLE9BQThCO0lBQzVELElBQUEsS0FBQSxPQUNKLEtBQUssQ0FBQyxRQUFRLENBQXdCLElBQUksQ0FBQyxJQUFBLEVBRHRDLHlCQUF5QixRQUFBLEVBQUUsNEJBQTRCLFFBQ2pCLENBQUE7SUFDdkMsSUFBQSxLQUFBLE9BQWtDLEtBQUssQ0FBQyxRQUFRLENBQU0sSUFBSSxDQUFDLElBQUEsRUFBMUQsWUFBWSxRQUFBLEVBQUUsZUFBZSxRQUE2QixDQUFBO0lBQ2pFLElBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQU0scUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtJQUNwRSx5QkFBeUIsQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLFlBQVksY0FBQSxFQUFFLENBQUMsQ0FBQTtJQUNsRCxtQ0FBbUMsQ0FBQyxFQUFFLE9BQU8sU0FBQSxFQUFFLFlBQVksY0FBQSxFQUFFLENBQUMsQ0FBQTtJQUM5RCxxQkFBcUIsQ0FBQyxFQUFFLHlCQUF5QiwyQkFBQSxFQUFFLGVBQWUsaUJBQUEsRUFBRSxPQUFPLFNBQUEsRUFBRSxDQUFDLENBQUE7SUFDOUUsSUFBTSxnQ0FBZ0MsR0FBRyxpQ0FBaUMsQ0FBQztRQUN6RSxPQUFPLFNBQUE7UUFDUCxZQUFZLGNBQUE7S0FDYixDQUFDLENBQUE7SUFDRixJQUFNLG1DQUFtQyxHQUN2QyxtQ0FBbUMsQ0FBQyxFQUFFLE9BQU8sU0FBQSxFQUFFLFlBQVksY0FBQSxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsQ0FBQTtJQUM1RSxJQUFNLG1DQUFtQyxHQUN2QyxtQ0FBbUMsQ0FBQyxFQUFFLFlBQVksY0FBQSxFQUFFLENBQUMsQ0FBQTtJQUVqRCxJQUFBLEtBQ0osbUJBQW1CLENBQUM7UUFDbEIsWUFBWSxFQUFFO1lBQ1osZ0NBQWdDO1lBQ2hDLG1DQUFtQztZQUNuQyxtQ0FBbUM7U0FDcEM7UUFDRCxZQUFZLGNBQUE7S0FDYixDQUFDLEVBUkksUUFBUSxjQUFBLEVBQUUsS0FBSyxXQUFBLEVBQUUscUJBQXFCLDJCQUFBLEVBQUUsa0JBQWtCLHdCQVE5RCxDQUFBO0lBRUosdUNBQXVDLENBQUM7UUFDdEMsWUFBWSxjQUFBO1FBQ1osYUFBYSxFQUFFLENBQUMsS0FBSyxJQUFJLFFBQVE7UUFDakMsT0FBTyxTQUFBO0tBQ1IsQ0FBQyxDQUFBO0lBRUYsNkJBQTZCLENBQUM7UUFDNUIsWUFBWSxjQUFBO1FBQ1osYUFBYSxFQUFFLENBQUMsS0FBSyxJQUFJLFFBQVE7S0FDbEMsQ0FBQyxDQUFBO0lBRUYsT0FBTyxDQUNMLCtCQUFrQixlQUFlLEVBQUMsU0FBUyxFQUFDLDRCQUE0QixhQUNyRSxrQkFBa0IsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQ2xDLEtBQUMsb0JBQW9CLElBQ25CLFlBQVksRUFBRSxZQUFZLEVBQzFCLHFCQUFxQixFQUFFLHFCQUFxQixHQUM1QyxDQUNILENBQUMsQ0FBQyxDQUFDLElBQUksRUFDUixjQUNFLEdBQUcsRUFBRSw0QkFBNEIsRUFDakMsU0FBUyxFQUFDLHVDQUF1QyxHQUNqRCxJQUNFLENBQ1AsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUscUJBQXFCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgY3JlYXRlUm9vdCB9IGZyb20gJ3JlYWN0LWRvbS9jbGllbnQnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IF9kZWJvdW5jZSBmcm9tICdsb2Rhc2gvZGVib3VuY2UnXG5pbXBvcnQgX2Nsb25lRGVlcCBmcm9tICdsb2Rhc2guY2xvbmVkZWVwJ1xuaW1wb3J0IF9pc0VxdWFsV2l0aCBmcm9tICdsb2Rhc2guaXNlcXVhbHdpdGgnXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vanMvd3JlcXInXG5pbXBvcnQgR29sZGVuTGF5b3V0IGZyb20gJ2dvbGRlbi1sYXlvdXQnXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IEV4dGVuc2lvblBvaW50cyBmcm9tICcuLi8uLi9leHRlbnNpb24tcG9pbnRzL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgeyBWaXN1YWxpemF0aW9ucyB9IGZyb20gJy4uL3Zpc3VhbGl6YXRpb24vdmlzdWFsaXphdGlvbnMnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgdXNlTGlzdGVuVG8gfSBmcm9tICcuLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCBQYXBlciBmcm9tICdAbXVpL21hdGVyaWFsL1BhcGVyJ1xuaW1wb3J0IHsgRWxldmF0aW9ucyB9IGZyb20gJy4uL3RoZW1lL3RoZW1lJ1xuaW1wb3J0IHtcbiAgRGlhbG9nLFxuICBEaWFsb2dBY3Rpb25zLFxuICBEaWFsb2dDb250ZW50LFxuICBEaWFsb2dUaXRsZSxcbn0gZnJvbSAnQG11aS9tYXRlcmlhbCdcbmltcG9ydCB7IFN0YWNrVG9vbGJhciwgTWluaW1pemVkSGVpZ2h0IH0gZnJvbSAnLi9zdGFjay10b29sYmFyJ1xuaW1wb3J0IHsgR29sZGVuTGF5b3V0Q29tcG9uZW50SGVhZGVyIH0gZnJvbSAnLi92aXN1YWwtdG9vbGJhcidcbmltcG9ydCB7XG4gIFVzZVN1YndpbmRvd0NvbnN1bWVOYXZpZ2F0aW9uQ2hhbmdlLFxuICB1c2VDcm9zc1dpbmRvd0dvbGRlbkxheW91dENvbW11bmljYXRpb24sXG4gIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMsXG59IGZyb20gJy4vY3Jvc3Mtd2luZG93LWNvbW11bmljYXRpb24nXG5pbXBvcnQgeyB1c2VWZXJpZnlNYXBFeGlzdHNXaGVuRHJhd2luZyB9IGZyb20gJy4vdmVyaWZ5LW1hcCdcbmltcG9ydCB7IFZpc3VhbFNldHRpbmdzUHJvdmlkZXIgfSBmcm9tICcuL3Zpc3VhbC1zZXR0aW5ncy5wcm92aWRlcidcbmltcG9ydCB7IGdldEluc3RhbmNlQ29uZmlnIH0gZnJvbSAnLi9nb2xkZW4tbGF5b3V0LmxheW91dC1jb25maWctaGFuZGxpbmcnXG5pbXBvcnQgeyBnZXRHb2xkZW5MYXlvdXRDb25maWcgfSBmcm9tICcuL2dvbGRlbi1sYXlvdXQubGF5b3V0LWNvbmZpZy1oYW5kbGluZydcbmltcG9ydCB7IGhhbmRsZUdvbGRlbkxheW91dFN0YXRlQ2hhbmdlIH0gZnJvbSAnLi9nb2xkZW4tbGF5b3V0LmxheW91dC1jb25maWctaGFuZGxpbmcnXG5pbXBvcnQgeyBnZXRHb2xkZW5MYXlvdXRTZXR0aW5ncyB9IGZyb20gJy4vZ29sZGVuLWxheW91dC5sYXlvdXQtY29uZmlnLWhhbmRsaW5nJ1xuXG4vKipcbiAqICBGb3Igc29tZSByZWFzb24gZ29sZGVuIGxheW91dCByZW1vdmVzIGNvbmZpZ3MgZnJvbSBsb2NhbCBzdG9yYWdlIHVwb24gZmlyc3QgbG9hZCBvZiBwb3BvdXQgd2luZG93LCB3aGljaCBtZWFucyByZWZyZXNoaW5nIGRvZXNuJ3Qgd29yay5cbiAqICBUaGlzIHByZXZlbnRzIHRoaXMgbGluZSBmcm9tIGRvaW5nIHNvOiBodHRwczovL2dpdGh1Yi5jb20vZ29sZGVuLWxheW91dC9nb2xkZW4tbGF5b3V0L2Jsb2IvdjEuNS45L3NyYy9qcy9MYXlvdXRNYW5hZ2VyLmpzI0w3OTdcbiAqL1xuaW1wb3J0IHsgZ2V0RGVmYXVsdENvbXBvbmVudFN0YXRlIH0gZnJvbSAnLi4vdmlzdWFsaXphdGlvbi9zZXR0aW5ncy1oZWxwZXJzJ1xuaW1wb3J0IHsgQ29tcG9uZW50TmFtZVR5cGUgfSBmcm9tICcuL2dvbGRlbi1sYXlvdXQudHlwZXMnXG5pbXBvcnQgeyBQYXRjaFJlYWN0Um91dGVyQ29udGV4dEZvckdvbGRlbkxheW91dFN1YndpbmRvd3MgfSBmcm9tICcuLi9hcHAvcmVhY3Qtcm91dGVyLnBhdGNoZXMnXG5cbmZ1bmN0aW9uIHByZXZlbnRSZW1vdmFsRnJvbVN0b3JhZ2UoKSB7XG4gIGNvbnN0IG5vcm1hbFJlbW92ZUl0ZW0gPSB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW1cbiAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtID0gKGtleTogc3RyaW5nKSA9PiB7XG4gICAgaWYgKGtleS5pbmNsdWRlcygnZ2wtd2luZG93JykpIHtcbiAgICAgIHJldHVyblxuICAgIH0gZWxzZSB7XG4gICAgICBub3JtYWxSZW1vdmVJdGVtKGtleSlcbiAgICB9XG4gIH1cbn1cbnByZXZlbnRSZW1vdmFsRnJvbVN0b3JhZ2UoKVxuXG4vKipcbiAqICBXZSBhdHRhY2ggdGhpcyBhdCB0aGUgY29tcG9uZW50IGxldmVsIGR1ZSB0byBob3cgcG9wb3V0cyB3b3JrLlxuICogIEVzc2VudGlhbGx5IGdvbGRlbiBsYXlvdXQgZGlzY29ubmVjdHMgdXMgZnJvbSBSZWFjdCBhbmQgb3VyIHByb3ZpZGVycyBpbiBwb3BvdXRzIHRvIGZ1bGxzY3JlZW4gdmlzdWFscyxcbiAqICBzbyB3ZSBjYW4ndCB1c2UgRGlhbG9nIGZ1cnRoZXIgdXAgdGhlIHRyZWUuXG4gKi9cbmNvbnN0IFVzZU1pc3NpbmdQYXJlbnRXaW5kb3cgPSAoeyBnb2xkZW5MYXlvdXQgfTogeyBnb2xkZW5MYXlvdXQ6IGFueSB9KSA9PiB7XG4gIGNvbnN0IFttaXNzaW5nV2luZG93LCBzZXRNaXNzaW5nV2luZG93XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQgJiYgZ29sZGVuTGF5b3V0LmlzU3ViV2luZG93ICYmIHdpbmRvdy5vcGVuZXIgPT09IG51bGwpIHtcbiAgICAgIHNldE1pc3NpbmdXaW5kb3codHJ1ZSlcbiAgICB9XG4gIH0sIFtnb2xkZW5MYXlvdXRdKVxuXG4gIGlmIChtaXNzaW5nV2luZG93KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxEaWFsb2cgb3Blbj17dHJ1ZX0gY2xhc3NOYW1lPVwiIHotWzEwMDAwMDBdXCI+XG4gICAgICAgIDxEaWFsb2dUaXRsZT5Db3VsZCBub3QgZmluZCBwYXJlbnQgdmlzdWFsaXphdGlvbjwvRGlhbG9nVGl0bGU+XG4gICAgICAgIDxEaWFsb2dDb250ZW50PlBsZWFzZSBjbG9zZSB0aGUgd2luZG93LjwvRGlhbG9nQ29udGVudD5cbiAgICAgICAgPERpYWxvZ0FjdGlvbnM+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBDbG9zZSBXaW5kb3dcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgICAgPC9EaWFsb2c+XG4gICAgKVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmNvbnN0IEdvbGRlbkxheW91dENvbXBvbmVudCA9ICh7XG4gIENvbXBvbmVudFZpZXcsXG4gIG9wdGlvbnMsXG4gIGNvbnRhaW5lcixcbiAgZ29sZGVuTGF5b3V0LFxuICBjb21wb25lbnRTdGF0ZSxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgb3B0aW9uczogYW55XG4gIENvbXBvbmVudFZpZXc6IGFueVxuICBjb250YWluZXI6IEdvbGRlbkxheW91dC5Db250YWluZXJcbiAgY29tcG9uZW50U3RhdGU6IHtcbiAgICBjb21wb25lbnROYW1lOiBDb21wb25lbnROYW1lVHlwZVxuICB9XG59KSA9PiB7XG4gIGNvbnN0IHsgaGVpZ2h0IH0gPSB1c2VDb250YWluZXJTaXplKGNvbnRhaW5lcilcbiAgY29uc3QgaXNNaW5pbWl6ZWQgPSBoZWlnaHQgJiYgaGVpZ2h0IDw9IE1pbmltaXplZEhlaWdodFxuICBjb25zdCBub3JtYWxpemVkQ29tcG9uZW50U3RhdGUgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZ2V0RGVmYXVsdENvbXBvbmVudFN0YXRlKGNvbXBvbmVudFN0YXRlLmNvbXBvbmVudE5hbWUpLFxuICAgICAgY29tcG9uZW50U3RhdGUsXG4gICAgfVxuICB9LCBbY29tcG9uZW50U3RhdGVdKVxuXG4gIHJldHVybiAoXG4gICAgPFBhdGNoUmVhY3RSb3V0ZXJDb250ZXh0Rm9yR29sZGVuTGF5b3V0U3Vid2luZG93c1xuICAgICAgZ29sZGVuTGF5b3V0PXtnb2xkZW5MYXlvdXR9XG4gICAgPlxuICAgICAgPEV4dGVuc2lvblBvaW50cy5wcm92aWRlcnM+XG4gICAgICAgIDxWaXN1YWxTZXR0aW5nc1Byb3ZpZGVyXG4gICAgICAgICAgY29udGFpbmVyPXtjb250YWluZXJ9XG4gICAgICAgICAgZ29sZGVuTGF5b3V0PXtnb2xkZW5MYXlvdXR9XG4gICAgICAgID5cbiAgICAgICAgICA8VXNlU3Vid2luZG93Q29uc3VtZU5hdmlnYXRpb25DaGFuZ2UgZ29sZGVuTGF5b3V0PXtnb2xkZW5MYXlvdXR9IC8+XG4gICAgICAgICAgPFVzZU1pc3NpbmdQYXJlbnRXaW5kb3cgZ29sZGVuTGF5b3V0PXtnb2xkZW5MYXlvdXR9IC8+XG4gICAgICAgICAgPFBhcGVyXG4gICAgICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFuZWxzfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgdy1mdWxsIGgtZnVsbCAke2lzTWluaW1pemVkID8gJ2hpZGRlbicgOiAnJ31gfVxuICAgICAgICAgICAgc3F1YXJlXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPENvbXBvbmVudFZpZXdcbiAgICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlPXtvcHRpb25zLnNlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICAgICAgY29tcG9uZW50U3RhdGU9e25vcm1hbGl6ZWRDb21wb25lbnRTdGF0ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgPC9WaXN1YWxTZXR0aW5nc1Byb3ZpZGVyPlxuICAgICAgPC9FeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICAgIDwvUGF0Y2hSZWFjdFJvdXRlckNvbnRleHRGb3JHb2xkZW5MYXlvdXRTdWJ3aW5kb3dzPlxuICApXG59XG4vLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2RlZXBzdHJlYW1JTy9nb2xkZW4tbGF5b3V0L2lzc3Vlcy8yMzkgZm9yIGRldGFpbHMgb24gd2h5IHRoZSBzZXRUaW1lb3V0IGlzIG5lY2Vzc2FyeVxuLy8gVGhlIHNob3J0IGFuc3dlciBpcyBpdCBtb3N0bHkgaGFzIHRvIGRvIHdpdGggbWFraW5nIHN1cmUgdGhlc2UgQ29tcG9uZW50Vmlld3MgYXJlIGFibGUgdG8gZnVuY3Rpb24gbm9ybWFsbHkgKHNldCB1cCBldmVudHMsIGV0Yy4pXG5mdW5jdGlvbiByZWdpc3RlckNvbXBvbmVudChcbiAgbWFyaW9uZXR0ZVZpZXc6IHsgZ29sZGVuTGF5b3V0OiBhbnk7IG9wdGlvbnM6IGFueSB9LFxuICBuYW1lOiBhbnksXG4gIENvbXBvbmVudFZpZXc6IGFueSxcbiAgY29tcG9uZW50T3B0aW9uczogYW55LFxuICB2aXo6IGFueVxuKSB7XG4gIGNvbnN0IG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgbWFyaW9uZXR0ZVZpZXcub3B0aW9ucywgY29tcG9uZW50T3B0aW9ucylcbiAgbWFyaW9uZXR0ZVZpZXcuZ29sZGVuTGF5b3V0LnJlZ2lzdGVyQ29tcG9uZW50KFxuICAgIG5hbWUsXG4gICAgKGNvbnRhaW5lcjogYW55LCBjb21wb25lbnRTdGF0ZTogYW55KSA9PiB7XG4gICAgICBjb250YWluZXIub24oJ29wZW4nLCAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJvb3QgPSBjcmVhdGVSb290KGNvbnRhaW5lci5nZXRFbGVtZW50KClbMF0pXG4gICAgICAgICAgcm9vdC5yZW5kZXIoXG4gICAgICAgICAgICA8R29sZGVuTGF5b3V0Q29tcG9uZW50XG4gICAgICAgICAgICAgIGdvbGRlbkxheW91dD17bWFyaW9uZXR0ZVZpZXcuZ29sZGVuTGF5b3V0fVxuICAgICAgICAgICAgICBvcHRpb25zPXtvcHRpb25zfVxuICAgICAgICAgICAgICBDb21wb25lbnRWaWV3PXtDb21wb25lbnRWaWV3fVxuICAgICAgICAgICAgICBjb250YWluZXI9e2NvbnRhaW5lcn1cbiAgICAgICAgICAgICAgY29tcG9uZW50U3RhdGU9e2NvbXBvbmVudFN0YXRlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApXG4gICAgICAgICAgY29udGFpbmVyLm9uKCdkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgcm9vdC51bm1vdW50KClcbiAgICAgICAgICB9KVxuICAgICAgICB9LCAwKVxuICAgICAgfSlcbiAgICAgIGNvbnRhaW5lci5vbigndGFiJywgKHRhYjogYW55KSA9PiB7XG4gICAgICAgIHRhYi5jbG9zZUVsZW1lbnQub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGFiLmhlYWRlci5wYXJlbnQuaXNNYXhpbWlzZWQgJiZcbiAgICAgICAgICAgIHRhYi5oZWFkZXIucGFyZW50LmNvbnRlbnRJdGVtcy5sZW5ndGggPT09IDFcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRhYi5oZWFkZXIucGFyZW50LnRvZ2dsZU1heGltaXNlKClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFiLl9vbkNsb3NlQ2xpY2tGbihldmVudClcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIHRhYi5lbGVtZW50LmFwcGVuZChyb290KVxuICAgICAgICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVuZGVyUm9vdCA9IGNyZWF0ZVJvb3QodGFiLmVsZW1lbnRbMF0pXG4gICAgICAgICAgICByZW5kZXJSb290LnJlbmRlcihcbiAgICAgICAgICAgICAgPEdvbGRlbkxheW91dENvbXBvbmVudEhlYWRlclxuICAgICAgICAgICAgICAgIHZpej17dml6fVxuICAgICAgICAgICAgICAgIHRhYj17dGFifVxuICAgICAgICAgICAgICAgIG9wdGlvbnM9e29wdGlvbnN9XG4gICAgICAgICAgICAgICAgY29tcG9uZW50U3RhdGU9e2NvbXBvbmVudFN0YXRlfVxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcj17Y29udGFpbmVyfVxuICAgICAgICAgICAgICAgIG5hbWU9e25hbWV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgICB0YWIuaGVhZGVyLm9uKCdkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZW5kZXJSb290LnVubW91bnQoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgICAgIH0sIDEwMClcbiAgICAgIH0pXG4gICAgfVxuICApXG59XG5leHBvcnQgdHlwZSBHb2xkZW5MYXlvdXRWaWV3UHJvcHMgPSB7XG4gIGxheW91dFJlc3VsdD86IExhenlRdWVyeVJlc3VsdFsncGxhaW4nXVxuICBlZGl0TGF5b3V0UmVmPzogUmVhY3QuTXV0YWJsZVJlZk9iamVjdDxhbnk+XG4gIGNvbmZpZ05hbWU/OiBzdHJpbmdcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgc2V0R29sZGVuTGF5b3V0OiAoaW5zdGFuY2U6IGFueSkgPT4gdm9pZFxufVxuXG5mdW5jdGlvbiByZWdpc3RlckdvbGRlbkxheW91dENvbXBvbmVudHMoe1xuICBnb2xkZW5MYXlvdXQsXG4gIG9wdGlvbnMsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG4gIG9wdGlvbnM6IEdvbGRlbkxheW91dFZpZXdQcm9wc1xufSkge1xuICBWaXN1YWxpemF0aW9ucy5mb3JFYWNoKCh2aXopID0+IHtcbiAgICB0cnkge1xuICAgICAgcmVnaXN0ZXJDb21wb25lbnQoXG4gICAgICAgIHsgZ29sZGVuTGF5b3V0LCBvcHRpb25zIH0sXG4gICAgICAgIHZpei5pZCxcbiAgICAgICAgdml6LnZpZXcsXG4gICAgICAgIHZpei5vcHRpb25zLFxuICAgICAgICB2aXpcbiAgICAgIClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIGxpa2VseSBhbHJlYWR5IHJlZ2lzdGVyZWQsIGluIGRldlxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gaGFuZGxlR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2VJblN1YndpbmRvdyh7XG4gIGdvbGRlbkxheW91dCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbn0pIHtcbiAgLy8gc2hvdWxkbid0IG5lZWQgdG8gc2VuZCBhbnl0aGluZywgYXMgdGhlIG1haW4gd2luZG93IGNhbiBkZXRlcm1pbmUgdGhlIGNvbmZpZyBmcm9tIHRoZSBzdWJ3aW5kb3dcbiAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLmVtaXQoXG4gICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lU3Vid2luZG93TGF5b3V0Q2hhbmdlLFxuICAgIG51bGxcbiAgKVxufVxuXG4vKipcbiAqICBSZXBsYWNlIHRoZSB0b29sYmFyIHdpdGggb3VyIG93blxuICovXG5mdW5jdGlvbiBoYW5kbGVHb2xkZW5MYXlvdXRTdGFja0NyZWF0ZWQoc3RhY2s6IGFueSkge1xuICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVuZGVyUm9vdCA9IGNyZWF0ZVJvb3Qoc3RhY2suaGVhZGVyLmNvbnRyb2xzQ29udGFpbmVyWzBdKVxuICAgICAgcmVuZGVyUm9vdC5yZW5kZXIoPFN0YWNrVG9vbGJhciBzdGFjaz17c3RhY2t9IC8+KVxuICAgICAgc3RhY2sub24oJ2FjdGl2ZUNvbnRlbnRJdGVtQ2hhbmdlZCcsIGZ1bmN0aW9uIChjb250ZW50SXRlbTogYW55KSB7XG4gICAgICAgIHdyZXFyLnZlbnQudHJpZ2dlcignYWN0aXZlQ29udGVudEl0ZW1DaGFuZ2VkJywgY29udGVudEl0ZW0pXG4gICAgICB9KVxuICAgICAgc3RhY2sub24oJ2Rlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIHJlbmRlclJvb3QudW5tb3VudCgpXG4gICAgICB9KVxuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgIH0gY2F0Y2ggKGVycikge31cbiAgfSwgMTAwKVxufVxuXG5mdW5jdGlvbiB1c2VDb250YWluZXJTaXplKGNvbnRhaW5lcjogR29sZGVuTGF5b3V0LkNvbnRhaW5lcikge1xuICBjb25zdCBbd2lkdGgsIHNldFdpZHRoXSA9IFJlYWN0LnVzZVN0YXRlPG51bWJlciB8IHVuZGVmaW5lZD4oY29udGFpbmVyLndpZHRoKVxuICBjb25zdCBbaGVpZ2h0LCBzZXRIZWlnaHRdID0gUmVhY3QudXNlU3RhdGU8bnVtYmVyIHwgdW5kZWZpbmVkPihcbiAgICBjb250YWluZXIuaGVpZ2h0XG4gIClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgIGNvbnN0IHJlc2l6ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICBzZXRXaWR0aChjb250YWluZXIud2lkdGgpXG4gICAgICAgIHNldEhlaWdodChjb250YWluZXIuaGVpZ2h0KVxuICAgICAgfVxuICAgICAgY29udGFpbmVyLm9uKCdyZXNpemUnLCByZXNpemVDYWxsYmFjaylcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnRhaW5lci5vZmYoJ3Jlc2l6ZScsIHJlc2l6ZUNhbGxiYWNrKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2NvbnRhaW5lcl0pXG4gIHJldHVybiB7IGhlaWdodCwgd2lkdGggfVxufVxuXG5jb25zdCB1c2VVcGRhdGVHb2xkZW5MYXlvdXRTaXplID0gKHtcbiAgd3JlcXIsXG4gIGdvbGRlbkxheW91dCxcbn06IHtcbiAgd3JlcXI6IGFueVxuICBnb2xkZW5MYXlvdXQ6IGFueVxufSkgPT4ge1xuICB1c2VMaXN0ZW5Ubygod3JlcXIgYXMgYW55KS52ZW50LCAnZ2wtdXBkYXRlU2l6ZScsICgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0ICYmIGdvbGRlbkxheW91dC5pc0luaXRpYWxpc2VkKSBnb2xkZW5MYXlvdXQudXBkYXRlU2l6ZSgpXG4gIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCkge1xuICAgICAgY29uc3QgcmFuZG9tU3RyaW5nID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygpXG4gICAgICAkKHdpbmRvdykub24oXG4gICAgICAgICdyZXNpemUuJyArIHJhbmRvbVN0cmluZyxcbiAgICAgICAgX2RlYm91bmNlKFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGlmIChnb2xkZW5MYXlvdXQuaXNJbml0aWFsaXNlZCkgZ29sZGVuTGF5b3V0LnVwZGF0ZVNpemUoKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgMTAwLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxlYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgdHJhaWxpbmc6IHRydWUsXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICApXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuJyArIHJhbmRvbVN0cmluZylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtnb2xkZW5MYXlvdXRdKVxufVxuXG5jb25zdCB1c2VTZW5kR29sZGVuTGF5b3V0UmVmZXJlbmNlVXB3YXJkcyA9ICh7XG4gIG9wdGlvbnMsXG4gIGdvbGRlbkxheW91dCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgb3B0aW9uczogR29sZGVuTGF5b3V0Vmlld1Byb3BzXG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCkge1xuICAgICAgb3B0aW9ucy5zZXRHb2xkZW5MYXlvdXQoZ29sZGVuTGF5b3V0KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGdvbGRlbkxheW91dCkge1xuICAgICAgICBnb2xkZW5MYXlvdXQuZGVzdHJveSgpXG4gICAgICB9XG4gICAgfVxuICB9LCBbZ29sZGVuTGF5b3V0XSlcbn1cblxuY29uc3QgdXNlQXR0YWNoR29sZGVuTGF5b3V0ID0gKHtcbiAgZ29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudCxcbiAgc2V0R29sZGVuTGF5b3V0LFxuICBvcHRpb25zLFxufToge1xuICBvcHRpb25zOiBHb2xkZW5MYXlvdXRWaWV3UHJvcHNcbiAgc2V0R29sZGVuTGF5b3V0OiBSZWFjdC5EaXNwYXRjaDxhbnk+XG4gIGdvbGRlbkxheW91dEF0dGFjaEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXRBdHRhY2hFbGVtZW50KSB7XG4gICAgICBzZXRHb2xkZW5MYXlvdXQoXG4gICAgICAgIG5ldyBHb2xkZW5MYXlvdXQoXG4gICAgICAgICAgZ2V0R29sZGVuTGF5b3V0Q29uZmlnKG9wdGlvbnMpLFxuICAgICAgICAgIGdvbGRlbkxheW91dEF0dGFjaEVsZW1lbnRcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgfSwgW2dvbGRlbkxheW91dEF0dGFjaEVsZW1lbnRdKVxufVxuXG5jb25zdCB1c2VSZWdpc3RlckdvbGRlbkxheW91dENvbXBvbmVudHMgPSAoe1xuICBvcHRpb25zLFxuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIG9wdGlvbnM6IEdvbGRlbkxheW91dFZpZXdQcm9wc1xuICBnb2xkZW5MYXlvdXQ6IGFueVxufSkgPT4ge1xuICBjb25zdCBbZmluaXNoZWQsIHNldEZpbmlzaGVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQpIHtcbiAgICAgIHJlZ2lzdGVyR29sZGVuTGF5b3V0Q29tcG9uZW50cyh7XG4gICAgICAgIGdvbGRlbkxheW91dCxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBzZXRGaW5pc2hlZCh0cnVlKVxuICAgIH1cbiAgfSwgW2dvbGRlbkxheW91dF0pXG4gIHJldHVybiBmaW5pc2hlZFxufVxuXG5jb25zdCB1c2VMaXN0ZW5Ub0dvbGRlbkxheW91dFN0YXRlQ2hhbmdlcyA9ICh7XG4gIG9wdGlvbnMsXG4gIGdvbGRlbkxheW91dCxcbiAgbGFzdENvbmZpZyxcbn06IHtcbiAgb3B0aW9uczogR29sZGVuTGF5b3V0Vmlld1Byb3BzXG4gIGdvbGRlbkxheW91dDogYW55XG4gIGxhc3RDb25maWc6IFJlYWN0Lk11dGFibGVSZWZPYmplY3Q8YW55PlxufSkgPT4ge1xuICBjb25zdCBbZmluaXNoZWQsIHNldEZpbmlzaGVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCkge1xuICAgICAgY29uc3QgZGVib3VuY2VkSGFuZGxlR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2UgPSBfLmRlYm91bmNlKFxuICAgICAgICAoeyBjdXJyZW50Q29uZmlnIH06IHsgY3VycmVudENvbmZpZzogYW55IH0pID0+IHtcbiAgICAgICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdyZXNpemUnKSAvLyB0cmlnZ2VyIHJlc2l6ZSBvZiB0aGluZ3MgbGlrZSBtYXBcbiAgICAgICAgICBpZiAoIWdvbGRlbkxheW91dC5pc1N1YldpbmRvdykge1xuICAgICAgICAgICAgLy8gdGhpcyBmdW5jdGlvbiBhcHBsaWVzIG9ubHkgdG8gdGhlIG1haW4gd2luZG93LCB3ZSBoYXZlIHRvIGNvbW11bmljYXRlIHN1YndpbmRvdyB1cGRhdGVzIGJhY2sgdG8gdGhlIG9yaWdpbmFsIHdpbmRvdyBpbnN0ZWFkXG4gICAgICAgICAgICBoYW5kbGVHb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZSh7XG4gICAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICAgIGN1cnJlbnRDb25maWcsXG4gICAgICAgICAgICAgIGdvbGRlbkxheW91dCxcbiAgICAgICAgICAgICAgbGFzdENvbmZpZyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZUdvbGRlbkxheW91dFN0YXRlQ2hhbmdlSW5TdWJ3aW5kb3coeyBnb2xkZW5MYXlvdXQgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIDIwMFxuICAgICAgKVxuICAgICAgLyoqXG4gICAgICAgKiAgVGhlcmUgaXMgYSBidWcgaW4gZ29sZGVuIGxheW91dCBhcyBmb2xsb3dzOlxuICAgICAgICogIElmIHlvdSBoYXZlIGEgbGF5b3V0IHdpdGggMiBpdGVtcyAoaW5zcGVjdG9yIGFib3ZlIGluc3BlY3RvciBmb3IgaW5zdGFuY2UpLCBjbG9zZSBhbiBpdGVtLCB0aGVuIGNsb3NlIHRoZSBvdGhlcixcbiAgICAgICAqICB0aGUgZmluYWwgc3RhdGUgY2hhbmdlIGV2ZW50IGlzIG5vdCB0cmlnZ2VyZWQgdG8gc2hvdyBjb250ZW50IGFzIFtdIG9yIGVtcHR5LiAgT2RkbHkgZW5vdWdoIGl0IHdvcmtzIGluIG90aGVyIHNjZW5hcmlvcy5cbiAgICAgICAqICBJIGhhdmVuJ3QgZGV0ZXJtaW5lZCBhIHdvcmthcm91bmQgZm9yIHRoaXMsIGJ1dCBpdCdzIG5vdCBib3RoZXJpbmcgdXNlcnMgYXMgZmFyIGFzIEkga25vdyBhdCB0aGUgbW9tZW50LlxuICAgICAgICogIEJhc2ljYWxseSB0aGUgYnVnIGlzIHRoYXQgZW1wdHkgbGF5b3V0cyBhcmVuJ3QgZ3VhcmFudGVlZCB0byBiZSBzYXZlZCwgYnV0IG5vbiBlbXB0eSB3aWxsIGFsd2F5cyBzYXZlIGFwcHJvcHJpYXRlbHkuXG4gICAgICAgKi9cbiAgICAgIGdvbGRlbkxheW91dC5vbignc3RhdGVDaGFuZ2VkJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgaWYgKCFldmVudCkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGx5SW5pdGlhbGl6ZWQgPVxuICAgICAgICAgIGdvbGRlbkxheW91dC5pc0luaXRpYWxpc2VkICYmXG4gICAgICAgICAgIShnb2xkZW5MYXlvdXQ/Lm9wZW5Qb3BvdXRzIGFzIEFycmF5PGFueT4pPy5zb21lKFxuICAgICAgICAgICAgKHBvcG91dDogYW55KSA9PiAhcG9wb3V0LmlzSW5pdGlhbGlzZWRcbiAgICAgICAgICApXG4gICAgICAgIGlmICghZnVsbHlJbml0aWFsaXplZCkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgZ29sZGVuTGF5b3V0LmVtaXQoJ3N0YXRlQ2hhbmdlZCcsICdyZXRyeScpXG4gICAgICAgICAgfSwgMjAwKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb25maWcgPSBnZXRJbnN0YW5jZUNvbmZpZyh7IGdvbGRlbkxheW91dCB9KVxuICAgICAgICAvKipcbiAgICAgICAgICogIEdldCB0aGUgY29uZmlnIGluc3RhbnRseSwgdGhhdCB3YXkgaWYgd2UgbmF2aWdhdGUgYXdheSBhbmQgdGhlIGNvbXBvbmVudCBpcyByZW1vdmVkIGZyb20gdGhlIGRvY3VtZW50IHdlIHN0aWxsIGdldCB0aGUgY29ycmVjdCBjb25maWdcbiAgICAgICAgICogIEhvd2V2ZXIsIGRlbGF5IHRoZSBhY3R1YWwgYXR0ZW1wdCB0byBzYXZlIHRoZSBjb25maWcsIHNvIHdlIGRvbid0IHNhdmUgdG9vIG9mdGVuLlxuICAgICAgICAgKi9cbiAgICAgICAgZGVib3VuY2VkSGFuZGxlR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2Uoe1xuICAgICAgICAgIGN1cnJlbnRDb25maWcsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgc2V0RmluaXNoZWQodHJ1ZSlcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5vZmYoJ3N0YXRlQ2hhbmdlZCcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0XSlcbiAgcmV0dXJuIGZpbmlzaGVkXG59XG5cbi8qKlxuICogIFRoaXMgd2lsbCBhdHRhY2ggb3VyIGN1c3RvbSB0b29sYmFyIHRvIHRoZSBnb2xkZW4gbGF5b3V0IHN0YWNrIGhlYWRlclxuICovXG5jb25zdCB1c2VMaXN0ZW5Ub0dvbGRlbkxheW91dFN0YWNrQ3JlYXRlZCA9ICh7XG4gIGdvbGRlbkxheW91dCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbn0pID0+IHtcbiAgY29uc3QgW2ZpbmlzaGVkLCBzZXRGaW5pc2hlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQpIHtcbiAgICAgIGdvbGRlbkxheW91dC5vbignc3RhY2tDcmVhdGVkJywgaGFuZGxlR29sZGVuTGF5b3V0U3RhY2tDcmVhdGVkKVxuICAgICAgc2V0RmluaXNoZWQodHJ1ZSlcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5vZmYoJ3N0YWNrQ3JlYXRlZCcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0XSlcbiAgcmV0dXJuIGZpbmlzaGVkXG59XG5cbnR5cGUgcG9wdXBIYW5kbGluZ1N0YXRlVHlwZSA9ICdhbGxvd2VkJyB8ICdibG9ja2VkJyB8ICdwcm9jZWVkJ1xuXG5jb25zdCB1c2VJbml0R29sZGVuTGF5b3V0ID0gKHtcbiAgZGVwZW5kZW5jaWVzLFxuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIGRlcGVuZGVuY2llczogQXJyYXk8Ym9vbGVhbj5cbiAgZ29sZGVuTGF5b3V0OiBhbnlcbn0pID0+IHtcbiAgY29uc3QgW2ZpbmlzaGVkLCBzZXRGaW5pc2hlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3BvcHVwSGFuZGxpbmdTdGF0ZSwgc2V0UG9wdXBIYW5kbGluZ1N0YXRlXSA9XG4gICAgUmVhY3QudXNlU3RhdGU8cG9wdXBIYW5kbGluZ1N0YXRlVHlwZT4oJ2FsbG93ZWQnKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRlcGVuZGVuY2llcy5ldmVyeSgoZGVwZW5kZW5jeSkgPT4gZGVwZW5kZW5jeSkpIHtcbiAgICAgIGlmIChnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cgJiYgd2luZG93Lm9wZW5lciA9PT0gbnVsbCkge1xuICAgICAgICBzZXRFcnJvcih0cnVlKVxuICAgICAgfVxuICAgICAgY29uc3Qgb25Jbml0ID0gKCkgPT4ge1xuICAgICAgICBzZXRGaW5pc2hlZCh0cnVlKVxuICAgICAgfVxuICAgICAgZ29sZGVuTGF5b3V0Lm9uKCdpbml0aWFsaXNlZCcsIG9uSW5pdClcbiAgICAgIGlmIChnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cpIHtcbiAgICAgICAgLy8gZm9yIHNvbWUgcmVhc29uIHN1YndpbmRvdyBzdGFja3MgbG9zZSBkaW1lbnNpb25zLCBzcGVjaWZpY2FsbHkgdGhlIGhlYWRlciBoZWlnaHQgKHNlZSBfY3JlYXRlQ29uZmlnIGluIGdvbGRlbiBsYXlvdXQgc291cmNlIGNvZGUpXG4gICAgICAgIGdvbGRlbkxheW91dC5jb25maWcuZGltZW5zaW9ucyA9IGdldEdvbGRlbkxheW91dFNldHRpbmdzKCkuZGltZW5zaW9uc1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgZ29sZGVuTGF5b3V0LmluaXQoKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS50eXBlID09PSAncG9wb3V0QmxvY2tlZCcpIHtcbiAgICAgICAgICBzZXRQb3B1cEhhbmRsaW5nU3RhdGUoJ2Jsb2NrZWQnKVxuICAgICAgICAgIGdvbGRlbkxheW91dC5vcGVuUG9wb3V0cz8uZm9yRWFjaCgocG9wb3V0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIHBvcG91dC5jbG9zZSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnb2xkZW5MYXlvdXQub2ZmKCdpbml0aWFsaXNlZCcsIG9uSW5pdClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFsuLi5kZXBlbmRlbmNpZXMsIHBvcHVwSGFuZGxpbmdTdGF0ZV0pXG4gIHJldHVybiB7XG4gICAgZmluaXNoZWQsXG4gICAgZXJyb3IsXG4gICAgc2V0UG9wdXBIYW5kbGluZ1N0YXRlLFxuICAgIHBvcHVwSGFuZGxpbmdTdGF0ZSxcbiAgfVxufVxuXG5jb25zdCBIYW5kbGVQb3BvdXRzQmxvY2tlZCA9ICh7XG4gIHNldFBvcHVwSGFuZGxpbmdTdGF0ZSxcbiAgZ29sZGVuTGF5b3V0LFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBzZXRQb3B1cEhhbmRsaW5nU3RhdGU6IFJlYWN0LkRpc3BhdGNoPHBvcHVwSGFuZGxpbmdTdGF0ZVR5cGU+XG59KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPERpYWxvZyBvcGVuPXt0cnVlfT5cbiAgICAgIDxEaWFsb2dUaXRsZT5WaXN1YWxpemF0aW9uIHBvcHVwcyBibG9ja2VkPC9EaWFsb2dUaXRsZT5cbiAgICAgIDxEaWFsb2dDb250ZW50PlxuICAgICAgICBQbGVhc2UgYWxsb3cgcG9wdXBzIGZvciB0aGlzIHNpdGUsIHRoZW4gY2xpY2sgdGhlIGJ1dHRvbiBiZWxvdyB0byByZXRyeVxuICAgICAgICBsb2FkaW5nIHlvdXIgdmlzdWFsaXphdGlvbiBsYXlvdXQuXG4gICAgICA8L0RpYWxvZ0NvbnRlbnQ+XG4gICAgICA8RGlhbG9nQWN0aW9ucz5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGNvbG9yPVwiZXJyb3JcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGdvbGRlbkxheW91dC5jb25maWcub3BlblBvcG91dHMgPSBbXVxuICAgICAgICAgICAgc2V0UG9wdXBIYW5kbGluZ1N0YXRlKCdwcm9jZWVkJylcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgUHJvY2VlZCB3aXRob3V0IHBvcHVwc1xuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgLy8gdHJ5IG9wZW5pbmcgdHdvIHdpbmRvd3MsIGFzIG9uZSBpcyBhbGxvd2VkIHNpbmNlIHRoZSB1c2VyIGludGVyYWN0cyB3aXRoIHRoZSBidXR0b25cbiAgICAgICAgICAgIGNvbnN0IHdpbmRvdzEgPSB3aW5kb3cub3BlbignJywgJ19ibGFuaycpXG4gICAgICAgICAgICBjb25zdCB3aW5kb3cyID0gd2luZG93Lm9wZW4oJycsICdfYmxhbmsnKVxuICAgICAgICAgICAgaWYgKHdpbmRvdzEgJiYgd2luZG93Mikge1xuICAgICAgICAgICAgICBzZXRQb3B1cEhhbmRsaW5nU3RhdGUoJ2FsbG93ZWQnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93MT8uY2xvc2UoKVxuICAgICAgICAgICAgd2luZG93Mj8uY2xvc2UoKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBSZXRyeVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvRGlhbG9nQWN0aW9ucz5cbiAgICA8L0RpYWxvZz5cbiAgKVxufVxuXG5leHBvcnQgY29uc3QgR29sZGVuTGF5b3V0Vmlld1JlYWN0ID0gKG9wdGlvbnM6IEdvbGRlbkxheW91dFZpZXdQcm9wcykgPT4ge1xuICBjb25zdCBbZ29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudCwgc2V0R29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2dvbGRlbkxheW91dCwgc2V0R29sZGVuTGF5b3V0XSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcbiAgY29uc3QgbGFzdENvbmZpZyA9IFJlYWN0LnVzZVJlZjxhbnk+KGdldEdvbGRlbkxheW91dENvbmZpZyhvcHRpb25zKSlcbiAgdXNlVXBkYXRlR29sZGVuTGF5b3V0U2l6ZSh7IHdyZXFyLCBnb2xkZW5MYXlvdXQgfSlcbiAgdXNlU2VuZEdvbGRlbkxheW91dFJlZmVyZW5jZVVwd2FyZHMoeyBvcHRpb25zLCBnb2xkZW5MYXlvdXQgfSlcbiAgdXNlQXR0YWNoR29sZGVuTGF5b3V0KHsgZ29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudCwgc2V0R29sZGVuTGF5b3V0LCBvcHRpb25zIH0pXG4gIGNvbnN0IGdvbGRlbkxheW91dENvbXBvbmVudHNSZWdpc3RlcmVkID0gdXNlUmVnaXN0ZXJHb2xkZW5MYXlvdXRDb21wb25lbnRzKHtcbiAgICBvcHRpb25zLFxuICAgIGdvbGRlbkxheW91dCxcbiAgfSlcbiAgY29uc3QgbGlzdGVuaW5nVG9Hb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZXMgPVxuICAgIHVzZUxpc3RlblRvR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2VzKHsgb3B0aW9ucywgZ29sZGVuTGF5b3V0LCBsYXN0Q29uZmlnIH0pXG4gIGNvbnN0IGxpc3RlbmluZ1RvR29sZGVuTGF5b3V0U3RhY2tDcmVhdGVkID1cbiAgICB1c2VMaXN0ZW5Ub0dvbGRlbkxheW91dFN0YWNrQ3JlYXRlZCh7IGdvbGRlbkxheW91dCB9KVxuXG4gIGNvbnN0IHsgZmluaXNoZWQsIGVycm9yLCBzZXRQb3B1cEhhbmRsaW5nU3RhdGUsIHBvcHVwSGFuZGxpbmdTdGF0ZSB9ID1cbiAgICB1c2VJbml0R29sZGVuTGF5b3V0KHtcbiAgICAgIGRlcGVuZGVuY2llczogW1xuICAgICAgICBnb2xkZW5MYXlvdXRDb21wb25lbnRzUmVnaXN0ZXJlZCxcbiAgICAgICAgbGlzdGVuaW5nVG9Hb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZXMsXG4gICAgICAgIGxpc3RlbmluZ1RvR29sZGVuTGF5b3V0U3RhY2tDcmVhdGVkLFxuICAgICAgXSxcbiAgICAgIGdvbGRlbkxheW91dCxcbiAgICB9KVxuXG4gIHVzZUNyb3NzV2luZG93R29sZGVuTGF5b3V0Q29tbXVuaWNhdGlvbih7XG4gICAgZ29sZGVuTGF5b3V0LFxuICAgIGlzSW5pdGlhbGl6ZWQ6ICFlcnJvciAmJiBmaW5pc2hlZCxcbiAgICBvcHRpb25zLFxuICB9KVxuXG4gIHVzZVZlcmlmeU1hcEV4aXN0c1doZW5EcmF3aW5nKHtcbiAgICBnb2xkZW5MYXlvdXQsXG4gICAgaXNJbml0aWFsaXplZDogIWVycm9yICYmIGZpbmlzaGVkLFxuICB9KVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBkYXRhLWVsZW1lbnQ9XCJnb2xkZW4tbGF5b3V0XCIgY2xhc3NOYW1lPVwiaXMtbWluaW1pc2VkIGgtZnVsbCB3LWZ1bGxcIj5cbiAgICAgIHtwb3B1cEhhbmRsaW5nU3RhdGUgPT09ICdibG9ja2VkJyA/IChcbiAgICAgICAgPEhhbmRsZVBvcG91dHNCbG9ja2VkXG4gICAgICAgICAgZ29sZGVuTGF5b3V0PXtnb2xkZW5MYXlvdXR9XG4gICAgICAgICAgc2V0UG9wdXBIYW5kbGluZ1N0YXRlPXtzZXRQb3B1cEhhbmRsaW5nU3RhdGV9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtzZXRHb2xkZW5MYXlvdXRBdHRhY2hFbGVtZW50fVxuICAgICAgICBjbGFzc05hbWU9XCJnb2xkZW4tbGF5b3V0LWNvbnRhaW5lciB3LWZ1bGwgaC1mdWxsXCJcbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgR29sZGVuTGF5b3V0Vmlld1JlYWN0XG4iXX0=