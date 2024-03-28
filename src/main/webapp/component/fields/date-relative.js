import { __assign } from "tslib";
import * as React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { NumberField } from './number';
var defaultValue = {
    last: '1',
    unit: 'm',
};
var validateShape = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    if (isInvalid({ value: value, onChange: onChange })) {
        onChange(defaultValue);
    }
};
var isInvalid = function (_a) {
    var value = _a.value;
    return value.last === undefined || value.unit === undefined;
};
export var DateRelativeField = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange });
    }, []);
    if (isInvalid({ value: value, onChange: onChange })) {
        // for most cases it doesn't matter if we render with invalid, but the select will immediately cause onChange which has some weird side effects
        return null;
    }
    return (React.createElement(Grid, { container: true, direction: "row", className: "w-full" },
        React.createElement(Grid, { item: true, xs: 4 },
            React.createElement(NumberField, __assign({ type: "float", onChange: function (val) {
                    if (onChange)
                        onChange(__assign(__assign(__assign({}, defaultValue), value), { last: val }));
                } }, (value
                ? {
                    value: value.last,
                }
                : {})))),
        React.createElement(Grid, { item: true, xs: 8, className: "pl-2" },
            React.createElement(TextField, { fullWidth: true, variant: "outlined", select: true, onChange: function (e) {
                    if (onChange)
                        onChange(__assign(__assign(__assign({}, defaultValue), value), { unit: e.target.value }));
                }, size: "small", value: value.unit },
                React.createElement(MenuItem, { value: "s" }, "Seconds"),
                React.createElement(MenuItem, { value: "m" }, "Minutes"),
                React.createElement(MenuItem, { value: "h" }, "Hours"),
                React.createElement(MenuItem, { value: "d" }, "Days"),
                React.createElement(MenuItem, { value: "w" }, "Weeks"),
                React.createElement(MenuItem, { value: "M" }, "Months"),
                React.createElement(MenuItem, { value: "y" }, "Years")))));
};
//# sourceMappingURL=date-relative.js.map