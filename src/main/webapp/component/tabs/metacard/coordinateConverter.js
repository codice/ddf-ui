import { TypedUserInstance } from '../../singletons/TypedUser';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mt-g... Remove this comment to see the full error message
import mtgeo from 'mt-geo';
import * as usngs from 'usng.js';
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
var converter = new usngs.Converter();
var usngPrecision = 6;
/**
 * Converts wkt to the user's preferred coordinate format.
 * Falls back to the wkt if the conversion fails.
 */
export var convertWktToPreferredCoordFormat = function (wkt) {
    var coords = wkt.split(/\s/g);
    if (coords.length !== 2) {
        return wkt;
    }
    // must be in number format for LLtoUTMUPS converter
    var lon = parseFloat(coords[0]);
    var lat = parseFloat(coords[1]);
    if (isNaN(lon) || isNaN(lat)) {
        return wkt;
    }
    else {
        return convertCoordsToPreferred(lat, lon);
    }
};
/**
 * Converts coordinates from lat lon to a single string in
 * the user's preferred format
 */
export var convertCoordsToPreferred = function (lat, lon) {
    var coordFormat = TypedUserInstance.getCoordinateFormat();
    try {
        switch (coordFormat) {
            case 'degrees':
                return "".concat(mtgeo.toLat(lat), " ").concat(mtgeo.toLon(lon));
            case 'decimal':
                return "".concat(lat, " ").concat(lon);
            case 'mgrs':
                return converter.LLtoMGRSUPS(lat, lon, usngPrecision);
            case 'utm':
                return converter.LLtoUTMUPS(lat, lon);
            case 'wkt':
            default:
                return "".concat(lon, " ").concat(lat);
        }
    }
    catch (e) {
        return "".concat(lon, " ").concat(lat);
    }
};
//# sourceMappingURL=coordinateConverter.js.map