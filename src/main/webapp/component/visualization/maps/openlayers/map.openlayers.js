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
            feature.unselectedStyle = [
                new Style({
                    stroke: new Stroke({
                        color: 'white',
                        width: 8,
                    }),
                }),
                commonStyle,
            ];
            feature.selectedStyle = [
                new Style({
                    stroke: new Stroke({
                        color: 'black',
                        width: 8,
                    }),
                }),
                commonStyle,
            ];
            feature.setStyle(options.isSelected
                ? feature.selectedStyle
                : feature.unselectedStyle);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLm9wZW5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9vcGVubGF5ZXJzL21hcC5vcGVubGF5ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osNEJBQTRCO0FBQzVCLE9BQU8sT0FBTyxNQUFNLHFEQUFxRCxDQUFBO0FBQ3pFLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sY0FBYyxNQUFNLG1CQUFtQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUE7QUFDckUsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLElBQUksYUFBYSxFQUFFLE1BQU0sU0FBUyxDQUFBO0FBQ3pELE9BQU8sRUFBRSxNQUFNLElBQUksWUFBWSxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQ2xELE9BQU8sRUFBRSxNQUFNLElBQUksV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2hELE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQTtBQUNoQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM3RCxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsV0FBVyxJQUFJLGlCQUFpQixFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQzVELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxn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T0FBTztZQUNMLGdCQUFnQixFQUFFLENBQUE7UUFDcEIsQ0FBQztLQUNGLENBQUE7SUFDRCxPQUFPLGNBQWMsQ0FBQTtBQUN2QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG4vKiBnbG9iYWwgcmVxdWlyZSwgd2luZG93ICovXG5pbXBvcnQgd3JhcE51bSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvd3JhcC1udW0vd3JhcC1udW0nXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi91dGlsaXR5J1xuaW1wb3J0IERyYXdpbmdVdGlsaXR5IGZyb20gJy4uL0RyYXdpbmdVdGlsaXR5J1xuaW1wb3J0IHsgTXVsdGlMaW5lU3RyaW5nLCBMaW5lU3RyaW5nLCBQb2x5Z29uLCBQb2ludCB9IGZyb20gJ29sL2dlb20nXG5pbXBvcnQgeyBnZXQsIHRyYW5zZm9ybSBhcyBwcm9qVHJhbnNmb3JtIH0gZnJvbSAnb2wvcHJvaidcbmltcG9ydCB7IFZlY3RvciBhcyBWZWN0b3JTb3VyY2UgfSBmcm9tICdvbC9zb3VyY2UnXG5pbXBvcnQgeyBWZWN0b3IgYXMgVmVjdG9yTGF5ZXIgfSBmcm9tICdvbC9sYXllcidcbmltcG9ydCBGZWF0dXJlIGZyb20gJ29sL0ZlYXR1cmUnXG5pbXBvcnQgeyBTdHJva2UsIEljb24sIFRleHQgYXMgb2xUZXh0LCBGaWxsIH0gZnJvbSAnb2wvc3R5bGUnXG5pbXBvcnQgU3R5bGUgZnJvbSAnb2wvc3R5bGUvU3R5bGUnXG5pbXBvcnQgeyBJbWFnZSBhcyBJbWFnZUxheWVyIH0gZnJvbSAnb2wvbGF5ZXInXG5pbXBvcnQgeyBJbWFnZVN0YXRpYyBhcyBJbWFnZVN0YXRpY1NvdXJjZSB9IGZyb20gJ29sL3NvdXJjZSdcbmltcG9ydCB7IERyYWdQYW4gfSBmcm9tICdvbC9pbnRlcmFjdGlvbidcbmltcG9ydCB7IE9wZW5sYXllcnNMYXllcnMgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9jb250cm9sbGVycy9vcGVubGF5ZXJzLmxheWVycydcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi8uLi8uLi9qcy93cmVxcidcbmltcG9ydCB7IHZhbGlkYXRlR2VvIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL3ZhbGlkYXRpb24nXG5pbXBvcnQgeyBDbHVzdGVyVHlwZSB9IGZyb20gJy4uL3JlYWN0L2dlb21ldHJpZXMnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCBfZGVib3VuY2UgZnJvbSAnbG9kYXNoLmRlYm91bmNlJ1xuaW1wb3J0IHsgUHJvamVjdGlvbkxpa2UgfSBmcm9tICdvbC9wcm9qJ1xuaW1wb3J0IEdyb3VwIGZyb20gJ29sL2xheWVyL0dyb3VwJ1xuaW1wb3J0IHsgQ29vcmRpbmF0ZSB9IGZyb20gJ29sL2Nvb3JkaW5hdGUnXG5pbXBvcnQgTWFwIGZyb20gJ29sL01hcCdcbmltcG9ydCB7IGJvdW5kaW5nRXh0ZW50LCBjcmVhdGVFbXB0eSwgZXh0ZW5kIH0gZnJvbSAnb2wvZXh0ZW50J1xuaW1wb3J0IHsgZ2V0TGVuZ3RoIH0gZnJvbSAnb2wvc3BoZXJlJ1xuXG5jb25zdCBkZWZhdWx0Q29sb3IgPSAnIzNjNmRkNSdcbmZ1bmN0aW9uIGNyZWF0ZU1hcChpbnNlcnRpb25FbGVtZW50OiBhbnksIG1hcExheWVyczogYW55KSB7XG4gIGNvbnN0IGxheWVyQ29sbGVjdGlvbkNvbnRyb2xsZXIgPSBuZXcgT3BlbmxheWVyc0xheWVycyh7XG4gICAgY29sbGVjdGlvbjogbWFwTGF5ZXJzLFxuICB9KVxuICBjb25zdCBtYXAgPSBsYXllckNvbGxlY3Rpb25Db250cm9sbGVyLm1ha2VNYXAoe1xuICAgIHpvb206IDIuNyxcbiAgICBtaW5ab29tOiAyLjMsXG4gICAgY2VudGVyOiBbMCwgMF0sXG4gICAgZWxlbWVudDogaW5zZXJ0aW9uRWxlbWVudCxcbiAgfSlcbiAgcmV0dXJuIG1hcCBhcyBNYXBcbn1cbmZ1bmN0aW9uIGRldGVybWluZUlkRnJvbVBvc2l0aW9uKHBvc2l0aW9uOiBhbnksIG1hcDogYW55KSB7XG4gIGNvbnN0IGZlYXR1cmVzOiBhbnkgPSBbXVxuICBtYXAuZm9yRWFjaEZlYXR1cmVBdFBpeGVsKHBvc2l0aW9uLCAoZmVhdHVyZTogYW55KSA9PiB7XG4gICAgZmVhdHVyZXMucHVzaChmZWF0dXJlKVxuICB9KVxuICBpZiAoZmVhdHVyZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBmZWF0dXJlc1swXS5nZXRJZCgpXG4gIH1cbn1cbmZ1bmN0aW9uIGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihwb3NpdGlvbjogYW55LCBtYXA6IGFueSkge1xuICBjb25zdCBmZWF0dXJlczogYW55ID0gW11cbiAgbGV0IGlkLCBsb2NhdGlvbklkXG4gIG1hcC5mb3JFYWNoRmVhdHVyZUF0UGl4ZWwocG9zaXRpb24sIChmZWF0dXJlOiBhbnkpID0+IHtcbiAgICBmZWF0dXJlcy5wdXNoKGZlYXR1cmUpXG4gIH0pXG4gIGlmIChmZWF0dXJlcy5sZW5ndGggPiAwKSB7XG4gICAgaWQgPSBmZWF0dXJlc1swXS5nZXRJZCgpXG4gICAgbG9jYXRpb25JZCA9IGZlYXR1cmVzWzBdLmdldCgnbG9jYXRpb25JZCcpXG4gIH1cbiAgcmV0dXJuIHsgaWQsIGxvY2F0aW9uSWQgfVxufVxuZnVuY3Rpb24gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludDogW251bWJlciwgbnVtYmVyXSkge1xuICBjb25zdCBjb29yZHMgPSBbcG9pbnRbMF0sIHBvaW50WzFdXVxuICByZXR1cm4gcHJvalRyYW5zZm9ybShcbiAgICBjb29yZHMgYXMgQ29vcmRpbmF0ZSxcbiAgICAnRVBTRzo0MzI2JyxcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gIClcbn1cbmZ1bmN0aW9uIHVuY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludDogW251bWJlciwgbnVtYmVyXSkge1xuICByZXR1cm4gcHJvalRyYW5zZm9ybShcbiAgICBwb2ludCxcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpLFxuICAgICdFUFNHOjQzMjYnXG4gIClcbn1cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg2MTMzKSBGSVhNRTogJ2xvbmdpdHVkZScgaXMgZGVjbGFyZWQgYnV0IGl0cyB2YWx1ZSBpcyBuZXZlciByZWEuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuZnVuY3Rpb24gb2ZmTWFwKFtsb25naXR1ZGUsIGxhdGl0dWRlXSkge1xuICByZXR1cm4gbGF0aXR1ZGUgPCAtOTAgfHwgbGF0aXR1ZGUgPiA5MFxufVxuLy8gVGhlIGV4dGVuc2lvbiBhcmd1bWVudCBpcyBhIGZ1bmN0aW9uIHVzZWQgaW4gcGFuVG9FeHRlbnRcbi8vIEl0IGFsbG93cyBmb3IgY3VzdG9taXphdGlvbiBvZiB0aGUgd2F5IHRoZSBtYXAgcGFucyB0byByZXN1bHRzXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoXG4gIGluc2VydGlvbkVsZW1lbnQ6IGFueSxcbiAgX3NlbGVjdGlvbkludGVyZmFjZTogYW55LFxuICBfbm90aWZpY2F0aW9uRWw6IGFueSxcbiAgX2NvbXBvbmVudEVsZW1lbnQ6IGFueSxcbiAgbWFwTW9kZWw6IGFueSxcbiAgbWFwTGF5ZXJzOiBhbnlcbikge1xuICBsZXQgb3ZlcmxheXMgPSB7fVxuICBsZXQgc2hhcGVzOiBhbnkgPSBbXVxuICBjb25zdCBtYXAgPSBjcmVhdGVNYXAoaW5zZXJ0aW9uRWxlbWVudCwgbWFwTGF5ZXJzKVxuXG4gIHNldHVwVG9vbHRpcChtYXApXG4gIGZ1bmN0aW9uIHNldHVwVG9vbHRpcChtYXA6IGFueSkge1xuICAgIG1hcC5vbigncG9pbnRlcm1vdmUnLCAoZTogYW55KSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IHVuY29udmVydFBvaW50Q29vcmRpbmF0ZShlLmNvb3JkaW5hdGUpXG4gICAgICBpZiAoIW9mZk1hcChwb2ludCBhcyBhbnkpKSB7XG4gICAgICAgIG1hcE1vZGVsLnVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXMoe1xuICAgICAgICAgIGxhdDogcG9pbnRbMV0sXG4gICAgICAgICAgbG9uOiBwb2ludFswXSxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcE1vZGVsLmNsZWFyTW91c2VDb29yZGluYXRlcygpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBmdW5jdGlvbiByZXNpemVNYXAoKSB7XG4gICAgbWFwLnVwZGF0ZVNpemUoKVxuICB9XG4gIGNvbnN0IGRlYm91bmNlZFJlc2l6ZU1hcCA9IF9kZWJvdW5jZShyZXNpemVNYXAsIDI1MClcbiAgZnVuY3Rpb24gbGlzdGVuVG9SZXNpemUoKSB7XG4gICAgOyh3cmVxciBhcyBhbnkpLnZlbnQub24oJ3Jlc2l6ZScsIGRlYm91bmNlZFJlc2l6ZU1hcClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2VkUmVzaXplTWFwKVxuICB9XG4gIGZ1bmN0aW9uIHVubGlzdGVuVG9SZXNpemUoKSB7XG4gICAgOyh3cmVxciBhcyBhbnkpLnZlbnQub2ZmKCdyZXNpemUnLCBkZWJvdW5jZWRSZXNpemVNYXApXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlZFJlc2l6ZU1hcClcbiAgfVxuICBsaXN0ZW5Ub1Jlc2l6ZSgpXG4gIGxldCBnZW9EcmFnRG93bkxpc3RlbmVyOiBhbnlcbiAgbGV0IGdlb0RyYWdNb3ZlTGlzdGVuZXI6IGFueVxuICBsZXQgZ2VvRHJhZ1VwTGlzdGVuZXI6IGFueVxuICBsZXQgbGVmdENsaWNrTWFwQVBJTGlzdGVuZXI6IGFueVxuICBjb25zdCBleHBvc2VkTWV0aG9kcyA9IHtcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKHtcbiAgICAgIG1vdmVGcm9tLFxuICAgICAgZG93bixcbiAgICAgIG1vdmUsXG4gICAgICB1cCxcbiAgICB9OiB7XG4gICAgICBtb3ZlRnJvbT86IGFueVxuICAgICAgZG93bjogYW55XG4gICAgICBtb3ZlOiBhbnlcbiAgICAgIHVwOiBhbnlcbiAgICB9KSB7XG4gICAgICAvLyBkaXNhYmxlIHBhbm5pbmcgb2YgdGhlIG1hcFxuICAgICAgbWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goKGludGVyYWN0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGludGVyYWN0aW9uIGluc3RhbmNlb2YgRHJhZ1Bhbikge1xuICAgICAgICAgIGludGVyYWN0aW9uLnNldEFjdGl2ZShmYWxzZSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gZW5hYmxlIGRyYWdnaW5nIGluZGl2aWR1YWwgZmVhdHVyZXNcbiAgICAgIGdlb0RyYWdEb3duTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihldmVudC5waXhlbCwgbWFwKVxuICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG1hcC5nZXRDb29yZGluYXRlRnJvbVBpeGVsKGV2ZW50LnBpeGVsKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHsgbGF0aXR1ZGU6IGNvb3JkaW5hdGVzWzFdLCBsb25naXR1ZGU6IGNvb3JkaW5hdGVzWzBdIH1cbiAgICAgICAgZG93bih7IHBvc2l0aW9uOiBwb3NpdGlvbiwgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCB9KVxuICAgICAgfVxuICAgICAgbWFwLm9uKCdwb2ludGVyZG93bicgYXMgYW55LCBnZW9EcmFnRG93bkxpc3RlbmVyKVxuXG4gICAgICBnZW9EcmFnTW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZXZlbnQucGl4ZWwsIG1hcClcbiAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBtYXAuZ2V0Q29vcmRpbmF0ZUZyb21QaXhlbChldmVudC5waXhlbClcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBtb3ZlRnJvbVxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBsYXRpdHVkZTogY29vcmRpbmF0ZXNbMV0gLSBtb3ZlRnJvbS5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgbG9uZ2l0dWRlOiBjb29yZGluYXRlc1swXSAtIG1vdmVGcm9tLmxvbmdpdHVkZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IG51bGxcbiAgICAgICAgbW92ZSh7IHRyYW5zbGF0aW9uOiB0cmFuc2xhdGlvbiwgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCB9KVxuICAgICAgfVxuICAgICAgbWFwLm9uKCdwb2ludGVyZHJhZycsIGdlb0RyYWdNb3ZlTGlzdGVuZXIpXG5cbiAgICAgIGdlb0RyYWdVcExpc3RlbmVyID0gdXBcbiAgICAgIG1hcC5vbigncG9pbnRlcnVwJyBhcyBhbnksIGdlb0RyYWdVcExpc3RlbmVyKVxuICAgIH0sXG4gICAgY2xlYXJNb3VzZVRyYWNraW5nRm9yR2VvRHJhZygpIHtcbiAgICAgIC8vIHJlLWVuYWJsZSBwYW5uaW5nXG4gICAgICBtYXAuZ2V0SW50ZXJhY3Rpb25zKCkuZm9yRWFjaCgoaW50ZXJhY3Rpb246IGFueSkgPT4ge1xuICAgICAgICBpZiAoaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBEcmFnUGFuKSB7XG4gICAgICAgICAgaW50ZXJhY3Rpb24uc2V0QWN0aXZlKHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBpZiAoZ2VvRHJhZ0Rvd25MaXN0ZW5lcikge1xuICAgICAgICBtYXAudW4oJ3BvaW50ZXJkb3duJyBhcyBhbnksIGdlb0RyYWdEb3duTGlzdGVuZXIpXG4gICAgICB9XG4gICAgICBpZiAoZ2VvRHJhZ01vdmVMaXN0ZW5lcikge1xuICAgICAgICBtYXAudW4oJ3BvaW50ZXJkcmFnJywgZ2VvRHJhZ01vdmVMaXN0ZW5lcilcbiAgICAgIH1cbiAgICAgIGlmIChnZW9EcmFnVXBMaXN0ZW5lcikge1xuICAgICAgICBtYXAudW4oJ3BvaW50ZXJ1cCcgYXMgYW55LCBnZW9EcmFnVXBMaXN0ZW5lcilcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uTGVmdENsaWNrTWFwQVBJKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIGxlZnRDbGlja01hcEFQSUxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZXZlbnQucGl4ZWwsIG1hcClcbiAgICAgICAgY2FsbGJhY2sobG9jYXRpb25JZClcbiAgICAgIH1cbiAgICAgIG1hcC5vbignc2luZ2xlY2xpY2snLCBsZWZ0Q2xpY2tNYXBBUElMaXN0ZW5lcilcbiAgICB9LFxuICAgIGNsZWFyTGVmdENsaWNrTWFwQVBJKCkge1xuICAgICAgbWFwLnVuKCdzaW5nbGVjbGljaycsIGxlZnRDbGlja01hcEFQSUxpc3RlbmVyKVxuICAgIH0sXG4gICAgb25MZWZ0Q2xpY2soY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGNhbGxiYWNrKGUsIHtcbiAgICAgICAgICBtYXBUYXJnZXQ6IGRldGVybWluZUlkRnJvbVBvc2l0aW9uKFxuICAgICAgICAgICAgW2UuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0LCBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wXSxcbiAgICAgICAgICAgIG1hcFxuICAgICAgICAgICksXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgb25SaWdodENsaWNrKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgY2FsbGJhY2soZSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhclJpZ2h0Q2xpY2soKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9mZignY29udGV4dG1lbnUnKVxuICAgIH0sXG4gICAgb25Eb3VibGVDbGljaygpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ2RibGNsaWNrJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLmdldFRhcmdldEVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihcbiAgICAgICAgICBbZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BdLFxuICAgICAgICAgIG1hcFxuICAgICAgICApXG4gICAgICAgIGlmIChsb2NhdGlvbklkKSB7XG4gICAgICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignbG9jYXRpb246ZG91YmxlQ2xpY2snLCBsb2NhdGlvbklkKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJEb3VibGVDbGljaygpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub2ZmKCdkYmxjbGljaycpXG4gICAgfSxcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JQb3B1cChcbiAgICAgIGRvd25DYWxsYmFjazogYW55LFxuICAgICAgbW92ZUNhbGxiYWNrOiBhbnksXG4gICAgICB1cENhbGxiYWNrOiBhbnlcbiAgICApIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ21vdXNlZG93bicsICgpID0+IHtcbiAgICAgICAgZG93bkNhbGxiYWNrKClcbiAgICAgIH0pXG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9uKCdtb3VzZW1vdmUnLCAoKSA9PiB7XG4gICAgICAgIG1vdmVDYWxsYmFjaygpXG4gICAgICB9KVxuICAgICAgdGhpcy5vbkxlZnRDbGljayh1cENhbGxiYWNrKVxuICAgIH0sXG4gICAgb25Nb3VzZU1vdmUoY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLmdldFRhcmdldEVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IFtcbiAgICAgICAgICBlLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdCxcbiAgICAgICAgICBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wLFxuICAgICAgICBdXG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uLCBtYXApXG4gICAgICAgIGNhbGxiYWNrKGUsIHtcbiAgICAgICAgICBtYXBUYXJnZXQ6IGRldGVybWluZUlkRnJvbVBvc2l0aW9uKHBvc2l0aW9uLCBtYXApLFxuICAgICAgICAgIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJNb3VzZU1vdmUoKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9mZignbW91c2Vtb3ZlJylcbiAgICB9LFxuICAgIHRpbWVvdXRJZHM6IFtdIGFzIG51bWJlcltdLFxuICAgIG9uQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIHRoaXMudGltZW91dElkcy5mb3JFYWNoKCh0aW1lb3V0SWQ6IGFueSkgPT4ge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICAgIH0pXG4gICAgICB0aGlzLnRpbWVvdXRJZHMgPSBbXVxuICAgICAgbWFwLmFkZEV2ZW50TGlzdGVuZXIoJ21vdmVzdGFydCcsIGNhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIG1hcC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3Zlc3RhcnQnLCBjYWxsYmFjaylcbiAgICB9LFxuICAgIG9uQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBjb25zdCB0aW1lb3V0Q2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudGltZW91dElkcy5wdXNoKFxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICB9LCAzMDApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIG1hcC5hZGRFdmVudExpc3RlbmVyKCdtb3ZlZW5kJywgdGltZW91dENhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBtYXAucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW92ZWVuZCcsIGNhbGxiYWNrKVxuICAgIH0sXG4gICAgZG9QYW5ab29tKGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdKSB7XG4gICAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgICAgdGhhdC5wYW5ab29tT3V0KHsgZHVyYXRpb246IDEwMDAgfSwgKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGF0Lnpvb21Ub0V4dGVudChjb29yZHMsIHsgZHVyYXRpb246IDIwMDAgfSlcbiAgICAgICAgfSwgMClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwYW5ab29tT3V0KF9vcHRzOiBhbnksIG5leHQ6IGFueSkge1xuICAgICAgbmV4dCgpXG4gICAgfSxcbiAgICBwYW5Ub1Jlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IF8uZmxhdHRlbihcbiAgICAgICAgcmVzdWx0cy5tYXAoKHJlc3VsdDogYW55KSA9PiByZXN1bHQuZ2V0UG9pbnRzKCdsb2NhdGlvbicpKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICAgdGhpcy5wYW5Ub0V4dGVudChjb29yZGluYXRlcylcbiAgICB9LFxuICAgIHBhblRvRXh0ZW50KGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjb29yZHMpICYmIGNvb3Jkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxpbmVPYmplY3QgPSBjb29yZHMubWFwKChjb29yZGluYXRlKSA9PlxuICAgICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgICAgKVxuICAgICAgICBjb25zdCBleHRlbnQgPSBib3VuZGluZ0V4dGVudChsaW5lT2JqZWN0KVxuICAgICAgICBtYXAuZ2V0VmlldygpLmZpdChleHRlbnQsIHtcbiAgICAgICAgICBzaXplOiBtYXAuZ2V0U2l6ZSgpLFxuICAgICAgICAgIG1heFpvb206IG1hcC5nZXRWaWV3KCkuZ2V0Wm9vbSgpLFxuICAgICAgICAgIGR1cmF0aW9uOiA1MDAsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRFeHRlbnRPZklkcyhpZHM6IHN0cmluZ1tdKSB7XG4gICAgICB2YXIgZXh0ZW50ID0gY3JlYXRlRW1wdHkoKVxuICAgICAgbWFwLmdldExheWVycygpLmZvckVhY2goKGxheWVyOiBhbnkpID0+IHtcbiAgICAgICAgLy8gbWlnaHQgbmVlZCB0byBoYW5kbGUgZ3JvdXBzIGxhdGVyLCBidXQgbm8gcmVhc29uIHRvIHlldFxuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBWZWN0b3JMYXllciAmJiBpZHMuaW5jbHVkZXMobGF5ZXIuZ2V0KCdpZCcpKSkge1xuICAgICAgICAgIGV4dGVuZChleHRlbnQsIGxheWVyLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGV4dGVudFswXSA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBleHRlbnQgZm91bmQgZm9yIGlkcycpXG4gICAgICB9XG4gICAgICByZXR1cm4gZXh0ZW50XG4gICAgfSxcbiAgICB6b29tVG9JZHMoeyBpZHMsIGR1cmF0aW9uID0gNTAwIH06IHsgaWRzOiBzdHJpbmdbXTsgZHVyYXRpb24/OiBudW1iZXIgfSkge1xuICAgICAgbWFwLmdldFZpZXcoKS5maXQodGhpcy5nZXRFeHRlbnRPZklkcyhpZHMpLCB7XG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgfSlcbiAgICB9LFxuICAgIHBhblRvU2hhcGVzRXh0ZW50KHsgZHVyYXRpb24gPSA1MDAgfTogeyBkdXJhdGlvbj86IG51bWJlciB9ID0ge30pIHtcbiAgICAgIHZhciBleHRlbnQgPSBjcmVhdGVFbXB0eSgpXG4gICAgICBtYXAuZ2V0TGF5ZXJzKCkuZm9yRWFjaCgobGF5ZXI6IGFueSkgPT4ge1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBHcm91cCkge1xuICAgICAgICAgIGxheWVyLmdldExheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTGF5ZXI6IGFueSkge1xuICAgICAgICAgICAgLy9JZiB0aGlzIGlzIGEgdmVjdG9yIGxheWVyLCBhZGQgaXQgdG8gb3VyIGV4dGVudFxuICAgICAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2YgVmVjdG9yTGF5ZXIpXG4gICAgICAgICAgICAgIGV4dGVuZChleHRlbnQsIChncm91cExheWVyIGFzIGFueSkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCkpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIFZlY3RvckxheWVyICYmIGxheWVyLmdldCgnaWQnKSkge1xuICAgICAgICAgIGV4dGVuZChleHRlbnQsIGxheWVyLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGV4dGVudFswXSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgbWFwLmdldFZpZXcoKS5maXQoZXh0ZW50LCB7XG4gICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRTaGFwZXMoKSB7XG4gICAgICByZXR1cm4gc2hhcGVzXG4gICAgfSxcbiAgICB6b29tVG9FeHRlbnQoY29vcmRzOiBbbnVtYmVyLCBudW1iZXJdW10sIG9wdHMgPSB7fSkge1xuICAgICAgY29uc3QgbGluZU9iamVjdCA9IGNvb3Jkcy5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT5cbiAgICAgICAgY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKVxuICAgICAgKVxuICAgICAgY29uc3QgZXh0ZW50ID0gYm91bmRpbmdFeHRlbnQobGluZU9iamVjdClcbiAgICAgIG1hcC5nZXRWaWV3KCkuZml0KGV4dGVudCwge1xuICAgICAgICBzaXplOiBtYXAuZ2V0U2l6ZSgpLFxuICAgICAgICBtYXhab29tOiBtYXAuZ2V0VmlldygpLmdldFpvb20oKSxcbiAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgLi4ub3B0cyxcbiAgICAgIH0pXG4gICAgfSxcbiAgICB6b29tVG9Cb3VuZGluZ0JveCh7IG5vcnRoLCBlYXN0LCBzb3V0aCwgd2VzdCB9OiBhbnkpIHtcbiAgICAgIHRoaXMuem9vbVRvRXh0ZW50KFtcbiAgICAgICAgW3dlc3QsIHNvdXRoXSxcbiAgICAgICAgW2Vhc3QsIG5vcnRoXSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBsaW1pdCh2YWx1ZTogYW55LCBtaW46IGFueSwgbWF4OiBhbnkpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWx1ZSwgbWluKSwgbWF4KVxuICAgIH0sXG4gICAgZ2V0Qm91bmRpbmdCb3goKSB7XG4gICAgICBjb25zdCBleHRlbnQgPSBtYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudChtYXAuZ2V0U2l6ZSgpKVxuICAgICAgbGV0IGxvbmdpdHVkZUVhc3QgPSB3cmFwTnVtKGV4dGVudFsyXSwgLTE4MCwgMTgwKVxuICAgICAgY29uc3QgbG9uZ2l0dWRlV2VzdCA9IHdyYXBOdW0oZXh0ZW50WzBdLCAtMTgwLCAxODApXG4gICAgICAvL2FkZCAzNjAgZGVncmVlcyB0byBsb25naXR1ZGVFYXN0IHRvIGFjY29tbW9kYXRlIGJvdW5kaW5nIGJveGVzIHRoYXQgc3BhbiBhY3Jvc3MgdGhlIGFudGktbWVyaWRpYW5cbiAgICAgIGlmIChsb25naXR1ZGVFYXN0IDwgbG9uZ2l0dWRlV2VzdCkge1xuICAgICAgICBsb25naXR1ZGVFYXN0ICs9IDM2MFxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9ydGg6IHRoaXMubGltaXQoZXh0ZW50WzNdLCAtOTAsIDkwKSxcbiAgICAgICAgZWFzdDogbG9uZ2l0dWRlRWFzdCxcbiAgICAgICAgc291dGg6IHRoaXMubGltaXQoZXh0ZW50WzFdLCAtOTAsIDkwKSxcbiAgICAgICAgd2VzdDogbG9uZ2l0dWRlV2VzdCxcbiAgICAgIH1cbiAgICB9LFxuICAgIG92ZXJsYXlJbWFnZShtb2RlbDogTGF6eVF1ZXJ5UmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhY2FyZElkID0gbW9kZWwucGxhaW4uaWRcbiAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheShtZXRhY2FyZElkKVxuICAgICAgY29uc3QgY29vcmRzID0gbW9kZWwuZ2V0UG9pbnRzKCdsb2NhdGlvbicpXG4gICAgICBjb25zdCBhcnJheSA9IF8ubWFwKGNvb3JkcywgKGNvb3JkKSA9PiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkKSlcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBuZXcgUG9seWdvbihbYXJyYXldKVxuICAgICAgY29uc3QgZXh0ZW50ID0gcG9seWdvbi5nZXRFeHRlbnQoKVxuICAgICAgY29uc3QgcHJvamVjdGlvbiA9IGdldChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpKVxuICAgICAgY29uc3Qgb3ZlcmxheUxheWVyID0gbmV3IEltYWdlTGF5ZXIoe1xuICAgICAgICBzb3VyY2U6IG5ldyBJbWFnZVN0YXRpY1NvdXJjZSh7XG4gICAgICAgICAgdXJsOiBtb2RlbC5jdXJyZW50T3ZlcmxheVVybCB8fCAnJyxcbiAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qZWN0aW9uIGFzIFByb2plY3Rpb25MaWtlLFxuICAgICAgICAgIGltYWdlRXh0ZW50OiBleHRlbnQsXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcihvdmVybGF5TGF5ZXIpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIG92ZXJsYXlzW21ldGFjYXJkSWRdID0gb3ZlcmxheUxheWVyXG4gICAgfSxcbiAgICByZW1vdmVPdmVybGF5KG1ldGFjYXJkSWQ6IGFueSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBpZiAob3ZlcmxheXNbbWV0YWNhcmRJZF0pIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIG1hcC5yZW1vdmVMYXllcihvdmVybGF5c1ttZXRhY2FyZElkXSlcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGRlbGV0ZSBvdmVybGF5c1ttZXRhY2FyZElkXVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlQWxsT3ZlcmxheXMoKSB7XG4gICAgICBmb3IgKGNvbnN0IG92ZXJsYXkgaW4gb3ZlcmxheXMpIHtcbiAgICAgICAgaWYgKG92ZXJsYXlzLmhhc093blByb3BlcnR5KG92ZXJsYXkpKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgbWFwLnJlbW92ZUxheWVyKG92ZXJsYXlzW292ZXJsYXldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvdmVybGF5cyA9IHt9XG4gICAgfSxcbiAgICBnZXRDYXJ0b2dyYXBoaWNDZW50ZXJPZkNsdXN0ZXJJbkRlZ3JlZXMoY2x1c3RlcjogQ2x1c3RlclR5cGUpIHtcbiAgICAgIHJldHVybiB1dGlsaXR5LmNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cmllc0luRGVncmVlcyhcbiAgICAgICAgY2x1c3Rlci5yZXN1bHRzXG4gICAgICApXG4gICAgfSxcbiAgICBnZXRXaW5kb3dMb2NhdGlvbnNPZlJlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5ID1cbiAgICAgICAgICB1dGlsaXR5LmNhbGN1bGF0ZU9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5KHJlc3VsdClcbiAgICAgICAgY29uc3QgY2VudGVyID0gbWFwLmdldFBpeGVsRnJvbUNvb3JkaW5hdGUob3BlbmxheWVyc0NlbnRlck9mR2VvbWV0cnkpXG4gICAgICAgIGlmIChjZW50ZXIpIHtcbiAgICAgICAgICByZXR1cm4gY2VudGVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBkaXN0YW5jZSAoaW4gbWV0ZXJzKSBiZXR3ZWVuIHRoZSB0d28gcG9zaXRpb25zIGluIHRoZSBnaXZlbiBhcnJheSBvZlxuICAgICAqIENvb3JkaW5hdGVzLlxuICAgICAqL1xuICAgIGNhbGN1bGF0ZURpc3RhbmNlQmV0d2VlblBvc2l0aW9ucyhjb29yZHM6IGFueSkge1xuICAgICAgY29uc3QgbGluZSA9IG5ldyBMaW5lU3RyaW5nKGNvb3JkcylcbiAgICAgIGNvbnN0IHNwaGVyZUxlbmd0aCA9IGdldExlbmd0aChsaW5lKVxuICAgICAgcmV0dXJuIHNwaGVyZUxlbmd0aFxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgIEFkZHMgYSBiaWxsYm9hcmQgcG9pbnQgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAqL1xuICAgIGFkZFBvaW50V2l0aFRleHQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBmZWF0dXJlID0gbmV3IEZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHBvaW50T2JqZWN0KSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBiYWRnZU9mZnNldCA9IG9wdGlvbnMuYmFkZ2VPcHRpb25zID8gOCA6IDBcbiAgICAgIGNvbnN0IGltZ1dpZHRoID0gNDQgKyBiYWRnZU9mZnNldFxuICAgICAgY29uc3QgaW1nSGVpZ2h0ID0gNDQgKyBiYWRnZU9mZnNldFxuXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3Vuc2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB3aWR0aDogaW1nV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGZlYXR1cmUuc2V0KFxuICAgICAgICAncGFydGlhbGx5U2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB3aWR0aDogaW1nV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGZlYXR1cmUuc2V0KFxuICAgICAgICAnc2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdvcmFuZ2UnLFxuICAgICAgICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgd2lkdGg6IGltZ1dpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBpbWdIZWlnaHQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBzd2l0Y2ggKG9wdGlvbnMuaXNTZWxlY3RlZCkge1xuICAgICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgnc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3BhcnRpYWxseSc6XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgncGFydGlhbGx5U2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3Vuc2VsZWN0ZWQnOlxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjb25zdCB2ZWN0b3JTb3VyY2UgPSBuZXcgVmVjdG9yU291cmNlKHtcbiAgICAgICAgZmVhdHVyZXM6IFtmZWF0dXJlXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCB2ZWN0b3JMYXllciA9IG5ldyBWZWN0b3JMYXllcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgICB6SW5kZXg6IDEsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgYmlsbGJvYXJkIHBvaW50IHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRQb2ludChwb2ludDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvaW50T2JqZWN0ID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludClcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBuZXcgRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQocG9pbnRPYmplY3QpLFxuICAgICAgICBuYW1lOiBvcHRpb25zLnRpdGxlLFxuICAgICAgfSlcbiAgICAgIGZlYXR1cmUuc2V0SWQob3B0aW9ucy5pZClcbiAgICAgIGNvbnN0IGJhZGdlT2Zmc2V0ID0gb3B0aW9ucy5iYWRnZU9wdGlvbnMgPyA4IDogMFxuICAgICAgbGV0IHggPSAzOSArIGJhZGdlT2Zmc2V0LFxuICAgICAgICB5ID0gNDAgKyBiYWRnZU9mZnNldFxuICAgICAgaWYgKG9wdGlvbnMuc2l6ZSkge1xuICAgICAgICB4ID0gb3B0aW9ucy5zaXplLnhcbiAgICAgICAgeSA9IG9wdGlvbnMuc2l6ZS55XG4gICAgICB9XG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3Vuc2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0UGluKHtcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICAgICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHdpZHRoOiB4LFxuICAgICAgICAgICAgaGVpZ2h0OiB5LFxuICAgICAgICAgICAgYW5jaG9yOiBbeCAvIDIgLSBiYWRnZU9mZnNldCAvIDIsIDBdLFxuICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiAnYm90dG9tLWxlZnQnLFxuICAgICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICAgIGFuY2hvcllVbml0czogJ3BpeGVscycsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3NlbGVjdGVkU3R5bGUnLFxuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIGltYWdlOiBuZXcgSWNvbih7XG4gICAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogJ29yYW5nZScsXG4gICAgICAgICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgd2lkdGg6IHgsXG4gICAgICAgICAgICBoZWlnaHQ6IHksXG4gICAgICAgICAgICBhbmNob3I6IFt4IC8gMiAtIGJhZGdlT2Zmc2V0IC8gMiwgMF0sXG4gICAgICAgICAgICBhbmNob3JPcmlnaW46ICdib3R0b20tbGVmdCcsXG4gICAgICAgICAgICBhbmNob3JYVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgYW5jaG9yWVVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gZmVhdHVyZS5nZXQoJ3NlbGVjdGVkU3R5bGUnKVxuICAgICAgICAgIDogZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpXG4gICAgICApXG4gICAgICBjb25zdCB2ZWN0b3JTb3VyY2UgPSBuZXcgVmVjdG9yU291cmNlKHtcbiAgICAgICAgZmVhdHVyZXM6IFtmZWF0dXJlXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCB2ZWN0b3JMYXllciA9IG5ldyBWZWN0b3JMYXllcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgICB6SW5kZXg6IDEsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgcG9seWxpbmUgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gbGluZSBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgICAgICovXG4gICAgYWRkTGluZShsaW5lOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgbGluZU9iamVjdCA9IGxpbmUubWFwKChjb29yZGluYXRlOiBhbnkpID0+XG4gICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBuZXcgRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgTGluZVN0cmluZyhsaW5lT2JqZWN0KSxcbiAgICAgICAgbmFtZTogb3B0aW9ucy50aXRsZSxcbiAgICAgIH0pXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICBjb25zdCBjb21tb25TdHlsZSA9IG5ldyBTdHlsZSh7XG4gICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29sb3IgfHwgZGVmYXVsdENvbG9yLFxuICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICA7KGZlYXR1cmUgYXMgYW55KS51bnNlbGVjdGVkU3R5bGUgPSBbXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pLFxuICAgICAgICBjb21tb25TdHlsZSxcbiAgICAgIF1cbiAgICAgIDsoZmVhdHVyZSBhcyBhbnkpLnNlbGVjdGVkU3R5bGUgPSBbXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgIGNvbG9yOiAnYmxhY2snLFxuICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pLFxuICAgICAgICBjb21tb25TdHlsZSxcbiAgICAgIF1cbiAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gKGZlYXR1cmUgYXMgYW55KS5zZWxlY3RlZFN0eWxlXG4gICAgICAgICAgOiAoZmVhdHVyZSBhcyBhbnkpLnVuc2VsZWN0ZWRTdHlsZVxuICAgICAgKVxuICAgICAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IFZlY3RvclNvdXJjZSh7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgY29uc3QgdmVjdG9yTGF5ZXIgPSBuZXcgVmVjdG9yTGF5ZXIoe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgIH0pXG4gICAgICBtYXAuYWRkTGF5ZXIodmVjdG9yTGF5ZXIpXG4gICAgICByZXR1cm4gdmVjdG9yTGF5ZXJcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBwb2x5Z29uIGZpbGwgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9seWdvbiBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRQb2x5Z29uKCkge30sXG4gICAgLypcbiAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIHJlZmxlY3Qgd2hldGhlciBvciBub3QgaXQgaXMgc2VsZWN0ZWQuXG4gICAgICAgICAgICAgT3B0aW9ucyBwYXNzZWQgaW4gYXJlIGNvbG9yIGFuZCBpc1NlbGVjdGVkLlxuICAgICAgICAgICAgICovXG4gICAgdXBkYXRlQ2x1c3RlcihnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGdlb21ldHJ5KSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVDbHVzdGVyKGlubmVyR2VvbWV0cnksIG9wdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2VvbWV0cnkuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXVxuICAgICAgICBjb25zdCBnZW9tZXRyeUluc3RhbmNlID0gZmVhdHVyZS5nZXRHZW9tZXRyeSgpXG4gICAgICAgIGlmIChnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBQb2ludCkge1xuICAgICAgICAgIGdlb21ldHJ5LnNldFpJbmRleChvcHRpb25zLmlzU2VsZWN0ZWQgPyAyIDogMSlcbiAgICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKGZlYXR1cmUuZ2V0KCdzZWxlY3RlZFN0eWxlJykpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlICdwYXJ0aWFsbHknOlxuICAgICAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKGZlYXR1cmUuZ2V0KCdwYXJ0aWFsbHlTZWxlY3RlZFN0eWxlJykpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlICd1bnNlbGVjdGVkJzpcbiAgICAgICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgndW5zZWxlY3RlZFN0eWxlJykpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5SW5zdGFuY2UuY29uc3RydWN0b3IgPT09IExpbmVTdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBzdHlsZXMgPSBbXG4gICAgICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwgLjEpJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsMCwwLCAuMSknLFxuICAgICAgICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF1cbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byByZWZsZWN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIHNlbGVjdGVkLlxuICAgICAgICAgICAgICBPcHRpb25zIHBhc3NlZCBpbiBhcmUgY29sb3IgYW5kIGlzU2VsZWN0ZWQuXG4gICAgICAgICAgICAqL1xuICAgIHVwZGF0ZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZ2VvbWV0cnkpKSB7XG4gICAgICAgIGdlb21ldHJ5LmZvckVhY2goKGlubmVyR2VvbWV0cnkpID0+IHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUdlb21ldHJ5KGlubmVyR2VvbWV0cnksIG9wdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2VvbWV0cnkuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXVxuICAgICAgICBjb25zdCBnZW9tZXRyeUluc3RhbmNlID0gZmVhdHVyZS5nZXRHZW9tZXRyeSgpXG4gICAgICAgIGlmIChnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBQb2ludCkge1xuICAgICAgICAgIGdlb21ldHJ5LnNldFpJbmRleChvcHRpb25zLmlzU2VsZWN0ZWQgPyAyIDogMSlcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICAgICAgb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgICAgICAgID8gZmVhdHVyZS5nZXQoJ3NlbGVjdGVkU3R5bGUnKVxuICAgICAgICAgICAgICA6IGZlYXR1cmUuZ2V0KCd1bnNlbGVjdGVkU3R5bGUnKVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBMaW5lU3RyaW5nKSB7XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShcbiAgICAgICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgICAgICA/IGZlYXR1cmUuZ2V0KCdzZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICAgICAgOiBmZWF0dXJlLmdldCgndW5zZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldEdlb21ldHJ5U3R5bGUoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55LCBmZWF0dXJlOiBhbnkpIHtcbiAgICAgIGNvbnN0IGdlb21ldHJ5SW5zdGFuY2UgPSBmZWF0dXJlLmdldEdlb21ldHJ5KClcbiAgICAgIGlmIChnZW9tZXRyeUluc3RhbmNlLmdldFR5cGUoKSA9PT0gJ1BvaW50Jykge1xuICAgICAgICBsZXQgcG9pbnRXaWR0aCA9IDM5XG4gICAgICAgIGxldCBwb2ludEhlaWdodCA9IDQwXG4gICAgICAgIGlmIChvcHRpb25zLnNpemUpIHtcbiAgICAgICAgICBwb2ludFdpZHRoID0gb3B0aW9ucy5zaXplLnhcbiAgICAgICAgICBwb2ludEhlaWdodCA9IG9wdGlvbnMuc2l6ZS55XG4gICAgICAgIH1cbiAgICAgICAgZ2VvbWV0cnkuc2V0WkluZGV4KG9wdGlvbnMuaXNTZWxlY3RlZCA/IDIgOiAxKVxuICAgICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgICBpbWFnZTogbmV3IEljb24oe1xuICAgICAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmlzU2VsZWN0ZWQgPyAnb3JhbmdlJyA6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgd2lkdGg6IHBvaW50V2lkdGgsXG4gICAgICAgICAgICAgIGhlaWdodDogcG9pbnRIZWlnaHQsXG4gICAgICAgICAgICAgIGFuY2hvcjogW3BvaW50V2lkdGggLyAyLCAwXSxcbiAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiAnYm90dG9tLWxlZnQnLFxuICAgICAgICAgICAgICBhbmNob3JYVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgICBhbmNob3JZVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeUluc3RhbmNlLmdldFR5cGUoKSA9PT0gJ0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IFtcbiAgICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICAgIGNvbG9yOiBvcHRpb25zLmNvbG9yIHx8IGRlZmF1bHRDb2xvcixcbiAgICAgICAgICAgICAgd2lkdGg6IDQsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXVxuICAgICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgIH1cbiAgICB9LFxuICAgIGNyZWF0ZVRleHRTdHlsZShmZWF0dXJlOiBhbnksIHJlc29sdXRpb246IGFueSkge1xuICAgICAgY29uc3QgZmlsbENvbG9yID0gJyMwMDAwMDAnXG4gICAgICBjb25zdCBvdXRsaW5lQ29sb3IgPSAnI2ZmZmZmZidcbiAgICAgIGNvbnN0IG91dGxpbmVXaWR0aCA9IDNcbiAgICAgIHJldHVybiBuZXcgb2xUZXh0KHtcbiAgICAgICAgdGV4dDogdGhpcy5nZXRUZXh0KGZlYXR1cmUsIHJlc29sdXRpb24pLFxuICAgICAgICBmaWxsOiBuZXcgRmlsbCh7IGNvbG9yOiBmaWxsQ29sb3IgfSksXG4gICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgY29sb3I6IG91dGxpbmVDb2xvcixcbiAgICAgICAgICB3aWR0aDogb3V0bGluZVdpZHRoLFxuICAgICAgICB9KSxcbiAgICAgICAgb2Zmc2V0WDogMjAsXG4gICAgICAgIG9mZnNldFk6IC0xNSxcbiAgICAgICAgcGxhY2VtZW50OiAncG9pbnQnLFxuICAgICAgICBtYXhBbmdsZTogNDUsXG4gICAgICAgIG92ZXJmbG93OiB0cnVlLFxuICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgIHBhZGRpbmc6IFs1LCA1LCA1LCA1XSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRUZXh0KGZlYXR1cmU6IGFueSwgcmVzb2x1dGlvbjogYW55KSB7XG4gICAgICBjb25zdCBtYXhSZXNvbHV0aW9uID0gMTIwMFxuICAgICAgY29uc3QgdGV4dCA9XG4gICAgICAgIHJlc29sdXRpb24gPiBtYXhSZXNvbHV0aW9uID8gJycgOiB0aGlzLnRydW5jKGZlYXR1cmUuZ2V0KCduYW1lJyksIDIwKVxuICAgICAgcmV0dXJuIHRleHRcbiAgICB9LFxuICAgIHRydW5jKHN0cjogYW55LCBuOiBhbnkpIHtcbiAgICAgIHJldHVybiBzdHIubGVuZ3RoID4gbiA/IHN0ci5zdWJzdHIoMCwgbiAtIDEpICsgJy4uLicgOiBzdHIuc3Vic3RyKDApXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgaGlkZGVuXG4gICAgICAgICAgICAgKi9cbiAgICBoaWRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgZ2VvbWV0cnkuc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byBiZSBzaG93blxuICAgICAgICAgICAgICovXG4gICAgc2hvd0dlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGdlb21ldHJ5LnNldFZpc2libGUodHJ1ZSlcbiAgICB9LFxuICAgIHJlbW92ZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIG1hcC5yZW1vdmVMYXllcihnZW9tZXRyeSlcbiAgICB9LFxuICAgIHNob3dNdWx0aUxpbmVTaGFwZShsb2NhdGlvbk1vZGVsOiBhbnkpIHtcbiAgICAgIGxldCBsaW5lT2JqZWN0ID0gbG9jYXRpb25Nb2RlbC5nZXQoJ211bHRpbGluZScpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMikgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAndW5kZWZpbmVkJy5cbiAgICAgIGlmICh2YWxpZGF0ZUdlbygnbXVsdGlsaW5lJywgSlNPTi5zdHJpbmdpZnkobGluZU9iamVjdCkpLmVycm9yKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgbGluZU9iamVjdCA9IGxpbmVPYmplY3QubWFwKChsaW5lOiBhbnkpID0+XG4gICAgICAgIGxpbmUubWFwKChjb29yZHM6IGFueSkgPT4gY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZHMpKVxuICAgICAgKVxuICAgICAgbGV0IGZlYXR1cmUgPSBuZXcgRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgTXVsdGlMaW5lU3RyaW5nKGxpbmVPYmplY3QpLFxuICAgICAgfSlcbiAgICAgIGZlYXR1cmUuc2V0SWQobG9jYXRpb25Nb2RlbC5jaWQpXG4gICAgICBjb25zdCBzdHlsZXMgPSBbXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgIGNvbG9yOiBsb2NhdGlvbk1vZGVsLmdldCgnY29sb3InKSB8fCBkZWZhdWx0Q29sb3IsXG4gICAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICBdXG4gICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVZlY3RvckxheWVyKGxvY2F0aW9uTW9kZWwsIGZlYXR1cmUpXG4gICAgfSxcbiAgICBjcmVhdGVWZWN0b3JMYXllcihsb2NhdGlvbk1vZGVsOiBhbnksIGZlYXR1cmU6IGFueSkge1xuICAgICAgbGV0IHZlY3RvclNvdXJjZSA9IG5ldyBWZWN0b3JTb3VyY2Uoe1xuICAgICAgICBmZWF0dXJlczogW2ZlYXR1cmVdLFxuICAgICAgfSlcbiAgICAgIGxldCB2ZWN0b3JMYXllciA9IG5ldyBWZWN0b3JMYXllcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgb3ZlcmxheXNbbG9jYXRpb25Nb2RlbC5jaWRdID0gdmVjdG9yTGF5ZXJcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgZGVzdHJveVNoYXBlKGNpZDogYW55KSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBjb25zdCBzaGFwZUluZGV4ID0gc2hhcGVzLmZpbmRJbmRleCgoc2hhcGUpID0+IGNpZCA9PT0gc2hhcGUubW9kZWwuY2lkKVxuICAgICAgaWYgKHNoYXBlSW5kZXggPj0gMCkge1xuICAgICAgICBzaGFwZXNbc2hhcGVJbmRleF0uZGVzdHJveSgpXG4gICAgICAgIHNoYXBlcy5zcGxpY2Uoc2hhcGVJbmRleCwgMSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlc3Ryb3lTaGFwZXMoKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcbiAgICAgICAgc2hhcGUuZGVzdHJveSgpXG4gICAgICB9KVxuICAgICAgc2hhcGVzID0gW11cbiAgICB9LFxuICAgIGdldE1hcCgpIHtcbiAgICAgIHJldHVybiBtYXBcbiAgICB9LFxuICAgIHpvb21JbigpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSBtYXAuZ2V0VmlldygpXG4gICAgICBjb25zdCB6b29tID0gdmlldy5nZXRab29tKClcbiAgICAgIGlmICh6b29tKSB7XG4gICAgICAgIHZpZXcuc2V0Wm9vbSh6b29tICsgMSlcbiAgICAgIH1cbiAgICB9LFxuICAgIHpvb21PdXQoKSB7XG4gICAgICBjb25zdCB2aWV3ID0gbWFwLmdldFZpZXcoKVxuICAgICAgY29uc3Qgem9vbSA9IHZpZXcuZ2V0Wm9vbSgpXG4gICAgICBpZiAoem9vbSkge1xuICAgICAgICB2aWV3LnNldFpvb20oem9vbSAtIDEpXG4gICAgICB9XG4gICAgfSxcbiAgICBkZXN0cm95KCkge1xuICAgICAgdW5saXN0ZW5Ub1Jlc2l6ZSgpXG4gICAgfSxcbiAgfVxuICByZXR1cm4gZXhwb3NlZE1ldGhvZHNcbn1cbiJdfQ==