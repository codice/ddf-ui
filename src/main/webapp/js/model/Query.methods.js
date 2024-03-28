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
// given a current status, list of sources, and function to determine local, calculate next page
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
    }, __assign(__assign({ local: 1 }, federatedSources.reduce(function (blob, id) {
        blob[id] = 1;
        return blob;
    }, {})), currentIndexForSourceGroup));
};
export var getMaxIndexForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, isLocal = _a.isLocal;
    if (Object.keys(queryStatus).length === 0) {
        console.warn('Invalid invocation:  queryStatus is required to determine max index for a query');
        return {};
    }
    var maxLocalStart = Math.max(1, Object.values(queryStatus)
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
    }, {
        local: maxLocalStart,
    });
};
export var hasPreviousPageForSourceGroup = function (_a) {
    var currentIndexForSourceGroup = _a.currentIndexForSourceGroup;
    return (Object.values(currentIndexForSourceGroup).length > 0 &&
        Object.values(currentIndexForSourceGroup).some(function (start) { return start !== 1; }));
};
export var getNextPageForSourceGroup = function (_a) {
    var currentIndexForSourceGroup = _a.currentIndexForSourceGroup, sources = _a.sources, isLocal = _a.isLocal, count = _a.count;
    if (Object.keys(currentIndexForSourceGroup).length > 0) {
        return Object.keys(currentIndexForSourceGroup).reduce(function (blob, key) {
            blob[key] = blob[key] + count;
            return blob;
        }, __assign({}, currentIndexForSourceGroup));
    }
    else {
        return sources.reduce(function (blob, sourceName) {
            if (!isLocal(sourceName)) {
                blob[sourceName] = 1;
            }
            return blob;
        }, {
            local: 1,
        });
    }
};
export var hasNextPageForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, isLocal = _a.isLocal, currentIndexForSourceGroup = _a.currentIndexForSourceGroup, count = _a.count;
    if (!queryStatus) {
        return false;
    }
    var maxIndexforSourceGroup = getMaxIndexForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
    });
    return Object.keys(maxIndexforSourceGroup).some(function (key) {
        return (currentIndexForSourceGroup[key] + count - 1 < maxIndexforSourceGroup[key]);
    });
};
export var getPreviousPageForSourceGroup = function (_a) {
    var currentIndexForSourceGroup = _a.currentIndexForSourceGroup, count = _a.count;
    return Object.keys(currentIndexForSourceGroup).reduce(function (blob, key) {
        blob[key] = Math.max(1, blob[key] - count);
        return blob;
    }, __assign({}, currentIndexForSourceGroup));
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
export var getFinalPageForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, isLocal = _a.isLocal, count = _a.count;
    if (!queryStatus) {
        return {};
    }
    var maxIndexforSourceGroup = getMaxIndexForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
    });
    return Object.keys(maxIndexforSourceGroup).reduce(function (blob, sourceName) {
        var remainderOnFinalPage = maxIndexforSourceGroup[sourceName] % count;
        remainderOnFinalPage =
            remainderOnFinalPage === 0 ? count : remainderOnFinalPage;
        blob[sourceName] =
            maxIndexforSourceGroup[sourceName] - remainderOnFinalPage + 1;
        return blob;
    }, __assign({}, maxIndexforSourceGroup));
};
export var getCurrentStartAndEndForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, currentIndexForSourceGroup = _a.currentIndexForSourceGroup;
    if (!queryStatus) {
        return {
            start: 0,
            end: 0,
            hits: 0,
        };
    }
    var relativeStart = Object.keys(currentIndexForSourceGroup).reduce(function (_blob, key) {
        return currentIndexForSourceGroup[key];
    }, 0);
    var start = relativeStart === 1
        ? relativeStart
        : Object.keys(queryStatus).reduce(function (blob, key) {
            return (blob +
                Math.min(queryStatus[key].hits, currentIndexForSourceGroup[key] |
                    currentIndexForSourceGroup['local']));
        }, 0);
    var end = Object.keys(queryStatus).reduce(function (blob, key) {
        return blob + queryStatus[key].count;
    }, start - 1);
    var hits = Object.keys(queryStatus).reduce(function (blob, key) {
        return blob + queryStatus[key].hits;
    }, 0);
    return {
        start: start,
        end: Math.max(start, end),
        hits: hits,
    };
};
export var getConstrainedFinalPageForSourceGroup = function (_a) {
    var queryStatus = _a.queryStatus, isLocal = _a.isLocal, count = _a.count;
    var finalPageForSourceGroup = getFinalPageForSourceGroup({
        queryStatus: queryStatus,
        isLocal: isLocal,
        count: count,
    });
    var maxFinalPageIndexForSourceGroup = Math.max.apply(Math, __spreadArray([], __read(Object.values(finalPageForSourceGroup)), false));
    return Object.keys(finalPageForSourceGroup).reduce(function (blob, sourceName) {
        if (blob[sourceName] < maxFinalPageIndexForSourceGroup) {
            blob[sourceName] = maxFinalPageIndexForSourceGroup;
        }
        return blob;
    }, __assign({}, finalPageForSourceGroup));
};
//# sourceMappingURL=Query.methods.js.map