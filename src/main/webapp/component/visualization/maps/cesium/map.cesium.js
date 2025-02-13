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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLmNlc2l1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2Nlc2l1bS9tYXAuY2VzaXVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxjQUFjLE1BQU0sbUJBQW1CLENBQUE7QUFDOUMsT0FBTyxLQUFLLE1BQU0sc0JBQXNCLENBQUE7QUFDeEMsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3JFLE9BQU8sRUFDTCwwQkFBMEIsRUFDMUIsWUFBWSxHQUNiLE1BQU0sMENBQTBDLENBQUE7QUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBR3JELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3ZFLElBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQTtBQUM5QixJQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNoRCxJQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2pELElBQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3JELElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQTtBQUNqQyxJQUFNLGVBQWUsR0FBRyxDQUFDLENBQUE7QUFDekIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNoRixJQUFNLG9CQUFvQixHQUFHLDBCQUEwQixDQUFBO0FBQ3ZELFNBQVMsb0JBQW9CLENBQUMsTUFBVyxFQUFFLGVBQW9CO0lBQzdELElBQUksZUFBZSxJQUFJLElBQUksSUFBSSxlQUFlLEtBQUssU0FBUyxFQUFFO1FBQzVELE9BQU8sQ0FBQyxJQUFJLENBQUMsc0dBQzJDLENBQUMsQ0FBQTtRQUN6RCxPQUFNO0tBQ1A7SUFDTyxJQUFBLElBQUksR0FBdUIsZUFBZSxLQUF0QyxFQUFLLGFBQWEsVUFBSyxlQUFlLEVBQTVDLFFBQTBCLENBQUYsQ0FBb0I7SUFDbEQsSUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDbEQsSUFBSSxlQUFlLEtBQUssU0FBUyxFQUFFO1FBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdURBQzRCLElBQUksMkVBRXhDLENBQUMsQ0FBQTtRQUNOLE9BQU07S0FDUDtJQUNELElBQU0sNEJBQTRCLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUE7SUFDakUsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUNoRSxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxzREFDMkIsSUFBSSxDQUFDLFNBQVMsWUFDNUMsSUFBSSxNQUFBLElBQ0QsYUFBYSxFQUNoQiw2RUFFTCxDQUFDLENBQUE7UUFDTixNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyw0QkFBNEIsQ0FBQTtJQUM3RCxDQUFDLENBQUMsQ0FBQTtJQUNGLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLHFCQUFxQixDQUFBO0FBQ3RELENBQUM7QUFDRCxTQUFTLFNBQVMsQ0FBQyxnQkFBcUIsRUFBRSxTQUFjO0lBQ3RELElBQU0seUJBQXlCLEdBQUcsSUFBSSxZQUFZLENBQUM7UUFDakQsVUFBVSxFQUFFLFNBQVM7S0FDdEIsQ0FBQyxDQUFBO0lBQ0YsSUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsT0FBTyxDQUFDO1FBQy9DLE9BQU8sRUFBRSxnQkFBZ0I7UUFDekIsYUFBYSxFQUFFO1lBQ2IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTztZQUNuQyxlQUFlLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFDOUMsU0FBUyxFQUFFLEtBQUs7WUFDaEIsZ0JBQWdCLEVBQUUsS0FBSztZQUN2QixRQUFRLEVBQUUsS0FBSztZQUNmLFFBQVEsRUFBRSxLQUFLO1lBQ2YsVUFBVSxFQUFFLEtBQUs7WUFDakIsb0JBQW9CLEVBQUUsS0FBSztZQUMzQixlQUFlLEVBQUUsS0FBSztZQUN0QixrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsZ0JBQWdCO1lBQ2hCLHVCQUF1QjtZQUN2QixlQUFlLEVBQUUsS0FBSztZQUN0QixlQUFlLEVBQUUsS0FBSztZQUN0QixTQUFTLEVBQUUsQ0FBQztTQUNiO0tBQ0YsQ0FBQyxDQUFBO0lBQ0YsSUFBTSxhQUFhLEdBQUc7UUFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtJQUM5QixDQUFDLENBQ0E7SUFBQyxLQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUMzRCwyREFBMkQ7SUFDM0QsTUFBTSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxjQUFjLEdBQUc7UUFDeEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLO1FBQzVCLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSztLQUM3QixDQUFBO0lBQ0QsTUFBTSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ3hCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtTQUN0QjtJQUNILENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDekMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ3hCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtTQUN0QjtJQUNILENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDMUMsb0JBQW9CLENBQ2xCLE1BQU0sRUFDTixnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLEVBQUUsQ0FDcEQsQ0FBQTtJQUNELE9BQU87UUFDTCxHQUFHLEVBQUUsTUFBTTtRQUNYLG9CQUFvQixFQUFFLGFBQWE7S0FDcEMsQ0FBQTtBQUNILENBQUM7QUFDRCxTQUFTLHdCQUF3QixDQUFDLFFBQWEsRUFBRSxHQUFROztJQUN2RCxJQUFJLEVBQUUsRUFBRSxVQUFVLENBQUE7SUFDbEIsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDN0MsSUFBSSxZQUFZLEVBQUU7UUFDaEIsRUFBRSxHQUFHLFlBQVksQ0FBQyxFQUFFLENBQUE7UUFDcEIsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQzFDLEVBQUUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFBO1NBQ2pCO1FBQ0QsVUFBVSxHQUFHLE1BQUEsWUFBWSxDQUFDLFVBQVUsMENBQUUsVUFBVSxDQUFBO0tBQ2pEO0lBQ0QsT0FBTyxFQUFFLEVBQUUsSUFBQSxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUE7QUFDM0IsQ0FBQztBQUNELFNBQVMsZUFBZSxDQUFDLFNBQWM7SUFDckMsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzFCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2xFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3JFLGdDQUFnQztJQUNoQyxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7UUFDbEIsUUFBUSxHQUFHLENBQUMsQ0FBQTtLQUNiO0lBQ0QsSUFBSSxTQUFTLEtBQUssQ0FBQyxFQUFFO1FBQ25CLFNBQVMsR0FBRyxDQUFDLENBQUE7S0FDZDtJQUNELFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQTtJQUNwRSxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDLENBQUE7SUFDdkUsU0FBUyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxDQUFBO0lBQ3ZFLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQTtJQUNwRSxPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDO0FBQ0QsU0FBUywyQkFBMkIsQ0FBQyxTQUFjLEVBQUUsR0FBUTtJQUMzRCxJQUFJLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNuRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO1FBQy9DLGtCQUFrQjtZQUNoQixHQUFHLENBQUMsTUFBTSxDQUFDLDZCQUE2QixDQUFDLGtCQUFrQixDQUFDLENBQUE7S0FDL0Q7SUFDRCxPQUFPLGtCQUFrQixDQUFBO0FBQzNCLENBQUM7QUFDRCxTQUFTLG9CQUFvQixDQUFDLEtBQVU7SUFDdEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztRQUN4QyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUNuRCxDQUFDO0FBQ0QsU0FBUyxzQkFBc0IsQ0FBQyxVQUFlO0lBQzdDLE9BQU87UUFDTCxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN2QixTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN4QixRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztLQUN4QixDQUFBO0FBQ0gsQ0FBQztBQUNELFNBQVMsWUFBWSxDQUFDLDBCQUErQixFQUFFLFFBQWE7SUFDbEUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtBQUM3RCxDQUFDO0FBRUQsd0RBQXdEO0FBQ3hELE1BQU0sQ0FBQyxJQUFNLDhCQUE4QixHQUFHO0lBQzVDLE9BQU8sRUFBRSxDQUFDO0lBQ1YsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXO0lBQy9CLElBQUksRUFBRSxDQUFDLEVBQUUsNENBQTRDO0NBQ3RELENBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLFNBQVMsQ0FDL0IsZ0JBQXFCLEVBQ3JCLGtCQUF1QixFQUN2QixlQUFvQixFQUNwQixnQkFBcUIsRUFDckIsUUFBYSxFQUNiLFNBQWM7SUFFZCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7SUFDakIsSUFBSSxNQUFNLEdBQVEsRUFBRSxDQUFBO0lBQ2QsSUFBQSxLQUFnQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLEVBQXBFLEdBQUcsU0FBQSxFQUFFLG9CQUFvQiwwQkFBMkMsQ0FBQTtJQUM1RSxJQUFNLFVBQVUsR0FBRyxJQUFLLFVBQWtCLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDL0MsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7SUFDM0IsSUFBTSxtQkFBbUIsR0FBRyx3QkFBd0IsRUFBRSxDQUFBO0lBQ3RELElBQU0sZUFBZSxHQUFHLG9CQUFvQixFQUFFLENBQUE7SUFDOUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO0lBQ3JDLFNBQVMsd0JBQXdCLENBQUMsUUFBYTtRQUM3QyxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FDeEMsUUFBUSxFQUNSLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDMUIsQ0FBQTtRQUNELElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM3QixJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUMvRCxRQUFRLENBQUMsc0JBQXNCLENBQUM7Z0JBQzlCLEdBQUcsRUFBRSxZQUFZLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCO2dCQUMzRCxHQUFHLEVBQUUsWUFBWSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQjthQUM3RCxDQUFDLENBQUE7U0FDSDthQUFNO1lBQ0wsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUE7U0FDakM7SUFDSCxDQUFDO0lBQ0QsbUpBQW1KO0lBQ25KLFNBQVMsWUFBWSxDQUFDLEdBQVEsRUFBRSxrQkFBdUI7UUFDckQsSUFBTSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNwRSxPQUFPLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUNuQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDOUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDaEQsT0FBTTthQUNQO1lBQ0Qsd0JBQXdCLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ2hELENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUNELFNBQVMsd0JBQXdCO1FBQy9CLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtRQUM1RCxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUM3QyxPQUFPLG1CQUFtQixDQUFBO0lBQzVCLENBQUM7SUFDRCxTQUFTLG9CQUFvQjtRQUMzQixJQUFNLGVBQWUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUNwRCxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUE7UUFDekMsT0FBTyxlQUFlLENBQUE7SUFDeEIsQ0FBQztJQUNEOzs7T0FHRztJQUNILFNBQVMsb0JBQW9CLENBQUMsWUFBaUIsRUFBRSxRQUFhO1FBQzVELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FDWCxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUN0QixVQUFDLEtBQUs7WUFDSixPQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDeEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN4QyxDQUFDLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDO1FBRmxELENBRWtELENBQ3JELENBQUE7SUFDSCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7OztZQVlRO0lBQ1IsU0FBUyxhQUFhLENBQUMsRUFBdUM7WUFBckMsUUFBUSxjQUFBLEVBQUUsb0JBQW9CLEVBQXBCLFlBQVksbUJBQUcsS0FBSyxLQUFBO1FBQ3JELElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUE7UUFDdEMsSUFBTSxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDMUUsSUFDRSxVQUFVO1lBQ1YscUJBQXFCO1lBQ3JCLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUNqQztZQUNBLHFCQUFxQixDQUFDLElBQUksR0FBRyxLQUFLLENBQUE7U0FDbkM7UUFDRCxJQUFNLHFCQUFxQixHQUFHLHFCQUFxQjtZQUNqRCxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVO1lBQ25DLENBQUMsQ0FBQyxJQUFJLENBQUE7UUFDUixRQUFRLENBQUMsSUFBSTtZQUNYLENBQUMsVUFBVSxJQUFJLHFCQUFxQixDQUFDO2dCQUNyQyxDQUFDLHFCQUFxQjtnQkFDdEIsUUFBUSxDQUFDLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQyxFQUFFLENBQUE7SUFDNUMsQ0FBQztJQUNEOztZQUVRO0lBQ1IsU0FBUyxlQUFlLENBQUMsUUFBYTtRQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtZQUNsQixPQUFNO1NBQ1A7UUFDRCxJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUN4QixRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUN0QixVQUFDLEtBQUs7WUFDSixPQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDeEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN4QyxLQUFLLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FBQyxFQUFFO2dCQUN4QixDQUFDLEtBQUssQ0FBQyxJQUFJO1FBSFgsQ0FHVyxDQUNkLENBQUE7UUFDRCxJQUFJLFdBQVcsRUFBRTtZQUNmLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1NBQ3hCO0lBQ0gsQ0FBQztJQUVELElBQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFBO0lBQ25DLElBQU0sY0FBYyxHQUFHO1FBQ3JCLFdBQVcsWUFBQyxRQUFhO1lBQ3ZCLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDO2dCQUNoQyxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO2dCQUNyRCxJQUFBLEVBQUUsR0FBSyx3QkFBd0IsQ0FDckM7b0JBQ0UsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUk7b0JBQ2hDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHO2lCQUNoQyxFQUNELEdBQUcsQ0FDSixHQU5TLENBTVQ7Z0JBQ0QsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQ2hDLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELGlCQUFpQixZQUFDLFFBQWE7WUFDN0IsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFBO1lBQ3JCLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQTtZQUNwQixHQUFHLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxNQUFNLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3RFLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsVUFBQyxDQUFNO2dCQUMxQyxzRkFBc0Y7Z0JBQ3RGLG9GQUFvRjtnQkFDcEYsc0NBQXNDO2dCQUN0QyxJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7b0JBQ3BCLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQTtpQkFDM0I7Z0JBQ0QsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7Z0JBQ25DLElBQUksZ0JBQWdCLEdBQUcsYUFBYSxHQUFHLEdBQUcsRUFBRTtvQkFDMUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7d0JBQ3ZCLElBQUEsVUFBVSxHQUFLLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFdBQTlDLENBQThDO3dCQUNoRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7b0JBQ3RCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtpQkFDUjtnQkFDRCxhQUFhLEdBQUcsZ0JBQWdCLENBQUE7WUFDbEMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUM1QyxDQUFDO1FBQ0Qsb0JBQW9COztZQUNsQixNQUFBLEdBQUcsQ0FBQyxpQkFBaUIsMENBQUUsT0FBTyxFQUFFLENBQUE7UUFDbEMsQ0FBQztRQUNELFlBQVksWUFBQyxRQUFhO1lBQ3hCLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsVUFBQyxDQUFDO2dCQUN0QyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxlQUFlO1lBQ2IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ3hDLENBQUM7UUFDRCxhQUFhO1lBQ1gsR0FBRyxDQUFDLHVCQUF1QixHQUFHLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUM5RCxHQUFHLENBQUMsTUFBTSxDQUNYLENBQUE7WUFDRCxHQUFHLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLFVBQUMsQ0FBTTtnQkFDeEMsSUFBQSxVQUFVLEdBQUssd0JBQXdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsV0FBOUMsQ0FBOEM7Z0JBQ2hFLElBQUksVUFBVSxFQUFFO29CQUNkLENBQUM7b0JBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsVUFBVSxDQUFDLENBQUE7aUJBQ2pFO1lBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBQ25ELENBQUM7UUFDRCxnQkFBZ0I7O1lBQ2QsTUFBQSxHQUFHLENBQUMsdUJBQXVCLDBDQUFFLE9BQU8sRUFBRSxDQUFBO1FBQ3hDLENBQUM7UUFDRCx5QkFBeUIsWUFBQyxFQVV6QjtnQkFUQyxRQUFRLGNBQUEsRUFDUixJQUFJLFVBQUEsRUFDSixJQUFJLFVBQUEsRUFDSixFQUFFLFFBQUE7WUFPRixHQUFHLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7WUFDMUQsR0FBRyxDQUFDLHVCQUF1QixHQUFHLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUM5RCxHQUFHLENBQUMsTUFBTSxDQUNYLENBQUE7WUFDRCxHQUFHLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLFVBQUMsQ0FBTTtnQkFDeEMsSUFBQSxVQUFVLEdBQUssd0JBQXdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsV0FBOUMsQ0FBOEM7Z0JBQ2hFLElBQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FDOUMsQ0FBQyxDQUFDLFFBQVEsRUFDVixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQzFCLENBQUE7Z0JBQ0QsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQ3BELFNBQVMsRUFDVCxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQzFCLENBQUE7Z0JBQ0QsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtZQUM3RCxDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ3pDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsVUFBQyxDQUFNO2dCQUN4QyxJQUFBLFVBQVUsR0FBSyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFqRCxDQUFpRDtnQkFDbkUsSUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUM5QyxDQUFDLENBQUMsV0FBVyxFQUNiLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDMUIsQ0FBQTtnQkFDRCxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FDcEQsU0FBUyxFQUNULEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDMUIsQ0FBQTtnQkFDRCxJQUFNLFdBQVcsR0FBRyxRQUFRO29CQUMxQixDQUFDLENBQUM7d0JBQ0UsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUM5QixZQUFZLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQzVDO3dCQUNELFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDN0IsWUFBWSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUMxQztxQkFDRjtvQkFDSCxDQUFDLENBQUMsSUFBSSxDQUFBO2dCQUNSLElBQUksQ0FBQyxFQUFFLFdBQVcsYUFBQSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO1lBQ2xELENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDMUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FDeEMsRUFBRSxFQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQ3BDLENBQUE7UUFDSCxDQUFDO1FBQ0QsNEJBQTRCOztZQUMxQixHQUFHLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7WUFDekQsTUFBQSxHQUFHLENBQUMsdUJBQXVCLDBDQUFFLE9BQU8sRUFBRSxDQUFBO1FBQ3hDLENBQUM7UUFDRCx1QkFBdUIsWUFDckIsWUFBaUIsRUFDakIsWUFBaUIsRUFDakIsVUFBZTtZQUVmLEdBQUcsQ0FBQyxzQ0FBc0M7Z0JBQ3hDLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNoRCxHQUFHLENBQUMsc0NBQXNDLENBQUMsY0FBYyxDQUFDO2dCQUN4RCxZQUFZLEVBQUUsQ0FBQTtZQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ3pDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxjQUFjLENBQUM7Z0JBQ3hELFlBQVksRUFBRSxDQUFBO1lBQ2hCLENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUM5QixDQUFDO1FBQ0QsV0FBVyxZQUFDLFFBQWE7WUFDdkIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFDLENBQUM7Z0JBQ3BDLElBQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUE7Z0JBQzdELElBQU0sUUFBUSxHQUFHO29CQUNmLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJO29CQUNoQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsR0FBRztpQkFDaEMsQ0FBQTtnQkFDSyxJQUFBLEtBQXFCLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBMUQsRUFBRSxRQUFBLEVBQUUsVUFBVSxnQkFBNEMsQ0FBQTtnQkFDbEUsUUFBUSxDQUFDLENBQUMsRUFBRTtvQkFDVixTQUFTLEVBQUUsRUFBRTtvQkFDYixhQUFhLEVBQUUsVUFBVTtpQkFDMUIsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsY0FBYztZQUNaLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBQ0QsVUFBVSxFQUFFLEVBQWM7UUFDMUIsaUJBQWlCLFlBQUMsUUFBYTtZQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFNBQWM7Z0JBQ3JDLE1BQU0sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDaEMsQ0FBQyxDQUFDLENBQUE7WUFDRixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQTtZQUNwQixHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDdkQsQ0FBQztRQUNELGtCQUFrQixZQUFDLFFBQWE7WUFDOUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzFELENBQUM7UUFDRCxlQUFlLFlBQUMsUUFBYTtZQUE3QixpQkFTQztZQVJDLElBQU0sZUFBZSxHQUFHO2dCQUN0QixLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FDbEIsTUFBTSxDQUFDLFVBQVUsQ0FBQztvQkFDaEIsUUFBUSxFQUFFLENBQUE7Z0JBQ1osQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUNSLENBQUE7WUFDSCxDQUFDLENBQUE7WUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUE7UUFDNUQsQ0FBQztRQUNELGdCQUFnQixZQUFDLFFBQWE7WUFDNUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3hELENBQUM7UUFDRCxTQUFTLFlBQUMsTUFBVztZQUNuQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN2QixPQUFNO2FBQ1A7WUFDRCxJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBVTtnQkFDdEMsT0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDN0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUNSLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDUixHQUFHLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FDeEM7WUFKRCxDQUlDLENBQ0YsQ0FBQTtZQUNELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUMxRCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQ2IsQ0FBQTtnQkFDRCxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQTthQUNqQztpQkFBTTtnQkFDTCxJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFBO2dCQUNuRSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRTtvQkFDN0IsUUFBUSxFQUFFLEdBQUc7b0JBQ2IsVUFBVSxFQUFFLEdBQUc7aUJBQ2hCLENBQUMsQ0FBQTthQUNIO1FBQ0gsQ0FBQztRQUNELFlBQVksWUFBQyxPQUFZO1lBQ3ZCLElBQUksU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUE7WUFDL0IsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQ25CLE9BQU87aUJBQ0osTUFBTSxDQUFDLFVBQUMsTUFBVyxJQUFLLE9BQUEsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFwQixDQUFvQixDQUFDO2lCQUM3QyxHQUFHLENBQ0YsVUFBQyxNQUFXO2dCQUNWLE9BQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFVBQUMsVUFBVTtvQkFDN0MsT0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDN0IsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUNiLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FDeEM7Z0JBSkQsQ0FJQyxDQUNGO1lBTkQsQ0FNQyxFQUNILElBQUksQ0FDTCxDQUNKLENBQUE7WUFDRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QixJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUMxQixLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ3BFLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7aUJBQzVCO3FCQUFNO29CQUNMLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFBO29CQUM3RCxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFBO2lCQUMvQjthQUNGO1FBQ0gsQ0FBQztRQUNELGVBQWUsWUFBQyxNQUFXLEVBQUUsUUFBYztZQUFkLHlCQUFBLEVBQUEsY0FBYztZQUN6QyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ3JCLFFBQVEsVUFBQTtnQkFDUixXQUFXLEVBQUUsTUFBTTthQUNwQixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsV0FBVyxnQkFBSSxDQUFDO1FBQ2hCLGlCQUFpQixZQUFDLEVBSVo7Z0JBSlkscUJBSWQsRUFBRSxLQUFBLEVBSEosZ0JBQWMsRUFBZCxRQUFRLG1CQUFHLEdBQUcsS0FBQTtZQUlkLElBQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FDL0QsVUFBQyxJQUFTLElBQUssT0FBQSxJQUFJLENBQUMsRUFBRSxFQUFQLENBQU8sQ0FDdkIsQ0FBQTtZQUNELElBQU0sZUFBZSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FDOUMsVUFBQyxJQUFTLEVBQUUsSUFBUztnQkFDbkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFDLE9BQVksRUFBRSxRQUFhO29CQUNqRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUE7Z0JBQ2xELENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDUCxDQUFBO1lBQ0gsQ0FBQyxFQUNELEVBQUUsQ0FDSCxDQUFBO1lBQ0QsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDOUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO29CQUNyQixRQUFRLEVBQUUsUUFBUSxHQUFHLElBQUk7b0JBQ3pCLFdBQVcsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztvQkFDakUsV0FBVyxFQUFFLDhCQUE4QjtpQkFDNUMsQ0FBQyxDQUFBO2dCQUNGLE9BQU8sSUFBSSxDQUFBO2FBQ1o7WUFDRCxPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUM7UUFDRCwrQkFBK0IsWUFBQyxZQUFzQjtZQUNwRCxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQTtZQUN2QyxJQUFJLFNBQVMsR0FBRyxFQUFXLENBQUE7WUFFM0IsdURBQXVEO1lBQ3ZELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNqQyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDekMsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTt3QkFDNUIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBO3FCQUM5QztpQkFDRjthQUNGO1lBRUQsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUE7WUFFaEUsSUFDRSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FDMUIsY0FBYyxFQUNkLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVE7YUFDOUMsRUFDRDtnQkFDQSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUE7YUFDM0M7WUFFRCxzSkFBc0o7WUFDdEosaUVBQWlFO1lBQ2pFLElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUE7WUFDbEMsSUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQTtZQUNsQyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFDLG9FQUFvRTtZQUM3RyxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFFbkMsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FDL0MsRUFBRSxFQUNGLE1BQU0sR0FBRyxDQUFDLEVBQ1YsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQ3hCLENBQUEsQ0FBQyx5Q0FBeUM7WUFDM0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQSxDQUFDLGlDQUFpQztZQUVuRixPQUFPLFFBQVEsQ0FBQTtRQUNqQixDQUFDO1FBQ0QsU0FBUyxZQUFDLEVBTVQ7Z0JBTEMsR0FBRyxTQUFBLEVBQ0gsZ0JBQWMsRUFBZCxRQUFRLG1CQUFHLEdBQUcsS0FBQTtZQUtkLHlJQUF5STtZQUN6SSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDZixXQUFXLEVBQUUsSUFBSSxDQUFDLCtCQUErQixDQUFDLEdBQUcsQ0FBQztnQkFDdEQsV0FBVyxFQUFFLDhCQUE4QjtnQkFDM0MsUUFBUSxFQUFFLFFBQVEsR0FBRyxJQUFJLEVBQUUsb0JBQW9CO2FBQ2hELENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxjQUFjLFlBQ1osU0FBYyxFQUNkLElBR0M7WUFIRCxxQkFBQSxFQUFBO2dCQUNFLFFBQVEsRUFBRSxHQUFHO2dCQUNiLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBRUQsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNyQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLFdBQVcsRUFBRSwyQkFBMkIsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDO2dCQUN4RCxRQUFRO29CQUNOLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQzt3QkFDckIsUUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVO3dCQUN6QixXQUFXLEVBQUUsMkJBQTJCLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQztxQkFDekQsQ0FBQyxDQUFBO2dCQUNKLENBQUM7YUFDRixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsU0FBUztZQUNQLE9BQU8sTUFBTSxDQUFBO1FBQ2YsQ0FBQztRQUNELFlBQVksZ0JBQUksQ0FBQztRQUNqQixpQkFBaUIsWUFBQyxFQUFpQztnQkFBL0IsS0FBSyxXQUFBLEVBQUUsS0FBSyxXQUFBLEVBQUUsSUFBSSxVQUFBLEVBQUUsSUFBSSxVQUFBO1lBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDckIsUUFBUSxFQUFFLEdBQUc7Z0JBQ2IsV0FBVyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQzthQUNwRSxDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsY0FBYztZQUNaLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUE7WUFDN0QsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxVQUFDLEdBQUcsSUFBSyxPQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUE7UUFDeEUsQ0FBQztRQUNELFlBQVksWUFBQyxLQUFzQjtZQUNqQyxJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQTtZQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQzlCLElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDMUMsSUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLO2dCQUN4QyxLQUFLLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ3JDLE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQ3BDLEtBQUssQ0FBQyxTQUFTLEVBQ2YsS0FBSyxDQUFDLFFBQVEsRUFDZCxLQUFLLENBQUMsUUFBUSxDQUNmLENBQUE7WUFDSCxDQUFDLENBQUMsQ0FBQTtZQUNGLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDdkUsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQzdELElBQUksTUFBTSxDQUFDLHlCQUF5QixDQUFDO2dCQUNuQyxHQUFHLEVBQUUsS0FBSyxDQUFDLGlCQUFpQjtnQkFDNUIsU0FBUyxXQUFBO2FBQ1YsQ0FBQyxDQUNILENBQUE7WUFDRCxtSkFBbUo7WUFDbkosUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFlBQVksQ0FBQTtRQUNyQyxDQUFDO1FBQ0QsYUFBYSxZQUFDLFVBQWU7WUFDM0IsbUpBQW1KO1lBQ25KLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN4QixtSkFBbUo7Z0JBQ25KLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtnQkFDcEQsbUpBQW1KO2dCQUNuSixPQUFPLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQTthQUM1QjtRQUNILENBQUM7UUFDRCxpQkFBaUI7WUFDZixLQUFLLElBQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtnQkFDOUIsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNwQyxtSkFBbUo7b0JBQ25KLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtpQkFDbEQ7YUFDRjtZQUNELFFBQVEsR0FBRyxFQUFFLENBQUE7UUFDZixDQUFDO1FBQ0QsdUNBQXVDLFlBQUMsT0FBb0I7WUFDMUQsT0FBTyxPQUFPLENBQUMsZ0RBQWdELENBQzdELE9BQU8sQ0FBQyxPQUFPLENBQ2hCLENBQUE7UUFDSCxDQUFDO1FBQ0QsMkJBQTJCLFlBQUMsT0FBMEI7WUFDcEQsSUFBSSxRQUFhLENBQUE7WUFDakIsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRTtnQkFDL0MsUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUN2QyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssRUFDdEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUMxQixDQUFBO2FBQ0Y7WUFDRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQyxNQUFNO2dCQUN4QixJQUFNLDBCQUEwQixHQUM5QixPQUFPLENBQUMsbUNBQW1DLENBQUMsTUFBTSxDQUFDLENBQUE7Z0JBQ3JELElBQUksUUFBUSxJQUFJLFlBQVksQ0FBQywwQkFBMEIsRUFBRSxRQUFRLENBQUMsRUFBRTtvQkFDbEUsT0FBTyxTQUFTLENBQUE7aUJBQ2pCO2dCQUNELElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQywrQkFBK0IsQ0FDcEQsMEJBQTBCLEVBQzFCLEdBQUcsQ0FDSixDQUFBO2dCQUNELElBQUksTUFBTSxFQUFFO29CQUNWLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtpQkFDNUI7cUJBQU07b0JBQ0wsT0FBTyxTQUFTLENBQUE7aUJBQ2pCO1lBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0Q7Ozs7V0FJRztRQUNILGFBQWEsWUFBQyxXQUFnQjtZQUNwQixJQUFBLEdBQUcsR0FBVSxXQUFXLElBQXJCLEVBQUUsR0FBRyxHQUFLLFdBQVcsSUFBaEIsQ0FBZ0I7WUFDaEMsbURBQW1EO1lBQ25ELElBQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUMzQixJQUFNLE9BQU8sR0FBRztnQkFDZCxFQUFFLEVBQUUsR0FBRztnQkFDUCxLQUFLLEVBQUUsMkJBQTJCO2dCQUNsQyxLQUFLLEVBQUUsY0FBYyxDQUFDLFNBQVMsQ0FBQztvQkFDOUIsU0FBUyxFQUFFLGVBQWU7b0JBQzFCLElBQUksRUFBRSxJQUFJO2lCQUNYLENBQUM7Z0JBQ0YsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFBO1lBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBQ0Q7O1dBRUc7UUFDSCxnQkFBZ0IsWUFBQyxZQUFpQjtZQUNoQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUE7WUFDeEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBQ0Q7O1dBRUc7UUFDSCxZQUFZLFlBQUMsS0FBVTtZQUNyQixJQUFJLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQTtZQUM3RCx3Q0FBd0M7WUFDeEMsNEVBQTRFO1lBQzVFLEdBQUcsQ0FBQyxVQUFVLEdBQUc7Z0JBQ2YsbUJBQW1CLENBQUMsS0FBSyxDQUFDO2dCQUMxQixtQkFBbUIsQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLGVBQWU7Z0JBQ2YsS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFDWixLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUNaLGVBQWU7YUFDaEIsQ0FBQTtZQUNELE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQ3RCLFFBQVEsRUFBRTtvQkFDUixTQUFTLEVBQUUsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7d0JBQ3JDLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7b0JBQ2xFLENBQUMsRUFBRSxLQUFLLENBQUM7b0JBQ1QsS0FBSyxFQUFFLENBQUM7b0JBQ1IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsUUFBUSxFQUFFLFVBQVU7aUJBQ3JCO2FBQ0YsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNEOztXQUVHO1FBQ0gsWUFBWSxZQUFDLEtBQVU7WUFDckIsSUFBSSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUE7WUFDN0QsR0FBRyxDQUFDLFVBQVUsR0FBRztnQkFDZixtQkFBbUIsQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLG1CQUFtQixDQUFDLEtBQUssQ0FBQztnQkFDMUIsZUFBZTtnQkFDZixLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUNaLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQ1osZUFBZTthQUNoQixDQUFBO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBQ0Q7O1dBRUc7UUFDSCxlQUFlLFlBQUMsUUFBYTtZQUMzQixHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUM3QixHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQzNCLENBQUM7UUFDRDs7O29CQUdZO1FBQ1osZ0JBQWdCLFlBQUMsS0FBVSxFQUFFLE9BQVk7WUFDdkMsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDakQsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDMUQsV0FBVyxDQUFDLFNBQVMsRUFDckIsV0FBVyxDQUFDLFFBQVEsRUFDcEIsV0FBVyxDQUFDLFFBQVEsQ0FDckIsQ0FBQTtZQUNELElBQUksaUJBQWlCLEdBQ25CLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1lBQ3pFLElBQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztnQkFDM0MsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDZCxTQUFTLFdBQUE7YUFDVixDQUFDLENBQUE7WUFDRixZQUFZLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDOUQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUN4QixJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNO2dCQUN2QixXQUFXLEVBQUUsT0FBTztnQkFDcEIsU0FBUyxFQUFFLE9BQU87Z0JBQ2xCLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTthQUNuQyxDQUFDLENBQUE7WUFDRixZQUFZLENBQUMsc0JBQXNCLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDO2dCQUNyRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUs7Z0JBQ3hCLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU07Z0JBQ3ZCLFdBQVcsRUFBRSxPQUFPO2dCQUNwQixTQUFTLEVBQUUsT0FBTztnQkFDbEIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2FBQ25DLENBQUMsQ0FBQTtZQUNGLFlBQVksQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDO2dCQUM1RCxTQUFTLEVBQUUsUUFBUTtnQkFDbkIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTTtnQkFDdkIsV0FBVyxFQUFFLE9BQU87Z0JBQ3BCLFNBQVMsRUFBRSxPQUFPO2dCQUNsQixZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7YUFDbkMsQ0FBQyxDQUFBO1lBQ0YsUUFBUSxPQUFPLENBQUMsVUFBVSxFQUFFO2dCQUMxQixLQUFLLFVBQVU7b0JBQ2IsWUFBWSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFBO29CQUMvQyxNQUFLO2dCQUNQLEtBQUssV0FBVztvQkFDZCxZQUFZLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQTtvQkFDeEQsTUFBSztnQkFDUCxLQUFLLFlBQVk7b0JBQ2YsWUFBWSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFBO29CQUNqRCxNQUFLO2FBQ1I7WUFDRCxtSEFBbUg7WUFDbkgsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7Z0JBQ3RELElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFO29CQUNqRSxvQkFBb0I7aUJBQ3JCLENBQUMsQ0FBQTtnQkFDRixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFDLG1CQUF3QjtvQkFDNUMsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDOUQsaUJBQWlCOzRCQUNmLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FDL0MsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQ3ZCLENBQUE7d0JBQ0gsWUFBWSxDQUFDLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQTtxQkFDMUM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUE7YUFDSDtZQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUE7WUFDekIsT0FBTyxZQUFZLENBQUE7UUFDckIsQ0FBQztRQUNEOzs7b0JBR1k7UUFDWixRQUFRLFlBQUMsS0FBVSxFQUFFLE9BQVk7WUFDL0IsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDakQsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDMUQsV0FBVyxDQUFDLFNBQVMsRUFDckIsV0FBVyxDQUFDLFFBQVEsRUFDcEIsV0FBVyxDQUFDLFFBQVEsQ0FDckIsQ0FBQTtZQUNELElBQU0saUJBQWlCLEdBQ3JCLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1lBQ3pFLElBQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztnQkFDM0MsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDZCxTQUFTLFdBQUE7Z0JBQ1QsV0FBVyxhQUFBO2dCQUNYLGNBQWMsRUFBRSxPQUFPLENBQUMsaUJBQWlCO29CQUN2QyxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNO29CQUM5QixDQUFDLENBQUMsU0FBUztnQkFDYixnQkFBZ0IsRUFBRSxPQUFPLENBQUMsbUJBQW1CO29CQUMzQyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU07b0JBQ2hDLENBQUMsQ0FBQyxTQUFTO2dCQUNiLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTthQUNuQixDQUFDLENBQUE7WUFDRixZQUFZLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7Z0JBQ25ELFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSztnQkFDeEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO2dCQUNsQixZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7YUFDbkMsQ0FBQyxDQUFBO1lBQ0YsWUFBWSxDQUFDLGFBQWEsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO2dCQUNqRCxTQUFTLEVBQUUsUUFBUTtnQkFDbkIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO2dCQUNsQixZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7YUFDbkMsQ0FBQyxDQUFBO1lBQ0YsWUFBWSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVTtnQkFDckMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxhQUFhO2dCQUM1QixDQUFDLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQTtZQUNoQyxtSEFBbUg7WUFDbkgsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7Z0JBQ3RELElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFO29CQUNqRSxvQkFBb0I7aUJBQ3JCLENBQUMsQ0FBQTtnQkFDRixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFDLG1CQUF3QjtvQkFDNUMsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDOUQsWUFBWSxDQUFDLFFBQVE7NEJBQ25CLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FDL0MsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQ3ZCLENBQUE7cUJBQ0o7Z0JBQ0gsQ0FBQyxDQUFDLENBQUE7YUFDSDtZQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUE7WUFDekIsT0FBTyxZQUFZLENBQUE7UUFDckIsQ0FBQztRQUNEOzs7a0JBR1U7UUFDVixRQUFRLFlBQUMsS0FBVSxFQUFFLE9BQVk7WUFDL0IsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDakQsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDMUQsV0FBVyxDQUFDLFNBQVMsRUFDckIsV0FBVyxDQUFDLFFBQVEsRUFDcEIsV0FBVyxDQUFDLFFBQVEsQ0FDckIsQ0FBQTtZQUNELElBQU0saUJBQWlCLEdBQ3JCLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1lBQ3pFLG1DQUFtQztZQUNuQyxJQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDN0MsdUZBQXVGO1lBQ3ZGLElBQU0sU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUNsRSwrRkFBK0Y7WUFDL0YsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDekUsSUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQztnQkFDbkMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO2dCQUNsQixRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ2QsV0FBVyxFQUFFLE1BQU07Z0JBQ25CLEtBQUssRUFBRSxHQUFHO2dCQUNWLGVBQWUsRUFBRSxTQUFTO2dCQUMxQixzQkFBc0IsRUFBRSxnQkFBZ0I7Z0JBQ3hDLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7Z0JBQzdCLFlBQVksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7Z0JBQ2hDLFlBQVksRUFBRSxFQUFFO2dCQUNoQixLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0I7YUFDMUMsQ0FBQyxDQUFBO1lBQ0YsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUMzQixPQUFPLFFBQVEsQ0FBQTtRQUNqQixDQUFDO1FBQ0Q7OztrQkFHVTtRQUNWLE9BQU8sWUFBQyxJQUFTLEVBQUUsT0FBWTtZQUM3QixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUMsVUFBZTtnQkFDMUMsT0FBQSxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7WUFBbEMsQ0FBa0MsQ0FDbkMsQ0FBQTtZQUNELElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQUMsS0FBSztnQkFDekMsT0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDN0IsS0FBSyxDQUFDLFNBQVMsRUFDZixLQUFLLENBQUMsUUFBUSxFQUNkLEtBQUssQ0FBQyxRQUFRLENBQ2Y7WUFKRCxDQUlDLENBQ0YsQ0FBQTtZQUNELElBQU0sU0FBUyxHQUNiLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUN6RSxJQUFNLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUE7WUFDMUQsa0JBQWtCLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQzlELGlCQUFpQixFQUNqQjtnQkFDRSxLQUFLLEVBQUUsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDMUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSztnQkFDaEMsWUFBWSxFQUFFLENBQUM7YUFDaEIsQ0FDRixDQUFBO1lBQ0Qsa0JBQWtCLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQzVELGlCQUFpQixFQUNqQjtnQkFDRSxLQUFLLEVBQUUsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDMUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSztnQkFDaEMsWUFBWSxFQUFFLENBQUM7YUFDaEIsQ0FDRixDQUFBO1lBQ0QsSUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDO2dCQUN0QyxLQUFLLEVBQUUsQ0FBQztnQkFDUixRQUFRLEVBQUUsT0FBTyxDQUFDLFVBQVU7b0JBQzFCLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0I7b0JBQ3JDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0I7Z0JBQ3pDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDZCxTQUFTLEVBQUUsU0FBUzthQUNyQixDQUFDLENBQUE7WUFDRixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFO2dCQUM3QixJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUNsQyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFDekIsQ0FBQyxFQUNELFVBQVUsQ0FDWCxDQUFBO2dCQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQUMsbUJBQXdCO29CQUM1QyxJQUFNLFNBQVMsR0FDYixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQ3pELG1CQUFtQixDQUNwQixDQUFBO29CQUNILElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQzlELFFBQVEsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO3FCQUMvQjtnQkFDSCxDQUFDLENBQUMsQ0FBQTthQUNIO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUE7WUFDNUMsT0FBTyxrQkFBa0IsQ0FBQTtRQUMzQixDQUFDO1FBQ0Q7OztrQkFHVTtRQUNWLFVBQVUsWUFBQyxPQUFZLEVBQUUsT0FBWTtZQUNuQyxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsVUFBZTtnQkFDaEQsT0FBQSxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7WUFBbEMsQ0FBa0MsQ0FDbkMsQ0FBQTtZQUNELElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQUMsS0FBSztnQkFDNUMsT0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDN0IsS0FBSyxDQUFDLFNBQVMsRUFDZixLQUFLLENBQUMsUUFBUSxFQUNkLEtBQUssQ0FBQyxRQUFRLENBQ2Y7WUFKRCxDQUlDLENBQ0YsQ0FBQTtZQUNELElBQUksU0FBUyxHQUNYLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUN6RSxJQUFNLG9CQUFvQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUM1QyxPQUFPLEVBQUU7b0JBQ1AsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQzt3QkFDeEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSzt3QkFDekIsU0FBUyxFQUFFLEdBQUc7d0JBQ2QsU0FBUyxFQUFFLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUN0QyxhQUFhLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7d0JBQzlDLFVBQVUsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztxQkFDNUMsQ0FBQztvQkFDRixpQkFBaUIsRUFBRSxJQUFJO2lCQUN4QjtnQkFDRCxJQUFJLEVBQUUsSUFBSTtnQkFDVixRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ3BCLGdCQUFnQixFQUFFLEtBQUs7YUFDeEIsQ0FBQyxDQUFBO1lBQ0YsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztnQkFDMUMsT0FBTyxFQUFFO29CQUNQLFNBQVMsRUFBRSxTQUFTO29CQUNwQixRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUMsb0JBQW9CLENBQUM7d0JBQ3hDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7d0JBQ3pCLFNBQVMsRUFBRSxHQUFHO3dCQUNkLFNBQVMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDdEMsYUFBYSxFQUFFLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO3dCQUM5QyxVQUFVLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7cUJBQzVDLENBQUM7b0JBQ0YsaUJBQWlCLEVBQUUsSUFBSTtpQkFDeEI7Z0JBQ0QsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUNwQixnQkFBZ0IsRUFBRSxJQUFJO2FBQ3ZCLENBQUMsQ0FBQTtZQUNGLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7Z0JBQzdCLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQ2xDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUN6QixDQUFDLEVBQ0QsVUFBVSxDQUNYLENBQUE7Z0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBQyxtQkFBd0I7b0JBQzVDLFNBQVM7d0JBQ1AsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGlDQUFpQyxDQUN6RCxtQkFBbUIsQ0FDcEIsQ0FBQTtvQkFDSCxJQUFJLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUM5RCxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTt3QkFDMUQsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUE7cUJBQ3pEO2dCQUNILENBQUMsQ0FBQyxDQUFBO2FBQ0g7WUFDRCxPQUFPLENBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtRQUNuRCxDQUFDO1FBQ0Q7OztrQkFHVTtRQUNWLGFBQWEsWUFBQyxRQUFhLEVBQUUsT0FBWTtZQUF6QyxpQkFrQ0M7WUFqQ0MsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMzQixRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsYUFBYTtvQkFDN0IsS0FBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUE7Z0JBQzVDLENBQUMsQ0FBQyxDQUFBO2FBQ0g7WUFDRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLFNBQVMsRUFBRTtnQkFDN0MsUUFBUSxPQUFPLENBQUMsVUFBVSxFQUFFO29CQUMxQixLQUFLLFVBQVU7d0JBQ2IsUUFBUSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFBO3dCQUN2QyxNQUFLO29CQUNQLEtBQUssV0FBVzt3QkFDZCxRQUFRLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQTt3QkFDaEQsTUFBSztvQkFDUCxLQUFLLFlBQVk7d0JBQ2YsUUFBUSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFBO3dCQUN6QyxNQUFLO2lCQUNSO2dCQUNELElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEtBQUssWUFBWSxDQUFBO2dCQUN0RCxRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQ3RFO2lCQUFNLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzdELFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBYTtvQkFDeEMsUUFBUSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTt3QkFDOUQsS0FBSyxFQUFFLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDO3dCQUM5QyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsdUJBQXVCLENBQUM7d0JBQzNELFlBQVksRUFBRSxDQUFDO3FCQUNoQixDQUFDLENBQUE7Z0JBQ0osQ0FBQyxDQUFDLENBQUE7YUFDSDtpQkFBTSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDcEMsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFBO2FBQ25DO2lCQUFNO2dCQUNMLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFBO2FBQ3BDO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBQ0Q7OztvQkFHWTtRQUNaLGNBQWMsWUFBQyxRQUFhLEVBQUUsT0FBWTtZQUExQyxpQkFnQ0M7WUEvQkMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMzQixRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsYUFBYTtvQkFDN0IsS0FBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUE7Z0JBQzdDLENBQUMsQ0FBQyxDQUFBO2FBQ0g7WUFDRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLFNBQVMsRUFBRTtnQkFDN0MsUUFBUSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVTtvQkFDakMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhO29CQUN4QixDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQTtnQkFDNUIsUUFBUSxDQUFDLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQ3hDLENBQUMsRUFDRCxDQUFDLEVBQ0QsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDNUIsQ0FBQTthQUNGO2lCQUFNLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsS0FBSyxFQUFFO2dCQUNoRCxRQUFRLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUE7Z0JBQ3hDLGFBQWEsQ0FBQztvQkFDWixRQUFRLFVBQUE7aUJBQ1QsQ0FBQyxDQUFBO2FBQ0g7aUJBQU0sSUFBSSxRQUFRLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRTtnQkFDN0QsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFhO29CQUN4QyxRQUFRLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVO3dCQUNwQyxDQUFDLENBQUMsUUFBUSxDQUFDLGdCQUFnQjt3QkFDM0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQTtnQkFDakMsQ0FBQyxDQUFDLENBQUE7YUFDSDtpQkFBTSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDcEMsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFBO2FBQ25DO2lCQUFNO2dCQUNMLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFBO2FBQ3BDO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBQ0Q7O21CQUVXO1FBQ1gsWUFBWSxZQUFDLFFBQWE7WUFDeEIsSUFDRSxRQUFRLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxTQUFTO2dCQUN6QyxRQUFRLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQ3JDO2dCQUNBLFFBQVEsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFBO2FBQ3RCO2lCQUFNLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzdELFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBYTtvQkFDeEMsUUFBUSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUE7Z0JBQ3ZCLENBQUMsQ0FBQyxDQUFBO2FBQ0g7UUFDSCxDQUFDO1FBQ0Q7O21CQUVXO1FBQ1gsWUFBWSxZQUFDLFFBQWE7WUFDeEIsSUFBSSxRQUFRLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUU7Z0JBQzdDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO2FBQ3JCO2lCQUFNLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsS0FBSyxFQUFFO2dCQUNoRCxhQUFhLENBQUM7b0JBQ1osUUFBUSxVQUFBO29CQUNSLFlBQVksRUFBRSxJQUFJO2lCQUNuQixDQUFDLENBQUE7YUFDSDtpQkFBTSxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLGtCQUFrQixFQUFFO2dCQUM3RCxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQWE7b0JBQ3hDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO2dCQUN0QixDQUFDLENBQUMsQ0FBQTthQUNIO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBQ0QsY0FBYyxZQUFDLFFBQWE7WUFDMUIsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ3BDLGVBQWUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDaEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ3JDLHFFQUFxRTtZQUNyRSxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDMUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7YUFDOUI7WUFDRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDLEtBQUssRUFBRTtnQkFDekMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDOUIsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2FBQzFCO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBQ0QsYUFBYTtZQUNYLDJGQUEyRjtZQUMzRixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztnQkFDbkIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQ2pCLENBQUMsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxHQUFHLEVBQUUsQ0FBQTtZQUNYLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3BCLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUE7YUFDMUI7UUFDSCxDQUFDO1FBQ0QsTUFBTTtZQUNKLE9BQU8sR0FBRyxDQUFBO1FBQ1osQ0FBQztRQUNELE1BQU07WUFDSixJQUFNLDBCQUEwQixHQUM5QixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQy9DLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FDMUIsQ0FBQTtZQUVILElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDN0MsMEJBQTBCLENBQzNCLENBQUE7WUFFRCxJQUFNLGlCQUFpQixHQUNyQiwwQkFBMEIsQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFBO1lBRW5ELElBQU0sVUFBVSxHQUFHLGlCQUFpQixHQUFHLENBQUMsQ0FBQSxDQUFDLG9DQUFvQztZQUU3RSxJQUFNLGFBQWEsR0FBRyxpQkFBaUIsR0FBRyx5QkFBeUIsQ0FBQTtZQUVuRSxzRkFBc0Y7WUFDdEYsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUE7UUFDOUQsQ0FBQztRQUNELE9BQU87WUFDTCxJQUFNLDBCQUEwQixHQUM5QixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQy9DLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FDMUIsQ0FBQTtZQUVILElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDN0MsMEJBQTBCLENBQzNCLENBQUE7WUFFRCxJQUFNLGlCQUFpQixHQUNyQiwwQkFBMEIsQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFBO1lBQ25ELEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBQzdDLENBQUM7UUFDRCxPQUFPO1lBQ0wsQ0FBQztZQUFDLEtBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLENBQUE7WUFDbkUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2YsQ0FBQztLQUNGLENBQUE7SUFDRCxPQUFPLGNBQWMsQ0FBQTtBQUN2QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi91dGlsaXR5J1xuaW1wb3J0IERyYXdpbmdVdGlsaXR5IGZyb20gJy4uL0RyYXdpbmdVdGlsaXR5J1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uLy4uL2pzL3dyZXFyJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnY2VzaS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgQ2VzaXVtIGZyb20gJ2Nlc2l1bS9CdWlsZC9DZXNpdW0vQ2VzaXVtJ1xuaW1wb3J0IERyYXdIZWxwZXIgZnJvbSAnLi4vLi4vLi4vLi4vbGliL2Nlc2l1bS1kcmF3aGVscGVyL0RyYXdIZWxwZXInXG5pbXBvcnQge1xuICBDZXNpdW1JbWFnZXJ5UHJvdmlkZXJUeXBlcyxcbiAgQ2VzaXVtTGF5ZXJzLFxufSBmcm9tICcuLi8uLi8uLi8uLi9qcy9jb250cm9sbGVycy9jZXNpdW0ubGF5ZXJzJ1xuaW1wb3J0IHsgRHJhd2luZyB9IGZyb20gJy4uLy4uLy4uL3NpbmdsZXRvbnMvZHJhd2luZydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyBDbHVzdGVyVHlwZSB9IGZyb20gJy4uL3JlYWN0L2dlb21ldHJpZXMnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuY29uc3QgZGVmYXVsdENvbG9yID0gJyMzYzZkZDUnXG5jb25zdCBleWVPZmZzZXQgPSBuZXcgQ2VzaXVtLkNhcnRlc2lhbjMoMCwgMCwgMClcbmNvbnN0IHBpeGVsT2Zmc2V0ID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDAuMCwgMClcbmNvbnN0IHJ1bGVyQ29sb3IgPSBuZXcgQ2VzaXVtLkNvbG9yKDAuMzEsIDAuNDMsIDAuNTIpXG5jb25zdCBydWxlclBvaW50Q29sb3IgPSAnIzUwNmY4NSdcbmNvbnN0IHJ1bGVyTGluZUhlaWdodCA9IDBcbkNlc2l1bS5CaW5nTWFwc0FwaS5kZWZhdWx0S2V5ID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEJpbmdLZXkoKSB8fCAwXG5jb25zdCBpbWFnZXJ5UHJvdmlkZXJUeXBlcyA9IENlc2l1bUltYWdlcnlQcm92aWRlclR5cGVzXG5mdW5jdGlvbiBzZXR1cFRlcnJhaW5Qcm92aWRlcih2aWV3ZXI6IGFueSwgdGVycmFpblByb3ZpZGVyOiBhbnkpIHtcbiAgaWYgKHRlcnJhaW5Qcm92aWRlciA9PSBudWxsIHx8IHRlcnJhaW5Qcm92aWRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS5pbmZvKGBVbmtub3duIHRlcnJhaW4gcHJvdmlkZXIgY29uZmlndXJhdGlvbi5cbiAgICAgICAgICAgICAgRGVmYXVsdCBDZXNpdW0gdGVycmFpbiBwcm92aWRlciB3aWxsIGJlIHVzZWQuYClcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCB7IHR5cGUsIC4uLnRlcnJhaW5Db25maWcgfSA9IHRlcnJhaW5Qcm92aWRlclxuICBjb25zdCBUZXJyYWluUHJvdmlkZXIgPSBpbWFnZXJ5UHJvdmlkZXJUeXBlc1t0eXBlXVxuICBpZiAoVGVycmFpblByb3ZpZGVyID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zb2xlLndhcm4oYFxuICAgICAgICAgICAgVW5rbm93biB0ZXJyYWluIHByb3ZpZGVyIHR5cGU6ICR7dHlwZX0uXG4gICAgICAgICAgICBEZWZhdWx0IENlc2l1bSB0ZXJyYWluIHByb3ZpZGVyIHdpbGwgYmUgdXNlZC5cbiAgICAgICAgYClcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBkZWZhdWx0Q2VzaXVtVGVycmFpblByb3ZpZGVyID0gdmlld2VyLnNjZW5lLnRlcnJhaW5Qcm92aWRlclxuICBjb25zdCBjdXN0b21UZXJyYWluUHJvdmlkZXIgPSBuZXcgVGVycmFpblByb3ZpZGVyKHRlcnJhaW5Db25maWcpXG4gIGN1c3RvbVRlcnJhaW5Qcm92aWRlci5lcnJvckV2ZW50LmFkZEV2ZW50TGlzdGVuZXIoKCkgPT4ge1xuICAgIGNvbnNvbGUud2FybihgXG4gICAgICAgICAgICBJc3N1ZSB1c2luZyB0ZXJyYWluIHByb3ZpZGVyOiAke0pTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgLi4udGVycmFpbkNvbmZpZyxcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgRmFsbGluZyBiYWNrIHRvIGRlZmF1bHQgQ2VzaXVtIHRlcnJhaW4gcHJvdmlkZXIuXG4gICAgICAgIGApXG4gICAgdmlld2VyLnNjZW5lLnRlcnJhaW5Qcm92aWRlciA9IGRlZmF1bHRDZXNpdW1UZXJyYWluUHJvdmlkZXJcbiAgfSlcbiAgdmlld2VyLnNjZW5lLnRlcnJhaW5Qcm92aWRlciA9IGN1c3RvbVRlcnJhaW5Qcm92aWRlclxufVxuZnVuY3Rpb24gY3JlYXRlTWFwKGluc2VydGlvbkVsZW1lbnQ6IGFueSwgbWFwTGF5ZXJzOiBhbnkpIHtcbiAgY29uc3QgbGF5ZXJDb2xsZWN0aW9uQ29udHJvbGxlciA9IG5ldyBDZXNpdW1MYXllcnMoe1xuICAgIGNvbGxlY3Rpb246IG1hcExheWVycyxcbiAgfSlcbiAgY29uc3Qgdmlld2VyID0gbGF5ZXJDb2xsZWN0aW9uQ29udHJvbGxlci5tYWtlTWFwKHtcbiAgICBlbGVtZW50OiBpbnNlcnRpb25FbGVtZW50LFxuICAgIGNlc2l1bU9wdGlvbnM6IHtcbiAgICAgIHNjZW5lTW9kZTogQ2VzaXVtLlNjZW5lTW9kZS5TQ0VORTNELFxuICAgICAgY3JlZGl0Q29udGFpbmVyOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgIGFuaW1hdGlvbjogZmFsc2UsXG4gICAgICBmdWxsc2NyZWVuQnV0dG9uOiBmYWxzZSxcbiAgICAgIHRpbWVsaW5lOiBmYWxzZSxcbiAgICAgIGdlb2NvZGVyOiBmYWxzZSxcbiAgICAgIGhvbWVCdXR0b246IGZhbHNlLFxuICAgICAgbmF2aWdhdGlvbkhlbHBCdXR0b246IGZhbHNlLFxuICAgICAgc2NlbmVNb2RlUGlja2VyOiBmYWxzZSxcbiAgICAgIHNlbGVjdGlvbkluZGljYXRvcjogZmFsc2UsXG4gICAgICBpbmZvQm94OiBmYWxzZSxcbiAgICAgIC8vc2t5Qm94OiBmYWxzZSxcbiAgICAgIC8vc2t5QXRtb3NwaGVyZTogZmFsc2UsXG4gICAgICBiYXNlTGF5ZXJQaWNrZXI6IGZhbHNlLFxuICAgICAgaW1hZ2VyeVByb3ZpZGVyOiBmYWxzZSxcbiAgICAgIG1hcE1vZGUyRDogMCxcbiAgICB9LFxuICB9KVxuICBjb25zdCByZXF1ZXN0UmVuZGVyID0gKCkgPT4ge1xuICAgIHZpZXdlci5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgfVxuICA7KHdyZXFyIGFzIGFueSkudmVudC5vbignbWFwOnJlcXVlc3RSZW5kZXInLCByZXF1ZXN0UmVuZGVyKVxuICAvLyBkaXNhYmxlIHJpZ2h0IGNsaWNrIGRyYWcgdG8gem9vbSAoY29udGV4dCBtZW51IGluc3RlYWQpO1xuICB2aWV3ZXIuc2NlbmUuc2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyLnpvb21FdmVudFR5cGVzID0gW1xuICAgIENlc2l1bS5DYW1lcmFFdmVudFR5cGUuV0hFRUwsXG4gICAgQ2VzaXVtLkNhbWVyYUV2ZW50VHlwZS5QSU5DSCxcbiAgXVxuICB2aWV3ZXIuc2NyZWVuU3BhY2VFdmVudEhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKCkgPT4ge1xuICAgIGlmICghRHJhd2luZy5pc0RyYXdpbmcoKSkge1xuICAgICAgJCgnYm9keScpLm1vdXNlZG93bigpXG4gICAgfVxuICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9ET1dOKVxuICB2aWV3ZXIuc2NyZWVuU3BhY2VFdmVudEhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKCkgPT4ge1xuICAgIGlmICghRHJhd2luZy5pc0RyYXdpbmcoKSkge1xuICAgICAgJCgnYm9keScpLm1vdXNlZG93bigpXG4gICAgfVxuICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuUklHSFRfRE9XTilcbiAgc2V0dXBUZXJyYWluUHJvdmlkZXIoXG4gICAgdmlld2VyLFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRUZXJyYWluUHJvdmlkZXIoKVxuICApXG4gIHJldHVybiB7XG4gICAgbWFwOiB2aWV3ZXIsXG4gICAgcmVxdWVzdFJlbmRlckhhbmRsZXI6IHJlcXVlc3RSZW5kZXIsXG4gIH1cbn1cbmZ1bmN0aW9uIGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihwb3NpdGlvbjogYW55LCBtYXA6IGFueSkge1xuICBsZXQgaWQsIGxvY2F0aW9uSWRcbiAgY29uc3QgcGlja2VkT2JqZWN0ID0gbWFwLnNjZW5lLnBpY2socG9zaXRpb24pXG4gIGlmIChwaWNrZWRPYmplY3QpIHtcbiAgICBpZCA9IHBpY2tlZE9iamVjdC5pZFxuICAgIGlmIChpZCAmJiBpZC5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkVudGl0eSkge1xuICAgICAgaWQgPSBpZC5yZXN1bHRJZFxuICAgIH1cbiAgICBsb2NhdGlvbklkID0gcGlja2VkT2JqZWN0LmNvbGxlY3Rpb24/LmxvY2F0aW9uSWRcbiAgfVxuICByZXR1cm4geyBpZCwgbG9jYXRpb25JZCB9XG59XG5mdW5jdGlvbiBleHBhbmRSZWN0YW5nbGUocmVjdGFuZ2xlOiBhbnkpIHtcbiAgY29uc3Qgc2NhbGluZ0ZhY3RvciA9IDAuMDVcbiAgbGV0IHdpZHRoR2FwID0gTWF0aC5hYnMocmVjdGFuZ2xlLmVhc3QpIC0gTWF0aC5hYnMocmVjdGFuZ2xlLndlc3QpXG4gIGxldCBoZWlnaHRHYXAgPSBNYXRoLmFicyhyZWN0YW5nbGUubm9ydGgpIC0gTWF0aC5hYnMocmVjdGFuZ2xlLnNvdXRoKVxuICAvL2Vuc3VyZSByZWN0YW5nbGUgaGFzIHNvbWUgc2l6ZVxuICBpZiAod2lkdGhHYXAgPT09IDApIHtcbiAgICB3aWR0aEdhcCA9IDFcbiAgfVxuICBpZiAoaGVpZ2h0R2FwID09PSAwKSB7XG4gICAgaGVpZ2h0R2FwID0gMVxuICB9XG4gIHJlY3RhbmdsZS5lYXN0ID0gcmVjdGFuZ2xlLmVhc3QgKyBNYXRoLmFicyhzY2FsaW5nRmFjdG9yICogd2lkdGhHYXApXG4gIHJlY3RhbmdsZS5ub3J0aCA9IHJlY3RhbmdsZS5ub3J0aCArIE1hdGguYWJzKHNjYWxpbmdGYWN0b3IgKiBoZWlnaHRHYXApXG4gIHJlY3RhbmdsZS5zb3V0aCA9IHJlY3RhbmdsZS5zb3V0aCAtIE1hdGguYWJzKHNjYWxpbmdGYWN0b3IgKiBoZWlnaHRHYXApXG4gIHJlY3RhbmdsZS53ZXN0ID0gcmVjdGFuZ2xlLndlc3QgLSBNYXRoLmFicyhzY2FsaW5nRmFjdG9yICogd2lkdGhHYXApXG4gIHJldHVybiByZWN0YW5nbGVcbn1cbmZ1bmN0aW9uIGdldERlc3RpbmF0aW9uRm9yVmlzaWJsZVBhbihyZWN0YW5nbGU6IGFueSwgbWFwOiBhbnkpIHtcbiAgbGV0IGRlc3RpbmF0aW9uRm9yWm9vbSA9IGV4cGFuZFJlY3RhbmdsZShyZWN0YW5nbGUpXG4gIGlmIChtYXAuc2NlbmUubW9kZSA9PT0gQ2VzaXVtLlNjZW5lTW9kZS5TQ0VORTNEKSB7XG4gICAgZGVzdGluYXRpb25Gb3Jab29tID1cbiAgICAgIG1hcC5jYW1lcmEuZ2V0UmVjdGFuZ2xlQ2FtZXJhQ29vcmRpbmF0ZXMoZGVzdGluYXRpb25Gb3Jab29tKVxuICB9XG4gIHJldHVybiBkZXN0aW5hdGlvbkZvclpvb21cbn1cbmZ1bmN0aW9uIGRldGVybWluZUNlc2l1bUNvbG9yKGNvbG9yOiBhbnkpIHtcbiAgcmV0dXJuICFfLmlzVW5kZWZpbmVkKGNvbG9yKVxuICAgID8gQ2VzaXVtLkNvbG9yLmZyb21Dc3NDb2xvclN0cmluZyhjb2xvcilcbiAgICA6IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoZGVmYXVsdENvbG9yKVxufVxuZnVuY3Rpb24gY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlOiBhbnkpIHtcbiAgcmV0dXJuIHtcbiAgICBsYXRpdHVkZTogY29vcmRpbmF0ZVsxXSxcbiAgICBsb25naXR1ZGU6IGNvb3JkaW5hdGVbMF0sXG4gICAgYWx0aXR1ZGU6IGNvb3JkaW5hdGVbMl0sXG4gIH1cbn1cbmZ1bmN0aW9uIGlzTm90VmlzaWJsZShjYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeTogYW55LCBvY2NsdWRlcjogYW55KSB7XG4gIHJldHVybiAhb2NjbHVkZXIuaXNQb2ludFZpc2libGUoY2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnkpXG59XG5cbi8vIGh0dHBzOi8vY2VzaXVtLmNvbS9sZWFybi9jZXNpdW1qcy9yZWYtZG9jL0NhbWVyYS5odG1sXG5leHBvcnQgY29uc3QgTG9va2luZ1N0cmFpZ2h0RG93bk9yaWVudGF0aW9uID0ge1xuICBoZWFkaW5nOiAwLCAvLyBOb3J0aCBpcyB1cCAtIGxpa2UgY29tcGFzcyBkaXJlY3Rpb25cbiAgcGl0Y2g6IC1DZXNpdW0uTWF0aC5QSV9PVkVSX1RXTywgLy8gTG9va2luZyBzdHJhaWdodCBkb3duIC0gbGlrZSBhIGxldmVsIGZyb20gdXAgdG8gZG93blxuICByb2xsOiAwLCAvLyBObyByb2xsIC0gbGlrZSBhIGxldmVsIGZyb20gbGVmdCB0byByaWdodFxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDZXNpdW1NYXAoXG4gIGluc2VydGlvbkVsZW1lbnQ6IGFueSxcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnksXG4gIF9ub3RpZmljYXRpb25FbDogYW55LFxuICBjb21wb25lbnRFbGVtZW50OiBhbnksXG4gIG1hcE1vZGVsOiBhbnksXG4gIG1hcExheWVyczogYW55XG4pIHtcbiAgbGV0IG92ZXJsYXlzID0ge31cbiAgbGV0IHNoYXBlczogYW55ID0gW11cbiAgY29uc3QgeyBtYXAsIHJlcXVlc3RSZW5kZXJIYW5kbGVyIH0gPSBjcmVhdGVNYXAoaW5zZXJ0aW9uRWxlbWVudCwgbWFwTGF5ZXJzKVxuICBjb25zdCBkcmF3SGVscGVyID0gbmV3IChEcmF3SGVscGVyIGFzIGFueSkobWFwKVxuICBtYXAuZHJhd0hlbHBlciA9IGRyYXdIZWxwZXJcbiAgY29uc3QgYmlsbGJvYXJkQ29sbGVjdGlvbiA9IHNldHVwQmlsbGJvYXJkQ29sbGVjdGlvbigpXG4gIGNvbnN0IGxhYmVsQ29sbGVjdGlvbiA9IHNldHVwTGFiZWxDb2xsZWN0aW9uKClcbiAgc2V0dXBUb29sdGlwKG1hcCwgc2VsZWN0aW9uSW50ZXJmYWNlKVxuICBmdW5jdGlvbiB1cGRhdGVDb29yZGluYXRlc1Rvb2x0aXAocG9zaXRpb246IGFueSkge1xuICAgIGNvbnN0IGNhcnRlc2lhbiA9IG1hcC5jYW1lcmEucGlja0VsbGlwc29pZChcbiAgICAgIHBvc2l0aW9uLFxuICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZFxuICAgIClcbiAgICBpZiAoQ2VzaXVtLmRlZmluZWQoY2FydGVzaWFuKSkge1xuICAgICAgbGV0IGNhcnRvZ3JhcGhpYyA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbUNhcnRlc2lhbihjYXJ0ZXNpYW4pXG4gICAgICBtYXBNb2RlbC51cGRhdGVNb3VzZUNvb3JkaW5hdGVzKHtcbiAgICAgICAgbGF0OiBjYXJ0b2dyYXBoaWMubGF0aXR1ZGUgKiBDZXNpdW0uTWF0aC5ERUdSRUVTX1BFUl9SQURJQU4sXG4gICAgICAgIGxvbjogY2FydG9ncmFwaGljLmxvbmdpdHVkZSAqIENlc2l1bS5NYXRoLkRFR1JFRVNfUEVSX1JBRElBTixcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcE1vZGVsLmNsZWFyTW91c2VDb29yZGluYXRlcygpXG4gICAgfVxuICB9XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg2MTMzKSBGSVhNRTogJ3NlbGVjdGlvbkludGVyZmFjZScgaXMgZGVjbGFyZWQgYnV0IGl0cyB2YWx1ZSBpcyAuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICBmdW5jdGlvbiBzZXR1cFRvb2x0aXAobWFwOiBhbnksIHNlbGVjdGlvbkludGVyZmFjZTogYW55KSB7XG4gICAgY29uc3QgaGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIobWFwLnNjZW5lLmNhbnZhcylcbiAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICAkKGNvbXBvbmVudEVsZW1lbnQpLnJlbW92ZUNsYXNzKCdoYXMtZmVhdHVyZScpXG4gICAgICBpZiAobWFwLnNjZW5lLm1vZGUgPT09IENlc2l1bS5TY2VuZU1vZGUuTU9SUEhJTkcpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB1cGRhdGVDb29yZGluYXRlc1Rvb2x0aXAobW92ZW1lbnQuZW5kUG9zaXRpb24pXG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLk1PVVNFX01PVkUpXG4gIH1cbiAgZnVuY3Rpb24gc2V0dXBCaWxsYm9hcmRDb2xsZWN0aW9uKCkge1xuICAgIGNvbnN0IGJpbGxib2FyZENvbGxlY3Rpb24gPSBuZXcgQ2VzaXVtLkJpbGxib2FyZENvbGxlY3Rpb24oKVxuICAgIG1hcC5zY2VuZS5wcmltaXRpdmVzLmFkZChiaWxsYm9hcmRDb2xsZWN0aW9uKVxuICAgIHJldHVybiBiaWxsYm9hcmRDb2xsZWN0aW9uXG4gIH1cbiAgZnVuY3Rpb24gc2V0dXBMYWJlbENvbGxlY3Rpb24oKSB7XG4gICAgY29uc3QgbGFiZWxDb2xsZWN0aW9uID0gbmV3IENlc2l1bS5MYWJlbENvbGxlY3Rpb24oKVxuICAgIG1hcC5zY2VuZS5wcmltaXRpdmVzLmFkZChsYWJlbENvbGxlY3Rpb24pXG4gICAgcmV0dXJuIGxhYmVsQ29sbGVjdGlvblxuICB9XG4gIC8qXG4gICAqIFJldHVybnMgYSB2aXNpYmxlIGxhYmVsIHRoYXQgaXMgaW4gdGhlIHNhbWUgbG9jYXRpb24gYXMgdGhlIHByb3ZpZGVkIGxhYmVsIChnZW9tZXRyeUluc3RhbmNlKSBpZiBvbmUgZXhpc3RzLlxuICAgKiBJZiBmaW5kU2VsZWN0ZWQgaXMgdHJ1ZSwgdGhlIGZ1bmN0aW9uIHdpbGwgYWxzbyBjaGVjayBmb3IgaGlkZGVuIGxhYmVscyBpbiB0aGUgc2FtZSBsb2NhdGlvbiBidXQgYXJlIHNlbGVjdGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gZmluZE92ZXJsYXBwaW5nTGFiZWwoZmluZFNlbGVjdGVkOiBhbnksIGdlb21ldHJ5OiBhbnkpIHtcbiAgICByZXR1cm4gXy5maW5kKFxuICAgICAgbWFwTW9kZWwuZ2V0KCdsYWJlbHMnKSxcbiAgICAgIChsYWJlbCkgPT5cbiAgICAgICAgbGFiZWwucG9zaXRpb24ueCA9PT0gZ2VvbWV0cnkucG9zaXRpb24ueCAmJlxuICAgICAgICBsYWJlbC5wb3NpdGlvbi55ID09PSBnZW9tZXRyeS5wb3NpdGlvbi55ICYmXG4gICAgICAgICgoZmluZFNlbGVjdGVkICYmIGxhYmVsLmlzU2VsZWN0ZWQpIHx8IGxhYmVsLnNob3cpXG4gICAgKVxuICB9XG4gIC8qXG4gICAgICAgIE9ubHkgc2hvd3Mgb25lIGxhYmVsIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBsYWJlbHMgaW4gdGhlIHNhbWUgbG9jYXRpb24uXG5cbiAgICAgICAgU2hvdyB0aGUgbGFiZWwgaW4gdGhlIGZvbGxvd2luZyBpbXBvcnRhbmNlOlxuICAgICAgICAgIC0gaXQgaXMgc2VsZWN0ZWQgYW5kIHRoZSBleGlzdGluZyBsYWJlbCBpcyBub3RcbiAgICAgICAgICAtIHRoZXJlIGlzIG5vIG90aGVyIGxhYmVsIGRpc3BsYXllZCBhdCB0aGUgc2FtZSBsb2NhdGlvblxuICAgICAgICAgIC0gaXQgaXMgdGhlIGxhYmVsIHRoYXQgd2FzIGZvdW5kIGJ5IGZpbmRPdmVybGFwcGluZ0xhYmVsXG5cbiAgICAgICAgQXJndW1lbnRzIGFyZTpcbiAgICAgICAgICAtIHRoZSBsYWJlbCB0byBzaG93L2hpZGVcbiAgICAgICAgICAtIGlmIHRoZSBsYWJlbCBpcyBzZWxlY3RlZFxuICAgICAgICAgIC0gaWYgdGhlIHNlYXJjaCBmb3Igb3ZlcmxhcHBpbmcgbGFiZWwgc2hvdWxkIGluY2x1ZGUgaGlkZGVuIHNlbGVjdGVkIGxhYmVsc1xuICAgICAgICAqL1xuICBmdW5jdGlvbiBzaG93SGlkZUxhYmVsKHsgZ2VvbWV0cnksIGZpbmRTZWxlY3RlZCA9IGZhbHNlIH06IGFueSkge1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBnZW9tZXRyeS5pc1NlbGVjdGVkXG4gICAgY29uc3QgbGFiZWxXaXRoU2FtZVBvc2l0aW9uID0gZmluZE92ZXJsYXBwaW5nTGFiZWwoZmluZFNlbGVjdGVkLCBnZW9tZXRyeSlcbiAgICBpZiAoXG4gICAgICBpc1NlbGVjdGVkICYmXG4gICAgICBsYWJlbFdpdGhTYW1lUG9zaXRpb24gJiZcbiAgICAgICFsYWJlbFdpdGhTYW1lUG9zaXRpb24uaXNTZWxlY3RlZFxuICAgICkge1xuICAgICAgbGFiZWxXaXRoU2FtZVBvc2l0aW9uLnNob3cgPSBmYWxzZVxuICAgIH1cbiAgICBjb25zdCBvdGhlckxhYmVsTm90U2VsZWN0ZWQgPSBsYWJlbFdpdGhTYW1lUG9zaXRpb25cbiAgICAgID8gIWxhYmVsV2l0aFNhbWVQb3NpdGlvbi5pc1NlbGVjdGVkXG4gICAgICA6IHRydWVcbiAgICBnZW9tZXRyeS5zaG93ID1cbiAgICAgIChpc1NlbGVjdGVkICYmIG90aGVyTGFiZWxOb3RTZWxlY3RlZCkgfHxcbiAgICAgICFsYWJlbFdpdGhTYW1lUG9zaXRpb24gfHxcbiAgICAgIGdlb21ldHJ5LmlkID09PSBsYWJlbFdpdGhTYW1lUG9zaXRpb24uaWRcbiAgfVxuICAvKlxuICAgICAgICBTaG93cyBhIGhpZGRlbiBsYWJlbC4gVXNlZCB3aGVuIGRlbGV0aW5nIGEgbGFiZWwgdGhhdCBpcyBzaG93bi5cbiAgICAgICAgKi9cbiAgZnVuY3Rpb24gc2hvd0hpZGRlbkxhYmVsKGdlb21ldHJ5OiBhbnkpIHtcbiAgICBpZiAoIWdlb21ldHJ5LnNob3cpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBoaWRkZW5MYWJlbCA9IF8uZmluZChcbiAgICAgIG1hcE1vZGVsLmdldCgnbGFiZWxzJyksXG4gICAgICAobGFiZWwpID0+XG4gICAgICAgIGxhYmVsLnBvc2l0aW9uLnggPT09IGdlb21ldHJ5LnBvc2l0aW9uLnggJiZcbiAgICAgICAgbGFiZWwucG9zaXRpb24ueSA9PT0gZ2VvbWV0cnkucG9zaXRpb24ueSAmJlxuICAgICAgICBsYWJlbC5pZCAhPT0gZ2VvbWV0cnkuaWQgJiZcbiAgICAgICAgIWxhYmVsLnNob3dcbiAgICApXG4gICAgaWYgKGhpZGRlbkxhYmVsKSB7XG4gICAgICBoaWRkZW5MYWJlbC5zaG93ID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1pbmltdW1IZWlnaHRBYm92ZVRlcnJhaW4gPSAyXG4gIGNvbnN0IGV4cG9zZWRNZXRob2RzID0ge1xuICAgIG9uTGVmdENsaWNrKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLnNjZW5lLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCB7IGlkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsXG4gICAgICAgICAgICB5OiBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWFwXG4gICAgICAgIClcbiAgICAgICAgY2FsbGJhY2soZSwgeyBtYXBUYXJnZXQ6IGlkIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgb25MZWZ0Q2xpY2tNYXBBUEkoY2FsbGJhY2s6IGFueSkge1xuICAgICAgbGV0IGxhc3RDbGlja1RpbWUgPSAwXG4gICAgICBsZXQgY2xpY2tUaW1lb3V0ID0gMFxuICAgICAgbWFwLmNsaWNrRXZlbnRIYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihtYXAuY2FudmFzKVxuICAgICAgbWFwLmNsaWNrRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKChlOiBhbnkpID0+IHtcbiAgICAgICAgLy8gT24gYSBkb3VibGUtY2xpY2ssIENlc2l1bSB3aWxsIGZpcmUgMiBsZWZ0LWNsaWNrIGV2ZW50cywgdG9vLiBXZSB3aWxsIG9ubHkgaGFuZGxlIGFcbiAgICAgICAgLy8gY2xpY2sgaWYgMSkgYW5vdGhlciBjbGljayBkaWQgbm90IGhhcHBlbiBpbiB0aGUgbGFzdCAyNTAgbXMsIGFuZCAyKSBhbm90aGVyIGNsaWNrXG4gICAgICAgIC8vIGRvZXMgbm90IGhhcHBlbiBpbiB0aGUgbmV4dCAyNTAgbXMuXG4gICAgICAgIGlmIChjbGlja1RpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGNsaWNrVGltZW91dClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdXJyZW50Q2xpY2tUaW1lID0gRGF0ZS5ub3coKVxuICAgICAgICBpZiAoY3VycmVudENsaWNrVGltZSAtIGxhc3RDbGlja1RpbWUgPiAyNTApIHtcbiAgICAgICAgICBjbGlja1RpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihlLnBvc2l0aW9uLCBtYXApXG4gICAgICAgICAgICBjYWxsYmFjayhsb2NhdGlvbklkKVxuICAgICAgICAgIH0sIDI1MClcbiAgICAgICAgfVxuICAgICAgICBsYXN0Q2xpY2tUaW1lID0gY3VycmVudENsaWNrVGltZVxuICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfQ0xJQ0spXG4gICAgfSxcbiAgICBjbGVhckxlZnRDbGlja01hcEFQSSgpIHtcbiAgICAgIG1hcC5jbGlja0V2ZW50SGFuZGxlcj8uZGVzdHJveSgpXG4gICAgfSxcbiAgICBvblJpZ2h0Q2xpY2soY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuc2NlbmUuY2FudmFzKS5vbignY29udGV4dG1lbnUnLCAoZSkgPT4ge1xuICAgICAgICBjYWxsYmFjayhlKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGNsZWFyUmlnaHRDbGljaygpIHtcbiAgICAgICQobWFwLnNjZW5lLmNhbnZhcykub2ZmKCdjb250ZXh0bWVudScpXG4gICAgfSxcbiAgICBvbkRvdWJsZUNsaWNrKCkge1xuICAgICAgbWFwLmRvdWJsZUNsaWNrRXZlbnRIYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihcbiAgICAgICAgbWFwLmNhbnZhc1xuICAgICAgKVxuICAgICAgbWFwLmRvdWJsZUNsaWNrRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKChlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZS5wb3NpdGlvbiwgbWFwKVxuICAgICAgICBpZiAobG9jYXRpb25JZCkge1xuICAgICAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ2xvY2F0aW9uOmRvdWJsZUNsaWNrJywgbG9jYXRpb25JZClcbiAgICAgICAgfVxuICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfRE9VQkxFX0NMSUNLKVxuICAgIH0sXG4gICAgY2xlYXJEb3VibGVDbGljaygpIHtcbiAgICAgIG1hcC5kb3VibGVDbGlja0V2ZW50SGFuZGxlcj8uZGVzdHJveSgpXG4gICAgfSxcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKHtcbiAgICAgIG1vdmVGcm9tLFxuICAgICAgZG93bixcbiAgICAgIG1vdmUsXG4gICAgICB1cCxcbiAgICB9OiB7XG4gICAgICBtb3ZlRnJvbT86IENlc2l1bS5DYXJ0b2dyYXBoaWNcbiAgICAgIGRvd246IGFueVxuICAgICAgbW92ZTogYW55XG4gICAgICB1cDogYW55XG4gICAgfSkge1xuICAgICAgbWFwLnNjZW5lLnNjcmVlblNwYWNlQ2FtZXJhQ29udHJvbGxlci5lbmFibGVSb3RhdGUgPSBmYWxzZVxuICAgICAgbWFwLmRyYWdBbmREcm9wRXZlbnRIYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihcbiAgICAgICAgbWFwLmNhbnZhc1xuICAgICAgKVxuICAgICAgbWFwLmRyYWdBbmREcm9wRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKChlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZS5wb3NpdGlvbiwgbWFwKVxuICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBtYXAuc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQoXG4gICAgICAgICAgZS5wb3NpdGlvbixcbiAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgY2FydG9ncmFwaGljID0gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tQ2FydGVzaWFuKFxuICAgICAgICAgIGNhcnRlc2lhbixcbiAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgZG93bih7IHBvc2l0aW9uOiBjYXJ0b2dyYXBoaWMsIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQgfSlcbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0RPV04pXG4gICAgICBtYXAuZHJhZ0FuZERyb3BFdmVudEhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKGU6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihlLmVuZFBvc2l0aW9uLCBtYXApXG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IG1hcC5zY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChcbiAgICAgICAgICBlLmVuZFBvc2l0aW9uLFxuICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICAgICAgKVxuICAgICAgICBjb25zdCBjYXJ0b2dyYXBoaWMgPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21DYXJ0ZXNpYW4oXG4gICAgICAgICAgY2FydGVzaWFuLFxuICAgICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWRcbiAgICAgICAgKVxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG1vdmVGcm9tXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGxvbmdpdHVkZTogQ2VzaXVtLk1hdGgudG9EZWdyZWVzKFxuICAgICAgICAgICAgICAgIGNhcnRvZ3JhcGhpYy5sb25naXR1ZGUgLSBtb3ZlRnJvbS5sb25naXR1ZGVcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgbGF0aXR1ZGU6IENlc2l1bS5NYXRoLnRvRGVncmVlcyhcbiAgICAgICAgICAgICAgICBjYXJ0b2dyYXBoaWMubGF0aXR1ZGUgLSBtb3ZlRnJvbS5sYXRpdHVkZVxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogbnVsbFxuICAgICAgICBtb3ZlKHsgdHJhbnNsYXRpb24sIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQgfSlcbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICAgICAgbWFwLmRyYWdBbmREcm9wRXZlbnRIYW5kbGVyLnNldElucHV0QWN0aW9uKFxuICAgICAgICB1cCxcbiAgICAgICAgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfVVBcbiAgICAgIClcbiAgICB9LFxuICAgIGNsZWFyTW91c2VUcmFja2luZ0Zvckdlb0RyYWcoKSB7XG4gICAgICBtYXAuc2NlbmUuc2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyLmVuYWJsZVJvdGF0ZSA9IHRydWVcbiAgICAgIG1hcC5kcmFnQW5kRHJvcEV2ZW50SGFuZGxlcj8uZGVzdHJveSgpXG4gICAgfSxcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JQb3B1cChcbiAgICAgIGRvd25DYWxsYmFjazogYW55LFxuICAgICAgbW92ZUNhbGxiYWNrOiBhbnksXG4gICAgICB1cENhbGxiYWNrOiBhbnlcbiAgICApIHtcbiAgICAgIG1hcC5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlckZvclBvcHVwUHJldmlldyA9XG4gICAgICAgIG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIobWFwLmNhbnZhcylcbiAgICAgIG1hcC5zY3JlZW5TcGFjZUV2ZW50SGFuZGxlckZvclBvcHVwUHJldmlldy5zZXRJbnB1dEFjdGlvbigoKSA9PiB7XG4gICAgICAgIGRvd25DYWxsYmFjaygpXG4gICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9ET1dOKVxuICAgICAgbWFwLnNjcmVlblNwYWNlRXZlbnRIYW5kbGVyRm9yUG9wdXBQcmV2aWV3LnNldElucHV0QWN0aW9uKCgpID0+IHtcbiAgICAgICAgbW92ZUNhbGxiYWNrKClcbiAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICAgICAgdGhpcy5vbkxlZnRDbGljayh1cENhbGxiYWNrKVxuICAgIH0sXG4gICAgb25Nb3VzZU1vdmUoY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuc2NlbmUuY2FudmFzKS5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLnNjZW5lLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHtcbiAgICAgICAgICB4OiBlLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdCxcbiAgICAgICAgICB5OiBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wLFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgaWQsIGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihwb3NpdGlvbiwgbWFwKVxuICAgICAgICBjYWxsYmFjayhlLCB7XG4gICAgICAgICAgbWFwVGFyZ2V0OiBpZCxcbiAgICAgICAgICBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuICAgIGNsZWFyTW91c2VNb3ZlKCkge1xuICAgICAgJChtYXAuc2NlbmUuY2FudmFzKS5vZmYoJ21vdXNlbW92ZScpXG4gICAgfSxcbiAgICB0aW1lb3V0SWRzOiBbXSBhcyBudW1iZXJbXSxcbiAgICBvbkNhbWVyYU1vdmVTdGFydChjYWxsYmFjazogYW55KSB7XG4gICAgICB0aGlzLnRpbWVvdXRJZHMuZm9yRWFjaCgodGltZW91dElkOiBhbnkpID0+IHtcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0SWQpXG4gICAgICB9KVxuICAgICAgdGhpcy50aW1lb3V0SWRzID0gW11cbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEubW92ZVN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoY2FsbGJhY2spXG4gICAgfSxcbiAgICBvZmZDYW1lcmFNb3ZlU3RhcnQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5tb3ZlU3RhcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjYWxsYmFjaylcbiAgICB9LFxuICAgIG9uQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBjb25zdCB0aW1lb3V0Q2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudGltZW91dElkcy5wdXNoKFxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICB9LCAzMDApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEubW92ZUVuZC5hZGRFdmVudExpc3RlbmVyKHRpbWVvdXRDYWxsYmFjaylcbiAgICB9LFxuICAgIG9mZkNhbWVyYU1vdmVFbmQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgbWFwLnNjZW5lLmNhbWVyYS5tb3ZlRW5kLnJlbW92ZUV2ZW50TGlzdGVuZXIoY2FsbGJhY2spXG4gICAgfSxcbiAgICBkb1Bhblpvb20oY29vcmRzOiBhbnkpIHtcbiAgICAgIGlmIChjb29yZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgY2FydEFycmF5ID0gY29vcmRzLm1hcCgoY29vcmQ6IGFueSkgPT5cbiAgICAgICAgQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgICBjb29yZFswXSxcbiAgICAgICAgICBjb29yZFsxXSxcbiAgICAgICAgICBtYXAuY2FtZXJhLl9wb3NpdGlvbkNhcnRvZ3JhcGhpYy5oZWlnaHRcbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgaWYgKGNhcnRBcnJheS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgY29uc3QgcG9pbnQgPSBDZXNpdW0uRWxsaXBzb2lkLldHUzg0LmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKFxuICAgICAgICAgIGNhcnRBcnJheVswXVxuICAgICAgICApXG4gICAgICAgIHRoaXMucGFuVG9Db29yZGluYXRlKHBvaW50LCAyLjApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZWN0YW5nbGUgPSBDZXNpdW0uUmVjdGFuZ2xlLmZyb21DYXJ0b2dyYXBoaWNBcnJheShjYXJ0QXJyYXkpXG4gICAgICAgIHRoaXMucGFuVG9SZWN0YW5nbGUocmVjdGFuZ2xlLCB7XG4gICAgICAgICAgZHVyYXRpb246IDIuMCxcbiAgICAgICAgICBjb3JyZWN0aW9uOiAxLjAsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBwYW5Ub1Jlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICBsZXQgcmVjdGFuZ2xlLCBjYXJ0QXJyYXksIHBvaW50XG4gICAgICBjYXJ0QXJyYXkgPSBfLmZsYXR0ZW4oXG4gICAgICAgIHJlc3VsdHNcbiAgICAgICAgICAuZmlsdGVyKChyZXN1bHQ6IGFueSkgPT4gcmVzdWx0Lmhhc0dlb21ldHJ5KCkpXG4gICAgICAgICAgLm1hcChcbiAgICAgICAgICAgIChyZXN1bHQ6IGFueSkgPT5cbiAgICAgICAgICAgICAgXy5tYXAocmVzdWx0LmdldFBvaW50cygnbG9jYXRpb24nKSwgKGNvb3JkaW5hdGUpID0+XG4gICAgICAgICAgICAgICAgQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVbMF0sXG4gICAgICAgICAgICAgICAgICBjb29yZGluYXRlWzFdLFxuICAgICAgICAgICAgICAgICAgbWFwLmNhbWVyYS5fcG9zaXRpb25DYXJ0b2dyYXBoaWMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgIClcbiAgICAgIClcbiAgICAgIGlmIChjYXJ0QXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoY2FydEFycmF5Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHBvaW50ID0gQ2VzaXVtLkVsbGlwc29pZC5XR1M4NC5jYXJ0b2dyYXBoaWNUb0NhcnRlc2lhbihjYXJ0QXJyYXlbMF0pXG4gICAgICAgICAgdGhpcy5wYW5Ub0Nvb3JkaW5hdGUocG9pbnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVjdGFuZ2xlID0gQ2VzaXVtLlJlY3RhbmdsZS5mcm9tQ2FydG9ncmFwaGljQXJyYXkoY2FydEFycmF5KVxuICAgICAgICAgIHRoaXMucGFuVG9SZWN0YW5nbGUocmVjdGFuZ2xlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwYW5Ub0Nvb3JkaW5hdGUoY29vcmRzOiBhbnksIGR1cmF0aW9uID0gMC41KSB7XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGRlc3RpbmF0aW9uOiBjb29yZHMsXG4gICAgICB9KVxuICAgIH0sXG4gICAgcGFuVG9FeHRlbnQoKSB7fSxcbiAgICBwYW5Ub1NoYXBlc0V4dGVudCh7XG4gICAgICBkdXJhdGlvbiA9IDUwMCxcbiAgICB9OiB7XG4gICAgICBkdXJhdGlvbj86IG51bWJlciAvLyB0YWtlIGluIG1pbGxpc2Vjb25kcyBmb3Igbm9ybWFsaXphdGlvbiB3aXRoIG9wZW5sYXllcnMgZHVyYXRpb24gYmVpbmcgbWlsbGlzZWNvbmRzXG4gICAgfSA9IHt9KSB7XG4gICAgICBjb25zdCBjdXJyZW50UHJpbWl0aXZlcyA9IG1hcC5zY2VuZS5wcmltaXRpdmVzLl9wcmltaXRpdmVzLmZpbHRlcihcbiAgICAgICAgKHByaW06IGFueSkgPT4gcHJpbS5pZFxuICAgICAgKVxuICAgICAgY29uc3QgYWN0dWFsUG9zaXRpb25zID0gY3VycmVudFByaW1pdGl2ZXMucmVkdWNlKFxuICAgICAgICAoYmxvYjogYW55LCBwcmltOiBhbnkpID0+IHtcbiAgICAgICAgICByZXR1cm4gYmxvYi5jb25jYXQoXG4gICAgICAgICAgICBwcmltLl9wb2x5bGluZXMucmVkdWNlKChzdWJibG9iOiBhbnksIHBvbHlsaW5lOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHN1YmJsb2IuY29uY2F0KHBvbHlsaW5lLl9hY3R1YWxQb3NpdGlvbnMpXG4gICAgICAgICAgICB9LCBbXSlcbiAgICAgICAgICApXG4gICAgICAgIH0sXG4gICAgICAgIFtdXG4gICAgICApXG4gICAgICBpZiAoYWN0dWFsUG9zaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbWFwLnNjZW5lLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uIC8gMTAwMCwgLy8gY2hhbmdlIHRvIHNlY29uZHNcbiAgICAgICAgICBkZXN0aW5hdGlvbjogQ2VzaXVtLlJlY3RhbmdsZS5mcm9tQ2FydGVzaWFuQXJyYXkoYWN0dWFsUG9zaXRpb25zKSxcbiAgICAgICAgICBvcmllbnRhdGlvbjogTG9va2luZ1N0cmFpZ2h0RG93bk9yaWVudGF0aW9uLFxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSxcbiAgICBnZXRDZW50ZXJQb3NpdGlvbk9mUHJpbWl0aXZlSWRzKHByaW1pdGl2ZUlkczogc3RyaW5nW10pIHtcbiAgICAgIGNvbnN0IHByaW1pdGl2ZXMgPSBtYXAuc2NlbmUucHJpbWl0aXZlc1xuICAgICAgbGV0IHBvc2l0aW9ucyA9IFtdIGFzIGFueVtdXG5cbiAgICAgIC8vIEl0ZXJhdGUgb3ZlciBwcmltaXRpdmVzIGFuZCBjb21wdXRlIGJvdW5kaW5nIHNwaGVyZXNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJpbWl0aXZlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcHJpbWl0aXZlID0gcHJpbWl0aXZlcy5nZXQoaSlcbiAgICAgICAgaWYgKHByaW1pdGl2ZUlkcy5pbmNsdWRlcyhwcmltaXRpdmUuaWQpKSB7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwcmltaXRpdmUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGxldCBwb2ludCA9IHByaW1pdGl2ZS5nZXQoailcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQocG9pbnQucG9zaXRpb25zKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsZXQgYm91bmRpbmdTcGhlcmUgPSBDZXNpdW0uQm91bmRpbmdTcGhlcmUuZnJvbVBvaW50cyhwb3NpdGlvbnMpXG5cbiAgICAgIGlmIChcbiAgICAgICAgQ2VzaXVtLkJvdW5kaW5nU3BoZXJlLmVxdWFscyhcbiAgICAgICAgICBib3VuZGluZ1NwaGVyZSxcbiAgICAgICAgICBDZXNpdW0uQm91bmRpbmdTcGhlcmUuZnJvbVBvaW50cyhbXSkgLy8gZW1wdHlcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcG9zaXRpb25zIHRvIHpvb20gdG8nKVxuICAgICAgfVxuXG4gICAgICAvLyBoZXJlLCBub3RpY2Ugd2UgdXNlIGZseVRvIGluc3RlYWQgb2YgZmx5VG9Cb3VuZGluZ1NwaGVyZSwgYXMgd2l0aCB0aGUgbGF0dGVyIHRoZSBvcmllbnRhdGlvbiBjYW4ndCBiZSBjb250cm9sbGVkIGluIHRoaXMgdmVyc2lvbiBhbmQgZW5kcyB1cCB0aWx0ZWRcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgcG9zaXRpb24gYWJvdmUgdGhlIGNlbnRlciBvZiB0aGUgYm91bmRpbmcgc3BoZXJlXG4gICAgICBsZXQgcmFkaXVzID0gYm91bmRpbmdTcGhlcmUucmFkaXVzXG4gICAgICBsZXQgY2VudGVyID0gYm91bmRpbmdTcGhlcmUuY2VudGVyXG4gICAgICBsZXQgdXAgPSBDZXNpdW0uQ2FydGVzaWFuMy5jbG9uZShjZW50ZXIpIC8vIEdldCB0aGUgdXAgZGlyZWN0aW9uIGZyb20gdGhlIGNlbnRlciBvZiB0aGUgRWFydGggdG8gdGhlIHBvc2l0aW9uXG4gICAgICBDZXNpdW0uQ2FydGVzaWFuMy5ub3JtYWxpemUodXAsIHVwKVxuXG4gICAgICBsZXQgcG9zaXRpb24gPSBDZXNpdW0uQ2FydGVzaWFuMy5tdWx0aXBseUJ5U2NhbGFyKFxuICAgICAgICB1cCxcbiAgICAgICAgcmFkaXVzICogMixcbiAgICAgICAgbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKClcbiAgICAgICkgLy8gQWRqdXN0IG11bHRpcGxpZXIgZm9yIGRlc2lyZWQgYWx0aXR1ZGVcbiAgICAgIENlc2l1bS5DYXJ0ZXNpYW4zLmFkZChjZW50ZXIsIHBvc2l0aW9uLCBwb3NpdGlvbikgLy8gTW92ZSBwb3NpdGlvbiBhYm92ZSB0aGUgY2VudGVyXG5cbiAgICAgIHJldHVybiBwb3NpdGlvblxuICAgIH0sXG4gICAgem9vbVRvSWRzKHtcbiAgICAgIGlkcyxcbiAgICAgIGR1cmF0aW9uID0gNTAwLFxuICAgIH06IHtcbiAgICAgIGlkczogc3RyaW5nW11cbiAgICAgIGR1cmF0aW9uPzogbnVtYmVyIC8vIHRha2UgaW4gbWlsbGlzZWNvbmRzIGZvciBub3JtYWxpemF0aW9uIHdpdGggb3BlbmxheWVycyBkdXJhdGlvbiBiZWluZyBtaWxsaXNlY29uZHNcbiAgICB9KSB7XG4gICAgICAvLyB1c2UgZmx5VG8gaW5zdGVhZCBvZiBmbHlUb0JvdW5kaW5nU3BoZXJlLCBhcyB3aXRoIHRoZSBsYXR0ZXIgdGhlIG9yaWVudGF0aW9uIGNhbid0IGJlIGNvbnRyb2xsZWQgaW4gdGhpcyB2ZXJzaW9uIGFuZCBpdCBlbmRzIHVwIHRpbHRlZFxuICAgICAgbWFwLmNhbWVyYS5mbHlUbyh7XG4gICAgICAgIGRlc3RpbmF0aW9uOiB0aGlzLmdldENlbnRlclBvc2l0aW9uT2ZQcmltaXRpdmVJZHMoaWRzKSxcbiAgICAgICAgb3JpZW50YXRpb246IExvb2tpbmdTdHJhaWdodERvd25PcmllbnRhdGlvbixcbiAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uIC8gMTAwMCwgLy8gY2hhbmdlIHRvIHNlY29uZHNcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwYW5Ub1JlY3RhbmdsZShcbiAgICAgIHJlY3RhbmdsZTogYW55LFxuICAgICAgb3B0cyA9IHtcbiAgICAgICAgZHVyYXRpb246IDAuNSxcbiAgICAgICAgY29ycmVjdGlvbjogMC4yNSxcbiAgICAgIH1cbiAgICApIHtcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEuZmx5VG8oe1xuICAgICAgICBkdXJhdGlvbjogb3B0cy5kdXJhdGlvbixcbiAgICAgICAgZGVzdGluYXRpb246IGdldERlc3RpbmF0aW9uRm9yVmlzaWJsZVBhbihyZWN0YW5nbGUsIG1hcCksXG4gICAgICAgIGNvbXBsZXRlKCkge1xuICAgICAgICAgIG1hcC5zY2VuZS5jYW1lcmEuZmx5VG8oe1xuICAgICAgICAgICAgZHVyYXRpb246IG9wdHMuY29ycmVjdGlvbixcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uOiBnZXREZXN0aW5hdGlvbkZvclZpc2libGVQYW4ocmVjdGFuZ2xlLCBtYXApLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2V0U2hhcGVzKCkge1xuICAgICAgcmV0dXJuIHNoYXBlc1xuICAgIH0sXG4gICAgem9vbVRvRXh0ZW50KCkge30sXG4gICAgem9vbVRvQm91bmRpbmdCb3goeyBub3J0aCwgc291dGgsIGVhc3QsIHdlc3QgfTogYW55KSB7XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLmZseVRvKHtcbiAgICAgICAgZHVyYXRpb246IDAuNSxcbiAgICAgICAgZGVzdGluYXRpb246IENlc2l1bS5SZWN0YW5nbGUuZnJvbURlZ3JlZXMod2VzdCwgc291dGgsIGVhc3QsIG5vcnRoKSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRCb3VuZGluZ0JveCgpIHtcbiAgICAgIGNvbnN0IHZpZXdSZWN0YW5nbGUgPSBtYXAuc2NlbmUuY2FtZXJhLmNvbXB1dGVWaWV3UmVjdGFuZ2xlKClcbiAgICAgIHJldHVybiBfLm1hcE9iamVjdCh2aWV3UmVjdGFuZ2xlLCAodmFsKSA9PiBDZXNpdW0uTWF0aC50b0RlZ3JlZXModmFsKSlcbiAgICB9LFxuICAgIG92ZXJsYXlJbWFnZShtb2RlbDogTGF6eVF1ZXJ5UmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhY2FyZElkID0gbW9kZWwucGxhaW4uaWRcbiAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheShtZXRhY2FyZElkKVxuICAgICAgY29uc3QgY29vcmRzID0gbW9kZWwuZ2V0UG9pbnRzKCdsb2NhdGlvbicpXG4gICAgICBjb25zdCBjYXJ0b2dyYXBoaWNzID0gXy5tYXAoY29vcmRzLCAoY29vcmQpID0+IHtcbiAgICAgICAgY29vcmQgPSBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkKVxuICAgICAgICByZXR1cm4gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgICBjb29yZC5sb25naXR1ZGUsXG4gICAgICAgICAgY29vcmQubGF0aXR1ZGUsXG4gICAgICAgICAgY29vcmQuYWx0aXR1ZGVcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICAgIGNvbnN0IHJlY3RhbmdsZSA9IENlc2l1bS5SZWN0YW5nbGUuZnJvbUNhcnRvZ3JhcGhpY0FycmF5KGNhcnRvZ3JhcGhpY3MpXG4gICAgICBjb25zdCBvdmVybGF5TGF5ZXIgPSBtYXAuc2NlbmUuaW1hZ2VyeUxheWVycy5hZGRJbWFnZXJ5UHJvdmlkZXIoXG4gICAgICAgIG5ldyBDZXNpdW0uU2luZ2xlVGlsZUltYWdlcnlQcm92aWRlcih7XG4gICAgICAgICAgdXJsOiBtb2RlbC5jdXJyZW50T3ZlcmxheVVybCxcbiAgICAgICAgICByZWN0YW5nbGUsXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIG92ZXJsYXlzW21ldGFjYXJkSWRdID0gb3ZlcmxheUxheWVyXG4gICAgfSxcbiAgICByZW1vdmVPdmVybGF5KG1ldGFjYXJkSWQ6IGFueSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBpZiAob3ZlcmxheXNbbWV0YWNhcmRJZF0pIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIG1hcC5zY2VuZS5pbWFnZXJ5TGF5ZXJzLnJlbW92ZShvdmVybGF5c1ttZXRhY2FyZElkXSlcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGRlbGV0ZSBvdmVybGF5c1ttZXRhY2FyZElkXVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlQWxsT3ZlcmxheXMoKSB7XG4gICAgICBmb3IgKGNvbnN0IG92ZXJsYXkgaW4gb3ZlcmxheXMpIHtcbiAgICAgICAgaWYgKG92ZXJsYXlzLmhhc093blByb3BlcnR5KG92ZXJsYXkpKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgbWFwLnNjZW5lLmltYWdlcnlMYXllcnMucmVtb3ZlKG92ZXJsYXlzW292ZXJsYXldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvdmVybGF5cyA9IHt9XG4gICAgfSxcbiAgICBnZXRDYXJ0b2dyYXBoaWNDZW50ZXJPZkNsdXN0ZXJJbkRlZ3JlZXMoY2x1c3RlcjogQ2x1c3RlclR5cGUpIHtcbiAgICAgIHJldHVybiB1dGlsaXR5LmNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cmllc0luRGVncmVlcyhcbiAgICAgICAgY2x1c3Rlci5yZXN1bHRzXG4gICAgICApXG4gICAgfSxcbiAgICBnZXRXaW5kb3dMb2NhdGlvbnNPZlJlc3VsdHMocmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0W10pIHtcbiAgICAgIGxldCBvY2NsdWRlcjogYW55XG4gICAgICBpZiAobWFwLnNjZW5lLm1vZGUgPT09IENlc2l1bS5TY2VuZU1vZGUuU0NFTkUzRCkge1xuICAgICAgICBvY2NsdWRlciA9IG5ldyBDZXNpdW0uRWxsaXBzb2lkYWxPY2NsdWRlcihcbiAgICAgICAgICBDZXNpdW0uRWxsaXBzb2lkLldHUzg0LFxuICAgICAgICAgIG1hcC5zY2VuZS5jYW1lcmEucG9zaXRpb25cbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMubWFwKChyZXN1bHQpID0+IHtcbiAgICAgICAgY29uc3QgY2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnkgPVxuICAgICAgICAgIHV0aWxpdHkuY2FsY3VsYXRlQ2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnkocmVzdWx0KVxuICAgICAgICBpZiAob2NjbHVkZXIgJiYgaXNOb3RWaXNpYmxlKGNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5LCBvY2NsdWRlcikpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2VudGVyID0gdXRpbGl0eS5jYWxjdWxhdGVXaW5kb3dDZW50ZXJPZkdlb21ldHJ5KFxuICAgICAgICAgIGNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5LFxuICAgICAgICAgIG1hcFxuICAgICAgICApXG4gICAgICAgIGlmIChjZW50ZXIpIHtcbiAgICAgICAgICByZXR1cm4gW2NlbnRlci54LCBjZW50ZXIueV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcbiAgICAvKlxuICAgICAqIERyYXdzIGEgbWFya2VyIG9uIHRoZSBtYXAgZGVzaWduYXRpbmcgYSBzdGFydC9lbmQgcG9pbnQgZm9yIHRoZSBydWxlciBtZWFzdXJlbWVudC4gVGhlIGdpdmVuXG4gICAgICogY29vcmRpbmF0ZXMgc2hvdWxkIGJlIGFuIG9iamVjdCB3aXRoICdsYXQnIGFuZCAnbG9uJyBrZXlzIHdpdGggZGVncmVlcyB2YWx1ZXMuIFRoZSBnaXZlblxuICAgICAqIG1hcmtlciBsYWJlbCBzaG91bGQgYmUgYSBzaW5nbGUgY2hhcmFjdGVyIG9yIGRpZ2l0IHRoYXQgaXMgZGlzcGxheWVkIG9uIHRoZSBtYXAgbWFya2VyLlxuICAgICAqL1xuICAgIGFkZFJ1bGVyUG9pbnQoY29vcmRpbmF0ZXM6IGFueSkge1xuICAgICAgY29uc3QgeyBsYXQsIGxvbiB9ID0gY29vcmRpbmF0ZXNcbiAgICAgIC8vIGEgcG9pbnQgcmVxdWlyZXMgYW4gYWx0aXR1ZGUgdmFsdWUgc28ganVzdCB1c2UgMFxuICAgICAgY29uc3QgcG9pbnQgPSBbbG9uLCBsYXQsIDBdXG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBpZDogJyAnLFxuICAgICAgICB0aXRsZTogYFNlbGVjdGVkIHJ1bGVyIGNvb3JkaW5hdGVgLFxuICAgICAgICBpbWFnZTogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlKHtcbiAgICAgICAgICBmaWxsQ29sb3I6IHJ1bGVyUG9pbnRDb2xvcixcbiAgICAgICAgICBpY29uOiBudWxsLFxuICAgICAgICB9KSxcbiAgICAgICAgdmlldzogdGhpcyxcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmFkZFBvaW50KHBvaW50LCBvcHRpb25zKVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBSZW1vdmVzIHRoZSBnaXZlbiBCaWxsYm9hcmQgZnJvbSB0aGUgbWFwLlxuICAgICAqL1xuICAgIHJlbW92ZVJ1bGVyUG9pbnQoYmlsbGJvYXJkUmVmOiBhbnkpIHtcbiAgICAgIGJpbGxib2FyZENvbGxlY3Rpb24ucmVtb3ZlKGJpbGxib2FyZFJlZilcbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICB9LFxuICAgIC8qXG4gICAgICogRHJhd3MgYSBsaW5lIG9uIHRoZSBtYXAgYmV0d2VlbiB0aGUgcG9pbnRzIGluIHRoZSBnaXZlbiBhcnJheSBvZiBwb2ludHMuXG4gICAgICovXG4gICAgYWRkUnVsZXJMaW5lKHBvaW50OiBhbnkpIHtcbiAgICAgIGxldCBzdGFydGluZ0Nvb3JkaW5hdGVzID0gbWFwTW9kZWwuZ2V0KCdzdGFydGluZ0Nvb3JkaW5hdGVzJylcbiAgICAgIC8vIGNyZWF0ZXMgYW4gYXJyYXkgb2YgQ2FydGVzaWFuMyBwb2ludHNcbiAgICAgIC8vIGEgUG9seWxpbmVHZW9tZXRyeSBhbGxvd3MgdGhlIGxpbmUgdG8gZm9sbG93IHRoZSBjdXJ2YXR1cmUgb2YgdGhlIHN1cmZhY2VcbiAgICAgIG1hcC5jb29yZEFycmF5ID0gW1xuICAgICAgICBzdGFydGluZ0Nvb3JkaW5hdGVzWydsb24nXSxcbiAgICAgICAgc3RhcnRpbmdDb29yZGluYXRlc1snbGF0J10sXG4gICAgICAgIHJ1bGVyTGluZUhlaWdodCxcbiAgICAgICAgcG9pbnRbJ2xvbiddLFxuICAgICAgICBwb2ludFsnbGF0J10sXG4gICAgICAgIHJ1bGVyTGluZUhlaWdodCxcbiAgICAgIF1cbiAgICAgIHJldHVybiBtYXAuZW50aXRpZXMuYWRkKHtcbiAgICAgICAgcG9seWxpbmU6IHtcbiAgICAgICAgICBwb3NpdGlvbnM6IG5ldyBDZXNpdW0uQ2FsbGJhY2tQcm9wZXJ0eShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbURlZ3JlZXNBcnJheUhlaWdodHMobWFwLmNvb3JkQXJyYXkpXG4gICAgICAgICAgfSwgZmFsc2UpLFxuICAgICAgICAgIHdpZHRoOiA1LFxuICAgICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgICAgbWF0ZXJpYWw6IHJ1bGVyQ29sb3IsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBVcGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBydWxlciBsaW5lXG4gICAgICovXG4gICAgc2V0UnVsZXJMaW5lKHBvaW50OiBhbnkpIHtcbiAgICAgIGxldCBzdGFydGluZ0Nvb3JkaW5hdGVzID0gbWFwTW9kZWwuZ2V0KCdzdGFydGluZ0Nvb3JkaW5hdGVzJylcbiAgICAgIG1hcC5jb29yZEFycmF5ID0gW1xuICAgICAgICBzdGFydGluZ0Nvb3JkaW5hdGVzWydsb24nXSxcbiAgICAgICAgc3RhcnRpbmdDb29yZGluYXRlc1snbGF0J10sXG4gICAgICAgIHJ1bGVyTGluZUhlaWdodCxcbiAgICAgICAgcG9pbnRbJ2xvbiddLFxuICAgICAgICBwb2ludFsnbGF0J10sXG4gICAgICAgIHJ1bGVyTGluZUhlaWdodCxcbiAgICAgIF1cbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICB9LFxuICAgIC8qXG4gICAgICogUmVtb3ZlcyB0aGUgZ2l2ZW4gcG9seWxpbmUgZW50aXR5IGZyb20gdGhlIG1hcC5cbiAgICAgKi9cbiAgICByZW1vdmVSdWxlckxpbmUocG9seWxpbmU6IGFueSkge1xuICAgICAgbWFwLmVudGl0aWVzLnJlbW92ZShwb2x5bGluZSlcbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgICAgQWRkcyBhIGJpbGxib2FyZCBwb2ludCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2ludCBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgICAqL1xuICAgIGFkZFBvaW50V2l0aFRleHQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBjYXJ0b2dyYXBoaWNQb3NpdGlvbiA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgIHBvaW50T2JqZWN0LmxvbmdpdHVkZSxcbiAgICAgICAgcG9pbnRPYmplY3QubGF0aXR1ZGUsXG4gICAgICAgIHBvaW50T2JqZWN0LmFsdGl0dWRlXG4gICAgICApXG4gICAgICBsZXQgY2FydGVzaWFuUG9zaXRpb24gPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKGNhcnRvZ3JhcGhpY1Bvc2l0aW9uKVxuICAgICAgY29uc3QgYmlsbGJvYXJkUmVmID0gYmlsbGJvYXJkQ29sbGVjdGlvbi5hZGQoe1xuICAgICAgICBpbWFnZTogdW5kZWZpbmVkLFxuICAgICAgICBwb3NpdGlvbjogY2FydGVzaWFuUG9zaXRpb24sXG4gICAgICAgIGlkOiBvcHRpb25zLmlkLFxuICAgICAgICBleWVPZmZzZXQsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLnVuc2VsZWN0ZWRJbWFnZSA9IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYucGFydGlhbGx5U2VsZWN0ZWRJbWFnZSA9IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICdibGFjaycsXG4gICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgIH0pXG4gICAgICBiaWxsYm9hcmRSZWYuc2VsZWN0ZWRJbWFnZSA9IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgZmlsbENvbG9yOiAnb3JhbmdlJyxcbiAgICAgICAgdGV4dDogb3B0aW9ucy5pZC5sZW5ndGgsXG4gICAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICB9KVxuICAgICAgc3dpdGNoIChvcHRpb25zLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICAgIGJpbGxib2FyZFJlZi5pbWFnZSA9IGJpbGxib2FyZFJlZi5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAncGFydGlhbGx5JzpcbiAgICAgICAgICBiaWxsYm9hcmRSZWYuaW1hZ2UgPSBiaWxsYm9hcmRSZWYucGFydGlhbGx5U2VsZWN0ZWRJbWFnZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3Vuc2VsZWN0ZWQnOlxuICAgICAgICAgIGJpbGxib2FyZFJlZi5pbWFnZSA9IGJpbGxib2FyZFJlZi51bnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgLy9pZiB0aGVyZSBpcyBhIHRlcnJhaW4gcHJvdmlkZXIgYW5kIG5vIGFsdGl0dWRlIGhhcyBiZWVuIHNwZWNpZmllZCwgc2FtcGxlIGl0IGZyb20gdGhlIGNvbmZpZ3VyZWQgdGVycmFpbiBwcm92aWRlclxuICAgICAgaWYgKCFwb2ludE9iamVjdC5hbHRpdHVkZSAmJiBtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBDZXNpdW0uc2FtcGxlVGVycmFpbihtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyLCA1LCBbXG4gICAgICAgICAgY2FydG9ncmFwaGljUG9zaXRpb24sXG4gICAgICAgIF0pXG4gICAgICAgIENlc2l1bS53aGVuKHByb21pc2UsICh1cGRhdGVkQ2FydG9ncmFwaGljOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAodXBkYXRlZENhcnRvZ3JhcGhpY1swXS5oZWlnaHQgJiYgIW9wdGlvbnMudmlldy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgY2FydGVzaWFuUG9zaXRpb24gPVxuICAgICAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRDYXJ0b2dyYXBoaWNbMF1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgYmlsbGJvYXJkUmVmLnBvc2l0aW9uID0gY2FydGVzaWFuUG9zaXRpb25cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgICByZXR1cm4gYmlsbGJvYXJkUmVmXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgYmlsbGJvYXJkIHBvaW50IHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgICAqL1xuICAgIGFkZFBvaW50KHBvaW50OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgcG9pbnRPYmplY3QgPSBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50KVxuICAgICAgY29uc3QgY2FydG9ncmFwaGljUG9zaXRpb24gPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICBwb2ludE9iamVjdC5sb25naXR1ZGUsXG4gICAgICAgIHBvaW50T2JqZWN0LmxhdGl0dWRlLFxuICAgICAgICBwb2ludE9iamVjdC5hbHRpdHVkZVxuICAgICAgKVxuICAgICAgY29uc3QgY2FydGVzaWFuUG9zaXRpb24gPVxuICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKGNhcnRvZ3JhcGhpY1Bvc2l0aW9uKVxuICAgICAgY29uc3QgYmlsbGJvYXJkUmVmID0gYmlsbGJvYXJkQ29sbGVjdGlvbi5hZGQoe1xuICAgICAgICBpbWFnZTogdW5kZWZpbmVkLFxuICAgICAgICBwb3NpdGlvbjogY2FydGVzaWFuUG9zaXRpb24sXG4gICAgICAgIGlkOiBvcHRpb25zLmlkLFxuICAgICAgICBleWVPZmZzZXQsXG4gICAgICAgIHBpeGVsT2Zmc2V0LFxuICAgICAgICB2ZXJ0aWNhbE9yaWdpbjogb3B0aW9ucy51c2VWZXJ0aWNhbE9yaWdpblxuICAgICAgICAgID8gQ2VzaXVtLlZlcnRpY2FsT3JpZ2luLkJPVFRPTVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBob3Jpem9udGFsT3JpZ2luOiBvcHRpb25zLnVzZUhvcml6b250YWxPcmlnaW5cbiAgICAgICAgICA/IENlc2l1bS5Ib3Jpem9udGFsT3JpZ2luLkNFTlRFUlxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB2aWV3OiBvcHRpb25zLnZpZXcsXG4gICAgICB9KVxuICAgICAgYmlsbGJvYXJkUmVmLnVuc2VsZWN0ZWRJbWFnZSA9IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgIGZpbGxDb2xvcjogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi5zZWxlY3RlZEltYWdlID0gRHJhd2luZ1V0aWxpdHkuZ2V0UGluKHtcbiAgICAgICAgZmlsbENvbG9yOiAnb3JhbmdlJyxcbiAgICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgfSlcbiAgICAgIGJpbGxib2FyZFJlZi5pbWFnZSA9IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICA/IGJpbGxib2FyZFJlZi5zZWxlY3RlZEltYWdlXG4gICAgICAgIDogYmlsbGJvYXJkUmVmLnVuc2VsZWN0ZWRJbWFnZVxuICAgICAgLy9pZiB0aGVyZSBpcyBhIHRlcnJhaW4gcHJvdmlkZXIgYW5kIG5vIGFsdGl0dWRlIGhhcyBiZWVuIHNwZWNpZmllZCwgc2FtcGxlIGl0IGZyb20gdGhlIGNvbmZpZ3VyZWQgdGVycmFpbiBwcm92aWRlclxuICAgICAgaWYgKCFwb2ludE9iamVjdC5hbHRpdHVkZSAmJiBtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBDZXNpdW0uc2FtcGxlVGVycmFpbihtYXAuc2NlbmUudGVycmFpblByb3ZpZGVyLCA1LCBbXG4gICAgICAgICAgY2FydG9ncmFwaGljUG9zaXRpb24sXG4gICAgICAgIF0pXG4gICAgICAgIENlc2l1bS53aGVuKHByb21pc2UsICh1cGRhdGVkQ2FydG9ncmFwaGljOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAodXBkYXRlZENhcnRvZ3JhcGhpY1swXS5oZWlnaHQgJiYgIW9wdGlvbnMudmlldy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgYmlsbGJvYXJkUmVmLnBvc2l0aW9uID1cbiAgICAgICAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNUb0NhcnRlc2lhbihcbiAgICAgICAgICAgICAgICB1cGRhdGVkQ2FydG9ncmFwaGljWzBdXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgICByZXR1cm4gYmlsbGJvYXJkUmVmXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgbGFiZWwgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byBhbiBpZCBhbmQgdGV4dC5cbiAgICAgICAgICAgICovXG4gICAgYWRkTGFiZWwocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBjYXJ0b2dyYXBoaWNQb3NpdGlvbiA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMoXG4gICAgICAgIHBvaW50T2JqZWN0LmxvbmdpdHVkZSxcbiAgICAgICAgcG9pbnRPYmplY3QubGF0aXR1ZGUsXG4gICAgICAgIHBvaW50T2JqZWN0LmFsdGl0dWRlXG4gICAgICApXG4gICAgICBjb25zdCBjYXJ0ZXNpYW5Qb3NpdGlvbiA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oY2FydG9ncmFwaGljUG9zaXRpb24pXG4gICAgICAvLyBYLCBZIG9mZnNldCB2YWx1ZXMgZm9yIHRoZSBsYWJlbFxuICAgICAgY29uc3Qgb2Zmc2V0ID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4yKDIwLCAtMTUpXG4gICAgICAvLyBDZXNpdW0gbWVhc3VyZW1lbnQgZm9yIGRldGVybWluaW5nIGhvdyB0byByZW5kZXIgdGhlIHNpemUgb2YgdGhlIGxhYmVsIGJhc2VkIG9uIHpvb21cbiAgICAgIGNvbnN0IHNjYWxlWm9vbSA9IG5ldyBDZXNpdW0uTmVhckZhclNjYWxhcigxLjVlNCwgMS4wLCA4LjBlNiwgMC4wKVxuICAgICAgLy8gQ2VzaXVtIG1lYXN1cmVtZW50IGZvciBkZXRlcm1pbmluZyBob3cgdG8gcmVuZGVyIHRoZSB0cmFuc2x1Y2VuY3kgb2YgdGhlIGxhYmVsIGJhc2VkIG9uIHpvb21cbiAgICAgIGNvbnN0IHRyYW5zbHVjZW5jeVpvb20gPSBuZXcgQ2VzaXVtLk5lYXJGYXJTY2FsYXIoMS41ZTYsIDEuMCwgOC4wZTYsIDAuMClcbiAgICAgIGNvbnN0IGxhYmVsUmVmID0gbGFiZWxDb2xsZWN0aW9uLmFkZCh7XG4gICAgICAgIHRleHQ6IG9wdGlvbnMudGV4dCxcbiAgICAgICAgcG9zaXRpb246IGNhcnRlc2lhblBvc2l0aW9uLFxuICAgICAgICBpZDogb3B0aW9ucy5pZCxcbiAgICAgICAgcGl4ZWxPZmZzZXQ6IG9mZnNldCxcbiAgICAgICAgc2NhbGU6IDEuMCxcbiAgICAgICAgc2NhbGVCeURpc3RhbmNlOiBzY2FsZVpvb20sXG4gICAgICAgIHRyYW5zbHVjZW5jeUJ5RGlzdGFuY2U6IHRyYW5zbHVjZW5jeVpvb20sXG4gICAgICAgIGZpbGxDb2xvcjogQ2VzaXVtLkNvbG9yLkJMQUNLLFxuICAgICAgICBvdXRsaW5lQ29sb3I6IENlc2l1bS5Db2xvci5XSElURSxcbiAgICAgICAgb3V0bGluZVdpZHRoOiAxMCxcbiAgICAgICAgc3R5bGU6IENlc2l1bS5MYWJlbFN0eWxlLkZJTExfQU5EX09VVExJTkUsXG4gICAgICB9KVxuICAgICAgbWFwTW9kZWwuYWRkTGFiZWwobGFiZWxSZWYpXG4gICAgICByZXR1cm4gbGFiZWxSZWZcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBwb2x5bGluZSB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBsaW5lIGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRMaW5lKGxpbmU6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBsaW5lT2JqZWN0ID0gbGluZS5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT5cbiAgICAgICAgY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKVxuICAgICAgKVxuICAgICAgY29uc3QgY2FydFBvaW50cyA9IF8ubWFwKGxpbmVPYmplY3QsIChwb2ludCkgPT5cbiAgICAgICAgQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tRGVncmVlcyhcbiAgICAgICAgICBwb2ludC5sb25naXR1ZGUsXG4gICAgICAgICAgcG9pbnQubGF0aXR1ZGUsXG4gICAgICAgICAgcG9pbnQuYWx0aXR1ZGVcbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgY29uc3QgY2FydGVzaWFuID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNBcnJheVRvQ2FydGVzaWFuQXJyYXkoY2FydFBvaW50cylcbiAgICAgIGNvbnN0IHBvbHlsaW5lQ29sbGVjdGlvbiA9IG5ldyBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKClcbiAgICAgIHBvbHlsaW5lQ29sbGVjdGlvbi51bnNlbGVjdGVkTWF0ZXJpYWwgPSBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoXG4gICAgICAgICdQb2x5bGluZU91dGxpbmUnLFxuICAgICAgICB7XG4gICAgICAgICAgY29sb3I6IGRldGVybWluZUNlc2l1bUNvbG9yKG9wdGlvbnMuY29sb3IpLFxuICAgICAgICAgIG91dGxpbmVDb2xvcjogQ2VzaXVtLkNvbG9yLldISVRFLFxuICAgICAgICAgIG91dGxpbmVXaWR0aDogNCxcbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgcG9seWxpbmVDb2xsZWN0aW9uLnNlbGVjdGVkTWF0ZXJpYWwgPSBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoXG4gICAgICAgICdQb2x5bGluZU91dGxpbmUnLFxuICAgICAgICB7XG4gICAgICAgICAgY29sb3I6IGRldGVybWluZUNlc2l1bUNvbG9yKG9wdGlvbnMuY29sb3IpLFxuICAgICAgICAgIG91dGxpbmVDb2xvcjogQ2VzaXVtLkNvbG9yLkJMQUNLLFxuICAgICAgICAgIG91dGxpbmVXaWR0aDogNCxcbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgY29uc3QgcG9seWxpbmUgPSBwb2x5bGluZUNvbGxlY3Rpb24uYWRkKHtcbiAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgIG1hdGVyaWFsOiBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgICA/IHBvbHlsaW5lQ29sbGVjdGlvbi5zZWxlY3RlZE1hdGVyaWFsXG4gICAgICAgICAgOiBwb2x5bGluZUNvbGxlY3Rpb24udW5zZWxlY3RlZE1hdGVyaWFsLFxuICAgICAgICBpZDogb3B0aW9ucy5pZCxcbiAgICAgICAgcG9zaXRpb25zOiBjYXJ0ZXNpYW4sXG4gICAgICB9KVxuICAgICAgaWYgKG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IENlc2l1bS5zYW1wbGVUZXJyYWluKFxuICAgICAgICAgIG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIsXG4gICAgICAgICAgNSxcbiAgICAgICAgICBjYXJ0UG9pbnRzXG4gICAgICAgIClcbiAgICAgICAgQ2VzaXVtLndoZW4ocHJvbWlzZSwgKHVwZGF0ZWRDYXJ0b2dyYXBoaWM6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9XG4gICAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY0FycmF5VG9DYXJ0ZXNpYW5BcnJheShcbiAgICAgICAgICAgICAgdXBkYXRlZENhcnRvZ3JhcGhpY1xuICAgICAgICAgICAgKVxuICAgICAgICAgIGlmICh1cGRhdGVkQ2FydG9ncmFwaGljWzBdLmhlaWdodCAmJiAhb3B0aW9ucy52aWV3LmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICBwb2x5bGluZS5wb3NpdGlvbnMgPSBwb3NpdGlvbnNcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucHJpbWl0aXZlcy5hZGQocG9seWxpbmVDb2xsZWN0aW9uKVxuICAgICAgcmV0dXJuIHBvbHlsaW5lQ29sbGVjdGlvblxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIHBvbHlnb24gZmlsbCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2x5Z29uIGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQuXG4gICAgICAgICAgICAqL1xuICAgIGFkZFBvbHlnb24ocG9seWdvbjogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvbHlnb25PYmplY3QgPSBwb2x5Z29uLm1hcCgoY29vcmRpbmF0ZTogYW55KSA9PlxuICAgICAgICBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGUpXG4gICAgICApXG4gICAgICBjb25zdCBjYXJ0UG9pbnRzID0gXy5tYXAocG9seWdvbk9iamVjdCwgKHBvaW50KSA9PlxuICAgICAgICBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21EZWdyZWVzKFxuICAgICAgICAgIHBvaW50LmxvbmdpdHVkZSxcbiAgICAgICAgICBwb2ludC5sYXRpdHVkZSxcbiAgICAgICAgICBwb2ludC5hbHRpdHVkZVxuICAgICAgICApXG4gICAgICApXG4gICAgICBsZXQgY2FydGVzaWFuID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0b2dyYXBoaWNBcnJheVRvQ2FydGVzaWFuQXJyYXkoY2FydFBvaW50cylcbiAgICAgIGNvbnN0IHVuc2VsZWN0ZWRQb2x5Z29uUmVmID0gbWFwLmVudGl0aWVzLmFkZCh7XG4gICAgICAgIHBvbHlnb246IHtcbiAgICAgICAgICBoaWVyYXJjaHk6IGNhcnRlc2lhbixcbiAgICAgICAgICBtYXRlcmlhbDogbmV3IENlc2l1bS5HcmlkTWF0ZXJpYWxQcm9wZXJ0eSh7XG4gICAgICAgICAgICBjb2xvcjogQ2VzaXVtLkNvbG9yLldISVRFLFxuICAgICAgICAgICAgY2VsbEFscGhhOiAwLjAsXG4gICAgICAgICAgICBsaW5lQ291bnQ6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigyLCAyKSxcbiAgICAgICAgICAgIGxpbmVUaGlja25lc3M6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigyLjAsIDIuMCksXG4gICAgICAgICAgICBsaW5lT2Zmc2V0OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMC4wLCAwLjApLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHBlclBvc2l0aW9uSGVpZ2h0OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBzaG93OiB0cnVlLFxuICAgICAgICByZXN1bHRJZDogb3B0aW9ucy5pZCxcbiAgICAgICAgc2hvd1doZW5TZWxlY3RlZDogZmFsc2UsXG4gICAgICB9KVxuICAgICAgY29uc3Qgc2VsZWN0ZWRQb2x5Z29uUmVmID0gbWFwLmVudGl0aWVzLmFkZCh7XG4gICAgICAgIHBvbHlnb246IHtcbiAgICAgICAgICBoaWVyYXJjaHk6IGNhcnRlc2lhbixcbiAgICAgICAgICBtYXRlcmlhbDogbmV3IENlc2l1bS5HcmlkTWF0ZXJpYWxQcm9wZXJ0eSh7XG4gICAgICAgICAgICBjb2xvcjogQ2VzaXVtLkNvbG9yLkJMQUNLLFxuICAgICAgICAgICAgY2VsbEFscGhhOiAwLjAsXG4gICAgICAgICAgICBsaW5lQ291bnQ6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigyLCAyKSxcbiAgICAgICAgICAgIGxpbmVUaGlja25lc3M6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMigyLjAsIDIuMCksXG4gICAgICAgICAgICBsaW5lT2Zmc2V0OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoMC4wLCAwLjApLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHBlclBvc2l0aW9uSGVpZ2h0OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBzaG93OiBmYWxzZSxcbiAgICAgICAgcmVzdWx0SWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIHNob3dXaGVuU2VsZWN0ZWQ6IHRydWUsXG4gICAgICB9KVxuICAgICAgaWYgKG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IENlc2l1bS5zYW1wbGVUZXJyYWluKFxuICAgICAgICAgIG1hcC5zY2VuZS50ZXJyYWluUHJvdmlkZXIsXG4gICAgICAgICAgNSxcbiAgICAgICAgICBjYXJ0UG9pbnRzXG4gICAgICAgIClcbiAgICAgICAgQ2VzaXVtLndoZW4ocHJvbWlzZSwgKHVwZGF0ZWRDYXJ0b2dyYXBoaWM6IGFueSkgPT4ge1xuICAgICAgICAgIGNhcnRlc2lhbiA9XG4gICAgICAgICAgICBtYXAuc2NlbmUuZ2xvYmUuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY0FycmF5VG9DYXJ0ZXNpYW5BcnJheShcbiAgICAgICAgICAgICAgdXBkYXRlZENhcnRvZ3JhcGhpY1xuICAgICAgICAgICAgKVxuICAgICAgICAgIGlmICh1cGRhdGVkQ2FydG9ncmFwaGljWzBdLmhlaWdodCAmJiAhb3B0aW9ucy52aWV3LmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICB1bnNlbGVjdGVkUG9seWdvblJlZi5wb2x5Z29uLmhpZXJhcmNoeS5zZXRWYWx1ZShjYXJ0ZXNpYW4pXG4gICAgICAgICAgICBzZWxlY3RlZFBvbHlnb25SZWYucG9seWdvbi5oaWVyYXJjaHkuc2V0VmFsdWUoY2FydGVzaWFuKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBbdW5zZWxlY3RlZFBvbHlnb25SZWYsIHNlbGVjdGVkUG9seWdvblJlZl1cbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byByZWZsZWN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIHNlbGVjdGVkLlxuICAgICAgICAgICAgIE9wdGlvbnMgcGFzc2VkIGluIGFyZSBjb2xvciBhbmQgaXNTZWxlY3RlZC5cbiAgICAgICAgICAgICovXG4gICAgdXBkYXRlQ2x1c3RlcihnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGdlb21ldHJ5KSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVDbHVzdGVyKGlubmVyR2VvbWV0cnksIG9wdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5CaWxsYm9hcmQpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgICAgICBnZW9tZXRyeS5pbWFnZSA9IGdlb21ldHJ5LnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAncGFydGlhbGx5JzpcbiAgICAgICAgICAgIGdlb21ldHJ5LmltYWdlID0gZ2VvbWV0cnkucGFydGlhbGx5U2VsZWN0ZWRJbWFnZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICd1bnNlbGVjdGVkJzpcbiAgICAgICAgICAgIGdlb21ldHJ5LmltYWdlID0gZ2VvbWV0cnkudW5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBvcHRpb25zLmlzU2VsZWN0ZWQgIT09ICd1bnNlbGVjdGVkJ1xuICAgICAgICBnZW9tZXRyeS5leWVPZmZzZXQgPSBuZXcgQ2VzaXVtLkNhcnRlc2lhbjMoMCwgMCwgaXNTZWxlY3RlZCA/IC0xIDogMClcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgZ2VvbWV0cnkuX3BvbHlsaW5lcy5mb3JFYWNoKChwb2x5bGluZTogYW55KSA9PiB7XG4gICAgICAgICAgcG9seWxpbmUubWF0ZXJpYWwgPSBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoJ1BvbHlsaW5lT3V0bGluZScsIHtcbiAgICAgICAgICAgIGNvbG9yOiBkZXRlcm1pbmVDZXNpdW1Db2xvcigncmdiYSgwLDAsMCwgLjEpJyksXG4gICAgICAgICAgICBvdXRsaW5lQ29sb3I6IGRldGVybWluZUNlc2l1bUNvbG9yKCdyZ2JhKDI1NSwyNTUsMjU1LCAuMSknKSxcbiAgICAgICAgICAgIG91dGxpbmVXaWR0aDogNCxcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5zaG93V2hlblNlbGVjdGVkKSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlb21ldHJ5LnNob3cgPSAhb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIHJlZmxlY3Qgd2hldGhlciBvciBub3QgaXQgaXMgc2VsZWN0ZWQuXG4gICAgICAgICAgICAgIE9wdGlvbnMgcGFzc2VkIGluIGFyZSBjb2xvciBhbmQgaXNTZWxlY3RlZC5cbiAgICAgICAgICAgICAgKi9cbiAgICB1cGRhdGVHZW9tZXRyeShnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGdlb21ldHJ5KSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVHZW9tZXRyeShpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uQmlsbGJvYXJkKSB7XG4gICAgICAgIGdlb21ldHJ5LmltYWdlID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgICAgPyBnZW9tZXRyeS5zZWxlY3RlZEltYWdlXG4gICAgICAgICAgOiBnZW9tZXRyeS51bnNlbGVjdGVkSW1hZ2VcbiAgICAgICAgZ2VvbWV0cnkuZXllT2Zmc2V0ID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgMCxcbiAgICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWQgPyAtMSA6IDBcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkxhYmVsKSB7XG4gICAgICAgIGdlb21ldHJ5LmlzU2VsZWN0ZWQgPSBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgc2hvd0hpZGVMYWJlbCh7XG4gICAgICAgICAgZ2VvbWV0cnksXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKSB7XG4gICAgICAgIGdlb21ldHJ5Ll9wb2x5bGluZXMuZm9yRWFjaCgocG9seWxpbmU6IGFueSkgPT4ge1xuICAgICAgICAgIHBvbHlsaW5lLm1hdGVyaWFsID0gb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgICAgICA/IGdlb21ldHJ5LnNlbGVjdGVkTWF0ZXJpYWxcbiAgICAgICAgICAgIDogZ2VvbWV0cnkudW5zZWxlY3RlZE1hdGVyaWFsXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnNob3dXaGVuU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2VvbWV0cnkuc2hvdyA9IG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2VvbWV0cnkuc2hvdyA9ICFvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byBiZSBoaWRkZW5cbiAgICAgICAgICAgICAqL1xuICAgIGhpZGVHZW9tZXRyeShnZW9tZXRyeTogYW55KSB7XG4gICAgICBpZiAoXG4gICAgICAgIGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uQmlsbGJvYXJkIHx8XG4gICAgICAgIGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uTGFiZWxcbiAgICAgICkge1xuICAgICAgICBnZW9tZXRyeS5zaG93ID0gZmFsc2VcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5Qb2x5bGluZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgZ2VvbWV0cnkuX3BvbHlsaW5lcy5mb3JFYWNoKChwb2x5bGluZTogYW55KSA9PiB7XG4gICAgICAgICAgcG9seWxpbmUuc2hvdyA9IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgc2hvd25cbiAgICAgICAgICAgICAqL1xuICAgIHNob3dHZW9tZXRyeShnZW9tZXRyeTogYW55KSB7XG4gICAgICBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5CaWxsYm9hcmQpIHtcbiAgICAgICAgZ2VvbWV0cnkuc2hvdyA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkuY29uc3RydWN0b3IgPT09IENlc2l1bS5MYWJlbCkge1xuICAgICAgICBzaG93SGlkZUxhYmVsKHtcbiAgICAgICAgICBnZW9tZXRyeSxcbiAgICAgICAgICBmaW5kU2VsZWN0ZWQ6IHRydWUsXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uUG9seWxpbmVDb2xsZWN0aW9uKSB7XG4gICAgICAgIGdlb21ldHJ5Ll9wb2x5bGluZXMuZm9yRWFjaCgocG9seWxpbmU6IGFueSkgPT4ge1xuICAgICAgICAgIHBvbHlsaW5lLnNob3cgPSB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBtYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgfSxcbiAgICByZW1vdmVHZW9tZXRyeShnZW9tZXRyeTogYW55KSB7XG4gICAgICBiaWxsYm9hcmRDb2xsZWN0aW9uLnJlbW92ZShnZW9tZXRyeSlcbiAgICAgIGxhYmVsQ29sbGVjdGlvbi5yZW1vdmUoZ2VvbWV0cnkpXG4gICAgICBtYXAuc2NlbmUucHJpbWl0aXZlcy5yZW1vdmUoZ2VvbWV0cnkpXG4gICAgICAvL3VubWluaWZpZWQgY2VzaXVtIGNob2tlcyBpZiB5b3UgZmVlZCBhIGdlb21ldHJ5IHdpdGggaWQgYXMgYW4gQXJyYXlcbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQ2VzaXVtLkVudGl0eSkge1xuICAgICAgICBtYXAuZW50aXRpZXMucmVtb3ZlKGdlb21ldHJ5KVxuICAgICAgfVxuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBDZXNpdW0uTGFiZWwpIHtcbiAgICAgICAgbWFwTW9kZWwucmVtb3ZlTGFiZWwoZ2VvbWV0cnkpXG4gICAgICAgIHNob3dIaWRkZW5MYWJlbChnZW9tZXRyeSlcbiAgICAgIH1cbiAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICB9LFxuICAgIGRlc3Ryb3lTaGFwZXMoKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcbiAgICAgICAgc2hhcGUuZGVzdHJveSgpXG4gICAgICB9KVxuICAgICAgc2hhcGVzID0gW11cbiAgICAgIGlmIChtYXAgJiYgbWFwLnNjZW5lKSB7XG4gICAgICAgIG1hcC5zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldE1hcCgpIHtcbiAgICAgIHJldHVybiBtYXBcbiAgICB9LFxuICAgIHpvb21JbigpIHtcbiAgICAgIGNvbnN0IGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljID1cbiAgICAgICAgbWFwLnNjZW5lLmdsb2JlLmVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyhcbiAgICAgICAgICBtYXAuc2NlbmUuY2FtZXJhLnBvc2l0aW9uXG4gICAgICAgIClcblxuICAgICAgY29uc3QgdGVycmFpbkhlaWdodCA9IG1hcC5zY2VuZS5nbG9iZS5nZXRIZWlnaHQoXG4gICAgICAgIGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljXG4gICAgICApXG5cbiAgICAgIGNvbnN0IGhlaWdodEFib3ZlR3JvdW5kID1cbiAgICAgICAgY2FtZXJhUG9zaXRpb25DYXJ0b2dyYXBoaWMuaGVpZ2h0IC0gdGVycmFpbkhlaWdodFxuXG4gICAgICBjb25zdCB6b29tQW1vdW50ID0gaGVpZ2h0QWJvdmVHcm91bmQgLyAyIC8vIGJhc2ljYWxseSBkb3VibGUgdGhlIGN1cnJlbnQgem9vbVxuXG4gICAgICBjb25zdCBtYXhab29tQW1vdW50ID0gaGVpZ2h0QWJvdmVHcm91bmQgLSBtaW5pbXVtSGVpZ2h0QWJvdmVUZXJyYWluXG5cbiAgICAgIC8vIGlmIHRoZSB6b29tIGFtb3VudCBpcyBncmVhdGVyIHRoYW4gdGhlIG1heCB6b29tIGFtb3VudCwgem9vbSB0byB0aGUgbWF4IHpvb20gYW1vdW50XG4gICAgICBtYXAuc2NlbmUuY2FtZXJhLnpvb21JbihNYXRoLm1pbihtYXhab29tQW1vdW50LCB6b29tQW1vdW50KSlcbiAgICB9LFxuICAgIHpvb21PdXQoKSB7XG4gICAgICBjb25zdCBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpYyA9XG4gICAgICAgIG1hcC5zY2VuZS5nbG9iZS5lbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoXG4gICAgICAgICAgbWFwLnNjZW5lLmNhbWVyYS5wb3NpdGlvblxuICAgICAgICApXG5cbiAgICAgIGNvbnN0IHRlcnJhaW5IZWlnaHQgPSBtYXAuc2NlbmUuZ2xvYmUuZ2V0SGVpZ2h0KFxuICAgICAgICBjYW1lcmFQb3NpdGlvbkNhcnRvZ3JhcGhpY1xuICAgICAgKVxuXG4gICAgICBjb25zdCBoZWlnaHRBYm92ZUdyb3VuZCA9XG4gICAgICAgIGNhbWVyYVBvc2l0aW9uQ2FydG9ncmFwaGljLmhlaWdodCAtIHRlcnJhaW5IZWlnaHRcbiAgICAgIG1hcC5zY2VuZS5jYW1lcmEuem9vbU91dChoZWlnaHRBYm92ZUdyb3VuZClcbiAgICB9LFxuICAgIGRlc3Ryb3koKSB7XG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC5vZmYoJ21hcDpyZXF1ZXN0UmVuZGVyJywgcmVxdWVzdFJlbmRlckhhbmRsZXIpXG4gICAgICBtYXAuZGVzdHJveSgpXG4gICAgfSxcbiAgfVxuICByZXR1cm4gZXhwb3NlZE1ldGhvZHNcbn1cbiJdfQ==