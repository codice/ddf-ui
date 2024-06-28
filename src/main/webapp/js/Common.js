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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL0NvbW1vbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSix5QkFBeUI7QUFDekIsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUMzQixPQUFPLGlDQUFpQyxDQUFBO0FBRXhDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUMvQyxJQUFNLFNBQVMsR0FBRztJQUNoQixHQUFHLEVBQUUsU0FBUztJQUNkLEtBQUssRUFBRSxZQUFZO0lBQ25CLEtBQUssRUFBRSxZQUFZO0lBQ25CLEtBQUssRUFBRSxZQUFZO0lBQ25CLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxXQUFXO0lBQ2pCLENBQUMsRUFBRSxXQUFXO0lBQ2QsQ0FBQyxFQUFFLFdBQVc7SUFDZCxDQUFDLEVBQUUsV0FBVztJQUNkLENBQUMsRUFBRSxXQUFXO0lBQ2QsQ0FBQyxFQUFFLFdBQVc7SUFDZCxDQUFDLEVBQUUsV0FBVztJQUNkLENBQUMsRUFBRSxXQUFXO0lBQ2QsQ0FBQyxFQUFFLFdBQVc7SUFDZCxDQUFDLEVBQUUsV0FBVztJQUNkLEVBQUUsRUFBRSxZQUFZO0lBQ2hCLEVBQUUsRUFBRSxZQUFZO0lBQ2hCLEVBQUUsRUFBRSxZQUFZO0NBQ2pCLENBQUE7QUFDRCxJQUFNLGVBQWUsR0FBRztJQUN0QixHQUFHLEVBQUU7UUFDSCxXQUFXLEVBQUU7WUFDWCxXQUFX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RSxDQUFDLENBQUM7YUFDeEM7UUFIc0MsQ0FHdEMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUE7QUFDRCxlQUFlLE1BQU0sQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLypqc2hpbnQgYml0d2lzZTogZmFsc2UqL1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnXG5pbXBvcnQgJy4vcmVxdWVzdEFuaW1hdGlvbkZyYW1lUG9seWZpbGwnXG5pbXBvcnQgeyBUaW1lUHJlY2lzaW9uIH0gZnJvbSAnQGJsdWVwcmludGpzL2RhdGV0aW1lJ1xuaW1wb3J0IHsgY2FjaGVCdXN0VXJsIH0gZnJvbSAnLi9jYWNoZS1idXN0LXVybCdcbmNvbnN0IHRpbWVab25lcyA9IHtcbiAgVVRDOiAnRXRjL1VUQycsXG4gICctMTInOiAnRXRjL0dNVCsxMicsXG4gICctMTEnOiAnRXRjL0dNVCsxMScsXG4gICctMTAnOiAnRXRjL0dNVCsxMCcsXG4gICctOSc6ICdFdGMvR01UKzknLFxuICAnLTgnOiAnRXRjL0dNVCs4JyxcbiAgJy03JzogJ0V0Yy9HTVQrNycsXG4gICctNic6ICdFdGMvR01UKzYnLFxuICAnLTUnOiAnRXRjL0dNVCs1JyxcbiAgJy00JzogJ0V0Yy9HTVQrNCcsXG4gICctMyc6ICdFdGMvR01UKzMnLFxuICAnLTInOiAnRXRjL0dNVCsyJyxcbiAgJy0xJzogJ0V0Yy9HTVQrMScsXG4gIDE6ICdFdGMvR01ULTEnLFxuICAyOiAnRXRjL0dNVC0yJyxcbiAgMzogJ0V0Yy9HTVQtMycsXG4gIDQ6ICdFdGMvR01ULTQnLFxuICA1OiAnRXRjL0dNVC01JyxcbiAgNjogJ0V0Yy9HTVQtNicsXG4gIDc6ICdFdGMvR01ULTcnLFxuICA4OiAnRXRjL0dNVC04JyxcbiAgOTogJ0V0Yy9HTVQtOScsXG4gIDEwOiAnRXRjL0dNVC0xMCcsXG4gIDExOiAnRXRjL0dNVC0xMScsXG4gIDEyOiAnRXRjL0dNVC0xMicsXG59XG5jb25zdCBkYXRlVGltZUZvcm1hdHMgPSB7XG4gIElTTzoge1xuICAgIG1pbGxpc2Vjb25kOiB7XG4gICAgICBkYXRldGltZWZtdDogJ1lZWVktTU0tRERbVF1ISDptbTpzcy5TU1NaJyxcbiAgICAgIHRpbWVmbXQ6ICdISDptbTpzc1onLFxuICAgIH0sXG4gICAgc2Vjb25kOiB7IGRhdGV0aW1lZm10OiAnWVlZWS1NTS1ERFtUXUhIOm1tOnNzWicsIHRpbWVmbXQ6ICdISDptbTpzc1onIH0sXG4gICAgbWludXRlOiB7IGRhdGV0aW1lZm10OiAnWVlZWS1NTS1ERFtUXUhIOm1tWicsIHRpbWVmbXQ6ICdISDptbVonIH0sXG4gIH0sXG4gICcyNCc6IHtcbiAgICBtaWxsaXNlY29uZDoge1xuICAgICAgZGF0ZXRpbWVmbXQ6ICdERCBNTU0gWVlZWSBISDptbTpzcy5TU1MgWicsXG4gICAgICB0aW1lZm10OiAnSEg6bW06c3MgWicsXG4gICAgfSxcbiAgICBzZWNvbmQ6IHtcbiAgICAgIGRhdGV0aW1lZm10OiAnREQgTU1NIFlZWVkgSEg6bW06c3MgWicsXG4gICAgICB0aW1lZm10OiAnSEg6bW06c3MgWicsXG4gICAgfSxcbiAgICBtaW51dGU6IHtcbiAgICAgIGRhdGV0aW1lZm10OiAnREQgTU1NIFlZWVkgSEg6bW0gWicsXG4gICAgICB0aW1lZm10OiAnSEg6bW0gWicsXG4gICAgfSxcbiAgfSxcbiAgJzEyJzoge1xuICAgIG1pbGxpc2Vjb25kOiB7XG4gICAgICBkYXRldGltZWZtdDogJ0REIE1NTSBZWVlZIGhoOm1tOnNzLlNTUyBhIFonLFxuICAgICAgdGltZWZtdDogJ2hoOm1tOnNzIGEgWicsXG4gICAgfSxcbiAgICBzZWNvbmQ6IHtcbiAgICAgIGRhdGV0aW1lZm10OiAnREQgTU1NIFlZWVkgaGg6bW06c3MgYSBaJyxcbiAgICAgIHRpbWVmbXQ6ICdoaDptbTpzcyBhIFonLFxuICAgIH0sXG4gICAgbWludXRlOiB7XG4gICAgICBkYXRldGltZWZtdDogJ0REIE1NTSBZWVlZIGhoOm1tIGEgWicsXG4gICAgICB0aW1lZm10OiAnaGg6bW0gYSBaJyxcbiAgICB9LFxuICB9LFxufSBhcyB7XG4gIFtrZXk6IHN0cmluZ106IHtcbiAgICBba2V5IGluIGtleW9mIFRpbWVQcmVjaXNpb24gYXMgVGltZVByZWNpc2lvbl06IHtcbiAgICAgIGRhdGV0aW1lZm10OiBzdHJpbmdcbiAgICAgIHRpbWVmbXQ6IHN0cmluZ1xuICAgIH1cbiAgfVxufVxuY29uc3QgZGF0ZVRpbWVGb3JtYXRzUmV2ZXJzZU1hcCA9IE9iamVjdC5lbnRyaWVzKGRhdGVUaW1lRm9ybWF0cykucmVkdWNlKFxuICAobWFwLCB2YWwpID0+IHtcbiAgICBjb25zdCBmb3JtYXQgPSB2YWxbMF1cbiAgICBmb3IgKGNvbnN0IFtwcmVjaXNpb24sIGZvcm1hdHNdIG9mIE9iamVjdC5lbnRyaWVzKHZhbFsxXSkpIHtcbiAgICAgIG1hcFtmb3JtYXRzLmRhdGV0aW1lZm10XSA9IHtcbiAgICAgICAgZm9ybWF0LFxuICAgICAgICBwcmVjaXNpb246IHByZWNpc2lvbiBhcyBUaW1lUHJlY2lzaW9uLFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwXG4gIH0sXG4gIHt9IGFzIHsgW2tleTogc3RyaW5nXTogeyBmb3JtYXQ6IHN0cmluZzsgcHJlY2lzaW9uOiBUaW1lUHJlY2lzaW9uIH0gfVxuKVxuY29uc3QgdGltZUZvcm1hdHNSZXZlcnNlTWFwID0gT2JqZWN0LmVudHJpZXMoZGF0ZVRpbWVGb3JtYXRzKS5yZWR1Y2UoXG4gIChtYXAsIHZhbCkgPT4ge1xuICAgIGNvbnN0IGZvcm1hdCA9IHZhbFswXVxuICAgIGZvciAoY29uc3QgW3ByZWNpc2lvbiwgZm9ybWF0c10gb2YgT2JqZWN0LmVudHJpZXModmFsWzFdKSkge1xuICAgICAgbWFwW2Zvcm1hdHMudGltZWZtdF0gPSB7IGZvcm1hdCwgcHJlY2lzaW9uOiBwcmVjaXNpb24gYXMgVGltZVByZWNpc2lvbiB9XG4gICAgfVxuICAgIHJldHVybiBtYXBcbiAgfSxcbiAge30gYXMgeyBba2V5OiBzdHJpbmddOiB7IGZvcm1hdDogc3RyaW5nOyBwcmVjaXNpb246IFRpbWVQcmVjaXNpb24gfSB9XG4pXG5leHBvcnQgY29uc3QgQ29tbW9uID0ge1xuICAvL3JhbmRvbWx5IGdlbmVyYXRlZCBndWlkIGd1YXJhbnRlZWQgdG8gYmUgdW5pcXVlIDspXG4gIHVuZGVmaW5lZDogJzI2ODZkY2I1LTc1NzgtNDk1Ny05NzRkLWFhYTkyODljZDJmMCcsXG4gIGNvcmVUcmFuc2l0aW9uVGltZTogMjUwLFxuICBjcWxUb0h1bWFuUmVhZGFibGUoY3FsPzogc3RyaW5nKSB7XG4gICAgaWYgKGNxbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gY3FsXG4gICAgfVxuICAgIGNxbCA9IGNxbC5yZXBsYWNlKG5ldyBSZWdFeHAoJ2FueVRleHQgSUxJS0UgJywgJ2cnKSwgJ34nKVxuICAgIGNxbCA9IGNxbC5yZXBsYWNlKG5ldyBSZWdFeHAoJ2FueVRleHQgTElLRSAnLCAnZycpLCAnJylcbiAgICBjcWwgPSBjcWwucmVwbGFjZShuZXcgUmVnRXhwKCdBRlRFUicsICdnJyksICc+JylcbiAgICBjcWwgPSBjcWwucmVwbGFjZShuZXcgUmVnRXhwKCdEVVJJTkcnLCAnZycpLCAnQkVUV0VFTicpXG4gICAgcmV0dXJuIGNxbFxuICB9LFxuICBnZXRGaWxlU2l6ZShpdGVtPzogc3RyaW5nKSB7XG4gICAgaWYgKGl0ZW0gPT09IHVuZGVmaW5lZCB8fCBpdGVtID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJ1Vua25vd24gU2l6ZSdcbiAgICB9XG4gICAgY29uc3QgZ2l2ZW5Qcm9kdWN0U2l6ZSA9IGl0ZW0/LnJlcGxhY2UoL1ssXSsvZywgJycpLnRyaW0oKSB8fCAnJ1xuICAgIC8vcmVtb3ZlIGFueSBjb21tYXMgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICBjb25zdCBieXRlcyA9IHBhcnNlSW50KGdpdmVuUHJvZHVjdFNpemUsIDEwKVxuICAgIGNvbnN0IG5vVW5pdHNHaXZlbiA9IC9bMC05XSQvXG4gICAgLy9udW1iZXIgd2l0aG91dCBhIHdvcmQgZm9sbG93aW5nXG4gICAgY29uc3QgcmVmb3JtYXR0ZWRQcm9kdWN0U2l6ZSA9IGdpdmVuUHJvZHVjdFNpemUucmVwbGFjZSgvXFxzXFxzKy9nLCAnICcpXG4gICAgLy9yZW1vdmUgZXh0cmEgd2hpdGVzcGFjZXNcbiAgICBjb25zdCBmaW5hbEZvcm1hdFByb2R1Y3RTaXplID0gcmVmb3JtYXR0ZWRQcm9kdWN0U2l6ZS5yZXBsYWNlKFxuICAgICAgLyhbMC05XSkoW2EtekEtWl0pL2csXG4gICAgICAnJDEgJDInXG4gICAgKVxuICAgIC8vbWFrZSBzdXJlIHRoZXJlIGlzIGV4YWN0bHkgb25lIHNwYWNlIGJldHdlZW4gbnVtYmVyIGFuZCB1bml0XG4gICAgY29uc3Qgc2l6ZUFycmF5ID0gZmluYWxGb3JtYXRQcm9kdWN0U2l6ZS5zcGxpdCgnICcpXG4gICAgLy9zcGxpdHMgc2l6ZSBpbnRvIG51bWJlciBhbmQgdW5pdFxuICAgIGlmIChpc05hTihieXRlcykpIHtcbiAgICAgIHJldHVybiAnVW5rbm93biBTaXplJ1xuICAgIH1cbiAgICBpZiAobm9Vbml0c0dpdmVuLnRlc3QoZ2l2ZW5Qcm9kdWN0U2l6ZSkpIHtcbiAgICAgIC8vbmVlZCB0byBwYXJzZSBudW1iZXIgZ2l2ZW4gYW5kIGFkZCB1bml0cywgbnVtYmVyIGlzIGFzc3VtZWQgdG8gYmUgYnl0ZXNcbiAgICAgIGxldCBzaXplLFxuICAgICAgICBpbmRleCxcbiAgICAgICAgdHlwZSA9IFsnYnl0ZXMnLCAnS0InLCAnTUInLCAnR0InLCAnVEInXVxuICAgICAgaWYgKGJ5dGVzID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnMCBieXRlcydcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZygxMDI0KSlcbiAgICAgICAgaWYgKGluZGV4ID4gNCkge1xuICAgICAgICAgIGluZGV4ID0gNFxuICAgICAgICB9XG4gICAgICAgIHNpemUgPSAoYnl0ZXMgLyBNYXRoLnBvdygxMDI0LCBpbmRleCkpLnRvRml4ZWQoaW5kZXggPCAyID8gMCA6IDEpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2l6ZSArICcgJyArIHR5cGVbaW5kZXhdXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vdW5pdHMgd2VyZSBpbmNsdWRlZCB3aXRoIHNpemVcbiAgICAgIHN3aXRjaCAoc2l6ZUFycmF5WzFdLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnYnl0ZXMnOlxuICAgICAgICAgIHJldHVybiBzaXplQXJyYXlbMF0gKyAnIGJ5dGVzJ1xuICAgICAgICBjYXNlICdiJzpcbiAgICAgICAgICByZXR1cm4gc2l6ZUFycmF5WzBdICsgJyBieXRlcydcbiAgICAgICAgY2FzZSAna2InOlxuICAgICAgICAgIHJldHVybiBzaXplQXJyYXlbMF0gKyAnIEtCJ1xuICAgICAgICBjYXNlICdraWxvYnl0ZXMnOlxuICAgICAgICAgIHJldHVybiBzaXplQXJyYXlbMF0gKyAnIEtCJ1xuICAgICAgICBjYXNlICdrYnl0ZXMnOlxuICAgICAgICAgIHJldHVybiBzaXplQXJyYXlbMF0gKyAnIEtCJ1xuICAgICAgICBjYXNlICdtYic6XG4gICAgICAgICAgcmV0dXJuIHNpemVBcnJheVswXSArICcgTUInXG4gICAgICAgIGNhc2UgJ21lZ2FieXRlcyc6XG4gICAgICAgICAgcmV0dXJuIHNpemVBcnJheVswXSArICcgTUInXG4gICAgICAgIGNhc2UgJ21ieXRlcyc6XG4gICAgICAgICAgcmV0dXJuIHNpemVBcnJheVswXSArICcgTUInXG4gICAgICAgIGNhc2UgJ2diJzpcbiAgICAgICAgICByZXR1cm4gc2l6ZUFycmF5WzBdICsgJyBHQidcbiAgICAgICAgY2FzZSAnZ2lnYWJ5dGVzJzpcbiAgICAgICAgICByZXR1cm4gc2l6ZUFycmF5WzBdICsgJyBHQidcbiAgICAgICAgY2FzZSAnZ2J5dGVzJzpcbiAgICAgICAgICByZXR1cm4gc2l6ZUFycmF5WzBdICsgJyBHQidcbiAgICAgICAgY2FzZSAndGInOlxuICAgICAgICAgIHJldHVybiBzaXplQXJyYXlbMF0gKyAnIFRCJ1xuICAgICAgICBjYXNlICd0ZXJhYnl0ZXMnOlxuICAgICAgICAgIHJldHVybiBzaXplQXJyYXlbMF0gKyAnIFRCJ1xuICAgICAgICBjYXNlICd0Ynl0ZXMnOlxuICAgICAgICAgIHJldHVybiBzaXplQXJyYXlbMF0gKyAnIFRCJ1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiAnVW5rbm93biBTaXplJ1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgLy9jYW4gYmUgZGVsZXRlZCBvbmNlIGhpc3RvZ3JhbSBjaGFuZ2VzIGFyZSBtZXJnZWRcbiAgZ2V0SHVtYW5SZWFkYWJsZURhdGVUaW1lKGRhdGU6IHN0cmluZykge1xuICAgIHJldHVybiBtb21lbnQoZGF0ZSkuZm9ybWF0KGRhdGVUaW1lRm9ybWF0c1snMjQnXVsnc2Vjb25kJ11bJ2RhdGV0aW1lZm10J10pXG4gIH0sXG4gIGdldERhdGVUaW1lRm9ybWF0cygpIHtcbiAgICByZXR1cm4gZGF0ZVRpbWVGb3JtYXRzXG4gIH0sXG4gIGdldERhdGVUaW1lRm9ybWF0c1JldmVyc2VNYXAoKSB7XG4gICAgcmV0dXJuIGRhdGVUaW1lRm9ybWF0c1JldmVyc2VNYXBcbiAgfSxcbiAgZ2V0VGltZUZvcm1hdHNSZXZlcnNlTWFwKCkge1xuICAgIHJldHVybiB0aW1lRm9ybWF0c1JldmVyc2VNYXBcbiAgfSxcbiAgZ2V0VGltZVpvbmVzKCkge1xuICAgIHJldHVybiB0aW1lWm9uZXNcbiAgfSxcbiAgZ2V0UmVsYXRpdmVEYXRlKGRhdGU6IHN0cmluZykge1xuICAgIHJldHVybiBgJHttb21lbnQoZGF0ZSkuZnJvbU5vdygpfWBcbiAgfSxcbiAgZ2V0SW1hZ2VTcmMoaW1nOiBzdHJpbmcpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgaW1nID09PSAnc3RyaW5nJyAmJlxuICAgICAgKGltZyA9PT0gJycgfHwgaW1nLnN1YnN0cmluZygwLCA0KSA9PT0gJ2h0dHAnKVxuICAgIClcbiAgICAgIHJldHVybiBjYWNoZUJ1c3RVcmwoaW1nKVxuICAgIGlmICh0eXBlb2YgaW1nID09PSAnc3RyaW5nJyAmJiBpbWcuc3RhcnRzV2l0aCgnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcpKVxuICAgICAgcmV0dXJuIGltZ1xuICAgIHJldHVybiAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcgKyBpbWdcbiAgfSxcbiAgZ2V0UmVzb3VyY2VVcmxGcm9tVGh1bWJVcmwodXJsOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdXJsLnJlcGxhY2UoLz10aHVtYm5haWxbXz0mXFxkXFx3XFxzO10rLywgJz1yZXNvdXJjZScpXG4gIH0sXG4gIGNhbmNlbFJlcGFpbnRGb3JUaW1lZnJhbWUocmVxdWVzdERldGFpbHM6IGFueSkge1xuICAgIGlmIChyZXF1ZXN0RGV0YWlscykge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHJlcXVlc3REZXRhaWxzLnJlcXVlc3RJZClcbiAgICB9XG4gIH0sXG4gIHJlcGFpbnRGb3JUaW1lZnJhbWUodGltZTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgY29uc3QgcmVxdWVzdERldGFpbHMgPSB7XG4gICAgICByZXF1ZXN0SWQ6IHVuZGVmaW5lZCxcbiAgICB9IGFzIGFueVxuICAgIGNvbnN0IHRpbWVFbmQgPSBEYXRlLm5vdygpICsgdGltZVxuICAgIGNvbnN0IHJlcGFpbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjYWxsYmFjaygpXG4gICAgICBpZiAoRGF0ZS5ub3coKSA8IHRpbWVFbmQpIHtcbiAgICAgICAgcmVxdWVzdERldGFpbHMucmVxdWVzdElkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgcmVwYWludCgpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIHJlcXVlc3REZXRhaWxzLnJlcXVlc3RJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgcmVwYWludCgpXG4gICAgfSlcbiAgICByZXR1cm4gcmVxdWVzdERldGFpbHNcbiAgfSxcbiAgZXNjYXBlSFRNTCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuICQoJzxkaXY+JykudGV4dCh2YWx1ZSkuaHRtbCgpXG4gIH0sXG4gIHdyYXBNYXBDb29yZGluYXRlcyh4OiBudW1iZXIsIFttaW4sIG1heF06IFtudW1iZXIsIG51bWJlcl0pIHtcbiAgICBjb25zdCBkID0gbWF4IC0gbWluXG4gICAgcmV0dXJuICgoKCh4IC0gbWluKSAlIGQpICsgZCkgJSBkKSArIG1pblxuICB9LFxuICB3cmFwTWFwQ29vcmRpbmF0ZXNBcnJheShjb29yZGluYXRlczogQXJyYXk8W251bWJlciwgbnVtYmVyXT4pIHtcbiAgICByZXR1cm4gY29vcmRpbmF0ZXMubWFwKChbbG9uLCBsYXRdKSA9PiBbXG4gICAgICB0aGlzLndyYXBNYXBDb29yZGluYXRlcyhsb24sIFstMTgwLCAxODBdKSxcbiAgICAgIHRoaXMud3JhcE1hcENvb3JkaW5hdGVzKGxhdCwgWy05MCwgOTBdKSxcbiAgICBdKVxuICB9LFxufVxuZXhwb3J0IGRlZmF1bHQgQ29tbW9uXG4iXX0=