import { __read, __values } from "tslib";
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
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
// typeguard for GeoJSON.Position
var isPositionArray = function (value) {
    return (Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number');
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
var extractBufferedPolygons = function (bufferedPolygonPoints) {
    return bufferedPolygonPoints.geometry.coordinates
        .filter(function (set) {
        return Array.isArray(set) && set.length > 0;
    })
        .map(function (set) {
        if (isPositionArray(set)) {
            return Turf.polygon([set]);
        }
        return Turf.multiPolygon([set]);
    });
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
                var bufferedPolygons = extractBufferedPolygons(bufferedPolygonPoints);
                var bufferedPolygon = bufferedPolygons.reduce(function (a, b) {
                    return Turf.union(Turf.featureCollection([a, b]));
                }, bufferedPolygons[0]);
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
    return _jsx(_Fragment, {});
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1kaXNwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvY2VzaXVtL3BvbHlnb24tZGlzcGxheS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sYUFBYSxNQUFNLDhCQUE4QixDQUFBO0FBQ3hELG1KQUFtSjtBQUNuSixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDMUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNwRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUNoRixPQUFPLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQTtBQUNsRCxPQUFPLEVBQ0wsMkJBQTJCLEVBQzNCLDhCQUE4QixFQUM5Qiw0QkFBNEIsR0FDN0IsTUFBTSxnQkFBZ0IsQ0FBQTtBQUN2QixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNqRSxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksQ0FBQTtBQUVsQyxPQUFPLFVBQVUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUNyRSxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFFL0IsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUE7QUFFbkMsSUFBTSxnQkFBZ0IsR0FBRyxxQkFBcUIsQ0FBQTtBQUU5QyxJQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQTtBQUUxQyxJQUFNLDBCQUEwQixHQUFH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T0FBTztZQUNMLElBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNqQixnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsS0FBQSxFQUFFLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQ2xFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUE7WUFDdkMsQ0FBQztRQUNILENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ2hCLE9BQU8sbUJBQUssQ0FBQTtBQUNkLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IERpc3RhbmNlVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vanMvRGlzdGFuY2VVdGlscydcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcbmltcG9ydCB7IHZhbGlkYXRlR2VvIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL3ZhbGlkYXRpb24nXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uLy4uLy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHsgdXNlUmVuZGVyIH0gZnJvbSAnLi4vLi4vLi4vaG9va3MvdXNlUmVuZGVyJ1xuaW1wb3J0IHsgcmVtb3ZlT2xkRHJhd2luZywgcmVtb3ZlT3JMb2NrT2xkRHJhd2luZyB9IGZyb20gJy4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCBTaGFwZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2pzL1NoYXBlVXRpbHMnXG5pbXBvcnQge1xuICBjb25zdHJ1Y3RTb2xpZExpbmVQcmltaXRpdmUsXG4gIGNvbnN0cnVjdE91dGxpbmVkTGluZVByaW1pdGl2ZSxcbiAgY29uc3RydWN0RG90dGVkTGluZVByaW1pdGl2ZSxcbn0gZnJvbSAnLi9saW5lLWRpc3BsYXknXG5pbXBvcnQgeyBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkgfSBmcm9tICcuLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0ICogYXMgVHVyZiBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBEcmF3SGVscGVyIGZyb20gJy4uLy4uLy4uLy4uL2xpYi9jZXNpdW0tZHJhd2hlbHBlci9EcmF3SGVscGVyJ1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi91dGlsaXR5J1xuaW1wb3J0IHsgVHJhbnNsYXRpb24gfSBmcm9tICcuLi9pbnRlcmFjdGlvbnMucHJvdmlkZXInXG5jb25zdCB0b0RlZyA9IENlc2l1bS5NYXRoLnRvRGVncmVlc1xuXG5jb25zdCBwb2x5Z29uRmlsbENvbG9yID0gJ3JnYmEoMTUzLDEwMiwwLDAuMiknXG5cbmNvbnN0IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEID0gODAwMDAwMFxuXG5jb25zdCBnZXRDdXJyZW50TWFnbml0dWRlRnJvbU1hcCA9ICh7IG1hcCB9OiB7IG1hcDogYW55IH0pID0+IHtcbiAgcmV0dXJuIG1hcC5nZXRNYXAoKS5jYW1lcmEuZ2V0TWFnbml0dWRlKClcbn1cblxuLy8gdHlwZWd1YXJkIGZvciBHZW9KU09OLlBvc2l0aW9uXG5jb25zdCBpc1Bvc2l0aW9uQXJyYXkgPSAodmFsdWU6IGFueSk6IHZhbHVlIGlzIEdlb0pTT04uUG9zaXRpb25bXSA9PiB7XG4gIHJldHVybiAoXG4gICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiZcbiAgICB2YWx1ZS5sZW5ndGggPT09IDIgJiZcbiAgICB0eXBlb2YgdmFsdWVbMF0gPT09ICdudW1iZXInICYmXG4gICAgdHlwZW9mIHZhbHVlWzFdID09PSAnbnVtYmVyJ1xuICApXG59XG5cbmNvbnN0IG5lZWRzUmVkcmF3ID0gKHtcbiAgbWFwLFxuICBkcmF3bk1hZ25pdHVkZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgZHJhd25NYWduaXR1ZGU6IGFueVxufSkgPT4ge1xuICBjb25zdCBjdXJyZW50TWFnbml0dWRlID0gZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAoeyBtYXAgfSlcblxuICBpZiAoXG4gICAgY3VycmVudE1hZ25pdHVkZSA8IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEICYmXG4gICAgZHJhd25NYWduaXR1ZGUgPiBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRFxuICApIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGlmIChcbiAgICBjdXJyZW50TWFnbml0dWRlID4gQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTEQgJiZcbiAgICBkcmF3bk1hZ25pdHVkZSA8IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEXG4gICkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxudHlwZSBQb2x5Z29uID0ge1xuICBwb2x5Z29uOiBbbnVtYmVyLCBudW1iZXJdW11cbn1cblxuY29uc3QgcG9zaXRpb25zVG9Qb2x5Z29uID0gKFxuICBwb3NpdGlvbnM6IENlc2l1bS5DYXJ0ZXNpYW4zW10sXG4gIGVsbGlwc29pZDogQ2VzaXVtLkVsbGlwc29pZFxuKTogUG9seWdvbiA9PiB7XG4gIHJldHVybiB7XG4gICAgcG9seWdvbjogcG9zaXRpb25zLm1hcCgoY2FydFBvcykgPT4ge1xuICAgICAgY29uc3QgbGF0TG9uID0gZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKGNhcnRQb3MpXG4gICAgICBjb25zdCBsb24gPSB0b0RlZyhsYXRMb24ubG9uZ2l0dWRlKVxuICAgICAgY29uc3QgbGF0ID0gdG9EZWcobGF0TG9uLmxhdGl0dWRlKVxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQobG9uKSxcbiAgICAgICAgRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQobGF0KSxcbiAgICAgIF1cbiAgICB9KSxcbiAgfVxufVxuXG5jb25zdCB2YWxpZGF0ZUFuZEZpeFBvbHlnb24gPSAocG9seWdvblBvaW50czogR2VvSlNPTi5Qb3NpdGlvbltdKTogYm9vbGVhbiA9PiB7XG4gIGlmICghcG9seWdvblBvaW50cyB8fCBwb2x5Z29uUG9pbnRzLmxlbmd0aCA8IDMpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBpZiAoXG4gICAgcG9seWdvblBvaW50c1swXS50b1N0cmluZygpICE9PVxuICAgIHBvbHlnb25Qb2ludHNbcG9seWdvblBvaW50cy5sZW5ndGggLSAxXS50b1N0cmluZygpXG4gICkge1xuICAgIHBvbHlnb25Qb2ludHMucHVzaChwb2x5Z29uUG9pbnRzWzBdKVxuICB9XG4gIGlmICh2YWxpZGF0ZUdlbygncG9seWdvbicsIEpTT04uc3RyaW5naWZ5KHBvbHlnb25Qb2ludHMpKT8uZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBwb2x5Z29uUG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICBwb2ludFswXSA9IERpc3RhbmNlVXRpbHMuY29vcmRpbmF0ZVJvdW5kKHBvaW50WzBdKVxuICAgIHBvaW50WzFdID0gRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQocG9pbnRbMV0pXG4gIH0pXG4gIHJldHVybiB0cnVlXG59XG5cbmNvbnN0IGV4dHJhY3RCdWZmZXJlZFBvbHlnb25zID0gKFxuICBidWZmZXJlZFBvbHlnb25Qb2ludHM6IEdlb0pTT04uRmVhdHVyZTxHZW9KU09OLk11bHRpUG9seWdvbiB8IEdlb0pTT04uUG9seWdvbj5cbik6IEdlb0pTT04uRmVhdHVyZTxHZW9KU09OLlBvbHlnb24+W10gPT4ge1xuICByZXR1cm4gKGJ1ZmZlcmVkUG9seWdvblBvaW50cy5nZW9tZXRyeS5jb29yZGluYXRlcyBhcyBhbnkpXG4gICAgLmZpbHRlcigoc2V0OiBhbnkpID0+IHtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHNldCkgJiYgc2V0Lmxlbmd0aCA+IDBcbiAgICB9KVxuICAgIC5tYXAoKHNldDogYW55KSA9PiB7XG4gICAgICBpZiAoaXNQb3NpdGlvbkFycmF5KHNldCkpIHtcbiAgICAgICAgcmV0dXJuIFR1cmYucG9seWdvbihbc2V0XSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBUdXJmLm11bHRpUG9seWdvbihbc2V0XSlcbiAgICB9KSBhcyBHZW9KU09OLkZlYXR1cmU8R2VvSlNPTi5Qb2x5Z29uPltdXG59XG5cbmNvbnN0IGRyYXdHZW9tZXRyeSA9ICh7XG4gIG1vZGVsLFxuICBtYXAsXG4gIGlkLFxuICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgb25EcmF3LFxuICB0cmFuc2xhdGlvbixcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgbW9kZWw6IGFueVxuICBtYXA6IGFueVxuICBpZDogYW55XG4gIHNldERyYXduTWFnbml0dWRlOiAobnVtYmVyOiBhbnkpID0+IHZvaWRcbiAgb25EcmF3PzogKGRyYXdpbmdMb2NhdGlvbjogUG9seWdvbikgPT4gdm9pZFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBqc29uID0gbW9kZWwudG9KU09OKClcbiAgaWYgKCFBcnJheS5pc0FycmF5KGpzb24ucG9seWdvbikpIHtcbiAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgaXNNdWx0aVBvbHlnb24gPSBTaGFwZVV0aWxzLmlzQXJyYXkzRChqc29uLnBvbHlnb24pXG4gIC8vIENyZWF0ZSBhIGRlZXAgY29weSBzaW5jZSB3ZSBtYXkgbW9kaWZ5IHNvbWUgb2YgdGhlc2UgcG9zaXRpb25zIGZvciBkaXNwbGF5IHB1cnBvc2VzXG4gIGNvbnN0IHBvbHlnb25zOiBHZW9KU09OLlBvc2l0aW9uW11bXSA9IEpTT04ucGFyc2UoXG4gICAgSlNPTi5zdHJpbmdpZnkoaXNNdWx0aVBvbHlnb24gPyBqc29uLnBvbHlnb24gOiBbanNvbi5wb2x5Z29uXSlcbiAgKVxuXG4gIGNvbnN0IGNhbWVyYU1hZ25pdHVkZSA9IG1hcC5nZXRNYXAoKS5jYW1lcmEuZ2V0TWFnbml0dWRlKClcbiAgc2V0RHJhd25NYWduaXR1ZGUoY2FtZXJhTWFnbml0dWRlKVxuXG4gIHJlbW92ZU9yTG9ja09sZERyYXdpbmcoQm9vbGVhbihpc0ludGVyYWN0aXZlKSwgaWQsIG1hcCwgbW9kZWwpXG5cbiAgY29uc3QgYnVmZmVyID0gRGlzdGFuY2VVdGlscy5nZXREaXN0YW5jZUluTWV0ZXJzKFxuICAgIGpzb24ucG9seWdvbkJ1ZmZlcldpZHRoLFxuICAgIG1vZGVsLmdldCgncG9seWdvbkJ1ZmZlclVuaXRzJylcbiAgKVxuXG4gIGlmIChvbkRyYXcpIHtcbiAgICBwb2x5Z29ucy5mb3JFYWNoKChwb2x5Z29uUG9pbnRzKSA9PiB7XG4gICAgICBpZiAoIXZhbGlkYXRlQW5kRml4UG9seWdvbihwb2x5Z29uUG9pbnRzKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgZHJhd1ByaW1pdGl2ZSA9IG5ldyAoRHJhd0hlbHBlci5Qb2x5Z29uUHJpbWl0aXZlIGFzIGFueSkoXG4gICAgICAgIGNvbnN0cnVjdFNvbGlkTGluZVByaW1pdGl2ZSh7XG4gICAgICAgICAgY29vcmRpbmF0ZXM6IHBvbHlnb25Qb2ludHMsXG4gICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgaWQsXG4gICAgICAgICAgY29sb3I6IHBvbHlnb25GaWxsQ29sb3IsXG4gICAgICAgICAgYnVmZmVyLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgZHJhd1ByaW1pdGl2ZS5zZXRFZGl0YWJsZSgpXG4gICAgICBkcmF3UHJpbWl0aXZlLmFkZExpc3RlbmVyKCdvbkVkaXRlZCcsIGZ1bmN0aW9uIChldmVudDogYW55KSB7XG4gICAgICAgIGNvbnN0IHBvbHlnb24gPSBwb3NpdGlvbnNUb1BvbHlnb24oXG4gICAgICAgICAgZXZlbnQucG9zaXRpb25zLFxuICAgICAgICAgIG1hcC5nZXRNYXAoKS5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICAgICAgKVxuICAgICAgICBvbkRyYXcocG9seWdvbilcbiAgICAgIH0pXG4gICAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucHJpbWl0aXZlcy5hZGQoZHJhd1ByaW1pdGl2ZSlcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHBjID0gbmV3IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24oKVxuICAgIHBjLmlkID0gaWRcbiAgICBwYy5sb2NhdGlvbklkID0ganNvbi5sb2NhdGlvbklkXG4gICAgcG9seWdvbnMuZm9yRWFjaCgocG9seWdvblBvaW50cykgPT4ge1xuICAgICAgaWYgKCF2YWxpZGF0ZUFuZEZpeFBvbHlnb24ocG9seWdvblBvaW50cykpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0cmFuc2xhdGlvbikge1xuICAgICAgICBmb3IgKGNvbnN0IHBvaW50IG9mIHBvbHlnb25Qb2ludHMpIHtcbiAgICAgICAgICBwb2ludFswXSArPSB0cmFuc2xhdGlvbi5sb25naXR1ZGVcbiAgICAgICAgICBwb2ludFsxXSArPSB0cmFuc2xhdGlvbi5sYXRpdHVkZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChidWZmZXIgPiAwKSB7XG4gICAgICAgIGNvbnN0IGFkanVzdGVkUG9seWdvbiA9IFR1cmYucG9seWdvbihbcG9seWdvblBvaW50c10pXG4gICAgICAgIHV0aWxpdHkuYWRqdXN0R2VvQ29vcmRzKGFkanVzdGVkUG9seWdvbilcblxuICAgICAgICBjb25zdCBidWZmZXJlZFBvbHlnb25Qb2ludHMgPSBUdXJmLmJ1ZmZlcihcbiAgICAgICAgICBhZGp1c3RlZFBvbHlnb24sXG4gICAgICAgICAgTWF0aC5tYXgoYnVmZmVyLCAxKSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1bml0czogJ21ldGVycycsXG4gICAgICAgICAgfVxuICAgICAgICApXG5cbiAgICAgICAgaWYgKCFidWZmZXJlZFBvbHlnb25Qb2ludHMpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG5lZWQgdG8gYWRqdXN0IHRoZSBwb2ludHMgYWdhaW4gQUZURVIgYnVmZmVyaW5nLCBzaW5jZSBidWZmZXJpbmcgdW5kb2VzIHRoZSBhbnRpbWVyaWRpYW4gYWRqdXN0bWVudHNcbiAgICAgICAgdXRpbGl0eS5hZGp1c3RHZW9Db29yZHMoYnVmZmVyZWRQb2x5Z29uUG9pbnRzKVxuXG4gICAgICAgIGNvbnN0IGJ1ZmZlcmVkUG9seWdvbnMgPSBleHRyYWN0QnVmZmVyZWRQb2x5Z29ucyhidWZmZXJlZFBvbHlnb25Qb2ludHMpXG4gICAgICAgIGNvbnN0IGJ1ZmZlcmVkUG9seWdvbiA9IGJ1ZmZlcmVkUG9seWdvbnMucmVkdWNlKFxuICAgICAgICAgIChhLCBiKSA9PlxuICAgICAgICAgICAgVHVyZi51bmlvbihUdXJmLmZlYXR1cmVDb2xsZWN0aW9uKFthLCBiXSkpIGFzIEdlb0pTT04uRmVhdHVyZTxcbiAgICAgICAgICAgICAgR2VvSlNPTi5Qb2x5Z29uIHwgR2VvSlNPTi5NdWx0aVBvbHlnb25cbiAgICAgICAgICAgID4sXG4gICAgICAgICAgYnVmZmVyZWRQb2x5Z29uc1swXVxuICAgICAgICApXG5cbiAgICAgICAgYnVmZmVyZWRQb2x5Z29uPy5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKChjb29yZHM6IGFueSkgPT5cbiAgICAgICAgICBwYy5hZGQoXG4gICAgICAgICAgICBjb25zdHJ1Y3RPdXRsaW5lZExpbmVQcmltaXRpdmUoe1xuICAgICAgICAgICAgICBjb29yZGluYXRlczogY29vcmRzLFxuICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICBwYy5hZGQoXG4gICAgICAgICAgY29uc3RydWN0RG90dGVkTGluZVByaW1pdGl2ZSh7XG4gICAgICAgICAgICBjb29yZGluYXRlczogcG9seWdvblBvaW50cyxcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaXNJbnRlcmFjdGl2ZSxcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYy5hZGQoXG4gICAgICAgICAgY29uc3RydWN0T3V0bGluZWRMaW5lUHJpbWl0aXZlKHtcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBwb2x5Z29uUG9pbnRzLFxuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBpZCxcbiAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucHJpbWl0aXZlcy5hZGQocGMpXG4gIH1cblxuICBtYXAuZ2V0TWFwKCkuc2NlbmUucmVxdWVzdFJlbmRlcigpXG59XG5cbmNvbnN0IHVzZUNhbWVyYU1hZ25pdHVkZSA9ICh7XG4gIG1hcCxcbn06IHtcbiAgbWFwOiBhbnlcbn0pOiBbbnVtYmVyLCBSZWFjdC5EaXNwYXRjaDxSZWFjdC5TZXRTdGF0ZUFjdGlvbjxudW1iZXI+Pl0gPT4ge1xuICBjb25zdCBbY2FtZXJhTWFnbml0dWRlLCBzZXRDYW1lcmFNYWduaXR1ZGVdID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW2lzTW92aW5nLCBzZXRJc01vdmluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgcmVuZGVyID0gdXNlUmVuZGVyKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzdGFydExpc3RlbmVyID0gKCkgPT4gc2V0SXNNb3ZpbmcodHJ1ZSlcbiAgICBjb25zdCBlbmRMaXN0ZW5lciA9ICgpID0+IHNldElzTW92aW5nKGZhbHNlKVxuICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVTdGFydC5hZGRFdmVudExpc3RlbmVyKHN0YXJ0TGlzdGVuZXIpXG4gICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZUVuZC5hZGRFdmVudExpc3RlbmVyKGVuZExpc3RlbmVyKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtYXA/LmdldE1hcCgpLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihzdGFydExpc3RlbmVyKVxuICAgICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZUVuZC5yZW1vdmVFdmVudExpc3RlbmVyKGVuZExpc3RlbmVyKVxuICAgIH1cbiAgfSwgW21hcF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTW92aW5nKSB7XG4gICAgICBjb25zdCBhbmltYXRpb25JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBzZXRDYW1lcmFNYWduaXR1ZGUoZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAoeyBtYXAgfSkpXG4gICAgICB9KVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbklkKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2lzTW92aW5nLCByZW5kZXJdKVxuICByZXR1cm4gW2NhbWVyYU1hZ25pdHVkZSwgc2V0Q2FtZXJhTWFnbml0dWRlXVxufVxuXG5jb25zdCB1c2VMaXN0ZW5Ub0xpbmVNb2RlbCA9ICh7XG4gIG1vZGVsLFxuICBtYXAsXG4gIG9uRHJhdyxcbiAgbmV3UG9seSxcbiAgdHJhbnNsYXRpb24sXG4gIGlzSW50ZXJhY3RpdmUsXG59OiB7XG4gIG1vZGVsOiBhbnlcbiAgbWFwOiBhbnlcbiAgb25EcmF3PzogKGRyYXdpbmdMb2NhdGlvbjogUG9seWdvbikgPT4gdm9pZFxuICBuZXdQb2x5OiBQb2x5Z29uIHwgbnVsbFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBbY2FtZXJhTWFnbml0dWRlXSA9IHVzZUNhbWVyYU1hZ25pdHVkZSh7IG1hcCB9KVxuICBjb25zdCBbZHJhd25NYWduaXR1ZGUsIHNldERyYXduTWFnbml0dWRlXSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IGNhbGxiYWNrID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChtYXApIHtcbiAgICAgICAgaWYgKG5ld1BvbHkpIHtcbiAgICAgICAgICAvLyBDbG9uZSB0aGUgbW9kZWwgdG8gZGlzcGxheSB0aGUgbmV3IHBvbHlnb24gZHJhd24gYmVjYXVzZSB3ZSBkb24ndFxuICAgICAgICAgIC8vIHdhbnQgdG8gdXBkYXRlIHRoZSBleGlzdGluZyBtb2RlbCB1bmxlc3MgdGhlIHVzZXIgY2xpY2tzIEFwcGx5LlxuICAgICAgICAgIGNvbnN0IG5ld01vZGVsID0gbW9kZWwuY2xvbmUoKVxuICAgICAgICAgIG5ld01vZGVsLnNldChuZXdQb2x5KVxuICAgICAgICAgIGRyYXdHZW9tZXRyeSh7XG4gICAgICAgICAgICBtYXAsXG4gICAgICAgICAgICBtb2RlbDogbmV3TW9kZWwsXG4gICAgICAgICAgICBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSksXG4gICAgICAgICAgICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgICAgICAgICAgIG9uRHJhdyxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgZHJhd0dlb21ldHJ5KHtcbiAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pLFxuICAgICAgICAgICAgc2V0RHJhd25NYWduaXR1ZGUsXG4gICAgICAgICAgICBvbkRyYXcsXG4gICAgICAgICAgICB0cmFuc2xhdGlvbixcbiAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21vZGVsLCBtYXAsIG5ld1BvbHksIHRyYW5zbGF0aW9uLCBpc0ludGVyYWN0aXZlXSlcbiAgdXNlTGlzdGVuVG8oXG4gICAgbW9kZWwsXG4gICAgJ2NoYW5nZTpwb2x5Z29uIGNoYW5nZTpwb2x5Z29uQnVmZmVyV2lkdGggY2hhbmdlOnBvbHlnb25CdWZmZXJVbml0cycsXG4gICAgY2FsbGJhY2tcbiAgKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXAgJiYgbmVlZHNSZWRyYXcoeyBtYXAsIGRyYXduTWFnbml0dWRlIH0pKSB7XG4gICAgICBjYWxsYmFjaygpXG4gICAgfVxuICB9LCBbY2FtZXJhTWFnbml0dWRlLCBkcmF3bk1hZ25pdHVkZSwgY2FsbGJhY2ssIG1hcF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY2FsbGJhY2soKVxuICB9LCBbY2FsbGJhY2tdKVxufVxuXG5jb25zdCB1c2VTdGFydE1hcERyYXdpbmcgPSAoe1xuICBtYXAsXG4gIG1vZGVsLFxuICBzZXROZXdQb2x5LFxuICBvbkRyYXcsXG59OiB7XG4gIG1hcDogYW55XG4gIG1vZGVsOiBhbnlcbiAgc2V0TmV3UG9seTogKG5ld1BvbHk6IFBvbHlnb24pID0+IHZvaWRcbiAgb25EcmF3OiAobmV3UG9seTogUG9seWdvbikgPT4gdm9pZFxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXAgJiYgbW9kZWwpIHtcbiAgICAgIGNvbnN0IG1hdGVyaWFsID0gQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdDb2xvcicsIHtcbiAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcocG9seWdvbkZpbGxDb2xvciksXG4gICAgICB9KVxuICAgICAgbWFwLmdldE1hcCgpLmRyYXdIZWxwZXJbYHN0YXJ0RHJhd2luZ1BvbHlnb25gXSh7XG4gICAgICAgIGNhbGxiYWNrOiAocG9zaXRpb25zOiBDZXNpdW0uQ2FydGVzaWFuM1tdKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhd25Qb2x5Z29uID0gcG9zaXRpb25zVG9Qb2x5Z29uKFxuICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgbWFwLmdldE1hcCgpLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICAgIClcbiAgICAgICAgICBjb25zdCBwb2x5Z29uID0gZHJhd25Qb2x5Z29uLnBvbHlnb25cbiAgICAgICAgICAvL3RoaXMgc2hvdWxkbid0IGV2ZXIgZ2V0IGhpdCBiZWNhdXNlIHRoZSBkcmF3IGxpYnJhcnkgc2hvdWxkIHByb3RlY3QgYWdhaW5zdCBpdCwgYnV0IGp1c3QgaW4gY2FzZSBpdCBkb2VzLCByZW1vdmUgdGhlIHBvaW50XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgcG9seWdvbi5sZW5ndGggPiAzICYmXG4gICAgICAgICAgICBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMV1bMF0gPT09IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAyXVswXSAmJlxuICAgICAgICAgICAgcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDFdWzFdID09PSBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMl1bMV1cbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHBvbHlnb24ucG9wKClcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0TmV3UG9seShkcmF3blBvbHlnb24pXG4gICAgICAgICAgb25EcmF3KGRyYXduUG9seWdvbilcbiAgICAgICAgfSxcbiAgICAgICAgYXBwZWFyYW5jZTogbmV3IENlc2l1bS5NYXRlcmlhbEFwcGVhcmFuY2Uoe1xuICAgICAgICAgIG1hdGVyaWFsLFxuICAgICAgICB9KSxcbiAgICAgICAgbWF0ZXJpYWwsXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW21hcCwgbW9kZWxdKVxufVxuXG5leHBvcnQgY29uc3QgQ2VzaXVtUG9seWdvbkRpc3BsYXkgPSAoe1xuICBtYXAsXG4gIG1vZGVsLFxuICBvbkRyYXcsXG4gIHRyYW5zbGF0aW9uLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBtYXA6IGFueVxuICBtb2RlbDogYW55XG4gIG9uRHJhdz86IChuZXdQb2x5OiBQb2x5Z29uKSA9PiB2b2lkXG4gIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb25cbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIC8vIFVzZSBzdGF0ZSB0byBzdG9yZSB0aGUgcG9seWdvbiBkcmF3biBieSB0aGUgdXNlciBiZWZvcmUgdGhleSBjbGljayBBcHBseSBvciBDYW5jZWwuXG4gIC8vIFdoZW4gdGhlIHVzZXIgY2xpY2tzIERyYXcsIHRoZXkgYXJlIGFsbG93ZWQgdG8gZWRpdCB0aGUgZXhpc3RpbmcgcG9seWdvbiAoaWYgaXRcbiAgLy8gZXhpc3RzKSwgb3IgZHJhdyBhIG5ldyBwb2x5Z29uLiBJZiB0aGV5IGRyYXcgYSBuZXcgcG9seWdvbiwgc2F2ZSBpdCB0byBzdGF0ZSB0aGVuIHNob3dcbiAgLy8gaXQgaW5zdGVhZCBvZiB0aGUgZHJhdyBtb2RlbCBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG8gdXBkYXRlIHRoZSBkcmF3IG1vZGVsXG4gIC8vIHVubGVzcyB0aGUgdXNlciBjbGlja3MgQXBwbHkuXG4gIGNvbnN0IFtuZXdQb2x5LCBzZXROZXdQb2x5XSA9IFJlYWN0LnVzZVN0YXRlPFBvbHlnb24gfCBudWxsPihudWxsKVxuICBpZiAob25EcmF3KSB7XG4gICAgdXNlU3RhcnRNYXBEcmF3aW5nKHsgbWFwLCBtb2RlbCwgc2V0TmV3UG9seSwgb25EcmF3IH0pXG4gIH1cbiAgdXNlTGlzdGVuVG9MaW5lTW9kZWwoe1xuICAgIG1hcCxcbiAgICBtb2RlbCxcbiAgICBuZXdQb2x5LFxuICAgIG9uRHJhdyxcbiAgICB0cmFuc2xhdGlvbixcbiAgICBpc0ludGVyYWN0aXZlLFxuICB9KVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9kZWwgJiYgbWFwKSB7XG4gICAgICAgIHJlbW92ZU9sZERyYXdpbmcoeyBtYXAsIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSB9KVxuICAgICAgICBtYXAuZ2V0TWFwKCkuZHJhd0hlbHBlci5zdG9wRHJhd2luZygpXG4gICAgICB9XG4gICAgfVxuICB9LCBbbWFwLCBtb2RlbF0pXG4gIHJldHVybiA8PjwvPlxufVxuIl19