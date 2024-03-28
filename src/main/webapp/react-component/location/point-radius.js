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
import { Radio, RadioItem } from '../radio/radio';
import TextField from '../text-field';
import { validateGeo, initialErrorState, initialErrorStateWithDefault, ErrorComponent, } from '../utils/validation';
import { Units, Zone, Hemisphere, MinimumSpacing } from './common';
import { DmsLatitude, DmsLongitude, } from '../../component/location-new/geo-components/coordinates';
import DirectionInput from '../../component/location-new/geo-components/direction';
import { Direction } from '../../component/location-new/utils/dms-utils';
var clearValidationResults = function (errorListener) {
    errorListener &&
        errorListener({
            point: undefined,
            radius: undefined,
        });
};
var PointRadiusLatLonDd = function (props) {
    var lat = props.lat, lon = props.lon, radius = props.radius, radiusUnits = props.radiusUnits, setState = props.setState, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorStateWithDefault), 2), ddError = _a[0], setDdError = _a[1];
    var _b = __read(useState(initialErrorState), 2), radiusError = _b[0], setRadiusError = _b[1];
    useEffect(function () {
        if (props.drawing) {
            setDdError(initialErrorStateWithDefault);
            setRadiusError(initialErrorState);
        }
        else {
            var ddValidationResult = [
                validateGeo('lat', lat),
                validateGeo('lon', lon),
            ].find(function (validation) { return validation === null || validation === void 0 ? void 0 : validation.error; });
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
            setDdError(ddValidationResult || initialErrorStateWithDefault);
            var radiusValidationResult = validateGeo('radius', {
                value: radius,
                units: radiusUnits,
            });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setRadiusError(radiusValidationResult || initialErrorState);
            errorListener &&
                errorListener({
                    point: ddValidationResult,
                    radius: radiusValidationResult,
                });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [props.lat, props.lon, props.radius, props.radiusUnits]);
    function clampDd(key, value) {
        var _a;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
        var defaultValue = validateGeo(key, value).defaultValue;
        setState((_a = {}, _a[key] = defaultValue || value, _a));
    }
    return (React.createElement("div", { className: "flex flex-col flex-nowrap space-y-2" },
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
            type: "number", label: "Latitude", value: lat !== undefined ? String(lat) : lat, onChange: function (value) { return clampDd('lat', value); }, addon: "\u00B0" }),
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
            type: "number", label: "Longitude", value: lon !== undefined ? String(lon) : lon, onChange: function (value) { return clampDd('lon', value); }, addon: "\u00B0" }),
        React.createElement(ErrorComponent, { errorState: ddError }),
        React.createElement(Units, { value: radiusUnits, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['radiusUnits'] = value, _a));
            } },
            React.createElement(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                type: "number", label: "Radius", value: String(radius), onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['radius'] = value, _a));
                } })),
        React.createElement(ErrorComponent, { errorState: radiusError })));
};
var PointRadiusLatLonDms = function (props) {
    var dmsLat = props.dmsLat, dmsLon = props.dmsLon, dmsLatDirection = props.dmsLatDirection, dmsLonDirection = props.dmsLonDirection, radius = props.radius, radiusUnits = props.radiusUnits, setState = props.setState, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorStateWithDefault), 2), dmsError = _a[0], setDmsError = _a[1];
    var _b = __read(useState(initialErrorState), 2), radiusError = _b[0], setRadiusError = _b[1];
    var latitudeDirections = [Direction.North, Direction.South];
    var longitudeDirections = [Direction.East, Direction.West];
    useEffect(function () {
        if (props.drawing) {
            setDmsError(initialErrorStateWithDefault);
            setRadiusError(initialErrorState);
        }
        else {
            var dmsValidationResult = [
                validateGeo('dmsLat', dmsLat),
                validateGeo('dmsLon', dmsLon),
            ].find(function (validation) { return validation === null || validation === void 0 ? void 0 : validation.error; });
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
            setDmsError(dmsValidationResult || initialErrorStateWithDefault);
            var radiusValidationResult = validateGeo('radius', {
                value: radius,
                units: radiusUnits,
            });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setRadiusError(radiusValidationResult || initialErrorState);
            errorListener &&
                errorListener({
                    point: dmsValidationResult,
                    radius: radiusValidationResult,
                });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [props.dmsLat, props.dmsLon, props.radius, props.radiusUnits]);
    function clampDms(key, value) {
        var _a;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
        var defaultValue = validateGeo(key, value).defaultValue;
        setState((_a = {}, _a[key] = defaultValue || value, _a));
    }
    return (React.createElement("div", { className: "flex flex-col flex-nowrap space-y-2" },
        React.createElement(DmsLatitude, { label: "Latitude", value: dmsLat, onChange: function (value) { return clampDms('dmsLat', value); } },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: latitudeDirections, value: dmsLatDirection, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['dmsLatDirection'] = value, _a));
                } })),
        React.createElement(DmsLongitude, { label: "Longitude", value: dmsLon, onChange: function (value) { return clampDms('dmsLon', value); } },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: longitudeDirections, value: dmsLonDirection, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['dmsLonDirection'] = value, _a));
                } })),
        React.createElement(ErrorComponent, { errorState: dmsError }),
        React.createElement(Units, { value: radiusUnits, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['radiusUnits'] = value, _a));
            } },
            React.createElement(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
                label: "Radius", type: "number", value: String(radius), onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['radius'] = value, _a));
                } })),
        React.createElement(ErrorComponent, { errorState: radiusError })));
};
var PointRadiusUsngMgrs = function (props) {
    var usng = props.usng, radius = props.radius, radiusUnits = props.radiusUnits, setState = props.setState, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorState), 2), usngError = _a[0], setUsngError = _a[1];
    var _b = __read(useState(initialErrorState), 2), radiusError = _b[0], setRadiusError = _b[1];
    useEffect(function () {
        if (props.drawing) {
            setUsngError(initialErrorState);
            setRadiusError(initialErrorState);
        }
        else {
            var usngValidationResult = validateGeo('usng', usng);
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setUsngError(usngValidationResult);
            var radiusValidationResult = validateGeo('radius', {
                value: radius,
                units: radiusUnits,
            });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setRadiusError(radiusValidationResult || initialErrorState);
            errorListener &&
                errorListener({
                    point: usngValidationResult,
                    radius: radiusValidationResult,
                });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [props.usng, props.radius, props.radiusUnits]);
    return (React.createElement("div", { className: "flex flex-col flex-nowrap space-y-2" },
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            label: "USNG / MGRS", value: usng, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['usng'] = value, _a));
            } }),
        React.createElement(ErrorComponent, { errorState: usngError }),
        React.createElement(Units, { value: radiusUnits, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['radiusUnits'] = value, _a));
            } },
            React.createElement(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
                label: "Radius", type: "number", value: String(radius), onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['radius'] = value, _a));
                } })),
        React.createElement(ErrorComponent, { errorState: radiusError })));
};
var PointRadiusUtmUps = function (props) {
    var utmUpsEasting = props.utmUpsEasting, utmUpsNorthing = props.utmUpsNorthing, utmUpsZone = props.utmUpsZone, utmUpsHemisphere = props.utmUpsHemisphere, radius = props.radius, radiusUnits = props.radiusUnits, setState = props.setState, errorListener = props.errorListener;
    var _a = __read(useState(initialErrorState), 2), utmError = _a[0], setUtmError = _a[1];
    var _b = __read(useState(initialErrorState), 2), radiusError = _b[0], setRadiusError = _b[1];
    useEffect(function () {
        if (props.drawing) {
            setUtmError(initialErrorState);
            setRadiusError(initialErrorState);
        }
        else {
            var utmUps = {
                easting: utmUpsEasting,
                northing: utmUpsNorthing,
                zoneNumber: utmUpsZone,
                hemisphere: utmUpsHemisphere,
            };
            var utmUpsValidationResult = [
                validateGeo('easting', utmUps),
                validateGeo('northing', utmUps),
                validateGeo('zoneNumber', utmUps),
                validateGeo('hemisphere', utmUps),
            ].find(function (validation) { return validation === null || validation === void 0 ? void 0 : validation.error; });
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
            setUtmError(utmUpsValidationResult || initialErrorStateWithDefault);
            var radiusValidationResult = validateGeo('radius', {
                value: radius,
                units: radiusUnits,
            });
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setRadiusError(radiusValidationResult || initialErrorState);
            errorListener &&
                errorListener({
                    point: utmUpsValidationResult,
                    radius: radiusValidationResult,
                });
        }
        return function () { return clearValidationResults(errorListener); };
    }, [
        props.utmUpsEasting,
        props.utmUpsNorthing,
        props.utmUpsZone,
        props.utmUpsHemisphere,
        props.radius,
        props.radiusUnits,
    ]);
    return (React.createElement("div", { className: "flex flex-col flex-nowrap space-y-2" },
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            label: "Easting", value: utmUpsEasting !== undefined ? String(utmUpsEasting) : utmUpsEasting, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['utmUpsEasting'] = value, _a));
            }, addon: "m" }),
        React.createElement(TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        , { 
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            label: "Northing", value: utmUpsNorthing !== undefined ? String(utmUpsNorthing) : utmUpsNorthing, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['utmUpsNorthing'] = value, _a));
            }, addon: "m" }),
        React.createElement(Zone, { value: utmUpsZone, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['utmUpsZone'] = value, _a));
            } }),
        React.createElement(Hemisphere, { value: utmUpsHemisphere, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['utmUpsHemisphere'] = value, _a));
            } }),
        React.createElement(ErrorComponent, { errorState: utmError }),
        React.createElement(Units, { value: radiusUnits, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['radiusUnits'] = value, _a));
            } },
            React.createElement(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
                label: "Radius", type: "number", value: String(radius), onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['radius'] = value, _a));
                } })),
        React.createElement(ErrorComponent, { errorState: radiusError })));
};
var PointRadius = function (props) {
    var setState = props.setState, locationType = props.locationType;
    var inputs = {
        dd: PointRadiusLatLonDd,
        dms: PointRadiusLatLonDms,
        usng: PointRadiusUsngMgrs,
        utmUps: PointRadiusUtmUps,
    };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var Component = inputs[locationType] || null;
    return (React.createElement("div", null,
        React.createElement(Radio, { value: locationType, onChange: function (value) {
                var _a;
                return setState((_a = {}, _a['locationType'] = value, _a));
            } },
            React.createElement(RadioItem, { value: "dd" }, "Lat / Lon (DD)"),
            React.createElement(RadioItem, { value: "dms" }, "Lat / Lon (DMS)"),
            React.createElement(RadioItem, { value: "usng" }, "USNG / MGRS"),
            React.createElement(RadioItem, { value: "utmUps" }, "UTM / UPS")),
        React.createElement(MinimumSpacing, null),
        React.createElement("div", { className: "input-location" }, Component !== null ? React.createElement(Component, __assign({}, props)) : null)));
};
export default PointRadius;
//# sourceMappingURL=point-radius.js.map