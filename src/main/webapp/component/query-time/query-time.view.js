import { __assign } from "tslib";
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
/* eslint-disable no-var */
import * as React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { hot } from 'react-hot-loader';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Swath from '../swath/swath';
import FilterInput from '../../react-component/filter/filter-input';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { StartupDataStore } from '../../js/model/Startup/startup';
var getPossibleProperties = function () {
    return StartupDataStore.MetacardDefinitions.getSortedAttributes()
        .filter(function (definition) { return !definition.hidden && definition.type === 'DATE'; })
        .map(function (definition) { return ({
        label: definition.alias || definition.id,
        value: definition.id,
    }); });
};
var getDefaultPropertiesToApplyTo = function () {
    return (StartupDataStore.Configuration.getBasicSearchTemporalSelectionDefault() ||
        []).map(function (property) {
        return {
            label: StartupDataStore.MetacardDefinitions.getAlias(property),
            value: property,
        };
    });
};
var determinePropertiesToApplyTo = function (_a) {
    var value = _a.value;
    if (value.property) {
        return value.property
            .filter(function (prop) { return prop !== 'anyDate'; })
            .map(function (property) {
            return {
                label: StartupDataStore.MetacardDefinitions.getAlias(property),
                value: property,
            };
        });
    }
    else {
        return getDefaultPropertiesToApplyTo();
    }
};
var QueryTime = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    React.useEffect(function () {
        if (value && value.property === undefined) {
            onChange(__assign(__assign({}, value), { property: determinePropertiesToApplyTo({ value: value }).map(function (val) { return val.value; }) }));
        }
    }, [value]);
    if (value && value.property === undefined) {
        return null; // the use effect above should fire to take care of setting a default
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", null,
            React.createElement(FormControlLabel, { labelPlacement: "end", control: React.createElement(Checkbox, { color: "default", checked: value ? true : false, onChange: function (e) {
                        if (e.target.checked) {
                            onChange(__assign(__assign({}, value), { type: 'AFTER', property: getDefaultPropertiesToApplyTo().map(function (val) { return val.value; }) }));
                        }
                        else {
                            onChange(undefined);
                        }
                    } }), label: "Time" }),
            value ? (React.createElement(Grid, { container: true, alignItems: "stretch", direction: "column", wrap: "nowrap", className: "pt-2" },
                React.createElement(Grid, { item: true, className: "w-full pb-2" },
                    React.createElement(Autocomplete, { fullWidth: true, multiple: true, options: getPossibleProperties(), disableCloseOnSelect: true, getOptionLabel: function (option) { return option.label; }, isOptionEqualToValue: function (option, value) {
                            return option.value === value.value;
                        }, onChange: function (_e, newValue) {
                            onChange(__assign(__assign({}, value), { property: newValue.map(function (val) { return val.value; }) }));
                        }, size: "small", renderTags: function (tagValue, getTagProps) {
                            return tagValue.map(function (option, index) { return (React.createElement(Chip, __assign({ variant: "outlined", color: "default", label: option.label }, getTagProps({ index: index })))); });
                        }, value: determinePropertiesToApplyTo({ value: value }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { variant: "outlined" }))); } })),
                React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pt-2" },
                    React.createElement(Grid, { item: true },
                        React.createElement(Swath, { className: "w-1 h-full" })),
                    React.createElement(Grid, { container: true, direction: "column" },
                        React.createElement(Grid, { item: true, className: "w-full pl-2 pb-2" },
                            React.createElement(TextField, { fullWidth: true, variant: "outlined", size: "small", select: true, value: value.type, onChange: function (e) {
                                    onChange(__assign(__assign({}, value), { type: e.target.value }));
                                } },
                                React.createElement(MenuItem, { value: "AFTER" }, "After"),
                                React.createElement(MenuItem, { value: "BEFORE" }, "Before"),
                                React.createElement(MenuItem, { value: "DURING" }, "Between"),
                                React.createElement(MenuItem, { value: "RELATIVE" }, "Within the last"),
                                React.createElement(MenuItem, { value: "AROUND" }, "Around"))),
                        React.createElement(Grid, { item: true, className: "w-full pl-2" },
                            React.createElement(FilterInput, { filter: __assign(__assign({}, value), { property: value.property[0] }), setFilter: function (val) {
                                    onChange(__assign(__assign({}, value), { value: val.value }));
                                } })))))) : null)));
};
export default hot(module)(QueryTime);
//# sourceMappingURL=query-time.view.js.map