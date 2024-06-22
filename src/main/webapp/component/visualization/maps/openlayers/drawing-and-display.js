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
import { v4 } from 'uuid';
import { getDrawModeFromModel, getShapeFromDrawMode, getDrawModeFromShape, useDrawingAndDisplayModels, } from '../drawing-and-display';
import { OpenlayersBboxDisplay } from './bbox-display';
import { OpenlayersCircleDisplay } from './circle-display';
import { OpenlayersLineDisplay } from './line-display';
import { OpenlayersPolygonDisplay } from './polygon-display';
import { Editor } from '../draw-menu';
import { DRAWING_STYLE } from './draw-styles';
import { menu, geometry } from 'geospatialdraw';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { makeGeometry, makePointRadiusGeo, makeLineGeo, makeBBoxGeo, } from 'geospatialdraw/target/webapp/geometry';
import Common from '../../../../js/Common';
import wreqr from '../../../../js/wreqr';
import * as Turf from '@turf/turf';
import { validateGeo } from '../../../../react-component/utils/validation';
import ShapeUtils from '../../../../js/ShapeUtils';
import utility from './utility';
import { locationColors, contrastingColor, } from '../../../../react-component/location/location-color-selector';
import { InteractionsContext } from '../interactions.provider';
var DrawingMenu = menu.DrawingMenu;
var makeEmptyGeometry = geometry.makeEmptyGeometry;
var SHAPES = [
    'Bounding Box',
    'Line',
    'Point',
    'Point Radius',
    'Polygon',
];
var DEFAULT_SHAPE = 'Polygon';
var DRAWING_COLOR = 'blue';
export var removeOldDrawing = function (_a) {
    var map = _a.map, id = _a.id;
    var oldLayers = map
        .getLayers()
        .getArray()
        .filter(function (layer) {
        return layer.get('id') === id;
    });
    oldLayers.forEach(function (layer) {
        map.removeLayer(layer);
    });
};
// see generateAnyGeoFilter in CQLUtils.ts for types
var getGeoType = function (geo) {
    switch (geo.properties.shape) {
        case 'Line':
            return 'LINE';
        case 'Point':
            return 'POINT';
        case 'Point Radius':
            return 'POINTRADIUS';
        default:
            return 'POLYGON';
    }
};
var createPolygonModel = function (geo) {
    var _a;
    // Ignore Z coordinate if exists
    var polygon = geo.geometry.coordinates[0].map(function (position) {
        return position.length > 2 ? position.slice(0, 2) : position;
    });
    return {
        polygon: Common.wrapMapCoordinatesArray(polygon).map(function (coords) {
            return coords.map(function (coord) { return Number(coord.toFixed(6)); });
        }),
        polygonBufferWidth: ((_a = geo.properties.buffer) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
        polygonBufferUnits: geo.properties.bufferUnit,
    };
};
var createLineStringModel = function (geo) {
    var _a;
    // Ignore Z coordinate if exists
    var line = geo.geometry.coordinates.map(function (position) {
        return position.length > 2 ? position.slice(0, 2) : position;
    });
    return {
        line: Common.wrapMapCoordinatesArray(line).map(function (coords) {
            return coords.map(function (coord) { return Number(coord.toFixed(6)); });
        }),
        lineWidth: ((_a = geo.properties.buffer) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
        lineUnits: geo.properties.bufferUnit,
    };
};
var createPointRadiusModel = function (geo) {
    var _a;
    var wrapped = Common.wrapMapCoordinatesArray([
        geo.geometry.coordinates,
    ]);
    return {
        lon: Number(wrapped[0][0].toFixed(6)),
        lat: Number(wrapped[0][1].toFixed(6)),
        radius: ((_a = geo.properties.buffer) === null || _a === void 0 ? void 0 : _a.toString()) || '1',
        radiusUnits: geo.properties.bufferUnit,
    };
};
var createBoundingBoxModel = function (geo) {
    // bbox order: west, south, east, north
    var wrapped = Common.wrapMapCoordinatesArray([
        [geo.bbox[0], geo.bbox[1]],
        [geo.bbox[2], geo.bbox[3]],
    ]);
    var west = Number(wrapped[0][0].toFixed(6));
    var south = Number(wrapped[0][1].toFixed(6));
    var east = Number(wrapped[1][0].toFixed(6));
    var north = Number(wrapped[1][1].toFixed(6));
    return {
        west: west,
        mapWest: west,
        south: south,
        mapSouth: south,
        east: east,
        mapEast: east,
        north: north,
        mapNorth: north,
    };
};
var createGeoModel = function (geo) {
    switch (geo.properties.shape) {
        case 'Polygon':
            return createPolygonModel(geo);
        case 'Line':
            return createLineStringModel(geo);
        case 'Point':
        case 'Point Radius':
            return createPointRadiusModel(geo);
        case 'Bounding Box':
            return createBoundingBoxModel(geo);
        default:
            return {};
    }
};
var createDefaultPolygon = function (buffer, bufferUnit, color) {
    return {
        type: 'Feature',
        properties: {
            id: '',
            color: color,
            shape: 'Polygon',
            buffer: buffer,
            bufferUnit: bufferUnit,
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[]],
        },
        bbox: [0, 0, 0, 0],
    };
};
var modelToPolygon = function (model) {
    var _a;
    var coords = model.get('polygon');
    var polygonBufferWidth = Number(model.get('polygonBufferWidth'));
    var buffer = Number.isNaN(polygonBufferWidth) ? 0 : polygonBufferWidth;
    var bufferUnit = model.get('polygonBufferUnits') || undefined;
    if (coords === undefined ||
        ((_a = validateGeo('polygon', JSON.stringify(coords))) === null || _a === void 0 ? void 0 : _a.error)) {
        return createDefaultPolygon(buffer, bufferUnit, DRAWING_COLOR);
    }
    var isMultiPolygon = ShapeUtils.isArray3D(coords);
    var polygon = isMultiPolygon ? coords : [coords];
    return makeGeometry(v4(), Turf.polygon(polygon).geometry, DRAWING_COLOR, 'Polygon', Number.isNaN(buffer) ? 0 : buffer, bufferUnit);
};
var modelToLine = function (model) {
    var _a;
    var lineWidth = Number(model.get('lineWidth'));
    var buffer = Number.isNaN(lineWidth) ? 0 : lineWidth;
    var bufferUnit = model.get('lineUnits') || 'meters';
    var coords = model.get('line');
    if (coords === undefined ||
        ((_a = validateGeo('line', JSON.stringify(coords))) === null || _a === void 0 ? void 0 : _a.error)) {
        coords = [];
    }
    return makeLineGeo(v4(), coords, buffer, bufferUnit);
};
var modelToPointRadius = function (model) {
    var lon = model.get('lon');
    var lat = model.get('lat');
    if (lon === undefined || lat === undefined) {
        return null;
    }
    var radius = Number(model.get('radius'));
    var radiusUnits = model.get('radiusUnits');
    return makePointRadiusGeo(v4(), lat, lon, Number.isNaN(radius) ? 1 : radius, radiusUnits || 'meters');
};
var isAnyNaN = function (numbers) {
    return numbers.some(function (n) { return n === undefined || n === null || Number.isNaN(n); });
};
var modelToBoundingBox = function (model) {
    var west = model.get('west');
    var south = model.get('south');
    var east = model.get('east');
    var north = model.get('north');
    if (isAnyNaN([west, south, east, north])) {
        return null;
    }
    return makeBBoxGeo(v4(), [west, south, east, north]);
};
export var getDrawingGeometryFromModel = function (model) {
    var _a;
    var mode = model.get('mode');
    var geo;
    switch (mode) {
        case 'bbox':
            geo = modelToBoundingBox(model);
            break;
        case 'circle':
            geo = modelToPointRadius(model);
            break;
        case 'line':
            geo = modelToLine(model);
            break;
        case 'poly':
            geo = modelToPolygon(model);
            break;
        default:
            return null;
    }
    if (geo) {
        utility.adjustGeoCoords(geo);
        if ((_a = geo.properties) === null || _a === void 0 ? void 0 : _a.color) {
            geo.properties.color = contrastingColor;
        }
    }
    return geo;
};
export var convertToModel = function (_a) {
    var _b, _c;
    var geo = _a.geo, shape = _a.shape, existingModel = _a.existingModel;
    var properties = __assign(__assign({}, createGeoModel(geo)), { type: getGeoType(geo), mode: getDrawModeFromShape(shape) });
    // if the model is being updated, we want to keep the id, otherwise use the geo properties id to recreate the model
    if (!existingModel) {
        properties.id = geo.properties.id;
    }
    // geo.properties?.color will have a value when in drawing mode,
    // but we dont want to render the drawing's contrastingColor after saving.
    // So, we only want to set the default if no color is already set
    if (((_b = geo.properties) === null || _b === void 0 ? void 0 : _b.color) !== contrastingColor) {
        properties.color = ((_c = geo.properties) === null || _c === void 0 ? void 0 : _c.color) || Object.values(locationColors)[0];
    }
    return properties;
};
// This is not a piece of state because the geospatialdraw
// library rerenders bounding boxes unnecessarily
// If this was state, the resulting rerenders would
// break bounding boxes in the updateGeo method
var drawingLocation = makeEmptyGeometry(v4(), DEFAULT_SHAPE);
var preserveBuffer = function (drawingModel, drawingLocation, drawingShape) {
    var updatedDrawingLocation = drawingLocation;
    if (drawingShape === 'Line') {
        var lineWidth = drawingModel.get('lineWidth');
        var lineUnits = drawingModel.get('lineUnits');
        if (lineWidth) {
            updatedDrawingLocation.properties.buffer = lineWidth;
        }
        if (lineUnits) {
            updatedDrawingLocation.properties.bufferUnit = lineUnits;
        }
    }
    if (drawingShape === 'Polygon') {
        var polygonWidth = drawingModel.get('polygonBufferWidth');
        var polygonUnits = drawingModel.get('polygonBufferUnits');
        if (polygonWidth) {
            updatedDrawingLocation.properties.buffer = polygonWidth;
        }
        if (polygonUnits) {
            updatedDrawingLocation.properties.bufferUnit = polygonUnits;
        }
    }
    return updatedDrawingLocation;
};
export var OpenlayersDrawings = function (_a) {
    var map = _a.map, selectionInterface = _a.selectionInterface;
    var _b = useDrawingAndDisplayModels({
        selectionInterface: selectionInterface,
        map: map,
    }), models = _b.models, filterModels = _b.filterModels, drawingModels = _b.drawingModels;
    var _c = __read(drawingModels.length > 0 ? drawingModels.slice(-1) : [undefined], 1), drawingModel = _c[0];
    var _d = __read(useState(false), 2), isDrawing = _d[0], setIsDrawing = _d[1];
    var _e = __read(useState(DEFAULT_SHAPE), 2), drawingShape = _e[0], setDrawingShape = _e[1];
    var _f = __read(useState(null), 2), drawingGeometry = _f[0], setDrawingGeometry = _f[1];
    var _g = __read(useState(), 2), updatedBuffer = _g[0], setUpdatedBuffer = _g[1];
    var _h = __read(useState(), 2), updatedBufferUnit = _h[0], setUpdatedBufferUnit = _h[1];
    var _j = React.useContext(InteractionsContext), interactiveGeo = _j.interactiveGeo, translation = _j.translation, setInteractiveModels = _j.setInteractiveModels;
    var nonDrawingModels = models.concat(filterModels);
    useEffect(function () {
        var models = nonDrawingModels.filter(function (model) { return model.get('locationId') === interactiveGeo; });
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
            setDrawingGeometry(getDrawingGeometryFromModel(drawingModel));
        }
        else {
            window.removeEventListener('keydown', handleKeydown);
        }
        return function () { return window.removeEventListener('keydown', handleKeydown); };
    }, [drawingModel]);
    var lineBufferChangedCallback = React.useCallback(function () {
        setUpdatedBuffer(drawingModel.attributes.lineWidth);
        setUpdatedBufferUnit(drawingModel.attributes.lineUnits);
    }, [drawingModel]);
    useListenTo(drawingModel, 'change:lineWidth change:lineUnits', lineBufferChangedCallback);
    var polygonBufferChangedCallback = React.useCallback(function () {
        setUpdatedBuffer(drawingModel.attributes.polygonBufferWidth);
        setUpdatedBufferUnit(drawingModel.attributes.polygonBufferUnits);
    }, [drawingModel]);
    useListenTo(drawingModel, 'change:polygonBufferWidth change:polygonBufferUnits', polygonBufferChangedCallback);
    var cancelDrawing = function () {
        drawingModel.set('drawing', false);
        // the listener for this calls Drawing.turnOffDrawing()
        wreqr.vent.trigger('search:drawcancel', drawingModel);
        setIsDrawing(false);
        setDrawingShape(DEFAULT_SHAPE);
        setDrawingGeometry(null);
        setUpdatedBuffer(undefined);
        drawingLocation = null;
    };
    // called when the user clicks apply during geo drawing
    var finishDrawing = function () {
        if (drawingLocation === null) {
            cancelDrawing();
            return;
        }
        wreqr.vent.trigger("search:".concat(getDrawModeFromShape(drawingShape), "-end"), drawingModel);
        wreqr.vent.trigger("search:drawend", drawingModel);
        drawingModel.set('drawing', false);
        // preserve buffer set by user
        var updatedDrawingLocation = preserveBuffer(drawingModel, drawingLocation, drawingShape);
        drawingModel.set(convertToModel({
            geo: updatedDrawingLocation,
            shape: drawingShape,
            existingModel: drawingModel,
        }));
        setIsDrawing(false);
        setDrawingGeometry(updatedDrawingLocation);
        drawingLocation = null;
    };
    // called during drawing at random intervals
    var updateGeo = function (geo) {
        drawingLocation = geo;
    };
    return (React.createElement(React.Fragment, null,
        nonDrawingModels.map(function (model) {
            var drawMode = getDrawModeFromModel({ model: model });
            var isInteractive = model.get('locationId') === interactiveGeo;
            var shapeTranslation = translation && isInteractive ? translation : undefined;
            switch (drawMode) {
                case 'bbox':
                    return (React.createElement(OpenlayersBboxDisplay, { key: model.cid, model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }));
                case 'circle':
                    return (React.createElement(OpenlayersCircleDisplay, { key: model.cid, model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }));
                case 'line':
                    return (React.createElement(OpenlayersLineDisplay, { key: model.cid, model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }));
                case 'poly':
                    return (React.createElement(OpenlayersPolygonDisplay, { key: model.cid, model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }));
                default:
                    return (React.createElement(OpenlayersPolygonDisplay, { key: model.cid, model: model, map: map, isInteractive: isInteractive, translation: shapeTranslation }));
            }
        }),
        drawingModel && (React.createElement(Editor, { "data-id": "map-draw-menu" },
            React.createElement(DrawingMenu, { shape: drawingShape, map: map.getMap(), isActive: isDrawing, geometry: isDrawing ? drawingGeometry : null, updatedBuffer: updatedBuffer, updatedBufferUnit: updatedBufferUnit, onCancel: cancelDrawing, onOk: finishDrawing, onSetShape: function () { }, disabledShapes: SHAPES.filter(function (shape) { return shape !== drawingShape; }), onUpdate: updateGeo, saveAndContinue: false, mapStyle: DRAWING_STYLE })))));
};
//# sourceMappingURL=drawing-and-display.js.map