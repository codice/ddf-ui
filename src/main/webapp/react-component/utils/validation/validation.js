import { __assign, __makeTemplateObject } from "tslib";
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
import React from 'react';
import styled from 'styled-components';
import * as usngs from 'usng.js';
import _ from 'lodash';
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
var converter = new usngs.Converter();
var NORTHING_OFFSET = 10000000;
var LATITUDE = 'latitude';
var LONGITUDE = 'longitude';
// 75 meters was determined to be a reasonable min for linestring searches based on testing against known
// data sources
export var LINE_BUFFER_MININUM_METERS = 75;
import DistanceUtils from '../../../js/DistanceUtils';
import { parseDmsCoordinate, dmsCoordinateToDD, } from '../../../component/location-new/utils/dms-utils';
import wreqr from '../../../js/wreqr';
import { errorMessages } from '../../../component/location-new/utils';
export function showErrorMessages(errors) {
    if (errors.length === 0) {
        return;
    }
    var searchErrorMessage = {
        title: '',
        message: '',
    };
    if (errors.length > 1) {
        var msg = searchErrorMessage.message;
        searchErrorMessage.title =
            'Your search cannot be run due to multiple errors';
        var formattedErrors = errors.map(function (error) { return "\u2022 ".concat(error.title, ": ").concat(error.body); });
        searchErrorMessage.message = msg.concat(formattedErrors);
    }
    else {
        var error = errors[0];
        searchErrorMessage.title = error.title;
        searchErrorMessage.message = error.body;
    }
    ;
    wreqr.vent.trigger('snack', {
        message: "".concat(searchErrorMessage.title, " : ").concat(searchErrorMessage.message),
        snackProps: {
            alertProps: {
                severity: 'error',
            },
        },
    });
}
export function getFilterErrors(filters) {
    var errors = new Set();
    var geometryErrors = new Set();
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        getGeometryErrors(filter).forEach(function (msg) {
            geometryErrors.add(msg);
        });
    }
    geometryErrors.forEach(function (err) {
        errors.add({
            title: 'Invalid geometry filter',
            body: err,
        });
    });
    return Array.from(errors);
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
export function validateGeo(key, value) {
    switch (key) {
        case 'lat':
            return validateDDLatLon(LATITUDE, value, 90);
        case 'lon':
            return validateDDLatLon(LONGITUDE, value, 180);
        case 'dmsLat':
            return validateDmsLatLon(LATITUDE, value);
        case 'dmsLon':
            return validateDmsLatLon(LONGITUDE, value);
        case 'usng':
            return validateUsng(value);
        case 'easting':
        case 'northing':
        case 'zoneNumber':
        case 'hemisphere':
            return validateUtmUps(key, value);
        case 'radius':
        case 'lineWidth':
        case 'polygonBufferWidth':
            return validateRadiusLineBuffer(key, value);
        case 'line':
        case 'poly':
        case 'polygon':
        case 'multiline':
        case 'multipolygon':
            return validateLinePolygon(key, value);
        case 'bbox':
            return validateBoundingBox(key, value);
        default:
    }
}
export var ErrorComponent = function (props) {
    var errorState = props.errorState;
    return errorState.error ? (React.createElement(Invalid, { className: "my-2" },
        React.createElement(WarningIcon, { className: "fa fa-warning" }),
        React.createElement("span", null, errorState.message))) : null;
};
export function validateListOfPoints(coordinates, mode) {
    var message = null;
    var isLine = mode.includes('line');
    var numPoints = isLine ? 2 : 4;
    if (!mode.includes('multi') &&
        !isLine &&
        coordinates.length >= numPoints &&
        !_.isEqual(coordinates[0], coordinates.slice(-1)[0])) {
        message = errorMessages.firstLastPointMismatch;
    }
    if (!mode.includes('multi') &&
        !coordinates.some(function (coords) { return coords.length > 2; }) &&
        coordinates.length < numPoints) {
        message = "Minimum of ".concat(numPoints, " points needed for ").concat(isLine ? 'Line' : 'Polygon');
    }
    coordinates.forEach(function (coordinate) {
        if (coordinate.length > 2) {
            coordinate.forEach(function (coord) {
                if (hasPointError(coord))
                    message = JSON.stringify(coord) + ' is not a valid point';
            });
        }
        else {
            if (mode.includes('multi')) {
                // Handle the case where the user has selected a "multi" mode but
                // one or more shapes were invalid and therefore eliminated
                message = "Switch to ".concat(isLine ? 'Line' : 'Polygon');
            }
            else if (hasPointError(coordinate)) {
                message = JSON.stringify(coordinate) + ' is not a valid point';
            }
        }
    });
    return { error: !!message, message: message };
}
export var initialErrorState = {
    error: false,
    message: '',
};
export var initialErrorStateWithDefault = {
    error: false,
    message: '',
    defaultValue: '',
};
function is2DArray(coordinates) {
    try {
        return Array.isArray(coordinates) && Array.isArray(coordinates[0]);
    }
    catch (e) {
        return false;
    }
}
function hasPointError(point) {
    if (point.length !== 2 ||
        Number.isNaN(Number.parseFloat(point[0])) ||
        Number.isNaN(Number.parseFloat(point[1]))) {
        return true;
    }
    return point[0] > 180 || point[0] < -180 || point[1] > 90 || point[1] < -90;
}
function getGeometryErrors(filter) {
    var geometry = filter.geojson && filter.geojson.geometry;
    var errors = new Set();
    if (!geometry) {
        return errors;
    }
    var properties = filter.geojson.properties;
    var buffer = properties.buffer;
    switch (properties.type) {
        case 'Polygon':
            if (!Array.isArray(geometry.coordinates[0]) ||
                !geometry.coordinates[0].length) {
                errors.add('Polygon coordinates must be in the form [[x,y],[x,y],[x,y],[x,y], ... ]');
            }
            else if (geometry.coordinates[0].length < 4) {
                // check for MultiPolygon
                geometry.coordinates[0].forEach(function (shape) {
                    if (shape.length < 4) {
                        errors.add('Polygon coordinates must be in the form [[x,y],[x,y],[x,y],[x,y], ... ]');
                    }
                });
            }
            var polyBufferValidation = validateRadiusLineBuffer('bufferWidth', {
                value: buffer.width,
                units: buffer.unit,
            });
            if (polyBufferValidation.error) {
                errors.add(polyBufferValidation.message);
            }
            break;
        case 'LineString':
            if (!Array.isArray(geometry.coordinates) ||
                !geometry.coordinates.length ||
                geometry.coordinates.length < 2) {
                errors.add('Line coordinates must be in the form [[x,y],[x,y], ... ]');
            }
            var bufferValidation = validateRadiusLineBuffer('lineWidth', {
                value: buffer.width,
                units: buffer.unit,
            });
            // Can't just check !bufferWidth because of the case of the string "0"
            if (bufferValidation.error) {
                errors.add(bufferValidation.message);
            }
            break;
        case 'Point':
            var radiusValidation = validateRadiusLineBuffer('radius', {
                value: buffer.width,
                units: buffer.unit,
            });
            if (radiusValidation.error) {
                errors.add(radiusValidation.message);
            }
            if (geometry.coordinates.some(function (coord) { return !coord || coord.toString().length === 0; })) {
                errors.add('Coordinates must not be empty');
            }
            break;
        case 'BoundingBox':
            var _a = filter.geojson.properties, east = _a.east, west = _a.west, north = _a.north, south = _a.south;
            if ([east, west, north, south].some(function (direction) { return direction === '' || direction === undefined; }) ||
                Number(south) >= Number(north) ||
                Number(west) === Number(east)) {
                errors.add('Bounding box must have valid values');
            }
            break;
    }
    return errors;
}
function validateLinePolygon(mode, currentValue) {
    if (currentValue === undefined) {
        return {
            error: true,
            message: "".concat(mode === 'line' ? 'Line' : 'Polygon', " cannot be empty"),
        };
    }
    try {
        var parsedCoords = JSON.parse(currentValue);
        if (!is2DArray(parsedCoords)) {
            return { error: true, message: 'Not an acceptable value' };
        }
        return validateListOfPoints(parsedCoords, mode);
    }
    catch (e) {
        return { error: true, message: 'Not an acceptable value' };
    }
}
function getDdCoords(value) {
    return {
        north: Number(value.north),
        south: Number(value.south),
        west: Number(value.west),
        east: Number(value.east),
    };
}
function getDmsCoords(value) {
    var coordinateNorth = parseDmsCoordinate(value.north);
    var coordinateSouth = parseDmsCoordinate(value.south);
    var coordinateWest = parseDmsCoordinate(value.west);
    var coordinateEast = parseDmsCoordinate(value.east);
    var north, south, west, east;
    if (coordinateNorth) {
        north = dmsCoordinateToDD(__assign(__assign({}, coordinateNorth), { direction: value.dmsNorthDirection }));
    }
    if (coordinateSouth) {
        south = dmsCoordinateToDD(__assign(__assign({}, coordinateSouth), { direction: value.dmsSouthDirection }));
    }
    if (coordinateWest) {
        west = dmsCoordinateToDD(__assign(__assign({}, coordinateWest), { direction: value.dmsWestDirection }));
    }
    if (coordinateEast) {
        east = dmsCoordinateToDD(__assign(__assign({}, coordinateEast), { direction: value.dmsEastDirection }));
    }
    return { north: north, south: south, west: west, east: east };
}
function getUsngCoords(upperLeft, lowerRight) {
    var upperLeftCoord = converter.USNGtoLL(upperLeft, true);
    var lowerRightCoord = converter.USNGtoLL(lowerRight, true);
    return {
        north: Number(upperLeftCoord.lat.toFixed(5)),
        south: Number(lowerRightCoord.lat.toFixed(5)),
        west: Number(upperLeftCoord.lon.toFixed(5)),
        east: Number(lowerRightCoord.lon.toFixed(5)),
    };
}
function getUtmUpsCoords(upperLeft, lowerRight) {
    var upperLeftParts = {
        easting: parseFloat(upperLeft.easting),
        northing: parseFloat(upperLeft.northing),
        zoneNumber: upperLeft.zoneNumber,
        hemisphere: upperLeft.hemisphere,
        northPole: upperLeft.hemisphere.toUpperCase() === 'NORTHERN',
    };
    var lowerRightParts = {
        easting: parseFloat(lowerRight.easting),
        northing: parseFloat(lowerRight.northing),
        zoneNumber: lowerRight.zoneNumber,
        hemisphere: lowerRight.hemisphere,
        northPole: lowerRight.hemisphere.toUpperCase() === 'NORTHERN',
    };
    upperLeftParts.northing =
        upperLeftParts.zoneNumber === 0 || upperLeftParts.northPole
            ? upperLeftParts.northing
            : upperLeftParts.northing - NORTHING_OFFSET;
    lowerRightParts.northing =
        lowerRightParts.zoneNumber === 0 || lowerRightParts.northPole
            ? lowerRightParts.northing
            : lowerRightParts.northing - NORTHING_OFFSET;
    var north = Number(converter.UTMUPStoLL(upperLeftParts).lat.toFixed(5));
    var south = Number(converter.UTMUPStoLL(lowerRightParts).lat.toFixed(5));
    var west = Number(converter.UTMUPStoLL(upperLeftParts).lon.toFixed(5));
    var east = Number(converter.UTMUPStoLL(lowerRightParts).lon.toFixed(5));
    return { north: north, south: south, west: west, east: east };
}
function validateLatitudes(north, south, isUsngOrUtmUps) {
    if (!isNaN(south) &&
        !isNaN(north) &&
        parseFloat(south) >= parseFloat(north)) {
        return {
            error: true,
            message: isUsngOrUtmUps
                ? 'Upper left coordinate must be located above lower right coordinate'
                : 'North value must be greater than south value',
        };
    }
    return initialErrorState;
}
function validateLongitudes(west, east, isUsngOrUtmUps) {
    if (!isNaN(west) && !isNaN(east) && parseFloat(west) === parseFloat(east)) {
        return {
            error: true,
            message: isUsngOrUtmUps
                ? 'Left bound cannot equal right bound'
                : 'West value cannot equal east value',
        };
    }
    return initialErrorState;
}
function validateBoundingBox(key, value) {
    var coords, north, south, west, east;
    if (value.isDms) {
        coords = getDmsCoords(value);
    }
    else if (value.isUsng) {
        coords = getUsngCoords(value.upperLeft, value.lowerRight);
    }
    else if (value.isUtmUps) {
        coords = getUtmUpsCoords(value.upperLeft, value.lowerRight);
    }
    else {
        coords = getDdCoords(value);
    }
    north = coords.north;
    south = coords.south;
    west = coords.west;
    east = coords.east;
    var isUsngOrUtmUps = value.isUsng || value.isUtmUps;
    if (key.toLowerCase().includes('lon')) {
        var _a = validateLongitudes(west, east, isUsngOrUtmUps), error = _a.error, message = _a.message;
        if (error) {
            return { error: error, message: message };
        }
        return validateLatitudes(north, south, isUsngOrUtmUps);
    }
    else {
        var _b = validateLatitudes(north, south, isUsngOrUtmUps), error = _b.error, message = _b.message;
        if (error) {
            return { error: error, message: message };
        }
        return validateLongitudes(west, east, isUsngOrUtmUps);
    }
    return initialErrorState;
}
function validateDDLatLon(label, value, defaultCoord) {
    var message = '';
    var defaultValue;
    if (value === undefined || value === null || value === '') {
        message = getEmptyErrorMessage(label);
        return { error: true, message: message, defaultValue: defaultValue };
    }
    if (Number(value) > defaultCoord || Number(value) < -1 * defaultCoord) {
        defaultValue = Number(value) > 0 ? defaultCoord : -1 * defaultCoord;
        message = getDefaultingErrorMessage(value, label, defaultValue);
        return { error: true, message: message, defaultValue: defaultValue };
    }
    return initialErrorStateWithDefault;
}
function validateDmsLatLon(label, value) {
    var message = '';
    var defaultValue;
    var validator = label === LATITUDE ? 'dd°mm\'ss.s"' : 'ddd°mm\'ss.s"';
    if (value === undefined || value === null || value === '') {
        message = getEmptyErrorMessage(label);
        return { error: true, message: message, defaultValue: defaultValue };
    }
    var dmsValidation = validateDmsInput(value, validator);
    if (dmsValidation.error) {
        defaultValue = dmsValidation.defaultValue;
        message = getDefaultingErrorMessage(value, label, defaultValue);
        return { error: true, message: message, defaultValue: defaultValue };
    }
    return { error: false, message: message, defaultValue: defaultValue };
}
function validateUsng(value) {
    if (value === '') {
        return { error: true, message: 'USNG / MGRS coordinates cannot be empty' };
    }
    if (value === undefined) {
        return initialErrorState;
    }
    var result = converter.USNGtoLL(value, true);
    var isInvalid = Number.isNaN(result.lat) || Number.isNaN(result.lon);
    return {
        error: isInvalid,
        message: isInvalid ? 'Invalid USNG / MGRS coordinates' : '',
    };
}
function upsValidDistance(distance) {
    return distance >= 800000 && distance <= 3200000;
}
function validateUtmUps(key, value) {
    var easting = value.easting, northing = value.northing, zoneNumber = value.zoneNumber, hemisphere = value.hemisphere;
    var northernHemisphere = hemisphere.toUpperCase() === 'NORTHERN';
    zoneNumber = Number.parseInt(zoneNumber);
    var isUps = zoneNumber === 0;
    var error = initialErrorState;
    // Number('') returns 0, so we can't just blindly cast to number
    // since we want to differentiate '' from 0
    var utmUpsEasting = easting === '' ? NaN : Number(easting);
    var utmUpsNorthing = northing === '' ? NaN : Number(northing);
    var isNorthingInvalid = isNaN(utmUpsNorthing) && northing !== undefined;
    var isEastingInvalid = isNaN(utmUpsEasting) && easting !== undefined;
    if (!isNaN(utmUpsEasting)) {
        utmUpsEasting = Number.parseFloat(easting);
    }
    else if (key === 'utmUpsEasting' &&
        easting !== undefined &&
        !isNorthingInvalid) {
        return { error: true, message: 'Easting value is invalid' };
    }
    if (!isNaN(utmUpsNorthing)) {
        utmUpsNorthing = Number.parseFloat(northing);
        utmUpsNorthing =
            isUps || northernHemisphere
                ? utmUpsNorthing
                : utmUpsNorthing - NORTHING_OFFSET;
    }
    else if (key === 'utmUpsNorthing' &&
        northing !== undefined &&
        !isEastingInvalid) {
        return { error: true, message: 'Northing value is invalid' };
    }
    if (isUps &&
        (!upsValidDistance(utmUpsNorthing) || !upsValidDistance(utmUpsEasting))) {
        return { error: true, message: 'Invalid UPS distance' };
    }
    var utmUpsParts = {
        easting: utmUpsEasting,
        northing: utmUpsNorthing,
        zoneNumber: zoneNumber,
        hemisphere: hemisphere,
        northPole: northernHemisphere,
    };
    // These checks are to ensure that we only mark a value as "invalid"
    // if the user has entered something already
    var _a = converter.UTMUPStoLL(utmUpsParts), lat = _a.lat, lon = _a.lon;
    lon = lon % 360;
    if (lon < -180) {
        lon = lon + 360;
    }
    if (lon > 180) {
        lon = lon - 360;
    }
    // we want to validate using the hasPointError method, but only if they're both defined
    // if one or more is undefined, we want to return true
    var isLatLonValid = !hasPointError([lon, lat]) ||
        northing === undefined ||
        easting === undefined;
    if ((isNorthingInvalid && isEastingInvalid) || !isLatLonValid) {
        return { error: true, message: 'Invalid UTM/UPS coordinates' };
    }
    return error;
}
function validateRadiusLineBuffer(key, value) {
    var parsed = Number(value.value);
    var buffer = Number.isNaN(parsed) ? 0 : parsed;
    var bufferMeters = DistanceUtils.getDistanceInMeters(buffer, value.units);
    if (key === 'lineWidth' && bufferMeters < LINE_BUFFER_MININUM_METERS) {
        var minDistance = DistanceUtils.getDistanceFromMeters(LINE_BUFFER_MININUM_METERS, value.units);
        var minDistanceDisplay = Number.isInteger(minDistance)
            ? minDistance.toString()
            : // Add 0.01 to account for decimal places beyond hundredths. For example, if
                // the selected unit is feet, then the required value is 246.063, and if we only
                // showed (246.063).toFixed(2), then the user would see 246.06, but if they typed
                // that in, they would still be shown this error.
                (minDistance + 0.01).toFixed(2);
        return {
            error: true,
            message: "Line buffer must be at least ".concat(minDistanceDisplay, " ").concat(value.units),
        };
    }
    var label = key === 'radius' ? 'Radius ' : 'Buffer width ';
    if (value.value.toString().length === 0) {
        return initialErrorState;
    }
    if (key.includes('Width') && bufferMeters < 1 && bufferMeters !== 0) {
        return {
            error: true,
            message: label +
                'must be 0, or at least ' +
                DistanceUtils.getDistanceFromMeters(1, value.units).toPrecision(2) +
                ' ' +
                value.units,
        };
    }
    else if (key.includes('radius') && bufferMeters < 1) {
        return {
            error: true,
            message: label +
                'must be at least ' +
                DistanceUtils.getDistanceFromMeters(1, value.units).toPrecision(2) +
                ' ' +
                value.units,
        };
    }
    return initialErrorState;
}
var validateDmsInput = function (input, placeHolder) {
    if (input !== undefined && placeHolder === 'dd°mm\'ss.s"') {
        var corrected = getCorrectedDmsLatInput(input);
        return { error: corrected !== input, defaultValue: corrected };
    }
    else if (input !== undefined && placeHolder === 'ddd°mm\'ss.s"') {
        var corrected = getCorrectedDmsLonInput(input);
        return { error: corrected !== input, defaultValue: corrected };
    }
    return { error: false };
};
var lat = {
    degreesBegin: 0,
    degreesEnd: 2,
    minutesBegin: 3,
    minutesEnd: 5,
    secondsBegin: 6,
    secondsEnd: -1,
};
var lon = {
    degreesBegin: 0,
    degreesEnd: 3,
    minutesBegin: 4,
    minutesEnd: 6,
    secondsBegin: 7,
    secondsEnd: -1,
};
var getCorrectedDmsLatInput = function (input) {
    var degrees = input.slice(lat.degreesBegin, lat.degreesEnd);
    var minutes = input.slice(lat.minutesBegin, lat.minutesEnd);
    var seconds = input.slice(lat.secondsBegin, lat.secondsEnd);
    var maxDmsLat = '90°00\'00"';
    if (degrees > 90) {
        return maxDmsLat;
    }
    else if (minutes >= 60) {
        if (degrees < 90) {
            return (Number.parseInt(degrees) + 1).toString() + '°00\'00"';
        }
        else {
            return maxDmsLat;
        }
    }
    else if (seconds >= 60) {
        if (minutes < 59) {
            return degrees + '°' + (Number.parseInt(minutes) + 1).toString() + '\'00"';
        }
        else {
            if (degrees >= '90') {
                return maxDmsLat;
            }
            else {
                return (Number.parseInt(degrees) + 1).toString() + '°00\'00"';
            }
        }
    }
    else if (input.slice(lat.degreesBegin, lat.degreesEnd) === '9_' &&
        input.slice(lat.degreesEnd) === '°00\'00"') {
        return '9_°__\'__"';
    }
    else if (input.slice(lat.minutesBegin, lat.minutesEnd) === '6_' &&
        input.slice(lat.minutesEnd) === '\'00"') {
        return input.slice(lat.degreesBegin, lat.degreesEnd) + '°6_\'__"';
    }
    else {
        return input;
    }
};
var getCorrectedDmsLonInput = function (input) {
    var degrees = input.slice(lon.degreesBegin, lon.degreesEnd);
    var minutes = input.slice(lon.minutesBegin, lon.minutesEnd);
    var seconds = input.slice(lon.secondsBegin, lon.secondsEnd);
    var maxDmsLon = '180°00\'00"';
    if (degrees > 180) {
        return maxDmsLon;
    }
    else if (minutes >= 60) {
        if (degrees < 180) {
            return (Number.parseInt(degrees) + 1).toString() + '°00\'00"';
        }
        else {
            return maxDmsLon;
        }
    }
    else if (seconds > 60) {
        if (minutes < 59) {
            return degrees + '°' + (Number.parseInt(minutes) + 1).toString() + '\'00"';
        }
        else {
            if (degrees >= '180') {
                return maxDmsLon;
            }
            else {
                return (Number.parseInt(degrees) + 1).toString() + '°00\'00"';
            }
        }
    }
    else if (input.slice(lon.degreesBegin, lon.degreesEnd) === '18_' &&
        input.slice(lon.degreesEnd) === '°00\'00"') {
        return '18_°__\'__"';
    }
    else if (input.slice(lon.minutesBegin, lon.minutesEnd) === '6_' &&
        input.slice(lon.minutesEnd) === '\'00"') {
        return input.slice(lon.degreesBegin, lon.degreesEnd) + '°6_\'__"';
    }
    else {
        return input;
    }
};
function getDefaultingErrorMessage(value, label, defaultValue) {
    return "".concat(value.replace(/_/g, '0'), " is not an acceptable ").concat(label, " value. Defaulting to ").concat(defaultValue);
}
function getEmptyErrorMessage(label) {
    return "".concat(label.replace(/^\w/, function (c) { return c.toUpperCase(); }), " cannot be empty");
}
var Invalid = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  border: 1px solid ", ";\n  height: 100%;\n  display: block;\n  overflow: hidden;\n  color: white;\n"], ["\n  border: 1px solid ", ";\n  height: 100%;\n  display: block;\n  overflow: hidden;\n  color: white;\n"])), function (props) { return props.theme.negativeColor; });
var WarningIcon = styled.span(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  padding: ", ";\n"], ["\n  padding: ", ";\n"])), function (_a) {
    var theme = _a.theme;
    return theme.minimumSpacing;
});
var templateObject_1, templateObject_2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbi92YWxpZGF0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEtBQUssS0FBSyxNQUFNLFNBQVMsQ0FBQTtBQUNoQyxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsNEVBQTRFO0FBQzVFLElBQU0sU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ3ZDLElBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQTtBQUNoQyxJQUFNLFFBQVEsR0FBRyxVQUFVLENBQUE7QUFDM0IsSUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFBO0FBQzdCLHlHQUF5RztBQUN6RyxlQUFlO0FBQ2YsTUFBTSxDQUFDLElBQU0sMEJBQTBCLEdBQUcsRUFBRSxDQUFBO0FBQzVDLE9BQU8sYUFBYSxNQUFNLDJCQUEyQixDQUFBO0FBQ3JELE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsaUJBQWlCLEdBQ2xCLE1BQU0saURBQWlELENBQUE7QUFDeEQsT0FBTyxLQUFLLE1BQU0sbUJBQW1CLENBQUE7QUFDckMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVDQUF1QyxDQUFBO0FBQ3JFLE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxNQUFXO0lBQzNDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdkIsT0FBTTtLQUNQO0lBQ0QsSUFBSSxrQkFBa0IsR0FBRztRQUN2QixLQUFLLEVBQUUsRUFBRTtRQUNULE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQTtJQUNELElBQUksTUFBTSxDQUFD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LEVBQVM7UUFBUCxLQUFLLFdBQUE7SUFBTyxPQUFBLEtBQUssQ0FBQyxjQUFjO0FBQXBCLENBQW9CLENBQy9DLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5pbXBvcnQgKiBhcyB1c25ncyBmcm9tICd1c25nLmpzJ1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAxIGFyZ3VtZW50cywgYnV0IGdvdCAwLlxuY29uc3QgY29udmVydGVyID0gbmV3IHVzbmdzLkNvbnZlcnRlcigpXG5jb25zdCBOT1JUSElOR19PRkZTRVQgPSAxMDAwMDAwMFxuY29uc3QgTEFUSVRVREUgPSAnbGF0aXR1ZGUnXG5jb25zdCBMT05HSVRVREUgPSAnbG9uZ2l0dWRlJ1xuLy8gNzUgbWV0ZXJzIHdhcyBkZXRlcm1pbmVkIHRvIGJlIGEgcmVhc29uYWJsZSBtaW4gZm9yIGxpbmVzdHJpbmcgc2VhcmNoZXMgYmFzZWQgb24gdGVzdGluZyBhZ2FpbnN0IGtub3duXG4vLyBkYXRhIHNvdXJjZXNcbmV4cG9ydCBjb25zdCBMSU5FX0JVRkZFUl9NSU5JTlVNX01FVEVSUyA9IDc1XG5pbXBvcnQgRGlzdGFuY2VVdGlscyBmcm9tICcuLi8uLi8uLi9qcy9EaXN0YW5jZVV0aWxzJ1xuaW1wb3J0IHtcbiAgcGFyc2VEbXNDb29yZGluYXRlLFxuICBkbXNDb29yZGluYXRlVG9ERCxcbn0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L2xvY2F0aW9uLW5ldy91dGlscy9kbXMtdXRpbHMnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vLi4vanMvd3JlcXInXG5pbXBvcnQgeyBlcnJvck1lc3NhZ2VzIH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L2xvY2F0aW9uLW5ldy91dGlscydcbmV4cG9ydCBmdW5jdGlvbiBzaG93RXJyb3JNZXNzYWdlcyhlcnJvcnM6IGFueSkge1xuICBpZiAoZXJyb3JzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVyblxuICB9XG4gIGxldCBzZWFyY2hFcnJvck1lc3NhZ2UgPSB7XG4gICAgdGl0bGU6ICcnLFxuICAgIG1lc3NhZ2U6ICcnLFxuICB9XG4gIGlmIChlcnJvcnMubGVuZ3RoID4gMSkge1xuICAgIGxldCBtc2cgPSBzZWFyY2hFcnJvck1lc3NhZ2UubWVzc2FnZVxuICAgIHNlYXJjaEVycm9yTWVzc2FnZS50aXRsZSA9XG4gICAgICAnWW91ciBzZWFyY2ggY2Fubm90IGJlIHJ1biBkdWUgdG8gbXVsdGlwbGUgZXJyb3JzJ1xuICAgIGNvbnN0IGZvcm1hdHRlZEVycm9ycyA9IGVycm9ycy5tYXAoXG4gICAgICAoZXJyb3I6IGFueSkgPT4gYFxcdTIwMjIgJHtlcnJvci50aXRsZX06ICR7ZXJyb3IuYm9keX1gXG4gICAgKVxuICAgIHNlYXJjaEVycm9yTWVzc2FnZS5tZXNzYWdlID0gbXNnLmNvbmNhdChmb3JtYXR0ZWRFcnJvcnMpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZXJyb3IgPSBlcnJvcnNbMF1cbiAgICBzZWFyY2hFcnJvck1lc3NhZ2UudGl0bGUgPSBlcnJvci50aXRsZVxuICAgIHNlYXJjaEVycm9yTWVzc2FnZS5tZXNzYWdlID0gZXJyb3IuYm9keVxuICB9XG4gIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ3NuYWNrJywge1xuICAgIG1lc3NhZ2U6IGAke3NlYXJjaEVycm9yTWVzc2FnZS50aXRsZX0gOiAke3NlYXJjaEVycm9yTWVzc2FnZS5tZXNzYWdlfWAsXG4gICAgc25hY2tQcm9wczoge1xuICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWx0ZXJFcnJvcnMoZmlsdGVyczogYW55KSB7XG4gIGNvbnN0IGVycm9ycyA9IG5ldyBTZXQoKVxuICBsZXQgZ2VvbWV0cnlFcnJvcnMgPSBuZXcgU2V0PHN0cmluZz4oKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbHRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBmaWx0ZXIgPSBmaWx0ZXJzW2ldXG4gICAgZ2V0R2VvbWV0cnlFcnJvcnMoZmlsdGVyKS5mb3JFYWNoKChtc2cpID0+IHtcbiAgICAgIGdlb21ldHJ5RXJyb3JzLmFkZChtc2cpXG4gICAgfSlcbiAgfVxuICBnZW9tZXRyeUVycm9ycy5mb3JFYWNoKChlcnIpID0+IHtcbiAgICBlcnJvcnMuYWRkKHtcbiAgICAgIHRpdGxlOiAnSW52YWxpZCBnZW9tZXRyeSBmaWx0ZXInLFxuICAgICAgYm9keTogZXJyLFxuICAgIH0pXG4gIH0pXG4gIHJldHVybiBBcnJheS5mcm9tKGVycm9ycylcbn1cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDMwKSBGSVhNRTogTm90IGFsbCBjb2RlIHBhdGhzIHJldHVybiBhIHZhbHVlLlxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlR2VvKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIHN3aXRjaCAoa2V5KSB7XG4gICAgY2FzZSAnbGF0JzpcbiAgICAgIHJldHVybiB2YWxpZGF0ZURETGF0TG9uKExBVElUVURFLCB2YWx1ZSwgOTApXG4gICAgY2FzZSAnbG9uJzpcbiAgICAgIHJldHVybiB2YWxpZGF0ZURETGF0TG9uKExPTkdJVFVERSwgdmFsdWUsIDE4MClcbiAgICBjYXNlICdkbXNMYXQnOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlRG1zTGF0TG9uKExBVElUVURFLCB2YWx1ZSlcbiAgICBjYXNlICdkbXNMb24nOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlRG1zTGF0TG9uKExPTkdJVFVERSwgdmFsdWUpXG4gICAgY2FzZSAndXNuZyc6XG4gICAgICByZXR1cm4gdmFsaWRhdGVVc25nKHZhbHVlKVxuICAgIGNhc2UgJ2Vhc3RpbmcnOlxuICAgIGNhc2UgJ25vcnRoaW5nJzpcbiAgICBjYXNlICd6b25lTnVtYmVyJzpcbiAgICBjYXNlICdoZW1pc3BoZXJlJzpcbiAgICAgIHJldHVybiB2YWxpZGF0ZVV0bVVwcyhrZXksIHZhbHVlKVxuICAgIGNhc2UgJ3JhZGl1cyc6XG4gICAgY2FzZSAnbGluZVdpZHRoJzpcbiAgICBjYXNlICdwb2x5Z29uQnVmZmVyV2lkdGgnOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlUmFkaXVzTGluZUJ1ZmZlcihrZXksIHZhbHVlKVxuICAgIGNhc2UgJ2xpbmUnOlxuICAgIGNhc2UgJ3BvbHknOlxuICAgIGNhc2UgJ3BvbHlnb24nOlxuICAgIGNhc2UgJ211bHRpbGluZSc6XG4gICAgY2FzZSAnbXVsdGlwb2x5Z29uJzpcbiAgICAgIHJldHVybiB2YWxpZGF0ZUxpbmVQb2x5Z29uKGtleSwgdmFsdWUpXG4gICAgY2FzZSAnYmJveCc6XG4gICAgICByZXR1cm4gdmFsaWRhdGVCb3VuZGluZ0JveChrZXksIHZhbHVlKVxuICAgIGRlZmF1bHQ6XG4gIH1cbn1cbmV4cG9ydCBjb25zdCBFcnJvckNvbXBvbmVudCA9IChwcm9wczogYW55KSA9PiB7XG4gIGNvbnN0IHsgZXJyb3JTdGF0ZSB9ID0gcHJvcHNcbiAgcmV0dXJuIGVycm9yU3RhdGUuZXJyb3IgPyAoXG4gICAgPEludmFsaWQgY2xhc3NOYW1lPVwibXktMlwiPlxuICAgICAgPFdhcm5pbmdJY29uIGNsYXNzTmFtZT1cImZhIGZhLXdhcm5pbmdcIiAvPlxuICAgICAgPHNwYW4+e2Vycm9yU3RhdGUubWVzc2FnZX08L3NwYW4+XG4gICAgPC9JbnZhbGlkPlxuICApIDogbnVsbFxufVxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTGlzdE9mUG9pbnRzKGNvb3JkaW5hdGVzOiBhbnlbXSwgbW9kZTogc3RyaW5nKSB7XG4gIGxldCBtZXNzYWdlID0gbnVsbFxuICBjb25zdCBpc0xpbmUgPSBtb2RlLmluY2x1ZGVzKCdsaW5lJylcbiAgY29uc3QgbnVtUG9pbnRzID0gaXNMaW5lID8gMiA6IDRcbiAgaWYgKFxuICAgICFtb2RlLmluY2x1ZGVzKCdtdWx0aScpICYmXG4gICAgIWlzTGluZSAmJlxuICAgIGNvb3JkaW5hdGVzLmxlbmd0aCA+PSBudW1Qb2ludHMgJiZcbiAgICAhXy5pc0VxdWFsKGNvb3JkaW5hdGVzWzBdLCBjb29yZGluYXRlcy5zbGljZSgtMSlbMF0pXG4gICkge1xuICAgIG1lc3NhZ2UgPSBlcnJvck1lc3NhZ2VzLmZpcnN0TGFzdFBvaW50TWlzbWF0Y2hcbiAgfVxuICBpZiAoXG4gICAgIW1vZGUuaW5jbHVkZXMoJ211bHRpJykgJiZcbiAgICAhY29vcmRpbmF0ZXMuc29tZSgoY29vcmRzKSA9PiBjb29yZHMubGVuZ3RoID4gMikgJiZcbiAgICBjb29yZGluYXRlcy5sZW5ndGggPCBudW1Qb2ludHNcbiAgKSB7XG4gICAgbWVzc2FnZSA9IGBNaW5pbXVtIG9mICR7bnVtUG9pbnRzfSBwb2ludHMgbmVlZGVkIGZvciAke1xuICAgICAgaXNMaW5lID8gJ0xpbmUnIDogJ1BvbHlnb24nXG4gICAgfWBcbiAgfVxuICBjb29yZGluYXRlcy5mb3JFYWNoKChjb29yZGluYXRlKSA9PiB7XG4gICAgaWYgKGNvb3JkaW5hdGUubGVuZ3RoID4gMikge1xuICAgICAgY29vcmRpbmF0ZS5mb3JFYWNoKChjb29yZDogYW55KSA9PiB7XG4gICAgICAgIGlmIChoYXNQb2ludEVycm9yKGNvb3JkKSlcbiAgICAgICAgICBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoY29vcmQpICsgJyBpcyBub3QgYSB2YWxpZCBwb2ludCdcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtb2RlLmluY2x1ZGVzKCdtdWx0aScpKSB7XG4gICAgICAgIC8vIEhhbmRsZSB0aGUgY2FzZSB3aGVyZSB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgYSBcIm11bHRpXCIgbW9kZSBidXRcbiAgICAgICAgLy8gb25lIG9yIG1vcmUgc2hhcGVzIHdlcmUgaW52YWxpZCBhbmQgdGhlcmVmb3JlIGVsaW1pbmF0ZWRcbiAgICAgICAgbWVzc2FnZSA9IGBTd2l0Y2ggdG8gJHtpc0xpbmUgPyAnTGluZScgOiAnUG9seWdvbid9YFxuICAgICAgfSBlbHNlIGlmIChoYXNQb2ludEVycm9yKGNvb3JkaW5hdGUpKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShjb29yZGluYXRlKSArICcgaXMgbm90IGEgdmFsaWQgcG9pbnQnXG4gICAgICB9XG4gICAgfVxuICB9KVxuICByZXR1cm4geyBlcnJvcjogISFtZXNzYWdlLCBtZXNzYWdlIH1cbn1cbmV4cG9ydCBjb25zdCBpbml0aWFsRXJyb3JTdGF0ZSA9IHtcbiAgZXJyb3I6IGZhbHNlLFxuICBtZXNzYWdlOiAnJyxcbn1cbmV4cG9ydCBjb25zdCBpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0ID0ge1xuICBlcnJvcjogZmFsc2UsXG4gIG1lc3NhZ2U6ICcnLFxuICBkZWZhdWx0VmFsdWU6ICcnLFxufVxuZnVuY3Rpb24gaXMyREFycmF5KGNvb3JkaW5hdGVzOiBhbnlbXSkge1xuICB0cnkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KGNvb3JkaW5hdGVzKSAmJiBBcnJheS5pc0FycmF5KGNvb3JkaW5hdGVzWzBdKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cbmZ1bmN0aW9uIGhhc1BvaW50RXJyb3IocG9pbnQ6IGFueVtdKSB7XG4gIGlmIChcbiAgICBwb2ludC5sZW5ndGggIT09IDIgfHxcbiAgICBOdW1iZXIuaXNOYU4oTnVtYmVyLnBhcnNlRmxvYXQocG9pbnRbMF0pKSB8fFxuICAgIE51bWJlci5pc05hTihOdW1iZXIucGFyc2VGbG9hdChwb2ludFsxXSkpXG4gICkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmV0dXJuIHBvaW50WzBdID4gMTgwIHx8IHBvaW50WzBdIDwgLTE4MCB8fCBwb2ludFsxXSA+IDkwIHx8IHBvaW50WzFdIDwgLTkwXG59XG5mdW5jdGlvbiBnZXRHZW9tZXRyeUVycm9ycyhmaWx0ZXI6IGFueSk6IFNldDxzdHJpbmc+IHtcbiAgY29uc3QgZ2VvbWV0cnkgPSBmaWx0ZXIuZ2VvanNvbiAmJiBmaWx0ZXIuZ2VvanNvbi5nZW9tZXRyeVxuICBjb25zdCBlcnJvcnMgPSBuZXcgU2V0PHN0cmluZz4oKVxuICBpZiAoIWdlb21ldHJ5KSB7XG4gICAgcmV0dXJuIGVycm9yc1xuICB9XG4gIGNvbnN0IHByb3BlcnRpZXMgPSBmaWx0ZXIuZ2VvanNvbi5wcm9wZXJ0aWVzXG4gIGNvbnN0IGJ1ZmZlciA9IHByb3BlcnRpZXMuYnVmZmVyXG4gIHN3aXRjaCAocHJvcGVydGllcy50eXBlKSB7XG4gICAgY2FzZSAnUG9seWdvbic6XG4gICAgICBpZiAoXG4gICAgICAgICFBcnJheS5pc0FycmF5KGdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKSB8fFxuICAgICAgICAhZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0ubGVuZ3RoXG4gICAgICApIHtcbiAgICAgICAgZXJyb3JzLmFkZChcbiAgICAgICAgICAnUG9seWdvbiBjb29yZGluYXRlcyBtdXN0IGJlIGluIHRoZSBmb3JtIFtbeCx5XSxbeCx5XSxbeCx5XSxbeCx5XSwgLi4uIF0nXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0ubGVuZ3RoIDwgNCkge1xuICAgICAgICAvLyBjaGVjayBmb3IgTXVsdGlQb2x5Z29uXG4gICAgICAgIGdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLmZvckVhY2goKHNoYXBlOiBudW1iZXJbXSkgPT4ge1xuICAgICAgICAgIGlmIChzaGFwZS5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICBlcnJvcnMuYWRkKFxuICAgICAgICAgICAgICAnUG9seWdvbiBjb29yZGluYXRlcyBtdXN0IGJlIGluIHRoZSBmb3JtIFtbeCx5XSxbeCx5XSxbeCx5XSxbeCx5XSwgLi4uIF0nXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgY29uc3QgcG9seUJ1ZmZlclZhbGlkYXRpb24gPSB2YWxpZGF0ZVJhZGl1c0xpbmVCdWZmZXIoJ2J1ZmZlcldpZHRoJywge1xuICAgICAgICB2YWx1ZTogYnVmZmVyLndpZHRoLFxuICAgICAgICB1bml0czogYnVmZmVyLnVuaXQsXG4gICAgICB9KVxuICAgICAgaWYgKHBvbHlCdWZmZXJWYWxpZGF0aW9uLmVycm9yKSB7XG4gICAgICAgIGVycm9ycy5hZGQocG9seUJ1ZmZlclZhbGlkYXRpb24ubWVzc2FnZSlcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnTGluZVN0cmluZyc6XG4gICAgICBpZiAoXG4gICAgICAgICFBcnJheS5pc0FycmF5KGdlb21ldHJ5LmNvb3JkaW5hdGVzKSB8fFxuICAgICAgICAhZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoIHx8XG4gICAgICAgIGdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA8IDJcbiAgICAgICkge1xuICAgICAgICBlcnJvcnMuYWRkKCdMaW5lIGNvb3JkaW5hdGVzIG11c3QgYmUgaW4gdGhlIGZvcm0gW1t4LHldLFt4LHldLCAuLi4gXScpXG4gICAgICB9XG4gICAgICBjb25zdCBidWZmZXJWYWxpZGF0aW9uID0gdmFsaWRhdGVSYWRpdXNMaW5lQnVmZmVyKCdsaW5lV2lkdGgnLCB7XG4gICAgICAgIHZhbHVlOiBidWZmZXIud2lkdGgsXG4gICAgICAgIHVuaXRzOiBidWZmZXIudW5pdCxcbiAgICAgIH0pXG4gICAgICAvLyBDYW4ndCBqdXN0IGNoZWNrICFidWZmZXJXaWR0aCBiZWNhdXNlIG9mIHRoZSBjYXNlIG9mIHRoZSBzdHJpbmcgXCIwXCJcbiAgICAgIGlmIChidWZmZXJWYWxpZGF0aW9uLmVycm9yKSB7XG4gICAgICAgIGVycm9ycy5hZGQoYnVmZmVyVmFsaWRhdGlvbi5tZXNzYWdlKVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdQb2ludCc6XG4gICAgICBjb25zdCByYWRpdXNWYWxpZGF0aW9uID0gdmFsaWRhdGVSYWRpdXNMaW5lQnVmZmVyKCdyYWRpdXMnLCB7XG4gICAgICAgIHZhbHVlOiBidWZmZXIud2lkdGgsXG4gICAgICAgIHVuaXRzOiBidWZmZXIudW5pdCxcbiAgICAgIH0pXG4gICAgICBpZiAocmFkaXVzVmFsaWRhdGlvbi5lcnJvcikge1xuICAgICAgICBlcnJvcnMuYWRkKHJhZGl1c1ZhbGlkYXRpb24ubWVzc2FnZSlcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgZ2VvbWV0cnkuY29vcmRpbmF0ZXMuc29tZShcbiAgICAgICAgICAoY29vcmQ6IGFueSkgPT4gIWNvb3JkIHx8IGNvb3JkLnRvU3RyaW5nKCkubGVuZ3RoID09PSAwXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICBlcnJvcnMuYWRkKCdDb29yZGluYXRlcyBtdXN0IG5vdCBiZSBlbXB0eScpXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ0JvdW5kaW5nQm94JzpcbiAgICAgIGNvbnN0IHsgZWFzdCwgd2VzdCwgbm9ydGgsIHNvdXRoIH0gPSBmaWx0ZXIuZ2VvanNvbi5wcm9wZXJ0aWVzXG4gICAgICBpZiAoXG4gICAgICAgIFtlYXN0LCB3ZXN0LCBub3J0aCwgc291dGhdLnNvbWUoXG4gICAgICAgICAgKGRpcmVjdGlvbikgPT4gZGlyZWN0aW9uID09PSAnJyB8fCBkaXJlY3Rpb24gPT09IHVuZGVmaW5lZFxuICAgICAgICApIHx8XG4gICAgICAgIE51bWJlcihzb3V0aCkgPj0gTnVtYmVyKG5vcnRoKSB8fFxuICAgICAgICBOdW1iZXIod2VzdCkgPT09IE51bWJlcihlYXN0KVxuICAgICAgKSB7XG4gICAgICAgIGVycm9ycy5hZGQoJ0JvdW5kaW5nIGJveCBtdXN0IGhhdmUgdmFsaWQgdmFsdWVzJylcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gIH1cbiAgcmV0dXJuIGVycm9yc1xufVxuZnVuY3Rpb24gdmFsaWRhdGVMaW5lUG9seWdvbihtb2RlOiBzdHJpbmcsIGN1cnJlbnRWYWx1ZTogc3RyaW5nKSB7XG4gIGlmIChjdXJyZW50VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6IGAke21vZGUgPT09ICdsaW5lJyA/ICdMaW5lJyA6ICdQb2x5Z29uJ30gY2Fubm90IGJlIGVtcHR5YCxcbiAgICB9XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWRDb29yZHMgPSBKU09OLnBhcnNlKGN1cnJlbnRWYWx1ZSlcbiAgICBpZiAoIWlzMkRBcnJheShwYXJzZWRDb29yZHMpKSB7XG4gICAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSwgbWVzc2FnZTogJ05vdCBhbiBhY2NlcHRhYmxlIHZhbHVlJyB9XG4gICAgfVxuICAgIHJldHVybiB2YWxpZGF0ZUxpc3RPZlBvaW50cyhwYXJzZWRDb29yZHMsIG1vZGUpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSwgbWVzc2FnZTogJ05vdCBhbiBhY2NlcHRhYmxlIHZhbHVlJyB9XG4gIH1cbn1cbmZ1bmN0aW9uIGdldERkQ29vcmRzKHZhbHVlOiBhbnkpIHtcbiAgcmV0dXJuIHtcbiAgICBub3J0aDogTnVtYmVyKHZhbHVlLm5vcnRoKSxcbiAgICBzb3V0aDogTnVtYmVyKHZhbHVlLnNvdXRoKSxcbiAgICB3ZXN0OiBOdW1iZXIodmFsdWUud2VzdCksXG4gICAgZWFzdDogTnVtYmVyKHZhbHVlLmVhc3QpLFxuICB9XG59XG5mdW5jdGlvbiBnZXREbXNDb29yZHModmFsdWU6IGFueSkge1xuICBjb25zdCBjb29yZGluYXRlTm9ydGggPSBwYXJzZURtc0Nvb3JkaW5hdGUodmFsdWUubm9ydGgpXG4gIGNvbnN0IGNvb3JkaW5hdGVTb3V0aCA9IHBhcnNlRG1zQ29vcmRpbmF0ZSh2YWx1ZS5zb3V0aClcbiAgY29uc3QgY29vcmRpbmF0ZVdlc3QgPSBwYXJzZURtc0Nvb3JkaW5hdGUodmFsdWUud2VzdClcbiAgY29uc3QgY29vcmRpbmF0ZUVhc3QgPSBwYXJzZURtc0Nvb3JkaW5hdGUodmFsdWUuZWFzdClcbiAgbGV0IG5vcnRoLCBzb3V0aCwgd2VzdCwgZWFzdFxuICBpZiAoY29vcmRpbmF0ZU5vcnRoKSB7XG4gICAgbm9ydGggPSBkbXNDb29yZGluYXRlVG9ERCh7XG4gICAgICAuLi5jb29yZGluYXRlTm9ydGgsXG4gICAgICBkaXJlY3Rpb246IHZhbHVlLmRtc05vcnRoRGlyZWN0aW9uLFxuICAgIH0pXG4gIH1cbiAgaWYgKGNvb3JkaW5hdGVTb3V0aCkge1xuICAgIHNvdXRoID0gZG1zQ29vcmRpbmF0ZVRvREQoe1xuICAgICAgLi4uY29vcmRpbmF0ZVNvdXRoLFxuICAgICAgZGlyZWN0aW9uOiB2YWx1ZS5kbXNTb3V0aERpcmVjdGlvbixcbiAgICB9KVxuICB9XG4gIGlmIChjb29yZGluYXRlV2VzdCkge1xuICAgIHdlc3QgPSBkbXNDb29yZGluYXRlVG9ERCh7XG4gICAgICAuLi5jb29yZGluYXRlV2VzdCxcbiAgICAgIGRpcmVjdGlvbjogdmFsdWUuZG1zV2VzdERpcmVjdGlvbixcbiAgICB9KVxuICB9XG4gIGlmIChjb29yZGluYXRlRWFzdCkge1xuICAgIGVhc3QgPSBkbXNDb29yZGluYXRlVG9ERCh7XG4gICAgICAuLi5jb29yZGluYXRlRWFzdCxcbiAgICAgIGRpcmVjdGlvbjogdmFsdWUuZG1zRWFzdERpcmVjdGlvbixcbiAgICB9KVxuICB9XG4gIHJldHVybiB7IG5vcnRoLCBzb3V0aCwgd2VzdCwgZWFzdCB9XG59XG5mdW5jdGlvbiBnZXRVc25nQ29vcmRzKHVwcGVyTGVmdDogYW55LCBsb3dlclJpZ2h0OiBhbnkpIHtcbiAgY29uc3QgdXBwZXJMZWZ0Q29vcmQgPSBjb252ZXJ0ZXIuVVNOR3RvTEwodXBwZXJMZWZ0LCB0cnVlKVxuICBjb25zdCBsb3dlclJpZ2h0Q29vcmQgPSBjb252ZXJ0ZXIuVVNOR3RvTEwobG93ZXJSaWdodCwgdHJ1ZSlcbiAgcmV0dXJuIHtcbiAgICBub3J0aDogTnVtYmVyKHVwcGVyTGVmdENvb3JkLmxhdC50b0ZpeGVkKDUpKSxcbiAgICBzb3V0aDogTnVtYmVyKGxvd2VyUmlnaHRDb29yZC5sYXQudG9GaXhlZCg1KSksXG4gICAgd2VzdDogTnVtYmVyKHVwcGVyTGVmdENvb3JkLmxvbi50b0ZpeGVkKDUpKSxcbiAgICBlYXN0OiBOdW1iZXIobG93ZXJSaWdodENvb3JkLmxvbi50b0ZpeGVkKDUpKSxcbiAgfVxufVxuZnVuY3Rpb24gZ2V0VXRtVXBzQ29vcmRzKHVwcGVyTGVmdDogYW55LCBsb3dlclJpZ2h0OiBhbnkpIHtcbiAgY29uc3QgdXBwZXJMZWZ0UGFydHMgPSB7XG4gICAgZWFzdGluZzogcGFyc2VGbG9hdCh1cHBlckxlZnQuZWFzdGluZyksXG4gICAgbm9ydGhpbmc6IHBhcnNlRmxvYXQodXBwZXJMZWZ0Lm5vcnRoaW5nKSxcbiAgICB6b25lTnVtYmVyOiB1cHBlckxlZnQuem9uZU51bWJlcixcbiAgICBoZW1pc3BoZXJlOiB1cHBlckxlZnQuaGVtaXNwaGVyZSxcbiAgICBub3J0aFBvbGU6IHVwcGVyTGVmdC5oZW1pc3BoZXJlLnRvVXBwZXJDYXNlKCkgPT09ICdOT1JUSEVSTicsXG4gIH1cbiAgY29uc3QgbG93ZXJSaWdodFBhcnRzID0ge1xuICAgIGVhc3Rpbmc6IHBhcnNlRmxvYXQobG93ZXJSaWdodC5lYXN0aW5nKSxcbiAgICBub3J0aGluZzogcGFyc2VGbG9hdChsb3dlclJpZ2h0Lm5vcnRoaW5nKSxcbiAgICB6b25lTnVtYmVyOiBsb3dlclJpZ2h0LnpvbmVOdW1iZXIsXG4gICAgaGVtaXNwaGVyZTogbG93ZXJSaWdodC5oZW1pc3BoZXJlLFxuICAgIG5vcnRoUG9sZTogbG93ZXJSaWdodC5oZW1pc3BoZXJlLnRvVXBwZXJDYXNlKCkgPT09ICdOT1JUSEVSTicsXG4gIH1cbiAgdXBwZXJMZWZ0UGFydHMubm9ydGhpbmcgPVxuICAgIHVwcGVyTGVmdFBhcnRzLnpvbmVOdW1iZXIgPT09IDAgfHwgdXBwZXJMZWZ0UGFydHMubm9ydGhQb2xlXG4gICAgICA/IHVwcGVyTGVmdFBhcnRzLm5vcnRoaW5nXG4gICAgICA6IHVwcGVyTGVmdFBhcnRzLm5vcnRoaW5nIC0gTk9SVEhJTkdfT0ZGU0VUXG4gIGxvd2VyUmlnaHRQYXJ0cy5ub3J0aGluZyA9XG4gICAgbG93ZXJSaWdodFBhcnRzLnpvbmVOdW1iZXIgPT09IDAgfHwgbG93ZXJSaWdodFBhcnRzLm5vcnRoUG9sZVxuICAgICAgPyBsb3dlclJpZ2h0UGFydHMubm9ydGhpbmdcbiAgICAgIDogbG93ZXJSaWdodFBhcnRzLm5vcnRoaW5nIC0gTk9SVEhJTkdfT0ZGU0VUXG4gIGNvbnN0IG5vcnRoID0gTnVtYmVyKGNvbnZlcnRlci5VVE1VUFN0b0xMKHVwcGVyTGVmdFBhcnRzKS5sYXQudG9GaXhlZCg1KSlcbiAgY29uc3Qgc291dGggPSBOdW1iZXIoY29udmVydGVyLlVUTVVQU3RvTEwobG93ZXJSaWdodFBhcnRzKS5sYXQudG9GaXhlZCg1KSlcbiAgY29uc3Qgd2VzdCA9IE51bWJlcihjb252ZXJ0ZXIuVVRNVVBTdG9MTCh1cHBlckxlZnRQYXJ0cykubG9uLnRvRml4ZWQoNSkpXG4gIGNvbnN0IGVhc3QgPSBOdW1iZXIoY29udmVydGVyLlVUTVVQU3RvTEwobG93ZXJSaWdodFBhcnRzKS5sb24udG9GaXhlZCg1KSlcbiAgcmV0dXJuIHsgbm9ydGgsIHNvdXRoLCB3ZXN0LCBlYXN0IH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlTGF0aXR1ZGVzKG5vcnRoOiBhbnksIHNvdXRoOiBhbnksIGlzVXNuZ09yVXRtVXBzOiBib29sZWFuKSB7XG4gIGlmIChcbiAgICAhaXNOYU4oc291dGgpICYmXG4gICAgIWlzTmFOKG5vcnRoKSAmJlxuICAgIHBhcnNlRmxvYXQoc291dGgpID49IHBhcnNlRmxvYXQobm9ydGgpXG4gICkge1xuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6IGlzVXNuZ09yVXRtVXBzXG4gICAgICAgID8gJ1VwcGVyIGxlZnQgY29vcmRpbmF0ZSBtdXN0IGJlIGxvY2F0ZWQgYWJvdmUgbG93ZXIgcmlnaHQgY29vcmRpbmF0ZSdcbiAgICAgICAgOiAnTm9ydGggdmFsdWUgbXVzdCBiZSBncmVhdGVyIHRoYW4gc291dGggdmFsdWUnLFxuICAgIH1cbiAgfVxuICByZXR1cm4gaW5pdGlhbEVycm9yU3RhdGVcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlTG9uZ2l0dWRlcyh3ZXN0OiBhbnksIGVhc3Q6IGFueSwgaXNVc25nT3JVdG1VcHM6IGJvb2xlYW4pIHtcbiAgaWYgKCFpc05hTih3ZXN0KSAmJiAhaXNOYU4oZWFzdCkgJiYgcGFyc2VGbG9hdCh3ZXN0KSA9PT0gcGFyc2VGbG9hdChlYXN0KSkge1xuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6IGlzVXNuZ09yVXRtVXBzXG4gICAgICAgID8gJ0xlZnQgYm91bmQgY2Fubm90IGVxdWFsIHJpZ2h0IGJvdW5kJ1xuICAgICAgICA6ICdXZXN0IHZhbHVlIGNhbm5vdCBlcXVhbCBlYXN0IHZhbHVlJyxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGluaXRpYWxFcnJvclN0YXRlXG59XG5mdW5jdGlvbiB2YWxpZGF0ZUJvdW5kaW5nQm94KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIGxldCBjb29yZHMsIG5vcnRoLCBzb3V0aCwgd2VzdCwgZWFzdFxuICBpZiAodmFsdWUuaXNEbXMpIHtcbiAgICBjb29yZHMgPSBnZXREbXNDb29yZHModmFsdWUpXG4gIH0gZWxzZSBpZiAodmFsdWUuaXNVc25nKSB7XG4gICAgY29vcmRzID0gZ2V0VXNuZ0Nvb3Jkcyh2YWx1ZS51cHBlckxlZnQsIHZhbHVlLmxvd2VyUmlnaHQpXG4gIH0gZWxzZSBpZiAodmFsdWUuaXNVdG1VcHMpIHtcbiAgICBjb29yZHMgPSBnZXRVdG1VcHNDb29yZHModmFsdWUudXBwZXJMZWZ0LCB2YWx1ZS5sb3dlclJpZ2h0KVxuICB9IGVsc2Uge1xuICAgIGNvb3JkcyA9IGdldERkQ29vcmRzKHZhbHVlKVxuICB9XG4gIG5vcnRoID0gY29vcmRzLm5vcnRoXG4gIHNvdXRoID0gY29vcmRzLnNvdXRoXG4gIHdlc3QgPSBjb29yZHMud2VzdFxuICBlYXN0ID0gY29vcmRzLmVhc3RcbiAgY29uc3QgaXNVc25nT3JVdG1VcHMgPSB2YWx1ZS5pc1VzbmcgfHwgdmFsdWUuaXNVdG1VcHNcbiAgaWYgKGtleS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdsb24nKSkge1xuICAgIGNvbnN0IHsgZXJyb3IsIG1lc3NhZ2UgfSA9IHZhbGlkYXRlTG9uZ2l0dWRlcyh3ZXN0LCBlYXN0LCBpc1VzbmdPclV0bVVwcylcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB7IGVycm9yLCBtZXNzYWdlIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbGlkYXRlTGF0aXR1ZGVzKG5vcnRoLCBzb3V0aCwgaXNVc25nT3JVdG1VcHMpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgeyBlcnJvciwgbWVzc2FnZSB9ID0gdmFsaWRhdGVMYXRpdHVkZXMobm9ydGgsIHNvdXRoLCBpc1VzbmdPclV0bVVwcylcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB7IGVycm9yLCBtZXNzYWdlIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbGlkYXRlTG9uZ2l0dWRlcyh3ZXN0LCBlYXN0LCBpc1VzbmdPclV0bVVwcylcbiAgfVxuICByZXR1cm4gaW5pdGlhbEVycm9yU3RhdGVcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlRERMYXRMb24obGFiZWw6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZGVmYXVsdENvb3JkOiBudW1iZXIpIHtcbiAgbGV0IG1lc3NhZ2UgPSAnJ1xuICBsZXQgZGVmYXVsdFZhbHVlXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykge1xuICAgIG1lc3NhZ2UgPSBnZXRFbXB0eUVycm9yTWVzc2FnZShsYWJlbClcbiAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSwgbWVzc2FnZSwgZGVmYXVsdFZhbHVlIH1cbiAgfVxuICBpZiAoTnVtYmVyKHZhbHVlKSA+IGRlZmF1bHRDb29yZCB8fCBOdW1iZXIodmFsdWUpIDwgLTEgKiBkZWZhdWx0Q29vcmQpIHtcbiAgICBkZWZhdWx0VmFsdWUgPSBOdW1iZXIodmFsdWUpID4gMCA/IGRlZmF1bHRDb29yZCA6IC0xICogZGVmYXVsdENvb3JkXG4gICAgbWVzc2FnZSA9IGdldERlZmF1bHRpbmdFcnJvck1lc3NhZ2UodmFsdWUsIGxhYmVsLCBkZWZhdWx0VmFsdWUpXG4gICAgcmV0dXJuIHsgZXJyb3I6IHRydWUsIG1lc3NhZ2UsIGRlZmF1bHRWYWx1ZSB9XG4gIH1cbiAgcmV0dXJuIGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHRcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlRG1zTGF0TG9uKGxhYmVsOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgbGV0IG1lc3NhZ2UgPSAnJ1xuICBsZXQgZGVmYXVsdFZhbHVlXG4gIGNvbnN0IHZhbGlkYXRvciA9IGxhYmVsID09PSBMQVRJVFVERSA/ICdkZMKwbW1cXCdzcy5zXCInIDogJ2RkZMKwbW1cXCdzcy5zXCInXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykge1xuICAgIG1lc3NhZ2UgPSBnZXRFbXB0eUVycm9yTWVzc2FnZShsYWJlbClcbiAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSwgbWVzc2FnZSwgZGVmYXVsdFZhbHVlIH1cbiAgfVxuICBjb25zdCBkbXNWYWxpZGF0aW9uID0gdmFsaWRhdGVEbXNJbnB1dCh2YWx1ZSwgdmFsaWRhdG9yKVxuICBpZiAoZG1zVmFsaWRhdGlvbi5lcnJvcikge1xuICAgIGRlZmF1bHRWYWx1ZSA9IGRtc1ZhbGlkYXRpb24uZGVmYXVsdFZhbHVlXG4gICAgbWVzc2FnZSA9IGdldERlZmF1bHRpbmdFcnJvck1lc3NhZ2UodmFsdWUsIGxhYmVsLCBkZWZhdWx0VmFsdWUpXG4gICAgcmV0dXJuIHsgZXJyb3I6IHRydWUsIG1lc3NhZ2UsIGRlZmF1bHRWYWx1ZSB9XG4gIH1cbiAgcmV0dXJuIHsgZXJyb3I6IGZhbHNlLCBtZXNzYWdlLCBkZWZhdWx0VmFsdWUgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVVc25nKHZhbHVlOiBzdHJpbmcpIHtcbiAgaWYgKHZhbHVlID09PSAnJykge1xuICAgIHJldHVybiB7IGVycm9yOiB0cnVlLCBtZXNzYWdlOiAnVVNORyAvIE1HUlMgY29vcmRpbmF0ZXMgY2Fubm90IGJlIGVtcHR5JyB9XG4gIH1cbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gaW5pdGlhbEVycm9yU3RhdGVcbiAgfVxuICBjb25zdCByZXN1bHQgPSBjb252ZXJ0ZXIuVVNOR3RvTEwodmFsdWUsIHRydWUpXG4gIGNvbnN0IGlzSW52YWxpZCA9IE51bWJlci5pc05hTihyZXN1bHQubGF0KSB8fCBOdW1iZXIuaXNOYU4ocmVzdWx0LmxvbilcbiAgcmV0dXJuIHtcbiAgICBlcnJvcjogaXNJbnZhbGlkLFxuICAgIG1lc3NhZ2U6IGlzSW52YWxpZCA/ICdJbnZhbGlkIFVTTkcgLyBNR1JTIGNvb3JkaW5hdGVzJyA6ICcnLFxuICB9XG59XG5mdW5jdGlvbiB1cHNWYWxpZERpc3RhbmNlKGRpc3RhbmNlOiBudW1iZXIpIHtcbiAgcmV0dXJuIGRpc3RhbmNlID49IDgwMDAwMCAmJiBkaXN0YW5jZSA8PSAzMjAwMDAwXG59XG5mdW5jdGlvbiB2YWxpZGF0ZVV0bVVwcyhrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBsZXQgeyBlYXN0aW5nLCBub3J0aGluZywgem9uZU51bWJlciwgaGVtaXNwaGVyZSB9ID0gdmFsdWVcbiAgY29uc3Qgbm9ydGhlcm5IZW1pc3BoZXJlID0gaGVtaXNwaGVyZS50b1VwcGVyQ2FzZSgpID09PSAnTk9SVEhFUk4nXG4gIHpvbmVOdW1iZXIgPSBOdW1iZXIucGFyc2VJbnQoem9uZU51bWJlcilcbiAgY29uc3QgaXNVcHMgPSB6b25lTnVtYmVyID09PSAwXG4gIGxldCBlcnJvciA9IGluaXRpYWxFcnJvclN0YXRlXG4gIC8vIE51bWJlcignJykgcmV0dXJucyAwLCBzbyB3ZSBjYW4ndCBqdXN0IGJsaW5kbHkgY2FzdCB0byBudW1iZXJcbiAgLy8gc2luY2Ugd2Ugd2FudCB0byBkaWZmZXJlbnRpYXRlICcnIGZyb20gMFxuICBsZXQgdXRtVXBzRWFzdGluZyA9IGVhc3RpbmcgPT09ICcnID8gTmFOIDogTnVtYmVyKGVhc3RpbmcpXG4gIGxldCB1dG1VcHNOb3J0aGluZyA9IG5vcnRoaW5nID09PSAnJyA/IE5hTiA6IE51bWJlcihub3J0aGluZylcbiAgY29uc3QgaXNOb3J0aGluZ0ludmFsaWQgPSBpc05hTih1dG1VcHNOb3J0aGluZykgJiYgbm9ydGhpbmcgIT09IHVuZGVmaW5lZFxuICBjb25zdCBpc0Vhc3RpbmdJbnZhbGlkID0gaXNOYU4odXRtVXBzRWFzdGluZykgJiYgZWFzdGluZyAhPT0gdW5kZWZpbmVkXG4gIGlmICghaXNOYU4odXRtVXBzRWFzdGluZykpIHtcbiAgICB1dG1VcHNFYXN0aW5nID0gTnVtYmVyLnBhcnNlRmxvYXQoZWFzdGluZylcbiAgfSBlbHNlIGlmIChcbiAgICBrZXkgPT09ICd1dG1VcHNFYXN0aW5nJyAmJlxuICAgIGVhc3RpbmcgIT09IHVuZGVmaW5lZCAmJlxuICAgICFpc05vcnRoaW5nSW52YWxpZFxuICApIHtcbiAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSwgbWVzc2FnZTogJ0Vhc3RpbmcgdmFsdWUgaXMgaW52YWxpZCcgfVxuICB9XG4gIGlmICghaXNOYU4odXRtVXBzTm9ydGhpbmcpKSB7XG4gICAgdXRtVXBzTm9ydGhpbmcgPSBOdW1iZXIucGFyc2VGbG9hdChub3J0aGluZylcbiAgICB1dG1VcHNOb3J0aGluZyA9XG4gICAgICBpc1VwcyB8fCBub3J0aGVybkhlbWlzcGhlcmVcbiAgICAgICAgPyB1dG1VcHNOb3J0aGluZ1xuICAgICAgICA6IHV0bVVwc05vcnRoaW5nIC0gTk9SVEhJTkdfT0ZGU0VUXG4gIH0gZWxzZSBpZiAoXG4gICAga2V5ID09PSAndXRtVXBzTm9ydGhpbmcnICYmXG4gICAgbm9ydGhpbmcgIT09IHVuZGVmaW5lZCAmJlxuICAgICFpc0Vhc3RpbmdJbnZhbGlkXG4gICkge1xuICAgIHJldHVybiB7IGVycm9yOiB0cnVlLCBtZXNzYWdlOiAnTm9ydGhpbmcgdmFsdWUgaXMgaW52YWxpZCcgfVxuICB9XG4gIGlmIChcbiAgICBpc1VwcyAmJlxuICAgICghdXBzVmFsaWREaXN0YW5jZSh1dG1VcHNOb3J0aGluZykgfHwgIXVwc1ZhbGlkRGlzdGFuY2UodXRtVXBzRWFzdGluZykpXG4gICkge1xuICAgIHJldHVybiB7IGVycm9yOiB0cnVlLCBtZXNzYWdlOiAnSW52YWxpZCBVUFMgZGlzdGFuY2UnIH1cbiAgfVxuICBjb25zdCB1dG1VcHNQYXJ0cyA9IHtcbiAgICBlYXN0aW5nOiB1dG1VcHNFYXN0aW5nLFxuICAgIG5vcnRoaW5nOiB1dG1VcHNOb3J0aGluZyxcbiAgICB6b25lTnVtYmVyLFxuICAgIGhlbWlzcGhlcmUsXG4gICAgbm9ydGhQb2xlOiBub3J0aGVybkhlbWlzcGhlcmUsXG4gIH1cbiAgLy8gVGhlc2UgY2hlY2tzIGFyZSB0byBlbnN1cmUgdGhhdCB3ZSBvbmx5IG1hcmsgYSB2YWx1ZSBhcyBcImludmFsaWRcIlxuICAvLyBpZiB0aGUgdXNlciBoYXMgZW50ZXJlZCBzb21ldGhpbmcgYWxyZWFkeVxuICBsZXQgeyBsYXQsIGxvbiB9ID0gY29udmVydGVyLlVUTVVQU3RvTEwodXRtVXBzUGFydHMpXG4gIGxvbiA9IGxvbiAlIDM2MFxuICBpZiAobG9uIDwgLTE4MCkge1xuICAgIGxvbiA9IGxvbiArIDM2MFxuICB9XG4gIGlmIChsb24gPiAxODApIHtcbiAgICBsb24gPSBsb24gLSAzNjBcbiAgfVxuICAvLyB3ZSB3YW50IHRvIHZhbGlkYXRlIHVzaW5nIHRoZSBoYXNQb2ludEVycm9yIG1ldGhvZCwgYnV0IG9ubHkgaWYgdGhleSdyZSBib3RoIGRlZmluZWRcbiAgLy8gaWYgb25lIG9yIG1vcmUgaXMgdW5kZWZpbmVkLCB3ZSB3YW50IHRvIHJldHVybiB0cnVlXG4gIGNvbnN0IGlzTGF0TG9uVmFsaWQgPVxuICAgICFoYXNQb2ludEVycm9yKFtsb24sIGxhdF0pIHx8XG4gICAgbm9ydGhpbmcgPT09IHVuZGVmaW5lZCB8fFxuICAgIGVhc3RpbmcgPT09IHVuZGVmaW5lZFxuICBpZiAoKGlzTm9ydGhpbmdJbnZhbGlkICYmIGlzRWFzdGluZ0ludmFsaWQpIHx8ICFpc0xhdExvblZhbGlkKSB7XG4gICAgcmV0dXJuIHsgZXJyb3I6IHRydWUsIG1lc3NhZ2U6ICdJbnZhbGlkIFVUTS9VUFMgY29vcmRpbmF0ZXMnIH1cbiAgfVxuICByZXR1cm4gZXJyb3Jcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlUmFkaXVzTGluZUJ1ZmZlcihrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBjb25zdCBwYXJzZWQgPSBOdW1iZXIodmFsdWUudmFsdWUpXG4gIGNvbnN0IGJ1ZmZlciA9IE51bWJlci5pc05hTihwYXJzZWQpID8gMCA6IHBhcnNlZFxuICBjb25zdCBidWZmZXJNZXRlcnMgPSBEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlSW5NZXRlcnMoYnVmZmVyLCB2YWx1ZS51bml0cylcbiAgaWYgKGtleSA9PT0gJ2xpbmVXaWR0aCcgJiYgYnVmZmVyTWV0ZXJzIDwgTElORV9CVUZGRVJfTUlOSU5VTV9NRVRFUlMpIHtcbiAgICBjb25zdCBtaW5EaXN0YW5jZSA9IERpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VGcm9tTWV0ZXJzKFxuICAgICAgTElORV9CVUZGRVJfTUlOSU5VTV9NRVRFUlMsXG4gICAgICB2YWx1ZS51bml0c1xuICAgIClcbiAgICBjb25zdCBtaW5EaXN0YW5jZURpc3BsYXkgPSBOdW1iZXIuaXNJbnRlZ2VyKG1pbkRpc3RhbmNlKVxuICAgICAgPyBtaW5EaXN0YW5jZS50b1N0cmluZygpXG4gICAgICA6IC8vIEFkZCAwLjAxIHRvIGFjY291bnQgZm9yIGRlY2ltYWwgcGxhY2VzIGJleW9uZCBodW5kcmVkdGhzLiBGb3IgZXhhbXBsZSwgaWZcbiAgICAgICAgLy8gdGhlIHNlbGVjdGVkIHVuaXQgaXMgZmVldCwgdGhlbiB0aGUgcmVxdWlyZWQgdmFsdWUgaXMgMjQ2LjA2MywgYW5kIGlmIHdlIG9ubHlcbiAgICAgICAgLy8gc2hvd2VkICgyNDYuMDYzKS50b0ZpeGVkKDIpLCB0aGVuIHRoZSB1c2VyIHdvdWxkIHNlZSAyNDYuMDYsIGJ1dCBpZiB0aGV5IHR5cGVkXG4gICAgICAgIC8vIHRoYXQgaW4sIHRoZXkgd291bGQgc3RpbGwgYmUgc2hvd24gdGhpcyBlcnJvci5cbiAgICAgICAgKG1pbkRpc3RhbmNlICsgMC4wMSkudG9GaXhlZCgyKVxuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6IGBMaW5lIGJ1ZmZlciBtdXN0IGJlIGF0IGxlYXN0ICR7bWluRGlzdGFuY2VEaXNwbGF5fSAke3ZhbHVlLnVuaXRzfWAsXG4gICAgfVxuICB9XG5cbiAgY29uc3QgbGFiZWwgPSBrZXkgPT09ICdyYWRpdXMnID8gJ1JhZGl1cyAnIDogJ0J1ZmZlciB3aWR0aCAnXG4gIGlmICh2YWx1ZS52YWx1ZS50b1N0cmluZygpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBpbml0aWFsRXJyb3JTdGF0ZVxuICB9XG5cbiAgaWYgKGtleS5pbmNsdWRlcygnV2lkdGgnKSAmJiBidWZmZXJNZXRlcnMgPCAxICYmIGJ1ZmZlck1ldGVycyAhPT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6XG4gICAgICAgIGxhYmVsICtcbiAgICAgICAgJ211c3QgYmUgMCwgb3IgYXQgbGVhc3QgJyArXG4gICAgICAgIERpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VGcm9tTWV0ZXJzKDEsIHZhbHVlLnVuaXRzKS50b1ByZWNpc2lvbigyKSArXG4gICAgICAgICcgJyArXG4gICAgICAgIHZhbHVlLnVuaXRzLFxuICAgIH1cbiAgfSBlbHNlIGlmIChrZXkuaW5jbHVkZXMoJ3JhZGl1cycpICYmIGJ1ZmZlck1ldGVycyA8IDEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZXJyb3I6IHRydWUsXG4gICAgICBtZXNzYWdlOlxuICAgICAgICBsYWJlbCArXG4gICAgICAgICdtdXN0IGJlIGF0IGxlYXN0ICcgK1xuICAgICAgICBEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlRnJvbU1ldGVycygxLCB2YWx1ZS51bml0cykudG9QcmVjaXNpb24oMikgK1xuICAgICAgICAnICcgK1xuICAgICAgICB2YWx1ZS51bml0cyxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGluaXRpYWxFcnJvclN0YXRlXG59XG5jb25zdCB2YWxpZGF0ZURtc0lucHV0ID0gKGlucHV0OiBhbnksIHBsYWNlSG9sZGVyOiBzdHJpbmcpID0+IHtcbiAgaWYgKGlucHV0ICE9PSB1bmRlZmluZWQgJiYgcGxhY2VIb2xkZXIgPT09ICdkZMKwbW1cXCdzcy5zXCInKSB7XG4gICAgY29uc3QgY29ycmVjdGVkID0gZ2V0Q29ycmVjdGVkRG1zTGF0SW5wdXQoaW5wdXQpXG4gICAgcmV0dXJuIHsgZXJyb3I6IGNvcnJlY3RlZCAhPT0gaW5wdXQsIGRlZmF1bHRWYWx1ZTogY29ycmVjdGVkIH1cbiAgfSBlbHNlIGlmIChpbnB1dCAhPT0gdW5kZWZpbmVkICYmIHBsYWNlSG9sZGVyID09PSAnZGRkwrBtbVxcJ3NzLnNcIicpIHtcbiAgICBjb25zdCBjb3JyZWN0ZWQgPSBnZXRDb3JyZWN0ZWREbXNMb25JbnB1dChpbnB1dClcbiAgICByZXR1cm4geyBlcnJvcjogY29ycmVjdGVkICE9PSBpbnB1dCwgZGVmYXVsdFZhbHVlOiBjb3JyZWN0ZWQgfVxuICB9XG4gIHJldHVybiB7IGVycm9yOiBmYWxzZSB9XG59XG5jb25zdCBsYXQgPSB7XG4gIGRlZ3JlZXNCZWdpbjogMCxcbiAgZGVncmVlc0VuZDogMixcbiAgbWludXRlc0JlZ2luOiAzLFxuICBtaW51dGVzRW5kOiA1LFxuICBzZWNvbmRzQmVnaW46IDYsXG4gIHNlY29uZHNFbmQ6IC0xLFxufVxuY29uc3QgbG9uID0ge1xuICBkZWdyZWVzQmVnaW46IDAsXG4gIGRlZ3JlZXNFbmQ6IDMsXG4gIG1pbnV0ZXNCZWdpbjogNCxcbiAgbWludXRlc0VuZDogNixcbiAgc2Vjb25kc0JlZ2luOiA3LFxuICBzZWNvbmRzRW5kOiAtMSxcbn1cbmNvbnN0IGdldENvcnJlY3RlZERtc0xhdElucHV0ID0gKGlucHV0OiBhbnkpID0+IHtcbiAgY29uc3QgZGVncmVlcyA9IGlucHV0LnNsaWNlKGxhdC5kZWdyZWVzQmVnaW4sIGxhdC5kZWdyZWVzRW5kKVxuICBjb25zdCBtaW51dGVzID0gaW5wdXQuc2xpY2UobGF0Lm1pbnV0ZXNCZWdpbiwgbGF0Lm1pbnV0ZXNFbmQpXG4gIGNvbnN0IHNlY29uZHMgPSBpbnB1dC5zbGljZShsYXQuc2Vjb25kc0JlZ2luLCBsYXQuc2Vjb25kc0VuZClcbiAgY29uc3QgbWF4RG1zTGF0ID0gJzkwwrAwMFxcJzAwXCInXG4gIGlmIChkZWdyZWVzID4gOTApIHtcbiAgICByZXR1cm4gbWF4RG1zTGF0XG4gIH0gZWxzZSBpZiAobWludXRlcyA+PSA2MCkge1xuICAgIGlmIChkZWdyZWVzIDwgOTApIHtcbiAgICAgIHJldHVybiAoTnVtYmVyLnBhcnNlSW50KGRlZ3JlZXMpICsgMSkudG9TdHJpbmcoKSArICfCsDAwXFwnMDBcIidcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1heERtc0xhdFxuICAgIH1cbiAgfSBlbHNlIGlmIChzZWNvbmRzID49IDYwKSB7XG4gICAgaWYgKG1pbnV0ZXMgPCA1OSkge1xuICAgICAgcmV0dXJuIGRlZ3JlZXMgKyAnwrAnICsgKE51bWJlci5wYXJzZUludChtaW51dGVzKSArIDEpLnRvU3RyaW5nKCkgKyAnXFwnMDBcIidcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRlZ3JlZXMgPj0gJzkwJykge1xuICAgICAgICByZXR1cm4gbWF4RG1zTGF0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKE51bWJlci5wYXJzZUludChkZWdyZWVzKSArIDEpLnRvU3RyaW5nKCkgKyAnwrAwMFxcJzAwXCInXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKFxuICAgIGlucHV0LnNsaWNlKGxhdC5kZWdyZWVzQmVnaW4sIGxhdC5kZWdyZWVzRW5kKSA9PT0gJzlfJyAmJlxuICAgIGlucHV0LnNsaWNlKGxhdC5kZWdyZWVzRW5kKSA9PT0gJ8KwMDBcXCcwMFwiJ1xuICApIHtcbiAgICByZXR1cm4gJzlfwrBfX1xcJ19fXCInXG4gIH0gZWxzZSBpZiAoXG4gICAgaW5wdXQuc2xpY2UobGF0Lm1pbnV0ZXNCZWdpbiwgbGF0Lm1pbnV0ZXNFbmQpID09PSAnNl8nICYmXG4gICAgaW5wdXQuc2xpY2UobGF0Lm1pbnV0ZXNFbmQpID09PSAnXFwnMDBcIidcbiAgKSB7XG4gICAgcmV0dXJuIGlucHV0LnNsaWNlKGxhdC5kZWdyZWVzQmVnaW4sIGxhdC5kZWdyZWVzRW5kKSArICfCsDZfXFwnX19cIidcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gaW5wdXRcbiAgfVxufVxuY29uc3QgZ2V0Q29ycmVjdGVkRG1zTG9uSW5wdXQgPSAoaW5wdXQ6IGFueSkgPT4ge1xuICBjb25zdCBkZWdyZWVzID0gaW5wdXQuc2xpY2UobG9uLmRlZ3JlZXNCZWdpbiwgbG9uLmRlZ3JlZXNFbmQpXG4gIGNvbnN0IG1pbnV0ZXMgPSBpbnB1dC5zbGljZShsb24ubWludXRlc0JlZ2luLCBsb24ubWludXRlc0VuZClcbiAgY29uc3Qgc2Vjb25kcyA9IGlucHV0LnNsaWNlKGxvbi5zZWNvbmRzQmVnaW4sIGxvbi5zZWNvbmRzRW5kKVxuICBjb25zdCBtYXhEbXNMb24gPSAnMTgwwrAwMFxcJzAwXCInXG4gIGlmIChkZWdyZWVzID4gMTgwKSB7XG4gICAgcmV0dXJuIG1heERtc0xvblxuICB9IGVsc2UgaWYgKG1pbnV0ZXMgPj0gNjApIHtcbiAgICBpZiAoZGVncmVlcyA8IDE4MCkge1xuICAgICAgcmV0dXJuIChOdW1iZXIucGFyc2VJbnQoZGVncmVlcykgKyAxKS50b1N0cmluZygpICsgJ8KwMDBcXCcwMFwiJ1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF4RG1zTG9uXG4gICAgfVxuICB9IGVsc2UgaWYgKHNlY29uZHMgPiA2MCkge1xuICAgIGlmIChtaW51dGVzIDwgNTkpIHtcbiAgICAgIHJldHVybiBkZWdyZWVzICsgJ8KwJyArIChOdW1iZXIucGFyc2VJbnQobWludXRlcykgKyAxKS50b1N0cmluZygpICsgJ1xcJzAwXCInXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChkZWdyZWVzID49ICcxODAnKSB7XG4gICAgICAgIHJldHVybiBtYXhEbXNMb25cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoTnVtYmVyLnBhcnNlSW50KGRlZ3JlZXMpICsgMSkudG9TdHJpbmcoKSArICfCsDAwXFwnMDBcIidcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoXG4gICAgaW5wdXQuc2xpY2UobG9uLmRlZ3JlZXNCZWdpbiwgbG9uLmRlZ3JlZXNFbmQpID09PSAnMThfJyAmJlxuICAgIGlucHV0LnNsaWNlKGxvbi5kZWdyZWVzRW5kKSA9PT0gJ8KwMDBcXCcwMFwiJ1xuICApIHtcbiAgICByZXR1cm4gJzE4X8KwX19cXCdfX1wiJ1xuICB9IGVsc2UgaWYgKFxuICAgIGlucHV0LnNsaWNlKGxvbi5taW51dGVzQmVnaW4sIGxvbi5taW51dGVzRW5kKSA9PT0gJzZfJyAmJlxuICAgIGlucHV0LnNsaWNlKGxvbi5taW51dGVzRW5kKSA9PT0gJ1xcJzAwXCInXG4gICkge1xuICAgIHJldHVybiBpbnB1dC5zbGljZShsb24uZGVncmVlc0JlZ2luLCBsb24uZGVncmVlc0VuZCkgKyAnwrA2X1xcJ19fXCInXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGlucHV0XG4gIH1cbn1cbmZ1bmN0aW9uIGdldERlZmF1bHRpbmdFcnJvck1lc3NhZ2UoXG4gIHZhbHVlOiBzdHJpbmcsXG4gIGxhYmVsOiBzdHJpbmcsXG4gIGRlZmF1bHRWYWx1ZTogbnVtYmVyXG4pIHtcbiAgcmV0dXJuIGAke3ZhbHVlLnJlcGxhY2UoXG4gICAgL18vZyxcbiAgICAnMCdcbiAgKX0gaXMgbm90IGFuIGFjY2VwdGFibGUgJHtsYWJlbH0gdmFsdWUuIERlZmF1bHRpbmcgdG8gJHtkZWZhdWx0VmFsdWV9YFxufVxuZnVuY3Rpb24gZ2V0RW1wdHlFcnJvck1lc3NhZ2UobGFiZWw6IHN0cmluZykge1xuICByZXR1cm4gYCR7bGFiZWwucmVwbGFjZSgvXlxcdy8sIChjKSA9PiBjLnRvVXBwZXJDYXNlKCkpfSBjYW5ub3QgYmUgZW1wdHlgXG59XG5jb25zdCBJbnZhbGlkID0gc3R5bGVkLmRpdmBcbiAgYm9yZGVyOiAxcHggc29saWQgJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm5lZ2F0aXZlQ29sb3J9O1xuICBoZWlnaHQ6IDEwMCU7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBjb2xvcjogd2hpdGU7XG5gXG5jb25zdCBXYXJuaW5nSWNvbiA9IHN0eWxlZC5zcGFuYFxuICBwYWRkaW5nOiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLm1pbmltdW1TcGFjaW5nfTtcbmBcbiJdfQ==