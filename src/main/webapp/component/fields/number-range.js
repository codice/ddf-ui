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
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
var defaultValue = {
    start: 0,
    end: 1,
};
var validateShape = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    if (value.start === undefined || value.end === undefined) {
        onChange(defaultValue);
    }
};
export var NumberRangeField = function (_a) {
    var value = _a.value, onChange = _a.onChange, type = _a.type;
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange, type: type });
    }, []);
    return (React.createElement(Grid, { container: true, direction: "column" },
        React.createElement(Grid, { item: true, className: "w-full py-1" },
            React.createElement("div", null, "from")),
        React.createElement(Grid, { item: true },
            React.createElement(TextField, __assign({ fullWidth: true, variant: "outlined", value: value.start, placeholder: "lower bound", type: "number", onChange: function (e) {
                    var newVal = type === 'integer'
                        ? parseInt(e.target.value)
                        : parseFloat(e.target.value);
                    onChange(__assign(__assign({}, value), { start: newVal }));
                }, size: "small" }, EnterKeySubmitProps))),
        React.createElement(Grid, { item: true, className: "w-full py-1" },
            React.createElement("div", null, "to")),
        React.createElement(Grid, { item: true },
            React.createElement(TextField, __assign({ fullWidth: true, variant: "outlined", placeholder: "upper bound", value: value.end, type: "number", onChange: function (e) {
                    var newVal = type === 'integer'
                        ? parseInt(e.target.value)
                        : parseFloat(e.target.value);
                    onChange(__assign(__assign({}, value), { end: newVal }));
                }, size: "small" }, EnterKeySubmitProps)))));
};
//# sourceMappingURL=number-range.js.map