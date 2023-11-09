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
import DistanceUtils from '../../../../js/DistanceUtils';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium';
import { validateGeo } from '../../../../react-component/utils/validation';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { useRender } from '../../../hooks/useRender';
import { removeOldDrawing } from './drawing-and-display';
import ShapeUtils from '../../../../js/ShapeUtils';
import { constructSolidLinePrimitive, constructOutlinedLinePrimitive, constructDottedLinePrimitive, } from './line-display';
import { getIdFromModelForDisplay } from '../drawing-and-display';
import * as Turf from '@turf/turf';
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper';
import utility from './utility';
var toDeg = Cesium.Math.toDegrees;
var polygonFillColor = 'rgba(153,102,0,0.2)';
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
var positionsToPolygon = function (positions, ellipsoid) {
    return {
        polygon: positions.map(function (cartPos) {
            var latLon = ellipsoid.cartesianToCartographic(cartPos);
            var lon = toDeg(latLon.longitude);
            var lat = toDeg(latLon.latitude);
            return [
                DistanceUtils.coordinateRound(lon),
                DistanceUtils.coordinateRound(lat),
            ];
        }),
    };
};
var validateAndFixPolygon = function (polygonPoints) {
    var _a;
    if (!polygonPoints || polygonPoints.length < 3) {
        return false;
    }
    if (polygonPoints[0].toString() !==
        polygonPoints[polygonPoints.length - 1].toString()) {
        polygonPoints.push(polygonPoints[0]);
    }
    if ((_a = validateGeo('polygon', JSON.stringify(polygonPoints))) === null || _a === void 0 ? void 0 : _a.error) {
        return false;
    }
    polygonPoints.forEach(function (point) {
        point[0] = DistanceUtils.coordinateRound(point[0]);
        point[1] = DistanceUtils.coordinateRound(point[1]);
    });
    return true;
};
var drawGeometry = function (_a) {
    var model = _a.model, map = _a.map, id = _a.id, setDrawnMagnitude = _a.setDrawnMagnitude, onDraw = _a.onDraw, translation = _a.translation, isInteractive = _a.isInteractive;
    var json = model.toJSON();
    if (!Array.isArray(json.polygon)) {
        map.getMap().scene.requestRender();
        return;
    }
    var isMultiPolygon = ShapeUtils.isArray3D(json.polygon);
    // Create a deep copy since we may modify some of these positions for display purposes
    var polygons = JSON.parse(JSON.stringify(isMultiPolygon ? json.polygon : [json.polygon]));
    var cameraMagnitude = map.getMap().camera.getMagnitude();
    setDrawnMagnitude(cameraMagnitude);
    removeOldDrawing({ map: map, id: id });
    var buffer = DistanceUtils.getDistanceInMeters(json.polygonBufferWidth, model.get('polygonBufferUnits'));
    if (onDraw) {
        polygons.forEach(function (polygonPoints) {
            if (!validateAndFixPolygon(polygonPoints)) {
                return;
            }
            var drawPrimitive = new DrawHelper.PolygonPrimitive(constructSolidLinePrimitive({
                coordinates: polygonPoints,
                model: model,
                id: id,
                color: polygonFillColor,
                buffer: buffer,
            }));
            drawPrimitive.setEditable();
            drawPrimitive.addListener('onEdited', function (event) {
                var polygon = positionsToPolygon(event.positions, map.getMap().scene.globe.ellipsoid);
                onDraw(polygon);
            });
            map.getMap().scene.primitives.add(drawPrimitive);
        });
    }
    else {
        var pc_1 = new Cesium.PolylineCollection();
        pc_1.id = id;
        pc_1.locationId = json.locationId;
        polygons.forEach(function (polygonPoints) {
            var e_1, _a;
            if (!validateAndFixPolygon(polygonPoints)) {
                return;
            }
            if (translation) {
                try {
                    for (var polygonPoints_1 = __values(polygonPoints), polygonPoints_1_1 = polygonPoints_1.next(); !polygonPoints_1_1.done; polygonPoints_1_1 = polygonPoints_1.next()) {
                        var point = polygonPoints_1_1.value;
                        point[0] += translation.longitude;
                        point[1] += translation.latitude;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (polygonPoints_1_1 && !polygonPoints_1_1.done && (_a = polygonPoints_1.return)) _a.call(polygonPoints_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (buffer > 0) {
                var adjustedPolygon = Turf.polygon([polygonPoints]);
                utility.adjustGeoCoords(adjustedPolygon);
                var bufferedPolygonPoints = Turf.buffer(adjustedPolygon, Math.max(buffer, 1), {
                    units: 'meters',
                });
                if (!bufferedPolygonPoints) {
                    return;
                }
                // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
                utility.adjustGeoCoords(bufferedPolygonPoints);
                var bufferedPolygons = bufferedPolygonPoints.geometry.coordinates.map(function (set) { return Turf.polygon([set]); });
                var bufferedPolygon = bufferedPolygons.reduce(function (a, b) { return Turf.union(a, b); }, bufferedPolygons[0]);
                bufferedPolygon === null || bufferedPolygon === void 0 ? void 0 : bufferedPolygon.geometry.coordinates.forEach(function (coords) {
                    return pc_1.add(constructOutlinedLinePrimitive({
                        coordinates: coords,
                        model: model,
                        id: id,
                        isInteractive: isInteractive,
                    }));
                });
                pc_1.add(constructDottedLinePrimitive({
                    coordinates: polygonPoints,
                    model: model,
                    isInteractive: isInteractive,
                }));
            }
            else {
                pc_1.add(constructOutlinedLinePrimitive({
                    coordinates: polygonPoints,
                    model: model,
                    id: id,
                    isInteractive: isInteractive,
                }));
            }
        });
        map.getMap().scene.primitives.add(pc_1);
    }
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
var useListenToLineModel = function (_a) {
    var model = _a.model, map = _a.map, onDraw = _a.onDraw, newPoly = _a.newPoly, translation = _a.translation, isInteractive = _a.isInteractive;
    var _b = __read(useCameraMagnitude({ map: map }), 1), cameraMagnitude = _b[0];
    var _c = __read(React.useState(0), 2), drawnMagnitude = _c[0], setDrawnMagnitude = _c[1];
    var callback = React.useMemo(function () {
        return function () {
            if (map) {
                if (newPoly) {
                    // Clone the model to display the new polygon drawn because we don't
                    // want to update the existing model unless the user clicks Apply.
                    var newModel = model.clone();
                    newModel.set(newPoly);
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
    }, [model, map, newPoly, translation, isInteractive]);
    useListenTo(model, 'change:polygon change:polygonBufferWidth change:polygonBufferUnits', callback);
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
    var map = _a.map, model = _a.model, setNewPoly = _a.setNewPoly, onDraw = _a.onDraw;
    React.useEffect(function () {
        if (map && model) {
            var material = Cesium.Material.fromType('Color', {
                color: Cesium.Color.fromCssColorString(polygonFillColor),
            });
            map.getMap().drawHelper["startDrawingPolygon"]({
                callback: function (positions) {
                    var drawnPolygon = positionsToPolygon(positions, map.getMap().scene.globe.ellipsoid);
                    var polygon = drawnPolygon.polygon;
                    //this shouldn't ever get hit because the draw library should protect against it, but just in case it does, remove the point
                    if (polygon.length > 3 &&
                        polygon[polygon.length - 1][0] === polygon[polygon.length - 2][0] &&
                        polygon[polygon.length - 1][1] === polygon[polygon.length - 2][1]) {
                        polygon.pop();
                    }
                    setNewPoly(drawnPolygon);
                    onDraw(drawnPolygon);
                },
                appearance: new Cesium.MaterialAppearance({
                    material: material,
                }),
                material: material,
            });
        }
    }, [map, model]);
};
export var CesiumPolygonDisplay = function (_a) {
    var map = _a.map, model = _a.model, onDraw = _a.onDraw, translation = _a.translation, isInteractive = _a.isInteractive;
    // Use state to store the polygon drawn by the user before they click Apply or Cancel.
    // When the user clicks Draw, they are allowed to edit the existing polygon (if it
    // exists), or draw a new polygon. If they draw a new polygon, save it to state then show
    // it instead of the draw model because we don't want to update the draw model
    // unless the user clicks Apply.
    var _b = __read(React.useState(null), 2), newPoly = _b[0], setNewPoly = _b[1];
    if (onDraw) {
        useStartMapDrawing({ map: map, model: model, setNewPoly: setNewPoly, onDraw: onDraw });
    }
    useListenToLineModel({
        map: map,
        model: model,
        newPoly: newPoly,
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
//# sourceMappingURL=polygon-display.js.map