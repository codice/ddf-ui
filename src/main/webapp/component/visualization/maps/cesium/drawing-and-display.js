import { __assign, __read } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useState, useEffect } from 'react';
import { getDrawModeFromModel, getShapeFromDrawMode, getDrawModeFromShape, useDrawingAndDisplayModels, } from '../drawing-and-display';
import { CesiumBboxDisplay } from './bbox-display';
import { CesiumCircleDisplay } from './circle-display';
import { CesiumLineDisplay } from './line-display';
import { CesiumPolygonDisplay } from './polygon-display';
import { Editor } from '../draw-menu';
import { menu } from 'geospatialdraw';
import { DRAWING_STYLE } from '../openlayers/draw-styles';
import wreqr from '../../../../js/wreqr';
import _ from 'lodash';
import { InteractionsContext } from '../interactions.provider';
var DrawingMenu = menu.DrawingMenu;
var SHAPES = [
    'Bounding Box',
    'Line',
    'Point',
    'Point Radius',
    'Polygon',
];
var DEFAULT_SHAPE = 'Polygon';
export var removeOldDrawing = function (_a) {
    var map = _a.map, id = _a.id;
    var relevantPrimitives = map
        .getMap()
        .scene.primitives._primitives.filter(function (prim) {
        return prim.id === id;
    });
    relevantPrimitives.forEach(function (relevantPrimitive) {
        if (typeof relevantPrimitive.setEditMode === 'function') {
            // Need to call this to remove the editing billboards and click handlers
            relevantPrimitive.setEditMode(false);
        }
        map.getMap().scene.primitives.remove(relevantPrimitive);
    });
    relevantPrimitives.length > 0 && map.getMap().scene.requestRender();
};
export var makeOldDrawingNonEditable = function (_a) {
    var map = _a.map, id = _a.id;
    var relevantPrimitives = map
        .getMap()
        .scene.primitives._primitives.filter(function (prim) {
        return prim.id === id;
    });
    relevantPrimitives.forEach(function (relevantPrimitive) {
        if (typeof relevantPrimitive.setEditMode === 'function') {
            relevantPrimitive.setEditMode(false);
        }
        if (typeof relevantPrimitive.setEditable === 'function') {
            relevantPrimitive.setEditable(false);
        }
    });
    relevantPrimitives.length > 0 && map.getMap().scene.requestRender();
};
var drawingLocation;
var updateDrawingLocation = function (newDrawingLocation) {
    drawingLocation = newDrawingLocation;
};
var ensurePolygonIsClosed = function (polygon) {
    var points = polygon === null || polygon === void 0 ? void 0 : polygon.polygon;
    if (Array.isArray(points) && points.length > 0) {
        var first = points[0];
        var last = points[points.length - 1];
        if (!_.isEqual(first, last)) {
            points.push(first);
        }
    }
};
var pickLocation = function (model) {
    var mode = getDrawModeFromModel({ model: model });
    switch (mode) {
        case 'bbox':
            return _.pick(model.attributes, 'north', 'south', 'east', 'west');
        case 'circle':
            return _.pick(model.attributes, 'lat', 'lon');
        case 'line':
            return _.pick(model.attributes, 'line');
        case 'poly':
            return _.pick(model.attributes, 'polygon');
        default:
            return {};
    }
};
export var CesiumDrawings = function (_a) {
    var map = _a.map, selectionInterface = _a.selectionInterface;
    var _b = useDrawingAndDisplayModels({
        selectionInterface: selectionInterface,
        map: map,
    }), models = _b.models, filterModels = _b.filterModels, drawingModels = _b.drawingModels;
    var _c = __read(drawingModels.length > 0 ? drawingModels.slice(-1) : [undefined], 1), drawingModel = _c[0];
    var _d = __read(useState(false), 2), isDrawing = _d[0], setIsDrawing = _d[1];
    var _e = __read(useState(DEFAULT_SHAPE), 2), drawingShape = _e[0], setDrawingShape = _e[1];
    var _f = React.useContext(InteractionsContext), interactiveGeo = _f.interactiveGeo, translation = _f.translation, setInteractiveModels = _f.setInteractiveModels;
    var nonDrawingModels = models.concat(filterModels);
    useEffect(function () {
        var models = nonDrawingModels.filter(function (m) { return m.get('locationId') === interactiveGeo; });
        setInteractiveModels(models);
    }, [interactiveGeo, models, filterModels]);
    var handleKeydown = React.useCallback(function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (drawingLocation)
                finishDrawing();
        }
        if (e.key === 'Escape') {
            cancelDrawing();
        }
    }, [drawingModel, drawingShape, drawingLocation]);
    useEffect(function () {
        setIsDrawing(!!drawingModel);
        if (drawingModel) {
            window.addEventListener('keydown', handleKeydown);
            setDrawingShape(getShapeFromDrawMode(getDrawModeFromModel({ model: drawingModel })));
        }
        else {
            window.removeEventListener('keydown', handleKeydown);
        }
        return function () { return window.removeEventListener('keydown', handleKeydown); };
    }, [drawingModel]);
    var cancelDrawing = function () {
        drawingModel.set('drawing', false);
        // the listener for this calls Drawing.turnOffDrawing()
        wreqr.vent.trigger('search:drawcancel', drawingModel);
        setIsDrawing(false);
        drawingLocation = null;
    };
    var finishDrawing = function () {
        if (!drawingLocation) {
            cancelDrawing();
            return;
        }
        wreqr.vent.trigger("search:".concat(getDrawModeFromShape(drawingShape), "-end"), drawingModel);
        wreqr.vent.trigger("search:drawend", drawingModel);
        if (drawingShape === 'Polygon') {
            ensurePolygonIsClosed(drawingLocation);
        }
        drawingModel.set(__assign(__assign({}, drawingLocation), { drawing: false }));
        setIsDrawing(false);
        drawingLocation = null;
    };
    var isNotBeingEdited = function (model) {
        return !drawingModel || !_.isEqual(pickLocation(model), pickLocation(drawingModel));
    };
    /*
      When editing a shape, don't display the other models that correspond to that shape. Because
      we don't display shapes on the surface of the globe, we can't use Cesium's APIs to force the
      shape being edited to the top. If the corresponding models were shown, then multiple overlapping
      shapes would be drawn on the map, and the sole editable shape is not guaranteed to be visible
      or able to be interacted with.
      Note that we cannot compare the filterModel IDs to that of the drawingModel, because while a
      filterModel and a drawingModel may represent the same shape, they are different model object
      instances and have different IDs. Instead, we check for equivalent location attributes on the
      models.
      The models array is a different story, since it can contain the same model object instances
      as drawingModels, but we use the non-ID-based comparison method described above for it, too,
      to ensure consistent behavior.
    */
    return (_jsxs(_Fragment, { children: [nonDrawingModels.filter(isNotBeingEdited).map(function (model) {
                var drawMode = getDrawModeFromModel({ model: model });
                var isInteractive = model.get('locationId') === interactiveGeo;
                var shapeTranslation = translation && isInteractive ? translation : undefined;
                switch (drawMode) {
                    case 'bbox':
                        return (_jsx(CesiumBboxDisplay, { model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }, model.cid));
                    case 'circle':
                        return (_jsx(CesiumCircleDisplay, { model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }, model.cid));
                    case 'line':
                        return (_jsx(CesiumLineDisplay, { model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }, model.cid));
                    case 'poly':
                        return (_jsx(CesiumPolygonDisplay, { model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }, model.cid));
                    default:
                        return _jsx(_Fragment, {});
                }
            }), drawingModels.map(function (model) {
                var drawMode = getDrawModeFromModel({ model: model });
                switch (drawMode) {
                    case 'bbox':
                        return (_jsx(CesiumBboxDisplay, { model: model, map: map, onDraw: updateDrawingLocation }, model.cid));
                    case 'circle':
                        return (_jsx(CesiumCircleDisplay, { model: model, map: map, onDraw: updateDrawingLocation }, model.cid));
                    case 'line':
                        return (_jsx(CesiumLineDisplay, { model: model, map: map, onDraw: updateDrawingLocation }, model.cid));
                    case 'poly':
                        return (_jsx(CesiumPolygonDisplay, { model: model, map: map, onDraw: updateDrawingLocation }, model.cid));
                    default:
                        return _jsx(_Fragment, {});
                }
            }), drawingModel && (_jsx(Editor, { "data-id": "map-draw-menu", children: _jsx(DrawingMenu, { shape: drawingShape, map: {
                        addLayer: function () { },
                        removeInteraction: function () { },
                        addInteraction: function () { },
                    }, isActive: isDrawing, geometry: null, onCancel: cancelDrawing, onOk: finishDrawing, onSetShape: function () { }, disabledShapes: SHAPES.filter(function (shape) { return shape !== drawingShape; }), onUpdate: function () { }, saveAndContinue: false, mapStyle: DRAWING_STYLE }) }))] }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy1hbmQtZGlzcGxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2Nlc2l1bS9kcmF3aW5nLWFuZC1kaXNwbGF5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDM0MsT0FBTyxFQUNMLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLDBCQUEwQixHQUMzQixNQUFNLHdCQUF3QixDQUFBO0FBQy9CLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ2xELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ2xELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQ3hELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRXJDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUN6RCxPQUFPLEtBQUssTUFBTSxzQkFBc0IsQ0FBQTtBQUN4QyxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFJOUQsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQTtBQUVwQyxJQUFNLE1BQU0sR0FBWTtJQUN0QixjQUFjO0lBQ2QsTUFBTTtJQUNOLE9BQU87SUFD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LE9BQU8sQ0FDTCxLQUFDLGlCQUFpQixJQUVoQixLQUFLLEVBQUUsS0FBSyxFQUNaLEdBQUcsRUFBRSxHQUFHLEVBQ1IsTUFBTSxFQUFFLHFCQUFxQixJQUh4QixLQUFLLENBQUMsR0FBRyxDQUlkLENBQ0gsQ0FBQTtvQkFDSCxLQUFLLE1BQU07d0JBQ1QsT0FBTyxDQUNMLEtBQUMsb0JBQW9CLElBRW5CLEtBQUssRUFBRSxLQUFLLEVBQ1osR0FBRyxFQUFFLEdBQUcsRUFDUixNQUFNLEVBQUUscUJBQXFCLElBSHhCLEtBQUssQ0FBQyxHQUFHLENBSWQsQ0FDSCxDQUFBO29CQUNIO3dCQUNFLE9BQU8sbUJBQUssQ0FBQTtnQkFDaEIsQ0FBQztZQUNILENBQUMsQ0FBQyxFQVNELFlBQVksSUFBSSxDQUNmLEtBQUMsTUFBTSxlQUFTLGVBQWUsWUFDN0IsS0FBQyxXQUFXLElBQ1YsS0FBSyxFQUFFLFlBQVksRUFDbkIsR0FBRyxFQUFFO3dCQUNILFFBQVEsRUFBRSxjQUFPLENBQUM7d0JBQ2xCLGlCQUFpQixFQUFFLGNBQU8sQ0FBQzt3QkFDM0IsY0FBYyxFQUFFLGNBQU8sQ0FBQztxQkFDekIsRUFDRCxRQUFRLEVBQUUsU0FBUyxFQUNuQixRQUFRLEVBQUUsSUFBSSxFQUNkLFFBQVEsRUFBRSxhQUFhLEVBQ3ZCLElBQUksRUFBRSxhQUFhLEVBQ25CLFVBQVUsRUFBRSxjQUFPLENBQUMsRUFDcEIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLEtBQUssWUFBWSxFQUF0QixDQUFzQixDQUFDLEVBQ2hFLFFBQVEsRUFBRSxjQUFPLENBQUMsRUFDbEIsZUFBZSxFQUFFLEtBQUssRUFDdEIsUUFBUSxFQUFFLGFBQW9CLEdBQzlCLEdBQ0ssQ0FDVixJQUNBLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgZ2V0RHJhd01vZGVGcm9tTW9kZWwsXG4gIGdldFNoYXBlRnJvbURyYXdNb2RlLFxuICBnZXREcmF3TW9kZUZyb21TaGFwZSxcbiAgdXNlRHJhd2luZ0FuZERpc3BsYXlNb2RlbHMsXG59IGZyb20gJy4uL2RyYXdpbmctYW5kLWRpc3BsYXknXG5pbXBvcnQgeyBDZXNpdW1CYm94RGlzcGxheSB9IGZyb20gJy4vYmJveC1kaXNwbGF5J1xuaW1wb3J0IHsgQ2VzaXVtQ2lyY2xlRGlzcGxheSB9IGZyb20gJy4vY2lyY2xlLWRpc3BsYXknXG5pbXBvcnQgeyBDZXNpdW1MaW5lRGlzcGxheSB9IGZyb20gJy4vbGluZS1kaXNwbGF5J1xuaW1wb3J0IHsgQ2VzaXVtUG9seWdvbkRpc3BsYXkgfSBmcm9tICcuL3BvbHlnb24tZGlzcGxheSdcbmltcG9ydCB7IEVkaXRvciB9IGZyb20gJy4uL2RyYXctbWVudSdcbmltcG9ydCB7IG1lbnUgfSBmcm9tICdnZW9zcGF0aWFsZHJhdydcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnZ2Vvc3BhdGlhbGRyYXcvdGFyZ2V0L3dlYmFwcC9zaGFwZS11dGlscydcbmltcG9ydCB7IERSQVdJTkdfU1RZTEUgfSBmcm9tICcuLi9vcGVubGF5ZXJzL2RyYXctc3R5bGVzJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IHsgSW50ZXJhY3Rpb25zQ29udGV4dCB9IGZyb20gJy4uL2ludGVyYWN0aW9ucy5wcm92aWRlcidcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcblxuY29uc3QgRHJhd2luZ01lbnUgPSBtZW51LkRyYXdpbmdNZW51XG5cbmNvbnN0IFNIQVBFUzogU2hhcGVbXSA9IFtcbiAgJ0JvdW5kaW5nIEJveCcsXG4gICdMaW5lJyxcbiAgJ1BvaW50JyxcbiAgJ1BvaW50IFJhZGl1cycsXG4gICdQb2x5Z29uJyxcbl1cbmNvbnN0IERFRkFVTFRfU0hBUEUgPSAnUG9seWdvbidcblxuZXhwb3J0IGNvbnN0IHJlbW92ZU9sZERyYXdpbmcgPSAoeyBtYXAsIGlkIH06IHsgbWFwOiBhbnk7IGlkOiBzdHJpbmcgfSkgPT4ge1xuICBjb25zdCByZWxldmFudFByaW1pdGl2ZXMgPSBtYXBcbiAgICAuZ2V0TWFwKClcbiAgICAuc2NlbmUucHJpbWl0aXZlcy5fcHJpbWl0aXZlcy5maWx0ZXIoKHByaW06IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIHByaW0uaWQgPT09IGlkXG4gICAgfSlcbiAgcmVsZXZhbnRQcmltaXRpdmVzLmZvckVhY2goKHJlbGV2YW50UHJpbWl0aXZlOiBhbnkpID0+IHtcbiAgICBpZiAodHlwZW9mIHJlbGV2YW50UHJpbWl0aXZlLnNldEVkaXRNb2RlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBOZWVkIHRvIGNhbGwgdGhpcyB0byByZW1vdmUgdGhlIGVkaXRpbmcgYmlsbGJvYXJkcyBhbmQgY2xpY2sgaGFuZGxlcnNcbiAgICAgIHJlbGV2YW50UHJpbWl0aXZlLnNldEVkaXRNb2RlKGZhbHNlKVxuICAgIH1cbiAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucHJpbWl0aXZlcy5yZW1vdmUocmVsZXZhbnRQcmltaXRpdmUpXG4gIH0pXG4gIHJlbGV2YW50UHJpbWl0aXZlcy5sZW5ndGggPiAwICYmIG1hcC5nZXRNYXAoKS5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbn1cblxuZXhwb3J0IGNvbnN0IG1ha2VPbGREcmF3aW5nTm9uRWRpdGFibGUgPSAoe1xuICBtYXAsXG4gIGlkLFxufToge1xuICBtYXA6IGFueVxuICBpZDogc3RyaW5nXG59KSA9PiB7XG4gIGNvbnN0IHJlbGV2YW50UHJpbWl0aXZlcyA9IG1hcFxuICAgIC5nZXRNYXAoKVxuICAgIC5zY2VuZS5wcmltaXRpdmVzLl9wcmltaXRpdmVzLmZpbHRlcigocHJpbTogYW55KSA9PiB7XG4gICAgICByZXR1cm4gcHJpbS5pZCA9PT0gaWRcbiAgICB9KVxuICByZWxldmFudFByaW1pdGl2ZXMuZm9yRWFjaCgocmVsZXZhbnRQcmltaXRpdmU6IGFueSkgPT4ge1xuICAgIGlmICh0eXBlb2YgcmVsZXZhbnRQcmltaXRpdmUuc2V0RWRpdE1vZGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlbGV2YW50UHJpbWl0aXZlLnNldEVkaXRNb2RlKGZhbHNlKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHJlbGV2YW50UHJpbWl0aXZlLnNldEVkaXRhYmxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZWxldmFudFByaW1pdGl2ZS5zZXRFZGl0YWJsZShmYWxzZSlcbiAgICB9XG4gIH0pXG4gIHJlbGV2YW50UHJpbWl0aXZlcy5sZW5ndGggPiAwICYmIG1hcC5nZXRNYXAoKS5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbn1cblxubGV0IGRyYXdpbmdMb2NhdGlvbjogYW55XG5cbmNvbnN0IHVwZGF0ZURyYXdpbmdMb2NhdGlvbiA9IChuZXdEcmF3aW5nTG9jYXRpb246IGFueSkgPT4ge1xuICBkcmF3aW5nTG9jYXRpb24gPSBuZXdEcmF3aW5nTG9jYXRpb25cbn1cblxuY29uc3QgZW5zdXJlUG9seWdvbklzQ2xvc2VkID0gKHBvbHlnb246IGFueSkgPT4ge1xuICBjb25zdCBwb2ludHMgPSBwb2x5Z29uPy5wb2x5Z29uXG4gIGlmIChBcnJheS5pc0FycmF5KHBvaW50cykgJiYgcG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBmaXJzdCA9IHBvaW50c1swXVxuICAgIGNvbnN0IGxhc3QgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdXG4gICAgaWYgKCFfLmlzRXF1YWwoZmlyc3QsIGxhc3QpKSB7XG4gICAgICBwb2ludHMucHVzaChmaXJzdClcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgcGlja0xvY2F0aW9uID0gKG1vZGVsPzogYW55KSA9PiB7XG4gIGNvbnN0IG1vZGUgPSBnZXREcmF3TW9kZUZyb21Nb2RlbCh7IG1vZGVsIH0pXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgJ2Jib3gnOlxuICAgICAgcmV0dXJuIF8ucGljayhtb2RlbC5hdHRyaWJ1dGVzLCAnbm9ydGgnLCAnc291dGgnLCAnZWFzdCcsICd3ZXN0JylcbiAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgcmV0dXJuIF8ucGljayhtb2RlbC5hdHRyaWJ1dGVzLCAnbGF0JywgJ2xvbicpXG4gICAgY2FzZSAnbGluZSc6XG4gICAgICByZXR1cm4gXy5waWNrKG1vZGVsLmF0dHJpYnV0ZXMsICdsaW5lJylcbiAgICBjYXNlICdwb2x5JzpcbiAgICAgIHJldHVybiBfLnBpY2sobW9kZWwuYXR0cmlidXRlcywgJ3BvbHlnb24nKVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge31cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ2VzaXVtRHJhd2luZ3MgPSAoe1xuICBtYXAsXG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbn0pID0+IHtcbiAgY29uc3QgeyBtb2RlbHMsIGZpbHRlck1vZGVscywgZHJhd2luZ01vZGVscyB9ID0gdXNlRHJhd2luZ0FuZERpc3BsYXlNb2RlbHMoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgICBtYXAsXG4gIH0pXG5cbiAgY29uc3QgW2RyYXdpbmdNb2RlbF0gPVxuICAgIGRyYXdpbmdNb2RlbHMubGVuZ3RoID4gMCA/IGRyYXdpbmdNb2RlbHMuc2xpY2UoLTEpIDogW3VuZGVmaW5lZF1cblxuICBjb25zdCBbaXNEcmF3aW5nLCBzZXRJc0RyYXdpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtkcmF3aW5nU2hhcGUsIHNldERyYXdpbmdTaGFwZV0gPSB1c2VTdGF0ZTxTaGFwZT4oREVGQVVMVF9TSEFQRSlcblxuICBjb25zdCB7IGludGVyYWN0aXZlR2VvLCB0cmFuc2xhdGlvbiwgc2V0SW50ZXJhY3RpdmVNb2RlbHMgfSA9XG4gICAgUmVhY3QudXNlQ29udGV4dChJbnRlcmFjdGlvbnNDb250ZXh0KVxuXG4gIGNvbnN0IG5vbkRyYXdpbmdNb2RlbHMgPSBtb2RlbHMuY29uY2F0KGZpbHRlck1vZGVscylcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG1vZGVscyA9IG5vbkRyYXdpbmdNb2RlbHMuZmlsdGVyKFxuICAgICAgKG0pID0+IG0uZ2V0KCdsb2NhdGlvbklkJykgPT09IGludGVyYWN0aXZlR2VvXG4gICAgKVxuICAgIHNldEludGVyYWN0aXZlTW9kZWxzKG1vZGVscylcbiAgfSwgW2ludGVyYWN0aXZlR2VvLCBtb2RlbHMsIGZpbHRlck1vZGVsc10pXG5cbiAgY29uc3QgaGFuZGxlS2V5ZG93biA9IFJlYWN0LnVzZUNhbGxiYWNrKFxuICAgIChlOiBhbnkpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgaWYgKGRyYXdpbmdMb2NhdGlvbikgZmluaXNoRHJhd2luZygpXG4gICAgICB9XG4gICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgIGNhbmNlbERyYXdpbmcoKVxuICAgICAgfVxuICAgIH0sXG4gICAgW2RyYXdpbmdNb2RlbCwgZHJhd2luZ1NoYXBlLCBkcmF3aW5nTG9jYXRpb25dXG4gIClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldElzRHJhd2luZyghIWRyYXdpbmdNb2RlbClcbiAgICBpZiAoZHJhd2luZ01vZGVsKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUtleWRvd24pXG4gICAgICBzZXREcmF3aW5nU2hhcGUoXG4gICAgICAgIGdldFNoYXBlRnJvbURyYXdNb2RlKGdldERyYXdNb2RlRnJvbU1vZGVsKHsgbW9kZWw6IGRyYXdpbmdNb2RlbCB9KSlcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICB9LCBbZHJhd2luZ01vZGVsXSlcblxuICBjb25zdCBjYW5jZWxEcmF3aW5nID0gKCkgPT4ge1xuICAgIGRyYXdpbmdNb2RlbC5zZXQoJ2RyYXdpbmcnLCBmYWxzZSlcbiAgICAvLyB0aGUgbGlzdGVuZXIgZm9yIHRoaXMgY2FsbHMgRHJhd2luZy50dXJuT2ZmRHJhd2luZygpXG4gICAgd3JlcXIudmVudC50cmlnZ2VyKCdzZWFyY2g6ZHJhd2NhbmNlbCcsIGRyYXdpbmdNb2RlbClcbiAgICBzZXRJc0RyYXdpbmcoZmFsc2UpXG4gICAgZHJhd2luZ0xvY2F0aW9uID0gbnVsbFxuICB9XG5cbiAgY29uc3QgZmluaXNoRHJhd2luZyA9ICgpID0+IHtcbiAgICBpZiAoIWRyYXdpbmdMb2NhdGlvbikge1xuICAgICAgY2FuY2VsRHJhd2luZygpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB3cmVxci52ZW50LnRyaWdnZXIoXG4gICAgICBgc2VhcmNoOiR7Z2V0RHJhd01vZGVGcm9tU2hhcGUoZHJhd2luZ1NoYXBlKX0tZW5kYCxcbiAgICAgIGRyYXdpbmdNb2RlbFxuICAgIClcbiAgICB3cmVxci52ZW50LnRyaWdnZXIoYHNlYXJjaDpkcmF3ZW5kYCwgZHJhd2luZ01vZGVsKVxuICAgIGlmIChkcmF3aW5nU2hhcGUgPT09ICdQb2x5Z29uJykge1xuICAgICAgZW5zdXJlUG9seWdvbklzQ2xvc2VkKGRyYXdpbmdMb2NhdGlvbilcbiAgICB9XG4gICAgZHJhd2luZ01vZGVsLnNldCh7IC4uLmRyYXdpbmdMb2NhdGlvbiwgZHJhd2luZzogZmFsc2UgfSlcbiAgICBzZXRJc0RyYXdpbmcoZmFsc2UpXG4gICAgZHJhd2luZ0xvY2F0aW9uID0gbnVsbFxuICB9XG5cbiAgY29uc3QgaXNOb3RCZWluZ0VkaXRlZCA9IChtb2RlbDogYW55KSA9PlxuICAgICFkcmF3aW5nTW9kZWwgfHwgIV8uaXNFcXVhbChwaWNrTG9jYXRpb24obW9kZWwpLCBwaWNrTG9jYXRpb24oZHJhd2luZ01vZGVsKSlcblxuICAvKlxuICAgIFdoZW4gZWRpdGluZyBhIHNoYXBlLCBkb24ndCBkaXNwbGF5IHRoZSBvdGhlciBtb2RlbHMgdGhhdCBjb3JyZXNwb25kIHRvIHRoYXQgc2hhcGUuIEJlY2F1c2VcbiAgICB3ZSBkb24ndCBkaXNwbGF5IHNoYXBlcyBvbiB0aGUgc3VyZmFjZSBvZiB0aGUgZ2xvYmUsIHdlIGNhbid0IHVzZSBDZXNpdW0ncyBBUElzIHRvIGZvcmNlIHRoZVxuICAgIHNoYXBlIGJlaW5nIGVkaXRlZCB0byB0aGUgdG9wLiBJZiB0aGUgY29ycmVzcG9uZGluZyBtb2RlbHMgd2VyZSBzaG93biwgdGhlbiBtdWx0aXBsZSBvdmVybGFwcGluZ1xuICAgIHNoYXBlcyB3b3VsZCBiZSBkcmF3biBvbiB0aGUgbWFwLCBhbmQgdGhlIHNvbGUgZWRpdGFibGUgc2hhcGUgaXMgbm90IGd1YXJhbnRlZWQgdG8gYmUgdmlzaWJsZVxuICAgIG9yIGFibGUgdG8gYmUgaW50ZXJhY3RlZCB3aXRoLlxuICAgIE5vdGUgdGhhdCB3ZSBjYW5ub3QgY29tcGFyZSB0aGUgZmlsdGVyTW9kZWwgSURzIHRvIHRoYXQgb2YgdGhlIGRyYXdpbmdNb2RlbCwgYmVjYXVzZSB3aGlsZSBhXG4gICAgZmlsdGVyTW9kZWwgYW5kIGEgZHJhd2luZ01vZGVsIG1heSByZXByZXNlbnQgdGhlIHNhbWUgc2hhcGUsIHRoZXkgYXJlIGRpZmZlcmVudCBtb2RlbCBvYmplY3RcbiAgICBpbnN0YW5jZXMgYW5kIGhhdmUgZGlmZmVyZW50IElEcy4gSW5zdGVhZCwgd2UgY2hlY2sgZm9yIGVxdWl2YWxlbnQgbG9jYXRpb24gYXR0cmlidXRlcyBvbiB0aGVcbiAgICBtb2RlbHMuXG4gICAgVGhlIG1vZGVscyBhcnJheSBpcyBhIGRpZmZlcmVudCBzdG9yeSwgc2luY2UgaXQgY2FuIGNvbnRhaW4gdGhlIHNhbWUgbW9kZWwgb2JqZWN0IGluc3RhbmNlc1xuICAgIGFzIGRyYXdpbmdNb2RlbHMsIGJ1dCB3ZSB1c2UgdGhlIG5vbi1JRC1iYXNlZCBjb21wYXJpc29uIG1ldGhvZCBkZXNjcmliZWQgYWJvdmUgZm9yIGl0LCB0b28sXG4gICAgdG8gZW5zdXJlIGNvbnNpc3RlbnQgYmVoYXZpb3IuXG4gICovXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtub25EcmF3aW5nTW9kZWxzLmZpbHRlcihpc05vdEJlaW5nRWRpdGVkKS5tYXAoKG1vZGVsKSA9PiB7XG4gICAgICAgIGNvbnN0IGRyYXdNb2RlID0gZ2V0RHJhd01vZGVGcm9tTW9kZWwoeyBtb2RlbCB9KVxuICAgICAgICBjb25zdCBpc0ludGVyYWN0aXZlID0gbW9kZWwuZ2V0KCdsb2NhdGlvbklkJykgPT09IGludGVyYWN0aXZlR2VvXG4gICAgICAgIGNvbnN0IHNoYXBlVHJhbnNsYXRpb24gPVxuICAgICAgICAgIHRyYW5zbGF0aW9uICYmIGlzSW50ZXJhY3RpdmUgPyB0cmFuc2xhdGlvbiA6IHVuZGVmaW5lZFxuICAgICAgICBzd2l0Y2ggKGRyYXdNb2RlKSB7XG4gICAgICAgICAgY2FzZSAnYmJveCc6XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8Q2VzaXVtQmJveERpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgaXNJbnRlcmFjdGl2ZT17aXNJbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbj17c2hhcGVUcmFuc2xhdGlvbn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIClcbiAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPENlc2l1bUNpcmNsZURpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgaXNJbnRlcmFjdGl2ZT17aXNJbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbj17c2hhcGVUcmFuc2xhdGlvbn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIClcbiAgICAgICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxDZXNpdW1MaW5lRGlzcGxheVxuICAgICAgICAgICAgICAgIGtleT17bW9kZWwuY2lkfVxuICAgICAgICAgICAgICAgIG1vZGVsPXttb2RlbH1cbiAgICAgICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgICAgICBpc0ludGVyYWN0aXZlPXtpc0ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uPXtzaGFwZVRyYW5zbGF0aW9ufVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIGNhc2UgJ3BvbHknOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPENlc2l1bVBvbHlnb25EaXNwbGF5XG4gICAgICAgICAgICAgICAga2V5PXttb2RlbC5jaWR9XG4gICAgICAgICAgICAgICAgbW9kZWw9e21vZGVsfVxuICAgICAgICAgICAgICAgIG1hcD17bWFwfVxuICAgICAgICAgICAgICAgIGlzSW50ZXJhY3RpdmU9e2lzSW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb249e3NoYXBlVHJhbnNsYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiA8PjwvPlxuICAgICAgICB9XG4gICAgICB9KX1cbiAgICAgIHtkcmF3aW5nTW9kZWxzLm1hcCgobW9kZWwpID0+IHtcbiAgICAgICAgY29uc3QgZHJhd01vZGUgPSBnZXREcmF3TW9kZUZyb21Nb2RlbCh7IG1vZGVsIH0pXG4gICAgICAgIHN3aXRjaCAoZHJhd01vZGUpIHtcbiAgICAgICAgICBjYXNlICdiYm94JzpcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxDZXNpdW1CYm94RGlzcGxheVxuICAgICAgICAgICAgICAgIGtleT17bW9kZWwuY2lkfVxuICAgICAgICAgICAgICAgIG1vZGVsPXttb2RlbH1cbiAgICAgICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgICAgICBvbkRyYXc9e3VwZGF0ZURyYXdpbmdMb2NhdGlvbn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIClcbiAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPENlc2l1bUNpcmNsZURpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgb25EcmF3PXt1cGRhdGVEcmF3aW5nTG9jYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8Q2VzaXVtTGluZURpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgb25EcmF3PXt1cGRhdGVEcmF3aW5nTG9jYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgY2FzZSAncG9seSc6XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8Q2VzaXVtUG9seWdvbkRpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgb25EcmF3PXt1cGRhdGVEcmF3aW5nTG9jYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiA8PjwvPlxuICAgICAgICB9XG4gICAgICB9KX1cblxuICAgICAgey8qXG4gICAgICAgIFVzZSBnZW9zcGF0aWFsZHJhdydzIHRvb2xiYXIgZXZlbiB0aG91Z2ggZ2Vvc3BhdGlhbGRyYXcgZG9lcyBub3Qgc3VwcG9ydCBDZXNpdW0uXG4gICAgICAgIFdlIGRvbid0IGFjdHVhbGx5IHVzZSB0aGUgbGlicmFyeSBmb3IgZHJhd2luZywgYnV0IHdlIHdhbnQgdGhlIGRyYXdpbmcgZXhwZXJpZW5jZVxuICAgICAgICBvbiB0aGUgM0QgbWFwIHRvIGxvb2sgbGlrZSBpdCBkb2VzIG9uIHRoZSAyRCBtYXAuIFRoaXMgaXMgd2h5IHdlIG9ubHkgY2FyZSBhYm91dFxuICAgICAgICB0aGUgc2hhcGUgaWNvbiBkaXNwbGF5ZWQgb24gdGhlIHRvb2xiYXIgYW5kIHRoZSBhcHBseS9jYW5jZWwgaGFuZGxlcnM7IGV2ZXJ5dGhpbmdcbiAgICAgICAgZWxzZSBpcyBqdXN0IG5vLW9wcy5cbiAgICAgICovfVxuICAgICAge2RyYXdpbmdNb2RlbCAmJiAoXG4gICAgICAgIDxFZGl0b3IgZGF0YS1pZD1cIm1hcC1kcmF3LW1lbnVcIj5cbiAgICAgICAgICA8RHJhd2luZ01lbnVcbiAgICAgICAgICAgIHNoYXBlPXtkcmF3aW5nU2hhcGV9XG4gICAgICAgICAgICBtYXA9e3tcbiAgICAgICAgICAgICAgYWRkTGF5ZXI6ICgpID0+IHt9LFxuICAgICAgICAgICAgICByZW1vdmVJbnRlcmFjdGlvbjogKCkgPT4ge30sXG4gICAgICAgICAgICAgIGFkZEludGVyYWN0aW9uOiAoKSA9PiB7fSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBpc0FjdGl2ZT17aXNEcmF3aW5nfVxuICAgICAgICAgICAgZ2VvbWV0cnk9e251bGx9XG4gICAgICAgICAgICBvbkNhbmNlbD17Y2FuY2VsRHJhd2luZ31cbiAgICAgICAgICAgIG9uT2s9e2ZpbmlzaERyYXdpbmd9XG4gICAgICAgICAgICBvblNldFNoYXBlPXsoKSA9PiB7fX1cbiAgICAgICAgICAgIGRpc2FibGVkU2hhcGVzPXtTSEFQRVMuZmlsdGVyKChzaGFwZSkgPT4gc2hhcGUgIT09IGRyYXdpbmdTaGFwZSl9XG4gICAgICAgICAgICBvblVwZGF0ZT17KCkgPT4ge319XG4gICAgICAgICAgICBzYXZlQW5kQ29udGludWU9e2ZhbHNlfVxuICAgICAgICAgICAgbWFwU3R5bGU9e0RSQVdJTkdfU1RZTEUgYXMgYW55fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvRWRpdG9yPlxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuIl19