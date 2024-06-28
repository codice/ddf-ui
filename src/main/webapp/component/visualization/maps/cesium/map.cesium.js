import { __assign, __rest } from "tslib";
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
import $ from 'jquery';
import _ from 'underscore';
import utility from './utility';
import DrawingUtility from '../DrawingUtility';
import wreqr from '../../../../js/wreqr';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium';
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper';
import { CesiumImageryProviderTypes, CesiumLayers, } from '../../../../js/controllers/cesium.layers';
import { Drawing } from '../../../singletons/drawing';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
var defaultColor = '#3c6dd5';
var eyeOffset = new Cesium.Cartesian3(0, 0, 0);
var pixelOffset = new Cesium.Cartesian2(0.0, 0);
var rulerColor = new Cesium.Color(0.31, 0.43, 0.52);
var rulerPointColor = '#506f85';
var rulerLineHeight = 0;
Cesium.BingMapsApi.defaultKey = StartupDataStore.Configuration.getBingKey() || 0;
var imageryProviderTypes = CesiumImageryProviderTypes;
function setupTerrainProvider(viewer, terrainProvider) {
    if (terrainProvider == null || terrainProvider === undefined) {
        console.info("Unknown terrain provider configuration.\n              Default Cesium terrain provider will be used.");
        return;
    }
    var type = terrainProvider.type, terrainConfig = __rest(terrainProvider, ["type"]);
    var TerrainProvider = imageryProviderTypes[type];
    if (TerrainProvider === undefined) {
        console.warn("\n            Unknown terrain provider type: ".concat(type, ".\n            Default Cesium terrain provider will be used.\n        "));
        return;
    }
    var defaultCesiumTerrainProvider = viewer.scene.terrainProvider;
    var customTerrainProvider = new TerrainProvider(terrainConfig);
    customTerrainProvider.errorEvent.addEventListener(function () {
        console.warn("\n            Issue using terrain provider: ".concat(JSON.stringify(__assign({ type: type }, terrainConfig)), "\n            Falling back to default Cesium terrain provider.\n        "));
        viewer.scene.terrainProvider = defaultCesiumTerrainProvider;
    });
    viewer.scene.terrainProvider = customTerrainProvider;
}
function createMap(insertionElement, mapLayers) {
    var layerCollectionController = new CesiumLayers({
        collection: mapLayers,
    });
    var viewer = layerCollectionController.makeMap({
        element: insertionElement,
        cesiumOptions: {
            sceneMode: Cesium.SceneMode.SCENE3D,
            creditContainer: document.createElement('div'),
            animation: false,
            fullscreenButton: false,
            timeline: false,
            geocoder: false,
            homeButton: false,
            navigationHelpButton: false,
            sceneModePicker: false,
            selectionIndicator: false,
            infoBox: false,
            //skyBox: false,
            //skyAtmosphere: false,
            baseLayerPicker: false,
            imageryProvider: false,
            mapMode2D: 0,
        },
    });
    var requestRender = function () {
        viewer.scene.requestRender();
    };
    wreqr.vent.on('map:requestRender', requestRender);
    // disable right click drag to zoom (context menu instead);
    viewer.scene.screenSpaceCameraController.zoomEventTypes = [
        Cesium.CameraEventType.WHEEL,
        Cesium.CameraEventType.PINCH,
    ];
    viewer.screenSpaceEventHandler.setInputAction(function () {
        if (!Drawing.isDrawing()) {
            $('body').mousedown();
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    viewer.screenSpaceEventHandler.setInputAction(function () {
        if (!Drawing.isDrawing()) {
            $('body').mousedown();
        }
    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
    setupTerrainProvider(viewer, StartupDataStore.Configuration.getTerrainProvider());
    return {
        map: viewer,
        requestRenderHandler: requestRender,
    };
}
function determineIdsFromPosition(position, map) {
    var _a;
    var id, locationId;
    var pickedObject = map.scene.pick(position);
    if (pickedObject) {
        id = pickedObject.id;
        if (id && id.constructor === Cesium.Entity) {
            id = id.resultId;
        }
        locationId = (_a = pickedObject.collection) === null || _a === void 0 ? void 0 : _a.locationId;
    }
    return { id: id, locationId: locationId };
}
function expandRectangle(rectangle) {
    var scalingFactor = 0.05;
    var widthGap = Math.abs(rectangle.east) - Math.abs(rectangle.west);
    var heightGap = Math.abs(rectangle.north) - Math.abs(rectangle.south);
    //ensure rectangle has some size
    if (widthGap === 0) {
        widthGap = 1;
    }
    if (heightGap === 0) {
        heightGap = 1;
    }
    rectangle.east = rectangle.east + Math.abs(scalingFactor * widthGap);
    rectangle.north = rectangle.north + Math.abs(scalingFactor * heightGap);
    rectangle.south = rectangle.south - Math.abs(scalingFactor * heightGap);
    rectangle.west = rectangle.west - Math.abs(scalingFactor * widthGap);
    return rectangle;
}
function getDestinationForVisiblePan(rectangle, map) {
    var destinationForZoom = expandRectangle(rectangle);
    if (map.scene.mode === Cesium.SceneMode.SCENE3D) {
        destinationForZoom =
            map.camera.getRectangleCameraCoordinates(destinationForZoom);
    }
    return destinationForZoom;
}
function determineCesiumColor(color) {
    return !_.isUndefined(color)
        ? Cesium.Color.fromCssColorString(color)
        : Cesium.Color.fromCssColorString(defaultColor);
}
function convertPointCoordinate(coordinate) {
    return {
        latitude: coordinate[1],
        longitude: coordinate[0],
        altitude: coordinate[2],
    };
}
function isNotVisible(cartesian3CenterOfGeometry, occluder) {
    return !occluder.isPointVisible(cartesian3CenterOfGeometry);
}
// https://cesium.com/learn/cesiumjs/ref-doc/Camera.html
export var LookingStraightDownOrientation = {
    heading: 0,
    pitch: -Cesium.Math.PI_OVER_TWO,
    roll: 0, // No roll - like a level from left to right
};
export default function CesiumMap(insertionElement, selectionInterface, _notificationEl, componentElement, mapModel, mapLayers) {
    var overlays = {};
    var shapes = [];
    var _a = createMap(insertionElement, mapLayers), map = _a.map, requestRenderHandler = _a.requestRenderHandler;
    var drawHelper = new DrawHelper(map);
    map.drawHelper = drawHelper;
    var billboardCollection = setupBillboardCollection();
    var labelCollection = setupLabelCollection();
    setupTooltip(map, selectionInterface);
    function updateCoordinatesTooltip(position) {
        var cartesian = map.camera.pickEllipsoid(position, map.scene.globe.ellipsoid);
        if (Cesium.defined(cartesian)) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            mapModel.updateMouseCoordinates({
                lat: cartographic.latitude * Cesium.Math.DEGREES_PER_RADIAN,
                lon: cartographic.longitude * Cesium.Math.DEGREES_PER_RADIAN,
            });
        }
        else {
            mapModel.clearMouseCoordinates();
        }
    }
    // @ts-expect-error ts-migrate(6133) FIXME: 'selectionInterface' is declared but its value is ... Remove this comment to see the full error message
    function setupTooltip(map, selectionInterface) {
        var handler = new Cesium.ScreenSpaceEventHandler(map.scene.canvas);
        handler.setInputAction(function (movement) {
            $(componentElement).removeClass('has-feature');
            if (map.scene.mode === Cesium.SceneMode.MORPHING) {
                return;
            }
            updateCoordinatesTooltip(movement.endPosition);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    function setupBillboardCollection() {
        var billboardCollection = new Cesium.BillboardCollection();
        map.scene.primitives.add(billboardCollection);
        return billboardCollection;
    }
    function setupLabelCollection() {
        var labelCollection = new Cesium.LabelCollection();
        map.scene.primitives.add(labelCollection);
        return labelCollection;
    }
    /*
     * Returns a visible label that is in the same location as the provided label (geometryInstance) if one exists.
     * If findSelected is true, the function will also check for hidden labels in the same location but are selected.
     */
    function findOverlappingLabel(findSelected, geometry) {
        return _.find(mapModel.get('labels'), function (label) {
            return label.position.x === geometry.position.x &&
                label.position.y === geometry.position.y &&
                ((findSelected && label.isSelected) || label.show);
        });
    }
    /*
          Only shows one label if there are multiple labels in the same location.
  
          Show the label in the following importance:
            - it is selected and the existing label is not
            - there is no other label displayed at the same location
            - it is the label that was found by findOverlappingLabel
  
          Arguments are:
            - the label to show/hide
            - if the label is selected
            - if the search for overlapping label should include hidden selected labels
          */
    function showHideLabel(_a) {
        var geometry = _a.geometry, _b = _a.findSelected, findSelected = _b === void 0 ? false : _b;
        var isSelected = geometry.isSelected;
        var labelWithSamePosition = findOverlappingLabel(findSelected, geometry);
        if (isSelected &&
            labelWithSamePosition &&
            !labelWithSamePosition.isSelected) {
            labelWithSamePosition.show = false;
        }
        var otherLabelNotSelected = labelWithSamePosition
            ? !labelWithSamePosition.isSelected
            : true;
        geometry.show =
            (isSelected && otherLabelNotSelected) ||
                !labelWithSamePosition ||
                geometry.id === labelWithSamePosition.id;
    }
    /*
          Shows a hidden label. Used when deleting a label that is shown.
          */
    function showHiddenLabel(geometry) {
        if (!geometry.show) {
            return;
        }
        var hiddenLabel = _.find(mapModel.get('labels'), function (label) {
            return label.position.x === geometry.position.x &&
                label.position.y === geometry.position.y &&
                label.id !== geometry.id &&
                !label.show;
        });
        if (hiddenLabel) {
            hiddenLabel.show = true;
        }
    }
    var minimumHeightAboveTerrain = 2;
    var exposedMethods = {
        onLeftClick: function (callback) {
            $(map.scene.canvas).on('click', function (e) {
                var boundingRect = map.scene.canvas.getBoundingClientRect();
                var id = determineIdsFromPosition({
                    x: e.clientX - boundingRect.left,
                    y: e.clientY - boundingRect.top,
                }, map).id;
                callback(e, { mapTarget: id });
            });
        },
        onLeftClickMapAPI: function (callback) {
            var lastClickTime = 0;
            var clickTimeout = 0;
            map.clickEventHandler = new Cesium.ScreenSpaceEventHandler(map.canvas);
            map.clickEventHandler.setInputAction(function (e) {
                // On a double-click, Cesium will fire 2 left-click events, too. We will only handle a
                // click if 1) another click did not happen in the last 250 ms, and 2) another click
                // does not happen in the next 250 ms.
                if (clickTimeout > 0) {
                    clearTimeout(clickTimeout);
                }
                var currentClickTime = Date.now();
                if (currentClickTime - lastClickTime > 250) {
                    clickTimeout = window.setTimeout(function () {
                        var locationId = determineIdsFromPosition(e.position, map).locationId;
                        callback(locationId);
                    }, 250);
                }
                lastClickTime = currentClickTime;
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        },
        clearLeftClickMapAPI: function () {
            var _a;
            (_a = map.clickEventHandler) === null || _a === void 0 ? void 0 : _a.destroy();
        },
        onRightClick: function (callback) {
            $(map.scene.canvas).on('contextmenu', function (e) {
                callback(e);
            });
        },
        clearRightClick: function () {
            $(map.scene.canvas).off('contextmenu');
        },
        onDoubleClick: function () {
            map.doubleClickEventHandler = new Cesium.ScreenSpaceEventHandler(map.canvas);
            map.doubleClickEventHandler.setInputAction(function (e) {
                var locationId = determineIdsFromPosition(e.position, map).locationId;
                if (locationId) {
                    ;
                    wreqr.vent.trigger('location:doubleClick', locationId);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        },
        clearDoubleClick: function () {
            var _a;
            (_a = map.doubleClickEventHandler) === null || _a === void 0 ? void 0 : _a.destroy();
        },
        onMouseTrackingForGeoDrag: function (_a) {
            var moveFrom = _a.moveFrom, down = _a.down, move = _a.move, up = _a.up;
            map.scene.screenSpaceCameraController.enableRotate = false;
            map.dragAndDropEventHandler = new Cesium.ScreenSpaceEventHandler(map.canvas);
            map.dragAndDropEventHandler.setInputAction(function (e) {
                var locationId = determineIdsFromPosition(e.position, map).locationId;
                var cartesian = map.scene.camera.pickEllipsoid(e.position, map.scene.globe.ellipsoid);
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian, map.scene.globe.ellipsoid);
                down({ position: cartographic, mapLocationId: locationId });
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
            map.dragAndDropEventHandler.setInputAction(function (e) {
                var locationId = determineIdsFromPosition(e.endPosition, map).locationId;
                var cartesian = map.scene.camera.pickEllipsoid(e.endPosition, map.scene.globe.ellipsoid);
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian, map.scene.globe.ellipsoid);
                var translation = moveFrom
                    ? {
                        longitude: Cesium.Math.toDegrees(cartographic.longitude - moveFrom.longitude),
                        latitude: Cesium.Math.toDegrees(cartographic.latitude - moveFrom.latitude),
                    }
                    : null;
                move({ translation: translation, mapLocationId: locationId });
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            map.dragAndDropEventHandler.setInputAction(up, Cesium.ScreenSpaceEventType.LEFT_UP);
        },
        clearMouseTrackingForGeoDrag: function () {
            var _a;
            map.scene.screenSpaceCameraController.enableRotate = true;
            (_a = map.dragAndDropEventHandler) === null || _a === void 0 ? void 0 : _a.destroy();
        },
        onMouseTrackingForPopup: function (downCallback, moveCallback, upCallback) {
            map.screenSpaceEventHandlerForPopupPreview =
                new Cesium.ScreenSpaceEventHandler(map.canvas);
            map.screenSpaceEventHandlerForPopupPreview.setInputAction(function () {
                downCallback();
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
            map.screenSpaceEventHandlerForPopupPreview.setInputAction(function () {
                moveCallback();
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.onLeftClick(upCallback);
        },
        onMouseMove: function (callback) {
            $(map.scene.canvas).on('mousemove', function (e) {
                var boundingRect = map.scene.canvas.getBoundingClientRect();
                var position = {
                    x: e.clientX - boundingRect.left,
                    y: e.clientY - boundingRect.top,
                };
                var _a = determineIdsFromPosition(position, map), id = _a.id, locationId = _a.locationId;
                callback(e, {
                    mapTarget: id,
                    mapLocationId: locationId,
                });
            });
        },
        clearMouseMove: function () {
            $(map.scene.canvas).off('mousemove');
        },
        timeoutIds: [],
        onCameraMoveStart: function (callback) {
            this.timeoutIds.forEach(function (timeoutId) {
                window.clearTimeout(timeoutId);
            });
            this.timeoutIds = [];
            map.scene.camera.moveStart.addEventListener(callback);
        },
        offCameraMoveStart: function (callback) {
            map.scene.camera.moveStart.removeEventListener(callback);
        },
        onCameraMoveEnd: function (callback) {
            var _this = this;
            var timeoutCallback = function () {
                _this.timeoutIds.push(window.setTimeout(function () {
                    callback();
                }, 300));
            };
            map.scene.camera.moveEnd.addEventListener(timeoutCallback);
        },
        offCameraMoveEnd: function (callback) {
            map.scene.camera.moveEnd.removeEventListener(callback);
        },
        doPanZoom: function (coords) {
            if (coords.length === 0) {
                return;
            }
            var cartArray = coords.map(function (coord) {
                return Cesium.Cartographic.fromDegrees(coord[0], coord[1], map.camera._positionCartographic.height);
            });
            if (cartArray.length === 1) {
                var point = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartArray[0]);
                this.panToCoordinate(point, 2.0);
            }
            else {
                var rectangle = Cesium.Rectangle.fromCartographicArray(cartArray);
                this.panToRectangle(rectangle, {
                    duration: 2.0,
                    correction: 1.0,
                });
            }
        },
        panToResults: function (results) {
            var rectangle, cartArray, point;
            cartArray = _.flatten(results
                .filter(function (result) { return result.hasGeometry(); })
                .map(function (result) {
                return _.map(result.getPoints('location'), function (coordinate) {
                    return Cesium.Cartographic.fromDegrees(coordinate[0], coordinate[1], map.camera._positionCartographic.height);
                });
            }, true));
            if (cartArray.length > 0) {
                if (cartArray.length === 1) {
                    point = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartArray[0]);
                    this.panToCoordinate(point);
                }
                else {
                    rectangle = Cesium.Rectangle.fromCartographicArray(cartArray);
                    this.panToRectangle(rectangle);
                }
            }
        },
        panToCoordinate: function (coords, duration) {
            if (duration === void 0) { duration = 0.5; }
            map.scene.camera.flyTo({
                duration: duration,
                destination: coords,
            });
        },
        panToExtent: function () { },
        panToShapesExtent: function (_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.duration, duration = _c === void 0 ? 500 : _c;
            var currentPrimitives = map.scene.primitives._primitives.filter(function (prim) { return prim.id; });
            var actualPositions = currentPrimitives.reduce(function (blob, prim) {
                return blob.concat(prim._polylines.reduce(function (subblob, polyline) {
                    return subblob.concat(polyline._actualPositions);
                }, []));
            }, []);
            if (actualPositions.length > 0) {
                map.scene.camera.flyTo({
                    duration: duration / 1000,
                    destination: Cesium.Rectangle.fromCartesianArray(actualPositions),
                    orientation: LookingStraightDownOrientation,
                });
                return true;
            }
            return false;
        },
        getCenterPositionOfPrimitiveIds: function (primitiveIds) {
            var primitives = map.scene.primitives;
            var positions = [];
            // Iterate over primitives and compute bounding spheres
            for (var i = 0; i < primitives.length; i++) {
                var primitive = primitives.get(i);
                if (primitiveIds.includes(primitive.id)) {
                    for (var j = 0; j < primitive.length; j++) {
                        var point = primitive.get(j);
                        positions = positions.concat(point.positions);
                    }
                }
            }
            var boundingSphere = Cesium.BoundingSphere.fromPoints(positions);
            if (Cesium.BoundingSphere.equals(boundingSphere, Cesium.BoundingSphere.fromPoints([]) // empty
            )) {
                throw new Error('No positions to zoom to');
            }
            // here, notice we use flyTo instead of flyToBoundingSphere, as with the latter the orientation can't be controlled in this version and ends up tilted
            // Calculate the position above the center of the bounding sphere
            var radius = boundingSphere.radius;
            var center = boundingSphere.center;
            var up = Cesium.Cartesian3.clone(center); // Get the up direction from the center of the Earth to the position
            Cesium.Cartesian3.normalize(up, up);
            var position = Cesium.Cartesian3.multiplyByScalar(up, radius * 2, new Cesium.Cartesian3()); // Adjust multiplier for desired altitude
            Cesium.Cartesian3.add(center, position, position); // Move position above the center
            return position;
        },
        zoomToIds: function (_a) {
            var ids = _a.ids, _b = _a.duration, duration = _b === void 0 ? 500 : _b;
            // use flyTo instead of flyToBoundingSphere, as with the latter the orientation can't be controlled in this version and it ends up tilted
            map.camera.flyTo({
                destination: this.getCenterPositionOfPrimitiveIds(ids),
                orientation: LookingStraightDownOrientation,
                duration: duration / 1000, // change to seconds
            });
        },
        panToRectangle: function (rectangle, opts) {
            if (opts === void 0) { opts = {
                duration: 0.5,
                correction: 0.25,
            }; }
            map.scene.camera.flyTo({
                duration: opts.duration,
                destination: getDestinationForVisiblePan(rectangle, map),
                complete: function () {
                    map.scene.camera.flyTo({
                        duration: opts.correction,
                        destination: getDestinationForVisiblePan(rectangle, map),
                    });
                },
            });
        },
        getShapes: function () {
            return shapes;
        },
        zoomToExtent: function () { },
        zoomToBoundingBox: function (_a) {
            var north = _a.north, south = _a.south, east = _a.east, west = _a.west;
            map.scene.camera.flyTo({
                duration: 0.5,
                destination: Cesium.Rectangle.fromDegrees(west, south, east, north),
            });
        },
        getBoundingBox: function () {
            var viewRectangle = map.scene.camera.computeViewRectangle();
            return _.mapObject(viewRectangle, function (val) { return Cesium.Math.toDegrees(val); });
        },
        overlayImage: function (model) {
            var metacardId = model.plain.id;
            this.removeOverlay(metacardId);
            var coords = model.getPoints('location');
            var cartographics = _.map(coords, function (coord) {
                coord = convertPointCoordinate(coord);
                return Cesium.Cartographic.fromDegrees(coord.longitude, coord.latitude, coord.altitude);
            });
            var rectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            var overlayLayer = map.scene.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
                url: model.currentOverlayUrl,
                rectangle: rectangle,
            }));
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            overlays[metacardId] = overlayLayer;
        },
        removeOverlay: function (metacardId) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (overlays[metacardId]) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                map.scene.imageryLayers.remove(overlays[metacardId]);
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                delete overlays[metacardId];
            }
        },
        removeAllOverlays: function () {
            for (var overlay in overlays) {
                if (overlays.hasOwnProperty(overlay)) {
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    map.scene.imageryLayers.remove(overlays[overlay]);
                }
            }
            overlays = {};
        },
        getCartographicCenterOfClusterInDegrees: function (cluster) {
            return utility.calculateCartographicCenterOfGeometriesInDegrees(cluster.results);
        },
        getWindowLocationsOfResults: function (results) {
            var occluder;
            if (map.scene.mode === Cesium.SceneMode.SCENE3D) {
                occluder = new Cesium.EllipsoidalOccluder(Cesium.Ellipsoid.WGS84, map.scene.camera.position);
            }
            return results.map(function (result) {
                var cartesian3CenterOfGeometry = utility.calculateCartesian3CenterOfGeometry(result);
                if (occluder && isNotVisible(cartesian3CenterOfGeometry, occluder)) {
                    return undefined;
                }
                var center = utility.calculateWindowCenterOfGeometry(cartesian3CenterOfGeometry, map);
                if (center) {
                    return [center.x, center.y];
                }
                else {
                    return undefined;
                }
            });
        },
        /*
         * Draws a marker on the map designating a start/end point for the ruler measurement. The given
         * coordinates should be an object with 'lat' and 'lon' keys with degrees values. The given
         * marker label should be a single character or digit that is displayed on the map marker.
         */
        addRulerPoint: function (coordinates) {
            var lat = coordinates.lat, lon = coordinates.lon;
            // a point requires an altitude value so just use 0
            var point = [lon, lat, 0];
            var options = {
                id: ' ',
                title: "Selected ruler coordinate",
                image: DrawingUtility.getCircle({
                    fillColor: rulerPointColor,
                    icon: null,
                }),
                view: this,
            };
            return this.addPoint(point, options);
        },
        /*
         * Removes the given Billboard from the map.
         */
        removeRulerPoint: function (billboardRef) {
            billboardCollection.remove(billboardRef);
            map.scene.requestRender();
        },
        /*
         * Draws a line on the map between the points in the given array of points.
         */
        addRulerLine: function (point) {
            var startingCoordinates = mapModel.get('startingCoordinates');
            // creates an array of Cartesian3 points
            // a PolylineGeometry allows the line to follow the curvature of the surface
            map.coordArray = [
                startingCoordinates['lon'],
                startingCoordinates['lat'],
                rulerLineHeight,
                point['lon'],
                point['lat'],
                rulerLineHeight,
            ];
            return map.entities.add({
                polyline: {
                    positions: new Cesium.CallbackProperty(function () {
                        return Cesium.Cartesian3.fromDegreesArrayHeights(map.coordArray);
                    }, false),
                    width: 5,
                    show: true,
                    material: rulerColor,
                },
            });
        },
        /*
         * Update the position of the ruler line
         */
        setRulerLine: function (point) {
            var startingCoordinates = mapModel.get('startingCoordinates');
            map.coordArray = [
                startingCoordinates['lon'],
                startingCoordinates['lat'],
                rulerLineHeight,
                point['lon'],
                point['lat'],
                rulerLineHeight,
            ];
            map.scene.requestRender();
        },
        /*
         * Removes the given polyline entity from the map.
         */
        removeRulerLine: function (polyline) {
            map.entities.remove(polyline);
            map.scene.requestRender();
        },
        /*
                    Adds a billboard point utilizing the passed in point and options.
                    Options are a view to relate to, and an id, and a color.
                  */
        addPointWithText: function (point, options) {
            var pointObject = convertPointCoordinate(point);
            var cartographicPosition = Cesium.Cartographic.fromDegrees(pointObject.longitude, pointObject.latitude, pointObject.altitude);
            var cartesianPosition = map.scene.globe.ellipsoid.cartographicToCartesian(cartographicPosition);
            var billboardRef = billboardCollection.add({
                image: undefined,
                position: cartesianPosition,
                id: options.id,
                eyeOffset: eyeOffset,
            });
            billboardRef.unselectedImage = DrawingUtility.getCircleWithText({
                fillColor: options.color,
                text: options.id.length,
                strokeColor: 'white',
                textColor: 'white',
                badgeOptions: options.badgeOptions,
            });
            billboardRef.partiallySelectedImage = DrawingUtility.getCircleWithText({
                fillColor: options.color,
                text: options.id.length,
                strokeColor: 'black',
                textColor: 'white',
                badgeOptions: options.badgeOptions,
            });
            billboardRef.selectedImage = DrawingUtility.getCircleWithText({
                fillColor: 'orange',
                text: options.id.length,
                strokeColor: 'white',
                textColor: 'white',
                badgeOptions: options.badgeOptions,
            });
            switch (options.isSelected) {
                case 'selected':
                    billboardRef.image = billboardRef.selectedImage;
                    break;
                case 'partially':
                    billboardRef.image = billboardRef.partiallySelectedImage;
                    break;
                case 'unselected':
                    billboardRef.image = billboardRef.unselectedImage;
                    break;
            }
            //if there is a terrain provider and no altitude has been specified, sample it from the configured terrain provider
            if (!pointObject.altitude && map.scene.terrainProvider) {
                var promise = Cesium.sampleTerrain(map.scene.terrainProvider, 5, [
                    cartographicPosition,
                ]);
                Cesium.when(promise, function (updatedCartographic) {
                    if (updatedCartographic[0].height && !options.view.isDestroyed) {
                        cartesianPosition =
                            map.scene.globe.ellipsoid.cartographicToCartesian(updatedCartographic[0]);
                        billboardRef.position = cartesianPosition;
                    }
                });
            }
            map.scene.requestRender();
            return billboardRef;
        },
        /*
                  Adds a billboard point utilizing the passed in point and options.
                  Options are a view to relate to, and an id, and a color.
                  */
        addPoint: function (point, options) {
            var pointObject = convertPointCoordinate(point);
            var cartographicPosition = Cesium.Cartographic.fromDegrees(pointObject.longitude, pointObject.latitude, pointObject.altitude);
            var cartesianPosition = map.scene.globe.ellipsoid.cartographicToCartesian(cartographicPosition);
            var billboardRef = billboardCollection.add({
                image: undefined,
                position: cartesianPosition,
                id: options.id,
                eyeOffset: eyeOffset,
                pixelOffset: pixelOffset,
                verticalOrigin: options.useVerticalOrigin
                    ? Cesium.VerticalOrigin.BOTTOM
                    : undefined,
                horizontalOrigin: options.useHorizontalOrigin
                    ? Cesium.HorizontalOrigin.CENTER
                    : undefined,
                view: options.view,
            });
            billboardRef.unselectedImage = DrawingUtility.getPin({
                fillColor: options.color,
                icon: options.icon,
                badgeOptions: options.badgeOptions,
            });
            billboardRef.selectedImage = DrawingUtility.getPin({
                fillColor: 'orange',
                icon: options.icon,
                badgeOptions: options.badgeOptions,
            });
            billboardRef.image = options.isSelected
                ? billboardRef.selectedImage
                : billboardRef.unselectedImage;
            //if there is a terrain provider and no altitude has been specified, sample it from the configured terrain provider
            if (!pointObject.altitude && map.scene.terrainProvider) {
                var promise = Cesium.sampleTerrain(map.scene.terrainProvider, 5, [
                    cartographicPosition,
                ]);
                Cesium.when(promise, function (updatedCartographic) {
                    if (updatedCartographic[0].height && !options.view.isDestroyed) {
                        billboardRef.position =
                            map.scene.globe.ellipsoid.cartographicToCartesian(updatedCartographic[0]);
                    }
                });
            }
            map.scene.requestRender();
            return billboardRef;
        },
        /*
                  Adds a label utilizing the passed in point and options.
                  Options are a view to an id and text.
                */
        addLabel: function (point, options) {
            var pointObject = convertPointCoordinate(point);
            var cartographicPosition = Cesium.Cartographic.fromDegrees(pointObject.longitude, pointObject.latitude, pointObject.altitude);
            var cartesianPosition = map.scene.globe.ellipsoid.cartographicToCartesian(cartographicPosition);
            // X, Y offset values for the label
            var offset = new Cesium.Cartesian2(20, -15);
            // Cesium measurement for determining how to render the size of the label based on zoom
            var scaleZoom = new Cesium.NearFarScalar(1.5e4, 1.0, 8.0e6, 0.0);
            // Cesium measurement for determining how to render the translucency of the label based on zoom
            var translucencyZoom = new Cesium.NearFarScalar(1.5e6, 1.0, 8.0e6, 0.0);
            var labelRef = labelCollection.add({
                text: options.text,
                position: cartesianPosition,
                id: options.id,
                pixelOffset: offset,
                scale: 1.0,
                scaleByDistance: scaleZoom,
                translucencyByDistance: translucencyZoom,
                fillColor: Cesium.Color.BLACK,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 10,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            });
            mapModel.addLabel(labelRef);
            return labelRef;
        },
        /*
                  Adds a polyline utilizing the passed in line and options.
                  Options are a view to relate to, and an id, and a color.
                */
        addLine: function (line, options) {
            var lineObject = line.map(function (coordinate) {
                return convertPointCoordinate(coordinate);
            });
            var cartPoints = _.map(lineObject, function (point) {
                return Cesium.Cartographic.fromDegrees(point.longitude, point.latitude, point.altitude);
            });
            var cartesian = map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(cartPoints);
            var polylineCollection = new Cesium.PolylineCollection();
            polylineCollection.unselectedMaterial = Cesium.Material.fromType('PolylineOutline', {
                color: determineCesiumColor(options.color),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 4,
            });
            polylineCollection.selectedMaterial = Cesium.Material.fromType('PolylineOutline', {
                color: determineCesiumColor(options.color),
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 4,
            });
            var polyline = polylineCollection.add({
                width: 8,
                material: options.isSelected
                    ? polylineCollection.selectedMaterial
                    : polylineCollection.unselectedMaterial,
                id: options.id,
                positions: cartesian,
            });
            if (map.scene.terrainProvider) {
                var promise = Cesium.sampleTerrain(map.scene.terrainProvider, 5, cartPoints);
                Cesium.when(promise, function (updatedCartographic) {
                    var positions = map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(updatedCartographic);
                    if (updatedCartographic[0].height && !options.view.isDestroyed) {
                        polyline.positions = positions;
                    }
                });
            }
            map.scene.primitives.add(polylineCollection);
            return polylineCollection;
        },
        /*
                  Adds a polygon fill utilizing the passed in polygon and options.
                  Options are a view to relate to, and an id.
                */
        addPolygon: function (polygon, options) {
            var polygonObject = polygon.map(function (coordinate) {
                return convertPointCoordinate(coordinate);
            });
            var cartPoints = _.map(polygonObject, function (point) {
                return Cesium.Cartographic.fromDegrees(point.longitude, point.latitude, point.altitude);
            });
            var cartesian = map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(cartPoints);
            var unselectedPolygonRef = map.entities.add({
                polygon: {
                    hierarchy: cartesian,
                    material: new Cesium.GridMaterialProperty({
                        color: Cesium.Color.WHITE,
                        cellAlpha: 0.0,
                        lineCount: new Cesium.Cartesian2(2, 2),
                        lineThickness: new Cesium.Cartesian2(2.0, 2.0),
                        lineOffset: new Cesium.Cartesian2(0.0, 0.0),
                    }),
                    perPositionHeight: true,
                },
                show: true,
                resultId: options.id,
                showWhenSelected: false,
            });
            var selectedPolygonRef = map.entities.add({
                polygon: {
                    hierarchy: cartesian,
                    material: new Cesium.GridMaterialProperty({
                        color: Cesium.Color.BLACK,
                        cellAlpha: 0.0,
                        lineCount: new Cesium.Cartesian2(2, 2),
                        lineThickness: new Cesium.Cartesian2(2.0, 2.0),
                        lineOffset: new Cesium.Cartesian2(0.0, 0.0),
                    }),
                    perPositionHeight: true,
                },
                show: false,
                resultId: options.id,
                showWhenSelected: true,
            });
            if (map.scene.terrainProvider) {
                var promise = Cesium.sampleTerrain(map.scene.terrainProvider, 5, cartPoints);
                Cesium.when(promise, function (updatedCartographic) {
                    cartesian =
                        map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(updatedCartographic);
                    if (updatedCartographic[0].height && !options.view.isDestroyed) {
                        unselectedPolygonRef.polygon.hierarchy.setValue(cartesian);
                        selectedPolygonRef.polygon.hierarchy.setValue(cartesian);
                    }
                });
            }
            return [unselectedPolygonRef, selectedPolygonRef];
        },
        /*
                 Updates a passed in geometry to reflect whether or not it is selected.
                 Options passed in are color and isSelected.
                */
        updateCluster: function (geometry, options) {
            var _this = this;
            if (geometry.constructor === Array) {
                geometry.forEach(function (innerGeometry) {
                    _this.updateCluster(innerGeometry, options);
                });
            }
            if (geometry.constructor === Cesium.Billboard) {
                switch (options.isSelected) {
                    case 'selected':
                        geometry.image = geometry.selectedImage;
                        break;
                    case 'partially':
                        geometry.image = geometry.partiallySelectedImage;
                        break;
                    case 'unselected':
                        geometry.image = geometry.unselectedImage;
                        break;
                }
                var isSelected = options.isSelected !== 'unselected';
                geometry.eyeOffset = new Cesium.Cartesian3(0, 0, isSelected ? -1 : 0);
            }
            else if (geometry.constructor === Cesium.PolylineCollection) {
                geometry._polylines.forEach(function (polyline) {
                    polyline.material = Cesium.Material.fromType('PolylineOutline', {
                        color: determineCesiumColor('rgba(0,0,0, .1)'),
                        outlineColor: determineCesiumColor('rgba(255,255,255, .1)'),
                        outlineWidth: 4,
                    });
                });
            }
            else if (geometry.showWhenSelected) {
                geometry.show = options.isSelected;
            }
            else {
                geometry.show = !options.isSelected;
            }
            map.scene.requestRender();
        },
        /*
                  Updates a passed in geometry to reflect whether or not it is selected.
                  Options passed in are color and isSelected.
                  */
        updateGeometry: function (geometry, options) {
            var _this = this;
            if (geometry.constructor === Array) {
                geometry.forEach(function (innerGeometry) {
                    _this.updateGeometry(innerGeometry, options);
                });
            }
            if (geometry.constructor === Cesium.Billboard) {
                geometry.image = options.isSelected
                    ? geometry.selectedImage
                    : geometry.unselectedImage;
                geometry.eyeOffset = new Cesium.Cartesian3(0, 0, options.isSelected ? -1 : 0);
            }
            else if (geometry.constructor === Cesium.Label) {
                geometry.isSelected = options.isSelected;
                showHideLabel({
                    geometry: geometry,
                });
            }
            else if (geometry.constructor === Cesium.PolylineCollection) {
                geometry._polylines.forEach(function (polyline) {
                    polyline.material = options.isSelected
                        ? geometry.selectedMaterial
                        : geometry.unselectedMaterial;
                });
            }
            else if (geometry.showWhenSelected) {
                geometry.show = options.isSelected;
            }
            else {
                geometry.show = !options.isSelected;
            }
            map.scene.requestRender();
        },
        /*
                 Updates a passed in geometry to be hidden
                 */
        hideGeometry: function (geometry) {
            if (geometry.constructor === Cesium.Billboard ||
                geometry.constructor === Cesium.Label) {
                geometry.show = false;
            }
            else if (geometry.constructor === Cesium.PolylineCollection) {
                geometry._polylines.forEach(function (polyline) {
                    polyline.show = false;
                });
            }
        },
        /*
                 Updates a passed in geometry to be shown
                 */
        showGeometry: function (geometry) {
            if (geometry.constructor === Cesium.Billboard) {
                geometry.show = true;
            }
            else if (geometry.constructor === Cesium.Label) {
                showHideLabel({
                    geometry: geometry,
                    findSelected: true,
                });
            }
            else if (geometry.constructor === Cesium.PolylineCollection) {
                geometry._polylines.forEach(function (polyline) {
                    polyline.show = true;
                });
            }
            map.scene.requestRender();
        },
        removeGeometry: function (geometry) {
            billboardCollection.remove(geometry);
            labelCollection.remove(geometry);
            map.scene.primitives.remove(geometry);
            //unminified cesium chokes if you feed a geometry with id as an Array
            if (geometry.constructor === Cesium.Entity) {
                map.entities.remove(geometry);
            }
            if (geometry.constructor === Cesium.Label) {
                mapModel.removeLabel(geometry);
                showHiddenLabel(geometry);
            }
            map.scene.requestRender();
        },
        destroyShapes: function () {
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'shape' implicitly has an 'any' type.
            shapes.forEach(function (shape) {
                shape.destroy();
            });
            shapes = [];
            if (map && map.scene) {
                map.scene.requestRender();
            }
        },
        getMap: function () {
            return map;
        },
        zoomIn: function () {
            var cameraPositionCartographic = map.scene.globe.ellipsoid.cartesianToCartographic(map.scene.camera.position);
            var terrainHeight = map.scene.globe.getHeight(cameraPositionCartographic);
            var heightAboveGround = cameraPositionCartographic.height - terrainHeight;
            var zoomAmount = heightAboveGround / 2; // basically double the current zoom
            var maxZoomAmount = heightAboveGround - minimumHeightAboveTerrain;
            // if the zoom amount is greater than the max zoom amount, zoom to the max zoom amount
            map.scene.camera.zoomIn(Math.min(maxZoomAmount, zoomAmount));
        },
        zoomOut: function () {
            var cameraPositionCartographic = map.scene.globe.ellipsoid.cartesianToCartographic(map.scene.camera.position);
            var terrainHeight = map.scene.globe.getHeight(cameraPositionCartographic);
            var heightAboveGround = cameraPositionCartographic.height - terrainHeight;
            map.scene.camera.zoomOut(heightAboveGround);
        },
        destroy: function () {
            ;
            wreqr.vent.off('map:requestRender', requestRenderHandler);
            map.destroy();
        },
    };
    return exposedMethods;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLmNlc2l1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2Nlc2l1bS9tYXAuY2VzaXVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxjQUFjLE1BQU0sbUJBQW1CLENBQUE7QUFDOUMsT0FBTyxLQUFLLE1BQU0sc0JBQXNCLENBQUE7QUFDeEMsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3JFLE9BQU8sRUFDTCwwQkFBMEIsRUFDMUIsWUFBWSxHQUNiLE1BQU0sMENBQTBDLENBQUE7QUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBR3JELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3ZFLElBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQTtBQUM5QixJQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNoRCxJQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2pELElBQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3JELElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQTtBQUNqQyxJQUFNLGVBQWUsR0FBRyxD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QUFDO1lBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtZQUNuRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDZixDQUFDO0tBQ0YsQ0FBQTtJQUNELE9BQU8sY0FBYyxDQUFBO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuL3V0aWxpdHknXG5pbXBvcnQgRHJhd2luZ1V0aWxpdHkgZnJvbSAnLi4vRHJhd2luZ1V0aWxpdHknXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vLi4vLi4vanMvd3JlcXInXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjZXNpLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBDZXNpdW0gZnJvbSAnY2VzaXVtL0J1aWxkL0Nlc2l1bS9DZXNpdW0nXG5pbXBvcnQgRHJhd0hlbHBlciBmcm9tICcuLi8uLi8uLi8uLi9saWIvY2VzaXVtLWRyYXdoZWxwZXIvRHJhd0hlbHBlcidcbmltcG9ydCB7XG4gIENlc2l1bUltYWdlcnlQcm92aWRlclR5cGVzLFxuICBDZXNpdW1MYXllcnMsXG59IGZyb20gJy4uLy4uLy4uLy4uL2pzL2NvbnRyb2xsZXJzL2Nlc2l1bS5sYXllcnMnXG5pbXBvcnQgeyBEcmF3aW5nIH0gZnJvbSAnLi4vLi4vLi4vc2luZ2xldG9ucy9kcmF3aW5nJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IENsdXN0ZXJUeXBlIH0gZnJvbSAnLi4vcmVhY3QvZ2VvbWV0cmllcydcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5jb25zdCBkZWZhdWx0Q29sb3IgPSAnIzNjNmRkNSdcbmNvbnN0IGV5ZU9mZnNldCA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMygwLCAwLCAwKVxuY29uc3QgcGl4ZWxPZmZzZXQgPSBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMC4wLCAwKVxuY29uc3QgcnVsZXJDb2xvciA9IG5ldyBDZXNpdW0uQ29sb3IoMC4zMSwgMC40MywgMC41MilcbmNvbnN0IHJ1bGVyUG9pbnRDb2xvciA9ICcjNTA2Zjg1J1xuY29uc3QgcnVsZXJMaW5lSGVpZ2h0ID0gMFxuQ2VzaXVtLkJpbmdNYXBzQXBpLmRlZmF1bHRLZXkgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0QmluZ0tleSgpIHx8IDBcbmNvbnN0IGltYWdlcnlQcm92aWRlclR5cGVzID0gQ2VzaXVtSW1hZ2VyeVByb3ZpZGVyVHlwZXNcbmZ1bmN0aW9uIHNldHVwVGVycmFpblByb3ZpZGVyKHZpZXdlcjogYW55LCB0ZXJyYWluUHJvdmlkZXI6IGFueSkge1xuICBpZiAodGVycmFpblByb3ZpZGVyID09IG51bGwgfHwgdGVycmFpblByb3ZpZGVyID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zb2xlLmluZm8oYFVua25vd24gdGVycmFpbiBwcm92aWRlciBjb25maWd1cmF0aW9uLlxuICAgICAgICAgICAgICBEZWZhdWx0IENlc2l1bSB0ZXJyYWluIHByb3ZpZGVyIHdpbGwgYmUgdXNlZC5gKVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IHsgdHlwZSwgLi4udGVycmFpbkNvbmZpZyB9ID0gdGVycmFpblByb3ZpZGVyXG4gIGNvbnN0IFRlcnJhaW5Qcm92aWRlciA9IGltYWdlcnlQcm92aWRlclR5cGVzW3R5cGVdXG4gIGlmIChUZXJyYWluUHJvdmlkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnNvbGUud2FybihgXG4gICAgICAgICAgICBVbmtub3duIHRlcnJhaW4gcHJvdmlkZXIgdHlwZTogJHt0eXBlfS5cbiAgICAgICAgICAgIERlZmF1bHQgQ2VzaXVtIHRlcnJhaW4gcHJvdmlkZXIgd2lsbCBiZSB1c2VkLlxuICAgICAgICBgKVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGRlZmF1bHRDZXNpdW1UZXJyYWluUHJvdmlkZXIgPSB2aWV3ZXIuc2NlbmUudGVycmFpblByb3ZpZGVyXG4gIGNvbnN0IGN1c3RvbVRlcnJhaW5Qcm92aWRlciA9IG5ldyBUZXJyYWluUHJvdmlkZXIodGVycmFpbkNvbmZpZylcbiAgY3VzdG9tVGVycmFpblByb3ZpZGVyLmVycm9yRXZlbnQuYWRkRXZlbnRMaXN0ZW5lcigoKSA9PiB7XG4gICAgY29uc29sZS53YXJuKGBcbiAgICAgICAgICAgIElzc3VlIHVzaW5nIHRlcnJhaW4gcHJvdmlkZXI6ICR7SlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAuLi50ZXJyYWluQ29uZmlnLFxuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICBGYWxsaW5nIGJhY2sgdG8gZGVmYXVsdCBDZXNpdW0gdGVycmFpbiBwcm92aWRlci5cbiAgICAgICAgYClcbiAgICB2aWV3ZXIuc2NlbmUudGVycmFpblByb3ZpZGVyID0gZGVmYXVsdENlc2l1bVRlcnJhaW5Qcm92aWRlclxuICB9KVxuICB2aWV3ZXIuc2NlbmUudGVycmFpblByb3ZpZGVyID0gY3VzdG9tVGVycmFpblByb3ZpZGVyXG59XG5mdW5jdGlvbiBjcmVhdGVNYXAoaW5zZXJ0aW9uRWxlbWVudDogYW55LCBtYXBMYXllcnM6IGFueSkge1xuICBjb25zdCBsYXllckNvbGxlY3Rpb25Db250cm9sbGVyID0gbmV3IENlc2l1bUxheWVycyh7XG4gICAgY29sbGVjdGlvbjogbWFwTGF5ZXJzLFxuICB9KVxuICBjb25zdCB2aWV3ZXIgPSBsYXllckNvbGxlY3Rpb25Db250cm9sbGVyLm1ha2VNYXAoe1xuICAgIGVsZW1lbnQ6IGluc2VydGlvbkVsZW1lbnQsXG4gICAgY2VzaXVtT3B0aW9uczoge1xuICAgICAgc2NlbmVNb2RlOiBDZXNpdW0uU2NlbmVNb2RlLlNDRU5FM0QsXG4gICAgICBjcmVkaXRDb250YWluZXI6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgYW5pbWF0aW9uOiBmYWxzZSxcbiAgICAgIGZ1bGxzY3JlZW5CdXR0b246IGZhbHNlLFxuICAgICAgdGltZWxpbmU6IGZhbHNlLFxuICAgICAgZ2VvY29kZXI6IGZhbHNlLFxuICAgICAgaG9tZUJ1dHRvbjogZmFsc2UsXG4gICAgICBuYXZpZ2F0aW9uSGVscEJ1dHRvbjogZmFsc2UsXG4gICAgICBzY2VuZU1vZGVQaWNrZXI6IGZhbHNlLFxuICAgICAgc2VsZWN0aW9uSW5kaWNhdG9yOiBmYWxzZSxcbiAgICAgIGluZm9Cb3g6IGZhbHNlLFxuICAgICAgLy9za3lCb3g6IGZhbHNlLFxuICAgICAgLy9za3lBdG1vc3BoZXJlOiBmYWxzZSxcbiAgICAgIGJhc2VMYXllclBpY2tlcjogZmFsc2UsXG4gICAgICBpbWFnZXJ5UHJvdmlkZXI6IGZhbHNlLFxuICAgICAgbWFwTW9kZTJEOiAwLFxuICAgIH0sXG4gIH0pXG4gIGNvbnN0IHJlcXVlc3RSZW5kZXIgPSAoKSA9PiB7XG4gICAgdmlld2VyLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICB9XG4gIDsod3JlcXIgYXMgYW55KS52ZW50Lm9uKCdtYXA6cmVxdWVzdFJlbmRlcicsIHJlcXVlc3RSZW5kZXIpXG4gIC8vIGRpc2FibGUgcmlnaHQgY2xpY2sgZHJhZyB0byB6b29tIChjb250ZXh0IG1lbnUgaW5zdGVhZCk7XG4gIHZpZXdlci5zY2VuZS5zY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIuem9vbUV2ZW50VHlwZXMgPSBbXG4gICAgQ2VzaXVtLkNhbWVyYUV2ZW50VHlwZS5XSEVFTCxcbiAgICBDZXNpdW0uQ2FtZXJhRXZlbnRUeXBlLlBJTkNILFxuICBdXG4gIHZpZXdlci5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoKSA9PiB7XG4gICAgaWYgKCFEcmF3aW5nLmlzRHJhd2luZygpKSB7XG4gICAgICAkKCdib2R5JykubW91c2Vkb3duKClcbiAgICB9XG4gIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0RPV04pXG4gIHZpZXdlci5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoKSA9PiB7XG4gICAgaWYgKCFEcmF3aW5nLmlzRHJhd2luZygpKSB7XG4gICAgICAkKCdib2R5JykubW91c2Vkb3duKClcbiAgICB9XG4gIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5SSUdIVF9ET1dOKVxuICBzZXR1cFRlcnJhaW5Qcm92aWRlcihcbiAgICB2aWV3ZXIsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFRlcnJhaW5Qcm92aWRlcigpXG4gIClcbiAgcmV0dXJuIHtcbiAgICBtYXA6IHZpZXdlcixcbiAgICByZXF1ZXN0UmVuZGVySGFuZGxlcjogcmVxdWVzdFJlbmRlcixcbiAgfVxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uOiBhbnksIG1hcDogYW55KSB7XG4gIGxldCBpZCwgbG9jYXRpb25JZFxuICBjb25zdCBwaWNrZWRPYmplY3QgPSBtYXAuc2NlbmUucGljayhwb3NpdGlvbilcbiAgaWYgKHBpY2tlZE9iamVjdCkge1xuICAgIGlkID0gcGlja2VkT2JqZWN0LmlkXG4gICAgaWYgKGlkICYmIGlkLmNvbnN0cnVjdG9yID09PSBDZXNpdW0uRW50aXR5KSB7XG4gICAgICBpZCA9IGlkLnJlc3VsdElkXG4gICAgfVxuICAgIGxvY2F0aW9uSWQgPSBwaWNrZWRPYmplY3QuY29sbGVjdGlvbj8ubG9jYXRpb25JZFxuICB9XG4gIHJldHVybiB7IGlkLCBsb2NhdGlvbklkIH1cbn1cbmZ1bmN0aW9uIGV4cGFuZFJlY3RhbmdsZShyZWN0YW5nbGU6IGFueSkge1xuICBjb25zdCBzY2FsaW5nRmFjdG9yID0gMC4wNVxuICBsZXQgd2lkdGhHYXAgPSBNYXRoLmFicyhyZWN0YW5nbGUuZWFzdCkgLSBNYXRoLmFicyhyZWN0YW5nbGUud2VzdClcbiAgbGV0IGhlaWdodEdhcCA9IE1hdGguYWJzKHJlY3RhbmdsZS5ub3J0aCkgLSBNYXRoLmFicyhyZWN0YW5nbGUuc291dGgpXG4gIC8vZW5zdXJlIHJlY3RhbmdsZSBoYXMgc29tZSBzaXplXG4gIGlmICh3aWR0aEdhcCA9PT0gMCkge1xuICAgIHdpZHRoR2FwID0gMVxuICB9XG4gIGlmIChoZWlnaHRHYXAgPT09IDApIHtcbiAgICBoZWlnaHRHYXAgPSAxXG4gIH1cbiAgcmVjdGFuZ2xlLmVhc3QgPSByZWN0YW5nbGUuZWFzdCArIE1hdGguYWJzKHNjYWxpbmdGYWN0b3IgKiB3aWR0aEdhcClcbiAgcmVjdGFuZ2xlLm5vcnRoID0gcmVjdGFuZ2xlLm5vcnRoICsgTWF0aC5hYnMoc2NhbGluZ0ZhY3RvciAqIGhlaWdodEdhcClcbiAgcmVjdGFuZ2xlLnNvdXRoID0gcmVjdGFuZ2xlLnNvdXRoIC0gTWF0aC5hYnMoc2NhbGluZ0ZhY3RvciAqIGhlaWdodEdhcClcbiAgcmVjdGFuZ2xlLndlc3QgPSByZWN0YW5nbGUud2VzdCAtIE1hdGguYWJzKHNjYWxpbmdGYWN0b3IgKiB3aWR0aEdhcClcbiAgcmV0dXJuIHJlY3RhbmdsZVxufVxuZnVuY3Rpb24gZ2V0RGVzdGluYXRpb25Gb3JWaXNpYmxlUGFuKHJlY3RhbmdsZTogYW55LCBtYXA6IGFueSkge1xuICBsZXQgZGVzdGluYXRpb25Gb3Jab29tID0gZXhwYW5kUmVjdGFuZ2xlKHJlY3RhbmdsZSlcbiAgaWYgKG1hcC5zY2VuZS5tb2RlID09PSBDZXNpdW0uU2NlbmVNb2RlLlNDRU5FM0QpIHtcbiAgICBkZXN0aW5hdGlvbkZvclpvb20gPVxuICAgICAgbWFwLmNhbWVyYS5nZXRSZWN0YW5nbGVDYW1lcmFDb29yZGluYXRlcyhkZXN0aW5hdGlvbkZvclpvb20pXG4gIH1cbiAgcmV0dXJuIGRlc3RpbmF0aW9uRm9yWm9vbVxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lQ2VzaXVtQ29sb3IoY29sb3I6IGFueSkge1xuICByZXR1cm4gIV8uaXNVbmRlZmluZWQoY29sb3IpXG4gICAgPyBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGNvbG9yKVxuICAgIDogQ2VzaXVtLkNvbG9yLmZyb21Dc3NDb2xvclN0cmluZyhkZWZhdWx0Q29sb3IpXG59XG5mdW5jdGlvbiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGU6IGFueSkge1xuICByZXR1cm4ge1xuICAgIGxhdGl0dWRlOiBjb29yZGluYXRlWzFdLFxuICAgIGxvbmdpdHVkZTogY29vcmRpbmF0ZVswXSxcbiAgICBhbHRpdHVkZTogY29vcmRpbmF0ZVsyXSxcbiAgfVxufVxuZnVuY3Rpb24gaXNOb3RWaXNpYmxlKGNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5OiBhbnksIG9jY2x1ZGVyOiBhbnkpIHtcbiAgcmV0dXJuICFvY2NsdWRlci5pc1BvaW50VmlzaWJsZShjYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeSlcbn1cblxuLy8gaHR0cHM6Ly9jZXNpdW0uY29tL2xlYXJuL2Nlc2l1bWpzL3JlZi1kb2MvQ2FtZXJhLmh0bWxcbmV4cG9ydCBjb25zdCBMb29raW5nU3RyYWlnaHREb3duT3JpZW50YXRpb24gPSB7XG4gIGhlYWRpbmc6IDAsIC8vIE5vcnRoIGlzIHVwIC0gbGlrZSBjb21wYXNzIGRpcmVjdGlvblxuICBwaXRjaDogLUNlc2l1bS5NYXRoLlBJX09WRVJfVFdPLCAvLyBMb29raW5nIHN0cmFpZ2h0IGRvd24gLSBsaWtlIGEgbGV2ZWwgZnJvbSB1cCB0byBkb3duXG4gIHJvbGw6IDAsIC8vIE5vIHJvbGwgLSBsaWtlIGEgbGV2ZWwgZnJvbSBsZWZ0IHRvIHJpZ2h0XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENlc2l1bU1hcChcbiAgaW5zZXJ0aW9uRWxlbWVudDogYW55LFxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueSxcbiAgX25vdGlmaWNhdGlvbkVsOiBhbnksXG4gIGNvbXBvbmVudEVsZW1lbnQ6IGFueSxcbiAgbWFwTW9kZWw6IGFueSxcbiAgbWFwTGF5ZXJzOiBhbnlcbikge1xuICBsZXQgb3ZlcmxheXMgPSB7fVxuICBsZXQgc2hhcGVzOiBhbnkgPSBbXVxuICBjb25zdCB7IG1hcCwgcmVxdWVzdFJlbmRlckhhbmRsZXIgfSA9IGNyZWF0ZU1hcChpbnNlcnRpb25FbGVtZW50LCBtYXBMYXllcnMpXG4gIGNvbnN0IGRyYXdIZWxwZXIgPSBuZXcgKERyYXdIZWxwZXIgYXMgYW55KShtYXApXG4gIG1hcC5kcmF3SGVscGVyID0gZHJhd0hlbHBlclxuICBjb25zdCBiaWxsYm9hcmRDb2xsZWN0aW9uID0gc2V0dXBCaWxsYm9hcmRDb2xsZWN0aW9uKClcbiAgY29uc3QgbGFiZWxDb2xsZWN0aW9uID0gc2V0dXBMYWJlbENvbGxlY3Rpb24oKVxuICBzZXR1cFRvb2x0aXAobWFwLCBzZWxlY3Rpb25JbnRlcmZhY2UpXG4gIGZ1bmN0aW9uIHVwZGF0ZUNvb3JkaW5hdGVzVG9vbHRpcChwb3NpdGlvbjogYW55KSB7XG4gICAgY29uc3QgY2FydGVzaWFuID0gbWFwLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgcG9zaXRpb24sXG4gICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgKVxuICAgIGlmIChDZXNpdW0uZGVmaW5lZChjYXJ0ZXNpYW4pKSB7XG4gICAgICBsZXQgY2FydG9ncmFwaGljID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tQ2FydGVzaWFuKGNhcnRlc2lhbilcbiAgICAgIG1hcE1vZGVsLnVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXMoe1xuICAgICAgICBsYXQ6IGNhcnRvZ3JhcGhpYy5sYXRpdHVkZSAqIENlc2l1bS5NYXRoLkRFR1JFRVNfUEVSX1JBRElBTixcbiAgICAgICAgbG9uOiBjYXJ0b2dyYXBoaWMubG9uZ2l0dWRlICogQ2VzaXVtLk1hdGguREVHUkVFU19QRVJfUkFESUFOLFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgbWFwTW9kZWwuY2xlYXJNb3VzZUNvb3JkaW5hdGVzKClcbiAgICB9XG4gIH1cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDYxMzMpIEZJWE1FOiAnc2VsZWN0aW9uSW50ZXJmYWNlJyBpcyBkZWNsYXJlZCBidXQgaXRzIHZhbHVlIGlzIC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gIGZ1bmN0aW9uIHNldHVwVG9vbHRpcChtYXA6IGFueSwgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnkpIHtcbiAgICBjb25zdCBoYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihtYXAuc2NlbmUuY2FudmFzKVxuICAgIGhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgICQoY29tcG9uZW50RWxlbWVudCkucmVtb3ZlQ2xhc3MoJ2hhcy1mZWF0dXJlJylcbiAgICAgIGlmIChtYXAuc2NlbmUubW9kZSA9PT0gQ2VzaXVtLlNjZW5lTW9kZS5NT1JQSElORykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHVwZGF0ZUNvb3JkaW5hdGVzVG9vbHRpcChtb3ZlbWVudC5lbmRQb3NpdGlvbilcbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgfVxuICBmdW5jdGlvbiBzZXR1cEJpbGxib2FyZENvbGxlY3Rpb24oKSB7XG4gICAgY29uc3QgYmlsbGJvYXJkQ29sbGVjdGlvbiA9IG5ldyBDZXNpdW0uQmlsbGJvYXJkQ29sbGVjdGlvbigpXG4gICAgbWFwLnNjZW5lLnByaW1pdGl2ZXMuYWRkKGJpbGxib2FyZENvbGxlY3Rpb24pXG4gICAgcmV0dXJuIGJpbGxib2FyZENvbGxlY3Rpb25cbiAgfVxuICBmdW5jdGlvbiBzZXR1cExhYmVsQ29sbGVjdGlvbigpIHtcbiAgICBjb25zdCBsYWJlbENvbGxlY3Rpb24gPSBuZXcgQ2VzaXVtLkxhYmVsQ29sbGVjdGlvbigpXG4gICAgbWFwLnNjZW5lLnByaW1pdGl2ZXMuYWRkKGxhYmVsQ29sbGVjdGlvbilcbiAgICByZXR1cm4gbGFiZWxDb2xsZWN0aW9uXG4gIH1cbiAgLypcbiAgICogUmV0dXJucyBhIHZpc2libGUgbGFiZWwgdGhhdCBpcyBpbiB0aGUgc2FtZSBsb2NhdGlvbiBhcyB0aGUgcHJvdmlkZWQgbGFiZWwgKGdlb21ldHJ5SW5zdGFuY2UpIGlmIG9uZSBleGlzdHMuXG4gICAqIElmIGZpbmRTZWxlY3RlZCBpcyB0cnVlLCB0aGUgZnVuY3Rpb24gd2lsbCBhbHNvIGNoZWNrIGZvciBoaWRkZW4gbGFiZWxzIGluIHRoZSBzYW1lIGxvY2F0aW9uIGJ1dCBhcmUgc2VsZWN0ZWQuXG4gICAqL1xuICBmdW5jdGlvbiBmaW5kT3ZlcmxhcHBpbmdMYWJlbChmaW5kU2VsZWN0ZWQ6IGFueSwgZ2VvbWV0cnk6IGFueSkge1xuICAgIHJldHVybiBfLmZpbmQoXG4gICAgICBtYXBNb2RlbC5nZXQoJ2xhYmVscycpLFxuICAgICAgKGxhYmVsKSA9PlxuICAgICAgICBsYWJlbC5wb3NpdGlvbi54ID09PSBnZW9tZXRyeS5wb3NpdGlvbi54ICYmXG4gICAgICAgIGxhYmVsLnBvc2l0aW9uLnkgPT09IGdlb21ldHJ5LnBvc2l0aW9uLnkgJiZcbiAgICAgICAgKChmaW5kU2VsZWN0ZWQgJiYgbGFiZWwuaXNTZWxlY3RlZCkgfHwgbGFiZWwuc2hvdylcbiAgICApXG4gIH1cbiAgLypcbiAgICAgICAgT25seSBzaG93cyBvbmUgbGFiZWwgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGxhYmVscyBpbiB0aGUgc2FtZSBsb2NhdGlvbi5cblxuICAgICAgICBTaG93IHRoZSBsYWJlbCBpbiB0aGUgZm9sbG93aW5nIGltcG9ydGFuY2U6XG4gICAgICAgICAgLSBpdCBpcyBzZWxlY3RlZCBhbmQgdGhlIGV4aXN0aW5nIGxhYmVsIGlzIG5vdFxuICAgICAgICAgIC0gdGhlcmUgaXMgbm8gb3RoZXIgbGFiZWwgZGlzcGxheWVkIGF0IHRoZSBzYW1lIGxvY2F0aW9uXG4gICAgICAgICAgLSBpdCBpcyB0aGUgbGFiZWwgdGhhdCB3YXMgZm91bmQgYnkgZmluZE92ZXJsYXBwaW5nTGFiZWxcblxuICAgICAgICBBcmd1bWVudHMgYXJlOlxuICAgICAgICAgIC0gdGhlIGxhYmVsIHRvIHNob3cvaGlkZVxuICAgICAgICAgIC0gaWYgdGhlIGxhYmVsIGlzIHNlbGVjdGVkXG4gICAgICAgICAgLSBpZiB0aGUgc2VhcmNoIGZvciBvdmVybGFwcGluZyBsYWJlbCBzaG91bGQgaW5jbHVkZSBoaWRkZW4gc2VsZWN0ZWQgbGFiZWxzXG4gICAgICAgICovXG4gIGZ1bmN0aW9uIHNob3dIaWRlTGFiZWwoeyBnZW9tZXRyeSwgZmluZFNlbGVjdGVkID0gZmFsc2UgfTogYW55KSB7XG4gICAgY29uc3QgaXNTZWxlY3RlZCA9IGdlb21ldHJ5LmlzU2VsZWN0ZWRcbiAgICBjb25zdCBsYWJlbFdpdGhTYW1lUG9zaXRpb24gPSBmaW5kT3ZlcmxhcHBpbmdMYWJlbChmaW5kU2VsZWN0ZWQsIGdlb21ldHJ5KVxuICAgIGlmIChcbiAgICAgIGlzU2VsZWN0ZWQgJiZcbiAgICAgIGxhYmVsV2l0aFNhbWVQb3NpdGlvbiAmJlxuICAgICAgIWxhYmVsV2l0aFNhbWVQb3NpdGlvbi5pc1NlbGVjdGVkXG4gICAgKSB7XG4gICAgICBsYWJlbFdpdGhTYW1lUG9zaXRpb24uc2hvdyA9IGZhbHNlXG4gICAgfVxuICAgIGNvbnN0IG90aGVyTGFiZWxOb3RTZWxlY3RlZCA9IGxhYmVsV2l0aFNhbWVQb3NpdGlvblxuICAgICAgPyAhbGFiZWxXaXRoU2FtZVBvc2l0aW9uLmlzU2VsZWN0ZWRcbiAgICAgIDogdHJ1ZVxuICAgIGdlb21ldHJ5LnNob3cgPVxuICAgICAgKGlzU2VsZWN0ZWQgJiYgb3RoZXJMYWJlbE5vdFNlbGVjdGVkKSB8fFxuICAgICAgIWxhYmVsV2l0aFNhbWVQb3NpdGlvbiB8fFxuICAgICAgZ2VvbWV0cnkuaWQgPT09IGxhYmVsV2l0aFNhbWVQb3NpdGlvbi5pZFxuICB9XG4gIC8qXG4gICAgICAgIFNob3dzIGEgaGlkZGVuIGxhYmVsLiBVc2VkIHdoZW4gZGVsZXRpbmcgYSBsYWJlbCB0aGF0IGlzIHNob3duLlxuICAgICAgICAqL1xuICBmdW5jdGlvbiBzaG93SGlkZGVuTGFiZWwoZ2VvbWV0cnk6IGFueSkge1xuICAgIGlmICghZ2VvbWV0cnkuc2hvdykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGhpZGRlbkxhYmVsID0gXy5maW5kKFxuICAgICAgbWFwTW9kZWwuZ2V0KCdsYWJlbHMnKSxcbiAgICAgIChsYWJlbCkgPT5cbiAgICAgICAgbGFiZWwucG9zaXRpb24ueCA9PT0gZ2VvbWV0cnkucG9zaXRpb24ueCAmJlxuICAgICAgICBsYWJlbC5wb3NpdGlvbi55ID09PSBnZW9tZXRyeS5wb3NpdGlvbi55ICYmXG4gICAgICAgIGxhYmVsLmlkICE9PSBnZW9tZXRyeS5pZCAmJlxuICAgICAgICAhbGFiZWwuc2hvd1xuICAgIClcbiAgICBpZiAoaGlkZGVuTGFiZWwpIHtcbiAgICAgIGhpZGRlbkxhYmVsLnNob3cgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWluaW11bUhlaWdodEFib3ZlVGVycmFpbiA9IDJcbiAgY29uc3QgZXhwb3NlZE1ldGhvZHMgPSB7XG4gICAgb25MZWZ0Q2xpY2soY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuc2NlbmUuY2FudmFzKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBtYXAuc2NlbmUuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGNvbnN0IHsgaWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihcbiAgICAgICAgICB7XG4gICAgICAgICAgICB4OiBlLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdCxcbiAgICAgICAgICAgIHk6IGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3AsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtYXBcbiAgICAgICAgKVxuICAgICAgICBjYWxsYmFjayhlLCB7IG1hcFRhcmdldDogaWQgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBvbkxlZnRDbGlja01hcEFQSShjYWxsYmFjazogYW55KSB7XG4gICAgICBsZXQgbGFzdENsaWNrVGltZSA9IDBcbiAgICAgIGxldCBjbGlja1RpbWVvdXQgPSAwXG4gICAgICBtYXAuY2xpY2tFdmVudEhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKG1hcC5jYW52YXMpXG4gICAgICBtYXAuY2xpY2tFdmVudEhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKGU6IGFueSkgPT4ge1xuICAgICAgICAvLyBPbiBhIGRvdWJsZS1jbGljaywgQ2VzaXVtIHdpbGwgZmlyZSAyIGxlZnQtY2xpY2sgZXZlbnRzLCB0b28uIFdlIHdpbGwgb25seSBoYW5kbGUgYVxuICAgICAgICAvLyBjbGljayBpZiAxKSBhbm90aGVyIGNsaWNrIGRpZCBub3QgaGFwcGVuIGluIHRoZSBsYXN0IDI1MCBtcywgYW5kIDIpIGFub3RoZXIgY2xpY2tcbiAgICAgICAgLy8gZG9lcyBub3QgaGFwcGVuIGluIHRoZSBuZXh0IDI1MCBtcy5cbiAgICAgICAgaWYgKGNsaWNrVGltZW91dCA+IDApIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoY2xpY2tUaW1lb3V0KVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGN1cnJlbnRDbGlja1RpbWUgPSBEYXRlLm5vdygpXG4gICAgICAgIGlmIChjdXJyZW50Q2xpY2tUaW1lIC0gbGFzdENsaWNrVGltZSA+IDI1MCkge1xuICAgICAgICAgIGNsaWNrVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKGUucG9zaXRpb24sIG1hcClcbiAgICAgICAgICAgIGNhbGxiYWNrKGxvY2F0aW9uSWQpXG4gICAgICAgICAgfSwgMjUwKVxuICAgICAgICB9XG4gICAgICAgIGxhc3RDbGlja1RpbWUgPSBjdXJyZW50Q2xpY2tUaW1lXG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9DTElDSylcbiAgICB9LFxuICAgIGNsZWFyTGVmdENsaWNrTWFwQVBJKCkge1xuICAgICAgbWFwLmNsaWNrRXZlbnRIYW5kbGVyPy5kZXN0cm95KClcbiAgICB9LFxuICAgIG9uUmlnaHRDbGljayhjYWxsYmFjazogYW55KSB7XG4gICAgICAkKG1hcC5zY2VuZS5jYW52YXMpLm9uKCdjb250ZXh0bWVudScsIChlKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKGUpXG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJSaWdodENsaWNrKCkge1xuICAgICAgJChtYXAuc2NlbmUuY2FudmFzKS5vZmYoJ2NvbnRleHRtZW51JylcbiAgICB9LFxuICAgIG9uRG91YmxlQ2xpY2soKSB7XG4gICAgICBtYXAuZG91YmxlQ2xpY2tFdmVudEhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKFxuICAgICAgICBtYXAuY2FudmFzXG4gICAgICApXG4gICAgICBtYXAuZG91YmxlQ2xpY2tFdmVudEhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKGU6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihlLnBvc2l0aW9uLCBtYXApXG4gICAgICAgIGlmIChsb2NhdGlvbklkKSB7XG4gICAgICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignbG9jYXRpb246ZG91YmxlQ2xpY2snLCBsb2NhdGlvbklkKVxuICAgICAgICB9XG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9ET1VCTEVfQ0xJQ0spXG4gICAgfSxcbiAgICBjbGVhckRvdWJsZUNsaWNrKCkge1xuICAgICAgbWFwLmRvdWJsZUNsaWNrRXZlbnRIYW5kbGVyPy5kZXN0cm95KClcbiAgICB9LFxuICAgIG9uTW91c2VUcmFja2luZ0Zvckdlb0RyYWcoe1xuICAgICAgbW92ZUZyb20sXG4gICAgICBkb3duLFxuICAgICAgbW92ZSxcbiAgICAgIHVwLFxuICAgIH06IHtcbiAgICAgIG1vdmVGcm9tPzogQ2VzaXVtLkNhcnRvZ3JhcGhpY1xuICAgICAgZG93bjogYW55XG4gICAgICBtb3ZlOiBhbnlcbiAgICAgIHVwOiBhbnlcbiAgICB9KSB7XG4gICAgICBtYXAuc2NlbmUuc2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyLmVuYWJsZVJvdGF0ZSA9IGZhbHNlXG4gICAgICBtYXAuZHJhZ0FuZERyb3BFdmVudEhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKFxuICAgICAgICBtYXAuY2FudmFzXG4gICAgICApXG4gICAgICBtYXAuZHJhZ0FuZERyb3BFdmVudEhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKGU6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihlLnBvc2l0aW9uLCBtYXApXG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IG1hcC5zY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChcbiAgICAgICAgICBlLnBvc2l0aW9uLFxuICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICAgICAgKVxuICAgICAgICBjb25zdCBjYXJ0b2dyYXBoaWMgPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21DYXJ0ZXNpYW4oXG4gICAgICAgICAgY2FydGVzaWFuLFxuICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICAgICAgKVxuICAgICAgICBkb3duKHsgcG9zaXRpb246IGNhcnRvZ3JhcGhpYywgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCB9KVxuICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfRE9XTilcbiAgICAgIG1hcC5kcmFnQW5kRHJvcEV2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKGUuZW5kUG9zaXRpb24sIG1hcClcbiAgICAgICAgY29uc3QgY2FydGVzaWFuID0gbWFwLnNjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgIGUuZW5kUG9zaXRpb24sXG4gICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpYyA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbUNhcnRlc2lhbihcbiAgICAgICAgICBjYXJ0ZXNpYW4sXG4gICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gbW92ZUZyb21cbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgbG9uZ2l0dWRlOiBDZXNpdW0uTWF0aC50b0RlZ3JlZXMoXG4gICAgICAgICAgICAgICAgY2FydG9ncmFwaGljLmxvbmdpdHVkZSAtIG1vdmVGcm9tLmxvbmdpdHVkZVxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICBsYXRpdHVkZTogQ2VzaXVtLk1hdGgudG9EZWdyZWVzKFxuICAgICAgICAgICAgICAgIGNhcnRvZ3JhcGhpYy5sYXRpdHVkZSAtIG1vdmVGcm9tLmxhdGl0dWRlXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiBudWxsXG4gICAgICAgIG1vdmUoeyB0cmFuc2xhdGlvbiwgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCB9KVxuICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLk1PVVNFX01PVkUpXG4gICAgICBtYXAuZHJhZ0FuZERyb3BFdmVudEhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oXG4gICAgICAgIHVwLFxuICAgICAgICBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9VUFxuICAgICAgKVxuICAgIH0sXG4gICAgY2xlYXJNb3VzZVRyYWNraW5nRm9yR2VvRHJhZygpIHtcbiAgICAgIG1hcC5zY2VuZS5zY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIuZW5hYmxlUm90YXRlID0gdHJ1ZVxuICAgICAgbWFwLmRyYWdBbmREcm9wRXZlbnRIYW5kbGVyPy5kZXN0cm95KClcbiAgICB9LFxuICAgIG9uTW91c2VUcmFja2luZ0ZvclBvcHVwKFxuICAgICAgZG93bkNhbGxiYWNrOiBhbnksXG4gICAgICBtb3ZlQ2FsbGJhY2s6IGFueSxcbiAgICAgIHVwQ2FsbGJhY2s6IGFueVxuICAgICkge1xuICAgICAgbWFwLnNjcmVlblNwYWNlRXZlbnRIYW5kbGVyRm9yUG9wdXBQcmV2aWV3ID1cbiAgICAgICAgbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihtYXAuY2FudmFzKVxuICAgICAgbWFwLnNjcmVlblNwYWNlRXZlbnRIYW5kbGVyRm9yUG9wdXBQcmV2aWV3LnNldElucHV0QWN0aW9uKCgpID0+IHtcbiAgICAgICAgZG93bkNhbGxiYWNrKClcbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0RPV04pXG4gICAgICBtYXAuc2NyZWVuU3BhY2VFdmVudEhhbmRsZXJGb3JQb3B1cFByZXZpZXcuc2V0SW5wdXRBY3Rpb24oKCkgPT4ge1xuICAgICAgICBtb3ZlQ2FsbGJhY2soKVxuICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLk1PVVNFX01PVkUpXG4gICAgICB0aGlzLm9uTGVmdENsaWNrKHVwQ2FsbGJhY2spXG4gICAgfSxcbiAgICBvbk1vdXNlTW92ZShjYWxsYmFjazogYW55KSB7XG4gICAgICAkKG1hcC5zY2VuZS5jYW52YXMpLm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBtYXAuc2NlbmUuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0ge1xuICAgICAgICAgIHg6IGUuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0LFxuICAgICAgICAgIHk6IGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3AsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBpZCwgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uLCBtYXApXG4gICAgICAgIGNhbGxiYWNrKGUsIHtcbiAgICAgICAgICBtYXBUYXJnZXQ6IGlkLFxuICAgICAgICAgIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJNb3VzZU1vdmUoKSB7XG4gICAgICAkKG1hcC5zY2VuZS5jYW52YXMpLm9mZignbW91c2Vtb3ZlJylcbiAgICB9LFxuICAgIHRpbWVvdXRJZHM6IFtdIGFzIG51bWJlcltdLFxuICAgIG9uQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIHRoaXMudGltZW91dElkcy5mb3JFYWNoKCh0aW1lb3V0SWQ6IGFueSkgPT4ge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICAgIH0pXG4gICAgICB0aGlzLnRpbWVvdXRJZHMgPSBbXVxuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQuYWRkRXZlbnRMaXN0ZW5lcihjYWxsYmFjaylcbiAgICB9LFxuICAgIG9mZkNhbWVyYU1vdmVTdGFydChjYWxsYmFjazogYW55KSB7XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLm1vdmVTdGFydC5yZW1vdmVFdmVudExpc3RlbmVyKGNhbGxiYWNrKVxuICAgIH0sXG4gICAgb25DYW1lcmFNb3ZlRW5kKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIGNvbnN0IHRpbWVvdXRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy50aW1lb3V0SWRzLnB1c2goXG4gICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgIH0sIDMwMClcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5tb3ZlRW5kLmFkZEV2ZW50TGlzdGVuZXIodGltZW91dENhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLm1vdmVFbmQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjYWxsYmFjaylcbiAgICB9LFxuICAgIGRvUGFuWm9vbShjb29yZHM6IGFueSkge1xuICAgICAgaWYgKGNvb3Jkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBjYXJ0QXJyYXkgPSBjb29yZHMubWFwKChjb29yZDogYW55KSA9PlxuICAgICAgICBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICAgIGNvb3JkWzBdLFxuICAgICAgICAgIGNvb3JkWzFdLFxuICAgICAgICAgIG1hcC5jYW1lcmEuX3Bvc2l0aW9uQ2FydG9ncmFwaGljLmhlaWdodFxuICAgICAgICApXG4gICAgICApXG4gICAgICBpZiAoY2FydEFycmF5Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBjb25zdCBwb2ludCA9IENlc2l1bS5FbGxpcHNvaWQuV0dTODQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oXG4gICAgICAgICAgY2FydEFycmF5WzBdXG4gICAgICAgIClcbiAgICAgICAgdGhpcy5wYW5Ub0Nvb3JkaW5hdGUocG9pbnQsIDIuMClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlY3RhbmdsZSA9IENlc2l1bS5SZWN0YW5nbGUuZnJvbUNhcnRvZ3JhcGhpY0FycmF5KGNhcnRBcnJheSlcbiAgICAgICAgdGhpcy5wYW5Ub1JlY3RhbmdsZShyZWN0YW5nbGUsIHtcbiAgICAgICAgICBkdXJhdGlvbjogMi4wLFxuICAgICAgICAgIGNvcnJlY3Rpb246IDEuMCxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LFxuICAgIHBhblRvUmVzdWx0cyhyZXN1bHRzOiBhbnkpIHtcbiAgICAgIGxldCByZWN0YW5nbGUsIGNhcnRBcnJheSwgcG9pbnRcbiAgICAgIGNhcnRBcnJheSA9IF8uZmxhdHRlbihcbiAgICAgICAgcmVzdWx0c1xuICAgICAgICAgIC5maWx0ZXIoKHJlc3VsdDogYW55KSA9PiByZXN1bHQuaGFzR2VvbWV0cnkoKSlcbiAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgKHJlc3VsdDogYW55KSA9PlxuICAgICAgICAgICAgICBfLm1hcChyZXN1bHQuZ2V0UG9pbnRzKCdsb2NhdGlvbicpLCAoY29vcmRpbmF0ZSkgPT5cbiAgICAgICAgICAgICAgICBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZVswXSxcbiAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVbMV0sXG4gICAgICAgICAgICAgICAgICBtYXAuY2FtZXJhLl9wb3NpdGlvbkNhcnRvZ3JhcGhpYy5oZWlnaHRcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICAgKVxuICAgICAgKVxuICAgICAgaWYgKGNhcnRBcnJheS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChjYXJ0QXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcG9pbnQgPSBDZXNpdW0uRWxsaXBzb2lkLldHUzg0LmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKGNhcnRBcnJheVswXSlcbiAgICAgICAgICB0aGlzLnBhblRvQ29vcmRpbmF0ZShwb2ludClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWN0YW5nbGUgPSBDZXNpdW0uUmVjdGFuZ2xlLmZyb21DYXJ0b2dyYXBoaWNBcnJheShjYXJ0QXJyYXkpXG4gICAgICAgICAgdGhpcy5wYW5Ub1JlY3RhbmdsZShyZWN0YW5nbGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHBhblRvQ29vcmRpbmF0ZShjb29yZHM6IGFueSwgZHVyYXRpb24gPSAwLjUpIHtcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEuZmx5VG8oe1xuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZGVzdGluYXRpb246IGNvb3JkcyxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwYW5Ub0V4dGVudCgpIHt9LFxuICAgIHBhblRvU2hhcGVzRXh0ZW50KHtcbiAgICAgIGR1cmF0aW9uID0gNTAwLFxuICAgIH06IHtcbiAgICAgIGR1cmF0aW9uPzogbnVtYmVyIC8vIHRha2UgaW4gbWlsbGlzZWNvbmRzIGZvciBub3JtYWxpemF0aW9uIHdpdGggb3BlbmxheWVycyBkdXJhdGlvbiBiZWluZyBtaWxsaXNlY29uZHNcbiAgICB9ID0ge30pIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRQcmltaXRpdmVzID0gbWFwLnNjZW5lLnByaW1pdGl2ZXMuX3ByaW1pdGl2ZXMuZmlsdGVyKFxuICAgICAgICAocHJpbTogYW55KSA9PiBwcmltLmlkXG4gICAgICApXG4gICAgICBjb25zdCBhY3R1YWxQb3NpdGlvbnMgPSBjdXJyZW50UHJpbWl0aXZlcy5yZWR1Y2UoXG4gICAgICAgIChibG9iOiBhbnksIHByaW06IGFueSkgPT4ge1xuICAgICAgICAgIHJldHVybiBibG9iLmNvbmNhdChcbiAgICAgICAgICAgIHByaW0uX3BvbHlsaW5lcy5yZWR1Y2UoKHN1YmJsb2I6IGFueSwgcG9seWxpbmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gc3ViYmxvYi5jb25jYXQocG9seWxpbmUuX2FjdHVhbFBvc2l0aW9ucylcbiAgICAgICAgICAgIH0sIFtdKVxuICAgICAgICAgIClcbiAgICAgICAgfSxcbiAgICAgICAgW11cbiAgICAgIClcbiAgICAgIGlmIChhY3R1YWxQb3NpdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBtYXAuc2NlbmUuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gLyAxMDAwLCAvLyBjaGFuZ2UgdG8gc2Vjb25kc1xuICAgICAgICAgIGRlc3RpbmF0aW9uOiBDZXNpdW0uUmVjdGFuZ2xlLmZyb21DYXJ0ZXNpYW5BcnJheShhY3R1YWxQb3NpdGlvbnMpLFxuICAgICAgICAgIG9yaWVudGF0aW9uOiBMb29raW5nU3RyYWlnaHREb3duT3JpZW50YXRpb24sXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuICAgIGdldENlbnRlclBvc2l0aW9uT2ZQcmltaXRpdmVJZHMocHJpbWl0aXZlSWRzOiBzdHJpbmdbXSkge1xuICAgICAgY29uc3QgcHJpbWl0aXZlcyA9IG1hcC5zY2VuZS5wcmltaXRpdmVzXG4gICAgICBsZXQgcG9zaXRpb25zID0gW10gYXMgYW55W11cblxuICAgICAgLy8gSXRlcmF0ZSBvdmVyIHByaW1pdGl2ZXMgYW5kIGNvbXB1dGUgYm91bmRpbmcgc3BoZXJlc1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmltaXRpdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBwcmltaXRpdmUgPSBwcmltaXRpdmVzLmdldChpKVxuICAgICAgICBpZiAocHJpbWl0aXZlSWRzLmluY2x1ZGVzKHByaW1pdGl2ZS5pZCkpIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHByaW1pdGl2ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgbGV0IHBvaW50ID0gcHJpbWl0aXZlLmdldChqKVxuICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChwb2ludC5wb3NpdGlvbnMpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBib3VuZGluZ1NwaGVyZSA9IENlc2l1bS5Cb3VuZGluZ1NwaGVyZS5mcm9tUG9pbnRzKHBvc2l0aW9ucylcblxuICAgICAgaWYgKFxuICAgICAgICBDZXNpdW0uQm91bmRpbmdTcGhlcmUuZXF1YWxzKFxuICAgICAgICAgIGJvdW5kaW5nU3BoZXJlLFxuICAgICAgICAgIENlc2l1bS5Cb3VuZGluZ1NwaGVyZS5mcm9tUG9pbnRzKFtdKSAvLyBlbXB0eVxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBwb3NpdGlvbnMgdG8gem9vbSB0bycpXG4gICAgICB9XG5cbiAgICAgIC8vIGhlcmUsIG5vdGljZSB3ZSB1c2UgZmx5VG8gaW5zdGVhZCBvZiBmbHlUb0JvdW5kaW5nU3BoZXJlLCBhcyB3aXRoIHRoZSBsYXR0ZXIgdGhlIG9yaWVudGF0aW9uIGNhbid0IGJlIGNvbnRyb2xsZWQgaW4gdGhpcyB2ZXJzaW9uIGFuZCBlbmRzIHVwIHRpbHRlZFxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBwb3NpdGlvbiBhYm92ZSB0aGUgY2VudGVyIG9mIHRoZSBib3VuZGluZyBzcGhlcmVcbiAgICAgIGxldCByYWRpdXMgPSBib3VuZGluZ1NwaGVyZS5yYWRpdXNcbiAgICAgIGxldCBjZW50ZXIgPSBib3VuZGluZ1NwaGVyZS5jZW50ZXJcbiAgICAgIGxldCB1cCA9IENlc2l1bS5DYXJ0ZXNpYW4zLmNsb25lKGNlbnRlcikgLy8gR2V0IHRoZSB1cCBkaXJlY3Rpb24gZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBFYXJ0aCB0byB0aGUgcG9zaXRpb25cbiAgICAgIENlc2l1bS5DYXJ0ZXNpYW4zLm5vcm1hbGl6ZSh1cCwgdXApXG5cbiAgICAgIGxldCBwb3NpdGlvbiA9IENlc2l1bS5DYXJ0ZXNpYW4zLm11bHRpcGx5QnlTY2FsYXIoXG4gICAgICAgIHVwLFxuICAgICAgICByYWRpdXMgKiAyLFxuICAgICAgICBuZXcgQ2VzaXVtLkNhcnRlc2lhbjMoKVxuICAgICAgKSAvLyBBZGp1c3QgbXVsdGlwbGllciBmb3IgZGVzaXJlZCBhbHRpdHVkZVxuICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuYWRkKGNlbnRlciwgcG9zaXRpb24sIHBvc2l0aW9uKSAvLyBNb3ZlIHBvc2l0aW9uIGFib3ZlIHRoZSBjZW50ZXJcblxuICAgICAgcmV0dXJuIHBvc2l0aW9uXG4gICAgfSxcbiAgICB6b29tVG9JZHMoe1xuICAgICAgaWRzLFxuICAgICAgZHVyYXRpb24gPSA1MDAsXG4gICAgfToge1xuICAgICAgaWRzOiBzdHJpbmdbXVxuICAgICAgZHVyYXRpb24/OiBudW1iZXIgLy8gdGFrZSBpbiBtaWxsaXNlY29uZHMgZm9yIG5vcm1hbGl6YXRpb24gd2l0aCBvcGVubGF5ZXJzIGR1cmF0aW9uIGJlaW5nIG1pbGxpc2Vjb25kc1xuICAgIH0pIHtcbiAgICAgIC8vIHVzZSBmbHlUbyBpbnN0ZWFkIG9mIGZseVRvQm91bmRpbmdTcGhlcmUsIGFzIHdpdGggdGhlIGxhdHRlciB0aGUgb3JpZW50YXRpb24gY2FuJ3QgYmUgY29udHJvbGxlZCBpbiB0aGlzIHZlcnNpb24gYW5kIGl0IGVuZHMgdXAgdGlsdGVkXG4gICAgICBtYXAuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgZGVzdGluYXRpb246IHRoaXMuZ2V0Q2VudGVyUG9zaXRpb25PZlByaW1pdGl2ZUlkcyhpZHMpLFxuICAgICAgICBvcmllbnRhdGlvbjogTG9va2luZ1N0cmFpZ2h0RG93bk9yaWVudGF0aW9uLFxuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gLyAxMDAwLCAvLyBjaGFuZ2UgdG8gc2Vjb25kc1xuICAgICAgfSlcbiAgICB9LFxuICAgIHBhblRvUmVjdGFuZ2xlKFxuICAgICAgcmVjdGFuZ2xlOiBhbnksXG4gICAgICBvcHRzID0ge1xuICAgICAgICBkdXJhdGlvbjogMC41LFxuICAgICAgICBjb3JyZWN0aW9uOiAwLjI1LFxuICAgICAgfVxuICAgICkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgIGR1cmF0aW9uOiBvcHRzLmR1cmF0aW9uLFxuICAgICAgICBkZXN0aW5hdGlvbjogZ2V0RGVzdGluYXRpb25Gb3JWaXNpYmxlUGFuKHJlY3RhbmdsZSwgbWFwKSxcbiAgICAgICAgY29tcGxldGUoKSB7XG4gICAgICAgICAgbWFwLnNjZW5lLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgICAgICBkdXJhdGlvbjogb3B0cy5jb3JyZWN0aW9uLFxuICAgICAgICAgICAgZGVzdGluYXRpb246IGdldERlc3RpbmF0aW9uRm9yVmlzaWJsZVBhbihyZWN0YW5nbGUsIG1hcCksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRTaGFwZXMoKSB7XG4gICAgICByZXR1cm4gc2hhcGVzXG4gICAgfSxcbiAgICB6b29tVG9FeHRlbnQoKSB7fSxcbiAgICB6b29tVG9Cb3VuZGluZ0JveCh7IG5vcnRoLCBzb3V0aCwgZWFzdCwgd2VzdCB9OiBhbnkpIHtcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEuZmx5VG8oe1xuICAgICAgICBkdXJhdGlvbjogMC41LFxuICAgICAgICBkZXN0aW5hdGlvbjogQ2VzaXVtLlJlY3RhbmdsZS5mcm9tRGVncmVlcyh3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGgpLFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdldEJvdW5kaW5nQm94KCkge1xuICAgICAgY29uc3Qgdmlld1JlY3RhbmdsZSA9IG1hcC5zY2VuZS5jYW1lcmEuY29tcHV0ZVZpZXdSZWN0YW5nbGUoKVxuICAgICAgcmV0dXJuIF8ubWFwT2JqZWN0KHZpZXdSZWN0YW5nbGUsICh2YWwpID0+IENlc2l1bS5NYXRoLnRvRGVncmVlcyh2YWwpKVxuICAgIH0sXG4gICAgb3ZlcmxheUltYWdlKG1vZGVsOiBMYXp5UXVlcnlSZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1ldGFjYXJkSWQgPSBtb2RlbC5wbGFpbi5pZFxuICAgICAgdGhpcy5yZW1vdmVPdmVybGF5KG1ldGFjYXJkSWQpXG4gICAgICBjb25zdCBjb29yZHMgPSBtb2RlbC5nZXRQb2ludHMoJ2xvY2F0aW9uJylcbiAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpY3MgPSBfLm1hcChjb29yZHMsIChjb29yZCkgPT4ge1xuICAgICAgICBjb29yZCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmQpXG4gICAgICAgIHJldHVybiBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICAgIGNvb3JkLmxvbmdpdHVkZSxcbiAgICAgICAgICBjb29yZC5sYXRpdHVkZSxcbiAgICAgICAgICBjb29yZC5hbHRpdHVkZVxuICAgICAgICApXG4gICAgICB9KVxuICAgICAgY29uc3QgcmVjdGFuZ2xlID0gQ2VzaXVtLlJlY3RhbmdsZS5mcm9tQ2FydG9ncmFwaGljQXJyYXkoY2FydG9ncmFwaGljcylcbiAgICAgIGNvbnN0IG92ZXJsYXlMYXllciA9IG1hcC5zY2VuZS5pbWFnZXJ5TGF5ZXJzLmFkZEltYWdlcnlQcm92aWRlcihcbiAgICAgICAgbmV3IENlc2l1bS5TaW5nbGVUaWxlSW1hZ2VyeVByb3ZpZGVyKHtcbiAgICAgICAgICB1cmw6IG1vZGVsLmN1cnJlbnRPdmVybGF5VXJsLFxuICAgICAgICAgIHJlY3RhbmdsZSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgb3ZlcmxheXNbbWV0YWNhcmRJZF0gPSBvdmVybGF5TGF5ZXJcbiAgICB9LFxuICAgIHJlbW92ZU92ZXJsYXkobWV0YWNhcmRJZDogYW55KSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIGlmIChvdmVybGF5c1ttZXRhY2FyZElkXSkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbWFwLnNjZW5lLmltYWdlcnlMYXllcnMucmVtb3ZlKG92ZXJsYXlzW21ldGFjYXJkSWRdKVxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgZGVsZXRlIG92ZXJsYXlzW21ldGFjYXJkSWRdXG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVBbGxPdmVybGF5cygpIHtcbiAgICAgIGZvciAoY29uc3Qgb3ZlcmxheSBpbiBvdmVybGF5cykge1xuICAgICAgICBpZiAob3ZlcmxheXMuaGFzT3duUHJvcGVydHkob3ZlcmxheSkpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICBtYXAuc2NlbmUuaW1hZ2VyeUxheWVycy5yZW1vdmUob3ZlcmxheXNbb3ZlcmxheV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG92ZXJsYXlzID0ge31cbiAgICB9LFxuICAgIGdldENhcnRvZ3JhcGhpY0NlbnRlck9mQ2x1c3RlckluRGVncmVlcyhjbHVzdGVyOiBDbHVzdGVyVHlwZSkge1xuICAgICAgcmV0dXJuIHV0aWxpdHkuY2FsY3VsYXRlQ2FydG9ncmFwaGljQ2VudGVyT2ZHZW9tZXRyaWVzSW5EZWdyZWVzKFxuICAgICAgICBjbHVzdGVyLnJlc3VsdHNcbiAgICAgIClcbiAgICB9LFxuICAgIGdldFdpbmRvd0xvY2F0aW9uc09mUmVzdWx0cyhyZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXSkge1xuICAgICAgbGV0IG9jY2x1ZGVyOiBhbnlcbiAgICAgIGlmIChtYXAuc2NlbmUubW9kZSA9PT0gQ2VzaXVtLlNjZW5lTW9kZS5TQ0VORTNEKSB7XG4gICAgICAgIG9jY2x1ZGVyID0gbmV3IENlc2l1bS5FbGxpcHNvaWRhbE9jY2x1ZGVyKFxuICAgICAgICAgIENlc2l1bS5FbGxpcHNvaWQuV0dTODQsXG4gICAgICAgICAgbWFwLnNjZW5lLmNhbWVyYS5wb3NpdGlvblxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4ge1xuICAgICAgICBjb25zdCBjYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeSA9XG4gICAgICAgICAgdXRpbGl0eS5jYWxjdWxhdGVDYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeShyZXN1bHQpXG4gICAgICAgIGlmIChvY2NsdWRlciAmJiBpc05vdFZpc2libGUoY2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnksIG9jY2x1ZGVyKSkge1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjZW50ZXIgPSB1dGlsaXR5LmNhbGN1bGF0ZVdpbmRvd0NlbnRlck9mR2VvbWV0cnkoXG4gICAgICAgICAgY2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnksXG4gICAgICAgICAgbWFwXG4gICAgICAgIClcbiAgICAgICAgaWYgKGNlbnRlcikge1xuICAgICAgICAgIHJldHVybiBbY2VudGVyLngsIGNlbnRlci55XVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICAgIC8qXG4gICAgICogRHJhd3MgYSBtYXJrZXIgb24gdGhlIG1hcCBkZXNpZ25hdGluZyBhIHN0YXJ0L2VuZCBwb2ludCBmb3IgdGhlIHJ1bGVyIG1lYXN1cmVtZW50LiBUaGUgZ2l2ZW5cbiAgICAgKiBjb29yZGluYXRlcyBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggJ2xhdCcgYW5kICdsb24nIGtleXMgd2l0aCBkZWdyZWVzIHZhbHVlcy4gVGhlIGdpdmVuXG4gICAgICogbWFya2VyIGxhYmVsIHNob3VsZCBiZSBhIHNpbmdsZSBjaGFyYWN0ZXIgb3IgZGlnaXQgdGhhdCBpcyBkaXNwbGF5ZWQgb24gdGhlIG1hcCBtYXJrZXIuXG4gICAgICovXG4gICAgYWRkUnVsZXJQb2ludChjb29yZGluYXRlczogYW55KSB7XG4gICAgICBjb25zdCB7IGxhdCwgbG9uIH0gPSBjb29yZGluYXRlc1xuICAgICAgLy8gYSBwb2ludCByZXF1aXJlcyBhbiBhbHRpdHVkZSB2YWx1ZSBzbyBqdXN0IHVzZSAwXG4gICAgICBjb25zdCBwb2ludCA9IFtsb24sIGxhdCwgMF1cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGlkOiAnICcsXG4gICAgICAgIHRpdGxlOiBgU2VsZWN0ZWQgcnVsZXIgY29vcmRpbmF0ZWAsXG4gICAgICAgIGltYWdlOiBEcmF3aW5nVXRpbGl0eS5nZXRDaXJjbGUoe1xuICAgICAgICAgIGZpbGxDb2xvcjogcnVsZXJQb2ludENvbG9yLFxuICAgICAgICAgIGljb246IG51bGwsXG4gICAgICAgIH0pLFxuICAgICAgICB2aWV3OiB0aGlzLFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYWRkUG9pbnQocG9pbnQsIG9wdGlvbnMpXG4gICAgfSxcbiAgICAvKlxuICAgICAqIFJlbW92ZXMgdGhlIGdpdmVuIEJpbGxib2FyZCBmcm9tIHRoZSBtYXAuXG4gICAgICovXG4gICAgcmVtb3ZlUnVsZXJQb2ludChiaWxsYm9hcmRSZWY6IGFueSkge1xuICAgICAgYmlsbGJvYXJkQ29sbGVjdGlvbi5yZW1vdmUoYmlsbGJvYXJkUmVmKVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBEcmF3cyBhIGxpbmUgb24gdGhlIG1hcCBiZXR3ZWVuIHRoZSBwb2ludHMgaW4gdGhlIGdpdmVuIGFycmF5IG9mIHBvaW50cy5cbiAgICAgKi9cbiAgICBhZGRSdWxlckxpbmUocG9pbnQ6IGFueSkge1xuICAgICAgbGV0IHN0YXJ0aW5nQ29vcmRpbmF0ZXMgPSBtYXBNb2RlbC5nZXQoJ3N0YXJ0aW5nQ29vcmRpbmF0ZXMnKVxuICAgICAgLy8gY3JlYXRlcyBhbiBhcnJheSBvZiBDYXJ0ZXNpYW4zIHBvaW50c1xuICAgICAgLy8gYSBQb2x5bGluZUdlb21ldHJ5IGFsbG93cyB0aGUgbGluZSB0byBmb2xsb3cgdGhlIGN1cnZhdHVyZSBvZiB0aGUgc3VyZmFjZVxuICAgICAgbWFwLmNvb3JkQXJyYXkgPSBbXG4gICAgICAgIHN0YXJ0aW5nQ29vcmRpbmF0ZXNbJ2xvbiddLFxuICAgICAgICBzdGFydGluZ0Nvb3JkaW5hdGVzWydsYXQnXSxcbiAgICAgICAgcnVsZXJMaW5lSGVpZ2h0LFxuICAgICAgICBwb2ludFsnbG9uJ10sXG4gICAgICAgIHBvaW50WydsYXQnXSxcbiAgICAgICAgcnVsZXJMaW5lSGVpZ2h0LFxuICAgICAgXVxuICAgICAgcmV0dXJuIG1hcC5lbnRpdGllcy5hZGQoe1xuICAgICAgICBwb2x5bGluZToge1xuICAgICAgICAgIHBvc2l0aW9uczogbmV3IENlc2l1bS5DYWxsYmFja1Byb3BlcnR5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBDZXNpdW0uQ2FydGVzaWFuMy5mcm9tRGVncmVlc0FycmF5SGVpZ2h0cyhtYXAuY29vcmRBcnJheSlcbiAgICAgICAgICB9LCBmYWxzZSksXG4gICAgICAgICAgd2lkdGg6IDUsXG4gICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICBtYXRlcmlhbDogcnVsZXJDb2xvcixcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICAvKlxuICAgICAqIFVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHJ1bGVyIGxpbmVcbiAgICAgKi9cbiAgICBzZXRSdWxlckxpbmUocG9pbnQ6IGFueSkge1xuICAgICAgbGV0IHN0YXJ0aW5nQ29vcmRpbmF0ZXMgPSBtYXBNb2RlbC5nZXQoJ3N0YXJ0aW5nQ29vcmRpbmF0ZXMnKVxuICAgICAgbWFwLmNvb3JkQXJyYXkgPSBbXG4gICAgICAgIHN0YXJ0aW5nQ29vcmRpbmF0ZXNbJ2xvbiddLFxuICAgICAgICBzdGFydGluZ0Nvb3JkaW5hdGVzWydsYXQnXSxcbiAgICAgICAgcnVsZXJMaW5lSGVpZ2h0LFxuICAgICAgICBwb2ludFsnbG9uJ10sXG4gICAgICAgIHBvaW50WydsYXQnXSxcbiAgICAgICAgcnVsZXJMaW5lSGVpZ2h0LFxuICAgICAgXVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBSZW1vdmVzIHRoZSBnaXZlbiBwb2x5bGluZSBlbnRpdHkgZnJvbSB0aGUgbWFwLlxuICAgICAqL1xuICAgIHJlbW92ZVJ1bGVyTGluZShwb2x5bGluZTogYW55KSB7XG4gICAgICBtYXAuZW50aXRpZXMucmVtb3ZlKHBvbHlsaW5lKVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgICBBZGRzIGEgYmlsbGJvYXJkIHBvaW50IHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZCwgYW5kIGEgY29sb3IuXG4gICAgICAgICAgICAgICovXG4gICAgYWRkUG9pbnRXaXRoVGV4dChwb2ludDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvaW50T2JqZWN0ID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludClcbiAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpY1Bvc2l0aW9uID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgcG9pbnRPYmplY3QubG9uZ2l0dWRlLFxuICAgICAgICBwb2ludE9iamVjdC5sYXRpdHVkZSxcbiAgICAgICAgcG9pbnRPYmplY3QuYWx0aXR1ZGVcbiAgICAgIClcbiAgICAgIGxldCBjYXJ0ZXNpYW5Qb3NpdGlvbiA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oY2FydG9ncmFwaGljUG9zaXRpb24pXG4gICAgICBjb25zdCBiaWxsYm9hcmRSZWYgPSBiaWxsYm9hcmRDb2xsZWN0aW9uLmFkZCh7XG4gICAgICAgIGltYWdlOiB1bmRlZmluZWQsXG4gICAgICAgIHBvc2l0aW9uOiBjYXJ0ZXNpYW5Qb3NpdGlvbixcbiAgICAgICAgaWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIGV5ZU9mZnNldCxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYudW5zZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi5wYXJ0aWFsbHlTZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICBzdHJva2VDb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi5zZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICBmaWxsQ29sb3I6ICdvcmFuZ2UnLFxuICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBzd2l0Y2ggKG9wdGlvbnMuaXNTZWxlY3RlZCkge1xuICAgICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgICAgYmlsbGJvYXJkUmVmLmltYWdlID0gYmlsbGJvYXJkUmVmLnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdwYXJ0aWFsbHknOlxuICAgICAgICAgIGJpbGxib2FyZFJlZi5pbWFnZSA9IGJpbGxib2FyZFJlZi5wYXJ0aWFsbHlTZWxlY3RlZEltYWdlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAndW5zZWxlY3RlZCc6XG4gICAgICAgICAgYmlsbGJvYXJkUmVmLmltYWdlID0gYmlsbGJvYXJkUmVmLnVuc2VsZWN0ZWRJbWFnZVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICAvL2lmIHRoZXJlIGlzIGEgdGVycmFpbiBwcm92aWRlciBhbmQgbm8gYWx0aXR1ZGUgaGFzIGJlZW4gc3BlY2lmaWVkLCBzYW1wbGUgaXQgZnJvbSB0aGUgY29uZmlndXJlZCB0ZXJyYWluIHByb3ZpZGVyXG4gICAgICBpZiAoIXBvaW50T2JqZWN0LmFsdGl0dWRlICYmIG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IENlc2l1bS5zYW1wbGVUZXJyYWluKG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIsIDUsIFtcbiAgICAgICAgICBjYXJ0b2dyYXBoaWNQb3NpdGlvbixcbiAgICAgICAgXSlcbiAgICAgICAgQ2VzaXVtLndoZW4ocHJvbWlzZSwgKHVwZGF0ZWRDYXJ0b2dyYXBoaWM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmICh1cGRhdGVkQ2FydG9ncmFwaGljWzBdLmhlaWdodCAmJiAhb3B0aW9ucy52aWV3LmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICBjYXJ0ZXNpYW5Qb3NpdGlvbiA9XG4gICAgICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oXG4gICAgICAgICAgICAgICAgdXBkYXRlZENhcnRvZ3JhcGhpY1swXVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICBiaWxsYm9hcmRSZWYucG9zaXRpb24gPSBjYXJ0ZXNpYW5Qb3NpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICAgIHJldHVybiBiaWxsYm9hcmRSZWZcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBiaWxsYm9hcmQgcG9pbnQgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZCwgYW5kIGEgY29sb3IuXG4gICAgICAgICAgICAgICovXG4gICAgYWRkUG9pbnQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBjYXJ0b2dyYXBoaWNQb3NpdGlvbiA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgIHBvaW50T2JqZWN0LmxvbmdpdHVkZSxcbiAgICAgICAgcG9pbnRPYmplY3QubGF0aXR1ZGUsXG4gICAgICAgIHBvaW50T2JqZWN0LmFsdGl0dWRlXG4gICAgICApXG4gICAgICBjb25zdCBjYXJ0ZXNpYW5Qb3NpdGlvbiA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oY2FydG9ncmFwaGljUG9zaXRpb24pXG4gICAgICBjb25zdCBiaWxsYm9hcmRSZWYgPSBiaWxsYm9hcmRDb2xsZWN0aW9uLmFkZCh7XG4gICAgICAgIGltYWdlOiB1bmRlZmluZWQsXG4gICAgICAgIHBvc2l0aW9uOiBjYXJ0ZXNpYW5Qb3NpdGlvbixcbiAgICAgICAgaWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIGV5ZU9mZnNldCxcbiAgICAgICAgcGl4ZWxPZmZzZXQsXG4gICAgICAgIHZlcnRpY2FsT3JpZ2luOiBvcHRpb25zLnVzZVZlcnRpY2FsT3JpZ2luXG4gICAgICAgICAgPyBDZXNpdW0uVmVydGljYWxPcmlnaW4uQk9UVE9NXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGhvcml6b250YWxPcmlnaW46IG9wdGlvbnMudXNlSG9yaXpvbnRhbE9yaWdpblxuICAgICAgICAgID8gQ2VzaXVtLkhvcml6b250YWxPcmlnaW4uQ0VOVEVSXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIHZpZXc6IG9wdGlvbnMudmlldyxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYudW5zZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0UGluKHtcbiAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLnNlbGVjdGVkSW1hZ2UgPSBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICBmaWxsQ29sb3I6ICdvcmFuZ2UnLFxuICAgICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLmltYWdlID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgID8gYmlsbGJvYXJkUmVmLnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgOiBiaWxsYm9hcmRSZWYudW5zZWxlY3RlZEltYWdlXG4gICAgICAvL2lmIHRoZXJlIGlzIGEgdGVycmFpbiBwcm92aWRlciBhbmQgbm8gYWx0aXR1ZGUgaGFzIGJlZW4gc3BlY2lmaWVkLCBzYW1wbGUgaXQgZnJvbSB0aGUgY29uZmlndXJlZCB0ZXJyYWluIHByb3ZpZGVyXG4gICAgICBpZiAoIXBvaW50T2JqZWN0LmFsdGl0dWRlICYmIG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IENlc2l1bS5zYW1wbGVUZXJyYWluKG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIsIDUsIFtcbiAgICAgICAgICBjYXJ0b2dyYXBoaWNQb3NpdGlvbixcbiAgICAgICAgXSlcbiAgICAgICAgQ2VzaXVtLndoZW4ocHJvbWlzZSwgKHVwZGF0ZWRDYXJ0b2dyYXBoaWM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmICh1cGRhdGVkQ2FydG9ncmFwaGljWzBdLmhlaWdodCAmJiAhb3B0aW9ucy52aWV3LmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICBiaWxsYm9hcmRSZWYucG9zaXRpb24gPVxuICAgICAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRDYXJ0b2dyYXBoaWNbMF1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICAgIHJldHVybiBiaWxsYm9hcmRSZWZcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBsYWJlbCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2ludCBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIGFuIGlkIGFuZCB0ZXh0LlxuICAgICAgICAgICAgKi9cbiAgICBhZGRMYWJlbChwb2ludDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvaW50T2JqZWN0ID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludClcbiAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpY1Bvc2l0aW9uID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgcG9pbnRPYmplY3QubG9uZ2l0dWRlLFxuICAgICAgICBwb2ludE9iamVjdC5sYXRpdHVkZSxcbiAgICAgICAgcG9pbnRPYmplY3QuYWx0aXR1ZGVcbiAgICAgIClcbiAgICAgIGNvbnN0IGNhcnRlc2lhblBvc2l0aW9uID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNUb0NhcnRlc2lhbihjYXJ0b2dyYXBoaWNQb3NpdGlvbilcbiAgICAgIC8vIFgsIFkgb2Zmc2V0IHZhbHVlcyBmb3IgdGhlIGxhYmVsXG4gICAgICBjb25zdCBvZmZzZXQgPSBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMjAsIC0xNSlcbiAgICAgIC8vIENlc2l1bSBtZWFzdXJlbWVudCBmb3IgZGV0ZXJtaW5pbmcgaG93IHRvIHJlbmRlciB0aGUgc2l6ZSBvZiB0aGUgbGFiZWwgYmFzZWQgb24gem9vbVxuICAgICAgY29uc3Qgc2NhbGVab29tID0gbmV3IENlc2l1bS5OZWFyRmFyU2NhbGFyKDEuNWU0LCAxLjAsIDguMGU2LCAwLjApXG4gICAgICAvLyBDZXNpdW0gbWVhc3VyZW1lbnQgZm9yIGRldGVybWluaW5nIGhvdyB0byByZW5kZXIgdGhlIHRyYW5zbHVjZW5jeSBvZiB0aGUgbGFiZWwgYmFzZWQgb24gem9vbVxuICAgICAgY29uc3QgdHJhbnNsdWNlbmN5Wm9vbSA9IG5ldyBDZXNpdW0uTmVhckZhclNjYWxhcigxLjVlNiwgMS4wLCA4LjBlNiwgMC4wKVxuICAgICAgY29uc3QgbGFiZWxSZWYgPSBsYWJlbENvbGxlY3Rpb24uYWRkKHtcbiAgICAgICAgdGV4dDogb3B0aW9ucy50ZXh0LFxuICAgICAgICBwb3NpdGlvbjogY2FydGVzaWFuUG9zaXRpb24sXG4gICAgICAgIGlkOiBvcHRpb25zLmlkLFxuICAgICAgICBwaXhlbE9mZnNldDogb2Zmc2V0LFxuICAgICAgICBzY2FsZTogMS4wLFxuICAgICAgICBzY2FsZUJ5RGlzdGFuY2U6IHNjYWxlWm9vbSxcbiAgICAgICAgdHJhbnNsdWNlbmN5QnlEaXN0YW5jZTogdHJhbnNsdWNlbmN5Wm9vbSxcbiAgICAgICAgZmlsbENvbG9yOiBDZXNpdW0uQ29sb3IuQkxBQ0ssXG4gICAgICAgIG91dGxpbmVDb2xvcjogQ2VzaXVtLkNvbG9yLldISVRFLFxuICAgICAgICBvdXRsaW5lV2lkdGg6IDEwLFxuICAgICAgICBzdHlsZTogQ2VzaXVtLkxhYmVsU3R5bGUuRklMTF9BTkRfT1VUTElORSxcbiAgICAgIH0pXG4gICAgICBtYXBNb2RlbC5hZGRMYWJlbChsYWJlbFJlZilcbiAgICAgIHJldHVybiBsYWJlbFJlZlxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIHBvbHlsaW5lIHV0aWxpemluZyB0aGUgcGFzc2VkIGluIGxpbmUgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZCwgYW5kIGEgY29sb3IuXG4gICAgICAgICAgICAqL1xuICAgIGFkZExpbmUobGluZTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IGxpbmVPYmplY3QgPSBsaW5lLm1hcCgoY29vcmRpbmF0ZTogYW55KSA9PlxuICAgICAgICBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGUpXG4gICAgICApXG4gICAgICBjb25zdCBjYXJ0UG9pbnRzID0gXy5tYXAobGluZU9iamVjdCwgKHBvaW50KSA9PlxuICAgICAgICBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICAgIHBvaW50LmxvbmdpdHVkZSxcbiAgICAgICAgICBwb2ludC5sYXRpdHVkZSxcbiAgICAgICAgICBwb2ludC5hbHRpdHVkZVxuICAgICAgICApXG4gICAgICApXG4gICAgICBjb25zdCBjYXJ0ZXNpYW4gPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY0FycmF5VG9DYXJ0ZXNpYW5BcnJheShjYXJ0UG9pbnRzKVxuICAgICAgY29uc3QgcG9seWxpbmVDb2xsZWN0aW9uID0gbmV3IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24oKVxuICAgICAgcG9seWxpbmVDb2xsZWN0aW9uLnVuc2VsZWN0ZWRNYXRlcmlhbCA9IENlc2l1bS5NYXRlcmlhbC5mcm9tVHlwZShcbiAgICAgICAgJ1BvbHlsaW5lT3V0bGluZScsXG4gICAgICAgIHtcbiAgICAgICAgICBjb2xvcjogZGV0ZXJtaW5lQ2VzaXVtQ29sb3Iob3B0aW9ucy5jb2xvciksXG4gICAgICAgICAgb3V0bGluZUNvbG9yOiBDZXNpdW0uQ29sb3IuV0hJVEUsXG4gICAgICAgICAgb3V0bGluZVdpZHRoOiA0LFxuICAgICAgICB9XG4gICAgICApXG4gICAgICBwb2x5bGluZUNvbGxlY3Rpb24uc2VsZWN0ZWRNYXRlcmlhbCA9IENlc2l1bS5NYXRlcmlhbC5mcm9tVHlwZShcbiAgICAgICAgJ1BvbHlsaW5lT3V0bGluZScsXG4gICAgICAgIHtcbiAgICAgICAgICBjb2xvcjogZGV0ZXJtaW5lQ2VzaXVtQ29sb3Iob3B0aW9ucy5jb2xvciksXG4gICAgICAgICAgb3V0bGluZUNvbG9yOiBDZXNpdW0uQ29sb3IuQkxBQ0ssXG4gICAgICAgICAgb3V0bGluZVdpZHRoOiA0LFxuICAgICAgICB9XG4gICAgICApXG4gICAgICBjb25zdCBwb2x5bGluZSA9IHBvbHlsaW5lQ29sbGVjdGlvbi5hZGQoe1xuICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgbWF0ZXJpYWw6IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gcG9seWxpbmVDb2xsZWN0aW9uLnNlbGVjdGVkTWF0ZXJpYWxcbiAgICAgICAgICA6IHBvbHlsaW5lQ29sbGVjdGlvbi51bnNlbGVjdGVkTWF0ZXJpYWwsXG4gICAgICAgIGlkOiBvcHRpb25zLmlkLFxuICAgICAgICBwb3NpdGlvbnM6IGNhcnRlc2lhbixcbiAgICAgIH0pXG4gICAgICBpZiAobWFwLnNjZW5lLnRlcnJhaW5Qcm92aWRlcikge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gQ2VzaXVtLnNhbXBsZVRlcnJhaW4oXG4gICAgICAgICAgbWFwLnNjZW5lLnRlcnJhaW5Qcm92aWRlcixcbiAgICAgICAgICA1LFxuICAgICAgICAgIGNhcnRQb2ludHNcbiAgICAgICAgKVxuICAgICAgICBDZXNpdW0ud2hlbihwcm9taXNlLCAodXBkYXRlZENhcnRvZ3JhcGhpYzogYW55KSA9PiB7XG4gICAgICAgICAgY29uc3QgcG9zaXRpb25zID1cbiAgICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljQXJyYXlUb0NhcnRlc2lhbkFycmF5KFxuICAgICAgICAgICAgICB1cGRhdGVkQ2FydG9ncmFwaGljXG4gICAgICAgICAgICApXG4gICAgICAgICAgaWYgKHVwZGF0ZWRDYXJ0b2dyYXBoaWNbMF0uaGVpZ2h0ICYmICFvcHRpb25zLnZpZXcuaXNEZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHBvbHlsaW5lLnBvc2l0aW9ucyA9IHBvc2l0aW9uc1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5wcmltaXRpdmVzLmFkZChwb2x5bGluZUNvbGxlY3Rpb24pXG4gICAgICByZXR1cm4gcG9seWxpbmVDb2xsZWN0aW9uXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgcG9seWdvbiBmaWxsIHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvbHlnb24gYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZC5cbiAgICAgICAgICAgICovXG4gICAgYWRkUG9seWdvbihwb2x5Z29uOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgcG9seWdvbk9iamVjdCA9IHBvbHlnb24ubWFwKChjb29yZGluYXRlOiBhbnkpID0+XG4gICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGNhcnRQb2ludHMgPSBfLm1hcChwb2x5Z29uT2JqZWN0LCAocG9pbnQpID0+XG4gICAgICAgIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgICAgcG9pbnQubG9uZ2l0dWRlLFxuICAgICAgICAgIHBvaW50LmxhdGl0dWRlLFxuICAgICAgICAgIHBvaW50LmFsdGl0dWRlXG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIGxldCBjYXJ0ZXNpYW4gPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY0FycmF5VG9DYXJ0ZXNpYW5BcnJheShjYXJ0UG9pbnRzKVxuICAgICAgY29uc3QgdW5zZWxlY3RlZFBvbHlnb25SZWYgPSBtYXAuZW50aXRpZXMuYWRkKHtcbiAgICAgICAgcG9seWdvbjoge1xuICAgICAgICAgIGhpZXJhcmNoeTogY2FydGVzaWFuLFxuICAgICAgICAgIG1hdGVyaWFsOiBuZXcgQ2VzaXVtLkdyaWRNYXRlcmlhbFByb3BlcnR5KHtcbiAgICAgICAgICAgIGNvbG9yOiBDZXNpdW0uQ29sb3IuV0hJVEUsXG4gICAgICAgICAgICBjZWxsQWxwaGE6IDAuMCxcbiAgICAgICAgICAgIGxpbmVDb3VudDogbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDIsIDIpLFxuICAgICAgICAgICAgbGluZVRoaWNrbmVzczogbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDIuMCwgMi4wKSxcbiAgICAgICAgICAgIGxpbmVPZmZzZXQ6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigwLjAsIDAuMCksXG4gICAgICAgICAgfSksXG4gICAgICAgICAgcGVyUG9zaXRpb25IZWlnaHQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgIHJlc3VsdElkOiBvcHRpb25zLmlkLFxuICAgICAgICBzaG93V2hlblNlbGVjdGVkOiBmYWxzZSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBzZWxlY3RlZFBvbHlnb25SZWYgPSBtYXAuZW50aXRpZXMuYWRkKHtcbiAgICAgICAgcG9seWdvbjoge1xuICAgICAgICAgIGhpZXJhcmNoeTogY2FydGVzaWFuLFxuICAgICAgICAgIG1hdGVyaWFsOiBuZXcgQ2VzaXVtLkdyaWRNYXRlcmlhbFByb3BlcnR5KHtcbiAgICAgICAgICAgIGNvbG9yOiBDZXNpdW0uQ29sb3IuQkxBQ0ssXG4gICAgICAgICAgICBjZWxsQWxwaGE6IDAuMCxcbiAgICAgICAgICAgIGxpbmVDb3VudDogbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDIsIDIpLFxuICAgICAgICAgICAgbGluZVRoaWNrbmVzczogbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDIuMCwgMi4wKSxcbiAgICAgICAgICAgIGxpbmVPZmZzZXQ6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigwLjAsIDAuMCksXG4gICAgICAgICAgfSksXG4gICAgICAgICAgcGVyUG9zaXRpb25IZWlnaHQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHNob3c6IGZhbHNlLFxuICAgICAgICByZXN1bHRJZDogb3B0aW9ucy5pZCxcbiAgICAgICAgc2hvd1doZW5TZWxlY3RlZDogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICBpZiAobWFwLnNjZW5lLnRlcnJhaW5Qcm92aWRlcikge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gQ2VzaXVtLnNhbXBsZVRlcnJhaW4oXG4gICAgICAgICAgbWFwLnNjZW5lLnRlcnJhaW5Qcm92aWRlcixcbiAgICAgICAgICA1LFxuICAgICAgICAgIGNhcnRQb2ludHNcbiAgICAgICAgKVxuICAgICAgICBDZXNpdW0ud2hlbihwcm9taXNlLCAodXBkYXRlZENhcnRvZ3JhcGhpYzogYW55KSA9PiB7XG4gICAgICAgICAgY2FydGVzaWFuID1cbiAgICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljQXJyYXlUb0NhcnRlc2lhbkFycmF5KFxuICAgICAgICAgICAgICB1cGRhdGVkQ2FydG9ncmFwaGljXG4gICAgICAgICAgICApXG4gICAgICAgICAgaWYgKHVwZGF0ZWRDYXJ0b2dyYXBoaWNbMF0uaGVpZ2h0ICYmICFvcHRpb25zLnZpZXcuaXNEZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHVuc2VsZWN0ZWRQb2x5Z29uUmVmLnBvbHlnb24uaGllcmFyY2h5LnNldFZhbHVlKGNhcnRlc2lhbilcbiAgICAgICAgICAgIHNlbGVjdGVkUG9seWdvblJlZi5wb2x5Z29uLmhpZXJhcmNoeS5zZXRWYWx1ZShjYXJ0ZXNpYW4pXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgcmV0dXJuIFt1bnNlbGVjdGVkUG9seWdvblJlZiwgc2VsZWN0ZWRQb2x5Z29uUmVmXVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIHJlZmxlY3Qgd2hldGhlciBvciBub3QgaXQgaXMgc2VsZWN0ZWQuXG4gICAgICAgICAgICAgT3B0aW9ucyBwYXNzZWQgaW4gYXJlIGNvbG9yIGFuZCBpc1NlbGVjdGVkLlxuICAgICAgICAgICAgKi9cbiAgICB1cGRhdGVDbHVzdGVyKGdlb21ldHJ5OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVDbHVzdGVyKGlubmVyR2VvbWV0cnksIG9wdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5CaWxsYm9hcmQpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IGdlb21ldHJ5LnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAncGFydGlhbGx5JzpcbiAgICAgICAgICAgIGdlb21ldHJ5LmltYWdlID0gZ2VvbWV0cnkucGFydGlhbGx5U2VsZWN0ZWRJbWFnZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICd1bnNlbGVjdGVkJzpcbiAgICAgICAgICAgIGdlb21ldHJ5LmltYWdlID0gZ2VvbWV0cnkudW5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBvcHRpb25zLmlzU2VsZWN0ZWQgIT09ICd1bnNlbGVjdGVkJ1xuICAgICAgICBnZW9tZXRyeS5leWVPZmZzZXQgPSBuZXcgQ2VzaXVtLkNhcnRlc2lhbjMoMCwgMCwgaXNTZWxlY3RlZCA/IC0xIDogMClcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgZ2VvbWV0cnkuX3BvbHlsaW5lcy5mb3JFYWNoKChwb2x5bGluZTogYW55KSA9PiB7XG4gICAgICAgICAgcG9seWxpbmUubWF0ZXJpYWwgPSBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoJ1BvbHlsaW5lT3V0bGluZScsIHtcbiAgICAgICAgICAgIGNvbG9yOiBkZXRlcm1pbmVDZXNpdW1Db2xvcigncmdiYSgwLDAsMCwgLjEpJyksXG4gICAgICAgICAgICBvdXRsaW5lQ29sb3I6IGRldGVybWluZUNlc2l1bUNvbG9yKCdyZ2JhKDI1NSwyNTUsMjU1LCAuMSknKSxcbiAgICAgICAgICAgIG91dGxpbmVXaWR0aDogNCxcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5zaG93V2hlblNlbGVjdGVkKSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSAhb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIHJlZmxlY3Qgd2hldGhlciBvciBub3QgaXQgaXMgc2VsZWN0ZWQuXG4gICAgICAgICAgICAgIE9wdGlvbnMgcGFzc2VkIGluIGFyZSBjb2xvciBhbmQgaXNTZWxlY3RlZC5cbiAgICAgICAgICAgICAgKi9cbiAgICB1cGRhdGVHZW9tZXRyeShnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgZ2VvbWV0cnkuZm9yRWFjaCgoaW5uZXJHZW9tZXRyeSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlR2VvbWV0cnkoaW5uZXJHZW9tZXRyeSwgb3B0aW9ucylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkJpbGxib2FyZCkge1xuICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gZ2VvbWV0cnkuc2VsZWN0ZWRJbWFnZVxuICAgICAgICAgIDogZ2VvbWV0cnkudW5zZWxlY3RlZEltYWdlXG4gICAgICAgIGdlb21ldHJ5LmV5ZU9mZnNldCA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMyhcbiAgICAgICAgICAwLFxuICAgICAgICAgIDAsXG4gICAgICAgICAgb3B0aW9ucy5pc1NlbGVjdGVkID8gLTEgOiAwXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5MYWJlbCkge1xuICAgICAgICBnZW9tZXRyeS5pc1NlbGVjdGVkID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgIHNob3dIaWRlTGFiZWwoe1xuICAgICAgICAgIGdlb21ldHJ5LFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbikge1xuICAgICAgICBnZW9tZXRyeS5fcG9seWxpbmVzLmZvckVhY2goKHBvbHlsaW5lOiBhbnkpID0+IHtcbiAgICAgICAgICBwb2x5bGluZS5tYXRlcmlhbCA9IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgICAgPyBnZW9tZXRyeS5zZWxlY3RlZE1hdGVyaWFsXG4gICAgICAgICAgICA6IGdlb21ldHJ5LnVuc2VsZWN0ZWRNYXRlcmlhbFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5zaG93V2hlblNlbGVjdGVkKSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSAhb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgaGlkZGVuXG4gICAgICAgICAgICAgKi9cbiAgICBoaWRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgaWYgKFxuICAgICAgICBnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkJpbGxib2FyZCB8fFxuICAgICAgICBnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkxhYmVsXG4gICAgICApIHtcbiAgICAgICAgZ2VvbWV0cnkuc2hvdyA9IGZhbHNlXG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKSB7XG4gICAgICAgIGdlb21ldHJ5Ll9wb2x5bGluZXMuZm9yRWFjaCgocG9seWxpbmU6IGFueSkgPT4ge1xuICAgICAgICAgIHBvbHlsaW5lLnNob3cgPSBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIGJlIHNob3duXG4gICAgICAgICAgICAgKi9cbiAgICBzaG93R2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uQmlsbGJvYXJkKSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uTGFiZWwpIHtcbiAgICAgICAgc2hvd0hpZGVMYWJlbCh7XG4gICAgICAgICAgZ2VvbWV0cnksXG4gICAgICAgICAgZmluZFNlbGVjdGVkOiB0cnVlLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbikge1xuICAgICAgICBnZW9tZXRyeS5fcG9seWxpbmVzLmZvckVhY2goKHBvbHlsaW5lOiBhbnkpID0+IHtcbiAgICAgICAgICBwb2x5bGluZS5zaG93ID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgcmVtb3ZlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgYmlsbGJvYXJkQ29sbGVjdGlvbi5yZW1vdmUoZ2VvbWV0cnkpXG4gICAgICBsYWJlbENvbGxlY3Rpb24ucmVtb3ZlKGdlb21ldHJ5KVxuICAgICAgbWFwLnNjZW5lLnByaW1pdGl2ZXMucmVtb3ZlKGdlb21ldHJ5KVxuICAgICAgLy91bm1pbmlmaWVkIGNlc2l1bSBjaG9rZXMgaWYgeW91IGZlZWQgYSBnZW9tZXRyeSB3aXRoIGlkIGFzIGFuIEFycmF5XG4gICAgICBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5FbnRpdHkpIHtcbiAgICAgICAgbWFwLmVudGl0aWVzLnJlbW92ZShnZW9tZXRyeSlcbiAgICAgIH1cbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkxhYmVsKSB7XG4gICAgICAgIG1hcE1vZGVsLnJlbW92ZUxhYmVsKGdlb21ldHJ5KVxuICAgICAgICBzaG93SGlkZGVuTGFiZWwoZ2VvbWV0cnkpXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICBkZXN0cm95U2hhcGVzKCkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDYpIEZJWE1FOiBQYXJhbWV0ZXIgJ3NoYXBlJyBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlLlxuICAgICAgc2hhcGVzLmZvckVhY2goKHNoYXBlKSA9PiB7XG4gICAgICAgIHNoYXBlLmRlc3Ryb3koKVxuICAgICAgfSlcbiAgICAgIHNoYXBlcyA9IFtdXG4gICAgICBpZiAobWFwICYmIG1hcC5zY2VuZSkge1xuICAgICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRNYXAoKSB7XG4gICAgICByZXR1cm4gbWFwXG4gICAgfSxcbiAgICB6b29tSW4oKSB7XG4gICAgICBjb25zdCBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpYyA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoXG4gICAgICAgICAgbWFwLnNjZW5lLmNhbWVyYS5wb3NpdGlvblxuICAgICAgICApXG5cbiAgICAgIGNvbnN0IHRlcnJhaW5IZWlnaHQgPSBtYXAuc2NlbmUuZ2xvYmUuZ2V0SGVpZ2h0KFxuICAgICAgICBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpY1xuICAgICAgKVxuXG4gICAgICBjb25zdCBoZWlnaHRBYm92ZUdyb3VuZCA9XG4gICAgICAgIGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljLmhlaWdodCAtIHRlcnJhaW5IZWlnaHRcblxuICAgICAgY29uc3Qgem9vbUFtb3VudCA9IGhlaWdodEFib3ZlR3JvdW5kIC8gMiAvLyBiYXNpY2FsbHkgZG91YmxlIHRoZSBjdXJyZW50IHpvb21cblxuICAgICAgY29uc3QgbWF4Wm9vbUFtb3VudCA9IGhlaWdodEFib3ZlR3JvdW5kIC0gbWluaW11bUhlaWdodEFib3ZlVGVycmFpblxuXG4gICAgICAvLyBpZiB0aGUgem9vbSBhbW91bnQgaXMgZ3JlYXRlciB0aGFuIHRoZSBtYXggem9vbSBhbW91bnQsIHpvb20gdG8gdGhlIG1heCB6b29tIGFtb3VudFxuICAgICAgbWFwLnNjZW5lLmNhbWVyYS56b29tSW4oTWF0aC5taW4obWF4Wm9vbUFtb3VudCwgem9vbUFtb3VudCkpXG4gICAgfSxcbiAgICB6b29tT3V0KCkge1xuICAgICAgY29uc3QgY2FtZXJhUG9zaXRpb25DYXJ0b2dyYXBoaWMgPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKFxuICAgICAgICAgIG1hcC5zY2VuZS5jYW1lcmEucG9zaXRpb25cbiAgICAgICAgKVxuXG4gICAgICBjb25zdCB0ZXJyYWluSGVpZ2h0ID0gbWFwLnNjZW5lLmdsb2JlLmdldEhlaWdodChcbiAgICAgICAgY2FtZXJhUG9zaXRpb25DYXJ0b2dyYXBoaWNcbiAgICAgIClcblxuICAgICAgY29uc3QgaGVpZ2h0QWJvdmVHcm91bmQgPVxuICAgICAgICBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpYy5oZWlnaHQgLSB0ZXJyYWluSGVpZ2h0XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLnpvb21PdXQoaGVpZ2h0QWJvdmVHcm91bmQpXG4gICAgfSxcbiAgICBkZXN0cm95KCkge1xuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQub2ZmKCdtYXA6cmVxdWVzdFJlbmRlcicsIHJlcXVlc3RSZW5kZXJIYW5kbGVyKVxuICAgICAgbWFwLmRlc3Ryb3koKVxuICAgIH0sXG4gIH1cbiAgcmV0dXJuIGV4cG9zZWRNZXRob2RzXG59XG4iXX0=