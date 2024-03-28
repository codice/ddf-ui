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
import { __read, __spreadArray } from "tslib";
import wrapNum from '../../../react-component/utils/wrap-num/wrap-num';
import _ from 'lodash';
import Backbone from 'backbone';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mt-g... Remove this comment to see the full error message
import mtgeo from 'mt-geo';
import * as usngs from 'usng.js';
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
var converter = new usngs.Converter();
var usngPrecision = 6;
export default Backbone.AssociatedModel.extend({
    defaults: {
        mouseLat: undefined,
        mouseLon: undefined,
        coordinateValues: {
            dms: '',
            lat: '',
            lon: '',
            mgrs: '',
            utmUps: '',
        },
        target: undefined,
        targetMetacard: undefined,
        measurementState: 'NONE',
        currentDistance: 0,
        points: [],
        labels: [],
        line: undefined,
        distanceInfo: {
            left: 0,
            top: 0,
        },
        startingCoordinates: undefined,
    },
    /*
     * Sets the measurement state to the given new state.
     * Valid measurement states are:
     *   - NONE
     *   - START
     *   - END
     */
    changeMeasurementState: function (state) {
        // the current distance should be 0 when in the NONE or START state
        if (state === 'NONE' || state === 'START') {
            this.set({
                measurementState: state,
                currentDistance: 0,
            });
        }
        else {
            this.set({ measurementState: state });
        }
    },
    /*
     * Appends the given point to the array of points being tracked.
     */
    addPoint: function (point) {
        this.set({
            points: __spreadArray(__spreadArray([], __read(this.get('points')), false), [point], false),
        });
    },
    addLabel: function (label) {
        this.set({
            labels: __spreadArray(__spreadArray([], __read(this.get('labels')), false), [label], false),
        });
    },
    removeLabel: function (label) {
        _.remove(this.get('labels'), function (e) { return e === label; });
    },
    /*
     * Sets the line to the given new line. This represents the line on the map
     * being used for the ruler measurement.
     */
    setLine: function (line) {
        this.set({ line: line });
    },
    /*
     * Resets the model's line and returns the old one.
     */
    removeLine: function () {
        var line = this.get('line');
        this.set({ line: undefined });
        return line;
    },
    /*
     * Resets the model's array of points.
     */
    clearPoints: function () {
        this.set({ points: [] });
    },
    /*
     * Set coordinates of the ruler measurements starting point
     */
    setStartingCoordinates: function (coordinates) {
        this.set({ startingCoordinates: coordinates });
    },
    /*
     * Sets the current distance to the new given distance (in meters).
     */
    setCurrentDistance: function (distance) {
        this.set({ currentDistance: distance });
    },
    addDistanceInfo: function (distanceInfo) {
        this.set({ distanceInfo: distanceInfo });
    },
    /*
     * set the position of DistanceInfo in px relative to the top left of the Cesium component
     */
    setDistanceInfoPosition: function (left, top) {
        this.set({ distanceInfo: { left: left, top: top } });
    },
    isOffMap: function () {
        return this.get('mouseLat') === undefined;
    },
    clearMouseCoordinates: function () {
        this.set({
            mouseLat: undefined,
            mouseLon: undefined,
        });
    },
    updateMouseCoordinates: function (coordinates) {
        this.set({
            mouseLat: Number(coordinates.lat.toFixed(6)),
            mouseLon: Number(wrapNum(coordinates.lon, -180, 180).toFixed(6)),
        });
    },
    updateClickCoordinates: function () {
        var lat = this.get('mouseLat');
        var lon = this.get('mouseLon');
        var dms = "".concat(mtgeo.toLat(lat), " ").concat(mtgeo.toLon(lon));
        var mgrs = converter.isInUPSSpace(lat)
            ? undefined
            : converter.LLtoUSNG(lat, lon, usngPrecision);
        var utmUps = converter.LLtoUTMUPS(lat, lon);
        this.set({
            coordinateValues: {
                lat: lat,
                lon: lon,
                dms: dms,
                mgrs: mgrs,
                utmUps: utmUps,
            },
        });
    },
});
//# sourceMappingURL=map.model.js.map