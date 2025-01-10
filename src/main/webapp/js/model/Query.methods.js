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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnkubWV0aG9kcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9RdWVyeS5tZXRob2RzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJOztBQXVCSjs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxDQUFDLElBQU0sd0NBQXdDLEdBQUcsVUFBQyxFQVV4RDtRQVRDLG1CQUFnQixFQUFoQixXQUFXLG1CQUFHLEVBQUUsS0FBQSxFQUNoQixPQUFPLGFBQUEsRUFDUCxPQUFPLGFBQUEsRUFDUCwwQkFBMEIsZ0NBQUE7SUFPMUIsSUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUNwRDtRQUNBLE1BQU0sMEZBQTBGLENBQUE7S0FDakc7SUFDRCxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQyxFQUFFO1FBQ3pDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDckIsQ0FBQyxDQUFDLENBQUE7SUFDRixJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBRSxJQUFLLE9BQUEsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFYLENBQVcsQ0FBQyxDQUFBO0lBQ2xELElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQzVCLENBQUMsRUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztTQUN2QixNQUFNLENBQUMsVUFBQyxlQUFlLElBQUssT0FBQSxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxFQUEzQixDQUEyQixDQUFDO1NBQ3hELE1BQU0sQ0FBQyxVQUFDLGVBQWUsSUFBSyxPQUFBLGVBQWUsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFsQyxDQUFrQyxDQUFDO1NBQy9ELE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxNQUFNO1FBQ25CLE9BQU8sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7SUFDM0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNSLENBQUE7SUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUN0QyxVQUFDLElBQUksRUFBRSxlQUFlO1FBQ3BCLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDdEIsYUFBYSxFQUNiLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUN0QyxDQUFBO1NBQ0Y7YUFBTTtZQUNMLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDakMsZUFBZSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2pFLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FDakQsQ0FBQTtTQUNGO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLEVBQ0QsK0JBQ0ssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FDOUIsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLEVBQUU7UUFDbEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNaLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQyxFQUFFLEVBQStCLENBQUMsR0FDaEMsMEJBQTBCLENBQ0QsQ0FDL0IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLHFDQUFxQyxHQUFHLFVBQUMsRUFNckQ7UUFMQyxXQUFXLGlCQUFBLEVBQ1gsT0FBTyxhQUFBO0lBS1AsSUFBTSwrQkFBK0IsR0FBRyxrQ0FBa0MsQ0FBQztRQUN6RSxXQUFXLGFBQUE7UUFDWCxPQUFPLFNBQUE7S0FDUixDQUFDLENBQUE7SUFDRixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsR0FBRztRQUNuRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsK0JBQStCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQyxFQUFFLEVBQTZCLENBQUMsQ0FBQTtBQUNuQyxDQUFDLENBQUE7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLGtDQUFrQyxHQUFHLFVBQUMsRUFNbEQ7UUFMQyxXQUFXLGlCQUFBLEVBQ1gsT0FBTyxhQUFBO0lBS1AsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDekMsT0FBTyxDQUFDLElBQUksQ0FDVixpRkFBaUYsQ0FDbEYsQ0FBQTtRQUNELE9BQU8sRUFBRSxDQUFBO0tBQ1Y7SUFDRCxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU07UUFDdEQsT0FBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUFsQixDQUFrQixDQUNuQixDQUFBO0lBQ0QsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDNUIsQ0FBQyxFQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1NBQ3ZCLE1BQU0sQ0FBQyxVQUFDLGVBQWUsSUFBSyxPQUFBLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEVBQTNCLENBQTJCLENBQUM7U0FDeEQsTUFBTSxDQUFDLFVBQUMsZUFBZSxJQUFLLE9BQUEsZUFBZSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQWxDLENBQWtDLENBQUM7U0FDL0QsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLE1BQU07UUFDbkIsT0FBTyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQTtJQUMzQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ1IsQ0FBQTtJQUNELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQ3RDLFVBQUMsSUFBSSxFQUFFLGVBQWU7UUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFBO1NBQ2hEO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLEVBQ0QsYUFDSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUNuQixDQUM3QixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLElBQU0sNkJBQTZCLEdBQUcsVUFBQyxFQUk3QztRQUhDLDBCQUEwQixnQ0FBQTtJQUkxQixPQUFPLENBQ0wsTUFBTSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLEtBQUssQ0FBQyxFQUFYLENBQVcsQ0FBQyxDQUN2RSxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsc0VBQXNFO0FBQ3RFLElBQU0seUJBQXlCLEdBQUcsVUFBQyxFQVlsQztRQVhDLDBCQUEwQixnQ0FBQSxFQUMxQixPQUFPLGFBQUEsRUFDUCxPQUFPLGFBQUEsRUFDUCxLQUFLLFdBQUEsRUFDTCxXQUFXLGlCQUFBO0lBUVgsSUFBTSx3QkFBd0IsR0FBRywwQkFBMEIsQ0FBQztRQUMxRCxXQUFXLGFBQUE7UUFDWCxPQUFPLFNBQUE7UUFDUCxLQUFLLE9BQUE7S0FDTixDQUFDLENBQUE7SUFFRixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3RELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sQ0FDbkQsVUFBQyxJQUFJLEVBQUUsR0FBRztZQUNSLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUN0RSxPQUFPLElBQUksQ0FBQTtRQUNiLENBQUMsRUFDRCxhQUFLLDBCQUEwQixDQUE2QixDQUM3RCxDQUFBO0tBQ0Y7U0FBTTtRQUNMLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQyxFQUFFLElBQUssT0FBQSxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQVgsQ0FBVyxDQUFDLENBQUE7UUFDbEQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUNuQixVQUFDLElBQUksRUFBRSxVQUFVO1lBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQztvQkFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTthQUN6RDtZQUNELE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQyxFQUNELGFBQ0ssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FDUCxDQUM3QixDQUFBO0tBQ0Y7QUFDSCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSx5QkFBeUIsR0FBRyxVQUFDLEVBVXpDO1FBVEMsV0FBVyxpQkFBQSxFQUNYLE9BQU8sYUFBQSxFQUNQLDBCQUEwQixnQ0FBQSxFQUMxQixLQUFLLFdBQUE7SUFPTCxJQUFJLENBQUMsV0FBVyxFQUFFO1FBQ2hCLE9BQU8sS0FBSyxDQUFBO0tBQ2I7SUFFRCxJQUFNLCtCQUErQixHQUFHLGtDQUFrQyxDQUFDO1FBQ3pFLFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtLQUNSLENBQUMsQ0FBQTtJQUVGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUc7UUFDM0QsT0FBTyxDQUNMLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDO1lBQzNDLCtCQUErQixDQUFDLEdBQUcsQ0FBQyxDQUNyQyxDQUFBO0lBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUE7QUFFRCwwRUFBMEU7QUFDMUUsSUFBTSw2QkFBNkIsR0FBRyxVQUFDLEVBWXRDO1FBWEMsMEJBQTBCLGdDQUFBLEVBQzFCLE9BQU8sYUFBQSxFQUNQLE9BQU8sYUFBQSxFQUNQLEtBQUssV0FBQSxFQUNMLFdBQVcsaUJBQUE7SUFRWCxJQUFNLHdCQUF3QixHQUFHLDBCQUEwQixDQUFDO1FBQzFELFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtRQUNQLEtBQUssT0FBQTtLQUNOLENBQUMsQ0FBQTtJQUVGLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDdEQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsTUFBTSxDQUNuRCxVQUFDLElBQUksRUFBRSxHQUFHO1lBQ1IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUMxRCxDQUFDLENBQ0YsQ0FBQTtZQUNELE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQyxFQUNELGFBQUssMEJBQTBCLENBQTZCLENBQzdELENBQUE7S0FDRjtTQUFNO1FBQ0wsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQUUsSUFBSyxPQUFBLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBWCxDQUFXLENBQUMsQ0FBQTtRQUNsRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQ25CLFVBQUMsSUFBSSxFQUFFLFVBQVU7WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDO29CQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO2FBQ3pEO1lBQ0QsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLEVBQ0QsYUFDSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUNQLENBQzdCLENBQUE7S0FDRjtBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLDBCQUEwQixHQUFHLFVBQUMsRUFNMUM7UUFMQyxPQUFPLGFBQUEsRUFDUCxPQUFPLGFBQUE7SUFLUCxPQUFPLHdDQUF3QyxDQUFDO1FBQzlDLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLFdBQVcsRUFBRSxFQUFFO1FBQ2YsMEJBQTBCLEVBQUUsRUFBRTtLQUMvQixDQUFDLENBQUE7QUFDSixDQUFDLENBQUE7QUFFRCxJQUFNLDBCQUEwQixHQUFHLFVBQUMsRUFRbkM7UUFQQyxXQUFXLGlCQUFBLEVBQ1gsT0FBTyxhQUFBLEVBQ1AsS0FBSyxXQUFBO0lBTUwsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUNoQixPQUFPLEVBQUUsQ0FBQTtLQUNWO0lBQ0QsSUFBTSwrQkFBK0IsR0FBRyxrQ0FBa0MsQ0FBQztRQUN6RSxXQUFXLGFBQUE7UUFDWCxPQUFPLFNBQUE7S0FDUixDQUFDLENBQUE7SUFDRixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQyxNQUFNLENBQ3hELFVBQUMsSUFBSSxFQUFFLFVBQVU7UUFDZixJQUFJLG9CQUFvQixHQUN0QiwrQkFBK0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDckQsb0JBQW9CO1lBQ2xCLG9CQUFvQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQTtRQUMzRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDekIsK0JBQStCLENBQUMsVUFBVSxDQUFDLEdBQUcsb0JBQW9CLEdBQUcsQ0FBQyxFQUN0RSxDQUFDLENBQ0YsQ0FBQTtRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQyxFQUNELGFBQ0ssK0JBQStCLENBQ04sQ0FDL0IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQVFELE1BQU0sQ0FBQyxJQUFNLG1DQUFtQyxHQUFHLFVBQUMsRUFRbkQ7UUFQQyxXQUFXLGlCQUFBLEVBQ1gsMEJBQTBCLGdDQUFBLEVBQzFCLE9BQU8sYUFBQTtJQU1QLElBQUksQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3pELE9BQU87WUFDTCxLQUFLLEVBQUUsQ0FBQztZQUNSLEdBQUcsRUFBRSxDQUFDO1lBQ04sSUFBSSxFQUFFLENBQUM7U0FDUixDQUFBO0tBQ0Y7SUFDRCxJQUFNLHVCQUF1QixHQUFHLGtDQUFrQyxDQUFDO1FBQ2pFLFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtLQUNSLENBQUMsQ0FBQTtJQUVGLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQTtJQUNiLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxLQUFLLENBQ2pFLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxLQUFLLENBQUMsRUFBWCxDQUFXLENBQ3ZCLENBQUE7SUFFRCxJQUFJLENBQUMsV0FBVyxFQUFFO1FBQ2hCLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLEdBQUc7WUFDL0QsT0FBTyxDQUNMLElBQUk7Z0JBQ0osSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUN4RSxDQUFBLENBQUMsOEVBQThFO1FBQ2xGLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUNOO0lBRUQsSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsR0FBRztRQUNwRCxPQUFPLElBQUksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFBO0lBQ3RDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFYixJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxHQUFHO1FBQ3JELE9BQU8sSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDckMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRUwsT0FBTztRQUNMLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7UUFDNUIsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDO1FBQ3pDLElBQUksTUFBQTtLQUNMLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxTQUFTLDhCQUE4QixDQUNyQyxXQUFvQztJQUVwQywwQ0FBMEM7SUFDMUMsT0FBTyxJQUFJLENBQUMsR0FBRyxPQUFSLElBQUksMkJBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBQztBQUNoRCxDQUFDO0FBRUQ7OztJQUdJO0FBQ0osTUFBTSxDQUFDLElBQU0sb0NBQW9DLEdBQUcsVUFBQyxFQVlwRDtRQVhDLDBCQUEwQixnQ0FBQSxFQUMxQixPQUFPLGFBQUEsRUFDUCxPQUFPLGFBQUEsRUFDUCxLQUFLLFdBQUEsRUFDTCxXQUFXLGlCQUFBO0lBUVgsSUFBTSxzQkFBc0IsR0FBRyx5QkFBeUIsQ0FBQztRQUN2RCxXQUFXLGFBQUE7UUFDWCxPQUFPLFNBQUE7UUFDUCxLQUFLLE9BQUE7UUFDTCwwQkFBMEIsNEJBQUE7UUFDMUIsT0FBTyxTQUFBO0tBQ1IsQ0FBQyxDQUFBO0lBQ0YsSUFBTSwyQkFBMkIsR0FBRyw4QkFBOEIsQ0FDaEUsc0JBQXNCLENBQ3ZCLENBQUE7SUFDRCxJQUFNLGtDQUFrQyxHQUN0QyxxQ0FBcUMsQ0FBQztRQUNwQyxXQUFXLGFBQUE7UUFDWCxPQUFPLFNBQUE7S0FDUixDQUFDLENBQUE7SUFDSixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLENBQy9DLFVBQUMsSUFBSSxFQUFFLFVBQVU7UUFDZixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRywyQkFBMkIsRUFBRTtZQUNsRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsa0NBQWtDLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQyxrR0FBa0c7U0FDcks7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUMsRUFDRCxhQUNLLHNCQUFzQixDQUNHLENBQy9CLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsSUFBTSxxQ0FBcUMsR0FBRyxVQUFDLEVBUXJEO1FBUEMsV0FBVyxpQkFBQSxFQUNYLE9BQU8sYUFBQSxFQUNQLEtBQUssV0FBQTtJQU1MLElBQU0sdUJBQXVCLEdBQUcsMEJBQTBCLENBQUM7UUFDekQsV0FBVyxhQUFBO1FBQ1gsT0FBTyxTQUFBO1FBQ1AsS0FBSyxPQUFBO0tBQ04sQ0FBQyxDQUFBO0lBQ0YsSUFBTSwrQkFBK0IsR0FBRyxJQUFJLENBQUMsR0FBRyxPQUFSLElBQUksMkJBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsVUFDMUMsQ0FBQTtJQUNELElBQU0sa0NBQWtDLEdBQ3RDLHFDQUFxQyxDQUFDO1FBQ3BDLFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtLQUNSLENBQUMsQ0FBQTtJQUNKLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLE1BQU0sQ0FDaEQsVUFBQyxJQUFJLEVBQUUsVUFBVTtRQUNmLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLCtCQUErQixFQUFFO1lBQ3RELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxrQ0FBa0MsQ0FBQyxVQUFVLENBQUMsQ0FBQTtTQUNsRTtRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQyxFQUNELGFBQ0ssdUJBQXVCLENBQ0UsQ0FDL0IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVEOzs7SUFHSTtBQUNKLE1BQU0sQ0FBQyxJQUFNLHdDQUF3QyxHQUFHLFVBQUMsRUFZeEQ7UUFYQywwQkFBMEIsZ0NBQUEsRUFDMUIsT0FBTyxhQUFBLEVBQ1AsT0FBTyxhQUFBLEVBQ1AsS0FBSyxXQUFBLEVBQ0wsV0FBVyxpQkFBQTtJQVFYLElBQUksQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3pELE9BQU8sMEJBQTBCLENBQUM7WUFDaEMsT0FBTyxTQUFBO1lBQ1AsT0FBTyxTQUFBO1NBQ1IsQ0FBQyxDQUFBO0tBQ0g7SUFDRCxJQUFNLDBCQUEwQixHQUFHLDZCQUE2QixDQUFDO1FBQy9ELFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtRQUNQLEtBQUssT0FBQTtRQUNMLDBCQUEwQiw0QkFBQTtRQUMxQixPQUFPLFNBQUE7S0FDUixDQUFDLENBQUE7SUFDRixJQUFNLDJCQUEyQixHQUFHLDhCQUE4QixDQUNoRSwwQkFBMEIsQ0FDM0IsQ0FBQTtJQUNELElBQU0sa0NBQWtDLEdBQ3RDLHFDQUFxQyxDQUFDO1FBQ3BDLFdBQVcsYUFBQTtRQUNYLE9BQU8sU0FBQTtLQUNSLENBQUMsQ0FBQTtJQUNKLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sQ0FDbkQsVUFBQyxJQUFJLEVBQUUsVUFBVTtRQUNmLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLDJCQUEyQixFQUFFO1lBQ2xELHdHQUF3RztZQUN4RyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDekIsa0NBQWtDLENBQUMsVUFBVSxDQUFDLEVBQzlDLDJCQUEyQixDQUM1QixDQUFBO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUMsRUFDRCxhQUNLLDBCQUEwQixDQUNELENBQy9CLENBQUE7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuLy8gc2xvd2x5IHNlcGVyYXRlIG91dCBtZXRob2RzIGZyb20gUXVlcnkgbW9kZWwgKHdoaWNoIGhhcyBhIGxvdCBvZiBkZXBlbmRlbmNpZXMpIHRvIGhlcmUsIHdoZXJlIHdlIGNhbiBpbXBvcnQgdGhlbSBpbiBhIHNwZWMgYW5kIHRlc3QgdGhlbVxuXG5leHBvcnQgdHlwZSBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSA9IHtcbiAgW2tleTogc3RyaW5nXTogbnVtYmVyXG59XG5cbmV4cG9ydCB0eXBlIFNvdXJjZVN0YXR1cyA9IHtcbiAgaWQ6IHN0cmluZ1xuICBjb3VudDogbnVtYmVyXG4gIGhhc1JldHVybmVkOiBib29sZWFuXG4gIGhpdHM6IG51bWJlclxuICBlbGFwc2VkOiBudW1iZXJcbiAgc3VjY2Vzc2Z1bDogYm9vbGVhblxuICB3YXJuaW5nczogW11cbn1cblxuLy8ga2V5IGlzIGdvaW5nIHRvIGJlIGlkIGluIFNvdXJjZVN0YXR1c1xuZXhwb3J0IHR5cGUgUXVlcnlTdGF0dXMgPSB7XG4gIFtrZXk6IHN0cmluZ106IFNvdXJjZVN0YXR1c1xufVxuXG4vKipcbiAqICBXZSB1c2UgdGhlIGN1cnJlbnQgc3RhdHVzICsgY3VycmVudCBpbmRleCB0byBjYWxjdWxhdGUgbmV4dCBpbmRleC5cbiAqICBMb2NhbCBzb3VyY2VzIGdldCBncm91cGVkIGludG8gYSBzaW5nbGUgaW5kZXguXG4gKlxuICogIElmIGN1cnJlbnQgaW5kZXggaXMgYmxhbmsgaXQncyBhc3N1bWVkIHRvIGJlIHRoZSBzdGFydC5cbiAqXG4gKiAgV2UgdGhyb3cgYW4gZXJyb3IgaWYgc3RhdHVzIGlzIHByb3ZpZGVkIHdoaWxlIGN1cnJlbnQgaW5kZXggaXMgYmxhbmssIGFzIHRoYXQgZG9lc24ndCBtYWtlIHNlbnNlLlxuICpcbiAqICBOb3RpY2UgdGhhdCBhIGdvb2QgY2h1bmsgb2YgdGhlIGxvZ2ljIGlzIGRlZGljYXRlZCB0byBlbnN1cmluZyB3ZSBkb24ndCBnbyBiZXlvbmQgaGl0cy5cbiAqICBMb2NhbGx5IHRoaXMgZG9lc24ndCBtYXR0ZXIsIGJ1dCByZW1vdGUgc291cmNlcyB0ZW5kIHRvIHRocm93IGVycm9ycyBpZiB3ZSBkby5cbiAqL1xuZXhwb3J0IGNvbnN0IGNhbGN1bGF0ZU5leHRJbmRleEZvclNvdXJjZUdyb3VwTmV4dFBhZ2UgPSAoe1xuICBxdWVyeVN0YXR1cyA9IHt9LFxuICBzb3VyY2VzLFxuICBpc0xvY2FsLFxuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCxcbn06IHtcbiAgcXVlcnlTdGF0dXM6IFF1ZXJ5U3RhdHVzXG4gIHNvdXJjZXM6IEFycmF5PHN0cmluZz5cbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbiAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG59KTogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUgPT4ge1xuICBpZiAoXG4gICAgT2JqZWN0LmtleXMocXVlcnlTdGF0dXMpLmxlbmd0aCA+IDAgJiZcbiAgICBPYmplY3Qua2V5cyhjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCkubGVuZ3RoID09PSAwXG4gICkge1xuICAgIHRocm93ICdJbnZhbGlkIGludm9jYXRpb246ICBxdWVyeVN0YXR1cyBjYW5ub3QgYmUgcHJvdmlkZWQgaWYgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAgaXMgbm90J1xuICB9XG4gIGNvbnN0IGZlZGVyYXRlZFNvdXJjZXMgPSBzb3VyY2VzLmZpbHRlcigoaWQpID0+IHtcbiAgICByZXR1cm4gIWlzTG9jYWwoaWQpXG4gIH0pXG4gIGNvbnN0IGhhc0xvY2FsID0gc291cmNlcy5zb21lKChpZCkgPT4gaXNMb2NhbChpZCkpXG4gIGNvbnN0IG1heExvY2FsU3RhcnQgPSBNYXRoLm1heChcbiAgICAxLFxuICAgIE9iamVjdC52YWx1ZXMocXVlcnlTdGF0dXMpXG4gICAgICAuZmlsdGVyKChpbmRpdml1YWxTdGF0dXMpID0+IGlzTG9jYWwoaW5kaXZpdWFsU3RhdHVzLmlkKSlcbiAgICAgIC5maWx0ZXIoKGluZGl2aXVhbFN0YXR1cykgPT4gaW5kaXZpdWFsU3RhdHVzLmhpdHMgIT09IHVuZGVmaW5lZClcbiAgICAgIC5yZWR1Y2UoKGJsb2IsIHN0YXR1cykgPT4ge1xuICAgICAgICByZXR1cm4gYmxvYiArIHN0YXR1cy5oaXRzXG4gICAgICB9LCAxKVxuICApXG4gIHJldHVybiBPYmplY3QudmFsdWVzKHF1ZXJ5U3RhdHVzKS5yZWR1Y2UoXG4gICAgKGJsb2IsIGluZGl2aXVhbFN0YXR1cykgPT4ge1xuICAgICAgaWYgKGlzTG9jYWwoaW5kaXZpdWFsU3RhdHVzLmlkKSkge1xuICAgICAgICBibG9iWydsb2NhbCddID0gTWF0aC5taW4oXG4gICAgICAgICAgbWF4TG9jYWxTdGFydCxcbiAgICAgICAgICBibG9iWydsb2NhbCddICsgaW5kaXZpdWFsU3RhdHVzLmNvdW50XG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJsb2JbaW5kaXZpdWFsU3RhdHVzLmlkXSA9IE1hdGgubWluKFxuICAgICAgICAgIGluZGl2aXVhbFN0YXR1cy5oaXRzICE9PSB1bmRlZmluZWQgPyBpbmRpdml1YWxTdGF0dXMuaGl0cyArIDEgOiAxLFxuICAgICAgICAgIGJsb2JbaW5kaXZpdWFsU3RhdHVzLmlkXSArIGluZGl2aXVhbFN0YXR1cy5jb3VudFxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gYmxvYlxuICAgIH0sXG4gICAge1xuICAgICAgLi4uKGhhc0xvY2FsID8geyBsb2NhbDogMSB9IDoge30pLFxuICAgICAgLi4uZmVkZXJhdGVkU291cmNlcy5yZWR1Y2UoKGJsb2IsIGlkKSA9PiB7XG4gICAgICAgIGJsb2JbaWRdID0gMVxuICAgICAgICByZXR1cm4gYmxvYlxuICAgICAgfSwge30gYXMgeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSksXG4gICAgICAuLi5jdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCxcbiAgICB9IGFzIHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH1cbiAgKVxufVxuXG5leHBvcnQgY29uc3QgZ2V0SW5kZXhPZk5vTW9yZVJlc3VsdHNGb3JTb3VyY2VHcm91cCA9ICh7XG4gIHF1ZXJ5U3RhdHVzLFxuICBpc0xvY2FsLFxufToge1xuICBxdWVyeVN0YXR1czogUXVlcnlTdGF0dXNcbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbn0pOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSA9PiB7XG4gIGNvbnN0IGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXAgPSBnZXRJbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwKHtcbiAgICBxdWVyeVN0YXR1cyxcbiAgICBpc0xvY2FsLFxuICB9KVxuICByZXR1cm4gT2JqZWN0LmtleXMoaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCkucmVkdWNlKChibG9iLCBrZXkpID0+IHtcbiAgICBibG9iW2tleV0gPSBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwW2tleV0gKyAxXG4gICAgcmV0dXJuIGJsb2JcbiAgfSwge30gYXMgSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUpXG59XG5cbi8qKlxuICogIFRoaXMgaXMgdGhlIGluZGV4IG9mIHRoZSBmaW5hbCByZXN1bHQgZm9yIGEgc291cmNlIGdyb3VwLlxuICovXG5leHBvcnQgY29uc3QgZ2V0SW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCA9ICh7XG4gIHF1ZXJ5U3RhdHVzLFxuICBpc0xvY2FsLFxufToge1xuICBxdWVyeVN0YXR1czogUXVlcnlTdGF0dXNcbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbn0pOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSA9PiB7XG4gIGlmIChPYmplY3Qua2V5cyhxdWVyeVN0YXR1cykubGVuZ3RoID09PSAwKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ0ludmFsaWQgaW52b2NhdGlvbjogIHF1ZXJ5U3RhdHVzIGlzIHJlcXVpcmVkIHRvIGRldGVybWluZSBtYXggaW5kZXggZm9yIGEgcXVlcnknXG4gICAgKVxuICAgIHJldHVybiB7fVxuICB9XG4gIGNvbnN0IGhhc0xvY2FsID0gT2JqZWN0LnZhbHVlcyhxdWVyeVN0YXR1cykuc29tZSgoc3RhdHVzKSA9PlxuICAgIGlzTG9jYWwoc3RhdHVzLmlkKVxuICApXG4gIGNvbnN0IG1heExvY2FsU3RhcnQgPSBNYXRoLm1heChcbiAgICAwLFxuICAgIE9iamVjdC52YWx1ZXMocXVlcnlTdGF0dXMpXG4gICAgICAuZmlsdGVyKChpbmRpdml1YWxTdGF0dXMpID0+IGlzTG9jYWwoaW5kaXZpdWFsU3RhdHVzLmlkKSlcbiAgICAgIC5maWx0ZXIoKGluZGl2aXVhbFN0YXR1cykgPT4gaW5kaXZpdWFsU3RhdHVzLmhpdHMgIT09IHVuZGVmaW5lZClcbiAgICAgIC5yZWR1Y2UoKGJsb2IsIHN0YXR1cykgPT4ge1xuICAgICAgICByZXR1cm4gYmxvYiArIHN0YXR1cy5oaXRzXG4gICAgICB9LCAwKVxuICApXG4gIHJldHVybiBPYmplY3QudmFsdWVzKHF1ZXJ5U3RhdHVzKS5yZWR1Y2UoXG4gICAgKGJsb2IsIGluZGl2aXVhbFN0YXR1cykgPT4ge1xuICAgICAgaWYgKCFpc0xvY2FsKGluZGl2aXVhbFN0YXR1cy5pZCkpIHtcbiAgICAgICAgYmxvYltpbmRpdml1YWxTdGF0dXMuaWRdID0gaW5kaXZpdWFsU3RhdHVzLmhpdHNcbiAgICAgIH1cbiAgICAgIHJldHVybiBibG9iXG4gICAgfSxcbiAgICB7XG4gICAgICAuLi4oaGFzTG9jYWwgPyB7IGxvY2FsOiBtYXhMb2NhbFN0YXJ0IH0gOiB7fSksXG4gICAgfSBhcyBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICApXG59XG5cbmV4cG9ydCBjb25zdCBoYXNQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCA9ICh7XG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwLFxufToge1xuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbn0pOiBib29sZWFuID0+IHtcbiAgcmV0dXJuIChcbiAgICBPYmplY3QudmFsdWVzKGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKS5sZW5ndGggPiAwICYmXG4gICAgT2JqZWN0LnZhbHVlcyhjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCkuc29tZSgoc3RhcnQpID0+IHN0YXJ0ICE9PSAxKVxuICApXG59XG5cbi8vIHNob3VsZCBub3QgYmUgdXNlZCBvdXRzaWRlIG9mIGNhbGN1bGF0aW5nIHRoZSBjb25zdHJhaW5lZCBuZXh0IHBhZ2VcbmNvbnN0IGdldE5leHRQYWdlRm9yU291cmNlR3JvdXAgPSAoe1xuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCxcbiAgc291cmNlcyxcbiAgaXNMb2NhbCxcbiAgY291bnQsXG4gIHF1ZXJ5U3RhdHVzLFxufToge1xuICBzb3VyY2VzOiBBcnJheTxzdHJpbmc+XG4gIGlzTG9jYWw6IChpZDogc3RyaW5nKSA9PiBib29sZWFuXG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICBjb3VudDogbnVtYmVyXG4gIHF1ZXJ5U3RhdHVzOiBRdWVyeVN0YXR1c1xufSk6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlID0+IHtcbiAgY29uc3QgZmluYWxJbmRleEZvclNvdXJjZUdyb3VwID0gZ2V0RmluYWxQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgIHF1ZXJ5U3RhdHVzLFxuICAgIGlzTG9jYWwsXG4gICAgY291bnQsXG4gIH0pXG5cbiAgaWYgKE9iamVjdC5rZXlzKGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKS5yZWR1Y2UoXG4gICAgICAoYmxvYiwga2V5KSA9PiB7XG4gICAgICAgIGJsb2Jba2V5XSA9IE1hdGgubWluKGJsb2Jba2V5XSArIGNvdW50LCBmaW5hbEluZGV4Rm9yU291cmNlR3JvdXBba2V5XSlcbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sXG4gICAgICB7IC4uLmN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwIH0gYXMgSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbiAgICApXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgaGFzTG9jYWwgPSBzb3VyY2VzLnNvbWUoKGlkKSA9PiBpc0xvY2FsKGlkKSlcbiAgICByZXR1cm4gc291cmNlcy5yZWR1Y2UoXG4gICAgICAoYmxvYiwgc291cmNlTmFtZSkgPT4ge1xuICAgICAgICBpZiAoIWlzTG9jYWwoc291cmNlTmFtZSkpIHtcbiAgICAgICAgICBibG9iW3NvdXJjZU5hbWVdID1cbiAgICAgICAgICAgIE1hdGgubWluKDEsIGZpbmFsSW5kZXhGb3JTb3VyY2VHcm91cFtzb3VyY2VOYW1lXSkgfHwgMVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBibG9iXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAuLi4oaGFzTG9jYWwgPyB7IGxvY2FsOiAxIH0gOiB7fSksXG4gICAgICB9IGFzIEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBoYXNOZXh0UGFnZUZvclNvdXJjZUdyb3VwID0gKHtcbiAgcXVlcnlTdGF0dXMsXG4gIGlzTG9jYWwsXG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwLFxuICBjb3VudCxcbn06IHtcbiAgcXVlcnlTdGF0dXM6IFF1ZXJ5U3RhdHVzXG4gIGlzTG9jYWw6IChpZDogc3RyaW5nKSA9PiBib29sZWFuXG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICBjb3VudDogbnVtYmVyXG59KTogYm9vbGVhbiA9PiB7XG4gIGlmICghcXVlcnlTdGF0dXMpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNvbnN0IGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXAgPSBnZXRJbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwKHtcbiAgICBxdWVyeVN0YXR1cyxcbiAgICBpc0xvY2FsLFxuICB9KVxuXG4gIHJldHVybiBPYmplY3Qua2V5cyhpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwKS5zb21lKChrZXkpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXBba2V5XSArIGNvdW50IC0gMSA8XG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwW2tleV1cbiAgICApXG4gIH0pXG59XG5cbi8vIHNob3VsZCBub3QgYmUgdXNlZCBvdXRzaWRlIG9mIGNhbGN1bGF0aW5nIHRoZSBjb25zdHJhaW5lZCBwcmV2aW91cyBwYWdlXG5jb25zdCBnZXRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCA9ICh7XG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwLFxuICBzb3VyY2VzLFxuICBpc0xvY2FsLFxuICBjb3VudCxcbiAgcXVlcnlTdGF0dXMsXG59OiB7XG4gIHNvdXJjZXM6IEFycmF5PHN0cmluZz5cbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbiAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gIGNvdW50OiBudW1iZXJcbiAgcXVlcnlTdGF0dXM6IFF1ZXJ5U3RhdHVzXG59KTogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUgPT4ge1xuICBjb25zdCBmaW5hbEluZGV4Rm9yU291cmNlR3JvdXAgPSBnZXRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgcXVlcnlTdGF0dXMsXG4gICAgaXNMb2NhbCxcbiAgICBjb3VudCxcbiAgfSlcblxuICBpZiAoT2JqZWN0LmtleXMoY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXApLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXApLnJlZHVjZShcbiAgICAgIChibG9iLCBrZXkpID0+IHtcbiAgICAgICAgYmxvYltrZXldID0gTWF0aC5tYXgoXG4gICAgICAgICAgTWF0aC5taW4oYmxvYltrZXldIC0gY291bnQsIGZpbmFsSW5kZXhGb3JTb3VyY2VHcm91cFtrZXldKSxcbiAgICAgICAgICAxXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sXG4gICAgICB7IC4uLmN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwIH0gYXMgSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbiAgICApXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgaGFzTG9jYWwgPSBzb3VyY2VzLnNvbWUoKGlkKSA9PiBpc0xvY2FsKGlkKSlcbiAgICByZXR1cm4gc291cmNlcy5yZWR1Y2UoXG4gICAgICAoYmxvYiwgc291cmNlTmFtZSkgPT4ge1xuICAgICAgICBpZiAoIWlzTG9jYWwoc291cmNlTmFtZSkpIHtcbiAgICAgICAgICBibG9iW3NvdXJjZU5hbWVdID1cbiAgICAgICAgICAgIE1hdGgubWluKDEsIGZpbmFsSW5kZXhGb3JTb3VyY2VHcm91cFtzb3VyY2VOYW1lXSkgfHwgMVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBibG9iXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAuLi4oaGFzTG9jYWwgPyB7IGxvY2FsOiAxIH0gOiB7fSksXG4gICAgICB9IGFzIEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnZXRGaXJzdFBhZ2VGb3JTb3VyY2VHcm91cCA9ICh7XG4gIHNvdXJjZXMsXG4gIGlzTG9jYWwsXG59OiB7XG4gIHNvdXJjZXM6IEFycmF5PHN0cmluZz5cbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbn0pOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSA9PiB7XG4gIHJldHVybiBjYWxjdWxhdGVOZXh0SW5kZXhGb3JTb3VyY2VHcm91cE5leHRQYWdlKHtcbiAgICBzb3VyY2VzLFxuICAgIGlzTG9jYWwsXG4gICAgcXVlcnlTdGF0dXM6IHt9LFxuICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgfSlcbn1cblxuY29uc3QgZ2V0RmluYWxQYWdlRm9yU291cmNlR3JvdXAgPSAoe1xuICBxdWVyeVN0YXR1cyxcbiAgaXNMb2NhbCxcbiAgY291bnQsXG59OiB7XG4gIHF1ZXJ5U3RhdHVzOiBRdWVyeVN0YXR1c1xuICBpc0xvY2FsOiAoaWQ6IHN0cmluZykgPT4gYm9vbGVhblxuICBjb3VudDogbnVtYmVyXG59KTogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUgPT4ge1xuICBpZiAoIXF1ZXJ5U3RhdHVzKSB7XG4gICAgcmV0dXJuIHt9XG4gIH1cbiAgY29uc3QgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCA9IGdldEluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXAoe1xuICAgIHF1ZXJ5U3RhdHVzLFxuICAgIGlzTG9jYWwsXG4gIH0pXG4gIHJldHVybiBPYmplY3Qua2V5cyhpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwKS5yZWR1Y2UoXG4gICAgKGJsb2IsIHNvdXJjZU5hbWUpID0+IHtcbiAgICAgIGxldCByZW1haW5kZXJPbkZpbmFsUGFnZSA9XG4gICAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXBbc291cmNlTmFtZV0gJSBjb3VudFxuICAgICAgcmVtYWluZGVyT25GaW5hbFBhZ2UgPVxuICAgICAgICByZW1haW5kZXJPbkZpbmFsUGFnZSA9PT0gMCA/IGNvdW50IDogcmVtYWluZGVyT25GaW5hbFBhZ2VcbiAgICAgIGJsb2Jbc291cmNlTmFtZV0gPSBNYXRoLm1heChcbiAgICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cFtzb3VyY2VOYW1lXSAtIHJlbWFpbmRlck9uRmluYWxQYWdlICsgMSxcbiAgICAgICAgMVxuICAgICAgKVxuICAgICAgcmV0dXJuIGJsb2JcbiAgICB9LFxuICAgIHtcbiAgICAgIC4uLmluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXAsXG4gICAgfSBhcyB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9XG4gIClcbn1cblxuZXhwb3J0IHR5cGUgUXVlcnlTdGFydEFuZEVuZFR5cGUgPSB7XG4gIHN0YXJ0OiBudW1iZXJcbiAgZW5kOiBudW1iZXJcbiAgaGl0czogbnVtYmVyXG59XG5cbmV4cG9ydCBjb25zdCBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cCA9ICh7XG4gIHF1ZXJ5U3RhdHVzLFxuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCxcbiAgaXNMb2NhbCxcbn06IHtcbiAgcXVlcnlTdGF0dXM6IFF1ZXJ5U3RhdHVzXG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICBpc0xvY2FsOiAoaWQ6IHN0cmluZykgPT4gYm9vbGVhblxufSk6IFF1ZXJ5U3RhcnRBbmRFbmRUeXBlID0+IHtcbiAgaWYgKCFxdWVyeVN0YXR1cyB8fCBPYmplY3Qua2V5cyhxdWVyeVN0YXR1cykubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiAwLFxuICAgICAgZW5kOiAwLFxuICAgICAgaGl0czogMCxcbiAgICB9XG4gIH1cbiAgY29uc3QgbGFzdEluZGV4Rm9yU291cmNlR3JvdXAgPSBnZXRJbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwKHtcbiAgICBxdWVyeVN0YXR1cyxcbiAgICBpc0xvY2FsLFxuICB9KVxuXG4gIGxldCBzdGFydCA9IDFcbiAgY29uc3QgaXNCZWdpbm5pbmcgPSBPYmplY3QudmFsdWVzKGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKS5ldmVyeShcbiAgICAoc3RhcnQpID0+IHN0YXJ0ID09PSAxXG4gIClcblxuICBpZiAoIWlzQmVnaW5uaW5nKSB7XG4gICAgc3RhcnQgPSBPYmplY3Qua2V5cyhjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCkucmVkdWNlKChibG9iLCBrZXkpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGJsb2IgK1xuICAgICAgICBNYXRoLm1pbihjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cFtrZXldLCBsYXN0SW5kZXhGb3JTb3VyY2VHcm91cFtrZXldKVxuICAgICAgKSAvLyBpZiB3ZSBnbyBiZXlvbmQgdGhlIGhpdHMsIHdlIHNob3VsZCBvbmx5IGFkZCB0aGUgdG90YWwgaGl0cyBmb3IgdGhhdCBzb3VyY2VcbiAgICB9LCAwKVxuICB9XG5cbiAgY29uc3QgZW5kID0gT2JqZWN0LmtleXMocXVlcnlTdGF0dXMpLnJlZHVjZSgoYmxvYiwga2V5KSA9PiB7XG4gICAgcmV0dXJuIGJsb2IgKyBxdWVyeVN0YXR1c1trZXldLmNvdW50XG4gIH0sIHN0YXJ0IC0gMSlcblxuICBjb25zdCBoaXRzID0gT2JqZWN0LmtleXMocXVlcnlTdGF0dXMpLnJlZHVjZSgoYmxvYiwga2V5KSA9PiB7XG4gICAgcmV0dXJuIGJsb2IgKyBxdWVyeVN0YXR1c1trZXldLmhpdHNcbiAgfSwgMClcblxuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBNYXRoLm1pbihzdGFydCwgaGl0cyksXG4gICAgZW5kOiBNYXRoLm1pbihNYXRoLm1heChzdGFydCwgZW5kKSwgaGl0cyksXG4gICAgaGl0cyxcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGYXJ0aGVzdEluZGV4Rm9yU291cmNlR3JvdXAoXG4gIHNvdXJjZUdyb3VwOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuKTogbnVtYmVyIHtcbiAgLy8gZmluZCB0aGUgbWF4IGluZGV4IGZvciB0aGUgc291cmNlIGdyb3VwXG4gIHJldHVybiBNYXRoLm1heCguLi5PYmplY3QudmFsdWVzKHNvdXJjZUdyb3VwKSlcbn1cblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgdGhlIG5leHQgcGFnZSBpbmRpY2VzIGZvciBhIGdyb3VwIG9mIHNvdXJjZXMgbWFrZSBzZW5zZS4gIFdlIGRvIHRoaXMgYnkgZXhhbWluaW5nIHRoZSBmYXJ0aGVzdCBpbmRleCwgc2luY2UgcGFnaW5nIGlzIGRvbmUgaW5kaXZpZHVhbGx5IGZvciBlYWNoIHNvdXJjZS5cbiAqIElmIHRoZSBmYXJ0aGVzdCBpbmRleCBpcyBiZXlvbmQgdGhlIGhpdHMgZm9yIGEgc291cmNlLCB3ZSBlc3NlbnRpYWxseSBcImxvY2tcIiB0aGUgc291cmNlIHRvIHRoZSBlbmQgdG8gZW5zdXJlIHdlIGRvbid0IHJlY2lldmUgZnVydGhlciByZXN1bHRzLlxuICoqL1xuZXhwb3J0IGNvbnN0IGdldENvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cCA9ICh7XG4gIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwLFxuICBzb3VyY2VzLFxuICBpc0xvY2FsLFxuICBjb3VudCxcbiAgcXVlcnlTdGF0dXMsXG59OiB7XG4gIHNvdXJjZXM6IEFycmF5PHN0cmluZz5cbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbiAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gIGNvdW50OiBudW1iZXJcbiAgcXVlcnlTdGF0dXM6IFF1ZXJ5U3RhdHVzXG59KTogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUgPT4ge1xuICBjb25zdCBuZXh0UGFnZUZvclNvdXJjZUdyb3VwID0gZ2V0TmV4dFBhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgcXVlcnlTdGF0dXMsXG4gICAgaXNMb2NhbCxcbiAgICBjb3VudCxcbiAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCxcbiAgICBzb3VyY2VzLFxuICB9KVxuICBjb25zdCBmYXJ0aGVzdEluZGV4Rm9yU291cmNlR3JvdXAgPSBnZXRGYXJ0aGVzdEluZGV4Rm9yU291cmNlR3JvdXAoXG4gICAgbmV4dFBhZ2VGb3JTb3VyY2VHcm91cFxuICApXG4gIGNvbnN0IGluZGV4T2ZOb01vcmVSZXN1bHRzRm9yU291cmNlR3JvdXAgPVxuICAgIGdldEluZGV4T2ZOb01vcmVSZXN1bHRzRm9yU291cmNlR3JvdXAoe1xuICAgICAgcXVlcnlTdGF0dXMsXG4gICAgICBpc0xvY2FsLFxuICAgIH0pXG4gIHJldHVybiBPYmplY3Qua2V5cyhuZXh0UGFnZUZvclNvdXJjZUdyb3VwKS5yZWR1Y2UoXG4gICAgKGJsb2IsIHNvdXJjZU5hbWUpID0+IHtcbiAgICAgIGlmIChibG9iW3NvdXJjZU5hbWVdIDwgZmFydGhlc3RJbmRleEZvclNvdXJjZUdyb3VwKSB7XG4gICAgICAgIGJsb2Jbc291cmNlTmFtZV0gPSBpbmRleE9mTm9Nb3JlUmVzdWx0c0ZvclNvdXJjZUdyb3VwW3NvdXJjZU5hbWVdIC8vIGxvY2sgdGhlIHNvdXJjZSB0byB0aGUgZW5kLCBzaW5jZSB3ZSd2ZSBnb25lIGJleW9uZCB0aGUgaGl0cyAod2lsbCBlbnN1cmUgbm8gcmVzdWx0cyBjb21lIGJhY2spXG4gICAgICB9XG4gICAgICByZXR1cm4gYmxvYlxuICAgIH0sXG4gICAge1xuICAgICAgLi4ubmV4dFBhZ2VGb3JTb3VyY2VHcm91cCxcbiAgICB9IGFzIHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH1cbiAgKVxufVxuXG4vKipcbiAqICBUaGUgZmluYWwgaW5kZXggZm9yIGEgc291cmNlIGdyb3VwIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgZmluYWwgaW5kZXggd2hlbiB0aGlua2luZyBhYm91dCB0aGUgdmVyeSBsYXN0IHBhZ2UsIHNpbmNlIHdlIGhhdmUgbXVsdGlwbGUgc291cmNlcy5cbiAqICBTb21lIHNvdXJjZXMgbWF5IGhhdmUgYWxyZWFkeSBcImV4aGF1c3RlZFwiIHRoZWlyIHJlc3VsdHMsIHNvIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgaWYgd2UgZG9uJ3QgcmV0dXJuIHJlc3VsdHMgdGhhdCB3ZSd2ZSBhbHJlYWR5IFwicGFzc2VkXCIuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwID0gKHtcbiAgcXVlcnlTdGF0dXMsXG4gIGlzTG9jYWwsXG4gIGNvdW50LFxufToge1xuICBxdWVyeVN0YXR1czogUXVlcnlTdGF0dXNcbiAgaXNMb2NhbDogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW5cbiAgY291bnQ6IG51bWJlclxufSk6IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlID0+IHtcbiAgY29uc3QgZmluYWxQYWdlRm9yU291cmNlR3JvdXAgPSBnZXRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgcXVlcnlTdGF0dXMsXG4gICAgaXNMb2NhbCxcbiAgICBjb3VudCxcbiAgfSlcbiAgY29uc3QgbWF4RmluYWxQYWdlSW5kZXhGb3JTb3VyY2VHcm91cCA9IE1hdGgubWF4KFxuICAgIC4uLk9iamVjdC52YWx1ZXMoZmluYWxQYWdlRm9yU291cmNlR3JvdXApXG4gIClcbiAgY29uc3QgaW5kZXhPZk5vTW9yZVJlc3VsdHNGb3JTb3VyY2VHcm91cCA9XG4gICAgZ2V0SW5kZXhPZk5vTW9yZVJlc3VsdHNGb3JTb3VyY2VHcm91cCh7XG4gICAgICBxdWVyeVN0YXR1cyxcbiAgICAgIGlzTG9jYWwsXG4gICAgfSlcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGZpbmFsUGFnZUZvclNvdXJjZUdyb3VwKS5yZWR1Y2UoXG4gICAgKGJsb2IsIHNvdXJjZU5hbWUpID0+IHtcbiAgICAgIGlmIChibG9iW3NvdXJjZU5hbWVdIDwgbWF4RmluYWxQYWdlSW5kZXhGb3JTb3VyY2VHcm91cCkge1xuICAgICAgICBibG9iW3NvdXJjZU5hbWVdID0gaW5kZXhPZk5vTW9yZVJlc3VsdHNGb3JTb3VyY2VHcm91cFtzb3VyY2VOYW1lXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJsb2JcbiAgICB9LFxuICAgIHtcbiAgICAgIC4uLmZpbmFsUGFnZUZvclNvdXJjZUdyb3VwLFxuICAgIH0gYXMgeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfVxuICApXG59XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHRoZSBuZXh0IHBhZ2UgaW5kaWNlcyBmb3IgYSBncm91cCBvZiBzb3VyY2VzIG1ha2Ugc2Vuc2UuICBXZSBkbyB0aGlzIGJ5IGV4YW1pbmluZyB0aGUgZmFydGhlc3QgaW5kZXgsIHNpbmNlIHBhZ2luZyBpcyBkb25lIGluZGl2aWR1YWxseSBmb3IgZWFjaCBzb3VyY2UuXG4gKiBJZiB0aGUgZmFydGhlc3QgaW5kZXggaXMgYmV5b25kIHRoZSBoaXRzIGZvciBhIHNvdXJjZSwgd2UgZXNzZW50aWFsbHkgXCJsb2NrXCIgdGhlIHNvdXJjZSB0byB0aGUgZW5kIHRvIGVuc3VyZSB3ZSBkb24ndCByZWNpZXZlIGZ1cnRoZXIgcmVzdWx0cy5cbiAqKi9cbmV4cG9ydCBjb25zdCBnZXRDb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwID0gKHtcbiAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAsXG4gIHNvdXJjZXMsXG4gIGlzTG9jYWwsXG4gIGNvdW50LFxuICBxdWVyeVN0YXR1cyxcbn06IHtcbiAgc291cmNlczogQXJyYXk8c3RyaW5nPlxuICBpc0xvY2FsOiAoaWQ6IHN0cmluZykgPT4gYm9vbGVhblxuICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbiAgY291bnQ6IG51bWJlclxuICBxdWVyeVN0YXR1czogUXVlcnlTdGF0dXNcbn0pOiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSA9PiB7XG4gIGlmICghcXVlcnlTdGF0dXMgfHwgT2JqZWN0LmtleXMocXVlcnlTdGF0dXMpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBnZXRGaXJzdFBhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgICBzb3VyY2VzLFxuICAgICAgaXNMb2NhbCxcbiAgICB9KVxuICB9XG4gIGNvbnN0IHByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwID0gZ2V0UHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgIHF1ZXJ5U3RhdHVzLFxuICAgIGlzTG9jYWwsXG4gICAgY291bnQsXG4gICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAsXG4gICAgc291cmNlcyxcbiAgfSlcbiAgY29uc3QgZmFydGhlc3RJbmRleEZvclNvdXJjZUdyb3VwID0gZ2V0RmFydGhlc3RJbmRleEZvclNvdXJjZUdyb3VwKFxuICAgIHByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwXG4gIClcbiAgY29uc3QgaW5kZXhPZk5vTW9yZVJlc3VsdHNGb3JTb3VyY2VHcm91cCA9XG4gICAgZ2V0SW5kZXhPZk5vTW9yZVJlc3VsdHNGb3JTb3VyY2VHcm91cCh7XG4gICAgICBxdWVyeVN0YXR1cyxcbiAgICAgIGlzTG9jYWwsXG4gICAgfSlcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwKS5yZWR1Y2UoXG4gICAgKGJsb2IsIHNvdXJjZU5hbWUpID0+IHtcbiAgICAgIGlmIChibG9iW3NvdXJjZU5hbWVdIDwgZmFydGhlc3RJbmRleEZvclNvdXJjZUdyb3VwKSB7XG4gICAgICAgIC8vIG5ldmVyIGdvIGJleW9uZCB0aGUgbm8gbW9yZSByZXN1bHRzIGluZGV4LCBidXQgbWFrZSBzdXJlIHdlIGtlZXAgaW5kZXhlcyBpbiBzeW5jIHdoZW4gZ29pbmcgYmFja3dhcmRzXG4gICAgICAgIGJsb2Jbc291cmNlTmFtZV0gPSBNYXRoLm1pbihcbiAgICAgICAgICBpbmRleE9mTm9Nb3JlUmVzdWx0c0ZvclNvdXJjZUdyb3VwW3NvdXJjZU5hbWVdLFxuICAgICAgICAgIGZhcnRoZXN0SW5kZXhGb3JTb3VyY2VHcm91cFxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gYmxvYlxuICAgIH0sXG4gICAge1xuICAgICAgLi4ucHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAsXG4gICAgfSBhcyB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9XG4gIClcbn1cbiJdfQ==