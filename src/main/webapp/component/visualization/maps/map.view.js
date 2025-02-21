import { __assign, __read, __values } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
import * as React from 'react';
import wreqr from '../../../js/wreqr';
import user from '../../singletons/user-instance';
import MapModel from './map.model';
import MapInfo from '../../../react-component/map-info';
import DistanceInfo from '../../../react-component/distance-info';
import getDistance from 'geolib/es/getDistance';
import { Drawing } from '../../singletons/drawing';
import MapToolbar from './map-toolbar';
import MapContextDropdown from '../../map-context-menu/map-context-menu.view';
import { useListenTo } from '../../selection-checkbox/useBackbone.hook';
import Geometries from './react/geometries';
import LinearProgress from '@mui/material/LinearProgress';
import PopupPreview from '../../../react-component/popup-preview';
import { SHAPE_ID_PREFIX, getDrawModeFromModel } from './drawing-and-display';
import useSnack from '../../hooks/useSnack';
import { zoomToHome } from './home';
import featureDetection from '../../singletons/feature-detection';
import Paper from '@mui/material/Paper';
import { Elevations } from '../../theme/theme';
import Button from '@mui/material/Button';
import PlusIcon from '@mui/icons-material/Add';
import MinusIcon from '@mui/icons-material/Remove';
import { InteractionsContext } from './interactions.provider';
import _ from 'lodash';
import ShapeUtils from '../../../js/ShapeUtils';
var useMapCode = function (props) {
    var _a = __read(React.useState(null), 2), mapCode = _a[0], setMapCode = _a[1];
    React.useEffect(function () {
        props.loadMap().then(function (Map) {
            setMapCode({ createMap: Map });
        });
    }, [props.loadMap]);
    return mapCode;
};
var useMap = function (props) {
    var _a = __read(React.useState(null), 2), map = _a[0], setMap = _a[1];
    var mapCode = useMapCode(props);
    React.useEffect(function () {
        if (props.mapElement && mapCode) {
            try {
                setMap(mapCode.createMap(props.mapElement, props.selectionInterface, props.mapDrawingPopupElement, props.containerElement, props.mapModel, props.mapLayers));
            }
            catch (err) {
                featureDetection.addFailure('cesium');
            }
        }
        return function () {
            if (props.mapElement && mapCode && map) {
                map.destroy();
            }
        };
    }, [props.mapElement, mapCode]);
    return map;
};
var useMapModel = function () {
    var _a = __read(React.useState(new MapModel()), 1), mapModel = _a[0];
    return mapModel;
};
/*
    Handles drawing or clearing the ruler as needed by the measurement state.

    START indicates that a starting point should be drawn,
    so the map clears any previous points drawn and draws a new start point.

    END indicates that an ending point should be drawn,
    so the map draws an end point and a line, and calculates the distance.

    NONE indicates that the ruler should be cleared.
  */
var handleMeasurementStateChange = function (_a) {
    var map = _a.map, mapModel = _a.mapModel;
    var state = mapModel.get('measurementState');
    var point = null;
    switch (state) {
        case 'START':
            clearRuler({ map: map, mapModel: mapModel });
            point = map.addRulerPoint(mapModel.get('coordinateValues'));
            mapModel.addPoint(point);
            mapModel.setStartingCoordinates({
                lat: mapModel.get('coordinateValues')['lat'],
                lon: mapModel.get('coordinateValues')['lon'],
            });
            var polyline = map.addRulerLine(mapModel.get('coordinateValues'));
            mapModel.setLine(polyline);
            break;
        case 'END':
            point = map.addRulerPoint(mapModel.get('coordinateValues'));
            mapModel.addPoint(point);
            map.setRulerLine({
                lat: mapModel.get('coordinateValues')['lat'],
                lon: mapModel.get('coordinateValues')['lon'],
            });
            break;
        case 'NONE':
            clearRuler({ map: map, mapModel: mapModel });
            break;
        default:
            break;
    }
};
/*
    Handles tasks for clearing the ruler, which include removing all points
    (endpoints of the line) and the line.
  */
var clearRuler = function (_a) {
    var map = _a.map, mapModel = _a.mapModel;
    var points = mapModel.get('points');
    points.forEach(function (point) {
        map.removeRulerPoint(point);
    });
    mapModel.clearPoints();
    var line = mapModel.removeLine();
    map.removeRulerLine(line);
};
/*
 *  Redraw and recalculate the ruler line and distanceInfo tooltip. Will not redraw while the menu is currently
 *  displayed updateOnMenu allows updating while the menu is up
 */
