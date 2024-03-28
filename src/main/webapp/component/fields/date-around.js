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
import { DateInput } from '@blueprintjs/datetime';
import { DateHelpers, DefaultMaxDate, DefaultMinDate } from './date-helpers';
import { MuiOutlinedInputBorderClasses } from '../theme/theme';
import useTimePrefs from './useTimePrefs';
import Grid from '@mui/material/Grid/Grid';
import { NumberField } from './number';
import TextField from '@mui/material/TextField/TextField';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import user from '../singletons/user-instance';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
var defaultValue = function () {
    return {
        date: new Date().toISOString(),
        buffer: {
            amount: '1',
            unit: 'd',
        },
        direction: 'both',
    };
};
var validateDate = function (_a, dateRef) {
    var value = _a.value, onChange = _a.onChange;
    if (!value.date ||
        !value.buffer ||
        !value.direction ||
        DateHelpers.Blueprint.commonProps.parseDate(value.date) === null) {
        var newDate = DateHelpers.General.withPrecision(new Date());
        dateRef.current = newDate.toISOString();
        onChange(__assign(__assign({}, defaultValue()), { date: newDate.toISOString() }));
    }
};
export var DateAroundField = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    var dateRef = React.useRef(value.date);
    var blueprintDateRef = React.useRef(null);
    useTimePrefs(function () {
        var shiftedDate = DateHelpers.Blueprint.DateProps.generateValue(dateRef.current);
        var unshiftedDate = DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(shiftedDate);
        dateRef.current = unshiftedDate.toISOString();
        onChange(__assign(__assign(__assign({}, defaultValue()), value), { date: unshiftedDate.toISOString() }));
    });
    React.useEffect(function () {
        validateDate({ onChange: onChange, value: value }, dateRef);
    }, []);
    return (React.createElement(Grid, { container: true, alignItems: "stretch", direction: "column", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(DateInput, __assign({ ref: blueprintDateRef, timePickerProps: {
                    useAmPm: user.getAmPmDisplay(),
                }, className: MuiOutlinedInputBorderClasses, minDate: DefaultMinDate, maxDate: DefaultMaxDate, closeOnSelection: false, fill: true, formatDate: DateHelpers.Blueprint.commonProps.formatDate, onChange: DateHelpers.Blueprint.DateProps.generateOnChange(function (date) {
                    dateRef.current = date;
                    onChange(__assign(__assign(__assign({}, defaultValue()), value), { date: date }));
                }), parseDate: DateHelpers.Blueprint.commonProps.parseDate, placeholder: DateHelpers.General.getDateFormat(), shortcuts: true, timePrecision: DateHelpers.General.getTimePrecision(), inputProps: __assign({}, EnterKeySubmitProps), popoverProps: {
                    boundary: 'viewport',
                    position: 'bottom',
                    onClose: function () {
                        setTimeout(function () {
                            var _a;
                            (_a = blueprintDateRef.current) === null || _a === void 0 ? void 0 : _a.setState({ isOpen: false });
                        }, 0);
                    },
                } }, (value.date
                ? {
                    value: DateHelpers.Blueprint.DateProps.generateValue(value.date),
                }
                : {})))),
        React.createElement(Grid, { item: true, className: "w-full pb-2" }, "with buffer of"),
        React.createElement(Grid, { container: true, direction: "row", className: "w-full" },
            React.createElement(Grid, { item: true, xs: 4, className: "pb-2" },
                React.createElement(NumberField, __assign({ type: "float", onChange: function (val) {
                        if (onChange)
                            onChange(__assign(__assign(__assign({}, defaultValue()), value), { buffer: __assign(__assign(__assign({}, defaultValue().buffer), value.buffer), { amount: val }) }));
                    } }, (value.buffer
                    ? {
                        value: value.buffer.amount,
                    }
                    : {})))),
            React.createElement(Grid, { item: true, xs: 8, className: "pl-2" },
                React.createElement(TextField, __assign({ fullWidth: true, variant: "outlined", select: true, onChange: function (e) {
                        if (onChange)
                            onChange(__assign(__assign(__assign({}, defaultValue()), value), { buffer: __assign(__assign(__assign({}, defaultValue().buffer), value.buffer), { unit: e.target
                                        .value }) }));
                    }, size: "small" }, (value.buffer
                    ? {
                        value: value.buffer.unit,
                    }
                    : { value: 'd' })),
                    React.createElement(MenuItem, { value: "s" }, "Seconds"),
                    React.createElement(MenuItem, { value: "m" }, "Minutes"),
                    React.createElement(MenuItem, { value: "h" }, "Hours"),
                    React.createElement(MenuItem, { value: "d" }, "Days"),
                    React.createElement(MenuItem, { value: "w" }, "Weeks"),
                    React.createElement(MenuItem, { value: "M" }, "Months"),
                    React.createElement(MenuItem, { value: "y" }, "Years")))),
        React.createElement(TextField, { variant: "outlined", select: true, value: value.direction || 'both', onChange: function (e) {
                if (onChange)
                    onChange(__assign(__assign(__assign({}, defaultValue()), value), { direction: e.target.value }));
            }, size: "small" },
            React.createElement(MenuItem, { value: "both" }, "Before and After"),
            React.createElement(MenuItem, { value: "before" }, "Before"),
            React.createElement(MenuItem, { value: "after" }, "After"))));
};
//# sourceMappingURL=date-around.js.map