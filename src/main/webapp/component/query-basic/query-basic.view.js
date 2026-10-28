import { __assign, __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import cql from '../../js/cql';
import CQLUtils from '../../js/CQLUtils';
import QuerySettings from '../query-settings/query-settings';
import QueryTimeReactView from '../query-time/query-time.view';
import { BasicDatatypeFilter, isBasicDatatypeClass, isFilterBuilderClass, } from '../filter-builder/filter.structure';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { FilterBuilderClass, FilterClass, } from '../filter-builder/filter.structure';
import Typography from '@mui/material/Typography';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import FilterInput from '../../react-component/filter/filter-input';
import Swath from '../swath/swath';
import Grid from '@mui/material/Grid';
import BooleanSearchBar from '../boolean-search-bar/boolean-search-bar';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { useMetacardDefinitions } from '../../js/model/Startup/metacard-definitions.hooks';
import { ReservedBasicDatatype } from '../reserved-basic-datatype/reserved.basic-datatype';
import { BasicDataTypePropertyName } from '../filter-builder/reserved.properties';
import ExtensionPoints from '../../extension-points';
function isNested(filter) {
    var nested = false;
    filter.filters.forEach(function (subfilter) {
        nested = nested || subfilter.filters;
    });
    return nested;
}
// strip extra quotes
var stripQuotes = function (property) {
    if (property === void 0) { property = 'anyText'; }
    return property === null || property === void 0 ? void 0 : property.replace(/^"(.+(?="$))"$/, '$1');
};
function isAnyDate(filter) {
    if (!filter.filters) {
        return (StartupDataStore.MetacardDefinitions.getAttributeMap()[stripQuotes(filter.property)].type === 'DATE');
    }
    var typesFound = {};
    var valuesFound = {};
    filter.filters.forEach(function (subfilter) {
        typesFound[subfilter.type] = true;
        valuesFound[subfilter.value] = true;
    });
    typesFound = Object.keys(typesFound);
    valuesFound = Object.keys(valuesFound);
    if (typesFound.length > 1 || valuesFound.length > 1) {
        return false;
    }
    else {
        var attributes = filter.filters.map(function (subfilter) { return subfilter.property; });
        return (StartupDataStore.MetacardDefinitions.getAttributeMap()[stripQuotes(attributes[0])].type === 'DATE');
    }
}
function handleAnyDateFilter(propertyValueMap, filter) {
    propertyValueMap['anyDate'] = propertyValueMap['anyDate'] || [];
    var existingFilter = propertyValueMap['anyDate'].filter(function (anyDateFilter) {
        return anyDateFilter.type ===
            (filter.filters ? filter.filters[0].type : filter.type);
    })[0];
    if (!existingFilter) {
        existingFilter = {
            property: [],
        };
        propertyValueMap['anyDate'].push(existingFilter);
    }
    existingFilter.property = existingFilter.property.concat(filter.filters
        ? filter.filters.map(function (subfilter) { return stripQuotes(subfilter.property); })
        : [stripQuotes(filter.property)]);
    existingFilter.type = filter.filters ? filter.filters[0].type : filter.type;
    existingFilter.value = filter.filters ? filter.filters[0].value : filter.value;
    if (existingFilter.type === 'DURING') {
        existingFilter.from = filter.filters ? filter.filters[0].from : filter.from;
        existingFilter.to = filter.filters ? filter.filters[0].to : filter.to;
    }
}
export function downgradeFilterTreeToBasic(filter) {
    return constructFilterFromBasicFilter({
        basicFilter: translateFilterToBasicMap(filter).propertyValueMap,
    });
}
export function translateFilterToBasicMap(filter) {
    var _a;
    var _b;
    var propertyValueMap = __assign((_a = { anyDate: [], anyText: [], anyGeo: [] }, _a[BasicDataTypePropertyName] = {
        on: false,
        value: new BasicDatatypeFilter({
            value: [],
        }),
    }, _a), (_b = ExtensionPoints.extraFilters) === null || _b === void 0 ? void 0 : _b.extraPropertyValueMaps);
    var downConversion = false;
    if (!filter.filters && isAnyDate(filter)) {
        handleAnyDateFilter(propertyValueMap, filter);
    }
    if (isFilterBuilderClass(filter)) {
        filter.filters.forEach(function (subfilter) {
            var _a;
            if (!isFilterBuilderClass(subfilter) && isAnyDate(subfilter)) {
                handleAnyDateFilter(propertyValueMap, subfilter);
            }
            else if (!isFilterBuilderClass(subfilter) &&
                isBasicDatatypeClass(subfilter)) {
                propertyValueMap[BasicDataTypePropertyName].on = true;
                propertyValueMap[BasicDataTypePropertyName].value = subfilter;
            }
            else if (!isFilterBuilderClass(subfilter) &&
                ((_a = ExtensionPoints.extraFilters) === null || _a === void 0 ? void 0 : _a.isExtraFilterClass(subfilter))) {
                ExtensionPoints.extraFilters.translateExtraFilterToBasicMap(propertyValueMap, subfilter);
            }
            else if (!isFilterBuilderClass(subfilter)) {
                if (['anyDate', 'anyText', 'anyGeo'].includes(subfilter.property)) {
                    propertyValueMap[CQLUtils.getProperty(subfilter)] =
                        propertyValueMap[CQLUtils.getProperty(subfilter)] || [];
                    if (propertyValueMap[CQLUtils.getProperty(subfilter)].filter(function (existingFilter) { return existingFilter.type === subfilter.type; }).length === 0) {
                        propertyValueMap[CQLUtils.getProperty(subfilter)].push(subfilter);
                    }
                }
            }
            else if (!isNested(subfilter) && isAnyDate(subfilter)) {
                handleAnyDateFilter(propertyValueMap, subfilter);
            }
            else {
                downConversion = true;
            }
        });
    }
    else {
        propertyValueMap[CQLUtils.getProperty(filter)] =
            propertyValueMap[CQLUtils.getProperty(filter)] || [];
        propertyValueMap[CQLUtils.getProperty(filter)].push(filter);
    }
    if (propertyValueMap.anyText.length === 0) {
        propertyValueMap.anyText.push(new FilterClass({
            type: 'BOOLEAN_TEXT_SEARCH',
            property: 'anyText',
            value: '',
        }));
    }
    return {
        propertyValueMap: propertyValueMap,
        downConversion: downConversion,
    };
}
function getFilterTree(model) {
    if (typeof model.get('filterTree') === 'object') {
        return model.get('filterTree');
    }
    return cql.simplify(cql.read(model.get('cql')));
}
export var constructFilterFromBasicFilter = function (_a) {
    var _b;
    var basicFilter = _a.basicFilter;
    var filters = [];
    if (basicFilter.anyText[0].value !== '') {
        filters.push(basicFilter.anyText[0]);
    }
    if (basicFilter.anyDate[0] !== undefined) {
        filters.push(new FilterBuilderClass({
            type: 'OR',
            filters: basicFilter.anyDate[0].property.length !== 0
                ? basicFilter.anyDate[0].property.map(function (property) {
                    return __assign(__assign({}, basicFilter.anyDate[0]), { property: property });
                })
                : [
                    __assign(__assign({}, basicFilter.anyDate[0]), { property: 'anyDate' }),
                ], // we need a default since we rely on the filterTree solely
        }));
    }
    if (basicFilter.anyGeo[0] !== undefined) {
        filters.push(basicFilter.anyGeo[0]);
    }
    if (basicFilter[BasicDataTypePropertyName].on &&
        basicFilter[BasicDataTypePropertyName].value.value.length > 0) {
        filters.push(basicFilter[BasicDataTypePropertyName].value);
    }
    else if (basicFilter[BasicDataTypePropertyName].on) {
        // a bit of an unfortunate hack so we can depend directly on filterTree (this will only happen if properties is blank!)
        // see the anyDate part of translateFilterToBasicMap for more details
        filters.push(new BasicDatatypeFilter({
            value: [],
        }));
    }
    (_b = ExtensionPoints.extraFilters) === null || _b === void 0 ? void 0 : _b.constructExtraFilters(basicFilter, filters);
    return new FilterBuilderClass({
        type: 'AND',
        filters: filters,
    });
};
/**
 * We want to reset the basic filter whenever the filter tree changes on the model.
 *
 * We also want to update the filter tree once whenever the component is first
 */
