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
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
// jshint ignore: start
// eslint-disable-next-line no-extra-semi
;
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        // @ts-expect-error ts-migrate(7015) FIXME: Element implicitly has an 'any' type because index... Remove this comment to see the full error message
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            // @ts-expect-error ts-migrate(7015) FIXME: Element implicitly has an 'any' type because index... Remove this comment to see the full error message
            window[vendors[x] + 'CancelAnimationFrame'] ||
                // @ts-expect-error ts-migrate(7015) FIXME: Element implicitly has an 'any' type because index... Remove this comment to see the full error message
                window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        // @ts-expect-error ts-migrate(2322) FIXME: Type '(callback: any, element: any) => number' is ... Remove this comment to see the full error message
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdEFuaW1hdGlvbkZyYW1lUG9seWZpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvcmVxdWVzdEFuaW1hdGlvbkZyYW1lUG9seWZpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLHVFQUF1RTtBQUN2RSwyRkFBMkY7QUFFM0YsdUZBQXVGO0FBRXZGLGNBQWM7QUFDZCx1QkFBdUI7QUFDdkIseUNBQXlDO0FBQ3pDLENBQUM7QUFBQSxDQUFDO0lBQ0EsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFBO0lBQ2hCLElBQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDeEUsbUpBQW1KO1FBQ25KLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLHVCQUF1QixDQUFDLENBQUE7UUFDM0UsTUFBTSxDQUFDLG9CQUFvQjtZQUN6QixtSkFBbUo7WUFDbkosTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQztnQkFDM0MsbUpBQW1KO2dCQUNuSixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLDZCQUE2QixDQUFDLENBQUE7S0FDckQ7SUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQjtRQUMvQixtSkFBbUo7UUFDbkosTUFBTSxDQUFDLHFCQUFxQixHQUFHLFVBQVUsUUFBYSxFQUFFLE9BQVk7WUFDbEUsSUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUNyQyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQTtZQUMxRCxJQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO2dCQUMzQixRQUFRLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFBO1lBQ2pDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUNkLFFBQVEsR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFBO1lBQ2hDLE9BQU8sRUFBRSxDQUFBO1FBQ1gsQ0FBQyxDQUFBO0lBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0I7UUFDOUIsTUFBTSxDQUFDLG9CQUFvQixHQUFHLFVBQVUsRUFBRTtZQUN4QyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFBO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLy8gaHR0cDovL3BhdWxpcmlzaC5jb20vMjAxMS9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWFuaW1hdGluZy9cbi8vIGh0dHA6Ly9teS5vcGVyYS5jb20vZW1vbGxlci9ibG9nLzIwMTEvMTIvMjAvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1lci1hbmltYXRpbmdcblxuLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlci4gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuXG4vLyBNSVQgbGljZW5zZVxuLy8ganNoaW50IGlnbm9yZTogc3RhcnRcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1leHRyYS1zZW1pXG47KGZ1bmN0aW9uICgpIHtcbiAgbGV0IGxhc3RUaW1lID0gMFxuICBjb25zdCB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXVxuICBmb3IgKGxldCB4ID0gMDsgeCA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNSkgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGluZGV4Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0gKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ11cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTUpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBpbmRleC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICB3aW5kb3dbdmVuZG9yc1t4XSArICdDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNSkgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGluZGV4Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHdpbmRvd1t2ZW5kb3JzW3hdICsgJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddXG4gIH1cblxuICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICcoY2FsbGJhY2s6IGFueSwgZWxlbWVudDogYW55KSA9PiBudW1iZXInIGlzIC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChjYWxsYmFjazogYW55LCBlbGVtZW50OiBhbnkpIHtcbiAgICAgIGNvbnN0IGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICAgIGNvbnN0IHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyVGltZSAtIGxhc3RUaW1lKSlcbiAgICAgIGNvbnN0IGlkID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpXG4gICAgICB9LCB0aW1lVG9DYWxsKVxuICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGxcbiAgICAgIHJldHVybiBpZFxuICAgIH1cblxuICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGNsZWFyVGltZW91dChpZClcbiAgICB9XG59KSgpXG4iXX0=