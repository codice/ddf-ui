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
import { __assign, __read, __spreadArray } from "tslib";
/**
 *  We use the current status + current index to calculate next index.
 *  Local sources get grouped into a single index.
 *
 *  If current index is blank it's assumed to be the start.
 *
 *  We throw an error if status is provided while current index is blank, as that doesn't make sense.
 *
 *  Notice that a good chunk of the logic is dedicated to ensuring we don't go beyond hits.
 *  Locally this doesn't matter, but remote sources tend to throw errors if we do.
 */
export var calculateNextIndexForSourceGroupNextPage = function (_a) {
    var _b = _a.queryStatus, queryStatus = _b === void 0 ? {} : _b, sources = _a.sources, isLocal = _a.isLocal, currentIndexForSourceGroup = _a.currentIndexForSourceGroup;
    if (Object.keys(queryStatus).length > 0 &&
        Object.keys(currentIndexForSourceGroup).length === 0) {
        throw 'Invalid invocation:  queryStatus cannot be provided if currentIndexForSourceGroup is not';
    }
    var federatedSources = sources.filter(function (id) {
        return !isLocal(id);
    });
    var hasLocal = sources.some(function (id) { return isLocal(id); });
    var maxLocalStart = Math.max(1, Object.values(queryStatus)
        .filter(function (indiviualStatus) { return isLocal(indiviualStatus.id); })
        .filter(function (indiviualStatus) { return indiviualStatus.hits !== undefined; })
        .reduce(function (blob, status) {
        return blob + status.hits;
    }, 1));
    return Object.values(queryStatus).reduce(function (blob, indiviualStatus) {
        if (isLocal(indiviualStatus.id)) {
            blob['local'] = Math.min(maxLocalStart, blob['local'] + indiviualStatus.count);
        }
        else {
            blob[indiviualStatus.id] = Math.min(indiviualStatus.hits !== undefined ? indiviualStatus.hits + 1 : 1, blob[indiviualStatus.id] + indiviualStatus.count);
        }
        return blob;
    }, __assign(__assign(__assign({}, (hasLocal ? { local: 1 } : {})), federatedSources.reduce(function (blob, id) {
        blob[id] = 1;
        return blob;
    }, {})), currentIndexForSourceGroup));
};
export var getIndexOfNoMoreResultsForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, isLocal = _a.isLocal;
    var indexOfLastResultForSourceGroup = getIndexOfLastResultForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
    });
    return Object.keys(indexOfLastResultForSourceGroup).reduce(function (blob, key) {
        blob[key] = indexOfLastResultForSourceGroup[key] + 1;
        return blob;
    }, {});
};
/**
 *  This is the index of the final result for a source group.
 */
export var getIndexOfLastResultForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, isLocal = _a.isLocal;
    if (Object.keys(queryStatus).length === 0) {
        console.warn('Invalid invocation:  queryStatus is required to determine max index for a query');
        return {};
    }
    var hasLocal = Object.values(queryStatus).some(function (status) {
        return isLocal(status.id);
    });
    var maxLocalStart = Math.max(0, Object.values(queryStatus)
        .filter(function (indiviualStatus) { return isLocal(indiviualStatus.id); })
        .filter(function (indiviualStatus) { return indiviualStatus.hits !== undefined; })
        .reduce(function (blob, status) {
        return blob + status.hits;
    }, 0));
    return Object.values(queryStatus).reduce(function (blob, indiviualStatus) {
        if (!isLocal(indiviualStatus.id)) {
            blob[indiviualStatus.id] = indiviualStatus.hits;
        }
        return blob;
    }, __assign({}, (hasLocal ? { local: maxLocalStart } : {})));
};
export var hasPreviousPageForSourceGroup = function (_a) {
    var currentIndexForSourceGroup = _a.currentIndexForSourceGroup;
    return (Object.values(currentIndexForSourceGroup).length > 0 &&
        Object.values(currentIndexForSourceGroup).some(function (start) { return start !== 1; }));
};
// should not be used outside of calculating the constrained next page
var getNextPageForSourceGroup = function (_a) {
    var currentIndexForSourceGroup = _a.currentIndexForSourceGroup, sources = _a.sources, isLocal = _a.isLocal, count = _a.count, queryStatus = _a.queryStatus;
    var finalIndexForSourceGroup = getFinalPageForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
        count: count,
    });
    if (Object.keys(currentIndexForSourceGroup).length > 0) {
        return Object.keys(currentIndexForSourceGroup).reduce(function (blob, key) {
            blob[key] = Math.min(blob[key] + count, finalIndexForSourceGroup[key]);
            return blob;
        }, __assign({}, currentIndexForSourceGroup));
    }
    else {
        var hasLocal = sources.some(function (id) { return isLocal(id); });
        return sources.reduce(function (blob, sourceName) {
            if (!isLocal(sourceName)) {
                blob[sourceName] =
                    Math.min(1, finalIndexForSourceGroup[sourceName]) || 1;
            }
            return blob;
        }, __assign({}, (hasLocal ? { local: 1 } : {})));
    }
};
export var hasNextPageForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, isLocal = _a.isLocal, currentIndexForSourceGroup = _a.currentIndexForSourceGroup, count = _a.count;
    if (!queryStatus) {
        return false;
    }
    var indexOfLastResultForSourceGroup = getIndexOfLastResultForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
    });
    return Object.keys(indexOfLastResultForSourceGroup).some(function (key) {
        return (currentIndexForSourceGroup[key] + count - 1 <
            indexOfLastResultForSourceGroup[key]);
    });
};
// should not be used outside of calculating the constrained previous page
var getPreviousPageForSourceGroup = function (_a) {
    var currentIndexForSourceGroup = _a.currentIndexForSourceGroup, sources = _a.sources, isLocal = _a.isLocal, count = _a.count, queryStatus = _a.queryStatus;
    var finalIndexForSourceGroup = getFinalPageForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
        count: count,
    });
    if (Object.keys(currentIndexForSourceGroup).length > 0) {
        return Object.keys(currentIndexForSourceGroup).reduce(function (blob, key) {
            blob[key] = Math.max(Math.min(blob[key] - count, finalIndexForSourceGroup[key]), 1);
            return blob;
        }, __assign({}, currentIndexForSourceGroup));
    }
    else {
        var hasLocal = sources.some(function (id) { return isLocal(id); });
        return sources.reduce(function (blob, sourceName) {
            if (!isLocal(sourceName)) {
                blob[sourceName] =
                    Math.min(1, finalIndexForSourceGroup[sourceName]) || 1;
            }
            return blob;
        }, __assign({}, (hasLocal ? { local: 1 } : {})));
    }
};
export var getFirstPageForSourceGroup = function (_a) {
    var sources = _a.sources, isLocal = _a.isLocal;
    return calculateNextIndexForSourceGroupNextPage({
        sources: sources,
        isLocal: isLocal,
        queryStatus: {},
        currentIndexForSourceGroup: {},
    });
};
var getFinalPageForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, isLocal = _a.isLocal, count = _a.count;
    if (!queryStatus) {
        return {};
    }
    var indexOfLastResultForSourceGroup = getIndexOfLastResultForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
    });
    return Object.keys(indexOfLastResultForSourceGroup).reduce(function (blob, sourceName) {
        var remainderOnFinalPage = indexOfLastResultForSourceGroup[sourceName] % count;
        remainderOnFinalPage =
            remainderOnFinalPage === 0 ? count : remainderOnFinalPage;
        blob[sourceName] = Math.max(indexOfLastResultForSourceGroup[sourceName] - remainderOnFinalPage + 1, 1);
        return blob;
    }, __assign({}, indexOfLastResultForSourceGroup));
};
export var getCurrentStartAndEndForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, currentIndexForSourceGroup = _a.currentIndexForSourceGroup, isLocal = _a.isLocal;
    if (!queryStatus || Object.keys(queryStatus).length === 0) {
        return {
            start: 0,
            end: 0,
            hits: 0,
        };
    }
    var lastIndexForSourceGroup = getIndexOfLastResultForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
    });
    var start = 1;
    var isBeginning = Object.values(currentIndexForSourceGroup).every(function (start) { return start === 1; });
    if (!isBeginning) {
        start = Object.keys(currentIndexForSourceGroup).reduce(function (blob, key) {
            return (blob +
                Math.min(currentIndexForSourceGroup[key], lastIndexForSourceGroup[key])); // if we go beyond the hits, we should only add the total hits for that source
        }, 0);
    }
    var end = Object.keys(queryStatus).reduce(function (blob, key) {
        return blob + queryStatus[key].count;
    }, start - 1);
    var hits = Object.keys(queryStatus).reduce(function (blob, key) {
        return blob + queryStatus[key].hits;
    }, 0);
    return {
        start: Math.min(start, hits),
        end: Math.min(Math.max(start, end), hits),
        hits: hits,
    };
};
function getFarthestIndexForSourceGroup(sourceGroup) {
    // find the max index for the source group
    return Math.max.apply(Math, __spreadArray([], __read(Object.values(sourceGroup)), false));
}
/**
 * Ensures that the next page indices for a group of sources make sense.  We do this by examining the farthest index, since paging is done individually for each source.
 * If the farthest index is beyond the hits for a source, we essentially "lock" the source to the end to ensure we don't recieve further results.
 **/
