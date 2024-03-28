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
//# sourceMappingURL=date-helpers.js.map