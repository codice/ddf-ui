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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLnN0cnVjdHVyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUVwQyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQTtBQUd4QyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUN2RSxPQUFPLGVBQWUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNwRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUVqRSxNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUc7SUFDekI7Ozs7Ozs7OztRQVNJO0lBQ0osWUFBWSxFQUFFLFVBQUMsR0FBVztRQUN4QixJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7UUFDYixJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyx3RUFBd0U7UUFDbEksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBLENBQUMsa0dBQWtHO1FBQzFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDMUIsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDekMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUs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QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLDBCQUEwQixHQUFHLFVBQ3hDLE1BQVc7SUFFWCxPQUFPLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUE7QUFDdEUsQ0FBQyxDQUFBO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsSUFBTSxvQkFBb0IsR0FBRyxVQUNsQyxNQU0wQztJQUUxQyxPQUFPLE1BQU0sQ0FBQyxXQUFXLEtBQUssa0JBQWtCLENBQUE7QUFDbEQsQ0FBQyxDQUFBO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsSUFBTSwrQkFBK0IsR0FBRyxVQUM3QyxNQU0wQztJQUUxQyxPQUFPLE1BQU0sQ0FBQyxXQUFXLEtBQUssNkJBQTZCLENBQUE7QUFDN0QsQ0FBQyxDQUFBO0FBV0Q7SUFDVSx1Q0FBVztJQU1uQiw2QkFBWSxFQUlOO1lBSk0scUJBSVIsRUFBRSxLQUFBLEVBSEosYUFBVSxFQUFWLEtBQUssbUJBQUcsRUFBRSxLQUFBO1FBRFosWUFLRSxrQkFBTTtZQUNKLFFBQVEsRUFBRSx5QkFBeUI7WUFDbkMsS0FBSyxPQUFBO1NBQ04sQ0FBQyxTQUVIO1FBREMsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7O0lBQ3BCLENBQUM7SUFDSCwwQkFBQztBQUFELENBQUMsQUFsQkQsQ0FDVSxXQUFXLEdBaUJwQjs7QUFFRCxNQUFNLENBQUMsSUFBTSxvQkFBb0IsR0FBRyxVQUNsQyxNQU0wQztJQUUxQyxJQUFJO1FBQ0YsT0FBTyxDQUFDLE1BQWMsYUFBZCxNQUFNLHVCQUFOLE1BQU0sQ0FBVSxRQUFRLE1BQUsseUJBQXlCLENBQUE7S0FDL0Q7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLE9BQU8sS0FBSyxDQUFBO0tBQ2I7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50LXRpbWV6b25lJ1xuaW1wb3J0IHsgVmFsdWVzVHlwZSB9IGZyb20gJ3V0aWxpdHktdHlwZXMnXG5pbXBvcnQgQ1FMVXRpbHMgZnJvbSAnLi4vLi4vanMvQ1FMVXRpbHMnXG5pbXBvcnQgeyBPbWl0IH0gZnJvbSAnLi4vLi4vdHlwZXNjcmlwdCdcblxuaW1wb3J0IHsgU3ByZWFkT3BlcmF0b3JQcm90ZWN0ZWRDbGFzcyB9IGZyb20gJy4uLy4uL3R5cGVzY3JpcHQvY2xhc3NlcydcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCB7IEJhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWUgfSBmcm9tICcuL3Jlc2VydmVkLnByb3BlcnRpZXMnXG5cbmV4cG9ydCBjb25zdCBkZXNlcmlhbGl6ZSA9IHtcbiAgLyoqXG4gICAqIGV4YW1wbGUgaW5wdXRzOiAgLy8gJyBhcmUgcGFydCBvZiBpbnB1dFxuICAgKiAnUkVMQVRJVkUoUFQxUyknIC8vIGxhc3QgMSBzZWNvbmRzXG4gICAqICdSRUxBVElWRShQVDFNKScgLy8gbGFzdCAxIG1pbnV0ZXNcbiAgICogJ1JFTEFUSVZFKFBUMUgpJyAvLyBsYXN0IDEgaG91cnNcbiAgICogJ1JFTEFUSVZFKFAxRCknIC8vIGxhc3QgMSBkYXlzXG4gICAqICdSRUxBVElWRShQN0QpJyAvLyBsYXN0IDEgd2Vla3MgKG5vdGljZSB3ZSBnZXQgbW9kIG9mIDcgZGF5cylcbiAgICogJ1JFTEFUSVZFKFAxTSknIC8vIGxhc3QgMSBtb250aFxuICAgKiAnUkVMQVRJVkUoUDFZKScgLy8gbGFzdCAxIHllYXJcbiAgICoqL1xuICBkYXRlUmVsYXRpdmU6ICh2YWw6IHN0cmluZyk6IFZhbHVlVHlwZXNbJ3JlbGF0aXZlJ10gPT4ge1xuICAgIGxldCBsYXN0ID0gJydcbiAgICBjb25zdCBndXRzID0gdmFsLnNwbGl0KCcoJylbMV0uc3BsaXQoJyknKVswXS5zdWJzdHJpbmcoMSkgLy8gZ2V0IHRoZSB0aGluZyBiZXR3ZWVuIHRoZSBwYXJlbnMsIG5vdGljZSB3ZSBkb24ndCBjYXJlIGFib3V0IFAgZWl0aGVyXG4gICAgbGV0IHVuaXQgPSBndXRzLmNoYXJBdChndXRzLmxlbmd0aCAtIDEpIC8vIG5vdGljZSB0aGF0IHdlIHN0aWxsIG5lZWQgdG8ga25vdyBpZiBpdCdzIG1pbnV0ZXMgb3IgbW9udGhzLCB0aGUgdW5pdCBpcyB0aGUgc2FtZSBiZXR3ZWVuIHRoZW0hXG4gICAgaWYgKGd1dHMuY2hhckF0KDApID09PSAnVCcpIHtcbiAgICAgIGxhc3QgPSBndXRzLnN1YnN0cmluZygxLCBndXRzLmxlbmd0aCAtIDEpXG4gICAgICB1bml0ID0gdW5pdC50b0xvd2VyQ2FzZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3QgPSBndXRzLnN1YnN0cmluZygwLCBndXRzLmxlbmd0aCAtIDEpXG4gICAgICBpZiAodW5pdCAhPT0gJ00nKSB7XG4gICAgICAgIHVuaXQgPSB1bml0LnRvTG93ZXJDYXNlKCkgLy8gb25seSBNIGRpZmZlcnMgZ2l2ZW4gdGhlIGNvbmZsaWN0IGJldHdlZW4gbWludXRlcyAvIG1vbnRoc1xuICAgICAgfVxuICAgICAgaWYgKHVuaXQgPT09ICdkJykge1xuICAgICAgICBpZiAoTnVtYmVyKGxhc3QpICUgNyA9PT0gMCkge1xuICAgICAgICAgIC8vIG1hbnVhbGx5IGNvbnZlcnQgdG8gd2Vla3Mgc2luY2UgaXQncyBub3QgXCJyZWFsbHlcIiBhIGNxbCBzdXBwb3J0ZWQgdW5pdCBmb3IgcmVsYXRpdmVcbiAgICAgICAgICBsYXN0ID0gKE51bWJlcihsYXN0KSAvIDcpLnRvU3RyaW5nKClcbiAgICAgICAgICB1bml0ID0gJ3cnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhc3QsXG4gICAgICB1bml0LFxuICAgIH0gYXMgVmFsdWVUeXBlc1sncmVsYXRpdmUnXVxuICB9LFxufVxuXG5leHBvcnQgY29uc3Qgc2VyaWFsaXplID0ge1xuICBkYXRlUmVsYXRpdmU6ICh7IGxhc3QsIHVuaXQgfTogVmFsdWVUeXBlc1sncmVsYXRpdmUnXSkgPT4ge1xuICAgIGlmICh1bml0ID09PSB1bmRlZmluZWQgfHwgIXBhcnNlRmxvYXQobGFzdCkpIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgICAvL1dlZWtzIGlzIG5vdCBhIHZhbGlkIHVuaXQsIHNvIGNvbnZlcnQgdGhpcyB0byBkYXlzXG4gICAgaWYgKHVuaXQgPT09ICd3Jykge1xuICAgICAgbGV0IGNvbnZlcnRlZFVuaXQgPSAnZCdcbiAgICAgIGxldCBjb252ZXJ0ZWRMYXN0ID0gKHBhcnNlSW50KGxhc3QpICogNykudG9TdHJpbmcoKVxuICAgICAgcmV0dXJuIGBSRUxBVElWRSgkeydQJyArIGNvbnZlcnRlZExhc3QgKyBjb252ZXJ0ZWRVbml0LnRvVXBwZXJDYXNlKCl9KWBcbiAgICB9XG4gICAgY29uc3QgcHJlZml4ID0gdW5pdCA9PT0gJ3MnIHx8IHVuaXQgPT09ICdtJyB8fCB1bml0ID09PSAnaCcgPyAnUFQnIDogJ1AnXG4gICAgcmV0dXJuIGBSRUxBVElWRSgke3ByZWZpeCArIGxhc3QgKyB1bml0LnRvVXBwZXJDYXNlKCl9KWBcbiAgfSxcbiAgZGF0ZUFyb3VuZDogKHZhbHVlOiBWYWx1ZVR5cGVzWydhcm91bmQnXSkgPT4ge1xuICAgIGlmIChcbiAgICAgIHZhbHVlLmJ1ZmZlciA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICB2YWx1ZS5kYXRlID09PSB1bmRlZmluZWQgfHxcbiAgICAgIHZhbHVlLmRpcmVjdGlvbiA9PT0gdW5kZWZpbmVkXG4gICAgKSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG4gICAgbGV0IGJlZm9yZSA9IFsnYm90aCcsICdiZWZvcmUnXS5pbmNsdWRlcyh2YWx1ZS5kaXJlY3Rpb24pXG4gICAgICA/IG1vbWVudCh2YWx1ZS5kYXRlKVxuICAgICAgICAgIC5zdWJ0cmFjdCh2YWx1ZS5idWZmZXIuYW1vdW50LCB2YWx1ZS5idWZmZXIudW5pdClcbiAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgOiB2YWx1ZS5kYXRlXG4gICAgbGV0IGFmdGVyID0gWydib3RoJywgJ2FmdGVyJ10uaW5jbHVkZXModmFsdWUuZGlyZWN0aW9uKVxuICAgICAgPyBtb21lbnQodmFsdWUuZGF0ZSlcbiAgICAgICAgICAuYWRkKHZhbHVlLmJ1ZmZlci5hbW91bnQsIHZhbHVlLmJ1ZmZlci51bml0KVxuICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICA6IHZhbHVlLmRhdGVcbiAgICByZXR1cm4gYERVUklORyAke2JlZm9yZX0vJHthZnRlcn1gXG4gIH0sXG4gIGRhdGVCZXR3ZWVuOiAodmFsdWU6IFZhbHVlVHlwZXNbJ2JldHdlZW4nXSkgPT4ge1xuICAgIGNvbnN0IGZyb20gPSBtb21lbnQodmFsdWUuc3RhcnQpXG4gICAgY29uc3QgdG8gPSBtb21lbnQodmFsdWUuZW5kKVxuICAgIGlmIChmcm9tLmlzQWZ0ZXIodG8pKSB7XG4gICAgICByZXR1cm4gKHRvLnRvSVNPU3RyaW5nKCkgfHwgJycpICsgJy8nICsgKGZyb20udG9JU09TdHJpbmcoKSB8fCAnJylcbiAgICB9XG4gICAgcmV0dXJuIChmcm9tLnRvSVNPU3RyaW5nKCkgfHwgJycpICsgJy8nICsgKHRvLnRvSVNPU3RyaW5nKCkgfHwgJycpXG4gIH0sXG4gIGxvY2F0aW9uOiAocHJvcGVydHk6IHN0cmluZywgdmFsdWU6IFZhbHVlVHlwZXNbJ2xvY2F0aW9uJ10pID0+IHtcbiAgICBjb25zdCB0cmFuc2Zvcm1hdGlvbiA9IEV4dGVuc2lvblBvaW50cy5zZXJpYWxpemVMb2NhdGlvbihwcm9wZXJ0eSwgdmFsdWUpXG4gICAgaWYgKHRyYW5zZm9ybWF0aW9uICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHJhbnNmb3JtYXRpb25cbiAgICB9XG4gICAgcmV0dXJuIENRTFV0aWxzLmdlbmVyYXRlQW55R2VvRmlsdGVyKHByb3BlcnR5LCB2YWx1ZSlcbiAgfSxcbn1cblxuY2xhc3MgQmFzZUZpbHRlckJ1aWxkZXJDbGFzcyBleHRlbmRzIFNwcmVhZE9wZXJhdG9yUHJvdGVjdGVkQ2xhc3Mge1xuICByZWFkb25seSB0eXBlOiBzdHJpbmdcbiAgcmVhZG9ubHkgZmlsdGVyczogQXJyYXk8YW55PlxuICByZWFkb25seSBuZWdhdGVkOiBib29sZWFuXG4gIHJlYWRvbmx5IGlkOiBzdHJpbmdcbiAgY29uc3RydWN0b3Ioe1xuICAgIHR5cGUgPSAnQU5EJyxcbiAgICBmaWx0ZXJzID0gW25ldyBGaWx0ZXJDbGFzcygpXSxcbiAgICBuZWdhdGVkID0gZmFsc2UsXG4gICAgaWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCksXG4gIH06IHtcbiAgICB0eXBlPzogQmFzZUZpbHRlckJ1aWxkZXJDbGFzc1sndHlwZSddXG4gICAgZmlsdGVycz86IEJhc2VGaWx0ZXJCdWlsZGVyQ2xhc3NbJ2ZpbHRlcnMnXVxuICAgIG5lZ2F0ZWQ/OiBCYXNlRmlsdGVyQnVpbGRlckNsYXNzWyduZWdhdGVkJ11cbiAgICBpZD86IHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIC8qKlxuICAgICAqIElmIGZvciBzb21lIHJlYXNvbiBmaWx0ZXJzIGNvbWUgaW4gdGhhdCBhcmVuJ3QgY2xhc3NlZCwgdGhpcyB3aWxsIGhhbmRsZSBpdC5cbiAgICAgKi9cbiAgICB0aGlzLmZpbHRlcnMgPSBmaWx0ZXJzLm1hcCgoY2hpbGRGaWx0ZXIpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgaXNGaWx0ZXJCdWlsZGVyQ2xhc3MoY2hpbGRGaWx0ZXIpIHx8XG4gICAgICAgIHNob3VsZEJlRmlsdGVyQnVpbGRlckNsYXNzKGNoaWxkRmlsdGVyKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAuLi5jaGlsZEZpbHRlcixcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgIC4uLmNoaWxkRmlsdGVyLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5uZWdhdGVkID0gbmVnYXRlZFxuICAgIHRoaXMuaWQgPSBpZFxuICB9XG59XG5leHBvcnQgY2xhc3MgRmlsdGVyQnVpbGRlckNsYXNzIGV4dGVuZHMgQmFzZUZpbHRlckJ1aWxkZXJDbGFzcyB7XG4gIGRlY2xhcmUgcmVhZG9ubHkgdHlwZTogJ0FORCcgfCAnT1InXG4gIGRlY2xhcmUgcmVhZG9ubHkgZmlsdGVyczogQXJyYXk8RmlsdGVyQnVpbGRlckNsYXNzIHwgRmlsdGVyQ2xhc3M+XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB0eXBlID0gJ0FORCcsXG4gICAgZmlsdGVycyA9IFtuZXcgRmlsdGVyQ2xhc3MoKV0sXG4gICAgbmVnYXRlZCA9IGZhbHNlLFxuICAgIGlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygpLFxuICB9OiB7XG4gICAgdHlwZT86IEZpbHRlckJ1aWxkZXJDbGFzc1sndHlwZSddXG4gICAgZmlsdGVycz86IEZpbHRlckJ1aWxkZXJDbGFzc1snZmlsdGVycyddXG4gICAgbmVnYXRlZD86IEZpbHRlckJ1aWxkZXJDbGFzc1snbmVnYXRlZCddXG4gICAgaWQ/OiBzdHJpbmdcbiAgfSA9IHt9KSB7XG4gICAgc3VwZXIoeyB0eXBlLCBmaWx0ZXJzLCBuZWdhdGVkLCBpZCB9KVxuICB9XG59XG5cbi8qKlxuICogIFdlIHdhbnQgdG8gc3VwcG9ydCBtb3JlIGNvbXBsZXggbmVnYXRpb24gdGhhbiBhbGxvd2VkIGJ5IHRoZSBub3JtYWwgZmlsdGVyIHRyZWUsIHNvIHdlIHN0b3JlIG5lZ2F0ZWQgaW4gYSBwcm9wZXJ0eS5cbiAqICBIb3dldmVyLCBzaW5jZSB0aGUgd3JpdGUgZnVuY3Rpb24gaW4gY3FsLnRzeCBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcywgYXQgc29tZSBwb2ludCB3ZSBuZWVkIHRvIGNvbnZlcnQgaXQgYmFjayB0byB0aGlzIGNsYXNzIHdoZXJlIG5lZ2F0aW9uIGV4aXN0cyBhcyBhIHR5cGUgaW5zdGVhZCBvZiBwcm9wZXJ0eS5cbiAqICBTZWUgdGhlIHVuY29sbGFwc2VOb3RzIGZ1bmN0aW9uIGluIGNxbC50c3ggZm9yIHdoZXJlIHRoaXMgaXMgZG9uZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzIGV4dGVuZHMgQmFzZUZpbHRlckJ1aWxkZXJDbGFzcyB7XG4gIGRlY2xhcmUgcmVhZG9ubHkgdHlwZTogJ0FORCcgfCAnT1InIHwgJ05PVCdcbiAgZGVjbGFyZSByZWFkb25seSBmaWx0ZXJzOiBBcnJheTxcbiAgICBGaWx0ZXJDbGFzcyB8IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzIHwgRmlsdGVyQnVpbGRlckNsYXNzXG4gID5cbiAgY29uc3RydWN0b3Ioe1xuICAgIHR5cGUgPSAnQU5EJyxcbiAgICBmaWx0ZXJzID0gW25ldyBGaWx0ZXJDbGFzcygpXSxcbiAgICBuZWdhdGVkID0gZmFsc2UsXG4gICAgaWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCksXG4gIH06IHtcbiAgICB0eXBlPzogQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3NbJ3R5cGUnXVxuICAgIGZpbHRlcnM/OiBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1snZmlsdGVycyddXG4gICAgbmVnYXRlZD86IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzWyduZWdhdGVkJ11cbiAgICBpZD86IHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICBzdXBlcih7IHR5cGUsIGZpbHRlcnMsIG5lZ2F0ZWQsIGlkIH0pXG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQm9vbGVhblRleHRUeXBlID0ge1xuICB0ZXh0OiBzdHJpbmdcbiAgY3FsOiBzdHJpbmdcbiAgZXJyb3I6IGJvb2xlYW5cbiAgZXJyb3JNZXNzYWdlPzogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIFZhbHVlVHlwZXMgPSB7XG4gIHByb3hpbWl0eToge1xuICAgIGZpcnN0OiBzdHJpbmdcbiAgICBzZWNvbmQ6IHN0cmluZ1xuICAgIGRpc3RhbmNlOiBudW1iZXJcbiAgfVxuICBkYXRlOiBzdHJpbmdcbiAgYm9vbGVhbjogYm9vbGVhblxuICB0ZXh0OiBzdHJpbmdcbiAgZmxvYXQ6IG51bWJlclxuICBpbnRlZ2VyOiBudW1iZXJcbiAgcmVsYXRpdmU6IHtcbiAgICBsYXN0OiBzdHJpbmdcbiAgICAvL05PVEU6IFdlZWtzIGlzIG5vdCBhIHZhbGlkIHVuaXQsIGJ1dCB3ZSBhbGxvdyBpdCBpbiBvdXIgc3lzdGVtLlxuICAgIC8vVGhpcyBpcyBjb252ZXJ0ZWQgdG8gZGF5cyB0byBiZWNvbWUgdmFsaWQgY3FsXG4gICAgdW5pdDogJ20nIHwgJ2gnIHwgJ2QnIHwgJ00nIHwgJ3knIHwgJ3MnIHwgJ3cnXG4gIH1cbiAgYXJvdW5kOiB7XG4gICAgZGF0ZTogc3RyaW5nXG4gICAgYnVmZmVyOiB7XG4gICAgICBhbW91bnQ6IHN0cmluZ1xuICAgICAgdW5pdDogJ20nIHwgJ2gnIHwgJ2QnIHwgJ00nIHwgJ3knIHwgJ3MnIHwgJ3cnXG4gICAgfVxuICAgIGRpcmVjdGlvbjogJ2JvdGgnIHwgJ2JlZm9yZScgfCAnYWZ0ZXInXG4gIH1cbiAgZHVyaW5nOiB7XG4gICAgc3RhcnQ6IHN0cmluZ1xuICAgIGVuZDogc3RyaW5nXG4gIH1cbiAgYmV0d2Vlbjoge1xuICAgIHN0YXJ0OiBudW1iZXJcbiAgICBlbmQ6IG51bWJlclxuICB9XG4gIG11bHRpdmFsdWU6IHN0cmluZ1tdXG4gIGJvb2xlYW5UZXh0OiBCb29sZWFuVGV4dFR5cGVcbiAgbG9jYXRpb246IC8vIHRoaXMgaXMgYWxsIHdlIHRlY2huaWNhbGx5IG5lZWQgdG8gcmVjb25zdHJ1Y3QgKGxvIGZpZGVsaXR5KVxuICBMaW5lTG9jYXRpb24gfCBQb2x5Z29uTG9jYXRpb24gfCBQb2ludFJhZGl1c0xvY2F0aW9uXG59XG5cbmV4cG9ydCB0eXBlIExpbmVMb2NhdGlvbiA9IHtcbiAgdHlwZTogJ0xJTkUnXG4gIG1vZGU6ICdsaW5lJ1xuICBsaW5lV2lkdGg/OiBzdHJpbmdcbiAgbGluZTogQXJyYXk8QXJyYXk8bnVtYmVyPj5cbn1cbmV4cG9ydCB0eXBlIFBvbHlnb25Mb2NhdGlvbiA9IHtcbiAgdHlwZTogJ1BPTFlHT04nXG4gIHBvbHlnb25CdWZmZXJXaWR0aD86IG51bWJlciB8IHN0cmluZ1xuICBwb2x5Z29uQnVmZmVyVW5pdHM/OiAnbWV0ZXJzJ1xuICBwb2x5Z29uOiBBcnJheTxBcnJheTxudW1iZXI+PlxuICBsb2NhdGlvblR5cGU/OiAnZGQnXG4gIHBvbHlUeXBlPzogJ3BvbHlnb24nXG4gIG1vZGU6ICdwb2x5J1xufVxuZXhwb3J0IHR5cGUgUG9pbnRSYWRpdXNMb2NhdGlvbiA9IHtcbiAgdHlwZTogJ1BPSU5UUkFESVVTJ1xuICByYWRpdXM6IG51bWJlciB8IHN0cmluZ1xuICByYWRpdXNVbml0cz86ICdtZXRlcnMnXG4gIG1vZGU6ICdjaXJjbGUnXG4gIGxhdDogbnVtYmVyXG4gIGxvbjogbnVtYmVyXG4gIGxvY2F0aW9uVHlwZT86ICdkZCdcbn1cblxuZXhwb3J0IGNsYXNzIEZpbHRlckNsYXNzIGV4dGVuZHMgU3ByZWFkT3BlcmF0b3JQcm90ZWN0ZWRDbGFzcyB7XG4gIHR5cGU6XG4gICAgfCAnQkVGT1JFJ1xuICAgIHwgJ0FGVEVSJ1xuICAgIHwgJ1JFTEFUSVZFJ1xuICAgIHwgJz0nXG4gICAgfCAnRFVSSU5HJ1xuICAgIHwgJ0dFT01FVFJZJ1xuICAgIHwgJ0RXSVRISU4nXG4gICAgfCAnSUxJS0UnXG4gICAgfCAnTElLRSdcbiAgICB8ICdJUyBOVUxMJ1xuICAgIHwgJz4nXG4gICAgfCAnPCdcbiAgICB8ICc9J1xuICAgIHwgJzw9J1xuICAgIHwgJz49J1xuICAgIHwgJ0RVUklORydcbiAgICB8ICdCRVRXRUVOJ1xuICAgIHwgJ0ZJTFRFUiBGVU5DVElPTiBwcm94aW1pdHknXG4gICAgfCAnQVJPVU5EJyAvLyBUaGlzIGlzbid0IHZhbGlkIGNxbCwgYnV0IHNvbWV0aGluZyB3ZSBzdXBwb3J0XG4gICAgfCAnQk9PTEVBTl9URVhUX1NFQVJDSCcgLy8gVGhpcyBpc24ndCB2YWxpZCBjcWwsIGJ1dCBzb21ldGhpbmcgd2Ugc3VwcG9ydFxuICByZWFkb25seSBwcm9wZXJ0eTogc3RyaW5nXG4gIHJlYWRvbmx5IHZhbHVlOiBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCB8IFZhbHVlc1R5cGU8VmFsdWVUeXBlcz5cbiAgcmVhZG9ubHkgbmVnYXRlZDogYm9vbGVhbiB8IHVuZGVmaW5lZFxuICByZWFkb25seSBpZDogc3RyaW5nXG4gIGNvbnN0cnVjdG9yKHtcbiAgICB0eXBlID0gJ0lMSUtFJyxcbiAgICBwcm9wZXJ0eSA9ICdhbnlUZXh0JyxcbiAgICB2YWx1ZSA9ICcnLFxuICAgIG5lZ2F0ZWQgPSBmYWxzZSxcbiAgICBpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSxcbiAgfToge1xuICAgIHR5cGU/OiBGaWx0ZXJDbGFzc1sndHlwZSddXG4gICAgcHJvcGVydHk/OiBGaWx0ZXJDbGFzc1sncHJvcGVydHknXVxuICAgIHZhbHVlPzogRmlsdGVyQ2xhc3NbJ3ZhbHVlJ11cbiAgICBuZWdhdGVkPzogRmlsdGVyQ2xhc3NbJ25lZ2F0ZWQnXVxuICAgIGlkPzogc3RyaW5nXG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gICAgdGhpcy5uZWdhdGVkID0gbmVnYXRlZFxuICAgIHRoaXMuaWQgPSBpZFxuICB9XG59XG5cbi8qKlxuICogZGV0ZXJtaW5lIGl0IGlzIGFjdHVhbGx5IGFuIHBsYWluIG9iamVjdCBmb3JtIG9mIHRoZSBmaWx0ZXIgYnVpbGRlciBjbGFzc1xuICovXG5leHBvcnQgY29uc3Qgc2hvdWxkQmVGaWx0ZXJCdWlsZGVyQ2xhc3MgPSAoXG4gIGZpbHRlcjogYW55XG4pOiBmaWx0ZXIgaXMgRmlsdGVyQnVpbGRlckNsYXNzID0+IHtcbiAgcmV0dXJuICFpc0ZpbHRlckJ1aWxkZXJDbGFzcyhmaWx0ZXIpICYmIGZpbHRlci5maWx0ZXJzICE9PSB1bmRlZmluZWRcbn1cblxuLyoqXG4gKmRldGVybWluZSBpdCBpcyBhY3R1YWxseSBhbiBpbnN0YW50aWF0aW9uIG9mIHRoZSBmaWx0ZXIgYnVpbGRlciBjbGFzc1xuICovXG5leHBvcnQgY29uc3QgaXNGaWx0ZXJCdWlsZGVyQ2xhc3MgPSAoXG4gIGZpbHRlcjpcbiAgICB8IEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIHwgRmlsdGVyQ2xhc3NcbiAgICB8IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzXG4gICAgfCBQYXJ0aWFsPEZpbHRlckJ1aWxkZXJDbGFzcz5cbiAgICB8IFBhcnRpYWw8RmlsdGVyQ2xhc3M+XG4gICAgfCBQYXJ0aWFsPENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzPlxuKTogZmlsdGVyIGlzIEZpbHRlckJ1aWxkZXJDbGFzcyA9PiB7XG4gIHJldHVybiBmaWx0ZXIuY29uc3RydWN0b3IgPT09IEZpbHRlckJ1aWxkZXJDbGFzc1xufVxuXG4vKipcbiAqZGV0ZXJtaW5lIGl0IGlzIGFjdHVhbGx5IGFuIGluc3RhbnRpYXRpb24gb2YgdGhlIGNxbCBzdGFuZGFyZCBmaWx0ZXIgYnVpbGRlciBjbGFzc1xuICovXG5leHBvcnQgY29uc3QgaXNDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyA9IChcbiAgZmlsdGVyOlxuICAgIHwgRmlsdGVyQnVpbGRlckNsYXNzXG4gICAgfCBGaWx0ZXJDbGFzc1xuICAgIHwgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgICB8IFBhcnRpYWw8RmlsdGVyQnVpbGRlckNsYXNzPlxuICAgIHwgUGFydGlhbDxGaWx0ZXJDbGFzcz5cbiAgICB8IFBhcnRpYWw8Q1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3M+XG4pOiBmaWx0ZXIgaXMgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3MgPT4ge1xuICByZXR1cm4gZmlsdGVyLmNvbnN0cnVjdG9yID09PSBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2ljRmlsdGVyQ2xhc3MgZXh0ZW5kcyBPbWl0PEZpbHRlckNsYXNzLCAncHJvcGVydHknPiB7XG4gIHByb3BlcnR5OiBzdHJpbmdbXVxufVxuXG5pbnRlcmZhY2UgQmFzaWNEYXRhdHlwZUNsYXNzIGV4dGVuZHMgT21pdDxGaWx0ZXJDbGFzcywgJ3Byb3BlcnR5JyB8ICd2YWx1ZSc+IHtcbiAgcHJvcGVydHk6IHR5cGVvZiBCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXG4gIHZhbHVlOiBzdHJpbmdbXVxufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNEYXRhdHlwZUZpbHRlclxuICBleHRlbmRzIEZpbHRlckNsYXNzXG4gIGltcGxlbWVudHMgQmFzaWNEYXRhdHlwZUNsYXNzXG57XG4gIHByb3BlcnR5OiB0eXBlb2YgQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZVxuICB2YWx1ZTogc3RyaW5nW11cblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgdmFsdWUgPSBbXSxcbiAgfToge1xuICAgIHZhbHVlPzogc3RyaW5nW11cbiAgfSA9IHt9KSB7XG4gICAgc3VwZXIoe1xuICAgICAgcHJvcGVydHk6IEJhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWUsXG4gICAgICB2YWx1ZSxcbiAgICB9KVxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBpc0Jhc2ljRGF0YXR5cGVDbGFzcyA9IChcbiAgZmlsdGVyOlxuICAgIHwgRmlsdGVyQnVpbGRlckNsYXNzXG4gICAgfCBGaWx0ZXJDbGFzc1xuICAgIHwgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgICB8IFBhcnRpYWw8RmlsdGVyQnVpbGRlckNsYXNzPlxuICAgIHwgUGFydGlhbDxGaWx0ZXJDbGFzcz5cbiAgICB8IFBhcnRpYWw8Q1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3M+XG4pOiBmaWx0ZXIgaXMgQmFzaWNEYXRhdHlwZUNsYXNzID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gKGZpbHRlciBhcyBhbnkpPy5wcm9wZXJ0eSA9PT0gQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuIl19