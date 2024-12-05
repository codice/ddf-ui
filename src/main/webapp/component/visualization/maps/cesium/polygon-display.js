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
import { removeOldDrawing, removeOrLockOldDrawing } from './drawing-and-display';
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
    removeOrLockOldDrawing(Boolean(isInteractive), id, map, model);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1kaXNwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvY2VzaXVtL3BvbHlnb24tZGlzcGxheS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxhQUFhLE1BQU0sOEJBQThCLENBQUE7QUFDeEQsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUMxRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDMUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQ2hGLE9BQU8sVUFBVSxNQUFNLDJCQUEyQixDQUFBO0FBQ2xELE9BQU8sRUFDTCwyQkFBMkIsRUFDM0IsOEJBQThCLEVBQzlCLDRCQUE0QixHQUM3QixNQUFNLGdCQUFnQixDQUFBO0FBQ3ZCLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2pFLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFBO0FBR2xDLE9BQU8sVUFBVSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3JFLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUUvQixJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQTtBQUVuQyxJQUFNLGdCQUFnQixHQUFHLHFCQUFxQixDQUFBO0FBRTlDLElBQU0sMEJBQTBCLEdBQUcsT0FBTyxDQUFBO0FBRTFDLElBQU0sMEJBQTBCLEdBQUcs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QU0sUUFBQTtRQUNOLFdBQVcsYUFBQTtRQUNYLGFBQWEsZUFBQTtLQUNkLENBQUMsQ0FBQTtJQUNGLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxPQUFPO1lBQ0wsSUFBSSxLQUFLLElBQUksR0FBRyxFQUFFO2dCQUNoQixnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsS0FBQSxFQUFFLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQ2xFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUE7YUFDdEM7UUFDSCxDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNoQixPQUFPLHlDQUFLLENBQUE7QUFDZCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBEaXN0YW5jZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2pzL0Rpc3RhbmNlVXRpbHMnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjZXNpLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBDZXNpdW0gZnJvbSAnY2VzaXVtL0J1aWxkL0Nlc2l1bS9DZXNpdW0nXG5pbXBvcnQgeyB2YWxpZGF0ZUdlbyB9IGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy92YWxpZGF0aW9uJ1xuaW1wb3J0IHsgdXNlTGlzdGVuVG8gfSBmcm9tICcuLi8uLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IHVzZVJlbmRlciB9IGZyb20gJy4uLy4uLy4uL2hvb2tzL3VzZVJlbmRlcidcbmltcG9ydCB7IHJlbW92ZU9sZERyYXdpbmcsIHJlbW92ZU9yTG9ja09sZERyYXdpbmcgfSBmcm9tICcuL2RyYXdpbmctYW5kLWRpc3BsYXknXG5pbXBvcnQgU2hhcGVVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9qcy9TaGFwZVV0aWxzJ1xuaW1wb3J0IHtcbiAgY29uc3RydWN0U29saWRMaW5lUHJpbWl0aXZlLFxuICBjb25zdHJ1Y3RPdXRsaW5lZExpbmVQcmltaXRpdmUsXG4gIGNvbnN0cnVjdERvdHRlZExpbmVQcmltaXRpdmUsXG59IGZyb20gJy4vbGluZS1kaXNwbGF5J1xuaW1wb3J0IHsgZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5IH0gZnJvbSAnLi4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCAqIGFzIFR1cmYgZnJvbSAnQHR1cmYvdHVyZidcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnQHR1cmYvdHVyZidcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgRHJhd0hlbHBlciBmcm9tICcuLi8uLi8uLi8uLi9saWIvY2VzaXVtLWRyYXdoZWxwZXIvRHJhd0hlbHBlcidcbmltcG9ydCB1dGlsaXR5IGZyb20gJy4vdXRpbGl0eSdcbmltcG9ydCB7IFRyYW5zbGF0aW9uIH0gZnJvbSAnLi4vaW50ZXJhY3Rpb25zLnByb3ZpZGVyJ1xuY29uc3QgdG9EZWcgPSBDZXNpdW0uTWF0aC50b0RlZ3JlZXNcblxuY29uc3QgcG9seWdvbkZpbGxDb2xvciA9ICdyZ2JhKDE1MywxMDIsMCwwLjIpJ1xuXG5jb25zdCBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRCA9IDgwMDAwMDBcblxuY29uc3QgZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAgPSAoeyBtYXAgfTogeyBtYXA6IGFueSB9KSA9PiB7XG4gIHJldHVybiBtYXAuZ2V0TWFwKCkuY2FtZXJhLmdldE1hZ25pdHVkZSgpXG59XG5cbmNvbnN0IG5lZWRzUmVkcmF3ID0gKHtcbiAgbWFwLFxuICBkcmF3bk1hZ25pdHVkZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgZHJhd25NYWduaXR1ZGU6IGFueVxufSkgPT4ge1xuICBjb25zdCBjdXJyZW50TWFnbml0dWRlID0gZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAoeyBtYXAgfSlcblxuICBpZiAoXG4gICAgY3VycmVudE1hZ25pdHVkZSA8IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEICYmXG4gICAgZHJhd25NYWduaXR1ZGUgPiBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRFxuICApIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGlmIChcbiAgICBjdXJyZW50TWFnbml0dWRlID4gQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTEQgJiZcbiAgICBkcmF3bk1hZ25pdHVkZSA8IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEXG4gICkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxudHlwZSBQb2x5Z29uID0ge1xuICBwb2x5Z29uOiBbbnVtYmVyLCBudW1iZXJdW11cbn1cblxuY29uc3QgcG9zaXRpb25zVG9Qb2x5Z29uID0gKFxuICBwb3NpdGlvbnM6IENlc2l1bS5DYXJ0ZXNpYW4zW10sXG4gIGVsbGlwc29pZDogQ2VzaXVtLkVsbGlwc29pZFxuKTogUG9seWdvbiA9PiB7XG4gIHJldHVybiB7XG4gICAgcG9seWdvbjogcG9zaXRpb25zLm1hcCgoY2FydFBvcykgPT4ge1xuICAgICAgY29uc3QgbGF0TG9uID0gZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKGNhcnRQb3MpXG4gICAgICBjb25zdCBsb24gPSB0b0RlZyhsYXRMb24ubG9uZ2l0dWRlKVxuICAgICAgY29uc3QgbGF0ID0gdG9EZWcobGF0TG9uLmxhdGl0dWRlKVxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQobG9uKSxcbiAgICAgICAgRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQobGF0KSxcbiAgICAgIF1cbiAgICB9KSxcbiAgfVxufVxuXG5jb25zdCB2YWxpZGF0ZUFuZEZpeFBvbHlnb24gPSAocG9seWdvblBvaW50czogUG9zaXRpb25bXSk6IGJvb2xlYW4gPT4ge1xuICBpZiAoIXBvbHlnb25Qb2ludHMgfHwgcG9seWdvblBvaW50cy5sZW5ndGggPCAzKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgaWYgKFxuICAgIHBvbHlnb25Qb2ludHNbMF0udG9TdHJpbmcoKSAhPT1cbiAgICBwb2x5Z29uUG9pbnRzW3BvbHlnb25Qb2ludHMubGVuZ3RoIC0gMV0udG9TdHJpbmcoKVxuICApIHtcbiAgICBwb2x5Z29uUG9pbnRzLnB1c2gocG9seWdvblBvaW50c1swXSlcbiAgfVxuICBpZiAodmFsaWRhdGVHZW8oJ3BvbHlnb24nLCBKU09OLnN0cmluZ2lmeShwb2x5Z29uUG9pbnRzKSk/LmVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcG9seWdvblBvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgcG9pbnRbMF0gPSBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChwb2ludFswXSlcbiAgICBwb2ludFsxXSA9IERpc3RhbmNlVXRpbHMuY29vcmRpbmF0ZVJvdW5kKHBvaW50WzFdKVxuICB9KVxuICByZXR1cm4gdHJ1ZVxufVxuXG5jb25zdCBkcmF3R2VvbWV0cnkgPSAoe1xuICBtb2RlbCxcbiAgbWFwLFxuICBpZCxcbiAgc2V0RHJhd25NYWduaXR1ZGUsXG4gIG9uRHJhdyxcbiAgdHJhbnNsYXRpb24sXG4gIGlzSW50ZXJhY3RpdmUsXG59OiB7XG4gIG1vZGVsOiBhbnlcbiAgbWFwOiBhbnlcbiAgaWQ6IGFueVxuICBzZXREcmF3bk1hZ25pdHVkZTogKG51bWJlcjogYW55KSA9PiB2b2lkXG4gIG9uRHJhdz86IChkcmF3aW5nTG9jYXRpb246IFBvbHlnb24pID0+IHZvaWRcbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhbiAvLyBub3RlOiAnaW50ZXJhY3RpdmUnIGlzIGRpZmZlcmVudCBmcm9tIGRyYXdpbmdcbn0pID0+IHtcbiAgY29uc3QganNvbiA9IG1vZGVsLnRvSlNPTigpXG4gIGlmICghQXJyYXkuaXNBcnJheShqc29uLnBvbHlnb24pKSB7XG4gICAgbWFwLmdldE1hcCgpLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGlzTXVsdGlQb2x5Z29uID0gU2hhcGVVdGlscy5pc0FycmF5M0QoanNvbi5wb2x5Z29uKVxuICAvLyBDcmVhdGUgYSBkZWVwIGNvcHkgc2luY2Ugd2UgbWF5IG1vZGlmeSBzb21lIG9mIHRoZXNlIHBvc2l0aW9ucyBmb3IgZGlzcGxheSBwdXJwb3Nlc1xuICBjb25zdCBwb2x5Z29uczogUG9zaXRpb25bXVtdID0gSlNPTi5wYXJzZShcbiAgICBKU09OLnN0cmluZ2lmeShpc011bHRpUG9seWdvbiA/IGpzb24ucG9seWdvbiA6IFtqc29uLnBvbHlnb25dKVxuICApXG5cbiAgY29uc3QgY2FtZXJhTWFnbml0dWRlID0gbWFwLmdldE1hcCgpLmNhbWVyYS5nZXRNYWduaXR1ZGUoKVxuICBzZXREcmF3bk1hZ25pdHVkZShjYW1lcmFNYWduaXR1ZGUpXG5cbiAgcmVtb3ZlT3JMb2NrT2xkRHJhd2luZyhCb29sZWFuKGlzSW50ZXJhY3RpdmUpLCBpZCwgbWFwLCBtb2RlbClcblxuICBjb25zdCBidWZmZXIgPSBEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlSW5NZXRlcnMoXG4gICAganNvbi5wb2x5Z29uQnVmZmVyV2lkdGgsXG4gICAgbW9kZWwuZ2V0KCdwb2x5Z29uQnVmZmVyVW5pdHMnKVxuICApXG5cbiAgaWYgKG9uRHJhdykge1xuICAgIHBvbHlnb25zLmZvckVhY2goKHBvbHlnb25Qb2ludHMpID0+IHtcbiAgICAgIGlmICghdmFsaWRhdGVBbmRGaXhQb2x5Z29uKHBvbHlnb25Qb2ludHMpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBkcmF3UHJpbWl0aXZlID0gbmV3IChEcmF3SGVscGVyLlBvbHlnb25QcmltaXRpdmUgYXMgYW55KShcbiAgICAgICAgY29uc3RydWN0U29saWRMaW5lUHJpbWl0aXZlKHtcbiAgICAgICAgICBjb29yZGluYXRlczogcG9seWdvblBvaW50cyxcbiAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICBpZCxcbiAgICAgICAgICBjb2xvcjogcG9seWdvbkZpbGxDb2xvcixcbiAgICAgICAgICBidWZmZXIsXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBkcmF3UHJpbWl0aXZlLnNldEVkaXRhYmxlKClcbiAgICAgIGRyYXdQcmltaXRpdmUuYWRkTGlzdGVuZXIoJ29uRWRpdGVkJywgZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgcG9seWdvbiA9IHBvc2l0aW9uc1RvUG9seWdvbihcbiAgICAgICAgICBldmVudC5wb3NpdGlvbnMsXG4gICAgICAgICAgbWFwLmdldE1hcCgpLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIG9uRHJhdyhwb2x5Z29uKVxuICAgICAgfSlcbiAgICAgIG1hcC5nZXRNYXAoKS5zY2VuZS5wcmltaXRpdmVzLmFkZChkcmF3UHJpbWl0aXZlKVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcGMgPSBuZXcgQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbigpXG4gICAgcGMuaWQgPSBpZFxuICAgIHBjLmxvY2F0aW9uSWQgPSBqc29uLmxvY2F0aW9uSWRcbiAgICBwb2x5Z29ucy5mb3JFYWNoKChwb2x5Z29uUG9pbnRzKSA9PiB7XG4gICAgICBpZiAoIXZhbGlkYXRlQW5kRml4UG9seWdvbihwb2x5Z29uUG9pbnRzKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgIGZvciAoY29uc3QgcG9pbnQgb2YgcG9seWdvblBvaW50cykge1xuICAgICAgICAgIHBvaW50WzBdICs9IHRyYW5zbGF0aW9uLmxvbmdpdHVkZVxuICAgICAgICAgIHBvaW50WzFdICs9IHRyYW5zbGF0aW9uLmxhdGl0dWRlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGJ1ZmZlciA+IDApIHtcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRQb2x5Z29uID0gVHVyZi5wb2x5Z29uKFtwb2x5Z29uUG9pbnRzXSlcbiAgICAgICAgdXRpbGl0eS5hZGp1c3RHZW9Db29yZHMoYWRqdXN0ZWRQb2x5Z29uKVxuXG4gICAgICAgIGNvbnN0IGJ1ZmZlcmVkUG9seWdvblBvaW50cyA9IFR1cmYuYnVmZmVyKFxuICAgICAgICAgIGFkanVzdGVkUG9seWdvbixcbiAgICAgICAgICBNYXRoLm1heChidWZmZXIsIDEpLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVuaXRzOiAnbWV0ZXJzJyxcbiAgICAgICAgICB9XG4gICAgICAgIClcblxuICAgICAgICBpZiAoIWJ1ZmZlcmVkUG9seWdvblBvaW50cykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbmVlZCB0byBhZGp1c3QgdGhlIHBvaW50cyBhZ2FpbiBBRlRFUiBidWZmZXJpbmcsIHNpbmNlIGJ1ZmZlcmluZyB1bmRvZXMgdGhlIGFudGltZXJpZGlhbiBhZGp1c3RtZW50c1xuICAgICAgICB1dGlsaXR5LmFkanVzdEdlb0Nvb3JkcyhidWZmZXJlZFBvbHlnb25Qb2ludHMpXG5cbiAgICAgICAgY29uc3QgYnVmZmVyZWRQb2x5Z29ucyA9IGJ1ZmZlcmVkUG9seWdvblBvaW50cy5nZW9tZXRyeS5jb29yZGluYXRlcy5tYXAoXG4gICAgICAgICAgKHNldCkgPT4gVHVyZi5wb2x5Z29uKFtzZXRdKVxuICAgICAgICApXG5cbiAgICAgICAgY29uc3QgYnVmZmVyZWRQb2x5Z29uID0gYnVmZmVyZWRQb2x5Z29ucy5yZWR1Y2UoXG4gICAgICAgICAgKGEsIGIpID0+IFR1cmYudW5pb24oYSwgYiksXG4gICAgICAgICAgYnVmZmVyZWRQb2x5Z29uc1swXVxuICAgICAgICApXG5cbiAgICAgICAgYnVmZmVyZWRQb2x5Z29uPy5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKChjb29yZHM6IGFueSkgPT5cbiAgICAgICAgICBwYy5hZGQoXG4gICAgICAgICAgICBjb25zdHJ1Y3RPdXRsaW5lZExpbmVQcmltaXRpdmUoe1xuICAgICAgICAgICAgICBjb29yZGluYXRlczogY29vcmRzLFxuICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICBwYy5hZGQoXG4gICAgICAgICAgY29uc3RydWN0RG90dGVkTGluZVByaW1pdGl2ZSh7XG4gICAgICAgICAgICBjb29yZGluYXRlczogcG9seWdvblBvaW50cyxcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaXNJbnRlcmFjdGl2ZSxcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYy5hZGQoXG4gICAgICAgICAgY29uc3RydWN0T3V0bGluZWRMaW5lUHJpbWl0aXZlKHtcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBwb2x5Z29uUG9pbnRzLFxuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBpZCxcbiAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucHJpbWl0aXZlcy5hZGQocGMpXG4gIH1cblxuICBtYXAuZ2V0TWFwKCkuc2NlbmUucmVxdWVzdFJlbmRlcigpXG59XG5cbmNvbnN0IHVzZUNhbWVyYU1hZ25pdHVkZSA9ICh7XG4gIG1hcCxcbn06IHtcbiAgbWFwOiBhbnlcbn0pOiBbbnVtYmVyLCBSZWFjdC5EaXNwYXRjaDxSZWFjdC5TZXRTdGF0ZUFjdGlvbjxudW1iZXI+Pl0gPT4ge1xuICBjb25zdCBbY2FtZXJhTWFnbml0dWRlLCBzZXRDYW1lcmFNYWduaXR1ZGVdID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW2lzTW92aW5nLCBzZXRJc01vdmluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgcmVuZGVyID0gdXNlUmVuZGVyKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzdGFydExpc3RlbmVyID0gKCkgPT4gc2V0SXNNb3ZpbmcodHJ1ZSlcbiAgICBjb25zdCBlbmRMaXN0ZW5lciA9ICgpID0+IHNldElzTW92aW5nKGZhbHNlKVxuICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVTdGFydC5hZGRFdmVudExpc3RlbmVyKHN0YXJ0TGlzdGVuZXIpXG4gICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZUVuZC5hZGRFdmVudExpc3RlbmVyKGVuZExpc3RlbmVyKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtYXA/LmdldE1hcCgpLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihzdGFydExpc3RlbmVyKVxuICAgICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZUVuZC5yZW1vdmVFdmVudExpc3RlbmVyKGVuZExpc3RlbmVyKVxuICAgIH1cbiAgfSwgW21hcF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTW92aW5nKSB7XG4gICAgICBjb25zdCBhbmltYXRpb25JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBzZXRDYW1lcmFNYWduaXR1ZGUoZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAoeyBtYXAgfSkpXG4gICAgICB9KVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbklkKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2lzTW92aW5nLCByZW5kZXJdKVxuICByZXR1cm4gW2NhbWVyYU1hZ25pdHVkZSwgc2V0Q2FtZXJhTWFnbml0dWRlXVxufVxuXG5jb25zdCB1c2VMaXN0ZW5Ub0xpbmVNb2RlbCA9ICh7XG4gIG1vZGVsLFxuICBtYXAsXG4gIG9uRHJhdyxcbiAgbmV3UG9seSxcbiAgdHJhbnNsYXRpb24sXG4gIGlzSW50ZXJhY3RpdmUsXG59OiB7XG4gIG1vZGVsOiBhbnlcbiAgbWFwOiBhbnlcbiAgb25EcmF3PzogKGRyYXdpbmdMb2NhdGlvbjogUG9seWdvbikgPT4gdm9pZFxuICBuZXdQb2x5OiBQb2x5Z29uIHwgbnVsbFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBbY2FtZXJhTWFnbml0dWRlXSA9IHVzZUNhbWVyYU1hZ25pdHVkZSh7IG1hcCB9KVxuICBjb25zdCBbZHJhd25NYWduaXR1ZGUsIHNldERyYXduTWFnbml0dWRlXSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IGNhbGxiYWNrID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChtYXApIHtcbiAgICAgICAgaWYgKG5ld1BvbHkpIHtcbiAgICAgICAgICAvLyBDbG9uZSB0aGUgbW9kZWwgdG8gZGlzcGxheSB0aGUgbmV3IHBvbHlnb24gZHJhd24gYmVjYXVzZSB3ZSBkb24ndFxuICAgICAgICAgIC8vIHdhbnQgdG8gdXBkYXRlIHRoZSBleGlzdGluZyBtb2RlbCB1bmxlc3MgdGhlIHVzZXIgY2xpY2tzIEFwcGx5LlxuICAgICAgICAgIGNvbnN0IG5ld01vZGVsID0gbW9kZWwuY2xvbmUoKVxuICAgICAgICAgIG5ld01vZGVsLnNldChuZXdQb2x5KVxuICAgICAgICAgIGRyYXdHZW9tZXRyeSh7XG4gICAgICAgICAgICBtYXAsXG4gICAgICAgICAgICBtb2RlbDogbmV3TW9kZWwsXG4gICAgICAgICAgICBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSksXG4gICAgICAgICAgICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgICAgICAgICAgIG9uRHJhdyxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgZHJhd0dlb21ldHJ5KHtcbiAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pLFxuICAgICAgICAgICAgc2V0RHJhd25NYWduaXR1ZGUsXG4gICAgICAgICAgICBvbkRyYXcsXG4gICAgICAgICAgICB0cmFuc2xhdGlvbixcbiAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21vZGVsLCBtYXAsIG5ld1BvbHksIHRyYW5zbGF0aW9uLCBpc0ludGVyYWN0aXZlXSlcbiAgdXNlTGlzdGVuVG8oXG4gICAgbW9kZWwsXG4gICAgJ2NoYW5nZTpwb2x5Z29uIGNoYW5nZTpwb2x5Z29uQnVmZmVyV2lkdGggY2hhbmdlOnBvbHlnb25CdWZmZXJVbml0cycsXG4gICAgY2FsbGJhY2tcbiAgKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXAgJiYgbmVlZHNSZWRyYXcoeyBtYXAsIGRyYXduTWFnbml0dWRlIH0pKSB7XG4gICAgICBjYWxsYmFjaygpXG4gICAgfVxuICB9LCBbY2FtZXJhTWFnbml0dWRlLCBkcmF3bk1hZ25pdHVkZSwgY2FsbGJhY2ssIG1hcF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY2FsbGJhY2soKVxuICB9LCBbY2FsbGJhY2tdKVxufVxuXG5jb25zdCB1c2VTdGFydE1hcERyYXdpbmcgPSAoe1xuICBtYXAsXG4gIG1vZGVsLFxuICBzZXROZXdQb2x5LFxuICBvbkRyYXcsXG59OiB7XG4gIG1hcDogYW55XG4gIG1vZGVsOiBhbnlcbiAgc2V0TmV3UG9seTogKG5ld1BvbHk6IFBvbHlnb24pID0+IHZvaWRcbiAgb25EcmF3OiAobmV3UG9seTogUG9seWdvbikgPT4gdm9pZFxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXAgJiYgbW9kZWwpIHtcbiAgICAgIGNvbnN0IG1hdGVyaWFsID0gQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdDb2xvcicsIHtcbiAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcocG9seWdvbkZpbGxDb2xvciksXG4gICAgICB9KVxuICAgICAgbWFwLmdldE1hcCgpLmRyYXdIZWxwZXJbYHN0YXJ0RHJhd2luZ1BvbHlnb25gXSh7XG4gICAgICAgIGNhbGxiYWNrOiAocG9zaXRpb25zOiBDZXNpdW0uQ2FydGVzaWFuM1tdKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhd25Qb2x5Z29uID0gcG9zaXRpb25zVG9Qb2x5Z29uKFxuICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgbWFwLmdldE1hcCgpLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICAgIClcbiAgICAgICAgICBjb25zdCBwb2x5Z29uID0gZHJhd25Qb2x5Z29uLnBvbHlnb25cbiAgICAgICAgICAvL3RoaXMgc2hvdWxkbid0IGV2ZXIgZ2V0IGhpdCBiZWNhdXNlIHRoZSBkcmF3IGxpYnJhcnkgc2hvdWxkIHByb3RlY3QgYWdhaW5zdCBpdCwgYnV0IGp1c3QgaW4gY2FzZSBpdCBkb2VzLCByZW1vdmUgdGhlIHBvaW50XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgcG9seWdvbi5sZW5ndGggPiAzICYmXG4gICAgICAgICAgICBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMV1bMF0gPT09IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAyXVswXSAmJlxuICAgICAgICAgICAgcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDFdWzFdID09PSBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMl1bMV1cbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHBvbHlnb24ucG9wKClcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0TmV3UG9seShkcmF3blBvbHlnb24pXG4gICAgICAgICAgb25EcmF3KGRyYXduUG9seWdvbilcbiAgICAgICAgfSxcbiAgICAgICAgYXBwZWFyYW5jZTogbmV3IENlc2l1bS5NYXRlcmlhbEFwcGVhcmFuY2Uoe1xuICAgICAgICAgIG1hdGVyaWFsLFxuICAgICAgICB9KSxcbiAgICAgICAgbWF0ZXJpYWwsXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW21hcCwgbW9kZWxdKVxufVxuXG5leHBvcnQgY29uc3QgQ2VzaXVtUG9seWdvbkRpc3BsYXkgPSAoe1xuICBtYXAsXG4gIG1vZGVsLFxuICBvbkRyYXcsXG4gIHRyYW5zbGF0aW9uLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBtYXA6IGFueVxuICBtb2RlbDogYW55XG4gIG9uRHJhdz86IChuZXdQb2x5OiBQb2x5Z29uKSA9PiB2b2lkXG4gIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb25cbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIC8vIFVzZSBzdGF0ZSB0byBzdG9yZSB0aGUgcG9seWdvbiBkcmF3biBieSB0aGUgdXNlciBiZWZvcmUgdGhleSBjbGljayBBcHBseSBvciBDYW5jZWwuXG4gIC8vIFdoZW4gdGhlIHVzZXIgY2xpY2tzIERyYXcsIHRoZXkgYXJlIGFsbG93ZWQgdG8gZWRpdCB0aGUgZXhpc3RpbmcgcG9seWdvbiAoaWYgaXRcbiAgLy8gZXhpc3RzKSwgb3IgZHJhdyBhIG5ldyBwb2x5Z29uLiBJZiB0aGV5IGRyYXcgYSBuZXcgcG9seWdvbiwgc2F2ZSBpdCB0byBzdGF0ZSB0aGVuIHNob3dcbiAgLy8gaXQgaW5zdGVhZCBvZiB0aGUgZHJhdyBtb2RlbCBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG8gdXBkYXRlIHRoZSBkcmF3IG1vZGVsXG4gIC8vIHVubGVzcyB0aGUgdXNlciBjbGlja3MgQXBwbHkuXG4gIGNvbnN0IFtuZXdQb2x5LCBzZXROZXdQb2x5XSA9IFJlYWN0LnVzZVN0YXRlPFBvbHlnb24gfCBudWxsPihudWxsKVxuICBpZiAob25EcmF3KSB7XG4gICAgdXNlU3RhcnRNYXBEcmF3aW5nKHsgbWFwLCBtb2RlbCwgc2V0TmV3UG9seSwgb25EcmF3IH0pXG4gIH1cbiAgdXNlTGlzdGVuVG9MaW5lTW9kZWwoe1xuICAgIG1hcCxcbiAgICBtb2RlbCxcbiAgICBuZXdQb2x5LFxuICAgIG9uRHJhdyxcbiAgICB0cmFuc2xhdGlvbixcbiAgICBpc0ludGVyYWN0aXZlLFxuICB9KVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9kZWwgJiYgbWFwKSB7XG4gICAgICAgIHJlbW92ZU9sZERyYXdpbmcoeyBtYXAsIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSB9KVxuICAgICAgICBtYXAuZ2V0TWFwKCkuZHJhd0hlbHBlci5zdG9wRHJhd2luZygpXG4gICAgICB9XG4gICAgfVxuICB9LCBbbWFwLCBtb2RlbF0pXG4gIHJldHVybiA8PjwvPlxufVxuIl19