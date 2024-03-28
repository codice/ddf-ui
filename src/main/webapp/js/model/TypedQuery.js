import { __assign, __read } from "tslib";
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
import React from 'react';
import { FilterBuilderClass } from '../../component/filter-builder/filter.structure';
import { useListenTo } from '../../component/selection-checkbox/useBackbone.hook';
import { TypedUserInstance } from '../../component/singletons/TypedUser';
import cql from '../cql';
import UntypedQuery from './Query';
export var DEFAULT_QUERY_OPTIONS = {
    transformDefaults: function (_a) {
        var originalDefaults = _a.originalDefaults;
        return originalDefaults;
    },
    transformFilterTree: function (_a) {
        var originalFilterTree = _a.originalFilterTree;
        return cql.write(originalFilterTree);
    },
    transformCount: function (_a) {
        var originalCount = _a.originalCount;
        return originalCount;
    },
    transformSorts: function (_a) {
        var originalSorts = _a.originalSorts;
        return originalSorts;
    },
    limitToHistoric: false,
    limitToDeleted: false,
};
export var Query = function (attributes, options) {
    var mergedOptions = __assign(__assign({}, DEFAULT_QUERY_OPTIONS), options);
    return new UntypedQuery(attributes, mergedOptions);
};
function mixinEphemeralFilter(originalCQL) {
    var ephemeralFilter = TypedUserInstance.getEphemeralFilter();
    try {
        if (ephemeralFilter) {
            return new FilterBuilderClass({
                filters: [ephemeralFilter, originalCQL],
                type: 'AND',
            });
        }
        else {
            return originalCQL;
        }
    }
    catch (err) {
        console.error(err);
        return originalCQL;
    }
}
export var DEFAULT_USER_QUERY_OPTIONS = {
    transformDefaults: function (_a) {
        var originalDefaults = _a.originalDefaults;
        return __assign(__assign(__assign({}, originalDefaults), TypedUserInstance.getQuerySettingsJSON()), { count: TypedUserInstance.getResultCount() });
    },
    transformFilterTree: function (_a) {
        var originalFilterTree = _a.originalFilterTree;
        return cql.write(mixinEphemeralFilter(originalFilterTree));
    },
    transformSorts: function (_a) {
        var originalSorts = _a.originalSorts;
        return TypedUserInstance.getEphemeralSorts() || originalSorts;
    },
    transformCount: function (_a) {
        var originalCount = _a.originalCount;
        return TypedUserInstance.getResultCount() || originalCount;
    },
    limitToDeleted: false,
    limitToHistoric: false,
};
/**
 * This should be used in place of useUserQuery _only_ if you do not intend to listen to changes to user prefs.
 */
export var UserQuery = function (attributes, options) {
    var mergedOptions = __assign(__assign({}, DEFAULT_USER_QUERY_OPTIONS), options);
    return Query(attributes, mergedOptions);
};
export var useQuery = function (_a) {
    var _b = _a === void 0 ? {} : _a, attributes = _b.attributes, options = _b.options;
    var _c = __read(React.useState(Query(attributes, options)), 2), query = _c[0], setQuery = _c[1];
    return [query, setQuery];
};
export var useUserQuery = function (_a) {
    var _b = _a === void 0 ? {} : _a, attributes = _b.attributes, options = _b.options;
    var _c = __read(React.useState(UserQuery(attributes, options)), 2), query = _c[0], setQuery = _c[1];
    useListenTo(TypedUserInstance.getPreferences(), 'change:resultCount', function () {
        query.set('count', TypedUserInstance.getResultCount());
    });
    useListenTo(TypedUserInstance.getPreferences(), 'change:resultFilter', function () {
        query.startSearchFromFirstPage();
    });
    useListenTo(TypedUserInstance.getPreferences(), 'change:resultSort', function () {
        query.startSearchFromFirstPage();
    });
    return [query, setQuery];
};
//# sourceMappingURL=TypedQuery.js.map