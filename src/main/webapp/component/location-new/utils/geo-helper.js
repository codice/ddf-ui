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
import wkx from 'wkx';
function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}
function radiansToDegrees(radians) {
    return (radians * 180) / Math.PI;
}
/*
 * Constants used for the calculations below:
 * R is Earth's approximate radius. Assumes a perfect circle, which will produce at most 0.5% error
 */
var R = 6371.01;
/*
 * Given a starting point, initial bearing, and distance travelled, returns the destination point
 * reached by travelling the given distance along a great circle arc at that bearing.
 * Reference: https://www.movable-type.co.uk/scripts/latlong.html#destPoint
 * @param point: wkx Point
 * @param bearing: degrees from north
 * @param distance: kilometers
 */
function computeDestination(point, bearing, distance) {
    if (distance < 0) {
        return null;
    }
    var lat1 = degreesToRadians(point.y);
    var lon1 = degreesToRadians(point.x);
    var radBearing = degreesToRadians(bearing);
    var radDistance = distance / R;
    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(radDistance) +
        Math.cos(lat1) * Math.sin(radDistance) * Math.cos(radBearing));
    var lon2 = lon1 +
        Math.atan2(Math.sin(radBearing) * Math.sin(radDistance) * Math.cos(lat1), Math.cos(radDistance) - Math.sin(lat1) * Math.sin(lat2));
    if (isNaN(lat2) || isNaN(lon2)) {
        return null;
    }
    lat2 = radiansToDegrees(lat2);
    lon2 = radiansToDegrees(lon2);
    if (lon2 > 180 || lon2 < -180) {
        lon2 = ((lon2 + 540) % 360) - 180;
    }
    return new wkx.Point(lon2, lat2);
}
/*
 * TODO: Use Spatial4j buffered point, e.g. BUFFER(POINT(0 0), 10), instead of approximating circle
 * Given a point and distance, returns an n-point polygon approximating a circle surrounding the
 * point with radius equal to the input distance.
 * @param point: wkx Point
 * @param distance: kilometers
 * @param n: number of points used to approximate the circle
 */
export function computeCircle(point, distance, n) {
    if (distance < 0 || n < 0) {
        return null;
    }
    var points = [];
    for (var i = 0; i < n; i++) {
        points.push(computeDestination(point, (360 * i) / n, distance));
    }
    points.push(points[0]);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(Point | null)[]' is not assigna... Remove this comment to see the full error message
    return new wkx.Polygon(points);
}
/*
 * Converts the given distance to kilometers. All conversions are exact. Note that the
 * international definition for nautical mile is used (1 nautical mile = 1852 meters).
 * Reference: https://www.sfei.org/it/gis/map-interpretation/conversion-constants
 */
