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
import * as React from 'react';
import FilterBranch from './filter-branch';
import { FilterBuilderClass, isFilterBuilderClass } from './filter.structure';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
var convertToFilterIfNecessary = function (_a) {
    var filter = _a.filter;
    if (isFilterBuilderClass(filter)) {
        return filter;
    }
    if (filter.filters === undefined) {
        return new FilterBuilderClass({
            type: 'AND',
            filters: [filter],
            negated: false,
        });
    }
    return new FilterBuilderClass(__assign({}, filter));
};
var getBaseFilter = function (_a) {
    var model = _a.model;
    var filter = model.get('filterTree');
    return convertToFilterIfNecessary({ filter: filter });
};
/**
 * We use the filterTree of the model as the single source of truth, so it's always up to date.
 * As a result, we have to listen to updates to it.
 */
export var FilterBuilderRoot = function (_a) {
    var model = _a.model, errorListener = _a.errorListener;
    var _b = __read(React.useState(getBaseFilter({ model: model })), 2), filter = _b[0], setFilter = _b[1];
    var _c = useBackbone(), listenTo = _c.listenTo, stopListening = _c.stopListening;
    React.useEffect(function () {
        var callback = function () {
            setFilter(getBaseFilter({ model: model }));
        };
        listenTo(model, 'change:filterTree', callback);
        return function () {
            stopListening(model, 'change:filterTree', callback);
        };
    }, [model]);
    return (React.createElement("div", null,
        React.createElement(FilterBranch, { filter: filter, setFilter: function (update) {
                model.set('filterTree', update); // update the filterTree directly so it's always in sync and we're ready to search
            }, root: true, errorListener: errorListener })));
};
//# sourceMappingURL=filter-builder.js.map