var updateDistance = function (_a) {
    var map = _a.map, mapModel = _a.mapModel, _b = _a.updateOnMenu, updateOnMenu = _b === void 0 ? false : _b;
    if (mapModel.get('measurementState') === 'START') {
        var openMenu = true; // TODO: investigate this
        var lat = mapModel.get('mouseLat');
        var lon = mapModel.get('mouseLon');
        if ((updateOnMenu === true || !openMenu) && lat && lon) {
            // redraw ruler line
            var mousePoint = { lat: lat, lon: lon };
            map.setRulerLine(mousePoint);
            // update distance info
            var startingCoordinates = mapModel.get('startingCoordinates');
            var dist = getDistance({ latitude: lat, longitude: lon }, {
                latitude: startingCoordinates['lat'],
                longitude: startingCoordinates['lon'],
            });
            mapModel.setDistanceInfoPosition(event.clientX, event.clientY);
            mapModel.setCurrentDistance(dist);
        }
    }
};
var useWreqrMapListeners = function (_a) {
    var map = _a.map;
    useListenTo(map ? wreqr.vent : undefined, 'metacard:overlay', function () {
        map.overlayImage.bind(map)();
    });
    useListenTo(map ? wreqr.vent : undefined, 'metacard:overlay:remove', function () {
        map.removeOverlay.bind(map)();
    });
    useListenTo(map ? wreqr.vent : undefined, 'search:maprectanglefly', function () {
        map.zoomToExtent.bind(map)();
    });
    React.useEffect(function () {
        if (map) {
        }
    }, [map]);
};
var useSelectionInterfaceMapListeners = function (_a) {
    var map = _a.map, selectionInterface = _a.selectionInterface;
    useListenTo(map ? selectionInterface : undefined, 'reset:activeSearchResults', function () {
        map.removeAllOverlays.bind(map)();
    });
};
var useListenToMapModel = function (_a) {
    var map = _a.map, mapModel = _a.mapModel;
    useListenTo(map && mapModel ? mapModel : undefined, 'change:measurementState', function () {
        handleMeasurementStateChange({ map: map, mapModel: mapModel });
    });
    useListenTo(map && mapModel ? mapModel : undefined, 'change:mouseLat change:mouseLon', function () {
        updateDistance({ map: map, mapModel: mapModel });
    });
};
var updateTarget = function (_a) {
    var mapModel = _a.mapModel, metacard = _a.metacard;
    var target;
    var targetMetacard;
    if (metacard) {
        target = metacard.plain.metacard.properties.title;
        targetMetacard = metacard;
    }
    mapModel.set({
        target: target,
        targetMetacard: targetMetacard,
    });
};
var handleMapHover = function (_a) {
    var mapModel = _a.mapModel, selectionInterface = _a.selectionInterface, mapEvent = _a.mapEvent, setIsHoveringResult = _a.setIsHoveringResult, setHoverGeo = _a.setHoverGeo;
    var isHoveringOverGeo = Boolean(mapEvent.mapTarget &&
        mapEvent.mapTarget.constructor === String &&
        (mapEvent.mapTarget.startsWith(SHAPE_ID_PREFIX) ||
            mapEvent.mapTarget === 'userDrawing'));
    if (isHoveringOverGeo) {
        setHoverGeo({
            id: mapEvent.mapLocationId,
            interactive: Boolean(mapEvent.mapLocationId),
        });
    }
    else {
        setHoverGeo({});
    }
    if (!selectionInterface) {
        return;
    }
    var currentQuery = selectionInterface.get('currentQuery');
    if (!currentQuery) {
        return;
    }
    var result = currentQuery.get('result');
    if (!result) {
        return;
    }
    var metacard = result.get('lazyResults').results[mapEvent.mapTarget];
    updateTarget({ metacard: metacard, mapModel: mapModel });
    setIsHoveringResult(Boolean(mapEvent.mapTarget &&
        mapEvent.mapTarget !== 'userDrawing' &&
        (Array.isArray(mapEvent.mapTarget) ||
            (mapEvent.mapTarget.constructor === String &&
                !mapEvent.mapTarget.startsWith(SHAPE_ID_PREFIX)))));
};
var getLocation = function (model, translation) {
    var locationType = getDrawModeFromModel({ model: model });
    switch (locationType) {
        case 'bbox':
            var bbox = _.pick(model.attributes, 'mapNorth', 'mapSouth', 'mapEast', 'mapWest', 'north', 'south', 'east', 'west');
            if (translation) {
                var translatedBbox = translateBbox(bbox, translation);
                return translatedBbox;
            }
            return bbox;
        case 'circle':
            var point = _.pick(model.attributes, 'lat', 'lon');
            if (translation) {
                var translatedPoint = translatePoint(point.lon, point.lat, translation);
                return translatedPoint;
            }
            return point;
        case 'line':
            var line = JSON.parse(JSON.stringify(model.get('line')));
            if (translation) {
                translateLine(line, translation);
            }
            return { line: line };
        case 'poly':
            var polygon = JSON.parse(JSON.stringify(model.get('polygon')));
            if (translation) {
                var multiPolygon = ShapeUtils.isArray3D(polygon) ? polygon : [polygon];
                translatePolygon(multiPolygon, translation);
            }
            return { polygon: polygon };
        default:
            return {};
    }
};
var translatePolygon = function (polygon, translation) {
    var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
    // odd things happen when latitude is exactly or very close to either 90 or -90
    var northPole = 89.99;
    var southPole = -89.99;
    var maxLat = 0;
    var minLat = 0;
    var diff = 0;
    try {
        for (var polygon_1 = __values(polygon), polygon_1_1 = polygon_1.next(); !polygon_1_1.done; polygon_1_1 = polygon_1.next()) {
            var ring = polygon_1_1.value;
            try {
                for (var ring_1 = (e_2 = void 0, __values(ring)), ring_1_1 = ring_1.next(); !ring_1_1.done; ring_1_1 = ring_1.next()) {
                    var coord = ring_1_1.value;
                    var _e = __read(translateCoordinates(coord[0], coord[1], translation), 2), lon = _e[0], lat = _e[1];
                    coord[0] = lon;
                    coord[1] = lat;
                    maxLat = Math.max(lat, maxLat);
                    minLat = Math.min(lat, minLat);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (ring_1_1 && !ring_1_1.done && (_b = ring_1.return)) _b.call(ring_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (polygon_1_1 && !polygon_1_1.done && (_a = polygon_1.return)) _a.call(polygon_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (maxLat > northPole) {
        diff = Math.abs(maxLat - northPole);
    }
    else if (minLat < southPole) {
        diff = -Math.abs(minLat - southPole);
    }
    if (diff !== 0) {
        try {
            for (var polygon_2 = __values(polygon), polygon_2_1 = polygon_2.next(); !polygon_2_1.done; polygon_2_1 = polygon_2.next()) {
                var ring = polygon_2_1.value;
                try {
                    for (var ring_2 = (e_4 = void 0, __values(ring)), ring_2_1 = ring_2.next(); !ring_2_1.done; ring_2_1 = ring_2.next()) {
                        var coord = ring_2_1.value;
                        coord[1] -= diff;
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (ring_2_1 && !ring_2_1.done && (_d = ring_2.return)) _d.call(ring_2);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (polygon_2_1 && !polygon_2_1.done && (_c = polygon_2.return)) _c.call(polygon_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
};
var translateLine = function (line, translation) {
    var e_5, _a, e_6, _b;
    // odd things happen when latitude is exactly or very close to either 90 or -90
    var northPole = 89.99;
    var southPole = -89.99;
    var maxLat = 0;
    var minLat = 0;
    var diff = 0;
    try {
        for (var line_1 = __values(line), line_1_1 = line_1.next(); !line_1_1.done; line_1_1 = line_1.next()) {
            var coord = line_1_1.value;
            var _c = __read(translateCoordinates(coord[0], coord[1], translation), 2), lon = _c[0], lat = _c[1];
            maxLat = Math.max(lat, maxLat);
            minLat = Math.min(lat, minLat);
            coord[0] = lon;
            coord[1] = lat;
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (line_1_1 && !line_1_1.done && (_a = line_1.return)) _a.call(line_1);
        }
        finally { if (e_5) throw e_5.error; }
    }
    // prevent polar crossing
    if (maxLat > northPole) {
        diff = Math.abs(maxLat - northPole);
    }
    else if (minLat < southPole) {
        diff = -Math.abs(minLat - southPole);
    }
    if (diff !== 0) {
        try {
            for (var line_2 = __values(line), line_2_1 = line_2.next(); !line_2_1.done; line_2_1 = line_2.next()) {
                var coord = line_2_1.value;
                coord[1] -= diff;
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (line_2_1 && !line_2_1.done && (_b = line_2.return)) _b.call(line_2);
            }
            finally { if (e_6) throw e_6.error; }
        }
    }
};
var translateBbox = function (bbox, translation) {
    var translated = __assign({}, bbox);
    var _a = __read(translateCoordinates(bbox.mapEast, bbox.mapNorth, translation), 2), east = _a[0], north = _a[1];
    var _b = __read(translateCoordinates(bbox.mapWest, bbox.mapSouth, translation), 2), west = _b[0], south = _b[1];
    var northPole = 90;
    var southPole = -90;
    // prevent polar crossing
    var diff;
    if (north > northPole) {
        diff = Math.abs(north - northPole);
        north = northPole;
        south = south - diff;
    }
    if (south < southPole) {
        diff = Math.abs(southPole - south);
        south = southPole;
        north = north + diff;
    }
    translated.mapNorth = north;
    translated.mapEast = east;
    translated.mapSouth = south;
    translated.mapWest = west;
    translated.north = north;
    translated.east = east;
    translated.south = south;
    translated.west = west;
    return translated;
};
var translatePoint = function (lon, lat, translation) {
    var _a = __read(translateCoordinates(lon, lat, translation), 2), updatedLon = _a[0], updatedLat = _a[1];
    var northPole = 89.99;
    var southPole = -89.99;
    if (updatedLat > northPole) {
        updatedLat = northPole;
    }
    else if (updatedLat < southPole) {
        updatedLat = southPole;
    }
    return { lon: updatedLon, lat: updatedLat };
};
var translateCoordinates = function (longitude, latitude, translation) {
    var translatedLon = longitude + translation.longitude;
    var translatedLat = latitude + translation.latitude;
    // normalize longitude
    if (translatedLon > 180) {
        translatedLon -= 360;
    }
    if (translatedLon < -180) {
        translatedLon += 360;
    }
    return [translatedLon, translatedLat];
};
var useMapListeners = function (_a) {
    var map = _a.map, mapModel = _a.mapModel, selectionInterface = _a.selectionInterface;
    var _b = __read(React.useState(false), 2), isHoveringResult = _b[0], setIsHoveringResult = _b[1];
    var _c = __read(React.useState({}), 2), hoverGeo = _c[0], setHoverGeo = _c[1];
    var _d = React.useContext(InteractionsContext), moveFrom = _d.moveFrom, setMoveFrom = _d.setMoveFrom, interactiveGeo = _d.interactiveGeo, setInteractiveGeo = _d.setInteractiveGeo, interactiveModels = _d.interactiveModels, setInteractiveModels = _d.setInteractiveModels, translation = _d.translation, setTranslation = _d.setTranslation;
    var addSnack = useSnack();
    var upCallbackRef = React.useRef(null);
    React.useEffect(function () {
        upCallbackRef.current = function () {
            var e_7, _a;
            if (interactiveModels.length > 0 && translation) {
                var undoFns_1 = [];
                var _loop_1 = function (model) {
                    var originalLocation = getLocation(model);
                    var newLocation = getLocation(model, translation);
                    model.set(newLocation);
                    undoFns_1.push(function () { return model.set(originalLocation); });
                };
                try {
                    for (var interactiveModels_1 = __values(interactiveModels), interactiveModels_1_1 = interactiveModels_1.next(); !interactiveModels_1_1.done; interactiveModels_1_1 = interactiveModels_1.next()) {
                        var model = interactiveModels_1_1.value;
                        _loop_1(model);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (interactiveModels_1_1 && !interactiveModels_1_1.done && (_a = interactiveModels_1.return)) _a.call(interactiveModels_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                addSnack('Location updated. You may still need to save the item that uses it.', {
                    id: "".concat(interactiveGeo, ".move"),
                    undo: function () {
                        var e_8, _a;
                        try {
                            for (var undoFns_2 = __values(undoFns_1), undoFns_2_1 = undoFns_2.next(); !undoFns_2_1.done; undoFns_2_1 = undoFns_2.next()) {
                                var undoFn = undoFns_2_1.value;
                                undoFn();
                            }
                        }
                        catch (e_8_1) { e_8 = { error: e_8_1 }; }
                        finally {
                            try {
                                if (undoFns_2_1 && !undoFns_2_1.done && (_a = undoFns_2.return)) _a.call(undoFns_2);
                            }
                            finally { if (e_8) throw e_8.error; }
                        }
                    },
                });
            }
            setMoveFrom(null);
            setTranslation(null);
        };
    }, [interactiveModels, translation]);
    React.useEffect(function () {
        if (interactiveGeo) {
            // This handler might disable dragging to move the map, so only set it up
            // when the user has started interacting with a geo.
            map.onMouseTrackingForGeoDrag({
                moveFrom: moveFrom,
                down: function (_a) {
                    var position = _a.position, mapLocationId = _a.mapLocationId;
                    if (mapLocationId === interactiveGeo && !Drawing.isDrawing()) {
                        setMoveFrom(position);
                    }
                },
                move: function (_a) {
                    var translation = _a.translation, mapLocationId = _a.mapLocationId;
                    if (mapLocationId === interactiveGeo) {
                        setHoverGeo({
                            id: mapLocationId,
                        });
                    }
                    else {
                        setHoverGeo({});
                    }
                    setTranslation(translation !== null && translation !== void 0 ? translation : null);
                },
                up: function () { var _a; return (_a = upCallbackRef.current) === null || _a === void 0 ? void 0 : _a.call(upCallbackRef); },
            });
        }
        return function () { return map === null || map === void 0 ? void 0 : map.clearMouseTrackingForGeoDrag(); };
    }, [map, interactiveGeo, moveFrom]);
    var handleKeydown = React.useCallback(function (e) {
        if (e.key === 'Escape') {
            setInteractiveGeo(null);
            setInteractiveModels([]);
            setMoveFrom(null);
            setTranslation(null);
        }
    }, []);
    React.useEffect(function () {
        if (interactiveGeo) {
            window.addEventListener('keydown', handleKeydown);
        }
        else {
            window.removeEventListener('keydown', handleKeydown);
        }
        return function () { return window.removeEventListener('keydown', handleKeydown); };
    }, [interactiveGeo]);
    React.useEffect(function () {
        if (map && !moveFrom) {
            var handleLeftClick = function (mapLocationId) {
                if (mapLocationId && !interactiveGeo && !Drawing.isDrawing()) {
                    setInteractiveGeo(mapLocationId);
                }
                else {
                    setInteractiveGeo(null);
                    setInteractiveModels([]);
                    setMoveFrom(null);
                    setTranslation(null);
                }
            };
            map.onLeftClickMapAPI(handleLeftClick);
        }
        if (map && !interactiveGeo) {
            if (!Drawing.isDrawing()) {
                // Clicks used in drawing on the 3D map, so let's ignore them here
                // while drawing.
                map.onDoubleClick();
                map.onRightClick(function (event, _mapEvent) {
                    event.preventDefault();
                    mapModel.set({
                        mouseX: event.offsetX,
                        mouseY: event.offsetY,
                        open: true,
                    });
                    mapModel.updateClickCoordinates();
                    updateDistance({ map: map, mapModel: mapModel, updateOnMenu: true });
                });
            }
            if (mapModel) {
                map.onMouseMove(function (_event, mapEvent) {
                    handleMapHover({
                        map: map,
                        mapEvent: mapEvent,
                        mapModel: mapModel,
                        selectionInterface: selectionInterface,
                        setIsHoveringResult: setIsHoveringResult,
                        setHoverGeo: setHoverGeo,
                    });
                });
            }
        }
        return function () {
            map === null || map === void 0 ? void 0 : map.clearMouseMove();
            map === null || map === void 0 ? void 0 : map.clearDoubleClick();
            map === null || map === void 0 ? void 0 : map.clearRightClick();
            map === null || map === void 0 ? void 0 : map.clearLeftClickMapAPI();
        };
    }, [map, mapModel, selectionInterface, interactiveGeo, moveFrom]);
    return {
        isHoveringResult: isHoveringResult,
        hoverGeo: hoverGeo,
        interactiveGeo: interactiveGeo,
        setInteractiveGeo: setInteractiveGeo,
        moveFrom: moveFrom,
    };
};
var useOnMouseLeave = function (_a) {
    var mapElement = _a.mapElement, mapModel = _a.mapModel;
    React.useEffect(function () {
        if (mapElement && mapModel) {
            mapElement.addEventListener('mouseleave', function () {
                mapModel.clearMouseCoordinates();
            });
        }
    }, [mapElement, mapModel]);
};
var useListenToDrawing = function () {
    var _a = __read(React.useState(false), 2), isDrawing = _a[0], setIsDrawing = _a[1];
    useListenTo(Drawing, 'change:drawing', function () {
        setIsDrawing(Drawing.isDrawing());
    });
    return isDrawing;
};
var useChangeCursorOnHover = function (_a) {
    var mapElement = _a.mapElement, isHoveringResult = _a.isHoveringResult, hoverGeo = _a.hoverGeo, interactiveGeo = _a.interactiveGeo, moveFrom = _a.moveFrom, isDrawing = _a.isDrawing;
    React.useEffect(function () {
        if (mapElement) {
            var canvas = mapElement.querySelector('canvas');
            if (canvas && !isDrawing) {
                if (interactiveGeo) {
                    // If the user is in 'interactive mode' with a geo, only show a special cursor
                    // when hovering over that geo.
                    if (hoverGeo.id === interactiveGeo) {
                        canvas.style.cursor = moveFrom ? 'grabbing' : 'grab';
                    }
                    else {
                        canvas.style.cursor = '';
                    }
                }
                else if (hoverGeo.interactive || isHoveringResult) {
                    canvas.style.cursor = 'pointer';
                }
                else if (hoverGeo.interactive === false) {
                    canvas.style.cursor = 'not-allowed';
                }
                else {
                    canvas.style.cursor = '';
                }
            }
        }
    }, [mapElement, isHoveringResult, hoverGeo, interactiveGeo, moveFrom]);
};
var useChangeCursorOnDrawing = function (_a) {
    var mapElement = _a.mapElement, isDrawing = _a.isDrawing;
    React.useEffect(function () {
        if (mapElement) {
            var canvas = mapElement.querySelector('canvas');
            if (canvas) {
                if (isDrawing) {
                    canvas.style.cursor = 'crosshair';
                }
                else {
                    canvas.style.cursor = '';
                }
            }
        }
    }, [mapElement, isDrawing]);
};
export var MapViewReact = function (props) {
    var _a = __read(React.useState(false), 2), isClustering = _a[0], setIsClustering = _a[1];
    var mapModel = useMapModel();
    var _b = __read(React.useState(null), 2), mapDrawingPopupElement = _b[0], setMapDrawingPopupElement = _b[1];
    var _c = __read(React.useState(null), 2), containerElement = _c[0], setContainerElement = _c[1];
    var _d = __read(React.useState(null), 2), mapElement = _d[0], setMapElement = _d[1];
    var map = useMap(__assign(__assign({}, props), { mapElement: mapElement, mapModel: mapModel, containerElement: containerElement, mapDrawingPopupElement: mapDrawingPopupElement }));
    React.useEffect(function () {
        props.setMap(map); // allow outside access to map
    }, [map]);
    useWreqrMapListeners({ map: map });
    useSelectionInterfaceMapListeners({
        map: map,
        selectionInterface: props.selectionInterface,
    });
    useListenToMapModel({ map: map, mapModel: mapModel });
    var _e = useMapListeners({
        map: map,
        mapModel: mapModel,
        selectionInterface: props.selectionInterface,
    }), isHoveringResult = _e.isHoveringResult, hoverGeo = _e.hoverGeo, interactiveGeo = _e.interactiveGeo, moveFrom = _e.moveFrom;
    useOnMouseLeave({ mapElement: mapElement, mapModel: mapModel });
    var isDrawing = useListenToDrawing();
    useChangeCursorOnDrawing({ mapElement: mapElement, isDrawing: isDrawing });
    useChangeCursorOnHover({
        isHoveringResult: isHoveringResult,
        hoverGeo: hoverGeo,
        interactiveGeo: interactiveGeo,
        moveFrom: moveFrom,
        isDrawing: isDrawing,
        mapElement: mapElement,
    });
    var addSnack = useSnack();
    return (_jsxs("div", { ref: setContainerElement, className: "w-full h-full bg-inherit relative p-2", children: [!map ? (_jsx(_Fragment, { children: _jsx(LinearProgress, { className: "absolute left-0 w-full h-2 transform -translate-y-1/2", style: {
                        top: '50%',
                    } }) })) : (_jsx(_Fragment, {})), _jsx("div", { id: "mapDrawingPopup", ref: setMapDrawingPopupElement }), _jsx("div", { className: "map-context-menu" }), _jsxs("div", { id: "mapTools", children: [map ? (_jsx(Geometries, { selectionInterface: props.selectionInterface, map: map, isClustering: isClustering })) : null, map ? (_jsx(MapToolbar, { map: map, mapLayers: props.mapLayers, zoomToHome: function () {
                            zoomToHome({ map: map });
                        }, saveAsHome: function () {
                            var boundingBox = map.getBoundingBox();
                            var userPreferences = user.get('user').get('preferences');
                            userPreferences.set('mapHome', boundingBox);
                            addSnack('Success! New map home location set.', {
                                alertProps: {
                                    severity: 'success',
                                },
                            });
                        }, isClustering: isClustering, toggleClustering: function () {
                            setIsClustering(!isClustering);
                        } })) : null, map ? (_jsx(_Fragment, { children: _jsxs(Paper, { elevation: Elevations.overlays, className: "p-2 z-10 absolute right-0 bottom-0 mr-4 mb-4", children: [_jsx("div", { children: _jsx(Button, { size: "small", onClick: function () {
                                            map.zoomIn();
                                        }, children: _jsx(PlusIcon, { className: "  h-5 w-5" }) }) }), _jsx("div", { children: _jsx(Button, { size: "small", onClick: function () {
                                            map.zoomOut();
                                        }, children: _jsx(MinusIcon, { className: "  h-5 w-5" }) }) })] }) })) : null] }), _jsx("div", { "data-id": "map-container", id: "mapContainer", className: "h-full", ref: setMapElement }), _jsx("div", { className: "mapInfo", children: mapModel ? _jsx(MapInfo, { map: mapModel }) : null }), _jsx("div", { className: "distanceInfo", children: mapModel ? _jsx(DistanceInfo, { map: mapModel }) : null }), _jsx("div", { className: "popupPreview", children: map && mapModel && props.selectionInterface ? (_jsx(_Fragment, { children: _jsx(PopupPreview, { map: map, mapModel: mapModel, selectionInterface: props.selectionInterface }) })) : null }), mapModel ? _jsx(MapContextDropdown, { mapModel: mapModel }) : null] }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9tYXAudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLE1BQU0sbUJBQW1CLENBQUE7QUFDckMsT0FBTyxJQUFJLE1BQU0sZ0NBQWdDLENBQUE7QUFDakQsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFBO0FBQ2xDLE9BQU8sT0FBTyxNQUFNLG1DQUFtQyxDQUFBO0FBQ3ZELE9BQU8sWUFBWSxNQUFNLHdDQUF3QyxDQUFBO0FBQ2pFLE9BQU8sV0FBVyxNQUFNLHVCQUF1QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNsRCxPQUFPLFVBQVUsTUFBTSxlQUFlLENBQUE7QUFDdEMsT0FBTyxrQkFBa0IsTUFBTSw4Q0FBOEMsQ0FBQTtBQUM3RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkNBQTJDLENBQUE7QUFFdkUsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxjQUFjLE1BQU0sOEJBQThCLENBQUE7QUFDekQsT0FBTyxZQUFZLE1BQU0sd0NBQXdDLENBQUE7QUFDakUsT0FBTyxFQUFFLGVBQWUsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzdFLE9BQU8sUUFBUSxNQUFNLHNCQUFzQixDQUFBO0FBQzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDbkMsT0FBTyxnQkFBZ0IsTUFBTSxvQ0FBb0MsQ0FBQTtBQUNqRSxPQUFPLEtBQUssTUFBTSxxQkFBcUIsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0s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UUFBUSxFQUNsQixHQUFHLEVBQUUsYUFBYSxHQUNiLEVBQ1AsY0FBSyxTQUFTLEVBQUMsU0FBUyxZQUNyQixRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUMsT0FBTyxJQUFDLEdBQUcsRUFBRSxRQUFRLEdBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUN6QyxFQUNOLGNBQUssU0FBUyxFQUFDLGNBQWMsWUFDMUIsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFDLFlBQVksSUFBQyxHQUFHLEVBQUUsUUFBUSxHQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FDOUMsRUFDTixjQUFLLFNBQVMsRUFBQyxjQUFjLFlBQzFCLEdBQUcsSUFBSSxRQUFRLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUM3Qyw0QkFDRSxLQUFDLFlBQVksSUFDWCxHQUFHLEVBQUUsR0FBRyxFQUNSLFFBQVEsRUFBRSxRQUFRLEVBQ2xCLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsR0FDNUMsR0FDRCxDQUNKLENBQUMsQ0FBQyxDQUFDLElBQUksR0FDSixFQUNMLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBQyxrQkFBa0IsSUFBQyxRQUFRLEVBQUUsUUFBUSxHQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFDekQsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi8uLi9qcy93cmVxcidcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCBNYXBNb2RlbCBmcm9tICcuL21hcC5tb2RlbCdcbmltcG9ydCBNYXBJbmZvIGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9tYXAtaW5mbydcbmltcG9ydCBEaXN0YW5jZUluZm8gZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L2Rpc3RhbmNlLWluZm8nXG5pbXBvcnQgZ2V0RGlzdGFuY2UgZnJvbSAnZ2VvbGliL2VzL2dldERpc3RhbmNlJ1xuaW1wb3J0IHsgRHJhd2luZyB9IGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvZHJhd2luZydcbmltcG9ydCBNYXBUb29sYmFyIGZyb20gJy4vbWFwLXRvb2xiYXInXG5pbXBvcnQgTWFwQ29udGV4dERyb3Bkb3duIGZyb20gJy4uLy4uL21hcC1jb250ZXh0LW1lbnUvbWFwLWNvbnRleHQtbWVudS52aWV3J1xuaW1wb3J0IHsgdXNlTGlzdGVuVG8gfSBmcm9tICcuLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgR2VvbWV0cmllcyBmcm9tICcuL3JlYWN0L2dlb21ldHJpZXMnXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCBQb3B1cFByZXZpZXcgZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3BvcHVwLXByZXZpZXcnXG5pbXBvcnQgeyBTSEFQRV9JRF9QUkVGSVgsIGdldERyYXdNb2RlRnJvbU1vZGVsIH0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0IHVzZVNuYWNrIGZyb20gJy4uLy4uL2hvb2tzL3VzZVNuYWNrJ1xuaW1wb3J0IHsgem9vbVRvSG9tZSB9IGZyb20gJy4vaG9tZSdcbmltcG9ydCBmZWF0dXJlRGV0ZWN0aW9uIGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvZmVhdHVyZS1kZXRlY3Rpb24nXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi8uLi90aGVtZS90aGVtZSdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgUGx1c0ljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9BZGQnXG5pbXBvcnQgTWludXNJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvUmVtb3ZlJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnY2VzaS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgQ2VzaXVtIGZyb20gJ2Nlc2l1bS9CdWlsZC9DZXNpdW0vQ2VzaXVtJ1xuaW1wb3J0IHsgSW50ZXJhY3Rpb25zQ29udGV4dCwgVHJhbnNsYXRpb24gfSBmcm9tICcuL2ludGVyYWN0aW9ucy5wcm92aWRlcidcbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCdcbmltcG9ydCBTaGFwZVV0aWxzIGZyb20gJy4uLy4uLy4uL2pzL1NoYXBlVXRpbHMnXG5cbnR5cGUgSG92ZXJHZW8gPSB7XG4gIGludGVyYWN0aXZlPzogYm9vbGVhblxuICBpZD86IG51bWJlclxufVxuXG5jb25zdCB1c2VNYXBDb2RlID0gKHByb3BzOiBNYXBWaWV3UmVhY3RUeXBlKSA9PiB7XG4gIGNvbnN0IFttYXBDb2RlLCBzZXRNYXBDb2RlXSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBwcm9wcy5sb2FkTWFwKCkudGhlbigoTWFwOiBhbnkpID0+IHtcbiAgICAgIHNldE1hcENvZGUoeyBjcmVhdGVNYXA6IE1hcCB9KVxuICAgIH0pXG4gIH0sIFtwcm9wcy5sb2FkTWFwXSlcbiAgcmV0dXJuIG1hcENvZGVcbn1cbmNvbnN0IHVzZU1hcCA9IChcbiAgcHJvcHM6IE1hcFZpZXdSZWFjdFR5cGUgJiB7XG4gICAgbWFwRWxlbWVudDogSFRNTERpdkVsZW1lbnQgfCBudWxsXG4gICAgbWFwTW9kZWw6IGFueVxuICAgIGNvbnRhaW5lckVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICAgIG1hcERyYXdpbmdQb3B1cEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICAgIG1hcExheWVyczogYW55XG4gIH1cbikgPT4ge1xuICBjb25zdCBbbWFwLCBzZXRNYXBdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuICBjb25zdCBtYXBDb2RlID0gdXNlTWFwQ29kZShwcm9wcylcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocHJvcHMubWFwRWxlbWVudCAmJiBtYXBDb2RlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBzZXRNYXAoXG4gICAgICAgICAgbWFwQ29kZS5jcmVhdGVNYXAoXG4gICAgICAgICAgICBwcm9wcy5tYXBFbGVtZW50LFxuICAgICAgICAgICAgcHJvcHMuc2VsZWN0aW9uSW50ZXJmYWNlLFxuICAgICAgICAgICAgcHJvcHMubWFwRHJhd2luZ1BvcHVwRWxlbWVudCxcbiAgICAgICAgICAgIHByb3BzLmNvbnRhaW5lckVsZW1lbnQsXG4gICAgICAgICAgICBwcm9wcy5tYXBNb2RlbCxcbiAgICAgICAgICAgIHByb3BzLm1hcExheWVyc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGZlYXR1cmVEZXRlY3Rpb24uYWRkRmFpbHVyZSgnY2VzaXVtJylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChwcm9wcy5tYXBFbGVtZW50ICYmIG1hcENvZGUgJiYgbWFwKSB7XG4gICAgICAgIG1hcC5kZXN0cm95KClcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtwcm9wcy5tYXBFbGVtZW50LCBtYXBDb2RlXSlcbiAgcmV0dXJuIG1hcFxufVxuY29uc3QgdXNlTWFwTW9kZWwgPSAoKSA9PiB7XG4gIGNvbnN0IFttYXBNb2RlbF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG5ldyBNYXBNb2RlbCgpKVxuICByZXR1cm4gbWFwTW9kZWxcbn1cbi8qXG4gICAgSGFuZGxlcyBkcmF3aW5nIG9yIGNsZWFyaW5nIHRoZSBydWxlciBhcyBuZWVkZWQgYnkgdGhlIG1lYXN1cmVtZW50IHN0YXRlLlxuXG4gICAgU1RBUlQgaW5kaWNhdGVzIHRoYXQgYSBzdGFydGluZyBwb2ludCBzaG91bGQgYmUgZHJhd24sXG4gICAgc28gdGhlIG1hcCBjbGVhcnMgYW55IHByZXZpb3VzIHBvaW50cyBkcmF3biBhbmQgZHJhd3MgYSBuZXcgc3RhcnQgcG9pbnQuXG5cbiAgICBFTkQgaW5kaWNhdGVzIHRoYXQgYW4gZW5kaW5nIHBvaW50IHNob3VsZCBiZSBkcmF3bixcbiAgICBzbyB0aGUgbWFwIGRyYXdzIGFuIGVuZCBwb2ludCBhbmQgYSBsaW5lLCBhbmQgY2FsY3VsYXRlcyB0aGUgZGlzdGFuY2UuXG5cbiAgICBOT05FIGluZGljYXRlcyB0aGF0IHRoZSBydWxlciBzaG91bGQgYmUgY2xlYXJlZC5cbiAgKi9cbmNvbnN0IGhhbmRsZU1lYXN1cmVtZW50U3RhdGVDaGFuZ2UgPSAoe1xuICBtYXAsXG4gIG1hcE1vZGVsLFxufToge1xuICBtYXA6IGFueVxuICBtYXBNb2RlbDogYW55XG59KSA9PiB7XG4gIGNvbnN0IHN0YXRlID0gbWFwTW9kZWwuZ2V0KCdtZWFzdXJlbWVudFN0YXRlJylcbiAgbGV0IHBvaW50ID0gbnVsbFxuICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgY2FzZSAnU1RBUlQnOlxuICAgICAgY2xlYXJSdWxlcih7IG1hcCwgbWFwTW9kZWwgfSlcbiAgICAgIHBvaW50ID0gbWFwLmFkZFJ1bGVyUG9pbnQobWFwTW9kZWwuZ2V0KCdjb29yZGluYXRlVmFsdWVzJykpXG4gICAgICBtYXBNb2RlbC5hZGRQb2ludChwb2ludClcbiAgICAgIG1hcE1vZGVsLnNldFN0YXJ0aW5nQ29vcmRpbmF0ZXMoe1xuICAgICAgICBsYXQ6IG1hcE1vZGVsLmdldCgnY29vcmRpbmF0ZVZhbHVlcycpWydsYXQnXSxcbiAgICAgICAgbG9uOiBtYXBNb2RlbC5nZXQoJ2Nvb3JkaW5hdGVWYWx1ZXMnKVsnbG9uJ10sXG4gICAgICB9KVxuICAgICAgY29uc3QgcG9seWxpbmUgPSBtYXAuYWRkUnVsZXJMaW5lKG1hcE1vZGVsLmdldCgnY29vcmRpbmF0ZVZhbHVlcycpKVxuICAgICAgbWFwTW9kZWwuc2V0TGluZShwb2x5bGluZSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnRU5EJzpcbiAgICAgIHBvaW50ID0gbWFwLmFkZFJ1bGVyUG9pbnQobWFwTW9kZWwuZ2V0KCdjb29yZGluYXRlVmFsdWVzJykpXG4gICAgICBtYXBNb2RlbC5hZGRQb2ludChwb2ludClcbiAgICAgIG1hcC5zZXRSdWxlckxpbmUoe1xuICAgICAgICBsYXQ6IG1hcE1vZGVsLmdldCgnY29vcmRpbmF0ZVZhbHVlcycpWydsYXQnXSxcbiAgICAgICAgbG9uOiBtYXBNb2RlbC5nZXQoJ2Nvb3JkaW5hdGVWYWx1ZXMnKVsnbG9uJ10sXG4gICAgICB9KVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdOT05FJzpcbiAgICAgIGNsZWFyUnVsZXIoeyBtYXAsIG1hcE1vZGVsIH0pXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVha1xuICB9XG59XG4vKlxuICAgIEhhbmRsZXMgdGFza3MgZm9yIGNsZWFyaW5nIHRoZSBydWxlciwgd2hpY2ggaW5jbHVkZSByZW1vdmluZyBhbGwgcG9pbnRzXG4gICAgKGVuZHBvaW50cyBvZiB0aGUgbGluZSkgYW5kIHRoZSBsaW5lLlxuICAqL1xuY29uc3QgY2xlYXJSdWxlciA9ICh7IG1hcCwgbWFwTW9kZWwgfTogeyBtYXA6IGFueTsgbWFwTW9kZWw6IGFueSB9KSA9PiB7XG4gIGNvbnN0IHBvaW50cyA9IG1hcE1vZGVsLmdldCgncG9pbnRzJylcbiAgcG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICBtYXAucmVtb3ZlUnVsZXJQb2ludChwb2ludClcbiAgfSlcbiAgbWFwTW9kZWwuY2xlYXJQb2ludHMoKVxuICBjb25zdCBsaW5lID0gbWFwTW9kZWwucmVtb3ZlTGluZSgpXG4gIG1hcC5yZW1vdmVSdWxlckxpbmUobGluZSlcbn1cbi8qXG4gKiAgUmVkcmF3IGFuZCByZWNhbGN1bGF0ZSB0aGUgcnVsZXIgbGluZSBhbmQgZGlzdGFuY2VJbmZvIHRvb2x0aXAuIFdpbGwgbm90IHJlZHJhdyB3aGlsZSB0aGUgbWVudSBpcyBjdXJyZW50bHlcbiAqICBkaXNwbGF5ZWQgdXBkYXRlT25NZW51IGFsbG93cyB1cGRhdGluZyB3aGlsZSB0aGUgbWVudSBpcyB1cFxuICovXG5jb25zdCB1cGRhdGVEaXN0YW5jZSA9ICh7XG4gIG1hcCxcbiAgbWFwTW9kZWwsXG4gIHVwZGF0ZU9uTWVudSA9IGZhbHNlLFxufToge1xuICBtYXA6IGFueVxuICBtYXBNb2RlbDogYW55XG4gIHVwZGF0ZU9uTWVudT86IGJvb2xlYW5cbn0pID0+IHtcbiAgaWYgKG1hcE1vZGVsLmdldCgnbWVhc3VyZW1lbnRTdGF0ZScpID09PSAnU1RBUlQnKSB7XG4gICAgY29uc3Qgb3Blbk1lbnUgPSB0cnVlIC8vIFRPRE86IGludmVzdGlnYXRlIHRoaXNcbiAgICBjb25zdCBsYXQgPSBtYXBNb2RlbC5nZXQoJ21vdXNlTGF0JylcbiAgICBjb25zdCBsb24gPSBtYXBNb2RlbC5nZXQoJ21vdXNlTG9uJylcbiAgICBpZiAoKHVwZGF0ZU9uTWVudSA9PT0gdHJ1ZSB8fCAhb3Blbk1lbnUpICYmIGxhdCAmJiBsb24pIHtcbiAgICAgIC8vIHJlZHJhdyBydWxlciBsaW5lXG4gICAgICBjb25zdCBtb3VzZVBvaW50ID0geyBsYXQsIGxvbiB9XG4gICAgICBtYXAuc2V0UnVsZXJMaW5lKG1vdXNlUG9pbnQpXG4gICAgICAvLyB1cGRhdGUgZGlzdGFuY2UgaW5mb1xuICAgICAgY29uc3Qgc3RhcnRpbmdDb29yZGluYXRlcyA9IG1hcE1vZGVsLmdldCgnc3RhcnRpbmdDb29yZGluYXRlcycpXG4gICAgICBjb25zdCBkaXN0ID0gZ2V0RGlzdGFuY2UoXG4gICAgICAgIHsgbGF0aXR1ZGU6IGxhdCwgbG9uZ2l0dWRlOiBsb24gfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhdGl0dWRlOiBzdGFydGluZ0Nvb3JkaW5hdGVzWydsYXQnXSxcbiAgICAgICAgICBsb25naXR1ZGU6IHN0YXJ0aW5nQ29vcmRpbmF0ZXNbJ2xvbiddLFxuICAgICAgICB9XG4gICAgICApXG4gICAgICBtYXBNb2RlbC5zZXREaXN0YW5jZUluZm9Qb3NpdGlvbihcbiAgICAgICAgKGV2ZW50IGFzIGFueSkuY2xpZW50WCxcbiAgICAgICAgKGV2ZW50IGFzIGFueSkuY2xpZW50WVxuICAgICAgKVxuICAgICAgbWFwTW9kZWwuc2V0Q3VycmVudERpc3RhbmNlKGRpc3QpXG4gICAgfVxuICB9XG59XG5jb25zdCB1c2VXcmVxck1hcExpc3RlbmVycyA9ICh7IG1hcCB9OiB7IG1hcDogYW55IH0pID0+IHtcbiAgdXNlTGlzdGVuVG8obWFwID8gKHdyZXFyIGFzIGFueSkudmVudCA6IHVuZGVmaW5lZCwgJ21ldGFjYXJkOm92ZXJsYXknLCAoKSA9PiB7XG4gICAgbWFwLm92ZXJsYXlJbWFnZS5iaW5kKG1hcCkoKVxuICB9KVxuICB1c2VMaXN0ZW5UbyhcbiAgICBtYXAgPyAod3JlcXIgYXMgYW55KS52ZW50IDogdW5kZWZpbmVkLFxuICAgICdtZXRhY2FyZDpvdmVybGF5OnJlbW92ZScsXG4gICAgKCkgPT4ge1xuICAgICAgbWFwLnJlbW92ZU92ZXJsYXkuYmluZChtYXApKClcbiAgICB9XG4gIClcbiAgdXNlTGlzdGVuVG8oXG4gICAgbWFwID8gKHdyZXFyIGFzIGFueSkudmVudCA6IHVuZGVmaW5lZCxcbiAgICAnc2VhcmNoOm1hcHJlY3RhbmdsZWZseScsXG4gICAgKCkgPT4ge1xuICAgICAgbWFwLnpvb21Ub0V4dGVudC5iaW5kKG1hcCkoKVxuICAgIH1cbiAgKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXApIHtcbiAgICB9XG4gIH0sIFttYXBdKVxufVxuY29uc3QgdXNlU2VsZWN0aW9uSW50ZXJmYWNlTWFwTGlzdGVuZXJzID0gKHtcbiAgbWFwLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIG1hcDogYW55XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59KSA9PiB7XG4gIHVzZUxpc3RlblRvKFxuICAgIG1hcCA/IHNlbGVjdGlvbkludGVyZmFjZSA6IHVuZGVmaW5lZCxcbiAgICAncmVzZXQ6YWN0aXZlU2VhcmNoUmVzdWx0cycsXG4gICAgKCkgPT4ge1xuICAgICAgbWFwLnJlbW92ZUFsbE92ZXJsYXlzLmJpbmQobWFwKSgpXG4gICAgfVxuICApXG59XG5jb25zdCB1c2VMaXN0ZW5Ub01hcE1vZGVsID0gKHtcbiAgbWFwLFxuICBtYXBNb2RlbCxcbn06IHtcbiAgbWFwOiBhbnlcbiAgbWFwTW9kZWw6IGFueVxufSkgPT4ge1xuICB1c2VMaXN0ZW5UbyhcbiAgICBtYXAgJiYgbWFwTW9kZWwgPyBtYXBNb2RlbCA6IHVuZGVmaW5lZCxcbiAgICAnY2hhbmdlOm1lYXN1cmVtZW50U3RhdGUnLFxuICAgICgpID0+IHtcbiAgICAgIGhhbmRsZU1lYXN1cmVtZW50U3RhdGVDaGFuZ2UoeyBtYXAsIG1hcE1vZGVsIH0pXG4gICAgfVxuICApXG4gIHVzZUxpc3RlblRvKFxuICAgIG1hcCAmJiBtYXBNb2RlbCA/IG1hcE1vZGVsIDogdW5kZWZpbmVkLFxuICAgICdjaGFuZ2U6bW91c2VMYXQgY2hhbmdlOm1vdXNlTG9uJyxcbiAgICAoKSA9PiB7XG4gICAgICB1cGRhdGVEaXN0YW5jZSh7IG1hcCwgbWFwTW9kZWwgfSlcbiAgICB9XG4gIClcbn1cbmNvbnN0IHVwZGF0ZVRhcmdldCA9ICh7XG4gIG1hcE1vZGVsLFxuICBtZXRhY2FyZCxcbn06IHtcbiAgbWFwTW9kZWw6IGFueVxuICBtZXRhY2FyZDogTGF6eVF1ZXJ5UmVzdWx0XG59KSA9PiB7XG4gIGxldCB0YXJnZXRcbiAgbGV0IHRhcmdldE1ldGFjYXJkXG4gIGlmIChtZXRhY2FyZCkge1xuICAgIHRhcmdldCA9IG1ldGFjYXJkLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGVcbiAgICB0YXJnZXRNZXRhY2FyZCA9IG1ldGFjYXJkXG4gIH1cbiAgbWFwTW9kZWwuc2V0KHtcbiAgICB0YXJnZXQsXG4gICAgdGFyZ2V0TWV0YWNhcmQsXG4gIH0pXG59XG5jb25zdCBoYW5kbGVNYXBIb3ZlciA9ICh7XG4gIG1hcE1vZGVsLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIG1hcEV2ZW50LFxuICBzZXRJc0hvdmVyaW5nUmVzdWx0LFxuICBzZXRIb3Zlckdlbyxcbn06IHtcbiAgbWFwOiBhbnlcbiAgbWFwTW9kZWw6IGFueVxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxuICBtYXBFdmVudDogYW55XG4gIHNldElzSG92ZXJpbmdSZXN1bHQ6ICh2YWw6IGJvb2xlYW4pID0+IHZvaWRcbiAgc2V0SG92ZXJHZW86ICh2YWw6IEhvdmVyR2VvKSA9PiB2b2lkXG59KSA9PiB7XG4gIGNvbnN0IGlzSG92ZXJpbmdPdmVyR2VvID0gQm9vbGVhbihcbiAgICBtYXBFdmVudC5tYXBUYXJnZXQgJiZcbiAgICAgIG1hcEV2ZW50Lm1hcFRhcmdldC5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nICYmXG4gICAgICAoKG1hcEV2ZW50Lm1hcFRhcmdldCBhcyBzdHJpbmcpLnN0YXJ0c1dpdGgoU0hBUEVfSURfUFJFRklYKSB8fFxuICAgICAgICBtYXBFdmVudC5tYXBUYXJnZXQgPT09ICd1c2VyRHJhd2luZycpXG4gIClcblxuICBpZiAoaXNIb3ZlcmluZ092ZXJHZW8pIHtcbiAgICBzZXRIb3Zlckdlbyh7XG4gICAgICBpZDogbWFwRXZlbnQubWFwTG9jYXRpb25JZCxcbiAgICAgIGludGVyYWN0aXZlOiBCb29sZWFuKG1hcEV2ZW50Lm1hcExvY2F0aW9uSWQpLFxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgc2V0SG92ZXJHZW8oe30pXG4gIH1cblxuICBpZiAoIXNlbGVjdGlvbkludGVyZmFjZSkge1xuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGN1cnJlbnRRdWVyeSA9IHNlbGVjdGlvbkludGVyZmFjZS5nZXQoJ2N1cnJlbnRRdWVyeScpXG4gIGlmICghY3VycmVudFF1ZXJ5KSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gY3VycmVudFF1ZXJ5LmdldCgncmVzdWx0JylcbiAgaWYgKCFyZXN1bHQpIHtcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBtZXRhY2FyZCA9IHJlc3VsdC5nZXQoJ2xhenlSZXN1bHRzJykucmVzdWx0c1ttYXBFdmVudC5tYXBUYXJnZXRdXG4gIHVwZGF0ZVRhcmdldCh7IG1ldGFjYXJkLCBtYXBNb2RlbCB9KVxuXG4gIHNldElzSG92ZXJpbmdSZXN1bHQoXG4gICAgQm9vbGVhbihcbiAgICAgIG1hcEV2ZW50Lm1hcFRhcmdldCAmJlxuICAgICAgICBtYXBFdmVudC5tYXBUYXJnZXQgIT09ICd1c2VyRHJhd2luZycgJiZcbiAgICAgICAgKEFycmF5LmlzQXJyYXkobWFwRXZlbnQubWFwVGFyZ2V0KSB8fFxuICAgICAgICAgIChtYXBFdmVudC5tYXBUYXJnZXQuY29uc3RydWN0b3IgPT09IFN0cmluZyAmJlxuICAgICAgICAgICAgIShtYXBFdmVudC5tYXBUYXJnZXQgYXMgc3RyaW5nKS5zdGFydHNXaXRoKFNIQVBFX0lEX1BSRUZJWCkpKVxuICAgIClcbiAgKVxufVxuXG5jb25zdCBnZXRMb2NhdGlvbiA9IChtb2RlbDogQmFja2JvbmUuTW9kZWwsIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb24pID0+IHtcbiAgY29uc3QgbG9jYXRpb25UeXBlID0gZ2V0RHJhd01vZGVGcm9tTW9kZWwoeyBtb2RlbCB9KVxuICBzd2l0Y2ggKGxvY2F0aW9uVHlwZSkge1xuICAgIGNhc2UgJ2Jib3gnOlxuICAgICAgY29uc3QgYmJveCA9IF8ucGljayhcbiAgICAgICAgbW9kZWwuYXR0cmlidXRlcyxcbiAgICAgICAgJ21hcE5vcnRoJyxcbiAgICAgICAgJ21hcFNvdXRoJyxcbiAgICAgICAgJ21hcEVhc3QnLFxuICAgICAgICAnbWFwV2VzdCcsXG4gICAgICAgICdub3J0aCcsXG4gICAgICAgICdzb3V0aCcsXG4gICAgICAgICdlYXN0JyxcbiAgICAgICAgJ3dlc3QnXG4gICAgICApXG4gICAgICBpZiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRlZEJib3ggPSB0cmFuc2xhdGVCYm94KGJib3gsIHRyYW5zbGF0aW9uKVxuICAgICAgICByZXR1cm4gdHJhbnNsYXRlZEJib3hcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYm94XG4gICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgIGNvbnN0IHBvaW50ID0gXy5waWNrKG1vZGVsLmF0dHJpYnV0ZXMsICdsYXQnLCAnbG9uJylcbiAgICAgIGlmICh0cmFuc2xhdGlvbikge1xuICAgICAgICBjb25zdCB0cmFuc2xhdGVkUG9pbnQgPSB0cmFuc2xhdGVQb2ludChcbiAgICAgICAgICBwb2ludC5sb24sXG4gICAgICAgICAgcG9pbnQubGF0LFxuICAgICAgICAgIHRyYW5zbGF0aW9uXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZWRQb2ludFxuICAgICAgfVxuICAgICAgcmV0dXJuIHBvaW50XG4gICAgY2FzZSAnbGluZSc6XG4gICAgICBjb25zdCBsaW5lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtb2RlbC5nZXQoJ2xpbmUnKSkpXG4gICAgICBpZiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgdHJhbnNsYXRlTGluZShsaW5lLCB0cmFuc2xhdGlvbilcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGxpbmUgfVxuICAgIGNhc2UgJ3BvbHknOlxuICAgICAgY29uc3QgcG9seWdvbiA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobW9kZWwuZ2V0KCdwb2x5Z29uJykpKVxuICAgICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgIGNvbnN0IG11bHRpUG9seWdvbiA9IFNoYXBlVXRpbHMuaXNBcnJheTNEKHBvbHlnb24pID8gcG9seWdvbiA6IFtwb2x5Z29uXVxuICAgICAgICB0cmFuc2xhdGVQb2x5Z29uKG11bHRpUG9seWdvbiwgdHJhbnNsYXRpb24pXG4gICAgICB9XG4gICAgICByZXR1cm4geyBwb2x5Z29uIH1cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHt9XG4gIH1cbn1cblxudHlwZSBMb25MYXQgPSBbbG9uZ2l0dWRlOiBudW1iZXIsIGxhdGl0dWRlOiBudW1iZXJdXG5cbmNvbnN0IHRyYW5zbGF0ZVBvbHlnb24gPSAocG9seWdvbjogTG9uTGF0W11bXSwgdHJhbnNsYXRpb246IFRyYW5zbGF0aW9uKSA9PiB7XG4gIC8vIG9kZCB0aGluZ3MgaGFwcGVuIHdoZW4gbGF0aXR1ZGUgaXMgZXhhY3RseSBvciB2ZXJ5IGNsb3NlIHRvIGVpdGhlciA5MCBvciAtOTBcbiAgY29uc3Qgbm9ydGhQb2xlID0gODkuOTlcbiAgY29uc3Qgc291dGhQb2xlID0gLTg5Ljk5XG4gIGxldCBtYXhMYXQgPSAwXG4gIGxldCBtaW5MYXQgPSAwXG4gIGxldCBkaWZmID0gMFxuXG4gIGZvciAoY29uc3QgcmluZyBvZiBwb2x5Z29uKSB7XG4gICAgZm9yIChjb25zdCBjb29yZCBvZiByaW5nKSB7XG4gICAgICBjb25zdCBbbG9uLCBsYXRdID0gdHJhbnNsYXRlQ29vcmRpbmF0ZXMoY29vcmRbMF0sIGNvb3JkWzFdLCB0cmFuc2xhdGlvbilcbiAgICAgIGNvb3JkWzBdID0gbG9uXG4gICAgICBjb29yZFsxXSA9IGxhdFxuICAgICAgbWF4TGF0ID0gTWF0aC5tYXgobGF0LCBtYXhMYXQpXG4gICAgICBtaW5MYXQgPSBNYXRoLm1pbihsYXQsIG1pbkxhdClcbiAgICB9XG4gIH1cblxuICBpZiAobWF4TGF0ID4gbm9ydGhQb2xlKSB7XG4gICAgZGlmZiA9IE1hdGguYWJzKG1heExhdCAtIG5vcnRoUG9sZSlcbiAgfSBlbHNlIGlmIChtaW5MYXQgPCBzb3V0aFBvbGUpIHtcbiAgICBkaWZmID0gLU1hdGguYWJzKG1pbkxhdCAtIHNvdXRoUG9sZSlcbiAgfVxuXG4gIGlmIChkaWZmICE9PSAwKSB7XG4gICAgZm9yIChjb25zdCByaW5nIG9mIHBvbHlnb24pIHtcbiAgICAgIGZvciAoY29uc3QgY29vcmQgb2YgcmluZykge1xuICAgICAgICBjb29yZFsxXSAtPSBkaWZmXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IHRyYW5zbGF0ZUxpbmUgPSAobGluZTogTG9uTGF0W10sIHRyYW5zbGF0aW9uOiBUcmFuc2xhdGlvbikgPT4ge1xuICAvLyBvZGQgdGhpbmdzIGhhcHBlbiB3aGVuIGxhdGl0dWRlIGlzIGV4YWN0bHkgb3IgdmVyeSBjbG9zZSB0byBlaXRoZXIgOTAgb3IgLTkwXG4gIGNvbnN0IG5vcnRoUG9sZSA9IDg5Ljk5XG4gIGNvbnN0IHNvdXRoUG9sZSA9IC04OS45OVxuICBsZXQgbWF4TGF0ID0gMFxuICBsZXQgbWluTGF0ID0gMFxuICBsZXQgZGlmZiA9IDBcbiAgZm9yIChjb25zdCBjb29yZCBvZiBsaW5lKSB7XG4gICAgY29uc3QgW2xvbiwgbGF0XSA9IHRyYW5zbGF0ZUNvb3JkaW5hdGVzKGNvb3JkWzBdLCBjb29yZFsxXSwgdHJhbnNsYXRpb24pXG4gICAgbWF4TGF0ID0gTWF0aC5tYXgobGF0LCBtYXhMYXQpXG4gICAgbWluTGF0ID0gTWF0aC5taW4obGF0LCBtaW5MYXQpXG4gICAgY29vcmRbMF0gPSBsb25cbiAgICBjb29yZFsxXSA9IGxhdFxuICB9XG5cbiAgLy8gcHJldmVudCBwb2xhciBjcm9zc2luZ1xuICBpZiAobWF4TGF0ID4gbm9ydGhQb2xlKSB7XG4gICAgZGlmZiA9IE1hdGguYWJzKG1heExhdCAtIG5vcnRoUG9sZSlcbiAgfSBlbHNlIGlmIChtaW5MYXQgPCBzb3V0aFBvbGUpIHtcbiAgICBkaWZmID0gLU1hdGguYWJzKG1pbkxhdCAtIHNvdXRoUG9sZSlcbiAgfVxuXG4gIGlmIChkaWZmICE9PSAwKSB7XG4gICAgZm9yIChjb25zdCBjb29yZCBvZiBsaW5lKSB7XG4gICAgICBjb29yZFsxXSAtPSBkaWZmXG4gICAgfVxuICB9XG59XG5cbnR5cGUgYmJveENvb3JkcyA9IHtcbiAgbWFwTm9ydGg6IG51bWJlclxuICBtYXBTb3V0aDogbnVtYmVyXG4gIG1hcEVhc3Q6IG51bWJlclxuICBtYXBXZXN0OiBudW1iZXJcbiAgbm9ydGg/OiBudW1iZXJcbiAgc291dGg/OiBudW1iZXJcbiAgZWFzdD86IG51bWJlclxuICB3ZXN0PzogbnVtYmVyXG59XG5cbmNvbnN0IHRyYW5zbGF0ZUJib3ggPSAoXG4gIGJib3g6IGJib3hDb29yZHMsXG4gIHRyYW5zbGF0aW9uOiBUcmFuc2xhdGlvblxuKTogYmJveENvb3JkcyA9PiB7XG4gIGNvbnN0IHRyYW5zbGF0ZWQgPSB7IC4uLmJib3ggfVxuICBsZXQgW2Vhc3QsIG5vcnRoXSA9IHRyYW5zbGF0ZUNvb3JkaW5hdGVzKFxuICAgIGJib3gubWFwRWFzdCxcbiAgICBiYm94Lm1hcE5vcnRoLFxuICAgIHRyYW5zbGF0aW9uXG4gIClcbiAgbGV0IFt3ZXN0LCBzb3V0aF0gPSB0cmFuc2xhdGVDb29yZGluYXRlcyhcbiAgICBiYm94Lm1hcFdlc3QsXG4gICAgYmJveC5tYXBTb3V0aCxcbiAgICB0cmFuc2xhdGlvblxuICApXG5cbiAgY29uc3Qgbm9ydGhQb2xlID0gOTBcbiAgY29uc3Qgc291dGhQb2xlID0gLTkwXG5cbiAgLy8gcHJldmVudCBwb2xhciBjcm9zc2luZ1xuICBsZXQgZGlmZlxuICBpZiAobm9ydGggPiBub3J0aFBvbGUpIHtcbiAgICBkaWZmID0gTWF0aC5hYnMobm9ydGggLSBub3J0aFBvbGUpXG4gICAgbm9ydGggPSBub3J0aFBvbGVcbiAgICBzb3V0aCA9IHNvdXRoIC0gZGlmZlxuICB9XG5cbiAgaWYgKHNvdXRoIDwgc291dGhQb2xlKSB7XG4gICAgZGlmZiA9IE1hdGguYWJzKHNvdXRoUG9sZSAtIHNvdXRoKVxuICAgIHNvdXRoID0gc291dGhQb2xlXG4gICAgbm9ydGggPSBub3J0aCArIGRpZmZcbiAgfVxuXG4gIHRyYW5zbGF0ZWQubWFwTm9ydGggPSBub3J0aFxuICB0cmFuc2xhdGVkLm1hcEVhc3QgPSBlYXN0XG4gIHRyYW5zbGF0ZWQubWFwU291dGggPSBzb3V0aFxuICB0cmFuc2xhdGVkLm1hcFdlc3QgPSB3ZXN0XG5cbiAgdHJhbnNsYXRlZC5ub3J0aCA9IG5vcnRoXG4gIHRyYW5zbGF0ZWQuZWFzdCA9IGVhc3RcbiAgdHJhbnNsYXRlZC5zb3V0aCA9IHNvdXRoXG4gIHRyYW5zbGF0ZWQud2VzdCA9IHdlc3RcblxuICByZXR1cm4gdHJhbnNsYXRlZFxufVxuXG5jb25zdCB0cmFuc2xhdGVQb2ludCA9IChcbiAgbG9uOiBudW1iZXIsXG4gIGxhdDogbnVtYmVyLFxuICB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb25cbik6IHsgbG9uOiBudW1iZXI7IGxhdDogbnVtYmVyIH0gPT4ge1xuICBsZXQgW3VwZGF0ZWRMb24sIHVwZGF0ZWRMYXRdID0gdHJhbnNsYXRlQ29vcmRpbmF0ZXMobG9uLCBsYXQsIHRyYW5zbGF0aW9uKVxuICBjb25zdCBub3J0aFBvbGUgPSA4OS45OVxuICBjb25zdCBzb3V0aFBvbGUgPSAtODkuOTlcblxuICBpZiAodXBkYXRlZExhdCA+IG5vcnRoUG9sZSkge1xuICAgIHVwZGF0ZWRMYXQgPSBub3J0aFBvbGVcbiAgfSBlbHNlIGlmICh1cGRhdGVkTGF0IDwgc291dGhQb2xlKSB7XG4gICAgdXBkYXRlZExhdCA9IHNvdXRoUG9sZVxuICB9XG4gIHJldHVybiB7IGxvbjogdXBkYXRlZExvbiwgbGF0OiB1cGRhdGVkTGF0IH1cbn1cblxuY29uc3QgdHJhbnNsYXRlQ29vcmRpbmF0ZXMgPSAoXG4gIGxvbmdpdHVkZTogbnVtYmVyLFxuICBsYXRpdHVkZTogbnVtYmVyLFxuICB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb25cbik6IExvbkxhdCA9PiB7XG4gIGxldCB0cmFuc2xhdGVkTG9uID0gbG9uZ2l0dWRlICsgdHJhbnNsYXRpb24ubG9uZ2l0dWRlXG4gIGxldCB0cmFuc2xhdGVkTGF0ID0gbGF0aXR1ZGUgKyB0cmFuc2xhdGlvbi5sYXRpdHVkZVxuXG4gIC8vIG5vcm1hbGl6ZSBsb25naXR1ZGVcbiAgaWYgKHRyYW5zbGF0ZWRMb24gPiAxODApIHtcbiAgICB0cmFuc2xhdGVkTG9uIC09IDM2MFxuICB9XG4gIGlmICh0cmFuc2xhdGVkTG9uIDwgLTE4MCkge1xuICAgIHRyYW5zbGF0ZWRMb24gKz0gMzYwXG4gIH1cblxuICByZXR1cm4gW3RyYW5zbGF0ZWRMb24sIHRyYW5zbGF0ZWRMYXRdXG59XG5cbmNvbnN0IHVzZU1hcExpc3RlbmVycyA9ICh7XG4gIG1hcCxcbiAgbWFwTW9kZWwsXG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgbWFwTW9kZWw6IGFueVxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxufSkgPT4ge1xuICBjb25zdCBbaXNIb3ZlcmluZ1Jlc3VsdCwgc2V0SXNIb3ZlcmluZ1Jlc3VsdF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2hvdmVyR2VvLCBzZXRIb3Zlckdlb10gPSBSZWFjdC51c2VTdGF0ZTxIb3Zlckdlbz4oe30pXG4gIGNvbnN0IHtcbiAgICBtb3ZlRnJvbSxcbiAgICBzZXRNb3ZlRnJvbSxcbiAgICBpbnRlcmFjdGl2ZUdlbyxcbiAgICBzZXRJbnRlcmFjdGl2ZUdlbyxcbiAgICBpbnRlcmFjdGl2ZU1vZGVscyxcbiAgICBzZXRJbnRlcmFjdGl2ZU1vZGVscyxcbiAgICB0cmFuc2xhdGlvbixcbiAgICBzZXRUcmFuc2xhdGlvbixcbiAgfSA9IFJlYWN0LnVzZUNvbnRleHQoSW50ZXJhY3Rpb25zQ29udGV4dClcblxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcblxuICBjb25zdCB1cENhbGxiYWNrUmVmID0gUmVhY3QudXNlUmVmPCgoKSA9PiB2b2lkKSB8IG51bGw+KG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB1cENhbGxiYWNrUmVmLmN1cnJlbnQgPSAoKSA9PiB7XG4gICAgICBpZiAoaW50ZXJhY3RpdmVNb2RlbHMubGVuZ3RoID4gMCAmJiB0cmFuc2xhdGlvbikge1xuICAgICAgICBjb25zdCB1bmRvRm5zOiAoKCkgPT4ge30pW10gPSBbXVxuICAgICAgICBmb3IgKGNvbnN0IG1vZGVsIG9mIGludGVyYWN0aXZlTW9kZWxzKSB7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxMb2NhdGlvbiA9IGdldExvY2F0aW9uKG1vZGVsKVxuICAgICAgICAgIGNvbnN0IG5ld0xvY2F0aW9uID0gZ2V0TG9jYXRpb24obW9kZWwsIHRyYW5zbGF0aW9uKVxuICAgICAgICAgIG1vZGVsLnNldChuZXdMb2NhdGlvbilcbiAgICAgICAgICB1bmRvRm5zLnB1c2goKCkgPT4gbW9kZWwuc2V0KG9yaWdpbmFsTG9jYXRpb24pKVxuICAgICAgICB9XG4gICAgICAgIGFkZFNuYWNrKFxuICAgICAgICAgICdMb2NhdGlvbiB1cGRhdGVkLiBZb3UgbWF5IHN0aWxsIG5lZWQgdG8gc2F2ZSB0aGUgaXRlbSB0aGF0IHVzZXMgaXQuJyxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogYCR7aW50ZXJhY3RpdmVHZW99Lm1vdmVgLFxuICAgICAgICAgICAgdW5kbzogKCkgPT4ge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHVuZG9GbiBvZiB1bmRvRm5zKSB7XG4gICAgICAgICAgICAgICAgdW5kb0ZuKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHNldE1vdmVGcm9tKG51bGwpXG4gICAgICBzZXRUcmFuc2xhdGlvbihudWxsKVxuICAgIH1cbiAgfSwgW2ludGVyYWN0aXZlTW9kZWxzLCB0cmFuc2xhdGlvbl0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaW50ZXJhY3RpdmVHZW8pIHtcbiAgICAgIC8vIFRoaXMgaGFuZGxlciBtaWdodCBkaXNhYmxlIGRyYWdnaW5nIHRvIG1vdmUgdGhlIG1hcCwgc28gb25seSBzZXQgaXQgdXBcbiAgICAgIC8vIHdoZW4gdGhlIHVzZXIgaGFzIHN0YXJ0ZWQgaW50ZXJhY3Rpbmcgd2l0aCBhIGdlby5cbiAgICAgIG1hcC5vbk1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKHtcbiAgICAgICAgbW92ZUZyb20sXG4gICAgICAgIGRvd246ICh7XG4gICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgbWFwTG9jYXRpb25JZCxcbiAgICAgICAgfToge1xuICAgICAgICAgIHBvc2l0aW9uOiBhbnlcbiAgICAgICAgICBtYXBMb2NhdGlvbklkOiBudW1iZXJcbiAgICAgICAgfSkgPT4ge1xuICAgICAgICAgIGlmIChtYXBMb2NhdGlvbklkID09PSBpbnRlcmFjdGl2ZUdlbyAmJiAhRHJhd2luZy5pc0RyYXdpbmcoKSkge1xuICAgICAgICAgICAgc2V0TW92ZUZyb20ocG9zaXRpb24pXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtb3ZlOiAoe1xuICAgICAgICAgIHRyYW5zbGF0aW9uLFxuICAgICAgICAgIG1hcExvY2F0aW9uSWQsXG4gICAgICAgIH06IHtcbiAgICAgICAgICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gICAgICAgICAgbWFwTG9jYXRpb25JZDogbnVtYmVyXG4gICAgICAgIH0pID0+IHtcbiAgICAgICAgICBpZiAobWFwTG9jYXRpb25JZCA9PT0gaW50ZXJhY3RpdmVHZW8pIHtcbiAgICAgICAgICAgIHNldEhvdmVyR2VvKHtcbiAgICAgICAgICAgICAgaWQ6IG1hcExvY2F0aW9uSWQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRIb3Zlckdlbyh7fSlcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0VHJhbnNsYXRpb24odHJhbnNsYXRpb24gPz8gbnVsbClcbiAgICAgICAgfSxcbiAgICAgICAgdXA6ICgpID0+IHVwQ2FsbGJhY2tSZWYuY3VycmVudD8uKCksXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gbWFwPy5jbGVhck1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKClcbiAgfSwgW21hcCwgaW50ZXJhY3RpdmVHZW8sIG1vdmVGcm9tXSlcblxuICBjb25zdCBoYW5kbGVLZXlkb3duID0gUmVhY3QudXNlQ2FsbGJhY2soKGU6IGFueSkgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgIHNldEludGVyYWN0aXZlR2VvKG51bGwpXG4gICAgICBzZXRJbnRlcmFjdGl2ZU1vZGVscyhbXSlcbiAgICAgIHNldE1vdmVGcm9tKG51bGwpXG4gICAgICBzZXRUcmFuc2xhdGlvbihudWxsKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaW50ZXJhY3RpdmVHZW8pIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5ZG93bilcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICB9LCBbaW50ZXJhY3RpdmVHZW9dKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcCAmJiAhbW92ZUZyb20pIHtcbiAgICAgIGNvbnN0IGhhbmRsZUxlZnRDbGljayA9IChtYXBMb2NhdGlvbklkPzogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChtYXBMb2NhdGlvbklkICYmICFpbnRlcmFjdGl2ZUdlbyAmJiAhRHJhd2luZy5pc0RyYXdpbmcoKSkge1xuICAgICAgICAgIHNldEludGVyYWN0aXZlR2VvKG1hcExvY2F0aW9uSWQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0SW50ZXJhY3RpdmVHZW8obnVsbClcbiAgICAgICAgICBzZXRJbnRlcmFjdGl2ZU1vZGVscyhbXSlcbiAgICAgICAgICBzZXRNb3ZlRnJvbShudWxsKVxuICAgICAgICAgIHNldFRyYW5zbGF0aW9uKG51bGwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG1hcC5vbkxlZnRDbGlja01hcEFQSShoYW5kbGVMZWZ0Q2xpY2spXG4gICAgfVxuICAgIGlmIChtYXAgJiYgIWludGVyYWN0aXZlR2VvKSB7XG4gICAgICBpZiAoIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICAgLy8gQ2xpY2tzIHVzZWQgaW4gZHJhd2luZyBvbiB0aGUgM0QgbWFwLCBzbyBsZXQncyBpZ25vcmUgdGhlbSBoZXJlXG4gICAgICAgIC8vIHdoaWxlIGRyYXdpbmcuXG4gICAgICAgIG1hcC5vbkRvdWJsZUNsaWNrKClcbiAgICAgICAgbWFwLm9uUmlnaHRDbGljaygoZXZlbnQ6IGFueSwgX21hcEV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgbWFwTW9kZWwuc2V0KHtcbiAgICAgICAgICAgIG1vdXNlWDogZXZlbnQub2Zmc2V0WCxcbiAgICAgICAgICAgIG1vdXNlWTogZXZlbnQub2Zmc2V0WSxcbiAgICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBtYXBNb2RlbC51cGRhdGVDbGlja0Nvb3JkaW5hdGVzKClcbiAgICAgICAgICB1cGRhdGVEaXN0YW5jZSh7IG1hcCwgbWFwTW9kZWwsIHVwZGF0ZU9uTWVudTogdHJ1ZSB9KVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAobWFwTW9kZWwpIHtcbiAgICAgICAgbWFwLm9uTW91c2VNb3ZlKChfZXZlbnQ6IGFueSwgbWFwRXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICAgIGhhbmRsZU1hcEhvdmVyKHtcbiAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgIG1hcEV2ZW50LFxuICAgICAgICAgICAgbWFwTW9kZWwsXG4gICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgICAgICAgICBzZXRJc0hvdmVyaW5nUmVzdWx0LFxuICAgICAgICAgICAgc2V0SG92ZXJHZW8sXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIG1hcD8uY2xlYXJNb3VzZU1vdmUoKVxuICAgICAgbWFwPy5jbGVhckRvdWJsZUNsaWNrKClcbiAgICAgIG1hcD8uY2xlYXJSaWdodENsaWNrKClcbiAgICAgIG1hcD8uY2xlYXJMZWZ0Q2xpY2tNYXBBUEkoKVxuICAgIH1cbiAgfSwgW21hcCwgbWFwTW9kZWwsIHNlbGVjdGlvbkludGVyZmFjZSwgaW50ZXJhY3RpdmVHZW8sIG1vdmVGcm9tXSlcbiAgcmV0dXJuIHtcbiAgICBpc0hvdmVyaW5nUmVzdWx0LFxuICAgIGhvdmVyR2VvLFxuICAgIGludGVyYWN0aXZlR2VvLFxuICAgIHNldEludGVyYWN0aXZlR2VvLFxuICAgIG1vdmVGcm9tLFxuICB9XG59XG5jb25zdCB1c2VPbk1vdXNlTGVhdmUgPSAoe1xuICBtYXBFbGVtZW50LFxuICBtYXBNb2RlbCxcbn06IHtcbiAgbWFwRWxlbWVudDogYW55XG4gIG1hcE1vZGVsOiBhbnlcbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwRWxlbWVudCAmJiBtYXBNb2RlbCkge1xuICAgICAgbWFwRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICBtYXBNb2RlbC5jbGVhck1vdXNlQ29vcmRpbmF0ZXMoKVxuICAgICAgfSlcbiAgICB9XG4gIH0sIFttYXBFbGVtZW50LCBtYXBNb2RlbF0pXG59XG5jb25zdCB1c2VMaXN0ZW5Ub0RyYXdpbmcgPSAoKSA9PiB7XG4gIGNvbnN0IFtpc0RyYXdpbmcsIHNldElzRHJhd2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgdXNlTGlzdGVuVG8oRHJhd2luZywgJ2NoYW5nZTpkcmF3aW5nJywgKCkgPT4ge1xuICAgIHNldElzRHJhd2luZyhEcmF3aW5nLmlzRHJhd2luZygpKVxuICB9KVxuICByZXR1cm4gaXNEcmF3aW5nXG59XG50eXBlIE1hcFZpZXdSZWFjdFR5cGUgPSB7XG4gIHNldE1hcDogKG1hcDogYW55KSA9PiB2b2lkXG4gIC8qXG4gICAgICBNYXAgY3JlYXRpb24gaXMgZGVmZXJyZWQgdG8gdGhpcyBtZXRob2QsIHNvIHRoYXQgYWxsIHJlc291cmNlcyBwZXJ0YWluaW5nIHRvIHRoZSBtYXAgY2FuIGJlIGxvYWRlZCBsYXppbHkgYW5kXG4gICAgICBub3QgYmUgaW5jbHVkZWQgaW4gdGhlIGluaXRpYWwgcGFnZSBwYXlsb2FkLlxuICAgICAgQmVjYXVzZSBvZiB0aGlzLCBtYWtlIHN1cmUgdG8gcmV0dXJuIGEgZGVmZXJyZWQgdGhhdCB3aWxsIHJlc29sdmUgd2hlbiB5b3VyIHJlc3BlY3RpdmUgbWFwIGltcGxlbWVudGF0aW9uXG4gICAgICBpcyBmaW5pc2hlZCBsb2FkaW5nIC8gc3RhcnRpbmcgdXAuXG4gICAgICBBbHNvLCBtYWtlIHN1cmUgeW91IHJlc29sdmUgdGhhdCBkZWZlcnJlZCBieSBwYXNzaW5nIHRoZSByZWZlcmVuY2UgdG8gdGhlIG1hcCBpbXBsZW1lbnRhdGlvbi5cbiAgICAqL1xuICBsb2FkTWFwOiAoKSA9PiBhbnlcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgbWFwTGF5ZXJzOiBhbnlcbn1cbmNvbnN0IHVzZUNoYW5nZUN1cnNvck9uSG92ZXIgPSAoe1xuICBtYXBFbGVtZW50LFxuICBpc0hvdmVyaW5nUmVzdWx0LFxuICBob3ZlckdlbyxcbiAgaW50ZXJhY3RpdmVHZW8sXG4gIG1vdmVGcm9tLFxuICBpc0RyYXdpbmcsXG59OiB7XG4gIG1hcEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICBpc0hvdmVyaW5nUmVzdWx0OiBib29sZWFuXG4gIGhvdmVyR2VvOiBIb3Zlckdlb1xuICBpbnRlcmFjdGl2ZUdlbzogbnVtYmVyIHwgbnVsbFxuICBtb3ZlRnJvbTogQ2VzaXVtLkNhcnRlc2lhbjMgfCBudWxsXG4gIGlzRHJhd2luZzogYm9vbGVhblxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXBFbGVtZW50KSB7XG4gICAgICBjb25zdCBjYW52YXMgPSBtYXBFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpXG5cbiAgICAgIGlmIChjYW52YXMgJiYgIWlzRHJhd2luZykge1xuICAgICAgICBpZiAoaW50ZXJhY3RpdmVHZW8pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgdXNlciBpcyBpbiAnaW50ZXJhY3RpdmUgbW9kZScgd2l0aCBhIGdlbywgb25seSBzaG93IGEgc3BlY2lhbCBjdXJzb3JcbiAgICAgICAgICAvLyB3aGVuIGhvdmVyaW5nIG92ZXIgdGhhdCBnZW8uXG4gICAgICAgICAgaWYgKGhvdmVyR2VvLmlkID09PSBpbnRlcmFjdGl2ZUdlbykge1xuICAgICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9IG1vdmVGcm9tID8gJ2dyYWJiaW5nJyA6ICdncmFiJ1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUuY3Vyc29yID0gJydcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaG92ZXJHZW8uaW50ZXJhY3RpdmUgfHwgaXNIb3ZlcmluZ1Jlc3VsdCkge1xuICAgICAgICAgIGNhbnZhcy5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcidcbiAgICAgICAgfSBlbHNlIGlmIChob3Zlckdlby5pbnRlcmFjdGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBjYW52YXMuc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbnZhcy5zdHlsZS5jdXJzb3IgPSAnJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCBbbWFwRWxlbWVudCwgaXNIb3ZlcmluZ1Jlc3VsdCwgaG92ZXJHZW8sIGludGVyYWN0aXZlR2VvLCBtb3ZlRnJvbV0pXG59XG5jb25zdCB1c2VDaGFuZ2VDdXJzb3JPbkRyYXdpbmcgPSAoe1xuICBtYXBFbGVtZW50LFxuICBpc0RyYXdpbmcsXG59OiB7XG4gIG1hcEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICBpc0RyYXdpbmc6IGJvb2xlYW5cbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwRWxlbWVudCkge1xuICAgICAgY29uc3QgY2FudmFzID0gbWFwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKVxuICAgICAgaWYgKGNhbnZhcykge1xuICAgICAgICBpZiAoaXNEcmF3aW5nKSB7XG4gICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9ICcnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIFttYXBFbGVtZW50LCBpc0RyYXdpbmddKVxufVxuZXhwb3J0IGNvbnN0IE1hcFZpZXdSZWFjdCA9IChwcm9wczogTWFwVmlld1JlYWN0VHlwZSkgPT4ge1xuICBjb25zdCBbaXNDbHVzdGVyaW5nLCBzZXRJc0NsdXN0ZXJpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IG1hcE1vZGVsID0gdXNlTWFwTW9kZWwoKVxuICBjb25zdCBbbWFwRHJhd2luZ1BvcHVwRWxlbWVudCwgc2V0TWFwRHJhd2luZ1BvcHVwRWxlbWVudF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbnRhaW5lckVsZW1lbnQsIHNldENvbnRhaW5lckVsZW1lbnRdID1cbiAgICBSZWFjdC51c2VTdGF0ZTxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFttYXBFbGVtZW50LCBzZXRNYXBFbGVtZW50XSA9IFJlYWN0LnVzZVN0YXRlPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4oXG4gICAgbnVsbFxuICApXG4gIGNvbnN0IG1hcCA9IHVzZU1hcCh7XG4gICAgLi4ucHJvcHMsXG4gICAgbWFwRWxlbWVudCxcbiAgICBtYXBNb2RlbCxcbiAgICBjb250YWluZXJFbGVtZW50LFxuICAgIG1hcERyYXdpbmdQb3B1cEVsZW1lbnQsXG4gIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcHJvcHMuc2V0TWFwKG1hcCkgLy8gYWxsb3cgb3V0c2lkZSBhY2Nlc3MgdG8gbWFwXG4gIH0sIFttYXBdKVxuICB1c2VXcmVxck1hcExpc3RlbmVycyh7IG1hcCB9KVxuICB1c2VTZWxlY3Rpb25JbnRlcmZhY2VNYXBMaXN0ZW5lcnMoe1xuICAgIG1hcCxcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2U6IHByb3BzLnNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgdXNlTGlzdGVuVG9NYXBNb2RlbCh7IG1hcCwgbWFwTW9kZWwgfSlcbiAgY29uc3QgeyBpc0hvdmVyaW5nUmVzdWx0LCBob3ZlckdlbywgaW50ZXJhY3RpdmVHZW8sIG1vdmVGcm9tIH0gPVxuICAgIHVzZU1hcExpc3RlbmVycyh7XG4gICAgICBtYXAsXG4gICAgICBtYXBNb2RlbCxcbiAgICAgIHNlbGVjdGlvbkludGVyZmFjZTogcHJvcHMuc2VsZWN0aW9uSW50ZXJmYWNlLFxuICAgIH0pXG4gIHVzZU9uTW91c2VMZWF2ZSh7IG1hcEVsZW1lbnQsIG1hcE1vZGVsIH0pXG4gIGNvbnN0IGlzRHJhd2luZyA9IHVzZUxpc3RlblRvRHJhd2luZygpXG4gIHVzZUNoYW5nZUN1cnNvck9uRHJhd2luZyh7IG1hcEVsZW1lbnQsIGlzRHJhd2luZyB9KVxuICB1c2VDaGFuZ2VDdXJzb3JPbkhvdmVyKHtcbiAgICBpc0hvdmVyaW5nUmVzdWx0LFxuICAgIGhvdmVyR2VvLFxuICAgIGludGVyYWN0aXZlR2VvLFxuICAgIG1vdmVGcm9tLFxuICAgIGlzRHJhd2luZyxcbiAgICBtYXBFbGVtZW50LFxuICB9KVxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICByZWY9e3NldENvbnRhaW5lckVsZW1lbnR9XG4gICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgaC1mdWxsIGJnLWluaGVyaXQgcmVsYXRpdmUgcC0yYH1cbiAgICA+XG4gICAgICB7IW1hcCA/IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8TGluZWFyUHJvZ3Jlc3NcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMCB3LWZ1bGwgaC0yIHRyYW5zZm9ybSAtdHJhbnNsYXRlLXktMS8yXCJcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHRvcDogJzUwJScsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvPlxuICAgICAgKSA6IChcbiAgICAgICAgPD48Lz5cbiAgICAgICl9XG4gICAgICA8ZGl2IGlkPVwibWFwRHJhd2luZ1BvcHVwXCIgcmVmPXtzZXRNYXBEcmF3aW5nUG9wdXBFbGVtZW50fT48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWFwLWNvbnRleHQtbWVudVwiPjwvZGl2PlxuICAgICAgPGRpdiBpZD1cIm1hcFRvb2xzXCI+XG4gICAgICAgIHttYXAgPyAoXG4gICAgICAgICAgPEdlb21ldHJpZXNcbiAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZT17cHJvcHMuc2VsZWN0aW9uSW50ZXJmYWNlfVxuICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICBpc0NsdXN0ZXJpbmc9e2lzQ2x1c3RlcmluZ31cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge21hcCA/IChcbiAgICAgICAgICA8TWFwVG9vbGJhclxuICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICBtYXBMYXllcnM9e3Byb3BzLm1hcExheWVyc31cbiAgICAgICAgICAgIHpvb21Ub0hvbWU9eygpID0+IHtcbiAgICAgICAgICAgICAgem9vbVRvSG9tZSh7IG1hcCB9KVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHNhdmVBc0hvbWU9eygpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgYm91bmRpbmdCb3ggPSBtYXAuZ2V0Qm91bmRpbmdCb3goKVxuICAgICAgICAgICAgICBjb25zdCB1c2VyUHJlZmVyZW5jZXMgPSB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKVxuICAgICAgICAgICAgICB1c2VyUHJlZmVyZW5jZXMuc2V0KCdtYXBIb21lJywgYm91bmRpbmdCb3gpXG4gICAgICAgICAgICAgIGFkZFNuYWNrKCdTdWNjZXNzISBOZXcgbWFwIGhvbWUgbG9jYXRpb24gc2V0LicsIHtcbiAgICAgICAgICAgICAgICBhbGVydFByb3BzOiB7XG4gICAgICAgICAgICAgICAgICBzZXZlcml0eTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgaXNDbHVzdGVyaW5nPXtpc0NsdXN0ZXJpbmd9XG4gICAgICAgICAgICB0b2dnbGVDbHVzdGVyaW5nPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldElzQ2x1c3RlcmluZyghaXNDbHVzdGVyaW5nKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge21hcCA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPFBhcGVyXG4gICAgICAgICAgICAgIGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicC0yIHotMTAgYWJzb2x1dGUgcmlnaHQtMCBib3R0b20tMCBtci00IG1iLTRcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC56b29tSW4oKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8UGx1c0ljb24gY2xhc3NOYW1lPVwiICBoLTUgdy01XCIgLz5cbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnpvb21PdXQoKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8TWludXNJY29uIGNsYXNzTmFtZT1cIiAgaC01IHctNVwiIC8+XG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgZGF0YS1pZD1cIm1hcC1jb250YWluZXJcIlxuICAgICAgICBpZD1cIm1hcENvbnRhaW5lclwiXG4gICAgICAgIGNsYXNzTmFtZT1cImgtZnVsbFwiXG4gICAgICAgIHJlZj17c2V0TWFwRWxlbWVudH1cbiAgICAgID48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWFwSW5mb1wiPlxuICAgICAgICB7bWFwTW9kZWwgPyA8TWFwSW5mbyBtYXA9e21hcE1vZGVsfSAvPiA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGlzdGFuY2VJbmZvXCI+XG4gICAgICAgIHttYXBNb2RlbCA/IDxEaXN0YW5jZUluZm8gbWFwPXttYXBNb2RlbH0gLz4gOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBvcHVwUHJldmlld1wiPlxuICAgICAgICB7bWFwICYmIG1hcE1vZGVsICYmIHByb3BzLnNlbGVjdGlvbkludGVyZmFjZSA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPFBvcHVwUHJldmlld1xuICAgICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgICAgbWFwTW9kZWw9e21hcE1vZGVsfVxuICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e3Byb3BzLnNlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICB7bWFwTW9kZWwgPyA8TWFwQ29udGV4dERyb3Bkb3duIG1hcE1vZGVsPXttYXBNb2RlbH0gLz4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iXX0=