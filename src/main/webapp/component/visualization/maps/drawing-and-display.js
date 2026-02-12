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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy1hbmQtZGlzcGxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2RyYXdpbmctYW5kLWRpc3BsYXkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sS0FBSyxNQUFNLG1CQUFtQixDQUFBO0FBQ3JDLE9BQU8sRUFDTCxXQUFXLEVBQ1gsV0FBVyxHQUNaLE1BQU0sMkNBQTJDLENBQUE7QUFDbEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ3ZELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFBO0FBQzlELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDbkMsT0FBTyxhQUFhLE1BQU0saUNBQWlDLENBQUE7QUFFM0QsT0FBTyxFQUFFLDhDQUE4QyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFFaEcsTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQTtBQUN0QyxNQUFNLENBQUMsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBQXlCO1FBQXZCLEtBQUssV0FBQTtJQUM5QyxPQUFPLFVBQUcsZUFBZSxjQUFJLEtBQUssQ0FBQyxHQUFHLGFBQVUsQ0FBQTtBQUNsRCxDQUFDLENBQUE7QUFDRCxNQUFNLENBQUMsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBQXlCO1FBQXZCLEtBQUssV0FBQTtJQUM5QyxPQUFPLFVBQUcsZUFBZSxjQUFJLEtBQUssQ0FBQyxHQUFHLGFBQVUsQ0FBQTtBQUNsRCxDQUFDLENBQUE7QUFFRCxnREFBZ0Q7QUFDaEQsSUFBTSxrQkFBa0IsR0FBd0I7SUFDOUMsTUFBTTtJQUNOLFFBQVE7SUFDUixNQUFNO0lBQ04sTUFBTTtDQUNQLENBQUE7QUFRRCxNQUFNLENBQUMsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBQXlCO1FBQXZCLEtBQUssV0FBQTtJQUM5QyxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBcUIsQ0FBQTtJQUNsRCxPQUFPLElBQUksQ0FBQTtBQUNiLENBQUMsQ0FBQTtBQUNELE1BQU0sQ0FBQyxJQUFNLG9CQUFvQixHQUFHLFVBQUMsRUFJcEM7UUFIQyxLQUFLLFdBQUE7SUFJTCxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzlCLElBQUksa0JBQWtCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDdEMsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBQ0QsSUFBTSxZQUFZLEdBQUcsd0JBQXdCLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxDQUFDLENBQUE7SUFDeEQsUUFBUSxZQUFZLEVBQUUsQ0FBQztRQUNyQixLQUFLLE1BQU07WUFDVCxPQUFPLE1BQU0sQ0FBQTtRQUNmLEtBQUssTUFBTTtZQUNULE9BQU8sTUFBTSxDQUFBO1FBQ2YsS0FBSyxjQUFjO1lBQ2pCLE9BQU8sTUFBTSxDQUFBO1FBQ2YsS0FBSyxhQUFhO1lBQ2hCLE9BQU8sUUFBUSxDQUFBO1FBQ2pCLEtBQUssT0FBTztZQUNWLE9BQU8sUUFBUSxDQUFBO1FBQ2pCLEtBQUssU0FBUztZQUNaLE9BQU8sTUFBTSxDQUFBO1FBQ2Y7WUFDRSxPQUFPLE1BQU0sQ0FBQTtJQUNqQixDQUFDO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxDQUFDLElBQU0sb0JBQW9CLEdBQUcsVUFBQyxRQUFzQjtJQUN6RCxRQUFRLFFBQVEsRUFBRSxDQUFDO1FBQ2pCLEtBQUssTUFBTTtZQUNULE9BQU8sY0FBYyxDQUFBO1FBQ3ZCLEtBQUssUUFBUTtZQUNYLE9BQU8sY0FBYyxDQUFBO1FBQ3ZCLEtBQUssTUFBTTtZQUNULE9BQU8sTUFBTSxDQUFBO1FBQ2YsS0FBSyxNQUFNLENBQUM7UUFDWjtZQUNFLE9BQU8sU0FBUyxDQUFBO0lBQ3BCLENBQUM7QUFDSCxDQUFDLENBQUE7QUFDRCxNQUFNLENBQUMsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLEtBQVk7SUFDL0MsUUFBUSxLQUFLLEVBQUUsQ0FBQztRQUNkLEtBQUssY0FBYztZQUNqQixPQUFPLE1BQU0sQ0FBQTtRQUNmLEtBQUssT0FBTyxDQUFDO1FBQ2IsS0FBSyxjQUFjO1lBQ2pCLE9BQU8sUUFBUSxDQUFBO1FBQ2pCLEtBQUssTUFBTTtZQUNULE9BQU8sTUFBTSxDQUFBO1FBQ2YsS0FBSyxTQUFTLENBQUM7UUFDZjtZQUNFLE9BQU8sTUFBTSxDQUFBO0lBQ2pCLENBQUM7QUFDSCxDQUFDLENBQUE7QUFDRCxJQUFNLHVCQUF1QixHQUFHLFVBQUMsRUFVaEM7O1FBVEMsTUFBTSxZQUFBLEVBQ04sZUFBZSxxQkFBQSxFQUNmLFFBQVEsY0FBQSxFQUNSLFFBQVEsY0FBQTtJQU9SLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsU0FBYztZQUNwQyx1QkFBdUIsQ0FBQztnQkFDdEIsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLGVBQWUsaUJBQUE7Z0JBQ2YsUUFBUSxVQUFBO2dCQUNSLFFBQVEsVUFBQTthQUNULENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztTQUFNLENBQUM7UUFDTixJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDL0IsSUFBSSxNQUFBLE1BQUEsTUFBTSxDQUFDLEtBQUssMENBQUUsV0FBVywwQ0FBRSxTQUFTLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFDLFFBQWE7b0JBQ25ELElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUE7b0JBQ3BELGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUE7b0JBQzdDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtnQkFDeEMsQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ3hELElBQUksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7b0JBQ3ZDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUE7Z0JBQy9DLENBQUM7cUJBQU0sQ0FBQztvQkFDTixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQ04sZ0JBQWdCLEVBQ2hCLGdIQUFnSCxFQUNoSCxVQUFDLEtBQUs7d0JBQ0osTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7d0JBQzdCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsRUFBSSxDQUFBO29CQUNkLENBQUMsQ0FDRixDQUFBO2dCQUNILENBQUM7Z0JBRUQsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1lBQ3hDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMsQ0FBQTtBQUNELFNBQVMsd0JBQXdCLENBQUMsRUFNakM7UUFMQyxlQUFjLEVBQWQsT0FBTyxtQkFBRyxJQUFJLEtBQUEsRUFDZCxRQUFRLGNBQUE7SUFLRixJQUFBLEtBQUEsT0FBZ0MsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBQSxFQUFuRCxXQUFXLFFBQUEsRUFBRSxjQUFjLFFBQXdCLENBQUE7SUFDcEQsSUFBQSxLQUFBLE9BQTBCLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUEsRUFBOUMsUUFBUSxRQUFBLEVBQUUsV0FBVyxRQUF5QixDQUFBO0lBQ3JELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDdkIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM5QixJQUFNLFdBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO2dCQUNsQyxRQUFRLEVBQUUsQ0FBQTtnQkFDVixXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDbkIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1lBQ1gsT0FBTztnQkFDTCxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVMsQ0FBQyxDQUFBO1lBQ2hDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFDRCxPQUFPLGNBQU8sQ0FBQyxDQUFBO0lBQ2pCLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUE7QUFDaEQsQ0FBQztBQUNELE1BQU0sQ0FBQyxJQUFNLDBCQUEwQixHQUFHLFVBQUMsRUFNMUM7UUFMQyxrQkFBa0Isd0JBQUEsRUFDbEIsR0FBRyxTQUFBO0lBS0gsK0ZBQStGO0lBQy9GLGdIQUFnSDtJQUMxRyxJQUFBLEtBQUEsT0FBc0IsS0FBSyxDQUFDLFFBQVEsQ0FBYSxFQUFFLENBQUMsSUFBQSxFQUFuRCxNQUFNLFFBQUEsRUFBRSxTQUFTLFFBQWtDLENBQUE7SUFDMUQsNkRBQTZEO0lBQ3ZELElBQUEsS0FBQSxPQUFrQyxLQUFLLENBQUMsUUFBUSxDQUFhLEVBQUUsQ0FBQyxJQUFBLEVBQS9ELFlBQVksUUFBQSxFQUFFLGVBQWUsUUFBa0MsQ0FBQTtJQUN0RSxxSEFBcUg7SUFDL0csSUFBQSxLQUFBLE9BQW9DLEtBQUssQ0FBQyxRQUFRLENBQWEsRUFBRSxDQUFDLElBQUEsRUFBakUsYUFBYSxRQUFBLEVBQUUsZ0JBQWdCLFFBQWtDLENBQUE7SUFDeEUsSUFBTSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUE7SUFDaEMsSUFBTSxVQUFVLEdBQUcsOENBQThDLENBQUM7UUFDaEUsa0JBQWtCLG9CQUFBO0tBQ25CLENBQUMsQ0FBQTtJQUNJLElBQUEsS0FBOEIsV0FBVyxFQUFFLEVBQXpDLFFBQVEsY0FBQSxFQUFFLGFBQWEsbUJBQWtCLENBQUE7SUFDakQsV0FBVyxDQUNSLEtBQWEsQ0FBQyxJQUFJLEVBQ25CLHdIQUF3SCxFQUN4SCxVQUFDLEtBQVU7UUFDVCxTQUFTLENBQUMsVUFBQyxhQUFhO1lBQ3RCLElBQUksU0FBUyxHQUFHLGFBQWEsQ0FBQTtZQUM3QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDekIsU0FBUyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQzlCLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQyxRQUFRLElBQUssT0FBQSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQWpDLENBQWlDLENBQUMsQ0FDOUQsQ0FBQTtZQUNILENBQUM7aUJBQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsU0FBUywwQ0FBTyxhQUFhLFlBQUUsS0FBSyxTQUFDLENBQUE7WUFDdkMsQ0FBQztZQUNELE9BQU8sU0FBUyxDQUFBO1FBQ2xCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUNGLENBQUE7SUFDRCxXQUFXLENBQUUsS0FBYSxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxVQUFDLEtBQVU7UUFDbEUsU0FBUyxDQUFDLFVBQUMsYUFBYTtZQUN0QixJQUFJLFNBQVMsQ0FBQTtZQUNiLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN6QixTQUFTLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFBO1lBQzdELENBQUM7aUJBQU0sQ0FBQztnQkFDTixTQUFTLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsS0FBSyxLQUFLLEVBQVgsQ0FBVyxDQUFDLENBQUE7WUFDdEQsQ0FBQztZQUNELE9BQU8sU0FBUyxDQUFBO1FBQ2xCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUE7SUFDRixLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsQ0FBQztRQUFDLEtBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUE7SUFDOUQsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sSUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7WUFDM0MsS0FBb0IsSUFBQSxpQkFBQSxTQUFBLFlBQVksQ0FBQSwwQ0FBQSxvRUFBRSxDQUFDO2dCQUE5QixJQUFNLEtBQUsseUJBQUE7Z0JBQ2QsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3RCLENBQUM7Ozs7Ozs7OztRQUNELElBQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLGtCQUFrQixFQUFFLENBQUE7UUFDM0QsSUFBTSxlQUFlLEdBQUcsRUFBVyxDQUFBO1FBQ25DLElBQUksVUFBVSxFQUFFLENBQUM7WUFDZix1QkFBdUIsQ0FBQztnQkFDdEIsTUFBTSxFQUFFLFVBQVU7Z0JBQ2xCLGVBQWUsaUJBQUE7YUFDaEIsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsZ0ZBQWdGO1lBQ2hGLGlGQUFpRjtZQUNqRixpRkFBaUY7WUFDakYsK0VBQStFO1lBQy9FLDhFQUE4RTtZQUM5RSxpRkFBaUY7WUFDakYsMkNBQTJDO1lBQzNDLHVCQUF1QixDQUFDO2dCQUN0QixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsZUFBZSxpQkFBQTtnQkFDZixRQUFRLFVBQUE7Z0JBQ1IsUUFBUSxFQUFFO29CQUNSLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FDcEMsY0FBYyxFQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUN6QyxDQUFBO29CQUNELGlCQUFpQixDQUFDLGVBQWUsRUFBRSxDQUFBO2dCQUNyQyxDQUFDO2FBQ0YsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELGtGQUFrRjtRQUNsRixnRkFBZ0Y7UUFDaEYsaUZBQWlGO1FBQ2pGLGtCQUFrQjtRQUNsQixJQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDLENBQUE7UUFDbkUsSUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FDMUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFyQyxDQUFxQyxDQUM3QyxDQUFBO1FBQ0QsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ2hDLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ3hCLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxrQkFBa0IsRUFBRSxDQUFBO0lBQ3RCLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQTtJQUN4QixXQUFXLENBQUMsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtJQUMxRSxXQUFXLENBQ1QsaUJBQWlCLENBQUMsY0FBYyxFQUFFLEVBQ2xDLHFCQUFxQixFQUNyQixrQkFBa0IsQ0FDbkIsQ0FBQTtJQUNELFdBQVcsQ0FDUixLQUFhLENBQUMsSUFBSSxFQUNuQixtRUFBbUUsRUFDbkUsVUFBQyxLQUFVO1FBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuQyxnQkFBZ0Isd0NBQUssYUFBYSxZQUFFLEtBQUssVUFBRSxDQUFBO1FBQzdDLENBQUM7SUFDSCxDQUFDLENBQ0YsQ0FBQTtJQUNELFdBQVcsQ0FDUixLQUFhLENBQUMsSUFBSSxFQUNuQixvR0FBb0csRUFDcEcsVUFBQyxLQUFVO1FBQ1QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMxQixLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNqQixDQUFDO1FBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQWE7WUFDMUIsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JDLGdCQUFnQixDQUNkLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBQyxZQUFZLElBQUssT0FBQSxZQUFZLEtBQUssUUFBUSxFQUF6QixDQUF5QixDQUFDLENBQ2xFLENBQUE7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQ0YsQ0FBQTtJQUNELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNyQixDQUFDO1lBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtRQUM3RCxDQUFDO0lBQ0gsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUNULEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDZixnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN0QixDQUFDO0lBQ0gsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtJQUNmLElBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDN0IsT0FBTztZQUNMLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1IsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUE7Z0JBQzNDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDakIsVUFBVSxDQUFDLEVBQUUsR0FBRyxLQUFBLEVBQUUsQ0FBQyxDQUFBO2dCQUNyQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMvQix3QkFBd0IsQ0FBQyxFQUFFLFFBQVEsVUFBQSxFQUFFLENBQUMsQ0FBQTtJQUN0QyxPQUFPO1FBQ0wsTUFBTSxRQUFBO1FBQ04sYUFBYSxlQUFBO1FBQ2IsWUFBWSxjQUFBO0tBQ2IsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IHtcbiAgdXNlQmFja2JvbmUsXG4gIHVzZUxpc3RlblRvLFxufSBmcm9tICcuLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IHVzZUlzRHJhd2luZyB9IGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvZHJhd2luZydcbmltcG9ydCB7IFR5cGVkVXNlckluc3RhbmNlIH0gZnJvbSAnLi4vLi4vc2luZ2xldG9ucy9UeXBlZFVzZXInXG5pbXBvcnQgeyB6b29tVG9Ib21lIH0gZnJvbSAnLi9ob21lJ1xuaW1wb3J0IExvY2F0aW9uTW9kZWwgZnJvbSAnLi4vLi4vbG9jYXRpb24tb2xkL2xvY2F0aW9uLW9sZCdcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnZ2Vvc3BhdGlhbGRyYXcvdGFyZ2V0L3dlYmFwcC9zaGFwZS11dGlscydcbmltcG9ydCB7IHVzZUxhenlSZXN1bHRzRmlsdGVyVHJlZUZyb21TZWxlY3Rpb25JbnRlcmZhY2UgfSBmcm9tICcuLi8uLi9zZWxlY3Rpb24taW50ZXJmYWNlL2hvb2tzJ1xuaW1wb3J0IHsgRXZlbnRIYW5kbGVyIH0gZnJvbSAnYmFja2JvbmUnXG5leHBvcnQgY29uc3QgU0hBUEVfSURfUFJFRklYID0gJ3NoYXBlJ1xuZXhwb3J0IGNvbnN0IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSA9ICh7IG1vZGVsIH06IHsgbW9kZWw6IGFueSB9KSA9PiB7XG4gIHJldHVybiBgJHtTSEFQRV9JRF9QUkVGSVh9LSR7bW9kZWwuY2lkfS1kaXNwbGF5YFxufVxuZXhwb3J0IGNvbnN0IGdldElkRnJvbU1vZGVsRm9yRHJhd2luZyA9ICh7IG1vZGVsIH06IHsgbW9kZWw6IGFueSB9KSA9PiB7XG4gIHJldHVybiBgJHtTSEFQRV9JRF9QUkVGSVh9LSR7bW9kZWwuY2lkfS1kcmF3aW5nYFxufVxuZXhwb3J0IHR5cGUgRHJhd01vZGVUeXBlID0gJ2xpbmUnIHwgJ3BvbHknIHwgJ2NpcmNsZScgfCAnYmJveCcgfCAna2V5d29yZCdcbi8vIGZyb20gdGhlc2UgYWxsIG90aGVyIGRyYXdpbmdzIGFyZSBjb25zdHJ1Y3RlZFxuY29uc3QgQmFzaWNEcmF3TW9kZVR5cGVzOiBBcnJheTxEcmF3TW9kZVR5cGU+ID0gW1xuICAnYmJveCcsXG4gICdjaXJjbGUnLFxuICAnbGluZScsXG4gICdwb2x5Jyxcbl1cbnR5cGUgTG9jYXRpb25UeXBlVHlwZSA9XG4gIHwgJ0xJTkUnXG4gIHwgJ1BPTFlHT04nXG4gIHwgJ01VTFRJUE9MWUdPTidcbiAgfCAnQkJPWCdcbiAgfCAnUE9JTlRSQURJVVMnXG4gIHwgJ1BPSU5UJ1xuZXhwb3J0IGNvbnN0IGdldExvY2F0aW9uVHlwZUZyb21Nb2RlbCA9ICh7IG1vZGVsIH06IHsgbW9kZWw6IGFueSB9KSA9PiB7XG4gIGNvbnN0IHR5cGUgPSBtb2RlbC5nZXQoJ3R5cGUnKSBhcyBMb2NhdGlvblR5cGVUeXBlXG4gIHJldHVybiB0eXBlXG59XG5leHBvcnQgY29uc3QgZ2V0RHJhd01vZGVGcm9tTW9kZWwgPSAoe1xuICBtb2RlbCxcbn06IHtcbiAgbW9kZWw6IGFueVxufSk6IERyYXdNb2RlVHlwZSA9PiB7XG4gIGNvbnN0IG1vZGUgPSBtb2RlbC5nZXQoJ21vZGUnKVxuICBpZiAoQmFzaWNEcmF3TW9kZVR5cGVzLmluY2x1ZGVzKG1vZGUpKSB7XG4gICAgcmV0dXJuIG1vZGVcbiAgfVxuICBjb25zdCBmYWxsYmFja1R5cGUgPSBnZXRMb2NhdGlvblR5cGVGcm9tTW9kZWwoeyBtb2RlbCB9KVxuICBzd2l0Y2ggKGZhbGxiYWNrVHlwZSkge1xuICAgIGNhc2UgJ0JCT1gnOlxuICAgICAgcmV0dXJuICdiYm94J1xuICAgIGNhc2UgJ0xJTkUnOlxuICAgICAgcmV0dXJuICdsaW5lJ1xuICAgIGNhc2UgJ01VTFRJUE9MWUdPTic6XG4gICAgICByZXR1cm4gJ3BvbHknXG4gICAgY2FzZSAnUE9JTlRSQURJVVMnOlxuICAgICAgcmV0dXJuICdjaXJjbGUnXG4gICAgY2FzZSAnUE9JTlQnOlxuICAgICAgcmV0dXJuICdjaXJjbGUnXG4gICAgY2FzZSAnUE9MWUdPTic6XG4gICAgICByZXR1cm4gJ3BvbHknXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAncG9seSdcbiAgfVxufVxuZXhwb3J0IGNvbnN0IGdldFNoYXBlRnJvbURyYXdNb2RlID0gKGRyYXdNb2RlOiBEcmF3TW9kZVR5cGUpOiBTaGFwZSA9PiB7XG4gIHN3aXRjaCAoZHJhd01vZGUpIHtcbiAgICBjYXNlICdiYm94JzpcbiAgICAgIHJldHVybiAnQm91bmRpbmcgQm94J1xuICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICByZXR1cm4gJ1BvaW50IFJhZGl1cydcbiAgICBjYXNlICdsaW5lJzpcbiAgICAgIHJldHVybiAnTGluZSdcbiAgICBjYXNlICdwb2x5JzpcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdQb2x5Z29uJ1xuICB9XG59XG5leHBvcnQgY29uc3QgZ2V0RHJhd01vZGVGcm9tU2hhcGUgPSAoc2hhcGU6IFNoYXBlKTogRHJhd01vZGVUeXBlID0+IHtcbiAgc3dpdGNoIChzaGFwZSkge1xuICAgIGNhc2UgJ0JvdW5kaW5nIEJveCc6XG4gICAgICByZXR1cm4gJ2Jib3gnXG4gICAgY2FzZSAnUG9pbnQnOlxuICAgIGNhc2UgJ1BvaW50IFJhZGl1cyc6XG4gICAgICByZXR1cm4gJ2NpcmNsZSdcbiAgICBjYXNlICdMaW5lJzpcbiAgICAgIHJldHVybiAnbGluZSdcbiAgICBjYXNlICdQb2x5Z29uJzpcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdwb2x5J1xuICB9XG59XG5jb25zdCBleHRyYWN0TW9kZWxzRnJvbUZpbHRlciA9ICh7XG4gIGZpbHRlcixcbiAgZXh0cmFjdGVkTW9kZWxzLFxuICBsaXN0ZW5UbyxcbiAgb25DaGFuZ2UsXG59OiB7XG4gIGZpbHRlcjogYW55XG4gIGV4dHJhY3RlZE1vZGVsczogYW55W11cbiAgbGlzdGVuVG8/OiAob2JqZWN0OiBhbnksIGV2ZW50czogc3RyaW5nLCBjYWxsYmFjazogRXZlbnRIYW5kbGVyKSA9PiB2b2lkXG4gIG9uQ2hhbmdlPzogKCkgPT4gdm9pZFxufSkgPT4ge1xuICBpZiAoZmlsdGVyLmZpbHRlcnMpIHtcbiAgICBmaWx0ZXIuZmlsdGVycy5mb3JFYWNoKChzdWJmaWx0ZXI6IGFueSkgPT4ge1xuICAgICAgZXh0cmFjdE1vZGVsc0Zyb21GaWx0ZXIoe1xuICAgICAgICBmaWx0ZXI6IHN1YmZpbHRlcixcbiAgICAgICAgZXh0cmFjdGVkTW9kZWxzLFxuICAgICAgICBsaXN0ZW5UbyxcbiAgICAgICAgb25DaGFuZ2UsXG4gICAgICB9KVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgaWYgKGZpbHRlci50eXBlID09PSAnR0VPTUVUUlknKSB7XG4gICAgICBpZiAoZmlsdGVyLnZhbHVlPy5hcmVhRGV0YWlscz8ubG9jYXRpb25zKSB7XG4gICAgICAgIGZpbHRlci52YWx1ZS5hcmVhRGV0YWlscy5sb2NhdGlvbnMubWFwKChsb2NhdGlvbjogYW55KSA9PiB7XG4gICAgICAgICAgY29uc3QgbmV3TG9jYXRpb25Nb2RlbCA9IG5ldyBMb2NhdGlvbk1vZGVsKGxvY2F0aW9uKVxuICAgICAgICAgIG5ld0xvY2F0aW9uTW9kZWwuc2V0KCdsb2NhdGlvbklkJywgdW5kZWZpbmVkKVxuICAgICAgICAgIGV4dHJhY3RlZE1vZGVscy5wdXNoKG5ld0xvY2F0aW9uTW9kZWwpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZXdMb2NhdGlvbk1vZGVsID0gbmV3IExvY2F0aW9uTW9kZWwoZmlsdGVyLnZhbHVlKVxuICAgICAgICBpZiAobmV3TG9jYXRpb25Nb2RlbC5nZXQoJ2hhc0tleXdvcmQnKSkge1xuICAgICAgICAgIG5ld0xvY2F0aW9uTW9kZWwuc2V0KCdsb2NhdGlvbklkJywgdW5kZWZpbmVkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpc3RlblRvPy4oXG4gICAgICAgICAgICBuZXdMb2NhdGlvbk1vZGVsLFxuICAgICAgICAgICAgJ2NoYW5nZTptYXBOb3J0aCBjaGFuZ2U6bWFwU291dGggY2hhbmdlOm1hcEVhc3QgY2hhbmdlOm1hcFdlc3QgY2hhbmdlOmxhdCBjaGFuZ2U6bG9uIGNoYW5nZTpsaW5lIGNoYW5nZTpwb2x5Z29uJyxcbiAgICAgICAgICAgIChtb2RlbCkgPT4ge1xuICAgICAgICAgICAgICBmaWx0ZXIudmFsdWUgPSBtb2RlbC50b0pTT04oKVxuICAgICAgICAgICAgICBvbkNoYW5nZT8uKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICAgIH1cblxuICAgICAgICBleHRyYWN0ZWRNb2RlbHMucHVzaChuZXdMb2NhdGlvbk1vZGVsKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gdXNlT25jZUlzTmVhckZpcnN0UmVuZGVyKHtcbiAgaG93TmVhciA9IDEwMDAsXG4gIGNhbGxiYWNrLFxufToge1xuICBob3dOZWFyPzogbnVtYmVyXG4gIGNhbGxiYWNrOiAoKSA9PiB2b2lkXG59KSB7XG4gIGNvbnN0IFtmaXJzdFJlbmRlciwgc2V0Rmlyc3RSZW5kZXJdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW2hhc0ZpcmVkLCBzZXRIYXNGaXJlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRGaXJzdFJlbmRlcihmYWxzZSlcbiAgfSwgW10pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFmaXJzdFJlbmRlciAmJiAhaGFzRmlyZWQpIHtcbiAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICBzZXRIYXNGaXJlZCh0cnVlKVxuICAgICAgfSwgaG93TmVhcilcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dElkKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2ZpcnN0UmVuZGVyLCBob3dOZWFyLCBoYXNGaXJlZCwgY2FsbGJhY2tdKVxufVxuZXhwb3J0IGNvbnN0IHVzZURyYXdpbmdBbmREaXNwbGF5TW9kZWxzID0gKHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICBtYXAsXG59OiB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG4gIG1hcDogYW55XG59KSA9PiB7XG4gIC8vIEFsbCBvZiB0aGVzZSBhcnJheXMgaG9sZCBkaWZmZXJlbnQgc2V0cyBvZiB0aGUgc2FtZSBtb2RlbHMsIGJ1dCB3aGVyZSB0aGV5IGNvbWUgZnJvbSBkaWZmZXJzXG4gIC8vIG1vZGVscyBhcmUgZnJvbSBnZW9tZXRyeSBpbnB1dHMgdGhhdCBhcmUgaW4gdGhlIGRvbSBha2EgdGV4dGZpZWxkcyBldGMuIChha2EsIHNvbWVvbmUgaXMgZWRpdGluZyBhIGdlbyBpbnB1dClcbiAgY29uc3QgW21vZGVscywgc2V0TW9kZWxzXSA9IFJlYWN0LnVzZVN0YXRlPEFycmF5PGFueT4+KFtdKVxuICAvLyBmaWx0ZXIgbW9kZWxzIGFyZSBncmFiYmVkIGZyb20gdGhlIGZpbHRlciB0cmVlIG9uIGEgc2VhcmNoXG4gIGNvbnN0IFtmaWx0ZXJNb2RlbHMsIHNldEZpbHRlck1vZGVsc10gPSBSZWFjdC51c2VTdGF0ZTxBcnJheTxhbnk+PihbXSlcbiAgLy8gZHJhd2luZyBtb2RlbHMgYXJlIHdoZW4gdGhlIHVzZXIgaXMgYWN0aXZlbHkgZHJhd2luZyAvIGVkaXRpbmcgYSBzaGFwZSBvbiB0aGUgbWFwcyB0aGVtc2VsdmVzIChha2EgdGhlIGRyYXcgdG9vbHMpXG4gIGNvbnN0IFtkcmF3aW5nTW9kZWxzLCBzZXREcmF3aW5nTW9kZWxzXSA9IFJlYWN0LnVzZVN0YXRlPEFycmF5PGFueT4+KFtdKVxuICBjb25zdCBpc0RyYXdpbmcgPSB1c2VJc0RyYXdpbmcoKVxuICBjb25zdCBmaWx0ZXJUcmVlID0gdXNlTGF6eVJlc3VsdHNGaWx0ZXJUcmVlRnJvbVNlbGVjdGlvbkludGVyZmFjZSh7XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuICBjb25zdCB7IGxpc3RlblRvLCBzdG9wTGlzdGVuaW5nIH0gPSB1c2VCYWNrYm9uZSgpXG4gIHVzZUxpc3RlblRvKFxuICAgICh3cmVxciBhcyBhbnkpLnZlbnQsXG4gICAgJ3NlYXJjaDpsaW5lZGlzcGxheSBzZWFyY2g6cG9seWRpc3BsYXkgc2VhcmNoOmJib3hkaXNwbGF5IHNlYXJjaDpjaXJjbGVkaXNwbGF5IHNlYXJjaDprZXl3b3JkZGlzcGxheSBzZWFyY2g6YXJlYWRpc3BsYXknLFxuICAgIChtb2RlbDogYW55KSA9PiB7XG4gICAgICBzZXRNb2RlbHMoKGN1cnJlbnRNb2RlbHMpID0+IHtcbiAgICAgICAgbGV0IG5ld01vZGVscyA9IGN1cnJlbnRNb2RlbHNcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobW9kZWwpKSB7XG4gICAgICAgICAgbmV3TW9kZWxzID0gY3VycmVudE1vZGVscy5jb25jYXQoXG4gICAgICAgICAgICBtb2RlbC5maWx0ZXIoKG5ld01vZGVsKSA9PiAhY3VycmVudE1vZGVscy5pbmNsdWRlcyhuZXdNb2RlbCkpXG4gICAgICAgICAgKVxuICAgICAgICB9IGVsc2UgaWYgKCFjdXJyZW50TW9kZWxzLmluY2x1ZGVzKG1vZGVsKSkge1xuICAgICAgICAgIG5ld01vZGVscyA9IFsuLi5jdXJyZW50TW9kZWxzLCBtb2RlbF1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3TW9kZWxzXG4gICAgICB9KVxuICAgIH1cbiAgKVxuICB1c2VMaXN0ZW5Ubygod3JlcXIgYXMgYW55KS52ZW50LCAnc2VhcmNoOnJlbW92ZWRpc3BsYXknLCAobW9kZWw6IGFueSkgPT4ge1xuICAgIHNldE1vZGVscygoY3VycmVudE1vZGVscykgPT4ge1xuICAgICAgbGV0IG5ld01vZGVsc1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkobW9kZWwpKSB7XG4gICAgICAgIG5ld01vZGVscyA9IGN1cnJlbnRNb2RlbHMuZmlsdGVyKChtKSA9PiAhbW9kZWwuaW5jbHVkZXMobSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNb2RlbHMgPSBjdXJyZW50TW9kZWxzLmZpbHRlcigobSkgPT4gbSAhPT0gbW9kZWwpXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3TW9kZWxzXG4gICAgfSlcbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdzZWFyY2g6cmVxdWVzdGxvY2F0aW9ubW9kZWxzJylcbiAgfSwgW10pXG4gIGNvbnN0IHVwZGF0ZUZpbHRlck1vZGVscyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBmb3IgKGNvbnN0IG1vZGVsIG9mIGZpbHRlck1vZGVscykge1xuICAgICAgc3RvcExpc3RlbmluZyhtb2RlbClcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0RmlsdGVyID0gVHlwZWRVc2VySW5zdGFuY2UuZ2V0RXBoZW1lcmFsRmlsdGVyKClcbiAgICBjb25zdCBleHRyYWN0ZWRNb2RlbHMgPSBbXSBhcyBhbnlbXVxuICAgIGlmIChmaWx0ZXJUcmVlKSB7XG4gICAgICBleHRyYWN0TW9kZWxzRnJvbUZpbHRlcih7XG4gICAgICAgIGZpbHRlcjogZmlsdGVyVHJlZSxcbiAgICAgICAgZXh0cmFjdGVkTW9kZWxzLFxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKHJlc3VsdEZpbHRlcikge1xuICAgICAgLy8gV2UgaGF2ZSB0byB1c2UgdGhpcyBhbHRlcm5hdGUgbWV0aG9kIG9mIHVwZGF0aW5nIHRoZSBmaWx0ZXIgd2hlbiBkZWFsaW5nIHdpdGhcbiAgICAgIC8vIHRoZSByZXN1bHRGaWx0ZXIuIFdoZW4gdGhlIGxvY2F0aW9uIGlucHV0IGlzIHVubW91bnRlZCwgaXQgcmVzZXRzIGl0cyBsb2NhdGlvblxuICAgICAgLy8gbW9kZWwgYW5kIHJlbW92ZXMgaXQgZnJvbSBoZXJlIHZpYSB0aGUgc2VhcmNoOnJlbW92ZWRpc3BsYXkgZXZlbnQsIHNvIHdlIGNhbid0XG4gICAgICAvLyB1c2UgaXQgdG8gdXBkYXRlIHRoZSBmaWx0ZXIuIFRoZSBsb2NhdGlvbiBpbnB1dCBpcyB1bm1vdW50ZWQgd2hlbiB0aGUgcmVzdWx0XG4gICAgICAvLyBmaWx0ZXIgbWVudSBpcyBjbG9zZWQsIHdoaWNoIGl0IHVzdWFsbHkgaXMuIFNvLCB3ZSB1cGRhdGUgdGhlIGZpbHRlciBpbiB0aGVcbiAgICAgIC8vIHByZWZzIG1vZGVsIG91cnNlbHZlcywgd2hpY2ggY2F1c2VzIHRoaXMgZnVuY3Rpb24gdG8gYmUgcnVuIGFnYWluIHdpdGggdGhlIG5ld1xuICAgICAgLy8gZmlsdGVyLCBhbmQgd2UgY2FuIGRpc3BsYXkgaXQgY29ycmVjdGx5LlxuICAgICAgZXh0cmFjdE1vZGVsc0Zyb21GaWx0ZXIoe1xuICAgICAgICBmaWx0ZXI6IHJlc3VsdEZpbHRlcixcbiAgICAgICAgZXh0cmFjdGVkTW9kZWxzLFxuICAgICAgICBsaXN0ZW5UbyxcbiAgICAgICAgb25DaGFuZ2U6ICgpID0+IHtcbiAgICAgICAgICBUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLnNldChcbiAgICAgICAgICAgICdyZXN1bHRGaWx0ZXInLFxuICAgICAgICAgICAgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZXN1bHRGaWx0ZXIpKVxuICAgICAgICAgIClcbiAgICAgICAgICBUeXBlZFVzZXJJbnN0YW5jZS5zYXZlUHJlZmVyZW5jZXMoKVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gSWYgd2UgaGF2ZSBhIG1vZGVsIGZvciBhIHBhcnRpY3VsYXIgbG9jYXRpb25JZCBpbiBib3RoIG1vZGVscyBhbmQgZmlsdGVyTW9kZWxzLFxuICAgIC8vIHRoZW4ga2VlcCBvbmx5IHRoZSBvbmUgaW4gbW9kZWxzLCBzaW5jZSB0aGF0IGlzIHRoZSBzb3VyY2Ugb2YgdHJ1dGguIFJlbW92aW5nXG4gICAgLy8gdGhlIG9uZSBpbiBmaWx0ZXJNb2RlbHMgcHJldmVudHMgc29tZSBmbGlja2VyaW5nIHdoZW4gcmVsZWFzaW5nIHRoZSBtb3VzZSBvbiBhXG4gICAgLy8gbW92ZSBvcGVyYXRpb24uXG4gICAgY29uc3QgbG9jYXRpb25JZHMgPSBuZXcgU2V0KG1vZGVscy5tYXAoKG0pID0+IG0uZ2V0KCdsb2NhdGlvbklkJykpKVxuICAgIGNvbnN0IGRlZHVwZWRNb2RlbHMgPSBleHRyYWN0ZWRNb2RlbHMuZmlsdGVyKFxuICAgICAgKG0pID0+ICFsb2NhdGlvbklkcy5oYXMobS5nZXQoJ2xvY2F0aW9uSWQnKSlcbiAgICApXG4gICAgc2V0RmlsdGVyTW9kZWxzKGRlZHVwZWRNb2RlbHMpXG4gIH0sIFtmaWx0ZXJUcmVlLCBtb2RlbHNdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHVwZGF0ZUZpbHRlck1vZGVscygpXG4gIH0sIFt1cGRhdGVGaWx0ZXJNb2RlbHNdKVxuICB1c2VMaXN0ZW5UbyhzZWxlY3Rpb25JbnRlcmZhY2UsICdjaGFuZ2U6Y3VycmVudFF1ZXJ5JywgdXBkYXRlRmlsdGVyTW9kZWxzKVxuICB1c2VMaXN0ZW5UbyhcbiAgICBUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLFxuICAgICdjaGFuZ2U6cmVzdWx0RmlsdGVyJyxcbiAgICB1cGRhdGVGaWx0ZXJNb2RlbHNcbiAgKVxuICB1c2VMaXN0ZW5UbyhcbiAgICAod3JlcXIgYXMgYW55KS52ZW50LFxuICAgICdzZWFyY2g6ZHJhd2xpbmUgc2VhcmNoOmRyYXdwb2x5IHNlYXJjaDpkcmF3YmJveCBzZWFyY2g6ZHJhd2NpcmNsZScsXG4gICAgKG1vZGVsOiBhbnkpID0+IHtcbiAgICAgIGlmICghZHJhd2luZ01vZGVscy5pbmNsdWRlcyhtb2RlbCkpIHtcbiAgICAgICAgc2V0RHJhd2luZ01vZGVscyhbLi4uZHJhd2luZ01vZGVscywgbW9kZWxdKVxuICAgICAgfVxuICAgIH1cbiAgKVxuICB1c2VMaXN0ZW5UbyhcbiAgICAod3JlcXIgYXMgYW55KS52ZW50LFxuICAgICdzZWFyY2g6bGluZS1lbmQgc2VhcmNoOnBvbHktZW5kIHNlYXJjaDpiYm94LWVuZCBzZWFyY2g6Y2lyY2xlLWVuZCBzZWFyY2g6ZHJhd2NhbmNlbCBzZWFyY2g6ZHJhd2VuZCcsXG4gICAgKG1vZGVsOiBhbnkpID0+IHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShtb2RlbCkpIHtcbiAgICAgICAgbW9kZWwgPSBbbW9kZWxdXG4gICAgICB9XG4gICAgICBtb2RlbC5mb3JFYWNoKChzdWJtb2RlbDogYW55KSA9PiB7XG4gICAgICAgIGlmIChkcmF3aW5nTW9kZWxzLmluY2x1ZGVzKHN1Ym1vZGVsKSkge1xuICAgICAgICAgIHNldERyYXdpbmdNb2RlbHMoXG4gICAgICAgICAgICBkcmF3aW5nTW9kZWxzLmZpbHRlcigoZHJhd2luZ01vZGVsKSA9PiBkcmF3aW5nTW9kZWwgIT09IHN1Ym1vZGVsKVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwICYmIGlzRHJhd2luZykge1xuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignc2VhcmNoOnJlcXVlc3RkcmF3aW5nbW9kZWxzJylcbiAgICB9XG4gIH0sIFttYXBdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghaXNEcmF3aW5nKSB7XG4gICAgICBzZXREcmF3aW5nTW9kZWxzKFtdKVxuICAgIH1cbiAgfSwgW2lzRHJhd2luZ10pXG4gIGNvbnN0IGNhbGxiYWNrID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChtYXApIHtcbiAgICAgICAgY29uc3Qgc2hhcGVzRXhpc3QgPSBtYXAucGFuVG9TaGFwZXNFeHRlbnQoKVxuICAgICAgICBpZiAoIXNoYXBlc0V4aXN0KSB7XG4gICAgICAgICAgem9vbVRvSG9tZSh7IG1hcCB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCBbZmlsdGVyTW9kZWxzLCBtb2RlbHMsIG1hcF0pXG4gIHVzZU9uY2VJc05lYXJGaXJzdFJlbmRlcih7IGNhbGxiYWNrIH0pXG4gIHJldHVybiB7XG4gICAgbW9kZWxzLFxuICAgIGRyYXdpbmdNb2RlbHMsXG4gICAgZmlsdGVyTW9kZWxzLFxuICB9XG59XG4iXX0=