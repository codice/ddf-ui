import { __assign, __read } from "tslib";
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
import { validateGeo, ErrorComponent, initialErrorState, initialErrorStateWithDefault, } from '../utils/validation';
import Group from '../group';
import Label from './label';
import TextField from '../text-field';
import { Radio, RadioItem } from '../radio/radio';
import { Zone, Hemisphere, MinimumSpacing } from './common';
import { DmsLatitude, DmsLongitude, } from '../../component/location-new/geo-components/coordinates';
import DirectionInput from '../../component/location-new/geo-components/direction';
import { Direction } from '../../component/location-new/utils/dms-utils';
var clearValidationResults = function (errorListener) {
    errorListener &&
        errorListener({
            bbox: undefined,
            bboxUL: undefined,
            bboxLR: undefined,
        });
};
var BoundingBoxLatLonDd = function (props) {
    var north = props.north, east = props.east, south = props.south, west = props.west, setState = props.setState, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorStateWithDefault), 2), ddError = _a[0], setDdError = _a[1];
    useEffect(function () {
        if (props.drawing) {
            setDdError(initialErrorStateWithDefault);
        }
        else {
            var validationResults = [
                validateGeo('lon', west),
                validateGeo('lon', east),
                validateGeo('lat', north),
                validateGeo('lat', south),
                validateGeo('bbox', { north: north, south: south, west: west, east: east }),
            ];
            var validationResult = validationResults.find(function (validation) { return validation === null || validation === void 0 ? void 0 : validation.error; });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setDdError(validationResult || initialErrorStateWithDefault);
            errorListener && errorListener({ bbox: validationResult });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [props.east, props.west, props.south, props.north]);
    function clampDd(key, value) {
        var _a;
        var coordinateType = key.includes('east') || key.includes('west') ? 'lon' : 'lat';
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
        var defaultValue = validateGeo(coordinateType, value).defaultValue;
        setState((_a = {}, _a[key] = defaultValue || value, _a));
    }
    return (React.createElement("div", { className: "input-location flex flex-col flex-nowrap space-y-2" },
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            label: "West", value: west !== undefined ? String(west) : west, onChange: function (value) { return clampDd('west', value); }, type: "number", step: "any", min: -180, max: 180, addon: "\u00B0" }),
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            label: "South", value: south !== undefined ? String(south) : south, onChange: function (value) { return clampDd('south', value); }, type: "number", step: "any", min: -90, max: 90, addon: "\u00B0" }),
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            label: "East", value: east !== undefined ? String(east) : east, onChange: function (value) { return clampDd('east', value); }, type: "number", step: "any", min: -180, max: 180, addon: "\u00B0" }),
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            label: "North", value: north !== undefined ? String(north) : north, onChange: function (value) { return clampDd('north', value); }, type: "number", step: "any", min: -90, max: 90, addon: "\u00B0" }),
        React.createElement(ErrorComponent, { errorState: ddError })));
};
var BoundingBoxLatLonDms = function (props) {
    var dmsSouth = props.dmsSouth, dmsNorth = props.dmsNorth, dmsWest = props.dmsWest, dmsEast = props.dmsEast, dmsSouthDirection = props.dmsSouthDirection, dmsNorthDirection = props.dmsNorthDirection, dmsWestDirection = props.dmsWestDirection, dmsEastDirection = props.dmsEastDirection, setState = props.setState, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorStateWithDefault), 2), dmsError = _a[0], setDmsError = _a[1];
    var latitudeDirections = [Direction.North, Direction.South];
    var longitudeDirections = [Direction.East, Direction.West];
    useEffect(function () {
        if (props.drawing) {
            setDmsError(initialErrorStateWithDefault);
        }
        else {
            var validationResults = [
                validateGeo('dmsLon', dmsWest),
                validateGeo('dmsLon', dmsEast),
                validateGeo('dmsLat', dmsNorth),
                validateGeo('dmsLat', dmsSouth),
                validateGeo('bbox', {
                    isDms: true,
                    dmsNorthDirection: dmsNorthDirection,
                    dmsSouthDirection: dmsSouthDirection,
                    dmsWestDirection: dmsWestDirection,
                    dmsEastDirection: dmsEastDirection,
                    north: dmsNorth,
                    south: dmsSouth,
                    west: dmsWest,
                    east: dmsEast,
                }),
            ];
            var validationResult = validationResults.find(function (validation) { return validation === null || validation === void 0 ? void 0 : validation.error; });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setDmsError(validationResult || initialErrorStateWithDefault);
            errorListener && errorListener({ bbox: validationResult });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [props.dmsWest, props.dmsSouth, props.dmsEast, props.dmsNorth]);
    function clampDms(key, value) {
        var _a;
        var coordinateType = key.includes('East') || key.includes('West') ? 'dmsLon' : 'dmsLat';
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
        var defaultValue = validateGeo(coordinateType, value).defaultValue;
        setState((_a = {}, _a[key] = defaultValue || value, _a));
    }
    return (React.createElement("div", { className: "input-location flex flex-col flex-nowrap space-y-2" },
        React.createElement(DmsLongitude, { label: "West", value: dmsWest, onChange: function (value) { return clampDms('dmsWest', value); } },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: longitudeDirections, value: dmsWestDirection, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['dmsWestDirection'] = value, _a));
                } })),
        React.createElement(DmsLatitude, { label: "South", value: dmsSouth, onChange: function (value) { return clampDms('dmsSouth', value); } },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: latitudeDirections, value: dmsSouthDirection, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['dmsSouthDirection'] = value, _a));
                } })),
        React.createElement(DmsLongitude, { label: "East", value: dmsEast, onChange: function (value) { return clampDms('dmsEast', value); } },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: longitudeDirections, value: dmsEastDirection, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['dmsEastDirection'] = value, _a));
                } })),
        React.createElement(DmsLatitude, { label: "North", value: dmsNorth, onChange: function (value) { return clampDms('dmsNorth', value); } },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: latitudeDirections, value: dmsNorthDirection, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['dmsNorthDirection'] = value, _a));
                } })),
        React.createElement(ErrorComponent, { errorState: dmsError })));
};
var BoundingBoxUsngMgrs = function (props) {
    var usngbbUpperLeft = props.usngbbUpperLeft, usngbbLowerRight = props.usngbbLowerRight, setState = props.setState, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorState), 2), usngError = _a[0], setUsngError = _a[1];
    useEffect(function () {
        if (props.drawing) {
            setUsngError(initialErrorState);
        }
        else {
            var validationResult = [
                validateGeo('usng', usngbbUpperLeft),
                validateGeo('usng', usngbbLowerRight),
                validateGeo('bbox', {
                    isUsng: true,
                    upperLeft: usngbbUpperLeft,
                    lowerRight: usngbbLowerRight,
                }),
            ].find(function (validation) { return validation === null || validation === void 0 ? void 0 : validation.error; });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setUsngError(validationResult || initialErrorState);
            errorListener && errorListener({ bbox: validationResult });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [props.usngbbUpperLeft, props.usngbbLowerRight]);
    return (React.createElement("div", { className: "input-location flex flex-col flex-nowrap space-y-2" },
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; style: { minWidth: number; ... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; style: { minWidth: number; ... Remove this comment to see the full error message
            label: "Upper Left", style: { minWidth: 200 }, value: usngbbUpperLeft, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['usngbbUpperLeft'] = value, _a));
            } }),
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; style: { minWidth: number; ... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; style: { minWidth: number; ... Remove this comment to see the full error message
            label: "Lower Right", style: { minWidth: 200 }, value: usngbbLowerRight, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['usngbbLowerRight'] = value, _a));
            } }),
        React.createElement(ErrorComponent, { errorState: usngError })));
};
var BoundingBoxUtmUps = function (props) {
    var utmUpsUpperLeftEasting = props.utmUpsUpperLeftEasting, utmUpsUpperLeftNorthing = props.utmUpsUpperLeftNorthing, utmUpsUpperLeftZone = props.utmUpsUpperLeftZone, utmUpsUpperLeftHemisphere = props.utmUpsUpperLeftHemisphere, utmUpsLowerRightEasting = props.utmUpsLowerRightEasting, utmUpsLowerRightNorthing = props.utmUpsLowerRightNorthing, utmUpsLowerRightZone = props.utmUpsLowerRightZone, utmUpsLowerRightHemisphere = props.utmUpsLowerRightHemisphere, setState = props.setState, errorListener = props.errorListener;
    var upperLeft = {
        easting: utmUpsUpperLeftEasting,
        northing: utmUpsUpperLeftNorthing,
        zoneNumber: utmUpsUpperLeftZone,
        hemisphere: utmUpsUpperLeftHemisphere,
    };
    var lowerRight = {
        easting: utmUpsLowerRightEasting,
        northing: utmUpsLowerRightNorthing,
        zoneNumber: utmUpsLowerRightZone,
        hemisphere: utmUpsLowerRightHemisphere,
    };
    var _a = __read(useState(initialErrorState), 2), upperLeftError = _a[0], setUpperLeftError = _a[1];
    var _b = __read(useState(initialErrorState), 2), lowerRightError = _b[0], setLowerRightError = _b[1];
    useEffect(function () {
        if (props.drawing) {
            setUpperLeftError(initialErrorState);
            setLowerRightError(initialErrorState);
        }
        else {
            var upperLeftValidationResult = [
                validateGeo('easting', upperLeft),
                validateGeo('northing', upperLeft),
                validateGeo('zoneNumber', upperLeft),
                validateGeo('hemisphere', upperLeft),
            ].find(function (validation) { return validation === null || validation === void 0 ? void 0 : validation.error; });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setUpperLeftError(upperLeftValidationResult || initialErrorState);
            var lowerRightValidationResult = [
                validateGeo('easting', lowerRight),
                validateGeo('northing', lowerRight),
                validateGeo('zoneNumber', lowerRight),
                validateGeo('hemisphere', lowerRight),
                validateGeo('bbox', { isUtmUps: true, upperLeft: upperLeft, lowerRight: lowerRight }),
            ].find(function (validation) { return validation === null || validation === void 0 ? void 0 : validation.error; });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setLowerRightError(lowerRightValidationResult || initialErrorState);
            errorListener &&
                errorListener({
                    bboxUL: upperLeftValidationResult,
                    bboxLR: lowerRightValidationResult,
                });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [
        props.utmUpsUpperLeftEasting,
        props.utmUpsUpperLeftNorthing,
        props.utmUpsUpperLeftZone,
        props.utmUpsUpperLeftHemisphere,
        props.utmUpsLowerRightEasting,
        props.utmUpsLowerRightNorthing,
        props.utmUpsLowerRightZone,
        props.utmUpsLowerRightHemisphere,
    ]);
    return (React.createElement("div", null,
        React.createElement("div", { className: "input-location mb-2" },
            React.createElement(Group, null,
                React.createElement(Label, null, "Upper Left"),
                React.createElement("div", { className: "flex flex-col space-y-2" },
                    React.createElement(TextField
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                    , { 
                        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                        label: "Easting", value: utmUpsUpperLeftEasting !== undefined
                            ? String(utmUpsUpperLeftEasting)
                            : utmUpsUpperLeftEasting, onChange: function (value) {
                            var _a;
                            return setState((_a = {}, _a['utmUpsUpperLeftEasting'] = value, _a));
                        }, addon: "m" }),
                    React.createElement(TextField
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                    , { 
                        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                        label: "Northing", value: utmUpsUpperLeftNorthing !== undefined
                            ? String(utmUpsUpperLeftNorthing)
                            : utmUpsUpperLeftNorthing, onChange: function (value) {
                            var _a;
                            return setState((_a = {}, _a['utmUpsUpperLeftNorthing'] = value, _a));
                        }, addon: "m" }),
                    React.createElement(Zone, { value: utmUpsUpperLeftZone, onChange: function (value) {
                            var _a;
                            return setState((_a = {}, _a['utmUpsUpperLeftZone'] = value, _a));
                        } }),
                    React.createElement(Hemisphere, { value: utmUpsUpperLeftHemisphere, onChange: function (value) {
                            var _a;
                            return setState((_a = {}, _a['utmUpsUpperLeftHemisphere'] = value, _a));
                        } }))),
            React.createElement(ErrorComponent, { errorState: upperLeftError })),
        React.createElement("div", { className: "input-location" },
            React.createElement(Group, null,
                React.createElement(Label, null, "Lower Right"),
                React.createElement("div", { className: "flex flex-col space-y-2" },
                    React.createElement(TextField
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                    , { 
                        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                        label: "Easting", value: utmUpsLowerRightEasting !== undefined
                            ? String(utmUpsLowerRightEasting)
                            : utmUpsLowerRightEasting, onChange: function (value) {
                            var _a;
                            return setState((_a = {}, _a['utmUpsLowerRightEasting'] = value, _a));
                        }, addon: "m" }),
                    React.createElement(TextField
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                    , { 
                        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                        label: "Northing", value: utmUpsLowerRightNorthing !== undefined
                            ? String(utmUpsLowerRightNorthing)
                            : utmUpsLowerRightNorthing, onChange: function (value) {
                            var _a;
                            return setState((_a = {}, _a['utmUpsLowerRightNorthing'] = value, _a));
                        }, addon: "m" }),
                    React.createElement(Zone, { value: utmUpsLowerRightZone, onChange: function (value) {
                            var _a;
                            return setState((_a = {}, _a['utmUpsLowerRightZone'] = value, _a));
                        } }),
                    React.createElement(Hemisphere, { value: utmUpsLowerRightHemisphere, onChange: function (value) {
                            var _a;
                            return setState((_a = {}, _a['utmUpsLowerRightHemisphere'] = value, _a));
                        } }))),
            React.createElement(ErrorComponent, { errorState: lowerRightError }))));
};
var BoundingBox = function (props) {
    var setState = props.setState, locationType = props.locationType;
    var inputs = {
        dd: BoundingBoxLatLonDd,
        dms: BoundingBoxLatLonDms,
        usng: BoundingBoxUsngMgrs,
        utmUps: BoundingBoxUtmUps,
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
            React.createElement(RadioItem, { value: "utmUps" }, "UTM / UPS")),
        React.createElement(MinimumSpacing, null),
        Component !== null ? React.createElement(Component, __assign({}, props)) : null));
};
export default BoundingBox;
//# sourceMappingURL=bounding-box.js.map