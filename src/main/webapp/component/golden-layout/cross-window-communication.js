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
 *  This function is used to extract the 'gl-window' parameter from the URL that was made by the golden layout library
 */
function getGLWindowParam(urlString) {
    // Parse the URL
    var url = new URL(urlString);
    // Check 'gl-window' in the query string
    var searchParams = new URLSearchParams(url.search);
    if (searchParams.has('gl-window')) {
        return searchParams.get('gl-window');
    }
    // Check 'gl-window' in the fragment (hash)
    if (url.hash) {
        var hash = url.hash.substring(1); // Remove the leading '#'
        // If the hash contains a path followed by query parameters
        var hashIndex = hash.indexOf('?');
        if (hashIndex !== -1) {
            var hashQueryString = hash.substring(hashIndex + 1);
            var hashParams = new URLSearchParams(hashQueryString);
            if (hashParams.has('gl-window')) {
                return hashParams.get('gl-window');
            }
        }
        else {
            // Handle the case where the hash itself is a query string
            var hashParams = new URLSearchParams(hash);
            if (hashParams.has('gl-window')) {
                return hashParams.get('gl-window');
            }
        }
    }
    // Return null if 'gl-window' is not found
    return null;
}
/**
 *  This patches the popout url that golden layout creates so that it goes to the popout specific route, rather than the current route, which can have side effects.
 *  Notice we have to grab the window param and reattach it.
 */
