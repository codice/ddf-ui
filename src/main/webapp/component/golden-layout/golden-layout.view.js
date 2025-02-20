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
    return (_jsx(ExtensionPoints.providers, { children: _jsxs(VisualSettingsProvider, { container: container, goldenLayout: goldenLayout, children: [_jsx(UseSubwindowConsumeNavigationChange, { goldenLayout: goldenLayout }), _jsx(UseMissingParentWindow, { goldenLayout: goldenLayout }), _jsx(Paper, { elevation: Elevations.panels, className: "w-full h-full ".concat(isMinimized ? 'hidden' : ''), square: true, children: _jsx(ComponentView, { selectionInterface: options.selectionInterface, componentState: normalizedComponentState }) })] }) }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC52aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQzdDLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQTtBQUd2QyxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEMsT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFBO0FBQ3hDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sZUFBZSxNQUFNLHlDQUF5QyxDQUFBO0FBQ3JFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUVoRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDcEUsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQzNDLE9BQU8sRUFDTCxNQUFNLEVBQ04sYUFBYSxFQUNiLGFBQWEsRUFDYixXQUFXLEdBQ1osTUFBTSxlQUFlLENBQUE7QUFDdEIsT0FBTyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUMvRCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUM5RCxPQUFPLEVBQ0wsbUNBQW1DLEVBQ25DLHVDQUF1QyxFQUN2QyxxQ0FBcUMsR0FDdEMsTUFBTSw4QkFB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SCxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQ1IsY0FDRSxHQUFHLEVBQUUsNEJBQTRCLEVBQ2pDLFNBQVMsRUFBQyx1Q0FBdUMsR0FDakQsSUFDRSxDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLHFCQUFxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGNyZWF0ZVJvb3QgfSBmcm9tICdyZWFjdC1kb20vY2xpZW50J1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBfZGVib3VuY2UgZnJvbSAnbG9kYXNoL2RlYm91bmNlJ1xuaW1wb3J0IF9jbG9uZURlZXAgZnJvbSAnbG9kYXNoLmNsb25lZGVlcCdcbmltcG9ydCBfaXNFcXVhbFdpdGggZnJvbSAnbG9kYXNoLmlzZXF1YWx3aXRoJ1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IEdvbGRlbkxheW91dCBmcm9tICdnb2xkZW4tbGF5b3V0J1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vZXh0ZW5zaW9uLXBvaW50cy9leHRlbnNpb24tcG9pbnRzJ1xuaW1wb3J0IHsgVmlzdWFsaXphdGlvbnMgfSBmcm9tICcuLi92aXN1YWxpemF0aW9uL3Zpc3VhbGl6YXRpb25zJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcbmltcG9ydCB7XG4gIERpYWxvZyxcbiAgRGlhbG9nQWN0aW9ucyxcbiAgRGlhbG9nQ29udGVudCxcbiAgRGlhbG9nVGl0bGUsXG59IGZyb20gJ0BtdWkvbWF0ZXJpYWwnXG5pbXBvcnQgeyBTdGFja1Rvb2xiYXIsIE1pbmltaXplZEhlaWdodCB9IGZyb20gJy4vc3RhY2stdG9vbGJhcidcbmltcG9ydCB7IEdvbGRlbkxheW91dENvbXBvbmVudEhlYWRlciB9IGZyb20gJy4vdmlzdWFsLXRvb2xiYXInXG5pbXBvcnQge1xuICBVc2VTdWJ3aW5kb3dDb25zdW1lTmF2aWdhdGlvbkNoYW5nZSxcbiAgdXNlQ3Jvc3NXaW5kb3dHb2xkZW5MYXlvdXRDb21tdW5pY2F0aW9uLFxuICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLFxufSBmcm9tICcuL2Nyb3NzLXdpbmRvdy1jb21tdW5pY2F0aW9uJ1xuaW1wb3J0IHsgdXNlVmVyaWZ5TWFwRXhpc3RzV2hlbkRyYXdpbmcgfSBmcm9tICcuL3ZlcmlmeS1tYXAnXG5pbXBvcnQgeyBWaXN1YWxTZXR0aW5nc1Byb3ZpZGVyIH0gZnJvbSAnLi92aXN1YWwtc2V0dGluZ3MucHJvdmlkZXInXG5pbXBvcnQgeyBnZXRJbnN0YW5jZUNvbmZpZyB9IGZyb20gJy4vZ29sZGVuLWxheW91dC5sYXlvdXQtY29uZmlnLWhhbmRsaW5nJ1xuaW1wb3J0IHsgZ2V0R29sZGVuTGF5b3V0Q29uZmlnIH0gZnJvbSAnLi9nb2xkZW4tbGF5b3V0LmxheW91dC1jb25maWctaGFuZGxpbmcnXG5pbXBvcnQgeyBoYW5kbGVHb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZSB9IGZyb20gJy4vZ29sZGVuLWxheW91dC5sYXlvdXQtY29uZmlnLWhhbmRsaW5nJ1xuaW1wb3J0IHsgZ2V0R29sZGVuTGF5b3V0U2V0dGluZ3MgfSBmcm9tICcuL2dvbGRlbi1sYXlvdXQubGF5b3V0LWNvbmZpZy1oYW5kbGluZydcblxuLyoqXG4gKiAgRm9yIHNvbWUgcmVhc29uIGdvbGRlbiBsYXlvdXQgcmVtb3ZlcyBjb25maWdzIGZyb20gbG9jYWwgc3RvcmFnZSB1cG9uIGZpcnN0IGxvYWQgb2YgcG9wb3V0IHdpbmRvdywgd2hpY2ggbWVhbnMgcmVmcmVzaGluZyBkb2Vzbid0IHdvcmsuXG4gKiAgVGhpcyBwcmV2ZW50cyB0aGlzIGxpbmUgZnJvbSBkb2luZyBzbzogaHR0cHM6Ly9naXRodWIuY29tL2dvbGRlbi1sYXlvdXQvZ29sZGVuLWxheW91dC9ibG9iL3YxLjUuOS9zcmMvanMvTGF5b3V0TWFuYWdlci5qcyNMNzk3XG4gKi9cbmltcG9ydCB7IGdldERlZmF1bHRDb21wb25lbnRTdGF0ZSB9IGZyb20gJy4uL3Zpc3VhbGl6YXRpb24vc2V0dGluZ3MtaGVscGVycydcbmltcG9ydCB7IENvbXBvbmVudE5hbWVUeXBlIH0gZnJvbSAnLi9nb2xkZW4tbGF5b3V0LnR5cGVzJ1xuOyhmdW5jdGlvbiBwcmV2ZW50UmVtb3ZhbEZyb21TdG9yYWdlKCkge1xuICBjb25zdCBub3JtYWxSZW1vdmVJdGVtID0gd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtXG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSA9IChrZXk6IHN0cmluZykgPT4ge1xuICAgIGlmIChrZXkuaW5jbHVkZXMoJ2dsLXdpbmRvdycpKSB7XG4gICAgICByZXR1cm5cbiAgICB9IGVsc2Uge1xuICAgICAgbm9ybWFsUmVtb3ZlSXRlbShrZXkpXG4gICAgfVxuICB9XG59KSgpXG5cbi8qKlxuICogIFdlIGF0dGFjaCB0aGlzIGF0IHRoZSBjb21wb25lbnQgbGV2ZWwgZHVlIHRvIGhvdyBwb3BvdXRzIHdvcmsuXG4gKiAgRXNzZW50aWFsbHkgZ29sZGVuIGxheW91dCBkaXNjb25uZWN0cyB1cyBmcm9tIFJlYWN0IGFuZCBvdXIgcHJvdmlkZXJzIGluIHBvcG91dHMgdG8gZnVsbHNjcmVlbiB2aXN1YWxzLFxuICogIHNvIHdlIGNhbid0IHVzZSBEaWFsb2cgZnVydGhlciB1cCB0aGUgdHJlZS5cbiAqL1xuY29uc3QgVXNlTWlzc2luZ1BhcmVudFdpbmRvdyA9ICh7IGdvbGRlbkxheW91dCB9OiB7IGdvbGRlbkxheW91dDogYW55IH0pID0+IHtcbiAgY29uc3QgW21pc3NpbmdXaW5kb3csIHNldE1pc3NpbmdXaW5kb3ddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCAmJiBnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cgJiYgd2luZG93Lm9wZW5lciA9PT0gbnVsbCkge1xuICAgICAgc2V0TWlzc2luZ1dpbmRvdyh0cnVlKVxuICAgIH1cbiAgfSwgW2dvbGRlbkxheW91dF0pXG5cbiAgaWYgKG1pc3NpbmdXaW5kb3cpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPERpYWxvZyBvcGVuPXt0cnVlfSBjbGFzc05hbWU9XCIgei1bMTAwMDAwMF1cIj5cbiAgICAgICAgPERpYWxvZ1RpdGxlPkNvdWxkIG5vdCBmaW5kIHBhcmVudCB2aXN1YWxpemF0aW9uPC9EaWFsb2dUaXRsZT5cbiAgICAgICAgPERpYWxvZ0NvbnRlbnQ+UGxlYXNlIGNsb3NlIHRoZSB3aW5kb3cuPC9EaWFsb2dDb250ZW50PlxuICAgICAgICA8RGlhbG9nQWN0aW9ucz5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgd2luZG93LmNsb3NlKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIENsb3NlIFdpbmRvd1xuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0RpYWxvZ0FjdGlvbnM+XG4gICAgICA8L0RpYWxvZz5cbiAgICApXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuY29uc3QgR29sZGVuTGF5b3V0Q29tcG9uZW50ID0gKHtcbiAgQ29tcG9uZW50VmlldyxcbiAgb3B0aW9ucyxcbiAgY29udGFpbmVyLFxuICBnb2xkZW5MYXlvdXQsXG4gIGNvbXBvbmVudFN0YXRlLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBvcHRpb25zOiBhbnlcbiAgQ29tcG9uZW50VmlldzogYW55XG4gIGNvbnRhaW5lcjogR29sZGVuTGF5b3V0LkNvbnRhaW5lclxuICBjb21wb25lbnRTdGF0ZToge1xuICAgIGNvbXBvbmVudE5hbWU6IENvbXBvbmVudE5hbWVUeXBlXG4gIH1cbn0pID0+IHtcbiAgY29uc3QgeyBoZWlnaHQgfSA9IHVzZUNvbnRhaW5lclNpemUoY29udGFpbmVyKVxuICBjb25zdCBpc01pbmltaXplZCA9IGhlaWdodCAmJiBoZWlnaHQgPD0gTWluaW1pemVkSGVpZ2h0XG4gIGNvbnN0IG5vcm1hbGl6ZWRDb21wb25lbnRTdGF0ZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5nZXREZWZhdWx0Q29tcG9uZW50U3RhdGUoY29tcG9uZW50U3RhdGUuY29tcG9uZW50TmFtZSksXG4gICAgICBjb21wb25lbnRTdGF0ZSxcbiAgICB9XG4gIH0sIFtjb21wb25lbnRTdGF0ZV0pXG5cbiAgcmV0dXJuIChcbiAgICA8RXh0ZW5zaW9uUG9pbnRzLnByb3ZpZGVycz5cbiAgICAgIDxWaXN1YWxTZXR0aW5nc1Byb3ZpZGVyIGNvbnRhaW5lcj17Y29udGFpbmVyfSBnb2xkZW5MYXlvdXQ9e2dvbGRlbkxheW91dH0+XG4gICAgICAgIDxVc2VTdWJ3aW5kb3dDb25zdW1lTmF2aWdhdGlvbkNoYW5nZSBnb2xkZW5MYXlvdXQ9e2dvbGRlbkxheW91dH0gLz5cbiAgICAgICAgPFVzZU1pc3NpbmdQYXJlbnRXaW5kb3cgZ29sZGVuTGF5b3V0PXtnb2xkZW5MYXlvdXR9IC8+XG4gICAgICAgIDxQYXBlclxuICAgICAgICAgIGVsZXZhdGlvbj17RWxldmF0aW9ucy5wYW5lbHN9XG4gICAgICAgICAgY2xhc3NOYW1lPXtgdy1mdWxsIGgtZnVsbCAke2lzTWluaW1pemVkID8gJ2hpZGRlbicgOiAnJ31gfVxuICAgICAgICAgIHNxdWFyZVxuICAgICAgICA+XG4gICAgICAgICAgPENvbXBvbmVudFZpZXdcbiAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZT17b3B0aW9ucy5zZWxlY3Rpb25JbnRlcmZhY2V9XG4gICAgICAgICAgICBjb21wb25lbnRTdGF0ZT17bm9ybWFsaXplZENvbXBvbmVudFN0YXRlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvUGFwZXI+XG4gICAgICA8L1Zpc3VhbFNldHRpbmdzUHJvdmlkZXI+XG4gICAgPC9FeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICApXG59XG4vLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2RlZXBzdHJlYW1JTy9nb2xkZW4tbGF5b3V0L2lzc3Vlcy8yMzkgZm9yIGRldGFpbHMgb24gd2h5IHRoZSBzZXRUaW1lb3V0IGlzIG5lY2Vzc2FyeVxuLy8gVGhlIHNob3J0IGFuc3dlciBpcyBpdCBtb3N0bHkgaGFzIHRvIGRvIHdpdGggbWFraW5nIHN1cmUgdGhlc2UgQ29tcG9uZW50Vmlld3MgYXJlIGFibGUgdG8gZnVuY3Rpb24gbm9ybWFsbHkgKHNldCB1cCBldmVudHMsIGV0Yy4pXG5mdW5jdGlvbiByZWdpc3RlckNvbXBvbmVudChcbiAgbWFyaW9uZXR0ZVZpZXc6IHsgZ29sZGVuTGF5b3V0OiBhbnk7IG9wdGlvbnM6IGFueSB9LFxuICBuYW1lOiBhbnksXG4gIENvbXBvbmVudFZpZXc6IGFueSxcbiAgY29tcG9uZW50T3B0aW9uczogYW55LFxuICB2aXo6IGFueVxuKSB7XG4gIGNvbnN0IG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgbWFyaW9uZXR0ZVZpZXcub3B0aW9ucywgY29tcG9uZW50T3B0aW9ucylcbiAgbWFyaW9uZXR0ZVZpZXcuZ29sZGVuTGF5b3V0LnJlZ2lzdGVyQ29tcG9uZW50KFxuICAgIG5hbWUsXG4gICAgKGNvbnRhaW5lcjogYW55LCBjb21wb25lbnRTdGF0ZTogYW55KSA9PiB7XG4gICAgICBjb250YWluZXIub24oJ29wZW4nLCAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJvb3QgPSBjcmVhdGVSb290KGNvbnRhaW5lci5nZXRFbGVtZW50KClbMF0pXG4gICAgICAgICAgcm9vdC5yZW5kZXIoXG4gICAgICAgICAgICA8R29sZGVuTGF5b3V0Q29tcG9uZW50XG4gICAgICAgICAgICAgIGdvbGRlbkxheW91dD17bWFyaW9uZXR0ZVZpZXcuZ29sZGVuTGF5b3V0fVxuICAgICAgICAgICAgICBvcHRpb25zPXtvcHRpb25zfVxuICAgICAgICAgICAgICBDb21wb25lbnRWaWV3PXtDb21wb25lbnRWaWV3fVxuICAgICAgICAgICAgICBjb250YWluZXI9e2NvbnRhaW5lcn1cbiAgICAgICAgICAgICAgY29tcG9uZW50U3RhdGU9e2NvbXBvbmVudFN0YXRlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApXG4gICAgICAgICAgY29udGFpbmVyLm9uKCdkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgcm9vdC51bm1vdW50KClcbiAgICAgICAgICB9KVxuICAgICAgICB9LCAwKVxuICAgICAgfSlcbiAgICAgIGNvbnRhaW5lci5vbigndGFiJywgKHRhYjogYW55KSA9PiB7XG4gICAgICAgIHRhYi5jbG9zZUVsZW1lbnQub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGFiLmhlYWRlci5wYXJlbnQuaXNNYXhpbWlzZWQgJiZcbiAgICAgICAgICAgIHRhYi5oZWFkZXIucGFyZW50LmNvbnRlbnRJdGVtcy5sZW5ndGggPT09IDFcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRhYi5oZWFkZXIucGFyZW50LnRvZ2dsZU1heGltaXNlKClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFiLl9vbkNsb3NlQ2xpY2tGbihldmVudClcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIHRhYi5lbGVtZW50LmFwcGVuZChyb290KVxuICAgICAgICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVuZGVyUm9vdCA9IGNyZWF0ZVJvb3QodGFiLmVsZW1lbnRbMF0pXG4gICAgICAgICAgICByZW5kZXJSb290LnJlbmRlcihcbiAgICAgICAgICAgICAgPEdvbGRlbkxheW91dENvbXBvbmVudEhlYWRlclxuICAgICAgICAgICAgICAgIHZpej17dml6fVxuICAgICAgICAgICAgICAgIHRhYj17dGFifVxuICAgICAgICAgICAgICAgIG9wdGlvbnM9e29wdGlvbnN9XG4gICAgICAgICAgICAgICAgY29tcG9uZW50U3RhdGU9e2NvbXBvbmVudFN0YXRlfVxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcj17Y29udGFpbmVyfVxuICAgICAgICAgICAgICAgIG5hbWU9e25hbWV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgICB0YWIuaGVhZGVyLm9uKCdkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZW5kZXJSb290LnVubW91bnQoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgICAgIH0sIDEwMClcbiAgICAgIH0pXG4gICAgfVxuICApXG59XG5leHBvcnQgdHlwZSBHb2xkZW5MYXlvdXRWaWV3UHJvcHMgPSB7XG4gIGxheW91dFJlc3VsdD86IExhenlRdWVyeVJlc3VsdFsncGxhaW4nXVxuICBlZGl0TGF5b3V0UmVmPzogUmVhY3QuTXV0YWJsZVJlZk9iamVjdDxhbnk+XG4gIGNvbmZpZ05hbWU/OiBzdHJpbmdcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgc2V0R29sZGVuTGF5b3V0OiAoaW5zdGFuY2U6IGFueSkgPT4gdm9pZFxufVxuXG5mdW5jdGlvbiByZWdpc3RlckdvbGRlbkxheW91dENvbXBvbmVudHMoe1xuICBnb2xkZW5MYXlvdXQsXG4gIG9wdGlvbnMsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG4gIG9wdGlvbnM6IEdvbGRlbkxheW91dFZpZXdQcm9wc1xufSkge1xuICBWaXN1YWxpemF0aW9ucy5mb3JFYWNoKCh2aXopID0+IHtcbiAgICB0cnkge1xuICAgICAgcmVnaXN0ZXJDb21wb25lbnQoXG4gICAgICAgIHsgZ29sZGVuTGF5b3V0LCBvcHRpb25zIH0sXG4gICAgICAgIHZpei5pZCxcbiAgICAgICAgdml6LnZpZXcsXG4gICAgICAgIHZpei5vcHRpb25zLFxuICAgICAgICB2aXpcbiAgICAgIClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIGxpa2VseSBhbHJlYWR5IHJlZ2lzdGVyZWQsIGluIGRldlxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gaGFuZGxlR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2VJblN1YndpbmRvdyh7XG4gIGdvbGRlbkxheW91dCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbn0pIHtcbiAgLy8gc2hvdWxkbid0IG5lZWQgdG8gc2VuZCBhbnl0aGluZywgYXMgdGhlIG1haW4gd2luZG93IGNhbiBkZXRlcm1pbmUgdGhlIGNvbmZpZyBmcm9tIHRoZSBzdWJ3aW5kb3dcbiAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLmVtaXQoXG4gICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lU3Vid2luZG93TGF5b3V0Q2hhbmdlLFxuICAgIG51bGxcbiAgKVxufVxuXG4vKipcbiAqICBSZXBsYWNlIHRoZSB0b29sYmFyIHdpdGggb3VyIG93blxuICovXG5mdW5jdGlvbiBoYW5kbGVHb2xkZW5MYXlvdXRTdGFja0NyZWF0ZWQoc3RhY2s6IGFueSkge1xuICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVuZGVyUm9vdCA9IGNyZWF0ZVJvb3Qoc3RhY2suaGVhZGVyLmNvbnRyb2xzQ29udGFpbmVyWzBdKVxuICAgICAgcmVuZGVyUm9vdC5yZW5kZXIoPFN0YWNrVG9vbGJhciBzdGFjaz17c3RhY2t9IC8+KVxuICAgICAgc3RhY2sub24oJ2FjdGl2ZUNvbnRlbnRJdGVtQ2hhbmdlZCcsIGZ1bmN0aW9uIChjb250ZW50SXRlbTogYW55KSB7XG4gICAgICAgIHdyZXFyLnZlbnQudHJpZ2dlcignYWN0aXZlQ29udGVudEl0ZW1DaGFuZ2VkJywgY29udGVudEl0ZW0pXG4gICAgICB9KVxuICAgICAgc3RhY2sub24oJ2Rlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIHJlbmRlclJvb3QudW5tb3VudCgpXG4gICAgICB9KVxuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgIH0gY2F0Y2ggKGVycikge31cbiAgfSwgMTAwKVxufVxuXG5mdW5jdGlvbiB1c2VDb250YWluZXJTaXplKGNvbnRhaW5lcjogR29sZGVuTGF5b3V0LkNvbnRhaW5lcikge1xuICBjb25zdCBbd2lkdGgsIHNldFdpZHRoXSA9IFJlYWN0LnVzZVN0YXRlPG51bWJlciB8IHVuZGVmaW5lZD4oY29udGFpbmVyLndpZHRoKVxuICBjb25zdCBbaGVpZ2h0LCBzZXRIZWlnaHRdID0gUmVhY3QudXNlU3RhdGU8bnVtYmVyIHwgdW5kZWZpbmVkPihcbiAgICBjb250YWluZXIuaGVpZ2h0XG4gIClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgIGNvbnN0IHJlc2l6ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICBzZXRXaWR0aChjb250YWluZXIud2lkdGgpXG4gICAgICAgIHNldEhlaWdodChjb250YWluZXIuaGVpZ2h0KVxuICAgICAgfVxuICAgICAgY29udGFpbmVyLm9uKCdyZXNpemUnLCByZXNpemVDYWxsYmFjaylcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnRhaW5lci5vZmYoJ3Jlc2l6ZScsIHJlc2l6ZUNhbGxiYWNrKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2NvbnRhaW5lcl0pXG4gIHJldHVybiB7IGhlaWdodCwgd2lkdGggfVxufVxuXG5jb25zdCB1c2VVcGRhdGVHb2xkZW5MYXlvdXRTaXplID0gKHtcbiAgd3JlcXIsXG4gIGdvbGRlbkxheW91dCxcbn06IHtcbiAgd3JlcXI6IGFueVxuICBnb2xkZW5MYXlvdXQ6IGFueVxufSkgPT4ge1xuICB1c2VMaXN0ZW5Ubygod3JlcXIgYXMgYW55KS52ZW50LCAnZ2wtdXBkYXRlU2l6ZScsICgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0ICYmIGdvbGRlbkxheW91dC5pc0luaXRpYWxpc2VkKSBnb2xkZW5MYXlvdXQudXBkYXRlU2l6ZSgpXG4gIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCkge1xuICAgICAgY29uc3QgcmFuZG9tU3RyaW5nID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygpXG4gICAgICAkKHdpbmRvdykub24oXG4gICAgICAgICdyZXNpemUuJyArIHJhbmRvbVN0cmluZyxcbiAgICAgICAgX2RlYm91bmNlKFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGlmIChnb2xkZW5MYXlvdXQuaXNJbml0aWFsaXNlZCkgZ29sZGVuTGF5b3V0LnVwZGF0ZVNpemUoKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgMTAwLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxlYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgdHJhaWxpbmc6IHRydWUsXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICApXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuJyArIHJhbmRvbVN0cmluZylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtnb2xkZW5MYXlvdXRdKVxufVxuXG5jb25zdCB1c2VTZW5kR29sZGVuTGF5b3V0UmVmZXJlbmNlVXB3YXJkcyA9ICh7XG4gIG9wdGlvbnMsXG4gIGdvbGRlbkxheW91dCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgb3B0aW9uczogR29sZGVuTGF5b3V0Vmlld1Byb3BzXG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCkge1xuICAgICAgb3B0aW9ucy5zZXRHb2xkZW5MYXlvdXQoZ29sZGVuTGF5b3V0KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGdvbGRlbkxheW91dCkge1xuICAgICAgICBnb2xkZW5MYXlvdXQuZGVzdHJveSgpXG4gICAgICB9XG4gICAgfVxuICB9LCBbZ29sZGVuTGF5b3V0XSlcbn1cblxuY29uc3QgdXNlQXR0YWNoR29sZGVuTGF5b3V0ID0gKHtcbiAgZ29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudCxcbiAgc2V0R29sZGVuTGF5b3V0LFxuICBvcHRpb25zLFxufToge1xuICBvcHRpb25zOiBHb2xkZW5MYXlvdXRWaWV3UHJvcHNcbiAgc2V0R29sZGVuTGF5b3V0OiBSZWFjdC5EaXNwYXRjaDxhbnk+XG4gIGdvbGRlbkxheW91dEF0dGFjaEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXRBdHRhY2hFbGVtZW50KSB7XG4gICAgICBzZXRHb2xkZW5MYXlvdXQoXG4gICAgICAgIG5ldyBHb2xkZW5MYXlvdXQoXG4gICAgICAgICAgZ2V0R29sZGVuTGF5b3V0Q29uZmlnKG9wdGlvbnMpLFxuICAgICAgICAgIGdvbGRlbkxheW91dEF0dGFjaEVsZW1lbnRcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgfSwgW2dvbGRlbkxheW91dEF0dGFjaEVsZW1lbnRdKVxufVxuXG5jb25zdCB1c2VSZWdpc3RlckdvbGRlbkxheW91dENvbXBvbmVudHMgPSAoe1xuICBvcHRpb25zLFxuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIG9wdGlvbnM6IEdvbGRlbkxheW91dFZpZXdQcm9wc1xuICBnb2xkZW5MYXlvdXQ6IGFueVxufSkgPT4ge1xuICBjb25zdCBbZmluaXNoZWQsIHNldEZpbmlzaGVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQpIHtcbiAgICAgIHJlZ2lzdGVyR29sZGVuTGF5b3V0Q29tcG9uZW50cyh7XG4gICAgICAgIGdvbGRlbkxheW91dCxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBzZXRGaW5pc2hlZCh0cnVlKVxuICAgIH1cbiAgfSwgW2dvbGRlbkxheW91dF0pXG4gIHJldHVybiBmaW5pc2hlZFxufVxuXG5jb25zdCB1c2VMaXN0ZW5Ub0dvbGRlbkxheW91dFN0YXRlQ2hhbmdlcyA9ICh7XG4gIG9wdGlvbnMsXG4gIGdvbGRlbkxheW91dCxcbiAgbGFzdENvbmZpZyxcbn06IHtcbiAgb3B0aW9uczogR29sZGVuTGF5b3V0Vmlld1Byb3BzXG4gIGdvbGRlbkxheW91dDogYW55XG4gIGxhc3RDb25maWc6IFJlYWN0Lk11dGFibGVSZWZPYmplY3Q8YW55PlxufSkgPT4ge1xuICBjb25zdCBbZmluaXNoZWQsIHNldEZpbmlzaGVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCkge1xuICAgICAgY29uc3QgZGVib3VuY2VkSGFuZGxlR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2UgPSBfLmRlYm91bmNlKFxuICAgICAgICAoeyBjdXJyZW50Q29uZmlnIH06IHsgY3VycmVudENvbmZpZzogYW55IH0pID0+IHtcbiAgICAgICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdyZXNpemUnKSAvLyB0cmlnZ2VyIHJlc2l6ZSBvZiB0aGluZ3MgbGlrZSBtYXBcbiAgICAgICAgICBpZiAoIWdvbGRlbkxheW91dC5pc1N1YldpbmRvdykge1xuICAgICAgICAgICAgLy8gdGhpcyBmdW5jdGlvbiBhcHBsaWVzIG9ubHkgdG8gdGhlIG1haW4gd2luZG93LCB3ZSBoYXZlIHRvIGNvbW11bmljYXRlIHN1YndpbmRvdyB1cGRhdGVzIGJhY2sgdG8gdGhlIG9yaWdpbmFsIHdpbmRvdyBpbnN0ZWFkXG4gICAgICAgICAgICBoYW5kbGVHb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZSh7XG4gICAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICAgIGN1cnJlbnRDb25maWcsXG4gICAgICAgICAgICAgIGdvbGRlbkxheW91dCxcbiAgICAgICAgICAgICAgbGFzdENvbmZpZyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZUdvbGRlbkxheW91dFN0YXRlQ2hhbmdlSW5TdWJ3aW5kb3coeyBnb2xkZW5MYXlvdXQgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIDIwMFxuICAgICAgKVxuICAgICAgLyoqXG4gICAgICAgKiAgVGhlcmUgaXMgYSBidWcgaW4gZ29sZGVuIGxheW91dCBhcyBmb2xsb3dzOlxuICAgICAgICogIElmIHlvdSBoYXZlIGEgbGF5b3V0IHdpdGggMiBpdGVtcyAoaW5zcGVjdG9yIGFib3ZlIGluc3BlY3RvciBmb3IgaW5zdGFuY2UpLCBjbG9zZSBhbiBpdGVtLCB0aGVuIGNsb3NlIHRoZSBvdGhlcixcbiAgICAgICAqICB0aGUgZmluYWwgc3RhdGUgY2hhbmdlIGV2ZW50IGlzIG5vdCB0cmlnZ2VyZWQgdG8gc2hvdyBjb250ZW50IGFzIFtdIG9yIGVtcHR5LiAgT2RkbHkgZW5vdWdoIGl0IHdvcmtzIGluIG90aGVyIHNjZW5hcmlvcy5cbiAgICAgICAqICBJIGhhdmVuJ3QgZGV0ZXJtaW5lZCBhIHdvcmthcm91bmQgZm9yIHRoaXMsIGJ1dCBpdCdzIG5vdCBib3RoZXJpbmcgdXNlcnMgYXMgZmFyIGFzIEkga25vdyBhdCB0aGUgbW9tZW50LlxuICAgICAgICogIEJhc2ljYWxseSB0aGUgYnVnIGlzIHRoYXQgZW1wdHkgbGF5b3V0cyBhcmVuJ3QgZ3VhcmFudGVlZCB0byBiZSBzYXZlZCwgYnV0IG5vbiBlbXB0eSB3aWxsIGFsd2F5cyBzYXZlIGFwcHJvcHJpYXRlbHkuXG4gICAgICAgKi9cbiAgICAgIGdvbGRlbkxheW91dC5vbignc3RhdGVDaGFuZ2VkJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgaWYgKCFldmVudCkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGx5SW5pdGlhbGl6ZWQgPVxuICAgICAgICAgIGdvbGRlbkxheW91dC5pc0luaXRpYWxpc2VkICYmXG4gICAgICAgICAgIShnb2xkZW5MYXlvdXQ/Lm9wZW5Qb3BvdXRzIGFzIEFycmF5PGFueT4pPy5zb21lKFxuICAgICAgICAgICAgKHBvcG91dDogYW55KSA9PiAhcG9wb3V0LmlzSW5pdGlhbGlzZWRcbiAgICAgICAgICApXG4gICAgICAgIGlmICghZnVsbHlJbml0aWFsaXplZCkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgZ29sZGVuTGF5b3V0LmVtaXQoJ3N0YXRlQ2hhbmdlZCcsICdyZXRyeScpXG4gICAgICAgICAgfSwgMjAwKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb25maWcgPSBnZXRJbnN0YW5jZUNvbmZpZyh7IGdvbGRlbkxheW91dCB9KVxuICAgICAgICAvKipcbiAgICAgICAgICogIEdldCB0aGUgY29uZmlnIGluc3RhbnRseSwgdGhhdCB3YXkgaWYgd2UgbmF2aWdhdGUgYXdheSBhbmQgdGhlIGNvbXBvbmVudCBpcyByZW1vdmVkIGZyb20gdGhlIGRvY3VtZW50IHdlIHN0aWxsIGdldCB0aGUgY29ycmVjdCBjb25maWdcbiAgICAgICAgICogIEhvd2V2ZXIsIGRlbGF5IHRoZSBhY3R1YWwgYXR0ZW1wdCB0byBzYXZlIHRoZSBjb25maWcsIHNvIHdlIGRvbid0IHNhdmUgdG9vIG9mdGVuLlxuICAgICAgICAgKi9cbiAgICAgICAgZGVib3VuY2VkSGFuZGxlR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2Uoe1xuICAgICAgICAgIGN1cnJlbnRDb25maWcsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgc2V0RmluaXNoZWQodHJ1ZSlcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5vZmYoJ3N0YXRlQ2hhbmdlZCcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0XSlcbiAgcmV0dXJuIGZpbmlzaGVkXG59XG5cbi8qKlxuICogIFRoaXMgd2lsbCBhdHRhY2ggb3VyIGN1c3RvbSB0b29sYmFyIHRvIHRoZSBnb2xkZW4gbGF5b3V0IHN0YWNrIGhlYWRlclxuICovXG5jb25zdCB1c2VMaXN0ZW5Ub0dvbGRlbkxheW91dFN0YWNrQ3JlYXRlZCA9ICh7XG4gIGdvbGRlbkxheW91dCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbn0pID0+IHtcbiAgY29uc3QgW2ZpbmlzaGVkLCBzZXRGaW5pc2hlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQpIHtcbiAgICAgIGdvbGRlbkxheW91dC5vbignc3RhY2tDcmVhdGVkJywgaGFuZGxlR29sZGVuTGF5b3V0U3RhY2tDcmVhdGVkKVxuICAgICAgc2V0RmluaXNoZWQodHJ1ZSlcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5vZmYoJ3N0YWNrQ3JlYXRlZCcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0XSlcbiAgcmV0dXJuIGZpbmlzaGVkXG59XG5cbnR5cGUgcG9wdXBIYW5kbGluZ1N0YXRlVHlwZSA9ICdhbGxvd2VkJyB8ICdibG9ja2VkJyB8ICdwcm9jZWVkJ1xuXG5jb25zdCB1c2VJbml0R29sZGVuTGF5b3V0ID0gKHtcbiAgZGVwZW5kZW5jaWVzLFxuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIGRlcGVuZGVuY2llczogQXJyYXk8Ym9vbGVhbj5cbiAgZ29sZGVuTGF5b3V0OiBhbnlcbn0pID0+IHtcbiAgY29uc3QgW2ZpbmlzaGVkLCBzZXRGaW5pc2hlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3BvcHVwSGFuZGxpbmdTdGF0ZSwgc2V0UG9wdXBIYW5kbGluZ1N0YXRlXSA9XG4gICAgUmVhY3QudXNlU3RhdGU8cG9wdXBIYW5kbGluZ1N0YXRlVHlwZT4oJ2FsbG93ZWQnKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRlcGVuZGVuY2llcy5ldmVyeSgoZGVwZW5kZW5jeSkgPT4gZGVwZW5kZW5jeSkpIHtcbiAgICAgIGlmIChnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cgJiYgd2luZG93Lm9wZW5lciA9PT0gbnVsbCkge1xuICAgICAgICBzZXRFcnJvcih0cnVlKVxuICAgICAgfVxuICAgICAgY29uc3Qgb25Jbml0ID0gKCkgPT4ge1xuICAgICAgICBzZXRGaW5pc2hlZCh0cnVlKVxuICAgICAgfVxuICAgICAgZ29sZGVuTGF5b3V0Lm9uKCdpbml0aWFsaXNlZCcsIG9uSW5pdClcbiAgICAgIGlmIChnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cpIHtcbiAgICAgICAgLy8gZm9yIHNvbWUgcmVhc29uIHN1YndpbmRvdyBzdGFja3MgbG9zZSBkaW1lbnNpb25zLCBzcGVjaWZpY2FsbHkgdGhlIGhlYWRlciBoZWlnaHQgKHNlZSBfY3JlYXRlQ29uZmlnIGluIGdvbGRlbiBsYXlvdXQgc291cmNlIGNvZGUpXG4gICAgICAgIGdvbGRlbkxheW91dC5jb25maWcuZGltZW5zaW9ucyA9IGdldEdvbGRlbkxheW91dFNldHRpbmdzKCkuZGltZW5zaW9uc1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgZ29sZGVuTGF5b3V0LmluaXQoKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS50eXBlID09PSAncG9wb3V0QmxvY2tlZCcpIHtcbiAgICAgICAgICBzZXRQb3B1cEhhbmRsaW5nU3RhdGUoJ2Jsb2NrZWQnKVxuICAgICAgICAgIGdvbGRlbkxheW91dC5vcGVuUG9wb3V0cz8uZm9yRWFjaCgocG9wb3V0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIHBvcG91dC5jbG9zZSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnb2xkZW5MYXlvdXQub2ZmKCdpbml0aWFsaXNlZCcsIG9uSW5pdClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFsuLi5kZXBlbmRlbmNpZXMsIHBvcHVwSGFuZGxpbmdTdGF0ZV0pXG4gIHJldHVybiB7XG4gICAgZmluaXNoZWQsXG4gICAgZXJyb3IsXG4gICAgc2V0UG9wdXBIYW5kbGluZ1N0YXRlLFxuICAgIHBvcHVwSGFuZGxpbmdTdGF0ZSxcbiAgfVxufVxuXG5jb25zdCBIYW5kbGVQb3BvdXRzQmxvY2tlZCA9ICh7XG4gIHNldFBvcHVwSGFuZGxpbmdTdGF0ZSxcbiAgZ29sZGVuTGF5b3V0LFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBzZXRQb3B1cEhhbmRsaW5nU3RhdGU6IFJlYWN0LkRpc3BhdGNoPHBvcHVwSGFuZGxpbmdTdGF0ZVR5cGU+XG59KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPERpYWxvZyBvcGVuPXt0cnVlfT5cbiAgICAgIDxEaWFsb2dUaXRsZT5WaXN1YWxpemF0aW9uIHBvcHVwcyBibG9ja2VkPC9EaWFsb2dUaXRsZT5cbiAgICAgIDxEaWFsb2dDb250ZW50PlxuICAgICAgICBQbGVhc2UgYWxsb3cgcG9wdXBzIGZvciB0aGlzIHNpdGUsIHRoZW4gY2xpY2sgdGhlIGJ1dHRvbiBiZWxvdyB0byByZXRyeVxuICAgICAgICBsb2FkaW5nIHlvdXIgdmlzdWFsaXphdGlvbiBsYXlvdXQuXG4gICAgICA8L0RpYWxvZ0NvbnRlbnQ+XG4gICAgICA8RGlhbG9nQWN0aW9ucz5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGNvbG9yPVwiZXJyb3JcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGdvbGRlbkxheW91dC5jb25maWcub3BlblBvcG91dHMgPSBbXVxuICAgICAgICAgICAgc2V0UG9wdXBIYW5kbGluZ1N0YXRlKCdwcm9jZWVkJylcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgUHJvY2VlZCB3aXRob3V0IHBvcHVwc1xuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgLy8gdHJ5IG9wZW5pbmcgdHdvIHdpbmRvd3MsIGFzIG9uZSBpcyBhbGxvd2VkIHNpbmNlIHRoZSB1c2VyIGludGVyYWN0cyB3aXRoIHRoZSBidXR0b25cbiAgICAgICAgICAgIGNvbnN0IHdpbmRvdzEgPSB3aW5kb3cub3BlbignJywgJ19ibGFuaycpXG4gICAgICAgICAgICBjb25zdCB3aW5kb3cyID0gd2luZG93Lm9wZW4oJycsICdfYmxhbmsnKVxuICAgICAgICAgICAgaWYgKHdpbmRvdzEgJiYgd2luZG93Mikge1xuICAgICAgICAgICAgICBzZXRQb3B1cEhhbmRsaW5nU3RhdGUoJ2FsbG93ZWQnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93MT8uY2xvc2UoKVxuICAgICAgICAgICAgd2luZG93Mj8uY2xvc2UoKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBSZXRyeVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvRGlhbG9nQWN0aW9ucz5cbiAgICA8L0RpYWxvZz5cbiAgKVxufVxuXG5leHBvcnQgY29uc3QgR29sZGVuTGF5b3V0Vmlld1JlYWN0ID0gKG9wdGlvbnM6IEdvbGRlbkxheW91dFZpZXdQcm9wcykgPT4ge1xuICBjb25zdCBbZ29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudCwgc2V0R29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2dvbGRlbkxheW91dCwgc2V0R29sZGVuTGF5b3V0XSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcbiAgY29uc3QgbGFzdENvbmZpZyA9IFJlYWN0LnVzZVJlZjxhbnk+KGdldEdvbGRlbkxheW91dENvbmZpZyhvcHRpb25zKSlcbiAgdXNlVXBkYXRlR29sZGVuTGF5b3V0U2l6ZSh7IHdyZXFyLCBnb2xkZW5MYXlvdXQgfSlcbiAgdXNlU2VuZEdvbGRlbkxheW91dFJlZmVyZW5jZVVwd2FyZHMoeyBvcHRpb25zLCBnb2xkZW5MYXlvdXQgfSlcbiAgdXNlQXR0YWNoR29sZGVuTGF5b3V0KHsgZ29sZGVuTGF5b3V0QXR0YWNoRWxlbWVudCwgc2V0R29sZGVuTGF5b3V0LCBvcHRpb25zIH0pXG4gIGNvbnN0IGdvbGRlbkxheW91dENvbXBvbmVudHNSZWdpc3RlcmVkID0gdXNlUmVnaXN0ZXJHb2xkZW5MYXlvdXRDb21wb25lbnRzKHtcbiAgICBvcHRpb25zLFxuICAgIGdvbGRlbkxheW91dCxcbiAgfSlcbiAgY29uc3QgbGlzdGVuaW5nVG9Hb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZXMgPVxuICAgIHVzZUxpc3RlblRvR29sZGVuTGF5b3V0U3RhdGVDaGFuZ2VzKHsgb3B0aW9ucywgZ29sZGVuTGF5b3V0LCBsYXN0Q29uZmlnIH0pXG4gIGNvbnN0IGxpc3RlbmluZ1RvR29sZGVuTGF5b3V0U3RhY2tDcmVhdGVkID1cbiAgICB1c2VMaXN0ZW5Ub0dvbGRlbkxheW91dFN0YWNrQ3JlYXRlZCh7IGdvbGRlbkxheW91dCB9KVxuXG4gIGNvbnN0IHsgZmluaXNoZWQsIGVycm9yLCBzZXRQb3B1cEhhbmRsaW5nU3RhdGUsIHBvcHVwSGFuZGxpbmdTdGF0ZSB9ID1cbiAgICB1c2VJbml0R29sZGVuTGF5b3V0KHtcbiAgICAgIGRlcGVuZGVuY2llczogW1xuICAgICAgICBnb2xkZW5MYXlvdXRDb21wb25lbnRzUmVnaXN0ZXJlZCxcbiAgICAgICAgbGlzdGVuaW5nVG9Hb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZXMsXG4gICAgICAgIGxpc3RlbmluZ1RvR29sZGVuTGF5b3V0U3RhY2tDcmVhdGVkLFxuICAgICAgXSxcbiAgICAgIGdvbGRlbkxheW91dCxcbiAgICB9KVxuXG4gIHVzZUNyb3NzV2luZG93R29sZGVuTGF5b3V0Q29tbXVuaWNhdGlvbih7XG4gICAgZ29sZGVuTGF5b3V0LFxuICAgIGlzSW5pdGlhbGl6ZWQ6ICFlcnJvciAmJiBmaW5pc2hlZCxcbiAgICBvcHRpb25zLFxuICB9KVxuXG4gIHVzZVZlcmlmeU1hcEV4aXN0c1doZW5EcmF3aW5nKHtcbiAgICBnb2xkZW5MYXlvdXQsXG4gICAgaXNJbml0aWFsaXplZDogIWVycm9yICYmIGZpbmlzaGVkLFxuICB9KVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBkYXRhLWVsZW1lbnQ9XCJnb2xkZW4tbGF5b3V0XCIgY2xhc3NOYW1lPVwiaXMtbWluaW1pc2VkIGgtZnVsbCB3LWZ1bGxcIj5cbiAgICAgIHtwb3B1cEhhbmRsaW5nU3RhdGUgPT09ICdibG9ja2VkJyA/IChcbiAgICAgICAgPEhhbmRsZVBvcG91dHNCbG9ja2VkXG4gICAgICAgICAgZ29sZGVuTGF5b3V0PXtnb2xkZW5MYXlvdXR9XG4gICAgICAgICAgc2V0UG9wdXBIYW5kbGluZ1N0YXRlPXtzZXRQb3B1cEhhbmRsaW5nU3RhdGV9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtzZXRHb2xkZW5MYXlvdXRBdHRhY2hFbGVtZW50fVxuICAgICAgICBjbGFzc05hbWU9XCJnb2xkZW4tbGF5b3V0LWNvbnRhaW5lciB3LWZ1bGwgaC1mdWxsXCJcbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgR29sZGVuTGF5b3V0Vmlld1JlYWN0XG4iXX0=