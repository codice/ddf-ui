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
//# sourceMappingURL=Query.methods.js.map