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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy1hbmQtZGlzcGxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2RyYXdpbmctYW5kLWRpc3BsYXkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sS0FBSyxNQUFNLG1CQUFtQixDQUFBO0FBQ3JDLE9BQU8sRUFDTCxXQUFXLEVBQ1gsV0FBVyxHQUNaLE1BQU0sMkNBQTJDLENBQUE7QUFDbEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ3ZELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFBO0FBQzlELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDbkMsT0FBTyxhQUFhLE1BQU0saUNBQWlDLENBQUE7QUFFM0QsT0FBTyxFQUFFLDhDQUE4QyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFFaEcsTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQTtBQUN0QyxNQUFNLENBQUMsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBQXlCO1FBQXZCLEtBQUssV0FBQTtJQUM5QyxPQUFPLFVBQUcsZUFBZSxjQUFJLEtBQUssQ0FBQyxHQUFHLGFBQVUsQ0FBQTtBQUNsRCxDQUFDLENBQUE7QUFDRCxNQUFNLENBQUMsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBQXlCO1FBQXZCLEtBQUssV0FBQTtJQUM5QyxPQUFPLFVBQUcsZUFBZSxjQUFJLEtBQUssQ0FBQyxHQUFHLGFBQVUsQ0FBQTtBQUNsRCxDQUFDLENBQUE7QUFFRCxnREFBZ0Q7QUFDaEQsSUFBTSxrQkFBa0IsR0FBd0I7SUFDOUMsTUFBTTtJQUNOLFFBQVE7SUFDUixNQUFNO0lBQ04s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QTtRQUNiLFlBQVksY0FBQTtLQUNiLENBQUE7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi8uLi9qcy93cmVxcidcbmltcG9ydCB7XG4gIHVzZUJhY2tib25lLFxuICB1c2VMaXN0ZW5Ubyxcbn0gZnJvbSAnLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyB1c2VJc0RyYXdpbmcgfSBmcm9tICcuLi8uLi9zaW5nbGV0b25zL2RyYXdpbmcnXG5pbXBvcnQgeyBUeXBlZFVzZXJJbnN0YW5jZSB9IGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvVHlwZWRVc2VyJ1xuaW1wb3J0IHsgem9vbVRvSG9tZSB9IGZyb20gJy4vaG9tZSdcbmltcG9ydCBMb2NhdGlvbk1vZGVsIGZyb20gJy4uLy4uL2xvY2F0aW9uLW9sZC9sb2NhdGlvbi1vbGQnXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJ2dlb3NwYXRpYWxkcmF3L3RhcmdldC93ZWJhcHAvc2hhcGUtdXRpbHMnXG5pbXBvcnQgeyB1c2VMYXp5UmVzdWx0c0ZpbHRlclRyZWVGcm9tU2VsZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vc2VsZWN0aW9uLWludGVyZmFjZS9ob29rcydcbmltcG9ydCB7IEV2ZW50SGFuZGxlciB9IGZyb20gJ2JhY2tib25lJ1xuZXhwb3J0IGNvbnN0IFNIQVBFX0lEX1BSRUZJWCA9ICdzaGFwZSdcbmV4cG9ydCBjb25zdCBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkgPSAoeyBtb2RlbCB9OiB7IG1vZGVsOiBhbnkgfSkgPT4ge1xuICByZXR1cm4gYCR7U0hBUEVfSURfUFJFRklYfS0ke21vZGVsLmNpZH0tZGlzcGxheWBcbn1cbmV4cG9ydCBjb25zdCBnZXRJZEZyb21Nb2RlbEZvckRyYXdpbmcgPSAoeyBtb2RlbCB9OiB7IG1vZGVsOiBhbnkgfSkgPT4ge1xuICByZXR1cm4gYCR7U0hBUEVfSURfUFJFRklYfS0ke21vZGVsLmNpZH0tZHJhd2luZ2Bcbn1cbmV4cG9ydCB0eXBlIERyYXdNb2RlVHlwZSA9ICdsaW5lJyB8ICdwb2x5JyB8ICdjaXJjbGUnIHwgJ2Jib3gnIHwgJ2tleXdvcmQnXG4vLyBmcm9tIHRoZXNlIGFsbCBvdGhlciBkcmF3aW5ncyBhcmUgY29uc3RydWN0ZWRcbmNvbnN0IEJhc2ljRHJhd01vZGVUeXBlczogQXJyYXk8RHJhd01vZGVUeXBlPiA9IFtcbiAgJ2Jib3gnLFxuICAnY2lyY2xlJyxcbiAgJ2xpbmUnLFxuICAncG9seScsXG5dXG50eXBlIExvY2F0aW9uVHlwZVR5cGUgPVxuICB8ICdMSU5FJ1xuICB8ICdQT0xZR09OJ1xuICB8ICdNVUxUSVBPTFlHT04nXG4gIHwgJ0JCT1gnXG4gIHwgJ1BPSU5UUkFESVVTJ1xuICB8ICdQT0lOVCdcbmV4cG9ydCBjb25zdCBnZXRMb2NhdGlvblR5cGVGcm9tTW9kZWwgPSAoeyBtb2RlbCB9OiB7IG1vZGVsOiBhbnkgfSkgPT4ge1xuICBjb25zdCB0eXBlID0gbW9kZWwuZ2V0KCd0eXBlJykgYXMgTG9jYXRpb25UeXBlVHlwZVxuICByZXR1cm4gdHlwZVxufVxuZXhwb3J0IGNvbnN0IGdldERyYXdNb2RlRnJvbU1vZGVsID0gKHtcbiAgbW9kZWwsXG59OiB7XG4gIG1vZGVsOiBhbnlcbn0pOiBEcmF3TW9kZVR5cGUgPT4ge1xuICBjb25zdCBtb2RlID0gbW9kZWwuZ2V0KCdtb2RlJylcbiAgaWYgKEJhc2ljRHJhd01vZGVUeXBlcy5pbmNsdWRlcyhtb2RlKSkge1xuICAgIHJldHVybiBtb2RlXG4gIH1cbiAgY29uc3QgZmFsbGJhY2tUeXBlID0gZ2V0TG9jYXRpb25UeXBlRnJvbU1vZGVsKHsgbW9kZWwgfSlcbiAgc3dpdGNoIChmYWxsYmFja1R5cGUpIHtcbiAgICBjYXNlICdCQk9YJzpcbiAgICAgIHJldHVybiAnYmJveCdcbiAgICBjYXNlICdMSU5FJzpcbiAgICAgIHJldHVybiAnbGluZSdcbiAgICBjYXNlICdNVUxUSVBPTFlHT04nOlxuICAgICAgcmV0dXJuICdwb2x5J1xuICAgIGNhc2UgJ1BPSU5UUkFESVVTJzpcbiAgICAgIHJldHVybiAnY2lyY2xlJ1xuICAgIGNhc2UgJ1BPSU5UJzpcbiAgICAgIHJldHVybiAnY2lyY2xlJ1xuICAgIGNhc2UgJ1BPTFlHT04nOlxuICAgICAgcmV0dXJuICdwb2x5J1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ3BvbHknXG4gIH1cbn1cbmV4cG9ydCBjb25zdCBnZXRTaGFwZUZyb21EcmF3TW9kZSA9IChkcmF3TW9kZTogRHJhd01vZGVUeXBlKTogU2hhcGUgPT4ge1xuICBzd2l0Y2ggKGRyYXdNb2RlKSB7XG4gICAgY2FzZSAnYmJveCc6XG4gICAgICByZXR1cm4gJ0JvdW5kaW5nIEJveCdcbiAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgcmV0dXJuICdQb2ludCBSYWRpdXMnXG4gICAgY2FzZSAnbGluZSc6XG4gICAgICByZXR1cm4gJ0xpbmUnXG4gICAgY2FzZSAncG9seSc6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnUG9seWdvbidcbiAgfVxufVxuZXhwb3J0IGNvbnN0IGdldERyYXdNb2RlRnJvbVNoYXBlID0gKHNoYXBlOiBTaGFwZSk6IERyYXdNb2RlVHlwZSA9PiB7XG4gIHN3aXRjaCAoc2hhcGUpIHtcbiAgICBjYXNlICdCb3VuZGluZyBCb3gnOlxuICAgICAgcmV0dXJuICdiYm94J1xuICAgIGNhc2UgJ1BvaW50JzpcbiAgICBjYXNlICdQb2ludCBSYWRpdXMnOlxuICAgICAgcmV0dXJuICdjaXJjbGUnXG4gICAgY2FzZSAnTGluZSc6XG4gICAgICByZXR1cm4gJ2xpbmUnXG4gICAgY2FzZSAnUG9seWdvbic6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAncG9seSdcbiAgfVxufVxuY29uc3QgZXh0cmFjdE1vZGVsc0Zyb21GaWx0ZXIgPSAoe1xuICBmaWx0ZXIsXG4gIGV4dHJhY3RlZE1vZGVscyxcbiAgbGlzdGVuVG8sXG4gIG9uQ2hhbmdlLFxufToge1xuICBmaWx0ZXI6IGFueVxuICBleHRyYWN0ZWRNb2RlbHM6IGFueVtdXG4gIGxpc3RlblRvPzogKG9iamVjdDogYW55LCBldmVudHM6IHN0cmluZywgY2FsbGJhY2s6IEV2ZW50SGFuZGxlcikgPT4gdm9pZFxuICBvbkNoYW5nZT86ICgpID0+IHZvaWRcbn0pID0+IHtcbiAgaWYgKGZpbHRlci5maWx0ZXJzKSB7XG4gICAgZmlsdGVyLmZpbHRlcnMuZm9yRWFjaCgoc3ViZmlsdGVyOiBhbnkpID0+IHtcbiAgICAgIGV4dHJhY3RNb2RlbHNGcm9tRmlsdGVyKHtcbiAgICAgICAgZmlsdGVyOiBzdWJmaWx0ZXIsXG4gICAgICAgIGV4dHJhY3RlZE1vZGVscyxcbiAgICAgICAgbGlzdGVuVG8sXG4gICAgICAgIG9uQ2hhbmdlLFxuICAgICAgfSlcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGlmIChmaWx0ZXIudHlwZSA9PT0gJ0dFT01FVFJZJykge1xuICAgICAgaWYgKGZpbHRlci52YWx1ZT8uYXJlYURldGFpbHM/LmxvY2F0aW9ucykge1xuICAgICAgICBmaWx0ZXIudmFsdWUuYXJlYURldGFpbHMubG9jYXRpb25zLm1hcCgobG9jYXRpb246IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5ld0xvY2F0aW9uTW9kZWwgPSBuZXcgTG9jYXRpb25Nb2RlbChsb2NhdGlvbilcbiAgICAgICAgICBuZXdMb2NhdGlvbk1vZGVsLnNldCgnbG9jYXRpb25JZCcsIHVuZGVmaW5lZClcbiAgICAgICAgICBleHRyYWN0ZWRNb2RlbHMucHVzaChuZXdMb2NhdGlvbk1vZGVsKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbmV3TG9jYXRpb25Nb2RlbCA9IG5ldyBMb2NhdGlvbk1vZGVsKGZpbHRlci52YWx1ZSlcbiAgICAgICAgaWYgKG5ld0xvY2F0aW9uTW9kZWwuZ2V0KCdoYXNLZXl3b3JkJykpIHtcbiAgICAgICAgICBuZXdMb2NhdGlvbk1vZGVsLnNldCgnbG9jYXRpb25JZCcsIHVuZGVmaW5lZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaXN0ZW5Ubz8uKFxuICAgICAgICAgICAgbmV3TG9jYXRpb25Nb2RlbCxcbiAgICAgICAgICAgICdjaGFuZ2U6bWFwTm9ydGggY2hhbmdlOm1hcFNvdXRoIGNoYW5nZTptYXBFYXN0IGNoYW5nZTptYXBXZXN0IGNoYW5nZTpsYXQgY2hhbmdlOmxvbiBjaGFuZ2U6bGluZSBjaGFuZ2U6cG9seWdvbicsXG4gICAgICAgICAgICAobW9kZWwpID0+IHtcbiAgICAgICAgICAgICAgZmlsdGVyLnZhbHVlID0gbW9kZWwudG9KU09OKClcbiAgICAgICAgICAgICAgb25DaGFuZ2U/LigpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgZXh0cmFjdGVkTW9kZWxzLnB1c2gobmV3TG9jYXRpb25Nb2RlbClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbmZ1bmN0aW9uIHVzZU9uY2VJc05lYXJGaXJzdFJlbmRlcih7XG4gIGhvd05lYXIgPSAxMDAwLFxuICBjYWxsYmFjayxcbn06IHtcbiAgaG93TmVhcj86IG51bWJlclxuICBjYWxsYmFjazogKCkgPT4gdm9pZFxufSkge1xuICBjb25zdCBbZmlyc3RSZW5kZXIsIHNldEZpcnN0UmVuZGVyXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtoYXNGaXJlZCwgc2V0SGFzRmlyZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0Rmlyc3RSZW5kZXIoZmFsc2UpXG4gIH0sIFtdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghZmlyc3RSZW5kZXIgJiYgIWhhc0ZpcmVkKSB7XG4gICAgICBjb25zdCB0aW1lb3V0SWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgc2V0SGFzRmlyZWQodHJ1ZSlcbiAgICAgIH0sIGhvd05lYXIpXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtmaXJzdFJlbmRlciwgaG93TmVhciwgaGFzRmlyZWQsIGNhbGxiYWNrXSlcbn1cbmV4cG9ydCBjb25zdCB1c2VEcmF3aW5nQW5kRGlzcGxheU1vZGVscyA9ICh7XG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgbWFwLFxufToge1xuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxuICBtYXA6IGFueVxufSkgPT4ge1xuICAvLyBBbGwgb2YgdGhlc2UgYXJyYXlzIGhvbGQgZGlmZmVyZW50IHNldHMgb2YgdGhlIHNhbWUgbW9kZWxzLCBidXQgd2hlcmUgdGhleSBjb21lIGZyb20gZGlmZmVyc1xuICAvLyBtb2RlbHMgYXJlIGZyb20gZ2VvbWV0cnkgaW5wdXRzIHRoYXQgYXJlIGluIHRoZSBkb20gYWthIHRleHRmaWVsZHMgZXRjLiAoYWthLCBzb21lb25lIGlzIGVkaXRpbmcgYSBnZW8gaW5wdXQpXG4gIGNvbnN0IFttb2RlbHMsIHNldE1vZGVsc10gPSBSZWFjdC51c2VTdGF0ZTxBcnJheTxhbnk+PihbXSlcbiAgLy8gZmlsdGVyIG1vZGVscyBhcmUgZ3JhYmJlZCBmcm9tIHRoZSBmaWx0ZXIgdHJlZSBvbiBhIHNlYXJjaFxuICBjb25zdCBbZmlsdGVyTW9kZWxzLCBzZXRGaWx0ZXJNb2RlbHNdID0gUmVhY3QudXNlU3RhdGU8QXJyYXk8YW55Pj4oW10pXG4gIC8vIGRyYXdpbmcgbW9kZWxzIGFyZSB3aGVuIHRoZSB1c2VyIGlzIGFjdGl2ZWx5IGRyYXdpbmcgLyBlZGl0aW5nIGEgc2hhcGUgb24gdGhlIG1hcHMgdGhlbXNlbHZlcyAoYWthIHRoZSBkcmF3IHRvb2xzKVxuICBjb25zdCBbZHJhd2luZ01vZGVscywgc2V0RHJhd2luZ01vZGVsc10gPSBSZWFjdC51c2VTdGF0ZTxBcnJheTxhbnk+PihbXSlcbiAgY29uc3QgaXNEcmF3aW5nID0gdXNlSXNEcmF3aW5nKClcbiAgY29uc3QgZmlsdGVyVHJlZSA9IHVzZUxhenlSZXN1bHRzRmlsdGVyVHJlZUZyb21TZWxlY3Rpb25JbnRlcmZhY2Uoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgY29uc3QgeyBsaXN0ZW5Ubywgc3RvcExpc3RlbmluZyB9ID0gdXNlQmFja2JvbmUoKVxuICB1c2VMaXN0ZW5UbyhcbiAgICAod3JlcXIgYXMgYW55KS52ZW50LFxuICAgICdzZWFyY2g6bGluZWRpc3BsYXkgc2VhcmNoOnBvbHlkaXNwbGF5IHNlYXJjaDpiYm94ZGlzcGxheSBzZWFyY2g6Y2lyY2xlZGlzcGxheSBzZWFyY2g6a2V5d29yZGRpc3BsYXkgc2VhcmNoOmFyZWFkaXNwbGF5JyxcbiAgICAobW9kZWw6IGFueSkgPT4ge1xuICAgICAgc2V0TW9kZWxzKChjdXJyZW50TW9kZWxzKSA9PiB7XG4gICAgICAgIGxldCBuZXdNb2RlbHMgPSBjdXJyZW50TW9kZWxzXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG1vZGVsKSkge1xuICAgICAgICAgIG5ld01vZGVscyA9IGN1cnJlbnRNb2RlbHMuY29uY2F0KFxuICAgICAgICAgICAgbW9kZWwuZmlsdGVyKChuZXdNb2RlbCkgPT4gIWN1cnJlbnRNb2RlbHMuaW5jbHVkZXMobmV3TW9kZWwpKVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIGlmICghY3VycmVudE1vZGVscy5pbmNsdWRlcyhtb2RlbCkpIHtcbiAgICAgICAgICBuZXdNb2RlbHMgPSBbLi4uY3VycmVudE1vZGVscywgbW9kZWxdXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld01vZGVsc1xuICAgICAgfSlcbiAgICB9XG4gIClcbiAgdXNlTGlzdGVuVG8oKHdyZXFyIGFzIGFueSkudmVudCwgJ3NlYXJjaDpyZW1vdmVkaXNwbGF5JywgKG1vZGVsOiBhbnkpID0+IHtcbiAgICBzZXRNb2RlbHMoKGN1cnJlbnRNb2RlbHMpID0+IHtcbiAgICAgIGxldCBuZXdNb2RlbHNcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KG1vZGVsKSkge1xuICAgICAgICBuZXdNb2RlbHMgPSBjdXJyZW50TW9kZWxzLmZpbHRlcigobSkgPT4gIW1vZGVsLmluY2x1ZGVzKG0pKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TW9kZWxzID0gY3VycmVudE1vZGVscy5maWx0ZXIoKG0pID0+IG0gIT09IG1vZGVsKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld01vZGVsc1xuICAgIH0pXG4gIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignc2VhcmNoOnJlcXVlc3Rsb2NhdGlvbm1vZGVscycpXG4gIH0sIFtdKVxuICBjb25zdCB1cGRhdGVGaWx0ZXJNb2RlbHMgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgZm9yIChjb25zdCBtb2RlbCBvZiBmaWx0ZXJNb2RlbHMpIHtcbiAgICAgIHN0b3BMaXN0ZW5pbmcobW9kZWwpXG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdEZpbHRlciA9IFR5cGVkVXNlckluc3RhbmNlLmdldEVwaGVtZXJhbEZpbHRlcigpXG4gICAgY29uc3QgZXh0cmFjdGVkTW9kZWxzID0gW10gYXMgYW55W11cbiAgICBpZiAoZmlsdGVyVHJlZSkge1xuICAgICAgZXh0cmFjdE1vZGVsc0Zyb21GaWx0ZXIoe1xuICAgICAgICBmaWx0ZXI6IGZpbHRlclRyZWUsXG4gICAgICAgIGV4dHJhY3RlZE1vZGVscyxcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChyZXN1bHRGaWx0ZXIpIHtcbiAgICAgIC8vIFdlIGhhdmUgdG8gdXNlIHRoaXMgYWx0ZXJuYXRlIG1ldGhvZCBvZiB1cGRhdGluZyB0aGUgZmlsdGVyIHdoZW4gZGVhbGluZyB3aXRoXG4gICAgICAvLyB0aGUgcmVzdWx0RmlsdGVyLiBXaGVuIHRoZSBsb2NhdGlvbiBpbnB1dCBpcyB1bm1vdW50ZWQsIGl0IHJlc2V0cyBpdHMgbG9jYXRpb25cbiAgICAgIC8vIG1vZGVsIGFuZCByZW1vdmVzIGl0IGZyb20gaGVyZSB2aWEgdGhlIHNlYXJjaDpyZW1vdmVkaXNwbGF5IGV2ZW50LCBzbyB3ZSBjYW4ndFxuICAgICAgLy8gdXNlIGl0IHRvIHVwZGF0ZSB0aGUgZmlsdGVyLiBUaGUgbG9jYXRpb24gaW5wdXQgaXMgdW5tb3VudGVkIHdoZW4gdGhlIHJlc3VsdFxuICAgICAgLy8gZmlsdGVyIG1lbnUgaXMgY2xvc2VkLCB3aGljaCBpdCB1c3VhbGx5IGlzLiBTbywgd2UgdXBkYXRlIHRoZSBmaWx0ZXIgaW4gdGhlXG4gICAgICAvLyBwcmVmcyBtb2RlbCBvdXJzZWx2ZXMsIHdoaWNoIGNhdXNlcyB0aGlzIGZ1bmN0aW9uIHRvIGJlIHJ1biBhZ2FpbiB3aXRoIHRoZSBuZXdcbiAgICAgIC8vIGZpbHRlciwgYW5kIHdlIGNhbiBkaXNwbGF5IGl0IGNvcnJlY3RseS5cbiAgICAgIGV4dHJhY3RNb2RlbHNGcm9tRmlsdGVyKHtcbiAgICAgICAgZmlsdGVyOiByZXN1bHRGaWx0ZXIsXG4gICAgICAgIGV4dHJhY3RlZE1vZGVscyxcbiAgICAgICAgbGlzdGVuVG8sXG4gICAgICAgIG9uQ2hhbmdlOiAoKSA9PiB7XG4gICAgICAgICAgVHlwZWRVc2VySW5zdGFuY2UuZ2V0UHJlZmVyZW5jZXMoKS5zZXQoXG4gICAgICAgICAgICAncmVzdWx0RmlsdGVyJyxcbiAgICAgICAgICAgIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocmVzdWx0RmlsdGVyKSlcbiAgICAgICAgICApXG4gICAgICAgICAgVHlwZWRVc2VySW5zdGFuY2Uuc2F2ZVByZWZlcmVuY2VzKClcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfVxuICAgIC8vIElmIHdlIGhhdmUgYSBtb2RlbCBmb3IgYSBwYXJ0aWN1bGFyIGxvY2F0aW9uSWQgaW4gYm90aCBtb2RlbHMgYW5kIGZpbHRlck1vZGVscyxcbiAgICAvLyB0aGVuIGtlZXAgb25seSB0aGUgb25lIGluIG1vZGVscywgc2luY2UgdGhhdCBpcyB0aGUgc291cmNlIG9mIHRydXRoLiBSZW1vdmluZ1xuICAgIC8vIHRoZSBvbmUgaW4gZmlsdGVyTW9kZWxzIHByZXZlbnRzIHNvbWUgZmxpY2tlcmluZyB3aGVuIHJlbGVhc2luZyB0aGUgbW91c2Ugb24gYVxuICAgIC8vIG1vdmUgb3BlcmF0aW9uLlxuICAgIGNvbnN0IGxvY2F0aW9uSWRzID0gbmV3IFNldChtb2RlbHMubWFwKChtKSA9PiBtLmdldCgnbG9jYXRpb25JZCcpKSlcbiAgICBjb25zdCBkZWR1cGVkTW9kZWxzID0gZXh0cmFjdGVkTW9kZWxzLmZpbHRlcihcbiAgICAgIChtKSA9PiAhbG9jYXRpb25JZHMuaGFzKG0uZ2V0KCdsb2NhdGlvbklkJykpXG4gICAgKVxuICAgIHNldEZpbHRlck1vZGVscyhkZWR1cGVkTW9kZWxzKVxuICB9LCBbZmlsdGVyVHJlZSwgbW9kZWxzXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB1cGRhdGVGaWx0ZXJNb2RlbHMoKVxuICB9LCBbdXBkYXRlRmlsdGVyTW9kZWxzXSlcbiAgdXNlTGlzdGVuVG8oc2VsZWN0aW9uSW50ZXJmYWNlLCAnY2hhbmdlOmN1cnJlbnRRdWVyeScsIHVwZGF0ZUZpbHRlck1vZGVscylcbiAgdXNlTGlzdGVuVG8oXG4gICAgVHlwZWRVc2VySW5zdGFuY2UuZ2V0UHJlZmVyZW5jZXMoKSxcbiAgICAnY2hhbmdlOnJlc3VsdEZpbHRlcicsXG4gICAgdXBkYXRlRmlsdGVyTW9kZWxzXG4gIClcbiAgdXNlTGlzdGVuVG8oXG4gICAgKHdyZXFyIGFzIGFueSkudmVudCxcbiAgICAnc2VhcmNoOmRyYXdsaW5lIHNlYXJjaDpkcmF3cG9seSBzZWFyY2g6ZHJhd2Jib3ggc2VhcmNoOmRyYXdjaXJjbGUnLFxuICAgIChtb2RlbDogYW55KSA9PiB7XG4gICAgICBpZiAoIWRyYXdpbmdNb2RlbHMuaW5jbHVkZXMobW9kZWwpKSB7XG4gICAgICAgIHNldERyYXdpbmdNb2RlbHMoWy4uLmRyYXdpbmdNb2RlbHMsIG1vZGVsXSlcbiAgICAgIH1cbiAgICB9XG4gIClcbiAgdXNlTGlzdGVuVG8oXG4gICAgKHdyZXFyIGFzIGFueSkudmVudCxcbiAgICAnc2VhcmNoOmxpbmUtZW5kIHNlYXJjaDpwb2x5LWVuZCBzZWFyY2g6YmJveC1lbmQgc2VhcmNoOmNpcmNsZS1lbmQgc2VhcmNoOmRyYXdjYW5jZWwgc2VhcmNoOmRyYXdlbmQnLFxuICAgIChtb2RlbDogYW55KSA9PiB7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkobW9kZWwpKSB7XG4gICAgICAgIG1vZGVsID0gW21vZGVsXVxuICAgICAgfVxuICAgICAgbW9kZWwuZm9yRWFjaCgoc3VibW9kZWw6IGFueSkgPT4ge1xuICAgICAgICBpZiAoZHJhd2luZ01vZGVscy5pbmNsdWRlcyhzdWJtb2RlbCkpIHtcbiAgICAgICAgICBzZXREcmF3aW5nTW9kZWxzKFxuICAgICAgICAgICAgZHJhd2luZ01vZGVscy5maWx0ZXIoKGRyYXdpbmdNb2RlbCkgPT4gZHJhd2luZ01vZGVsICE9PSBzdWJtb2RlbClcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICApXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcCAmJiBpc0RyYXdpbmcpIHtcbiAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ3NlYXJjaDpyZXF1ZXN0ZHJhd2luZ21vZGVscycpXG4gICAgfVxuICB9LCBbbWFwXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWlzRHJhd2luZykge1xuICAgICAgc2V0RHJhd2luZ01vZGVscyhbXSlcbiAgICB9XG4gIH0sIFtpc0RyYXdpbmddKVxuICBjb25zdCBjYWxsYmFjayA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobWFwKSB7XG4gICAgICAgIGNvbnN0IHNoYXBlc0V4aXN0ID0gbWFwLnBhblRvU2hhcGVzRXh0ZW50KClcbiAgICAgICAgaWYgKCFzaGFwZXNFeGlzdCkge1xuICAgICAgICAgIHpvb21Ub0hvbWUoeyBtYXAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW2ZpbHRlck1vZGVscywgbW9kZWxzLCBtYXBdKVxuICB1c2VPbmNlSXNOZWFyRmlyc3RSZW5kZXIoeyBjYWxsYmFjayB9KVxuICByZXR1cm4ge1xuICAgIG1vZGVscyxcbiAgICBkcmF3aW5nTW9kZWxzLFxuICAgIGZpbHRlck1vZGVscyxcbiAgfVxufVxuIl19