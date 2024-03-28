import { __assign, __makeTemplateObject, __read, __spreadArray } from "tslib";
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
import React from 'react';
import styled from 'styled-components';
import Group from '../group';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Label from './label';
var Units = function (_a) {
    var value = _a.value, onChange = _a.onChange, children = _a.children;
    return (React.createElement(Group, null,
        children,
        React.createElement(Autocomplete, { fullWidth: true, disableClearable: true, options: [
                'meters',
                'kilometers',
                'feet',
                'yards',
                'miles',
                'nautical miles',
            ], renderInput: function (params) {
                return React.createElement(TextField, __assign({}, params, { label: "", variant: "outlined" }));
            }, value: value, onChange: function (_event, newVal) {
                onChange(newVal);
            }, size: "small", style: { minWidth: '200px' } })));
};
// create an array of 1-60 for zones
var range = __spreadArray([], __read(Array(61).keys()), false).map(function (val) { return val.toString(); }).slice(1);
var Zone = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    return (React.createElement(Group, null,
        React.createElement(Label, null, "Zone"),
        React.createElement(Autocomplete, { className: "w-full shrink", disableClearable: true, options: range, renderInput: function (params) {
                return React.createElement(TextField, __assign({}, params, { label: "", variant: "outlined" }));
            }, value: value.toString(), onChange: function (_event, newVal) {
                onChange(parseInt(newVal));
            }, size: "small" })));
};
var Hemisphere = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    return (React.createElement(Group, null,
        React.createElement(Label, null, "Hemisphere"),
        React.createElement(Autocomplete, { className: "w-full shrink", disableClearable: true, options: ['Northern', 'Southern'], renderInput: function (params) {
                return React.createElement(TextField, __assign({}, params, { label: "", variant: "outlined" }));
            }, value: value, onChange: function (_event, newVal) {
                onChange(newVal);
            }, size: "small" })));
};
var MinimumSpacing = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  height: ", ";\n"], ["\n  height: ", ";\n"])), function (props) { return props.theme.minimumSpacing; });
export { Units, Zone, Hemisphere, MinimumSpacing };
var templateObject_1;
//# sourceMappingURL=common.js.map