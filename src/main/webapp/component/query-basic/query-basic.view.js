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
import _ from 'underscore';
import IconHelper from '../../js/IconHelper';
import cql from '../../js/cql';
import CQLUtils from '../../js/CQLUtils';
import QuerySettings from '../query-settings/query-settings';
import QueryTimeReactView from '../query-time/query-time.view';
var METADATA_CONTENT_TYPE = 'metadata-content-type';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { FilterBuilderClass, FilterClass, } from '../filter-builder/filter.structure';
import Typography from '@mui/material/Typography';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import FilterInput from '../../react-component/filter/filter-input';
import Swath from '../swath/swath';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import BooleanSearchBar from '../boolean-search-bar/boolean-search-bar';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { useMetacardDefinitions } from '../../js/model/Startup/metacard-definitions.hooks';
function isNested(filter) {
    var nested = false;
    filter.filters.forEach(function (subfilter) {
        nested = nested || subfilter.filters;
    });
    return nested;
}
function getMatchTypeAttribute() {
    return StartupDataStore.MetacardDefinitions.getAttributeMap()[StartupDataStore.Configuration.getBasicSearchMatchType()]
        ? StartupDataStore.Configuration.getBasicSearchMatchType()
        : 'datatype';
}
function getAllValidValuesForMatchTypeAttribute() {
    var matchTypeAttr = getMatchTypeAttribute();
    return StartupDataStore.MetacardDefinitions.getEnum(matchTypeAttr).length > 0
        ? StartupDataStore.MetacardDefinitions.getEnum(matchTypeAttr).reduce(function (blob, value) {
            blob[value] = {
                label: value,
                value: value,
                class: 'icon ' + IconHelper.getClassByName(value),
            };
            return blob;
        }, {})
        : {};
}
var determinePropertiesToApplyTo = function (_a) {
    var value = _a.value;
    return value.map(function (property) {
        return {
            label: StartupDataStore.MetacardDefinitions.getAlias(property),
            value: property,
        };
    });
};
function isTypeLimiter(filter) {
    var typesFound = _.uniq(filter.filters.map(CQLUtils.getProperty));
    var metadataContentTypeSupported = Boolean(StartupDataStore.MetacardDefinitions.getAttributeMap()[METADATA_CONTENT_TYPE]);
    if (metadataContentTypeSupported) {
        return (typesFound.length === 2 &&
            typesFound.includes(METADATA_CONTENT_TYPE) &&
            typesFound.includes(getMatchTypeAttribute()));
    }
    else {
        return typesFound.length === 1 && typesFound[0] === getMatchTypeAttribute();
    }
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
function translateFilterToBasicMap(filter) {
    var propertyValueMap = {
        anyDate: [],
        anyText: [],
        anyGeo: [],
        anyType: {
            on: false,
            properties: [],
        },
    };
    var downConversion = false;
    if (!filter.filters && isAnyDate(filter)) {
        handleAnyDateFilter(propertyValueMap, filter);
    }
    if (filter.filters) {
        filter.filters.forEach(function (filter) {
            if (!filter.filters && isAnyDate(filter)) {
                handleAnyDateFilter(propertyValueMap, filter);
            }
            else if (!filter.filters) {
                propertyValueMap[CQLUtils.getProperty(filter)] =
                    propertyValueMap[CQLUtils.getProperty(filter)] || [];
                if (propertyValueMap[CQLUtils.getProperty(filter)].filter(function (existingFilter) { return existingFilter.type === filter.type; }).length === 0) {
                    propertyValueMap[CQLUtils.getProperty(filter)].push(filter);
                }
            }
            else if (!isNested(filter) && isAnyDate(filter)) {
                handleAnyDateFilter(propertyValueMap, filter);
            }
            else if (!isNested(filter) && isTypeLimiter(filter)) {
                propertyValueMap[CQLUtils.getProperty(filter.filters[0])] =
                    propertyValueMap[CQLUtils.getProperty(filter.filters[0])] || [];
                filter.filters
                    .filter(function (subfilter) {
                    return CQLUtils.getProperty(subfilter) ===
                        CQLUtils.getProperty(filter.filters[0]);
                })
                    .forEach(function (subfilter) {
                    propertyValueMap[CQLUtils.getProperty(filter.filters[0])].push(subfilter);
                });
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
    // if datatype exists, this maps to "anyType" (we expand to multiple attributes going out, but can look at just datatype when coming in)
    if (propertyValueMap.datatype) {
        propertyValueMap.anyType.on = true;
        propertyValueMap.anyType.properties = propertyValueMap.datatype
            .map(function (filter) { return filter.value; })
            .filter(function (val) { return val !== '*'; }); // allows us to depend on directly on filterTree with minimal weirdness, see constructFilterFromBasicFilter method for why this is necessary
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
var constructFilterFromBasicFilter = function (_a) {
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
    if (basicFilter.anyType.on && basicFilter.anyType.properties.length > 0) {
        filters.push(new FilterBuilderClass({
            type: 'OR',
            filters: basicFilter.anyType.properties
                .map(function (property) {
                return new FilterClass({
                    property: 'datatype',
                    value: property,
                    type: 'ILIKE',
                });
            })
                .concat(basicFilter.anyType.properties.map(function (property) {
                return new FilterClass({
                    property: 'metadata-content-type',
                    value: property,
                    type: 'ILIKE',
                });
            })),
        }));
    }
    else if (basicFilter.anyType.on) {
        // a bit of an unfortunate hack so we can depend directly on filterTree (this will only happen if properties is blank!)
        // see the anyDate part of translateFilterToBasicMap for more details
        filters.push(new FilterClass({
            property: 'datatype',
            value: '*',
            type: 'ILIKE',
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
 * We also want to update the filter tree once whenver the component is first
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
    var model = _a.model, errorListener = _a.errorListener;
    var MetacardDefinitions = useMetacardDefinitions();
    var inputRef = React.useRef();
    var basicFilter = useBasicFilterFromModel({ model: model });
    var _b = __read(React.useState(getAllValidValuesForMatchTypeAttribute()), 1), typeAttributes = _b[0];
    /**
     * Because of how things render, auto focusing to the input is more complicated than I wish.  This ensures it works everytime, whereas autoFocus prop is unreliable
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
                React.createElement(FormControlLabel, { labelPlacement: "end", control: React.createElement(Checkbox, { color: "default", checked: basicFilter.anyType.on, onChange: function (e) {
                            basicFilter.anyType.on = e.target.checked;
                            model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                        } }), label: "Types" }),
                basicFilter.anyType.on ? (React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pt-2" },
                    React.createElement(Grid, { item: true },
                        React.createElement(Swath, { className: "w-1 h-full" })),
                    React.createElement(Grid, { item: true, className: "w-full pl-2" },
                        React.createElement(Autocomplete, { fullWidth: true, multiple: true, options: Object.values(typeAttributes), disableCloseOnSelect: true, getOptionLabel: function (option) { return option.label; }, isOptionEqualToValue: function (option, value) {
                                return option.value === value.value;
                            }, onChange: function (_e, newValue) {
                                basicFilter.anyType.properties = newValue.map(function (val) { return val.value; });
                                model.set('filterTree', constructFilterFromBasicFilter({ basicFilter: basicFilter }));
                            }, size: "small", renderOption: function (props, _a) {
                                var label = _a.label, value = _a.value;
                                return (React.createElement("li", __assign({}, props),
                                    React.createElement("div", { className: "pr-2 icon ".concat(typeAttributes[value].class) }),
                                    label));
                            }, renderTags: function (tagValue, getTagProps) {
                                return tagValue.map(function (option, index) { return (React.createElement(Chip, __assign({ variant: "outlined", color: "default", label: React.createElement(React.Fragment, null,
                                        React.createElement("div", { className: "pr-2 icon ".concat(typeAttributes[option.value].class) }),
                                        option.label) }, getTagProps({ index: index })))); });
                            }, value: determinePropertiesToApplyTo({
                                value: basicFilter.anyType.properties,
                            }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { variant: "outlined" }))); } })))) : null),
            React.createElement("div", { className: "py-2 w-full" },
                React.createElement(Swath, { className: "w-full h-1" })),
            React.createElement("div", { className: "basic-settings" },
                React.createElement(QuerySettings, { model: model })))));
};
export default hot(module)(QueryBasic);
//# sourceMappingURL=query-basic.view.js.map