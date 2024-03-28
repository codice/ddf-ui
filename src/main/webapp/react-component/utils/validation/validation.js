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
//# sourceMappingURL=validation.js.map