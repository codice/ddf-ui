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
// verified
export var dateComparators = [
    {
        value: 'BEFORE',
        label: 'BEFORE',
    },
    {
        value: 'AFTER',
        label: 'AFTER',
    },
    {
        value: 'RELATIVE',
        label: 'WITHIN THE LAST',
    },
    {
        value: 'DURING',
        label: 'BETWEEN',
    },
    {
        value: 'IS NULL',
        label: 'IS EMPTY',
    },
    {
        value: 'AROUND',
        label: 'AROUND',
    },
];
// verified
export var geometryComparators = [
    {
        value: 'GEOMETRY',
        label: 'INTERSECTS',
    },
    {
        value: 'IS NULL',
        label: 'IS EMPTY',
    },
];
// verified
export var stringComparators = [
    {
        value: 'ILIKE',
        label: 'CONTAINS',
    },
    {
        value: 'LIKE',
        label: 'MATCHCASE',
    },
    {
        value: '=',
        label: '=',
    },
    {
        value: 'FILTER FUNCTION proximity',
        label: 'NEAR',
    },
    {
        value: 'BOOLEAN_TEXT_SEARCH',
        label: 'BOOLEAN',
    },
    {
        value: 'IS NULL',
        label: 'IS EMPTY',
    },
];
// verified
export var numberComparators = [
    {
        value: '>',
        label: '>',
    },
    {
        value: '<',
        label: '<',
    },
    {
        value: '=',
        label: '=',
    },
    {
        value: '>=',
        label: '>=',
    },
    {
        value: '<=',
        label: '<=',
    },
    {
        value: 'BETWEEN',
        label: 'RANGE',
    },
    {
        value: 'IS NULL',
        label: 'IS EMPTY',
    },
];
// verified
export var booleanComparators = [
    {
        value: '=',
        label: '=',
    },
    {
        value: 'IS NULL',
        label: 'IS EMPTY',
    },
];
import { getAttributeType } from '../filterHelper';
var typeToComparators = {
    STRING: stringComparators,
    DATE: dateComparators,
    LONG: numberComparators,
    DOUBLE: numberComparators,
    FLOAT: numberComparators,
    INTEGER: numberComparators,
    SHORT: numberComparators,
    LOCATION: geometryComparators,
    GEOMETRY: geometryComparators,
    BOOLEAN: booleanComparators,
};
export var getComparators = function (attribute) {
    var comparators = typeToComparators[getAttributeType(attribute)] || [];
    // IS NULL checks do not work on these
    if (attribute === 'anyGeo' || attribute === 'anyText') {
        comparators = comparators.filter(function (comparator) { return comparator.value !== 'IS NULL'; });
    }
    return comparators;
};
//# sourceMappingURL=comparatorUtils.js.map