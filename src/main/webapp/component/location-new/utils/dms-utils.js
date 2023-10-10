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
//# sourceMappingURL=dms-utils.js.map