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
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mt-g... Remove this comment to see the full error message
import mtgeo from 'mt-geo';
import * as usngs from 'usng.js';
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
var converter = new usngs.Converter();
var usngPrecision = 6;
import { validCoordinates } from '.';
import Common from '../../js/Common';
import { StartupDataStore } from '../../js/model/Startup/startup';
export var formatAttribute = function (_a) {
    var name = _a.name, value = _a.value;
    var definition = StartupDataStore.MetacardDefinitions.getAttributeMap()[name];
    if (definition === undefined) {
        return null;
    }
    var isDate = definition.type === 'DATE';
    var displayName = definition.alias || name;
    return "".concat(displayName.toUpperCase(), ": ").concat(isDate ? Common.getHumanReadableDateTime(value) : value);
};
var formatter = {
    degrees: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return "".concat(mtgeo.toLat(lat), " ").concat(mtgeo.toLon(lon));
    },
    decimal: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return decimalComponent({ lat: lat, lon: lon });
    },
    mgrs: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return lat > 84 || lat < -80
            ? 'In UPS Space'
            : converter.LLtoUSNG(lat, lon, usngPrecision);
    },
    utm: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return converter.LLtoUTMUPS(lat, lon);
    },
    wkt: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return "POINT (".concat(lon, " ").concat(lat, ")");
    },
};
export var formatCoordinates = function (_a) {
    var coordinates = _a.coordinates, format = _a.format;
    if (!(format in formatter)) {
        throw "Unrecognized coordinate format value [".concat(format, "]");
    }
    return validCoordinates(coordinates)
        ? formatter[format](coordinates)
        : undefined;
};
var decimalComponent = function (_a) {
    var lat = _a.lat, lon = _a.lon;
    var numPlaces = 6;
    var latPadding = numPlaces + 4;
    var lonPadding = numPlaces + 5;
    var formattedLat = lat
        .toFixed(numPlaces)
        .toString()
        .padStart(latPadding, ' ');
    var formattedLon = lon
        .toFixed(numPlaces)
        .toString()
        .padStart(lonPadding, ' ');
    return "".concat(formattedLat, " ").concat(formattedLon);
};
//# sourceMappingURL=formatting.js.map