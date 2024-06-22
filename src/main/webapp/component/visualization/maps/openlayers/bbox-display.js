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
import ol from 'openlayers';
import _ from 'underscore';
import { validateGeo } from '../../../../react-component/utils/validation';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { removeOldDrawing } from './drawing-and-display';
import { getIdFromModelForDisplay } from '../drawing-and-display';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
import { contrastingColor } from '../../../../react-component/location/location-color-selector';
var modelToRectangle = function (model) {
    var _a;
    //ensure that the values are numeric
    //so that the openlayer projections
    //do not fail
    var north = parseFloat(model.get('mapNorth'));
    var south = parseFloat(model.get('mapSouth'));
    var east = parseFloat(model.get('mapEast'));
    var west = parseFloat(model.get('mapWest'));
    if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
        // this.destroyPrimitive()
        return;
    }
    // If south is greater than north,
    // remove shape from map
    if (south > north) {
        // this.destroyPrimitive()
        return;
    }
    if ((_a = validateGeo('polygon', JSON.stringify([
        [west, north],
        [east, north],
        [west, south],
        [east, south],
        [west, north],
    ]))) === null || _a === void 0 ? void 0 : _a.error) {
        return;
    }
    // If we are crossing the date line, we must go outside [-180, 180]
    // for openlayers to draw correctly. This means we can't draw boxes
    // that encompass more than half the world. This actually matches
    // how the backend searches anyway.
    if (east - west < -180) {
        east += 360;
    }
    else if (east - west > 180) {
        west += 360;
    }
    var northWest = ol.proj.transform([west, north], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var northEast = ol.proj.transform([east, north], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var southWest = ol.proj.transform([west, south], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var southEast = ol.proj.transform([east, south], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var coords = [];
    coords.push(northWest);
    coords.push(northEast);
    coords.push(southEast);
    coords.push(southWest);
    coords.push(northWest);
    var rectangle = new ol.geom.LineString(coords);
    return rectangle;
};
export var drawBbox = function (_a) {
    var map = _a.map, model = _a.model, rectangle = _a.rectangle, id = _a.id, isInteractive = _a.isInteractive, translation = _a.translation;
    if (!rectangle) {
        // handles case where model changes to empty vars and we don't want to draw anymore
        return;
    }
    if (translation) {
        rectangle.translate(translation.longitude, translation.latitude);
    }
    var billboard = new ol.Feature({
        geometry: rectangle,
    });
    billboard.setId(id);
    billboard.set('locationId', model.get('locationId'));
    var color = model.get('color');
    var iconStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: isInteractive ? contrastingColor : color ? color : '#914500',
            width: isInteractive ? 6 : 4,
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
    mapRef.addLayer(vectorLayer);
};
var updatePrimitive = function (_a) {
    var map = _a.map, model = _a.model, id = _a.id, isInteractive = _a.isInteractive, translation = _a.translation;
    var rectangle = modelToRectangle(model);
    // make sure the current model has width and height before drawing
    if (rectangle &&
        !_.isUndefined(rectangle) &&
        model.get('north') !== model.get('south') &&
        model.get('east') !== model.get('west')) {
        drawBbox({ rectangle: rectangle, map: map, model: model, id: id, isInteractive: isInteractive, translation: translation });
        //only call this if the mouse button isn't pressed, if we try to draw the border while someone is dragging
        //the filled in shape won't show up
        // if (!this.buttonPressed) {
        //   drawBorderedRectangle(rectangle)
        // }
    }
};
var useListenToBboxModel = function (_a) {
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
    useListenTo(model, 'change:mapNorth change:mapSouth change:mapEast change:mapWest', callback);
    callback();
};
export var OpenlayersBboxDisplay = function (_a) {
    var map = _a.map, model = _a.model, isInteractive = _a.isInteractive, translation = _a.translation;
    useListenToBboxModel({ map: map, model: model, isInteractive: isInteractive, translation: translation });
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
//# sourceMappingURL=bbox-display.js.map