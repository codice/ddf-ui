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
import { makeOldDrawingNonEditable, removeOldDrawing, } from './drawing-and-display';
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
                    makeOldDrawingNonEditable({
                        map: map,
                        id: getIdFromModelForDisplay({ model: model }),
                    });
                    drawGeometry({
                        map: map,
                        model: newModel,
                        id: getIdFromModelForDisplay({ model: model }),
                        setDrawnMagnitude: setDrawnMagnitude,
                        onDraw: onDraw,
                    });
                }
                else if (model) {
                    removeOldDrawing({ map: map, id: getIdFromModelForDisplay({ model: model }) });
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
    useListenTo(model, 'change:polygon change:polygonBufferWidth change:polygonBufferUnits change:color', callback);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1kaXNwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvY2VzaXVtL3BvbHlnb24tZGlzcGxheS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sYUFBYSxNQUFNLDhCQUE4QixDQUFBO0FBQ3hELG1KQUFtSjtBQUNuSixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDMUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNwRCxPQUFPLEVBQ0wseUJBQXlCLEVBQ3pCLGdCQUFnQixHQUNqQixNQUFNLHVCQUF1QixDQUFBO0FBQzlCLE9BQU8sVUFBVSxNQUFNLDJCQUEyQixDQUFBO0FBQ2xELE9BQU8sRUFDTCwyQkFBMkIsRUFDM0IsOEJBQThCLEVBQzlCLDRCQUE0QixHQUM3QixNQUFNLGdCQUFnQixDQUFBO0FBQ3ZCLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2pFLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFBO0FBRWxDLE9BQU8sVUFBVSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3JFLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUUvQixJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQTtBQUVuQyxJQUFNLGdCQUFnQixHQUFHLHFCQUFxQixDQUFBO0FBRTlDLElBQU0sMEJBQTBCLEdBQUcsT0FBTyxDQUFBO0FBRTFDLElBQU0sMEJBQTBCLEdB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R0FBRyxLQUFBO1FBQ0gsS0FBSyxPQUFBO1FBQ0wsT0FBTyxTQUFBO1FBQ1AsTUFBTSxRQUFBO1FBQ04sV0FBVyxhQUFBO1FBQ1gsYUFBYSxlQUFBO0tBQ2QsQ0FBQyxDQUFBO0lBQ0YsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLE9BQU87WUFDTCxJQUFJLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDakIsZ0JBQWdCLENBQUMsRUFBRSxHQUFHLEtBQUEsRUFBRSxFQUFFLEVBQUUsd0JBQXdCLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUNsRSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO1lBQ3ZDLENBQUM7UUFDSCxDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNoQixPQUFPLG1CQUFLLENBQUE7QUFDZCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBEaXN0YW5jZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2pzL0Rpc3RhbmNlVXRpbHMnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjZXNpLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBDZXNpdW0gZnJvbSAnY2VzaXVtL0J1aWxkL0Nlc2l1bS9DZXNpdW0nXG5pbXBvcnQgeyB2YWxpZGF0ZUdlbyB9IGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy92YWxpZGF0aW9uJ1xuaW1wb3J0IHsgdXNlTGlzdGVuVG8gfSBmcm9tICcuLi8uLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IHVzZVJlbmRlciB9IGZyb20gJy4uLy4uLy4uL2hvb2tzL3VzZVJlbmRlcidcbmltcG9ydCB7XG4gIG1ha2VPbGREcmF3aW5nTm9uRWRpdGFibGUsXG4gIHJlbW92ZU9sZERyYXdpbmcsXG59IGZyb20gJy4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCBTaGFwZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2pzL1NoYXBlVXRpbHMnXG5pbXBvcnQge1xuICBjb25zdHJ1Y3RTb2xpZExpbmVQcmltaXRpdmUsXG4gIGNvbnN0cnVjdE91dGxpbmVkTGluZVByaW1pdGl2ZSxcbiAgY29uc3RydWN0RG90dGVkTGluZVByaW1pdGl2ZSxcbn0gZnJvbSAnLi9saW5lLWRpc3BsYXknXG5pbXBvcnQgeyBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkgfSBmcm9tICcuLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0ICogYXMgVHVyZiBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBEcmF3SGVscGVyIGZyb20gJy4uLy4uLy4uLy4uL2xpYi9jZXNpdW0tZHJhd2hlbHBlci9EcmF3SGVscGVyJ1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi91dGlsaXR5J1xuaW1wb3J0IHsgVHJhbnNsYXRpb24gfSBmcm9tICcuLi9pbnRlcmFjdGlvbnMucHJvdmlkZXInXG5jb25zdCB0b0RlZyA9IENlc2l1bS5NYXRoLnRvRGVncmVlc1xuXG5jb25zdCBwb2x5Z29uRmlsbENvbG9yID0gJ3JnYmEoMTUzLDEwMiwwLDAuMiknXG5cbmNvbnN0IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEID0gODAwMDAwMFxuXG5jb25zdCBnZXRDdXJyZW50TWFnbml0dWRlRnJvbU1hcCA9ICh7IG1hcCB9OiB7IG1hcDogYW55IH0pID0+IHtcbiAgcmV0dXJuIG1hcC5nZXRNYXAoKS5jYW1lcmEuZ2V0TWFnbml0dWRlKClcbn1cblxuLy8gdHlwZWd1YXJkIGZvciBHZW9KU09OLlBvc2l0aW9uXG5jb25zdCBpc1Bvc2l0aW9uQXJyYXkgPSAodmFsdWU6IGFueSk6IHZhbHVlIGlzIEdlb0pTT04uUG9zaXRpb25bXSA9PiB7XG4gIHJldHVybiAoXG4gICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiZcbiAgICB2YWx1ZS5sZW5ndGggPT09IDIgJiZcbiAgICB0eXBlb2YgdmFsdWVbMF0gPT09ICdudW1iZXInICYmXG4gICAgdHlwZW9mIHZhbHVlWzFdID09PSAnbnVtYmVyJ1xuICApXG59XG5cbmNvbnN0IG5lZWRzUmVkcmF3ID0gKHtcbiAgbWFwLFxuICBkcmF3bk1hZ25pdHVkZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgZHJhd25NYWduaXR1ZGU6IGFueVxufSkgPT4ge1xuICBjb25zdCBjdXJyZW50TWFnbml0dWRlID0gZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAoeyBtYXAgfSlcblxuICBpZiAoXG4gICAgY3VycmVudE1hZ25pdHVkZSA8IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEICYmXG4gICAgZHJhd25NYWduaXR1ZGUgPiBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRFxuICApIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGlmIChcbiAgICBjdXJyZW50TWFnbml0dWRlID4gQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTEQgJiZcbiAgICBkcmF3bk1hZ25pdHVkZSA8IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEXG4gICkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxudHlwZSBQb2x5Z29uID0ge1xuICBwb2x5Z29uOiBbbnVtYmVyLCBudW1iZXJdW11cbn1cblxuY29uc3QgcG9zaXRpb25zVG9Qb2x5Z29uID0gKFxuICBwb3NpdGlvbnM6IENlc2l1bS5DYXJ0ZXNpYW4zW10sXG4gIGVsbGlwc29pZDogQ2VzaXVtLkVsbGlwc29pZFxuKTogUG9seWdvbiA9PiB7XG4gIHJldHVybiB7XG4gICAgcG9seWdvbjogcG9zaXRpb25zLm1hcCgoY2FydFBvcykgPT4ge1xuICAgICAgY29uc3QgbGF0TG9uID0gZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKGNhcnRQb3MpXG4gICAgICBjb25zdCBsb24gPSB0b0RlZyhsYXRMb24ubG9uZ2l0dWRlKVxuICAgICAgY29uc3QgbGF0ID0gdG9EZWcobGF0TG9uLmxhdGl0dWRlKVxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQobG9uKSxcbiAgICAgICAgRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQobGF0KSxcbiAgICAgIF1cbiAgICB9KSxcbiAgfVxufVxuXG5jb25zdCB2YWxpZGF0ZUFuZEZpeFBvbHlnb24gPSAocG9seWdvblBvaW50czogR2VvSlNPTi5Qb3NpdGlvbltdKTogYm9vbGVhbiA9PiB7XG4gIGlmICghcG9seWdvblBvaW50cyB8fCBwb2x5Z29uUG9pbnRzLmxlbmd0aCA8IDMpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBpZiAoXG4gICAgcG9seWdvblBvaW50c1swXS50b1N0cmluZygpICE9PVxuICAgIHBvbHlnb25Qb2ludHNbcG9seWdvblBvaW50cy5sZW5ndGggLSAxXS50b1N0cmluZygpXG4gICkge1xuICAgIHBvbHlnb25Qb2ludHMucHVzaChwb2x5Z29uUG9pbnRzWzBdKVxuICB9XG4gIGlmICh2YWxpZGF0ZUdlbygncG9seWdvbicsIEpTT04uc3RyaW5naWZ5KHBvbHlnb25Qb2ludHMpKT8uZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBwb2x5Z29uUG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICBwb2ludFswXSA9IERpc3RhbmNlVXRpbHMuY29vcmRpbmF0ZVJvdW5kKHBvaW50WzBdKVxuICAgIHBvaW50WzFdID0gRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQocG9pbnRbMV0pXG4gIH0pXG4gIHJldHVybiB0cnVlXG59XG5cbmNvbnN0IGV4dHJhY3RCdWZmZXJlZFBvbHlnb25zID0gKFxuICBidWZmZXJlZFBvbHlnb25Qb2ludHM6IEdlb0pTT04uRmVhdHVyZTxHZW9KU09OLk11bHRpUG9seWdvbiB8IEdlb0pTT04uUG9seWdvbj5cbik6IEdlb0pTT04uRmVhdHVyZTxHZW9KU09OLlBvbHlnb24+W10gPT4ge1xuICByZXR1cm4gKGJ1ZmZlcmVkUG9seWdvblBvaW50cy5nZW9tZXRyeS5jb29yZGluYXRlcyBhcyBhbnkpXG4gICAgLmZpbHRlcigoc2V0OiBhbnkpID0+IHtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHNldCkgJiYgc2V0Lmxlbmd0aCA+IDBcbiAgICB9KVxuICAgIC5tYXAoKHNldDogYW55KSA9PiB7XG4gICAgICBpZiAoaXNQb3NpdGlvbkFycmF5KHNldCkpIHtcbiAgICAgICAgcmV0dXJuIFR1cmYucG9seWdvbihbc2V0XSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBUdXJmLm11bHRpUG9seWdvbihbc2V0XSlcbiAgICB9KSBhcyBHZW9KU09OLkZlYXR1cmU8R2VvSlNPTi5Qb2x5Z29uPltdXG59XG5cbmNvbnN0IGRyYXdHZW9tZXRyeSA9ICh7XG4gIG1vZGVsLFxuICBtYXAsXG4gIGlkLFxuICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgb25EcmF3LFxuICB0cmFuc2xhdGlvbixcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgbW9kZWw6IGFueVxuICBtYXA6IGFueVxuICBpZDogYW55XG4gIHNldERyYXduTWFnbml0dWRlOiAobnVtYmVyOiBhbnkpID0+IHZvaWRcbiAgb25EcmF3PzogKGRyYXdpbmdMb2NhdGlvbjogUG9seWdvbikgPT4gdm9pZFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBqc29uID0gbW9kZWwudG9KU09OKClcbiAgaWYgKCFBcnJheS5pc0FycmF5KGpzb24ucG9seWdvbikpIHtcbiAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgaXNNdWx0aVBvbHlnb24gPSBTaGFwZVV0aWxzLmlzQXJyYXkzRChqc29uLnBvbHlnb24pXG4gIC8vIENyZWF0ZSBhIGRlZXAgY29weSBzaW5jZSB3ZSBtYXkgbW9kaWZ5IHNvbWUgb2YgdGhlc2UgcG9zaXRpb25zIGZvciBkaXNwbGF5IHB1cnBvc2VzXG4gIGNvbnN0IHBvbHlnb25zOiBHZW9KU09OLlBvc2l0aW9uW11bXSA9IEpTT04ucGFyc2UoXG4gICAgSlNPTi5zdHJpbmdpZnkoaXNNdWx0aVBvbHlnb24gPyBqc29uLnBvbHlnb24gOiBbanNvbi5wb2x5Z29uXSlcbiAgKVxuXG4gIGNvbnN0IGNhbWVyYU1hZ25pdHVkZSA9IG1hcC5nZXRNYXAoKS5jYW1lcmEuZ2V0TWFnbml0dWRlKClcbiAgc2V0RHJhd25NYWduaXR1ZGUoY2FtZXJhTWFnbml0dWRlKVxuXG4gIGNvbnN0IGJ1ZmZlciA9IERpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VJbk1ldGVycyhcbiAgICBqc29uLnBvbHlnb25CdWZmZXJXaWR0aCxcbiAgICBtb2RlbC5nZXQoJ3BvbHlnb25CdWZmZXJVbml0cycpXG4gIClcblxuICBpZiAob25EcmF3KSB7XG4gICAgcG9seWdvbnMuZm9yRWFjaCgocG9seWdvblBvaW50cykgPT4ge1xuICAgICAgaWYgKCF2YWxpZGF0ZUFuZEZpeFBvbHlnb24ocG9seWdvblBvaW50cykpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRyYXdQcmltaXRpdmUgPSBuZXcgKERyYXdIZWxwZXIuUG9seWdvblByaW1pdGl2ZSBhcyBhbnkpKFxuICAgICAgICBjb25zdHJ1Y3RTb2xpZExpbmVQcmltaXRpdmUoe1xuICAgICAgICAgIGNvb3JkaW5hdGVzOiBwb2x5Z29uUG9pbnRzLFxuICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgIGlkLFxuICAgICAgICAgIGNvbG9yOiBwb2x5Z29uRmlsbENvbG9yLFxuICAgICAgICAgIGJ1ZmZlcixcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGRyYXdQcmltaXRpdmUuc2V0RWRpdGFibGUoKVxuICAgICAgZHJhd1ByaW1pdGl2ZS5hZGRMaXN0ZW5lcignb25FZGl0ZWQnLCBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCBwb2x5Z29uID0gcG9zaXRpb25zVG9Qb2x5Z29uKFxuICAgICAgICAgIGV2ZW50LnBvc2l0aW9ucyxcbiAgICAgICAgICBtYXAuZ2V0TWFwKCkuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgb25EcmF3KHBvbHlnb24pXG4gICAgICB9KVxuICAgICAgbWFwLmdldE1hcCgpLnNjZW5lLnByaW1pdGl2ZXMuYWRkKGRyYXdQcmltaXRpdmUpXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBwYyA9IG5ldyBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKClcbiAgICBwYy5pZCA9IGlkXG4gICAgcGMubG9jYXRpb25JZCA9IGpzb24ubG9jYXRpb25JZFxuICAgIHBvbHlnb25zLmZvckVhY2goKHBvbHlnb25Qb2ludHMpID0+IHtcbiAgICAgIGlmICghdmFsaWRhdGVBbmRGaXhQb2x5Z29uKHBvbHlnb25Qb2ludHMpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgZm9yIChjb25zdCBwb2ludCBvZiBwb2x5Z29uUG9pbnRzKSB7XG4gICAgICAgICAgcG9pbnRbMF0gKz0gdHJhbnNsYXRpb24ubG9uZ2l0dWRlXG4gICAgICAgICAgcG9pbnRbMV0gKz0gdHJhbnNsYXRpb24ubGF0aXR1ZGVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoYnVmZmVyID4gMCkge1xuICAgICAgICBjb25zdCBhZGp1c3RlZFBvbHlnb24gPSBUdXJmLnBvbHlnb24oW3BvbHlnb25Qb2ludHNdKVxuICAgICAgICB1dGlsaXR5LmFkanVzdEdlb0Nvb3JkcyhhZGp1c3RlZFBvbHlnb24pXG5cbiAgICAgICAgY29uc3QgYnVmZmVyZWRQb2x5Z29uUG9pbnRzID0gVHVyZi5idWZmZXIoXG4gICAgICAgICAgYWRqdXN0ZWRQb2x5Z29uLFxuICAgICAgICAgIE1hdGgubWF4KGJ1ZmZlciwgMSksXG4gICAgICAgICAge1xuICAgICAgICAgICAgdW5pdHM6ICdtZXRlcnMnLFxuICAgICAgICAgIH1cbiAgICAgICAgKVxuXG4gICAgICAgIGlmICghYnVmZmVyZWRQb2x5Z29uUG9pbnRzKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBuZWVkIHRvIGFkanVzdCB0aGUgcG9pbnRzIGFnYWluIEFGVEVSIGJ1ZmZlcmluZywgc2luY2UgYnVmZmVyaW5nIHVuZG9lcyB0aGUgYW50aW1lcmlkaWFuIGFkanVzdG1lbnRzXG4gICAgICAgIHV0aWxpdHkuYWRqdXN0R2VvQ29vcmRzKGJ1ZmZlcmVkUG9seWdvblBvaW50cylcblxuICAgICAgICBjb25zdCBidWZmZXJlZFBvbHlnb25zID0gZXh0cmFjdEJ1ZmZlcmVkUG9seWdvbnMoYnVmZmVyZWRQb2x5Z29uUG9pbnRzKVxuICAgICAgICBjb25zdCBidWZmZXJlZFBvbHlnb24gPSBidWZmZXJlZFBvbHlnb25zLnJlZHVjZShcbiAgICAgICAgICAoYSwgYikgPT5cbiAgICAgICAgICAgIFR1cmYudW5pb24oVHVyZi5mZWF0dXJlQ29sbGVjdGlvbihbYSwgYl0pKSBhcyBHZW9KU09OLkZlYXR1cmU8XG4gICAgICAgICAgICAgIEdlb0pTT04uUG9seWdvbiB8IEdlb0pTT04uTXVsdGlQb2x5Z29uXG4gICAgICAgICAgICA+LFxuICAgICAgICAgIGJ1ZmZlcmVkUG9seWdvbnNbMF1cbiAgICAgICAgKVxuXG4gICAgICAgIGJ1ZmZlcmVkUG9seWdvbj8uZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaCgoY29vcmRzOiBhbnkpID0+XG4gICAgICAgICAgcGMuYWRkKFxuICAgICAgICAgICAgY29uc3RydWN0T3V0bGluZWRMaW5lUHJpbWl0aXZlKHtcbiAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkcyxcbiAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgICBpc0ludGVyYWN0aXZlLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgcGMuYWRkKFxuICAgICAgICAgIGNvbnN0cnVjdERvdHRlZExpbmVQcmltaXRpdmUoe1xuICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHBvbHlnb25Qb2ludHMsXG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGMuYWRkKFxuICAgICAgICAgIGNvbnN0cnVjdE91dGxpbmVkTGluZVByaW1pdGl2ZSh7XG4gICAgICAgICAgICBjb29yZGluYXRlczogcG9seWdvblBvaW50cyxcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBpc0ludGVyYWN0aXZlLFxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgbWFwLmdldE1hcCgpLnNjZW5lLnByaW1pdGl2ZXMuYWRkKHBjKVxuICB9XG5cbiAgbWFwLmdldE1hcCgpLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxufVxuXG5jb25zdCB1c2VDYW1lcmFNYWduaXR1ZGUgPSAoe1xuICBtYXAsXG59OiB7XG4gIG1hcDogYW55XG59KTogW251bWJlciwgUmVhY3QuRGlzcGF0Y2g8UmVhY3QuU2V0U3RhdGVBY3Rpb248bnVtYmVyPj5dID0+IHtcbiAgY29uc3QgW2NhbWVyYU1hZ25pdHVkZSwgc2V0Q2FtZXJhTWFnbml0dWRlXSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IFtpc01vdmluZywgc2V0SXNNb3ZpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHJlbmRlciA9IHVzZVJlbmRlcigpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc3RhcnRMaXN0ZW5lciA9ICgpID0+IHNldElzTW92aW5nKHRydWUpXG4gICAgY29uc3QgZW5kTGlzdGVuZXIgPSAoKSA9PiBzZXRJc01vdmluZyhmYWxzZSlcbiAgICBtYXA/LmdldE1hcCgpLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQuYWRkRXZlbnRMaXN0ZW5lcihzdGFydExpc3RlbmVyKVxuICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVFbmQuYWRkRXZlbnRMaXN0ZW5lcihlbmRMaXN0ZW5lcilcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZVN0YXJ0LnJlbW92ZUV2ZW50TGlzdGVuZXIoc3RhcnRMaXN0ZW5lcilcbiAgICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVFbmQucmVtb3ZlRXZlbnRMaXN0ZW5lcihlbmRMaXN0ZW5lcilcbiAgICB9XG4gIH0sIFttYXBdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc01vdmluZykge1xuICAgICAgY29uc3QgYW5pbWF0aW9uSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgc2V0Q2FtZXJhTWFnbml0dWRlKGdldEN1cnJlbnRNYWduaXR1ZGVGcm9tTWFwKHsgbWFwIH0pKVxuICAgICAgfSlcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb25JZClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtpc01vdmluZywgcmVuZGVyXSlcbiAgcmV0dXJuIFtjYW1lcmFNYWduaXR1ZGUsIHNldENhbWVyYU1hZ25pdHVkZV1cbn1cblxuY29uc3QgdXNlTGlzdGVuVG9MaW5lTW9kZWwgPSAoe1xuICBtb2RlbCxcbiAgbWFwLFxuICBvbkRyYXcsXG4gIG5ld1BvbHksXG4gIHRyYW5zbGF0aW9uLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBtb2RlbDogYW55XG4gIG1hcDogYW55XG4gIG9uRHJhdz86IChkcmF3aW5nTG9jYXRpb246IFBvbHlnb24pID0+IHZvaWRcbiAgbmV3UG9seTogUG9seWdvbiB8IG51bGxcbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhbiAvLyBub3RlOiAnaW50ZXJhY3RpdmUnIGlzIGRpZmZlcmVudCBmcm9tIGRyYXdpbmdcbn0pID0+IHtcbiAgY29uc3QgW2NhbWVyYU1hZ25pdHVkZV0gPSB1c2VDYW1lcmFNYWduaXR1ZGUoeyBtYXAgfSlcbiAgY29uc3QgW2RyYXduTWFnbml0dWRlLCBzZXREcmF3bk1hZ25pdHVkZV0gPSBSZWFjdC51c2VTdGF0ZSgwKVxuICBjb25zdCBjYWxsYmFjayA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobWFwKSB7XG4gICAgICAgIGlmIChuZXdQb2x5KSB7XG4gICAgICAgICAgLy8gQ2xvbmUgdGhlIG1vZGVsIHRvIGRpc3BsYXkgdGhlIG5ldyBwb2x5Z29uIGRyYXduIGJlY2F1c2Ugd2UgZG9uJ3RcbiAgICAgICAgICAvLyB3YW50IHRvIHVwZGF0ZSB0aGUgZXhpc3RpbmcgbW9kZWwgdW5sZXNzIHRoZSB1c2VyIGNsaWNrcyBBcHBseS5cbiAgICAgICAgICBjb25zdCBuZXdNb2RlbCA9IG1vZGVsLmNsb25lKClcbiAgICAgICAgICBuZXdNb2RlbC5zZXQobmV3UG9seSlcbiAgICAgICAgICBtYWtlT2xkRHJhd2luZ05vbkVkaXRhYmxlKHtcbiAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGRyYXdHZW9tZXRyeSh7XG4gICAgICAgICAgICBtYXAsXG4gICAgICAgICAgICBtb2RlbDogbmV3TW9kZWwsXG4gICAgICAgICAgICBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSksXG4gICAgICAgICAgICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgICAgICAgICAgIG9uRHJhdyxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgcmVtb3ZlT2xkRHJhd2luZyh7IG1hcCwgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pIH0pXG4gICAgICAgICAgZHJhd0dlb21ldHJ5KHtcbiAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pLFxuICAgICAgICAgICAgc2V0RHJhd25NYWduaXR1ZGUsXG4gICAgICAgICAgICBvbkRyYXcsXG4gICAgICAgICAgICB0cmFuc2xhdGlvbixcbiAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21vZGVsLCBtYXAsIG5ld1BvbHksIHRyYW5zbGF0aW9uLCBpc0ludGVyYWN0aXZlXSlcbiAgdXNlTGlzdGVuVG8oXG4gICAgbW9kZWwsXG4gICAgJ2NoYW5nZTpwb2x5Z29uIGNoYW5nZTpwb2x5Z29uQnVmZmVyV2lkdGggY2hhbmdlOnBvbHlnb25CdWZmZXJVbml0cyBjaGFuZ2U6Y29sb3InLFxuICAgIGNhbGxiYWNrXG4gIClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwICYmIG5lZWRzUmVkcmF3KHsgbWFwLCBkcmF3bk1hZ25pdHVkZSB9KSkge1xuICAgICAgY2FsbGJhY2soKVxuICAgIH1cbiAgfSwgW2NhbWVyYU1hZ25pdHVkZSwgZHJhd25NYWduaXR1ZGUsIGNhbGxiYWNrLCBtYXBdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNhbGxiYWNrKClcbiAgfSwgW2NhbGxiYWNrXSlcbn1cblxuY29uc3QgdXNlU3RhcnRNYXBEcmF3aW5nID0gKHtcbiAgbWFwLFxuICBtb2RlbCxcbiAgc2V0TmV3UG9seSxcbiAgb25EcmF3LFxufToge1xuICBtYXA6IGFueVxuICBtb2RlbDogYW55XG4gIHNldE5ld1BvbHk6IChuZXdQb2x5OiBQb2x5Z29uKSA9PiB2b2lkXG4gIG9uRHJhdzogKG5ld1BvbHk6IFBvbHlnb24pID0+IHZvaWRcbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwICYmIG1vZGVsKSB7XG4gICAgICBjb25zdCBtYXRlcmlhbCA9IENlc2l1bS5NYXRlcmlhbC5mcm9tVHlwZSgnQ29sb3InLCB7XG4gICAgICAgIGNvbG9yOiBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKHBvbHlnb25GaWxsQ29sb3IpLFxuICAgICAgfSlcbiAgICAgIG1hcC5nZXRNYXAoKS5kcmF3SGVscGVyW2BzdGFydERyYXdpbmdQb2x5Z29uYF0oe1xuICAgICAgICBjYWxsYmFjazogKHBvc2l0aW9uczogQ2VzaXVtLkNhcnRlc2lhbjNbXSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRyYXduUG9seWdvbiA9IHBvc2l0aW9uc1RvUG9seWdvbihcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIG1hcC5nZXRNYXAoKS5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICAgICAgICApXG4gICAgICAgICAgY29uc3QgcG9seWdvbiA9IGRyYXduUG9seWdvbi5wb2x5Z29uXG4gICAgICAgICAgLy90aGlzIHNob3VsZG4ndCBldmVyIGdldCBoaXQgYmVjYXVzZSB0aGUgZHJhdyBsaWJyYXJ5IHNob3VsZCBwcm90ZWN0IGFnYWluc3QgaXQsIGJ1dCBqdXN0IGluIGNhc2UgaXQgZG9lcywgcmVtb3ZlIHRoZSBwb2ludFxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHBvbHlnb24ubGVuZ3RoID4gMyAmJlxuICAgICAgICAgICAgcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDFdWzBdID09PSBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMl1bMF0gJiZcbiAgICAgICAgICAgIHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAxXVsxXSA9PT0gcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDJdWzFdXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBwb2x5Z29uLnBvcCgpXG4gICAgICAgICAgfVxuICAgICAgICAgIHNldE5ld1BvbHkoZHJhd25Qb2x5Z29uKVxuICAgICAgICAgIG9uRHJhdyhkcmF3blBvbHlnb24pXG4gICAgICAgIH0sXG4gICAgICAgIGFwcGVhcmFuY2U6IG5ldyBDZXNpdW0uTWF0ZXJpYWxBcHBlYXJhbmNlKHtcbiAgICAgICAgICBtYXRlcmlhbCxcbiAgICAgICAgfSksXG4gICAgICAgIG1hdGVyaWFsLFxuICAgICAgfSlcbiAgICB9XG4gIH0sIFttYXAsIG1vZGVsXSlcbn1cblxuZXhwb3J0IGNvbnN0IENlc2l1bVBvbHlnb25EaXNwbGF5ID0gKHtcbiAgbWFwLFxuICBtb2RlbCxcbiAgb25EcmF3LFxuICB0cmFuc2xhdGlvbixcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICBvbkRyYXc/OiAobmV3UG9seTogUG9seWdvbikgPT4gdm9pZFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICAvLyBVc2Ugc3RhdGUgdG8gc3RvcmUgdGhlIHBvbHlnb24gZHJhd24gYnkgdGhlIHVzZXIgYmVmb3JlIHRoZXkgY2xpY2sgQXBwbHkgb3IgQ2FuY2VsLlxuICAvLyBXaGVuIHRoZSB1c2VyIGNsaWNrcyBEcmF3LCB0aGV5IGFyZSBhbGxvd2VkIHRvIGVkaXQgdGhlIGV4aXN0aW5nIHBvbHlnb24gKGlmIGl0XG4gIC8vIGV4aXN0cyksIG9yIGRyYXcgYSBuZXcgcG9seWdvbi4gSWYgdGhleSBkcmF3IGEgbmV3IHBvbHlnb24sIHNhdmUgaXQgdG8gc3RhdGUgdGhlbiBzaG93XG4gIC8vIGl0IGluc3RlYWQgb2YgdGhlIGRyYXcgbW9kZWwgYmVjYXVzZSB3ZSBkb24ndCB3YW50IHRvIHVwZGF0ZSB0aGUgZHJhdyBtb2RlbFxuICAvLyB1bmxlc3MgdGhlIHVzZXIgY2xpY2tzIEFwcGx5LlxuICBjb25zdCBbbmV3UG9seSwgc2V0TmV3UG9seV0gPSBSZWFjdC51c2VTdGF0ZTxQb2x5Z29uIHwgbnVsbD4obnVsbClcbiAgaWYgKG9uRHJhdykge1xuICAgIHVzZVN0YXJ0TWFwRHJhd2luZyh7IG1hcCwgbW9kZWwsIHNldE5ld1BvbHksIG9uRHJhdyB9KVxuICB9XG4gIHVzZUxpc3RlblRvTGluZU1vZGVsKHtcbiAgICBtYXAsXG4gICAgbW9kZWwsXG4gICAgbmV3UG9seSxcbiAgICBvbkRyYXcsXG4gICAgdHJhbnNsYXRpb24sXG4gICAgaXNJbnRlcmFjdGl2ZSxcbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKG1vZGVsICYmIG1hcCkge1xuICAgICAgICByZW1vdmVPbGREcmF3aW5nKHsgbWFwLCBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSkgfSlcbiAgICAgICAgbWFwLmdldE1hcCgpLmRyYXdIZWxwZXIuc3RvcERyYXdpbmcoKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21hcCwgbW9kZWxdKVxuICByZXR1cm4gPD48Lz5cbn1cbiJdfQ==