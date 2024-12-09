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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9pbnQtcmFkaXVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9wb2ludC1yYWRpdXMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQ2xELE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDakQsT0FBTyxTQUFTLE1BQU0sZUFBZSxDQUFBO0FBQ3JDLE9BQU8sRUFDTCxXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLDRCQUE0QixFQUM1QixjQUFjLEdBQ2YsTUFBTSxxQkFBcUIsQ0FBQTtBQUM1QixPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2xFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsWUFBWSxHQUNiLE1BQU0seURBQXlELENBQUE7QUFDaEUsT0FBTyxjQUFjLE1BQU0sdURBQXVELENBQUE7QUFDbEYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBRXhFLElBQU0sc0JBQXNCLEdBQUcsVUFBQyxhQUFtQjtJQUNqRCxhQUFhO1FBQ1gsYUFBYSxDQUFDO1lBQ1osS0FBSyxFQUFFLFNBQVM7WUFDaEIsTUFBTSxFQUFFLFNBQVM7U0FDbEIsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFBO0FBRUQsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLEtBQVU7SUFDN0IsSUFBQSxHQUFHLEdBQXdELEtBQUssSUFBN0QsRUFBRSxHQUFHLEdBQW1ELEtBQUssSUFBeEQsRUFBRSxNQUFNLEdBQTJDLEtBQUssT0FBaEQsRUFBRSxXQUFXLEdBQThCLEtBQUssWUFBbkMsRUFBRSxRQUFR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Q1Isb0JBQUMsY0FBYyxPQUFHO1FBQ2xCLDZCQUFLLFNBQVMsRUFBQyxnQkFBZ0IsSUFDNUIsU0FBUyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQUMsU0FBUyxlQUFLLEtBQUssRUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ2pELENBQ0YsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxXQUFXLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBSYWRpbywgUmFkaW9JdGVtIH0gZnJvbSAnLi4vcmFkaW8vcmFkaW8nXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJy4uL3RleHQtZmllbGQnXG5pbXBvcnQge1xuICB2YWxpZGF0ZUdlbyxcbiAgaW5pdGlhbEVycm9yU3RhdGUsXG4gIGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQsXG4gIEVycm9yQ29tcG9uZW50LFxufSBmcm9tICcuLi91dGlscy92YWxpZGF0aW9uJ1xuaW1wb3J0IHsgVW5pdHMsIFpvbmUsIEhlbWlzcGhlcmUsIE1pbmltdW1TcGFjaW5nIH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQge1xuICBEbXNMYXRpdHVkZSxcbiAgRG1zTG9uZ2l0dWRlLFxufSBmcm9tICcuLi8uLi9jb21wb25lbnQvbG9jYXRpb24tbmV3L2dlby1jb21wb25lbnRzL2Nvb3JkaW5hdGVzJ1xuaW1wb3J0IERpcmVjdGlvbklucHV0IGZyb20gJy4uLy4uL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvZ2VvLWNvbXBvbmVudHMvZGlyZWN0aW9uJ1xuaW1wb3J0IHsgRGlyZWN0aW9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2xvY2F0aW9uLW5ldy91dGlscy9kbXMtdXRpbHMnXG5cbmNvbnN0IGNsZWFyVmFsaWRhdGlvblJlc3VsdHMgPSAoZXJyb3JMaXN0ZW5lcj86IGFueSkgPT4ge1xuICBlcnJvckxpc3RlbmVyICYmXG4gICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICBwb2ludDogdW5kZWZpbmVkLFxuICAgICAgcmFkaXVzOiB1bmRlZmluZWQsXG4gICAgfSlcbn1cblxuY29uc3QgUG9pbnRSYWRpdXNMYXRMb25EZCA9IChwcm9wczogYW55KSA9PiB7XG4gIGNvbnN0IHsgbGF0LCBsb24sIHJhZGl1cywgcmFkaXVzVW5pdHMsIHNldFN0YXRlLCBlcnJvckxpc3RlbmVyIH0gPSBwcm9wc1xuICBjb25zdCBbZGRFcnJvciwgc2V0RGRFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0KVxuICBjb25zdCBbcmFkaXVzRXJyb3IsIHNldFJhZGl1c0Vycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHByb3BzLmRyYXdpbmcpIHtcbiAgICAgIHNldERkRXJyb3IoaW5pdGlhbEVycm9yU3RhdGVXaXRoRGVmYXVsdClcbiAgICAgIHNldFJhZGl1c0Vycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkZFZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICAgIHZhbGlkYXRlR2VvKCdsYXQnLCBsYXQpLFxuICAgICAgICB2YWxpZGF0ZUdlbygnbG9uJywgbG9uKSxcbiAgICAgIF0uZmluZCgodmFsaWRhdGlvbikgPT4gdmFsaWRhdGlvbj8uZXJyb3IpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMzOSkgRklYTUU6IFByb3BlcnR5ICdlcnJvcicgZG9lcyBub3QgZXhpc3Qgb24gdHlwZSAneyBlcnJvcjogLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldERkRXJyb3IoZGRWYWxpZGF0aW9uUmVzdWx0IHx8IGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQpXG4gICAgICBjb25zdCByYWRpdXNWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8oJ3JhZGl1cycsIHtcbiAgICAgICAgdmFsdWU6IHJhZGl1cyxcbiAgICAgICAgdW5pdHM6IHJhZGl1c1VuaXRzLFxuICAgICAgfSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0UmFkaXVzRXJyb3IocmFkaXVzVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGVycm9yTGlzdGVuZXIgJiZcbiAgICAgICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICAgICAgcG9pbnQ6IGRkVmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgICByYWRpdXM6IHJhZGl1c1ZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiBjbGVhclZhbGlkYXRpb25SZXN1bHRzKGVycm9yTGlzdGVuZXIpXG4gIH0sIFtwcm9wcy5sYXQsIHByb3BzLmxvbiwgcHJvcHMucmFkaXVzLCBwcm9wcy5yYWRpdXNVbml0c10pXG5cbiAgZnVuY3Rpb24gY2xhbXBEZChrZXk6IGFueSwgdmFsdWU6IGFueSkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzM5KSBGSVhNRTogUHJvcGVydHkgJ2Vycm9yJyBkb2VzIG5vdCBleGlzdCBvbiB0eXBlICd7IGVycm9yOiAuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgIGNvbnN0IHsgZGVmYXVsdFZhbHVlIH0gPSB2YWxpZGF0ZUdlbyhrZXksIHZhbHVlKVxuICAgIHNldFN0YXRlKHsgW2tleV06IGRlZmF1bHRWYWx1ZSB8fCB2YWx1ZSB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgZmxleC1ub3dyYXAgc3BhY2UteS0yXCI+XG4gICAgICA8VGV4dEZpZWxkXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBhbnk7IG8uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgbGFiZWw9XCJMYXRpdHVkZVwiXG4gICAgICAgIHZhbHVlPXtsYXQgIT09IHVuZGVmaW5lZCA/IFN0cmluZyhsYXQpIDogbGF0fVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBjbGFtcERkKCdsYXQnLCB2YWx1ZSl9XG4gICAgICAgIGFkZG9uPVwiwrBcIlxuICAgICAgLz5cbiAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IHR5cGU6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGFueTsgby4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICBsYWJlbD1cIkxvbmdpdHVkZVwiXG4gICAgICAgIHZhbHVlPXtsb24gIT09IHVuZGVmaW5lZCA/IFN0cmluZyhsb24pIDogbG9ufVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBjbGFtcERkKCdsb24nLCB2YWx1ZSl9XG4gICAgICAgIGFkZG9uPVwiwrBcIlxuICAgICAgLz5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtkZEVycm9yfSAvPlxuICAgICAgPFVuaXRzXG4gICAgICAgIHZhbHVlPXtyYWRpdXNVbml0c31cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBzZXRTdGF0ZSh7IFsncmFkaXVzVW5pdHMnXTogdmFsdWUgfSl9XG4gICAgICA+XG4gICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICBsYWJlbD1cIlJhZGl1c1wiXG4gICAgICAgICAgdmFsdWU9e1N0cmluZyhyYWRpdXMpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHNldFN0YXRlKHsgWydyYWRpdXMnXTogdmFsdWUgfSl9XG4gICAgICAgIC8+XG4gICAgICA8L1VuaXRzPlxuICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e3JhZGl1c0Vycm9yfSAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IFBvaW50UmFkaXVzTGF0TG9uRG1zID0gKHByb3BzOiBhbnkpID0+IHtcbiAgY29uc3Qge1xuICAgIGRtc0xhdCxcbiAgICBkbXNMb24sXG4gICAgZG1zTGF0RGlyZWN0aW9uLFxuICAgIGRtc0xvbkRpcmVjdGlvbixcbiAgICByYWRpdXMsXG4gICAgcmFkaXVzVW5pdHMsXG4gICAgc2V0U3RhdGUsXG4gICAgZXJyb3JMaXN0ZW5lcixcbiAgfSA9IHByb3BzXG4gIGNvbnN0IFtkbXNFcnJvciwgc2V0RG1zRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGVXaXRoRGVmYXVsdClcbiAgY29uc3QgW3JhZGl1c0Vycm9yLCBzZXRSYWRpdXNFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcbiAgY29uc3QgbGF0aXR1ZGVEaXJlY3Rpb25zID0gW0RpcmVjdGlvbi5Ob3J0aCwgRGlyZWN0aW9uLlNvdXRoXVxuICBjb25zdCBsb25naXR1ZGVEaXJlY3Rpb25zID0gW0RpcmVjdGlvbi5FYXN0LCBEaXJlY3Rpb24uV2VzdF1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcm9wcy5kcmF3aW5nKSB7XG4gICAgICBzZXREbXNFcnJvcihpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0KVxuICAgICAgc2V0UmFkaXVzRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRtc1ZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICAgIHZhbGlkYXRlR2VvKCdkbXNMYXQnLCBkbXNMYXQpLFxuICAgICAgICB2YWxpZGF0ZUdlbygnZG1zTG9uJywgZG1zTG9uKSxcbiAgICAgIF0uZmluZCgodmFsaWRhdGlvbikgPT4gdmFsaWRhdGlvbj8uZXJyb3IpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMzOSkgRklYTUU6IFByb3BlcnR5ICdlcnJvcicgZG9lcyBub3QgZXhpc3Qgb24gdHlwZSAneyBlcnJvcjogLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldERtc0Vycm9yKGRtc1ZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGVXaXRoRGVmYXVsdClcbiAgICAgIGNvbnN0IHJhZGl1c1ZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0ZUdlbygncmFkaXVzJywge1xuICAgICAgICB2YWx1ZTogcmFkaXVzLFxuICAgICAgICB1bml0czogcmFkaXVzVW5pdHMsXG4gICAgICB9KVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICd7IGVycm9yOiBib29sZWFuOyBtZXNzYWdlOiBzdHJpbi4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXRSYWRpdXNFcnJvcihyYWRpdXNWYWxpZGF0aW9uUmVzdWx0IHx8IGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgZXJyb3JMaXN0ZW5lciAmJlxuICAgICAgICBlcnJvckxpc3RlbmVyKHtcbiAgICAgICAgICBwb2ludDogZG1zVmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgICByYWRpdXM6IHJhZGl1c1ZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiBjbGVhclZhbGlkYXRpb25SZXN1bHRzKGVycm9yTGlzdGVuZXIpXG4gIH0sIFtwcm9wcy5kbXNMYXQsIHByb3BzLmRtc0xvbiwgcHJvcHMucmFkaXVzLCBwcm9wcy5yYWRpdXNVbml0c10pXG5cbiAgZnVuY3Rpb24gY2xhbXBEbXMoa2V5OiBhbnksIHZhbHVlOiBhbnkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMzOSkgRklYTUU6IFByb3BlcnR5ICdlcnJvcicgZG9lcyBub3QgZXhpc3Qgb24gdHlwZSAneyBlcnJvcjogLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBjb25zdCB7IGRlZmF1bHRWYWx1ZSB9ID0gdmFsaWRhdGVHZW8oa2V5LCB2YWx1ZSlcbiAgICBzZXRTdGF0ZSh7IFtrZXldOiBkZWZhdWx0VmFsdWUgfHwgdmFsdWUgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHNwYWNlLXktMlwiPlxuICAgICAgPERtc0xhdGl0dWRlXG4gICAgICAgIGxhYmVsPVwiTGF0aXR1ZGVcIlxuICAgICAgICB2YWx1ZT17ZG1zTGF0fVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IGNsYW1wRG1zKCdkbXNMYXQnLCB2YWx1ZSl9XG4gICAgICA+XG4gICAgICAgIDxEaXJlY3Rpb25JbnB1dFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNzY5KSBGSVhNRTogTm8gb3ZlcmxvYWQgbWF0Y2hlcyB0aGlzIGNhbGwuXG4gICAgICAgICAgb3B0aW9ucz17bGF0aXR1ZGVEaXJlY3Rpb25zfVxuICAgICAgICAgIHZhbHVlPXtkbXNMYXREaXJlY3Rpb259XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBzZXRTdGF0ZSh7IFsnZG1zTGF0RGlyZWN0aW9uJ106IHZhbHVlIH0pfVxuICAgICAgICAvPlxuICAgICAgPC9EbXNMYXRpdHVkZT5cbiAgICAgIDxEbXNMb25naXR1ZGVcbiAgICAgICAgbGFiZWw9XCJMb25naXR1ZGVcIlxuICAgICAgICB2YWx1ZT17ZG1zTG9ufVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IGNsYW1wRG1zKCdkbXNMb24nLCB2YWx1ZSl9XG4gICAgICA+XG4gICAgICAgIDxEaXJlY3Rpb25JbnB1dFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNzY5KSBGSVhNRTogTm8gb3ZlcmxvYWQgbWF0Y2hlcyB0aGlzIGNhbGwuXG4gICAgICAgICAgb3B0aW9ucz17bG9uZ2l0dWRlRGlyZWN0aW9uc31cbiAgICAgICAgICB2YWx1ZT17ZG1zTG9uRGlyZWN0aW9ufVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ2Rtc0xvbkRpcmVjdGlvbiddOiB2YWx1ZSB9KX1cbiAgICAgICAgLz5cbiAgICAgIDwvRG1zTG9uZ2l0dWRlPlxuICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e2Rtc0Vycm9yfSAvPlxuICAgICAgPFVuaXRzXG4gICAgICAgIHZhbHVlPXtyYWRpdXNVbml0c31cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBzZXRTdGF0ZSh7IFsncmFkaXVzVW5pdHMnXTogdmFsdWUgfSl9XG4gICAgICA+XG4gICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdHlwZTogc3RyaW5nOyB2YWx1ZTogc3RyaW5nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICBsYWJlbD1cIlJhZGl1c1wiXG4gICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgdmFsdWU9e1N0cmluZyhyYWRpdXMpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHNldFN0YXRlKHsgWydyYWRpdXMnXTogdmFsdWUgfSl9XG4gICAgICAgIC8+XG4gICAgICA8L1VuaXRzPlxuICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e3JhZGl1c0Vycm9yfSAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IFBvaW50UmFkaXVzVXNuZ01ncnMgPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7IHVzbmcsIHJhZGl1cywgcmFkaXVzVW5pdHMsIHNldFN0YXRlLCBlcnJvckxpc3RlbmVyIH0gPSBwcm9wc1xuICBjb25zdCBbdXNuZ0Vycm9yLCBzZXRVc25nRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGUpXG4gIGNvbnN0IFtyYWRpdXNFcnJvciwgc2V0UmFkaXVzRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocHJvcHMuZHJhd2luZykge1xuICAgICAgc2V0VXNuZ0Vycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgICAgc2V0UmFkaXVzRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHVzbmdWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8oJ3VzbmcnLCB1c25nKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICd7IGVycm9yOiBib29sZWFuOyBtZXNzYWdlOiBzdHJpbi4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXRVc25nRXJyb3IodXNuZ1ZhbGlkYXRpb25SZXN1bHQpXG4gICAgICBjb25zdCByYWRpdXNWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8oJ3JhZGl1cycsIHtcbiAgICAgICAgdmFsdWU6IHJhZGl1cyxcbiAgICAgICAgdW5pdHM6IHJhZGl1c1VuaXRzLFxuICAgICAgfSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0UmFkaXVzRXJyb3IocmFkaXVzVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGVycm9yTGlzdGVuZXIgJiZcbiAgICAgICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICAgICAgcG9pbnQ6IHVzbmdWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICAgIHJhZGl1czogcmFkaXVzVmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IGNsZWFyVmFsaWRhdGlvblJlc3VsdHMoZXJyb3JMaXN0ZW5lcilcbiAgfSwgW3Byb3BzLnVzbmcsIHByb3BzLnJhZGl1cywgcHJvcHMucmFkaXVzVW5pdHNdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHNwYWNlLXktMlwiPlxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGFueTsgb25DaGFuZ2U6ICh2YWx1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbGFiZWw9XCJVU05HIC8gTUdSU1wiXG4gICAgICAgIHZhbHVlPXt1c25nfVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRTdGF0ZSh7IFsndXNuZyddOiB2YWx1ZSB9KX1cbiAgICAgIC8+XG4gICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17dXNuZ0Vycm9yfSAvPlxuICAgICAgPFVuaXRzXG4gICAgICAgIHZhbHVlPXtyYWRpdXNVbml0c31cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBzZXRTdGF0ZSh7IFsncmFkaXVzVW5pdHMnXTogdmFsdWUgfSl9XG4gICAgICA+XG4gICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdHlwZTogc3RyaW5nOyB2YWx1ZTogc3RyaW5nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICBsYWJlbD1cIlJhZGl1c1wiXG4gICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgdmFsdWU9e1N0cmluZyhyYWRpdXMpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHNldFN0YXRlKHsgWydyYWRpdXMnXTogdmFsdWUgfSl9XG4gICAgICAgIC8+XG4gICAgICA8L1VuaXRzPlxuICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e3JhZGl1c0Vycm9yfSAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IFBvaW50UmFkaXVzVXRtVXBzID0gKHByb3BzOiBhbnkpID0+IHtcbiAgY29uc3Qge1xuICAgIHV0bVVwc0Vhc3RpbmcsXG4gICAgdXRtVXBzTm9ydGhpbmcsXG4gICAgdXRtVXBzWm9uZSxcbiAgICB1dG1VcHNIZW1pc3BoZXJlLFxuICAgIHJhZGl1cyxcbiAgICByYWRpdXNVbml0cyxcbiAgICBzZXRTdGF0ZSxcbiAgICBlcnJvckxpc3RlbmVyLFxuICB9ID0gcHJvcHNcbiAgY29uc3QgW3V0bUVycm9yLCBzZXRVdG1FcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcbiAgY29uc3QgW3JhZGl1c0Vycm9yLCBzZXRSYWRpdXNFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcm9wcy5kcmF3aW5nKSB7XG4gICAgICBzZXRVdG1FcnJvcihpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIHNldFJhZGl1c0Vycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB1dG1VcHMgPSB7XG4gICAgICAgIGVhc3Rpbmc6IHV0bVVwc0Vhc3RpbmcsXG4gICAgICAgIG5vcnRoaW5nOiB1dG1VcHNOb3J0aGluZyxcbiAgICAgICAgem9uZU51bWJlcjogdXRtVXBzWm9uZSxcbiAgICAgICAgaGVtaXNwaGVyZTogdXRtVXBzSGVtaXNwaGVyZSxcbiAgICAgIH1cbiAgICAgIGNvbnN0IHV0bVVwc1ZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICAgIHZhbGlkYXRlR2VvKCdlYXN0aW5nJywgdXRtVXBzKSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ25vcnRoaW5nJywgdXRtVXBzKSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ3pvbmVOdW1iZXInLCB1dG1VcHMpLFxuICAgICAgICB2YWxpZGF0ZUdlbygnaGVtaXNwaGVyZScsIHV0bVVwcyksXG4gICAgICBdLmZpbmQoKHZhbGlkYXRpb24pID0+IHZhbGlkYXRpb24/LmVycm9yKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMzkpIEZJWE1FOiBQcm9wZXJ0eSAnZXJyb3InIGRvZXMgbm90IGV4aXN0IG9uIHR5cGUgJ3sgZXJyb3I6IC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXRVdG1FcnJvcih1dG1VcHNWYWxpZGF0aW9uUmVzdWx0IHx8IGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQpXG4gICAgICBjb25zdCByYWRpdXNWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8oJ3JhZGl1cycsIHtcbiAgICAgICAgdmFsdWU6IHJhZGl1cyxcbiAgICAgICAgdW5pdHM6IHJhZGl1c1VuaXRzLFxuICAgICAgfSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0UmFkaXVzRXJyb3IocmFkaXVzVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGVycm9yTGlzdGVuZXIgJiZcbiAgICAgICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICAgICAgcG9pbnQ6IHV0bVVwc1ZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgICAgcmFkaXVzOiByYWRpdXNWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbXG4gICAgcHJvcHMudXRtVXBzRWFzdGluZyxcbiAgICBwcm9wcy51dG1VcHNOb3J0aGluZyxcbiAgICBwcm9wcy51dG1VcHNab25lLFxuICAgIHByb3BzLnV0bVVwc0hlbWlzcGhlcmUsXG4gICAgcHJvcHMucmFkaXVzLFxuICAgIHByb3BzLnJhZGl1c1VuaXRzLFxuICBdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHNwYWNlLXktMlwiPlxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGFueTsgb25DaGFuZ2U6ICh2YWx1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbGFiZWw9XCJFYXN0aW5nXCJcbiAgICAgICAgdmFsdWU9e1xuICAgICAgICAgIHV0bVVwc0Vhc3RpbmcgIT09IHVuZGVmaW5lZCA/IFN0cmluZyh1dG1VcHNFYXN0aW5nKSA6IHV0bVVwc0Vhc3RpbmdcbiAgICAgICAgfVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRTdGF0ZSh7IFsndXRtVXBzRWFzdGluZyddOiB2YWx1ZSB9KX1cbiAgICAgICAgYWRkb249XCJtXCJcbiAgICAgIC8+XG4gICAgICA8VGV4dEZpZWxkXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogYW55OyBvbkNoYW5nZTogKHZhbHUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBsYWJlbD1cIk5vcnRoaW5nXCJcbiAgICAgICAgdmFsdWU9e1xuICAgICAgICAgIHV0bVVwc05vcnRoaW5nICE9PSB1bmRlZmluZWQgPyBTdHJpbmcodXRtVXBzTm9ydGhpbmcpIDogdXRtVXBzTm9ydGhpbmdcbiAgICAgICAgfVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRTdGF0ZSh7IFsndXRtVXBzTm9ydGhpbmcnXTogdmFsdWUgfSl9XG4gICAgICAgIGFkZG9uPVwibVwiXG4gICAgICAvPlxuICAgICAgPFpvbmVcbiAgICAgICAgdmFsdWU9e3V0bVVwc1pvbmV9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ3V0bVVwc1pvbmUnXTogdmFsdWUgfSl9XG4gICAgICAvPlxuICAgICAgPEhlbWlzcGhlcmVcbiAgICAgICAgdmFsdWU9e3V0bVVwc0hlbWlzcGhlcmV9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ3V0bVVwc0hlbWlzcGhlcmUnXTogdmFsdWUgfSl9XG4gICAgICAvPlxuICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e3V0bUVycm9yfSAvPlxuICAgICAgPFVuaXRzXG4gICAgICAgIHZhbHVlPXtyYWRpdXNVbml0c31cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBzZXRTdGF0ZSh7IFsncmFkaXVzVW5pdHMnXTogdmFsdWUgfSl9XG4gICAgICA+XG4gICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdHlwZTogc3RyaW5nOyB2YWx1ZTogc3RyaW5nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICBsYWJlbD1cIlJhZGl1c1wiXG4gICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgdmFsdWU9e1N0cmluZyhyYWRpdXMpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHNldFN0YXRlKHsgWydyYWRpdXMnXTogdmFsdWUgfSl9XG4gICAgICAgIC8+XG4gICAgICA8L1VuaXRzPlxuICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e3JhZGl1c0Vycm9yfSAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IFBvaW50UmFkaXVzID0gKHByb3BzOiBhbnkpID0+IHtcbiAgY29uc3QgeyBzZXRTdGF0ZSwgbG9jYXRpb25UeXBlIH0gPSBwcm9wc1xuXG4gIGNvbnN0IGlucHV0cyA9IHtcbiAgICBkZDogUG9pbnRSYWRpdXNMYXRMb25EZCxcbiAgICBkbXM6IFBvaW50UmFkaXVzTGF0TG9uRG1zLFxuICAgIHVzbmc6IFBvaW50UmFkaXVzVXNuZ01ncnMsXG4gICAgdXRtVXBzOiBQb2ludFJhZGl1c1V0bVVwcyxcbiAgfVxuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICBjb25zdCBDb21wb25lbnQgPSBpbnB1dHNbbG9jYXRpb25UeXBlXSB8fCBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPFJhZGlvXG4gICAgICAgIHZhbHVlPXtsb2NhdGlvblR5cGV9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ2xvY2F0aW9uVHlwZSddOiB2YWx1ZSB9KX1cbiAgICAgID5cbiAgICAgICAgPFJhZGlvSXRlbSB2YWx1ZT1cImRkXCI+TGF0IC8gTG9uIChERCk8L1JhZGlvSXRlbT5cbiAgICAgICAgPFJhZGlvSXRlbSB2YWx1ZT1cImRtc1wiPkxhdCAvIExvbiAoRE1TKTwvUmFkaW9JdGVtPlxuICAgICAgICA8UmFkaW9JdGVtIHZhbHVlPVwidXNuZ1wiPlVTTkcgLyBNR1JTPC9SYWRpb0l0ZW0+XG4gICAgICAgIDxSYWRpb0l0ZW0gdmFsdWU9XCJ1dG1VcHNcIj5VVE0gLyBVUFM8L1JhZGlvSXRlbT5cbiAgICAgIDwvUmFkaW8+XG4gICAgICA8TWluaW11bVNwYWNpbmcgLz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5wdXQtbG9jYXRpb25cIj5cbiAgICAgICAge0NvbXBvbmVudCAhPT0gbnVsbCA/IDxDb21wb25lbnQgey4uLnByb3BzfSAvPiA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBQb2ludFJhZGl1c1xuIl19