import { __read } from "tslib";
import user from '../singletons/user-instance';
import moment from 'moment-timezone';
import { isDateValid, isDayInRange, } from '@blueprintjs/datetime/lib/esm/common/dateUtils';
import { getDefaultMaxDate } from '@blueprintjs/datetime/lib/esm/datePickerCore';
import Common from '../../js/Common';
export var ISO_8601_FORMAT_ZONED = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
export var DefaultMinDate = new Date('Jan 1, 1900');
export var DefaultMaxDate = moment(getDefaultMaxDate())
    .add(10, 'years')
    .toDate();
export var DateHelpers = {
    General: {
        getDateFormat: function () {
            return user.get('user').get('preferences').get('dateTimeFormat')['datetimefmt'];
        },
        getTimeZone: function () {
            return user.get('user').get('preferences').get('timeZone');
        },
        getTimePrecision: function () {
            return Common.getDateTimeFormatsReverseMap()[DateHelpers.General.getDateFormat()].precision;
        },
        withPrecision: function (date) {
            switch (DateHelpers.General.getTimePrecision()) {
                case 'minute':
                    date.setUTCSeconds(0);
                // Intentional fall-through
                case 'second':
                    date.setUTCMilliseconds(0);
            }
            return date;
        },
    },
    Blueprint: {
        commonProps: {
            /**
             * Need some user feedback on how this works.  I think it works appropriately at the moment, because it turns user input into the user timezone of choice.
             *
             * So if  user enters time in another timezone by pasting, the input will fix it for them to show it in their chosen timezone.
             *
             * TLDR: this function is only called when the user manually types in a date
             */
            parseDate: function (input) {
                try {
                    return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(input || '', DateHelpers.General.getDateFormat());
                }
                catch (err) {
                    return null;
                }
            },
            /**
             * Basically undoes the value shift to make sure the date is displayed in user's chosen timezone
             */
            formatDate: function (date) {
                try {
                    var unshiftedDate = DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(date);
                    return moment(unshiftedDate)
                        .tz(DateHelpers.General.getTimeZone())
                        .format(DateHelpers.General.getDateFormat());
                }
                catch (err) {
                    return '';
                }
            },
            isValid: function (date, minDate, maxDate) {
                if (minDate === void 0) { minDate = DefaultMinDate; }
                if (maxDate === void 0) { maxDate = DefaultMaxDate; }
                return (date && isDateValid(date) && isDayInRange(date, [minDate, maxDate]));
            },
        },
        DateProps: {
            generateOnChange: function (onChange) {
                return (function (selectedDate, isUserChange) {
                    if (selectedDate && isUserChange) {
                        var unshiftedDate = DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(selectedDate);
                        onChange(unshiftedDate.toISOString());
                    }
                });
            },
            generateValue: function (value, minDate, maxDate) {
                return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(value, ISO_8601_FORMAT_ZONED, minDate, maxDate);
            },
        },
        DateRangeProps: {
            generateOnChange: function (onChange) {
                return (function (_a) {
                    var _b = __read(_a, 2), start = _b[0], end = _b[1];
                    if (onChange) {
                        onChange({
                            start: start
                                ? DateHelpers.Blueprint.converters
                                    .UntimeshiftFromDatePicker(start)
                                    .toISOString()
                                : '',
                            end: end
                                ? DateHelpers.Blueprint.converters
                                    .UntimeshiftFromDatePicker(end)
                                    .toISOString()
                                : '',
                        });
                    }
                });
            },
            // null is how the blueprint datepicker represents an empty or invalid date
            generateValue: function (value, minDate, maxDate) {
                return [
                    value.start
                        ? DateHelpers.Blueprint.converters.TimeshiftForDatePicker(value.start, ISO_8601_FORMAT_ZONED, minDate, maxDate)
                        : null,
                    value.end
                        ? DateHelpers.Blueprint.converters.TimeshiftForDatePicker(value.end, ISO_8601_FORMAT_ZONED, minDate, maxDate)
                        : null,
                ];
            },
        },
        converters: {
            /**
             * The datepicker from blueprint doesn't handle timezones.  So if we want to make it feel like the user is in their
             * chosen timezone, we have to shift the date ourselves.  So what we do is pretend the value is utc, then calculate the offset of the computer's local timezone and the timezone the user wants to create a total offset.  This is because the datepicker internally
             * uses date, so we have to pretend we're in local time.  We then take that utc date and add the totaloffset, then tell the datepicker that is our value.  As a result, when the datepicker internally uses Date it will shift back to the correct timezone.
             *
             * TLDR: Use this on a date string formatted in the manner specified by the provided format going INTO the blueprint datepicker (the value prop).  Use the sibling function UntimeshiftFromDatePicker to reverse this.
             */
            TimeshiftForDatePicker: function (value, format, minDate, maxDate) {
                try {
                    var unshiftedDate = moment(value, format);
                    if (!unshiftedDate.isValid()) {
                        return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(moment.utc().toISOString(), ISO_8601_FORMAT_ZONED);
                    }
                    switch (DateHelpers.General.getTimePrecision()) {
                        case 'minute':
                            unshiftedDate.seconds(0);
                        // Intentional fall-through
                        case 'second':
                            unshiftedDate.milliseconds(0);
                    }
                    var utcOffsetMinutesLocal = new Date().getTimezoneOffset();
                    var utcOffsetMinutesTimezone = moment
                        .tz(value, format, DateHelpers.General.getTimeZone()) // pass in the value, otherwise it won't account for daylight savings time!
                        .utcOffset();
                    var totalOffset = utcOffsetMinutesLocal + utcOffsetMinutesTimezone;
                    var shiftedDate = unshiftedDate.add(totalOffset, 'minutes');
                    if (shiftedDate.isValid() &&
                        DateHelpers.Blueprint.commonProps.isValid(shiftedDate.toDate(), minDate, maxDate)) {
                        return shiftedDate.toDate();
                    }
                    else {
                        return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(moment.utc().toISOString(), ISO_8601_FORMAT_ZONED);
                    }
                }
                catch (err) {
                    console.error(err);
                    return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(moment.utc().toISOString(), ISO_8601_FORMAT_ZONED);
                }
            },
            /**
             * The form within the datepicker is Timeshifted, so we have to untimeshift things as they come out of the datepicker.
             * See TimeshiftForDatePicker, since we're undoing what we do there
             *
             * TLDR: Use this on the Date object coming out of the Blueprint datepicker (only if you used the sibling function to format the value going in of course, since it reverses it).  That means the use this in the onChange prop and the formatDate prop.
             */
            UntimeshiftFromDatePicker: function (value) {
                try {
                    var shiftedDate = moment(value);
                    switch (DateHelpers.General.getTimePrecision()) {
                        case 'minute':
                            shiftedDate.seconds(0);
                        // Intentional fall-through
                        case 'second':
                            shiftedDate.milliseconds(0);
                    }
                    var utcOffsetMinutesLocal = new Date().getTimezoneOffset();
                    var utcOffsetMinutesTimezone = moment
                        .tz(value, DateHelpers.General.getTimeZone()) // pass in the value, otherwise it won't account for daylight savings time!
                        .utcOffset();
                    var totalOffset = utcOffsetMinutesLocal + utcOffsetMinutesTimezone;
                    return shiftedDate.subtract(totalOffset, 'minutes').toDate();
                }
                catch (err) {
                    console.error(err);
                    return DateHelpers.General.withPrecision(new Date());
                }
            },
            /**
             * The output from the onChange is an ISOString. This converts it to a string in the user's timezone and preferred format.
             *
             * TLDR: Use this on the string from the onChange when you want to display it.
             */
            ISOtoFormattedString: function (value) {
                var date = DateHelpers.Blueprint.DateProps.generateValue(value);
                return DateHelpers.Blueprint.commonProps.formatDate(date);
            },
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9maWVsZHMvZGF0ZS1oZWxwZXJzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBR0EsT0FBTyxJQUFJLE1BQU0sNkJBQTZCLENBQUE7QUFDOUMsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUE7QUFDcEMsT0FBTyxFQUNMLFdBQVcsRUFDWCxZQUFZLEdBQ2IsTUFBTSxnREFBZ0QsQ0FBQTtBQUN2RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUNoRixPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUVwQyxNQUFNLENBQUMsSUFBTSxxQkFBcUIsR0FBRywwQkFBMEIsQ0FBQTtBQUUvRCxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFFckQsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQ3RELEdBQUcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDO0tBQ2hCLE1BQU0sRUFBRSxDQUFBO0FBRVgsTUFBTSxDQUFDLElBQU0sV0FBVyxHQUFHO0lBQ3pCLE9BQU8sRUFBRTtRQUNQLGFBQWEsRUFBRTtZQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQzlELGFBQWEsQ0FDSixDQUFBO1FBQ2IsQ0FBQztRQUNELFdBQVcsRUFBRTtZQUNYLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBVyxDQUFBO1FBQ3RFLENBQUM7UUFDRCxnQkFBZ0IsRUFBRTtZ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TUFBTSxFQUFFLENBQUE7Z0JBQzlELENBQUM7Z0JBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztvQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO29CQUNsQixPQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQTtnQkFDdEQsQ0FBQztZQUNILENBQUM7WUFDRDs7OztlQUlHO1lBQ0gsb0JBQW9CLEVBQUUsVUFBQyxLQUFhO2dCQUNsQyxJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ2pFLE9BQU8sV0FBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQzNELENBQUM7U0FDRjtLQUNGO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZhbHVlVHlwZXMgfSBmcm9tICcuLi9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IHsgSURhdGVJbnB1dFByb3BzIH0gZnJvbSAnQGJsdWVwcmludGpzL2RhdGV0aW1lJ1xuaW1wb3J0IHsgSURhdGVSYW5nZUlucHV0UHJvcHMgfSBmcm9tICdAYmx1ZXByaW50anMvZGF0ZXRpbWUnXG5pbXBvcnQgdXNlciBmcm9tICcuLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudC10aW1lem9uZSdcbmltcG9ydCB7XG4gIGlzRGF0ZVZhbGlkLFxuICBpc0RheUluUmFuZ2UsXG59IGZyb20gJ0BibHVlcHJpbnRqcy9kYXRldGltZS9saWIvZXNtL2NvbW1vbi9kYXRlVXRpbHMnXG5pbXBvcnQgeyBnZXREZWZhdWx0TWF4RGF0ZSB9IGZyb20gJ0BibHVlcHJpbnRqcy9kYXRldGltZS9saWIvZXNtL2RhdGVQaWNrZXJDb3JlJ1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi8uLi9qcy9Db21tb24nXG5cbmV4cG9ydCBjb25zdCBJU09fODYwMV9GT1JNQVRfWk9ORUQgPSAnWVlZWS1NTS1ERFRISDptbTpzcy5TU1NaJ1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdE1pbkRhdGUgPSBuZXcgRGF0ZSgnSmFuIDEsIDE5MDAnKVxuXG5leHBvcnQgY29uc3QgRGVmYXVsdE1heERhdGUgPSBtb21lbnQoZ2V0RGVmYXVsdE1heERhdGUoKSlcbiAgLmFkZCgxMCwgJ3llYXJzJylcbiAgLnRvRGF0ZSgpXG5cbmV4cG9ydCBjb25zdCBEYXRlSGVscGVycyA9IHtcbiAgR2VuZXJhbDoge1xuICAgIGdldERhdGVGb3JtYXQ6ICgpID0+IHtcbiAgICAgIHJldHVybiB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ2RhdGVUaW1lRm9ybWF0JylbXG4gICAgICAgICdkYXRldGltZWZtdCdcbiAgICAgIF0gYXMgc3RyaW5nXG4gICAgfSxcbiAgICBnZXRUaW1lWm9uZTogKCkgPT4ge1xuICAgICAgcmV0dXJuIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgndGltZVpvbmUnKSBhcyBzdHJpbmdcbiAgICB9LFxuICAgIGdldFRpbWVQcmVjaXNpb246ICgpID0+IHtcbiAgICAgIHJldHVybiBDb21tb24uZ2V0RGF0ZVRpbWVGb3JtYXRzUmV2ZXJzZU1hcCgpW1xuICAgICAgICBEYXRlSGVscGVycy5HZW5lcmFsLmdldERhdGVGb3JtYXQoKVxuICAgICAgXS5wcmVjaXNpb25cbiAgICB9LFxuICAgIHdpdGhQcmVjaXNpb246IChkYXRlOiBEYXRlKSA9PiB7XG4gICAgICBzd2l0Y2ggKERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0VGltZVByZWNpc2lvbigpKSB7XG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgICAgZGF0ZS5zZXRVVENTZWNvbmRzKDApXG4gICAgICAgIC8vIEludGVudGlvbmFsIGZhbGwtdGhyb3VnaFxuICAgICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICAgIGRhdGUuc2V0VVRDTWlsbGlzZWNvbmRzKDApXG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0ZVxuICAgIH0sXG4gIH0sXG4gIEJsdWVwcmludDoge1xuICAgIGNvbW1vblByb3BzOiB7XG4gICAgICAvKipcbiAgICAgICAqIE5lZWQgc29tZSB1c2VyIGZlZWRiYWNrIG9uIGhvdyB0aGlzIHdvcmtzLiAgSSB0aGluayBpdCB3b3JrcyBhcHByb3ByaWF0ZWx5IGF0IHRoZSBtb21lbnQsIGJlY2F1c2UgaXQgdHVybnMgdXNlciBpbnB1dCBpbnRvIHRoZSB1c2VyIHRpbWV6b25lIG9mIGNob2ljZS5cbiAgICAgICAqXG4gICAgICAgKiBTbyBpZiAgdXNlciBlbnRlcnMgdGltZSBpbiBhbm90aGVyIHRpbWV6b25lIGJ5IHBhc3RpbmcsIHRoZSBpbnB1dCB3aWxsIGZpeCBpdCBmb3IgdGhlbSB0byBzaG93IGl0IGluIHRoZWlyIGNob3NlbiB0aW1lem9uZS5cbiAgICAgICAqXG4gICAgICAgKiBUTERSOiB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIHdoZW4gdGhlIHVzZXIgbWFudWFsbHkgdHlwZXMgaW4gYSBkYXRlXG4gICAgICAgKi9cbiAgICAgIHBhcnNlRGF0ZTogKGlucHV0Pzogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlRpbWVzaGlmdEZvckRhdGVQaWNrZXIoXG4gICAgICAgICAgICBpbnB1dCB8fCAnJyxcbiAgICAgICAgICAgIERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0RGF0ZUZvcm1hdCgpXG4gICAgICAgICAgKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLyoqXG4gICAgICAgKiBCYXNpY2FsbHkgdW5kb2VzIHRoZSB2YWx1ZSBzaGlmdCB0byBtYWtlIHN1cmUgdGhlIGRhdGUgaXMgZGlzcGxheWVkIGluIHVzZXIncyBjaG9zZW4gdGltZXpvbmVcbiAgICAgICAqL1xuICAgICAgZm9ybWF0RGF0ZTogKGRhdGU6IERhdGUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB1bnNoaWZ0ZWREYXRlID1cbiAgICAgICAgICAgIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlVudGltZXNoaWZ0RnJvbURhdGVQaWNrZXIoZGF0ZSlcbiAgICAgICAgICByZXR1cm4gbW9tZW50KHVuc2hpZnRlZERhdGUpXG4gICAgICAgICAgICAudHooRGF0ZUhlbHBlcnMuR2VuZXJhbC5nZXRUaW1lWm9uZSgpKVxuICAgICAgICAgICAgLmZvcm1hdChEYXRlSGVscGVycy5HZW5lcmFsLmdldERhdGVGb3JtYXQoKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuICcnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpc1ZhbGlkOiAoXG4gICAgICAgIGRhdGU6IERhdGUsXG4gICAgICAgIG1pbkRhdGU6IERhdGUgPSBEZWZhdWx0TWluRGF0ZSxcbiAgICAgICAgbWF4RGF0ZTogRGF0ZSA9IERlZmF1bHRNYXhEYXRlXG4gICAgICApID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBkYXRlICYmIGlzRGF0ZVZhbGlkKGRhdGUpICYmIGlzRGF5SW5SYW5nZShkYXRlLCBbbWluRGF0ZSwgbWF4RGF0ZV0pXG4gICAgICAgIClcbiAgICAgIH0sXG4gICAgfSxcbiAgICBEYXRlUHJvcHM6IHtcbiAgICAgIGdlbmVyYXRlT25DaGFuZ2U6IChvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQpID0+IHtcbiAgICAgICAgcmV0dXJuICgoc2VsZWN0ZWREYXRlLCBpc1VzZXJDaGFuZ2UpID0+IHtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWREYXRlICYmIGlzVXNlckNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3QgdW5zaGlmdGVkRGF0ZSA9XG4gICAgICAgICAgICAgIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlVudGltZXNoaWZ0RnJvbURhdGVQaWNrZXIoXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWREYXRlXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIG9uQ2hhbmdlKHVuc2hpZnRlZERhdGUudG9JU09TdHJpbmcoKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pIGFzIElEYXRlSW5wdXRQcm9wc1snb25DaGFuZ2UnXVxuICAgICAgfSxcbiAgICAgIGdlbmVyYXRlVmFsdWU6ICh2YWx1ZTogc3RyaW5nLCBtaW5EYXRlPzogRGF0ZSwgbWF4RGF0ZT86IERhdGUpID0+XG4gICAgICAgIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlRpbWVzaGlmdEZvckRhdGVQaWNrZXIoXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgSVNPXzg2MDFfRk9STUFUX1pPTkVELFxuICAgICAgICAgIG1pbkRhdGUsXG4gICAgICAgICAgbWF4RGF0ZVxuICAgICAgICApLFxuICAgIH0sXG4gICAgRGF0ZVJhbmdlUHJvcHM6IHtcbiAgICAgIGdlbmVyYXRlT25DaGFuZ2U6IChvbkNoYW5nZTogKHZhbHVlOiBWYWx1ZVR5cGVzWydkdXJpbmcnXSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICByZXR1cm4gKChbc3RhcnQsIGVuZF0pID0+IHtcbiAgICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHtcbiAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0XG4gICAgICAgICAgICAgICAgPyBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29udmVydGVyc1xuICAgICAgICAgICAgICAgICAgICAuVW50aW1lc2hpZnRGcm9tRGF0ZVBpY2tlcihzdGFydClcbiAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICA6ICcnLFxuICAgICAgICAgICAgICBlbmQ6IGVuZFxuICAgICAgICAgICAgICAgID8gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnNcbiAgICAgICAgICAgICAgICAgICAgLlVudGltZXNoaWZ0RnJvbURhdGVQaWNrZXIoZW5kKVxuICAgICAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIDogJycsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfSkgYXMgSURhdGVSYW5nZUlucHV0UHJvcHNbJ29uQ2hhbmdlJ11cbiAgICAgIH0sXG4gICAgICAvLyBudWxsIGlzIGhvdyB0aGUgYmx1ZXByaW50IGRhdGVwaWNrZXIgcmVwcmVzZW50cyBhbiBlbXB0eSBvciBpbnZhbGlkIGRhdGVcbiAgICAgIGdlbmVyYXRlVmFsdWU6IChcbiAgICAgICAgdmFsdWU6IFZhbHVlVHlwZXNbJ2R1cmluZyddLFxuICAgICAgICBtaW5EYXRlPzogRGF0ZSxcbiAgICAgICAgbWF4RGF0ZT86IERhdGVcbiAgICAgICkgPT5cbiAgICAgICAgW1xuICAgICAgICAgIHZhbHVlLnN0YXJ0XG4gICAgICAgICAgICA/IERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlRpbWVzaGlmdEZvckRhdGVQaWNrZXIoXG4gICAgICAgICAgICAgICAgdmFsdWUuc3RhcnQsXG4gICAgICAgICAgICAgICAgSVNPXzg2MDFfRk9STUFUX1pPTkVELFxuICAgICAgICAgICAgICAgIG1pbkRhdGUsXG4gICAgICAgICAgICAgICAgbWF4RGF0ZVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICA6IG51bGwsXG4gICAgICAgICAgdmFsdWUuZW5kXG4gICAgICAgICAgICA/IERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlRpbWVzaGlmdEZvckRhdGVQaWNrZXIoXG4gICAgICAgICAgICAgICAgdmFsdWUuZW5kLFxuICAgICAgICAgICAgICAgIElTT184NjAxX0ZPUk1BVF9aT05FRCxcbiAgICAgICAgICAgICAgICBtaW5EYXRlLFxuICAgICAgICAgICAgICAgIG1heERhdGVcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgOiBudWxsLFxuICAgICAgICBdIGFzIElEYXRlUmFuZ2VJbnB1dFByb3BzWyd2YWx1ZSddLFxuICAgIH0sXG4gICAgY29udmVydGVyczoge1xuICAgICAgLyoqXG4gICAgICAgKiBUaGUgZGF0ZXBpY2tlciBmcm9tIGJsdWVwcmludCBkb2Vzbid0IGhhbmRsZSB0aW1lem9uZXMuICBTbyBpZiB3ZSB3YW50IHRvIG1ha2UgaXQgZmVlbCBsaWtlIHRoZSB1c2VyIGlzIGluIHRoZWlyXG4gICAgICAgKiBjaG9zZW4gdGltZXpvbmUsIHdlIGhhdmUgdG8gc2hpZnQgdGhlIGRhdGUgb3Vyc2VsdmVzLiAgU28gd2hhdCB3ZSBkbyBpcyBwcmV0ZW5kIHRoZSB2YWx1ZSBpcyB1dGMsIHRoZW4gY2FsY3VsYXRlIHRoZSBvZmZzZXQgb2YgdGhlIGNvbXB1dGVyJ3MgbG9jYWwgdGltZXpvbmUgYW5kIHRoZSB0aW1lem9uZSB0aGUgdXNlciB3YW50cyB0byBjcmVhdGUgYSB0b3RhbCBvZmZzZXQuICBUaGlzIGlzIGJlY2F1c2UgdGhlIGRhdGVwaWNrZXIgaW50ZXJuYWxseVxuICAgICAgICogdXNlcyBkYXRlLCBzbyB3ZSBoYXZlIHRvIHByZXRlbmQgd2UncmUgaW4gbG9jYWwgdGltZS4gIFdlIHRoZW4gdGFrZSB0aGF0IHV0YyBkYXRlIGFuZCBhZGQgdGhlIHRvdGFsb2Zmc2V0LCB0aGVuIHRlbGwgdGhlIGRhdGVwaWNrZXIgdGhhdCBpcyBvdXIgdmFsdWUuICBBcyBhIHJlc3VsdCwgd2hlbiB0aGUgZGF0ZXBpY2tlciBpbnRlcm5hbGx5IHVzZXMgRGF0ZSBpdCB3aWxsIHNoaWZ0IGJhY2sgdG8gdGhlIGNvcnJlY3QgdGltZXpvbmUuXG4gICAgICAgKlxuICAgICAgICogVExEUjogVXNlIHRoaXMgb24gYSBkYXRlIHN0cmluZyBmb3JtYXR0ZWQgaW4gdGhlIG1hbm5lciBzcGVjaWZpZWQgYnkgdGhlIHByb3ZpZGVkIGZvcm1hdCBnb2luZyBJTlRPIHRoZSBibHVlcHJpbnQgZGF0ZXBpY2tlciAodGhlIHZhbHVlIHByb3ApLiAgVXNlIHRoZSBzaWJsaW5nIGZ1bmN0aW9uIFVudGltZXNoaWZ0RnJvbURhdGVQaWNrZXIgdG8gcmV2ZXJzZSB0aGlzLlxuICAgICAgICovXG4gICAgICBUaW1lc2hpZnRGb3JEYXRlUGlja2VyOiAoXG4gICAgICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgICAgIGZvcm1hdDogc3RyaW5nLFxuICAgICAgICBtaW5EYXRlPzogRGF0ZSxcbiAgICAgICAgbWF4RGF0ZT86IERhdGVcbiAgICAgICk6IERhdGUgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHVuc2hpZnRlZERhdGUgPSBtb21lbnQodmFsdWUsIGZvcm1hdClcbiAgICAgICAgICBpZiAoIXVuc2hpZnRlZERhdGUuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlcihcbiAgICAgICAgICAgICAgbW9tZW50LnV0YygpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgIElTT184NjAxX0ZPUk1BVF9aT05FRFxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBzd2l0Y2ggKERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0VGltZVByZWNpc2lvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdtaW51dGUnOlxuICAgICAgICAgICAgICB1bnNoaWZ0ZWREYXRlLnNlY29uZHMoMClcbiAgICAgICAgICAgIC8vIEludGVudGlvbmFsIGZhbGwtdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgICAgICAgdW5zaGlmdGVkRGF0ZS5taWxsaXNlY29uZHMoMClcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdXRjT2Zmc2V0TWludXRlc0xvY2FsID0gbmV3IERhdGUoKS5nZXRUaW1lem9uZU9mZnNldCgpXG4gICAgICAgICAgY29uc3QgdXRjT2Zmc2V0TWludXRlc1RpbWV6b25lID0gbW9tZW50XG4gICAgICAgICAgICAudHoodmFsdWUsIGZvcm1hdCwgRGF0ZUhlbHBlcnMuR2VuZXJhbC5nZXRUaW1lWm9uZSgpKSAvLyBwYXNzIGluIHRoZSB2YWx1ZSwgb3RoZXJ3aXNlIGl0IHdvbid0IGFjY291bnQgZm9yIGRheWxpZ2h0IHNhdmluZ3MgdGltZSFcbiAgICAgICAgICAgIC51dGNPZmZzZXQoKVxuICAgICAgICAgIGNvbnN0IHRvdGFsT2Zmc2V0ID0gdXRjT2Zmc2V0TWludXRlc0xvY2FsICsgdXRjT2Zmc2V0TWludXRlc1RpbWV6b25lXG4gICAgICAgICAgY29uc3Qgc2hpZnRlZERhdGUgPSB1bnNoaWZ0ZWREYXRlLmFkZCh0b3RhbE9mZnNldCwgJ21pbnV0ZXMnKVxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHNoaWZ0ZWREYXRlLmlzVmFsaWQoKSAmJlxuICAgICAgICAgICAgRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbW1vblByb3BzLmlzVmFsaWQoXG4gICAgICAgICAgICAgIHNoaWZ0ZWREYXRlLnRvRGF0ZSgpLFxuICAgICAgICAgICAgICBtaW5EYXRlLFxuICAgICAgICAgICAgICBtYXhEYXRlXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gc2hpZnRlZERhdGUudG9EYXRlKClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlRpbWVzaGlmdEZvckRhdGVQaWNrZXIoXG4gICAgICAgICAgICAgIG1vbWVudC51dGMoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICBJU09fODYwMV9GT1JNQVRfWk9ORURcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgICAgIHJldHVybiBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29udmVydGVycy5UaW1lc2hpZnRGb3JEYXRlUGlja2VyKFxuICAgICAgICAgICAgbW9tZW50LnV0YygpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBJU09fODYwMV9GT1JNQVRfWk9ORURcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBmb3JtIHdpdGhpbiB0aGUgZGF0ZXBpY2tlciBpcyBUaW1lc2hpZnRlZCwgc28gd2UgaGF2ZSB0byB1bnRpbWVzaGlmdCB0aGluZ3MgYXMgdGhleSBjb21lIG91dCBvZiB0aGUgZGF0ZXBpY2tlci5cbiAgICAgICAqIFNlZSBUaW1lc2hpZnRGb3JEYXRlUGlja2VyLCBzaW5jZSB3ZSdyZSB1bmRvaW5nIHdoYXQgd2UgZG8gdGhlcmVcbiAgICAgICAqXG4gICAgICAgKiBUTERSOiBVc2UgdGhpcyBvbiB0aGUgRGF0ZSBvYmplY3QgY29taW5nIG91dCBvZiB0aGUgQmx1ZXByaW50IGRhdGVwaWNrZXIgKG9ubHkgaWYgeW91IHVzZWQgdGhlIHNpYmxpbmcgZnVuY3Rpb24gdG8gZm9ybWF0IHRoZSB2YWx1ZSBnb2luZyBpbiBvZiBjb3Vyc2UsIHNpbmNlIGl0IHJldmVyc2VzIGl0KS4gIFRoYXQgbWVhbnMgdGhlIHVzZSB0aGlzIGluIHRoZSBvbkNoYW5nZSBwcm9wIGFuZCB0aGUgZm9ybWF0RGF0ZSBwcm9wLlxuICAgICAgICovXG4gICAgICBVbnRpbWVzaGlmdEZyb21EYXRlUGlja2VyOiAodmFsdWU6IERhdGUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBzaGlmdGVkRGF0ZSA9IG1vbWVudCh2YWx1ZSlcbiAgICAgICAgICBzd2l0Y2ggKERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0VGltZVByZWNpc2lvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdtaW51dGUnOlxuICAgICAgICAgICAgICBzaGlmdGVkRGF0ZS5zZWNvbmRzKDApXG4gICAgICAgICAgICAvLyBJbnRlbnRpb25hbCBmYWxsLXRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgICAgICAgIHNoaWZ0ZWREYXRlLm1pbGxpc2Vjb25kcygwKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB1dGNPZmZzZXRNaW51dGVzTG9jYWwgPSBuZXcgRGF0ZSgpLmdldFRpbWV6b25lT2Zmc2V0KClcbiAgICAgICAgICBjb25zdCB1dGNPZmZzZXRNaW51dGVzVGltZXpvbmUgPSBtb21lbnRcbiAgICAgICAgICAgIC50eih2YWx1ZSwgRGF0ZUhlbHBlcnMuR2VuZXJhbC5nZXRUaW1lWm9uZSgpKSAvLyBwYXNzIGluIHRoZSB2YWx1ZSwgb3RoZXJ3aXNlIGl0IHdvbid0IGFjY291bnQgZm9yIGRheWxpZ2h0IHNhdmluZ3MgdGltZSFcbiAgICAgICAgICAgIC51dGNPZmZzZXQoKVxuICAgICAgICAgIGNvbnN0IHRvdGFsT2Zmc2V0ID0gdXRjT2Zmc2V0TWludXRlc0xvY2FsICsgdXRjT2Zmc2V0TWludXRlc1RpbWV6b25lXG4gICAgICAgICAgcmV0dXJuIHNoaWZ0ZWREYXRlLnN1YnRyYWN0KHRvdGFsT2Zmc2V0LCAnbWludXRlcycpLnRvRGF0ZSgpXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgICAgIHJldHVybiBEYXRlSGVscGVycy5HZW5lcmFsLndpdGhQcmVjaXNpb24obmV3IERhdGUoKSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8qKlxuICAgICAgICogVGhlIG91dHB1dCBmcm9tIHRoZSBvbkNoYW5nZSBpcyBhbiBJU09TdHJpbmcuIFRoaXMgY29udmVydHMgaXQgdG8gYSBzdHJpbmcgaW4gdGhlIHVzZXIncyB0aW1lem9uZSBhbmQgcHJlZmVycmVkIGZvcm1hdC5cbiAgICAgICAqXG4gICAgICAgKiBUTERSOiBVc2UgdGhpcyBvbiB0aGUgc3RyaW5nIGZyb20gdGhlIG9uQ2hhbmdlIHdoZW4geW91IHdhbnQgdG8gZGlzcGxheSBpdC5cbiAgICAgICAqL1xuICAgICAgSVNPdG9Gb3JtYXR0ZWRTdHJpbmc6ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBEYXRlSGVscGVycy5CbHVlcHJpbnQuRGF0ZVByb3BzLmdlbmVyYXRlVmFsdWUodmFsdWUpXG4gICAgICAgIHJldHVybiBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29tbW9uUHJvcHMuZm9ybWF0RGF0ZShkYXRlKVxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufVxuIl19