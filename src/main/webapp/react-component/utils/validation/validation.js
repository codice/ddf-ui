import { __assign, __makeTemplateObject } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return errorState.error ? (_jsxs(Invalid, { className: "my-2", children: [_jsx(WarningIcon, { className: "fa fa-warning" }), _jsx("span", { children: errorState.message })] })) : null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbi92YWxpZGF0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEtBQUssS0FBSyxNQUFNLFNBQVMsQ0FBQTtBQUNoQyxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsNEVBQTRFO0FBQzVFLElBQU0sU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ3ZDLElBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQTtBQUNoQyxJQUFNLFFBQVEsR0FBRyxVQUFVLENBQUE7QUFDM0IsSUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFBO0FBQzdCLHlHQUF5RztBQUN6RyxlQUFlO0FBQ2YsTUFBTSxDQUFDLElBQU0sMEJBQTBCLEdBQUcsRUFBRSxDQUFBO0FBQzVDLE9BQU8sYUFBYSxNQUFNLDJCQUEyQixDQUFBO0FBQ3JELE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsaUJBQWlCLEdBQ2xCLE1BQU0saURBQWlELENBQUE7QUFDeEQsT0FBTyxLQUFLLE1BQU0sbUJBQW1CLENBQUE7QUFDckMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVDQUF1QyxDQUFBO0FBQ3JFLE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxNQUFXO0lBQzNDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUN4QixPQUFNO0lBQ1IsQ0FBQztJQUNELElBQUksa0JBQWtCLEdBQUc7UUFDdkIsS0FBSyxFQUFFLEVBQUU7UUFDVCxPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUE7SUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFF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L0MsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCAqIGFzIHVzbmdzIGZyb20gJ3VzbmcuanMnXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjU1NCkgRklYTUU6IEV4cGVjdGVkIDEgYXJndW1lbnRzLCBidXQgZ290IDAuXG5jb25zdCBjb252ZXJ0ZXIgPSBuZXcgdXNuZ3MuQ29udmVydGVyKClcbmNvbnN0IE5PUlRISU5HX09GRlNFVCA9IDEwMDAwMDAwXG5jb25zdCBMQVRJVFVERSA9ICdsYXRpdHVkZSdcbmNvbnN0IExPTkdJVFVERSA9ICdsb25naXR1ZGUnXG4vLyA3NSBtZXRlcnMgd2FzIGRldGVybWluZWQgdG8gYmUgYSByZWFzb25hYmxlIG1pbiBmb3IgbGluZXN0cmluZyBzZWFyY2hlcyBiYXNlZCBvbiB0ZXN0aW5nIGFnYWluc3Qga25vd25cbi8vIGRhdGEgc291cmNlc1xuZXhwb3J0IGNvbnN0IExJTkVfQlVGRkVSX01JTklOVU1fTUVURVJTID0gNzVcbmltcG9ydCBEaXN0YW5jZVV0aWxzIGZyb20gJy4uLy4uLy4uL2pzL0Rpc3RhbmNlVXRpbHMnXG5pbXBvcnQge1xuICBwYXJzZURtc0Nvb3JkaW5hdGUsXG4gIGRtc0Nvb3JkaW5hdGVUb0RELFxufSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvbG9jYXRpb24tbmV3L3V0aWxzL2Rtcy11dGlscydcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi8uLi9qcy93cmVxcidcbmltcG9ydCB7IGVycm9yTWVzc2FnZXMgfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvbG9jYXRpb24tbmV3L3V0aWxzJ1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvck1lc3NhZ2VzKGVycm9yczogYW55KSB7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgbGV0IHNlYXJjaEVycm9yTWVzc2FnZSA9IHtcbiAgICB0aXRsZTogJycsXG4gICAgbWVzc2FnZTogJycsXG4gIH1cbiAgaWYgKGVycm9ycy5sZW5ndGggPiAxKSB7XG4gICAgbGV0IG1zZyA9IHNlYXJjaEVycm9yTWVzc2FnZS5tZXNzYWdlXG4gICAgc2VhcmNoRXJyb3JNZXNzYWdlLnRpdGxlID1cbiAgICAgICdZb3VyIHNlYXJjaCBjYW5ub3QgYmUgcnVuIGR1ZSB0byBtdWx0aXBsZSBlcnJvcnMnXG4gICAgY29uc3QgZm9ybWF0dGVkRXJyb3JzID0gZXJyb3JzLm1hcChcbiAgICAgIChlcnJvcjogYW55KSA9PiBgXFx1MjAyMiAke2Vycm9yLnRpdGxlfTogJHtlcnJvci5ib2R5fWBcbiAgICApXG4gICAgc2VhcmNoRXJyb3JNZXNzYWdlLm1lc3NhZ2UgPSBtc2cuY29uY2F0KGZvcm1hdHRlZEVycm9ycylcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBlcnJvciA9IGVycm9yc1swXVxuICAgIHNlYXJjaEVycm9yTWVzc2FnZS50aXRsZSA9IGVycm9yLnRpdGxlXG4gICAgc2VhcmNoRXJyb3JNZXNzYWdlLm1lc3NhZ2UgPSBlcnJvci5ib2R5XG4gIH1cbiAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignc25hY2snLCB7XG4gICAgbWVzc2FnZTogYCR7c2VhcmNoRXJyb3JNZXNzYWdlLnRpdGxlfSA6ICR7c2VhcmNoRXJyb3JNZXNzYWdlLm1lc3NhZ2V9YCxcbiAgICBzbmFja1Byb3BzOiB7XG4gICAgICBhbGVydFByb3BzOiB7XG4gICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgfSxcbiAgICB9LFxuICB9KVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbHRlckVycm9ycyhmaWx0ZXJzOiBhbnkpIHtcbiAgY29uc3QgZXJyb3JzID0gbmV3IFNldCgpXG4gIGxldCBnZW9tZXRyeUVycm9ycyA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGZpbHRlciA9IGZpbHRlcnNbaV1cbiAgICBnZXRHZW9tZXRyeUVycm9ycyhmaWx0ZXIpLmZvckVhY2goKG1zZykgPT4ge1xuICAgICAgZ2VvbWV0cnlFcnJvcnMuYWRkKG1zZylcbiAgICB9KVxuICB9XG4gIGdlb21ldHJ5RXJyb3JzLmZvckVhY2goKGVycikgPT4ge1xuICAgIGVycm9ycy5hZGQoe1xuICAgICAgdGl0bGU6ICdJbnZhbGlkIGdlb21ldHJ5IGZpbHRlcicsXG4gICAgICBib2R5OiBlcnIsXG4gICAgfSlcbiAgfSlcbiAgcmV0dXJuIEFycmF5LmZyb20oZXJyb3JzKVxufVxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVHZW8oa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgc3dpdGNoIChrZXkpIHtcbiAgICBjYXNlICdsYXQnOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlRERMYXRMb24oTEFUSVRVREUsIHZhbHVlLCA5MClcbiAgICBjYXNlICdsb24nOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlRERMYXRMb24oTE9OR0lUVURFLCB2YWx1ZSwgMTgwKVxuICAgIGNhc2UgJ2Rtc0xhdCc6XG4gICAgICByZXR1cm4gdmFsaWRhdGVEbXNMYXRMb24oTEFUSVRVREUsIHZhbHVlKVxuICAgIGNhc2UgJ2Rtc0xvbic6XG4gICAgICByZXR1cm4gdmFsaWRhdGVEbXNMYXRMb24oTE9OR0lUVURFLCB2YWx1ZSlcbiAgICBjYXNlICd1c25nJzpcbiAgICAgIHJldHVybiB2YWxpZGF0ZVVzbmcodmFsdWUpXG4gICAgY2FzZSAnZWFzdGluZyc6XG4gICAgY2FzZSAnbm9ydGhpbmcnOlxuICAgIGNhc2UgJ3pvbmVOdW1iZXInOlxuICAgIGNhc2UgJ2hlbWlzcGhlcmUnOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlVXRtVXBzKGtleSwgdmFsdWUpXG4gICAgY2FzZSAncmFkaXVzJzpcbiAgICBjYXNlICdsaW5lV2lkdGgnOlxuICAgIGNhc2UgJ3BvbHlnb25CdWZmZXJXaWR0aCc6XG4gICAgICByZXR1cm4gdmFsaWRhdGVSYWRpdXNMaW5lQnVmZmVyKGtleSwgdmFsdWUpXG4gICAgY2FzZSAnbGluZSc6XG4gICAgY2FzZSAncG9seSc6XG4gICAgY2FzZSAncG9seWdvbic6XG4gICAgY2FzZSAnbXVsdGlsaW5lJzpcbiAgICBjYXNlICdtdWx0aXBvbHlnb24nOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlTGluZVBvbHlnb24oa2V5LCB2YWx1ZSlcbiAgICBjYXNlICdiYm94JzpcbiAgICAgIHJldHVybiB2YWxpZGF0ZUJvdW5kaW5nQm94KGtleSwgdmFsdWUpXG4gICAgZGVmYXVsdDpcbiAgfVxufVxuZXhwb3J0IGNvbnN0IEVycm9yQ29tcG9uZW50ID0gKHByb3BzOiBhbnkpID0+IHtcbiAgY29uc3QgeyBlcnJvclN0YXRlIH0gPSBwcm9wc1xuICByZXR1cm4gZXJyb3JTdGF0ZS5lcnJvciA/IChcbiAgICA8SW52YWxpZCBjbGFzc05hbWU9XCJteS0yXCI+XG4gICAgICA8V2FybmluZ0ljb24gY2xhc3NOYW1lPVwiZmEgZmEtd2FybmluZ1wiIC8+XG4gICAgICA8c3Bhbj57ZXJyb3JTdGF0ZS5tZXNzYWdlfTwvc3Bhbj5cbiAgICA8L0ludmFsaWQ+XG4gICkgOiBudWxsXG59XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVMaXN0T2ZQb2ludHMoY29vcmRpbmF0ZXM6IGFueVtdLCBtb2RlOiBzdHJpbmcpIHtcbiAgbGV0IG1lc3NhZ2UgPSBudWxsXG4gIGNvbnN0IGlzTGluZSA9IG1vZGUuaW5jbHVkZXMoJ2xpbmUnKVxuICBjb25zdCBudW1Qb2ludHMgPSBpc0xpbmUgPyAyIDogNFxuICBpZiAoXG4gICAgIW1vZGUuaW5jbHVkZXMoJ211bHRpJykgJiZcbiAgICAhaXNMaW5lICYmXG4gICAgY29vcmRpbmF0ZXMubGVuZ3RoID49IG51bVBvaW50cyAmJlxuICAgICFfLmlzRXF1YWwoY29vcmRpbmF0ZXNbMF0sIGNvb3JkaW5hdGVzLnNsaWNlKC0xKVswXSlcbiAgKSB7XG4gICAgbWVzc2FnZSA9IGVycm9yTWVzc2FnZXMuZmlyc3RMYXN0UG9pbnRNaXNtYXRjaFxuICB9XG4gIGlmIChcbiAgICAhbW9kZS5pbmNsdWRlcygnbXVsdGknKSAmJlxuICAgICFjb29yZGluYXRlcy5zb21lKChjb29yZHMpID0+IGNvb3Jkcy5sZW5ndGggPiAyKSAmJlxuICAgIGNvb3JkaW5hdGVzLmxlbmd0aCA8IG51bVBvaW50c1xuICApIHtcbiAgICBtZXNzYWdlID0gYE1pbmltdW0gb2YgJHtudW1Qb2ludHN9IHBvaW50cyBuZWVkZWQgZm9yICR7XG4gICAgICBpc0xpbmUgPyAnTGluZScgOiAnUG9seWdvbidcbiAgICB9YFxuICB9XG4gIGNvb3JkaW5hdGVzLmZvckVhY2goKGNvb3JkaW5hdGUpID0+IHtcbiAgICBpZiAoY29vcmRpbmF0ZS5sZW5ndGggPiAyKSB7XG4gICAgICBjb29yZGluYXRlLmZvckVhY2goKGNvb3JkOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGhhc1BvaW50RXJyb3IoY29vcmQpKVxuICAgICAgICAgIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShjb29yZCkgKyAnIGlzIG5vdCBhIHZhbGlkIHBvaW50J1xuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1vZGUuaW5jbHVkZXMoJ211bHRpJykpIHtcbiAgICAgICAgLy8gSGFuZGxlIHRoZSBjYXNlIHdoZXJlIHRoZSB1c2VyIGhhcyBzZWxlY3RlZCBhIFwibXVsdGlcIiBtb2RlIGJ1dFxuICAgICAgICAvLyBvbmUgb3IgbW9yZSBzaGFwZXMgd2VyZSBpbnZhbGlkIGFuZCB0aGVyZWZvcmUgZWxpbWluYXRlZFxuICAgICAgICBtZXNzYWdlID0gYFN3aXRjaCB0byAke2lzTGluZSA/ICdMaW5lJyA6ICdQb2x5Z29uJ31gXG4gICAgICB9IGVsc2UgaWYgKGhhc1BvaW50RXJyb3IoY29vcmRpbmF0ZSkpIHtcbiAgICAgICAgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGNvb3JkaW5hdGUpICsgJyBpcyBub3QgYSB2YWxpZCBwb2ludCdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiB7IGVycm9yOiAhIW1lc3NhZ2UsIG1lc3NhZ2UgfVxufVxuZXhwb3J0IGNvbnN0IGluaXRpYWxFcnJvclN0YXRlID0ge1xuICBlcnJvcjogZmFsc2UsXG4gIG1lc3NhZ2U6ICcnLFxufVxuZXhwb3J0IGNvbnN0IGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQgPSB7XG4gIGVycm9yOiBmYWxzZSxcbiAgbWVzc2FnZTogJycsXG4gIGRlZmF1bHRWYWx1ZTogJycsXG59XG5mdW5jdGlvbiBpczJEQXJyYXkoY29vcmRpbmF0ZXM6IGFueVtdKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoY29vcmRpbmF0ZXMpICYmIEFycmF5LmlzQXJyYXkoY29vcmRpbmF0ZXNbMF0pXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuZnVuY3Rpb24gaGFzUG9pbnRFcnJvcihwb2ludDogYW55W10pIHtcbiAgaWYgKFxuICAgIHBvaW50Lmxlbmd0aCAhPT0gMiB8fFxuICAgIE51bWJlci5pc05hTihOdW1iZXIucGFyc2VGbG9hdChwb2ludFswXSkpIHx8XG4gICAgTnVtYmVyLmlzTmFOKE51bWJlci5wYXJzZUZsb2F0KHBvaW50WzFdKSlcbiAgKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICByZXR1cm4gcG9pbnRbMF0gPiAxODAgfHwgcG9pbnRbMF0gPCAtMTgwIHx8IHBvaW50WzFdID4gOTAgfHwgcG9pbnRbMV0gPCAtOTBcbn1cbmZ1bmN0aW9uIGdldEdlb21ldHJ5RXJyb3JzKGZpbHRlcjogYW55KTogU2V0PHN0cmluZz4ge1xuICBjb25zdCBnZW9tZXRyeSA9IGZpbHRlci5nZW9qc29uICYmIGZpbHRlci5nZW9qc29uLmdlb21ldHJ5XG4gIGNvbnN0IGVycm9ycyA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gIGlmICghZ2VvbWV0cnkpIHtcbiAgICByZXR1cm4gZXJyb3JzXG4gIH1cbiAgY29uc3QgcHJvcGVydGllcyA9IGZpbHRlci5nZW9qc29uLnByb3BlcnRpZXNcbiAgY29uc3QgYnVmZmVyID0gcHJvcGVydGllcy5idWZmZXJcbiAgc3dpdGNoIChwcm9wZXJ0aWVzLnR5cGUpIHtcbiAgICBjYXNlICdQb2x5Z29uJzpcbiAgICAgIGlmIChcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0pIHx8XG4gICAgICAgICFnZW9tZXRyeS5jb29yZGluYXRlc1swXS5sZW5ndGhcbiAgICAgICkge1xuICAgICAgICBlcnJvcnMuYWRkKFxuICAgICAgICAgICdQb2x5Z29uIGNvb3JkaW5hdGVzIG11c3QgYmUgaW4gdGhlIGZvcm0gW1t4LHldLFt4LHldLFt4LHldLFt4LHldLCAuLi4gXSdcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5jb29yZGluYXRlc1swXS5sZW5ndGggPCA0KSB7XG4gICAgICAgIC8vIGNoZWNrIGZvciBNdWx0aVBvbHlnb25cbiAgICAgICAgZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0uZm9yRWFjaCgoc2hhcGU6IG51bWJlcltdKSA9PiB7XG4gICAgICAgICAgaWYgKHNoYXBlLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIGVycm9ycy5hZGQoXG4gICAgICAgICAgICAgICdQb2x5Z29uIGNvb3JkaW5hdGVzIG11c3QgYmUgaW4gdGhlIGZvcm0gW1t4LHldLFt4LHldLFt4LHldLFt4LHldLCAuLi4gXSdcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBjb25zdCBwb2x5QnVmZmVyVmFsaWRhdGlvbiA9IHZhbGlkYXRlUmFkaXVzTGluZUJ1ZmZlcignYnVmZmVyV2lkdGgnLCB7XG4gICAgICAgIHZhbHVlOiBidWZmZXIud2lkdGgsXG4gICAgICAgIHVuaXRzOiBidWZmZXIudW5pdCxcbiAgICAgIH0pXG4gICAgICBpZiAocG9seUJ1ZmZlclZhbGlkYXRpb24uZXJyb3IpIHtcbiAgICAgICAgZXJyb3JzLmFkZChwb2x5QnVmZmVyVmFsaWRhdGlvbi5tZXNzYWdlKVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdMaW5lU3RyaW5nJzpcbiAgICAgIGlmIChcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoZ2VvbWV0cnkuY29vcmRpbmF0ZXMpIHx8XG4gICAgICAgICFnZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggfHxcbiAgICAgICAgZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoIDwgMlxuICAgICAgKSB7XG4gICAgICAgIGVycm9ycy5hZGQoJ0xpbmUgY29vcmRpbmF0ZXMgbXVzdCBiZSBpbiB0aGUgZm9ybSBbW3gseV0sW3gseV0sIC4uLiBdJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IGJ1ZmZlclZhbGlkYXRpb24gPSB2YWxpZGF0ZVJhZGl1c0xpbmVCdWZmZXIoJ2xpbmVXaWR0aCcsIHtcbiAgICAgICAgdmFsdWU6IGJ1ZmZlci53aWR0aCxcbiAgICAgICAgdW5pdHM6IGJ1ZmZlci51bml0LFxuICAgICAgfSlcbiAgICAgIC8vIENhbid0IGp1c3QgY2hlY2sgIWJ1ZmZlcldpZHRoIGJlY2F1c2Ugb2YgdGhlIGNhc2Ugb2YgdGhlIHN0cmluZyBcIjBcIlxuICAgICAgaWYgKGJ1ZmZlclZhbGlkYXRpb24uZXJyb3IpIHtcbiAgICAgICAgZXJyb3JzLmFkZChidWZmZXJWYWxpZGF0aW9uLm1lc3NhZ2UpXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ1BvaW50JzpcbiAgICAgIGNvbnN0IHJhZGl1c1ZhbGlkYXRpb24gPSB2YWxpZGF0ZVJhZGl1c0xpbmVCdWZmZXIoJ3JhZGl1cycsIHtcbiAgICAgICAgdmFsdWU6IGJ1ZmZlci53aWR0aCxcbiAgICAgICAgdW5pdHM6IGJ1ZmZlci51bml0LFxuICAgICAgfSlcbiAgICAgIGlmIChyYWRpdXNWYWxpZGF0aW9uLmVycm9yKSB7XG4gICAgICAgIGVycm9ycy5hZGQocmFkaXVzVmFsaWRhdGlvbi5tZXNzYWdlKVxuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICBnZW9tZXRyeS5jb29yZGluYXRlcy5zb21lKFxuICAgICAgICAgIChjb29yZDogYW55KSA9PiAhY29vcmQgfHwgY29vcmQudG9TdHJpbmcoKS5sZW5ndGggPT09IDBcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIGVycm9ycy5hZGQoJ0Nvb3JkaW5hdGVzIG11c3Qgbm90IGJlIGVtcHR5JylcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnQm91bmRpbmdCb3gnOlxuICAgICAgY29uc3QgeyBlYXN0LCB3ZXN0LCBub3J0aCwgc291dGggfSA9IGZpbHRlci5nZW9qc29uLnByb3BlcnRpZXNcbiAgICAgIGlmIChcbiAgICAgICAgW2Vhc3QsIHdlc3QsIG5vcnRoLCBzb3V0aF0uc29tZShcbiAgICAgICAgICAoZGlyZWN0aW9uKSA9PiBkaXJlY3Rpb24gPT09ICcnIHx8IGRpcmVjdGlvbiA9PT0gdW5kZWZpbmVkXG4gICAgICAgICkgfHxcbiAgICAgICAgTnVtYmVyKHNvdXRoKSA+PSBOdW1iZXIobm9ydGgpIHx8XG4gICAgICAgIE51bWJlcih3ZXN0KSA9PT0gTnVtYmVyKGVhc3QpXG4gICAgICApIHtcbiAgICAgICAgZXJyb3JzLmFkZCgnQm91bmRpbmcgYm94IG11c3QgaGF2ZSB2YWxpZCB2YWx1ZXMnKVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgfVxuICByZXR1cm4gZXJyb3JzXG59XG5mdW5jdGlvbiB2YWxpZGF0ZUxpbmVQb2x5Z29uKG1vZGU6IHN0cmluZywgY3VycmVudFZhbHVlOiBzdHJpbmcpIHtcbiAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogYCR7bW9kZSA9PT0gJ2xpbmUnID8gJ0xpbmUnIDogJ1BvbHlnb24nfSBjYW5ub3QgYmUgZW1wdHlgLFxuICAgIH1cbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZENvb3JkcyA9IEpTT04ucGFyc2UoY3VycmVudFZhbHVlKVxuICAgIGlmICghaXMyREFycmF5KHBhcnNlZENvb3JkcykpIHtcbiAgICAgIHJldHVybiB7IGVycm9yOiB0cnVlLCBtZXNzYWdlOiAnTm90IGFuIGFjY2VwdGFibGUgdmFsdWUnIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbGlkYXRlTGlzdE9mUG9pbnRzKHBhcnNlZENvb3JkcywgbW9kZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB7IGVycm9yOiB0cnVlLCBtZXNzYWdlOiAnTm90IGFuIGFjY2VwdGFibGUgdmFsdWUnIH1cbiAgfVxufVxuZnVuY3Rpb24gZ2V0RGRDb29yZHModmFsdWU6IGFueSkge1xuICByZXR1cm4ge1xuICAgIG5vcnRoOiBOdW1iZXIodmFsdWUubm9ydGgpLFxuICAgIHNvdXRoOiBOdW1iZXIodmFsdWUuc291dGgpLFxuICAgIHdlc3Q6IE51bWJlcih2YWx1ZS53ZXN0KSxcbiAgICBlYXN0OiBOdW1iZXIodmFsdWUuZWFzdCksXG4gIH1cbn1cbmZ1bmN0aW9uIGdldERtc0Nvb3Jkcyh2YWx1ZTogYW55KSB7XG4gIGNvbnN0IGNvb3JkaW5hdGVOb3J0aCA9IHBhcnNlRG1zQ29vcmRpbmF0ZSh2YWx1ZS5ub3J0aClcbiAgY29uc3QgY29vcmRpbmF0ZVNvdXRoID0gcGFyc2VEbXNDb29yZGluYXRlKHZhbHVlLnNvdXRoKVxuICBjb25zdCBjb29yZGluYXRlV2VzdCA9IHBhcnNlRG1zQ29vcmRpbmF0ZSh2YWx1ZS53ZXN0KVxuICBjb25zdCBjb29yZGluYXRlRWFzdCA9IHBhcnNlRG1zQ29vcmRpbmF0ZSh2YWx1ZS5lYXN0KVxuICBsZXQgbm9ydGgsIHNvdXRoLCB3ZXN0LCBlYXN0XG4gIGlmIChjb29yZGluYXRlTm9ydGgpIHtcbiAgICBub3J0aCA9IGRtc0Nvb3JkaW5hdGVUb0REKHtcbiAgICAgIC4uLmNvb3JkaW5hdGVOb3J0aCxcbiAgICAgIGRpcmVjdGlvbjogdmFsdWUuZG1zTm9ydGhEaXJlY3Rpb24sXG4gICAgfSlcbiAgfVxuICBpZiAoY29vcmRpbmF0ZVNvdXRoKSB7XG4gICAgc291dGggPSBkbXNDb29yZGluYXRlVG9ERCh7XG4gICAgICAuLi5jb29yZGluYXRlU291dGgsXG4gICAgICBkaXJlY3Rpb246IHZhbHVlLmRtc1NvdXRoRGlyZWN0aW9uLFxuICAgIH0pXG4gIH1cbiAgaWYgKGNvb3JkaW5hdGVXZXN0KSB7XG4gICAgd2VzdCA9IGRtc0Nvb3JkaW5hdGVUb0REKHtcbiAgICAgIC4uLmNvb3JkaW5hdGVXZXN0LFxuICAgICAgZGlyZWN0aW9uOiB2YWx1ZS5kbXNXZXN0RGlyZWN0aW9uLFxuICAgIH0pXG4gIH1cbiAgaWYgKGNvb3JkaW5hdGVFYXN0KSB7XG4gICAgZWFzdCA9IGRtc0Nvb3JkaW5hdGVUb0REKHtcbiAgICAgIC4uLmNvb3JkaW5hdGVFYXN0LFxuICAgICAgZGlyZWN0aW9uOiB2YWx1ZS5kbXNFYXN0RGlyZWN0aW9uLFxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIHsgbm9ydGgsIHNvdXRoLCB3ZXN0LCBlYXN0IH1cbn1cbmZ1bmN0aW9uIGdldFVzbmdDb29yZHModXBwZXJMZWZ0OiBhbnksIGxvd2VyUmlnaHQ6IGFueSkge1xuICBjb25zdCB1cHBlckxlZnRDb29yZCA9IGNvbnZlcnRlci5VU05HdG9MTCh1cHBlckxlZnQsIHRydWUpXG4gIGNvbnN0IGxvd2VyUmlnaHRDb29yZCA9IGNvbnZlcnRlci5VU05HdG9MTChsb3dlclJpZ2h0LCB0cnVlKVxuICByZXR1cm4ge1xuICAgIG5vcnRoOiBOdW1iZXIodXBwZXJMZWZ0Q29vcmQubGF0LnRvRml4ZWQoNSkpLFxuICAgIHNvdXRoOiBOdW1iZXIobG93ZXJSaWdodENvb3JkLmxhdC50b0ZpeGVkKDUpKSxcbiAgICB3ZXN0OiBOdW1iZXIodXBwZXJMZWZ0Q29vcmQubG9uLnRvRml4ZWQoNSkpLFxuICAgIGVhc3Q6IE51bWJlcihsb3dlclJpZ2h0Q29vcmQubG9uLnRvRml4ZWQoNSkpLFxuICB9XG59XG5mdW5jdGlvbiBnZXRVdG1VcHNDb29yZHModXBwZXJMZWZ0OiBhbnksIGxvd2VyUmlnaHQ6IGFueSkge1xuICBjb25zdCB1cHBlckxlZnRQYXJ0cyA9IHtcbiAgICBlYXN0aW5nOiBwYXJzZUZsb2F0KHVwcGVyTGVmdC5lYXN0aW5nKSxcbiAgICBub3J0aGluZzogcGFyc2VGbG9hdCh1cHBlckxlZnQubm9ydGhpbmcpLFxuICAgIHpvbmVOdW1iZXI6IHVwcGVyTGVmdC56b25lTnVtYmVyLFxuICAgIGhlbWlzcGhlcmU6IHVwcGVyTGVmdC5oZW1pc3BoZXJlLFxuICAgIG5vcnRoUG9sZTogdXBwZXJMZWZ0LmhlbWlzcGhlcmUudG9VcHBlckNhc2UoKSA9PT0gJ05PUlRIRVJOJyxcbiAgfVxuICBjb25zdCBsb3dlclJpZ2h0UGFydHMgPSB7XG4gICAgZWFzdGluZzogcGFyc2VGbG9hdChsb3dlclJpZ2h0LmVhc3RpbmcpLFxuICAgIG5vcnRoaW5nOiBwYXJzZUZsb2F0KGxvd2VyUmlnaHQubm9ydGhpbmcpLFxuICAgIHpvbmVOdW1iZXI6IGxvd2VyUmlnaHQuem9uZU51bWJlcixcbiAgICBoZW1pc3BoZXJlOiBsb3dlclJpZ2h0LmhlbWlzcGhlcmUsXG4gICAgbm9ydGhQb2xlOiBsb3dlclJpZ2h0LmhlbWlzcGhlcmUudG9VcHBlckNhc2UoKSA9PT0gJ05PUlRIRVJOJyxcbiAgfVxuICB1cHBlckxlZnRQYXJ0cy5ub3J0aGluZyA9XG4gICAgdXBwZXJMZWZ0UGFydHMuem9uZU51bWJlciA9PT0gMCB8fCB1cHBlckxlZnRQYXJ0cy5ub3J0aFBvbGVcbiAgICAgID8gdXBwZXJMZWZ0UGFydHMubm9ydGhpbmdcbiAgICAgIDogdXBwZXJMZWZ0UGFydHMubm9ydGhpbmcgLSBOT1JUSElOR19PRkZTRVRcbiAgbG93ZXJSaWdodFBhcnRzLm5vcnRoaW5nID1cbiAgICBsb3dlclJpZ2h0UGFydHMuem9uZU51bWJlciA9PT0gMCB8fCBsb3dlclJpZ2h0UGFydHMubm9ydGhQb2xlXG4gICAgICA/IGxvd2VyUmlnaHRQYXJ0cy5ub3J0aGluZ1xuICAgICAgOiBsb3dlclJpZ2h0UGFydHMubm9ydGhpbmcgLSBOT1JUSElOR19PRkZTRVRcbiAgY29uc3Qgbm9ydGggPSBOdW1iZXIoY29udmVydGVyLlVUTVVQU3RvTEwodXBwZXJMZWZ0UGFydHMpLmxhdC50b0ZpeGVkKDUpKVxuICBjb25zdCBzb3V0aCA9IE51bWJlcihjb252ZXJ0ZXIuVVRNVVBTdG9MTChsb3dlclJpZ2h0UGFydHMpLmxhdC50b0ZpeGVkKDUpKVxuICBjb25zdCB3ZXN0ID0gTnVtYmVyKGNvbnZlcnRlci5VVE1VUFN0b0xMKHVwcGVyTGVmdFBhcnRzKS5sb24udG9GaXhlZCg1KSlcbiAgY29uc3QgZWFzdCA9IE51bWJlcihjb252ZXJ0ZXIuVVRNVVBTdG9MTChsb3dlclJpZ2h0UGFydHMpLmxvbi50b0ZpeGVkKDUpKVxuICByZXR1cm4geyBub3J0aCwgc291dGgsIHdlc3QsIGVhc3QgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVMYXRpdHVkZXMobm9ydGg6IGFueSwgc291dGg6IGFueSwgaXNVc25nT3JVdG1VcHM6IGJvb2xlYW4pIHtcbiAgaWYgKFxuICAgICFpc05hTihzb3V0aCkgJiZcbiAgICAhaXNOYU4obm9ydGgpICYmXG4gICAgcGFyc2VGbG9hdChzb3V0aCkgPj0gcGFyc2VGbG9hdChub3J0aClcbiAgKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogaXNVc25nT3JVdG1VcHNcbiAgICAgICAgPyAnVXBwZXIgbGVmdCBjb29yZGluYXRlIG11c3QgYmUgbG9jYXRlZCBhYm92ZSBsb3dlciByaWdodCBjb29yZGluYXRlJ1xuICAgICAgICA6ICdOb3J0aCB2YWx1ZSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBzb3V0aCB2YWx1ZScsXG4gICAgfVxuICB9XG4gIHJldHVybiBpbml0aWFsRXJyb3JTdGF0ZVxufVxuZnVuY3Rpb24gdmFsaWRhdGVMb25naXR1ZGVzKHdlc3Q6IGFueSwgZWFzdDogYW55LCBpc1VzbmdPclV0bVVwczogYm9vbGVhbikge1xuICBpZiAoIWlzTmFOKHdlc3QpICYmICFpc05hTihlYXN0KSAmJiBwYXJzZUZsb2F0KHdlc3QpID09PSBwYXJzZUZsb2F0KGVhc3QpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogaXNVc25nT3JVdG1VcHNcbiAgICAgICAgPyAnTGVmdCBib3VuZCBjYW5ub3QgZXF1YWwgcmlnaHQgYm91bmQnXG4gICAgICAgIDogJ1dlc3QgdmFsdWUgY2Fubm90IGVxdWFsIGVhc3QgdmFsdWUnLFxuICAgIH1cbiAgfVxuICByZXR1cm4gaW5pdGlhbEVycm9yU3RhdGVcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlQm91bmRpbmdCb3goa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgbGV0IGNvb3Jkcywgbm9ydGgsIHNvdXRoLCB3ZXN0LCBlYXN0XG4gIGlmICh2YWx1ZS5pc0Rtcykge1xuICAgIGNvb3JkcyA9IGdldERtc0Nvb3Jkcyh2YWx1ZSlcbiAgfSBlbHNlIGlmICh2YWx1ZS5pc1VzbmcpIHtcbiAgICBjb29yZHMgPSBnZXRVc25nQ29vcmRzKHZhbHVlLnVwcGVyTGVmdCwgdmFsdWUubG93ZXJSaWdodClcbiAgfSBlbHNlIGlmICh2YWx1ZS5pc1V0bVVwcykge1xuICAgIGNvb3JkcyA9IGdldFV0bVVwc0Nvb3Jkcyh2YWx1ZS51cHBlckxlZnQsIHZhbHVlLmxvd2VyUmlnaHQpXG4gIH0gZWxzZSB7XG4gICAgY29vcmRzID0gZ2V0RGRDb29yZHModmFsdWUpXG4gIH1cbiAgbm9ydGggPSBjb29yZHMubm9ydGhcbiAgc291dGggPSBjb29yZHMuc291dGhcbiAgd2VzdCA9IGNvb3Jkcy53ZXN0XG4gIGVhc3QgPSBjb29yZHMuZWFzdFxuICBjb25zdCBpc1VzbmdPclV0bVVwcyA9IHZhbHVlLmlzVXNuZyB8fCB2YWx1ZS5pc1V0bVVwc1xuICBpZiAoa2V5LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2xvbicpKSB7XG4gICAgY29uc3QgeyBlcnJvciwgbWVzc2FnZSB9ID0gdmFsaWRhdGVMb25naXR1ZGVzKHdlc3QsIGVhc3QsIGlzVXNuZ09yVXRtVXBzKVxuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIHsgZXJyb3IsIG1lc3NhZ2UgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsaWRhdGVMYXRpdHVkZXMobm9ydGgsIHNvdXRoLCBpc1VzbmdPclV0bVVwcylcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB7IGVycm9yLCBtZXNzYWdlIH0gPSB2YWxpZGF0ZUxhdGl0dWRlcyhub3J0aCwgc291dGgsIGlzVXNuZ09yVXRtVXBzKVxuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIHsgZXJyb3IsIG1lc3NhZ2UgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsaWRhdGVMb25naXR1ZGVzKHdlc3QsIGVhc3QsIGlzVXNuZ09yVXRtVXBzKVxuICB9XG4gIHJldHVybiBpbml0aWFsRXJyb3JTdGF0ZVxufVxuZnVuY3Rpb24gdmFsaWRhdGVERExhdExvbihsYWJlbDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBkZWZhdWx0Q29vcmQ6IG51bWJlcikge1xuICBsZXQgbWVzc2FnZSA9ICcnXG4gIGxldCBkZWZhdWx0VmFsdWVcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7XG4gICAgbWVzc2FnZSA9IGdldEVtcHR5RXJyb3JNZXNzYWdlKGxhYmVsKVxuICAgIHJldHVybiB7IGVycm9yOiB0cnVlLCBtZXNzYWdlLCBkZWZhdWx0VmFsdWUgfVxuICB9XG4gIGlmIChOdW1iZXIodmFsdWUpID4gZGVmYXVsdENvb3JkIHx8IE51bWJlcih2YWx1ZSkgPCAtMSAqIGRlZmF1bHRDb29yZCkge1xuICAgIGRlZmF1bHRWYWx1ZSA9IE51bWJlcih2YWx1ZSkgPiAwID8gZGVmYXVsdENvb3JkIDogLTEgKiBkZWZhdWx0Q29vcmRcbiAgICBtZXNzYWdlID0gZ2V0RGVmYXVsdGluZ0Vycm9yTWVzc2FnZSh2YWx1ZSwgbGFiZWwsIGRlZmF1bHRWYWx1ZSlcbiAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSwgbWVzc2FnZSwgZGVmYXVsdFZhbHVlIH1cbiAgfVxuICByZXR1cm4gaW5pdGlhbEVycm9yU3RhdGVXaXRoRGVmYXVsdFxufVxuZnVuY3Rpb24gdmFsaWRhdGVEbXNMYXRMb24obGFiZWw6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICBsZXQgbWVzc2FnZSA9ICcnXG4gIGxldCBkZWZhdWx0VmFsdWVcbiAgY29uc3QgdmFsaWRhdG9yID0gbGFiZWwgPT09IExBVElUVURFID8gJ2RkwrBtbVxcJ3NzLnNcIicgOiAnZGRkwrBtbVxcJ3NzLnNcIidcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7XG4gICAgbWVzc2FnZSA9IGdldEVtcHR5RXJyb3JNZXNzYWdlKGxhYmVsKVxuICAgIHJldHVybiB7IGVycm9yOiB0cnVlLCBtZXNzYWdlLCBkZWZhdWx0VmFsdWUgfVxuICB9XG4gIGNvbnN0IGRtc1ZhbGlkYXRpb24gPSB2YWxpZGF0ZURtc0lucHV0KHZhbHVlLCB2YWxpZGF0b3IpXG4gIGlmIChkbXNWYWxpZGF0aW9uLmVycm9yKSB7XG4gICAgZGVmYXVsdFZhbHVlID0gZG1zVmFsaWRhdGlvbi5kZWZhdWx0VmFsdWVcbiAgICBtZXNzYWdlID0gZ2V0RGVmYXVsdGluZ0Vycm9yTWVzc2FnZSh2YWx1ZSwgbGFiZWwsIGRlZmF1bHRWYWx1ZSlcbiAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSwgbWVzc2FnZSwgZGVmYXVsdFZhbHVlIH1cbiAgfVxuICByZXR1cm4geyBlcnJvcjogZmFsc2UsIG1lc3NhZ2UsIGRlZmF1bHRWYWx1ZSB9XG59XG5mdW5jdGlvbiB2YWxpZGF0ZVVzbmcodmFsdWU6IHN0cmluZykge1xuICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgcmV0dXJuIHsgZXJyb3I6IHRydWUsIG1lc3NhZ2U6ICdVU05HIC8gTUdSUyBjb29yZGluYXRlcyBjYW5ub3QgYmUgZW1wdHknIH1cbiAgfVxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBpbml0aWFsRXJyb3JTdGF0ZVxuICB9XG4gIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRlci5VU05HdG9MTCh2YWx1ZSwgdHJ1ZSlcbiAgY29uc3QgaXNJbnZhbGlkID0gTnVtYmVyLmlzTmFOKHJlc3VsdC5sYXQpIHx8IE51bWJlci5pc05hTihyZXN1bHQubG9uKVxuICByZXR1cm4ge1xuICAgIGVycm9yOiBpc0ludmFsaWQsXG4gICAgbWVzc2FnZTogaXNJbnZhbGlkID8gJ0ludmFsaWQgVVNORyAvIE1HUlMgY29vcmRpbmF0ZXMnIDogJycsXG4gIH1cbn1cbmZ1bmN0aW9uIHVwc1ZhbGlkRGlzdGFuY2UoZGlzdGFuY2U6IG51bWJlcikge1xuICByZXR1cm4gZGlzdGFuY2UgPj0gODAwMDAwICYmIGRpc3RhbmNlIDw9IDMyMDAwMDBcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlVXRtVXBzKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIGxldCB7IGVhc3RpbmcsIG5vcnRoaW5nLCB6b25lTnVtYmVyLCBoZW1pc3BoZXJlIH0gPSB2YWx1ZVxuICBjb25zdCBub3J0aGVybkhlbWlzcGhlcmUgPSBoZW1pc3BoZXJlLnRvVXBwZXJDYXNlKCkgPT09ICdOT1JUSEVSTidcbiAgem9uZU51bWJlciA9IE51bWJlci5wYXJzZUludCh6b25lTnVtYmVyKVxuICBjb25zdCBpc1VwcyA9IHpvbmVOdW1iZXIgPT09IDBcbiAgbGV0IGVycm9yID0gaW5pdGlhbEVycm9yU3RhdGVcbiAgLy8gTnVtYmVyKCcnKSByZXR1cm5zIDAsIHNvIHdlIGNhbid0IGp1c3QgYmxpbmRseSBjYXN0IHRvIG51bWJlclxuICAvLyBzaW5jZSB3ZSB3YW50IHRvIGRpZmZlcmVudGlhdGUgJycgZnJvbSAwXG4gIGxldCB1dG1VcHNFYXN0aW5nID0gZWFzdGluZyA9PT0gJycgPyBOYU4gOiBOdW1iZXIoZWFzdGluZylcbiAgbGV0IHV0bVVwc05vcnRoaW5nID0gbm9ydGhpbmcgPT09ICcnID8gTmFOIDogTnVtYmVyKG5vcnRoaW5nKVxuICBjb25zdCBpc05vcnRoaW5nSW52YWxpZCA9IGlzTmFOKHV0bVVwc05vcnRoaW5nKSAmJiBub3J0aGluZyAhPT0gdW5kZWZpbmVkXG4gIGNvbnN0IGlzRWFzdGluZ0ludmFsaWQgPSBpc05hTih1dG1VcHNFYXN0aW5nKSAmJiBlYXN0aW5nICE9PSB1bmRlZmluZWRcbiAgaWYgKCFpc05hTih1dG1VcHNFYXN0aW5nKSkge1xuICAgIHV0bVVwc0Vhc3RpbmcgPSBOdW1iZXIucGFyc2VGbG9hdChlYXN0aW5nKVxuICB9IGVsc2UgaWYgKFxuICAgIGtleSA9PT0gJ3V0bVVwc0Vhc3RpbmcnICYmXG4gICAgZWFzdGluZyAhPT0gdW5kZWZpbmVkICYmXG4gICAgIWlzTm9ydGhpbmdJbnZhbGlkXG4gICkge1xuICAgIHJldHVybiB7IGVycm9yOiB0cnVlLCBtZXNzYWdlOiAnRWFzdGluZyB2YWx1ZSBpcyBpbnZhbGlkJyB9XG4gIH1cbiAgaWYgKCFpc05hTih1dG1VcHNOb3J0aGluZykpIHtcbiAgICB1dG1VcHNOb3J0aGluZyA9IE51bWJlci5wYXJzZUZsb2F0KG5vcnRoaW5nKVxuICAgIHV0bVVwc05vcnRoaW5nID1cbiAgICAgIGlzVXBzIHx8IG5vcnRoZXJuSGVtaXNwaGVyZVxuICAgICAgICA/IHV0bVVwc05vcnRoaW5nXG4gICAgICAgIDogdXRtVXBzTm9ydGhpbmcgLSBOT1JUSElOR19PRkZTRVRcbiAgfSBlbHNlIGlmIChcbiAgICBrZXkgPT09ICd1dG1VcHNOb3J0aGluZycgJiZcbiAgICBub3J0aGluZyAhPT0gdW5kZWZpbmVkICYmXG4gICAgIWlzRWFzdGluZ0ludmFsaWRcbiAgKSB7XG4gICAgcmV0dXJuIHsgZXJyb3I6IHRydWUsIG1lc3NhZ2U6ICdOb3J0aGluZyB2YWx1ZSBpcyBpbnZhbGlkJyB9XG4gIH1cbiAgaWYgKFxuICAgIGlzVXBzICYmXG4gICAgKCF1cHNWYWxpZERpc3RhbmNlKHV0bVVwc05vcnRoaW5nKSB8fCAhdXBzVmFsaWREaXN0YW5jZSh1dG1VcHNFYXN0aW5nKSlcbiAgKSB7XG4gICAgcmV0dXJuIHsgZXJyb3I6IHRydWUsIG1lc3NhZ2U6ICdJbnZhbGlkIFVQUyBkaXN0YW5jZScgfVxuICB9XG4gIGNvbnN0IHV0bVVwc1BhcnRzID0ge1xuICAgIGVhc3Rpbmc6IHV0bVVwc0Vhc3RpbmcsXG4gICAgbm9ydGhpbmc6IHV0bVVwc05vcnRoaW5nLFxuICAgIHpvbmVOdW1iZXIsXG4gICAgaGVtaXNwaGVyZSxcbiAgICBub3J0aFBvbGU6IG5vcnRoZXJuSGVtaXNwaGVyZSxcbiAgfVxuICAvLyBUaGVzZSBjaGVja3MgYXJlIHRvIGVuc3VyZSB0aGF0IHdlIG9ubHkgbWFyayBhIHZhbHVlIGFzIFwiaW52YWxpZFwiXG4gIC8vIGlmIHRoZSB1c2VyIGhhcyBlbnRlcmVkIHNvbWV0aGluZyBhbHJlYWR5XG4gIGxldCB7IGxhdCwgbG9uIH0gPSBjb252ZXJ0ZXIuVVRNVVBTdG9MTCh1dG1VcHNQYXJ0cylcbiAgbG9uID0gbG9uICUgMzYwXG4gIGlmIChsb24gPCAtMTgwKSB7XG4gICAgbG9uID0gbG9uICsgMzYwXG4gIH1cbiAgaWYgKGxvbiA+IDE4MCkge1xuICAgIGxvbiA9IGxvbiAtIDM2MFxuICB9XG4gIC8vIHdlIHdhbnQgdG8gdmFsaWRhdGUgdXNpbmcgdGhlIGhhc1BvaW50RXJyb3IgbWV0aG9kLCBidXQgb25seSBpZiB0aGV5J3JlIGJvdGggZGVmaW5lZFxuICAvLyBpZiBvbmUgb3IgbW9yZSBpcyB1bmRlZmluZWQsIHdlIHdhbnQgdG8gcmV0dXJuIHRydWVcbiAgY29uc3QgaXNMYXRMb25WYWxpZCA9XG4gICAgIWhhc1BvaW50RXJyb3IoW2xvbiwgbGF0XSkgfHxcbiAgICBub3J0aGluZyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgZWFzdGluZyA9PT0gdW5kZWZpbmVkXG4gIGlmICgoaXNOb3J0aGluZ0ludmFsaWQgJiYgaXNFYXN0aW5nSW52YWxpZCkgfHwgIWlzTGF0TG9uVmFsaWQpIHtcbiAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSwgbWVzc2FnZTogJ0ludmFsaWQgVVRNL1VQUyBjb29yZGluYXRlcycgfVxuICB9XG4gIHJldHVybiBlcnJvclxufVxuZnVuY3Rpb24gdmFsaWRhdGVSYWRpdXNMaW5lQnVmZmVyKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIGNvbnN0IHBhcnNlZCA9IE51bWJlcih2YWx1ZS52YWx1ZSlcbiAgY29uc3QgYnVmZmVyID0gTnVtYmVyLmlzTmFOKHBhcnNlZCkgPyAwIDogcGFyc2VkXG4gIGNvbnN0IGJ1ZmZlck1ldGVycyA9IERpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VJbk1ldGVycyhidWZmZXIsIHZhbHVlLnVuaXRzKVxuICBpZiAoa2V5ID09PSAnbGluZVdpZHRoJyAmJiBidWZmZXJNZXRlcnMgPCBMSU5FX0JVRkZFUl9NSU5JTlVNX01FVEVSUykge1xuICAgIGNvbnN0IG1pbkRpc3RhbmNlID0gRGlzdGFuY2VVdGlscy5nZXREaXN0YW5jZUZyb21NZXRlcnMoXG4gICAgICBMSU5FX0JVRkZFUl9NSU5JTlVNX01FVEVSUyxcbiAgICAgIHZhbHVlLnVuaXRzXG4gICAgKVxuICAgIGNvbnN0IG1pbkRpc3RhbmNlRGlzcGxheSA9IE51bWJlci5pc0ludGVnZXIobWluRGlzdGFuY2UpXG4gICAgICA/IG1pbkRpc3RhbmNlLnRvU3RyaW5nKClcbiAgICAgIDogLy8gQWRkIDAuMDEgdG8gYWNjb3VudCBmb3IgZGVjaW1hbCBwbGFjZXMgYmV5b25kIGh1bmRyZWR0aHMuIEZvciBleGFtcGxlLCBpZlxuICAgICAgICAvLyB0aGUgc2VsZWN0ZWQgdW5pdCBpcyBmZWV0LCB0aGVuIHRoZSByZXF1aXJlZCB2YWx1ZSBpcyAyNDYuMDYzLCBhbmQgaWYgd2Ugb25seVxuICAgICAgICAvLyBzaG93ZWQgKDI0Ni4wNjMpLnRvRml4ZWQoMiksIHRoZW4gdGhlIHVzZXIgd291bGQgc2VlIDI0Ni4wNiwgYnV0IGlmIHRoZXkgdHlwZWRcbiAgICAgICAgLy8gdGhhdCBpbiwgdGhleSB3b3VsZCBzdGlsbCBiZSBzaG93biB0aGlzIGVycm9yLlxuICAgICAgICAobWluRGlzdGFuY2UgKyAwLjAxKS50b0ZpeGVkKDIpXG4gICAgcmV0dXJuIHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogYExpbmUgYnVmZmVyIG11c3QgYmUgYXQgbGVhc3QgJHttaW5EaXN0YW5jZURpc3BsYXl9ICR7dmFsdWUudW5pdHN9YCxcbiAgICB9XG4gIH1cblxuICBjb25zdCBsYWJlbCA9IGtleSA9PT0gJ3JhZGl1cycgPyAnUmFkaXVzICcgOiAnQnVmZmVyIHdpZHRoICdcbiAgaWYgKHZhbHVlLnZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGluaXRpYWxFcnJvclN0YXRlXG4gIH1cblxuICBpZiAoa2V5LmluY2x1ZGVzKCdXaWR0aCcpICYmIGJ1ZmZlck1ldGVycyA8IDEgJiYgYnVmZmVyTWV0ZXJzICE9PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgbGFiZWwgK1xuICAgICAgICAnbXVzdCBiZSAwLCBvciBhdCBsZWFzdCAnICtcbiAgICAgICAgRGlzdGFuY2VVdGlscy5nZXREaXN0YW5jZUZyb21NZXRlcnMoMSwgdmFsdWUudW5pdHMpLnRvUHJlY2lzaW9uKDIpICtcbiAgICAgICAgJyAnICtcbiAgICAgICAgdmFsdWUudW5pdHMsXG4gICAgfVxuICB9IGVsc2UgaWYgKGtleS5pbmNsdWRlcygncmFkaXVzJykgJiYgYnVmZmVyTWV0ZXJzIDwgMSkge1xuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6XG4gICAgICAgIGxhYmVsICtcbiAgICAgICAgJ211c3QgYmUgYXQgbGVhc3QgJyArXG4gICAgICAgIERpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VGcm9tTWV0ZXJzKDEsIHZhbHVlLnVuaXRzKS50b1ByZWNpc2lvbigyKSArXG4gICAgICAgICcgJyArXG4gICAgICAgIHZhbHVlLnVuaXRzLFxuICAgIH1cbiAgfVxuICByZXR1cm4gaW5pdGlhbEVycm9yU3RhdGVcbn1cbmNvbnN0IHZhbGlkYXRlRG1zSW5wdXQgPSAoaW5wdXQ6IGFueSwgcGxhY2VIb2xkZXI6IHN0cmluZykgPT4ge1xuICBpZiAoaW5wdXQgIT09IHVuZGVmaW5lZCAmJiBwbGFjZUhvbGRlciA9PT0gJ2RkwrBtbVxcJ3NzLnNcIicpIHtcbiAgICBjb25zdCBjb3JyZWN0ZWQgPSBnZXRDb3JyZWN0ZWREbXNMYXRJbnB1dChpbnB1dClcbiAgICByZXR1cm4geyBlcnJvcjogY29ycmVjdGVkICE9PSBpbnB1dCwgZGVmYXVsdFZhbHVlOiBjb3JyZWN0ZWQgfVxuICB9IGVsc2UgaWYgKGlucHV0ICE9PSB1bmRlZmluZWQgJiYgcGxhY2VIb2xkZXIgPT09ICdkZGTCsG1tXFwnc3Muc1wiJykge1xuICAgIGNvbnN0IGNvcnJlY3RlZCA9IGdldENvcnJlY3RlZERtc0xvbklucHV0KGlucHV0KVxuICAgIHJldHVybiB7IGVycm9yOiBjb3JyZWN0ZWQgIT09IGlucHV0LCBkZWZhdWx0VmFsdWU6IGNvcnJlY3RlZCB9XG4gIH1cbiAgcmV0dXJuIHsgZXJyb3I6IGZhbHNlIH1cbn1cbmNvbnN0IGxhdCA9IHtcbiAgZGVncmVlc0JlZ2luOiAwLFxuICBkZWdyZWVzRW5kOiAyLFxuICBtaW51dGVzQmVnaW46IDMsXG4gIG1pbnV0ZXNFbmQ6IDUsXG4gIHNlY29uZHNCZWdpbjogNixcbiAgc2Vjb25kc0VuZDogLTEsXG59XG5jb25zdCBsb24gPSB7XG4gIGRlZ3JlZXNCZWdpbjogMCxcbiAgZGVncmVlc0VuZDogMyxcbiAgbWludXRlc0JlZ2luOiA0LFxuICBtaW51dGVzRW5kOiA2LFxuICBzZWNvbmRzQmVnaW46IDcsXG4gIHNlY29uZHNFbmQ6IC0xLFxufVxuY29uc3QgZ2V0Q29ycmVjdGVkRG1zTGF0SW5wdXQgPSAoaW5wdXQ6IGFueSkgPT4ge1xuICBjb25zdCBkZWdyZWVzID0gaW5wdXQuc2xpY2UobGF0LmRlZ3JlZXNCZWdpbiwgbGF0LmRlZ3JlZXNFbmQpXG4gIGNvbnN0IG1pbnV0ZXMgPSBpbnB1dC5zbGljZShsYXQubWludXRlc0JlZ2luLCBsYXQubWludXRlc0VuZClcbiAgY29uc3Qgc2Vjb25kcyA9IGlucHV0LnNsaWNlKGxhdC5zZWNvbmRzQmVnaW4sIGxhdC5zZWNvbmRzRW5kKVxuICBjb25zdCBtYXhEbXNMYXQgPSAnOTDCsDAwXFwnMDBcIidcbiAgaWYgKGRlZ3JlZXMgPiA5MCkge1xuICAgIHJldHVybiBtYXhEbXNMYXRcbiAgfSBlbHNlIGlmIChtaW51dGVzID49IDYwKSB7XG4gICAgaWYgKGRlZ3JlZXMgPCA5MCkge1xuICAgICAgcmV0dXJuIChOdW1iZXIucGFyc2VJbnQoZGVncmVlcykgKyAxKS50b1N0cmluZygpICsgJ8KwMDBcXCcwMFwiJ1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF4RG1zTGF0XG4gICAgfVxuICB9IGVsc2UgaWYgKHNlY29uZHMgPj0gNjApIHtcbiAgICBpZiAobWludXRlcyA8IDU5KSB7XG4gICAgICByZXR1cm4gZGVncmVlcyArICfCsCcgKyAoTnVtYmVyLnBhcnNlSW50KG1pbnV0ZXMpICsgMSkudG9TdHJpbmcoKSArICdcXCcwMFwiJ1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZGVncmVlcyA+PSAnOTAnKSB7XG4gICAgICAgIHJldHVybiBtYXhEbXNMYXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoTnVtYmVyLnBhcnNlSW50KGRlZ3JlZXMpICsgMSkudG9TdHJpbmcoKSArICfCsDAwXFwnMDBcIidcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoXG4gICAgaW5wdXQuc2xpY2UobGF0LmRlZ3JlZXNCZWdpbiwgbGF0LmRlZ3JlZXNFbmQpID09PSAnOV8nICYmXG4gICAgaW5wdXQuc2xpY2UobGF0LmRlZ3JlZXNFbmQpID09PSAnwrAwMFxcJzAwXCInXG4gICkge1xuICAgIHJldHVybiAnOV/CsF9fXFwnX19cIidcbiAgfSBlbHNlIGlmIChcbiAgICBpbnB1dC5zbGljZShsYXQubWludXRlc0JlZ2luLCBsYXQubWludXRlc0VuZCkgPT09ICc2XycgJiZcbiAgICBpbnB1dC5zbGljZShsYXQubWludXRlc0VuZCkgPT09ICdcXCcwMFwiJ1xuICApIHtcbiAgICByZXR1cm4gaW5wdXQuc2xpY2UobGF0LmRlZ3JlZXNCZWdpbiwgbGF0LmRlZ3JlZXNFbmQpICsgJ8KwNl9cXCdfX1wiJ1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBpbnB1dFxuICB9XG59XG5jb25zdCBnZXRDb3JyZWN0ZWREbXNMb25JbnB1dCA9IChpbnB1dDogYW55KSA9PiB7XG4gIGNvbnN0IGRlZ3JlZXMgPSBpbnB1dC5zbGljZShsb24uZGVncmVlc0JlZ2luLCBsb24uZGVncmVlc0VuZClcbiAgY29uc3QgbWludXRlcyA9IGlucHV0LnNsaWNlKGxvbi5taW51dGVzQmVnaW4sIGxvbi5taW51dGVzRW5kKVxuICBjb25zdCBzZWNvbmRzID0gaW5wdXQuc2xpY2UobG9uLnNlY29uZHNCZWdpbiwgbG9uLnNlY29uZHNFbmQpXG4gIGNvbnN0IG1heERtc0xvbiA9ICcxODDCsDAwXFwnMDBcIidcbiAgaWYgKGRlZ3JlZXMgPiAxODApIHtcbiAgICByZXR1cm4gbWF4RG1zTG9uXG4gIH0gZWxzZSBpZiAobWludXRlcyA+PSA2MCkge1xuICAgIGlmIChkZWdyZWVzIDwgMTgwKSB7XG4gICAgICByZXR1cm4gKE51bWJlci5wYXJzZUludChkZWdyZWVzKSArIDEpLnRvU3RyaW5nKCkgKyAnwrAwMFxcJzAwXCInXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYXhEbXNMb25cbiAgICB9XG4gIH0gZWxzZSBpZiAoc2Vjb25kcyA+IDYwKSB7XG4gICAgaWYgKG1pbnV0ZXMgPCA1OSkge1xuICAgICAgcmV0dXJuIGRlZ3JlZXMgKyAnwrAnICsgKE51bWJlci5wYXJzZUludChtaW51dGVzKSArIDEpLnRvU3RyaW5nKCkgKyAnXFwnMDBcIidcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRlZ3JlZXMgPj0gJzE4MCcpIHtcbiAgICAgICAgcmV0dXJuIG1heERtc0xvblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChOdW1iZXIucGFyc2VJbnQoZGVncmVlcykgKyAxKS50b1N0cmluZygpICsgJ8KwMDBcXCcwMFwiJ1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChcbiAgICBpbnB1dC5zbGljZShsb24uZGVncmVlc0JlZ2luLCBsb24uZGVncmVlc0VuZCkgPT09ICcxOF8nICYmXG4gICAgaW5wdXQuc2xpY2UobG9uLmRlZ3JlZXNFbmQpID09PSAnwrAwMFxcJzAwXCInXG4gICkge1xuICAgIHJldHVybiAnMThfwrBfX1xcJ19fXCInXG4gIH0gZWxzZSBpZiAoXG4gICAgaW5wdXQuc2xpY2UobG9uLm1pbnV0ZXNCZWdpbiwgbG9uLm1pbnV0ZXNFbmQpID09PSAnNl8nICYmXG4gICAgaW5wdXQuc2xpY2UobG9uLm1pbnV0ZXNFbmQpID09PSAnXFwnMDBcIidcbiAgKSB7XG4gICAgcmV0dXJuIGlucHV0LnNsaWNlKGxvbi5kZWdyZWVzQmVnaW4sIGxvbi5kZWdyZWVzRW5kKSArICfCsDZfXFwnX19cIidcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gaW5wdXRcbiAgfVxufVxuZnVuY3Rpb24gZ2V0RGVmYXVsdGluZ0Vycm9yTWVzc2FnZShcbiAgdmFsdWU6IHN0cmluZyxcbiAgbGFiZWw6IHN0cmluZyxcbiAgZGVmYXVsdFZhbHVlOiBudW1iZXJcbikge1xuICByZXR1cm4gYCR7dmFsdWUucmVwbGFjZShcbiAgICAvXy9nLFxuICAgICcwJ1xuICApfSBpcyBub3QgYW4gYWNjZXB0YWJsZSAke2xhYmVsfSB2YWx1ZS4gRGVmYXVsdGluZyB0byAke2RlZmF1bHRWYWx1ZX1gXG59XG5mdW5jdGlvbiBnZXRFbXB0eUVycm9yTWVzc2FnZShsYWJlbDogc3RyaW5nKSB7XG4gIHJldHVybiBgJHtsYWJlbC5yZXBsYWNlKC9eXFx3LywgKGMpID0+IGMudG9VcHBlckNhc2UoKSl9IGNhbm5vdCBiZSBlbXB0eWBcbn1cbmNvbnN0IEludmFsaWQgPSBzdHlsZWQuZGl2YFxuICBib3JkZXI6IDFweCBzb2xpZCAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubmVnYXRpdmVDb2xvcn07XG4gIGhlaWdodDogMTAwJTtcbiAgZGlzcGxheTogYmxvY2s7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIGNvbG9yOiB3aGl0ZTtcbmBcbmNvbnN0IFdhcm5pbmdJY29uID0gc3R5bGVkLnNwYW5gXG4gIHBhZGRpbmc6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUubWluaW11bVNwYWNpbmd9O1xuYFxuIl19