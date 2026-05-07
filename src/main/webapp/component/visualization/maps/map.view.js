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
                                        }, children: _jsx(MinusIcon, { className: "  h-5 w-5" }) }) })] }) })) : null] }), _jsx("div", { "data-id": "map-container", id: "mapContainer", className: "h-full", ref: setMapElement }), _jsx("div", { className: "mapInfo", children: mapModel ? _jsx(MapInfo, { map: mapModel }) : null }), _jsx("div", { className: "popupPreview", children: map && mapModel && props.selectionInterface ? (_jsx(_Fragment, { children: _jsx(PopupPreview, { map: map, mapModel: mapModel, selectionInterface: props.selectionInterface }) })) : null }), mapModel ? _jsx(MapContextDropdown, { mapModel: mapModel }) : null] }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9tYXAudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLE1BQU0sbUJBQW1CLENBQUE7QUFDckMsT0FBTyxJQUFJLE1BQU0sZ0NBQWdDLENBQUE7QUFDakQsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFBO0FBQ2xDLE9BQU8sT0FBTyxNQUFNLG1DQUFtQyxDQUFBO0FBQ3ZELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNsRCxPQUFPLFVBQVUsTUFBTSxlQUFlLENBQUE7QUFDdEMsT0FBTyxrQkFBa0IsTUFBTSw4Q0FBOEMsQ0FBQTtBQUM3RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkNBQTJDLENBQUE7QUFFdkUsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxjQUFjLE1BQU0sOEJBQThCLENBQUE7QUFDekQsT0FBTyxZQUFZLE1BQU0sd0NBQXdDLENBQUE7QUFDakUsT0FBTyxFQUFFLGVBQWUsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzdFLE9BQU8sUUFBUSxNQUFNLHNCQUFzQixDQUFBO0FBQzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDbkMsT0FBTyxnQkFBZ0IsTUFBTSxvQ0FBb0MsQ0FBQTtBQUNqRSxPQUFPLEtBQUssTUFBTSxxQkFBcUIsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDOUMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxRQUFRLE1BQU0s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QUksR0FDSixFQUNMLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBQyxrQkFBa0IsSUFBQyxRQUFRLEVBQUUsUUFBUSxHQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFDekQsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi8uLi9qcy93cmVxcidcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCBNYXBNb2RlbCBmcm9tICcuL21hcC5tb2RlbCdcbmltcG9ydCBNYXBJbmZvIGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9tYXAtaW5mbydcbmltcG9ydCB7IERyYXdpbmcgfSBmcm9tICcuLi8uLi9zaW5nbGV0b25zL2RyYXdpbmcnXG5pbXBvcnQgTWFwVG9vbGJhciBmcm9tICcuL21hcC10b29sYmFyJ1xuaW1wb3J0IE1hcENvbnRleHREcm9wZG93biBmcm9tICcuLi8uLi9tYXAtY29udGV4dC1tZW51L21hcC1jb250ZXh0LW1lbnUudmlldydcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IEdlb21ldHJpZXMgZnJvbSAnLi9yZWFjdC9nZW9tZXRyaWVzJ1xuaW1wb3J0IExpbmVhclByb2dyZXNzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTGluZWFyUHJvZ3Jlc3MnXG5pbXBvcnQgUG9wdXBQcmV2aWV3IGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9wb3B1cC1wcmV2aWV3J1xuaW1wb3J0IHsgU0hBUEVfSURfUFJFRklYLCBnZXREcmF3TW9kZUZyb21Nb2RlbCB9IGZyb20gJy4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCB1c2VTbmFjayBmcm9tICcuLi8uLi9ob29rcy91c2VTbmFjaydcbmltcG9ydCB7IHpvb21Ub0hvbWUgfSBmcm9tICcuL2hvbWUnXG5pbXBvcnQgZmVhdHVyZURldGVjdGlvbiBmcm9tICcuLi8uLi9zaW5nbGV0b25zL2ZlYXR1cmUtZGV0ZWN0aW9uJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyBFbGV2YXRpb25zIH0gZnJvbSAnLi4vLi4vdGhlbWUvdGhlbWUnXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IFBsdXNJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQWRkJ1xuaW1wb3J0IE1pbnVzSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL1JlbW92ZSdcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcbmltcG9ydCB7IEludGVyYWN0aW9uc0NvbnRleHQsIFRyYW5zbGF0aW9uIH0gZnJvbSAnLi9pbnRlcmFjdGlvbnMucHJvdmlkZXInXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgU2hhcGVVdGlscyBmcm9tICcuLi8uLi8uLi9qcy9TaGFwZVV0aWxzJ1xuXG50eXBlIEhvdmVyR2VvID0ge1xuICBpbnRlcmFjdGl2ZT86IGJvb2xlYW5cbiAgaWQ/OiBudW1iZXJcbn1cblxuY29uc3QgdXNlTWFwQ29kZSA9IChwcm9wczogTWFwVmlld1JlYWN0VHlwZSkgPT4ge1xuICBjb25zdCBbbWFwQ29kZSwgc2V0TWFwQ29kZV0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcHJvcHMubG9hZE1hcCgpLnRoZW4oKE1hcDogYW55KSA9PiB7XG4gICAgICBzZXRNYXBDb2RlKHsgY3JlYXRlTWFwOiBNYXAgfSlcbiAgICB9KVxuICB9LCBbcHJvcHMubG9hZE1hcF0pXG4gIHJldHVybiBtYXBDb2RlXG59XG5jb25zdCB1c2VNYXAgPSAoXG4gIHByb3BzOiBNYXBWaWV3UmVhY3RUeXBlICYge1xuICAgIG1hcEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICAgIG1hcE1vZGVsOiBhbnlcbiAgICBjb250YWluZXJFbGVtZW50OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbiAgICBtYXBEcmF3aW5nUG9wdXBFbGVtZW50OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbiAgICBtYXBMYXllcnM6IGFueVxuICB9XG4pID0+IHtcbiAgY29uc3QgW21hcCwgc2V0TWFwXSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcbiAgY29uc3QgbWFwQ29kZSA9IHVzZU1hcENvZGUocHJvcHMpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHByb3BzLm1hcEVsZW1lbnQgJiYgbWFwQ29kZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2V0TWFwKFxuICAgICAgICAgIG1hcENvZGUuY3JlYXRlTWFwKFxuICAgICAgICAgICAgcHJvcHMubWFwRWxlbWVudCxcbiAgICAgICAgICAgIHByb3BzLnNlbGVjdGlvbkludGVyZmFjZSxcbiAgICAgICAgICAgIHByb3BzLm1hcERyYXdpbmdQb3B1cEVsZW1lbnQsXG4gICAgICAgICAgICBwcm9wcy5jb250YWluZXJFbGVtZW50LFxuICAgICAgICAgICAgcHJvcHMubWFwTW9kZWwsXG4gICAgICAgICAgICBwcm9wcy5tYXBMYXllcnNcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBmZWF0dXJlRGV0ZWN0aW9uLmFkZEZhaWx1cmUoJ2Nlc2l1bScpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAocHJvcHMubWFwRWxlbWVudCAmJiBtYXBDb2RlICYmIG1hcCkge1xuICAgICAgICBtYXAuZGVzdHJveSgpXG4gICAgICB9XG4gICAgfVxuICB9LCBbcHJvcHMubWFwRWxlbWVudCwgbWFwQ29kZV0pXG4gIHJldHVybiBtYXBcbn1cbmNvbnN0IHVzZU1hcE1vZGVsID0gKCkgPT4ge1xuICBjb25zdCBbbWFwTW9kZWxdID0gUmVhY3QudXNlU3RhdGU8YW55PihuZXcgTWFwTW9kZWwoKSlcbiAgcmV0dXJuIG1hcE1vZGVsXG59XG5jb25zdCB1c2VXcmVxck1hcExpc3RlbmVycyA9ICh7IG1hcCB9OiB7IG1hcDogYW55IH0pID0+IHtcbiAgdXNlTGlzdGVuVG8obWFwID8gKHdyZXFyIGFzIGFueSkudmVudCA6IHVuZGVmaW5lZCwgJ21ldGFjYXJkOm92ZXJsYXknLCAoKSA9PiB7XG4gICAgbWFwLm92ZXJsYXlJbWFnZS5iaW5kKG1hcCkoKVxuICB9KVxuICB1c2VMaXN0ZW5UbyhcbiAgICBtYXAgPyAod3JlcXIgYXMgYW55KS52ZW50IDogdW5kZWZpbmVkLFxuICAgICdtZXRhY2FyZDpvdmVybGF5OnJlbW92ZScsXG4gICAgKCkgPT4ge1xuICAgICAgbWFwLnJlbW92ZU92ZXJsYXkuYmluZChtYXApKClcbiAgICB9XG4gIClcbiAgdXNlTGlzdGVuVG8oXG4gICAgbWFwID8gKHdyZXFyIGFzIGFueSkudmVudCA6IHVuZGVmaW5lZCxcbiAgICAnc2VhcmNoOm1hcHJlY3RhbmdsZWZseScsXG4gICAgKCkgPT4ge1xuICAgICAgbWFwLnpvb21Ub0V4dGVudC5iaW5kKG1hcCkoKVxuICAgIH1cbiAgKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXApIHtcbiAgICB9XG4gIH0sIFttYXBdKVxufVxuY29uc3QgdXNlU2VsZWN0aW9uSW50ZXJmYWNlTWFwTGlzdGVuZXJzID0gKHtcbiAgbWFwLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIG1hcDogYW55XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59KSA9PiB7XG4gIHVzZUxpc3RlblRvKFxuICAgIG1hcCA/IHNlbGVjdGlvbkludGVyZmFjZSA6IHVuZGVmaW5lZCxcbiAgICAncmVzZXQ6YWN0aXZlU2VhcmNoUmVzdWx0cycsXG4gICAgKCkgPT4ge1xuICAgICAgbWFwLnJlbW92ZUFsbE92ZXJsYXlzLmJpbmQobWFwKSgpXG4gICAgfVxuICApXG59XG5jb25zdCB1cGRhdGVUYXJnZXQgPSAoe1xuICBtYXBNb2RlbCxcbiAgbWV0YWNhcmQsXG59OiB7XG4gIG1hcE1vZGVsOiBhbnlcbiAgbWV0YWNhcmQ6IExhenlRdWVyeVJlc3VsdFxufSkgPT4ge1xuICBsZXQgdGFyZ2V0XG4gIGxldCB0YXJnZXRNZXRhY2FyZFxuICBpZiAobWV0YWNhcmQpIHtcbiAgICB0YXJnZXQgPSBtZXRhY2FyZC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlXG4gICAgdGFyZ2V0TWV0YWNhcmQgPSBtZXRhY2FyZFxuICB9XG4gIG1hcE1vZGVsLnNldCh7XG4gICAgdGFyZ2V0LFxuICAgIHRhcmdldE1ldGFjYXJkLFxuICB9KVxufVxuY29uc3QgaGFuZGxlTWFwSG92ZXIgPSAoe1xuICBtYXBNb2RlbCxcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICBtYXBFdmVudCxcbiAgc2V0SXNIb3ZlcmluZ1Jlc3VsdCxcbiAgc2V0SG92ZXJHZW8sXG59OiB7XG4gIG1hcDogYW55XG4gIG1hcE1vZGVsOiBhbnlcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgbWFwRXZlbnQ6IGFueVxuICBzZXRJc0hvdmVyaW5nUmVzdWx0OiAodmFsOiBib29sZWFuKSA9PiB2b2lkXG4gIHNldEhvdmVyR2VvOiAodmFsOiBIb3ZlckdlbykgPT4gdm9pZFxufSkgPT4ge1xuICBjb25zdCBpc0hvdmVyaW5nT3ZlckdlbyA9IEJvb2xlYW4oXG4gICAgbWFwRXZlbnQubWFwVGFyZ2V0ICYmXG4gICAgICBtYXBFdmVudC5tYXBUYXJnZXQuY29uc3RydWN0b3IgPT09IFN0cmluZyAmJlxuICAgICAgKChtYXBFdmVudC5tYXBUYXJnZXQgYXMgc3RyaW5nKS5zdGFydHNXaXRoKFNIQVBFX0lEX1BSRUZJWCkgfHxcbiAgICAgICAgbWFwRXZlbnQubWFwVGFyZ2V0ID09PSAndXNlckRyYXdpbmcnKVxuICApXG5cbiAgaWYgKGlzSG92ZXJpbmdPdmVyR2VvKSB7XG4gICAgc2V0SG92ZXJHZW8oe1xuICAgICAgaWQ6IG1hcEV2ZW50Lm1hcExvY2F0aW9uSWQsXG4gICAgICBpbnRlcmFjdGl2ZTogQm9vbGVhbihtYXBFdmVudC5tYXBMb2NhdGlvbklkKSxcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIHNldEhvdmVyR2VvKHt9KVxuICB9XG5cbiAgaWYgKCFzZWxlY3Rpb25JbnRlcmZhY2UpIHtcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBjdXJyZW50UXVlcnkgPSBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0KCdjdXJyZW50UXVlcnknKVxuICBpZiAoIWN1cnJlbnRRdWVyeSkge1xuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRRdWVyeS5nZXQoJ3Jlc3VsdCcpXG4gIGlmICghcmVzdWx0KSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgbWV0YWNhcmQgPSByZXN1bHQuZ2V0KCdsYXp5UmVzdWx0cycpLnJlc3VsdHNbbWFwRXZlbnQubWFwVGFyZ2V0XVxuICB1cGRhdGVUYXJnZXQoeyBtZXRhY2FyZCwgbWFwTW9kZWwgfSlcblxuICBzZXRJc0hvdmVyaW5nUmVzdWx0KFxuICAgIEJvb2xlYW4oXG4gICAgICBtYXBFdmVudC5tYXBUYXJnZXQgJiZcbiAgICAgICAgbWFwRXZlbnQubWFwVGFyZ2V0ICE9PSAndXNlckRyYXdpbmcnICYmXG4gICAgICAgIChBcnJheS5pc0FycmF5KG1hcEV2ZW50Lm1hcFRhcmdldCkgfHxcbiAgICAgICAgICAobWFwRXZlbnQubWFwVGFyZ2V0LmNvbnN0cnVjdG9yID09PSBTdHJpbmcgJiZcbiAgICAgICAgICAgICEobWFwRXZlbnQubWFwVGFyZ2V0IGFzIHN0cmluZykuc3RhcnRzV2l0aChTSEFQRV9JRF9QUkVGSVgpKSlcbiAgICApXG4gIClcbn1cblxuY29uc3QgZ2V0TG9jYXRpb24gPSAobW9kZWw6IEJhY2tib25lLk1vZGVsLCB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uKSA9PiB7XG4gIGNvbnN0IGxvY2F0aW9uVHlwZSA9IGdldERyYXdNb2RlRnJvbU1vZGVsKHsgbW9kZWwgfSlcbiAgc3dpdGNoIChsb2NhdGlvblR5cGUpIHtcbiAgICBjYXNlICdiYm94JzpcbiAgICAgIGNvbnN0IGJib3ggPSBfLnBpY2soXG4gICAgICAgIG1vZGVsLmF0dHJpYnV0ZXMsXG4gICAgICAgICdtYXBOb3J0aCcsXG4gICAgICAgICdtYXBTb3V0aCcsXG4gICAgICAgICdtYXBFYXN0JyxcbiAgICAgICAgJ21hcFdlc3QnLFxuICAgICAgICAnbm9ydGgnLFxuICAgICAgICAnc291dGgnLFxuICAgICAgICAnZWFzdCcsXG4gICAgICAgICd3ZXN0J1xuICAgICAgKVxuICAgICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zbGF0ZWRCYm94ID0gdHJhbnNsYXRlQmJveChiYm94LCB0cmFuc2xhdGlvbilcbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZWRCYm94XG4gICAgICB9XG4gICAgICByZXR1cm4gYmJveFxuICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICBjb25zdCBwb2ludCA9IF8ucGljayhtb2RlbC5hdHRyaWJ1dGVzLCAnbGF0JywgJ2xvbicpXG4gICAgICBpZiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRlZFBvaW50ID0gdHJhbnNsYXRlUG9pbnQoXG4gICAgICAgICAgcG9pbnQubG9uLFxuICAgICAgICAgIHBvaW50LmxhdCxcbiAgICAgICAgICB0cmFuc2xhdGlvblxuICAgICAgICApXG4gICAgICAgIHJldHVybiB0cmFuc2xhdGVkUG9pbnRcbiAgICAgIH1cbiAgICAgIHJldHVybiBwb2ludFxuICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgY29uc3QgbGluZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobW9kZWwuZ2V0KCdsaW5lJykpKVxuICAgICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgIHRyYW5zbGF0ZUxpbmUobGluZSwgdHJhbnNsYXRpb24pXG4gICAgICB9XG4gICAgICByZXR1cm4geyBsaW5lIH1cbiAgICBjYXNlICdwb2x5JzpcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsLmdldCgncG9seWdvbicpKSlcbiAgICAgIGlmICh0cmFuc2xhdGlvbikge1xuICAgICAgICBjb25zdCBtdWx0aVBvbHlnb24gPSBTaGFwZVV0aWxzLmlzQXJyYXkzRChwb2x5Z29uKSA/IHBvbHlnb24gOiBbcG9seWdvbl1cbiAgICAgICAgdHJhbnNsYXRlUG9seWdvbihtdWx0aVBvbHlnb24sIHRyYW5zbGF0aW9uKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgcG9seWdvbiB9XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7fVxuICB9XG59XG5cbnR5cGUgTG9uTGF0ID0gW2xvbmdpdHVkZTogbnVtYmVyLCBsYXRpdHVkZTogbnVtYmVyXVxuXG5jb25zdCB0cmFuc2xhdGVQb2x5Z29uID0gKHBvbHlnb246IExvbkxhdFtdW10sIHRyYW5zbGF0aW9uOiBUcmFuc2xhdGlvbikgPT4ge1xuICAvLyBvZGQgdGhpbmdzIGhhcHBlbiB3aGVuIGxhdGl0dWRlIGlzIGV4YWN0bHkgb3IgdmVyeSBjbG9zZSB0byBlaXRoZXIgOTAgb3IgLTkwXG4gIGNvbnN0IG5vcnRoUG9sZSA9IDg5Ljk5XG4gIGNvbnN0IHNvdXRoUG9sZSA9IC04OS45OVxuICBsZXQgbWF4TGF0ID0gMFxuICBsZXQgbWluTGF0ID0gMFxuICBsZXQgZGlmZiA9IDBcblxuICBmb3IgKGNvbnN0IHJpbmcgb2YgcG9seWdvbikge1xuICAgIGZvciAoY29uc3QgY29vcmQgb2YgcmluZykge1xuICAgICAgY29uc3QgW2xvbiwgbGF0XSA9IHRyYW5zbGF0ZUNvb3JkaW5hdGVzKGNvb3JkWzBdLCBjb29yZFsxXSwgdHJhbnNsYXRpb24pXG4gICAgICBjb29yZFswXSA9IGxvblxuICAgICAgY29vcmRbMV0gPSBsYXRcbiAgICAgIG1heExhdCA9IE1hdGgubWF4KGxhdCwgbWF4TGF0KVxuICAgICAgbWluTGF0ID0gTWF0aC5taW4obGF0LCBtaW5MYXQpXG4gICAgfVxuICB9XG5cbiAgaWYgKG1heExhdCA+IG5vcnRoUG9sZSkge1xuICAgIGRpZmYgPSBNYXRoLmFicyhtYXhMYXQgLSBub3J0aFBvbGUpXG4gIH0gZWxzZSBpZiAobWluTGF0IDwgc291dGhQb2xlKSB7XG4gICAgZGlmZiA9IC1NYXRoLmFicyhtaW5MYXQgLSBzb3V0aFBvbGUpXG4gIH1cblxuICBpZiAoZGlmZiAhPT0gMCkge1xuICAgIGZvciAoY29uc3QgcmluZyBvZiBwb2x5Z29uKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvb3JkIG9mIHJpbmcpIHtcbiAgICAgICAgY29vcmRbMV0gLT0gZGlmZlxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCB0cmFuc2xhdGVMaW5lID0gKGxpbmU6IExvbkxhdFtdLCB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb24pID0+IHtcbiAgLy8gb2RkIHRoaW5ncyBoYXBwZW4gd2hlbiBsYXRpdHVkZSBpcyBleGFjdGx5IG9yIHZlcnkgY2xvc2UgdG8gZWl0aGVyIDkwIG9yIC05MFxuICBjb25zdCBub3J0aFBvbGUgPSA4OS45OVxuICBjb25zdCBzb3V0aFBvbGUgPSAtODkuOTlcbiAgbGV0IG1heExhdCA9IDBcbiAgbGV0IG1pbkxhdCA9IDBcbiAgbGV0IGRpZmYgPSAwXG4gIGZvciAoY29uc3QgY29vcmQgb2YgbGluZSkge1xuICAgIGNvbnN0IFtsb24sIGxhdF0gPSB0cmFuc2xhdGVDb29yZGluYXRlcyhjb29yZFswXSwgY29vcmRbMV0sIHRyYW5zbGF0aW9uKVxuICAgIG1heExhdCA9IE1hdGgubWF4KGxhdCwgbWF4TGF0KVxuICAgIG1pbkxhdCA9IE1hdGgubWluKGxhdCwgbWluTGF0KVxuICAgIGNvb3JkWzBdID0gbG9uXG4gICAgY29vcmRbMV0gPSBsYXRcbiAgfVxuXG4gIC8vIHByZXZlbnQgcG9sYXIgY3Jvc3NpbmdcbiAgaWYgKG1heExhdCA+IG5vcnRoUG9sZSkge1xuICAgIGRpZmYgPSBNYXRoLmFicyhtYXhMYXQgLSBub3J0aFBvbGUpXG4gIH0gZWxzZSBpZiAobWluTGF0IDwgc291dGhQb2xlKSB7XG4gICAgZGlmZiA9IC1NYXRoLmFicyhtaW5MYXQgLSBzb3V0aFBvbGUpXG4gIH1cblxuICBpZiAoZGlmZiAhPT0gMCkge1xuICAgIGZvciAoY29uc3QgY29vcmQgb2YgbGluZSkge1xuICAgICAgY29vcmRbMV0gLT0gZGlmZlxuICAgIH1cbiAgfVxufVxuXG50eXBlIGJib3hDb29yZHMgPSB7XG4gIG1hcE5vcnRoOiBudW1iZXJcbiAgbWFwU291dGg6IG51bWJlclxuICBtYXBFYXN0OiBudW1iZXJcbiAgbWFwV2VzdDogbnVtYmVyXG4gIG5vcnRoPzogbnVtYmVyXG4gIHNvdXRoPzogbnVtYmVyXG4gIGVhc3Q/OiBudW1iZXJcbiAgd2VzdD86IG51bWJlclxufVxuXG5jb25zdCB0cmFuc2xhdGVCYm94ID0gKFxuICBiYm94OiBiYm94Q29vcmRzLFxuICB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb25cbik6IGJib3hDb29yZHMgPT4ge1xuICBjb25zdCB0cmFuc2xhdGVkID0geyAuLi5iYm94IH1cbiAgbGV0IFtlYXN0LCBub3J0aF0gPSB0cmFuc2xhdGVDb29yZGluYXRlcyhcbiAgICBiYm94Lm1hcEVhc3QsXG4gICAgYmJveC5tYXBOb3J0aCxcbiAgICB0cmFuc2xhdGlvblxuICApXG4gIGxldCBbd2VzdCwgc291dGhdID0gdHJhbnNsYXRlQ29vcmRpbmF0ZXMoXG4gICAgYmJveC5tYXBXZXN0LFxuICAgIGJib3gubWFwU291dGgsXG4gICAgdHJhbnNsYXRpb25cbiAgKVxuXG4gIGNvbnN0IG5vcnRoUG9sZSA9IDkwXG4gIGNvbnN0IHNvdXRoUG9sZSA9IC05MFxuXG4gIC8vIHByZXZlbnQgcG9sYXIgY3Jvc3NpbmdcbiAgbGV0IGRpZmZcbiAgaWYgKG5vcnRoID4gbm9ydGhQb2xlKSB7XG4gICAgZGlmZiA9IE1hdGguYWJzKG5vcnRoIC0gbm9ydGhQb2xlKVxuICAgIG5vcnRoID0gbm9ydGhQb2xlXG4gICAgc291dGggPSBzb3V0aCAtIGRpZmZcbiAgfVxuXG4gIGlmIChzb3V0aCA8IHNvdXRoUG9sZSkge1xuICAgIGRpZmYgPSBNYXRoLmFicyhzb3V0aFBvbGUgLSBzb3V0aClcbiAgICBzb3V0aCA9IHNvdXRoUG9sZVxuICAgIG5vcnRoID0gbm9ydGggKyBkaWZmXG4gIH1cblxuICB0cmFuc2xhdGVkLm1hcE5vcnRoID0gbm9ydGhcbiAgdHJhbnNsYXRlZC5tYXBFYXN0ID0gZWFzdFxuICB0cmFuc2xhdGVkLm1hcFNvdXRoID0gc291dGhcbiAgdHJhbnNsYXRlZC5tYXBXZXN0ID0gd2VzdFxuXG4gIHRyYW5zbGF0ZWQubm9ydGggPSBub3J0aFxuICB0cmFuc2xhdGVkLmVhc3QgPSBlYXN0XG4gIHRyYW5zbGF0ZWQuc291dGggPSBzb3V0aFxuICB0cmFuc2xhdGVkLndlc3QgPSB3ZXN0XG5cbiAgcmV0dXJuIHRyYW5zbGF0ZWRcbn1cblxuY29uc3QgdHJhbnNsYXRlUG9pbnQgPSAoXG4gIGxvbjogbnVtYmVyLFxuICBsYXQ6IG51bWJlcixcbiAgdHJhbnNsYXRpb246IFRyYW5zbGF0aW9uXG4pOiB7IGxvbjogbnVtYmVyOyBsYXQ6IG51bWJlciB9ID0+IHtcbiAgbGV0IFt1cGRhdGVkTG9uLCB1cGRhdGVkTGF0XSA9IHRyYW5zbGF0ZUNvb3JkaW5hdGVzKGxvbiwgbGF0LCB0cmFuc2xhdGlvbilcbiAgY29uc3Qgbm9ydGhQb2xlID0gODkuOTlcbiAgY29uc3Qgc291dGhQb2xlID0gLTg5Ljk5XG5cbiAgaWYgKHVwZGF0ZWRMYXQgPiBub3J0aFBvbGUpIHtcbiAgICB1cGRhdGVkTGF0ID0gbm9ydGhQb2xlXG4gIH0gZWxzZSBpZiAodXBkYXRlZExhdCA8IHNvdXRoUG9sZSkge1xuICAgIHVwZGF0ZWRMYXQgPSBzb3V0aFBvbGVcbiAgfVxuICByZXR1cm4geyBsb246IHVwZGF0ZWRMb24sIGxhdDogdXBkYXRlZExhdCB9XG59XG5cbmNvbnN0IHRyYW5zbGF0ZUNvb3JkaW5hdGVzID0gKFxuICBsb25naXR1ZGU6IG51bWJlcixcbiAgbGF0aXR1ZGU6IG51bWJlcixcbiAgdHJhbnNsYXRpb246IFRyYW5zbGF0aW9uXG4pOiBMb25MYXQgPT4ge1xuICBsZXQgdHJhbnNsYXRlZExvbiA9IGxvbmdpdHVkZSArIHRyYW5zbGF0aW9uLmxvbmdpdHVkZVxuICBsZXQgdHJhbnNsYXRlZExhdCA9IGxhdGl0dWRlICsgdHJhbnNsYXRpb24ubGF0aXR1ZGVcblxuICAvLyBub3JtYWxpemUgbG9uZ2l0dWRlXG4gIGlmICh0cmFuc2xhdGVkTG9uID4gMTgwKSB7XG4gICAgdHJhbnNsYXRlZExvbiAtPSAzNjBcbiAgfVxuICBpZiAodHJhbnNsYXRlZExvbiA8IC0xODApIHtcbiAgICB0cmFuc2xhdGVkTG9uICs9IDM2MFxuICB9XG5cbiAgcmV0dXJuIFt0cmFuc2xhdGVkTG9uLCB0cmFuc2xhdGVkTGF0XVxufVxuXG5jb25zdCB1c2VNYXBMaXN0ZW5lcnMgPSAoe1xuICBtYXAsXG4gIG1hcE1vZGVsLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIG1hcDogYW55XG4gIG1hcE1vZGVsOiBhbnlcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbn0pID0+IHtcbiAgY29uc3QgW2lzSG92ZXJpbmdSZXN1bHQsIHNldElzSG92ZXJpbmdSZXN1bHRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtob3Zlckdlbywgc2V0SG92ZXJHZW9dID0gUmVhY3QudXNlU3RhdGU8SG92ZXJHZW8+KHt9KVxuICBjb25zdCB7XG4gICAgbW92ZUZyb20sXG4gICAgc2V0TW92ZUZyb20sXG4gICAgaW50ZXJhY3RpdmVHZW8sXG4gICAgc2V0SW50ZXJhY3RpdmVHZW8sXG4gICAgaW50ZXJhY3RpdmVNb2RlbHMsXG4gICAgc2V0SW50ZXJhY3RpdmVNb2RlbHMsXG4gICAgdHJhbnNsYXRpb24sXG4gICAgc2V0VHJhbnNsYXRpb24sXG4gIH0gPSBSZWFjdC51c2VDb250ZXh0KEludGVyYWN0aW9uc0NvbnRleHQpXG5cbiAgY29uc3QgYWRkU25hY2sgPSB1c2VTbmFjaygpXG5cbiAgY29uc3QgdXBDYWxsYmFja1JlZiA9IFJlYWN0LnVzZVJlZjwoKCkgPT4gdm9pZCkgfCBudWxsPihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdXBDYWxsYmFja1JlZi5jdXJyZW50ID0gKCkgPT4ge1xuICAgICAgaWYgKGludGVyYWN0aXZlTW9kZWxzLmxlbmd0aCA+IDAgJiYgdHJhbnNsYXRpb24pIHtcbiAgICAgICAgY29uc3QgdW5kb0ZuczogKCgpID0+IHt9KVtdID0gW11cbiAgICAgICAgZm9yIChjb25zdCBtb2RlbCBvZiBpbnRlcmFjdGl2ZU1vZGVscykge1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTG9jYXRpb24gPSBnZXRMb2NhdGlvbihtb2RlbClcbiAgICAgICAgICBjb25zdCBuZXdMb2NhdGlvbiA9IGdldExvY2F0aW9uKG1vZGVsLCB0cmFuc2xhdGlvbilcbiAgICAgICAgICBtb2RlbC5zZXQobmV3TG9jYXRpb24pXG4gICAgICAgICAgdW5kb0Zucy5wdXNoKCgpID0+IG1vZGVsLnNldChvcmlnaW5hbExvY2F0aW9uKSlcbiAgICAgICAgfVxuICAgICAgICBhZGRTbmFjayhcbiAgICAgICAgICAnTG9jYXRpb24gdXBkYXRlZC4gWW91IG1heSBzdGlsbCBuZWVkIHRvIHNhdmUgdGhlIGl0ZW0gdGhhdCB1c2VzIGl0LicsXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6IGAke2ludGVyYWN0aXZlR2VvfS5tb3ZlYCxcbiAgICAgICAgICAgIHVuZG86ICgpID0+IHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCB1bmRvRm4gb2YgdW5kb0Zucykge1xuICAgICAgICAgICAgICAgIHVuZG9GbigpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICB9XG4gICAgICBzZXRNb3ZlRnJvbShudWxsKVxuICAgICAgc2V0VHJhbnNsYXRpb24obnVsbClcbiAgICB9XG4gIH0sIFtpbnRlcmFjdGl2ZU1vZGVscywgdHJhbnNsYXRpb25dKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGludGVyYWN0aXZlR2VvKSB7XG4gICAgICAvLyBUaGlzIGhhbmRsZXIgbWlnaHQgZGlzYWJsZSBkcmFnZ2luZyB0byBtb3ZlIHRoZSBtYXAsIHNvIG9ubHkgc2V0IGl0IHVwXG4gICAgICAvLyB3aGVuIHRoZSB1c2VyIGhhcyBzdGFydGVkIGludGVyYWN0aW5nIHdpdGggYSBnZW8uXG4gICAgICBtYXAub25Nb3VzZVRyYWNraW5nRm9yR2VvRHJhZyh7XG4gICAgICAgIG1vdmVGcm9tLFxuICAgICAgICBkb3duOiAoe1xuICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgIG1hcExvY2F0aW9uSWQsXG4gICAgICAgIH06IHtcbiAgICAgICAgICBwb3NpdGlvbjogYW55XG4gICAgICAgICAgbWFwTG9jYXRpb25JZDogbnVtYmVyXG4gICAgICAgIH0pID0+IHtcbiAgICAgICAgICBpZiAobWFwTG9jYXRpb25JZCA9PT0gaW50ZXJhY3RpdmVHZW8gJiYgIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICAgICAgIHNldE1vdmVGcm9tKHBvc2l0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbW92ZTogKHtcbiAgICAgICAgICB0cmFuc2xhdGlvbixcbiAgICAgICAgICBtYXBMb2NhdGlvbklkLFxuICAgICAgICB9OiB7XG4gICAgICAgICAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxuICAgICAgICAgIG1hcExvY2F0aW9uSWQ6IG51bWJlclxuICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgaWYgKG1hcExvY2F0aW9uSWQgPT09IGludGVyYWN0aXZlR2VvKSB7XG4gICAgICAgICAgICBzZXRIb3Zlckdlbyh7XG4gICAgICAgICAgICAgIGlkOiBtYXBMb2NhdGlvbklkLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0SG92ZXJHZW8oe30pXG4gICAgICAgICAgfVxuICAgICAgICAgIHNldFRyYW5zbGF0aW9uKHRyYW5zbGF0aW9uID8/IG51bGwpXG4gICAgICAgIH0sXG4gICAgICAgIHVwOiAoKSA9PiB1cENhbGxiYWNrUmVmLmN1cnJlbnQ/LigpLFxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IG1hcD8uY2xlYXJNb3VzZVRyYWNraW5nRm9yR2VvRHJhZygpXG4gIH0sIFttYXAsIGludGVyYWN0aXZlR2VvLCBtb3ZlRnJvbV0pXG5cbiAgY29uc3QgaGFuZGxlS2V5ZG93biA9IFJlYWN0LnVzZUNhbGxiYWNrKChlOiBhbnkpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICBzZXRJbnRlcmFjdGl2ZUdlbyhudWxsKVxuICAgICAgc2V0SW50ZXJhY3RpdmVNb2RlbHMoW10pXG4gICAgICBzZXRNb3ZlRnJvbShudWxsKVxuICAgICAgc2V0VHJhbnNsYXRpb24obnVsbClcbiAgICB9XG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGludGVyYWN0aXZlR2VvKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUtleWRvd24pXG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5ZG93bilcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5ZG93bilcbiAgfSwgW2ludGVyYWN0aXZlR2VvXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXAgJiYgIW1vdmVGcm9tKSB7XG4gICAgICBjb25zdCBoYW5kbGVMZWZ0Q2xpY2sgPSAobWFwTG9jYXRpb25JZD86IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAobWFwTG9jYXRpb25JZCAmJiAhaW50ZXJhY3RpdmVHZW8gJiYgIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICAgICBzZXRJbnRlcmFjdGl2ZUdlbyhtYXBMb2NhdGlvbklkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldEludGVyYWN0aXZlR2VvKG51bGwpXG4gICAgICAgICAgc2V0SW50ZXJhY3RpdmVNb2RlbHMoW10pXG4gICAgICAgICAgc2V0TW92ZUZyb20obnVsbClcbiAgICAgICAgICBzZXRUcmFuc2xhdGlvbihudWxsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBtYXAub25MZWZ0Q2xpY2tNYXBBUEkoaGFuZGxlTGVmdENsaWNrKVxuICAgIH1cbiAgICBpZiAobWFwICYmICFpbnRlcmFjdGl2ZUdlbykge1xuICAgICAgaWYgKCFEcmF3aW5nLmlzRHJhd2luZygpKSB7XG4gICAgICAgIC8vIENsaWNrcyB1c2VkIGluIGRyYXdpbmcgb24gdGhlIDNEIG1hcCwgc28gbGV0J3MgaWdub3JlIHRoZW0gaGVyZVxuICAgICAgICAvLyB3aGlsZSBkcmF3aW5nLlxuICAgICAgICBtYXAub25Eb3VibGVDbGljaygpXG4gICAgICAgIG1hcC5vblJpZ2h0Q2xpY2soKGV2ZW50OiBhbnksIF9tYXBFdmVudDogYW55KSA9PiB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIG1hcE1vZGVsLnNldCh7XG4gICAgICAgICAgICBtb3VzZVg6IGV2ZW50Lm9mZnNldFgsXG4gICAgICAgICAgICBtb3VzZVk6IGV2ZW50Lm9mZnNldFksXG4gICAgICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgbWFwTW9kZWwudXBkYXRlQ2xpY2tDb29yZGluYXRlcygpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmIChtYXBNb2RlbCkge1xuICAgICAgICBtYXAub25Nb3VzZU1vdmUoKF9ldmVudDogYW55LCBtYXBFdmVudDogYW55KSA9PiB7XG4gICAgICAgICAgaGFuZGxlTWFwSG92ZXIoe1xuICAgICAgICAgICAgbWFwLFxuICAgICAgICAgICAgbWFwRXZlbnQsXG4gICAgICAgICAgICBtYXBNb2RlbCxcbiAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgICAgICAgICAgIHNldElzSG92ZXJpbmdSZXN1bHQsXG4gICAgICAgICAgICBzZXRIb3ZlckdlbyxcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbWFwPy5jbGVhck1vdXNlTW92ZSgpXG4gICAgICBtYXA/LmNsZWFyRG91YmxlQ2xpY2soKVxuICAgICAgbWFwPy5jbGVhclJpZ2h0Q2xpY2soKVxuICAgICAgbWFwPy5jbGVhckxlZnRDbGlja01hcEFQSSgpXG4gICAgfVxuICB9LCBbbWFwLCBtYXBNb2RlbCwgc2VsZWN0aW9uSW50ZXJmYWNlLCBpbnRlcmFjdGl2ZUdlbywgbW92ZUZyb21dKVxuICByZXR1cm4ge1xuICAgIGlzSG92ZXJpbmdSZXN1bHQsXG4gICAgaG92ZXJHZW8sXG4gICAgaW50ZXJhY3RpdmVHZW8sXG4gICAgc2V0SW50ZXJhY3RpdmVHZW8sXG4gICAgbW92ZUZyb20sXG4gIH1cbn1cbmNvbnN0IHVzZU9uTW91c2VMZWF2ZSA9ICh7XG4gIG1hcEVsZW1lbnQsXG4gIG1hcE1vZGVsLFxufToge1xuICBtYXBFbGVtZW50OiBhbnlcbiAgbWFwTW9kZWw6IGFueVxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXBFbGVtZW50ICYmIG1hcE1vZGVsKSB7XG4gICAgICBtYXBFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICAgIG1hcE1vZGVsLmNsZWFyTW91c2VDb29yZGluYXRlcygpXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW21hcEVsZW1lbnQsIG1hcE1vZGVsXSlcbn1cbmNvbnN0IHVzZUxpc3RlblRvRHJhd2luZyA9ICgpID0+IHtcbiAgY29uc3QgW2lzRHJhd2luZywgc2V0SXNEcmF3aW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICB1c2VMaXN0ZW5UbyhEcmF3aW5nLCAnY2hhbmdlOmRyYXdpbmcnLCAoKSA9PiB7XG4gICAgc2V0SXNEcmF3aW5nKERyYXdpbmcuaXNEcmF3aW5nKCkpXG4gIH0pXG4gIHJldHVybiBpc0RyYXdpbmdcbn1cbnR5cGUgTWFwVmlld1JlYWN0VHlwZSA9IHtcbiAgc2V0TWFwOiAobWFwOiBhbnkpID0+IHZvaWRcbiAgLypcbiAgICAgIE1hcCBjcmVhdGlvbiBpcyBkZWZlcnJlZCB0byB0aGlzIG1ldGhvZCwgc28gdGhhdCBhbGwgcmVzb3VyY2VzIHBlcnRhaW5pbmcgdG8gdGhlIG1hcCBjYW4gYmUgbG9hZGVkIGxhemlseSBhbmRcbiAgICAgIG5vdCBiZSBpbmNsdWRlZCBpbiB0aGUgaW5pdGlhbCBwYWdlIHBheWxvYWQuXG4gICAgICBCZWNhdXNlIG9mIHRoaXMsIG1ha2Ugc3VyZSB0byByZXR1cm4gYSBkZWZlcnJlZCB0aGF0IHdpbGwgcmVzb2x2ZSB3aGVuIHlvdXIgcmVzcGVjdGl2ZSBtYXAgaW1wbGVtZW50YXRpb25cbiAgICAgIGlzIGZpbmlzaGVkIGxvYWRpbmcgLyBzdGFydGluZyB1cC5cbiAgICAgIEFsc28sIG1ha2Ugc3VyZSB5b3UgcmVzb2x2ZSB0aGF0IGRlZmVycmVkIGJ5IHBhc3NpbmcgdGhlIHJlZmVyZW5jZSB0byB0aGUgbWFwIGltcGxlbWVudGF0aW9uLlxuICAgICovXG4gIGxvYWRNYXA6ICgpID0+IGFueVxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxuICBtYXBMYXllcnM6IGFueVxufVxuY29uc3QgdXNlQ2hhbmdlQ3Vyc29yT25Ib3ZlciA9ICh7XG4gIG1hcEVsZW1lbnQsXG4gIGlzSG92ZXJpbmdSZXN1bHQsXG4gIGhvdmVyR2VvLFxuICBpbnRlcmFjdGl2ZUdlbyxcbiAgbW92ZUZyb20sXG4gIGlzRHJhd2luZyxcbn06IHtcbiAgbWFwRWxlbWVudDogSFRNTERpdkVsZW1lbnQgfCBudWxsXG4gIGlzSG92ZXJpbmdSZXN1bHQ6IGJvb2xlYW5cbiAgaG92ZXJHZW86IEhvdmVyR2VvXG4gIGludGVyYWN0aXZlR2VvOiBudW1iZXIgfCBudWxsXG4gIG1vdmVGcm9tOiBDZXNpdW0uQ2FydGVzaWFuMyB8IG51bGxcbiAgaXNEcmF3aW5nOiBib29sZWFuXG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcEVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGNhbnZhcyA9IG1hcEVsZW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJylcblxuICAgICAgaWYgKGNhbnZhcyAmJiAhaXNEcmF3aW5nKSB7XG4gICAgICAgIGlmIChpbnRlcmFjdGl2ZUdlbykge1xuICAgICAgICAgIC8vIElmIHRoZSB1c2VyIGlzIGluICdpbnRlcmFjdGl2ZSBtb2RlJyB3aXRoIGEgZ2VvLCBvbmx5IHNob3cgYSBzcGVjaWFsIGN1cnNvclxuICAgICAgICAgIC8vIHdoZW4gaG92ZXJpbmcgb3ZlciB0aGF0IGdlby5cbiAgICAgICAgICBpZiAoaG92ZXJHZW8uaWQgPT09IGludGVyYWN0aXZlR2VvKSB7XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUuY3Vyc29yID0gbW92ZUZyb20gPyAnZ3JhYmJpbmcnIDogJ2dyYWInXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbnZhcy5zdHlsZS5jdXJzb3IgPSAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChob3Zlckdlby5pbnRlcmFjdGl2ZSB8fCBpc0hvdmVyaW5nUmVzdWx0KSB7XG4gICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJ1xuICAgICAgICB9IGVsc2UgaWYgKGhvdmVyR2VvLmludGVyYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgICAgIGNhbnZhcy5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FudmFzLnN0eWxlLmN1cnNvciA9ICcnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIFttYXBFbGVtZW50LCBpc0hvdmVyaW5nUmVzdWx0LCBob3ZlckdlbywgaW50ZXJhY3RpdmVHZW8sIG1vdmVGcm9tXSlcbn1cbmNvbnN0IHVzZUNoYW5nZUN1cnNvck9uRHJhd2luZyA9ICh7XG4gIG1hcEVsZW1lbnQsXG4gIGlzRHJhd2luZyxcbn06IHtcbiAgbWFwRWxlbWVudDogSFRNTERpdkVsZW1lbnQgfCBudWxsXG4gIGlzRHJhd2luZzogYm9vbGVhblxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXBFbGVtZW50KSB7XG4gICAgICBjb25zdCBjYW52YXMgPSBtYXBFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpXG4gICAgICBpZiAoY2FudmFzKSB7XG4gICAgICAgIGlmIChpc0RyYXdpbmcpIHtcbiAgICAgICAgICBjYW52YXMuc3R5bGUuY3Vyc29yID0gJ2Nyb3NzaGFpcidcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYW52YXMuc3R5bGUuY3Vyc29yID0gJydcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21hcEVsZW1lbnQsIGlzRHJhd2luZ10pXG59XG5leHBvcnQgY29uc3QgTWFwVmlld1JlYWN0ID0gKHByb3BzOiBNYXBWaWV3UmVhY3RUeXBlKSA9PiB7XG4gIGNvbnN0IFtpc0NsdXN0ZXJpbmcsIHNldElzQ2x1c3RlcmluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgbWFwTW9kZWwgPSB1c2VNYXBNb2RlbCgpXG4gIGNvbnN0IFttYXBEcmF3aW5nUG9wdXBFbGVtZW50LCBzZXRNYXBEcmF3aW5nUG9wdXBFbGVtZW50XSA9XG4gICAgUmVhY3QudXNlU3RhdGU8SFRNTERpdkVsZW1lbnQgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29udGFpbmVyRWxlbWVudCwgc2V0Q29udGFpbmVyRWxlbWVudF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW21hcEVsZW1lbnQsIHNldE1hcEVsZW1lbnRdID0gUmVhY3QudXNlU3RhdGU8SFRNTERpdkVsZW1lbnQgfCBudWxsPihcbiAgICBudWxsXG4gIClcbiAgY29uc3QgbWFwID0gdXNlTWFwKHtcbiAgICAuLi5wcm9wcyxcbiAgICBtYXBFbGVtZW50LFxuICAgIG1hcE1vZGVsLFxuICAgIGNvbnRhaW5lckVsZW1lbnQsXG4gICAgbWFwRHJhd2luZ1BvcHVwRWxlbWVudCxcbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBwcm9wcy5zZXRNYXAobWFwKSAvLyBhbGxvdyBvdXRzaWRlIGFjY2VzcyB0byBtYXBcbiAgfSwgW21hcF0pXG4gIHVzZVdyZXFyTWFwTGlzdGVuZXJzKHsgbWFwIH0pXG4gIHVzZVNlbGVjdGlvbkludGVyZmFjZU1hcExpc3RlbmVycyh7XG4gICAgbWFwLFxuICAgIHNlbGVjdGlvbkludGVyZmFjZTogcHJvcHMuc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuICBjb25zdCB7IGlzSG92ZXJpbmdSZXN1bHQsIGhvdmVyR2VvLCBpbnRlcmFjdGl2ZUdlbywgbW92ZUZyb20gfSA9XG4gICAgdXNlTWFwTGlzdGVuZXJzKHtcbiAgICAgIG1hcCxcbiAgICAgIG1hcE1vZGVsLFxuICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlOiBwcm9wcy5zZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgfSlcbiAgdXNlT25Nb3VzZUxlYXZlKHsgbWFwRWxlbWVudCwgbWFwTW9kZWwgfSlcbiAgY29uc3QgaXNEcmF3aW5nID0gdXNlTGlzdGVuVG9EcmF3aW5nKClcbiAgdXNlQ2hhbmdlQ3Vyc29yT25EcmF3aW5nKHsgbWFwRWxlbWVudCwgaXNEcmF3aW5nIH0pXG4gIHVzZUNoYW5nZUN1cnNvck9uSG92ZXIoe1xuICAgIGlzSG92ZXJpbmdSZXN1bHQsXG4gICAgaG92ZXJHZW8sXG4gICAgaW50ZXJhY3RpdmVHZW8sXG4gICAgbW92ZUZyb20sXG4gICAgaXNEcmF3aW5nLFxuICAgIG1hcEVsZW1lbnQsXG4gIH0pXG4gIGNvbnN0IGFkZFNuYWNrID0gdXNlU25hY2soKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17c2V0Q29udGFpbmVyRWxlbWVudH1cbiAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBoLWZ1bGwgYmctaW5oZXJpdCByZWxhdGl2ZSBwLTJgfVxuICAgID5cbiAgICAgIHshbWFwID8gKFxuICAgICAgICA8PlxuICAgICAgICAgIDxMaW5lYXJQcm9ncmVzc1xuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgbGVmdC0wIHctZnVsbCBoLTIgdHJhbnNmb3JtIC10cmFuc2xhdGUteS0xLzJcIlxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgdG9wOiAnNTAlJyxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC8+XG4gICAgICApIDogKFxuICAgICAgICA8PjwvPlxuICAgICAgKX1cbiAgICAgIDxkaXYgaWQ9XCJtYXBEcmF3aW5nUG9wdXBcIiByZWY9e3NldE1hcERyYXdpbmdQb3B1cEVsZW1lbnR9PjwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXAtY29udGV4dC1tZW51XCI+PC9kaXY+XG4gICAgICA8ZGl2IGlkPVwibWFwVG9vbHNcIj5cbiAgICAgICAge21hcCA/IChcbiAgICAgICAgICA8R2VvbWV0cmllc1xuICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlPXtwcm9wcy5zZWxlY3Rpb25JbnRlcmZhY2V9XG4gICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgIGlzQ2x1c3RlcmluZz17aXNDbHVzdGVyaW5nfVxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7bWFwID8gKFxuICAgICAgICAgIDxNYXBUb29sYmFyXG4gICAgICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgICAgIG1hcExheWVycz17cHJvcHMubWFwTGF5ZXJzfVxuICAgICAgICAgICAgem9vbVRvSG9tZT17KCkgPT4ge1xuICAgICAgICAgICAgICB6b29tVG9Ib21lKHsgbWFwIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgc2F2ZUFzSG9tZT17KCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IG1hcC5nZXRCb3VuZGluZ0JveCgpXG4gICAgICAgICAgICAgIGNvbnN0IHVzZXJQcmVmZXJlbmNlcyA9IHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpXG4gICAgICAgICAgICAgIHVzZXJQcmVmZXJlbmNlcy5zZXQoJ21hcEhvbWUnLCBib3VuZGluZ0JveClcbiAgICAgICAgICAgICAgYWRkU25hY2soJ1N1Y2Nlc3MhIE5ldyBtYXAgaG9tZSBsb2NhdGlvbiBzZXQuJywge1xuICAgICAgICAgICAgICAgIGFsZXJ0UHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgIHNldmVyaXR5OiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBpc0NsdXN0ZXJpbmc9e2lzQ2x1c3RlcmluZ31cbiAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXJpbmc9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0SXNDbHVzdGVyaW5nKCFpc0NsdXN0ZXJpbmcpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7bWFwID8gKFxuICAgICAgICAgIDw+XG4gICAgICAgICAgICA8UGFwZXJcbiAgICAgICAgICAgICAgZWxldmF0aW9uPXtFbGV2YXRpb25zLm92ZXJsYXlzfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwLTIgei0xMCBhYnNvbHV0ZSByaWdodC0wIGJvdHRvbS0wIG1yLTQgbWItNFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnpvb21JbigpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxQbHVzSWNvbiBjbGFzc05hbWU9XCIgIGgtNSB3LTVcIiAvPlxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBtYXAuem9vbU91dCgpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxNaW51c0ljb24gY2xhc3NOYW1lPVwiICBoLTUgdy01XCIgLz5cbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdlxuICAgICAgICBkYXRhLWlkPVwibWFwLWNvbnRhaW5lclwiXG4gICAgICAgIGlkPVwibWFwQ29udGFpbmVyXCJcbiAgICAgICAgY2xhc3NOYW1lPVwiaC1mdWxsXCJcbiAgICAgICAgcmVmPXtzZXRNYXBFbGVtZW50fVxuICAgICAgPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXBJbmZvXCI+XG4gICAgICAgIHttYXBNb2RlbCA/IDxNYXBJbmZvIG1hcD17bWFwTW9kZWx9IC8+IDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwb3B1cFByZXZpZXdcIj5cbiAgICAgICAge21hcCAmJiBtYXBNb2RlbCAmJiBwcm9wcy5zZWxlY3Rpb25JbnRlcmZhY2UgPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxQb3B1cFByZXZpZXdcbiAgICAgICAgICAgICAgbWFwPXttYXB9XG4gICAgICAgICAgICAgIG1hcE1vZGVsPXttYXBNb2RlbH1cbiAgICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlPXtwcm9wcy5zZWxlY3Rpb25JbnRlcmZhY2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAge21hcE1vZGVsID8gPE1hcENvbnRleHREcm9wZG93biBtYXBNb2RlbD17bWFwTW9kZWx9IC8+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIl19