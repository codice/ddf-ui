import { __read, __spreadArray } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
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
import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
/**
 * Swapping to not doing string interpolation and generation of dynamic imports, as this increases build time and ends up producing larger bundles in the end downstream.
 */
var DynamicCesiumImport = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var _a = __read(React.useState(null), 2), Component = _a[0], setComponent = _a[1];
    React.useEffect(function () {
        import("./maps/cesium/cesium.view").then(function (code) {
            setComponent(function () {
                return code.CesiumMapViewReact;
            });
        });
    }, []);
    if (Component) {
        return React.createElement.apply(React, __spreadArray([Component], __read(args), false));
    }
    return _jsx(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
};
var DynamicOpenlayersImport = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var _a = __read(React.useState(null), 2), Component = _a[0], setComponent = _a[1];
    React.useEffect(function () {
        import('./maps/openlayers/openlayers.view').then(function (code) {
            setComponent(function () {
                return code.OpenlayersMapViewReact;
            });
        });
    }, []);
    if (Component) {
        return React.createElement.apply(React, __spreadArray([Component], __read(args), false));
    }
    return _jsx(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
};
var DynamicHistogramImport = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var _a = __read(React.useState(null), 2), Component = _a[0], setComponent = _a[1];
    React.useEffect(function () {
        import('./histogram/histogram').then(function (code) {
            setComponent(function () {
                return code.Histogram;
            });
        });
    }, []);
    if (Component) {
        return React.createElement.apply(React, __spreadArray([Component], __read(args), false));
    }
    return _jsx(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
};
var DynamicInspectorImport = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var _a = __read(React.useState(null), 2), Component = _a[0], setComponent = _a[1];
    React.useEffect(function () {
        import('./inspector/audited-inspector').then(function (code) {
            setComponent(function () {
                return code.AuditedInspector;
            });
        });
    }, []);
    if (Component) {
        return React.createElement.apply(React, __spreadArray([Component], __read(args), false));
    }
    return _jsx(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
};
var DynamicResultsImport = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var _a = __read(React.useState(null), 2), Component = _a[0], setComponent = _a[1];
    React.useEffect(function () {
        import('./results-visual').then(function (code) {
            setComponent(function () {
                return code.default;
            });
        });
    }, []);
    if (Component) {
        return React.createElement.apply(React, __spreadArray([Component], __read(args), false));
    }
    return _jsx(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
};
var DynamicTimelineImport = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var _a = __read(React.useState(null), 2), Component = _a[0], setComponent = _a[1];
    React.useEffect(function () {
        import('./timeline/timeline').then(function (code) {
            setComponent(function () {
                return code.default;
            });
        });
    }, []);
    if (Component) {
        return React.createElement.apply(React, __spreadArray([Component], __read(args), false));
    }
    return _jsx(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
};
export var Visualizations = [
    {
        id: 'openlayers',
        title: '2D Map',
        view: DynamicOpenlayersImport,
        icon: 'fa fa-map',
        options: {
            desiredContainer: 'openlayers',
        },
        singular: true,
    },
    {
        id: 'cesium',
        title: '3D Map',
        view: DynamicCesiumImport,
        icon: 'fa fa-globe',
        options: {
            desiredContainer: 'cesium',
        },
        singular: true,
    },
    {
        id: 'histogram',
        title: 'Histogram',
        icon: 'fa fa-bar-chart',
        view: DynamicHistogramImport,
        singular: true,
    },
    {
        id: 'results',
        title: 'Results',
        view: DynamicResultsImport,
        icon: 'fa fa-table',
        singular: true,
    },
    {
        id: 'inspector',
        title: 'Inspector',
        icon: 'fa fa-info',
        view: DynamicInspectorImport,
        singular: true,
    },
    {
        id: 'timeline',
        title: 'Timeline',
        icon: 'fa fa-hourglass-half',
        view: DynamicTimelineImport,
        singular: true,
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXphdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vdmlzdWFsaXphdGlvbnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQVd6RDs7R0FFRztBQUNILElBQU0sbUJBQW1CLEdBQUc7SUFBQyxjQUFZO1NBQVosVUFBWSxFQUFaLHFCQUFZLEVBQVosSUFBWTtRQUFaLHlCQUFZOztJQUNqQyxJQUFBLEtBQUEsT0FBNEIsS0FBSyxDQUFDLFFBQVEsQ0FBTSxJQUFJLENBQUMsSUFBQSxFQUFwRCxTQUFTLFFBQUEsRUFBRSxZQUFZLFFBQTZCLENBQUE7SUFFM0QsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUk7WUFDNUMsWUFBWSxDQUFDO2dCQUNYLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFBO1lBQ2hDLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFTixJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2QsT0FBTyxLQUFLLENBQUMsYUFBYSxPQUFuQixLQUFLLGlCQUFlLFNBQVMsVUFBSyxJQUFJLFdBQUM7SUFDaEQsQ0FBQztJQUNELE9BQU8sS0FBQyxjQUFjLElBQUMsU0FBUyxFQUFDLFlBQVksRUFBQyxPQUFPLEVBQUMsZUFBZSxHQUFHLENBQUE7QUFDMUUsQ0FBQyxDQUFBO0FBRUQsSUFBTSx1QkFBdUIsR0FBRztJQUFDLGNBQVk7U0FBWixVQUFZLEVBQVoscUJBQVksRUFBWixJQUFZO1FBQVoseUJBQVk7O0lBQ3JD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QUM1QjtRQUNFLEVBQUUsRUFBRSxZQUFZO1FBQ2hCLEtBQUssRUFBRSxRQUFRO1FBQ2YsSUFBSSxFQUFFLHVCQUF1QjtRQUM3QixJQUFJLEVBQUUsV0FBVztRQUNqQixPQUFPLEVBQUU7WUFDUCxnQkFBZ0IsRUFBRSxZQUFZO1NBQy9CO1FBQ0QsUUFBUSxFQUFFLElBQUk7S0FDZjtJQUNEO1FBQ0UsRUFBRSxFQUFFLFFBQVE7UUFDWixLQUFLLEVBQUUsUUFBUTtRQUNmLElBQUksRUFBRSxtQkFBbUI7UUFDekIsSUFBSSxFQUFFLGFBQWE7UUFDbkIsT0FBTyxFQUFFO1lBQ1AsZ0JBQWdCLEVBQUUsUUFBUTtTQUMzQjtRQUNELFFBQVEsRUFBRSxJQUFJO0tBQ2Y7SUFDRDtRQUNFLEVBQUUsRUFBRSxXQUFXO1FBQ2YsS0FBSyxFQUFFLFdBQVc7UUFDbEIsSUFBSSxFQUFFLGlCQUFpQjtRQUN2QixJQUFJLEVBQUUsc0JBQXNCO1FBQzVCLFFBQVEsRUFBRSxJQUFJO0tBQ2Y7SUFDRDtRQUNFLEVBQUUsRUFBRSxTQUFTO1FBQ2IsS0FBSyxFQUFFLFNBQVM7UUFDaEIsSUFBSSxFQUFFLG9CQUFvQjtRQUMxQixJQUFJLEVBQUUsYUFBYTtRQUNuQixRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsV0FBVztRQUNmLEtBQUssRUFBRSxXQUFXO1FBQ2xCLElBQUksRUFBRSxZQUFZO1FBQ2xCLElBQUksRUFBRSxzQkFBc0I7UUFDNUIsUUFBUSxFQUFFLElBQUk7S0FDZjtJQUNEO1FBQ0UsRUFBRSxFQUFFLFVBQVU7UUFDZCxLQUFLLEVBQUUsVUFBVTtRQUNqQixJQUFJLEVBQUUsc0JBQXNCO1FBQzVCLElBQUksRUFBRSxxQkFBcUI7UUFDM0IsUUFBUSxFQUFFLElBQUk7S0FDZjtDQUNxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcblxudHlwZSBWaXN1YWxpemF0aW9uVHlwZSA9IHtcbiAgaWQ6IHN0cmluZ1xuICB0aXRsZTogc3RyaW5nXG4gIHZpZXc6IGFueVxuICBpY29uOiBzdHJpbmdcbiAgb3B0aW9uczogYW55XG4gIHNpbmd1bGFyOiBib29sZWFuXG59XG5cbi8qKlxuICogU3dhcHBpbmcgdG8gbm90IGRvaW5nIHN0cmluZyBpbnRlcnBvbGF0aW9uIGFuZCBnZW5lcmF0aW9uIG9mIGR5bmFtaWMgaW1wb3J0cywgYXMgdGhpcyBpbmNyZWFzZXMgYnVpbGQgdGltZSBhbmQgZW5kcyB1cCBwcm9kdWNpbmcgbGFyZ2VyIGJ1bmRsZXMgaW4gdGhlIGVuZCBkb3duc3RyZWFtLlxuICovXG5jb25zdCBEeW5hbWljQ2VzaXVtSW1wb3J0ID0gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICBjb25zdCBbQ29tcG9uZW50LCBzZXRDb21wb25lbnRdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaW1wb3J0KGAuL21hcHMvY2VzaXVtL2Nlc2l1bS52aWV3YCkudGhlbigoY29kZSkgPT4ge1xuICAgICAgc2V0Q29tcG9uZW50KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvZGUuQ2VzaXVtTWFwVmlld1JlYWN0XG4gICAgICB9KVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGlmIChDb21wb25lbnQpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChDb21wb25lbnQsIC4uLmFyZ3MpXG4gIH1cbiAgcmV0dXJuIDxMaW5lYXJQcm9ncmVzcyBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0yXCIgdmFyaWFudD1cImluZGV0ZXJtaW5hdGVcIiAvPlxufVxuXG5jb25zdCBEeW5hbWljT3BlbmxheWVyc0ltcG9ydCA9ICguLi5hcmdzOiBhbnkpID0+IHtcbiAgY29uc3QgW0NvbXBvbmVudCwgc2V0Q29tcG9uZW50XSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGltcG9ydCgnLi9tYXBzL29wZW5sYXllcnMvb3BlbmxheWVycy52aWV3JykudGhlbigoY29kZSkgPT4ge1xuICAgICAgc2V0Q29tcG9uZW50KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvZGUuT3BlbmxheWVyc01hcFZpZXdSZWFjdFxuICAgICAgfSlcbiAgICB9KVxuICB9LCBbXSlcblxuICBpZiAoQ29tcG9uZW50KSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29tcG9uZW50LCAuLi5hcmdzKVxuICB9XG4gIHJldHVybiA8TGluZWFyUHJvZ3Jlc3MgY2xhc3NOYW1lPVwidy1mdWxsIGgtMlwiIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCIgLz5cbn1cblxuY29uc3QgRHluYW1pY0hpc3RvZ3JhbUltcG9ydCA9ICguLi5hcmdzOiBhbnkpID0+IHtcbiAgY29uc3QgW0NvbXBvbmVudCwgc2V0Q29tcG9uZW50XSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGltcG9ydCgnLi9oaXN0b2dyYW0vaGlzdG9ncmFtJykudGhlbigoY29kZSkgPT4ge1xuICAgICAgc2V0Q29tcG9uZW50KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvZGUuSGlzdG9ncmFtXG4gICAgICB9KVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGlmIChDb21wb25lbnQpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChDb21wb25lbnQsIC4uLmFyZ3MpXG4gIH1cbiAgcmV0dXJuIDxMaW5lYXJQcm9ncmVzcyBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0yXCIgdmFyaWFudD1cImluZGV0ZXJtaW5hdGVcIiAvPlxufVxuXG5jb25zdCBEeW5hbWljSW5zcGVjdG9ySW1wb3J0ID0gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICBjb25zdCBbQ29tcG9uZW50LCBzZXRDb21wb25lbnRdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaW1wb3J0KCcuL2luc3BlY3Rvci9hdWRpdGVkLWluc3BlY3RvcicpLnRoZW4oKGNvZGUpID0+IHtcbiAgICAgIHNldENvbXBvbmVudCgoKSA9PiB7XG4gICAgICAgIHJldHVybiBjb2RlLkF1ZGl0ZWRJbnNwZWN0b3JcbiAgICAgIH0pXG4gICAgfSlcbiAgfSwgW10pXG5cbiAgaWYgKENvbXBvbmVudCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KENvbXBvbmVudCwgLi4uYXJncylcbiAgfVxuICByZXR1cm4gPExpbmVhclByb2dyZXNzIGNsYXNzTmFtZT1cInctZnVsbCBoLTJcIiB2YXJpYW50PVwiaW5kZXRlcm1pbmF0ZVwiIC8+XG59XG5cbmNvbnN0IER5bmFtaWNSZXN1bHRzSW1wb3J0ID0gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICBjb25zdCBbQ29tcG9uZW50LCBzZXRDb21wb25lbnRdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaW1wb3J0KCcuL3Jlc3VsdHMtdmlzdWFsJykudGhlbigoY29kZSkgPT4ge1xuICAgICAgc2V0Q29tcG9uZW50KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvZGUuZGVmYXVsdFxuICAgICAgfSlcbiAgICB9KVxuICB9LCBbXSlcblxuICBpZiAoQ29tcG9uZW50KSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29tcG9uZW50LCAuLi5hcmdzKVxuICB9XG4gIHJldHVybiA8TGluZWFyUHJvZ3Jlc3MgY2xhc3NOYW1lPVwidy1mdWxsIGgtMlwiIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCIgLz5cbn1cblxuY29uc3QgRHluYW1pY1RpbWVsaW5lSW1wb3J0ID0gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICBjb25zdCBbQ29tcG9uZW50LCBzZXRDb21wb25lbnRdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaW1wb3J0KCcuL3RpbWVsaW5lL3RpbWVsaW5lJykudGhlbigoY29kZSkgPT4ge1xuICAgICAgc2V0Q29tcG9uZW50KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvZGUuZGVmYXVsdFxuICAgICAgfSlcbiAgICB9KVxuICB9LCBbXSlcblxuICBpZiAoQ29tcG9uZW50KSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29tcG9uZW50LCAuLi5hcmdzKVxuICB9XG4gIHJldHVybiA8TGluZWFyUHJvZ3Jlc3MgY2xhc3NOYW1lPVwidy1mdWxsIGgtMlwiIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCIgLz5cbn1cblxuZXhwb3J0IGNvbnN0IFZpc3VhbGl6YXRpb25zID0gW1xuICB7XG4gICAgaWQ6ICdvcGVubGF5ZXJzJyxcbiAgICB0aXRsZTogJzJEIE1hcCcsXG4gICAgdmlldzogRHluYW1pY09wZW5sYXllcnNJbXBvcnQsXG4gICAgaWNvbjogJ2ZhIGZhLW1hcCcsXG4gICAgb3B0aW9uczoge1xuICAgICAgZGVzaXJlZENvbnRhaW5lcjogJ29wZW5sYXllcnMnLFxuICAgIH0sXG4gICAgc2luZ3VsYXI6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2Nlc2l1bScsXG4gICAgdGl0bGU6ICczRCBNYXAnLFxuICAgIHZpZXc6IER5bmFtaWNDZXNpdW1JbXBvcnQsXG4gICAgaWNvbjogJ2ZhIGZhLWdsb2JlJyxcbiAgICBvcHRpb25zOiB7XG4gICAgICBkZXNpcmVkQ29udGFpbmVyOiAnY2VzaXVtJyxcbiAgICB9LFxuICAgIHNpbmd1bGFyOiB0cnVlLFxuICB9LFxuICB7XG4gICAgaWQ6ICdoaXN0b2dyYW0nLFxuICAgIHRpdGxlOiAnSGlzdG9ncmFtJyxcbiAgICBpY29uOiAnZmEgZmEtYmFyLWNoYXJ0JyxcbiAgICB2aWV3OiBEeW5hbWljSGlzdG9ncmFtSW1wb3J0LFxuICAgIHNpbmd1bGFyOiB0cnVlLFxuICB9LFxuICB7XG4gICAgaWQ6ICdyZXN1bHRzJyxcbiAgICB0aXRsZTogJ1Jlc3VsdHMnLFxuICAgIHZpZXc6IER5bmFtaWNSZXN1bHRzSW1wb3J0LFxuICAgIGljb246ICdmYSBmYS10YWJsZScsXG4gICAgc2luZ3VsYXI6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2luc3BlY3RvcicsXG4gICAgdGl0bGU6ICdJbnNwZWN0b3InLFxuICAgIGljb246ICdmYSBmYS1pbmZvJyxcbiAgICB2aWV3OiBEeW5hbWljSW5zcGVjdG9ySW1wb3J0LFxuICAgIHNpbmd1bGFyOiB0cnVlLFxuICB9LFxuICB7XG4gICAgaWQ6ICd0aW1lbGluZScsXG4gICAgdGl0bGU6ICdUaW1lbGluZScsXG4gICAgaWNvbjogJ2ZhIGZhLWhvdXJnbGFzcy1oYWxmJyxcbiAgICB2aWV3OiBEeW5hbWljVGltZWxpbmVJbXBvcnQsXG4gICAgc2luZ3VsYXI6IHRydWUsXG4gIH0sXG5dIGFzIFZpc3VhbGl6YXRpb25UeXBlW11cbiJdfQ==