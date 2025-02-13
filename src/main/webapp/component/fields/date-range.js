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
import { DateRangeInput } from '@blueprintjs/datetime';
import { DateHelpers, DefaultMaxDate, DefaultMinDate } from './date-helpers';
import { MuiOutlinedInputBorderClasses } from '../theme/theme';
import useTimePrefs from './useTimePrefs';
import user from '../singletons/user-instance';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
export function defaultValue() {
    var end = DateHelpers.General.withPrecision(new Date());
    var start = DateHelpers.General.withPrecision(new Date(end.valueOf() - 86400000)); // start and end can't be equal or the backend will throw a fit
    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}
/**
 *  Used in the below components to test values for validity and to provide a message to the user if they are invalid.
 */
function isValidValue(value) {
    if (value && value.start && value.end) {
        // end has to be after start too, so convert from iso and check
        var startDate = new Date(value.start);
        var endDate = new Date(value.end);
        return {
            valid: startDate < endDate,
            message: 'Start date must be before end date, using previous valid values:',
        };
    }
    else {
        return {
            valid: false,
            message: 'Start and end date must be set, using previous valid values:',
        };
    }
}
/**
 *  There are two things to check before passing values upwards to parent components through the onChange.
 *  1.  Start and end date need to be valid dates.
 *  2.  Start date must be before end date. (cannot be equal either)
 *
 *  Given those possibilities, we can construct a message to try and prod the user as to why a value is invalid.
 */
function useLocalValue(_a) {
    var value = _a.value, onChange = _a.onChange;
    var _b = __read(React.useState(value), 2), localValue = _b[0], setLocalValue = _b[1]; // since we don't get here with an invalid value, we can just set it to the value
    var _c = __read(React.useState(false), 2), hasValidationIssues = _c[0], setHasValidationIssues = _c[1];
    var _d = __read(React.useState(null), 2), constructedValidationText = _d[0], setConstructedValidationText = _d[1];
    React.useEffect(function () {
        var validity = isValidValue(localValue);
        if (onChange && validity.valid) {
            setHasValidationIssues(false);
            setConstructedValidationText('');
            if (value !== localValue)
                onChange(localValue);
        }
        else {
            setConstructedValidationText(React.createElement(React.Fragment, null,
                React.createElement("div", null, validity.message),
                React.createElement("div", null,
                    "start: ",
                    value.start),
                React.createElement("div", null,
                    "end: ",
                    value.end)));
            setHasValidationIssues(true);
        }
    }, [localValue, value]);
    return {
        localValue: localValue,
        setLocalValue: setLocalValue,
        hasValidationIssues: hasValidationIssues,
        constructedValidationText: constructedValidationText,
    };
}
/**
 *  If the initial value is invalid, we immediately call the onChange to make sure we start with a valid value.
 */
function useInitialValueValidation(_a) {
    var value = _a.value, onChange = _a.onChange;
    React.useEffect(function () {
        if (!isValidValue(value).valid) {
            onChange(defaultValue());
        }
    }, []);
}
/**
 *  This component will always have a valid value (start and end date set and start < end), and onChange will never get an invalid value
 */
var DateRangeFieldWithoutInitialValidation = function (_a) {
    var value = _a.value, onChange = _a.onChange, BPDateRangeProps = _a.BPDateRangeProps;
    var _b = useLocalValue({ value: value, onChange: onChange }), localValue = _b.localValue, setLocalValue = _b.setLocalValue, hasValidationIssues = _b.hasValidationIssues, constructedValidationText = _b.constructedValidationText;
    useTimePrefs(function () {
        var shiftedDates = DateHelpers.Blueprint.DateRangeProps.generateValue(value); // as said above, this will always be valid, so no need to fret on converting
        setLocalValue({
            start: DateHelpers.Blueprint.converters
                .UntimeshiftFromDatePicker(shiftedDates[0])
                .toISOString(),
            end: DateHelpers.Blueprint.converters
                .UntimeshiftFromDatePicker(shiftedDates[1])
                .toISOString(),
        });
    });
    return (React.createElement(React.Fragment, null,
        React.createElement(DateRangeInput, __assign({ timePickerProps: {
                useAmPm: user.getAmPmDisplay(),
            }, allowSingleDayRange: true, minDate: DefaultMinDate, maxDate: DefaultMaxDate, endInputProps: __assign({ fill: true, className: MuiOutlinedInputBorderClasses }, EnterKeySubmitProps), startInputProps: __assign({ fill: true, className: MuiOutlinedInputBorderClasses }, EnterKeySubmitProps), className: "where", closeOnSelection: false, formatDate: DateHelpers.Blueprint.commonProps.formatDate, onChange: DateHelpers.Blueprint.DateRangeProps.generateOnChange(function (value) {
                setLocalValue(value);
            }), popoverProps: {
                boundary: 'viewport',
                position: 'bottom',
            }, parseDate: DateHelpers.Blueprint.commonProps.parseDate, shortcuts: true, timePrecision: DateHelpers.General.getTimePrecision(), placeholder: DateHelpers.General.getDateFormat(), value: DateHelpers.Blueprint.DateRangeProps.generateValue(localValue) }, BPDateRangeProps)),
        hasValidationIssues ? (React.createElement(React.Fragment, null,
            React.createElement(FormHelperText, { className: "px-2 Mui-text-error" }, constructedValidationText))) : null));
};
/**
 *  By updating invalid starting values before we go into the above component, we can make sure we always have a valid value to fall back to.
 */
