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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLmNlc2l1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2Nlc2l1bS9tYXAuY2VzaXVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxjQUFjLE1BQU0sbUJBQW1CLENBQUE7QUFDOUMsT0FBTyxLQUFLLE1BQU0sc0JBQXNCLENBQUE7QUFDeEMsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3JFLE9BQU8sRUFDTCwwQkFBMEIsRUFDMUIsWUFBWSxHQUNiLE1BQU0sMENBQTBDLENBQUE7QUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBR3JELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3ZFLElBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQTtBQUM5QixJQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNoRCxJQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDaEYsSUFBTSxvQkFBb0IsR0FBRywwQkFBMEIsQ0FBQTtBQUN2RCxTQUFTLG9CQUFv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QUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FDL0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUMxQixDQUFBO1lBRUgsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUM3QywwQkFBMEIsQ0FDM0IsQ0FBQTtZQUVELElBQU0saUJBQWlCLEdBQ3JCLDBCQUEwQixDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUE7WUFDbkQsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFDN0MsQ0FBQztRQUNELE9BQU87WUFDTCxDQUFDO1lBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtZQUNuRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDZixDQUFDO0tBQ0YsQ0FBQTtJQUNELE9BQU8sY0FBYyxDQUFBO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuL3V0aWxpdHknXG5pbXBvcnQgRHJhd2luZ1V0aWxpdHkgZnJvbSAnLi4vRHJhd2luZ1V0aWxpdHknXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vLi4vLi4vanMvd3JlcXInXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjZXNpLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBDZXNpdW0gZnJvbSAnY2VzaXVtL0J1aWxkL0Nlc2l1bS9DZXNpdW0nXG5pbXBvcnQgRHJhd0hlbHBlciBmcm9tICcuLi8uLi8uLi8uLi9saWIvY2VzaXVtLWRyYXdoZWxwZXIvRHJhd0hlbHBlcidcbmltcG9ydCB7XG4gIENlc2l1bUltYWdlcnlQcm92aWRlclR5cGVzLFxuICBDZXNpdW1MYXllcnMsXG59IGZyb20gJy4uLy4uLy4uLy4uL2pzL2NvbnRyb2xsZXJzL2Nlc2l1bS5sYXllcnMnXG5pbXBvcnQgeyBEcmF3aW5nIH0gZnJvbSAnLi4vLi4vLi4vc2luZ2xldG9ucy9kcmF3aW5nJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IENsdXN0ZXJUeXBlIH0gZnJvbSAnLi4vcmVhY3QvZ2VvbWV0cmllcydcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5jb25zdCBkZWZhdWx0Q29sb3IgPSAnIzNjNmRkNSdcbmNvbnN0IGV5ZU9mZnNldCA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMygwLCAwLCAwKVxuY29uc3QgcGl4ZWxPZmZzZXQgPSBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMC4wLCAwKVxuQ2VzaXVtLkJpbmdNYXBzQXBpLmRlZmF1bHRLZXkgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0QmluZ0tleSgpIHx8IDBcbmNvbnN0IGltYWdlcnlQcm92aWRlclR5cGVzID0gQ2VzaXVtSW1hZ2VyeVByb3ZpZGVyVHlwZXNcbmZ1bmN0aW9uIHNldHVwVGVycmFpblByb3ZpZGVyKHZpZXdlcjogYW55LCB0ZXJyYWluUHJvdmlkZXI6IGFueSkge1xuICBpZiAodGVycmFpblByb3ZpZGVyID09IG51bGwgfHwgdGVycmFpblByb3ZpZGVyID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zb2xlLmluZm8oYFVua25vd24gdGVycmFpbiBwcm92aWRlciBjb25maWd1cmF0aW9uLlxuICAgICAgICAgICAgICBEZWZhdWx0IENlc2l1bSB0ZXJyYWluIHByb3ZpZGVyIHdpbGwgYmUgdXNlZC5gKVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IHsgdHlwZSwgLi4udGVycmFpbkNvbmZpZyB9ID0gdGVycmFpblByb3ZpZGVyXG4gIGNvbnN0IFRlcnJhaW5Qcm92aWRlciA9IGltYWdlcnlQcm92aWRlclR5cGVzW3R5cGVdXG4gIGlmIChUZXJyYWluUHJvdmlkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnNvbGUud2FybihgXG4gICAgICAgICAgICBVbmtub3duIHRlcnJhaW4gcHJvdmlkZXIgdHlwZTogJHt0eXBlfS5cbiAgICAgICAgICAgIERlZmF1bHQgQ2VzaXVtIHRlcnJhaW4gcHJvdmlkZXIgd2lsbCBiZSB1c2VkLlxuICAgICAgICBgKVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGRlZmF1bHRDZXNpdW1UZXJyYWluUHJvdmlkZXIgPSB2aWV3ZXIuc2NlbmUudGVycmFpblByb3ZpZGVyXG4gIGNvbnN0IGN1c3RvbVRlcnJhaW5Qcm92aWRlciA9IG5ldyBUZXJyYWluUHJvdmlkZXIodGVycmFpbkNvbmZpZylcbiAgY3VzdG9tVGVycmFpblByb3ZpZGVyLmVycm9yRXZlbnQuYWRkRXZlbnRMaXN0ZW5lcigoKSA9PiB7XG4gICAgY29uc29sZS53YXJuKGBcbiAgICAgICAgICAgIElzc3VlIHVzaW5nIHRlcnJhaW4gcHJvdmlkZXI6ICR7SlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAuLi50ZXJyYWluQ29uZmlnLFxuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICBGYWxsaW5nIGJhY2sgdG8gZGVmYXVsdCBDZXNpdW0gdGVycmFpbiBwcm92aWRlci5cbiAgICAgICAgYClcbiAgICB2aWV3ZXIuc2NlbmUudGVycmFpblByb3ZpZGVyID0gZGVmYXVsdENlc2l1bVRlcnJhaW5Qcm92aWRlclxuICB9KVxuICB2aWV3ZXIuc2NlbmUudGVycmFpblByb3ZpZGVyID0gY3VzdG9tVGVycmFpblByb3ZpZGVyXG59XG5mdW5jdGlvbiBjcmVhdGVNYXAoaW5zZXJ0aW9uRWxlbWVudDogYW55LCBtYXBMYXllcnM6IGFueSkge1xuICBjb25zdCBsYXllckNvbGxlY3Rpb25Db250cm9sbGVyID0gbmV3IENlc2l1bUxheWVycyh7XG4gICAgY29sbGVjdGlvbjogbWFwTGF5ZXJzLFxuICB9KVxuICBjb25zdCB2aWV3ZXIgPSBsYXllckNvbGxlY3Rpb25Db250cm9sbGVyLm1ha2VNYXAoe1xuICAgIGVsZW1lbnQ6IGluc2VydGlvbkVsZW1lbnQsXG4gICAgY2VzaXVtT3B0aW9uczoge1xuICAgICAgc2NlbmVNb2RlOiBDZXNpdW0uU2NlbmVNb2RlLlNDRU5FM0QsXG4gICAgICBjcmVkaXRDb250YWluZXI6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgYW5pbWF0aW9uOiBmYWxzZSxcbiAgICAgIGZ1bGxzY3JlZW5CdXR0b246IGZhbHNlLFxuICAgICAgdGltZWxpbmU6IGZhbHNlLFxuICAgICAgZ2VvY29kZXI6IGZhbHNlLFxuICAgICAgaG9tZUJ1dHRvbjogZmFsc2UsXG4gICAgICBuYXZpZ2F0aW9uSGVscEJ1dHRvbjogZmFsc2UsXG4gICAgICBzY2VuZU1vZGVQaWNrZXI6IGZhbHNlLFxuICAgICAgc2VsZWN0aW9uSW5kaWNhdG9yOiBmYWxzZSxcbiAgICAgIGluZm9Cb3g6IGZhbHNlLFxuICAgICAgLy9za3lCb3g6IGZhbHNlLFxuICAgICAgLy9za3lBdG1vc3BoZXJlOiBmYWxzZSxcbiAgICAgIGJhc2VMYXllclBpY2tlcjogZmFsc2UsXG4gICAgICBpbWFnZXJ5UHJvdmlkZXI6IGZhbHNlLFxuICAgICAgbWFwTW9kZTJEOiAwLFxuICAgIH0sXG4gIH0pXG4gIGNvbnN0IHJlcXVlc3RSZW5kZXIgPSAoKSA9PiB7XG4gICAgdmlld2VyLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICB9XG4gIDsod3JlcXIgYXMgYW55KS52ZW50Lm9uKCdtYXA6cmVxdWVzdFJlbmRlcicsIHJlcXVlc3RSZW5kZXIpXG4gIC8vIGRpc2FibGUgcmlnaHQgY2xpY2sgZHJhZyB0byB6b29tIChjb250ZXh0IG1lbnUgaW5zdGVhZCk7XG4gIHZpZXdlci5zY2VuZS5zY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIuem9vbUV2ZW50VHlwZXMgPSBbXG4gICAgQ2VzaXVtLkNhbWVyYUV2ZW50VHlwZS5XSEVFTCxcbiAgICBDZXNpdW0uQ2FtZXJhRXZlbnRUeXBlLlBJTkNILFxuICBdXG4gIHZpZXdlci5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoKSA9PiB7XG4gICAgaWYgKCFEcmF3aW5nLmlzRHJhd2luZygpKSB7XG4gICAgICAkKCdib2R5JykubW91c2Vkb3duKClcbiAgICB9XG4gIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0RPV04pXG4gIHZpZXdlci5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoKSA9PiB7XG4gICAgaWYgKCFEcmF3aW5nLmlzRHJhd2luZygpKSB7XG4gICAgICAkKCdib2R5JykubW91c2Vkb3duKClcbiAgICB9XG4gIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5SSUdIVF9ET1dOKVxuICBzZXR1cFRlcnJhaW5Qcm92aWRlcihcbiAgICB2aWV3ZXIsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFRlcnJhaW5Qcm92aWRlcigpXG4gIClcbiAgcmV0dXJuIHtcbiAgICBtYXA6IHZpZXdlcixcbiAgICByZXF1ZXN0UmVuZGVySGFuZGxlcjogcmVxdWVzdFJlbmRlcixcbiAgfVxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uOiBhbnksIG1hcDogYW55KSB7XG4gIGxldCBpZCwgbG9jYXRpb25JZFxuICBjb25zdCBwaWNrZWRPYmplY3QgPSBtYXAuc2NlbmUucGljayhwb3NpdGlvbilcbiAgaWYgKHBpY2tlZE9iamVjdCkge1xuICAgIGlkID0gcGlja2VkT2JqZWN0LmlkXG4gICAgaWYgKGlkICYmIGlkLmNvbnN0cnVjdG9yID09PSBDZXNpdW0uRW50aXR5KSB7XG4gICAgICBpZCA9IGlkLnJlc3VsdElkXG4gICAgfVxuICAgIGxvY2F0aW9uSWQgPSBwaWNrZWRPYmplY3QuY29sbGVjdGlvbj8ubG9jYXRpb25JZFxuICB9XG4gIHJldHVybiB7IGlkLCBsb2NhdGlvbklkIH1cbn1cbmZ1bmN0aW9uIGV4cGFuZFJlY3RhbmdsZShyZWN0YW5nbGU6IGFueSkge1xuICBjb25zdCBzY2FsaW5nRmFjdG9yID0gMC4wNVxuICBsZXQgd2lkdGhHYXAgPSBNYXRoLmFicyhyZWN0YW5nbGUuZWFzdCkgLSBNYXRoLmFicyhyZWN0YW5nbGUud2VzdClcbiAgbGV0IGhlaWdodEdhcCA9IE1hdGguYWJzKHJlY3RhbmdsZS5ub3J0aCkgLSBNYXRoLmFicyhyZWN0YW5nbGUuc291dGgpXG4gIC8vZW5zdXJlIHJlY3RhbmdsZSBoYXMgc29tZSBzaXplXG4gIGlmICh3aWR0aEdhcCA9PT0gMCkge1xuICAgIHdpZHRoR2FwID0gMVxuICB9XG4gIGlmIChoZWlnaHRHYXAgPT09IDApIHtcbiAgICBoZWlnaHRHYXAgPSAxXG4gIH1cbiAgcmVjdGFuZ2xlLmVhc3QgPSByZWN0YW5nbGUuZWFzdCArIE1hdGguYWJzKHNjYWxpbmdGYWN0b3IgKiB3aWR0aEdhcClcbiAgcmVjdGFuZ2xlLm5vcnRoID0gcmVjdGFuZ2xlLm5vcnRoICsgTWF0aC5hYnMoc2NhbGluZ0ZhY3RvciAqIGhlaWdodEdhcClcbiAgcmVjdGFuZ2xlLnNvdXRoID0gcmVjdGFuZ2xlLnNvdXRoIC0gTWF0aC5hYnMoc2NhbGluZ0ZhY3RvciAqIGhlaWdodEdhcClcbiAgcmVjdGFuZ2xlLndlc3QgPSByZWN0YW5nbGUud2VzdCAtIE1hdGguYWJzKHNjYWxpbmdGYWN0b3IgKiB3aWR0aEdhcClcbiAgcmV0dXJuIHJlY3RhbmdsZVxufVxuZnVuY3Rpb24gZ2V0RGVzdGluYXRpb25Gb3JWaXNpYmxlUGFuKHJlY3RhbmdsZTogYW55LCBtYXA6IGFueSkge1xuICBsZXQgZGVzdGluYXRpb25Gb3Jab29tID0gZXhwYW5kUmVjdGFuZ2xlKHJlY3RhbmdsZSlcbiAgaWYgKG1hcC5zY2VuZS5tb2RlID09PSBDZXNpdW0uU2NlbmVNb2RlLlNDRU5FM0QpIHtcbiAgICBkZXN0aW5hdGlvbkZvclpvb20gPVxuICAgICAgbWFwLmNhbWVyYS5nZXRSZWN0YW5nbGVDYW1lcmFDb29yZGluYXRlcyhkZXN0aW5hdGlvbkZvclpvb20pXG4gIH1cbiAgcmV0dXJuIGRlc3RpbmF0aW9uRm9yWm9vbVxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lQ2VzaXVtQ29sb3IoY29sb3I6IGFueSkge1xuICByZXR1cm4gIV8uaXNVbmRlZmluZWQoY29sb3IpXG4gICAgPyBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGNvbG9yKVxuICAgIDogQ2VzaXVtLkNvbG9yLmZyb21Dc3NDb2xvclN0cmluZyhkZWZhdWx0Q29sb3IpXG59XG5mdW5jdGlvbiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGU6IGFueSkge1xuICByZXR1cm4ge1xuICAgIGxhdGl0dWRlOiBjb29yZGluYXRlWzFdLFxuICAgIGxvbmdpdHVkZTogY29vcmRpbmF0ZVswXSxcbiAgICBhbHRpdHVkZTogY29vcmRpbmF0ZVsyXSxcbiAgfVxufVxuZnVuY3Rpb24gaXNOb3RWaXNpYmxlKGNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5OiBhbnksIG9jY2x1ZGVyOiBhbnkpIHtcbiAgcmV0dXJuICFvY2NsdWRlci5pc1BvaW50VmlzaWJsZShjYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeSlcbn1cblxuLy8gaHR0cHM6Ly9jZXNpdW0uY29tL2xlYXJuL2Nlc2l1bWpzL3JlZi1kb2MvQ2FtZXJhLmh0bWxcbmV4cG9ydCBjb25zdCBMb29raW5nU3RyYWlnaHREb3duT3JpZW50YXRpb24gPSB7XG4gIGhlYWRpbmc6IDAsIC8vIE5vcnRoIGlzIHVwIC0gbGlrZSBjb21wYXNzIGRpcmVjdGlvblxuICBwaXRjaDogLUNlc2l1bS5NYXRoLlBJX09WRVJfVFdPLCAvLyBMb29raW5nIHN0cmFpZ2h0IGRvd24gLSBsaWtlIGEgbGV2ZWwgZnJvbSB1cCB0byBkb3duXG4gIHJvbGw6IDAsIC8vIE5vIHJvbGwgLSBsaWtlIGEgbGV2ZWwgZnJvbSBsZWZ0IHRvIHJpZ2h0XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENlc2l1bU1hcChcbiAgaW5zZXJ0aW9uRWxlbWVudDogYW55LFxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueSxcbiAgX25vdGlmaWNhdGlvbkVsOiBhbnksXG4gIGNvbXBvbmVudEVsZW1lbnQ6IGFueSxcbiAgbWFwTW9kZWw6IGFueSxcbiAgbWFwTGF5ZXJzOiBhbnlcbikge1xuICBsZXQgb3ZlcmxheXMgPSB7fVxuICBsZXQgc2hhcGVzOiBhbnkgPSBbXVxuICBjb25zdCB7IG1hcCwgcmVxdWVzdFJlbmRlckhhbmRsZXIgfSA9IGNyZWF0ZU1hcChpbnNlcnRpb25FbGVtZW50LCBtYXBMYXllcnMpXG4gIGNvbnN0IGRyYXdIZWxwZXIgPSBuZXcgKERyYXdIZWxwZXIgYXMgYW55KShtYXApXG4gIG1hcC5kcmF3SGVscGVyID0gZHJhd0hlbHBlclxuICBjb25zdCBiaWxsYm9hcmRDb2xsZWN0aW9uID0gc2V0dXBCaWxsYm9hcmRDb2xsZWN0aW9uKClcbiAgc2V0dXBUb29sdGlwKG1hcCwgc2VsZWN0aW9uSW50ZXJmYWNlKVxuICBmdW5jdGlvbiB1cGRhdGVDb29yZGluYXRlc1Rvb2x0aXAocG9zaXRpb246IGFueSkge1xuICAgIGNvbnN0IGNhcnRlc2lhbiA9IG1hcC5jYW1lcmEucGlja0VsbGlwc29pZChcbiAgICAgIHBvc2l0aW9uLFxuICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgIClcbiAgICBpZiAoQ2VzaXVtLmRlZmluZWQoY2FydGVzaWFuKSkge1xuICAgICAgbGV0IGNhcnRvZ3JhcGhpYyA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbUNhcnRlc2lhbihjYXJ0ZXNpYW4pXG4gICAgICBtYXBNb2RlbC51cGRhdGVNb3VzZUNvb3JkaW5hdGVzKHtcbiAgICAgICAgbGF0OiBjYXJ0b2dyYXBoaWMubGF0aXR1ZGUgKiBDZXNpdW0uTWF0aC5ERUdSRUVTX1BFUl9SQURJQU4sXG4gICAgICAgIGxvbjogY2FydG9ncmFwaGljLmxvbmdpdHVkZSAqIENlc2l1bS5NYXRoLkRFR1JFRVNfUEVSX1JBRElBTixcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcE1vZGVsLmNsZWFyTW91c2VDb29yZGluYXRlcygpXG4gICAgfVxuICB9XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg2MTMzKSBGSVhNRTogJ3NlbGVjdGlvbkludGVyZmFjZScgaXMgZGVjbGFyZWQgYnV0IGl0cyB2YWx1ZSBpcyAuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICBmdW5jdGlvbiBzZXR1cFRvb2x0aXAobWFwOiBhbnksIHNlbGVjdGlvbkludGVyZmFjZTogYW55KSB7XG4gICAgY29uc3QgaGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIobWFwLnNjZW5lLmNhbnZhcylcbiAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICAkKGNvbXBvbmVudEVsZW1lbnQpLnJlbW92ZUNsYXNzKCdoYXMtZmVhdHVyZScpXG4gICAgICBpZiAobWFwLnNjZW5lLm1vZGUgPT09IENlc2l1bS5TY2VuZU1vZGUuTU9SUEhJTkcpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB1cGRhdGVDb29yZGluYXRlc1Rvb2x0aXAobW92ZW1lbnQuZW5kUG9zaXRpb24pXG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLk1PVVNFX01PVkUpXG4gIH1cbiAgZnVuY3Rpb24gc2V0dXBCaWxsYm9hcmRDb2xsZWN0aW9uKCkge1xuICAgIGNvbnN0IGJpbGxib2FyZENvbGxlY3Rpb24gPSBuZXcgQ2VzaXVtLkJpbGxib2FyZENvbGxlY3Rpb24oKVxuICAgIG1hcC5zY2VuZS5wcmltaXRpdmVzLmFkZChiaWxsYm9hcmRDb2xsZWN0aW9uKVxuICAgIHJldHVybiBiaWxsYm9hcmRDb2xsZWN0aW9uXG4gIH1cblxuICBjb25zdCBtaW5pbXVtSGVpZ2h0QWJvdmVUZXJyYWluID0gMlxuICBjb25zdCBleHBvc2VkTWV0aG9kcyA9IHtcbiAgICBvbkxlZnRDbGljayhjYWxsYmFjazogYW55KSB7XG4gICAgICAkKG1hcC5zY2VuZS5jYW52YXMpLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IG1hcC5zY2VuZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY29uc3QgeyBpZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IGUuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0LFxuICAgICAgICAgICAgeTogZS5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1hcFxuICAgICAgICApXG4gICAgICAgIGNhbGxiYWNrKGUsIHsgbWFwVGFyZ2V0OiBpZCB9KVxuICAgICAgfSlcbiAgICB9LFxuICAgIG9uTGVmdENsaWNrTWFwQVBJKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIGxldCBsYXN0Q2xpY2tUaW1lID0gMFxuICAgICAgbGV0IGNsaWNrVGltZW91dCA9IDBcbiAgICAgIG1hcC5jbGlja0V2ZW50SGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIobWFwLmNhbnZhcylcbiAgICAgIG1hcC5jbGlja0V2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoZTogYW55KSA9PiB7XG4gICAgICAgIC8vIE9uIGEgZG91YmxlLWNsaWNrLCBDZXNpdW0gd2lsbCBmaXJlIDIgbGVmdC1jbGljayBldmVudHMsIHRvby4gV2Ugd2lsbCBvbmx5IGhhbmRsZSBhXG4gICAgICAgIC8vIGNsaWNrIGlmIDEpIGFub3RoZXIgY2xpY2sgZGlkIG5vdCBoYXBwZW4gaW4gdGhlIGxhc3QgMjUwIG1zLCBhbmQgMikgYW5vdGhlciBjbGlja1xuICAgICAgICAvLyBkb2VzIG5vdCBoYXBwZW4gaW4gdGhlIG5leHQgMjUwIG1zLlxuICAgICAgICBpZiAoY2xpY2tUaW1lb3V0ID4gMCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVvdXQpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY3VycmVudENsaWNrVGltZSA9IERhdGUubm93KClcbiAgICAgICAgaWYgKGN1cnJlbnRDbGlja1RpbWUgLSBsYXN0Q2xpY2tUaW1lID4gMjUwKSB7XG4gICAgICAgICAgY2xpY2tUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZS5wb3NpdGlvbiwgbWFwKVxuICAgICAgICAgICAgY2FsbGJhY2sobG9jYXRpb25JZClcbiAgICAgICAgICB9LCAyNTApXG4gICAgICAgIH1cbiAgICAgICAgbGFzdENsaWNrVGltZSA9IGN1cnJlbnRDbGlja1RpbWVcbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0NMSUNLKVxuICAgIH0sXG4gICAgY2xlYXJMZWZ0Q2xpY2tNYXBBUEkoKSB7XG4gICAgICBtYXAuY2xpY2tFdmVudEhhbmRsZXI/LmRlc3Ryb3koKVxuICAgIH0sXG4gICAgb25SaWdodENsaWNrKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub24oJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgY2FsbGJhY2soZSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhclJpZ2h0Q2xpY2soKSB7XG4gICAgICAkKG1hcC5zY2VuZS5jYW52YXMpLm9mZignY29udGV4dG1lbnUnKVxuICAgIH0sXG4gICAgb25Eb3VibGVDbGljaygpIHtcbiAgICAgIG1hcC5kb3VibGVDbGlja0V2ZW50SGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoXG4gICAgICAgIG1hcC5jYW52YXNcbiAgICAgIClcbiAgICAgIG1hcC5kb3VibGVDbGlja0V2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKGUucG9zaXRpb24sIG1hcClcbiAgICAgICAgaWYgKGxvY2F0aW9uSWQpIHtcbiAgICAgICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdsb2NhdGlvbjpkb3VibGVDbGljaycsIGxvY2F0aW9uSWQpXG4gICAgICAgIH1cbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0RPVUJMRV9DTElDSylcbiAgICB9LFxuICAgIGNsZWFyRG91YmxlQ2xpY2soKSB7XG4gICAgICBtYXAuZG91YmxlQ2xpY2tFdmVudEhhbmRsZXI/LmRlc3Ryb3koKVxuICAgIH0sXG4gICAgb25Nb3VzZVRyYWNraW5nRm9yR2VvRHJhZyh7XG4gICAgICBtb3ZlRnJvbSxcbiAgICAgIGRvd24sXG4gICAgICBtb3ZlLFxuICAgICAgdXAsXG4gICAgfToge1xuICAgICAgbW92ZUZyb20/OiBDZXNpdW0uQ2FydG9ncmFwaGljXG4gICAgICBkb3duOiBhbnlcbiAgICAgIG1vdmU6IGFueVxuICAgICAgdXA6IGFueVxuICAgIH0pIHtcbiAgICAgIG1hcC5zY2VuZS5zY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIuZW5hYmxlUm90YXRlID0gZmFsc2VcbiAgICAgIG1hcC5kcmFnQW5kRHJvcEV2ZW50SGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoXG4gICAgICAgIG1hcC5jYW52YXNcbiAgICAgIClcbiAgICAgIG1hcC5kcmFnQW5kRHJvcEV2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKGUucG9zaXRpb24sIG1hcClcbiAgICAgICAgY29uc3QgY2FydGVzaWFuID0gbWFwLnNjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgIGUucG9zaXRpb24sXG4gICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpYyA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbUNhcnRlc2lhbihcbiAgICAgICAgICBjYXJ0ZXNpYW4sXG4gICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGRvd24oeyBwb3NpdGlvbjogY2FydG9ncmFwaGljLCBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkIH0pXG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9ET1dOKVxuICAgICAgbWFwLmRyYWdBbmREcm9wRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKChlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZS5lbmRQb3NpdGlvbiwgbWFwKVxuICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBtYXAuc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQoXG4gICAgICAgICAgZS5lbmRQb3NpdGlvbixcbiAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgY2FydG9ncmFwaGljID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tQ2FydGVzaWFuKFxuICAgICAgICAgIGNhcnRlc2lhbixcbiAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBtb3ZlRnJvbVxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBsb25naXR1ZGU6IENlc2l1bS5NYXRoLnRvRGVncmVlcyhcbiAgICAgICAgICAgICAgICBjYXJ0b2dyYXBoaWMubG9uZ2l0dWRlIC0gbW92ZUZyb20ubG9uZ2l0dWRlXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIGxhdGl0dWRlOiBDZXNpdW0uTWF0aC50b0RlZ3JlZXMoXG4gICAgICAgICAgICAgICAgY2FydG9ncmFwaGljLmxhdGl0dWRlIC0gbW92ZUZyb20ubGF0aXR1ZGVcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IG51bGxcbiAgICAgICAgbW92ZSh7IHRyYW5zbGF0aW9uLCBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkIH0pXG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgICAgIG1hcC5kcmFnQW5kRHJvcEV2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbihcbiAgICAgICAgdXAsXG4gICAgICAgIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX1VQXG4gICAgICApXG4gICAgfSxcbiAgICBjbGVhck1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKCkge1xuICAgICAgbWFwLnNjZW5lLnNjcmVlblNwYWNlQ2FtZXJhQ29udHJvbGxlci5lbmFibGVSb3RhdGUgPSB0cnVlXG4gICAgICBtYXAuZHJhZ0FuZERyb3BFdmVudEhhbmRsZXI/LmRlc3Ryb3koKVxuICAgIH0sXG4gICAgb25Nb3VzZVRyYWNraW5nRm9yUG9wdXAoXG4gICAgICBkb3duQ2FsbGJhY2s6IGFueSxcbiAgICAgIG1vdmVDYWxsYmFjazogYW55LFxuICAgICAgdXBDYWxsYmFjazogYW55XG4gICAgKSB7XG4gICAgICBtYXAuc2NyZWVuU3BhY2VFdmVudEhhbmRsZXJGb3JQb3B1cFByZXZpZXcgPVxuICAgICAgICBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKG1hcC5jYW52YXMpXG4gICAgICBtYXAuc2NyZWVuU3BhY2VFdmVudEhhbmRsZXJGb3JQb3B1cFByZXZpZXcuc2V0SW5wdXRBY3Rpb24oKCkgPT4ge1xuICAgICAgICBkb3duQ2FsbGJhY2soKVxuICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfRE9XTilcbiAgICAgIG1hcC5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlckZvclBvcHVwUHJldmlldy5zZXRJbnB1dEFjdGlvbigoKSA9PiB7XG4gICAgICAgIG1vdmVDYWxsYmFjaygpXG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgICAgIHRoaXMub25MZWZ0Q2xpY2sodXBDYWxsYmFjaylcbiAgICB9LFxuICAgIG9uTW91c2VNb3ZlKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IG1hcC5zY2VuZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB7XG4gICAgICAgICAgeDogZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsXG4gICAgICAgICAgeTogZS5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcCxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGlkLCBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24ocG9zaXRpb24sIG1hcClcbiAgICAgICAgY2FsbGJhY2soZSwge1xuICAgICAgICAgIG1hcFRhcmdldDogaWQsXG4gICAgICAgICAgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhck1vdXNlTW92ZSgpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub2ZmKCdtb3VzZW1vdmUnKVxuICAgIH0sXG4gICAgdGltZW91dElkczogW10gYXMgbnVtYmVyW10sXG4gICAgb25DYW1lcmFNb3ZlU3RhcnQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgdGhpcy50aW1lb3V0SWRzLmZvckVhY2goKHRpbWVvdXRJZDogYW55KSA9PiB7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dElkKVxuICAgICAgfSlcbiAgICAgIHRoaXMudGltZW91dElkcyA9IFtdXG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLm1vdmVTdGFydC5hZGRFdmVudExpc3RlbmVyKGNhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEubW92ZVN0YXJ0LnJlbW92ZUV2ZW50TGlzdGVuZXIoY2FsbGJhY2spXG4gICAgfSxcbiAgICBvbkNhbWVyYU1vdmVFbmQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgY29uc3QgdGltZW91dENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnRpbWVvdXRJZHMucHVzaChcbiAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgfSwgMzAwKVxuICAgICAgICApXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLm1vdmVFbmQuYWRkRXZlbnRMaXN0ZW5lcih0aW1lb3V0Q2FsbGJhY2spXG4gICAgfSxcbiAgICBvZmZDYW1lcmFNb3ZlRW5kKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEubW92ZUVuZC5yZW1vdmVFdmVudExpc3RlbmVyKGNhbGxiYWNrKVxuICAgIH0sXG4gICAgZG9QYW5ab29tKGNvb3JkczogYW55KSB7XG4gICAgICBpZiAoY29vcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNhcnRBcnJheSA9IGNvb3Jkcy5tYXAoKGNvb3JkOiBhbnkpID0+XG4gICAgICAgIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgICAgY29vcmRbMF0sXG4gICAgICAgICAgY29vcmRbMV0sXG4gICAgICAgICAgbWFwLmNhbWVyYS5fcG9zaXRpb25DYXJ0b2dyYXBoaWMuaGVpZ2h0XG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIGlmIChjYXJ0QXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gQ2VzaXVtLkVsbGlwc29pZC5XR1M4NC5jYXJ0b2dyYXBoaWNUb0NhcnRlc2lhbihcbiAgICAgICAgICBjYXJ0QXJyYXlbMF1cbiAgICAgICAgKVxuICAgICAgICB0aGlzLnBhblRvQ29vcmRpbmF0ZShwb2ludCwgMi4wKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVjdGFuZ2xlID0gQ2VzaXVtLlJlY3RhbmdsZS5mcm9tQ2FydG9ncmFwaGljQXJyYXkoY2FydEFycmF5KVxuICAgICAgICB0aGlzLnBhblRvUmVjdGFuZ2xlKHJlY3RhbmdsZSwge1xuICAgICAgICAgIGR1cmF0aW9uOiAyLjAsXG4gICAgICAgICAgY29ycmVjdGlvbjogMS4wLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgcGFuVG9SZXN1bHRzKHJlc3VsdHM6IGFueSkge1xuICAgICAgbGV0IHJlY3RhbmdsZSwgY2FydEFycmF5LCBwb2ludFxuICAgICAgY2FydEFycmF5ID0gXy5mbGF0dGVuKFxuICAgICAgICByZXN1bHRzXG4gICAgICAgICAgLmZpbHRlcigocmVzdWx0OiBhbnkpID0+IHJlc3VsdC5oYXNHZW9tZXRyeSgpKVxuICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAocmVzdWx0OiBhbnkpID0+XG4gICAgICAgICAgICAgIF8ubWFwKHJlc3VsdC5nZXRQb2ludHMoJ2xvY2F0aW9uJyksIChjb29yZGluYXRlKSA9PlxuICAgICAgICAgICAgICAgIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgICAgICAgICAgICBjb29yZGluYXRlWzBdLFxuICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZVsxXSxcbiAgICAgICAgICAgICAgICAgIG1hcC5jYW1lcmEuX3Bvc2l0aW9uQ2FydG9ncmFwaGljLmhlaWdodFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICApXG4gICAgICApXG4gICAgICBpZiAoY2FydEFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGNhcnRBcnJheS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBwb2ludCA9IENlc2l1bS5FbGxpcHNvaWQuV0dTODQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oY2FydEFycmF5WzBdKVxuICAgICAgICAgIHRoaXMucGFuVG9Db29yZGluYXRlKHBvaW50KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlY3RhbmdsZSA9IENlc2l1bS5SZWN0YW5nbGUuZnJvbUNhcnRvZ3JhcGhpY0FycmF5KGNhcnRBcnJheSlcbiAgICAgICAgICB0aGlzLnBhblRvUmVjdGFuZ2xlKHJlY3RhbmdsZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcGFuVG9Db29yZGluYXRlKGNvb3JkczogYW55LCBkdXJhdGlvbiA9IDAuNSkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBkZXN0aW5hdGlvbjogY29vcmRzLFxuICAgICAgfSlcbiAgICB9LFxuICAgIHBhblRvRXh0ZW50KCkge30sXG4gICAgcGFuVG9TaGFwZXNFeHRlbnQoe1xuICAgICAgZHVyYXRpb24gPSA1MDAsXG4gICAgfToge1xuICAgICAgZHVyYXRpb24/OiBudW1iZXIgLy8gdGFrZSBpbiBtaWxsaXNlY29uZHMgZm9yIG5vcm1hbGl6YXRpb24gd2l0aCBvcGVubGF5ZXJzIGR1cmF0aW9uIGJlaW5nIG1pbGxpc2Vjb25kc1xuICAgIH0gPSB7fSkge1xuICAgICAgY29uc3QgY3VycmVudFByaW1pdGl2ZXMgPSBtYXAuc2NlbmUucHJpbWl0aXZlcy5fcHJpbWl0aXZlcy5maWx0ZXIoXG4gICAgICAgIChwcmltOiBhbnkpID0+IHByaW0uaWRcbiAgICAgIClcbiAgICAgIGNvbnN0IGFjdHVhbFBvc2l0aW9ucyA9IGN1cnJlbnRQcmltaXRpdmVzLnJlZHVjZShcbiAgICAgICAgKGJsb2I6IGFueSwgcHJpbTogYW55KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGJsb2IuY29uY2F0KFxuICAgICAgICAgICAgcHJpbS5fcG9seWxpbmVzLnJlZHVjZSgoc3ViYmxvYjogYW55LCBwb2x5bGluZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBzdWJibG9iLmNvbmNhdChwb2x5bGluZS5fYWN0dWFsUG9zaXRpb25zKVxuICAgICAgICAgICAgfSwgW10pXG4gICAgICAgICAgKVxuICAgICAgICB9LFxuICAgICAgICBbXVxuICAgICAgKVxuICAgICAgaWYgKGFjdHVhbFBvc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIG1hcC5zY2VuZS5jYW1lcmEuZmx5VG8oe1xuICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAvIDEwMDAsIC8vIGNoYW5nZSB0byBzZWNvbmRzXG4gICAgICAgICAgZGVzdGluYXRpb246IENlc2l1bS5SZWN0YW5nbGUuZnJvbUNhcnRlc2lhbkFycmF5KGFjdHVhbFBvc2l0aW9ucyksXG4gICAgICAgICAgb3JpZW50YXRpb246IExvb2tpbmdTdHJhaWdodERvd25PcmllbnRhdGlvbixcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sXG4gICAgZ2V0Q2VudGVyUG9zaXRpb25PZlByaW1pdGl2ZUlkcyhwcmltaXRpdmVJZHM6IHN0cmluZ1tdKSB7XG4gICAgICBjb25zdCBwcmltaXRpdmVzID0gbWFwLnNjZW5lLnByaW1pdGl2ZXNcbiAgICAgIGxldCBwb3NpdGlvbnMgPSBbXSBhcyBhbnlbXVxuXG4gICAgICAvLyBJdGVyYXRlIG92ZXIgcHJpbWl0aXZlcyBhbmQgY29tcHV0ZSBib3VuZGluZyBzcGhlcmVzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByaW1pdGl2ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHByaW1pdGl2ZSA9IHByaW1pdGl2ZXMuZ2V0KGkpXG4gICAgICAgIGlmIChwcmltaXRpdmVJZHMuaW5jbHVkZXMocHJpbWl0aXZlLmlkKSkge1xuICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcHJpbWl0aXZlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBsZXQgcG9pbnQgPSBwcmltaXRpdmUuZ2V0KGopXG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KHBvaW50LnBvc2l0aW9ucylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGJvdW5kaW5nU3BoZXJlID0gQ2VzaXVtLkJvdW5kaW5nU3BoZXJlLmZyb21Qb2ludHMocG9zaXRpb25zKVxuXG4gICAgICBpZiAoXG4gICAgICAgIENlc2l1bS5Cb3VuZGluZ1NwaGVyZS5lcXVhbHMoXG4gICAgICAgICAgYm91bmRpbmdTcGhlcmUsXG4gICAgICAgICAgQ2VzaXVtLkJvdW5kaW5nU3BoZXJlLmZyb21Qb2ludHMoW10pIC8vIGVtcHR5XG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHBvc2l0aW9ucyB0byB6b29tIHRvJylcbiAgICAgIH1cblxuICAgICAgLy8gaGVyZSwgbm90aWNlIHdlIHVzZSBmbHlUbyBpbnN0ZWFkIG9mIGZseVRvQm91bmRpbmdTcGhlcmUsIGFzIHdpdGggdGhlIGxhdHRlciB0aGUgb3JpZW50YXRpb24gY2FuJ3QgYmUgY29udHJvbGxlZCBpbiB0aGlzIHZlcnNpb24gYW5kIGVuZHMgdXAgdGlsdGVkXG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIHBvc2l0aW9uIGFib3ZlIHRoZSBjZW50ZXIgb2YgdGhlIGJvdW5kaW5nIHNwaGVyZVxuICAgICAgbGV0IHJhZGl1cyA9IGJvdW5kaW5nU3BoZXJlLnJhZGl1c1xuICAgICAgbGV0IGNlbnRlciA9IGJvdW5kaW5nU3BoZXJlLmNlbnRlclxuICAgICAgbGV0IHVwID0gQ2VzaXVtLkNhcnRlc2lhbjMuY2xvbmUoY2VudGVyKSAvLyBHZXQgdGhlIHVwIGRpcmVjdGlvbiBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIEVhcnRoIHRvIHRoZSBwb3NpdGlvblxuICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMubm9ybWFsaXplKHVwLCB1cClcblxuICAgICAgbGV0IHBvc2l0aW9uID0gQ2VzaXVtLkNhcnRlc2lhbjMubXVsdGlwbHlCeVNjYWxhcihcbiAgICAgICAgdXAsXG4gICAgICAgIHJhZGl1cyAqIDIsXG4gICAgICAgIG5ldyBDZXNpdW0uQ2FydGVzaWFuMygpXG4gICAgICApIC8vIEFkanVzdCBtdWx0aXBsaWVyIGZvciBkZXNpcmVkIGFsdGl0dWRlXG4gICAgICBDZXNpdW0uQ2FydGVzaWFuMy5hZGQoY2VudGVyLCBwb3NpdGlvbiwgcG9zaXRpb24pIC8vIE1vdmUgcG9zaXRpb24gYWJvdmUgdGhlIGNlbnRlclxuXG4gICAgICByZXR1cm4gcG9zaXRpb25cbiAgICB9LFxuICAgIHpvb21Ub0lkcyh7XG4gICAgICBpZHMsXG4gICAgICBkdXJhdGlvbiA9IDUwMCxcbiAgICB9OiB7XG4gICAgICBpZHM6IHN0cmluZ1tdXG4gICAgICBkdXJhdGlvbj86IG51bWJlciAvLyB0YWtlIGluIG1pbGxpc2Vjb25kcyBmb3Igbm9ybWFsaXphdGlvbiB3aXRoIG9wZW5sYXllcnMgZHVyYXRpb24gYmVpbmcgbWlsbGlzZWNvbmRzXG4gICAgfSkge1xuICAgICAgLy8gdXNlIGZseVRvIGluc3RlYWQgb2YgZmx5VG9Cb3VuZGluZ1NwaGVyZSwgYXMgd2l0aCB0aGUgbGF0dGVyIHRoZSBvcmllbnRhdGlvbiBjYW4ndCBiZSBjb250cm9sbGVkIGluIHRoaXMgdmVyc2lvbiBhbmQgaXQgZW5kcyB1cCB0aWx0ZWRcbiAgICAgIG1hcC5jYW1lcmEuZmx5VG8oe1xuICAgICAgICBkZXN0aW5hdGlvbjogdGhpcy5nZXRDZW50ZXJQb3NpdGlvbk9mUHJpbWl0aXZlSWRzKGlkcyksXG4gICAgICAgIG9yaWVudGF0aW9uOiBMb29raW5nU3RyYWlnaHREb3duT3JpZW50YXRpb24sXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAvIDEwMDAsIC8vIGNoYW5nZSB0byBzZWNvbmRzXG4gICAgICB9KVxuICAgIH0sXG4gICAgcGFuVG9SZWN0YW5nbGUoXG4gICAgICByZWN0YW5nbGU6IGFueSxcbiAgICAgIG9wdHMgPSB7XG4gICAgICAgIGR1cmF0aW9uOiAwLjUsXG4gICAgICAgIGNvcnJlY3Rpb246IDAuMjUsXG4gICAgICB9XG4gICAgKSB7XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgZHVyYXRpb246IG9wdHMuZHVyYXRpb24sXG4gICAgICAgIGRlc3RpbmF0aW9uOiBnZXREZXN0aW5hdGlvbkZvclZpc2libGVQYW4ocmVjdGFuZ2xlLCBtYXApLFxuICAgICAgICBjb21wbGV0ZSgpIHtcbiAgICAgICAgICBtYXAuc2NlbmUuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBvcHRzLmNvcnJlY3Rpb24sXG4gICAgICAgICAgICBkZXN0aW5hdGlvbjogZ2V0RGVzdGluYXRpb25Gb3JWaXNpYmxlUGFuKHJlY3RhbmdsZSwgbWFwKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdldFNoYXBlcygpIHtcbiAgICAgIHJldHVybiBzaGFwZXNcbiAgICB9LFxuICAgIHpvb21Ub0V4dGVudCgpIHt9LFxuICAgIHpvb21Ub0JvdW5kaW5nQm94KHsgbm9ydGgsIHNvdXRoLCBlYXN0LCB3ZXN0IH06IGFueSkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgIGR1cmF0aW9uOiAwLjUsXG4gICAgICAgIGRlc3RpbmF0aW9uOiBDZXNpdW0uUmVjdGFuZ2xlLmZyb21EZWdyZWVzKHdlc3QsIHNvdXRoLCBlYXN0LCBub3J0aCksXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2V0Qm91bmRpbmdCb3goKSB7XG4gICAgICBjb25zdCB2aWV3UmVjdGFuZ2xlID0gbWFwLnNjZW5lLmNhbWVyYS5jb21wdXRlVmlld1JlY3RhbmdsZSgpXG4gICAgICByZXR1cm4gXy5tYXBPYmplY3Qodmlld1JlY3RhbmdsZSwgKHZhbCkgPT4gQ2VzaXVtLk1hdGgudG9EZWdyZWVzKHZhbCkpXG4gICAgfSxcbiAgICBvdmVybGF5SW1hZ2UobW9kZWw6IExhenlRdWVyeVJlc3VsdCkge1xuICAgICAgY29uc3QgbWV0YWNhcmRJZCA9IG1vZGVsLnBsYWluLmlkXG4gICAgICB0aGlzLnJlbW92ZU92ZXJsYXkobWV0YWNhcmRJZClcbiAgICAgIGNvbnN0IGNvb3JkcyA9IG1vZGVsLmdldFBvaW50cygnbG9jYXRpb24nKVxuICAgICAgY29uc3QgY2FydG9ncmFwaGljcyA9IF8ubWFwKGNvb3JkcywgKGNvb3JkKSA9PiB7XG4gICAgICAgIGNvb3JkID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZClcbiAgICAgICAgcmV0dXJuIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgICAgY29vcmQubG9uZ2l0dWRlLFxuICAgICAgICAgIGNvb3JkLmxhdGl0dWRlLFxuICAgICAgICAgIGNvb3JkLmFsdGl0dWRlXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgICBjb25zdCByZWN0YW5nbGUgPSBDZXNpdW0uUmVjdGFuZ2xlLmZyb21DYXJ0b2dyYXBoaWNBcnJheShjYXJ0b2dyYXBoaWNzKVxuICAgICAgY29uc3Qgb3ZlcmxheUxheWVyID0gbWFwLnNjZW5lLmltYWdlcnlMYXllcnMuYWRkSW1hZ2VyeVByb3ZpZGVyKFxuICAgICAgICBuZXcgQ2VzaXVtLlNpbmdsZVRpbGVJbWFnZXJ5UHJvdmlkZXIoe1xuICAgICAgICAgIHVybDogbW9kZWwuY3VycmVudE92ZXJsYXlVcmwsXG4gICAgICAgICAgcmVjdGFuZ2xlLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBvdmVybGF5c1ttZXRhY2FyZElkXSA9IG92ZXJsYXlMYXllclxuICAgIH0sXG4gICAgcmVtb3ZlT3ZlcmxheShtZXRhY2FyZElkOiBhbnkpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgaWYgKG92ZXJsYXlzW21ldGFjYXJkSWRdKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBtYXAuc2NlbmUuaW1hZ2VyeUxheWVycy5yZW1vdmUob3ZlcmxheXNbbWV0YWNhcmRJZF0pXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBkZWxldGUgb3ZlcmxheXNbbWV0YWNhcmRJZF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZUFsbE92ZXJsYXlzKCkge1xuICAgICAgZm9yIChjb25zdCBvdmVybGF5IGluIG92ZXJsYXlzKSB7XG4gICAgICAgIGlmIChvdmVybGF5cy5oYXNPd25Qcm9wZXJ0eShvdmVybGF5KSkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIG1hcC5zY2VuZS5pbWFnZXJ5TGF5ZXJzLnJlbW92ZShvdmVybGF5c1tvdmVybGF5XSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb3ZlcmxheXMgPSB7fVxuICAgIH0sXG4gICAgZ2V0Q2FydG9ncmFwaGljQ2VudGVyT2ZDbHVzdGVySW5EZWdyZWVzKGNsdXN0ZXI6IENsdXN0ZXJUeXBlKSB7XG4gICAgICByZXR1cm4gdXRpbGl0eS5jYWxjdWxhdGVDYXJ0b2dyYXBoaWNDZW50ZXJPZkdlb21ldHJpZXNJbkRlZ3JlZXMoXG4gICAgICAgIGNsdXN0ZXIucmVzdWx0c1xuICAgICAgKVxuICAgIH0sXG4gICAgZ2V0V2luZG93TG9jYXRpb25zT2ZSZXN1bHRzKHJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdKSB7XG4gICAgICBsZXQgb2NjbHVkZXI6IGFueVxuICAgICAgaWYgKG1hcC5zY2VuZS5tb2RlID09PSBDZXNpdW0uU2NlbmVNb2RlLlNDRU5FM0QpIHtcbiAgICAgICAgb2NjbHVkZXIgPSBuZXcgQ2VzaXVtLkVsbGlwc29pZGFsT2NjbHVkZXIoXG4gICAgICAgICAgQ2VzaXVtLkVsbGlwc29pZC5XR1M4NCxcbiAgICAgICAgICBtYXAuc2NlbmUuY2FtZXJhLnBvc2l0aW9uXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiB7XG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5ID1cbiAgICAgICAgICB1dGlsaXR5LmNhbGN1bGF0ZUNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5KHJlc3VsdClcbiAgICAgICAgaWYgKG9jY2x1ZGVyICYmIGlzTm90VmlzaWJsZShjYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeSwgb2NjbHVkZXIpKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNlbnRlciA9IHV0aWxpdHkuY2FsY3VsYXRlV2luZG93Q2VudGVyT2ZHZW9tZXRyeShcbiAgICAgICAgICBjYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeSxcbiAgICAgICAgICBtYXBcbiAgICAgICAgKVxuICAgICAgICBpZiAoY2VudGVyKSB7XG4gICAgICAgICAgcmV0dXJuIFtjZW50ZXIueCwgY2VudGVyLnldXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgICBBZGRzIGEgYmlsbGJvYXJkIHBvaW50IHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZCwgYW5kIGEgY29sb3IuXG4gICAgICAgICAgICAgICovXG4gICAgYWRkUG9pbnRXaXRoVGV4dChwb2ludDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvaW50T2JqZWN0ID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludClcbiAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpY1Bvc2l0aW9uID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgcG9pbnRPYmplY3QubG9uZ2l0dWRlLFxuICAgICAgICBwb2ludE9iamVjdC5sYXRpdHVkZSxcbiAgICAgICAgcG9pbnRPYmplY3QuYWx0aXR1ZGVcbiAgICAgIClcbiAgICAgIGxldCBjYXJ0ZXNpYW5Qb3NpdGlvbiA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oY2FydG9ncmFwaGljUG9zaXRpb24pXG4gICAgICBjb25zdCBiaWxsYm9hcmRSZWYgPSBiaWxsYm9hcmRDb2xsZWN0aW9uLmFkZCh7XG4gICAgICAgIGltYWdlOiB1bmRlZmluZWQsXG4gICAgICAgIHBvc2l0aW9uOiBjYXJ0ZXNpYW5Qb3NpdGlvbixcbiAgICAgICAgaWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIGV5ZU9mZnNldCxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYudW5zZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi5wYXJ0aWFsbHlTZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICBzdHJva2VDb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi5zZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICBmaWxsQ29sb3I6ICdvcmFuZ2UnLFxuICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBzd2l0Y2ggKG9wdGlvbnMuaXNTZWxlY3RlZCkge1xuICAgICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgICAgYmlsbGJvYXJkUmVmLmltYWdlID0gYmlsbGJvYXJkUmVmLnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdwYXJ0aWFsbHknOlxuICAgICAgICAgIGJpbGxib2FyZFJlZi5pbWFnZSA9IGJpbGxib2FyZFJlZi5wYXJ0aWFsbHlTZWxlY3RlZEltYWdlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAndW5zZWxlY3RlZCc6XG4gICAgICAgICAgYmlsbGJvYXJkUmVmLmltYWdlID0gYmlsbGJvYXJkUmVmLnVuc2VsZWN0ZWRJbWFnZVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICAvL2lmIHRoZXJlIGlzIGEgdGVycmFpbiBwcm92aWRlciBhbmQgbm8gYWx0aXR1ZGUgaGFzIGJlZW4gc3BlY2lmaWVkLCBzYW1wbGUgaXQgZnJvbSB0aGUgY29uZmlndXJlZCB0ZXJyYWluIHByb3ZpZGVyXG4gICAgICBpZiAoIXBvaW50T2JqZWN0LmFsdGl0dWRlICYmIG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IENlc2l1bS5zYW1wbGVUZXJyYWluKG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIsIDUsIFtcbiAgICAgICAgICBjYXJ0b2dyYXBoaWNQb3NpdGlvbixcbiAgICAgICAgXSlcbiAgICAgICAgQ2VzaXVtLndoZW4ocHJvbWlzZSwgKHVwZGF0ZWRDYXJ0b2dyYXBoaWM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmICh1cGRhdGVkQ2FydG9ncmFwaGljWzBdLmhlaWdodCAmJiAhb3B0aW9ucy52aWV3LmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICBjYXJ0ZXNpYW5Qb3NpdGlvbiA9XG4gICAgICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oXG4gICAgICAgICAgICAgICAgdXBkYXRlZENhcnRvZ3JhcGhpY1swXVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICBiaWxsYm9hcmRSZWYucG9zaXRpb24gPSBjYXJ0ZXNpYW5Qb3NpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICAgIHJldHVybiBiaWxsYm9hcmRSZWZcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBiaWxsYm9hcmQgcG9pbnQgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZCwgYW5kIGEgY29sb3IuXG4gICAgICAgICAgICAgICovXG4gICAgYWRkUG9pbnQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBjYXJ0b2dyYXBoaWNQb3NpdGlvbiA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgIHBvaW50T2JqZWN0LmxvbmdpdHVkZSxcbiAgICAgICAgcG9pbnRPYmplY3QubGF0aXR1ZGUsXG4gICAgICAgIHBvaW50T2JqZWN0LmFsdGl0dWRlXG4gICAgICApXG4gICAgICBjb25zdCBjYXJ0ZXNpYW5Qb3NpdGlvbiA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oY2FydG9ncmFwaGljUG9zaXRpb24pXG4gICAgICBjb25zdCBiaWxsYm9hcmRSZWYgPSBiaWxsYm9hcmRDb2xsZWN0aW9uLmFkZCh7XG4gICAgICAgIGltYWdlOiB1bmRlZmluZWQsXG4gICAgICAgIHBvc2l0aW9uOiBjYXJ0ZXNpYW5Qb3NpdGlvbixcbiAgICAgICAgaWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIGV5ZU9mZnNldCxcbiAgICAgICAgcGl4ZWxPZmZzZXQsXG4gICAgICAgIHZlcnRpY2FsT3JpZ2luOiBvcHRpb25zLnVzZVZlcnRpY2FsT3JpZ2luXG4gICAgICAgICAgPyBDZXNpdW0uVmVydGljYWxPcmlnaW4uQk9UVE9NXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGhvcml6b250YWxPcmlnaW46IG9wdGlvbnMudXNlSG9yaXpvbnRhbE9yaWdpblxuICAgICAgICAgID8gQ2VzaXVtLkhvcml6b250YWxPcmlnaW4uQ0VOVEVSXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIHZpZXc6IG9wdGlvbnMudmlldyxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYudW5zZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0UGluKHtcbiAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLnNlbGVjdGVkSW1hZ2UgPSBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICBmaWxsQ29sb3I6ICdvcmFuZ2UnLFxuICAgICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLmltYWdlID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgID8gYmlsbGJvYXJkUmVmLnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgOiBiaWxsYm9hcmRSZWYudW5zZWxlY3RlZEltYWdlXG4gICAgICAvL2lmIHRoZXJlIGlzIGEgdGVycmFpbiBwcm92aWRlciBhbmQgbm8gYWx0aXR1ZGUgaGFzIGJlZW4gc3BlY2lmaWVkLCBzYW1wbGUgaXQgZnJvbSB0aGUgY29uZmlndXJlZCB0ZXJyYWluIHByb3ZpZGVyXG4gICAgICBpZiAoIXBvaW50T2JqZWN0LmFsdGl0dWRlICYmIG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IENlc2l1bS5zYW1wbGVUZXJyYWluKG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIsIDUsIFtcbiAgICAgICAgICBjYXJ0b2dyYXBoaWNQb3NpdGlvbixcbiAgICAgICAgXSlcbiAgICAgICAgQ2VzaXVtLndoZW4ocHJvbWlzZSwgKHVwZGF0ZWRDYXJ0b2dyYXBoaWM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmICh1cGRhdGVkQ2FydG9ncmFwaGljWzBdLmhlaWdodCAmJiAhb3B0aW9ucy52aWV3LmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICBiaWxsYm9hcmRSZWYucG9zaXRpb24gPVxuICAgICAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRDYXJ0b2dyYXBoaWNbMF1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICAgIHJldHVybiBiaWxsYm9hcmRSZWZcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBwb2x5bGluZSB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBsaW5lIGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRMaW5lKGxpbmU6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBsaW5lT2JqZWN0ID0gbGluZS5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT5cbiAgICAgICAgY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKVxuICAgICAgKVxuICAgICAgY29uc3QgY2FydFBvaW50cyA9IF8ubWFwKGxpbmVPYmplY3QsIChwb2ludCkgPT5cbiAgICAgICAgQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgICBwb2ludC5sb25naXR1ZGUsXG4gICAgICAgICAgcG9pbnQubGF0aXR1ZGUsXG4gICAgICAgICAgcG9pbnQuYWx0aXR1ZGVcbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgY29uc3QgY2FydGVzaWFuID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNBcnJheVRvQ2FydGVzaWFuQXJyYXkoY2FydFBvaW50cylcbiAgICAgIGNvbnN0IHBvbHlsaW5lQ29sbGVjdGlvbiA9IG5ldyBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKClcbiAgICAgIHBvbHlsaW5lQ29sbGVjdGlvbi51bnNlbGVjdGVkTWF0ZXJpYWwgPSBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoXG4gICAgICAgICdQb2x5bGluZU91dGxpbmUnLFxuICAgICAgICB7XG4gICAgICAgICAgY29sb3I6IGRldGVybWluZUNlc2l1bUNvbG9yKG9wdGlvbnMuY29sb3IpLFxuICAgICAgICAgIG91dGxpbmVDb2xvcjogQ2VzaXVtLkNvbG9yLldISVRFLFxuICAgICAgICAgIG91dGxpbmVXaWR0aDogNCxcbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgcG9seWxpbmVDb2xsZWN0aW9uLnNlbGVjdGVkTWF0ZXJpYWwgPSBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoXG4gICAgICAgICdQb2x5bGluZU91dGxpbmUnLFxuICAgICAgICB7XG4gICAgICAgICAgY29sb3I6IGRldGVybWluZUNlc2l1bUNvbG9yKG9wdGlvbnMuY29sb3IpLFxuICAgICAgICAgIG91dGxpbmVDb2xvcjogQ2VzaXVtLkNvbG9yLkJMQUNLLFxuICAgICAgICAgIG91dGxpbmVXaWR0aDogNCxcbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgY29uc3QgcG9seWxpbmUgPSBwb2x5bGluZUNvbGxlY3Rpb24uYWRkKHtcbiAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgIG1hdGVyaWFsOiBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgICA/IHBvbHlsaW5lQ29sbGVjdGlvbi5zZWxlY3RlZE1hdGVyaWFsXG4gICAgICAgICAgOiBwb2x5bGluZUNvbGxlY3Rpb24udW5zZWxlY3RlZE1hdGVyaWFsLFxuICAgICAgICBpZDogb3B0aW9ucy5pZCxcbiAgICAgICAgcG9zaXRpb25zOiBjYXJ0ZXNpYW4sXG4gICAgICB9KVxuICAgICAgaWYgKG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IENlc2l1bS5zYW1wbGVUZXJyYWluKFxuICAgICAgICAgIG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIsXG4gICAgICAgICAgNSxcbiAgICAgICAgICBjYXJ0UG9pbnRzXG4gICAgICAgIClcbiAgICAgICAgQ2VzaXVtLndoZW4ocHJvbWlzZSwgKHVwZGF0ZWRDYXJ0b2dyYXBoaWM6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9XG4gICAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY0FycmF5VG9DYXJ0ZXNpYW5BcnJheShcbiAgICAgICAgICAgICAgdXBkYXRlZENhcnRvZ3JhcGhpY1xuICAgICAgICAgICAgKVxuICAgICAgICAgIGlmICh1cGRhdGVkQ2FydG9ncmFwaGljWzBdLmhlaWdodCAmJiAhb3B0aW9ucy52aWV3LmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICBwb2x5bGluZS5wb3NpdGlvbnMgPSBwb3NpdGlvbnNcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucHJpbWl0aXZlcy5hZGQocG9seWxpbmVDb2xsZWN0aW9uKVxuICAgICAgcmV0dXJuIHBvbHlsaW5lQ29sbGVjdGlvblxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIHBvbHlnb24gZmlsbCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2x5Z29uIGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQuXG4gICAgICAgICAgICAqL1xuICAgIGFkZFBvbHlnb24ocG9seWdvbjogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvbHlnb25PYmplY3QgPSBwb2x5Z29uLm1hcCgoY29vcmRpbmF0ZTogYW55KSA9PlxuICAgICAgICBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGUpXG4gICAgICApXG4gICAgICBjb25zdCBjYXJ0UG9pbnRzID0gXy5tYXAocG9seWdvbk9iamVjdCwgKHBvaW50KSA9PlxuICAgICAgICBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICAgIHBvaW50LmxvbmdpdHVkZSxcbiAgICAgICAgICBwb2ludC5sYXRpdHVkZSxcbiAgICAgICAgICBwb2ludC5hbHRpdHVkZVxuICAgICAgICApXG4gICAgICApXG4gICAgICBsZXQgY2FydGVzaWFuID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNBcnJheVRvQ2FydGVzaWFuQXJyYXkoY2FydFBvaW50cylcbiAgICAgIGNvbnN0IHVuc2VsZWN0ZWRQb2x5Z29uUmVmID0gbWFwLmVudGl0aWVzLmFkZCh7XG4gICAgICAgIHBvbHlnb246IHtcbiAgICAgICAgICBoaWVyYXJjaHk6IGNhcnRlc2lhbixcbiAgICAgICAgICBtYXRlcmlhbDogbmV3IENlc2l1bS5HcmlkTWF0ZXJpYWxQcm9wZXJ0eSh7XG4gICAgICAgICAgICBjb2xvcjogQ2VzaXVtLkNvbG9yLldISVRFLFxuICAgICAgICAgICAgY2VsbEFscGhhOiAwLjAsXG4gICAgICAgICAgICBsaW5lQ291bnQ6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigyLCAyKSxcbiAgICAgICAgICAgIGxpbmVUaGlja25lc3M6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigyLjAsIDIuMCksXG4gICAgICAgICAgICBsaW5lT2Zmc2V0OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMC4wLCAwLjApLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHBlclBvc2l0aW9uSGVpZ2h0OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBzaG93OiB0cnVlLFxuICAgICAgICByZXN1bHRJZDogb3B0aW9ucy5pZCxcbiAgICAgICAgc2hvd1doZW5TZWxlY3RlZDogZmFsc2UsXG4gICAgICB9KVxuICAgICAgY29uc3Qgc2VsZWN0ZWRQb2x5Z29uUmVmID0gbWFwLmVudGl0aWVzLmFkZCh7XG4gICAgICAgIHBvbHlnb246IHtcbiAgICAgICAgICBoaWVyYXJjaHk6IGNhcnRlc2lhbixcbiAgICAgICAgICBtYXRlcmlhbDogbmV3IENlc2l1bS5HcmlkTWF0ZXJpYWxQcm9wZXJ0eSh7XG4gICAgICAgICAgICBjb2xvcjogQ2VzaXVtLkNvbG9yLkJMQUNLLFxuICAgICAgICAgICAgY2VsbEFscGhhOiAwLjAsXG4gICAgICAgICAgICBsaW5lQ291bnQ6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigyLCAyKSxcbiAgICAgICAgICAgIGxpbmVUaGlja25lc3M6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigyLjAsIDIuMCksXG4gICAgICAgICAgICBsaW5lT2Zmc2V0OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMC4wLCAwLjApLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHBlclBvc2l0aW9uSGVpZ2h0OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBzaG93OiBmYWxzZSxcbiAgICAgICAgcmVzdWx0SWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIHNob3dXaGVuU2VsZWN0ZWQ6IHRydWUsXG4gICAgICB9KVxuICAgICAgaWYgKG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IENlc2l1bS5zYW1wbGVUZXJyYWluKFxuICAgICAgICAgIG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIsXG4gICAgICAgICAgNSxcbiAgICAgICAgICBjYXJ0UG9pbnRzXG4gICAgICAgIClcbiAgICAgICAgQ2VzaXVtLndoZW4ocHJvbWlzZSwgKHVwZGF0ZWRDYXJ0b2dyYXBoaWM6IGFueSkgPT4ge1xuICAgICAgICAgIGNhcnRlc2lhbiA9XG4gICAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY0FycmF5VG9DYXJ0ZXNpYW5BcnJheShcbiAgICAgICAgICAgICAgdXBkYXRlZENhcnRvZ3JhcGhpY1xuICAgICAgICAgICAgKVxuICAgICAgICAgIGlmICh1cGRhdGVkQ2FydG9ncmFwaGljWzBdLmhlaWdodCAmJiAhb3B0aW9ucy52aWV3LmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICB1bnNlbGVjdGVkUG9seWdvblJlZi5wb2x5Z29uLmhpZXJhcmNoeS5zZXRWYWx1ZShjYXJ0ZXNpYW4pXG4gICAgICAgICAgICBzZWxlY3RlZFBvbHlnb25SZWYucG9seWdvbi5oaWVyYXJjaHkuc2V0VmFsdWUoY2FydGVzaWFuKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBbdW5zZWxlY3RlZFBvbHlnb25SZWYsIHNlbGVjdGVkUG9seWdvblJlZl1cbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byByZWZsZWN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIHNlbGVjdGVkLlxuICAgICAgICAgICAgIE9wdGlvbnMgcGFzc2VkIGluIGFyZSBjb2xvciBhbmQgaXNTZWxlY3RlZC5cbiAgICAgICAgICAgICovXG4gICAgdXBkYXRlQ2x1c3RlcihnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGdlb21ldHJ5KSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVDbHVzdGVyKGlubmVyR2VvbWV0cnksIG9wdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5CaWxsYm9hcmQpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IGdlb21ldHJ5LnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAncGFydGlhbGx5JzpcbiAgICAgICAgICAgIGdlb21ldHJ5LmltYWdlID0gZ2VvbWV0cnkucGFydGlhbGx5U2VsZWN0ZWRJbWFnZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICd1bnNlbGVjdGVkJzpcbiAgICAgICAgICAgIGdlb21ldHJ5LmltYWdlID0gZ2VvbWV0cnkudW5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBvcHRpb25zLmlzU2VsZWN0ZWQgIT09ICd1bnNlbGVjdGVkJ1xuICAgICAgICBnZW9tZXRyeS5leWVPZmZzZXQgPSBuZXcgQ2VzaXVtLkNhcnRlc2lhbjMoMCwgMCwgaXNTZWxlY3RlZCA/IC0xIDogMClcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgZ2VvbWV0cnkuX3BvbHlsaW5lcy5mb3JFYWNoKChwb2x5bGluZTogYW55KSA9PiB7XG4gICAgICAgICAgcG9seWxpbmUubWF0ZXJpYWwgPSBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoJ1BvbHlsaW5lT3V0bGluZScsIHtcbiAgICAgICAgICAgIGNvbG9yOiBkZXRlcm1pbmVDZXNpdW1Db2xvcigncmdiYSgwLDAsMCwgLjEpJyksXG4gICAgICAgICAgICBvdXRsaW5lQ29sb3I6IGRldGVybWluZUNlc2l1bUNvbG9yKCdyZ2JhKDI1NSwyNTUsMjU1LCAuMSknKSxcbiAgICAgICAgICAgIG91dGxpbmVXaWR0aDogNCxcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5zaG93V2hlblNlbGVjdGVkKSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSAhb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIHJlZmxlY3Qgd2hldGhlciBvciBub3QgaXQgaXMgc2VsZWN0ZWQuXG4gICAgICAgICAgICAgIE9wdGlvbnMgcGFzc2VkIGluIGFyZSBjb2xvciBhbmQgaXNTZWxlY3RlZC5cbiAgICAgICAgICAgICAgKi9cbiAgICB1cGRhdGVHZW9tZXRyeShnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGdlb21ldHJ5KSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVHZW9tZXRyeShpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uQmlsbGJvYXJkKSB7XG4gICAgICAgIGdlb21ldHJ5LmltYWdlID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgICAgPyBnZW9tZXRyeS5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgOiBnZW9tZXRyeS51bnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgZ2VvbWV0cnkuZXllT2Zmc2V0ID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgMCxcbiAgICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWQgPyAtMSA6IDBcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbikge1xuICAgICAgICBnZW9tZXRyeS5fcG9seWxpbmVzLmZvckVhY2goKHBvbHlsaW5lOiBhbnkpID0+IHtcbiAgICAgICAgICBwb2x5bGluZS5tYXRlcmlhbCA9IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgICAgPyBnZW9tZXRyeS5zZWxlY3RlZE1hdGVyaWFsXG4gICAgICAgICAgICA6IGdlb21ldHJ5LnVuc2VsZWN0ZWRNYXRlcmlhbFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5zaG93V2hlblNlbGVjdGVkKSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSAhb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgaGlkZGVuXG4gICAgICAgICAgICAgKi9cbiAgICBoaWRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uQmlsbGJvYXJkKSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSBmYWxzZVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbikge1xuICAgICAgICBnZW9tZXRyeS5fcG9seWxpbmVzLmZvckVhY2goKHBvbHlsaW5lOiBhbnkpID0+IHtcbiAgICAgICAgICBwb2x5bGluZS5zaG93ID0gZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byBiZSBzaG93blxuICAgICAgICAgICAgICovXG4gICAgc2hvd0dlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkJpbGxib2FyZCkge1xuICAgICAgICBnZW9tZXRyeS5zaG93ID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbikge1xuICAgICAgICBnZW9tZXRyeS5fcG9seWxpbmVzLmZvckVhY2goKHBvbHlsaW5lOiBhbnkpID0+IHtcbiAgICAgICAgICBwb2x5bGluZS5zaG93ID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgcmVtb3ZlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgYmlsbGJvYXJkQ29sbGVjdGlvbi5yZW1vdmUoZ2VvbWV0cnkpXG4gICAgICBtYXAuc2NlbmUucHJpbWl0aXZlcy5yZW1vdmUoZ2VvbWV0cnkpXG4gICAgICAvL3VubWluaWZpZWQgY2VzaXVtIGNob2tlcyBpZiB5b3UgZmVlZCBhIGdlb21ldHJ5IHdpdGggaWQgYXMgYW4gQXJyYXlcbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkVudGl0eSkge1xuICAgICAgICBtYXAuZW50aXRpZXMucmVtb3ZlKGdlb21ldHJ5KVxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgZGVzdHJveVNoYXBlcygpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA2KSBGSVhNRTogUGFyYW1ldGVyICdzaGFwZScgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZS5cbiAgICAgIHNoYXBlcy5mb3JFYWNoKChzaGFwZSkgPT4ge1xuICAgICAgICBzaGFwZS5kZXN0cm95KClcbiAgICAgIH0pXG4gICAgICBzaGFwZXMgPSBbXVxuICAgICAgaWYgKG1hcCAmJiBtYXAuc2NlbmUpIHtcbiAgICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0TWFwKCkge1xuICAgICAgcmV0dXJuIG1hcFxuICAgIH0sXG4gICAgem9vbUluKCkge1xuICAgICAgY29uc3QgY2FtZXJhUG9zaXRpb25DYXJ0b2dyYXBoaWMgPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKFxuICAgICAgICAgIG1hcC5zY2VuZS5jYW1lcmEucG9zaXRpb25cbiAgICAgICAgKVxuXG4gICAgICBjb25zdCB0ZXJyYWluSGVpZ2h0ID0gbWFwLnNjZW5lLmdsb2JlLmdldEhlaWdodChcbiAgICAgICAgY2FtZXJhUG9zaXRpb25DYXJ0b2dyYXBoaWNcbiAgICAgIClcblxuICAgICAgY29uc3QgaGVpZ2h0QWJvdmVHcm91bmQgPVxuICAgICAgICBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpYy5oZWlnaHQgLSB0ZXJyYWluSGVpZ2h0XG5cbiAgICAgIGNvbnN0IHpvb21BbW91bnQgPSBoZWlnaHRBYm92ZUdyb3VuZCAvIDIgLy8gYmFzaWNhbGx5IGRvdWJsZSB0aGUgY3VycmVudCB6b29tXG5cbiAgICAgIGNvbnN0IG1heFpvb21BbW91bnQgPSBoZWlnaHRBYm92ZUdyb3VuZCAtIG1pbmltdW1IZWlnaHRBYm92ZVRlcnJhaW5cblxuICAgICAgLy8gaWYgdGhlIHpvb20gYW1vdW50IGlzIGdyZWF0ZXIgdGhhbiB0aGUgbWF4IHpvb20gYW1vdW50LCB6b29tIHRvIHRoZSBtYXggem9vbSBhbW91bnRcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEuem9vbUluKE1hdGgubWluKG1heFpvb21BbW91bnQsIHpvb21BbW91bnQpKVxuICAgIH0sXG4gICAgem9vbU91dCgpIHtcbiAgICAgIGNvbnN0IGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyhcbiAgICAgICAgICBtYXAuc2NlbmUuY2FtZXJhLnBvc2l0aW9uXG4gICAgICAgIClcblxuICAgICAgY29uc3QgdGVycmFpbkhlaWdodCA9IG1hcC5zY2VuZS5nbG9iZS5nZXRIZWlnaHQoXG4gICAgICAgIGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljXG4gICAgICApXG5cbiAgICAgIGNvbnN0IGhlaWdodEFib3ZlR3JvdW5kID1cbiAgICAgICAgY2FtZXJhUG9zaXRpb25DYXJ0b2dyYXBoaWMuaGVpZ2h0IC0gdGVycmFpbkhlaWdodFxuICAgICAgbWFwLnNjZW5lLmNhbWVyYS56b29tT3V0KGhlaWdodEFib3ZlR3JvdW5kKVxuICAgIH0sXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50Lm9mZignbWFwOnJlcXVlc3RSZW5kZXInLCByZXF1ZXN0UmVuZGVySGFuZGxlcilcbiAgICAgIG1hcC5kZXN0cm95KClcbiAgICB9LFxuICB9XG4gIHJldHVybiBleHBvc2VkTWV0aG9kc1xufVxuIl19