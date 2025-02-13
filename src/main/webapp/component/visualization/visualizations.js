import { __read, __spreadArray } from "tslib";
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
    return React.createElement(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
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
    return React.createElement(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
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
    return React.createElement(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
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
    return React.createElement(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
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
    return React.createElement(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
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
    return React.createElement(LinearProgress, { className: "w-full h-2", variant: "indeterminate" });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXphdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vdmlzdWFsaXphdGlvbnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sY0FBYyxNQUFNLDhCQUE4QixDQUFBO0FBV3pEOztHQUVHO0FBQ0gsSUFBTSxtQkFBbUIsR0FBRztJQUFDLGNBQVk7U0FBWixVQUFZLEVBQVoscUJBQVksRUFBWixJQUFZO1FBQVoseUJBQVk7O0lBQ2pDLElBQUEsS0FBQSxPQUE0QixLQUFLLENBQUMsUUFBUSxDQUFNLElBQUksQ0FBQyxJQUFBLEVBQXBELFNBQVMsUUFBQSxFQUFFLFlBQVksUUFBNkIsQ0FBQTtJQUUzRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSTtZQUM1QyxZQUFZLENBQUM7Z0JBQ1gsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUE7WUFDaEMsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUVOLElBQUksU0FBUyxFQUFFO1FBQ2IsT0FBTyxLQUFLLENBQUMsYUFBYSxPQUFuQixLQUFLLGlCQUFlLFNBQVMsVUFBSyxJQUFJLFdBQUM7S0FDL0M7SUFDRCxPQUFPLG9CQUFDLGNBQWMsSUFBQyxTQUFTLEVBQUMsWUFBWSxFQUFDLE9BQU8sRUFBQyxlQUFlLEdBQUcsQ0FBQTtBQUMxRSxDQUFDLENBQUE7QUFFRCxJQUFNLHVCQUF1QixHQUFHO0lBQUMsY0FBWTtTQUFaLFVBQVksRUFBWixxQkFBWSxFQUFaLElBQVk7UUFBWix5QkFBWTs7SUFDckMsSUFBQSxLQUFB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LEVBQUUsdUJBQXVCO1FBQzdCLElBQUksRUFBRSxXQUFXO1FBQ2pCLE9BQU8sRUFBRTtZQUNQLGdCQUFnQixFQUFFLFlBQVk7U0FDL0I7UUFDRCxRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsUUFBUTtRQUNaLEtBQUssRUFBRSxRQUFRO1FBQ2YsSUFBSSxFQUFFLG1CQUFtQjtRQUN6QixJQUFJLEVBQUUsYUFBYTtRQUNuQixPQUFPLEVBQUU7WUFDUCxnQkFBZ0IsRUFBRSxRQUFRO1NBQzNCO1FBQ0QsUUFBUSxFQUFFLElBQUk7S0FDZjtJQUNEO1FBQ0UsRUFBRSxFQUFFLFdBQVc7UUFDZixLQUFLLEVBQUUsV0FBVztRQUNsQixJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLElBQUksRUFBRSxzQkFBc0I7UUFDNUIsUUFBUSxFQUFFLElBQUk7S0FDZjtJQUNEO1FBQ0UsRUFBRSxFQUFFLFNBQVM7UUFDYixLQUFLLEVBQUUsU0FBUztRQUNoQixJQUFJLEVBQUUsb0JBQW9CO1FBQzFCLElBQUksRUFBRSxhQUFhO1FBQ25CLFFBQVEsRUFBRSxJQUFJO0tBQ2Y7SUFDRDtRQUNFLEVBQUUsRUFBRSxXQUFXO1FBQ2YsS0FBSyxFQUFFLFdBQVc7UUFDbEIsSUFBSSxFQUFFLFlBQVk7UUFDbEIsSUFBSSxFQUFFLHNCQUFzQjtRQUM1QixRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsVUFBVTtRQUNkLEtBQUssRUFBRSxVQUFVO1FBQ2pCLElBQUksRUFBRSxzQkFBc0I7UUFDNUIsSUFBSSxFQUFFLHFCQUFxQjtRQUMzQixRQUFRLEVBQUUsSUFBSTtLQUNmO0NBQ3FCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBMaW5lYXJQcm9ncmVzcyBmcm9tICdAbXVpL21hdGVyaWFsL0xpbmVhclByb2dyZXNzJ1xuXG50eXBlIFZpc3VhbGl6YXRpb25UeXBlID0ge1xuICBpZDogc3RyaW5nXG4gIHRpdGxlOiBzdHJpbmdcbiAgdmlldzogYW55XG4gIGljb246IHN0cmluZ1xuICBvcHRpb25zOiBhbnlcbiAgc2luZ3VsYXI6IGJvb2xlYW5cbn1cblxuLyoqXG4gKiBTd2FwcGluZyB0byBub3QgZG9pbmcgc3RyaW5nIGludGVycG9sYXRpb24gYW5kIGdlbmVyYXRpb24gb2YgZHluYW1pYyBpbXBvcnRzLCBhcyB0aGlzIGluY3JlYXNlcyBidWlsZCB0aW1lIGFuZCBlbmRzIHVwIHByb2R1Y2luZyBsYXJnZXIgYnVuZGxlcyBpbiB0aGUgZW5kIGRvd25zdHJlYW0uXG4gKi9cbmNvbnN0IER5bmFtaWNDZXNpdW1JbXBvcnQgPSAoLi4uYXJnczogYW55KSA9PiB7XG4gIGNvbnN0IFtDb21wb25lbnQsIHNldENvbXBvbmVudF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpbXBvcnQoYC4vbWFwcy9jZXNpdW0vY2VzaXVtLnZpZXdgKS50aGVuKChjb2RlKSA9PiB7XG4gICAgICBzZXRDb21wb25lbnQoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29kZS5DZXNpdW1NYXBWaWV3UmVhY3RcbiAgICAgIH0pXG4gICAgfSlcbiAgfSwgW10pXG5cbiAgaWYgKENvbXBvbmVudCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KENvbXBvbmVudCwgLi4uYXJncylcbiAgfVxuICByZXR1cm4gPExpbmVhclByb2dyZXNzIGNsYXNzTmFtZT1cInctZnVsbCBoLTJcIiB2YXJpYW50PVwiaW5kZXRlcm1pbmF0ZVwiIC8+XG59XG5cbmNvbnN0IER5bmFtaWNPcGVubGF5ZXJzSW1wb3J0ID0gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICBjb25zdCBbQ29tcG9uZW50LCBzZXRDb21wb25lbnRdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaW1wb3J0KCcuL21hcHMvb3BlbmxheWVycy9vcGVubGF5ZXJzLnZpZXcnKS50aGVuKChjb2RlKSA9PiB7XG4gICAgICBzZXRDb21wb25lbnQoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29kZS5PcGVubGF5ZXJzTWFwVmlld1JlYWN0XG4gICAgICB9KVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGlmIChDb21wb25lbnQpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChDb21wb25lbnQsIC4uLmFyZ3MpXG4gIH1cbiAgcmV0dXJuIDxMaW5lYXJQcm9ncmVzcyBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0yXCIgdmFyaWFudD1cImluZGV0ZXJtaW5hdGVcIiAvPlxufVxuXG5jb25zdCBEeW5hbWljSGlzdG9ncmFtSW1wb3J0ID0gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICBjb25zdCBbQ29tcG9uZW50LCBzZXRDb21wb25lbnRdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaW1wb3J0KCcuL2hpc3RvZ3JhbS9oaXN0b2dyYW0nKS50aGVuKChjb2RlKSA9PiB7XG4gICAgICBzZXRDb21wb25lbnQoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29kZS5IaXN0b2dyYW1cbiAgICAgIH0pXG4gICAgfSlcbiAgfSwgW10pXG5cbiAgaWYgKENvbXBvbmVudCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KENvbXBvbmVudCwgLi4uYXJncylcbiAgfVxuICByZXR1cm4gPExpbmVhclByb2dyZXNzIGNsYXNzTmFtZT1cInctZnVsbCBoLTJcIiB2YXJpYW50PVwiaW5kZXRlcm1pbmF0ZVwiIC8+XG59XG5cbmNvbnN0IER5bmFtaWNJbnNwZWN0b3JJbXBvcnQgPSAoLi4uYXJnczogYW55KSA9PiB7XG4gIGNvbnN0IFtDb21wb25lbnQsIHNldENvbXBvbmVudF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpbXBvcnQoJy4vaW5zcGVjdG9yL2F1ZGl0ZWQtaW5zcGVjdG9yJykudGhlbigoY29kZSkgPT4ge1xuICAgICAgc2V0Q29tcG9uZW50KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvZGUuQXVkaXRlZEluc3BlY3RvclxuICAgICAgfSlcbiAgICB9KVxuICB9LCBbXSlcblxuICBpZiAoQ29tcG9uZW50KSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29tcG9uZW50LCAuLi5hcmdzKVxuICB9XG4gIHJldHVybiA8TGluZWFyUHJvZ3Jlc3MgY2xhc3NOYW1lPVwidy1mdWxsIGgtMlwiIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCIgLz5cbn1cblxuY29uc3QgRHluYW1pY1Jlc3VsdHNJbXBvcnQgPSAoLi4uYXJnczogYW55KSA9PiB7XG4gIGNvbnN0IFtDb21wb25lbnQsIHNldENvbXBvbmVudF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpbXBvcnQoJy4vcmVzdWx0cy12aXN1YWwnKS50aGVuKChjb2RlKSA9PiB7XG4gICAgICBzZXRDb21wb25lbnQoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29kZS5kZWZhdWx0XG4gICAgICB9KVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGlmIChDb21wb25lbnQpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChDb21wb25lbnQsIC4uLmFyZ3MpXG4gIH1cbiAgcmV0dXJuIDxMaW5lYXJQcm9ncmVzcyBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0yXCIgdmFyaWFudD1cImluZGV0ZXJtaW5hdGVcIiAvPlxufVxuXG5jb25zdCBEeW5hbWljVGltZWxpbmVJbXBvcnQgPSAoLi4uYXJnczogYW55KSA9PiB7XG4gIGNvbnN0IFtDb21wb25lbnQsIHNldENvbXBvbmVudF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpbXBvcnQoJy4vdGltZWxpbmUvdGltZWxpbmUnKS50aGVuKChjb2RlKSA9PiB7XG4gICAgICBzZXRDb21wb25lbnQoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29kZS5kZWZhdWx0XG4gICAgICB9KVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGlmIChDb21wb25lbnQpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChDb21wb25lbnQsIC4uLmFyZ3MpXG4gIH1cbiAgcmV0dXJuIDxMaW5lYXJQcm9ncmVzcyBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0yXCIgdmFyaWFudD1cImluZGV0ZXJtaW5hdGVcIiAvPlxufVxuXG5leHBvcnQgY29uc3QgVmlzdWFsaXphdGlvbnMgPSBbXG4gIHtcbiAgICBpZDogJ29wZW5sYXllcnMnLFxuICAgIHRpdGxlOiAnMkQgTWFwJyxcbiAgICB2aWV3OiBEeW5hbWljT3BlbmxheWVyc0ltcG9ydCxcbiAgICBpY29uOiAnZmEgZmEtbWFwJyxcbiAgICBvcHRpb25zOiB7XG4gICAgICBkZXNpcmVkQ29udGFpbmVyOiAnb3BlbmxheWVycycsXG4gICAgfSxcbiAgICBzaW5ndWxhcjogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIGlkOiAnY2VzaXVtJyxcbiAgICB0aXRsZTogJzNEIE1hcCcsXG4gICAgdmlldzogRHluYW1pY0Nlc2l1bUltcG9ydCxcbiAgICBpY29uOiAnZmEgZmEtZ2xvYmUnLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGRlc2lyZWRDb250YWluZXI6ICdjZXNpdW0nLFxuICAgIH0sXG4gICAgc2luZ3VsYXI6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hpc3RvZ3JhbScsXG4gICAgdGl0bGU6ICdIaXN0b2dyYW0nLFxuICAgIGljb246ICdmYSBmYS1iYXItY2hhcnQnLFxuICAgIHZpZXc6IER5bmFtaWNIaXN0b2dyYW1JbXBvcnQsXG4gICAgc2luZ3VsYXI6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBpZDogJ3Jlc3VsdHMnLFxuICAgIHRpdGxlOiAnUmVzdWx0cycsXG4gICAgdmlldzogRHluYW1pY1Jlc3VsdHNJbXBvcnQsXG4gICAgaWNvbjogJ2ZhIGZhLXRhYmxlJyxcbiAgICBzaW5ndWxhcjogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIGlkOiAnaW5zcGVjdG9yJyxcbiAgICB0aXRsZTogJ0luc3BlY3RvcicsXG4gICAgaWNvbjogJ2ZhIGZhLWluZm8nLFxuICAgIHZpZXc6IER5bmFtaWNJbnNwZWN0b3JJbXBvcnQsXG4gICAgc2luZ3VsYXI6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBpZDogJ3RpbWVsaW5lJyxcbiAgICB0aXRsZTogJ1RpbWVsaW5lJyxcbiAgICBpY29uOiAnZmEgZmEtaG91cmdsYXNzLWhhbGYnLFxuICAgIHZpZXc6IER5bmFtaWNUaW1lbGluZUltcG9ydCxcbiAgICBzaW5ndWxhcjogdHJ1ZSxcbiAgfSxcbl0gYXMgVmlzdWFsaXphdGlvblR5cGVbXVxuIl19