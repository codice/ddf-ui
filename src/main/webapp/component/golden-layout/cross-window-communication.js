import { __read } from "tslib";
import React from 'react';
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks';
import { useHistory } from 'react-router-dom';
import _cloneDeep from 'lodash.clonedeep';
import _isEqualWith from 'lodash.isequalwith';
import { TypedUserInstance } from '../singletons/TypedUser';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import wreqr from '../../js/wreqr';
import GoldenLayout from 'golden-layout';
import { getRootColumnContent, rootIsNotAColumn } from './stack-toolbar';
import { unMaximize } from '../../react-component/visualization-selector/visualization-selector';
import { v4 as uuid } from 'uuid';
var windowId = uuid();
/**
 *  The popin function in golden layout has issues, particularly when there is a single stack in the main window at root.
 *  It also, like many other things in golden layout, doesn't play well with maximize.
 *
 *  This patch detects maximize and removes it (since it doesn't make sense when popping in)
 *  It also detects if the root is not a column, and if so, makes it a column so that popin works in all cases.
 */
function patchPopinFunction() {
    var oldPopin = GoldenLayout.__lm.controls.BrowserPopout.prototype
        .popIn;
    GoldenLayout.__lm.controls.BrowserPopout.prototype.popIn =
        function () {
            var goldenLayoutRoot = this._layoutManager.root;
            unMaximize(goldenLayoutRoot);
            if (rootIsNotAColumn(goldenLayoutRoot)) {
                var existingRootContent = getRootColumnContent(goldenLayoutRoot);
                goldenLayoutRoot.removeChild(existingRootContent, true); // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
                // we need a column for minimize to work, so make a new column and add the existing root to it
                var newColumnItem = this._layoutManager._$normalizeContentItem({
                    type: 'column',
                });
                newColumnItem.addChild(existingRootContent);
                goldenLayoutRoot.addChild(newColumnItem);
            }
            oldPopin.apply(this, arguments);
        };
}
patchPopinFunction();
export var GoldenLayoutWindowCommunicationEvents = {
    requestInitialState: 'requestInitialState',
    consumeInitialState: 'consumeInitialState',
    consumeStateChange: 'consumeStateChange',
    consumePreferencesChange: 'consumePreferencesChange',
    consumeSubwindowLayoutChange: 'consumeSubwindowLayoutChange',
    consumeNavigationChange: 'consumeNavigationChange',
    consumeWreqrEvent: 'consumeWreqrEvent',
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
                fromWindowId: windowId,
            });
        }
    });
    React.useEffect(function () {
        if (goldenLayout && isInitialized) {
            goldenLayout.eventHub.on(GoldenLayoutWindowCommunicationEvents.consumePreferencesChange, function (_a) {
                var preferences = _a.preferences, fromWindowId = _a.fromWindowId;
                if (windowId !== fromWindowId) {
                    TypedUserInstance.sync(preferences);
                }
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
export var UseSubwindowConsumeNavigationChange = function (_a) {
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
export var useCrossWindowGoldenLayoutCommunication = function (_a) {
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
//# sourceMappingURL=cross-window-communication.js.map