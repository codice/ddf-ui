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
var rulerColor = '#506f85';
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
    /*
     * Returns a visible label that is in the same location as the provided label (geometryInstance) if one exists.
     * If findSelected is true, the function will also check for hidden labels in the same location but are selected.
     */
    function findOverlappingLabel(findSelected, geometryInstance) {
        return _.find(mapModel.get('labels'), function (label) {
            return label.getSource().getFeatures()[0].getGeometry().getCoordinates()[0] ===
                geometryInstance.getCoordinates()[0] &&
                label.getSource().getFeatures()[0].getGeometry().getCoordinates()[1] ===
                    geometryInstance.getCoordinates()[1] &&
                ((findSelected && label.get('isSelected')) || label.getVisible());
        });
    }
    /*
          Only shows one label if there are multiple labels in the same location.
    
          Show the label in the following importance:
            - it is selected
            - there is no other label displayed at the same location
            - it is the label that was found by findOverlappingLabel
    
          Arguments are:
            - the label to show/hide (geometry, feature)
            - if the label is selected
            - if the search for overlapping label should include hidden selected labels
          */
    function showHideLabel(_a) {
        var geometry = _a.geometry, feature = _a.feature, _b = _a.findSelected, findSelected = _b === void 0 ? false : _b;
        var isSelected = geometry.get('isSelected');
        var geometryInstance = feature.getGeometry();
        var labelWithSamePosition = findOverlappingLabel(findSelected, geometryInstance);
        if (isSelected &&
            labelWithSamePosition &&
            !labelWithSamePosition.get('isSelected')) {
            labelWithSamePosition.setVisible(false);
        }
        var otherLabelNotSelected = labelWithSamePosition
            ? !labelWithSamePosition.get('isSelected')
            : true;
        var visible = (isSelected && otherLabelNotSelected) ||
            !labelWithSamePosition ||
            geometry.get('id') === labelWithSamePosition.get('id');
        geometry.setVisible(visible);
    }
    /*
          Shows a hidden label. Used when deleting a label that is shown.
          */
    function showHiddenLabel(geometry) {
        if (!geometry.getVisible()) {
            return;
        }
        var geometryInstance = geometry.getSource().getFeatures()[0].getGeometry();
        var hiddenLabel = _.find(mapModel.get('labels'), function (label) {
            return label.getSource().getFeatures()[0].getGeometry().getCoordinates()[0] ===
                geometryInstance.getCoordinates()[0] &&
                label.getSource().getFeatures()[0].getGeometry().getCoordinates()[1] ===
                    geometryInstance.getCoordinates()[1] &&
                label.get('id') !== geometry.get('id') &&
                !label.getVisible();
        });
        if (hiddenLabel) {
            hiddenLabel.setVisible(true);
        }
    }
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
         * Draws a marker on the map designating a start/end point for the ruler measurement. The given
         * coordinates should be an object with 'lat' and 'lon' keys with degrees values. The given
         * marker label should be a single character or digit that is displayed on the map marker.
         */
        addRulerPoint: function (coordinates, markerLabel) {
            var lat = coordinates.lat, lon = coordinates.lon;
            var point = [lon, lat];
            var options = {
                id: markerLabel,
                color: rulerColor,
            };
            return this.addPoint(point, options);
        },
        /*
         * Removes the given point Layer from the map.
         */
        removeRulerPoint: function (pointLayer) {
            map.removeLayer(pointLayer);
        },
        rulerLine: null,
        /*
         * Draws a line on the map between the points in the given array of point Vectors.
         */
        addRulerLine: function (point) {
            var options = {
                id: 'ruler-line',
                title: 'Line for ruler measurement',
                color: '#506F85',
            };
            var startingCoordinates = mapModel.get('startingCoordinates');
            var linePoints = [
                [startingCoordinates['lon'], startingCoordinates['lat']],
                [point['lon'], point['lat']],
            ];
            this.rulerLine = this.addLine(linePoints, options);
            return this.rulerLine;
        },
        /*
         * Update the position of the ruler line
         */
        setRulerLine: function (point) {
            this.removeRulerLine();
            this.addRulerLine(point);
        },
        /*
         * Removes the given line Layer from the map.
         */
        removeRulerLine: function () {
            if (this.rulerLine) {
                map.removeLayer(this.rulerLine);
            }
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
                  Adds a label utilizing the passed in point and options.
                  Options are an id and text.
                */
        addLabel: function (point, options) {
            var pointObject = convertPointCoordinate(point);
            var feature = new Feature({
                geometry: new Point(pointObject),
                name: options.text,
                isLabel: true,
            });
            feature.setId(options.id);
            feature.setStyle(new Style({
                text: new olText({
                    text: options.text,
                    overflow: true,
                }),
            }));
            var vectorSource = new VectorSource({
                features: [feature],
            });
            var vectorLayer = new VectorLayer({
                source: vectorSource,
                zIndex: 1,
                // @ts-ignore
                id: options.id,
                isSelected: false,
            });
            map.addLayer(vectorLayer);
            mapModel.addLabel(vectorLayer);
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
                if (!feature.getProperties().isLabel) {
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
                else {
                    feature.setStyle(new Style({
                        text: this.createTextStyle(feature, map.getView().getResolution()),
                    }));
                    geometry.set('isSelected', options.isSelected);
                    showHideLabel({
                        geometry: geometry,
                        feature: feature,
                    });
                }
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
            var feature = geometry.getSource().getFeatures()[0];
            if (feature.getProperties().isLabel) {
                showHideLabel({
                    geometry: geometry,
                    feature: feature,
                    findSelected: true,
                });
            }
            else {
                geometry.setVisible(true);
            }
        },
        removeGeometry: function (geometry) {
            var feature = geometry.getSource().getFeatures()[0];
            if (feature.getProperties().isLabel) {
                mapModel.removeLabel(geometry);
                showHiddenLabel(geometry);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLm9wZW5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9vcGVubGF5ZXJzL21hcC5vcGVubGF5ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osNEJBQTRCO0FBQzVCLE9BQU8sT0FBTyxNQUFNLHFEQUFxRCxDQUFBO0FBQ3pFLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sY0FBYyxNQUFNLG1CQUFtQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUE7QUFDckUsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLElBQUksYUFBYSxFQUFFLE1BQU0sU0FBUyxDQUFBO0FBQ3pELE9BQU8sRUFBRSxNQUFNLElBQUksWUFBWSxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQ2xELE9BQU8sRUFBRSxNQUFNLElBQUksV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2hELE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQTtBQUNoQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM3RCxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsV0FBVyxJQUFJLGlCQUFpQixFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQzVELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxn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LENBQUMsT0FBTyxFQUFFLENBQUE7WUFDM0IsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUN4QixDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU87WUFDTCxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDMUIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQzNCLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDeEIsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPO1lBQ0wsZ0JBQWdCLEVBQUUsQ0FBQTtRQUNwQixDQUFDO0tBQ0YsQ0FBQTtJQUNELE9BQU8sY0FBYyxDQUFBO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qIGdsb2JhbCByZXF1aXJlLCB3aW5kb3cgKi9cbmltcG9ydCB3cmFwTnVtIGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy93cmFwLW51bS93cmFwLW51bSdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuL3V0aWxpdHknXG5pbXBvcnQgRHJhd2luZ1V0aWxpdHkgZnJvbSAnLi4vRHJhd2luZ1V0aWxpdHknXG5pbXBvcnQgeyBNdWx0aUxpbmVTdHJpbmcsIExpbmVTdHJpbmcsIFBvbHlnb24sIFBvaW50IH0gZnJvbSAnb2wvZ2VvbSdcbmltcG9ydCB7IGdldCwgdHJhbnNmb3JtIGFzIHByb2pUcmFuc2Zvcm0gfSBmcm9tICdvbC9wcm9qJ1xuaW1wb3J0IHsgVmVjdG9yIGFzIFZlY3RvclNvdXJjZSB9IGZyb20gJ29sL3NvdXJjZSdcbmltcG9ydCB7IFZlY3RvciBhcyBWZWN0b3JMYXllciB9IGZyb20gJ29sL2xheWVyJ1xuaW1wb3J0IEZlYXR1cmUgZnJvbSAnb2wvRmVhdHVyZSdcbmltcG9ydCB7IFN0cm9rZSwgSWNvbiwgVGV4dCBhcyBvbFRleHQsIEZpbGwgfSBmcm9tICdvbC9zdHlsZSdcbmltcG9ydCBTdHlsZSBmcm9tICdvbC9zdHlsZS9TdHlsZSdcbmltcG9ydCB7IEltYWdlIGFzIEltYWdlTGF5ZXIgfSBmcm9tICdvbC9sYXllcidcbmltcG9ydCB7IEltYWdlU3RhdGljIGFzIEltYWdlU3RhdGljU291cmNlIH0gZnJvbSAnb2wvc291cmNlJ1xuaW1wb3J0IHsgRHJhZ1BhbiB9IGZyb20gJ29sL2ludGVyYWN0aW9uJ1xuaW1wb3J0IHsgT3BlbmxheWVyc0xheWVycyB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL2NvbnRyb2xsZXJzL29wZW5sYXllcnMubGF5ZXJzJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IHsgdmFsaWRhdGVHZW8gfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCB7IENsdXN0ZXJUeXBlIH0gZnJvbSAnLi4vcmVhY3QvZ2VvbWV0cmllcydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IF9kZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5pbXBvcnQgeyBQcm9qZWN0aW9uTGlrZSB9IGZyb20gJ29sL3Byb2onXG5pbXBvcnQgR3JvdXAgZnJvbSAnb2wvbGF5ZXIvR3JvdXAnXG5pbXBvcnQgeyBDb29yZGluYXRlIH0gZnJvbSAnb2wvY29vcmRpbmF0ZSdcbmltcG9ydCBNYXAgZnJvbSAnb2wvTWFwJ1xuaW1wb3J0IHsgYm91bmRpbmdFeHRlbnQsIGNyZWF0ZUVtcHR5LCBleHRlbmQgfSBmcm9tICdvbC9leHRlbnQnXG5pbXBvcnQgeyBnZXRMZW5ndGggfSBmcm9tICdvbC9zcGhlcmUnXG5cbmNvbnN0IGRlZmF1bHRDb2xvciA9ICcjM2M2ZGQ1J1xuY29uc3QgcnVsZXJDb2xvciA9ICcjNTA2Zjg1J1xuZnVuY3Rpb24gY3JlYXRlTWFwKGluc2VydGlvbkVsZW1lbnQ6IGFueSwgbWFwTGF5ZXJzOiBhbnkpIHtcbiAgY29uc3QgbGF5ZXJDb2xsZWN0aW9uQ29udHJvbGxlciA9IG5ldyBPcGVubGF5ZXJzTGF5ZXJzKHtcbiAgICBjb2xsZWN0aW9uOiBtYXBMYXllcnMsXG4gIH0pXG4gIGNvbnN0IG1hcCA9IGxheWVyQ29sbGVjdGlvbkNvbnRyb2xsZXIubWFrZU1hcCh7XG4gICAgem9vbTogMi43LFxuICAgIG1pblpvb206IDIuMyxcbiAgICBjZW50ZXI6IFswLCAwXSxcbiAgICBlbGVtZW50OiBpbnNlcnRpb25FbGVtZW50LFxuICB9KVxuICByZXR1cm4gbWFwIGFzIE1hcFxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRGcm9tUG9zaXRpb24ocG9zaXRpb246IGFueSwgbWFwOiBhbnkpIHtcbiAgY29uc3QgZmVhdHVyZXM6IGFueSA9IFtdXG4gIG1hcC5mb3JFYWNoRmVhdHVyZUF0UGl4ZWwocG9zaXRpb24sIChmZWF0dXJlOiBhbnkpID0+IHtcbiAgICBmZWF0dXJlcy5wdXNoKGZlYXR1cmUpXG4gIH0pXG4gIGlmIChmZWF0dXJlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGZlYXR1cmVzWzBdLmdldElkKClcbiAgfVxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uOiBhbnksIG1hcDogYW55KSB7XG4gIGNvbnN0IGZlYXR1cmVzOiBhbnkgPSBbXVxuICBsZXQgaWQsIGxvY2F0aW9uSWRcbiAgbWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChwb3NpdGlvbiwgKGZlYXR1cmU6IGFueSkgPT4ge1xuICAgIGZlYXR1cmVzLnB1c2goZmVhdHVyZSlcbiAgfSlcbiAgaWYgKGZlYXR1cmVzLmxlbmd0aCA+IDApIHtcbiAgICBpZCA9IGZlYXR1cmVzWzBdLmdldElkKClcbiAgICBsb2NhdGlvbklkID0gZmVhdHVyZXNbMF0uZ2V0KCdsb2NhdGlvbklkJylcbiAgfVxuICByZXR1cm4geyBpZCwgbG9jYXRpb25JZCB9XG59XG5mdW5jdGlvbiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50OiBbbnVtYmVyLCBudW1iZXJdKSB7XG4gIGNvbnN0IGNvb3JkcyA9IFtwb2ludFswXSwgcG9pbnRbMV1dXG4gIHJldHVybiBwcm9qVHJhbnNmb3JtKFxuICAgIGNvb3JkcyBhcyBDb29yZGluYXRlLFxuICAgICdFUFNHOjQzMjYnLFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKClcbiAgKVxufVxuZnVuY3Rpb24gdW5jb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50OiBbbnVtYmVyLCBudW1iZXJdKSB7XG4gIHJldHVybiBwcm9qVHJhbnNmb3JtKFxuICAgIHBvaW50LFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKCksXG4gICAgJ0VQU0c6NDMyNidcbiAgKVxufVxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDYxMzMpIEZJWE1FOiAnbG9uZ2l0dWRlJyBpcyBkZWNsYXJlZCBidXQgaXRzIHZhbHVlIGlzIG5ldmVyIHJlYS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5mdW5jdGlvbiBvZmZNYXAoW2xvbmdpdHVkZSwgbGF0aXR1ZGVdKSB7XG4gIHJldHVybiBsYXRpdHVkZSA8IC05MCB8fCBsYXRpdHVkZSA+IDkwXG59XG4vLyBUaGUgZXh0ZW5zaW9uIGFyZ3VtZW50IGlzIGEgZnVuY3Rpb24gdXNlZCBpbiBwYW5Ub0V4dGVudFxuLy8gSXQgYWxsb3dzIGZvciBjdXN0b21pemF0aW9uIG9mIHRoZSB3YXkgdGhlIG1hcCBwYW5zIHRvIHJlc3VsdHNcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChcbiAgaW5zZXJ0aW9uRWxlbWVudDogYW55LFxuICBfc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnksXG4gIF9ub3RpZmljYXRpb25FbDogYW55LFxuICBfY29tcG9uZW50RWxlbWVudDogYW55LFxuICBtYXBNb2RlbDogYW55LFxuICBtYXBMYXllcnM6IGFueVxuKSB7XG4gIGxldCBvdmVybGF5cyA9IHt9XG4gIGxldCBzaGFwZXM6IGFueSA9IFtdXG4gIGNvbnN0IG1hcCA9IGNyZWF0ZU1hcChpbnNlcnRpb25FbGVtZW50LCBtYXBMYXllcnMpXG5cbiAgc2V0dXBUb29sdGlwKG1hcClcbiAgZnVuY3Rpb24gc2V0dXBUb29sdGlwKG1hcDogYW55KSB7XG4gICAgbWFwLm9uKCdwb2ludGVybW92ZScsIChlOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gdW5jb252ZXJ0UG9pbnRDb29yZGluYXRlKGUuY29vcmRpbmF0ZSlcbiAgICAgIGlmICghb2ZmTWFwKHBvaW50IGFzIGFueSkpIHtcbiAgICAgICAgbWFwTW9kZWwudXBkYXRlTW91c2VDb29yZGluYXRlcyh7XG4gICAgICAgICAgbGF0OiBwb2ludFsxXSxcbiAgICAgICAgICBsb246IHBvaW50WzBdLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwTW9kZWwuY2xlYXJNb3VzZUNvb3JkaW5hdGVzKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGZ1bmN0aW9uIHJlc2l6ZU1hcCgpIHtcbiAgICBtYXAudXBkYXRlU2l6ZSgpXG4gIH1cbiAgY29uc3QgZGVib3VuY2VkUmVzaXplTWFwID0gX2RlYm91bmNlKHJlc2l6ZU1hcCwgMjUwKVxuICBmdW5jdGlvbiBsaXN0ZW5Ub1Jlc2l6ZSgpIHtcbiAgICA7KHdyZXFyIGFzIGFueSkudmVudC5vbigncmVzaXplJywgZGVib3VuY2VkUmVzaXplTWFwKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZWRSZXNpemVNYXApXG4gIH1cbiAgZnVuY3Rpb24gdW5saXN0ZW5Ub1Jlc2l6ZSgpIHtcbiAgICA7KHdyZXFyIGFzIGFueSkudmVudC5vZmYoJ3Jlc2l6ZScsIGRlYm91bmNlZFJlc2l6ZU1hcClcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2VkUmVzaXplTWFwKVxuICB9XG4gIGxpc3RlblRvUmVzaXplKClcbiAgLypcbiAgICogUmV0dXJucyBhIHZpc2libGUgbGFiZWwgdGhhdCBpcyBpbiB0aGUgc2FtZSBsb2NhdGlvbiBhcyB0aGUgcHJvdmlkZWQgbGFiZWwgKGdlb21ldHJ5SW5zdGFuY2UpIGlmIG9uZSBleGlzdHMuXG4gICAqIElmIGZpbmRTZWxlY3RlZCBpcyB0cnVlLCB0aGUgZnVuY3Rpb24gd2lsbCBhbHNvIGNoZWNrIGZvciBoaWRkZW4gbGFiZWxzIGluIHRoZSBzYW1lIGxvY2F0aW9uIGJ1dCBhcmUgc2VsZWN0ZWQuXG4gICAqL1xuICBmdW5jdGlvbiBmaW5kT3ZlcmxhcHBpbmdMYWJlbChmaW5kU2VsZWN0ZWQ6IGFueSwgZ2VvbWV0cnlJbnN0YW5jZTogYW55KSB7XG4gICAgcmV0dXJuIF8uZmluZChcbiAgICAgIG1hcE1vZGVsLmdldCgnbGFiZWxzJyksXG4gICAgICAobGFiZWwpID0+XG4gICAgICAgIGxhYmVsLmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF0uZ2V0R2VvbWV0cnkoKS5nZXRDb29yZGluYXRlcygpWzBdID09PVxuICAgICAgICAgIGdlb21ldHJ5SW5zdGFuY2UuZ2V0Q29vcmRpbmF0ZXMoKVswXSAmJlxuICAgICAgICBsYWJlbC5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdLmdldEdlb21ldHJ5KCkuZ2V0Q29vcmRpbmF0ZXMoKVsxXSA9PT1cbiAgICAgICAgICBnZW9tZXRyeUluc3RhbmNlLmdldENvb3JkaW5hdGVzKClbMV0gJiZcbiAgICAgICAgKChmaW5kU2VsZWN0ZWQgJiYgbGFiZWwuZ2V0KCdpc1NlbGVjdGVkJykpIHx8IGxhYmVsLmdldFZpc2libGUoKSlcbiAgICApXG4gIH1cbiAgLypcbiAgICAgICAgT25seSBzaG93cyBvbmUgbGFiZWwgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGxhYmVscyBpbiB0aGUgc2FtZSBsb2NhdGlvbi5cbiAgXG4gICAgICAgIFNob3cgdGhlIGxhYmVsIGluIHRoZSBmb2xsb3dpbmcgaW1wb3J0YW5jZTpcbiAgICAgICAgICAtIGl0IGlzIHNlbGVjdGVkXG4gICAgICAgICAgLSB0aGVyZSBpcyBubyBvdGhlciBsYWJlbCBkaXNwbGF5ZWQgYXQgdGhlIHNhbWUgbG9jYXRpb25cbiAgICAgICAgICAtIGl0IGlzIHRoZSBsYWJlbCB0aGF0IHdhcyBmb3VuZCBieSBmaW5kT3ZlcmxhcHBpbmdMYWJlbFxuICBcbiAgICAgICAgQXJndW1lbnRzIGFyZTpcbiAgICAgICAgICAtIHRoZSBsYWJlbCB0byBzaG93L2hpZGUgKGdlb21ldHJ5LCBmZWF0dXJlKVxuICAgICAgICAgIC0gaWYgdGhlIGxhYmVsIGlzIHNlbGVjdGVkXG4gICAgICAgICAgLSBpZiB0aGUgc2VhcmNoIGZvciBvdmVybGFwcGluZyBsYWJlbCBzaG91bGQgaW5jbHVkZSBoaWRkZW4gc2VsZWN0ZWQgbGFiZWxzXG4gICAgICAgICovXG4gIGZ1bmN0aW9uIHNob3dIaWRlTGFiZWwoeyBnZW9tZXRyeSwgZmVhdHVyZSwgZmluZFNlbGVjdGVkID0gZmFsc2UgfTogYW55KSB7XG4gICAgY29uc3QgaXNTZWxlY3RlZCA9IGdlb21ldHJ5LmdldCgnaXNTZWxlY3RlZCcpXG4gICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGZlYXR1cmUuZ2V0R2VvbWV0cnkoKVxuICAgIGNvbnN0IGxhYmVsV2l0aFNhbWVQb3NpdGlvbiA9IGZpbmRPdmVybGFwcGluZ0xhYmVsKFxuICAgICAgZmluZFNlbGVjdGVkLFxuICAgICAgZ2VvbWV0cnlJbnN0YW5jZVxuICAgIClcbiAgICBpZiAoXG4gICAgICBpc1NlbGVjdGVkICYmXG4gICAgICBsYWJlbFdpdGhTYW1lUG9zaXRpb24gJiZcbiAgICAgICFsYWJlbFdpdGhTYW1lUG9zaXRpb24uZ2V0KCdpc1NlbGVjdGVkJylcbiAgICApIHtcbiAgICAgIGxhYmVsV2l0aFNhbWVQb3NpdGlvbi5zZXRWaXNpYmxlKGZhbHNlKVxuICAgIH1cbiAgICBjb25zdCBvdGhlckxhYmVsTm90U2VsZWN0ZWQgPSBsYWJlbFdpdGhTYW1lUG9zaXRpb25cbiAgICAgID8gIWxhYmVsV2l0aFNhbWVQb3NpdGlvbi5nZXQoJ2lzU2VsZWN0ZWQnKVxuICAgICAgOiB0cnVlXG4gICAgY29uc3QgdmlzaWJsZSA9XG4gICAgICAoaXNTZWxlY3RlZCAmJiBvdGhlckxhYmVsTm90U2VsZWN0ZWQpIHx8XG4gICAgICAhbGFiZWxXaXRoU2FtZVBvc2l0aW9uIHx8XG4gICAgICBnZW9tZXRyeS5nZXQoJ2lkJykgPT09IGxhYmVsV2l0aFNhbWVQb3NpdGlvbi5nZXQoJ2lkJylcbiAgICBnZW9tZXRyeS5zZXRWaXNpYmxlKHZpc2libGUpXG4gIH1cbiAgLypcbiAgICAgICAgU2hvd3MgYSBoaWRkZW4gbGFiZWwuIFVzZWQgd2hlbiBkZWxldGluZyBhIGxhYmVsIHRoYXQgaXMgc2hvd24uXG4gICAgICAgICovXG4gIGZ1bmN0aW9uIHNob3dIaWRkZW5MYWJlbChnZW9tZXRyeTogYW55KSB7XG4gICAgaWYgKCFnZW9tZXRyeS5nZXRWaXNpYmxlKCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBnZW9tZXRyeUluc3RhbmNlID0gZ2VvbWV0cnkuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXS5nZXRHZW9tZXRyeSgpXG4gICAgY29uc3QgaGlkZGVuTGFiZWwgPSBfLmZpbmQoXG4gICAgICBtYXBNb2RlbC5nZXQoJ2xhYmVscycpLFxuICAgICAgKGxhYmVsKSA9PlxuICAgICAgICBsYWJlbC5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdLmdldEdlb21ldHJ5KCkuZ2V0Q29vcmRpbmF0ZXMoKVswXSA9PT1cbiAgICAgICAgICBnZW9tZXRyeUluc3RhbmNlLmdldENvb3JkaW5hdGVzKClbMF0gJiZcbiAgICAgICAgbGFiZWwuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXS5nZXRHZW9tZXRyeSgpLmdldENvb3JkaW5hdGVzKClbMV0gPT09XG4gICAgICAgICAgZ2VvbWV0cnlJbnN0YW5jZS5nZXRDb29yZGluYXRlcygpWzFdICYmXG4gICAgICAgIGxhYmVsLmdldCgnaWQnKSAhPT0gZ2VvbWV0cnkuZ2V0KCdpZCcpICYmXG4gICAgICAgICFsYWJlbC5nZXRWaXNpYmxlKClcbiAgICApXG4gICAgaWYgKGhpZGRlbkxhYmVsKSB7XG4gICAgICBoaWRkZW5MYWJlbC5zZXRWaXNpYmxlKHRydWUpXG4gICAgfVxuICB9XG4gIGxldCBnZW9EcmFnRG93bkxpc3RlbmVyOiBhbnlcbiAgbGV0IGdlb0RyYWdNb3ZlTGlzdGVuZXI6IGFueVxuICBsZXQgZ2VvRHJhZ1VwTGlzdGVuZXI6IGFueVxuICBsZXQgbGVmdENsaWNrTWFwQVBJTGlzdGVuZXI6IGFueVxuICBjb25zdCBleHBvc2VkTWV0aG9kcyA9IHtcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JHZW9EcmFnKHtcbiAgICAgIG1vdmVGcm9tLFxuICAgICAgZG93bixcbiAgICAgIG1vdmUsXG4gICAgICB1cCxcbiAgICB9OiB7XG4gICAgICBtb3ZlRnJvbT86IGFueVxuICAgICAgZG93bjogYW55XG4gICAgICBtb3ZlOiBhbnlcbiAgICAgIHVwOiBhbnlcbiAgICB9KSB7XG4gICAgICAvLyBkaXNhYmxlIHBhbm5pbmcgb2YgdGhlIG1hcFxuICAgICAgbWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goKGludGVyYWN0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGludGVyYWN0aW9uIGluc3RhbmNlb2YgRHJhZ1Bhbikge1xuICAgICAgICAgIGludGVyYWN0aW9uLnNldEFjdGl2ZShmYWxzZSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gZW5hYmxlIGRyYWdnaW5nIGluZGl2aWR1YWwgZmVhdHVyZXNcbiAgICAgIGdlb0RyYWdEb3duTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihldmVudC5waXhlbCwgbWFwKVxuICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG1hcC5nZXRDb29yZGluYXRlRnJvbVBpeGVsKGV2ZW50LnBpeGVsKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHsgbGF0aXR1ZGU6IGNvb3JkaW5hdGVzWzFdLCBsb25naXR1ZGU6IGNvb3JkaW5hdGVzWzBdIH1cbiAgICAgICAgZG93bih7IHBvc2l0aW9uOiBwb3NpdGlvbiwgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCB9KVxuICAgICAgfVxuICAgICAgbWFwLm9uKCdwb2ludGVyZG93bicgYXMgYW55LCBnZW9EcmFnRG93bkxpc3RlbmVyKVxuXG4gICAgICBnZW9EcmFnTW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZXZlbnQucGl4ZWwsIG1hcClcbiAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBtYXAuZ2V0Q29vcmRpbmF0ZUZyb21QaXhlbChldmVudC5waXhlbClcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBtb3ZlRnJvbVxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBsYXRpdHVkZTogY29vcmRpbmF0ZXNbMV0gLSBtb3ZlRnJvbS5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgbG9uZ2l0dWRlOiBjb29yZGluYXRlc1swXSAtIG1vdmVGcm9tLmxvbmdpdHVkZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IG51bGxcbiAgICAgICAgbW92ZSh7IHRyYW5zbGF0aW9uOiB0cmFuc2xhdGlvbiwgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCB9KVxuICAgICAgfVxuICAgICAgbWFwLm9uKCdwb2ludGVyZHJhZycsIGdlb0RyYWdNb3ZlTGlzdGVuZXIpXG5cbiAgICAgIGdlb0RyYWdVcExpc3RlbmVyID0gdXBcbiAgICAgIG1hcC5vbigncG9pbnRlcnVwJyBhcyBhbnksIGdlb0RyYWdVcExpc3RlbmVyKVxuICAgIH0sXG4gICAgY2xlYXJNb3VzZVRyYWNraW5nRm9yR2VvRHJhZygpIHtcbiAgICAgIC8vIHJlLWVuYWJsZSBwYW5uaW5nXG4gICAgICBtYXAuZ2V0SW50ZXJhY3Rpb25zKCkuZm9yRWFjaCgoaW50ZXJhY3Rpb246IGFueSkgPT4ge1xuICAgICAgICBpZiAoaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBEcmFnUGFuKSB7XG4gICAgICAgICAgaW50ZXJhY3Rpb24uc2V0QWN0aXZlKHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBpZiAoZ2VvRHJhZ0Rvd25MaXN0ZW5lcikge1xuICAgICAgICBtYXAudW4oJ3BvaW50ZXJkb3duJyBhcyBhbnksIGdlb0RyYWdEb3duTGlzdGVuZXIpXG4gICAgICB9XG4gICAgICBpZiAoZ2VvRHJhZ01vdmVMaXN0ZW5lcikge1xuICAgICAgICBtYXAudW4oJ3BvaW50ZXJkcmFnJywgZ2VvRHJhZ01vdmVMaXN0ZW5lcilcbiAgICAgIH1cbiAgICAgIGlmIChnZW9EcmFnVXBMaXN0ZW5lcikge1xuICAgICAgICBtYXAudW4oJ3BvaW50ZXJ1cCcgYXMgYW55LCBnZW9EcmFnVXBMaXN0ZW5lcilcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uTGVmdENsaWNrTWFwQVBJKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIGxlZnRDbGlja01hcEFQSUxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZXZlbnQucGl4ZWwsIG1hcClcbiAgICAgICAgY2FsbGJhY2sobG9jYXRpb25JZClcbiAgICAgIH1cbiAgICAgIG1hcC5vbignc2luZ2xlY2xpY2snLCBsZWZ0Q2xpY2tNYXBBUElMaXN0ZW5lcilcbiAgICB9LFxuICAgIGNsZWFyTGVmdENsaWNrTWFwQVBJKCkge1xuICAgICAgbWFwLnVuKCdzaW5nbGVjbGljaycsIGxlZnRDbGlja01hcEFQSUxpc3RlbmVyKVxuICAgIH0sXG4gICAgb25MZWZ0Q2xpY2soY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGNhbGxiYWNrKGUsIHtcbiAgICAgICAgICBtYXBUYXJnZXQ6IGRldGVybWluZUlkRnJvbVBvc2l0aW9uKFxuICAgICAgICAgICAgW2UuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0LCBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wXSxcbiAgICAgICAgICAgIG1hcFxuICAgICAgICAgICksXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgb25SaWdodENsaWNrKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgY2FsbGJhY2soZSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhclJpZ2h0Q2xpY2soKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9mZignY29udGV4dG1lbnUnKVxuICAgIH0sXG4gICAgb25Eb3VibGVDbGljaygpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ2RibGNsaWNrJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLmdldFRhcmdldEVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihcbiAgICAgICAgICBbZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BdLFxuICAgICAgICAgIG1hcFxuICAgICAgICApXG4gICAgICAgIGlmIChsb2NhdGlvbklkKSB7XG4gICAgICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignbG9jYXRpb246ZG91YmxlQ2xpY2snLCBsb2NhdGlvbklkKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJEb3VibGVDbGljaygpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub2ZmKCdkYmxjbGljaycpXG4gICAgfSxcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JQb3B1cChcbiAgICAgIGRvd25DYWxsYmFjazogYW55LFxuICAgICAgbW92ZUNhbGxiYWNrOiBhbnksXG4gICAgICB1cENhbGxiYWNrOiBhbnlcbiAgICApIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ21vdXNlZG93bicsICgpID0+IHtcbiAgICAgICAgZG93bkNhbGxiYWNrKClcbiAgICAgIH0pXG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9uKCdtb3VzZW1vdmUnLCAoKSA9PiB7XG4gICAgICAgIG1vdmVDYWxsYmFjaygpXG4gICAgICB9KVxuICAgICAgdGhpcy5vbkxlZnRDbGljayh1cENhbGxiYWNrKVxuICAgIH0sXG4gICAgb25Nb3VzZU1vdmUoY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLmdldFRhcmdldEVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IFtcbiAgICAgICAgICBlLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdCxcbiAgICAgICAgICBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wLFxuICAgICAgICBdXG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uLCBtYXApXG4gICAgICAgIGNhbGxiYWNrKGUsIHtcbiAgICAgICAgICBtYXBUYXJnZXQ6IGRldGVybWluZUlkRnJvbVBvc2l0aW9uKHBvc2l0aW9uLCBtYXApLFxuICAgICAgICAgIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJNb3VzZU1vdmUoKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9mZignbW91c2Vtb3ZlJylcbiAgICB9LFxuICAgIHRpbWVvdXRJZHM6IFtdIGFzIG51bWJlcltdLFxuICAgIG9uQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIHRoaXMudGltZW91dElkcy5mb3JFYWNoKCh0aW1lb3V0SWQ6IGFueSkgPT4ge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICAgIH0pXG4gICAgICB0aGlzLnRpbWVvdXRJZHMgPSBbXVxuICAgICAgbWFwLmFkZEV2ZW50TGlzdGVuZXIoJ21vdmVzdGFydCcsIGNhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIG1hcC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3Zlc3RhcnQnLCBjYWxsYmFjaylcbiAgICB9LFxuICAgIG9uQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBjb25zdCB0aW1lb3V0Q2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudGltZW91dElkcy5wdXNoKFxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICB9LCAzMDApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIG1hcC5hZGRFdmVudExpc3RlbmVyKCdtb3ZlZW5kJywgdGltZW91dENhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBtYXAucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW92ZWVuZCcsIGNhbGxiYWNrKVxuICAgIH0sXG4gICAgZG9QYW5ab29tKGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdKSB7XG4gICAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgICAgdGhhdC5wYW5ab29tT3V0KHsgZHVyYXRpb246IDEwMDAgfSwgKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGF0Lnpvb21Ub0V4dGVudChjb29yZHMsIHsgZHVyYXRpb246IDIwMDAgfSlcbiAgICAgICAgfSwgMClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwYW5ab29tT3V0KF9vcHRzOiBhbnksIG5leHQ6IGFueSkge1xuICAgICAgbmV4dCgpXG4gICAgfSxcbiAgICBwYW5Ub1Jlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IF8uZmxhdHRlbihcbiAgICAgICAgcmVzdWx0cy5tYXAoKHJlc3VsdDogYW55KSA9PiByZXN1bHQuZ2V0UG9pbnRzKCdsb2NhdGlvbicpKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICAgdGhpcy5wYW5Ub0V4dGVudChjb29yZGluYXRlcylcbiAgICB9LFxuICAgIHBhblRvRXh0ZW50KGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjb29yZHMpICYmIGNvb3Jkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxpbmVPYmplY3QgPSBjb29yZHMubWFwKChjb29yZGluYXRlKSA9PlxuICAgICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgICAgKVxuICAgICAgICBjb25zdCBleHRlbnQgPSBib3VuZGluZ0V4dGVudChsaW5lT2JqZWN0KVxuICAgICAgICBtYXAuZ2V0VmlldygpLmZpdChleHRlbnQsIHtcbiAgICAgICAgICBzaXplOiBtYXAuZ2V0U2l6ZSgpLFxuICAgICAgICAgIG1heFpvb206IG1hcC5nZXRWaWV3KCkuZ2V0Wm9vbSgpLFxuICAgICAgICAgIGR1cmF0aW9uOiA1MDAsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRFeHRlbnRPZklkcyhpZHM6IHN0cmluZ1tdKSB7XG4gICAgICB2YXIgZXh0ZW50ID0gY3JlYXRlRW1wdHkoKVxuICAgICAgbWFwLmdldExheWVycygpLmZvckVhY2goKGxheWVyOiBhbnkpID0+IHtcbiAgICAgICAgLy8gbWlnaHQgbmVlZCB0byBoYW5kbGUgZ3JvdXBzIGxhdGVyLCBidXQgbm8gcmVhc29uIHRvIHlldFxuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBWZWN0b3JMYXllciAmJiBpZHMuaW5jbHVkZXMobGF5ZXIuZ2V0KCdpZCcpKSkge1xuICAgICAgICAgIGV4dGVuZChleHRlbnQsIGxheWVyLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGV4dGVudFswXSA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBleHRlbnQgZm91bmQgZm9yIGlkcycpXG4gICAgICB9XG4gICAgICByZXR1cm4gZXh0ZW50XG4gICAgfSxcbiAgICB6b29tVG9JZHMoeyBpZHMsIGR1cmF0aW9uID0gNTAwIH06IHsgaWRzOiBzdHJpbmdbXTsgZHVyYXRpb24/OiBudW1iZXIgfSkge1xuICAgICAgbWFwLmdldFZpZXcoKS5maXQodGhpcy5nZXRFeHRlbnRPZklkcyhpZHMpLCB7XG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgfSlcbiAgICB9LFxuICAgIHBhblRvU2hhcGVzRXh0ZW50KHsgZHVyYXRpb24gPSA1MDAgfTogeyBkdXJhdGlvbj86IG51bWJlciB9ID0ge30pIHtcbiAgICAgIHZhciBleHRlbnQgPSBjcmVhdGVFbXB0eSgpXG4gICAgICBtYXAuZ2V0TGF5ZXJzKCkuZm9yRWFjaCgobGF5ZXI6IGFueSkgPT4ge1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBHcm91cCkge1xuICAgICAgICAgIGxheWVyLmdldExheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTGF5ZXI6IGFueSkge1xuICAgICAgICAgICAgLy9JZiB0aGlzIGlzIGEgdmVjdG9yIGxheWVyLCBhZGQgaXQgdG8gb3VyIGV4dGVudFxuICAgICAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2YgVmVjdG9yTGF5ZXIpXG4gICAgICAgICAgICAgIGV4dGVuZChleHRlbnQsIChncm91cExheWVyIGFzIGFueSkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCkpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIFZlY3RvckxheWVyICYmIGxheWVyLmdldCgnaWQnKSkge1xuICAgICAgICAgIGV4dGVuZChleHRlbnQsIGxheWVyLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGV4dGVudFswXSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgbWFwLmdldFZpZXcoKS5maXQoZXh0ZW50LCB7XG4gICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRTaGFwZXMoKSB7XG4gICAgICByZXR1cm4gc2hhcGVzXG4gICAgfSxcbiAgICB6b29tVG9FeHRlbnQoY29vcmRzOiBbbnVtYmVyLCBudW1iZXJdW10sIG9wdHMgPSB7fSkge1xuICAgICAgY29uc3QgbGluZU9iamVjdCA9IGNvb3Jkcy5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT5cbiAgICAgICAgY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKVxuICAgICAgKVxuICAgICAgY29uc3QgZXh0ZW50ID0gYm91bmRpbmdFeHRlbnQobGluZU9iamVjdClcbiAgICAgIG1hcC5nZXRWaWV3KCkuZml0KGV4dGVudCwge1xuICAgICAgICBzaXplOiBtYXAuZ2V0U2l6ZSgpLFxuICAgICAgICBtYXhab29tOiBtYXAuZ2V0VmlldygpLmdldFpvb20oKSxcbiAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgLi4ub3B0cyxcbiAgICAgIH0pXG4gICAgfSxcbiAgICB6b29tVG9Cb3VuZGluZ0JveCh7IG5vcnRoLCBlYXN0LCBzb3V0aCwgd2VzdCB9OiBhbnkpIHtcbiAgICAgIHRoaXMuem9vbVRvRXh0ZW50KFtcbiAgICAgICAgW3dlc3QsIHNvdXRoXSxcbiAgICAgICAgW2Vhc3QsIG5vcnRoXSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBsaW1pdCh2YWx1ZTogYW55LCBtaW46IGFueSwgbWF4OiBhbnkpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWx1ZSwgbWluKSwgbWF4KVxuICAgIH0sXG4gICAgZ2V0Qm91bmRpbmdCb3goKSB7XG4gICAgICBjb25zdCBleHRlbnQgPSBtYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudChtYXAuZ2V0U2l6ZSgpKVxuICAgICAgbGV0IGxvbmdpdHVkZUVhc3QgPSB3cmFwTnVtKGV4dGVudFsyXSwgLTE4MCwgMTgwKVxuICAgICAgY29uc3QgbG9uZ2l0dWRlV2VzdCA9IHdyYXBOdW0oZXh0ZW50WzBdLCAtMTgwLCAxODApXG4gICAgICAvL2FkZCAzNjAgZGVncmVlcyB0byBsb25naXR1ZGVFYXN0IHRvIGFjY29tbW9kYXRlIGJvdW5kaW5nIGJveGVzIHRoYXQgc3BhbiBhY3Jvc3MgdGhlIGFudGktbWVyaWRpYW5cbiAgICAgIGlmIChsb25naXR1ZGVFYXN0IDwgbG9uZ2l0dWRlV2VzdCkge1xuICAgICAgICBsb25naXR1ZGVFYXN0ICs9IDM2MFxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9ydGg6IHRoaXMubGltaXQoZXh0ZW50WzNdLCAtOTAsIDkwKSxcbiAgICAgICAgZWFzdDogbG9uZ2l0dWRlRWFzdCxcbiAgICAgICAgc291dGg6IHRoaXMubGltaXQoZXh0ZW50WzFdLCAtOTAsIDkwKSxcbiAgICAgICAgd2VzdDogbG9uZ2l0dWRlV2VzdCxcbiAgICAgIH1cbiAgICB9LFxuICAgIG92ZXJsYXlJbWFnZShtb2RlbDogTGF6eVF1ZXJ5UmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhY2FyZElkID0gbW9kZWwucGxhaW4uaWRcbiAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheShtZXRhY2FyZElkKVxuICAgICAgY29uc3QgY29vcmRzID0gbW9kZWwuZ2V0UG9pbnRzKCdsb2NhdGlvbicpXG4gICAgICBjb25zdCBhcnJheSA9IF8ubWFwKGNvb3JkcywgKGNvb3JkKSA9PiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkKSlcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBuZXcgUG9seWdvbihbYXJyYXldKVxuICAgICAgY29uc3QgZXh0ZW50ID0gcG9seWdvbi5nZXRFeHRlbnQoKVxuICAgICAgY29uc3QgcHJvamVjdGlvbiA9IGdldChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpKVxuICAgICAgY29uc3Qgb3ZlcmxheUxheWVyID0gbmV3IEltYWdlTGF5ZXIoe1xuICAgICAgICBzb3VyY2U6IG5ldyBJbWFnZVN0YXRpY1NvdXJjZSh7XG4gICAgICAgICAgdXJsOiBtb2RlbC5jdXJyZW50T3ZlcmxheVVybCB8fCAnJyxcbiAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qZWN0aW9uIGFzIFByb2plY3Rpb25MaWtlLFxuICAgICAgICAgIGltYWdlRXh0ZW50OiBleHRlbnQsXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcihvdmVybGF5TGF5ZXIpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIG92ZXJsYXlzW21ldGFjYXJkSWRdID0gb3ZlcmxheUxheWVyXG4gICAgfSxcbiAgICByZW1vdmVPdmVybGF5KG1ldGFjYXJkSWQ6IGFueSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBpZiAob3ZlcmxheXNbbWV0YWNhcmRJZF0pIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIG1hcC5yZW1vdmVMYXllcihvdmVybGF5c1ttZXRhY2FyZElkXSlcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGRlbGV0ZSBvdmVybGF5c1ttZXRhY2FyZElkXVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlQWxsT3ZlcmxheXMoKSB7XG4gICAgICBmb3IgKGNvbnN0IG92ZXJsYXkgaW4gb3ZlcmxheXMpIHtcbiAgICAgICAgaWYgKG92ZXJsYXlzLmhhc093blByb3BlcnR5KG92ZXJsYXkpKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgbWFwLnJlbW92ZUxheWVyKG92ZXJsYXlzW292ZXJsYXldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvdmVybGF5cyA9IHt9XG4gICAgfSxcbiAgICBnZXRDYXJ0b2dyYXBoaWNDZW50ZXJPZkNsdXN0ZXJJbkRlZ3JlZXMoY2x1c3RlcjogQ2x1c3RlclR5cGUpIHtcbiAgICAgIHJldHVybiB1dGlsaXR5LmNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cmllc0luRGVncmVlcyhcbiAgICAgICAgY2x1c3Rlci5yZXN1bHRzXG4gICAgICApXG4gICAgfSxcbiAgICBnZXRXaW5kb3dMb2NhdGlvbnNPZlJlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5ID1cbiAgICAgICAgICB1dGlsaXR5LmNhbGN1bGF0ZU9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5KHJlc3VsdClcbiAgICAgICAgY29uc3QgY2VudGVyID0gbWFwLmdldFBpeGVsRnJvbUNvb3JkaW5hdGUob3BlbmxheWVyc0NlbnRlck9mR2VvbWV0cnkpXG4gICAgICAgIGlmIChjZW50ZXIpIHtcbiAgICAgICAgICByZXR1cm4gY2VudGVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBkaXN0YW5jZSAoaW4gbWV0ZXJzKSBiZXR3ZWVuIHRoZSB0d28gcG9zaXRpb25zIGluIHRoZSBnaXZlbiBhcnJheSBvZlxuICAgICAqIENvb3JkaW5hdGVzLlxuICAgICAqL1xuICAgIGNhbGN1bGF0ZURpc3RhbmNlQmV0d2VlblBvc2l0aW9ucyhjb29yZHM6IGFueSkge1xuICAgICAgY29uc3QgbGluZSA9IG5ldyBMaW5lU3RyaW5nKGNvb3JkcylcbiAgICAgIGNvbnN0IHNwaGVyZUxlbmd0aCA9IGdldExlbmd0aChsaW5lKVxuICAgICAgcmV0dXJuIHNwaGVyZUxlbmd0aFxuICAgIH0sXG4gICAgLypcbiAgICAgKiBEcmF3cyBhIG1hcmtlciBvbiB0aGUgbWFwIGRlc2lnbmF0aW5nIGEgc3RhcnQvZW5kIHBvaW50IGZvciB0aGUgcnVsZXIgbWVhc3VyZW1lbnQuIFRoZSBnaXZlblxuICAgICAqIGNvb3JkaW5hdGVzIHNob3VsZCBiZSBhbiBvYmplY3Qgd2l0aCAnbGF0JyBhbmQgJ2xvbicga2V5cyB3aXRoIGRlZ3JlZXMgdmFsdWVzLiBUaGUgZ2l2ZW5cbiAgICAgKiBtYXJrZXIgbGFiZWwgc2hvdWxkIGJlIGEgc2luZ2xlIGNoYXJhY3RlciBvciBkaWdpdCB0aGF0IGlzIGRpc3BsYXllZCBvbiB0aGUgbWFwIG1hcmtlci5cbiAgICAgKi9cbiAgICBhZGRSdWxlclBvaW50KGNvb3JkaW5hdGVzOiBhbnksIG1hcmtlckxhYmVsOiBhbnkpIHtcbiAgICAgIGNvbnN0IHsgbGF0LCBsb24gfSA9IGNvb3JkaW5hdGVzXG4gICAgICBjb25zdCBwb2ludCA9IFtsb24sIGxhdF1cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGlkOiBtYXJrZXJMYWJlbCxcbiAgICAgICAgY29sb3I6IHJ1bGVyQ29sb3IsXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5hZGRQb2ludChwb2ludCwgb3B0aW9ucylcbiAgICB9LFxuICAgIC8qXG4gICAgICogUmVtb3ZlcyB0aGUgZ2l2ZW4gcG9pbnQgTGF5ZXIgZnJvbSB0aGUgbWFwLlxuICAgICAqL1xuICAgIHJlbW92ZVJ1bGVyUG9pbnQocG9pbnRMYXllcjogYW55KSB7XG4gICAgICBtYXAucmVtb3ZlTGF5ZXIocG9pbnRMYXllcilcbiAgICB9LFxuICAgIHJ1bGVyTGluZTogbnVsbCBhcyBudWxsIHwgVmVjdG9yTGF5ZXI8XG4gICAgICBWZWN0b3JTb3VyY2U8RmVhdHVyZTxMaW5lU3RyaW5nPj4sXG4gICAgICBGZWF0dXJlPExpbmVTdHJpbmc+XG4gICAgPixcbiAgICAvKlxuICAgICAqIERyYXdzIGEgbGluZSBvbiB0aGUgbWFwIGJldHdlZW4gdGhlIHBvaW50cyBpbiB0aGUgZ2l2ZW4gYXJyYXkgb2YgcG9pbnQgVmVjdG9ycy5cbiAgICAgKi9cbiAgICBhZGRSdWxlckxpbmUocG9pbnQ6IGFueSkge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgaWQ6ICdydWxlci1saW5lJyxcbiAgICAgICAgdGl0bGU6ICdMaW5lIGZvciBydWxlciBtZWFzdXJlbWVudCcsXG4gICAgICAgIGNvbG9yOiAnIzUwNkY4NScsXG4gICAgICB9XG4gICAgICBjb25zdCBzdGFydGluZ0Nvb3JkaW5hdGVzID0gbWFwTW9kZWwuZ2V0KCdzdGFydGluZ0Nvb3JkaW5hdGVzJylcbiAgICAgIGNvbnN0IGxpbmVQb2ludHMgPSBbXG4gICAgICAgIFtzdGFydGluZ0Nvb3JkaW5hdGVzWydsb24nXSwgc3RhcnRpbmdDb29yZGluYXRlc1snbGF0J11dLFxuICAgICAgICBbcG9pbnRbJ2xvbiddLCBwb2ludFsnbGF0J11dLFxuICAgICAgXVxuICAgICAgdGhpcy5ydWxlckxpbmUgPSB0aGlzLmFkZExpbmUobGluZVBvaW50cywgb3B0aW9ucylcbiAgICAgIHJldHVybiB0aGlzLnJ1bGVyTGluZVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBVcGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBydWxlciBsaW5lXG4gICAgICovXG4gICAgc2V0UnVsZXJMaW5lKHBvaW50OiBhbnkpIHtcbiAgICAgIHRoaXMucmVtb3ZlUnVsZXJMaW5lKClcbiAgICAgIHRoaXMuYWRkUnVsZXJMaW5lKHBvaW50KVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBSZW1vdmVzIHRoZSBnaXZlbiBsaW5lIExheWVyIGZyb20gdGhlIG1hcC5cbiAgICAgKi9cbiAgICByZW1vdmVSdWxlckxpbmUoKSB7XG4gICAgICBpZiAodGhpcy5ydWxlckxpbmUpIHtcbiAgICAgICAgbWFwLnJlbW92ZUxheWVyKHRoaXMucnVsZXJMaW5lKVxuICAgICAgfVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgIEFkZHMgYSBiaWxsYm9hcmQgcG9pbnQgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAqL1xuICAgIGFkZFBvaW50V2l0aFRleHQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBmZWF0dXJlID0gbmV3IEZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHBvaW50T2JqZWN0KSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBiYWRnZU9mZnNldCA9IG9wdGlvbnMuYmFkZ2VPcHRpb25zID8gOCA6IDBcbiAgICAgIGNvbnN0IGltZ1dpZHRoID0gNDQgKyBiYWRnZU9mZnNldFxuICAgICAgY29uc3QgaW1nSGVpZ2h0ID0gNDQgKyBiYWRnZU9mZnNldFxuXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3Vuc2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB3aWR0aDogaW1nV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGZlYXR1cmUuc2V0KFxuICAgICAgICAncGFydGlhbGx5U2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB3aWR0aDogaW1nV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGZlYXR1cmUuc2V0KFxuICAgICAgICAnc2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdvcmFuZ2UnLFxuICAgICAgICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgd2lkdGg6IGltZ1dpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBpbWdIZWlnaHQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBzd2l0Y2ggKG9wdGlvbnMuaXNTZWxlY3RlZCkge1xuICAgICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgnc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3BhcnRpYWxseSc6XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgncGFydGlhbGx5U2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3Vuc2VsZWN0ZWQnOlxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjb25zdCB2ZWN0b3JTb3VyY2UgPSBuZXcgVmVjdG9yU291cmNlKHtcbiAgICAgICAgZmVhdHVyZXM6IFtmZWF0dXJlXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCB2ZWN0b3JMYXllciA9IG5ldyBWZWN0b3JMYXllcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgICB6SW5kZXg6IDEsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgYmlsbGJvYXJkIHBvaW50IHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRQb2ludChwb2ludDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvaW50T2JqZWN0ID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludClcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBuZXcgRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQocG9pbnRPYmplY3QpLFxuICAgICAgICBuYW1lOiBvcHRpb25zLnRpdGxlLFxuICAgICAgfSlcbiAgICAgIGZlYXR1cmUuc2V0SWQob3B0aW9ucy5pZClcbiAgICAgIGNvbnN0IGJhZGdlT2Zmc2V0ID0gb3B0aW9ucy5iYWRnZU9wdGlvbnMgPyA4IDogMFxuICAgICAgbGV0IHggPSAzOSArIGJhZGdlT2Zmc2V0LFxuICAgICAgICB5ID0gNDAgKyBiYWRnZU9mZnNldFxuICAgICAgaWYgKG9wdGlvbnMuc2l6ZSkge1xuICAgICAgICB4ID0gb3B0aW9ucy5zaXplLnhcbiAgICAgICAgeSA9IG9wdGlvbnMuc2l6ZS55XG4gICAgICB9XG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3Vuc2VsZWN0ZWRTdHlsZScsXG4gICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgaW1hZ2U6IG5ldyBJY29uKHtcbiAgICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0UGluKHtcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICAgICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHdpZHRoOiB4LFxuICAgICAgICAgICAgaGVpZ2h0OiB5LFxuICAgICAgICAgICAgYW5jaG9yOiBbeCAvIDIgLSBiYWRnZU9mZnNldCAvIDIsIDBdLFxuICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiAnYm90dG9tLWxlZnQnLFxuICAgICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICAgIGFuY2hvcllVbml0czogJ3BpeGVscycsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBmZWF0dXJlLnNldChcbiAgICAgICAgJ3NlbGVjdGVkU3R5bGUnLFxuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIGltYWdlOiBuZXcgSWNvbih7XG4gICAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogJ29yYW5nZScsXG4gICAgICAgICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgd2lkdGg6IHgsXG4gICAgICAgICAgICBoZWlnaHQ6IHksXG4gICAgICAgICAgICBhbmNob3I6IFt4IC8gMiAtIGJhZGdlT2Zmc2V0IC8gMiwgMF0sXG4gICAgICAgICAgICBhbmNob3JPcmlnaW46ICdib3R0b20tbGVmdCcsXG4gICAgICAgICAgICBhbmNob3JYVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgYW5jaG9yWVVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gZmVhdHVyZS5nZXQoJ3NlbGVjdGVkU3R5bGUnKVxuICAgICAgICAgIDogZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpXG4gICAgICApXG4gICAgICBjb25zdCB2ZWN0b3JTb3VyY2UgPSBuZXcgVmVjdG9yU291cmNlKHtcbiAgICAgICAgZmVhdHVyZXM6IFtmZWF0dXJlXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCB2ZWN0b3JMYXllciA9IG5ldyBWZWN0b3JMYXllcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgICB6SW5kZXg6IDEsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgbGFiZWwgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGFuIGlkIGFuZCB0ZXh0LlxuICAgICAgICAgICAgKi9cbiAgICBhZGRMYWJlbChwb2ludDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBvaW50T2JqZWN0ID0gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludClcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBuZXcgRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQocG9pbnRPYmplY3QpLFxuICAgICAgICBuYW1lOiBvcHRpb25zLnRleHQsXG4gICAgICAgIGlzTGFiZWw6IHRydWUsXG4gICAgICB9KVxuICAgICAgZmVhdHVyZS5zZXRJZChvcHRpb25zLmlkKVxuICAgICAgZmVhdHVyZS5zZXRTdHlsZShcbiAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICB0ZXh0OiBuZXcgb2xUZXh0KHtcbiAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMudGV4dCxcbiAgICAgICAgICAgIG92ZXJmbG93OiB0cnVlLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IFZlY3RvclNvdXJjZSh7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgY29uc3QgdmVjdG9yTGF5ZXIgPSBuZXcgVmVjdG9yTGF5ZXIoe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgICAgekluZGV4OiAxLFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlkOiBvcHRpb25zLmlkLFxuICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZSxcbiAgICAgIH0pXG4gICAgICBtYXAuYWRkTGF5ZXIodmVjdG9yTGF5ZXIpXG4gICAgICBtYXBNb2RlbC5hZGRMYWJlbCh2ZWN0b3JMYXllcilcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIHBvbHlsaW5lIHV0aWxpemluZyB0aGUgcGFzc2VkIGluIGxpbmUgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZCwgYW5kIGEgY29sb3IuXG4gICAgICAgICAgICAqL1xuICAgIGFkZExpbmUobGluZTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGNvbnN0IGxpbmVPYmplY3QgPSBsaW5lLm1hcCgoY29vcmRpbmF0ZTogYW55KSA9PlxuICAgICAgICBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGUpXG4gICAgICApXG4gICAgICBjb25zdCBmZWF0dXJlID0gbmV3IEZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IExpbmVTdHJpbmcobGluZU9iamVjdCksXG4gICAgICAgIG5hbWU6IG9wdGlvbnMudGl0bGUsXG4gICAgICB9KVxuICAgICAgZmVhdHVyZS5zZXRJZChvcHRpb25zLmlkKVxuICAgICAgY29uc3QgY29tbW9uU3R5bGUgPSBuZXcgU3R5bGUoe1xuICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgIGNvbG9yOiBvcHRpb25zLmNvbG9yIHx8IGRlZmF1bHRDb2xvcixcbiAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgfSksXG4gICAgICB9KVxuICAgICAgOyhmZWF0dXJlIGFzIGFueSkudW5zZWxlY3RlZFN0eWxlID0gW1xuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KSxcbiAgICAgICAgY29tbW9uU3R5bGUsXG4gICAgICBdXG4gICAgICA7KGZlYXR1cmUgYXMgYW55KS5zZWxlY3RlZFN0eWxlID0gW1xuICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICBjb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KSxcbiAgICAgICAgY29tbW9uU3R5bGUsXG4gICAgICBdXG4gICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgICA/IChmZWF0dXJlIGFzIGFueSkuc2VsZWN0ZWRTdHlsZVxuICAgICAgICAgIDogKGZlYXR1cmUgYXMgYW55KS51bnNlbGVjdGVkU3R5bGVcbiAgICAgIClcbiAgICAgIGNvbnN0IHZlY3RvclNvdXJjZSA9IG5ldyBWZWN0b3JTb3VyY2Uoe1xuICAgICAgICBmZWF0dXJlczogW2ZlYXR1cmVdLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IHZlY3RvckxheWVyID0gbmV3IFZlY3RvckxheWVyKHtcbiAgICAgICAgc291cmNlOiB2ZWN0b3JTb3VyY2UsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgcG9seWdvbiBmaWxsIHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvbHlnb24gYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZC5cbiAgICAgICAgICAgICovXG4gICAgYWRkUG9seWdvbigpIHt9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byByZWZsZWN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIHNlbGVjdGVkLlxuICAgICAgICAgICAgIE9wdGlvbnMgcGFzc2VkIGluIGFyZSBjb2xvciBhbmQgaXNTZWxlY3RlZC5cbiAgICAgICAgICAgICAqL1xuICAgIHVwZGF0ZUNsdXN0ZXIoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShnZW9tZXRyeSkpIHtcbiAgICAgICAgZ2VvbWV0cnkuZm9yRWFjaCgoaW5uZXJHZW9tZXRyeSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlQ2x1c3Rlcihpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdlb21ldHJ5LmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF1cbiAgICAgICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGZlYXR1cmUuZ2V0R2VvbWV0cnkoKVxuICAgICAgICBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gUG9pbnQpIHtcbiAgICAgICAgICBnZW9tZXRyeS5zZXRaSW5kZXgob3B0aW9ucy5pc1NlbGVjdGVkID8gMiA6IDEpXG4gICAgICAgICAgc3dpdGNoIChvcHRpb25zLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdGVkJzpcbiAgICAgICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgnc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAncGFydGlhbGx5JzpcbiAgICAgICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLmdldCgncGFydGlhbGx5U2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAndW5zZWxlY3RlZCc6XG4gICAgICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBMaW5lU3RyaW5nKSB7XG4gICAgICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsIC4xKScsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLDAsMCwgLjEpJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdXG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShzdHlsZXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gcmVmbGVjdCB3aGV0aGVyIG9yIG5vdCBpdCBpcyBzZWxlY3RlZC5cbiAgICAgICAgICAgICAgT3B0aW9ucyBwYXNzZWQgaW4gYXJlIGNvbG9yIGFuZCBpc1NlbGVjdGVkLlxuICAgICAgICAgICAgKi9cbiAgICB1cGRhdGVHZW9tZXRyeShnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGdlb21ldHJ5KSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVHZW9tZXRyeShpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdlb21ldHJ5LmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF1cbiAgICAgICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGZlYXR1cmUuZ2V0R2VvbWV0cnkoKVxuICAgICAgICBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gUG9pbnQpIHtcbiAgICAgICAgICBnZW9tZXRyeS5zZXRaSW5kZXgob3B0aW9ucy5pc1NlbGVjdGVkID8gMiA6IDEpXG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShcbiAgICAgICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgICAgICA/IGZlYXR1cmUuZ2V0KCdzZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICAgICAgOiBmZWF0dXJlLmdldCgndW5zZWxlY3RlZFN0eWxlJylcbiAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gTGluZVN0cmluZykge1xuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgICAgICAgPyBmZWF0dXJlLmdldCgnc2VsZWN0ZWRTdHlsZScpXG4gICAgICAgICAgICAgIDogZmVhdHVyZS5nZXQoJ3Vuc2VsZWN0ZWRTdHlsZScpXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXRHZW9tZXRyeVN0eWxlKGdlb21ldHJ5OiBhbnksIG9wdGlvbnM6IGFueSwgZmVhdHVyZTogYW55KSB7XG4gICAgICBjb25zdCBnZW9tZXRyeUluc3RhbmNlID0gZmVhdHVyZS5nZXRHZW9tZXRyeSgpXG4gICAgICBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5nZXRUeXBlKCkgPT09ICdQb2ludCcpIHtcbiAgICAgICAgbGV0IHBvaW50V2lkdGggPSAzOVxuICAgICAgICBsZXQgcG9pbnRIZWlnaHQgPSA0MFxuICAgICAgICBpZiAob3B0aW9ucy5zaXplKSB7XG4gICAgICAgICAgcG9pbnRXaWR0aCA9IG9wdGlvbnMuc2l6ZS54XG4gICAgICAgICAgcG9pbnRIZWlnaHQgPSBvcHRpb25zLnNpemUueVxuICAgICAgICB9XG4gICAgICAgIGdlb21ldHJ5LnNldFpJbmRleChvcHRpb25zLmlzU2VsZWN0ZWQgPyAyIDogMSlcbiAgICAgICAgaWYgKCFmZWF0dXJlLmdldFByb3BlcnRpZXMoKS5pc0xhYmVsKSB7XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShcbiAgICAgICAgICAgIG5ldyBTdHlsZSh7XG4gICAgICAgICAgICAgIGltYWdlOiBuZXcgSWNvbih7XG4gICAgICAgICAgICAgICAgaW1nOiBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmlzU2VsZWN0ZWQgPyAnb3JhbmdlJyA6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB3aWR0aDogcG9pbnRXaWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHBvaW50SGVpZ2h0LFxuICAgICAgICAgICAgICAgIGFuY2hvcjogW3BvaW50V2lkdGggLyAyLCAwXSxcbiAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46ICdib3R0b20tbGVmdCcsXG4gICAgICAgICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICAgICAgICBhbmNob3JZVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgICAgICB0ZXh0OiB0aGlzLmNyZWF0ZVRleHRTdHlsZShcbiAgICAgICAgICAgICAgICBmZWF0dXJlLFxuICAgICAgICAgICAgICAgIG1hcC5nZXRWaWV3KCkuZ2V0UmVzb2x1dGlvbigpXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgICBnZW9tZXRyeS5zZXQoJ2lzU2VsZWN0ZWQnLCBvcHRpb25zLmlzU2VsZWN0ZWQpXG4gICAgICAgICAgc2hvd0hpZGVMYWJlbCh7XG4gICAgICAgICAgICBnZW9tZXRyeSxcbiAgICAgICAgICAgIGZlYXR1cmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeUluc3RhbmNlLmdldFR5cGUoKSA9PT0gJ0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IFtcbiAgICAgICAgICBuZXcgU3R5bGUoe1xuICAgICAgICAgICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgICAgIGNvbG9yOiBvcHRpb25zLmNvbG9yIHx8IGRlZmF1bHRDb2xvcixcbiAgICAgICAgICAgICAgd2lkdGg6IDQsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXVxuICAgICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgIH1cbiAgICB9LFxuICAgIGNyZWF0ZVRleHRTdHlsZShmZWF0dXJlOiBhbnksIHJlc29sdXRpb246IGFueSkge1xuICAgICAgY29uc3QgZmlsbENvbG9yID0gJyMwMDAwMDAnXG4gICAgICBjb25zdCBvdXRsaW5lQ29sb3IgPSAnI2ZmZmZmZidcbiAgICAgIGNvbnN0IG91dGxpbmVXaWR0aCA9IDNcbiAgICAgIHJldHVybiBuZXcgb2xUZXh0KHtcbiAgICAgICAgdGV4dDogdGhpcy5nZXRUZXh0KGZlYXR1cmUsIHJlc29sdXRpb24pLFxuICAgICAgICBmaWxsOiBuZXcgRmlsbCh7IGNvbG9yOiBmaWxsQ29sb3IgfSksXG4gICAgICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICAgICAgY29sb3I6IG91dGxpbmVDb2xvcixcbiAgICAgICAgICB3aWR0aDogb3V0bGluZVdpZHRoLFxuICAgICAgICB9KSxcbiAgICAgICAgb2Zmc2V0WDogMjAsXG4gICAgICAgIG9mZnNldFk6IC0xNSxcbiAgICAgICAgcGxhY2VtZW50OiAncG9pbnQnLFxuICAgICAgICBtYXhBbmdsZTogNDUsXG4gICAgICAgIG92ZXJmbG93OiB0cnVlLFxuICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgIHBhZGRpbmc6IFs1LCA1LCA1LCA1XSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRUZXh0KGZlYXR1cmU6IGFueSwgcmVzb2x1dGlvbjogYW55KSB7XG4gICAgICBjb25zdCBtYXhSZXNvbHV0aW9uID0gMTIwMFxuICAgICAgY29uc3QgdGV4dCA9XG4gICAgICAgIHJlc29sdXRpb24gPiBtYXhSZXNvbHV0aW9uID8gJycgOiB0aGlzLnRydW5jKGZlYXR1cmUuZ2V0KCduYW1lJyksIDIwKVxuICAgICAgcmV0dXJuIHRleHRcbiAgICB9LFxuICAgIHRydW5jKHN0cjogYW55LCBuOiBhbnkpIHtcbiAgICAgIHJldHVybiBzdHIubGVuZ3RoID4gbiA/IHN0ci5zdWJzdHIoMCwgbiAtIDEpICsgJy4uLicgOiBzdHIuc3Vic3RyKDApXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgaGlkZGVuXG4gICAgICAgICAgICAgKi9cbiAgICBoaWRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgZ2VvbWV0cnkuc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byBiZSBzaG93blxuICAgICAgICAgICAgICovXG4gICAgc2hvd0dlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZW9tZXRyeS5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdXG4gICAgICBpZiAoZmVhdHVyZS5nZXRQcm9wZXJ0aWVzKCkuaXNMYWJlbCkge1xuICAgICAgICBzaG93SGlkZUxhYmVsKHtcbiAgICAgICAgICBnZW9tZXRyeSxcbiAgICAgICAgICBmZWF0dXJlLFxuICAgICAgICAgIGZpbmRTZWxlY3RlZDogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlb21ldHJ5LnNldFZpc2libGUodHJ1ZSlcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZW9tZXRyeS5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdXG4gICAgICBpZiAoZmVhdHVyZS5nZXRQcm9wZXJ0aWVzKCkuaXNMYWJlbCkge1xuICAgICAgICBtYXBNb2RlbC5yZW1vdmVMYWJlbChnZW9tZXRyeSlcbiAgICAgICAgc2hvd0hpZGRlbkxhYmVsKGdlb21ldHJ5KVxuICAgICAgfVxuICAgICAgbWFwLnJlbW92ZUxheWVyKGdlb21ldHJ5KVxuICAgIH0sXG4gICAgc2hvd011bHRpTGluZVNoYXBlKGxvY2F0aW9uTW9kZWw6IGFueSkge1xuICAgICAgbGV0IGxpbmVPYmplY3QgPSBsb2NhdGlvbk1vZGVsLmdldCgnbXVsdGlsaW5lJylcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMyKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICd1bmRlZmluZWQnLlxuICAgICAgaWYgKHZhbGlkYXRlR2VvKCdtdWx0aWxpbmUnLCBKU09OLnN0cmluZ2lmeShsaW5lT2JqZWN0KSkuZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBsaW5lT2JqZWN0ID0gbGluZU9iamVjdC5tYXAoKGxpbmU6IGFueSkgPT5cbiAgICAgICAgbGluZS5tYXAoKGNvb3JkczogYW55KSA9PiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkcykpXG4gICAgICApXG4gICAgICBsZXQgZmVhdHVyZSA9IG5ldyBGZWF0dXJlKHtcbiAgICAgICAgZ2VvbWV0cnk6IG5ldyBNdWx0aUxpbmVTdHJpbmcobGluZU9iamVjdCksXG4gICAgICB9KVxuICAgICAgZmVhdHVyZS5zZXRJZChsb2NhdGlvbk1vZGVsLmNpZClcbiAgICAgIGNvbnN0IHN0eWxlcyA9IFtcbiAgICAgICAgbmV3IFN0eWxlKHtcbiAgICAgICAgICBzdHJva2U6IG5ldyBTdHJva2Uoe1xuICAgICAgICAgICAgY29sb3I6IGxvY2F0aW9uTW9kZWwuZ2V0KCdjb2xvcicpIHx8IGRlZmF1bHRDb2xvcixcbiAgICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KSxcbiAgICAgIF1cbiAgICAgIGZlYXR1cmUuc2V0U3R5bGUoc3R5bGVzKVxuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVmVjdG9yTGF5ZXIobG9jYXRpb25Nb2RlbCwgZmVhdHVyZSlcbiAgICB9LFxuICAgIGNyZWF0ZVZlY3RvckxheWVyKGxvY2F0aW9uTW9kZWw6IGFueSwgZmVhdHVyZTogYW55KSB7XG4gICAgICBsZXQgdmVjdG9yU291cmNlID0gbmV3IFZlY3RvclNvdXJjZSh7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgbGV0IHZlY3RvckxheWVyID0gbmV3IFZlY3RvckxheWVyKHtcbiAgICAgICAgc291cmNlOiB2ZWN0b3JTb3VyY2UsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBvdmVybGF5c1tsb2NhdGlvbk1vZGVsLmNpZF0gPSB2ZWN0b3JMYXllclxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICBkZXN0cm95U2hhcGUoY2lkOiBhbnkpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA2KSBGSVhNRTogUGFyYW1ldGVyICdzaGFwZScgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZS5cbiAgICAgIGNvbnN0IHNoYXBlSW5kZXggPSBzaGFwZXMuZmluZEluZGV4KChzaGFwZSkgPT4gY2lkID09PSBzaGFwZS5tb2RlbC5jaWQpXG4gICAgICBpZiAoc2hhcGVJbmRleCA+PSAwKSB7XG4gICAgICAgIHNoYXBlc1tzaGFwZUluZGV4XS5kZXN0cm95KClcbiAgICAgICAgc2hhcGVzLnNwbGljZShzaGFwZUluZGV4LCAxKVxuICAgICAgfVxuICAgIH0sXG4gICAgZGVzdHJveVNoYXBlcygpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA2KSBGSVhNRTogUGFyYW1ldGVyICdzaGFwZScgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZS5cbiAgICAgIHNoYXBlcy5mb3JFYWNoKChzaGFwZSkgPT4ge1xuICAgICAgICBzaGFwZS5kZXN0cm95KClcbiAgICAgIH0pXG4gICAgICBzaGFwZXMgPSBbXVxuICAgIH0sXG4gICAgZ2V0TWFwKCkge1xuICAgICAgcmV0dXJuIG1hcFxuICAgIH0sXG4gICAgem9vbUluKCkge1xuICAgICAgY29uc3QgdmlldyA9IG1hcC5nZXRWaWV3KClcbiAgICAgIGNvbnN0IHpvb20gPSB2aWV3LmdldFpvb20oKVxuICAgICAgaWYgKHpvb20pIHtcbiAgICAgICAgdmlldy5zZXRab29tKHpvb20gKyAxKVxuICAgICAgfVxuICAgIH0sXG4gICAgem9vbU91dCgpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSBtYXAuZ2V0VmlldygpXG4gICAgICBjb25zdCB6b29tID0gdmlldy5nZXRab29tKClcbiAgICAgIGlmICh6b29tKSB7XG4gICAgICAgIHZpZXcuc2V0Wm9vbSh6b29tIC0gMSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlc3Ryb3koKSB7XG4gICAgICB1bmxpc3RlblRvUmVzaXplKClcbiAgICB9LFxuICB9XG4gIHJldHVybiBleHBvc2VkTWV0aG9kc1xufVxuIl19