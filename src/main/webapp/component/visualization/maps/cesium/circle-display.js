import { __read } from "tslib";
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
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium';
import _ from 'underscore';
import * as Turf from '@turf/turf';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { useRender } from '../../../hooks/useRender';
import { removeOldDrawing } from './drawing-and-display';
import { getIdFromModelForDisplay } from '../drawing-and-display';
import TurfCircle from '@turf/circle';
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper';
import { contrastingColor } from '../../../../react-component/location/location-color-selector';
var toDeg = Cesium.Math.toDegrees;
var CAMERA_MAGNITUDE_THRESHOLD = 8000000;
var getCurrentMagnitudeFromMap = function (_a) {
    var map = _a.map;
    return map.getMap().camera.getMagnitude();
};
var needsRedraw = function (_a) {
    var map = _a.map, drawnMagnitude = _a.drawnMagnitude;
    var currentMagnitude = getCurrentMagnitudeFromMap({ map: map });
    if (currentMagnitude < CAMERA_MAGNITUDE_THRESHOLD &&
        drawnMagnitude > CAMERA_MAGNITUDE_THRESHOLD) {
        return true;
    }
    if (currentMagnitude > CAMERA_MAGNITUDE_THRESHOLD &&
        drawnMagnitude < CAMERA_MAGNITUDE_THRESHOLD) {
        return true;
    }
    return false;
};
var defaultAttrs = ['lat', 'lon', 'radius'];
var isModelReset = function (_a) {
    var modelProp = _a.modelProp;
    if (_.every(defaultAttrs, function (val) { return _.isUndefined(modelProp[val]); }) ||
        _.isEmpty(modelProp)) {
        return true;
    }
    return false;
};
var cartesian3ToCircle = function (center, radius, ellipsoid) {
    var latLon = ellipsoid.cartesianToCartographic(center);
    var lon = toDeg(latLon.longitude);
    var lat = toDeg(latLon.latitude);
    var radiusUnits = 'meters';
    if (radius >= 1000) {
        radius /= 1000;
        radiusUnits = 'kilometers';
    }
    return {
        lon: DistanceUtils.coordinateRound(lon),
        lat: DistanceUtils.coordinateRound(lat),
        radius: radius,
        radiusUnits: radiusUnits,
    };
};
var drawGeometry = function (_a) {
    // if model has been reset
    var model = _a.model, map = _a.map, id = _a.id, onDraw = _a.onDraw, translation = _a.translation, isInteractive = _a.isInteractive;
    var modelProp = model.toJSON();
    if (isModelReset({ modelProp: modelProp })) {
        map.getMap().scene.requestRender();
        return;
    }
    modelProp.lat = parseFloat(modelProp.lat);
    modelProp.lon = parseFloat(modelProp.lon);
    if (Number.isNaN(modelProp.lat) || Number.isNaN(modelProp.lon)) {
        map.getMap().scene.requestRender();
        return;
    }
    if (translation) {
        modelProp.lon += translation.longitude;
        modelProp.lat += translation.latitude;
    }
    removeOldDrawing({ map: map, id: id });
    var primitive;
    if (onDraw) {
        primitive = new DrawHelper.CirclePrimitive({
            center: Cesium.Cartesian3.fromDegrees(modelProp.lon, modelProp.lat),
            radius: DistanceUtils.getDistanceInMeters(modelProp.radius, modelProp.radiusUnits),
            height: 0,
            id: id,
            material: Cesium.Material.fromType('Color', {
                color: Cesium.Color.fromAlpha(contrastingColor, 0.2),
            }),
        });
        primitive.setEditable();
        primitive.addListener('onEdited', function (event) {
            var circle = cartesian3ToCircle(event.center, event.radius, map.getMap().scene.globe.ellipsoid);
            onDraw(circle);
        });
    }
    else {
        var color = model.get('color');
        var centerPt = Turf.point([modelProp.lon, modelProp.lat]);
        var circleToCheck = TurfCircle(centerPt, DistanceUtils.getDistanceInMeters(modelProp.radius, modelProp.radiusUnits), { units: 'meters', steps: 64 });
        primitive = new Cesium.PolylineCollection();
        primitive.add({
            width: isInteractive ? 12 : 8,
            material: Cesium.Material.fromType('PolylineOutline', {
                color: isInteractive
                    ? Cesium.Color.fromCssColorString(contrastingColor)
                    : color
                        ? Cesium.Color.fromCssColorString(color)
                        : Cesium.Color.KHAKI,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: isInteractive ? 6 : 4,
            }),
            id: 'userDrawing',
            positions: Cesium.Cartesian3.fromDegreesArray(_.flatten(circleToCheck.geometry.coordinates)),
        });
    }
    primitive.id = id;
    primitive.locationId = modelProp.locationId;
    map.getMap().scene.primitives.add(primitive);
    map.getMap().scene.requestRender();
};
var useCameraMagnitude = function (_a) {
    var map = _a.map;
    var _b = __read(React.useState(0), 2), cameraMagnitude = _b[0], setCameraMagnitude = _b[1];
    var _c = __read(React.useState(false), 2), isMoving = _c[0], setIsMoving = _c[1];
    var render = useRender();
    React.useEffect(function () {
        var startListener = function () { return setIsMoving(true); };
        var endListener = function () { return setIsMoving(false); };
        map === null || map === void 0 ? void 0 : map.getMap().scene.camera.moveStart.addEventListener(startListener);
        map === null || map === void 0 ? void 0 : map.getMap().scene.camera.moveEnd.addEventListener(endListener);
        return function () {
            map === null || map === void 0 ? void 0 : map.getMap().scene.camera.moveStart.removeEventListener(startListener);
            map === null || map === void 0 ? void 0 : map.getMap().scene.camera.moveEnd.removeEventListener(endListener);
        };
    }, [map]);
    React.useEffect(function () {
        if (isMoving) {
            var animationId_1 = window.requestAnimationFrame(function () {
                setCameraMagnitude(getCurrentMagnitudeFromMap({ map: map }));
            });
            return function () {
                window.cancelAnimationFrame(animationId_1);
            };
        }
        return function () { };
    }, [isMoving, render]);
    return [cameraMagnitude, setCameraMagnitude];
};
var useListenToModel = function (_a) {
    var model = _a.model, map = _a.map, newCircle = _a.newCircle, onDraw = _a.onDraw, translation = _a.translation, isInteractive = _a.isInteractive;
    var _b = __read(useCameraMagnitude({ map: map }), 1), cameraMagnitude = _b[0];
    var _c = __read(React.useState(0), 2), drawnMagnitude = _c[0], setDrawnMagnitude = _c[1];
    var callback = React.useMemo(function () {
        return function () {
            if (map) {
                if (newCircle) {
                    // Clone the model to display the new circle drawn because we don't
                    // want to update the existing model unless the user clicks Apply.
                    var newModel = model.clone();
                    newModel.set(newCircle);
                    drawGeometry({
                        map: map,
                        model: newModel,
                        id: getIdFromModelForDisplay({ model: model }),
                        setDrawnMagnitude: setDrawnMagnitude,
                        onDraw: onDraw,
                    });
                }
                else if (model) {
                    drawGeometry({
                        map: map,
                        model: model,
                        id: getIdFromModelForDisplay({ model: model }),
                        setDrawnMagnitude: setDrawnMagnitude,
                        onDraw: onDraw,
                        translation: translation,
                        isInteractive: isInteractive,
                    });
                }
            }
        };
    }, [model, map, newCircle, translation, isInteractive]);
    useListenTo(model, 'change:lat change:lon change:radius', callback);
    React.useEffect(function () {
        if (map && needsRedraw({ map: map, drawnMagnitude: drawnMagnitude })) {
            callback();
        }
    }, [cameraMagnitude, drawnMagnitude, callback, map]);
    React.useEffect(function () {
        callback();
    }, [callback]);
};
var useStartMapDrawing = function (_a) {
    var map = _a.map, model = _a.model, setNewCircle = _a.setNewCircle, onDraw = _a.onDraw;
    React.useEffect(function () {
        if (map && model) {
            map.getMap().drawHelper["startDrawingCircle"]({
                callback: function (center, radius) {
                    var circle = cartesian3ToCircle(center, radius, map.getMap().scene.globe.ellipsoid);
                    setNewCircle(circle);
                    onDraw(circle);
                },
                material: Cesium.Material.fromType('Color', {
                    color: Cesium.Color.fromAlpha(contrastingColor, 0.2),
                }),
            });
        }
    }, [map, model]);
};
export var CesiumCircleDisplay = function (_a) {
    var map = _a.map, model = _a.model, onDraw = _a.onDraw, translation = _a.translation, isInteractive = _a.isInteractive;
    // Use state to store the circle drawn by the user before they click Apply or Cancel.
    // When the user clicks Draw, they are allowed to edit the existing circle (if it
    // exists), or draw a new circle. If they draw a new circle, save it to state then show
    // it instead of the draw model because we don't want to update the draw model
    // unless the user clicks Apply.
    var _b = __read(React.useState(null), 2), newCircle = _b[0], setNewCircle = _b[1];
    if (onDraw) {
        useStartMapDrawing({ map: map, model: model, setNewCircle: setNewCircle, onDraw: onDraw });
    }
    useListenToModel({
        map: map,
        model: model,
        newCircle: newCircle,
        onDraw: onDraw,
        translation: translation,
        isInteractive: isInteractive,
    });
    React.useEffect(function () {
        return function () {
            if (model && map) {
                removeOldDrawing({ map: map, id: getIdFromModelForDisplay({ model: model }) });
                map.getMap().drawHelper.stopDrawing();
            }
        };
    }, [map, model]);
    return React.createElement(React.Fragment, null);
};
//# sourceMappingURL=circle-display.js.map