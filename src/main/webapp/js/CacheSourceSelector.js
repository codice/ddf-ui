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
import cql from './cql';
import CQLUtils from './CQLUtils';
function buildCacheSourcesCql(sources) {
    return {
        type: 'OR',
        filters: sources
            .filter(function (source) { return source !== 'cache'; })
            .map(function (source) { return ({
            property: '"metacard_source"',
            type: '=',
            value: source,
        }); }),
    };
}
function limitCacheSources(cql, sources) {
    return {
        type: 'AND',
        filters: [cql, buildCacheSourcesCql(sources)],
    };
}
export default {
    trimCacheSources: function (cqlString, sources) {
        return CQLUtils.sanitizeGeometryCql('(' +
            cql.write(
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ type: string; filters: any[]; ... Remove this comment to see the full error message
            limitCacheSources(cql.simplify(cql.read(cqlString)), sources)) +
            ')');
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVTb3VyY2VTZWxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9DYWNoZVNvdXJjZVNlbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUE7QUFDdkIsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFBO0FBQ2pDLFNBQVMsb0JBQW9CLENBQUMsT0FBWTtJQUN4QyxPQUFPO1FBQ0wsSUFBSSxFQUFFLElBQUk7UUFDVixPQUFPLEVBQUUsT0FBTzthQUNiLE1BQU0sQ0FBQyxVQUFDLE1BQVcsSUFBSyxPQUFBLE1BQU0sS0FBSyxPQUFPLEVBQWxCLENBQWtCLENBQUM7YUFDM0MsR0FBRyxDQUFDLFVBQUMsTUFBVyxJQUFLLE9BQUEsQ0FBQztZQUNyQixRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLElBQUksRUFBRSxHQUFHO1lBQ1QsS0FBSyxFQUFFLE1BQU07U0FDZCxDQUFDLEVBSm9CLENBSXBCLENBQUM7S0FDTixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsR0FBUSxFQUFFLE9BQVk7SUFDL0MsT0FBTztRQUNMLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzlDLENBQUE7QUFDSCxDQUFDO0FBRUQsZUFBZTtJQUNiLGdCQUFnQixZQUFDLFNBQWMsRUFBRSxPQUFZO1FBQzNDLE9BQU8sUUFBUSxDQUFDLG1CQUFtQixDQUNqQyxHQUFHO1lBQ0QsR0FBRyxDQUFDLEtBQUs7WUFDUCxtSkFBbUo7WUFDbkosaUJBQWlCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQzlEO1lBQ0QsR0FBRyxDQUNOLENBQUE7SUFDSCxDQUFDO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IGNxbCBmcm9tICcuL2NxbCdcbmltcG9ydCBDUUxVdGlscyBmcm9tICcuL0NRTFV0aWxzJ1xuZnVuY3Rpb24gYnVpbGRDYWNoZVNvdXJjZXNDcWwoc291cmNlczogYW55KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ09SJyxcbiAgICBmaWx0ZXJzOiBzb3VyY2VzXG4gICAgICAuZmlsdGVyKChzb3VyY2U6IGFueSkgPT4gc291cmNlICE9PSAnY2FjaGUnKVxuICAgICAgLm1hcCgoc291cmNlOiBhbnkpID0+ICh7XG4gICAgICAgIHByb3BlcnR5OiAnXCJtZXRhY2FyZF9zb3VyY2VcIicsXG4gICAgICAgIHR5cGU6ICc9JyxcbiAgICAgICAgdmFsdWU6IHNvdXJjZSxcbiAgICAgIH0pKSxcbiAgfVxufVxuXG5mdW5jdGlvbiBsaW1pdENhY2hlU291cmNlcyhjcWw6IGFueSwgc291cmNlczogYW55KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW2NxbCwgYnVpbGRDYWNoZVNvdXJjZXNDcWwoc291cmNlcyldLFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdHJpbUNhY2hlU291cmNlcyhjcWxTdHJpbmc6IGFueSwgc291cmNlczogYW55KSB7XG4gICAgcmV0dXJuIENRTFV0aWxzLnNhbml0aXplR2VvbWV0cnlDcWwoXG4gICAgICAnKCcgK1xuICAgICAgICBjcWwud3JpdGUoXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICd7IHR5cGU6IHN0cmluZzsgZmlsdGVyczogYW55W107IC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgbGltaXRDYWNoZVNvdXJjZXMoY3FsLnNpbXBsaWZ5KGNxbC5yZWFkKGNxbFN0cmluZykpLCBzb3VyY2VzKVxuICAgICAgICApICtcbiAgICAgICAgJyknXG4gICAgKVxuICB9LFxufVxuIl19