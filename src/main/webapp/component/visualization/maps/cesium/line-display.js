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
import { removeOldDrawing, makeOldDrawingNonEditable, } from './drawing-and-display';
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
    }, [model, map, newLine, translation, isInteractive]);
    useListenTo(model, 'change:line change:lineWidth change:lineUnits change:color', callback);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZS1kaXNwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvY2VzaXVtL2xpbmUtZGlzcGxheS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sYUFBYSxNQUFNLDhCQUE4QixDQUFBO0FBQ3hELG1KQUFtSjtBQUNuSixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUMvQyxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxVQUFVLE1BQU0sa0JBQWtCLENBQUE7QUFDekMsT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLENBQUE7QUFDbEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUMxRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFDcEQsT0FBTyxFQUNMLGdCQUFnQixFQUNoQix5QkFBeUIsR0FDMUIsTUFBTSx1QkFBdUIsQ0FBQTtBQUM5QixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNqRSxPQUFPLFVBQVUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUNyRSxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOERBQThELENBQUE7QUFFL0YsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUE7QUFFbkMsSUFBTSwwQkFBMEIsR0FBRyxPQUFPLENBQUE7QUFNMUMsSUFBTSwwQkFBMEIsR0FBRyxVQUFDLEVBQXFCO1FBQW5CLEdBQUcsU0FBQTtJQUN2QyxP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S0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBQ0Qsb0JBQW9CLENBQUM7UUFDbkIsR0FBRyxLQUFBO1FBQ0gsS0FBSyxPQUFBO1FBQ0wsTUFBTSxRQUFBO1FBQ04sT0FBTyxTQUFBO1FBQ1AsV0FBVyxhQUFBO1FBQ1gsYUFBYSxlQUFBO0tBQ2QsQ0FBQyxDQUFBO0lBQ0YsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLE9BQU87WUFDTCxJQUFJLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDakIsZ0JBQWdCLENBQUMsRUFBRSxHQUFHLEtBQUEsRUFBRSxFQUFFLEVBQUUsd0JBQXdCLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUNsRSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO1lBQ3ZDLENBQUM7UUFDSCxDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNoQixPQUFPLG1CQUFLLENBQUE7QUFDZCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBEaXN0YW5jZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2pzL0Rpc3RhbmNlVXRpbHMnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjZXNpLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBDZXNpdW0gZnJvbSAnY2VzaXVtL0J1aWxkL0Nlc2l1bS9DZXNpdW0nXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IF9jbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcbmltcG9ydCAqIGFzIFR1cmYgZnJvbSAnQHR1cmYvdHVyZidcbmltcG9ydCB7IHZhbGlkYXRlR2VvIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL3ZhbGlkYXRpb24nXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uLy4uLy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHsgdXNlUmVuZGVyIH0gZnJvbSAnLi4vLi4vLi4vaG9va3MvdXNlUmVuZGVyJ1xuaW1wb3J0IHtcbiAgcmVtb3ZlT2xkRHJhd2luZyxcbiAgbWFrZU9sZERyYXdpbmdOb25FZGl0YWJsZSxcbn0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0IHsgZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5IH0gZnJvbSAnLi4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCBEcmF3SGVscGVyIGZyb20gJy4uLy4uLy4uLy4uL2xpYi9jZXNpdW0tZHJhd2hlbHBlci9EcmF3SGVscGVyJ1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi91dGlsaXR5J1xuaW1wb3J0IHsgY29udHJhc3RpbmdDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9sb2NhdGlvbi1jb2xvci1zZWxlY3RvcidcbmltcG9ydCB7IFRyYW5zbGF0aW9uIH0gZnJvbSAnLi4vaW50ZXJhY3Rpb25zLnByb3ZpZGVyJ1xuY29uc3QgdG9EZWcgPSBDZXNpdW0uTWF0aC50b0RlZ3JlZXNcblxuY29uc3QgQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTEQgPSA4MDAwMDAwXG5cbnR5cGUgTGluZSA9IHtcbiAgbGluZTogW251bWJlciwgbnVtYmVyXVtdXG59XG5cbmNvbnN0IGdldEN1cnJlbnRNYWduaXR1ZGVGcm9tTWFwID0gKHsgbWFwIH06IHsgbWFwOiBhbnkgfSkgPT4ge1xuICByZXR1cm4gbWFwLmdldE1hcCgpLmNhbWVyYS5nZXRNYWduaXR1ZGUoKVxufVxuXG5jb25zdCBuZWVkc1JlZHJhdyA9ICh7XG4gIG1hcCxcbiAgZHJhd25NYWduaXR1ZGUsXG59OiB7XG4gIG1hcDogYW55XG4gIGRyYXduTWFnbml0dWRlOiBhbnlcbn0pID0+IHtcbiAgY29uc3QgY3VycmVudE1hZ25pdHVkZSA9IGdldEN1cnJlbnRNYWduaXR1ZGVGcm9tTWFwKHsgbWFwIH0pXG5cbiAgaWYgKFxuICAgIGN1cnJlbnRNYWduaXR1ZGUgPCBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRCAmJlxuICAgIGRyYXduTWFnbml0dWRlID4gQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTERcbiAgKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBpZiAoXG4gICAgY3VycmVudE1hZ25pdHVkZSA+IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEICYmXG4gICAgZHJhd25NYWduaXR1ZGUgPCBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRFxuICApIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RTb2xpZExpbmVQcmltaXRpdmUgPSAoe1xuICBjb29yZGluYXRlcyxcbiAgbW9kZWwsXG4gIGlkLFxuICBjb2xvcixcbiAgYnVmZmVyLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBjb29yZGluYXRlczogYW55XG4gIG1vZGVsOiBhbnlcbiAgaWQ6IHN0cmluZ1xuICBjb2xvcj86IHN0cmluZ1xuICBidWZmZXI/OiBudW1iZXJcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIGNvbnN0IF9jb2xvciA9IGNvbG9yIHx8IG1vZGVsLmdldCgnY29sb3InKVxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyA2IDogNCxcbiAgICBtYXRlcmlhbDogQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdDb2xvcicsIHtcbiAgICAgIGNvbG9yOiBpc0ludGVyYWN0aXZlXG4gICAgICAgID8gQ2VzaXVtLkNvbG9yLmZyb21Dc3NDb2xvclN0cmluZyhjb250cmFzdGluZ0NvbG9yKVxuICAgICAgICA6IF9jb2xvclxuICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoX2NvbG9yKVxuICAgICAgICA6IENlc2l1bS5Db2xvci5LSEFLSSxcbiAgICB9KSxcbiAgICBpZCxcbiAgICBwb3NpdGlvbnM6IENlc2l1bS5DYXJ0ZXNpYW4zLmZyb21EZWdyZWVzQXJyYXkoXy5mbGF0dGVuKGNvb3JkaW5hdGVzKSksXG4gICAgYnVmZmVyLFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RPdXRsaW5lZExpbmVQcmltaXRpdmUgPSAoe1xuICBjb29yZGluYXRlcyxcbiAgbW9kZWwsXG4gIGlkLFxuICBjb2xvcixcbiAgYnVmZmVyLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBjb29yZGluYXRlczogYW55XG4gIG1vZGVsOiBhbnlcbiAgaWQ6IHN0cmluZ1xuICBjb2xvcj86IHN0cmluZ1xuICBidWZmZXI/OiBudW1iZXJcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIGNvbnN0IF9jb2xvciA9IGNvbG9yIHx8IG1vZGVsLmdldCgnY29sb3InKVxuICByZXR1cm4ge1xuICAgIC4uLmNvbnN0cnVjdFNvbGlkTGluZVByaW1pdGl2ZSh7XG4gICAgICBjb29yZGluYXRlcyxcbiAgICAgIG1vZGVsLFxuICAgICAgaWQsXG4gICAgICBjb2xvcixcbiAgICAgIGJ1ZmZlcixcbiAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgfSksXG4gICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyAxMiA6IDgsXG4gICAgbWF0ZXJpYWw6IENlc2l1bS5NYXRlcmlhbC5mcm9tVHlwZSgnUG9seWxpbmVPdXRsaW5lJywge1xuICAgICAgY29sb3I6IGlzSW50ZXJhY3RpdmVcbiAgICAgICAgPyBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGNvbnRyYXN0aW5nQ29sb3IpXG4gICAgICAgIDogX2NvbG9yXG4gICAgICAgID8gQ2VzaXVtLkNvbG9yLmZyb21Dc3NDb2xvclN0cmluZyhfY29sb3IpXG4gICAgICAgIDogQ2VzaXVtLkNvbG9yLktIQUtJLFxuICAgICAgb3V0bGluZUNvbG9yOiBDZXNpdW0uQ29sb3IuV0hJVEUsXG4gICAgICBvdXRsaW5lV2lkdGg6IGlzSW50ZXJhY3RpdmUgPyA2IDogNCxcbiAgICB9KSxcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY29uc3RydWN0RG90dGVkTGluZVByaW1pdGl2ZSA9ICh7XG4gIGNvb3JkaW5hdGVzLFxuICBtb2RlbCxcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgY29vcmRpbmF0ZXM6IGFueVxuICBtb2RlbDogYW55XG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBjb2xvciA9IG1vZGVsLmdldCgnY29sb3InKVxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyAzIDogMixcbiAgICBtYXRlcmlhbDogQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdQb2x5bGluZURhc2gnLCB7XG4gICAgICBjb2xvcjogaXNJbnRlcmFjdGl2ZVxuICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29udHJhc3RpbmdDb2xvcilcbiAgICAgICAgOiBjb2xvclxuICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29sb3IpXG4gICAgICAgIDogQ2VzaXVtLkNvbG9yLktIQUtJLFxuICAgICAgZGFzaExlbmd0aDogMjAsXG4gICAgICBkYXNoUGF0dGVybjogMjU1LFxuICAgIH0pLFxuICAgIGlkOiAndXNlckRyYXdpbmcnLFxuICAgIHBvc2l0aW9uczogQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbURlZ3JlZXNBcnJheShfLmZsYXR0ZW4oY29vcmRpbmF0ZXMpKSxcbiAgfVxufVxuXG5jb25zdCBwb3NpdGlvbnNUb0xpbmUgPSAoXG4gIHBvc2l0aW9uczogQ2VzaXVtLkNhcnRlc2lhbjNbXSxcbiAgZWxsaXBzb2lkOiBDZXNpdW0uRWxsaXBzb2lkXG4pOiBMaW5lID0+IHtcbiAgcmV0dXJuIHtcbiAgICBsaW5lOiBwb3NpdGlvbnMubWFwKChjYXJ0UG9zKSA9PiB7XG4gICAgICBjb25zdCBsYXRMb24gPSBlbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoY2FydFBvcylcbiAgICAgIGNvbnN0IGxvbiA9IHRvRGVnKGxhdExvbi5sb25naXR1ZGUpXG4gICAgICBjb25zdCBsYXQgPSB0b0RlZyhsYXRMb24ubGF0aXR1ZGUpXG4gICAgICByZXR1cm4gW1xuICAgICAgICBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChsb24pLFxuICAgICAgICBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChsYXQpLFxuICAgICAgXVxuICAgIH0pLFxuICB9XG59XG5cbmNvbnN0IGRyYXdHZW9tZXRyeSA9ICh7XG4gIG1vZGVsLFxuICBtYXAsXG4gIGlkLFxuICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgb25EcmF3LFxuICB0cmFuc2xhdGlvbixcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgbW9kZWw6IGFueVxuICBtYXA6IGFueVxuICBpZDogYW55XG4gIHNldERyYXduTWFnbml0dWRlOiAobnVtYmVyOiBhbnkpID0+IHZvaWRcbiAgb25EcmF3PzogKGRyYXdpbmdMb2NhdGlvbjogTGluZSkgPT4gdm9pZFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICBjb25zdCBqc29uID0gbW9kZWwudG9KU09OKClcbiAgbGV0IGxpbmVQb2ludHMgPSBqc29uLmxpbmVcbiAgaWYgKFxuICAgIGxpbmVQb2ludHMgPT09IHVuZGVmaW5lZCB8fFxuICAgIHZhbGlkYXRlR2VvKCdsaW5lJywgSlNPTi5zdHJpbmdpZnkobGluZVBvaW50cykpPy5lcnJvclxuICApIHtcbiAgICBtYXAuZ2V0TWFwKCkuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBDcmVhdGUgYSBkZWVwIGNvcHkgc2luY2Ugd2UgbWF5IG1vZGlmeSBzb21lIG9mIHRoZXNlIHBvc2l0aW9ucyBmb3IgZGlzcGxheSBwdXJwb3Nlc1xuICBsaW5lUG9pbnRzID0gX2Nsb25lRGVlcChqc29uLmxpbmUpXG5cbiAgbGluZVBvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICBwb2ludFswXSArPSB0cmFuc2xhdGlvbi5sb25naXR1ZGVcbiAgICAgIHBvaW50WzFdICs9IHRyYW5zbGF0aW9uLmxhdGl0dWRlXG4gICAgfVxuICAgIHBvaW50WzBdID0gRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQocG9pbnRbMF0pXG4gICAgcG9pbnRbMV0gPSBEaXN0YW5jZVV0aWxzLmNvb3JkaW5hdGVSb3VuZChwb2ludFsxXSlcbiAgfSlcblxuICBjb25zdCBzZXRBcnIgPSBfLnVuaXEobGluZVBvaW50cylcbiAgaWYgKHNldEFyci5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCB0dXJmTGluZSA9IFR1cmYubGluZVN0cmluZyhzZXRBcnIpIGFzXG4gICAgfCBHZW9KU09OLkZlYXR1cmU8R2VvSlNPTi5MaW5lU3RyaW5nPlxuICAgIHwgR2VvSlNPTi5GZWF0dXJlPEdlb0pTT04uUG9seWdvbiB8IEdlb0pTT04uTXVsdGlQb2x5Z29uPlxuICBjb25zdCBsaW5lV2lkdGggPSBEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlSW5NZXRlcnMoXG4gICAganNvbi5saW5lV2lkdGgsXG4gICAgbW9kZWwuZ2V0KCdsaW5lVW5pdHMnKVxuICApXG4gIGNvbnN0IGNhbWVyYU1hZ25pdHVkZSA9IG1hcC5nZXRNYXAoKS5jYW1lcmEuZ2V0TWFnbml0dWRlKClcbiAgc2V0RHJhd25NYWduaXR1ZGUoY2FtZXJhTWFnbml0dWRlKVxuXG4gIGxldCBwcmltaXRpdmVcblxuICBpZiAob25EcmF3KSB7XG4gICAgcHJpbWl0aXZlID0gbmV3IChEcmF3SGVscGVyLlBvbHlsaW5lUHJpbWl0aXZlIGFzIGFueSkoXG4gICAgICBjb25zdHJ1Y3RTb2xpZExpbmVQcmltaXRpdmUoe1xuICAgICAgICBjb29yZGluYXRlczogdHVyZkxpbmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMsXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBpZCxcbiAgICAgICAgY29sb3I6IGNvbnRyYXN0aW5nQ29sb3IsXG4gICAgICAgIGJ1ZmZlcjogbGluZVdpZHRoLFxuICAgICAgfSlcbiAgICApXG4gICAgcHJpbWl0aXZlLnNldEVkaXRhYmxlKClcbiAgICBwcmltaXRpdmUuYWRkTGlzdGVuZXIoJ29uRWRpdGVkJywgZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcbiAgICAgIGNvbnN0IGxpbmUgPSBwb3NpdGlvbnNUb0xpbmUoXG4gICAgICAgIGV2ZW50LnBvc2l0aW9ucyxcbiAgICAgICAgbWFwLmdldE1hcCgpLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgKVxuICAgICAgb25EcmF3KGxpbmUpXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBsZXQgYnVmZmVyZWRMaW5lID0gdHVyZkxpbmVcbiAgICBjb25zdCBpc0J1ZmZlcmVkID0gbGluZVdpZHRoID4gMFxuICAgIGlmIChpc0J1ZmZlcmVkKSB7XG4gICAgICB1dGlsaXR5LmFkanVzdEdlb0Nvb3Jkcyh0dXJmTGluZSlcbiAgICAgIGNvbnN0IGJ1ZmZlcmVkID0gVHVyZi5idWZmZXIodHVyZkxpbmUsIE1hdGgubWF4KGxpbmVXaWR0aCwgMSksIHtcbiAgICAgICAgdW5pdHM6ICdtZXRlcnMnLFxuICAgICAgfSlcbiAgICAgIGlmICghYnVmZmVyZWQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBidWZmZXJlZExpbmUgPSBidWZmZXJlZFxuICAgICAgLy8gbmVlZCB0byBhZGp1c3QgdGhlIHBvaW50cyBhZ2FpbiBBRlRFUiBidWZmZXJpbmcsIHNpbmNlIGJ1ZmZlcmluZyB1bmRvZXMgdGhlIGFudGltZXJpZGlhbiBhZGp1c3RtZW50c1xuICAgICAgdXRpbGl0eS5hZGp1c3RHZW9Db29yZHMoYnVmZmVyZWRMaW5lKVxuICAgIH1cblxuICAgIHByaW1pdGl2ZSA9IG5ldyBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKClcbiAgICBwcmltaXRpdmUuaWQgPSBpZFxuICAgIHByaW1pdGl2ZS5sb2NhdGlvbklkID0ganNvbi5sb2NhdGlvbklkXG4gICAgcHJpbWl0aXZlLmFkZChcbiAgICAgIGNvbnN0cnVjdE91dGxpbmVkTGluZVByaW1pdGl2ZSh7XG4gICAgICAgIGNvb3JkaW5hdGVzOiBidWZmZXJlZExpbmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMsXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBpZCxcbiAgICAgICAgaXNJbnRlcmFjdGl2ZSxcbiAgICAgIH0pXG4gICAgKVxuICAgIHByaW1pdGl2ZS5hZGQoXG4gICAgICBjb25zdHJ1Y3REb3R0ZWRMaW5lUHJpbWl0aXZlKHtcbiAgICAgICAgY29vcmRpbmF0ZXM6IHR1cmZMaW5lLmdlb21ldHJ5LmNvb3JkaW5hdGVzLFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgaXNJbnRlcmFjdGl2ZSxcbiAgICAgIH0pXG4gICAgKVxuICB9XG5cbiAgbWFwLmdldE1hcCgpLnNjZW5lLnByaW1pdGl2ZXMuYWRkKHByaW1pdGl2ZSlcbiAgbWFwLmdldE1hcCgpLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxufVxuXG5jb25zdCB1c2VDYW1lcmFNYWduaXR1ZGUgPSAoe1xuICBtYXAsXG59OiB7XG4gIG1hcDogYW55XG59KTogW251bWJlciwgUmVhY3QuRGlzcGF0Y2g8UmVhY3QuU2V0U3RhdGVBY3Rpb248bnVtYmVyPj5dID0+IHtcbiAgY29uc3QgW2NhbWVyYU1hZ25pdHVkZSwgc2V0Q2FtZXJhTWFnbml0dWRlXSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IFtpc01vdmluZywgc2V0SXNNb3ZpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHJlbmRlciA9IHVzZVJlbmRlcigpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc3RhcnRMaXN0ZW5lciA9ICgpID0+IHNldElzTW92aW5nKHRydWUpXG4gICAgY29uc3QgZW5kTGlzdGVuZXIgPSAoKSA9PiBzZXRJc01vdmluZyhmYWxzZSlcbiAgICBtYXA/LmdldE1hcCgpLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQuYWRkRXZlbnRMaXN0ZW5lcihzdGFydExpc3RlbmVyKVxuICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVFbmQuYWRkRXZlbnRMaXN0ZW5lcihlbmRMaXN0ZW5lcilcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZVN0YXJ0LnJlbW92ZUV2ZW50TGlzdGVuZXIoc3RhcnRMaXN0ZW5lcilcbiAgICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVFbmQucmVtb3ZlRXZlbnRMaXN0ZW5lcihlbmRMaXN0ZW5lcilcbiAgICB9XG4gIH0sIFttYXBdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc01vdmluZykge1xuICAgICAgY29uc3QgYW5pbWF0aW9uSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgc2V0Q2FtZXJhTWFnbml0dWRlKGdldEN1cnJlbnRNYWduaXR1ZGVGcm9tTWFwKHsgbWFwIH0pKVxuICAgICAgfSlcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb25JZClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtpc01vdmluZywgcmVuZGVyXSlcbiAgcmV0dXJuIFtjYW1lcmFNYWduaXR1ZGUsIHNldENhbWVyYU1hZ25pdHVkZV1cbn1cblxuY29uc3QgdXNlTGlzdGVuVG9MaW5lTW9kZWwgPSAoe1xuICBtb2RlbCxcbiAgbWFwLFxuICBvbkRyYXcsXG4gIG5ld0xpbmUsXG4gIHRyYW5zbGF0aW9uLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBtb2RlbDogYW55XG4gIG1hcDogYW55XG4gIG9uRHJhdz86IChkcmF3aW5nTG9jYXRpb246IExpbmUpID0+IHZvaWRcbiAgbmV3TGluZTogTGluZSB8IG51bGxcbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhbiAvLyBub3RlOiAnaW50ZXJhY3RpdmUnIGlzIGRpZmZlcmVudCBmcm9tIGRyYXdpbmdcbn0pID0+IHtcbiAgY29uc3QgW2NhbWVyYU1hZ25pdHVkZV0gPSB1c2VDYW1lcmFNYWduaXR1ZGUoeyBtYXAgfSlcbiAgY29uc3QgW2RyYXduTWFnbml0dWRlLCBzZXREcmF3bk1hZ25pdHVkZV0gPSBSZWFjdC51c2VTdGF0ZSgwKVxuICBjb25zdCBjYWxsYmFjayA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobWFwKSB7XG4gICAgICAgIGlmIChuZXdMaW5lKSB7XG4gICAgICAgICAgLy8gQ2xvbmUgdGhlIG1vZGVsIHRvIGRpc3BsYXkgdGhlIG5ldyBsaW5lIGRyYXduIGJlY2F1c2Ugd2UgZG9uJ3RcbiAgICAgICAgICAvLyB3YW50IHRvIHVwZGF0ZSB0aGUgZXhpc3RpbmcgbW9kZWwgdW5sZXNzIHRoZSB1c2VyIGNsaWNrcyBBcHBseS5cbiAgICAgICAgICBjb25zdCBuZXdNb2RlbCA9IG1vZGVsLmNsb25lKClcbiAgICAgICAgICBuZXdNb2RlbC5zZXQobmV3TGluZSlcbiAgICAgICAgICBtYWtlT2xkRHJhd2luZ05vbkVkaXRhYmxlKHtcbiAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGRyYXdHZW9tZXRyeSh7XG4gICAgICAgICAgICBtYXAsXG4gICAgICAgICAgICBtb2RlbDogbmV3TW9kZWwsXG4gICAgICAgICAgICBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSksXG4gICAgICAgICAgICBzZXREcmF3bk1hZ25pdHVkZSxcbiAgICAgICAgICAgIG9uRHJhdyxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgcmVtb3ZlT2xkRHJhd2luZyh7IG1hcCwgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pIH0pXG4gICAgICAgICAgZHJhd0dlb21ldHJ5KHtcbiAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pLFxuICAgICAgICAgICAgc2V0RHJhd25NYWduaXR1ZGUsXG4gICAgICAgICAgICBvbkRyYXcsXG4gICAgICAgICAgICB0cmFuc2xhdGlvbixcbiAgICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21vZGVsLCBtYXAsIG5ld0xpbmUsIHRyYW5zbGF0aW9uLCBpc0ludGVyYWN0aXZlXSlcbiAgdXNlTGlzdGVuVG8oXG4gICAgbW9kZWwsXG4gICAgJ2NoYW5nZTpsaW5lIGNoYW5nZTpsaW5lV2lkdGggY2hhbmdlOmxpbmVVbml0cyBjaGFuZ2U6Y29sb3InLFxuICAgIGNhbGxiYWNrXG4gIClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwICYmIG5lZWRzUmVkcmF3KHsgbWFwLCBkcmF3bk1hZ25pdHVkZSB9KSkge1xuICAgICAgY2FsbGJhY2soKVxuICAgIH1cbiAgfSwgW2NhbWVyYU1hZ25pdHVkZSwgZHJhd25NYWduaXR1ZGUsIGNhbGxiYWNrLCBtYXBdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNhbGxiYWNrKClcbiAgfSwgW2NhbGxiYWNrXSlcbn1cblxuY29uc3QgdXNlU3RhcnRNYXBEcmF3aW5nID0gKHtcbiAgbWFwLFxuICBtb2RlbCxcbiAgc2V0TmV3TGluZSxcbiAgb25EcmF3LFxufToge1xuICBtYXA6IGFueVxuICBtb2RlbDogYW55XG4gIHNldE5ld0xpbmU6IChuZXdMaW5lOiBMaW5lKSA9PiB2b2lkXG4gIG9uRHJhdzogKG5ld0xpbmU6IExpbmUpID0+IHZvaWRcbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwICYmIG1vZGVsKSB7XG4gICAgICBtYXAuZ2V0TWFwKCkuZHJhd0hlbHBlcltgc3RhcnREcmF3aW5nUG9seWxpbmVgXSh7XG4gICAgICAgIGNhbGxiYWNrOiAocG9zaXRpb25zOiBDZXNpdW0uQ2FydGVzaWFuM1tdKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhd25MaW5lID0gcG9zaXRpb25zVG9MaW5lKFxuICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgbWFwLmdldE1hcCgpLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICAgIClcbiAgICAgICAgICBjb25zdCBsaW5lID0gZHJhd25MaW5lLmxpbmVcbiAgICAgICAgICAvL3RoaXMgc2hvdWxkbid0IGV2ZXIgZ2V0IGhpdCBiZWNhdXNlIHRoZSBkcmF3IGxpYnJhcnkgc2hvdWxkIHByb3RlY3QgYWdhaW5zdCBpdCwgYnV0IGp1c3QgaW4gY2FzZSBpdCBkb2VzLCByZW1vdmUgdGhlIHBvaW50XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgbGluZS5sZW5ndGggPiAzICYmXG4gICAgICAgICAgICBsaW5lW2xpbmUubGVuZ3RoIC0gMV1bMF0gPT09IGxpbmVbbGluZS5sZW5ndGggLSAyXVswXSAmJlxuICAgICAgICAgICAgbGluZVtsaW5lLmxlbmd0aCAtIDFdWzFdID09PSBsaW5lW2xpbmUubGVuZ3RoIC0gMl1bMV1cbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxpbmUucG9wKClcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0TmV3TGluZShkcmF3bkxpbmUpXG4gICAgICAgICAgb25EcmF3KGRyYXduTGluZSlcbiAgICAgICAgfSxcbiAgICAgICAgbWF0ZXJpYWw6IENlc2l1bS5NYXRlcmlhbC5mcm9tVHlwZSgnQ29sb3InLCB7XG4gICAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29udHJhc3RpbmdDb2xvciksXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICB9XG4gIH0sIFttYXAsIG1vZGVsXSlcbn1cblxuZXhwb3J0IGNvbnN0IENlc2l1bUxpbmVEaXNwbGF5ID0gKHtcbiAgbWFwLFxuICBtb2RlbCxcbiAgb25EcmF3LFxuICB0cmFuc2xhdGlvbixcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICBvbkRyYXc/OiAobmV3TGluZTogTGluZSkgPT4gdm9pZFxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuIC8vIG5vdGU6ICdpbnRlcmFjdGl2ZScgaXMgZGlmZmVyZW50IGZyb20gZHJhd2luZ1xufSkgPT4ge1xuICAvLyBVc2Ugc3RhdGUgdG8gc3RvcmUgdGhlIGxpbmUgZHJhd24gYnkgdGhlIHVzZXIgYmVmb3JlIHRoZXkgY2xpY2sgQXBwbHkgb3IgQ2FuY2VsLlxuICAvLyBXaGVuIHRoZSB1c2VyIGNsaWNrcyBEcmF3LCB0aGV5IGFyZSBhbGxvd2VkIHRvIGVkaXQgdGhlIGV4aXN0aW5nIGxpbmUgKGlmIGl0XG4gIC8vIGV4aXN0cyksIG9yIGRyYXcgYSBuZXcgbGluZS4gSWYgdGhleSBkcmF3IGEgbmV3IGxpbmUsIHNhdmUgaXQgdG8gc3RhdGUgdGhlbiBzaG93XG4gIC8vIGl0IGluc3RlYWQgb2YgdGhlIGRyYXcgbW9kZWwgYmVjYXVzZSB3ZSBkb24ndCB3YW50IHRvIHVwZGF0ZSB0aGUgZHJhdyBtb2RlbFxuICAvLyB1bmxlc3MgdGhlIHVzZXIgY2xpY2tzIEFwcGx5LlxuICBjb25zdCBbbmV3TGluZSwgc2V0TmV3TGluZV0gPSBSZWFjdC51c2VTdGF0ZTxMaW5lIHwgbnVsbD4obnVsbClcbiAgaWYgKG9uRHJhdykge1xuICAgIHVzZVN0YXJ0TWFwRHJhd2luZyh7IG1hcCwgbW9kZWwsIG9uRHJhdywgc2V0TmV3TGluZSB9KVxuICB9XG4gIHVzZUxpc3RlblRvTGluZU1vZGVsKHtcbiAgICBtYXAsXG4gICAgbW9kZWwsXG4gICAgb25EcmF3LFxuICAgIG5ld0xpbmUsXG4gICAgdHJhbnNsYXRpb24sXG4gICAgaXNJbnRlcmFjdGl2ZSxcbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKG1vZGVsICYmIG1hcCkge1xuICAgICAgICByZW1vdmVPbGREcmF3aW5nKHsgbWFwLCBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSkgfSlcbiAgICAgICAgbWFwLmdldE1hcCgpLmRyYXdIZWxwZXIuc3RvcERyYXdpbmcoKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21hcCwgbW9kZWxdKVxuICByZXR1cm4gPD48Lz5cbn1cbiJdfQ==