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
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { removeOldDrawing } from './drawing-and-display';
import DistanceUtils from '../../../../js/DistanceUtils';
import { getIdFromModelForDisplay } from '../drawing-and-display';
import * as Turf from '@turf/turf';
import TurfCircle from '@turf/circle';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
import { contrastingColor } from '../../../../react-component/location/location-color-selector';
export function translateFromOpenlayersCoordinate(coord) {
    return ol.proj.transform([Number(coord[0]), Number(coord[1])], StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
}
function translateToOpenlayersCoordinate(coord) {
    return ol.proj.transform([Number(coord[0]), Number(coord[1])], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
}
function translateToOpenlayersCoordinates(coords) {
    var coordinates = [];
    coords.forEach(function (item) {
        coordinates.push(translateToOpenlayersCoordinate(item));
    });
    return coordinates;
}
var modelToCircle = function (_a) {
    var model = _a.model, map = _a.map;
    if (model.get('lon') === undefined || model.get('lat') === undefined) {
        return undefined;
    }
    var rectangle = new ol.geom.Circle(translateToOpenlayersCoordinate([model.get('lon'), model.get('lat')]), DistanceUtils.getDistanceInMeters(model.get('radius'), model.get('radiusUnits')) / map.getMap().getView().getProjection().getMetersPerUnit());
    return rectangle;
};
export var drawCircle = function (_a) {
    var map = _a.map, model = _a.model, rectangle = _a.rectangle, id = _a.id, isInteractive = _a.isInteractive, translation = _a.translation;
    if (!rectangle) {
        // handles case where model changes to empty vars and we don't want to draw anymore
        return;
    }
    if (translation) {
        rectangle.translate(translation.longitude, translation.latitude);
    }
    var point = Turf.point(translateFromOpenlayersCoordinate(rectangle.getCenter()));
    var turfCircle = TurfCircle(point, rectangle.getRadius() *
        map.getMap().getView().getProjection().getMetersPerUnit(), { steps: 64, units: 'meters' });
    var geometryRepresentation = new ol.geom.LineString(translateToOpenlayersCoordinates(turfCircle.geometry.coordinates[0]));
    var billboard = new ol.Feature({
        geometry: geometryRepresentation,
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
    var circle = modelToCircle({ model: model, map: map });
    // make sure the current model has width and height before drawing
    if (circle && !_.isUndefined(circle)) {
        drawCircle({
            model: model,
            rectangle: circle,
            map: map,
            id: id,
            isInteractive: isInteractive,
            translation: translation,
        });
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
    useListenTo(model, 'change:lat change:lon change:radius', callback);
    callback();
};
export var OpenlayersCircleDisplay = function (_a) {
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
//# sourceMappingURL=circle-display.js.map