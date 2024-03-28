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
import { DateRangeInput } from '@blueprintjs/datetime';
import { DateHelpers, DefaultMaxDate, DefaultMinDate } from './date-helpers';
import { MuiOutlinedInputBorderClasses } from '../theme/theme';
import useTimePrefs from './useTimePrefs';
import user from '../singletons/user-instance';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
var validateDates = function (_a, valueRef) {
    var value = _a.value, onChange = _a.onChange;
    if (value === undefined ||
        value.start === undefined ||
        value.end === undefined) {
        var end = DateHelpers.General.withPrecision(new Date());
        var start = DateHelpers.General.withPrecision(new Date(end.valueOf() - 86400000)); // start and end can't be equal or the backend will throw a fit
        var newValue = {
            start: start.toISOString(),
            end: end.toISOString(),
        };
        valueRef.current = newValue;
        onChange(newValue);
    }
};
export var DateRangeField = function (_a) {
    var value = _a.value, onChange = _a.onChange, BPDateRangeProps = _a.BPDateRangeProps;
    var valueRef = React.useRef(value);
    useTimePrefs(function () {
        var shiftedDates = DateHelpers.Blueprint.DateRangeProps.generateValue(valueRef.current);
        onChange({
            start: DateHelpers.Blueprint.converters
                .UntimeshiftFromDatePicker(shiftedDates[0])
                .toISOString(),
            end: DateHelpers.Blueprint.converters
                .UntimeshiftFromDatePicker(shiftedDates[1])
                .toISOString(),
        });
    });
    React.useEffect(function () {
        validateDates({ value: value, onChange: onChange, BPDateRangeProps: BPDateRangeProps }, valueRef);
    }, []);
    return (React.createElement(DateRangeInput, __assign({ timePickerProps: {
            useAmPm: user.getAmPmDisplay(),
        }, allowSingleDayRange: true, minDate: DefaultMinDate, maxDate: DefaultMaxDate, endInputProps: __assign({ fill: true, className: MuiOutlinedInputBorderClasses }, EnterKeySubmitProps), startInputProps: __assign({ fill: true, className: MuiOutlinedInputBorderClasses }, EnterKeySubmitProps), className: "where", closeOnSelection: false, formatDate: DateHelpers.Blueprint.commonProps.formatDate, onChange: DateHelpers.Blueprint.DateRangeProps.generateOnChange(function (value) {
            valueRef.current = value;
            onChange(value);
        }), popoverProps: {
            boundary: 'viewport',
            position: 'bottom',
        }, parseDate: DateHelpers.Blueprint.commonProps.parseDate, shortcuts: true, timePrecision: DateHelpers.General.getTimePrecision(), placeholder: DateHelpers.General.getDateFormat() }, (value
        ? {
            value: DateHelpers.Blueprint.DateRangeProps.generateValue(value),
        }
        : {}), BPDateRangeProps)));
};
//# sourceMappingURL=date-range.js.map