export var getConstrainedNextPageForSourceGroup = function (_a) {
    var currentIndexForSourceGroup = _a.currentIndexForSourceGroup, sources = _a.sources, isLocal = _a.isLocal, count = _a.count, queryStatus = _a.queryStatus;
    var nextPageForSourceGroup = getNextPageForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
        count: count,
        currentIndexForSourceGroup: currentIndexForSourceGroup,
        sources: sources,
    });
    var farthestIndexForSourceGroup = getFarthestIndexForSourceGroup(nextPageForSourceGroup);
    var indexOfNoMoreResultsForSourceGroup = getIndexOfNoMoreResultsForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
    });
    return Object.keys(nextPageForSourceGroup).reduce(function (blob, sourceName) {
        if (blob[sourceName] < farthestIndexForSourceGroup) {
            blob[sourceName] = indexOfNoMoreResultsForSourceGroup[sourceName]; // lock the source to the end, since we've gone beyond the hits (will ensure no results come back)
        }
        return blob;
    }, __assign({}, nextPageForSourceGroup));
};
/**
 *  The final index for a source group is not the same as the final index when thinking about the very last page, since we have multiple sources.
 *  Some sources may have already "exhausted" their results, so we need to make sure that if we don't return results that we've already "passed".
 */
export var getConstrainedFinalPageForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, isLocal = _a.isLocal, count = _a.count;
    var finalPageForSourceGroup = getFinalPageForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
        count: count,
    });
    var maxFinalPageIndexForSourceGroup = Math.max.apply(Math, __spreadArray([], __read(Object.values(finalPageForSourceGroup)), false));
    var indexOfNoMoreResultsForSourceGroup = getIndexOfNoMoreResultsForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
    });
    return Object.keys(finalPageForSourceGroup).reduce(function (blob, sourceName) {
        if (blob[sourceName] < maxFinalPageIndexForSourceGroup) {
            blob[sourceName] = indexOfNoMoreResultsForSourceGroup[sourceName];
        }
        return blob;
    }, __assign({}, finalPageForSourceGroup));
};
/**
 * Ensures that the next page indices for a group of sources make sense.  We do this by examining the farthest index, since paging is done individually for each source.
 * If the farthest index is beyond the hits for a source, we essentially "lock" the source to the end to ensure we don't recieve further results.
 **/
