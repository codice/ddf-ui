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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L2hvb2tzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBRTFCOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxJQUFNLHdCQUF3QixHQUFHLFVBQUMsRUFJeEM7UUFIQyxVQUFVLGdCQUFBO0lBSUosSUFBQSxLQUFBLE9BQThCLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFBLEVBQWxFLFVBQVUsUUFBQSxFQUFFLGFBQWEsUUFBeUMsQ0FBQTtJQUN6RSxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNwQyxJQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQ3pDLGlCQUFpQixFQUFFLFVBQVU7WUFDN0IsUUFBUSxFQUFFO2dCQUNSLGFBQWEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDdEMsQ0FBQztTQUNGLENBQUMsQ0FBQTtRQUNGLE9BQU87WUFDTCxXQUFXLEVBQUUsQ0FBQTtRQUNmLENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7SUFDaEIsT0FBTyxVQUFVLENBQUE7QUFDbkIsQ0FBQyxDQUFBO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLElBQU0sdUJBQXVCLEdBQUcsVUFBQyxFQUl2QztRQUhDLFVBQVUsZ0JBQUE7SUFJSixJQUFBLEtBQUEsT0FBOEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUEsRUFBbEUsVUFBVSxRQUFBLEVBQUUsYUFBYSxRQUF5QyxDQUFBO0lBQ3pFLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQ3pDLGlCQUFpQixFQUFFLFVBQVU7WUFDN0IsUUFBUSxFQUFFO2dCQUNSLGFBQWEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDdEMsQ0FBQztTQUNGLENBQUMsQ0FBQTtRQUNGLE9BQU87WUFDTCxXQUFXLEVBQUUsQ0FBQTtRQUNmLENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7SUFDaEIsT0FBTyxVQUFVLENBQUE7QUFDbkIsQ0FBQyxDQUFBO0FBSUQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLElBQU0seUJBQXlCLEdBQUcsVUFBQyxFQUl6QztRQUhDLFdBQVcsaUJBQUE7SUFJWCxJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQWdDLENBQUMsQ0FBQTtJQUM1RCxJQUFNLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDeEMsT0FBTztZQUNMLElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ2xELElBQUksUUFBUSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUMvQixJQUFJLGtCQUFrQixHQUFHLFFBQVE7Z0JBQy9CLENBQUMsQ0FBQyxVQUFVO2dCQUNaLENBQUMsQ0FBRSxZQUFnRCxDQUFBO1lBQ3JELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbEQsSUFBSSxRQUFRLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNqQyxrQkFBa0IsR0FBRyxXQUFXLENBQUE7b0JBQ2hDLE1BQUs7aUJBQ047YUFDRjtZQUNELE9BQU8sa0JBQWtCLENBQUE7UUFDM0IsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sSUFBTSwwQkFBMEIsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUNoQixhQUFhLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFBO1FBQ3RDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUNULENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUVBLElBQUEsS0FBQSxPQUE4QixLQUFLLENBQUMsUUFBUSxDQUNoRCxtQkFBbUIsRUFBcUMsQ0FDekQsSUFBQSxFQUZNLFVBQVUsUUFBQSxFQUFFLGFBQWEsUUFFL0IsQ0FBQTtJQUVELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxLQUFLLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsVUFBVTtZQUNsRCxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQTtZQUN2RCxPQUFPLElBQUksQ0FBQTtRQUNiLENBQUMsRUFBRSxFQUFnQyxDQUFDLENBQUE7UUFDcEMsYUFBYSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtRQUNwQyxJQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxVQUFVO1lBQ2xELE9BQU8sVUFBVSxDQUFDLFdBQVcsQ0FBQztnQkFDNUIsaUJBQWlCLEVBQUUsVUFBVTtnQkFDN0IsUUFBUSxFQUFFO29CQUNSLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQTtvQkFDaEUsMEJBQTBCLEVBQUUsQ0FBQTtnQkFDOUIsQ0FBQzthQUNGLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTztZQUNMLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFDLGVBQWU7Z0JBQ3ZDLGVBQWUsRUFBRSxDQUFBO1lBQ25CLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtJQUNqQixPQUFPLFVBQVUsQ0FBQTtBQUNuQixDQUFDLENBQUE7QUFFRCxJQUFNLCtCQUErQixHQUFHLFVBQUMsRUFJeEM7UUFIQyxXQUFXLGlCQUFBO0lBSVgsSUFBSSxXQUFXLEVBQUU7UUFDZixvQkFDSyxXQUFXLENBQUMsZUFBZSxFQUMvQjtLQUNGO0lBQ0QsT0FBTyxFQUFFLENBQUE7QUFDWCxDQUFDLENBQUE7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxDQUFDLElBQU0sa0JBQWtCLEdBQUcsVUFBQyxFQUlsQztRQUhDLFdBQVcsaUJBQUE7SUFJTCxJQUFBLEtBQUEsT0FBd0MsS0FBSyxDQUFDLFFBQVEsQ0FDMUQsK0JBQStCLENBQUMsRUFBRSxXQUFXLGFBQUEsRUFBRSxDQUFDLENBQ2pELElBQUEsRUFGTSxlQUFlLFFBQUEsRUFBRSxrQkFBa0IsUUFFekMsQ0FBQTtJQUNELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFdBQVcsRUFBRTtZQUNmLElBQU0saUJBQWUsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO2dCQUM5QyxpQkFBaUIsRUFBRSxpQkFBaUI7Z0JBQ3BDLFFBQVEsRUFBRTtvQkFDUixrQkFBa0IsQ0FBQywrQkFBK0IsQ0FBQyxFQUFFLFdBQVcsYUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFBO2dCQUN0RSxDQUFDO2FBQ0YsQ0FBQyxDQUFBO1lBQ0YsT0FBTztnQkFDTCxpQkFBZSxFQUFFLENBQUE7WUFDbkIsQ0FBQyxDQUFBO1NBQ0Y7UUFDRCxPQUFPLGNBQU8sQ0FBQyxDQUFBO0lBQ2pCLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7SUFFakIsT0FBTyxlQUFlLENBQUE7QUFDeEIsQ0FBQyxDQUFBO0FBRUQsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBSWpDO1FBSEMsV0FBVyxpQkFBQTtJQUlYLE9BQU87UUFDTCxNQUFNLEVBQUUsV0FBVyxDQUFDLE1BQU07UUFDMUIsV0FBVyxFQUFFLFdBQVcsQ0FBQyxXQUFXO1FBQ3BDLFdBQVcsRUFBRSxXQUFXLENBQUMsV0FBVztLQUNyQyxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsSUFBTSxzQkFBc0IsR0FBRyxVQUFDLEVBSXRDO1FBSEMsV0FBVyxpQkFBQTtJQUlMLElBQUEsS0FBQSxPQUFzQixLQUFLLENBQUMsUUFBUSxDQUN4Qyx3QkFBd0IsQ0FBQyxFQUFFLFdBQVcsYUFBQSxFQUFFLENBQUMsQ0FDMUMsSUFBQSxFQUZNLE1BQU0sUUFBQSxFQUFFLFNBQVMsUUFFdkIsQ0FBQTtJQUNELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxTQUFTLENBQUMsd0JBQXdCLENBQUMsRUFBRSxXQUFXLGFBQUEsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNwRCxJQUFNLGVBQWUsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO1lBQzlDLGlCQUFpQixFQUFFLFFBQVE7WUFDM0IsUUFBUSxFQUFFO2dCQUNSLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLFdBQVcsYUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ3RELENBQUM7U0FDRixDQUFDLENBQUE7UUFDRixPQUFPO1lBQ0wsZUFBZSxFQUFFLENBQUE7UUFDbkIsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtJQUVqQixPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUMsQ0FBQTtBQUVEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLElBQU0sMEJBQTBCLEdBQUcsVUFBQyxFQUkxQztRQUhDLFdBQVcsaUJBQUE7SUFJTCxJQUFBLEtBQUEsT0FBOEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUEsRUFBbkUsVUFBVSxRQUFBLEVBQUUsYUFBYSxRQUEwQyxDQUFBO0lBQzFFLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxhQUFhLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ3JDLElBQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUM7WUFDOUMsaUJBQWlCLEVBQUUsWUFBWTtZQUMvQixRQUFRLEVBQUU7Z0JBQ1IsYUFBYSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUN2QyxDQUFDO1NBQ0YsQ0FBQyxDQUFBO1FBQ0YsT0FBTztZQUNMLGVBQWUsRUFBRSxDQUFBO1FBQ25CLENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7SUFFakIsT0FBTyxVQUFVLENBQUE7QUFDbkIsQ0FBQyxDQUFBO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsSUFBTSx5QkFBeUIsR0FBRyxVQUFDLEVBSXpDO1FBSEMsVUFBVSxnQkFBQTtJQUlKLElBQUEsS0FBQSxPQUFzQixLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFBLEVBQWhELGVBQWUsUUFBaUMsQ0FBQTtJQUN6RCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBQzlCLElBQU0sZUFBZSxHQUFHLFVBQVU7WUFDaEMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7Z0JBQ3JCLGlCQUFpQixFQUFFLGNBQWM7Z0JBQ2pDLFFBQVEsRUFBRTtvQkFDUixlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7Z0JBQ2hDLENBQUM7YUFDRixDQUFDO1lBQ0osQ0FBQyxDQUFDLGNBQU8sQ0FBQyxDQUFBO1FBQ1osT0FBTztZQUNMLGVBQWUsRUFBRSxDQUFBO1FBQ25CLENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7QUFDbEIsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdHMgfSBmcm9tICcuL0xhenlRdWVyeVJlc3VsdHMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG4vKipcbiAqIElmIGEgdmlldyBjYXJlcyBhYm91dCB3aGV0aGVyIG9yIG5vdCBhIGxhenkgcmVzdWx0IGlzIHNlbGVjdGVkLFxuICogdGhpcyB3aWxsIGxldCB0aGVtIGtub3cuXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VTZWxlY3Rpb25PZkxhenlSZXN1bHQgPSAoe1xuICBsYXp5UmVzdWx0LFxufToge1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbn0pID0+IHtcbiAgY29uc3QgW2lzU2VsZWN0ZWQsIHNldElzU2VsZWN0ZWRdID0gUmVhY3QudXNlU3RhdGUobGF6eVJlc3VsdC5pc1NlbGVjdGVkKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldElzU2VsZWN0ZWQobGF6eVJlc3VsdC5pc1NlbGVjdGVkKVxuICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gbGF6eVJlc3VsdC5zdWJzY3JpYmVUbyh7XG4gICAgICBzdWJzY3JpYmFibGVUaGluZzogJ3NlbGVjdGVkJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHNldElzU2VsZWN0ZWQobGF6eVJlc3VsdC5pc1NlbGVjdGVkKVxuICAgICAgfSxcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB1bnN1YnNjcmliZSgpXG4gICAgfVxuICB9LCBbbGF6eVJlc3VsdF0pXG4gIHJldHVybiBpc1NlbGVjdGVkXG59XG5cbi8qKlxuICogSWYgYSB2aWV3IGNhcmVzIGFib3V0IHdoZXRoZXIgb3Igbm90IGEgbGF6eSByZXN1bHQgaXMgZmlsdGVyZWQsXG4gKiB0aGlzIHdpbGwgbGV0IHRoZW0ga25vdy5cbiAqL1xuZXhwb3J0IGNvbnN0IHVzZUZpbHRlcmVkT2ZMYXp5UmVzdWx0ID0gKHtcbiAgbGF6eVJlc3VsdCxcbn06IHtcbiAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG59KSA9PiB7XG4gIGNvbnN0IFtpc0ZpbHRlcmVkLCBzZXRJc0ZpbHRlcmVkXSA9IFJlYWN0LnVzZVN0YXRlKGxhenlSZXN1bHQuaXNGaWx0ZXJlZClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1bnN1YnNjcmliZSA9IGxhenlSZXN1bHQuc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdmaWx0ZXJlZCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICBzZXRJc0ZpbHRlcmVkKGxhenlSZXN1bHQuaXNGaWx0ZXJlZClcbiAgICAgIH0sXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdW5zdWJzY3JpYmUoKVxuICAgIH1cbiAgfSwgW2xhenlSZXN1bHRdKVxuICByZXR1cm4gaXNGaWx0ZXJlZFxufVxuXG50eXBlIHVzZVNlbGVjdGlvbk9mTGF6eVJlc3VsdHNSZXR1cm4gPSAndW5zZWxlY3RlZCcgfCAncGFydGlhbGx5JyB8ICdzZWxlY3RlZCdcblxuLyoqXG4gKiBVc2VkIGJ5IGNsdXN0ZXJzIHRvIHJlc3BvbmQgcXVpY2tseSB0byBjaGFuZ2VzIHRoZXkgY2FyZSBhYm91dFxuICogKGluIG90aGVyIHdvcmRzIHRoZSByZXN1bHRzIGluIHRoZWlyIGNsdXN0ZXIpXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VTZWxlY3Rpb25PZkxhenlSZXN1bHRzID0gKHtcbiAgbGF6eVJlc3VsdHMsXG59OiB7XG4gIGxhenlSZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXVxufSkgPT4ge1xuICBjb25zdCBjYWNoZSA9IFJlYWN0LnVzZVJlZih7fSBhcyB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSlcbiAgY29uc3QgY2FsY3VsYXRlSWZTZWxlY3RlZCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWVzID0gT2JqZWN0LnZhbHVlcyhjYWNoZS5jdXJyZW50KVxuICAgICAgbGV0IGJhc2VsaW5lID0gY3VycmVudFZhbHVlc1swXVxuICAgICAgbGV0IHVwZGF0ZVRvSXNTZWxlY3RlZCA9IGJhc2VsaW5lXG4gICAgICAgID8gJ3NlbGVjdGVkJ1xuICAgICAgICA6ICgndW5zZWxlY3RlZCcgYXMgdXNlU2VsZWN0aW9uT2ZMYXp5UmVzdWx0c1JldHVybilcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGN1cnJlbnRWYWx1ZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGlmIChiYXNlbGluZSAhPT0gY3VycmVudFZhbHVlc1tpXSkge1xuICAgICAgICAgIHVwZGF0ZVRvSXNTZWxlY3RlZCA9ICdwYXJ0aWFsbHknXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHVwZGF0ZVRvSXNTZWxlY3RlZFxuICAgIH1cbiAgfSwgW10pXG4gIGNvbnN0IGRlYm91bmNlZFVwZGF0ZWRJc1NlbGVjdGVkID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgc2V0SXNTZWxlY3RlZChjYWxjdWxhdGVJZlNlbGVjdGVkKCkpXG4gICAgfSwgMTAwKVxuICB9LCBbXSlcblxuICBjb25zdCBbaXNTZWxlY3RlZCwgc2V0SXNTZWxlY3RlZF0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBjYWxjdWxhdGVJZlNlbGVjdGVkKCkgYXMgdXNlU2VsZWN0aW9uT2ZMYXp5UmVzdWx0c1JldHVyblxuICApXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjYWNoZS5jdXJyZW50ID0gbGF6eVJlc3VsdHMucmVkdWNlKChibG9iLCBsYXp5UmVzdWx0KSA9PiB7XG4gICAgICBibG9iW2xhenlSZXN1bHRbJ21ldGFjYXJkLmlkJ11dID0gbGF6eVJlc3VsdC5pc1NlbGVjdGVkXG4gICAgICByZXR1cm4gYmxvYlxuICAgIH0sIHt9IGFzIHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9KVxuICAgIHNldElzU2VsZWN0ZWQoY2FsY3VsYXRlSWZTZWxlY3RlZCgpKVxuICAgIGNvbnN0IHVuc3Vic2NyaWJlQ2FsbHMgPSBsYXp5UmVzdWx0cy5tYXAoKGxhenlSZXN1bHQpID0+IHtcbiAgICAgIHJldHVybiBsYXp5UmVzdWx0LnN1YnNjcmliZVRvKHtcbiAgICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdzZWxlY3RlZCcsXG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgY2FjaGUuY3VycmVudFtsYXp5UmVzdWx0WydtZXRhY2FyZC5pZCddXSA9IGxhenlSZXN1bHQuaXNTZWxlY3RlZFxuICAgICAgICAgIGRlYm91bmNlZFVwZGF0ZWRJc1NlbGVjdGVkKClcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdW5zdWJzY3JpYmVDYWxscy5mb3JFYWNoKCh1bnN1YnNjcmliZUNhbGwpID0+IHtcbiAgICAgICAgdW5zdWJzY3JpYmVDYWxsKClcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbbGF6eVJlc3VsdHNdKVxuICByZXR1cm4gaXNTZWxlY3RlZFxufVxuXG5jb25zdCBnZXRTZWxlY3RlZFJlc3VsdHNPZkxhenlSZXN1bHRzID0gKHtcbiAgbGF6eVJlc3VsdHMsXG59OiB7XG4gIGxhenlSZXN1bHRzPzogTGF6eVF1ZXJ5UmVzdWx0c1xufSkgPT4ge1xuICBpZiAobGF6eVJlc3VsdHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ubGF6eVJlc3VsdHMuc2VsZWN0ZWRSZXN1bHRzLFxuICAgIH1cbiAgfVxuICByZXR1cm4ge31cbn1cblxuLyoqXG4gKiBJZiBhIHZpZXcgY2FyZXMgYWJvdXQgdGhlIGVudGlyZXR5IG9mIHdoYXQgcmVzdWx0cyBhcmUgc2VsZWN0ZWQgb3V0XG4gKiBvZiBhIExhenlRdWVyeVJlc3VsdHMgb2JqZWN0LCB0aGlzIHdpbGwga2VlcCB0aGVtIHVwIHRvIGRhdGUuXG4gKlxuICogVGhpcyBpcyBvdmVya2lsbCBmb3IgbW9zdCBjb21wb25lbnRzLCBidXQgbmVlZGVkIGZvciB0aGluZ3MgbGlrZVxuICogdGhlIGluc3BlY3Rvci4gIE1vc3Qgb3RoZXIgY29tcG9uZW50cyB3aWxsIGluc3RlYWQgcmVzcG9uZCB0byBjaGFuZ2VzXG4gKiBpbiBhIHNpbmdsZSByZXN1bHQuXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VTZWxlY3RlZFJlc3VsdHMgPSAoe1xuICBsYXp5UmVzdWx0cyxcbn06IHtcbiAgbGF6eVJlc3VsdHM/OiBMYXp5UXVlcnlSZXN1bHRzXG59KSA9PiB7XG4gIGNvbnN0IFtzZWxlY3RlZFJlc3VsdHMsIHNldFNlbGVjdGVkUmVzdWx0c10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBnZXRTZWxlY3RlZFJlc3VsdHNPZkxhenlSZXN1bHRzKHsgbGF6eVJlc3VsdHMgfSlcbiAgKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChsYXp5UmVzdWx0cykge1xuICAgICAgY29uc3QgdW5zdWJzY3JpYmVDYWxsID0gbGF6eVJlc3VsdHMuc3Vic2NyaWJlVG8oe1xuICAgICAgICBzdWJzY3JpYmFibGVUaGluZzogJ3NlbGVjdGVkUmVzdWx0cycsXG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgc2V0U2VsZWN0ZWRSZXN1bHRzKGdldFNlbGVjdGVkUmVzdWx0c09mTGF6eVJlc3VsdHMoeyBsYXp5UmVzdWx0cyB9KSlcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICB1bnN1YnNjcmliZUNhbGwoKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2xhenlSZXN1bHRzXSlcblxuICByZXR1cm4gc2VsZWN0ZWRSZXN1bHRzXG59XG5cbmNvbnN0IGdldFN0YXR1c0Zyb21MYXp5UmVzdWx0cyA9ICh7XG4gIGxhenlSZXN1bHRzLFxufToge1xuICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xufSkgPT4ge1xuICByZXR1cm4ge1xuICAgIHN0YXR1czogbGF6eVJlc3VsdHMuc3RhdHVzLFxuICAgIGlzU2VhcmNoaW5nOiBsYXp5UmVzdWx0cy5pc1NlYXJjaGluZyxcbiAgICBjdXJyZW50QXNPZjogbGF6eVJlc3VsdHMuY3VycmVudEFzT2YsXG4gIH1cbn1cblxuLyoqXG4gKiBJZiBhIHZpZXcgY2FyZXMgYWJvdXQgdGhlIHN0YXR1cyBvZiBhIExhenlRdWVyeVJlc3VsdHMgb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCB1c2VTdGF0dXNPZkxhenlSZXN1bHRzID0gKHtcbiAgbGF6eVJlc3VsdHMsXG59OiB7XG4gIGxhenlSZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRzXG59KSA9PiB7XG4gIGNvbnN0IFtzdGF0dXMsIHNldFN0YXR1c10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBnZXRTdGF0dXNGcm9tTGF6eVJlc3VsdHMoeyBsYXp5UmVzdWx0cyB9KVxuICApXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0U3RhdHVzKGdldFN0YXR1c0Zyb21MYXp5UmVzdWx0cyh7IGxhenlSZXN1bHRzIH0pKVxuICAgIGNvbnN0IHVuc3Vic2NyaWJlQ2FsbCA9IGxhenlSZXN1bHRzLnN1YnNjcmliZVRvKHtcbiAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnc3RhdHVzJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHNldFN0YXR1cyhnZXRTdGF0dXNGcm9tTGF6eVJlc3VsdHMoeyBsYXp5UmVzdWx0cyB9KSlcbiAgICAgIH0sXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdW5zdWJzY3JpYmVDYWxsKClcbiAgICB9XG4gIH0sIFtsYXp5UmVzdWx0c10pXG5cbiAgcmV0dXJuIHN0YXR1c1xufVxuXG4vKipcbiAqIElmIGEgdmlldyBjYXJlcyBhYm91dCB0aGUgc3RhdHVzIG9mIGEgTGF6eVF1ZXJ5UmVzdWx0cyBvYmplY3RcbiAqL1xuZXhwb3J0IGNvbnN0IHVzZUZpbHRlclRyZWVPZkxhenlSZXN1bHRzID0gKHtcbiAgbGF6eVJlc3VsdHMsXG59OiB7XG4gIGxhenlSZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRzXG59KSA9PiB7XG4gIGNvbnN0IFtmaWx0ZXJUcmVlLCBzZXRGaWx0ZXJUcmVlXSA9IFJlYWN0LnVzZVN0YXRlKGxhenlSZXN1bHRzLmZpbHRlclRyZWUpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0RmlsdGVyVHJlZShsYXp5UmVzdWx0cy5maWx0ZXJUcmVlKVxuICAgIGNvbnN0IHVuc3Vic2NyaWJlQ2FsbCA9IGxhenlSZXN1bHRzLnN1YnNjcmliZVRvKHtcbiAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnZmlsdGVyVHJlZScsXG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICBzZXRGaWx0ZXJUcmVlKGxhenlSZXN1bHRzLmZpbHRlclRyZWUpXG4gICAgICB9LFxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHVuc3Vic2NyaWJlQ2FsbCgpXG4gICAgfVxuICB9LCBbbGF6eVJlc3VsdHNdKVxuXG4gIHJldHVybiBmaWx0ZXJUcmVlXG59XG5cbi8qKlxuICogIEFsbG93IGEgdmlldyB0byByZXJlbmRlciB3aGVuIHRoZSBiYWNrYm9uZSBtb2RlbCByZXN5bmNzIHRvIHRoZSBwbGFpbiBtb2RlbFxuICovXG5leHBvcnQgY29uc3QgdXNlUmVyZW5kZXJPbkJhY2tib25lU3luYyA9ICh7XG4gIGxhenlSZXN1bHQsXG59OiB7XG4gIGxhenlSZXN1bHQ/OiBMYXp5UXVlcnlSZXN1bHRcbn0pID0+IHtcbiAgY29uc3QgWywgc2V0UmFuZG9tTnVtYmVyXSA9IFJlYWN0LnVzZVN0YXRlKE1hdGgucmFuZG9tKCkpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0UmFuZG9tTnVtYmVyKE1hdGgucmFuZG9tKCkpXG4gICAgY29uc3QgdW5zdWJzY3JpYmVDYWxsID0gbGF6eVJlc3VsdFxuICAgICAgPyBsYXp5UmVzdWx0LnN1YnNjcmliZVRvKHtcbiAgICAgICAgICBzdWJzY3JpYmFibGVUaGluZzogJ2JhY2tib25lU3luYycsXG4gICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgIHNldFJhbmRvbU51bWJlcihNYXRoLnJhbmRvbSgpKVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICA6ICgpID0+IHt9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHVuc3Vic2NyaWJlQ2FsbCgpXG4gICAgfVxuICB9LCBbbGF6eVJlc3VsdF0pXG59XG4iXX0=