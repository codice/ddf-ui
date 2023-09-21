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
import { getIdFromModelForDisplay } from '../drawing-and-display';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
export function translateFromOpenlayersCoordinates(coords) {
    var coordinates = [];
    coords.forEach(function (point) {
        point = ol.proj.transform([
            DistanceUtils.coordinateRound(point[0]),
            DistanceUtils.coordinateRound(point[1]),
        ], StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
        if (point[1] > 90) {
            point[1] = 89.9;
        }
        else if (point[1] < -90) {
            point[1] = -89.9;
        }
        coordinates.push(point);
    });
    return coordinates;
}
export function translateToOpenlayersCoordinates(coords) {
    var coordinates = [];
    coords.forEach(function (item) {
        if (item[0].constructor === Array) {
            coordinates.push(translateToOpenlayersCoordinates(item));
        }
        else {
            coordinates.push(ol.proj.transform([item[0], item[1]], 'EPSG:4326', StartupDataStore.Configuration.getProjection()));
        }
    });
    return coordinates;
}
var modelToLineString = function (model) {
    var polygon = model.get('line');
    var setArr = _.uniq(polygon);
    if (setArr.length < 2) {
        return;
    }
    return new ol.geom.LineString(translateToOpenlayersCoordinates(setArr));
};
var adjustLinePoints = function (line) {
    var extent = line.getExtent();
    var lon1 = extent[0];
    var lon2 = extent[2];
    var width = Math.abs(lon2 - lon1);
    if (width > 180) {
        var adjusted = line.getCoordinates();
        adjusted.forEach(function (coord) {
            if (coord[0] < 0) {
                coord[0] += 360;
            }
        });
        line.setCoordinates(adjusted);
    }
};
var adjustMultiLinePoints = function (lines) {
    var adjusted = [];
    lines.getLineStrings().forEach(function (line) {
        adjustLinePoints(line);
        adjusted.push(line.getCoordinates());
    });
    lines.setCoordinates(adjusted);
};
export var drawLine = function (_a) {
    var map = _a.map, model = _a.model, line = _a.line, id = _a.id;
    if (!line) {
        // Handles case where model changes to empty vars and we don't want to draw anymore
        return;
    }
    var lineWidth = DistanceUtils.getDistanceInMeters(model.get('lineWidth'), model.get('lineUnits')) || 1;
    adjustLinePoints(line);
    var turfLine = Turf.lineString(translateFromOpenlayersCoordinates(line.getCoordinates()));
    var bufferedLine = Turf.buffer(turfLine, lineWidth, { units: 'meters' });
    var geometryRepresentation = new ol.geom.MultiLineString(translateToOpenlayersCoordinates(bufferedLine.geometry.coordinates));
    // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
    adjustMultiLinePoints(geometryRepresentation);
    var billboard = new ol.Feature({
        geometry: geometryRepresentation,
    });
    billboard.setId(id);
    var color = model.get('color');
    var iconStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: color ? color : '#914500',
            width: 3,
        }),
    });
    billboard.setStyle(iconStyle);
    var vectorSource = new ol.source.Vector({
        features: [billboard],
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
    });
    vectorLayer.set('id', id);
    var mapRef = map.getMap();
    removeOldDrawing({ map: mapRef, id: id });
    map.getMap().addLayer(vectorLayer);
};
var updatePrimitive = function (_a) {
    var _b;
    var map = _a.map, model = _a.model, id = _a.id;
    var line = modelToLineString(model);
    // Make sure the current model has width and height before drawing
    if (line !== undefined &&
        !((_b = validateGeo('line', JSON.stringify(line.getCoordinates()))) === null || _b === void 0 ? void 0 : _b.error)) {
        drawLine({ map: map, model: model, line: line, id: id });
    }
};
var useListenToLineModel = function (_a) {
    var model = _a.model, map = _a.map;
    var callback = React.useMemo(function () {
        return function () {
            if (model && map) {
                updatePrimitive({ map: map, model: model, id: getIdFromModelForDisplay({ model: model }) });
            }
        };
    }, [model, map]);
    useListenTo(model, 'change:line change:lineWidth change:lineUnits', callback);
    callback();
};
export var OpenlayersLineDisplay = function (_a) {
    var map = _a.map, model = _a.model;
    useListenToLineModel({ map: map, model: model });
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
//# sourceMappingURL=line-display.js.map