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
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { CustomInputOrDefault } from '../../react-component/filter/filter-input/customInputOrDefault';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
var defaultValue = {
    first: '',
    second: '',
    distance: 2,
};
var validateShape = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    if (value.distance === undefined ||
        value.first === undefined ||
        value.second === undefined) {
        onChange(defaultValue);
    }
};
export var NearField = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange });
    }, []);
    return (React.createElement(Grid, { container: true, className: "w-full", direction: "column", alignItems: "flex-start", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(CustomInputOrDefault, { value: value.second, onChange: function (val) {
                    onChange(__assign(__assign({}, value), { second: val }));
                }, props: {
                    fullWidth: true,
                    variant: 'outlined',
                    type: 'text',
                    size: 'small',
                } })),
        React.createElement(Grid, { item: true, className: "w-full pb-2 pl-2" }, "within"),
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(TextField, __assign({ fullWidth: true, type: "number", variant: "outlined", value: value.distance, onChange: function (e) {
                    onChange(__assign(__assign({}, value), { distance: Math.max(1, parseInt(e.target.value) || 0) }));
                }, size: "small" }, EnterKeySubmitProps))),
        React.createElement(Grid, { item: true, className: "w-full pb-2 pl-2" }, "of"),
        React.createElement(Grid, { item: true, className: "w-full" },
            React.createElement(CustomInputOrDefault, { value: value.first, onChange: function (val) {
                    onChange(__assign(__assign({}, value), { first: val }));
                }, props: {
                    fullWidth: true,
                    variant: 'outlined',
                    type: 'text',
                    size: 'small',
                } }))));
};
//# sourceMappingURL=near.js.map