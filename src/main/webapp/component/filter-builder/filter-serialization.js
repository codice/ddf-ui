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
import Backbone from 'backbone';
import CQLUtils from '../../js/CQLUtils';
import metacardDefinitions from '../singletons/metacard-definitions';
import _ from 'underscore';
var FilterBuilderModel = Backbone.Model.extend({
    defaults: function () {
        return {
            operator: 'AND',
            sortableOrder: 0
        };
    },
    type: 'filter-builder'
});
var FilterModel = Backbone.Model.extend({
    defaults: function () {
        return {
            value: [''],
            type: 'anyText',
            comparator: 'CONTAINS',
            sortableOrder: 0
        };
    },
    type: 'filter'
});
var comparatorToCQL = {
    BEFORE: 'BEFORE',
    AFTER: 'AFTER',
    RELATIVE: '=',
    BETWEEN: 'DURING',
    INTERSECTS: 'INTERSECTS',
    DWITHIN: 'DWITHIN',
    CONTAINS: 'ILIKE',
    MATCHCASE: 'LIKE',
    EQUALS: '=',
    'IS EMPTY': 'IS NULL',
    '>': '>',
    '<': '<',
    '=': '=',
    '<=': '<=',
    '>=': '>=',
    RANGE: 'BETWEEN'
};
var cqlToComparator = Object.keys(comparatorToCQL).reduce(function (mapping, key) {
    var value = comparatorToCQL[key];
    mapping[value] = key;
    return mapping;
}, {});
var transformFilter = function (filter) {
    var type = filter.type, property = filter.property;
    var value = CQLUtils.isGeoFilter(filter.type) ? filter : filter.value;
    if (_.isObject(property)) {
        // if the filter is something like NEAR (which maps to a CQL filter function such as 'proximity'),
        // there is an enclosing filter that creates the necessary '= TRUE' predicate, and the 'property'
        // attribute is what actually contains that proximity() call.
        var filterFunctionName = property.filterFunctionName, params = property.params;
        if (filterFunctionName !== 'proximity') {
            throw new Error('Unsupported filter function in filter view: ' + filterFunctionName);
        }
        var _a = __read(params, 3), type_1 = _a[0], distance = _a[1], value_1 = _a[2];
        return {
            // this is confusing but 'type' on the model is actually the name of the property we're filtering on
            type: type_1,
            comparator: 'NEAR',
            value: [{ value: value_1, distance: distance }]
        };
    }
    var definition = metacardDefinitions.metacardTypes[property];
    var comparator = definition && definition.type === 'DATE' && type === '='
        ? 'RELATIVE'
        : cqlToComparator[type];
    var parsedValue;
    if (type === 'DURING') {
        if (filter.value.includes('/')) {
            var dates = filter.value.split('/');
            filter.from = dates[0] || null;
            filter.to = dates[1] || null;
        }
        parsedValue = "".concat(filter.from, "/").concat(filter.to);
    }
    else if (type === 'BETWEEN') {
        parsedValue = { lower: filter.lowerBoundary, upper: filter.upperBoundary };
    }
    else {
        parsedValue = value;
    }
    return {
        type: property,
        comparator: comparator,
        value: [parsedValue]
    };
};
var FilterBuilderCollection = Backbone.Collection.extend({
    model: function (attrs, _a) {
        var collection = _a.collection;
        var sortableOrder = collection.length + 1;
        if (attrs.filterBuilder === true) {
            var operator = attrs.type;
            return new FilterBuilderModel(__assign({ operator: operator, sortableOrder: sortableOrder, filters: new FilterBuilderCollection([defaultFilter]) }, attrs));
        }
        return new FilterModel(__assign(__assign({ sortableOrder: sortableOrder }, attrs), transformFilter(attrs)));
    }
});
// model->json
export var serialize = function (model) {
    if (model instanceof FilterBuilderModel) {
        var operator = model.get('operator');
        var filters = model.get('filters') || [];
        if (operator === 'NONE') {
            return {
                type: 'NOT',
                filters: [
                    {
                        type: 'AND',
                        filters: filters.map(serialize)
                    },
                ]
            };
        }
        return {
            type: operator,
            filters: filters.map(serialize).filter(function (filter) { return filter; })
        };
    }
    if (model instanceof FilterModel) {
        var property = model.get('type');
        var comparator = model.get('comparator');
        var value = model.get('value')[0];
        var type = comparatorToCQL[comparator];
        var filter = void 0;
        switch (comparator) {
            case 'NEAR':
                filter = CQLUtils.generateFilterForFilterFunction('proximity', [
                    property,
                    value.distance,
                    value.value,
                ]);
                break;
            case 'IS EMPTY':
                filter = CQLUtils.generateIsEmptyFilter(property);
                break;
            default:
                filter = CQLUtils.generateFilter(type, property, value === undefined ? '' : value);
                break;
        }
        return __assign(__assign({}, filter), { extensionData: model.get('extensionData') });
    }
};
var defaultFilter = { type: 'ILIKE', property: 'anyText', value: '' };
// json->model
export var deserialize = function (filter) {
    if (filter === void 0) { filter = defaultFilter; }
    var type = filter.type, filters = filter.filters;
    if (!filters) {
        return deserialize({ type: 'AND', filters: [filter] });
    }
    return new FilterBuilderModel({
        operator: type,
        filters: new FilterBuilderCollection(filters.map(function (filter) {
            return filter.filters !== undefined ? deserialize(filter) : filter;
        }))
    });
};
//# sourceMappingURL=filter-serialization.js.map