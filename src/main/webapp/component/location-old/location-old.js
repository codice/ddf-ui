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
//# sourceMappingURL=location-old.js.map