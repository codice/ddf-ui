import { __assign, __read } from "tslib";
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
            var buffered = Turf.buffer(turfLine, Math.max(lineWidth, 1), {
                units: 'meters',
            });
            if (!buffered) {
                return;
            }
            bufferedLine = buffered;
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
    return _jsx(_Fragment, {});
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZS1kaXNwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvY2VzaXVtL2xpbmUtZGlzcGxheS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sYUFBYSxNQUFNLDhCQUE4QixDQUFBO0FBQ3hELG1KQUFtSjtBQUNuSixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUMvQyxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxVQUFVLE1BQU0sa0JBQWtCLENBQUE7QUFDekMsT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLENBQUE7QUFDbEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUMxRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFDcEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDaEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDakUsT0FBTyxVQUFVLE1BQU0sOENBQThDLENBQUE7QUFDckUsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDhEQUE4RCxDQUFBO0FBRS9GLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFBO0FBRW5DLElBQU0sMEJBQTBCLEdBQUcsT0FBTyxDQUFBO0FBTTFDLElBQU0sMEJBQTBCLEdBQUcsVUFBQyxFQUFxQjtRQUFuQixHQUFHLFNBQUE7SUFDdkMsT0FB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QUFNLFFBQUE7UUFDTixPQUFPLFNBQUE7UUFDUCxXQUFXLGFBQUE7UUFDWCxhQUFhLGVBQUE7S0FDZCxDQUFDLENBQUE7SUFDRixLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsT0FBTztZQUNMLElBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNqQixnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsS0FBQSxFQUFFLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQ2xFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUE7WUFDdkMsQ0FBQztRQUNILENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ2hCLE9BQU8sbUJBQUssQ0FBQTtBQUNkLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IERpc3RhbmNlVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vanMvRGlzdGFuY2VVdGlscydcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgX2Nsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwJ1xuaW1wb3J0ICogYXMgVHVyZiBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IHsgdmFsaWRhdGVHZW8gfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyB1c2VSZW5kZXIgfSBmcm9tICcuLi8uLi8uLi9ob29rcy91c2VSZW5kZXInXG5pbXBvcnQgeyByZW1vdmVPbGREcmF3aW5nLCByZW1vdmVPckxvY2tPbGREcmF3aW5nIH0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0IHsgZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5IH0gZnJvbSAnLi4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCBEcmF3SGVscGVyIGZyb20gJy4uLy4uLy4uLy4uL2xpYi9jZXNpdW0tZHJhd2hlbHBlci9EcmF3SGVscGVyJ1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi91dGlsaXR5J1xuaW1wb3J0IHsgY29udHJhc3RpbmdDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9sb2NhdGlvbi1jb2xvci1zZWxlY3RvcidcbmltcG9ydCB7IFRyYW5zbGF0aW9uIH0gZnJvbSAnLi4vaW50ZXJhY3Rpb25zLnByb3ZpZGVyJ1xuY29uc3QgdG9EZWcgPSBDZXNpdW0uTWF0aC50b0RlZ3JlZXNcblxuY29uc3QgQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTEQgPSA4MDAwMDAwXG5cbnR5cGUgTGluZSA9IHtcbiAgbGluZTogW251bWJlciwgbnVtYmVyXVtdXG59XG5cbmNvbnN0IGdldEN1cnJlbnRNYWduaXR1ZGVGcm9tTWFwID0gKHsgbWFwIH06IHsgbWFwOiBhbnkgfSkgPT4ge1xuICByZXR1cm4gbWFwLmdldE1hcCgpLmNhbWVyYS5nZXRNYWduaXR1ZGUoKVxufVxuXG5jb25zdCBuZWVkc1JlZHJhdyA9ICh7XG4gIG1hcCxcbiAgZHJhd25NYWduaXR1ZGUsXG59OiB7XG4gIG1hcDogYW55XG4gIGRyYXduTWFnbml0dWRlOiBhbnlcbn0pID0+IHtcbiAgY29uc3QgY3VycmVudE1hZ25pdHVkZSA9IGdldEN1cnJlbnRNYWduaXR1ZGVGcm9tTWFwKHsgbWFwIH0pXG5cbiAgaWYgKFxuICAgIGN1cnJlbnRNYWduaXR1ZGUgPCBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRCAmJlxuICAgIGRyYXduTWFnbml0dWRlID4gQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTERcbiAgKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBpZiAoXG4gICAgY3VycmVudE1hZ25pdHVkZSA+IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEICYmXG4gICAgZHJhd25NYWduaXR1ZGUgPCBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRFxuICApIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RTb2xpZExpbmVQcmltaXRpdmUgPSAoe1xuICBjb29yZGluYXRlcyxcbiAgbW9kZWwsXG4gIGlkLFxuICBjb2xvcixcbiAgYnVmZmVyLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBjb29yZGluYXRlczogYW55XG4gIG1vZGVsOiBhbnlcbiAgaWQ6IHN0cmluZ1xuICBjb2xvcj86IHN0cmluZ1xuICBidWZmZXI/OiBudW1iZXJcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIGNvbnN0IF9jb2xvciA9IGNvbG9yIHx8IG1vZGVsLmdldCgnY29sb3InKVxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyA2IDogNCxcbiAgICBtYXRlcmlhbDogQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdDb2xvcicsIHtcbiAgICAgIGNvbG9yOiBpc0ludGVyYWN0aXZlXG4gICAgICAgID8gQ2VzaXVtLkNvbG9yLmZyb21Dc3NDb2xvclN0cmluZyhjb250cmFzdGluZ0NvbG9yKVxuICAgICAgICA6IF9jb2xvclxuICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoX2NvbG9yKVxuICAgICAgICA6IENlc2l1bS5Db2xvci5LSEFLSSxcbiAgICB9KSxcbiAgICBpZCxcbiAgICBwb3NpdGlvbnM6IENlc2l1bS5DYXJ0ZXNpYW4zLmZyb21EZWdyZWVzQXJyYXkoXy5mbGF0dGVuKGNvb3JkaW5hdGVzKSksXG4gICAgYnVmZmVyLFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RPdXRsaW5lZExpbmVQcmltaXRpdmUgPSAoe1xuICBjb29yZGluYXRlcyxcbiAgbW9kZWwsXG4gIGlkLFxuICBjb2xvcixcbiAgYnVmZmVyLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBjb29yZGluYXRlczogYW55XG4gIG1vZGVsOiBhbnlcbiAgaWQ6IHN0cmluZ1xuICBjb2xvcj86IHN0cmluZ1xuICBidWZmZXI/OiBudW1iZXJcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIGNvbnN0IF9jb2xvciA9IGNvbG9yIHx8IG1vZGVsLmdldCgnY29sb3InKVxuICByZXR1cm4ge1xuICAgIC4uLmNvbnN0cnVjdFNvbGlkTGluZVByaW1pdGl2ZSh7XG4gICAgICBjb29yZGluYXRlcyxcbiAgICAgIG1vZGVsLFxuICAgICAgaWQsXG4gICAgICBjb2xvcixcbiAgICAgIGJ1ZmZlcixcbiAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgfSksXG4gICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyAxMiA6IDgsXG4gICAgbWF0ZXJpYWw6IENlc2l1bS5NYXRlcmlhbC5mcm9tVHlwZSgnUG9seWxpbmVPdXRsaW5lJywge1xuICAgICAgY29sb3I6IGlzSW50ZXJhY3RpdmVcbiAgICAgICAgPyBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGNvbnRyYXN0aW5nQ29sb3IpXG4gICAgICAgIDogX2NvbG9yXG4gICAgICAgID8gQ2VzaXVtLkNvbG9yLmZyb21Dc3NDb2xvclN0cmluZyhfY29sb3IpXG4gICAgICAgIDogQ2VzaXVtLkNvbG9yLktIQUtJLFxuICAgICAgb3V0bGluZUNvbG9yOiBDZXNpdW0uQ29sb3IuV0hJVEUsXG4gICAgICBvdXRsaW5lV2lkdGg6IGlzSW50ZXJhY3RpdmUgPyA2IDogNCxcbiAgICB9KSxcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY29uc3RydWN0RG90dGVkTGluZVByaW1pdGl2ZSA9ICh7XG4gIGNvb3JkaW5hdGVzLFxuICBtb2RlbCxcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgY29vcmRpbmF0ZXM6IGFueVxuICBtb2RlbDogYW55XG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBjb2xvciA9IG1vZGVsLmdldCgnY29sb3InKVxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyAzIDogMixcbiAgICBtYXRlcmlhbDogQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdQb2x5bGluZURhc2gnLCB7XG4gICAgICBjb2xvcjogaXNJbnRlcmFjdGl2ZVxuICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29udHJhc3RpbmdDb2xvcilcbiAgICAgICAgOiBjb2xvclxuICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29sb3IpXG4gICAgICAgIDogQ2VzaXVtLkNvbG9yLktIQUtJLFxuICAgICAgZGFzaExlbmd0aDogMjAsXG4gICAgICBkYXNoUGF0dGVybjogMjU1LFxuICAgIH0pLFxuICAgIGlkOiAndXNlckRyYXdpbmcnLFxuICAgIHBvc2l0aW9uczogQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbURlZ3JlZXNBcnJheShfLmZsYXR0ZW4oY29vcmRpbmF0ZXMpKSxcbiAgfVxufVxuXG5jb25zdCBwb3NpdGlvbnNUb0xpbmUgPSAoXG4gIHBvc2l0aW9uczogQ2VzaXVtLkNhcnRlc2lhbjNbXSxcbiAgZWxsaXBzb2lkOiBDZXNpdW0uRWxsaXBzb2lkXG4pOiBMaW5lID0+IHtcbiAgcmV0dXJuIHtcbiAgICBsaW5lOiBwb3NpdGlvbnMubWFwKChjYXJ0UG9zKSA9PiB7XG4gICAgICBjb25zdCBsYXRMb24gPSBlbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoY2FydFBvcylcbiAgICAgIGNvbnN0IGxvbiA9IHRvRGVnKGxhdExvbi5sb25naXR1ZGUpXG4gICAgICBjb25zdCBsYXQgPSB0b0RlZyhsYXRMb24ubGF0aXR1ZGUpXG4gICAgICByZXR1cm4gW1xuICAgICAgICBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChsb24pLFxuICAgICAgICBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChsYXQpLFxuICAgICAgXVxuICAgIH0pLFxuICB9XG59XG5cbmNvbnN0IGRyYXdHZW9tZXRyeSA9ICh7XG4gIG1vZGVsLFxuICBtYXAsXG4gIGlkLFxuICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgb25EcmF3LFxuICB0cmFuc2xhdGlvbixcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgbW9kZWw6IGFueVxuICBtYXA6IGFueVxuICBpZDogYW55XG4gIHNldERyYXduTWFnbml0dWRlOiAobnVtYmVyOiBhbnkpID0+IHZvaWRcbiAgb25EcmF3PzogKGRyYXdpbmdMb2NhdGlvbjogTGluZSkgPT4gdm9pZFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBqc29uID0gbW9kZWwudG9KU09OKClcbiAgbGV0IGxpbmVQb2ludHMgPSBqc29uLmxpbmVcbiAgaWYgKFxuICAgIGxpbmVQb2ludHMgPT09IHVuZGVmaW5lZCB8fFxuICAgIHZhbGlkYXRlR2VvKCdsaW5lJywgSlNPTi5zdHJpbmdpZnkobGluZVBvaW50cykpPy5lcnJvclxuICApIHtcbiAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBDcmVhdGUgYSBkZWVwIGNvcHkgc2luY2Ugd2UgbWF5IG1vZGlmeSBzb21lIG9mIHRoZXNlIHBvc2l0aW9ucyBmb3IgZGlzcGxheSBwdXJwb3Nlc1xuICBsaW5lUG9pbnRzID0gX2Nsb25lRGVlcChqc29uLmxpbmUpXG5cbiAgbGluZVBvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICBwb2ludFswXSArPSB0cmFuc2xhdGlvbi5sb25naXR1ZGVcbiAgICAgIHBvaW50WzFdICs9IHRyYW5zbGF0aW9uLmxhdGl0dWRlXG4gICAgfVxuICAgIHBvaW50WzBdID0gRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQocG9pbnRbMF0pXG4gICAgcG9pbnRbMV0gPSBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChwb2ludFsxXSlcbiAgfSlcblxuICBjb25zdCBzZXRBcnIgPSBfLnVuaXEobGluZVBvaW50cylcbiAgaWYgKHNldEFyci5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCB0dXJmTGluZSA9IFR1cmYubGluZVN0cmluZyhzZXRBcnIpIGFzXG4gICAgfCBHZW9KU09OLkZlYXR1cmU8R2VvSlNPTi5MaW5lU3RyaW5nPlxuICAgIHwgR2VvSlNPTi5GZWF0dXJlPEdlb0pTT04uUG9seWdvbiB8IEdlb0pTT04uTXVsdGlQb2x5Z29uPlxuICBjb25zdCBsaW5lV2lkdGggPSBEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlSW5NZXRlcnMoXG4gICAganNvbi5saW5lV2lkdGgsXG4gICAgbW9kZWwuZ2V0KCdsaW5lVW5pdHMnKVxuICApXG4gIGNvbnN0IGNhbWVyYU1hZ25pdHVkZSA9IG1hcC5nZXRNYXAoKS5jYW1lcmEuZ2V0TWFnbml0dWRlKClcbiAgc2V0RHJhd25NYWduaXR1ZGUoY2FtZXJhTWFnbml0dWRlKVxuXG4gIHJlbW92ZU9yTG9ja09sZERyYXdpbmcoQm9vbGVhbihpc0ludGVyYWN0aXZlKSwgaWQsIG1hcCwgbW9kZWwpXG5cbiAgbGV0IHByaW1pdGl2ZVxuXG4gIGlmIChvbkRyYXcpIHtcbiAgICBwcmltaXRpdmUgPSBuZXcgKERyYXdIZWxwZXIuUG9seWxpbmVQcmltaXRpdmUgYXMgYW55KShcbiAgICAgIGNvbnN0cnVjdFNvbGlkTGluZVByaW1pdGl2ZSh7XG4gICAgICAgIGNvb3JkaW5hdGVzOiB0dXJmTGluZS5nZW9tZXRyeS5jb29yZGluYXRlcyxcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIGlkLFxuICAgICAgICBjb2xvcjogY29udHJhc3RpbmdDb2xvcixcbiAgICAgICAgYnVmZmVyOiBsaW5lV2lkdGgsXG4gICAgICB9KVxuICAgIClcbiAgICBwcmltaXRpdmUuc2V0RWRpdGFibGUoKVxuICAgIHByaW1pdGl2ZS5hZGRMaXN0ZW5lcignb25FZGl0ZWQnLCBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgY29uc3QgbGluZSA9IHBvc2l0aW9uc1RvTGluZShcbiAgICAgICAgZXZlbnQucG9zaXRpb25zLFxuICAgICAgICBtYXAuZ2V0TWFwKCkuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICApXG4gICAgICBvbkRyYXcobGluZSlcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGxldCBidWZmZXJlZExpbmUgPSB0dXJmTGluZVxuICAgIGNvbnN0IGlzQnVmZmVyZWQgPSBsaW5lV2lkdGggPiAwXG4gICAgaWYgKGlzQnVmZmVyZWQpIHtcbiAgICAgIHV0aWxpdHkuYWRqdXN0R2VvQ29vcmRzKHR1cmZMaW5lKVxuICAgICAgY29uc3QgYnVmZmVyZWQgPSBUdXJmLmJ1ZmZlcih0dXJmTGluZSwgTWF0aC5tYXgobGluZVdpZHRoLCAxKSwge1xuICAgICAgICB1bml0czogJ21ldGVycycsXG4gICAgICB9KVxuICAgICAgaWYgKCFidWZmZXJlZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGJ1ZmZlcmVkTGluZSA9IGJ1ZmZlcmVkXG4gICAgICAvLyBuZWVkIHRvIGFkanVzdCB0aGUgcG9pbnRzIGFnYWluIEFGVEVSIGJ1ZmZlcmluZywgc2luY2UgYnVmZmVyaW5nIHVuZG9lcyB0aGUgYW50aW1lcmlkaWFuIGFkanVzdG1lbnRzXG4gICAgICB1dGlsaXR5LmFkanVzdEdlb0Nvb3JkcyhidWZmZXJlZExpbmUpXG4gICAgfVxuXG4gICAgcHJpbWl0aXZlID0gbmV3IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24oKVxuICAgIHByaW1pdGl2ZS5pZCA9IGlkXG4gICAgcHJpbWl0aXZlLmxvY2F0aW9uSWQgPSBqc29uLmxvY2F0aW9uSWRcbiAgICBwcmltaXRpdmUuYWRkKFxuICAgICAgY29uc3RydWN0T3V0bGluZWRMaW5lUHJpbWl0aXZlKHtcbiAgICAgICAgY29vcmRpbmF0ZXM6IGJ1ZmZlcmVkTGluZS5nZW9tZXRyeS5jb29yZGluYXRlcyxcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIGlkLFxuICAgICAgICBpc0ludGVyYWN0aXZlLFxuICAgICAgfSlcbiAgICApXG4gICAgcHJpbWl0aXZlLmFkZChcbiAgICAgIGNvbnN0cnVjdERvdHRlZExpbmVQcmltaXRpdmUoe1xuICAgICAgICBjb29yZGluYXRlczogdHVyZkxpbmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMsXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBpc0ludGVyYWN0aXZlLFxuICAgICAgfSlcbiAgICApXG4gIH1cblxuICBtYXAuZ2V0TWFwKCkuc2NlbmUucHJpbWl0aXZlcy5hZGQocHJpbWl0aXZlKVxuICBtYXAuZ2V0TWFwKCkuc2NlbmUucmVxdWVzdFJlbmRlcigpXG59XG5cbmNvbnN0IHVzZUNhbWVyYU1hZ25pdHVkZSA9ICh7XG4gIG1hcCxcbn06IHtcbiAgbWFwOiBhbnlcbn0pOiBbbnVtYmVyLCBSZWFjdC5EaXNwYXRjaDxSZWFjdC5TZXRTdGF0ZUFjdGlvbjxudW1iZXI+Pl0gPT4ge1xuICBjb25zdCBbY2FtZXJhTWFnbml0dWRlLCBzZXRDYW1lcmFNYWduaXR1ZGVdID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW2lzTW92aW5nLCBzZXRJc01vdmluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgcmVuZGVyID0gdXNlUmVuZGVyKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzdGFydExpc3RlbmVyID0gKCkgPT4gc2V0SXNNb3ZpbmcodHJ1ZSlcbiAgICBjb25zdCBlbmRMaXN0ZW5lciA9ICgpID0+IHNldElzTW92aW5nKGZhbHNlKVxuICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVTdGFydC5hZGRFdmVudExpc3RlbmVyKHN0YXJ0TGlzdGVuZXIpXG4gICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZUVuZC5hZGRFdmVudExpc3RlbmVyKGVuZExpc3RlbmVyKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtYXA/LmdldE1hcCgpLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihzdGFydExpc3RlbmVyKVxuICAgICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZUVuZC5yZW1vdmVFdmVudExpc3RlbmVyKGVuZExpc3RlbmVyKVxuICAgIH1cbiAgfSwgW21hcF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTW92aW5nKSB7XG4gICAgICBjb25zdCBhbmltYXRpb25JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBzZXRDYW1lcmFNYWduaXR1ZGUoZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAoeyBtYXAgfSkpXG4gICAgICB9KVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbklkKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2lzTW92aW5nLCByZW5kZXJdKVxuICByZXR1cm4gW2NhbWVyYU1hZ25pdHVkZSwgc2V0Q2FtZXJhTWFnbml0dWRlXVxufVxuXG5jb25zdCB1c2VMaXN0ZW5Ub0xpbmVNb2RlbCA9ICh7XG4gIG1vZGVsLFxuICBtYXAsXG4gIG9uRHJhdyxcbiAgbmV3TGluZSxcbiAgdHJhbnNsYXRpb24sXG4gIGlzSW50ZXJhY3RpdmUsXG59OiB7XG4gIG1vZGVsOiBhbnlcbiAgbWFwOiBhbnlcbiAgb25EcmF3PzogKGRyYXdpbmdMb2NhdGlvbjogTGluZSkgPT4gdm9pZFxuICBuZXdMaW5lOiBMaW5lIHwgbnVsbFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBbY2FtZXJhTWFnbml0dWRlXSA9IHVzZUNhbWVyYU1hZ25pdHVkZSh7IG1hcCB9KVxuICBjb25zdCBbZHJhd25NYWduaXR1ZGUsIHNldERyYXduTWFnbml0dWRlXSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IGNhbGxiYWNrID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChtYXApIHtcbiAgICAgICAgaWYgKG5ld0xpbmUpIHtcbiAgICAgICAgICAvLyBDbG9uZSB0aGUgbW9kZWwgdG8gZGlzcGxheSB0aGUgbmV3IGxpbmUgZHJhd24gYmVjYXVzZSB3ZSBkb24ndFxuICAgICAgICAgIC8vIHdhbnQgdG8gdXBkYXRlIHRoZSBleGlzdGluZyBtb2RlbCB1bmxlc3MgdGhlIHVzZXIgY2xpY2tzIEFwcGx5LlxuICAgICAgICAgIGNvbnN0IG5ld01vZGVsID0gbW9kZWwuY2xvbmUoKVxuICAgICAgICAgIG5ld01vZGVsLnNldChuZXdMaW5lKVxuICAgICAgICAgIGRyYXdHZW9tZXRyeSh7XG4gICAgICAgICAgICBtYXAsXG4gICAgICAgICAgICBtb2RlbDogbmV3TW9kZWwsXG4gICAgICAgICAgICBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSksXG4gICAgICAgICAgICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgICAgICAgICAgIG9uRHJhdyxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgZHJhd0dlb21ldHJ5KHtcbiAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pLFxuICAgICAgICAgICAgc2V0RHJhd25NYWduaXR1ZGUsXG4gICAgICAgICAgICBvbkRyYXcsXG4gICAgICAgICAgICB0cmFuc2xhdGlvbixcbiAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21vZGVsLCBtYXAsIG5ld0xpbmUsIHRyYW5zbGF0aW9uLCBpc0ludGVyYWN0aXZlXSlcbiAgdXNlTGlzdGVuVG8obW9kZWwsICdjaGFuZ2U6bGluZSBjaGFuZ2U6bGluZVdpZHRoIGNoYW5nZTpsaW5lVW5pdHMnLCBjYWxsYmFjaylcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwICYmIG5lZWRzUmVkcmF3KHsgbWFwLCBkcmF3bk1hZ25pdHVkZSB9KSkge1xuICAgICAgY2FsbGJhY2soKVxuICAgIH1cbiAgfSwgW2NhbWVyYU1hZ25pdHVkZSwgZHJhd25NYWduaXR1ZGUsIGNhbGxiYWNrLCBtYXBdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNhbGxiYWNrKClcbiAgfSwgW2NhbGxiYWNrXSlcbn1cblxuY29uc3QgdXNlU3RhcnRNYXBEcmF3aW5nID0gKHtcbiAgbWFwLFxuICBtb2RlbCxcbiAgc2V0TmV3TGluZSxcbiAgb25EcmF3LFxufToge1xuICBtYXA6IGFueVxuICBtb2RlbDogYW55XG4gIHNldE5ld0xpbmU6IChuZXdMaW5lOiBMaW5lKSA9PiB2b2lkXG4gIG9uRHJhdzogKG5ld0xpbmU6IExpbmUpID0+IHZvaWRcbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwICYmIG1vZGVsKSB7XG4gICAgICBtYXAuZ2V0TWFwKCkuZHJhd0hlbHBlcltgc3RhcnREcmF3aW5nUG9seWxpbmVgXSh7XG4gICAgICAgIGNhbGxiYWNrOiAocG9zaXRpb25zOiBDZXNpdW0uQ2FydGVzaWFuM1tdKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhd25MaW5lID0gcG9zaXRpb25zVG9MaW5lKFxuICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgbWFwLmdldE1hcCgpLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICAgIClcbiAgICAgICAgICBjb25zdCBsaW5lID0gZHJhd25MaW5lLmxpbmVcbiAgICAgICAgICAvL3RoaXMgc2hvdWxkbid0IGV2ZXIgZ2V0IGhpdCBiZWNhdXNlIHRoZSBkcmF3IGxpYnJhcnkgc2hvdWxkIHByb3RlY3QgYWdhaW5zdCBpdCwgYnV0IGp1c3QgaW4gY2FzZSBpdCBkb2VzLCByZW1vdmUgdGhlIHBvaW50XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgbGluZS5sZW5ndGggPiAzICYmXG4gICAgICAgICAgICBsaW5lW2xpbmUubGVuZ3RoIC0gMV1bMF0gPT09IGxpbmVbbGluZS5sZW5ndGggLSAyXVswXSAmJlxuICAgICAgICAgICAgbGluZVtsaW5lLmxlbmd0aCAtIDFdWzFdID09PSBsaW5lW2xpbmUubGVuZ3RoIC0gMl1bMV1cbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxpbmUucG9wKClcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0TmV3TGluZShkcmF3bkxpbmUpXG4gICAgICAgICAgb25EcmF3KGRyYXduTGluZSlcbiAgICAgICAgfSxcbiAgICAgICAgbWF0ZXJpYWw6IENlc2l1bS5NYXRlcmlhbC5mcm9tVHlwZSgnQ29sb3InLCB7XG4gICAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29udHJhc3RpbmdDb2xvciksXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICB9XG4gIH0sIFttYXAsIG1vZGVsXSlcbn1cblxuZXhwb3J0IGNvbnN0IENlc2l1bUxpbmVEaXNwbGF5ID0gKHtcbiAgbWFwLFxuICBtb2RlbCxcbiAgb25EcmF3LFxuICB0cmFuc2xhdGlvbixcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICBvbkRyYXc/OiAobmV3TGluZTogTGluZSkgPT4gdm9pZFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICAvLyBVc2Ugc3RhdGUgdG8gc3RvcmUgdGhlIGxpbmUgZHJhd24gYnkgdGhlIHVzZXIgYmVmb3JlIHRoZXkgY2xpY2sgQXBwbHkgb3IgQ2FuY2VsLlxuICAvLyBXaGVuIHRoZSB1c2VyIGNsaWNrcyBEcmF3LCB0aGV5IGFyZSBhbGxvd2VkIHRvIGVkaXQgdGhlIGV4aXN0aW5nIGxpbmUgKGlmIGl0XG4gIC8vIGV4aXN0cyksIG9yIGRyYXcgYSBuZXcgbGluZS4gSWYgdGhleSBkcmF3IGEgbmV3IGxpbmUsIHNhdmUgaXQgdG8gc3RhdGUgdGhlbiBzaG93XG4gIC8vIGl0IGluc3RlYWQgb2YgdGhlIGRyYXcgbW9kZWwgYmVjYXVzZSB3ZSBkb24ndCB3YW50IHRvIHVwZGF0ZSB0aGUgZHJhdyBtb2RlbFxuICAvLyB1bmxlc3MgdGhlIHVzZXIgY2xpY2tzIEFwcGx5LlxuICBjb25zdCBbbmV3TGluZSwgc2V0TmV3TGluZV0gPSBSZWFjdC51c2VTdGF0ZTxMaW5lIHwgbnVsbD4obnVsbClcbiAgaWYgKG9uRHJhdykge1xuICAgIHVzZVN0YXJ0TWFwRHJhd2luZyh7IG1hcCwgbW9kZWwsIG9uRHJhdywgc2V0TmV3TGluZSB9KVxuICB9XG4gIHVzZUxpc3RlblRvTGluZU1vZGVsKHtcbiAgICBtYXAsXG4gICAgbW9kZWwsXG4gICAgb25EcmF3LFxuICAgIG5ld0xpbmUsXG4gICAgdHJhbnNsYXRpb24sXG4gICAgaXNJbnRlcmFjdGl2ZSxcbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKG1vZGVsICYmIG1hcCkge1xuICAgICAgICByZW1vdmVPbGREcmF3aW5nKHsgbWFwLCBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSkgfSlcbiAgICAgICAgbWFwLmdldE1hcCgpLmRyYXdIZWxwZXIuc3RvcERyYXdpbmcoKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21hcCwgbW9kZWxdKVxuICByZXR1cm4gPD48Lz5cbn1cbiJdfQ==