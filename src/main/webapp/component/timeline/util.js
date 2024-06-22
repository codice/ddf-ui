import * as d3 from 'd3';
import moment from 'moment-timezone';
import user from '../singletons/user-instance';
/** Python's "range" function */
export var range = function (n) { return Array.from(Array(n).keys()); };
var getDataPoint = function (num, createdYear, modifiedYear, publishedYear) {
    var month = Math.floor(Math.random() * 12);
    var year = Math.floor(Math.random() * 40);
    var day = Math.floor(Math.random() * 28);
    return {
        id: "Result ".concat((num + 1).toString()),
        selected: false,
        attributes: {
            created: [
                moment(new Date(createdYear + year, 0, 1))
                    .add(month, 'months')
                    .add(day, 'days'),
            ],
            modified: [moment(new Date(modifiedYear + year, 0, 1))],
            published_date: [
                moment(new Date(publishedYear + year, 0, 1)).add(day, 'days'),
            ],
        },
    };
};
export var createTestData = function (n) {
    if (typeof n !== 'number' || n < 1) {
        return [];
    }
    return range(n).map(function (num) { return getDataPoint(num, 1980, 1983, 1987); });
};
export var formatDate = function (value, format) {
    return value.format(format);
};
export var convertToDisplayable = function (value, timezone, format) { return moment(value).tz(timezone).format(format); };
export var dateWithinRange = function (date, range) {
    return range[0] < date && date < range[1];
};
var is12HourFormat = function (format) { return format.includes('h'); };
var timeFormat = function (format) {
    return function (date) { return moment(date).tz(user.getTimeZone()).format(format); };
};
var formatMillisecond = timeFormat(':SSS');
var formatSecond = timeFormat(':ss');
var formatDay = timeFormat('ddd DD');
var formatWeek = timeFormat('MMM DD');
var formatMonth = timeFormat('MMMM');
var formatYear = timeFormat('YYYY');
export var multiFormat = function (date) {
    if (d3.utcSecond(date) < date) {
        return formatMillisecond(date); // milliseconds :259
    }
    else if (d3.utcMinute(date) < date) {
        return formatSecond(date); // seconds :59
    }
    else if (d3.utcHour(date) < date) {
        var formatMinute = is12HourFormat(user.getDateTimeFormat())
            ? timeFormat('hh:mm')
            : timeFormat('HH:mm');
        return formatMinute(date); // 12:00
    }
    else if (d3.utcDay(date) < date) {
        var formatHour = is12HourFormat(user.getDateTimeFormat())
            ? timeFormat('hh A')
            : timeFormat('HH:mm');
        return formatHour(date); // 12 AM or 12:00
    }
    else if (d3.utcMonth(date) < date) {
        if (d3.utcWeek(date) < date) {
            return formatDay(date); // Wed 08
        }
        else {
            return formatWeek(date); // Feb 08
        }
    }
    else if (d3.utcYear(date) < date) {
        return formatMonth(date); // February
    }
    else {
        return formatYear(date); // 2003
    }
};
//# sourceMappingURL=util.js.map