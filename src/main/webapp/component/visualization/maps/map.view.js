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
//# sourceMappingURL=map.view.js.map