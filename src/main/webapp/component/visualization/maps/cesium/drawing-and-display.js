import { __assign, __read } from "tslib";
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
var makeOldDrawingNonEditable = function (_a) {
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
var nestedArraysOverlap = function (arrayA, arrayB) {
    return arrayA.some(function (elemA) {
        return arrayB.some(function (elemB) { return JSON.stringify(elemA) === JSON.stringify(elemB); });
    });
};
var isNewShape = function (model) {
    var mode = model.get('mode');
    switch (mode) {
        case 'bbox':
            var box = {
                north: model.get('north'),
                east: model.get('east'),
                west: model.get('west'),
                south: model.get('south'),
            };
            var prevModel = model.previousAttributes();
            if (box.north && prevModel) {
                var prevBox = {
                    north: prevModel['north'],
                    east: prevModel['east'],
                    west: prevModel['west'],
                    south: prevModel['south'],
                };
                if (prevBox.north) {
                    return !(box.north === prevBox.north ||
                        box.east === prevBox.east ||
                        box.west === prevBox.west ||
                        box.south === prevBox.south);
                }
            }
        case 'circle':
            var circle = { lon: model.get('lon'), lat: model.get('lat') };
            prevModel = model.previousAttributes();
            if (circle && prevModel) {
                var prevCircle = { lon: prevModel['lon'], lat: prevModel['lat'] };
                if (prevCircle.lat && prevCircle.lon) {
                    return !(circle.lat === prevCircle.lat || circle.lon === prevCircle.lon);
                }
            }
        case 'line':
            var line = model.get('line');
            prevModel = model.previousAttributes();
            if (line && prevModel) {
                var prevLine = prevModel['line'];
                if (prevLine) {
                    return !nestedArraysOverlap(line, prevLine);
                }
            }
        case 'poly':
            var poly = model.get('polygon');
            prevModel = model.previousAttributes();
            if (prevModel) {
                var prevPoly = prevModel['polygon'];
                if (prevPoly) {
                    return !nestedArraysOverlap(poly, prevPoly);
                }
            }
        default:
            return false;
    }
};
export var removeOrLockOldDrawing = function (isInteractive, id, map, model) {
    var canChange = [
        'isInteractive',
        'polygonBufferWidth',
        'lineWidth',
        'line',
        'polygon',
        'usng',
        'bbox',
    ];
    // remove previous shape from map after updating attributes, dragging shape, or exiting interactive mode
    if (isInteractive ||
        (!isInteractive &&
            Object.keys(model.changed).some(function (change) { return canChange.includes(change); }) &&
            !isNewShape(model))) {
        removeOldDrawing({ map: map, id: id });
    }
    else {
        makeOldDrawingNonEditable({ map: map, id: id });
    }
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
    return (React.createElement(React.Fragment, null,
        nonDrawingModels.filter(isNotBeingEdited).map(function (model) {
            var drawMode = getDrawModeFromModel({ model: model });
            var isInteractive = model.get('locationId') === interactiveGeo;
            var shapeTranslation = translation && isInteractive ? translation : undefined;
            switch (drawMode) {
                case 'bbox':
                    return (React.createElement(CesiumBboxDisplay, { key: model.cid, model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }));
                case 'circle':
                    return (React.createElement(CesiumCircleDisplay, { key: model.cid, model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }));
                case 'line':
                    return (React.createElement(CesiumLineDisplay, { key: model.cid, model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }));
                case 'poly':
                    return (React.createElement(CesiumPolygonDisplay, { key: model.cid, model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }));
                default:
                    return React.createElement(React.Fragment, null);
            }
        }),
        drawingModels.map(function (model) {
            var drawMode = getDrawModeFromModel({ model: model });
            switch (drawMode) {
                case 'bbox':
                    return (React.createElement(CesiumBboxDisplay, { key: model.cid, model: model, map: map, onDraw: updateDrawingLocation }));
                case 'circle':
                    return (React.createElement(CesiumCircleDisplay, { key: model.cid, model: model, map: map, onDraw: updateDrawingLocation }));
                case 'line':
                    return (React.createElement(CesiumLineDisplay, { key: model.cid, model: model, map: map, onDraw: updateDrawingLocation }));
                case 'poly':
                    return (React.createElement(CesiumPolygonDisplay, { key: model.cid, model: model, map: map, onDraw: updateDrawingLocation }));
                default:
                    return React.createElement(React.Fragment, null);
            }
        }),
        drawingModel && (React.createElement(Editor, { "data-id": "map-draw-menu" },
            React.createElement(DrawingMenu, { shape: drawingShape, map: {
                    addLayer: function () { },
                    removeInteraction: function () { },
                    addInteraction: function () { },
                }, isActive: isDrawing, geometry: null, onCancel: cancelDrawing, onOk: finishDrawing, onSetShape: function () { }, disabledShapes: SHAPES.filter(function (shape) { return shape !== drawingShape; }), onUpdate: function () { }, saveAndContinue: false, mapStyle: DRAWING_STYLE })))));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy1hbmQtZGlzcGxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2Nlc2l1bS9kcmF3aW5nLWFuZC1kaXNwbGF5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUMzQyxPQUFPLEVBQ0wsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsMEJBQTBCLEdBQzNCLE1BQU0sd0JBQXdCLENBQUE7QUFDL0IsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDeEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFckMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQ3pELE9BQU8sS0FBSyxNQUFNLHNCQUFzQixDQUFBO0FBQ3hDLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUk5RCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFBO0FBRXBDLElBQU0sTUFBTSxHQUFZO0lBQ3RCLGNBQWM7SUFDZCxNQUFNO0lBQ04sT0FBTztJQUNQ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LEVBQUUsS0FBSyxFQUNaLEdBQUcsRUFBRSxHQUFHLEVBQ1IsTUFBTSxFQUFFLHFCQUFxQixHQUM3QixDQUNILENBQUE7Z0JBQ0gsS0FBSyxNQUFNO29CQUNULE9BQU8sQ0FDTCxvQkFBQyxvQkFBb0IsSUFDbkIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQ2QsS0FBSyxFQUFFLEtBQUssRUFDWixHQUFHLEVBQUUsR0FBRyxFQUNSLE1BQU0sRUFBRSxxQkFBcUIsR0FDN0IsQ0FDSCxDQUFBO2dCQUNIO29CQUNFLE9BQU8seUNBQUssQ0FBQTthQUNmO1FBQ0gsQ0FBQyxDQUFDO1FBU0QsWUFBWSxJQUFJLENBQ2Ysb0JBQUMsTUFBTSxlQUFTLGVBQWU7WUFDN0Isb0JBQUMsV0FBVyxJQUNWLEtBQUssRUFBRSxZQUFZLEVBQ25CLEdBQUcsRUFBRTtvQkFDSCxRQUFRLEVBQUUsY0FBTyxDQUFDO29CQUNsQixpQkFBaUIsRUFBRSxjQUFPLENBQUM7b0JBQzNCLGNBQWMsRUFBRSxjQUFPLENBQUM7aUJBQ3pCLEVBQ0QsUUFBUSxFQUFFLFNBQVMsRUFDbkIsUUFBUSxFQUFFLElBQUksRUFDZCxRQUFRLEVBQUUsYUFBYSxFQUN2QixJQUFJLEVBQUUsYUFBYSxFQUNuQixVQUFVLEVBQUUsY0FBTyxDQUFDLEVBQ3BCLGNBQWMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxLQUFLLFlBQVksRUFBdEIsQ0FBc0IsQ0FBQyxFQUNoRSxRQUFRLEVBQUUsY0FBTyxDQUFDLEVBQ2xCLGVBQWUsRUFBRSxLQUFLLEVBQ3RCLFFBQVEsRUFBRSxhQUFhLEdBQ3ZCLENBQ0ssQ0FDVixDQUNBLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgZ2V0RHJhd01vZGVGcm9tTW9kZWwsXG4gIGdldFNoYXBlRnJvbURyYXdNb2RlLFxuICBnZXREcmF3TW9kZUZyb21TaGFwZSxcbiAgdXNlRHJhd2luZ0FuZERpc3BsYXlNb2RlbHMsXG59IGZyb20gJy4uL2RyYXdpbmctYW5kLWRpc3BsYXknXG5pbXBvcnQgeyBDZXNpdW1CYm94RGlzcGxheSB9IGZyb20gJy4vYmJveC1kaXNwbGF5J1xuaW1wb3J0IHsgQ2VzaXVtQ2lyY2xlRGlzcGxheSB9IGZyb20gJy4vY2lyY2xlLWRpc3BsYXknXG5pbXBvcnQgeyBDZXNpdW1MaW5lRGlzcGxheSB9IGZyb20gJy4vbGluZS1kaXNwbGF5J1xuaW1wb3J0IHsgQ2VzaXVtUG9seWdvbkRpc3BsYXkgfSBmcm9tICcuL3BvbHlnb24tZGlzcGxheSdcbmltcG9ydCB7IEVkaXRvciB9IGZyb20gJy4uL2RyYXctbWVudSdcbmltcG9ydCB7IG1lbnUgfSBmcm9tICdnZW9zcGF0aWFsZHJhdydcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnZ2Vvc3BhdGlhbGRyYXcvdGFyZ2V0L3dlYmFwcC9zaGFwZS11dGlscydcbmltcG9ydCB7IERSQVdJTkdfU1RZTEUgfSBmcm9tICcuLi9vcGVubGF5ZXJzL2RyYXctc3R5bGVzJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IHsgSW50ZXJhY3Rpb25zQ29udGV4dCB9IGZyb20gJy4uL2ludGVyYWN0aW9ucy5wcm92aWRlcidcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcblxuY29uc3QgRHJhd2luZ01lbnUgPSBtZW51LkRyYXdpbmdNZW51XG5cbmNvbnN0IFNIQVBFUzogU2hhcGVbXSA9IFtcbiAgJ0JvdW5kaW5nIEJveCcsXG4gICdMaW5lJyxcbiAgJ1BvaW50JyxcbiAgJ1BvaW50IFJhZGl1cycsXG4gICdQb2x5Z29uJyxcbl1cbmNvbnN0IERFRkFVTFRfU0hBUEUgPSAnUG9seWdvbidcblxuZXhwb3J0IGNvbnN0IHJlbW92ZU9sZERyYXdpbmcgPSAoeyBtYXAsIGlkIH06IHsgbWFwOiBhbnk7IGlkOiBzdHJpbmcgfSkgPT4ge1xuICBjb25zdCByZWxldmFudFByaW1pdGl2ZXMgPSBtYXBcbiAgICAuZ2V0TWFwKClcbiAgICAuc2NlbmUucHJpbWl0aXZlcy5fcHJpbWl0aXZlcy5maWx0ZXIoKHByaW06IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIHByaW0uaWQgPT09IGlkXG4gICAgfSlcbiAgcmVsZXZhbnRQcmltaXRpdmVzLmZvckVhY2goKHJlbGV2YW50UHJpbWl0aXZlOiBhbnkpID0+IHtcbiAgICBpZiAodHlwZW9mIHJlbGV2YW50UHJpbWl0aXZlLnNldEVkaXRNb2RlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBOZWVkIHRvIGNhbGwgdGhpcyB0byByZW1vdmUgdGhlIGVkaXRpbmcgYmlsbGJvYXJkcyBhbmQgY2xpY2sgaGFuZGxlcnNcbiAgICAgIHJlbGV2YW50UHJpbWl0aXZlLnNldEVkaXRNb2RlKGZhbHNlKVxuICAgIH1cbiAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucHJpbWl0aXZlcy5yZW1vdmUocmVsZXZhbnRQcmltaXRpdmUpXG4gIH0pXG4gIHJlbGV2YW50UHJpbWl0aXZlcy5sZW5ndGggPiAwICYmIG1hcC5nZXRNYXAoKS5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbn1cblxuY29uc3QgbWFrZU9sZERyYXdpbmdOb25FZGl0YWJsZSA9ICh7IG1hcCwgaWQgfTogeyBtYXA6IGFueTsgaWQ6IHN0cmluZyB9KSA9PiB7XG4gIGNvbnN0IHJlbGV2YW50UHJpbWl0aXZlcyA9IG1hcFxuICAgIC5nZXRNYXAoKVxuICAgIC5zY2VuZS5wcmltaXRpdmVzLl9wcmltaXRpdmVzLmZpbHRlcigocHJpbTogYW55KSA9PiB7XG4gICAgICByZXR1cm4gcHJpbS5pZCA9PT0gaWRcbiAgICB9KVxuICByZWxldmFudFByaW1pdGl2ZXMuZm9yRWFjaCgocmVsZXZhbnRQcmltaXRpdmU6IGFueSkgPT4ge1xuICAgIGlmICh0eXBlb2YgcmVsZXZhbnRQcmltaXRpdmUuc2V0RWRpdE1vZGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlbGV2YW50UHJpbWl0aXZlLnNldEVkaXRNb2RlKGZhbHNlKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHJlbGV2YW50UHJpbWl0aXZlLnNldEVkaXRhYmxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZWxldmFudFByaW1pdGl2ZS5zZXRFZGl0YWJsZShmYWxzZSlcbiAgICB9XG4gIH0pXG4gIHJlbGV2YW50UHJpbWl0aXZlcy5sZW5ndGggPiAwICYmIG1hcC5nZXRNYXAoKS5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbn1cblxuY29uc3QgbmVzdGVkQXJyYXlzT3ZlcmxhcCA9IChhcnJheUE6IGFueVtdLCBhcnJheUI6IGFueVtdKSA9PiB7XG4gIHJldHVybiBhcnJheUEuc29tZSgoZWxlbUEpID0+XG4gICAgYXJyYXlCLnNvbWUoKGVsZW1CKSA9PiBKU09OLnN0cmluZ2lmeShlbGVtQSkgPT09IEpTT04uc3RyaW5naWZ5KGVsZW1CKSlcbiAgKVxufVxuXG5jb25zdCBpc05ld1NoYXBlID0gKG1vZGVsOiBhbnkpID0+IHtcbiAgY29uc3QgbW9kZSA9IG1vZGVsLmdldCgnbW9kZScpXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgJ2Jib3gnOlxuICAgICAgY29uc3QgYm94ID0ge1xuICAgICAgICBub3J0aDogbW9kZWwuZ2V0KCdub3J0aCcpLFxuICAgICAgICBlYXN0OiBtb2RlbC5nZXQoJ2Vhc3QnKSxcbiAgICAgICAgd2VzdDogbW9kZWwuZ2V0KCd3ZXN0JyksXG4gICAgICAgIHNvdXRoOiBtb2RlbC5nZXQoJ3NvdXRoJyksXG4gICAgICB9XG4gICAgICBsZXQgcHJldk1vZGVsID0gbW9kZWwucHJldmlvdXNBdHRyaWJ1dGVzKClcbiAgICAgIGlmIChib3gubm9ydGggJiYgcHJldk1vZGVsKSB7XG4gICAgICAgIGNvbnN0IHByZXZCb3ggPSB7XG4gICAgICAgICAgbm9ydGg6IHByZXZNb2RlbFsnbm9ydGgnXSxcbiAgICAgICAgICBlYXN0OiBwcmV2TW9kZWxbJ2Vhc3QnXSxcbiAgICAgICAgICB3ZXN0OiBwcmV2TW9kZWxbJ3dlc3QnXSxcbiAgICAgICAgICBzb3V0aDogcHJldk1vZGVsWydzb3V0aCddLFxuICAgICAgICB9XG4gICAgICAgIGlmIChwcmV2Qm94Lm5vcnRoKSB7XG4gICAgICAgICAgcmV0dXJuICEoXG4gICAgICAgICAgICBib3gubm9ydGggPT09IHByZXZCb3gubm9ydGggfHxcbiAgICAgICAgICAgIGJveC5lYXN0ID09PSBwcmV2Qm94LmVhc3QgfHxcbiAgICAgICAgICAgIGJveC53ZXN0ID09PSBwcmV2Qm94Lndlc3QgfHxcbiAgICAgICAgICAgIGJveC5zb3V0aCA9PT0gcHJldkJveC5zb3V0aFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICBjb25zdCBjaXJjbGUgPSB7IGxvbjogbW9kZWwuZ2V0KCdsb24nKSwgbGF0OiBtb2RlbC5nZXQoJ2xhdCcpIH1cbiAgICAgIHByZXZNb2RlbCA9IG1vZGVsLnByZXZpb3VzQXR0cmlidXRlcygpXG4gICAgICBpZiAoY2lyY2xlICYmIHByZXZNb2RlbCkge1xuICAgICAgICBjb25zdCBwcmV2Q2lyY2xlID0geyBsb246IHByZXZNb2RlbFsnbG9uJ10sIGxhdDogcHJldk1vZGVsWydsYXQnXSB9XG4gICAgICAgIGlmIChwcmV2Q2lyY2xlLmxhdCAmJiBwcmV2Q2lyY2xlLmxvbikge1xuICAgICAgICAgIHJldHVybiAhKFxuICAgICAgICAgICAgY2lyY2xlLmxhdCA9PT0gcHJldkNpcmNsZS5sYXQgfHwgY2lyY2xlLmxvbiA9PT0gcHJldkNpcmNsZS5sb25cbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBjYXNlICdsaW5lJzpcbiAgICAgIGNvbnN0IGxpbmUgPSBtb2RlbC5nZXQoJ2xpbmUnKVxuICAgICAgcHJldk1vZGVsID0gbW9kZWwucHJldmlvdXNBdHRyaWJ1dGVzKClcbiAgICAgIGlmIChsaW5lICYmIHByZXZNb2RlbCkge1xuICAgICAgICBjb25zdCBwcmV2TGluZSA9IHByZXZNb2RlbFsnbGluZSddXG4gICAgICAgIGlmIChwcmV2TGluZSkge1xuICAgICAgICAgIHJldHVybiAhbmVzdGVkQXJyYXlzT3ZlcmxhcChsaW5lLCBwcmV2TGluZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIGNhc2UgJ3BvbHknOlxuICAgICAgY29uc3QgcG9seSA9IG1vZGVsLmdldCgncG9seWdvbicpXG4gICAgICBwcmV2TW9kZWwgPSBtb2RlbC5wcmV2aW91c0F0dHJpYnV0ZXMoKVxuICAgICAgaWYgKHByZXZNb2RlbCkge1xuICAgICAgICBjb25zdCBwcmV2UG9seSA9IHByZXZNb2RlbFsncG9seWdvbiddXG4gICAgICAgIGlmIChwcmV2UG9seSkge1xuICAgICAgICAgIHJldHVybiAhbmVzdGVkQXJyYXlzT3ZlcmxhcChwb2x5LCBwcmV2UG9seSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgcmVtb3ZlT3JMb2NrT2xkRHJhd2luZyA9IChcbiAgaXNJbnRlcmFjdGl2ZTogYm9vbGVhbixcbiAgaWQ6IGFueSxcbiAgbWFwOiBhbnksXG4gIG1vZGVsOiBhbnlcbikgPT4ge1xuICBjb25zdCBjYW5DaGFuZ2UgPSBbXG4gICAgJ2lzSW50ZXJhY3RpdmUnLFxuICAgICdwb2x5Z29uQnVmZmVyV2lkdGgnLFxuICAgICdsaW5lV2lkdGgnLFxuICAgICdsaW5lJyxcbiAgICAncG9seWdvbicsXG4gICAgJ3VzbmcnLFxuICAgICdiYm94JyxcbiAgXVxuXG4gIC8vIHJlbW92ZSBwcmV2aW91cyBzaGFwZSBmcm9tIG1hcCBhZnRlciB1cGRhdGluZyBhdHRyaWJ1dGVzLCBkcmFnZ2luZyBzaGFwZSwgb3IgZXhpdGluZyBpbnRlcmFjdGl2ZSBtb2RlXG4gIGlmIChcbiAgICBpc0ludGVyYWN0aXZlIHx8XG4gICAgKCFpc0ludGVyYWN0aXZlICYmXG4gICAgICBPYmplY3Qua2V5cyhtb2RlbC5jaGFuZ2VkKS5zb21lKChjaGFuZ2UpID0+IGNhbkNoYW5nZS5pbmNsdWRlcyhjaGFuZ2UpKSAmJlxuICAgICAgIWlzTmV3U2hhcGUobW9kZWwpKVxuICApIHtcbiAgICByZW1vdmVPbGREcmF3aW5nKHsgbWFwLCBpZCB9KVxuICB9IGVsc2Uge1xuICAgIG1ha2VPbGREcmF3aW5nTm9uRWRpdGFibGUoeyBtYXAsIGlkIH0pXG4gIH1cbn1cblxubGV0IGRyYXdpbmdMb2NhdGlvbjogYW55XG5cbmNvbnN0IHVwZGF0ZURyYXdpbmdMb2NhdGlvbiA9IChuZXdEcmF3aW5nTG9jYXRpb246IGFueSkgPT4ge1xuICBkcmF3aW5nTG9jYXRpb24gPSBuZXdEcmF3aW5nTG9jYXRpb25cbn1cblxuY29uc3QgZW5zdXJlUG9seWdvbklzQ2xvc2VkID0gKHBvbHlnb246IGFueSkgPT4ge1xuICBjb25zdCBwb2ludHMgPSBwb2x5Z29uPy5wb2x5Z29uXG4gIGlmIChBcnJheS5pc0FycmF5KHBvaW50cykgJiYgcG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBmaXJzdCA9IHBvaW50c1swXVxuICAgIGNvbnN0IGxhc3QgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdXG4gICAgaWYgKCFfLmlzRXF1YWwoZmlyc3QsIGxhc3QpKSB7XG4gICAgICBwb2ludHMucHVzaChmaXJzdClcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgcGlja0xvY2F0aW9uID0gKG1vZGVsPzogYW55KSA9PiB7XG4gIGNvbnN0IG1vZGUgPSBnZXREcmF3TW9kZUZyb21Nb2RlbCh7IG1vZGVsIH0pXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgJ2Jib3gnOlxuICAgICAgcmV0dXJuIF8ucGljayhtb2RlbC5hdHRyaWJ1dGVzLCAnbm9ydGgnLCAnc291dGgnLCAnZWFzdCcsICd3ZXN0JylcbiAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgcmV0dXJuIF8ucGljayhtb2RlbC5hdHRyaWJ1dGVzLCAnbGF0JywgJ2xvbicpXG4gICAgY2FzZSAnbGluZSc6XG4gICAgICByZXR1cm4gXy5waWNrKG1vZGVsLmF0dHJpYnV0ZXMsICdsaW5lJylcbiAgICBjYXNlICdwb2x5JzpcbiAgICAgIHJldHVybiBfLnBpY2sobW9kZWwuYXR0cmlidXRlcywgJ3BvbHlnb24nKVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge31cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ2VzaXVtRHJhd2luZ3MgPSAoe1xuICBtYXAsXG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbn0pID0+IHtcbiAgY29uc3QgeyBtb2RlbHMsIGZpbHRlck1vZGVscywgZHJhd2luZ01vZGVscyB9ID0gdXNlRHJhd2luZ0FuZERpc3BsYXlNb2RlbHMoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgICBtYXAsXG4gIH0pXG5cbiAgY29uc3QgW2RyYXdpbmdNb2RlbF0gPVxuICAgIGRyYXdpbmdNb2RlbHMubGVuZ3RoID4gMCA/IGRyYXdpbmdNb2RlbHMuc2xpY2UoLTEpIDogW3VuZGVmaW5lZF1cblxuICBjb25zdCBbaXNEcmF3aW5nLCBzZXRJc0RyYXdpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtkcmF3aW5nU2hhcGUsIHNldERyYXdpbmdTaGFwZV0gPSB1c2VTdGF0ZTxTaGFwZT4oREVGQVVMVF9TSEFQRSlcblxuICBjb25zdCB7IGludGVyYWN0aXZlR2VvLCB0cmFuc2xhdGlvbiwgc2V0SW50ZXJhY3RpdmVNb2RlbHMgfSA9XG4gICAgUmVhY3QudXNlQ29udGV4dChJbnRlcmFjdGlvbnNDb250ZXh0KVxuXG4gIGNvbnN0IG5vbkRyYXdpbmdNb2RlbHMgPSBtb2RlbHMuY29uY2F0KGZpbHRlck1vZGVscylcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG1vZGVscyA9IG5vbkRyYXdpbmdNb2RlbHMuZmlsdGVyKFxuICAgICAgKG0pID0+IG0uZ2V0KCdsb2NhdGlvbklkJykgPT09IGludGVyYWN0aXZlR2VvXG4gICAgKVxuICAgIHNldEludGVyYWN0aXZlTW9kZWxzKG1vZGVscylcbiAgfSwgW2ludGVyYWN0aXZlR2VvLCBtb2RlbHMsIGZpbHRlck1vZGVsc10pXG5cbiAgY29uc3QgaGFuZGxlS2V5ZG93biA9IFJlYWN0LnVzZUNhbGxiYWNrKFxuICAgIChlOiBhbnkpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgaWYgKGRyYXdpbmdMb2NhdGlvbikgZmluaXNoRHJhd2luZygpXG4gICAgICB9XG4gICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgIGNhbmNlbERyYXdpbmcoKVxuICAgICAgfVxuICAgIH0sXG4gICAgW2RyYXdpbmdNb2RlbCwgZHJhd2luZ1NoYXBlLCBkcmF3aW5nTG9jYXRpb25dXG4gIClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldElzRHJhd2luZyghIWRyYXdpbmdNb2RlbClcbiAgICBpZiAoZHJhd2luZ01vZGVsKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUtleWRvd24pXG4gICAgICBzZXREcmF3aW5nU2hhcGUoXG4gICAgICAgIGdldFNoYXBlRnJvbURyYXdNb2RlKGdldERyYXdNb2RlRnJvbU1vZGVsKHsgbW9kZWw6IGRyYXdpbmdNb2RlbCB9KSlcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICB9LCBbZHJhd2luZ01vZGVsXSlcblxuICBjb25zdCBjYW5jZWxEcmF3aW5nID0gKCkgPT4ge1xuICAgIGRyYXdpbmdNb2RlbC5zZXQoJ2RyYXdpbmcnLCBmYWxzZSlcbiAgICAvLyB0aGUgbGlzdGVuZXIgZm9yIHRoaXMgY2FsbHMgRHJhd2luZy50dXJuT2ZmRHJhd2luZygpXG4gICAgd3JlcXIudmVudC50cmlnZ2VyKCdzZWFyY2g6ZHJhd2NhbmNlbCcsIGRyYXdpbmdNb2RlbClcbiAgICBzZXRJc0RyYXdpbmcoZmFsc2UpXG4gICAgZHJhd2luZ0xvY2F0aW9uID0gbnVsbFxuICB9XG5cbiAgY29uc3QgZmluaXNoRHJhd2luZyA9ICgpID0+IHtcbiAgICBpZiAoIWRyYXdpbmdMb2NhdGlvbikge1xuICAgICAgY2FuY2VsRHJhd2luZygpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB3cmVxci52ZW50LnRyaWdnZXIoXG4gICAgICBgc2VhcmNoOiR7Z2V0RHJhd01vZGVGcm9tU2hhcGUoZHJhd2luZ1NoYXBlKX0tZW5kYCxcbiAgICAgIGRyYXdpbmdNb2RlbFxuICAgIClcbiAgICB3cmVxci52ZW50LnRyaWdnZXIoYHNlYXJjaDpkcmF3ZW5kYCwgZHJhd2luZ01vZGVsKVxuICAgIGlmIChkcmF3aW5nU2hhcGUgPT09ICdQb2x5Z29uJykge1xuICAgICAgZW5zdXJlUG9seWdvbklzQ2xvc2VkKGRyYXdpbmdMb2NhdGlvbilcbiAgICB9XG4gICAgZHJhd2luZ01vZGVsLnNldCh7IC4uLmRyYXdpbmdMb2NhdGlvbiwgZHJhd2luZzogZmFsc2UgfSlcbiAgICBzZXRJc0RyYXdpbmcoZmFsc2UpXG4gICAgZHJhd2luZ0xvY2F0aW9uID0gbnVsbFxuICB9XG5cbiAgY29uc3QgaXNOb3RCZWluZ0VkaXRlZCA9IChtb2RlbDogYW55KSA9PlxuICAgICFkcmF3aW5nTW9kZWwgfHwgIV8uaXNFcXVhbChwaWNrTG9jYXRpb24obW9kZWwpLCBwaWNrTG9jYXRpb24oZHJhd2luZ01vZGVsKSlcblxuICAvKlxuICAgIFdoZW4gZWRpdGluZyBhIHNoYXBlLCBkb24ndCBkaXNwbGF5IHRoZSBvdGhlciBtb2RlbHMgdGhhdCBjb3JyZXNwb25kIHRvIHRoYXQgc2hhcGUuIEJlY2F1c2VcbiAgICB3ZSBkb24ndCBkaXNwbGF5IHNoYXBlcyBvbiB0aGUgc3VyZmFjZSBvZiB0aGUgZ2xvYmUsIHdlIGNhbid0IHVzZSBDZXNpdW0ncyBBUElzIHRvIGZvcmNlIHRoZVxuICAgIHNoYXBlIGJlaW5nIGVkaXRlZCB0byB0aGUgdG9wLiBJZiB0aGUgY29ycmVzcG9uZGluZyBtb2RlbHMgd2VyZSBzaG93biwgdGhlbiBtdWx0aXBsZSBvdmVybGFwcGluZ1xuICAgIHNoYXBlcyB3b3VsZCBiZSBkcmF3biBvbiB0aGUgbWFwLCBhbmQgdGhlIHNvbGUgZWRpdGFibGUgc2hhcGUgaXMgbm90IGd1YXJhbnRlZWQgdG8gYmUgdmlzaWJsZVxuICAgIG9yIGFibGUgdG8gYmUgaW50ZXJhY3RlZCB3aXRoLlxuICAgIE5vdGUgdGhhdCB3ZSBjYW5ub3QgY29tcGFyZSB0aGUgZmlsdGVyTW9kZWwgSURzIHRvIHRoYXQgb2YgdGhlIGRyYXdpbmdNb2RlbCwgYmVjYXVzZSB3aGlsZSBhXG4gICAgZmlsdGVyTW9kZWwgYW5kIGEgZHJhd2luZ01vZGVsIG1heSByZXByZXNlbnQgdGhlIHNhbWUgc2hhcGUsIHRoZXkgYXJlIGRpZmZlcmVudCBtb2RlbCBvYmplY3RcbiAgICBpbnN0YW5jZXMgYW5kIGhhdmUgZGlmZmVyZW50IElEcy4gSW5zdGVhZCwgd2UgY2hlY2sgZm9yIGVxdWl2YWxlbnQgbG9jYXRpb24gYXR0cmlidXRlcyBvbiB0aGVcbiAgICBtb2RlbHMuXG4gICAgVGhlIG1vZGVscyBhcnJheSBpcyBhIGRpZmZlcmVudCBzdG9yeSwgc2luY2UgaXQgY2FuIGNvbnRhaW4gdGhlIHNhbWUgbW9kZWwgb2JqZWN0IGluc3RhbmNlc1xuICAgIGFzIGRyYXdpbmdNb2RlbHMsIGJ1dCB3ZSB1c2UgdGhlIG5vbi1JRC1iYXNlZCBjb21wYXJpc29uIG1ldGhvZCBkZXNjcmliZWQgYWJvdmUgZm9yIGl0LCB0b28sXG4gICAgdG8gZW5zdXJlIGNvbnNpc3RlbnQgYmVoYXZpb3IuXG4gICovXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtub25EcmF3aW5nTW9kZWxzLmZpbHRlcihpc05vdEJlaW5nRWRpdGVkKS5tYXAoKG1vZGVsKSA9PiB7XG4gICAgICAgIGNvbnN0IGRyYXdNb2RlID0gZ2V0RHJhd01vZGVGcm9tTW9kZWwoeyBtb2RlbCB9KVxuICAgICAgICBjb25zdCBpc0ludGVyYWN0aXZlID0gbW9kZWwuZ2V0KCdsb2NhdGlvbklkJykgPT09IGludGVyYWN0aXZlR2VvXG4gICAgICAgIGNvbnN0IHNoYXBlVHJhbnNsYXRpb24gPVxuICAgICAgICAgIHRyYW5zbGF0aW9uICYmIGlzSW50ZXJhY3RpdmUgPyB0cmFuc2xhdGlvbiA6IHVuZGVmaW5lZFxuICAgICAgICBzd2l0Y2ggKGRyYXdNb2RlKSB7XG4gICAgICAgICAgY2FzZSAnYmJveCc6XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8Q2VzaXVtQmJveERpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgaXNJbnRlcmFjdGl2ZT17aXNJbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbj17c2hhcGVUcmFuc2xhdGlvbn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIClcbiAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPENlc2l1bUNpcmNsZURpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgaXNJbnRlcmFjdGl2ZT17aXNJbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbj17c2hhcGVUcmFuc2xhdGlvbn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIClcbiAgICAgICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxDZXNpdW1MaW5lRGlzcGxheVxuICAgICAgICAgICAgICAgIGtleT17bW9kZWwuY2lkfVxuICAgICAgICAgICAgICAgIG1vZGVsPXttb2RlbH1cbiAgICAgICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgICAgICBpc0ludGVyYWN0aXZlPXtpc0ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uPXtzaGFwZVRyYW5zbGF0aW9ufVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIGNhc2UgJ3BvbHknOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPENlc2l1bVBvbHlnb25EaXNwbGF5XG4gICAgICAgICAgICAgICAga2V5PXttb2RlbC5jaWR9XG4gICAgICAgICAgICAgICAgbW9kZWw9e21vZGVsfVxuICAgICAgICAgICAgICAgIG1hcD17bWFwfVxuICAgICAgICAgICAgICAgIGlzSW50ZXJhY3RpdmU9e2lzSW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb249e3NoYXBlVHJhbnNsYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiA8PjwvPlxuICAgICAgICB9XG4gICAgICB9KX1cbiAgICAgIHtkcmF3aW5nTW9kZWxzLm1hcCgobW9kZWwpID0+IHtcbiAgICAgICAgY29uc3QgZHJhd01vZGUgPSBnZXREcmF3TW9kZUZyb21Nb2RlbCh7IG1vZGVsIH0pXG4gICAgICAgIHN3aXRjaCAoZHJhd01vZGUpIHtcbiAgICAgICAgICBjYXNlICdiYm94JzpcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxDZXNpdW1CYm94RGlzcGxheVxuICAgICAgICAgICAgICAgIGtleT17bW9kZWwuY2lkfVxuICAgICAgICAgICAgICAgIG1vZGVsPXttb2RlbH1cbiAgICAgICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgICAgICBvbkRyYXc9e3VwZGF0ZURyYXdpbmdMb2NhdGlvbn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIClcbiAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPENlc2l1bUNpcmNsZURpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgb25EcmF3PXt1cGRhdGVEcmF3aW5nTG9jYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8Q2VzaXVtTGluZURpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgb25EcmF3PXt1cGRhdGVEcmF3aW5nTG9jYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgY2FzZSAncG9seSc6XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8Q2VzaXVtUG9seWdvbkRpc3BsYXlcbiAgICAgICAgICAgICAgICBrZXk9e21vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBtb2RlbD17bW9kZWx9XG4gICAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgICAgb25EcmF3PXt1cGRhdGVEcmF3aW5nTG9jYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiA8PjwvPlxuICAgICAgICB9XG4gICAgICB9KX1cblxuICAgICAgey8qXG4gICAgICAgIFVzZSBnZW9zcGF0aWFsZHJhdydzIHRvb2xiYXIgZXZlbiB0aG91Z2ggZ2Vvc3BhdGlhbGRyYXcgZG9lcyBub3Qgc3VwcG9ydCBDZXNpdW0uXG4gICAgICAgIFdlIGRvbid0IGFjdHVhbGx5IHVzZSB0aGUgbGlicmFyeSBmb3IgZHJhd2luZywgYnV0IHdlIHdhbnQgdGhlIGRyYXdpbmcgZXhwZXJpZW5jZVxuICAgICAgICBvbiB0aGUgM0QgbWFwIHRvIGxvb2sgbGlrZSBpdCBkb2VzIG9uIHRoZSAyRCBtYXAuIFRoaXMgaXMgd2h5IHdlIG9ubHkgY2FyZSBhYm91dFxuICAgICAgICB0aGUgc2hhcGUgaWNvbiBkaXNwbGF5ZWQgb24gdGhlIHRvb2xiYXIgYW5kIHRoZSBhcHBseS9jYW5jZWwgaGFuZGxlcnM7IGV2ZXJ5dGhpbmdcbiAgICAgICAgZWxzZSBpcyBqdXN0IG5vLW9wcy5cbiAgICAgICovfVxuICAgICAge2RyYXdpbmdNb2RlbCAmJiAoXG4gICAgICAgIDxFZGl0b3IgZGF0YS1pZD1cIm1hcC1kcmF3LW1lbnVcIj5cbiAgICAgICAgICA8RHJhd2luZ01lbnVcbiAgICAgICAgICAgIHNoYXBlPXtkcmF3aW5nU2hhcGV9XG4gICAgICAgICAgICBtYXA9e3tcbiAgICAgICAgICAgICAgYWRkTGF5ZXI6ICgpID0+IHt9LFxuICAgICAgICAgICAgICByZW1vdmVJbnRlcmFjdGlvbjogKCkgPT4ge30sXG4gICAgICAgICAgICAgIGFkZEludGVyYWN0aW9uOiAoKSA9PiB7fSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBpc0FjdGl2ZT17aXNEcmF3aW5nfVxuICAgICAgICAgICAgZ2VvbWV0cnk9e251bGx9XG4gICAgICAgICAgICBvbkNhbmNlbD17Y2FuY2VsRHJhd2luZ31cbiAgICAgICAgICAgIG9uT2s9e2ZpbmlzaERyYXdpbmd9XG4gICAgICAgICAgICBvblNldFNoYXBlPXsoKSA9PiB7fX1cbiAgICAgICAgICAgIGRpc2FibGVkU2hhcGVzPXtTSEFQRVMuZmlsdGVyKChzaGFwZSkgPT4gc2hhcGUgIT09IGRyYXdpbmdTaGFwZSl9XG4gICAgICAgICAgICBvblVwZGF0ZT17KCkgPT4ge319XG4gICAgICAgICAgICBzYXZlQW5kQ29udGludWU9e2ZhbHNlfVxuICAgICAgICAgICAgbWFwU3R5bGU9e0RSQVdJTkdfU1RZTEV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9FZGl0b3I+XG4gICAgICApfVxuICAgIDwvPlxuICApXG59XG4iXX0=