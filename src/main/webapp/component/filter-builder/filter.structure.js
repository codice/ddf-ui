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
    'B', // Bytes
    'KB', // Kilobytes
    'MB', // Megabytes
    'GB', // Gigabytes
    'TB', // Terabytes
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLnN0cnVjdHVyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUVwQyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQTtBQUd4QyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUN2RSxPQUFPLGVBQWUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNwRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUVqRSxNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUc7SUFDekI7Ozs7Ozs7OztRQVNJO0lBQ0osWUFBWSxFQUFFLFVBQUMsR0FBVztRQUN4QixJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7UUFDYixJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyx3RUFBd0U7UUFDbEksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBLENBQUMsa0dBQWtHO1FBQzFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUMzQixJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUN6QyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcs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QUUsQ0FBQTtJQUNiLENBQUM7SUFDRCxPQUFPLFVBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsY0FBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUUsQ0FBQTtBQUNsRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudC10aW1lem9uZSdcbmltcG9ydCB7IFZhbHVlc1R5cGUgfSBmcm9tICd1dGlsaXR5LXR5cGVzJ1xuaW1wb3J0IENRTFV0aWxzIGZyb20gJy4uLy4uL2pzL0NRTFV0aWxzJ1xuaW1wb3J0IHsgT21pdCB9IGZyb20gJy4uLy4uL3R5cGVzY3JpcHQnXG5cbmltcG9ydCB7IFNwcmVhZE9wZXJhdG9yUHJvdGVjdGVkQ2xhc3MgfSBmcm9tICcuLi8uLi90eXBlc2NyaXB0L2NsYXNzZXMnXG5pbXBvcnQgRXh0ZW5zaW9uUG9pbnRzIGZyb20gJy4uLy4uL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgeyBCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lIH0gZnJvbSAnLi9yZXNlcnZlZC5wcm9wZXJ0aWVzJ1xuXG5leHBvcnQgY29uc3QgZGVzZXJpYWxpemUgPSB7XG4gIC8qKlxuICAgKiBleGFtcGxlIGlucHV0czogIC8vICcgYXJlIHBhcnQgb2YgaW5wdXRcbiAgICogJ1JFTEFUSVZFKFBUMVMpJyAvLyBsYXN0IDEgc2Vjb25kc1xuICAgKiAnUkVMQVRJVkUoUFQxTSknIC8vIGxhc3QgMSBtaW51dGVzXG4gICAqICdSRUxBVElWRShQVDFIKScgLy8gbGFzdCAxIGhvdXJzXG4gICAqICdSRUxBVElWRShQMUQpJyAvLyBsYXN0IDEgZGF5c1xuICAgKiAnUkVMQVRJVkUoUDdEKScgLy8gbGFzdCAxIHdlZWtzIChub3RpY2Ugd2UgZ2V0IG1vZCBvZiA3IGRheXMpXG4gICAqICdSRUxBVElWRShQMU0pJyAvLyBsYXN0IDEgbW9udGhcbiAgICogJ1JFTEFUSVZFKFAxWSknIC8vIGxhc3QgMSB5ZWFyXG4gICAqKi9cbiAgZGF0ZVJlbGF0aXZlOiAodmFsOiBzdHJpbmcpOiBWYWx1ZVR5cGVzWydyZWxhdGl2ZSddID0+IHtcbiAgICBsZXQgbGFzdCA9ICcnXG4gICAgY29uc3QgZ3V0cyA9IHZhbC5zcGxpdCgnKCcpWzFdLnNwbGl0KCcpJylbMF0uc3Vic3RyaW5nKDEpIC8vIGdldCB0aGUgdGhpbmcgYmV0d2VlbiB0aGUgcGFyZW5zLCBub3RpY2Ugd2UgZG9uJ3QgY2FyZSBhYm91dCBQIGVpdGhlclxuICAgIGxldCB1bml0ID0gZ3V0cy5jaGFyQXQoZ3V0cy5sZW5ndGggLSAxKSAvLyBub3RpY2UgdGhhdCB3ZSBzdGlsbCBuZWVkIHRvIGtub3cgaWYgaXQncyBtaW51dGVzIG9yIG1vbnRocywgdGhlIHVuaXQgaXMgdGhlIHNhbWUgYmV0d2VlbiB0aGVtIVxuICAgIGlmIChndXRzLmNoYXJBdCgwKSA9PT0gJ1QnKSB7XG4gICAgICBsYXN0ID0gZ3V0cy5zdWJzdHJpbmcoMSwgZ3V0cy5sZW5ndGggLSAxKVxuICAgICAgdW5pdCA9IHVuaXQudG9Mb3dlckNhc2UoKVxuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0ID0gZ3V0cy5zdWJzdHJpbmcoMCwgZ3V0cy5sZW5ndGggLSAxKVxuICAgICAgaWYgKHVuaXQgIT09ICdNJykge1xuICAgICAgICB1bml0ID0gdW5pdC50b0xvd2VyQ2FzZSgpIC8vIG9ubHkgTSBkaWZmZXJzIGdpdmVuIHRoZSBjb25mbGljdCBiZXR3ZWVuIG1pbnV0ZXMgLyBtb250aHNcbiAgICAgIH1cbiAgICAgIGlmICh1bml0ID09PSAnZCcpIHtcbiAgICAgICAgaWYgKE51bWJlcihsYXN0KSAlIDcgPT09IDApIHtcbiAgICAgICAgICAvLyBtYW51YWxseSBjb252ZXJ0IHRvIHdlZWtzIHNpbmNlIGl0J3Mgbm90IFwicmVhbGx5XCIgYSBjcWwgc3VwcG9ydGVkIHVuaXQgZm9yIHJlbGF0aXZlXG4gICAgICAgICAgbGFzdCA9IChOdW1iZXIobGFzdCkgLyA3KS50b1N0cmluZygpXG4gICAgICAgICAgdW5pdCA9ICd3J1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBsYXN0LFxuICAgICAgdW5pdCxcbiAgICB9IGFzIFZhbHVlVHlwZXNbJ3JlbGF0aXZlJ11cbiAgfSxcbn1cblxuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZSA9IHtcbiAgZGF0ZVJlbGF0aXZlOiAoeyBsYXN0LCB1bml0IH06IFZhbHVlVHlwZXNbJ3JlbGF0aXZlJ10pID0+IHtcbiAgICBpZiAodW5pdCA9PT0gdW5kZWZpbmVkIHx8ICFwYXJzZUZsb2F0KGxhc3QpKSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG4gICAgLy9XZWVrcyBpcyBub3QgYSB2YWxpZCB1bml0LCBzbyBjb252ZXJ0IHRoaXMgdG8gZGF5c1xuICAgIGlmICh1bml0ID09PSAndycpIHtcbiAgICAgIGxldCBjb252ZXJ0ZWRVbml0ID0gJ2QnXG4gICAgICBsZXQgY29udmVydGVkTGFzdCA9IChwYXJzZUZsb2F0KGxhc3QpICogNykudG9TdHJpbmcoKVxuICAgICAgcmV0dXJuIGBSRUxBVElWRSgkeydQJyArIGNvbnZlcnRlZExhc3QgKyBjb252ZXJ0ZWRVbml0LnRvVXBwZXJDYXNlKCl9KWBcbiAgICB9XG4gICAgY29uc3QgcHJlZml4ID0gdW5pdCA9PT0gJ3MnIHx8IHVuaXQgPT09ICdtJyB8fCB1bml0ID09PSAnaCcgPyAnUFQnIDogJ1AnXG4gICAgcmV0dXJuIGBSRUxBVElWRSgke3ByZWZpeCArIGxhc3QgKyB1bml0LnRvVXBwZXJDYXNlKCl9KWBcbiAgfSxcbiAgZGF0ZUFyb3VuZDogKHZhbHVlOiBWYWx1ZVR5cGVzWydhcm91bmQnXSkgPT4ge1xuICAgIGlmIChcbiAgICAgIHZhbHVlLmJ1ZmZlciA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICB2YWx1ZS5kYXRlID09PSB1bmRlZmluZWQgfHxcbiAgICAgIHZhbHVlLmRpcmVjdGlvbiA9PT0gdW5kZWZpbmVkXG4gICAgKSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG4gICAgbGV0IGJlZm9yZSA9IFsnYm90aCcsICdiZWZvcmUnXS5pbmNsdWRlcyh2YWx1ZS5kaXJlY3Rpb24pXG4gICAgICA/IG1vbWVudCh2YWx1ZS5kYXRlKVxuICAgICAgICAgIC5zdWJ0cmFjdCh2YWx1ZS5idWZmZXIuYW1vdW50LCB2YWx1ZS5idWZmZXIudW5pdClcbiAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgOiB2YWx1ZS5kYXRlXG4gICAgbGV0IGFmdGVyID0gWydib3RoJywgJ2FmdGVyJ10uaW5jbHVkZXModmFsdWUuZGlyZWN0aW9uKVxuICAgICAgPyBtb21lbnQodmFsdWUuZGF0ZSlcbiAgICAgICAgICAuYWRkKHZhbHVlLmJ1ZmZlci5hbW91bnQsIHZhbHVlLmJ1ZmZlci51bml0KVxuICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICA6IHZhbHVlLmRhdGVcbiAgICByZXR1cm4gYERVUklORyAke2JlZm9yZX0vJHthZnRlcn1gXG4gIH0sXG4gIGRhdGVCZXR3ZWVuOiAodmFsdWU6IFZhbHVlVHlwZXNbJ2JldHdlZW4nXSkgPT4ge1xuICAgIGNvbnN0IGZyb20gPSBtb21lbnQodmFsdWUuc3RhcnQpXG4gICAgY29uc3QgdG8gPSBtb21lbnQodmFsdWUuZW5kKVxuICAgIGlmIChmcm9tLmlzQWZ0ZXIodG8pKSB7XG4gICAgICByZXR1cm4gKHRvLnRvSVNPU3RyaW5nKCkgfHwgJycpICsgJy8nICsgKGZyb20udG9JU09TdHJpbmcoKSB8fCAnJylcbiAgICB9XG4gICAgcmV0dXJuIChmcm9tLnRvSVNPU3RyaW5nKCkgfHwgJycpICsgJy8nICsgKHRvLnRvSVNPU3RyaW5nKCkgfHwgJycpXG4gIH0sXG4gIGxvY2F0aW9uOiAocHJvcGVydHk6IHN0cmluZywgdmFsdWU6IFZhbHVlVHlwZXNbJ2xvY2F0aW9uJ10pID0+IHtcbiAgICBjb25zdCB0cmFuc2Zvcm1hdGlvbiA9IEV4dGVuc2lvblBvaW50cy5zZXJpYWxpemVMb2NhdGlvbihwcm9wZXJ0eSwgdmFsdWUpXG4gICAgaWYgKHRyYW5zZm9ybWF0aW9uICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHJhbnNmb3JtYXRpb25cbiAgICB9XG4gICAgcmV0dXJuIENRTFV0aWxzLmdlbmVyYXRlQW55R2VvRmlsdGVyKHByb3BlcnR5LCB2YWx1ZSlcbiAgfSxcbn1cblxuY2xhc3MgQmFzZUZpbHRlckJ1aWxkZXJDbGFzcyBleHRlbmRzIFNwcmVhZE9wZXJhdG9yUHJvdGVjdGVkQ2xhc3Mge1xuICByZWFkb25seSB0eXBlOiBzdHJpbmdcbiAgcmVhZG9ubHkgZmlsdGVyczogQXJyYXk8YW55PlxuICByZWFkb25seSBuZWdhdGVkOiBib29sZWFuXG4gIHJlYWRvbmx5IGlkOiBzdHJpbmdcbiAgY29uc3RydWN0b3Ioe1xuICAgIHR5cGUgPSAnQU5EJyxcbiAgICBmaWx0ZXJzID0gW25ldyBGaWx0ZXJDbGFzcygpXSxcbiAgICBuZWdhdGVkID0gZmFsc2UsXG4gICAgaWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCksXG4gIH06IHtcbiAgICB0eXBlPzogQmFzZUZpbHRlckJ1aWxkZXJDbGFzc1sndHlwZSddXG4gICAgZmlsdGVycz86IEJhc2VGaWx0ZXJCdWlsZGVyQ2xhc3NbJ2ZpbHRlcnMnXVxuICAgIG5lZ2F0ZWQ/OiBCYXNlRmlsdGVyQnVpbGRlckNsYXNzWyduZWdhdGVkJ11cbiAgICBpZD86IHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIC8qKlxuICAgICAqIElmIGZvciBzb21lIHJlYXNvbiBmaWx0ZXJzIGNvbWUgaW4gdGhhdCBhcmVuJ3QgY2xhc3NlZCwgdGhpcyB3aWxsIGhhbmRsZSBpdC5cbiAgICAgKi9cbiAgICB0aGlzLmZpbHRlcnMgPSBmaWx0ZXJzLm1hcCgoY2hpbGRGaWx0ZXIpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgaXNGaWx0ZXJCdWlsZGVyQ2xhc3MoY2hpbGRGaWx0ZXIpIHx8XG4gICAgICAgIHNob3VsZEJlRmlsdGVyQnVpbGRlckNsYXNzKGNoaWxkRmlsdGVyKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAuLi5jaGlsZEZpbHRlcixcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgIC4uLmNoaWxkRmlsdGVyLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5uZWdhdGVkID0gbmVnYXRlZFxuICAgIHRoaXMuaWQgPSBpZFxuICB9XG59XG5leHBvcnQgY2xhc3MgRmlsdGVyQnVpbGRlckNsYXNzIGV4dGVuZHMgQmFzZUZpbHRlckJ1aWxkZXJDbGFzcyB7XG4gIGRlY2xhcmUgcmVhZG9ubHkgdHlwZTogJ0FORCcgfCAnT1InXG4gIGRlY2xhcmUgcmVhZG9ubHkgZmlsdGVyczogQXJyYXk8RmlsdGVyQnVpbGRlckNsYXNzIHwgRmlsdGVyQ2xhc3M+XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB0eXBlID0gJ0FORCcsXG4gICAgZmlsdGVycyA9IFtuZXcgRmlsdGVyQ2xhc3MoKV0sXG4gICAgbmVnYXRlZCA9IGZhbHNlLFxuICAgIGlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygpLFxuICB9OiB7XG4gICAgdHlwZT86IEZpbHRlckJ1aWxkZXJDbGFzc1sndHlwZSddXG4gICAgZmlsdGVycz86IEZpbHRlckJ1aWxkZXJDbGFzc1snZmlsdGVycyddXG4gICAgbmVnYXRlZD86IEZpbHRlckJ1aWxkZXJDbGFzc1snbmVnYXRlZCddXG4gICAgaWQ/OiBzdHJpbmdcbiAgfSA9IHt9KSB7XG4gICAgc3VwZXIoeyB0eXBlLCBmaWx0ZXJzLCBuZWdhdGVkLCBpZCB9KVxuICB9XG59XG5cbi8qKlxuICogIFdlIHdhbnQgdG8gc3VwcG9ydCBtb3JlIGNvbXBsZXggbmVnYXRpb24gdGhhbiBhbGxvd2VkIGJ5IHRoZSBub3JtYWwgZmlsdGVyIHRyZWUsIHNvIHdlIHN0b3JlIG5lZ2F0ZWQgaW4gYSBwcm9wZXJ0eS5cbiAqICBIb3dldmVyLCBzaW5jZSB0aGUgd3JpdGUgZnVuY3Rpb24gaW4gY3FsLnRzeCBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcywgYXQgc29tZSBwb2ludCB3ZSBuZWVkIHRvIGNvbnZlcnQgaXQgYmFjayB0byB0aGlzIGNsYXNzIHdoZXJlIG5lZ2F0aW9uIGV4aXN0cyBhcyBhIHR5cGUgaW5zdGVhZCBvZiBwcm9wZXJ0eS5cbiAqICBTZWUgdGhlIHVuY29sbGFwc2VOb3RzIGZ1bmN0aW9uIGluIGNxbC50c3ggZm9yIHdoZXJlIHRoaXMgaXMgZG9uZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzIGV4dGVuZHMgQmFzZUZpbHRlckJ1aWxkZXJDbGFzcyB7XG4gIGRlY2xhcmUgcmVhZG9ubHkgdHlwZTogJ0FORCcgfCAnT1InIHwgJ05PVCdcbiAgZGVjbGFyZSByZWFkb25seSBmaWx0ZXJzOiBBcnJheTxcbiAgICBGaWx0ZXJDbGFzcyB8IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzIHwgRmlsdGVyQnVpbGRlckNsYXNzXG4gID5cbiAgY29uc3RydWN0b3Ioe1xuICAgIHR5cGUgPSAnQU5EJyxcbiAgICBmaWx0ZXJzID0gW25ldyBGaWx0ZXJDbGFzcygpXSxcbiAgICBuZWdhdGVkID0gZmFsc2UsXG4gICAgaWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCksXG4gIH06IHtcbiAgICB0eXBlPzogQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3NbJ3R5cGUnXVxuICAgIGZpbHRlcnM/OiBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1snZmlsdGVycyddXG4gICAgbmVnYXRlZD86IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzWyduZWdhdGVkJ11cbiAgICBpZD86IHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICBzdXBlcih7IHR5cGUsIGZpbHRlcnMsIG5lZ2F0ZWQsIGlkIH0pXG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQm9vbGVhblRleHRUeXBlID0ge1xuICB0ZXh0OiBzdHJpbmdcbiAgY3FsOiBzdHJpbmdcbiAgZXJyb3I6IGJvb2xlYW5cbiAgZXJyb3JNZXNzYWdlPzogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIFZhbHVlVHlwZXMgPSB7XG4gIHByb3hpbWl0eToge1xuICAgIGZpcnN0OiBzdHJpbmdcbiAgICBzZWNvbmQ6IHN0cmluZ1xuICAgIGRpc3RhbmNlOiBudW1iZXJcbiAgfVxuICBkYXRlOiBzdHJpbmdcbiAgYm9vbGVhbjogYm9vbGVhblxuICB0ZXh0OiBzdHJpbmdcbiAgZmxvYXQ6IG51bWJlclxuICBpbnRlZ2VyOiBudW1iZXJcbiAgcmVsYXRpdmU6IHtcbiAgICBsYXN0OiBzdHJpbmdcbiAgICAvL05PVEU6IFdlZWtzIGlzIG5vdCBhIHZhbGlkIHVuaXQsIGJ1dCB3ZSBhbGxvdyBpdCBpbiBvdXIgc3lzdGVtLlxuICAgIC8vVGhpcyBpcyBjb252ZXJ0ZWQgdG8gZGF5cyB0byBiZWNvbWUgdmFsaWQgY3FsXG4gICAgdW5pdDogJ20nIHwgJ2gnIHwgJ2QnIHwgJ00nIHwgJ3knIHwgJ3MnIHwgJ3cnXG4gIH1cbiAgYXJvdW5kOiB7XG4gICAgZGF0ZTogc3RyaW5nXG4gICAgYnVmZmVyOiB7XG4gICAgICBhbW91bnQ6IHN0cmluZ1xuICAgICAgdW5pdDogJ20nIHwgJ2gnIHwgJ2QnIHwgJ00nIHwgJ3knIHwgJ3MnIHwgJ3cnXG4gICAgfVxuICAgIGRpcmVjdGlvbjogJ2JvdGgnIHwgJ2JlZm9yZScgfCAnYWZ0ZXInXG4gIH1cbiAgZHVyaW5nOiB7XG4gICAgc3RhcnQ6IHN0cmluZ1xuICAgIGVuZDogc3RyaW5nXG4gIH1cbiAgYmV0d2Vlbjoge1xuICAgIHN0YXJ0OiBudW1iZXJcbiAgICBlbmQ6IG51bWJlclxuICB9XG4gIG11bHRpdmFsdWU6IHN0cmluZ1tdXG4gIGJvb2xlYW5UZXh0OiBCb29sZWFuVGV4dFR5cGVcbiAgbG9jYXRpb246IC8vIHRoaXMgaXMgYWxsIHdlIHRlY2huaWNhbGx5IG5lZWQgdG8gcmVjb25zdHJ1Y3QgKGxvIGZpZGVsaXR5KVxuICBMaW5lTG9jYXRpb24gfCBQb2x5Z29uTG9jYXRpb24gfCBQb2ludFJhZGl1c0xvY2F0aW9uXG59XG5cbmV4cG9ydCB0eXBlIExpbmVMb2NhdGlvbiA9IHtcbiAgdHlwZTogJ0xJTkUnXG4gIG1vZGU6ICdsaW5lJ1xuICBsaW5lV2lkdGg/OiBzdHJpbmdcbiAgbGluZTogQXJyYXk8QXJyYXk8bnVtYmVyPj5cbn1cbmV4cG9ydCB0eXBlIFBvbHlnb25Mb2NhdGlvbiA9IHtcbiAgdHlwZTogJ1BPTFlHT04nXG4gIHBvbHlnb25CdWZmZXJXaWR0aD86IG51bWJlciB8IHN0cmluZ1xuICBwb2x5Z29uQnVmZmVyVW5pdHM/OiAnbWV0ZXJzJ1xuICBwb2x5Z29uOiBBcnJheTxBcnJheTxudW1iZXI+PlxuICBsb2NhdGlvblR5cGU/OiAnZGQnXG4gIHBvbHlUeXBlPzogJ3BvbHlnb24nXG4gIG1vZGU6ICdwb2x5J1xufVxuZXhwb3J0IHR5cGUgUG9pbnRSYWRpdXNMb2NhdGlvbiA9IHtcbiAgdHlwZTogJ1BPSU5UUkFESVVTJ1xuICByYWRpdXM6IG51bWJlciB8IHN0cmluZ1xuICByYWRpdXNVbml0cz86ICdtZXRlcnMnXG4gIG1vZGU6ICdjaXJjbGUnXG4gIGxhdDogbnVtYmVyXG4gIGxvbjogbnVtYmVyXG4gIGxvY2F0aW9uVHlwZT86ICdkZCdcbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVUeXBlID0gc3RyaW5nIHwgYm9vbGVhbiB8IG51bGwgfCBWYWx1ZXNUeXBlPFZhbHVlVHlwZXM+XG5cbmV4cG9ydCB0eXBlIEZpbHRlckNvbnRleHQgPSB7XG4gIFtrZXk6IHN0cmluZ106IGFueVxufVxuXG5leHBvcnQgY2xhc3MgRmlsdGVyQ2xhc3MgZXh0ZW5kcyBTcHJlYWRPcGVyYXRvclByb3RlY3RlZENsYXNzIHtcbiAgdHlwZTpcbiAgICB8ICdCRUZPUkUnXG4gICAgfCAnQUZURVInXG4gICAgfCAnUkVMQVRJVkUnXG4gICAgfCAnPSdcbiAgICB8ICdEVVJJTkcnXG4gICAgfCAnR0VPTUVUUlknXG4gICAgfCAnRFdJVEhJTidcbiAgICB8ICdJTElLRSdcbiAgICB8ICdMSUtFJ1xuICAgIHwgJ0lTIE5VTEwnXG4gICAgfCAnPidcbiAgICB8ICc8J1xuICAgIHwgJz0nXG4gICAgfCAnPD0nXG4gICAgfCAnPj0nXG4gICAgfCAnRFVSSU5HJ1xuICAgIHwgJ0JFVFdFRU4nXG4gICAgfCAnRklMVEVSIEZVTkNUSU9OIHByb3hpbWl0eSdcbiAgICB8ICdBUk9VTkQnIC8vIFRoaXMgaXNuJ3QgdmFsaWQgY3FsLCBidXQgc29tZXRoaW5nIHdlIHN1cHBvcnRcbiAgICB8ICdCT09MRUFOX1RFWFRfU0VBUkNIJyAvLyBUaGlzIGlzbid0IHZhbGlkIGNxbCwgYnV0IHNvbWV0aGluZyB3ZSBzdXBwb3J0XG4gIHJlYWRvbmx5IHByb3BlcnR5OiBzdHJpbmdcbiAgcmVhZG9ubHkgdmFsdWU6IFZhbHVlVHlwZVxuICByZWFkb25seSBuZWdhdGVkOiBib29sZWFuIHwgdW5kZWZpbmVkXG4gIHJlYWRvbmx5IGlkOiBzdHJpbmdcbiAgcmVhZG9ubHkgY29udGV4dD86IEZpbHRlckNvbnRleHRcbiAgY29uc3RydWN0b3Ioe1xuICAgIHR5cGUgPSAnSUxJS0UnLFxuICAgIHByb3BlcnR5ID0gJ2FueVRleHQnLFxuICAgIHZhbHVlID0gJycsXG4gICAgbmVnYXRlZCA9IGZhbHNlLFxuICAgIGlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygpLFxuICAgIGNvbnRleHQsXG4gIH06IHtcbiAgICB0eXBlPzogRmlsdGVyQ2xhc3NbJ3R5cGUnXVxuICAgIHByb3BlcnR5PzogRmlsdGVyQ2xhc3NbJ3Byb3BlcnR5J11cbiAgICB2YWx1ZT86IEZpbHRlckNsYXNzWyd2YWx1ZSddXG4gICAgbmVnYXRlZD86IEZpbHRlckNsYXNzWyduZWdhdGVkJ11cbiAgICBpZD86IHN0cmluZ1xuICAgIGNvbnRleHQ/OiBGaWx0ZXJDb250ZXh0XG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gICAgdGhpcy5uZWdhdGVkID0gbmVnYXRlZFxuICAgIHRoaXMuaWQgPSBpZFxuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRcbiAgfVxufVxuXG4vKipcbiAqIGRldGVybWluZSBpdCBpcyBhY3R1YWxseSBhbiBwbGFpbiBvYmplY3QgZm9ybSBvZiB0aGUgZmlsdGVyIGJ1aWxkZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNvbnN0IHNob3VsZEJlRmlsdGVyQnVpbGRlckNsYXNzID0gKFxuICBmaWx0ZXI6IGFueVxuKTogZmlsdGVyIGlzIEZpbHRlckJ1aWxkZXJDbGFzcyA9PiB7XG4gIHJldHVybiAhaXNGaWx0ZXJCdWlsZGVyQ2xhc3MoZmlsdGVyKSAmJiBmaWx0ZXIuZmlsdGVycyAhPT0gdW5kZWZpbmVkXG59XG5cbi8qKlxuICpkZXRlcm1pbmUgaXQgaXMgYWN0dWFsbHkgYW4gaW5zdGFudGlhdGlvbiBvZiB0aGUgZmlsdGVyIGJ1aWxkZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNvbnN0IGlzRmlsdGVyQnVpbGRlckNsYXNzID0gKFxuICBmaWx0ZXI6XG4gICAgfCBGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgICB8IEZpbHRlckNsYXNzXG4gICAgfCBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIHwgUGFydGlhbDxGaWx0ZXJCdWlsZGVyQ2xhc3M+XG4gICAgfCBQYXJ0aWFsPEZpbHRlckNsYXNzPlxuICAgIHwgUGFydGlhbDxDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcz5cbik6IGZpbHRlciBpcyBGaWx0ZXJCdWlsZGVyQ2xhc3MgPT4ge1xuICByZXR1cm4gZmlsdGVyLmNvbnN0cnVjdG9yID09PSBGaWx0ZXJCdWlsZGVyQ2xhc3Ncbn1cblxuLyoqXG4gKmRldGVybWluZSBpdCBpcyBhY3R1YWxseSBhbiBpbnN0YW50aWF0aW9uIG9mIHRoZSBjcWwgc3RhbmRhcmQgZmlsdGVyIGJ1aWxkZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3MgPSAoXG4gIGZpbHRlcjpcbiAgICB8IEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIHwgRmlsdGVyQ2xhc3NcbiAgICB8IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzXG4gICAgfCBQYXJ0aWFsPEZpbHRlckJ1aWxkZXJDbGFzcz5cbiAgICB8IFBhcnRpYWw8RmlsdGVyQ2xhc3M+XG4gICAgfCBQYXJ0aWFsPENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzPlxuKTogZmlsdGVyIGlzIENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzID0+IHtcbiAgcmV0dXJuIGZpbHRlci5jb25zdHJ1Y3RvciA9PT0gQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3Ncbn1cblxuZXhwb3J0IGludGVyZmFjZSBCYXNpY0ZpbHRlckNsYXNzIGV4dGVuZHMgT21pdDxGaWx0ZXJDbGFzcywgJ3Byb3BlcnR5Jz4ge1xuICBwcm9wZXJ0eTogc3RyaW5nW11cbn1cblxuaW50ZXJmYWNlIEJhc2ljRGF0YXR5cGVDbGFzcyBleHRlbmRzIE9taXQ8RmlsdGVyQ2xhc3MsICdwcm9wZXJ0eScgfCAndmFsdWUnPiB7XG4gIHByb3BlcnR5OiB0eXBlb2YgQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZVxuICB2YWx1ZTogc3RyaW5nW11cbn1cblxuZXhwb3J0IGNsYXNzIEJhc2ljRGF0YXR5cGVGaWx0ZXJcbiAgZXh0ZW5kcyBGaWx0ZXJDbGFzc1xuICBpbXBsZW1lbnRzIEJhc2ljRGF0YXR5cGVDbGFzc1xue1xuICBwcm9wZXJ0eTogdHlwZW9mIEJhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVcbiAgdmFsdWU6IHN0cmluZ1tdXG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIHZhbHVlID0gW10sXG4gICAgY29udGV4dCxcbiAgfToge1xuICAgIHZhbHVlPzogc3RyaW5nW11cbiAgICBjb250ZXh0PzogRmlsdGVyQ29udGV4dFxuICB9ID0ge30pIHtcbiAgICBzdXBlcih7XG4gICAgICBwcm9wZXJ0eTogQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZSxcbiAgICAgIHZhbHVlLFxuICAgICAgY29udGV4dCxcbiAgICB9KVxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBpc0Jhc2ljRGF0YXR5cGVDbGFzcyA9IChcbiAgZmlsdGVyOlxuICAgIHwgRmlsdGVyQnVpbGRlckNsYXNzXG4gICAgfCBGaWx0ZXJDbGFzc1xuICAgIHwgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgICB8IFBhcnRpYWw8RmlsdGVyQnVpbGRlckNsYXNzPlxuICAgIHwgUGFydGlhbDxGaWx0ZXJDbGFzcz5cbiAgICB8IFBhcnRpYWw8Q1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3M+XG4pOiBmaWx0ZXIgaXMgQmFzaWNEYXRhdHlwZUNsYXNzID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gKGZpbHRlciBhcyBhbnkpPy5wcm9wZXJ0eSA9PT0gQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VTaXplRmlsdGVyQ2xhc3MgZXh0ZW5kcyBGaWx0ZXJDbGFzcyB7XG4gIGRlY2xhcmUgdmFsdWU6IG51bWJlclxuICBkZWNsYXJlIGNvbnRleHQ6IEZpbHRlckNvbnRleHQgJiB7IHVuaXRzOiBzdHJpbmcgfVxuICBjb25zdHJ1Y3Rvcih7XG4gICAgdmFsdWUgPSAwLFxuICAgIGNvbnRleHQgPSB7IHVuaXRzOiAnQicgfSxcbiAgICAuLi5vdGhlclByb3BzXG4gIH06IE9taXQ8RmlsdGVyQ2xhc3MsICdfRE9fTk9UX1VTRV9TUFJFQURfT1BFUkFUT1InIHwgJ3ZhbHVlJyB8ICdjb250ZXh0Jz4gJiB7XG4gICAgdmFsdWU6IG51bWJlclxuICAgIGNvbnRleHQ6IEZpbHRlckNvbnRleHQgJiB7IHVuaXRzOiBzdHJpbmcgfVxuICB9KSB7XG4gICAgc3VwZXIoe1xuICAgICAgLi4ub3RoZXJQcm9wcyxcbiAgICAgIHZhbHVlLFxuICAgICAgY29udGV4dDoge1xuICAgICAgICAuLi5jb250ZXh0LFxuICAgICAgICB1bml0czogY29udGV4dC51bml0cyxcbiAgICAgIH0sXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzcyBleHRlbmRzIEZpbHRlckNsYXNzIHtcbiAgZGVjbGFyZSB2YWx1ZTogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9XG4gIGRlY2xhcmUgY29udGV4dDogRmlsdGVyQ29udGV4dCAmIHsgc3RhcnRVbml0czogc3RyaW5nOyBlbmRVbml0czogc3RyaW5nIH1cbiAgY29uc3RydWN0b3Ioe1xuICAgIHZhbHVlID0geyBzdGFydDogMCwgZW5kOiAxIH0sXG4gICAgY29udGV4dCA9IHsgc3RhcnRVbml0czogJ0InLCBlbmRVbml0czogJ0InIH0sXG4gICAgLi4ub3RoZXJQcm9wc1xuICB9OiBPbWl0PEZpbHRlckNsYXNzLCAnX0RPX05PVF9VU0VfU1BSRUFEX09QRVJBVE9SJyB8ICd2YWx1ZScgfCAnY29udGV4dCc+ICYge1xuICAgIHZhbHVlOiB7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyIH1cbiAgICBjb250ZXh0OiBGaWx0ZXJDb250ZXh0ICYgeyBzdGFydFVuaXRzOiBzdHJpbmc7IGVuZFVuaXRzOiBzdHJpbmcgfVxuICB9KSB7XG4gICAgc3VwZXIoe1xuICAgICAgLi4ub3RoZXJQcm9wcyxcbiAgICAgIHZhbHVlLFxuICAgICAgY29udGV4dDoge1xuICAgICAgICAuLi5jb250ZXh0LFxuICAgICAgICBzdGFydFVuaXRzOiBjb250ZXh0LnN0YXJ0VW5pdHMsXG4gICAgICAgIGVuZFVuaXRzOiBjb250ZXh0LmVuZFVuaXRzLFxuICAgICAgfSxcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBpc1Jlc291cmNlU2l6ZUZpbHRlckNsYXNzID0gKFxuICBmaWx0ZXI6XG4gICAgfCBGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgICB8IEZpbHRlckNsYXNzXG4gICAgfCBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIHwgUGFydGlhbDxGaWx0ZXJCdWlsZGVyQ2xhc3M+XG4gICAgfCBQYXJ0aWFsPEZpbHRlckNsYXNzPlxuICAgIHwgUGFydGlhbDxDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcz5cbik6IGZpbHRlciBpcyBSZXNvdXJjZVNpemVGaWx0ZXJDbGFzcyA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIChcbiAgICAgIChmaWx0ZXIgYXMgYW55KT8udmFsdWUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgdHlwZW9mIChmaWx0ZXIgYXMgYW55KT8udmFsdWUgPT09ICdudW1iZXInICYmXG4gICAgICAhaXNOYU4oKGZpbHRlciBhcyBhbnkpPy52YWx1ZSkgJiZcbiAgICAgIChmaWx0ZXIgYXMgYW55KT8uY29udGV4dD8udW5pdHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgc2l6ZVVuaXRzLmluY2x1ZGVzKChmaWx0ZXIgYXMgYW55KT8uY29udGV4dD8udW5pdHMpXG4gICAgKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgaXNSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzID0gKFxuICBmaWx0ZXI6XG4gICAgfCBGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgICB8IEZpbHRlckNsYXNzXG4gICAgfCBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIHwgUGFydGlhbDxGaWx0ZXJCdWlsZGVyQ2xhc3M+XG4gICAgfCBQYXJ0aWFsPEZpbHRlckNsYXNzPlxuICAgIHwgUGFydGlhbDxDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcz5cbik6IGZpbHRlciBpcyBSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gKFxuICAgICAgKGZpbHRlciBhcyBhbnkpPy52YWx1ZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0eXBlb2YgKGZpbHRlciBhcyBhbnkpPy52YWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiAoZmlsdGVyIGFzIGFueSk/LnZhbHVlLnN0YXJ0ID09PSAnbnVtYmVyJyAmJlxuICAgICAgdHlwZW9mIChmaWx0ZXIgYXMgYW55KT8udmFsdWUuZW5kID09PSAnbnVtYmVyJyAmJlxuICAgICAgKGZpbHRlciBhcyBhbnkpPy5jb250ZXh0Py5zdGFydFVuaXRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIChmaWx0ZXIgYXMgYW55KT8uY29udGV4dD8uZW5kVW5pdHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgc2l6ZVVuaXRzLmluY2x1ZGVzKChmaWx0ZXIgYXMgYW55KT8uY29udGV4dD8uc3RhcnRVbml0cykgJiZcbiAgICAgIHNpemVVbml0cy5pbmNsdWRlcygoZmlsdGVyIGFzIGFueSk/LmNvbnRleHQ/LmVuZFVuaXRzKVxuICAgIClcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNpemVVbml0cyA9IFtcbiAgJ0InLCAvLyBCeXRlc1xuICAnS0InLCAvLyBLaWxvYnl0ZXNcbiAgJ01CJywgLy8gTWVnYWJ5dGVzXG4gICdHQicsIC8vIEdpZ2FieXRlc1xuICAnVEInLCAvLyBUZXJhYnl0ZXNcbiAgJ1BCJywgLy8gUGV0YWJ5dGVzXG5dXG5cbmNvbnN0IGNvbnZlcnRUb0J5dGVzRnJvbVVuaXQgPSAodmFsdWU6IG51bWJlciwgdW5pdDogc3RyaW5nKTogbnVtYmVyID0+IHtcbiAgY29uc3QgdW5pdEluZGV4ID0gc2l6ZVVuaXRzLmluZGV4T2YodW5pdClcbiAgaWYgKHVuaXRJbmRleCA9PT0gLTEpIHtcbiAgICByZXR1cm4gdmFsdWUgLy8gSWYgdW5pdCBpcyBub3QgcmVjb2duaXplZCwgcmV0dXJuIHRoZSBvcmlnaW5hbCB2YWx1ZVxuICB9XG4gIHJldHVybiB2YWx1ZSAqIE1hdGgucG93KDEwMDAsIHVuaXRJbmRleClcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiByb3VuZHMgZG93biB0byB0aGUgbmVhcmVzdCB3aG9sZSBudW1iZXIgaW4gYnl0ZXNcbmV4cG9ydCBjb25zdCBjb252ZXJ0UmVzb3VyY2VTaXplRmlsdGVyQ2xhc3NWYWx1ZVRvQnl0ZXMgPSAoXG4gIGZpbHRlcjogUmVzb3VyY2VTaXplRmlsdGVyQ2xhc3Ncbik6IG51bWJlciA9PiB7XG4gIGNvbnN0IHsgdmFsdWUsIGNvbnRleHQgfSA9IGZpbHRlclxuICBjb25zdCB1bml0ID0gY29udGV4dD8udW5pdHMgfHwgJ0InXG4gIHJldHVybiBNYXRoLmZsb29yKGNvbnZlcnRUb0J5dGVzRnJvbVVuaXQodmFsdWUsIHVuaXQpKVxufVxuXG5leHBvcnQgY29uc3QgY29udmVydFJlc291cmNlU2l6ZVJhbmdlRmlsdGVyQ2xhc3NWYWx1ZVRvQnl0ZXMgPSAoXG4gIGZpbHRlcjogUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzc1xuKTogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9ID0+IHtcbiAgY29uc3QgeyB2YWx1ZSwgY29udGV4dCB9ID0gZmlsdGVyXG4gIGNvbnN0IHN0YXJ0VW5pdCA9IGNvbnRleHQ/LnN0YXJ0VW5pdHMgfHwgJ0InXG4gIGNvbnN0IGVuZFVuaXQgPSBjb250ZXh0Py5lbmRVbml0cyB8fCAnQidcbiAgcmV0dXJuIHtcbiAgICBzdGFydDogTWF0aC5mbG9vcihjb252ZXJ0VG9CeXRlc0Zyb21Vbml0KHZhbHVlLnN0YXJ0LCBzdGFydFVuaXQpKSxcbiAgICBlbmQ6IE1hdGguZmxvb3IoY29udmVydFRvQnl0ZXNGcm9tVW5pdCh2YWx1ZS5lbmQsIGVuZFVuaXQpKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydEJ5dGVzVG9IdW1hblJlYWRhYmxlKGJ5dGVzOiBudW1iZXIpOiBzdHJpbmcge1xuICBjb25zdCB1bml0cyA9IFsnQicsICdLQicsICdNQicsICdHQicsICdUQicsICdQQiddXG4gIGxldCB1bml0SW5kZXggPSAwXG4gIHdoaWxlIChieXRlcyA+PSAxMDAwICYmIHVuaXRJbmRleCA8IHVuaXRzLmxlbmd0aCAtIDEpIHtcbiAgICBieXRlcyAvPSAxMDAwXG4gICAgdW5pdEluZGV4KytcbiAgfVxuICByZXR1cm4gYCR7Ynl0ZXMudG9GaXhlZCgyKX0gJHt1bml0c1t1bml0SW5kZXhdfWBcbn1cbiJdfQ==