export var DateRangeField = function (_a) {
    var value = _a.value, onChange = _a.onChange, BPDateRangeProps = _a.BPDateRangeProps;
    useInitialValueValidation({ value: value, onChange: onChange, BPDateRangeProps: BPDateRangeProps });
    var valueValidity = isValidValue(value);
    if (!valueValidity.valid) {
        return React.createElement(LinearProgress, { className: "w-full h-2" });
    }
    return (React.createElement(DateRangeFieldWithoutInitialValidation, { value: value, onChange: onChange, BPDateRangeProps: BPDateRangeProps }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmllbGRzL2RhdGUtcmFuZ2UudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLGNBQWMsRUFBd0IsTUFBTSx1QkFBdUIsQ0FBQTtBQUM1RSxPQUFPLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUU1RSxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUM5RCxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUV6QyxPQUFPLElBQUksTUFBTSw2QkFBNkIsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUN2RSxPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQUN6RCxPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQVd6RCxNQUFNLFVBQVUsWUFBWTtJQUMxQixJQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUE7SUFDekQsSUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQzdDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxRQUFVLENBQUMsQ0FDckMsQ0FBQSxDQUFDLCtEQUErRDtJQUNqRSxPQUFPO1FBQ0wsS0FBSyxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUU7UUFDMUIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUU7S0FDdkIsQ0FBQTtBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsWUFBWSxDQUFDLEtB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QVMsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUN0RCxTQUFTLFFBQ1QsYUFBYSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFDckQsV0FBVyxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQ2hELEtBQUssRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQ2pFLGdCQUFnQixFQUNwQjtRQUNELG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUNyQjtZQUNFLG9CQUFDLGNBQWMsSUFBQyxTQUFTLEVBQUMscUJBQXFCLElBQzVDLHlCQUF5QixDQUNYLENBQ2hCLENBQ0osQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNQLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLFVBQUMsRUFJdkI7UUFITixLQUFLLFdBQUEsRUFDTCxRQUFRLGNBQUEsRUFDUixnQkFBZ0Isc0JBQUE7SUFFaEIseUJBQXlCLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxnQkFBZ0Isa0JBQUEsRUFBRSxDQUFDLENBQUE7SUFDaEUsSUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFO1FBQ3hCLE9BQU8sb0JBQUMsY0FBYyxJQUFDLFNBQVMsRUFBQyxZQUFZLEdBQUcsQ0FBQTtLQUNqRDtJQUNELE9BQU8sQ0FDTCxvQkFBQyxzQ0FBc0MsSUFDckMsS0FBSyxFQUFFLEtBQUssRUFDWixRQUFRLEVBQUUsUUFBUSxFQUNsQixnQkFBZ0IsRUFBRSxnQkFBZ0IsR0FDbEMsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IERhdGVSYW5nZUlucHV0LCBJRGF0ZVJhbmdlSW5wdXRQcm9wcyB9IGZyb20gJ0BibHVlcHJpbnRqcy9kYXRldGltZSdcbmltcG9ydCB7IERhdGVIZWxwZXJzLCBEZWZhdWx0TWF4RGF0ZSwgRGVmYXVsdE1pbkRhdGUgfSBmcm9tICcuL2RhdGUtaGVscGVycydcbmltcG9ydCB7IFZhbHVlVHlwZXMgfSBmcm9tICcuLi9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IHsgTXVpT3V0bGluZWRJbnB1dEJvcmRlckNsYXNzZXMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcbmltcG9ydCB1c2VUaW1lUHJlZnMgZnJvbSAnLi91c2VUaW1lUHJlZnMnXG5cbmltcG9ydCB1c2VyIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCB7IEVudGVyS2V5U3VibWl0UHJvcHMgfSBmcm9tICcuLi9jdXN0b20tZXZlbnRzL2VudGVyLWtleS1zdWJtaXQnXG5pbXBvcnQgRm9ybUhlbHBlclRleHQgZnJvbSAnQG11aS9tYXRlcmlhbC9Gb3JtSGVscGVyVGV4dCdcbmltcG9ydCBMaW5lYXJQcm9ncmVzcyBmcm9tICdAbXVpL21hdGVyaWFsL0xpbmVhclByb2dyZXNzJ1xuXG50eXBlIFByb3BzID0ge1xuICB2YWx1ZTogVmFsdWVUeXBlc1snZHVyaW5nJ11cbiAgb25DaGFuZ2U6ICh2YWx1ZTogVmFsdWVUeXBlc1snZHVyaW5nJ10pID0+IHZvaWRcbiAgLyoqXG4gICAqIE92ZXJyaWRlIGlmIHlvdSBhYnNvbHV0ZWx5IG11c3RcbiAgICovXG4gIEJQRGF0ZVJhbmdlUHJvcHM/OiBQYXJ0aWFsPElEYXRlUmFuZ2VJbnB1dFByb3BzPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdFZhbHVlKCkge1xuICBjb25zdCBlbmQgPSBEYXRlSGVscGVycy5HZW5lcmFsLndpdGhQcmVjaXNpb24obmV3IERhdGUoKSlcbiAgY29uc3Qgc3RhcnQgPSBEYXRlSGVscGVycy5HZW5lcmFsLndpdGhQcmVjaXNpb24oXG4gICAgbmV3IERhdGUoZW5kLnZhbHVlT2YoKSAtIDg2XzQwMF8wMDApXG4gICkgLy8gc3RhcnQgYW5kIGVuZCBjYW4ndCBiZSBlcXVhbCBvciB0aGUgYmFja2VuZCB3aWxsIHRocm93IGEgZml0XG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IHN0YXJ0LnRvSVNPU3RyaW5nKCksXG4gICAgZW5kOiBlbmQudG9JU09TdHJpbmcoKSxcbiAgfVxufVxuXG4vKipcbiAqICBVc2VkIGluIHRoZSBiZWxvdyBjb21wb25lbnRzIHRvIHRlc3QgdmFsdWVzIGZvciB2YWxpZGl0eSBhbmQgdG8gcHJvdmlkZSBhIG1lc3NhZ2UgdG8gdGhlIHVzZXIgaWYgdGhleSBhcmUgaW52YWxpZC5cbiAqL1xuZnVuY3Rpb24gaXNWYWxpZFZhbHVlKHZhbHVlOiBQcm9wc1sndmFsdWUnXSk6IHtcbiAgdmFsaWQ6IGJvb2xlYW5cbiAgbWVzc2FnZTogc3RyaW5nXG59IHtcbiAgaWYgKHZhbHVlICYmIHZhbHVlLnN0YXJ0ICYmIHZhbHVlLmVuZCkge1xuICAgIC8vIGVuZCBoYXMgdG8gYmUgYWZ0ZXIgc3RhcnQgdG9vLCBzbyBjb252ZXJ0IGZyb20gaXNvIGFuZCBjaGVja1xuICAgIGNvbnN0IHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnN0YXJ0KVxuICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZSh2YWx1ZS5lbmQpXG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiBzdGFydERhdGUgPCBlbmREYXRlLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgJ1N0YXJ0IGRhdGUgbXVzdCBiZSBiZWZvcmUgZW5kIGRhdGUsIHVzaW5nIHByZXZpb3VzIHZhbGlkIHZhbHVlczonLFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgbWVzc2FnZTogJ1N0YXJ0IGFuZCBlbmQgZGF0ZSBtdXN0IGJlIHNldCwgdXNpbmcgcHJldmlvdXMgdmFsaWQgdmFsdWVzOicsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogIFRoZXJlIGFyZSB0d28gdGhpbmdzIHRvIGNoZWNrIGJlZm9yZSBwYXNzaW5nIHZhbHVlcyB1cHdhcmRzIHRvIHBhcmVudCBjb21wb25lbnRzIHRocm91Z2ggdGhlIG9uQ2hhbmdlLlxuICogIDEuICBTdGFydCBhbmQgZW5kIGRhdGUgbmVlZCB0byBiZSB2YWxpZCBkYXRlcy5cbiAqICAyLiAgU3RhcnQgZGF0ZSBtdXN0IGJlIGJlZm9yZSBlbmQgZGF0ZS4gKGNhbm5vdCBiZSBlcXVhbCBlaXRoZXIpXG4gKlxuICogIEdpdmVuIHRob3NlIHBvc3NpYmlsaXRpZXMsIHdlIGNhbiBjb25zdHJ1Y3QgYSBtZXNzYWdlIHRvIHRyeSBhbmQgcHJvZCB0aGUgdXNlciBhcyB0byB3aHkgYSB2YWx1ZSBpcyBpbnZhbGlkLlxuICovXG5mdW5jdGlvbiB1c2VMb2NhbFZhbHVlKHsgdmFsdWUsIG9uQ2hhbmdlIH06IFByb3BzKSB7XG4gIGNvbnN0IFtsb2NhbFZhbHVlLCBzZXRMb2NhbFZhbHVlXSA9IFJlYWN0LnVzZVN0YXRlPFByb3BzWyd2YWx1ZSddPih2YWx1ZSkgLy8gc2luY2Ugd2UgZG9uJ3QgZ2V0IGhlcmUgd2l0aCBhbiBpbnZhbGlkIHZhbHVlLCB3ZSBjYW4ganVzdCBzZXQgaXQgdG8gdGhlIHZhbHVlXG4gIGNvbnN0IFtoYXNWYWxpZGF0aW9uSXNzdWVzLCBzZXRIYXNWYWxpZGF0aW9uSXNzdWVzXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dCwgc2V0Q29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPFJlYWN0LlJlYWN0Tm9kZT4obnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHZhbGlkaXR5ID0gaXNWYWxpZFZhbHVlKGxvY2FsVmFsdWUpXG4gICAgaWYgKG9uQ2hhbmdlICYmIHZhbGlkaXR5LnZhbGlkKSB7XG4gICAgICBzZXRIYXNWYWxpZGF0aW9uSXNzdWVzKGZhbHNlKVxuICAgICAgc2V0Q29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dCgnJylcbiAgICAgIGlmICh2YWx1ZSAhPT0gbG9jYWxWYWx1ZSkgb25DaGFuZ2UobG9jYWxWYWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0Q29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dChcbiAgICAgICAgPD5cbiAgICAgICAgICA8ZGl2Pnt2YWxpZGl0eS5tZXNzYWdlfTwvZGl2PlxuICAgICAgICAgIDxkaXY+c3RhcnQ6IHt2YWx1ZS5zdGFydH08L2Rpdj5cbiAgICAgICAgICA8ZGl2PmVuZDoge3ZhbHVlLmVuZH08L2Rpdj5cbiAgICAgICAgPC8+XG4gICAgICApXG4gICAgICBzZXRIYXNWYWxpZGF0aW9uSXNzdWVzKHRydWUpXG4gICAgfVxuICB9LCBbbG9jYWxWYWx1ZSwgdmFsdWVdKVxuXG4gIHJldHVybiB7XG4gICAgbG9jYWxWYWx1ZSxcbiAgICBzZXRMb2NhbFZhbHVlLFxuICAgIGhhc1ZhbGlkYXRpb25Jc3N1ZXMsXG4gICAgY29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dCxcbiAgfVxufVxuXG4vKipcbiAqICBJZiB0aGUgaW5pdGlhbCB2YWx1ZSBpcyBpbnZhbGlkLCB3ZSBpbW1lZGlhdGVseSBjYWxsIHRoZSBvbkNoYW5nZSB0byBtYWtlIHN1cmUgd2Ugc3RhcnQgd2l0aCBhIHZhbGlkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB1c2VJbml0aWFsVmFsdWVWYWxpZGF0aW9uKHsgdmFsdWUsIG9uQ2hhbmdlIH06IFByb3BzKSB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFpc1ZhbGlkVmFsdWUodmFsdWUpLnZhbGlkKSB7XG4gICAgICBvbkNoYW5nZShkZWZhdWx0VmFsdWUoKSlcbiAgICB9XG4gIH0sIFtdKVxufVxuXG4vKipcbiAqICBUaGlzIGNvbXBvbmVudCB3aWxsIGFsd2F5cyBoYXZlIGEgdmFsaWQgdmFsdWUgKHN0YXJ0IGFuZCBlbmQgZGF0ZSBzZXQgYW5kIHN0YXJ0IDwgZW5kKSwgYW5kIG9uQ2hhbmdlIHdpbGwgbmV2ZXIgZ2V0IGFuIGludmFsaWQgdmFsdWVcbiAqL1xuY29uc3QgRGF0ZVJhbmdlRmllbGRXaXRob3V0SW5pdGlhbFZhbGlkYXRpb24gPSAoe1xuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG4gIEJQRGF0ZVJhbmdlUHJvcHMsXG59OiBQcm9wcykgPT4ge1xuICBjb25zdCB7XG4gICAgbG9jYWxWYWx1ZSxcbiAgICBzZXRMb2NhbFZhbHVlLFxuICAgIGhhc1ZhbGlkYXRpb25Jc3N1ZXMsXG4gICAgY29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dCxcbiAgfSA9IHVzZUxvY2FsVmFsdWUoeyB2YWx1ZSwgb25DaGFuZ2UgfSlcbiAgdXNlVGltZVByZWZzKCgpID0+IHtcbiAgICBjb25zdCBzaGlmdGVkRGF0ZXMgPVxuICAgICAgRGF0ZUhlbHBlcnMuQmx1ZXByaW50LkRhdGVSYW5nZVByb3BzLmdlbmVyYXRlVmFsdWUodmFsdWUpIC8vIGFzIHNhaWQgYWJvdmUsIHRoaXMgd2lsbCBhbHdheXMgYmUgdmFsaWQsIHNvIG5vIG5lZWQgdG8gZnJldCBvbiBjb252ZXJ0aW5nXG4gICAgc2V0TG9jYWxWYWx1ZSh7XG4gICAgICBzdGFydDogRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnNcbiAgICAgICAgLlVudGltZXNoaWZ0RnJvbURhdGVQaWNrZXIoc2hpZnRlZERhdGVzIVswXSEpXG4gICAgICAgIC50b0lTT1N0cmluZygpLFxuICAgICAgZW5kOiBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29udmVydGVyc1xuICAgICAgICAuVW50aW1lc2hpZnRGcm9tRGF0ZVBpY2tlcihzaGlmdGVkRGF0ZXMhWzFdISlcbiAgICAgICAgLnRvSVNPU3RyaW5nKCksXG4gICAgfSlcbiAgfSlcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPERhdGVSYW5nZUlucHV0XG4gICAgICAgIHRpbWVQaWNrZXJQcm9wcz17e1xuICAgICAgICAgIHVzZUFtUG06IHVzZXIuZ2V0QW1QbURpc3BsYXkoKSxcbiAgICAgICAgfX1cbiAgICAgICAgYWxsb3dTaW5nbGVEYXlSYW5nZVxuICAgICAgICBtaW5EYXRlPXtEZWZhdWx0TWluRGF0ZX1cbiAgICAgICAgbWF4RGF0ZT17RGVmYXVsdE1heERhdGV9XG4gICAgICAgIGVuZElucHV0UHJvcHM9e3tcbiAgICAgICAgICBmaWxsOiB0cnVlLFxuICAgICAgICAgIGNsYXNzTmFtZTogTXVpT3V0bGluZWRJbnB1dEJvcmRlckNsYXNzZXMsXG4gICAgICAgICAgLi4uRW50ZXJLZXlTdWJtaXRQcm9wcyxcbiAgICAgICAgfX1cbiAgICAgICAgc3RhcnRJbnB1dFByb3BzPXt7XG4gICAgICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgICAgICBjbGFzc05hbWU6IE11aU91dGxpbmVkSW5wdXRCb3JkZXJDbGFzc2VzLFxuICAgICAgICAgIC4uLkVudGVyS2V5U3VibWl0UHJvcHMsXG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT1cIndoZXJlXCJcbiAgICAgICAgY2xvc2VPblNlbGVjdGlvbj17ZmFsc2V9XG4gICAgICAgIGZvcm1hdERhdGU9e0RhdGVIZWxwZXJzLkJsdWVwcmludC5jb21tb25Qcm9wcy5mb3JtYXREYXRlfVxuICAgICAgICBvbkNoYW5nZT17RGF0ZUhlbHBlcnMuQmx1ZXByaW50LkRhdGVSYW5nZVByb3BzLmdlbmVyYXRlT25DaGFuZ2UoXG4gICAgICAgICAgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBzZXRMb2NhbFZhbHVlKHZhbHVlKVxuICAgICAgICAgIH1cbiAgICAgICAgKX1cbiAgICAgICAgcG9wb3ZlclByb3BzPXt7XG4gICAgICAgICAgYm91bmRhcnk6ICd2aWV3cG9ydCcsXG4gICAgICAgICAgcG9zaXRpb246ICdib3R0b20nLFxuICAgICAgICB9fVxuICAgICAgICBwYXJzZURhdGU9e0RhdGVIZWxwZXJzLkJsdWVwcmludC5jb21tb25Qcm9wcy5wYXJzZURhdGV9XG4gICAgICAgIHNob3J0Y3V0c1xuICAgICAgICB0aW1lUHJlY2lzaW9uPXtEYXRlSGVscGVycy5HZW5lcmFsLmdldFRpbWVQcmVjaXNpb24oKX1cbiAgICAgICAgcGxhY2Vob2xkZXI9e0RhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0RGF0ZUZvcm1hdCgpfVxuICAgICAgICB2YWx1ZT17RGF0ZUhlbHBlcnMuQmx1ZXByaW50LkRhdGVSYW5nZVByb3BzLmdlbmVyYXRlVmFsdWUobG9jYWxWYWx1ZSl9XG4gICAgICAgIHsuLi5CUERhdGVSYW5nZVByb3BzfVxuICAgICAgLz5cbiAgICAgIHtoYXNWYWxpZGF0aW9uSXNzdWVzID8gKFxuICAgICAgICA8PlxuICAgICAgICAgIDxGb3JtSGVscGVyVGV4dCBjbGFzc05hbWU9XCJweC0yIE11aS10ZXh0LWVycm9yXCI+XG4gICAgICAgICAgICB7Y29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dH1cbiAgICAgICAgICA8L0Zvcm1IZWxwZXJUZXh0PlxuICAgICAgICA8Lz5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvPlxuICApXG59XG5cbi8qKlxuICogIEJ5IHVwZGF0aW5nIGludmFsaWQgc3RhcnRpbmcgdmFsdWVzIGJlZm9yZSB3ZSBnbyBpbnRvIHRoZSBhYm92ZSBjb21wb25lbnQsIHdlIGNhbiBtYWtlIHN1cmUgd2UgYWx3YXlzIGhhdmUgYSB2YWxpZCB2YWx1ZSB0byBmYWxsIGJhY2sgdG8uXG4gKi9cbmV4cG9ydCBjb25zdCBEYXRlUmFuZ2VGaWVsZCA9ICh7XG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbiAgQlBEYXRlUmFuZ2VQcm9wcyxcbn06IFByb3BzKSA9PiB7XG4gIHVzZUluaXRpYWxWYWx1ZVZhbGlkYXRpb24oeyB2YWx1ZSwgb25DaGFuZ2UsIEJQRGF0ZVJhbmdlUHJvcHMgfSlcbiAgY29uc3QgdmFsdWVWYWxpZGl0eSA9IGlzVmFsaWRWYWx1ZSh2YWx1ZSlcbiAgaWYgKCF2YWx1ZVZhbGlkaXR5LnZhbGlkKSB7XG4gICAgcmV0dXJuIDxMaW5lYXJQcm9ncmVzcyBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0yXCIgLz5cbiAgfVxuICByZXR1cm4gKFxuICAgIDxEYXRlUmFuZ2VGaWVsZFdpdGhvdXRJbml0aWFsVmFsaWRhdGlvblxuICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgQlBEYXRlUmFuZ2VQcm9wcz17QlBEYXRlUmFuZ2VQcm9wc31cbiAgICAvPlxuICApXG59XG4iXX0=