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
            mouseLat: Number(coordinates.lat.toFixed(6)), // wrap in Number to chop off trailing zero
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvbWFwLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7O0FBRUosT0FBTyxPQUFPLE1BQU0sa0RBQWtELENBQUE7QUFFdEUsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixtSkFBbUo7QUFDbkosT0FBTyxLQUFLLE1BQU0sUUFBUSxDQUFBO0FBQzFCLE9BQU8sS0FBSyxLQUFLLE1BQU0sU0FBUyxDQUFBO0FBQ2hDLDRFQUE0RTtBQUM1RSxJQUFNLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUN2QyxJQUFNLGFBQWEsR0FBRyxDQUFDLENBQUE7QUFFdkIsZUFBZSxRQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUM3QyxRQUFRLEVBQUU7UUFDUixRQUFRLEVBQUUsU0FBUztRQUNuQixRQUFRLEVBQUUsU0FBUztRQUNuQixnQkFBZ0IsRUFBRTtZQUNoQixHQUFHLEVBQUUsRUFBRTtZQUNQLEdBQUcsRUFBRSxFQUFFO1lBQ1AsR0FBRyxFQUFFLEVBQUU7WUFDUCxJQUFJLEVBQUUsRUFBRTtZQUNSLE1BQU0sRUFBRSxFQUFFO1NBQ1g7UUFDRCxNQUFNLEVBQUUsU0FBUztRQUNqQixjQUFjLEVBQUUsU0FBUztRQUN6QixnQkFBZ0IsRUFBRSxNQUFNO1FBQ3hCLGVBQWUsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sRUFBRSxFQUFFO1FBQ1YsTUFBTSxFQUFFLEVBQUU7UUFDVixJQUFJLEVBQUUsU0FBUztRQUNmLFlBQVksRUFBRTtZQUNaLElBQUksRUFBRSxDQUFDO1lBQ1AsR0FBRyxFQUFFLENBQUM7U0FDUDtRQUNELG1CQUFtQixF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QUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSwyQ0FBMkM7WUFDekYsUUFBUSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakUsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELHNCQUFzQjtRQUNwQixJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ2hDLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDaEMsSUFBTSxHQUFHLEdBQUcsVUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQTtRQUNyRCxJQUFNLElBQUksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQztZQUN0QyxDQUFDLENBQUMsU0FBUztZQUNYLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUE7UUFDL0MsSUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNQLGdCQUFnQixFQUFFO2dCQUNoQixHQUFHLEtBQUE7Z0JBQ0gsR0FBRyxLQUFBO2dCQUNILEdBQUcsS0FBQTtnQkFDSCxJQUFJLE1BQUE7Z0JBQ0osTUFBTSxRQUFBO2FBQ1A7U0FDRixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCB3cmFwTnVtIGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy93cmFwLW51bS93cmFwLW51bSdcblxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnbXQtZy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgbXRnZW8gZnJvbSAnbXQtZ2VvJ1xuaW1wb3J0ICogYXMgdXNuZ3MgZnJvbSAndXNuZy5qcydcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTU0KSBGSVhNRTogRXhwZWN0ZWQgMSBhcmd1bWVudHMsIGJ1dCBnb3QgMC5cbmNvbnN0IGNvbnZlcnRlciA9IG5ldyB1c25ncy5Db252ZXJ0ZXIoKVxuY29uc3QgdXNuZ1ByZWNpc2lvbiA9IDZcblxuZXhwb3J0IGRlZmF1bHQgQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIGRlZmF1bHRzOiB7XG4gICAgbW91c2VMYXQ6IHVuZGVmaW5lZCxcbiAgICBtb3VzZUxvbjogdW5kZWZpbmVkLFxuICAgIGNvb3JkaW5hdGVWYWx1ZXM6IHtcbiAgICAgIGRtczogJycsXG4gICAgICBsYXQ6ICcnLFxuICAgICAgbG9uOiAnJyxcbiAgICAgIG1ncnM6ICcnLFxuICAgICAgdXRtVXBzOiAnJyxcbiAgICB9LFxuICAgIHRhcmdldDogdW5kZWZpbmVkLFxuICAgIHRhcmdldE1ldGFjYXJkOiB1bmRlZmluZWQsXG4gICAgbWVhc3VyZW1lbnRTdGF0ZTogJ05PTkUnLFxuICAgIGN1cnJlbnREaXN0YW5jZTogMCxcbiAgICBwb2ludHM6IFtdLFxuICAgIGxhYmVsczogW10sXG4gICAgbGluZTogdW5kZWZpbmVkLFxuICAgIGRpc3RhbmNlSW5mbzoge1xuICAgICAgbGVmdDogMCxcbiAgICAgIHRvcDogMCxcbiAgICB9LFxuICAgIHN0YXJ0aW5nQ29vcmRpbmF0ZXM6IHVuZGVmaW5lZCxcbiAgfSxcbiAgLypcbiAgICogU2V0cyB0aGUgbWVhc3VyZW1lbnQgc3RhdGUgdG8gdGhlIGdpdmVuIG5ldyBzdGF0ZS5cbiAgICogVmFsaWQgbWVhc3VyZW1lbnQgc3RhdGVzIGFyZTpcbiAgICogICAtIE5PTkVcbiAgICogICAtIFNUQVJUXG4gICAqICAgLSBFTkRcbiAgICovXG4gIGNoYW5nZU1lYXN1cmVtZW50U3RhdGUoc3RhdGU6IGFueSkge1xuICAgIC8vIHRoZSBjdXJyZW50IGRpc3RhbmNlIHNob3VsZCBiZSAwIHdoZW4gaW4gdGhlIE5PTkUgb3IgU1RBUlQgc3RhdGVcbiAgICBpZiAoc3RhdGUgPT09ICdOT05FJyB8fCBzdGF0ZSA9PT0gJ1NUQVJUJykge1xuICAgICAgdGhpcy5zZXQoe1xuICAgICAgICBtZWFzdXJlbWVudFN0YXRlOiBzdGF0ZSxcbiAgICAgICAgY3VycmVudERpc3RhbmNlOiAwLFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXQoeyBtZWFzdXJlbWVudFN0YXRlOiBzdGF0ZSB9KVxuICAgIH1cbiAgfSxcbiAgLypcbiAgICogQXBwZW5kcyB0aGUgZ2l2ZW4gcG9pbnQgdG8gdGhlIGFycmF5IG9mIHBvaW50cyBiZWluZyB0cmFja2VkLlxuICAgKi9cbiAgYWRkUG9pbnQocG9pbnQ6IGFueSkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIHBvaW50czogWy4uLnRoaXMuZ2V0KCdwb2ludHMnKSwgcG9pbnRdLFxuICAgIH0pXG4gIH0sXG4gIGFkZExhYmVsKGxhYmVsOiBhbnkpIHtcbiAgICB0aGlzLnNldCh7XG4gICAgICBsYWJlbHM6IFsuLi50aGlzLmdldCgnbGFiZWxzJyksIGxhYmVsXSxcbiAgICB9KVxuICB9LFxuICByZW1vdmVMYWJlbChsYWJlbDogYW55KSB7XG4gICAgXy5yZW1vdmUodGhpcy5nZXQoJ2xhYmVscycpLCAoZSkgPT4gZSA9PT0gbGFiZWwpXG4gIH0sXG4gIC8qXG4gICAqIFNldHMgdGhlIGxpbmUgdG8gdGhlIGdpdmVuIG5ldyBsaW5lLiBUaGlzIHJlcHJlc2VudHMgdGhlIGxpbmUgb24gdGhlIG1hcFxuICAgKiBiZWluZyB1c2VkIGZvciB0aGUgcnVsZXIgbWVhc3VyZW1lbnQuXG4gICAqL1xuICBzZXRMaW5lKGxpbmU6IGFueSkge1xuICAgIHRoaXMuc2V0KHsgbGluZSB9KVxuICB9LFxuICAvKlxuICAgKiBSZXNldHMgdGhlIG1vZGVsJ3MgbGluZSBhbmQgcmV0dXJucyB0aGUgb2xkIG9uZS5cbiAgICovXG4gIHJlbW92ZUxpbmUoKSB7XG4gICAgY29uc3QgbGluZSA9IHRoaXMuZ2V0KCdsaW5lJylcbiAgICB0aGlzLnNldCh7IGxpbmU6IHVuZGVmaW5lZCB9KVxuXG4gICAgcmV0dXJuIGxpbmVcbiAgfSxcbiAgLypcbiAgICogUmVzZXRzIHRoZSBtb2RlbCdzIGFycmF5IG9mIHBvaW50cy5cbiAgICovXG4gIGNsZWFyUG9pbnRzKCkge1xuICAgIHRoaXMuc2V0KHsgcG9pbnRzOiBbXSB9KVxuICB9LFxuICAvKlxuICAgKiBTZXQgY29vcmRpbmF0ZXMgb2YgdGhlIHJ1bGVyIG1lYXN1cmVtZW50cyBzdGFydGluZyBwb2ludFxuICAgKi9cbiAgc2V0U3RhcnRpbmdDb29yZGluYXRlcyhjb29yZGluYXRlczogYW55KSB7XG4gICAgdGhpcy5zZXQoeyBzdGFydGluZ0Nvb3JkaW5hdGVzOiBjb29yZGluYXRlcyB9KVxuICB9LFxuICAvKlxuICAgKiBTZXRzIHRoZSBjdXJyZW50IGRpc3RhbmNlIHRvIHRoZSBuZXcgZ2l2ZW4gZGlzdGFuY2UgKGluIG1ldGVycykuXG4gICAqL1xuICBzZXRDdXJyZW50RGlzdGFuY2UoZGlzdGFuY2U6IGFueSkge1xuICAgIHRoaXMuc2V0KHsgY3VycmVudERpc3RhbmNlOiBkaXN0YW5jZSB9KVxuICB9LFxuICBhZGREaXN0YW5jZUluZm8oZGlzdGFuY2VJbmZvOiBhbnkpIHtcbiAgICB0aGlzLnNldCh7IGRpc3RhbmNlSW5mbyB9KVxuICB9LFxuICAvKlxuICAgKiBzZXQgdGhlIHBvc2l0aW9uIG9mIERpc3RhbmNlSW5mbyBpbiBweCByZWxhdGl2ZSB0byB0aGUgdG9wIGxlZnQgb2YgdGhlIENlc2l1bSBjb21wb25lbnRcbiAgICovXG4gIHNldERpc3RhbmNlSW5mb1Bvc2l0aW9uKGxlZnQ6IGFueSwgdG9wOiBhbnkpIHtcbiAgICB0aGlzLnNldCh7IGRpc3RhbmNlSW5mbzogeyBsZWZ0LCB0b3AgfSB9KVxuICB9LFxuICBpc09mZk1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ21vdXNlTGF0JykgPT09IHVuZGVmaW5lZFxuICB9LFxuICBjbGVhck1vdXNlQ29vcmRpbmF0ZXMoKSB7XG4gICAgdGhpcy5zZXQoe1xuICAgICAgbW91c2VMYXQ6IHVuZGVmaW5lZCxcbiAgICAgIG1vdXNlTG9uOiB1bmRlZmluZWQsXG4gICAgfSlcbiAgfSxcbiAgdXBkYXRlTW91c2VDb29yZGluYXRlcyhjb29yZGluYXRlczogYW55KSB7XG4gICAgdGhpcy5zZXQoe1xuICAgICAgbW91c2VMYXQ6IE51bWJlcihjb29yZGluYXRlcy5sYXQudG9GaXhlZCg2KSksIC8vIHdyYXAgaW4gTnVtYmVyIHRvIGNob3Agb2ZmIHRyYWlsaW5nIHplcm9cbiAgICAgIG1vdXNlTG9uOiBOdW1iZXIod3JhcE51bShjb29yZGluYXRlcy5sb24sIC0xODAsIDE4MCkudG9GaXhlZCg2KSksXG4gICAgfSlcbiAgfSxcbiAgdXBkYXRlQ2xpY2tDb29yZGluYXRlcygpIHtcbiAgICBjb25zdCBsYXQgPSB0aGlzLmdldCgnbW91c2VMYXQnKVxuICAgIGNvbnN0IGxvbiA9IHRoaXMuZ2V0KCdtb3VzZUxvbicpXG4gICAgY29uc3QgZG1zID0gYCR7bXRnZW8udG9MYXQobGF0KX0gJHttdGdlby50b0xvbihsb24pfWBcbiAgICBjb25zdCBtZ3JzID0gY29udmVydGVyLmlzSW5VUFNTcGFjZShsYXQpXG4gICAgICA/IHVuZGVmaW5lZFxuICAgICAgOiBjb252ZXJ0ZXIuTEx0b1VTTkcobGF0LCBsb24sIHVzbmdQcmVjaXNpb24pXG4gICAgY29uc3QgdXRtVXBzID0gY29udmVydGVyLkxMdG9VVE1VUFMobGF0LCBsb24pXG4gICAgdGhpcy5zZXQoe1xuICAgICAgY29vcmRpbmF0ZVZhbHVlczoge1xuICAgICAgICBsYXQsXG4gICAgICAgIGxvbixcbiAgICAgICAgZG1zLFxuICAgICAgICBtZ3JzLFxuICAgICAgICB1dG1VcHMsXG4gICAgICB9LFxuICAgIH0pXG4gIH0sXG59KVxuIl19