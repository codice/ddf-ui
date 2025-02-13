import { __assign, __read } from "tslib";
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
import _cloneDeep from 'lodash/cloneDeep';
import * as Turf from '@turf/turf';
import { validateGeo } from '../../../../react-component/utils/validation';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { useRender } from '../../../hooks/useRender';
import { removeOldDrawing, removeOrLockOldDrawing } from './drawing-and-display';
import { getIdFromModelForDisplay } from '../drawing-and-display';
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper';
import utility from './utility';
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
export var constructSolidLinePrimitive = function (_a) {
    var coordinates = _a.coordinates, model = _a.model, id = _a.id, color = _a.color, buffer = _a.buffer, isInteractive = _a.isInteractive;
    var _color = color || model.get('color');
    return {
        width: isInteractive ? 6 : 4,
        material: Cesium.Material.fromType('Color', {
            color: isInteractive
                ? Cesium.Color.fromCssColorString(contrastingColor)
                : _color
                    ? Cesium.Color.fromCssColorString(_color)
                    : Cesium.Color.KHAKI,
        }),
        id: id,
        positions: Cesium.Cartesian3.fromDegreesArray(_.flatten(coordinates)),
        buffer: buffer,
    };
};
export var constructOutlinedLinePrimitive = function (_a) {
    var coordinates = _a.coordinates, model = _a.model, id = _a.id, color = _a.color, buffer = _a.buffer, isInteractive = _a.isInteractive;
    var _color = color || model.get('color');
    return __assign(__assign({}, constructSolidLinePrimitive({
        coordinates: coordinates,
        model: model,
        id: id,
        color: color,
        buffer: buffer,
        isInteractive: isInteractive,
    })), { width: isInteractive ? 12 : 8, material: Cesium.Material.fromType('PolylineOutline', {
            color: isInteractive
                ? Cesium.Color.fromCssColorString(contrastingColor)
                : _color
                    ? Cesium.Color.fromCssColorString(_color)
                    : Cesium.Color.KHAKI,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: isInteractive ? 6 : 4,
        }) });
};
export var constructDottedLinePrimitive = function (_a) {
    var coordinates = _a.coordinates, model = _a.model, isInteractive = _a.isInteractive;
    var color = model.get('color');
    return {
        width: isInteractive ? 3 : 2,
        material: Cesium.Material.fromType('PolylineDash', {
            color: isInteractive
                ? Cesium.Color.fromCssColorString(contrastingColor)
                : color
                    ? Cesium.Color.fromCssColorString(color)
                    : Cesium.Color.KHAKI,
            dashLength: 20,
            dashPattern: 255,
        }),
        id: 'userDrawing',
        positions: Cesium.Cartesian3.fromDegreesArray(_.flatten(coordinates)),
    };
};
var positionsToLine = function (positions, ellipsoid) {
    return {
        line: positions.map(function (cartPos) {
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
var drawGeometry = function (_a) {
    var _b;
    var model = _a.model, map = _a.map, id = _a.id, setDrawnMagnitude = _a.setDrawnMagnitude, onDraw = _a.onDraw, translation = _a.translation, isInteractive = _a.isInteractive;
    var json = model.toJSON();
    var linePoints = json.line;
    if (linePoints === undefined ||
        ((_b = validateGeo('line', JSON.stringify(linePoints))) === null || _b === void 0 ? void 0 : _b.error)) {
        map.getMap().scene.requestRender();
        return;
    }
    // Create a deep copy since we may modify some of these positions for display purposes
    linePoints = _cloneDeep(json.line);
    linePoints.forEach(function (point) {
        if (translation) {
            point[0] += translation.longitude;
            point[1] += translation.latitude;
        }
        point[0] = DistanceUtils.coordinateRound(point[0]);
        point[1] = DistanceUtils.coordinateRound(point[1]);
    });
    var setArr = _.uniq(linePoints);
    if (setArr.length < 2) {
        return;
    }
    var turfLine = Turf.lineString(setArr);
    var lineWidth = DistanceUtils.getDistanceInMeters(json.lineWidth, model.get('lineUnits'));
    var cameraMagnitude = map.getMap().camera.getMagnitude();
    setDrawnMagnitude(cameraMagnitude);
    removeOrLockOldDrawing(Boolean(isInteractive), id, map, model);
    var primitive;
    if (onDraw) {
        primitive = new DrawHelper.PolylinePrimitive(constructSolidLinePrimitive({
            coordinates: turfLine.geometry.coordinates,
            model: model,
            id: id,
            color: contrastingColor,
            buffer: lineWidth,
        }));
        primitive.setEditable();
        primitive.addListener('onEdited', function (event) {
            var line = positionsToLine(event.positions, map.getMap().scene.globe.ellipsoid);
            onDraw(line);
        });
    }
    else {
        var bufferedLine = turfLine;
        var isBuffered = lineWidth > 0;
        if (isBuffered) {
            utility.adjustGeoCoords(turfLine);
            bufferedLine = Turf.buffer(turfLine, Math.max(lineWidth, 1), {
                units: 'meters',
            });
            if (!bufferedLine) {
                return;
            }
            // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
            utility.adjustGeoCoords(bufferedLine);
        }
        primitive = new Cesium.PolylineCollection();
        primitive.id = id;
        primitive.locationId = json.locationId;
        primitive.add(constructOutlinedLinePrimitive({
            coordinates: bufferedLine.geometry.coordinates,
            model: model,
            id: id,
            isInteractive: isInteractive,
        }));
        primitive.add(constructDottedLinePrimitive({
            coordinates: turfLine.geometry.coordinates,
            model: model,
            isInteractive: isInteractive,
        }));
    }
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
var useListenToLineModel = function (_a) {
    var model = _a.model, map = _a.map, onDraw = _a.onDraw, newLine = _a.newLine, translation = _a.translation, isInteractive = _a.isInteractive;
    var _b = __read(useCameraMagnitude({ map: map }), 1), cameraMagnitude = _b[0];
    var _c = __read(React.useState(0), 2), drawnMagnitude = _c[0], setDrawnMagnitude = _c[1];
    var callback = React.useMemo(function () {
        return function () {
            if (map) {
                if (newLine) {
                    // Clone the model to display the new line drawn because we don't
                    // want to update the existing model unless the user clicks Apply.
                    var newModel = model.clone();
                    newModel.set(newLine);
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
    }, [model, map, newLine, translation, isInteractive]);
    useListenTo(model, 'change:line change:lineWidth change:lineUnits', callback);
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
    var map = _a.map, model = _a.model, setNewLine = _a.setNewLine, onDraw = _a.onDraw;
    React.useEffect(function () {
        if (map && model) {
            map.getMap().drawHelper["startDrawingPolyline"]({
                callback: function (positions) {
                    var drawnLine = positionsToLine(positions, map.getMap().scene.globe.ellipsoid);
                    var line = drawnLine.line;
                    //this shouldn't ever get hit because the draw library should protect against it, but just in case it does, remove the point
                    if (line.length > 3 &&
                        line[line.length - 1][0] === line[line.length - 2][0] &&
                        line[line.length - 1][1] === line[line.length - 2][1]) {
                        line.pop();
                    }
                    setNewLine(drawnLine);
                    onDraw(drawnLine);
                },
                material: Cesium.Material.fromType('Color', {
                    color: Cesium.Color.fromCssColorString(contrastingColor),
                }),
            });
        }
    }, [map, model]);
};
export var CesiumLineDisplay = function (_a) {
    var map = _a.map, model = _a.model, onDraw = _a.onDraw, translation = _a.translation, isInteractive = _a.isInteractive;
    // Use state to store the line drawn by the user before they click Apply or Cancel.
    // When the user clicks Draw, they are allowed to edit the existing line (if it
    // exists), or draw a new line. If they draw a new line, save it to state then show
    // it instead of the draw model because we don't want to update the draw model
    // unless the user clicks Apply.
    var _b = __read(React.useState(null), 2), newLine = _b[0], setNewLine = _b[1];
    if (onDraw) {
        useStartMapDrawing({ map: map, model: model, onDraw: onDraw, setNewLine: setNewLine });
    }
    useListenToLineModel({
        map: map,
        model: model,
        onDraw: onDraw,
        newLine: newLine,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZS1kaXNwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvY2VzaXVtL2xpbmUtZGlzcGxheS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxhQUFhLE1BQU0sOEJBQThCLENBQUE7QUFDeEQsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLFVBQVUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN6QyxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksQ0FBQTtBQUNsQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDMUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNwRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUNoRixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNqRSxPQUFPLFVBQVUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUNyRSxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOERBQThELENBQUE7QUFFL0YsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUE7QUFFbkMsSUFBTSwwQkFBMEIsR0FBRyxPQUFPLENBQUE7QUFNMUMsSUFBTSwwQkFBMEIsR0FBRyxVQUFDLEVBQXFCO1FBQW5CLEdBQUcsU0FBQTtJQUN2QyxPQUFP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SyxPQUFBLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtnQkFDbEUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTthQUN0QztRQUNILENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ2hCLE9BQU8seUNBQUssQ0FBQTtBQUNkLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IERpc3RhbmNlVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vanMvRGlzdGFuY2VVdGlscydcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgX2Nsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwJ1xuaW1wb3J0ICogYXMgVHVyZiBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IHsgdmFsaWRhdGVHZW8gfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyB1c2VSZW5kZXIgfSBmcm9tICcuLi8uLi8uLi9ob29rcy91c2VSZW5kZXInXG5pbXBvcnQgeyByZW1vdmVPbGREcmF3aW5nLCByZW1vdmVPckxvY2tPbGREcmF3aW5nIH0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0IHsgZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5IH0gZnJvbSAnLi4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCBEcmF3SGVscGVyIGZyb20gJy4uLy4uLy4uLy4uL2xpYi9jZXNpdW0tZHJhd2hlbHBlci9EcmF3SGVscGVyJ1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi91dGlsaXR5J1xuaW1wb3J0IHsgY29udHJhc3RpbmdDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9sb2NhdGlvbi1jb2xvci1zZWxlY3RvcidcbmltcG9ydCB7IFRyYW5zbGF0aW9uIH0gZnJvbSAnLi4vaW50ZXJhY3Rpb25zLnByb3ZpZGVyJ1xuY29uc3QgdG9EZWcgPSBDZXNpdW0uTWF0aC50b0RlZ3JlZXNcblxuY29uc3QgQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTEQgPSA4MDAwMDAwXG5cbnR5cGUgTGluZSA9IHtcbiAgbGluZTogW251bWJlciwgbnVtYmVyXVtdXG59XG5cbmNvbnN0IGdldEN1cnJlbnRNYWduaXR1ZGVGcm9tTWFwID0gKHsgbWFwIH06IHsgbWFwOiBhbnkgfSkgPT4ge1xuICByZXR1cm4gbWFwLmdldE1hcCgpLmNhbWVyYS5nZXRNYWduaXR1ZGUoKVxufVxuXG5jb25zdCBuZWVkc1JlZHJhdyA9ICh7XG4gIG1hcCxcbiAgZHJhd25NYWduaXR1ZGUsXG59OiB7XG4gIG1hcDogYW55XG4gIGRyYXduTWFnbml0dWRlOiBhbnlcbn0pID0+IHtcbiAgY29uc3QgY3VycmVudE1hZ25pdHVkZSA9IGdldEN1cnJlbnRNYWduaXR1ZGVGcm9tTWFwKHsgbWFwIH0pXG5cbiAgaWYgKFxuICAgIGN1cnJlbnRNYWduaXR1ZGUgPCBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRCAmJlxuICAgIGRyYXduTWFnbml0dWRlID4gQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTERcbiAgKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBpZiAoXG4gICAgY3VycmVudE1hZ25pdHVkZSA+IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEICYmXG4gICAgZHJhd25NYWduaXR1ZGUgPCBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRFxuICApIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RTb2xpZExpbmVQcmltaXRpdmUgPSAoe1xuICBjb29yZGluYXRlcyxcbiAgbW9kZWwsXG4gIGlkLFxuICBjb2xvcixcbiAgYnVmZmVyLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBjb29yZGluYXRlczogYW55XG4gIG1vZGVsOiBhbnlcbiAgaWQ6IHN0cmluZ1xuICBjb2xvcj86IHN0cmluZ1xuICBidWZmZXI/OiBudW1iZXJcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIGNvbnN0IF9jb2xvciA9IGNvbG9yIHx8IG1vZGVsLmdldCgnY29sb3InKVxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyA2IDogNCxcbiAgICBtYXRlcmlhbDogQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdDb2xvcicsIHtcbiAgICAgIGNvbG9yOiBpc0ludGVyYWN0aXZlXG4gICAgICAgID8gQ2VzaXVtLkNvbG9yLmZyb21Dc3NDb2xvclN0cmluZyhjb250cmFzdGluZ0NvbG9yKVxuICAgICAgICA6IF9jb2xvclxuICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoX2NvbG9yKVxuICAgICAgICA6IENlc2l1bS5Db2xvci5LSEFLSSxcbiAgICB9KSxcbiAgICBpZCxcbiAgICBwb3NpdGlvbnM6IENlc2l1bS5DYXJ0ZXNpYW4zLmZyb21EZWdyZWVzQXJyYXkoXy5mbGF0dGVuKGNvb3JkaW5hdGVzKSksXG4gICAgYnVmZmVyLFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RPdXRsaW5lZExpbmVQcmltaXRpdmUgPSAoe1xuICBjb29yZGluYXRlcyxcbiAgbW9kZWwsXG4gIGlkLFxuICBjb2xvcixcbiAgYnVmZmVyLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBjb29yZGluYXRlczogYW55XG4gIG1vZGVsOiBhbnlcbiAgaWQ6IHN0cmluZ1xuICBjb2xvcj86IHN0cmluZ1xuICBidWZmZXI/OiBudW1iZXJcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIGNvbnN0IF9jb2xvciA9IGNvbG9yIHx8IG1vZGVsLmdldCgnY29sb3InKVxuICByZXR1cm4ge1xuICAgIC4uLmNvbnN0cnVjdFNvbGlkTGluZVByaW1pdGl2ZSh7XG4gICAgICBjb29yZGluYXRlcyxcbiAgICAgIG1vZGVsLFxuICAgICAgaWQsXG4gICAgICBjb2xvcixcbiAgICAgIGJ1ZmZlcixcbiAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgfSksXG4gICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyAxMiA6IDgsXG4gICAgbWF0ZXJpYWw6IENlc2l1bS5NYXRlcmlhbC5mcm9tVHlwZSgnUG9seWxpbmVPdXRsaW5lJywge1xuICAgICAgY29sb3I6IGlzSW50ZXJhY3RpdmVcbiAgICAgICAgPyBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGNvbnRyYXN0aW5nQ29sb3IpXG4gICAgICAgIDogX2NvbG9yXG4gICAgICAgID8gQ2VzaXVtLkNvbG9yLmZyb21Dc3NDb2xvclN0cmluZyhfY29sb3IpXG4gICAgICAgIDogQ2VzaXVtLkNvbG9yLktIQUtJLFxuICAgICAgb3V0bGluZUNvbG9yOiBDZXNpdW0uQ29sb3IuV0hJVEUsXG4gICAgICBvdXRsaW5lV2lkdGg6IGlzSW50ZXJhY3RpdmUgPyA2IDogNCxcbiAgICB9KSxcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY29uc3RydWN0RG90dGVkTGluZVByaW1pdGl2ZSA9ICh7XG4gIGNvb3JkaW5hdGVzLFxuICBtb2RlbCxcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgY29vcmRpbmF0ZXM6IGFueVxuICBtb2RlbDogYW55XG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBjb2xvciA9IG1vZGVsLmdldCgnY29sb3InKVxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyAzIDogMixcbiAgICBtYXRlcmlhbDogQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdQb2x5bGluZURhc2gnLCB7XG4gICAgICBjb2xvcjogaXNJbnRlcmFjdGl2ZVxuICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29udHJhc3RpbmdDb2xvcilcbiAgICAgICAgOiBjb2xvclxuICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29sb3IpXG4gICAgICAgIDogQ2VzaXVtLkNvbG9yLktIQUtJLFxuICAgICAgZGFzaExlbmd0aDogMjAsXG4gICAgICBkYXNoUGF0dGVybjogMjU1LFxuICAgIH0pLFxuICAgIGlkOiAndXNlckRyYXdpbmcnLFxuICAgIHBvc2l0aW9uczogQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbURlZ3JlZXNBcnJheShfLmZsYXR0ZW4oY29vcmRpbmF0ZXMpKSxcbiAgfVxufVxuXG5jb25zdCBwb3NpdGlvbnNUb0xpbmUgPSAoXG4gIHBvc2l0aW9uczogQ2VzaXVtLkNhcnRlc2lhbjNbXSxcbiAgZWxsaXBzb2lkOiBDZXNpdW0uRWxsaXBzb2lkXG4pOiBMaW5lID0+IHtcbiAgcmV0dXJuIHtcbiAgICBsaW5lOiBwb3NpdGlvbnMubWFwKChjYXJ0UG9zKSA9PiB7XG4gICAgICBjb25zdCBsYXRMb24gPSBlbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoY2FydFBvcylcbiAgICAgIGNvbnN0IGxvbiA9IHRvRGVnKGxhdExvbi5sb25naXR1ZGUpXG4gICAgICBjb25zdCBsYXQgPSB0b0RlZyhsYXRMb24ubGF0aXR1ZGUpXG4gICAgICByZXR1cm4gW1xuICAgICAgICBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChsb24pLFxuICAgICAgICBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChsYXQpLFxuICAgICAgXVxuICAgIH0pLFxuICB9XG59XG5cbmNvbnN0IGRyYXdHZW9tZXRyeSA9ICh7XG4gIG1vZGVsLFxuICBtYXAsXG4gIGlkLFxuICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgb25EcmF3LFxuICB0cmFuc2xhdGlvbixcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgbW9kZWw6IGFueVxuICBtYXA6IGFueVxuICBpZDogYW55XG4gIHNldERyYXduTWFnbml0dWRlOiAobnVtYmVyOiBhbnkpID0+IHZvaWRcbiAgb25EcmF3PzogKGRyYXdpbmdMb2NhdGlvbjogTGluZSkgPT4gdm9pZFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBqc29uID0gbW9kZWwudG9KU09OKClcbiAgbGV0IGxpbmVQb2ludHMgPSBqc29uLmxpbmVcbiAgaWYgKFxuICAgIGxpbmVQb2ludHMgPT09IHVuZGVmaW5lZCB8fFxuICAgIHZhbGlkYXRlR2VvKCdsaW5lJywgSlNPTi5zdHJpbmdpZnkobGluZVBvaW50cykpPy5lcnJvclxuICApIHtcbiAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBDcmVhdGUgYSBkZWVwIGNvcHkgc2luY2Ugd2UgbWF5IG1vZGlmeSBzb21lIG9mIHRoZXNlIHBvc2l0aW9ucyBmb3IgZGlzcGxheSBwdXJwb3Nlc1xuICBsaW5lUG9pbnRzID0gX2Nsb25lRGVlcChqc29uLmxpbmUpXG5cbiAgbGluZVBvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICBwb2ludFswXSArPSB0cmFuc2xhdGlvbi5sb25naXR1ZGVcbiAgICAgIHBvaW50WzFdICs9IHRyYW5zbGF0aW9uLmxhdGl0dWRlXG4gICAgfVxuICAgIHBvaW50WzBdID0gRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQocG9pbnRbMF0pXG4gICAgcG9pbnRbMV0gPSBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChwb2ludFsxXSlcbiAgfSlcblxuICBjb25zdCBzZXRBcnIgPSBfLnVuaXEobGluZVBvaW50cylcbiAgaWYgKHNldEFyci5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCB0dXJmTGluZSA9IFR1cmYubGluZVN0cmluZyhzZXRBcnIpIGFzXG4gICAgfCBUdXJmLkZlYXR1cmU8VHVyZi5MaW5lU3RyaW5nPlxuICAgIHwgVHVyZi5GZWF0dXJlPFR1cmYuUG9seWdvbiB8IFR1cmYuTXVsdGlQb2x5Z29uPlxuICBjb25zdCBsaW5lV2lkdGggPSBEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlSW5NZXRlcnMoXG4gICAganNvbi5saW5lV2lkdGgsXG4gICAgbW9kZWwuZ2V0KCdsaW5lVW5pdHMnKVxuICApXG4gIGNvbnN0IGNhbWVyYU1hZ25pdHVkZSA9IG1hcC5nZXRNYXAoKS5jYW1lcmEuZ2V0TWFnbml0dWRlKClcbiAgc2V0RHJhd25NYWduaXR1ZGUoY2FtZXJhTWFnbml0dWRlKVxuXG4gIHJlbW92ZU9yTG9ja09sZERyYXdpbmcoQm9vbGVhbihpc0ludGVyYWN0aXZlKSwgaWQsIG1hcCwgbW9kZWwpXG5cbiAgbGV0IHByaW1pdGl2ZVxuXG4gIGlmIChvbkRyYXcpIHtcbiAgICBwcmltaXRpdmUgPSBuZXcgKERyYXdIZWxwZXIuUG9seWxpbmVQcmltaXRpdmUgYXMgYW55KShcbiAgICAgIGNvbnN0cnVjdFNvbGlkTGluZVByaW1pdGl2ZSh7XG4gICAgICAgIGNvb3JkaW5hdGVzOiB0dXJmTGluZS5nZW9tZXRyeS5jb29yZGluYXRlcyxcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIGlkLFxuICAgICAgICBjb2xvcjogY29udHJhc3RpbmdDb2xvcixcbiAgICAgICAgYnVmZmVyOiBsaW5lV2lkdGgsXG4gICAgICB9KVxuICAgIClcbiAgICBwcmltaXRpdmUuc2V0RWRpdGFibGUoKVxuICAgIHByaW1pdGl2ZS5hZGRMaXN0ZW5lcignb25FZGl0ZWQnLCBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgY29uc3QgbGluZSA9IHBvc2l0aW9uc1RvTGluZShcbiAgICAgICAgZXZlbnQucG9zaXRpb25zLFxuICAgICAgICBtYXAuZ2V0TWFwKCkuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICApXG4gICAgICBvbkRyYXcobGluZSlcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGxldCBidWZmZXJlZExpbmUgPSB0dXJmTGluZVxuICAgIGNvbnN0IGlzQnVmZmVyZWQgPSBsaW5lV2lkdGggPiAwXG4gICAgaWYgKGlzQnVmZmVyZWQpIHtcbiAgICAgIHV0aWxpdHkuYWRqdXN0R2VvQ29vcmRzKHR1cmZMaW5lKVxuICAgICAgYnVmZmVyZWRMaW5lID0gVHVyZi5idWZmZXIodHVyZkxpbmUsIE1hdGgubWF4KGxpbmVXaWR0aCwgMSksIHtcbiAgICAgICAgdW5pdHM6ICdtZXRlcnMnLFxuICAgICAgfSlcbiAgICAgIGlmICghYnVmZmVyZWRMaW5lKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8gbmVlZCB0byBhZGp1c3QgdGhlIHBvaW50cyBhZ2FpbiBBRlRFUiBidWZmZXJpbmcsIHNpbmNlIGJ1ZmZlcmluZyB1bmRvZXMgdGhlIGFudGltZXJpZGlhbiBhZGp1c3RtZW50c1xuICAgICAgdXRpbGl0eS5hZGp1c3RHZW9Db29yZHMoYnVmZmVyZWRMaW5lKVxuICAgIH1cblxuICAgIHByaW1pdGl2ZSA9IG5ldyBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKClcbiAgICBwcmltaXRpdmUuaWQgPSBpZFxuICAgIHByaW1pdGl2ZS5sb2NhdGlvbklkID0ganNvbi5sb2NhdGlvbklkXG4gICAgcHJpbWl0aXZlLmFkZChcbiAgICAgIGNvbnN0cnVjdE91dGxpbmVkTGluZVByaW1pdGl2ZSh7XG4gICAgICAgIGNvb3JkaW5hdGVzOiBidWZmZXJlZExpbmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMsXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBpZCxcbiAgICAgICAgaXNJbnRlcmFjdGl2ZSxcbiAgICAgIH0pXG4gICAgKVxuICAgIHByaW1pdGl2ZS5hZGQoXG4gICAgICBjb25zdHJ1Y3REb3R0ZWRMaW5lUHJpbWl0aXZlKHtcbiAgICAgICAgY29vcmRpbmF0ZXM6IHR1cmZMaW5lLmdlb21ldHJ5LmNvb3JkaW5hdGVzLFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgaXNJbnRlcmFjdGl2ZSxcbiAgICAgIH0pXG4gICAgKVxuICB9XG5cbiAgbWFwLmdldE1hcCgpLnNjZW5lLnByaW1pdGl2ZXMuYWRkKHByaW1pdGl2ZSlcbiAgbWFwLmdldE1hcCgpLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxufVxuXG5jb25zdCB1c2VDYW1lcmFNYWduaXR1ZGUgPSAoe1xuICBtYXAsXG59OiB7XG4gIG1hcDogYW55XG59KTogW251bWJlciwgUmVhY3QuRGlzcGF0Y2g8UmVhY3QuU2V0U3RhdGVBY3Rpb248bnVtYmVyPj5dID0+IHtcbiAgY29uc3QgW2NhbWVyYU1hZ25pdHVkZSwgc2V0Q2FtZXJhTWFnbml0dWRlXSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IFtpc01vdmluZywgc2V0SXNNb3ZpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHJlbmRlciA9IHVzZVJlbmRlcigpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc3RhcnRMaXN0ZW5lciA9ICgpID0+IHNldElzTW92aW5nKHRydWUpXG4gICAgY29uc3QgZW5kTGlzdGVuZXIgPSAoKSA9PiBzZXRJc01vdmluZyhmYWxzZSlcbiAgICBtYXA/LmdldE1hcCgpLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQuYWRkRXZlbnRMaXN0ZW5lcihzdGFydExpc3RlbmVyKVxuICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVFbmQuYWRkRXZlbnRMaXN0ZW5lcihlbmRMaXN0ZW5lcilcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZVN0YXJ0LnJlbW92ZUV2ZW50TGlzdGVuZXIoc3RhcnRMaXN0ZW5lcilcbiAgICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVFbmQucmVtb3ZlRXZlbnRMaXN0ZW5lcihlbmRMaXN0ZW5lcilcbiAgICB9XG4gIH0sIFttYXBdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc01vdmluZykge1xuICAgICAgY29uc3QgYW5pbWF0aW9uSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgc2V0Q2FtZXJhTWFnbml0dWRlKGdldEN1cnJlbnRNYWduaXR1ZGVGcm9tTWFwKHsgbWFwIH0pKVxuICAgICAgfSlcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb25JZClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtpc01vdmluZywgcmVuZGVyXSlcbiAgcmV0dXJuIFtjYW1lcmFNYWduaXR1ZGUsIHNldENhbWVyYU1hZ25pdHVkZV1cbn1cblxuY29uc3QgdXNlTGlzdGVuVG9MaW5lTW9kZWwgPSAoe1xuICBtb2RlbCxcbiAgbWFwLFxuICBvbkRyYXcsXG4gIG5ld0xpbmUsXG4gIHRyYW5zbGF0aW9uLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBtb2RlbDogYW55XG4gIG1hcDogYW55XG4gIG9uRHJhdz86IChkcmF3aW5nTG9jYXRpb246IExpbmUpID0+IHZvaWRcbiAgbmV3TGluZTogTGluZSB8IG51bGxcbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhbiAvLyBub3RlOiAnaW50ZXJhY3RpdmUnIGlzIGRpZmZlcmVudCBmcm9tIGRyYXdpbmdcbn0pID0+IHtcbiAgY29uc3QgW2NhbWVyYU1hZ25pdHVkZV0gPSB1c2VDYW1lcmFNYWduaXR1ZGUoeyBtYXAgfSlcbiAgY29uc3QgW2RyYXduTWFnbml0dWRlLCBzZXREcmF3bk1hZ25pdHVkZV0gPSBSZWFjdC51c2VTdGF0ZSgwKVxuICBjb25zdCBjYWxsYmFjayA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobWFwKSB7XG4gICAgICAgIGlmIChuZXdMaW5lKSB7XG4gICAgICAgICAgLy8gQ2xvbmUgdGhlIG1vZGVsIHRvIGRpc3BsYXkgdGhlIG5ldyBsaW5lIGRyYXduIGJlY2F1c2Ugd2UgZG9uJ3RcbiAgICAgICAgICAvLyB3YW50IHRvIHVwZGF0ZSB0aGUgZXhpc3RpbmcgbW9kZWwgdW5sZXNzIHRoZSB1c2VyIGNsaWNrcyBBcHBseS5cbiAgICAgICAgICBjb25zdCBuZXdNb2RlbCA9IG1vZGVsLmNsb25lKClcbiAgICAgICAgICBuZXdNb2RlbC5zZXQobmV3TGluZSlcbiAgICAgICAgICBkcmF3R2VvbWV0cnkoe1xuICAgICAgICAgICAgbWFwLFxuICAgICAgICAgICAgbW9kZWw6IG5ld01vZGVsLFxuICAgICAgICAgICAgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pLFxuICAgICAgICAgICAgc2V0RHJhd25NYWduaXR1ZGUsXG4gICAgICAgICAgICBvbkRyYXcsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmIChtb2RlbCkge1xuICAgICAgICAgIGRyYXdHZW9tZXRyeSh7XG4gICAgICAgICAgICBtYXAsXG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSxcbiAgICAgICAgICAgIHNldERyYXduTWFnbml0dWRlLFxuICAgICAgICAgICAgb25EcmF3LFxuICAgICAgICAgICAgdHJhbnNsYXRpb24sXG4gICAgICAgICAgICBpc0ludGVyYWN0aXZlLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIFttb2RlbCwgbWFwLCBuZXdMaW5lLCB0cmFuc2xhdGlvbiwgaXNJbnRlcmFjdGl2ZV0pXG4gIHVzZUxpc3RlblRvKG1vZGVsLCAnY2hhbmdlOmxpbmUgY2hhbmdlOmxpbmVXaWR0aCBjaGFuZ2U6bGluZVVuaXRzJywgY2FsbGJhY2spXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcCAmJiBuZWVkc1JlZHJhdyh7IG1hcCwgZHJhd25NYWduaXR1ZGUgfSkpIHtcbiAgICAgIGNhbGxiYWNrKClcbiAgICB9XG4gIH0sIFtjYW1lcmFNYWduaXR1ZGUsIGRyYXduTWFnbml0dWRlLCBjYWxsYmFjaywgbWFwXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjYWxsYmFjaygpXG4gIH0sIFtjYWxsYmFja10pXG59XG5cbmNvbnN0IHVzZVN0YXJ0TWFwRHJhd2luZyA9ICh7XG4gIG1hcCxcbiAgbW9kZWwsXG4gIHNldE5ld0xpbmUsXG4gIG9uRHJhdyxcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICBzZXROZXdMaW5lOiAobmV3TGluZTogTGluZSkgPT4gdm9pZFxuICBvbkRyYXc6IChuZXdMaW5lOiBMaW5lKSA9PiB2b2lkXG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcCAmJiBtb2RlbCkge1xuICAgICAgbWFwLmdldE1hcCgpLmRyYXdIZWxwZXJbYHN0YXJ0RHJhd2luZ1BvbHlsaW5lYF0oe1xuICAgICAgICBjYWxsYmFjazogKHBvc2l0aW9uczogQ2VzaXVtLkNhcnRlc2lhbjNbXSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRyYXduTGluZSA9IHBvc2l0aW9uc1RvTGluZShcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIG1hcC5nZXRNYXAoKS5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICAgICAgICApXG4gICAgICAgICAgY29uc3QgbGluZSA9IGRyYXduTGluZS5saW5lXG4gICAgICAgICAgLy90aGlzIHNob3VsZG4ndCBldmVyIGdldCBoaXQgYmVjYXVzZSB0aGUgZHJhdyBsaWJyYXJ5IHNob3VsZCBwcm90ZWN0IGFnYWluc3QgaXQsIGJ1dCBqdXN0IGluIGNhc2UgaXQgZG9lcywgcmVtb3ZlIHRoZSBwb2ludFxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGxpbmUubGVuZ3RoID4gMyAmJlxuICAgICAgICAgICAgbGluZVtsaW5lLmxlbmd0aCAtIDFdWzBdID09PSBsaW5lW2xpbmUubGVuZ3RoIC0gMl1bMF0gJiZcbiAgICAgICAgICAgIGxpbmVbbGluZS5sZW5ndGggLSAxXVsxXSA9PT0gbGluZVtsaW5lLmxlbmd0aCAtIDJdWzFdXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsaW5lLnBvcCgpXG4gICAgICAgICAgfVxuICAgICAgICAgIHNldE5ld0xpbmUoZHJhd25MaW5lKVxuICAgICAgICAgIG9uRHJhdyhkcmF3bkxpbmUpXG4gICAgICAgIH0sXG4gICAgICAgIG1hdGVyaWFsOiBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoJ0NvbG9yJywge1xuICAgICAgICAgIGNvbG9yOiBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGNvbnRyYXN0aW5nQ29sb3IpLFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbbWFwLCBtb2RlbF0pXG59XG5cbmV4cG9ydCBjb25zdCBDZXNpdW1MaW5lRGlzcGxheSA9ICh7XG4gIG1hcCxcbiAgbW9kZWwsXG4gIG9uRHJhdyxcbiAgdHJhbnNsYXRpb24sXG4gIGlzSW50ZXJhY3RpdmUsXG59OiB7XG4gIG1hcDogYW55XG4gIG1vZGVsOiBhbnlcbiAgb25EcmF3PzogKG5ld0xpbmU6IExpbmUpID0+IHZvaWRcbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhbiAvLyBub3RlOiAnaW50ZXJhY3RpdmUnIGlzIGRpZmZlcmVudCBmcm9tIGRyYXdpbmdcbn0pID0+IHtcbiAgLy8gVXNlIHN0YXRlIHRvIHN0b3JlIHRoZSBsaW5lIGRyYXduIGJ5IHRoZSB1c2VyIGJlZm9yZSB0aGV5IGNsaWNrIEFwcGx5IG9yIENhbmNlbC5cbiAgLy8gV2hlbiB0aGUgdXNlciBjbGlja3MgRHJhdywgdGhleSBhcmUgYWxsb3dlZCB0byBlZGl0IHRoZSBleGlzdGluZyBsaW5lIChpZiBpdFxuICAvLyBleGlzdHMpLCBvciBkcmF3IGEgbmV3IGxpbmUuIElmIHRoZXkgZHJhdyBhIG5ldyBsaW5lLCBzYXZlIGl0IHRvIHN0YXRlIHRoZW4gc2hvd1xuICAvLyBpdCBpbnN0ZWFkIG9mIHRoZSBkcmF3IG1vZGVsIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0byB1cGRhdGUgdGhlIGRyYXcgbW9kZWxcbiAgLy8gdW5sZXNzIHRoZSB1c2VyIGNsaWNrcyBBcHBseS5cbiAgY29uc3QgW25ld0xpbmUsIHNldE5ld0xpbmVdID0gUmVhY3QudXNlU3RhdGU8TGluZSB8IG51bGw+KG51bGwpXG4gIGlmIChvbkRyYXcpIHtcbiAgICB1c2VTdGFydE1hcERyYXdpbmcoeyBtYXAsIG1vZGVsLCBvbkRyYXcsIHNldE5ld0xpbmUgfSlcbiAgfVxuICB1c2VMaXN0ZW5Ub0xpbmVNb2RlbCh7XG4gICAgbWFwLFxuICAgIG1vZGVsLFxuICAgIG9uRHJhdyxcbiAgICBuZXdMaW5lLFxuICAgIHRyYW5zbGF0aW9uLFxuICAgIGlzSW50ZXJhY3RpdmUsXG4gIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChtb2RlbCAmJiBtYXApIHtcbiAgICAgICAgcmVtb3ZlT2xkRHJhd2luZyh7IG1hcCwgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pIH0pXG4gICAgICAgIG1hcC5nZXRNYXAoKS5kcmF3SGVscGVyLnN0b3BEcmF3aW5nKClcbiAgICAgIH1cbiAgICB9XG4gIH0sIFttYXAsIG1vZGVsXSlcbiAgcmV0dXJuIDw+PC8+XG59XG4iXX0=