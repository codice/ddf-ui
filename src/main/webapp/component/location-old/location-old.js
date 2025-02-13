import { __assign } from "tslib";
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
/* eslint-disable no-var */
import _ from 'underscore';
import Backbone from 'backbone';
import * as usngs from 'usng.js';
import * as dmsUtils from '../location-new/utils/dms-utils';
import DistanceUtils from '../../js/DistanceUtils';
import wreqr from '../../js/wreqr';
import { Drawing } from '../singletons/drawing';
import { validateUsngLineOrPoly, validateDmsLineOrPoly, validateUtmUpsLineOrPoly, parseDmsCoordinate, isUPS, } from '../../react-component/location/validators';
import { locationColors } from '../../react-component/location/location-color-selector';
import { v4 } from 'uuid';
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
var converter = new usngs.Converter();
var utmUpsLocationType = 'utmUps';
// offset used by utmUps for southern hemisphere
var utmUpsBoundaryNorth = 84;
var utmUpsBoundarySouth = -80;
var northingOffset = 10000000;
var usngPrecision = 6;
var Direction = dmsUtils.Direction;
export default Backbone.AssociatedModel.extend({
    defaults: function () {
        return {
            // later on we should probably update areas using locationId to just use id
            locationId: v4(),
            color: Object.values(locationColors)[0],
            drawing: false,
            north: undefined,
            east: undefined,
            south: undefined,
            west: undefined,
            dmsNorth: undefined,
            dmsSouth: undefined,
            dmsEast: undefined,
            dmsWest: undefined,
            dmsNorthDirection: Direction.North,
            dmsSouthDirection: Direction.North,
            dmsEastDirection: Direction.East,
            dmsWestDirection: Direction.East,
            dmsPointArray: undefined,
            mapNorth: undefined,
            mapEast: undefined,
            mapWest: undefined,
            mapSouth: undefined,
            radiusUnits: 'meters',
            radius: '',
            locationType: 'dd',
            prevLocationType: 'dd',
            lat: undefined,
            lon: undefined,
            dmsLat: undefined,
            dmsLon: undefined,
            dmsLatDirection: Direction.North,
            dmsLonDirection: Direction.East,
            bbox: undefined,
            usng: undefined,
            utmUps: undefined,
            utmUpsPointArray: undefined,
            line: undefined,
            multiline: undefined,
            lineWidth: '',
            lineUnits: 'meters',
            polygon: undefined,
            polygonBufferWidth: '',
            polyType: undefined,
            polygonBufferUnits: 'meters',
            hasKeyword: false,
            keywordValue: undefined,
            utmUpsUpperLeftEasting: undefined,
            utmUpsUpperLeftNorthing: undefined,
            utmUpsUpperLeftHemisphere: 'Northern',
            utmUpsUpperLeftZone: 1,
            utmUpsLowerRightEasting: undefined,
            utmUpsLowerRightNorthing: undefined,
            utmUpsLowerRightHemisphere: 'Northern',
            utmUpsLowerRightZone: 1,
            utmUpsEasting: undefined,
            utmUpsNorthing: undefined,
            utmUpsZone: 1,
            utmUpsHemisphere: 'Northern',
            usngbbUpperLeft: undefined,
            usngbbLowerRight: undefined,
            usngPointArray: undefined,
        };
    },
    set: function (key, value, options) {
        if (!_.isObject(key)) {
            var keyObject = {};
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            keyObject[key] = value;
            key = keyObject;
            value = options;
        }
        Backbone.AssociatedModel.prototype.set.call(this, key, value, options);
    },
    initialize: function (props) {
        var _this_1 = this;
        this.listenTo(this, 'change:line change:polygon', this.setUsngDmsUtmWithLineOrPoly);
        this.listenTo(this, 'change:dmsPointArray', this.setLatLonLinePolyFromDms);
        this.listenTo(this, 'change:usngPointArray', this.setLatLonLinePolyFromUsng);
        this.listenTo(this, 'change:utmUpsPointArray', this.setLatLonLinePolyFromUtmUps);
        this.listenTo(this, 'change:north change:south change:east change:west', this.setBBox);
        this.listenTo(this, 'change:dmsNorth change:dmsNorthDirection', this.setBboxDmsNorth);
        this.listenTo(this, 'change:dmsSouth change:dmsSouthDirection', this.setBboxDmsSouth);
        this.listenTo(this, 'change:dmsEast change:dmsEastDirection', this.setBboxDmsEast);
        this.listenTo(this, 'change:dmsWest change:dmsWestDirection', this.setBboxDmsWest);
        this.listenTo(this, 'change:dmsLat change:dmsLatDirection', this.setRadiusDmsLat);
        this.listenTo(this, 'change:dmsLon change:dmsLonDirection', this.setRadiusDmsLon);
        this.listenTo(this, 'change:usngbbUpperLeft change:usngbbLowerRight', this.setBboxUsng);
        this.listenTo(this, 'change:locationType', this.handleLocationType);
        this.listenTo(this, 'change:bbox', _.debounce(this.setBboxLatLon, 5));
        this.listenTo(this, 'change:lat change:lon', this.setRadiusLatLon);
        this.listenTo(this, 'change:usng', this.setRadiusUsng);
        this.listenTo(this, 'change:utmUpsEasting change:utmUpsNorthing change:utmUpsZone change:utmUpsHemisphere', this.setRadiusUtmUps);
        this.listenTo(this, 'change:utmUpsUpperLeftEasting change:utmUpsUpperLeftNorthing change:utmUpsUpperLeftZone change:utmUpsUpperLeftHemisphere change:utmUpsLowerRightEasting change:utmUpsLowerRightNorthing change:utmUpsLowerRightZone change:utmUpsLowerRightHemisphere', this.setBboxUtmUps);
        this.listenTo(this, 'change:mode', function () {
            _this_1.set(_this_1.defaults());
            wreqr.vent.trigger('search:drawend', [_this_1]);
        });
        this.listenTo(this, 'EndExtent', this.drawingOff);
        this.listenTo(this, 'BeginExtent', this.drawingOn);
        this.initializeValues(props);
    },
    initializeValues: function (props) {
        if ((props.type === 'POINTRADIUS' || props.type === 'POINT') &&
            props.lat &&
            props.lon) {
            if (!props.usng || !props.utmUpsEasting) {
                // initializes dms/usng/utmUps using lat/lon
                this.updateCoordPointRadiusValues(props.lat, props.lon);
            }
        }
        else if (props.mode === 'bbox') {
            this.setBBox();
        }
        else {
            this.setUsngDmsUtmWithLineOrPoly(this);
        }
    },
    updateCoordPointRadiusValues: function (lat, lon) {
        if (!this.isLatLonValid(lat, lon))
            return;
        this.setRadiusDmsFromMap();
        var utmUps = this.LLtoUtmUps(lat, lon);
        if (utmUps !== undefined) {
            var utmUpsParts = this.formatUtmUps(utmUps);
            this.setUtmUpsPointRadius(utmUpsParts, true);
        }
        else {
            this.clearUtmUpsPointRadius(false);
        }
        if (this.isInUpsSpace(lat, lon)) {
            this.set('usng', undefined);
            return;
        }
        var usngsStr = converter.LLtoUSNG(lat, lon, usngPrecision);
        this.set('usng', usngsStr, { silent: true });
    },
    drawingOff: function () {
        if (this.get('locationType') === 'dms') {
            this.setBboxDmsFromMap();
        }
        var prevLocationType = this.get('prevLocationType');
        if (prevLocationType === 'utmUps') {
            this.set('prevLocationType', '');
            this.set('locationType', 'utmUps');
        }
        this.drawing = false;
        Drawing.turnOffDrawing();
    },
    drawingOn: function () {
        var locationType = this.get('locationType');
        if (locationType === 'utmUps') {
            this.set('prevLocationType', 'utmUps');
            this.set('locationType', 'dd');
        }
        this.drawing = true;
        Drawing.turnOnDrawing(this);
    },
    repositionLatLonUtmUps: function (isDefined, parse, assign, clear) {
        if (isDefined(this)) {
            var utmUpsParts = parse(this);
            if (utmUpsParts !== undefined) {
                var result = this.utmUpstoLL(utmUpsParts);
                if (result !== undefined) {
                    var newResult = {};
                    assign(newResult, result.lat, result.lon);
                    this.set(newResult);
                }
                else {
                    clear(this);
                }
            }
        }
    },
    repositionLatLon: function () {
        var result = this.usngBbToLatLon();
        if (result !== undefined) {
            try {
                var newResult = {};
                newResult.mapNorth = result.north;
                newResult.mapSouth = result.south;
                newResult.mapEast = result.east;
                newResult.mapWest = result.west;
                this.set(newResult);
            }
            catch (err) {
                // do nothing
            }
        }
        this.repositionLatLonUtmUps(function (_this) { return _this.isUtmUpsUpperLeftDefined(); }, function (_this) { return _this.parseUtmUpsUpperLeft(); }, function (newResult, lat, lon) {
            newResult.mapNorth = lat;
            newResult.mapWest = lon;
        }, function (_this) { return _this.clearUtmUpsUpperLeft(true); });
        this.repositionLatLonUtmUps(function (_this) { return _this.isUtmUpsLowerRightDefined(); }, function (_this) { return _this.parseUtmUpsLowerRight(); }, function (newResult, lat, lon) {
            newResult.mapSouth = lat;
            newResult.mapEast = lon;
        }, function (_this) { return _this.clearUtmUpsLowerRight(true); });
    },
    setLatLonUtmUps: function (result, isDefined, parse, assign, clear) {
        if (!(result.north !== undefined &&
            result.south !== undefined &&
            result.west !== undefined &&
            result.east !== undefined) &&
            isDefined(this)) {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '_this'.
            // eslint-disable-next-line no-undef
            var utmUpsParts = parse(_this);
            if (utmUpsParts !== undefined) {
                var utmUpsResult = this.utmUpstoLL(utmUpsParts);
                if (utmUpsResult !== undefined) {
                    assign(result, utmUpsResult.lat, utmUpsResult.lon);
                }
                else {
                    clear(this);
                }
            }
        }
    },
    convertLatLonLinePolyToUsng: function (points) {
        return Array.isArray(points)
            ? points.map(function (point) {
                // A little bit unintuitive, but lat/lon is swapped here
                return converter.LLtoMGRSUPS(point[1], point[0], usngPrecision);
            })
            : undefined;
    },
    convertLatLonLinePolyToDms: function (points) {
        return Array.isArray(points)
            ? points.map(function (point) {
                var lat = dmsUtils.ddToDmsCoordinateLat(point[1]);
                var lon = dmsUtils.ddToDmsCoordinateLon(point[0]);
                return {
                    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                    lat: lat.coordinate,
                    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                    lon: lon.coordinate,
                    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                    latDirection: lat.direction,
                    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                    lonDirection: lon.direction,
                };
            })
            : undefined;
    },
    convertLatLonLinePolyToUtm: function (points) {
        var _this_1 = this;
        return Array.isArray(points)
            ? points.map(function (point) {
                var llPoint = _this_1.LLtoUtmUps(point[1], point[0]);
                return __assign(__assign({}, llPoint), { hemisphere: llPoint.hemisphere.toUpperCase() === 'NORTHERN'
                        ? 'Northern'
                        : 'Southern' });
            })
            : undefined;
    },
    setUsngDmsUtmWithLineOrPoly: function (model) {
        var key = this.get('mode');
        if (key === 'poly')
            key = 'polygon';
        if (key && (key === 'line' || key === 'polygon')) {
            var points = this.get(key);
            var usngPoints = this.convertLatLonLinePolyToUsng(points);
            var dmsPoints = this.convertLatLonLinePolyToDms(points);
            var utmupsPoints = this.convertLatLonLinePolyToUtm(points);
            model.set({
                usngPointArray: usngPoints,
                dmsPointArray: dmsPoints,
                utmUpsPointArray: utmupsPoints,
            }, {
                silent: true, //don't trigger another onChange for line or poly
            });
        }
    },
    setLatLonLinePolyFromDms: function () {
        var _a;
        var key = this.get('mode');
        if (key === 'poly')
            key = 'polygon';
        if (key && (key === 'line' || key === 'polygon')) {
            var validation = validateDmsLineOrPoly(this.get('dmsPointArray'), key);
            if (!validation.error) {
                var llPoints = this.get('dmsPointArray').map(function (point) {
                    var latCoordinate = dmsUtils.dmsCoordinateToDD(__assign(__assign({}, parseDmsCoordinate(point.lat)), { direction: point.latDirection }));
                    var lonCoordinate = dmsUtils.dmsCoordinateToDD(__assign(__assign({}, parseDmsCoordinate(point.lon)), { direction: point.lonDirection }));
                    // A little bit unintuitive, but lat/lon is swapped here
                    return [lonCoordinate, latCoordinate];
                });
                var usngPoints = this.convertLatLonLinePolyToUsng(llPoints);
                var utmupsPoints = this.convertLatLonLinePolyToUtm(llPoints);
                this.set((_a = {},
                    _a[key] = llPoints,
                    _a.usngPointArray = usngPoints,
                    _a.utmUpsPointArray = utmupsPoints,
                    _a), {
                    silent: true, //don't trigger another onChange for line or poly
                });
            }
        }
    },
    setLatLonLinePolyFromUsng: function () {
        var _a;
        var key = this.get('mode');
        if (key === 'poly')
            key = 'polygon';
        if (key && (key === 'line' || key === 'polygon')) {
            var validation = validateUsngLineOrPoly(this.get('usngPointArray'), key);
            if (!validation.error) {
                var llPoints = this.get('usngPointArray').map(function (point) {
                    // A little bit unintuitive, but lat/lon is swapped here
                    var convertedPoint = isUPS(point)
                        ? converter.UTMUPStoLL(point)
                        : converter.USNGtoLL(point, usngPrecision);
                    return [convertedPoint.lon, convertedPoint.lat];
                });
                var dmsPoints = this.convertLatLonLinePolyToDms(llPoints);
                var utmupsPoints = this.convertLatLonLinePolyToUtm(llPoints);
                this.set((_a = {},
                    _a[key] = llPoints,
                    _a.dmsPointArray = dmsPoints,
                    _a.utmUpsPointArray = utmupsPoints,
                    _a), {
                    silent: true, //don't trigger another onChange for line or poly
                });
            }
        }
    },
    setLatLonLinePolyFromUtmUps: function () {
        var _a;
        var _this_1 = this;
        var key = this.get('mode');
        if (key === 'poly')
            key = 'polygon';
        if (key && (key === 'line' || key === 'polygon')) {
            var validation = validateUtmUpsLineOrPoly(this.get('utmUpsPointArray'), key);
            if (!validation.error) {
                var llPoints = this.get('utmUpsPointArray').map(function (point) {
                    var convertedPoint = _this_1.utmUpstoLL(point);
                    return [convertedPoint.lon, convertedPoint.lat];
                });
                var dmsPoints = this.convertLatLonLinePolyToDms(llPoints);
                var usngPoints = this.convertLatLonLinePolyToUsng(llPoints);
                this.set((_a = {},
                    _a[key] = llPoints,
                    _a.dmsPointArray = dmsPoints,
                    _a.usngPointArray = usngPoints,
                    _a), {
                    silent: true, //don't trigger another onChange for line or poly
                });
            }
        }
    },
    setLatLon: function () {
        if (this.get('locationType') === 'dd') {
            var result = {};
            result.north = this.get('mapNorth');
            result.south = this.get('mapSouth');
            result.west = this.get('mapWest');
            result.east = this.get('mapEast');
            if (!(result.north !== undefined &&
                result.south !== undefined &&
                result.west !== undefined &&
                result.east !== undefined) &&
                this.get('usngbbUpperLeft') &&
                this.get('usngbbLowerRight')) {
                try {
                    result = this.usngBbToLatLon();
                }
                catch (err) {
                    // do nothing
                }
            }
            this.setLatLonUtmUps(result, function (_this) { return _this.isUtmUpsUpperLeftDefined(); }, function (_this) { return _this.parseUtmUpsUpperLeft(); }, function (result, lat, lon) {
                result.north = lat;
                result.west = lon;
            }, function (_this) {
                _this.clearUtmUpsUpperLeft(true);
            });
            this.setLatLonUtmUps(result, function (_this) { return _this.isUtmUpsLowerRightDefined(); }, function (_this) { return _this.parseUtmUpsLowerRight(); }, function (result, lat, lon) {
                result.south = lat;
                result.east = lon;
            }, function (_this) {
                _this.clearUtmUpsLowerRight(true);
            });
            result.north = DistanceUtils.coordinateRound(result.north);
            result.east = DistanceUtils.coordinateRound(result.east);
            result.south = DistanceUtils.coordinateRound(result.south);
            result.west = DistanceUtils.coordinateRound(result.west);
            this.set(result);
        }
        else if (this.get('locationType') === 'dms') {
            this.setBboxDmsFromMap();
        }
    },
    setFilterBBox: function (model) {
        var north = parseFloat(model.get('north'));
        var south = parseFloat(model.get('south'));
        var west = parseFloat(model.get('west'));
        var east = parseFloat(model.get('east'));
        model.set({
            mapNorth: Number.isNaN(north) ? undefined : north,
            mapSouth: Number.isNaN(south) ? undefined : north,
            mapEast: Number.isNaN(east) ? undefined : east,
            mapWest: Number.isNaN(west) ? undefined : west,
        });
    },
    setBboxLatLon: function () {
        var north = parseFloat(this.get('north')), south = parseFloat(this.get('south')), west = parseFloat(this.get('west')), east = parseFloat(this.get('east'));
        if (!this.isLatLonValid(north, west) || !this.isLatLonValid(south, east)) {
            return;
        }
        this.setBboxDmsFromMap();
        var utmUps = this.LLtoUtmUps(north, west);
        if (utmUps !== undefined) {
            var utmUpsParts = this.formatUtmUps(utmUps);
            this.setUtmUpsUpperLeft(utmUpsParts, !this.isLocationTypeUtmUps());
        }
        utmUps = this.LLtoUtmUps(south, east);
        if (utmUps !== undefined) {
            // eslint-disable-next-line no-redeclare
            var utmUpsParts = this.formatUtmUps(utmUps);
            this.setUtmUpsLowerRight(utmUpsParts, !this.isLocationTypeUtmUps());
        }
        if (this.isLocationTypeUtmUps() && this.get('drawing')) {
            this.repositionLatLon();
        }
        var lat = (north + south) / 2;
        var lon = (east + west) / 2;
        if (this.isInUpsSpace(lat, lon)) {
            this.set({
                usngbbUpperLeft: undefined,
                usngbbLowerRight: undefined,
            });
            return;
        }
        var result = this.usngBbFromLatLon({ north: north, west: west, south: south, east: east });
        this.set(result, {
            silent: this.get('locationType') !== 'usng',
        });
        if (this.get('locationType') === 'usng' && this.get('drawing')) {
            this.repositionLatLon();
        }
    },
    setRadiusLatLon: function () {
        var lat = this.get('lat'), lon = this.get('lon');
        this.updateCoordPointRadiusValues(lat, lon);
    },
    setRadiusDmsLat: function () {
        this.setLatLonFromDms('dmsLat', 'dmsLatDirection', 'lat');
    },
    setRadiusDmsLon: function () {
        this.setLatLonFromDms('dmsLon', 'dmsLonDirection', 'lon');
    },
    usngBbFromLatLon: function (_a) {
        var north = _a.north, west = _a.west, south = _a.south, east = _a.east;
        try {
            var usngbbUpperLeft = converter.LLtoUSNG(north, west, usngPrecision);
            var usngbbLowerRight = converter.LLtoUSNG(south, east, usngPrecision);
            return {
                usngbbUpperLeft: usngbbUpperLeft,
                usngbbLowerRight: usngbbLowerRight,
            };
        }
        catch (err) {
            // do nothing
        }
        return {
            usngbbUpperLeft: undefined,
            usngbbLowerRight: undefined,
        };
    },
    usngBbToLatLon: function () {
        if (this.get('usngbbUpperLeft') !== undefined &&
            this.get('usngbbLowerRight') !== undefined) {
            var _a = converter.USNGtoLL(this.get('usngbbUpperLeft')), north = _a.north, west = _a.west;
            var _b = converter.USNGtoLL(this.get('usngbbLowerRight')), south = _b.south, east = _b.east;
            return { north: north, south: south, east: east, west: west };
        }
        return {};
    },
    setBboxUsng: function () {
        if (this.get('locationType') !== 'usng') {
            return;
        }
        var _a = this.usngBbToLatLon(), north = _a.north, west = _a.west, south = _a.south, east = _a.east;
        this.set({
            mapNorth: north,
            mapSouth: south,
            mapEast: east,
            mapWest: west,
        });
        this.set({
            north: north,
            west: west,
            south: south,
            east: east,
        }, {
            silent: true,
        });
        var utmUps = this.LLtoUtmUps(north, west);
        if (utmUps !== undefined) {
            var utmUpsFormatted = this.formatUtmUps(utmUps);
            this.setUtmUpsUpperLeft(utmUpsFormatted, true);
        }
        utmUps = this.LLtoUtmUps(south, east);
        if (utmUps !== undefined) {
            var utmUpsFormatted = this.formatUtmUps(utmUps);
            this.setUtmUpsLowerRight(utmUpsFormatted, true);
        }
    },
    setBBox: function () {
        //we need these to always be inferred
        //as numeric values and never as strings
        var north = parseFloat(this.get('north'));
        var south = parseFloat(this.get('south'));
        var west = parseFloat(this.get('west'));
        var east = parseFloat(this.get('east'));
        if (!Number.isNaN(north) &&
            !Number.isNaN(south) &&
            !Number.isNaN(east) &&
            !Number.isNaN(west)) {
            this.set('bbox', [west, south, east, north].join(','));
        }
        this.set({
            mapNorth: Number.isNaN(north) ? undefined : north,
            mapSouth: Number.isNaN(south) ? undefined : south,
            mapEast: Number.isNaN(east) ? undefined : east,
            mapWest: Number.isNaN(west) ? undefined : west,
        });
    },
    setRadiusUsng: function () {
        var usng = this.get('usng');
        if (usng === undefined) {
            return;
        }
        var result;
        try {
            result = converter.USNGtoLL(usng, true);
        }
        catch (err) {
            // do nothing
        }
        if (!isNaN(result.lat) && !isNaN(result.lon)) {
            this.set(result);
            var utmUps = this.LLtoUtmUps(result.lat, result.lon);
            if (utmUps !== undefined) {
                var utmUpsParts = this.formatUtmUps(utmUps);
                this.setUtmUpsPointRadius(utmUpsParts, true);
            }
        }
        else {
            this.clearUtmUpsPointRadius(true);
            this.set({
                lat: undefined,
                lon: undefined,
            });
        }
    },
    isLatLonValid: function (lat, lon) {
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        return lat > -90 && lat < 90 && lon > -180 && lon < 180;
    },
    isInUpsSpace: function (lat, lon) {
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        return (this.isLatLonValid(lat, lon) &&
            (lat < utmUpsBoundarySouth || lat > utmUpsBoundaryNorth));
    },
    // This method is called when the UTM/UPS point radius coordinates are changed by the user.
    setRadiusUtmUps: function () {
        if (!this.isLocationTypeUtmUps() && !this.isUtmUpsPointRadiusDefined()) {
            return;
        }
        var utmUpsParts = this.parseUtmUpsPointRadius();
        if (utmUpsParts === undefined) {
            return;
        }
        var utmUpsResult = this.utmUpstoLL(utmUpsParts);
        if (utmUpsResult === undefined) {
            if (utmUpsParts.zoneNumber !== 0) {
                this.clearUtmUpsPointRadius(true);
            }
            this.set({
                lat: undefined,
                lon: undefined,
                usng: undefined,
                radius: '',
            });
            return;
        }
        this.set(utmUpsResult);
        var lat = utmUpsResult.lat, lon = utmUpsResult.lon;
        if (!this.isLatLonValid(lat, lon) || this.isInUpsSpace(lat, lon)) {
            this.set({ usng: undefined });
            return;
        }
        var usngsStr = converter.LLtoUSNG(lat, lon, usngPrecision);
        this.set('usng', usngsStr, { silent: true });
    },
    // This method is called when the UTM/UPS bounding box coordinates are changed by the user.
    setBboxUtmUps: function () {
        if (!this.isLocationTypeUtmUps()) {
            return;
        }
        var upperLeft = undefined;
        var lowerRight = undefined;
        if (this.isUtmUpsUpperLeftDefined()) {
            var upperLeftParts = this.parseUtmUpsUpperLeft();
            if (upperLeftParts !== undefined) {
                upperLeft = this.utmUpstoLL(upperLeftParts);
                if (upperLeft !== undefined) {
                    this.set({ mapNorth: upperLeft.lat, mapWest: upperLeft.lon });
                    this.set({ north: upperLeft.lat, west: upperLeft.lon }, { silent: true });
                }
                else {
                    this.set({
                        mapNorth: undefined,
                        mapSouth: undefined,
                        mapEast: undefined,
                        mapWest: undefined,
                        usngbbUpperLeft: undefined,
                        usngbbLowerRight: undefined,
                    });
                }
            }
            else {
                this.set({ north: undefined, west: undefined }, { silent: true });
            }
        }
        else {
            this.set({ north: undefined, west: undefined }, { silent: true });
        }
        if (this.isUtmUpsLowerRightDefined()) {
            var lowerRightParts = this.parseUtmUpsLowerRight();
            if (lowerRightParts !== undefined) {
                lowerRight = this.utmUpstoLL(lowerRightParts);
                if (lowerRight !== undefined) {
                    this.set({ mapSouth: lowerRight.lat, mapEast: lowerRight.lon });
                    this.set({ south: lowerRight.lat, east: lowerRight.lon }, { silent: true });
                }
                else {
                    this.set({
                        mapNorth: undefined,
                        mapSouth: undefined,
                        mapEast: undefined,
                        mapWest: undefined,
                        usngbbUpperLeft: undefined,
                        usngbbLowerRight: undefined,
                    });
                }
            }
            else {
                this.set({ south: undefined, east: undefined }, { silent: true });
            }
        }
        else {
            this.set({ south: undefined, east: undefined }, { silent: true });
        }
        if (upperLeft === undefined || lowerRight == undefined) {
            return;
        }
        var lat = (upperLeft.lat + lowerRight.lat) / 2;
        var lon = (upperLeft.lon + lowerRight.lon) / 2;
        if (!this.isLatLonValid(lat, lon) || this.isInUpsSpace(lat, lon)) {
            this.set({
                usngbbUpperLeft: undefined,
                usngbbLowerRight: undefined,
            });
            return;
        }
        var result = this.usngBbFromLatLon({
            north: upperLeft.lat,
            south: lowerRight.lat,
            east: lowerRight.lon,
            west: upperLeft.lon,
        });
        this.set(result, {
            silent: this.get('locationType') === 'usng',
        });
    },
    setBboxDmsNorth: function () {
        this.setLatLonFromDms('dmsNorth', 'dmsNorthDirection', 'north');
    },
    setBboxDmsSouth: function () {
        this.setLatLonFromDms('dmsSouth', 'dmsSouthDirection', 'south');
    },
    setBboxDmsEast: function () {
        this.setLatLonFromDms('dmsEast', 'dmsEastDirection', 'east');
    },
    setBboxDmsWest: function () {
        this.setLatLonFromDms('dmsWest', 'dmsWestDirection', 'west');
    },
    setBboxDmsFromMap: function () {
        var dmsNorth = dmsUtils.ddToDmsCoordinateLat(this.get('mapNorth'), dmsUtils.getSecondsPrecision(this.get('dmsNorth')));
        var dmsSouth = dmsUtils.ddToDmsCoordinateLat(this.get('mapSouth'), dmsUtils.getSecondsPrecision(this.get('dmsSouth')));
        var dmsWest = dmsUtils.ddToDmsCoordinateLon(this.get('mapWest'), dmsUtils.getSecondsPrecision(this.get('dmsWest')));
        var dmsEast = dmsUtils.ddToDmsCoordinateLon(this.get('mapEast'), dmsUtils.getSecondsPrecision(this.get('dmsEast')));
        this.set({
            dmsNorth: dmsNorth && dmsNorth.coordinate,
            dmsNorthDirection: (dmsNorth && dmsNorth.direction) || Direction.North,
            dmsSouth: dmsSouth && dmsSouth.coordinate,
            dmsSouthDirection: (dmsSouth && dmsSouth.direction) || Direction.North,
            dmsWest: dmsWest && dmsWest.coordinate,
            dmsWestDirection: (dmsWest && dmsWest.direction) || Direction.East,
            dmsEast: dmsEast && dmsEast.coordinate,
            dmsEastDirection: (dmsEast && dmsEast.direction) || Direction.East,
        }, { silent: true });
    },
    setRadiusDmsFromMap: function () {
        var dmsLat = dmsUtils.ddToDmsCoordinateLat(this.get('lat'), dmsUtils.getSecondsPrecision(this.get('dmsLat')));
        var dmsLon = dmsUtils.ddToDmsCoordinateLon(this.get('lon'), dmsUtils.getSecondsPrecision(this.get('dmsLon')));
        this.set({
            dmsLat: dmsLat && dmsLat.coordinate,
            dmsLatDirection: (dmsLat && dmsLat.direction) || Direction.North,
            dmsLon: dmsLon && dmsLon.coordinate,
            dmsLonDirection: (dmsLon && dmsLon.direction) || Direction.East,
        }, { silent: true });
    },
    setLatLonFromDms: function (dmsCoordinateKey, dmsDirectionKey, latLonKey) {
        var dmsCoordinate = dmsUtils.parseDmsCoordinate(this.get(dmsCoordinateKey));
        if (dmsCoordinate) {
            this.set(latLonKey, dmsUtils.dmsCoordinateToDD(__assign(__assign({}, dmsCoordinate), { direction: this.get(dmsDirectionKey) })));
        }
        else {
            this.set(latLonKey, undefined);
        }
    },
    handleLocationType: function () {
        if (this.get('locationType') === 'dd') {
            this.set({
                north: this.get('mapNorth'),
                south: this.get('mapSouth'),
                east: this.get('mapEast'),
                west: this.get('mapWest'),
            });
        }
        else if (this.get('locationType') === 'dms') {
            this.setBboxDmsFromMap();
            this.setRadiusDmsFromMap();
        }
    },
    // Convert Lat-Lon to UTM/UPS coordinates. Returns undefined if lat or lon is undefined or not a number.
    // Returns undefined if the underlying call to usng fails. Otherwise, returns an object with:
    //
    //   easting    : FLOAT
    //   northing   : FLOAT
    //   zoneNumber : INTEGER (>=0 and <= 60)
    //   hemisphere : STRING (NORTHERN or SOUTHERN)
    LLtoUtmUps: function (lat, lon) {
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        if (!this.isLatLonValid(lat, lon)) {
            return undefined;
        }
        var utmUps = converter.LLtoUTMUPSObject(lat, lon);
        utmUps.hemisphere = lat >= 0 ? 'NORTHERN' : 'SOUTHERN';
        return utmUps;
    },
    // Convert UTM/UPS coordinates to Lat-Lon. Expects an argument object with:
    //
    //   easting    : FLOAT
    //   northing   : FLOAT
    //   zoneNumber : INTEGER (>=0 and <= 60)
    //   hemisphere : STRING (NORTHERN or SOUTHERN)
    //
    // Returns an object with:
    //
    //   lat : FLOAT
    //   lon : FLOAT
    //
    // Returns undefined if the latitude is out of range.
    //
    utmUpstoLL: function (utmUpsParts) {
        var hemisphere = utmUpsParts.hemisphere, zoneNumber = utmUpsParts.zoneNumber, northing = utmUpsParts.northing;
        var northernHemisphere = hemisphere.toUpperCase() === 'NORTHERN';
        utmUpsParts = __assign(__assign({}, utmUpsParts), { northPole: northernHemisphere });
        var isUps = zoneNumber === 0;
        utmUpsParts.northing =
            isUps || northernHemisphere ? northing : northing - northingOffset;
        var lat, lon;
        try {
            var result = converter.UTMUPStoLL(utmUpsParts);
            lat = result.lat;
            lon = result.lon % 360;
            if (lon < -180) {
                lon = lon + 360;
            }
            if (lon > 180) {
                lon = lon - 360;
            }
            if (!this.isLatLonValid(lat, lon)) {
                return { lat: undefined, lon: undefined };
            }
        }
        catch (err) {
            return { lat: undefined, lon: undefined };
        }
        return { lat: lat, lon: lon };
    },
    // Return true if the current location type is UTM/UPS, otherwise false.
    isLocationTypeUtmUps: function () {
        return this.get('locationType') === utmUpsLocationType;
    },
    // Set the model fields for the Upper-Left bounding box UTM/UPS. The arguments are:
    //
    //   utmUpsFormatted : output from the method 'formatUtmUps'
    //   silent       : BOOLEAN (true if events should be generated)
    setUtmUpsUpperLeft: function (utmUpsFormatted, silent) {
        this.set('utmUpsUpperLeftEasting', utmUpsFormatted.easting, {
            silent: silent,
        });
        this.set('utmUpsUpperLeftNorthing', utmUpsFormatted.northing, {
            silent: silent,
        });
        this.set('utmUpsUpperLeftZone', utmUpsFormatted.zoneNumber, {
            silent: silent,
        });
        this.set('utmUpsUpperLeftHemisphere', utmUpsFormatted.hemisphere, {
            silent: silent,
        });
    },
    // Set the model fields for the Lower-Right bounding box UTM/UPS. The arguments are:
    //
    //   utmUpsFormatted : output from the method 'formatUtmUps'
    //   silent       : BOOLEAN (true if events should be generated)
    setUtmUpsLowerRight: function (utmUpsFormatted, silent) {
        this.set('utmUpsLowerRightEasting', utmUpsFormatted.easting, {
            silent: silent,
        });
        this.set('utmUpsLowerRightNorthing', utmUpsFormatted.northing, {
            silent: silent,
        });
        this.set('utmUpsLowerRightZone', utmUpsFormatted.zoneNumber, {
            silent: silent,
        });
        this.set('utmUpsLowerRightHemisphere', utmUpsFormatted.hemisphere, {
            silent: silent,
        });
    },
    // Set the model fields for the Point Radius UTM/UPS. The arguments are:
    //
    //   utmUpsFormatted : output from the method 'formatUtmUps'
    //   silent       : BOOLEAN (true if events should be generated)
    setUtmUpsPointRadius: function (utmUpsFormatted, silent) {
        this.set('utmUpsEasting', utmUpsFormatted.easting, { silent: silent });
        this.set('utmUpsNorthing', utmUpsFormatted.northing, { silent: silent });
        this.set('utmUpsZone', utmUpsFormatted.zoneNumber, { silent: silent });
        this.set('utmUpsHemisphere', utmUpsFormatted.hemisphere, {
            silent: silent,
        });
    },
    clearUtmUpsPointRadius: function (silent) {
        this.set('utmUpsEasting', undefined, { silent: silent });
        this.set('utmUpsNorthing', undefined, { silent: silent });
        this.set('utmUpsZone', 1, { silent: silent });
        this.set('utmUpsHemisphere', 'Northern', { silent: silent });
    },
    clearUtmUpsUpperLeft: function (silent) {
        this.set({
            utmUpsUpperLeftEasting: undefined,
            utmUpsUpperLeftNorthing: undefined,
            utmUpsUpperLeftZone: 1,
            utmUpsUpperLeftHemisphere: 'Northern',
        }, { silent: silent });
    },
    clearUtmUpsLowerRight: function (silent) {
        this.set('utmUpsLowerRightEasting', undefined, { silent: silent });
        this.set('utmUpsLowerRightNorthing', undefined, { silent: silent });
        this.set('utmUpsLowerRightZone', 1, { silent: silent });
        this.set('utmUpsLowerRightHemisphere', 'Northern', { silent: silent });
    },
    // Parse the UTM/UPS fields that come from the HTML layer. The parameters eastingRaw and northingRaw
    // are string representations of floating pointnumbers. The zoneRaw parameter is a string
    // representation of an integer in the range [0,60]. The hemisphereRaw parameters is a string
    // that should be 'Northern' or 'Southern'.
    parseUtmUps: function (eastingRaw, northingRaw, zoneRaw, hemisphereRaw) {
        var easting = parseFloat(eastingRaw);
        var northing = parseFloat(northingRaw);
        var zone = parseInt(zoneRaw);
        var hemisphere = hemisphereRaw === 'Northern'
            ? 'NORTHERN'
            : hemisphereRaw === 'Southern'
                ? 'SOUTHERN'
                : undefined;
        if (!isNaN(easting) &&
            !isNaN(northing) &&
            !isNaN(zone) &&
            hemisphere !== undefined &&
            zone >= 0 &&
            zone <= 60) {
            return {
                zoneNumber: zone,
                hemisphere: hemisphere,
                easting: easting,
                northing: northing,
            };
        }
        return undefined;
    },
    // Format the internal representation of UTM/UPS coordinates into the form expected by the model.
    formatUtmUps: function (utmUps) {
        return {
            easting: utmUps.easting,
            northing: utmUps.northing,
            zoneNumber: utmUps.zoneNumber,
            hemisphere: utmUps.hemisphere === 'NORTHERN'
                ? 'Northern'
                : utmUps.hemisphere === 'SOUTHERN'
                    ? 'Southern'
                    : undefined,
        };
    },
    // Return true if all of the UTM/UPS upper-left model fields are defined. Otherwise, false.
    isUtmUpsUpperLeftDefined: function () {
        return (this.get('utmUpsUpperLeftEasting') !== undefined &&
            this.get('utmUpsUpperLeftNorthing') !== undefined &&
            this.get('utmUpsUpperLeftZone') !== undefined &&
            this.get('utmUpsUpperLeftHemisphere') !== undefined);
    },
    // Return true if all of the UTM/UPS lower-right model fields are defined. Otherwise, false.
    isUtmUpsLowerRightDefined: function () {
        return (this.get('utmUpsLowerRightEasting') !== undefined &&
            this.get('utmUpsLowerRightNorthing') !== undefined &&
            this.get('utmUpsLowerRightZone') !== undefined &&
            this.get('utmUpsLowerRightHemisphere') !== undefined);
    },
    // Return true if all of the UTM/UPS point radius model fields are defined. Otherwise, false.
    isUtmUpsPointRadiusDefined: function () {
        return (this.get('utmUpsEasting') !== undefined &&
            this.get('utmUpsNorthing') !== undefined &&
            this.get('utmUpsZone') !== undefined &&
            this.get('utmUpsHemisphere') !== undefined);
    },
    // Get the UTM/UPS Upper-Left bounding box fields in the internal format. See 'parseUtmUps'.
    parseUtmUpsUpperLeft: function () {
        return this.parseUtmUps(this.get('utmUpsUpperLeftEasting'), this.get('utmUpsUpperLeftNorthing'), this.get('utmUpsUpperLeftZone'), this.get('utmUpsUpperLeftHemisphere'));
    },
    // Get the UTM/UPS Lower-Right bounding box fields in the internal format. See 'parseUtmUps'.
    parseUtmUpsLowerRight: function () {
        return this.parseUtmUps(this.get('utmUpsLowerRightEasting'), this.get('utmUpsLowerRightNorthing'), this.get('utmUpsLowerRightZone'), this.get('utmUpsLowerRightHemisphere'));
    },
    // Get the UTM/UPS point radius fields in the internal format. See 'parseUtmUps'.
    parseUtmUpsPointRadius: function () {
        return this.parseUtmUps(this.get('utmUpsEasting'), this.get('utmUpsNorthing'), this.get('utmUpsZone'), this.get('utmUpsHemisphere'));
    },
    // override toJSON so that when we save the location information elsewhere we don't include ephemeral state, like isInteractive
    toJSON: function (options) {
        var originalJSON = Backbone.Model.prototype.toJSON.apply(this, [options]);
        delete originalJSON['isInteractive'];
        delete originalJSON['isReadonly'];
        return originalJSON;
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24tb2xkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9sb2NhdGlvbi1vbGQvbG9jYXRpb24tb2xkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osMkJBQTJCO0FBQzNCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFDL0IsT0FBTyxLQUFLLEtBQUssTUFBTSxTQUFTLENBQUE7QUFDaEMsT0FBTyxLQUFLLFFBQVEsTUFBTSxpQ0FBaUMsQ0FBQTtBQUMzRCxPQUFPLGFBQWEsTUFBTSx3QkFBd0IsQ0FBQTtBQUNsRCxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDL0MsT0FBTyxFQUNMLHNCQUFzQixFQUN0QixxQkFBcUIsRUFDckIsd0JBQXdCLEVBQ3hCLGtCQUFrQixFQUNsQixLQUFLLEdBQ04sTUFBTSwyQ0FBMkMsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sd0RBQXdELENBQUE7QUFDdkYsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUV6Qiw0RUFBNEU7QUFDNUUsSUFBTSxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDdkMsSUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUE7QUFDbkMsZ0RBQWdEO0FBQ2hELElBQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFBO0FBQzlCLElBQU0sbUJBQW1CLEdBQUcsQ0FBQyxFQUFFLENBQUE7QUFDL0IsSUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFBO0FBQy9CLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQTtBQUN2QixJQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FB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LEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUM3QixDQUFBO0lBQ0gsQ0FBQztJQUNELCtIQUErSDtJQUMvSCxNQUFNLFlBQUMsT0FBWTtRQUNqQixJQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7UUFDM0UsT0FBTyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUE7UUFDcEMsT0FBTyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDakMsT0FBTyxZQUFZLENBQUE7SUFDckIsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tdmFyICovXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0ICogYXMgdXNuZ3MgZnJvbSAndXNuZy5qcydcbmltcG9ydCAqIGFzIGRtc1V0aWxzIGZyb20gJy4uL2xvY2F0aW9uLW5ldy91dGlscy9kbXMtdXRpbHMnXG5pbXBvcnQgRGlzdGFuY2VVdGlscyBmcm9tICcuLi8uLi9qcy9EaXN0YW5jZVV0aWxzJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IHsgRHJhd2luZyB9IGZyb20gJy4uL3NpbmdsZXRvbnMvZHJhd2luZydcbmltcG9ydCB7XG4gIHZhbGlkYXRlVXNuZ0xpbmVPclBvbHksXG4gIHZhbGlkYXRlRG1zTGluZU9yUG9seSxcbiAgdmFsaWRhdGVVdG1VcHNMaW5lT3JQb2x5LFxuICBwYXJzZURtc0Nvb3JkaW5hdGUsXG4gIGlzVVBTLFxufSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvbG9jYXRpb24vdmFsaWRhdG9ycydcbmltcG9ydCB7IGxvY2F0aW9uQ29sb3JzIH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L2xvY2F0aW9uL2xvY2F0aW9uLWNvbG9yLXNlbGVjdG9yJ1xuaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJ1xuXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjU1NCkgRklYTUU6IEV4cGVjdGVkIDEgYXJndW1lbnRzLCBidXQgZ290IDAuXG5jb25zdCBjb252ZXJ0ZXIgPSBuZXcgdXNuZ3MuQ29udmVydGVyKClcbmNvbnN0IHV0bVVwc0xvY2F0aW9uVHlwZSA9ICd1dG1VcHMnXG4vLyBvZmZzZXQgdXNlZCBieSB1dG1VcHMgZm9yIHNvdXRoZXJuIGhlbWlzcGhlcmVcbmNvbnN0IHV0bVVwc0JvdW5kYXJ5Tm9ydGggPSA4NFxuY29uc3QgdXRtVXBzQm91bmRhcnlTb3V0aCA9IC04MFxuY29uc3Qgbm9ydGhpbmdPZmZzZXQgPSAxMDAwMDAwMFxuY29uc3QgdXNuZ1ByZWNpc2lvbiA9IDZcbmNvbnN0IERpcmVjdGlvbiA9IGRtc1V0aWxzLkRpcmVjdGlvblxuZXhwb3J0IGRlZmF1bHQgQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIGRlZmF1bHRzOiAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIGxhdGVyIG9uIHdlIHNob3VsZCBwcm9iYWJseSB1cGRhdGUgYXJlYXMgdXNpbmcgbG9jYXRpb25JZCB0byBqdXN0IHVzZSBpZFxuICAgICAgbG9jYXRpb25JZDogdjQoKSxcbiAgICAgIGNvbG9yOiBPYmplY3QudmFsdWVzKGxvY2F0aW9uQ29sb3JzKVswXSxcbiAgICAgIGRyYXdpbmc6IGZhbHNlLFxuICAgICAgbm9ydGg6IHVuZGVmaW5lZCxcbiAgICAgIGVhc3Q6IHVuZGVmaW5lZCxcbiAgICAgIHNvdXRoOiB1bmRlZmluZWQsXG4gICAgICB3ZXN0OiB1bmRlZmluZWQsXG4gICAgICBkbXNOb3J0aDogdW5kZWZpbmVkLFxuICAgICAgZG1zU291dGg6IHVuZGVmaW5lZCxcbiAgICAgIGRtc0Vhc3Q6IHVuZGVmaW5lZCxcbiAgICAgIGRtc1dlc3Q6IHVuZGVmaW5lZCxcbiAgICAgIGRtc05vcnRoRGlyZWN0aW9uOiBEaXJlY3Rpb24uTm9ydGgsXG4gICAgICBkbXNTb3V0aERpcmVjdGlvbjogRGlyZWN0aW9uLk5vcnRoLFxuICAgICAgZG1zRWFzdERpcmVjdGlvbjogRGlyZWN0aW9uLkVhc3QsXG4gICAgICBkbXNXZXN0RGlyZWN0aW9uOiBEaXJlY3Rpb24uRWFzdCxcbiAgICAgIGRtc1BvaW50QXJyYXk6IHVuZGVmaW5lZCxcbiAgICAgIG1hcE5vcnRoOiB1bmRlZmluZWQsXG4gICAgICBtYXBFYXN0OiB1bmRlZmluZWQsXG4gICAgICBtYXBXZXN0OiB1bmRlZmluZWQsXG4gICAgICBtYXBTb3V0aDogdW5kZWZpbmVkLFxuICAgICAgcmFkaXVzVW5pdHM6ICdtZXRlcnMnLFxuICAgICAgcmFkaXVzOiAnJyxcbiAgICAgIGxvY2F0aW9uVHlwZTogJ2RkJyxcbiAgICAgIHByZXZMb2NhdGlvblR5cGU6ICdkZCcsXG4gICAgICBsYXQ6IHVuZGVmaW5lZCxcbiAgICAgIGxvbjogdW5kZWZpbmVkLFxuICAgICAgZG1zTGF0OiB1bmRlZmluZWQsXG4gICAgICBkbXNMb246IHVuZGVmaW5lZCxcbiAgICAgIGRtc0xhdERpcmVjdGlvbjogRGlyZWN0aW9uLk5vcnRoLFxuICAgICAgZG1zTG9uRGlyZWN0aW9uOiBEaXJlY3Rpb24uRWFzdCxcbiAgICAgIGJib3g6IHVuZGVmaW5lZCxcbiAgICAgIHVzbmc6IHVuZGVmaW5lZCxcbiAgICAgIHV0bVVwczogdW5kZWZpbmVkLFxuICAgICAgdXRtVXBzUG9pbnRBcnJheTogdW5kZWZpbmVkLFxuICAgICAgbGluZTogdW5kZWZpbmVkLFxuICAgICAgbXVsdGlsaW5lOiB1bmRlZmluZWQsXG4gICAgICBsaW5lV2lkdGg6ICcnLFxuICAgICAgbGluZVVuaXRzOiAnbWV0ZXJzJyxcbiAgICAgIHBvbHlnb246IHVuZGVmaW5lZCxcbiAgICAgIHBvbHlnb25CdWZmZXJXaWR0aDogJycsXG4gICAgICBwb2x5VHlwZTogdW5kZWZpbmVkLFxuICAgICAgcG9seWdvbkJ1ZmZlclVuaXRzOiAnbWV0ZXJzJyxcbiAgICAgIGhhc0tleXdvcmQ6IGZhbHNlLFxuICAgICAga2V5d29yZFZhbHVlOiB1bmRlZmluZWQsXG4gICAgICB1dG1VcHNVcHBlckxlZnRFYXN0aW5nOiB1bmRlZmluZWQsXG4gICAgICB1dG1VcHNVcHBlckxlZnROb3J0aGluZzogdW5kZWZpbmVkLFxuICAgICAgdXRtVXBzVXBwZXJMZWZ0SGVtaXNwaGVyZTogJ05vcnRoZXJuJyxcbiAgICAgIHV0bVVwc1VwcGVyTGVmdFpvbmU6IDEsXG4gICAgICB1dG1VcHNMb3dlclJpZ2h0RWFzdGluZzogdW5kZWZpbmVkLFxuICAgICAgdXRtVXBzTG93ZXJSaWdodE5vcnRoaW5nOiB1bmRlZmluZWQsXG4gICAgICB1dG1VcHNMb3dlclJpZ2h0SGVtaXNwaGVyZTogJ05vcnRoZXJuJyxcbiAgICAgIHV0bVVwc0xvd2VyUmlnaHRab25lOiAxLFxuICAgICAgdXRtVXBzRWFzdGluZzogdW5kZWZpbmVkLFxuICAgICAgdXRtVXBzTm9ydGhpbmc6IHVuZGVmaW5lZCxcbiAgICAgIHV0bVVwc1pvbmU6IDEsXG4gICAgICB1dG1VcHNIZW1pc3BoZXJlOiAnTm9ydGhlcm4nLFxuICAgICAgdXNuZ2JiVXBwZXJMZWZ0OiB1bmRlZmluZWQsXG4gICAgICB1c25nYmJMb3dlclJpZ2h0OiB1bmRlZmluZWQsXG4gICAgICB1c25nUG9pbnRBcnJheTogdW5kZWZpbmVkLFxuICAgIH1cbiAgfSxcbiAgc2V0KGtleTogYW55LCB2YWx1ZTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qoa2V5KSkge1xuICAgICAgY29uc3Qga2V5T2JqZWN0ID0ge31cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAga2V5T2JqZWN0W2tleV0gPSB2YWx1ZVxuICAgICAga2V5ID0ga2V5T2JqZWN0XG4gICAgICB2YWx1ZSA9IG9wdGlvbnNcbiAgICB9XG4gICAgQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLnByb3RvdHlwZS5zZXQuY2FsbCh0aGlzLCBrZXksIHZhbHVlLCBvcHRpb25zKVxuICB9LFxuICBpbml0aWFsaXplKHByb3BzOiBhbnkpIHtcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6bGluZSBjaGFuZ2U6cG9seWdvbicsXG4gICAgICB0aGlzLnNldFVzbmdEbXNVdG1XaXRoTGluZU9yUG9seVxuICAgIClcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6ZG1zUG9pbnRBcnJheScsIHRoaXMuc2V0TGF0TG9uTGluZVBvbHlGcm9tRG1zKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTp1c25nUG9pbnRBcnJheScsIHRoaXMuc2V0TGF0TG9uTGluZVBvbHlGcm9tVXNuZylcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6dXRtVXBzUG9pbnRBcnJheScsXG4gICAgICB0aGlzLnNldExhdExvbkxpbmVQb2x5RnJvbVV0bVVwc1xuICAgIClcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6bm9ydGggY2hhbmdlOnNvdXRoIGNoYW5nZTplYXN0IGNoYW5nZTp3ZXN0JyxcbiAgICAgIHRoaXMuc2V0QkJveFxuICAgIClcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6ZG1zTm9ydGggY2hhbmdlOmRtc05vcnRoRGlyZWN0aW9uJyxcbiAgICAgIHRoaXMuc2V0QmJveERtc05vcnRoXG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG8oXG4gICAgICB0aGlzLFxuICAgICAgJ2NoYW5nZTpkbXNTb3V0aCBjaGFuZ2U6ZG1zU291dGhEaXJlY3Rpb24nLFxuICAgICAgdGhpcy5zZXRCYm94RG1zU291dGhcbiAgICApXG4gICAgdGhpcy5saXN0ZW5UbyhcbiAgICAgIHRoaXMsXG4gICAgICAnY2hhbmdlOmRtc0Vhc3QgY2hhbmdlOmRtc0Vhc3REaXJlY3Rpb24nLFxuICAgICAgdGhpcy5zZXRCYm94RG1zRWFzdFxuICAgIClcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6ZG1zV2VzdCBjaGFuZ2U6ZG1zV2VzdERpcmVjdGlvbicsXG4gICAgICB0aGlzLnNldEJib3hEbXNXZXN0XG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG8oXG4gICAgICB0aGlzLFxuICAgICAgJ2NoYW5nZTpkbXNMYXQgY2hhbmdlOmRtc0xhdERpcmVjdGlvbicsXG4gICAgICB0aGlzLnNldFJhZGl1c0Rtc0xhdFxuICAgIClcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6ZG1zTG9uIGNoYW5nZTpkbXNMb25EaXJlY3Rpb24nLFxuICAgICAgdGhpcy5zZXRSYWRpdXNEbXNMb25cbiAgICApXG4gICAgdGhpcy5saXN0ZW5UbyhcbiAgICAgIHRoaXMsXG4gICAgICAnY2hhbmdlOnVzbmdiYlVwcGVyTGVmdCBjaGFuZ2U6dXNuZ2JiTG93ZXJSaWdodCcsXG4gICAgICB0aGlzLnNldEJib3hVc25nXG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpsb2NhdGlvblR5cGUnLCB0aGlzLmhhbmRsZUxvY2F0aW9uVHlwZSlcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6YmJveCcsIF8uZGVib3VuY2UodGhpcy5zZXRCYm94TGF0TG9uLCA1KSlcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6bGF0IGNoYW5nZTpsb24nLCB0aGlzLnNldFJhZGl1c0xhdExvbilcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6dXNuZycsIHRoaXMuc2V0UmFkaXVzVXNuZylcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6dXRtVXBzRWFzdGluZyBjaGFuZ2U6dXRtVXBzTm9ydGhpbmcgY2hhbmdlOnV0bVVwc1pvbmUgY2hhbmdlOnV0bVVwc0hlbWlzcGhlcmUnLFxuICAgICAgdGhpcy5zZXRSYWRpdXNVdG1VcHNcbiAgICApXG4gICAgdGhpcy5saXN0ZW5UbyhcbiAgICAgIHRoaXMsXG4gICAgICAnY2hhbmdlOnV0bVVwc1VwcGVyTGVmdEVhc3RpbmcgY2hhbmdlOnV0bVVwc1VwcGVyTGVmdE5vcnRoaW5nIGNoYW5nZTp1dG1VcHNVcHBlckxlZnRab25lIGNoYW5nZTp1dG1VcHNVcHBlckxlZnRIZW1pc3BoZXJlIGNoYW5nZTp1dG1VcHNMb3dlclJpZ2h0RWFzdGluZyBjaGFuZ2U6dXRtVXBzTG93ZXJSaWdodE5vcnRoaW5nIGNoYW5nZTp1dG1VcHNMb3dlclJpZ2h0Wm9uZSBjaGFuZ2U6dXRtVXBzTG93ZXJSaWdodEhlbWlzcGhlcmUnLFxuICAgICAgdGhpcy5zZXRCYm94VXRtVXBzXG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTptb2RlJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXQodGhpcy5kZWZhdWx0cygpKVxuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignc2VhcmNoOmRyYXdlbmQnLCBbdGhpc10pXG4gICAgfSlcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdFbmRFeHRlbnQnLCB0aGlzLmRyYXdpbmdPZmYpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnQmVnaW5FeHRlbnQnLCB0aGlzLmRyYXdpbmdPbilcbiAgICB0aGlzLmluaXRpYWxpemVWYWx1ZXMocHJvcHMpXG4gIH0sXG4gIGluaXRpYWxpemVWYWx1ZXMocHJvcHM6IGFueSkge1xuICAgIGlmIChcbiAgICAgIChwcm9wcy50eXBlID09PSAnUE9JTlRSQURJVVMnIHx8IHByb3BzLnR5cGUgPT09ICdQT0lOVCcpICYmXG4gICAgICBwcm9wcy5sYXQgJiZcbiAgICAgIHByb3BzLmxvblxuICAgICkge1xuICAgICAgaWYgKCFwcm9wcy51c25nIHx8ICFwcm9wcy51dG1VcHNFYXN0aW5nKSB7XG4gICAgICAgIC8vIGluaXRpYWxpemVzIGRtcy91c25nL3V0bVVwcyB1c2luZyBsYXQvbG9uXG4gICAgICAgIHRoaXMudXBkYXRlQ29vcmRQb2ludFJhZGl1c1ZhbHVlcyhwcm9wcy5sYXQsIHByb3BzLmxvbilcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHByb3BzLm1vZGUgPT09ICdiYm94Jykge1xuICAgICAgdGhpcy5zZXRCQm94KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRVc25nRG1zVXRtV2l0aExpbmVPclBvbHkodGhpcylcbiAgICB9XG4gIH0sXG4gIHVwZGF0ZUNvb3JkUG9pbnRSYWRpdXNWYWx1ZXMobGF0OiBhbnksIGxvbjogYW55KSB7XG4gICAgaWYgKCF0aGlzLmlzTGF0TG9uVmFsaWQobGF0LCBsb24pKSByZXR1cm5cbiAgICB0aGlzLnNldFJhZGl1c0Rtc0Zyb21NYXAoKVxuICAgIGNvbnN0IHV0bVVwcyA9IHRoaXMuTEx0b1V0bVVwcyhsYXQsIGxvbilcbiAgICBpZiAodXRtVXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHV0bVVwc1BhcnRzID0gdGhpcy5mb3JtYXRVdG1VcHModXRtVXBzKVxuICAgICAgdGhpcy5zZXRVdG1VcHNQb2ludFJhZGl1cyh1dG1VcHNQYXJ0cywgdHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jbGVhclV0bVVwc1BvaW50UmFkaXVzKGZhbHNlKVxuICAgIH1cbiAgICBpZiAodGhpcy5pc0luVXBzU3BhY2UobGF0LCBsb24pKSB7XG4gICAgICB0aGlzLnNldCgndXNuZycsIHVuZGVmaW5lZClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCB1c25nc1N0ciA9IGNvbnZlcnRlci5MTHRvVVNORyhsYXQsIGxvbiwgdXNuZ1ByZWNpc2lvbilcbiAgICB0aGlzLnNldCgndXNuZycsIHVzbmdzU3RyLCB7IHNpbGVudDogdHJ1ZSB9KVxuICB9LFxuICBkcmF3aW5nT2ZmKCkge1xuICAgIGlmICh0aGlzLmdldCgnbG9jYXRpb25UeXBlJykgPT09ICdkbXMnKSB7XG4gICAgICB0aGlzLnNldEJib3hEbXNGcm9tTWFwKClcbiAgICB9XG4gICAgY29uc3QgcHJldkxvY2F0aW9uVHlwZSA9IHRoaXMuZ2V0KCdwcmV2TG9jYXRpb25UeXBlJylcbiAgICBpZiAocHJldkxvY2F0aW9uVHlwZSA9PT0gJ3V0bVVwcycpIHtcbiAgICAgIHRoaXMuc2V0KCdwcmV2TG9jYXRpb25UeXBlJywgJycpXG4gICAgICB0aGlzLnNldCgnbG9jYXRpb25UeXBlJywgJ3V0bVVwcycpXG4gICAgfVxuICAgIHRoaXMuZHJhd2luZyA9IGZhbHNlXG4gICAgRHJhd2luZy50dXJuT2ZmRHJhd2luZygpXG4gIH0sXG4gIGRyYXdpbmdPbigpIHtcbiAgICBjb25zdCBsb2NhdGlvblR5cGUgPSB0aGlzLmdldCgnbG9jYXRpb25UeXBlJylcbiAgICBpZiAobG9jYXRpb25UeXBlID09PSAndXRtVXBzJykge1xuICAgICAgdGhpcy5zZXQoJ3ByZXZMb2NhdGlvblR5cGUnLCAndXRtVXBzJylcbiAgICAgIHRoaXMuc2V0KCdsb2NhdGlvblR5cGUnLCAnZGQnKVxuICAgIH1cbiAgICB0aGlzLmRyYXdpbmcgPSB0cnVlXG4gICAgRHJhd2luZy50dXJuT25EcmF3aW5nKHRoaXMpXG4gIH0sXG4gIHJlcG9zaXRpb25MYXRMb25VdG1VcHMoaXNEZWZpbmVkOiBhbnksIHBhcnNlOiBhbnksIGFzc2lnbjogYW55LCBjbGVhcjogYW55KSB7XG4gICAgaWYgKGlzRGVmaW5lZCh0aGlzKSkge1xuICAgICAgY29uc3QgdXRtVXBzUGFydHMgPSBwYXJzZSh0aGlzKVxuICAgICAgaWYgKHV0bVVwc1BhcnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy51dG1VcHN0b0xMKHV0bVVwc1BhcnRzKVxuICAgICAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb25zdCBuZXdSZXN1bHQgPSB7fVxuICAgICAgICAgIGFzc2lnbihuZXdSZXN1bHQsIHJlc3VsdC5sYXQsIHJlc3VsdC5sb24pXG4gICAgICAgICAgdGhpcy5zZXQobmV3UmVzdWx0KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsZWFyKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlcG9zaXRpb25MYXRMb24oKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy51c25nQmJUb0xhdExvbigpXG4gICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBuZXdSZXN1bHQgPSB7fVxuICAgICAgICA7KG5ld1Jlc3VsdCBhcyBhbnkpLm1hcE5vcnRoID0gcmVzdWx0Lm5vcnRoXG4gICAgICAgIDsobmV3UmVzdWx0IGFzIGFueSkubWFwU291dGggPSByZXN1bHQuc291dGhcbiAgICAgICAgOyhuZXdSZXN1bHQgYXMgYW55KS5tYXBFYXN0ID0gcmVzdWx0LmVhc3RcbiAgICAgICAgOyhuZXdSZXN1bHQgYXMgYW55KS5tYXBXZXN0ID0gcmVzdWx0Lndlc3RcbiAgICAgICAgdGhpcy5zZXQobmV3UmVzdWx0KVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZXBvc2l0aW9uTGF0TG9uVXRtVXBzKFxuICAgICAgKF90aGlzOiBhbnkpID0+IF90aGlzLmlzVXRtVXBzVXBwZXJMZWZ0RGVmaW5lZCgpLFxuICAgICAgKF90aGlzOiBhbnkpID0+IF90aGlzLnBhcnNlVXRtVXBzVXBwZXJMZWZ0KCksXG4gICAgICAobmV3UmVzdWx0OiBhbnksIGxhdDogYW55LCBsb246IGFueSkgPT4ge1xuICAgICAgICBuZXdSZXN1bHQubWFwTm9ydGggPSBsYXRcbiAgICAgICAgbmV3UmVzdWx0Lm1hcFdlc3QgPSBsb25cbiAgICAgIH0sXG4gICAgICAoX3RoaXM6IGFueSkgPT4gX3RoaXMuY2xlYXJVdG1VcHNVcHBlckxlZnQodHJ1ZSlcbiAgICApXG4gICAgdGhpcy5yZXBvc2l0aW9uTGF0TG9uVXRtVXBzKFxuICAgICAgKF90aGlzOiBhbnkpID0+IF90aGlzLmlzVXRtVXBzTG93ZXJSaWdodERlZmluZWQoKSxcbiAgICAgIChfdGhpczogYW55KSA9PiBfdGhpcy5wYXJzZVV0bVVwc0xvd2VyUmlnaHQoKSxcbiAgICAgIChuZXdSZXN1bHQ6IGFueSwgbGF0OiBhbnksIGxvbjogYW55KSA9PiB7XG4gICAgICAgIG5ld1Jlc3VsdC5tYXBTb3V0aCA9IGxhdFxuICAgICAgICBuZXdSZXN1bHQubWFwRWFzdCA9IGxvblxuICAgICAgfSxcbiAgICAgIChfdGhpczogYW55KSA9PiBfdGhpcy5jbGVhclV0bVVwc0xvd2VyUmlnaHQodHJ1ZSlcbiAgICApXG4gIH0sXG4gIHNldExhdExvblV0bVVwcyhcbiAgICByZXN1bHQ6IGFueSxcbiAgICBpc0RlZmluZWQ6IGFueSxcbiAgICBwYXJzZTogYW55LFxuICAgIGFzc2lnbjogYW55LFxuICAgIGNsZWFyOiBhbnlcbiAgKSB7XG4gICAgaWYgKFxuICAgICAgIShcbiAgICAgICAgcmVzdWx0Lm5vcnRoICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgcmVzdWx0LnNvdXRoICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgcmVzdWx0Lndlc3QgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICByZXN1bHQuZWFzdCAhPT0gdW5kZWZpbmVkXG4gICAgICApICYmXG4gICAgICBpc0RlZmluZWQodGhpcylcbiAgICApIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzA0KSBGSVhNRTogQ2Fubm90IGZpbmQgbmFtZSAnX3RoaXMnLlxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBjb25zdCB1dG1VcHNQYXJ0cyA9IHBhcnNlKF90aGlzKVxuICAgICAgaWYgKHV0bVVwc1BhcnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdXRtVXBzUmVzdWx0ID0gdGhpcy51dG1VcHN0b0xMKHV0bVVwc1BhcnRzKVxuICAgICAgICBpZiAodXRtVXBzUmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBhc3NpZ24ocmVzdWx0LCB1dG1VcHNSZXN1bHQubGF0LCB1dG1VcHNSZXN1bHQubG9uKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsZWFyKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGNvbnZlcnRMYXRMb25MaW5lUG9seVRvVXNuZyhwb2ludHM6IGFueSkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHBvaW50cylcbiAgICAgID8gcG9pbnRzLm1hcCgocG9pbnQ6IGFueSkgPT4ge1xuICAgICAgICAgIC8vIEEgbGl0dGxlIGJpdCB1bmludHVpdGl2ZSwgYnV0IGxhdC9sb24gaXMgc3dhcHBlZCBoZXJlXG4gICAgICAgICAgcmV0dXJuIGNvbnZlcnRlci5MTHRvTUdSU1VQUyhwb2ludFsxXSwgcG9pbnRbMF0sIHVzbmdQcmVjaXNpb24pXG4gICAgICAgIH0pXG4gICAgICA6IHVuZGVmaW5lZFxuICB9LFxuICBjb252ZXJ0TGF0TG9uTGluZVBvbHlUb0Rtcyhwb2ludHM6IGFueSkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHBvaW50cylcbiAgICAgID8gcG9pbnRzLm1hcCgocG9pbnQ6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGxhdCA9IGRtc1V0aWxzLmRkVG9EbXNDb29yZGluYXRlTGF0KHBvaW50WzFdKVxuICAgICAgICAgIGNvbnN0IGxvbiA9IGRtc1V0aWxzLmRkVG9EbXNDb29yZGluYXRlTG9uKHBvaW50WzBdKVxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMikgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAndW5kZWZpbmVkJy5cbiAgICAgICAgICAgIGxhdDogbGF0LmNvb3JkaW5hdGUsXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMikgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAndW5kZWZpbmVkJy5cbiAgICAgICAgICAgIGxvbjogbG9uLmNvb3JkaW5hdGUsXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMikgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAndW5kZWZpbmVkJy5cbiAgICAgICAgICAgIGxhdERpcmVjdGlvbjogbGF0LmRpcmVjdGlvbixcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMyKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICd1bmRlZmluZWQnLlxuICAgICAgICAgICAgbG9uRGlyZWN0aW9uOiBsb24uZGlyZWN0aW9uLFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIDogdW5kZWZpbmVkXG4gIH0sXG4gIGNvbnZlcnRMYXRMb25MaW5lUG9seVRvVXRtKHBvaW50czogYW55KSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocG9pbnRzKVxuICAgICAgPyBwb2ludHMubWFwKChwb2ludDogYW55KSA9PiB7XG4gICAgICAgICAgbGV0IGxsUG9pbnQgPSB0aGlzLkxMdG9VdG1VcHMocG9pbnRbMV0sIHBvaW50WzBdKVxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5sbFBvaW50LFxuICAgICAgICAgICAgaGVtaXNwaGVyZTpcbiAgICAgICAgICAgICAgbGxQb2ludC5oZW1pc3BoZXJlLnRvVXBwZXJDYXNlKCkgPT09ICdOT1JUSEVSTidcbiAgICAgICAgICAgICAgICA/ICdOb3J0aGVybidcbiAgICAgICAgICAgICAgICA6ICdTb3V0aGVybicsXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgOiB1bmRlZmluZWRcbiAgfSxcbiAgc2V0VXNuZ0Rtc1V0bVdpdGhMaW5lT3JQb2x5KG1vZGVsOiBhbnkpIHtcbiAgICBsZXQga2V5ID0gdGhpcy5nZXQoJ21vZGUnKVxuICAgIGlmIChrZXkgPT09ICdwb2x5Jykga2V5ID0gJ3BvbHlnb24nXG4gICAgaWYgKGtleSAmJiAoa2V5ID09PSAnbGluZScgfHwga2V5ID09PSAncG9seWdvbicpKSB7XG4gICAgICBjb25zdCBwb2ludHMgPSB0aGlzLmdldChrZXkpXG4gICAgICBjb25zdCB1c25nUG9pbnRzID0gdGhpcy5jb252ZXJ0TGF0TG9uTGluZVBvbHlUb1VzbmcocG9pbnRzKVxuICAgICAgY29uc3QgZG1zUG9pbnRzID0gdGhpcy5jb252ZXJ0TGF0TG9uTGluZVBvbHlUb0Rtcyhwb2ludHMpXG4gICAgICBjb25zdCB1dG11cHNQb2ludHMgPSB0aGlzLmNvbnZlcnRMYXRMb25MaW5lUG9seVRvVXRtKHBvaW50cylcbiAgICAgIG1vZGVsLnNldChcbiAgICAgICAge1xuICAgICAgICAgIHVzbmdQb2ludEFycmF5OiB1c25nUG9pbnRzLFxuICAgICAgICAgIGRtc1BvaW50QXJyYXk6IGRtc1BvaW50cyxcbiAgICAgICAgICB1dG1VcHNQb2ludEFycmF5OiB1dG11cHNQb2ludHMsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzaWxlbnQ6IHRydWUsIC8vZG9uJ3QgdHJpZ2dlciBhbm90aGVyIG9uQ2hhbmdlIGZvciBsaW5lIG9yIHBvbHlcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH1cbiAgfSxcbiAgc2V0TGF0TG9uTGluZVBvbHlGcm9tRG1zKCkge1xuICAgIGxldCBrZXkgPSB0aGlzLmdldCgnbW9kZScpXG4gICAgaWYgKGtleSA9PT0gJ3BvbHknKSBrZXkgPSAncG9seWdvbidcbiAgICBpZiAoa2V5ICYmIChrZXkgPT09ICdsaW5lJyB8fCBrZXkgPT09ICdwb2x5Z29uJykpIHtcbiAgICAgIGxldCB2YWxpZGF0aW9uID0gdmFsaWRhdGVEbXNMaW5lT3JQb2x5KHRoaXMuZ2V0KCdkbXNQb2ludEFycmF5JyksIGtleSlcbiAgICAgIGlmICghdmFsaWRhdGlvbi5lcnJvcikge1xuICAgICAgICBjb25zdCBsbFBvaW50cyA9IHRoaXMuZ2V0KCdkbXNQb2ludEFycmF5JykubWFwKChwb2ludDogYW55KSA9PiB7XG4gICAgICAgICAgbGV0IGxhdENvb3JkaW5hdGUgPSBkbXNVdGlscy5kbXNDb29yZGluYXRlVG9ERCh7XG4gICAgICAgICAgICAuLi5wYXJzZURtc0Nvb3JkaW5hdGUocG9pbnQubGF0KSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogcG9pbnQubGF0RGlyZWN0aW9uLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgbGV0IGxvbkNvb3JkaW5hdGUgPSBkbXNVdGlscy5kbXNDb29yZGluYXRlVG9ERCh7XG4gICAgICAgICAgICAuLi5wYXJzZURtc0Nvb3JkaW5hdGUocG9pbnQubG9uKSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogcG9pbnQubG9uRGlyZWN0aW9uLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8gQSBsaXR0bGUgYml0IHVuaW50dWl0aXZlLCBidXQgbGF0L2xvbiBpcyBzd2FwcGVkIGhlcmVcbiAgICAgICAgICByZXR1cm4gW2xvbkNvb3JkaW5hdGUsIGxhdENvb3JkaW5hdGVdXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IHVzbmdQb2ludHMgPSB0aGlzLmNvbnZlcnRMYXRMb25MaW5lUG9seVRvVXNuZyhsbFBvaW50cylcbiAgICAgICAgY29uc3QgdXRtdXBzUG9pbnRzID0gdGhpcy5jb252ZXJ0TGF0TG9uTGluZVBvbHlUb1V0bShsbFBvaW50cylcbiAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgW2tleV06IGxsUG9pbnRzLFxuICAgICAgICAgICAgdXNuZ1BvaW50QXJyYXk6IHVzbmdQb2ludHMsXG4gICAgICAgICAgICB1dG1VcHNQb2ludEFycmF5OiB1dG11cHNQb2ludHMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzaWxlbnQ6IHRydWUsIC8vZG9uJ3QgdHJpZ2dlciBhbm90aGVyIG9uQ2hhbmdlIGZvciBsaW5lIG9yIHBvbHlcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHNldExhdExvbkxpbmVQb2x5RnJvbVVzbmcoKSB7XG4gICAgbGV0IGtleSA9IHRoaXMuZ2V0KCdtb2RlJylcbiAgICBpZiAoa2V5ID09PSAncG9seScpIGtleSA9ICdwb2x5Z29uJ1xuICAgIGlmIChrZXkgJiYgKGtleSA9PT0gJ2xpbmUnIHx8IGtleSA9PT0gJ3BvbHlnb24nKSkge1xuICAgICAgbGV0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVzbmdMaW5lT3JQb2x5KHRoaXMuZ2V0KCd1c25nUG9pbnRBcnJheScpLCBrZXkpXG4gICAgICBpZiAoIXZhbGlkYXRpb24uZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbGxQb2ludHMgPSB0aGlzLmdldCgndXNuZ1BvaW50QXJyYXknKS5tYXAoKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAvLyBBIGxpdHRsZSBiaXQgdW5pbnR1aXRpdmUsIGJ1dCBsYXQvbG9uIGlzIHN3YXBwZWQgaGVyZVxuICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZFBvaW50ID0gaXNVUFMocG9pbnQpXG4gICAgICAgICAgICA/IGNvbnZlcnRlci5VVE1VUFN0b0xMKHBvaW50KVxuICAgICAgICAgICAgOiBjb252ZXJ0ZXIuVVNOR3RvTEwocG9pbnQsIHVzbmdQcmVjaXNpb24pXG4gICAgICAgICAgcmV0dXJuIFtjb252ZXJ0ZWRQb2ludC5sb24sIGNvbnZlcnRlZFBvaW50LmxhdF1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgZG1zUG9pbnRzID0gdGhpcy5jb252ZXJ0TGF0TG9uTGluZVBvbHlUb0RtcyhsbFBvaW50cylcbiAgICAgICAgY29uc3QgdXRtdXBzUG9pbnRzID0gdGhpcy5jb252ZXJ0TGF0TG9uTGluZVBvbHlUb1V0bShsbFBvaW50cylcbiAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgW2tleV06IGxsUG9pbnRzLFxuICAgICAgICAgICAgZG1zUG9pbnRBcnJheTogZG1zUG9pbnRzLFxuICAgICAgICAgICAgdXRtVXBzUG9pbnRBcnJheTogdXRtdXBzUG9pbnRzLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc2lsZW50OiB0cnVlLCAvL2Rvbid0IHRyaWdnZXIgYW5vdGhlciBvbkNoYW5nZSBmb3IgbGluZSBvciBwb2x5XG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzZXRMYXRMb25MaW5lUG9seUZyb21VdG1VcHMoKSB7XG4gICAgbGV0IGtleSA9IHRoaXMuZ2V0KCdtb2RlJylcbiAgICBpZiAoa2V5ID09PSAncG9seScpIGtleSA9ICdwb2x5Z29uJ1xuICAgIGlmIChrZXkgJiYgKGtleSA9PT0gJ2xpbmUnIHx8IGtleSA9PT0gJ3BvbHlnb24nKSkge1xuICAgICAgbGV0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVV0bVVwc0xpbmVPclBvbHkoXG4gICAgICAgIHRoaXMuZ2V0KCd1dG1VcHNQb2ludEFycmF5JyksXG4gICAgICAgIGtleVxuICAgICAgKVxuICAgICAgaWYgKCF2YWxpZGF0aW9uLmVycm9yKSB7XG4gICAgICAgIGNvbnN0IGxsUG9pbnRzID0gdGhpcy5nZXQoJ3V0bVVwc1BvaW50QXJyYXknKS5tYXAoKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRQb2ludCA9IHRoaXMudXRtVXBzdG9MTChwb2ludClcbiAgICAgICAgICByZXR1cm4gW2NvbnZlcnRlZFBvaW50LmxvbiwgY29udmVydGVkUG9pbnQubGF0XVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBkbXNQb2ludHMgPSB0aGlzLmNvbnZlcnRMYXRMb25MaW5lUG9seVRvRG1zKGxsUG9pbnRzKVxuICAgICAgICBjb25zdCB1c25nUG9pbnRzID0gdGhpcy5jb252ZXJ0TGF0TG9uTGluZVBvbHlUb1VzbmcobGxQb2ludHMpXG4gICAgICAgIHRoaXMuc2V0KFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFtrZXldOiBsbFBvaW50cyxcbiAgICAgICAgICAgIGRtc1BvaW50QXJyYXk6IGRtc1BvaW50cyxcbiAgICAgICAgICAgIHVzbmdQb2ludEFycmF5OiB1c25nUG9pbnRzLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc2lsZW50OiB0cnVlLCAvL2Rvbid0IHRyaWdnZXIgYW5vdGhlciBvbkNoYW5nZSBmb3IgbGluZSBvciBwb2x5XG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzZXRMYXRMb24oKSB7XG4gICAgaWYgKHRoaXMuZ2V0KCdsb2NhdGlvblR5cGUnKSA9PT0gJ2RkJykge1xuICAgICAgbGV0IHJlc3VsdCA9IHt9XG4gICAgICA7KHJlc3VsdCBhcyBhbnkpLm5vcnRoID0gdGhpcy5nZXQoJ21hcE5vcnRoJylcbiAgICAgIDsocmVzdWx0IGFzIGFueSkuc291dGggPSB0aGlzLmdldCgnbWFwU291dGgnKVxuICAgICAgOyhyZXN1bHQgYXMgYW55KS53ZXN0ID0gdGhpcy5nZXQoJ21hcFdlc3QnKVxuICAgICAgOyhyZXN1bHQgYXMgYW55KS5lYXN0ID0gdGhpcy5nZXQoJ21hcEVhc3QnKVxuICAgICAgaWYgKFxuICAgICAgICAhKFxuICAgICAgICAgIChyZXN1bHQgYXMgYW55KS5ub3J0aCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgKHJlc3VsdCBhcyBhbnkpLnNvdXRoICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAocmVzdWx0IGFzIGFueSkud2VzdCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgKHJlc3VsdCBhcyBhbnkpLmVhc3QgIT09IHVuZGVmaW5lZFxuICAgICAgICApICYmXG4gICAgICAgIHRoaXMuZ2V0KCd1c25nYmJVcHBlckxlZnQnKSAmJlxuICAgICAgICB0aGlzLmdldCgndXNuZ2JiTG93ZXJSaWdodCcpXG4gICAgICApIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSB0aGlzLnVzbmdCYlRvTGF0TG9uKClcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnNldExhdExvblV0bVVwcyhcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICAoX3RoaXM6IGFueSkgPT4gX3RoaXMuaXNVdG1VcHNVcHBlckxlZnREZWZpbmVkKCksXG4gICAgICAgIChfdGhpczogYW55KSA9PiBfdGhpcy5wYXJzZVV0bVVwc1VwcGVyTGVmdCgpLFxuICAgICAgICAocmVzdWx0OiBhbnksIGxhdDogYW55LCBsb246IGFueSkgPT4ge1xuICAgICAgICAgIHJlc3VsdC5ub3J0aCA9IGxhdFxuICAgICAgICAgIHJlc3VsdC53ZXN0ID0gbG9uXG4gICAgICAgIH0sXG4gICAgICAgIChfdGhpczogYW55KSA9PiB7XG4gICAgICAgICAgX3RoaXMuY2xlYXJVdG1VcHNVcHBlckxlZnQodHJ1ZSlcbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgdGhpcy5zZXRMYXRMb25VdG1VcHMoXG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgKF90aGlzOiBhbnkpID0+IF90aGlzLmlzVXRtVXBzTG93ZXJSaWdodERlZmluZWQoKSxcbiAgICAgICAgKF90aGlzOiBhbnkpID0+IF90aGlzLnBhcnNlVXRtVXBzTG93ZXJSaWdodCgpLFxuICAgICAgICAocmVzdWx0OiBhbnksIGxhdDogYW55LCBsb246IGFueSkgPT4ge1xuICAgICAgICAgIHJlc3VsdC5zb3V0aCA9IGxhdFxuICAgICAgICAgIHJlc3VsdC5lYXN0ID0gbG9uXG4gICAgICAgIH0sXG4gICAgICAgIChfdGhpczogYW55KSA9PiB7XG4gICAgICAgICAgX3RoaXMuY2xlYXJVdG1VcHNMb3dlclJpZ2h0KHRydWUpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIDsocmVzdWx0IGFzIGFueSkubm9ydGggPSBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChcbiAgICAgICAgKHJlc3VsdCBhcyBhbnkpLm5vcnRoXG4gICAgICApXG4gICAgICA7KHJlc3VsdCBhcyBhbnkpLmVhc3QgPSBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChcbiAgICAgICAgKHJlc3VsdCBhcyBhbnkpLmVhc3RcbiAgICAgIClcbiAgICAgIDsocmVzdWx0IGFzIGFueSkuc291dGggPSBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChcbiAgICAgICAgKHJlc3VsdCBhcyBhbnkpLnNvdXRoXG4gICAgICApXG4gICAgICA7KHJlc3VsdCBhcyBhbnkpLndlc3QgPSBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChcbiAgICAgICAgKHJlc3VsdCBhcyBhbnkpLndlc3RcbiAgICAgIClcbiAgICAgIHRoaXMuc2V0KHJlc3VsdClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0KCdsb2NhdGlvblR5cGUnKSA9PT0gJ2RtcycpIHtcbiAgICAgIHRoaXMuc2V0QmJveERtc0Zyb21NYXAoKVxuICAgIH1cbiAgfSxcbiAgc2V0RmlsdGVyQkJveChtb2RlbDogYW55KSB7XG4gICAgY29uc3Qgbm9ydGggPSBwYXJzZUZsb2F0KG1vZGVsLmdldCgnbm9ydGgnKSlcbiAgICBjb25zdCBzb3V0aCA9IHBhcnNlRmxvYXQobW9kZWwuZ2V0KCdzb3V0aCcpKVxuICAgIGNvbnN0IHdlc3QgPSBwYXJzZUZsb2F0KG1vZGVsLmdldCgnd2VzdCcpKVxuICAgIGNvbnN0IGVhc3QgPSBwYXJzZUZsb2F0KG1vZGVsLmdldCgnZWFzdCcpKVxuICAgIG1vZGVsLnNldCh7XG4gICAgICBtYXBOb3J0aDogTnVtYmVyLmlzTmFOKG5vcnRoKSA/IHVuZGVmaW5lZCA6IG5vcnRoLFxuICAgICAgbWFwU291dGg6IE51bWJlci5pc05hTihzb3V0aCkgPyB1bmRlZmluZWQgOiBub3J0aCxcbiAgICAgIG1hcEVhc3Q6IE51bWJlci5pc05hTihlYXN0KSA/IHVuZGVmaW5lZCA6IGVhc3QsXG4gICAgICBtYXBXZXN0OiBOdW1iZXIuaXNOYU4od2VzdCkgPyB1bmRlZmluZWQgOiB3ZXN0LFxuICAgIH0pXG4gIH0sXG4gIHNldEJib3hMYXRMb24oKSB7XG4gICAgY29uc3Qgbm9ydGggPSBwYXJzZUZsb2F0KHRoaXMuZ2V0KCdub3J0aCcpKSxcbiAgICAgIHNvdXRoID0gcGFyc2VGbG9hdCh0aGlzLmdldCgnc291dGgnKSksXG4gICAgICB3ZXN0ID0gcGFyc2VGbG9hdCh0aGlzLmdldCgnd2VzdCcpKSxcbiAgICAgIGVhc3QgPSBwYXJzZUZsb2F0KHRoaXMuZ2V0KCdlYXN0JykpXG4gICAgaWYgKCF0aGlzLmlzTGF0TG9uVmFsaWQobm9ydGgsIHdlc3QpIHx8ICF0aGlzLmlzTGF0TG9uVmFsaWQoc291dGgsIGVhc3QpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5zZXRCYm94RG1zRnJvbU1hcCgpXG4gICAgbGV0IHV0bVVwcyA9IHRoaXMuTEx0b1V0bVVwcyhub3J0aCwgd2VzdClcbiAgICBpZiAodXRtVXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciB1dG1VcHNQYXJ0cyA9IHRoaXMuZm9ybWF0VXRtVXBzKHV0bVVwcylcbiAgICAgIHRoaXMuc2V0VXRtVXBzVXBwZXJMZWZ0KHV0bVVwc1BhcnRzLCAhdGhpcy5pc0xvY2F0aW9uVHlwZVV0bVVwcygpKVxuICAgIH1cbiAgICB1dG1VcHMgPSB0aGlzLkxMdG9VdG1VcHMoc291dGgsIGVhc3QpXG4gICAgaWYgKHV0bVVwcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVkZWNsYXJlXG4gICAgICB2YXIgdXRtVXBzUGFydHMgPSB0aGlzLmZvcm1hdFV0bVVwcyh1dG1VcHMpXG4gICAgICB0aGlzLnNldFV0bVVwc0xvd2VyUmlnaHQodXRtVXBzUGFydHMsICF0aGlzLmlzTG9jYXRpb25UeXBlVXRtVXBzKCkpXG4gICAgfVxuICAgIGlmICh0aGlzLmlzTG9jYXRpb25UeXBlVXRtVXBzKCkgJiYgdGhpcy5nZXQoJ2RyYXdpbmcnKSkge1xuICAgICAgdGhpcy5yZXBvc2l0aW9uTGF0TG9uKClcbiAgICB9XG4gICAgY29uc3QgbGF0ID0gKG5vcnRoICsgc291dGgpIC8gMlxuICAgIGNvbnN0IGxvbiA9IChlYXN0ICsgd2VzdCkgLyAyXG4gICAgaWYgKHRoaXMuaXNJblVwc1NwYWNlKGxhdCwgbG9uKSkge1xuICAgICAgdGhpcy5zZXQoe1xuICAgICAgICB1c25nYmJVcHBlckxlZnQ6IHVuZGVmaW5lZCxcbiAgICAgICAgdXNuZ2JiTG93ZXJSaWdodDogdW5kZWZpbmVkLFxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnVzbmdCYkZyb21MYXRMb24oeyBub3J0aCwgd2VzdCwgc291dGgsIGVhc3QgfSlcbiAgICB0aGlzLnNldChyZXN1bHQsIHtcbiAgICAgIHNpbGVudDogdGhpcy5nZXQoJ2xvY2F0aW9uVHlwZScpICE9PSAndXNuZycsXG4gICAgfSlcbiAgICBpZiAodGhpcy5nZXQoJ2xvY2F0aW9uVHlwZScpID09PSAndXNuZycgJiYgdGhpcy5nZXQoJ2RyYXdpbmcnKSkge1xuICAgICAgdGhpcy5yZXBvc2l0aW9uTGF0TG9uKClcbiAgICB9XG4gIH0sXG4gIHNldFJhZGl1c0xhdExvbigpIHtcbiAgICBjb25zdCBsYXQgPSB0aGlzLmdldCgnbGF0JyksXG4gICAgICBsb24gPSB0aGlzLmdldCgnbG9uJylcbiAgICB0aGlzLnVwZGF0ZUNvb3JkUG9pbnRSYWRpdXNWYWx1ZXMobGF0LCBsb24pXG4gIH0sXG4gIHNldFJhZGl1c0Rtc0xhdCgpIHtcbiAgICB0aGlzLnNldExhdExvbkZyb21EbXMoJ2Rtc0xhdCcsICdkbXNMYXREaXJlY3Rpb24nLCAnbGF0JylcbiAgfSxcbiAgc2V0UmFkaXVzRG1zTG9uKCkge1xuICAgIHRoaXMuc2V0TGF0TG9uRnJvbURtcygnZG1zTG9uJywgJ2Rtc0xvbkRpcmVjdGlvbicsICdsb24nKVxuICB9LFxuICB1c25nQmJGcm9tTGF0TG9uKHsgbm9ydGgsIHdlc3QsIHNvdXRoLCBlYXN0IH06IGFueSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB1c25nYmJVcHBlckxlZnQgPSBjb252ZXJ0ZXIuTEx0b1VTTkcobm9ydGgsIHdlc3QsIHVzbmdQcmVjaXNpb24pXG4gICAgICBjb25zdCB1c25nYmJMb3dlclJpZ2h0ID0gY29udmVydGVyLkxMdG9VU05HKHNvdXRoLCBlYXN0LCB1c25nUHJlY2lzaW9uKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdXNuZ2JiVXBwZXJMZWZ0LFxuICAgICAgICB1c25nYmJMb3dlclJpZ2h0LFxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdXNuZ2JiVXBwZXJMZWZ0OiB1bmRlZmluZWQsXG4gICAgICB1c25nYmJMb3dlclJpZ2h0OiB1bmRlZmluZWQsXG4gICAgfVxuICB9LFxuICB1c25nQmJUb0xhdExvbigpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLmdldCgndXNuZ2JiVXBwZXJMZWZ0JykgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgdGhpcy5nZXQoJ3VzbmdiYkxvd2VyUmlnaHQnKSAhPT0gdW5kZWZpbmVkXG4gICAgKSB7XG4gICAgICBjb25zdCB7IG5vcnRoLCB3ZXN0IH0gPSBjb252ZXJ0ZXIuVVNOR3RvTEwodGhpcy5nZXQoJ3VzbmdiYlVwcGVyTGVmdCcpKVxuICAgICAgY29uc3QgeyBzb3V0aCwgZWFzdCB9ID0gY29udmVydGVyLlVTTkd0b0xMKHRoaXMuZ2V0KCd1c25nYmJMb3dlclJpZ2h0JykpXG4gICAgICByZXR1cm4geyBub3J0aCwgc291dGgsIGVhc3QsIHdlc3QgfVxuICAgIH1cbiAgICByZXR1cm4ge31cbiAgfSxcbiAgc2V0QmJveFVzbmcoKSB7XG4gICAgaWYgKHRoaXMuZ2V0KCdsb2NhdGlvblR5cGUnKSAhPT0gJ3VzbmcnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgeyBub3J0aCwgd2VzdCwgc291dGgsIGVhc3QgfSA9IHRoaXMudXNuZ0JiVG9MYXRMb24oKVxuICAgIHRoaXMuc2V0KHtcbiAgICAgIG1hcE5vcnRoOiBub3J0aCxcbiAgICAgIG1hcFNvdXRoOiBzb3V0aCxcbiAgICAgIG1hcEVhc3Q6IGVhc3QsXG4gICAgICBtYXBXZXN0OiB3ZXN0LFxuICAgIH0pXG4gICAgdGhpcy5zZXQoXG4gICAgICB7XG4gICAgICAgIG5vcnRoLFxuICAgICAgICB3ZXN0LFxuICAgICAgICBzb3V0aCxcbiAgICAgICAgZWFzdCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgIH1cbiAgICApXG4gICAgbGV0IHV0bVVwcyA9IHRoaXMuTEx0b1V0bVVwcyhub3J0aCwgd2VzdClcbiAgICBpZiAodXRtVXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHV0bVVwc0Zvcm1hdHRlZCA9IHRoaXMuZm9ybWF0VXRtVXBzKHV0bVVwcylcbiAgICAgIHRoaXMuc2V0VXRtVXBzVXBwZXJMZWZ0KHV0bVVwc0Zvcm1hdHRlZCwgdHJ1ZSlcbiAgICB9XG4gICAgdXRtVXBzID0gdGhpcy5MTHRvVXRtVXBzKHNvdXRoLCBlYXN0KVxuICAgIGlmICh1dG1VcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgdXRtVXBzRm9ybWF0dGVkID0gdGhpcy5mb3JtYXRVdG1VcHModXRtVXBzKVxuICAgICAgdGhpcy5zZXRVdG1VcHNMb3dlclJpZ2h0KHV0bVVwc0Zvcm1hdHRlZCwgdHJ1ZSlcbiAgICB9XG4gIH0sXG4gIHNldEJCb3goKSB7XG4gICAgLy93ZSBuZWVkIHRoZXNlIHRvIGFsd2F5cyBiZSBpbmZlcnJlZFxuICAgIC8vYXMgbnVtZXJpYyB2YWx1ZXMgYW5kIG5ldmVyIGFzIHN0cmluZ3NcbiAgICBjb25zdCBub3J0aCA9IHBhcnNlRmxvYXQodGhpcy5nZXQoJ25vcnRoJykpXG4gICAgY29uc3Qgc291dGggPSBwYXJzZUZsb2F0KHRoaXMuZ2V0KCdzb3V0aCcpKVxuICAgIGNvbnN0IHdlc3QgPSBwYXJzZUZsb2F0KHRoaXMuZ2V0KCd3ZXN0JykpXG4gICAgY29uc3QgZWFzdCA9IHBhcnNlRmxvYXQodGhpcy5nZXQoJ2Vhc3QnKSlcbiAgICBpZiAoXG4gICAgICAhTnVtYmVyLmlzTmFOKG5vcnRoKSAmJlxuICAgICAgIU51bWJlci5pc05hTihzb3V0aCkgJiZcbiAgICAgICFOdW1iZXIuaXNOYU4oZWFzdCkgJiZcbiAgICAgICFOdW1iZXIuaXNOYU4od2VzdClcbiAgICApIHtcbiAgICAgIHRoaXMuc2V0KCdiYm94JywgW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF0uam9pbignLCcpKVxuICAgIH1cbiAgICB0aGlzLnNldCh7XG4gICAgICBtYXBOb3J0aDogTnVtYmVyLmlzTmFOKG5vcnRoKSA/IHVuZGVmaW5lZCA6IG5vcnRoLFxuICAgICAgbWFwU291dGg6IE51bWJlci5pc05hTihzb3V0aCkgPyB1bmRlZmluZWQgOiBzb3V0aCxcbiAgICAgIG1hcEVhc3Q6IE51bWJlci5pc05hTihlYXN0KSA/IHVuZGVmaW5lZCA6IGVhc3QsXG4gICAgICBtYXBXZXN0OiBOdW1iZXIuaXNOYU4od2VzdCkgPyB1bmRlZmluZWQgOiB3ZXN0LFxuICAgIH0pXG4gIH0sXG4gIHNldFJhZGl1c1VzbmcoKSB7XG4gICAgY29uc3QgdXNuZyA9IHRoaXMuZ2V0KCd1c25nJylcbiAgICBpZiAodXNuZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSBjb252ZXJ0ZXIuVVNOR3RvTEwodXNuZywgdHJ1ZSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB9XG4gICAgaWYgKCFpc05hTihyZXN1bHQubGF0KSAmJiAhaXNOYU4ocmVzdWx0LmxvbikpIHtcbiAgICAgIHRoaXMuc2V0KHJlc3VsdClcbiAgICAgIGNvbnN0IHV0bVVwcyA9IHRoaXMuTEx0b1V0bVVwcyhyZXN1bHQubGF0LCByZXN1bHQubG9uKVxuICAgICAgaWYgKHV0bVVwcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHV0bVVwc1BhcnRzID0gdGhpcy5mb3JtYXRVdG1VcHModXRtVXBzKVxuICAgICAgICB0aGlzLnNldFV0bVVwc1BvaW50UmFkaXVzKHV0bVVwc1BhcnRzLCB0cnVlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyVXRtVXBzUG9pbnRSYWRpdXModHJ1ZSlcbiAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgbGF0OiB1bmRlZmluZWQsXG4gICAgICAgIGxvbjogdW5kZWZpbmVkLFxuICAgICAgfSlcbiAgICB9XG4gIH0sXG4gIGlzTGF0TG9uVmFsaWQobGF0OiBhbnksIGxvbjogYW55KSB7XG4gICAgbGF0ID0gcGFyc2VGbG9hdChsYXQpXG4gICAgbG9uID0gcGFyc2VGbG9hdChsb24pXG4gICAgcmV0dXJuIGxhdCA+IC05MCAmJiBsYXQgPCA5MCAmJiBsb24gPiAtMTgwICYmIGxvbiA8IDE4MFxuICB9LFxuICBpc0luVXBzU3BhY2UobGF0OiBhbnksIGxvbjogYW55KSB7XG4gICAgbGF0ID0gcGFyc2VGbG9hdChsYXQpXG4gICAgbG9uID0gcGFyc2VGbG9hdChsb24pXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuaXNMYXRMb25WYWxpZChsYXQsIGxvbikgJiZcbiAgICAgIChsYXQgPCB1dG1VcHNCb3VuZGFyeVNvdXRoIHx8IGxhdCA+IHV0bVVwc0JvdW5kYXJ5Tm9ydGgpXG4gICAgKVxuICB9LFxuICAvLyBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiB0aGUgVVRNL1VQUyBwb2ludCByYWRpdXMgY29vcmRpbmF0ZXMgYXJlIGNoYW5nZWQgYnkgdGhlIHVzZXIuXG4gIHNldFJhZGl1c1V0bVVwcygpIHtcbiAgICBpZiAoIXRoaXMuaXNMb2NhdGlvblR5cGVVdG1VcHMoKSAmJiAhdGhpcy5pc1V0bVVwc1BvaW50UmFkaXVzRGVmaW5lZCgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgdXRtVXBzUGFydHMgPSB0aGlzLnBhcnNlVXRtVXBzUG9pbnRSYWRpdXMoKVxuICAgIGlmICh1dG1VcHNQYXJ0cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgdXRtVXBzUmVzdWx0ID0gdGhpcy51dG1VcHN0b0xMKHV0bVVwc1BhcnRzKVxuICAgIGlmICh1dG1VcHNSZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHV0bVVwc1BhcnRzLnpvbmVOdW1iZXIgIT09IDApIHtcbiAgICAgICAgdGhpcy5jbGVhclV0bVVwc1BvaW50UmFkaXVzKHRydWUpXG4gICAgICB9XG4gICAgICB0aGlzLnNldCh7XG4gICAgICAgIGxhdDogdW5kZWZpbmVkLFxuICAgICAgICBsb246IHVuZGVmaW5lZCxcbiAgICAgICAgdXNuZzogdW5kZWZpbmVkLFxuICAgICAgICByYWRpdXM6ICcnLFxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnNldCh1dG1VcHNSZXN1bHQpXG4gICAgY29uc3QgeyBsYXQsIGxvbiB9ID0gdXRtVXBzUmVzdWx0XG4gICAgaWYgKCF0aGlzLmlzTGF0TG9uVmFsaWQobGF0LCBsb24pIHx8IHRoaXMuaXNJblVwc1NwYWNlKGxhdCwgbG9uKSkge1xuICAgICAgdGhpcy5zZXQoeyB1c25nOiB1bmRlZmluZWQgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCB1c25nc1N0ciA9IGNvbnZlcnRlci5MTHRvVVNORyhsYXQsIGxvbiwgdXNuZ1ByZWNpc2lvbilcbiAgICB0aGlzLnNldCgndXNuZycsIHVzbmdzU3RyLCB7IHNpbGVudDogdHJ1ZSB9KVxuICB9LFxuICAvLyBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiB0aGUgVVRNL1VQUyBib3VuZGluZyBib3ggY29vcmRpbmF0ZXMgYXJlIGNoYW5nZWQgYnkgdGhlIHVzZXIuXG4gIHNldEJib3hVdG1VcHMoKSB7XG4gICAgaWYgKCF0aGlzLmlzTG9jYXRpb25UeXBlVXRtVXBzKCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgdXBwZXJMZWZ0ID0gdW5kZWZpbmVkXG4gICAgbGV0IGxvd2VyUmlnaHQgPSB1bmRlZmluZWRcbiAgICBpZiAodGhpcy5pc1V0bVVwc1VwcGVyTGVmdERlZmluZWQoKSkge1xuICAgICAgY29uc3QgdXBwZXJMZWZ0UGFydHMgPSB0aGlzLnBhcnNlVXRtVXBzVXBwZXJMZWZ0KClcbiAgICAgIGlmICh1cHBlckxlZnRQYXJ0cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwcGVyTGVmdCA9IHRoaXMudXRtVXBzdG9MTCh1cHBlckxlZnRQYXJ0cylcbiAgICAgICAgaWYgKHVwcGVyTGVmdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5zZXQoeyBtYXBOb3J0aDogdXBwZXJMZWZ0LmxhdCwgbWFwV2VzdDogdXBwZXJMZWZ0LmxvbiB9KVxuICAgICAgICAgIHRoaXMuc2V0KFxuICAgICAgICAgICAgeyBub3J0aDogdXBwZXJMZWZ0LmxhdCwgd2VzdDogdXBwZXJMZWZ0LmxvbiB9LFxuICAgICAgICAgICAgeyBzaWxlbnQ6IHRydWUgfVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldCh7XG4gICAgICAgICAgICBtYXBOb3J0aDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbWFwU291dGg6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG1hcEVhc3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG1hcFdlc3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVzbmdiYlVwcGVyTGVmdDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdXNuZ2JiTG93ZXJSaWdodDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0KHsgbm9ydGg6IHVuZGVmaW5lZCwgd2VzdDogdW5kZWZpbmVkIH0sIHsgc2lsZW50OiB0cnVlIH0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0KHsgbm9ydGg6IHVuZGVmaW5lZCwgd2VzdDogdW5kZWZpbmVkIH0sIHsgc2lsZW50OiB0cnVlIH0pXG4gICAgfVxuICAgIGlmICh0aGlzLmlzVXRtVXBzTG93ZXJSaWdodERlZmluZWQoKSkge1xuICAgICAgY29uc3QgbG93ZXJSaWdodFBhcnRzID0gdGhpcy5wYXJzZVV0bVVwc0xvd2VyUmlnaHQoKVxuICAgICAgaWYgKGxvd2VyUmlnaHRQYXJ0cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxvd2VyUmlnaHQgPSB0aGlzLnV0bVVwc3RvTEwobG93ZXJSaWdodFBhcnRzKVxuICAgICAgICBpZiAobG93ZXJSaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5zZXQoeyBtYXBTb3V0aDogbG93ZXJSaWdodC5sYXQsIG1hcEVhc3Q6IGxvd2VyUmlnaHQubG9uIH0pXG4gICAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAgICB7IHNvdXRoOiBsb3dlclJpZ2h0LmxhdCwgZWFzdDogbG93ZXJSaWdodC5sb24gfSxcbiAgICAgICAgICAgIHsgc2lsZW50OiB0cnVlIH1cbiAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXQoe1xuICAgICAgICAgICAgbWFwTm9ydGg6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG1hcFNvdXRoOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBtYXBFYXN0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBtYXBXZXN0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICB1c25nYmJVcHBlckxlZnQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVzbmdiYkxvd2VyUmlnaHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldCh7IHNvdXRoOiB1bmRlZmluZWQsIGVhc3Q6IHVuZGVmaW5lZCB9LCB7IHNpbGVudDogdHJ1ZSB9KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldCh7IHNvdXRoOiB1bmRlZmluZWQsIGVhc3Q6IHVuZGVmaW5lZCB9LCB7IHNpbGVudDogdHJ1ZSB9KVxuICAgIH1cbiAgICBpZiAodXBwZXJMZWZ0ID09PSB1bmRlZmluZWQgfHwgbG93ZXJSaWdodCA9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBsYXQgPSAodXBwZXJMZWZ0LmxhdCArIGxvd2VyUmlnaHQubGF0KSAvIDJcbiAgICBjb25zdCBsb24gPSAodXBwZXJMZWZ0LmxvbiArIGxvd2VyUmlnaHQubG9uKSAvIDJcbiAgICBpZiAoIXRoaXMuaXNMYXRMb25WYWxpZChsYXQsIGxvbikgfHwgdGhpcy5pc0luVXBzU3BhY2UobGF0LCBsb24pKSB7XG4gICAgICB0aGlzLnNldCh7XG4gICAgICAgIHVzbmdiYlVwcGVyTGVmdDogdW5kZWZpbmVkLFxuICAgICAgICB1c25nYmJMb3dlclJpZ2h0OiB1bmRlZmluZWQsXG4gICAgICB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMudXNuZ0JiRnJvbUxhdExvbih7XG4gICAgICBub3J0aDogdXBwZXJMZWZ0LmxhdCxcbiAgICAgIHNvdXRoOiBsb3dlclJpZ2h0LmxhdCxcbiAgICAgIGVhc3Q6IGxvd2VyUmlnaHQubG9uLFxuICAgICAgd2VzdDogdXBwZXJMZWZ0LmxvbixcbiAgICB9KVxuICAgIHRoaXMuc2V0KHJlc3VsdCwge1xuICAgICAgc2lsZW50OiB0aGlzLmdldCgnbG9jYXRpb25UeXBlJykgPT09ICd1c25nJyxcbiAgICB9KVxuICB9LFxuICBzZXRCYm94RG1zTm9ydGgoKSB7XG4gICAgdGhpcy5zZXRMYXRMb25Gcm9tRG1zKCdkbXNOb3J0aCcsICdkbXNOb3J0aERpcmVjdGlvbicsICdub3J0aCcpXG4gIH0sXG4gIHNldEJib3hEbXNTb3V0aCgpIHtcbiAgICB0aGlzLnNldExhdExvbkZyb21EbXMoJ2Rtc1NvdXRoJywgJ2Rtc1NvdXRoRGlyZWN0aW9uJywgJ3NvdXRoJylcbiAgfSxcbiAgc2V0QmJveERtc0Vhc3QoKSB7XG4gICAgdGhpcy5zZXRMYXRMb25Gcm9tRG1zKCdkbXNFYXN0JywgJ2Rtc0Vhc3REaXJlY3Rpb24nLCAnZWFzdCcpXG4gIH0sXG4gIHNldEJib3hEbXNXZXN0KCkge1xuICAgIHRoaXMuc2V0TGF0TG9uRnJvbURtcygnZG1zV2VzdCcsICdkbXNXZXN0RGlyZWN0aW9uJywgJ3dlc3QnKVxuICB9LFxuICBzZXRCYm94RG1zRnJvbU1hcCgpIHtcbiAgICBjb25zdCBkbXNOb3J0aCA9IGRtc1V0aWxzLmRkVG9EbXNDb29yZGluYXRlTGF0KFxuICAgICAgdGhpcy5nZXQoJ21hcE5vcnRoJyksXG4gICAgICBkbXNVdGlscy5nZXRTZWNvbmRzUHJlY2lzaW9uKHRoaXMuZ2V0KCdkbXNOb3J0aCcpKVxuICAgIClcbiAgICBjb25zdCBkbXNTb3V0aCA9IGRtc1V0aWxzLmRkVG9EbXNDb29yZGluYXRlTGF0KFxuICAgICAgdGhpcy5nZXQoJ21hcFNvdXRoJyksXG4gICAgICBkbXNVdGlscy5nZXRTZWNvbmRzUHJlY2lzaW9uKHRoaXMuZ2V0KCdkbXNTb3V0aCcpKVxuICAgIClcbiAgICBjb25zdCBkbXNXZXN0ID0gZG1zVXRpbHMuZGRUb0Rtc0Nvb3JkaW5hdGVMb24oXG4gICAgICB0aGlzLmdldCgnbWFwV2VzdCcpLFxuICAgICAgZG1zVXRpbHMuZ2V0U2Vjb25kc1ByZWNpc2lvbih0aGlzLmdldCgnZG1zV2VzdCcpKVxuICAgIClcbiAgICBjb25zdCBkbXNFYXN0ID0gZG1zVXRpbHMuZGRUb0Rtc0Nvb3JkaW5hdGVMb24oXG4gICAgICB0aGlzLmdldCgnbWFwRWFzdCcpLFxuICAgICAgZG1zVXRpbHMuZ2V0U2Vjb25kc1ByZWNpc2lvbih0aGlzLmdldCgnZG1zRWFzdCcpKVxuICAgIClcbiAgICB0aGlzLnNldChcbiAgICAgIHtcbiAgICAgICAgZG1zTm9ydGg6IGRtc05vcnRoICYmIGRtc05vcnRoLmNvb3JkaW5hdGUsXG4gICAgICAgIGRtc05vcnRoRGlyZWN0aW9uOiAoZG1zTm9ydGggJiYgZG1zTm9ydGguZGlyZWN0aW9uKSB8fCBEaXJlY3Rpb24uTm9ydGgsXG4gICAgICAgIGRtc1NvdXRoOiBkbXNTb3V0aCAmJiBkbXNTb3V0aC5jb29yZGluYXRlLFxuICAgICAgICBkbXNTb3V0aERpcmVjdGlvbjogKGRtc1NvdXRoICYmIGRtc1NvdXRoLmRpcmVjdGlvbikgfHwgRGlyZWN0aW9uLk5vcnRoLFxuICAgICAgICBkbXNXZXN0OiBkbXNXZXN0ICYmIGRtc1dlc3QuY29vcmRpbmF0ZSxcbiAgICAgICAgZG1zV2VzdERpcmVjdGlvbjogKGRtc1dlc3QgJiYgZG1zV2VzdC5kaXJlY3Rpb24pIHx8IERpcmVjdGlvbi5FYXN0LFxuICAgICAgICBkbXNFYXN0OiBkbXNFYXN0ICYmIGRtc0Vhc3QuY29vcmRpbmF0ZSxcbiAgICAgICAgZG1zRWFzdERpcmVjdGlvbjogKGRtc0Vhc3QgJiYgZG1zRWFzdC5kaXJlY3Rpb24pIHx8IERpcmVjdGlvbi5FYXN0LFxuICAgICAgfSxcbiAgICAgIHsgc2lsZW50OiB0cnVlIH1cbiAgICApXG4gIH0sXG4gIHNldFJhZGl1c0Rtc0Zyb21NYXAoKSB7XG4gICAgY29uc3QgZG1zTGF0ID0gZG1zVXRpbHMuZGRUb0Rtc0Nvb3JkaW5hdGVMYXQoXG4gICAgICB0aGlzLmdldCgnbGF0JyksXG4gICAgICBkbXNVdGlscy5nZXRTZWNvbmRzUHJlY2lzaW9uKHRoaXMuZ2V0KCdkbXNMYXQnKSlcbiAgICApXG4gICAgY29uc3QgZG1zTG9uID0gZG1zVXRpbHMuZGRUb0Rtc0Nvb3JkaW5hdGVMb24oXG4gICAgICB0aGlzLmdldCgnbG9uJyksXG4gICAgICBkbXNVdGlscy5nZXRTZWNvbmRzUHJlY2lzaW9uKHRoaXMuZ2V0KCdkbXNMb24nKSlcbiAgICApXG4gICAgdGhpcy5zZXQoXG4gICAgICB7XG4gICAgICAgIGRtc0xhdDogZG1zTGF0ICYmIGRtc0xhdC5jb29yZGluYXRlLFxuICAgICAgICBkbXNMYXREaXJlY3Rpb246IChkbXNMYXQgJiYgZG1zTGF0LmRpcmVjdGlvbikgfHwgRGlyZWN0aW9uLk5vcnRoLFxuICAgICAgICBkbXNMb246IGRtc0xvbiAmJiBkbXNMb24uY29vcmRpbmF0ZSxcbiAgICAgICAgZG1zTG9uRGlyZWN0aW9uOiAoZG1zTG9uICYmIGRtc0xvbi5kaXJlY3Rpb24pIHx8IERpcmVjdGlvbi5FYXN0LFxuICAgICAgfSxcbiAgICAgIHsgc2lsZW50OiB0cnVlIH1cbiAgICApXG4gIH0sXG4gIHNldExhdExvbkZyb21EbXMoXG4gICAgZG1zQ29vcmRpbmF0ZUtleTogYW55LFxuICAgIGRtc0RpcmVjdGlvbktleTogYW55LFxuICAgIGxhdExvbktleTogYW55XG4gICkge1xuICAgIGNvbnN0IGRtc0Nvb3JkaW5hdGUgPSBkbXNVdGlscy5wYXJzZURtc0Nvb3JkaW5hdGUoXG4gICAgICB0aGlzLmdldChkbXNDb29yZGluYXRlS2V5KVxuICAgIClcbiAgICBpZiAoZG1zQ29vcmRpbmF0ZSkge1xuICAgICAgdGhpcy5zZXQoXG4gICAgICAgIGxhdExvbktleSxcbiAgICAgICAgZG1zVXRpbHMuZG1zQ29vcmRpbmF0ZVRvREQoe1xuICAgICAgICAgIC4uLmRtc0Nvb3JkaW5hdGUsXG4gICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmdldChkbXNEaXJlY3Rpb25LZXkpLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldChsYXRMb25LZXksIHVuZGVmaW5lZClcbiAgICB9XG4gIH0sXG4gIGhhbmRsZUxvY2F0aW9uVHlwZSgpIHtcbiAgICBpZiAodGhpcy5nZXQoJ2xvY2F0aW9uVHlwZScpID09PSAnZGQnKSB7XG4gICAgICB0aGlzLnNldCh7XG4gICAgICAgIG5vcnRoOiB0aGlzLmdldCgnbWFwTm9ydGgnKSxcbiAgICAgICAgc291dGg6IHRoaXMuZ2V0KCdtYXBTb3V0aCcpLFxuICAgICAgICBlYXN0OiB0aGlzLmdldCgnbWFwRWFzdCcpLFxuICAgICAgICB3ZXN0OiB0aGlzLmdldCgnbWFwV2VzdCcpLFxuICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0KCdsb2NhdGlvblR5cGUnKSA9PT0gJ2RtcycpIHtcbiAgICAgIHRoaXMuc2V0QmJveERtc0Zyb21NYXAoKVxuICAgICAgdGhpcy5zZXRSYWRpdXNEbXNGcm9tTWFwKClcbiAgICB9XG4gIH0sXG4gIC8vIENvbnZlcnQgTGF0LUxvbiB0byBVVE0vVVBTIGNvb3JkaW5hdGVzLiBSZXR1cm5zIHVuZGVmaW5lZCBpZiBsYXQgb3IgbG9uIGlzIHVuZGVmaW5lZCBvciBub3QgYSBudW1iZXIuXG4gIC8vIFJldHVybnMgdW5kZWZpbmVkIGlmIHRoZSB1bmRlcmx5aW5nIGNhbGwgdG8gdXNuZyBmYWlscy4gT3RoZXJ3aXNlLCByZXR1cm5zIGFuIG9iamVjdCB3aXRoOlxuICAvL1xuICAvLyAgIGVhc3RpbmcgICAgOiBGTE9BVFxuICAvLyAgIG5vcnRoaW5nICAgOiBGTE9BVFxuICAvLyAgIHpvbmVOdW1iZXIgOiBJTlRFR0VSICg+PTAgYW5kIDw9IDYwKVxuICAvLyAgIGhlbWlzcGhlcmUgOiBTVFJJTkcgKE5PUlRIRVJOIG9yIFNPVVRIRVJOKVxuICBMTHRvVXRtVXBzKGxhdDogYW55LCBsb246IGFueSkge1xuICAgIGxhdCA9IHBhcnNlRmxvYXQobGF0KVxuICAgIGxvbiA9IHBhcnNlRmxvYXQobG9uKVxuICAgIGlmICghdGhpcy5pc0xhdExvblZhbGlkKGxhdCwgbG9uKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBsZXQgdXRtVXBzID0gY29udmVydGVyLkxMdG9VVE1VUFNPYmplY3QobGF0LCBsb24pXG4gICAgdXRtVXBzLmhlbWlzcGhlcmUgPSBsYXQgPj0gMCA/ICdOT1JUSEVSTicgOiAnU09VVEhFUk4nXG4gICAgcmV0dXJuIHV0bVVwc1xuICB9LFxuICAvLyBDb252ZXJ0IFVUTS9VUFMgY29vcmRpbmF0ZXMgdG8gTGF0LUxvbi4gRXhwZWN0cyBhbiBhcmd1bWVudCBvYmplY3Qgd2l0aDpcbiAgLy9cbiAgLy8gICBlYXN0aW5nICAgIDogRkxPQVRcbiAgLy8gICBub3J0aGluZyAgIDogRkxPQVRcbiAgLy8gICB6b25lTnVtYmVyIDogSU5URUdFUiAoPj0wIGFuZCA8PSA2MClcbiAgLy8gICBoZW1pc3BoZXJlIDogU1RSSU5HIChOT1JUSEVSTiBvciBTT1VUSEVSTilcbiAgLy9cbiAgLy8gUmV0dXJucyBhbiBvYmplY3Qgd2l0aDpcbiAgLy9cbiAgLy8gICBsYXQgOiBGTE9BVFxuICAvLyAgIGxvbiA6IEZMT0FUXG4gIC8vXG4gIC8vIFJldHVybnMgdW5kZWZpbmVkIGlmIHRoZSBsYXRpdHVkZSBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vXG4gIHV0bVVwc3RvTEwodXRtVXBzUGFydHM6IGFueSkge1xuICAgIGNvbnN0IHsgaGVtaXNwaGVyZSwgem9uZU51bWJlciwgbm9ydGhpbmcgfSA9IHV0bVVwc1BhcnRzXG4gICAgY29uc3Qgbm9ydGhlcm5IZW1pc3BoZXJlID0gaGVtaXNwaGVyZS50b1VwcGVyQ2FzZSgpID09PSAnTk9SVEhFUk4nXG4gICAgdXRtVXBzUGFydHMgPSB7XG4gICAgICAuLi51dG1VcHNQYXJ0cyxcbiAgICAgIG5vcnRoUG9sZTogbm9ydGhlcm5IZW1pc3BoZXJlLFxuICAgIH1cbiAgICBjb25zdCBpc1VwcyA9IHpvbmVOdW1iZXIgPT09IDBcbiAgICB1dG1VcHNQYXJ0cy5ub3J0aGluZyA9XG4gICAgICBpc1VwcyB8fCBub3J0aGVybkhlbWlzcGhlcmUgPyBub3J0aGluZyA6IG5vcnRoaW5nIC0gbm9ydGhpbmdPZmZzZXRcbiAgICBsZXQgbGF0LCBsb25cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29udmVydGVyLlVUTVVQU3RvTEwodXRtVXBzUGFydHMpXG4gICAgICBsYXQgPSByZXN1bHQubGF0XG4gICAgICBsb24gPSByZXN1bHQubG9uICUgMzYwXG4gICAgICBpZiAobG9uIDwgLTE4MCkge1xuICAgICAgICBsb24gPSBsb24gKyAzNjBcbiAgICAgIH1cbiAgICAgIGlmIChsb24gPiAxODApIHtcbiAgICAgICAgbG9uID0gbG9uIC0gMzYwXG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaXNMYXRMb25WYWxpZChsYXQsIGxvbikpIHtcbiAgICAgICAgcmV0dXJuIHsgbGF0OiB1bmRlZmluZWQsIGxvbjogdW5kZWZpbmVkIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IGxhdDogdW5kZWZpbmVkLCBsb246IHVuZGVmaW5lZCB9XG4gICAgfVxuICAgIHJldHVybiB7IGxhdCwgbG9uIH1cbiAgfSxcbiAgLy8gUmV0dXJuIHRydWUgaWYgdGhlIGN1cnJlbnQgbG9jYXRpb24gdHlwZSBpcyBVVE0vVVBTLCBvdGhlcndpc2UgZmFsc2UuXG4gIGlzTG9jYXRpb25UeXBlVXRtVXBzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbG9jYXRpb25UeXBlJykgPT09IHV0bVVwc0xvY2F0aW9uVHlwZVxuICB9LFxuICAvLyBTZXQgdGhlIG1vZGVsIGZpZWxkcyBmb3IgdGhlIFVwcGVyLUxlZnQgYm91bmRpbmcgYm94IFVUTS9VUFMuIFRoZSBhcmd1bWVudHMgYXJlOlxuICAvL1xuICAvLyAgIHV0bVVwc0Zvcm1hdHRlZCA6IG91dHB1dCBmcm9tIHRoZSBtZXRob2QgJ2Zvcm1hdFV0bVVwcydcbiAgLy8gICBzaWxlbnQgICAgICAgOiBCT09MRUFOICh0cnVlIGlmIGV2ZW50cyBzaG91bGQgYmUgZ2VuZXJhdGVkKVxuICBzZXRVdG1VcHNVcHBlckxlZnQodXRtVXBzRm9ybWF0dGVkOiBhbnksIHNpbGVudDogYW55KSB7XG4gICAgdGhpcy5zZXQoJ3V0bVVwc1VwcGVyTGVmdEVhc3RpbmcnLCB1dG1VcHNGb3JtYXR0ZWQuZWFzdGluZywge1xuICAgICAgc2lsZW50LFxuICAgIH0pXG4gICAgdGhpcy5zZXQoJ3V0bVVwc1VwcGVyTGVmdE5vcnRoaW5nJywgdXRtVXBzRm9ybWF0dGVkLm5vcnRoaW5nLCB7XG4gICAgICBzaWxlbnQsXG4gICAgfSlcbiAgICB0aGlzLnNldCgndXRtVXBzVXBwZXJMZWZ0Wm9uZScsIHV0bVVwc0Zvcm1hdHRlZC56b25lTnVtYmVyLCB7XG4gICAgICBzaWxlbnQsXG4gICAgfSlcbiAgICB0aGlzLnNldCgndXRtVXBzVXBwZXJMZWZ0SGVtaXNwaGVyZScsIHV0bVVwc0Zvcm1hdHRlZC5oZW1pc3BoZXJlLCB7XG4gICAgICBzaWxlbnQsXG4gICAgfSlcbiAgfSxcbiAgLy8gU2V0IHRoZSBtb2RlbCBmaWVsZHMgZm9yIHRoZSBMb3dlci1SaWdodCBib3VuZGluZyBib3ggVVRNL1VQUy4gVGhlIGFyZ3VtZW50cyBhcmU6XG4gIC8vXG4gIC8vICAgdXRtVXBzRm9ybWF0dGVkIDogb3V0cHV0IGZyb20gdGhlIG1ldGhvZCAnZm9ybWF0VXRtVXBzJ1xuICAvLyAgIHNpbGVudCAgICAgICA6IEJPT0xFQU4gKHRydWUgaWYgZXZlbnRzIHNob3VsZCBiZSBnZW5lcmF0ZWQpXG4gIHNldFV0bVVwc0xvd2VyUmlnaHQodXRtVXBzRm9ybWF0dGVkOiBhbnksIHNpbGVudDogYW55KSB7XG4gICAgdGhpcy5zZXQoJ3V0bVVwc0xvd2VyUmlnaHRFYXN0aW5nJywgdXRtVXBzRm9ybWF0dGVkLmVhc3RpbmcsIHtcbiAgICAgIHNpbGVudCxcbiAgICB9KVxuICAgIHRoaXMuc2V0KCd1dG1VcHNMb3dlclJpZ2h0Tm9ydGhpbmcnLCB1dG1VcHNGb3JtYXR0ZWQubm9ydGhpbmcsIHtcbiAgICAgIHNpbGVudCxcbiAgICB9KVxuICAgIHRoaXMuc2V0KCd1dG1VcHNMb3dlclJpZ2h0Wm9uZScsIHV0bVVwc0Zvcm1hdHRlZC56b25lTnVtYmVyLCB7XG4gICAgICBzaWxlbnQsXG4gICAgfSlcbiAgICB0aGlzLnNldCgndXRtVXBzTG93ZXJSaWdodEhlbWlzcGhlcmUnLCB1dG1VcHNGb3JtYXR0ZWQuaGVtaXNwaGVyZSwge1xuICAgICAgc2lsZW50LFxuICAgIH0pXG4gIH0sXG4gIC8vIFNldCB0aGUgbW9kZWwgZmllbGRzIGZvciB0aGUgUG9pbnQgUmFkaXVzIFVUTS9VUFMuIFRoZSBhcmd1bWVudHMgYXJlOlxuICAvL1xuICAvLyAgIHV0bVVwc0Zvcm1hdHRlZCA6IG91dHB1dCBmcm9tIHRoZSBtZXRob2QgJ2Zvcm1hdFV0bVVwcydcbiAgLy8gICBzaWxlbnQgICAgICAgOiBCT09MRUFOICh0cnVlIGlmIGV2ZW50cyBzaG91bGQgYmUgZ2VuZXJhdGVkKVxuICBzZXRVdG1VcHNQb2ludFJhZGl1cyh1dG1VcHNGb3JtYXR0ZWQ6IGFueSwgc2lsZW50OiBhbnkpIHtcbiAgICB0aGlzLnNldCgndXRtVXBzRWFzdGluZycsIHV0bVVwc0Zvcm1hdHRlZC5lYXN0aW5nLCB7IHNpbGVudCB9KVxuICAgIHRoaXMuc2V0KCd1dG1VcHNOb3J0aGluZycsIHV0bVVwc0Zvcm1hdHRlZC5ub3J0aGluZywgeyBzaWxlbnQgfSlcbiAgICB0aGlzLnNldCgndXRtVXBzWm9uZScsIHV0bVVwc0Zvcm1hdHRlZC56b25lTnVtYmVyLCB7IHNpbGVudCB9KVxuICAgIHRoaXMuc2V0KCd1dG1VcHNIZW1pc3BoZXJlJywgdXRtVXBzRm9ybWF0dGVkLmhlbWlzcGhlcmUsIHtcbiAgICAgIHNpbGVudCxcbiAgICB9KVxuICB9LFxuICBjbGVhclV0bVVwc1BvaW50UmFkaXVzKHNpbGVudDogYW55KSB7XG4gICAgdGhpcy5zZXQoJ3V0bVVwc0Vhc3RpbmcnLCB1bmRlZmluZWQsIHsgc2lsZW50IH0pXG4gICAgdGhpcy5zZXQoJ3V0bVVwc05vcnRoaW5nJywgdW5kZWZpbmVkLCB7IHNpbGVudCB9KVxuICAgIHRoaXMuc2V0KCd1dG1VcHNab25lJywgMSwgeyBzaWxlbnQgfSlcbiAgICB0aGlzLnNldCgndXRtVXBzSGVtaXNwaGVyZScsICdOb3J0aGVybicsIHsgc2lsZW50IH0pXG4gIH0sXG4gIGNsZWFyVXRtVXBzVXBwZXJMZWZ0KHNpbGVudDogYW55KSB7XG4gICAgdGhpcy5zZXQoXG4gICAgICB7XG4gICAgICAgIHV0bVVwc1VwcGVyTGVmdEVhc3Rpbmc6IHVuZGVmaW5lZCxcbiAgICAgICAgdXRtVXBzVXBwZXJMZWZ0Tm9ydGhpbmc6IHVuZGVmaW5lZCxcbiAgICAgICAgdXRtVXBzVXBwZXJMZWZ0Wm9uZTogMSxcbiAgICAgICAgdXRtVXBzVXBwZXJMZWZ0SGVtaXNwaGVyZTogJ05vcnRoZXJuJyxcbiAgICAgIH0sXG4gICAgICB7IHNpbGVudCB9XG4gICAgKVxuICB9LFxuICBjbGVhclV0bVVwc0xvd2VyUmlnaHQoc2lsZW50OiBhbnkpIHtcbiAgICB0aGlzLnNldCgndXRtVXBzTG93ZXJSaWdodEVhc3RpbmcnLCB1bmRlZmluZWQsIHsgc2lsZW50IH0pXG4gICAgdGhpcy5zZXQoJ3V0bVVwc0xvd2VyUmlnaHROb3J0aGluZycsIHVuZGVmaW5lZCwgeyBzaWxlbnQgfSlcbiAgICB0aGlzLnNldCgndXRtVXBzTG93ZXJSaWdodFpvbmUnLCAxLCB7IHNpbGVudCB9KVxuICAgIHRoaXMuc2V0KCd1dG1VcHNMb3dlclJpZ2h0SGVtaXNwaGVyZScsICdOb3J0aGVybicsIHsgc2lsZW50IH0pXG4gIH0sXG4gIC8vIFBhcnNlIHRoZSBVVE0vVVBTIGZpZWxkcyB0aGF0IGNvbWUgZnJvbSB0aGUgSFRNTCBsYXllci4gVGhlIHBhcmFtZXRlcnMgZWFzdGluZ1JhdyBhbmQgbm9ydGhpbmdSYXdcbiAgLy8gYXJlIHN0cmluZyByZXByZXNlbnRhdGlvbnMgb2YgZmxvYXRpbmcgcG9pbnRudW1iZXJzLiBUaGUgem9uZVJhdyBwYXJhbWV0ZXIgaXMgYSBzdHJpbmdcbiAgLy8gcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciBpbiB0aGUgcmFuZ2UgWzAsNjBdLiBUaGUgaGVtaXNwaGVyZVJhdyBwYXJhbWV0ZXJzIGlzIGEgc3RyaW5nXG4gIC8vIHRoYXQgc2hvdWxkIGJlICdOb3J0aGVybicgb3IgJ1NvdXRoZXJuJy5cbiAgcGFyc2VVdG1VcHMoXG4gICAgZWFzdGluZ1JhdzogYW55LFxuICAgIG5vcnRoaW5nUmF3OiBhbnksXG4gICAgem9uZVJhdzogYW55LFxuICAgIGhlbWlzcGhlcmVSYXc6IGFueVxuICApIHtcbiAgICBjb25zdCBlYXN0aW5nID0gcGFyc2VGbG9hdChlYXN0aW5nUmF3KVxuICAgIGNvbnN0IG5vcnRoaW5nID0gcGFyc2VGbG9hdChub3J0aGluZ1JhdylcbiAgICBjb25zdCB6b25lID0gcGFyc2VJbnQoem9uZVJhdylcbiAgICBjb25zdCBoZW1pc3BoZXJlID1cbiAgICAgIGhlbWlzcGhlcmVSYXcgPT09ICdOb3J0aGVybidcbiAgICAgICAgPyAnTk9SVEhFUk4nXG4gICAgICAgIDogaGVtaXNwaGVyZVJhdyA9PT0gJ1NvdXRoZXJuJ1xuICAgICAgICA/ICdTT1VUSEVSTidcbiAgICAgICAgOiB1bmRlZmluZWRcbiAgICBpZiAoXG4gICAgICAhaXNOYU4oZWFzdGluZykgJiZcbiAgICAgICFpc05hTihub3J0aGluZykgJiZcbiAgICAgICFpc05hTih6b25lKSAmJlxuICAgICAgaGVtaXNwaGVyZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB6b25lID49IDAgJiZcbiAgICAgIHpvbmUgPD0gNjBcbiAgICApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHpvbmVOdW1iZXI6IHpvbmUsXG4gICAgICAgIGhlbWlzcGhlcmUsXG4gICAgICAgIGVhc3RpbmcsXG4gICAgICAgIG5vcnRoaW5nLFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH0sXG4gIC8vIEZvcm1hdCB0aGUgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgVVRNL1VQUyBjb29yZGluYXRlcyBpbnRvIHRoZSBmb3JtIGV4cGVjdGVkIGJ5IHRoZSBtb2RlbC5cbiAgZm9ybWF0VXRtVXBzKHV0bVVwczogYW55KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVhc3Rpbmc6IHV0bVVwcy5lYXN0aW5nLFxuICAgICAgbm9ydGhpbmc6IHV0bVVwcy5ub3J0aGluZyxcbiAgICAgIHpvbmVOdW1iZXI6IHV0bVVwcy56b25lTnVtYmVyLFxuICAgICAgaGVtaXNwaGVyZTpcbiAgICAgICAgdXRtVXBzLmhlbWlzcGhlcmUgPT09ICdOT1JUSEVSTidcbiAgICAgICAgICA/ICdOb3J0aGVybidcbiAgICAgICAgICA6IHV0bVVwcy5oZW1pc3BoZXJlID09PSAnU09VVEhFUk4nXG4gICAgICAgICAgPyAnU291dGhlcm4nXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgfVxuICB9LFxuICAvLyBSZXR1cm4gdHJ1ZSBpZiBhbGwgb2YgdGhlIFVUTS9VUFMgdXBwZXItbGVmdCBtb2RlbCBmaWVsZHMgYXJlIGRlZmluZWQuIE90aGVyd2lzZSwgZmFsc2UuXG4gIGlzVXRtVXBzVXBwZXJMZWZ0RGVmaW5lZCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc1VwcGVyTGVmdEVhc3RpbmcnKSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0aGlzLmdldCgndXRtVXBzVXBwZXJMZWZ0Tm9ydGhpbmcnKSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0aGlzLmdldCgndXRtVXBzVXBwZXJMZWZ0Wm9uZScpICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHRoaXMuZ2V0KCd1dG1VcHNVcHBlckxlZnRIZW1pc3BoZXJlJykgIT09IHVuZGVmaW5lZFxuICAgIClcbiAgfSxcbiAgLy8gUmV0dXJuIHRydWUgaWYgYWxsIG9mIHRoZSBVVE0vVVBTIGxvd2VyLXJpZ2h0IG1vZGVsIGZpZWxkcyBhcmUgZGVmaW5lZC4gT3RoZXJ3aXNlLCBmYWxzZS5cbiAgaXNVdG1VcHNMb3dlclJpZ2h0RGVmaW5lZCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc0xvd2VyUmlnaHRFYXN0aW5nJykgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc0xvd2VyUmlnaHROb3J0aGluZycpICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHRoaXMuZ2V0KCd1dG1VcHNMb3dlclJpZ2h0Wm9uZScpICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHRoaXMuZ2V0KCd1dG1VcHNMb3dlclJpZ2h0SGVtaXNwaGVyZScpICE9PSB1bmRlZmluZWRcbiAgICApXG4gIH0sXG4gIC8vIFJldHVybiB0cnVlIGlmIGFsbCBvZiB0aGUgVVRNL1VQUyBwb2ludCByYWRpdXMgbW9kZWwgZmllbGRzIGFyZSBkZWZpbmVkLiBPdGhlcndpc2UsIGZhbHNlLlxuICBpc1V0bVVwc1BvaW50UmFkaXVzRGVmaW5lZCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc0Vhc3RpbmcnKSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0aGlzLmdldCgndXRtVXBzTm9ydGhpbmcnKSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0aGlzLmdldCgndXRtVXBzWm9uZScpICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHRoaXMuZ2V0KCd1dG1VcHNIZW1pc3BoZXJlJykgIT09IHVuZGVmaW5lZFxuICAgIClcbiAgfSxcbiAgLy8gR2V0IHRoZSBVVE0vVVBTIFVwcGVyLUxlZnQgYm91bmRpbmcgYm94IGZpZWxkcyBpbiB0aGUgaW50ZXJuYWwgZm9ybWF0LiBTZWUgJ3BhcnNlVXRtVXBzJy5cbiAgcGFyc2VVdG1VcHNVcHBlckxlZnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VVdG1VcHMoXG4gICAgICB0aGlzLmdldCgndXRtVXBzVXBwZXJMZWZ0RWFzdGluZycpLFxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc1VwcGVyTGVmdE5vcnRoaW5nJyksXG4gICAgICB0aGlzLmdldCgndXRtVXBzVXBwZXJMZWZ0Wm9uZScpLFxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc1VwcGVyTGVmdEhlbWlzcGhlcmUnKVxuICAgIClcbiAgfSxcbiAgLy8gR2V0IHRoZSBVVE0vVVBTIExvd2VyLVJpZ2h0IGJvdW5kaW5nIGJveCBmaWVsZHMgaW4gdGhlIGludGVybmFsIGZvcm1hdC4gU2VlICdwYXJzZVV0bVVwcycuXG4gIHBhcnNlVXRtVXBzTG93ZXJSaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZVV0bVVwcyhcbiAgICAgIHRoaXMuZ2V0KCd1dG1VcHNMb3dlclJpZ2h0RWFzdGluZycpLFxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc0xvd2VyUmlnaHROb3J0aGluZycpLFxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc0xvd2VyUmlnaHRab25lJyksXG4gICAgICB0aGlzLmdldCgndXRtVXBzTG93ZXJSaWdodEhlbWlzcGhlcmUnKVxuICAgIClcbiAgfSxcbiAgLy8gR2V0IHRoZSBVVE0vVVBTIHBvaW50IHJhZGl1cyBmaWVsZHMgaW4gdGhlIGludGVybmFsIGZvcm1hdC4gU2VlICdwYXJzZVV0bVVwcycuXG4gIHBhcnNlVXRtVXBzUG9pbnRSYWRpdXMoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VVdG1VcHMoXG4gICAgICB0aGlzLmdldCgndXRtVXBzRWFzdGluZycpLFxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc05vcnRoaW5nJyksXG4gICAgICB0aGlzLmdldCgndXRtVXBzWm9uZScpLFxuICAgICAgdGhpcy5nZXQoJ3V0bVVwc0hlbWlzcGhlcmUnKVxuICAgIClcbiAgfSxcbiAgLy8gb3ZlcnJpZGUgdG9KU09OIHNvIHRoYXQgd2hlbiB3ZSBzYXZlIHRoZSBsb2NhdGlvbiBpbmZvcm1hdGlvbiBlbHNld2hlcmUgd2UgZG9uJ3QgaW5jbHVkZSBlcGhlbWVyYWwgc3RhdGUsIGxpa2UgaXNJbnRlcmFjdGl2ZVxuICB0b0pTT04ob3B0aW9uczogYW55KSB7XG4gICAgY29uc3Qgb3JpZ2luYWxKU09OID0gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnRvSlNPTi5hcHBseSh0aGlzLCBbb3B0aW9uc10pXG4gICAgZGVsZXRlIG9yaWdpbmFsSlNPTlsnaXNJbnRlcmFjdGl2ZSddXG4gICAgZGVsZXRlIG9yaWdpbmFsSlNPTlsnaXNSZWFkb25seSddXG4gICAgcmV0dXJuIG9yaWdpbmFsSlNPTlxuICB9LFxufSlcbiJdfQ==