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
            generateValue: function (value, minDate, maxDate) {
                return [
                    DateHelpers.Blueprint.converters.TimeshiftForDatePicker(value.start, ISO_8601_FORMAT_ZONED, minDate, maxDate),
                    DateHelpers.Blueprint.converters.TimeshiftForDatePicker(value.end, ISO_8601_FORMAT_ZONED, minDate, maxDate),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9maWVsZHMvZGF0ZS1oZWxwZXJzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBR0EsT0FBTyxJQUFJLE1BQU0sNkJBQTZCLENBQUE7QUFDOUMsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUE7QUFDcEMsT0FBTyxFQUNMLFdBQVcsRUFDWCxZQUFZLEdBQ2IsTUFBTSxnREFBZ0QsQ0FBQTtBQUN2RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUNoRixPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUVwQyxNQUFNLENBQUMsSUFBTSxxQkFBcUIsR0FBRywwQkFBMEIsQ0FBQTtBQUUvRCxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFFckQsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQ3RELEdBQUcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDO0tBQ2hCLE1BQU0sRUFBRSxDQUFBO0FBRVgsTUFBTSxDQUFDLElBQU0sV0FBVyxHQUFHO0lBQ3pCLE9BQU8sRUFBRTtRQUNQLGFBQWEsRUFBRTtZQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQzlELGFBQWEsQ0FDSixDQUFBO1FBQ2IsQ0FBQztRQUNELFdBQVcsRUFBRTtZQUNYLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBVyxDQUFBO1FBQ3RFLENBQUM7UUFDRCxnQkFBZ0IsRUFBRTtZ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LENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ2pFLE9BQU8sV0FBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQzNELENBQUM7U0FDRjtLQUNGO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZhbHVlVHlwZXMgfSBmcm9tICcuLi9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IHsgSURhdGVJbnB1dFByb3BzIH0gZnJvbSAnQGJsdWVwcmludGpzL2RhdGV0aW1lJ1xuaW1wb3J0IHsgSURhdGVSYW5nZUlucHV0UHJvcHMgfSBmcm9tICdAYmx1ZXByaW50anMvZGF0ZXRpbWUnXG5pbXBvcnQgdXNlciBmcm9tICcuLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudC10aW1lem9uZSdcbmltcG9ydCB7XG4gIGlzRGF0ZVZhbGlkLFxuICBpc0RheUluUmFuZ2UsXG59IGZyb20gJ0BibHVlcHJpbnRqcy9kYXRldGltZS9saWIvZXNtL2NvbW1vbi9kYXRlVXRpbHMnXG5pbXBvcnQgeyBnZXREZWZhdWx0TWF4RGF0ZSB9IGZyb20gJ0BibHVlcHJpbnRqcy9kYXRldGltZS9saWIvZXNtL2RhdGVQaWNrZXJDb3JlJ1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi8uLi9qcy9Db21tb24nXG5cbmV4cG9ydCBjb25zdCBJU09fODYwMV9GT1JNQVRfWk9ORUQgPSAnWVlZWS1NTS1ERFRISDptbTpzcy5TU1NaJ1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdE1pbkRhdGUgPSBuZXcgRGF0ZSgnSmFuIDEsIDE5MDAnKVxuXG5leHBvcnQgY29uc3QgRGVmYXVsdE1heERhdGUgPSBtb21lbnQoZ2V0RGVmYXVsdE1heERhdGUoKSlcbiAgLmFkZCgxMCwgJ3llYXJzJylcbiAgLnRvRGF0ZSgpXG5cbmV4cG9ydCBjb25zdCBEYXRlSGVscGVycyA9IHtcbiAgR2VuZXJhbDoge1xuICAgIGdldERhdGVGb3JtYXQ6ICgpID0+IHtcbiAgICAgIHJldHVybiB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ2RhdGVUaW1lRm9ybWF0JylbXG4gICAgICAgICdkYXRldGltZWZtdCdcbiAgICAgIF0gYXMgc3RyaW5nXG4gICAgfSxcbiAgICBnZXRUaW1lWm9uZTogKCkgPT4ge1xuICAgICAgcmV0dXJuIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgndGltZVpvbmUnKSBhcyBzdHJpbmdcbiAgICB9LFxuICAgIGdldFRpbWVQcmVjaXNpb246ICgpID0+IHtcbiAgICAgIHJldHVybiBDb21tb24uZ2V0RGF0ZVRpbWVGb3JtYXRzUmV2ZXJzZU1hcCgpW1xuICAgICAgICBEYXRlSGVscGVycy5HZW5lcmFsLmdldERhdGVGb3JtYXQoKVxuICAgICAgXS5wcmVjaXNpb25cbiAgICB9LFxuICAgIHdpdGhQcmVjaXNpb246IChkYXRlOiBEYXRlKSA9PiB7XG4gICAgICBzd2l0Y2ggKERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0VGltZVByZWNpc2lvbigpKSB7XG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgICAgZGF0ZS5zZXRVVENTZWNvbmRzKDApXG4gICAgICAgIC8vIEludGVudGlvbmFsIGZhbGwtdGhyb3VnaFxuICAgICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICAgIGRhdGUuc2V0VVRDTWlsbGlzZWNvbmRzKDApXG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0ZVxuICAgIH0sXG4gIH0sXG4gIEJsdWVwcmludDoge1xuICAgIGNvbW1vblByb3BzOiB7XG4gICAgICAvKipcbiAgICAgICAqIE5lZWQgc29tZSB1c2VyIGZlZWRiYWNrIG9uIGhvdyB0aGlzIHdvcmtzLiAgSSB0aGluayBpdCB3b3JrcyBhcHByb3ByaWF0ZWx5IGF0IHRoZSBtb21lbnQsIGJlY2F1c2UgaXQgdHVybnMgdXNlciBpbnB1dCBpbnRvIHRoZSB1c2VyIHRpbWV6b25lIG9mIGNob2ljZS5cbiAgICAgICAqXG4gICAgICAgKiBTbyBpZiAgdXNlciBlbnRlcnMgdGltZSBpbiBhbm90aGVyIHRpbWV6b25lIGJ5IHBhc3RpbmcsIHRoZSBpbnB1dCB3aWxsIGZpeCBpdCBmb3IgdGhlbSB0byBzaG93IGl0IGluIHRoZWlyIGNob3NlbiB0aW1lem9uZS5cbiAgICAgICAqXG4gICAgICAgKiBUTERSOiB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIHdoZW4gdGhlIHVzZXIgbWFudWFsbHkgdHlwZXMgaW4gYSBkYXRlXG4gICAgICAgKi9cbiAgICAgIHBhcnNlRGF0ZTogKGlucHV0Pzogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlRpbWVzaGlmdEZvckRhdGVQaWNrZXIoXG4gICAgICAgICAgICBpbnB1dCB8fCAnJyxcbiAgICAgICAgICAgIERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0RGF0ZUZvcm1hdCgpXG4gICAgICAgICAgKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLyoqXG4gICAgICAgKiBCYXNpY2FsbHkgdW5kb2VzIHRoZSB2YWx1ZSBzaGlmdCB0byBtYWtlIHN1cmUgdGhlIGRhdGUgaXMgZGlzcGxheWVkIGluIHVzZXIncyBjaG9zZW4gdGltZXpvbmVcbiAgICAgICAqL1xuICAgICAgZm9ybWF0RGF0ZTogKGRhdGU6IERhdGUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB1bnNoaWZ0ZWREYXRlID1cbiAgICAgICAgICAgIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlVudGltZXNoaWZ0RnJvbURhdGVQaWNrZXIoZGF0ZSlcbiAgICAgICAgICByZXR1cm4gbW9tZW50KHVuc2hpZnRlZERhdGUpXG4gICAgICAgICAgICAudHooRGF0ZUhlbHBlcnMuR2VuZXJhbC5nZXRUaW1lWm9uZSgpKVxuICAgICAgICAgICAgLmZvcm1hdChEYXRlSGVscGVycy5HZW5lcmFsLmdldERhdGVGb3JtYXQoKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuICcnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpc1ZhbGlkOiAoXG4gICAgICAgIGRhdGU6IERhdGUsXG4gICAgICAgIG1pbkRhdGU6IERhdGUgPSBEZWZhdWx0TWluRGF0ZSxcbiAgICAgICAgbWF4RGF0ZTogRGF0ZSA9IERlZmF1bHRNYXhEYXRlXG4gICAgICApID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBkYXRlICYmIGlzRGF0ZVZhbGlkKGRhdGUpICYmIGlzRGF5SW5SYW5nZShkYXRlLCBbbWluRGF0ZSwgbWF4RGF0ZV0pXG4gICAgICAgIClcbiAgICAgIH0sXG4gICAgfSxcbiAgICBEYXRlUHJvcHM6IHtcbiAgICAgIGdlbmVyYXRlT25DaGFuZ2U6IChvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQpID0+IHtcbiAgICAgICAgcmV0dXJuICgoc2VsZWN0ZWREYXRlLCBpc1VzZXJDaGFuZ2UpID0+IHtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWREYXRlICYmIGlzVXNlckNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3QgdW5zaGlmdGVkRGF0ZSA9XG4gICAgICAgICAgICAgIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlVudGltZXNoaWZ0RnJvbURhdGVQaWNrZXIoXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWREYXRlXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIG9uQ2hhbmdlKHVuc2hpZnRlZERhdGUudG9JU09TdHJpbmcoKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pIGFzIElEYXRlSW5wdXRQcm9wc1snb25DaGFuZ2UnXVxuICAgICAgfSxcbiAgICAgIGdlbmVyYXRlVmFsdWU6ICh2YWx1ZTogc3RyaW5nLCBtaW5EYXRlPzogRGF0ZSwgbWF4RGF0ZT86IERhdGUpID0+XG4gICAgICAgIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlRpbWVzaGlmdEZvckRhdGVQaWNrZXIoXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgSVNPXzg2MDFfRk9STUFUX1pPTkVELFxuICAgICAgICAgIG1pbkRhdGUsXG4gICAgICAgICAgbWF4RGF0ZVxuICAgICAgICApLFxuICAgIH0sXG4gICAgRGF0ZVJhbmdlUHJvcHM6IHtcbiAgICAgIGdlbmVyYXRlT25DaGFuZ2U6IChvbkNoYW5nZTogKHZhbHVlOiBWYWx1ZVR5cGVzWydkdXJpbmcnXSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICByZXR1cm4gKChbc3RhcnQsIGVuZF0pID0+IHtcbiAgICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHtcbiAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0XG4gICAgICAgICAgICAgICAgPyBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29udmVydGVyc1xuICAgICAgICAgICAgICAgICAgICAuVW50aW1lc2hpZnRGcm9tRGF0ZVBpY2tlcihzdGFydClcbiAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICA6ICcnLFxuICAgICAgICAgICAgICBlbmQ6IGVuZFxuICAgICAgICAgICAgICAgID8gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnNcbiAgICAgICAgICAgICAgICAgICAgLlVudGltZXNoaWZ0RnJvbURhdGVQaWNrZXIoZW5kKVxuICAgICAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIDogJycsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfSkgYXMgSURhdGVSYW5nZUlucHV0UHJvcHNbJ29uQ2hhbmdlJ11cbiAgICAgIH0sXG4gICAgICBnZW5lcmF0ZVZhbHVlOiAoXG4gICAgICAgIHZhbHVlOiBWYWx1ZVR5cGVzWydkdXJpbmcnXSxcbiAgICAgICAgbWluRGF0ZT86IERhdGUsXG4gICAgICAgIG1heERhdGU/OiBEYXRlXG4gICAgICApID0+XG4gICAgICAgIFtcbiAgICAgICAgICBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29udmVydGVycy5UaW1lc2hpZnRGb3JEYXRlUGlja2VyKFxuICAgICAgICAgICAgdmFsdWUuc3RhcnQsXG4gICAgICAgICAgICBJU09fODYwMV9GT1JNQVRfWk9ORUQsXG4gICAgICAgICAgICBtaW5EYXRlLFxuICAgICAgICAgICAgbWF4RGF0ZVxuICAgICAgICAgICksXG4gICAgICAgICAgRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlcihcbiAgICAgICAgICAgIHZhbHVlLmVuZCxcbiAgICAgICAgICAgIElTT184NjAxX0ZPUk1BVF9aT05FRCxcbiAgICAgICAgICAgIG1pbkRhdGUsXG4gICAgICAgICAgICBtYXhEYXRlXG4gICAgICAgICAgKSxcbiAgICAgICAgXSBhcyBJRGF0ZVJhbmdlSW5wdXRQcm9wc1sndmFsdWUnXSxcbiAgICB9LFxuICAgIGNvbnZlcnRlcnM6IHtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIGRhdGVwaWNrZXIgZnJvbSBibHVlcHJpbnQgZG9lc24ndCBoYW5kbGUgdGltZXpvbmVzLiAgU28gaWYgd2Ugd2FudCB0byBtYWtlIGl0IGZlZWwgbGlrZSB0aGUgdXNlciBpcyBpbiB0aGVpclxuICAgICAgICogY2hvc2VuIHRpbWV6b25lLCB3ZSBoYXZlIHRvIHNoaWZ0IHRoZSBkYXRlIG91cnNlbHZlcy4gIFNvIHdoYXQgd2UgZG8gaXMgcHJldGVuZCB0aGUgdmFsdWUgaXMgdXRjLCB0aGVuIGNhbGN1bGF0ZSB0aGUgb2Zmc2V0IG9mIHRoZSBjb21wdXRlcidzIGxvY2FsIHRpbWV6b25lIGFuZCB0aGUgdGltZXpvbmUgdGhlIHVzZXIgd2FudHMgdG8gY3JlYXRlIGEgdG90YWwgb2Zmc2V0LiAgVGhpcyBpcyBiZWNhdXNlIHRoZSBkYXRlcGlja2VyIGludGVybmFsbHlcbiAgICAgICAqIHVzZXMgZGF0ZSwgc28gd2UgaGF2ZSB0byBwcmV0ZW5kIHdlJ3JlIGluIGxvY2FsIHRpbWUuICBXZSB0aGVuIHRha2UgdGhhdCB1dGMgZGF0ZSBhbmQgYWRkIHRoZSB0b3RhbG9mZnNldCwgdGhlbiB0ZWxsIHRoZSBkYXRlcGlja2VyIHRoYXQgaXMgb3VyIHZhbHVlLiAgQXMgYSByZXN1bHQsIHdoZW4gdGhlIGRhdGVwaWNrZXIgaW50ZXJuYWxseSB1c2VzIERhdGUgaXQgd2lsbCBzaGlmdCBiYWNrIHRvIHRoZSBjb3JyZWN0IHRpbWV6b25lLlxuICAgICAgICpcbiAgICAgICAqIFRMRFI6IFVzZSB0aGlzIG9uIGEgZGF0ZSBzdHJpbmcgZm9ybWF0dGVkIGluIHRoZSBtYW5uZXIgc3BlY2lmaWVkIGJ5IHRoZSBwcm92aWRlZCBmb3JtYXQgZ29pbmcgSU5UTyB0aGUgYmx1ZXByaW50IGRhdGVwaWNrZXIgKHRoZSB2YWx1ZSBwcm9wKS4gIFVzZSB0aGUgc2libGluZyBmdW5jdGlvbiBVbnRpbWVzaGlmdEZyb21EYXRlUGlja2VyIHRvIHJldmVyc2UgdGhpcy5cbiAgICAgICAqL1xuICAgICAgVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlcjogKFxuICAgICAgICB2YWx1ZTogc3RyaW5nLFxuICAgICAgICBmb3JtYXQ6IHN0cmluZyxcbiAgICAgICAgbWluRGF0ZT86IERhdGUsXG4gICAgICAgIG1heERhdGU/OiBEYXRlXG4gICAgICApOiBEYXRlID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB1bnNoaWZ0ZWREYXRlID0gbW9tZW50KHZhbHVlLCBmb3JtYXQpXG4gICAgICAgICAgaWYgKCF1bnNoaWZ0ZWREYXRlLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlRpbWVzaGlmdEZvckRhdGVQaWNrZXIoXG4gICAgICAgICAgICAgIG1vbWVudC51dGMoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICBJU09fODYwMV9GT1JNQVRfWk9ORURcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgc3dpdGNoIChEYXRlSGVscGVycy5HZW5lcmFsLmdldFRpbWVQcmVjaXNpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgICAgICAgdW5zaGlmdGVkRGF0ZS5zZWNvbmRzKDApXG4gICAgICAgICAgICAvLyBJbnRlbnRpb25hbCBmYWxsLXRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgICAgICAgIHVuc2hpZnRlZERhdGUubWlsbGlzZWNvbmRzKDApXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHV0Y09mZnNldE1pbnV0ZXNMb2NhbCA9IG5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKVxuICAgICAgICAgIGNvbnN0IHV0Y09mZnNldE1pbnV0ZXNUaW1lem9uZSA9IG1vbWVudFxuICAgICAgICAgICAgLnR6KHZhbHVlLCBmb3JtYXQsIERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0VGltZVpvbmUoKSkgLy8gcGFzcyBpbiB0aGUgdmFsdWUsIG90aGVyd2lzZSBpdCB3b24ndCBhY2NvdW50IGZvciBkYXlsaWdodCBzYXZpbmdzIHRpbWUhXG4gICAgICAgICAgICAudXRjT2Zmc2V0KClcbiAgICAgICAgICBjb25zdCB0b3RhbE9mZnNldCA9IHV0Y09mZnNldE1pbnV0ZXNMb2NhbCArIHV0Y09mZnNldE1pbnV0ZXNUaW1lem9uZVxuICAgICAgICAgIGNvbnN0IHNoaWZ0ZWREYXRlID0gdW5zaGlmdGVkRGF0ZS5hZGQodG90YWxPZmZzZXQsICdtaW51dGVzJylcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBzaGlmdGVkRGF0ZS5pc1ZhbGlkKCkgJiZcbiAgICAgICAgICAgIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb21tb25Qcm9wcy5pc1ZhbGlkKFxuICAgICAgICAgICAgICBzaGlmdGVkRGF0ZS50b0RhdGUoKSxcbiAgICAgICAgICAgICAgbWluRGF0ZSxcbiAgICAgICAgICAgICAgbWF4RGF0ZVxuICAgICAgICAgICAgKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIHNoaWZ0ZWREYXRlLnRvRGF0ZSgpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29udmVydGVycy5UaW1lc2hpZnRGb3JEYXRlUGlja2VyKFxuICAgICAgICAgICAgICBtb21lbnQudXRjKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgSVNPXzg2MDFfRk9STUFUX1pPTkVEXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgICAgICByZXR1cm4gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlcihcbiAgICAgICAgICAgIG1vbWVudC51dGMoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgSVNPXzg2MDFfRk9STUFUX1pPTkVEXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgZm9ybSB3aXRoaW4gdGhlIGRhdGVwaWNrZXIgaXMgVGltZXNoaWZ0ZWQsIHNvIHdlIGhhdmUgdG8gdW50aW1lc2hpZnQgdGhpbmdzIGFzIHRoZXkgY29tZSBvdXQgb2YgdGhlIGRhdGVwaWNrZXIuXG4gICAgICAgKiBTZWUgVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlciwgc2luY2Ugd2UncmUgdW5kb2luZyB3aGF0IHdlIGRvIHRoZXJlXG4gICAgICAgKlxuICAgICAgICogVExEUjogVXNlIHRoaXMgb24gdGhlIERhdGUgb2JqZWN0IGNvbWluZyBvdXQgb2YgdGhlIEJsdWVwcmludCBkYXRlcGlja2VyIChvbmx5IGlmIHlvdSB1c2VkIHRoZSBzaWJsaW5nIGZ1bmN0aW9uIHRvIGZvcm1hdCB0aGUgdmFsdWUgZ29pbmcgaW4gb2YgY291cnNlLCBzaW5jZSBpdCByZXZlcnNlcyBpdCkuICBUaGF0IG1lYW5zIHRoZSB1c2UgdGhpcyBpbiB0aGUgb25DaGFuZ2UgcHJvcCBhbmQgdGhlIGZvcm1hdERhdGUgcHJvcC5cbiAgICAgICAqL1xuICAgICAgVW50aW1lc2hpZnRGcm9tRGF0ZVBpY2tlcjogKHZhbHVlOiBEYXRlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgc2hpZnRlZERhdGUgPSBtb21lbnQodmFsdWUpXG4gICAgICAgICAgc3dpdGNoIChEYXRlSGVscGVycy5HZW5lcmFsLmdldFRpbWVQcmVjaXNpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgICAgICAgc2hpZnRlZERhdGUuc2Vjb25kcygwKVxuICAgICAgICAgICAgLy8gSW50ZW50aW9uYWwgZmFsbC10aHJvdWdoXG4gICAgICAgICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICAgICAgICBzaGlmdGVkRGF0ZS5taWxsaXNlY29uZHMoMClcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdXRjT2Zmc2V0TWludXRlc0xvY2FsID0gbmV3IERhdGUoKS5nZXRUaW1lem9uZU9mZnNldCgpXG4gICAgICAgICAgY29uc3QgdXRjT2Zmc2V0TWludXRlc1RpbWV6b25lID0gbW9tZW50XG4gICAgICAgICAgICAudHoodmFsdWUsIERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0VGltZVpvbmUoKSkgLy8gcGFzcyBpbiB0aGUgdmFsdWUsIG90aGVyd2lzZSBpdCB3b24ndCBhY2NvdW50IGZvciBkYXlsaWdodCBzYXZpbmdzIHRpbWUhXG4gICAgICAgICAgICAudXRjT2Zmc2V0KClcbiAgICAgICAgICBjb25zdCB0b3RhbE9mZnNldCA9IHV0Y09mZnNldE1pbnV0ZXNMb2NhbCArIHV0Y09mZnNldE1pbnV0ZXNUaW1lem9uZVxuICAgICAgICAgIHJldHVybiBzaGlmdGVkRGF0ZS5zdWJ0cmFjdCh0b3RhbE9mZnNldCwgJ21pbnV0ZXMnKS50b0RhdGUoKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgICAgICByZXR1cm4gRGF0ZUhlbHBlcnMuR2VuZXJhbC53aXRoUHJlY2lzaW9uKG5ldyBEYXRlKCkpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBvdXRwdXQgZnJvbSB0aGUgb25DaGFuZ2UgaXMgYW4gSVNPU3RyaW5nLiBUaGlzIGNvbnZlcnRzIGl0IHRvIGEgc3RyaW5nIGluIHRoZSB1c2VyJ3MgdGltZXpvbmUgYW5kIHByZWZlcnJlZCBmb3JtYXQuXG4gICAgICAgKlxuICAgICAgICogVExEUjogVXNlIHRoaXMgb24gdGhlIHN0cmluZyBmcm9tIHRoZSBvbkNoYW5nZSB3aGVuIHlvdSB3YW50IHRvIGRpc3BsYXkgaXQuXG4gICAgICAgKi9cbiAgICAgIElTT3RvRm9ybWF0dGVkU3RyaW5nOiAodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBkYXRlID0gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LkRhdGVQcm9wcy5nZW5lcmF0ZVZhbHVlKHZhbHVlKVxuICAgICAgICByZXR1cm4gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbW1vblByb3BzLmZvcm1hdERhdGUoZGF0ZSlcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn1cbiJdfQ==