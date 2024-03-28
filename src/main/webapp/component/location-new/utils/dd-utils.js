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
var ddRegex = new RegExp('^-?[0-9]*.?[0-9]*$');
var minimumDifference = 0.0001;
function ddCoordinateIsBlank(coordinate) {
    return coordinate.length === 0;
}
function ddPointIsBlank(point) {
    return (ddCoordinateIsBlank(point.latitude) && ddCoordinateIsBlank(point.longitude));
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function inputIsBlank(dd) {
    switch (dd.shape) {
        case 'point':
            return ddPointIsBlank(dd.point);
        case 'circle':
            return ddPointIsBlank(dd.circle.point);
        case 'line':
            return dd.line.list.length === 0;
        case 'polygon':
            return dd.polygon.list.length === 0;
        case 'boundingbox':
            return (ddCoordinateIsBlank(dd.boundingbox.north) &&
                ddCoordinateIsBlank(dd.boundingbox.south) &&
                ddCoordinateIsBlank(dd.boundingbox.east) &&
                ddCoordinateIsBlank(dd.boundingbox.west));
    }
}
/*
 *  Decimal degrees -> WKT conversion utils
 */
function ddPointToWkt(point) {
    return new wkx.Point(point.longitude, point.latitude);
}
function ddToWkt(dd) {
    var _a;
    if (inputIsBlank(dd)) {
        return null;
    }
    var wkt = null;
    var points = [];
    switch (dd.shape) {
        case 'point':
            wkt = ddPointToWkt(dd.point).toWkt();
            break;
        case 'circle':
            if (!isNaN(dd.circle.point.latitude) &&
                !isNaN(dd.circle.point.longitude) &&
                dd.circle.radius > 0) {
                var distance = toKilometers(dd.circle.radius, dd.circle.units);
                wkt = (_a = computeCircle(ddPointToWkt(dd.circle.point), distance, 36)) === null || _a === void 0 ? void 0 : _a.toWkt();
            }
            break;
        case 'line':
            if (dd.line.list.length > 0) {
                dd.line.list.map(function (point) { return points.push(ddPointToWkt(point)); });
                wkt = new wkx.LineString(points).toWkt();
            }
            break;
        case 'polygon':
            if (dd.polygon.list.length > 0) {
                dd.polygon.list.map(function (point) { return points.push(ddPointToWkt(point)); });
                var p1 = points[0];
                var p2 = points[points.length - 1];
                if (p1.x !== p2.x || p1.y !== p2.y) {
                    points.push(new wkx.Point(p1.x, p1.y));
                }
                wkt = new wkx.Polygon(points).toWkt();
            }
            break;
        case 'boundingbox':
            var nw = new wkx.Point(dd.boundingbox.west, dd.boundingbox.north);
            var ne = new wkx.Point(dd.boundingbox.east, dd.boundingbox.north);
            var se = new wkx.Point(dd.boundingbox.east, dd.boundingbox.south);
            var sw = new wkx.Point(dd.boundingbox.west, dd.boundingbox.south);
            wkt = new wkx.Polygon([nw, ne, se, sw, nw]).toWkt();
            break;
    }
    return wkt;
}
/*
 *  Decimal degrees validation utils
 */
function parseDdCoordinate(coordinate) {
    if (ddRegex.exec(coordinate) == null) {
        return null;
    }
    var _coordinate = parseFloat(coordinate);
    if (isNaN(_coordinate)) {
        return null;
    }
    return _coordinate;
}
function inValidRange(coordinate, maximum) {
    return coordinate >= -1 * maximum && coordinate <= maximum;
}
function validateDdPoint(point) {
    var latitude = parseDdCoordinate(point.latitude);
    var longitude = parseDdCoordinate(point.longitude);
    if (latitude && longitude) {
        return inValidRange(latitude, 90) && inValidRange(longitude, 180);
    }
    return false;
}
function validateDdBoundingBox(boundingbox) {
    var north = parseDdCoordinate(boundingbox.north);
    var south = parseDdCoordinate(boundingbox.south);
    var east = parseDdCoordinate(boundingbox.east);
    var west = parseDdCoordinate(boundingbox.west);
    if (north == null || south == null || east == null || west == null) {
        return false;
    }
    if (!inValidRange(north, 90) ||
        !inValidRange(south, 90) ||
        !inValidRange(east, 180) ||
        !inValidRange(west, 180)) {
        return false;
    }
    if (north < south || east < west) {
        return false;
    }
    if (north - south < minimumDifference || east - west < minimumDifference) {
        return false;
    }
    return true;
}
function validateDd(dd) {
    if (inputIsBlank(dd)) {
        return { valid: true, error: null };
    }
    var valid = true;
    var error = null;
    switch (dd.shape) {
        case 'point':
            if (!validateDdPoint(dd.point)) {
                valid = false;
                error = errorMessages.invalidCoordinates;
            }
            break;
        case 'circle':
            var radius = parseFloat(dd.circle.radius);
            if (isNaN(radius) ||
                radius <= 0 ||
                toKilometers(radius, dd.circle.units) > 10000) {
                valid = false;
                error = errorMessages.invalidRadius;
            }
            else if (!validateDdPoint(dd.circle.point)) {
                valid = false;
                error = errorMessages.invalidCoordinates;
            }
            break;
        case 'line':
            if (!dd.line.list.every(validateDdPoint)) {
                valid = false;
                error = errorMessages.invalidList;
            }
            else if (dd.line.list.length < 2) {
                valid = false;
                error = errorMessages.tooFewPointsLine;
            }
            break;
        case 'polygon':
            if (!dd.polygon.list.every(validateDdPoint)) {
                valid = false;
                error = errorMessages.invalidList;
            }
            else if (dd.polygon.list.length < 3) {
                valid = false;
                error = errorMessages.tooFewPointsPolygon;
            }
            break;
        case 'boundingbox':
            if (!validateDdPoint({
                latitude: dd.boundingbox.north,
                longitude: dd.boundingbox.east,
            }) ||
                !validateDdPoint({
                    latitude: dd.boundingbox.south,
                    longitude: dd.boundingbox.west,
                })) {
                valid = false;
                error = errorMessages.invalidCoordinates;
            }
            else if (!validateDdBoundingBox(dd.boundingbox)) {
                valid = false;
                error = errorMessages.invalidBoundingBoxDd;
            }
            break;
    }
    return { valid: valid, error: error };
}
export { ddToWkt, validateDd, validateDdPoint };
//# sourceMappingURL=dd-utils.js.map