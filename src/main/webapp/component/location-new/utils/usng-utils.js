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
import * as usng from 'usng.js';
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
var converter = new usng.Converter();
import { computeCircle, toKilometers } from './geo-helper';
import errorMessages from './errors';
export function validateUsngGrid(grid) {
    return converter.isUSNG(grid) !== 0;
}
function gridIsBlank(grid) {
    return grid.length === 0;
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function inputIsBlank(usng) {
    switch (usng.shape) {
        case 'point':
            return gridIsBlank(usng.point);
        case 'circle':
            return gridIsBlank(usng.circle.point);
        case 'line':
            return usng.line.list.length === 0;
        case 'polygon':
            return usng.polygon.list.length === 0;
        case 'boundingbox':
            return gridIsBlank(usng.boundingbox);
    }
}
/*
 *  USNG/MGRS -> WKT conversion utils
 */
function usngGridToWktPoint(grid) {
    var LL = converter.USNGtoLL(grid, true);
    return new wkx.Point(LL.lon, LL.lat);
}
export function usngToWkt(usng) {
    var _a;
    if (inputIsBlank(usng)) {
        return null;
    }
    var wkt = null;
    var points = [];
    switch (usng.shape) {
        case 'point':
            wkt = usngGridToWktPoint(usng.point).toWkt();
            break;
        case 'circle':
            var distance = toKilometers(usng.circle.radius, usng.circle.units);
            wkt = (_a = computeCircle(usngGridToWktPoint(usng.circle.point), distance, 36)) === null || _a === void 0 ? void 0 : _a.toWkt();
            break;
        case 'line':
            if (usng.line.list.length > 0) {
                usng.line.list.map(function (grid) { return points.push(usngGridToWktPoint(grid)); });
                wkt = new wkx.LineString(points).toWkt();
            }
            break;
        case 'polygon':
            if (usng.polygon.list.length > 0) {
                usng.polygon.list.map(function (grid) {
                    return points.push(usngGridToWktPoint(grid));
                });
                var p1 = points[0];
                var p2 = points[points.length - 1];
                if (p1.x !== p2.x || p1.y !== p2.y) {
                    points.push(new wkx.Point(p1.x, p1.y));
                }
                wkt = new wkx.Polygon(points).toWkt();
            }
            break;
        case 'boundingbox':
            var grid = converter.isUSNG(usng.boundingbox);
            var bbox = converter.USNGtoLL(grid, false);
            var minLon = bbox.west;
            var minLat = bbox.south;
            var maxLon = bbox.east;
            var maxLat = bbox.north;
            var nw = new wkx.Point(minLon, maxLat);
            var ne = new wkx.Point(maxLon, maxLat);
            var se = new wkx.Point(maxLon, minLat);
            var sw = new wkx.Point(minLon, minLat);
            wkt = new wkx.Polygon([nw, ne, se, sw, nw]).toWkt();
            break;
    }
    return wkt;
}
/*
 *  USNG/MGRS validation utils
 */
export function validateUsng(usng) {
    if (inputIsBlank(usng)) {
        return { valid: true, error: null };
    }
    var valid = true;
    var error = null;
    switch (usng.shape) {
        case 'point':
            if (!validateUsngGrid(usng.point)) {
                valid = false;
                error = errorMessages.invalidUsngGrid;
            }
            break;
        case 'circle':
            var radius = parseFloat(usng.circle.radius);
            if (isNaN(radius) ||
                radius <= 0 ||
                toKilometers(radius, usng.circle.units) > 10000) {
                valid = false;
                error = errorMessages.invalidRadius;
            }
            else if (!validateUsngGrid(usng.circle.point)) {
                valid = false;
                error = errorMessages.invalidUsngGrid;
            }
            break;
        case 'line':
            if (!usng.line.list.every(validateUsngGrid)) {
                valid = false;
                error = errorMessages.invalidList;
            }
            else if (usng.line.list.length < 2) {
                valid = false;
                error = errorMessages.tooFewPointsLine;
            }
            break;
        case 'polygon':
            if (!usng.polygon.list.every(validateUsngGrid)) {
                valid = false;
                error = errorMessages.invalidList;
            }
            else if (usng.line.list.length < 3) {
                valid = false;
                error = errorMessages.tooFewPointsPolygon;
            }
            break;
        case 'boundingbox':
            if (!validateUsngGrid(usng.boundingbox)) {
                valid = false;
                error = errorMessages.invalidUsngGrid;
            }
            break;
    }
    return { valid: valid, error: error };
}
//# sourceMappingURL=usng-utils.js.map