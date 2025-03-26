import { __read } from "tslib";
import React from 'react';
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
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
 *  We could rewrite it as a hook and put it further down in the tree, but this is the same thing so no need.
 *
 *  Also notice we attach this at the visual level for that reason, rather than at the single golden layout instance level.
 */
export var UseSubwindowConsumeNavigationChange = function (_a) {
    var goldenLayout = _a.goldenLayout;
    React.useEffect(function () {
        if (goldenLayout && goldenLayout.isSubWindow) {
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
            return function () {
                document.removeEventListener('click', callback_1);
            };
        }
        return function () { };
    }, [goldenLayout]);
    return null;
};
/**
 *  Tells the main window of golden layout to listen for navigation changes in the subwindow.  These are translated to be handled by the main window instead.
 *  Notice we attach this in the single instance of gl, not the individual components like the subwindows who send the event.
 */
var useWindowConsumeNavigationChange = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized;
    var navigate = useNavigate();
    var location = useLocation();
    React.useEffect(function () {
        if (isInitialized &&
            goldenLayout &&
            navigate &&
            !goldenLayout.isSubWindow) {
            var callback_2 = function (params) {
                if (params.href && params.href.startsWith('http')) {
                    // didn't not see a way to handle full urls with react router dom, but location works just as well I think
                    window.location.href = params.href;
                }
                else if (params.href) {
                    navigate(params.href);
                }
                else if (params.replace) {
                    navigate(params.replace[0], params.replace[1]);
                }
                else if (params.push) {
                    navigate(params.push[0], params.push[1]);
                }
            };
            goldenLayout.eventHub.on(GoldenLayoutWindowCommunicationEvents.consumeNavigationChange, callback_2);
            return function () {
                goldenLayout.eventHub.off(GoldenLayoutWindowCommunicationEvents.consumeNavigationChange, callback_2);
            };
        }
        return function () { };
    }, [navigate, location, goldenLayout, isInitialized]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3Mtd2luZG93LWNvbW11bmljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2dvbGRlbi1sYXlvdXQvY3Jvc3Mtd2luZG93LWNvbW11bmljYXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLE1BQU0sOEJBQThCLENBQUE7QUFHbkYsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUMzRCxPQUFPLFVBQVUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN6QyxPQUFPLFlBQVksTUFBTSxvQkFBb0IsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDcEUsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEMsT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFBO0FBQ3hDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3hFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxRUFBcUUsQ0FBQTtBQUNoRyxPQUFPLEVBQUUsRUFBRSxJQUFJLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUVqQyxJQUFNLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQTtBQUV2Qjs7R0FFRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsU0FBaUI7SUFDekMsZ0JBQWdCO0lBQ2hCLElBQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRTlCLHdDQUF3QztJQUN4QyxJQUFNLFlBQVksR0FBRyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFD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QUFZLGNBQUEsRUFBRSxhQUFhLGVBQUEsRUFBRSxDQUFDLENBQUE7SUFDaEUsbUNBQW1DLENBQUMsRUFBRSxZQUFZLGNBQUEsRUFBRSxhQUFhLGVBQUEsRUFBRSxDQUFDLENBQUE7SUFDcEUsZ0NBQWdDLENBQUMsRUFBRSxZQUFZLGNBQUEsRUFBRSxhQUFhLGVBQUEsRUFBRSxDQUFDLENBQUE7SUFDakUscUJBQXFCLENBQUMsRUFBRSxZQUFZLGNBQUEsRUFBRSxhQUFhLGVBQUEsRUFBRSxDQUFDLENBQUE7SUFDdEQscUJBQXFCLENBQUMsRUFBRSxZQUFZLGNBQUEsRUFBRSxhQUFhLGVBQUEsRUFBRSxDQUFDLENBQUE7QUFDeEQsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWludGVyZmFjZS9ob29rcydcbmltcG9ydCB0eXBlIHsgR29sZGVuTGF5b3V0Vmlld1Byb3BzIH0gZnJvbSAnLi9nb2xkZW4tbGF5b3V0LnZpZXcnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHRzIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdHMnXG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSwgdXNlTG9jYXRpb24gfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xuaW1wb3J0IF9jbG9uZURlZXAgZnJvbSAnbG9kYXNoLmNsb25lZGVlcCdcbmltcG9ydCBfaXNFcXVhbFdpdGggZnJvbSAnbG9kYXNoLmlzZXF1YWx3aXRoJ1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi9zaW5nbGV0b25zL1R5cGVkVXNlcidcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vanMvd3JlcXInXG5pbXBvcnQgR29sZGVuTGF5b3V0IGZyb20gJ2dvbGRlbi1sYXlvdXQnXG5pbXBvcnQgeyBnZXRSb290Q29sdW1uQ29udGVudCwgcm9vdElzTm90QUNvbHVtbiB9IGZyb20gJy4vc3RhY2stdG9vbGJhcidcbmltcG9ydCB7IHVuTWF4aW1pemUgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdmlzdWFsaXphdGlvbi1zZWxlY3Rvci92aXN1YWxpemF0aW9uLXNlbGVjdG9yJ1xuaW1wb3J0IHsgdjQgYXMgdXVpZCB9IGZyb20gJ3V1aWQnXG5cbmNvbnN0IHdpbmRvd0lkID0gdXVpZCgpXG5cbi8qKlxuICogIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBleHRyYWN0IHRoZSAnZ2wtd2luZG93JyBwYXJhbWV0ZXIgZnJvbSB0aGUgVVJMIHRoYXQgd2FzIG1hZGUgYnkgdGhlIGdvbGRlbiBsYXlvdXQgbGlicmFyeVxuICovXG5mdW5jdGlvbiBnZXRHTFdpbmRvd1BhcmFtKHVybFN0cmluZzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIC8vIFBhcnNlIHRoZSBVUkxcbiAgY29uc3QgdXJsID0gbmV3IFVSTCh1cmxTdHJpbmcpXG5cbiAgLy8gQ2hlY2sgJ2dsLXdpbmRvdycgaW4gdGhlIHF1ZXJ5IHN0cmluZ1xuICBjb25zdCBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHVybC5zZWFyY2gpXG4gIGlmIChzZWFyY2hQYXJhbXMuaGFzKCdnbC13aW5kb3cnKSkge1xuICAgIHJldHVybiBzZWFyY2hQYXJhbXMuZ2V0KCdnbC13aW5kb3cnKVxuICB9XG5cbiAgLy8gQ2hlY2sgJ2dsLXdpbmRvdycgaW4gdGhlIGZyYWdtZW50IChoYXNoKVxuICBpZiAodXJsLmhhc2gpIHtcbiAgICBjb25zdCBoYXNoID0gdXJsLmhhc2guc3Vic3RyaW5nKDEpIC8vIFJlbW92ZSB0aGUgbGVhZGluZyAnIydcblxuICAgIC8vIElmIHRoZSBoYXNoIGNvbnRhaW5zIGEgcGF0aCBmb2xsb3dlZCBieSBxdWVyeSBwYXJhbWV0ZXJzXG4gICAgY29uc3QgaGFzaEluZGV4ID0gaGFzaC5pbmRleE9mKCc/JylcbiAgICBpZiAoaGFzaEluZGV4ICE9PSAtMSkge1xuICAgICAgY29uc3QgaGFzaFF1ZXJ5U3RyaW5nID0gaGFzaC5zdWJzdHJpbmcoaGFzaEluZGV4ICsgMSlcbiAgICAgIGNvbnN0IGhhc2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGhhc2hRdWVyeVN0cmluZylcbiAgICAgIGlmIChoYXNoUGFyYW1zLmhhcygnZ2wtd2luZG93JykpIHtcbiAgICAgICAgcmV0dXJuIGhhc2hQYXJhbXMuZ2V0KCdnbC13aW5kb3cnKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlIGhhc2ggaXRzZWxmIGlzIGEgcXVlcnkgc3RyaW5nXG4gICAgICBjb25zdCBoYXNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhoYXNoKVxuICAgICAgaWYgKGhhc2hQYXJhbXMuaGFzKCdnbC13aW5kb3cnKSkge1xuICAgICAgICByZXR1cm4gaGFzaFBhcmFtcy5nZXQoJ2dsLXdpbmRvdycpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJuIG51bGwgaWYgJ2dsLXdpbmRvdycgaXMgbm90IGZvdW5kXG4gIHJldHVybiBudWxsXG59XG5cbi8qKlxuICogIFRoaXMgcGF0Y2hlcyB0aGUgcG9wb3V0IHVybCB0aGF0IGdvbGRlbiBsYXlvdXQgY3JlYXRlcyBzbyB0aGF0IGl0IGdvZXMgdG8gdGhlIHBvcG91dCBzcGVjaWZpYyByb3V0ZSwgcmF0aGVyIHRoYW4gdGhlIGN1cnJlbnQgcm91dGUsIHdoaWNoIGNhbiBoYXZlIHNpZGUgZWZmZWN0cy5cbiAqICBOb3RpY2Ugd2UgaGF2ZSB0byBncmFiIHRoZSB3aW5kb3cgcGFyYW0gYW5kIHJlYXR0YWNoIGl0LlxuICovXG5mdW5jdGlvbiBwYXRjaENyZWF0ZVVybCgpIHtcbiAgY29uc3Qgb2xkQ3JlYXRlVXJsID0gKEdvbGRlbkxheW91dCBhcyBhbnkpLl9fbG0uY29udHJvbHMuQnJvd3NlclBvcG91dFxuICAgIC5wcm90b3R5cGUuX2NyZWF0ZVVybFxuICA7KEdvbGRlbkxheW91dCBhcyBhbnkpLl9fbG0uY29udHJvbHMuQnJvd3NlclBvcG91dC5wcm90b3R5cGUuX2NyZWF0ZVVybCA9XG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3Qgb2xkQ3JlYXRlZFVybCA9IG9sZENyZWF0ZVVybC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICBjb25zdCBnbFdpbmRvd1BhcmFtID0gZ2V0R0xXaW5kb3dQYXJhbShvbGRDcmVhdGVkVXJsKVxuICAgICAgLy8gZGV0ZXJtaW5lIGlmID9nbC13aW5kb3c9JyBvciAmZ2wtd2luZG93PSwgdGhlbiByZWRvIHRoZSBmaXJzdCBwYXJ0IGFuZCB0YWNrIHRoYXQgcGFydCBvblxuICAgICAgY29uc3QgbmV3Q3JlYXRlZFVybCA9XG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLm9yaWdpbiArXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lICtcbiAgICAgICAgJyMvX2dsX3BvcG91dD9nbC13aW5kb3c9JyArXG4gICAgICAgIGdsV2luZG93UGFyYW1cbiAgICAgIHJldHVybiBuZXdDcmVhdGVkVXJsXG4gICAgfVxufVxucGF0Y2hDcmVhdGVVcmwoKVxuXG4vKipcbiAqICBUaGUgcG9waW4gZnVuY3Rpb24gaW4gZ29sZGVuIGxheW91dCBoYXMgaXNzdWVzLCBwYXJ0aWN1bGFybHkgd2hlbiB0aGVyZSBpcyBhIHNpbmdsZSBzdGFjayBpbiB0aGUgbWFpbiB3aW5kb3cgYXQgcm9vdC5cbiAqICBJdCBhbHNvLCBsaWtlIG1hbnkgb3RoZXIgdGhpbmdzIGluIGdvbGRlbiBsYXlvdXQsIGRvZXNuJ3QgcGxheSB3ZWxsIHdpdGggbWF4aW1pemUuXG4gKlxuICogIFRoaXMgcGF0Y2ggZGV0ZWN0cyBtYXhpbWl6ZSBhbmQgcmVtb3ZlcyBpdCAoc2luY2UgaXQgZG9lc24ndCBtYWtlIHNlbnNlIHdoZW4gcG9wcGluZyBpbilcbiAqICBJdCBhbHNvIGRldGVjdHMgaWYgdGhlIHJvb3QgaXMgbm90IGEgY29sdW1uLCBhbmQgaWYgc28sIG1ha2VzIGl0IGEgY29sdW1uIHNvIHRoYXQgcG9waW4gd29ya3MgaW4gYWxsIGNhc2VzLlxuICovXG5mdW5jdGlvbiBwYXRjaFBvcGluRnVuY3Rpb24oKSB7XG4gIGNvbnN0IG9sZFBvcGluID0gKEdvbGRlbkxheW91dCBhcyBhbnkpLl9fbG0uY29udHJvbHMuQnJvd3NlclBvcG91dC5wcm90b3R5cGVcbiAgICAucG9wSW5cbiAgOyhHb2xkZW5MYXlvdXQgYXMgYW55KS5fX2xtLmNvbnRyb2xzLkJyb3dzZXJQb3BvdXQucHJvdG90eXBlLnBvcEluID1cbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBnb2xkZW5MYXlvdXRSb290ID0gdGhpcy5fbGF5b3V0TWFuYWdlci5yb290XG4gICAgICB1bk1heGltaXplKGdvbGRlbkxheW91dFJvb3QpXG4gICAgICBpZiAocm9vdElzTm90QUNvbHVtbihnb2xkZW5MYXlvdXRSb290KSkge1xuICAgICAgICBjb25zdCBleGlzdGluZ1Jvb3RDb250ZW50ID0gZ2V0Um9vdENvbHVtbkNvbnRlbnQoZ29sZGVuTGF5b3V0Um9vdClcbiAgICAgICAgZ29sZGVuTGF5b3V0Um9vdC5yZW1vdmVDaGlsZChleGlzdGluZ1Jvb3RDb250ZW50IGFzIGFueSwgdHJ1ZSkgLy8gZm9yIHNvbWUgcmVhc29uIHJlbW92ZUNoaWxkIGlzIG92ZXJseSByZXN0cmljdGl2ZSBvbiB0eXBlIG9mIFwidGhpbmdcIiBzbyB3ZSBoYXZlIHRvIGNhc3RcblxuICAgICAgICAvLyB3ZSBuZWVkIGEgY29sdW1uIGZvciBtaW5pbWl6ZSB0byB3b3JrLCBzbyBtYWtlIGEgbmV3IGNvbHVtbiBhbmQgYWRkIHRoZSBleGlzdGluZyByb290IHRvIGl0XG4gICAgICAgIGNvbnN0IG5ld0NvbHVtbkl0ZW0gPSB0aGlzLl9sYXlvdXRNYW5hZ2VyLl8kbm9ybWFsaXplQ29udGVudEl0ZW0oe1xuICAgICAgICAgIHR5cGU6ICdjb2x1bW4nLFxuICAgICAgICB9KVxuICAgICAgICBuZXdDb2x1bW5JdGVtLmFkZENoaWxkKGV4aXN0aW5nUm9vdENvbnRlbnQpXG4gICAgICAgIGdvbGRlbkxheW91dFJvb3QuYWRkQ2hpbGQobmV3Q29sdW1uSXRlbSlcbiAgICAgIH1cbiAgICAgIG9sZFBvcGluLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG59XG5wYXRjaFBvcGluRnVuY3Rpb24oKVxuXG5leHBvcnQgY29uc3QgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cyA9IHtcbiAgcmVxdWVzdEluaXRpYWxTdGF0ZTogJ3JlcXVlc3RJbml0aWFsU3RhdGUnLFxuICBjb25zdW1lSW5pdGlhbFN0YXRlOiAnY29uc3VtZUluaXRpYWxTdGF0ZScsXG4gIGNvbnN1bWVTdGF0ZUNoYW5nZTogJ2NvbnN1bWVTdGF0ZUNoYW5nZScsXG4gIGNvbnN1bWVQcmVmZXJlbmNlc0NoYW5nZTogJ2NvbnN1bWVQcmVmZXJlbmNlc0NoYW5nZScsXG4gIGNvbnN1bWVTdWJ3aW5kb3dMYXlvdXRDaGFuZ2U6ICdjb25zdW1lU3Vid2luZG93TGF5b3V0Q2hhbmdlJyxcbiAgY29uc3VtZU5hdmlnYXRpb25DaGFuZ2U6ICdjb25zdW1lTmF2aWdhdGlvbkNoYW5nZScsXG4gIGNvbnN1bWVXcmVxckV2ZW50OiAnY29uc3VtZVdyZXFyRXZlbnQnLFxufVxuXG5jb25zdCB1c2VQcm92aWRlU3RhdGVDaGFuZ2UgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG4gIGxhenlSZXN1bHRzLFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzSW5pdGlhbGl6ZWQgJiYgZ29sZGVuTGF5b3V0ICYmIGxhenlSZXN1bHRzKSB7XG4gICAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLl9jaGlsZEV2ZW50U291cmNlID0gbnVsbFxuICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIuZW1pdChcbiAgICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLmNvbnN1bWVTdGF0ZUNoYW5nZSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYXp5UmVzdWx0cyxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsdGVyZWRSZXN1bHRzU3Vic2NyaXB0aW9uID0gbGF6eVJlc3VsdHMuc3Vic2NyaWJlVG8oe1xuICAgICAgICBzdWJzY3JpYmFibGVUaGluZzogJ2ZpbHRlcmVkUmVzdWx0cycsXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IHNlbGVjdGVkUmVzdWx0c1N1YnNjcmlwdGlvbiA9IGxhenlSZXN1bHRzLnN1YnNjcmliZVRvKHtcbiAgICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdzZWxlY3RlZFJlc3VsdHMnLFxuICAgICAgICBjYWxsYmFjayxcbiAgICAgIH0pXG4gICAgICBjb25zdCBzdGF0dXNTdWJzY3JpcHRpb24gPSBsYXp5UmVzdWx0cy5zdWJzY3JpYmVUbyh7XG4gICAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnc3RhdHVzJyxcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICB9KVxuICAgICAgY29uc3QgZmlsdGVyVHJlZVN1YnNjcmlwdGlvbiA9IGxhenlSZXN1bHRzLnN1YnNjcmliZVRvKHtcbiAgICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICB9KVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZmlsdGVyZWRSZXN1bHRzU3Vic2NyaXB0aW9uKClcbiAgICAgICAgc2VsZWN0ZWRSZXN1bHRzU3Vic2NyaXB0aW9uKClcbiAgICAgICAgc3RhdHVzU3Vic2NyaXB0aW9uKClcbiAgICAgICAgZmlsdGVyVHJlZVN1YnNjcmlwdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbbGF6eVJlc3VsdHMsIGxhenlSZXN1bHRzPy5yZXN1bHRzLCBpc0luaXRpYWxpemVkLCBnb2xkZW5MYXlvdXRdKVxufVxuXG5jb25zdCB1c2VQcm92aWRlSW5pdGlhbFN0YXRlID0gKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBpc0luaXRpYWxpemVkLFxuICBsYXp5UmVzdWx0cyxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgaXNJbml0aWFsaXplZDogYm9vbGVhblxuICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChcbiAgICAgIGlzSW5pdGlhbGl6ZWQgJiZcbiAgICAgIGdvbGRlbkxheW91dCAmJlxuICAgICAgbGF6eVJlc3VsdHMgJiZcbiAgICAgICFnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3dcbiAgICApIHtcbiAgICAgIGNvbnN0IGhhbmRsZUluaXRpYWxpemVTdGF0ZSA9ICgpID0+IHtcbiAgICAgICAgLy8gZ29sZGVuIGxheW91dCBkb2Vzbid0IHByb3Blcmx5IGNsZWFyIHRoaXMgZmxhZ1xuICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIuX2NoaWxkRXZlbnRTb3VyY2UgPSBudWxsXG4gICAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZUluaXRpYWxTdGF0ZSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYXp5UmVzdWx0cyxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLm9uKFxuICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLnJlcXVlc3RJbml0aWFsU3RhdGUsXG4gICAgICAgIGhhbmRsZUluaXRpYWxpemVTdGF0ZVxuICAgICAgKVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIub2ZmKFxuICAgICAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5yZXF1ZXN0SW5pdGlhbFN0YXRlXG4gICAgICAgICAgKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtpc0luaXRpYWxpemVkLCBnb2xkZW5MYXlvdXQsIGxhenlSZXN1bHRzLCBsYXp5UmVzdWx0cz8ucmVzdWx0c10pXG59XG5cbmNvbnN0IHVzZUNvbnN1bWVJbml0aWFsU3RhdGUgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG4gIGxhenlSZXN1bHRzLFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSA9PiB7XG4gIGNvbnN0IFtoYXNDb25zdW1lZEluaXRpYWxTdGF0ZSwgc2V0SGFzQ29uc3VtZWRJbml0aWFsU3RhdGVdID1cbiAgICBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChcbiAgICAgIGlzSW5pdGlhbGl6ZWQgJiZcbiAgICAgICFoYXNDb25zdW1lZEluaXRpYWxTdGF0ZSAmJlxuICAgICAgZ29sZGVuTGF5b3V0ICYmXG4gICAgICBsYXp5UmVzdWx0cyAmJlxuICAgICAgZ29sZGVuTGF5b3V0LmlzU3ViV2luZG93XG4gICAgKSB7XG4gICAgICBjb25zdCBvblN5bmNTdGF0ZUNhbGxiYWNrID0gKGV2ZW50RGF0YToge1xuICAgICAgICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xuICAgICAgfSkgPT4ge1xuICAgICAgICBzZXRIYXNDb25zdW1lZEluaXRpYWxTdGF0ZSh0cnVlKVxuICAgICAgICBsYXp5UmVzdWx0cy5yZXNldCh7XG4gICAgICAgICAgZmlsdGVyVHJlZTogZXZlbnREYXRhLmxhenlSZXN1bHRzLmZpbHRlclRyZWUsXG4gICAgICAgICAgcmVzdWx0czogT2JqZWN0LnZhbHVlcyhldmVudERhdGEubGF6eVJlc3VsdHMucmVzdWx0cykubWFwKChyZXN1bHQpID0+XG4gICAgICAgICAgICBfY2xvbmVEZWVwKHJlc3VsdC5wbGFpbilcbiAgICAgICAgICApLFxuICAgICAgICAgIGhpZ2hsaWdodHM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5oaWdobGlnaHRzLFxuICAgICAgICAgIHNvcnRzOiBldmVudERhdGEubGF6eVJlc3VsdHMucGVyc2lzdGFudFNvcnRzLFxuICAgICAgICAgIHNvdXJjZXM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5zb3VyY2VzLFxuICAgICAgICAgIHN0YXR1czogZXZlbnREYXRhLmxhenlSZXN1bHRzLnN0YXR1cyxcbiAgICAgICAgICBkaWRZb3VNZWFuRmllbGRzOiBldmVudERhdGEubGF6eVJlc3VsdHMuZGlkWW91TWVhbkZpZWxkcyxcbiAgICAgICAgICBzaG93aW5nUmVzdWx0c0ZvckZpZWxkczpcbiAgICAgICAgICAgIGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5zaG93aW5nUmVzdWx0c0ZvckZpZWxkcyxcbiAgICAgICAgfSlcbiAgICAgICAgbGF6eVJlc3VsdHMuX3Jlc2V0U2VsZWN0ZWRSZXN1bHRzKClcbiAgICAgICAgT2JqZWN0LnZhbHVlcyhldmVudERhdGEubGF6eVJlc3VsdHMuc2VsZWN0ZWRSZXN1bHRzKS5mb3JFYWNoKFxuICAgICAgICAgIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGxhenlSZXN1bHRzLnJlc3VsdHNbcmVzdWx0LnBsYWluLmlkXS5jb250cm9sU2VsZWN0KClcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLm9uKFxuICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLmNvbnN1bWVJbml0aWFsU3RhdGUsXG4gICAgICAgIG9uU3luY1N0YXRlQ2FsbGJhY2tcbiAgICAgIClcbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLnJlcXVlc3RJbml0aWFsU3RhdGUsXG4gICAgICAgIHt9XG4gICAgICApXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIub2ZmKFxuICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZUluaXRpYWxTdGF0ZSxcbiAgICAgICAgICBvblN5bmNTdGF0ZUNhbGxiYWNrXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtnb2xkZW5MYXlvdXQsIGxhenlSZXN1bHRzLCBpc0luaXRpYWxpemVkXSlcbn1cblxuY29uc3QgdXNlQ29uc3VtZVN0YXRlQ2hhbmdlID0gKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBsYXp5UmVzdWx0cyxcbiAgaXNJbml0aWFsaXplZCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgbGF6eVJlc3VsdHM6IExhenlRdWVyeVJlc3VsdHNcbiAgaXNJbml0aWFsaXplZDogYm9vbGVhblxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnb2xkZW5MYXlvdXQgJiYgbGF6eVJlc3VsdHMgJiYgaXNJbml0aWFsaXplZCkge1xuICAgICAgY29uc3Qgb25TeW5jU3RhdGVDYWxsYmFjayA9IChldmVudERhdGE6IHtcbiAgICAgICAgbGF6eVJlc3VsdHM6IExhenlRdWVyeVJlc3VsdHNcbiAgICAgIH0pID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IE9iamVjdC52YWx1ZXMobGF6eVJlc3VsdHMucmVzdWx0cykubWFwKChsYXp5UmVzdWx0KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBsYWluOiBsYXp5UmVzdWx0LnBsYWluLFxuICAgICAgICAgICAgaXNTZWxlY3RlZDogbGF6eVJlc3VsdC5pc1NlbGVjdGVkLFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgY2FsbGJhY2tSZXN1bHRzID0gT2JqZWN0LnZhbHVlcyhcbiAgICAgICAgICBldmVudERhdGEubGF6eVJlc3VsdHMucmVzdWx0c1xuICAgICAgICApLm1hcCgobGF6eVJlc3VsdCkgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwbGFpbjogbGF6eVJlc3VsdC5wbGFpbixcbiAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGxhenlSZXN1bHQuaXNTZWxlY3RlZCxcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGZpbHRlclRyZWUgPSBsYXp5UmVzdWx0cy5maWx0ZXJUcmVlXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrRmlsdGVyVHJlZSA9IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5maWx0ZXJUcmVlXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhX2lzRXF1YWxXaXRoKHJlc3VsdHMsIGNhbGxiYWNrUmVzdWx0cykgfHxcbiAgICAgICAgICAhX2lzRXF1YWxXaXRoKGZpbHRlclRyZWUsIGNhbGxiYWNrRmlsdGVyVHJlZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgbGF6eVJlc3VsdHMucmVzZXQoe1xuICAgICAgICAgICAgZmlsdGVyVHJlZTogZXZlbnREYXRhLmxhenlSZXN1bHRzLmZpbHRlclRyZWUsXG4gICAgICAgICAgICByZXN1bHRzOiBPYmplY3QudmFsdWVzKGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5yZXN1bHRzKS5tYXAoXG4gICAgICAgICAgICAgIChyZXN1bHQpID0+IF9jbG9uZURlZXAocmVzdWx0LnBsYWluKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGhpZ2hsaWdodHM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5oaWdobGlnaHRzLFxuICAgICAgICAgICAgc29ydHM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5wZXJzaXN0YW50U29ydHMsXG4gICAgICAgICAgICBzb3VyY2VzOiBldmVudERhdGEubGF6eVJlc3VsdHMuc291cmNlcyxcbiAgICAgICAgICAgIHN0YXR1czogZXZlbnREYXRhLmxhenlSZXN1bHRzLnN0YXR1cyxcbiAgICAgICAgICAgIGRpZFlvdU1lYW5GaWVsZHM6IGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5kaWRZb3VNZWFuRmllbGRzLFxuICAgICAgICAgICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHM6XG4gICAgICAgICAgICAgIGV2ZW50RGF0YS5sYXp5UmVzdWx0cy5zaG93aW5nUmVzdWx0c0ZvckZpZWxkcyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGxhenlSZXN1bHRzLl9yZXNldFNlbGVjdGVkUmVzdWx0cygpXG4gICAgICAgICAgT2JqZWN0LnZhbHVlcyhldmVudERhdGEubGF6eVJlc3VsdHMuc2VsZWN0ZWRSZXN1bHRzKS5mb3JFYWNoKFxuICAgICAgICAgICAgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICBsYXp5UmVzdWx0cy5yZXN1bHRzW3Jlc3VsdC5wbGFpbi5pZF0uY29udHJvbFNlbGVjdCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vbihcbiAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lU3RhdGVDaGFuZ2UsXG4gICAgICAgIG9uU3luY1N0YXRlQ2FsbGJhY2tcbiAgICAgIClcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vZmYoXG4gICAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lU3RhdGVDaGFuZ2UsXG4gICAgICAgICAgb25TeW5jU3RhdGVDYWxsYmFja1xuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0LCBsYXp5UmVzdWx0cywgaXNJbml0aWFsaXplZF0pXG59XG5cbmNvbnN0IHVzZUNvbnN1bWVQcmVmZXJlbmNlc0NoYW5nZSA9ICh7XG4gIGdvbGRlbkxheW91dCxcbiAgaXNJbml0aWFsaXplZCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgaXNJbml0aWFsaXplZDogYm9vbGVhblxufSkgPT4ge1xuICB1c2VMaXN0ZW5UbyhUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLCAnc3luYycsICgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0ICYmIGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5lbWl0KFxuICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLmNvbnN1bWVQcmVmZXJlbmNlc0NoYW5nZSxcbiAgICAgICAge1xuICAgICAgICAgIHByZWZlcmVuY2VzOiBUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLnRvSlNPTigpLFxuICAgICAgICAgIGZyb21XaW5kb3dJZDogd2luZG93SWQsXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9XG4gIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCAmJiBpc0luaXRpYWxpemVkKSB7XG4gICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIub24oXG4gICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZVByZWZlcmVuY2VzQ2hhbmdlLFxuICAgICAgICAoe1xuICAgICAgICAgIHByZWZlcmVuY2VzLFxuICAgICAgICAgIGZyb21XaW5kb3dJZCxcbiAgICAgICAgfToge1xuICAgICAgICAgIHByZWZlcmVuY2VzOiBhbnlcbiAgICAgICAgICBmcm9tV2luZG93SWQ6IHN0cmluZ1xuICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgaWYgKHdpbmRvd0lkICE9PSBmcm9tV2luZG93SWQpIHtcbiAgICAgICAgICAgIFR5cGVkVXNlckluc3RhbmNlLnN5bmMocHJlZmVyZW5jZXMpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgICByZXR1cm4gKCkgPT4ge31cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtnb2xkZW5MYXlvdXQsIGlzSW5pdGlhbGl6ZWRdKVxufVxuXG5mdW5jdGlvbiB1c2VDb25zdW1lU3Vid2luZG93TGF5b3V0Q2hhbmdlKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCAmJiBpc0luaXRpYWxpemVkICYmICFnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cpIHtcbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vbihcbiAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lU3Vid2luZG93TGF5b3V0Q2hhbmdlLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgZ29sZGVuTGF5b3V0LmVtaXQoJ3N0YXRlQ2hhbmdlZCcsICdzdWJ3aW5kb3cnKVxuICAgICAgICB9XG4gICAgICApXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIub2ZmKFxuICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZVN1YndpbmRvd0xheW91dENoYW5nZVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkXSlcbn1cblxuLyoqXG4gKiAgTm90aWNlIHRoYXQgd2UgYXJlIG9ubHkgZm9yd2FyZGluZyBldmVudHMgdGhhdCBzdGFydCB3aXRoICdzZWFyY2gnIGZvciBub3csIGFzIHRoZXNlIGFyZSBkcmF3aW5nIGV2ZW50cy5cbiAqL1xuY29uc3QgdXNlUHJvdmlkZVdyZXFyRXZlbnRzID0gKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSA9PiB7XG4gIHVzZUxpc3RlblRvKFxuICAgIHdyZXFyLnZlbnQsXG4gICAgJ2FsbCcsXG4gICAgKGV2ZW50OiBzdHJpbmcsIGFyZ3M6IGFueSwgeyBkb05vdFByb3BhZ2F0ZSA9IGZhbHNlIH0gPSB7fSkgPT4ge1xuICAgICAgaWYgKGdvbGRlbkxheW91dCAmJiBpc0luaXRpYWxpemVkKSB7XG4gICAgICAgIGlmIChldmVudC5zdGFydHNXaXRoKCdzZWFyY2gnKSAmJiAhZG9Ob3RQcm9wYWdhdGUpIHtcbiAgICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIuX2NoaWxkRXZlbnRTb3VyY2UgPSBudWxsIC8vIGdvbGRlbiBsYXlvdXQgZG9lc24ndCBwcm9wZXJseSBjbGVhciB0aGlzIGZsYWdcbiAgICAgICAgICBnb2xkZW5MYXlvdXQuZXZlbnRIdWIuZW1pdChcbiAgICAgICAgICAgIEdvbGRlbkxheW91dFdpbmRvd0NvbW11bmljYXRpb25FdmVudHMuY29uc3VtZVdyZXFyRXZlbnQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgKVxufVxuXG5jb25zdCB1c2VDb25zdW1lV3JlcXJFdmVudHMgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG4gIGlzSW5pdGlhbGl6ZWQsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG4gIGlzSW5pdGlhbGl6ZWQ6IGJvb2xlYW5cbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZ29sZGVuTGF5b3V0ICYmIGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vbihcbiAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lV3JlcXJFdmVudCxcbiAgICAgICAgKHsgZXZlbnQsIGFyZ3MgfTogeyBldmVudDogc3RyaW5nOyBhcmdzOiBhbnlbXSB9KSA9PiB7XG4gICAgICAgICAgd3JlcXIudmVudC50cmlnZ2VyKGV2ZW50LCBhcmdzLCB7IGRvTm90UHJvcGFnYXRlOiB0cnVlIH0pXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vZmYoXG4gICAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lV3JlcXJFdmVudFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkXSlcbn1cblxuLyoqXG4gKiAgT3ZlcnJpZGVzIG5hdmlnYXRpb24gZnVuY3Rpb25hbGl0eSB3aXRoaW4gc3Vid2luZG93cyBvZiBnb2xkZW4gbGF5b3V0LCBzbyB0aGF0IG5hdmlnYXRpb24gaXMgaGFuZGxlZCBieSB0aGUgbWFpbiB3aW5kb3cuXG4gKlxuICogIFdlIGNvdWxkIHJld3JpdGUgaXQgYXMgYSBob29rIGFuZCBwdXQgaXQgZnVydGhlciBkb3duIGluIHRoZSB0cmVlLCBidXQgdGhpcyBpcyB0aGUgc2FtZSB0aGluZyBzbyBubyBuZWVkLlxuICpcbiAqICBBbHNvIG5vdGljZSB3ZSBhdHRhY2ggdGhpcyBhdCB0aGUgdmlzdWFsIGxldmVsIGZvciB0aGF0IHJlYXNvbiwgcmF0aGVyIHRoYW4gYXQgdGhlIHNpbmdsZSBnb2xkZW4gbGF5b3V0IGluc3RhbmNlIGxldmVsLlxuICovXG5leHBvcnQgY29uc3QgVXNlU3Vid2luZG93Q29uc3VtZU5hdmlnYXRpb25DaGFuZ2UgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCAmJiBnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cpIHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGUudGFyZ2V0Py5jb25zdHJ1Y3RvciA9PT0gSFRNTEFuY2hvckVsZW1lbnQgJiZcbiAgICAgICAgICAhKGUudGFyZ2V0IGFzIEhUTUxBbmNob3JFbGVtZW50KT8uaHJlZi5zdGFydHNXaXRoKCdibG9iJylcbiAgICAgICAgKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLmVtaXQoXG4gICAgICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLmNvbnN1bWVOYXZpZ2F0aW9uQ2hhbmdlLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBocmVmOiAoZS50YXJnZXQgYXMgSFRNTEFuY2hvckVsZW1lbnQpLmhyZWYsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrKVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYWxsYmFjaylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtnb2xkZW5MYXlvdXRdKVxuICByZXR1cm4gbnVsbFxufVxuXG4vKipcbiAqICBUZWxscyB0aGUgbWFpbiB3aW5kb3cgb2YgZ29sZGVuIGxheW91dCB0byBsaXN0ZW4gZm9yIG5hdmlnYXRpb24gY2hhbmdlcyBpbiB0aGUgc3Vid2luZG93LiAgVGhlc2UgYXJlIHRyYW5zbGF0ZWQgdG8gYmUgaGFuZGxlZCBieSB0aGUgbWFpbiB3aW5kb3cgaW5zdGVhZC5cbiAqICBOb3RpY2Ugd2UgYXR0YWNoIHRoaXMgaW4gdGhlIHNpbmdsZSBpbnN0YW5jZSBvZiBnbCwgbm90IHRoZSBpbmRpdmlkdWFsIGNvbXBvbmVudHMgbGlrZSB0aGUgc3Vid2luZG93cyB3aG8gc2VuZCB0aGUgZXZlbnQuXG4gKi9cbmNvbnN0IHVzZVdpbmRvd0NvbnN1bWVOYXZpZ2F0aW9uQ2hhbmdlID0gKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSA9PiB7XG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKVxuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChcbiAgICAgIGlzSW5pdGlhbGl6ZWQgJiZcbiAgICAgIGdvbGRlbkxheW91dCAmJlxuICAgICAgbmF2aWdhdGUgJiZcbiAgICAgICFnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3dcbiAgICApIHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gKHBhcmFtczogYW55KSA9PiB7XG4gICAgICAgIGlmIChwYXJhbXMuaHJlZiAmJiBwYXJhbXMuaHJlZi5zdGFydHNXaXRoKCdodHRwJykpIHtcbiAgICAgICAgICAvLyBkaWRuJ3Qgbm90IHNlZSBhIHdheSB0byBoYW5kbGUgZnVsbCB1cmxzIHdpdGggcmVhY3Qgcm91dGVyIGRvbSwgYnV0IGxvY2F0aW9uIHdvcmtzIGp1c3QgYXMgd2VsbCBJIHRoaW5rXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBwYXJhbXMuaHJlZlxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5ocmVmKSB7XG4gICAgICAgICAgbmF2aWdhdGUocGFyYW1zLmhyZWYpXG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLnJlcGxhY2UpIHtcbiAgICAgICAgICBuYXZpZ2F0ZShwYXJhbXMucmVwbGFjZVswXSwgcGFyYW1zLnJlcGxhY2VbMV0pXG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLnB1c2gpIHtcbiAgICAgICAgICBuYXZpZ2F0ZShwYXJhbXMucHVzaFswXSwgcGFyYW1zLnB1c2hbMV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGdvbGRlbkxheW91dC5ldmVudEh1Yi5vbihcbiAgICAgICAgR29sZGVuTGF5b3V0V2luZG93Q29tbXVuaWNhdGlvbkV2ZW50cy5jb25zdW1lTmF2aWdhdGlvbkNoYW5nZSxcbiAgICAgICAgY2FsbGJhY2tcbiAgICAgIClcblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZ29sZGVuTGF5b3V0LmV2ZW50SHViLm9mZihcbiAgICAgICAgICBHb2xkZW5MYXlvdXRXaW5kb3dDb21tdW5pY2F0aW9uRXZlbnRzLmNvbnN1bWVOYXZpZ2F0aW9uQ2hhbmdlLFxuICAgICAgICAgIGNhbGxiYWNrXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtuYXZpZ2F0ZSwgbG9jYXRpb24sIGdvbGRlbkxheW91dCwgaXNJbml0aWFsaXplZF0pXG4gIHJldHVybiBudWxsXG59XG5cbmNvbnN0IHVzZUxpc3RlblRvR29sZGVuTGF5b3V0V2luZG93Q2xvc2VkID0gKHtcbiAgZ29sZGVuTGF5b3V0LFxuICBpc0luaXRpYWxpemVkLFxufToge1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBpc0luaXRpYWxpemVkOiBib29sZWFuXG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdvbGRlbkxheW91dCAmJiBpc0luaXRpYWxpemVkICYmICFnb2xkZW5MYXlvdXQuaXNTdWJXaW5kb3cpIHtcbiAgICAgIGdvbGRlbkxheW91dC5vbignd2luZG93Q2xvc2VkJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgLy8gb3JkZXIgb2YgZXZlbnRpbmcgaXMgYSBiaXQgb2ZmIGluIGdvbGRlbiBsYXlvdXQsIHNvIHdlIG5lZWQgdG8gd2FpdCBmb3IgcmVjb25jaWxpYXRpb24gb2Ygd2luZG93cyB0byBhY3R1YWxseSBmaW5pc2hcbiAgICAgICAgLy8gd2hpbGUgZ2wgZG9lcyBlbWl0IGEgc3RhdGVDaGFuZ2VkLCBpdCdzIG1pc3NpbmcgYW4gZXZlbnQsIGFuZCBpdCdzIGJlZm9yZSB0aGUgcG9wb3V0cyByZWNvbmNpbGVcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgZ29sZGVuTGF5b3V0LmVtaXQoJ3N0YXRlQ2hhbmdlZCcsIGV2ZW50KVxuICAgICAgICB9LCAwKVxuICAgICAgfSlcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGdvbGRlbkxheW91dC5vZmYoJ3dpbmRvd0Nsb3NlZCcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkXSlcbn1cblxuZXhwb3J0IGNvbnN0IHVzZUNyb3NzV2luZG93R29sZGVuTGF5b3V0Q29tbXVuaWNhdGlvbiA9ICh7XG4gIGdvbGRlbkxheW91dCxcbiAgaXNJbml0aWFsaXplZCxcbiAgb3B0aW9ucyxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgaXNJbml0aWFsaXplZDogYm9vbGVhblxuICBvcHRpb25zOiBHb2xkZW5MYXlvdXRWaWV3UHJvcHNcbn0pID0+IHtcbiAgY29uc3QgbGF6eVJlc3VsdHMgPSB1c2VMYXp5UmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2Uoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZTogb3B0aW9ucy5zZWxlY3Rpb25JbnRlcmZhY2UsXG4gIH0pXG4gIHVzZVByb3ZpZGVTdGF0ZUNoYW5nZSh7XG4gICAgZ29sZGVuTGF5b3V0LFxuICAgIGxhenlSZXN1bHRzLFxuICAgIGlzSW5pdGlhbGl6ZWQsXG4gIH0pXG4gIHVzZVByb3ZpZGVJbml0aWFsU3RhdGUoeyBnb2xkZW5MYXlvdXQsIGlzSW5pdGlhbGl6ZWQsIGxhenlSZXN1bHRzIH0pXG4gIHVzZUNvbnN1bWVJbml0aWFsU3RhdGUoeyBnb2xkZW5MYXlvdXQsIGxhenlSZXN1bHRzLCBpc0luaXRpYWxpemVkIH0pXG4gIHVzZUNvbnN1bWVTdGF0ZUNoYW5nZSh7IGdvbGRlbkxheW91dCwgbGF6eVJlc3VsdHMsIGlzSW5pdGlhbGl6ZWQgfSlcbiAgdXNlQ29uc3VtZVByZWZlcmVuY2VzQ2hhbmdlKHsgZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkIH0pXG4gIHVzZUNvbnN1bWVTdWJ3aW5kb3dMYXlvdXRDaGFuZ2UoeyBnb2xkZW5MYXlvdXQsIGlzSW5pdGlhbGl6ZWQgfSlcbiAgdXNlTGlzdGVuVG9Hb2xkZW5MYXlvdXRXaW5kb3dDbG9zZWQoeyBnb2xkZW5MYXlvdXQsIGlzSW5pdGlhbGl6ZWQgfSlcbiAgdXNlV2luZG93Q29uc3VtZU5hdmlnYXRpb25DaGFuZ2UoeyBnb2xkZW5MYXlvdXQsIGlzSW5pdGlhbGl6ZWQgfSlcbiAgdXNlUHJvdmlkZVdyZXFyRXZlbnRzKHsgZ29sZGVuTGF5b3V0LCBpc0luaXRpYWxpemVkIH0pXG4gIHVzZUNvbnN1bWVXcmVxckV2ZW50cyh7IGdvbGRlbkxheW91dCwgaXNJbml0aWFsaXplZCB9KVxufVxuIl19