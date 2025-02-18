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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLmNlc2l1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2Nlc2l1bS9tYXAuY2VzaXVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxjQUFjLE1BQU0sbUJBQW1CLENBQUE7QUFDOUMsT0FBTyxLQUFLLE1BQU0sc0JBQXNCLENBQUE7QUFDeEMsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3JFLE9BQU8sRUFDTCwwQkFBMEIsRUFDMUIsWUFBWSxHQUNiLE1BQU0sMENBQTBDLENBQUE7QUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBR3JELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3ZFLElBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQTtBQUM5QixJQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNoRCxJQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2pELElBQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3JELElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQTtBQUNqQyxJQUFNLGVBQWUsR0FBRyxD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bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB1dGlsaXR5IGZyb20gJy4vdXRpbGl0eSdcbmltcG9ydCBEcmF3aW5nVXRpbGl0eSBmcm9tICcuLi9EcmF3aW5nVXRpbGl0eSdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi8uLi8uLi9qcy93cmVxcidcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcbmltcG9ydCBEcmF3SGVscGVyIGZyb20gJy4uLy4uLy4uLy4uL2xpYi9jZXNpdW0tZHJhd2hlbHBlci9EcmF3SGVscGVyJ1xuaW1wb3J0IHtcbiAgQ2VzaXVtSW1hZ2VyeVByb3ZpZGVyVHlwZXMsXG4gIENlc2l1bUxheWVycyxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vanMvY29udHJvbGxlcnMvY2VzaXVtLmxheWVycydcbmltcG9ydCB7IERyYXdpbmcgfSBmcm9tICcuLi8uLi8uLi9zaW5nbGV0b25zL2RyYXdpbmcnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgQ2x1c3RlclR5cGUgfSBmcm9tICcuLi9yZWFjdC9nZW9tZXRyaWVzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmNvbnN0IGRlZmF1bHRDb2xvciA9ICcjM2M2ZGQ1J1xuY29uc3QgZXllT2Zmc2V0ID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKDAsIDAsIDApXG5jb25zdCBwaXhlbE9mZnNldCA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigwLjAsIDApXG5jb25zdCBydWxlckNvbG9yID0gbmV3IENlc2l1bS5Db2xvcigwLjMxLCAwLjQzLCAwLjUyKVxuY29uc3QgcnVsZXJQb2ludENvbG9yID0gJyM1MDZmODUnXG5jb25zdCBydWxlckxpbmVIZWlnaHQgPSAwXG5DZXNpdW0uQmluZ01hcHNBcGkuZGVmYXVsdEtleSA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRCaW5nS2V5KCkgfHwgMFxuY29uc3QgaW1hZ2VyeVByb3ZpZGVyVHlwZXMgPSBDZXNpdW1JbWFnZXJ5UHJvdmlkZXJUeXBlc1xuZnVuY3Rpb24gc2V0dXBUZXJyYWluUHJvdmlkZXIodmlld2VyOiBhbnksIHRlcnJhaW5Qcm92aWRlcjogYW55KSB7XG4gIGlmICh0ZXJyYWluUHJvdmlkZXIgPT0gbnVsbCB8fCB0ZXJyYWluUHJvdmlkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnNvbGUuaW5mbyhgVW5rbm93biB0ZXJyYWluIHByb3ZpZGVyIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgICAgICAgIERlZmF1bHQgQ2VzaXVtIHRlcnJhaW4gcHJvdmlkZXIgd2lsbCBiZSB1c2VkLmApXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgeyB0eXBlLCAuLi50ZXJyYWluQ29uZmlnIH0gPSB0ZXJyYWluUHJvdmlkZXJcbiAgY29uc3QgVGVycmFpblByb3ZpZGVyID0gaW1hZ2VyeVByb3ZpZGVyVHlwZXNbdHlwZV1cbiAgaWYgKFRlcnJhaW5Qcm92aWRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS53YXJuKGBcbiAgICAgICAgICAgIFVua25vd24gdGVycmFpbiBwcm92aWRlciB0eXBlOiAke3R5cGV9LlxuICAgICAgICAgICAgRGVmYXVsdCBDZXNpdW0gdGVycmFpbiBwcm92aWRlciB3aWxsIGJlIHVzZWQuXG4gICAgICAgIGApXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgZGVmYXVsdENlc2l1bVRlcnJhaW5Qcm92aWRlciA9IHZpZXdlci5zY2VuZS50ZXJyYWluUHJvdmlkZXJcbiAgY29uc3QgY3VzdG9tVGVycmFpblByb3ZpZGVyID0gbmV3IFRlcnJhaW5Qcm92aWRlcih0ZXJyYWluQ29uZmlnKVxuICBjdXN0b21UZXJyYWluUHJvdmlkZXIuZXJyb3JFdmVudC5hZGRFdmVudExpc3RlbmVyKCgpID0+IHtcbiAgICBjb25zb2xlLndhcm4oYFxuICAgICAgICAgICAgSXNzdWUgdXNpbmcgdGVycmFpbiBwcm92aWRlcjogJHtKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgIC4uLnRlcnJhaW5Db25maWcsXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIEZhbGxpbmcgYmFjayB0byBkZWZhdWx0IENlc2l1bSB0ZXJyYWluIHByb3ZpZGVyLlxuICAgICAgICBgKVxuICAgIHZpZXdlci5zY2VuZS50ZXJyYWluUHJvdmlkZXIgPSBkZWZhdWx0Q2VzaXVtVGVycmFpblByb3ZpZGVyXG4gIH0pXG4gIHZpZXdlci5zY2VuZS50ZXJyYWluUHJvdmlkZXIgPSBjdXN0b21UZXJyYWluUHJvdmlkZXJcbn1cbmZ1bmN0aW9uIGNyZWF0ZU1hcChpbnNlcnRpb25FbGVtZW50OiBhbnksIG1hcExheWVyczogYW55KSB7XG4gIGNvbnN0IGxheWVyQ29sbGVjdGlvbkNvbnRyb2xsZXIgPSBuZXcgQ2VzaXVtTGF5ZXJzKHtcbiAgICBjb2xsZWN0aW9uOiBtYXBMYXllcnMsXG4gIH0pXG4gIGNvbnN0IHZpZXdlciA9IGxheWVyQ29sbGVjdGlvbkNvbnRyb2xsZXIubWFrZU1hcCh7XG4gICAgZWxlbWVudDogaW5zZXJ0aW9uRWxlbWVudCxcbiAgICBjZXNpdW1PcHRpb25zOiB7XG4gICAgICBzY2VuZU1vZGU6IENlc2l1bS5TY2VuZU1vZGUuU0NFTkUzRCxcbiAgICAgIGNyZWRpdENvbnRhaW5lcjogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICBhbmltYXRpb246IGZhbHNlLFxuICAgICAgZnVsbHNjcmVlbkJ1dHRvbjogZmFsc2UsXG4gICAgICB0aW1lbGluZTogZmFsc2UsXG4gICAgICBnZW9jb2RlcjogZmFsc2UsXG4gICAgICBob21lQnV0dG9uOiBmYWxzZSxcbiAgICAgIG5hdmlnYXRpb25IZWxwQnV0dG9uOiBmYWxzZSxcbiAgICAgIHNjZW5lTW9kZVBpY2tlcjogZmFsc2UsXG4gICAgICBzZWxlY3Rpb25JbmRpY2F0b3I6IGZhbHNlLFxuICAgICAgaW5mb0JveDogZmFsc2UsXG4gICAgICAvL3NreUJveDogZmFsc2UsXG4gICAgICAvL3NreUF0bW9zcGhlcmU6IGZhbHNlLFxuICAgICAgYmFzZUxheWVyUGlja2VyOiBmYWxzZSxcbiAgICAgIGltYWdlcnlQcm92aWRlcjogZmFsc2UsXG4gICAgICBtYXBNb2RlMkQ6IDAsXG4gICAgfSxcbiAgfSlcbiAgY29uc3QgcmVxdWVzdFJlbmRlciA9ICgpID0+IHtcbiAgICB2aWV3ZXIuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gIH1cbiAgOyh3cmVxciBhcyBhbnkpLnZlbnQub24oJ21hcDpyZXF1ZXN0UmVuZGVyJywgcmVxdWVzdFJlbmRlcilcbiAgLy8gZGlzYWJsZSByaWdodCBjbGljayBkcmFnIHRvIHpvb20gKGNvbnRleHQgbWVudSBpbnN0ZWFkKTtcbiAgdmlld2VyLnNjZW5lLnNjcmVlblNwYWNlQ2FtZXJhQ29udHJvbGxlci56b29tRXZlbnRUeXBlcyA9IFtcbiAgICBDZXNpdW0uQ2FtZXJhRXZlbnRUeXBlLldIRUVMLFxuICAgIENlc2l1bS5DYW1lcmFFdmVudFR5cGUuUElOQ0gsXG4gIF1cbiAgdmlld2VyLnNjcmVlblNwYWNlRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKCgpID0+IHtcbiAgICBpZiAoIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICQoJ2JvZHknKS5tb3VzZWRvd24oKVxuICAgIH1cbiAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfRE9XTilcbiAgdmlld2VyLnNjcmVlblNwYWNlRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKCgpID0+IHtcbiAgICBpZiAoIURyYXdpbmcuaXNEcmF3aW5nKCkpIHtcbiAgICAgICQoJ2JvZHknKS5tb3VzZWRvd24oKVxuICAgIH1cbiAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLlJJR0hUX0RPV04pXG4gIHNldHVwVGVycmFpblByb3ZpZGVyKFxuICAgIHZpZXdlcixcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0VGVycmFpblByb3ZpZGVyKClcbiAgKVxuICByZXR1cm4ge1xuICAgIG1hcDogdmlld2VyLFxuICAgIHJlcXVlc3RSZW5kZXJIYW5kbGVyOiByZXF1ZXN0UmVuZGVyLFxuICB9XG59XG5mdW5jdGlvbiBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24ocG9zaXRpb246IGFueSwgbWFwOiBhbnkpIHtcbiAgbGV0IGlkLCBsb2NhdGlvbklkXG4gIGNvbnN0IHBpY2tlZE9iamVjdCA9IG1hcC5zY2VuZS5waWNrKHBvc2l0aW9uKVxuICBpZiAocGlja2VkT2JqZWN0KSB7XG4gICAgaWQgPSBwaWNrZWRPYmplY3QuaWRcbiAgICBpZiAoaWQgJiYgaWQuY29uc3RydWN0b3IgPT09IENlc2l1bS5FbnRpdHkpIHtcbiAgICAgIGlkID0gaWQucmVzdWx0SWRcbiAgICB9XG4gICAgbG9jYXRpb25JZCA9IHBpY2tlZE9iamVjdC5jb2xsZWN0aW9uPy5sb2NhdGlvbklkXG4gIH1cbiAgcmV0dXJuIHsgaWQsIGxvY2F0aW9uSWQgfVxufVxuZnVuY3Rpb24gZXhwYW5kUmVjdGFuZ2xlKHJlY3RhbmdsZTogYW55KSB7XG4gIGNvbnN0IHNjYWxpbmdGYWN0b3IgPSAwLjA1XG4gIGxldCB3aWR0aEdhcCA9IE1hdGguYWJzKHJlY3RhbmdsZS5lYXN0KSAtIE1hdGguYWJzKHJlY3RhbmdsZS53ZXN0KVxuICBsZXQgaGVpZ2h0R2FwID0gTWF0aC5hYnMocmVjdGFuZ2xlLm5vcnRoKSAtIE1hdGguYWJzKHJlY3RhbmdsZS5zb3V0aClcbiAgLy9lbnN1cmUgcmVjdGFuZ2xlIGhhcyBzb21lIHNpemVcbiAgaWYgKHdpZHRoR2FwID09PSAwKSB7XG4gICAgd2lkdGhHYXAgPSAxXG4gIH1cbiAgaWYgKGhlaWdodEdhcCA9PT0gMCkge1xuICAgIGhlaWdodEdhcCA9IDFcbiAgfVxuICByZWN0YW5nbGUuZWFzdCA9IHJlY3RhbmdsZS5lYXN0ICsgTWF0aC5hYnMoc2NhbGluZ0ZhY3RvciAqIHdpZHRoR2FwKVxuICByZWN0YW5nbGUubm9ydGggPSByZWN0YW5nbGUubm9ydGggKyBNYXRoLmFicyhzY2FsaW5nRmFjdG9yICogaGVpZ2h0R2FwKVxuICByZWN0YW5nbGUuc291dGggPSByZWN0YW5nbGUuc291dGggLSBNYXRoLmFicyhzY2FsaW5nRmFjdG9yICogaGVpZ2h0R2FwKVxuICByZWN0YW5nbGUud2VzdCA9IHJlY3RhbmdsZS53ZXN0IC0gTWF0aC5hYnMoc2NhbGluZ0ZhY3RvciAqIHdpZHRoR2FwKVxuICByZXR1cm4gcmVjdGFuZ2xlXG59XG5mdW5jdGlvbiBnZXREZXN0aW5hdGlvbkZvclZpc2libGVQYW4ocmVjdGFuZ2xlOiBhbnksIG1hcDogYW55KSB7XG4gIGxldCBkZXN0aW5hdGlvbkZvclpvb20gPSBleHBhbmRSZWN0YW5nbGUocmVjdGFuZ2xlKVxuICBpZiAobWFwLnNjZW5lLm1vZGUgPT09IENlc2l1bS5TY2VuZU1vZGUuU0NFTkUzRCkge1xuICAgIGRlc3RpbmF0aW9uRm9yWm9vbSA9XG4gICAgICBtYXAuY2FtZXJhLmdldFJlY3RhbmdsZUNhbWVyYUNvb3JkaW5hdGVzKGRlc3RpbmF0aW9uRm9yWm9vbSlcbiAgfVxuICByZXR1cm4gZGVzdGluYXRpb25Gb3Jab29tXG59XG5mdW5jdGlvbiBkZXRlcm1pbmVDZXNpdW1Db2xvcihjb2xvcjogYW55KSB7XG4gIHJldHVybiAhXy5pc1VuZGVmaW5lZChjb2xvcilcbiAgICA/IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29sb3IpXG4gICAgOiBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGRlZmF1bHRDb2xvcilcbn1cbmZ1bmN0aW9uIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZTogYW55KSB7XG4gIHJldHVybiB7XG4gICAgbGF0aXR1ZGU6IGNvb3JkaW5hdGVbMV0sXG4gICAgbG9uZ2l0dWRlOiBjb29yZGluYXRlWzBdLFxuICAgIGFsdGl0dWRlOiBjb29yZGluYXRlWzJdLFxuICB9XG59XG5mdW5jdGlvbiBpc05vdFZpc2libGUoY2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnk6IGFueSwgb2NjbHVkZXI6IGFueSkge1xuICByZXR1cm4gIW9jY2x1ZGVyLmlzUG9pbnRWaXNpYmxlKGNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5KVxufVxuXG4vLyBodHRwczovL2Nlc2l1bS5jb20vbGVhcm4vY2VzaXVtanMvcmVmLWRvYy9DYW1lcmEuaHRtbFxuZXhwb3J0IGNvbnN0IExvb2tpbmdTdHJhaWdodERvd25PcmllbnRhdGlvbiA9IHtcbiAgaGVhZGluZzogMCwgLy8gTm9ydGggaXMgdXAgLSBsaWtlIGNvbXBhc3MgZGlyZWN0aW9uXG4gIHBpdGNoOiAtQ2VzaXVtLk1hdGguUElfT1ZFUl9UV08sIC8vIExvb2tpbmcgc3RyYWlnaHQgZG93biAtIGxpa2UgYSBsZXZlbCBmcm9tIHVwIHRvIGRvd25cbiAgcm9sbDogMCwgLy8gTm8gcm9sbCAtIGxpa2UgYSBsZXZlbCBmcm9tIGxlZnQgdG8gcmlnaHRcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ2VzaXVtTWFwKFxuICBpbnNlcnRpb25FbGVtZW50OiBhbnksXG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55LFxuICBfbm90aWZpY2F0aW9uRWw6IGFueSxcbiAgY29tcG9uZW50RWxlbWVudDogYW55LFxuICBtYXBNb2RlbDogYW55LFxuICBtYXBMYXllcnM6IGFueVxuKSB7XG4gIGxldCBvdmVybGF5cyA9IHt9XG4gIGxldCBzaGFwZXM6IGFueSA9IFtdXG4gIGNvbnN0IHsgbWFwLCByZXF1ZXN0UmVuZGVySGFuZGxlciB9ID0gY3JlYXRlTWFwKGluc2VydGlvbkVsZW1lbnQsIG1hcExheWVycylcbiAgY29uc3QgZHJhd0hlbHBlciA9IG5ldyAoRHJhd0hlbHBlciBhcyBhbnkpKG1hcClcbiAgbWFwLmRyYXdIZWxwZXIgPSBkcmF3SGVscGVyXG4gIGNvbnN0IGJpbGxib2FyZENvbGxlY3Rpb24gPSBzZXR1cEJpbGxib2FyZENvbGxlY3Rpb24oKVxuICBjb25zdCBsYWJlbENvbGxlY3Rpb24gPSBzZXR1cExhYmVsQ29sbGVjdGlvbigpXG4gIHNldHVwVG9vbHRpcChtYXAsIHNlbGVjdGlvbkludGVyZmFjZSlcbiAgZnVuY3Rpb24gdXBkYXRlQ29vcmRpbmF0ZXNUb29sdGlwKHBvc2l0aW9uOiBhbnkpIHtcbiAgICBjb25zdCBjYXJ0ZXNpYW4gPSBtYXAuY2FtZXJhLnBpY2tFbGxpcHNvaWQoXG4gICAgICBwb3NpdGlvbixcbiAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICApXG4gICAgaWYgKENlc2l1bS5kZWZpbmVkKGNhcnRlc2lhbikpIHtcbiAgICAgIGxldCBjYXJ0b2dyYXBoaWMgPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21DYXJ0ZXNpYW4oY2FydGVzaWFuKVxuICAgICAgbWFwTW9kZWwudXBkYXRlTW91c2VDb29yZGluYXRlcyh7XG4gICAgICAgIGxhdDogY2FydG9ncmFwaGljLmxhdGl0dWRlICogQ2VzaXVtLk1hdGguREVHUkVFU19QRVJfUkFESUFOLFxuICAgICAgICBsb246IGNhcnRvZ3JhcGhpYy5sb25naXR1ZGUgKiBDZXNpdW0uTWF0aC5ERUdSRUVTX1BFUl9SQURJQU4sXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXBNb2RlbC5jbGVhck1vdXNlQ29vcmRpbmF0ZXMoKVxuICAgIH1cbiAgfVxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNjEzMykgRklYTUU6ICdzZWxlY3Rpb25JbnRlcmZhY2UnIGlzIGRlY2xhcmVkIGJ1dCBpdHMgdmFsdWUgaXMgLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgZnVuY3Rpb24gc2V0dXBUb29sdGlwKG1hcDogYW55LCBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueSkge1xuICAgIGNvbnN0IGhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKG1hcC5zY2VuZS5jYW52YXMpXG4gICAgaGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgJChjb21wb25lbnRFbGVtZW50KS5yZW1vdmVDbGFzcygnaGFzLWZlYXR1cmUnKVxuICAgICAgaWYgKG1hcC5zY2VuZS5tb2RlID09PSBDZXNpdW0uU2NlbmVNb2RlLk1PUlBISU5HKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdXBkYXRlQ29vcmRpbmF0ZXNUb29sdGlwKG1vdmVtZW50LmVuZFBvc2l0aW9uKVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICB9XG4gIGZ1bmN0aW9uIHNldHVwQmlsbGJvYXJkQ29sbGVjdGlvbigpIHtcbiAgICBjb25zdCBiaWxsYm9hcmRDb2xsZWN0aW9uID0gbmV3IENlc2l1bS5CaWxsYm9hcmRDb2xsZWN0aW9uKClcbiAgICBtYXAuc2NlbmUucHJpbWl0aXZlcy5hZGQoYmlsbGJvYXJkQ29sbGVjdGlvbilcbiAgICByZXR1cm4gYmlsbGJvYXJkQ29sbGVjdGlvblxuICB9XG4gIGZ1bmN0aW9uIHNldHVwTGFiZWxDb2xsZWN0aW9uKCkge1xuICAgIGNvbnN0IGxhYmVsQ29sbGVjdGlvbiA9IG5ldyBDZXNpdW0uTGFiZWxDb2xsZWN0aW9uKClcbiAgICBtYXAuc2NlbmUucHJpbWl0aXZlcy5hZGQobGFiZWxDb2xsZWN0aW9uKVxuICAgIHJldHVybiBsYWJlbENvbGxlY3Rpb25cbiAgfVxuICAvKlxuICAgKiBSZXR1cm5zIGEgdmlzaWJsZSBsYWJlbCB0aGF0IGlzIGluIHRoZSBzYW1lIGxvY2F0aW9uIGFzIHRoZSBwcm92aWRlZCBsYWJlbCAoZ2VvbWV0cnlJbnN0YW5jZSkgaWYgb25lIGV4aXN0cy5cbiAgICogSWYgZmluZFNlbGVjdGVkIGlzIHRydWUsIHRoZSBmdW5jdGlvbiB3aWxsIGFsc28gY2hlY2sgZm9yIGhpZGRlbiBsYWJlbHMgaW4gdGhlIHNhbWUgbG9jYXRpb24gYnV0IGFyZSBzZWxlY3RlZC5cbiAgICovXG4gIGZ1bmN0aW9uIGZpbmRPdmVybGFwcGluZ0xhYmVsKGZpbmRTZWxlY3RlZDogYW55LCBnZW9tZXRyeTogYW55KSB7XG4gICAgcmV0dXJuIF8uZmluZChcbiAgICAgIG1hcE1vZGVsLmdldCgnbGFiZWxzJyksXG4gICAgICAobGFiZWwpID0+XG4gICAgICAgIGxhYmVsLnBvc2l0aW9uLnggPT09IGdlb21ldHJ5LnBvc2l0aW9uLnggJiZcbiAgICAgICAgbGFiZWwucG9zaXRpb24ueSA9PT0gZ2VvbWV0cnkucG9zaXRpb24ueSAmJlxuICAgICAgICAoKGZpbmRTZWxlY3RlZCAmJiBsYWJlbC5pc1NlbGVjdGVkKSB8fCBsYWJlbC5zaG93KVxuICAgIClcbiAgfVxuICAvKlxuICAgICAgICBPbmx5IHNob3dzIG9uZSBsYWJlbCBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgbGFiZWxzIGluIHRoZSBzYW1lIGxvY2F0aW9uLlxuXG4gICAgICAgIFNob3cgdGhlIGxhYmVsIGluIHRoZSBmb2xsb3dpbmcgaW1wb3J0YW5jZTpcbiAgICAgICAgICAtIGl0IGlzIHNlbGVjdGVkIGFuZCB0aGUgZXhpc3RpbmcgbGFiZWwgaXMgbm90XG4gICAgICAgICAgLSB0aGVyZSBpcyBubyBvdGhlciBsYWJlbCBkaXNwbGF5ZWQgYXQgdGhlIHNhbWUgbG9jYXRpb25cbiAgICAgICAgICAtIGl0IGlzIHRoZSBsYWJlbCB0aGF0IHdhcyBmb3VuZCBieSBmaW5kT3ZlcmxhcHBpbmdMYWJlbFxuXG4gICAgICAgIEFyZ3VtZW50cyBhcmU6XG4gICAgICAgICAgLSB0aGUgbGFiZWwgdG8gc2hvdy9oaWRlXG4gICAgICAgICAgLSBpZiB0aGUgbGFiZWwgaXMgc2VsZWN0ZWRcbiAgICAgICAgICAtIGlmIHRoZSBzZWFyY2ggZm9yIG92ZXJsYXBwaW5nIGxhYmVsIHNob3VsZCBpbmNsdWRlIGhpZGRlbiBzZWxlY3RlZCBsYWJlbHNcbiAgICAgICAgKi9cbiAgZnVuY3Rpb24gc2hvd0hpZGVMYWJlbCh7IGdlb21ldHJ5LCBmaW5kU2VsZWN0ZWQgPSBmYWxzZSB9OiBhbnkpIHtcbiAgICBjb25zdCBpc1NlbGVjdGVkID0gZ2VvbWV0cnkuaXNTZWxlY3RlZFxuICAgIGNvbnN0IGxhYmVsV2l0aFNhbWVQb3NpdGlvbiA9IGZpbmRPdmVybGFwcGluZ0xhYmVsKGZpbmRTZWxlY3RlZCwgZ2VvbWV0cnkpXG4gICAgaWYgKFxuICAgICAgaXNTZWxlY3RlZCAmJlxuICAgICAgbGFiZWxXaXRoU2FtZVBvc2l0aW9uICYmXG4gICAgICAhbGFiZWxXaXRoU2FtZVBvc2l0aW9uLmlzU2VsZWN0ZWRcbiAgICApIHtcbiAgICAgIGxhYmVsV2l0aFNhbWVQb3NpdGlvbi5zaG93ID0gZmFsc2VcbiAgICB9XG4gICAgY29uc3Qgb3RoZXJMYWJlbE5vdFNlbGVjdGVkID0gbGFiZWxXaXRoU2FtZVBvc2l0aW9uXG4gICAgICA/ICFsYWJlbFdpdGhTYW1lUG9zaXRpb24uaXNTZWxlY3RlZFxuICAgICAgOiB0cnVlXG4gICAgZ2VvbWV0cnkuc2hvdyA9XG4gICAgICAoaXNTZWxlY3RlZCAmJiBvdGhlckxhYmVsTm90U2VsZWN0ZWQpIHx8XG4gICAgICAhbGFiZWxXaXRoU2FtZVBvc2l0aW9uIHx8XG4gICAgICBnZW9tZXRyeS5pZCA9PT0gbGFiZWxXaXRoU2FtZVBvc2l0aW9uLmlkXG4gIH1cbiAgLypcbiAgICAgICAgU2hvd3MgYSBoaWRkZW4gbGFiZWwuIFVzZWQgd2hlbiBkZWxldGluZyBhIGxhYmVsIHRoYXQgaXMgc2hvd24uXG4gICAgICAgICovXG4gIGZ1bmN0aW9uIHNob3dIaWRkZW5MYWJlbChnZW9tZXRyeTogYW55KSB7XG4gICAgaWYgKCFnZW9tZXRyeS5zaG93KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgaGlkZGVuTGFiZWwgPSBfLmZpbmQoXG4gICAgICBtYXBNb2RlbC5nZXQoJ2xhYmVscycpLFxuICAgICAgKGxhYmVsKSA9PlxuICAgICAgICBsYWJlbC5wb3NpdGlvbi54ID09PSBnZW9tZXRyeS5wb3NpdGlvbi54ICYmXG4gICAgICAgIGxhYmVsLnBvc2l0aW9uLnkgPT09IGdlb21ldHJ5LnBvc2l0aW9uLnkgJiZcbiAgICAgICAgbGFiZWwuaWQgIT09IGdlb21ldHJ5LmlkICYmXG4gICAgICAgICFsYWJlbC5zaG93XG4gICAgKVxuICAgIGlmIChoaWRkZW5MYWJlbCkge1xuICAgICAgaGlkZGVuTGFiZWwuc2hvdyA9IHRydWVcbiAgICB9XG4gIH1cblxuICBjb25zdCBtaW5pbXVtSGVpZ2h0QWJvdmVUZXJyYWluID0gMlxuICBjb25zdCBleHBvc2VkTWV0aG9kcyA9IHtcbiAgICBvbkxlZnRDbGljayhjYWxsYmFjazogYW55KSB7XG4gICAgICAkKG1hcC5zY2VuZS5jYW52YXMpLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IG1hcC5zY2VuZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY29uc3QgeyBpZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IGUuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0LFxuICAgICAgICAgICAgeTogZS5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1hcFxuICAgICAgICApXG4gICAgICAgIGNhbGxiYWNrKGUsIHsgbWFwVGFyZ2V0OiBpZCB9KVxuICAgICAgfSlcbiAgICB9LFxuICAgIG9uTGVmdENsaWNrTWFwQVBJKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIGxldCBsYXN0Q2xpY2tUaW1lID0gMFxuICAgICAgbGV0IGNsaWNrVGltZW91dCA9IDBcbiAgICAgIG1hcC5jbGlja0V2ZW50SGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIobWFwLmNhbnZhcylcbiAgICAgIG1hcC5jbGlja0V2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoZTogYW55KSA9PiB7XG4gICAgICAgIC8vIE9uIGEgZG91YmxlLWNsaWNrLCBDZXNpdW0gd2lsbCBmaXJlIDIgbGVmdC1jbGljayBldmVudHMsIHRvby4gV2Ugd2lsbCBvbmx5IGhhbmRsZSBhXG4gICAgICAgIC8vIGNsaWNrIGlmIDEpIGFub3RoZXIgY2xpY2sgZGlkIG5vdCBoYXBwZW4gaW4gdGhlIGxhc3QgMjUwIG1zLCBhbmQgMikgYW5vdGhlciBjbGlja1xuICAgICAgICAvLyBkb2VzIG5vdCBoYXBwZW4gaW4gdGhlIG5leHQgMjUwIG1zLlxuICAgICAgICBpZiAoY2xpY2tUaW1lb3V0ID4gMCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVvdXQpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY3VycmVudENsaWNrVGltZSA9IERhdGUubm93KClcbiAgICAgICAgaWYgKGN1cnJlbnRDbGlja1RpbWUgLSBsYXN0Q2xpY2tUaW1lID4gMjUwKSB7XG4gICAgICAgICAgY2xpY2tUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZS5wb3NpdGlvbiwgbWFwKVxuICAgICAgICAgICAgY2FsbGJhY2sobG9jYXRpb25JZClcbiAgICAgICAgICB9LCAyNTApXG4gICAgICAgIH1cbiAgICAgICAgbGFzdENsaWNrVGltZSA9IGN1cnJlbnRDbGlja1RpbWVcbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0NMSUNLKVxuICAgIH0sXG4gICAgY2xlYXJMZWZ0Q2xpY2tNYXBBUEkoKSB7XG4gICAgICBtYXAuY2xpY2tFdmVudEhhbmRsZXI/LmRlc3Ryb3koKVxuICAgIH0sXG4gICAgb25SaWdodENsaWNrKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub24oJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgY2FsbGJhY2soZSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhclJpZ2h0Q2xpY2soKSB7XG4gICAgICAkKG1hcC5zY2VuZS5jYW52YXMpLm9mZignY29udGV4dG1lbnUnKVxuICAgIH0sXG4gICAgb25Eb3VibGVDbGljaygpIHtcbiAgICAgIG1hcC5kb3VibGVDbGlja0V2ZW50SGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoXG4gICAgICAgIG1hcC5jYW52YXNcbiAgICAgIClcbiAgICAgIG1hcC5kb3VibGVDbGlja0V2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKGUucG9zaXRpb24sIG1hcClcbiAgICAgICAgaWYgKGxvY2F0aW9uSWQpIHtcbiAgICAgICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdsb2NhdGlvbjpkb3VibGVDbGljaycsIGxvY2F0aW9uSWQpXG4gICAgICAgIH1cbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0RPVUJMRV9DTElDSylcbiAgICB9LFxuICAgIGNsZWFyRG91YmxlQ2xpY2soKSB7XG4gICAgICBtYXAuZG91YmxlQ2xpY2tFdmVudEhhbmRsZXI/LmRlc3Ryb3koKVxuICAgIH0sXG4gICAgb25Nb3VzZVRyYWNraW5nRm9yR2VvRHJhZyh7XG4gICAgICBtb3ZlRnJvbSxcbiAgICAgIGRvd24sXG4gICAgICBtb3ZlLFxuICAgICAgdXAsXG4gICAgfToge1xuICAgICAgbW92ZUZyb20/OiBDZXNpdW0uQ2FydG9ncmFwaGljXG4gICAgICBkb3duOiBhbnlcbiAgICAgIG1vdmU6IGFueVxuICAgICAgdXA6IGFueVxuICAgIH0pIHtcbiAgICAgIG1hcC5zY2VuZS5zY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIuZW5hYmxlUm90YXRlID0gZmFsc2VcbiAgICAgIG1hcC5kcmFnQW5kRHJvcEV2ZW50SGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoXG4gICAgICAgIG1hcC5jYW52YXNcbiAgICAgIClcbiAgICAgIG1hcC5kcmFnQW5kRHJvcEV2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbigoZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKGUucG9zaXRpb24sIG1hcClcbiAgICAgICAgY29uc3QgY2FydGVzaWFuID0gbWFwLnNjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgIGUucG9zaXRpb24sXG4gICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpYyA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbUNhcnRlc2lhbihcbiAgICAgICAgICBjYXJ0ZXNpYW4sXG4gICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGRvd24oeyBwb3NpdGlvbjogY2FydG9ncmFwaGljLCBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkIH0pXG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9ET1dOKVxuICAgICAgbWFwLmRyYWdBbmREcm9wRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKChlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZS5lbmRQb3NpdGlvbiwgbWFwKVxuICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBtYXAuc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQoXG4gICAgICAgICAgZS5lbmRQb3NpdGlvbixcbiAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgY2FydG9ncmFwaGljID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tQ2FydGVzaWFuKFxuICAgICAgICAgIGNhcnRlc2lhbixcbiAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBtb3ZlRnJvbVxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBsb25naXR1ZGU6IENlc2l1bS5NYXRoLnRvRGVncmVlcyhcbiAgICAgICAgICAgICAgICBjYXJ0b2dyYXBoaWMubG9uZ2l0dWRlIC0gbW92ZUZyb20ubG9uZ2l0dWRlXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIGxhdGl0dWRlOiBDZXNpdW0uTWF0aC50b0RlZ3JlZXMoXG4gICAgICAgICAgICAgICAgY2FydG9ncmFwaGljLmxhdGl0dWRlIC0gbW92ZUZyb20ubGF0aXR1ZGVcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IG51bGxcbiAgICAgICAgbW92ZSh7IHRyYW5zbGF0aW9uLCBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkIH0pXG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgICAgIG1hcC5kcmFnQW5kRHJvcEV2ZW50SGFuZGxlci5zZXRJbnB1dEFjdGlvbihcbiAgICAgICAgdXAsXG4gICAgICAgIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX1VQXG4gICAgICApXG4gICAgfSxcbiAgICBjbGVhck1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKCkge1xuICAgICAgbWFwLnNjZW5lLnNjcmVlblNwYWNlQ2FtZXJhQ29udHJvbGxlci5lbmFibGVSb3RhdGUgPSB0cnVlXG4gICAgICBtYXAuZHJhZ0FuZERyb3BFdmVudEhhbmRsZXI/LmRlc3Ryb3koKVxuICAgIH0sXG4gICAgb25Nb3VzZVRyYWNraW5nRm9yUG9wdXAoXG4gICAgICBkb3duQ2FsbGJhY2s6IGFueSxcbiAgICAgIG1vdmVDYWxsYmFjazogYW55LFxuICAgICAgdXBDYWxsYmFjazogYW55XG4gICAgKSB7XG4gICAgICBtYXAuc2NyZWVuU3BhY2VFdmVudEhhbmRsZXJGb3JQb3B1cFByZXZpZXcgPVxuICAgICAgICBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKG1hcC5jYW52YXMpXG4gICAgICBtYXAuc2NyZWVuU3BhY2VFdmVudEhhbmRsZXJGb3JQb3B1cFByZXZpZXcuc2V0SW5wdXRBY3Rpb24oKCkgPT4ge1xuICAgICAgICBkb3duQ2FsbGJhY2soKVxuICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfRE9XTilcbiAgICAgIG1hcC5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlckZvclBvcHVwUHJldmlldy5zZXRJbnB1dEFjdGlvbigoKSA9PiB7XG4gICAgICAgIG1vdmVDYWxsYmFjaygpXG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgICAgIHRoaXMub25MZWZ0Q2xpY2sodXBDYWxsYmFjaylcbiAgICB9LFxuICAgIG9uTW91c2VNb3ZlKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IG1hcC5zY2VuZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB7XG4gICAgICAgICAgeDogZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsXG4gICAgICAgICAgeTogZS5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcCxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGlkLCBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24ocG9zaXRpb24sIG1hcClcbiAgICAgICAgY2FsbGJhY2soZSwge1xuICAgICAgICAgIG1hcFRhcmdldDogaWQsXG4gICAgICAgICAgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhck1vdXNlTW92ZSgpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub2ZmKCdtb3VzZW1vdmUnKVxuICAgIH0sXG4gICAgdGltZW91dElkczogW10gYXMgbnVtYmVyW10sXG4gICAgb25DYW1lcmFNb3ZlU3RhcnQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgdGhpcy50aW1lb3V0SWRzLmZvckVhY2goKHRpbWVvdXRJZDogYW55KSA9PiB7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dElkKVxuICAgICAgfSlcbiAgICAgIHRoaXMudGltZW91dElkcyA9IFtdXG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLm1vdmVTdGFydC5hZGRFdmVudExpc3RlbmVyKGNhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEubW92ZVN0YXJ0LnJlbW92ZUV2ZW50TGlzdGVuZXIoY2FsbGJhY2spXG4gICAgfSxcbiAgICBvbkNhbWVyYU1vdmVFbmQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgY29uc3QgdGltZW91dENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnRpbWVvdXRJZHMucHVzaChcbiAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgfSwgMzAwKVxuICAgICAgICApXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLm1vdmVFbmQuYWRkRXZlbnRMaXN0ZW5lcih0aW1lb3V0Q2FsbGJhY2spXG4gICAgfSxcbiAgICBvZmZDYW1lcmFNb3ZlRW5kKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEubW92ZUVuZC5yZW1vdmVFdmVudExpc3RlbmVyKGNhbGxiYWNrKVxuICAgIH0sXG4gICAgZG9QYW5ab29tKGNvb3JkczogYW55KSB7XG4gICAgICBpZiAoY29vcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNhcnRBcnJheSA9IGNvb3Jkcy5tYXAoKGNvb3JkOiBhbnkpID0+XG4gICAgICAgIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgICAgY29vcmRbMF0sXG4gICAgICAgICAgY29vcmRbMV0sXG4gICAgICAgICAgbWFwLmNhbWVyYS5fcG9zaXRpb25DYXJ0b2dyYXBoaWMuaGVpZ2h0XG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIGlmIChjYXJ0QXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gQ2VzaXVtLkVsbGlwc29pZC5XR1M4NC5jYXJ0b2dyYXBoaWNUb0NhcnRlc2lhbihcbiAgICAgICAgICBjYXJ0QXJyYXlbMF1cbiAgICAgICAgKVxuICAgICAgICB0aGlzLnBhblRvQ29vcmRpbmF0ZShwb2ludCwgMi4wKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVjdGFuZ2xlID0gQ2VzaXVtLlJlY3RhbmdsZS5mcm9tQ2FydG9ncmFwaGljQXJyYXkoY2FydEFycmF5KVxuICAgICAgICB0aGlzLnBhblRvUmVjdGFuZ2xlKHJlY3RhbmdsZSwge1xuICAgICAgICAgIGR1cmF0aW9uOiAyLjAsXG4gICAgICAgICAgY29ycmVjdGlvbjogMS4wLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgcGFuVG9SZXN1bHRzKHJlc3VsdHM6IGFueSkge1xuICAgICAgbGV0IHJlY3RhbmdsZSwgY2FydEFycmF5LCBwb2ludFxuICAgICAgY2FydEFycmF5ID0gXy5mbGF0dGVuKFxuICAgICAgICByZXN1bHRzXG4gICAgICAgICAgLmZpbHRlcigocmVzdWx0OiBhbnkpID0+IHJlc3VsdC5oYXNHZW9tZXRyeSgpKVxuICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAocmVzdWx0OiBhbnkpID0+XG4gICAgICAgICAgICAgIF8ubWFwKHJlc3VsdC5nZXRQb2ludHMoJ2xvY2F0aW9uJyksIChjb29yZGluYXRlKSA9PlxuICAgICAgICAgICAgICAgIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgICAgICAgICAgICBjb29yZGluYXRlWzBdLFxuICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZVsxXSxcbiAgICAgICAgICAgICAgICAgIG1hcC5jYW1lcmEuX3Bvc2l0aW9uQ2FydG9ncmFwaGljLmhlaWdodFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICApXG4gICAgICApXG4gICAgICBpZiAoY2FydEFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGNhcnRBcnJheS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBwb2ludCA9IENlc2l1bS5FbGxpcHNvaWQuV0dTODQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oY2FydEFycmF5WzBdKVxuICAgICAgICAgIHRoaXMucGFuVG9Db29yZGluYXRlKHBvaW50KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlY3RhbmdsZSA9IENlc2l1bS5SZWN0YW5nbGUuZnJvbUNhcnRvZ3JhcGhpY0FycmF5KGNhcnRBcnJheSlcbiAgICAgICAgICB0aGlzLnBhblRvUmVjdGFuZ2xlKHJlY3RhbmdsZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcGFuVG9Db29yZGluYXRlKGNvb3JkczogYW55LCBkdXJhdGlvbiA9IDAuNSkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBkZXN0aW5hdGlvbjogY29vcmRzLFxuICAgICAgfSlcbiAgICB9LFxuICAgIHBhblRvRXh0ZW50KCkge30sXG4gICAgcGFuVG9TaGFwZXNFeHRlbnQoe1xuICAgICAgZHVyYXRpb24gPSA1MDAsXG4gICAgfToge1xuICAgICAgZHVyYXRpb24/OiBudW1iZXIgLy8gdGFrZSBpbiBtaWxsaXNlY29uZHMgZm9yIG5vcm1hbGl6YXRpb24gd2l0aCBvcGVubGF5ZXJzIGR1cmF0aW9uIGJlaW5nIG1pbGxpc2Vjb25kc1xuICAgIH0gPSB7fSkge1xuICAgICAgY29uc3QgY3VycmVudFByaW1pdGl2ZXMgPSBtYXAuc2NlbmUucHJpbWl0aXZlcy5fcHJpbWl0aXZlcy5maWx0ZXIoXG4gICAgICAgIChwcmltOiBhbnkpID0+IHByaW0uaWRcbiAgICAgIClcbiAgICAgIGNvbnN0IGFjdHVhbFBvc2l0aW9ucyA9IGN1cnJlbnRQcmltaXRpdmVzLnJlZHVjZShcbiAgICAgICAgKGJsb2I6IGFueSwgcHJpbTogYW55KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGJsb2IuY29uY2F0KFxuICAgICAgICAgICAgcHJpbS5fcG9seWxpbmVzLnJlZHVjZSgoc3ViYmxvYjogYW55LCBwb2x5bGluZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBzdWJibG9iLmNvbmNhdChwb2x5bGluZS5fYWN0dWFsUG9zaXRpb25zKVxuICAgICAgICAgICAgfSwgW10pXG4gICAgICAgICAgKVxuICAgICAgICB9LFxuICAgICAgICBbXVxuICAgICAgKVxuICAgICAgaWYgKGFjdHVhbFBvc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIG1hcC5zY2VuZS5jYW1lcmEuZmx5VG8oe1xuICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAvIDEwMDAsIC8vIGNoYW5nZSB0byBzZWNvbmRzXG4gICAgICAgICAgZGVzdGluYXRpb246IENlc2l1bS5SZWN0YW5nbGUuZnJvbUNhcnRlc2lhbkFycmF5KGFjdHVhbFBvc2l0aW9ucyksXG4gICAgICAgICAgb3JpZW50YXRpb246IExvb2tpbmdTdHJhaWdodERvd25PcmllbnRhdGlvbixcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sXG4gICAgZ2V0Q2VudGVyUG9zaXRpb25PZlByaW1pdGl2ZUlkcyhwcmltaXRpdmVJZHM6IHN0cmluZ1tdKSB7XG4gICAgICBjb25zdCBwcmltaXRpdmVzID0gbWFwLnNjZW5lLnByaW1pdGl2ZXNcbiAgICAgIGxldCBwb3NpdGlvbnMgPSBbXSBhcyBhbnlbXVxuXG4gICAgICAvLyBJdGVyYXRlIG92ZXIgcHJpbWl0aXZlcyBhbmQgY29tcHV0ZSBib3VuZGluZyBzcGhlcmVzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByaW1pdGl2ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHByaW1pdGl2ZSA9IHByaW1pdGl2ZXMuZ2V0KGkpXG4gICAgICAgIGlmIChwcmltaXRpdmVJZHMuaW5jbHVkZXMocHJpbWl0aXZlLmlkKSkge1xuICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcHJpbWl0aXZlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBsZXQgcG9pbnQgPSBwcmltaXRpdmUuZ2V0KGopXG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KHBvaW50LnBvc2l0aW9ucylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGJvdW5kaW5nU3BoZXJlID0gQ2VzaXVtLkJvdW5kaW5nU3BoZXJlLmZyb21Qb2ludHMocG9zaXRpb25zKVxuXG4gICAgICBpZiAoXG4gICAgICAgIENlc2l1bS5Cb3VuZGluZ1NwaGVyZS5lcXVhbHMoXG4gICAgICAgICAgYm91bmRpbmdTcGhlcmUsXG4gICAgICAgICAgQ2VzaXVtLkJvdW5kaW5nU3BoZXJlLmZyb21Qb2ludHMoW10pIC8vIGVtcHR5XG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHBvc2l0aW9ucyB0byB6b29tIHRvJylcbiAgICAgIH1cblxuICAgICAgLy8gaGVyZSwgbm90aWNlIHdlIHVzZSBmbHlUbyBpbnN0ZWFkIG9mIGZseVRvQm91bmRpbmdTcGhlcmUsIGFzIHdpdGggdGhlIGxhdHRlciB0aGUgb3JpZW50YXRpb24gY2FuJ3QgYmUgY29udHJvbGxlZCBpbiB0aGlzIHZlcnNpb24gYW5kIGVuZHMgdXAgdGlsdGVkXG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIHBvc2l0aW9uIGFib3ZlIHRoZSBjZW50ZXIgb2YgdGhlIGJvdW5kaW5nIHNwaGVyZVxuICAgICAgbGV0IHJhZGl1cyA9IGJvdW5kaW5nU3BoZXJlLnJhZGl1c1xuICAgICAgbGV0IGNlbnRlciA9IGJvdW5kaW5nU3BoZXJlLmNlbnRlclxuICAgICAgbGV0IHVwID0gQ2VzaXVtLkNhcnRlc2lhbjMuY2xvbmUoY2VudGVyKSAvLyBHZXQgdGhlIHVwIGRpcmVjdGlvbiBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIEVhcnRoIHRvIHRoZSBwb3NpdGlvblxuICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMubm9ybWFsaXplKHVwLCB1cClcblxuICAgICAgbGV0IHBvc2l0aW9uID0gQ2VzaXVtLkNhcnRlc2lhbjMubXVsdGlwbHlCeVNjYWxhcihcbiAgICAgICAgdXAsXG4gICAgICAgIHJhZGl1cyAqIDIsXG4gICAgICAgIG5ldyBDZXNpdW0uQ2FydGVzaWFuMygpXG4gICAgICApIC8vIEFkanVzdCBtdWx0aXBsaWVyIGZvciBkZXNpcmVkIGFsdGl0dWRlXG4gICAgICBDZXNpdW0uQ2FydGVzaWFuMy5hZGQoY2VudGVyLCBwb3NpdGlvbiwgcG9zaXRpb24pIC8vIE1vdmUgcG9zaXRpb24gYWJvdmUgdGhlIGNlbnRlclxuXG4gICAgICByZXR1cm4gcG9zaXRpb25cbiAgICB9LFxuICAgIHpvb21Ub0lkcyh7XG4gICAgICBpZHMsXG4gICAgICBkdXJhdGlvbiA9IDUwMCxcbiAgICB9OiB7XG4gICAgICBpZHM6IHN0cmluZ1tdXG4gICAgICBkdXJhdGlvbj86IG51bWJlciAvLyB0YWtlIGluIG1pbGxpc2Vjb25kcyBmb3Igbm9ybWFsaXphdGlvbiB3aXRoIG9wZW5sYXllcnMgZHVyYXRpb24gYmVpbmcgbWlsbGlzZWNvbmRzXG4gICAgfSkge1xuICAgICAgLy8gdXNlIGZseVRvIGluc3RlYWQgb2YgZmx5VG9Cb3VuZGluZ1NwaGVyZSwgYXMgd2l0aCB0aGUgbGF0dGVyIHRoZSBvcmllbnRhdGlvbiBjYW4ndCBiZSBjb250cm9sbGVkIGluIHRoaXMgdmVyc2lvbiBhbmQgaXQgZW5kcyB1cCB0aWx0ZWRcbiAgICAgIG1hcC5jYW1lcmEuZmx5VG8oe1xuICAgICAgICBkZXN0aW5hdGlvbjogdGhpcy5nZXRDZW50ZXJQb3NpdGlvbk9mUHJpbWl0aXZlSWRzKGlkcyksXG4gICAgICAgIG9yaWVudGF0aW9uOiBMb29raW5nU3RyYWlnaHREb3duT3JpZW50YXRpb24sXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAvIDEwMDAsIC8vIGNoYW5nZSB0byBzZWNvbmRzXG4gICAgICB9KVxuICAgIH0sXG4gICAgcGFuVG9SZWN0YW5nbGUoXG4gICAgICByZWN0YW5nbGU6IGFueSxcbiAgICAgIG9wdHMgPSB7XG4gICAgICAgIGR1cmF0aW9uOiAwLjUsXG4gICAgICAgIGNvcnJlY3Rpb246IDAuMjUsXG4gICAgICB9XG4gICAgKSB7XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgZHVyYXRpb246IG9wdHMuZHVyYXRpb24sXG4gICAgICAgIGRlc3RpbmF0aW9uOiBnZXREZXN0aW5hdGlvbkZvclZpc2libGVQYW4ocmVjdGFuZ2xlLCBtYXApLFxuICAgICAgICBjb21wbGV0ZSgpIHtcbiAgICAgICAgICBtYXAuc2NlbmUuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBvcHRzLmNvcnJlY3Rpb24sXG4gICAgICAgICAgICBkZXN0aW5hdGlvbjogZ2V0RGVzdGluYXRpb25Gb3JWaXNpYmxlUGFuKHJlY3RhbmdsZSwgbWFwKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdldFNoYXBlcygpIHtcbiAgICAgIHJldHVybiBzaGFwZXNcbiAgICB9LFxuICAgIHpvb21Ub0V4dGVudCgpIHt9LFxuICAgIHpvb21Ub0JvdW5kaW5nQm94KHsgbm9ydGgsIHNvdXRoLCBlYXN0LCB3ZXN0IH06IGFueSkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgIGR1cmF0aW9uOiAwLjUsXG4gICAgICAgIGRlc3RpbmF0aW9uOiBDZXNpdW0uUmVjdGFuZ2xlLmZyb21EZWdyZWVzKHdlc3QsIHNvdXRoLCBlYXN0LCBub3J0aCksXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2V0Qm91bmRpbmdCb3goKSB7XG4gICAgICBjb25zdCB2aWV3UmVjdGFuZ2xlID0gbWFwLnNjZW5lLmNhbWVyYS5jb21wdXRlVmlld1JlY3RhbmdsZSgpXG4gICAgICByZXR1cm4gXy5tYXBPYmplY3Qodmlld1JlY3RhbmdsZSwgKHZhbCkgPT4gQ2VzaXVtLk1hdGgudG9EZWdyZWVzKHZhbCkpXG4gICAgfSxcbiAgICBvdmVybGF5SW1hZ2UobW9kZWw6IExhenlRdWVyeVJlc3VsdCkge1xuICAgICAgY29uc3QgbWV0YWNhcmRJZCA9IG1vZGVsLnBsYWluLmlkXG4gICAgICB0aGlzLnJlbW92ZU92ZXJsYXkobWV0YWNhcmRJZClcbiAgICAgIGNvbnN0IGNvb3JkcyA9IG1vZGVsLmdldFBvaW50cygnbG9jYXRpb24nKVxuICAgICAgY29uc3QgY2FydG9ncmFwaGljcyA9IF8ubWFwKGNvb3JkcywgKGNvb3JkKSA9PiB7XG4gICAgICAgIGNvb3JkID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZClcbiAgICAgICAgcmV0dXJuIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgICAgY29vcmQubG9uZ2l0dWRlLFxuICAgICAgICAgIGNvb3JkLmxhdGl0dWRlLFxuICAgICAgICAgIGNvb3JkLmFsdGl0dWRlXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgICBjb25zdCByZWN0YW5nbGUgPSBDZXNpdW0uUmVjdGFuZ2xlLmZyb21DYXJ0b2dyYXBoaWNBcnJheShjYXJ0b2dyYXBoaWNzKVxuICAgICAgY29uc3Qgb3ZlcmxheUxheWVyID0gbWFwLnNjZW5lLmltYWdlcnlMYXllcnMuYWRkSW1hZ2VyeVByb3ZpZGVyKFxuICAgICAgICBuZXcgQ2VzaXVtLlNpbmdsZVRpbGVJbWFnZXJ5UHJvdmlkZXIoe1xuICAgICAgICAgIHVybDogbW9kZWwuY3VycmVudE92ZXJsYXlVcmwsXG4gICAgICAgICAgcmVjdGFuZ2xlLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBvdmVybGF5c1ttZXRhY2FyZElkXSA9IG92ZXJsYXlMYXllclxuICAgIH0sXG4gICAgcmVtb3ZlT3ZlcmxheShtZXRhY2FyZElkOiBhbnkpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgaWYgKG92ZXJsYXlzW21ldGFjYXJkSWRdKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBtYXAuc2NlbmUuaW1hZ2VyeUxheWVycy5yZW1vdmUob3ZlcmxheXNbbWV0YWNhcmRJZF0pXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBkZWxldGUgb3ZlcmxheXNbbWV0YWNhcmRJZF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZUFsbE92ZXJsYXlzKCkge1xuICAgICAgZm9yIChjb25zdCBvdmVybGF5IGluIG92ZXJsYXlzKSB7XG4gICAgICAgIGlmIChvdmVybGF5cy5oYXNPd25Qcm9wZXJ0eShvdmVybGF5KSkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIG1hcC5zY2VuZS5pbWFnZXJ5TGF5ZXJzLnJlbW92ZShvdmVybGF5c1tvdmVybGF5XSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb3ZlcmxheXMgPSB7fVxuICAgIH0sXG4gICAgZ2V0Q2FydG9ncmFwaGljQ2VudGVyT2ZDbHVzdGVySW5EZWdyZWVzKGNsdXN0ZXI6IENsdXN0ZXJUeXBlKSB7XG4gICAgICByZXR1cm4gdXRpbGl0eS5jYWxjdWxhdGVDYXJ0b2dyYXBoaWNDZW50ZXJPZkdlb21ldHJpZXNJbkRlZ3JlZXMoXG4gICAgICAgIGNsdXN0ZXIucmVzdWx0c1xuICAgICAgKVxuICAgIH0sXG4gICAgZ2V0V2luZG93TG9jYXRpb25zT2ZSZXN1bHRzKHJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdKSB7XG4gICAgICBsZXQgb2NjbHVkZXI6IGFueVxuICAgICAgaWYgKG1hcC5zY2VuZS5tb2RlID09PSBDZXNpdW0uU2NlbmVNb2RlLlNDRU5FM0QpIHtcbiAgICAgICAgb2NjbHVkZXIgPSBuZXcgQ2VzaXVtLkVsbGlwc29pZGFsT2NjbHVkZXIoXG4gICAgICAgICAgQ2VzaXVtLkVsbGlwc29pZC5XR1M4NCxcbiAgICAgICAgICBtYXAuc2NlbmUuY2FtZXJhLnBvc2l0aW9uXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiB7XG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5ID1cbiAgICAgICAgICB1dGlsaXR5LmNhbGN1bGF0ZUNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5KHJlc3VsdClcbiAgICAgICAgaWYgKG9jY2x1ZGVyICYmIGlzTm90VmlzaWJsZShjYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeSwgb2NjbHVkZXIpKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNlbnRlciA9IHV0aWxpdHkuY2FsY3VsYXRlV2luZG93Q2VudGVyT2ZHZW9tZXRyeShcbiAgICAgICAgICBjYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeSxcbiAgICAgICAgICBtYXBcbiAgICAgICAgKVxuICAgICAgICBpZiAoY2VudGVyKSB7XG4gICAgICAgICAgcmV0dXJuIFtjZW50ZXIueCwgY2VudGVyLnldXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBEcmF3cyBhIG1hcmtlciBvbiB0aGUgbWFwIGRlc2lnbmF0aW5nIGEgc3RhcnQvZW5kIHBvaW50IGZvciB0aGUgcnVsZXIgbWVhc3VyZW1lbnQuIFRoZSBnaXZlblxuICAgICAqIGNvb3JkaW5hdGVzIHNob3VsZCBiZSBhbiBvYmplY3Qgd2l0aCAnbGF0JyBhbmQgJ2xvbicga2V5cyB3aXRoIGRlZ3JlZXMgdmFsdWVzLiBUaGUgZ2l2ZW5cbiAgICAgKiBtYXJrZXIgbGFiZWwgc2hvdWxkIGJlIGEgc2luZ2xlIGNoYXJhY3RlciBvciBkaWdpdCB0aGF0IGlzIGRpc3BsYXllZCBvbiB0aGUgbWFwIG1hcmtlci5cbiAgICAgKi9cbiAgICBhZGRSdWxlclBvaW50KGNvb3JkaW5hdGVzOiBhbnkpIHtcbiAgICAgIGNvbnN0IHsgbGF0LCBsb24gfSA9IGNvb3JkaW5hdGVzXG4gICAgICAvLyBhIHBvaW50IHJlcXVpcmVzIGFuIGFsdGl0dWRlIHZhbHVlIHNvIGp1c3QgdXNlIDBcbiAgICAgIGNvbnN0IHBvaW50ID0gW2xvbiwgbGF0LCAwXVxuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgaWQ6ICcgJyxcbiAgICAgICAgdGl0bGU6IGBTZWxlY3RlZCBydWxlciBjb29yZGluYXRlYCxcbiAgICAgICAgaW1hZ2U6IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZSh7XG4gICAgICAgICAgZmlsbENvbG9yOiBydWxlclBvaW50Q29sb3IsXG4gICAgICAgICAgaWNvbjogbnVsbCxcbiAgICAgICAgfSksXG4gICAgICAgIHZpZXc6IHRoaXMsXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5hZGRQb2ludChwb2ludCwgb3B0aW9ucylcbiAgICB9LFxuICAgIC8qXG4gICAgICogUmVtb3ZlcyB0aGUgZ2l2ZW4gQmlsbGJvYXJkIGZyb20gdGhlIG1hcC5cbiAgICAgKi9cbiAgICByZW1vdmVSdWxlclBvaW50KGJpbGxib2FyZFJlZjogYW55KSB7XG4gICAgICBiaWxsYm9hcmRDb2xsZWN0aW9uLnJlbW92ZShiaWxsYm9hcmRSZWYpXG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICAvKlxuICAgICAqIERyYXdzIGEgbGluZSBvbiB0aGUgbWFwIGJldHdlZW4gdGhlIHBvaW50cyBpbiB0aGUgZ2l2ZW4gYXJyYXkgb2YgcG9pbnRzLlxuICAgICAqL1xuICAgIGFkZFJ1bGVyTGluZShwb2ludDogYW55KSB7XG4gICAgICBsZXQgc3RhcnRpbmdDb29yZGluYXRlcyA9IG1hcE1vZGVsLmdldCgnc3RhcnRpbmdDb29yZGluYXRlcycpXG4gICAgICAvLyBjcmVhdGVzIGFuIGFycmF5IG9mIENhcnRlc2lhbjMgcG9pbnRzXG4gICAgICAvLyBhIFBvbHlsaW5lR2VvbWV0cnkgYWxsb3dzIHRoZSBsaW5lIHRvIGZvbGxvdyB0aGUgY3VydmF0dXJlIG9mIHRoZSBzdXJmYWNlXG4gICAgICBtYXAuY29vcmRBcnJheSA9IFtcbiAgICAgICAgc3RhcnRpbmdDb29yZGluYXRlc1snbG9uJ10sXG4gICAgICAgIHN0YXJ0aW5nQ29vcmRpbmF0ZXNbJ2xhdCddLFxuICAgICAgICBydWxlckxpbmVIZWlnaHQsXG4gICAgICAgIHBvaW50Wydsb24nXSxcbiAgICAgICAgcG9pbnRbJ2xhdCddLFxuICAgICAgICBydWxlckxpbmVIZWlnaHQsXG4gICAgICBdXG4gICAgICByZXR1cm4gbWFwLmVudGl0aWVzLmFkZCh7XG4gICAgICAgIHBvbHlsaW5lOiB7XG4gICAgICAgICAgcG9zaXRpb25zOiBuZXcgQ2VzaXVtLkNhbGxiYWNrUHJvcGVydHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIENlc2l1bS5DYXJ0ZXNpYW4zLmZyb21EZWdyZWVzQXJyYXlIZWlnaHRzKG1hcC5jb29yZEFycmF5KVxuICAgICAgICAgIH0sIGZhbHNlKSxcbiAgICAgICAgICB3aWR0aDogNSxcbiAgICAgICAgICBzaG93OiB0cnVlLFxuICAgICAgICAgIG1hdGVyaWFsOiBydWxlckNvbG9yLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9LFxuICAgIC8qXG4gICAgICogVXBkYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgcnVsZXIgbGluZVxuICAgICAqL1xuICAgIHNldFJ1bGVyTGluZShwb2ludDogYW55KSB7XG4gICAgICBsZXQgc3RhcnRpbmdDb29yZGluYXRlcyA9IG1hcE1vZGVsLmdldCgnc3RhcnRpbmdDb29yZGluYXRlcycpXG4gICAgICBtYXAuY29vcmRBcnJheSA9IFtcbiAgICAgICAgc3RhcnRpbmdDb29yZGluYXRlc1snbG9uJ10sXG4gICAgICAgIHN0YXJ0aW5nQ29vcmRpbmF0ZXNbJ2xhdCddLFxuICAgICAgICBydWxlckxpbmVIZWlnaHQsXG4gICAgICAgIHBvaW50Wydsb24nXSxcbiAgICAgICAgcG9pbnRbJ2xhdCddLFxuICAgICAgICBydWxlckxpbmVIZWlnaHQsXG4gICAgICBdXG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICAvKlxuICAgICAqIFJlbW92ZXMgdGhlIGdpdmVuIHBvbHlsaW5lIGVudGl0eSBmcm9tIHRoZSBtYXAuXG4gICAgICovXG4gICAgcmVtb3ZlUnVsZXJMaW5lKHBvbHlsaW5lOiBhbnkpIHtcbiAgICAgIG1hcC5lbnRpdGllcy5yZW1vdmUocG9seWxpbmUpXG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICAgIEFkZHMgYSBiaWxsYm9hcmQgcG9pbnQgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgICAgICAgKi9cbiAgICBhZGRQb2ludFdpdGhUZXh0KHBvaW50OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgcG9pbnRPYmplY3QgPSBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50KVxuICAgICAgY29uc3QgY2FydG9ncmFwaGljUG9zaXRpb24gPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICBwb2ludE9iamVjdC5sb25naXR1ZGUsXG4gICAgICAgIHBvaW50T2JqZWN0LmxhdGl0dWRlLFxuICAgICAgICBwb2ludE9iamVjdC5hbHRpdHVkZVxuICAgICAgKVxuICAgICAgbGV0IGNhcnRlc2lhblBvc2l0aW9uID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNUb0NhcnRlc2lhbihjYXJ0b2dyYXBoaWNQb3NpdGlvbilcbiAgICAgIGNvbnN0IGJpbGxib2FyZFJlZiA9IGJpbGxib2FyZENvbGxlY3Rpb24uYWRkKHtcbiAgICAgICAgaW1hZ2U6IHVuZGVmaW5lZCxcbiAgICAgICAgcG9zaXRpb246IGNhcnRlc2lhblBvc2l0aW9uLFxuICAgICAgICBpZDogb3B0aW9ucy5pZCxcbiAgICAgICAgZXllT2Zmc2V0LFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi51bnNlbGVjdGVkSW1hZ2UgPSBEcmF3aW5nVXRpbGl0eS5nZXRDaXJjbGVXaXRoVGV4dCh7XG4gICAgICAgIGZpbGxDb2xvcjogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgdGV4dDogb3B0aW9ucy5pZC5sZW5ndGgsXG4gICAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLnBhcnRpYWxseVNlbGVjdGVkSW1hZ2UgPSBEcmF3aW5nVXRpbGl0eS5nZXRDaXJjbGVXaXRoVGV4dCh7XG4gICAgICAgIGZpbGxDb2xvcjogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgdGV4dDogb3B0aW9ucy5pZC5sZW5ndGgsXG4gICAgICAgIHN0cm9rZUNvbG9yOiAnYmxhY2snLFxuICAgICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLnNlbGVjdGVkSW1hZ2UgPSBEcmF3aW5nVXRpbGl0eS5nZXRDaXJjbGVXaXRoVGV4dCh7XG4gICAgICAgIGZpbGxDb2xvcjogJ29yYW5nZScsXG4gICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgfSlcbiAgICAgIHN3aXRjaCAob3B0aW9ucy5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGNhc2UgJ3NlbGVjdGVkJzpcbiAgICAgICAgICBiaWxsYm9hcmRSZWYuaW1hZ2UgPSBiaWxsYm9hcmRSZWYuc2VsZWN0ZWRJbWFnZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3BhcnRpYWxseSc6XG4gICAgICAgICAgYmlsbGJvYXJkUmVmLmltYWdlID0gYmlsbGJvYXJkUmVmLnBhcnRpYWxseVNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICd1bnNlbGVjdGVkJzpcbiAgICAgICAgICBiaWxsYm9hcmRSZWYuaW1hZ2UgPSBiaWxsYm9hcmRSZWYudW5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIC8vaWYgdGhlcmUgaXMgYSB0ZXJyYWluIHByb3ZpZGVyIGFuZCBubyBhbHRpdHVkZSBoYXMgYmVlbiBzcGVjaWZpZWQsIHNhbXBsZSBpdCBmcm9tIHRoZSBjb25maWd1cmVkIHRlcnJhaW4gcHJvdmlkZXJcbiAgICAgIGlmICghcG9pbnRPYmplY3QuYWx0aXR1ZGUgJiYgbWFwLnNjZW5lLnRlcnJhaW5Qcm92aWRlcikge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gQ2VzaXVtLnNhbXBsZVRlcnJhaW4obWFwLnNjZW5lLnRlcnJhaW5Qcm92aWRlciwgNSwgW1xuICAgICAgICAgIGNhcnRvZ3JhcGhpY1Bvc2l0aW9uLFxuICAgICAgICBdKVxuICAgICAgICBDZXNpdW0ud2hlbihwcm9taXNlLCAodXBkYXRlZENhcnRvZ3JhcGhpYzogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKHVwZGF0ZWRDYXJ0b2dyYXBoaWNbMF0uaGVpZ2h0ICYmICFvcHRpb25zLnZpZXcuaXNEZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIGNhcnRlc2lhblBvc2l0aW9uID1cbiAgICAgICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNUb0NhcnRlc2lhbihcbiAgICAgICAgICAgICAgICB1cGRhdGVkQ2FydG9ncmFwaGljWzBdXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIGJpbGxib2FyZFJlZi5wb3NpdGlvbiA9IGNhcnRlc2lhblBvc2l0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgICAgcmV0dXJuIGJpbGxib2FyZFJlZlxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIGJpbGxib2FyZCBwb2ludCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2ludCBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgICAgICAgKi9cbiAgICBhZGRQb2ludChwb2ludDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvaW50T2JqZWN0ID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludClcbiAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpY1Bvc2l0aW9uID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgcG9pbnRPYmplY3QubG9uZ2l0dWRlLFxuICAgICAgICBwb2ludE9iamVjdC5sYXRpdHVkZSxcbiAgICAgICAgcG9pbnRPYmplY3QuYWx0aXR1ZGVcbiAgICAgIClcbiAgICAgIGNvbnN0IGNhcnRlc2lhblBvc2l0aW9uID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNUb0NhcnRlc2lhbihjYXJ0b2dyYXBoaWNQb3NpdGlvbilcbiAgICAgIGNvbnN0IGJpbGxib2FyZFJlZiA9IGJpbGxib2FyZENvbGxlY3Rpb24uYWRkKHtcbiAgICAgICAgaW1hZ2U6IHVuZGVmaW5lZCxcbiAgICAgICAgcG9zaXRpb246IGNhcnRlc2lhblBvc2l0aW9uLFxuICAgICAgICBpZDogb3B0aW9ucy5pZCxcbiAgICAgICAgZXllT2Zmc2V0LFxuICAgICAgICBwaXhlbE9mZnNldCxcbiAgICAgICAgdmVydGljYWxPcmlnaW46IG9wdGlvbnMudXNlVmVydGljYWxPcmlnaW5cbiAgICAgICAgICA/IENlc2l1bS5WZXJ0aWNhbE9yaWdpbi5CT1RUT01cbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgaG9yaXpvbnRhbE9yaWdpbjogb3B0aW9ucy51c2VIb3Jpem9udGFsT3JpZ2luXG4gICAgICAgICAgPyBDZXNpdW0uSG9yaXpvbnRhbE9yaWdpbi5DRU5URVJcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgdmlldzogb3B0aW9ucy52aWV3LFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi51bnNlbGVjdGVkSW1hZ2UgPSBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYuc2VsZWN0ZWRJbWFnZSA9IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgIGZpbGxDb2xvcjogJ29yYW5nZScsXG4gICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYuaW1hZ2UgPSBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgPyBiaWxsYm9hcmRSZWYuc2VsZWN0ZWRJbWFnZVxuICAgICAgICA6IGJpbGxib2FyZFJlZi51bnNlbGVjdGVkSW1hZ2VcbiAgICAgIC8vaWYgdGhlcmUgaXMgYSB0ZXJyYWluIHByb3ZpZGVyIGFuZCBubyBhbHRpdHVkZSBoYXMgYmVlbiBzcGVjaWZpZWQsIHNhbXBsZSBpdCBmcm9tIHRoZSBjb25maWd1cmVkIHRlcnJhaW4gcHJvdmlkZXJcbiAgICAgIGlmICghcG9pbnRPYmplY3QuYWx0aXR1ZGUgJiYgbWFwLnNjZW5lLnRlcnJhaW5Qcm92aWRlcikge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gQ2VzaXVtLnNhbXBsZVRlcnJhaW4obWFwLnNjZW5lLnRlcnJhaW5Qcm92aWRlciwgNSwgW1xuICAgICAgICAgIGNhcnRvZ3JhcGhpY1Bvc2l0aW9uLFxuICAgICAgICBdKVxuICAgICAgICBDZXNpdW0ud2hlbihwcm9taXNlLCAodXBkYXRlZENhcnRvZ3JhcGhpYzogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKHVwZGF0ZWRDYXJ0b2dyYXBoaWNbMF0uaGVpZ2h0ICYmICFvcHRpb25zLnZpZXcuaXNEZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIGJpbGxib2FyZFJlZi5wb3NpdGlvbiA9XG4gICAgICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oXG4gICAgICAgICAgICAgICAgdXBkYXRlZENhcnRvZ3JhcGhpY1swXVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgICAgcmV0dXJuIGJpbGxib2FyZFJlZlxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIGxhYmVsIHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gYW4gaWQgYW5kIHRleHQuXG4gICAgICAgICAgICAqL1xuICAgIGFkZExhYmVsKHBvaW50OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgcG9pbnRPYmplY3QgPSBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50KVxuICAgICAgY29uc3QgY2FydG9ncmFwaGljUG9zaXRpb24gPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICBwb2ludE9iamVjdC5sb25naXR1ZGUsXG4gICAgICAgIHBvaW50T2JqZWN0LmxhdGl0dWRlLFxuICAgICAgICBwb2ludE9iamVjdC5hbHRpdHVkZVxuICAgICAgKVxuICAgICAgY29uc3QgY2FydGVzaWFuUG9zaXRpb24gPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKGNhcnRvZ3JhcGhpY1Bvc2l0aW9uKVxuICAgICAgLy8gWCwgWSBvZmZzZXQgdmFsdWVzIGZvciB0aGUgbGFiZWxcbiAgICAgIGNvbnN0IG9mZnNldCA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigyMCwgLTE1KVxuICAgICAgLy8gQ2VzaXVtIG1lYXN1cmVtZW50IGZvciBkZXRlcm1pbmluZyBob3cgdG8gcmVuZGVyIHRoZSBzaXplIG9mIHRoZSBsYWJlbCBiYXNlZCBvbiB6b29tXG4gICAgICBjb25zdCBzY2FsZVpvb20gPSBuZXcgQ2VzaXVtLk5lYXJGYXJTY2FsYXIoMS41ZTQsIDEuMCwgOC4wZTYsIDAuMClcbiAgICAgIC8vIENlc2l1bSBtZWFzdXJlbWVudCBmb3IgZGV0ZXJtaW5pbmcgaG93IHRvIHJlbmRlciB0aGUgdHJhbnNsdWNlbmN5IG9mIHRoZSBsYWJlbCBiYXNlZCBvbiB6b29tXG4gICAgICBjb25zdCB0cmFuc2x1Y2VuY3lab29tID0gbmV3IENlc2l1bS5OZWFyRmFyU2NhbGFyKDEuNWU2LCAxLjAsIDguMGU2LCAwLjApXG4gICAgICBjb25zdCBsYWJlbFJlZiA9IGxhYmVsQ29sbGVjdGlvbi5hZGQoe1xuICAgICAgICB0ZXh0OiBvcHRpb25zLnRleHQsXG4gICAgICAgIHBvc2l0aW9uOiBjYXJ0ZXNpYW5Qb3NpdGlvbixcbiAgICAgICAgaWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIHBpeGVsT2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgIHNjYWxlOiAxLjAsXG4gICAgICAgIHNjYWxlQnlEaXN0YW5jZTogc2NhbGVab29tLFxuICAgICAgICB0cmFuc2x1Y2VuY3lCeURpc3RhbmNlOiB0cmFuc2x1Y2VuY3lab29tLFxuICAgICAgICBmaWxsQ29sb3I6IENlc2l1bS5Db2xvci5CTEFDSyxcbiAgICAgICAgb3V0bGluZUNvbG9yOiBDZXNpdW0uQ29sb3IuV0hJVEUsXG4gICAgICAgIG91dGxpbmVXaWR0aDogMTAsXG4gICAgICAgIHN0eWxlOiBDZXNpdW0uTGFiZWxTdHlsZS5GSUxMX0FORF9PVVRMSU5FLFxuICAgICAgfSlcbiAgICAgIG1hcE1vZGVsLmFkZExhYmVsKGxhYmVsUmVmKVxuICAgICAgcmV0dXJuIGxhYmVsUmVmXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgcG9seWxpbmUgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gbGluZSBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgICAgICovXG4gICAgYWRkTGluZShsaW5lOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgbGluZU9iamVjdCA9IGxpbmUubWFwKChjb29yZGluYXRlOiBhbnkpID0+XG4gICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGNhcnRQb2ludHMgPSBfLm1hcChsaW5lT2JqZWN0LCAocG9pbnQpID0+XG4gICAgICAgIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgICAgcG9pbnQubG9uZ2l0dWRlLFxuICAgICAgICAgIHBvaW50LmxhdGl0dWRlLFxuICAgICAgICAgIHBvaW50LmFsdGl0dWRlXG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIGNvbnN0IGNhcnRlc2lhbiA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljQXJyYXlUb0NhcnRlc2lhbkFycmF5KGNhcnRQb2ludHMpXG4gICAgICBjb25zdCBwb2x5bGluZUNvbGxlY3Rpb24gPSBuZXcgQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbigpXG4gICAgICBwb2x5bGluZUNvbGxlY3Rpb24udW5zZWxlY3RlZE1hdGVyaWFsID0gQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKFxuICAgICAgICAnUG9seWxpbmVPdXRsaW5lJyxcbiAgICAgICAge1xuICAgICAgICAgIGNvbG9yOiBkZXRlcm1pbmVDZXNpdW1Db2xvcihvcHRpb25zLmNvbG9yKSxcbiAgICAgICAgICBvdXRsaW5lQ29sb3I6IENlc2l1bS5Db2xvci5XSElURSxcbiAgICAgICAgICBvdXRsaW5lV2lkdGg6IDQsXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIHBvbHlsaW5lQ29sbGVjdGlvbi5zZWxlY3RlZE1hdGVyaWFsID0gQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKFxuICAgICAgICAnUG9seWxpbmVPdXRsaW5lJyxcbiAgICAgICAge1xuICAgICAgICAgIGNvbG9yOiBkZXRlcm1pbmVDZXNpdW1Db2xvcihvcHRpb25zLmNvbG9yKSxcbiAgICAgICAgICBvdXRsaW5lQ29sb3I6IENlc2l1bS5Db2xvci5CTEFDSyxcbiAgICAgICAgICBvdXRsaW5lV2lkdGg6IDQsXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIGNvbnN0IHBvbHlsaW5lID0gcG9seWxpbmVDb2xsZWN0aW9uLmFkZCh7XG4gICAgICAgIHdpZHRoOiA4LFxuICAgICAgICBtYXRlcmlhbDogb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgICAgPyBwb2x5bGluZUNvbGxlY3Rpb24uc2VsZWN0ZWRNYXRlcmlhbFxuICAgICAgICAgIDogcG9seWxpbmVDb2xsZWN0aW9uLnVuc2VsZWN0ZWRNYXRlcmlhbCxcbiAgICAgICAgaWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIHBvc2l0aW9uczogY2FydGVzaWFuLFxuICAgICAgfSlcbiAgICAgIGlmIChtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBDZXNpdW0uc2FtcGxlVGVycmFpbihcbiAgICAgICAgICBtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyLFxuICAgICAgICAgIDUsXG4gICAgICAgICAgY2FydFBvaW50c1xuICAgICAgICApXG4gICAgICAgIENlc2l1bS53aGVuKHByb21pc2UsICh1cGRhdGVkQ2FydG9ncmFwaGljOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbnMgPVxuICAgICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNBcnJheVRvQ2FydGVzaWFuQXJyYXkoXG4gICAgICAgICAgICAgIHVwZGF0ZWRDYXJ0b2dyYXBoaWNcbiAgICAgICAgICAgIClcbiAgICAgICAgICBpZiAodXBkYXRlZENhcnRvZ3JhcGhpY1swXS5oZWlnaHQgJiYgIW9wdGlvbnMudmlldy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcG9seWxpbmUucG9zaXRpb25zID0gcG9zaXRpb25zXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnByaW1pdGl2ZXMuYWRkKHBvbHlsaW5lQ29sbGVjdGlvbilcbiAgICAgIHJldHVybiBwb2x5bGluZUNvbGxlY3Rpb25cbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBwb2x5Z29uIGZpbGwgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9seWdvbiBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRQb2x5Z29uKHBvbHlnb246IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2x5Z29uT2JqZWN0ID0gcG9seWdvbi5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT5cbiAgICAgICAgY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKVxuICAgICAgKVxuICAgICAgY29uc3QgY2FydFBvaW50cyA9IF8ubWFwKHBvbHlnb25PYmplY3QsIChwb2ludCkgPT5cbiAgICAgICAgQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgICBwb2ludC5sb25naXR1ZGUsXG4gICAgICAgICAgcG9pbnQubGF0aXR1ZGUsXG4gICAgICAgICAgcG9pbnQuYWx0aXR1ZGVcbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgbGV0IGNhcnRlc2lhbiA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljQXJyYXlUb0NhcnRlc2lhbkFycmF5KGNhcnRQb2ludHMpXG4gICAgICBjb25zdCB1bnNlbGVjdGVkUG9seWdvblJlZiA9IG1hcC5lbnRpdGllcy5hZGQoe1xuICAgICAgICBwb2x5Z29uOiB7XG4gICAgICAgICAgaGllcmFyY2h5OiBjYXJ0ZXNpYW4sXG4gICAgICAgICAgbWF0ZXJpYWw6IG5ldyBDZXNpdW0uR3JpZE1hdGVyaWFsUHJvcGVydHkoe1xuICAgICAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvci5XSElURSxcbiAgICAgICAgICAgIGNlbGxBbHBoYTogMC4wLFxuICAgICAgICAgICAgbGluZUNvdW50OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMiwgMiksXG4gICAgICAgICAgICBsaW5lVGhpY2tuZXNzOiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMi4wLCAyLjApLFxuICAgICAgICAgICAgbGluZU9mZnNldDogbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDAuMCwgMC4wKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBwZXJQb3NpdGlvbkhlaWdodDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgcmVzdWx0SWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIHNob3dXaGVuU2VsZWN0ZWQ6IGZhbHNlLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IHNlbGVjdGVkUG9seWdvblJlZiA9IG1hcC5lbnRpdGllcy5hZGQoe1xuICAgICAgICBwb2x5Z29uOiB7XG4gICAgICAgICAgaGllcmFyY2h5OiBjYXJ0ZXNpYW4sXG4gICAgICAgICAgbWF0ZXJpYWw6IG5ldyBDZXNpdW0uR3JpZE1hdGVyaWFsUHJvcGVydHkoe1xuICAgICAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvci5CTEFDSyxcbiAgICAgICAgICAgIGNlbGxBbHBoYTogMC4wLFxuICAgICAgICAgICAgbGluZUNvdW50OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMiwgMiksXG4gICAgICAgICAgICBsaW5lVGhpY2tuZXNzOiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMi4wLCAyLjApLFxuICAgICAgICAgICAgbGluZU9mZnNldDogbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDAuMCwgMC4wKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBwZXJQb3NpdGlvbkhlaWdodDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgc2hvdzogZmFsc2UsXG4gICAgICAgIHJlc3VsdElkOiBvcHRpb25zLmlkLFxuICAgICAgICBzaG93V2hlblNlbGVjdGVkOiB0cnVlLFxuICAgICAgfSlcbiAgICAgIGlmIChtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBDZXNpdW0uc2FtcGxlVGVycmFpbihcbiAgICAgICAgICBtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyLFxuICAgICAgICAgIDUsXG4gICAgICAgICAgY2FydFBvaW50c1xuICAgICAgICApXG4gICAgICAgIENlc2l1bS53aGVuKHByb21pc2UsICh1cGRhdGVkQ2FydG9ncmFwaGljOiBhbnkpID0+IHtcbiAgICAgICAgICBjYXJ0ZXNpYW4gPVxuICAgICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNBcnJheVRvQ2FydGVzaWFuQXJyYXkoXG4gICAgICAgICAgICAgIHVwZGF0ZWRDYXJ0b2dyYXBoaWNcbiAgICAgICAgICAgIClcbiAgICAgICAgICBpZiAodXBkYXRlZENhcnRvZ3JhcGhpY1swXS5oZWlnaHQgJiYgIW9wdGlvbnMudmlldy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgdW5zZWxlY3RlZFBvbHlnb25SZWYucG9seWdvbi5oaWVyYXJjaHkuc2V0VmFsdWUoY2FydGVzaWFuKVxuICAgICAgICAgICAgc2VsZWN0ZWRQb2x5Z29uUmVmLnBvbHlnb24uaGllcmFyY2h5LnNldFZhbHVlKGNhcnRlc2lhbilcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4gW3Vuc2VsZWN0ZWRQb2x5Z29uUmVmLCBzZWxlY3RlZFBvbHlnb25SZWZdXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gcmVmbGVjdCB3aGV0aGVyIG9yIG5vdCBpdCBpcyBzZWxlY3RlZC5cbiAgICAgICAgICAgICBPcHRpb25zIHBhc3NlZCBpbiBhcmUgY29sb3IgYW5kIGlzU2VsZWN0ZWQuXG4gICAgICAgICAgICAqL1xuICAgIHVwZGF0ZUNsdXN0ZXIoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShnZW9tZXRyeSkpIHtcbiAgICAgICAgZ2VvbWV0cnkuZm9yRWFjaCgoaW5uZXJHZW9tZXRyeSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlQ2x1c3Rlcihpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uQmlsbGJvYXJkKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICAgICAgZ2VvbWV0cnkuaW1hZ2UgPSBnZW9tZXRyeS5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3BhcnRpYWxseSc6XG4gICAgICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IGdlb21ldHJ5LnBhcnRpYWxseVNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAndW5zZWxlY3RlZCc6XG4gICAgICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IGdlb21ldHJ5LnVuc2VsZWN0ZWRJbWFnZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gb3B0aW9ucy5pc1NlbGVjdGVkICE9PSAndW5zZWxlY3RlZCdcbiAgICAgICAgZ2VvbWV0cnkuZXllT2Zmc2V0ID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKDAsIDAsIGlzU2VsZWN0ZWQgPyAtMSA6IDApXG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKSB7XG4gICAgICAgIGdlb21ldHJ5Ll9wb2x5bGluZXMuZm9yRWFjaCgocG9seWxpbmU6IGFueSkgPT4ge1xuICAgICAgICAgIHBvbHlsaW5lLm1hdGVyaWFsID0gQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdQb2x5bGluZU91dGxpbmUnLCB7XG4gICAgICAgICAgICBjb2xvcjogZGV0ZXJtaW5lQ2VzaXVtQ29sb3IoJ3JnYmEoMCwwLDAsIC4xKScpLFxuICAgICAgICAgICAgb3V0bGluZUNvbG9yOiBkZXRlcm1pbmVDZXNpdW1Db2xvcigncmdiYSgyNTUsMjU1LDI1NSwgLjEpJyksXG4gICAgICAgICAgICBvdXRsaW5lV2lkdGg6IDQsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuc2hvd1doZW5TZWxlY3RlZCkge1xuICAgICAgICBnZW9tZXRyeS5zaG93ID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZW9tZXRyeS5zaG93ID0gIW9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byByZWZsZWN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIHNlbGVjdGVkLlxuICAgICAgICAgICAgICBPcHRpb25zIHBhc3NlZCBpbiBhcmUgY29sb3IgYW5kIGlzU2VsZWN0ZWQuXG4gICAgICAgICAgICAgICovXG4gICAgdXBkYXRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShnZW9tZXRyeSkpIHtcbiAgICAgICAgZ2VvbWV0cnkuZm9yRWFjaCgoaW5uZXJHZW9tZXRyeSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlR2VvbWV0cnkoaW5uZXJHZW9tZXRyeSwgb3B0aW9ucylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkJpbGxib2FyZCkge1xuICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gZ2VvbWV0cnkuc2VsZWN0ZWRJbWFnZVxuICAgICAgICAgIDogZ2VvbWV0cnkudW5zZWxlY3RlZEltYWdlXG4gICAgICAgIGdlb21ldHJ5LmV5ZU9mZnNldCA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMyhcbiAgICAgICAgICAwLFxuICAgICAgICAgIDAsXG4gICAgICAgICAgb3B0aW9ucy5pc1NlbGVjdGVkID8gLTEgOiAwXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5MYWJlbCkge1xuICAgICAgICBnZW9tZXRyeS5pc1NlbGVjdGVkID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgIHNob3dIaWRlTGFiZWwoe1xuICAgICAgICAgIGdlb21ldHJ5LFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbikge1xuICAgICAgICBnZW9tZXRyeS5fcG9seWxpbmVzLmZvckVhY2goKHBvbHlsaW5lOiBhbnkpID0+IHtcbiAgICAgICAgICBwb2x5bGluZS5tYXRlcmlhbCA9IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgICAgPyBnZW9tZXRyeS5zZWxlY3RlZE1hdGVyaWFsXG4gICAgICAgICAgICA6IGdlb21ldHJ5LnVuc2VsZWN0ZWRNYXRlcmlhbFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5zaG93V2hlblNlbGVjdGVkKSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSAhb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgaGlkZGVuXG4gICAgICAgICAgICAgKi9cbiAgICBoaWRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgaWYgKFxuICAgICAgICBnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkJpbGxib2FyZCB8fFxuICAgICAgICBnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkxhYmVsXG4gICAgICApIHtcbiAgICAgICAgZ2VvbWV0cnkuc2hvdyA9IGZhbHNlXG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKSB7XG4gICAgICAgIGdlb21ldHJ5Ll9wb2x5bGluZXMuZm9yRWFjaCgocG9seWxpbmU6IGFueSkgPT4ge1xuICAgICAgICAgIHBvbHlsaW5lLnNob3cgPSBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIGJlIHNob3duXG4gICAgICAgICAgICAgKi9cbiAgICBzaG93R2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uQmlsbGJvYXJkKSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uTGFiZWwpIHtcbiAgICAgICAgc2hvd0hpZGVMYWJlbCh7XG4gICAgICAgICAgZ2VvbWV0cnksXG4gICAgICAgICAgZmluZFNlbGVjdGVkOiB0cnVlLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLlBvbHlsaW5lQ29sbGVjdGlvbikge1xuICAgICAgICBnZW9tZXRyeS5fcG9seWxpbmVzLmZvckVhY2goKHBvbHlsaW5lOiBhbnkpID0+IHtcbiAgICAgICAgICBwb2x5bGluZS5zaG93ID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgbWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICAgIH0sXG4gICAgcmVtb3ZlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgYmlsbGJvYXJkQ29sbGVjdGlvbi5yZW1vdmUoZ2VvbWV0cnkpXG4gICAgICBsYWJlbENvbGxlY3Rpb24ucmVtb3ZlKGdlb21ldHJ5KVxuICAgICAgbWFwLnNjZW5lLnByaW1pdGl2ZXMucmVtb3ZlKGdlb21ldHJ5KVxuICAgICAgLy91bm1pbmlmaWVkIGNlc2l1bSBjaG9rZXMgaWYgeW91IGZlZWQgYSBnZW9tZXRyeSB3aXRoIGlkIGFzIGFuIEFycmF5XG4gICAgICBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5FbnRpdHkpIHtcbiAgICAgICAgbWFwLmVudGl0aWVzLnJlbW92ZShnZW9tZXRyeSlcbiAgICAgIH1cbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkxhYmVsKSB7XG4gICAgICAgIG1hcE1vZGVsLnJlbW92ZUxhYmVsKGdlb21ldHJ5KVxuICAgICAgICBzaG93SGlkZGVuTGFiZWwoZ2VvbWV0cnkpXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICBkZXN0cm95U2hhcGVzKCkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDYpIEZJWE1FOiBQYXJhbWV0ZXIgJ3NoYXBlJyBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlLlxuICAgICAgc2hhcGVzLmZvckVhY2goKHNoYXBlKSA9PiB7XG4gICAgICAgIHNoYXBlLmRlc3Ryb3koKVxuICAgICAgfSlcbiAgICAgIHNoYXBlcyA9IFtdXG4gICAgICBpZiAobWFwICYmIG1hcC5zY2VuZSkge1xuICAgICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRNYXAoKSB7XG4gICAgICByZXR1cm4gbWFwXG4gICAgfSxcbiAgICB6b29tSW4oKSB7XG4gICAgICBjb25zdCBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpYyA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoXG4gICAgICAgICAgbWFwLnNjZW5lLmNhbWVyYS5wb3NpdGlvblxuICAgICAgICApXG5cbiAgICAgIGNvbnN0IHRlcnJhaW5IZWlnaHQgPSBtYXAuc2NlbmUuZ2xvYmUuZ2V0SGVpZ2h0KFxuICAgICAgICBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpY1xuICAgICAgKVxuXG4gICAgICBjb25zdCBoZWlnaHRBYm92ZUdyb3VuZCA9XG4gICAgICAgIGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljLmhlaWdodCAtIHRlcnJhaW5IZWlnaHRcblxuICAgICAgY29uc3Qgem9vbUFtb3VudCA9IGhlaWdodEFib3ZlR3JvdW5kIC8gMiAvLyBiYXNpY2FsbHkgZG91YmxlIHRoZSBjdXJyZW50IHpvb21cblxuICAgICAgY29uc3QgbWF4Wm9vbUFtb3VudCA9IGhlaWdodEFib3ZlR3JvdW5kIC0gbWluaW11bUhlaWdodEFib3ZlVGVycmFpblxuXG4gICAgICAvLyBpZiB0aGUgem9vbSBhbW91bnQgaXMgZ3JlYXRlciB0aGFuIHRoZSBtYXggem9vbSBhbW91bnQsIHpvb20gdG8gdGhlIG1heCB6b29tIGFtb3VudFxuICAgICAgbWFwLnNjZW5lLmNhbWVyYS56b29tSW4oTWF0aC5taW4obWF4Wm9vbUFtb3VudCwgem9vbUFtb3VudCkpXG4gICAgfSxcbiAgICB6b29tT3V0KCkge1xuICAgICAgY29uc3QgY2FtZXJhUG9zaXRpb25DYXJ0b2dyYXBoaWMgPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKFxuICAgICAgICAgIG1hcC5zY2VuZS5jYW1lcmEucG9zaXRpb25cbiAgICAgICAgKVxuXG4gICAgICBjb25zdCB0ZXJyYWluSGVpZ2h0ID0gbWFwLnNjZW5lLmdsb2JlLmdldEhlaWdodChcbiAgICAgICAgY2FtZXJhUG9zaXRpb25DYXJ0b2dyYXBoaWNcbiAgICAgIClcblxuICAgICAgY29uc3QgaGVpZ2h0QWJvdmVHcm91bmQgPVxuICAgICAgICBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpYy5oZWlnaHQgLSB0ZXJyYWluSGVpZ2h0XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLnpvb21PdXQoaGVpZ2h0QWJvdmVHcm91bmQpXG4gICAgfSxcbiAgICBkZXN0cm95KCkge1xuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQub2ZmKCdtYXA6cmVxdWVzdFJlbmRlcicsIHJlcXVlc3RSZW5kZXJIYW5kbGVyKVxuICAgICAgbWFwLmRlc3Ryb3koKVxuICAgIH0sXG4gIH1cbiAgcmV0dXJuIGV4cG9zZWRNZXRob2RzXG59XG4iXX0=