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
//# sourceMappingURL=base.line.js.map