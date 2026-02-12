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
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium';
import _ from 'underscore';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { useRender } from '../../../hooks/useRender';
import { removeOldDrawing, makeOldDrawingNonEditable, } from './drawing-and-display';
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
    }, [model, map, newBbox, translation, isInteractive]);
    useListenTo(model, 'change:mapNorth change:mapSouth change:mapEast change:mapWest change:color', callback);
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
    return _jsx(_Fragment, {});
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmJveC1kaXNwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvY2VzaXVtL2Jib3gtZGlzcGxheS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLG1KQUFtSjtBQUNuSixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUMvQyxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNwRCxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLHlCQUF5QixHQUMxQixNQUFNLHVCQUF1QixDQUFBO0FBQzlCLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2pFLE9BQU8sVUFBVSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3JFLE9BQU8sYUFBYSxNQUFNLDhCQUE4QixDQUFBO0FBQ3hELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDhEQUE4RCxDQUFBO0FBRS9GLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFBO0FBRW5DLElBQU0sMEJBQTBCLEdBQUcsT0FBTyxDQUFBO0FBRTFDLElBQU0sMEJBQTBCLEdBQUcsVUFBQyxFQUFxQjtRQUFuQixHQUFHLFNBQUE7SUFDdkMsT0FBTyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFBO0FBQzNDLENBQUMsQ0FBQTtBQUVELElBQU0sV0FBVyxHQUFHLFVBQUMsRUFNcEI7UUFMQyxHQUFHLFNBQUEsRUFDSCxjQUFjLG9CQUFBO0lBS2QsSUFBTSxn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QUE7SUFDeEQsQ0FBQztJQUNELGdCQUFnQixDQUFDLEVBQUUsR0FBRyxLQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUUsYUFBYSxlQUFBLEVBQUUsQ0FBQyxDQUFBO0lBQzdFLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxPQUFPO1lBQ0wsSUFBSSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ2pCLGdCQUFnQixDQUFDLEVBQUUsR0FBRyxLQUFBLEVBQUUsRUFBRSxFQUFFLHdCQUF3QixDQUFDLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtnQkFDbEUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtZQUN2QyxDQUFDO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDaEIsT0FBTyxtQkFBSyxDQUFBO0FBQ2QsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjZXNpLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBDZXNpdW0gZnJvbSAnY2VzaXVtL0J1aWxkL0Nlc2l1bS9DZXNpdW0nXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHsgdXNlTGlzdGVuVG8gfSBmcm9tICcuLi8uLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IHVzZVJlbmRlciB9IGZyb20gJy4uLy4uLy4uL2hvb2tzL3VzZVJlbmRlcidcbmltcG9ydCB7XG4gIHJlbW92ZU9sZERyYXdpbmcsXG4gIG1ha2VPbGREcmF3aW5nTm9uRWRpdGFibGUsXG59IGZyb20gJy4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCB7IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSB9IGZyb20gJy4uL2RyYXdpbmctYW5kLWRpc3BsYXknXG5pbXBvcnQgRHJhd0hlbHBlciBmcm9tICcuLi8uLi8uLi8uLi9saWIvY2VzaXVtLWRyYXdoZWxwZXIvRHJhd0hlbHBlcidcbmltcG9ydCBEaXN0YW5jZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2pzL0Rpc3RhbmNlVXRpbHMnXG5pbXBvcnQgeyBjb250cmFzdGluZ0NvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L2xvY2F0aW9uL2xvY2F0aW9uLWNvbG9yLXNlbGVjdG9yJ1xuaW1wb3J0IHsgVHJhbnNsYXRpb24gfSBmcm9tICcuLi9pbnRlcmFjdGlvbnMucHJvdmlkZXInXG5jb25zdCB0b0RlZyA9IENlc2l1bS5NYXRoLnRvRGVncmVlc1xuXG5jb25zdCBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRCA9IDgwMDAwMDBcblxuY29uc3QgZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAgPSAoeyBtYXAgfTogeyBtYXA6IGFueSB9KSA9PiB7XG4gIHJldHVybiBtYXAuZ2V0TWFwKCkuY2FtZXJhLmdldE1hZ25pdHVkZSgpXG59XG5cbmNvbnN0IG5lZWRzUmVkcmF3ID0gKHtcbiAgbWFwLFxuICBkcmF3bk1hZ25pdHVkZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgZHJhd25NYWduaXR1ZGU6IGFueVxufSkgPT4ge1xuICBjb25zdCBjdXJyZW50TWFnbml0dWRlID0gZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAoeyBtYXAgfSlcblxuICBpZiAoXG4gICAgY3VycmVudE1hZ25pdHVkZSA8IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEICYmXG4gICAgZHJhd25NYWduaXR1ZGUgPiBDQU1FUkFfTUFHTklUVURFX1RIUkVTSE9MRFxuICApIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGlmIChcbiAgICBjdXJyZW50TWFnbml0dWRlID4gQ0FNRVJBX01BR05JVFVERV9USFJFU0hPTEQgJiZcbiAgICBkcmF3bk1hZ25pdHVkZSA8IENBTUVSQV9NQUdOSVRVREVfVEhSRVNIT0xEXG4gICkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuY29uc3QgbW9kZWxUb1JlY3RhbmdsZSA9ICh7IG1vZGVsIH06IHsgbW9kZWw6IGFueSB9KSA9PiB7XG4gIGNvbnN0IHRvUmFkID0gQ2VzaXVtLk1hdGgudG9SYWRpYW5zXG4gIGNvbnN0IG9iaiA9IG1vZGVsLnRvSlNPTigpXG4gIF8uZWFjaChvYmosICh2YWw6IGFueSwga2V5OiBhbnkpID0+IHtcbiAgICBvYmpba2V5XSA9IHRvUmFkKHZhbClcbiAgfSlcbiAgY29uc3QgcmVjdGFuZ2xlID0gbmV3IENlc2l1bS5SZWN0YW5nbGUoKVxuICBpZiAoXG4gICAgb2JqLm5vcnRoID09PSB1bmRlZmluZWQgfHxcbiAgICBpc05hTihvYmoubm9ydGgpIHx8XG4gICAgb2JqLnNvdXRoID09PSB1bmRlZmluZWQgfHxcbiAgICBpc05hTihvYmouc291dGgpIHx8XG4gICAgb2JqLmVhc3QgPT09IHVuZGVmaW5lZCB8fFxuICAgIGlzTmFOKG9iai5lYXN0KSB8fFxuICAgIG9iai53ZXN0ID09PSB1bmRlZmluZWQgfHxcbiAgICBpc05hTihvYmoud2VzdClcbiAgKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJlY3RhbmdsZS5ub3J0aCA9IG9iai5tYXBOb3J0aFxuICByZWN0YW5nbGUuc291dGggPSBvYmoubWFwU291dGhcbiAgcmVjdGFuZ2xlLmVhc3QgPSBvYmoubWFwRWFzdFxuICByZWN0YW5nbGUud2VzdCA9IG9iai5tYXBXZXN0XG4gIHJldHVybiByZWN0YW5nbGVcbn1cblxudHlwZSBCQm94ID0ge1xuICBub3J0aDogbnVtYmVyXG4gIHNvdXRoOiBudW1iZXJcbiAgZWFzdDogbnVtYmVyXG4gIHdlc3Q6IG51bWJlclxufVxuXG5jb25zdCByZWN0YW5nbGVUb0Jib3ggPSAocmVjdGFuZ2xlOiBDZXNpdW0uUmVjdGFuZ2xlKTogQkJveCA9PiB7XG4gIGNvbnN0IG5vcnRoID0gdG9EZWcocmVjdGFuZ2xlLm5vcnRoKVxuICBjb25zdCBzb3V0aCA9IHRvRGVnKHJlY3RhbmdsZS5zb3V0aClcbiAgY29uc3QgZWFzdCA9IHRvRGVnKHJlY3RhbmdsZS5lYXN0KVxuICBjb25zdCB3ZXN0ID0gdG9EZWcocmVjdGFuZ2xlLndlc3QpXG4gIHJldHVybiB7XG4gICAgbm9ydGg6IERpc3RhbmNlVXRpbHMuY29vcmRpbmF0ZVJvdW5kKG5vcnRoKSxcbiAgICBzb3V0aDogRGlzdGFuY2VVdGlscy5jb29yZGluYXRlUm91bmQoc291dGgpLFxuICAgIGVhc3Q6IERpc3RhbmNlVXRpbHMuY29vcmRpbmF0ZVJvdW5kKGVhc3QpLFxuICAgIHdlc3Q6IERpc3RhbmNlVXRpbHMuY29vcmRpbmF0ZVJvdW5kKHdlc3QpLFxuICB9XG59XG5cbmNvbnN0IGRyYXdHZW9tZXRyeSA9ICh7XG4gIG1vZGVsLFxuICBtYXAsXG4gIGlkLFxuICBvbkRyYXcsXG4gIHRyYW5zbGF0aW9uLFxuICBpc0ludGVyYWN0aXZlLFxufToge1xuICBtb2RlbDogYW55XG4gIG1hcDogYW55XG4gIGlkOiBhbnlcbiAgc2V0RHJhd25NYWduaXR1ZGU6IChudW1iZXI6IGFueSkgPT4gdm9pZFxuICBvbkRyYXc/OiAoZHJhd2luZ0xvY2F0aW9uOiBCQm94KSA9PiB2b2lkXG4gIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb25cbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIGNvbnN0IHJlY3RhbmdsZSA9IG1vZGVsVG9SZWN0YW5nbGUoeyBtb2RlbCB9KVxuICBpZiAoXG4gICAgIXJlY3RhbmdsZSB8fFxuICAgIFtyZWN0YW5nbGUubm9ydGgsIHJlY3RhbmdsZS5zb3V0aCwgcmVjdGFuZ2xlLndlc3QsIHJlY3RhbmdsZS5lYXN0XS5zb21lKFxuICAgICAgKGNvb3JkaW5hdGUpID0+IGlzTmFOKGNvb3JkaW5hdGUpXG4gICAgKSB8fFxuICAgIHJlY3RhbmdsZS5ub3J0aCA8PSByZWN0YW5nbGUuc291dGggfHxcbiAgICByZWN0YW5nbGUuZWFzdCA9PT0gcmVjdGFuZ2xlLndlc3RcbiAgKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCBjb29yZGluYXRlcyA9IFtcbiAgICBbcmVjdGFuZ2xlLmVhc3QsIHJlY3RhbmdsZS5ub3J0aF0sXG4gICAgW3JlY3RhbmdsZS53ZXN0LCByZWN0YW5nbGUubm9ydGhdLFxuICAgIFtyZWN0YW5nbGUud2VzdCwgcmVjdGFuZ2xlLnNvdXRoXSxcbiAgICBbcmVjdGFuZ2xlLmVhc3QsIHJlY3RhbmdsZS5zb3V0aF0sXG4gICAgW3JlY3RhbmdsZS5lYXN0LCByZWN0YW5nbGUubm9ydGhdLFxuICBdXG5cbiAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgY29uc3QgbG9uZ2l0dWRlUmFkaWFucyA9IENlc2l1bS5NYXRoLnRvUmFkaWFucyh0cmFuc2xhdGlvbi5sb25naXR1ZGUpXG4gICAgY29uc3QgbGF0aXR1ZGVSYWRpYW5zID0gQ2VzaXVtLk1hdGgudG9SYWRpYW5zKHRyYW5zbGF0aW9uLmxhdGl0dWRlKVxuXG4gICAgZm9yIChjb25zdCBjb29yZCBvZiBjb29yZGluYXRlcykge1xuICAgICAgY29vcmRbMF0gKz0gbG9uZ2l0dWRlUmFkaWFuc1xuICAgICAgY29vcmRbMV0gKz0gbGF0aXR1ZGVSYWRpYW5zXG4gICAgfVxuICB9XG5cbiAgbGV0IHByaW1pdGl2ZVxuXG4gIGlmIChvbkRyYXcpIHtcbiAgICBwcmltaXRpdmUgPSBuZXcgKERyYXdIZWxwZXIuRXh0ZW50UHJpbWl0aXZlIGFzIGFueSkoe1xuICAgICAgZXh0ZW50OiByZWN0YW5nbGUsXG4gICAgICBoZWlnaHQ6IDAsXG4gICAgICBpZCxcbiAgICAgIG1hdGVyaWFsOiBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoJ0NvbG9yJywge1xuICAgICAgICBjb2xvcjogQ2VzaXVtLkNvbG9yLmZyb21BbHBoYShjb250cmFzdGluZ0NvbG9yLCAwLjIpLFxuICAgICAgfSksXG4gICAgfSlcbiAgICBwcmltaXRpdmUuc2V0RWRpdGFibGUoKVxuICAgIHByaW1pdGl2ZS5hZGRMaXN0ZW5lcignb25FZGl0ZWQnLCBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgY29uc3QgcmVjdGFuZ2xlID0gZXZlbnQuZXh0ZW50XG4gICAgICBjb25zdCBiYm94ID0gcmVjdGFuZ2xlVG9CYm94KHJlY3RhbmdsZSlcbiAgICAgIG9uRHJhdyhiYm94KVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY29sb3IgPSBtb2RlbC5nZXQoJ2NvbG9yJylcbiAgICBwcmltaXRpdmUgPSBuZXcgQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbigpXG4gICAgcHJpbWl0aXZlLmFkZCh7XG4gICAgICB3aWR0aDogaXNJbnRlcmFjdGl2ZSA/IDEyIDogOCxcbiAgICAgIG1hdGVyaWFsOiBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoJ1BvbHlsaW5lT3V0bGluZScsIHtcbiAgICAgICAgY29sb3I6IGlzSW50ZXJhY3RpdmVcbiAgICAgICAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29udHJhc3RpbmdDb2xvcilcbiAgICAgICAgICA6IGNvbG9yXG4gICAgICAgICAgPyBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGNvbG9yKVxuICAgICAgICAgIDogQ2VzaXVtLkNvbG9yLktIQUtJLFxuICAgICAgICBvdXRsaW5lQ29sb3I6IENlc2l1bS5Db2xvci5XSElURSxcbiAgICAgICAgb3V0bGluZVdpZHRoOiBpc0ludGVyYWN0aXZlID8gNiA6IDQsXG4gICAgICB9KSxcbiAgICAgIGlkOiAndXNlckRyYXdpbmcnLFxuICAgICAgcG9zaXRpb25zOiBDZXNpdW0uQ2FydGVzaWFuMy5mcm9tUmFkaWFuc0FycmF5KF8uZmxhdHRlbihjb29yZGluYXRlcykpLFxuICAgIH0pXG4gIH1cblxuICBwcmltaXRpdmUuaWQgPSBpZFxuICBwcmltaXRpdmUubG9jYXRpb25JZCA9IG1vZGVsLmF0dHJpYnV0ZXMubG9jYXRpb25JZFxuICBtYXAuZ2V0TWFwKCkuc2NlbmUucHJpbWl0aXZlcy5hZGQocHJpbWl0aXZlKVxuICBtYXAuZ2V0TWFwKCkuc2NlbmUucmVxdWVzdFJlbmRlcigpXG59XG5cbmNvbnN0IHVzZUNhbWVyYU1hZ25pdHVkZSA9ICh7XG4gIG1hcCxcbn06IHtcbiAgbWFwOiBhbnlcbn0pOiBbbnVtYmVyLCBSZWFjdC5EaXNwYXRjaDxSZWFjdC5TZXRTdGF0ZUFjdGlvbjxudW1iZXI+Pl0gPT4ge1xuICBjb25zdCBbY2FtZXJhTWFnbml0dWRlLCBzZXRDYW1lcmFNYWduaXR1ZGVdID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW2lzTW92aW5nLCBzZXRJc01vdmluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgcmVuZGVyID0gdXNlUmVuZGVyKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzdGFydExpc3RlbmVyID0gKCkgPT4gc2V0SXNNb3ZpbmcodHJ1ZSlcbiAgICBjb25zdCBlbmRMaXN0ZW5lciA9ICgpID0+IHNldElzTW92aW5nKGZhbHNlKVxuICAgIG1hcD8uZ2V0TWFwKCkuc2NlbmUuY2FtZXJhLm1vdmVTdGFydC5hZGRFdmVudExpc3RlbmVyKHN0YXJ0TGlzdGVuZXIpXG4gICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZUVuZC5hZGRFdmVudExpc3RlbmVyKGVuZExpc3RlbmVyKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtYXA/LmdldE1hcCgpLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihzdGFydExpc3RlbmVyKVxuICAgICAgbWFwPy5nZXRNYXAoKS5zY2VuZS5jYW1lcmEubW92ZUVuZC5yZW1vdmVFdmVudExpc3RlbmVyKGVuZExpc3RlbmVyKVxuICAgIH1cbiAgfSwgW21hcF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTW92aW5nKSB7XG4gICAgICBjb25zdCBhbmltYXRpb25JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBzZXRDYW1lcmFNYWduaXR1ZGUoZ2V0Q3VycmVudE1hZ25pdHVkZUZyb21NYXAoeyBtYXAgfSkpXG4gICAgICB9KVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbklkKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW2lzTW92aW5nLCByZW5kZXJdKVxuICByZXR1cm4gW2NhbWVyYU1hZ25pdHVkZSwgc2V0Q2FtZXJhTWFnbml0dWRlXVxufVxuXG5jb25zdCB1c2VMaXN0ZW5Ub01vZGVsID0gKHtcbiAgbW9kZWwsXG4gIG1hcCxcbiAgb25EcmF3LFxuICBuZXdCYm94LFxuICB0cmFuc2xhdGlvbixcbiAgaXNJbnRlcmFjdGl2ZSxcbn06IHtcbiAgbW9kZWw6IGFueVxuICBtYXA6IGFueVxuICBvbkRyYXc/OiAoZHJhd2luZ0xvY2F0aW9uOiBCQm94KSA9PiB2b2lkXG4gIG5ld0Jib3g6IEJCb3ggfCBudWxsXG4gIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb25cbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW4gLy8gbm90ZTogJ2ludGVyYWN0aXZlJyBpcyBkaWZmZXJlbnQgZnJvbSBkcmF3aW5nXG59KSA9PiB7XG4gIGNvbnN0IFtjYW1lcmFNYWduaXR1ZGVdID0gdXNlQ2FtZXJhTWFnbml0dWRlKHsgbWFwIH0pXG4gIGNvbnN0IFtkcmF3bk1hZ25pdHVkZSwgc2V0RHJhd25NYWduaXR1ZGVdID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgY2FsbGJhY2sgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKG1hcCkge1xuICAgICAgICBpZiAobmV3QmJveCkge1xuICAgICAgICAgIC8vIENsb25lIHRoZSBtb2RlbCB0byBkaXNwbGF5IHRoZSBuZXcgYmJveCBkcmF3biBiZWNhdXNlIHdlIGRvbid0XG4gICAgICAgICAgLy8gd2FudCB0byB1cGRhdGUgdGhlIGV4aXN0aW5nIG1vZGVsIHVubGVzcyB0aGUgdXNlciBjbGlja3MgQXBwbHkuXG4gICAgICAgICAgY29uc3QgbmV3TW9kZWwgPSBtb2RlbC5jbG9uZSgpXG4gICAgICAgICAgbmV3TW9kZWwuc2V0KG5ld0Jib3gpXG4gICAgICAgICAgbWFrZU9sZERyYXdpbmdOb25FZGl0YWJsZSh7XG4gICAgICAgICAgICBtYXAsXG4gICAgICAgICAgICBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSksXG4gICAgICAgICAgfSlcbiAgICAgICAgICBkcmF3R2VvbWV0cnkoe1xuICAgICAgICAgICAgbWFwLFxuICAgICAgICAgICAgbW9kZWw6IG5ld01vZGVsLFxuICAgICAgICAgICAgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pLFxuICAgICAgICAgICAgc2V0RHJhd25NYWduaXR1ZGUsXG4gICAgICAgICAgICBvbkRyYXcsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmIChtb2RlbCkge1xuICAgICAgICAgIHJlbW92ZU9sZERyYXdpbmcoeyBtYXAsIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSB9KVxuICAgICAgICAgIGRyYXdHZW9tZXRyeSh7XG4gICAgICAgICAgICBtYXAsXG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSxcbiAgICAgICAgICAgIHNldERyYXduTWFnbml0dWRlLFxuICAgICAgICAgICAgb25EcmF3LFxuICAgICAgICAgICAgdHJhbnNsYXRpb24sXG4gICAgICAgICAgICBpc0ludGVyYWN0aXZlLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIFttb2RlbCwgbWFwLCBuZXdCYm94LCB0cmFuc2xhdGlvbiwgaXNJbnRlcmFjdGl2ZV0pXG4gIHVzZUxpc3RlblRvKFxuICAgIG1vZGVsLFxuICAgICdjaGFuZ2U6bWFwTm9ydGggY2hhbmdlOm1hcFNvdXRoIGNoYW5nZTptYXBFYXN0IGNoYW5nZTptYXBXZXN0IGNoYW5nZTpjb2xvcicsXG4gICAgY2FsbGJhY2tcbiAgKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXAgJiYgbmVlZHNSZWRyYXcoeyBtYXAsIGRyYXduTWFnbml0dWRlIH0pKSB7XG4gICAgICBjYWxsYmFjaygpXG4gICAgfVxuICB9LCBbY2FtZXJhTWFnbml0dWRlLCBkcmF3bk1hZ25pdHVkZSwgY2FsbGJhY2ssIG1hcF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY2FsbGJhY2soKVxuICB9LCBbY2FsbGJhY2tdKVxufVxuXG5jb25zdCB1c2VTdGFydE1hcERyYXdpbmcgPSAoe1xuICBtYXAsXG4gIG1vZGVsLFxuICBzZXROZXdCYm94LFxuICBvbkRyYXcsXG59OiB7XG4gIG1hcDogYW55XG4gIG1vZGVsOiBhbnlcbiAgc2V0TmV3QmJveDogKG5ld0Jib3g6IEJCb3gpID0+IHZvaWRcbiAgb25EcmF3OiAobmV3QmJveDogQkJveCkgPT4gdm9pZFxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXAgJiYgbW9kZWwpIHtcbiAgICAgIG1hcC5nZXRNYXAoKS5kcmF3SGVscGVyW2BzdGFydERyYXdpbmdFeHRlbnRgXSh7XG4gICAgICAgIGNhbGxiYWNrOiAoZXh0ZW50OiBDZXNpdW0uUmVjdGFuZ2xlKSA9PiB7XG4gICAgICAgICAgY29uc3QgYmJveCA9IHJlY3RhbmdsZVRvQmJveChleHRlbnQpXG4gICAgICAgICAgc2V0TmV3QmJveChiYm94KVxuICAgICAgICAgIG9uRHJhdyhiYm94KVxuICAgICAgICB9LFxuICAgICAgICBtYXRlcmlhbDogQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdDb2xvcicsIHtcbiAgICAgICAgICBjb2xvcjogQ2VzaXVtLkNvbG9yLmZyb21BbHBoYShjb250cmFzdGluZ0NvbG9yLCAwLjIpLFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbbWFwLCBtb2RlbF0pXG59XG5cbmV4cG9ydCBjb25zdCBDZXNpdW1CYm94RGlzcGxheSA9ICh7XG4gIG1hcCxcbiAgbW9kZWwsXG4gIG9uRHJhdyxcbiAgdHJhbnNsYXRpb24sXG4gIGlzSW50ZXJhY3RpdmUsXG59OiB7XG4gIG1hcDogYW55XG4gIG1vZGVsOiBhbnlcbiAgb25EcmF3PzogKG5ld0Jib3g6IEJCb3gpID0+IHZvaWRcbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhbiAvLyBub3RlOiAnaW50ZXJhY3RpdmUnIGlzIGRpZmZlcmVudCBmcm9tIGRyYXdpbmdcbn0pID0+IHtcbiAgLy8gVXNlIHN0YXRlIHRvIHN0b3JlIHRoZSBiYm94IGRyYXduIGJ5IHRoZSB1c2VyIGJlZm9yZSB0aGV5IGNsaWNrIEFwcGx5IG9yIENhbmNlbC5cbiAgLy8gV2hlbiB0aGUgdXNlciBjbGlja3MgRHJhdywgdGhleSBhcmUgYWxsb3dlZCB0byBlZGl0IHRoZSBleGlzdGluZyBiYm94IChpZiBpdFxuICAvLyBleGlzdHMpLCBvciBkcmF3IGEgbmV3IGJib3guIElmIHRoZXkgZHJhdyBhIG5ldyBiYm94LCBzYXZlIGl0IHRvIHN0YXRlIHRoZW4gc2hvd1xuICAvLyBpdCBpbnN0ZWFkIG9mIHRoZSBkcmF3IG1vZGVsIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0byB1cGRhdGUgdGhlIGRyYXcgbW9kZWxcbiAgLy8gdW5sZXNzIHRoZSB1c2VyIGNsaWNrcyBBcHBseS5cbiAgY29uc3QgW25ld0Jib3gsIHNldE5ld0Jib3hdID0gUmVhY3QudXNlU3RhdGU8QkJveCB8IG51bGw+KG51bGwpXG4gIGlmIChvbkRyYXcpIHtcbiAgICB1c2VTdGFydE1hcERyYXdpbmcoeyBtYXAsIG1vZGVsLCBvbkRyYXcsIHNldE5ld0Jib3ggfSlcbiAgfVxuICB1c2VMaXN0ZW5Ub01vZGVsKHsgbWFwLCBtb2RlbCwgb25EcmF3LCBuZXdCYm94LCB0cmFuc2xhdGlvbiwgaXNJbnRlcmFjdGl2ZSB9KVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9kZWwgJiYgbWFwKSB7XG4gICAgICAgIHJlbW92ZU9sZERyYXdpbmcoeyBtYXAsIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSB9KVxuICAgICAgICBtYXAuZ2V0TWFwKCkuZHJhd0hlbHBlci5zdG9wRHJhd2luZygpXG4gICAgICB9XG4gICAgfVxuICB9LCBbbWFwLCBtb2RlbF0pXG4gIHJldHVybiA8PjwvPlxufVxuIl19