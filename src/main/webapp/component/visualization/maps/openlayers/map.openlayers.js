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
            var coordinates = _.flatten(results.map(function (result) { return result.getPoints('location'); }), true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLm9wZW5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9vcGVubGF5ZXJzL21hcC5vcGVubGF5ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osNEJBQTRCO0FBQzVCLE9BQU8sT0FBTyxNQUFNLHFEQUFxRCxDQUFBO0FBQ3pFLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sY0FBYyxNQUFNLG1CQUFtQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUE7QUFDckUsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLElBQUksYUFBYSxFQUFFLE1BQU0sU0FBUyxDQUFBO0FBQ3pELE9BQU8sRUFBRSxNQUFNLElBQUksWUFBWSxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQ2xELE9BQU8sRUFBRSxNQUFNLElBQUksV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2hELE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQTtBQUNoQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM3RCxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsV0FBVyxJQUFJLGlCQUFpQixFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQzVELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxn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QUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUN4QixDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU87WUFDTCxnQkFBZ0IsRUFBRSxDQUFBO1FBQ3BCLENBQUM7S0FDRixDQUFBO0lBQ0QsT0FBTyxjQUFjLENBQUE7QUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLyogZ2xvYmFsIHJlcXVpcmUsIHdpbmRvdyAqL1xuaW1wb3J0IHdyYXBOdW0gZnJvbSAnLi4vLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL3dyYXAtbnVtL3dyYXAtbnVtJ1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB1dGlsaXR5IGZyb20gJy4vdXRpbGl0eSdcbmltcG9ydCBEcmF3aW5nVXRpbGl0eSBmcm9tICcuLi9EcmF3aW5nVXRpbGl0eSdcbmltcG9ydCB7IE11bHRpTGluZVN0cmluZywgTGluZVN0cmluZywgUG9seWdvbiwgUG9pbnQgfSBmcm9tICdvbC9nZW9tJ1xuaW1wb3J0IHsgZ2V0LCB0cmFuc2Zvcm0gYXMgcHJvalRyYW5zZm9ybSB9IGZyb20gJ29sL3Byb2onXG5pbXBvcnQgeyBWZWN0b3IgYXMgVmVjdG9yU291cmNlIH0gZnJvbSAnb2wvc291cmNlJ1xuaW1wb3J0IHsgVmVjdG9yIGFzIFZlY3RvckxheWVyIH0gZnJvbSAnb2wvbGF5ZXInXG5pbXBvcnQgRmVhdHVyZSBmcm9tICdvbC9GZWF0dXJlJ1xuaW1wb3J0IHsgU3Ryb2tlLCBJY29uLCBUZXh0IGFzIG9sVGV4dCwgRmlsbCB9IGZyb20gJ29sL3N0eWxlJ1xuaW1wb3J0IFN0eWxlIGZyb20gJ29sL3N0eWxlL1N0eWxlJ1xuaW1wb3J0IHsgSW1hZ2UgYXMgSW1hZ2VMYXllciB9IGZyb20gJ29sL2xheWVyJ1xuaW1wb3J0IHsgSW1hZ2VTdGF0aWMgYXMgSW1hZ2VTdGF0aWNTb3VyY2UgfSBmcm9tICdvbC9zb3VyY2UnXG5pbXBvcnQgeyBEcmFnUGFuIH0gZnJvbSAnb2wvaW50ZXJhY3Rpb24nXG5pbXBvcnQgeyBPcGVubGF5ZXJzTGF5ZXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvY29udHJvbGxlcnMvb3BlbmxheWVycy5sYXllcnMnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vLi4vLi4vanMvd3JlcXInXG5pbXBvcnQgeyB2YWxpZGF0ZUdlbyB9IGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy92YWxpZGF0aW9uJ1xuaW1wb3J0IHsgQ2x1c3RlclR5cGUgfSBmcm9tICcuLi9yZWFjdC9nZW9tZXRyaWVzJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgX2RlYm91bmNlIGZyb20gJ2xvZGFzaC5kZWJvdW5jZSdcbmltcG9ydCB7IFByb2plY3Rpb25MaWtlIH0gZnJvbSAnb2wvcHJvaidcbmltcG9ydCBHcm91cCBmcm9tICdvbC9sYXllci9Hcm91cCdcbmltcG9ydCB7IENvb3JkaW5hdGUgfSBmcm9tICdvbC9jb29yZGluYXRlJ1xuaW1wb3J0IE1hcCBmcm9tICdvbC9NYXAnXG5pbXBvcnQgeyBib3VuZGluZ0V4dGVudCwgY3JlYXRlRW1wdHksIGV4dGVuZCB9IGZyb20gJ29sL2V4dGVudCdcbmltcG9ydCB7IGdldExlbmd0aCB9IGZyb20gJ29sL3NwaGVyZSdcblxuY29uc3QgZGVmYXVsdENvbG9yID0gJyMzYzZkZDUnXG5mdW5jdGlvbiBjcmVhdGVNYXAoaW5zZXJ0aW9uRWxlbWVudDogYW55LCBtYXBMYXllcnM6IGFueSkge1xuICBjb25zdCBsYXllckNvbGxlY3Rpb25Db250cm9sbGVyID0gbmV3IE9wZW5sYXllcnNMYXllcnMoe1xuICAgIGNvbGxlY3Rpb246IG1hcExheWVycyxcbiAgfSlcbiAgY29uc3QgbWFwID0gbGF5ZXJDb2xsZWN0aW9uQ29udHJvbGxlci5tYWtlTWFwKHtcbiAgICB6b29tOiAyLjcsXG4gICAgbWluWm9vbTogMi4zLFxuICAgIGNlbnRlcjogWzAsIDBdLFxuICAgIGVsZW1lbnQ6IGluc2VydGlvbkVsZW1lbnQsXG4gIH0pXG4gIHJldHVybiBtYXAgYXMgTWFwXG59XG5mdW5jdGlvbiBkZXRlcm1pbmVJZEZyb21Qb3NpdGlvbihwb3NpdGlvbjogYW55LCBtYXA6IGFueSkge1xuICBjb25zdCBmZWF0dXJlczogYW55ID0gW11cbiAgbWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChwb3NpdGlvbiwgKGZlYXR1cmU6IGFueSkgPT4ge1xuICAgIGZlYXR1cmVzLnB1c2goZmVhdHVyZSlcbiAgfSlcbiAgaWYgKGZlYXR1cmVzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gZmVhdHVyZXNbMF0uZ2V0SWQoKVxuICB9XG59XG5mdW5jdGlvbiBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24ocG9zaXRpb246IGFueSwgbWFwOiBhbnkpIHtcbiAgY29uc3QgZmVhdHVyZXM6IGFueSA9IFtdXG4gIGxldCBpZCwgbG9jYXRpb25JZFxuICBtYXAuZm9yRWFjaEZlYXR1cmVBdFBpeGVsKHBvc2l0aW9uLCAoZmVhdHVyZTogYW55KSA9PiB7XG4gICAgZmVhdHVyZXMucHVzaChmZWF0dXJlKVxuICB9KVxuICBpZiAoZmVhdHVyZXMubGVuZ3RoID4gMCkge1xuICAgIGlkID0gZmVhdHVyZXNbMF0uZ2V0SWQoKVxuICAgIGxvY2F0aW9uSWQgPSBmZWF0dXJlc1swXS5nZXQoJ2xvY2F0aW9uSWQnKVxuICB9XG4gIHJldHVybiB7IGlkLCBsb2NhdGlvbklkIH1cbn1cbmZ1bmN0aW9uIGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQ6IFtudW1iZXIsIG51bWJlcl0pIHtcbiAgY29uc3QgY29vcmRzID0gW3BvaW50WzBdLCBwb2ludFsxXV1cbiAgcmV0dXJuIHByb2pUcmFuc2Zvcm0oXG4gICAgY29vcmRzIGFzIENvb3JkaW5hdGUsXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG59XG5mdW5jdGlvbiB1bmNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQ6IFtudW1iZXIsIG51bWJlcl0pIHtcbiAgcmV0dXJuIHByb2pUcmFuc2Zvcm0oXG4gICAgcG9pbnQsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKSxcbiAgICAnRVBTRzo0MzI2J1xuICApXG59XG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNjEzMykgRklYTUU6ICdsb25naXR1ZGUnIGlzIGRlY2xhcmVkIGJ1dCBpdHMgdmFsdWUgaXMgbmV2ZXIgcmVhLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmZ1bmN0aW9uIG9mZk1hcChbbG9uZ2l0dWRlLCBsYXRpdHVkZV0pIHtcbiAgcmV0dXJuIGxhdGl0dWRlIDwgLTkwIHx8IGxhdGl0dWRlID4gOTBcbn1cbi8vIFRoZSBleHRlbnNpb24gYXJndW1lbnQgaXMgYSBmdW5jdGlvbiB1c2VkIGluIHBhblRvRXh0ZW50XG4vLyBJdCBhbGxvd3MgZm9yIGN1c3RvbWl6YXRpb24gb2YgdGhlIHdheSB0aGUgbWFwIHBhbnMgdG8gcmVzdWx0c1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKFxuICBpbnNlcnRpb25FbGVtZW50OiBhbnksXG4gIF9zZWxlY3Rpb25JbnRlcmZhY2U6IGFueSxcbiAgX25vdGlmaWNhdGlvbkVsOiBhbnksXG4gIF9jb21wb25lbnRFbGVtZW50OiBhbnksXG4gIG1hcE1vZGVsOiBhbnksXG4gIG1hcExheWVyczogYW55XG4pIHtcbiAgbGV0IG92ZXJsYXlzID0ge31cbiAgbGV0IHNoYXBlczogYW55ID0gW11cbiAgY29uc3QgbWFwID0gY3JlYXRlTWFwKGluc2VydGlvbkVsZW1lbnQsIG1hcExheWVycylcblxuICBzZXR1cFRvb2x0aXAobWFwKVxuICBmdW5jdGlvbiBzZXR1cFRvb2x0aXAobWFwOiBhbnkpIHtcbiAgICBtYXAub24oJ3BvaW50ZXJtb3ZlJywgKGU6IGFueSkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB1bmNvbnZlcnRQb2ludENvb3JkaW5hdGUoZS5jb29yZGluYXRlKVxuICAgICAgaWYgKCFvZmZNYXAocG9pbnQgYXMgYW55KSkge1xuICAgICAgICBtYXBNb2RlbC51cGRhdGVNb3VzZUNvb3JkaW5hdGVzKHtcbiAgICAgICAgICBsYXQ6IHBvaW50WzFdLFxuICAgICAgICAgIGxvbjogcG9pbnRbMF0sXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXBNb2RlbC5jbGVhck1vdXNlQ29vcmRpbmF0ZXMoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgZnVuY3Rpb24gcmVzaXplTWFwKCkge1xuICAgIG1hcC51cGRhdGVTaXplKClcbiAgfVxuICBjb25zdCBkZWJvdW5jZWRSZXNpemVNYXAgPSBfZGVib3VuY2UocmVzaXplTWFwLCAyNTApXG4gIGZ1bmN0aW9uIGxpc3RlblRvUmVzaXplKCkge1xuICAgIDsod3JlcXIgYXMgYW55KS52ZW50Lm9uKCdyZXNpemUnLCBkZWJvdW5jZWRSZXNpemVNYXApXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlZFJlc2l6ZU1hcClcbiAgfVxuICBmdW5jdGlvbiB1bmxpc3RlblRvUmVzaXplKCkge1xuICAgIDsod3JlcXIgYXMgYW55KS52ZW50Lm9mZigncmVzaXplJywgZGVib3VuY2VkUmVzaXplTWFwKVxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZWRSZXNpemVNYXApXG4gIH1cbiAgbGlzdGVuVG9SZXNpemUoKVxuICBsZXQgZ2VvRHJhZ0Rvd25MaXN0ZW5lcjogYW55XG4gIGxldCBnZW9EcmFnTW92ZUxpc3RlbmVyOiBhbnlcbiAgbGV0IGdlb0RyYWdVcExpc3RlbmVyOiBhbnlcbiAgbGV0IGxlZnRDbGlja01hcEFQSUxpc3RlbmVyOiBhbnlcbiAgY29uc3QgZXhwb3NlZE1ldGhvZHMgPSB7XG4gICAgb25Nb3VzZVRyYWNraW5nRm9yR2VvRHJhZyh7XG4gICAgICBtb3ZlRnJvbSxcbiAgICAgIGRvd24sXG4gICAgICBtb3ZlLFxuICAgICAgdXAsXG4gICAgfToge1xuICAgICAgbW92ZUZyb20/OiBhbnlcbiAgICAgIGRvd246IGFueVxuICAgICAgbW92ZTogYW55XG4gICAgICB1cDogYW55XG4gICAgfSkge1xuICAgICAgLy8gZGlzYWJsZSBwYW5uaW5nIG9mIHRoZSBtYXBcbiAgICAgIG1hcC5nZXRJbnRlcmFjdGlvbnMoKS5mb3JFYWNoKChpbnRlcmFjdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGlmIChpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIERyYWdQYW4pIHtcbiAgICAgICAgICBpbnRlcmFjdGlvbi5zZXRBY3RpdmUoZmFsc2UpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIGVuYWJsZSBkcmFnZ2luZyBpbmRpdmlkdWFsIGZlYXR1cmVzXG4gICAgICBnZW9EcmFnRG93bkxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZXZlbnQucGl4ZWwsIG1hcClcbiAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBtYXAuZ2V0Q29vcmRpbmF0ZUZyb21QaXhlbChldmVudC5waXhlbClcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB7IGxhdGl0dWRlOiBjb29yZGluYXRlc1sxXSwgbG9uZ2l0dWRlOiBjb29yZGluYXRlc1swXSB9XG4gICAgICAgIGRvd24oeyBwb3NpdGlvbjogcG9zaXRpb24sIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQgfSlcbiAgICAgIH1cbiAgICAgIG1hcC5vbigncG9pbnRlcmRvd24nIGFzIGFueSwgZ2VvRHJhZ0Rvd25MaXN0ZW5lcilcblxuICAgICAgZ2VvRHJhZ01vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudDogYW55KSB7XG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKGV2ZW50LnBpeGVsLCBtYXApXG4gICAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gbWFwLmdldENvb3JkaW5hdGVGcm9tUGl4ZWwoZXZlbnQucGl4ZWwpXG4gICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gbW92ZUZyb21cbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgbGF0aXR1ZGU6IGNvb3JkaW5hdGVzWzFdIC0gbW92ZUZyb20ubGF0aXR1ZGUsXG4gICAgICAgICAgICAgIGxvbmdpdHVkZTogY29vcmRpbmF0ZXNbMF0gLSBtb3ZlRnJvbS5sb25naXR1ZGUsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiBudWxsXG4gICAgICAgIG1vdmUoeyB0cmFuc2xhdGlvbjogdHJhbnNsYXRpb24sIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQgfSlcbiAgICAgIH1cbiAgICAgIG1hcC5vbigncG9pbnRlcmRyYWcnLCBnZW9EcmFnTW92ZUxpc3RlbmVyKVxuXG4gICAgICBnZW9EcmFnVXBMaXN0ZW5lciA9IHVwXG4gICAgICBtYXAub24oJ3BvaW50ZXJ1cCcgYXMgYW55LCBnZW9EcmFnVXBMaXN0ZW5lcilcbiAgICB9LFxuICAgIGNsZWFyTW91c2VUcmFja2luZ0Zvckdlb0RyYWcoKSB7XG4gICAgICAvLyByZS1lbmFibGUgcGFubmluZ1xuICAgICAgbWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goKGludGVyYWN0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGludGVyYWN0aW9uIGluc3RhbmNlb2YgRHJhZ1Bhbikge1xuICAgICAgICAgIGludGVyYWN0aW9uLnNldEFjdGl2ZSh0cnVlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGdlb0RyYWdEb3duTGlzdGVuZXIpIHtcbiAgICAgICAgbWFwLnVuKCdwb2ludGVyZG93bicgYXMgYW55LCBnZW9EcmFnRG93bkxpc3RlbmVyKVxuICAgICAgfVxuICAgICAgaWYgKGdlb0RyYWdNb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgbWFwLnVuKCdwb2ludGVyZHJhZycsIGdlb0RyYWdNb3ZlTGlzdGVuZXIpXG4gICAgICB9XG4gICAgICBpZiAoZ2VvRHJhZ1VwTGlzdGVuZXIpIHtcbiAgICAgICAgbWFwLnVuKCdwb2ludGVydXAnIGFzIGFueSwgZ2VvRHJhZ1VwTGlzdGVuZXIpXG4gICAgICB9XG4gICAgfSxcbiAgICBvbkxlZnRDbGlja01hcEFQSShjYWxsYmFjazogYW55KSB7XG4gICAgICBsZWZ0Q2xpY2tNYXBBUElMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudDogYW55KSB7XG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKGV2ZW50LnBpeGVsLCBtYXApXG4gICAgICAgIGNhbGxiYWNrKGxvY2F0aW9uSWQpXG4gICAgICB9XG4gICAgICBtYXAub24oJ3NpbmdsZWNsaWNrJywgbGVmdENsaWNrTWFwQVBJTGlzdGVuZXIpXG4gICAgfSxcbiAgICBjbGVhckxlZnRDbGlja01hcEFQSSgpIHtcbiAgICAgIG1hcC51bignc2luZ2xlY2xpY2snLCBsZWZ0Q2xpY2tNYXBBUElMaXN0ZW5lcilcbiAgICB9LFxuICAgIG9uTGVmdENsaWNrKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLmdldFRhcmdldEVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjYWxsYmFjayhlLCB7XG4gICAgICAgICAgbWFwVGFyZ2V0OiBkZXRlcm1pbmVJZEZyb21Qb3NpdGlvbihcbiAgICAgICAgICAgIFtlLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdCwgZS5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcF0sXG4gICAgICAgICAgICBtYXBcbiAgICAgICAgICApLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuICAgIG9uUmlnaHRDbGljayhjYWxsYmFjazogYW55KSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9uKCdjb250ZXh0bWVudScsIChlKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKGUpXG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJSaWdodENsaWNrKCkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vZmYoJ2NvbnRleHRtZW51JylcbiAgICB9LFxuICAgIG9uRG91YmxlQ2xpY2soKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9uKCdkYmxjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IG1hcC5nZXRUYXJnZXRFbGVtZW50KCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oXG4gICAgICAgICAgW2UuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0LCBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wXSxcbiAgICAgICAgICBtYXBcbiAgICAgICAgKVxuICAgICAgICBpZiAobG9jYXRpb25JZCkge1xuICAgICAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ2xvY2F0aW9uOmRvdWJsZUNsaWNrJywgbG9jYXRpb25JZClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICAgIGNsZWFyRG91YmxlQ2xpY2soKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9mZignZGJsY2xpY2snKVxuICAgIH0sXG4gICAgb25Nb3VzZVRyYWNraW5nRm9yUG9wdXAoXG4gICAgICBkb3duQ2FsbGJhY2s6IGFueSxcbiAgICAgIG1vdmVDYWxsYmFjazogYW55LFxuICAgICAgdXBDYWxsYmFjazogYW55XG4gICAgKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9uKCdtb3VzZWRvd24nLCAoKSA9PiB7XG4gICAgICAgIGRvd25DYWxsYmFjaygpXG4gICAgICB9KVxuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignbW91c2Vtb3ZlJywgKCkgPT4ge1xuICAgICAgICBtb3ZlQ2FsbGJhY2soKVxuICAgICAgfSlcbiAgICAgIHRoaXMub25MZWZ0Q2xpY2sodXBDYWxsYmFjaylcbiAgICB9LFxuICAgIG9uTW91c2VNb3ZlKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IG1hcC5nZXRUYXJnZXRFbGVtZW50KCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBbXG4gICAgICAgICAgZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsXG4gICAgICAgICAgZS5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcCxcbiAgICAgICAgXVxuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihwb3NpdGlvbiwgbWFwKVxuICAgICAgICBjYWxsYmFjayhlLCB7XG4gICAgICAgICAgbWFwVGFyZ2V0OiBkZXRlcm1pbmVJZEZyb21Qb3NpdGlvbihwb3NpdGlvbiwgbWFwKSxcbiAgICAgICAgICBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuICAgIGNsZWFyTW91c2VNb3ZlKCkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vZmYoJ21vdXNlbW92ZScpXG4gICAgfSxcbiAgICB0aW1lb3V0SWRzOiBbXSBhcyBudW1iZXJbXSxcbiAgICBvbkNhbWVyYU1vdmVTdGFydChjYWxsYmFjazogYW55KSB7XG4gICAgICB0aGlzLnRpbWVvdXRJZHMuZm9yRWFjaCgodGltZW91dElkOiBhbnkpID0+IHtcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0SWQpXG4gICAgICB9KVxuICAgICAgdGhpcy50aW1lb3V0SWRzID0gW11cbiAgICAgIG1hcC5hZGRFdmVudExpc3RlbmVyKCdtb3Zlc3RhcnQnLCBjYWxsYmFjaylcbiAgICB9LFxuICAgIG9mZkNhbWVyYU1vdmVTdGFydChjYWxsYmFjazogYW55KSB7XG4gICAgICBtYXAucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW92ZXN0YXJ0JywgY2FsbGJhY2spXG4gICAgfSxcbiAgICBvbkNhbWVyYU1vdmVFbmQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgY29uc3QgdGltZW91dENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnRpbWVvdXRJZHMucHVzaChcbiAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgfSwgMzAwKVxuICAgICAgICApXG4gICAgICB9XG4gICAgICBtYXAuYWRkRXZlbnRMaXN0ZW5lcignbW92ZWVuZCcsIHRpbWVvdXRDYWxsYmFjaylcbiAgICB9LFxuICAgIG9mZkNhbWVyYU1vdmVFbmQoY2FsbGJhY2s6IGFueSkge1xuICAgICAgbWFwLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdmVlbmQnLCBjYWxsYmFjaylcbiAgICB9LFxuICAgIGRvUGFuWm9vbShjb29yZHM6IFtudW1iZXIsIG51bWJlcl1bXSkge1xuICAgICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICAgIHRoYXQucGFuWm9vbU91dCh7IGR1cmF0aW9uOiAxMDAwIH0sICgpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhhdC56b29tVG9FeHRlbnQoY29vcmRzLCB7IGR1cmF0aW9uOiAyMDAwIH0pXG4gICAgICAgIH0sIDApXG4gICAgICB9KVxuICAgIH0sXG4gICAgcGFuWm9vbU91dChfb3B0czogYW55LCBuZXh0OiBhbnkpIHtcbiAgICAgIG5leHQoKVxuICAgIH0sXG4gICAgcGFuVG9SZXN1bHRzKHJlc3VsdHM6IGFueSkge1xuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBfLmZsYXR0ZW4oXG4gICAgICAgIHJlc3VsdHMubWFwKChyZXN1bHQ6IGFueSkgPT4gcmVzdWx0LmdldFBvaW50cygnbG9jYXRpb24nKSksXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICAgIHRoaXMucGFuVG9FeHRlbnQoY29vcmRpbmF0ZXMpXG4gICAgfSxcbiAgICBwYW5Ub0V4dGVudChjb29yZHM6IFtudW1iZXIsIG51bWJlcl1bXSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29vcmRzKSAmJiBjb29yZHMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBsaW5lT2JqZWN0ID0gY29vcmRzLm1hcCgoY29vcmRpbmF0ZSkgPT5cbiAgICAgICAgICBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGUpXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgZXh0ZW50ID0gYm91bmRpbmdFeHRlbnQobGluZU9iamVjdClcbiAgICAgICAgbWFwLmdldFZpZXcoKS5maXQoZXh0ZW50LCB7XG4gICAgICAgICAgc2l6ZTogbWFwLmdldFNpemUoKSxcbiAgICAgICAgICBtYXhab29tOiBtYXAuZ2V0VmlldygpLmdldFpvb20oKSxcbiAgICAgICAgICBkdXJhdGlvbjogNTAwLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0RXh0ZW50T2ZJZHMoaWRzOiBzdHJpbmdbXSkge1xuICAgICAgdmFyIGV4dGVudCA9IGNyZWF0ZUVtcHR5KClcbiAgICAgIG1hcC5nZXRMYXllcnMoKS5mb3JFYWNoKChsYXllcjogYW55KSA9PiB7XG4gICAgICAgIC8vIG1pZ2h0IG5lZWQgdG8gaGFuZGxlIGdyb3VwcyBsYXRlciwgYnV0IG5vIHJlYXNvbiB0byB5ZXRcbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2YgVmVjdG9yTGF5ZXIgJiYgaWRzLmluY2x1ZGVzKGxheWVyLmdldCgnaWQnKSkpIHtcbiAgICAgICAgICBleHRlbmQoZXh0ZW50LCBsYXllci5nZXRTb3VyY2UoKS5nZXRFeHRlbnQoKSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGlmIChleHRlbnRbMF0gPT09IEluZmluaXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZXh0ZW50IGZvdW5kIGZvciBpZHMnKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGV4dGVudFxuICAgIH0sXG4gICAgem9vbVRvSWRzKHsgaWRzLCBkdXJhdGlvbiA9IDUwMCB9OiB7IGlkczogc3RyaW5nW107IGR1cmF0aW9uPzogbnVtYmVyIH0pIHtcbiAgICAgIG1hcC5nZXRWaWV3KCkuZml0KHRoaXMuZ2V0RXh0ZW50T2ZJZHMoaWRzKSwge1xuICAgICAgICBkdXJhdGlvbixcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwYW5Ub1NoYXBlc0V4dGVudCh7IGR1cmF0aW9uID0gNTAwIH06IHsgZHVyYXRpb24/OiBudW1iZXIgfSA9IHt9KSB7XG4gICAgICB2YXIgZXh0ZW50ID0gY3JlYXRlRW1wdHkoKVxuICAgICAgbWFwLmdldExheWVycygpLmZvckVhY2goKGxheWVyOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2YgR3JvdXApIHtcbiAgICAgICAgICBsYXllci5nZXRMYXllcnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChncm91cExheWVyOiBhbnkpIHtcbiAgICAgICAgICAgIC8vSWYgdGhpcyBpcyBhIHZlY3RvciBsYXllciwgYWRkIGl0IHRvIG91ciBleHRlbnRcbiAgICAgICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIFZlY3RvckxheWVyKVxuICAgICAgICAgICAgICBleHRlbmQoZXh0ZW50LCAoZ3JvdXBMYXllciBhcyBhbnkpLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBWZWN0b3JMYXllciAmJiBsYXllci5nZXQoJ2lkJykpIHtcbiAgICAgICAgICBleHRlbmQoZXh0ZW50LCBsYXllci5nZXRTb3VyY2UoKS5nZXRFeHRlbnQoKSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGlmIChleHRlbnRbMF0gIT09IEluZmluaXR5KSB7XG4gICAgICAgIG1hcC5nZXRWaWV3KCkuZml0KGV4dGVudCwge1xuICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0U2hhcGVzKCkge1xuICAgICAgcmV0dXJuIHNoYXBlc1xuICAgIH0sXG4gICAgem9vbVRvRXh0ZW50KGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdLCBvcHRzID0ge30pIHtcbiAgICAgIGNvbnN0IGxpbmVPYmplY3QgPSBjb29yZHMubWFwKChjb29yZGluYXRlOiBhbnkpID0+XG4gICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGV4dGVudCA9IGJvdW5kaW5nRXh0ZW50KGxpbmVPYmplY3QpXG4gICAgICBtYXAuZ2V0VmlldygpLmZpdChleHRlbnQsIHtcbiAgICAgICAgc2l6ZTogbWFwLmdldFNpemUoKSxcbiAgICAgICAgbWF4Wm9vbTogbWFwLmdldFZpZXcoKS5nZXRab29tKCksXG4gICAgICAgIGR1cmF0aW9uOiA1MDAsXG4gICAgICAgIC4uLm9wdHMsXG4gICAgICB9KVxuICAgIH0sXG4gICAgem9vbVRvQm91bmRpbmdCb3goeyBub3J0aCwgZWFzdCwgc291dGgsIHdlc3QgfTogYW55KSB7XG4gICAgICB0aGlzLnpvb21Ub0V4dGVudChbXG4gICAgICAgIFt3ZXN0LCBzb3V0aF0sXG4gICAgICAgIFtlYXN0LCBub3J0aF0sXG4gICAgICBdKVxuICAgIH0sXG4gICAgbGltaXQodmFsdWU6IGFueSwgbWluOiBhbnksIG1heDogYW55KSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsdWUsIG1pbiksIG1heClcbiAgICB9LFxuICAgIGdldEJvdW5kaW5nQm94KCkge1xuICAgICAgY29uc3QgZXh0ZW50ID0gbWFwLmdldFZpZXcoKS5jYWxjdWxhdGVFeHRlbnQobWFwLmdldFNpemUoKSlcbiAgICAgIGxldCBsb25naXR1ZGVFYXN0ID0gd3JhcE51bShleHRlbnRbMl0sIC0xODAsIDE4MClcbiAgICAgIGNvbnN0IGxvbmdpdHVkZVdlc3QgPSB3cmFwTnVtKGV4dGVudFswXSwgLTE4MCwgMTgwKVxuICAgICAgLy9hZGQgMzYwIGRlZ3JlZXMgdG8gbG9uZ2l0dWRlRWFzdCB0byBhY2NvbW1vZGF0ZSBib3VuZGluZyBib3hlcyB0aGF0IHNwYW4gYWNyb3NzIHRoZSBhbnRpLW1lcmlkaWFuXG4gICAgICBpZiAobG9uZ2l0dWRlRWFzdCA8IGxvbmdpdHVkZVdlc3QpIHtcbiAgICAgICAgbG9uZ2l0dWRlRWFzdCArPSAzNjBcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vcnRoOiB0aGlzLmxpbWl0KGV4dGVudFszXSwgLTkwLCA5MCksXG4gICAgICAgIGVhc3Q6IGxvbmdpdHVkZUVhc3QsXG4gICAgICAgIHNvdXRoOiB0aGlzLmxpbWl0KGV4dGVudFsxXSwgLTkwLCA5MCksXG4gICAgICAgIHdlc3Q6IGxvbmdpdHVkZVdlc3QsXG4gICAgICB9XG4gICAgfSxcbiAgICBvdmVybGF5SW1hZ2UobW9kZWw6IExhenlRdWVyeVJlc3VsdCkge1xuICAgICAgY29uc3QgbWV0YWNhcmRJZCA9IG1vZGVsLnBsYWluLmlkXG4gICAgICB0aGlzLnJlbW92ZU92ZXJsYXkobWV0YWNhcmRJZClcbiAgICAgIGNvbnN0IGNvb3JkcyA9IG1vZGVsLmdldFBvaW50cygnbG9jYXRpb24nKVxuICAgICAgY29uc3QgYXJyYXkgPSBfLm1hcChjb29yZHMsIChjb29yZCkgPT4gY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZCkpXG4gICAgICBjb25zdCBwb2x5Z29uID0gbmV3IFBvbHlnb24oW2FycmF5XSlcbiAgICAgIGNvbnN0IGV4dGVudCA9IHBvbHlnb24uZ2V0RXh0ZW50KClcbiAgICAgIGNvbnN0IHByb2plY3Rpb24gPSBnZXQoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKSlcbiAgICAgIGNvbnN0IG92ZXJsYXlMYXllciA9IG5ldyBJbWFnZUxheWVyKHtcbiAgICAgICAgc291cmNlOiBuZXcgSW1hZ2VTdGF0aWNTb3VyY2Uoe1xuICAgICAgICAgIHVybDogbW9kZWwuY3VycmVudE92ZXJsYXlVcmwgfHwgJycsXG4gICAgICAgICAgcHJvamVjdGlvbjogcHJvamVjdGlvbiBhcyBQcm9qZWN0aW9uTGlrZSxcbiAgICAgICAgICBpbWFnZUV4dGVudDogZXh0ZW50LFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICBtYXAuYWRkTGF5ZXIob3ZlcmxheUxheWVyKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBvdmVybGF5c1ttZXRhY2FyZElkXSA9IG92ZXJsYXlMYXllclxuICAgIH0sXG4gICAgcmVtb3ZlT3ZlcmxheShtZXRhY2FyZElkOiBhbnkpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgaWYgKG92ZXJsYXlzW21ldGFjYXJkSWRdKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBtYXAucmVtb3ZlTGF5ZXIob3ZlcmxheXNbbWV0YWNhcmRJZF0pXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBkZWxldGUgb3ZlcmxheXNbbWV0YWNhcmRJZF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZUFsbE92ZXJsYXlzKCkge1xuICAgICAgZm9yIChjb25zdCBvdmVybGF5IGluIG92ZXJsYXlzKSB7XG4gICAgICAgIGlmIChvdmVybGF5cy5oYXNPd25Qcm9wZXJ0eShvdmVybGF5KSkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIG1hcC5yZW1vdmVMYXllcihvdmVybGF5c1tvdmVybGF5XSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb3ZlcmxheXMgPSB7fVxuICAgIH0sXG4gICAgZ2V0Q2FydG9ncmFwaGljQ2VudGVyT2ZDbHVzdGVySW5EZWdyZWVzKGNsdXN0ZXI6IENsdXN0ZXJUeXBlKSB7XG4gICAgICByZXR1cm4gdXRpbGl0eS5jYWxjdWxhdGVDYXJ0b2dyYXBoaWNDZW50ZXJPZkdlb21ldHJpZXNJbkRlZ3JlZXMoXG4gICAgICAgIGNsdXN0ZXIucmVzdWx0c1xuICAgICAgKVxuICAgIH0sXG4gICAgZ2V0V2luZG93TG9jYXRpb25zT2ZSZXN1bHRzKHJlc3VsdHM6IGFueSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHMubWFwKChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBvcGVubGF5ZXJzQ2VudGVyT2ZHZW9tZXRyeSA9XG4gICAgICAgICAgdXRpbGl0eS5jYWxjdWxhdGVPcGVubGF5ZXJzQ2VudGVyT2ZHZW9tZXRyeShyZXN1bHQpXG4gICAgICAgIGNvbnN0IGNlbnRlciA9IG1hcC5nZXRQaXhlbEZyb21Db29yZGluYXRlKG9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5KVxuICAgICAgICBpZiAoY2VudGVyKSB7XG4gICAgICAgICAgcmV0dXJuIGNlbnRlclxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICAgIC8qXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgZGlzdGFuY2UgKGluIG1ldGVycykgYmV0d2VlbiB0aGUgdHdvIHBvc2l0aW9ucyBpbiB0aGUgZ2l2ZW4gYXJyYXkgb2ZcbiAgICAgKiBDb29yZGluYXRlcy5cbiAgICAgKi9cbiAgICBjYWxjdWxhdGVEaXN0YW5jZUJldHdlZW5Qb3NpdGlvbnMoY29vcmRzOiBhbnkpIHtcbiAgICAgIGNvbnN0IGxpbmUgPSBuZXcgTGluZVN0cmluZyhjb29yZHMpXG4gICAgICBjb25zdCBzcGhlcmVMZW5ndGggPSBnZXRMZW5ndGgobGluZSlcbiAgICAgIHJldHVybiBzcGhlcmVMZW5ndGhcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICBBZGRzIGEgYmlsbGJvYXJkIHBvaW50IHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgKi9cbiAgICBhZGRQb2ludFdpdGhUZXh0KHBvaW50OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgcG9pbnRPYmplY3QgPSBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50KVxuICAgICAgY29uc3QgZmVhdHVyZSA9IG5ldyBGZWF0dXJlKHtcbiAgICAgICAgZ2VvbWV0cnk6IG5ldyBQb2ludChwb2ludE9iamVjdCksXG4gICAgICB9KVxuICAgICAgY29uc3QgYmFkZ2VPZmZzZXQgPSBvcHRpb25zLmJhZGdlT3B0aW9ucyA/IDggOiAwXG4gICAgICBjb25zdCBpbWdXaWR0aCA9IDQ0ICsgYmFkZ2VPZmZzZXRcbiAgICAgIGNvbnN0IGltZ0hlaWdodCA9IDQ0ICsgYmFkZ2VPZmZzZXRcblxuICAgICAgZmVhdHVyZS5zZXRJZChvcHRpb25zLmlkKVxuICAgICAgZmVhdHVyZS5zZXQoXG4gICAgICAgICd1bnNlbGVjdGVkU3R5bGUnLFxuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIGltYWdlOiBuZXcgSWNvbih7XG4gICAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgd2lkdGg6IGltZ1dpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBpbWdIZWlnaHQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3BhcnRpYWxseVNlbGVjdGVkU3R5bGUnLFxuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIGltYWdlOiBuZXcgSWNvbih7XG4gICAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgd2lkdGg6IGltZ1dpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBpbWdIZWlnaHQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3NlbGVjdGVkU3R5bGUnLFxuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIGltYWdlOiBuZXcgSWNvbih7XG4gICAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiAnb3JhbmdlJyxcbiAgICAgICAgICAgICAgdGV4dDogb3B0aW9ucy5pZC5sZW5ndGgsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHdpZHRoOiBpbWdXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaW1nSGVpZ2h0LFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgc3dpdGNoIChvcHRpb25zLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS5nZXQoJ3NlbGVjdGVkU3R5bGUnKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdwYXJ0aWFsbHknOlxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS5nZXQoJ3BhcnRpYWxseVNlbGVjdGVkU3R5bGUnKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICd1bnNlbGVjdGVkJzpcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKGZlYXR1cmUuZ2V0KCd1bnNlbGVjdGVkU3R5bGUnKSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IFZlY3RvclNvdXJjZSh7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgY29uc3QgdmVjdG9yTGF5ZXIgPSBuZXcgVmVjdG9yTGF5ZXIoe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgICAgekluZGV4OiAxLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIGJpbGxib2FyZCBwb2ludCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2ludCBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgICAgICovXG4gICAgYWRkUG9pbnQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBmZWF0dXJlID0gbmV3IEZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHBvaW50T2JqZWN0KSxcbiAgICAgICAgbmFtZTogb3B0aW9ucy50aXRsZSxcbiAgICAgIH0pXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICBjb25zdCBiYWRnZU9mZnNldCA9IG9wdGlvbnMuYmFkZ2VPcHRpb25zID8gOCA6IDBcbiAgICAgIGxldCB4ID0gMzkgKyBiYWRnZU9mZnNldCxcbiAgICAgICAgeSA9IDQwICsgYmFkZ2VPZmZzZXRcbiAgICAgIGlmIChvcHRpb25zLnNpemUpIHtcbiAgICAgICAgeCA9IG9wdGlvbnMuc2l6ZS54XG4gICAgICAgIHkgPSBvcHRpb25zLnNpemUueVxuICAgICAgfVxuICAgICAgZmVhdHVyZS5zZXQoXG4gICAgICAgICd1bnNlbGVjdGVkU3R5bGUnLFxuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIGltYWdlOiBuZXcgSWNvbih7XG4gICAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB3aWR0aDogeCxcbiAgICAgICAgICAgIGhlaWdodDogeSxcbiAgICAgICAgICAgIGFuY2hvcjogW3ggLyAyIC0gYmFkZ2VPZmZzZXQgLyAyLCAwXSxcbiAgICAgICAgICAgIGFuY2hvck9yaWdpbjogJ2JvdHRvbS1sZWZ0JyxcbiAgICAgICAgICAgIGFuY2hvclhVbml0czogJ3BpeGVscycsXG4gICAgICAgICAgICBhbmNob3JZVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgZmVhdHVyZS5zZXQoXG4gICAgICAgICdzZWxlY3RlZFN0eWxlJyxcbiAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICBpbWFnZTogbmV3IEljb24oe1xuICAgICAgICAgICAgaW1nOiBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdvcmFuZ2UnLFxuICAgICAgICAgICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICAgICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHdpZHRoOiB4LFxuICAgICAgICAgICAgaGVpZ2h0OiB5LFxuICAgICAgICAgICAgYW5jaG9yOiBbeCAvIDIgLSBiYWRnZU9mZnNldCAvIDIsIDBdLFxuICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiAnYm90dG9tLWxlZnQnLFxuICAgICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICAgIGFuY2hvcllVbml0czogJ3BpeGVscycsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgICA/IGZlYXR1cmUuZ2V0KCdzZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICA6IGZlYXR1cmUuZ2V0KCd1bnNlbGVjdGVkU3R5bGUnKVxuICAgICAgKVxuICAgICAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IFZlY3RvclNvdXJjZSh7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgY29uc3QgdmVjdG9yTGF5ZXIgPSBuZXcgVmVjdG9yTGF5ZXIoe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgICAgekluZGV4OiAxLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIHBvbHlsaW5lIHV0aWxpemluZyB0aGUgcGFzc2VkIGluIGxpbmUgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZCwgYW5kIGEgY29sb3IuXG4gICAgICAgICAgICAqL1xuICAgIGFkZExpbmUobGluZTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IGxpbmVPYmplY3QgPSBsaW5lLm1hcCgoY29vcmRpbmF0ZTogYW55KSA9PlxuICAgICAgICBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGUpXG4gICAgICApXG4gICAgICBjb25zdCBmZWF0dXJlID0gbmV3IEZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IExpbmVTdHJpbmcobGluZU9iamVjdCksXG4gICAgICAgIG5hbWU6IG9wdGlvbnMudGl0bGUsXG4gICAgICB9KVxuICAgICAgZmVhdHVyZS5zZXRJZChvcHRpb25zLmlkKVxuICAgICAgY29uc3QgY29tbW9uU3R5bGUgPSBuZXcgU3R5bGUoe1xuICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgIGNvbG9yOiBvcHRpb25zLmNvbG9yIHx8IGRlZmF1bHRDb2xvcixcbiAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgfSksXG4gICAgICB9KVxuICAgICAgZmVhdHVyZS5zZXQoJ3Vuc2VsZWN0ZWRTdHlsZScsIFtcbiAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICAgIGNvbW1vblN0eWxlLFxuICAgICAgXSlcbiAgICAgIGZlYXR1cmUuc2V0KCdzZWxlY3RlZFN0eWxlJywgW1xuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICBjb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KSxcbiAgICAgICAgY29tbW9uU3R5bGUsXG4gICAgICBdKVxuICAgICAgZmVhdHVyZS5zZXRTdHlsZShcbiAgICAgICAgb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgICAgPyBmZWF0dXJlLmdldCgnc2VsZWN0ZWRTdHlsZScpXG4gICAgICAgICAgOiBmZWF0dXJlLmdldCgndW5zZWxlY3RlZFN0eWxlJylcbiAgICAgIClcbiAgICAgIGNvbnN0IHZlY3RvclNvdXJjZSA9IG5ldyBWZWN0b3JTb3VyY2Uoe1xuICAgICAgICBmZWF0dXJlczogW2ZlYXR1cmVdLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IHZlY3RvckxheWVyID0gbmV3IFZlY3RvckxheWVyKHtcbiAgICAgICAgc291cmNlOiB2ZWN0b3JTb3VyY2UsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgcG9seWdvbiBmaWxsIHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvbHlnb24gYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZC5cbiAgICAgICAgICAgICovXG4gICAgYWRkUG9seWdvbigpIHt9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byByZWZsZWN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIHNlbGVjdGVkLlxuICAgICAgICAgICAgIE9wdGlvbnMgcGFzc2VkIGluIGFyZSBjb2xvciBhbmQgaXNTZWxlY3RlZC5cbiAgICAgICAgICAgICAqL1xuICAgIHVwZGF0ZUNsdXN0ZXIoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShnZW9tZXRyeSkpIHtcbiAgICAgICAgZ2VvbWV0cnkuZm9yRWFjaCgoaW5uZXJHZW9tZXRyeSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlQ2x1c3Rlcihpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdlb21ldHJ5LmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF1cbiAgICAgICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGZlYXR1cmUuZ2V0R2VvbWV0cnkoKVxuICAgICAgICBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gUG9pbnQpIHtcbiAgICAgICAgICBnZW9tZXRyeS5zZXRaSW5kZXgob3B0aW9ucy5pc1NlbGVjdGVkID8gMiA6IDEpXG4gICAgICAgICAgc3dpdGNoIChvcHRpb25zLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdGVkJzpcbiAgICAgICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgnc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAncGFydGlhbGx5JzpcbiAgICAgICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgncGFydGlhbGx5U2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAndW5zZWxlY3RlZCc6XG4gICAgICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBMaW5lU3RyaW5nKSB7XG4gICAgICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsIC4xKScsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLDAsMCwgLjEpJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdXG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShzdHlsZXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gcmVmbGVjdCB3aGV0aGVyIG9yIG5vdCBpdCBpcyBzZWxlY3RlZC5cbiAgICAgICAgICAgICAgT3B0aW9ucyBwYXNzZWQgaW4gYXJlIGNvbG9yIGFuZCBpc1NlbGVjdGVkLlxuICAgICAgICAgICAgKi9cbiAgICB1cGRhdGVHZW9tZXRyeShnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGdlb21ldHJ5KSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVHZW9tZXRyeShpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdlb21ldHJ5LmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF1cbiAgICAgICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGZlYXR1cmUuZ2V0R2VvbWV0cnkoKVxuICAgICAgICBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gUG9pbnQpIHtcbiAgICAgICAgICBnZW9tZXRyeS5zZXRaSW5kZXgob3B0aW9ucy5pc1NlbGVjdGVkID8gMiA6IDEpXG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShcbiAgICAgICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgICAgICA/IGZlYXR1cmUuZ2V0KCdzZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICAgICAgOiBmZWF0dXJlLmdldCgndW5zZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gTGluZVN0cmluZykge1xuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgICAgICAgPyBmZWF0dXJlLmdldCgnc2VsZWN0ZWRTdHlsZScpXG4gICAgICAgICAgICAgIDogZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXRHZW9tZXRyeVN0eWxlKGdlb21ldHJ5OiBhbnksIG9wdGlvbnM6IGFueSwgZmVhdHVyZTogYW55KSB7XG4gICAgICBjb25zdCBnZW9tZXRyeUluc3RhbmNlID0gZmVhdHVyZS5nZXRHZW9tZXRyeSgpXG4gICAgICBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5nZXRUeXBlKCkgPT09ICdQb2ludCcpIHtcbiAgICAgICAgbGV0IHBvaW50V2lkdGggPSAzOVxuICAgICAgICBsZXQgcG9pbnRIZWlnaHQgPSA0MFxuICAgICAgICBpZiAob3B0aW9ucy5zaXplKSB7XG4gICAgICAgICAgcG9pbnRXaWR0aCA9IG9wdGlvbnMuc2l6ZS54XG4gICAgICAgICAgcG9pbnRIZWlnaHQgPSBvcHRpb25zLnNpemUueVxuICAgICAgICB9XG4gICAgICAgIGdlb21ldHJ5LnNldFpJbmRleChvcHRpb25zLmlzU2VsZWN0ZWQgPyAyIDogMSlcbiAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShcbiAgICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgICAgaW1nOiBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogb3B0aW9ucy5pc1NlbGVjdGVkID8gJ29yYW5nZScgOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIHdpZHRoOiBwb2ludFdpZHRoLFxuICAgICAgICAgICAgICBoZWlnaHQ6IHBvaW50SGVpZ2h0LFxuICAgICAgICAgICAgICBhbmNob3I6IFtwb2ludFdpZHRoIC8gMiwgMF0sXG4gICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogJ2JvdHRvbS1sZWZ0JyxcbiAgICAgICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICAgICAgYW5jaG9yWVVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5nZXRUeXBlKCkgPT09ICdMaW5lU3RyaW5nJykge1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBbXG4gICAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgICAgICBjb2xvcjogb3B0aW9ucy5jb2xvciB8fCBkZWZhdWx0Q29sb3IsXG4gICAgICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSksXG4gICAgICAgIF1cbiAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShzdHlsZXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBjcmVhdGVUZXh0U3R5bGUoZmVhdHVyZTogYW55LCByZXNvbHV0aW9uOiBhbnkpIHtcbiAgICAgIGNvbnN0IGZpbGxDb2xvciA9ICcjMDAwMDAwJ1xuICAgICAgY29uc3Qgb3V0bGluZUNvbG9yID0gJyNmZmZmZmYnXG4gICAgICBjb25zdCBvdXRsaW5lV2lkdGggPSAzXG4gICAgICByZXR1cm4gbmV3IG9sVGV4dCh7XG4gICAgICAgIHRleHQ6IHRoaXMuZ2V0VGV4dChmZWF0dXJlLCByZXNvbHV0aW9uKSxcbiAgICAgICAgZmlsbDogbmV3IEZpbGwoeyBjb2xvcjogZmlsbENvbG9yIH0pLFxuICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgIGNvbG9yOiBvdXRsaW5lQ29sb3IsXG4gICAgICAgICAgd2lkdGg6IG91dGxpbmVXaWR0aCxcbiAgICAgICAgfSksXG4gICAgICAgIG9mZnNldFg6IDIwLFxuICAgICAgICBvZmZzZXRZOiAtMTUsXG4gICAgICAgIHBsYWNlbWVudDogJ3BvaW50JyxcbiAgICAgICAgbWF4QW5nbGU6IDQ1LFxuICAgICAgICBvdmVyZmxvdzogdHJ1ZSxcbiAgICAgICAgcm90YXRpb246IDAsXG4gICAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgICBwYWRkaW5nOiBbNSwgNSwgNSwgNV0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2V0VGV4dChmZWF0dXJlOiBhbnksIHJlc29sdXRpb246IGFueSkge1xuICAgICAgY29uc3QgbWF4UmVzb2x1dGlvbiA9IDEyMDBcbiAgICAgIGNvbnN0IHRleHQgPVxuICAgICAgICByZXNvbHV0aW9uID4gbWF4UmVzb2x1dGlvbiA/ICcnIDogdGhpcy50cnVuYyhmZWF0dXJlLmdldCgnbmFtZScpLCAyMClcbiAgICAgIHJldHVybiB0ZXh0XG4gICAgfSxcbiAgICB0cnVuYyhzdHI6IGFueSwgbjogYW55KSB7XG4gICAgICByZXR1cm4gc3RyLmxlbmd0aCA+IG4gPyBzdHIuc3Vic3RyKDAsIG4gLSAxKSArICcuLi4nIDogc3RyLnN1YnN0cigwKVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIGJlIGhpZGRlblxuICAgICAgICAgICAgICovXG4gICAgaGlkZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGdlb21ldHJ5LnNldFZpc2libGUoZmFsc2UpXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgc2hvd25cbiAgICAgICAgICAgICAqL1xuICAgIHNob3dHZW9tZXRyeShnZW9tZXRyeTogYW55KSB7XG4gICAgICBnZW9tZXRyeS5zZXRWaXNpYmxlKHRydWUpXG4gICAgfSxcbiAgICByZW1vdmVHZW9tZXRyeShnZW9tZXRyeTogYW55KSB7XG4gICAgICBtYXAucmVtb3ZlTGF5ZXIoZ2VvbWV0cnkpXG4gICAgfSxcbiAgICBzaG93TXVsdGlMaW5lU2hhcGUobG9jYXRpb25Nb2RlbDogYW55KSB7XG4gICAgICBsZXQgbGluZU9iamVjdCA9IGxvY2F0aW9uTW9kZWwuZ2V0KCdtdWx0aWxpbmUnKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzIpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ3VuZGVmaW5lZCcuXG4gICAgICBpZiAodmFsaWRhdGVHZW8oJ211bHRpbGluZScsIEpTT04uc3RyaW5naWZ5KGxpbmVPYmplY3QpKS5lcnJvcikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGxpbmVPYmplY3QgPSBsaW5lT2JqZWN0Lm1hcCgobGluZTogYW55KSA9PlxuICAgICAgICBsaW5lLm1hcCgoY29vcmRzOiBhbnkpID0+IGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRzKSlcbiAgICAgIClcbiAgICAgIGxldCBmZWF0dXJlID0gbmV3IEZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IE11bHRpTGluZVN0cmluZyhsaW5lT2JqZWN0KSxcbiAgICAgIH0pXG4gICAgICBmZWF0dXJlLnNldElkKGxvY2F0aW9uTW9kZWwuY2lkKVxuICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICBjb2xvcjogbG9jYXRpb25Nb2RlbC5nZXQoJ2NvbG9yJykgfHwgZGVmYXVsdENvbG9yLFxuICAgICAgICAgICAgd2lkdGg6IDQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pLFxuICAgICAgXVxuICAgICAgZmVhdHVyZS5zZXRTdHlsZShzdHlsZXMpXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVWZWN0b3JMYXllcihsb2NhdGlvbk1vZGVsLCBmZWF0dXJlKVxuICAgIH0sXG4gICAgY3JlYXRlVmVjdG9yTGF5ZXIobG9jYXRpb25Nb2RlbDogYW55LCBmZWF0dXJlOiBhbnkpIHtcbiAgICAgIGxldCB2ZWN0b3JTb3VyY2UgPSBuZXcgVmVjdG9yU291cmNlKHtcbiAgICAgICAgZmVhdHVyZXM6IFtmZWF0dXJlXSxcbiAgICAgIH0pXG4gICAgICBsZXQgdmVjdG9yTGF5ZXIgPSBuZXcgVmVjdG9yTGF5ZXIoe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgIH0pXG4gICAgICBtYXAuYWRkTGF5ZXIodmVjdG9yTGF5ZXIpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIG92ZXJsYXlzW2xvY2F0aW9uTW9kZWwuY2lkXSA9IHZlY3RvckxheWVyXG4gICAgICByZXR1cm4gdmVjdG9yTGF5ZXJcbiAgICB9LFxuICAgIGRlc3Ryb3lTaGFwZShjaWQ6IGFueSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDYpIEZJWE1FOiBQYXJhbWV0ZXIgJ3NoYXBlJyBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlLlxuICAgICAgY29uc3Qgc2hhcGVJbmRleCA9IHNoYXBlcy5maW5kSW5kZXgoKHNoYXBlKSA9PiBjaWQgPT09IHNoYXBlLm1vZGVsLmNpZClcbiAgICAgIGlmIChzaGFwZUluZGV4ID49IDApIHtcbiAgICAgICAgc2hhcGVzW3NoYXBlSW5kZXhdLmRlc3Ryb3koKVxuICAgICAgICBzaGFwZXMuc3BsaWNlKHNoYXBlSW5kZXgsIDEpXG4gICAgICB9XG4gICAgfSxcbiAgICBkZXN0cm95U2hhcGVzKCkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDYpIEZJWE1FOiBQYXJhbWV0ZXIgJ3NoYXBlJyBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlLlxuICAgICAgc2hhcGVzLmZvckVhY2goKHNoYXBlKSA9PiB7XG4gICAgICAgIHNoYXBlLmRlc3Ryb3koKVxuICAgICAgfSlcbiAgICAgIHNoYXBlcyA9IFtdXG4gICAgfSxcbiAgICBnZXRNYXAoKSB7XG4gICAgICByZXR1cm4gbWFwXG4gICAgfSxcbiAgICB6b29tSW4oKSB7XG4gICAgICBjb25zdCB2aWV3ID0gbWFwLmdldFZpZXcoKVxuICAgICAgY29uc3Qgem9vbSA9IHZpZXcuZ2V0Wm9vbSgpXG4gICAgICBpZiAoem9vbSkge1xuICAgICAgICB2aWV3LnNldFpvb20oem9vbSArIDEpXG4gICAgICB9XG4gICAgfSxcbiAgICB6b29tT3V0KCkge1xuICAgICAgY29uc3QgdmlldyA9IG1hcC5nZXRWaWV3KClcbiAgICAgIGNvbnN0IHpvb20gPSB2aWV3LmdldFpvb20oKVxuICAgICAgaWYgKHpvb20pIHtcbiAgICAgICAgdmlldy5zZXRab29tKHpvb20gLSAxKVxuICAgICAgfVxuICAgIH0sXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHVubGlzdGVuVG9SZXNpemUoKVxuICAgIH0sXG4gIH1cbiAgcmV0dXJuIGV4cG9zZWRNZXRob2RzXG59XG4iXX0=