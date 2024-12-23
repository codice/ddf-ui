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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRpbmctYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9ib3VuZGluZy1ib3gudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQ2xELE9BQU8sRUFDTCxXQUFXLEVBQ1gsY0FBYyxFQUNkLGlCQUFpQixFQUNqQiw0QkFBNEIsR0FDN0IsTUFBTSxxQkFBcUIsQ0FBQTtBQUM1QixPQUFPLEtBQUssTUFBTSxVQUFVLENBQUE7QUFDNUIsT0FBTyxLQUFLLE1BQU0sU0FBUyxDQUFBO0FBQzNCLE9BQU8sU0FBUyxNQUFNLGVBQWUsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ2pELE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUMzRCxPQUFPLEVBQ0wsV0FBVyxFQUNYLFlBQVksR0FDYixNQUFNLHlEQUF5RCxDQUFBO0FBQ2hFLE9BQU8sY0FBYyxNQUFNLHVEQUF1RCxDQUFBO0FBQ2xGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUV4RSxJQUFNLHNCQUFzQixHQUFHLFVBQUMsYUFBbUI7SUFDakQsYUFBYTtRQUNYLGFBQWEsQ0FBQztZQUNaLElBQUksRUFBRSxTQUFTO1lBQ2YsTUFBTSxFQUFFLFNBQVM7WUFDakIsTUFBTSxFQUFFLFNBQVM7U0FDbEIsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFBO0FBRUQsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLEtBQVU7SUFDN0IsSUFBQSxLQUFLLEdBQWlELEtBQUssTUFBdEQsRUFBRSxJQUFJLEdBQTJDLEtB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QUssRUFBRSxZQUFZLEVBQ25CLFFBQVEsRUFBRSxVQUFDLEtBQVU7O2dCQUFLLE9BQUEsUUFBUSxXQUFHLEdBQUMsY0FBYyxJQUFHLEtBQUssTUFBRztZQUFyQyxDQUFxQztZQUUvRCxvQkFBQyxTQUFTLElBQUMsS0FBSyxFQUFDLElBQUksbUJBQXlCO1lBQzlDLG9CQUFDLFNBQVMsSUFBQyxLQUFLLEVBQUMsS0FBSyxvQkFBMEI7WUFDaEQsb0JBQUMsU0FBUyxJQUFDLEtBQUssRUFBQyxNQUFNLGtCQUF3QjtZQUMvQyxvQkFBQyxTQUFTLElBQUMsS0FBSyxFQUFDLFFBQVEsZ0JBQXNCLENBQ3pDO1FBQ1Isb0JBQUMsY0FBYyxPQUFHO1FBQ2pCLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFDLFNBQVMsZUFBSyxLQUFLLEVBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNqRCxDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFdBQVcsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7XG4gIHZhbGlkYXRlR2VvLFxuICBFcnJvckNvbXBvbmVudCxcbiAgaW5pdGlhbEVycm9yU3RhdGUsXG4gIGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQsXG59IGZyb20gJy4uL3V0aWxzL3ZhbGlkYXRpb24nXG5pbXBvcnQgR3JvdXAgZnJvbSAnLi4vZ3JvdXAnXG5pbXBvcnQgTGFiZWwgZnJvbSAnLi9sYWJlbCdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnLi4vdGV4dC1maWVsZCdcbmltcG9ydCB7IFJhZGlvLCBSYWRpb0l0ZW0gfSBmcm9tICcuLi9yYWRpby9yYWRpbydcbmltcG9ydCB7IFpvbmUsIEhlbWlzcGhlcmUsIE1pbmltdW1TcGFjaW5nIH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQge1xuICBEbXNMYXRpdHVkZSxcbiAgRG1zTG9uZ2l0dWRlLFxufSBmcm9tICcuLi8uLi9jb21wb25lbnQvbG9jYXRpb24tbmV3L2dlby1jb21wb25lbnRzL2Nvb3JkaW5hdGVzJ1xuaW1wb3J0IERpcmVjdGlvbklucHV0IGZyb20gJy4uLy4uL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvZ2VvLWNvbXBvbmVudHMvZGlyZWN0aW9uJ1xuaW1wb3J0IHsgRGlyZWN0aW9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2xvY2F0aW9uLW5ldy91dGlscy9kbXMtdXRpbHMnXG5cbmNvbnN0IGNsZWFyVmFsaWRhdGlvblJlc3VsdHMgPSAoZXJyb3JMaXN0ZW5lcj86IGFueSkgPT4ge1xuICBlcnJvckxpc3RlbmVyICYmXG4gICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICBiYm94OiB1bmRlZmluZWQsXG4gICAgICBiYm94VUw6IHVuZGVmaW5lZCxcbiAgICAgIGJib3hMUjogdW5kZWZpbmVkLFxuICAgIH0pXG59XG5cbmNvbnN0IEJvdW5kaW5nQm94TGF0TG9uRGQgPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7IG5vcnRoLCBlYXN0LCBzb3V0aCwgd2VzdCwgc2V0U3RhdGUsIGVycm9yTGlzdGVuZXIgfSA9IHByb3BzXG4gIGNvbnN0IFtkZEVycm9yLCBzZXREZEVycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocHJvcHMuZHJhd2luZykge1xuICAgICAgc2V0RGRFcnJvcihpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0cyA9IFtcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2xvbicsIHdlc3QpLFxuICAgICAgICB2YWxpZGF0ZUdlbygnbG9uJywgZWFzdCksXG4gICAgICAgIHZhbGlkYXRlR2VvKCdsYXQnLCBub3J0aCksXG4gICAgICAgIHZhbGlkYXRlR2VvKCdsYXQnLCBzb3V0aCksXG4gICAgICAgIHZhbGlkYXRlR2VvKCdiYm94JywgeyBub3J0aCwgc291dGgsIHdlc3QsIGVhc3QgfSksXG4gICAgICBdXG4gICAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGlvblJlc3VsdHMuZmluZChcbiAgICAgICAgKHZhbGlkYXRpb24pID0+IHZhbGlkYXRpb24/LmVycm9yXG4gICAgICApXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldERkRXJyb3IodmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0KVxuICAgICAgZXJyb3JMaXN0ZW5lciAmJiBlcnJvckxpc3RlbmVyKHsgYmJveDogdmFsaWRhdGlvblJlc3VsdCB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbcHJvcHMuZWFzdCwgcHJvcHMud2VzdCwgcHJvcHMuc291dGgsIHByb3BzLm5vcnRoXSlcblxuICBmdW5jdGlvbiBjbGFtcERkKGtleTogYW55LCB2YWx1ZTogYW55KSB7XG4gICAgY29uc3QgY29vcmRpbmF0ZVR5cGUgPVxuICAgICAga2V5LmluY2x1ZGVzKCdlYXN0JykgfHwga2V5LmluY2x1ZGVzKCd3ZXN0JykgPyAnbG9uJyA6ICdsYXQnXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMzkpIEZJWE1FOiBQcm9wZXJ0eSAnZXJyb3InIGRvZXMgbm90IGV4aXN0IG9uIHR5cGUgJ3sgZXJyb3I6IC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgY29uc3QgeyBkZWZhdWx0VmFsdWUgfSA9IHZhbGlkYXRlR2VvKGNvb3JkaW5hdGVUeXBlLCB2YWx1ZSlcbiAgICBzZXRTdGF0ZSh7IFtrZXldOiBkZWZhdWx0VmFsdWUgfHwgdmFsdWUgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJpbnB1dC1sb2NhdGlvbiBmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHNwYWNlLXktMlwiPlxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGFueTsgb25DaGFuZ2U6ICh2YWx1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbGFiZWw9XCJXZXN0XCJcbiAgICAgICAgdmFsdWU9e3dlc3QgIT09IHVuZGVmaW5lZCA/IFN0cmluZyh3ZXN0KSA6IHdlc3R9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IGNsYW1wRGQoJ3dlc3QnLCB2YWx1ZSl9XG4gICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICBzdGVwPVwiYW55XCJcbiAgICAgICAgbWluPXstMTgwfVxuICAgICAgICBtYXg9ezE4MH1cbiAgICAgICAgYWRkb249XCLCsFwiXG4gICAgICAvPlxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGFueTsgb25DaGFuZ2U6ICh2YWx1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbGFiZWw9XCJTb3V0aFwiXG4gICAgICAgIHZhbHVlPXtzb3V0aCAhPT0gdW5kZWZpbmVkID8gU3RyaW5nKHNvdXRoKSA6IHNvdXRofVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBjbGFtcERkKCdzb3V0aCcsIHZhbHVlKX1cbiAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgIHN0ZXA9XCJhbnlcIlxuICAgICAgICBtaW49ey05MH1cbiAgICAgICAgbWF4PXs5MH1cbiAgICAgICAgYWRkb249XCLCsFwiXG4gICAgICAvPlxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGFueTsgb25DaGFuZ2U6ICh2YWx1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbGFiZWw9XCJFYXN0XCJcbiAgICAgICAgdmFsdWU9e2Vhc3QgIT09IHVuZGVmaW5lZCA/IFN0cmluZyhlYXN0KSA6IGVhc3R9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IGNsYW1wRGQoJ2Vhc3QnLCB2YWx1ZSl9XG4gICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICBzdGVwPVwiYW55XCJcbiAgICAgICAgbWluPXstMTgwfVxuICAgICAgICBtYXg9ezE4MH1cbiAgICAgICAgYWRkb249XCLCsFwiXG4gICAgICAvPlxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGFueTsgb25DaGFuZ2U6ICh2YWx1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbGFiZWw9XCJOb3J0aFwiXG4gICAgICAgIHZhbHVlPXtub3J0aCAhPT0gdW5kZWZpbmVkID8gU3RyaW5nKG5vcnRoKSA6IG5vcnRofVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBjbGFtcERkKCdub3J0aCcsIHZhbHVlKX1cbiAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgIHN0ZXA9XCJhbnlcIlxuICAgICAgICBtaW49ey05MH1cbiAgICAgICAgbWF4PXs5MH1cbiAgICAgICAgYWRkb249XCLCsFwiXG4gICAgICAvPlxuICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e2RkRXJyb3J9IC8+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgQm91bmRpbmdCb3hMYXRMb25EbXMgPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7XG4gICAgZG1zU291dGgsXG4gICAgZG1zTm9ydGgsXG4gICAgZG1zV2VzdCxcbiAgICBkbXNFYXN0LFxuICAgIGRtc1NvdXRoRGlyZWN0aW9uLFxuICAgIGRtc05vcnRoRGlyZWN0aW9uLFxuICAgIGRtc1dlc3REaXJlY3Rpb24sXG4gICAgZG1zRWFzdERpcmVjdGlvbixcbiAgICBzZXRTdGF0ZSxcbiAgICBlcnJvckxpc3RlbmVyLFxuICB9ID0gcHJvcHNcbiAgY29uc3QgW2Rtc0Vycm9yLCBzZXREbXNFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0KVxuICBjb25zdCBsYXRpdHVkZURpcmVjdGlvbnMgPSBbRGlyZWN0aW9uLk5vcnRoLCBEaXJlY3Rpb24uU291dGhdXG4gIGNvbnN0IGxvbmdpdHVkZURpcmVjdGlvbnMgPSBbRGlyZWN0aW9uLkVhc3QsIERpcmVjdGlvbi5XZXN0XVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHByb3BzLmRyYXdpbmcpIHtcbiAgICAgIHNldERtc0Vycm9yKGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHRzID0gW1xuICAgICAgICB2YWxpZGF0ZUdlbygnZG1zTG9uJywgZG1zV2VzdCksXG4gICAgICAgIHZhbGlkYXRlR2VvKCdkbXNMb24nLCBkbXNFYXN0KSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2Rtc0xhdCcsIGRtc05vcnRoKSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2Rtc0xhdCcsIGRtc1NvdXRoKSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2Jib3gnLCB7XG4gICAgICAgICAgaXNEbXM6IHRydWUsXG4gICAgICAgICAgZG1zTm9ydGhEaXJlY3Rpb24sXG4gICAgICAgICAgZG1zU291dGhEaXJlY3Rpb24sXG4gICAgICAgICAgZG1zV2VzdERpcmVjdGlvbixcbiAgICAgICAgICBkbXNFYXN0RGlyZWN0aW9uLFxuICAgICAgICAgIG5vcnRoOiBkbXNOb3J0aCxcbiAgICAgICAgICBzb3V0aDogZG1zU291dGgsXG4gICAgICAgICAgd2VzdDogZG1zV2VzdCxcbiAgICAgICAgICBlYXN0OiBkbXNFYXN0LFxuICAgICAgICB9KSxcbiAgICAgIF1cbiAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0aW9uUmVzdWx0cy5maW5kKFxuICAgICAgICAodmFsaWRhdGlvbikgPT4gdmFsaWRhdGlvbj8uZXJyb3JcbiAgICAgIClcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0RG1zRXJyb3IodmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0KVxuICAgICAgZXJyb3JMaXN0ZW5lciAmJiBlcnJvckxpc3RlbmVyKHsgYmJveDogdmFsaWRhdGlvblJlc3VsdCB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbcHJvcHMuZG1zV2VzdCwgcHJvcHMuZG1zU291dGgsIHByb3BzLmRtc0Vhc3QsIHByb3BzLmRtc05vcnRoXSlcblxuICBmdW5jdGlvbiBjbGFtcERtcyhrZXk6IGFueSwgdmFsdWU6IGFueSkge1xuICAgIGNvbnN0IGNvb3JkaW5hdGVUeXBlID1cbiAgICAgIGtleS5pbmNsdWRlcygnRWFzdCcpIHx8IGtleS5pbmNsdWRlcygnV2VzdCcpID8gJ2Rtc0xvbicgOiAnZG1zTGF0J1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzM5KSBGSVhNRTogUHJvcGVydHkgJ2Vycm9yJyBkb2VzIG5vdCBleGlzdCBvbiB0eXBlICd7IGVycm9yOiAuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgIGNvbnN0IHsgZGVmYXVsdFZhbHVlIH0gPSB2YWxpZGF0ZUdlbyhjb29yZGluYXRlVHlwZSwgdmFsdWUpXG4gICAgc2V0U3RhdGUoeyBba2V5XTogZGVmYXVsdFZhbHVlIHx8IHZhbHVlIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5wdXQtbG9jYXRpb24gZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBzcGFjZS15LTJcIj5cbiAgICAgIDxEbXNMb25naXR1ZGVcbiAgICAgICAgbGFiZWw9XCJXZXN0XCJcbiAgICAgICAgdmFsdWU9e2Rtc1dlc3R9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gY2xhbXBEbXMoJ2Rtc1dlc3QnLCB2YWx1ZSl9XG4gICAgICA+XG4gICAgICAgIDxEaXJlY3Rpb25JbnB1dFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNzY5KSBGSVhNRTogTm8gb3ZlcmxvYWQgbWF0Y2hlcyB0aGlzIGNhbGwuXG4gICAgICAgICAgb3B0aW9ucz17bG9uZ2l0dWRlRGlyZWN0aW9uc31cbiAgICAgICAgICB2YWx1ZT17ZG1zV2VzdERpcmVjdGlvbn1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IHNldFN0YXRlKHsgWydkbXNXZXN0RGlyZWN0aW9uJ106IHZhbHVlIH0pfVxuICAgICAgICAvPlxuICAgICAgPC9EbXNMb25naXR1ZGU+XG4gICAgICA8RG1zTGF0aXR1ZGVcbiAgICAgICAgbGFiZWw9XCJTb3V0aFwiXG4gICAgICAgIHZhbHVlPXtkbXNTb3V0aH1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBjbGFtcERtcygnZG1zU291dGgnLCB2YWx1ZSl9XG4gICAgICA+XG4gICAgICAgIDxEaXJlY3Rpb25JbnB1dFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNzY5KSBGSVhNRTogTm8gb3ZlcmxvYWQgbWF0Y2hlcyB0aGlzIGNhbGwuXG4gICAgICAgICAgb3B0aW9ucz17bGF0aXR1ZGVEaXJlY3Rpb25zfVxuICAgICAgICAgIHZhbHVlPXtkbXNTb3V0aERpcmVjdGlvbn1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IHNldFN0YXRlKHsgWydkbXNTb3V0aERpcmVjdGlvbiddOiB2YWx1ZSB9KX1cbiAgICAgICAgLz5cbiAgICAgIDwvRG1zTGF0aXR1ZGU+XG4gICAgICA8RG1zTG9uZ2l0dWRlXG4gICAgICAgIGxhYmVsPVwiRWFzdFwiXG4gICAgICAgIHZhbHVlPXtkbXNFYXN0fVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IGNsYW1wRG1zKCdkbXNFYXN0JywgdmFsdWUpfVxuICAgICAgPlxuICAgICAgICA8RGlyZWN0aW9uSW5wdXRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc2OSkgRklYTUU6IE5vIG92ZXJsb2FkIG1hdGNoZXMgdGhpcyBjYWxsLlxuICAgICAgICAgIG9wdGlvbnM9e2xvbmdpdHVkZURpcmVjdGlvbnN9XG4gICAgICAgICAgdmFsdWU9e2Rtc0Vhc3REaXJlY3Rpb259XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBzZXRTdGF0ZSh7IFsnZG1zRWFzdERpcmVjdGlvbiddOiB2YWx1ZSB9KX1cbiAgICAgICAgLz5cbiAgICAgIDwvRG1zTG9uZ2l0dWRlPlxuICAgICAgPERtc0xhdGl0dWRlXG4gICAgICAgIGxhYmVsPVwiTm9ydGhcIlxuICAgICAgICB2YWx1ZT17ZG1zTm9ydGh9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gY2xhbXBEbXMoJ2Rtc05vcnRoJywgdmFsdWUpfVxuICAgICAgPlxuICAgICAgICA8RGlyZWN0aW9uSW5wdXRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc2OSkgRklYTUU6IE5vIG92ZXJsb2FkIG1hdGNoZXMgdGhpcyBjYWxsLlxuICAgICAgICAgIG9wdGlvbnM9e2xhdGl0dWRlRGlyZWN0aW9uc31cbiAgICAgICAgICB2YWx1ZT17ZG1zTm9ydGhEaXJlY3Rpb259XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBzZXRTdGF0ZSh7IFsnZG1zTm9ydGhEaXJlY3Rpb24nXTogdmFsdWUgfSl9XG4gICAgICAgIC8+XG4gICAgICA8L0Rtc0xhdGl0dWRlPlxuICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e2Rtc0Vycm9yfSAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IEJvdW5kaW5nQm94VXNuZ01ncnMgPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7IHVzbmdiYlVwcGVyTGVmdCwgdXNuZ2JiTG93ZXJSaWdodCwgc2V0U3RhdGUsIGVycm9yTGlzdGVuZXIgfSA9IHByb3BzXG4gIGNvbnN0IFt1c25nRXJyb3IsIHNldFVzbmdFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcm9wcy5kcmF3aW5nKSB7XG4gICAgICBzZXRVc25nRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICAgIHZhbGlkYXRlR2VvKCd1c25nJywgdXNuZ2JiVXBwZXJMZWZ0KSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ3VzbmcnLCB1c25nYmJMb3dlclJpZ2h0KSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2Jib3gnLCB7XG4gICAgICAgICAgaXNVc25nOiB0cnVlLFxuICAgICAgICAgIHVwcGVyTGVmdDogdXNuZ2JiVXBwZXJMZWZ0LFxuICAgICAgICAgIGxvd2VyUmlnaHQ6IHVzbmdiYkxvd2VyUmlnaHQsXG4gICAgICAgIH0pLFxuICAgICAgXS5maW5kKCh2YWxpZGF0aW9uKSA9PiB2YWxpZGF0aW9uPy5lcnJvcilcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0VXNuZ0Vycm9yKHZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBlcnJvckxpc3RlbmVyICYmIGVycm9yTGlzdGVuZXIoeyBiYm94OiB2YWxpZGF0aW9uUmVzdWx0IH0pXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiBjbGVhclZhbGlkYXRpb25SZXN1bHRzKGVycm9yTGlzdGVuZXIpXG4gIH0sIFtwcm9wcy51c25nYmJVcHBlckxlZnQsIHByb3BzLnVzbmdiYkxvd2VyUmlnaHRdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJpbnB1dC1sb2NhdGlvbiBmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHNwYWNlLXktMlwiPlxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgc3R5bGU6IHsgbWluV2lkdGg6IG51bWJlcjsgLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbGFiZWw9XCJVcHBlciBMZWZ0XCJcbiAgICAgICAgc3R5bGU9e3sgbWluV2lkdGg6IDIwMCB9fVxuICAgICAgICB2YWx1ZT17dXNuZ2JiVXBwZXJMZWZ0fVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRTdGF0ZSh7IFsndXNuZ2JiVXBwZXJMZWZ0J106IHZhbHVlIH0pfVxuICAgICAgLz5cbiAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IGxhYmVsOiBzdHJpbmc7IHN0eWxlOiB7IG1pbldpZHRoOiBudW1iZXI7IC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGxhYmVsPVwiTG93ZXIgUmlnaHRcIlxuICAgICAgICBzdHlsZT17eyBtaW5XaWR0aDogMjAwIH19XG4gICAgICAgIHZhbHVlPXt1c25nYmJMb3dlclJpZ2h0fVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRTdGF0ZSh7IFsndXNuZ2JiTG93ZXJSaWdodCddOiB2YWx1ZSB9KX1cbiAgICAgIC8+XG4gICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17dXNuZ0Vycm9yfSAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IEJvdW5kaW5nQm94VXRtVXBzID0gKHByb3BzOiBhbnkpID0+IHtcbiAgY29uc3Qge1xuICAgIHV0bVVwc1VwcGVyTGVmdEVhc3RpbmcsXG4gICAgdXRtVXBzVXBwZXJMZWZ0Tm9ydGhpbmcsXG4gICAgdXRtVXBzVXBwZXJMZWZ0Wm9uZSxcbiAgICB1dG1VcHNVcHBlckxlZnRIZW1pc3BoZXJlLFxuICAgIHV0bVVwc0xvd2VyUmlnaHRFYXN0aW5nLFxuICAgIHV0bVVwc0xvd2VyUmlnaHROb3J0aGluZyxcbiAgICB1dG1VcHNMb3dlclJpZ2h0Wm9uZSxcbiAgICB1dG1VcHNMb3dlclJpZ2h0SGVtaXNwaGVyZSxcbiAgICBzZXRTdGF0ZSxcbiAgICBlcnJvckxpc3RlbmVyLFxuICB9ID0gcHJvcHNcbiAgY29uc3QgdXBwZXJMZWZ0ID0ge1xuICAgIGVhc3Rpbmc6IHV0bVVwc1VwcGVyTGVmdEVhc3RpbmcsXG4gICAgbm9ydGhpbmc6IHV0bVVwc1VwcGVyTGVmdE5vcnRoaW5nLFxuICAgIHpvbmVOdW1iZXI6IHV0bVVwc1VwcGVyTGVmdFpvbmUsXG4gICAgaGVtaXNwaGVyZTogdXRtVXBzVXBwZXJMZWZ0SGVtaXNwaGVyZSxcbiAgfVxuICBjb25zdCBsb3dlclJpZ2h0ID0ge1xuICAgIGVhc3Rpbmc6IHV0bVVwc0xvd2VyUmlnaHRFYXN0aW5nLFxuICAgIG5vcnRoaW5nOiB1dG1VcHNMb3dlclJpZ2h0Tm9ydGhpbmcsXG4gICAgem9uZU51bWJlcjogdXRtVXBzTG93ZXJSaWdodFpvbmUsXG4gICAgaGVtaXNwaGVyZTogdXRtVXBzTG93ZXJSaWdodEhlbWlzcGhlcmUsXG4gIH1cbiAgY29uc3QgW3VwcGVyTGVmdEVycm9yLCBzZXRVcHBlckxlZnRFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcbiAgY29uc3QgW2xvd2VyUmlnaHRFcnJvciwgc2V0TG93ZXJSaWdodEVycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHByb3BzLmRyYXdpbmcpIHtcbiAgICAgIHNldFVwcGVyTGVmdEVycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgc2V0TG93ZXJSaWdodEVycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB1cHBlckxlZnRWYWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgICB2YWxpZGF0ZUdlbygnZWFzdGluZycsIHVwcGVyTGVmdCksXG4gICAgICAgIHZhbGlkYXRlR2VvKCdub3J0aGluZycsIHVwcGVyTGVmdCksXG4gICAgICAgIHZhbGlkYXRlR2VvKCd6b25lTnVtYmVyJywgdXBwZXJMZWZ0KSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2hlbWlzcGhlcmUnLCB1cHBlckxlZnQpLFxuICAgICAgXS5maW5kKCh2YWxpZGF0aW9uKSA9PiB2YWxpZGF0aW9uPy5lcnJvcilcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0VXBwZXJMZWZ0RXJyb3IodXBwZXJMZWZ0VmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGNvbnN0IGxvd2VyUmlnaHRWYWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgICB2YWxpZGF0ZUdlbygnZWFzdGluZycsIGxvd2VyUmlnaHQpLFxuICAgICAgICB2YWxpZGF0ZUdlbygnbm9ydGhpbmcnLCBsb3dlclJpZ2h0KSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ3pvbmVOdW1iZXInLCBsb3dlclJpZ2h0KSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2hlbWlzcGhlcmUnLCBsb3dlclJpZ2h0KSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2Jib3gnLCB7IGlzVXRtVXBzOiB0cnVlLCB1cHBlckxlZnQsIGxvd2VyUmlnaHQgfSksXG4gICAgICBdLmZpbmQoKHZhbGlkYXRpb24pID0+IHZhbGlkYXRpb24/LmVycm9yKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICd7IGVycm9yOiBib29sZWFuOyBtZXNzYWdlOiBzdHJpbi4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXRMb3dlclJpZ2h0RXJyb3IobG93ZXJSaWdodFZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBlcnJvckxpc3RlbmVyICYmXG4gICAgICAgIGVycm9yTGlzdGVuZXIoe1xuICAgICAgICAgIGJib3hVTDogdXBwZXJMZWZ0VmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgICBiYm94TFI6IGxvd2VyUmlnaHRWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbXG4gICAgcHJvcHMudXRtVXBzVXBwZXJMZWZ0RWFzdGluZyxcbiAgICBwcm9wcy51dG1VcHNVcHBlckxlZnROb3J0aGluZyxcbiAgICBwcm9wcy51dG1VcHNVcHBlckxlZnRab25lLFxuICAgIHByb3BzLnV0bVVwc1VwcGVyTGVmdEhlbWlzcGhlcmUsXG4gICAgcHJvcHMudXRtVXBzTG93ZXJSaWdodEVhc3RpbmcsXG4gICAgcHJvcHMudXRtVXBzTG93ZXJSaWdodE5vcnRoaW5nLFxuICAgIHByb3BzLnV0bVVwc0xvd2VyUmlnaHRab25lLFxuICAgIHByb3BzLnV0bVVwc0xvd2VyUmlnaHRIZW1pc3BoZXJlLFxuICBdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5wdXQtbG9jYXRpb24gbWItMlwiPlxuICAgICAgICA8R3JvdXA+XG4gICAgICAgICAgPExhYmVsPlVwcGVyIExlZnQ8L0xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBzcGFjZS15LTJcIj5cbiAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBhbnk7IG9uQ2hhbmdlOiAodmFsdS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICAgIGxhYmVsPVwiRWFzdGluZ1wiXG4gICAgICAgICAgICAgIHZhbHVlPXtcbiAgICAgICAgICAgICAgICB1dG1VcHNVcHBlckxlZnRFYXN0aW5nICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgID8gU3RyaW5nKHV0bVVwc1VwcGVyTGVmdEVhc3RpbmcpXG4gICAgICAgICAgICAgICAgICA6IHV0bVVwc1VwcGVyTGVmdEVhc3RpbmdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PlxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHsgWyd1dG1VcHNVcHBlckxlZnRFYXN0aW5nJ106IHZhbHVlIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYWRkb249XCJtXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogYW55OyBvbkNoYW5nZTogKHZhbHUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgICBsYWJlbD1cIk5vcnRoaW5nXCJcbiAgICAgICAgICAgICAgdmFsdWU9e1xuICAgICAgICAgICAgICAgIHV0bVVwc1VwcGVyTGVmdE5vcnRoaW5nICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgID8gU3RyaW5nKHV0bVVwc1VwcGVyTGVmdE5vcnRoaW5nKVxuICAgICAgICAgICAgICAgICAgOiB1dG1VcHNVcHBlckxlZnROb3J0aGluZ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoeyBbJ3V0bVVwc1VwcGVyTGVmdE5vcnRoaW5nJ106IHZhbHVlIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYWRkb249XCJtXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Wm9uZVxuICAgICAgICAgICAgICB2YWx1ZT17dXRtVXBzVXBwZXJMZWZ0Wm9uZX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PlxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHsgWyd1dG1VcHNVcHBlckxlZnRab25lJ106IHZhbHVlIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8SGVtaXNwaGVyZVxuICAgICAgICAgICAgICB2YWx1ZT17dXRtVXBzVXBwZXJMZWZ0SGVtaXNwaGVyZX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PlxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHsgWyd1dG1VcHNVcHBlckxlZnRIZW1pc3BoZXJlJ106IHZhbHVlIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvR3JvdXA+XG4gICAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXt1cHBlckxlZnRFcnJvcn0gLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbnB1dC1sb2NhdGlvblwiPlxuICAgICAgICA8R3JvdXA+XG4gICAgICAgICAgPExhYmVsPkxvd2VyIFJpZ2h0PC9MYWJlbD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgc3BhY2UteS0yXCI+XG4gICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogYW55OyBvbkNoYW5nZTogKHZhbHUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgICBsYWJlbD1cIkVhc3RpbmdcIlxuICAgICAgICAgICAgICB2YWx1ZT17XG4gICAgICAgICAgICAgICAgdXRtVXBzTG93ZXJSaWdodEVhc3RpbmcgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgPyBTdHJpbmcodXRtVXBzTG93ZXJSaWdodEVhc3RpbmcpXG4gICAgICAgICAgICAgICAgICA6IHV0bVVwc0xvd2VyUmlnaHRFYXN0aW5nXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT5cbiAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7IFsndXRtVXBzTG93ZXJSaWdodEVhc3RpbmcnXTogdmFsdWUgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhZGRvbj1cIm1cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBhbnk7IG9uQ2hhbmdlOiAodmFsdS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICAgIGxhYmVsPVwiTm9ydGhpbmdcIlxuICAgICAgICAgICAgICB2YWx1ZT17XG4gICAgICAgICAgICAgICAgdXRtVXBzTG93ZXJSaWdodE5vcnRoaW5nICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgID8gU3RyaW5nKHV0bVVwc0xvd2VyUmlnaHROb3J0aGluZylcbiAgICAgICAgICAgICAgICAgIDogdXRtVXBzTG93ZXJSaWdodE5vcnRoaW5nXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT5cbiAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7IFsndXRtVXBzTG93ZXJSaWdodE5vcnRoaW5nJ106IHZhbHVlIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYWRkb249XCJtXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Wm9uZVxuICAgICAgICAgICAgICB2YWx1ZT17dXRtVXBzTG93ZXJSaWdodFpvbmV9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT5cbiAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7IFsndXRtVXBzTG93ZXJSaWdodFpvbmUnXTogdmFsdWUgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxIZW1pc3BoZXJlXG4gICAgICAgICAgICAgIHZhbHVlPXt1dG1VcHNMb3dlclJpZ2h0SGVtaXNwaGVyZX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PlxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHsgWyd1dG1VcHNMb3dlclJpZ2h0SGVtaXNwaGVyZSddOiB2YWx1ZSB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0dyb3VwPlxuICAgICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17bG93ZXJSaWdodEVycm9yfSAvPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgQm91bmRpbmdCb3ggPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7IHNldFN0YXRlLCBsb2NhdGlvblR5cGUgfSA9IHByb3BzXG5cbiAgY29uc3QgaW5wdXRzID0ge1xuICAgIGRkOiBCb3VuZGluZ0JveExhdExvbkRkLFxuICAgIGRtczogQm91bmRpbmdCb3hMYXRMb25EbXMsXG4gICAgdXNuZzogQm91bmRpbmdCb3hVc25nTWdycyxcbiAgICB1dG1VcHM6IEJvdW5kaW5nQm94VXRtVXBzLFxuICB9XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gIGNvbnN0IENvbXBvbmVudCA9IGlucHV0c1tsb2NhdGlvblR5cGVdIHx8IG51bGxcblxuICByZXR1cm4gKFxuICAgIDxkaXY+XG4gICAgICA8UmFkaW9cbiAgICAgICAgdmFsdWU9e2xvY2F0aW9uVHlwZX1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBzZXRTdGF0ZSh7IFsnbG9jYXRpb25UeXBlJ106IHZhbHVlIH0pfVxuICAgICAgPlxuICAgICAgICA8UmFkaW9JdGVtIHZhbHVlPVwiZGRcIj5MYXQvTG9uIChERCk8L1JhZGlvSXRlbT5cbiAgICAgICAgPFJhZGlvSXRlbSB2YWx1ZT1cImRtc1wiPkxhdC9Mb24gKERNUyk8L1JhZGlvSXRlbT5cbiAgICAgICAgPFJhZGlvSXRlbSB2YWx1ZT1cInVzbmdcIj5VU05HIC8gTUdSUzwvUmFkaW9JdGVtPlxuICAgICAgICA8UmFkaW9JdGVtIHZhbHVlPVwidXRtVXBzXCI+VVRNIC8gVVBTPC9SYWRpb0l0ZW0+XG4gICAgICA8L1JhZGlvPlxuICAgICAgPE1pbmltdW1TcGFjaW5nIC8+XG4gICAgICB7Q29tcG9uZW50ICE9PSBudWxsID8gPENvbXBvbmVudCB7Li4ucHJvcHN9IC8+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBCb3VuZGluZ0JveFxuIl19