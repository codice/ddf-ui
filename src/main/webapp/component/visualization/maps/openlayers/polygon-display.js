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
import DistanceUtils from '../../../../js/DistanceUtils';
import ol from 'openlayers';
import _ from 'underscore';
import * as Turf from '@turf/turf';
import { validateGeo } from '../../../../react-component/utils/validation';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { removeOldDrawing } from './drawing-and-display';
import ShapeUtils from '../../../../js/ShapeUtils';
import { getIdFromModelForDisplay } from '../drawing-and-display';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
import { contrastingColor } from '../../../../react-component/location/location-color-selector';
export var translateFromOpenlayersCoordinates = function (coords) {
    return coords
        .map(function (value) {
        return value.map(function (point) {
            var mappedPoint = ol.proj.transform([
                DistanceUtils.coordinateRound(point[0]),
                DistanceUtils.coordinateRound(point[1]),
            ], StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
            if (mappedPoint[1] > 90) {
                mappedPoint[1] = 89.9;
            }
            else if (mappedPoint[1] < -90) {
                mappedPoint[1] = -89.9;
            }
            return mappedPoint;
        });
    })
        .flatten();
};
var coordsToLineString = function (rawCoords) {
    var setArr = _.uniq(rawCoords);
    if (setArr.length < 3) {
        return;
    }
    var coords = setArr.map(function (item) {
        return ol.proj.transform([item[0], item[1]], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    });
    // Ensure that the first and last coordinate are the same
    if (!_.isEqual(coords[0], coords[coords.length - 1])) {
        coords.push(coords[0]);
    }
    return [coords];
};
var modelToPolygon = function (model) {
    var _a;
    var coords = model.get('polygon');
    if (coords && coords.length === 0) {
        return new ol.geom.MultiPolygon([]);
    }
    if (coords &&
        coords.length > 0 &&
        coords[0].toString() !== coords[coords.length - 1].toString()) {
        coords.push(coords[0]);
    }
    if (coords === undefined ||
        ((_a = validateGeo('polygon', JSON.stringify(coords))) === null || _a === void 0 ? void 0 : _a.error)) {
        return;
    }
    var isMultiPolygon = ShapeUtils.isArray3D(coords);
    var multiPolygon = isMultiPolygon ? coords : [coords];
    var polygons = [];
    multiPolygon.forEach(function (polygon) {
        var lineString = coordsToLineString(polygon);
        if (lineString) {
            polygons.push(lineString);
        }
    });
    return new ol.geom.MultiPolygon(polygons);
};
var adjustPolygonPoints = function (polygon) {
    var extent = polygon.getExtent();
    var lon1 = extent[0];
    var lon2 = extent[2];
    var width = Math.abs(lon1 - lon2);
    if (width > 180) {
        var adjusted = polygon.getCoordinates();
        adjusted.forEach(function (ring) {
            ring.forEach(function (coord) {
                if (coord[0] < 0) {
                    coord[0] += 360;
                }
            });
        });
        polygon.setCoordinates(adjusted);
    }
};
var adjustMultiPolygonPoints = function (polygons) {
    var adjusted = [];
    polygons.getPolygons().forEach(function (polygon) {
        adjustPolygonPoints(polygon);
        adjusted.push(polygon.getCoordinates());
    });
    polygons.setCoordinates(adjusted);
};
export var drawPolygon = function (_a) {
    var map = _a.map, model = _a.model, polygon = _a.polygon, id = _a.id, isInteractive = _a.isInteractive, translation = _a.translation;
    if (!polygon) {
        // Handles case where model changes to empty vars and we don't want to draw anymore
        return;
    }
    if (translation) {
        polygon.translate(translation.longitude, translation.latitude);
    }
    adjustMultiPolygonPoints(polygon);
    var coordinates = polygon.getCoordinates();
    var bufferWidth = DistanceUtils.getDistanceInMeters(model.get('polygonBufferWidth'), model.get('polygonBufferUnits')) || 1;
    var drawnPolygonSegments = coordinates.map(function (set) {
        return Turf.multiLineString([translateFromOpenlayersCoordinates(set)])
            .geometry.coordinates;
    });
    var bufferPolygonSegments = coordinates.map(function (set) {
        var _a;
        var polySegment = Turf.multiLineString([
            translateFromOpenlayersCoordinates(set),
        ]);
        var bufferedSegment = Turf.buffer(polySegment, bufferWidth, {
            units: 'meters',
        });
        var extent = Turf.bbox(bufferedSegment);
        var width = Math.abs(extent[0] - extent[2]);
        // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
        if (width > 180) {
            Turf.coordEach(bufferedSegment, function (coord) {
                if (coord[0] < 0) {
                    coord[0] += 360;
                }
            });
        }
        var bufferPolygons = bufferedSegment.geometry.coordinates.map(function (set) {
            return Turf.polygon([set]);
        });
        return (_a = bufferPolygons.reduce(function (a, b) { return Turf.union(a, b); }, bufferPolygons[0])) === null || _a === void 0 ? void 0 : _a.geometry.coordinates;
    });
    var bufferGeometryRepresentation = new ol.geom.MultiPolygon(bufferPolygonSegments);
    var drawnGeometryRepresentation = new ol.geom.MultiPolygon(drawnPolygonSegments);
    var billboard = new ol.Feature({
        geometry: bufferGeometryRepresentation,
    });
    billboard.setId(id);
    billboard.set('locationId', model.get('locationId'));
    var drawnPolygonFeature = new ol.Feature({
        geometry: drawnGeometryRepresentation,
    });
    var color = model.get('color');
    var bufferPolygonIconStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: isInteractive ? contrastingColor : color ? color : '#914500',
            width: isInteractive ? 6 : 4,
        }),
        zIndex: 1,
    });
    var drawnPolygonIconStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: isInteractive ? contrastingColor : color ? color : '#914500',
            width: isInteractive ? 5 : 3,
            lineDash: [10, 5],
        }),
        zIndex: 0,
    });
    billboard.setStyle(bufferPolygonIconStyle);
    drawnPolygonFeature.setStyle(drawnPolygonIconStyle);
    var vectorSource = new ol.source.Vector({
        features: [billboard, drawnPolygonFeature],
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
    });
    var mapRef = map.getMap();
    removeOldDrawing({ map: mapRef, id: id });
    vectorLayer.set('id', id);
    mapRef.addLayer(vectorLayer);
};
var updatePrimitive = function (_a) {
    var map = _a.map, model = _a.model, id = _a.id, isInteractive = _a.isInteractive, translation = _a.translation;
    var polygon = modelToPolygon(model);
    if (polygon !== undefined) {
        drawPolygon({ map: map, model: model, polygon: polygon, id: id, isInteractive: isInteractive, translation: translation });
    }
};
var useListenToPolygonModel = function (_a) {
    var model = _a.model, map = _a.map, isInteractive = _a.isInteractive, translation = _a.translation;
    var callback = React.useMemo(function () {
        return function () {
            if (model && map) {
                updatePrimitive({
                    map: map,
                    model: model,
                    id: getIdFromModelForDisplay({ model: model }),
                    isInteractive: isInteractive,
                    translation: translation,
                });
            }
        };
    }, [model, map, isInteractive, translation]);
    useListenTo(model, 'change:polygon change:polygonBufferWidth change:polygonBufferUnits', callback);
    callback();
};
export var OpenlayersPolygonDisplay = function (_a) {
    var map = _a.map, model = _a.model, isInteractive = _a.isInteractive, translation = _a.translation;
    useListenToPolygonModel({ map: map, model: model, isInteractive: isInteractive, translation: translation });
    React.useEffect(function () {
        return function () {
            if (map && model) {
                removeOldDrawing({
                    map: map.getMap(),
                    id: getIdFromModelForDisplay({ model: model }),
                });
            }
        };
    }, [map, model]);
    return React.createElement(React.Fragment, null);
};
//# sourceMappingURL=polygon-display.js.map