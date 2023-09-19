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
//# sourceMappingURL=visualizations.js.map