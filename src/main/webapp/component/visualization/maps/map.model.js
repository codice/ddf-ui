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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvbWFwLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7O0FBRUosT0FBTyxPQUFPLE1BQU0sa0RBQWtELENBQUE7QUFFdEUsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixtSkFBbUo7QUFDbkosT0FBTyxLQUFLLE1BQU0sUUFBUSxDQUFBO0FBQzFCLE9BQU8sS0FBSyxLQUFLLE1BQU0sU0FBUyxDQUFBO0FBQ2hDLDRFQUE0RTtBQUM1RSxJQUFNLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUN2QyxJQUFNLGFBQWEsR0FBRyxDQUFDLENBQUE7QUFFdkIsZUFBZSxRQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUM3QyxRQUFRLEVBQUU7UUFDUixRQUFRLEVBQUUsU0FBUztRQUNuQixRQUFRLEVBQUUsU0FBUztRQUNuQixnQkFBZ0IsRUFBRTtZQUNoQixHQUFHLEVBQUUsRUFBRTtZQUNQLEdBQUcsRUFBRSxFQUFFO1lBQ1AsR0FBRyxFQUFFLEVBQUU7WUFDUCxJQUFJLEVBQUUsRUFBRTtZQUNSLE1BQU0sRUFBRSxFQUFFO1NBQ1g7UUFDRCxNQUFNLEVBQUUsU0FBUztRQUNqQixjQUFjLEVBQUUsU0FBUztRQUN6QixnQkFBZ0IsRUFBRSxNQUFNO1FBQ3hCLGVBQWUsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sRUFBRSxFQUFFO1FBQ1YsTUFBTSxFQUFFLEVBQUU7UUFDVixJQUFJLEVBQUUsU0FBUztRQUNmLFlBQVksRUFBRTtZQUNaLElBQUksRUFBRSxDQUFDO1lBQ1AsR0FBRyxFQUFFLENBQUM7U0FDUDtRQUNELG1CQUFtQixF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QUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLFFBQVEsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pFLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxzQkFBc0I7UUFDcEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNoQyxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ2hDLElBQU0sR0FBRyxHQUFHLFVBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsY0FBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUE7UUFDckQsSUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUM7WUFDdEMsQ0FBQyxDQUFDLFNBQVM7WUFDWCxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQy9DLElBQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQzdDLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDUCxnQkFBZ0IsRUFBRTtnQkFDaEIsR0FBRyxLQUFBO2dCQUNILEdBQUcsS0FBQTtnQkFDSCxHQUFHLEtBQUE7Z0JBQ0gsSUFBSSxNQUFBO2dCQUNKLE1BQU0sUUFBQTthQUNQO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuXG5pbXBvcnQgd3JhcE51bSBmcm9tICcuLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvd3JhcC1udW0vd3JhcC1udW0nXG5cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCdcbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ210LWcuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IG10Z2VvIGZyb20gJ210LWdlbydcbmltcG9ydCAqIGFzIHVzbmdzIGZyb20gJ3VzbmcuanMnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjU1NCkgRklYTUU6IEV4cGVjdGVkIDEgYXJndW1lbnRzLCBidXQgZ290IDAuXG5jb25zdCBjb252ZXJ0ZXIgPSBuZXcgdXNuZ3MuQ29udmVydGVyKClcbmNvbnN0IHVzbmdQcmVjaXNpb24gPSA2XG5cbmV4cG9ydCBkZWZhdWx0IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0czoge1xuICAgIG1vdXNlTGF0OiB1bmRlZmluZWQsXG4gICAgbW91c2VMb246IHVuZGVmaW5lZCxcbiAgICBjb29yZGluYXRlVmFsdWVzOiB7XG4gICAgICBkbXM6ICcnLFxuICAgICAgbGF0OiAnJyxcbiAgICAgIGxvbjogJycsXG4gICAgICBtZ3JzOiAnJyxcbiAgICAgIHV0bVVwczogJycsXG4gICAgfSxcbiAgICB0YXJnZXQ6IHVuZGVmaW5lZCxcbiAgICB0YXJnZXRNZXRhY2FyZDogdW5kZWZpbmVkLFxuICAgIG1lYXN1cmVtZW50U3RhdGU6ICdOT05FJyxcbiAgICBjdXJyZW50RGlzdGFuY2U6IDAsXG4gICAgcG9pbnRzOiBbXSxcbiAgICBsYWJlbHM6IFtdLFxuICAgIGxpbmU6IHVuZGVmaW5lZCxcbiAgICBkaXN0YW5jZUluZm86IHtcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB0b3A6IDAsXG4gICAgfSxcbiAgICBzdGFydGluZ0Nvb3JkaW5hdGVzOiB1bmRlZmluZWQsXG4gIH0sXG4gIC8qXG4gICAqIFNldHMgdGhlIG1lYXN1cmVtZW50IHN0YXRlIHRvIHRoZSBnaXZlbiBuZXcgc3RhdGUuXG4gICAqIFZhbGlkIG1lYXN1cmVtZW50IHN0YXRlcyBhcmU6XG4gICAqICAgLSBOT05FXG4gICAqICAgLSBTVEFSVFxuICAgKiAgIC0gRU5EXG4gICAqL1xuICBjaGFuZ2VNZWFzdXJlbWVudFN0YXRlKHN0YXRlOiBhbnkpIHtcbiAgICAvLyB0aGUgY3VycmVudCBkaXN0YW5jZSBzaG91bGQgYmUgMCB3aGVuIGluIHRoZSBOT05FIG9yIFNUQVJUIHN0YXRlXG4gICAgaWYgKHN0YXRlID09PSAnTk9ORScgfHwgc3RhdGUgPT09ICdTVEFSVCcpIHtcbiAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgbWVhc3VyZW1lbnRTdGF0ZTogc3RhdGUsXG4gICAgICAgIGN1cnJlbnREaXN0YW5jZTogMCxcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0KHsgbWVhc3VyZW1lbnRTdGF0ZTogc3RhdGUgfSlcbiAgICB9XG4gIH0sXG4gIC8qXG4gICAqIEFwcGVuZHMgdGhlIGdpdmVuIHBvaW50IHRvIHRoZSBhcnJheSBvZiBwb2ludHMgYmVpbmcgdHJhY2tlZC5cbiAgICovXG4gIGFkZFBvaW50KHBvaW50OiBhbnkpIHtcbiAgICB0aGlzLnNldCh7XG4gICAgICBwb2ludHM6IFsuLi50aGlzLmdldCgncG9pbnRzJyksIHBvaW50XSxcbiAgICB9KVxuICB9LFxuICBhZGRMYWJlbChsYWJlbDogYW55KSB7XG4gICAgdGhpcy5zZXQoe1xuICAgICAgbGFiZWxzOiBbLi4udGhpcy5nZXQoJ2xhYmVscycpLCBsYWJlbF0sXG4gICAgfSlcbiAgfSxcbiAgcmVtb3ZlTGFiZWwobGFiZWw6IGFueSkge1xuICAgIF8ucmVtb3ZlKHRoaXMuZ2V0KCdsYWJlbHMnKSwgKGUpID0+IGUgPT09IGxhYmVsKVxuICB9LFxuICAvKlxuICAgKiBTZXRzIHRoZSBsaW5lIHRvIHRoZSBnaXZlbiBuZXcgbGluZS4gVGhpcyByZXByZXNlbnRzIHRoZSBsaW5lIG9uIHRoZSBtYXBcbiAgICogYmVpbmcgdXNlZCBmb3IgdGhlIHJ1bGVyIG1lYXN1cmVtZW50LlxuICAgKi9cbiAgc2V0TGluZShsaW5lOiBhbnkpIHtcbiAgICB0aGlzLnNldCh7IGxpbmUgfSlcbiAgfSxcbiAgLypcbiAgICogUmVzZXRzIHRoZSBtb2RlbCdzIGxpbmUgYW5kIHJldHVybnMgdGhlIG9sZCBvbmUuXG4gICAqL1xuICByZW1vdmVMaW5lKCkge1xuICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdldCgnbGluZScpXG4gICAgdGhpcy5zZXQoeyBsaW5lOiB1bmRlZmluZWQgfSlcblxuICAgIHJldHVybiBsaW5lXG4gIH0sXG4gIC8qXG4gICAqIFJlc2V0cyB0aGUgbW9kZWwncyBhcnJheSBvZiBwb2ludHMuXG4gICAqL1xuICBjbGVhclBvaW50cygpIHtcbiAgICB0aGlzLnNldCh7IHBvaW50czogW10gfSlcbiAgfSxcbiAgLypcbiAgICogU2V0IGNvb3JkaW5hdGVzIG9mIHRoZSBydWxlciBtZWFzdXJlbWVudHMgc3RhcnRpbmcgcG9pbnRcbiAgICovXG4gIHNldFN0YXJ0aW5nQ29vcmRpbmF0ZXMoY29vcmRpbmF0ZXM6IGFueSkge1xuICAgIHRoaXMuc2V0KHsgc3RhcnRpbmdDb29yZGluYXRlczogY29vcmRpbmF0ZXMgfSlcbiAgfSxcbiAgLypcbiAgICogU2V0cyB0aGUgY3VycmVudCBkaXN0YW5jZSB0byB0aGUgbmV3IGdpdmVuIGRpc3RhbmNlIChpbiBtZXRlcnMpLlxuICAgKi9cbiAgc2V0Q3VycmVudERpc3RhbmNlKGRpc3RhbmNlOiBhbnkpIHtcbiAgICB0aGlzLnNldCh7IGN1cnJlbnREaXN0YW5jZTogZGlzdGFuY2UgfSlcbiAgfSxcbiAgYWRkRGlzdGFuY2VJbmZvKGRpc3RhbmNlSW5mbzogYW55KSB7XG4gICAgdGhpcy5zZXQoeyBkaXN0YW5jZUluZm8gfSlcbiAgfSxcbiAgLypcbiAgICogc2V0IHRoZSBwb3NpdGlvbiBvZiBEaXN0YW5jZUluZm8gaW4gcHggcmVsYXRpdmUgdG8gdGhlIHRvcCBsZWZ0IG9mIHRoZSBDZXNpdW0gY29tcG9uZW50XG4gICAqL1xuICBzZXREaXN0YW5jZUluZm9Qb3NpdGlvbihsZWZ0OiBhbnksIHRvcDogYW55KSB7XG4gICAgdGhpcy5zZXQoeyBkaXN0YW5jZUluZm86IHsgbGVmdCwgdG9wIH0gfSlcbiAgfSxcbiAgaXNPZmZNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdtb3VzZUxhdCcpID09PSB1bmRlZmluZWRcbiAgfSxcbiAgY2xlYXJNb3VzZUNvb3JkaW5hdGVzKCkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIG1vdXNlTGF0OiB1bmRlZmluZWQsXG4gICAgICBtb3VzZUxvbjogdW5kZWZpbmVkLFxuICAgIH0pXG4gIH0sXG4gIHVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXMoY29vcmRpbmF0ZXM6IGFueSkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIG1vdXNlTGF0OiBOdW1iZXIoY29vcmRpbmF0ZXMubGF0LnRvRml4ZWQoNikpLCAvLyB3cmFwIGluIE51bWJlciB0byBjaG9wIG9mZiB0cmFpbGluZyB6ZXJvXG4gICAgICBtb3VzZUxvbjogTnVtYmVyKHdyYXBOdW0oY29vcmRpbmF0ZXMubG9uLCAtMTgwLCAxODApLnRvRml4ZWQoNikpLFxuICAgIH0pXG4gIH0sXG4gIHVwZGF0ZUNsaWNrQ29vcmRpbmF0ZXMoKSB7XG4gICAgY29uc3QgbGF0ID0gdGhpcy5nZXQoJ21vdXNlTGF0JylcbiAgICBjb25zdCBsb24gPSB0aGlzLmdldCgnbW91c2VMb24nKVxuICAgIGNvbnN0IGRtcyA9IGAke210Z2VvLnRvTGF0KGxhdCl9ICR7bXRnZW8udG9Mb24obG9uKX1gXG4gICAgY29uc3QgbWdycyA9IGNvbnZlcnRlci5pc0luVVBTU3BhY2UobGF0KVxuICAgICAgPyB1bmRlZmluZWRcbiAgICAgIDogY29udmVydGVyLkxMdG9VU05HKGxhdCwgbG9uLCB1c25nUHJlY2lzaW9uKVxuICAgIGNvbnN0IHV0bVVwcyA9IGNvbnZlcnRlci5MTHRvVVRNVVBTKGxhdCwgbG9uKVxuICAgIHRoaXMuc2V0KHtcbiAgICAgIGNvb3JkaW5hdGVWYWx1ZXM6IHtcbiAgICAgICAgbGF0LFxuICAgICAgICBsb24sXG4gICAgICAgIGRtcyxcbiAgICAgICAgbWdycyxcbiAgICAgICAgdXRtVXBzLFxuICAgICAgfSxcbiAgICB9KVxuICB9LFxufSlcbiJdfQ==