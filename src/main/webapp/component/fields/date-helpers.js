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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9maWVsZHMvZGF0ZS1oZWxwZXJzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBR0EsT0FBTyxJQUFJLE1BQU0sNkJBQTZCLENBQUE7QUFDOUMsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUE7QUFDcEMsT0FBTyxFQUNMLFdBQVcsRUFDWCxZQUFZLEdBQ2IsTUFBTSxnREFBZ0QsQ0FBQTtBQUN2RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUNoRixPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUVwQyxNQUFNLENBQUMsSUFBTSxxQkFBcUIsR0FBRywwQkFBMEIsQ0FBQTtBQUUvRCxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFFckQsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQ3RELEdBQUcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDO0tBQ2hCLE1BQU0sRUFBRSxDQUFBO0FBRVgsTUFBTSxDQUFDLElBQU0sV0FBVyxHQUFHO0lBQ3pCLE9BQU8sRUFBRTtRQUNQLGFBQWEsRUFBRTtZQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQzlELGFBQWEsQ0FDSixDQUFBO1FBQ2IsQ0FBQztRQUNELFdBQVcsRUFBRTtZQUNYLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBVyxDQUFBO1FBQ3RFLENBQUM7UUFDRCxnQkFBZ0IsRUFBRTtZ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LENBQUE7aUJBQ3JEO1lBQ0gsQ0FBQztZQUNEOzs7O2VBSUc7WUFDSCxvQkFBb0IsRUFBRSxVQUFDLEtBQWE7Z0JBQ2xDLElBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDakUsT0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDM0QsQ0FBQztTQUNGO0tBQ0Y7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmFsdWVUeXBlcyB9IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgeyBJRGF0ZUlucHV0UHJvcHMgfSBmcm9tICdAYmx1ZXByaW50anMvZGF0ZXRpbWUnXG5pbXBvcnQgeyBJRGF0ZVJhbmdlSW5wdXRQcm9wcyB9IGZyb20gJ0BibHVlcHJpbnRqcy9kYXRldGltZSdcbmltcG9ydCB1c2VyIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50LXRpbWV6b25lJ1xuaW1wb3J0IHtcbiAgaXNEYXRlVmFsaWQsXG4gIGlzRGF5SW5SYW5nZSxcbn0gZnJvbSAnQGJsdWVwcmludGpzL2RhdGV0aW1lL2xpYi9lc20vY29tbW9uL2RhdGVVdGlscydcbmltcG9ydCB7IGdldERlZmF1bHRNYXhEYXRlIH0gZnJvbSAnQGJsdWVwcmludGpzL2RhdGV0aW1lL2xpYi9lc20vZGF0ZVBpY2tlckNvcmUnXG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uLy4uL2pzL0NvbW1vbidcblxuZXhwb3J0IGNvbnN0IElTT184NjAxX0ZPUk1BVF9aT05FRCA9ICdZWVlZLU1NLUREVEhIOm1tOnNzLlNTU1onXG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0TWluRGF0ZSA9IG5ldyBEYXRlKCdKYW4gMSwgMTkwMCcpXG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0TWF4RGF0ZSA9IG1vbWVudChnZXREZWZhdWx0TWF4RGF0ZSgpKVxuICAuYWRkKDEwLCAneWVhcnMnKVxuICAudG9EYXRlKClcblxuZXhwb3J0IGNvbnN0IERhdGVIZWxwZXJzID0ge1xuICBHZW5lcmFsOiB7XG4gICAgZ2V0RGF0ZUZvcm1hdDogKCkgPT4ge1xuICAgICAgcmV0dXJuIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnZGF0ZVRpbWVGb3JtYXQnKVtcbiAgICAgICAgJ2RhdGV0aW1lZm10J1xuICAgICAgXSBhcyBzdHJpbmdcbiAgICB9LFxuICAgIGdldFRpbWVab25lOiAoKSA9PiB7XG4gICAgICByZXR1cm4gdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCd0aW1lWm9uZScpIGFzIHN0cmluZ1xuICAgIH0sXG4gICAgZ2V0VGltZVByZWNpc2lvbjogKCkgPT4ge1xuICAgICAgcmV0dXJuIENvbW1vbi5nZXREYXRlVGltZUZvcm1hdHNSZXZlcnNlTWFwKClbXG4gICAgICAgIERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0RGF0ZUZvcm1hdCgpXG4gICAgICBdLnByZWNpc2lvblxuICAgIH0sXG4gICAgd2l0aFByZWNpc2lvbjogKGRhdGU6IERhdGUpID0+IHtcbiAgICAgIHN3aXRjaCAoRGF0ZUhlbHBlcnMuR2VuZXJhbC5nZXRUaW1lUHJlY2lzaW9uKCkpIHtcbiAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgICBkYXRlLnNldFVUQ1NlY29uZHMoMClcbiAgICAgICAgLy8gSW50ZW50aW9uYWwgZmFsbC10aHJvdWdoXG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgICAgZGF0ZS5zZXRVVENNaWxsaXNlY29uZHMoMClcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRlXG4gICAgfSxcbiAgfSxcbiAgQmx1ZXByaW50OiB7XG4gICAgY29tbW9uUHJvcHM6IHtcbiAgICAgIC8qKlxuICAgICAgICogTmVlZCBzb21lIHVzZXIgZmVlZGJhY2sgb24gaG93IHRoaXMgd29ya3MuICBJIHRoaW5rIGl0IHdvcmtzIGFwcHJvcHJpYXRlbHkgYXQgdGhlIG1vbWVudCwgYmVjYXVzZSBpdCB0dXJucyB1c2VyIGlucHV0IGludG8gdGhlIHVzZXIgdGltZXpvbmUgb2YgY2hvaWNlLlxuICAgICAgICpcbiAgICAgICAqIFNvIGlmICB1c2VyIGVudGVycyB0aW1lIGluIGFub3RoZXIgdGltZXpvbmUgYnkgcGFzdGluZywgdGhlIGlucHV0IHdpbGwgZml4IGl0IGZvciB0aGVtIHRvIHNob3cgaXQgaW4gdGhlaXIgY2hvc2VuIHRpbWV6b25lLlxuICAgICAgICpcbiAgICAgICAqIFRMRFI6IHRoaXMgZnVuY3Rpb24gaXMgb25seSBjYWxsZWQgd2hlbiB0aGUgdXNlciBtYW51YWxseSB0eXBlcyBpbiBhIGRhdGVcbiAgICAgICAqL1xuICAgICAgcGFyc2VEYXRlOiAoaW5wdXQ/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlcihcbiAgICAgICAgICAgIGlucHV0IHx8ICcnLFxuICAgICAgICAgICAgRGF0ZUhlbHBlcnMuR2VuZXJhbC5nZXREYXRlRm9ybWF0KClcbiAgICAgICAgICApXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqIEJhc2ljYWxseSB1bmRvZXMgdGhlIHZhbHVlIHNoaWZ0IHRvIG1ha2Ugc3VyZSB0aGUgZGF0ZSBpcyBkaXNwbGF5ZWQgaW4gdXNlcidzIGNob3NlbiB0aW1lem9uZVxuICAgICAgICovXG4gICAgICBmb3JtYXREYXRlOiAoZGF0ZTogRGF0ZSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHVuc2hpZnRlZERhdGUgPVxuICAgICAgICAgICAgRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVW50aW1lc2hpZnRGcm9tRGF0ZVBpY2tlcihkYXRlKVxuICAgICAgICAgIHJldHVybiBtb21lbnQodW5zaGlmdGVkRGF0ZSlcbiAgICAgICAgICAgIC50eihEYXRlSGVscGVycy5HZW5lcmFsLmdldFRpbWVab25lKCkpXG4gICAgICAgICAgICAuZm9ybWF0KERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0RGF0ZUZvcm1hdCgpKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gJydcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGlzVmFsaWQ6IChcbiAgICAgICAgZGF0ZTogRGF0ZSxcbiAgICAgICAgbWluRGF0ZTogRGF0ZSA9IERlZmF1bHRNaW5EYXRlLFxuICAgICAgICBtYXhEYXRlOiBEYXRlID0gRGVmYXVsdE1heERhdGVcbiAgICAgICkgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIGRhdGUgJiYgaXNEYXRlVmFsaWQoZGF0ZSkgJiYgaXNEYXlJblJhbmdlKGRhdGUsIFttaW5EYXRlLCBtYXhEYXRlXSlcbiAgICAgICAgKVxuICAgICAgfSxcbiAgICB9LFxuICAgIERhdGVQcm9wczoge1xuICAgICAgZ2VuZXJhdGVPbkNoYW5nZTogKG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCkgPT4ge1xuICAgICAgICByZXR1cm4gKChzZWxlY3RlZERhdGUsIGlzVXNlckNoYW5nZSkgPT4ge1xuICAgICAgICAgIGlmIChzZWxlY3RlZERhdGUgJiYgaXNVc2VyQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCB1bnNoaWZ0ZWREYXRlID1cbiAgICAgICAgICAgICAgRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVW50aW1lc2hpZnRGcm9tRGF0ZVBpY2tlcihcbiAgICAgICAgICAgICAgICBzZWxlY3RlZERhdGVcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgb25DaGFuZ2UodW5zaGlmdGVkRGF0ZS50b0lTT1N0cmluZygpKVxuICAgICAgICAgIH1cbiAgICAgICAgfSkgYXMgSURhdGVJbnB1dFByb3BzWydvbkNoYW5nZSddXG4gICAgICB9LFxuICAgICAgZ2VuZXJhdGVWYWx1ZTogKHZhbHVlOiBzdHJpbmcsIG1pbkRhdGU/OiBEYXRlLCBtYXhEYXRlPzogRGF0ZSkgPT5cbiAgICAgICAgRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlcihcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBJU09fODYwMV9GT1JNQVRfWk9ORUQsXG4gICAgICAgICAgbWluRGF0ZSxcbiAgICAgICAgICBtYXhEYXRlXG4gICAgICAgICksXG4gICAgfSxcbiAgICBEYXRlUmFuZ2VQcm9wczoge1xuICAgICAgZ2VuZXJhdGVPbkNoYW5nZTogKG9uQ2hhbmdlOiAodmFsdWU6IFZhbHVlVHlwZXNbJ2R1cmluZyddKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIHJldHVybiAoKFtzdGFydCwgZW5kXSkgPT4ge1xuICAgICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICBzdGFydDogc3RhcnRcbiAgICAgICAgICAgICAgICA/IERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzXG4gICAgICAgICAgICAgICAgICAgIC5VbnRpbWVzaGlmdEZyb21EYXRlUGlja2VyKHN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIDogJycsXG4gICAgICAgICAgICAgIGVuZDogZW5kXG4gICAgICAgICAgICAgICAgPyBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29udmVydGVyc1xuICAgICAgICAgICAgICAgICAgICAuVW50aW1lc2hpZnRGcm9tRGF0ZVBpY2tlcihlbmQpXG4gICAgICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgOiAnJyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9KSBhcyBJRGF0ZVJhbmdlSW5wdXRQcm9wc1snb25DaGFuZ2UnXVxuICAgICAgfSxcbiAgICAgIC8vIG51bGwgaXMgaG93IHRoZSBibHVlcHJpbnQgZGF0ZXBpY2tlciByZXByZXNlbnRzIGFuIGVtcHR5IG9yIGludmFsaWQgZGF0ZVxuICAgICAgZ2VuZXJhdGVWYWx1ZTogKFxuICAgICAgICB2YWx1ZTogVmFsdWVUeXBlc1snZHVyaW5nJ10sXG4gICAgICAgIG1pbkRhdGU/OiBEYXRlLFxuICAgICAgICBtYXhEYXRlPzogRGF0ZVxuICAgICAgKSA9PlxuICAgICAgICBbXG4gICAgICAgICAgdmFsdWUuc3RhcnRcbiAgICAgICAgICAgID8gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlcihcbiAgICAgICAgICAgICAgICB2YWx1ZS5zdGFydCxcbiAgICAgICAgICAgICAgICBJU09fODYwMV9GT1JNQVRfWk9ORUQsXG4gICAgICAgICAgICAgICAgbWluRGF0ZSxcbiAgICAgICAgICAgICAgICBtYXhEYXRlXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgICB2YWx1ZS5lbmRcbiAgICAgICAgICAgID8gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlcihcbiAgICAgICAgICAgICAgICB2YWx1ZS5lbmQsXG4gICAgICAgICAgICAgICAgSVNPXzg2MDFfRk9STUFUX1pPTkVELFxuICAgICAgICAgICAgICAgIG1pbkRhdGUsXG4gICAgICAgICAgICAgICAgbWF4RGF0ZVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICA6IG51bGwsXG4gICAgICAgIF0gYXMgSURhdGVSYW5nZUlucHV0UHJvcHNbJ3ZhbHVlJ10sXG4gICAgfSxcbiAgICBjb252ZXJ0ZXJzOiB7XG4gICAgICAvKipcbiAgICAgICAqIFRoZSBkYXRlcGlja2VyIGZyb20gYmx1ZXByaW50IGRvZXNuJ3QgaGFuZGxlIHRpbWV6b25lcy4gIFNvIGlmIHdlIHdhbnQgdG8gbWFrZSBpdCBmZWVsIGxpa2UgdGhlIHVzZXIgaXMgaW4gdGhlaXJcbiAgICAgICAqIGNob3NlbiB0aW1lem9uZSwgd2UgaGF2ZSB0byBzaGlmdCB0aGUgZGF0ZSBvdXJzZWx2ZXMuICBTbyB3aGF0IHdlIGRvIGlzIHByZXRlbmQgdGhlIHZhbHVlIGlzIHV0YywgdGhlbiBjYWxjdWxhdGUgdGhlIG9mZnNldCBvZiB0aGUgY29tcHV0ZXIncyBsb2NhbCB0aW1lem9uZSBhbmQgdGhlIHRpbWV6b25lIHRoZSB1c2VyIHdhbnRzIHRvIGNyZWF0ZSBhIHRvdGFsIG9mZnNldC4gIFRoaXMgaXMgYmVjYXVzZSB0aGUgZGF0ZXBpY2tlciBpbnRlcm5hbGx5XG4gICAgICAgKiB1c2VzIGRhdGUsIHNvIHdlIGhhdmUgdG8gcHJldGVuZCB3ZSdyZSBpbiBsb2NhbCB0aW1lLiAgV2UgdGhlbiB0YWtlIHRoYXQgdXRjIGRhdGUgYW5kIGFkZCB0aGUgdG90YWxvZmZzZXQsIHRoZW4gdGVsbCB0aGUgZGF0ZXBpY2tlciB0aGF0IGlzIG91ciB2YWx1ZS4gIEFzIGEgcmVzdWx0LCB3aGVuIHRoZSBkYXRlcGlja2VyIGludGVybmFsbHkgdXNlcyBEYXRlIGl0IHdpbGwgc2hpZnQgYmFjayB0byB0aGUgY29ycmVjdCB0aW1lem9uZS5cbiAgICAgICAqXG4gICAgICAgKiBUTERSOiBVc2UgdGhpcyBvbiBhIGRhdGUgc3RyaW5nIGZvcm1hdHRlZCBpbiB0aGUgbWFubmVyIHNwZWNpZmllZCBieSB0aGUgcHJvdmlkZWQgZm9ybWF0IGdvaW5nIElOVE8gdGhlIGJsdWVwcmludCBkYXRlcGlja2VyICh0aGUgdmFsdWUgcHJvcCkuICBVc2UgdGhlIHNpYmxpbmcgZnVuY3Rpb24gVW50aW1lc2hpZnRGcm9tRGF0ZVBpY2tlciB0byByZXZlcnNlIHRoaXMuXG4gICAgICAgKi9cbiAgICAgIFRpbWVzaGlmdEZvckRhdGVQaWNrZXI6IChcbiAgICAgICAgdmFsdWU6IHN0cmluZyxcbiAgICAgICAgZm9ybWF0OiBzdHJpbmcsXG4gICAgICAgIG1pbkRhdGU/OiBEYXRlLFxuICAgICAgICBtYXhEYXRlPzogRGF0ZVxuICAgICAgKTogRGF0ZSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgdW5zaGlmdGVkRGF0ZSA9IG1vbWVudCh2YWx1ZSwgZm9ybWF0KVxuICAgICAgICAgIGlmICghdW5zaGlmdGVkRGF0ZS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29udmVydGVycy5UaW1lc2hpZnRGb3JEYXRlUGlja2VyKFxuICAgICAgICAgICAgICBtb21lbnQudXRjKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgSVNPXzg2MDFfRk9STUFUX1pPTkVEXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICAgIHN3aXRjaCAoRGF0ZUhlbHBlcnMuR2VuZXJhbC5nZXRUaW1lUHJlY2lzaW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgICAgICAgIHVuc2hpZnRlZERhdGUuc2Vjb25kcygwKVxuICAgICAgICAgICAgLy8gSW50ZW50aW9uYWwgZmFsbC10aHJvdWdoXG4gICAgICAgICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICAgICAgICB1bnNoaWZ0ZWREYXRlLm1pbGxpc2Vjb25kcygwKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB1dGNPZmZzZXRNaW51dGVzTG9jYWwgPSBuZXcgRGF0ZSgpLmdldFRpbWV6b25lT2Zmc2V0KClcbiAgICAgICAgICBjb25zdCB1dGNPZmZzZXRNaW51dGVzVGltZXpvbmUgPSBtb21lbnRcbiAgICAgICAgICAgIC50eih2YWx1ZSwgZm9ybWF0LCBEYXRlSGVscGVycy5HZW5lcmFsLmdldFRpbWVab25lKCkpIC8vIHBhc3MgaW4gdGhlIHZhbHVlLCBvdGhlcndpc2UgaXQgd29uJ3QgYWNjb3VudCBmb3IgZGF5bGlnaHQgc2F2aW5ncyB0aW1lIVxuICAgICAgICAgICAgLnV0Y09mZnNldCgpXG4gICAgICAgICAgY29uc3QgdG90YWxPZmZzZXQgPSB1dGNPZmZzZXRNaW51dGVzTG9jYWwgKyB1dGNPZmZzZXRNaW51dGVzVGltZXpvbmVcbiAgICAgICAgICBjb25zdCBzaGlmdGVkRGF0ZSA9IHVuc2hpZnRlZERhdGUuYWRkKHRvdGFsT2Zmc2V0LCAnbWludXRlcycpXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgc2hpZnRlZERhdGUuaXNWYWxpZCgpICYmXG4gICAgICAgICAgICBEYXRlSGVscGVycy5CbHVlcHJpbnQuY29tbW9uUHJvcHMuaXNWYWxpZChcbiAgICAgICAgICAgICAgc2hpZnRlZERhdGUudG9EYXRlKCksXG4gICAgICAgICAgICAgIG1pbkRhdGUsXG4gICAgICAgICAgICAgIG1heERhdGVcbiAgICAgICAgICAgIClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBzaGlmdGVkRGF0ZS50b0RhdGUoKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gRGF0ZUhlbHBlcnMuQmx1ZXByaW50LmNvbnZlcnRlcnMuVGltZXNoaWZ0Rm9yRGF0ZVBpY2tlcihcbiAgICAgICAgICAgICAgbW9tZW50LnV0YygpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgIElTT184NjAxX0ZPUk1BVF9aT05FRFxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgICAgcmV0dXJuIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb252ZXJ0ZXJzLlRpbWVzaGlmdEZvckRhdGVQaWNrZXIoXG4gICAgICAgICAgICBtb21lbnQudXRjKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIElTT184NjAxX0ZPUk1BVF9aT05FRFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8qKlxuICAgICAgICogVGhlIGZvcm0gd2l0aGluIHRoZSBkYXRlcGlja2VyIGlzIFRpbWVzaGlmdGVkLCBzbyB3ZSBoYXZlIHRvIHVudGltZXNoaWZ0IHRoaW5ncyBhcyB0aGV5IGNvbWUgb3V0IG9mIHRoZSBkYXRlcGlja2VyLlxuICAgICAgICogU2VlIFRpbWVzaGlmdEZvckRhdGVQaWNrZXIsIHNpbmNlIHdlJ3JlIHVuZG9pbmcgd2hhdCB3ZSBkbyB0aGVyZVxuICAgICAgICpcbiAgICAgICAqIFRMRFI6IFVzZSB0aGlzIG9uIHRoZSBEYXRlIG9iamVjdCBjb21pbmcgb3V0IG9mIHRoZSBCbHVlcHJpbnQgZGF0ZXBpY2tlciAob25seSBpZiB5b3UgdXNlZCB0aGUgc2libGluZyBmdW5jdGlvbiB0byBmb3JtYXQgdGhlIHZhbHVlIGdvaW5nIGluIG9mIGNvdXJzZSwgc2luY2UgaXQgcmV2ZXJzZXMgaXQpLiAgVGhhdCBtZWFucyB0aGUgdXNlIHRoaXMgaW4gdGhlIG9uQ2hhbmdlIHByb3AgYW5kIHRoZSBmb3JtYXREYXRlIHByb3AuXG4gICAgICAgKi9cbiAgICAgIFVudGltZXNoaWZ0RnJvbURhdGVQaWNrZXI6ICh2YWx1ZTogRGF0ZSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHNoaWZ0ZWREYXRlID0gbW9tZW50KHZhbHVlKVxuICAgICAgICAgIHN3aXRjaCAoRGF0ZUhlbHBlcnMuR2VuZXJhbC5nZXRUaW1lUHJlY2lzaW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgICAgICAgIHNoaWZ0ZWREYXRlLnNlY29uZHMoMClcbiAgICAgICAgICAgIC8vIEludGVudGlvbmFsIGZhbGwtdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgICAgICAgc2hpZnRlZERhdGUubWlsbGlzZWNvbmRzKDApXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHV0Y09mZnNldE1pbnV0ZXNMb2NhbCA9IG5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKVxuICAgICAgICAgIGNvbnN0IHV0Y09mZnNldE1pbnV0ZXNUaW1lem9uZSA9IG1vbWVudFxuICAgICAgICAgICAgLnR6KHZhbHVlLCBEYXRlSGVscGVycy5HZW5lcmFsLmdldFRpbWVab25lKCkpIC8vIHBhc3MgaW4gdGhlIHZhbHVlLCBvdGhlcndpc2UgaXQgd29uJ3QgYWNjb3VudCBmb3IgZGF5bGlnaHQgc2F2aW5ncyB0aW1lIVxuICAgICAgICAgICAgLnV0Y09mZnNldCgpXG4gICAgICAgICAgY29uc3QgdG90YWxPZmZzZXQgPSB1dGNPZmZzZXRNaW51dGVzTG9jYWwgKyB1dGNPZmZzZXRNaW51dGVzVGltZXpvbmVcbiAgICAgICAgICByZXR1cm4gc2hpZnRlZERhdGUuc3VidHJhY3QodG90YWxPZmZzZXQsICdtaW51dGVzJykudG9EYXRlKClcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgICAgcmV0dXJuIERhdGVIZWxwZXJzLkdlbmVyYWwud2l0aFByZWNpc2lvbihuZXcgRGF0ZSgpKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgb3V0cHV0IGZyb20gdGhlIG9uQ2hhbmdlIGlzIGFuIElTT1N0cmluZy4gVGhpcyBjb252ZXJ0cyBpdCB0byBhIHN0cmluZyBpbiB0aGUgdXNlcidzIHRpbWV6b25lIGFuZCBwcmVmZXJyZWQgZm9ybWF0LlxuICAgICAgICpcbiAgICAgICAqIFRMRFI6IFVzZSB0aGlzIG9uIHRoZSBzdHJpbmcgZnJvbSB0aGUgb25DaGFuZ2Ugd2hlbiB5b3Ugd2FudCB0byBkaXNwbGF5IGl0LlxuICAgICAgICovXG4gICAgICBJU090b0Zvcm1hdHRlZFN0cmluZzogKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZSA9IERhdGVIZWxwZXJzLkJsdWVwcmludC5EYXRlUHJvcHMuZ2VuZXJhdGVWYWx1ZSh2YWx1ZSlcbiAgICAgICAgcmV0dXJuIERhdGVIZWxwZXJzLkJsdWVwcmludC5jb21tb25Qcm9wcy5mb3JtYXREYXRlKGRhdGUpXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59XG4iXX0=