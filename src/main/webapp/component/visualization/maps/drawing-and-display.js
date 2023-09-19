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
import wreqr from '../../../js/wreqr';
import { useListenTo } from '../../selection-checkbox/useBackbone.hook';
import { useIsDrawing } from '../../singletons/drawing';
import { TypedUserInstance } from '../../singletons/TypedUser';
import { zoomToHome } from './home';
import LocationModel from '../../location-old/location-old';
import { useLazyResultsFilterTreeFromSelectionInterface } from '../../selection-interface/hooks';
export var SHAPE_ID_PREFIX = 'shape';
export var getIdFromModelForDisplay = function (_a) {
    var model = _a.model;
    return "".concat(SHAPE_ID_PREFIX, "-").concat(model.cid, "-display");
};
export var getIdFromModelForDrawing = function (_a) {
    var model = _a.model;
    return "".concat(SHAPE_ID_PREFIX, "-").concat(model.cid, "-drawing");
};
// from these all other drawings are constructed
var BasicDrawModeTypes = [
    'bbox',
    'circle',
    'line',
    'poly',
];
export var getLocationTypeFromModel = function (_a) {
    var model = _a.model;
    var type = model.get('type');
    return type;
};
export var getDrawModeFromModel = function (_a) {
    var model = _a.model;
    var mode = model.get('mode');
    if (BasicDrawModeTypes.includes(mode)) {
        return mode;
    }
    var fallbackType = getLocationTypeFromModel({ model: model });
    switch (fallbackType) {
        case 'BBOX':
            return 'bbox';
        case 'LINE':
            return 'line';
        case 'MULTIPOLYGON':
            return 'poly';
        case 'POINTRADIUS':
            return 'circle';
        case 'POINT':
            return 'circle';
        case 'POLYGON':
            return 'poly';
        default:
            return 'poly';
    }
};
export var getShapeFromDrawMode = function (drawMode) {
    switch (drawMode) {
        case 'bbox':
            return 'Bounding Box';
        case 'circle':
            return 'Point Radius';
        case 'line':
            return 'Line';
        case 'poly':
        default:
            return 'Polygon';
    }
};
export var getDrawModeFromShape = function (shape) {
    switch (shape) {
        case 'Bounding Box':
            return 'bbox';
        case 'Point':
        case 'Point Radius':
            return 'circle';
        case 'Line':
            return 'line';
        case 'Polygon':
        default:
            return 'poly';
    }
};
var extractModelsFromFilter = function (_a) {
    var _b, _c;
    var filter = _a.filter, extractedModels = _a.extractedModels;
    if (filter.filters) {
        filter.filters.forEach(function (subfilter) {
            extractModelsFromFilter({ filter: subfilter, extractedModels: extractedModels });
        });
    }
    else {
        if (filter.type === 'GEOMETRY') {
            if ((_c = (_b = filter.value) === null || _b === void 0 ? void 0 : _b.areaDetails) === null || _c === void 0 ? void 0 : _c.locations) {
                filter.value.areaDetails.locations.map(function (location) {
                    var newLocationModel = new LocationModel(location);
                    extractedModels.push(newLocationModel);
                });
            }
            else {
                var newLocationModel = new LocationModel(filter.value);
                extractedModels.push(newLocationModel);
            }
        }
    }
};
function useOnceIsNearFirstRender(_a) {
    var _b = _a.howNear, howNear = _b === void 0 ? 1000 : _b, callback = _a.callback;
    var _c = __read(React.useState(true), 2), firstRender = _c[0], setFirstRender = _c[1];
    var _d = __read(React.useState(false), 2), hasFired = _d[0], setHasFired = _d[1];
    React.useEffect(function () {
        setFirstRender(false);
    }, []);
    React.useEffect(function () {
        if (!firstRender && !hasFired) {
            var timeoutId_1 = window.setTimeout(function () {
                callback();
                setHasFired(true);
            }, howNear);
            return function () {
                window.clearTimeout(timeoutId_1);
            };
        }
        return function () { };
    }, [firstRender, howNear, hasFired, callback]);
}
export var useDrawingAndDisplayModels = function (_a) {
    var selectionInterface = _a.selectionInterface, map = _a.map;
    var _b = __read(React.useState([]), 2), models = _b[0], setModels = _b[1];
    var _c = __read(React.useState([]), 2), filterModels = _c[0], setFilterModels = _c[1];
    var _d = __read(React.useState([]), 2), drawingModels = _d[0], setDrawingModels = _d[1];
    var isDrawing = useIsDrawing();
    var filterTree = useLazyResultsFilterTreeFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    useListenTo(wreqr.vent, 'search:linedisplay search:polydisplay search:bboxdisplay search:circledisplay search:keyworddisplay', function (model) {
        if (Array.isArray(model)) {
            setModels(__spreadArray([], __read(models), false).concat(model.filter(function (newModel) { return !models.includes(newModel); })));
        }
        else if (!models.includes(model)) {
            setModels(__spreadArray(__spreadArray([], __read(models), false), [model], false));
        }
    });
    var updateFilterModels = React.useMemo(function () {
        return function () {
            var resultFilter = TypedUserInstance.getEphemeralFilter();
            var extractedModels = [];
            if (filterTree) {
                extractModelsFromFilter({
                    filter: filterTree,
                    extractedModels: extractedModels,
                });
            }
            if (resultFilter) {
                extractModelsFromFilter({
                    filter: resultFilter,
                    extractedModels: extractedModels,
                });
            }
            setFilterModels(extractedModels);
        };
    }, [filterTree]);
    React.useEffect(function () {
        updateFilterModels();
    }, [updateFilterModels]);
    useListenTo(selectionInterface, 'change:currentQuery', updateFilterModels);
    useListenTo(TypedUserInstance.getPreferences(), 'change:resultFilter', updateFilterModels);
    useListenTo(wreqr.vent, 'search:drawline search:drawpoly search:drawbbox search:drawcircle', function (model) {
        if (!drawingModels.includes(model)) {
            setDrawingModels(__spreadArray(__spreadArray([], __read(drawingModels), false), [model], false));
        }
    });
    useListenTo(wreqr.vent, 'search:line-end search:poly-end search:bbox-end search:circle-end search:drawcancel', function (model) {
        if (drawingModels.includes(model)) {
            setDrawingModels(drawingModels.filter(function (drawingModel) { return drawingModel !== model; }));
        }
    });
    React.useEffect(function () {
        if (!isDrawing) {
            setDrawingModels([]);
        }
    }, [isDrawing]);
    React.useEffect(function () {
        var timeoutId = window.setTimeout(function () {
            updateFilterModels();
        }, 1000);
        return function () {
            window.clearTimeout(timeoutId);
        };
    }, []);
    var callback = React.useMemo(function () {
        return function () {
            if (map) {
                var shapesExist = map.panToShapesExtent();
                if (!shapesExist) {
                    zoomToHome({ map: map });
                }
            }
        };
    }, [filterModels, models, map]);
    useOnceIsNearFirstRender({ callback: callback });
    return {
        models: models,
        drawingModels: drawingModels,
        filterModels: filterModels,
    };
};
//# sourceMappingURL=drawing-and-display.js.map