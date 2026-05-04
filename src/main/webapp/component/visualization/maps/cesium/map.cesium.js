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
    heading: 0, // North is up - like compass direction
    pitch: -Cesium.Math.PI_OVER_TWO, // Looking straight down - like a level from up to down
    roll: 0, // No roll - like a level from left to right
};
export default function CesiumMap(insertionElement, selectionInterface, _notificationEl, componentElement, mapModel, mapLayers) {
    var overlays = {};
    var shapes = [];
    var _a = createMap(insertionElement, mapLayers), map = _a.map, requestRenderHandler = _a.requestRenderHandler;
    var drawHelper = new DrawHelper(map);
    map.drawHelper = drawHelper;
    var billboardCollection = setupBillboardCollection();
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
                return _.map(result.getPoints(), function (coordinate) {
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
                    duration: duration / 1000, // change to seconds
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
            if (Array.isArray(geometry)) {
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
            if (Array.isArray(geometry)) {
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
            if (geometry.constructor === Cesium.Billboard) {
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
            else if (geometry.constructor === Cesium.PolylineCollection) {
                geometry._polylines.forEach(function (polyline) {
                    polyline.show = true;
                });
            }
            map.scene.requestRender();
        },
        removeGeometry: function (geometry) {
            billboardCollection.remove(geometry);
            map.scene.primitives.remove(geometry);
            //unminified cesium chokes if you feed a geometry with id as an Array
            if (geometry.constructor === Cesium.Entity) {
                map.entities.remove(geometry);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLmNlc2l1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2Nlc2l1bS9tYXAuY2VzaXVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxjQUFjLE1BQU0sbUJBQW1CLENBQUE7QUFDOUMsT0FBTyxLQUFLLE1BQU0sc0JBQXNCLENBQUE7QUFDeEMsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3JFLE9BQU8sRUFDTCwwQkFBMEIsRUFDMUIsWUFBWSxHQUNiLE1BQU0sMENBQTBDLENBQUE7QUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBR3JELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3ZFLElBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQTtBQUM5QixJQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNoRCxJQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDaEYsSUFBTSxvQkFBb0IsR0FBRywwQkFBMEIsQ0FBQTtBQUN2RCxTQUFTLG9CQUFvQixDQUFDLE1BQVcsRUFBRSxlQUFvQjtJQUM3RCxJQUFJLGVBQWUsSUFBSSxJQUFJLElBQUksZUFBZSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzdELE9BQU8sQ0FBQyxJQUFJLENBQUMsc0dBQzJDLENBQUMsQ0FBQTtRQUN6RCxPQUFNO0lBQ1IsQ0FBQztJQUNPLElBQUEsSUFBSSxHQUF1QixlQUFlLEtBQXRDLEVBQUssYUFBYSxVQUFLLGVBQWUsRUFBNUMsUUFBMEIsQ0FBRixDQUFvQjtJQUNsRCxJQUFNLGVBQWUsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsRCxJQUFJLGVBQWUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNsQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVEQUM0QixJQUFJLDJFQUV4QyxDQUFDLENBQUE7UUFDTixPQUFNO0lBQ1IsQ0FBQztJQUNELElBQU0sNEJBQTRCLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUE7SUFDakUsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUNoRSxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxzREFDMkIsSUFBSSxDQUFDLFNBQVMsWUFDNUMsSUFBSSxNQUFBLElBQ0QsYUFBYSxFQUNoQiw2RUFFTCxDQUFDLENBQUE7UUFDTixNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyw0QkFBNEIsQ0FBQTtJQUM3RCxDQUFDLENBQUMsQ0FBQTtJQUNGLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLHFCQUFxQixDQUFBO0FBQ3RELENBQUM7QUFDRCxTQUFTLFNBQVMsQ0FBQyxnQkFBcUIsRUFBRSxTQUFjO0lBQ3RELElBQU0seUJBQXlCLEdBQUcsSUFBSSxZQUFZLENBQUM7UUFDakQsVUFBVSxFQUFFLFNBQVM7S0FDdEIsQ0FBQyxDQUFBO0lBQ0YsSUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsT0FBTyxDQUFDO1FBQy9DLE9BQU8sRUFBRSxnQkFBZ0I7UUFDekIsYUFBYSxFQUFFO1lBQ2IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTztZQUNuQyxlQUFlLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFDOUMsU0FBUyxFQUFFLEtBQUs7WUFDaEIsZ0JBQWdCLEVBQUUsS0FBSztZQUN2QixRQUFRLEVBQUUsS0FBSztZQUNmLFFBQVEsRUFBRSxLQUFLO1lBQ2YsVUFBVSxFQUFFLEtBQUs7WUFDakIsb0JBQW9CLEVBQUUsS0FBSztZQUMzQixlQUFlLEVBQUUsS0FBSztZQUN0QixrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsZ0JBQWdCO1lBQ2hCLHVCQUF1QjtZQUN2QixlQUFlLEVBQUUsS0FBSztZQUN0QixlQUFlLEVBQUUsS0FBSztZQUN0QixTQUFTLEVBQUUsQ0FBQztTQUNiO0tBQ0YsQ0FBQyxDQUFBO0lBQ0YsSUFBTSxhQUFhLEdBQUc7UUFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtJQUM5QixDQUFDLENBQ0E7SUFBQyxLQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUMzRCwyREFBMkQ7SUFDM0QsTUFBTSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxjQUFjLEdBQUc7UUFDeEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLO1FBQzVCLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSztLQUM3QixDQUFBO0lBQ0QsTUFBTSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQ3ZCLENBQUM7SUFDSCxDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3pDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUN2QixDQUFDO0lBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUMxQyxvQkFBb0IsQ0FDbEIsTUFBTSxFQUNOLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxDQUNwRCxDQUFBO0lBQ0QsT0FBTztRQUNMLEdBQUcsRUFBRSxNQUFNO1FBQ1gsb0JBQW9CLEVBQUUsYUFBYTtLQUNwQyxDQUFBO0FBQ0gsQ0FBQztBQUNELFNBQVMsd0JBQXdCLENBQUMsUUFBYSxFQUFFLEdBQVE7O0lBQ3ZELElBQUksRUFBRSxFQUFFLFVBQVUsQ0FBQTtJQUNsQixJQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUM3QyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ2pCLEVBQUUsR0FBRyxZQUFZLENBQUMsRUFBRSxDQUFBO1FBQ3BCLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNDLEVBQUUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFBO1FBQ2xCLENBQUM7UUFDRCxVQUFVLEdBQUcsTUFBQSxZQUFZLENBQUMsVUFBVSwwQ0FBRSxVQUFVLENBQUE7SUFDbEQsQ0FBQztJQUNELE9BQU8sRUFBRSxFQUFFLElBQUEsRUFBRSxVQUFVLFlBQUEsRUFBRSxDQUFBO0FBQzNCLENBQUM7QUFDRCxTQUFTLGVBQWUsQ0FBQyxTQUFjO0lBQ3JDLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMxQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsRSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNyRSxnQ0FBZ0M7SUFDaEMsSUFBSSxRQUFRLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDbkIsUUFBUSxHQUFHLENBQUMsQ0FBQTtJQUNkLENBQUM7SUFDRCxJQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNwQixTQUFTLEdBQUcsQ0FBQyxDQUFBO0lBQ2YsQ0FBQztJQUNELFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQTtJQUNwRSxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDLENBQUE7SUFDdkUsU0FBUyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxDQUFBO0lBQ3ZFLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQTtJQUNwRSxPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDO0FBQ0QsU0FBUywyQkFBMkIsQ0FBQyxTQUFjLEVBQUUsR0FBUTtJQUMzRCxJQUFJLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNuRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEQsa0JBQWtCO1lBQ2hCLEdBQUcsQ0FBQyxNQUFNLENBQUMsNkJBQTZCLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtJQUNoRSxDQUFDO0lBQ0QsT0FBTyxrQkFBa0IsQ0FBQTtBQUMzQixDQUFDO0FBQ0QsU0FBUyxvQkFBb0IsQ0FBQyxLQUFVO0lBQ3RDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUMxQixDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7UUFDeEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDbkQsQ0FBQztBQUNELFNBQVMsc0JBQXNCLENBQUMsVUFBZTtJQUM3QyxPQUFPO1FBQ0wsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDdkIsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDeEIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7S0FDeEIsQ0FBQTtBQUNILENBQUM7QUFDRCxTQUFTLFlBQVksQ0FBQywwQkFBK0IsRUFBRSxRQUFhO0lBQ2xFLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLDBCQUEwQixDQUFDLENBQUE7QUFDN0QsQ0FBQztBQUVELHdEQUF3RDtBQUN4RCxNQUFNLENBQUMsSUFBTSw4QkFBOEIsR0FBRztJQUM1QyxPQUFPLEVBQUUsQ0FBQyxFQUFFLHVDQUF1QztJQUNuRCxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSx1REFBdUQ7SUFDeEYsSUFBSSxFQUFFLENBQUMsRUFBRSw0Q0FBNEM7Q0FDdEQsQ0FBQTtBQUVELE1BQU0sQ0FBQyxPQUFPLFVBQVUsU0FBUyxDQUMvQixnQkFBcUIsRUFDckIsa0JBQXVCLEVBQ3ZCLGVBQW9CLEVBQ3BCLGdCQUFxQixFQUNyQixRQUFhLEVBQ2IsU0FBYztJQUVkLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQTtJQUNqQixJQUFJLE1BQU0sR0FBUSxFQUFFLENBQUE7SUFDZCxJQUFBLEtBQWdDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsRUFBcEUsR0FBRyxTQUFBLEVBQUUsb0JBQW9CLDBCQUEyQyxDQUFBO0lBQzVFLElBQU0sVUFBVSxHQUFHLElBQUssVUFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUMvQyxHQUFHLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtJQUMzQixJQUFNLG1CQUFtQixHQUFHLHdCQUF3QixFQUFFLENBQUE7SUFDdEQsWUFBWSxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO0lBQ3JDLFNBQVMsd0JBQXdCLENBQUMsUUFBYTtRQUM3QyxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FDeEMsUUFBUSxFQUNSLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDMUIsQ0FBQTtRQUNELElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQzlCLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQy9ELFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQztnQkFDOUIsR0FBRyxFQUFFLFlBQVksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0I7Z0JBQzNELEdBQUcsRUFBRSxZQUFZLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCO2FBQzdELENBQUMsQ0FBQTtRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ04sUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUE7UUFDbEMsQ0FBQztJQUNILENBQUM7SUFDRCxtSkFBbUo7SUFDbkosU0FBUyxZQUFZLENBQUMsR0FBUSxFQUFFLGtCQUF1QjtRQUNyRCxJQUFNLE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3BFLE9BQU8sQ0FBQyxjQUFjLENBQUMsVUFBQyxRQUFhO1lBQ25DLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtZQUM5QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2pELE9BQU07WUFDUixDQUFDO1lBQ0Qsd0JBQXdCLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ2hELENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUNELFNBQVMsd0JBQXdCO1FBQy9CLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtRQUM1RCxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUM3QyxPQUFPLG1CQUFtQixDQUFBO0lBQzVCLENBQUM7SUFFRCxJQUFNLHlCQUF5QixHQUFHLENBQUMsQ0FBQTtJQUNuQyxJQUFNLGNBQWMsR0FBRztRQUNyQixXQUFXLFlBQUMsUUFBYTtZQUN2QixDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQztnQkFDaEMsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtnQkFDckQsSUFBQSxFQUFFLEdBQUssd0JBQXdCLENBQ3JDO29CQUNFLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJO29CQUNoQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsR0FBRztpQkFDaEMsRUFDRCxHQUFHLENBQ0osR0FOUyxDQU1UO2dCQUNELFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUNoQyxDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxpQkFBaUIsWUFBQyxRQUFhO1lBQzdCLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQTtZQUNyQixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUE7WUFDcEIsR0FBRyxDQUFDLGlCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN0RSxHQUFHLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLFVBQUMsQ0FBTTtnQkFDMUMsc0ZBQXNGO2dCQUN0RixvRkFBb0Y7Z0JBQ3BGLHNDQUFzQztnQkFDdEMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3JCLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQTtnQkFDNUIsQ0FBQztnQkFDRCxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtnQkFDbkMsSUFBSSxnQkFBZ0IsR0FBRyxhQUFhLEdBQUcsR0FBRyxFQUFFLENBQUM7b0JBQzNDLFlBQVksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO3dCQUN2QixJQUFBLFVBQVUsR0FBSyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxXQUE5QyxDQUE4Qzt3QkFDaEUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBO29CQUN0QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ1QsQ0FBQztnQkFDRCxhQUFhLEdBQUcsZ0JBQWdCLENBQUE7WUFDbEMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUM1QyxDQUFDO1FBQ0Qsb0JBQW9COztZQUNsQixNQUFBLEdBQUcsQ0FBQyxpQkFBaUIsMENBQUUsT0FBTyxFQUFFLENBQUE7UUFDbEMsQ0FBQztRQUNELFlBQVksWUFBQyxRQUFhO1lBQ3hCLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsVUFBQyxDQUFDO2dCQUN0QyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxlQUFlO1lBQ2IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ3hDLENBQUM7UUFDRCxhQUFhO1lBQ1gsR0FBRyxDQUFDLHVCQUF1QixHQUFHLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUM5RCxHQUFHLENBQUMsTUFBTSxDQUNYLENBQUE7WUFDRCxHQUFHLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLFVBQUMsQ0FBTTtnQkFDeEMsSUFBQSxVQUFVLEdBQUssd0JBQXdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsV0FBOUMsQ0FBOEM7Z0JBQ2hFLElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ2YsQ0FBQztvQkFBQyxLQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxVQUFVLENBQUMsQ0FBQTtnQkFDbEUsQ0FBQztZQUNILENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUNuRCxDQUFDO1FBQ0QsZ0JBQWdCOztZQUNkLE1BQUEsR0FBRyxDQUFDLHVCQUF1QiwwQ0FBRSxPQUFPLEVBQUUsQ0FBQTtRQUN4QyxDQUFDO1FBQ0QseUJBQXlCLFlBQUMsRUFVekI7Z0JBVEMsUUFBUSxjQUFBLEVBQ1IsSUFBSSxVQUFBLEVBQ0osSUFBSSxVQUFBLEVBQ0osRUFBRSxRQUFBO1lBT0YsR0FBRyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFBO1lBQzFELEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FDOUQsR0FBRyxDQUFDLE1BQU0sQ0FDWCxDQUFBO1lBQ0QsR0FBRyxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxVQUFDLENBQU07Z0JBQ3hDLElBQUEsVUFBVSxHQUFLLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFdBQTlDLENBQThDO2dCQUNoRSxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQzlDLENBQUMsQ0FBQyxRQUFRLEVBQ1YsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUMxQixDQUFBO2dCQUNELElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUNwRCxTQUFTLEVBQ1QsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUMxQixDQUFBO2dCQUNELElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7WUFDN0QsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUN6QyxHQUFHLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLFVBQUMsQ0FBTTtnQkFDeEMsSUFBQSxVQUFVLEdBQUssd0JBQXdCLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBakQsQ0FBaUQ7Z0JBQ25FLElBQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FDOUMsQ0FBQyxDQUFDLFdBQVcsRUFDYixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQzFCLENBQUE7Z0JBQ0QsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQ3BELFNBQVMsRUFDVCxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQzFCLENBQUE7Z0JBQ0QsSUFBTSxXQUFXLEdBQUcsUUFBUTtvQkFDMUIsQ0FBQyxDQUFDO3dCQUNFLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDOUIsWUFBWSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUM1Qzt3QkFDRCxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQzdCLFlBQVksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FDMUM7cUJBQ0Y7b0JBQ0gsQ0FBQyxDQUFDLElBQUksQ0FBQTtnQkFDUixJQUFJLENBQUMsRUFBRSxXQUFXLGFBQUEsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtZQUNsRCxDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQzFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQ3hDLEVBQUUsRUFDRixNQUFNLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUNwQyxDQUFBO1FBQ0gsQ0FBQztRQUNELDRCQUE0Qjs7WUFDMUIsR0FBRyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO1lBQ3pELE1BQUEsR0FBRyxDQUFDLHVCQUF1QiwwQ0FBRSxPQUFPLEVBQUUsQ0FBQTtRQUN4QyxDQUFDO1FBQ0QsdUJBQXVCLFlBQ3JCLFlBQWlCLEVBQ2pCLFlBQWlCLEVBQ2pCLFVBQWU7WUFFZixHQUFHLENBQUMsc0NBQXNDO2dCQUN4QyxJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDaEQsR0FBRyxDQUFDLHNDQUFzQyxDQUFDLGNBQWMsQ0FBQztnQkFDeEQsWUFBWSxFQUFFLENBQUE7WUFDaEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUN6QyxHQUFHLENBQUMsc0NBQXNDLENBQUMsY0FBYyxDQUFDO2dCQUN4RCxZQUFZLEVBQUUsQ0FBQTtZQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQzFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDOUIsQ0FBQztRQUNELFdBQVcsWUFBQyxRQUFhO1lBQ3ZCLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxDQUFDO2dCQUNwQyxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO2dCQUM3RCxJQUFNLFFBQVEsR0FBRztvQkFDZixDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsSUFBSTtvQkFDaEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLEdBQUc7aUJBQ2hDLENBQUE7Z0JBQ0ssSUFBQSxLQUFxQix3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQTFELEVBQUUsUUFBQSxFQUFFLFVBQVUsZ0JBQTRDLENBQUE7Z0JBQ2xFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7b0JBQ1YsU0FBUyxFQUFFLEVBQUU7b0JBQ2IsYUFBYSxFQUFFLFVBQVU7aUJBQzFCLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELGNBQWM7WUFDWixDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUNELFVBQVUsRUFBRSxFQUFjO1FBQzFCLGlCQUFpQixZQUFDLFFBQWE7WUFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxTQUFjO2dCQUNyQyxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ2hDLENBQUMsQ0FBQyxDQUFBO1lBQ0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUE7WUFDcEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3ZELENBQUM7UUFDRCxrQkFBa0IsWUFBQyxRQUFhO1lBQzlCLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUMxRCxDQUFDO1FBQ0QsZUFBZSxZQUFDLFFBQWE7WUFBN0IsaUJBU0M7WUFSQyxJQUFNLGVBQWUsR0FBRztnQkFDdEIsS0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQ2xCLE1BQU0sQ0FBQyxVQUFVLENBQUM7b0JBQ2hCLFFBQVEsRUFBRSxDQUFBO2dCQUNaLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FDUixDQUFBO1lBQ0gsQ0FBQyxDQUFBO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBQzVELENBQUM7UUFDRCxnQkFBZ0IsWUFBQyxRQUFhO1lBQzVCLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN4RCxDQUFDO1FBQ0QsU0FBUyxZQUFDLE1BQVc7WUFDbkIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN4QixPQUFNO1lBQ1IsQ0FBQztZQUNELElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFVO2dCQUN0QyxPQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUM3QixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ1IsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUNSLEdBQUcsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUN4QztZQUpELENBSUMsQ0FDRixDQUFBO1lBQ0QsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUMzQixJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FDMUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUNiLENBQUE7Z0JBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDbEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ25FLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO29CQUM3QixRQUFRLEVBQUUsR0FBRztvQkFDYixVQUFVLEVBQUUsR0FBRztpQkFDaEIsQ0FBQyxDQUFBO1lBQ0osQ0FBQztRQUNILENBQUM7UUFDRCxZQUFZLFlBQUMsT0FBWTtZQUN2QixJQUFJLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFBO1lBQy9CLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUNuQixPQUFPO2lCQUNKLE1BQU0sQ0FBQyxVQUFDLE1BQVcsSUFBSyxPQUFBLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBcEIsQ0FBb0IsQ0FBQztpQkFDN0MsR0FBRyxDQUNGLFVBQUMsTUFBVztnQkFDVixPQUFBLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLFVBQUMsVUFBVTtvQkFDbkMsT0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDN0IsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUNiLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FDeEM7Z0JBSkQsQ0FJQyxDQUNGO1lBTkQsQ0FNQyxFQUNILElBQUksQ0FDTCxDQUNKLENBQUE7WUFDRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDM0IsS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO29CQUNwRSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUM3QixDQUFDO3FCQUFNLENBQUM7b0JBQ04sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUE7b0JBQzdELElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ2hDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELGVBQWUsWUFBQyxNQUFXLEVBQUUsUUFBYztZQUFkLHlCQUFBLEVBQUEsY0FBYztZQUN6QyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ3JCLFFBQVEsVUFBQTtnQkFDUixXQUFXLEVBQUUsTUFBTTthQUNwQixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsV0FBVyxnQkFBSSxDQUFDO1FBQ2hCLGlCQUFpQixZQUFDLEVBSVo7Z0JBSlkscUJBSWQsRUFBRSxLQUFBLEVBSEosZ0JBQWMsRUFBZCxRQUFRLG1CQUFHLEdBQUcsS0FBQTtZQUlkLElBQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FDL0QsVUFBQyxJQUFTLElBQUssT0FBQSxJQUFJLENBQUMsRUFBRSxFQUFQLENBQU8sQ0FDdkIsQ0FBQTtZQUNELElBQU0sZUFBZSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FDOUMsVUFBQyxJQUFTLEVBQUUsSUFBUztnQkFDbkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFDLE9BQVksRUFBRSxRQUFhO29CQUNqRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUE7Z0JBQ2xELENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDUCxDQUFBO1lBQ0gsQ0FBQyxFQUNELEVBQUUsQ0FDSCxDQUFBO1lBQ0QsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMvQixHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7b0JBQ3JCLFFBQVEsRUFBRSxRQUFRLEdBQUcsSUFBSSxFQUFFLG9CQUFvQjtvQkFDL0MsV0FBVyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO29CQUNqRSxXQUFXLEVBQUUsOEJBQThCO2lCQUM1QyxDQUFDLENBQUE7Z0JBQ0YsT0FBTyxJQUFJLENBQUE7WUFDYixDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDO1FBQ0QsK0JBQStCLFlBQUMsWUFBc0I7WUFDcEQsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUE7WUFDdkMsSUFBSSxTQUFTLEdBQUcsRUFBVyxDQUFBO1lBRTNCLHVEQUF1RDtZQUN2RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUMzQyxJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNqQyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7b0JBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzFDLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7d0JBQzVCLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTtvQkFDL0MsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBRWhFLElBQ0UsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQzFCLGNBQWMsRUFDZCxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRO2FBQzlDLEVBQ0QsQ0FBQztnQkFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUE7WUFDNUMsQ0FBQztZQUVELHNKQUFzSjtZQUN0SixpRUFBaUU7WUFDakUsSUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQTtZQUNsQyxJQUFJLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFBO1lBQ2xDLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUMsb0VBQW9FO1lBQzdHLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUVuQyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUMvQyxFQUFFLEVBQ0YsTUFBTSxHQUFHLENBQUMsRUFDVixJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FDeEIsQ0FBQSxDQUFDLHlDQUF5QztZQUMzQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBLENBQUMsaUNBQWlDO1lBRW5GLE9BQU8sUUFBUSxDQUFBO1FBQ2pCLENBQUM7UUFDRCxTQUFTLFlBQUMsRUFNVDtnQkFMQyxHQUFHLFNBQUEsRUFDSCxnQkFBYyxFQUFkLFFBQVEsbUJBQUcsR0FBRyxLQUFBO1lBS2QseUlBQXlJO1lBQ3pJLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNmLFdBQVcsRUFBRSxJQUFJLENBQUMsK0JBQStCLENBQUMsR0FBRyxDQUFDO2dCQUN0RCxXQUFXLEVBQUUsOEJBQThCO2dCQUMzQyxRQUFRLEVBQUUsUUFBUSxHQUFHLElBQUksRUFBRSxvQkFBb0I7YUFDaEQsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELGNBQWMsWUFDWixTQUFjLEVBQ2QsSUFHQztZQUhELHFCQUFBLEVBQUE7Z0JBQ0UsUUFBUSxFQUFFLEdBQUc7Z0JBQ2IsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFFRCxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ3JCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDdkIsV0FBVyxFQUFFLDJCQUEyQixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7Z0JBQ3hELFFBQVE7b0JBQ04sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO3dCQUNyQixRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVU7d0JBQ3pCLFdBQVcsRUFBRSwyQkFBMkIsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDO3FCQUN6RCxDQUFDLENBQUE7Z0JBQ0osQ0FBQzthQUNGLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxTQUFTO1lBQ1AsT0FBTyxNQUFNLENBQUE7UUFDZixDQUFDO1FBQ0QsWUFBWSxnQkFBSSxDQUFDO1FBQ2pCLGlCQUFpQixZQUFDLEVBQWlDO2dCQUEvQixLQUFLLFdBQUEsRUFBRSxLQUFLLFdBQUEsRUFBRSxJQUFJLFVBQUEsRUFBRSxJQUFJLFVBQUE7WUFDMUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNyQixRQUFRLEVBQUUsR0FBRztnQkFDYixXQUFXLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO2FBQ3BFLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxjQUFjO1lBQ1osSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtZQUM3RCxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLFVBQUMsR0FBRyxJQUFLLE9BQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQTtRQUN4RSxDQUFDO1FBQ0QsWUFBWSxZQUFDLEtBQXNCO1lBQ2pDLElBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFBO1lBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDOUIsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUMxQyxJQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFDLEtBQUs7Z0JBQ3hDLEtBQUssR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDckMsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDcEMsS0FBSyxDQUFDLFNBQVMsRUFDZixLQUFLLENBQUMsUUFBUSxFQUNkLEtBQUssQ0FBQyxRQUFRLENBQ2YsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFBO1lBQ0YsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtZQUN2RSxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FDN0QsSUFBSSxNQUFNLENBQUMseUJBQXlCLENBQUM7Z0JBQ25DLEdBQUcsRUFBRSxLQUFLLENBQUMsaUJBQWlCO2dCQUM1QixTQUFTLFdBQUE7YUFDVixDQUFDLENBQ0gsQ0FBQTtZQUNELG1KQUFtSjtZQUNuSixRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsWUFBWSxDQUFBO1FBQ3JDLENBQUM7UUFDRCxhQUFhLFlBQUMsVUFBZTtZQUMzQixtSkFBbUo7WUFDbkosSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDekIsbUpBQW1KO2dCQUNuSixHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7Z0JBQ3BELG1KQUFtSjtnQkFDbkosT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDN0IsQ0FBQztRQUNILENBQUM7UUFDRCxpQkFBaUI7WUFDZixLQUFLLElBQU0sT0FBTyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUMvQixJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDckMsbUpBQW1KO29CQUNuSixHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7Z0JBQ25ELENBQUM7WUFDSCxDQUFDO1lBQ0QsUUFBUSxHQUFHLEVBQUUsQ0FBQTtRQUNmLENBQUM7UUFDRCx1Q0FBdUMsWUFBQyxPQUFvQjtZQUMxRCxPQUFPLE9BQU8sQ0FBQyxnREFBZ0QsQ0FDN0QsT0FBTyxDQUFDLE9BQU8sQ0FDaEIsQ0FBQTtRQUNILENBQUM7UUFDRCwyQkFBMkIsWUFBQyxPQUEwQjtZQUNwRCxJQUFJLFFBQWEsQ0FBQTtZQUNqQixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2hELFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FDdkMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQ3RCLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FDMUIsQ0FBQTtZQUNILENBQUM7WUFDRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQyxNQUFNO2dCQUN4QixJQUFNLDBCQUEwQixHQUM5QixPQUFPLENBQUMsbUNBQW1DLENBQUMsTUFBTSxDQUFDLENBQUE7Z0JBQ3JELElBQUksUUFBUSxJQUFJLFlBQVksQ0FBQywwQkFBMEIsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO29CQUNuRSxPQUFPLFNBQVMsQ0FBQTtnQkFDbEIsQ0FBQztnQkFDRCxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsK0JBQStCLENBQ3BELDBCQUEwQixFQUMxQixHQUFHLENBQ0osQ0FBQTtnQkFDRCxJQUFJLE1BQU0sRUFBRSxDQUFDO29CQUNYLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDN0IsQ0FBQztxQkFBTSxDQUFDO29CQUNOLE9BQU8sU0FBUyxDQUFBO2dCQUNsQixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0Q7OztvQkFHWTtRQUNaLGdCQUFnQixZQUFDLEtBQVUsRUFBRSxPQUFZO1lBQ3ZDLElBQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2pELElBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQzFELFdBQVcsQ0FBQyxTQUFTLEVBQ3JCLFdBQVcsQ0FBQyxRQUFRLEVBQ3BCLFdBQVcsQ0FBQyxRQUFRLENBQ3JCLENBQUE7WUFDRCxJQUFJLGlCQUFpQixHQUNuQixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtZQUN6RSxJQUFNLFlBQVksR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUM7Z0JBQzNDLEtBQUssRUFBRSxTQUFTO2dCQUNoQixRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ2QsU0FBUyxXQUFBO2FBQ1YsQ0FBQyxDQUFBO1lBQ0YsWUFBWSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUM7Z0JBQzlELFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSztnQkFDeEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTTtnQkFDdkIsV0FBVyxFQUFFLE9BQU87Z0JBQ3BCLFNBQVMsRUFBRSxPQUFPO2dCQUNsQixZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7YUFDbkMsQ0FBQyxDQUFBO1lBQ0YsWUFBWSxDQUFDLHNCQUFzQixHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDckUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUN4QixJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNO2dCQUN2QixXQUFXLEVBQUUsT0FBTztnQkFDcEIsU0FBUyxFQUFFLE9BQU87Z0JBQ2xCLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTthQUNuQyxDQUFDLENBQUE7WUFDRixZQUFZLENBQUMsYUFBYSxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDNUQsU0FBUyxFQUFFLFFBQVE7Z0JBQ25CLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU07Z0JBQ3ZCLFdBQVcsRUFBRSxPQUFPO2dCQUNwQixTQUFTLEVBQUUsT0FBTztnQkFDbEIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2FBQ25DLENBQUMsQ0FBQTtZQUNGLFFBQVEsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUMzQixLQUFLLFVBQVU7b0JBQ2IsWUFBWSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFBO29CQUMvQyxNQUFLO2dCQUNQLEtBQUssV0FBVztvQkFDZCxZQUFZLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQTtvQkFDeEQsTUFBSztnQkFDUCxLQUFLLFlBQVk7b0JBQ2YsWUFBWSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFBO29CQUNqRCxNQUFLO1lBQ1QsQ0FBQztZQUNELG1IQUFtSDtZQUNuSCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN2RCxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRTtvQkFDakUsb0JBQW9CO2lCQUNyQixDQUFDLENBQUE7Z0JBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBQyxtQkFBd0I7b0JBQzVDLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDL0QsaUJBQWlCOzRCQUNmLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FDL0MsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQ3ZCLENBQUE7d0JBQ0gsWUFBWSxDQUFDLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQTtvQkFDM0MsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUM7WUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFBO1lBQ3pCLE9BQU8sWUFBWSxDQUFBO1FBQ3JCLENBQUM7UUFDRDs7O29CQUdZO1FBQ1osUUFBUSxZQUFDLEtBQVUsRUFBRSxPQUFZO1lBQy9CLElBQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2pELElBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQzFELFdBQVcsQ0FBQyxTQUFTLEVBQ3JCLFdBQVcsQ0FBQyxRQUFRLEVBQ3BCLFdBQVcsQ0FBQyxRQUFRLENBQ3JCLENBQUE7WUFDRCxJQUFNLGlCQUFpQixHQUNyQixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtZQUN6RSxJQUFNLFlBQVksR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUM7Z0JBQzNDLEtBQUssRUFBRSxTQUFTO2dCQUNoQixRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ2QsU0FBUyxXQUFBO2dCQUNULFdBQVcsYUFBQTtnQkFDWCxjQUFjLEVBQUUsT0FBTyxDQUFDLGlCQUFpQjtvQkFDdkMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTTtvQkFDOUIsQ0FBQyxDQUFDLFNBQVM7Z0JBQ2IsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLG1CQUFtQjtvQkFDM0MsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNO29CQUNoQyxDQUFDLENBQUMsU0FBUztnQkFDYixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7YUFDbkIsQ0FBQyxDQUFBO1lBQ0YsWUFBWSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO2dCQUNuRCxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUs7Z0JBQ3hCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtnQkFDbEIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2FBQ25DLENBQUMsQ0FBQTtZQUNGLFlBQVksQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztnQkFDakQsU0FBUyxFQUFFLFFBQVE7Z0JBQ25CLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtnQkFDbEIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2FBQ25DLENBQUMsQ0FBQTtZQUNGLFlBQVksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVU7Z0JBQ3JDLENBQUMsQ0FBQyxZQUFZLENBQUMsYUFBYTtnQkFDNUIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUE7WUFDaEMsbUhBQW1IO1lBQ25ILElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3ZELElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFO29CQUNqRSxvQkFBb0I7aUJBQ3JCLENBQUMsQ0FBQTtnQkFDRixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFDLG1CQUF3QjtvQkFDNUMsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUMvRCxZQUFZLENBQUMsUUFBUTs0QkFDbkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUMvQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FDdkIsQ0FBQTtvQkFDTCxDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQztZQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUE7WUFDekIsT0FBTyxZQUFZLENBQUE7UUFDckIsQ0FBQztRQUNEOzs7a0JBR1U7UUFDVixPQUFPLFlBQUMsSUFBUyxFQUFFLE9BQVk7WUFDN0IsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLFVBQWU7Z0JBQzFDLE9BQUEsc0JBQXNCLENBQUMsVUFBVSxDQUFDO1lBQWxDLENBQWtDLENBQ25DLENBQUE7WUFDRCxJQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxVQUFDLEtBQUs7Z0JBQ3pDLE9BQUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQzdCLEtBQUssQ0FBQyxTQUFTLEVBQ2YsS0FBSyxDQUFDLFFBQVEsRUFDZCxLQUFLLENBQUMsUUFBUSxDQUNmO1lBSkQsQ0FJQyxDQUNGLENBQUE7WUFDRCxJQUFNLFNBQVMsR0FDYixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDekUsSUFBTSxrQkFBa0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1lBQzFELGtCQUFrQixDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUM5RCxpQkFBaUIsRUFDakI7Z0JBQ0UsS0FBSyxFQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQzFDLFlBQVksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7Z0JBQ2hDLFlBQVksRUFBRSxDQUFDO2FBQ2hCLENBQ0YsQ0FBQTtZQUNELGtCQUFrQixDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUM1RCxpQkFBaUIsRUFDakI7Z0JBQ0UsS0FBSyxFQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQzFDLFlBQVksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7Z0JBQ2hDLFlBQVksRUFBRSxDQUFDO2FBQ2hCLENBQ0YsQ0FBQTtZQUNELElBQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQztnQkFDdEMsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxFQUFFLE9BQU8sQ0FBQyxVQUFVO29CQUMxQixDQUFDLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCO29CQUNyQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCO2dCQUN6QyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ2QsU0FBUyxFQUFFLFNBQVM7YUFDckIsQ0FBQyxDQUFBO1lBQ0YsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM5QixJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUNsQyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFDekIsQ0FBQyxFQUNELFVBQVUsQ0FDWCxDQUFBO2dCQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQUMsbUJBQXdCO29CQUM1QyxJQUFNLFNBQVMsR0FDYixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQ3pELG1CQUFtQixDQUNwQixDQUFBO29CQUNILElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDL0QsUUFBUSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7b0JBQ2hDLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUE7WUFDNUMsT0FBTyxrQkFBa0IsQ0FBQTtRQUMzQixDQUFDO1FBQ0Q7OztrQkFHVTtRQUNWLFVBQVUsWUFBQyxPQUFZLEVBQUUsT0FBWTtZQUNuQyxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsVUFBZTtnQkFDaEQsT0FBQSxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7WUFBbEMsQ0FBa0MsQ0FDbkMsQ0FBQTtZQUNELElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQUMsS0FBSztnQkFDNUMsT0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDN0IsS0FBSyxDQUFDLFNBQVMsRUFDZixLQUFLLENBQUMsUUFBUSxFQUNkLEtBQUssQ0FBQyxRQUFRLENBQ2Y7WUFKRCxDQUlDLENBQ0YsQ0FBQTtZQUNELElBQUksU0FBUyxHQUNYLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUN6RSxJQUFNLG9CQUFvQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUM1QyxPQUFPLEVBQUU7b0JBQ1AsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQzt3QkFDeEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSzt3QkFDekIsU0FBUyxFQUFFLEdBQUc7d0JBQ2QsU0FBUyxFQUFFLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUN0QyxhQUFhLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7d0JBQzlDLFVBQVUsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztxQkFDNUMsQ0FBQztvQkFDRixpQkFBaUIsRUFBRSxJQUFJO2lCQUN4QjtnQkFDRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ3BCLGdCQUFnQixFQUFFLEtBQUs7YUFDeEIsQ0FBQyxDQUFBO1lBQ0YsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztnQkFDMUMsT0FBTyxFQUFFO29CQUNQLFNBQVMsRUFBRSxTQUFTO29CQUNwQixRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUMsb0JBQW9CLENBQUM7d0JBQ3hDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7d0JBQ3pCLFNBQVMsRUFBRSxHQUFHO3dCQUNkLFNBQVMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDdEMsYUFBYSxFQUFFLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO3dCQUM5QyxVQUFVLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7cUJBQzVDLENBQUM7b0JBQ0YsaUJBQWlCLEVBQUUsSUFBSTtpQkFDeEI7Z0JBQ0QsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUNwQixnQkFBZ0IsRUFBRSxJQUFJO2FBQ3ZCLENBQUMsQ0FBQTtZQUNGLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDOUIsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FDbEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQ3pCLENBQUMsRUFDRCxVQUFVLENBQ1gsQ0FBQTtnQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFDLG1CQUF3QjtvQkFDNUMsU0FBUzt3QkFDUCxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQ3pELG1CQUFtQixDQUNwQixDQUFBO29CQUNILElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDL0Qsb0JBQW9CLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUE7d0JBQzFELGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFBO29CQUMxRCxDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQztZQUNELE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBQ25ELENBQUM7UUFDRDs7O2tCQUdVO1FBQ1YsYUFBYSxZQUFDLFFBQWEsRUFBRSxPQUFZO1lBQXpDLGlCQWtDQztZQWpDQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLGFBQWE7b0JBQzdCLEtBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFBO2dCQUM1QyxDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUM7WUFDRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM5QyxRQUFRLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDM0IsS0FBSyxVQUFVO3dCQUNiLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQTt3QkFDdkMsTUFBSztvQkFDUCxLQUFLLFdBQVc7d0JBQ2QsUUFBUSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsc0JBQXNCLENBQUE7d0JBQ2hELE1BQUs7b0JBQ1AsS0FBSyxZQUFZO3dCQUNmLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQTt3QkFDekMsTUFBSztnQkFDVCxDQUFDO2dCQUNELElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEtBQUssWUFBWSxDQUFBO2dCQUN0RCxRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3ZFLENBQUM7aUJBQU0sSUFBSSxRQUFRLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUM5RCxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQWE7b0JBQ3hDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUU7d0JBQzlELEtBQUssRUFBRSxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQzt3QkFDOUMsWUFBWSxFQUFFLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDO3dCQUMzRCxZQUFZLEVBQUUsQ0FBQztxQkFDaEIsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQztpQkFBTSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNyQyxRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUE7WUFDcEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFBO1lBQ3JDLENBQUM7WUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQzNCLENBQUM7UUFDRDs7O29CQUdZO1FBQ1osY0FBYyxZQUFDLFFBQWEsRUFBRSxPQUFZO1lBQTFDLGlCQTJCQztZQTFCQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLGFBQWE7b0JBQzdCLEtBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFBO2dCQUM3QyxDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUM7WUFDRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM5QyxRQUFRLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVO29CQUNqQyxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWE7b0JBQ3hCLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFBO2dCQUM1QixRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FDeEMsQ0FBQyxFQUNELENBQUMsRUFDRCxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM1QixDQUFBO1lBQ0gsQ0FBQztpQkFBTSxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzlELFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBYTtvQkFDeEMsUUFBUSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVTt3QkFDcEMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0I7d0JBQzNCLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUE7Z0JBQ2pDLENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQztpQkFBTSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNyQyxRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUE7WUFDcEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFBO1lBQ3JDLENBQUM7WUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQzNCLENBQUM7UUFDRDs7bUJBRVc7UUFDWCxZQUFZLFlBQUMsUUFBYTtZQUN4QixJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM5QyxRQUFRLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQTtZQUN2QixDQUFDO2lCQUFNLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDOUQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFhO29CQUN4QyxRQUFRLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQTtnQkFDdkIsQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDO1FBQ0gsQ0FBQztRQUNEOzttQkFFVztRQUNYLFlBQVksWUFBQyxRQUFhO1lBQ3hCLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzlDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1lBQ3RCLENBQUM7aUJBQU0sSUFBSSxRQUFRLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUM5RCxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQWE7b0JBQ3hDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO2dCQUN0QixDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUM7WUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQzNCLENBQUM7UUFDRCxjQUFjLFlBQUMsUUFBYTtZQUMxQixtQkFBbUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDcEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ3JDLHFFQUFxRTtZQUNyRSxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMzQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUMvQixDQUFDO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBQ0QsYUFBYTtZQUNYLDJGQUEyRjtZQUMzRixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztnQkFDbkIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQ2pCLENBQUMsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxHQUFHLEVBQUUsQ0FBQTtZQUNYLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDckIsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtZQUMzQixDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU07WUFDSixPQUFPLEdBQUcsQ0FBQTtRQUNaLENBQUM7UUFDRCxNQUFNO1lBQ0osSUFBTSwwQkFBMEIsR0FDOUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUMvQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQzFCLENBQUE7WUFFSCxJQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQzdDLDBCQUEwQixDQUMzQixDQUFBO1lBRUQsSUFBTSxpQkFBaUIsR0FDckIsMEJBQTBCLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQTtZQUVuRCxJQUFNLFVBQVUsR0FBRyxpQkFBaUIsR0FBRyxDQUFDLENBQUEsQ0FBQyxvQ0FBb0M7WUFFN0UsSUFBTSxhQUFhLEdBQUcsaUJBQWlCLEdBQUcseUJBQXlCLENBQUE7WUFFbkUsc0ZBQXNGO1lBQ3RGLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFBO1FBQzlELENBQUM7UUFDRCxPQUFPO1lBQ0wsSUFBTSwwQkFBMEIsR0FDOUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUMvQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQzFCLENBQUE7WUFFSCxJQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQzdDLDBCQUEwQixDQUMzQixDQUFBO1lBRUQsSUFBTSxpQkFBaUIsR0FDckIsMEJBQTBCLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQTtZQUNuRCxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUM3QyxDQUFDO1FBQ0QsT0FBTztZQUNMLENBQUM7WUFBQyxLQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO1lBQ25FLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNmLENBQUM7S0FDRixDQUFBO0lBQ0QsT0FBTyxjQUFjLENBQUE7QUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB1dGlsaXR5IGZyb20gJy4vdXRpbGl0eSdcbmltcG9ydCBEcmF3aW5nVXRpbGl0eSBmcm9tICcuLi9EcmF3aW5nVXRpbGl0eSdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi8uLi8uLi9qcy93cmVxcidcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcbmltcG9ydCBEcmF3SGVscGVyIGZyb20gJy4uLy4uLy4uLy4uL2xpYi9jZXNpdW0tZHJhd2hlbHBlci9EcmF3SGVscGVyJ1xuaW1wb3J0IHtcbiAgQ2VzaXVtSW1hZ2VyeVByb3ZpZGVyVHlwZXMsXG4gIENlc2l1bUxheWVycyxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vanMvY29udHJvbGxlcnMvY2VzaXVtLmxheWVycydcbmltcG9ydCB7IERyYXdpbmcgfSBmcm9tICcuLi8uLi8uLi9zaW5nbGV0b25zL2RyYXdpbmcnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgQ2x1c3RlclR5cGUgfSBmcm9tICcuLi9yZWFjdC9nZW9tZXRyaWVzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmNvbnN0IGRlZmF1bHRDb2xvciA9ICcjM2M2ZGQ1J1xuY29uc3QgZXllT2Zmc2V0ID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKDAsIDAsIDApXG5jb25zdCBwaXhlbE9mZnNldCA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigwLjAsIDApXG5DZXNpdW0uQmluZ01hcHNBcGkuZGVmYXVsdEtleSA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRCaW5nS2V5KCkgfHwgMFxuY29uc3QgaW1hZ2VyeVByb3ZpZGVyVHlwZXMgPSBDZXNpdW1JbWFnZXJ5UHJvdmlkZXJUeXBlc1xuZnVuY3Rpb24gc2V0dXBUZXJyYWluUHJvdmlkZXIodmlld2VyOiBhbnksIHRlcnJhaW5Qcm92aWRlcjogYW55KSB7XG4gIGlmICh0ZXJyYWluUHJvdmlkZXIgPT0gbnVsbCB8fCB0ZXJyYWluUHJvdmlkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnNvbGUuaW5mbyhgVW5rbm93biB0ZXJyYWluIHByb3ZpZGVyIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgICAgICAgIERlZmF1bHQgQ2VzaXVtIHRlcnJhaW4gcHJvdmlkZXIgd2lsbCBiZSB1c2VkLmApXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgeyB0eXBlLCAuLi50ZXJyYWluQ29uZmlnIH0gPSB0ZXJyYWluUHJvdmlkZXJcbiAgY29uc3QgVGVycmFpblByb3ZpZGVyID0gaW1hZ2VyeVByb3ZpZGVyVHlwZXNbdHlwZV1cbiAgaWYgKFRlcnJhaW5Qcm92aWRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS53YXJuKGBcbiAgICAgICAgICAgIFVua25vd24gdGVycmFpbiBwcm92aWRlciB0eXBlOiAke3R5cGV9LlxuICAgICAgICAgICAgRGVmYXVsdCBDZXNpdW0gdGVycmFpbiBwcm92aWRlciB3aWxsIGJlIHVzZWQuXG4gICAgICAgIGApXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgZGVmYXVsdENlc2l1bVRlcnJhaW5Qcm92aWRlciA9IHZpZXdlci5zY2VuZS50ZXJyYWluUHJvdmlkZXJcbiAgY29uc3QgY3VzdG9tVGVycmFpblByb3ZpZGVyID0gbmV3IFRlcnJhaW5Qcm92aWRlcih0ZXJyYWluQ29uZmlnKVxuICBjdXN0b21UZXJyYWluUHJvdmlkZXIuZXJyb3JFdmVudC5hZGRFdmVudExpc3RlbmVyKCgpID0+IHtcbiAgICBjb25zb2xlLndhcm4oYFxuICAgICAgICAgICAgSXNzdWUgdXNpbmcgdGVycmFpbiBwcm92aWRlcjogJHtKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgIC4uLnRlcnJhaW5Db25maWcsXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIEZhbGxpbmcgYmFjayB0byBkZWZhdWx0IENlc2l1bSB0ZXJyYWluIHByb3ZpZGVyLlxuICAgICAgICBgKVxuICAgIHZpZXdlci5zY2VuZS50ZXJyYWluUHJvdmlkZXIgPSBkZWZhdWx0Q2VzaXVtVGVycmFpblByb3ZpZGVyXG4gIH0pXG4gIHZpZXdlci5zY2VuZS50ZXJyYWluUHJvdmlkZXIgPSBjdXN0b21UZXJyYWluUHJvdmlkZXJcbn1cbmZ1bmN0aW9uIGNyZWF0ZU1hcChpbnNlcnRpb25FbGVtZW50OiBhbnksIG1hcExheWVyczogYW55KSB7XG4gIGNvbnN0IGxheWVyQ29sbGVjdGlvbkNvbnRyb2xsZXIgPSBuZXcgQ2VzaXVtTGF5ZXJzKHtcbiAgICBjb2xsZWN0aW9uOiBtYXBMYXllcnMsXG4gIH0pXG4gIGNvbnN0IHZpZXdlciA9IGxheWVyQ29sbGVjdGlvbkNvbnRyb2xsZXIubWFrZU1hcCh7XG4gICAgZWxlbWVudDogaW5zZXJ0aW9uRWxlbWVudCxcbiAgICBjZXNpdW1PcHRpb25zOiB7XG4gICAgICBzY2VuZU1vZGU6IENlc2l1bS5TY2VuZU1vZGUuU0NFTkUzRCxcbiAgICAgIGNyZWRpdENvbnRhaW5lcjogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICBhbmltYXRpb246IGZhbHNlLFxuICAgICAgZnVsbHNjcmVlbkJ1dHRvbjogZmFsc2UsXG4gICAgICB0aW1lbGluZTogZmFsc2UsXG4gICAgICBnZW9jb2RlcjogZmFsc2UsXG4gICAgICBob21lQnV0dG9uOiBmYWxzZSxcbiAgICAgIG5hdmlnYXRpb25IZWxwQnV0dG9uOiBmYWxzZSxcbiAgICAgIHNjZW5lTW9kZVBpY2tlcjogZmFsc2UsXG4gICAgICBzZWxlY3Rpb25JbmRpY2F0b3I6IGZhbHNlLFxuICAgICAgaW5mb0JveDogZmFsc2UsXG4gICAgICAvL3NreUJveDogZmFsc2UsXG4gICAgICAvL3NreUF0bW9zcGhlcmU6IGZhbHNlLFxuICAgICAgYmFzZUxheWVyUGlja2VyOiBmYWxzZSxcbiAgICAgIGltYWdlcnlQcm92aWRlcjogZmFsc2UsXG4gICAgICBtYXBNb2RlMkQ6IDAsXG4gICAgfSxcbiAgfSlcbiAgY29uc3QgcmVxdWVzdFJlbmRlciA9ICgpID0+IHtcbiAgICB2aWV3ZXIuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gIH1cbiAgOyh3cmVxciBhcyBhbnkpLnZlbnQub24oJ21hcDpyZXF1ZXN0UmVuZGVyJywgcmVxdWVzdFJlbmRlcilcbiAgLy8gZGlzYWJsZSByaWdodCBjbGljayBkcmFnIHRvIHpvb20gKGNvbnRleHQgbWVudSBpbnN0ZWFkKTtcbiAgdmlld2VyLnNjZW5lLnNjcmVlblNwYWNlQ2FtZXJhQ29udHJvbGxlci56b29tRXZlbnRUeXBlcyA9IFtcbiAgICBDZXNpdW0uQ2FtZXJhRXZlbnRUeXBlLldIRUVMLFxuICAgIENlc2l1bS5DYW1lcmFFdmVudFR5cGUuUElOQ0gsXG4gIF1cbiAgdmlld2VyLnNjcmVlblNwYWNlRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKCgpID0+IHtcbiAgICBpZiAoIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICQoJ2JvZHknKS5tb3VzZWRvd24oKVxuICAgIH1cbiAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfRE9XTilcbiAgdmlld2VyLnNjcmVlblNwYWNlRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKCgpID0+IHtcbiAgICBpZiAoIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICQoJ2JvZHknKS5tb3VzZWRvd24oKVxuICAgIH1cbiAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLlJJR0hUX0RPV04pXG4gIHNldHVwVGVycmFpblByb3ZpZGVyKFxuICAgIHZpZXdlcixcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0VGVycmFpblByb3ZpZGVyKClcbiAgKVxuICByZXR1cm4ge1xuICAgIG1hcDogdmlld2VyLFxuICAgIHJlcXVlc3RSZW5kZXJIYW5kbGVyOiByZXF1ZXN0UmVuZGVyLFxuICB9XG59XG5mdW5jdGlvbiBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24ocG9zaXRpb246IGFueSwgbWFwOiBhbnkpIHtcbiAgbGV0IGlkLCBsb2NhdGlvbklkXG4gIGNvbnN0IHBpY2tlZE9iamVjdCA9IG1hcC5zY2VuZS5waWNrKHBvc2l0aW9uKVxuICBpZiAocGlja2VkT2JqZWN0KSB7XG4gICAgaWQgPSBwaWNrZWRPYmplY3QuaWRcbiAgICBpZiAoaWQgJiYgaWQuY29uc3RydWN0b3IgPT09IENlc2l1bS5FbnRpdHkpIHtcbiAgICAgIGlkID0gaWQucmVzdWx0SWRcbiAgICB9XG4gICAgbG9jYXRpb25JZCA9IHBpY2tlZE9iamVjdC5jb2xsZWN0aW9uPy5sb2NhdGlvbklkXG4gIH1cbiAgcmV0dXJuIHsgaWQsIGxvY2F0aW9uSWQgfVxufVxuZnVuY3Rpb24gZXhwYW5kUmVjdGFuZ2xlKHJlY3RhbmdsZTogYW55KSB7XG4gIGNvbnN0IHNjYWxpbmdGYWN0b3IgPSAwLjA1XG4gIGxldCB3aWR0aEdhcCA9IE1hdGguYWJzKHJlY3RhbmdsZS5lYXN0KSAtIE1hdGguYWJzKHJlY3RhbmdsZS53ZXN0KVxuICBsZXQgaGVpZ2h0R2FwID0gTWF0aC5hYnMocmVjdGFuZ2xlLm5vcnRoKSAtIE1hdGguYWJzKHJlY3RhbmdsZS5zb3V0aClcbiAgLy9lbnN1cmUgcmVjdGFuZ2xlIGhhcyBzb21lIHNpemVcbiAgaWYgKHdpZHRoR2FwID09PSAwKSB7XG4gICAgd2lkdGhHYXAgPSAxXG4gIH1cbiAgaWYgKGhlaWdodEdhcCA9PT0gMCkge1xuICAgIGhlaWdodEdhcCA9IDFcbiAgfVxuICByZWN0YW5nbGUuZWFzdCA9IHJlY3RhbmdsZS5lYXN0ICsgTWF0aC5hYnMoc2NhbGluZ0ZhY3RvciAqIHdpZHRoR2FwKVxuICByZWN0YW5nbGUubm9ydGggPSByZWN0YW5nbGUubm9ydGggKyBNYXRoLmFicyhzY2FsaW5nRmFjdG9yICogaGVpZ2h0R2FwKVxuICByZWN0YW5nbGUuc291dGggPSByZWN0YW5nbGUuc291dGggLSBNYXRoLmFicyhzY2FsaW5nRmFjdG9yICogaGVpZ2h0R2FwKVxuICByZWN0YW5nbGUud2VzdCA9IHJlY3RhbmdsZS53ZXN0IC0gTWF0aC5hYnMoc2NhbGluZ0ZhY3RvciAqIHdpZHRoR2FwKVxuICByZXR1cm4gcmVjdGFuZ2xlXG59XG5mdW5jdGlvbiBnZXREZXN0aW5hdGlvbkZvclZpc2libGVQYW4ocmVjdGFuZ2xlOiBhbnksIG1hcDogYW55KSB7XG4gIGxldCBkZXN0aW5hdGlvbkZvclpvb20gPSBleHBhbmRSZWN0YW5nbGUocmVjdGFuZ2xlKVxuICBpZiAobWFwLnNjZW5lLm1vZGUgPT09IENlc2l1bS5TY2VuZU1vZGUuU0NFTkUzRCkge1xuICAgIGRlc3RpbmF0aW9uRm9yWm9vbSA9XG4gICAgICBtYXAuY2FtZXJhLmdldFJlY3RhbmdsZUNhbWVyYUNvb3JkaW5hdGVzKGRlc3RpbmF0aW9uRm9yWm9vbSlcbiAgfVxuICByZXR1cm4gZGVzdGluYXRpb25Gb3Jab29tXG59XG5mdW5jdGlvbiBkZXRlcm1pbmVDZXNpdW1Db2xvcihjb2xvcjogYW55KSB7XG4gIHJldHVybiAhXy5pc1VuZGVmaW5lZChjb2xvcilcbiAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29sb3IpXG4gICAgOiBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGRlZmF1bHRDb2xvcilcbn1cbmZ1bmN0aW9uIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZTogYW55KSB7XG4gIHJldHVybiB7XG4gICAgbGF0aXR1ZGU6IGNvb3JkaW5hdGVbMV0sXG4gICAgbG9uZ2l0dWRlOiBjb29yZGluYXRlWzBdLFxuICAgIGFsdGl0dWRlOiBjb29yZGluYXRlWzJdLFxuICB9XG59XG5mdW5jdGlvbiBpc05vdFZpc2libGUoY2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnk6IGFueSwgb2NjbHVkZXI6IGFueSkge1xuICByZXR1cm4gIW9jY2x1ZGVyLmlzUG9pbnRWaXNpYmxlKGNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5KVxufVxuXG4vLyBodHRwczovL2Nlc2l1bS5jb20vbGVhcm4vY2VzaXVtanMvcmVmLWRvYy9DYW1lcmEuaHRtbFxuZXhwb3J0IGNvbnN0IExvb2tpbmdTdHJhaWdodERvd25PcmllbnRhdGlvbiA9IHtcbiAgaGVhZGluZzogMCwgLy8gTm9ydGggaXMgdXAgLSBsaWtlIGNvbXBhc3MgZGlyZWN0aW9uXG4gIHBpdGNoOiAtQ2VzaXVtLk1hdGguUElfT1ZFUl9UV08sIC8vIExvb2tpbmcgc3RyYWlnaHQgZG93biAtIGxpa2UgYSBsZXZlbCBmcm9tIHVwIHRvIGRvd25cbiAgcm9sbDogMCwgLy8gTm8gcm9sbCAtIGxpa2UgYSBsZXZlbCBmcm9tIGxlZnQgdG8gcmlnaHRcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ2VzaXVtTWFwKFxuICBpbnNlcnRpb25FbGVtZW50OiBhbnksXG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55LFxuICBfbm90aWZpY2F0aW9uRWw6IGFueSxcbiAgY29tcG9uZW50RWxlbWVudDogYW55LFxuICBtYXBNb2RlbDogYW55LFxuICBtYXBMYXllcnM6IGFueVxuKSB7XG4gIGxldCBvdmVybGF5cyA9IHt9XG4gIGxldCBzaGFwZXM6IGFueSA9IFtdXG4gIGNvbnN0IHsgbWFwLCByZXF1ZXN0UmVuZGVySGFuZGxlciB9ID0gY3JlYXRlTWFwKGluc2VydGlvbkVsZW1lbnQsIG1hcExheWVycylcbiAgY29uc3QgZHJhd0hlbHBlciA9IG5ldyAoRHJhd0hlbHBlciBhcyBhbnkpKG1hcClcbiAgbWFwLmRyYXdIZWxwZXIgPSBkcmF3SGVscGVyXG4gIGNvbnN0IGJpbGxib2FyZENvbGxlY3Rpb24gPSBzZXR1cEJpbGxib2FyZENvbGxlY3Rpb24oKVxuICBzZXR1cFRvb2x0aXAobWFwLCBzZWxlY3Rpb25JbnRlcmZhY2UpXG4gIGZ1bmN0aW9uIHVwZGF0ZUNvb3JkaW5hdGVzVG9vbHRpcChwb3NpdGlvbjogYW55KSB7XG4gICAgY29uc3QgY2FydGVzaWFuID0gbWFwLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgcG9zaXRpb24sXG4gICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgKVxuICAgIGlmIChDZXNpdW0uZGVmaW5lZChjYXJ0ZXNpYW4pKSB7XG4gICAgICBsZXQgY2FydG9ncmFwaGljID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tQ2FydGVzaWFuKGNhcnRlc2lhbilcbiAgICAgIG1hcE1vZGVsLnVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXMoe1xuICAgICAgICBsYXQ6IGNhcnRvZ3JhcGhpYy5sYXRpdHVkZSAqIENlc2l1bS5NYXRoLkRFR1JFRVNfUEVSX1JBRElBTixcbiAgICAgICAgbG9uOiBjYXJ0b2dyYXBoaWMubG9uZ2l0dWRlICogQ2VzaXVtLk1hdGguREVHUkVFU19QRVJfUkFESUFOLFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgbWFwTW9kZWwuY2xlYXJNb3VzZUNvb3JkaW5hdGVzKClcbiAgICB9XG4gIH1cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDYxMzMpIEZJWE1FOiAnc2VsZWN0aW9uSW50ZXJmYWNlJyBpcyBkZWNsYXJlZCBidXQgaXRzIHZhbHVlIGlzIC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gIGZ1bmN0aW9uIHNldHVwVG9vbHRpcChtYXA6IGFueSwgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnkpIHtcbiAgICBjb25zdCBoYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihtYXAuc2NlbmUuY2FudmFzKVxuICAgIGhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgICQoY29tcG9uZW50RWxlbWVudCkucmVtb3ZlQ2xhc3MoJ2hhcy1mZWF0dXJlJylcbiAgICAgIGlmIChtYXAuc2NlbmUubW9kZSA9PT0gQ2VzaXVtLlNjZW5lTW9kZS5NT1JQSElORykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHVwZGF0ZUNvb3JkaW5hdGVzVG9vbHRpcChtb3ZlbWVudC5lbmRQb3NpdGlvbilcbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgfVxuICBmdW5jdGlvbiBzZXR1cEJpbGxib2FyZENvbGxlY3Rpb24oKSB7XG4gICAgY29uc3QgYmlsbGJvYXJkQ29sbGVjdGlvbiA9IG5ldyBDZXNpdW0uQmlsbGJvYXJkQ29sbGVjdGlvbigpXG4gICAgbWFwLnNjZW5lLnByaW1pdGl2ZXMuYWRkKGJpbGxib2FyZENvbGxlY3Rpb24pXG4gICAgcmV0dXJuIGJpbGxib2FyZENvbGxlY3Rpb25cbiAgfVxuXG4gIGNvbnN0IG1pbmltdW1IZWlnaHRBYm92ZVRlcnJhaW4gPSAyXG4gIGNvbnN0IGV4cG9zZWRNZXRob2RzID0ge1xuICAgIG9uTGVmdENsaWNrKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLnNjZW5lLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCB7IGlkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsXG4gICAgICAgICAgICB5OiBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWFwXG4gICAgICAgIClcbiAgICAgICAgY2FsbGJhY2soZSwgeyBtYXBUYXJnZXQ6IGlkIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgb25MZWZ0Q2xpY2tNYXBBUEkoY2FsbGJhY2s6IGFueSkge1xuICAgICAgbGV0IGxhc3RDbGlja1RpbWUgPSAwXG4gICAgICBsZXQgY2xpY2tUaW1lb3V0ID0gMFxuICAgICAgbWFwLmNsaWNrRXZlbnRIYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihtYXAuY2FudmFzKVxuICAgICAgbWFwLmNsaWNrRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKChlOiBhbnkpID0+IHtcbiAgICAgICAgLy8gT24gYSBkb3VibGUtY2xpY2ssIENlc2l1bSB3aWxsIGZpcmUgMiBsZWZ0LWNsaWNrIGV2ZW50cywgdG9vLiBXZSB3aWxsIG9ubHkgaGFuZGxlIGFcbiAgICAgICAgLy8gY2xpY2sgaWYgMSkgYW5vdGhlciBjbGljayBkaWQgbm90IGhhcHBlbiBpbiB0aGUgbGFzdCAyNTAgbXMsIGFuZCAyKSBhbm90aGVyIGNsaWNrXG4gICAgICAgIC8vIGRvZXMgbm90IGhhcHBlbiBpbiB0aGUgbmV4dCAyNTAgbXMuXG4gICAgICAgIGlmIChjbGlja1RpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGNsaWNrVGltZW91dClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdXJyZW50Q2xpY2tUaW1lID0gRGF0ZS5ub3coKVxuICAgICAgICBpZiAoY3VycmVudENsaWNrVGltZSAtIGxhc3RDbGlja1RpbWUgPiAyNTApIHtcbiAgICAgICAgICBjbGlja1RpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihlLnBvc2l0aW9uLCBtYXApXG4gICAgICAgICAgICBjYWxsYmFjayhsb2NhdGlvbklkKVxuICAgICAgICAgIH0sIDI1MClcbiAgICAgICAgfVxuICAgICAgICBsYXN0Q2xpY2tUaW1lID0gY3VycmVudENsaWNrVGltZVxuICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfQ0xJQ0spXG4gICAgfSxcbiAgICBjbGVhckxlZnRDbGlja01hcEFQSSgpIHtcbiAgICAgIG1hcC5jbGlja0V2ZW50SGFuZGxlcj8uZGVzdHJveSgpXG4gICAgfSxcbiAgICBvblJpZ2h0Q2xpY2soY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuc2NlbmUuY2FudmFzKS5vbignY29udGV4dG1lbnUnLCAoZSkgPT4ge1xuICAgICAgICBjYWxsYmFjayhlKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGNsZWFyUmlnaHRDbGljaygpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub2ZmKCdjb250ZXh0bWVudScpXG4gICAgfSxcbiAgICBvbkRvdWJsZUNsaWNrKCkge1xuICAgICAgbWFwLmRvdWJsZUNsaWNrRXZlbnRIYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihcbiAgICAgICAgbWFwLmNhbnZhc1xuICAgICAgKVxuICAgICAgbWFwLmRvdWJsZUNsaWNrRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKChlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZS5wb3NpdGlvbiwgbWFwKVxuICAgICAgICBpZiAobG9jYXRpb25JZCkge1xuICAgICAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ2xvY2F0aW9uOmRvdWJsZUNsaWNrJywgbG9jYXRpb25JZClcbiAgICAgICAgfVxuICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfRE9VQkxFX0NMSUNLKVxuICAgIH0sXG4gICAgY2xlYXJEb3VibGVDbGljaygpIHtcbiAgICAgIG1hcC5kb3VibGVDbGlja0V2ZW50SGFuZGxlcj8uZGVzdHJveSgpXG4gICAgfSxcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKHtcbiAgICAgIG1vdmVGcm9tLFxuICAgICAgZG93bixcbiAgICAgIG1vdmUsXG4gICAgICB1cCxcbiAgICB9OiB7XG4gICAgICBtb3ZlRnJvbT86IENlc2l1bS5DYXJ0b2dyYXBoaWNcbiAgICAgIGRvd246IGFueVxuICAgICAgbW92ZTogYW55XG4gICAgICB1cDogYW55XG4gICAgfSkge1xuICAgICAgbWFwLnNjZW5lLnNjcmVlblNwYWNlQ2FtZXJhQ29udHJvbGxlci5lbmFibGVSb3RhdGUgPSBmYWxzZVxuICAgICAgbWFwLmRyYWdBbmREcm9wRXZlbnRIYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihcbiAgICAgICAgbWFwLmNhbnZhc1xuICAgICAgKVxuICAgICAgbWFwLmRyYWdBbmREcm9wRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKChlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZS5wb3NpdGlvbiwgbWFwKVxuICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBtYXAuc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQoXG4gICAgICAgICAgZS5wb3NpdGlvbixcbiAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgY2FydG9ncmFwaGljID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tQ2FydGVzaWFuKFxuICAgICAgICAgIGNhcnRlc2lhbixcbiAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgZG93bih7IHBvc2l0aW9uOiBjYXJ0b2dyYXBoaWMsIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQgfSlcbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0RPV04pXG4gICAgICBtYXAuZHJhZ0FuZERyb3BFdmVudEhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKGU6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihlLmVuZFBvc2l0aW9uLCBtYXApXG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IG1hcC5zY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChcbiAgICAgICAgICBlLmVuZFBvc2l0aW9uLFxuICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICAgICAgKVxuICAgICAgICBjb25zdCBjYXJ0b2dyYXBoaWMgPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21DYXJ0ZXNpYW4oXG4gICAgICAgICAgY2FydGVzaWFuLFxuICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICAgICAgKVxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG1vdmVGcm9tXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGxvbmdpdHVkZTogQ2VzaXVtLk1hdGgudG9EZWdyZWVzKFxuICAgICAgICAgICAgICAgIGNhcnRvZ3JhcGhpYy5sb25naXR1ZGUgLSBtb3ZlRnJvbS5sb25naXR1ZGVcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgbGF0aXR1ZGU6IENlc2l1bS5NYXRoLnRvRGVncmVlcyhcbiAgICAgICAgICAgICAgICBjYXJ0b2dyYXBoaWMubGF0aXR1ZGUgLSBtb3ZlRnJvbS5sYXRpdHVkZVxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogbnVsbFxuICAgICAgICBtb3ZlKHsgdHJhbnNsYXRpb24sIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQgfSlcbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICAgICAgbWFwLmRyYWdBbmREcm9wRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKFxuICAgICAgICB1cCxcbiAgICAgICAgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfVVBcbiAgICAgIClcbiAgICB9LFxuICAgIGNsZWFyTW91c2VUcmFja2luZ0Zvckdlb0RyYWcoKSB7XG4gICAgICBtYXAuc2NlbmUuc2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyLmVuYWJsZVJvdGF0ZSA9IHRydWVcbiAgICAgIG1hcC5kcmFnQW5kRHJvcEV2ZW50SGFuZGxlcj8uZGVzdHJveSgpXG4gICAgfSxcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JQb3B1cChcbiAgICAgIGRvd25DYWxsYmFjazogYW55LFxuICAgICAgbW92ZUNhbGxiYWNrOiBhbnksXG4gICAgICB1cENhbGxiYWNrOiBhbnlcbiAgICApIHtcbiAgICAgIG1hcC5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlckZvclBvcHVwUHJldmlldyA9XG4gICAgICAgIG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIobWFwLmNhbnZhcylcbiAgICAgIG1hcC5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlckZvclBvcHVwUHJldmlldy5zZXRJbnB1dEFjdGlvbigoKSA9PiB7XG4gICAgICAgIGRvd25DYWxsYmFjaygpXG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9ET1dOKVxuICAgICAgbWFwLnNjcmVlblNwYWNlRXZlbnRIYW5kbGVyRm9yUG9wdXBQcmV2aWV3LnNldElucHV0QWN0aW9uKCgpID0+IHtcbiAgICAgICAgbW92ZUNhbGxiYWNrKClcbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICAgICAgdGhpcy5vbkxlZnRDbGljayh1cENhbGxiYWNrKVxuICAgIH0sXG4gICAgb25Nb3VzZU1vdmUoY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuc2NlbmUuY2FudmFzKS5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLnNjZW5lLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHtcbiAgICAgICAgICB4OiBlLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdCxcbiAgICAgICAgICB5OiBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wLFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgaWQsIGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihwb3NpdGlvbiwgbWFwKVxuICAgICAgICBjYWxsYmFjayhlLCB7XG4gICAgICAgICAgbWFwVGFyZ2V0OiBpZCxcbiAgICAgICAgICBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuICAgIGNsZWFyTW91c2VNb3ZlKCkge1xuICAgICAgJChtYXAuc2NlbmUuY2FudmFzKS5vZmYoJ21vdXNlbW92ZScpXG4gICAgfSxcbiAgICB0aW1lb3V0SWRzOiBbXSBhcyBudW1iZXJbXSxcbiAgICBvbkNhbWVyYU1vdmVTdGFydChjYWxsYmFjazogYW55KSB7XG4gICAgICB0aGlzLnRpbWVvdXRJZHMuZm9yRWFjaCgodGltZW91dElkOiBhbnkpID0+IHtcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0SWQpXG4gICAgICB9KVxuICAgICAgdGhpcy50aW1lb3V0SWRzID0gW11cbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEubW92ZVN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoY2FsbGJhY2spXG4gICAgfSxcbiAgICBvZmZDYW1lcmFNb3ZlU3RhcnQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjYWxsYmFjaylcbiAgICB9LFxuICAgIG9uQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBjb25zdCB0aW1lb3V0Q2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudGltZW91dElkcy5wdXNoKFxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICB9LCAzMDApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEubW92ZUVuZC5hZGRFdmVudExpc3RlbmVyKHRpbWVvdXRDYWxsYmFjaylcbiAgICB9LFxuICAgIG9mZkNhbWVyYU1vdmVFbmQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5tb3ZlRW5kLnJlbW92ZUV2ZW50TGlzdGVuZXIoY2FsbGJhY2spXG4gICAgfSxcbiAgICBkb1Bhblpvb20oY29vcmRzOiBhbnkpIHtcbiAgICAgIGlmIChjb29yZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgY2FydEFycmF5ID0gY29vcmRzLm1hcCgoY29vcmQ6IGFueSkgPT5cbiAgICAgICAgQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgICBjb29yZFswXSxcbiAgICAgICAgICBjb29yZFsxXSxcbiAgICAgICAgICBtYXAuY2FtZXJhLl9wb3NpdGlvbkNhcnRvZ3JhcGhpYy5oZWlnaHRcbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgaWYgKGNhcnRBcnJheS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgY29uc3QgcG9pbnQgPSBDZXNpdW0uRWxsaXBzb2lkLldHUzg0LmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKFxuICAgICAgICAgIGNhcnRBcnJheVswXVxuICAgICAgICApXG4gICAgICAgIHRoaXMucGFuVG9Db29yZGluYXRlKHBvaW50LCAyLjApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZWN0YW5nbGUgPSBDZXNpdW0uUmVjdGFuZ2xlLmZyb21DYXJ0b2dyYXBoaWNBcnJheShjYXJ0QXJyYXkpXG4gICAgICAgIHRoaXMucGFuVG9SZWN0YW5nbGUocmVjdGFuZ2xlLCB7XG4gICAgICAgICAgZHVyYXRpb246IDIuMCxcbiAgICAgICAgICBjb3JyZWN0aW9uOiAxLjAsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBwYW5Ub1Jlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICBsZXQgcmVjdGFuZ2xlLCBjYXJ0QXJyYXksIHBvaW50XG4gICAgICBjYXJ0QXJyYXkgPSBfLmZsYXR0ZW4oXG4gICAgICAgIHJlc3VsdHNcbiAgICAgICAgICAuZmlsdGVyKChyZXN1bHQ6IGFueSkgPT4gcmVzdWx0Lmhhc0dlb21ldHJ5KCkpXG4gICAgICAgICAgLm1hcChcbiAgICAgICAgICAgIChyZXN1bHQ6IGFueSkgPT5cbiAgICAgICAgICAgICAgXy5tYXAocmVzdWx0LmdldFBvaW50cygpLCAoY29vcmRpbmF0ZSkgPT5cbiAgICAgICAgICAgICAgICBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZVswXSxcbiAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVbMV0sXG4gICAgICAgICAgICAgICAgICBtYXAuY2FtZXJhLl9wb3NpdGlvbkNhcnRvZ3JhcGhpYy5oZWlnaHRcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICAgKVxuICAgICAgKVxuICAgICAgaWYgKGNhcnRBcnJheS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChjYXJ0QXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcG9pbnQgPSBDZXNpdW0uRWxsaXBzb2lkLldHUzg0LmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKGNhcnRBcnJheVswXSlcbiAgICAgICAgICB0aGlzLnBhblRvQ29vcmRpbmF0ZShwb2ludClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWN0YW5nbGUgPSBDZXNpdW0uUmVjdGFuZ2xlLmZyb21DYXJ0b2dyYXBoaWNBcnJheShjYXJ0QXJyYXkpXG4gICAgICAgICAgdGhpcy5wYW5Ub1JlY3RhbmdsZShyZWN0YW5nbGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHBhblRvQ29vcmRpbmF0ZShjb29yZHM6IGFueSwgZHVyYXRpb24gPSAwLjUpIHtcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEuZmx5VG8oe1xuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZGVzdGluYXRpb246IGNvb3JkcyxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwYW5Ub0V4dGVudCgpIHt9LFxuICAgIHBhblRvU2hhcGVzRXh0ZW50KHtcbiAgICAgIGR1cmF0aW9uID0gNTAwLFxuICAgIH06IHtcbiAgICAgIGR1cmF0aW9uPzogbnVtYmVyIC8vIHRha2UgaW4gbWlsbGlzZWNvbmRzIGZvciBub3JtYWxpemF0aW9uIHdpdGggb3BlbmxheWVycyBkdXJhdGlvbiBiZWluZyBtaWxsaXNlY29uZHNcbiAgICB9ID0ge30pIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRQcmltaXRpdmVzID0gbWFwLnNjZW5lLnByaW1pdGl2ZXMuX3ByaW1pdGl2ZXMuZmlsdGVyKFxuICAgICAgICAocHJpbTogYW55KSA9PiBwcmltLmlkXG4gICAgICApXG4gICAgICBjb25zdCBhY3R1YWxQb3NpdGlvbnMgPSBjdXJyZW50UHJpbWl0aXZlcy5yZWR1Y2UoXG4gICAgICAgIChibG9iOiBhbnksIHByaW06IGFueSkgPT4ge1xuICAgICAgICAgIHJldHVybiBibG9iLmNvbmNhdChcbiAgICAgICAgICAgIHByaW0uX3BvbHlsaW5lcy5yZWR1Y2UoKHN1YmJsb2I6IGFueSwgcG9seWxpbmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gc3ViYmxvYi5jb25jYXQocG9seWxpbmUuX2FjdHVhbFBvc2l0aW9ucylcbiAgICAgICAgICAgIH0sIFtdKVxuICAgICAgICAgIClcbiAgICAgICAgfSxcbiAgICAgICAgW11cbiAgICAgIClcbiAgICAgIGlmIChhY3R1YWxQb3NpdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBtYXAuc2NlbmUuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gLyAxMDAwLCAvLyBjaGFuZ2UgdG8gc2Vjb25kc1xuICAgICAgICAgIGRlc3RpbmF0aW9uOiBDZXNpdW0uUmVjdGFuZ2xlLmZyb21DYXJ0ZXNpYW5BcnJheShhY3R1YWxQb3NpdGlvbnMpLFxuICAgICAgICAgIG9yaWVudGF0aW9uOiBMb29raW5nU3RyYWlnaHREb3duT3JpZW50YXRpb24sXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuICAgIGdldENlbnRlclBvc2l0aW9uT2ZQcmltaXRpdmVJZHMocHJpbWl0aXZlSWRzOiBzdHJpbmdbXSkge1xuICAgICAgY29uc3QgcHJpbWl0aXZlcyA9IG1hcC5zY2VuZS5wcmltaXRpdmVzXG4gICAgICBsZXQgcG9zaXRpb25zID0gW10gYXMgYW55W11cblxuICAgICAgLy8gSXRlcmF0ZSBvdmVyIHByaW1pdGl2ZXMgYW5kIGNvbXB1dGUgYm91bmRpbmcgc3BoZXJlc1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmltaXRpdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBwcmltaXRpdmUgPSBwcmltaXRpdmVzLmdldChpKVxuICAgICAgICBpZiAocHJpbWl0aXZlSWRzLmluY2x1ZGVzKHByaW1pdGl2ZS5pZCkpIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHByaW1pdGl2ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgbGV0IHBvaW50ID0gcHJpbWl0aXZlLmdldChqKVxuICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChwb2ludC5wb3NpdGlvbnMpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBib3VuZGluZ1NwaGVyZSA9IENlc2l1bS5Cb3VuZGluZ1NwaGVyZS5mcm9tUG9pbnRzKHBvc2l0aW9ucylcblxuICAgICAgaWYgKFxuICAgICAgICBDZXNpdW0uQm91bmRpbmdTcGhlcmUuZXF1YWxzKFxuICAgICAgICAgIGJvdW5kaW5nU3BoZXJlLFxuICAgICAgICAgIENlc2l1bS5Cb3VuZGluZ1NwaGVyZS5mcm9tUG9pbnRzKFtdKSAvLyBlbXB0eVxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBwb3NpdGlvbnMgdG8gem9vbSB0bycpXG4gICAgICB9XG5cbiAgICAgIC8vIGhlcmUsIG5vdGljZSB3ZSB1c2UgZmx5VG8gaW5zdGVhZCBvZiBmbHlUb0JvdW5kaW5nU3BoZXJlLCBhcyB3aXRoIHRoZSBsYXR0ZXIgdGhlIG9yaWVudGF0aW9uIGNhbid0IGJlIGNvbnRyb2xsZWQgaW4gdGhpcyB2ZXJzaW9uIGFuZCBlbmRzIHVwIHRpbHRlZFxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBwb3NpdGlvbiBhYm92ZSB0aGUgY2VudGVyIG9mIHRoZSBib3VuZGluZyBzcGhlcmVcbiAgICAgIGxldCByYWRpdXMgPSBib3VuZGluZ1NwaGVyZS5yYWRpdXNcbiAgICAgIGxldCBjZW50ZXIgPSBib3VuZGluZ1NwaGVyZS5jZW50ZXJcbiAgICAgIGxldCB1cCA9IENlc2l1bS5DYXJ0ZXNpYW4zLmNsb25lKGNlbnRlcikgLy8gR2V0IHRoZSB1cCBkaXJlY3Rpb24gZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBFYXJ0aCB0byB0aGUgcG9zaXRpb25cbiAgICAgIENlc2l1bS5DYXJ0ZXNpYW4zLm5vcm1hbGl6ZSh1cCwgdXApXG5cbiAgICAgIGxldCBwb3NpdGlvbiA9IENlc2l1bS5DYXJ0ZXNpYW4zLm11bHRpcGx5QnlTY2FsYXIoXG4gICAgICAgIHVwLFxuICAgICAgICByYWRpdXMgKiAyLFxuICAgICAgICBuZXcgQ2VzaXVtLkNhcnRlc2lhbjMoKVxuICAgICAgKSAvLyBBZGp1c3QgbXVsdGlwbGllciBmb3IgZGVzaXJlZCBhbHRpdHVkZVxuICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuYWRkKGNlbnRlciwgcG9zaXRpb24sIHBvc2l0aW9uKSAvLyBNb3ZlIHBvc2l0aW9uIGFib3ZlIHRoZSBjZW50ZXJcblxuICAgICAgcmV0dXJuIHBvc2l0aW9uXG4gICAgfSxcbiAgICB6b29tVG9JZHMoe1xuICAgICAgaWRzLFxuICAgICAgZHVyYXRpb24gPSA1MDAsXG4gICAgfToge1xuICAgICAgaWRzOiBzdHJpbmdbXVxuICAgICAgZHVyYXRpb24/OiBudW1iZXIgLy8gdGFrZSBpbiBtaWxsaXNlY29uZHMgZm9yIG5vcm1hbGl6YXRpb24gd2l0aCBvcGVubGF5ZXJzIGR1cmF0aW9uIGJlaW5nIG1pbGxpc2Vjb25kc1xuICAgIH0pIHtcbiAgICAgIC8vIHVzZSBmbHlUbyBpbnN0ZWFkIG9mIGZseVRvQm91bmRpbmdTcGhlcmUsIGFzIHdpdGggdGhlIGxhdHRlciB0aGUgb3JpZW50YXRpb24gY2FuJ3QgYmUgY29udHJvbGxlZCBpbiB0aGlzIHZlcnNpb24gYW5kIGl0IGVuZHMgdXAgdGlsdGVkXG4gICAgICBtYXAuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgZGVzdGluYXRpb246IHRoaXMuZ2V0Q2VudGVyUG9zaXRpb25PZlByaW1pdGl2ZUlkcyhpZHMpLFxuICAgICAgICBvcmllbnRhdGlvbjogTG9va2luZ1N0cmFpZ2h0RG93bk9yaWVudGF0aW9uLFxuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gLyAxMDAwLCAvLyBjaGFuZ2UgdG8gc2Vjb25kc1xuICAgICAgfSlcbiAgICB9LFxuICAgIHBhblRvUmVjdGFuZ2xlKFxuICAgICAgcmVjdGFuZ2xlOiBhbnksXG4gICAgICBvcHRzID0ge1xuICAgICAgICBkdXJhdGlvbjogMC41LFxuICAgICAgICBjb3JyZWN0aW9uOiAwLjI1LFxuICAgICAgfVxuICAgICkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgIGR1cmF0aW9uOiBvcHRzLmR1cmF0aW9uLFxuICAgICAgICBkZXN0aW5hdGlvbjogZ2V0RGVzdGluYXRpb25Gb3JWaXNpYmxlUGFuKHJlY3RhbmdsZSwgbWFwKSxcbiAgICAgICAgY29tcGxldGUoKSB7XG4gICAgICAgICAgbWFwLnNjZW5lLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgICAgICBkdXJhdGlvbjogb3B0cy5jb3JyZWN0aW9uLFxuICAgICAgICAgICAgZGVzdGluYXRpb246IGdldERlc3RpbmF0aW9uRm9yVmlzaWJsZVBhbihyZWN0YW5nbGUsIG1hcCksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRTaGFwZXMoKSB7XG4gICAgICByZXR1cm4gc2hhcGVzXG4gICAgfSxcbiAgICB6b29tVG9FeHRlbnQoKSB7fSxcbiAgICB6b29tVG9Cb3VuZGluZ0JveCh7IG5vcnRoLCBzb3V0aCwgZWFzdCwgd2VzdCB9OiBhbnkpIHtcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEuZmx5VG8oe1xuICAgICAgICBkdXJhdGlvbjogMC41LFxuICAgICAgICBkZXN0aW5hdGlvbjogQ2VzaXVtLlJlY3RhbmdsZS5mcm9tRGVncmVlcyh3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGgpLFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdldEJvdW5kaW5nQm94KCkge1xuICAgICAgY29uc3Qgdmlld1JlY3RhbmdsZSA9IG1hcC5zY2VuZS5jYW1lcmEuY29tcHV0ZVZpZXdSZWN0YW5nbGUoKVxuICAgICAgcmV0dXJuIF8ubWFwT2JqZWN0KHZpZXdSZWN0YW5nbGUsICh2YWwpID0+IENlc2l1bS5NYXRoLnRvRGVncmVlcyh2YWwpKVxuICAgIH0sXG4gICAgb3ZlcmxheUltYWdlKG1vZGVsOiBMYXp5UXVlcnlSZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1ldGFjYXJkSWQgPSBtb2RlbC5wbGFpbi5pZFxuICAgICAgdGhpcy5yZW1vdmVPdmVybGF5KG1ldGFjYXJkSWQpXG4gICAgICBjb25zdCBjb29yZHMgPSBtb2RlbC5nZXRQb2ludHMoJ2xvY2F0aW9uJylcbiAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpY3MgPSBfLm1hcChjb29yZHMsIChjb29yZCkgPT4ge1xuICAgICAgICBjb29yZCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmQpXG4gICAgICAgIHJldHVybiBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICAgIGNvb3JkLmxvbmdpdHVkZSxcbiAgICAgICAgICBjb29yZC5sYXRpdHVkZSxcbiAgICAgICAgICBjb29yZC5hbHRpdHVkZVxuICAgICAgICApXG4gICAgICB9KVxuICAgICAgY29uc3QgcmVjdGFuZ2xlID0gQ2VzaXVtLlJlY3RhbmdsZS5mcm9tQ2FydG9ncmFwaGljQXJyYXkoY2FydG9ncmFwaGljcylcbiAgICAgIGNvbnN0IG92ZXJsYXlMYXllciA9IG1hcC5zY2VuZS5pbWFnZXJ5TGF5ZXJzLmFkZEltYWdlcnlQcm92aWRlcihcbiAgICAgICAgbmV3IENlc2l1bS5TaW5nbGVUaWxlSW1hZ2VyeVByb3ZpZGVyKHtcbiAgICAgICAgICB1cmw6IG1vZGVsLmN1cnJlbnRPdmVybGF5VXJsLFxuICAgICAgICAgIHJlY3RhbmdsZSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgb3ZlcmxheXNbbWV0YWNhcmRJZF0gPSBvdmVybGF5TGF5ZXJcbiAgICB9LFxuICAgIHJlbW92ZU92ZXJsYXkobWV0YWNhcmRJZDogYW55KSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIGlmIChvdmVybGF5c1ttZXRhY2FyZElkXSkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbWFwLnNjZW5lLmltYWdlcnlMYXllcnMucmVtb3ZlKG92ZXJsYXlzW21ldGFjYXJkSWRdKVxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgZGVsZXRlIG92ZXJsYXlzW21ldGFjYXJkSWRdXG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVBbGxPdmVybGF5cygpIHtcbiAgICAgIGZvciAoY29uc3Qgb3ZlcmxheSBpbiBvdmVybGF5cykge1xuICAgICAgICBpZiAob3ZlcmxheXMuaGFzT3duUHJvcGVydHkob3ZlcmxheSkpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICBtYXAuc2NlbmUuaW1hZ2VyeUxheWVycy5yZW1vdmUob3ZlcmxheXNbb3ZlcmxheV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG92ZXJsYXlzID0ge31cbiAgICB9LFxuICAgIGdldENhcnRvZ3JhcGhpY0NlbnRlck9mQ2x1c3RlckluRGVncmVlcyhjbHVzdGVyOiBDbHVzdGVyVHlwZSkge1xuICAgICAgcmV0dXJuIHV0aWxpdHkuY2FsY3VsYXRlQ2FydG9ncmFwaGljQ2VudGVyT2ZHZW9tZXRyaWVzSW5EZWdyZWVzKFxuICAgICAgICBjbHVzdGVyLnJlc3VsdHNcbiAgICAgIClcbiAgICB9LFxuICAgIGdldFdpbmRvd0xvY2F0aW9uc09mUmVzdWx0cyhyZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXSkge1xuICAgICAgbGV0IG9jY2x1ZGVyOiBhbnlcbiAgICAgIGlmIChtYXAuc2NlbmUubW9kZSA9PT0gQ2VzaXVtLlNjZW5lTW9kZS5TQ0VORTNEKSB7XG4gICAgICAgIG9jY2x1ZGVyID0gbmV3IENlc2l1bS5FbGxpcHNvaWRhbE9jY2x1ZGVyKFxuICAgICAgICAgIENlc2l1bS5FbGxpcHNvaWQuV0dTODQsXG4gICAgICAgICAgbWFwLnNjZW5lLmNhbWVyYS5wb3NpdGlvblxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4ge1xuICAgICAgICBjb25zdCBjYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeSA9XG4gICAgICAgICAgdXRpbGl0eS5jYWxjdWxhdGVDYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeShyZXN1bHQpXG4gICAgICAgIGlmIChvY2NsdWRlciAmJiBpc05vdFZpc2libGUoY2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnksIG9jY2x1ZGVyKSkge1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjZW50ZXIgPSB1dGlsaXR5LmNhbGN1bGF0ZVdpbmRvd0NlbnRlck9mR2VvbWV0cnkoXG4gICAgICAgICAgY2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnksXG4gICAgICAgICAgbWFwXG4gICAgICAgIClcbiAgICAgICAgaWYgKGNlbnRlcikge1xuICAgICAgICAgIHJldHVybiBbY2VudGVyLngsIGNlbnRlci55XVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgICAgQWRkcyBhIGJpbGxib2FyZCBwb2ludCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2ludCBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgICAqL1xuICAgIGFkZFBvaW50V2l0aFRleHQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBjYXJ0b2dyYXBoaWNQb3NpdGlvbiA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgIHBvaW50T2JqZWN0LmxvbmdpdHVkZSxcbiAgICAgICAgcG9pbnRPYmplY3QubGF0aXR1ZGUsXG4gICAgICAgIHBvaW50T2JqZWN0LmFsdGl0dWRlXG4gICAgICApXG4gICAgICBsZXQgY2FydGVzaWFuUG9zaXRpb24gPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKGNhcnRvZ3JhcGhpY1Bvc2l0aW9uKVxuICAgICAgY29uc3QgYmlsbGJvYXJkUmVmID0gYmlsbGJvYXJkQ29sbGVjdGlvbi5hZGQoe1xuICAgICAgICBpbWFnZTogdW5kZWZpbmVkLFxuICAgICAgICBwb3NpdGlvbjogY2FydGVzaWFuUG9zaXRpb24sXG4gICAgICAgIGlkOiBvcHRpb25zLmlkLFxuICAgICAgICBleWVPZmZzZXQsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLnVuc2VsZWN0ZWRJbWFnZSA9IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYucGFydGlhbGx5U2VsZWN0ZWRJbWFnZSA9IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICdibGFjaycsXG4gICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYuc2VsZWN0ZWRJbWFnZSA9IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgZmlsbENvbG9yOiAnb3JhbmdlJyxcbiAgICAgICAgdGV4dDogb3B0aW9ucy5pZC5sZW5ndGgsXG4gICAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICB9KVxuICAgICAgc3dpdGNoIChvcHRpb25zLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICAgIGJpbGxib2FyZFJlZi5pbWFnZSA9IGJpbGxib2FyZFJlZi5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAncGFydGlhbGx5JzpcbiAgICAgICAgICBiaWxsYm9hcmRSZWYuaW1hZ2UgPSBiaWxsYm9hcmRSZWYucGFydGlhbGx5U2VsZWN0ZWRJbWFnZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3Vuc2VsZWN0ZWQnOlxuICAgICAgICAgIGJpbGxib2FyZFJlZi5pbWFnZSA9IGJpbGxib2FyZFJlZi51bnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgLy9pZiB0aGVyZSBpcyBhIHRlcnJhaW4gcHJvdmlkZXIgYW5kIG5vIGFsdGl0dWRlIGhhcyBiZWVuIHNwZWNpZmllZCwgc2FtcGxlIGl0IGZyb20gdGhlIGNvbmZpZ3VyZWQgdGVycmFpbiBwcm92aWRlclxuICAgICAgaWYgKCFwb2ludE9iamVjdC5hbHRpdHVkZSAmJiBtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBDZXNpdW0uc2FtcGxlVGVycmFpbihtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyLCA1LCBbXG4gICAgICAgICAgY2FydG9ncmFwaGljUG9zaXRpb24sXG4gICAgICAgIF0pXG4gICAgICAgIENlc2l1bS53aGVuKHByb21pc2UsICh1cGRhdGVkQ2FydG9ncmFwaGljOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAodXBkYXRlZENhcnRvZ3JhcGhpY1swXS5oZWlnaHQgJiYgIW9wdGlvbnMudmlldy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgY2FydGVzaWFuUG9zaXRpb24gPVxuICAgICAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRDYXJ0b2dyYXBoaWNbMF1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgYmlsbGJvYXJkUmVmLnBvc2l0aW9uID0gY2FydGVzaWFuUG9zaXRpb25cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgICByZXR1cm4gYmlsbGJvYXJkUmVmXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgYmlsbGJvYXJkIHBvaW50IHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgICAqL1xuICAgIGFkZFBvaW50KHBvaW50OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgcG9pbnRPYmplY3QgPSBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50KVxuICAgICAgY29uc3QgY2FydG9ncmFwaGljUG9zaXRpb24gPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICBwb2ludE9iamVjdC5sb25naXR1ZGUsXG4gICAgICAgIHBvaW50T2JqZWN0LmxhdGl0dWRlLFxuICAgICAgICBwb2ludE9iamVjdC5hbHRpdHVkZVxuICAgICAgKVxuICAgICAgY29uc3QgY2FydGVzaWFuUG9zaXRpb24gPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKGNhcnRvZ3JhcGhpY1Bvc2l0aW9uKVxuICAgICAgY29uc3QgYmlsbGJvYXJkUmVmID0gYmlsbGJvYXJkQ29sbGVjdGlvbi5hZGQoe1xuICAgICAgICBpbWFnZTogdW5kZWZpbmVkLFxuICAgICAgICBwb3NpdGlvbjogY2FydGVzaWFuUG9zaXRpb24sXG4gICAgICAgIGlkOiBvcHRpb25zLmlkLFxuICAgICAgICBleWVPZmZzZXQsXG4gICAgICAgIHBpeGVsT2Zmc2V0LFxuICAgICAgICB2ZXJ0aWNhbE9yaWdpbjogb3B0aW9ucy51c2VWZXJ0aWNhbE9yaWdpblxuICAgICAgICAgID8gQ2VzaXVtLlZlcnRpY2FsT3JpZ2luLkJPVFRPTVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBob3Jpem9udGFsT3JpZ2luOiBvcHRpb25zLnVzZUhvcml6b250YWxPcmlnaW5cbiAgICAgICAgICA/IENlc2l1bS5Ib3Jpem9udGFsT3JpZ2luLkNFTlRFUlxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB2aWV3OiBvcHRpb25zLnZpZXcsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLnVuc2VsZWN0ZWRJbWFnZSA9IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgIGZpbGxDb2xvcjogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi5zZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0UGluKHtcbiAgICAgICAgZmlsbENvbG9yOiAnb3JhbmdlJyxcbiAgICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi5pbWFnZSA9IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICA/IGJpbGxib2FyZFJlZi5zZWxlY3RlZEltYWdlXG4gICAgICAgIDogYmlsbGJvYXJkUmVmLnVuc2VsZWN0ZWRJbWFnZVxuICAgICAgLy9pZiB0aGVyZSBpcyBhIHRlcnJhaW4gcHJvdmlkZXIgYW5kIG5vIGFsdGl0dWRlIGhhcyBiZWVuIHNwZWNpZmllZCwgc2FtcGxlIGl0IGZyb20gdGhlIGNvbmZpZ3VyZWQgdGVycmFpbiBwcm92aWRlclxuICAgICAgaWYgKCFwb2ludE9iamVjdC5hbHRpdHVkZSAmJiBtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBDZXNpdW0uc2FtcGxlVGVycmFpbihtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyLCA1LCBbXG4gICAgICAgICAgY2FydG9ncmFwaGljUG9zaXRpb24sXG4gICAgICAgIF0pXG4gICAgICAgIENlc2l1bS53aGVuKHByb21pc2UsICh1cGRhdGVkQ2FydG9ncmFwaGljOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAodXBkYXRlZENhcnRvZ3JhcGhpY1swXS5oZWlnaHQgJiYgIW9wdGlvbnMudmlldy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgYmlsbGJvYXJkUmVmLnBvc2l0aW9uID1cbiAgICAgICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNUb0NhcnRlc2lhbihcbiAgICAgICAgICAgICAgICB1cGRhdGVkQ2FydG9ncmFwaGljWzBdXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgICByZXR1cm4gYmlsbGJvYXJkUmVmXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgcG9seWxpbmUgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gbGluZSBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgICAgICovXG4gICAgYWRkTGluZShsaW5lOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgbGluZU9iamVjdCA9IGxpbmUubWFwKChjb29yZGluYXRlOiBhbnkpID0+XG4gICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGNhcnRQb2ludHMgPSBfLm1hcChsaW5lT2JqZWN0LCAocG9pbnQpID0+XG4gICAgICAgIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgICAgcG9pbnQubG9uZ2l0dWRlLFxuICAgICAgICAgIHBvaW50LmxhdGl0dWRlLFxuICAgICAgICAgIHBvaW50LmFsdGl0dWRlXG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIGNvbnN0IGNhcnRlc2lhbiA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljQXJyYXlUb0NhcnRlc2lhbkFycmF5KGNhcnRQb2ludHMpXG4gICAgICBjb25zdCBwb2x5bGluZUNvbGxlY3Rpb24gPSBuZXcgQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbigpXG4gICAgICBwb2x5bGluZUNvbGxlY3Rpb24udW5zZWxlY3RlZE1hdGVyaWFsID0gQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKFxuICAgICAgICAnUG9seWxpbmVPdXRsaW5lJyxcbiAgICAgICAge1xuICAgICAgICAgIGNvbG9yOiBkZXRlcm1pbmVDZXNpdW1Db2xvcihvcHRpb25zLmNvbG9yKSxcbiAgICAgICAgICBvdXRsaW5lQ29sb3I6IENlc2l1bS5Db2xvci5XSElURSxcbiAgICAgICAgICBvdXRsaW5lV2lkdGg6IDQsXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIHBvbHlsaW5lQ29sbGVjdGlvbi5zZWxlY3RlZE1hdGVyaWFsID0gQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKFxuICAgICAgICAnUG9seWxpbmVPdXRsaW5lJyxcbiAgICAgICAge1xuICAgICAgICAgIGNvbG9yOiBkZXRlcm1pbmVDZXNpdW1Db2xvcihvcHRpb25zLmNvbG9yKSxcbiAgICAgICAgICBvdXRsaW5lQ29sb3I6IENlc2l1bS5Db2xvci5CTEFDSyxcbiAgICAgICAgICBvdXRsaW5lV2lkdGg6IDQsXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIGNvbnN0IHBvbHlsaW5lID0gcG9seWxpbmVDb2xsZWN0aW9uLmFkZCh7XG4gICAgICAgIHdpZHRoOiA4LFxuICAgICAgICBtYXRlcmlhbDogb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgICAgPyBwb2x5bGluZUNvbGxlY3Rpb24uc2VsZWN0ZWRNYXRlcmlhbFxuICAgICAgICAgIDogcG9seWxpbmVDb2xsZWN0aW9uLnVuc2VsZWN0ZWRNYXRlcmlhbCxcbiAgICAgICAgaWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIHBvc2l0aW9uczogY2FydGVzaWFuLFxuICAgICAgfSlcbiAgICAgIGlmIChtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBDZXNpdW0uc2FtcGxlVGVycmFpbihcbiAgICAgICAgICBtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyLFxuICAgICAgICAgIDUsXG4gICAgICAgICAgY2FydFBvaW50c1xuICAgICAgICApXG4gICAgICAgIENlc2l1bS53aGVuKHByb21pc2UsICh1cGRhdGVkQ2FydG9ncmFwaGljOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbnMgPVxuICAgICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNBcnJheVRvQ2FydGVzaWFuQXJyYXkoXG4gICAgICAgICAgICAgIHVwZGF0ZWRDYXJ0b2dyYXBoaWNcbiAgICAgICAgICAgIClcbiAgICAgICAgICBpZiAodXBkYXRlZENhcnRvZ3JhcGhpY1swXS5oZWlnaHQgJiYgIW9wdGlvbnMudmlldy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcG9seWxpbmUucG9zaXRpb25zID0gcG9zaXRpb25zXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnByaW1pdGl2ZXMuYWRkKHBvbHlsaW5lQ29sbGVjdGlvbilcbiAgICAgIHJldHVybiBwb2x5bGluZUNvbGxlY3Rpb25cbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBwb2x5Z29uIGZpbGwgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9seWdvbiBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRQb2x5Z29uKHBvbHlnb246IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2x5Z29uT2JqZWN0ID0gcG9seWdvbi5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT5cbiAgICAgICAgY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKVxuICAgICAgKVxuICAgICAgY29uc3QgY2FydFBvaW50cyA9IF8ubWFwKHBvbHlnb25PYmplY3QsIChwb2ludCkgPT5cbiAgICAgICAgQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgICBwb2ludC5sb25naXR1ZGUsXG4gICAgICAgICAgcG9pbnQubGF0aXR1ZGUsXG4gICAgICAgICAgcG9pbnQuYWx0aXR1ZGVcbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgbGV0IGNhcnRlc2lhbiA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljQXJyYXlUb0NhcnRlc2lhbkFycmF5KGNhcnRQb2ludHMpXG4gICAgICBjb25zdCB1bnNlbGVjdGVkUG9seWdvblJlZiA9IG1hcC5lbnRpdGllcy5hZGQoe1xuICAgICAgICBwb2x5Z29uOiB7XG4gICAgICAgICAgaGllcmFyY2h5OiBjYXJ0ZXNpYW4sXG4gICAgICAgICAgbWF0ZXJpYWw6IG5ldyBDZXNpdW0uR3JpZE1hdGVyaWFsUHJvcGVydHkoe1xuICAgICAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvci5XSElURSxcbiAgICAgICAgICAgIGNlbGxBbHBoYTogMC4wLFxuICAgICAgICAgICAgbGluZUNvdW50OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMiwgMiksXG4gICAgICAgICAgICBsaW5lVGhpY2tuZXNzOiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMi4wLCAyLjApLFxuICAgICAgICAgICAgbGluZU9mZnNldDogbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDAuMCwgMC4wKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBwZXJQb3NpdGlvbkhlaWdodDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgcmVzdWx0SWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIHNob3dXaGVuU2VsZWN0ZWQ6IGZhbHNlLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IHNlbGVjdGVkUG9seWdvblJlZiA9IG1hcC5lbnRpdGllcy5hZGQoe1xuICAgICAgICBwb2x5Z29uOiB7XG4gICAgICAgICAgaGllcmFyY2h5OiBjYXJ0ZXNpYW4sXG4gICAgICAgICAgbWF0ZXJpYWw6IG5ldyBDZXNpdW0uR3JpZE1hdGVyaWFsUHJvcGVydHkoe1xuICAgICAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvci5CTEFDSyxcbiAgICAgICAgICAgIGNlbGxBbHBoYTogMC4wLFxuICAgICAgICAgICAgbGluZUNvdW50OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMiwgMiksXG4gICAgICAgICAgICBsaW5lVGhpY2tuZXNzOiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMi4wLCAyLjApLFxuICAgICAgICAgICAgbGluZU9mZnNldDogbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDAuMCwgMC4wKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBwZXJQb3NpdGlvbkhlaWdodDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgc2hvdzogZmFsc2UsXG4gICAgICAgIHJlc3VsdElkOiBvcHRpb25zLmlkLFxuICAgICAgICBzaG93V2hlblNlbGVjdGVkOiB0cnVlLFxuICAgICAgfSlcbiAgICAgIGlmIChtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBDZXNpdW0uc2FtcGxlVGVycmFpbihcbiAgICAgICAgICBtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyLFxuICAgICAgICAgIDUsXG4gICAgICAgICAgY2FydFBvaW50c1xuICAgICAgICApXG4gICAgICAgIENlc2l1bS53aGVuKHByb21pc2UsICh1cGRhdGVkQ2FydG9ncmFwaGljOiBhbnkpID0+IHtcbiAgICAgICAgICBjYXJ0ZXNpYW4gPVxuICAgICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNBcnJheVRvQ2FydGVzaWFuQXJyYXkoXG4gICAgICAgICAgICAgIHVwZGF0ZWRDYXJ0b2dyYXBoaWNcbiAgICAgICAgICAgIClcbiAgICAgICAgICBpZiAodXBkYXRlZENhcnRvZ3JhcGhpY1swXS5oZWlnaHQgJiYgIW9wdGlvbnMudmlldy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgdW5zZWxlY3RlZFBvbHlnb25SZWYucG9seWdvbi5oaWVyYXJjaHkuc2V0VmFsdWUoY2FydGVzaWFuKVxuICAgICAgICAgICAgc2VsZWN0ZWRQb2x5Z29uUmVmLnBvbHlnb24uaGllcmFyY2h5LnNldFZhbHVlKGNhcnRlc2lhbilcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4gW3Vuc2VsZWN0ZWRQb2x5Z29uUmVmLCBzZWxlY3RlZFBvbHlnb25SZWZdXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gcmVmbGVjdCB3aGV0aGVyIG9yIG5vdCBpdCBpcyBzZWxlY3RlZC5cbiAgICAgICAgICAgICBPcHRpb25zIHBhc3NlZCBpbiBhcmUgY29sb3IgYW5kIGlzU2VsZWN0ZWQuXG4gICAgICAgICAgICAqL1xuICAgIHVwZGF0ZUNsdXN0ZXIoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShnZW9tZXRyeSkpIHtcbiAgICAgICAgZ2VvbWV0cnkuZm9yRWFjaCgoaW5uZXJHZW9tZXRyeSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlQ2x1c3Rlcihpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uQmlsbGJvYXJkKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICAgICAgZ2VvbWV0cnkuaW1hZ2UgPSBnZW9tZXRyeS5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3BhcnRpYWxseSc6XG4gICAgICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IGdlb21ldHJ5LnBhcnRpYWxseVNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAndW5zZWxlY3RlZCc6XG4gICAgICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IGdlb21ldHJ5LnVuc2VsZWN0ZWRJbWFnZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gb3B0aW9ucy5pc1NlbGVjdGVkICE9PSAndW5zZWxlY3RlZCdcbiAgICAgICAgZ2VvbWV0cnkuZXllT2Zmc2V0ID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKDAsIDAsIGlzU2VsZWN0ZWQgPyAtMSA6IDApXG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKSB7XG4gICAgICAgIGdlb21ldHJ5Ll9wb2x5bGluZXMuZm9yRWFjaCgocG9seWxpbmU6IGFueSkgPT4ge1xuICAgICAgICAgIHBvbHlsaW5lLm1hdGVyaWFsID0gQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdQb2x5bGluZU91dGxpbmUnLCB7XG4gICAgICAgICAgICBjb2xvcjogZGV0ZXJtaW5lQ2VzaXVtQ29sb3IoJ3JnYmEoMCwwLDAsIC4xKScpLFxuICAgICAgICAgICAgb3V0bGluZUNvbG9yOiBkZXRlcm1pbmVDZXNpdW1Db2xvcigncmdiYSgyNTUsMjU1LDI1NSwgLjEpJyksXG4gICAgICAgICAgICBvdXRsaW5lV2lkdGg6IDQsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuc2hvd1doZW5TZWxlY3RlZCkge1xuICAgICAgICBnZW9tZXRyeS5zaG93ID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZW9tZXRyeS5zaG93ID0gIW9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byByZWZsZWN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIHNlbGVjdGVkLlxuICAgICAgICAgICAgICBPcHRpb25zIHBhc3NlZCBpbiBhcmUgY29sb3IgYW5kIGlzU2VsZWN0ZWQuXG4gICAgICAgICAgICAgICovXG4gICAgdXBkYXRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShnZW9tZXRyeSkpIHtcbiAgICAgICAgZ2VvbWV0cnkuZm9yRWFjaCgoaW5uZXJHZW9tZXRyeSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlR2VvbWV0cnkoaW5uZXJHZW9tZXRyeSwgb3B0aW9ucylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkJpbGxib2FyZCkge1xuICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gZ2VvbWV0cnkuc2VsZWN0ZWRJbWFnZVxuICAgICAgICAgIDogZ2VvbWV0cnkudW5zZWxlY3RlZEltYWdlXG4gICAgICAgIGdlb21ldHJ5LmV5ZU9mZnNldCA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMyhcbiAgICAgICAgICAwLFxuICAgICAgICAgIDAsXG4gICAgICAgICAgb3B0aW9ucy5pc1NlbGVjdGVkID8gLTEgOiAwXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgZ2VvbWV0cnkuX3BvbHlsaW5lcy5mb3JFYWNoKChwb2x5bGluZTogYW55KSA9PiB7XG4gICAgICAgICAgcG9seWxpbmUubWF0ZXJpYWwgPSBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgICAgID8gZ2VvbWV0cnkuc2VsZWN0ZWRNYXRlcmlhbFxuICAgICAgICAgICAgOiBnZW9tZXRyeS51bnNlbGVjdGVkTWF0ZXJpYWxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuc2hvd1doZW5TZWxlY3RlZCkge1xuICAgICAgICBnZW9tZXRyeS5zaG93ID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZW9tZXRyeS5zaG93ID0gIW9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIGJlIGhpZGRlblxuICAgICAgICAgICAgICovXG4gICAgaGlkZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkJpbGxib2FyZCkge1xuICAgICAgICBnZW9tZXRyeS5zaG93ID0gZmFsc2VcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgZ2VvbWV0cnkuX3BvbHlsaW5lcy5mb3JFYWNoKChwb2x5bGluZTogYW55KSA9PiB7XG4gICAgICAgICAgcG9seWxpbmUuc2hvdyA9IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgc2hvd25cbiAgICAgICAgICAgICAqL1xuICAgIHNob3dHZW9tZXRyeShnZW9tZXRyeTogYW55KSB7XG4gICAgICBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5CaWxsYm9hcmQpIHtcbiAgICAgICAgZ2VvbWV0cnkuc2hvdyA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgZ2VvbWV0cnkuX3BvbHlsaW5lcy5mb3JFYWNoKChwb2x5bGluZTogYW55KSA9PiB7XG4gICAgICAgICAgcG9seWxpbmUuc2hvdyA9IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICB9LFxuICAgIHJlbW92ZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGJpbGxib2FyZENvbGxlY3Rpb24ucmVtb3ZlKGdlb21ldHJ5KVxuICAgICAgbWFwLnNjZW5lLnByaW1pdGl2ZXMucmVtb3ZlKGdlb21ldHJ5KVxuICAgICAgLy91bm1pbmlmaWVkIGNlc2l1bSBjaG9rZXMgaWYgeW91IGZlZWQgYSBnZW9tZXRyeSB3aXRoIGlkIGFzIGFuIEFycmF5XG4gICAgICBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5FbnRpdHkpIHtcbiAgICAgICAgbWFwLmVudGl0aWVzLnJlbW92ZShnZW9tZXRyeSlcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICB9LFxuICAgIGRlc3Ryb3lTaGFwZXMoKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcbiAgICAgICAgc2hhcGUuZGVzdHJveSgpXG4gICAgICB9KVxuICAgICAgc2hhcGVzID0gW11cbiAgICAgIGlmIChtYXAgJiYgbWFwLnNjZW5lKSB7XG4gICAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldE1hcCgpIHtcbiAgICAgIHJldHVybiBtYXBcbiAgICB9LFxuICAgIHpvb21JbigpIHtcbiAgICAgIGNvbnN0IGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyhcbiAgICAgICAgICBtYXAuc2NlbmUuY2FtZXJhLnBvc2l0aW9uXG4gICAgICAgIClcblxuICAgICAgY29uc3QgdGVycmFpbkhlaWdodCA9IG1hcC5zY2VuZS5nbG9iZS5nZXRIZWlnaHQoXG4gICAgICAgIGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljXG4gICAgICApXG5cbiAgICAgIGNvbnN0IGhlaWdodEFib3ZlR3JvdW5kID1cbiAgICAgICAgY2FtZXJhUG9zaXRpb25DYXJ0b2dyYXBoaWMuaGVpZ2h0IC0gdGVycmFpbkhlaWdodFxuXG4gICAgICBjb25zdCB6b29tQW1vdW50ID0gaGVpZ2h0QWJvdmVHcm91bmQgLyAyIC8vIGJhc2ljYWxseSBkb3VibGUgdGhlIGN1cnJlbnQgem9vbVxuXG4gICAgICBjb25zdCBtYXhab29tQW1vdW50ID0gaGVpZ2h0QWJvdmVHcm91bmQgLSBtaW5pbXVtSGVpZ2h0QWJvdmVUZXJyYWluXG5cbiAgICAgIC8vIGlmIHRoZSB6b29tIGFtb3VudCBpcyBncmVhdGVyIHRoYW4gdGhlIG1heCB6b29tIGFtb3VudCwgem9vbSB0byB0aGUgbWF4IHpvb20gYW1vdW50XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLnpvb21JbihNYXRoLm1pbihtYXhab29tQW1vdW50LCB6b29tQW1vdW50KSlcbiAgICB9LFxuICAgIHpvb21PdXQoKSB7XG4gICAgICBjb25zdCBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpYyA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoXG4gICAgICAgICAgbWFwLnNjZW5lLmNhbWVyYS5wb3NpdGlvblxuICAgICAgICApXG5cbiAgICAgIGNvbnN0IHRlcnJhaW5IZWlnaHQgPSBtYXAuc2NlbmUuZ2xvYmUuZ2V0SGVpZ2h0KFxuICAgICAgICBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpY1xuICAgICAgKVxuXG4gICAgICBjb25zdCBoZWlnaHRBYm92ZUdyb3VuZCA9XG4gICAgICAgIGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljLmhlaWdodCAtIHRlcnJhaW5IZWlnaHRcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEuem9vbU91dChoZWlnaHRBYm92ZUdyb3VuZClcbiAgICB9LFxuICAgIGRlc3Ryb3koKSB7XG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC5vZmYoJ21hcDpyZXF1ZXN0UmVuZGVyJywgcmVxdWVzdFJlbmRlckhhbmRsZXIpXG4gICAgICBtYXAuZGVzdHJveSgpXG4gICAgfSxcbiAgfVxuICByZXR1cm4gZXhwb3NlZE1ldGhvZHNcbn1cbiJdfQ==