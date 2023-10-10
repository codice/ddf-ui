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
import { SHAPE_ID_PREFIX } from './drawing-and-display';
import useSnack from '../../hooks/useSnack';
import { zoomToHome } from './home';
import featureDetection from '../../singletons/feature-detection';
import Paper from '@mui/material/Paper';
import { Elevations } from '../../theme/theme';
import Button from '@mui/material/Button';
import PlusIcon from '@mui/icons-material/Add';
import MinusIcon from '@mui/icons-material/Remove';
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
                setMap(mapCode.createMap(props.mapElement, props.selectionInterface, props.mapDrawingPopupElement, props.containerElement, props.mapModel));
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
    var mapModel = _a.mapModel, selectionInterface = _a.selectionInterface, mapEvent = _a.mapEvent, setIsHovering = _a.setIsHovering;
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
    setIsHovering(Boolean(mapEvent.mapTarget &&
        mapEvent.mapTarget !== 'userDrawing' &&
        (mapEvent.mapTarget.constructor === Array ||
            (mapEvent.mapTarget.constructor === String &&
                !mapEvent.mapTarget.startsWith(SHAPE_ID_PREFIX)))));
};
var useMapListeners = function (_a) {
    var map = _a.map, mapModel = _a.mapModel, selectionInterface = _a.selectionInterface;
    var _b = __read(React.useState(false), 2), isHovering = _b[0], setIsHovering = _b[1];
    React.useEffect(function () {
        if (map && mapModel && selectionInterface) {
            map.onMouseMove(function (_event, mapEvent) {
                handleMapHover({
                    map: map,
                    mapEvent: mapEvent,
                    mapModel: mapModel,
                    selectionInterface: selectionInterface,
                    setIsHovering: setIsHovering,
                });
            });
            map.onRightClick(function (event, _mapEvent) {
                // Right click is used in drawing on the 3D map, so let's ignore it here
                // while drawing.
                if (!Drawing.isDrawing()) {
                    event.preventDefault();
                    mapModel.set({
                        mouseX: event.offsetX,
                        mouseY: event.offsetY,
                        open: true,
                    });
                    mapModel.updateClickCoordinates();
                    updateDistance({ map: map, mapModel: mapModel, updateOnMenu: true });
                }
            });
        }
    }, [map, mapModel, selectionInterface]);
    return {
        isHovering: isHovering,
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
    var mapElement = _a.mapElement, isHovering = _a.isHovering;
    React.useEffect(function () {
        if (mapElement) {
            var canvas = mapElement.querySelector('canvas');
            if (canvas) {
                if (isHovering) {
                    canvas.classList.add('cursor-pointer');
                }
                else {
                    canvas.classList.remove('cursor-pointer');
                }
            }
        }
    }, [mapElement, isHovering]);
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
    var isHovering = useMapListeners({
        map: map,
        mapModel: mapModel,
        selectionInterface: props.selectionInterface,
    }).isHovering;
    useOnMouseLeave({ mapElement: mapElement, mapModel: mapModel });
    useChangeCursorOnHover({ isHovering: isHovering, mapElement: mapElement });
    var isDrawing = useListenToDrawing();
    useChangeCursorOnDrawing({ mapElement: mapElement, isDrawing: isDrawing });
    var addSnack = useSnack();
    return (React.createElement("div", { ref: setContainerElement, className: "w-full h-full bg-inherit relative p-2" },
        !map ? (React.createElement(React.Fragment, null,
            React.createElement(LinearProgress, { className: "absolute left-0 w-full h-2 transform -translate-y-1/2", style: {
                    top: '50%',
                } }))) : (React.createElement(React.Fragment, null)),
        React.createElement("div", { id: "mapDrawingPopup", ref: setMapDrawingPopupElement }),
        React.createElement("div", { className: "map-context-menu" }),
        React.createElement("div", { id: "mapTools" },
            map ? (React.createElement(Geometries, { selectionInterface: props.selectionInterface, map: map, zoomToHome: zoomToHome, isClustering: isClustering })) : null,
            map ? (React.createElement(MapToolbar, { map: map, zoomToHome: function () {
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