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
        (mapEvent.mapTarget.constructor === Array ||
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9tYXAudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEtBQUssTUFBTSxtQkFBbUIsQ0FBQTtBQUNyQyxPQUFPLElBQUksTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRCxPQUFPLFFBQVEsTUFBTSxhQUFhLENBQUE7QUFDbEMsT0FBTyxPQUFPLE1BQU0sbUNBQW1DLENBQUE7QUFDdkQsT0FBTyxZQUFZLE1BQU0sd0NBQXdDLENBQUE7QUFDakUsT0FBTyxXQUFXLE1BQU0sdUJBQXVCLENBQUE7QUFDL0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ2xELE9BQU8sVUFBVSxNQUFNLGVBQWUsQ0FBQTtBQUN0QyxPQUFPLGtCQUFrQixNQUFNLDhDQUE4QyxDQUFBO0FBQzdFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQTtBQUV2RSxPQUFPLFVBQVUsTUFBTSxvQkFBb0IsQ0FBQTtBQUMzQyxPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQUN6RCxPQUFPLFlBQVksTUFBTSx3Q0FBd0MsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0UsT0FBTyxRQUFRLE1BQU0sc0JBQXNCLENBQUE7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUNuQyxPQUFPLGdCQUFnQixNQUFNLG9DQUFvQyxDQUFBO0FBQ2pFLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxt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KlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi8uLi9qcy93cmVxcidcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCBNYXBNb2RlbCBmcm9tICcuL21hcC5tb2RlbCdcbmltcG9ydCBNYXBJbmZvIGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9tYXAtaW5mbydcbmltcG9ydCBEaXN0YW5jZUluZm8gZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L2Rpc3RhbmNlLWluZm8nXG5pbXBvcnQgZ2V0RGlzdGFuY2UgZnJvbSAnZ2VvbGliL2VzL2dldERpc3RhbmNlJ1xuaW1wb3J0IHsgRHJhd2luZyB9IGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvZHJhd2luZydcbmltcG9ydCBNYXBUb29sYmFyIGZyb20gJy4vbWFwLXRvb2xiYXInXG5pbXBvcnQgTWFwQ29udGV4dERyb3Bkb3duIGZyb20gJy4uLy4uL21hcC1jb250ZXh0LW1lbnUvbWFwLWNvbnRleHQtbWVudS52aWV3J1xuaW1wb3J0IHsgdXNlTGlzdGVuVG8gfSBmcm9tICcuLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgR2VvbWV0cmllcyBmcm9tICcuL3JlYWN0L2dlb21ldHJpZXMnXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCBQb3B1cFByZXZpZXcgZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3BvcHVwLXByZXZpZXcnXG5pbXBvcnQgeyBTSEFQRV9JRF9QUkVGSVgsIGdldERyYXdNb2RlRnJvbU1vZGVsIH0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0IHVzZVNuYWNrIGZyb20gJy4uLy4uL2hvb2tzL3VzZVNuYWNrJ1xuaW1wb3J0IHsgem9vbVRvSG9tZSB9IGZyb20gJy4vaG9tZSdcbmltcG9ydCBmZWF0dXJlRGV0ZWN0aW9uIGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvZmVhdHVyZS1kZXRlY3Rpb24nXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi8uLi90aGVtZS90aGVtZSdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgUGx1c0ljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9BZGQnXG5pbXBvcnQgTWludXNJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvUmVtb3ZlJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnY2VzaS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgQ2VzaXVtIGZyb20gJ2Nlc2l1bS9CdWlsZC9DZXNpdW0vQ2VzaXVtJ1xuaW1wb3J0IHsgSW50ZXJhY3Rpb25zQ29udGV4dCwgVHJhbnNsYXRpb24gfSBmcm9tICcuL2ludGVyYWN0aW9ucy5wcm92aWRlcidcbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCdcbmltcG9ydCBTaGFwZVV0aWxzIGZyb20gJy4uLy4uLy4uL2pzL1NoYXBlVXRpbHMnXG5cbnR5cGUgSG92ZXJHZW8gPSB7XG4gIGludGVyYWN0aXZlPzogYm9vbGVhblxuICBpZD86IG51bWJlclxufVxuXG5jb25zdCB1c2VNYXBDb2RlID0gKHByb3BzOiBNYXBWaWV3UmVhY3RUeXBlKSA9PiB7XG4gIGNvbnN0IFttYXBDb2RlLCBzZXRNYXBDb2RlXSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBwcm9wcy5sb2FkTWFwKCkudGhlbigoTWFwOiBhbnkpID0+IHtcbiAgICAgIHNldE1hcENvZGUoeyBjcmVhdGVNYXA6IE1hcCB9KVxuICAgIH0pXG4gIH0sIFtwcm9wcy5sb2FkTWFwXSlcbiAgcmV0dXJuIG1hcENvZGVcbn1cbmNvbnN0IHVzZU1hcCA9IChcbiAgcHJvcHM6IE1hcFZpZXdSZWFjdFR5cGUgJiB7XG4gICAgbWFwRWxlbWVudDogSFRNTERpdkVsZW1lbnQgfCBudWxsXG4gICAgbWFwTW9kZWw6IGFueVxuICAgIGNvbnRhaW5lckVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICAgIG1hcERyYXdpbmdQb3B1cEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICAgIG1hcExheWVyczogYW55XG4gIH1cbikgPT4ge1xuICBjb25zdCBbbWFwLCBzZXRNYXBdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuICBjb25zdCBtYXBDb2RlID0gdXNlTWFwQ29kZShwcm9wcylcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocHJvcHMubWFwRWxlbWVudCAmJiBtYXBDb2RlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBzZXRNYXAoXG4gICAgICAgICAgbWFwQ29kZS5jcmVhdGVNYXAoXG4gICAgICAgICAgICBwcm9wcy5tYXBFbGVtZW50LFxuICAgICAgICAgICAgcHJvcHMuc2VsZWN0aW9uSW50ZXJmYWNlLFxuICAgICAgICAgICAgcHJvcHMubWFwRHJhd2luZ1BvcHVwRWxlbWVudCxcbiAgICAgICAgICAgIHByb3BzLmNvbnRhaW5lckVsZW1lbnQsXG4gICAgICAgICAgICBwcm9wcy5tYXBNb2RlbCxcbiAgICAgICAgICAgIHByb3BzLm1hcExheWVyc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGZlYXR1cmVEZXRlY3Rpb24uYWRkRmFpbHVyZSgnY2VzaXVtJylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChwcm9wcy5tYXBFbGVtZW50ICYmIG1hcENvZGUgJiYgbWFwKSB7XG4gICAgICAgIG1hcC5kZXN0cm95KClcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtwcm9wcy5tYXBFbGVtZW50LCBtYXBDb2RlXSlcbiAgcmV0dXJuIG1hcFxufVxuY29uc3QgdXNlTWFwTW9kZWwgPSAoKSA9PiB7XG4gIGNvbnN0IFttYXBNb2RlbF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG5ldyBNYXBNb2RlbCgpKVxuICByZXR1cm4gbWFwTW9kZWxcbn1cbi8qXG4gICAgSGFuZGxlcyBkcmF3aW5nIG9yIGNsZWFyaW5nIHRoZSBydWxlciBhcyBuZWVkZWQgYnkgdGhlIG1lYXN1cmVtZW50IHN0YXRlLlxuXG4gICAgU1RBUlQgaW5kaWNhdGVzIHRoYXQgYSBzdGFydGluZyBwb2ludCBzaG91bGQgYmUgZHJhd24sXG4gICAgc28gdGhlIG1hcCBjbGVhcnMgYW55IHByZXZpb3VzIHBvaW50cyBkcmF3biBhbmQgZHJhd3MgYSBuZXcgc3RhcnQgcG9pbnQuXG5cbiAgICBFTkQgaW5kaWNhdGVzIHRoYXQgYW4gZW5kaW5nIHBvaW50IHNob3VsZCBiZSBkcmF3bixcbiAgICBzbyB0aGUgbWFwIGRyYXdzIGFuIGVuZCBwb2ludCBhbmQgYSBsaW5lLCBhbmQgY2FsY3VsYXRlcyB0aGUgZGlzdGFuY2UuXG5cbiAgICBOT05FIGluZGljYXRlcyB0aGF0IHRoZSBydWxlciBzaG91bGQgYmUgY2xlYXJlZC5cbiAgKi9cbmNvbnN0IGhhbmRsZU1lYXN1cmVtZW50U3RhdGVDaGFuZ2UgPSAoe1xuICBtYXAsXG4gIG1hcE1vZGVsLFxufToge1xuICBtYXA6IGFueVxuICBtYXBNb2RlbDogYW55XG59KSA9PiB7XG4gIGNvbnN0IHN0YXRlID0gbWFwTW9kZWwuZ2V0KCdtZWFzdXJlbWVudFN0YXRlJylcbiAgbGV0IHBvaW50ID0gbnVsbFxuICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgY2FzZSAnU1RBUlQnOlxuICAgICAgY2xlYXJSdWxlcih7IG1hcCwgbWFwTW9kZWwgfSlcbiAgICAgIHBvaW50ID0gbWFwLmFkZFJ1bGVyUG9pbnQobWFwTW9kZWwuZ2V0KCdjb29yZGluYXRlVmFsdWVzJykpXG4gICAgICBtYXBNb2RlbC5hZGRQb2ludChwb2ludClcbiAgICAgIG1hcE1vZGVsLnNldFN0YXJ0aW5nQ29vcmRpbmF0ZXMoe1xuICAgICAgICBsYXQ6IG1hcE1vZGVsLmdldCgnY29vcmRpbmF0ZVZhbHVlcycpWydsYXQnXSxcbiAgICAgICAgbG9uOiBtYXBNb2RlbC5nZXQoJ2Nvb3JkaW5hdGVWYWx1ZXMnKVsnbG9uJ10sXG4gICAgICB9KVxuICAgICAgY29uc3QgcG9seWxpbmUgPSBtYXAuYWRkUnVsZXJMaW5lKG1hcE1vZGVsLmdldCgnY29vcmRpbmF0ZVZhbHVlcycpKVxuICAgICAgbWFwTW9kZWwuc2V0TGluZShwb2x5bGluZSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnRU5EJzpcbiAgICAgIHBvaW50ID0gbWFwLmFkZFJ1bGVyUG9pbnQobWFwTW9kZWwuZ2V0KCdjb29yZGluYXRlVmFsdWVzJykpXG4gICAgICBtYXBNb2RlbC5hZGRQb2ludChwb2ludClcbiAgICAgIG1hcC5zZXRSdWxlckxpbmUoe1xuICAgICAgICBsYXQ6IG1hcE1vZGVsLmdldCgnY29vcmRpbmF0ZVZhbHVlcycpWydsYXQnXSxcbiAgICAgICAgbG9uOiBtYXBNb2RlbC5nZXQoJ2Nvb3JkaW5hdGVWYWx1ZXMnKVsnbG9uJ10sXG4gICAgICB9KVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdOT05FJzpcbiAgICAgIGNsZWFyUnVsZXIoeyBtYXAsIG1hcE1vZGVsIH0pXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVha1xuICB9XG59XG4vKlxuICAgIEhhbmRsZXMgdGFza3MgZm9yIGNsZWFyaW5nIHRoZSBydWxlciwgd2hpY2ggaW5jbHVkZSByZW1vdmluZyBhbGwgcG9pbnRzXG4gICAgKGVuZHBvaW50cyBvZiB0aGUgbGluZSkgYW5kIHRoZSBsaW5lLlxuICAqL1xuY29uc3QgY2xlYXJSdWxlciA9ICh7IG1hcCwgbWFwTW9kZWwgfTogeyBtYXA6IGFueTsgbWFwTW9kZWw6IGFueSB9KSA9PiB7XG4gIGNvbnN0IHBvaW50cyA9IG1hcE1vZGVsLmdldCgncG9pbnRzJylcbiAgcG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICBtYXAucmVtb3ZlUnVsZXJQb2ludChwb2ludClcbiAgfSlcbiAgbWFwTW9kZWwuY2xlYXJQb2ludHMoKVxuICBjb25zdCBsaW5lID0gbWFwTW9kZWwucmVtb3ZlTGluZSgpXG4gIG1hcC5yZW1vdmVSdWxlckxpbmUobGluZSlcbn1cbi8qXG4gKiAgUmVkcmF3IGFuZCByZWNhbGN1bGF0ZSB0aGUgcnVsZXIgbGluZSBhbmQgZGlzdGFuY2VJbmZvIHRvb2x0aXAuIFdpbGwgbm90IHJlZHJhdyB3aGlsZSB0aGUgbWVudSBpcyBjdXJyZW50bHlcbiAqICBkaXNwbGF5ZWQgdXBkYXRlT25NZW51IGFsbG93cyB1cGRhdGluZyB3aGlsZSB0aGUgbWVudSBpcyB1cFxuICovXG5jb25zdCB1cGRhdGVEaXN0YW5jZSA9ICh7XG4gIG1hcCxcbiAgbWFwTW9kZWwsXG4gIHVwZGF0ZU9uTWVudSA9IGZhbHNlLFxufToge1xuICBtYXA6IGFueVxuICBtYXBNb2RlbDogYW55XG4gIHVwZGF0ZU9uTWVudT86IGJvb2xlYW5cbn0pID0+IHtcbiAgaWYgKG1hcE1vZGVsLmdldCgnbWVhc3VyZW1lbnRTdGF0ZScpID09PSAnU1RBUlQnKSB7XG4gICAgY29uc3Qgb3Blbk1lbnUgPSB0cnVlIC8vIFRPRE86IGludmVzdGlnYXRlIHRoaXNcbiAgICBjb25zdCBsYXQgPSBtYXBNb2RlbC5nZXQoJ21vdXNlTGF0JylcbiAgICBjb25zdCBsb24gPSBtYXBNb2RlbC5nZXQoJ21vdXNlTG9uJylcbiAgICBpZiAoKHVwZGF0ZU9uTWVudSA9PT0gdHJ1ZSB8fCAhb3Blbk1lbnUpICYmIGxhdCAmJiBsb24pIHtcbiAgICAgIC8vIHJlZHJhdyBydWxlciBsaW5lXG4gICAgICBjb25zdCBtb3VzZVBvaW50ID0geyBsYXQsIGxvbiB9XG4gICAgICBtYXAuc2V0UnVsZXJMaW5lKG1vdXNlUG9pbnQpXG4gICAgICAvLyB1cGRhdGUgZGlzdGFuY2UgaW5mb1xuICAgICAgY29uc3Qgc3RhcnRpbmdDb29yZGluYXRlcyA9IG1hcE1vZGVsLmdldCgnc3RhcnRpbmdDb29yZGluYXRlcycpXG4gICAgICBjb25zdCBkaXN0ID0gZ2V0RGlzdGFuY2UoXG4gICAgICAgIHsgbGF0aXR1ZGU6IGxhdCwgbG9uZ2l0dWRlOiBsb24gfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhdGl0dWRlOiBzdGFydGluZ0Nvb3JkaW5hdGVzWydsYXQnXSxcbiAgICAgICAgICBsb25naXR1ZGU6IHN0YXJ0aW5nQ29vcmRpbmF0ZXNbJ2xvbiddLFxuICAgICAgICB9XG4gICAgICApXG4gICAgICBtYXBNb2RlbC5zZXREaXN0YW5jZUluZm9Qb3NpdGlvbihcbiAgICAgICAgKGV2ZW50IGFzIGFueSkuY2xpZW50WCxcbiAgICAgICAgKGV2ZW50IGFzIGFueSkuY2xpZW50WVxuICAgICAgKVxuICAgICAgbWFwTW9kZWwuc2V0Q3VycmVudERpc3RhbmNlKGRpc3QpXG4gICAgfVxuICB9XG59XG5jb25zdCB1c2VXcmVxck1hcExpc3RlbmVycyA9ICh7IG1hcCB9OiB7IG1hcDogYW55IH0pID0+IHtcbiAgdXNlTGlzdGVuVG8obWFwID8gKHdyZXFyIGFzIGFueSkudmVudCA6IHVuZGVmaW5lZCwgJ21ldGFjYXJkOm92ZXJsYXknLCAoKSA9PiB7XG4gICAgbWFwLm92ZXJsYXlJbWFnZS5iaW5kKG1hcCkoKVxuICB9KVxuICB1c2VMaXN0ZW5UbyhcbiAgICBtYXAgPyAod3JlcXIgYXMgYW55KS52ZW50IDogdW5kZWZpbmVkLFxuICAgICdtZXRhY2FyZDpvdmVybGF5OnJlbW92ZScsXG4gICAgKCkgPT4ge1xuICAgICAgbWFwLnJlbW92ZU92ZXJsYXkuYmluZChtYXApKClcbiAgICB9XG4gIClcbiAgdXNlTGlzdGVuVG8oXG4gICAgbWFwID8gKHdyZXFyIGFzIGFueSkudmVudCA6IHVuZGVmaW5lZCxcbiAgICAnc2VhcmNoOm1hcHJlY3RhbmdsZWZseScsXG4gICAgKCkgPT4ge1xuICAgICAgbWFwLnpvb21Ub0V4dGVudC5iaW5kKG1hcCkoKVxuICAgIH1cbiAgKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXApIHtcbiAgICB9XG4gIH0sIFttYXBdKVxufVxuY29uc3QgdXNlU2VsZWN0aW9uSW50ZXJmYWNlTWFwTGlzdGVuZXJzID0gKHtcbiAgbWFwLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIG1hcDogYW55XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59KSA9PiB7XG4gIHVzZUxpc3RlblRvKFxuICAgIG1hcCA/IHNlbGVjdGlvbkludGVyZmFjZSA6IHVuZGVmaW5lZCxcbiAgICAncmVzZXQ6YWN0aXZlU2VhcmNoUmVzdWx0cycsXG4gICAgKCkgPT4ge1xuICAgICAgbWFwLnJlbW92ZUFsbE92ZXJsYXlzLmJpbmQobWFwKSgpXG4gICAgfVxuICApXG59XG5jb25zdCB1c2VMaXN0ZW5Ub01hcE1vZGVsID0gKHtcbiAgbWFwLFxuICBtYXBNb2RlbCxcbn06IHtcbiAgbWFwOiBhbnlcbiAgbWFwTW9kZWw6IGFueVxufSkgPT4ge1xuICB1c2VMaXN0ZW5UbyhcbiAgICBtYXAgJiYgbWFwTW9kZWwgPyBtYXBNb2RlbCA6IHVuZGVmaW5lZCxcbiAgICAnY2hhbmdlOm1lYXN1cmVtZW50U3RhdGUnLFxuICAgICgpID0+IHtcbiAgICAgIGhhbmRsZU1lYXN1cmVtZW50U3RhdGVDaGFuZ2UoeyBtYXAsIG1hcE1vZGVsIH0pXG4gICAgfVxuICApXG4gIHVzZUxpc3RlblRvKFxuICAgIG1hcCAmJiBtYXBNb2RlbCA/IG1hcE1vZGVsIDogdW5kZWZpbmVkLFxuICAgICdjaGFuZ2U6bW91c2VMYXQgY2hhbmdlOm1vdXNlTG9uJyxcbiAgICAoKSA9PiB7XG4gICAgICB1cGRhdGVEaXN0YW5jZSh7IG1hcCwgbWFwTW9kZWwgfSlcbiAgICB9XG4gIClcbn1cbmNvbnN0IHVwZGF0ZVRhcmdldCA9ICh7XG4gIG1hcE1vZGVsLFxuICBtZXRhY2FyZCxcbn06IHtcbiAgbWFwTW9kZWw6IGFueVxuICBtZXRhY2FyZDogTGF6eVF1ZXJ5UmVzdWx0XG59KSA9PiB7XG4gIGxldCB0YXJnZXRcbiAgbGV0IHRhcmdldE1ldGFjYXJkXG4gIGlmIChtZXRhY2FyZCkge1xuICAgIHRhcmdldCA9IG1ldGFjYXJkLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGVcbiAgICB0YXJnZXRNZXRhY2FyZCA9IG1ldGFjYXJkXG4gIH1cbiAgbWFwTW9kZWwuc2V0KHtcbiAgICB0YXJnZXQsXG4gICAgdGFyZ2V0TWV0YWNhcmQsXG4gIH0pXG59XG5jb25zdCBoYW5kbGVNYXBIb3ZlciA9ICh7XG4gIG1hcE1vZGVsLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIG1hcEV2ZW50LFxuICBzZXRJc0hvdmVyaW5nUmVzdWx0LFxuICBzZXRIb3Zlckdlbyxcbn06IHtcbiAgbWFwOiBhbnlcbiAgbWFwTW9kZWw6IGFueVxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxuICBtYXBFdmVudDogYW55XG4gIHNldElzSG92ZXJpbmdSZXN1bHQ6ICh2YWw6IGJvb2xlYW4pID0+IHZvaWRcbiAgc2V0SG92ZXJHZW86ICh2YWw6IEhvdmVyR2VvKSA9PiB2b2lkXG59KSA9PiB7XG4gIGNvbnN0IGlzSG92ZXJpbmdPdmVyR2VvID0gQm9vbGVhbihcbiAgICBtYXBFdmVudC5tYXBUYXJnZXQgJiZcbiAgICAgIG1hcEV2ZW50Lm1hcFRhcmdldC5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nICYmXG4gICAgICAoKG1hcEV2ZW50Lm1hcFRhcmdldCBhcyBzdHJpbmcpLnN0YXJ0c1dpdGgoU0hBUEVfSURfUFJFRklYKSB8fFxuICAgICAgICBtYXBFdmVudC5tYXBUYXJnZXQgPT09ICd1c2VyRHJhd2luZycpXG4gIClcblxuICBpZiAoaXNIb3ZlcmluZ092ZXJHZW8pIHtcbiAgICBzZXRIb3Zlckdlbyh7XG4gICAgICBpZDogbWFwRXZlbnQubWFwTG9jYXRpb25JZCxcbiAgICAgIGludGVyYWN0aXZlOiBCb29sZWFuKG1hcEV2ZW50Lm1hcExvY2F0aW9uSWQpLFxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgc2V0SG92ZXJHZW8oe30pXG4gIH1cblxuICBpZiAoIXNlbGVjdGlvbkludGVyZmFjZSkge1xuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGN1cnJlbnRRdWVyeSA9IHNlbGVjdGlvbkludGVyZmFjZS5nZXQoJ2N1cnJlbnRRdWVyeScpXG4gIGlmICghY3VycmVudFF1ZXJ5KSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gY3VycmVudFF1ZXJ5LmdldCgncmVzdWx0JylcbiAgaWYgKCFyZXN1bHQpIHtcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBtZXRhY2FyZCA9IHJlc3VsdC5nZXQoJ2xhenlSZXN1bHRzJykucmVzdWx0c1ttYXBFdmVudC5tYXBUYXJnZXRdXG4gIHVwZGF0ZVRhcmdldCh7IG1ldGFjYXJkLCBtYXBNb2RlbCB9KVxuXG4gIHNldElzSG92ZXJpbmdSZXN1bHQoXG4gICAgQm9vbGVhbihcbiAgICAgIG1hcEV2ZW50Lm1hcFRhcmdldCAmJlxuICAgICAgICBtYXBFdmVudC5tYXBUYXJnZXQgIT09ICd1c2VyRHJhd2luZycgJiZcbiAgICAgICAgKG1hcEV2ZW50Lm1hcFRhcmdldC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgfHxcbiAgICAgICAgICAobWFwRXZlbnQubWFwVGFyZ2V0LmNvbnN0cnVjdG9yID09PSBTdHJpbmcgJiZcbiAgICAgICAgICAgICEobWFwRXZlbnQubWFwVGFyZ2V0IGFzIHN0cmluZykuc3RhcnRzV2l0aChTSEFQRV9JRF9QUkVGSVgpKSlcbiAgICApXG4gIClcbn1cblxuY29uc3QgZ2V0TG9jYXRpb24gPSAobW9kZWw6IEJhY2tib25lLk1vZGVsLCB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uKSA9PiB7XG4gIGNvbnN0IGxvY2F0aW9uVHlwZSA9IGdldERyYXdNb2RlRnJvbU1vZGVsKHsgbW9kZWwgfSlcbiAgc3dpdGNoIChsb2NhdGlvblR5cGUpIHtcbiAgICBjYXNlICdiYm94JzpcbiAgICAgIGNvbnN0IGJib3ggPSBfLnBpY2soXG4gICAgICAgIG1vZGVsLmF0dHJpYnV0ZXMsXG4gICAgICAgICdtYXBOb3J0aCcsXG4gICAgICAgICdtYXBTb3V0aCcsXG4gICAgICAgICdtYXBFYXN0JyxcbiAgICAgICAgJ21hcFdlc3QnLFxuICAgICAgICAnbm9ydGgnLFxuICAgICAgICAnc291dGgnLFxuICAgICAgICAnZWFzdCcsXG4gICAgICAgICd3ZXN0J1xuICAgICAgKVxuICAgICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zbGF0ZWRCYm94ID0gdHJhbnNsYXRlQmJveChiYm94LCB0cmFuc2xhdGlvbilcbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZWRCYm94XG4gICAgICB9XG4gICAgICByZXR1cm4gYmJveFxuICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICBjb25zdCBwb2ludCA9IF8ucGljayhtb2RlbC5hdHRyaWJ1dGVzLCAnbGF0JywgJ2xvbicpXG4gICAgICBpZiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRlZFBvaW50ID0gdHJhbnNsYXRlUG9pbnQoXG4gICAgICAgICAgcG9pbnQubG9uLFxuICAgICAgICAgIHBvaW50LmxhdCxcbiAgICAgICAgICB0cmFuc2xhdGlvblxuICAgICAgICApXG4gICAgICAgIHJldHVybiB0cmFuc2xhdGVkUG9pbnRcbiAgICAgIH1cbiAgICAgIHJldHVybiBwb2ludFxuICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgY29uc3QgbGluZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobW9kZWwuZ2V0KCdsaW5lJykpKVxuICAgICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgIHRyYW5zbGF0ZUxpbmUobGluZSwgdHJhbnNsYXRpb24pXG4gICAgICB9XG4gICAgICByZXR1cm4geyBsaW5lIH1cbiAgICBjYXNlICdwb2x5JzpcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsLmdldCgncG9seWdvbicpKSlcbiAgICAgIGlmICh0cmFuc2xhdGlvbikge1xuICAgICAgICBjb25zdCBtdWx0aVBvbHlnb24gPSBTaGFwZVV0aWxzLmlzQXJyYXkzRChwb2x5Z29uKSA/IHBvbHlnb24gOiBbcG9seWdvbl1cbiAgICAgICAgdHJhbnNsYXRlUG9seWdvbihtdWx0aVBvbHlnb24sIHRyYW5zbGF0aW9uKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgcG9seWdvbiB9XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7fVxuICB9XG59XG5cbnR5cGUgTG9uTGF0ID0gW2xvbmdpdHVkZTogbnVtYmVyLCBsYXRpdHVkZTogbnVtYmVyXVxuXG5jb25zdCB0cmFuc2xhdGVQb2x5Z29uID0gKHBvbHlnb246IExvbkxhdFtdW10sIHRyYW5zbGF0aW9uOiBUcmFuc2xhdGlvbikgPT4ge1xuICAvLyBvZGQgdGhpbmdzIGhhcHBlbiB3aGVuIGxhdGl0dWRlIGlzIGV4YWN0bHkgb3IgdmVyeSBjbG9zZSB0byBlaXRoZXIgOTAgb3IgLTkwXG4gIGNvbnN0IG5vcnRoUG9sZSA9IDg5Ljk5XG4gIGNvbnN0IHNvdXRoUG9sZSA9IC04OS45OVxuICBsZXQgbWF4TGF0ID0gMFxuICBsZXQgbWluTGF0ID0gMFxuICBsZXQgZGlmZiA9IDBcblxuICBmb3IgKGNvbnN0IHJpbmcgb2YgcG9seWdvbikge1xuICAgIGZvciAoY29uc3QgY29vcmQgb2YgcmluZykge1xuICAgICAgY29uc3QgW2xvbiwgbGF0XSA9IHRyYW5zbGF0ZUNvb3JkaW5hdGVzKGNvb3JkWzBdLCBjb29yZFsxXSwgdHJhbnNsYXRpb24pXG4gICAgICBjb29yZFswXSA9IGxvblxuICAgICAgY29vcmRbMV0gPSBsYXRcbiAgICAgIG1heExhdCA9IE1hdGgubWF4KGxhdCwgbWF4TGF0KVxuICAgICAgbWluTGF0ID0gTWF0aC5taW4obGF0LCBtaW5MYXQpXG4gICAgfVxuICB9XG5cbiAgaWYgKG1heExhdCA+IG5vcnRoUG9sZSkge1xuICAgIGRpZmYgPSBNYXRoLmFicyhtYXhMYXQgLSBub3J0aFBvbGUpXG4gIH0gZWxzZSBpZiAobWluTGF0IDwgc291dGhQb2xlKSB7XG4gICAgZGlmZiA9IC1NYXRoLmFicyhtaW5MYXQgLSBzb3V0aFBvbGUpXG4gIH1cblxuICBpZiAoZGlmZiAhPT0gMCkge1xuICAgIGZvciAoY29uc3QgcmluZyBvZiBwb2x5Z29uKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvb3JkIG9mIHJpbmcpIHtcbiAgICAgICAgY29vcmRbMV0gLT0gZGlmZlxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCB0cmFuc2xhdGVMaW5lID0gKGxpbmU6IExvbkxhdFtdLCB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb24pID0+IHtcbiAgLy8gb2RkIHRoaW5ncyBoYXBwZW4gd2hlbiBsYXRpdHVkZSBpcyBleGFjdGx5IG9yIHZlcnkgY2xvc2UgdG8gZWl0aGVyIDkwIG9yIC05MFxuICBjb25zdCBub3J0aFBvbGUgPSA4OS45OVxuICBjb25zdCBzb3V0aFBvbGUgPSAtODkuOTlcbiAgbGV0IG1heExhdCA9IDBcbiAgbGV0IG1pbkxhdCA9IDBcbiAgbGV0IGRpZmYgPSAwXG4gIGZvciAoY29uc3QgY29vcmQgb2YgbGluZSkge1xuICAgIGNvbnN0IFtsb24sIGxhdF0gPSB0cmFuc2xhdGVDb29yZGluYXRlcyhjb29yZFswXSwgY29vcmRbMV0sIHRyYW5zbGF0aW9uKVxuICAgIG1heExhdCA9IE1hdGgubWF4KGxhdCwgbWF4TGF0KVxuICAgIG1pbkxhdCA9IE1hdGgubWluKGxhdCwgbWluTGF0KVxuICAgIGNvb3JkWzBdID0gbG9uXG4gICAgY29vcmRbMV0gPSBsYXRcbiAgfVxuXG4gIC8vIHByZXZlbnQgcG9sYXIgY3Jvc3NpbmdcbiAgaWYgKG1heExhdCA+IG5vcnRoUG9sZSkge1xuICAgIGRpZmYgPSBNYXRoLmFicyhtYXhMYXQgLSBub3J0aFBvbGUpXG4gIH0gZWxzZSBpZiAobWluTGF0IDwgc291dGhQb2xlKSB7XG4gICAgZGlmZiA9IC1NYXRoLmFicyhtaW5MYXQgLSBzb3V0aFBvbGUpXG4gIH1cblxuICBpZiAoZGlmZiAhPT0gMCkge1xuICAgIGZvciAoY29uc3QgY29vcmQgb2YgbGluZSkge1xuICAgICAgY29vcmRbMV0gLT0gZGlmZlxuICAgIH1cbiAgfVxufVxuXG50eXBlIGJib3hDb29yZHMgPSB7XG4gIG1hcE5vcnRoOiBudW1iZXJcbiAgbWFwU291dGg6IG51bWJlclxuICBtYXBFYXN0OiBudW1iZXJcbiAgbWFwV2VzdDogbnVtYmVyXG4gIG5vcnRoPzogbnVtYmVyXG4gIHNvdXRoPzogbnVtYmVyXG4gIGVhc3Q/OiBudW1iZXJcbiAgd2VzdD86IG51bWJlclxufVxuXG5jb25zdCB0cmFuc2xhdGVCYm94ID0gKFxuICBiYm94OiBiYm94Q29vcmRzLFxuICB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb25cbik6IGJib3hDb29yZHMgPT4ge1xuICBjb25zdCB0cmFuc2xhdGVkID0geyAuLi5iYm94IH1cbiAgbGV0IFtlYXN0LCBub3J0aF0gPSB0cmFuc2xhdGVDb29yZGluYXRlcyhcbiAgICBiYm94Lm1hcEVhc3QsXG4gICAgYmJveC5tYXBOb3J0aCxcbiAgICB0cmFuc2xhdGlvblxuICApXG4gIGxldCBbd2VzdCwgc291dGhdID0gdHJhbnNsYXRlQ29vcmRpbmF0ZXMoXG4gICAgYmJveC5tYXBXZXN0LFxuICAgIGJib3gubWFwU291dGgsXG4gICAgdHJhbnNsYXRpb25cbiAgKVxuXG4gIGNvbnN0IG5vcnRoUG9sZSA9IDkwXG4gIGNvbnN0IHNvdXRoUG9sZSA9IC05MFxuXG4gIC8vIHByZXZlbnQgcG9sYXIgY3Jvc3NpbmdcbiAgbGV0IGRpZmZcbiAgaWYgKG5vcnRoID4gbm9ydGhQb2xlKSB7XG4gICAgZGlmZiA9IE1hdGguYWJzKG5vcnRoIC0gbm9ydGhQb2xlKVxuICAgIG5vcnRoID0gbm9ydGhQb2xlXG4gICAgc291dGggPSBzb3V0aCAtIGRpZmZcbiAgfVxuXG4gIGlmIChzb3V0aCA8IHNvdXRoUG9sZSkge1xuICAgIGRpZmYgPSBNYXRoLmFicyhzb3V0aFBvbGUgLSBzb3V0aClcbiAgICBzb3V0aCA9IHNvdXRoUG9sZVxuICAgIG5vcnRoID0gbm9ydGggKyBkaWZmXG4gIH1cblxuICB0cmFuc2xhdGVkLm1hcE5vcnRoID0gbm9ydGhcbiAgdHJhbnNsYXRlZC5tYXBFYXN0ID0gZWFzdFxuICB0cmFuc2xhdGVkLm1hcFNvdXRoID0gc291dGhcbiAgdHJhbnNsYXRlZC5tYXBXZXN0ID0gd2VzdFxuXG4gIHRyYW5zbGF0ZWQubm9ydGggPSBub3J0aFxuICB0cmFuc2xhdGVkLmVhc3QgPSBlYXN0XG4gIHRyYW5zbGF0ZWQuc291dGggPSBzb3V0aFxuICB0cmFuc2xhdGVkLndlc3QgPSB3ZXN0XG5cbiAgcmV0dXJuIHRyYW5zbGF0ZWRcbn1cblxuY29uc3QgdHJhbnNsYXRlUG9pbnQgPSAoXG4gIGxvbjogbnVtYmVyLFxuICBsYXQ6IG51bWJlcixcbiAgdHJhbnNsYXRpb246IFRyYW5zbGF0aW9uXG4pOiB7IGxvbjogbnVtYmVyOyBsYXQ6IG51bWJlciB9ID0+IHtcbiAgbGV0IFt1cGRhdGVkTG9uLCB1cGRhdGVkTGF0XSA9IHRyYW5zbGF0ZUNvb3JkaW5hdGVzKGxvbiwgbGF0LCB0cmFuc2xhdGlvbilcbiAgY29uc3Qgbm9ydGhQb2xlID0gODkuOTlcbiAgY29uc3Qgc291dGhQb2xlID0gLTg5Ljk5XG5cbiAgaWYgKHVwZGF0ZWRMYXQgPiBub3J0aFBvbGUpIHtcbiAgICB1cGRhdGVkTGF0ID0gbm9ydGhQb2xlXG4gIH0gZWxzZSBpZiAodXBkYXRlZExhdCA8IHNvdXRoUG9sZSkge1xuICAgIHVwZGF0ZWRMYXQgPSBzb3V0aFBvbGVcbiAgfVxuICByZXR1cm4geyBsb246IHVwZGF0ZWRMb24sIGxhdDogdXBkYXRlZExhdCB9XG59XG5cbmNvbnN0IHRyYW5zbGF0ZUNvb3JkaW5hdGVzID0gKFxuICBsb25naXR1ZGU6IG51bWJlcixcbiAgbGF0aXR1ZGU6IG51bWJlcixcbiAgdHJhbnNsYXRpb246IFRyYW5zbGF0aW9uXG4pOiBMb25MYXQgPT4ge1xuICBsZXQgdHJhbnNsYXRlZExvbiA9IGxvbmdpdHVkZSArIHRyYW5zbGF0aW9uLmxvbmdpdHVkZVxuICBsZXQgdHJhbnNsYXRlZExhdCA9IGxhdGl0dWRlICsgdHJhbnNsYXRpb24ubGF0aXR1ZGVcblxuICAvLyBub3JtYWxpemUgbG9uZ2l0dWRlXG4gIGlmICh0cmFuc2xhdGVkTG9uID4gMTgwKSB7XG4gICAgdHJhbnNsYXRlZExvbiAtPSAzNjBcbiAgfVxuICBpZiAodHJhbnNsYXRlZExvbiA8IC0xODApIHtcbiAgICB0cmFuc2xhdGVkTG9uICs9IDM2MFxuICB9XG5cbiAgcmV0dXJuIFt0cmFuc2xhdGVkTG9uLCB0cmFuc2xhdGVkTGF0XVxufVxuXG5jb25zdCB1c2VNYXBMaXN0ZW5lcnMgPSAoe1xuICBtYXAsXG4gIG1hcE1vZGVsLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIG1hcDogYW55XG4gIG1hcE1vZGVsOiBhbnlcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbn0pID0+IHtcbiAgY29uc3QgW2lzSG92ZXJpbmdSZXN1bHQsIHNldElzSG92ZXJpbmdSZXN1bHRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtob3Zlckdlbywgc2V0SG92ZXJHZW9dID0gUmVhY3QudXNlU3RhdGU8SG92ZXJHZW8+KHt9KVxuICBjb25zdCB7XG4gICAgbW92ZUZyb20sXG4gICAgc2V0TW92ZUZyb20sXG4gICAgaW50ZXJhY3RpdmVHZW8sXG4gICAgc2V0SW50ZXJhY3RpdmVHZW8sXG4gICAgaW50ZXJhY3RpdmVNb2RlbHMsXG4gICAgc2V0SW50ZXJhY3RpdmVNb2RlbHMsXG4gICAgdHJhbnNsYXRpb24sXG4gICAgc2V0VHJhbnNsYXRpb24sXG4gIH0gPSBSZWFjdC51c2VDb250ZXh0KEludGVyYWN0aW9uc0NvbnRleHQpXG5cbiAgY29uc3QgYWRkU25hY2sgPSB1c2VTbmFjaygpXG5cbiAgY29uc3QgdXBDYWxsYmFja1JlZiA9IFJlYWN0LnVzZVJlZjwoKSA9PiB2b2lkPigpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB1cENhbGxiYWNrUmVmLmN1cnJlbnQgPSAoKSA9PiB7XG4gICAgICBpZiAoaW50ZXJhY3RpdmVNb2RlbHMubGVuZ3RoID4gMCAmJiB0cmFuc2xhdGlvbikge1xuICAgICAgICBjb25zdCB1bmRvRm5zOiAoKCkgPT4ge30pW10gPSBbXVxuICAgICAgICBmb3IgKGNvbnN0IG1vZGVsIG9mIGludGVyYWN0aXZlTW9kZWxzKSB7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxMb2NhdGlvbiA9IGdldExvY2F0aW9uKG1vZGVsKVxuICAgICAgICAgIGNvbnN0IG5ld0xvY2F0aW9uID0gZ2V0TG9jYXRpb24obW9kZWwsIHRyYW5zbGF0aW9uKVxuICAgICAgICAgIG1vZGVsLnNldChuZXdMb2NhdGlvbilcbiAgICAgICAgICB1bmRvRm5zLnB1c2goKCkgPT4gbW9kZWwuc2V0KG9yaWdpbmFsTG9jYXRpb24pKVxuICAgICAgICB9XG4gICAgICAgIGFkZFNuYWNrKFxuICAgICAgICAgICdMb2NhdGlvbiB1cGRhdGVkLiBZb3UgbWF5IHN0aWxsIG5lZWQgdG8gc2F2ZSB0aGUgaXRlbSB0aGF0IHVzZXMgaXQuJyxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogYCR7aW50ZXJhY3RpdmVHZW99Lm1vdmVgLFxuICAgICAgICAgICAgdW5kbzogKCkgPT4ge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHVuZG9GbiBvZiB1bmRvRm5zKSB7XG4gICAgICAgICAgICAgICAgdW5kb0ZuKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHNldE1vdmVGcm9tKG51bGwpXG4gICAgICBzZXRUcmFuc2xhdGlvbihudWxsKVxuICAgIH1cbiAgfSwgW2ludGVyYWN0aXZlTW9kZWxzLCB0cmFuc2xhdGlvbl0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaW50ZXJhY3RpdmVHZW8pIHtcbiAgICAgIC8vIFRoaXMgaGFuZGxlciBtaWdodCBkaXNhYmxlIGRyYWdnaW5nIHRvIG1vdmUgdGhlIG1hcCwgc28gb25seSBzZXQgaXQgdXBcbiAgICAgIC8vIHdoZW4gdGhlIHVzZXIgaGFzIHN0YXJ0ZWQgaW50ZXJhY3Rpbmcgd2l0aCBhIGdlby5cbiAgICAgIG1hcC5vbk1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKHtcbiAgICAgICAgbW92ZUZyb20sXG4gICAgICAgIGRvd246ICh7XG4gICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgbWFwTG9jYXRpb25JZCxcbiAgICAgICAgfToge1xuICAgICAgICAgIHBvc2l0aW9uOiBhbnlcbiAgICAgICAgICBtYXBMb2NhdGlvbklkOiBudW1iZXJcbiAgICAgICAgfSkgPT4ge1xuICAgICAgICAgIGlmIChtYXBMb2NhdGlvbklkID09PSBpbnRlcmFjdGl2ZUdlbyAmJiAhRHJhd2luZy5pc0RyYXdpbmcoKSkge1xuICAgICAgICAgICAgc2V0TW92ZUZyb20ocG9zaXRpb24pXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtb3ZlOiAoe1xuICAgICAgICAgIHRyYW5zbGF0aW9uLFxuICAgICAgICAgIG1hcExvY2F0aW9uSWQsXG4gICAgICAgIH06IHtcbiAgICAgICAgICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG4gICAgICAgICAgbWFwTG9jYXRpb25JZDogbnVtYmVyXG4gICAgICAgIH0pID0+IHtcbiAgICAgICAgICBpZiAobWFwTG9jYXRpb25JZCA9PT0gaW50ZXJhY3RpdmVHZW8pIHtcbiAgICAgICAgICAgIHNldEhvdmVyR2VvKHtcbiAgICAgICAgICAgICAgaWQ6IG1hcExvY2F0aW9uSWQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRIb3Zlckdlbyh7fSlcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0VHJhbnNsYXRpb24odHJhbnNsYXRpb24gPz8gbnVsbClcbiAgICAgICAgfSxcbiAgICAgICAgdXA6ICgpID0+IHVwQ2FsbGJhY2tSZWYuY3VycmVudD8uKCksXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gbWFwPy5jbGVhck1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKClcbiAgfSwgW21hcCwgaW50ZXJhY3RpdmVHZW8sIG1vdmVGcm9tXSlcblxuICBjb25zdCBoYW5kbGVLZXlkb3duID0gUmVhY3QudXNlQ2FsbGJhY2soKGU6IGFueSkgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgIHNldEludGVyYWN0aXZlR2VvKG51bGwpXG4gICAgICBzZXRJbnRlcmFjdGl2ZU1vZGVscyhbXSlcbiAgICAgIHNldE1vdmVGcm9tKG51bGwpXG4gICAgICBzZXRUcmFuc2xhdGlvbihudWxsKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaW50ZXJhY3RpdmVHZW8pIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5ZG93bilcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICB9LCBbaW50ZXJhY3RpdmVHZW9dKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcCAmJiAhbW92ZUZyb20pIHtcbiAgICAgIGNvbnN0IGhhbmRsZUxlZnRDbGljayA9IChtYXBMb2NhdGlvbklkPzogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChtYXBMb2NhdGlvbklkICYmICFpbnRlcmFjdGl2ZUdlbyAmJiAhRHJhd2luZy5pc0RyYXdpbmcoKSkge1xuICAgICAgICAgIHNldEludGVyYWN0aXZlR2VvKG1hcExvY2F0aW9uSWQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0SW50ZXJhY3RpdmVHZW8obnVsbClcbiAgICAgICAgICBzZXRJbnRlcmFjdGl2ZU1vZGVscyhbXSlcbiAgICAgICAgICBzZXRNb3ZlRnJvbShudWxsKVxuICAgICAgICAgIHNldFRyYW5zbGF0aW9uKG51bGwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG1hcC5vbkxlZnRDbGlja01hcEFQSShoYW5kbGVMZWZ0Q2xpY2spXG4gICAgfVxuICAgIGlmIChtYXAgJiYgIWludGVyYWN0aXZlR2VvKSB7XG4gICAgICBpZiAoIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICAgLy8gQ2xpY2tzIHVzZWQgaW4gZHJhd2luZyBvbiB0aGUgM0QgbWFwLCBzbyBsZXQncyBpZ25vcmUgdGhlbSBoZXJlXG4gICAgICAgIC8vIHdoaWxlIGRyYXdpbmcuXG4gICAgICAgIG1hcC5vbkRvdWJsZUNsaWNrKClcbiAgICAgICAgbWFwLm9uUmlnaHRDbGljaygoZXZlbnQ6IGFueSwgX21hcEV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgbWFwTW9kZWwuc2V0KHtcbiAgICAgICAgICAgIG1vdXNlWDogZXZlbnQub2Zmc2V0WCxcbiAgICAgICAgICAgIG1vdXNlWTogZXZlbnQub2Zmc2V0WSxcbiAgICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBtYXBNb2RlbC51cGRhdGVDbGlja0Nvb3JkaW5hdGVzKClcbiAgICAgICAgICB1cGRhdGVEaXN0YW5jZSh7IG1hcCwgbWFwTW9kZWwsIHVwZGF0ZU9uTWVudTogdHJ1ZSB9KVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAobWFwTW9kZWwpIHtcbiAgICAgICAgbWFwLm9uTW91c2VNb3ZlKChfZXZlbnQ6IGFueSwgbWFwRXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICAgIGhhbmRsZU1hcEhvdmVyKHtcbiAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgIG1hcEV2ZW50LFxuICAgICAgICAgICAgbWFwTW9kZWwsXG4gICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgICAgICAgICBzZXRJc0hvdmVyaW5nUmVzdWx0LFxuICAgICAgICAgICAgc2V0SG92ZXJHZW8sXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIG1hcD8uY2xlYXJNb3VzZU1vdmUoKVxuICAgICAgbWFwPy5jbGVhckRvdWJsZUNsaWNrKClcbiAgICAgIG1hcD8uY2xlYXJSaWdodENsaWNrKClcbiAgICAgIG1hcD8uY2xlYXJMZWZ0Q2xpY2tNYXBBUEkoKVxuICAgIH1cbiAgfSwgW21hcCwgbWFwTW9kZWwsIHNlbGVjdGlvbkludGVyZmFjZSwgaW50ZXJhY3RpdmVHZW8sIG1vdmVGcm9tXSlcbiAgcmV0dXJuIHtcbiAgICBpc0hvdmVyaW5nUmVzdWx0LFxuICAgIGhvdmVyR2VvLFxuICAgIGludGVyYWN0aXZlR2VvLFxuICAgIHNldEludGVyYWN0aXZlR2VvLFxuICAgIG1vdmVGcm9tLFxuICB9XG59XG5jb25zdCB1c2VPbk1vdXNlTGVhdmUgPSAoe1xuICBtYXBFbGVtZW50LFxuICBtYXBNb2RlbCxcbn06IHtcbiAgbWFwRWxlbWVudDogYW55XG4gIG1hcE1vZGVsOiBhbnlcbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwRWxlbWVudCAmJiBtYXBNb2RlbCkge1xuICAgICAgbWFwRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICBtYXBNb2RlbC5jbGVhck1vdXNlQ29vcmRpbmF0ZXMoKVxuICAgICAgfSlcbiAgICB9XG4gIH0sIFttYXBFbGVtZW50LCBtYXBNb2RlbF0pXG59XG5jb25zdCB1c2VMaXN0ZW5Ub0RyYXdpbmcgPSAoKSA9PiB7XG4gIGNvbnN0IFtpc0RyYXdpbmcsIHNldElzRHJhd2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgdXNlTGlzdGVuVG8oRHJhd2luZywgJ2NoYW5nZTpkcmF3aW5nJywgKCkgPT4ge1xuICAgIHNldElzRHJhd2luZyhEcmF3aW5nLmlzRHJhd2luZygpKVxuICB9KVxuICByZXR1cm4gaXNEcmF3aW5nXG59XG50eXBlIE1hcFZpZXdSZWFjdFR5cGUgPSB7XG4gIHNldE1hcDogKG1hcDogYW55KSA9PiB2b2lkXG4gIC8qXG4gICAgICBNYXAgY3JlYXRpb24gaXMgZGVmZXJyZWQgdG8gdGhpcyBtZXRob2QsIHNvIHRoYXQgYWxsIHJlc291cmNlcyBwZXJ0YWluaW5nIHRvIHRoZSBtYXAgY2FuIGJlIGxvYWRlZCBsYXppbHkgYW5kXG4gICAgICBub3QgYmUgaW5jbHVkZWQgaW4gdGhlIGluaXRpYWwgcGFnZSBwYXlsb2FkLlxuICAgICAgQmVjYXVzZSBvZiB0aGlzLCBtYWtlIHN1cmUgdG8gcmV0dXJuIGEgZGVmZXJyZWQgdGhhdCB3aWxsIHJlc29sdmUgd2hlbiB5b3VyIHJlc3BlY3RpdmUgbWFwIGltcGxlbWVudGF0aW9uXG4gICAgICBpcyBmaW5pc2hlZCBsb2FkaW5nIC8gc3RhcnRpbmcgdXAuXG4gICAgICBBbHNvLCBtYWtlIHN1cmUgeW91IHJlc29sdmUgdGhhdCBkZWZlcnJlZCBieSBwYXNzaW5nIHRoZSByZWZlcmVuY2UgdG8gdGhlIG1hcCBpbXBsZW1lbnRhdGlvbi5cbiAgICAqL1xuICBsb2FkTWFwOiAoKSA9PiBhbnlcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgbWFwTGF5ZXJzOiBhbnlcbn1cbmNvbnN0IHVzZUNoYW5nZUN1cnNvck9uSG92ZXIgPSAoe1xuICBtYXBFbGVtZW50LFxuICBpc0hvdmVyaW5nUmVzdWx0LFxuICBob3ZlckdlbyxcbiAgaW50ZXJhY3RpdmVHZW8sXG4gIG1vdmVGcm9tLFxuICBpc0RyYXdpbmcsXG59OiB7XG4gIG1hcEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICBpc0hvdmVyaW5nUmVzdWx0OiBib29sZWFuXG4gIGhvdmVyR2VvOiBIb3Zlckdlb1xuICBpbnRlcmFjdGl2ZUdlbzogbnVtYmVyIHwgbnVsbFxuICBtb3ZlRnJvbTogQ2VzaXVtLkNhcnRlc2lhbjMgfCBudWxsXG4gIGlzRHJhd2luZzogYm9vbGVhblxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXBFbGVtZW50KSB7XG4gICAgICBjb25zdCBjYW52YXMgPSBtYXBFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpXG5cbiAgICAgIGlmIChjYW52YXMgJiYgIWlzRHJhd2luZykge1xuICAgICAgICBpZiAoaW50ZXJhY3RpdmVHZW8pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgdXNlciBpcyBpbiAnaW50ZXJhY3RpdmUgbW9kZScgd2l0aCBhIGdlbywgb25seSBzaG93IGEgc3BlY2lhbCBjdXJzb3JcbiAgICAgICAgICAvLyB3aGVuIGhvdmVyaW5nIG92ZXIgdGhhdCBnZW8uXG4gICAgICAgICAgaWYgKGhvdmVyR2VvLmlkID09PSBpbnRlcmFjdGl2ZUdlbykge1xuICAgICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9IG1vdmVGcm9tID8gJ2dyYWJiaW5nJyA6ICdncmFiJ1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUuY3Vyc29yID0gJydcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaG92ZXJHZW8uaW50ZXJhY3RpdmUgfHwgaXNIb3ZlcmluZ1Jlc3VsdCkge1xuICAgICAgICAgIGNhbnZhcy5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcidcbiAgICAgICAgfSBlbHNlIGlmIChob3Zlckdlby5pbnRlcmFjdGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBjYW52YXMuc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbnZhcy5zdHlsZS5jdXJzb3IgPSAnJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCBbbWFwRWxlbWVudCwgaXNIb3ZlcmluZ1Jlc3VsdCwgaG92ZXJHZW8sIGludGVyYWN0aXZlR2VvLCBtb3ZlRnJvbV0pXG59XG5jb25zdCB1c2VDaGFuZ2VDdXJzb3JPbkRyYXdpbmcgPSAoe1xuICBtYXBFbGVtZW50LFxuICBpc0RyYXdpbmcsXG59OiB7XG4gIG1hcEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICBpc0RyYXdpbmc6IGJvb2xlYW5cbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWFwRWxlbWVudCkge1xuICAgICAgY29uc3QgY2FudmFzID0gbWFwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKVxuICAgICAgaWYgKGNhbnZhcykge1xuICAgICAgICBpZiAoaXNEcmF3aW5nKSB7XG4gICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9ICcnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIFttYXBFbGVtZW50LCBpc0RyYXdpbmddKVxufVxuZXhwb3J0IGNvbnN0IE1hcFZpZXdSZWFjdCA9IChwcm9wczogTWFwVmlld1JlYWN0VHlwZSkgPT4ge1xuICBjb25zdCBbaXNDbHVzdGVyaW5nLCBzZXRJc0NsdXN0ZXJpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IG1hcE1vZGVsID0gdXNlTWFwTW9kZWwoKVxuICBjb25zdCBbbWFwRHJhd2luZ1BvcHVwRWxlbWVudCwgc2V0TWFwRHJhd2luZ1BvcHVwRWxlbWVudF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbnRhaW5lckVsZW1lbnQsIHNldENvbnRhaW5lckVsZW1lbnRdID1cbiAgICBSZWFjdC51c2VTdGF0ZTxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFttYXBFbGVtZW50LCBzZXRNYXBFbGVtZW50XSA9IFJlYWN0LnVzZVN0YXRlPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4oXG4gICAgbnVsbFxuICApXG4gIGNvbnN0IG1hcCA9IHVzZU1hcCh7XG4gICAgLi4ucHJvcHMsXG4gICAgbWFwRWxlbWVudCxcbiAgICBtYXBNb2RlbCxcbiAgICBjb250YWluZXJFbGVtZW50LFxuICAgIG1hcERyYXdpbmdQb3B1cEVsZW1lbnQsXG4gIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcHJvcHMuc2V0TWFwKG1hcCkgLy8gYWxsb3cgb3V0c2lkZSBhY2Nlc3MgdG8gbWFwXG4gIH0sIFttYXBdKVxuICB1c2VXcmVxck1hcExpc3RlbmVycyh7IG1hcCB9KVxuICB1c2VTZWxlY3Rpb25JbnRlcmZhY2VNYXBMaXN0ZW5lcnMoe1xuICAgIG1hcCxcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2U6IHByb3BzLnNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgdXNlTGlzdGVuVG9NYXBNb2RlbCh7IG1hcCwgbWFwTW9kZWwgfSlcbiAgY29uc3QgeyBpc0hvdmVyaW5nUmVzdWx0LCBob3ZlckdlbywgaW50ZXJhY3RpdmVHZW8sIG1vdmVGcm9tIH0gPVxuICAgIHVzZU1hcExpc3RlbmVycyh7XG4gICAgICBtYXAsXG4gICAgICBtYXBNb2RlbCxcbiAgICAgIHNlbGVjdGlvbkludGVyZmFjZTogcHJvcHMuc2VsZWN0aW9uSW50ZXJmYWNlLFxuICAgIH0pXG4gIHVzZU9uTW91c2VMZWF2ZSh7IG1hcEVsZW1lbnQsIG1hcE1vZGVsIH0pXG4gIGNvbnN0IGlzRHJhd2luZyA9IHVzZUxpc3RlblRvRHJhd2luZygpXG4gIHVzZUNoYW5nZUN1cnNvck9uRHJhd2luZyh7IG1hcEVsZW1lbnQsIGlzRHJhd2luZyB9KVxuICB1c2VDaGFuZ2VDdXJzb3JPbkhvdmVyKHtcbiAgICBpc0hvdmVyaW5nUmVzdWx0LFxuICAgIGhvdmVyR2VvLFxuICAgIGludGVyYWN0aXZlR2VvLFxuICAgIG1vdmVGcm9tLFxuICAgIGlzRHJhd2luZyxcbiAgICBtYXBFbGVtZW50LFxuICB9KVxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICByZWY9e3NldENvbnRhaW5lckVsZW1lbnR9XG4gICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgaC1mdWxsIGJnLWluaGVyaXQgcmVsYXRpdmUgcC0yYH1cbiAgICA+XG4gICAgICB7IW1hcCA/IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8TGluZWFyUHJvZ3Jlc3NcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMCB3LWZ1bGwgaC0yIHRyYW5zZm9ybSAtdHJhbnNsYXRlLXktMS8yXCJcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHRvcDogJzUwJScsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvPlxuICAgICAgKSA6IChcbiAgICAgICAgPD48Lz5cbiAgICAgICl9XG4gICAgICA8ZGl2IGlkPVwibWFwRHJhd2luZ1BvcHVwXCIgcmVmPXtzZXRNYXBEcmF3aW5nUG9wdXBFbGVtZW50fT48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWFwLWNvbnRleHQtbWVudVwiPjwvZGl2PlxuICAgICAgPGRpdiBpZD1cIm1hcFRvb2xzXCI+XG4gICAgICAgIHttYXAgPyAoXG4gICAgICAgICAgPEdlb21ldHJpZXNcbiAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZT17cHJvcHMuc2VsZWN0aW9uSW50ZXJmYWNlfVxuICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICBpc0NsdXN0ZXJpbmc9e2lzQ2x1c3RlcmluZ31cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge21hcCA/IChcbiAgICAgICAgICA8TWFwVG9vbGJhclxuICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICBtYXBMYXllcnM9e3Byb3BzLm1hcExheWVyc31cbiAgICAgICAgICAgIHpvb21Ub0hvbWU9eygpID0+IHtcbiAgICAgICAgICAgICAgem9vbVRvSG9tZSh7IG1hcCB9KVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHNhdmVBc0hvbWU9eygpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgYm91bmRpbmdCb3ggPSBtYXAuZ2V0Qm91bmRpbmdCb3goKVxuICAgICAgICAgICAgICBjb25zdCB1c2VyUHJlZmVyZW5jZXMgPSB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKVxuICAgICAgICAgICAgICB1c2VyUHJlZmVyZW5jZXMuc2V0KCdtYXBIb21lJywgYm91bmRpbmdCb3gpXG4gICAgICAgICAgICAgIGFkZFNuYWNrKCdTdWNjZXNzISBOZXcgbWFwIGhvbWUgbG9jYXRpb24gc2V0LicsIHtcbiAgICAgICAgICAgICAgICBhbGVydFByb3BzOiB7XG4gICAgICAgICAgICAgICAgICBzZXZlcml0eTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgaXNDbHVzdGVyaW5nPXtpc0NsdXN0ZXJpbmd9XG4gICAgICAgICAgICB0b2dnbGVDbHVzdGVyaW5nPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldElzQ2x1c3RlcmluZyghaXNDbHVzdGVyaW5nKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge21hcCA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPFBhcGVyXG4gICAgICAgICAgICAgIGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicC0yIHotMTAgYWJzb2x1dGUgcmlnaHQtMCBib3R0b20tMCBtci00IG1iLTRcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC56b29tSW4oKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8UGx1c0ljb24gY2xhc3NOYW1lPVwiICBoLTUgdy01XCIgLz5cbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnpvb21PdXQoKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8TWludXNJY29uIGNsYXNzTmFtZT1cIiAgaC01IHctNVwiIC8+XG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgZGF0YS1pZD1cIm1hcC1jb250YWluZXJcIlxuICAgICAgICBpZD1cIm1hcENvbnRhaW5lclwiXG4gICAgICAgIGNsYXNzTmFtZT1cImgtZnVsbFwiXG4gICAgICAgIHJlZj17c2V0TWFwRWxlbWVudH1cbiAgICAgID48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWFwSW5mb1wiPlxuICAgICAgICB7bWFwTW9kZWwgPyA8TWFwSW5mbyBtYXA9e21hcE1vZGVsfSAvPiA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGlzdGFuY2VJbmZvXCI+XG4gICAgICAgIHttYXBNb2RlbCA/IDxEaXN0YW5jZUluZm8gbWFwPXttYXBNb2RlbH0gLz4gOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBvcHVwUHJldmlld1wiPlxuICAgICAgICB7bWFwICYmIG1hcE1vZGVsICYmIHByb3BzLnNlbGVjdGlvbkludGVyZmFjZSA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPFBvcHVwUHJldmlld1xuICAgICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgICAgbWFwTW9kZWw9e21hcE1vZGVsfVxuICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e3Byb3BzLnNlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICB7bWFwTW9kZWwgPyA8TWFwQ29udGV4dERyb3Bkb3duIG1hcE1vZGVsPXttYXBNb2RlbH0gLz4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iXX0=