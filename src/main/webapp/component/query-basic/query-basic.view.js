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
                                        } }) })] })) : null] }), _jsx("div", { className: "py-2 w-full", children: _jsx(Swath, { className: "w-full h-1" }) }), _jsx("div", { className: "basic-settings", children: _jsx(QuerySettings, { model: model, Extensions: Extensions }) })] }) }));
};
export default QueryBasic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktYmFzaWMudmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcXVlcnktYmFzaWMvcXVlcnktYmFzaWMudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFHOUIsT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFBO0FBQzlCLE9BQU8sUUFBUSxNQUFNLG1CQUFtQixDQUFBO0FBQ3hDLE9BQU8sYUFBYSxNQUFNLGtDQUFrQyxDQUFBO0FBQzVELE9BQU8sa0JBQWtCLE1BQU0sK0JBQStCLENBQUE7QUFDOUQsT0FBTyxFQUNMLG1CQUFtQixFQUVuQixvQkFBb0IsRUFDcEIsb0JBQW9CLEdBQ3JCLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxnQkFBZ0IsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUM3RCxPQUFPLFFBQVEsTUFBTSx3QkFBd0IsQ0FBQTtBQUM3QyxPQUFPLEVBRUwsa0JBQWtCLEVBQ2xCLFdBQVcsR0FDWixNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUNwRSxPQUFPLFdBQVcsTUFBTSwyQ0FBMkMsQ0FBQTtBQUNuRSxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLGdCQUFnQixNQUFNLDBDQUEwQyxDQUFBO0FBRXZFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG1EQUFtRCxDQUFBO0FBQzFGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG9EQUFvRCxD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QUMsU0FBUyxFQUFDLGFBQWEsWUFDaEMsS0FBQyxxQkFBcUIsSUFDcEIsS0FBSyxFQUFFLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQ3pELFFBQVEsRUFBRSxVQUFDLFFBQVE7NENBQ2pCLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLO2dEQUNoRCxRQUFRLENBQUE7NENBQ1YsS0FBSyxDQUFDLEdBQUcsQ0FDUCxZQUFZLEVBQ1osOEJBQThCLENBQUMsRUFBRSxXQUFXLGFBQUEsRUFBRSxDQUFDLENBQ2hELENBQUE7d0NBQ0gsQ0FBQyxHQUNELEdBQ0csSUFDRixDQUNSLENBQUMsQ0FBQyxDQUFDLElBQUksSUFDSixFQUNOLGNBQUssU0FBUyxFQUFDLGFBQWEsWUFDMUIsS0FBQyxLQUFLLElBQUMsU0FBUyxFQUFDLFlBQVksR0FBRyxHQUM1QixFQUNOLGNBQUssU0FBUyxFQUFDLGdCQUFnQixZQUM3QixLQUFDLGFBQWEsSUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLEdBQUksR0FDbkQsSUFDRixHQUNMLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUNELGVBQWUsVUFBVSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBjcWwgZnJvbSAnLi4vLi4vanMvY3FsJ1xuaW1wb3J0IENRTFV0aWxzIGZyb20gJy4uLy4uL2pzL0NRTFV0aWxzJ1xuaW1wb3J0IFF1ZXJ5U2V0dGluZ3MgZnJvbSAnLi4vcXVlcnktc2V0dGluZ3MvcXVlcnktc2V0dGluZ3MnXG5pbXBvcnQgUXVlcnlUaW1lUmVhY3RWaWV3IGZyb20gJy4uL3F1ZXJ5LXRpbWUvcXVlcnktdGltZS52aWV3J1xuaW1wb3J0IHtcbiAgQmFzaWNEYXRhdHlwZUZpbHRlcixcbiAgQmFzaWNGaWx0ZXJDbGFzcyxcbiAgaXNCYXNpY0RhdGF0eXBlQ2xhc3MsXG4gIGlzRmlsdGVyQnVpbGRlckNsYXNzLFxufSBmcm9tICcuLi9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IEZvcm1Db250cm9sTGFiZWwgZnJvbSAnQG11aS9tYXRlcmlhbC9Gb3JtQ29udHJvbExhYmVsJ1xuaW1wb3J0IENoZWNrYm94IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQ2hlY2tib3gnXG5pbXBvcnQge1xuICBCb29sZWFuVGV4dFR5cGUsXG4gIEZpbHRlckJ1aWxkZXJDbGFzcyxcbiAgRmlsdGVyQ2xhc3MsXG59IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgVHlwb2dyYXBoeSBmcm9tICdAbXVpL21hdGVyaWFsL1R5cG9ncmFwaHknXG5pbXBvcnQgeyB1c2VCYWNrYm9uZSB9IGZyb20gJy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IEZpbHRlcklucHV0IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9maWx0ZXIvZmlsdGVyLWlucHV0J1xuaW1wb3J0IFN3YXRoIGZyb20gJy4uL3N3YXRoL3N3YXRoJ1xuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0IEJvb2xlYW5TZWFyY2hCYXIgZnJvbSAnLi4vYm9vbGVhbi1zZWFyY2gtYmFyL2Jvb2xlYW4tc2VhcmNoLWJhcidcbmltcG9ydCB7IFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvbG9jYXRpb24vdmFsaWRhdG9ycydcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyB1c2VNZXRhY2FyZERlZmluaXRpb25zIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9tZXRhY2FyZC1kZWZpbml0aW9ucy5ob29rcydcbmltcG9ydCB7IFJlc2VydmVkQmFzaWNEYXRhdHlwZSB9IGZyb20gJy4uL3Jlc2VydmVkLWJhc2ljLWRhdGF0eXBlL3Jlc2VydmVkLmJhc2ljLWRhdGF0eXBlJ1xuaW1wb3J0IHsgQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZSB9IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL3Jlc2VydmVkLnByb3BlcnRpZXMnXG5mdW5jdGlvbiBpc05lc3RlZChmaWx0ZXI6IGFueSkge1xuICBsZXQgbmVzdGVkID0gZmFsc2VcbiAgZmlsdGVyLmZpbHRlcnMuZm9yRWFjaCgoc3ViZmlsdGVyOiBhbnkpID0+IHtcbiAgICBuZXN0ZWQgPSBuZXN0ZWQgfHwgc3ViZmlsdGVyLmZpbHRlcnNcbiAgfSlcbiAgcmV0dXJuIG5lc3RlZFxufVxuXG4vLyBzdHJpcCBleHRyYSBxdW90ZXNcbmNvbnN0IHN0cmlwUXVvdGVzID0gKHByb3BlcnR5ID0gJ2FueVRleHQnKSA9PiB7XG4gIHJldHVybiBwcm9wZXJ0eT8ucmVwbGFjZSgvXlwiKC4rKD89XCIkKSlcIiQvLCAnJDEnKVxufVxuZnVuY3Rpb24gaXNBbnlEYXRlKGZpbHRlcjogYW55KSB7XG4gIGlmICghZmlsdGVyLmZpbHRlcnMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW1xuICAgICAgICBzdHJpcFF1b3RlcyhmaWx0ZXIucHJvcGVydHkpXG4gICAgICBdLnR5cGUgPT09ICdEQVRFJ1xuICAgIClcbiAgfVxuICBsZXQgdHlwZXNGb3VuZCA9IHt9IGFzIGFueVxuICBsZXQgdmFsdWVzRm91bmQgPSB7fSBhcyBhbnlcbiAgZmlsdGVyLmZpbHRlcnMuZm9yRWFjaCgoc3ViZmlsdGVyOiBhbnkpID0+IHtcbiAgICB0eXBlc0ZvdW5kW3N1YmZpbHRlci50eXBlXSA9IHRydWVcbiAgICB2YWx1ZXNGb3VuZFtzdWJmaWx0ZXIudmFsdWVdID0gdHJ1ZVxuICB9KVxuICB0eXBlc0ZvdW5kID0gT2JqZWN0LmtleXModHlwZXNGb3VuZClcbiAgdmFsdWVzRm91bmQgPSBPYmplY3Qua2V5cyh2YWx1ZXNGb3VuZClcbiAgaWYgKHR5cGVzRm91bmQubGVuZ3RoID4gMSB8fCB2YWx1ZXNGb3VuZC5sZW5ndGggPiAxKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGZpbHRlci5maWx0ZXJzLm1hcChcbiAgICAgIChzdWJmaWx0ZXI6IGFueSkgPT4gc3ViZmlsdGVyLnByb3BlcnR5XG4gICAgKVxuICAgIHJldHVybiAoXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbXG4gICAgICAgIHN0cmlwUXVvdGVzKGF0dHJpYnV0ZXNbMF0pXG4gICAgICBdLnR5cGUgPT09ICdEQVRFJ1xuICAgIClcbiAgfVxufVxuZnVuY3Rpb24gaGFuZGxlQW55RGF0ZUZpbHRlcihwcm9wZXJ0eVZhbHVlTWFwOiBhbnksIGZpbHRlcjogYW55KSB7XG4gIHByb3BlcnR5VmFsdWVNYXBbJ2FueURhdGUnXSA9IHByb3BlcnR5VmFsdWVNYXBbJ2FueURhdGUnXSB8fCBbXVxuICBsZXQgZXhpc3RpbmdGaWx0ZXIgPSBwcm9wZXJ0eVZhbHVlTWFwWydhbnlEYXRlJ10uZmlsdGVyKFxuICAgIChhbnlEYXRlRmlsdGVyOiBhbnkpID0+XG4gICAgICBhbnlEYXRlRmlsdGVyLnR5cGUgPT09XG4gICAgICAoZmlsdGVyLmZpbHRlcnMgPyBmaWx0ZXIuZmlsdGVyc1swXS50eXBlIDogZmlsdGVyLnR5cGUpXG4gIClbMF1cbiAgaWYgKCFleGlzdGluZ0ZpbHRlcikge1xuICAgIGV4aXN0aW5nRmlsdGVyID0ge1xuICAgICAgcHJvcGVydHk6IFtdLFxuICAgIH1cbiAgICBwcm9wZXJ0eVZhbHVlTWFwWydhbnlEYXRlJ10ucHVzaChleGlzdGluZ0ZpbHRlcilcbiAgfVxuICBleGlzdGluZ0ZpbHRlci5wcm9wZXJ0eSA9IGV4aXN0aW5nRmlsdGVyLnByb3BlcnR5LmNvbmNhdChcbiAgICBmaWx0ZXIuZmlsdGVyc1xuICAgICAgPyBmaWx0ZXIuZmlsdGVycy5tYXAoKHN1YmZpbHRlcjogYW55KSA9PiBzdHJpcFF1b3RlcyhzdWJmaWx0ZXIucHJvcGVydHkpKVxuICAgICAgOiBbc3RyaXBRdW90ZXMoZmlsdGVyLnByb3BlcnR5KV1cbiAgKVxuICBleGlzdGluZ0ZpbHRlci50eXBlID0gZmlsdGVyLmZpbHRlcnMgPyBmaWx0ZXIuZmlsdGVyc1swXS50eXBlIDogZmlsdGVyLnR5cGVcbiAgZXhpc3RpbmdGaWx0ZXIudmFsdWUgPSBmaWx0ZXIuZmlsdGVycyA/IGZpbHRlci5maWx0ZXJzWzBdLnZhbHVlIDogZmlsdGVyLnZhbHVlXG4gIGlmIChleGlzdGluZ0ZpbHRlci50eXBlID09PSAnRFVSSU5HJykge1xuICAgIGV4aXN0aW5nRmlsdGVyLmZyb20gPSBmaWx0ZXIuZmlsdGVycyA/IGZpbHRlci5maWx0ZXJzWzBdLmZyb20gOiBmaWx0ZXIuZnJvbVxuICAgIGV4aXN0aW5nRmlsdGVyLnRvID0gZmlsdGVyLmZpbHRlcnMgPyBmaWx0ZXIuZmlsdGVyc1swXS50byA6IGZpbHRlci50b1xuICB9XG59XG50eXBlIFByb3BlcnR5VmFsdWVNYXBUeXBlID0ge1xuICBhbnlUZXh0OiBBcnJheTxGaWx0ZXJDbGFzcz5cbiAgYW55RGF0ZTogQXJyYXk8QmFzaWNGaWx0ZXJDbGFzcz5cbiAgYW55R2VvOiBBcnJheTxGaWx0ZXJDbGFzcz5cbiAgW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdOiB7XG4gICAgb246IGJvb2xlYW5cbiAgICB2YWx1ZTogQmFzaWNEYXRhdHlwZUZpbHRlclxuICB9XG5cbiAgW2tleTogc3RyaW5nXTogYW55XG59XG5leHBvcnQgZnVuY3Rpb24gZG93bmdyYWRlRmlsdGVyVHJlZVRvQmFzaWMoXG4gIGZpbHRlcjogRmlsdGVyQnVpbGRlckNsYXNzXG4pOiBGaWx0ZXJCdWlsZGVyQ2xhc3Mge1xuICByZXR1cm4gY29uc3RydWN0RmlsdGVyRnJvbUJhc2ljRmlsdGVyKHtcbiAgICBiYXNpY0ZpbHRlcjogdHJhbnNsYXRlRmlsdGVyVG9CYXNpY01hcChmaWx0ZXIpLnByb3BlcnR5VmFsdWVNYXAsXG4gIH0pXG59XG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlRmlsdGVyVG9CYXNpY01hcChmaWx0ZXI6IEZpbHRlckJ1aWxkZXJDbGFzcykge1xuICBjb25zdCBwcm9wZXJ0eVZhbHVlTWFwID0ge1xuICAgIGFueURhdGU6IFtdLFxuICAgIGFueVRleHQ6IFtdLFxuICAgIGFueUdlbzogW10sXG4gICAgW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdOiB7XG4gICAgICBvbjogZmFsc2UsXG4gICAgICB2YWx1ZTogbmV3IEJhc2ljRGF0YXR5cGVGaWx0ZXIoe1xuICAgICAgICB2YWx1ZTogW10sXG4gICAgICB9KSxcbiAgICB9LFxuICB9IGFzIFByb3BlcnR5VmFsdWVNYXBUeXBlXG4gIGxldCBkb3duQ29udmVyc2lvbiA9IGZhbHNlXG4gIGlmICghZmlsdGVyLmZpbHRlcnMgJiYgaXNBbnlEYXRlKGZpbHRlcikpIHtcbiAgICBoYW5kbGVBbnlEYXRlRmlsdGVyKHByb3BlcnR5VmFsdWVNYXAsIGZpbHRlcilcbiAgfVxuICBpZiAoaXNGaWx0ZXJCdWlsZGVyQ2xhc3MoZmlsdGVyKSkge1xuICAgIGZpbHRlci5maWx0ZXJzLmZvckVhY2goKHN1YmZpbHRlcikgPT4ge1xuICAgICAgaWYgKCFpc0ZpbHRlckJ1aWxkZXJDbGFzcyhzdWJmaWx0ZXIpICYmIGlzQW55RGF0ZShzdWJmaWx0ZXIpKSB7XG4gICAgICAgIGhhbmRsZUFueURhdGVGaWx0ZXIocHJvcGVydHlWYWx1ZU1hcCwgc3ViZmlsdGVyKVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgIWlzRmlsdGVyQnVpbGRlckNsYXNzKHN1YmZpbHRlcikgJiZcbiAgICAgICAgaXNCYXNpY0RhdGF0eXBlQ2xhc3Moc3ViZmlsdGVyKVxuICAgICAgKSB7XG4gICAgICAgIHByb3BlcnR5VmFsdWVNYXBbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0ub24gPSB0cnVlXG4gICAgICAgIHByb3BlcnR5VmFsdWVNYXBbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0udmFsdWUgPSBzdWJmaWx0ZXJcbiAgICAgIH0gZWxzZSBpZiAoIWlzRmlsdGVyQnVpbGRlckNsYXNzKHN1YmZpbHRlcikpIHtcbiAgICAgICAgaWYgKFsnYW55RGF0ZScsICdhbnlUZXh0JywgJ2FueUdlbyddLmluY2x1ZGVzKHN1YmZpbHRlci5wcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcm9wZXJ0eVZhbHVlTWFwW0NRTFV0aWxzLmdldFByb3BlcnR5KHN1YmZpbHRlcildID1cbiAgICAgICAgICAgIHByb3BlcnR5VmFsdWVNYXBbQ1FMVXRpbHMuZ2V0UHJvcGVydHkoc3ViZmlsdGVyKV0gfHwgW11cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBwcm9wZXJ0eVZhbHVlTWFwW0NRTFV0aWxzLmdldFByb3BlcnR5KHN1YmZpbHRlcildLmZpbHRlcihcbiAgICAgICAgICAgICAgKGV4aXN0aW5nRmlsdGVyOiBhbnkpID0+IGV4aXN0aW5nRmlsdGVyLnR5cGUgPT09IHN1YmZpbHRlci50eXBlXG4gICAgICAgICAgICApLmxlbmd0aCA9PT0gMFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcHJvcGVydHlWYWx1ZU1hcFtDUUxVdGlscy5nZXRQcm9wZXJ0eShzdWJmaWx0ZXIpXS5wdXNoKHN1YmZpbHRlcilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWlzTmVzdGVkKHN1YmZpbHRlcikgJiYgaXNBbnlEYXRlKHN1YmZpbHRlcikpIHtcbiAgICAgICAgaGFuZGxlQW55RGF0ZUZpbHRlcihwcm9wZXJ0eVZhbHVlTWFwLCBzdWJmaWx0ZXIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb3duQ29udmVyc2lvbiA9IHRydWVcbiAgICAgIH1cbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIHByb3BlcnR5VmFsdWVNYXBbQ1FMVXRpbHMuZ2V0UHJvcGVydHkoZmlsdGVyKV0gPVxuICAgICAgcHJvcGVydHlWYWx1ZU1hcFtDUUxVdGlscy5nZXRQcm9wZXJ0eShmaWx0ZXIpXSB8fCBbXVxuICAgIHByb3BlcnR5VmFsdWVNYXBbQ1FMVXRpbHMuZ2V0UHJvcGVydHkoZmlsdGVyKV0ucHVzaChmaWx0ZXIpXG4gIH1cbiAgaWYgKHByb3BlcnR5VmFsdWVNYXAuYW55VGV4dC5sZW5ndGggPT09IDApIHtcbiAgICBwcm9wZXJ0eVZhbHVlTWFwLmFueVRleHQucHVzaChcbiAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdCT09MRUFOX1RFWFRfU0VBUkNIJyxcbiAgICAgICAgcHJvcGVydHk6ICdhbnlUZXh0JyxcbiAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgfSlcbiAgICApXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHByb3BlcnR5VmFsdWVNYXAsXG4gICAgZG93bkNvbnZlcnNpb24sXG4gIH0gYXMge1xuICAgIHByb3BlcnR5VmFsdWVNYXA6IFByb3BlcnR5VmFsdWVNYXBUeXBlXG4gICAgZG93bkNvbnZlcnNpb246IGJvb2xlYW5cbiAgfVxufVxuZnVuY3Rpb24gZ2V0RmlsdGVyVHJlZShtb2RlbDogYW55KTogRmlsdGVyQnVpbGRlckNsYXNzIHtcbiAgaWYgKHR5cGVvZiBtb2RlbC5nZXQoJ2ZpbHRlclRyZWUnKSA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbW9kZWwuZ2V0KCdmaWx0ZXJUcmVlJylcbiAgfVxuICByZXR1cm4gY3FsLnNpbXBsaWZ5KGNxbC5yZWFkKG1vZGVsLmdldCgnY3FsJykpKVxufVxudHlwZSBRdWVyeUJhc2ljUHJvcHMgPSB7XG4gIG1vZGVsOiBhbnlcbiAgZXJyb3JMaXN0ZW5lcj86ICh2YWxpZGF0aW9uUmVzdWx0czoge1xuICAgIFtrZXk6IHN0cmluZ106IFZhbGlkYXRpb25SZXN1bHQgfCB1bmRlZmluZWRcbiAgfSkgPT4gdm9pZFxuICBFeHRlbnNpb25zPzogUmVhY3QuRnVuY3Rpb25Db21wb25lbnRcbn1cbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIgPSAoe1xuICBiYXNpY0ZpbHRlcixcbn06IHtcbiAgYmFzaWNGaWx0ZXI6IFByb3BlcnR5VmFsdWVNYXBUeXBlXG59KTogRmlsdGVyQnVpbGRlckNsYXNzID0+IHtcbiAgY29uc3QgZmlsdGVycyA9IFtdIGFzIEZpbHRlckJ1aWxkZXJDbGFzc1snZmlsdGVycyddXG4gIGlmIChiYXNpY0ZpbHRlci5hbnlUZXh0WzBdLnZhbHVlICE9PSAnJykge1xuICAgIGZpbHRlcnMucHVzaChiYXNpY0ZpbHRlci5hbnlUZXh0WzBdKVxuICB9XG4gIGlmIChiYXNpY0ZpbHRlci5hbnlEYXRlWzBdICE9PSB1bmRlZmluZWQpIHtcbiAgICBmaWx0ZXJzLnB1c2goXG4gICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgICAgZmlsdGVyczpcbiAgICAgICAgICBiYXNpY0ZpbHRlci5hbnlEYXRlWzBdLnByb3BlcnR5Lmxlbmd0aCAhPT0gMFxuICAgICAgICAgICAgPyBiYXNpY0ZpbHRlci5hbnlEYXRlWzBdLnByb3BlcnR5Lm1hcCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgLi4uYmFzaWNGaWx0ZXIuYW55RGF0ZVswXSxcbiAgICAgICAgICAgICAgICAgIHByb3BlcnR5LFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIC4uLmJhc2ljRmlsdGVyLmFueURhdGVbMF0sXG4gICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2FueURhdGUnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sIC8vIHdlIG5lZWQgYSBkZWZhdWx0IHNpbmNlIHdlIHJlbHkgb24gdGhlIGZpbHRlclRyZWUgc29sZWx5XG4gICAgICB9KVxuICAgIClcbiAgfVxuICBpZiAoYmFzaWNGaWx0ZXIuYW55R2VvWzBdICE9PSB1bmRlZmluZWQpIHtcbiAgICBmaWx0ZXJzLnB1c2goYmFzaWNGaWx0ZXIuYW55R2VvWzBdKVxuICB9XG4gIGlmIChcbiAgICBiYXNpY0ZpbHRlcltCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXS5vbiAmJlxuICAgIGJhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLnZhbHVlLnZhbHVlLmxlbmd0aCA+IDBcbiAgKSB7XG4gICAgZmlsdGVycy5wdXNoKGJhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLnZhbHVlKVxuICB9IGVsc2UgaWYgKGJhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLm9uKSB7XG4gICAgLy8gYSBiaXQgb2YgYW4gdW5mb3J0dW5hdGUgaGFjayBzbyB3ZSBjYW4gZGVwZW5kIGRpcmVjdGx5IG9uIGZpbHRlclRyZWUgKHRoaXMgd2lsbCBvbmx5IGhhcHBlbiBpZiBwcm9wZXJ0aWVzIGlzIGJsYW5rISlcbiAgICAvLyBzZWUgdGhlIGFueURhdGUgcGFydCBvZiB0cmFuc2xhdGVGaWx0ZXJUb0Jhc2ljTWFwIGZvciBtb3JlIGRldGFpbHNcbiAgICBmaWx0ZXJzLnB1c2goXG4gICAgICBuZXcgQmFzaWNEYXRhdHlwZUZpbHRlcih7XG4gICAgICAgIHZhbHVlOiBbXSxcbiAgICAgIH0pXG4gICAgKVxuICB9XG4gIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzLFxuICB9KVxufVxuLyoqXG4gKiBXZSB3YW50IHRvIHJlc2V0IHRoZSBiYXNpYyBmaWx0ZXIgd2hlbmV2ZXIgdGhlIGZpbHRlciB0cmVlIGNoYW5nZXMgb24gdGhlIG1vZGVsLlxuICpcbiAqIFdlIGFsc28gd2FudCB0byB1cGRhdGUgdGhlIGZpbHRlciB0cmVlIG9uY2Ugd2hlbmV2ZXIgdGhlIGNvbXBvbmVudCBpcyBmaXJzdFxuICovXG5jb25zdCB1c2VCYXNpY0ZpbHRlckZyb21Nb2RlbCA9ICh7IG1vZGVsIH06IFF1ZXJ5QmFzaWNQcm9wcykgPT4ge1xuICBjb25zdCBbYmFzaWNGaWx0ZXIsIHNldEJhc2ljRmlsdGVyXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAoZ2V0RmlsdGVyVHJlZShtb2RlbCkpLnByb3BlcnR5VmFsdWVNYXBcbiAgKVxuICBjb25zdCB7IGxpc3RlblRvLCBzdG9wTGlzdGVuaW5nIH0gPSB1c2VCYWNrYm9uZSgpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBzZXRCYXNpY0ZpbHRlcihcbiAgICAgICAgdHJhbnNsYXRlRmlsdGVyVG9CYXNpY01hcChnZXRGaWx0ZXJUcmVlKG1vZGVsKSkucHJvcGVydHlWYWx1ZU1hcFxuICAgICAgKVxuICAgIH1cbiAgICBsaXN0ZW5Ubyhtb2RlbCwgJ2NoYW5nZTpmaWx0ZXJUcmVlJywgY2FsbGJhY2spXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN0b3BMaXN0ZW5pbmcobW9kZWwsICdjaGFuZ2U6ZmlsdGVyVHJlZScsIGNhbGxiYWNrKVxuICAgIH1cbiAgfSwgW21vZGVsXSlcbiAgcmV0dXJuIGJhc2ljRmlsdGVyXG59XG5cbmNvbnN0IFF1ZXJ5QmFzaWMgPSAoeyBtb2RlbCwgZXJyb3JMaXN0ZW5lciwgRXh0ZW5zaW9ucyB9OiBRdWVyeUJhc2ljUHJvcHMpID0+IHtcbiAgY29uc3QgTWV0YWNhcmREZWZpbml0aW9ucyA9IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMoKVxuICBjb25zdCBpbnB1dFJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGJhc2ljRmlsdGVyID0gdXNlQmFzaWNGaWx0ZXJGcm9tTW9kZWwoeyBtb2RlbCB9KVxuXG4gIC8qKlxuICAgKiBCZWNhdXNlIG9mIGhvdyB0aGluZ3MgcmVuZGVyLCBhdXRvIGZvY3VzaW5nIHRvIHRoZSBpbnB1dCBpcyBtb3JlIGNvbXBsaWNhdGVkIHRoYW4gSSB3aXNoLlxuICAgKiBUaGlzIGVuc3VyZXMgaXQgd29ya3MgZXZlcnkgdGltZSwgd2hlcmVhcyBhdXRvRm9jdXMgcHJvcCBpcyB1bnJlbGlhYmxlXG4gICAqL1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKGlucHV0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgaW5wdXRSZWYuY3VycmVudC5mb2N1cygpXG4gICAgICB9XG4gICAgfSwgMTAwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKVxuICAgIH1cbiAgfSwgW10pXG4gIGNvbnN0IGFueVRleHRWYWx1ZTogQm9vbGVhblRleHRUeXBlID0gKCgpID0+IHtcbiAgICBpZiAoYmFzaWNGaWx0ZXIuYW55VGV4dCkge1xuICAgICAgaWYgKHR5cGVvZiBiYXNpY0ZpbHRlci5hbnlUZXh0WzBdLnZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRleHQ6IGJhc2ljRmlsdGVyLmFueVRleHRbMF0udmFsdWUsXG4gICAgICAgICAgY3FsOiAnJyxcbiAgICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBiYXNpY0ZpbHRlci5hbnlUZXh0WzBdLnZhbHVlIGFzIEJvb2xlYW5UZXh0VHlwZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0ZXh0OiAnJyxcbiAgICAgICAgY3FsOiAnJyxcbiAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgfVxuICAgIH1cbiAgfSkoKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImVkaXRvci1wcm9wZXJ0aWVzIHB4LTIgcHktM1wiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxUeXBvZ3JhcGh5IGNsYXNzTmFtZT1cInBiLTJcIj5LZXl3b3JkPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgIDxCb29sZWFuU2VhcmNoQmFyXG4gICAgICAgICAgICB2YWx1ZT17YW55VGV4dFZhbHVlfVxuICAgICAgICAgICAga2V5PXttb2RlbC5pZH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoeyB0ZXh0LCBjcWwsIGVycm9yIH0pID0+IHtcbiAgICAgICAgICAgICAgLy8gd2Ugd2FudCB0aGUgc3RyaW5nIHZhbHVlLCB0aGUgY3FsIHZhbHVlLCBhbmQgaWYgaXQncyBjb3JyZWN0XG4gICAgICAgICAgICAgIGJhc2ljRmlsdGVyLmFueVRleHRbMF0gPSBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIC4uLmJhc2ljRmlsdGVyLmFueVRleHRbMF0sXG4gICAgICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgICAgY3FsLFxuICAgICAgICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgbW9kZWwuc2V0KFxuICAgICAgICAgICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoeyBiYXNpY0ZpbHRlciB9KVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTJcIj5cbiAgICAgICAgICA8UXVlcnlUaW1lUmVhY3RWaWV3XG4gICAgICAgICAgICB2YWx1ZT17YmFzaWNGaWx0ZXIuYW55RGF0ZVswXX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV3VmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgYmFzaWNGaWx0ZXIuYW55RGF0ZVswXSA9IG5ld1ZhbHVlXG4gICAgICAgICAgICAgIG1vZGVsLnNldChcbiAgICAgICAgICAgICAgICAnZmlsdGVyVHJlZScsXG4gICAgICAgICAgICAgICAgY29uc3RydWN0RmlsdGVyRnJvbUJhc2ljRmlsdGVyKHsgYmFzaWNGaWx0ZXIgfSlcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJcIj5cbiAgICAgICAgICA8Rm9ybUNvbnRyb2xMYWJlbFxuICAgICAgICAgICAgbGFiZWxQbGFjZW1lbnQ9XCJlbmRcIlxuICAgICAgICAgICAgY29udHJvbD17XG4gICAgICAgICAgICAgIDxDaGVja2JveFxuICAgICAgICAgICAgICAgIGNvbG9yPVwiZGVmYXVsdFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17Qm9vbGVhbihiYXNpY0ZpbHRlci5hbnlHZW9bMF0pfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFlLnRhcmdldC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2ljRmlsdGVyLmFueUdlby5wb3AoKVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzaWNGaWx0ZXIuYW55R2VvLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KFxuICAgICAgICAgICAgICAgICAgICAnZmlsdGVyVHJlZScsXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7IGJhc2ljRmlsdGVyIH0pXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhYmVsPXtNZXRhY2FyZERlZmluaXRpb25zLmdldEFsaWFzKCdsb2NhdGlvbicpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAge2Jhc2ljRmlsdGVyLmFueUdlb1swXSA/IChcbiAgICAgICAgICAgIDxHcmlkXG4gICAgICAgICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zPVwic3RyZXRjaFwiXG4gICAgICAgICAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgICAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwdC0yXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgICAgICA8U3dhdGggY2xhc3NOYW1lPVwidy0xIGgtZnVsbFwiIC8+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcGwtMlwiPlxuICAgICAgICAgICAgICAgIDxGaWx0ZXJJbnB1dFxuICAgICAgICAgICAgICAgICAgZmlsdGVyPXtcbiAgICAgICAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAuLi5iYXNpY0ZpbHRlci5hbnlHZW9bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6IGJhc2ljRmlsdGVyLmFueUdlb1swXS5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHNldEZpbHRlcj17KHZhbDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2ljRmlsdGVyLmFueUdlb1swXSA9IHZhbFxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXG4gICAgICAgICAgICAgICAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7IGJhc2ljRmlsdGVyIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICBlcnJvckxpc3RlbmVyPXtlcnJvckxpc3RlbmVyfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiXCI+XG4gICAgICAgICAgPEZvcm1Db250cm9sTGFiZWxcbiAgICAgICAgICAgIGxhYmVsUGxhY2VtZW50PVwiZW5kXCJcbiAgICAgICAgICAgIGNvbnRyb2w9e1xuICAgICAgICAgICAgICA8Q2hlY2tib3hcbiAgICAgICAgICAgICAgICBjb2xvcj1cImRlZmF1bHRcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2Jhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLm9ufVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgYmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0ub24gPSBlLnRhcmdldC5jaGVja2VkXG4gICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXG4gICAgICAgICAgICAgICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0RmlsdGVyRnJvbUJhc2ljRmlsdGVyKHsgYmFzaWNGaWx0ZXIgfSlcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFiZWw9e01ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QWxpYXMoQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICB7YmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0ub24gPyAoXG4gICAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgICAgYWxpZ25JdGVtcz1cInN0cmV0Y2hcIlxuICAgICAgICAgICAgICBkaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHQtMlwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICAgICAgPFN3YXRoIGNsYXNzTmFtZT1cInctMSBoLWZ1bGxcIiAvPlxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIHBsLTJcIj5cbiAgICAgICAgICAgICAgICA8UmVzZXJ2ZWRCYXNpY0RhdGF0eXBlXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YmFzaWNGaWx0ZXJbQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV0udmFsdWUudmFsdWV9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2ljRmlsdGVyW0Jhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdLnZhbHVlLnZhbHVlID1cbiAgICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXG4gICAgICAgICAgICAgICAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7IGJhc2ljRmlsdGVyIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweS0yIHctZnVsbFwiPlxuICAgICAgICAgIDxTd2F0aCBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0xXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmFzaWMtc2V0dGluZ3NcIj5cbiAgICAgICAgICA8UXVlcnlTZXR0aW5ncyBtb2RlbD17bW9kZWx9IEV4dGVuc2lvbnM9e0V4dGVuc2lvbnN9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC8+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IFF1ZXJ5QmFzaWNcbiJdfQ==