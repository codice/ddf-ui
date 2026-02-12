import { __assign, __read, __spreadArray } from "tslib";
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
import { useState, useEffect } from 'react';
import { ErrorComponent, validateGeo, initialErrorState, } from '../utils/validation';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { validateUsngLineOrPoly, validateDmsLineOrPoly, validateUtmUpsLineOrPoly, } from './validators';
import DmsTextField from './dms-textfield';
import UtmupsTextField from './utmups-textfield';
import { Units } from './common';
import TextField from '../text-field';
import { Radio, RadioItem } from '../radio/radio';
import { MinimumSpacing } from './common';
import _ from 'underscore';
var coordinatePairRegex = /-?\d{1,3}(\.\d*)?\s-?\d{1,3}(\.\d*)?/g;
function buildWktString(coordinates) {
    return '[[' + coordinates.join('],[') + ']]';
}
function convertWktString(value) {
    if (value.includes('MULTI')) {
        return convertMultiWkt(value.includes('POLYGON'), value);
    }
    else if (value.includes('POLYGON') && value.endsWith('))')) {
        return convertWkt(value, 4);
    }
    else if (value.includes('LINESTRING') && value.endsWith(')')) {
        return convertWkt(value, 2);
    }
    return value;
}
function convertWkt(value, numCoords) {
    var coordinatePairs = value.match(coordinatePairRegex);
    if (!coordinatePairs || coordinatePairs.length < numCoords) {
        return value;
    }
    var coordinates = coordinatePairs.map(function (coord) {
        return coord.replace(' ', ',');
    });
    return buildWktString(coordinates);
}
function convertMultiWkt(isPolygon, value) {
    if (isPolygon && !value.endsWith(')))')) {
        return value;
    }
    else if (!value.endsWith('))')) {
        return value;
    }
    var splitter = isPolygon ? '))' : ')';
    var numPoints = isPolygon ? 4 : 2;
    var shapes = value
        .split(splitter)
        .map(function (shape) { return shape.match(coordinatePairRegex); });
    shapes = shapes
        .filter(function (shape) { return shape !== null && shape.length >= numPoints; })
        .map(function (shape) {
        return shape.map(function (coordinatePair) { return coordinatePair.replace(' ', ','); });
    });
    return shapes.length === 0
        ? value
        : shapes.length === 1
            ? buildWktString(shapes[0])
            : '[' + shapes.map(function (shapeCoords) { return buildWktString(shapeCoords); }) + ']';
}
function getPolygonValue(currentValue, value) {
    // if current value's 1st coord is different
    // from value's first coord, then delete value's last coord
    try {
        var parsedValue = JSON.parse(value);
        var parsedCurrentValue = JSON.parse(currentValue);
        if (Array.isArray(parsedValue) &&
            Array.isArray(parsedCurrentValue) &&
            !_.isEqual(parsedValue[0], parsedCurrentValue[0])) {
            parsedValue.splice(-1, 1);
            return JSON.stringify(parsedValue);
        }
        else {
            return value;
        }
    }
    catch (e) {
        return value;
    }
}
var clearValidationResults = function (errorListener) {
    errorListener &&
        errorListener({
            line: undefined,
            buffer: undefined,
        });
};
var LineLatLon = function (props) {
    var label = props.label, geometryKey = props.geometryKey, setState = props.setState, setBufferState = props.setBufferState, unitKey = props.unitKey, widthKey = props.widthKey, mode = props.mode, polyType = props.polyType, errorListener = props.errorListener;
    var _a = __read(useState(JSON.stringify(props[geometryKey])), 2), currentValue = _a[0], setCurrentValue = _a[1];
    var _b = __read(useState(initialErrorState), 2), baseLineError = _b[0], setBaseLineError = _b[1];
    var _c = __read(useState(initialErrorState), 2), bufferError = _c[0], setBufferError = _c[1];
    useEffect(function () {
        var geometryKey = props.geometryKey;
        var newValue = typeof props[geometryKey] === 'string'
            ? props[geometryKey]
            : JSON.stringify(props[geometryKey]);
        setCurrentValue(newValue);
        if (props.drawing) {
            setBaseLineError(initialErrorState);
            setBufferError(initialErrorState);
        }
        else {
            var lineValidationResult = validateGeo(mode || polyType, newValue);
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setBaseLineError(lineValidationResult || initialErrorState);
            var bufferValidationResult = validateGeo(widthKey, {
                value: props[widthKey],
                units: props[unitKey],
            });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setBufferError(bufferValidationResult || initialErrorState);
            errorListener &&
                errorListener({
                    line: lineValidationResult,
                    buffer: bufferValidationResult,
                });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [
        props.polygon,
        props.line,
        props.lineWidth,
        props.bufferWidth,
        props.polygonBufferWidth,
        props.lineUnits,
        props.polygonBufferUnits,
    ]);
    return (_jsx("div", { children: _jsxs("div", { className: "input-location flex flex-col flex-nowrap space-y-2", children: [_jsx(TextField
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: any; value: string; onChange: (valu... Remove this comment to see the full error message
                , { 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: any; value: string; onChange: (valu... Remove this comment to see the full error message
                    label: label, value: currentValue, onChange: function (value) {
                        var _a, _b;
                        value = convertWktString(value.trim());
                        if (geometryKey.includes('poly')) {
                            value = getPolygonValue(currentValue, value);
                        }
                        setCurrentValue(value);
                        try {
                            setState((_a = {}, _a[geometryKey] = JSON.parse(value), _a));
                        }
                        catch (e) {
                            // Set state with invalid value to trigger error messaging
                            setState((_b = {}, _b[geometryKey] = value, _b));
                        }
                    } }), _jsx(ErrorComponent, { errorState: baseLineError }), _jsx(Units, { value: props[unitKey], onChange: function (value) {
                        var _a;
                        typeof setBufferState === 'function'
                            ? setBufferState(unitKey, value)
                            : setState((_a = {}, _a[unitKey] = value, _a));
                    }, children: _jsx(TextField
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                    , { 
                        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                        type: "number", label: "Buffer width", value: String(props[widthKey]), onChange: function (value) {
                            var _a;
                            typeof setBufferState === 'function'
                                ? setBufferState(widthKey, value)
                                : setState((_a = {}, _a[widthKey] = value, _a));
                        } }) }), _jsx(ErrorComponent, { errorState: bufferError })] }) }));
};
var LineDms = function (props) {
    var geometryKey = props.geometryKey, dmsPointArray = props.dmsPointArray, setState = props.setState, unitKey = props.unitKey, setBufferState = props.setBufferState, widthKey = props.widthKey, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorState), 2), baseLineError = _a[0], setBaseLineError = _a[1];
    var _b = __read(useState(initialErrorState), 2), bufferError = _b[0], setBufferError = _b[1];
    useEffect(function () {
        if (props.drawing) {
            setBaseLineError(initialErrorState);
            setBufferError(initialErrorState);
        }
        else {
            var lineValidationResult = validateDmsLineOrPoly(dmsPointArray, geometryKey);
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setBaseLineError(lineValidationResult || initialErrorState);
            var bufferValidationResult = validateGeo(widthKey, {
                value: props[widthKey],
                units: props[unitKey],
            });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setBufferError(bufferValidationResult || initialErrorState);
            errorListener &&
                errorListener({
                    line: lineValidationResult,
                    buffer: bufferValidationResult,
                });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [
        props.polygon,
        props.line,
        dmsPointArray,
        props.lineWidth,
        props.bufferWidth,
        props.polygonBufferWidth,
        props.lineUnits,
        props.polygonBufferUnits,
    ]);
    return (_jsxs("div", { children: [_jsx("div", { className: "input-location flex flex-col flex-nowrap space-y-2", children: dmsPointArray &&
                    dmsPointArray.map(function (point, index) {
                        return (_jsxs("div", { children: [_jsx(DmsTextField, { point: point, setPoint: function (point) {
                                        var _a;
                                        var array = __spreadArray([], __read(dmsPointArray), false);
                                        array.splice(index, 1, point);
                                        setState((_a = {}, _a['dmsPointArray'] = array, _a));
                                    }, deletePoint: function () {
                                        var _a;
                                        var array = __spreadArray([], __read(dmsPointArray), false);
                                        array.splice(index, 1);
                                        setState((_a = {}, _a['dmsPointArray'] = array, _a));
                                    } }), _jsx(MinimumSpacing, {})] }, 'point-' + index));
                    }) }), _jsx(Button, { fullWidth: true, onClick: function () {
                    var _a;
                    var array = dmsPointArray ? __spreadArray([], __read(dmsPointArray), false) : [];
                    array.push({
                        lat: '',
                        lon: '',
                        latDirection: 'N',
                        lonDirection: 'E',
                    });
                    setState((_a = {}, _a['dmsPointArray'] = array, _a));
                }, children: "Add Point" }), _jsx(ErrorComponent, { errorState: baseLineError }), _jsx(Units, { value: props[unitKey], onChange: function (value) {
                    var _a;
                    typeof setBufferState === 'function'
                        ? setBufferState(unitKey, value)
                        : setState((_a = {}, _a[unitKey] = value, _a));
                }, children: _jsx(TextField
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                , { 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                    type: "number", label: "Buffer width", value: String(props[widthKey]), onChange: function (value) {
                        var _a;
                        typeof setBufferState === 'function'
                            ? setBufferState(widthKey, value)
                            : setState((_a = {}, _a[widthKey] = value, _a));
                    } }) }), _jsx(ErrorComponent, { errorState: bufferError })] }));
};
var LineMgrs = function (props) {
    var geometryKey = props.geometryKey, usngPointArray = props.usngPointArray, setState = props.setState, unitKey = props.unitKey, setBufferState = props.setBufferState, widthKey = props.widthKey, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorState), 2), baseLineError = _a[0], setBaseLineError = _a[1];
    var _b = __read(useState(initialErrorState), 2), bufferError = _b[0], setBufferError = _b[1];
    useEffect(function () {
        if (props.drawing) {
            setBaseLineError(initialErrorState);
            setBufferError(initialErrorState);
        }
        else {
            var lineValidationResult = validateUsngLineOrPoly(usngPointArray, geometryKey);
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setBaseLineError(lineValidationResult || initialErrorState);
            var bufferValidationResult = validateGeo(widthKey, {
                value: props[widthKey],
                units: props[unitKey],
            });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setBufferError(bufferValidationResult || initialErrorState);
            errorListener &&
                errorListener({
                    line: lineValidationResult,
                    buffer: bufferValidationResult,
                });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [
        props.polygon,
        props.line,
        usngPointArray,
        props.lineWidth,
        props.bufferWidth,
        props.polygonBufferWidth,
        props.lineUnits,
        props.polygonBufferUnits,
    ]);
    return (_jsx("div", { children: _jsxs("div", { className: "input-location flex flex-col flex-nowrap space-y-2", children: [usngPointArray &&
                    usngPointArray.map(function (coord, index) {
                        return (_jsx(TextField, { 
                            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ key: string; label: string; value: any; on... Remove this comment to see the full error message
                            label: "Grid", value: coord, onChange: function (value) {
                                var _a;
                                var points = __spreadArray([], __read(usngPointArray), false);
                                points.splice(index, 1, value);
                                setState((_a = {}, _a['usngPointArray'] = points, _a));
                            }, addon: _jsx(Button, { onClick: function () {
                                    var _a;
                                    var points = __spreadArray([], __read(usngPointArray), false);
                                    points.splice(index, 1);
                                    setState((_a = {}, _a['usngPointArray'] = points, _a));
                                }, children: _jsx(CloseIcon, {}) }) }, 'grid-' + index));
                    }), _jsx(Button, { fullWidth: true, onClick: function () {
                        var _a;
                        var points = usngPointArray ? __spreadArray([], __read(usngPointArray), false) : [];
                        points.push('');
                        setState((_a = {}, _a['usngPointArray'] = points, _a));
                    }, children: "Add Point" }), _jsx(ErrorComponent, { errorState: baseLineError }), _jsx(Units, { value: props[unitKey], onChange: function (value) {
                        var _a;
                        typeof setBufferState === 'function'
                            ? setBufferState(unitKey, value)
                            : setState((_a = {}, _a[unitKey] = value, _a));
                    }, children: _jsx(TextField
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                    , { 
                        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                        type: "number", label: "Buffer width", value: String(props[widthKey]), onChange: function (value) {
                            var _a;
                            typeof setBufferState === 'function'
                                ? setBufferState(widthKey, value)
                                : setState((_a = {}, _a[widthKey] = value, _a));
                        } }) }), _jsx(ErrorComponent, { errorState: bufferError })] }) }));
};
var LineUtmUps = function (props) {
    var geometryKey = props.geometryKey, utmUpsPointArray = props.utmUpsPointArray, setState = props.setState, unitKey = props.unitKey, setBufferState = props.setBufferState, widthKey = props.widthKey, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorState), 2), baseLineError = _a[0], setBaseLineError = _a[1];
    var _b = __read(useState(initialErrorState), 2), bufferError = _b[0], setBufferError = _b[1];
    useEffect(function () {
        if (props.drawing) {
            setBaseLineError(initialErrorState);
            setBufferError(initialErrorState);
        }
        else {
            var lineValidationResult = validateUtmUpsLineOrPoly(utmUpsPointArray, geometryKey);
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setBaseLineError(lineValidationResult || initialErrorState);
            var bufferValidationResult = validateGeo(widthKey, {
                value: props[widthKey],
                units: props[unitKey],
            });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setBufferError(bufferValidationResult || initialErrorState);
            errorListener &&
                errorListener({
                    line: lineValidationResult,
                    buffer: bufferValidationResult,
                });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [
        props.polygon,
        props.line,
        utmUpsPointArray,
        props.lineWidth,
        props.bufferWidth,
        props.polygonBufferWidth,
        props.lineUnits,
        props.polygonBufferUnits,
    ]);
    return (_jsxs("div", { className: "flex flex-col flex-nowrap space-y-2", children: [utmUpsPointArray &&
                utmUpsPointArray.map(function (point, index) {
                    return (_jsxs("div", { children: [_jsx(UtmupsTextField, { point: point, setPoint: function (point) {
                                    var _a;
                                    var points = __spreadArray([], __read(utmUpsPointArray), false);
                                    points.splice(index, 1, point);
                                    setState((_a = {}, _a['utmUpsPointArray'] = points, _a));
                                }, deletePoint: function () {
                                    var _a;
                                    var points = __spreadArray([], __read(utmUpsPointArray), false);
                                    points.splice(index, 1);
                                    setState((_a = {}, _a['utmUpsPointArray'] = points, _a));
                                } }), _jsx(MinimumSpacing, {})] }, index));
                }), _jsx(Button, { fullWidth: true, onClick: function () {
                    var _a;
                    var points = utmUpsPointArray ? __spreadArray([], __read(utmUpsPointArray), false) : [];
                    points.push({
                        easting: '',
                        hemisphere: 'Northern',
                        northing: '',
                        zoneNumber: 0,
                    });
                    setState((_a = {}, _a['utmUpsPointArray'] = points, _a));
                }, children: "Add Point" }), _jsx(ErrorComponent, { errorState: baseLineError }), _jsx(Units, { value: props[unitKey], onChange: function (value) {
                    var _a;
                    typeof setBufferState === 'function'
                        ? setBufferState(unitKey, value)
                        : setState((_a = {}, _a[unitKey] = value, _a));
                }, children: _jsx(TextField
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                , { 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                    type: "number", label: "Buffer width", value: String(props[widthKey]), onChange: function (value) {
                        var _a;
                        typeof setBufferState === 'function'
                            ? setBufferState(widthKey, value)
                            : setState((_a = {}, _a[widthKey] = value, _a));
                    } }) }), _jsx(ErrorComponent, { errorState: bufferError })] }));
};
var BaseLine = function (props) {
    var setState = props.setState, locationType = props.locationType;
    var inputs = {
        usng: LineMgrs,
        dd: LineLatLon,
        dms: LineDms,
        utmups: LineUtmUps,
    };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var Component = inputs[locationType] || null;
    return (_jsxs("div", { children: [_jsxs(Radio, { value: locationType, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['locationType'] = value, _a));
                }, children: [_jsx(RadioItem, { value: "dd", children: "Lat/Lon (DD)" }), _jsx(RadioItem, { value: "dms", children: "Lat/Lon (DMS)" }), _jsx(RadioItem, { value: "usng", children: "USNG / MGRS" }), _jsx(RadioItem, { value: "utmups", children: "UTM / UPS" })] }), _jsx(MinimumSpacing, {}), Component !== null ? _jsx(Component, __assign({}, props)) : null] }));
};
export default BaseLine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5saW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9iYXNlLmxpbmUudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQzNDLE9BQU8sRUFDTCxjQUFjLEVBQ2QsV0FBVyxFQUNYLGlCQUFpQixHQUNsQixNQUFNLHFCQUFxQixDQUFBO0FBQzVCLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sU0FBUyxNQUFNLDJCQUEyQixDQUFBO0FBQ2pELE9BQU8sRUFDTCxzQkFBc0IsRUFDdEIscUJBQXFCLEVBQ3JCLHdCQUF3QixHQUN6QixNQUFNLGNBQWMsQ0FBQTtBQUNyQixPQUFPLFlBQVksTUFBTSxpQkFBaUIsQ0FBQTtBQUMxQyxPQUFPLGVBQWUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNoRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2hDLE9BQU8sU0FBUyxNQUFNLGVBQWUsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ2pELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFDekMsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBRTFCLElBQU0sbUJBQW1CLEdBQUcsdUNBQXVDLENBQUE7QUFFbkUsU0FBUyxjQUFjLENBQUMsV0FBZ0I7SUFDdEMsT0FBTyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDOUMsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsS0FBVTtJQUNsQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FB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LElBQU0sUUFBUSxHQUFHLFVBQUMsS0FBVTtJQUNsQixJQUFBLFFBQVEsR0FBbUIsS0FBSyxTQUF4QixFQUFFLFlBQVksR0FBSyxLQUFLLGFBQVYsQ0FBVTtJQUV4QyxJQUFNLE1BQU0sR0FBRztRQUNiLElBQUksRUFBRSxRQUFRO1FBQ2QsRUFBRSxFQUFFLFVBQVU7UUFDZCxHQUFHLEVBQUUsT0FBTztRQUNaLE1BQU0sRUFBRSxVQUFVO0tBQ25CLENBQUE7SUFFRCxtSkFBbUo7SUFDbkosSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksQ0FBQTtJQUU5QyxPQUFPLENBQ0wsMEJBQ0UsTUFBQyxLQUFLLElBQ0osS0FBSyxFQUFFLFlBQVksRUFDbkIsUUFBUSxFQUFFLFVBQUMsS0FBVTs7b0JBQUssT0FBQSxRQUFRLFdBQUcsR0FBQyxjQUFjLElBQUcsS0FBSyxNQUFHO2dCQUFyQyxDQUFxQyxhQUUvRCxLQUFDLFNBQVMsSUFBQyxLQUFLLEVBQUMsSUFBSSw2QkFBeUIsRUFDOUMsS0FBQyxTQUFTLElBQUMsS0FBSyxFQUFDLEtBQUssOEJBQTBCLEVBQ2hELEtBQUMsU0FBUyxJQUFDLEtBQUssRUFBQyxNQUFNLDRCQUF3QixFQUMvQyxLQUFDLFNBQVMsSUFBQyxLQUFLLEVBQUMsUUFBUSwwQkFBc0IsSUFDekMsRUFDUixLQUFDLGNBQWMsS0FBRyxFQUNqQixTQUFTLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFDLFNBQVMsZUFBSyxLQUFLLEVBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUNqRCxDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFFBQVEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgRXJyb3JDb21wb25lbnQsXG4gIHZhbGlkYXRlR2VvLFxuICBpbml0aWFsRXJyb3JTdGF0ZSxcbn0gZnJvbSAnLi4vdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgQ2xvc2VJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2xvc2UnXG5pbXBvcnQge1xuICB2YWxpZGF0ZVVzbmdMaW5lT3JQb2x5LFxuICB2YWxpZGF0ZURtc0xpbmVPclBvbHksXG4gIHZhbGlkYXRlVXRtVXBzTGluZU9yUG9seSxcbn0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IERtc1RleHRGaWVsZCBmcm9tICcuL2Rtcy10ZXh0ZmllbGQnXG5pbXBvcnQgVXRtdXBzVGV4dEZpZWxkIGZyb20gJy4vdXRtdXBzLXRleHRmaWVsZCdcbmltcG9ydCB7IFVuaXRzIH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJy4uL3RleHQtZmllbGQnXG5pbXBvcnQgeyBSYWRpbywgUmFkaW9JdGVtIH0gZnJvbSAnLi4vcmFkaW8vcmFkaW8nXG5pbXBvcnQgeyBNaW5pbXVtU3BhY2luZyB9IGZyb20gJy4vY29tbW9uJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcblxuY29uc3QgY29vcmRpbmF0ZVBhaXJSZWdleCA9IC8tP1xcZHsxLDN9KFxcLlxcZCopP1xccy0/XFxkezEsM30oXFwuXFxkKik/L2dcblxuZnVuY3Rpb24gYnVpbGRXa3RTdHJpbmcoY29vcmRpbmF0ZXM6IGFueSkge1xuICByZXR1cm4gJ1tbJyArIGNvb3JkaW5hdGVzLmpvaW4oJ10sWycpICsgJ11dJ1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0V2t0U3RyaW5nKHZhbHVlOiBhbnkpIHtcbiAgaWYgKHZhbHVlLmluY2x1ZGVzKCdNVUxUSScpKSB7XG4gICAgcmV0dXJuIGNvbnZlcnRNdWx0aVdrdCh2YWx1ZS5pbmNsdWRlcygnUE9MWUdPTicpLCB2YWx1ZSlcbiAgfSBlbHNlIGlmICh2YWx1ZS5pbmNsdWRlcygnUE9MWUdPTicpICYmIHZhbHVlLmVuZHNXaXRoKCcpKScpKSB7XG4gICAgcmV0dXJuIGNvbnZlcnRXa3QodmFsdWUsIDQpXG4gIH0gZWxzZSBpZiAodmFsdWUuaW5jbHVkZXMoJ0xJTkVTVFJJTkcnKSAmJiB2YWx1ZS5lbmRzV2l0aCgnKScpKSB7XG4gICAgcmV0dXJuIGNvbnZlcnRXa3QodmFsdWUsIDIpXG4gIH1cbiAgcmV0dXJuIHZhbHVlXG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRXa3QodmFsdWU6IGFueSwgbnVtQ29vcmRzOiBhbnkpIHtcbiAgY29uc3QgY29vcmRpbmF0ZVBhaXJzID0gdmFsdWUubWF0Y2goY29vcmRpbmF0ZVBhaXJSZWdleClcbiAgaWYgKCFjb29yZGluYXRlUGFpcnMgfHwgY29vcmRpbmF0ZVBhaXJzLmxlbmd0aCA8IG51bUNvb3Jkcykge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGNvbnN0IGNvb3JkaW5hdGVzID0gY29vcmRpbmF0ZVBhaXJzLm1hcCgoY29vcmQ6IGFueSkgPT5cbiAgICBjb29yZC5yZXBsYWNlKCcgJywgJywnKVxuICApXG4gIHJldHVybiBidWlsZFdrdFN0cmluZyhjb29yZGluYXRlcylcbn1cblxuZnVuY3Rpb24gY29udmVydE11bHRpV2t0KGlzUG9seWdvbjogYW55LCB2YWx1ZTogYW55KSB7XG4gIGlmIChpc1BvbHlnb24gJiYgIXZhbHVlLmVuZHNXaXRoKCcpKSknKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9IGVsc2UgaWYgKCF2YWx1ZS5lbmRzV2l0aCgnKSknKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGNvbnN0IHNwbGl0dGVyID0gaXNQb2x5Z29uID8gJykpJyA6ICcpJ1xuICBjb25zdCBudW1Qb2ludHMgPSBpc1BvbHlnb24gPyA0IDogMlxuICBsZXQgc2hhcGVzID0gdmFsdWVcbiAgICAuc3BsaXQoc3BsaXR0ZXIpXG4gICAgLm1hcCgoc2hhcGU6IGFueSkgPT4gc2hhcGUubWF0Y2goY29vcmRpbmF0ZVBhaXJSZWdleCkpXG4gIHNoYXBlcyA9IHNoYXBlc1xuICAgIC5maWx0ZXIoKHNoYXBlOiBhbnkpID0+IHNoYXBlICE9PSBudWxsICYmIHNoYXBlLmxlbmd0aCA+PSBudW1Qb2ludHMpXG4gICAgLm1hcCgoc2hhcGU6IGFueSkgPT5cbiAgICAgIHNoYXBlLm1hcCgoY29vcmRpbmF0ZVBhaXI6IGFueSkgPT4gY29vcmRpbmF0ZVBhaXIucmVwbGFjZSgnICcsICcsJykpXG4gICAgKVxuICByZXR1cm4gc2hhcGVzLmxlbmd0aCA9PT0gMFxuICAgID8gdmFsdWVcbiAgICA6IHNoYXBlcy5sZW5ndGggPT09IDFcbiAgICA/IGJ1aWxkV2t0U3RyaW5nKHNoYXBlc1swXSlcbiAgICA6ICdbJyArIHNoYXBlcy5tYXAoKHNoYXBlQ29vcmRzOiBhbnkpID0+IGJ1aWxkV2t0U3RyaW5nKHNoYXBlQ29vcmRzKSkgKyAnXSdcbn1cblxuZnVuY3Rpb24gZ2V0UG9seWdvblZhbHVlKGN1cnJlbnRWYWx1ZTogYW55LCB2YWx1ZTogYW55KSB7XG4gIC8vIGlmIGN1cnJlbnQgdmFsdWUncyAxc3QgY29vcmQgaXMgZGlmZmVyZW50XG4gIC8vIGZyb20gdmFsdWUncyBmaXJzdCBjb29yZCwgdGhlbiBkZWxldGUgdmFsdWUncyBsYXN0IGNvb3JkXG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkVmFsdWUgPSBKU09OLnBhcnNlKHZhbHVlKVxuICAgIGNvbnN0IHBhcnNlZEN1cnJlbnRWYWx1ZSA9IEpTT04ucGFyc2UoY3VycmVudFZhbHVlKVxuICAgIGlmIChcbiAgICAgIEFycmF5LmlzQXJyYXkocGFyc2VkVmFsdWUpICYmXG4gICAgICBBcnJheS5pc0FycmF5KHBhcnNlZEN1cnJlbnRWYWx1ZSkgJiZcbiAgICAgICFfLmlzRXF1YWwocGFyc2VkVmFsdWVbMF0sIHBhcnNlZEN1cnJlbnRWYWx1ZVswXSlcbiAgICApIHtcbiAgICAgIHBhcnNlZFZhbHVlLnNwbGljZSgtMSwgMSlcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwYXJzZWRWYWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cbn1cblxuY29uc3QgY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyA9IChlcnJvckxpc3RlbmVyPzogYW55KSA9PiB7XG4gIGVycm9yTGlzdGVuZXIgJiZcbiAgICBlcnJvckxpc3RlbmVyKHtcbiAgICAgIGxpbmU6IHVuZGVmaW5lZCxcbiAgICAgIGJ1ZmZlcjogdW5kZWZpbmVkLFxuICAgIH0pXG59XG5cbmNvbnN0IExpbmVMYXRMb24gPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7XG4gICAgbGFiZWwsXG4gICAgZ2VvbWV0cnlLZXksXG4gICAgc2V0U3RhdGUsXG4gICAgc2V0QnVmZmVyU3RhdGUsXG4gICAgdW5pdEtleSxcbiAgICB3aWR0aEtleSxcbiAgICBtb2RlLFxuICAgIHBvbHlUeXBlLFxuICAgIGVycm9yTGlzdGVuZXIsXG4gIH0gPSBwcm9wc1xuICBjb25zdCBbY3VycmVudFZhbHVlLCBzZXRDdXJyZW50VmFsdWVdID0gdXNlU3RhdGUoXG4gICAgSlNPTi5zdHJpbmdpZnkocHJvcHNbZ2VvbWV0cnlLZXldKVxuICApXG4gIGNvbnN0IFtiYXNlTGluZUVycm9yLCBzZXRCYXNlTGluZUVycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuICBjb25zdCBbYnVmZmVyRXJyb3IsIHNldEJ1ZmZlckVycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgeyBnZW9tZXRyeUtleSB9ID0gcHJvcHNcbiAgICBjb25zdCBuZXdWYWx1ZSA9XG4gICAgICB0eXBlb2YgcHJvcHNbZ2VvbWV0cnlLZXldID09PSAnc3RyaW5nJ1xuICAgICAgICA/IHByb3BzW2dlb21ldHJ5S2V5XVxuICAgICAgICA6IEpTT04uc3RyaW5naWZ5KHByb3BzW2dlb21ldHJ5S2V5XSlcbiAgICBzZXRDdXJyZW50VmFsdWUobmV3VmFsdWUpXG4gICAgaWYgKHByb3BzLmRyYXdpbmcpIHtcbiAgICAgIHNldEJhc2VMaW5lRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBzZXRCdWZmZXJFcnJvcihpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbGluZVZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0ZUdlbyhtb2RlIHx8IHBvbHlUeXBlLCBuZXdWYWx1ZSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0QmFzZUxpbmVFcnJvcihsaW5lVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGNvbnN0IGJ1ZmZlclZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0ZUdlbyh3aWR0aEtleSwge1xuICAgICAgICB2YWx1ZTogcHJvcHNbd2lkdGhLZXldLFxuICAgICAgICB1bml0czogcHJvcHNbdW5pdEtleV0sXG4gICAgICB9KVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICd7IGVycm9yOiBib29sZWFuOyBtZXNzYWdlOiBzdHJpbi4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXRCdWZmZXJFcnJvcihidWZmZXJWYWxpZGF0aW9uUmVzdWx0IHx8IGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgZXJyb3JMaXN0ZW5lciAmJlxuICAgICAgICBlcnJvckxpc3RlbmVyKHtcbiAgICAgICAgICBsaW5lOiBsaW5lVmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgICBidWZmZXI6IGJ1ZmZlclZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiBjbGVhclZhbGlkYXRpb25SZXN1bHRzKGVycm9yTGlzdGVuZXIpXG4gIH0sIFtcbiAgICBwcm9wcy5wb2x5Z29uLFxuICAgIHByb3BzLmxpbmUsXG4gICAgcHJvcHMubGluZVdpZHRoLFxuICAgIHByb3BzLmJ1ZmZlcldpZHRoLFxuICAgIHByb3BzLnBvbHlnb25CdWZmZXJXaWR0aCxcbiAgICBwcm9wcy5saW5lVW5pdHMsXG4gICAgcHJvcHMucG9seWdvbkJ1ZmZlclVuaXRzLFxuICBdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5wdXQtbG9jYXRpb24gZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBzcGFjZS15LTJcIj5cbiAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyBsYWJlbDogYW55OyB2YWx1ZTogc3RyaW5nOyBvbkNoYW5nZTogKHZhbHUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIGxhYmVsPXtsYWJlbH1cbiAgICAgICAgICB2YWx1ZT17Y3VycmVudFZhbHVlfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHZhbHVlID0gY29udmVydFdrdFN0cmluZyh2YWx1ZS50cmltKCkpXG4gICAgICAgICAgICBpZiAoZ2VvbWV0cnlLZXkuaW5jbHVkZXMoJ3BvbHknKSkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IGdldFBvbHlnb25WYWx1ZShjdXJyZW50VmFsdWUsIHZhbHVlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0Q3VycmVudFZhbHVlKHZhbHVlKVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgc2V0U3RhdGUoeyBbZ2VvbWV0cnlLZXldOiBKU09OLnBhcnNlKHZhbHVlKSB9KVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAvLyBTZXQgc3RhdGUgd2l0aCBpbnZhbGlkIHZhbHVlIHRvIHRyaWdnZXIgZXJyb3IgbWVzc2FnaW5nXG4gICAgICAgICAgICAgIHNldFN0YXRlKHsgW2dlb21ldHJ5S2V5XTogdmFsdWUgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17YmFzZUxpbmVFcnJvcn0gLz5cbiAgICAgICAgPFVuaXRzXG4gICAgICAgICAgdmFsdWU9e3Byb3BzW3VuaXRLZXldfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgdHlwZW9mIHNldEJ1ZmZlclN0YXRlID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgID8gc2V0QnVmZmVyU3RhdGUodW5pdEtleSwgdmFsdWUpXG4gICAgICAgICAgICAgIDogc2V0U3RhdGUoeyBbdW5pdEtleV06IHZhbHVlIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICBsYWJlbD1cIkJ1ZmZlciB3aWR0aFwiXG4gICAgICAgICAgICB2YWx1ZT17U3RyaW5nKHByb3BzW3dpZHRoS2V5XSl9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIHR5cGVvZiBzZXRCdWZmZXJTdGF0ZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgID8gc2V0QnVmZmVyU3RhdGUod2lkdGhLZXksIHZhbHVlKVxuICAgICAgICAgICAgICAgIDogc2V0U3RhdGUoeyBbd2lkdGhLZXldOiB2YWx1ZSB9KVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1VuaXRzPlxuICAgICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17YnVmZmVyRXJyb3J9IC8+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBMaW5lRG1zID0gKHByb3BzOiBhbnkpID0+IHtcbiAgY29uc3Qge1xuICAgIGdlb21ldHJ5S2V5LFxuICAgIGRtc1BvaW50QXJyYXksXG4gICAgc2V0U3RhdGUsXG4gICAgdW5pdEtleSxcbiAgICBzZXRCdWZmZXJTdGF0ZSxcbiAgICB3aWR0aEtleSxcbiAgICBlcnJvckxpc3RlbmVyLFxuICB9ID0gcHJvcHNcbiAgY29uc3QgW2Jhc2VMaW5lRXJyb3IsIHNldEJhc2VMaW5lRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGUpXG4gIGNvbnN0IFtidWZmZXJFcnJvciwgc2V0QnVmZmVyRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocHJvcHMuZHJhd2luZykge1xuICAgICAgc2V0QmFzZUxpbmVFcnJvcihpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIHNldEJ1ZmZlckVycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBsaW5lVmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRlRG1zTGluZU9yUG9seShcbiAgICAgICAgZG1zUG9pbnRBcnJheSxcbiAgICAgICAgZ2VvbWV0cnlLZXlcbiAgICAgIClcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0QmFzZUxpbmVFcnJvcihsaW5lVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGNvbnN0IGJ1ZmZlclZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0ZUdlbyh3aWR0aEtleSwge1xuICAgICAgICB2YWx1ZTogcHJvcHNbd2lkdGhLZXldLFxuICAgICAgICB1bml0czogcHJvcHNbdW5pdEtleV0sXG4gICAgICB9KVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICd7IGVycm9yOiBib29sZWFuOyBtZXNzYWdlOiBzdHJpbi4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXRCdWZmZXJFcnJvcihidWZmZXJWYWxpZGF0aW9uUmVzdWx0IHx8IGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgZXJyb3JMaXN0ZW5lciAmJlxuICAgICAgICBlcnJvckxpc3RlbmVyKHtcbiAgICAgICAgICBsaW5lOiBsaW5lVmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgICBidWZmZXI6IGJ1ZmZlclZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiBjbGVhclZhbGlkYXRpb25SZXN1bHRzKGVycm9yTGlzdGVuZXIpXG4gIH0sIFtcbiAgICBwcm9wcy5wb2x5Z29uLFxuICAgIHByb3BzLmxpbmUsXG4gICAgZG1zUG9pbnRBcnJheSxcbiAgICBwcm9wcy5saW5lV2lkdGgsXG4gICAgcHJvcHMuYnVmZmVyV2lkdGgsXG4gICAgcHJvcHMucG9seWdvbkJ1ZmZlcldpZHRoLFxuICAgIHByb3BzLmxpbmVVbml0cyxcbiAgICBwcm9wcy5wb2x5Z29uQnVmZmVyVW5pdHMsXG4gIF0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbnB1dC1sb2NhdGlvbiBmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHNwYWNlLXktMlwiPlxuICAgICAgICB7ZG1zUG9pbnRBcnJheSAmJlxuICAgICAgICAgIGRtc1BvaW50QXJyYXkubWFwKChwb2ludDogYW55LCBpbmRleDogYW55KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17J3BvaW50LScgKyBpbmRleH0+XG4gICAgICAgICAgICAgICAgPERtc1RleHRGaWVsZFxuICAgICAgICAgICAgICAgICAgcG9pbnQ9e3BvaW50fVxuICAgICAgICAgICAgICAgICAgc2V0UG9pbnQ9eyhwb2ludCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYXJyYXkgPSBbLi4uZG1zUG9pbnRBcnJheV1cbiAgICAgICAgICAgICAgICAgICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxLCBwb2ludClcbiAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoeyBbJ2Rtc1BvaW50QXJyYXknXTogYXJyYXkgfSlcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICBkZWxldGVQb2ludD17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYXJyYXkgPSBbLi4uZG1zUG9pbnRBcnJheV1cbiAgICAgICAgICAgICAgICAgICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7IFsnZG1zUG9pbnRBcnJheSddOiBhcnJheSB9KVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxNaW5pbXVtU3BhY2luZyAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgICAgPEJ1dHRvblxuICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGxldCBhcnJheSA9IGRtc1BvaW50QXJyYXkgPyBbLi4uZG1zUG9pbnRBcnJheV0gOiBbXVxuICAgICAgICAgIGFycmF5LnB1c2goe1xuICAgICAgICAgICAgbGF0OiAnJyxcbiAgICAgICAgICAgIGxvbjogJycsXG4gICAgICAgICAgICBsYXREaXJlY3Rpb246ICdOJyxcbiAgICAgICAgICAgIGxvbkRpcmVjdGlvbjogJ0UnLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgc2V0U3RhdGUoeyBbJ2Rtc1BvaW50QXJyYXknXTogYXJyYXkgfSlcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgQWRkIFBvaW50XG4gICAgICA8L0J1dHRvbj5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtiYXNlTGluZUVycm9yfSAvPlxuICAgICAgPFVuaXRzXG4gICAgICAgIHZhbHVlPXtwcm9wc1t1bml0S2V5XX1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgdHlwZW9mIHNldEJ1ZmZlclN0YXRlID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IHNldEJ1ZmZlclN0YXRlKHVuaXRLZXksIHZhbHVlKVxuICAgICAgICAgICAgOiBzZXRTdGF0ZSh7IFt1bml0S2V5XTogdmFsdWUgfSlcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgIGxhYmVsPVwiQnVmZmVyIHdpZHRoXCJcbiAgICAgICAgICB2YWx1ZT17U3RyaW5nKHByb3BzW3dpZHRoS2V5XSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdHlwZW9mIHNldEJ1ZmZlclN0YXRlID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgID8gc2V0QnVmZmVyU3RhdGUod2lkdGhLZXksIHZhbHVlKVxuICAgICAgICAgICAgICA6IHNldFN0YXRlKHsgW3dpZHRoS2V5XTogdmFsdWUgfSlcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9Vbml0cz5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtidWZmZXJFcnJvcn0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBMaW5lTWdycyA9IChwcm9wczogYW55KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBnZW9tZXRyeUtleSxcbiAgICB1c25nUG9pbnRBcnJheSxcbiAgICBzZXRTdGF0ZSxcbiAgICB1bml0S2V5LFxuICAgIHNldEJ1ZmZlclN0YXRlLFxuICAgIHdpZHRoS2V5LFxuICAgIGVycm9yTGlzdGVuZXIsXG4gIH0gPSBwcm9wc1xuICBjb25zdCBbYmFzZUxpbmVFcnJvciwgc2V0QmFzZUxpbmVFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcbiAgY29uc3QgW2J1ZmZlckVycm9yLCBzZXRCdWZmZXJFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcm9wcy5kcmF3aW5nKSB7XG4gICAgICBzZXRCYXNlTGluZUVycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgc2V0QnVmZmVyRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxpbmVWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVVc25nTGluZU9yUG9seShcbiAgICAgICAgdXNuZ1BvaW50QXJyYXksXG4gICAgICAgIGdlb21ldHJ5S2V5XG4gICAgICApXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldEJhc2VMaW5lRXJyb3IobGluZVZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBjb25zdCBidWZmZXJWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8od2lkdGhLZXksIHtcbiAgICAgICAgdmFsdWU6IHByb3BzW3dpZHRoS2V5XSxcbiAgICAgICAgdW5pdHM6IHByb3BzW3VuaXRLZXldLFxuICAgICAgfSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0QnVmZmVyRXJyb3IoYnVmZmVyVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGVycm9yTGlzdGVuZXIgJiZcbiAgICAgICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICAgICAgbGluZTogbGluZVZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgICAgYnVmZmVyOiBidWZmZXJWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbXG4gICAgcHJvcHMucG9seWdvbixcbiAgICBwcm9wcy5saW5lLFxuICAgIHVzbmdQb2ludEFycmF5LFxuICAgIHByb3BzLmxpbmVXaWR0aCxcbiAgICBwcm9wcy5idWZmZXJXaWR0aCxcbiAgICBwcm9wcy5wb2x5Z29uQnVmZmVyV2lkdGgsXG4gICAgcHJvcHMubGluZVVuaXRzLFxuICAgIHByb3BzLnBvbHlnb25CdWZmZXJVbml0cyxcbiAgXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImlucHV0LWxvY2F0aW9uIGZsZXggZmxleC1jb2wgZmxleC1ub3dyYXAgc3BhY2UteS0yXCI+XG4gICAgICAgIHt1c25nUG9pbnRBcnJheSAmJlxuICAgICAgICAgIHVzbmdQb2ludEFycmF5Lm1hcCgoY29vcmQ6IGFueSwgaW5kZXg6IGFueSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICAgIGtleT17J2dyaWQtJyArIGluZGV4fVxuICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyBrZXk6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGFueTsgb24uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgICAgIGxhYmVsPVwiR3JpZFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2Nvb3JkfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgIGxldCBwb2ludHMgPSBbLi4udXNuZ1BvaW50QXJyYXldXG4gICAgICAgICAgICAgICAgICBwb2ludHMuc3BsaWNlKGluZGV4LCAxLCB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHsgWyd1c25nUG9pbnRBcnJheSddOiBwb2ludHMgfSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGFkZG9uPXtcbiAgICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGxldCBwb2ludHMgPSBbLi4udXNuZ1BvaW50QXJyYXldXG4gICAgICAgICAgICAgICAgICAgICAgcG9pbnRzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7IFsndXNuZ1BvaW50QXJyYXknXTogcG9pbnRzIH0pXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxDbG9zZUljb24gLz5cbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGxldCBwb2ludHMgPSB1c25nUG9pbnRBcnJheSA/IFsuLi51c25nUG9pbnRBcnJheV0gOiBbXVxuICAgICAgICAgICAgcG9pbnRzLnB1c2goJycpXG4gICAgICAgICAgICBzZXRTdGF0ZSh7IFsndXNuZ1BvaW50QXJyYXknXTogcG9pbnRzIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIEFkZCBQb2ludFxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e2Jhc2VMaW5lRXJyb3J9IC8+XG4gICAgICAgIDxVbml0c1xuICAgICAgICAgIHZhbHVlPXtwcm9wc1t1bml0S2V5XX1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHR5cGVvZiBzZXRCdWZmZXJTdGF0ZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICA/IHNldEJ1ZmZlclN0YXRlKHVuaXRLZXksIHZhbHVlKVxuICAgICAgICAgICAgICA6IHNldFN0YXRlKHsgW3VuaXRLZXldOiB2YWx1ZSB9KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgbGFiZWw9XCJCdWZmZXIgd2lkdGhcIlxuICAgICAgICAgICAgdmFsdWU9e1N0cmluZyhwcm9wc1t3aWR0aEtleV0pfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICB0eXBlb2Ygc2V0QnVmZmVyU3RhdGUgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICA/IHNldEJ1ZmZlclN0YXRlKHdpZHRoS2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgICA6IHNldFN0YXRlKHsgW3dpZHRoS2V5XTogdmFsdWUgfSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Vbml0cz5cbiAgICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e2J1ZmZlckVycm9yfSAvPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgTGluZVV0bVVwcyA9IChwcm9wczogYW55KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBnZW9tZXRyeUtleSxcbiAgICB1dG1VcHNQb2ludEFycmF5LFxuICAgIHNldFN0YXRlLFxuICAgIHVuaXRLZXksXG4gICAgc2V0QnVmZmVyU3RhdGUsXG4gICAgd2lkdGhLZXksXG4gICAgZXJyb3JMaXN0ZW5lcixcbiAgfSA9IHByb3BzXG4gIGNvbnN0IFtiYXNlTGluZUVycm9yLCBzZXRCYXNlTGluZUVycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuICBjb25zdCBbYnVmZmVyRXJyb3IsIHNldEJ1ZmZlckVycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHByb3BzLmRyYXdpbmcpIHtcbiAgICAgIHNldEJhc2VMaW5lRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBzZXRCdWZmZXJFcnJvcihpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbGluZVZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0ZVV0bVVwc0xpbmVPclBvbHkoXG4gICAgICAgIHV0bVVwc1BvaW50QXJyYXksXG4gICAgICAgIGdlb21ldHJ5S2V5XG4gICAgICApXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldEJhc2VMaW5lRXJyb3IobGluZVZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBjb25zdCBidWZmZXJWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8od2lkdGhLZXksIHtcbiAgICAgICAgdmFsdWU6IHByb3BzW3dpZHRoS2V5XSxcbiAgICAgICAgdW5pdHM6IHByb3BzW3VuaXRLZXldLFxuICAgICAgfSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0QnVmZmVyRXJyb3IoYnVmZmVyVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGVycm9yTGlzdGVuZXIgJiZcbiAgICAgICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICAgICAgbGluZTogbGluZVZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgICAgYnVmZmVyOiBidWZmZXJWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbXG4gICAgcHJvcHMucG9seWdvbixcbiAgICBwcm9wcy5saW5lLFxuICAgIHV0bVVwc1BvaW50QXJyYXksXG4gICAgcHJvcHMubGluZVdpZHRoLFxuICAgIHByb3BzLmJ1ZmZlcldpZHRoLFxuICAgIHByb3BzLnBvbHlnb25CdWZmZXJXaWR0aCxcbiAgICBwcm9wcy5saW5lVW5pdHMsXG4gICAgcHJvcHMucG9seWdvbkJ1ZmZlclVuaXRzLFxuICBdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHNwYWNlLXktMlwiPlxuICAgICAge3V0bVVwc1BvaW50QXJyYXkgJiZcbiAgICAgICAgdXRtVXBzUG9pbnRBcnJheS5tYXAoKHBvaW50OiBhbnksIGluZGV4OiBhbnkpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBrZXk9e2luZGV4fT5cbiAgICAgICAgICAgICAgPFV0bXVwc1RleHRGaWVsZFxuICAgICAgICAgICAgICAgIHBvaW50PXtwb2ludH1cbiAgICAgICAgICAgICAgICBzZXRQb2ludD17KHBvaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBsZXQgcG9pbnRzID0gWy4uLnV0bVVwc1BvaW50QXJyYXldXG4gICAgICAgICAgICAgICAgICBwb2ludHMuc3BsaWNlKGluZGV4LCAxLCBwb2ludClcbiAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHsgWyd1dG1VcHNQb2ludEFycmF5J106IHBvaW50cyB9KVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgZGVsZXRlUG9pbnQ9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIGxldCBwb2ludHMgPSBbLi4udXRtVXBzUG9pbnRBcnJheV1cbiAgICAgICAgICAgICAgICAgIHBvaW50cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7IFsndXRtVXBzUG9pbnRBcnJheSddOiBwb2ludHMgfSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8TWluaW11bVNwYWNpbmcgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgICAgfSl9XG4gICAgICA8QnV0dG9uXG4gICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgbGV0IHBvaW50cyA9IHV0bVVwc1BvaW50QXJyYXkgPyBbLi4udXRtVXBzUG9pbnRBcnJheV0gOiBbXVxuICAgICAgICAgIHBvaW50cy5wdXNoKHtcbiAgICAgICAgICAgIGVhc3Rpbmc6ICcnLFxuICAgICAgICAgICAgaGVtaXNwaGVyZTogJ05vcnRoZXJuJyxcbiAgICAgICAgICAgIG5vcnRoaW5nOiAnJyxcbiAgICAgICAgICAgIHpvbmVOdW1iZXI6IDAsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzZXRTdGF0ZSh7IFsndXRtVXBzUG9pbnRBcnJheSddOiBwb2ludHMgfSlcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgQWRkIFBvaW50XG4gICAgICA8L0J1dHRvbj5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtiYXNlTGluZUVycm9yfSAvPlxuICAgICAgPFVuaXRzXG4gICAgICAgIHZhbHVlPXtwcm9wc1t1bml0S2V5XX1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgdHlwZW9mIHNldEJ1ZmZlclN0YXRlID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IHNldEJ1ZmZlclN0YXRlKHVuaXRLZXksIHZhbHVlKVxuICAgICAgICAgICAgOiBzZXRTdGF0ZSh7IFt1bml0S2V5XTogdmFsdWUgfSlcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgIGxhYmVsPVwiQnVmZmVyIHdpZHRoXCJcbiAgICAgICAgICB2YWx1ZT17U3RyaW5nKHByb3BzW3dpZHRoS2V5XSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdHlwZW9mIHNldEJ1ZmZlclN0YXRlID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgID8gc2V0QnVmZmVyU3RhdGUod2lkdGhLZXksIHZhbHVlKVxuICAgICAgICAgICAgICA6IHNldFN0YXRlKHsgW3dpZHRoS2V5XTogdmFsdWUgfSlcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9Vbml0cz5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtidWZmZXJFcnJvcn0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBCYXNlTGluZSA9IChwcm9wczogYW55KSA9PiB7XG4gIGNvbnN0IHsgc2V0U3RhdGUsIGxvY2F0aW9uVHlwZSB9ID0gcHJvcHNcblxuICBjb25zdCBpbnB1dHMgPSB7XG4gICAgdXNuZzogTGluZU1ncnMsXG4gICAgZGQ6IExpbmVMYXRMb24sXG4gICAgZG1zOiBMaW5lRG1zLFxuICAgIHV0bXVwczogTGluZVV0bVVwcyxcbiAgfVxuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICBjb25zdCBDb21wb25lbnQgPSBpbnB1dHNbbG9jYXRpb25UeXBlXSB8fCBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPFJhZGlvXG4gICAgICAgIHZhbHVlPXtsb2NhdGlvblR5cGV9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ2xvY2F0aW9uVHlwZSddOiB2YWx1ZSB9KX1cbiAgICAgID5cbiAgICAgICAgPFJhZGlvSXRlbSB2YWx1ZT1cImRkXCI+TGF0L0xvbiAoREQpPC9SYWRpb0l0ZW0+XG4gICAgICAgIDxSYWRpb0l0ZW0gdmFsdWU9XCJkbXNcIj5MYXQvTG9uIChETVMpPC9SYWRpb0l0ZW0+XG4gICAgICAgIDxSYWRpb0l0ZW0gdmFsdWU9XCJ1c25nXCI+VVNORyAvIE1HUlM8L1JhZGlvSXRlbT5cbiAgICAgICAgPFJhZGlvSXRlbSB2YWx1ZT1cInV0bXVwc1wiPlVUTSAvIFVQUzwvUmFkaW9JdGVtPlxuICAgICAgPC9SYWRpbz5cbiAgICAgIDxNaW5pbXVtU3BhY2luZyAvPlxuICAgICAge0NvbXBvbmVudCAhPT0gbnVsbCA/IDxDb21wb25lbnQgey4uLnByb3BzfSAvPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZUxpbmVcbiJdfQ==