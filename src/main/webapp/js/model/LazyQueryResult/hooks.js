import { __assign, __read } from "tslib";
import * as React from 'react';
import _ from 'underscore';
/**
 * If a view cares about whether or not a lazy result is selected,
 * this will let them know.
 */
export var useSelectionOfLazyResult = function (_a) {
    var lazyResult = _a.lazyResult;
    var _b = __read(React.useState(lazyResult.isSelected), 2), isSelected = _b[0], setIsSelected = _b[1];
    React.useEffect(function () {
        setIsSelected(lazyResult.isSelected);
        var unsubscribe = lazyResult.subscribeTo({
            subscribableThing: 'selected',
            callback: function () {
                setIsSelected(lazyResult.isSelected);
            },
        });
        return function () {
            unsubscribe();
        };
    }, [lazyResult]);
    return isSelected;
};
/**
 * If a view cares about whether or not a lazy result is filtered,
 * this will let them know.
 */
export var useFilteredOfLazyResult = function (_a) {
    var lazyResult = _a.lazyResult;
    var _b = __read(React.useState(lazyResult.isFiltered), 2), isFiltered = _b[0], setIsFiltered = _b[1];
    React.useEffect(function () {
        var unsubscribe = lazyResult.subscribeTo({
            subscribableThing: 'filtered',
            callback: function () {
                setIsFiltered(lazyResult.isFiltered);
            },
        });
        return function () {
            unsubscribe();
        };
    }, [lazyResult]);
    return isFiltered;
};
/**
 * Used by clusters to respond quickly to changes they care about
 * (in other words the results in their cluster)
 */
export var useSelectionOfLazyResults = function (_a) {
    var lazyResults = _a.lazyResults;
    var cache = React.useRef({});
    var calculateIfSelected = React.useMemo(function () {
        return function () {
            var currentValues = Object.values(cache.current);
            var baseline = currentValues[0];
            var updateToIsSelected = baseline
                ? 'selected'
                : 'unselected';
            for (var i = 1; i <= currentValues.length - 1; i++) {
                if (baseline !== currentValues[i]) {
                    updateToIsSelected = 'partially';
                    break;
                }
            }
            return updateToIsSelected;
        };
    }, []);
    var debouncedUpdatedIsSelected = React.useMemo(function () {
        return _.debounce(function () {
            setIsSelected(calculateIfSelected());
        }, 100);
    }, []);
    var _b = __read(React.useState(calculateIfSelected()), 2), isSelected = _b[0], setIsSelected = _b[1];
    React.useEffect(function () {
        cache.current = lazyResults.reduce(function (blob, lazyResult) {
            blob[lazyResult['metacard.id']] = lazyResult.isSelected;
            return blob;
        }, {});
        setIsSelected(calculateIfSelected());
        var unsubscribeCalls = lazyResults.map(function (lazyResult) {
            return lazyResult.subscribeTo({
                subscribableThing: 'selected',
                callback: function () {
                    cache.current[lazyResult['metacard.id']] = lazyResult.isSelected;
                    debouncedUpdatedIsSelected();
                },
            });
        });
        return function () {
            unsubscribeCalls.forEach(function (unsubscribeCall) {
                unsubscribeCall();
            });
        };
    }, [lazyResults]);
    return isSelected;
};
var getSelectedResultsOfLazyResults = function (_a) {
    var lazyResults = _a.lazyResults;
    if (lazyResults) {
        return __assign({}, lazyResults.selectedResults);
    }
    return {};
};
/**
 * If a view cares about the entirety of what results are selected out
 * of a LazyQueryResults object, this will keep them up to date.
 *
 * This is overkill for most components, but needed for things like
 * the inspector.  Most other components will instead respond to changes
 * in a single result.
 */
export var useSelectedResults = function (_a) {
    var lazyResults = _a.lazyResults;
    var _b = __read(React.useState(getSelectedResultsOfLazyResults({ lazyResults: lazyResults })), 2), selectedResults = _b[0], setSelectedResults = _b[1];
    React.useEffect(function () {
        if (lazyResults) {
            var unsubscribeCall_1 = lazyResults.subscribeTo({
                subscribableThing: 'selectedResults',
                callback: function () {
                    setSelectedResults(getSelectedResultsOfLazyResults({ lazyResults: lazyResults }));
                },
            });
            return function () {
                unsubscribeCall_1();
            };
        }
        return function () { };
    }, [lazyResults]);
    return selectedResults;
};
var getStatusFromLazyResults = function (_a) {
    var lazyResults = _a.lazyResults;
    return {
        status: lazyResults.status,
        isSearching: lazyResults.isSearching,
        currentAsOf: lazyResults.currentAsOf,
    };
};
/**
 * If a view cares about the status of a LazyQueryResults object
 */
export var useStatusOfLazyResults = function (_a) {
    var lazyResults = _a.lazyResults;
    var _b = __read(React.useState(getStatusFromLazyResults({ lazyResults: lazyResults })), 2), status = _b[0], setStatus = _b[1];
    React.useEffect(function () {
        setStatus(getStatusFromLazyResults({ lazyResults: lazyResults }));
        var unsubscribeCall = lazyResults.subscribeTo({
            subscribableThing: 'status',
            callback: function () {
                setStatus(getStatusFromLazyResults({ lazyResults: lazyResults }));
            },
        });
        return function () {
            unsubscribeCall();
        };
    }, [lazyResults]);
    return status;
};
/**
 * If a view cares about the status of a LazyQueryResults object
 */
export var useFilterTreeOfLazyResults = function (_a) {
    var lazyResults = _a.lazyResults;
    var _b = __read(React.useState(lazyResults.filterTree), 2), filterTree = _b[0], setFilterTree = _b[1];
    React.useEffect(function () {
        setFilterTree(lazyResults.filterTree);
        var unsubscribeCall = lazyResults.subscribeTo({
            subscribableThing: 'filterTree',
            callback: function () {
                setFilterTree(lazyResults.filterTree);
            },
        });
        return function () {
            unsubscribeCall();
        };
    }, [lazyResults]);
    return filterTree;
};
/**
 *  Allow a view to rerender when the backbone model resyncs to the plain model
 */
export var useRerenderOnBackboneSync = function (_a) {
    var lazyResult = _a.lazyResult;
    var _b = __read(React.useState(Math.random()), 2), setRandomNumber = _b[1];
    React.useEffect(function () {
        setRandomNumber(Math.random());
        var unsubscribeCall = lazyResult
            ? lazyResult.subscribeTo({
                subscribableThing: 'backboneSync',
                callback: function () {
                    setRandomNumber(Math.random());
                },
            })
            : function () { };
        return function () {
            unsubscribeCall();
        };
    }, [lazyResult]);
};
//# sourceMappingURL=hooks.js.map