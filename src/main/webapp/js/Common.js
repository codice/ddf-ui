import { __read, __values } from "tslib";
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
/*jshint bitwise: false*/
import $ from 'jquery';
import moment from 'moment';
import './requestAnimationFramePolyfill';
import { cacheBustUrl } from './cache-bust-url';
var timeZones = {
    UTC: 'Etc/UTC',
    '-12': 'Etc/GMT+12',
    '-11': 'Etc/GMT+11',
    '-10': 'Etc/GMT+10',
    '-9': 'Etc/GMT+9',
    '-8': 'Etc/GMT+8',
    '-7': 'Etc/GMT+7',
    '-6': 'Etc/GMT+6',
    '-5': 'Etc/GMT+5',
    '-4': 'Etc/GMT+4',
    '-3': 'Etc/GMT+3',
    '-2': 'Etc/GMT+2',
    '-1': 'Etc/GMT+1',
    1: 'Etc/GMT-1',
    2: 'Etc/GMT-2',
    3: 'Etc/GMT-3',
    4: 'Etc/GMT-4',
    5: 'Etc/GMT-5',
    6: 'Etc/GMT-6',
    7: 'Etc/GMT-7',
    8: 'Etc/GMT-8',
    9: 'Etc/GMT-9',
    10: 'Etc/GMT-10',
    11: 'Etc/GMT-11',
    12: 'Etc/GMT-12',
};
var dateTimeFormats = {
    ISO: {
        millisecond: {
            datetimefmt: 'YYYY-MM-DD[T]HH:mm:ss.SSSZ',
            timefmt: 'HH:mm:ssZ',
        },
        second: { datetimefmt: 'YYYY-MM-DD[T]HH:mm:ssZ', timefmt: 'HH:mm:ssZ' },
        minute: { datetimefmt: 'YYYY-MM-DD[T]HH:mmZ', timefmt: 'HH:mmZ' },
    },
    '24': {
        millisecond: {
            datetimefmt: 'DD MMM YYYY HH:mm:ss.SSS Z',
            timefmt: 'HH:mm:ss Z',
        },
        second: {
            datetimefmt: 'DD MMM YYYY HH:mm:ss Z',
            timefmt: 'HH:mm:ss Z',
        },
        minute: {
            datetimefmt: 'DD MMM YYYY HH:mm Z',
            timefmt: 'HH:mm Z',
        },
    },
    '12': {
        millisecond: {
            datetimefmt: 'DD MMM YYYY hh:mm:ss.SSS a Z',
            timefmt: 'hh:mm:ss a Z',
        },
        second: {
            datetimefmt: 'DD MMM YYYY hh:mm:ss a Z',
            timefmt: 'hh:mm:ss a Z',
        },
        minute: {
            datetimefmt: 'DD MMM YYYY hh:mm a Z',
            timefmt: 'hh:mm a Z',
        },
    },
};
var dateTimeFormatsReverseMap = Object.entries(dateTimeFormats).reduce(function (map, val) {
    var e_1, _a;
    var format = val[0];
    try {
        for (var _b = __values(Object.entries(val[1])), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), precision = _d[0], formats = _d[1];
            map[formats.datetimefmt] = {
                format: format,
                precision: precision,
            };
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return map;
}, {});
var timeFormatsReverseMap = Object.entries(dateTimeFormats).reduce(function (map, val) {
    var e_2, _a;
    var format = val[0];
    try {
        for (var _b = __values(Object.entries(val[1])), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), precision = _d[0], formats = _d[1];
            map[formats.timefmt] = { format: format, precision: precision };
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return map;
}, {});
export var Common = {
    //randomly generated guid guaranteed to be unique ;)
    undefined: '2686dcb5-7578-4957-974d-aaa9289cd2f0',
    coreTransitionTime: 250,
    cqlToHumanReadable: function (cql) {
        if (cql === undefined) {
            return cql;
        }
        cql = cql.replace(new RegExp('anyText ILIKE ', 'g'), '~');
        cql = cql.replace(new RegExp('anyText LIKE ', 'g'), '');
        cql = cql.replace(new RegExp('AFTER', 'g'), '>');
        cql = cql.replace(new RegExp('DURING', 'g'), 'BETWEEN');
        return cql;
    },
    getFileSize: function (item) {
        if (item === undefined || item === null) {
            return 'Unknown Size';
        }
        var givenProductSize = (item === null || item === void 0 ? void 0 : item.replace(/[,]+/g, '').trim()) || '';
        //remove any commas and trailing whitespace
        var bytes = parseInt(givenProductSize, 10);
        var noUnitsGiven = /[0-9]$/;
        //number without a word following
        var reformattedProductSize = givenProductSize.replace(/\s\s+/g, ' ');
        //remove extra whitespaces
        var finalFormatProductSize = reformattedProductSize.replace(/([0-9])([a-zA-Z])/g, '$1 $2');
        //make sure there is exactly one space between number and unit
        var sizeArray = finalFormatProductSize.split(' ');
        //splits size into number and unit
        if (isNaN(bytes)) {
            return 'Unknown Size';
        }
        if (noUnitsGiven.test(givenProductSize)) {
            //need to parse number given and add units, number is assumed to be bytes
            var size = void 0, index = void 0, type = ['bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) {
                return '0 bytes';
            }
            else {
                index = Math.floor(Math.log(bytes) / Math.log(1024));
                if (index > 4) {
                    index = 4;
                }
                size = (bytes / Math.pow(1024, index)).toFixed(index < 2 ? 0 : 1);
            }
            return size + ' ' + type[index];
        }
        else {
            //units were included with size
            switch (sizeArray[1].toLowerCase()) {
                case 'bytes':
                    return sizeArray[0] + ' bytes';
                case 'b':
                    return sizeArray[0] + ' bytes';
                case 'kb':
                    return sizeArray[0] + ' KB';
                case 'kilobytes':
                    return sizeArray[0] + ' KB';
                case 'kbytes':
                    return sizeArray[0] + ' KB';
                case 'mb':
                    return sizeArray[0] + ' MB';
                case 'megabytes':
                    return sizeArray[0] + ' MB';
                case 'mbytes':
                    return sizeArray[0] + ' MB';
                case 'gb':
                    return sizeArray[0] + ' GB';
                case 'gigabytes':
                    return sizeArray[0] + ' GB';
                case 'gbytes':
                    return sizeArray[0] + ' GB';
                case 'tb':
                    return sizeArray[0] + ' TB';
                case 'terabytes':
                    return sizeArray[0] + ' TB';
                case 'tbytes':
                    return sizeArray[0] + ' TB';
                default:
                    return 'Unknown Size';
            }
        }
    },
    //can be deleted once histogram changes are merged
    getHumanReadableDateTime: function (date) {
        return moment(date).format(dateTimeFormats['24']['second']['datetimefmt']);
    },
    getDateTimeFormats: function () {
        return dateTimeFormats;
    },
    getDateTimeFormatsReverseMap: function () {
        return dateTimeFormatsReverseMap;
    },
    getTimeFormatsReverseMap: function () {
        return timeFormatsReverseMap;
    },
    getTimeZones: function () {
        return timeZones;
    },
    getRelativeDate: function (date) {
        return "".concat(moment(date).fromNow());
    },
    getImageSrc: function (img) {
        if (typeof img === 'string' &&
            (img === '' || img.substring(0, 4) === 'http'))
            return cacheBustUrl(img);
        if (typeof img === 'string' && img.startsWith('data:image/png;base64,'))
            return img;
        return 'data:image/png;base64,' + img;
    },
    getResourceUrlFromThumbUrl: function (url) {
        return url.replace(/=thumbnail[_=&\d\w\s;]+/, '=resource');
    },
    cancelRepaintForTimeframe: function (requestDetails) {
        if (requestDetails) {
            window.cancelAnimationFrame(requestDetails.requestId);
        }
    },
    repaintForTimeframe: function (time, callback) {
        var requestDetails = {
            requestId: undefined,
        };
        var timeEnd = Date.now() + time;
        var repaint = function () {
            callback();
            if (Date.now() < timeEnd) {
                requestDetails.requestId = window.requestAnimationFrame(function () {
                    repaint();
                });
            }
        };
        requestDetails.requestId = window.requestAnimationFrame(function () {
            repaint();
        });
        return requestDetails;
    },
    escapeHTML: function (value) {
        return $('<div>').text(value).html();
    },
    wrapMapCoordinates: function (x, _a) {
        var _b = __read(_a, 2), min = _b[0], max = _b[1];
        var d = max - min;
        return ((((x - min) % d) + d) % d) + min;
    },
    wrapMapCoordinatesArray: function (coordinates) {
        var _this = this;
        return coordinates.map(function (_a) {
            var _b = __read(_a, 2), lon = _b[0], lat = _b[1];
            return [
                _this.wrapMapCoordinates(lon, [-180, 180]),
                _this.wrapMapCoordinates(lat, [-90, 90]),
            ];
        });
    },
};
export default Common;
//# sourceMappingURL=Common.js.map