var useBasicFilterFromModel = function (_a) {
    var model = _a.model;
    var _b = __read(React.useState(translateFilterToBasicMap(getFilterTree(model)).propertyValueMap), 2), basicFilter = _b[0], setBasicFilter = _b[1];
    var _c = useBackbone(), listenTo = _c.listenTo, stopListening = _c.stopListening;
    React.useEffect(function () {
        var callback = function () {
            setBasicFilter(translateFilterToBasicMap(getFilterTree(model)).propertyValueMap);
        };
        listenTo(model, 'change:filterTree', callback);
        return function () {
            stopListening(model, 'change:filterTree', callback);
        };
    }, [model]);
    return basicFilter;
};
var QueryBasic = function (_a) {
    var _b;
    var model = _a.model, errorListener = _a.errorListener, Extensions = _a.Extensions;
    var MetacardDefinitions = useMetacardDefinitions();
    var inputRef = React.useRef(null);
    var basicFilter = useBasicFilterFromModel({ model: model });
    /**
     * Because of how things render, auto focusing to the input is more complicated than I wish.
     * This ensures it works every time, whereas autoFocus prop is unreliable
     */
    React.useEffect(function () {
        var timeoutId = setTimeout(function () {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
        return function () {
            clearTimeout(timeoutId);
        };
    }, []);
    var anyTextValue = (function () {
        if (basicFilter.anyText) {
            if (typeof basicFilter.anyText[0].value === 'string') {
                return {
                    text: basicFilter.anyText[0].value,
                    cql: '',
                    error: false,
                };
            }
            else {
                return basicFilter.anyText[0].value;
            }
        }
        else {
            return {
                text: '',
                cql: '',
                error: false,
            };
        }
    })();
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "editor-properties px-2 py-3", children: [_jsxs("div", { children: [_jsx(Typography, { className: "pb-2", children: "Keyword" }), _jsx(BooleanSearchBar, { value: anyTextValue, onChange: function (_a) {
                                var text = _a.text, cql = _a.cql, error = _a.error;
                                // we want the string value, the cql value, and if it's correct
                                basicFilter.anyText[0] = new FilterClass(__assign(__assign({}, basicFilter.anyText[0]), { type: 'BOOLEAN_TEXT_SEARCH', value: {
                                        text: text,
                                        cql: cql,
                                        error: error,
                                    } }));
                                model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                            } }, model.id)] }), _jsx("div", { className: "pt-2", children: _jsx(QueryTimeReactView, { value: basicFilter.anyDate[0], onChange: function (newValue) {
                            basicFilter.anyDate[0] = newValue;
                            model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                        } }) }), _jsxs("div", { className: "", children: [_jsx(FormControlLabel, { labelPlacement: "end", control: _jsx(Checkbox, { color: "default", checked: Boolean(basicFilter.anyGeo[0]), onChange: function (e) {
                                    if (!e.target.checked) {
                                        basicFilter.anyGeo.pop();
                                    }
                                    else {
                                        basicFilter.anyGeo.push(new FilterClass({
                                            type: 'GEOMETRY',
                                            property: 'anyGeo',
                                            value: '',
                                        }));
                                    }
                                    model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                                } }), label: MetacardDefinitions.getAlias('location') }), basicFilter.anyGeo[0] ? (_jsxs(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pt-2", children: [_jsx(Grid, { item: true, children: _jsx(Swath, { className: "w-1 h-full" }) }), _jsx(Grid, { item: true, className: "w-full pl-2", children: _jsx(FilterInput, { filter: new FilterClass(__assign(__assign({}, basicFilter.anyGeo[0]), { property: basicFilter.anyGeo[0].property })), setFilter: function (val) {
                                            basicFilter.anyGeo[0] = val;
                                            model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                                        }, errorListener: errorListener }) })] })) : null] }), _jsxs("div", { className: "", children: [_jsx(FormControlLabel, { labelPlacement: "end", control: _jsx(Checkbox, { color: "default", checked: basicFilter[BasicDataTypePropertyName].on, onChange: function (e) {
                                    basicFilter[BasicDataTypePropertyName].on = e.target.checked;
                                    model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                                } }), label: MetacardDefinitions.getAlias(BasicDataTypePropertyName) }), basicFilter[BasicDataTypePropertyName].on ? (_jsxs(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pt-2", children: [_jsx(Grid, { item: true, children: _jsx(Swath, { className: "w-1 h-full" }) }), _jsx(Grid, { item: true, className: "w-full pl-2", children: _jsx(ReservedBasicDatatype, { value: basicFilter[BasicDataTypePropertyName].value.value, onChange: function (newValue) {
                                            basicFilter[BasicDataTypePropertyName].value.value =
                                                newValue;
                                            model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                                        } }) })] })) : null] }), ((_b = ExtensionPoints.extraFilters) === null || _b === void 0 ? void 0 : _b.queryBasicCheckboxFilters) &&
                    ExtensionPoints.extraFilters.queryBasicCheckboxFilters({
                        basicFilter: basicFilter,
                        model: model,
                    }), _jsx("div", { className: "py-2 w-full", children: _jsx(Swath, { className: "w-full h-1" }) }), _jsx("div", { className: "basic-settings", children: _jsx(QuerySettings, { model: model, Extensions: Extensions }) })] }) }));
};
export default QueryBasic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktYmFzaWMudmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcXVlcnktYmFzaWMvcXVlcnktYmFzaWMudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFHOUIsT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFBO0FBQzlCLE9BQU8sUUFBUSxNQUFNLG1CQUFtQixDQUFBO0FBQ3hDLE9BQU8sYUFBYSxNQUFNLGtDQUFrQyxDQUFBO0FBQzVELE9BQU8sa0JBQWtCLE1BQU0sK0JBQStCLENBQUE7QUFDOUQsT0FBTyxFQUNMLG1CQUFtQixFQUVuQixvQkFBb0IsRUFDcEIsb0JBQW9CLEdBQ3JCLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxnQkFBZ0IsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUM3RCxPQUFPLFFBQVEsTUFBTSx3QkFBd0IsQ0FBQTtBQUM3QyxPQUFPLEVBRUwsa0JBQWtCLEVBQ2xCLFdBQVcsR0FDWixNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUNwRSxPQUFPLFdBQVcsTUFBTSwyQ0FBMkMsQ0FBQTtBQUNuRSxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLGdCQUFnQixNQUFNLDBDQUEwQyxDQUFBO0FBRXZFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG1EQUFtRCxDQUFBO0FBQzFGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG9EQUFvRCxD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LEVBQUUsVUFBVSxFQUFFLFVBQVUsR0FBSSxHQUNuRCxJQUNGLEdBQ0wsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxVQUFVLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IGNxbCBmcm9tICcuLi8uLi9qcy9jcWwnXG5pbXBvcnQgQ1FMVXRpbHMgZnJvbSAnLi4vLi4vanMvQ1FMVXRpbHMnXG5pbXBvcnQgUXVlcnlTZXR0aW5ncyBmcm9tICcuLi9xdWVyeS1zZXR0aW5ncy9xdWVyeS1zZXR0aW5ncydcbmltcG9ydCBRdWVyeVRpbWVSZWFjdFZpZXcgZnJvbSAnLi4vcXVlcnktdGltZS9xdWVyeS10aW1lLnZpZXcnXG5pbXBvcnQge1xuICBCYXNpY0RhdGF0eXBlRmlsdGVyLFxuICBCYXNpY0ZpbHRlckNsYXNzLFxuICBpc0Jhc2ljRGF0YXR5cGVDbGFzcyxcbiAgaXNGaWx0ZXJCdWlsZGVyQ2xhc3MsXG59IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgRm9ybUNvbnRyb2xMYWJlbCBmcm9tICdAbXVpL21hdGVyaWFsL0Zvcm1Db250cm9sTGFiZWwnXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnQG11aS9tYXRlcmlhbC9DaGVja2JveCdcbmltcG9ydCB7XG4gIEJvb2xlYW5UZXh0VHlwZSxcbiAgRmlsdGVyQnVpbGRlckNsYXNzLFxuICBGaWx0ZXJDbGFzcyxcbn0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCBUeXBvZ3JhcGh5IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVHlwb2dyYXBoeSdcbmltcG9ydCB7IHVzZUJhY2tib25lIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgRmlsdGVySW5wdXQgZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L2ZpbHRlci9maWx0ZXItaW5wdXQnXG5pbXBvcnQgU3dhdGggZnJvbSAnLi4vc3dhdGgvc3dhdGgnXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgQm9vbGVhblNlYXJjaEJhciBmcm9tICcuLi9ib29sZWFuLXNlYXJjaC1iYXIvYm9vbGVhbi1zZWFyY2gtYmFyJ1xuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL21ldGFjYXJkLWRlZmluaXRpb25zLmhvb2tzJ1xuaW1wb3J0IHsgUmVzZXJ2ZWRCYXNpY0RhdGF0eXBlIH0gZnJvbSAnLi4vcmVzZXJ2ZWQtYmFzaWMtZGF0YXR5cGUvcmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnXG5pbXBvcnQgeyBCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lIH0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvcmVzZXJ2ZWQucHJvcGVydGllcydcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcblxuZnVuY3Rpb24gaXNOZXN0ZWQoZmlsdGVyOiBhbnkpIHtcbiAgbGV0IG5lc3RlZCA9IGZhbHNlXG4gIGZpbHRlci5maWx0ZXJzLmZvckVhY2goKHN1YmZpbHRlcjogYW55KSA9PiB7XG4gICAgbmVzdGVkID0gbmVzdGVkIHx8IHN1YmZpbHRlci5maWx0ZXJzXG4gIH0pXG4gIHJldHVybiBuZXN0ZWRcbn1cblxuLy8gc3RyaXAgZXh0cmEgcXVvdGVzXG5jb25zdCBzdHJpcFF1b3RlcyA9IChwcm9wZXJ0eSA9ICdhbnlUZXh0JykgPT4ge1xuICByZXR1cm4gcHJvcGVydHk/LnJlcGxhY2UoL15cIiguKyg/PVwiJCkpXCIkLywgJyQxJylcbn1cbmZ1bmN0aW9uIGlzQW55RGF0ZShmaWx0ZXI6IGFueSkge1xuICBpZiAoIWZpbHRlci5maWx0ZXJzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtcbiAgICAgICAgc3RyaXBRdW90ZXMoZmlsdGVyLnByb3BlcnR5KVxuICAgICAgXS50eXBlID09PSAnREFURSdcbiAgICApXG4gIH1cbiAgbGV0IHR5cGVzRm91bmQgPSB7fSBhcyBhbnlcbiAgbGV0IHZhbHVlc0ZvdW5kID0ge30gYXMgYW55XG4gIGZpbHRlci5maWx0ZXJzLmZvckVhY2goKHN1YmZpbHRlcjogYW55KSA9PiB7XG4gICAgdHlwZXNGb3VuZFtzdWJmaWx0ZXIudHlwZV0gPSB0cnVlXG4gICAgdmFsdWVzRm91bmRbc3ViZmlsdGVyLnZhbHVlXSA9IHRydWVcbiAgfSlcbiAgdHlwZXNGb3VuZCA9IE9iamVjdC5rZXlzKHR5cGVzRm91bmQpXG4gIHZhbHVlc0ZvdW5kID0gT2JqZWN0LmtleXModmFsdWVzRm91bmQpXG4gIGlmICh0eXBlc0ZvdW5kLmxlbmd0aCA+IDEgfHwgdmFsdWVzRm91bmQubGVuZ3RoID4gMSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBmaWx0ZXIuZmlsdGVycy5tYXAoXG4gICAgICAoc3ViZmlsdGVyOiBhbnkpID0+IHN1YmZpbHRlci5wcm9wZXJ0eVxuICAgIClcbiAgICByZXR1cm4gKFxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW1xuICAgICAgICBzdHJpcFF1b3RlcyhhdHRyaWJ1dGVzWzBdKVxuICAgICAgXS50eXBlID09PSAnREFURSdcbiAgICApXG4gIH1cbn1cbmZ1bmN0aW9uIGhhbmRsZUFueURhdGVGaWx0ZXIocHJvcGVydHlWYWx1ZU1hcDogYW55LCBmaWx0ZXI6IGFueSkge1xuICBwcm9wZXJ0eVZhbHVlTWFwWydhbnlEYXRlJ10gPSBwcm9wZXJ0eVZhbHVlTWFwWydhbnlEYXRlJ10gfHwgW11cbiAgbGV0IGV4aXN0aW5nRmlsdGVyID0gcHJvcGVydHlWYWx1ZU1hcFsnYW55RGF0ZSddLmZpbHRlcihcbiAgICAoYW55RGF0ZUZpbHRlcjogYW55KSA9PlxuICAgICAgYW55RGF0ZUZpbHRlci50eXBlID09PVxuICAgICAgKGZpbHRlci5maWx0ZXJzID8gZmlsdGVyLmZpbHRlcnNbMF0udHlwZSA6IGZpbHRlci50eXBlKVxuICApWzBdXG4gIGlmICghZXhpc3RpbmdGaWx0ZXIpIHtcbiAgICBleGlzdGluZ0ZpbHRlciA9IHtcbiAgICAgIHByb3BlcnR5OiBbXSxcbiAgICB9XG4gICAgcHJvcGVydHlWYWx1ZU1hcFsnYW55RGF0ZSddLnB1c2goZXhpc3RpbmdGaWx0ZXIpXG4gIH1cbiAgZXhpc3RpbmdGaWx0ZXIucHJvcGVydHkgPSBleGlzdGluZ0ZpbHRlci5wcm9wZXJ0eS5jb25jYXQoXG4gICAgZmlsdGVyLmZpbHRlcnNcbiAgICAgID8gZmlsdGVyLmZpbHRlcnMubWFwKChzdWJmaWx0ZXI6IGFueSkgPT4gc3RyaXBRdW90ZXMoc3ViZmlsdGVyLnByb3BlcnR5KSlcbiAgICAgIDogW3N0cmlwUXVvdGVzKGZpbHRlci5wcm9wZXJ0eSldXG4gIClcbiAgZXhpc3RpbmdGaWx0ZXIudHlwZSA9IGZpbHRlci5maWx0ZXJzID8gZmlsdGVyLmZpbHRlcnNbMF0udHlwZSA6IGZpbHRlci50eXBlXG4gIGV4aXN0aW5nRmlsdGVyLnZhbHVlID0gZmlsdGVyLmZpbHRlcnMgPyBmaWx0ZXIuZmlsdGVyc1swXS52YWx1ZSA6IGZpbHRlci52YWx1ZVxuICBpZiAoZXhpc3RpbmdGaWx0ZXIudHlwZSA9PT0gJ0RVUklORycpIHtcbiAgICBleGlzdGluZ0ZpbHRlci5mcm9tID0gZmlsdGVyLmZpbHRlcnMgPyBmaWx0ZXIuZmlsdGVyc1swXS5mcm9tIDogZmlsdGVyLmZyb21cbiAgICBleGlzdGluZ0ZpbHRlci50byA9IGZpbHRlci5maWx0ZXJzID8gZmlsdGVyLmZpbHRlcnNbMF0udG8gOiBmaWx0ZXIudG9cbiAgfVxufVxudHlwZSBQcm9wZXJ0eVZhbHVlTWFwVHlwZSA9IHtcbiAgYW55VGV4dDogQXJyYXk8RmlsdGVyQ2xhc3M+XG4gIGFueURhdGU6IEFycmF5PEJhc2ljRmlsdGVyQ2xhc3M+XG4gIGFueUdlbzogQXJyYXk8RmlsdGVyQ2xhc3M+XG4gIFtCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXToge1xuICAgIG9uOiBib29sZWFuXG4gICAgdmFsdWU6IEJhc2ljRGF0YXR5cGVGaWx0ZXJcbiAgfVxuXG4gIFtrZXk6IHN0cmluZ106IGFueVxufVxuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUZpbHRlclRyZWVUb0Jhc2ljKFxuICBmaWx0ZXI6IEZpbHRlckJ1aWxkZXJDbGFzc1xuKTogRmlsdGVyQnVpbGRlckNsYXNzIHtcbiAgcmV0dXJuIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7XG4gICAgYmFzaWNGaWx0ZXI6IHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAoZmlsdGVyKS5wcm9wZXJ0eVZhbHVlTWFwLFxuICB9KVxufVxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAoZmlsdGVyOiBGaWx0ZXJCdWlsZGVyQ2xhc3MpIHtcbiAgY29uc3QgcHJvcGVydHlWYWx1ZU1hcCA9IHtcbiAgICBhbnlEYXRlOiBbXSxcbiAgICBhbnlUZXh0OiBbXSxcbiAgICBhbnlHZW86IFtdLFxuICAgIFtCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXToge1xuICAgICAgb246IGZhbHNlLFxuICAgICAgdmFsdWU6IG5ldyBCYXNpY0RhdGF0eXBlRmlsdGVyKHtcbiAgICAgICAgdmFsdWU6IFtdLFxuICAgICAgfSksXG4gICAgfSxcbiAgICAuLi5FeHRlbnNpb25Qb2ludHMuZXh0cmFGaWx0ZXJzPy5leHRyYVByb3BlcnR5VmFsdWVNYXBzLFxuICB9IGFzIFByb3BlcnR5VmFsdWVNYXBUeXBlXG4gIGxldCBkb3duQ29udmVyc2lvbiA9IGZhbHNlXG4gIGlmICghZmlsdGVyLmZpbHRlcnMgJiYgaXNBbnlEYXRlKGZpbHRlcikpIHtcbiAgICBoYW5kbGVBbnlEYXRlRmlsdGVyKHByb3BlcnR5VmFsdWVNYXAsIGZpbHRlcilcbiAgfVxuICBpZiAoaXNGaWx0ZXJCdWlsZGVyQ2xhc3MoZmlsdGVyKSkge1xuICAgIGZpbHRlci5maWx0ZXJzLmZvckVhY2goKHN1YmZpbHRlcikgPT4ge1xuICAgICAgaWYgKCFpc0ZpbHRlckJ1aWxkZXJDbGFzcyhzdWJmaWx0ZXIpICYmIGlzQW55RGF0ZShzdWJmaWx0ZXIpKSB7XG4gICAgICAgIGhhbmRsZUFueURhdGVGaWx0ZXIocHJvcGVydHlWYWx1ZU1hcCwgc3ViZmlsdGVyKVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgIWlzRmlsdGVyQnVpbGRlckNsYXNzKHN1YmZpbHRlcikgJiZcbiAgICAgICAgaXNCYXNpY0RhdGF0eXBlQ2xhc3Moc3ViZmlsdGVyKVxuICAgICAgKSB7XG4gICAgICAgIHByb3BlcnR5VmFsdWVNYXBbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0ub24gPSB0cnVlXG4gICAgICAgIHByb3BlcnR5VmFsdWVNYXBbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0udmFsdWUgPSBzdWJmaWx0ZXJcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICFpc0ZpbHRlckJ1aWxkZXJDbGFzcyhzdWJmaWx0ZXIpICYmXG4gICAgICAgIEV4dGVuc2lvblBvaW50cy5leHRyYUZpbHRlcnM/LmlzRXh0cmFGaWx0ZXJDbGFzcyhzdWJmaWx0ZXIpXG4gICAgICApIHtcbiAgICAgICAgRXh0ZW5zaW9uUG9pbnRzLmV4dHJhRmlsdGVycy50cmFuc2xhdGVFeHRyYUZpbHRlclRvQmFzaWNNYXAoXG4gICAgICAgICAgcHJvcGVydHlWYWx1ZU1hcCxcbiAgICAgICAgICBzdWJmaWx0ZXJcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIGlmICghaXNGaWx0ZXJCdWlsZGVyQ2xhc3Moc3ViZmlsdGVyKSkge1xuICAgICAgICBpZiAoWydhbnlEYXRlJywgJ2FueVRleHQnLCAnYW55R2VvJ10uaW5jbHVkZXMoc3ViZmlsdGVyLnByb3BlcnR5KSkge1xuICAgICAgICAgIHByb3BlcnR5VmFsdWVNYXBbQ1FMVXRpbHMuZ2V0UHJvcGVydHkoc3ViZmlsdGVyKV0gPVxuICAgICAgICAgICAgcHJvcGVydHlWYWx1ZU1hcFtDUUxVdGlscy5nZXRQcm9wZXJ0eShzdWJmaWx0ZXIpXSB8fCBbXVxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHByb3BlcnR5VmFsdWVNYXBbQ1FMVXRpbHMuZ2V0UHJvcGVydHkoc3ViZmlsdGVyKV0uZmlsdGVyKFxuICAgICAgICAgICAgICAoZXhpc3RpbmdGaWx0ZXI6IGFueSkgPT4gZXhpc3RpbmdGaWx0ZXIudHlwZSA9PT0gc3ViZmlsdGVyLnR5cGVcbiAgICAgICAgICAgICkubGVuZ3RoID09PSAwXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBwcm9wZXJ0eVZhbHVlTWFwW0NRTFV0aWxzLmdldFByb3BlcnR5KHN1YmZpbHRlcildLnB1c2goc3ViZmlsdGVyKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghaXNOZXN0ZWQoc3ViZmlsdGVyKSAmJiBpc0FueURhdGUoc3ViZmlsdGVyKSkge1xuICAgICAgICBoYW5kbGVBbnlEYXRlRmlsdGVyKHByb3BlcnR5VmFsdWVNYXAsIHN1YmZpbHRlcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvd25Db252ZXJzaW9uID0gdHJ1ZVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgcHJvcGVydHlWYWx1ZU1hcFtDUUxVdGlscy5nZXRQcm9wZXJ0eShmaWx0ZXIpXSA9XG4gICAgICBwcm9wZXJ0eVZhbHVlTWFwW0NRTFV0aWxzLmdldFByb3BlcnR5KGZpbHRlcildIHx8IFtdXG4gICAgcHJvcGVydHlWYWx1ZU1hcFtDUUxVdGlscy5nZXRQcm9wZXJ0eShmaWx0ZXIpXS5wdXNoKGZpbHRlcilcbiAgfVxuICBpZiAocHJvcGVydHlWYWx1ZU1hcC5hbnlUZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHByb3BlcnR5VmFsdWVNYXAuYW55VGV4dC5wdXNoKFxuICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICBwcm9wZXJ0eTogJ2FueVRleHQnLFxuICAgICAgICB2YWx1ZTogJycsXG4gICAgICB9KVxuICAgIClcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcHJvcGVydHlWYWx1ZU1hcCxcbiAgICBkb3duQ29udmVyc2lvbixcbiAgfSBhcyB7XG4gICAgcHJvcGVydHlWYWx1ZU1hcDogUHJvcGVydHlWYWx1ZU1hcFR5cGVcbiAgICBkb3duQ29udmVyc2lvbjogYm9vbGVhblxuICB9XG59XG5mdW5jdGlvbiBnZXRGaWx0ZXJUcmVlKG1vZGVsOiBhbnkpOiBGaWx0ZXJCdWlsZGVyQ2xhc3Mge1xuICBpZiAodHlwZW9mIG1vZGVsLmdldCgnZmlsdGVyVHJlZScpID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtb2RlbC5nZXQoJ2ZpbHRlclRyZWUnKVxuICB9XG4gIHJldHVybiBjcWwuc2ltcGxpZnkoY3FsLnJlYWQobW9kZWwuZ2V0KCdjcWwnKSkpXG59XG50eXBlIFF1ZXJ5QmFzaWNQcm9wcyA9IHtcbiAgbW9kZWw6IGFueVxuICBlcnJvckxpc3RlbmVyPzogKHZhbGlkYXRpb25SZXN1bHRzOiB7XG4gICAgW2tleTogc3RyaW5nXTogVmFsaWRhdGlvblJlc3VsdCB8IHVuZGVmaW5lZFxuICB9KSA9PiB2b2lkXG4gIEV4dGVuc2lvbnM/OiBSZWFjdC5GdW5jdGlvbkNvbXBvbmVudFxufVxuZXhwb3J0IGNvbnN0IGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlciA9ICh7XG4gIGJhc2ljRmlsdGVyLFxufToge1xuICBiYXNpY0ZpbHRlcjogUHJvcGVydHlWYWx1ZU1hcFR5cGVcbn0pOiBGaWx0ZXJCdWlsZGVyQ2xhc3MgPT4ge1xuICBjb25zdCBmaWx0ZXJzID0gW10gYXMgRmlsdGVyQnVpbGRlckNsYXNzWydmaWx0ZXJzJ11cbiAgaWYgKGJhc2ljRmlsdGVyLmFueVRleHRbMF0udmFsdWUgIT09ICcnKSB7XG4gICAgZmlsdGVycy5wdXNoKGJhc2ljRmlsdGVyLmFueVRleHRbMF0pXG4gIH1cbiAgaWYgKGJhc2ljRmlsdGVyLmFueURhdGVbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgIGZpbHRlcnMucHVzaChcbiAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgICBmaWx0ZXJzOlxuICAgICAgICAgIGJhc2ljRmlsdGVyLmFueURhdGVbMF0ucHJvcGVydHkubGVuZ3RoICE9PSAwXG4gICAgICAgICAgICA/IGJhc2ljRmlsdGVyLmFueURhdGVbMF0ucHJvcGVydHkubWFwKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAuLi5iYXNpY0ZpbHRlci5hbnlEYXRlWzBdLFxuICAgICAgICAgICAgICAgICAgcHJvcGVydHksXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgLi4uYmFzaWNGaWx0ZXIuYW55RGF0ZVswXSxcbiAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYW55RGF0ZScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSwgLy8gd2UgbmVlZCBhIGRlZmF1bHQgc2luY2Ugd2UgcmVseSBvbiB0aGUgZmlsdGVyVHJlZSBzb2xlbHlcbiAgICAgIH0pXG4gICAgKVxuICB9XG4gIGlmIChiYXNpY0ZpbHRlci5hbnlHZW9bMF0gIT09IHVuZGVmaW5lZCkge1xuICAgIGZpbHRlcnMucHVzaChiYXNpY0ZpbHRlci5hbnlHZW9bMF0pXG4gIH1cbiAgaWYgKFxuICAgIGJhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLm9uICYmXG4gICAgYmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0udmFsdWUudmFsdWUubGVuZ3RoID4gMFxuICApIHtcbiAgICBmaWx0ZXJzLnB1c2goYmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0udmFsdWUpXG4gIH0gZWxzZSBpZiAoYmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0ub24pIHtcbiAgICAvLyBhIGJpdCBvZiBhbiB1bmZvcnR1bmF0ZSBoYWNrIHNvIHdlIGNhbiBkZXBlbmQgZGlyZWN0bHkgb24gZmlsdGVyVHJlZSAodGhpcyB3aWxsIG9ubHkgaGFwcGVuIGlmIHByb3BlcnRpZXMgaXMgYmxhbmshKVxuICAgIC8vIHNlZSB0aGUgYW55RGF0ZSBwYXJ0IG9mIHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAgZm9yIG1vcmUgZGV0YWlsc1xuICAgIGZpbHRlcnMucHVzaChcbiAgICAgIG5ldyBCYXNpY0RhdGF0eXBlRmlsdGVyKHtcbiAgICAgICAgdmFsdWU6IFtdLFxuICAgICAgfSlcbiAgICApXG4gIH1cbiAgRXh0ZW5zaW9uUG9pbnRzLmV4dHJhRmlsdGVycz8uY29uc3RydWN0RXh0cmFGaWx0ZXJzKGJhc2ljRmlsdGVyLCBmaWx0ZXJzKVxuICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVycyxcbiAgfSlcbn1cbi8qKlxuICogV2Ugd2FudCB0byByZXNldCB0aGUgYmFzaWMgZmlsdGVyIHdoZW5ldmVyIHRoZSBmaWx0ZXIgdHJlZSBjaGFuZ2VzIG9uIHRoZSBtb2RlbC5cbiAqXG4gKiBXZSBhbHNvIHdhbnQgdG8gdXBkYXRlIHRoZSBmaWx0ZXIgdHJlZSBvbmNlIHdoZW5ldmVyIHRoZSBjb21wb25lbnQgaXMgZmlyc3RcbiAqL1xuY29uc3QgdXNlQmFzaWNGaWx0ZXJGcm9tTW9kZWwgPSAoeyBtb2RlbCB9OiBRdWVyeUJhc2ljUHJvcHMpID0+IHtcbiAgY29uc3QgW2Jhc2ljRmlsdGVyLCBzZXRCYXNpY0ZpbHRlcl0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICB0cmFuc2xhdGVGaWx0ZXJUb0Jhc2ljTWFwKGdldEZpbHRlclRyZWUobW9kZWwpKS5wcm9wZXJ0eVZhbHVlTWFwXG4gIClcbiAgY29uc3QgeyBsaXN0ZW5Ubywgc3RvcExpc3RlbmluZyB9ID0gdXNlQmFja2JvbmUoKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgc2V0QmFzaWNGaWx0ZXIoXG4gICAgICAgIHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAoZ2V0RmlsdGVyVHJlZShtb2RlbCkpLnByb3BlcnR5VmFsdWVNYXBcbiAgICAgIClcbiAgICB9XG4gICAgbGlzdGVuVG8obW9kZWwsICdjaGFuZ2U6ZmlsdGVyVHJlZScsIGNhbGxiYWNrKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBzdG9wTGlzdGVuaW5nKG1vZGVsLCAnY2hhbmdlOmZpbHRlclRyZWUnLCBjYWxsYmFjaylcbiAgICB9XG4gIH0sIFttb2RlbF0pXG4gIHJldHVybiBiYXNpY0ZpbHRlclxufVxuXG5jb25zdCBRdWVyeUJhc2ljID0gKHsgbW9kZWwsIGVycm9yTGlzdGVuZXIsIEV4dGVuc2lvbnMgfTogUXVlcnlCYXNpY1Byb3BzKSA9PiB7XG4gIGNvbnN0IE1ldGFjYXJkRGVmaW5pdGlvbnMgPSB1c2VNZXRhY2FyZERlZmluaXRpb25zKClcbiAgY29uc3QgaW5wdXRSZWYgPSBSZWFjdC51c2VSZWY8SFRNTERpdkVsZW1lbnQgfCBudWxsPihudWxsKVxuICBjb25zdCBiYXNpY0ZpbHRlciA9IHVzZUJhc2ljRmlsdGVyRnJvbU1vZGVsKHsgbW9kZWwgfSlcblxuICAvKipcbiAgICogQmVjYXVzZSBvZiBob3cgdGhpbmdzIHJlbmRlciwgYXV0byBmb2N1c2luZyB0byB0aGUgaW5wdXQgaXMgbW9yZSBjb21wbGljYXRlZCB0aGFuIEkgd2lzaC5cbiAgICogVGhpcyBlbnN1cmVzIGl0IHdvcmtzIGV2ZXJ5IHRpbWUsIHdoZXJlYXMgYXV0b0ZvY3VzIHByb3AgaXMgdW5yZWxpYWJsZVxuICAgKi9cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChpbnB1dFJlZi5jdXJyZW50KSB7XG4gICAgICAgIGlucHV0UmVmLmN1cnJlbnQuZm9jdXMoKVxuICAgICAgfVxuICAgIH0sIDEwMClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICB9XG4gIH0sIFtdKVxuICBjb25zdCBhbnlUZXh0VmFsdWU6IEJvb2xlYW5UZXh0VHlwZSA9ICgoKSA9PiB7XG4gICAgaWYgKGJhc2ljRmlsdGVyLmFueVRleHQpIHtcbiAgICAgIGlmICh0eXBlb2YgYmFzaWNGaWx0ZXIuYW55VGV4dFswXS52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0ZXh0OiBiYXNpY0ZpbHRlci5hbnlUZXh0WzBdLnZhbHVlLFxuICAgICAgICAgIGNxbDogJycsXG4gICAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYmFzaWNGaWx0ZXIuYW55VGV4dFswXS52YWx1ZSBhcyBCb29sZWFuVGV4dFR5cGVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGV4dDogJycsXG4gICAgICAgIGNxbDogJycsXG4gICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgIH1cbiAgICB9XG4gIH0pKClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJlZGl0b3ItcHJvcGVydGllcyBweC0yIHB5LTNcIj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8VHlwb2dyYXBoeSBjbGFzc05hbWU9XCJwYi0yXCI+S2V5d29yZDwvVHlwb2dyYXBoeT5cbiAgICAgICAgICA8Qm9vbGVhblNlYXJjaEJhclxuICAgICAgICAgICAgdmFsdWU9e2FueVRleHRWYWx1ZX1cbiAgICAgICAgICAgIGtleT17bW9kZWwuaWR9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHsgdGV4dCwgY3FsLCBlcnJvciB9KSA9PiB7XG4gICAgICAgICAgICAgIC8vIHdlIHdhbnQgdGhlIHN0cmluZyB2YWx1ZSwgdGhlIGNxbCB2YWx1ZSwgYW5kIGlmIGl0J3MgY29ycmVjdFxuICAgICAgICAgICAgICBiYXNpY0ZpbHRlci5hbnlUZXh0WzBdID0gbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICAuLi5iYXNpY0ZpbHRlci5hbnlUZXh0WzBdLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdCT09MRUFOX1RFWFRfU0VBUkNIJyxcbiAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgICAgICAgIGNxbCxcbiAgICAgICAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIG1vZGVsLnNldChcbiAgICAgICAgICAgICAgICAnZmlsdGVyVHJlZScsXG4gICAgICAgICAgICAgICAgY29uc3RydWN0RmlsdGVyRnJvbUJhc2ljRmlsdGVyKHsgYmFzaWNGaWx0ZXIgfSlcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yXCI+XG4gICAgICAgICAgPFF1ZXJ5VGltZVJlYWN0Vmlld1xuICAgICAgICAgICAgdmFsdWU9e2Jhc2ljRmlsdGVyLmFueURhdGVbMF19XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIGJhc2ljRmlsdGVyLmFueURhdGVbMF0gPSBuZXdWYWx1ZVxuICAgICAgICAgICAgICBtb2RlbC5zZXQoXG4gICAgICAgICAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7IGJhc2ljRmlsdGVyIH0pXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiXCI+XG4gICAgICAgICAgPEZvcm1Db250cm9sTGFiZWxcbiAgICAgICAgICAgIGxhYmVsUGxhY2VtZW50PVwiZW5kXCJcbiAgICAgICAgICAgIGNvbnRyb2w9e1xuICAgICAgICAgICAgICA8Q2hlY2tib3hcbiAgICAgICAgICAgICAgICBjb2xvcj1cImRlZmF1bHRcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e0Jvb2xlYW4oYmFzaWNGaWx0ZXIuYW55R2VvWzBdKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICghZS50YXJnZXQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNpY0ZpbHRlci5hbnlHZW8ucG9wKClcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2ljRmlsdGVyLmFueUdlby5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIG1vZGVsLnNldChcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoeyBiYXNpY0ZpbHRlciB9KVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYWJlbD17TWV0YWNhcmREZWZpbml0aW9ucy5nZXRBbGlhcygnbG9jYXRpb24nKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHtiYXNpY0ZpbHRlci5hbnlHZW9bMF0gPyAoXG4gICAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgICAgYWxpZ25JdGVtcz1cInN0cmV0Y2hcIlxuICAgICAgICAgICAgICBkaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHQtMlwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICAgICAgPFN3YXRoIGNsYXNzTmFtZT1cInctMSBoLWZ1bGxcIiAvPlxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIHBsLTJcIj5cbiAgICAgICAgICAgICAgICA8RmlsdGVySW5wdXRcbiAgICAgICAgICAgICAgICAgIGZpbHRlcj17XG4gICAgICAgICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgLi4uYmFzaWNGaWx0ZXIuYW55R2VvWzBdLFxuICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiBiYXNpY0ZpbHRlci5hbnlHZW9bMF0ucHJvcGVydHksXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzZXRGaWx0ZXI9eyh2YWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBiYXNpY0ZpbHRlci5hbnlHZW9bMF0gPSB2YWxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KFxuICAgICAgICAgICAgICAgICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoeyBiYXNpY0ZpbHRlciB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgZXJyb3JMaXN0ZW5lcj17ZXJyb3JMaXN0ZW5lcn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIlwiPlxuICAgICAgICAgIDxGb3JtQ29udHJvbExhYmVsXG4gICAgICAgICAgICBsYWJlbFBsYWNlbWVudD1cImVuZFwiXG4gICAgICAgICAgICBjb250cm9sPXtcbiAgICAgICAgICAgICAgPENoZWNrYm94XG4gICAgICAgICAgICAgICAgY29sb3I9XCJkZWZhdWx0XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtiYXNpY0ZpbHRlcltCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXS5vbn1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgIGJhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLm9uID0gZS50YXJnZXQuY2hlY2tlZFxuICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KFxuICAgICAgICAgICAgICAgICAgICAnZmlsdGVyVHJlZScsXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7IGJhc2ljRmlsdGVyIH0pXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhYmVsPXtNZXRhY2FyZERlZmluaXRpb25zLmdldEFsaWFzKEJhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWUpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAge2Jhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLm9uID8gKFxuICAgICAgICAgICAgPEdyaWRcbiAgICAgICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM9XCJzdHJldGNoXCJcbiAgICAgICAgICAgICAgZGlyZWN0aW9uPVwicm93XCJcbiAgICAgICAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB0LTJcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8R3JpZCBpdGVtPlxuICAgICAgICAgICAgICAgIDxTd2F0aCBjbGFzc05hbWU9XCJ3LTEgaC1mdWxsXCIgLz5cbiAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBwbC0yXCI+XG4gICAgICAgICAgICAgICAgPFJlc2VydmVkQmFzaWNEYXRhdHlwZVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2Jhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLnZhbHVlLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBiYXNpY0ZpbHRlcltCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXS52YWx1ZS52YWx1ZSA9XG4gICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KFxuICAgICAgICAgICAgICAgICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoeyBiYXNpY0ZpbHRlciB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtFeHRlbnNpb25Qb2ludHMuZXh0cmFGaWx0ZXJzPy5xdWVyeUJhc2ljQ2hlY2tib3hGaWx0ZXJzICYmXG4gICAgICAgICAgRXh0ZW5zaW9uUG9pbnRzLmV4dHJhRmlsdGVycy5xdWVyeUJhc2ljQ2hlY2tib3hGaWx0ZXJzKHtcbiAgICAgICAgICAgIGJhc2ljRmlsdGVyLFxuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgfSl9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHktMiB3LWZ1bGxcIj5cbiAgICAgICAgICA8U3dhdGggY2xhc3NOYW1lPVwidy1mdWxsIGgtMVwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJhc2ljLXNldHRpbmdzXCI+XG4gICAgICAgICAgPFF1ZXJ5U2V0dGluZ3MgbW9kZWw9e21vZGVsfSBFeHRlbnNpb25zPXtFeHRlbnNpb25zfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvPlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBRdWVyeUJhc2ljXG4iXX0=