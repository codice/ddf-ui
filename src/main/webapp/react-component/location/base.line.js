import { __assign, __read, __spreadArray } from "tslib";
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
import React, { useState, useEffect } from 'react';
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
    return (React.createElement("div", null,
        React.createElement("div", { className: "input-location flex flex-col flex-nowrap space-y-2" },
            React.createElement(TextField
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
                } }),
            React.createElement(ErrorComponent, { errorState: baseLineError }),
            React.createElement(Units, { value: props[unitKey], onChange: function (value) {
                    var _a;
                    typeof setBufferState === 'function'
                        ? setBufferState(unitKey, value)
                        : setState((_a = {}, _a[unitKey] = value, _a));
                } },
                React.createElement(TextField
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                , { 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                    type: "number", label: "Buffer width", value: String(props[widthKey]), onChange: function (value) {
                        var _a;
                        typeof setBufferState === 'function'
                            ? setBufferState(widthKey, value)
                            : setState((_a = {}, _a[widthKey] = value, _a));
                    } })),
            React.createElement(ErrorComponent, { errorState: bufferError }))));
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
    return (React.createElement("div", null,
        React.createElement("div", { className: "input-location flex flex-col flex-nowrap space-y-2" }, dmsPointArray &&
            dmsPointArray.map(function (point, index) {
                return (React.createElement("div", { key: 'point-' + index },
                    React.createElement(DmsTextField, { point: point, setPoint: function (point) {
                            var _a;
                            var array = __spreadArray([], __read(dmsPointArray), false);
                            array.splice(index, 1, point);
                            setState((_a = {}, _a['dmsPointArray'] = array, _a));
                        }, deletePoint: function () {
                            var _a;
                            var array = __spreadArray([], __read(dmsPointArray), false);
                            array.splice(index, 1);
                            setState((_a = {}, _a['dmsPointArray'] = array, _a));
                        } }),
                    React.createElement(MinimumSpacing, null)));
            })),
        React.createElement(Button, { fullWidth: true, onClick: function () {
                var _a;
                var array = dmsPointArray ? __spreadArray([], __read(dmsPointArray), false) : [];
                array.push({
                    lat: '',
                    lon: '',
                    latDirection: 'N',
                    lonDirection: 'E',
                });
                setState((_a = {}, _a['dmsPointArray'] = array, _a));
            } }, "Add Point"),
        React.createElement(ErrorComponent, { errorState: baseLineError }),
        React.createElement(Units, { value: props[unitKey], onChange: function (value) {
                var _a;
                typeof setBufferState === 'function'
                    ? setBufferState(unitKey, value)
                    : setState((_a = {}, _a[unitKey] = value, _a));
            } },
            React.createElement(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                type: "number", label: "Buffer width", value: String(props[widthKey]), onChange: function (value) {
                    var _a;
                    typeof setBufferState === 'function'
                        ? setBufferState(widthKey, value)
                        : setState((_a = {}, _a[widthKey] = value, _a));
                } })),
        React.createElement(ErrorComponent, { errorState: bufferError })));
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
    return (React.createElement("div", null,
        React.createElement("div", { className: "input-location flex flex-col flex-nowrap space-y-2" },
            usngPointArray &&
                usngPointArray.map(function (coord, index) {
                    return (React.createElement(TextField, { key: 'grid-' + index, 
                        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ key: string; label: string; value: any; on... Remove this comment to see the full error message
                        label: "Grid", value: coord, onChange: function (value) {
                            var _a;
                            var points = __spreadArray([], __read(usngPointArray), false);
                            points.splice(index, 1, value);
                            setState((_a = {}, _a['usngPointArray'] = points, _a));
                        }, addon: React.createElement(Button, { onClick: function () {
                                var _a;
                                var points = __spreadArray([], __read(usngPointArray), false);
                                points.splice(index, 1);
                                setState((_a = {}, _a['usngPointArray'] = points, _a));
                            } },
                            React.createElement(CloseIcon, null)) }));
                }),
            React.createElement(Button, { fullWidth: true, onClick: function () {
                    var _a;
                    var points = usngPointArray ? __spreadArray([], __read(usngPointArray), false) : [];
                    points.push('');
                    setState((_a = {}, _a['usngPointArray'] = points, _a));
                } }, "Add Point"),
            React.createElement(ErrorComponent, { errorState: baseLineError }),
            React.createElement(Units, { value: props[unitKey], onChange: function (value) {
                    var _a;
                    typeof setBufferState === 'function'
                        ? setBufferState(unitKey, value)
                        : setState((_a = {}, _a[unitKey] = value, _a));
                } },
                React.createElement(TextField
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                , { 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                    type: "number", label: "Buffer width", value: String(props[widthKey]), onChange: function (value) {
                        var _a;
                        typeof setBufferState === 'function'
                            ? setBufferState(widthKey, value)
                            : setState((_a = {}, _a[widthKey] = value, _a));
                    } })),
            React.createElement(ErrorComponent, { errorState: bufferError }))));
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
    return (React.createElement("div", { className: "flex flex-col flex-nowrap space-y-2" },
        utmUpsPointArray &&
            utmUpsPointArray.map(function (point, index) {
                return (React.createElement("div", { key: index },
                    React.createElement(UtmupsTextField, { point: point, setPoint: function (point) {
                            var _a;
                            var points = __spreadArray([], __read(utmUpsPointArray), false);
                            points.splice(index, 1, point);
                            setState((_a = {}, _a['utmUpsPointArray'] = points, _a));
                        }, deletePoint: function () {
                            var _a;
                            var points = __spreadArray([], __read(utmUpsPointArray), false);
                            points.splice(index, 1);
                            setState((_a = {}, _a['utmUpsPointArray'] = points, _a));
                        } }),
                    React.createElement(MinimumSpacing, null)));
            }),
        React.createElement(Button, { fullWidth: true, onClick: function () {
                var _a;
                var points = utmUpsPointArray ? __spreadArray([], __read(utmUpsPointArray), false) : [];
                points.push({
                    easting: '',
                    hemisphere: 'Northern',
                    northing: '',
                    zoneNumber: 0,
                });
                setState((_a = {}, _a['utmUpsPointArray'] = points, _a));
            } }, "Add Point"),
        React.createElement(ErrorComponent, { errorState: baseLineError }),
        React.createElement(Units, { value: props[unitKey], onChange: function (value) {
                var _a;
                typeof setBufferState === 'function'
                    ? setBufferState(unitKey, value)
                    : setState((_a = {}, _a[unitKey] = value, _a));
            } },
            React.createElement(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                type: "number", label: "Buffer width", value: String(props[widthKey]), onChange: function (value) {
                    var _a;
                    typeof setBufferState === 'function'
                        ? setBufferState(widthKey, value)
                        : setState((_a = {}, _a[widthKey] = value, _a));
                } })),
        React.createElement(ErrorComponent, { errorState: bufferError })));
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
    return (React.createElement("div", null,
        React.createElement(Radio, { value: locationType, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['locationType'] = value, _a));
            } },
            React.createElement(RadioItem, { value: "dd" }, "Lat/Lon (DD)"),
            React.createElement(RadioItem, { value: "dms" }, "Lat/Lon (DMS)"),
            React.createElement(RadioItem, { value: "usng" }, "USNG / MGRS"),
            React.createElement(RadioItem, { value: "utmups" }, "UTM / UPS")),
        React.createElement(MinimumSpacing, null),
        Component !== null ? React.createElement(Component, __assign({}, props)) : null));
};
export default BaseLine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5saW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9iYXNlLmxpbmUudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQ2xELE9BQU8sRUFDTCxjQUFjLEVBQ2QsV0FBVyxFQUNYLGlCQUFpQixHQUNsQixNQUFNLHFCQUFxQixDQUFBO0FBQzVCLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sU0FBUyxNQUFNLDJCQUEyQixDQUFBO0FBQ2pELE9BQU8sRUFDTCxzQkFBc0IsRUFDdEIscUJBQXFCLEVBQ3JCLHdCQUF3QixHQUN6QixNQUFNLGNBQWMsQ0FBQTtBQUNyQixPQUFPLFlBQVksTUFBTSxpQkFBaUIsQ0FBQTtBQUMxQyxPQUFPLGVBQWUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNoRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2hDLE9BQU8sU0FBUyxNQUFNLGVBQWUsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ2pELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFDekMsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBRTFCLElBQU0sbUJBQW1CLEdBQUcsdUNBQXVDLENBQUE7QUFFbkUsU0FBUyxjQUFjLENBQUMsV0FBZ0I7SUFDdEMsT0FBTyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDOUMsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsS0FBVTtJQUNsQyxJQUFJLEtBQUssQ0FBQyxRQUFR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O1FBQ2QsR0FBRyxFQUFFLE9BQU87UUFDWixNQUFNLEVBQUUsVUFBVTtLQUNuQixDQUFBO0lBRUQsbUpBQW1KO0lBQ25KLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxJQUFJLENBQUE7SUFFOUMsT0FBTyxDQUNMO1FBQ0Usb0JBQUMsS0FBSyxJQUNKLEtBQUssRUFBRSxZQUFZLEVBQ25CLFFBQVEsRUFBRSxVQUFDLEtBQVU7O2dCQUFLLE9BQUEsUUFBUSxXQUFHLEdBQUMsY0FBYyxJQUFHLEtBQUssTUFBRztZQUFyQyxDQUFxQztZQUUvRCxvQkFBQyxTQUFTLElBQUMsS0FBSyxFQUFDLElBQUksbUJBQXlCO1lBQzlDLG9CQUFDLFNBQVMsSUFBQyxLQUFLLEVBQUMsS0FBSyxvQkFBMEI7WUFDaEQsb0JBQUMsU0FBUyxJQUFDLEtBQUssRUFBQyxNQUFNLGtCQUF3QjtZQUMvQyxvQkFBQyxTQUFTLElBQUMsS0FBSyxFQUFDLFFBQVEsZ0JBQXNCLENBQ3pDO1FBQ1Isb0JBQUMsY0FBYyxPQUFHO1FBQ2pCLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFDLFNBQVMsZUFBSyxLQUFLLEVBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNqRCxDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFFBQVEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7XG4gIEVycm9yQ29tcG9uZW50LFxuICB2YWxpZGF0ZUdlbyxcbiAgaW5pdGlhbEVycm9yU3RhdGUsXG59IGZyb20gJy4uL3V0aWxzL3ZhbGlkYXRpb24nXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IENsb3NlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0Nsb3NlJ1xuaW1wb3J0IHtcbiAgdmFsaWRhdGVVc25nTGluZU9yUG9seSxcbiAgdmFsaWRhdGVEbXNMaW5lT3JQb2x5LFxuICB2YWxpZGF0ZVV0bVVwc0xpbmVPclBvbHksXG59IGZyb20gJy4vdmFsaWRhdG9ycydcbmltcG9ydCBEbXNUZXh0RmllbGQgZnJvbSAnLi9kbXMtdGV4dGZpZWxkJ1xuaW1wb3J0IFV0bXVwc1RleHRGaWVsZCBmcm9tICcuL3V0bXVwcy10ZXh0ZmllbGQnXG5pbXBvcnQgeyBVbml0cyB9IGZyb20gJy4vY29tbW9uJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICcuLi90ZXh0LWZpZWxkJ1xuaW1wb3J0IHsgUmFkaW8sIFJhZGlvSXRlbSB9IGZyb20gJy4uL3JhZGlvL3JhZGlvJ1xuaW1wb3J0IHsgTWluaW11bVNwYWNpbmcgfSBmcm9tICcuL2NvbW1vbidcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5cbmNvbnN0IGNvb3JkaW5hdGVQYWlyUmVnZXggPSAvLT9cXGR7MSwzfShcXC5cXGQqKT9cXHMtP1xcZHsxLDN9KFxcLlxcZCopPy9nXG5cbmZ1bmN0aW9uIGJ1aWxkV2t0U3RyaW5nKGNvb3JkaW5hdGVzOiBhbnkpIHtcbiAgcmV0dXJuICdbWycgKyBjb29yZGluYXRlcy5qb2luKCddLFsnKSArICddXSdcbn1cblxuZnVuY3Rpb24gY29udmVydFdrdFN0cmluZyh2YWx1ZTogYW55KSB7XG4gIGlmICh2YWx1ZS5pbmNsdWRlcygnTVVMVEknKSkge1xuICAgIHJldHVybiBjb252ZXJ0TXVsdGlXa3QodmFsdWUuaW5jbHVkZXMoJ1BPTFlHT04nKSwgdmFsdWUpXG4gIH0gZWxzZSBpZiAodmFsdWUuaW5jbHVkZXMoJ1BPTFlHT04nKSAmJiB2YWx1ZS5lbmRzV2l0aCgnKSknKSkge1xuICAgIHJldHVybiBjb252ZXJ0V2t0KHZhbHVlLCA0KVxuICB9IGVsc2UgaWYgKHZhbHVlLmluY2x1ZGVzKCdMSU5FU1RSSU5HJykgJiYgdmFsdWUuZW5kc1dpdGgoJyknKSkge1xuICAgIHJldHVybiBjb252ZXJ0V2t0KHZhbHVlLCAyKVxuICB9XG4gIHJldHVybiB2YWx1ZVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0V2t0KHZhbHVlOiBhbnksIG51bUNvb3JkczogYW55KSB7XG4gIGNvbnN0IGNvb3JkaW5hdGVQYWlycyA9IHZhbHVlLm1hdGNoKGNvb3JkaW5hdGVQYWlyUmVnZXgpXG4gIGlmICghY29vcmRpbmF0ZVBhaXJzIHx8IGNvb3JkaW5hdGVQYWlycy5sZW5ndGggPCBudW1Db29yZHMpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuICBjb25zdCBjb29yZGluYXRlcyA9IGNvb3JkaW5hdGVQYWlycy5tYXAoKGNvb3JkOiBhbnkpID0+XG4gICAgY29vcmQucmVwbGFjZSgnICcsICcsJylcbiAgKVxuICByZXR1cm4gYnVpbGRXa3RTdHJpbmcoY29vcmRpbmF0ZXMpXG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRNdWx0aVdrdChpc1BvbHlnb246IGFueSwgdmFsdWU6IGFueSkge1xuICBpZiAoaXNQb2x5Z29uICYmICF2YWx1ZS5lbmRzV2l0aCgnKSkpJykpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfSBlbHNlIGlmICghdmFsdWUuZW5kc1dpdGgoJykpJykpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuICBjb25zdCBzcGxpdHRlciA9IGlzUG9seWdvbiA/ICcpKScgOiAnKSdcbiAgY29uc3QgbnVtUG9pbnRzID0gaXNQb2x5Z29uID8gNCA6IDJcbiAgbGV0IHNoYXBlcyA9IHZhbHVlXG4gICAgLnNwbGl0KHNwbGl0dGVyKVxuICAgIC5tYXAoKHNoYXBlOiBhbnkpID0+IHNoYXBlLm1hdGNoKGNvb3JkaW5hdGVQYWlyUmVnZXgpKVxuICBzaGFwZXMgPSBzaGFwZXNcbiAgICAuZmlsdGVyKChzaGFwZTogYW55KSA9PiBzaGFwZSAhPT0gbnVsbCAmJiBzaGFwZS5sZW5ndGggPj0gbnVtUG9pbnRzKVxuICAgIC5tYXAoKHNoYXBlOiBhbnkpID0+XG4gICAgICBzaGFwZS5tYXAoKGNvb3JkaW5hdGVQYWlyOiBhbnkpID0+IGNvb3JkaW5hdGVQYWlyLnJlcGxhY2UoJyAnLCAnLCcpKVxuICAgIClcbiAgcmV0dXJuIHNoYXBlcy5sZW5ndGggPT09IDBcbiAgICA/IHZhbHVlXG4gICAgOiBzaGFwZXMubGVuZ3RoID09PSAxXG4gICAgPyBidWlsZFdrdFN0cmluZyhzaGFwZXNbMF0pXG4gICAgOiAnWycgKyBzaGFwZXMubWFwKChzaGFwZUNvb3JkczogYW55KSA9PiBidWlsZFdrdFN0cmluZyhzaGFwZUNvb3JkcykpICsgJ10nXG59XG5cbmZ1bmN0aW9uIGdldFBvbHlnb25WYWx1ZShjdXJyZW50VmFsdWU6IGFueSwgdmFsdWU6IGFueSkge1xuICAvLyBpZiBjdXJyZW50IHZhbHVlJ3MgMXN0IGNvb3JkIGlzIGRpZmZlcmVudFxuICAvLyBmcm9tIHZhbHVlJ3MgZmlyc3QgY29vcmQsIHRoZW4gZGVsZXRlIHZhbHVlJ3MgbGFzdCBjb29yZFxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZFZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSlcbiAgICBjb25zdCBwYXJzZWRDdXJyZW50VmFsdWUgPSBKU09OLnBhcnNlKGN1cnJlbnRWYWx1ZSlcbiAgICBpZiAoXG4gICAgICBBcnJheS5pc0FycmF5KHBhcnNlZFZhbHVlKSAmJlxuICAgICAgQXJyYXkuaXNBcnJheShwYXJzZWRDdXJyZW50VmFsdWUpICYmXG4gICAgICAhXy5pc0VxdWFsKHBhcnNlZFZhbHVlWzBdLCBwYXJzZWRDdXJyZW50VmFsdWVbMF0pXG4gICAgKSB7XG4gICAgICBwYXJzZWRWYWx1ZS5zcGxpY2UoLTEsIDEpXG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGFyc2VkVmFsdWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG59XG5cbmNvbnN0IGNsZWFyVmFsaWRhdGlvblJlc3VsdHMgPSAoZXJyb3JMaXN0ZW5lcj86IGFueSkgPT4ge1xuICBlcnJvckxpc3RlbmVyICYmXG4gICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICBsaW5lOiB1bmRlZmluZWQsXG4gICAgICBidWZmZXI6IHVuZGVmaW5lZCxcbiAgICB9KVxufVxuXG5jb25zdCBMaW5lTGF0TG9uID0gKHByb3BzOiBhbnkpID0+IHtcbiAgY29uc3Qge1xuICAgIGxhYmVsLFxuICAgIGdlb21ldHJ5S2V5LFxuICAgIHNldFN0YXRlLFxuICAgIHNldEJ1ZmZlclN0YXRlLFxuICAgIHVuaXRLZXksXG4gICAgd2lkdGhLZXksXG4gICAgbW9kZSxcbiAgICBwb2x5VHlwZSxcbiAgICBlcnJvckxpc3RlbmVyLFxuICB9ID0gcHJvcHNcbiAgY29uc3QgW2N1cnJlbnRWYWx1ZSwgc2V0Q3VycmVudFZhbHVlXSA9IHVzZVN0YXRlKFxuICAgIEpTT04uc3RyaW5naWZ5KHByb3BzW2dlb21ldHJ5S2V5XSlcbiAgKVxuICBjb25zdCBbYmFzZUxpbmVFcnJvciwgc2V0QmFzZUxpbmVFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcbiAgY29uc3QgW2J1ZmZlckVycm9yLCBzZXRCdWZmZXJFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHsgZ2VvbWV0cnlLZXkgfSA9IHByb3BzXG4gICAgY29uc3QgbmV3VmFsdWUgPVxuICAgICAgdHlwZW9mIHByb3BzW2dlb21ldHJ5S2V5XSA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBwcm9wc1tnZW9tZXRyeUtleV1cbiAgICAgICAgOiBKU09OLnN0cmluZ2lmeShwcm9wc1tnZW9tZXRyeUtleV0pXG4gICAgc2V0Q3VycmVudFZhbHVlKG5ld1ZhbHVlKVxuICAgIGlmIChwcm9wcy5kcmF3aW5nKSB7XG4gICAgICBzZXRCYXNlTGluZUVycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgc2V0QnVmZmVyRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxpbmVWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8obW9kZSB8fCBwb2x5VHlwZSwgbmV3VmFsdWUpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldEJhc2VMaW5lRXJyb3IobGluZVZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBjb25zdCBidWZmZXJWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8od2lkdGhLZXksIHtcbiAgICAgICAgdmFsdWU6IHByb3BzW3dpZHRoS2V5XSxcbiAgICAgICAgdW5pdHM6IHByb3BzW3VuaXRLZXldLFxuICAgICAgfSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0QnVmZmVyRXJyb3IoYnVmZmVyVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGVycm9yTGlzdGVuZXIgJiZcbiAgICAgICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICAgICAgbGluZTogbGluZVZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgICAgYnVmZmVyOiBidWZmZXJWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbXG4gICAgcHJvcHMucG9seWdvbixcbiAgICBwcm9wcy5saW5lLFxuICAgIHByb3BzLmxpbmVXaWR0aCxcbiAgICBwcm9wcy5idWZmZXJXaWR0aCxcbiAgICBwcm9wcy5wb2x5Z29uQnVmZmVyV2lkdGgsXG4gICAgcHJvcHMubGluZVVuaXRzLFxuICAgIHByb3BzLnBvbHlnb25CdWZmZXJVbml0cyxcbiAgXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImlucHV0LWxvY2F0aW9uIGZsZXggZmxleC1jb2wgZmxleC1ub3dyYXAgc3BhY2UteS0yXCI+XG4gICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IGFueTsgdmFsdWU6IHN0cmluZzsgb25DaGFuZ2U6ICh2YWx1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICBsYWJlbD17bGFiZWx9XG4gICAgICAgICAgdmFsdWU9e2N1cnJlbnRWYWx1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZSA9IGNvbnZlcnRXa3RTdHJpbmcodmFsdWUudHJpbSgpKVxuICAgICAgICAgICAgaWYgKGdlb21ldHJ5S2V5LmluY2x1ZGVzKCdwb2x5JykpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBnZXRQb2x5Z29uVmFsdWUoY3VycmVudFZhbHVlLCB2YWx1ZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldEN1cnJlbnRWYWx1ZSh2YWx1ZSlcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHNldFN0YXRlKHsgW2dlb21ldHJ5S2V5XTogSlNPTi5wYXJzZSh2YWx1ZSkgfSlcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgLy8gU2V0IHN0YXRlIHdpdGggaW52YWxpZCB2YWx1ZSB0byB0cmlnZ2VyIGVycm9yIG1lc3NhZ2luZ1xuICAgICAgICAgICAgICBzZXRTdGF0ZSh7IFtnZW9tZXRyeUtleV06IHZhbHVlIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e2Jhc2VMaW5lRXJyb3J9IC8+XG4gICAgICAgIDxVbml0c1xuICAgICAgICAgIHZhbHVlPXtwcm9wc1t1bml0S2V5XX1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHR5cGVvZiBzZXRCdWZmZXJTdGF0ZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICA/IHNldEJ1ZmZlclN0YXRlKHVuaXRLZXksIHZhbHVlKVxuICAgICAgICAgICAgICA6IHNldFN0YXRlKHsgW3VuaXRLZXldOiB2YWx1ZSB9KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgbGFiZWw9XCJCdWZmZXIgd2lkdGhcIlxuICAgICAgICAgICAgdmFsdWU9e1N0cmluZyhwcm9wc1t3aWR0aEtleV0pfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICB0eXBlb2Ygc2V0QnVmZmVyU3RhdGUgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICA/IHNldEJ1ZmZlclN0YXRlKHdpZHRoS2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgICA6IHNldFN0YXRlKHsgW3dpZHRoS2V5XTogdmFsdWUgfSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Vbml0cz5cbiAgICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e2J1ZmZlckVycm9yfSAvPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgTGluZURtcyA9IChwcm9wczogYW55KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBnZW9tZXRyeUtleSxcbiAgICBkbXNQb2ludEFycmF5LFxuICAgIHNldFN0YXRlLFxuICAgIHVuaXRLZXksXG4gICAgc2V0QnVmZmVyU3RhdGUsXG4gICAgd2lkdGhLZXksXG4gICAgZXJyb3JMaXN0ZW5lcixcbiAgfSA9IHByb3BzXG4gIGNvbnN0IFtiYXNlTGluZUVycm9yLCBzZXRCYXNlTGluZUVycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuICBjb25zdCBbYnVmZmVyRXJyb3IsIHNldEJ1ZmZlckVycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHByb3BzLmRyYXdpbmcpIHtcbiAgICAgIHNldEJhc2VMaW5lRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBzZXRCdWZmZXJFcnJvcihpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbGluZVZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0ZURtc0xpbmVPclBvbHkoXG4gICAgICAgIGRtc1BvaW50QXJyYXksXG4gICAgICAgIGdlb21ldHJ5S2V5XG4gICAgICApXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldEJhc2VMaW5lRXJyb3IobGluZVZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBjb25zdCBidWZmZXJWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8od2lkdGhLZXksIHtcbiAgICAgICAgdmFsdWU6IHByb3BzW3dpZHRoS2V5XSxcbiAgICAgICAgdW5pdHM6IHByb3BzW3VuaXRLZXldLFxuICAgICAgfSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0QnVmZmVyRXJyb3IoYnVmZmVyVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGVycm9yTGlzdGVuZXIgJiZcbiAgICAgICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICAgICAgbGluZTogbGluZVZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgICAgYnVmZmVyOiBidWZmZXJWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbXG4gICAgcHJvcHMucG9seWdvbixcbiAgICBwcm9wcy5saW5lLFxuICAgIGRtc1BvaW50QXJyYXksXG4gICAgcHJvcHMubGluZVdpZHRoLFxuICAgIHByb3BzLmJ1ZmZlcldpZHRoLFxuICAgIHByb3BzLnBvbHlnb25CdWZmZXJXaWR0aCxcbiAgICBwcm9wcy5saW5lVW5pdHMsXG4gICAgcHJvcHMucG9seWdvbkJ1ZmZlclVuaXRzLFxuICBdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5wdXQtbG9jYXRpb24gZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBzcGFjZS15LTJcIj5cbiAgICAgICAge2Rtc1BvaW50QXJyYXkgJiZcbiAgICAgICAgICBkbXNQb2ludEFycmF5Lm1hcCgocG9pbnQ6IGFueSwgaW5kZXg6IGFueSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPGRpdiBrZXk9eydwb2ludC0nICsgaW5kZXh9PlxuICAgICAgICAgICAgICAgIDxEbXNUZXh0RmllbGRcbiAgICAgICAgICAgICAgICAgIHBvaW50PXtwb2ludH1cbiAgICAgICAgICAgICAgICAgIHNldFBvaW50PXsocG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFycmF5ID0gWy4uLmRtc1BvaW50QXJyYXldXG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnNwbGljZShpbmRleCwgMSwgcG9pbnQpXG4gICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHsgWydkbXNQb2ludEFycmF5J106IGFycmF5IH0pXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgZGVsZXRlUG9pbnQ9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFycmF5ID0gWy4uLmRtc1BvaW50QXJyYXldXG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoeyBbJ2Rtc1BvaW50QXJyYXknXTogYXJyYXkgfSlcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8TWluaW11bVNwYWNpbmcgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBsZXQgYXJyYXkgPSBkbXNQb2ludEFycmF5ID8gWy4uLmRtc1BvaW50QXJyYXldIDogW11cbiAgICAgICAgICBhcnJheS5wdXNoKHtcbiAgICAgICAgICAgIGxhdDogJycsXG4gICAgICAgICAgICBsb246ICcnLFxuICAgICAgICAgICAgbGF0RGlyZWN0aW9uOiAnTicsXG4gICAgICAgICAgICBsb25EaXJlY3Rpb246ICdFJyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIHNldFN0YXRlKHsgWydkbXNQb2ludEFycmF5J106IGFycmF5IH0pXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIEFkZCBQb2ludFxuICAgICAgPC9CdXR0b24+XG4gICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17YmFzZUxpbmVFcnJvcn0gLz5cbiAgICAgIDxVbml0c1xuICAgICAgICB2YWx1ZT17cHJvcHNbdW5pdEtleV19XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgIHR5cGVvZiBzZXRCdWZmZXJTdGF0ZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBzZXRCdWZmZXJTdGF0ZSh1bml0S2V5LCB2YWx1ZSlcbiAgICAgICAgICAgIDogc2V0U3RhdGUoeyBbdW5pdEtleV06IHZhbHVlIH0pXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICBsYWJlbD1cIkJ1ZmZlciB3aWR0aFwiXG4gICAgICAgICAgdmFsdWU9e1N0cmluZyhwcm9wc1t3aWR0aEtleV0pfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHR5cGVvZiBzZXRCdWZmZXJTdGF0ZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICA/IHNldEJ1ZmZlclN0YXRlKHdpZHRoS2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgOiBzZXRTdGF0ZSh7IFt3aWR0aEtleV06IHZhbHVlIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvVW5pdHM+XG4gICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17YnVmZmVyRXJyb3J9IC8+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgTGluZU1ncnMgPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7XG4gICAgZ2VvbWV0cnlLZXksXG4gICAgdXNuZ1BvaW50QXJyYXksXG4gICAgc2V0U3RhdGUsXG4gICAgdW5pdEtleSxcbiAgICBzZXRCdWZmZXJTdGF0ZSxcbiAgICB3aWR0aEtleSxcbiAgICBlcnJvckxpc3RlbmVyLFxuICB9ID0gcHJvcHNcbiAgY29uc3QgW2Jhc2VMaW5lRXJyb3IsIHNldEJhc2VMaW5lRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGUpXG4gIGNvbnN0IFtidWZmZXJFcnJvciwgc2V0QnVmZmVyRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocHJvcHMuZHJhd2luZykge1xuICAgICAgc2V0QmFzZUxpbmVFcnJvcihpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIHNldEJ1ZmZlckVycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBsaW5lVmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRlVXNuZ0xpbmVPclBvbHkoXG4gICAgICAgIHVzbmdQb2ludEFycmF5LFxuICAgICAgICBnZW9tZXRyeUtleVxuICAgICAgKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICd7IGVycm9yOiBib29sZWFuOyBtZXNzYWdlOiBzdHJpbi4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXRCYXNlTGluZUVycm9yKGxpbmVWYWxpZGF0aW9uUmVzdWx0IHx8IGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgY29uc3QgYnVmZmVyVmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRlR2VvKHdpZHRoS2V5LCB7XG4gICAgICAgIHZhbHVlOiBwcm9wc1t3aWR0aEtleV0sXG4gICAgICAgIHVuaXRzOiBwcm9wc1t1bml0S2V5XSxcbiAgICAgIH0pXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldEJ1ZmZlckVycm9yKGJ1ZmZlclZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBlcnJvckxpc3RlbmVyICYmXG4gICAgICAgIGVycm9yTGlzdGVuZXIoe1xuICAgICAgICAgIGxpbmU6IGxpbmVWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyVmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IGNsZWFyVmFsaWRhdGlvblJlc3VsdHMoZXJyb3JMaXN0ZW5lcilcbiAgfSwgW1xuICAgIHByb3BzLnBvbHlnb24sXG4gICAgcHJvcHMubGluZSxcbiAgICB1c25nUG9pbnRBcnJheSxcbiAgICBwcm9wcy5saW5lV2lkdGgsXG4gICAgcHJvcHMuYnVmZmVyV2lkdGgsXG4gICAgcHJvcHMucG9seWdvbkJ1ZmZlcldpZHRoLFxuICAgIHByb3BzLmxpbmVVbml0cyxcbiAgICBwcm9wcy5wb2x5Z29uQnVmZmVyVW5pdHMsXG4gIF0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbnB1dC1sb2NhdGlvbiBmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHNwYWNlLXktMlwiPlxuICAgICAgICB7dXNuZ1BvaW50QXJyYXkgJiZcbiAgICAgICAgICB1c25nUG9pbnRBcnJheS5tYXAoKGNvb3JkOiBhbnksIGluZGV4OiBhbnkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgICBrZXk9eydncmlkLScgKyBpbmRleH1cbiAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sga2V5OiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBhbnk7IG9uLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICBsYWJlbD1cIkdyaWRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtjb29yZH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBsZXQgcG9pbnRzID0gWy4uLnVzbmdQb2ludEFycmF5XVxuICAgICAgICAgICAgICAgICAgcG9pbnRzLnNwbGljZShpbmRleCwgMSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7IFsndXNuZ1BvaW50QXJyYXknXTogcG9pbnRzIH0pXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBhZGRvbj17XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBsZXQgcG9pbnRzID0gWy4uLnVzbmdQb2ludEFycmF5XVxuICAgICAgICAgICAgICAgICAgICAgIHBvaW50cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoeyBbJ3VzbmdQb2ludEFycmF5J106IHBvaW50cyB9KVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8Q2xvc2VJY29uIC8+XG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcG9pbnRzID0gdXNuZ1BvaW50QXJyYXkgPyBbLi4udXNuZ1BvaW50QXJyYXldIDogW11cbiAgICAgICAgICAgIHBvaW50cy5wdXNoKCcnKVxuICAgICAgICAgICAgc2V0U3RhdGUoeyBbJ3VzbmdQb2ludEFycmF5J106IHBvaW50cyB9KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBBZGQgUG9pbnRcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtiYXNlTGluZUVycm9yfSAvPlxuICAgICAgICA8VW5pdHNcbiAgICAgICAgICB2YWx1ZT17cHJvcHNbdW5pdEtleV19XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICB0eXBlb2Ygc2V0QnVmZmVyU3RhdGUgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgPyBzZXRCdWZmZXJTdGF0ZSh1bml0S2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgOiBzZXRTdGF0ZSh7IFt1bml0S2V5XTogdmFsdWUgfSlcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IHR5cGU6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgIGxhYmVsPVwiQnVmZmVyIHdpZHRoXCJcbiAgICAgICAgICAgIHZhbHVlPXtTdHJpbmcocHJvcHNbd2lkdGhLZXldKX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgdHlwZW9mIHNldEJ1ZmZlclN0YXRlID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgPyBzZXRCdWZmZXJTdGF0ZSh3aWR0aEtleSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgOiBzZXRTdGF0ZSh7IFt3aWR0aEtleV06IHZhbHVlIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvVW5pdHM+XG4gICAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtidWZmZXJFcnJvcn0gLz5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IExpbmVVdG1VcHMgPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7XG4gICAgZ2VvbWV0cnlLZXksXG4gICAgdXRtVXBzUG9pbnRBcnJheSxcbiAgICBzZXRTdGF0ZSxcbiAgICB1bml0S2V5LFxuICAgIHNldEJ1ZmZlclN0YXRlLFxuICAgIHdpZHRoS2V5LFxuICAgIGVycm9yTGlzdGVuZXIsXG4gIH0gPSBwcm9wc1xuICBjb25zdCBbYmFzZUxpbmVFcnJvciwgc2V0QmFzZUxpbmVFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcbiAgY29uc3QgW2J1ZmZlckVycm9yLCBzZXRCdWZmZXJFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcm9wcy5kcmF3aW5nKSB7XG4gICAgICBzZXRCYXNlTGluZUVycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgc2V0QnVmZmVyRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxpbmVWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVVdG1VcHNMaW5lT3JQb2x5KFxuICAgICAgICB1dG1VcHNQb2ludEFycmF5LFxuICAgICAgICBnZW9tZXRyeUtleVxuICAgICAgKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICd7IGVycm9yOiBib29sZWFuOyBtZXNzYWdlOiBzdHJpbi4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXRCYXNlTGluZUVycm9yKGxpbmVWYWxpZGF0aW9uUmVzdWx0IHx8IGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgY29uc3QgYnVmZmVyVmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRlR2VvKHdpZHRoS2V5LCB7XG4gICAgICAgIHZhbHVlOiBwcm9wc1t3aWR0aEtleV0sXG4gICAgICAgIHVuaXRzOiBwcm9wc1t1bml0S2V5XSxcbiAgICAgIH0pXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldEJ1ZmZlckVycm9yKGJ1ZmZlclZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBlcnJvckxpc3RlbmVyICYmXG4gICAgICAgIGVycm9yTGlzdGVuZXIoe1xuICAgICAgICAgIGxpbmU6IGxpbmVWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyVmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IGNsZWFyVmFsaWRhdGlvblJlc3VsdHMoZXJyb3JMaXN0ZW5lcilcbiAgfSwgW1xuICAgIHByb3BzLnBvbHlnb24sXG4gICAgcHJvcHMubGluZSxcbiAgICB1dG1VcHNQb2ludEFycmF5LFxuICAgIHByb3BzLmxpbmVXaWR0aCxcbiAgICBwcm9wcy5idWZmZXJXaWR0aCxcbiAgICBwcm9wcy5wb2x5Z29uQnVmZmVyV2lkdGgsXG4gICAgcHJvcHMubGluZVVuaXRzLFxuICAgIHByb3BzLnBvbHlnb25CdWZmZXJVbml0cyxcbiAgXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBzcGFjZS15LTJcIj5cbiAgICAgIHt1dG1VcHNQb2ludEFycmF5ICYmXG4gICAgICAgIHV0bVVwc1BvaW50QXJyYXkubWFwKChwb2ludDogYW55LCBpbmRleDogYW55KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYga2V5PXtpbmRleH0+XG4gICAgICAgICAgICAgIDxVdG11cHNUZXh0RmllbGRcbiAgICAgICAgICAgICAgICBwb2ludD17cG9pbnR9XG4gICAgICAgICAgICAgICAgc2V0UG9pbnQ9eyhwb2ludCkgPT4ge1xuICAgICAgICAgICAgICAgICAgbGV0IHBvaW50cyA9IFsuLi51dG1VcHNQb2ludEFycmF5XVxuICAgICAgICAgICAgICAgICAgcG9pbnRzLnNwbGljZShpbmRleCwgMSwgcG9pbnQpXG4gICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7IFsndXRtVXBzUG9pbnRBcnJheSddOiBwb2ludHMgfSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGRlbGV0ZVBvaW50PXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBsZXQgcG9pbnRzID0gWy4uLnV0bVVwc1BvaW50QXJyYXldXG4gICAgICAgICAgICAgICAgICBwb2ludHMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoeyBbJ3V0bVVwc1BvaW50QXJyYXknXTogcG9pbnRzIH0pXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPE1pbmltdW1TcGFjaW5nIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgPEJ1dHRvblxuICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGxldCBwb2ludHMgPSB1dG1VcHNQb2ludEFycmF5ID8gWy4uLnV0bVVwc1BvaW50QXJyYXldIDogW11cbiAgICAgICAgICBwb2ludHMucHVzaCh7XG4gICAgICAgICAgICBlYXN0aW5nOiAnJyxcbiAgICAgICAgICAgIGhlbWlzcGhlcmU6ICdOb3J0aGVybicsXG4gICAgICAgICAgICBub3J0aGluZzogJycsXG4gICAgICAgICAgICB6b25lTnVtYmVyOiAwLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgc2V0U3RhdGUoeyBbJ3V0bVVwc1BvaW50QXJyYXknXTogcG9pbnRzIH0pXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIEFkZCBQb2ludFxuICAgICAgPC9CdXR0b24+XG4gICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17YmFzZUxpbmVFcnJvcn0gLz5cbiAgICAgIDxVbml0c1xuICAgICAgICB2YWx1ZT17cHJvcHNbdW5pdEtleV19XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgIHR5cGVvZiBzZXRCdWZmZXJTdGF0ZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBzZXRCdWZmZXJTdGF0ZSh1bml0S2V5LCB2YWx1ZSlcbiAgICAgICAgICAgIDogc2V0U3RhdGUoeyBbdW5pdEtleV06IHZhbHVlIH0pXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICBsYWJlbD1cIkJ1ZmZlciB3aWR0aFwiXG4gICAgICAgICAgdmFsdWU9e1N0cmluZyhwcm9wc1t3aWR0aEtleV0pfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHR5cGVvZiBzZXRCdWZmZXJTdGF0ZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICA/IHNldEJ1ZmZlclN0YXRlKHdpZHRoS2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgOiBzZXRTdGF0ZSh7IFt3aWR0aEtleV06IHZhbHVlIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvVW5pdHM+XG4gICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17YnVmZmVyRXJyb3J9IC8+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgQmFzZUxpbmUgPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7IHNldFN0YXRlLCBsb2NhdGlvblR5cGUgfSA9IHByb3BzXG5cbiAgY29uc3QgaW5wdXRzID0ge1xuICAgIHVzbmc6IExpbmVNZ3JzLFxuICAgIGRkOiBMaW5lTGF0TG9uLFxuICAgIGRtczogTGluZURtcyxcbiAgICB1dG11cHM6IExpbmVVdG1VcHMsXG4gIH1cblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgY29uc3QgQ29tcG9uZW50ID0gaW5wdXRzW2xvY2F0aW9uVHlwZV0gfHwgbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxSYWRpb1xuICAgICAgICB2YWx1ZT17bG9jYXRpb25UeXBlfVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IHNldFN0YXRlKHsgWydsb2NhdGlvblR5cGUnXTogdmFsdWUgfSl9XG4gICAgICA+XG4gICAgICAgIDxSYWRpb0l0ZW0gdmFsdWU9XCJkZFwiPkxhdC9Mb24gKEREKTwvUmFkaW9JdGVtPlxuICAgICAgICA8UmFkaW9JdGVtIHZhbHVlPVwiZG1zXCI+TGF0L0xvbiAoRE1TKTwvUmFkaW9JdGVtPlxuICAgICAgICA8UmFkaW9JdGVtIHZhbHVlPVwidXNuZ1wiPlVTTkcgLyBNR1JTPC9SYWRpb0l0ZW0+XG4gICAgICAgIDxSYWRpb0l0ZW0gdmFsdWU9XCJ1dG11cHNcIj5VVE0gLyBVUFM8L1JhZGlvSXRlbT5cbiAgICAgIDwvUmFkaW8+XG4gICAgICA8TWluaW11bVNwYWNpbmcgLz5cbiAgICAgIHtDb21wb25lbnQgIT09IG51bGwgPyA8Q29tcG9uZW50IHsuLi5wcm9wc30gLz4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VMaW5lXG4iXX0=