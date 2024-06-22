import { __assign, __extends } from "tslib";
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
import moment from 'moment-timezone';
import CQLUtils from '../../js/CQLUtils';
import { SpreadOperatorProtectedClass } from '../../typescript/classes';
import ExtensionPoints from '../../extension-points';
import { BasicDataTypePropertyName } from './reserved.properties';
export var deserialize = {
    /**
     * example inputs:  // ' are part of input
     * 'RELATIVE(PT1S)' // last 1 seconds
     * 'RELATIVE(PT1M)' // last 1 minutes
     * 'RELATIVE(PT1H)' // last 1 hours
     * 'RELATIVE(P1D)' // last 1 days
     * 'RELATIVE(P7D)' // last 1 weeks (notice we get mod of 7 days)
     * 'RELATIVE(P1M)' // last 1 month
     * 'RELATIVE(P1Y)' // last 1 year
     **/
    dateRelative: function (val) {
        var last = '';
        var guts = val.split('(')[1].split(')')[0].substring(1); // get the thing between the parens, notice we don't care about P either
        var unit = guts.charAt(guts.length - 1); // notice that we still need to know if it's minutes or months, the unit is the same between them!
        if (guts.charAt(0) === 'T') {
            last = guts.substring(1, guts.length - 1);
            unit = unit.toLowerCase();
        }
        else {
            last = guts.substring(0, guts.length - 1);
            if (unit !== 'M') {
                unit = unit.toLowerCase(); // only M differs given the conflict between minutes / months
            }
            if (unit === 'd') {
                if (Number(last) % 7 === 0) {
                    // manually convert to weeks since it's not "really" a cql supported unit for relative
                    last = (Number(last) / 7).toString();
                    unit = 'w';
                }
            }
        }
        return {
            last: last,
            unit: unit,
        };
    },
};
export var serialize = {
    dateRelative: function (_a) {
        var last = _a.last, unit = _a.unit;
        if (unit === undefined || !parseFloat(last)) {
            return '';
        }
        //Weeks is not a valid unit, so convert this to days
        if (unit === 'w') {
            var convertedUnit = 'd';
            var convertedLast = (parseInt(last) * 7).toString();
            return "RELATIVE(".concat('P' + convertedLast + convertedUnit.toUpperCase(), ")");
        }
        var prefix = unit === 's' || unit === 'm' || unit === 'h' ? 'PT' : 'P';
        return "RELATIVE(".concat(prefix + last + unit.toUpperCase(), ")");
    },
    dateAround: function (value) {
        if (value.buffer === undefined ||
            value.date === undefined ||
            value.direction === undefined) {
            return '';
        }
        var before = ['both', 'before'].includes(value.direction)
            ? moment(value.date)
                .subtract(value.buffer.amount, value.buffer.unit)
                .toISOString()
            : value.date;
        var after = ['both', 'after'].includes(value.direction)
            ? moment(value.date)
                .add(value.buffer.amount, value.buffer.unit)
                .toISOString()
            : value.date;
        return "DURING ".concat(before, "/").concat(after);
    },
    dateBetween: function (value) {
        var from = moment(value.start);
        var to = moment(value.end);
        if (from.isAfter(to)) {
            return (to.toISOString() || '') + '/' + (from.toISOString() || '');
        }
        return (from.toISOString() || '') + '/' + (to.toISOString() || '');
    },
    location: function (property, value) {
        var transformation = ExtensionPoints.serializeLocation(property, value);
        if (transformation !== null) {
            return transformation;
        }
        return CQLUtils.generateAnyGeoFilter(property, value);
    },
};
var BaseFilterBuilderClass = /** @class */ (function (_super) {
    __extends(BaseFilterBuilderClass, _super);
    function BaseFilterBuilderClass(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.type, type = _c === void 0 ? 'AND' : _c, _d = _b.filters, filters = _d === void 0 ? [new FilterClass()] : _d, _e = _b.negated, negated = _e === void 0 ? false : _e, _f = _b.id, id = _f === void 0 ? Math.random().toString() : _f;
        var _this = _super.call(this) || this;
        _this.type = type;
        /**
         * If for some reason filters come in that aren't classed, this will handle it.
         */
        _this.filters = filters.map(function (childFilter) {
            if (isFilterBuilderClass(childFilter) ||
                shouldBeFilterBuilderClass(childFilter)) {
                return new FilterBuilderClass(__assign({}, childFilter));
            }
            else {
                return new FilterClass(__assign({}, childFilter));
            }
        });
        _this.negated = negated;
        _this.id = id;
        return _this;
    }
    return BaseFilterBuilderClass;
}(SpreadOperatorProtectedClass));
var FilterBuilderClass = /** @class */ (function (_super) {
    __extends(FilterBuilderClass, _super);
    function FilterBuilderClass(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.type, type = _c === void 0 ? 'AND' : _c, _d = _b.filters, filters = _d === void 0 ? [new FilterClass()] : _d, _e = _b.negated, negated = _e === void 0 ? false : _e, _f = _b.id, id = _f === void 0 ? Math.random().toString() : _f;
        return _super.call(this, { type: type, filters: filters, negated: negated, id: id }) || this;
    }
    return FilterBuilderClass;
}(BaseFilterBuilderClass));
export { FilterBuilderClass };
/**
 *  We want to support more complex negation than allowed by the normal filter tree, so we store negated in a property.
 *  However, since the write function in cql.tsx doesn't know about this, at some point we need to convert it back to this class where negation exists as a type instead of property.
 *  See the uncollapseNots function in cql.tsx for where this is done.
 */
