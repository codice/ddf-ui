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
import wkx from 'wkx';
import { computeCircle, toKilometers } from './geo-helper';
import errorMessages from './errors';
var dmsRegex = new RegExp('^([0-9_]*)°([0-9_]*)\'([0-9_]*\\.?[0-9_]*)"$');
var minimumDifference = 0.0001;
var LAT_DEGREES_DIGITS = 2;
var LON_DEGREES_DIGITS = 3;
var DEFAULT_SECONDS_PRECISION = 3;
var Direction = Object.freeze({
    North: 'N',
    South: 'S',
    East: 'E',
    West: 'W',
});
function dmsCoordinateIsBlank(coordinate) {
    return coordinate.coordinate.length === 0;
}
function dmsPointIsBlank(point) {
    return (dmsCoordinateIsBlank(point.latitude) &&
        dmsCoordinateIsBlank(point.longitude));
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function inputIsBlank(dms) {
    switch (dms.shape) {
        case 'point':
            return dmsPointIsBlank(dms.point);
        case 'circle':
            return dmsPointIsBlank(dms.circle.point);
        case 'line':
            return dms.line.list.length === 0;
        case 'polygon':
            return dms.polygon.list.length === 0;
        case 'boundingbox':
            return (dmsCoordinateIsBlank(dms.boundingbox.north) &&
                dmsCoordinateIsBlank(dms.boundingbox.south) &&
                dmsCoordinateIsBlank(dms.boundingbox.east) &&
                dmsCoordinateIsBlank(dms.boundingbox.west));
    }
}
function parseDmsCoordinate(coordinate) {
    if (coordinate === undefined) {
        return coordinate;
    }
    var matches = dmsRegex.exec(coordinate);
    if (!matches) {
        return coordinate;
    }
    var degrees = replacePlaceholderWithZeros(matches[1]);
    var minutes = replacePlaceholderWithZeros(matches[2]);
    var seconds = replacePlaceholderWithZeros(matches[3]);
    return { degrees: degrees, minutes: minutes, seconds: seconds };
}
function dmsCoordinateToDD(coordinate) {
    var seconds = parseFloat(coordinate.seconds);
    if (isNaN(seconds)) {
        return null;
    }
    var dd = parseInt(coordinate.degrees) +
        parseInt(coordinate.minutes) / 60 +
        seconds / 3600;
    if (coordinate.direction === Direction.North ||
        coordinate.direction === Direction.East) {
        return dd;
    }
    else {
        return -dd;
    }
}
/*
 *  DMS -> WKT conversion utils
 */
function dmsPointToWkt(point) {
    var latitude = parseDmsCoordinate(point.latitude.coordinate);
    var longitude = parseDmsCoordinate(point.longitude.coordinate);
    var _latitude = dmsCoordinateToDD(__assign(__assign({}, latitude), { direction: point.latitude.direction }));
    var _longitude = dmsCoordinateToDD(__assign(__assign({}, longitude), { direction: point.longitude.direction }));
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number | null' is not assignable... Remove this comment to see the full error message
    return new wkx.Point(_longitude, _latitude);
}
function dmsToWkt(dms) {
    var _a;
    if (inputIsBlank(dms)) {
        return null;
    }
    var wkt = null;
    var points = [];
    switch (dms.shape) {
        case 'point':
            wkt = dmsPointToWkt(dms.point).toWkt();
            break;
        case 'circle':
            var distance = toKilometers(dms.circle.radius, dms.circle.units);
            wkt = (_a = computeCircle(dmsPointToWkt(dms.circle.point), distance, 36)) === null || _a === void 0 ? void 0 : _a.toWkt();
            break;
        case 'line':
            if (dms.line.list.length > 0) {
                dms.line.list.map(function (point) { return points.push(dmsPointToWkt(point)); });
                wkt = new wkx.LineString(points).toWkt();
            }
            break;
        case 'polygon':
            if (dms.polygon.list.length > 0) {
                dms.polygon.list.map(function (point) { return points.push(dmsPointToWkt(point)); });
                var p1 = points[0];
                var p2 = points[points.length - 1];
                if (p1.x !== p2.x || p1.y !== p2.y) {
                    points.push(new wkx.Point(p1.x, p1.y));
                }
                wkt = new wkx.Polygon(points).toWkt();
            }
            break;
        case 'boundingbox':
            var nw = {
                latitude: dms.boundingbox.north,
                longitude: dms.boundingbox.west,
            };
            var ne = {
                latitude: dms.boundingbox.north,
                longitude: dms.boundingbox.east,
            };
            var se = {
                latitude: dms.boundingbox.south,
                longitude: dms.boundingbox.east,
            };
            var sw = {
                latitude: dms.boundingbox.south,
                longitude: dms.boundingbox.west,
            };
            var _nw = dmsPointToWkt(nw);
            var _ne = dmsPointToWkt(ne);
            var _se = dmsPointToWkt(se);
            var _sw = dmsPointToWkt(sw);
            wkt = new wkx.Polygon([_nw, _ne, _se, _sw, _nw]).toWkt();
            break;
    }
    return wkt;
}
/*
 *  DMS validation utils
 */
function inValidRange(coordinate, maximum) {
    var degrees = parseInt(coordinate.degrees);
    var minutes = parseInt(coordinate.minutes);
    var seconds = parseFloat(coordinate.seconds);
    if (isNaN(seconds)) {
        return false;
    }
    if (degrees > maximum || minutes > 60 || seconds > 60) {
        return false;
    }
    if (degrees === maximum && (minutes > 0 || seconds > 0)) {
        return false;
    }
    return true;
}
function validateDmsPoint(point) {
    var latitude = parseDmsCoordinate(point.latitude.coordinate);
    var longitude = parseDmsCoordinate(point.longitude.coordinate);
    if (latitude && longitude) {
        return inValidRange(latitude, 90) && inValidRange(longitude, 180);
    }
    return false;
}
function validateDmsBoundingBox(boundingbox) {
    var north = parseDmsCoordinate(boundingbox.north.coordinate);
    var south = parseDmsCoordinate(boundingbox.south.coordinate);
    var east = parseDmsCoordinate(boundingbox.east.coordinate);
    var west = parseDmsCoordinate(boundingbox.west.coordinate);
    if (!north || !south || !east || !west) {
        return false;
    }
    if (!inValidRange(north, 90) ||
        !inValidRange(south, 90) ||
        !inValidRange(east, 180) ||
        !inValidRange(west, 180)) {
        return false;
    }
    var ddNorth = dmsCoordinateToDD(__assign(__assign({}, north), { direction: boundingbox.north.direction }));
    var ddSouth = dmsCoordinateToDD(__assign(__assign({}, south), { direction: boundingbox.south.direction }));
    var ddEast = dmsCoordinateToDD(__assign(__assign({}, east), { direction: boundingbox.east.direction }));
    var ddWest = dmsCoordinateToDD(__assign(__assign({}, west), { direction: boundingbox.west.direction }));
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    if (ddNorth < ddSouth || ddEast < ddWest) {
        return false;
    }
    if (
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ddNorth - ddSouth < minimumDifference ||
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ddEast - ddWest < minimumDifference) {
        return false;
    }
    return true;
}
function validateDms(dms) {
    if (inputIsBlank(dms)) {
        return { valid: true, error: null };
    }
    var valid = true;
    var error = null;
    switch (dms.shape) {
        case 'point':
            if (!validateDmsPoint(dms.point)) {
                valid = false;
                error = errorMessages.invalidCoordinates;
            }
            break;
        case 'circle':
            var radius = parseFloat(dms.circle.radius);
            if (isNaN(radius) ||
                radius <= 0 ||
                toKilometers(radius, dms.circle.units) > 10000) {
                valid = false;
                error = errorMessages.invalidRadius;
            }
            else if (!validateDmsPoint(dms.circle.point)) {
                valid = false;
                error = errorMessages.invalidCoordinates;
            }
            break;
        case 'line':
            if (!dms.line.list.every(validateDmsPoint)) {
                valid = false;
                error = errorMessages.invalidList;
            }
            else if (dms.line.list.length < 2) {
                valid = false;
                error = errorMessages.tooFewPointsLine;
            }
            break;
        case 'polygon':
            if (!dms.polygon.list.every(validateDmsPoint)) {
                valid = false;
                error = errorMessages.invalidList;
            }
            else if (dms.polygon.list.length < 3) {
                valid = false;
                error = errorMessages.tooFewPointsPolygon;
            }
            break;
        case 'boundingbox':
            if (!validateDmsPoint({
                latitude: dms.boundingbox.north,
                longitude: dms.boundingbox.east,
            }) ||
                !validateDmsPoint({
                    latitude: dms.boundingbox.south,
                    longitude: dms.boundingbox.west,
                })) {
                valid = false;
                error = errorMessages.invalidCoordinates;
            }
            else if (!validateDmsBoundingBox(dms.boundingbox)) {
                valid = false;
                error = errorMessages.invalidBoundingBoxDms;
            }
            break;
    }
    return { valid: valid, error: error };
}
/*
 *  Decimal degrees -> DMS conversion utils
 */
function roundTo(num, sigDigits) {
    var scaler = Math.pow(10, sigDigits);
    return Math.round(num * scaler) / scaler;
}
function padWithZeros(num, width) {
    return num.toString().padStart(width, '0');
}
function padDecimalWithZeros(num, width) {
    var decimalParts = num.toString().split('.');
    if (decimalParts.length > 1) {
        return decimalParts[0].padStart(width, '0') + '.' + decimalParts[1];
    }
    else {
        return padWithZeros(num, width);
    }
}
function buildDmsString(components) {
    if (!components) {
        return components;
    }
    return "".concat(components.degrees, "\u00B0").concat(components.minutes, "'").concat(components.seconds, "\"");
}
function replacePlaceholderWithZeros(numString) {
    if (numString === void 0) { numString = ''; }
    while (numString.includes('_')) {
        if (numString.includes('.')) {
            numString = numString.replace('_', '0');
        }
        else {
            numString = numString.replace('_', '');
            numString = '0' + numString;
        }
    }
    return numString;
}
function ddToDmsCoordinate(dd, direction, degreesPad, secondsPrecision) {
    if (secondsPrecision === void 0) { secondsPrecision = DEFAULT_SECONDS_PRECISION; }
    var ddAbsoluteValue = Math.abs(dd);
    var degrees = Math.trunc(ddAbsoluteValue);
    var degreeFraction = ddAbsoluteValue - degrees;
    var minutes = Math.trunc(60 * degreeFraction);
    var seconds = 3600 * degreeFraction - 60 * minutes;
    var secondsRounded = roundTo(seconds, secondsPrecision);
    return {
        coordinate: buildDmsString({
            degrees: padWithZeros(degrees, degreesPad),
            minutes: padWithZeros(minutes, 2),
            seconds: padDecimalWithZeros(secondsRounded, 2),
        }),
        direction: direction,
    };
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function ddToDmsCoordinateLat(dd, secondsPrecision) {
    if (secondsPrecision === void 0) { secondsPrecision = DEFAULT_SECONDS_PRECISION; }
    if (!isNaN(dd)) {
        var direction = dd >= 0 ? Direction.North : Direction.South;
        return ddToDmsCoordinate(dd, direction, LAT_DEGREES_DIGITS, secondsPrecision);
    }
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function ddToDmsCoordinateLon(dd, secondsPrecision) {
    if (secondsPrecision === void 0) { secondsPrecision = DEFAULT_SECONDS_PRECISION; }
    if (!isNaN(dd)) {
        var direction = dd >= 0 ? Direction.East : Direction.West;
        return ddToDmsCoordinate(dd, direction, LON_DEGREES_DIGITS, secondsPrecision);
    }
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function getSecondsPrecision(dmsCoordinate) {
    if (dmsCoordinate === undefined) {
        return;
    }
    var decimalIndex = dmsCoordinate.indexOf('.');
    // Must subtract 2 instead of 1 because the DMS coordinate ends with "
    var lastNumberIndex = dmsCoordinate.length - 2;
    if (decimalIndex > -1 && lastNumberIndex > decimalIndex) {
        return lastNumberIndex - decimalIndex;
    }
}
export { dmsToWkt, validateDms, validateDmsPoint, dmsCoordinateToDD, parseDmsCoordinate, ddToDmsCoordinateLat, ddToDmsCoordinateLon, getSecondsPrecision, buildDmsString, Direction, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG1zLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvdXRpbHMvZG1zLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFBO0FBRXJCLE9BQU8sRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQzFELE9BQU8sYUFBYSxNQUFNLFVBQVUsQ0FBQTtBQUVwQyxJQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFBO0FBQzNFLElBQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFBO0FBRWhDLElBQU0sa0JBQWtCLEdBQUcsQ0FBQyxDQUFBO0FBQzVCLElBQU0sa0JBQWtCLEdBQUcsQ0FBQyxDQUFBO0FBQzVCLElBQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFBO0FBRW5DLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDOUIsS0FBSyxFQUFFLEdBQUc7SUFDVixLQUFLLEVBQUUsR0FBRztJQUNWLElBQUksRUFBRSxHQUFHO0lBQ1QsSUFBSSxFQUFFLEdBQUc7Q0FDVixDQUFDLENBQUE7QUFFRixTQUFTLG9CQUFvQixDQUFDLFVBQWU7SUFDM0MsT0FBTyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUE7QUFDM0MsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLEtBQVU7SUFDakMsT0FBTyxDQUNMLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDcEMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUN0QyxDQUFBO0FBQ0gsQ0FBQztBQUVELDhFQUE4RTtBQUM5RSxTQUFTLFlBQVksQ0FBQyxHQUFRO0lBQzVCLFFBQVEsR0FBRyxD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QUFpQixFQUNqQixrQkFBa0IsRUFDbEIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixtQkFBbUIsRUFDbkIsY0FBYyxFQUNkLFNBQVMsR0FDVixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgd2t4IGZyb20gJ3dreCdcblxuaW1wb3J0IHsgY29tcHV0ZUNpcmNsZSwgdG9LaWxvbWV0ZXJzIH0gZnJvbSAnLi9nZW8taGVscGVyJ1xuaW1wb3J0IGVycm9yTWVzc2FnZXMgZnJvbSAnLi9lcnJvcnMnXG5cbmNvbnN0IGRtc1JlZ2V4ID0gbmV3IFJlZ0V4cCgnXihbMC05X10qKcKwKFswLTlfXSopXFwnKFswLTlfXSpcXFxcLj9bMC05X10qKVwiJCcpXG5jb25zdCBtaW5pbXVtRGlmZmVyZW5jZSA9IDAuMDAwMVxuXG5jb25zdCBMQVRfREVHUkVFU19ESUdJVFMgPSAyXG5jb25zdCBMT05fREVHUkVFU19ESUdJVFMgPSAzXG5jb25zdCBERUZBVUxUX1NFQ09ORFNfUFJFQ0lTSU9OID0gM1xuXG5jb25zdCBEaXJlY3Rpb24gPSBPYmplY3QuZnJlZXplKHtcbiAgTm9ydGg6ICdOJyxcbiAgU291dGg6ICdTJyxcbiAgRWFzdDogJ0UnLFxuICBXZXN0OiAnVycsXG59KVxuXG5mdW5jdGlvbiBkbXNDb29yZGluYXRlSXNCbGFuayhjb29yZGluYXRlOiBhbnkpIHtcbiAgcmV0dXJuIGNvb3JkaW5hdGUuY29vcmRpbmF0ZS5sZW5ndGggPT09IDBcbn1cblxuZnVuY3Rpb24gZG1zUG9pbnRJc0JsYW5rKHBvaW50OiBhbnkpIHtcbiAgcmV0dXJuIChcbiAgICBkbXNDb29yZGluYXRlSXNCbGFuayhwb2ludC5sYXRpdHVkZSkgJiZcbiAgICBkbXNDb29yZGluYXRlSXNCbGFuayhwb2ludC5sb25naXR1ZGUpXG4gIClcbn1cblxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG5mdW5jdGlvbiBpbnB1dElzQmxhbmsoZG1zOiBhbnkpIHtcbiAgc3dpdGNoIChkbXMuc2hhcGUpIHtcbiAgICBjYXNlICdwb2ludCc6XG4gICAgICByZXR1cm4gZG1zUG9pbnRJc0JsYW5rKGRtcy5wb2ludClcbiAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgcmV0dXJuIGRtc1BvaW50SXNCbGFuayhkbXMuY2lyY2xlLnBvaW50KVxuICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgcmV0dXJuIGRtcy5saW5lLmxpc3QubGVuZ3RoID09PSAwXG4gICAgY2FzZSAncG9seWdvbic6XG4gICAgICByZXR1cm4gZG1zLnBvbHlnb24ubGlzdC5sZW5ndGggPT09IDBcbiAgICBjYXNlICdib3VuZGluZ2JveCc6XG4gICAgICByZXR1cm4gKFxuICAgICAgICBkbXNDb29yZGluYXRlSXNCbGFuayhkbXMuYm91bmRpbmdib3gubm9ydGgpICYmXG4gICAgICAgIGRtc0Nvb3JkaW5hdGVJc0JsYW5rKGRtcy5ib3VuZGluZ2JveC5zb3V0aCkgJiZcbiAgICAgICAgZG1zQ29vcmRpbmF0ZUlzQmxhbmsoZG1zLmJvdW5kaW5nYm94LmVhc3QpICYmXG4gICAgICAgIGRtc0Nvb3JkaW5hdGVJc0JsYW5rKGRtcy5ib3VuZGluZ2JveC53ZXN0KVxuICAgICAgKVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlRG1zQ29vcmRpbmF0ZShjb29yZGluYXRlOiBhbnkpIHtcbiAgaWYgKGNvb3JkaW5hdGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBjb29yZGluYXRlXG4gIH1cblxuICBjb25zdCBtYXRjaGVzID0gZG1zUmVnZXguZXhlYyhjb29yZGluYXRlKVxuICBpZiAoIW1hdGNoZXMpIHtcbiAgICByZXR1cm4gY29vcmRpbmF0ZVxuICB9XG4gIGNvbnN0IGRlZ3JlZXMgPSByZXBsYWNlUGxhY2Vob2xkZXJXaXRoWmVyb3MobWF0Y2hlc1sxXSlcbiAgY29uc3QgbWludXRlcyA9IHJlcGxhY2VQbGFjZWhvbGRlcldpdGhaZXJvcyhtYXRjaGVzWzJdKVxuICBjb25zdCBzZWNvbmRzID0gcmVwbGFjZVBsYWNlaG9sZGVyV2l0aFplcm9zKG1hdGNoZXNbM10pXG4gIHJldHVybiB7IGRlZ3JlZXMsIG1pbnV0ZXMsIHNlY29uZHMgfVxufVxuXG5mdW5jdGlvbiBkbXNDb29yZGluYXRlVG9ERChjb29yZGluYXRlOiBhbnkpIHtcbiAgY29uc3Qgc2Vjb25kcyA9IHBhcnNlRmxvYXQoY29vcmRpbmF0ZS5zZWNvbmRzKVxuICBpZiAoaXNOYU4oc2Vjb25kcykpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgZGQgPVxuICAgIHBhcnNlSW50KGNvb3JkaW5hdGUuZGVncmVlcykgK1xuICAgIHBhcnNlSW50KGNvb3JkaW5hdGUubWludXRlcykgLyA2MCArXG4gICAgc2Vjb25kcyAvIDM2MDBcbiAgaWYgKFxuICAgIGNvb3JkaW5hdGUuZGlyZWN0aW9uID09PSBEaXJlY3Rpb24uTm9ydGggfHxcbiAgICBjb29yZGluYXRlLmRpcmVjdGlvbiA9PT0gRGlyZWN0aW9uLkVhc3RcbiAgKSB7XG4gICAgcmV0dXJuIGRkXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIC1kZFxuICB9XG59XG5cbi8qXG4gKiAgRE1TIC0+IFdLVCBjb252ZXJzaW9uIHV0aWxzXG4gKi9cbmZ1bmN0aW9uIGRtc1BvaW50VG9Xa3QocG9pbnQ6IGFueSkge1xuICBjb25zdCBsYXRpdHVkZSA9IHBhcnNlRG1zQ29vcmRpbmF0ZShwb2ludC5sYXRpdHVkZS5jb29yZGluYXRlKVxuICBjb25zdCBsb25naXR1ZGUgPSBwYXJzZURtc0Nvb3JkaW5hdGUocG9pbnQubG9uZ2l0dWRlLmNvb3JkaW5hdGUpXG4gIGNvbnN0IF9sYXRpdHVkZSA9IGRtc0Nvb3JkaW5hdGVUb0REKHtcbiAgICAuLi5sYXRpdHVkZSxcbiAgICBkaXJlY3Rpb246IHBvaW50LmxhdGl0dWRlLmRpcmVjdGlvbixcbiAgfSlcbiAgY29uc3QgX2xvbmdpdHVkZSA9IGRtc0Nvb3JkaW5hdGVUb0REKHtcbiAgICAuLi5sb25naXR1ZGUsXG4gICAgZGlyZWN0aW9uOiBwb2ludC5sb25naXR1ZGUuZGlyZWN0aW9uLFxuICB9KVxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ251bWJlciB8IG51bGwnIGlzIG5vdCBhc3NpZ25hYmxlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgcmV0dXJuIG5ldyB3a3guUG9pbnQoX2xvbmdpdHVkZSwgX2xhdGl0dWRlKVxufVxuXG5mdW5jdGlvbiBkbXNUb1drdChkbXM6IGFueSkge1xuICBpZiAoaW5wdXRJc0JsYW5rKGRtcykpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgbGV0IHdrdCA9IG51bGxcbiAgY29uc3QgcG9pbnRzOiBhbnkgPSBbXVxuICBzd2l0Y2ggKGRtcy5zaGFwZSkge1xuICAgIGNhc2UgJ3BvaW50JzpcbiAgICAgIHdrdCA9IGRtc1BvaW50VG9Xa3QoZG1zLnBvaW50KS50b1drdCgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICBjb25zdCBkaXN0YW5jZSA9IHRvS2lsb21ldGVycyhkbXMuY2lyY2xlLnJhZGl1cywgZG1zLmNpcmNsZS51bml0cylcbiAgICAgIHdrdCA9IGNvbXB1dGVDaXJjbGUoXG4gICAgICAgIGRtc1BvaW50VG9Xa3QoZG1zLmNpcmNsZS5wb2ludCksXG4gICAgICAgIGRpc3RhbmNlLFxuICAgICAgICAzNlxuICAgICAgKT8udG9Xa3QoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdsaW5lJzpcbiAgICAgIGlmIChkbXMubGluZS5saXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgZG1zLmxpbmUubGlzdC5tYXAoKHBvaW50OiBhbnkpID0+IHBvaW50cy5wdXNoKGRtc1BvaW50VG9Xa3QocG9pbnQpKSlcbiAgICAgICAgd2t0ID0gbmV3IHdreC5MaW5lU3RyaW5nKHBvaW50cykudG9Xa3QoKVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdwb2x5Z29uJzpcbiAgICAgIGlmIChkbXMucG9seWdvbi5saXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgZG1zLnBvbHlnb24ubGlzdC5tYXAoKHBvaW50OiBhbnkpID0+IHBvaW50cy5wdXNoKGRtc1BvaW50VG9Xa3QocG9pbnQpKSlcbiAgICAgICAgY29uc3QgcDEgPSBwb2ludHNbMF1cbiAgICAgICAgY29uc3QgcDIgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdXG4gICAgICAgIGlmIChwMS54ICE9PSBwMi54IHx8IHAxLnkgIT09IHAyLnkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChuZXcgd2t4LlBvaW50KHAxLngsIHAxLnkpKVxuICAgICAgICB9XG4gICAgICAgIHdrdCA9IG5ldyB3a3guUG9seWdvbihwb2ludHMpLnRvV2t0KClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYm91bmRpbmdib3gnOlxuICAgICAgY29uc3QgbncgPSB7XG4gICAgICAgIGxhdGl0dWRlOiBkbXMuYm91bmRpbmdib3gubm9ydGgsXG4gICAgICAgIGxvbmdpdHVkZTogZG1zLmJvdW5kaW5nYm94Lndlc3QsXG4gICAgICB9XG4gICAgICBjb25zdCBuZSA9IHtcbiAgICAgICAgbGF0aXR1ZGU6IGRtcy5ib3VuZGluZ2JveC5ub3J0aCxcbiAgICAgICAgbG9uZ2l0dWRlOiBkbXMuYm91bmRpbmdib3guZWFzdCxcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlID0ge1xuICAgICAgICBsYXRpdHVkZTogZG1zLmJvdW5kaW5nYm94LnNvdXRoLFxuICAgICAgICBsb25naXR1ZGU6IGRtcy5ib3VuZGluZ2JveC5lYXN0LFxuICAgICAgfVxuICAgICAgY29uc3Qgc3cgPSB7XG4gICAgICAgIGxhdGl0dWRlOiBkbXMuYm91bmRpbmdib3guc291dGgsXG4gICAgICAgIGxvbmdpdHVkZTogZG1zLmJvdW5kaW5nYm94Lndlc3QsXG4gICAgICB9XG4gICAgICBjb25zdCBfbncgPSBkbXNQb2ludFRvV2t0KG53KVxuICAgICAgY29uc3QgX25lID0gZG1zUG9pbnRUb1drdChuZSlcbiAgICAgIGNvbnN0IF9zZSA9IGRtc1BvaW50VG9Xa3Qoc2UpXG4gICAgICBjb25zdCBfc3cgPSBkbXNQb2ludFRvV2t0KHN3KVxuICAgICAgd2t0ID0gbmV3IHdreC5Qb2x5Z29uKFtfbncsIF9uZSwgX3NlLCBfc3csIF9ud10pLnRvV2t0KClcbiAgICAgIGJyZWFrXG4gIH1cbiAgcmV0dXJuIHdrdFxufVxuXG4vKlxuICogIERNUyB2YWxpZGF0aW9uIHV0aWxzXG4gKi9cbmZ1bmN0aW9uIGluVmFsaWRSYW5nZShjb29yZGluYXRlOiBhbnksIG1heGltdW06IGFueSkge1xuICBjb25zdCBkZWdyZWVzID0gcGFyc2VJbnQoY29vcmRpbmF0ZS5kZWdyZWVzKVxuICBjb25zdCBtaW51dGVzID0gcGFyc2VJbnQoY29vcmRpbmF0ZS5taW51dGVzKVxuICBjb25zdCBzZWNvbmRzID0gcGFyc2VGbG9hdChjb29yZGluYXRlLnNlY29uZHMpXG4gIGlmIChpc05hTihzZWNvbmRzKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChkZWdyZWVzID4gbWF4aW11bSB8fCBtaW51dGVzID4gNjAgfHwgc2Vjb25kcyA+IDYwKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgaWYgKGRlZ3JlZXMgPT09IG1heGltdW0gJiYgKG1pbnV0ZXMgPiAwIHx8IHNlY29uZHMgPiAwKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRG1zUG9pbnQocG9pbnQ6IGFueSkge1xuICBjb25zdCBsYXRpdHVkZSA9IHBhcnNlRG1zQ29vcmRpbmF0ZShwb2ludC5sYXRpdHVkZS5jb29yZGluYXRlKVxuICBjb25zdCBsb25naXR1ZGUgPSBwYXJzZURtc0Nvb3JkaW5hdGUocG9pbnQubG9uZ2l0dWRlLmNvb3JkaW5hdGUpXG4gIGlmIChsYXRpdHVkZSAmJiBsb25naXR1ZGUpIHtcbiAgICByZXR1cm4gaW5WYWxpZFJhbmdlKGxhdGl0dWRlLCA5MCkgJiYgaW5WYWxpZFJhbmdlKGxvbmdpdHVkZSwgMTgwKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZURtc0JvdW5kaW5nQm94KGJvdW5kaW5nYm94OiBhbnkpIHtcbiAgY29uc3Qgbm9ydGggPSBwYXJzZURtc0Nvb3JkaW5hdGUoYm91bmRpbmdib3gubm9ydGguY29vcmRpbmF0ZSlcbiAgY29uc3Qgc291dGggPSBwYXJzZURtc0Nvb3JkaW5hdGUoYm91bmRpbmdib3guc291dGguY29vcmRpbmF0ZSlcbiAgY29uc3QgZWFzdCA9IHBhcnNlRG1zQ29vcmRpbmF0ZShib3VuZGluZ2JveC5lYXN0LmNvb3JkaW5hdGUpXG4gIGNvbnN0IHdlc3QgPSBwYXJzZURtc0Nvb3JkaW5hdGUoYm91bmRpbmdib3gud2VzdC5jb29yZGluYXRlKVxuXG4gIGlmICghbm9ydGggfHwgIXNvdXRoIHx8ICFlYXN0IHx8ICF3ZXN0KSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoXG4gICAgIWluVmFsaWRSYW5nZShub3J0aCwgOTApIHx8XG4gICAgIWluVmFsaWRSYW5nZShzb3V0aCwgOTApIHx8XG4gICAgIWluVmFsaWRSYW5nZShlYXN0LCAxODApIHx8XG4gICAgIWluVmFsaWRSYW5nZSh3ZXN0LCAxODApXG4gICkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgY29uc3QgZGROb3J0aCA9IGRtc0Nvb3JkaW5hdGVUb0REKHtcbiAgICAuLi5ub3J0aCxcbiAgICBkaXJlY3Rpb246IGJvdW5kaW5nYm94Lm5vcnRoLmRpcmVjdGlvbixcbiAgfSlcbiAgY29uc3QgZGRTb3V0aCA9IGRtc0Nvb3JkaW5hdGVUb0REKHtcbiAgICAuLi5zb3V0aCxcbiAgICBkaXJlY3Rpb246IGJvdW5kaW5nYm94LnNvdXRoLmRpcmVjdGlvbixcbiAgfSlcbiAgY29uc3QgZGRFYXN0ID0gZG1zQ29vcmRpbmF0ZVRvREQoe1xuICAgIC4uLmVhc3QsXG4gICAgZGlyZWN0aW9uOiBib3VuZGluZ2JveC5lYXN0LmRpcmVjdGlvbixcbiAgfSlcbiAgY29uc3QgZGRXZXN0ID0gZG1zQ29vcmRpbmF0ZVRvREQoe1xuICAgIC4uLndlc3QsXG4gICAgZGlyZWN0aW9uOiBib3VuZGluZ2JveC53ZXN0LmRpcmVjdGlvbixcbiAgfSlcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICBpZiAoZGROb3J0aCA8IGRkU291dGggfHwgZGRFYXN0IDwgZGRXZXN0KSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGRkTm9ydGggLSBkZFNvdXRoIDwgbWluaW11bURpZmZlcmVuY2UgfHxcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgZGRFYXN0IC0gZGRXZXN0IDwgbWluaW11bURpZmZlcmVuY2VcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZURtcyhkbXM6IGFueSkge1xuICBpZiAoaW5wdXRJc0JsYW5rKGRtcykpIHtcbiAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZXJyb3I6IG51bGwgfVxuICB9XG5cbiAgbGV0IHZhbGlkID0gdHJ1ZVxuICBsZXQgZXJyb3IgPSBudWxsXG4gIHN3aXRjaCAoZG1zLnNoYXBlKSB7XG4gICAgY2FzZSAncG9pbnQnOlxuICAgICAgaWYgKCF2YWxpZGF0ZURtc1BvaW50KGRtcy5wb2ludCkpIHtcbiAgICAgICAgdmFsaWQgPSBmYWxzZVxuICAgICAgICBlcnJvciA9IGVycm9yTWVzc2FnZXMuaW52YWxpZENvb3JkaW5hdGVzXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICBjb25zdCByYWRpdXMgPSBwYXJzZUZsb2F0KGRtcy5jaXJjbGUucmFkaXVzKVxuICAgICAgaWYgKFxuICAgICAgICBpc05hTihyYWRpdXMpIHx8XG4gICAgICAgIHJhZGl1cyA8PSAwIHx8XG4gICAgICAgIHRvS2lsb21ldGVycyhyYWRpdXMsIGRtcy5jaXJjbGUudW5pdHMpID4gMTAwMDBcbiAgICAgICkge1xuICAgICAgICB2YWxpZCA9IGZhbHNlXG4gICAgICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy5pbnZhbGlkUmFkaXVzXG4gICAgICB9IGVsc2UgaWYgKCF2YWxpZGF0ZURtc1BvaW50KGRtcy5jaXJjbGUucG9pbnQpKSB7XG4gICAgICAgIHZhbGlkID0gZmFsc2VcbiAgICAgICAgZXJyb3IgPSBlcnJvck1lc3NhZ2VzLmludmFsaWRDb29yZGluYXRlc1xuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdsaW5lJzpcbiAgICAgIGlmICghZG1zLmxpbmUubGlzdC5ldmVyeSh2YWxpZGF0ZURtc1BvaW50KSkge1xuICAgICAgICB2YWxpZCA9IGZhbHNlXG4gICAgICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy5pbnZhbGlkTGlzdFxuICAgICAgfSBlbHNlIGlmIChkbXMubGluZS5saXN0Lmxlbmd0aCA8IDIpIHtcbiAgICAgICAgdmFsaWQgPSBmYWxzZVxuICAgICAgICBlcnJvciA9IGVycm9yTWVzc2FnZXMudG9vRmV3UG9pbnRzTGluZVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdwb2x5Z29uJzpcbiAgICAgIGlmICghZG1zLnBvbHlnb24ubGlzdC5ldmVyeSh2YWxpZGF0ZURtc1BvaW50KSkge1xuICAgICAgICB2YWxpZCA9IGZhbHNlXG4gICAgICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy5pbnZhbGlkTGlzdFxuICAgICAgfSBlbHNlIGlmIChkbXMucG9seWdvbi5saXN0Lmxlbmd0aCA8IDMpIHtcbiAgICAgICAgdmFsaWQgPSBmYWxzZVxuICAgICAgICBlcnJvciA9IGVycm9yTWVzc2FnZXMudG9vRmV3UG9pbnRzUG9seWdvblxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdib3VuZGluZ2JveCc6XG4gICAgICBpZiAoXG4gICAgICAgICF2YWxpZGF0ZURtc1BvaW50KHtcbiAgICAgICAgICBsYXRpdHVkZTogZG1zLmJvdW5kaW5nYm94Lm5vcnRoLFxuICAgICAgICAgIGxvbmdpdHVkZTogZG1zLmJvdW5kaW5nYm94LmVhc3QsXG4gICAgICAgIH0pIHx8XG4gICAgICAgICF2YWxpZGF0ZURtc1BvaW50KHtcbiAgICAgICAgICBsYXRpdHVkZTogZG1zLmJvdW5kaW5nYm94LnNvdXRoLFxuICAgICAgICAgIGxvbmdpdHVkZTogZG1zLmJvdW5kaW5nYm94Lndlc3QsXG4gICAgICAgIH0pXG4gICAgICApIHtcbiAgICAgICAgdmFsaWQgPSBmYWxzZVxuICAgICAgICBlcnJvciA9IGVycm9yTWVzc2FnZXMuaW52YWxpZENvb3JkaW5hdGVzXG4gICAgICB9IGVsc2UgaWYgKCF2YWxpZGF0ZURtc0JvdW5kaW5nQm94KGRtcy5ib3VuZGluZ2JveCkpIHtcbiAgICAgICAgdmFsaWQgPSBmYWxzZVxuICAgICAgICBlcnJvciA9IGVycm9yTWVzc2FnZXMuaW52YWxpZEJvdW5kaW5nQm94RG1zXG4gICAgICB9XG4gICAgICBicmVha1xuICB9XG4gIHJldHVybiB7IHZhbGlkLCBlcnJvciB9XG59XG5cbi8qXG4gKiAgRGVjaW1hbCBkZWdyZWVzIC0+IERNUyBjb252ZXJzaW9uIHV0aWxzXG4gKi9cbmZ1bmN0aW9uIHJvdW5kVG8obnVtOiBhbnksIHNpZ0RpZ2l0czogYW55KSB7XG4gIGNvbnN0IHNjYWxlciA9IDEwICoqIHNpZ0RpZ2l0c1xuICByZXR1cm4gTWF0aC5yb3VuZChudW0gKiBzY2FsZXIpIC8gc2NhbGVyXG59XG5cbmZ1bmN0aW9uIHBhZFdpdGhaZXJvcyhudW06IGFueSwgd2lkdGg6IGFueSkge1xuICByZXR1cm4gbnVtLnRvU3RyaW5nKCkucGFkU3RhcnQod2lkdGgsICcwJylcbn1cblxuZnVuY3Rpb24gcGFkRGVjaW1hbFdpdGhaZXJvcyhudW06IGFueSwgd2lkdGg6IGFueSkge1xuICBjb25zdCBkZWNpbWFsUGFydHMgPSBudW0udG9TdHJpbmcoKS5zcGxpdCgnLicpXG4gIGlmIChkZWNpbWFsUGFydHMubGVuZ3RoID4gMSkge1xuICAgIHJldHVybiBkZWNpbWFsUGFydHNbMF0ucGFkU3RhcnQod2lkdGgsICcwJykgKyAnLicgKyBkZWNpbWFsUGFydHNbMV1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcGFkV2l0aFplcm9zKG51bSwgd2lkdGgpXG4gIH1cbn1cblxuZnVuY3Rpb24gYnVpbGREbXNTdHJpbmcoY29tcG9uZW50czogYW55KSB7XG4gIGlmICghY29tcG9uZW50cykge1xuICAgIHJldHVybiBjb21wb25lbnRzXG4gIH1cbiAgcmV0dXJuIGAke2NvbXBvbmVudHMuZGVncmVlc33CsCR7Y29tcG9uZW50cy5taW51dGVzfScke2NvbXBvbmVudHMuc2Vjb25kc31cImBcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVBsYWNlaG9sZGVyV2l0aFplcm9zKG51bVN0cmluZyA9ICcnKSB7XG4gIHdoaWxlIChudW1TdHJpbmcuaW5jbHVkZXMoJ18nKSkge1xuICAgIGlmIChudW1TdHJpbmcuaW5jbHVkZXMoJy4nKSkge1xuICAgICAgbnVtU3RyaW5nID0gbnVtU3RyaW5nLnJlcGxhY2UoJ18nLCAnMCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIG51bVN0cmluZyA9IG51bVN0cmluZy5yZXBsYWNlKCdfJywgJycpXG4gICAgICBudW1TdHJpbmcgPSAnMCcgKyBudW1TdHJpbmdcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bVN0cmluZ1xufVxuXG5mdW5jdGlvbiBkZFRvRG1zQ29vcmRpbmF0ZShcbiAgZGQ6IGFueSxcbiAgZGlyZWN0aW9uOiBhbnksXG4gIGRlZ3JlZXNQYWQ6IGFueSxcbiAgc2Vjb25kc1ByZWNpc2lvbiA9IERFRkFVTFRfU0VDT05EU19QUkVDSVNJT05cbikge1xuICBjb25zdCBkZEFic29sdXRlVmFsdWUgPSBNYXRoLmFicyhkZClcbiAgY29uc3QgZGVncmVlcyA9IE1hdGgudHJ1bmMoZGRBYnNvbHV0ZVZhbHVlKVxuICBjb25zdCBkZWdyZWVGcmFjdGlvbiA9IGRkQWJzb2x1dGVWYWx1ZSAtIGRlZ3JlZXNcbiAgY29uc3QgbWludXRlcyA9IE1hdGgudHJ1bmMoNjAgKiBkZWdyZWVGcmFjdGlvbilcbiAgY29uc3Qgc2Vjb25kcyA9IDM2MDAgKiBkZWdyZWVGcmFjdGlvbiAtIDYwICogbWludXRlc1xuICBjb25zdCBzZWNvbmRzUm91bmRlZCA9IHJvdW5kVG8oc2Vjb25kcywgc2Vjb25kc1ByZWNpc2lvbilcbiAgcmV0dXJuIHtcbiAgICBjb29yZGluYXRlOiBidWlsZERtc1N0cmluZyh7XG4gICAgICBkZWdyZWVzOiBwYWRXaXRoWmVyb3MoZGVncmVlcywgZGVncmVlc1BhZCksXG4gICAgICBtaW51dGVzOiBwYWRXaXRoWmVyb3MobWludXRlcywgMiksXG4gICAgICBzZWNvbmRzOiBwYWREZWNpbWFsV2l0aFplcm9zKHNlY29uZHNSb3VuZGVkLCAyKSxcbiAgICB9KSxcbiAgICBkaXJlY3Rpb24sXG4gIH1cbn1cblxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG5mdW5jdGlvbiBkZFRvRG1zQ29vcmRpbmF0ZUxhdChcbiAgZGQ6IGFueSxcbiAgc2Vjb25kc1ByZWNpc2lvbiA9IERFRkFVTFRfU0VDT05EU19QUkVDSVNJT05cbikge1xuICBpZiAoIWlzTmFOKGRkKSkge1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IGRkID49IDAgPyBEaXJlY3Rpb24uTm9ydGggOiBEaXJlY3Rpb24uU291dGhcbiAgICByZXR1cm4gZGRUb0Rtc0Nvb3JkaW5hdGUoXG4gICAgICBkZCxcbiAgICAgIGRpcmVjdGlvbixcbiAgICAgIExBVF9ERUdSRUVTX0RJR0lUUyxcbiAgICAgIHNlY29uZHNQcmVjaXNpb25cbiAgICApXG4gIH1cbn1cblxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG5mdW5jdGlvbiBkZFRvRG1zQ29vcmRpbmF0ZUxvbihcbiAgZGQ6IGFueSxcbiAgc2Vjb25kc1ByZWNpc2lvbiA9IERFRkFVTFRfU0VDT05EU19QUkVDSVNJT05cbikge1xuICBpZiAoIWlzTmFOKGRkKSkge1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IGRkID49IDAgPyBEaXJlY3Rpb24uRWFzdCA6IERpcmVjdGlvbi5XZXN0XG4gICAgcmV0dXJuIGRkVG9EbXNDb29yZGluYXRlKFxuICAgICAgZGQsXG4gICAgICBkaXJlY3Rpb24sXG4gICAgICBMT05fREVHUkVFU19ESUdJVFMsXG4gICAgICBzZWNvbmRzUHJlY2lzaW9uXG4gICAgKVxuICB9XG59XG5cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDMwKSBGSVhNRTogTm90IGFsbCBjb2RlIHBhdGhzIHJldHVybiBhIHZhbHVlLlxuZnVuY3Rpb24gZ2V0U2Vjb25kc1ByZWNpc2lvbihkbXNDb29yZGluYXRlOiBhbnkpIHtcbiAgaWYgKGRtc0Nvb3JkaW5hdGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGRlY2ltYWxJbmRleCA9IGRtc0Nvb3JkaW5hdGUuaW5kZXhPZignLicpXG4gIC8vIE11c3Qgc3VidHJhY3QgMiBpbnN0ZWFkIG9mIDEgYmVjYXVzZSB0aGUgRE1TIGNvb3JkaW5hdGUgZW5kcyB3aXRoIFwiXG4gIGNvbnN0IGxhc3ROdW1iZXJJbmRleCA9IGRtc0Nvb3JkaW5hdGUubGVuZ3RoIC0gMlxuICBpZiAoZGVjaW1hbEluZGV4ID4gLTEgJiYgbGFzdE51bWJlckluZGV4ID4gZGVjaW1hbEluZGV4KSB7XG4gICAgcmV0dXJuIGxhc3ROdW1iZXJJbmRleCAtIGRlY2ltYWxJbmRleFxuICB9XG59XG5cbmV4cG9ydCB7XG4gIGRtc1RvV2t0LFxuICB2YWxpZGF0ZURtcyxcbiAgdmFsaWRhdGVEbXNQb2ludCxcbiAgZG1zQ29vcmRpbmF0ZVRvREQsXG4gIHBhcnNlRG1zQ29vcmRpbmF0ZSxcbiAgZGRUb0Rtc0Nvb3JkaW5hdGVMYXQsXG4gIGRkVG9EbXNDb29yZGluYXRlTG9uLFxuICBnZXRTZWNvbmRzUHJlY2lzaW9uLFxuICBidWlsZERtc1N0cmluZyxcbiAgRGlyZWN0aW9uLFxufVxuIl19