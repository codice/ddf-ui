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
//# sourceMappingURL=drawing-and-display.js.map