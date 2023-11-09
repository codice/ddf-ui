import { __read, __values } from "tslib";
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
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium';
import _ from 'underscore';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { useRender } from '../../../hooks/useRender';
import { removeOldDrawing } from './drawing-and-display';
import { getIdFromModelForDisplay } from '../drawing-and-display';
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper';
import DistanceUtils from '../../../../js/DistanceUtils';
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
var modelToRectangle = function (_a) {
    var model = _a.model;
    var toRad = Cesium.Math.toRadians;
    var obj = model.toJSON();
    _.each(obj, function (val, key) {
        obj[key] = toRad(val);
    });
    var rectangle = new Cesium.Rectangle();
    if (obj.north === undefined ||
        isNaN(obj.north) ||
        obj.south === undefined ||
        isNaN(obj.south) ||
        obj.east === undefined ||
        isNaN(obj.east) ||
        obj.west === undefined ||
        isNaN(obj.west)) {
        return null;
    }
    rectangle.north = obj.mapNorth;
    rectangle.south = obj.mapSouth;
    rectangle.east = obj.mapEast;
    rectangle.west = obj.mapWest;
    return rectangle;
};
var rectangleToBbox = function (rectangle) {
    var north = toDeg(rectangle.north);
    var south = toDeg(rectangle.south);
    var east = toDeg(rectangle.east);
    var west = toDeg(rectangle.west);
    return {
        north: DistanceUtils.coordinateRound(north),
        south: DistanceUtils.coordinateRound(south),
        east: DistanceUtils.coordinateRound(east),
        west: DistanceUtils.coordinateRound(west),
    };
};
var drawGeometry = function (_a) {
    var e_1, _b;
    var model = _a.model, map = _a.map, id = _a.id, onDraw = _a.onDraw, translation = _a.translation, isInteractive = _a.isInteractive;
    var rectangle = modelToRectangle({ model: model });
    if (!rectangle ||
        [rectangle.north, rectangle.south, rectangle.west, rectangle.east].some(function (coordinate) { return isNaN(coordinate); }) ||
        rectangle.north <= rectangle.south ||
        rectangle.east === rectangle.west) {
        return;
    }
    var coordinates = [
        [rectangle.east, rectangle.north],
        [rectangle.west, rectangle.north],
        [rectangle.west, rectangle.south],
        [rectangle.east, rectangle.south],
        [rectangle.east, rectangle.north],
    ];
    if (translation) {
        var longitudeRadians = Cesium.Math.toRadians(translation.longitude);
        var latitudeRadians = Cesium.Math.toRadians(translation.latitude);
        try {
            for (var coordinates_1 = __values(coordinates), coordinates_1_1 = coordinates_1.next(); !coordinates_1_1.done; coordinates_1_1 = coordinates_1.next()) {
                var coord = coordinates_1_1.value;
                coord[0] += longitudeRadians;
                coord[1] += latitudeRadians;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (coordinates_1_1 && !coordinates_1_1.done && (_b = coordinates_1.return)) _b.call(coordinates_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    removeOldDrawing({ map: map, id: id });
    var primitive;
    if (onDraw) {
        primitive = new DrawHelper.ExtentPrimitive({
            extent: rectangle,
            height: 0,
            id: id,
            material: Cesium.Material.fromType('Color', {
                color: Cesium.Color.fromAlpha(contrastingColor, 0.2),
            }),
        });
        primitive.setEditable();
        primitive.addListener('onEdited', function (event) {
            var rectangle = event.extent;
            var bbox = rectangleToBbox(rectangle);
            onDraw(bbox);
        });
    }
    else {
        var color = model.get('color');
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
            positions: Cesium.Cartesian3.fromRadiansArray(_.flatten(coordinates)),
        });
    }
    primitive.id = id;
    primitive.locationId = model.attributes.locationId;
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
    var model = _a.model, map = _a.map, onDraw = _a.onDraw, newBbox = _a.newBbox, translation = _a.translation, isInteractive = _a.isInteractive;
    var _b = __read(useCameraMagnitude({ map: map }), 1), cameraMagnitude = _b[0];
    var _c = __read(React.useState(0), 2), drawnMagnitude = _c[0], setDrawnMagnitude = _c[1];
    var callback = React.useMemo(function () {
        return function () {
            if (map) {
                if (newBbox) {
                    // Clone the model to display the new bbox drawn because we don't
                    // want to update the existing model unless the user clicks Apply.
                    var newModel = model.clone();
                    newModel.set(newBbox);
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
    }, [model, map, newBbox, translation, isInteractive]);
    useListenTo(model, 'change:mapNorth change:mapSouth change:mapEast change:mapWest', callback);
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
    var map = _a.map, model = _a.model, setNewBbox = _a.setNewBbox, onDraw = _a.onDraw;
    React.useEffect(function () {
        if (map && model) {
            map.getMap().drawHelper["startDrawingExtent"]({
                callback: function (extent) {
                    var bbox = rectangleToBbox(extent);
                    setNewBbox(bbox);
                    onDraw(bbox);
                },
                material: Cesium.Material.fromType('Color', {
                    color: Cesium.Color.fromAlpha(contrastingColor, 0.2),
                }),
            });
        }
    }, [map, model]);
};
export var CesiumBboxDisplay = function (_a) {
    var map = _a.map, model = _a.model, onDraw = _a.onDraw, translation = _a.translation, isInteractive = _a.isInteractive;
    // Use state to store the bbox drawn by the user before they click Apply or Cancel.
    // When the user clicks Draw, they are allowed to edit the existing bbox (if it
    // exists), or draw a new bbox. If they draw a new bbox, save it to state then show
    // it instead of the draw model because we don't want to update the draw model
    // unless the user clicks Apply.
    var _b = __read(React.useState(null), 2), newBbox = _b[0], setNewBbox = _b[1];
    if (onDraw) {
        useStartMapDrawing({ map: map, model: model, onDraw: onDraw, setNewBbox: setNewBbox });
    }
    useListenToModel({ map: map, model: model, onDraw: onDraw, newBbox: newBbox, translation: translation, isInteractive: isInteractive });
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
//# sourceMappingURL=bbox-display.js.map