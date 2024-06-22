import { __read, __spreadArray, __values } from "tslib";
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
import { useBackbone, useListenTo, } from '../../selection-checkbox/useBackbone.hook';
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
    var filter = _a.filter, extractedModels = _a.extractedModels, listenTo = _a.listenTo, onChange = _a.onChange;
    if (filter.filters) {
        filter.filters.forEach(function (subfilter) {
            extractModelsFromFilter({
                filter: subfilter,
                extractedModels: extractedModels,
                listenTo: listenTo,
                onChange: onChange,
            });
        });
    }
    else {
        if (filter.type === 'GEOMETRY') {
            if ((_c = (_b = filter.value) === null || _b === void 0 ? void 0 : _b.areaDetails) === null || _c === void 0 ? void 0 : _c.locations) {
                filter.value.areaDetails.locations.map(function (location) {
                    var newLocationModel = new LocationModel(location);
                    newLocationModel.set('locationId', undefined);
                    extractedModels.push(newLocationModel);
                });
            }
            else {
                var newLocationModel = new LocationModel(filter.value);
                if (newLocationModel.get('hasKeyword')) {
                    newLocationModel.set('locationId', undefined);
                }
                else {
                    listenTo === null || listenTo === void 0 ? void 0 : listenTo(newLocationModel, 'change:mapNorth change:mapSouth change:mapEast change:mapWest change:lat change:lon change:line change:polygon', function (model) {
                        filter.value = model.toJSON();
                        onChange === null || onChange === void 0 ? void 0 : onChange();
                    });
                }
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
    // All of these arrays hold different sets of the same models, but where they come from differs
    // models are from geometry inputs that are in the dom aka textfields etc. (aka, someone is editing a geo input)
    var _b = __read(React.useState([]), 2), models = _b[0], setModels = _b[1];
    // filter models are grabbed from the filter tree on a search
    var _c = __read(React.useState([]), 2), filterModels = _c[0], setFilterModels = _c[1];
    // drawing models are when the user is actively drawing / editing a shape on the maps themselves (aka the draw tools)
    var _d = __read(React.useState([]), 2), drawingModels = _d[0], setDrawingModels = _d[1];
    var isDrawing = useIsDrawing();
    var filterTree = useLazyResultsFilterTreeFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var _e = useBackbone(), listenTo = _e.listenTo, stopListening = _e.stopListening;
    useListenTo(wreqr.vent, 'search:linedisplay search:polydisplay search:bboxdisplay search:circledisplay search:keyworddisplay search:areadisplay', function (model) {
        setModels(function (currentModels) {
            var newModels = currentModels;
            if (Array.isArray(model)) {
                newModels = currentModels.concat(model.filter(function (newModel) { return !currentModels.includes(newModel); }));
            }
            else if (!currentModels.includes(model)) {
                newModels = __spreadArray(__spreadArray([], __read(currentModels), false), [model], false);
            }
            return newModels;
        });
    });
    useListenTo(wreqr.vent, 'search:removedisplay', function (model) {
        setModels(function (currentModels) {
            var newModels;
            if (Array.isArray(model)) {
                newModels = currentModels.filter(function (m) { return !model.includes(m); });
            }
            else {
                newModels = currentModels.filter(function (m) { return m !== model; });
            }
            return newModels;
        });
    });
    React.useEffect(function () {
        ;
        wreqr.vent.trigger('search:requestlocationmodels');
    }, []);
    var updateFilterModels = React.useCallback(function () {
        var e_1, _a;
        try {
            for (var filterModels_1 = __values(filterModels), filterModels_1_1 = filterModels_1.next(); !filterModels_1_1.done; filterModels_1_1 = filterModels_1.next()) {
                var model = filterModels_1_1.value;
                stopListening(model);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (filterModels_1_1 && !filterModels_1_1.done && (_a = filterModels_1.return)) _a.call(filterModels_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var resultFilter = TypedUserInstance.getEphemeralFilter();
        var extractedModels = [];
        if (filterTree) {
            extractModelsFromFilter({
                filter: filterTree,
                extractedModels: extractedModels,
            });
        }
        if (resultFilter) {
            // We have to use this alternate method of updating the filter when dealing with
            // the resultFilter. When the location input is unmounted, it resets its location
            // model and removes it from here via the search:removedisplay event, so we can't
            // use it to update the filter. The location input is unmounted when the result
            // filter menu is closed, which it usually is. So, we update the filter in the
            // prefs model ourselves, which causes this function to be run again with the new
            // filter, and we can display it correctly.
            extractModelsFromFilter({
                filter: resultFilter,
                extractedModels: extractedModels,
                listenTo: listenTo,
                onChange: function () {
                    TypedUserInstance.getPreferences().set('resultFilter', JSON.parse(JSON.stringify(resultFilter)));
                    TypedUserInstance.savePreferences();
                },
            });
        }
        // If we have a model for a particular locationId in both models and filterModels,
        // then keep only the one in models, since that is the source of truth. Removing
        // the one in filterModels prevents some flickering when releasing the mouse on a
        // move operation.
        var locationIds = new Set(models.map(function (m) { return m.get('locationId'); }));
        var dedupedModels = extractedModels.filter(function (m) { return !locationIds.has(m.get('locationId')); });
        setFilterModels(dedupedModels);
    }, [filterTree, models]);
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
    useListenTo(wreqr.vent, 'search:line-end search:poly-end search:bbox-end search:circle-end search:drawcancel search:drawend', function (model) {
        if (!Array.isArray(model)) {
            model = [model];
        }
        model.forEach(function (submodel) {
            if (drawingModels.includes(submodel)) {
                setDrawingModels(drawingModels.filter(function (drawingModel) { return drawingModel !== submodel; }));
            }
        });
    });
    React.useEffect(function () {
        if (map && isDrawing) {
            ;
            wreqr.vent.trigger('search:requestdrawingmodels');
        }
    }, [map]);
    React.useEffect(function () {
        if (!isDrawing) {
            setDrawingModels([]);
        }
    }, [isDrawing]);
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