function patchCreateUrl() {
    var oldCreateUrl = GoldenLayout.__lm.controls.BrowserPopout
        .prototype._createUrl;
    GoldenLayout.__lm.controls.BrowserPopout.prototype._createUrl =
        function () {
            var oldCreatedUrl = oldCreateUrl.apply(this, arguments);
            var glWindowParam = getGLWindowParam(oldCreatedUrl);
            // determine if ?gl-window=' or &gl-window=, then redo the first part and tack that part on
            var newCreatedUrl = document.location.origin +
                document.location.pathname +
                '#/_gl_popout?gl-window=' +
                glWindowParam;
            return newCreatedUrl;
        };
}
patchCreateUrl();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3Mtd2luZG93LWNvbW11bmljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2dvbGRlbi1sYXlvdXQvY3Jvc3Mtd2luZG93LWNvbW11bmljYXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLE1BQU0sOEJBQThCLENBQUE7QUFHbkYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQzdDLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFBO0FBQ3pDLE9BQU8sWUFBWSxNQUFNLG9CQUFvQixDQUFBO0FBQzdDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBQzNELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUNwRSxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLFlBQVksTUFBTSxlQUFlLENBQUE7QUFDeEMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFDeEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFFQUFxRSxDQUFBO0FBQ2hHLE9BQU8sRUFBRSxFQUFFLElBQUksSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBRWpDLElBQU0sUUFBUSxHQUFHLElBQUksRUFBRSxDQUFBO0FBRXZCOztHQUVHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxTQUFpQjtJQUN6QyxnQkFBZ0I7SUFDaEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFFOUIsd0NBQXdDO0lBQ3hDLElBQU0sWUFBWSxHQUFHLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNw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LGFBQWEsZUFBQSxFQUFFLENBQUMsQ0FBQTtJQUM1RCwrQkFBK0IsQ0FBQyxFQUFFLFlBQVksY0FBQSxFQUFFLGFBQWEsZUFBQSxFQUFFLENBQUMsQ0FBQTtJQUNoRSxtQ0FBbUMsQ0FBQyxFQUFFLFlBQVksY0FBQSxFQUFFLGFBQWEsZUFBQSxFQUFFLENBQUMsQ0FBQTtJQUNwRSxnQ0FBZ0MsQ0FBQyxFQUFFLFlBQVksY0FBQSxFQUFFLGFBQWEsZUFBQSxFQUFFLENBQUMsQ0FBQTtJQUNqRSxxQkFBcUIsQ0FBQyxFQUFFLFlBQVksY0FBQSxFQUFFLGFBQWEsZUFBQSxFQUFFLENBQUMsQ0FBQTtJQUN0RCxxQkFBcUIsQ0FBQyxFQUFFLFlBQVksY0FBQSxFQUFFLGFBQWEsZUFBQSxFQUFFLENBQUMsQ0FBQTtBQUN4RCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VMYXp5UmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2UgfSBmcm9tICcuLi9zZWxlY3Rpb24taW50ZXJmYWNlL2hvb2tzJ1xuaW1wb3J0IHR5cGUgeyBHb2xkZW5MYXlvdXRWaWV3UHJvcHMgfSBmcm9tICcuL2dvbGRlbi1sYXlvdXQudmlldydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdHMgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0cydcbmltcG9ydCB7IHVzZUhpc3RvcnkgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xuaW1wb3J0IF9jbG9uZURlZXAgZnJvbSAnbG9kYXNoLmNsb25lZGVlcCdcbmltcG9ydCBfaXNFcXVhbFdpdGggZnJvbSAnbG9kYXNoLmlzZXF1YWx3aXRoJ1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi9zaW5nbGV0b25zL1R5cGVkVXNlcidcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vanMvd3JlcXInXG5pbXBvcnQgR29sZGVuTGF5b3V0IGZyb20gJ2dvbGRlbi1sYXlvdXQnXG5pbXBvcnQgeyBnZXRSb290Q29sdW1uQ29udGVudCwgcm9vdElzTm90QUNvbHVtbiB9IGZyb20gJy4vc3RhY2stdG9vbGJhcidcbmltcG9ydCB7IHVuTWF4aW1pemUgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdmlzdWFsaXphdGlvbi1zZWxlY3Rvci92aXN1YWxpemF0aW9uLXNlbGVjdG9yJ1xuaW1wb3J0IHsgdjQgYXMgdXVpZCB9IGZyb20gJ3V1aWQnXG5cbmNvbnN0IHdpbmRvd0lkID0gdXVpZCgpXG5cbi8qKlxuICogIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBleHRyYWN0IHRoZSAnZ2wtd2luZG93JyBwYXJhbWV0ZXIgZnJvbSB0aGUgVVJMIHRoYXQgd2FzIG1hZGUgYnkgdGhlIGdvbGRlbiBsYXlvdXQgbGlicmFyeVxuICovXG5mdW5jdGlvbiBnZXRHTFdpbmRvd1BhcmFtKHVybFN0cmluZzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIC8vIFBhcnNlIHRoZSBVUkxcbiAgY29uc3QgdXJsID0gbmV3IFVSTCh1cmxTdHJpbmcpXG5cbiAgLy8gQ2hlY2sgJ2dsLXdpbmRvdycgaW4gdGhlIHF1ZXJ5IHN0cmluZ1xuICBjb25zdCBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHVybC5zZWFyY2gpXG4gIGlmIChzZWFyY2hQYXJhbXMuaGFzKCdnbC13aW5kb3cnKSkge1xuICAgIHJldHVybiBzZWFyY2hQYXJhbXMuZ2V0KCdnbC13aW5kb3cnKVxuICB9XG5cbiAgLy8gQ2hlY2sgJ2dsLXdpbmRvdycgaW4gdGhlIGZyYWdtZW50IChoYXNoKVxuICBpZiAodXJsLmhhc2gpIHtcbiAgICBjb25zdCBoYXNoID0gdXJsLmhhc2guc3Vic3RyaW5nKDEpIC8vIFJlbW92ZSB0aGUgbGVhZGluZyAnIydcblxuICAgIC8vIElmIHRoZSBoYXNoIGNvbnRhaW5zIGEgcGF0aCBmb2xsb3dlZCBieSBxdWVyeSBwYXJhbWV0ZXJzXG4gICAgY29uc3QgaGFzaEluZGV4ID0gaGFzaC5pbmRleE9mKCc/JylcbiAgICBpZiAoaGFzaEluZGV4ICE9PSAtMSkge1xuICAgICAgY29uc3QgaGFzaFF1ZXJ5U3RyaW5nID0gaGFzaC5zdWJzdHJpbmcoaGFzaEluZGV4ICsgMSlcbiAgICAgIGNvbnN0IGhhc2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGhhc2hRdWVyeVN0cmluZylcbiAgICAgIGlmIChoYXNoUGFyYW1zLmhhcygnZ2wtd2luZG93JykpIHtcbiAgICAgICAgcmV0dXJuIGhhc2hQYXJhbXMuZ2V0KCdnbC13aW5kb3cnKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlIGhhc2ggaXRzZWxmIGlzIGEgcXVlcnkgc3RyaW5nXG4gICAgICBjb25zdCBoYXNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhoYXNoKVxuICAgICAgaWYgKGhhc2hQYXJhbXMuaGFzKCdnbC13aW5kb3cnKSkge1xuICAgICAgICByZXR1cm4gaGFzaFBhcmFtcy5nZXQoJ2dsLXdpbmRvdycpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJuIG51bGwgaWYgJ2dsLXdpbmRvdycgaXMgbm90IGZvdW5kXG4gIHJldHVybiBudWxsXG59XG5cbi8qKlxuICogIFRoaXMgcGF0Y2hlcyB0aGUgcG9wb3V0IHVybCB0aGF0IGdvbGRlbiBsYXlvdXQgY3JlYXRlcyBzbyB0aGF0IGl0IGdvZXMgdG8gdGhlIHBvcG91dCBzcGVjaWZpYyByb3V0ZSwgcmF0aGVyIHRoYW4gdGhlIGN1cnJlbnQgcm91dGUsIHdoaWNoIGNhbiBoYXZlIHNpZGUgZWZmZWN0cy5cbiAqICBOb3RpY2Ugd2UgaGF2ZSB0byBncmFiIHRoZSB3aW5kb3cgcGFyYW0gYW5kIHJlYXR0YWNoIGl0LlxuICovXG5mdW5jdGlvbiBwYXRjaENyZWF0ZVVybCgpIHtcbiAgY29uc3Qgb2xkQ3JlYXRlVXJsID0gKEdvbGRlbkxheW91dCBhcyBhbnkpLl9fbG0uY29udHJvbHMuQnJvd3NlclBvcG91dFxuICAgIC5wcm90b3R5cGUuX2NyZWF0ZVVybFxuICA7KEdvbGRlbkxheW91dCBhcyBhbnkpLl9fbG0uY29udHJvbHMuQnJvd3NlclBvcG91dC5wcm90b3R5cGUuX2NyZWF0ZVVybCA9XG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3Qgb2xkQ3JlYXRlZFVybCA9IG9sZENyZWF0ZVVybC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICBjb25zdCBnbFdpbmRvd1BhcmFtID0gZ2V0R0xXaW5kb3dQYXJhbShvbGRDcmVhdGVkVXJsKVxuICAgICAgLy8gZGV0ZXJtaW5lIGlmID9nbC13aW5kb3c9JyBvciAmZ2wtd2luZG93PSwgdGhlbiByZWRvIHRoZSBmaXJzdCBwYXJ0IGFuZCB0YWNrIHRoYXQgcGFydCBvblxuICAgICAgY29uc3QgbmV3Q3JlYXRlZFVybCA9XG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLm9yaWdpbiArXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lICtcbiAgICAgICAgJyMvX2dsX3BvcG91dD9nbC13aW5kb3c9JyArXG4gICAgICAgIGdsV2luZG93UGFyYW1cbiAgICAgIHJldHVybiBuZXdDcmVhdGVkVXJsXG4gICAgfVxufVxucGF0Y2hDcmVhdGVVcmwoKVxuXG4vKipcbiAqICBUaGUgcG9waW4gZnVuY3Rpb24gaW4gZ29sZGVuIGxheW91dCBoYXMgaXNzdWVzLCBwYXJ0aWN1bGFybHkgd2hlbiB0aGVyZSBpcyBhIHNpbmdsZSBzdGFjayBpbiB0aGUgbWFpbiB3aW5kb3cgYXQgcm9vdC5cbiAqICBJdCBhbHNvLCBsaWtlIG1hbnkgb3RoZXIgdGhpbmdzIGluIGdvbGRlbiBsYXlvdXQsIGRvZXNuJ3QgcGxheSB3ZWxsIHdpdGggbWF4aW1pemUuXG4gKlxuICogIFRoaXMgcGF0Y2ggZGV0ZWN0cyBtYXhpbWl6ZSBhbmQgcmVtb3ZlcyBpdCAoc2luY2UgaXQgZG9lc24ndCBtYWtlIHNlbnNlIHdoZW4gcG9wcGluZyBpbilcbiAqICBJdCBhbHNvIGRldGVjdHMgaWYgdGhlIHJvb3QgaXMgbm90IGEgY29sdW1uLCBhbmQgaWYgc28sIG1ha2VzIGl0IGEgY29sdW1uIHNvIHRoYXQgcG9waW4gd29ya3MgaW4gYWxsIGNhc2VzLlxuICovXG5mdW5jdGlvbiBwYXRjaFBvcGluRnVuY3Rpb24oKSB7XG4gIGNvbnN0IG9sZFBvcGluID0gKEdvbGRlbkxheW91dCBhcyBhbnkpLl9fbG0uY29udHJvbHMuQnJvd3NlclBvcG91dC5wcm90b3R5cGVcbiAgICAucG9wSW5cbiAgOyhHb2xkZW5MYXlvdXQgYXMgYW55KS5fX2xtLmNvbnRyb2xzLkJyb3dzZXJQb3BvdXQucHJvdG90eXBlLnBvcEluID1cbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBnb2xkZW5MYXlvdXRSb290ID0gdGhpcy5fbGF5b3V0TWFuYWdlci5yb290XG4gICAgICB1bk1heGltaXplKGdvbGRlbkxheW91dFJvb3QpXG4gICAgICBpZiAocm9vdElzTm90QUNvbHVtbihnb2xkZW5MYXlvdXRSb290KSkge1xuICAgICAgICBjb25zdCBleGlzdGluZ1Jvb3RDb250ZW50ID0gZ2V0Um9vdENvbHVtbkNvbnRlbnQoZ29sZGVuTGF5b3V0Um9vdClcbiAgICAgICAgZ29sZGVuTGF5b3V0Um9vdC5yZW1vdmVDaGlsZChleGlzdGluZ1Jvb3RDb250ZW50IGFzIGFueSwgdHJ1ZSkgLy8gZm9yIHNvbWUgcmVhc29uIHJlbW92ZUNoaWxkIGlzIG92ZXJseSByZXN0cmljdGl2ZSBvbiB0eXBlIG9mIFwidGhpbmdcIiBzbyB3ZSBoYXZlIHRvIGNhc3RcblxuICAgICAgICAvLyB3ZSBuZWVkIGEgY29sdW1uIGZvciBtaW5pbWl6ZSB0byB3b3JrLCBzbyBtYWtlIGEgbmV3IGNvbHVtbiBhbmQgYWRkIHRoZSBleGlzdGluZyByb290IHRvIGl0XG4gICAgICAgIGNvbnN0IG5ld0NvbHVtbkl0ZW0gPSB0aGlzLl9sYXlvdXRNYW5hZ2VyLl8kbm9ybWFsaXplQ29udGVudEl0ZW0oe1xuICAgICAgICAgIHR5cGU6ICdjb2x1bW4nLFxuICAgICAgICB9KVxuICAgICAgICBuZXdDb2x1bW5JdGVtLmFkZENoaWxkKGV4aXN0aW5nUm9vdENvbnRlbnQpXG4gICAgICAgIGdvbGRlbkxheW91dFJvb3QuYWRkQ2hpbGQobmV3Q29sdW1uSXRlbSlcbiAgICAgIH1cbiAgICAgIG9sZFBvcGluLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG59XG5wYXRjaFBvcGluRnVuY3Rpb24oKVxuXG5leHBvcnQgY29uc3QgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cyA9IHtcbiAgcmVxdWVzdEluaXRpYWxTdGF0ZTogJ3JlcXVlc3RJbml0aWFsU3RhdGUnLFxuICBjb25zdW1lSW5pdGlhbFN0YXRlOiAnY29uc3VtZUluaXRpYWxTdGF0ZScsXG4gIGNvbnN1bWVTdGF0ZUNoYW5nZTogJ2NvbnN1bWVTdGF0ZUNoYW5nZScsXG4gIGNvbnN1bWVQcmVmZXJlbmNlc0NoYW5nZTogJ2NvbnN1bWVQcmVmZXJlbmNlc0NoYW5nZScsXG4gIGNvbnN1bWVTdWJ3aW5kb3dMYXlvdXRDaGFuZ2U6ICdjb25zdW1lU3Vid2luZG93TGF5b3V0Q2hhbmdlJyxcbiAgY29uc3VtZU5hdmlnYXRpb25DaGFuZ2U6ICdjb25zdW1lTmF2aWdhdGlvbkNoYW5nZScsXG4gIGNvbnN1bWVXcmVxckV2ZW50OiAnY29uc3VtZVdyZXFyRXZlbnQnLFxufVxuXG5jb25zdCB1c2VQcm92aWRlU3RhdGVDaGFuZ2UgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG4gIGxhenlSZXN1bHRzLFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzSW5pdGlhbGl6ZWQgJiYgZ29sZGVuTGF5b3V0ICYmIGxhenlSZXN1bHRzKSB7XG4gICAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLl9jaGlsZEV2ZW50U291cmNlID0gbnVsbFxuICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIuZW1pdChcbiAgICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLmNvbnN1bWVTdGF0ZUNoYW5nZSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYXp5UmVzdWx0cyxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsdGVyZWRSZXN1bHRzU3Vic2NyaXB0aW9uID0gbGF6eVJlc3VsdHMuc3Vic2NyaWJlVG8oe1xuICAgICAgICBzdWJzY3JpYmFibGVUaGluZzogJ2ZpbHRlcmVkUmVzdWx0cycsXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IHNlbGVjdGVkUmVzdWx0c1N1YnNjcmlwdGlvbiA9IGxhenlSZXN1bHRzLnN1YnNjcmliZVRvKHtcbiAgICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdzZWxlY3RlZFJlc3VsdHMnLFxuICAgICAgICBjYWxsYmFjayxcbiAgICAgIH0pXG4gICAgICBjb25zdCBzdGF0dXNTdWJzY3JpcHRpb24gPSBsYXp5UmVzdWx0cy5zdWJzY3JpYmVUbyh7XG4gICAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnc3RhdHVzJyxcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICB9KVxuICAgICAgY29uc3QgZmlsdGVyVHJlZVN1YnNjcmlwdGlvbiA9IGxhenlSZXN1bHRzLnN1YnNjcmliZVRvKHtcbiAgICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICB9KVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZmlsdGVyZWRSZXN1bHRzU3Vic2NyaXB0aW9uKClcbiAgICAgICAgc2VsZWN0ZWRSZXN1bHRzU3Vic2NyaXB0aW9uKClcbiAgICAgICAgc3RhdHVzU3Vic2NyaXB0aW9uKClcbiAgICAgICAgZmlsdGVyVHJlZVN1YnNjcmlwdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbbGF6eVJlc3VsdHMsIGxhenlSZXN1bHRzPy5yZXN1bHRzLCBpc0luaXRpYWxpemVkLCBnb2xkZW5MYXlvdXRdKVxufVxuXG5jb25zdCB1c2VQcm92aWRlSW5pdGlhbFN0YXRlID0gKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBpc0luaXRpYWxpemVkLFxuICBsYXp5UmVzdWx0cyxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgaXNJbml0aWFsaXplZDogYm9vbGVhblxuICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChcbiAgICAgIGlzSW5pdGlhbGl6ZWQgJiZcbiAgICAgIGdvbGRlbkxheW91dCAmJlxuICAgICAgbGF6eVJlc3VsdHMgJiZcbiAgICAgICFnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3dcbiAgICApIHtcbiAgICAgIGNvbnN0IGhhbmRsZUluaXRpYWxpemVTdGF0ZSA9ICgpID0+IHtcbiAgICAgICAgLy8gZ29sZGVuIGxheW91dCBkb2Vzbid0IHByb3Blcmx5IGNsZWFyIHRoaXMgZmxhZ1xuICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIuX2NoaWxkRXZlbnRTb3VyY2UgPSBudWxsXG4gICAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZUluaXRpYWxTdGF0ZSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYXp5UmVzdWx0cyxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLm9uKFxuICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLnJlcXVlc3RJbml0aWFsU3RhdGUsXG4gICAgICAgIGhhbmRsZUluaXRpYWxpemVTdGF0ZVxuICAgICAgKVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIub2ZmKFxuICAgICAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5yZXF1ZXN0SW5pdGlhbFN0YXRlXG4gICAgICAgICAgKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtpc0luaXRpYWxpemVkLCBnb2xkZW5MYXlvdXQsIGxhenlSZXN1bHRzLCBsYXp5UmVzdWx0cz8ucmVzdWx0c10pXG59XG5cbmNvbnN0IHVzZUNvbnN1bWVJbml0aWFsU3RhdGUgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG4gIGxhenlSZXN1bHRzLFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSA9PiB7XG4gIGNvbnN0IFtoYXNDb25zdW1lZEluaXRpYWxTdGF0ZSwgc2V0SGFzQ29uc3VtZWRJbml0aWFsU3RhdGVdID1cbiAgICBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChcbiAgICAgIGlzSW5pdGlhbGl6ZWQgJiZcbiAgICAgICFoYXNDb25zdW1lZEluaXRpYWxTdGF0ZSAmJlxuICAgICAgZ29sZGVuTGF5b3V0ICYmXG4gICAgICBsYXp5UmVzdWx0cyAmJlxuICAgICAgZ29sZGVuTGF5b3V0LmlzU3ViV2luZG93XG4gICAgKSB7XG4gICAgICBjb25zdCBvblN5bmNTdGF0ZUNhbGxiYWNrID0gKGV2ZW50RGF0YToge1xuICAgICAgICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xuICAgICAgfSkgPT4ge1xuICAgICAgICBzZXRIYXNDb25zdW1lZEluaXRpYWxTdGF0ZSh0cnVlKVxuICAgICAgICBsYXp5UmVzdWx0cy5yZXNldCh7XG4gICAgICAgICAgZmlsdGVyVHJlZTogZXZlbnREYXRhLmxhenlSZXN1bHRzLmZpbHRlclRyZWUsXG4gICAgICAgICAgcmVzdWx0czogT2JqZWN0LnZhbHVlcyhldmVudERhdGEubGF6eVJlc3VsdHMucmVzdWx0cykubWFwKChyZXN1bHQpID0+XG4gICAgICAgICAgICBfY2xvbmVEZWVwKHJlc3VsdC5wbGFpbilcbiAgICAgICAgICApLFxuICAgICAgICAgIGhpZ2hsaWdodHM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5oaWdobGlnaHRzLFxuICAgICAgICAgIHNvcnRzOiBldmVudERhdGEubGF6eVJlc3VsdHMucGVyc2lzdGFudFNvcnRzLFxuICAgICAgICAgIHNvdXJjZXM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5zb3VyY2VzLFxuICAgICAgICAgIHN0YXR1czogZXZlbnREYXRhLmxhenlSZXN1bHRzLnN0YXR1cyxcbiAgICAgICAgICBkaWRZb3VNZWFuRmllbGRzOiBldmVudERhdGEubGF6eVJlc3VsdHMuZGlkWW91TWVhbkZpZWxkcyxcbiAgICAgICAgICBzaG93aW5nUmVzdWx0c0ZvckZpZWxkczpcbiAgICAgICAgICAgIGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5zaG93aW5nUmVzdWx0c0ZvckZpZWxkcyxcbiAgICAgICAgfSlcbiAgICAgICAgbGF6eVJlc3VsdHMuX3Jlc2V0U2VsZWN0ZWRSZXN1bHRzKClcbiAgICAgICAgT2JqZWN0LnZhbHVlcyhldmVudERhdGEubGF6eVJlc3VsdHMuc2VsZWN0ZWRSZXN1bHRzKS5mb3JFYWNoKFxuICAgICAgICAgIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGxhenlSZXN1bHRzLnJlc3VsdHNbcmVzdWx0LnBsYWluLmlkXS5jb250cm9sU2VsZWN0KClcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLm9uKFxuICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLmNvbnN1bWVJbml0aWFsU3RhdGUsXG4gICAgICAgIG9uU3luY1N0YXRlQ2FsbGJhY2tcbiAgICAgIClcbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLnJlcXVlc3RJbml0aWFsU3RhdGUsXG4gICAgICAgIHt9XG4gICAgICApXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIub2ZmKFxuICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZUluaXRpYWxTdGF0ZSxcbiAgICAgICAgICBvblN5bmNTdGF0ZUNhbGxiYWNrXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtnb2xkZW5MYXlvdXQsIGxhenlSZXN1bHRzLCBpc0luaXRpYWxpemVkXSlcbn1cblxuY29uc3QgdXNlQ29uc3VtZVN0YXRlQ2hhbmdlID0gKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBsYXp5UmVzdWx0cyxcbiAgaXNJbml0aWFsaXplZCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgbGF6eVJlc3VsdHM6IExhenlRdWVyeVJlc3VsdHNcbiAgaXNJbml0aWFsaXplZDogYm9vbGVhblxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQgJiYgbGF6eVJlc3VsdHMgJiYgaXNJbml0aWFsaXplZCkge1xuICAgICAgY29uc3Qgb25TeW5jU3RhdGVDYWxsYmFjayA9IChldmVudERhdGE6IHtcbiAgICAgICAgbGF6eVJlc3VsdHM6IExhenlRdWVyeVJlc3VsdHNcbiAgICAgIH0pID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IE9iamVjdC52YWx1ZXMobGF6eVJlc3VsdHMucmVzdWx0cykubWFwKChsYXp5UmVzdWx0KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBsYWluOiBsYXp5UmVzdWx0LnBsYWluLFxuICAgICAgICAgICAgaXNTZWxlY3RlZDogbGF6eVJlc3VsdC5pc1NlbGVjdGVkLFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgY2FsbGJhY2tSZXN1bHRzID0gT2JqZWN0LnZhbHVlcyhcbiAgICAgICAgICBldmVudERhdGEubGF6eVJlc3VsdHMucmVzdWx0c1xuICAgICAgICApLm1hcCgobGF6eVJlc3VsdCkgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwbGFpbjogbGF6eVJlc3VsdC5wbGFpbixcbiAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGxhenlSZXN1bHQuaXNTZWxlY3RlZCxcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGZpbHRlclRyZWUgPSBsYXp5UmVzdWx0cy5maWx0ZXJUcmVlXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrRmlsdGVyVHJlZSA9IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5maWx0ZXJUcmVlXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhX2lzRXF1YWxXaXRoKHJlc3VsdHMsIGNhbGxiYWNrUmVzdWx0cykgfHxcbiAgICAgICAgICAhX2lzRXF1YWxXaXRoKGZpbHRlclRyZWUsIGNhbGxiYWNrRmlsdGVyVHJlZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgbGF6eVJlc3VsdHMucmVzZXQoe1xuICAgICAgICAgICAgZmlsdGVyVHJlZTogZXZlbnREYXRhLmxhenlSZXN1bHRzLmZpbHRlclRyZWUsXG4gICAgICAgICAgICByZXN1bHRzOiBPYmplY3QudmFsdWVzKGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5yZXN1bHRzKS5tYXAoXG4gICAgICAgICAgICAgIChyZXN1bHQpID0+IF9jbG9uZURlZXAocmVzdWx0LnBsYWluKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGhpZ2hsaWdodHM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5oaWdobGlnaHRzLFxuICAgICAgICAgICAgc29ydHM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5wZXJzaXN0YW50U29ydHMsXG4gICAgICAgICAgICBzb3VyY2VzOiBldmVudERhdGEubGF6eVJlc3VsdHMuc291cmNlcyxcbiAgICAgICAgICAgIHN0YXR1czogZXZlbnREYXRhLmxhenlSZXN1bHRzLnN0YXR1cyxcbiAgICAgICAgICAgIGRpZFlvdU1lYW5GaWVsZHM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5kaWRZb3VNZWFuRmllbGRzLFxuICAgICAgICAgICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHM6XG4gICAgICAgICAgICAgIGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5zaG93aW5nUmVzdWx0c0ZvckZpZWxkcyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGxhenlSZXN1bHRzLl9yZXNldFNlbGVjdGVkUmVzdWx0cygpXG4gICAgICAgICAgT2JqZWN0LnZhbHVlcyhldmVudERhdGEubGF6eVJlc3VsdHMuc2VsZWN0ZWRSZXN1bHRzKS5mb3JFYWNoKFxuICAgICAgICAgICAgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICBsYXp5UmVzdWx0cy5yZXN1bHRzW3Jlc3VsdC5wbGFpbi5pZF0uY29udHJvbFNlbGVjdCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vbihcbiAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lU3RhdGVDaGFuZ2UsXG4gICAgICAgIG9uU3luY1N0YXRlQ2FsbGJhY2tcbiAgICAgIClcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vZmYoXG4gICAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lU3RhdGVDaGFuZ2UsXG4gICAgICAgICAgb25TeW5jU3RhdGVDYWxsYmFja1xuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0LCBsYXp5UmVzdWx0cywgaXNJbml0aWFsaXplZF0pXG59XG5cbmNvbnN0IHVzZUNvbnN1bWVQcmVmZXJlbmNlc0NoYW5nZSA9ICh7XG4gIGdvbGRlbkxheW91dCxcbiAgaXNJbml0aWFsaXplZCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgaXNJbml0aWFsaXplZDogYm9vbGVhblxufSkgPT4ge1xuICB1c2VMaXN0ZW5UbyhUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLCAnc3luYycsICgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0ICYmIGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLmNvbnN1bWVQcmVmZXJlbmNlc0NoYW5nZSxcbiAgICAgICAge1xuICAgICAgICAgIHByZWZlcmVuY2VzOiBUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLnRvSlNPTigpLFxuICAgICAgICAgIGZyb21XaW5kb3dJZDogd2luZG93SWQsXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9XG4gIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCAmJiBpc0luaXRpYWxpemVkKSB7XG4gICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIub24oXG4gICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZVByZWZlcmVuY2VzQ2hhbmdlLFxuICAgICAgICAoe1xuICAgICAgICAgIHByZWZlcmVuY2VzLFxuICAgICAgICAgIGZyb21XaW5kb3dJZCxcbiAgICAgICAgfToge1xuICAgICAgICAgIHByZWZlcmVuY2VzOiBhbnlcbiAgICAgICAgICBmcm9tV2luZG93SWQ6IHN0cmluZ1xuICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgaWYgKHdpbmRvd0lkICE9PSBmcm9tV2luZG93SWQpIHtcbiAgICAgICAgICAgIFR5cGVkVXNlckluc3RhbmNlLnN5bmMocHJlZmVyZW5jZXMpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgICByZXR1cm4gKCkgPT4ge31cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtnb2xkZW5MYXlvdXQsIGlzSW5pdGlhbGl6ZWRdKVxufVxuXG5mdW5jdGlvbiB1c2VDb25zdW1lU3Vid2luZG93TGF5b3V0Q2hhbmdlKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCAmJiBpc0luaXRpYWxpemVkICYmICFnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cpIHtcbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vbihcbiAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lU3Vid2luZG93TGF5b3V0Q2hhbmdlLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgZ29sZGVuTGF5b3V0LmVtaXQoJ3N0YXRlQ2hhbmdlZCcsICdzdWJ3aW5kb3cnKVxuICAgICAgICB9XG4gICAgICApXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIub2ZmKFxuICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZVN1YndpbmRvd0xheW91dENoYW5nZVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkXSlcbn1cblxuLyoqXG4gKiAgTm90aWNlIHRoYXQgd2UgYXJlIG9ubHkgZm9yd2FyZGluZyBldmVudHMgdGhhdCBzdGFydCB3aXRoICdzZWFyY2gnIGZvciBub3csIGFzIHRoZXNlIGFyZSBkcmF3aW5nIGV2ZW50cy5cbiAqL1xuY29uc3QgdXNlUHJvdmlkZVdyZXFyRXZlbnRzID0gKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSA9PiB7XG4gIHVzZUxpc3RlblRvKFxuICAgIHdyZXFyLnZlbnQsXG4gICAgJ2FsbCcsXG4gICAgKGV2ZW50OiBzdHJpbmcsIGFyZ3M6IGFueSwgeyBkb05vdFByb3BhZ2F0ZSA9IGZhbHNlIH0gPSB7fSkgPT4ge1xuICAgICAgaWYgKGdvbGRlbkxheW91dCAmJiBpc0luaXRpYWxpemVkKSB7XG4gICAgICAgIGlmIChldmVudC5zdGFydHNXaXRoKCdzZWFyY2gnKSAmJiAhZG9Ob3RQcm9wYWdhdGUpIHtcbiAgICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIuX2NoaWxkRXZlbnRTb3VyY2UgPSBudWxsIC8vIGdvbGRlbiBsYXlvdXQgZG9lc24ndCBwcm9wZXJseSBjbGVhciB0aGlzIGZsYWdcbiAgICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIuZW1pdChcbiAgICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZVdyZXFyRXZlbnQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgKVxufVxuXG5jb25zdCB1c2VDb25zdW1lV3JlcXJFdmVudHMgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG4gIGlzSW5pdGlhbGl6ZWQsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG4gIGlzSW5pdGlhbGl6ZWQ6IGJvb2xlYW5cbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0ICYmIGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vbihcbiAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lV3JlcXJFdmVudCxcbiAgICAgICAgKHsgZXZlbnQsIGFyZ3MgfTogeyBldmVudDogc3RyaW5nOyBhcmdzOiBhbnlbXSB9KSA9PiB7XG4gICAgICAgICAgd3JlcXIudmVudC50cmlnZ2VyKGV2ZW50LCBhcmdzLCB7IGRvTm90UHJvcGFnYXRlOiB0cnVlIH0pXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vZmYoXG4gICAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lV3JlcXJFdmVudFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkXSlcbn1cblxuLyoqXG4gKiAgT3ZlcnJpZGVzIG5hdmlnYXRpb24gZnVuY3Rpb25hbGl0eSB3aXRoaW4gc3Vid2luZG93cyBvZiBnb2xkZW4gbGF5b3V0LCBzbyB0aGF0IG5hdmlnYXRpb24gaXMgaGFuZGxlZCBieSB0aGUgbWFpbiB3aW5kb3cuXG4gKlxuICogIE5vdGljZSB3ZSBkbyB0aGlzIGFzIGEgY29tcG9uZW50IHJhdGhlciB0aGFuIGEgaG9vayBzbyB3ZSBjYW4gb3ZlcnJpZGUgdGhlIHNhbWUgdXNlSGlzdG9yeSBpbnN0YW5jZSB0aGF0IHRoZSB2aXN1YWxpemF0aW9uIGlzIHVzaW5nLlxuICogICh3ZSB0ZW1wb3JhcmlseSBlamVjdCBmcm9tIHJlYWN0IHRvIHVzZSBnb2xkZW4gbGF5b3V0LCBhbmQgcmV3cmFwIGVhY2ggdmlzdWFsIGluIGl0J3Mgb3duIGluc3RhbmNlIG9mIHRoZSB2YXJpb3VzIHByb3ZpZGVycywgbGlrZSByZWFjdCByb3V0ZXIpXG4gKlxuICogIFdlIGNvdWxkIHJld3JpdGUgaXQgYXMgYSBob29rIGFuZCBwdXQgaXQgZnVydGhlciBkb3duIGluIHRoZSB0cmVlLCBidXQgdGhpcyBpcyB0aGUgc2FtZSB0aGluZyBzbyBubyBuZWVkLlxuICpcbiAqICBBbHNvIG5vdGljZSB3ZSBhdHRhY2ggdGhpcyBhdCB0aGUgdmlzdWFsIGxldmVsIGZvciB0aGF0IHJlYXNvbiwgcmF0aGVyIHRoYW4gYXQgdGhlIHNpbmdsZSBnb2xkZW4gbGF5b3V0IGluc3RhbmNlIGxldmVsLlxuICovXG5leHBvcnQgY29uc3QgVXNlU3Vid2luZG93Q29uc3VtZU5hdmlnYXRpb25DaGFuZ2UgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG59KSA9PiB7XG4gIGNvbnN0IGhpc3RvcnkgPSB1c2VIaXN0b3J5KClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0ICYmIGhpc3RvcnkgJiYgZ29sZGVuTGF5b3V0LmlzU3ViV2luZG93KSB7XG4gICAgICBjb25zdCBjYWxsYmFjayA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBlLnRhcmdldD8uY29uc3RydWN0b3IgPT09IEhUTUxBbmNob3JFbGVtZW50ICYmXG4gICAgICAgICAgIShlLnRhcmdldCBhcyBIVE1MQW5jaG9yRWxlbWVudCk/LmhyZWYuc3RhcnRzV2l0aCgnYmxvYicpXG4gICAgICAgICkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgICAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lTmF2aWdhdGlvbkNoYW5nZSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaHJlZjogKGUudGFyZ2V0IGFzIEhUTUxBbmNob3JFbGVtZW50KS5ocmVmLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYWxsYmFjaylcbiAgICAgIGhpc3RvcnkucmVwbGFjZSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZU5hdmlnYXRpb25DaGFuZ2UsXG4gICAgICAgICAge1xuICAgICAgICAgICAgcmVwbGFjZTogYXJncyxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGhpc3RvcnkucHVzaCA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZU5hdmlnYXRpb25DaGFuZ2UsXG4gICAgICAgICAge1xuICAgICAgICAgICAgcHVzaDogYXJncyxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FsbGJhY2spXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbaGlzdG9yeSwgZ29sZGVuTGF5b3V0XSlcbiAgcmV0dXJuIG51bGxcbn1cblxuLyoqXG4gKiAgVGVsbHMgdGhlIG1haW4gd2luZG93IG9mIGdvbGRlbiBsYXlvdXQgdG8gbGlzdGVuIGZvciBuYXZpZ2F0aW9uIGNoYW5nZXMgaW4gdGhlIHN1YndpbmRvdy4gIFRoZXNlIGFyZSB0cmFuc2xhdGVkIHRvIGJlIGhhbmRsZWQgYnkgdGhlIG1haW4gd2luZG93IGluc3RlYWQuXG4gKiAgTm90aWNlIHdlIGF0dGFjaCB0aGlzIGluIHRoZSBzaW5nbGUgaW5zdGFuY2Ugb2YgZ2wsIG5vdCB0aGUgaW5kaXZpZHVhbCBjb21wb25lbnRzIGxpa2UgdGhlIHN1YndpbmRvd3Mgd2hvIHNlbmQgdGhlIGV2ZW50LlxuICovXG5jb25zdCB1c2VXaW5kb3dDb25zdW1lTmF2aWdhdGlvbkNoYW5nZSA9ICh7XG4gIGdvbGRlbkxheW91dCxcbiAgaXNJbml0aWFsaXplZCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgaXNJbml0aWFsaXplZDogYm9vbGVhblxufSkgPT4ge1xuICBjb25zdCBoaXN0b3J5ID0gdXNlSGlzdG9yeSgpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzSW5pdGlhbGl6ZWQgJiYgZ29sZGVuTGF5b3V0ICYmIGhpc3RvcnkgJiYgIWdvbGRlbkxheW91dC5pc1N1YldpbmRvdykge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSAocGFyYW1zOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKHBhcmFtcy5ocmVmICYmIHBhcmFtcy5ocmVmLnN0YXJ0c1dpdGgoJ2h0dHAnKSkge1xuICAgICAgICAgIC8vIGRpZG4ndCBub3Qgc2VlIGEgd2F5IHRvIGhhbmRsZSBmdWxsIHVybHMgd2l0aCByZWFjdCByb3V0ZXIgZG9tLCBidXQgbG9jYXRpb24gd29ya3MganVzdCBhcyB3ZWxsIEkgdGhpbmtcbiAgICAgICAgICBsb2NhdGlvbiA9IHBhcmFtcy5ocmVmXG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLmhyZWYpIHtcbiAgICAgICAgICBoaXN0b3J5LmxvY2F0aW9uID0gcGFyYW1zLmhyZWZcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMucmVwbGFjZSkge1xuICAgICAgICAgIGhpc3RvcnkucmVwbGFjZS5hcHBseSh1bmRlZmluZWQsIHBhcmFtcy5yZXBsYWNlKVxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5wdXNoKSB7XG4gICAgICAgICAgaGlzdG9yeS5wdXNoLmFwcGx5KHVuZGVmaW5lZCwgcGFyYW1zLnB1c2gpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vbihcbiAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lTmF2aWdhdGlvbkNoYW5nZSxcbiAgICAgICAgY2FsbGJhY2tcbiAgICAgIClcblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLm9mZihcbiAgICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLmNvbnN1bWVOYXZpZ2F0aW9uQ2hhbmdlLFxuICAgICAgICAgIGNhbGxiYWNrXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtoaXN0b3J5LCBnb2xkZW5MYXlvdXQsIGlzSW5pdGlhbGl6ZWRdKVxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCB1c2VMaXN0ZW5Ub0dvbGRlbkxheW91dFdpbmRvd0Nsb3NlZCA9ICh7XG4gIGdvbGRlbkxheW91dCxcbiAgaXNJbml0aWFsaXplZCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgaXNJbml0aWFsaXplZDogYm9vbGVhblxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQgJiYgaXNJbml0aWFsaXplZCAmJiAhZ29sZGVuTGF5b3V0LmlzU3ViV2luZG93KSB7XG4gICAgICBnb2xkZW5MYXlvdXQub24oJ3dpbmRvd0Nsb3NlZCcsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIC8vIG9yZGVyIG9mIGV2ZW50aW5nIGlzIGEgYml0IG9mZiBpbiBnb2xkZW4gbGF5b3V0LCBzbyB3ZSBuZWVkIHRvIHdhaXQgZm9yIHJlY29uY2lsaWF0aW9uIG9mIHdpbmRvd3MgdG8gYWN0dWFsbHkgZmluaXNoXG4gICAgICAgIC8vIHdoaWxlIGdsIGRvZXMgZW1pdCBhIHN0YXRlQ2hhbmdlZCwgaXQncyBtaXNzaW5nIGFuIGV2ZW50LCBhbmQgaXQncyBiZWZvcmUgdGhlIHBvcG91dHMgcmVjb25jaWxlXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGdvbGRlbkxheW91dC5lbWl0KCdzdGF0ZUNoYW5nZWQnLCBldmVudClcbiAgICAgICAgfSwgMClcbiAgICAgIH0pXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnb2xkZW5MYXlvdXQub2ZmKCd3aW5kb3dDbG9zZWQnKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2dvbGRlbkxheW91dCwgaXNJbml0aWFsaXplZF0pXG59XG5cbmV4cG9ydCBjb25zdCB1c2VDcm9zc1dpbmRvd0dvbGRlbkxheW91dENvbW11bmljYXRpb24gPSAoe1xuICBnb2xkZW5MYXlvdXQsXG4gIGlzSW5pdGlhbGl6ZWQsXG4gIG9wdGlvbnMsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG4gIGlzSW5pdGlhbGl6ZWQ6IGJvb2xlYW5cbiAgb3B0aW9uczogR29sZGVuTGF5b3V0Vmlld1Byb3BzXG59KSA9PiB7XG4gIGNvbnN0IGxhenlSZXN1bHRzID0gdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlKHtcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2U6IG9wdGlvbnMuc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuICB1c2VQcm92aWRlU3RhdGVDaGFuZ2Uoe1xuICAgIGdvbGRlbkxheW91dCxcbiAgICBsYXp5UmVzdWx0cyxcbiAgICBpc0luaXRpYWxpemVkLFxuICB9KVxuICB1c2VQcm92aWRlSW5pdGlhbFN0YXRlKHsgZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkLCBsYXp5UmVzdWx0cyB9KVxuICB1c2VDb25zdW1lSW5pdGlhbFN0YXRlKHsgZ29sZGVuTGF5b3V0LCBsYXp5UmVzdWx0cywgaXNJbml0aWFsaXplZCB9KVxuICB1c2VDb25zdW1lU3RhdGVDaGFuZ2UoeyBnb2xkZW5MYXlvdXQsIGxhenlSZXN1bHRzLCBpc0luaXRpYWxpemVkIH0pXG4gIHVzZUNvbnN1bWVQcmVmZXJlbmNlc0NoYW5nZSh7IGdvbGRlbkxheW91dCwgaXNJbml0aWFsaXplZCB9KVxuICB1c2VDb25zdW1lU3Vid2luZG93TGF5b3V0Q2hhbmdlKHsgZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkIH0pXG4gIHVzZUxpc3RlblRvR29sZGVuTGF5b3V0V2luZG93Q2xvc2VkKHsgZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkIH0pXG4gIHVzZVdpbmRvd0NvbnN1bWVOYXZpZ2F0aW9uQ2hhbmdlKHsgZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkIH0pXG4gIHVzZVByb3ZpZGVXcmVxckV2ZW50cyh7IGdvbGRlbkxheW91dCwgaXNJbml0aWFsaXplZCB9KVxuICB1c2VDb25zdW1lV3JlcXJFdmVudHMoeyBnb2xkZW5MYXlvdXQsIGlzSW5pdGlhbGl6ZWQgfSlcbn1cbiJdfQ==