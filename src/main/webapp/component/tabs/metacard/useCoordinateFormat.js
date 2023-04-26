import { __read } from "tslib";
import { useState, useEffect } from 'react';
import { convertWktToPreferredCoordFormat } from './coordinateConverter';
import { useBackbone } from '../../selection-checkbox/useBackbone.hook';
import user from '../../singletons/user-instance';
var FLOATING_POINT_PAIR_REGEX = /[-+]?\d*\.?\d+\s[-+]?\d*\.?\d+/g;
/**
 * Returns a function responsible for converting wkts to the user's preferred
 * coordinate format
 */
var conversionHigherOrderFunction = function () { return function (value) {
    return value.replace(FLOATING_POINT_PAIR_REGEX, convertWktToPreferredCoordFormat);
}; };
/**
 * Provides a hook for converting wkts to the user's preferred
 * coordinate format
 */
var useCoordinateFormat = function () {
    var _a = __read(useState(conversionHigherOrderFunction), 2), convert = _a[0], setConverter = _a[1];
    var listenTo = useBackbone().listenTo;
    useEffect(function () {
        var callback = function () { return setConverter(conversionHigherOrderFunction); };
        listenTo(user.get('user').get('preferences'), 'change:coordinateFormat', callback);
    }, []);
    return convert;
};
export default useCoordinateFormat;
//# sourceMappingURL=useCoordinateFormat.js.map