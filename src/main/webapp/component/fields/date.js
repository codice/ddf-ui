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
import { useRef } from 'react';
import { DateInput } from '@blueprintjs/datetime';
import { DateHelpers, DefaultMaxDate, DefaultMinDate, ISO_8601_FORMAT_ZONED, } from './date-helpers';
import { MuiOutlinedInputBorderClasses } from '../theme/theme';
import useTimePrefs from './useTimePrefs';
import user from '../singletons/user-instance';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
import moment from 'moment-timezone';
var validateDate = function (_a, valueRef) {
    var value = _a.value, onChange = _a.onChange, isNullable = _a.isNullable;
    if (value === null && isNullable)
        return;
    var date = moment(value, ISO_8601_FORMAT_ZONED);
    if (!date.isValid()) {
        var newDate = DateHelpers.General.withPrecision(new Date());
        valueRef.current = newDate.toISOString();
        onChange(newDate.toISOString());
    }
};
export var DateField = function (_a) {
    var value = _a.value, onChange = _a.onChange, BPDateProps = _a.BPDateProps, isNullable = _a.isNullable;
    var valueRef = useRef(value);
    var blueprintDateRef = useRef(null);
    useTimePrefs(function () {
        var shiftedDate = DateHelpers.Blueprint.DateProps.generateValue(valueRef.current);
        var unshiftedDate = DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(shiftedDate);
        onChange(unshiftedDate.toISOString());
    });
    React.useEffect(function () {
        validateDate({ onChange: onChange, value: value, isNullable: isNullable }, valueRef);
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(DateInput, __assign({ ref: blueprintDateRef, className: MuiOutlinedInputBorderClasses, minDate: DefaultMinDate, maxDate: DefaultMaxDate, closeOnSelection: false, fill: true, formatDate: DateHelpers.Blueprint.commonProps.formatDate, onChange: DateHelpers.Blueprint.DateProps.generateOnChange(function (value) {
                valueRef.current = value;
                onChange(value);
            }), parseDate: DateHelpers.Blueprint.commonProps.parseDate, placeholder: DateHelpers.General.getDateFormat(), shortcuts: true, timePrecision: DateHelpers.General.getTimePrecision(), outOfRangeMessage: "Out of range", timePickerProps: {
                useAmPm: user.getAmPmDisplay(),
            }, inputProps: __assign({}, EnterKeySubmitProps), popoverProps: {
                boundary: 'viewport',
                position: 'bottom',
                onClose: function () {
                    setTimeout(function () {
                        var _a;
                        (_a = blueprintDateRef.current) === null || _a === void 0 ? void 0 : _a.setState({ isOpen: false });
                    }, 0);
                },
            } }, (value
            ? {
                value: DateHelpers.Blueprint.DateProps.generateValue(value),
            }
            : {}), BPDateProps))));
};
//# sourceMappingURL=date.js.map