var CQLStandardFilterBuilderClass = /** @class */ (function (_super) {
    __extends(CQLStandardFilterBuilderClass, _super);
    function CQLStandardFilterBuilderClass(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.type, type = _c === void 0 ? 'AND' : _c, _d = _b.filters, filters = _d === void 0 ? [new FilterClass()] : _d, _e = _b.negated, negated = _e === void 0 ? false : _e, _f = _b.id, id = _f === void 0 ? Math.random().toString() : _f;
        return _super.call(this, { type: type, filters: filters, negated: negated, id: id }) || this;
    }
    return CQLStandardFilterBuilderClass;
}(BaseFilterBuilderClass));
export { CQLStandardFilterBuilderClass };
var FilterClass = /** @class */ (function (_super) {
    __extends(FilterClass, _super);
    function FilterClass(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.type, type = _c === void 0 ? 'ILIKE' : _c, _d = _b.property, property = _d === void 0 ? 'anyText' : _d, _e = _b.value, value = _e === void 0 ? '' : _e, _f = _b.negated, negated = _f === void 0 ? false : _f, _g = _b.id, id = _g === void 0 ? Math.random().toString() : _g;
        var _this = _super.call(this) || this;
        _this.type = type;
        _this.property = property;
        _this.value = value;
        _this.negated = negated;
        _this.id = id;
        return _this;
    }
    return FilterClass;
}(SpreadOperatorProtectedClass));
export { FilterClass };
/**
 * determine it is actually an plain object form of the filter builder class
 */
export var shouldBeFilterBuilderClass = function (filter) {
    return !isFilterBuilderClass(filter) && filter.filters !== undefined;
};
/**
 *determine it is actually an instantiation of the filter builder class
 */
export var isFilterBuilderClass = function (filter) {
    return filter.constructor === FilterBuilderClass;
};
/**
 *determine it is actually an instantiation of the cql standard filter builder class
 */
export var isCQLStandardFilterBuilderClass = function (filter) {
    return filter.constructor === CQLStandardFilterBuilderClass;
};
var BasicDatatypeFilter = /** @class */ (function (_super) {
    __extends(BasicDatatypeFilter, _super);
    function BasicDatatypeFilter(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.value, value = _c === void 0 ? [] : _c;
        var _this = _super.call(this, {
            property: BasicDataTypePropertyName,
            value: value,
        }) || this;
        _this.value = value;
        return _this;
    }
    return BasicDatatypeFilter;
}(FilterClass));
export { BasicDatatypeFilter };
export var isBasicDatatypeClass = function (filter) {
    try {
        return (filter === null || filter === void 0 ? void 0 : filter.property) === BasicDataTypePropertyName;
    }
    catch (err) {
        return false;
    }
};
//# sourceMappingURL=filter.structure.js.map