export var getConstrainedPreviousPageForSourceGroup = function (_a) {
    var currentIndexForSourceGroup = _a.currentIndexForSourceGroup, sources = _a.sources, isLocal = _a.isLocal, count = _a.count, queryStatus = _a.queryStatus;
    if (!queryStatus || Object.keys(queryStatus).length === 0) {
        return getFirstPageForSourceGroup({
            sources: sources,
            isLocal: isLocal,
        });
    }
    var previousPageForSourceGroup = getPreviousPageForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
        count: count,
        currentIndexForSourceGroup: currentIndexForSourceGroup,
        sources: sources,
    });
    var farthestIndexForSourceGroup = getFarthestIndexForSourceGroup(previousPageForSourceGroup);
    var indexOfNoMoreResultsForSourceGroup = getIndexOfNoMoreResultsForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
    });
    return Object.keys(previousPageForSourceGroup).reduce(function (blob, sourceName) {
        if (blob[sourceName] < farthestIndexForSourceGroup) {
            // never go beyond the no more results index, but make sure we keep indexes in sync when going backwards
            blob[sourceName] = Math.min(indexOfNoMoreResultsForSourceGroup[sourceName], farthestIndexForSourceGroup);
        }
        return blob;
    }, __assign({}, previousPageForSourceGroup));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnkubWV0aG9kcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9RdWVyeS5tZXRob2RzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJOztBQXVCSjs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxDQUFDLElBQU0sd0NBQXdDLEdBQUcsVUFBQyxFQVV4RDtRQVRDLG1CQUFnQixFQUFoQixXQUFXLG1CQUFHLEVBQUUsS0FBQSxFQUNoQixPQUFPLGFBQUEsRUFDUCxPQUFPLGFBQUEsRUFDUCwwQkFBMEIsZ0NBQUE7SUFPMUIsSUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUNwRCxDQUFDO1FBQ0QsTUFBTSwwRkFBMEYsQ0FBQTtJQUNsRyxDQUFDO0lBQ0QsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUMsRUFBRTtRQUN6QyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3JCLENBQUMsQ0FBQyxDQUFBO0lBQ0YsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQUUsSUFBSyxPQUFBLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBWCxDQUFXLENBQUMsQ0FBQTtJQUNsRCxJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUM1QixDQUFDLEVBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7U0FDdkIsTUFBTSxDQUFDLFVBQUMsZUFBZSxJQUFLLE9BQUEsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQztTQUN4RCxNQUFNLENBQUMsVUFBQyxlQUFlLElBQUssT0FBQSxlQUFlLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBbEMsQ0FBa0MsQ0FBQztTQUMvRCxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsTUFBTTtRQUNuQixPQUFPLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFBO0lBQzNCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDUixDQUFBO0lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FDdEMsVUFBQyxJQUFJLEVBQUUsZUFBZTtRQUNwQixJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDdEIsYUFBYSxFQUNiLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUN0QyxDQUFBO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ2pDLGVBQWUsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNqRSxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQ2pELENBQUE7UUFDSCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLEVBQ0QsK0JBQ0ssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FDOUIsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLEVBQUU7UUFDbEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNaLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQyxFQUFFLEVBQStCLENBQUMsR0FDaEMsMEJBQTBCLENBQ0QsQ0FDL0IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLHFDQUFxQyxHQUFHLFVBQUMsRUFNckQ7UUFMQyxXQUFXLGlCQUFBLEVBQ1gsT0FBTyxhQUFBO0lBS1AsSUFBTSwrQkFBK0IsR0FBRyxrQ0FBa0MsQ0FBQztRQUN6RSxXQUFXLGFBQUE7UUFDWCxPQUFPLFNBQUE7S0FDUixDQUFDLENBQUE7SUFDRixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsR0FBRztRQUNuRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsK0JBQStCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQyxFQUFFLEVBQTZCLENBQUMsQ0FBQTtBQUNuQyxDQUFDLENBQUE7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLGtDQUFrQyxHQUFHLFVBQUMsRUFNbEQ7UUFMQyxXQUFXLGlCQUFBLEVBQ1gsT0FBTyxhQUFBO0lBS1AsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMxQyxPQUFPLENBQUMsSUFBSSxDQUNWLGlGQUFpRixDQUNsRixDQUFBO1FBQ0QsT0FBTyxFQUFFLENBQUE7SUFDWCxDQUFDO0lBQ0QsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxNQUFNO1FBQ3RELE9BQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFBbEIsQ0FBa0IsQ0FDbkIsQ0FBQTtJQUNELElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQzVCLENBQUMsRUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztTQUN2QixNQUFNLENBQUMsVUFBQyxlQUFlLElBQUssT0FBQSxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxFQUEzQixDQUEyQixDQUFDO1NBQ3hELE1BQU0sQ0FBQyxVQUFDLGVBQWUsSUFBSyxPQUFBLGVBQWUsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFsQyxDQUFrQyxDQUFDO1NBQy9ELE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxNQUFNO1FBQ25CLE9BQU8sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7SUFDM0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNSLENBQUE7SUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUN0QyxVQUFDLElBQUksRUFBRSxlQUFlO1FBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFBO1FBQ2pELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUMsRUFDRCxhQUNLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQ25CLENBQzdCLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSw2QkFBNkIsR0FBRyxVQUFDLEVBSTdDO1FBSEMsMEJBQTBCLGdDQUFBO0lBSTFCLE9BQU8sQ0FDTCxNQUFNLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUMsTUFBTSxHQUFHLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssS0FBSyxDQUFDLEVBQVgsQ0FBVyxDQUFDLENBQ3ZFLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxzRUFBc0U7QUFDdEUsSUFBTSx5QkFBeUIsR0FBRyxVQUFDLEVBWWxDO1FBWEMsMEJBQTBCLGdDQUFBLEVBQzFCLE9BQU8sYUFBQSxFQUNQLE9BQU8sYUFBQSxFQUNQLEtBQUssV0FBQSxFQUNMLFdBQVcsaUJBQUE7SUFRWCxJQUFNLHdCQUF3QixHQUFHLDBCQUEwQixDQUFDO1FBQzFELFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtRQUNQLEtBQUssT0FBQTtLQUNOLENBQUMsQ0FBQTtJQUVGLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN2RCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxNQUFNLENBQ25ELFVBQUMsSUFBSSxFQUFFLEdBQUc7WUFDUixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxFQUFFLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDdEUsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLEVBQ0QsYUFBSywwQkFBMEIsQ0FBNkIsQ0FDN0QsQ0FBQTtJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQUUsSUFBSyxPQUFBLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBWCxDQUFXLENBQUMsQ0FBQTtRQUNsRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQ25CLFVBQUMsSUFBSSxFQUFFLFVBQVU7WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUM7b0JBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDMUQsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQyxFQUNELGFBQ0ssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FDUCxDQUM3QixDQUFBO0lBQ0gsQ0FBQztBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLHlCQUF5QixHQUFHLFVBQUMsRUFVekM7UUFUQyxXQUFXLGlCQUFBLEVBQ1gsT0FBTyxhQUFBLEVBQ1AsMEJBQTBCLGdDQUFBLEVBQzFCLEtBQUssV0FBQTtJQU9MLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQixPQUFPLEtBQUssQ0FBQTtJQUNkLENBQUM7SUFFRCxJQUFNLCtCQUErQixHQUFHLGtDQUFrQyxDQUFDO1FBQ3pFLFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtLQUNSLENBQUMsQ0FBQTtJQUVGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUc7UUFDM0QsT0FBTyxDQUNMLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDO1lBQzNDLCtCQUErQixDQUFDLEdBQUcsQ0FBQyxDQUNyQyxDQUFBO0lBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUE7QUFFRCwwRUFBMEU7QUFDMUUsSUFBTSw2QkFBNkIsR0FBRyxVQUFDLEVBWXRDO1FBWEMsMEJBQTBCLGdDQUFBLEVBQzFCLE9BQU8sYUFBQSxFQUNQLE9BQU8sYUFBQSxFQUNQLEtBQUssV0FBQSxFQUNMLFdBQVcsaUJBQUE7SUFRWCxJQUFNLHdCQUF3QixHQUFHLDBCQUEwQixDQUFDO1FBQzFELFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtRQUNQLEtBQUssT0FBQTtLQUNOLENBQUMsQ0FBQTtJQUVGLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN2RCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxNQUFNLENBQ25ELFVBQUMsSUFBSSxFQUFFLEdBQUc7WUFDUixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxFQUFFLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQzFELENBQUMsQ0FDRixDQUFBO1lBQ0QsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLEVBQ0QsYUFBSywwQkFBMEIsQ0FBNkIsQ0FDN0QsQ0FBQTtJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQUUsSUFBSyxPQUFBLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBWCxDQUFXLENBQUMsQ0FBQTtRQUNsRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQ25CLFVBQUMsSUFBSSxFQUFFLFVBQVU7WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUM7b0JBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDMUQsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQyxFQUNELGFBQ0ssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FDUCxDQUM3QixDQUFBO0lBQ0gsQ0FBQztBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLDBCQUEwQixHQUFHLFVBQUMsRUFNMUM7UUFMQyxPQUFPLGFBQUEsRUFDUCxPQUFPLGFBQUE7SUFLUCxPQUFPLHdDQUF3QyxDQUFDO1FBQzlDLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLFdBQVcsRUFBRSxFQUFFO1FBQ2YsMEJBQTBCLEVBQUUsRUFBRTtLQUMvQixDQUFDLENBQUE7QUFDSixDQUFDLENBQUE7QUFFRCxJQUFNLDBCQUEwQixHQUFHLFVBQUMsRUFRbkM7UUFQQyxXQUFXLGlCQUFBLEVBQ1gsT0FBTyxhQUFBLEVBQ1AsS0FBSyxXQUFBO0lBTUwsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQztJQUNELElBQU0sK0JBQStCLEdBQUcsa0NBQWtDLENBQUM7UUFDekUsV0FBVyxhQUFBO1FBQ1gsT0FBTyxTQUFBO0tBQ1IsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUMsTUFBTSxDQUN4RCxVQUFDLElBQUksRUFBRSxVQUFVO1FBQ2YsSUFBSSxvQkFBb0IsR0FDdEIsK0JBQStCLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3JELG9CQUFvQjtZQUNsQixvQkFBb0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUE7UUFDM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ3pCLCtCQUErQixDQUFDLFVBQVUsQ0FBQyxHQUFHLG9CQUFvQixHQUFHLENBQUMsRUFDdEUsQ0FBQyxDQUNGLENBQUE7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUMsRUFDRCxhQUNLLCtCQUErQixDQUNOLENBQy9CLENBQUE7QUFDSCxDQUFDLENBQUE7QUFRRCxNQUFNLENBQUMsSUFBTSxtQ0FBbUMsR0FBRyxVQUFDLEVBUW5EO1FBUEMsV0FBVyxpQkFBQSxFQUNYLDBCQUEwQixnQ0FBQSxFQUMxQixPQUFPLGFBQUE7SUFNUCxJQUFJLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzFELE9BQU87WUFDTCxLQUFLLEVBQUUsQ0FBQztZQUNSLEdBQUcsRUFBRSxDQUFDO1lBQ04sSUFBSSxFQUFFLENBQUM7U0FDUixDQUFBO0lBQ0gsQ0FBQztJQUNELElBQU0sdUJBQXVCLEdBQUcsa0NBQWtDLENBQUM7UUFDakUsV0FBVyxhQUFBO1FBQ1gsT0FBTyxTQUFBO0tBQ1IsQ0FBQyxDQUFBO0lBRUYsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFBO0lBQ2IsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEtBQUssQ0FDakUsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLEtBQUssQ0FBQyxFQUFYLENBQVcsQ0FDdkIsQ0FBQTtJQUVELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQixLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxHQUFHO1lBQy9ELE9BQU8sQ0FDTCxJQUFJO2dCQUNKLElBQUksQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDeEUsQ0FBQSxDQUFDLDhFQUE4RTtRQUNsRixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDUCxDQUFDO0lBRUQsSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsR0FBRztRQUNwRCxPQUFPLElBQUksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFBO0lBQ3RDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFYixJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxHQUFHO1FBQ3JELE9BQU8sSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDckMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRUwsT0FBTztRQUNMLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7UUFDNUIsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDO1FBQ3pDLElBQUksTUFBQTtLQUNMLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxTQUFTLDhCQUE4QixDQUNyQyxXQUFvQztJQUVwQywwQ0FBMEM7SUFDMUMsT0FBTyxJQUFJLENBQUMsR0FBRyxPQUFSLElBQUksMkJBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBQztBQUNoRCxDQUFDO0FBRUQ7OztJQUdJO0FBQ0osTUFBTSxDQUFDLElBQU0sb0NBQW9DLEdBQUcsVUFBQyxFQVlwRDtRQVhDLDBCQUEwQixnQ0FBQSxFQUMxQixPQUFPLGFBQUEsRUFDUCxPQUFPLGFBQUEsRUFDUCxLQUFLLFdBQUEsRUFDTCxXQUFXLGlCQUFBO0lBUVgsSUFBTSxzQkFBc0IsR0FBRyx5QkFBeUIsQ0FBQztRQUN2RCxXQUFXLGFBQUE7UUFDWCxPQUFPLFNBQUE7UUFDUCxLQUFLLE9BQUE7UUFDTCwwQkFBMEIsNEJBQUE7UUFDMUIsT0FBTyxTQUFBO0tBQ1IsQ0FBQyxDQUFBO0lBQ0YsSUFBTSwyQkFBMkIsR0FBRyw4QkFBOEIsQ0FDaEUsc0JBQXNCLENBQ3ZCLENBQUE7SUFDRCxJQUFNLGtDQUFrQyxHQUN0QyxxQ0FBcUMsQ0FBQztRQUNwQyxXQUFXLGFBQUE7UUFDWCxPQUFPLFNBQUE7S0FDUixDQUFDLENBQUE7SUFDSixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLENBQy9DLFVBQUMsSUFBSSxFQUFFLFVBQVU7UUFDZixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRywyQkFBMkIsRUFBRSxDQUFDO1lBQ25ELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxrQ0FBa0MsQ0FBQyxVQUFVLENBQUMsQ0FBQSxDQUFDLGtHQUFrRztRQUN0SyxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLEVBQ0QsYUFDSyxzQkFBc0IsQ0FDRyxDQUMvQixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLElBQU0scUNBQXFDLEdBQUcsVUFBQyxFQVFyRDtRQVBDLFdBQVcsaUJBQUEsRUFDWCxPQUFPLGFBQUEsRUFDUCxLQUFLLFdBQUE7SUFNTCxJQUFNLHVCQUF1QixHQUFHLDBCQUEwQixDQUFDO1FBQ3pELFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtRQUNQLEtBQUssT0FBQTtLQUNOLENBQUMsQ0FBQTtJQUNGLElBQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLEdBQUcsT0FBUixJQUFJLDJCQUN2QyxNQUFNLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFVBQzFDLENBQUE7SUFDRCxJQUFNLGtDQUFrQyxHQUN0QyxxQ0FBcUMsQ0FBQztRQUNwQyxXQUFXLGFBQUE7UUFDWCxPQUFPLFNBQUE7S0FDUixDQUFDLENBQUE7SUFDSixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxNQUFNLENBQ2hELFVBQUMsSUFBSSxFQUFFLFVBQVU7UUFDZixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRywrQkFBK0IsRUFBRSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxrQ0FBa0MsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNuRSxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLEVBQ0QsYUFDSyx1QkFBdUIsQ0FDRSxDQUMvQixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQ7OztJQUdJO0FBQ0osTUFBTSxDQUFDLElBQU0sd0NBQXdDLEdBQUcsVUFBQyxFQVl4RDtRQVhDLDBCQUEwQixnQ0FBQSxFQUMxQixPQUFPLGFBQUEsRUFDUCxPQUFPLGFBQUEsRUFDUCxLQUFLLFdBQUEsRUFDTCxXQUFXLGlCQUFBO0lBUVgsSUFBSSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMxRCxPQUFPLDBCQUEwQixDQUFDO1lBQ2hDLE9BQU8sU0FBQTtZQUNQLE9BQU8sU0FBQTtTQUNSLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxJQUFNLDBCQUEwQixHQUFHLDZCQUE2QixDQUFDO1FBQy9ELFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtRQUNQLEtBQUssT0FBQTtRQUNMLDBCQUEwQiw0QkFBQTtRQUMxQixPQUFPLFNBQUE7S0FDUixDQUFDLENBQUE7SUFDRixJQUFNLDJCQUEyQixHQUFHLDhCQUE4QixDQUNoRSwwQkFBMEIsQ0FDM0IsQ0FBQTtJQUNELElBQU0sa0NBQWtDLEdBQ3RDLHFDQUFxQyxDQUFDO1FBQ3BDLFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtLQUNSLENBQUMsQ0FBQTtJQUNKLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sQ0FDbkQsVUFBQyxJQUFJLEVBQUUsVUFBVTtRQUNmLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLDJCQUEyQixFQUFFLENBQUM7WUFDbkQsd0dBQXdHO1lBQ3hHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUN6QixrQ0FBa0MsQ0FBQyxVQUFVLENBQUMsRUFDOUMsMkJBQTJCLENBQzVCLENBQUE7UUFDSCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLEVBQ0QsYUFDSywwQkFBMEIsQ0FDRCxDQUMvQixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbi8vIHNsb3dseSBzZXBlcmF0ZSBvdXQgbWV0aG9kcyBmcm9tIFF1ZXJ5IG1vZGVsICh3aGljaCBoYXMgYSBsb3Qgb2YgZGVwZW5kZW5jaWVzKSB0byBoZXJlLCB3aGVyZSB3ZSBjYW4gaW1wb3J0IHRoZW0gaW4gYSBzcGVjIGFuZCB0ZXN0IHRoZW1cblxuZXhwb3J0IHR5cGUgSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUgPSB7XG4gIFtrZXk6IHN0cmluZ106IG51bWJlclxufVxuXG5leHBvcnQgdHlwZSBTb3VyY2VTdGF0dXMgPSB7XG4gIGlkOiBzdHJpbmdcbiAgY291bnQ6IG51bWJlclxuICBoYXNSZXR1cm5lZDogYm9vbGVhblxuICBoaXRzOiBudW1iZXJcbiAgZWxhcHNlZDogbnVtYmVyXG4gIHN1Y2Nlc3NmdWw6IGJvb2xlYW5cbiAgd2FybmluZ3M6IFtdXG59XG5cbi8vIGtleSBpcyBnb2luZyB0byBiZSBpZCBpbiBTb3VyY2VTdGF0dXNcbmV4cG9ydCB0eXBlIFF1ZXJ5U3RhdHVzID0ge1xuICBba2V5OiBzdHJpbmddOiBTb3VyY2VTdGF0dXNcbn1cblxuLyoqXG4gKiAgV2UgdXNlIHRoZSBjdXJyZW50IHN0YXR1cyArIGN1cnJlbnQgaW5kZXggdG8gY2FsY3VsYXRlIG5leHQgaW5kZXguXG4gKiAgTG9jYWwgc291cmNlcyBnZXQgZ3JvdXBlZCBpbnRvIGEgc2luZ2xlIGluZGV4LlxuICpcbiAqICBJZiBjdXJyZW50IGluZGV4IGlzIGJsYW5rIGl0J3MgYXNzdW1lZCB0byBiZSB0aGUgc3RhcnQuXG4gKlxuICogIFdlIHRocm93IGFuIGVycm9yIGlmIHN0YXR1cyBpcyBwcm92aWRlZCB3aGlsZSBjdXJyZW50IGluZGV4IGlzIGJsYW5rLCBhcyB0aGF0IGRvZXNuJ3QgbWFrZSBzZW5zZS5cbiAqXG4gKiAgTm90aWNlIHRoYXQgYSBnb29kIGNodW5rIG9mIHRoZSBsb2dpYyBpcyBkZWRpY2F0ZWQgdG8gZW5zdXJpbmcgd2UgZG9uJ3QgZ28gYmV5b25kIGhpdHMuXG4gKiAgTG9jYWxseSB0aGlzIGRvZXNuJ3QgbWF0dGVyLCBidXQgcmVtb3RlIHNvdXJjZXMgdGVuZCB0byB0aHJvdyBlcnJvcnMgaWYgd2UgZG8uXG4gKi9cbmV4cG9ydCBjb25zdCBjYWxjdWxhdGVOZXh0SW5kZXhGb3JTb3VyY2VHcm91cE5leHRQYWdlID0gKHtcbiAgcXVlcnlTdGF0dXMgPSB7fSxcbiAgc291cmNlcyxcbiAgaXNMb2NhbCxcbiAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAsXG59OiB7XG4gIHF1ZXJ5U3RhdHVzOiBRdWVyeVN0YXR1c1xuICBzb3VyY2VzOiBBcnJheTxzdHJpbmc+XG4gIGlzTG9jYWw6IChpZDogc3RyaW5nKSA9PiBib29sZWFuXG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxufSk6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlID0+IHtcbiAgaWYgKFxuICAgIE9iamVjdC5rZXlzKHF1ZXJ5U3RhdHVzKS5sZW5ndGggPiAwICYmXG4gICAgT2JqZWN0LmtleXMoY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXApLmxlbmd0aCA9PT0gMFxuICApIHtcbiAgICB0aHJvdyAnSW52YWxpZCBpbnZvY2F0aW9uOiAgcXVlcnlTdGF0dXMgY2Fubm90IGJlIHByb3ZpZGVkIGlmIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwIGlzIG5vdCdcbiAgfVxuICBjb25zdCBmZWRlcmF0ZWRTb3VyY2VzID0gc291cmNlcy5maWx0ZXIoKGlkKSA9PiB7XG4gICAgcmV0dXJuICFpc0xvY2FsKGlkKVxuICB9KVxuICBjb25zdCBoYXNMb2NhbCA9IHNvdXJjZXMuc29tZSgoaWQpID0+IGlzTG9jYWwoaWQpKVxuICBjb25zdCBtYXhMb2NhbFN0YXJ0ID0gTWF0aC5tYXgoXG4gICAgMSxcbiAgICBPYmplY3QudmFsdWVzKHF1ZXJ5U3RhdHVzKVxuICAgICAgLmZpbHRlcigoaW5kaXZpdWFsU3RhdHVzKSA9PiBpc0xvY2FsKGluZGl2aXVhbFN0YXR1cy5pZCkpXG4gICAgICAuZmlsdGVyKChpbmRpdml1YWxTdGF0dXMpID0+IGluZGl2aXVhbFN0YXR1cy5oaXRzICE9PSB1bmRlZmluZWQpXG4gICAgICAucmVkdWNlKChibG9iLCBzdGF0dXMpID0+IHtcbiAgICAgICAgcmV0dXJuIGJsb2IgKyBzdGF0dXMuaGl0c1xuICAgICAgfSwgMSlcbiAgKVxuICByZXR1cm4gT2JqZWN0LnZhbHVlcyhxdWVyeVN0YXR1cykucmVkdWNlKFxuICAgIChibG9iLCBpbmRpdml1YWxTdGF0dXMpID0+IHtcbiAgICAgIGlmIChpc0xvY2FsKGluZGl2aXVhbFN0YXR1cy5pZCkpIHtcbiAgICAgICAgYmxvYlsnbG9jYWwnXSA9IE1hdGgubWluKFxuICAgICAgICAgIG1heExvY2FsU3RhcnQsXG4gICAgICAgICAgYmxvYlsnbG9jYWwnXSArIGluZGl2aXVhbFN0YXR1cy5jb3VudFxuICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBibG9iW2luZGl2aXVhbFN0YXR1cy5pZF0gPSBNYXRoLm1pbihcbiAgICAgICAgICBpbmRpdml1YWxTdGF0dXMuaGl0cyAhPT0gdW5kZWZpbmVkID8gaW5kaXZpdWFsU3RhdHVzLmhpdHMgKyAxIDogMSxcbiAgICAgICAgICBibG9iW2luZGl2aXVhbFN0YXR1cy5pZF0gKyBpbmRpdml1YWxTdGF0dXMuY291bnRcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJsb2JcbiAgICB9LFxuICAgIHtcbiAgICAgIC4uLihoYXNMb2NhbCA/IHsgbG9jYWw6IDEgfSA6IHt9KSxcbiAgICAgIC4uLmZlZGVyYXRlZFNvdXJjZXMucmVkdWNlKChibG9iLCBpZCkgPT4ge1xuICAgICAgICBibG9iW2lkXSA9IDFcbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sIHt9IGFzIHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH0pLFxuICAgICAgLi4uY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAsXG4gICAgfSBhcyB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9XG4gIClcbn1cblxuZXhwb3J0IGNvbnN0IGdldEluZGV4T2ZOb01vcmVSZXN1bHRzRm9yU291cmNlR3JvdXAgPSAoe1xuICBxdWVyeVN0YXR1cyxcbiAgaXNMb2NhbCxcbn06IHtcbiAgcXVlcnlTdGF0dXM6IFF1ZXJ5U3RhdHVzXG4gIGlzTG9jYWw6IChpZDogc3RyaW5nKSA9PiBib29sZWFuXG59KTogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUgPT4ge1xuICBjb25zdCBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwID0gZ2V0SW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCh7XG4gICAgcXVlcnlTdGF0dXMsXG4gICAgaXNMb2NhbCxcbiAgfSlcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXApLnJlZHVjZSgoYmxvYiwga2V5KSA9PiB7XG4gICAgYmxvYltrZXldID0gaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cFtrZXldICsgMVxuICAgIHJldHVybiBibG9iXG4gIH0sIHt9IGFzIEluZGV4Rm9yU291cmNlR3JvdXBUeXBlKVxufVxuXG4vKipcbiAqICBUaGlzIGlzIHRoZSBpbmRleCBvZiB0aGUgZmluYWwgcmVzdWx0IGZvciBhIHNvdXJjZSBncm91cC5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXAgPSAoe1xuICBxdWVyeVN0YXR1cyxcbiAgaXNMb2NhbCxcbn06IHtcbiAgcXVlcnlTdGF0dXM6IFF1ZXJ5U3RhdHVzXG4gIGlzTG9jYWw6IChpZDogc3RyaW5nKSA9PiBib29sZWFuXG59KTogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUgPT4ge1xuICBpZiAoT2JqZWN0LmtleXMocXVlcnlTdGF0dXMpLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICdJbnZhbGlkIGludm9jYXRpb246ICBxdWVyeVN0YXR1cyBpcyByZXF1aXJlZCB0byBkZXRlcm1pbmUgbWF4IGluZGV4IGZvciBhIHF1ZXJ5J1xuICAgIClcbiAgICByZXR1cm4ge31cbiAgfVxuICBjb25zdCBoYXNMb2NhbCA9IE9iamVjdC52YWx1ZXMocXVlcnlTdGF0dXMpLnNvbWUoKHN0YXR1cykgPT5cbiAgICBpc0xvY2FsKHN0YXR1cy5pZClcbiAgKVxuICBjb25zdCBtYXhMb2NhbFN0YXJ0ID0gTWF0aC5tYXgoXG4gICAgMCxcbiAgICBPYmplY3QudmFsdWVzKHF1ZXJ5U3RhdHVzKVxuICAgICAgLmZpbHRlcigoaW5kaXZpdWFsU3RhdHVzKSA9PiBpc0xvY2FsKGluZGl2aXVhbFN0YXR1cy5pZCkpXG4gICAgICAuZmlsdGVyKChpbmRpdml1YWxTdGF0dXMpID0+IGluZGl2aXVhbFN0YXR1cy5oaXRzICE9PSB1bmRlZmluZWQpXG4gICAgICAucmVkdWNlKChibG9iLCBzdGF0dXMpID0+IHtcbiAgICAgICAgcmV0dXJuIGJsb2IgKyBzdGF0dXMuaGl0c1xuICAgICAgfSwgMClcbiAgKVxuICByZXR1cm4gT2JqZWN0LnZhbHVlcyhxdWVyeVN0YXR1cykucmVkdWNlKFxuICAgIChibG9iLCBpbmRpdml1YWxTdGF0dXMpID0+IHtcbiAgICAgIGlmICghaXNMb2NhbChpbmRpdml1YWxTdGF0dXMuaWQpKSB7XG4gICAgICAgIGJsb2JbaW5kaXZpdWFsU3RhdHVzLmlkXSA9IGluZGl2aXVhbFN0YXR1cy5oaXRzXG4gICAgICB9XG4gICAgICByZXR1cm4gYmxvYlxuICAgIH0sXG4gICAge1xuICAgICAgLi4uKGhhc0xvY2FsID8geyBsb2NhbDogbWF4TG9jYWxTdGFydCB9IDoge30pLFxuICAgIH0gYXMgSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbiAgKVxufVxuXG5leHBvcnQgY29uc3QgaGFzUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAgPSAoe1xuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCxcbn06IHtcbiAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG59KTogYm9vbGVhbiA9PiB7XG4gIHJldHVybiAoXG4gICAgT2JqZWN0LnZhbHVlcyhjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCkubGVuZ3RoID4gMCAmJlxuICAgIE9iamVjdC52YWx1ZXMoY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXApLnNvbWUoKHN0YXJ0KSA9PiBzdGFydCAhPT0gMSlcbiAgKVxufVxuXG4vLyBzaG91bGQgbm90IGJlIHVzZWQgb3V0c2lkZSBvZiBjYWxjdWxhdGluZyB0aGUgY29uc3RyYWluZWQgbmV4dCBwYWdlXG5jb25zdCBnZXROZXh0UGFnZUZvclNvdXJjZUdyb3VwID0gKHtcbiAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAsXG4gIHNvdXJjZXMsXG4gIGlzTG9jYWwsXG4gIGNvdW50LFxuICBxdWVyeVN0YXR1cyxcbn06IHtcbiAgc291cmNlczogQXJyYXk8c3RyaW5nPlxuICBpc0xvY2FsOiAoaWQ6IHN0cmluZykgPT4gYm9vbGVhblxuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbiAgY291bnQ6IG51bWJlclxuICBxdWVyeVN0YXR1czogUXVlcnlTdGF0dXNcbn0pOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSA9PiB7XG4gIGNvbnN0IGZpbmFsSW5kZXhGb3JTb3VyY2VHcm91cCA9IGdldEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwKHtcbiAgICBxdWVyeVN0YXR1cyxcbiAgICBpc0xvY2FsLFxuICAgIGNvdW50LFxuICB9KVxuXG4gIGlmIChPYmplY3Qua2V5cyhjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCkubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCkucmVkdWNlKFxuICAgICAgKGJsb2IsIGtleSkgPT4ge1xuICAgICAgICBibG9iW2tleV0gPSBNYXRoLm1pbihibG9iW2tleV0gKyBjb3VudCwgZmluYWxJbmRleEZvclNvdXJjZUdyb3VwW2tleV0pXG4gICAgICAgIHJldHVybiBibG9iXG4gICAgICB9LFxuICAgICAgeyAuLi5jdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCB9IGFzIEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gICAgKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGhhc0xvY2FsID0gc291cmNlcy5zb21lKChpZCkgPT4gaXNMb2NhbChpZCkpXG4gICAgcmV0dXJuIHNvdXJjZXMucmVkdWNlKFxuICAgICAgKGJsb2IsIHNvdXJjZU5hbWUpID0+IHtcbiAgICAgICAgaWYgKCFpc0xvY2FsKHNvdXJjZU5hbWUpKSB7XG4gICAgICAgICAgYmxvYltzb3VyY2VOYW1lXSA9XG4gICAgICAgICAgICBNYXRoLm1pbigxLCBmaW5hbEluZGV4Rm9yU291cmNlR3JvdXBbc291cmNlTmFtZV0pIHx8IDFcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmxvYlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgLi4uKGhhc0xvY2FsID8geyBsb2NhbDogMSB9IDoge30pLFxuICAgICAgfSBhcyBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgaGFzTmV4dFBhZ2VGb3JTb3VyY2VHcm91cCA9ICh7XG4gIHF1ZXJ5U3RhdHVzLFxuICBpc0xvY2FsLFxuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCxcbiAgY291bnQsXG59OiB7XG4gIHF1ZXJ5U3RhdHVzOiBRdWVyeVN0YXR1c1xuICBpc0xvY2FsOiAoaWQ6IHN0cmluZykgPT4gYm9vbGVhblxuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbiAgY291bnQ6IG51bWJlclxufSk6IGJvb2xlYW4gPT4ge1xuICBpZiAoIXF1ZXJ5U3RhdHVzKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjb25zdCBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwID0gZ2V0SW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCh7XG4gICAgcXVlcnlTdGF0dXMsXG4gICAgaXNMb2NhbCxcbiAgfSlcblxuICByZXR1cm4gT2JqZWN0LmtleXMoaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCkuc29tZSgoa2V5KSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwW2tleV0gKyBjb3VudCAtIDEgPFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cFtrZXldXG4gICAgKVxuICB9KVxufVxuXG4vLyBzaG91bGQgbm90IGJlIHVzZWQgb3V0c2lkZSBvZiBjYWxjdWxhdGluZyB0aGUgY29uc3RyYWluZWQgcHJldmlvdXMgcGFnZVxuY29uc3QgZ2V0UHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAgPSAoe1xuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCxcbiAgc291cmNlcyxcbiAgaXNMb2NhbCxcbiAgY291bnQsXG4gIHF1ZXJ5U3RhdHVzLFxufToge1xuICBzb3VyY2VzOiBBcnJheTxzdHJpbmc+XG4gIGlzTG9jYWw6IChpZDogc3RyaW5nKSA9PiBib29sZWFuXG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICBjb3VudDogbnVtYmVyXG4gIHF1ZXJ5U3RhdHVzOiBRdWVyeVN0YXR1c1xufSk6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlID0+IHtcbiAgY29uc3QgZmluYWxJbmRleEZvclNvdXJjZUdyb3VwID0gZ2V0RmluYWxQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgIHF1ZXJ5U3RhdHVzLFxuICAgIGlzTG9jYWwsXG4gICAgY291bnQsXG4gIH0pXG5cbiAgaWYgKE9iamVjdC5rZXlzKGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKS5yZWR1Y2UoXG4gICAgICAoYmxvYiwga2V5KSA9PiB7XG4gICAgICAgIGJsb2Jba2V5XSA9IE1hdGgubWF4KFxuICAgICAgICAgIE1hdGgubWluKGJsb2Jba2V5XSAtIGNvdW50LCBmaW5hbEluZGV4Rm9yU291cmNlR3JvdXBba2V5XSksXG4gICAgICAgICAgMVxuICAgICAgICApXG4gICAgICAgIHJldHVybiBibG9iXG4gICAgICB9LFxuICAgICAgeyAuLi5jdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCB9IGFzIEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gICAgKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGhhc0xvY2FsID0gc291cmNlcy5zb21lKChpZCkgPT4gaXNMb2NhbChpZCkpXG4gICAgcmV0dXJuIHNvdXJjZXMucmVkdWNlKFxuICAgICAgKGJsb2IsIHNvdXJjZU5hbWUpID0+IHtcbiAgICAgICAgaWYgKCFpc0xvY2FsKHNvdXJjZU5hbWUpKSB7XG4gICAgICAgICAgYmxvYltzb3VyY2VOYW1lXSA9XG4gICAgICAgICAgICBNYXRoLm1pbigxLCBmaW5hbEluZGV4Rm9yU291cmNlR3JvdXBbc291cmNlTmFtZV0pIHx8IDFcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmxvYlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgLi4uKGhhc0xvY2FsID8geyBsb2NhbDogMSB9IDoge30pLFxuICAgICAgfSBhcyBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZ2V0Rmlyc3RQYWdlRm9yU291cmNlR3JvdXAgPSAoe1xuICBzb3VyY2VzLFxuICBpc0xvY2FsLFxufToge1xuICBzb3VyY2VzOiBBcnJheTxzdHJpbmc+XG4gIGlzTG9jYWw6IChpZDogc3RyaW5nKSA9PiBib29sZWFuXG59KTogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUgPT4ge1xuICByZXR1cm4gY2FsY3VsYXRlTmV4dEluZGV4Rm9yU291cmNlR3JvdXBOZXh0UGFnZSh7XG4gICAgc291cmNlcyxcbiAgICBpc0xvY2FsLFxuICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gIH0pXG59XG5cbmNvbnN0IGdldEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwID0gKHtcbiAgcXVlcnlTdGF0dXMsXG4gIGlzTG9jYWwsXG4gIGNvdW50LFxufToge1xuICBxdWVyeVN0YXR1czogUXVlcnlTdGF0dXNcbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbiAgY291bnQ6IG51bWJlclxufSk6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlID0+IHtcbiAgaWYgKCFxdWVyeVN0YXR1cykge1xuICAgIHJldHVybiB7fVxuICB9XG4gIGNvbnN0IGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXAgPSBnZXRJbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwKHtcbiAgICBxdWVyeVN0YXR1cyxcbiAgICBpc0xvY2FsLFxuICB9KVxuICByZXR1cm4gT2JqZWN0LmtleXMoaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCkucmVkdWNlKFxuICAgIChibG9iLCBzb3VyY2VOYW1lKSA9PiB7XG4gICAgICBsZXQgcmVtYWluZGVyT25GaW5hbFBhZ2UgPVxuICAgICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwW3NvdXJjZU5hbWVdICUgY291bnRcbiAgICAgIHJlbWFpbmRlck9uRmluYWxQYWdlID1cbiAgICAgICAgcmVtYWluZGVyT25GaW5hbFBhZ2UgPT09IDAgPyBjb3VudCA6IHJlbWFpbmRlck9uRmluYWxQYWdlXG4gICAgICBibG9iW3NvdXJjZU5hbWVdID0gTWF0aC5tYXgoXG4gICAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXBbc291cmNlTmFtZV0gLSByZW1haW5kZXJPbkZpbmFsUGFnZSArIDEsXG4gICAgICAgIDFcbiAgICAgIClcbiAgICAgIHJldHVybiBibG9iXG4gICAgfSxcbiAgICB7XG4gICAgICAuLi5pbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwLFxuICAgIH0gYXMgeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfVxuICApXG59XG5cbmV4cG9ydCB0eXBlIFF1ZXJ5U3RhcnRBbmRFbmRUeXBlID0ge1xuICBzdGFydDogbnVtYmVyXG4gIGVuZDogbnVtYmVyXG4gIGhpdHM6IG51bWJlclxufVxuXG5leHBvcnQgY29uc3QgZ2V0Q3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXAgPSAoe1xuICBxdWVyeVN0YXR1cyxcbiAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAsXG4gIGlzTG9jYWwsXG59OiB7XG4gIHF1ZXJ5U3RhdHVzOiBRdWVyeVN0YXR1c1xuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbn0pOiBRdWVyeVN0YXJ0QW5kRW5kVHlwZSA9PiB7XG4gIGlmICghcXVlcnlTdGF0dXMgfHwgT2JqZWN0LmtleXMocXVlcnlTdGF0dXMpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFydDogMCxcbiAgICAgIGVuZDogMCxcbiAgICAgIGhpdHM6IDAsXG4gICAgfVxuICB9XG4gIGNvbnN0IGxhc3RJbmRleEZvclNvdXJjZUdyb3VwID0gZ2V0SW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCh7XG4gICAgcXVlcnlTdGF0dXMsXG4gICAgaXNMb2NhbCxcbiAgfSlcblxuICBsZXQgc3RhcnQgPSAxXG4gIGNvbnN0IGlzQmVnaW5uaW5nID0gT2JqZWN0LnZhbHVlcyhjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCkuZXZlcnkoXG4gICAgKHN0YXJ0KSA9PiBzdGFydCA9PT0gMVxuICApXG5cbiAgaWYgKCFpc0JlZ2lubmluZykge1xuICAgIHN0YXJ0ID0gT2JqZWN0LmtleXMoY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXApLnJlZHVjZSgoYmxvYiwga2V5KSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBibG9iICtcbiAgICAgICAgTWF0aC5taW4oY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXBba2V5XSwgbGFzdEluZGV4Rm9yU291cmNlR3JvdXBba2V5XSlcbiAgICAgICkgLy8gaWYgd2UgZ28gYmV5b25kIHRoZSBoaXRzLCB3ZSBzaG91bGQgb25seSBhZGQgdGhlIHRvdGFsIGhpdHMgZm9yIHRoYXQgc291cmNlXG4gICAgfSwgMClcbiAgfVxuXG4gIGNvbnN0IGVuZCA9IE9iamVjdC5rZXlzKHF1ZXJ5U3RhdHVzKS5yZWR1Y2UoKGJsb2IsIGtleSkgPT4ge1xuICAgIHJldHVybiBibG9iICsgcXVlcnlTdGF0dXNba2V5XS5jb3VudFxuICB9LCBzdGFydCAtIDEpXG5cbiAgY29uc3QgaGl0cyA9IE9iamVjdC5rZXlzKHF1ZXJ5U3RhdHVzKS5yZWR1Y2UoKGJsb2IsIGtleSkgPT4ge1xuICAgIHJldHVybiBibG9iICsgcXVlcnlTdGF0dXNba2V5XS5oaXRzXG4gIH0sIDApXG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydDogTWF0aC5taW4oc3RhcnQsIGhpdHMpLFxuICAgIGVuZDogTWF0aC5taW4oTWF0aC5tYXgoc3RhcnQsIGVuZCksIGhpdHMpLFxuICAgIGhpdHMsXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RmFydGhlc3RJbmRleEZvclNvdXJjZUdyb3VwKFxuICBzb3VyY2VHcm91cDogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbik6IG51bWJlciB7XG4gIC8vIGZpbmQgdGhlIG1heCBpbmRleCBmb3IgdGhlIHNvdXJjZSBncm91cFxuICByZXR1cm4gTWF0aC5tYXgoLi4uT2JqZWN0LnZhbHVlcyhzb3VyY2VHcm91cCkpXG59XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHRoZSBuZXh0IHBhZ2UgaW5kaWNlcyBmb3IgYSBncm91cCBvZiBzb3VyY2VzIG1ha2Ugc2Vuc2UuICBXZSBkbyB0aGlzIGJ5IGV4YW1pbmluZyB0aGUgZmFydGhlc3QgaW5kZXgsIHNpbmNlIHBhZ2luZyBpcyBkb25lIGluZGl2aWR1YWxseSBmb3IgZWFjaCBzb3VyY2UuXG4gKiBJZiB0aGUgZmFydGhlc3QgaW5kZXggaXMgYmV5b25kIHRoZSBoaXRzIGZvciBhIHNvdXJjZSwgd2UgZXNzZW50aWFsbHkgXCJsb2NrXCIgdGhlIHNvdXJjZSB0byB0aGUgZW5kIHRvIGVuc3VyZSB3ZSBkb24ndCByZWNpZXZlIGZ1cnRoZXIgcmVzdWx0cy5cbiAqKi9cbmV4cG9ydCBjb25zdCBnZXRDb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXAgPSAoe1xuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCxcbiAgc291cmNlcyxcbiAgaXNMb2NhbCxcbiAgY291bnQsXG4gIHF1ZXJ5U3RhdHVzLFxufToge1xuICBzb3VyY2VzOiBBcnJheTxzdHJpbmc+XG4gIGlzTG9jYWw6IChpZDogc3RyaW5nKSA9PiBib29sZWFuXG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICBjb3VudDogbnVtYmVyXG4gIHF1ZXJ5U3RhdHVzOiBRdWVyeVN0YXR1c1xufSk6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlID0+IHtcbiAgY29uc3QgbmV4dFBhZ2VGb3JTb3VyY2VHcm91cCA9IGdldE5leHRQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgIHF1ZXJ5U3RhdHVzLFxuICAgIGlzTG9jYWwsXG4gICAgY291bnQsXG4gICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAsXG4gICAgc291cmNlcyxcbiAgfSlcbiAgY29uc3QgZmFydGhlc3RJbmRleEZvclNvdXJjZUdyb3VwID0gZ2V0RmFydGhlc3RJbmRleEZvclNvdXJjZUdyb3VwKFxuICAgIG5leHRQYWdlRm9yU291cmNlR3JvdXBcbiAgKVxuICBjb25zdCBpbmRleE9mTm9Nb3JlUmVzdWx0c0ZvclNvdXJjZUdyb3VwID1cbiAgICBnZXRJbmRleE9mTm9Nb3JlUmVzdWx0c0ZvclNvdXJjZUdyb3VwKHtcbiAgICAgIHF1ZXJ5U3RhdHVzLFxuICAgICAgaXNMb2NhbCxcbiAgICB9KVxuICByZXR1cm4gT2JqZWN0LmtleXMobmV4dFBhZ2VGb3JTb3VyY2VHcm91cCkucmVkdWNlKFxuICAgIChibG9iLCBzb3VyY2VOYW1lKSA9PiB7XG4gICAgICBpZiAoYmxvYltzb3VyY2VOYW1lXSA8IGZhcnRoZXN0SW5kZXhGb3JTb3VyY2VHcm91cCkge1xuICAgICAgICBibG9iW3NvdXJjZU5hbWVdID0gaW5kZXhPZk5vTW9yZVJlc3VsdHNGb3JTb3VyY2VHcm91cFtzb3VyY2VOYW1lXSAvLyBsb2NrIHRoZSBzb3VyY2UgdG8gdGhlIGVuZCwgc2luY2Ugd2UndmUgZ29uZSBiZXlvbmQgdGhlIGhpdHMgKHdpbGwgZW5zdXJlIG5vIHJlc3VsdHMgY29tZSBiYWNrKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJsb2JcbiAgICB9LFxuICAgIHtcbiAgICAgIC4uLm5leHRQYWdlRm9yU291cmNlR3JvdXAsXG4gICAgfSBhcyB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9XG4gIClcbn1cblxuLyoqXG4gKiAgVGhlIGZpbmFsIGluZGV4IGZvciBhIHNvdXJjZSBncm91cCBpcyBub3QgdGhlIHNhbWUgYXMgdGhlIGZpbmFsIGluZGV4IHdoZW4gdGhpbmtpbmcgYWJvdXQgdGhlIHZlcnkgbGFzdCBwYWdlLCBzaW5jZSB3ZSBoYXZlIG11bHRpcGxlIHNvdXJjZXMuXG4gKiAgU29tZSBzb3VyY2VzIG1heSBoYXZlIGFscmVhZHkgXCJleGhhdXN0ZWRcIiB0aGVpciByZXN1bHRzLCBzbyB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGlmIHdlIGRvbid0IHJldHVybiByZXN1bHRzIHRoYXQgd2UndmUgYWxyZWFkeSBcInBhc3NlZFwiLlxuICovXG5leHBvcnQgY29uc3QgZ2V0Q29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cCA9ICh7XG4gIHF1ZXJ5U3RhdHVzLFxuICBpc0xvY2FsLFxuICBjb3VudCxcbn06IHtcbiAgcXVlcnlTdGF0dXM6IFF1ZXJ5U3RhdHVzXG4gIGlzTG9jYWw6IChpZDogc3RyaW5nKSA9PiBib29sZWFuXG4gIGNvdW50OiBudW1iZXJcbn0pOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSA9PiB7XG4gIGNvbnN0IGZpbmFsUGFnZUZvclNvdXJjZUdyb3VwID0gZ2V0RmluYWxQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgIHF1ZXJ5U3RhdHVzLFxuICAgIGlzTG9jYWwsXG4gICAgY291bnQsXG4gIH0pXG4gIGNvbnN0IG1heEZpbmFsUGFnZUluZGV4Rm9yU291cmNlR3JvdXAgPSBNYXRoLm1heChcbiAgICAuLi5PYmplY3QudmFsdWVzKGZpbmFsUGFnZUZvclNvdXJjZUdyb3VwKVxuICApXG4gIGNvbnN0IGluZGV4T2ZOb01vcmVSZXN1bHRzRm9yU291cmNlR3JvdXAgPVxuICAgIGdldEluZGV4T2ZOb01vcmVSZXN1bHRzRm9yU291cmNlR3JvdXAoe1xuICAgICAgcXVlcnlTdGF0dXMsXG4gICAgICBpc0xvY2FsLFxuICAgIH0pXG4gIHJldHVybiBPYmplY3Qua2V5cyhmaW5hbFBhZ2VGb3JTb3VyY2VHcm91cCkucmVkdWNlKFxuICAgIChibG9iLCBzb3VyY2VOYW1lKSA9PiB7XG4gICAgICBpZiAoYmxvYltzb3VyY2VOYW1lXSA8IG1heEZpbmFsUGFnZUluZGV4Rm9yU291cmNlR3JvdXApIHtcbiAgICAgICAgYmxvYltzb3VyY2VOYW1lXSA9IGluZGV4T2ZOb01vcmVSZXN1bHRzRm9yU291cmNlR3JvdXBbc291cmNlTmFtZV1cbiAgICAgIH1cbiAgICAgIHJldHVybiBibG9iXG4gICAgfSxcbiAgICB7XG4gICAgICAuLi5maW5hbFBhZ2VGb3JTb3VyY2VHcm91cCxcbiAgICB9IGFzIHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH1cbiAgKVxufVxuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCB0aGUgbmV4dCBwYWdlIGluZGljZXMgZm9yIGEgZ3JvdXAgb2Ygc291cmNlcyBtYWtlIHNlbnNlLiAgV2UgZG8gdGhpcyBieSBleGFtaW5pbmcgdGhlIGZhcnRoZXN0IGluZGV4LCBzaW5jZSBwYWdpbmcgaXMgZG9uZSBpbmRpdmlkdWFsbHkgZm9yIGVhY2ggc291cmNlLlxuICogSWYgdGhlIGZhcnRoZXN0IGluZGV4IGlzIGJleW9uZCB0aGUgaGl0cyBmb3IgYSBzb3VyY2UsIHdlIGVzc2VudGlhbGx5IFwibG9ja1wiIHRoZSBzb3VyY2UgdG8gdGhlIGVuZCB0byBlbnN1cmUgd2UgZG9uJ3QgcmVjaWV2ZSBmdXJ0aGVyIHJlc3VsdHMuXG4gKiovXG5leHBvcnQgY29uc3QgZ2V0Q29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCA9ICh7XG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwLFxuICBzb3VyY2VzLFxuICBpc0xvY2FsLFxuICBjb3VudCxcbiAgcXVlcnlTdGF0dXMsXG59OiB7XG4gIHNvdXJjZXM6IEFycmF5PHN0cmluZz5cbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbiAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gIGNvdW50OiBudW1iZXJcbiAgcXVlcnlTdGF0dXM6IFF1ZXJ5U3RhdHVzXG59KTogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUgPT4ge1xuICBpZiAoIXF1ZXJ5U3RhdHVzIHx8IE9iamVjdC5rZXlzKHF1ZXJ5U3RhdHVzKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZ2V0Rmlyc3RQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgICAgc291cmNlcyxcbiAgICAgIGlzTG9jYWwsXG4gICAgfSlcbiAgfVxuICBjb25zdCBwcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCA9IGdldFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwKHtcbiAgICBxdWVyeVN0YXR1cyxcbiAgICBpc0xvY2FsLFxuICAgIGNvdW50LFxuICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwLFxuICAgIHNvdXJjZXMsXG4gIH0pXG4gIGNvbnN0IGZhcnRoZXN0SW5kZXhGb3JTb3VyY2VHcm91cCA9IGdldEZhcnRoZXN0SW5kZXhGb3JTb3VyY2VHcm91cChcbiAgICBwcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cFxuICApXG4gIGNvbnN0IGluZGV4T2ZOb01vcmVSZXN1bHRzRm9yU291cmNlR3JvdXAgPVxuICAgIGdldEluZGV4T2ZOb01vcmVSZXN1bHRzRm9yU291cmNlR3JvdXAoe1xuICAgICAgcXVlcnlTdGF0dXMsXG4gICAgICBpc0xvY2FsLFxuICAgIH0pXG4gIHJldHVybiBPYmplY3Qua2V5cyhwcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCkucmVkdWNlKFxuICAgIChibG9iLCBzb3VyY2VOYW1lKSA9PiB7XG4gICAgICBpZiAoYmxvYltzb3VyY2VOYW1lXSA8IGZhcnRoZXN0SW5kZXhGb3JTb3VyY2VHcm91cCkge1xuICAgICAgICAvLyBuZXZlciBnbyBiZXlvbmQgdGhlIG5vIG1vcmUgcmVzdWx0cyBpbmRleCwgYnV0IG1ha2Ugc3VyZSB3ZSBrZWVwIGluZGV4ZXMgaW4gc3luYyB3aGVuIGdvaW5nIGJhY2t3YXJkc1xuICAgICAgICBibG9iW3NvdXJjZU5hbWVdID0gTWF0aC5taW4oXG4gICAgICAgICAgaW5kZXhPZk5vTW9yZVJlc3VsdHNGb3JTb3VyY2VHcm91cFtzb3VyY2VOYW1lXSxcbiAgICAgICAgICBmYXJ0aGVzdEluZGV4Rm9yU291cmNlR3JvdXBcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJsb2JcbiAgICB9LFxuICAgIHtcbiAgICAgIC4uLnByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwLFxuICAgIH0gYXMgeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfVxuICApXG59XG4iXX0=