export function toKilometers(distance, units) {
    switch (units) {
        case 'meters':
            return distance / 1000;
        case 'kilometers':
            return distance;
        case 'feet':
            return distance * 0.0003048;
        case 'yards':
            return distance * 0.0009144;
        case 'miles':
            return distance * 1.609344;
        case 'nautical miles':
            return distance * 1.852;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvbG9jYXRpb24tbmV3L3V0aWxzL2dlby1oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQTtBQUVyQixTQUFTLGdCQUFnQixDQUFDLE9BQVk7SUFDcEMsT0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO0FBQ2xDLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLE9BQVk7SUFDcEMsT0FBTyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBO0FBQ2xDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUE7QUFFakI7Ozs7Ozs7R0FPRztBQUNILFNBQVMsa0JBQWtCLENBQUMsS0FBVSxFQUFFLE9BQVksRUFBRSxRQUFhO0lBQ2pFLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtRQUNoQixPQUFPLElBQUksQ0FBQTtLQUNaO0lBRUQsSUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RDLElBQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0QyxJQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUM1QyxJQUFNLFdBQVcsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFBO0lBRWhDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQ2hFLENBQUE7SUFDRCxJQUFJLElBQUksR0FDTixJQUFJO1FBQ0osSUFBSSxDQUFDLEtBQUssQ0FDUixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFDN0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQ3hELENBQUE7SUFDSCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDOUIsT0FBTyxJQUFJLENBQUE7S0FDWjtJQUVELElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QixJQUFJLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0IsSUFBSSxJQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtRQUM3QixJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7S0FDbEM7SUFDRCxPQUFPLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDbEMsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsYUFBYSxDQUFDLEtBQVUsRUFBRSxRQUFhLEVBQUUsQ0FBTTtJQUM3RCxJQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6QixPQUFPLElBQUksQ0FBQTtLQUNaO0lBRUQsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO0lBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUE7S0FDaEU7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RCLG1KQUFtSjtJQUNuSixPQUFPLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNoQyxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQUMsUUFBYSxFQUFFLEtBQVU7SUFDcEQsUUFBUSxLQUFLLEVBQUU7UUFDYixLQUFLLFFBQVE7WUFDWCxPQUFPLFFBQVEsR0FBRyxJQUFJLENBQUE7UUFDeEIsS0FBSyxZQUFZO1lBQ2YsT0FBTyxRQUFRLENBQUE7UUFDakIsS0FBSyxNQUFNO1lBQ1QsT0FBTyxRQUFRLEdBQUcsU0FBUyxDQUFBO1FBQzdCLEtBQUssT0FBTztZQUNWLE9BQU8sUUFBUSxHQUFHLFNBQVMsQ0FBQTtRQUM3QixLQUFLLE9BQU87WUFDVixPQUFPLFFBQVEsR0FBRyxRQUFRLENBQUE7UUFDNUIsS0FBSyxnQkFBZ0I7WUFDbkIsT0FBTyxRQUFRLEdBQUcsS0FBSyxDQUFBO0tBQzFCO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHdreCBmcm9tICd3a3gnXG5cbmZ1bmN0aW9uIGRlZ3JlZXNUb1JhZGlhbnMoZGVncmVlczogYW55KSB7XG4gIHJldHVybiAoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwXG59XG5cbmZ1bmN0aW9uIHJhZGlhbnNUb0RlZ3JlZXMocmFkaWFuczogYW55KSB7XG4gIHJldHVybiAocmFkaWFucyAqIDE4MCkgLyBNYXRoLlBJXG59XG5cbi8qXG4gKiBDb25zdGFudHMgdXNlZCBmb3IgdGhlIGNhbGN1bGF0aW9ucyBiZWxvdzpcbiAqIFIgaXMgRWFydGgncyBhcHByb3hpbWF0ZSByYWRpdXMuIEFzc3VtZXMgYSBwZXJmZWN0IGNpcmNsZSwgd2hpY2ggd2lsbCBwcm9kdWNlIGF0IG1vc3QgMC41JSBlcnJvclxuICovXG5jb25zdCBSID0gNjM3MS4wMVxuXG4vKlxuICogR2l2ZW4gYSBzdGFydGluZyBwb2ludCwgaW5pdGlhbCBiZWFyaW5nLCBhbmQgZGlzdGFuY2UgdHJhdmVsbGVkLCByZXR1cm5zIHRoZSBkZXN0aW5hdGlvbiBwb2ludFxuICogcmVhY2hlZCBieSB0cmF2ZWxsaW5nIHRoZSBnaXZlbiBkaXN0YW5jZSBhbG9uZyBhIGdyZWF0IGNpcmNsZSBhcmMgYXQgdGhhdCBiZWFyaW5nLlxuICogUmVmZXJlbmNlOiBodHRwczovL3d3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWwjZGVzdFBvaW50XG4gKiBAcGFyYW0gcG9pbnQ6IHdreCBQb2ludFxuICogQHBhcmFtIGJlYXJpbmc6IGRlZ3JlZXMgZnJvbSBub3J0aFxuICogQHBhcmFtIGRpc3RhbmNlOiBraWxvbWV0ZXJzXG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVEZXN0aW5hdGlvbihwb2ludDogYW55LCBiZWFyaW5nOiBhbnksIGRpc3RhbmNlOiBhbnkpIHtcbiAgaWYgKGRpc3RhbmNlIDwgMCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBsYXQxID0gZGVncmVlc1RvUmFkaWFucyhwb2ludC55KVxuICBjb25zdCBsb24xID0gZGVncmVlc1RvUmFkaWFucyhwb2ludC54KVxuICBjb25zdCByYWRCZWFyaW5nID0gZGVncmVlc1RvUmFkaWFucyhiZWFyaW5nKVxuICBjb25zdCByYWREaXN0YW5jZSA9IGRpc3RhbmNlIC8gUlxuXG4gIGxldCBsYXQyID0gTWF0aC5hc2luKFxuICAgIE1hdGguc2luKGxhdDEpICogTWF0aC5jb3MocmFkRGlzdGFuY2UpICtcbiAgICAgIE1hdGguY29zKGxhdDEpICogTWF0aC5zaW4ocmFkRGlzdGFuY2UpICogTWF0aC5jb3MocmFkQmVhcmluZylcbiAgKVxuICBsZXQgbG9uMiA9XG4gICAgbG9uMSArXG4gICAgTWF0aC5hdGFuMihcbiAgICAgIE1hdGguc2luKHJhZEJlYXJpbmcpICogTWF0aC5zaW4ocmFkRGlzdGFuY2UpICogTWF0aC5jb3MobGF0MSksXG4gICAgICBNYXRoLmNvcyhyYWREaXN0YW5jZSkgLSBNYXRoLnNpbihsYXQxKSAqIE1hdGguc2luKGxhdDIpXG4gICAgKVxuICBpZiAoaXNOYU4obGF0MikgfHwgaXNOYU4obG9uMikpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgbGF0MiA9IHJhZGlhbnNUb0RlZ3JlZXMobGF0MilcbiAgbG9uMiA9IHJhZGlhbnNUb0RlZ3JlZXMobG9uMilcbiAgaWYgKGxvbjIgPiAxODAgfHwgbG9uMiA8IC0xODApIHtcbiAgICBsb24yID0gKChsb24yICsgNTQwKSAlIDM2MCkgLSAxODBcbiAgfVxuICByZXR1cm4gbmV3IHdreC5Qb2ludChsb24yLCBsYXQyKVxufVxuXG4vKlxuICogVE9ETzogVXNlIFNwYXRpYWw0aiBidWZmZXJlZCBwb2ludCwgZS5nLiBCVUZGRVIoUE9JTlQoMCAwKSwgMTApLCBpbnN0ZWFkIG9mIGFwcHJveGltYXRpbmcgY2lyY2xlXG4gKiBHaXZlbiBhIHBvaW50IGFuZCBkaXN0YW5jZSwgcmV0dXJucyBhbiBuLXBvaW50IHBvbHlnb24gYXBwcm94aW1hdGluZyBhIGNpcmNsZSBzdXJyb3VuZGluZyB0aGVcbiAqIHBvaW50IHdpdGggcmFkaXVzIGVxdWFsIHRvIHRoZSBpbnB1dCBkaXN0YW5jZS5cbiAqIEBwYXJhbSBwb2ludDogd2t4IFBvaW50XG4gKiBAcGFyYW0gZGlzdGFuY2U6IGtpbG9tZXRlcnNcbiAqIEBwYXJhbSBuOiBudW1iZXIgb2YgcG9pbnRzIHVzZWQgdG8gYXBwcm94aW1hdGUgdGhlIGNpcmNsZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUNpcmNsZShwb2ludDogYW55LCBkaXN0YW5jZTogYW55LCBuOiBhbnkpIHtcbiAgaWYgKGRpc3RhbmNlIDwgMCB8fCBuIDwgMCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBwb2ludHMgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgIHBvaW50cy5wdXNoKGNvbXB1dGVEZXN0aW5hdGlvbihwb2ludCwgKDM2MCAqIGkpIC8gbiwgZGlzdGFuY2UpKVxuICB9XG4gIHBvaW50cy5wdXNoKHBvaW50c1swXSlcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICcoUG9pbnQgfCBudWxsKVtdJyBpcyBub3QgYXNzaWduYS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gIHJldHVybiBuZXcgd2t4LlBvbHlnb24ocG9pbnRzKVxufVxuXG4vKlxuICogQ29udmVydHMgdGhlIGdpdmVuIGRpc3RhbmNlIHRvIGtpbG9tZXRlcnMuIEFsbCBjb252ZXJzaW9ucyBhcmUgZXhhY3QuIE5vdGUgdGhhdCB0aGVcbiAqIGludGVybmF0aW9uYWwgZGVmaW5pdGlvbiBmb3IgbmF1dGljYWwgbWlsZSBpcyB1c2VkICgxIG5hdXRpY2FsIG1pbGUgPSAxODUyIG1ldGVycykuXG4gKiBSZWZlcmVuY2U6IGh0dHBzOi8vd3d3LnNmZWkub3JnL2l0L2dpcy9tYXAtaW50ZXJwcmV0YXRpb24vY29udmVyc2lvbi1jb25zdGFudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvS2lsb21ldGVycyhkaXN0YW5jZTogYW55LCB1bml0czogYW55KSB7XG4gIHN3aXRjaCAodW5pdHMpIHtcbiAgICBjYXNlICdtZXRlcnMnOlxuICAgICAgcmV0dXJuIGRpc3RhbmNlIC8gMTAwMFxuICAgIGNhc2UgJ2tpbG9tZXRlcnMnOlxuICAgICAgcmV0dXJuIGRpc3RhbmNlXG4gICAgY2FzZSAnZmVldCc6XG4gICAgICByZXR1cm4gZGlzdGFuY2UgKiAwLjAwMDMwNDhcbiAgICBjYXNlICd5YXJkcyc6XG4gICAgICByZXR1cm4gZGlzdGFuY2UgKiAwLjAwMDkxNDRcbiAgICBjYXNlICdtaWxlcyc6XG4gICAgICByZXR1cm4gZGlzdGFuY2UgKiAxLjYwOTM0NFxuICAgIGNhc2UgJ25hdXRpY2FsIG1pbGVzJzpcbiAgICAgIHJldHVybiBkaXN0YW5jZSAqIDEuODUyXG4gIH1cbn1cbiJdfQ==