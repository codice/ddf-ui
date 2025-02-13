import { __assign, __extends, __rest } from "tslib";
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
            var convertedLast = (parseFloat(last) * 7).toString();
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
        var _b = _a === void 0 ? {} : _a, _c = _b.type, type = _c === void 0 ? 'ILIKE' : _c, _d = _b.property, property = _d === void 0 ? 'anyText' : _d, _e = _b.value, value = _e === void 0 ? '' : _e, _f = _b.negated, negated = _f === void 0 ? false : _f, _g = _b.id, id = _g === void 0 ? Math.random().toString() : _g, context = _b.context;
        var _this = _super.call(this) || this;
        _this.type = type;
        _this.property = property;
        _this.value = value;
        _this.negated = negated;
        _this.id = id;
        _this.context = context;
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
        var _b = _a === void 0 ? {} : _a, _c = _b.value, value = _c === void 0 ? [] : _c, context = _b.context;
        var _this = _super.call(this, {
            property: BasicDataTypePropertyName,
            value: value,
            context: context,
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
var ResourceSizeFilterClass = /** @class */ (function (_super) {
    __extends(ResourceSizeFilterClass, _super);
    function ResourceSizeFilterClass(_a) {
        var _b = _a.value, value = _b === void 0 ? 0 : _b, _c = _a.context, context = _c === void 0 ? { units: 'B' } : _c, otherProps = __rest(_a, ["value", "context"]);
        return _super.call(this, __assign(__assign({}, otherProps), { value: value, context: __assign(__assign({}, context), { units: context.units }) })) || this;
    }
    return ResourceSizeFilterClass;
}(FilterClass));
export { ResourceSizeFilterClass };
var ResourceSizeRangeFilterClass = /** @class */ (function (_super) {
    __extends(ResourceSizeRangeFilterClass, _super);
    function ResourceSizeRangeFilterClass(_a) {
        var _b = _a.value, value = _b === void 0 ? { start: 0, end: 1 } : _b, _c = _a.context, context = _c === void 0 ? { startUnits: 'B', endUnits: 'B' } : _c, otherProps = __rest(_a, ["value", "context"]);
        return _super.call(this, __assign(__assign({}, otherProps), { value: value, context: __assign(__assign({}, context), { startUnits: context.startUnits, endUnits: context.endUnits }) })) || this;
    }
    return ResourceSizeRangeFilterClass;
}(FilterClass));
export { ResourceSizeRangeFilterClass };
export var isResourceSizeFilterClass = function (filter) {
    var _a, _b;
    try {
        return ((filter === null || filter === void 0 ? void 0 : filter.value) !== undefined &&
            typeof (filter === null || filter === void 0 ? void 0 : filter.value) === 'number' &&
            !isNaN(filter === null || filter === void 0 ? void 0 : filter.value) &&
            ((_a = filter === null || filter === void 0 ? void 0 : filter.context) === null || _a === void 0 ? void 0 : _a.units) !== undefined &&
            sizeUnits.includes((_b = filter === null || filter === void 0 ? void 0 : filter.context) === null || _b === void 0 ? void 0 : _b.units));
    }
    catch (err) {
        return false;
    }
};
export var isResourceSizeRangeFilterClass = function (filter) {
    var _a, _b, _c, _d;
    try {
        return ((filter === null || filter === void 0 ? void 0 : filter.value) !== undefined &&
            typeof (filter === null || filter === void 0 ? void 0 : filter.value) === 'object' &&
            typeof (filter === null || filter === void 0 ? void 0 : filter.value.start) === 'number' &&
            typeof (filter === null || filter === void 0 ? void 0 : filter.value.end) === 'number' &&
            ((_a = filter === null || filter === void 0 ? void 0 : filter.context) === null || _a === void 0 ? void 0 : _a.startUnits) !== undefined &&
            ((_b = filter === null || filter === void 0 ? void 0 : filter.context) === null || _b === void 0 ? void 0 : _b.endUnits) !== undefined &&
            sizeUnits.includes((_c = filter === null || filter === void 0 ? void 0 : filter.context) === null || _c === void 0 ? void 0 : _c.startUnits) &&
            sizeUnits.includes((_d = filter === null || filter === void 0 ? void 0 : filter.context) === null || _d === void 0 ? void 0 : _d.endUnits));
    }
    catch (err) {
        return false;
    }
};
export var sizeUnits = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB', // Petabytes
];
var convertToBytesFromUnit = function (value, unit) {
    var unitIndex = sizeUnits.indexOf(unit);
    if (unitIndex === -1) {
        return value; // If unit is not recognized, return the original value
    }
    return value * Math.pow(1000, unitIndex);
};
// This function rounds down to the nearest whole number in bytes
export var convertResourceSizeFilterClassValueToBytes = function (filter) {
    var value = filter.value, context = filter.context;
    var unit = (context === null || context === void 0 ? void 0 : context.units) || 'B';
    return Math.floor(convertToBytesFromUnit(value, unit));
};
export var convertResourceSizeRangeFilterClassValueToBytes = function (filter) {
    var value = filter.value, context = filter.context;
    var startUnit = (context === null || context === void 0 ? void 0 : context.startUnits) || 'B';
    var endUnit = (context === null || context === void 0 ? void 0 : context.endUnits) || 'B';
    return {
        start: Math.floor(convertToBytesFromUnit(value.start, startUnit)),
        end: Math.floor(convertToBytesFromUnit(value.end, endUnit)),
    };
};
export function convertBytesToHumanReadable(bytes) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    var unitIndex = 0;
    while (bytes >= 1000 && unitIndex < units.length - 1) {
        bytes /= 1000;
        unitIndex++;
    }
    return "".concat(bytes.toFixed(2), " ").concat(units[unitIndex]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLnN0cnVjdHVyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUVwQyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQTtBQUd4QyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUN2RSxPQUFPLGVBQWUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNwRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUVqRSxNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUc7SUFDekI7Ozs7Ozs7OztRQVNJO0lBQ0osWUFBWSxFQUFFLFVBQUMsR0FBVztRQUN4QixJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7UUFDYixJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyx3RUFBd0U7UUFDbEksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBLENBQUMsa0dBQWtHO1FBQzFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDMUIsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDekMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUs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T0FBTyx1QkFBUCxPQUFPLENBQUUsVUFBVSxLQUFJLEdBQUcsQ0FBQTtJQUM1QyxJQUFNLE9BQU8sR0FBRyxDQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxRQUFRLEtBQUksR0FBRyxDQUFBO0lBQ3hDLE9BQU87UUFDTCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDNUQsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sVUFBVSwyQkFBMkIsQ0FBQyxLQUFhO0lBQ3ZELElBQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNqRCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUE7SUFDakIsT0FBTyxLQUFLLElBQUksSUFBSSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNwRCxLQUFLLElBQUksSUFBSSxDQUFBO1FBQ2IsU0FBUyxFQUFFLENBQUE7S0FDWjtJQUNELE9BQU8sVUFBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxjQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBRSxDQUFBO0FBQ2xELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50LXRpbWV6b25lJ1xuaW1wb3J0IHsgVmFsdWVzVHlwZSB9IGZyb20gJ3V0aWxpdHktdHlwZXMnXG5pbXBvcnQgQ1FMVXRpbHMgZnJvbSAnLi4vLi4vanMvQ1FMVXRpbHMnXG5pbXBvcnQgeyBPbWl0IH0gZnJvbSAnLi4vLi4vdHlwZXNjcmlwdCdcblxuaW1wb3J0IHsgU3ByZWFkT3BlcmF0b3JQcm90ZWN0ZWRDbGFzcyB9IGZyb20gJy4uLy4uL3R5cGVzY3JpcHQvY2xhc3NlcydcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCB7IEJhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWUgfSBmcm9tICcuL3Jlc2VydmVkLnByb3BlcnRpZXMnXG5cbmV4cG9ydCBjb25zdCBkZXNlcmlhbGl6ZSA9IHtcbiAgLyoqXG4gICAqIGV4YW1wbGUgaW5wdXRzOiAgLy8gJyBhcmUgcGFydCBvZiBpbnB1dFxuICAgKiAnUkVMQVRJVkUoUFQxUyknIC8vIGxhc3QgMSBzZWNvbmRzXG4gICAqICdSRUxBVElWRShQVDFNKScgLy8gbGFzdCAxIG1pbnV0ZXNcbiAgICogJ1JFTEFUSVZFKFBUMUgpJyAvLyBsYXN0IDEgaG91cnNcbiAgICogJ1JFTEFUSVZFKFAxRCknIC8vIGxhc3QgMSBkYXlzXG4gICAqICdSRUxBVElWRShQN0QpJyAvLyBsYXN0IDEgd2Vla3MgKG5vdGljZSB3ZSBnZXQgbW9kIG9mIDcgZGF5cylcbiAgICogJ1JFTEFUSVZFKFAxTSknIC8vIGxhc3QgMSBtb250aFxuICAgKiAnUkVMQVRJVkUoUDFZKScgLy8gbGFzdCAxIHllYXJcbiAgICoqL1xuICBkYXRlUmVsYXRpdmU6ICh2YWw6IHN0cmluZyk6IFZhbHVlVHlwZXNbJ3JlbGF0aXZlJ10gPT4ge1xuICAgIGxldCBsYXN0ID0gJydcbiAgICBjb25zdCBndXRzID0gdmFsLnNwbGl0KCcoJylbMV0uc3BsaXQoJyknKVswXS5zdWJzdHJpbmcoMSkgLy8gZ2V0IHRoZSB0aGluZyBiZXR3ZWVuIHRoZSBwYXJlbnMsIG5vdGljZSB3ZSBkb24ndCBjYXJlIGFib3V0IFAgZWl0aGVyXG4gICAgbGV0IHVuaXQgPSBndXRzLmNoYXJBdChndXRzLmxlbmd0aCAtIDEpIC8vIG5vdGljZSB0aGF0IHdlIHN0aWxsIG5lZWQgdG8ga25vdyBpZiBpdCdzIG1pbnV0ZXMgb3IgbW9udGhzLCB0aGUgdW5pdCBpcyB0aGUgc2FtZSBiZXR3ZWVuIHRoZW0hXG4gICAgaWYgKGd1dHMuY2hhckF0KDApID09PSAnVCcpIHtcbiAgICAgIGxhc3QgPSBndXRzLnN1YnN0cmluZygxLCBndXRzLmxlbmd0aCAtIDEpXG4gICAgICB1bml0ID0gdW5pdC50b0xvd2VyQ2FzZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3QgPSBndXRzLnN1YnN0cmluZygwLCBndXRzLmxlbmd0aCAtIDEpXG4gICAgICBpZiAodW5pdCAhPT0gJ00nKSB7XG4gICAgICAgIHVuaXQgPSB1bml0LnRvTG93ZXJDYXNlKCkgLy8gb25seSBNIGRpZmZlcnMgZ2l2ZW4gdGhlIGNvbmZsaWN0IGJldHdlZW4gbWludXRlcyAvIG1vbnRoc1xuICAgICAgfVxuICAgICAgaWYgKHVuaXQgPT09ICdkJykge1xuICAgICAgICBpZiAoTnVtYmVyKGxhc3QpICUgNyA9PT0gMCkge1xuICAgICAgICAgIC8vIG1hbnVhbGx5IGNvbnZlcnQgdG8gd2Vla3Mgc2luY2UgaXQncyBub3QgXCJyZWFsbHlcIiBhIGNxbCBzdXBwb3J0ZWQgdW5pdCBmb3IgcmVsYXRpdmVcbiAgICAgICAgICBsYXN0ID0gKE51bWJlcihsYXN0KSAvIDcpLnRvU3RyaW5nKClcbiAgICAgICAgICB1bml0ID0gJ3cnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhc3QsXG4gICAgICB1bml0LFxuICAgIH0gYXMgVmFsdWVUeXBlc1sncmVsYXRpdmUnXVxuICB9LFxufVxuXG5leHBvcnQgY29uc3Qgc2VyaWFsaXplID0ge1xuICBkYXRlUmVsYXRpdmU6ICh7IGxhc3QsIHVuaXQgfTogVmFsdWVUeXBlc1sncmVsYXRpdmUnXSkgPT4ge1xuICAgIGlmICh1bml0ID09PSB1bmRlZmluZWQgfHwgIXBhcnNlRmxvYXQobGFzdCkpIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgICAvL1dlZWtzIGlzIG5vdCBhIHZhbGlkIHVuaXQsIHNvIGNvbnZlcnQgdGhpcyB0byBkYXlzXG4gICAgaWYgKHVuaXQgPT09ICd3Jykge1xuICAgICAgbGV0IGNvbnZlcnRlZFVuaXQgPSAnZCdcbiAgICAgIGxldCBjb252ZXJ0ZWRMYXN0ID0gKHBhcnNlRmxvYXQobGFzdCkgKiA3KS50b1N0cmluZygpXG4gICAgICByZXR1cm4gYFJFTEFUSVZFKCR7J1AnICsgY29udmVydGVkTGFzdCArIGNvbnZlcnRlZFVuaXQudG9VcHBlckNhc2UoKX0pYFxuICAgIH1cbiAgICBjb25zdCBwcmVmaXggPSB1bml0ID09PSAncycgfHwgdW5pdCA9PT0gJ20nIHx8IHVuaXQgPT09ICdoJyA/ICdQVCcgOiAnUCdcbiAgICByZXR1cm4gYFJFTEFUSVZFKCR7cHJlZml4ICsgbGFzdCArIHVuaXQudG9VcHBlckNhc2UoKX0pYFxuICB9LFxuICBkYXRlQXJvdW5kOiAodmFsdWU6IFZhbHVlVHlwZXNbJ2Fyb3VuZCddKSA9PiB7XG4gICAgaWYgKFxuICAgICAgdmFsdWUuYnVmZmVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgIHZhbHVlLmRhdGUgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdmFsdWUuZGlyZWN0aW9uID09PSB1bmRlZmluZWRcbiAgICApIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgICBsZXQgYmVmb3JlID0gWydib3RoJywgJ2JlZm9yZSddLmluY2x1ZGVzKHZhbHVlLmRpcmVjdGlvbilcbiAgICAgID8gbW9tZW50KHZhbHVlLmRhdGUpXG4gICAgICAgICAgLnN1YnRyYWN0KHZhbHVlLmJ1ZmZlci5hbW91bnQsIHZhbHVlLmJ1ZmZlci51bml0KVxuICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICA6IHZhbHVlLmRhdGVcbiAgICBsZXQgYWZ0ZXIgPSBbJ2JvdGgnLCAnYWZ0ZXInXS5pbmNsdWRlcyh2YWx1ZS5kaXJlY3Rpb24pXG4gICAgICA/IG1vbWVudCh2YWx1ZS5kYXRlKVxuICAgICAgICAgIC5hZGQodmFsdWUuYnVmZmVyLmFtb3VudCwgdmFsdWUuYnVmZmVyLnVuaXQpXG4gICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgIDogdmFsdWUuZGF0ZVxuICAgIHJldHVybiBgRFVSSU5HICR7YmVmb3JlfS8ke2FmdGVyfWBcbiAgfSxcbiAgZGF0ZUJldHdlZW46ICh2YWx1ZTogVmFsdWVUeXBlc1snYmV0d2VlbiddKSA9PiB7XG4gICAgY29uc3QgZnJvbSA9IG1vbWVudCh2YWx1ZS5zdGFydClcbiAgICBjb25zdCB0byA9IG1vbWVudCh2YWx1ZS5lbmQpXG4gICAgaWYgKGZyb20uaXNBZnRlcih0bykpIHtcbiAgICAgIHJldHVybiAodG8udG9JU09TdHJpbmcoKSB8fCAnJykgKyAnLycgKyAoZnJvbS50b0lTT1N0cmluZygpIHx8ICcnKVxuICAgIH1cbiAgICByZXR1cm4gKGZyb20udG9JU09TdHJpbmcoKSB8fCAnJykgKyAnLycgKyAodG8udG9JU09TdHJpbmcoKSB8fCAnJylcbiAgfSxcbiAgbG9jYXRpb246IChwcm9wZXJ0eTogc3RyaW5nLCB2YWx1ZTogVmFsdWVUeXBlc1snbG9jYXRpb24nXSkgPT4ge1xuICAgIGNvbnN0IHRyYW5zZm9ybWF0aW9uID0gRXh0ZW5zaW9uUG9pbnRzLnNlcmlhbGl6ZUxvY2F0aW9uKHByb3BlcnR5LCB2YWx1ZSlcbiAgICBpZiAodHJhbnNmb3JtYXRpb24gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm1hdGlvblxuICAgIH1cbiAgICByZXR1cm4gQ1FMVXRpbHMuZ2VuZXJhdGVBbnlHZW9GaWx0ZXIocHJvcGVydHksIHZhbHVlKVxuICB9LFxufVxuXG5jbGFzcyBCYXNlRmlsdGVyQnVpbGRlckNsYXNzIGV4dGVuZHMgU3ByZWFkT3BlcmF0b3JQcm90ZWN0ZWRDbGFzcyB7XG4gIHJlYWRvbmx5IHR5cGU6IHN0cmluZ1xuICByZWFkb25seSBmaWx0ZXJzOiBBcnJheTxhbnk+XG4gIHJlYWRvbmx5IG5lZ2F0ZWQ6IGJvb2xlYW5cbiAgcmVhZG9ubHkgaWQ6IHN0cmluZ1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdHlwZSA9ICdBTkQnLFxuICAgIGZpbHRlcnMgPSBbbmV3IEZpbHRlckNsYXNzKCldLFxuICAgIG5lZ2F0ZWQgPSBmYWxzZSxcbiAgICBpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSxcbiAgfToge1xuICAgIHR5cGU/OiBCYXNlRmlsdGVyQnVpbGRlckNsYXNzWyd0eXBlJ11cbiAgICBmaWx0ZXJzPzogQmFzZUZpbHRlckJ1aWxkZXJDbGFzc1snZmlsdGVycyddXG4gICAgbmVnYXRlZD86IEJhc2VGaWx0ZXJCdWlsZGVyQ2xhc3NbJ25lZ2F0ZWQnXVxuICAgIGlkPzogc3RyaW5nXG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgLyoqXG4gICAgICogSWYgZm9yIHNvbWUgcmVhc29uIGZpbHRlcnMgY29tZSBpbiB0aGF0IGFyZW4ndCBjbGFzc2VkLCB0aGlzIHdpbGwgaGFuZGxlIGl0LlxuICAgICAqL1xuICAgIHRoaXMuZmlsdGVycyA9IGZpbHRlcnMubWFwKChjaGlsZEZpbHRlcikgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBpc0ZpbHRlckJ1aWxkZXJDbGFzcyhjaGlsZEZpbHRlcikgfHxcbiAgICAgICAgc2hvdWxkQmVGaWx0ZXJCdWlsZGVyQ2xhc3MoY2hpbGRGaWx0ZXIpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgIC4uLmNoaWxkRmlsdGVyLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgLi4uY2hpbGRGaWx0ZXIsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLm5lZ2F0ZWQgPSBuZWdhdGVkXG4gICAgdGhpcy5pZCA9IGlkXG4gIH1cbn1cbmV4cG9ydCBjbGFzcyBGaWx0ZXJCdWlsZGVyQ2xhc3MgZXh0ZW5kcyBCYXNlRmlsdGVyQnVpbGRlckNsYXNzIHtcbiAgZGVjbGFyZSByZWFkb25seSB0eXBlOiAnQU5EJyB8ICdPUidcbiAgZGVjbGFyZSByZWFkb25seSBmaWx0ZXJzOiBBcnJheTxGaWx0ZXJCdWlsZGVyQ2xhc3MgfCBGaWx0ZXJDbGFzcz5cbiAgY29uc3RydWN0b3Ioe1xuICAgIHR5cGUgPSAnQU5EJyxcbiAgICBmaWx0ZXJzID0gW25ldyBGaWx0ZXJDbGFzcygpXSxcbiAgICBuZWdhdGVkID0gZmFsc2UsXG4gICAgaWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCksXG4gIH06IHtcbiAgICB0eXBlPzogRmlsdGVyQnVpbGRlckNsYXNzWyd0eXBlJ11cbiAgICBmaWx0ZXJzPzogRmlsdGVyQnVpbGRlckNsYXNzWydmaWx0ZXJzJ11cbiAgICBuZWdhdGVkPzogRmlsdGVyQnVpbGRlckNsYXNzWyduZWdhdGVkJ11cbiAgICBpZD86IHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICBzdXBlcih7IHR5cGUsIGZpbHRlcnMsIG5lZ2F0ZWQsIGlkIH0pXG4gIH1cbn1cblxuLyoqXG4gKiAgV2Ugd2FudCB0byBzdXBwb3J0IG1vcmUgY29tcGxleCBuZWdhdGlvbiB0aGFuIGFsbG93ZWQgYnkgdGhlIG5vcm1hbCBmaWx0ZXIgdHJlZSwgc28gd2Ugc3RvcmUgbmVnYXRlZCBpbiBhIHByb3BlcnR5LlxuICogIEhvd2V2ZXIsIHNpbmNlIHRoZSB3cml0ZSBmdW5jdGlvbiBpbiBjcWwudHN4IGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzLCBhdCBzb21lIHBvaW50IHdlIG5lZWQgdG8gY29udmVydCBpdCBiYWNrIHRvIHRoaXMgY2xhc3Mgd2hlcmUgbmVnYXRpb24gZXhpc3RzIGFzIGEgdHlwZSBpbnN0ZWFkIG9mIHByb3BlcnR5LlxuICogIFNlZSB0aGUgdW5jb2xsYXBzZU5vdHMgZnVuY3Rpb24gaW4gY3FsLnRzeCBmb3Igd2hlcmUgdGhpcyBpcyBkb25lLlxuICovXG5leHBvcnQgY2xhc3MgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3MgZXh0ZW5kcyBCYXNlRmlsdGVyQnVpbGRlckNsYXNzIHtcbiAgZGVjbGFyZSByZWFkb25seSB0eXBlOiAnQU5EJyB8ICdPUicgfCAnTk9UJ1xuICBkZWNsYXJlIHJlYWRvbmx5IGZpbHRlcnM6IEFycmF5PFxuICAgIEZpbHRlckNsYXNzIHwgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3MgfCBGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgPlxuICBjb25zdHJ1Y3Rvcih7XG4gICAgdHlwZSA9ICdBTkQnLFxuICAgIGZpbHRlcnMgPSBbbmV3IEZpbHRlckNsYXNzKCldLFxuICAgIG5lZ2F0ZWQgPSBmYWxzZSxcbiAgICBpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSxcbiAgfToge1xuICAgIHR5cGU/OiBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1sndHlwZSddXG4gICAgZmlsdGVycz86IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzWydmaWx0ZXJzJ11cbiAgICBuZWdhdGVkPzogQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3NbJ25lZ2F0ZWQnXVxuICAgIGlkPzogc3RyaW5nXG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKHsgdHlwZSwgZmlsdGVycywgbmVnYXRlZCwgaWQgfSlcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBCb29sZWFuVGV4dFR5cGUgPSB7XG4gIHRleHQ6IHN0cmluZ1xuICBjcWw6IHN0cmluZ1xuICBlcnJvcjogYm9vbGVhblxuICBlcnJvck1lc3NhZ2U/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVUeXBlcyA9IHtcbiAgcHJveGltaXR5OiB7XG4gICAgZmlyc3Q6IHN0cmluZ1xuICAgIHNlY29uZDogc3RyaW5nXG4gICAgZGlzdGFuY2U6IG51bWJlclxuICB9XG4gIGRhdGU6IHN0cmluZ1xuICBib29sZWFuOiBib29sZWFuXG4gIHRleHQ6IHN0cmluZ1xuICBmbG9hdDogbnVtYmVyXG4gIGludGVnZXI6IG51bWJlclxuICByZWxhdGl2ZToge1xuICAgIGxhc3Q6IHN0cmluZ1xuICAgIC8vTk9URTogV2Vla3MgaXMgbm90IGEgdmFsaWQgdW5pdCwgYnV0IHdlIGFsbG93IGl0IGluIG91ciBzeXN0ZW0uXG4gICAgLy9UaGlzIGlzIGNvbnZlcnRlZCB0byBkYXlzIHRvIGJlY29tZSB2YWxpZCBjcWxcbiAgICB1bml0OiAnbScgfCAnaCcgfCAnZCcgfCAnTScgfCAneScgfCAncycgfCAndydcbiAgfVxuICBhcm91bmQ6IHtcbiAgICBkYXRlOiBzdHJpbmdcbiAgICBidWZmZXI6IHtcbiAgICAgIGFtb3VudDogc3RyaW5nXG4gICAgICB1bml0OiAnbScgfCAnaCcgfCAnZCcgfCAnTScgfCAneScgfCAncycgfCAndydcbiAgICB9XG4gICAgZGlyZWN0aW9uOiAnYm90aCcgfCAnYmVmb3JlJyB8ICdhZnRlcidcbiAgfVxuICBkdXJpbmc6IHtcbiAgICBzdGFydDogc3RyaW5nXG4gICAgZW5kOiBzdHJpbmdcbiAgfVxuICBiZXR3ZWVuOiB7XG4gICAgc3RhcnQ6IG51bWJlclxuICAgIGVuZDogbnVtYmVyXG4gIH1cbiAgbXVsdGl2YWx1ZTogc3RyaW5nW11cbiAgYm9vbGVhblRleHQ6IEJvb2xlYW5UZXh0VHlwZVxuICBsb2NhdGlvbjogLy8gdGhpcyBpcyBhbGwgd2UgdGVjaG5pY2FsbHkgbmVlZCB0byByZWNvbnN0cnVjdCAobG8gZmlkZWxpdHkpXG4gIExpbmVMb2NhdGlvbiB8IFBvbHlnb25Mb2NhdGlvbiB8IFBvaW50UmFkaXVzTG9jYXRpb25cbn1cblxuZXhwb3J0IHR5cGUgTGluZUxvY2F0aW9uID0ge1xuICB0eXBlOiAnTElORSdcbiAgbW9kZTogJ2xpbmUnXG4gIGxpbmVXaWR0aD86IHN0cmluZ1xuICBsaW5lOiBBcnJheTxBcnJheTxudW1iZXI+PlxufVxuZXhwb3J0IHR5cGUgUG9seWdvbkxvY2F0aW9uID0ge1xuICB0eXBlOiAnUE9MWUdPTidcbiAgcG9seWdvbkJ1ZmZlcldpZHRoPzogbnVtYmVyIHwgc3RyaW5nXG4gIHBvbHlnb25CdWZmZXJVbml0cz86ICdtZXRlcnMnXG4gIHBvbHlnb246IEFycmF5PEFycmF5PG51bWJlcj4+XG4gIGxvY2F0aW9uVHlwZT86ICdkZCdcbiAgcG9seVR5cGU/OiAncG9seWdvbidcbiAgbW9kZTogJ3BvbHknXG59XG5leHBvcnQgdHlwZSBQb2ludFJhZGl1c0xvY2F0aW9uID0ge1xuICB0eXBlOiAnUE9JTlRSQURJVVMnXG4gIHJhZGl1czogbnVtYmVyIHwgc3RyaW5nXG4gIHJhZGl1c1VuaXRzPzogJ21ldGVycydcbiAgbW9kZTogJ2NpcmNsZSdcbiAgbGF0OiBudW1iZXJcbiAgbG9uOiBudW1iZXJcbiAgbG9jYXRpb25UeXBlPzogJ2RkJ1xufVxuXG5leHBvcnQgdHlwZSBWYWx1ZVR5cGUgPSBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCB8IFZhbHVlc1R5cGU8VmFsdWVUeXBlcz5cblxuZXhwb3J0IHR5cGUgRmlsdGVyQ29udGV4dCA9IHtcbiAgW2tleTogc3RyaW5nXTogYW55XG59XG5cbmV4cG9ydCBjbGFzcyBGaWx0ZXJDbGFzcyBleHRlbmRzIFNwcmVhZE9wZXJhdG9yUHJvdGVjdGVkQ2xhc3Mge1xuICB0eXBlOlxuICAgIHwgJ0JFRk9SRSdcbiAgICB8ICdBRlRFUidcbiAgICB8ICdSRUxBVElWRSdcbiAgICB8ICc9J1xuICAgIHwgJ0RVUklORydcbiAgICB8ICdHRU9NRVRSWSdcbiAgICB8ICdEV0lUSElOJ1xuICAgIHwgJ0lMSUtFJ1xuICAgIHwgJ0xJS0UnXG4gICAgfCAnSVMgTlVMTCdcbiAgICB8ICc+J1xuICAgIHwgJzwnXG4gICAgfCAnPSdcbiAgICB8ICc8PSdcbiAgICB8ICc+PSdcbiAgICB8ICdEVVJJTkcnXG4gICAgfCAnQkVUV0VFTidcbiAgICB8ICdGSUxURVIgRlVOQ1RJT04gcHJveGltaXR5J1xuICAgIHwgJ0FST1VORCcgLy8gVGhpcyBpc24ndCB2YWxpZCBjcWwsIGJ1dCBzb21ldGhpbmcgd2Ugc3VwcG9ydFxuICAgIHwgJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnIC8vIFRoaXMgaXNuJ3QgdmFsaWQgY3FsLCBidXQgc29tZXRoaW5nIHdlIHN1cHBvcnRcbiAgcmVhZG9ubHkgcHJvcGVydHk6IHN0cmluZ1xuICByZWFkb25seSB2YWx1ZTogVmFsdWVUeXBlXG4gIHJlYWRvbmx5IG5lZ2F0ZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWRcbiAgcmVhZG9ubHkgaWQ6IHN0cmluZ1xuICByZWFkb25seSBjb250ZXh0PzogRmlsdGVyQ29udGV4dFxuICBjb25zdHJ1Y3Rvcih7XG4gICAgdHlwZSA9ICdJTElLRScsXG4gICAgcHJvcGVydHkgPSAnYW55VGV4dCcsXG4gICAgdmFsdWUgPSAnJyxcbiAgICBuZWdhdGVkID0gZmFsc2UsXG4gICAgaWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCksXG4gICAgY29udGV4dCxcbiAgfToge1xuICAgIHR5cGU/OiBGaWx0ZXJDbGFzc1sndHlwZSddXG4gICAgcHJvcGVydHk/OiBGaWx0ZXJDbGFzc1sncHJvcGVydHknXVxuICAgIHZhbHVlPzogRmlsdGVyQ2xhc3NbJ3ZhbHVlJ11cbiAgICBuZWdhdGVkPzogRmlsdGVyQ2xhc3NbJ25lZ2F0ZWQnXVxuICAgIGlkPzogc3RyaW5nXG4gICAgY29udGV4dD86IEZpbHRlckNvbnRleHRcbiAgfSA9IHt9KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHlcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgICB0aGlzLm5lZ2F0ZWQgPSBuZWdhdGVkXG4gICAgdGhpcy5pZCA9IGlkXG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dFxuICB9XG59XG5cbi8qKlxuICogZGV0ZXJtaW5lIGl0IGlzIGFjdHVhbGx5IGFuIHBsYWluIG9iamVjdCBmb3JtIG9mIHRoZSBmaWx0ZXIgYnVpbGRlciBjbGFzc1xuICovXG5leHBvcnQgY29uc3Qgc2hvdWxkQmVGaWx0ZXJCdWlsZGVyQ2xhc3MgPSAoXG4gIGZpbHRlcjogYW55XG4pOiBmaWx0ZXIgaXMgRmlsdGVyQnVpbGRlckNsYXNzID0+IHtcbiAgcmV0dXJuICFpc0ZpbHRlckJ1aWxkZXJDbGFzcyhmaWx0ZXIpICYmIGZpbHRlci5maWx0ZXJzICE9PSB1bmRlZmluZWRcbn1cblxuLyoqXG4gKmRldGVybWluZSBpdCBpcyBhY3R1YWxseSBhbiBpbnN0YW50aWF0aW9uIG9mIHRoZSBmaWx0ZXIgYnVpbGRlciBjbGFzc1xuICovXG5leHBvcnQgY29uc3QgaXNGaWx0ZXJCdWlsZGVyQ2xhc3MgPSAoXG4gIGZpbHRlcjpcbiAgICB8IEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIHwgRmlsdGVyQ2xhc3NcbiAgICB8IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzXG4gICAgfCBQYXJ0aWFsPEZpbHRlckJ1aWxkZXJDbGFzcz5cbiAgICB8IFBhcnRpYWw8RmlsdGVyQ2xhc3M+XG4gICAgfCBQYXJ0aWFsPENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzPlxuKTogZmlsdGVyIGlzIEZpbHRlckJ1aWxkZXJDbGFzcyA9PiB7XG4gIHJldHVybiBmaWx0ZXIuY29uc3RydWN0b3IgPT09IEZpbHRlckJ1aWxkZXJDbGFzc1xufVxuXG4vKipcbiAqZGV0ZXJtaW5lIGl0IGlzIGFjdHVhbGx5IGFuIGluc3RhbnRpYXRpb24gb2YgdGhlIGNxbCBzdGFuZGFyZCBmaWx0ZXIgYnVpbGRlciBjbGFzc1xuICovXG5leHBvcnQgY29uc3QgaXNDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyA9IChcbiAgZmlsdGVyOlxuICAgIHwgRmlsdGVyQnVpbGRlckNsYXNzXG4gICAgfCBGaWx0ZXJDbGFzc1xuICAgIHwgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgICB8IFBhcnRpYWw8RmlsdGVyQnVpbGRlckNsYXNzPlxuICAgIHwgUGFydGlhbDxGaWx0ZXJDbGFzcz5cbiAgICB8IFBhcnRpYWw8Q1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3M+XG4pOiBmaWx0ZXIgaXMgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3MgPT4ge1xuICByZXR1cm4gZmlsdGVyLmNvbnN0cnVjdG9yID09PSBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2ljRmlsdGVyQ2xhc3MgZXh0ZW5kcyBPbWl0PEZpbHRlckNsYXNzLCAncHJvcGVydHknPiB7XG4gIHByb3BlcnR5OiBzdHJpbmdbXVxufVxuXG5pbnRlcmZhY2UgQmFzaWNEYXRhdHlwZUNsYXNzIGV4dGVuZHMgT21pdDxGaWx0ZXJDbGFzcywgJ3Byb3BlcnR5JyB8ICd2YWx1ZSc+IHtcbiAgcHJvcGVydHk6IHR5cGVvZiBCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXG4gIHZhbHVlOiBzdHJpbmdbXVxufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNEYXRhdHlwZUZpbHRlclxuICBleHRlbmRzIEZpbHRlckNsYXNzXG4gIGltcGxlbWVudHMgQmFzaWNEYXRhdHlwZUNsYXNzXG57XG4gIHByb3BlcnR5OiB0eXBlb2YgQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZVxuICB2YWx1ZTogc3RyaW5nW11cblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgdmFsdWUgPSBbXSxcbiAgICBjb250ZXh0LFxuICB9OiB7XG4gICAgdmFsdWU/OiBzdHJpbmdbXVxuICAgIGNvbnRleHQ/OiBGaWx0ZXJDb250ZXh0XG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKHtcbiAgICAgIHByb3BlcnR5OiBCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lLFxuICAgICAgdmFsdWUsXG4gICAgICBjb250ZXh0LFxuICAgIH0pXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzQmFzaWNEYXRhdHlwZUNsYXNzID0gKFxuICBmaWx0ZXI6XG4gICAgfCBGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgICB8IEZpbHRlckNsYXNzXG4gICAgfCBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIHwgUGFydGlhbDxGaWx0ZXJCdWlsZGVyQ2xhc3M+XG4gICAgfCBQYXJ0aWFsPEZpbHRlckNsYXNzPlxuICAgIHwgUGFydGlhbDxDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcz5cbik6IGZpbHRlciBpcyBCYXNpY0RhdGF0eXBlQ2xhc3MgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiAoZmlsdGVyIGFzIGFueSk/LnByb3BlcnR5ID09PSBCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZXNvdXJjZVNpemVGaWx0ZXJDbGFzcyBleHRlbmRzIEZpbHRlckNsYXNzIHtcbiAgZGVjbGFyZSB2YWx1ZTogbnVtYmVyXG4gIGRlY2xhcmUgY29udGV4dDogRmlsdGVyQ29udGV4dCAmIHsgdW5pdHM6IHN0cmluZyB9XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB2YWx1ZSA9IDAsXG4gICAgY29udGV4dCA9IHsgdW5pdHM6ICdCJyB9LFxuICAgIC4uLm90aGVyUHJvcHNcbiAgfTogT21pdDxGaWx0ZXJDbGFzcywgJ19ET19OT1RfVVNFX1NQUkVBRF9PUEVSQVRPUicgfCAndmFsdWUnIHwgJ2NvbnRleHQnPiAmIHtcbiAgICB2YWx1ZTogbnVtYmVyXG4gICAgY29udGV4dDogRmlsdGVyQ29udGV4dCAmIHsgdW5pdHM6IHN0cmluZyB9XG4gIH0pIHtcbiAgICBzdXBlcih7XG4gICAgICAuLi5vdGhlclByb3BzLFxuICAgICAgdmFsdWUsXG4gICAgICBjb250ZXh0OiB7XG4gICAgICAgIC4uLmNvbnRleHQsXG4gICAgICAgIHVuaXRzOiBjb250ZXh0LnVuaXRzLFxuICAgICAgfSxcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzIGV4dGVuZHMgRmlsdGVyQ2xhc3Mge1xuICBkZWNsYXJlIHZhbHVlOiB7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyIH1cbiAgZGVjbGFyZSBjb250ZXh0OiBGaWx0ZXJDb250ZXh0ICYgeyBzdGFydFVuaXRzOiBzdHJpbmc7IGVuZFVuaXRzOiBzdHJpbmcgfVxuICBjb25zdHJ1Y3Rvcih7XG4gICAgdmFsdWUgPSB7IHN0YXJ0OiAwLCBlbmQ6IDEgfSxcbiAgICBjb250ZXh0ID0geyBzdGFydFVuaXRzOiAnQicsIGVuZFVuaXRzOiAnQicgfSxcbiAgICAuLi5vdGhlclByb3BzXG4gIH06IE9taXQ8RmlsdGVyQ2xhc3MsICdfRE9fTk9UX1VTRV9TUFJFQURfT1BFUkFUT1InIHwgJ3ZhbHVlJyB8ICdjb250ZXh0Jz4gJiB7XG4gICAgdmFsdWU6IHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfVxuICAgIGNvbnRleHQ6IEZpbHRlckNvbnRleHQgJiB7IHN0YXJ0VW5pdHM6IHN0cmluZzsgZW5kVW5pdHM6IHN0cmluZyB9XG4gIH0pIHtcbiAgICBzdXBlcih7XG4gICAgICAuLi5vdGhlclByb3BzLFxuICAgICAgdmFsdWUsXG4gICAgICBjb250ZXh0OiB7XG4gICAgICAgIC4uLmNvbnRleHQsXG4gICAgICAgIHN0YXJ0VW5pdHM6IGNvbnRleHQuc3RhcnRVbml0cyxcbiAgICAgICAgZW5kVW5pdHM6IGNvbnRleHQuZW5kVW5pdHMsXG4gICAgICB9LFxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzUmVzb3VyY2VTaXplRmlsdGVyQ2xhc3MgPSAoXG4gIGZpbHRlcjpcbiAgICB8IEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIHwgRmlsdGVyQ2xhc3NcbiAgICB8IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzXG4gICAgfCBQYXJ0aWFsPEZpbHRlckJ1aWxkZXJDbGFzcz5cbiAgICB8IFBhcnRpYWw8RmlsdGVyQ2xhc3M+XG4gICAgfCBQYXJ0aWFsPENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzPlxuKTogZmlsdGVyIGlzIFJlc291cmNlU2l6ZUZpbHRlckNsYXNzID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gKFxuICAgICAgKGZpbHRlciBhcyBhbnkpPy52YWx1ZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0eXBlb2YgKGZpbHRlciBhcyBhbnkpPy52YWx1ZSA9PT0gJ251bWJlcicgJiZcbiAgICAgICFpc05hTigoZmlsdGVyIGFzIGFueSk/LnZhbHVlKSAmJlxuICAgICAgKGZpbHRlciBhcyBhbnkpPy5jb250ZXh0Py51bml0cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBzaXplVW5pdHMuaW5jbHVkZXMoKGZpbHRlciBhcyBhbnkpPy5jb250ZXh0Py51bml0cylcbiAgICApXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBpc1Jlc291cmNlU2l6ZVJhbmdlRmlsdGVyQ2xhc3MgPSAoXG4gIGZpbHRlcjpcbiAgICB8IEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIHwgRmlsdGVyQ2xhc3NcbiAgICB8IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzXG4gICAgfCBQYXJ0aWFsPEZpbHRlckJ1aWxkZXJDbGFzcz5cbiAgICB8IFBhcnRpYWw8RmlsdGVyQ2xhc3M+XG4gICAgfCBQYXJ0aWFsPENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzPlxuKTogZmlsdGVyIGlzIFJlc291cmNlU2l6ZVJhbmdlRmlsdGVyQ2xhc3MgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiAoXG4gICAgICAoZmlsdGVyIGFzIGFueSk/LnZhbHVlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHR5cGVvZiAoZmlsdGVyIGFzIGFueSk/LnZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIChmaWx0ZXIgYXMgYW55KT8udmFsdWUuc3RhcnQgPT09ICdudW1iZXInICYmXG4gICAgICB0eXBlb2YgKGZpbHRlciBhcyBhbnkpPy52YWx1ZS5lbmQgPT09ICdudW1iZXInICYmXG4gICAgICAoZmlsdGVyIGFzIGFueSk/LmNvbnRleHQ/LnN0YXJ0VW5pdHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgKGZpbHRlciBhcyBhbnkpPy5jb250ZXh0Py5lbmRVbml0cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBzaXplVW5pdHMuaW5jbHVkZXMoKGZpbHRlciBhcyBhbnkpPy5jb250ZXh0Py5zdGFydFVuaXRzKSAmJlxuICAgICAgc2l6ZVVuaXRzLmluY2x1ZGVzKChmaWx0ZXIgYXMgYW55KT8uY29udGV4dD8uZW5kVW5pdHMpXG4gICAgKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgc2l6ZVVuaXRzID0gW1xuICAnQicsIC8vIEJ5dGVzXG4gICdLQicsIC8vIEtpbG9ieXRlc1xuICAnTUInLCAvLyBNZWdhYnl0ZXNcbiAgJ0dCJywgLy8gR2lnYWJ5dGVzXG4gICdUQicsIC8vIFRlcmFieXRlc1xuICAnUEInLCAvLyBQZXRhYnl0ZXNcbl1cblxuY29uc3QgY29udmVydFRvQnl0ZXNGcm9tVW5pdCA9ICh2YWx1ZTogbnVtYmVyLCB1bml0OiBzdHJpbmcpOiBudW1iZXIgPT4ge1xuICBjb25zdCB1bml0SW5kZXggPSBzaXplVW5pdHMuaW5kZXhPZih1bml0KVxuICBpZiAodW5pdEluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiB2YWx1ZSAvLyBJZiB1bml0IGlzIG5vdCByZWNvZ25pemVkLCByZXR1cm4gdGhlIG9yaWdpbmFsIHZhbHVlXG4gIH1cbiAgcmV0dXJuIHZhbHVlICogTWF0aC5wb3coMTAwMCwgdW5pdEluZGV4KVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHJvdW5kcyBkb3duIHRvIHRoZSBuZWFyZXN0IHdob2xlIG51bWJlciBpbiBieXRlc1xuZXhwb3J0IGNvbnN0IGNvbnZlcnRSZXNvdXJjZVNpemVGaWx0ZXJDbGFzc1ZhbHVlVG9CeXRlcyA9IChcbiAgZmlsdGVyOiBSZXNvdXJjZVNpemVGaWx0ZXJDbGFzc1xuKTogbnVtYmVyID0+IHtcbiAgY29uc3QgeyB2YWx1ZSwgY29udGV4dCB9ID0gZmlsdGVyXG4gIGNvbnN0IHVuaXQgPSBjb250ZXh0Py51bml0cyB8fCAnQidcbiAgcmV0dXJuIE1hdGguZmxvb3IoY29udmVydFRvQnl0ZXNGcm9tVW5pdCh2YWx1ZSwgdW5pdCkpXG59XG5cbmV4cG9ydCBjb25zdCBjb252ZXJ0UmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzc1ZhbHVlVG9CeXRlcyA9IChcbiAgZmlsdGVyOiBSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzXG4pOiB7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyIH0gPT4ge1xuICBjb25zdCB7IHZhbHVlLCBjb250ZXh0IH0gPSBmaWx0ZXJcbiAgY29uc3Qgc3RhcnRVbml0ID0gY29udGV4dD8uc3RhcnRVbml0cyB8fCAnQidcbiAgY29uc3QgZW5kVW5pdCA9IGNvbnRleHQ/LmVuZFVuaXRzIHx8ICdCJ1xuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBNYXRoLmZsb29yKGNvbnZlcnRUb0J5dGVzRnJvbVVuaXQodmFsdWUuc3RhcnQsIHN0YXJ0VW5pdCkpLFxuICAgIGVuZDogTWF0aC5mbG9vcihjb252ZXJ0VG9CeXRlc0Zyb21Vbml0KHZhbHVlLmVuZCwgZW5kVW5pdCkpLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0Qnl0ZXNUb0h1bWFuUmVhZGFibGUoYnl0ZXM6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IHVuaXRzID0gWydCJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJ11cbiAgbGV0IHVuaXRJbmRleCA9IDBcbiAgd2hpbGUgKGJ5dGVzID49IDEwMDAgJiYgdW5pdEluZGV4IDwgdW5pdHMubGVuZ3RoIC0gMSkge1xuICAgIGJ5dGVzIC89IDEwMDBcbiAgICB1bml0SW5kZXgrK1xuICB9XG4gIHJldHVybiBgJHtieXRlcy50b0ZpeGVkKDIpfSAke3VuaXRzW3VuaXRJbmRleF19YFxufVxuIl19