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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy1hbmQtZGlzcGxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL29wZW5sYXllcnMvZHJhd2luZy1hbmQtZGlzcGxheS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUN6QixPQUFPLEVBQ0wsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsMEJBQTBCLEdBQzNCLE1BQU0sd0JBQXdCLENBQUE7QUFDL0IsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDdEQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDMUQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDdEQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDNUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBQzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFL0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFFTCxZQUFZLEVBQ1osa0JBQWtCLEVBQ2xCLFdBQVcsRUFDWCxXQUFXLEdBQ1osTUFBTSx1Q0FBdUMsQ0FBQTtBQUU5QyxPQUFPLE1BQU0sTUFBTSx1QkFBdUIsQ0FBQTtB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YSxFQUFFLGFBQWEsRUFDNUIsV0FBVyxFQUFFLGdCQUFnQixHQUM3QixDQUNILENBQUE7YUFDSjtRQUNILENBQUMsQ0FBQztRQUNELFlBQVksSUFBSSxDQUNmLG9CQUFDLE1BQU0sZUFBUyxlQUFlO1lBQzdCLG9CQUFDLFdBQVcsSUFDVixLQUFLLEVBQUUsWUFBWSxFQUNuQixHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUNqQixRQUFRLEVBQUUsU0FBUyxFQUNuQixRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksRUFDNUMsYUFBYSxFQUFFLGFBQWEsRUFDNUIsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQ3BDLFFBQVEsRUFBRSxhQUFhLEVBQ3ZCLElBQUksRUFBRSxhQUFhLEVBQ25CLFVBQVUsRUFBRSxjQUFPLENBQUMsRUFDcEIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLEtBQUssWUFBWSxFQUF0QixDQUFzQixDQUFDLEVBQ2hFLFFBQVEsRUFBRSxTQUFTLEVBQ25CLGVBQWUsRUFBRSxLQUFLLEVBQ3RCLFFBQVEsRUFBRSxhQUFhLEdBQ3ZCLENBQ0ssQ0FDVixDQUNBLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJ1xuaW1wb3J0IHtcbiAgZ2V0RHJhd01vZGVGcm9tTW9kZWwsXG4gIGdldFNoYXBlRnJvbURyYXdNb2RlLFxuICBnZXREcmF3TW9kZUZyb21TaGFwZSxcbiAgdXNlRHJhd2luZ0FuZERpc3BsYXlNb2RlbHMsXG59IGZyb20gJy4uL2RyYXdpbmctYW5kLWRpc3BsYXknXG5pbXBvcnQgeyBPcGVubGF5ZXJzQmJveERpc3BsYXkgfSBmcm9tICcuL2Jib3gtZGlzcGxheSdcbmltcG9ydCB7IE9wZW5sYXllcnNDaXJjbGVEaXNwbGF5IH0gZnJvbSAnLi9jaXJjbGUtZGlzcGxheSdcbmltcG9ydCB7IE9wZW5sYXllcnNMaW5lRGlzcGxheSB9IGZyb20gJy4vbGluZS1kaXNwbGF5J1xuaW1wb3J0IHsgT3BlbmxheWVyc1BvbHlnb25EaXNwbGF5IH0gZnJvbSAnLi9wb2x5Z29uLWRpc3BsYXknXG5pbXBvcnQgeyBFZGl0b3IgfSBmcm9tICcuLi9kcmF3LW1lbnUnXG5pbXBvcnQgeyBEUkFXSU5HX1NUWUxFIH0gZnJvbSAnLi9kcmF3LXN0eWxlcydcbmltcG9ydCB7IG1lbnUsIGdlb21ldHJ5IH0gZnJvbSAnZ2Vvc3BhdGlhbGRyYXcnXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJ2dlb3NwYXRpYWxkcmF3L3RhcmdldC93ZWJhcHAvc2hhcGUtdXRpbHMnXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uLy4uLy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHtcbiAgR2VvbWV0cnlKU09OLFxuICBtYWtlR2VvbWV0cnksXG4gIG1ha2VQb2ludFJhZGl1c0dlbyxcbiAgbWFrZUxpbmVHZW8sXG4gIG1ha2VCQm94R2VvLFxufSBmcm9tICdnZW9zcGF0aWFsZHJhdy90YXJnZXQvd2ViYXBwL2dlb21ldHJ5J1xuaW1wb3J0ICogYXMgb2wgZnJvbSAnb3BlbmxheWVycydcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vLi4vLi4vLi4vanMvQ29tbW9uJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0ICogYXMgVHVyZiBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IHsgUG9pbnQsIFBvbHlnb24sIExpbmVTdHJpbmcgfSBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IHsgdmFsaWRhdGVHZW8gfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCBTaGFwZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2pzL1NoYXBlVXRpbHMnXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuL3V0aWxpdHknXG5pbXBvcnQge1xuICBsb2NhdGlvbkNvbG9ycyxcbiAgY29udHJhc3RpbmdDb2xvcixcbn0gZnJvbSAnLi4vLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L2xvY2F0aW9uL2xvY2F0aW9uLWNvbG9yLXNlbGVjdG9yJ1xuaW1wb3J0IHsgSW50ZXJhY3Rpb25zQ29udGV4dCB9IGZyb20gJy4uL2ludGVyYWN0aW9ucy5wcm92aWRlcidcbmltcG9ydCB7IE1vZGVsIH0gZnJvbSAnYmFja2JvbmUnXG5cbmNvbnN0IERyYXdpbmdNZW51ID0gbWVudS5EcmF3aW5nTWVudVxuY29uc3QgbWFrZUVtcHR5R2VvbWV0cnkgPSBnZW9tZXRyeS5tYWtlRW1wdHlHZW9tZXRyeVxuXG5jb25zdCBTSEFQRVM6IFNoYXBlW10gPSBbXG4gICdCb3VuZGluZyBCb3gnLFxuICAnTGluZScsXG4gICdQb2ludCcsXG4gICdQb2ludCBSYWRpdXMnLFxuICAnUG9seWdvbicsXG5dXG5cbmNvbnN0IERFRkFVTFRfU0hBUEUgPSAnUG9seWdvbidcbmNvbnN0IERSQVdJTkdfQ09MT1IgPSAnYmx1ZSdcblxuZXhwb3J0IGNvbnN0IHJlbW92ZU9sZERyYXdpbmcgPSAoeyBtYXAsIGlkIH06IHsgbWFwOiBvbC5NYXA7IGlkOiBzdHJpbmcgfSkgPT4ge1xuICBjb25zdCBvbGRMYXllcnMgPSBtYXBcbiAgICAuZ2V0TGF5ZXJzKClcbiAgICAuZ2V0QXJyYXkoKVxuICAgIC5maWx0ZXIoKGxheWVyKSA9PiB7XG4gICAgICByZXR1cm4gbGF5ZXIuZ2V0KCdpZCcpID09PSBpZFxuICAgIH0pXG4gIG9sZExheWVycy5mb3JFYWNoKChsYXllcikgPT4ge1xuICAgIG1hcC5yZW1vdmVMYXllcihsYXllcilcbiAgfSlcbn1cblxuLy8gc2VlIGdlbmVyYXRlQW55R2VvRmlsdGVyIGluIENRTFV0aWxzLnRzIGZvciB0eXBlc1xuY29uc3QgZ2V0R2VvVHlwZSA9IChnZW86IEdlb21ldHJ5SlNPTikgPT4ge1xuICBzd2l0Y2ggKGdlby5wcm9wZXJ0aWVzLnNoYXBlKSB7XG4gICAgY2FzZSAnTGluZSc6XG4gICAgICByZXR1cm4gJ0xJTkUnXG4gICAgY2FzZSAnUG9pbnQnOlxuICAgICAgcmV0dXJuICdQT0lOVCdcbiAgICBjYXNlICdQb2ludCBSYWRpdXMnOlxuICAgICAgcmV0dXJuICdQT0lOVFJBRElVUydcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdQT0xZR09OJ1xuICB9XG59XG5cbmNvbnN0IGNyZWF0ZVBvbHlnb25Nb2RlbCA9IChnZW86IEdlb21ldHJ5SlNPTikgPT4ge1xuICAvLyBJZ25vcmUgWiBjb29yZGluYXRlIGlmIGV4aXN0c1xuICBjb25zdCBwb2x5Z29uID0gKGdlby5nZW9tZXRyeSBhcyBQb2x5Z29uKS5jb29yZGluYXRlc1swXS5tYXAoKHBvc2l0aW9uKSA9PlxuICAgIHBvc2l0aW9uLmxlbmd0aCA+IDIgPyBwb3NpdGlvbi5zbGljZSgwLCAyKSA6IHBvc2l0aW9uXG4gIClcbiAgcmV0dXJuIHtcbiAgICBwb2x5Z29uOiBDb21tb24ud3JhcE1hcENvb3JkaW5hdGVzQXJyYXkocG9seWdvbiBhcyBhbnkpLm1hcCgoY29vcmRzKSA9PlxuICAgICAgY29vcmRzLm1hcCgoY29vcmQpID0+IE51bWJlcihjb29yZC50b0ZpeGVkKDYpKSlcbiAgICApLFxuICAgIHBvbHlnb25CdWZmZXJXaWR0aDogZ2VvLnByb3BlcnRpZXMuYnVmZmVyPy50b1N0cmluZygpIHx8ICcwJyxcbiAgICBwb2x5Z29uQnVmZmVyVW5pdHM6IGdlby5wcm9wZXJ0aWVzLmJ1ZmZlclVuaXQsXG4gIH1cbn1cblxuY29uc3QgY3JlYXRlTGluZVN0cmluZ01vZGVsID0gKGdlbzogR2VvbWV0cnlKU09OKSA9PiB7XG4gIC8vIElnbm9yZSBaIGNvb3JkaW5hdGUgaWYgZXhpc3RzXG4gIGNvbnN0IGxpbmUgPSAoZ2VvLmdlb21ldHJ5IGFzIExpbmVTdHJpbmcpLmNvb3JkaW5hdGVzLm1hcCgocG9zaXRpb24pID0+XG4gICAgcG9zaXRpb24ubGVuZ3RoID4gMiA/IHBvc2l0aW9uLnNsaWNlKDAsIDIpIDogcG9zaXRpb25cbiAgKVxuICByZXR1cm4ge1xuICAgIGxpbmU6IENvbW1vbi53cmFwTWFwQ29vcmRpbmF0ZXNBcnJheShsaW5lIGFzIGFueSkubWFwKChjb29yZHMpID0+XG4gICAgICBjb29yZHMubWFwKChjb29yZCkgPT4gTnVtYmVyKGNvb3JkLnRvRml4ZWQoNikpKVxuICAgICksXG4gICAgbGluZVdpZHRoOiBnZW8ucHJvcGVydGllcy5idWZmZXI/LnRvU3RyaW5nKCkgfHwgJzAnLFxuICAgIGxpbmVVbml0czogZ2VvLnByb3BlcnRpZXMuYnVmZmVyVW5pdCxcbiAgfVxufVxuXG5jb25zdCBjcmVhdGVQb2ludFJhZGl1c01vZGVsID0gKGdlbzogR2VvbWV0cnlKU09OKSA9PiB7XG4gIGNvbnN0IHdyYXBwZWQgPSBDb21tb24ud3JhcE1hcENvb3JkaW5hdGVzQXJyYXkoW1xuICAgIChnZW8uZ2VvbWV0cnkgYXMgUG9pbnQpLmNvb3JkaW5hdGVzLFxuICBdIGFzIGFueSlcbiAgcmV0dXJuIHtcbiAgICBsb246IE51bWJlcih3cmFwcGVkWzBdWzBdLnRvRml4ZWQoNikpLFxuICAgIGxhdDogTnVtYmVyKHdyYXBwZWRbMF1bMV0udG9GaXhlZCg2KSksXG4gICAgcmFkaXVzOiBnZW8ucHJvcGVydGllcy5idWZmZXI/LnRvU3RyaW5nKCkgfHwgJzEnLFxuICAgIHJhZGl1c1VuaXRzOiBnZW8ucHJvcGVydGllcy5idWZmZXJVbml0LFxuICB9XG59XG5cbmNvbnN0IGNyZWF0ZUJvdW5kaW5nQm94TW9kZWwgPSAoZ2VvOiBHZW9tZXRyeUpTT04pID0+IHtcbiAgLy8gYmJveCBvcmRlcjogd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXG4gIGNvbnN0IHdyYXBwZWQgPSBDb21tb24ud3JhcE1hcENvb3JkaW5hdGVzQXJyYXkoW1xuICAgIFtnZW8uYmJveFswXSwgZ2VvLmJib3hbMV1dLFxuICAgIFtnZW8uYmJveFsyXSwgZ2VvLmJib3hbM11dLFxuICBdKVxuICBjb25zdCB3ZXN0ID0gTnVtYmVyKHdyYXBwZWRbMF1bMF0udG9GaXhlZCg2KSlcbiAgY29uc3Qgc291dGggPSBOdW1iZXIod3JhcHBlZFswXVsxXS50b0ZpeGVkKDYpKVxuICBjb25zdCBlYXN0ID0gTnVtYmVyKHdyYXBwZWRbMV1bMF0udG9GaXhlZCg2KSlcbiAgY29uc3Qgbm9ydGggPSBOdW1iZXIod3JhcHBlZFsxXVsxXS50b0ZpeGVkKDYpKVxuICByZXR1cm4ge1xuICAgIHdlc3QsXG4gICAgbWFwV2VzdDogd2VzdCxcbiAgICBzb3V0aCxcbiAgICBtYXBTb3V0aDogc291dGgsXG4gICAgZWFzdCxcbiAgICBtYXBFYXN0OiBlYXN0LFxuICAgIG5vcnRoLFxuICAgIG1hcE5vcnRoOiBub3J0aCxcbiAgfVxufVxuXG5jb25zdCBjcmVhdGVHZW9Nb2RlbCA9IChnZW86IEdlb21ldHJ5SlNPTikgPT4ge1xuICBzd2l0Y2ggKGdlby5wcm9wZXJ0aWVzLnNoYXBlKSB7XG4gICAgY2FzZSAnUG9seWdvbic6XG4gICAgICByZXR1cm4gY3JlYXRlUG9seWdvbk1vZGVsKGdlbylcbiAgICBjYXNlICdMaW5lJzpcbiAgICAgIHJldHVybiBjcmVhdGVMaW5lU3RyaW5nTW9kZWwoZ2VvKVxuICAgIGNhc2UgJ1BvaW50JzpcbiAgICBjYXNlICdQb2ludCBSYWRpdXMnOlxuICAgICAgcmV0dXJuIGNyZWF0ZVBvaW50UmFkaXVzTW9kZWwoZ2VvKVxuICAgIGNhc2UgJ0JvdW5kaW5nIEJveCc6XG4gICAgICByZXR1cm4gY3JlYXRlQm91bmRpbmdCb3hNb2RlbChnZW8pXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7fVxuICB9XG59XG5jb25zdCBjcmVhdGVEZWZhdWx0UG9seWdvbiA9IChcbiAgYnVmZmVyOiBudW1iZXIsXG4gIGJ1ZmZlclVuaXQ6IHN0cmluZyxcbiAgY29sb3I6IHN0cmluZ1xuKTogYW55ID0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgaWQ6ICcnLFxuICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgc2hhcGU6ICdQb2x5Z29uJyxcbiAgICAgIGJ1ZmZlcjogYnVmZmVyLFxuICAgICAgYnVmZmVyVW5pdDogYnVmZmVyVW5pdCxcbiAgICB9LFxuICAgIGdlb21ldHJ5OiB7XG4gICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICBjb29yZGluYXRlczogW1tdXSxcbiAgICB9LFxuICAgIGJib3g6IFswLCAwLCAwLCAwXSxcbiAgfVxufVxuXG5jb25zdCBtb2RlbFRvUG9seWdvbiA9IChtb2RlbDogYW55KTogR2VvbWV0cnlKU09OIHwgbnVsbCA9PiB7XG4gIGNvbnN0IGNvb3JkcyA9IG1vZGVsLmdldCgncG9seWdvbicpXG4gIGNvbnN0IHBvbHlnb25CdWZmZXJXaWR0aCA9IE51bWJlcihtb2RlbC5nZXQoJ3BvbHlnb25CdWZmZXJXaWR0aCcpKVxuICBjb25zdCBidWZmZXIgPSBOdW1iZXIuaXNOYU4ocG9seWdvbkJ1ZmZlcldpZHRoKSA/IDAgOiBwb2x5Z29uQnVmZmVyV2lkdGhcbiAgY29uc3QgYnVmZmVyVW5pdCA9IG1vZGVsLmdldCgncG9seWdvbkJ1ZmZlclVuaXRzJykgfHwgdW5kZWZpbmVkXG5cbiAgaWYgKFxuICAgIGNvb3JkcyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgdmFsaWRhdGVHZW8oJ3BvbHlnb24nLCBKU09OLnN0cmluZ2lmeShjb29yZHMpKT8uZXJyb3JcbiAgKSB7XG4gICAgcmV0dXJuIGNyZWF0ZURlZmF1bHRQb2x5Z29uKGJ1ZmZlciwgYnVmZmVyVW5pdCwgRFJBV0lOR19DT0xPUilcbiAgfVxuXG4gIGNvbnN0IGlzTXVsdGlQb2x5Z29uID0gU2hhcGVVdGlscy5pc0FycmF5M0QoY29vcmRzKVxuICBjb25zdCBwb2x5Z29uID0gaXNNdWx0aVBvbHlnb24gPyBjb29yZHMgOiBbY29vcmRzXVxuICByZXR1cm4gbWFrZUdlb21ldHJ5KFxuICAgIHY0KCksXG4gICAgVHVyZi5wb2x5Z29uKHBvbHlnb24pLmdlb21ldHJ5LFxuICAgIERSQVdJTkdfQ09MT1IsXG4gICAgJ1BvbHlnb24nLFxuICAgIE51bWJlci5pc05hTihidWZmZXIpID8gMCA6IGJ1ZmZlcixcbiAgICBidWZmZXJVbml0XG4gIClcbn1cblxuY29uc3QgbW9kZWxUb0xpbmUgPSAobW9kZWw6IGFueSk6IEdlb21ldHJ5SlNPTiB8IG51bGwgPT4ge1xuICBjb25zdCBsaW5lV2lkdGggPSBOdW1iZXIobW9kZWwuZ2V0KCdsaW5lV2lkdGgnKSlcbiAgY29uc3QgYnVmZmVyID0gTnVtYmVyLmlzTmFOKGxpbmVXaWR0aCkgPyAwIDogbGluZVdpZHRoXG4gIGNvbnN0IGJ1ZmZlclVuaXQgPSBtb2RlbC5nZXQoJ2xpbmVVbml0cycpIHx8ICdtZXRlcnMnXG4gIGxldCBjb29yZHMgPSBtb2RlbC5nZXQoJ2xpbmUnKVxuICBpZiAoXG4gICAgY29vcmRzID09PSB1bmRlZmluZWQgfHxcbiAgICB2YWxpZGF0ZUdlbygnbGluZScsIEpTT04uc3RyaW5naWZ5KGNvb3JkcykpPy5lcnJvclxuICApIHtcbiAgICBjb29yZHMgPSBbXVxuICB9XG4gIHJldHVybiBtYWtlTGluZUdlbyh2NCgpLCBjb29yZHMsIGJ1ZmZlciwgYnVmZmVyVW5pdClcbn1cblxuY29uc3QgbW9kZWxUb1BvaW50UmFkaXVzID0gKG1vZGVsOiBhbnkpOiBHZW9tZXRyeUpTT04gfCBudWxsID0+IHtcbiAgY29uc3QgbG9uID0gbW9kZWwuZ2V0KCdsb24nKVxuICBjb25zdCBsYXQgPSBtb2RlbC5nZXQoJ2xhdCcpXG4gIGlmIChsb24gPT09IHVuZGVmaW5lZCB8fCBsYXQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgY29uc3QgcmFkaXVzID0gTnVtYmVyKG1vZGVsLmdldCgncmFkaXVzJykpXG4gIGNvbnN0IHJhZGl1c1VuaXRzID0gbW9kZWwuZ2V0KCdyYWRpdXNVbml0cycpXG4gIHJldHVybiBtYWtlUG9pbnRSYWRpdXNHZW8oXG4gICAgdjQoKSxcbiAgICBsYXQsXG4gICAgbG9uLFxuICAgIE51bWJlci5pc05hTihyYWRpdXMpID8gMSA6IHJhZGl1cyxcbiAgICByYWRpdXNVbml0cyB8fCAnbWV0ZXJzJ1xuICApXG59XG5cbmNvbnN0IGlzQW55TmFOID0gKG51bWJlcnM6IG51bWJlcltdKSA9PiB7XG4gIHJldHVybiBudW1iZXJzLnNvbWUoKG4pID0+IG4gPT09IHVuZGVmaW5lZCB8fCBuID09PSBudWxsIHx8IE51bWJlci5pc05hTihuKSlcbn1cblxuY29uc3QgbW9kZWxUb0JvdW5kaW5nQm94ID0gKG1vZGVsOiBhbnkpOiBHZW9tZXRyeUpTT04gfCBudWxsID0+IHtcbiAgY29uc3Qgd2VzdCA9IG1vZGVsLmdldCgnd2VzdCcpXG4gIGNvbnN0IHNvdXRoID0gbW9kZWwuZ2V0KCdzb3V0aCcpXG4gIGNvbnN0IGVhc3QgPSBtb2RlbC5nZXQoJ2Vhc3QnKVxuICBjb25zdCBub3J0aCA9IG1vZGVsLmdldCgnbm9ydGgnKVxuICBpZiAoaXNBbnlOYU4oW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF0pKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICByZXR1cm4gbWFrZUJCb3hHZW8odjQoKSwgW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF0pXG59XG5cbmV4cG9ydCBjb25zdCBnZXREcmF3aW5nR2VvbWV0cnlGcm9tTW9kZWwgPSAoXG4gIG1vZGVsOiBhbnlcbik6IEdlb21ldHJ5SlNPTiB8IG51bGwgPT4ge1xuICBjb25zdCBtb2RlID0gbW9kZWwuZ2V0KCdtb2RlJylcbiAgbGV0IGdlb1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlICdiYm94JzpcbiAgICAgIGdlbyA9IG1vZGVsVG9Cb3VuZGluZ0JveChtb2RlbClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgIGdlbyA9IG1vZGVsVG9Qb2ludFJhZGl1cyhtb2RlbClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnbGluZSc6XG4gICAgICBnZW8gPSBtb2RlbFRvTGluZShtb2RlbClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncG9seSc6XG4gICAgICBnZW8gPSBtb2RlbFRvUG9seWdvbihtb2RlbClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKGdlbykge1xuICAgIHV0aWxpdHkuYWRqdXN0R2VvQ29vcmRzKGdlbylcbiAgICBpZiAoZ2VvLnByb3BlcnRpZXM/LmNvbG9yKSB7XG4gICAgICBnZW8ucHJvcGVydGllcy5jb2xvciA9IGNvbnRyYXN0aW5nQ29sb3JcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGdlb1xufVxuXG5leHBvcnQgY29uc3QgY29udmVydFRvTW9kZWwgPSAoe1xuICBnZW8sXG4gIHNoYXBlLFxuICBleGlzdGluZ01vZGVsLFxufToge1xuICBnZW86IEdlb21ldHJ5SlNPTlxuICBzaGFwZTogU2hhcGVcbiAgZXhpc3RpbmdNb2RlbD86IEJhY2tib25lLk1vZGVsXG59KSA9PiB7XG4gIGNvbnN0IHByb3BlcnRpZXM6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7XG4gICAgLi4uY3JlYXRlR2VvTW9kZWwoZ2VvKSxcbiAgICB0eXBlOiBnZXRHZW9UeXBlKGdlbyksXG4gICAgbW9kZTogZ2V0RHJhd01vZGVGcm9tU2hhcGUoc2hhcGUpLFxuICB9XG5cbiAgLy8gaWYgdGhlIG1vZGVsIGlzIGJlaW5nIHVwZGF0ZWQsIHdlIHdhbnQgdG8ga2VlcCB0aGUgaWQsIG90aGVyd2lzZSB1c2UgdGhlIGdlbyBwcm9wZXJ0aWVzIGlkIHRvIHJlY3JlYXRlIHRoZSBtb2RlbFxuICBpZiAoIWV4aXN0aW5nTW9kZWwpIHtcbiAgICBwcm9wZXJ0aWVzLmlkID0gZ2VvLnByb3BlcnRpZXMuaWRcbiAgfVxuXG4gIC8vIGdlby5wcm9wZXJ0aWVzPy5jb2xvciB3aWxsIGhhdmUgYSB2YWx1ZSB3aGVuIGluIGRyYXdpbmcgbW9kZSxcbiAgLy8gYnV0IHdlIGRvbnQgd2FudCB0byByZW5kZXIgdGhlIGRyYXdpbmcncyBjb250cmFzdGluZ0NvbG9yIGFmdGVyIHNhdmluZy5cbiAgLy8gU28sIHdlIG9ubHkgd2FudCB0byBzZXQgdGhlIGRlZmF1bHQgaWYgbm8gY29sb3IgaXMgYWxyZWFkeSBzZXRcbiAgaWYgKGdlby5wcm9wZXJ0aWVzPy5jb2xvciAhPT0gY29udHJhc3RpbmdDb2xvcikge1xuICAgIHByb3BlcnRpZXMuY29sb3IgPSBnZW8ucHJvcGVydGllcz8uY29sb3IgfHwgT2JqZWN0LnZhbHVlcyhsb2NhdGlvbkNvbG9ycylbMF1cbiAgfVxuXG4gIHJldHVybiBwcm9wZXJ0aWVzXG59XG5cbi8vIFRoaXMgaXMgbm90IGEgcGllY2Ugb2Ygc3RhdGUgYmVjYXVzZSB0aGUgZ2Vvc3BhdGlhbGRyYXdcbi8vIGxpYnJhcnkgcmVyZW5kZXJzIGJvdW5kaW5nIGJveGVzIHVubmVjZXNzYXJpbHlcbi8vIElmIHRoaXMgd2FzIHN0YXRlLCB0aGUgcmVzdWx0aW5nIHJlcmVuZGVycyB3b3VsZFxuLy8gYnJlYWsgYm91bmRpbmcgYm94ZXMgaW4gdGhlIHVwZGF0ZUdlbyBtZXRob2RcbmxldCBkcmF3aW5nTG9jYXRpb246IEdlb21ldHJ5SlNPTiB8IG51bGwgPSBtYWtlRW1wdHlHZW9tZXRyeShcbiAgdjQoKSxcbiAgREVGQVVMVF9TSEFQRVxuKVxuXG5jb25zdCBwcmVzZXJ2ZUJ1ZmZlciA9IChcbiAgZHJhd2luZ01vZGVsOiBhbnksXG4gIGRyYXdpbmdMb2NhdGlvbjogZ2VvbWV0cnkuR2VvbWV0cnlKU09OLFxuICBkcmF3aW5nU2hhcGU6IHN0cmluZ1xuKTogZ2VvbWV0cnkuR2VvbWV0cnlKU09OID0+IHtcbiAgY29uc3QgdXBkYXRlZERyYXdpbmdMb2NhdGlvbiA9IGRyYXdpbmdMb2NhdGlvblxuICBpZiAoZHJhd2luZ1NoYXBlID09PSAnTGluZScpIHtcbiAgICBjb25zdCBsaW5lV2lkdGggPSBkcmF3aW5nTW9kZWwuZ2V0KCdsaW5lV2lkdGgnKVxuICAgIGNvbnN0IGxpbmVVbml0cyA9IGRyYXdpbmdNb2RlbC5nZXQoJ2xpbmVVbml0cycpXG4gICAgaWYgKGxpbmVXaWR0aCkge1xuICAgICAgdXBkYXRlZERyYXdpbmdMb2NhdGlvbi5wcm9wZXJ0aWVzLmJ1ZmZlciA9IGxpbmVXaWR0aFxuICAgIH1cbiAgICBpZiAobGluZVVuaXRzKSB7XG4gICAgICB1cGRhdGVkRHJhd2luZ0xvY2F0aW9uLnByb3BlcnRpZXMuYnVmZmVyVW5pdCA9IGxpbmVVbml0c1xuICAgIH1cbiAgfVxuICBpZiAoZHJhd2luZ1NoYXBlID09PSAnUG9seWdvbicpIHtcbiAgICBjb25zdCBwb2x5Z29uV2lkdGggPSBkcmF3aW5nTW9kZWwuZ2V0KCdwb2x5Z29uQnVmZmVyV2lkdGgnKVxuICAgIGNvbnN0IHBvbHlnb25Vbml0cyA9IGRyYXdpbmdNb2RlbC5nZXQoJ3BvbHlnb25CdWZmZXJVbml0cycpXG4gICAgaWYgKHBvbHlnb25XaWR0aCkge1xuICAgICAgdXBkYXRlZERyYXdpbmdMb2NhdGlvbi5wcm9wZXJ0aWVzLmJ1ZmZlciA9IHBvbHlnb25XaWR0aFxuICAgIH1cbiAgICBpZiAocG9seWdvblVuaXRzKSB7XG4gICAgICB1cGRhdGVkRHJhd2luZ0xvY2F0aW9uLnByb3BlcnRpZXMuYnVmZmVyVW5pdCA9IHBvbHlnb25Vbml0c1xuICAgIH1cbiAgfVxuICByZXR1cm4gdXBkYXRlZERyYXdpbmdMb2NhdGlvblxufVxuXG5leHBvcnQgY29uc3QgT3BlbmxheWVyc0RyYXdpbmdzID0gKHtcbiAgbWFwLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIG1hcDogYW55XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59KSA9PiB7XG4gIGNvbnN0IHsgbW9kZWxzLCBmaWx0ZXJNb2RlbHMsIGRyYXdpbmdNb2RlbHMgfSA9IHVzZURyYXdpbmdBbmREaXNwbGF5TW9kZWxzKHtcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgbWFwLFxuICB9KVxuXG4gIGNvbnN0IFtkcmF3aW5nTW9kZWxdID1cbiAgICBkcmF3aW5nTW9kZWxzLmxlbmd0aCA+IDAgPyBkcmF3aW5nTW9kZWxzLnNsaWNlKC0xKSA6IFt1bmRlZmluZWRdXG5cbiAgY29uc3QgW2lzRHJhd2luZywgc2V0SXNEcmF3aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZHJhd2luZ1NoYXBlLCBzZXREcmF3aW5nU2hhcGVdID0gdXNlU3RhdGU8U2hhcGU+KERFRkFVTFRfU0hBUEUpXG4gIGNvbnN0IFtkcmF3aW5nR2VvbWV0cnksIHNldERyYXdpbmdHZW9tZXRyeV0gPSB1c2VTdGF0ZTxHZW9tZXRyeUpTT04gfCBudWxsPihcbiAgICBudWxsXG4gIClcblxuICBjb25zdCBbdXBkYXRlZEJ1ZmZlciwgc2V0VXBkYXRlZEJ1ZmZlcl0gPSB1c2VTdGF0ZTxudW1iZXI+KClcbiAgY29uc3QgW3VwZGF0ZWRCdWZmZXJVbml0LCBzZXRVcGRhdGVkQnVmZmVyVW5pdF0gPSB1c2VTdGF0ZTxzdHJpbmc+KClcblxuICBjb25zdCB7IGludGVyYWN0aXZlR2VvLCB0cmFuc2xhdGlvbiwgc2V0SW50ZXJhY3RpdmVNb2RlbHMgfSA9XG4gICAgUmVhY3QudXNlQ29udGV4dChJbnRlcmFjdGlvbnNDb250ZXh0KVxuXG4gIGNvbnN0IG5vbkRyYXdpbmdNb2RlbHMgPSBtb2RlbHMuY29uY2F0KGZpbHRlck1vZGVscylcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG1vZGVscyA9IG5vbkRyYXdpbmdNb2RlbHMuZmlsdGVyKFxuICAgICAgKG1vZGVsOiBNb2RlbCkgPT4gbW9kZWwuZ2V0KCdsb2NhdGlvbklkJykgPT09IGludGVyYWN0aXZlR2VvXG4gICAgKVxuICAgIHNldEludGVyYWN0aXZlTW9kZWxzKG1vZGVscylcbiAgfSwgW2ludGVyYWN0aXZlR2VvLCBtb2RlbHMsIGZpbHRlck1vZGVsc10pXG5cbiAgY29uc3QgaGFuZGxlS2V5ZG93biA9IFJlYWN0LnVzZUNhbGxiYWNrKFxuICAgIChlOiBhbnkpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgaWYgKGRyYXdpbmdMb2NhdGlvbikgZmluaXNoRHJhd2luZygpXG4gICAgICB9XG4gICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgIGNhbmNlbERyYXdpbmcoKVxuICAgICAgfVxuICAgIH0sXG4gICAgW2RyYXdpbmdNb2RlbCwgZHJhd2luZ1NoYXBlLCBkcmF3aW5nTG9jYXRpb25dXG4gIClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldElzRHJhd2luZyghIWRyYXdpbmdNb2RlbClcbiAgICBpZiAoZHJhd2luZ01vZGVsKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUtleWRvd24pXG4gICAgICBzZXREcmF3aW5nU2hhcGUoXG4gICAgICAgIGdldFNoYXBlRnJvbURyYXdNb2RlKGdldERyYXdNb2RlRnJvbU1vZGVsKHsgbW9kZWw6IGRyYXdpbmdNb2RlbCB9KSlcbiAgICAgIClcbiAgICAgIHNldERyYXdpbmdHZW9tZXRyeShnZXREcmF3aW5nR2VvbWV0cnlGcm9tTW9kZWwoZHJhd2luZ01vZGVsKSlcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICB9LCBbZHJhd2luZ01vZGVsXSlcblxuICBjb25zdCBsaW5lQnVmZmVyQ2hhbmdlZENhbGxiYWNrID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFVwZGF0ZWRCdWZmZXIoZHJhd2luZ01vZGVsLmF0dHJpYnV0ZXMubGluZVdpZHRoKVxuICAgIHNldFVwZGF0ZWRCdWZmZXJVbml0KGRyYXdpbmdNb2RlbC5hdHRyaWJ1dGVzLmxpbmVVbml0cylcbiAgfSwgW2RyYXdpbmdNb2RlbF0pXG5cbiAgdXNlTGlzdGVuVG8oXG4gICAgZHJhd2luZ01vZGVsLFxuICAgICdjaGFuZ2U6bGluZVdpZHRoIGNoYW5nZTpsaW5lVW5pdHMnLFxuICAgIGxpbmVCdWZmZXJDaGFuZ2VkQ2FsbGJhY2tcbiAgKVxuXG4gIGNvbnN0IHBvbHlnb25CdWZmZXJDaGFuZ2VkQ2FsbGJhY2sgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0VXBkYXRlZEJ1ZmZlcihkcmF3aW5nTW9kZWwuYXR0cmlidXRlcy5wb2x5Z29uQnVmZmVyV2lkdGgpXG4gICAgc2V0VXBkYXRlZEJ1ZmZlclVuaXQoZHJhd2luZ01vZGVsLmF0dHJpYnV0ZXMucG9seWdvbkJ1ZmZlclVuaXRzKVxuICB9LCBbZHJhd2luZ01vZGVsXSlcblxuICB1c2VMaXN0ZW5UbyhcbiAgICBkcmF3aW5nTW9kZWwsXG4gICAgJ2NoYW5nZTpwb2x5Z29uQnVmZmVyV2lkdGggY2hhbmdlOnBvbHlnb25CdWZmZXJVbml0cycsXG4gICAgcG9seWdvbkJ1ZmZlckNoYW5nZWRDYWxsYmFja1xuICApXG5cbiAgY29uc3QgY2FuY2VsRHJhd2luZyA9ICgpID0+IHtcbiAgICBkcmF3aW5nTW9kZWwuc2V0KCdkcmF3aW5nJywgZmFsc2UpXG4gICAgLy8gdGhlIGxpc3RlbmVyIGZvciB0aGlzIGNhbGxzIERyYXdpbmcudHVybk9mZkRyYXdpbmcoKVxuICAgIHdyZXFyLnZlbnQudHJpZ2dlcignc2VhcmNoOmRyYXdjYW5jZWwnLCBkcmF3aW5nTW9kZWwpXG4gICAgc2V0SXNEcmF3aW5nKGZhbHNlKVxuICAgIHNldERyYXdpbmdTaGFwZShERUZBVUxUX1NIQVBFKVxuICAgIHNldERyYXdpbmdHZW9tZXRyeShudWxsKVxuICAgIHNldFVwZGF0ZWRCdWZmZXIodW5kZWZpbmVkKVxuICAgIGRyYXdpbmdMb2NhdGlvbiA9IG51bGxcbiAgfVxuXG4gIC8vIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGNsaWNrcyBhcHBseSBkdXJpbmcgZ2VvIGRyYXdpbmdcbiAgY29uc3QgZmluaXNoRHJhd2luZyA9ICgpID0+IHtcbiAgICBpZiAoZHJhd2luZ0xvY2F0aW9uID09PSBudWxsKSB7XG4gICAgICBjYW5jZWxEcmF3aW5nKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB3cmVxci52ZW50LnRyaWdnZXIoXG4gICAgICBgc2VhcmNoOiR7Z2V0RHJhd01vZGVGcm9tU2hhcGUoZHJhd2luZ1NoYXBlKX0tZW5kYCxcbiAgICAgIGRyYXdpbmdNb2RlbFxuICAgIClcbiAgICB3cmVxci52ZW50LnRyaWdnZXIoYHNlYXJjaDpkcmF3ZW5kYCwgZHJhd2luZ01vZGVsKVxuICAgIGRyYXdpbmdNb2RlbC5zZXQoJ2RyYXdpbmcnLCBmYWxzZSlcblxuICAgIC8vIHByZXNlcnZlIGJ1ZmZlciBzZXQgYnkgdXNlclxuICAgIGNvbnN0IHVwZGF0ZWREcmF3aW5nTG9jYXRpb24gPSBwcmVzZXJ2ZUJ1ZmZlcihcbiAgICAgIGRyYXdpbmdNb2RlbCxcbiAgICAgIGRyYXdpbmdMb2NhdGlvbixcbiAgICAgIGRyYXdpbmdTaGFwZVxuICAgIClcblxuICAgIGRyYXdpbmdNb2RlbC5zZXQoXG4gICAgICBjb252ZXJ0VG9Nb2RlbCh7XG4gICAgICAgIGdlbzogdXBkYXRlZERyYXdpbmdMb2NhdGlvbixcbiAgICAgICAgc2hhcGU6IGRyYXdpbmdTaGFwZSxcbiAgICAgICAgZXhpc3RpbmdNb2RlbDogZHJhd2luZ01vZGVsLFxuICAgICAgfSlcbiAgICApXG4gICAgc2V0SXNEcmF3aW5nKGZhbHNlKVxuICAgIHNldERyYXdpbmdHZW9tZXRyeSh1cGRhdGVkRHJhd2luZ0xvY2F0aW9uKVxuICAgIGRyYXdpbmdMb2NhdGlvbiA9IG51bGxcbiAgfVxuXG4gIC8vIGNhbGxlZCBkdXJpbmcgZHJhd2luZyBhdCByYW5kb20gaW50ZXJ2YWxzXG4gIGNvbnN0IHVwZGF0ZUdlbyA9IChnZW86IEdlb21ldHJ5SlNPTikgPT4ge1xuICAgIGRyYXdpbmdMb2NhdGlvbiA9IGdlb1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge25vbkRyYXdpbmdNb2RlbHMubWFwKChtb2RlbDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGRyYXdNb2RlID0gZ2V0RHJhd01vZGVGcm9tTW9kZWwoeyBtb2RlbCB9KVxuICAgICAgICBjb25zdCBpc0ludGVyYWN0aXZlID0gbW9kZWwuZ2V0KCdsb2NhdGlvbklkJykgPT09IGludGVyYWN0aXZlR2VvXG4gICAgICAgIGNvbnN0IHNoYXBlVHJhbnNsYXRpb24gPVxuICAgICAgICAgIHRyYW5zbGF0aW9uICYmIGlzSW50ZXJhY3RpdmUgPyB0cmFuc2xhdGlvbiA6IHVuZGVmaW5lZFxuICAgICAgICBzd2l0Y2ggKGRyYXdNb2RlKSB7XG4gICAgICAgICAgY2FzZSAnYmJveCc6XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8T3BlbmxheWVyc0Jib3hEaXNwbGF5XG4gICAgICAgICAgICAgICAga2V5PXttb2RlbC5jaWR9XG4gICAgICAgICAgICAgICAgbW9kZWw9e21vZGVsfVxuICAgICAgICAgICAgICAgIG1hcD17bWFwfVxuICAgICAgICAgICAgICAgIGlzSW50ZXJhY3RpdmU9e2lzSW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb249e3NoYXBlVHJhbnNsYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxPcGVubGF5ZXJzQ2lyY2xlRGlzcGxheVxuICAgICAgICAgICAgICAgIGtleT17bW9kZWwuY2lkfVxuICAgICAgICAgICAgICAgIG1vZGVsPXttb2RlbH1cbiAgICAgICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgICAgICBpc0ludGVyYWN0aXZlPXtpc0ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uPXtzaGFwZVRyYW5zbGF0aW9ufVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPE9wZW5sYXllcnNMaW5lRGlzcGxheVxuICAgICAgICAgICAgICAgIGtleT17bW9kZWwuY2lkfVxuICAgICAgICAgICAgICAgIG1vZGVsPXttb2RlbH1cbiAgICAgICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgICAgICBpc0ludGVyYWN0aXZlPXtpc0ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uPXtzaGFwZVRyYW5zbGF0aW9ufVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIGNhc2UgJ3BvbHknOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPE9wZW5sYXllcnNQb2x5Z29uRGlzcGxheVxuICAgICAgICAgICAgICAgIGtleT17bW9kZWwuY2lkfVxuICAgICAgICAgICAgICAgIG1vZGVsPXttb2RlbH1cbiAgICAgICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgICAgICBpc0ludGVyYWN0aXZlPXtpc0ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uPXtzaGFwZVRyYW5zbGF0aW9ufVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8T3BlbmxheWVyc1BvbHlnb25EaXNwbGF5XG4gICAgICAgICAgICAgICAga2V5PXttb2RlbC5jaWR9XG4gICAgICAgICAgICAgICAgbW9kZWw9e21vZGVsfVxuICAgICAgICAgICAgICAgIG1hcD17bWFwfVxuICAgICAgICAgICAgICAgIGlzSW50ZXJhY3RpdmU9e2lzSW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb249e3NoYXBlVHJhbnNsYXRpb259XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0pfVxuICAgICAge2RyYXdpbmdNb2RlbCAmJiAoXG4gICAgICAgIDxFZGl0b3IgZGF0YS1pZD1cIm1hcC1kcmF3LW1lbnVcIj5cbiAgICAgICAgICA8RHJhd2luZ01lbnVcbiAgICAgICAgICAgIHNoYXBlPXtkcmF3aW5nU2hhcGV9XG4gICAgICAgICAgICBtYXA9e21hcC5nZXRNYXAoKX1cbiAgICAgICAgICAgIGlzQWN0aXZlPXtpc0RyYXdpbmd9XG4gICAgICAgICAgICBnZW9tZXRyeT17aXNEcmF3aW5nID8gZHJhd2luZ0dlb21ldHJ5IDogbnVsbH1cbiAgICAgICAgICAgIHVwZGF0ZWRCdWZmZXI9e3VwZGF0ZWRCdWZmZXJ9XG4gICAgICAgICAgICB1cGRhdGVkQnVmZmVyVW5pdD17dXBkYXRlZEJ1ZmZlclVuaXR9XG4gICAgICAgICAgICBvbkNhbmNlbD17Y2FuY2VsRHJhd2luZ31cbiAgICAgICAgICAgIG9uT2s9e2ZpbmlzaERyYXdpbmd9XG4gICAgICAgICAgICBvblNldFNoYXBlPXsoKSA9PiB7fX1cbiAgICAgICAgICAgIGRpc2FibGVkU2hhcGVzPXtTSEFQRVMuZmlsdGVyKChzaGFwZSkgPT4gc2hhcGUgIT09IGRyYXdpbmdTaGFwZSl9XG4gICAgICAgICAgICBvblVwZGF0ZT17dXBkYXRlR2VvfVxuICAgICAgICAgICAgc2F2ZUFuZENvbnRpbnVlPXtmYWxzZX1cbiAgICAgICAgICAgIG1hcFN0eWxlPXtEUkFXSU5HX1NUWUxFfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvRWRpdG9yPlxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuIl19