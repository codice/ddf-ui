import { __assign, __read } from "tslib";
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
    return (_jsxs("div", { className: "flex flex-col flex-nowrap space-y-2", children: [_jsx(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
                type: "number", label: "Latitude", value: lat !== undefined ? String(lat) : lat, onChange: function (value) { return clampDd('lat', value); }, addon: "\u00B0" }), _jsx(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
                type: "number", label: "Longitude", value: lon !== undefined ? String(lon) : lon, onChange: function (value) { return clampDd('lon', value); }, addon: "\u00B0" }), _jsx(ErrorComponent, { errorState: ddError }), _jsx(Units, { value: radiusUnits, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['radiusUnits'] = value, _a));
                }, children: _jsx(TextField
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                , { 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
                    type: "number", label: "Radius", value: String(radius), onChange: function (value) {
                        var _a;
                        return setState((_a = {}, _a['radius'] = value, _a));
                    } }) }), _jsx(ErrorComponent, { errorState: radiusError })] }));
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
    return (_jsxs("div", { className: "flex flex-col flex-nowrap space-y-2", children: [_jsx(DmsLatitude, { label: "Latitude", value: dmsLat, onChange: function (value) { return clampDms('dmsLat', value); }, children: _jsx(DirectionInput
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                , { 
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    options: latitudeDirections, value: dmsLatDirection, onChange: function (value) {
                        var _a;
                        return setState((_a = {}, _a['dmsLatDirection'] = value, _a));
                    } }) }), _jsx(DmsLongitude, { label: "Longitude", value: dmsLon, onChange: function (value) { return clampDms('dmsLon', value); }, children: _jsx(DirectionInput
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                , { 
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    options: longitudeDirections, value: dmsLonDirection, onChange: function (value) {
                        var _a;
                        return setState((_a = {}, _a['dmsLonDirection'] = value, _a));
                    } }) }), _jsx(ErrorComponent, { errorState: dmsError }), _jsx(Units, { value: radiusUnits, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['radiusUnits'] = value, _a));
                }, children: _jsx(TextField
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
                , { 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
                    label: "Radius", type: "number", value: String(radius), onChange: function (value) {
                        var _a;
                        return setState((_a = {}, _a['radius'] = value, _a));
                    } }) }), _jsx(ErrorComponent, { errorState: radiusError })] }));
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
    return (_jsxs("div", { className: "flex flex-col flex-nowrap space-y-2", children: [_jsx(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                label: "USNG / MGRS", value: usng, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['usng'] = value, _a));
                } }), _jsx(ErrorComponent, { errorState: usngError }), _jsx(Units, { value: radiusUnits, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['radiusUnits'] = value, _a));
                }, children: _jsx(TextField
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
                , { 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
                    label: "Radius", type: "number", value: String(radius), onChange: function (value) {
                        var _a;
                        return setState((_a = {}, _a['radius'] = value, _a));
                    } }) }), _jsx(ErrorComponent, { errorState: radiusError })] }));
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
    return (_jsxs("div", { className: "flex flex-col flex-nowrap space-y-2", children: [_jsx(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                label: "Easting", value: utmUpsEasting !== undefined ? String(utmUpsEasting) : utmUpsEasting, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['utmUpsEasting'] = value, _a));
                }, addon: "m" }), _jsx(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
                label: "Northing", value: utmUpsNorthing !== undefined ? String(utmUpsNorthing) : utmUpsNorthing, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['utmUpsNorthing'] = value, _a));
                }, addon: "m" }), _jsx(Zone, { value: utmUpsZone, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['utmUpsZone'] = value, _a));
                } }), _jsx(Hemisphere, { value: utmUpsHemisphere, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['utmUpsHemisphere'] = value, _a));
                } }), _jsx(ErrorComponent, { errorState: utmError }), _jsx(Units, { value: radiusUnits, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['radiusUnits'] = value, _a));
                }, children: _jsx(TextField
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
                , { 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
                    label: "Radius", type: "number", value: String(radius), onChange: function (value) {
                        var _a;
                        return setState((_a = {}, _a['radius'] = value, _a));
                    } }) }), _jsx(ErrorComponent, { errorState: radiusError })] }));
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
    return (_jsxs("div", { children: [_jsxs(Radio, { value: locationType, onChange: function (value) {
                    var _a;
                    return setState((_a = {}, _a['locationType'] = value, _a));
                }, children: [_jsx(RadioItem, { value: "dd", children: "Lat / Lon (DD)" }), _jsx(RadioItem, { value: "dms", children: "Lat / Lon (DMS)" }), _jsx(RadioItem, { value: "usng", children: "USNG / MGRS" }), _jsx(RadioItem, { value: "utmUps", children: "UTM / UPS" })] }), _jsx(MinimumSpacing, {}), _jsx("div", { className: "input-location", children: Component !== null ? _jsx(Component, __assign({}, props)) : null })] }));
};
export default PointRadius;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9pbnQtcmFkaXVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9wb2ludC1yYWRpdXMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQzNDLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDakQsT0FBTyxTQUFTLE1BQU0sZUFBZSxDQUFBO0FBQ3JDLE9BQU8sRUFDTCxXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLDRCQUE0QixFQUM1QixjQUFjLEdBQ2YsTUFBTSxxQkFBcUIsQ0FBQTtBQUM1QixPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2xFLE9BQU8sRUFDTCxXQUFXLEVBQ1gsWUFBWSxHQUNiLE1BQU0seURBQXlELENBQUE7QUFDaEUsT0FBTyxjQUFjLE1BQU0sdURBQXVELENBQUE7QUFDbEYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBRXhFLElBQU0sc0JBQXNCLEdBQUcsVUFBQyxhQUFtQjtJQUNqRCxhQUFhO1FBQ1gsYUFBYSxDQUFDO1lBQ1osS0FBSyxFQUFFLFNBQVM7WUFDaEIsTUFBTSxFQUFFLFNBQVM7U0FDbEIsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFBO0FBRUQsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLEtBQVU7SUFDN0IsSUFBQSxHQUFHLEdBQXdELEtBQUssSUFBN0QsRUFBRSxHQUFHLEdBQW1ELEtBQUssSUFBeEQsRUFBRSxNQUFNLEdBQTJDLEtBQUssT0FBaEQsRUFBRSxXQUFXLEdBQThCLEtBQUssWUFBbkMsRUFBRSxRQUFRLEdBQW9CLEtB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QUFNLDRCQUF3QixFQUMvQyxLQUFDLFNBQVMsSUFBQyxLQUFLLEVBQUMsUUFBUSwwQkFBc0IsSUFDekMsRUFDUixLQUFDLGNBQWMsS0FBRyxFQUNsQixjQUFLLFNBQVMsRUFBQyxnQkFBZ0IsWUFDNUIsU0FBUyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBQyxTQUFTLGVBQUssS0FBSyxFQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FDakQsSUFDRixDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFdBQVcsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgUmFkaW8sIFJhZGlvSXRlbSB9IGZyb20gJy4uL3JhZGlvL3JhZGlvJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICcuLi90ZXh0LWZpZWxkJ1xuaW1wb3J0IHtcbiAgdmFsaWRhdGVHZW8sXG4gIGluaXRpYWxFcnJvclN0YXRlLFxuICBpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0LFxuICBFcnJvckNvbXBvbmVudCxcbn0gZnJvbSAnLi4vdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCB7IFVuaXRzLCBab25lLCBIZW1pc3BoZXJlLCBNaW5pbXVtU3BhY2luZyB9IGZyb20gJy4vY29tbW9uJ1xuaW1wb3J0IHtcbiAgRG1zTGF0aXR1ZGUsXG4gIERtc0xvbmdpdHVkZSxcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2xvY2F0aW9uLW5ldy9nZW8tY29tcG9uZW50cy9jb29yZGluYXRlcydcbmltcG9ydCBEaXJlY3Rpb25JbnB1dCBmcm9tICcuLi8uLi9jb21wb25lbnQvbG9jYXRpb24tbmV3L2dlby1jb21wb25lbnRzL2RpcmVjdGlvbidcbmltcG9ydCB7IERpcmVjdGlvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvdXRpbHMvZG1zLXV0aWxzJ1xuXG5jb25zdCBjbGVhclZhbGlkYXRpb25SZXN1bHRzID0gKGVycm9yTGlzdGVuZXI/OiBhbnkpID0+IHtcbiAgZXJyb3JMaXN0ZW5lciAmJlxuICAgIGVycm9yTGlzdGVuZXIoe1xuICAgICAgcG9pbnQ6IHVuZGVmaW5lZCxcbiAgICAgIHJhZGl1czogdW5kZWZpbmVkLFxuICAgIH0pXG59XG5cbmNvbnN0IFBvaW50UmFkaXVzTGF0TG9uRGQgPSAocHJvcHM6IGFueSkgPT4ge1xuICBjb25zdCB7IGxhdCwgbG9uLCByYWRpdXMsIHJhZGl1c1VuaXRzLCBzZXRTdGF0ZSwgZXJyb3JMaXN0ZW5lciB9ID0gcHJvcHNcbiAgY29uc3QgW2RkRXJyb3IsIHNldERkRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGVXaXRoRGVmYXVsdClcbiAgY29uc3QgW3JhZGl1c0Vycm9yLCBzZXRSYWRpdXNFcnJvcl0gPSB1c2VTdGF0ZShpbml0aWFsRXJyb3JTdGF0ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcm9wcy5kcmF3aW5nKSB7XG4gICAgICBzZXREZEVycm9yKGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQpXG4gICAgICBzZXRSYWRpdXNFcnJvcihpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGRWYWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgICB2YWxpZGF0ZUdlbygnbGF0JywgbGF0KSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2xvbicsIGxvbiksXG4gICAgICBdLmZpbmQoKHZhbGlkYXRpb24pID0+IHZhbGlkYXRpb24/LmVycm9yKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMzkpIEZJWE1FOiBQcm9wZXJ0eSAnZXJyb3InIGRvZXMgbm90IGV4aXN0IG9uIHR5cGUgJ3sgZXJyb3I6IC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXREZEVycm9yKGRkVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0KVxuICAgICAgY29uc3QgcmFkaXVzVmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRlR2VvKCdyYWRpdXMnLCB7XG4gICAgICAgIHZhbHVlOiByYWRpdXMsXG4gICAgICAgIHVuaXRzOiByYWRpdXNVbml0cyxcbiAgICAgIH0pXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldFJhZGl1c0Vycm9yKHJhZGl1c1ZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBlcnJvckxpc3RlbmVyICYmXG4gICAgICAgIGVycm9yTGlzdGVuZXIoe1xuICAgICAgICAgIHBvaW50OiBkZFZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgICAgcmFkaXVzOiByYWRpdXNWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbcHJvcHMubGF0LCBwcm9wcy5sb24sIHByb3BzLnJhZGl1cywgcHJvcHMucmFkaXVzVW5pdHNdKVxuXG4gIGZ1bmN0aW9uIGNsYW1wRGQoa2V5OiBhbnksIHZhbHVlOiBhbnkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMzOSkgRklYTUU6IFByb3BlcnR5ICdlcnJvcicgZG9lcyBub3QgZXhpc3Qgb24gdHlwZSAneyBlcnJvcjogLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBjb25zdCB7IGRlZmF1bHRWYWx1ZSB9ID0gdmFsaWRhdGVHZW8oa2V5LCB2YWx1ZSlcbiAgICBzZXRTdGF0ZSh7IFtrZXldOiBkZWZhdWx0VmFsdWUgfHwgdmFsdWUgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHNwYWNlLXktMlwiPlxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogYW55OyBvLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgIGxhYmVsPVwiTGF0aXR1ZGVcIlxuICAgICAgICB2YWx1ZT17bGF0ICE9PSB1bmRlZmluZWQgPyBTdHJpbmcobGF0KSA6IGxhdH1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gY2xhbXBEZCgnbGF0JywgdmFsdWUpfVxuICAgICAgICBhZGRvbj1cIsKwXCJcbiAgICAgIC8+XG4gICAgICA8VGV4dEZpZWxkXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBhbnk7IG8uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgbGFiZWw9XCJMb25naXR1ZGVcIlxuICAgICAgICB2YWx1ZT17bG9uICE9PSB1bmRlZmluZWQgPyBTdHJpbmcobG9uKSA6IGxvbn1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gY2xhbXBEZCgnbG9uJywgdmFsdWUpfVxuICAgICAgICBhZGRvbj1cIsKwXCJcbiAgICAgIC8+XG4gICAgICA8RXJyb3JDb21wb25lbnQgZXJyb3JTdGF0ZT17ZGRFcnJvcn0gLz5cbiAgICAgIDxVbml0c1xuICAgICAgICB2YWx1ZT17cmFkaXVzVW5pdHN9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ3JhZGl1c1VuaXRzJ106IHZhbHVlIH0pfVxuICAgICAgPlxuICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IHR5cGU6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgbGFiZWw9XCJSYWRpdXNcIlxuICAgICAgICAgIHZhbHVlPXtTdHJpbmcocmFkaXVzKX1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRTdGF0ZSh7IFsncmFkaXVzJ106IHZhbHVlIH0pfVxuICAgICAgICAvPlxuICAgICAgPC9Vbml0cz5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtyYWRpdXNFcnJvcn0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBQb2ludFJhZGl1c0xhdExvbkRtcyA9IChwcm9wczogYW55KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBkbXNMYXQsXG4gICAgZG1zTG9uLFxuICAgIGRtc0xhdERpcmVjdGlvbixcbiAgICBkbXNMb25EaXJlY3Rpb24sXG4gICAgcmFkaXVzLFxuICAgIHJhZGl1c1VuaXRzLFxuICAgIHNldFN0YXRlLFxuICAgIGVycm9yTGlzdGVuZXIsXG4gIH0gPSBwcm9wc1xuICBjb25zdCBbZG1zRXJyb3IsIHNldERtc0Vycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQpXG4gIGNvbnN0IFtyYWRpdXNFcnJvciwgc2V0UmFkaXVzRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGUpXG4gIGNvbnN0IGxhdGl0dWRlRGlyZWN0aW9ucyA9IFtEaXJlY3Rpb24uTm9ydGgsIERpcmVjdGlvbi5Tb3V0aF1cbiAgY29uc3QgbG9uZ2l0dWRlRGlyZWN0aW9ucyA9IFtEaXJlY3Rpb24uRWFzdCwgRGlyZWN0aW9uLldlc3RdXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocHJvcHMuZHJhd2luZykge1xuICAgICAgc2V0RG1zRXJyb3IoaW5pdGlhbEVycm9yU3RhdGVXaXRoRGVmYXVsdClcbiAgICAgIHNldFJhZGl1c0Vycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkbXNWYWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgICB2YWxpZGF0ZUdlbygnZG1zTGF0JywgZG1zTGF0KSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2Rtc0xvbicsIGRtc0xvbiksXG4gICAgICBdLmZpbmQoKHZhbGlkYXRpb24pID0+IHZhbGlkYXRpb24/LmVycm9yKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMzkpIEZJWE1FOiBQcm9wZXJ0eSAnZXJyb3InIGRvZXMgbm90IGV4aXN0IG9uIHR5cGUgJ3sgZXJyb3I6IC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBzZXREbXNFcnJvcihkbXNWYWxpZGF0aW9uUmVzdWx0IHx8IGluaXRpYWxFcnJvclN0YXRlV2l0aERlZmF1bHQpXG4gICAgICBjb25zdCByYWRpdXNWYWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVHZW8oJ3JhZGl1cycsIHtcbiAgICAgICAgdmFsdWU6IHJhZGl1cyxcbiAgICAgICAgdW5pdHM6IHJhZGl1c1VuaXRzLFxuICAgICAgfSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0UmFkaXVzRXJyb3IocmFkaXVzVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIGVycm9yTGlzdGVuZXIgJiZcbiAgICAgICAgZXJyb3JMaXN0ZW5lcih7XG4gICAgICAgICAgcG9pbnQ6IGRtc1ZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgICAgcmFkaXVzOiByYWRpdXNWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gY2xlYXJWYWxpZGF0aW9uUmVzdWx0cyhlcnJvckxpc3RlbmVyKVxuICB9LCBbcHJvcHMuZG1zTGF0LCBwcm9wcy5kbXNMb24sIHByb3BzLnJhZGl1cywgcHJvcHMucmFkaXVzVW5pdHNdKVxuXG4gIGZ1bmN0aW9uIGNsYW1wRG1zKGtleTogYW55LCB2YWx1ZTogYW55KSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMzkpIEZJWE1FOiBQcm9wZXJ0eSAnZXJyb3InIGRvZXMgbm90IGV4aXN0IG9uIHR5cGUgJ3sgZXJyb3I6IC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgY29uc3QgeyBkZWZhdWx0VmFsdWUgfSA9IHZhbGlkYXRlR2VvKGtleSwgdmFsdWUpXG4gICAgc2V0U3RhdGUoeyBba2V5XTogZGVmYXVsdFZhbHVlIHx8IHZhbHVlIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBzcGFjZS15LTJcIj5cbiAgICAgIDxEbXNMYXRpdHVkZVxuICAgICAgICBsYWJlbD1cIkxhdGl0dWRlXCJcbiAgICAgICAgdmFsdWU9e2Rtc0xhdH1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBjbGFtcERtcygnZG1zTGF0JywgdmFsdWUpfVxuICAgICAgPlxuICAgICAgICA8RGlyZWN0aW9uSW5wdXRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc2OSkgRklYTUU6IE5vIG92ZXJsb2FkIG1hdGNoZXMgdGhpcyBjYWxsLlxuICAgICAgICAgIG9wdGlvbnM9e2xhdGl0dWRlRGlyZWN0aW9uc31cbiAgICAgICAgICB2YWx1ZT17ZG1zTGF0RGlyZWN0aW9ufVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ2Rtc0xhdERpcmVjdGlvbiddOiB2YWx1ZSB9KX1cbiAgICAgICAgLz5cbiAgICAgIDwvRG1zTGF0aXR1ZGU+XG4gICAgICA8RG1zTG9uZ2l0dWRlXG4gICAgICAgIGxhYmVsPVwiTG9uZ2l0dWRlXCJcbiAgICAgICAgdmFsdWU9e2Rtc0xvbn1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiBjbGFtcERtcygnZG1zTG9uJywgdmFsdWUpfVxuICAgICAgPlxuICAgICAgICA8RGlyZWN0aW9uSW5wdXRcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc2OSkgRklYTUU6IE5vIG92ZXJsb2FkIG1hdGNoZXMgdGhpcyBjYWxsLlxuICAgICAgICAgIG9wdGlvbnM9e2xvbmdpdHVkZURpcmVjdGlvbnN9XG4gICAgICAgICAgdmFsdWU9e2Rtc0xvbkRpcmVjdGlvbn1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IHNldFN0YXRlKHsgWydkbXNMb25EaXJlY3Rpb24nXTogdmFsdWUgfSl9XG4gICAgICAgIC8+XG4gICAgICA8L0Rtc0xvbmdpdHVkZT5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtkbXNFcnJvcn0gLz5cbiAgICAgIDxVbml0c1xuICAgICAgICB2YWx1ZT17cmFkaXVzVW5pdHN9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ3JhZGl1c1VuaXRzJ106IHZhbHVlIH0pfVxuICAgICAgPlxuICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IGxhYmVsOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgdmFsdWU6IHN0cmluZy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgbGFiZWw9XCJSYWRpdXNcIlxuICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgIHZhbHVlPXtTdHJpbmcocmFkaXVzKX1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRTdGF0ZSh7IFsncmFkaXVzJ106IHZhbHVlIH0pfVxuICAgICAgICAvPlxuICAgICAgPC9Vbml0cz5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtyYWRpdXNFcnJvcn0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBQb2ludFJhZGl1c1VzbmdNZ3JzID0gKHByb3BzOiBhbnkpID0+IHtcbiAgY29uc3QgeyB1c25nLCByYWRpdXMsIHJhZGl1c1VuaXRzLCBzZXRTdGF0ZSwgZXJyb3JMaXN0ZW5lciB9ID0gcHJvcHNcbiAgY29uc3QgW3VzbmdFcnJvciwgc2V0VXNuZ0Vycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuICBjb25zdCBbcmFkaXVzRXJyb3IsIHNldFJhZGl1c0Vycm9yXSA9IHVzZVN0YXRlKGluaXRpYWxFcnJvclN0YXRlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHByb3BzLmRyYXdpbmcpIHtcbiAgICAgIHNldFVzbmdFcnJvcihpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICAgIHNldFJhZGl1c0Vycm9yKGluaXRpYWxFcnJvclN0YXRlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB1c25nVmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRlR2VvKCd1c25nJywgdXNuZylcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBlcnJvcjogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0VXNuZ0Vycm9yKHVzbmdWYWxpZGF0aW9uUmVzdWx0KVxuICAgICAgY29uc3QgcmFkaXVzVmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRlR2VvKCdyYWRpdXMnLCB7XG4gICAgICAgIHZhbHVlOiByYWRpdXMsXG4gICAgICAgIHVuaXRzOiByYWRpdXNVbml0cyxcbiAgICAgIH0pXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldFJhZGl1c0Vycm9yKHJhZGl1c1ZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBlcnJvckxpc3RlbmVyICYmXG4gICAgICAgIGVycm9yTGlzdGVuZXIoe1xuICAgICAgICAgIHBvaW50OiB1c25nVmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgICByYWRpdXM6IHJhZGl1c1ZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiBjbGVhclZhbGlkYXRpb25SZXN1bHRzKGVycm9yTGlzdGVuZXIpXG4gIH0sIFtwcm9wcy51c25nLCBwcm9wcy5yYWRpdXMsIHByb3BzLnJhZGl1c1VuaXRzXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBzcGFjZS15LTJcIj5cbiAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBhbnk7IG9uQ2hhbmdlOiAodmFsdS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGxhYmVsPVwiVVNORyAvIE1HUlNcIlxuICAgICAgICB2YWx1ZT17dXNuZ31cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gc2V0U3RhdGUoeyBbJ3VzbmcnXTogdmFsdWUgfSl9XG4gICAgICAvPlxuICAgICAgPEVycm9yQ29tcG9uZW50IGVycm9yU3RhdGU9e3VzbmdFcnJvcn0gLz5cbiAgICAgIDxVbml0c1xuICAgICAgICB2YWx1ZT17cmFkaXVzVW5pdHN9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ3JhZGl1c1VuaXRzJ106IHZhbHVlIH0pfVxuICAgICAgPlxuICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IGxhYmVsOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgdmFsdWU6IHN0cmluZy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgbGFiZWw9XCJSYWRpdXNcIlxuICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgIHZhbHVlPXtTdHJpbmcocmFkaXVzKX1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRTdGF0ZSh7IFsncmFkaXVzJ106IHZhbHVlIH0pfVxuICAgICAgICAvPlxuICAgICAgPC9Vbml0cz5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtyYWRpdXNFcnJvcn0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBQb2ludFJhZGl1c1V0bVVwcyA9IChwcm9wczogYW55KSA9PiB7XG4gIGNvbnN0IHtcbiAgICB1dG1VcHNFYXN0aW5nLFxuICAgIHV0bVVwc05vcnRoaW5nLFxuICAgIHV0bVVwc1pvbmUsXG4gICAgdXRtVXBzSGVtaXNwaGVyZSxcbiAgICByYWRpdXMsXG4gICAgcmFkaXVzVW5pdHMsXG4gICAgc2V0U3RhdGUsXG4gICAgZXJyb3JMaXN0ZW5lcixcbiAgfSA9IHByb3BzXG4gIGNvbnN0IFt1dG1FcnJvciwgc2V0VXRtRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGUpXG4gIGNvbnN0IFtyYWRpdXNFcnJvciwgc2V0UmFkaXVzRXJyb3JdID0gdXNlU3RhdGUoaW5pdGlhbEVycm9yU3RhdGUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocHJvcHMuZHJhd2luZykge1xuICAgICAgc2V0VXRtRXJyb3IoaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBzZXRSYWRpdXNFcnJvcihpbml0aWFsRXJyb3JTdGF0ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdXRtVXBzID0ge1xuICAgICAgICBlYXN0aW5nOiB1dG1VcHNFYXN0aW5nLFxuICAgICAgICBub3J0aGluZzogdXRtVXBzTm9ydGhpbmcsXG4gICAgICAgIHpvbmVOdW1iZXI6IHV0bVVwc1pvbmUsXG4gICAgICAgIGhlbWlzcGhlcmU6IHV0bVVwc0hlbWlzcGhlcmUsXG4gICAgICB9XG4gICAgICBjb25zdCB1dG1VcHNWYWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgICB2YWxpZGF0ZUdlbygnZWFzdGluZycsIHV0bVVwcyksXG4gICAgICAgIHZhbGlkYXRlR2VvKCdub3J0aGluZycsIHV0bVVwcyksXG4gICAgICAgIHZhbGlkYXRlR2VvKCd6b25lTnVtYmVyJywgdXRtVXBzKSxcbiAgICAgICAgdmFsaWRhdGVHZW8oJ2hlbWlzcGhlcmUnLCB1dG1VcHMpLFxuICAgICAgXS5maW5kKCh2YWxpZGF0aW9uKSA9PiB2YWxpZGF0aW9uPy5lcnJvcilcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzM5KSBGSVhNRTogUHJvcGVydHkgJ2Vycm9yJyBkb2VzIG5vdCBleGlzdCBvbiB0eXBlICd7IGVycm9yOiAuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgc2V0VXRtRXJyb3IodXRtVXBzVmFsaWRhdGlvblJlc3VsdCB8fCBpbml0aWFsRXJyb3JTdGF0ZVdpdGhEZWZhdWx0KVxuICAgICAgY29uc3QgcmFkaXVzVmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRlR2VvKCdyYWRpdXMnLCB7XG4gICAgICAgIHZhbHVlOiByYWRpdXMsXG4gICAgICAgIHVuaXRzOiByYWRpdXNVbml0cyxcbiAgICAgIH0pXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgZXJyb3I6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHNldFJhZGl1c0Vycm9yKHJhZGl1c1ZhbGlkYXRpb25SZXN1bHQgfHwgaW5pdGlhbEVycm9yU3RhdGUpXG4gICAgICBlcnJvckxpc3RlbmVyICYmXG4gICAgICAgIGVycm9yTGlzdGVuZXIoe1xuICAgICAgICAgIHBvaW50OiB1dG1VcHNWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICAgIHJhZGl1czogcmFkaXVzVmFsaWRhdGlvblJlc3VsdCxcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IGNsZWFyVmFsaWRhdGlvblJlc3VsdHMoZXJyb3JMaXN0ZW5lcilcbiAgfSwgW1xuICAgIHByb3BzLnV0bVVwc0Vhc3RpbmcsXG4gICAgcHJvcHMudXRtVXBzTm9ydGhpbmcsXG4gICAgcHJvcHMudXRtVXBzWm9uZSxcbiAgICBwcm9wcy51dG1VcHNIZW1pc3BoZXJlLFxuICAgIHByb3BzLnJhZGl1cyxcbiAgICBwcm9wcy5yYWRpdXNVbml0cyxcbiAgXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBzcGFjZS15LTJcIj5cbiAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBhbnk7IG9uQ2hhbmdlOiAodmFsdS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGxhYmVsPVwiRWFzdGluZ1wiXG4gICAgICAgIHZhbHVlPXtcbiAgICAgICAgICB1dG1VcHNFYXN0aW5nICE9PSB1bmRlZmluZWQgPyBTdHJpbmcodXRtVXBzRWFzdGluZykgOiB1dG1VcHNFYXN0aW5nXG4gICAgICAgIH1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gc2V0U3RhdGUoeyBbJ3V0bVVwc0Vhc3RpbmcnXTogdmFsdWUgfSl9XG4gICAgICAgIGFkZG9uPVwibVwiXG4gICAgICAvPlxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGFueTsgb25DaGFuZ2U6ICh2YWx1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbGFiZWw9XCJOb3J0aGluZ1wiXG4gICAgICAgIHZhbHVlPXtcbiAgICAgICAgICB1dG1VcHNOb3J0aGluZyAhPT0gdW5kZWZpbmVkID8gU3RyaW5nKHV0bVVwc05vcnRoaW5nKSA6IHV0bVVwc05vcnRoaW5nXG4gICAgICAgIH1cbiAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gc2V0U3RhdGUoeyBbJ3V0bVVwc05vcnRoaW5nJ106IHZhbHVlIH0pfVxuICAgICAgICBhZGRvbj1cIm1cIlxuICAgICAgLz5cbiAgICAgIDxab25lXG4gICAgICAgIHZhbHVlPXt1dG1VcHNab25lfVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IHNldFN0YXRlKHsgWyd1dG1VcHNab25lJ106IHZhbHVlIH0pfVxuICAgICAgLz5cbiAgICAgIDxIZW1pc3BoZXJlXG4gICAgICAgIHZhbHVlPXt1dG1VcHNIZW1pc3BoZXJlfVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IHNldFN0YXRlKHsgWyd1dG1VcHNIZW1pc3BoZXJlJ106IHZhbHVlIH0pfVxuICAgICAgLz5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXt1dG1FcnJvcn0gLz5cbiAgICAgIDxVbml0c1xuICAgICAgICB2YWx1ZT17cmFkaXVzVW5pdHN9XG4gICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4gc2V0U3RhdGUoeyBbJ3JhZGl1c1VuaXRzJ106IHZhbHVlIH0pfVxuICAgICAgPlxuICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IGxhYmVsOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgdmFsdWU6IHN0cmluZy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgbGFiZWw9XCJSYWRpdXNcIlxuICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgIHZhbHVlPXtTdHJpbmcocmFkaXVzKX1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRTdGF0ZSh7IFsncmFkaXVzJ106IHZhbHVlIH0pfVxuICAgICAgICAvPlxuICAgICAgPC9Vbml0cz5cbiAgICAgIDxFcnJvckNvbXBvbmVudCBlcnJvclN0YXRlPXtyYWRpdXNFcnJvcn0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBQb2ludFJhZGl1cyA9IChwcm9wczogYW55KSA9PiB7XG4gIGNvbnN0IHsgc2V0U3RhdGUsIGxvY2F0aW9uVHlwZSB9ID0gcHJvcHNcblxuICBjb25zdCBpbnB1dHMgPSB7XG4gICAgZGQ6IFBvaW50UmFkaXVzTGF0TG9uRGQsXG4gICAgZG1zOiBQb2ludFJhZGl1c0xhdExvbkRtcyxcbiAgICB1c25nOiBQb2ludFJhZGl1c1VzbmdNZ3JzLFxuICAgIHV0bVVwczogUG9pbnRSYWRpdXNVdG1VcHMsXG4gIH1cblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgY29uc3QgQ29tcG9uZW50ID0gaW5wdXRzW2xvY2F0aW9uVHlwZV0gfHwgbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxSYWRpb1xuICAgICAgICB2YWx1ZT17bG9jYXRpb25UeXBlfVxuICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBhbnkpID0+IHNldFN0YXRlKHsgWydsb2NhdGlvblR5cGUnXTogdmFsdWUgfSl9XG4gICAgICA+XG4gICAgICAgIDxSYWRpb0l0ZW0gdmFsdWU9XCJkZFwiPkxhdCAvIExvbiAoREQpPC9SYWRpb0l0ZW0+XG4gICAgICAgIDxSYWRpb0l0ZW0gdmFsdWU9XCJkbXNcIj5MYXQgLyBMb24gKERNUyk8L1JhZGlvSXRlbT5cbiAgICAgICAgPFJhZGlvSXRlbSB2YWx1ZT1cInVzbmdcIj5VU05HIC8gTUdSUzwvUmFkaW9JdGVtPlxuICAgICAgICA8UmFkaW9JdGVtIHZhbHVlPVwidXRtVXBzXCI+VVRNIC8gVVBTPC9SYWRpb0l0ZW0+XG4gICAgICA8L1JhZGlvPlxuICAgICAgPE1pbmltdW1TcGFjaW5nIC8+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImlucHV0LWxvY2F0aW9uXCI+XG4gICAgICAgIHtDb21wb25lbnQgIT09IG51bGwgPyA8Q29tcG9uZW50IHsuLi5wcm9wc30gLz4gOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUG9pbnRSYWRpdXNcbiJdfQ==