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
import { hot } from 'react-hot-loader';
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
    var propertyValueMap = (_a = {
            anyDate: [],
            anyText: [],
            anyGeo: []
        },
        _a[BasicDataTypePropertyName] = {
            on: false,
            value: new BasicDatatypeFilter({
                value: [],
            }),
        },
        _a);
    var downConversion = false;
    if (!filter.filters && isAnyDate(filter)) {
        handleAnyDateFilter(propertyValueMap, filter);
    }
    if (isFilterBuilderClass(filter)) {
        filter.filters.forEach(function (subfilter) {
            if (!isFilterBuilderClass(subfilter) && isAnyDate(subfilter)) {
                handleAnyDateFilter(propertyValueMap, subfilter);
            }
            else if (!isFilterBuilderClass(subfilter) &&
                isBasicDatatypeClass(subfilter)) {
                propertyValueMap[BasicDataTypePropertyName].on = true;
                propertyValueMap[BasicDataTypePropertyName].value = subfilter;
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
    var model = _a.model, errorListener = _a.errorListener, Extensions = _a.Extensions;
    var MetacardDefinitions = useMetacardDefinitions();
    var inputRef = React.useRef();
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
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "editor-properties px-2 py-3" },
            React.createElement("div", null,
                React.createElement(Typography, { className: "pb-2" }, "Keyword"),
                React.createElement(BooleanSearchBar, { value: anyTextValue, key: model.id, onChange: function (_a) {
                        var text = _a.text, cql = _a.cql, error = _a.error;
                        // we want the string value, the cql value, and if it's correct
                        basicFilter.anyText[0] = new FilterClass(__assign(__assign({}, basicFilter.anyText[0]), { type: 'BOOLEAN_TEXT_SEARCH', value: {
                                text: text,
                                cql: cql,
                                error: error,
                            } }));
                        model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                    } })),
            React.createElement("div", { className: "pt-2" },
                React.createElement(QueryTimeReactView, { value: basicFilter.anyDate[0], onChange: function (newValue) {
                        basicFilter.anyDate[0] = newValue;
                        model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                    } })),
            React.createElement("div", { className: "" },
                React.createElement(FormControlLabel, { labelPlacement: "end", control: React.createElement(Checkbox, { color: "default", checked: Boolean(basicFilter.anyGeo[0]), onChange: function (e) {
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
                        } }), label: MetacardDefinitions.getAlias('location') }),
                basicFilter.anyGeo[0] ? (React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pt-2" },
                    React.createElement(Grid, { item: true },
                        React.createElement(Swath, { className: "w-1 h-full" })),
                    React.createElement(Grid, { item: true, className: "w-full pl-2" },
                        React.createElement(FilterInput, { filter: new FilterClass(__assign(__assign({}, basicFilter.anyGeo[0]), { property: basicFilter.anyGeo[0].property })), setFilter: function (val) {
                                basicFilter.anyGeo[0] = val;
                                model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                            }, errorListener: errorListener })))) : null),
            React.createElement("div", { className: "" },
                React.createElement(FormControlLabel, { labelPlacement: "end", control: React.createElement(Checkbox, { color: "default", checked: basicFilter[BasicDataTypePropertyName].on, onChange: function (e) {
                            basicFilter[BasicDataTypePropertyName].on = e.target.checked;
                            model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                        } }), label: MetacardDefinitions.getAlias(BasicDataTypePropertyName) }),
                basicFilter[BasicDataTypePropertyName].on ? (React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pt-2" },
                    React.createElement(Grid, { item: true },
                        React.createElement(Swath, { className: "w-1 h-full" })),
                    React.createElement(Grid, { item: true, className: "w-full pl-2" },
                        React.createElement(ReservedBasicDatatype, { value: basicFilter[BasicDataTypePropertyName].value.value, onChange: function (newValue) {
                                basicFilter[BasicDataTypePropertyName].value.value =
                                    newValue;
                                model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                            } })))) : null),
            React.createElement("div", { className: "py-2 w-full" },
                React.createElement(Swath, { className: "w-full h-1" })),
            React.createElement("div", { className: "basic-settings" },
                React.createElement(QuerySettings, { model: model, Extensions: Extensions })))));
};
export default hot(module)(QueryBasic);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktYmFzaWMudmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcXVlcnktYmFzaWMvcXVlcnktYmFzaWMudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFFdEMsT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFBO0FBQzlCLE9BQU8sUUFBUSxNQUFNLG1CQUFtQixDQUFBO0FBQ3hDLE9BQU8sYUFBYSxNQUFNLGtDQUFrQyxDQUFBO0FBQzVELE9BQU8sa0JBQWtCLE1BQU0sK0JBQStCLENBQUE7QUFDOUQsT0FBTyxFQUNMLG1CQUFtQixFQUVuQixvQkFBb0IsRUFDcEIsb0JBQW9CLEdBQ3JCLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxnQkFBZ0IsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUM3RCxPQUFPLFFBQVEsTUFBTSx3QkFBd0IsQ0FBQTtBQUM3QyxPQUFPLEVBRUwsa0JBQWtCLEVBQ2xCLFdBQVcsR0FDWixNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUNwRSxPQUFPLFdBQVcsTUFBTSwyQ0FBMkMsQ0FBQTtBQUNuRSxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLGdCQUFnQixNQUFNLDBDQUEwQyxDQUFBO0FBRXZFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG1EQUFtRCxDQUFB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Q1osOEJBQThCLENBQUMsRUFBRSxXQUFXLGFBQUEsRUFBRSxDQUFDLENBQ2hELENBQUE7NEJBQ0gsQ0FBQyxHQUNELENBQ0csQ0FDRixDQUNSLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDSjtZQUNOLDZCQUFLLFNBQVMsRUFBQyxhQUFhO2dCQUMxQixvQkFBQyxLQUFLLElBQUMsU0FBUyxFQUFDLFlBQVksR0FBRyxDQUM1QjtZQUNOLDZCQUFLLFNBQVMsRUFBQyxnQkFBZ0I7Z0JBQzdCLG9CQUFDLGFBQWEsSUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLEdBQUksQ0FDbkQsQ0FDRixDQUNMLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUNELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IGNxbCBmcm9tICcuLi8uLi9qcy9jcWwnXG5pbXBvcnQgQ1FMVXRpbHMgZnJvbSAnLi4vLi4vanMvQ1FMVXRpbHMnXG5pbXBvcnQgUXVlcnlTZXR0aW5ncyBmcm9tICcuLi9xdWVyeS1zZXR0aW5ncy9xdWVyeS1zZXR0aW5ncydcbmltcG9ydCBRdWVyeVRpbWVSZWFjdFZpZXcgZnJvbSAnLi4vcXVlcnktdGltZS9xdWVyeS10aW1lLnZpZXcnXG5pbXBvcnQge1xuICBCYXNpY0RhdGF0eXBlRmlsdGVyLFxuICBCYXNpY0ZpbHRlckNsYXNzLFxuICBpc0Jhc2ljRGF0YXR5cGVDbGFzcyxcbiAgaXNGaWx0ZXJCdWlsZGVyQ2xhc3MsXG59IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgRm9ybUNvbnRyb2xMYWJlbCBmcm9tICdAbXVpL21hdGVyaWFsL0Zvcm1Db250cm9sTGFiZWwnXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnQG11aS9tYXRlcmlhbC9DaGVja2JveCdcbmltcG9ydCB7XG4gIEJvb2xlYW5UZXh0VHlwZSxcbiAgRmlsdGVyQnVpbGRlckNsYXNzLFxuICBGaWx0ZXJDbGFzcyxcbn0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCBUeXBvZ3JhcGh5IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVHlwb2dyYXBoeSdcbmltcG9ydCB7IHVzZUJhY2tib25lIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgRmlsdGVySW5wdXQgZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L2ZpbHRlci9maWx0ZXItaW5wdXQnXG5pbXBvcnQgU3dhdGggZnJvbSAnLi4vc3dhdGgvc3dhdGgnXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgQm9vbGVhblNlYXJjaEJhciBmcm9tICcuLi9ib29sZWFuLXNlYXJjaC1iYXIvYm9vbGVhbi1zZWFyY2gtYmFyJ1xuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL21ldGFjYXJkLWRlZmluaXRpb25zLmhvb2tzJ1xuaW1wb3J0IHsgUmVzZXJ2ZWRCYXNpY0RhdGF0eXBlIH0gZnJvbSAnLi4vcmVzZXJ2ZWQtYmFzaWMtZGF0YXR5cGUvcmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnXG5pbXBvcnQgeyBCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lIH0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvcmVzZXJ2ZWQucHJvcGVydGllcydcbmZ1bmN0aW9uIGlzTmVzdGVkKGZpbHRlcjogYW55KSB7XG4gIGxldCBuZXN0ZWQgPSBmYWxzZVxuICBmaWx0ZXIuZmlsdGVycy5mb3JFYWNoKChzdWJmaWx0ZXI6IGFueSkgPT4ge1xuICAgIG5lc3RlZCA9IG5lc3RlZCB8fCBzdWJmaWx0ZXIuZmlsdGVyc1xuICB9KVxuICByZXR1cm4gbmVzdGVkXG59XG5cbi8vIHN0cmlwIGV4dHJhIHF1b3Rlc1xuY29uc3Qgc3RyaXBRdW90ZXMgPSAocHJvcGVydHkgPSAnYW55VGV4dCcpID0+IHtcbiAgcmV0dXJuIHByb3BlcnR5Py5yZXBsYWNlKC9eXCIoLisoPz1cIiQpKVwiJC8sICckMScpXG59XG5mdW5jdGlvbiBpc0FueURhdGUoZmlsdGVyOiBhbnkpIHtcbiAgaWYgKCFmaWx0ZXIuZmlsdGVycykge1xuICAgIHJldHVybiAoXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbXG4gICAgICAgIHN0cmlwUXVvdGVzKGZpbHRlci5wcm9wZXJ0eSlcbiAgICAgIF0udHlwZSA9PT0gJ0RBVEUnXG4gICAgKVxuICB9XG4gIGxldCB0eXBlc0ZvdW5kID0ge30gYXMgYW55XG4gIGxldCB2YWx1ZXNGb3VuZCA9IHt9IGFzIGFueVxuICBmaWx0ZXIuZmlsdGVycy5mb3JFYWNoKChzdWJmaWx0ZXI6IGFueSkgPT4ge1xuICAgIHR5cGVzRm91bmRbc3ViZmlsdGVyLnR5cGVdID0gdHJ1ZVxuICAgIHZhbHVlc0ZvdW5kW3N1YmZpbHRlci52YWx1ZV0gPSB0cnVlXG4gIH0pXG4gIHR5cGVzRm91bmQgPSBPYmplY3Qua2V5cyh0eXBlc0ZvdW5kKVxuICB2YWx1ZXNGb3VuZCA9IE9iamVjdC5rZXlzKHZhbHVlc0ZvdW5kKVxuICBpZiAodHlwZXNGb3VuZC5sZW5ndGggPiAxIHx8IHZhbHVlc0ZvdW5kLmxlbmd0aCA+IDEpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gZmlsdGVyLmZpbHRlcnMubWFwKFxuICAgICAgKHN1YmZpbHRlcjogYW55KSA9PiBzdWJmaWx0ZXIucHJvcGVydHlcbiAgICApXG4gICAgcmV0dXJuIChcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtcbiAgICAgICAgc3RyaXBRdW90ZXMoYXR0cmlidXRlc1swXSlcbiAgICAgIF0udHlwZSA9PT0gJ0RBVEUnXG4gICAgKVxuICB9XG59XG5mdW5jdGlvbiBoYW5kbGVBbnlEYXRlRmlsdGVyKHByb3BlcnR5VmFsdWVNYXA6IGFueSwgZmlsdGVyOiBhbnkpIHtcbiAgcHJvcGVydHlWYWx1ZU1hcFsnYW55RGF0ZSddID0gcHJvcGVydHlWYWx1ZU1hcFsnYW55RGF0ZSddIHx8IFtdXG4gIGxldCBleGlzdGluZ0ZpbHRlciA9IHByb3BlcnR5VmFsdWVNYXBbJ2FueURhdGUnXS5maWx0ZXIoXG4gICAgKGFueURhdGVGaWx0ZXI6IGFueSkgPT5cbiAgICAgIGFueURhdGVGaWx0ZXIudHlwZSA9PT1cbiAgICAgIChmaWx0ZXIuZmlsdGVycyA/IGZpbHRlci5maWx0ZXJzWzBdLnR5cGUgOiBmaWx0ZXIudHlwZSlcbiAgKVswXVxuICBpZiAoIWV4aXN0aW5nRmlsdGVyKSB7XG4gICAgZXhpc3RpbmdGaWx0ZXIgPSB7XG4gICAgICBwcm9wZXJ0eTogW10sXG4gICAgfVxuICAgIHByb3BlcnR5VmFsdWVNYXBbJ2FueURhdGUnXS5wdXNoKGV4aXN0aW5nRmlsdGVyKVxuICB9XG4gIGV4aXN0aW5nRmlsdGVyLnByb3BlcnR5ID0gZXhpc3RpbmdGaWx0ZXIucHJvcGVydHkuY29uY2F0KFxuICAgIGZpbHRlci5maWx0ZXJzXG4gICAgICA/IGZpbHRlci5maWx0ZXJzLm1hcCgoc3ViZmlsdGVyOiBhbnkpID0+IHN0cmlwUXVvdGVzKHN1YmZpbHRlci5wcm9wZXJ0eSkpXG4gICAgICA6IFtzdHJpcFF1b3RlcyhmaWx0ZXIucHJvcGVydHkpXVxuICApXG4gIGV4aXN0aW5nRmlsdGVyLnR5cGUgPSBmaWx0ZXIuZmlsdGVycyA/IGZpbHRlci5maWx0ZXJzWzBdLnR5cGUgOiBmaWx0ZXIudHlwZVxuICBleGlzdGluZ0ZpbHRlci52YWx1ZSA9IGZpbHRlci5maWx0ZXJzID8gZmlsdGVyLmZpbHRlcnNbMF0udmFsdWUgOiBmaWx0ZXIudmFsdWVcbiAgaWYgKGV4aXN0aW5nRmlsdGVyLnR5cGUgPT09ICdEVVJJTkcnKSB7XG4gICAgZXhpc3RpbmdGaWx0ZXIuZnJvbSA9IGZpbHRlci5maWx0ZXJzID8gZmlsdGVyLmZpbHRlcnNbMF0uZnJvbSA6IGZpbHRlci5mcm9tXG4gICAgZXhpc3RpbmdGaWx0ZXIudG8gPSBmaWx0ZXIuZmlsdGVycyA/IGZpbHRlci5maWx0ZXJzWzBdLnRvIDogZmlsdGVyLnRvXG4gIH1cbn1cbnR5cGUgUHJvcGVydHlWYWx1ZU1hcFR5cGUgPSB7XG4gIGFueVRleHQ6IEFycmF5PEZpbHRlckNsYXNzPlxuICBhbnlEYXRlOiBBcnJheTxCYXNpY0ZpbHRlckNsYXNzPlxuICBhbnlHZW86IEFycmF5PEZpbHRlckNsYXNzPlxuICBbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV06IHtcbiAgICBvbjogYm9vbGVhblxuICAgIHZhbHVlOiBCYXNpY0RhdGF0eXBlRmlsdGVyXG4gIH1cblxuICBba2V5OiBzdHJpbmddOiBhbnlcbn1cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVGaWx0ZXJUcmVlVG9CYXNpYyhcbiAgZmlsdGVyOiBGaWx0ZXJCdWlsZGVyQ2xhc3Ncbik6IEZpbHRlckJ1aWxkZXJDbGFzcyB7XG4gIHJldHVybiBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoe1xuICAgIGJhc2ljRmlsdGVyOiB0cmFuc2xhdGVGaWx0ZXJUb0Jhc2ljTWFwKGZpbHRlcikucHJvcGVydHlWYWx1ZU1hcCxcbiAgfSlcbn1cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGVGaWx0ZXJUb0Jhc2ljTWFwKGZpbHRlcjogRmlsdGVyQnVpbGRlckNsYXNzKSB7XG4gIGNvbnN0IHByb3BlcnR5VmFsdWVNYXAgPSB7XG4gICAgYW55RGF0ZTogW10sXG4gICAgYW55VGV4dDogW10sXG4gICAgYW55R2VvOiBbXSxcbiAgICBbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV06IHtcbiAgICAgIG9uOiBmYWxzZSxcbiAgICAgIHZhbHVlOiBuZXcgQmFzaWNEYXRhdHlwZUZpbHRlcih7XG4gICAgICAgIHZhbHVlOiBbXSxcbiAgICAgIH0pLFxuICAgIH0sXG4gIH0gYXMgUHJvcGVydHlWYWx1ZU1hcFR5cGVcbiAgbGV0IGRvd25Db252ZXJzaW9uID0gZmFsc2VcbiAgaWYgKCFmaWx0ZXIuZmlsdGVycyAmJiBpc0FueURhdGUoZmlsdGVyKSkge1xuICAgIGhhbmRsZUFueURhdGVGaWx0ZXIocHJvcGVydHlWYWx1ZU1hcCwgZmlsdGVyKVxuICB9XG4gIGlmIChpc0ZpbHRlckJ1aWxkZXJDbGFzcyhmaWx0ZXIpKSB7XG4gICAgZmlsdGVyLmZpbHRlcnMuZm9yRWFjaCgoc3ViZmlsdGVyKSA9PiB7XG4gICAgICBpZiAoIWlzRmlsdGVyQnVpbGRlckNsYXNzKHN1YmZpbHRlcikgJiYgaXNBbnlEYXRlKHN1YmZpbHRlcikpIHtcbiAgICAgICAgaGFuZGxlQW55RGF0ZUZpbHRlcihwcm9wZXJ0eVZhbHVlTWFwLCBzdWJmaWx0ZXIpXG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAhaXNGaWx0ZXJCdWlsZGVyQ2xhc3Moc3ViZmlsdGVyKSAmJlxuICAgICAgICBpc0Jhc2ljRGF0YXR5cGVDbGFzcyhzdWJmaWx0ZXIpXG4gICAgICApIHtcbiAgICAgICAgcHJvcGVydHlWYWx1ZU1hcFtCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXS5vbiA9IHRydWVcbiAgICAgICAgcHJvcGVydHlWYWx1ZU1hcFtCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXS52YWx1ZSA9IHN1YmZpbHRlclxuICAgICAgfSBlbHNlIGlmICghaXNGaWx0ZXJCdWlsZGVyQ2xhc3Moc3ViZmlsdGVyKSkge1xuICAgICAgICBpZiAoWydhbnlEYXRlJywgJ2FueVRleHQnLCAnYW55R2VvJ10uaW5jbHVkZXMoc3ViZmlsdGVyLnByb3BlcnR5KSkge1xuICAgICAgICAgIHByb3BlcnR5VmFsdWVNYXBbQ1FMVXRpbHMuZ2V0UHJvcGVydHkoc3ViZmlsdGVyKV0gPVxuICAgICAgICAgICAgcHJvcGVydHlWYWx1ZU1hcFtDUUxVdGlscy5nZXRQcm9wZXJ0eShzdWJmaWx0ZXIpXSB8fCBbXVxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHByb3BlcnR5VmFsdWVNYXBbQ1FMVXRpbHMuZ2V0UHJvcGVydHkoc3ViZmlsdGVyKV0uZmlsdGVyKFxuICAgICAgICAgICAgICAoZXhpc3RpbmdGaWx0ZXI6IGFueSkgPT4gZXhpc3RpbmdGaWx0ZXIudHlwZSA9PT0gc3ViZmlsdGVyLnR5cGVcbiAgICAgICAgICAgICkubGVuZ3RoID09PSAwXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBwcm9wZXJ0eVZhbHVlTWFwW0NRTFV0aWxzLmdldFByb3BlcnR5KHN1YmZpbHRlcildLnB1c2goc3ViZmlsdGVyKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghaXNOZXN0ZWQoc3ViZmlsdGVyKSAmJiBpc0FueURhdGUoc3ViZmlsdGVyKSkge1xuICAgICAgICBoYW5kbGVBbnlEYXRlRmlsdGVyKHByb3BlcnR5VmFsdWVNYXAsIHN1YmZpbHRlcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvd25Db252ZXJzaW9uID0gdHJ1ZVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgcHJvcGVydHlWYWx1ZU1hcFtDUUxVdGlscy5nZXRQcm9wZXJ0eShmaWx0ZXIpXSA9XG4gICAgICBwcm9wZXJ0eVZhbHVlTWFwW0NRTFV0aWxzLmdldFByb3BlcnR5KGZpbHRlcildIHx8IFtdXG4gICAgcHJvcGVydHlWYWx1ZU1hcFtDUUxVdGlscy5nZXRQcm9wZXJ0eShmaWx0ZXIpXS5wdXNoKGZpbHRlcilcbiAgfVxuICBpZiAocHJvcGVydHlWYWx1ZU1hcC5hbnlUZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHByb3BlcnR5VmFsdWVNYXAuYW55VGV4dC5wdXNoKFxuICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICBwcm9wZXJ0eTogJ2FueVRleHQnLFxuICAgICAgICB2YWx1ZTogJycsXG4gICAgICB9KVxuICAgIClcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcHJvcGVydHlWYWx1ZU1hcCxcbiAgICBkb3duQ29udmVyc2lvbixcbiAgfSBhcyB7XG4gICAgcHJvcGVydHlWYWx1ZU1hcDogUHJvcGVydHlWYWx1ZU1hcFR5cGVcbiAgICBkb3duQ29udmVyc2lvbjogYm9vbGVhblxuICB9XG59XG5mdW5jdGlvbiBnZXRGaWx0ZXJUcmVlKG1vZGVsOiBhbnkpOiBGaWx0ZXJCdWlsZGVyQ2xhc3Mge1xuICBpZiAodHlwZW9mIG1vZGVsLmdldCgnZmlsdGVyVHJlZScpID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtb2RlbC5nZXQoJ2ZpbHRlclRyZWUnKVxuICB9XG4gIHJldHVybiBjcWwuc2ltcGxpZnkoY3FsLnJlYWQobW9kZWwuZ2V0KCdjcWwnKSkpXG59XG50eXBlIFF1ZXJ5QmFzaWNQcm9wcyA9IHtcbiAgbW9kZWw6IGFueVxuICBlcnJvckxpc3RlbmVyPzogKHZhbGlkYXRpb25SZXN1bHRzOiB7XG4gICAgW2tleTogc3RyaW5nXTogVmFsaWRhdGlvblJlc3VsdCB8IHVuZGVmaW5lZFxuICB9KSA9PiB2b2lkXG4gIEV4dGVuc2lvbnM/OiBSZWFjdC5GdW5jdGlvbkNvbXBvbmVudFxufVxuZXhwb3J0IGNvbnN0IGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlciA9ICh7XG4gIGJhc2ljRmlsdGVyLFxufToge1xuICBiYXNpY0ZpbHRlcjogUHJvcGVydHlWYWx1ZU1hcFR5cGVcbn0pOiBGaWx0ZXJCdWlsZGVyQ2xhc3MgPT4ge1xuICBjb25zdCBmaWx0ZXJzID0gW10gYXMgRmlsdGVyQnVpbGRlckNsYXNzWydmaWx0ZXJzJ11cbiAgaWYgKGJhc2ljRmlsdGVyLmFueVRleHRbMF0udmFsdWUgIT09ICcnKSB7XG4gICAgZmlsdGVycy5wdXNoKGJhc2ljRmlsdGVyLmFueVRleHRbMF0pXG4gIH1cbiAgaWYgKGJhc2ljRmlsdGVyLmFueURhdGVbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgIGZpbHRlcnMucHVzaChcbiAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgICBmaWx0ZXJzOlxuICAgICAgICAgIGJhc2ljRmlsdGVyLmFueURhdGVbMF0ucHJvcGVydHkubGVuZ3RoICE9PSAwXG4gICAgICAgICAgICA/IGJhc2ljRmlsdGVyLmFueURhdGVbMF0ucHJvcGVydHkubWFwKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAuLi5iYXNpY0ZpbHRlci5hbnlEYXRlWzBdLFxuICAgICAgICAgICAgICAgICAgcHJvcGVydHksXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgLi4uYmFzaWNGaWx0ZXIuYW55RGF0ZVswXSxcbiAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYW55RGF0ZScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSwgLy8gd2UgbmVlZCBhIGRlZmF1bHQgc2luY2Ugd2UgcmVseSBvbiB0aGUgZmlsdGVyVHJlZSBzb2xlbHlcbiAgICAgIH0pXG4gICAgKVxuICB9XG4gIGlmIChiYXNpY0ZpbHRlci5hbnlHZW9bMF0gIT09IHVuZGVmaW5lZCkge1xuICAgIGZpbHRlcnMucHVzaChiYXNpY0ZpbHRlci5hbnlHZW9bMF0pXG4gIH1cbiAgaWYgKFxuICAgIGJhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLm9uICYmXG4gICAgYmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0udmFsdWUudmFsdWUubGVuZ3RoID4gMFxuICApIHtcbiAgICBmaWx0ZXJzLnB1c2goYmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0udmFsdWUpXG4gIH0gZWxzZSBpZiAoYmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0ub24pIHtcbiAgICAvLyBhIGJpdCBvZiBhbiB1bmZvcnR1bmF0ZSBoYWNrIHNvIHdlIGNhbiBkZXBlbmQgZGlyZWN0bHkgb24gZmlsdGVyVHJlZSAodGhpcyB3aWxsIG9ubHkgaGFwcGVuIGlmIHByb3BlcnRpZXMgaXMgYmxhbmshKVxuICAgIC8vIHNlZSB0aGUgYW55RGF0ZSBwYXJ0IG9mIHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAgZm9yIG1vcmUgZGV0YWlsc1xuICAgIGZpbHRlcnMucHVzaChcbiAgICAgIG5ldyBCYXNpY0RhdGF0eXBlRmlsdGVyKHtcbiAgICAgICAgdmFsdWU6IFtdLFxuICAgICAgfSlcbiAgICApXG4gIH1cbiAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgIHR5cGU6ICdBTkQnLFxuICAgIGZpbHRlcnMsXG4gIH0pXG59XG4vKipcbiAqIFdlIHdhbnQgdG8gcmVzZXQgdGhlIGJhc2ljIGZpbHRlciB3aGVuZXZlciB0aGUgZmlsdGVyIHRyZWUgY2hhbmdlcyBvbiB0aGUgbW9kZWwuXG4gKlxuICogV2UgYWxzbyB3YW50IHRvIHVwZGF0ZSB0aGUgZmlsdGVyIHRyZWUgb25jZSB3aGVuZXZlciB0aGUgY29tcG9uZW50IGlzIGZpcnN0XG4gKi9cbmNvbnN0IHVzZUJhc2ljRmlsdGVyRnJvbU1vZGVsID0gKHsgbW9kZWwgfTogUXVlcnlCYXNpY1Byb3BzKSA9PiB7XG4gIGNvbnN0IFtiYXNpY0ZpbHRlciwgc2V0QmFzaWNGaWx0ZXJdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgdHJhbnNsYXRlRmlsdGVyVG9CYXNpY01hcChnZXRGaWx0ZXJUcmVlKG1vZGVsKSkucHJvcGVydHlWYWx1ZU1hcFxuICApXG4gIGNvbnN0IHsgbGlzdGVuVG8sIHN0b3BMaXN0ZW5pbmcgfSA9IHVzZUJhY2tib25lKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHNldEJhc2ljRmlsdGVyKFxuICAgICAgICB0cmFuc2xhdGVGaWx0ZXJUb0Jhc2ljTWFwKGdldEZpbHRlclRyZWUobW9kZWwpKS5wcm9wZXJ0eVZhbHVlTWFwXG4gICAgICApXG4gICAgfVxuICAgIGxpc3RlblRvKG1vZGVsLCAnY2hhbmdlOmZpbHRlclRyZWUnLCBjYWxsYmFjaylcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3RvcExpc3RlbmluZyhtb2RlbCwgJ2NoYW5nZTpmaWx0ZXJUcmVlJywgY2FsbGJhY2spXG4gICAgfVxuICB9LCBbbW9kZWxdKVxuICByZXR1cm4gYmFzaWNGaWx0ZXJcbn1cblxuY29uc3QgUXVlcnlCYXNpYyA9ICh7IG1vZGVsLCBlcnJvckxpc3RlbmVyLCBFeHRlbnNpb25zIH06IFF1ZXJ5QmFzaWNQcm9wcykgPT4ge1xuICBjb25zdCBNZXRhY2FyZERlZmluaXRpb25zID0gdXNlTWV0YWNhcmREZWZpbml0aW9ucygpXG4gIGNvbnN0IGlucHV0UmVmID0gUmVhY3QudXNlUmVmPEhUTUxEaXZFbGVtZW50PigpXG4gIGNvbnN0IGJhc2ljRmlsdGVyID0gdXNlQmFzaWNGaWx0ZXJGcm9tTW9kZWwoeyBtb2RlbCB9KVxuXG4gIC8qKlxuICAgKiBCZWNhdXNlIG9mIGhvdyB0aGluZ3MgcmVuZGVyLCBhdXRvIGZvY3VzaW5nIHRvIHRoZSBpbnB1dCBpcyBtb3JlIGNvbXBsaWNhdGVkIHRoYW4gSSB3aXNoLlxuICAgKiBUaGlzIGVuc3VyZXMgaXQgd29ya3MgZXZlcnkgdGltZSwgd2hlcmVhcyBhdXRvRm9jdXMgcHJvcCBpcyB1bnJlbGlhYmxlXG4gICAqL1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKGlucHV0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgaW5wdXRSZWYuY3VycmVudC5mb2N1cygpXG4gICAgICB9XG4gICAgfSwgMTAwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKVxuICAgIH1cbiAgfSwgW10pXG4gIGNvbnN0IGFueVRleHRWYWx1ZTogQm9vbGVhblRleHRUeXBlID0gKCgpID0+IHtcbiAgICBpZiAoYmFzaWNGaWx0ZXIuYW55VGV4dCkge1xuICAgICAgaWYgKHR5cGVvZiBiYXNpY0ZpbHRlci5hbnlUZXh0WzBdLnZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRleHQ6IGJhc2ljRmlsdGVyLmFueVRleHRbMF0udmFsdWUsXG4gICAgICAgICAgY3FsOiAnJyxcbiAgICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBiYXNpY0ZpbHRlci5hbnlUZXh0WzBdLnZhbHVlIGFzIEJvb2xlYW5UZXh0VHlwZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0ZXh0OiAnJyxcbiAgICAgICAgY3FsOiAnJyxcbiAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgfVxuICAgIH1cbiAgfSkoKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImVkaXRvci1wcm9wZXJ0aWVzIHB4LTIgcHktM1wiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxUeXBvZ3JhcGh5IGNsYXNzTmFtZT1cInBiLTJcIj5LZXl3b3JkPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgIDxCb29sZWFuU2VhcmNoQmFyXG4gICAgICAgICAgICB2YWx1ZT17YW55VGV4dFZhbHVlfVxuICAgICAgICAgICAga2V5PXttb2RlbC5pZH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoeyB0ZXh0LCBjcWwsIGVycm9yIH0pID0+IHtcbiAgICAgICAgICAgICAgLy8gd2Ugd2FudCB0aGUgc3RyaW5nIHZhbHVlLCB0aGUgY3FsIHZhbHVlLCBhbmQgaWYgaXQncyBjb3JyZWN0XG4gICAgICAgICAgICAgIGJhc2ljRmlsdGVyLmFueVRleHRbMF0gPSBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIC4uLmJhc2ljRmlsdGVyLmFueVRleHRbMF0sXG4gICAgICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgICAgY3FsLFxuICAgICAgICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgbW9kZWwuc2V0KFxuICAgICAgICAgICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoeyBiYXNpY0ZpbHRlciB9KVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTJcIj5cbiAgICAgICAgICA8UXVlcnlUaW1lUmVhY3RWaWV3XG4gICAgICAgICAgICB2YWx1ZT17YmFzaWNGaWx0ZXIuYW55RGF0ZVswXX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV3VmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgYmFzaWNGaWx0ZXIuYW55RGF0ZVswXSA9IG5ld1ZhbHVlXG4gICAgICAgICAgICAgIG1vZGVsLnNldChcbiAgICAgICAgICAgICAgICAnZmlsdGVyVHJlZScsXG4gICAgICAgICAgICAgICAgY29uc3RydWN0RmlsdGVyRnJvbUJhc2ljRmlsdGVyKHsgYmFzaWNGaWx0ZXIgfSlcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJcIj5cbiAgICAgICAgICA8Rm9ybUNvbnRyb2xMYWJlbFxuICAgICAgICAgICAgbGFiZWxQbGFjZW1lbnQ9XCJlbmRcIlxuICAgICAgICAgICAgY29udHJvbD17XG4gICAgICAgICAgICAgIDxDaGVja2JveFxuICAgICAgICAgICAgICAgIGNvbG9yPVwiZGVmYXVsdFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17Qm9vbGVhbihiYXNpY0ZpbHRlci5hbnlHZW9bMF0pfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFlLnRhcmdldC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2ljRmlsdGVyLmFueUdlby5wb3AoKVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzaWNGaWx0ZXIuYW55R2VvLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KFxuICAgICAgICAgICAgICAgICAgICAnZmlsdGVyVHJlZScsXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7IGJhc2ljRmlsdGVyIH0pXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhYmVsPXtNZXRhY2FyZERlZmluaXRpb25zLmdldEFsaWFzKCdsb2NhdGlvbicpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAge2Jhc2ljRmlsdGVyLmFueUdlb1swXSA/IChcbiAgICAgICAgICAgIDxHcmlkXG4gICAgICAgICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zPVwic3RyZXRjaFwiXG4gICAgICAgICAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgICAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwdC0yXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgICAgICA8U3dhdGggY2xhc3NOYW1lPVwidy0xIGgtZnVsbFwiIC8+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcGwtMlwiPlxuICAgICAgICAgICAgICAgIDxGaWx0ZXJJbnB1dFxuICAgICAgICAgICAgICAgICAgZmlsdGVyPXtcbiAgICAgICAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAuLi5iYXNpY0ZpbHRlci5hbnlHZW9bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6IGJhc2ljRmlsdGVyLmFueUdlb1swXS5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHNldEZpbHRlcj17KHZhbDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2ljRmlsdGVyLmFueUdlb1swXSA9IHZhbFxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXG4gICAgICAgICAgICAgICAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7IGJhc2ljRmlsdGVyIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICBlcnJvckxpc3RlbmVyPXtlcnJvckxpc3RlbmVyfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiXCI+XG4gICAgICAgICAgPEZvcm1Db250cm9sTGFiZWxcbiAgICAgICAgICAgIGxhYmVsUGxhY2VtZW50PVwiZW5kXCJcbiAgICAgICAgICAgIGNvbnRyb2w9e1xuICAgICAgICAgICAgICA8Q2hlY2tib3hcbiAgICAgICAgICAgICAgICBjb2xvcj1cImRlZmF1bHRcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2Jhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLm9ufVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgYmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0ub24gPSBlLnRhcmdldC5jaGVja2VkXG4gICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXG4gICAgICAgICAgICAgICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0RmlsdGVyRnJvbUJhc2ljRmlsdGVyKHsgYmFzaWNGaWx0ZXIgfSlcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFiZWw9e01ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QWxpYXMoQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICB7YmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0ub24gPyAoXG4gICAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgICAgYWxpZ25JdGVtcz1cInN0cmV0Y2hcIlxuICAgICAgICAgICAgICBkaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHQtMlwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICAgICAgPFN3YXRoIGNsYXNzTmFtZT1cInctMSBoLWZ1bGxcIiAvPlxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIHBsLTJcIj5cbiAgICAgICAgICAgICAgICA8UmVzZXJ2ZWRCYXNpY0RhdGF0eXBlXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0udmFsdWUudmFsdWV9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLnZhbHVlLnZhbHVlID1cbiAgICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXG4gICAgICAgICAgICAgICAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7IGJhc2ljRmlsdGVyIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweS0yIHctZnVsbFwiPlxuICAgICAgICAgIDxTd2F0aCBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0xXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmFzaWMtc2V0dGluZ3NcIj5cbiAgICAgICAgICA8UXVlcnlTZXR0aW5ncyBtb2RlbD17bW9kZWx9IEV4dGVuc2lvbnM9e0V4dGVuc2lvbnN9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC8+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFF1ZXJ5QmFzaWMpXG4iXX0=