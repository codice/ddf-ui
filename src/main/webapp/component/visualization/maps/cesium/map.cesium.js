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
import Map from '../map';
import utility from './utility';
import DrawingUtility from '../DrawingUtility';
import wreqr from '../../../../js/wreqr';
import properties from '../../../../js/properties';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium';
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper';
import { CesiumImageryProviderTypes, CesiumLayers, } from '../../../../js/controllers/cesium.layers';
import user from '../../../singletons/user-instance';
import User from '../../../../js/model/User';
import { Drawing } from '../../../singletons/drawing';
var defaultColor = '#3c6dd5';
var eyeOffset = new Cesium.Cartesian3(0, 0, 0);
var pixelOffset = new Cesium.Cartesian2(0.0, 0);
var rulerColor = new Cesium.Color(0.31, 0.43, 0.52);
var rulerPointColor = '#506f85';
var rulerLineHeight = 0;
Cesium.BingMapsApi.defaultKey = properties.bingKey || 0;
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
function createMap(insertionElement) {
    var layerPrefs = user.get('user>preferences>mapLayers');
    User.updateMapLayers(layerPrefs);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    var layerCollectionController = new CesiumLayers({
        collection: layerPrefs
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
            mapMode2D: 0
        }
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
    setupTerrainProvider(viewer, properties.terrainProvider);
    return {
        map: viewer,
        requestRenderHandler: requestRender
    };
}
function determineIdFromPosition(position, map) {
    var id;
    var pickedObject = map.scene.pick(position);
    if (pickedObject) {
        id = pickedObject.id;
        if (id && id.constructor === Cesium.Entity) {
            id = id.resultId;
        }
    }
    return id;
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
        altitude: coordinate[2]
    };
}
function isNotVisible(cartesian3CenterOfGeometry, occluder) {
    return !occluder.isPointVisible(cartesian3CenterOfGeometry);
}
export default function CesiumMap(insertionElement, selectionInterface, _notificationEl, componentElement, mapModel) {
    var overlays = {};
    var shapes = [];
    var _a = createMap(insertionElement), map = _a.map, requestRenderHandler = _a.requestRenderHandler;
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
                lon: cartographic.longitude * Cesium.Math.DEGREES_PER_RADIAN
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
    var exposedMethods = _.extend({}, Map, {
        onLeftClick: function (callback) {
            $(map.scene.canvas).on('click', function (e) {
                var boundingRect = map.scene.canvas.getBoundingClientRect();
                callback(e, {
                    mapTarget: determineIdFromPosition({
                        x: e.clientX - boundingRect.left,
                        y: e.clientY - boundingRect.top
                    }, map)
                });
            });
        },
        onRightClick: function (callback) {
            $(map.scene.canvas).on('contextmenu', function (e) {
                callback(e);
            });
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
                callback(e, {
                    mapTarget: determineIdFromPosition({
                        x: e.clientX - boundingRect.left,
                        y: e.clientY - boundingRect.top
                    }, map)
                });
            });
        },
        timeoutIds: [],
        onCameraMoveStart: function (callback) {
            clearTimeout(this.timeoutId);
            this.timeoutIds.forEach(function (timeoutId) {
                clearTimeout(timeoutId);
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
                _this.timeoutIds.push(setTimeout(function () {
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
                    correction: 1.0
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
                destination: coords
            });
        },
        panToExtent: function () { },
        panToShapesExtent: function () {
            var currentPrimitives = map.scene.primitives._primitives.filter(function (prim) { return prim.id; });
            var actualPositions = currentPrimitives.reduce(function (blob, prim) {
                return blob.concat(prim._polylines.reduce(function (subblob, polyline) {
                    return subblob.concat(polyline._actualPositions);
                }, []));
            }, []);
            if (actualPositions.length > 0) {
                map.scene.camera.flyTo({
                    duration: 0.5,
                    destination: Cesium.Rectangle.fromCartesianArray(actualPositions),
                    orientation: {
                        heading: map.scene.camera.heading,
                        pitch: map.scene.camera.pitch,
                        roll: map.scene.camera.roll
                    }
                });
                return true;
            }
            return false;
        },
        panToRectangle: function (rectangle, opts) {
            if (opts === void 0) { opts = {
                duration: 0.5,
                correction: 0.25
            }; }
            map.scene.camera.flyTo({
                duration: opts.duration,
                destination: getDestinationForVisiblePan(rectangle, map),
                complete: function () {
                    map.scene.camera.flyTo({
                        duration: opts.correction,
                        destination: getDestinationForVisiblePan(rectangle, map)
                    });
                }
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
                destination: Cesium.Rectangle.fromDegrees(west, south, east, north)
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
                rectangle: rectangle
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
                    icon: null
                }),
                view: this
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
                    material: rulerColor
                }
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
                eyeOffset: eyeOffset
            });
            billboardRef.unselectedImage = DrawingUtility.getCircleWithText({
                fillColor: options.color,
                text: options.id.length,
                strokeColor: 'white',
                textColor: 'white'
            });
            billboardRef.partiallySelectedImage = DrawingUtility.getCircleWithText({
                fillColor: options.color,
                text: options.id.length,
                strokeColor: 'black',
                textColor: 'white'
            });
            billboardRef.selectedImage = DrawingUtility.getCircleWithText({
                fillColor: options.color,
                text: options.id.length,
                strokeColor: 'black',
                textColor: 'black'
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
                view: options.view
            });
            billboardRef.unselectedImage = DrawingUtility.getPin({
                fillColor: options.color,
                icon: options.icon
            });
            billboardRef.selectedImage = DrawingUtility.getPin({
                fillColor: options.color,
                strokeColor: 'black',
                icon: options.icon
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
                style: Cesium.LabelStyle.FILL_AND_OUTLINE
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
                outlineWidth: 4
            });
            polylineCollection.selectedMaterial = Cesium.Material.fromType('PolylineOutline', {
                color: determineCesiumColor(options.color),
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 4
            });
            var polyline = polylineCollection.add({
                width: 8,
                material: options.isSelected
                    ? polylineCollection.selectedMaterial
                    : polylineCollection.unselectedMaterial,
                id: options.id,
                positions: cartesian
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
                        lineOffset: new Cesium.Cartesian2(0.0, 0.0)
                    }),
                    perPositionHeight: true
                },
                show: true,
                resultId: options.id,
                showWhenSelected: false
            });
            var selectedPolygonRef = map.entities.add({
                polygon: {
                    hierarchy: cartesian,
                    material: new Cesium.GridMaterialProperty({
                        color: Cesium.Color.BLACK,
                        cellAlpha: 0.0,
                        lineCount: new Cesium.Cartesian2(2, 2),
                        lineThickness: new Cesium.Cartesian2(2.0, 2.0),
                        lineOffset: new Cesium.Cartesian2(0.0, 0.0)
                    }),
                    perPositionHeight: true
                },
                show: false,
                resultId: options.id,
                showWhenSelected: true
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
                        outlineWidth: 4
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
                    geometry: geometry
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
                    findSelected: true
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
            map.scene.camera.zoomIn(map.scene.camera.defaultZoomAmount * 10);
        },
        zoomOut: function () {
            map.scene.camera.zoomOut(map.scene.camera.defaultZoomAmount * 10);
        },
        destroy: function () {
            ;
            wreqr.vent.off('map:requestRender', requestRenderHandler);
            map.destroy();
        }
    });
    return exposedMethods;
}
//# sourceMappingURL=map.cesium.js.map