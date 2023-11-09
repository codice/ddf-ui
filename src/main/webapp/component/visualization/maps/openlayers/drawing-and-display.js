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
import { getDrawModeFromModel, getShapeFromDrawMode, getDrawModeFromShape, } from '../drawing-and-display';
import { OpenlayersBboxDisplay } from './bbox-display';
import { OpenlayersCircleDisplay } from './circle-display';
import { OpenlayersLineDisplay } from './line-display';
import { OpenlayersPolygonDisplay } from './polygon-display';
import { Editor } from '../draw-menu';
import { DRAWING_STYLE } from './draw-styles';
import { menu, geometry } from 'geospatialdraw';
import { makeGeometry, makePointRadiusGeo, makeLineGeo, makeBBoxGeo, } from 'geospatialdraw/target/webapp/geometry';
import Common from '../../../../js/Common';
import wreqr from '../../../../js/wreqr';
import * as Turf from '@turf/turf';
import { validateGeo } from '../../../../react-component/utils/validation';
import ShapeUtils from '../../../../js/ShapeUtils';
import utility from './utility';
import { locationColors, contrastingColor, } from '../../../../react-component/location/location-color-selector';
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
var modelToPolygon = function (model) {
    var _a;
    var coords = model.get('polygon');
    if (coords === undefined ||
        ((_a = validateGeo('polygon', JSON.stringify(coords))) === null || _a === void 0 ? void 0 : _a.error)) {
        return null;
    }
    var isMultiPolygon = ShapeUtils.isArray3D(coords);
    var polygon = isMultiPolygon ? coords : [coords];
    var buffer = Number(model.get('polygonBufferWidth'));
    var bufferUnit = model.get('polygonBufferUnits');
    return makeGeometry(v4(), Turf.polygon(polygon).geometry, DRAWING_COLOR, 'Polygon', Number.isNaN(buffer) ? 0 : buffer, bufferUnit || undefined);
};
var modelToLine = function (model) {
    var _a;
    var coords = model.get('line');
    if (coords === undefined ||
        ((_a = validateGeo('line', JSON.stringify(coords))) === null || _a === void 0 ? void 0 : _a.error)) {
        return null;
    }
    var buffer = Number(model.get('lineWidth'));
    var bufferUnit = model.get('lineUnits');
    return makeLineGeo(v4(), coords, Number.isNaN(buffer) ? 0 : buffer, bufferUnit || 'meters');
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
export var convertToModel = function (geo, shape) {
    var _a, _b;
    // geo.properties?.color will have a value when in drawing mode,
    // but we dont want to render the drawing's contrastingColor after saving.
    // So, we only want to set the default if no color is already set
    if (((_a = geo.properties) === null || _a === void 0 ? void 0 : _a.color) === contrastingColor) {
        return __assign(__assign({}, createGeoModel(geo)), { type: getGeoType(geo), mode: getDrawModeFromShape(shape) });
    }
    return __assign(__assign({}, createGeoModel(geo)), { type: getGeoType(geo), mode: getDrawModeFromShape(shape), color: ((_b = geo.properties) === null || _b === void 0 ? void 0 : _b.color) || Object.values(locationColors)[0] });
};
// This is not a piece of state because the geospatialdraw
// library rerenders bounding boxes unnecessarily
// If this was state, the resulting rerenders would
// break bounding boxes in the updateGeo method
var drawingLocation = makeEmptyGeometry(v4(), DEFAULT_SHAPE);
export var OpenlayersDrawings = function (_a) {
    var map = _a.map, drawingAndDisplayModels = _a.drawingAndDisplayModels;
    var models = drawingAndDisplayModels.models, filterModels = drawingAndDisplayModels.filterModels, drawingModels = drawingAndDisplayModels.drawingModels;
    var _b = __read(drawingModels.length > 0 ? drawingModels.slice(-1) : [undefined], 1), drawingModel = _b[0];
    var _c = __read(useState(false), 2), isDrawing = _c[0], setIsDrawing = _c[1];
    var _d = __read(useState(DEFAULT_SHAPE), 2), drawingShape = _d[0], setDrawingShape = _d[1];
    var _e = __read(useState(null), 2), drawingGeometry = _e[0], setDrawingGeometry = _e[1];
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
    var cancelDrawing = function () {
        drawingModel.set('drawing', false);
        // the listener for this calls Drawing.turnOffDrawing()
        wreqr.vent.trigger('search:drawcancel', drawingModel);
        setIsDrawing(false);
        setDrawingShape(DEFAULT_SHAPE);
        setDrawingGeometry(null);
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
        drawingModel.set(convertToModel(drawingLocation, drawingShape));
        setIsDrawing(false);
        setDrawingGeometry(drawingLocation);
        drawingLocation = null;
    };
    // called during drawing at random intervals
    var updateGeo = function (geo) {
        drawingLocation = geo;
    };
    return (React.createElement(React.Fragment, null,
        filterModels.map(function (model) {
            var drawMode = getDrawModeFromModel({ model: model });
            switch (drawMode) {
                case 'bbox':
                    return (React.createElement(OpenlayersBboxDisplay, { key: model.cid, model: model, map: map }));
                case 'circle':
                    return (React.createElement(OpenlayersCircleDisplay, { key: model.cid, model: model, map: map }));
                case 'line':
                    return (React.createElement(OpenlayersLineDisplay, { key: model.cid, model: model, map: map }));
                case 'poly':
                    return (React.createElement(OpenlayersPolygonDisplay, { key: model.cid, model: model, map: map }));
                default:
                    return (React.createElement(OpenlayersPolygonDisplay, { key: model.cid, model: model, map: map }));
            }
        }),
        models.map(function (model) {
            var drawMode = getDrawModeFromModel({ model: model });
            switch (drawMode) {
                case 'bbox':
                    return (React.createElement(OpenlayersBboxDisplay, { key: model.cid, model: model, map: map }));
                case 'circle':
                    return (React.createElement(OpenlayersCircleDisplay, { key: model.cid, model: model, map: map }));
                case 'line':
                    return (React.createElement(OpenlayersLineDisplay, { key: model.cid, model: model, map: map }));
                case 'poly':
                    return (React.createElement(OpenlayersPolygonDisplay, { key: model.cid, model: model, map: map }));
                default:
                    return (React.createElement(OpenlayersPolygonDisplay, { key: model.cid, model: model, map: map }));
            }
        }),
        drawingModel && (React.createElement(Editor, { "data-id": "map-draw-menu" },
            React.createElement(DrawingMenu, { shape: drawingShape, map: map.getMap(), isActive: isDrawing, geometry: isDrawing ? drawingGeometry : null, onCancel: cancelDrawing, onOk: finishDrawing, onSetShape: function () { }, disabledShapes: SHAPES.filter(function (shape) { return shape !== drawingShape; }), onUpdate: updateGeo, saveAndContinue: false, mapStyle: DRAWING_STYLE })))));
};
//# sourceMappingURL=drawing-and-display.js.map