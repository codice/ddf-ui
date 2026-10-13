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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG1zLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvdXRpbHMvZG1zLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFBO0FBRXJCLE9BQU8sRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQzFELE9BQU8sYUFBYSxNQUFNLFVBQVUsQ0FBQTtBQUVwQyxJQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFBO0FBQzNFLElBQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFBO0FBRWhDLElBQU0sa0JBQWtCLEdBQUcsQ0FBQyxDQUFBO0FBQzVCLElBQU0sa0JBQWtCLEdBQUcsQ0FBQyxDQUFBO0FBQzVCLElBQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFBO0FBRW5DLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDOUIsS0FBSyxFQUFFLEdBQUc7SUFDVixLQUFLLEVBQUUsR0FBRztJQUNWLElBQUksRUFBRSxHQUFHO0lBQ1QsSUFBSSxFQUFFLEdBQUc7Q0FDVixDQUFDLENBQUE7QUFFRixTQUFTLG9CQUFvQixDQUFDLFVBQWU7SUFDM0MsT0FBTyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUE7QUFDM0MsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLEtBQVU7SUFDakMsT0FBTyxDQUNMLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDcEMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUN0QyxDQUFBO0FBQ0gsQ0FBQztBQUVELDhFQUE4RTtBQUM5RSxTQUFTLFlBQVksQ0FBQyxHQUFRO0lBQzVCLFFBQVEsR0FBRyxD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O0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCw4RUFBOEU7QUFDOUUsU0FBUyxtQkFBbUIsQ0FBQyxhQUFrQjtJQUM3QyxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNoQyxPQUFNO0lBQ1IsQ0FBQztJQUNELElBQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDL0Msc0VBQXNFO0lBQ3RFLElBQU0sZUFBZSxHQUFHLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0lBQ2hELElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLGVBQWUsR0FBRyxZQUFZLEVBQUUsQ0FBQztRQUN4RCxPQUFPLGVBQWUsR0FBRyxZQUFZLENBQUE7SUFDdkMsQ0FBQztBQUNILENBQUM7QUFFRCxPQUFPLEVBQ0wsUUFBUSxFQUNSLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGtCQUFrQixFQUNsQixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLG1CQUFtQixFQUNuQixjQUFjLEVBQ2QsU0FBUyxHQUNWLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCB3a3ggZnJvbSAnd2t4J1xuXG5pbXBvcnQgeyBjb21wdXRlQ2lyY2xlLCB0b0tpbG9tZXRlcnMgfSBmcm9tICcuL2dlby1oZWxwZXInXG5pbXBvcnQgZXJyb3JNZXNzYWdlcyBmcm9tICcuL2Vycm9ycydcblxuY29uc3QgZG1zUmVnZXggPSBuZXcgUmVnRXhwKCdeKFswLTlfXSopwrAoWzAtOV9dKilcXCcoWzAtOV9dKlxcXFwuP1swLTlfXSopXCIkJylcbmNvbnN0IG1pbmltdW1EaWZmZXJlbmNlID0gMC4wMDAxXG5cbmNvbnN0IExBVF9ERUdSRUVTX0RJR0lUUyA9IDJcbmNvbnN0IExPTl9ERUdSRUVTX0RJR0lUUyA9IDNcbmNvbnN0IERFRkFVTFRfU0VDT05EU19QUkVDSVNJT04gPSAzXG5cbmNvbnN0IERpcmVjdGlvbiA9IE9iamVjdC5mcmVlemUoe1xuICBOb3J0aDogJ04nLFxuICBTb3V0aDogJ1MnLFxuICBFYXN0OiAnRScsXG4gIFdlc3Q6ICdXJyxcbn0pXG5cbmZ1bmN0aW9uIGRtc0Nvb3JkaW5hdGVJc0JsYW5rKGNvb3JkaW5hdGU6IGFueSkge1xuICByZXR1cm4gY29vcmRpbmF0ZS5jb29yZGluYXRlLmxlbmd0aCA9PT0gMFxufVxuXG5mdW5jdGlvbiBkbXNQb2ludElzQmxhbmsocG9pbnQ6IGFueSkge1xuICByZXR1cm4gKFxuICAgIGRtc0Nvb3JkaW5hdGVJc0JsYW5rKHBvaW50LmxhdGl0dWRlKSAmJlxuICAgIGRtc0Nvb3JkaW5hdGVJc0JsYW5rKHBvaW50LmxvbmdpdHVkZSlcbiAgKVxufVxuXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAzMCkgRklYTUU6IE5vdCBhbGwgY29kZSBwYXRocyByZXR1cm4gYSB2YWx1ZS5cbmZ1bmN0aW9uIGlucHV0SXNCbGFuayhkbXM6IGFueSkge1xuICBzd2l0Y2ggKGRtcy5zaGFwZSkge1xuICAgIGNhc2UgJ3BvaW50JzpcbiAgICAgIHJldHVybiBkbXNQb2ludElzQmxhbmsoZG1zLnBvaW50KVxuICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICByZXR1cm4gZG1zUG9pbnRJc0JsYW5rKGRtcy5jaXJjbGUucG9pbnQpXG4gICAgY2FzZSAnbGluZSc6XG4gICAgICByZXR1cm4gZG1zLmxpbmUubGlzdC5sZW5ndGggPT09IDBcbiAgICBjYXNlICdwb2x5Z29uJzpcbiAgICAgIHJldHVybiBkbXMucG9seWdvbi5saXN0Lmxlbmd0aCA9PT0gMFxuICAgIGNhc2UgJ2JvdW5kaW5nYm94JzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGRtc0Nvb3JkaW5hdGVJc0JsYW5rKGRtcy5ib3VuZGluZ2JveC5ub3J0aCkgJiZcbiAgICAgICAgZG1zQ29vcmRpbmF0ZUlzQmxhbmsoZG1zLmJvdW5kaW5nYm94LnNvdXRoKSAmJlxuICAgICAgICBkbXNDb29yZGluYXRlSXNCbGFuayhkbXMuYm91bmRpbmdib3guZWFzdCkgJiZcbiAgICAgICAgZG1zQ29vcmRpbmF0ZUlzQmxhbmsoZG1zLmJvdW5kaW5nYm94Lndlc3QpXG4gICAgICApXG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VEbXNDb29yZGluYXRlKGNvb3JkaW5hdGU6IGFueSkge1xuICBpZiAoY29vcmRpbmF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGNvb3JkaW5hdGVcbiAgfVxuXG4gIGNvbnN0IG1hdGNoZXMgPSBkbXNSZWdleC5leGVjKGNvb3JkaW5hdGUpXG4gIGlmICghbWF0Y2hlcykge1xuICAgIHJldHVybiBjb29yZGluYXRlXG4gIH1cbiAgY29uc3QgZGVncmVlcyA9IHJlcGxhY2VQbGFjZWhvbGRlcldpdGhaZXJvcyhtYXRjaGVzWzFdKVxuICBjb25zdCBtaW51dGVzID0gcmVwbGFjZVBsYWNlaG9sZGVyV2l0aFplcm9zKG1hdGNoZXNbMl0pXG4gIGNvbnN0IHNlY29uZHMgPSByZXBsYWNlUGxhY2Vob2xkZXJXaXRoWmVyb3MobWF0Y2hlc1szXSlcbiAgcmV0dXJuIHsgZGVncmVlcywgbWludXRlcywgc2Vjb25kcyB9XG59XG5cbmZ1bmN0aW9uIGRtc0Nvb3JkaW5hdGVUb0REKGNvb3JkaW5hdGU6IGFueSkge1xuICBjb25zdCBzZWNvbmRzID0gcGFyc2VGbG9hdChjb29yZGluYXRlLnNlY29uZHMpXG4gIGlmIChpc05hTihzZWNvbmRzKSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBkZCA9XG4gICAgcGFyc2VJbnQoY29vcmRpbmF0ZS5kZWdyZWVzKSArXG4gICAgcGFyc2VJbnQoY29vcmRpbmF0ZS5taW51dGVzKSAvIDYwICtcbiAgICBzZWNvbmRzIC8gMzYwMFxuICBpZiAoXG4gICAgY29vcmRpbmF0ZS5kaXJlY3Rpb24gPT09IERpcmVjdGlvbi5Ob3J0aCB8fFxuICAgIGNvb3JkaW5hdGUuZGlyZWN0aW9uID09PSBEaXJlY3Rpb24uRWFzdFxuICApIHtcbiAgICByZXR1cm4gZGRcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gLWRkXG4gIH1cbn1cblxuLypcbiAqICBETVMgLT4gV0tUIGNvbnZlcnNpb24gdXRpbHNcbiAqL1xuZnVuY3Rpb24gZG1zUG9pbnRUb1drdChwb2ludDogYW55KSB7XG4gIGNvbnN0IGxhdGl0dWRlID0gcGFyc2VEbXNDb29yZGluYXRlKHBvaW50LmxhdGl0dWRlLmNvb3JkaW5hdGUpXG4gIGNvbnN0IGxvbmdpdHVkZSA9IHBhcnNlRG1zQ29vcmRpbmF0ZShwb2ludC5sb25naXR1ZGUuY29vcmRpbmF0ZSlcbiAgY29uc3QgX2xhdGl0dWRlID0gZG1zQ29vcmRpbmF0ZVRvREQoe1xuICAgIC4uLmxhdGl0dWRlLFxuICAgIGRpcmVjdGlvbjogcG9pbnQubGF0aXR1ZGUuZGlyZWN0aW9uLFxuICB9KVxuICBjb25zdCBfbG9uZ2l0dWRlID0gZG1zQ29vcmRpbmF0ZVRvREQoe1xuICAgIC4uLmxvbmdpdHVkZSxcbiAgICBkaXJlY3Rpb246IHBvaW50LmxvbmdpdHVkZS5kaXJlY3Rpb24sXG4gIH0pXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAnbnVtYmVyIHwgbnVsbCcgaXMgbm90IGFzc2lnbmFibGUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICByZXR1cm4gbmV3IHdreC5Qb2ludChfbG9uZ2l0dWRlLCBfbGF0aXR1ZGUpXG59XG5cbmZ1bmN0aW9uIGRtc1RvV2t0KGRtczogYW55KSB7XG4gIGlmIChpbnB1dElzQmxhbmsoZG1zKSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBsZXQgd2t0ID0gbnVsbFxuICBjb25zdCBwb2ludHM6IGFueSA9IFtdXG4gIHN3aXRjaCAoZG1zLnNoYXBlKSB7XG4gICAgY2FzZSAncG9pbnQnOlxuICAgICAgd2t0ID0gZG1zUG9pbnRUb1drdChkbXMucG9pbnQpLnRvV2t0KClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gdG9LaWxvbWV0ZXJzKGRtcy5jaXJjbGUucmFkaXVzLCBkbXMuY2lyY2xlLnVuaXRzKVxuICAgICAgd2t0ID0gY29tcHV0ZUNpcmNsZShcbiAgICAgICAgZG1zUG9pbnRUb1drdChkbXMuY2lyY2xlLnBvaW50KSxcbiAgICAgICAgZGlzdGFuY2UsXG4gICAgICAgIDM2XG4gICAgICApPy50b1drdCgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgaWYgKGRtcy5saW5lLmxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICBkbXMubGluZS5saXN0Lm1hcCgocG9pbnQ6IGFueSkgPT4gcG9pbnRzLnB1c2goZG1zUG9pbnRUb1drdChwb2ludCkpKVxuICAgICAgICB3a3QgPSBuZXcgd2t4LkxpbmVTdHJpbmcocG9pbnRzKS50b1drdCgpXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ3BvbHlnb24nOlxuICAgICAgaWYgKGRtcy5wb2x5Z29uLmxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICBkbXMucG9seWdvbi5saXN0Lm1hcCgocG9pbnQ6IGFueSkgPT4gcG9pbnRzLnB1c2goZG1zUG9pbnRUb1drdChwb2ludCkpKVxuICAgICAgICBjb25zdCBwMSA9IHBvaW50c1swXVxuICAgICAgICBjb25zdCBwMiA9IHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV1cbiAgICAgICAgaWYgKHAxLnggIT09IHAyLnggfHwgcDEueSAhPT0gcDIueSkge1xuICAgICAgICAgIHBvaW50cy5wdXNoKG5ldyB3a3guUG9pbnQocDEueCwgcDEueSkpXG4gICAgICAgIH1cbiAgICAgICAgd2t0ID0gbmV3IHdreC5Qb2x5Z29uKHBvaW50cykudG9Xa3QoKVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdib3VuZGluZ2JveCc6XG4gICAgICBjb25zdCBudyA9IHtcbiAgICAgICAgbGF0aXR1ZGU6IGRtcy5ib3VuZGluZ2JveC5ub3J0aCxcbiAgICAgICAgbG9uZ2l0dWRlOiBkbXMuYm91bmRpbmdib3gud2VzdCxcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5lID0ge1xuICAgICAgICBsYXRpdHVkZTogZG1zLmJvdW5kaW5nYm94Lm5vcnRoLFxuICAgICAgICBsb25naXR1ZGU6IGRtcy5ib3VuZGluZ2JveC5lYXN0LFxuICAgICAgfVxuICAgICAgY29uc3Qgc2UgPSB7XG4gICAgICAgIGxhdGl0dWRlOiBkbXMuYm91bmRpbmdib3guc291dGgsXG4gICAgICAgIGxvbmdpdHVkZTogZG1zLmJvdW5kaW5nYm94LmVhc3QsXG4gICAgICB9XG4gICAgICBjb25zdCBzdyA9IHtcbiAgICAgICAgbGF0aXR1ZGU6IGRtcy5ib3VuZGluZ2JveC5zb3V0aCxcbiAgICAgICAgbG9uZ2l0dWRlOiBkbXMuYm91bmRpbmdib3gud2VzdCxcbiAgICAgIH1cbiAgICAgIGNvbnN0IF9udyA9IGRtc1BvaW50VG9Xa3QobncpXG4gICAgICBjb25zdCBfbmUgPSBkbXNQb2ludFRvV2t0KG5lKVxuICAgICAgY29uc3QgX3NlID0gZG1zUG9pbnRUb1drdChzZSlcbiAgICAgIGNvbnN0IF9zdyA9IGRtc1BvaW50VG9Xa3Qoc3cpXG4gICAgICB3a3QgPSBuZXcgd2t4LlBvbHlnb24oW19udywgX25lLCBfc2UsIF9zdywgX253XSkudG9Xa3QoKVxuICAgICAgYnJlYWtcbiAgfVxuICByZXR1cm4gd2t0XG59XG5cbi8qXG4gKiAgRE1TIHZhbGlkYXRpb24gdXRpbHNcbiAqL1xuZnVuY3Rpb24gaW5WYWxpZFJhbmdlKGNvb3JkaW5hdGU6IGFueSwgbWF4aW11bTogYW55KSB7XG4gIGNvbnN0IGRlZ3JlZXMgPSBwYXJzZUludChjb29yZGluYXRlLmRlZ3JlZXMpXG4gIGNvbnN0IG1pbnV0ZXMgPSBwYXJzZUludChjb29yZGluYXRlLm1pbnV0ZXMpXG4gIGNvbnN0IHNlY29uZHMgPSBwYXJzZUZsb2F0KGNvb3JkaW5hdGUuc2Vjb25kcylcbiAgaWYgKGlzTmFOKHNlY29uZHMpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgaWYgKGRlZ3JlZXMgPiBtYXhpbXVtIHx8IG1pbnV0ZXMgPiA2MCB8fCBzZWNvbmRzID4gNjApIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBpZiAoZGVncmVlcyA9PT0gbWF4aW11bSAmJiAobWludXRlcyA+IDAgfHwgc2Vjb25kcyA+IDApKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVEbXNQb2ludChwb2ludDogYW55KSB7XG4gIGNvbnN0IGxhdGl0dWRlID0gcGFyc2VEbXNDb29yZGluYXRlKHBvaW50LmxhdGl0dWRlLmNvb3JkaW5hdGUpXG4gIGNvbnN0IGxvbmdpdHVkZSA9IHBhcnNlRG1zQ29vcmRpbmF0ZShwb2ludC5sb25naXR1ZGUuY29vcmRpbmF0ZSlcbiAgaWYgKGxhdGl0dWRlICYmIGxvbmdpdHVkZSkge1xuICAgIHJldHVybiBpblZhbGlkUmFuZ2UobGF0aXR1ZGUsIDkwKSAmJiBpblZhbGlkUmFuZ2UobG9uZ2l0dWRlLCAxODApXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRG1zQm91bmRpbmdCb3goYm91bmRpbmdib3g6IGFueSkge1xuICBjb25zdCBub3J0aCA9IHBhcnNlRG1zQ29vcmRpbmF0ZShib3VuZGluZ2JveC5ub3J0aC5jb29yZGluYXRlKVxuICBjb25zdCBzb3V0aCA9IHBhcnNlRG1zQ29vcmRpbmF0ZShib3VuZGluZ2JveC5zb3V0aC5jb29yZGluYXRlKVxuICBjb25zdCBlYXN0ID0gcGFyc2VEbXNDb29yZGluYXRlKGJvdW5kaW5nYm94LmVhc3QuY29vcmRpbmF0ZSlcbiAgY29uc3Qgd2VzdCA9IHBhcnNlRG1zQ29vcmRpbmF0ZShib3VuZGluZ2JveC53ZXN0LmNvb3JkaW5hdGUpXG5cbiAgaWYgKCFub3J0aCB8fCAhc291dGggfHwgIWVhc3QgfHwgIXdlc3QpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChcbiAgICAhaW5WYWxpZFJhbmdlKG5vcnRoLCA5MCkgfHxcbiAgICAhaW5WYWxpZFJhbmdlKHNvdXRoLCA5MCkgfHxcbiAgICAhaW5WYWxpZFJhbmdlKGVhc3QsIDE4MCkgfHxcbiAgICAhaW5WYWxpZFJhbmdlKHdlc3QsIDE4MClcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjb25zdCBkZE5vcnRoID0gZG1zQ29vcmRpbmF0ZVRvREQoe1xuICAgIC4uLm5vcnRoLFxuICAgIGRpcmVjdGlvbjogYm91bmRpbmdib3gubm9ydGguZGlyZWN0aW9uLFxuICB9KVxuICBjb25zdCBkZFNvdXRoID0gZG1zQ29vcmRpbmF0ZVRvREQoe1xuICAgIC4uLnNvdXRoLFxuICAgIGRpcmVjdGlvbjogYm91bmRpbmdib3guc291dGguZGlyZWN0aW9uLFxuICB9KVxuICBjb25zdCBkZEVhc3QgPSBkbXNDb29yZGluYXRlVG9ERCh7XG4gICAgLi4uZWFzdCxcbiAgICBkaXJlY3Rpb246IGJvdW5kaW5nYm94LmVhc3QuZGlyZWN0aW9uLFxuICB9KVxuICBjb25zdCBkZFdlc3QgPSBkbXNDb29yZGluYXRlVG9ERCh7XG4gICAgLi4ud2VzdCxcbiAgICBkaXJlY3Rpb246IGJvdW5kaW5nYm94Lndlc3QuZGlyZWN0aW9uLFxuICB9KVxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gIGlmIChkZE5vcnRoIDwgZGRTb3V0aCB8fCBkZEVhc3QgPCBkZFdlc3QpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgZGROb3J0aCAtIGRkU291dGggPCBtaW5pbXVtRGlmZmVyZW5jZSB8fFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBkZEVhc3QgLSBkZFdlc3QgPCBtaW5pbXVtRGlmZmVyZW5jZVxuICApIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRG1zKGRtczogYW55KSB7XG4gIGlmIChpbnB1dElzQmxhbmsoZG1zKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBlcnJvcjogbnVsbCB9XG4gIH1cblxuICBsZXQgdmFsaWQgPSB0cnVlXG4gIGxldCBlcnJvciA9IG51bGxcbiAgc3dpdGNoIChkbXMuc2hhcGUpIHtcbiAgICBjYXNlICdwb2ludCc6XG4gICAgICBpZiAoIXZhbGlkYXRlRG1zUG9pbnQoZG1zLnBvaW50KSkge1xuICAgICAgICB2YWxpZCA9IGZhbHNlXG4gICAgICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy5pbnZhbGlkQ29vcmRpbmF0ZXNcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgIGNvbnN0IHJhZGl1cyA9IHBhcnNlRmxvYXQoZG1zLmNpcmNsZS5yYWRpdXMpXG4gICAgICBpZiAoXG4gICAgICAgIGlzTmFOKHJhZGl1cykgfHxcbiAgICAgICAgcmFkaXVzIDw9IDAgfHxcbiAgICAgICAgdG9LaWxvbWV0ZXJzKHJhZGl1cywgZG1zLmNpcmNsZS51bml0cykgPiAxMDAwMFxuICAgICAgKSB7XG4gICAgICAgIHZhbGlkID0gZmFsc2VcbiAgICAgICAgZXJyb3IgPSBlcnJvck1lc3NhZ2VzLmludmFsaWRSYWRpdXNcbiAgICAgIH0gZWxzZSBpZiAoIXZhbGlkYXRlRG1zUG9pbnQoZG1zLmNpcmNsZS5wb2ludCkpIHtcbiAgICAgICAgdmFsaWQgPSBmYWxzZVxuICAgICAgICBlcnJvciA9IGVycm9yTWVzc2FnZXMuaW52YWxpZENvb3JkaW5hdGVzXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgaWYgKCFkbXMubGluZS5saXN0LmV2ZXJ5KHZhbGlkYXRlRG1zUG9pbnQpKSB7XG4gICAgICAgIHZhbGlkID0gZmFsc2VcbiAgICAgICAgZXJyb3IgPSBlcnJvck1lc3NhZ2VzLmludmFsaWRMaXN0XG4gICAgICB9IGVsc2UgaWYgKGRtcy5saW5lLmxpc3QubGVuZ3RoIDwgMikge1xuICAgICAgICB2YWxpZCA9IGZhbHNlXG4gICAgICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy50b29GZXdQb2ludHNMaW5lXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ3BvbHlnb24nOlxuICAgICAgaWYgKCFkbXMucG9seWdvbi5saXN0LmV2ZXJ5KHZhbGlkYXRlRG1zUG9pbnQpKSB7XG4gICAgICAgIHZhbGlkID0gZmFsc2VcbiAgICAgICAgZXJyb3IgPSBlcnJvck1lc3NhZ2VzLmludmFsaWRMaXN0XG4gICAgICB9IGVsc2UgaWYgKGRtcy5wb2x5Z29uLmxpc3QubGVuZ3RoIDwgMykge1xuICAgICAgICB2YWxpZCA9IGZhbHNlXG4gICAgICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy50b29GZXdQb2ludHNQb2x5Z29uXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JvdW5kaW5nYm94JzpcbiAgICAgIGlmIChcbiAgICAgICAgIXZhbGlkYXRlRG1zUG9pbnQoe1xuICAgICAgICAgIGxhdGl0dWRlOiBkbXMuYm91bmRpbmdib3gubm9ydGgsXG4gICAgICAgICAgbG9uZ2l0dWRlOiBkbXMuYm91bmRpbmdib3guZWFzdCxcbiAgICAgICAgfSkgfHxcbiAgICAgICAgIXZhbGlkYXRlRG1zUG9pbnQoe1xuICAgICAgICAgIGxhdGl0dWRlOiBkbXMuYm91bmRpbmdib3guc291dGgsXG4gICAgICAgICAgbG9uZ2l0dWRlOiBkbXMuYm91bmRpbmdib3gud2VzdCxcbiAgICAgICAgfSlcbiAgICAgICkge1xuICAgICAgICB2YWxpZCA9IGZhbHNlXG4gICAgICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy5pbnZhbGlkQ29vcmRpbmF0ZXNcbiAgICAgIH0gZWxzZSBpZiAoIXZhbGlkYXRlRG1zQm91bmRpbmdCb3goZG1zLmJvdW5kaW5nYm94KSkge1xuICAgICAgICB2YWxpZCA9IGZhbHNlXG4gICAgICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy5pbnZhbGlkQm91bmRpbmdCb3hEbXNcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gIH1cbiAgcmV0dXJuIHsgdmFsaWQsIGVycm9yIH1cbn1cblxuLypcbiAqICBEZWNpbWFsIGRlZ3JlZXMgLT4gRE1TIGNvbnZlcnNpb24gdXRpbHNcbiAqL1xuZnVuY3Rpb24gcm91bmRUbyhudW06IGFueSwgc2lnRGlnaXRzOiBhbnkpIHtcbiAgY29uc3Qgc2NhbGVyID0gMTAgKiogc2lnRGlnaXRzXG4gIHJldHVybiBNYXRoLnJvdW5kKG51bSAqIHNjYWxlcikgLyBzY2FsZXJcbn1cblxuZnVuY3Rpb24gcGFkV2l0aFplcm9zKG51bTogYW55LCB3aWR0aDogYW55KSB7XG4gIHJldHVybiBudW0udG9TdHJpbmcoKS5wYWRTdGFydCh3aWR0aCwgJzAnKVxufVxuXG5mdW5jdGlvbiBwYWREZWNpbWFsV2l0aFplcm9zKG51bTogYW55LCB3aWR0aDogYW55KSB7XG4gIGNvbnN0IGRlY2ltYWxQYXJ0cyA9IG51bS50b1N0cmluZygpLnNwbGl0KCcuJylcbiAgaWYgKGRlY2ltYWxQYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgcmV0dXJuIGRlY2ltYWxQYXJ0c1swXS5wYWRTdGFydCh3aWR0aCwgJzAnKSArICcuJyArIGRlY2ltYWxQYXJ0c1sxXVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYWRXaXRoWmVyb3MobnVtLCB3aWR0aClcbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZERtc1N0cmluZyhjb21wb25lbnRzOiBhbnkpIHtcbiAgaWYgKCFjb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNcbiAgfVxuICByZXR1cm4gYCR7Y29tcG9uZW50cy5kZWdyZWVzfcKwJHtjb21wb25lbnRzLm1pbnV0ZXN9JyR7Y29tcG9uZW50cy5zZWNvbmRzfVwiYFxufVxuXG5mdW5jdGlvbiByZXBsYWNlUGxhY2Vob2xkZXJXaXRoWmVyb3MobnVtU3RyaW5nID0gJycpIHtcbiAgd2hpbGUgKG51bVN0cmluZy5pbmNsdWRlcygnXycpKSB7XG4gICAgaWYgKG51bVN0cmluZy5pbmNsdWRlcygnLicpKSB7XG4gICAgICBudW1TdHJpbmcgPSBudW1TdHJpbmcucmVwbGFjZSgnXycsICcwJylcbiAgICB9IGVsc2Uge1xuICAgICAgbnVtU3RyaW5nID0gbnVtU3RyaW5nLnJlcGxhY2UoJ18nLCAnJylcbiAgICAgIG51bVN0cmluZyA9ICcwJyArIG51bVN0cmluZ1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVtU3RyaW5nXG59XG5cbmZ1bmN0aW9uIGRkVG9EbXNDb29yZGluYXRlKFxuICBkZDogYW55LFxuICBkaXJlY3Rpb246IGFueSxcbiAgZGVncmVlc1BhZDogYW55LFxuICBzZWNvbmRzUHJlY2lzaW9uID0gREVGQVVMVF9TRUNPTkRTX1BSRUNJU0lPTlxuKSB7XG4gIGNvbnN0IGRkQWJzb2x1dGVWYWx1ZSA9IE1hdGguYWJzKGRkKVxuICBjb25zdCBkZWdyZWVzID0gTWF0aC50cnVuYyhkZEFic29sdXRlVmFsdWUpXG4gIGNvbnN0IGRlZ3JlZUZyYWN0aW9uID0gZGRBYnNvbHV0ZVZhbHVlIC0gZGVncmVlc1xuICBjb25zdCBtaW51dGVzID0gTWF0aC50cnVuYyg2MCAqIGRlZ3JlZUZyYWN0aW9uKVxuICBjb25zdCBzZWNvbmRzID0gMzYwMCAqIGRlZ3JlZUZyYWN0aW9uIC0gNjAgKiBtaW51dGVzXG4gIGNvbnN0IHNlY29uZHNSb3VuZGVkID0gcm91bmRUbyhzZWNvbmRzLCBzZWNvbmRzUHJlY2lzaW9uKVxuICByZXR1cm4ge1xuICAgIGNvb3JkaW5hdGU6IGJ1aWxkRG1zU3RyaW5nKHtcbiAgICAgIGRlZ3JlZXM6IHBhZFdpdGhaZXJvcyhkZWdyZWVzLCBkZWdyZWVzUGFkKSxcbiAgICAgIG1pbnV0ZXM6IHBhZFdpdGhaZXJvcyhtaW51dGVzLCAyKSxcbiAgICAgIHNlY29uZHM6IHBhZERlY2ltYWxXaXRoWmVyb3Moc2Vjb25kc1JvdW5kZWQsIDIpLFxuICAgIH0pLFxuICAgIGRpcmVjdGlvbixcbiAgfVxufVxuXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAzMCkgRklYTUU6IE5vdCBhbGwgY29kZSBwYXRocyByZXR1cm4gYSB2YWx1ZS5cbmZ1bmN0aW9uIGRkVG9EbXNDb29yZGluYXRlTGF0KFxuICBkZDogYW55LFxuICBzZWNvbmRzUHJlY2lzaW9uID0gREVGQVVMVF9TRUNPTkRTX1BSRUNJU0lPTlxuKSB7XG4gIGlmICghaXNOYU4oZGQpKSB7XG4gICAgY29uc3QgZGlyZWN0aW9uID0gZGQgPj0gMCA/IERpcmVjdGlvbi5Ob3J0aCA6IERpcmVjdGlvbi5Tb3V0aFxuICAgIHJldHVybiBkZFRvRG1zQ29vcmRpbmF0ZShcbiAgICAgIGRkLFxuICAgICAgZGlyZWN0aW9uLFxuICAgICAgTEFUX0RFR1JFRVNfRElHSVRTLFxuICAgICAgc2Vjb25kc1ByZWNpc2lvblxuICAgIClcbiAgfVxufVxuXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAzMCkgRklYTUU6IE5vdCBhbGwgY29kZSBwYXRocyByZXR1cm4gYSB2YWx1ZS5cbmZ1bmN0aW9uIGRkVG9EbXNDb29yZGluYXRlTG9uKFxuICBkZDogYW55LFxuICBzZWNvbmRzUHJlY2lzaW9uID0gREVGQVVMVF9TRUNPTkRTX1BSRUNJU0lPTlxuKSB7XG4gIGlmICghaXNOYU4oZGQpKSB7XG4gICAgY29uc3QgZGlyZWN0aW9uID0gZGQgPj0gMCA/IERpcmVjdGlvbi5FYXN0IDogRGlyZWN0aW9uLldlc3RcbiAgICByZXR1cm4gZGRUb0Rtc0Nvb3JkaW5hdGUoXG4gICAgICBkZCxcbiAgICAgIGRpcmVjdGlvbixcbiAgICAgIExPTl9ERUdSRUVTX0RJR0lUUyxcbiAgICAgIHNlY29uZHNQcmVjaXNpb25cbiAgICApXG4gIH1cbn1cblxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG5mdW5jdGlvbiBnZXRTZWNvbmRzUHJlY2lzaW9uKGRtc0Nvb3JkaW5hdGU6IGFueSkge1xuICBpZiAoZG1zQ29vcmRpbmF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgZGVjaW1hbEluZGV4ID0gZG1zQ29vcmRpbmF0ZS5pbmRleE9mKCcuJylcbiAgLy8gTXVzdCBzdWJ0cmFjdCAyIGluc3RlYWQgb2YgMSBiZWNhdXNlIHRoZSBETVMgY29vcmRpbmF0ZSBlbmRzIHdpdGggXCJcbiAgY29uc3QgbGFzdE51bWJlckluZGV4ID0gZG1zQ29vcmRpbmF0ZS5sZW5ndGggLSAyXG4gIGlmIChkZWNpbWFsSW5kZXggPiAtMSAmJiBsYXN0TnVtYmVySW5kZXggPiBkZWNpbWFsSW5kZXgpIHtcbiAgICByZXR1cm4gbGFzdE51bWJlckluZGV4IC0gZGVjaW1hbEluZGV4XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgZG1zVG9Xa3QsXG4gIHZhbGlkYXRlRG1zLFxuICB2YWxpZGF0ZURtc1BvaW50LFxuICBkbXNDb29yZGluYXRlVG9ERCxcbiAgcGFyc2VEbXNDb29yZGluYXRlLFxuICBkZFRvRG1zQ29vcmRpbmF0ZUxhdCxcbiAgZGRUb0Rtc0Nvb3JkaW5hdGVMb24sXG4gIGdldFNlY29uZHNQcmVjaXNpb24sXG4gIGJ1aWxkRG1zU3RyaW5nLFxuICBEaXJlY3Rpb24sXG59XG4iXX0=