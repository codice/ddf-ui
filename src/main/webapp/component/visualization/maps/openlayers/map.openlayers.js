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
/* global require, window */
import wrapNum from '../../../../react-component/utils/wrap-num/wrap-num';
import $ from 'jquery';
import _ from 'underscore';
import utility from './utility';
import DrawingUtility from '../DrawingUtility';
import { MultiLineString, LineString, Polygon, Point } from 'ol/geom';
import { get, transform as projTransform } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Stroke, Icon, Text as olText, Fill } from 'ol/style';
import Style from 'ol/style/Style';
import { Image as ImageLayer } from 'ol/layer';
import { ImageStatic as ImageStaticSource } from 'ol/source';
import { DragPan } from 'ol/interaction';
import { OpenlayersLayers } from '../../../../js/controllers/openlayers.layers';
import wreqr from '../../../../js/wreqr';
import { validateGeo } from '../../../../react-component/utils/validation';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
import _debounce from 'lodash.debounce';
import Group from 'ol/layer/Group';
import { boundingExtent, createEmpty, extend } from 'ol/extent';
import { getLength } from 'ol/sphere';
var defaultColor = '#3c6dd5';
function createMap(insertionElement, mapLayers) {
    var layerCollectionController = new OpenlayersLayers({
        collection: mapLayers,
    });
    var map = layerCollectionController.makeMap({
        zoom: 2.7,
        minZoom: 2.3,
        center: [0, 0],
        element: insertionElement,
    });
    return map;
}
function determineIdFromPosition(position, map) {
    var features = [];
    map.forEachFeatureAtPixel(position, function (feature) {
        features.push(feature);
    });
    if (features.length > 0) {
        return features[0].getId();
    }
}
function determineIdsFromPosition(position, map) {
    var features = [];
    var id, locationId;
    map.forEachFeatureAtPixel(position, function (feature) {
        features.push(feature);
    });
    if (features.length > 0) {
        id = features[0].getId();
        locationId = features[0].get('locationId');
    }
    return { id: id, locationId: locationId };
}
function convertPointCoordinate(point) {
    var coords = [point[0], point[1]];
    return projTransform(coords, 'EPSG:4326', StartupDataStore.Configuration.getProjection());
}
function unconvertPointCoordinate(point) {
    return projTransform(point, StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
}
// @ts-expect-error ts-migrate(6133) FIXME: 'longitude' is declared but its value is never rea... Remove this comment to see the full error message
function offMap(_a) {
    var _b = __read(_a, 2), longitude = _b[0], latitude = _b[1];
    return latitude < -90 || latitude > 90;
}
// The extension argument is a function used in panToExtent
// It allows for customization of the way the map pans to results
export default function (insertionElement, _selectionInterface, _notificationEl, _componentElement, mapModel, mapLayers) {
    var overlays = {};
    var shapes = [];
    var map = createMap(insertionElement, mapLayers);
    setupTooltip(map);
    function setupTooltip(map) {
        map.on('pointermove', function (e) {
            var point = unconvertPointCoordinate(e.coordinate);
            if (!offMap(point)) {
                mapModel.updateMouseCoordinates({
                    lat: point[1],
                    lon: point[0],
                });
            }
            else {
                mapModel.clearMouseCoordinates();
            }
        });
    }
    function resizeMap() {
        map.updateSize();
    }
    var debouncedResizeMap = _debounce(resizeMap, 250);
    function listenToResize() {
        ;
        wreqr.vent.on('resize', debouncedResizeMap);
        window.addEventListener('resize', debouncedResizeMap);
    }
    function unlistenToResize() {
        ;
        wreqr.vent.off('resize', debouncedResizeMap);
        window.removeEventListener('resize', debouncedResizeMap);
    }
    listenToResize();
    var geoDragDownListener;
    var geoDragMoveListener;
    var geoDragUpListener;
    var leftClickMapAPIListener;
    var exposedMethods = {
        onMouseTrackingForGeoDrag: function (_a) {
            var moveFrom = _a.moveFrom, down = _a.down, move = _a.move, up = _a.up;
            // disable panning of the map
            map.getInteractions().forEach(function (interaction) {
                if (interaction instanceof DragPan) {
                    interaction.setActive(false);
                }
            });
            // enable dragging individual features
            geoDragDownListener = function (event) {
                var locationId = determineIdsFromPosition(event.pixel, map).locationId;
                var coordinates = map.getCoordinateFromPixel(event.pixel);
                var position = { latitude: coordinates[1], longitude: coordinates[0] };
                down({ position: position, mapLocationId: locationId });
            };
            map.on('pointerdown', geoDragDownListener);
            geoDragMoveListener = function (event) {
                var locationId = determineIdsFromPosition(event.pixel, map).locationId;
                var coordinates = map.getCoordinateFromPixel(event.pixel);
                var translation = moveFrom
                    ? {
                        latitude: coordinates[1] - moveFrom.latitude,
                        longitude: coordinates[0] - moveFrom.longitude,
                    }
                    : null;
                move({ translation: translation, mapLocationId: locationId });
            };
            map.on('pointerdrag', geoDragMoveListener);
            geoDragUpListener = up;
            map.on('pointerup', geoDragUpListener);
        },
        clearMouseTrackingForGeoDrag: function () {
            // re-enable panning
            map.getInteractions().forEach(function (interaction) {
                if (interaction instanceof DragPan) {
                    interaction.setActive(true);
                }
            });
            if (geoDragDownListener) {
                map.un('pointerdown', geoDragDownListener);
            }
            if (geoDragMoveListener) {
                map.un('pointerdrag', geoDragMoveListener);
            }
            if (geoDragUpListener) {
                map.un('pointerup', geoDragUpListener);
            }
        },
        onLeftClickMapAPI: function (callback) {
            leftClickMapAPIListener = function (event) {
                var locationId = determineIdsFromPosition(event.pixel, map).locationId;
                callback(locationId);
            };
            map.on('singleclick', leftClickMapAPIListener);
        },
        clearLeftClickMapAPI: function () {
            map.un('singleclick', leftClickMapAPIListener);
        },
        onLeftClick: function (callback) {
            $(map.getTargetElement()).on('click', function (e) {
                var boundingRect = map.getTargetElement().getBoundingClientRect();
                callback(e, {
                    mapTarget: determineIdFromPosition([e.clientX - boundingRect.left, e.clientY - boundingRect.top], map),
                });
            });
        },
        onRightClick: function (callback) {
            $(map.getTargetElement()).on('contextmenu', function (e) {
                callback(e);
            });
        },
        clearRightClick: function () {
            $(map.getTargetElement()).off('contextmenu');
        },
        onDoubleClick: function () {
            $(map.getTargetElement()).on('dblclick', function (e) {
                var boundingRect = map.getTargetElement().getBoundingClientRect();
                var locationId = determineIdsFromPosition([e.clientX - boundingRect.left, e.clientY - boundingRect.top], map).locationId;
                if (locationId) {
                    ;
                    wreqr.vent.trigger('location:doubleClick', locationId);
                }
            });
        },
        clearDoubleClick: function () {
            $(map.getTargetElement()).off('dblclick');
        },
        onMouseTrackingForPopup: function (downCallback, moveCallback, upCallback) {
            $(map.getTargetElement()).on('mousedown', function () {
                downCallback();
            });
            $(map.getTargetElement()).on('mousemove', function () {
                moveCallback();
            });
            this.onLeftClick(upCallback);
        },
        onMouseMove: function (callback) {
            $(map.getTargetElement()).on('mousemove', function (e) {
                var boundingRect = map.getTargetElement().getBoundingClientRect();
                var position = [
                    e.clientX - boundingRect.left,
                    e.clientY - boundingRect.top,
                ];
                var locationId = determineIdsFromPosition(position, map).locationId;
                callback(e, {
                    mapTarget: determineIdFromPosition(position, map),
                    mapLocationId: locationId,
                });
            });
        },
        clearMouseMove: function () {
            $(map.getTargetElement()).off('mousemove');
        },
        timeoutIds: [],
        onCameraMoveStart: function (callback) {
            this.timeoutIds.forEach(function (timeoutId) {
                window.clearTimeout(timeoutId);
            });
            this.timeoutIds = [];
            map.addEventListener('movestart', callback);
        },
        offCameraMoveStart: function (callback) {
            map.removeEventListener('movestart', callback);
        },
        onCameraMoveEnd: function (callback) {
            var _this = this;
            var timeoutCallback = function () {
                _this.timeoutIds.push(window.setTimeout(function () {
                    callback();
                }, 300));
            };
            map.addEventListener('moveend', timeoutCallback);
        },
        offCameraMoveEnd: function (callback) {
            map.removeEventListener('moveend', callback);
        },
        doPanZoom: function (coords) {
            var that = this;
            that.panZoomOut({ duration: 1000 }, function () {
                setTimeout(function () {
                    that.zoomToExtent(coords, { duration: 2000 });
                }, 0);
            });
        },
        panZoomOut: function (_opts, next) {
            next();
        },
        panToResults: function (results) {
            var coordinates = _.flatten(results.map(function (result) { return result.getPoints(); }), true);
            this.panToExtent(coordinates);
        },
        panToExtent: function (coords) {
            if (Array.isArray(coords) && coords.length > 0) {
                var lineObject = coords.map(function (coordinate) {
                    return convertPointCoordinate(coordinate);
                });
                var extent = boundingExtent(lineObject);
                map.getView().fit(extent, {
                    size: map.getSize(),
                    maxZoom: map.getView().getZoom(),
                    duration: 500,
                    padding: [50, 50, 50, 50],
                });
            }
        },
        getExtentOfIds: function (ids) {
            var extent = createEmpty();
            map.getLayers().forEach(function (layer) {
                // might need to handle groups later, but no reason to yet
                if (layer instanceof VectorLayer && ids.includes(layer.get('id'))) {
                    extend(extent, layer.getSource().getExtent());
                }
            });
            if (extent[0] === Infinity) {
                throw new Error('No extent found for ids');
            }
            return extent;
        },
        zoomToIds: function (_a) {
            var ids = _a.ids, _b = _a.duration, duration = _b === void 0 ? 500 : _b;
            map.getView().fit(this.getExtentOfIds(ids), {
                duration: duration,
            });
        },
        panToShapesExtent: function (_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.duration, duration = _c === void 0 ? 500 : _c;
            var extent = createEmpty();
            map.getLayers().forEach(function (layer) {
                if (layer instanceof Group) {
                    layer.getLayers().forEach(function (groupLayer) {
                        //If this is a vector layer, add it to our extent
                        if (layer instanceof VectorLayer)
                            extend(extent, groupLayer.getSource().getExtent());
                    });
                }
                else if (layer instanceof VectorLayer && layer.get('id')) {
                    extend(extent, layer.getSource().getExtent());
                }
            });
            if (extent[0] !== Infinity) {
                map.getView().fit(extent, {
                    duration: duration,
                });
            }
        },
        getShapes: function () {
            return shapes;
        },
        zoomToExtent: function (coords, opts) {
            if (opts === void 0) { opts = {}; }
            var lineObject = coords.map(function (coordinate) {
                return convertPointCoordinate(coordinate);
            });
            var extent = boundingExtent(lineObject);
            map.getView().fit(extent, __assign({ size: map.getSize(), maxZoom: map.getView().getZoom(), duration: 500 }, opts));
        },
        zoomToBoundingBox: function (_a) {
            var north = _a.north, east = _a.east, south = _a.south, west = _a.west;
            this.zoomToExtent([
                [west, south],
                [east, north],
            ]);
        },
        limit: function (value, min, max) {
            return Math.min(Math.max(value, min), max);
        },
        getBoundingBox: function () {
            var extent = map.getView().calculateExtent(map.getSize());
            var longitudeEast = wrapNum(extent[2], -180, 180);
            var longitudeWest = wrapNum(extent[0], -180, 180);
            //add 360 degrees to longitudeEast to accommodate bounding boxes that span across the anti-meridian
            if (longitudeEast < longitudeWest) {
                longitudeEast += 360;
            }
            return {
                north: this.limit(extent[3], -90, 90),
                east: longitudeEast,
                south: this.limit(extent[1], -90, 90),
                west: longitudeWest,
            };
        },
        overlayImage: function (model) {
            var metacardId = model.plain.id;
            this.removeOverlay(metacardId);
            var coords = model.getPoints('location');
            var array = _.map(coords, function (coord) { return convertPointCoordinate(coord); });
            var polygon = new Polygon([array]);
            var extent = polygon.getExtent();
            var projection = get(StartupDataStore.Configuration.getProjection());
            var overlayLayer = new ImageLayer({
                source: new ImageStaticSource({
                    url: model.currentOverlayUrl || '',
                    projection: projection,
                    imageExtent: extent,
                }),
            });
            map.addLayer(overlayLayer);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            overlays[metacardId] = overlayLayer;
        },
        removeOverlay: function (metacardId) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (overlays[metacardId]) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                map.removeLayer(overlays[metacardId]);
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                delete overlays[metacardId];
            }
        },
        removeAllOverlays: function () {
            for (var overlay in overlays) {
                if (overlays.hasOwnProperty(overlay)) {
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    map.removeLayer(overlays[overlay]);
                }
            }
            overlays = {};
        },
        getCartographicCenterOfClusterInDegrees: function (cluster) {
            return utility.calculateCartographicCenterOfGeometriesInDegrees(cluster.results);
        },
        getWindowLocationsOfResults: function (results) {
            return results.map(function (result) {
                var openlayersCenterOfGeometry = utility.calculateOpenlayersCenterOfGeometry(result);
                var center = map.getPixelFromCoordinate(openlayersCenterOfGeometry);
                if (center) {
                    return center;
                }
                else {
                    return undefined;
                }
            });
        },
        /*
         * Calculates the distance (in meters) between the two positions in the given array of
         * Coordinates.
         */
        calculateDistanceBetweenPositions: function (coords) {
            var line = new LineString(coords);
            var sphereLength = getLength(line);
            return sphereLength;
        },
        /*
                Adds a billboard point utilizing the passed in point and options.
                Options are a view to relate to, and an id, and a color.
            */
        addPointWithText: function (point, options) {
            var pointObject = convertPointCoordinate(point);
            var feature = new Feature({
                geometry: new Point(pointObject),
            });
            var badgeOffset = options.badgeOptions ? 8 : 0;
            var imgWidth = 44 + badgeOffset;
            var imgHeight = 44 + badgeOffset;
            feature.setId(options.id);
            feature.set('unselectedStyle', new Style({
                image: new Icon({
                    img: DrawingUtility.getCircleWithText({
                        fillColor: options.color,
                        text: options.id.length,
                        badgeOptions: options.badgeOptions,
                    }),
                    width: imgWidth,
                    height: imgHeight,
                }),
            }));
            feature.set('partiallySelectedStyle', new Style({
                image: new Icon({
                    img: DrawingUtility.getCircleWithText({
                        fillColor: options.color,
                        text: options.id.length,
                        strokeColor: 'black',
                        textColor: 'white',
                        badgeOptions: options.badgeOptions,
                    }),
                    width: imgWidth,
                    height: imgHeight,
                }),
            }));
            feature.set('selectedStyle', new Style({
                image: new Icon({
                    img: DrawingUtility.getCircleWithText({
                        fillColor: 'orange',
                        text: options.id.length,
                        strokeColor: 'white',
                        textColor: 'white',
                        badgeOptions: options.badgeOptions,
                    }),
                    width: imgWidth,
                    height: imgHeight,
                }),
            }));
            switch (options.isSelected) {
                case 'selected':
                    feature.setStyle(feature.get('selectedStyle'));
                    break;
                case 'partially':
                    feature.setStyle(feature.get('partiallySelectedStyle'));
                    break;
                case 'unselected':
                    feature.setStyle(feature.get('unselectedStyle'));
                    break;
            }
            var vectorSource = new VectorSource({
                features: [feature],
            });
            var vectorLayer = new VectorLayer({
                source: vectorSource,
                zIndex: 1,
            });
            map.addLayer(vectorLayer);
            return vectorLayer;
        },
        /*
                  Adds a billboard point utilizing the passed in point and options.
                  Options are a view to relate to, and an id, and a color.
                */
        addPoint: function (point, options) {
            var pointObject = convertPointCoordinate(point);
            var feature = new Feature({
                geometry: new Point(pointObject),
                name: options.title,
            });
            feature.setId(options.id);
            var badgeOffset = options.badgeOptions ? 8 : 0;
            var x = 39 + badgeOffset, y = 40 + badgeOffset;
            if (options.size) {
                x = options.size.x;
                y = options.size.y;
            }
            feature.set('unselectedStyle', new Style({
                image: new Icon({
                    img: DrawingUtility.getPin({
                        fillColor: options.color,
                        icon: options.icon,
                        badgeOptions: options.badgeOptions,
                    }),
                    width: x,
                    height: y,
                    anchor: [x / 2 - badgeOffset / 2, 0],
                    anchorOrigin: 'bottom-left',
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                }),
            }));
            feature.set('selectedStyle', new Style({
                image: new Icon({
                    img: DrawingUtility.getPin({
                        fillColor: 'orange',
                        icon: options.icon,
                        badgeOptions: options.badgeOptions,
                    }),
                    width: x,
                    height: y,
                    anchor: [x / 2 - badgeOffset / 2, 0],
                    anchorOrigin: 'bottom-left',
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                }),
            }));
            feature.setStyle(options.isSelected
                ? feature.get('selectedStyle')
                : feature.get('unselectedStyle'));
            var vectorSource = new VectorSource({
                features: [feature],
            });
            var vectorLayer = new VectorLayer({
                source: vectorSource,
                zIndex: 1,
            });
            map.addLayer(vectorLayer);
            return vectorLayer;
        },
        /*
                  Adds a polyline utilizing the passed in line and options.
                  Options are a view to relate to, and an id, and a color.
                */
        addLine: function (line, options) {
            var lineObject = line.map(function (coordinate) {
                return convertPointCoordinate(coordinate);
            });
            var feature = new Feature({
                geometry: new LineString(lineObject),
                name: options.title,
            });
            feature.setId(options.id);
            var commonStyle = new Style({
                stroke: new Stroke({
                    color: options.color || defaultColor,
                    width: 4,
                }),
            });
            feature.set('unselectedStyle', [
                new Style({
                    stroke: new Stroke({
                        color: 'white',
                        width: 8,
                    }),
                }),
                commonStyle,
            ]);
            feature.set('selectedStyle', [
                new Style({
                    stroke: new Stroke({
                        color: 'black',
                        width: 8,
                    }),
                }),
                commonStyle,
            ]);
            feature.setStyle(options.isSelected
                ? feature.get('selectedStyle')
                : feature.get('unselectedStyle'));
            var vectorSource = new VectorSource({
                features: [feature],
            });
            var vectorLayer = new VectorLayer({
                source: vectorSource,
            });
            map.addLayer(vectorLayer);
            return vectorLayer;
        },
        /*
                  Adds a polygon fill utilizing the passed in polygon and options.
                  Options are a view to relate to, and an id.
                */
        addPolygon: function () { },
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
            else {
                var feature = geometry.getSource().getFeatures()[0];
                var geometryInstance = feature.getGeometry();
                if (geometryInstance.constructor === Point) {
                    geometry.setZIndex(options.isSelected ? 2 : 1);
                    switch (options.isSelected) {
                        case 'selected':
                            feature.setStyle(feature.get('selectedStyle'));
                            break;
                        case 'partially':
                            feature.setStyle(feature.get('partiallySelectedStyle'));
                            break;
                        case 'unselected':
                            feature.setStyle(feature.get('unselectedStyle'));
                            break;
                    }
                }
                else if (geometryInstance.constructor === LineString) {
                    var styles = [
                        new Style({
                            stroke: new Stroke({
                                color: 'rgba(255,255,255, .1)',
                                width: 8,
                            }),
                        }),
                        new Style({
                            stroke: new Stroke({
                                color: 'rgba(0,0,0, .1)',
                                width: 4,
                            }),
                        }),
                    ];
                    feature.setStyle(styles);
                }
            }
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
            else {
                var feature = geometry.getSource().getFeatures()[0];
                var geometryInstance = feature.getGeometry();
                if (geometryInstance.constructor === Point) {
                    geometry.setZIndex(options.isSelected ? 2 : 1);
                    feature.setStyle(options.isSelected
                        ? feature.get('selectedStyle')
                        : feature.get('unselectedStyle'));
                }
                else if (geometryInstance.constructor === LineString) {
                    feature.setStyle(options.isSelected
                        ? feature.get('selectedStyle')
                        : feature.get('unselectedStyle'));
                }
            }
        },
        setGeometryStyle: function (geometry, options, feature) {
            var geometryInstance = feature.getGeometry();
            if (geometryInstance.getType() === 'Point') {
                var pointWidth = 39;
                var pointHeight = 40;
                if (options.size) {
                    pointWidth = options.size.x;
                    pointHeight = options.size.y;
                }
                geometry.setZIndex(options.isSelected ? 2 : 1);
                feature.setStyle(new Style({
                    image: new Icon({
                        img: DrawingUtility.getPin({
                            fillColor: options.isSelected ? 'orange' : options.color,
                            strokeColor: 'white',
                            icon: options.icon,
                        }),
                        width: pointWidth,
                        height: pointHeight,
                        anchor: [pointWidth / 2, 0],
                        anchorOrigin: 'bottom-left',
                        anchorXUnits: 'pixels',
                        anchorYUnits: 'pixels',
                    }),
                }));
            }
            else if (geometryInstance.getType() === 'LineString') {
                var styles = [
                    new Style({
                        stroke: new Stroke({
                            color: 'white',
                            width: 8,
                        }),
                    }),
                    new Style({
                        stroke: new Stroke({
                            color: options.color || defaultColor,
                            width: 4,
                        }),
                    }),
                ];
                feature.setStyle(styles);
            }
        },
        createTextStyle: function (feature, resolution) {
            var fillColor = '#000000';
            var outlineColor = '#ffffff';
            var outlineWidth = 3;
            return new olText({
                text: this.getText(feature, resolution),
                fill: new Fill({ color: fillColor }),
                stroke: new Stroke({
                    color: outlineColor,
                    width: outlineWidth,
                }),
                offsetX: 20,
                offsetY: -15,
                placement: 'point',
                maxAngle: 45,
                overflow: true,
                rotation: 0,
                textAlign: 'left',
                padding: [5, 5, 5, 5],
            });
        },
        getText: function (feature, resolution) {
            var maxResolution = 1200;
            var text = resolution > maxResolution ? '' : this.trunc(feature.get('name'), 20);
            return text;
        },
        trunc: function (str, n) {
            return str.length > n ? str.substr(0, n - 1) + '...' : str.substr(0);
        },
        /*
                 Updates a passed in geometry to be hidden
                 */
        hideGeometry: function (geometry) {
            geometry.setVisible(false);
        },
        /*
                 Updates a passed in geometry to be shown
                 */
        showGeometry: function (geometry) {
            geometry.setVisible(true);
        },
        removeGeometry: function (geometry) {
            map.removeLayer(geometry);
        },
        showMultiLineShape: function (locationModel) {
            var lineObject = locationModel.get('multiline');
            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
            if (validateGeo('multiline', JSON.stringify(lineObject)).error) {
                return;
            }
            lineObject = lineObject.map(function (line) {
                return line.map(function (coords) { return convertPointCoordinate(coords); });
            });
            var feature = new Feature({
                geometry: new MultiLineString(lineObject),
            });
            feature.setId(locationModel.cid);
            var styles = [
                new Style({
                    stroke: new Stroke({
                        color: locationModel.get('color') || defaultColor,
                        width: 4,
                    }),
                }),
            ];
            feature.setStyle(styles);
            return this.createVectorLayer(locationModel, feature);
        },
        createVectorLayer: function (locationModel, feature) {
            var vectorSource = new VectorSource({
                features: [feature],
            });
            var vectorLayer = new VectorLayer({
                source: vectorSource,
            });
            map.addLayer(vectorLayer);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            overlays[locationModel.cid] = vectorLayer;
            return vectorLayer;
        },
        destroyShape: function (cid) {
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'shape' implicitly has an 'any' type.
            var shapeIndex = shapes.findIndex(function (shape) { return cid === shape.model.cid; });
            if (shapeIndex >= 0) {
                shapes[shapeIndex].destroy();
                shapes.splice(shapeIndex, 1);
            }
        },
        destroyShapes: function () {
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'shape' implicitly has an 'any' type.
            shapes.forEach(function (shape) {
                shape.destroy();
            });
            shapes = [];
        },
        getMap: function () {
            return map;
        },
        zoomIn: function () {
            var view = map.getView();
            var zoom = view.getZoom();
            if (zoom) {
                view.setZoom(zoom + 1);
            }
        },
        zoomOut: function () {
            var view = map.getView();
            var zoom = view.getZoom();
            if (zoom) {
                view.setZoom(zoom - 1);
            }
        },
        destroy: function () {
            unlistenToResize();
        },
    };
    return exposedMethods;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLm9wZW5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9vcGVubGF5ZXJzL21hcC5vcGVubGF5ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osNEJBQTRCO0FBQzVCLE9BQU8sT0FBTyxNQUFNLHFEQUFxRCxDQUFBO0FBQ3pFLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sY0FBYyxNQUFNLG1CQUFtQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUE7QUFDckUsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLElBQUksYUFBYSxFQUFFLE1BQU0sU0FBUyxDQUFBO0FBQ3pELE9BQU8sRUFBRSxNQUFNLElBQUksWUFBWSxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQ2xELE9BQU8sRUFBRSxNQUFNLElBQUksV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2hELE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQTtBQUNoQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM3RCxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsV0FBVyxJQUFJLGlCQUFpQixFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQzVELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxn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QU8sRUFBRSxDQUFBO1lBQzNCLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDeEIsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPO1lBQ0wsZ0JBQWdCLEVBQUUsQ0FBQTtRQUNwQixDQUFDO0tBQ0YsQ0FBQTtJQUNELE9BQU8sY0FBYyxDQUFBO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qIGdsb2JhbCByZXF1aXJlLCB3aW5kb3cgKi9cbmltcG9ydCB3cmFwTnVtIGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy93cmFwLW51bS93cmFwLW51bSdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuL3V0aWxpdHknXG5pbXBvcnQgRHJhd2luZ1V0aWxpdHkgZnJvbSAnLi4vRHJhd2luZ1V0aWxpdHknXG5pbXBvcnQgeyBNdWx0aUxpbmVTdHJpbmcsIExpbmVTdHJpbmcsIFBvbHlnb24sIFBvaW50IH0gZnJvbSAnb2wvZ2VvbSdcbmltcG9ydCB7IGdldCwgdHJhbnNmb3JtIGFzIHByb2pUcmFuc2Zvcm0gfSBmcm9tICdvbC9wcm9qJ1xuaW1wb3J0IHsgVmVjdG9yIGFzIFZlY3RvclNvdXJjZSB9IGZyb20gJ29sL3NvdXJjZSdcbmltcG9ydCB7IFZlY3RvciBhcyBWZWN0b3JMYXllciB9IGZyb20gJ29sL2xheWVyJ1xuaW1wb3J0IEZlYXR1cmUgZnJvbSAnb2wvRmVhdHVyZSdcbmltcG9ydCB7IFN0cm9rZSwgSWNvbiwgVGV4dCBhcyBvbFRleHQsIEZpbGwgfSBmcm9tICdvbC9zdHlsZSdcbmltcG9ydCBTdHlsZSBmcm9tICdvbC9zdHlsZS9TdHlsZSdcbmltcG9ydCB7IEltYWdlIGFzIEltYWdlTGF5ZXIgfSBmcm9tICdvbC9sYXllcidcbmltcG9ydCB7IEltYWdlU3RhdGljIGFzIEltYWdlU3RhdGljU291cmNlIH0gZnJvbSAnb2wvc291cmNlJ1xuaW1wb3J0IHsgRHJhZ1BhbiB9IGZyb20gJ29sL2ludGVyYWN0aW9uJ1xuaW1wb3J0IHsgT3BlbmxheWVyc0xheWVycyB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL2NvbnRyb2xsZXJzL29wZW5sYXllcnMubGF5ZXJzJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IHsgdmFsaWRhdGVHZW8gfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCB7IENsdXN0ZXJUeXBlIH0gZnJvbSAnLi4vcmVhY3QvZ2VvbWV0cmllcydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IF9kZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5pbXBvcnQgeyBQcm9qZWN0aW9uTGlrZSB9IGZyb20gJ29sL3Byb2onXG5pbXBvcnQgR3JvdXAgZnJvbSAnb2wvbGF5ZXIvR3JvdXAnXG5pbXBvcnQgeyBDb29yZGluYXRlIH0gZnJvbSAnb2wvY29vcmRpbmF0ZSdcbmltcG9ydCBNYXAgZnJvbSAnb2wvTWFwJ1xuaW1wb3J0IHsgYm91bmRpbmdFeHRlbnQsIGNyZWF0ZUVtcHR5LCBleHRlbmQgfSBmcm9tICdvbC9leHRlbnQnXG5pbXBvcnQgeyBnZXRMZW5ndGggfSBmcm9tICdvbC9zcGhlcmUnXG5cbmNvbnN0IGRlZmF1bHRDb2xvciA9ICcjM2M2ZGQ1J1xuZnVuY3Rpb24gY3JlYXRlTWFwKGluc2VydGlvbkVsZW1lbnQ6IGFueSwgbWFwTGF5ZXJzOiBhbnkpIHtcbiAgY29uc3QgbGF5ZXJDb2xsZWN0aW9uQ29udHJvbGxlciA9IG5ldyBPcGVubGF5ZXJzTGF5ZXJzKHtcbiAgICBjb2xsZWN0aW9uOiBtYXBMYXllcnMsXG4gIH0pXG4gIGNvbnN0IG1hcCA9IGxheWVyQ29sbGVjdGlvbkNvbnRyb2xsZXIubWFrZU1hcCh7XG4gICAgem9vbTogMi43LFxuICAgIG1pblpvb206IDIuMyxcbiAgICBjZW50ZXI6IFswLCAwXSxcbiAgICBlbGVtZW50OiBpbnNlcnRpb25FbGVtZW50LFxuICB9KVxuICByZXR1cm4gbWFwIGFzIE1hcFxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRGcm9tUG9zaXRpb24ocG9zaXRpb246IGFueSwgbWFwOiBhbnkpIHtcbiAgY29uc3QgZmVhdHVyZXM6IGFueSA9IFtdXG4gIG1hcC5mb3JFYWNoRmVhdHVyZUF0UGl4ZWwocG9zaXRpb24sIChmZWF0dXJlOiBhbnkpID0+IHtcbiAgICBmZWF0dXJlcy5wdXNoKGZlYXR1cmUpXG4gIH0pXG4gIGlmIChmZWF0dXJlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGZlYXR1cmVzWzBdLmdldElkKClcbiAgfVxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uOiBhbnksIG1hcDogYW55KSB7XG4gIGNvbnN0IGZlYXR1cmVzOiBhbnkgPSBbXVxuICBsZXQgaWQsIGxvY2F0aW9uSWRcbiAgbWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChwb3NpdGlvbiwgKGZlYXR1cmU6IGFueSkgPT4ge1xuICAgIGZlYXR1cmVzLnB1c2goZmVhdHVyZSlcbiAgfSlcbiAgaWYgKGZlYXR1cmVzLmxlbmd0aCA+IDApIHtcbiAgICBpZCA9IGZlYXR1cmVzWzBdLmdldElkKClcbiAgICBsb2NhdGlvbklkID0gZmVhdHVyZXNbMF0uZ2V0KCdsb2NhdGlvbklkJylcbiAgfVxuICByZXR1cm4geyBpZCwgbG9jYXRpb25JZCB9XG59XG5mdW5jdGlvbiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50OiBbbnVtYmVyLCBudW1iZXJdKSB7XG4gIGNvbnN0IGNvb3JkcyA9IFtwb2ludFswXSwgcG9pbnRbMV1dXG4gIHJldHVybiBwcm9qVHJhbnNmb3JtKFxuICAgIGNvb3JkcyBhcyBDb29yZGluYXRlLFxuICAgICdFUFNHOjQzMjYnLFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKClcbiAgKVxufVxuZnVuY3Rpb24gdW5jb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50OiBbbnVtYmVyLCBudW1iZXJdKSB7XG4gIHJldHVybiBwcm9qVHJhbnNmb3JtKFxuICAgIHBvaW50LFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKCksXG4gICAgJ0VQU0c6NDMyNidcbiAgKVxufVxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDYxMzMpIEZJWE1FOiAnbG9uZ2l0dWRlJyBpcyBkZWNsYXJlZCBidXQgaXRzIHZhbHVlIGlzIG5ldmVyIHJlYS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5mdW5jdGlvbiBvZmZNYXAoW2xvbmdpdHVkZSwgbGF0aXR1ZGVdKSB7XG4gIHJldHVybiBsYXRpdHVkZSA8IC05MCB8fCBsYXRpdHVkZSA+IDkwXG59XG4vLyBUaGUgZXh0ZW5zaW9uIGFyZ3VtZW50IGlzIGEgZnVuY3Rpb24gdXNlZCBpbiBwYW5Ub0V4dGVudFxuLy8gSXQgYWxsb3dzIGZvciBjdXN0b21pemF0aW9uIG9mIHRoZSB3YXkgdGhlIG1hcCBwYW5zIHRvIHJlc3VsdHNcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChcbiAgaW5zZXJ0aW9uRWxlbWVudDogYW55LFxuICBfc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnksXG4gIF9ub3RpZmljYXRpb25FbDogYW55LFxuICBfY29tcG9uZW50RWxlbWVudDogYW55LFxuICBtYXBNb2RlbDogYW55LFxuICBtYXBMYXllcnM6IGFueVxuKSB7XG4gIGxldCBvdmVybGF5cyA9IHt9XG4gIGxldCBzaGFwZXM6IGFueSA9IFtdXG4gIGNvbnN0IG1hcCA9IGNyZWF0ZU1hcChpbnNlcnRpb25FbGVtZW50LCBtYXBMYXllcnMpXG5cbiAgc2V0dXBUb29sdGlwKG1hcClcbiAgZnVuY3Rpb24gc2V0dXBUb29sdGlwKG1hcDogYW55KSB7XG4gICAgbWFwLm9uKCdwb2ludGVybW92ZScsIChlOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gdW5jb252ZXJ0UG9pbnRDb29yZGluYXRlKGUuY29vcmRpbmF0ZSlcbiAgICAgIGlmICghb2ZmTWFwKHBvaW50IGFzIGFueSkpIHtcbiAgICAgICAgbWFwTW9kZWwudXBkYXRlTW91c2VDb29yZGluYXRlcyh7XG4gICAgICAgICAgbGF0OiBwb2ludFsxXSxcbiAgICAgICAgICBsb246IHBvaW50WzBdLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwTW9kZWwuY2xlYXJNb3VzZUNvb3JkaW5hdGVzKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGZ1bmN0aW9uIHJlc2l6ZU1hcCgpIHtcbiAgICBtYXAudXBkYXRlU2l6ZSgpXG4gIH1cbiAgY29uc3QgZGVib3VuY2VkUmVzaXplTWFwID0gX2RlYm91bmNlKHJlc2l6ZU1hcCwgMjUwKVxuICBmdW5jdGlvbiBsaXN0ZW5Ub1Jlc2l6ZSgpIHtcbiAgICA7KHdyZXFyIGFzIGFueSkudmVudC5vbigncmVzaXplJywgZGVib3VuY2VkUmVzaXplTWFwKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZWRSZXNpemVNYXApXG4gIH1cbiAgZnVuY3Rpb24gdW5saXN0ZW5Ub1Jlc2l6ZSgpIHtcbiAgICA7KHdyZXFyIGFzIGFueSkudmVudC5vZmYoJ3Jlc2l6ZScsIGRlYm91bmNlZFJlc2l6ZU1hcClcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2VkUmVzaXplTWFwKVxuICB9XG4gIGxpc3RlblRvUmVzaXplKClcbiAgbGV0IGdlb0RyYWdEb3duTGlzdGVuZXI6IGFueVxuICBsZXQgZ2VvRHJhZ01vdmVMaXN0ZW5lcjogYW55XG4gIGxldCBnZW9EcmFnVXBMaXN0ZW5lcjogYW55XG4gIGxldCBsZWZ0Q2xpY2tNYXBBUElMaXN0ZW5lcjogYW55XG4gIGNvbnN0IGV4cG9zZWRNZXRob2RzID0ge1xuICAgIG9uTW91c2VUcmFja2luZ0Zvckdlb0RyYWcoe1xuICAgICAgbW92ZUZyb20sXG4gICAgICBkb3duLFxuICAgICAgbW92ZSxcbiAgICAgIHVwLFxuICAgIH06IHtcbiAgICAgIG1vdmVGcm9tPzogYW55XG4gICAgICBkb3duOiBhbnlcbiAgICAgIG1vdmU6IGFueVxuICAgICAgdXA6IGFueVxuICAgIH0pIHtcbiAgICAgIC8vIGRpc2FibGUgcGFubmluZyBvZiB0aGUgbWFwXG4gICAgICBtYXAuZ2V0SW50ZXJhY3Rpb25zKCkuZm9yRWFjaCgoaW50ZXJhY3Rpb246IGFueSkgPT4ge1xuICAgICAgICBpZiAoaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBEcmFnUGFuKSB7XG4gICAgICAgICAgaW50ZXJhY3Rpb24uc2V0QWN0aXZlKGZhbHNlKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBlbmFibGUgZHJhZ2dpbmcgaW5kaXZpZHVhbCBmZWF0dXJlc1xuICAgICAgZ2VvRHJhZ0Rvd25MaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudDogYW55KSB7XG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKGV2ZW50LnBpeGVsLCBtYXApXG4gICAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gbWFwLmdldENvb3JkaW5hdGVGcm9tUGl4ZWwoZXZlbnQucGl4ZWwpXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0geyBsYXRpdHVkZTogY29vcmRpbmF0ZXNbMV0sIGxvbmdpdHVkZTogY29vcmRpbmF0ZXNbMF0gfVxuICAgICAgICBkb3duKHsgcG9zaXRpb246IHBvc2l0aW9uLCBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkIH0pXG4gICAgICB9XG4gICAgICBtYXAub24oJ3BvaW50ZXJkb3duJyBhcyBhbnksIGdlb0RyYWdEb3duTGlzdGVuZXIpXG5cbiAgICAgIGdlb0RyYWdNb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihldmVudC5waXhlbCwgbWFwKVxuICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG1hcC5nZXRDb29yZGluYXRlRnJvbVBpeGVsKGV2ZW50LnBpeGVsKVxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG1vdmVGcm9tXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGxhdGl0dWRlOiBjb29yZGluYXRlc1sxXSAtIG1vdmVGcm9tLmxhdGl0dWRlLFxuICAgICAgICAgICAgICBsb25naXR1ZGU6IGNvb3JkaW5hdGVzWzBdIC0gbW92ZUZyb20ubG9uZ2l0dWRlLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogbnVsbFxuICAgICAgICBtb3ZlKHsgdHJhbnNsYXRpb246IHRyYW5zbGF0aW9uLCBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkIH0pXG4gICAgICB9XG4gICAgICBtYXAub24oJ3BvaW50ZXJkcmFnJywgZ2VvRHJhZ01vdmVMaXN0ZW5lcilcblxuICAgICAgZ2VvRHJhZ1VwTGlzdGVuZXIgPSB1cFxuICAgICAgbWFwLm9uKCdwb2ludGVydXAnIGFzIGFueSwgZ2VvRHJhZ1VwTGlzdGVuZXIpXG4gICAgfSxcbiAgICBjbGVhck1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKCkge1xuICAgICAgLy8gcmUtZW5hYmxlIHBhbm5pbmdcbiAgICAgIG1hcC5nZXRJbnRlcmFjdGlvbnMoKS5mb3JFYWNoKChpbnRlcmFjdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGlmIChpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIERyYWdQYW4pIHtcbiAgICAgICAgICBpbnRlcmFjdGlvbi5zZXRBY3RpdmUodHJ1ZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGlmIChnZW9EcmFnRG93bkxpc3RlbmVyKSB7XG4gICAgICAgIG1hcC51bigncG9pbnRlcmRvd24nIGFzIGFueSwgZ2VvRHJhZ0Rvd25MaXN0ZW5lcilcbiAgICAgIH1cbiAgICAgIGlmIChnZW9EcmFnTW92ZUxpc3RlbmVyKSB7XG4gICAgICAgIG1hcC51bigncG9pbnRlcmRyYWcnLCBnZW9EcmFnTW92ZUxpc3RlbmVyKVxuICAgICAgfVxuICAgICAgaWYgKGdlb0RyYWdVcExpc3RlbmVyKSB7XG4gICAgICAgIG1hcC51bigncG9pbnRlcnVwJyBhcyBhbnksIGdlb0RyYWdVcExpc3RlbmVyKVxuICAgICAgfVxuICAgIH0sXG4gICAgb25MZWZ0Q2xpY2tNYXBBUEkoY2FsbGJhY2s6IGFueSkge1xuICAgICAgbGVmdENsaWNrTWFwQVBJTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihldmVudC5waXhlbCwgbWFwKVxuICAgICAgICBjYWxsYmFjayhsb2NhdGlvbklkKVxuICAgICAgfVxuICAgICAgbWFwLm9uKCdzaW5nbGVjbGljaycsIGxlZnRDbGlja01hcEFQSUxpc3RlbmVyKVxuICAgIH0sXG4gICAgY2xlYXJMZWZ0Q2xpY2tNYXBBUEkoKSB7XG4gICAgICBtYXAudW4oJ3NpbmdsZWNsaWNrJywgbGVmdENsaWNrTWFwQVBJTGlzdGVuZXIpXG4gICAgfSxcbiAgICBvbkxlZnRDbGljayhjYWxsYmFjazogYW55KSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IG1hcC5nZXRUYXJnZXRFbGVtZW50KCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY2FsbGJhY2soZSwge1xuICAgICAgICAgIG1hcFRhcmdldDogZGV0ZXJtaW5lSWRGcm9tUG9zaXRpb24oXG4gICAgICAgICAgICBbZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BdLFxuICAgICAgICAgICAgbWFwXG4gICAgICAgICAgKSxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBvblJpZ2h0Q2xpY2soY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignY29udGV4dG1lbnUnLCAoZSkgPT4ge1xuICAgICAgICBjYWxsYmFjayhlKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGNsZWFyUmlnaHRDbGljaygpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub2ZmKCdjb250ZXh0bWVudScpXG4gICAgfSxcbiAgICBvbkRvdWJsZUNsaWNrKCkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignZGJsY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKFxuICAgICAgICAgIFtlLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdCwgZS5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcF0sXG4gICAgICAgICAgbWFwXG4gICAgICAgIClcbiAgICAgICAgaWYgKGxvY2F0aW9uSWQpIHtcbiAgICAgICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdsb2NhdGlvbjpkb3VibGVDbGljaycsIGxvY2F0aW9uSWQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhckRvdWJsZUNsaWNrKCkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vZmYoJ2RibGNsaWNrJylcbiAgICB9LFxuICAgIG9uTW91c2VUcmFja2luZ0ZvclBvcHVwKFxuICAgICAgZG93bkNhbGxiYWNrOiBhbnksXG4gICAgICBtb3ZlQ2FsbGJhY2s6IGFueSxcbiAgICAgIHVwQ2FsbGJhY2s6IGFueVxuICAgICkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignbW91c2Vkb3duJywgKCkgPT4ge1xuICAgICAgICBkb3duQ2FsbGJhY2soKVxuICAgICAgfSlcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ21vdXNlbW92ZScsICgpID0+IHtcbiAgICAgICAgbW92ZUNhbGxiYWNrKClcbiAgICAgIH0pXG4gICAgICB0aGlzLm9uTGVmdENsaWNrKHVwQ2FsbGJhY2spXG4gICAgfSxcbiAgICBvbk1vdXNlTW92ZShjYWxsYmFjazogYW55KSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gW1xuICAgICAgICAgIGUuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0LFxuICAgICAgICAgIGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3AsXG4gICAgICAgIF1cbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24ocG9zaXRpb24sIG1hcClcbiAgICAgICAgY2FsbGJhY2soZSwge1xuICAgICAgICAgIG1hcFRhcmdldDogZGV0ZXJtaW5lSWRGcm9tUG9zaXRpb24ocG9zaXRpb24sIG1hcCksXG4gICAgICAgICAgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhck1vdXNlTW92ZSgpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub2ZmKCdtb3VzZW1vdmUnKVxuICAgIH0sXG4gICAgdGltZW91dElkczogW10gYXMgbnVtYmVyW10sXG4gICAgb25DYW1lcmFNb3ZlU3RhcnQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgdGhpcy50aW1lb3V0SWRzLmZvckVhY2goKHRpbWVvdXRJZDogYW55KSA9PiB7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dElkKVxuICAgICAgfSlcbiAgICAgIHRoaXMudGltZW91dElkcyA9IFtdXG4gICAgICBtYXAuYWRkRXZlbnRMaXN0ZW5lcignbW92ZXN0YXJ0JywgY2FsbGJhY2spXG4gICAgfSxcbiAgICBvZmZDYW1lcmFNb3ZlU3RhcnQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgbWFwLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdmVzdGFydCcsIGNhbGxiYWNrKVxuICAgIH0sXG4gICAgb25DYW1lcmFNb3ZlRW5kKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIGNvbnN0IHRpbWVvdXRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy50aW1lb3V0SWRzLnB1c2goXG4gICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgIH0sIDMwMClcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgbWFwLmFkZEV2ZW50TGlzdGVuZXIoJ21vdmVlbmQnLCB0aW1lb3V0Q2FsbGJhY2spXG4gICAgfSxcbiAgICBvZmZDYW1lcmFNb3ZlRW5kKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIG1hcC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3ZlZW5kJywgY2FsbGJhY2spXG4gICAgfSxcbiAgICBkb1Bhblpvb20oY29vcmRzOiBbbnVtYmVyLCBudW1iZXJdW10pIHtcbiAgICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgICB0aGF0LnBhblpvb21PdXQoeyBkdXJhdGlvbjogMTAwMCB9LCAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoYXQuem9vbVRvRXh0ZW50KGNvb3JkcywgeyBkdXJhdGlvbjogMjAwMCB9KVxuICAgICAgICB9LCAwKVxuICAgICAgfSlcbiAgICB9LFxuICAgIHBhblpvb21PdXQoX29wdHM6IGFueSwgbmV4dDogYW55KSB7XG4gICAgICBuZXh0KClcbiAgICB9LFxuICAgIHBhblRvUmVzdWx0cyhyZXN1bHRzOiBhbnkpIHtcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gXy5mbGF0dGVuKFxuICAgICAgICByZXN1bHRzLm1hcCgocmVzdWx0OiBhbnkpID0+IHJlc3VsdC5nZXRQb2ludHMoKSksXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICAgIHRoaXMucGFuVG9FeHRlbnQoY29vcmRpbmF0ZXMpXG4gICAgfSxcbiAgICBwYW5Ub0V4dGVudChjb29yZHM6IFtudW1iZXIsIG51bWJlcl1bXSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29vcmRzKSAmJiBjb29yZHMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBsaW5lT2JqZWN0ID0gY29vcmRzLm1hcCgoY29vcmRpbmF0ZSkgPT5cbiAgICAgICAgICBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGUpXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgZXh0ZW50ID0gYm91bmRpbmdFeHRlbnQobGluZU9iamVjdClcbiAgICAgICAgbWFwLmdldFZpZXcoKS5maXQoZXh0ZW50LCB7XG4gICAgICAgICAgc2l6ZTogbWFwLmdldFNpemUoKSxcbiAgICAgICAgICBtYXhab29tOiBtYXAuZ2V0VmlldygpLmdldFpvb20oKSxcbiAgICAgICAgICBkdXJhdGlvbjogNTAwLFxuICAgICAgICAgIHBhZGRpbmc6IFs1MCwgNTAsIDUwLCA1MF0sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRFeHRlbnRPZklkcyhpZHM6IHN0cmluZ1tdKSB7XG4gICAgICB2YXIgZXh0ZW50ID0gY3JlYXRlRW1wdHkoKVxuICAgICAgbWFwLmdldExheWVycygpLmZvckVhY2goKGxheWVyOiBhbnkpID0+IHtcbiAgICAgICAgLy8gbWlnaHQgbmVlZCB0byBoYW5kbGUgZ3JvdXBzIGxhdGVyLCBidXQgbm8gcmVhc29uIHRvIHlldFxuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBWZWN0b3JMYXllciAmJiBpZHMuaW5jbHVkZXMobGF5ZXIuZ2V0KCdpZCcpKSkge1xuICAgICAgICAgIGV4dGVuZChleHRlbnQsIGxheWVyLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGV4dGVudFswXSA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBleHRlbnQgZm91bmQgZm9yIGlkcycpXG4gICAgICB9XG4gICAgICByZXR1cm4gZXh0ZW50XG4gICAgfSxcbiAgICB6b29tVG9JZHMoeyBpZHMsIGR1cmF0aW9uID0gNTAwIH06IHsgaWRzOiBzdHJpbmdbXTsgZHVyYXRpb24/OiBudW1iZXIgfSkge1xuICAgICAgbWFwLmdldFZpZXcoKS5maXQodGhpcy5nZXRFeHRlbnRPZklkcyhpZHMpLCB7XG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgfSlcbiAgICB9LFxuICAgIHBhblRvU2hhcGVzRXh0ZW50KHsgZHVyYXRpb24gPSA1MDAgfTogeyBkdXJhdGlvbj86IG51bWJlciB9ID0ge30pIHtcbiAgICAgIHZhciBleHRlbnQgPSBjcmVhdGVFbXB0eSgpXG4gICAgICBtYXAuZ2V0TGF5ZXJzKCkuZm9yRWFjaCgobGF5ZXI6IGFueSkgPT4ge1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBHcm91cCkge1xuICAgICAgICAgIGxheWVyLmdldExheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTGF5ZXI6IGFueSkge1xuICAgICAgICAgICAgLy9JZiB0aGlzIGlzIGEgdmVjdG9yIGxheWVyLCBhZGQgaXQgdG8gb3VyIGV4dGVudFxuICAgICAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2YgVmVjdG9yTGF5ZXIpXG4gICAgICAgICAgICAgIGV4dGVuZChleHRlbnQsIChncm91cExheWVyIGFzIGFueSkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCkpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIFZlY3RvckxheWVyICYmIGxheWVyLmdldCgnaWQnKSkge1xuICAgICAgICAgIGV4dGVuZChleHRlbnQsIGxheWVyLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGV4dGVudFswXSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgbWFwLmdldFZpZXcoKS5maXQoZXh0ZW50LCB7XG4gICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRTaGFwZXMoKSB7XG4gICAgICByZXR1cm4gc2hhcGVzXG4gICAgfSxcbiAgICB6b29tVG9FeHRlbnQoY29vcmRzOiBbbnVtYmVyLCBudW1iZXJdW10sIG9wdHMgPSB7fSkge1xuICAgICAgY29uc3QgbGluZU9iamVjdCA9IGNvb3Jkcy5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT5cbiAgICAgICAgY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKVxuICAgICAgKVxuICAgICAgY29uc3QgZXh0ZW50ID0gYm91bmRpbmdFeHRlbnQobGluZU9iamVjdClcbiAgICAgIG1hcC5nZXRWaWV3KCkuZml0KGV4dGVudCwge1xuICAgICAgICBzaXplOiBtYXAuZ2V0U2l6ZSgpLFxuICAgICAgICBtYXhab29tOiBtYXAuZ2V0VmlldygpLmdldFpvb20oKSxcbiAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgLi4ub3B0cyxcbiAgICAgIH0pXG4gICAgfSxcbiAgICB6b29tVG9Cb3VuZGluZ0JveCh7IG5vcnRoLCBlYXN0LCBzb3V0aCwgd2VzdCB9OiBhbnkpIHtcbiAgICAgIHRoaXMuem9vbVRvRXh0ZW50KFtcbiAgICAgICAgW3dlc3QsIHNvdXRoXSxcbiAgICAgICAgW2Vhc3QsIG5vcnRoXSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBsaW1pdCh2YWx1ZTogYW55LCBtaW46IGFueSwgbWF4OiBhbnkpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWx1ZSwgbWluKSwgbWF4KVxuICAgIH0sXG4gICAgZ2V0Qm91bmRpbmdCb3goKSB7XG4gICAgICBjb25zdCBleHRlbnQgPSBtYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudChtYXAuZ2V0U2l6ZSgpKVxuICAgICAgbGV0IGxvbmdpdHVkZUVhc3QgPSB3cmFwTnVtKGV4dGVudFsyXSwgLTE4MCwgMTgwKVxuICAgICAgY29uc3QgbG9uZ2l0dWRlV2VzdCA9IHdyYXBOdW0oZXh0ZW50WzBdLCAtMTgwLCAxODApXG4gICAgICAvL2FkZCAzNjAgZGVncmVlcyB0byBsb25naXR1ZGVFYXN0IHRvIGFjY29tbW9kYXRlIGJvdW5kaW5nIGJveGVzIHRoYXQgc3BhbiBhY3Jvc3MgdGhlIGFudGktbWVyaWRpYW5cbiAgICAgIGlmIChsb25naXR1ZGVFYXN0IDwgbG9uZ2l0dWRlV2VzdCkge1xuICAgICAgICBsb25naXR1ZGVFYXN0ICs9IDM2MFxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9ydGg6IHRoaXMubGltaXQoZXh0ZW50WzNdLCAtOTAsIDkwKSxcbiAgICAgICAgZWFzdDogbG9uZ2l0dWRlRWFzdCxcbiAgICAgICAgc291dGg6IHRoaXMubGltaXQoZXh0ZW50WzFdLCAtOTAsIDkwKSxcbiAgICAgICAgd2VzdDogbG9uZ2l0dWRlV2VzdCxcbiAgICAgIH1cbiAgICB9LFxuICAgIG92ZXJsYXlJbWFnZShtb2RlbDogTGF6eVF1ZXJ5UmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhY2FyZElkID0gbW9kZWwucGxhaW4uaWRcbiAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheShtZXRhY2FyZElkKVxuICAgICAgY29uc3QgY29vcmRzID0gbW9kZWwuZ2V0UG9pbnRzKCdsb2NhdGlvbicpXG4gICAgICBjb25zdCBhcnJheSA9IF8ubWFwKGNvb3JkcywgKGNvb3JkKSA9PiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkKSlcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBuZXcgUG9seWdvbihbYXJyYXldKVxuICAgICAgY29uc3QgZXh0ZW50ID0gcG9seWdvbi5nZXRFeHRlbnQoKVxuICAgICAgY29uc3QgcHJvamVjdGlvbiA9IGdldChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpKVxuICAgICAgY29uc3Qgb3ZlcmxheUxheWVyID0gbmV3IEltYWdlTGF5ZXIoe1xuICAgICAgICBzb3VyY2U6IG5ldyBJbWFnZVN0YXRpY1NvdXJjZSh7XG4gICAgICAgICAgdXJsOiBtb2RlbC5jdXJyZW50T3ZlcmxheVVybCB8fCAnJyxcbiAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qZWN0aW9uIGFzIFByb2plY3Rpb25MaWtlLFxuICAgICAgICAgIGltYWdlRXh0ZW50OiBleHRlbnQsXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcihvdmVybGF5TGF5ZXIpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIG92ZXJsYXlzW21ldGFjYXJkSWRdID0gb3ZlcmxheUxheWVyXG4gICAgfSxcbiAgICByZW1vdmVPdmVybGF5KG1ldGFjYXJkSWQ6IGFueSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBpZiAob3ZlcmxheXNbbWV0YWNhcmRJZF0pIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIG1hcC5yZW1vdmVMYXllcihvdmVybGF5c1ttZXRhY2FyZElkXSlcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGRlbGV0ZSBvdmVybGF5c1ttZXRhY2FyZElkXVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlQWxsT3ZlcmxheXMoKSB7XG4gICAgICBmb3IgKGNvbnN0IG92ZXJsYXkgaW4gb3ZlcmxheXMpIHtcbiAgICAgICAgaWYgKG92ZXJsYXlzLmhhc093blByb3BlcnR5KG92ZXJsYXkpKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgbWFwLnJlbW92ZUxheWVyKG92ZXJsYXlzW292ZXJsYXldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvdmVybGF5cyA9IHt9XG4gICAgfSxcbiAgICBnZXRDYXJ0b2dyYXBoaWNDZW50ZXJPZkNsdXN0ZXJJbkRlZ3JlZXMoY2x1c3RlcjogQ2x1c3RlclR5cGUpIHtcbiAgICAgIHJldHVybiB1dGlsaXR5LmNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cmllc0luRGVncmVlcyhcbiAgICAgICAgY2x1c3Rlci5yZXN1bHRzXG4gICAgICApXG4gICAgfSxcbiAgICBnZXRXaW5kb3dMb2NhdGlvbnNPZlJlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5ID1cbiAgICAgICAgICB1dGlsaXR5LmNhbGN1bGF0ZU9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5KHJlc3VsdClcbiAgICAgICAgY29uc3QgY2VudGVyID0gbWFwLmdldFBpeGVsRnJvbUNvb3JkaW5hdGUob3BlbmxheWVyc0NlbnRlck9mR2VvbWV0cnkpXG4gICAgICAgIGlmIChjZW50ZXIpIHtcbiAgICAgICAgICByZXR1cm4gY2VudGVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBkaXN0YW5jZSAoaW4gbWV0ZXJzKSBiZXR3ZWVuIHRoZSB0d28gcG9zaXRpb25zIGluIHRoZSBnaXZlbiBhcnJheSBvZlxuICAgICAqIENvb3JkaW5hdGVzLlxuICAgICAqL1xuICAgIGNhbGN1bGF0ZURpc3RhbmNlQmV0d2VlblBvc2l0aW9ucyhjb29yZHM6IGFueSkge1xuICAgICAgY29uc3QgbGluZSA9IG5ldyBMaW5lU3RyaW5nKGNvb3JkcylcbiAgICAgIGNvbnN0IHNwaGVyZUxlbmd0aCA9IGdldExlbmd0aChsaW5lKVxuICAgICAgcmV0dXJuIHNwaGVyZUxlbmd0aFxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgIEFkZHMgYSBiaWxsYm9hcmQgcG9pbnQgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAqL1xuICAgIGFkZFBvaW50V2l0aFRleHQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBmZWF0dXJlID0gbmV3IEZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHBvaW50T2JqZWN0KSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBiYWRnZU9mZnNldCA9IG9wdGlvbnMuYmFkZ2VPcHRpb25zID8gOCA6IDBcbiAgICAgIGNvbnN0IGltZ1dpZHRoID0gNDQgKyBiYWRnZU9mZnNldFxuICAgICAgY29uc3QgaW1nSGVpZ2h0ID0gNDQgKyBiYWRnZU9mZnNldFxuXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3Vuc2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB3aWR0aDogaW1nV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGZlYXR1cmUuc2V0KFxuICAgICAgICAncGFydGlhbGx5U2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB3aWR0aDogaW1nV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGZlYXR1cmUuc2V0KFxuICAgICAgICAnc2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdvcmFuZ2UnLFxuICAgICAgICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgd2lkdGg6IGltZ1dpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBpbWdIZWlnaHQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBzd2l0Y2ggKG9wdGlvbnMuaXNTZWxlY3RlZCkge1xuICAgICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgnc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3BhcnRpYWxseSc6XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgncGFydGlhbGx5U2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3Vuc2VsZWN0ZWQnOlxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjb25zdCB2ZWN0b3JTb3VyY2UgPSBuZXcgVmVjdG9yU291cmNlKHtcbiAgICAgICAgZmVhdHVyZXM6IFtmZWF0dXJlXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCB2ZWN0b3JMYXllciA9IG5ldyBWZWN0b3JMYXllcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgICB6SW5kZXg6IDEsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgYmlsbGJvYXJkIHBvaW50IHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRQb2ludChwb2ludDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvaW50T2JqZWN0ID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludClcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBuZXcgRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQocG9pbnRPYmplY3QpLFxuICAgICAgICBuYW1lOiBvcHRpb25zLnRpdGxlLFxuICAgICAgfSlcbiAgICAgIGZlYXR1cmUuc2V0SWQob3B0aW9ucy5pZClcbiAgICAgIGNvbnN0IGJhZGdlT2Zmc2V0ID0gb3B0aW9ucy5iYWRnZU9wdGlvbnMgPyA4IDogMFxuICAgICAgbGV0IHggPSAzOSArIGJhZGdlT2Zmc2V0LFxuICAgICAgICB5ID0gNDAgKyBiYWRnZU9mZnNldFxuICAgICAgaWYgKG9wdGlvbnMuc2l6ZSkge1xuICAgICAgICB4ID0gb3B0aW9ucy5zaXplLnhcbiAgICAgICAgeSA9IG9wdGlvbnMuc2l6ZS55XG4gICAgICB9XG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3Vuc2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0UGluKHtcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICAgICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHdpZHRoOiB4LFxuICAgICAgICAgICAgaGVpZ2h0OiB5LFxuICAgICAgICAgICAgYW5jaG9yOiBbeCAvIDIgLSBiYWRnZU9mZnNldCAvIDIsIDBdLFxuICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiAnYm90dG9tLWxlZnQnLFxuICAgICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICAgIGFuY2hvcllVbml0czogJ3BpeGVscycsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3NlbGVjdGVkU3R5bGUnLFxuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIGltYWdlOiBuZXcgSWNvbih7XG4gICAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogJ29yYW5nZScsXG4gICAgICAgICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgd2lkdGg6IHgsXG4gICAgICAgICAgICBoZWlnaHQ6IHksXG4gICAgICAgICAgICBhbmNob3I6IFt4IC8gMiAtIGJhZGdlT2Zmc2V0IC8gMiwgMF0sXG4gICAgICAgICAgICBhbmNob3JPcmlnaW46ICdib3R0b20tbGVmdCcsXG4gICAgICAgICAgICBhbmNob3JYVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgYW5jaG9yWVVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gZmVhdHVyZS5nZXQoJ3NlbGVjdGVkU3R5bGUnKVxuICAgICAgICAgIDogZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpXG4gICAgICApXG4gICAgICBjb25zdCB2ZWN0b3JTb3VyY2UgPSBuZXcgVmVjdG9yU291cmNlKHtcbiAgICAgICAgZmVhdHVyZXM6IFtmZWF0dXJlXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCB2ZWN0b3JMYXllciA9IG5ldyBWZWN0b3JMYXllcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgICB6SW5kZXg6IDEsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgcG9seWxpbmUgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gbGluZSBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgICAgICovXG4gICAgYWRkTGluZShsaW5lOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgbGluZU9iamVjdCA9IGxpbmUubWFwKChjb29yZGluYXRlOiBhbnkpID0+XG4gICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBuZXcgRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgTGluZVN0cmluZyhsaW5lT2JqZWN0KSxcbiAgICAgICAgbmFtZTogb3B0aW9ucy50aXRsZSxcbiAgICAgIH0pXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICBjb25zdCBjb21tb25TdHlsZSA9IG5ldyBTdHlsZSh7XG4gICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29sb3IgfHwgZGVmYXVsdENvbG9yLFxuICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICBmZWF0dXJlLnNldCgndW5zZWxlY3RlZFN0eWxlJywgW1xuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KSxcbiAgICAgICAgY29tbW9uU3R5bGUsXG4gICAgICBdKVxuICAgICAgZmVhdHVyZS5zZXQoJ3NlbGVjdGVkU3R5bGUnLCBbXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgIGNvbG9yOiAnYmxhY2snLFxuICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pLFxuICAgICAgICBjb21tb25TdHlsZSxcbiAgICAgIF0pXG4gICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgICA/IGZlYXR1cmUuZ2V0KCdzZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICA6IGZlYXR1cmUuZ2V0KCd1bnNlbGVjdGVkU3R5bGUnKVxuICAgICAgKVxuICAgICAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IFZlY3RvclNvdXJjZSh7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgY29uc3QgdmVjdG9yTGF5ZXIgPSBuZXcgVmVjdG9yTGF5ZXIoe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgIH0pXG4gICAgICBtYXAuYWRkTGF5ZXIodmVjdG9yTGF5ZXIpXG4gICAgICByZXR1cm4gdmVjdG9yTGF5ZXJcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBwb2x5Z29uIGZpbGwgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9seWdvbiBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRQb2x5Z29uKCkge30sXG4gICAgLypcbiAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIHJlZmxlY3Qgd2hldGhlciBvciBub3QgaXQgaXMgc2VsZWN0ZWQuXG4gICAgICAgICAgICAgT3B0aW9ucyBwYXNzZWQgaW4gYXJlIGNvbG9yIGFuZCBpc1NlbGVjdGVkLlxuICAgICAgICAgICAgICovXG4gICAgdXBkYXRlQ2x1c3RlcihnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGdlb21ldHJ5KSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVDbHVzdGVyKGlubmVyR2VvbWV0cnksIG9wdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2VvbWV0cnkuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXVxuICAgICAgICBjb25zdCBnZW9tZXRyeUluc3RhbmNlID0gZmVhdHVyZS5nZXRHZW9tZXRyeSgpXG4gICAgICAgIGlmIChnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBQb2ludCkge1xuICAgICAgICAgIGdlb21ldHJ5LnNldFpJbmRleChvcHRpb25zLmlzU2VsZWN0ZWQgPyAyIDogMSlcbiAgICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKGZlYXR1cmUuZ2V0KCdzZWxlY3RlZFN0eWxlJykpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlICdwYXJ0aWFsbHknOlxuICAgICAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKGZlYXR1cmUuZ2V0KCdwYXJ0aWFsbHlTZWxlY3RlZFN0eWxlJykpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlICd1bnNlbGVjdGVkJzpcbiAgICAgICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgndW5zZWxlY3RlZFN0eWxlJykpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5SW5zdGFuY2UuY29uc3RydWN0b3IgPT09IExpbmVTdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBzdHlsZXMgPSBbXG4gICAgICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwgLjEpJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsMCwwLCAuMSknLFxuICAgICAgICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF1cbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byByZWZsZWN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIHNlbGVjdGVkLlxuICAgICAgICAgICAgICBPcHRpb25zIHBhc3NlZCBpbiBhcmUgY29sb3IgYW5kIGlzU2VsZWN0ZWQuXG4gICAgICAgICAgICAqL1xuICAgIHVwZGF0ZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZ2VvbWV0cnkpKSB7XG4gICAgICAgIGdlb21ldHJ5LmZvckVhY2goKGlubmVyR2VvbWV0cnkpID0+IHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUdlb21ldHJ5KGlubmVyR2VvbWV0cnksIG9wdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2VvbWV0cnkuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXVxuICAgICAgICBjb25zdCBnZW9tZXRyeUluc3RhbmNlID0gZmVhdHVyZS5nZXRHZW9tZXRyeSgpXG4gICAgICAgIGlmIChnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBQb2ludCkge1xuICAgICAgICAgIGdlb21ldHJ5LnNldFpJbmRleChvcHRpb25zLmlzU2VsZWN0ZWQgPyAyIDogMSlcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICAgICAgb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgICAgICAgID8gZmVhdHVyZS5nZXQoJ3NlbGVjdGVkU3R5bGUnKVxuICAgICAgICAgICAgICA6IGZlYXR1cmUuZ2V0KCd1bnNlbGVjdGVkU3R5bGUnKVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBMaW5lU3RyaW5nKSB7XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShcbiAgICAgICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgICAgICA/IGZlYXR1cmUuZ2V0KCdzZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICAgICAgOiBmZWF0dXJlLmdldCgndW5zZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldEdlb21ldHJ5U3R5bGUoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55LCBmZWF0dXJlOiBhbnkpIHtcbiAgICAgIGNvbnN0IGdlb21ldHJ5SW5zdGFuY2UgPSBmZWF0dXJlLmdldEdlb21ldHJ5KClcbiAgICAgIGlmIChnZW9tZXRyeUluc3RhbmNlLmdldFR5cGUoKSA9PT0gJ1BvaW50Jykge1xuICAgICAgICBsZXQgcG9pbnRXaWR0aCA9IDM5XG4gICAgICAgIGxldCBwb2ludEhlaWdodCA9IDQwXG4gICAgICAgIGlmIChvcHRpb25zLnNpemUpIHtcbiAgICAgICAgICBwb2ludFdpZHRoID0gb3B0aW9ucy5zaXplLnhcbiAgICAgICAgICBwb2ludEhlaWdodCA9IG9wdGlvbnMuc2l6ZS55XG4gICAgICAgIH1cbiAgICAgICAgZ2VvbWV0cnkuc2V0WkluZGV4KG9wdGlvbnMuaXNTZWxlY3RlZCA/IDIgOiAxKVxuICAgICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgICBpbWFnZTogbmV3IEljb24oe1xuICAgICAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmlzU2VsZWN0ZWQgPyAnb3JhbmdlJyA6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgd2lkdGg6IHBvaW50V2lkdGgsXG4gICAgICAgICAgICAgIGhlaWdodDogcG9pbnRIZWlnaHQsXG4gICAgICAgICAgICAgIGFuY2hvcjogW3BvaW50V2lkdGggLyAyLCAwXSxcbiAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiAnYm90dG9tLWxlZnQnLFxuICAgICAgICAgICAgICBhbmNob3JYVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgICBhbmNob3JZVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeUluc3RhbmNlLmdldFR5cGUoKSA9PT0gJ0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IFtcbiAgICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICAgIGNvbG9yOiBvcHRpb25zLmNvbG9yIHx8IGRlZmF1bHRDb2xvcixcbiAgICAgICAgICAgICAgd2lkdGg6IDQsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXVxuICAgICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgIH1cbiAgICB9LFxuICAgIGNyZWF0ZVRleHRTdHlsZShmZWF0dXJlOiBhbnksIHJlc29sdXRpb246IGFueSkge1xuICAgICAgY29uc3QgZmlsbENvbG9yID0gJyMwMDAwMDAnXG4gICAgICBjb25zdCBvdXRsaW5lQ29sb3IgPSAnI2ZmZmZmZidcbiAgICAgIGNvbnN0IG91dGxpbmVXaWR0aCA9IDNcbiAgICAgIHJldHVybiBuZXcgb2xUZXh0KHtcbiAgICAgICAgdGV4dDogdGhpcy5nZXRUZXh0KGZlYXR1cmUsIHJlc29sdXRpb24pLFxuICAgICAgICBmaWxsOiBuZXcgRmlsbCh7IGNvbG9yOiBmaWxsQ29sb3IgfSksXG4gICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgY29sb3I6IG91dGxpbmVDb2xvcixcbiAgICAgICAgICB3aWR0aDogb3V0bGluZVdpZHRoLFxuICAgICAgICB9KSxcbiAgICAgICAgb2Zmc2V0WDogMjAsXG4gICAgICAgIG9mZnNldFk6IC0xNSxcbiAgICAgICAgcGxhY2VtZW50OiAncG9pbnQnLFxuICAgICAgICBtYXhBbmdsZTogNDUsXG4gICAgICAgIG92ZXJmbG93OiB0cnVlLFxuICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgIHBhZGRpbmc6IFs1LCA1LCA1LCA1XSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRUZXh0KGZlYXR1cmU6IGFueSwgcmVzb2x1dGlvbjogYW55KSB7XG4gICAgICBjb25zdCBtYXhSZXNvbHV0aW9uID0gMTIwMFxuICAgICAgY29uc3QgdGV4dCA9XG4gICAgICAgIHJlc29sdXRpb24gPiBtYXhSZXNvbHV0aW9uID8gJycgOiB0aGlzLnRydW5jKGZlYXR1cmUuZ2V0KCduYW1lJyksIDIwKVxuICAgICAgcmV0dXJuIHRleHRcbiAgICB9LFxuICAgIHRydW5jKHN0cjogYW55LCBuOiBhbnkpIHtcbiAgICAgIHJldHVybiBzdHIubGVuZ3RoID4gbiA/IHN0ci5zdWJzdHIoMCwgbiAtIDEpICsgJy4uLicgOiBzdHIuc3Vic3RyKDApXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgaGlkZGVuXG4gICAgICAgICAgICAgKi9cbiAgICBoaWRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgZ2VvbWV0cnkuc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byBiZSBzaG93blxuICAgICAgICAgICAgICovXG4gICAgc2hvd0dlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGdlb21ldHJ5LnNldFZpc2libGUodHJ1ZSlcbiAgICB9LFxuICAgIHJlbW92ZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIG1hcC5yZW1vdmVMYXllcihnZW9tZXRyeSlcbiAgICB9LFxuICAgIHNob3dNdWx0aUxpbmVTaGFwZShsb2NhdGlvbk1vZGVsOiBhbnkpIHtcbiAgICAgIGxldCBsaW5lT2JqZWN0ID0gbG9jYXRpb25Nb2RlbC5nZXQoJ211bHRpbGluZScpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMikgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAndW5kZWZpbmVkJy5cbiAgICAgIGlmICh2YWxpZGF0ZUdlbygnbXVsdGlsaW5lJywgSlNPTi5zdHJpbmdpZnkobGluZU9iamVjdCkpLmVycm9yKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgbGluZU9iamVjdCA9IGxpbmVPYmplY3QubWFwKChsaW5lOiBhbnkpID0+XG4gICAgICAgIGxpbmUubWFwKChjb29yZHM6IGFueSkgPT4gY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZHMpKVxuICAgICAgKVxuICAgICAgbGV0IGZlYXR1cmUgPSBuZXcgRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgTXVsdGlMaW5lU3RyaW5nKGxpbmVPYmplY3QpLFxuICAgICAgfSlcbiAgICAgIGZlYXR1cmUuc2V0SWQobG9jYXRpb25Nb2RlbC5jaWQpXG4gICAgICBjb25zdCBzdHlsZXMgPSBbXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgIGNvbG9yOiBsb2NhdGlvbk1vZGVsLmdldCgnY29sb3InKSB8fCBkZWZhdWx0Q29sb3IsXG4gICAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICBdXG4gICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVZlY3RvckxheWVyKGxvY2F0aW9uTW9kZWwsIGZlYXR1cmUpXG4gICAgfSxcbiAgICBjcmVhdGVWZWN0b3JMYXllcihsb2NhdGlvbk1vZGVsOiBhbnksIGZlYXR1cmU6IGFueSkge1xuICAgICAgbGV0IHZlY3RvclNvdXJjZSA9IG5ldyBWZWN0b3JTb3VyY2Uoe1xuICAgICAgICBmZWF0dXJlczogW2ZlYXR1cmVdLFxuICAgICAgfSlcbiAgICAgIGxldCB2ZWN0b3JMYXllciA9IG5ldyBWZWN0b3JMYXllcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgb3ZlcmxheXNbbG9jYXRpb25Nb2RlbC5jaWRdID0gdmVjdG9yTGF5ZXJcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgZGVzdHJveVNoYXBlKGNpZDogYW55KSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBjb25zdCBzaGFwZUluZGV4ID0gc2hhcGVzLmZpbmRJbmRleCgoc2hhcGUpID0+IGNpZCA9PT0gc2hhcGUubW9kZWwuY2lkKVxuICAgICAgaWYgKHNoYXBlSW5kZXggPj0gMCkge1xuICAgICAgICBzaGFwZXNbc2hhcGVJbmRleF0uZGVzdHJveSgpXG4gICAgICAgIHNoYXBlcy5zcGxpY2Uoc2hhcGVJbmRleCwgMSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlc3Ryb3lTaGFwZXMoKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcbiAgICAgICAgc2hhcGUuZGVzdHJveSgpXG4gICAgICB9KVxuICAgICAgc2hhcGVzID0gW11cbiAgICB9LFxuICAgIGdldE1hcCgpIHtcbiAgICAgIHJldHVybiBtYXBcbiAgICB9LFxuICAgIHpvb21JbigpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSBtYXAuZ2V0VmlldygpXG4gICAgICBjb25zdCB6b29tID0gdmlldy5nZXRab29tKClcbiAgICAgIGlmICh6b29tKSB7XG4gICAgICAgIHZpZXcuc2V0Wm9vbSh6b29tICsgMSlcbiAgICAgIH1cbiAgICB9LFxuICAgIHpvb21PdXQoKSB7XG4gICAgICBjb25zdCB2aWV3ID0gbWFwLmdldFZpZXcoKVxuICAgICAgY29uc3Qgem9vbSA9IHZpZXcuZ2V0Wm9vbSgpXG4gICAgICBpZiAoem9vbSkge1xuICAgICAgICB2aWV3LnNldFpvb20oem9vbSAtIDEpXG4gICAgICB9XG4gICAgfSxcbiAgICBkZXN0cm95KCkge1xuICAgICAgdW5saXN0ZW5Ub1Jlc2l6ZSgpXG4gICAgfSxcbiAgfVxuICByZXR1cm4gZXhwb3NlZE1ldGhvZHNcbn1cbiJdfQ==