import { __assign, __read, __values } from "tslib";
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
    var upCallbackRef = React.useRef();
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
    return (React.createElement("div", { ref: setContainerElement, className: "w-full h-full bg-inherit relative p-2" },
        !map ? (React.createElement(React.Fragment, null,
            React.createElement(LinearProgress, { className: "absolute left-0 w-full h-2 transform -translate-y-1/2", style: {
                    top: '50%',
                } }))) : (React.createElement(React.Fragment, null)),
        React.createElement("div", { id: "mapDrawingPopup", ref: setMapDrawingPopupElement }),
        React.createElement("div", { className: "map-context-menu" }),
        React.createElement("div", { id: "mapTools" },
            map ? (React.createElement(Geometries, { selectionInterface: props.selectionInterface, map: map, isClustering: isClustering })) : null,
            map ? (React.createElement(MapToolbar, { map: map, mapLayers: props.mapLayers, zoomToHome: function () {
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
                } })) : null,
            map ? (React.createElement(React.Fragment, null,
                React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2 z-10 absolute right-0 bottom-0 mr-4 mb-4" },
                    React.createElement("div", null,
                        React.createElement(Button, { size: "small", onClick: function () {
                                map.zoomIn();
                            } },
                            React.createElement(PlusIcon, { className: "  h-5 w-5" }))),
                    React.createElement("div", null,
                        React.createElement(Button, { size: "small", onClick: function () {
                                map.zoomOut();
                            } },
                            React.createElement(MinusIcon, { className: "  h-5 w-5" })))))) : null),
        React.createElement("div", { "data-id": "map-container", id: "mapContainer", className: "h-full", ref: setMapElement }),
        React.createElement("div", { className: "mapInfo" }, mapModel ? React.createElement(MapInfo, { map: mapModel }) : null),
        React.createElement("div", { className: "distanceInfo" }, mapModel ? React.createElement(DistanceInfo, { map: mapModel }) : null),
        React.createElement("div", { className: "popupPreview" }, map && mapModel && props.selectionInterface ? (React.createElement(React.Fragment, null,
            React.createElement(PopupPreview, { map: map, mapModel: mapModel, selectionInterface: props.selectionInterface }))) : null),
        mapModel ? React.createElement(MapContextDropdown, { mapModel: mapModel }) : null));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9tYXAudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEtBQUssTUFBTSxtQkFBbUIsQ0FBQTtBQUNyQyxPQUFPLElBQUksTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRCxPQUFPLFFBQVEsTUFBTSxhQUFhLENBQUE7QUFDbEMsT0FBTyxPQUFPLE1BQU0sbUNBQW1DLENBQUE7QUFDdkQsT0FBTyxZQUFZLE1BQU0sd0NBQXdDLENBQUE7QUFDakUsT0FBTyxXQUFXLE1BQU0sdUJBQXVCLENBQUE7QUFDL0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ2xELE9BQU8sVUFBVSxNQUFNLGVBQWUsQ0FBQTtBQUN0QyxPQUFPLGtCQUFrQixNQUFNLDhDQUE4QyxDQUFBO0FBQzdFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQTtBQUV2RSxPQUFPLFVBQVUsTUFBTSxvQkFBb0IsQ0FBQTtBQUMzQyxPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQUN6RCxPQUFPLFlBQVksTUFBTSx3Q0FBd0MsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0UsT0FBTyxRQUFRLE1BQU0sc0JBQXNCLENBQUE7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUNuQyxPQUFPLGdCQUFnQixNQUFNLG9DQUFvQyxDQUFBO0FBQ2pFLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxt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b25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IE1hcE1vZGVsIGZyb20gJy4vbWFwLm1vZGVsJ1xuaW1wb3J0IE1hcEluZm8gZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L21hcC1pbmZvJ1xuaW1wb3J0IERpc3RhbmNlSW5mbyBmcm9tICcuLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvZGlzdGFuY2UtaW5mbydcbmltcG9ydCBnZXREaXN0YW5jZSBmcm9tICdnZW9saWIvZXMvZ2V0RGlzdGFuY2UnXG5pbXBvcnQgeyBEcmF3aW5nIH0gZnJvbSAnLi4vLi4vc2luZ2xldG9ucy9kcmF3aW5nJ1xuaW1wb3J0IE1hcFRvb2xiYXIgZnJvbSAnLi9tYXAtdG9vbGJhcidcbmltcG9ydCBNYXBDb250ZXh0RHJvcGRvd24gZnJvbSAnLi4vLi4vbWFwLWNvbnRleHQtbWVudS9tYXAtY29udGV4dC1tZW51LnZpZXcnXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uLy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCBHZW9tZXRyaWVzIGZyb20gJy4vcmVhY3QvZ2VvbWV0cmllcydcbmltcG9ydCBMaW5lYXJQcm9ncmVzcyBmcm9tICdAbXVpL21hdGVyaWFsL0xpbmVhclByb2dyZXNzJ1xuaW1wb3J0IFBvcHVwUHJldmlldyBmcm9tICcuLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvcG9wdXAtcHJldmlldydcbmltcG9ydCB7IFNIQVBFX0lEX1BSRUZJWCwgZ2V0RHJhd01vZGVGcm9tTW9kZWwgfSBmcm9tICcuL2RyYXdpbmctYW5kLWRpc3BsYXknXG5pbXBvcnQgdXNlU25hY2sgZnJvbSAnLi4vLi4vaG9va3MvdXNlU25hY2snXG5pbXBvcnQgeyB6b29tVG9Ib21lIH0gZnJvbSAnLi9ob21lJ1xuaW1wb3J0IGZlYXR1cmVEZXRlY3Rpb24gZnJvbSAnLi4vLi4vc2luZ2xldG9ucy9mZWF0dXJlLWRldGVjdGlvbidcbmltcG9ydCBQYXBlciBmcm9tICdAbXVpL21hdGVyaWFsL1BhcGVyJ1xuaW1wb3J0IHsgRWxldmF0aW9ucyB9IGZyb20gJy4uLy4uL3RoZW1lL3RoZW1lJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBQbHVzSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0FkZCdcbmltcG9ydCBNaW51c0ljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9SZW1vdmUnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjZXNpLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBDZXNpdW0gZnJvbSAnY2VzaXVtL0J1aWxkL0Nlc2l1bS9DZXNpdW0nXG5pbXBvcnQgeyBJbnRlcmFjdGlvbnNDb250ZXh0LCBUcmFuc2xhdGlvbiB9IGZyb20gJy4vaW50ZXJhY3Rpb25zLnByb3ZpZGVyJ1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IFNoYXBlVXRpbHMgZnJvbSAnLi4vLi4vLi4vanMvU2hhcGVVdGlscydcblxudHlwZSBIb3ZlckdlbyA9IHtcbiAgaW50ZXJhY3RpdmU/OiBib29sZWFuXG4gIGlkPzogbnVtYmVyXG59XG5cbmNvbnN0IHVzZU1hcENvZGUgPSAocHJvcHM6IE1hcFZpZXdSZWFjdFR5cGUpID0+IHtcbiAgY29uc3QgW21hcENvZGUsIHNldE1hcENvZGVdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHByb3BzLmxvYWRNYXAoKS50aGVuKChNYXA6IGFueSkgPT4ge1xuICAgICAgc2V0TWFwQ29kZSh7IGNyZWF0ZU1hcDogTWFwIH0pXG4gICAgfSlcbiAgfSwgW3Byb3BzLmxvYWRNYXBdKVxuICByZXR1cm4gbWFwQ29kZVxufVxuY29uc3QgdXNlTWFwID0gKFxuICBwcm9wczogTWFwVmlld1JlYWN0VHlwZSAmIHtcbiAgICBtYXBFbGVtZW50OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbiAgICBtYXBNb2RlbDogYW55XG4gICAgY29udGFpbmVyRWxlbWVudDogSFRNTERpdkVsZW1lbnQgfCBudWxsXG4gICAgbWFwRHJhd2luZ1BvcHVwRWxlbWVudDogSFRNTERpdkVsZW1lbnQgfCBudWxsXG4gICAgbWFwTGF5ZXJzOiBhbnlcbiAgfVxuKSA9PiB7XG4gIGNvbnN0IFttYXAsIHNldE1hcF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG4gIGNvbnN0IG1hcENvZGUgPSB1c2VNYXBDb2RlKHByb3BzKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcm9wcy5tYXBFbGVtZW50ICYmIG1hcENvZGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNldE1hcChcbiAgICAgICAgICBtYXBDb2RlLmNyZWF0ZU1hcChcbiAgICAgICAgICAgIHByb3BzLm1hcEVsZW1lbnQsXG4gICAgICAgICAgICBwcm9wcy5zZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgICAgICAgICBwcm9wcy5tYXBEcmF3aW5nUG9wdXBFbGVtZW50LFxuICAgICAgICAgICAgcHJvcHMuY29udGFpbmVyRWxlbWVudCxcbiAgICAgICAgICAgIHByb3BzLm1hcE1vZGVsLFxuICAgICAgICAgICAgcHJvcHMubWFwTGF5ZXJzXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZmVhdHVyZURldGVjdGlvbi5hZGRGYWlsdXJlKCdjZXNpdW0nKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHByb3BzLm1hcEVsZW1lbnQgJiYgbWFwQ29kZSAmJiBtYXApIHtcbiAgICAgICAgbWFwLmRlc3Ryb3koKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW3Byb3BzLm1hcEVsZW1lbnQsIG1hcENvZGVdKVxuICByZXR1cm4gbWFwXG59XG5jb25zdCB1c2VNYXBNb2RlbCA9ICgpID0+IHtcbiAgY29uc3QgW21hcE1vZGVsXSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obmV3IE1hcE1vZGVsKCkpXG4gIHJldHVybiBtYXBNb2RlbFxufVxuLypcbiAgICBIYW5kbGVzIGRyYXdpbmcgb3IgY2xlYXJpbmcgdGhlIHJ1bGVyIGFzIG5lZWRlZCBieSB0aGUgbWVhc3VyZW1lbnQgc3RhdGUuXG5cbiAgICBTVEFSVCBpbmRpY2F0ZXMgdGhhdCBhIHN0YXJ0aW5nIHBvaW50IHNob3VsZCBiZSBkcmF3bixcbiAgICBzbyB0aGUgbWFwIGNsZWFycyBhbnkgcHJldmlvdXMgcG9pbnRzIGRyYXduIGFuZCBkcmF3cyBhIG5ldyBzdGFydCBwb2ludC5cblxuICAgIEVORCBpbmRpY2F0ZXMgdGhhdCBhbiBlbmRpbmcgcG9pbnQgc2hvdWxkIGJlIGRyYXduLFxuICAgIHNvIHRoZSBtYXAgZHJhd3MgYW4gZW5kIHBvaW50IGFuZCBhIGxpbmUsIGFuZCBjYWxjdWxhdGVzIHRoZSBkaXN0YW5jZS5cblxuICAgIE5PTkUgaW5kaWNhdGVzIHRoYXQgdGhlIHJ1bGVyIHNob3VsZCBiZSBjbGVhcmVkLlxuICAqL1xuY29uc3QgaGFuZGxlTWVhc3VyZW1lbnRTdGF0ZUNoYW5nZSA9ICh7XG4gIG1hcCxcbiAgbWFwTW9kZWwsXG59OiB7XG4gIG1hcDogYW55XG4gIG1hcE1vZGVsOiBhbnlcbn0pID0+IHtcbiAgY29uc3Qgc3RhdGUgPSBtYXBNb2RlbC5nZXQoJ21lYXN1cmVtZW50U3RhdGUnKVxuICBsZXQgcG9pbnQgPSBudWxsXG4gIHN3aXRjaCAoc3RhdGUpIHtcbiAgICBjYXNlICdTVEFSVCc6XG4gICAgICBjbGVhclJ1bGVyKHsgbWFwLCBtYXBNb2RlbCB9KVxuICAgICAgcG9pbnQgPSBtYXAuYWRkUnVsZXJQb2ludChtYXBNb2RlbC5nZXQoJ2Nvb3JkaW5hdGVWYWx1ZXMnKSlcbiAgICAgIG1hcE1vZGVsLmFkZFBvaW50KHBvaW50KVxuICAgICAgbWFwTW9kZWwuc2V0U3RhcnRpbmdDb29yZGluYXRlcyh7XG4gICAgICAgIGxhdDogbWFwTW9kZWwuZ2V0KCdjb29yZGluYXRlVmFsdWVzJylbJ2xhdCddLFxuICAgICAgICBsb246IG1hcE1vZGVsLmdldCgnY29vcmRpbmF0ZVZhbHVlcycpWydsb24nXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBwb2x5bGluZSA9IG1hcC5hZGRSdWxlckxpbmUobWFwTW9kZWwuZ2V0KCdjb29yZGluYXRlVmFsdWVzJykpXG4gICAgICBtYXBNb2RlbC5zZXRMaW5lKHBvbHlsaW5lKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdFTkQnOlxuICAgICAgcG9pbnQgPSBtYXAuYWRkUnVsZXJQb2ludChtYXBNb2RlbC5nZXQoJ2Nvb3JkaW5hdGVWYWx1ZXMnKSlcbiAgICAgIG1hcE1vZGVsLmFkZFBvaW50KHBvaW50KVxuICAgICAgbWFwLnNldFJ1bGVyTGluZSh7XG4gICAgICAgIGxhdDogbWFwTW9kZWwuZ2V0KCdjb29yZGluYXRlVmFsdWVzJylbJ2xhdCddLFxuICAgICAgICBsb246IG1hcE1vZGVsLmdldCgnY29vcmRpbmF0ZVZhbHVlcycpWydsb24nXSxcbiAgICAgIH0pXG4gICAgICBicmVha1xuICAgIGNhc2UgJ05PTkUnOlxuICAgICAgY2xlYXJSdWxlcih7IG1hcCwgbWFwTW9kZWwgfSlcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrXG4gIH1cbn1cbi8qXG4gICAgSGFuZGxlcyB0YXNrcyBmb3IgY2xlYXJpbmcgdGhlIHJ1bGVyLCB3aGljaCBpbmNsdWRlIHJlbW92aW5nIGFsbCBwb2ludHNcbiAgICAoZW5kcG9pbnRzIG9mIHRoZSBsaW5lKSBhbmQgdGhlIGxpbmUuXG4gICovXG5jb25zdCBjbGVhclJ1bGVyID0gKHsgbWFwLCBtYXBNb2RlbCB9OiB7IG1hcDogYW55OyBtYXBNb2RlbDogYW55IH0pID0+IHtcbiAgY29uc3QgcG9pbnRzID0gbWFwTW9kZWwuZ2V0KCdwb2ludHMnKVxuICBwb2ludHMuZm9yRWFjaCgocG9pbnQ6IGFueSkgPT4ge1xuICAgIG1hcC5yZW1vdmVSdWxlclBvaW50KHBvaW50KVxuICB9KVxuICBtYXBNb2RlbC5jbGVhclBvaW50cygpXG4gIGNvbnN0IGxpbmUgPSBtYXBNb2RlbC5yZW1vdmVMaW5lKClcbiAgbWFwLnJlbW92ZVJ1bGVyTGluZShsaW5lKVxufVxuLypcbiAqICBSZWRyYXcgYW5kIHJlY2FsY3VsYXRlIHRoZSBydWxlciBsaW5lIGFuZCBkaXN0YW5jZUluZm8gdG9vbHRpcC4gV2lsbCBub3QgcmVkcmF3IHdoaWxlIHRoZSBtZW51IGlzIGN1cnJlbnRseVxuICogIGRpc3BsYXllZCB1cGRhdGVPbk1lbnUgYWxsb3dzIHVwZGF0aW5nIHdoaWxlIHRoZSBtZW51IGlzIHVwXG4gKi9cbmNvbnN0IHVwZGF0ZURpc3RhbmNlID0gKHtcbiAgbWFwLFxuICBtYXBNb2RlbCxcbiAgdXBkYXRlT25NZW51ID0gZmFsc2UsXG59OiB7XG4gIG1hcDogYW55XG4gIG1hcE1vZGVsOiBhbnlcbiAgdXBkYXRlT25NZW51PzogYm9vbGVhblxufSkgPT4ge1xuICBpZiAobWFwTW9kZWwuZ2V0KCdtZWFzdXJlbWVudFN0YXRlJykgPT09ICdTVEFSVCcpIHtcbiAgICBjb25zdCBvcGVuTWVudSA9IHRydWUgLy8gVE9ETzogaW52ZXN0aWdhdGUgdGhpc1xuICAgIGNvbnN0IGxhdCA9IG1hcE1vZGVsLmdldCgnbW91c2VMYXQnKVxuICAgIGNvbnN0IGxvbiA9IG1hcE1vZGVsLmdldCgnbW91c2VMb24nKVxuICAgIGlmICgodXBkYXRlT25NZW51ID09PSB0cnVlIHx8ICFvcGVuTWVudSkgJiYgbGF0ICYmIGxvbikge1xuICAgICAgLy8gcmVkcmF3IHJ1bGVyIGxpbmVcbiAgICAgIGNvbnN0IG1vdXNlUG9pbnQgPSB7IGxhdCwgbG9uIH1cbiAgICAgIG1hcC5zZXRSdWxlckxpbmUobW91c2VQb2ludClcbiAgICAgIC8vIHVwZGF0ZSBkaXN0YW5jZSBpbmZvXG4gICAgICBjb25zdCBzdGFydGluZ0Nvb3JkaW5hdGVzID0gbWFwTW9kZWwuZ2V0KCdzdGFydGluZ0Nvb3JkaW5hdGVzJylcbiAgICAgIGNvbnN0IGRpc3QgPSBnZXREaXN0YW5jZShcbiAgICAgICAgeyBsYXRpdHVkZTogbGF0LCBsb25naXR1ZGU6IGxvbiB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGF0aXR1ZGU6IHN0YXJ0aW5nQ29vcmRpbmF0ZXNbJ2xhdCddLFxuICAgICAgICAgIGxvbmdpdHVkZTogc3RhcnRpbmdDb29yZGluYXRlc1snbG9uJ10sXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIG1hcE1vZGVsLnNldERpc3RhbmNlSW5mb1Bvc2l0aW9uKFxuICAgICAgICAoZXZlbnQgYXMgYW55KS5jbGllbnRYLFxuICAgICAgICAoZXZlbnQgYXMgYW55KS5jbGllbnRZXG4gICAgICApXG4gICAgICBtYXBNb2RlbC5zZXRDdXJyZW50RGlzdGFuY2UoZGlzdClcbiAgICB9XG4gIH1cbn1cbmNvbnN0IHVzZVdyZXFyTWFwTGlzdGVuZXJzID0gKHsgbWFwIH06IHsgbWFwOiBhbnkgfSkgPT4ge1xuICB1c2VMaXN0ZW5UbyhtYXAgPyAod3JlcXIgYXMgYW55KS52ZW50IDogdW5kZWZpbmVkLCAnbWV0YWNhcmQ6b3ZlcmxheScsICgpID0+IHtcbiAgICBtYXAub3ZlcmxheUltYWdlLmJpbmQobWFwKSgpXG4gIH0pXG4gIHVzZUxpc3RlblRvKFxuICAgIG1hcCA/ICh3cmVxciBhcyBhbnkpLnZlbnQgOiB1bmRlZmluZWQsXG4gICAgJ21ldGFjYXJkOm92ZXJsYXk6cmVtb3ZlJyxcbiAgICAoKSA9PiB7XG4gICAgICBtYXAucmVtb3ZlT3ZlcmxheS5iaW5kKG1hcCkoKVxuICAgIH1cbiAgKVxuICB1c2VMaXN0ZW5UbyhcbiAgICBtYXAgPyAod3JlcXIgYXMgYW55KS52ZW50IDogdW5kZWZpbmVkLFxuICAgICdzZWFyY2g6bWFwcmVjdGFuZ2xlZmx5JyxcbiAgICAoKSA9PiB7XG4gICAgICBtYXAuem9vbVRvRXh0ZW50LmJpbmQobWFwKSgpXG4gICAgfVxuICApXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcCkge1xuICAgIH1cbiAgfSwgW21hcF0pXG59XG5jb25zdCB1c2VTZWxlY3Rpb25JbnRlcmZhY2VNYXBMaXN0ZW5lcnMgPSAoe1xuICBtYXAsXG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbn06IHtcbiAgbWFwOiBhbnlcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbn0pID0+IHtcbiAgdXNlTGlzdGVuVG8oXG4gICAgbWFwID8gc2VsZWN0aW9uSW50ZXJmYWNlIDogdW5kZWZpbmVkLFxuICAgICdyZXNldDphY3RpdmVTZWFyY2hSZXN1bHRzJyxcbiAgICAoKSA9PiB7XG4gICAgICBtYXAucmVtb3ZlQWxsT3ZlcmxheXMuYmluZChtYXApKClcbiAgICB9XG4gIClcbn1cbmNvbnN0IHVzZUxpc3RlblRvTWFwTW9kZWwgPSAoe1xuICBtYXAsXG4gIG1hcE1vZGVsLFxufToge1xuICBtYXA6IGFueVxuICBtYXBNb2RlbDogYW55XG59KSA9PiB7XG4gIHVzZUxpc3RlblRvKFxuICAgIG1hcCAmJiBtYXBNb2RlbCA/IG1hcE1vZGVsIDogdW5kZWZpbmVkLFxuICAgICdjaGFuZ2U6bWVhc3VyZW1lbnRTdGF0ZScsXG4gICAgKCkgPT4ge1xuICAgICAgaGFuZGxlTWVhc3VyZW1lbnRTdGF0ZUNoYW5nZSh7IG1hcCwgbWFwTW9kZWwgfSlcbiAgICB9XG4gIClcbiAgdXNlTGlzdGVuVG8oXG4gICAgbWFwICYmIG1hcE1vZGVsID8gbWFwTW9kZWwgOiB1bmRlZmluZWQsXG4gICAgJ2NoYW5nZTptb3VzZUxhdCBjaGFuZ2U6bW91c2VMb24nLFxuICAgICgpID0+IHtcbiAgICAgIHVwZGF0ZURpc3RhbmNlKHsgbWFwLCBtYXBNb2RlbCB9KVxuICAgIH1cbiAgKVxufVxuY29uc3QgdXBkYXRlVGFyZ2V0ID0gKHtcbiAgbWFwTW9kZWwsXG4gIG1ldGFjYXJkLFxufToge1xuICBtYXBNb2RlbDogYW55XG4gIG1ldGFjYXJkOiBMYXp5UXVlcnlSZXN1bHRcbn0pID0+IHtcbiAgbGV0IHRhcmdldFxuICBsZXQgdGFyZ2V0TWV0YWNhcmRcbiAgaWYgKG1ldGFjYXJkKSB7XG4gICAgdGFyZ2V0ID0gbWV0YWNhcmQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZVxuICAgIHRhcmdldE1ldGFjYXJkID0gbWV0YWNhcmRcbiAgfVxuICBtYXBNb2RlbC5zZXQoe1xuICAgIHRhcmdldCxcbiAgICB0YXJnZXRNZXRhY2FyZCxcbiAgfSlcbn1cbmNvbnN0IGhhbmRsZU1hcEhvdmVyID0gKHtcbiAgbWFwTW9kZWwsXG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgbWFwRXZlbnQsXG4gIHNldElzSG92ZXJpbmdSZXN1bHQsXG4gIHNldEhvdmVyR2VvLFxufToge1xuICBtYXA6IGFueVxuICBtYXBNb2RlbDogYW55XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG4gIG1hcEV2ZW50OiBhbnlcbiAgc2V0SXNIb3ZlcmluZ1Jlc3VsdDogKHZhbDogYm9vbGVhbikgPT4gdm9pZFxuICBzZXRIb3ZlckdlbzogKHZhbDogSG92ZXJHZW8pID0+IHZvaWRcbn0pID0+IHtcbiAgY29uc3QgaXNIb3ZlcmluZ092ZXJHZW8gPSBCb29sZWFuKFxuICAgIG1hcEV2ZW50Lm1hcFRhcmdldCAmJlxuICAgICAgbWFwRXZlbnQubWFwVGFyZ2V0LmNvbnN0cnVjdG9yID09PSBTdHJpbmcgJiZcbiAgICAgICgobWFwRXZlbnQubWFwVGFyZ2V0IGFzIHN0cmluZykuc3RhcnRzV2l0aChTSEFQRV9JRF9QUkVGSVgpIHx8XG4gICAgICAgIG1hcEV2ZW50Lm1hcFRhcmdldCA9PT0gJ3VzZXJEcmF3aW5nJylcbiAgKVxuXG4gIGlmIChpc0hvdmVyaW5nT3Zlckdlbykge1xuICAgIHNldEhvdmVyR2VvKHtcbiAgICAgIGlkOiBtYXBFdmVudC5tYXBMb2NhdGlvbklkLFxuICAgICAgaW50ZXJhY3RpdmU6IEJvb2xlYW4obWFwRXZlbnQubWFwTG9jYXRpb25JZCksXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBzZXRIb3Zlckdlbyh7fSlcbiAgfVxuXG4gIGlmICghc2VsZWN0aW9uSW50ZXJmYWNlKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgY3VycmVudFF1ZXJ5ID0gc2VsZWN0aW9uSW50ZXJmYWNlLmdldCgnY3VycmVudFF1ZXJ5JylcbiAgaWYgKCFjdXJyZW50UXVlcnkpIHtcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCByZXN1bHQgPSBjdXJyZW50UXVlcnkuZ2V0KCdyZXN1bHQnKVxuICBpZiAoIXJlc3VsdCkge1xuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IG1ldGFjYXJkID0gcmVzdWx0LmdldCgnbGF6eVJlc3VsdHMnKS5yZXN1bHRzW21hcEV2ZW50Lm1hcFRhcmdldF1cbiAgdXBkYXRlVGFyZ2V0KHsgbWV0YWNhcmQsIG1hcE1vZGVsIH0pXG5cbiAgc2V0SXNIb3ZlcmluZ1Jlc3VsdChcbiAgICBCb29sZWFuKFxuICAgICAgbWFwRXZlbnQubWFwVGFyZ2V0ICYmXG4gICAgICAgIG1hcEV2ZW50Lm1hcFRhcmdldCAhPT0gJ3VzZXJEcmF3aW5nJyAmJlxuICAgICAgICAoQXJyYXkuaXNBcnJheShtYXBFdmVudC5tYXBUYXJnZXQpIHx8XG4gICAgICAgICAgKG1hcEV2ZW50Lm1hcFRhcmdldC5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nICYmXG4gICAgICAgICAgICAhKG1hcEV2ZW50Lm1hcFRhcmdldCBhcyBzdHJpbmcpLnN0YXJ0c1dpdGgoU0hBUEVfSURfUFJFRklYKSkpXG4gICAgKVxuICApXG59XG5cbmNvbnN0IGdldExvY2F0aW9uID0gKG1vZGVsOiBCYWNrYm9uZS5Nb2RlbCwgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvbikgPT4ge1xuICBjb25zdCBsb2NhdGlvblR5cGUgPSBnZXREcmF3TW9kZUZyb21Nb2RlbCh7IG1vZGVsIH0pXG4gIHN3aXRjaCAobG9jYXRpb25UeXBlKSB7XG4gICAgY2FzZSAnYmJveCc6XG4gICAgICBjb25zdCBiYm94ID0gXy5waWNrKFxuICAgICAgICBtb2RlbC5hdHRyaWJ1dGVzLFxuICAgICAgICAnbWFwTm9ydGgnLFxuICAgICAgICAnbWFwU291dGgnLFxuICAgICAgICAnbWFwRWFzdCcsXG4gICAgICAgICdtYXBXZXN0JyxcbiAgICAgICAgJ25vcnRoJyxcbiAgICAgICAgJ3NvdXRoJyxcbiAgICAgICAgJ2Vhc3QnLFxuICAgICAgICAnd2VzdCdcbiAgICAgIClcbiAgICAgIGlmICh0cmFuc2xhdGlvbikge1xuICAgICAgICBjb25zdCB0cmFuc2xhdGVkQmJveCA9IHRyYW5zbGF0ZUJib3goYmJveCwgdHJhbnNsYXRpb24pXG4gICAgICAgIHJldHVybiB0cmFuc2xhdGVkQmJveFxuICAgICAgfVxuICAgICAgcmV0dXJuIGJib3hcbiAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgY29uc3QgcG9pbnQgPSBfLnBpY2sobW9kZWwuYXR0cmlidXRlcywgJ2xhdCcsICdsb24nKVxuICAgICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zbGF0ZWRQb2ludCA9IHRyYW5zbGF0ZVBvaW50KFxuICAgICAgICAgIHBvaW50LmxvbixcbiAgICAgICAgICBwb2ludC5sYXQsXG4gICAgICAgICAgdHJhbnNsYXRpb25cbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gdHJhbnNsYXRlZFBvaW50XG4gICAgICB9XG4gICAgICByZXR1cm4gcG9pbnRcbiAgICBjYXNlICdsaW5lJzpcbiAgICAgIGNvbnN0IGxpbmUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsLmdldCgnbGluZScpKSlcbiAgICAgIGlmICh0cmFuc2xhdGlvbikge1xuICAgICAgICB0cmFuc2xhdGVMaW5lKGxpbmUsIHRyYW5zbGF0aW9uKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgbGluZSB9XG4gICAgY2FzZSAncG9seSc6XG4gICAgICBjb25zdCBwb2x5Z29uID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtb2RlbC5nZXQoJ3BvbHlnb24nKSkpXG4gICAgICBpZiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgY29uc3QgbXVsdGlQb2x5Z29uID0gU2hhcGVVdGlscy5pc0FycmF5M0QocG9seWdvbikgPyBwb2x5Z29uIDogW3BvbHlnb25dXG4gICAgICAgIHRyYW5zbGF0ZVBvbHlnb24obXVsdGlQb2x5Z29uLCB0cmFuc2xhdGlvbilcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IHBvbHlnb24gfVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge31cbiAgfVxufVxuXG50eXBlIExvbkxhdCA9IFtsb25naXR1ZGU6IG51bWJlciwgbGF0aXR1ZGU6IG51bWJlcl1cblxuY29uc3QgdHJhbnNsYXRlUG9seWdvbiA9IChwb2x5Z29uOiBMb25MYXRbXVtdLCB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb24pID0+IHtcbiAgLy8gb2RkIHRoaW5ncyBoYXBwZW4gd2hlbiBsYXRpdHVkZSBpcyBleGFjdGx5IG9yIHZlcnkgY2xvc2UgdG8gZWl0aGVyIDkwIG9yIC05MFxuICBjb25zdCBub3J0aFBvbGUgPSA4OS45OVxuICBjb25zdCBzb3V0aFBvbGUgPSAtODkuOTlcbiAgbGV0IG1heExhdCA9IDBcbiAgbGV0IG1pbkxhdCA9IDBcbiAgbGV0IGRpZmYgPSAwXG5cbiAgZm9yIChjb25zdCByaW5nIG9mIHBvbHlnb24pIHtcbiAgICBmb3IgKGNvbnN0IGNvb3JkIG9mIHJpbmcpIHtcbiAgICAgIGNvbnN0IFtsb24sIGxhdF0gPSB0cmFuc2xhdGVDb29yZGluYXRlcyhjb29yZFswXSwgY29vcmRbMV0sIHRyYW5zbGF0aW9uKVxuICAgICAgY29vcmRbMF0gPSBsb25cbiAgICAgIGNvb3JkWzFdID0gbGF0XG4gICAgICBtYXhMYXQgPSBNYXRoLm1heChsYXQsIG1heExhdClcbiAgICAgIG1pbkxhdCA9IE1hdGgubWluKGxhdCwgbWluTGF0KVxuICAgIH1cbiAgfVxuXG4gIGlmIChtYXhMYXQgPiBub3J0aFBvbGUpIHtcbiAgICBkaWZmID0gTWF0aC5hYnMobWF4TGF0IC0gbm9ydGhQb2xlKVxuICB9IGVsc2UgaWYgKG1pbkxhdCA8IHNvdXRoUG9sZSkge1xuICAgIGRpZmYgPSAtTWF0aC5hYnMobWluTGF0IC0gc291dGhQb2xlKVxuICB9XG5cbiAgaWYgKGRpZmYgIT09IDApIHtcbiAgICBmb3IgKGNvbnN0IHJpbmcgb2YgcG9seWdvbikge1xuICAgICAgZm9yIChjb25zdCBjb29yZCBvZiByaW5nKSB7XG4gICAgICAgIGNvb3JkWzFdIC09IGRpZmZcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY29uc3QgdHJhbnNsYXRlTGluZSA9IChsaW5lOiBMb25MYXRbXSwgdHJhbnNsYXRpb246IFRyYW5zbGF0aW9uKSA9PiB7XG4gIC8vIG9kZCB0aGluZ3MgaGFwcGVuIHdoZW4gbGF0aXR1ZGUgaXMgZXhhY3RseSBvciB2ZXJ5IGNsb3NlIHRvIGVpdGhlciA5MCBvciAtOTBcbiAgY29uc3Qgbm9ydGhQb2xlID0gODkuOTlcbiAgY29uc3Qgc291dGhQb2xlID0gLTg5Ljk5XG4gIGxldCBtYXhMYXQgPSAwXG4gIGxldCBtaW5MYXQgPSAwXG4gIGxldCBkaWZmID0gMFxuICBmb3IgKGNvbnN0IGNvb3JkIG9mIGxpbmUpIHtcbiAgICBjb25zdCBbbG9uLCBsYXRdID0gdHJhbnNsYXRlQ29vcmRpbmF0ZXMoY29vcmRbMF0sIGNvb3JkWzFdLCB0cmFuc2xhdGlvbilcbiAgICBtYXhMYXQgPSBNYXRoLm1heChsYXQsIG1heExhdClcbiAgICBtaW5MYXQgPSBNYXRoLm1pbihsYXQsIG1pbkxhdClcbiAgICBjb29yZFswXSA9IGxvblxuICAgIGNvb3JkWzFdID0gbGF0XG4gIH1cblxuICAvLyBwcmV2ZW50IHBvbGFyIGNyb3NzaW5nXG4gIGlmIChtYXhMYXQgPiBub3J0aFBvbGUpIHtcbiAgICBkaWZmID0gTWF0aC5hYnMobWF4TGF0IC0gbm9ydGhQb2xlKVxuICB9IGVsc2UgaWYgKG1pbkxhdCA8IHNvdXRoUG9sZSkge1xuICAgIGRpZmYgPSAtTWF0aC5hYnMobWluTGF0IC0gc291dGhQb2xlKVxuICB9XG5cbiAgaWYgKGRpZmYgIT09IDApIHtcbiAgICBmb3IgKGNvbnN0IGNvb3JkIG9mIGxpbmUpIHtcbiAgICAgIGNvb3JkWzFdIC09IGRpZmZcbiAgICB9XG4gIH1cbn1cblxudHlwZSBiYm94Q29vcmRzID0ge1xuICBtYXBOb3J0aDogbnVtYmVyXG4gIG1hcFNvdXRoOiBudW1iZXJcbiAgbWFwRWFzdDogbnVtYmVyXG4gIG1hcFdlc3Q6IG51bWJlclxuICBub3J0aD86IG51bWJlclxuICBzb3V0aD86IG51bWJlclxuICBlYXN0PzogbnVtYmVyXG4gIHdlc3Q/OiBudW1iZXJcbn1cblxuY29uc3QgdHJhbnNsYXRlQmJveCA9IChcbiAgYmJveDogYmJveENvb3JkcyxcbiAgdHJhbnNsYXRpb246IFRyYW5zbGF0aW9uXG4pOiBiYm94Q29vcmRzID0+IHtcbiAgY29uc3QgdHJhbnNsYXRlZCA9IHsgLi4uYmJveCB9XG4gIGxldCBbZWFzdCwgbm9ydGhdID0gdHJhbnNsYXRlQ29vcmRpbmF0ZXMoXG4gICAgYmJveC5tYXBFYXN0LFxuICAgIGJib3gubWFwTm9ydGgsXG4gICAgdHJhbnNsYXRpb25cbiAgKVxuICBsZXQgW3dlc3QsIHNvdXRoXSA9IHRyYW5zbGF0ZUNvb3JkaW5hdGVzKFxuICAgIGJib3gubWFwV2VzdCxcbiAgICBiYm94Lm1hcFNvdXRoLFxuICAgIHRyYW5zbGF0aW9uXG4gIClcblxuICBjb25zdCBub3J0aFBvbGUgPSA5MFxuICBjb25zdCBzb3V0aFBvbGUgPSAtOTBcblxuICAvLyBwcmV2ZW50IHBvbGFyIGNyb3NzaW5nXG4gIGxldCBkaWZmXG4gIGlmIChub3J0aCA+IG5vcnRoUG9sZSkge1xuICAgIGRpZmYgPSBNYXRoLmFicyhub3J0aCAtIG5vcnRoUG9sZSlcbiAgICBub3J0aCA9IG5vcnRoUG9sZVxuICAgIHNvdXRoID0gc291dGggLSBkaWZmXG4gIH1cblxuICBpZiAoc291dGggPCBzb3V0aFBvbGUpIHtcbiAgICBkaWZmID0gTWF0aC5hYnMoc291dGhQb2xlIC0gc291dGgpXG4gICAgc291dGggPSBzb3V0aFBvbGVcbiAgICBub3J0aCA9IG5vcnRoICsgZGlmZlxuICB9XG5cbiAgdHJhbnNsYXRlZC5tYXBOb3J0aCA9IG5vcnRoXG4gIHRyYW5zbGF0ZWQubWFwRWFzdCA9IGVhc3RcbiAgdHJhbnNsYXRlZC5tYXBTb3V0aCA9IHNvdXRoXG4gIHRyYW5zbGF0ZWQubWFwV2VzdCA9IHdlc3RcblxuICB0cmFuc2xhdGVkLm5vcnRoID0gbm9ydGhcbiAgdHJhbnNsYXRlZC5lYXN0ID0gZWFzdFxuICB0cmFuc2xhdGVkLnNvdXRoID0gc291dGhcbiAgdHJhbnNsYXRlZC53ZXN0ID0gd2VzdFxuXG4gIHJldHVybiB0cmFuc2xhdGVkXG59XG5cbmNvbnN0IHRyYW5zbGF0ZVBvaW50ID0gKFxuICBsb246IG51bWJlcixcbiAgbGF0OiBudW1iZXIsXG4gIHRyYW5zbGF0aW9uOiBUcmFuc2xhdGlvblxuKTogeyBsb246IG51bWJlcjsgbGF0OiBudW1iZXIgfSA9PiB7XG4gIGxldCBbdXBkYXRlZExvbiwgdXBkYXRlZExhdF0gPSB0cmFuc2xhdGVDb29yZGluYXRlcyhsb24sIGxhdCwgdHJhbnNsYXRpb24pXG4gIGNvbnN0IG5vcnRoUG9sZSA9IDg5Ljk5XG4gIGNvbnN0IHNvdXRoUG9sZSA9IC04OS45OVxuXG4gIGlmICh1cGRhdGVkTGF0ID4gbm9ydGhQb2xlKSB7XG4gICAgdXBkYXRlZExhdCA9IG5vcnRoUG9sZVxuICB9IGVsc2UgaWYgKHVwZGF0ZWRMYXQgPCBzb3V0aFBvbGUpIHtcbiAgICB1cGRhdGVkTGF0ID0gc291dGhQb2xlXG4gIH1cbiAgcmV0dXJuIHsgbG9uOiB1cGRhdGVkTG9uLCBsYXQ6IHVwZGF0ZWRMYXQgfVxufVxuXG5jb25zdCB0cmFuc2xhdGVDb29yZGluYXRlcyA9IChcbiAgbG9uZ2l0dWRlOiBudW1iZXIsXG4gIGxhdGl0dWRlOiBudW1iZXIsXG4gIHRyYW5zbGF0aW9uOiBUcmFuc2xhdGlvblxuKTogTG9uTGF0ID0+IHtcbiAgbGV0IHRyYW5zbGF0ZWRMb24gPSBsb25naXR1ZGUgKyB0cmFuc2xhdGlvbi5sb25naXR1ZGVcbiAgbGV0IHRyYW5zbGF0ZWRMYXQgPSBsYXRpdHVkZSArIHRyYW5zbGF0aW9uLmxhdGl0dWRlXG5cbiAgLy8gbm9ybWFsaXplIGxvbmdpdHVkZVxuICBpZiAodHJhbnNsYXRlZExvbiA+IDE4MCkge1xuICAgIHRyYW5zbGF0ZWRMb24gLT0gMzYwXG4gIH1cbiAgaWYgKHRyYW5zbGF0ZWRMb24gPCAtMTgwKSB7XG4gICAgdHJhbnNsYXRlZExvbiArPSAzNjBcbiAgfVxuXG4gIHJldHVybiBbdHJhbnNsYXRlZExvbiwgdHJhbnNsYXRlZExhdF1cbn1cblxuY29uc3QgdXNlTWFwTGlzdGVuZXJzID0gKHtcbiAgbWFwLFxuICBtYXBNb2RlbCxcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxufToge1xuICBtYXA6IGFueVxuICBtYXBNb2RlbDogYW55XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59KSA9PiB7XG4gIGNvbnN0IFtpc0hvdmVyaW5nUmVzdWx0LCBzZXRJc0hvdmVyaW5nUmVzdWx0XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaG92ZXJHZW8sIHNldEhvdmVyR2VvXSA9IFJlYWN0LnVzZVN0YXRlPEhvdmVyR2VvPih7fSlcbiAgY29uc3Qge1xuICAgIG1vdmVGcm9tLFxuICAgIHNldE1vdmVGcm9tLFxuICAgIGludGVyYWN0aXZlR2VvLFxuICAgIHNldEludGVyYWN0aXZlR2VvLFxuICAgIGludGVyYWN0aXZlTW9kZWxzLFxuICAgIHNldEludGVyYWN0aXZlTW9kZWxzLFxuICAgIHRyYW5zbGF0aW9uLFxuICAgIHNldFRyYW5zbGF0aW9uLFxuICB9ID0gUmVhY3QudXNlQ29udGV4dChJbnRlcmFjdGlvbnNDb250ZXh0KVxuXG4gIGNvbnN0IGFkZFNuYWNrID0gdXNlU25hY2soKVxuXG4gIGNvbnN0IHVwQ2FsbGJhY2tSZWYgPSBSZWFjdC51c2VSZWY8KCkgPT4gdm9pZD4oKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdXBDYWxsYmFja1JlZi5jdXJyZW50ID0gKCkgPT4ge1xuICAgICAgaWYgKGludGVyYWN0aXZlTW9kZWxzLmxlbmd0aCA+IDAgJiYgdHJhbnNsYXRpb24pIHtcbiAgICAgICAgY29uc3QgdW5kb0ZuczogKCgpID0+IHt9KVtdID0gW11cbiAgICAgICAgZm9yIChjb25zdCBtb2RlbCBvZiBpbnRlcmFjdGl2ZU1vZGVscykge1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTG9jYXRpb24gPSBnZXRMb2NhdGlvbihtb2RlbClcbiAgICAgICAgICBjb25zdCBuZXdMb2NhdGlvbiA9IGdldExvY2F0aW9uKG1vZGVsLCB0cmFuc2xhdGlvbilcbiAgICAgICAgICBtb2RlbC5zZXQobmV3TG9jYXRpb24pXG4gICAgICAgICAgdW5kb0Zucy5wdXNoKCgpID0+IG1vZGVsLnNldChvcmlnaW5hbExvY2F0aW9uKSlcbiAgICAgICAgfVxuICAgICAgICBhZGRTbmFjayhcbiAgICAgICAgICAnTG9jYXRpb24gdXBkYXRlZC4gWW91IG1heSBzdGlsbCBuZWVkIHRvIHNhdmUgdGhlIGl0ZW0gdGhhdCB1c2VzIGl0LicsXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6IGAke2ludGVyYWN0aXZlR2VvfS5tb3ZlYCxcbiAgICAgICAgICAgIHVuZG86ICgpID0+IHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCB1bmRvRm4gb2YgdW5kb0Zucykge1xuICAgICAgICAgICAgICAgIHVuZG9GbigpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICB9XG4gICAgICBzZXRNb3ZlRnJvbShudWxsKVxuICAgICAgc2V0VHJhbnNsYXRpb24obnVsbClcbiAgICB9XG4gIH0sIFtpbnRlcmFjdGl2ZU1vZGVscywgdHJhbnNsYXRpb25dKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGludGVyYWN0aXZlR2VvKSB7XG4gICAgICAvLyBUaGlzIGhhbmRsZXIgbWlnaHQgZGlzYWJsZSBkcmFnZ2luZyB0byBtb3ZlIHRoZSBtYXAsIHNvIG9ubHkgc2V0IGl0IHVwXG4gICAgICAvLyB3aGVuIHRoZSB1c2VyIGhhcyBzdGFydGVkIGludGVyYWN0aW5nIHdpdGggYSBnZW8uXG4gICAgICBtYXAub25Nb3VzZVRyYWNraW5nRm9yR2VvRHJhZyh7XG4gICAgICAgIG1vdmVGcm9tLFxuICAgICAgICBkb3duOiAoe1xuICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgIG1hcExvY2F0aW9uSWQsXG4gICAgICAgIH06IHtcbiAgICAgICAgICBwb3NpdGlvbjogYW55XG4gICAgICAgICAgbWFwTG9jYXRpb25JZDogbnVtYmVyXG4gICAgICAgIH0pID0+IHtcbiAgICAgICAgICBpZiAobWFwTG9jYXRpb25JZCA9PT0gaW50ZXJhY3RpdmVHZW8gJiYgIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICAgICAgIHNldE1vdmVGcm9tKHBvc2l0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbW92ZTogKHtcbiAgICAgICAgICB0cmFuc2xhdGlvbixcbiAgICAgICAgICBtYXBMb2NhdGlvbklkLFxuICAgICAgICB9OiB7XG4gICAgICAgICAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxuICAgICAgICAgIG1hcExvY2F0aW9uSWQ6IG51bWJlclxuICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgaWYgKG1hcExvY2F0aW9uSWQgPT09IGludGVyYWN0aXZlR2VvKSB7XG4gICAgICAgICAgICBzZXRIb3Zlckdlbyh7XG4gICAgICAgICAgICAgIGlkOiBtYXBMb2NhdGlvbklkLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0SG92ZXJHZW8oe30pXG4gICAgICAgICAgfVxuICAgICAgICAgIHNldFRyYW5zbGF0aW9uKHRyYW5zbGF0aW9uID8/IG51bGwpXG4gICAgICAgIH0sXG4gICAgICAgIHVwOiAoKSA9PiB1cENhbGxiYWNrUmVmLmN1cnJlbnQ/LigpLFxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IG1hcD8uY2xlYXJNb3VzZVRyYWNraW5nRm9yR2VvRHJhZygpXG4gIH0sIFttYXAsIGludGVyYWN0aXZlR2VvLCBtb3ZlRnJvbV0pXG5cbiAgY29uc3QgaGFuZGxlS2V5ZG93biA9IFJlYWN0LnVzZUNhbGxiYWNrKChlOiBhbnkpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICBzZXRJbnRlcmFjdGl2ZUdlbyhudWxsKVxuICAgICAgc2V0SW50ZXJhY3RpdmVNb2RlbHMoW10pXG4gICAgICBzZXRNb3ZlRnJvbShudWxsKVxuICAgICAgc2V0VHJhbnNsYXRpb24obnVsbClcbiAgICB9XG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGludGVyYWN0aXZlR2VvKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUtleWRvd24pXG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5ZG93bilcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5ZG93bilcbiAgfSwgW2ludGVyYWN0aXZlR2VvXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXAgJiYgIW1vdmVGcm9tKSB7XG4gICAgICBjb25zdCBoYW5kbGVMZWZ0Q2xpY2sgPSAobWFwTG9jYXRpb25JZD86IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAobWFwTG9jYXRpb25JZCAmJiAhaW50ZXJhY3RpdmVHZW8gJiYgIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICAgICBzZXRJbnRlcmFjdGl2ZUdlbyhtYXBMb2NhdGlvbklkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldEludGVyYWN0aXZlR2VvKG51bGwpXG4gICAgICAgICAgc2V0SW50ZXJhY3RpdmVNb2RlbHMoW10pXG4gICAgICAgICAgc2V0TW92ZUZyb20obnVsbClcbiAgICAgICAgICBzZXRUcmFuc2xhdGlvbihudWxsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBtYXAub25MZWZ0Q2xpY2tNYXBBUEkoaGFuZGxlTGVmdENsaWNrKVxuICAgIH1cbiAgICBpZiAobWFwICYmICFpbnRlcmFjdGl2ZUdlbykge1xuICAgICAgaWYgKCFEcmF3aW5nLmlzRHJhd2luZygpKSB7XG4gICAgICAgIC8vIENsaWNrcyB1c2VkIGluIGRyYXdpbmcgb24gdGhlIDNEIG1hcCwgc28gbGV0J3MgaWdub3JlIHRoZW0gaGVyZVxuICAgICAgICAvLyB3aGlsZSBkcmF3aW5nLlxuICAgICAgICBtYXAub25Eb3VibGVDbGljaygpXG4gICAgICAgIG1hcC5vblJpZ2h0Q2xpY2soKGV2ZW50OiBhbnksIF9tYXBFdmVudDogYW55KSA9PiB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIG1hcE1vZGVsLnNldCh7XG4gICAgICAgICAgICBtb3VzZVg6IGV2ZW50Lm9mZnNldFgsXG4gICAgICAgICAgICBtb3VzZVk6IGV2ZW50Lm9mZnNldFksXG4gICAgICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgbWFwTW9kZWwudXBkYXRlQ2xpY2tDb29yZGluYXRlcygpXG4gICAgICAgICAgdXBkYXRlRGlzdGFuY2UoeyBtYXAsIG1hcE1vZGVsLCB1cGRhdGVPbk1lbnU6IHRydWUgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYgKG1hcE1vZGVsKSB7XG4gICAgICAgIG1hcC5vbk1vdXNlTW92ZSgoX2V2ZW50OiBhbnksIG1hcEV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgICBoYW5kbGVNYXBIb3Zlcih7XG4gICAgICAgICAgICBtYXAsXG4gICAgICAgICAgICBtYXBFdmVudCxcbiAgICAgICAgICAgIG1hcE1vZGVsLFxuICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICAgICAgICAgICAgc2V0SXNIb3ZlcmluZ1Jlc3VsdCxcbiAgICAgICAgICAgIHNldEhvdmVyR2VvLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtYXA/LmNsZWFyTW91c2VNb3ZlKClcbiAgICAgIG1hcD8uY2xlYXJEb3VibGVDbGljaygpXG4gICAgICBtYXA/LmNsZWFyUmlnaHRDbGljaygpXG4gICAgICBtYXA/LmNsZWFyTGVmdENsaWNrTWFwQVBJKClcbiAgICB9XG4gIH0sIFttYXAsIG1hcE1vZGVsLCBzZWxlY3Rpb25JbnRlcmZhY2UsIGludGVyYWN0aXZlR2VvLCBtb3ZlRnJvbV0pXG4gIHJldHVybiB7XG4gICAgaXNIb3ZlcmluZ1Jlc3VsdCxcbiAgICBob3ZlckdlbyxcbiAgICBpbnRlcmFjdGl2ZUdlbyxcbiAgICBzZXRJbnRlcmFjdGl2ZUdlbyxcbiAgICBtb3ZlRnJvbSxcbiAgfVxufVxuY29uc3QgdXNlT25Nb3VzZUxlYXZlID0gKHtcbiAgbWFwRWxlbWVudCxcbiAgbWFwTW9kZWwsXG59OiB7XG4gIG1hcEVsZW1lbnQ6IGFueVxuICBtYXBNb2RlbDogYW55XG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcEVsZW1lbnQgJiYgbWFwTW9kZWwpIHtcbiAgICAgIG1hcEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcbiAgICAgICAgbWFwTW9kZWwuY2xlYXJNb3VzZUNvb3JkaW5hdGVzKClcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbbWFwRWxlbWVudCwgbWFwTW9kZWxdKVxufVxuY29uc3QgdXNlTGlzdGVuVG9EcmF3aW5nID0gKCkgPT4ge1xuICBjb25zdCBbaXNEcmF3aW5nLCBzZXRJc0RyYXdpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIHVzZUxpc3RlblRvKERyYXdpbmcsICdjaGFuZ2U6ZHJhd2luZycsICgpID0+IHtcbiAgICBzZXRJc0RyYXdpbmcoRHJhd2luZy5pc0RyYXdpbmcoKSlcbiAgfSlcbiAgcmV0dXJuIGlzRHJhd2luZ1xufVxudHlwZSBNYXBWaWV3UmVhY3RUeXBlID0ge1xuICBzZXRNYXA6IChtYXA6IGFueSkgPT4gdm9pZFxuICAvKlxuICAgICAgTWFwIGNyZWF0aW9uIGlzIGRlZmVycmVkIHRvIHRoaXMgbWV0aG9kLCBzbyB0aGF0IGFsbCByZXNvdXJjZXMgcGVydGFpbmluZyB0byB0aGUgbWFwIGNhbiBiZSBsb2FkZWQgbGF6aWx5IGFuZFxuICAgICAgbm90IGJlIGluY2x1ZGVkIGluIHRoZSBpbml0aWFsIHBhZ2UgcGF5bG9hZC5cbiAgICAgIEJlY2F1c2Ugb2YgdGhpcywgbWFrZSBzdXJlIHRvIHJldHVybiBhIGRlZmVycmVkIHRoYXQgd2lsbCByZXNvbHZlIHdoZW4geW91ciByZXNwZWN0aXZlIG1hcCBpbXBsZW1lbnRhdGlvblxuICAgICAgaXMgZmluaXNoZWQgbG9hZGluZyAvIHN0YXJ0aW5nIHVwLlxuICAgICAgQWxzbywgbWFrZSBzdXJlIHlvdSByZXNvbHZlIHRoYXQgZGVmZXJyZWQgYnkgcGFzc2luZyB0aGUgcmVmZXJlbmNlIHRvIHRoZSBtYXAgaW1wbGVtZW50YXRpb24uXG4gICAgKi9cbiAgbG9hZE1hcDogKCkgPT4gYW55XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG4gIG1hcExheWVyczogYW55XG59XG5jb25zdCB1c2VDaGFuZ2VDdXJzb3JPbkhvdmVyID0gKHtcbiAgbWFwRWxlbWVudCxcbiAgaXNIb3ZlcmluZ1Jlc3VsdCxcbiAgaG92ZXJHZW8sXG4gIGludGVyYWN0aXZlR2VvLFxuICBtb3ZlRnJvbSxcbiAgaXNEcmF3aW5nLFxufToge1xuICBtYXBFbGVtZW50OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbiAgaXNIb3ZlcmluZ1Jlc3VsdDogYm9vbGVhblxuICBob3ZlckdlbzogSG92ZXJHZW9cbiAgaW50ZXJhY3RpdmVHZW86IG51bWJlciB8IG51bGxcbiAgbW92ZUZyb206IENlc2l1bS5DYXJ0ZXNpYW4zIHwgbnVsbFxuICBpc0RyYXdpbmc6IGJvb2xlYW5cbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwRWxlbWVudCkge1xuICAgICAgY29uc3QgY2FudmFzID0gbWFwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKVxuXG4gICAgICBpZiAoY2FudmFzICYmICFpc0RyYXdpbmcpIHtcbiAgICAgICAgaWYgKGludGVyYWN0aXZlR2VvKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHVzZXIgaXMgaW4gJ2ludGVyYWN0aXZlIG1vZGUnIHdpdGggYSBnZW8sIG9ubHkgc2hvdyBhIHNwZWNpYWwgY3Vyc29yXG4gICAgICAgICAgLy8gd2hlbiBob3ZlcmluZyBvdmVyIHRoYXQgZ2VvLlxuICAgICAgICAgIGlmIChob3Zlckdlby5pZCA9PT0gaW50ZXJhY3RpdmVHZW8pIHtcbiAgICAgICAgICAgIGNhbnZhcy5zdHlsZS5jdXJzb3IgPSBtb3ZlRnJvbSA/ICdncmFiYmluZycgOiAnZ3JhYidcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9ICcnXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGhvdmVyR2VvLmludGVyYWN0aXZlIHx8IGlzSG92ZXJpbmdSZXN1bHQpIHtcbiAgICAgICAgICBjYW52YXMuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInXG4gICAgICAgIH0gZWxzZSBpZiAoaG92ZXJHZW8uaW50ZXJhY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9ICdub3QtYWxsb3dlZCdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYW52YXMuc3R5bGUuY3Vyc29yID0gJydcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21hcEVsZW1lbnQsIGlzSG92ZXJpbmdSZXN1bHQsIGhvdmVyR2VvLCBpbnRlcmFjdGl2ZUdlbywgbW92ZUZyb21dKVxufVxuY29uc3QgdXNlQ2hhbmdlQ3Vyc29yT25EcmF3aW5nID0gKHtcbiAgbWFwRWxlbWVudCxcbiAgaXNEcmF3aW5nLFxufToge1xuICBtYXBFbGVtZW50OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbiAgaXNEcmF3aW5nOiBib29sZWFuXG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcEVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGNhbnZhcyA9IG1hcEVsZW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJylcbiAgICAgIGlmIChjYW52YXMpIHtcbiAgICAgICAgaWYgKGlzRHJhd2luZykge1xuICAgICAgICAgIGNhbnZhcy5zdHlsZS5jdXJzb3IgPSAnY3Jvc3NoYWlyJ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbnZhcy5zdHlsZS5jdXJzb3IgPSAnJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCBbbWFwRWxlbWVudCwgaXNEcmF3aW5nXSlcbn1cbmV4cG9ydCBjb25zdCBNYXBWaWV3UmVhY3QgPSAocHJvcHM6IE1hcFZpZXdSZWFjdFR5cGUpID0+IHtcbiAgY29uc3QgW2lzQ2x1c3RlcmluZywgc2V0SXNDbHVzdGVyaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBtYXBNb2RlbCA9IHVzZU1hcE1vZGVsKClcbiAgY29uc3QgW21hcERyYXdpbmdQb3B1cEVsZW1lbnQsIHNldE1hcERyYXdpbmdQb3B1cEVsZW1lbnRdID1cbiAgICBSZWFjdC51c2VTdGF0ZTxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb250YWluZXJFbGVtZW50LCBzZXRDb250YWluZXJFbGVtZW50XSA9XG4gICAgUmVhY3QudXNlU3RhdGU8SFRNTERpdkVsZW1lbnQgfCBudWxsPihudWxsKVxuICBjb25zdCBbbWFwRWxlbWVudCwgc2V0TWFwRWxlbWVudF0gPSBSZWFjdC51c2VTdGF0ZTxIVE1MRGl2RWxlbWVudCB8IG51bGw+KFxuICAgIG51bGxcbiAgKVxuICBjb25zdCBtYXAgPSB1c2VNYXAoe1xuICAgIC4uLnByb3BzLFxuICAgIG1hcEVsZW1lbnQsXG4gICAgbWFwTW9kZWwsXG4gICAgY29udGFpbmVyRWxlbWVudCxcbiAgICBtYXBEcmF3aW5nUG9wdXBFbGVtZW50LFxuICB9KVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHByb3BzLnNldE1hcChtYXApIC8vIGFsbG93IG91dHNpZGUgYWNjZXNzIHRvIG1hcFxuICB9LCBbbWFwXSlcbiAgdXNlV3JlcXJNYXBMaXN0ZW5lcnMoeyBtYXAgfSlcbiAgdXNlU2VsZWN0aW9uSW50ZXJmYWNlTWFwTGlzdGVuZXJzKHtcbiAgICBtYXAsXG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlOiBwcm9wcy5zZWxlY3Rpb25JbnRlcmZhY2UsXG4gIH0pXG4gIHVzZUxpc3RlblRvTWFwTW9kZWwoeyBtYXAsIG1hcE1vZGVsIH0pXG4gIGNvbnN0IHsgaXNIb3ZlcmluZ1Jlc3VsdCwgaG92ZXJHZW8sIGludGVyYWN0aXZlR2VvLCBtb3ZlRnJvbSB9ID1cbiAgICB1c2VNYXBMaXN0ZW5lcnMoe1xuICAgICAgbWFwLFxuICAgICAgbWFwTW9kZWwsXG4gICAgICBzZWxlY3Rpb25JbnRlcmZhY2U6IHByb3BzLnNlbGVjdGlvbkludGVyZmFjZSxcbiAgICB9KVxuICB1c2VPbk1vdXNlTGVhdmUoeyBtYXBFbGVtZW50LCBtYXBNb2RlbCB9KVxuICBjb25zdCBpc0RyYXdpbmcgPSB1c2VMaXN0ZW5Ub0RyYXdpbmcoKVxuICB1c2VDaGFuZ2VDdXJzb3JPbkRyYXdpbmcoeyBtYXBFbGVtZW50LCBpc0RyYXdpbmcgfSlcbiAgdXNlQ2hhbmdlQ3Vyc29yT25Ib3Zlcih7XG4gICAgaXNIb3ZlcmluZ1Jlc3VsdCxcbiAgICBob3ZlckdlbyxcbiAgICBpbnRlcmFjdGl2ZUdlbyxcbiAgICBtb3ZlRnJvbSxcbiAgICBpc0RyYXdpbmcsXG4gICAgbWFwRWxlbWVudCxcbiAgfSlcbiAgY29uc3QgYWRkU25hY2sgPSB1c2VTbmFjaygpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgcmVmPXtzZXRDb250YWluZXJFbGVtZW50fVxuICAgICAgY2xhc3NOYW1lPXtgdy1mdWxsIGgtZnVsbCBiZy1pbmhlcml0IHJlbGF0aXZlIHAtMmB9XG4gICAgPlxuICAgICAgeyFtYXAgPyAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPExpbmVhclByb2dyZXNzXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSBsZWZ0LTAgdy1mdWxsIGgtMiB0cmFuc2Zvcm0gLXRyYW5zbGF0ZS15LTEvMlwiXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB0b3A6ICc1MCUnLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8Lz5cbiAgICAgICkgOiAoXG4gICAgICAgIDw+PC8+XG4gICAgICApfVxuICAgICAgPGRpdiBpZD1cIm1hcERyYXdpbmdQb3B1cFwiIHJlZj17c2V0TWFwRHJhd2luZ1BvcHVwRWxlbWVudH0+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1hcC1jb250ZXh0LW1lbnVcIj48L2Rpdj5cbiAgICAgIDxkaXYgaWQ9XCJtYXBUb29sc1wiPlxuICAgICAgICB7bWFwID8gKFxuICAgICAgICAgIDxHZW9tZXRyaWVzXG4gICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e3Byb3BzLnNlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICAgIG1hcD17bWFwfVxuICAgICAgICAgICAgaXNDbHVzdGVyaW5nPXtpc0NsdXN0ZXJpbmd9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIHttYXAgPyAoXG4gICAgICAgICAgPE1hcFRvb2xiYXJcbiAgICAgICAgICAgIG1hcD17bWFwfVxuICAgICAgICAgICAgbWFwTGF5ZXJzPXtwcm9wcy5tYXBMYXllcnN9XG4gICAgICAgICAgICB6b29tVG9Ib21lPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHpvb21Ub0hvbWUoeyBtYXAgfSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBzYXZlQXNIb21lPXsoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGJvdW5kaW5nQm94ID0gbWFwLmdldEJvdW5kaW5nQm94KClcbiAgICAgICAgICAgICAgY29uc3QgdXNlclByZWZlcmVuY2VzID0gdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJylcbiAgICAgICAgICAgICAgdXNlclByZWZlcmVuY2VzLnNldCgnbWFwSG9tZScsIGJvdW5kaW5nQm94KVxuICAgICAgICAgICAgICBhZGRTbmFjaygnU3VjY2VzcyEgTmV3IG1hcCBob21lIGxvY2F0aW9uIHNldC4nLCB7XG4gICAgICAgICAgICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICAgICAgICAgICAgc2V2ZXJpdHk6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGlzQ2x1c3RlcmluZz17aXNDbHVzdGVyaW5nfVxuICAgICAgICAgICAgdG9nZ2xlQ2x1c3RlcmluZz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRJc0NsdXN0ZXJpbmcoIWlzQ2x1c3RlcmluZylcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIHttYXAgPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxQYXBlclxuICAgICAgICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInAtMiB6LTEwIGFic29sdXRlIHJpZ2h0LTAgYm90dG9tLTAgbXItNCBtYi00XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBtYXAuem9vbUluKClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPFBsdXNJY29uIGNsYXNzTmFtZT1cIiAgaC01IHctNVwiIC8+XG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC56b29tT3V0KClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPE1pbnVzSWNvbiBjbGFzc05hbWU9XCIgIGgtNSB3LTVcIiAvPlxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2XG4gICAgICAgIGRhdGEtaWQ9XCJtYXAtY29udGFpbmVyXCJcbiAgICAgICAgaWQ9XCJtYXBDb250YWluZXJcIlxuICAgICAgICBjbGFzc05hbWU9XCJoLWZ1bGxcIlxuICAgICAgICByZWY9e3NldE1hcEVsZW1lbnR9XG4gICAgICA+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1hcEluZm9cIj5cbiAgICAgICAge21hcE1vZGVsID8gPE1hcEluZm8gbWFwPXttYXBNb2RlbH0gLz4gOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRpc3RhbmNlSW5mb1wiPlxuICAgICAgICB7bWFwTW9kZWwgPyA8RGlzdGFuY2VJbmZvIG1hcD17bWFwTW9kZWx9IC8+IDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwb3B1cFByZXZpZXdcIj5cbiAgICAgICAge21hcCAmJiBtYXBNb2RlbCAmJiBwcm9wcy5zZWxlY3Rpb25JbnRlcmZhY2UgPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxQb3B1cFByZXZpZXdcbiAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgIG1hcE1vZGVsPXttYXBNb2RlbH1cbiAgICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlPXtwcm9wcy5zZWxlY3Rpb25JbnRlcmZhY2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAge21hcE1vZGVsID8gPE1hcENvbnRleHREcm9wZG93biBtYXBNb2RlbD17bWFwTW9kZWx9IC8+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIl19