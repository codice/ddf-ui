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
import Openlayers from 'openlayers';
import { OpenlayersLayers } from '../../../../js/controllers/openlayers.layers';
import wreqr from '../../../../js/wreqr';
import { validateGeo } from '../../../../react-component/utils/validation';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
import _debounce from 'lodash.debounce';
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
    return Openlayers.proj.transform(coords, 'EPSG:4326', StartupDataStore.Configuration.getProjection());
}
function unconvertPointCoordinate(point) {
    return Openlayers.proj.transform(point, StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
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
                if (interaction instanceof Openlayers.interaction.DragPan) {
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
                if (interaction instanceof Openlayers.interaction.DragPan) {
                    interaction.setActive(true);
                }
            });
            map.un('pointerdown', geoDragDownListener);
            map.un('pointerdrag', geoDragMoveListener);
            map.un('pointerup', geoDragUpListener);
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
            if (coords.constructor === Array && coords.length > 0) {
                var lineObject = coords.map(function (coordinate) {
                    return convertPointCoordinate(coordinate);
                });
                var extent = Openlayers.extent.boundingExtent(lineObject);
                map.getView().fit(extent, {
                    size: map.getSize(),
                    maxZoom: map.getView().getZoom(),
                    duration: 500,
                });
            }
        },
        getExtentOfIds: function (ids) {
            var extent = Openlayers.extent.createEmpty();
            map.getLayers().forEach(function (layer) {
                // might need to handle groups later, but no reason to yet
                if (layer instanceof Openlayers.layer.Vector &&
                    ids.includes(layer.get('id'))) {
                    Openlayers.extent.extend(extent, layer.getSource().getExtent());
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
            var extent = Openlayers.extent.createEmpty();
            map.getLayers().forEach(function (layer) {
                if (layer instanceof Openlayers.layer.Group) {
                    layer.getLayers().forEach(function (groupLayer) {
                        //If this is a vector layer, add it to our extent
                        if (layer instanceof Openlayers.layer.Vector)
                            Openlayers.extent.extend(extent, groupLayer.getSource().getExtent());
                    });
                }
                else if (layer instanceof Openlayers.layer.Vector &&
                    layer.get('id')) {
                    Openlayers.extent.extend(extent, layer.getSource().getExtent());
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
            var extent = Openlayers.extent.boundingExtent(lineObject);
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
            var polygon = new Openlayers.geom.Polygon([array]);
            var extent = polygon.getExtent();
            var projection = Openlayers.proj.get(StartupDataStore.Configuration.getProjection());
            var overlayLayer = new Openlayers.layer.Image({
                source: new Openlayers.source.ImageStatic({
                    // @ts-expect-error ts-migrate(2322) FIXME: Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message
                    url: model.currentOverlayUrl,
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
            var line = new Openlayers.geom.LineString(coords);
            var sphereLength = Openlayers.Sphere.getLength(line);
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
            map.removeLayer(this.rulerLine);
        },
        /*
                Adds a billboard point utilizing the passed in point and options.
                Options are a view to relate to, and an id, and a color.
            */
        addPointWithText: function (point, options) {
            var pointObject = convertPointCoordinate(point);
            var feature = new Openlayers.Feature({
                geometry: new Openlayers.geom.Point(pointObject),
            });
            var badgeOffset = options.badgeOptions ? 8 : 0;
            var imgWidth = 44 + badgeOffset;
            var imgHeight = 44 + badgeOffset;
            feature.setId(options.id);
            feature.unselectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getCircleWithText({
                        fillColor: options.color,
                        text: options.id.length,
                        badgeOptions: options.badgeOptions,
                    }),
                    imgSize: [imgWidth, imgHeight],
                }),
            });
            feature.partiallySelectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getCircleWithText({
                        fillColor: options.color,
                        text: options.id.length,
                        strokeColor: 'black',
                        textColor: 'white',
                        badgeOptions: options.badgeOptions,
                    }),
                    imgSize: [imgWidth, imgHeight],
                }),
            });
            feature.selectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getCircleWithText({
                        fillColor: 'orange',
                        text: options.id.length,
                        strokeColor: 'white',
                        textColor: 'white',
                        badgeOptions: options.badgeOptions,
                    }),
                    imgSize: [imgWidth, imgHeight],
                }),
            });
            switch (options.isSelected) {
                case 'selected':
                    feature.setStyle(feature.selectedStyle);
                    break;
                case 'partially':
                    feature.setStyle(feature.partiallySelectedStyle);
                    break;
                case 'unselected':
                    feature.setStyle(feature.unselectedStyle);
                    break;
            }
            var vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            var vectorLayer = new Openlayers.layer.Vector({
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
            var feature = new Openlayers.Feature({
                geometry: new Openlayers.geom.Point(pointObject),
                name: options.title,
            });
            feature.setId(options.id);
            var badgeOffset = options.badgeOptions ? 8 : 0;
            var x = 39 + badgeOffset, y = 40 + badgeOffset;
            if (options.size) {
                x = options.size.x;
                y = options.size.y;
            }
            ;
            feature.unselectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getPin({
                        fillColor: options.color,
                        icon: options.icon,
                        badgeOptions: options.badgeOptions,
                    }),
                    imgSize: [x, y],
                    anchor: [x / 2 - badgeOffset / 2, 0],
                    anchorOrigin: 'bottom-left',
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                }),
            });
            feature.selectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getPin({
                        fillColor: 'orange',
                        icon: options.icon,
                        badgeOptions: options.badgeOptions,
                    }),
                    imgSize: [x, y],
                    anchor: [x / 2 - badgeOffset / 2, 0],
                    anchorOrigin: 'bottom-left',
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                }),
            });
            feature.setStyle(options.isSelected
                ? feature.selectedStyle
                : feature.unselectedStyle);
            var vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            var vectorLayer = new Openlayers.layer.Vector({
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
            var feature = new Openlayers.Feature({
                geometry: new Openlayers.geom.Point(pointObject),
                name: options.text,
                isLabel: true,
            });
            feature.setId(options.id);
            feature.setStyle(new Openlayers.style.Style({
                text: new Openlayers.style.Text({
                    text: options.text,
                    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ text: any; overflow: boolean; ... Remove this comment to see the full error message
                    overflow: true,
                }),
            }));
            var vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            var vectorLayer = new Openlayers.layer.Vector({
                source: vectorSource,
                zIndex: 1,
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ source: Openlayers.source.Vect... Remove this comment to see the full error message
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
            var feature = new Openlayers.Feature({
                geometry: new Openlayers.geom.LineString(lineObject),
                name: options.title,
            });
            feature.setId(options.id);
            var commonStyle = new Openlayers.style.Style({
                stroke: new Openlayers.style.Stroke({
                    color: options.color || defaultColor,
                    width: 4,
                }),
            });
            feature.unselectedStyle = [
                new Openlayers.style.Style({
                    stroke: new Openlayers.style.Stroke({
                        color: 'white',
                        width: 8,
                    }),
                }),
                commonStyle,
            ];
            feature.selectedStyle = [
                new Openlayers.style.Style({
                    stroke: new Openlayers.style.Stroke({
                        color: 'black',
                        width: 8,
                    }),
                }),
                commonStyle,
            ];
            feature.setStyle(options.isSelected
                ? feature.selectedStyle
                : feature.unselectedStyle);
            var vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            var vectorLayer = new Openlayers.layer.Vector({
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
            if (geometry.constructor === Array) {
                geometry.forEach(function (innerGeometry) {
                    _this.updateCluster(innerGeometry, options);
                });
            }
            else {
                var feature = geometry.getSource().getFeatures()[0];
                var geometryInstance = feature.getGeometry();
                if (geometryInstance.constructor === Openlayers.geom.Point) {
                    geometry.setZIndex(options.isSelected ? 2 : 1);
                    switch (options.isSelected) {
                        case 'selected':
                            feature.setStyle(feature.selectedStyle);
                            break;
                        case 'partially':
                            feature.setStyle(feature.partiallySelectedStyle);
                            break;
                        case 'unselected':
                            feature.setStyle(feature.unselectedStyle);
                            break;
                    }
                }
                else if (geometryInstance.constructor === Openlayers.geom.LineString) {
                    var styles = [
                        new Openlayers.style.Style({
                            stroke: new Openlayers.style.Stroke({
                                color: 'rgba(255,255,255, .1)',
                                width: 8,
                            }),
                        }),
                        new Openlayers.style.Style({
                            stroke: new Openlayers.style.Stroke({
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
            if (geometry.constructor === Array) {
                geometry.forEach(function (innerGeometry) {
                    _this.updateGeometry(innerGeometry, options);
                });
            }
            else {
                var feature = geometry.getSource().getFeatures()[0];
                var geometryInstance = feature.getGeometry();
                if (geometryInstance.constructor === Openlayers.geom.Point) {
                    geometry.setZIndex(options.isSelected ? 2 : 1);
                    feature.setStyle(options.isSelected ? feature.selectedStyle : feature.unselectedStyle);
                }
                else if (geometryInstance.constructor === Openlayers.geom.LineString) {
                    feature.setStyle(options.isSelected ? feature.selectedStyle : feature.unselectedStyle);
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
                    feature.setStyle(new Openlayers.style.Style({
                        image: new Openlayers.style.Icon({
                            img: DrawingUtility.getPin({
                                fillColor: options.isSelected ? 'orange' : options.color,
                                strokeColor: 'white',
                                icon: options.icon,
                            }),
                            imgSize: [pointWidth, pointHeight],
                            anchor: [pointWidth / 2, 0],
                            anchorOrigin: 'bottom-left',
                            anchorXUnits: 'pixels',
                            anchorYUnits: 'pixels',
                        }),
                    }));
                }
                else {
                    feature.setStyle(new Openlayers.style.Style({
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
                    new Openlayers.style.Style({
                        stroke: new Openlayers.style.Stroke({
                            color: 'white',
                            width: 8,
                        }),
                    }),
                    new Openlayers.style.Style({
                        stroke: new Openlayers.style.Stroke({
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
            return new Openlayers.style.Text({
                text: this.getText(feature, resolution),
                fill: new Openlayers.style.Fill({ color: fillColor }),
                stroke: new Openlayers.style.Stroke({
                    color: outlineColor,
                    width: outlineWidth,
                }),
                offsetX: 20,
                offsetY: -15,
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ text: any; fill: Openlayers.st... Remove this comment to see the full error message
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
            var feature = new Openlayers.Feature({
                geometry: new Openlayers.geom.MultiLineString(lineObject),
            });
            feature.setId(locationModel.cid);
            var styles = [
                new Openlayers.style.Style({
                    stroke: new Openlayers.style.Stroke({
                        color: locationModel.get('color') || defaultColor,
                        width: 4,
                    }),
                }),
            ];
            feature.setStyle(styles);
            return this.createVectorLayer(locationModel, feature);
        },
        createVectorLayer: function (locationModel, feature) {
            var vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            var vectorLayer = new Openlayers.layer.Vector({
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
            view.setZoom(zoom + 1);
        },
        zoomOut: function () {
            var view = map.getView();
            var zoom = view.getZoom();
            view.setZoom(zoom - 1);
        },
        destroy: function () {
            unlistenToResize();
        },
    };
    return exposedMethods;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLm9wZW5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9vcGVubGF5ZXJzL21hcC5vcGVubGF5ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osNEJBQTRCO0FBQzVCLE9BQU8sT0FBTyxNQUFNLHFEQUFxRCxDQUFBO0FBQ3pFLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sY0FBYyxNQUFNLG1CQUFtQixDQUFBO0FBQzlDLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUNuQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUMvRSxPQUFPLEtBQUssTUFBTSxzQkFBc0IsQ0FBQTtBQUN4QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFHMUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFDdkUsT0FBTyxTQUFTLE1BQU0saUJBQWlCLENBQUE7QUFDdkMsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFBO0FBQzlCLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQTtBQUM1QixTQUFTLFNBQVMsQ0FBQyxnQkFBcUIsRUFBRSxTQUFjO0lBQ3RELElBQU0seUJBQXlCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQztRQUNyRCxVQUFVLEVBQUUsU0FBUztLQUN0QixDQUFDLENBQUE7SUFDRixJQUFNLEdBQUcsR0FBRyx5QkFBeUIsQ0FBQyxPQUFPLENBQUM7UUFDNUMsSUFBSSxFQUFFLEdBQUc7UUFDVCxPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxDQUFDLENBQUMs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QU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUMxQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDeEIsQ0FBQztRQUNELE9BQU87WUFDTCxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDMUIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLENBQUM7UUFDRCxPQUFPO1lBQ0wsZ0JBQWdCLEVBQUUsQ0FBQTtRQUNwQixDQUFDO0tBQ0YsQ0FBQTtJQUNELE9BQU8sY0FBYyxDQUFBO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qIGdsb2JhbCByZXF1aXJlLCB3aW5kb3cgKi9cbmltcG9ydCB3cmFwTnVtIGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy93cmFwLW51bS93cmFwLW51bSdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuL3V0aWxpdHknXG5pbXBvcnQgRHJhd2luZ1V0aWxpdHkgZnJvbSAnLi4vRHJhd2luZ1V0aWxpdHknXG5pbXBvcnQgT3BlbmxheWVycyBmcm9tICdvcGVubGF5ZXJzJ1xuaW1wb3J0IHsgT3BlbmxheWVyc0xheWVycyB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL2NvbnRyb2xsZXJzL29wZW5sYXllcnMubGF5ZXJzJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IHsgdmFsaWRhdGVHZW8gfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCB7IENsdXN0ZXJUeXBlIH0gZnJvbSAnLi4vcmVhY3QvZ2VvbWV0cmllcydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IF9kZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5jb25zdCBkZWZhdWx0Q29sb3IgPSAnIzNjNmRkNSdcbmNvbnN0IHJ1bGVyQ29sb3IgPSAnIzUwNmY4NSdcbmZ1bmN0aW9uIGNyZWF0ZU1hcChpbnNlcnRpb25FbGVtZW50OiBhbnksIG1hcExheWVyczogYW55KSB7XG4gIGNvbnN0IGxheWVyQ29sbGVjdGlvbkNvbnRyb2xsZXIgPSBuZXcgT3BlbmxheWVyc0xheWVycyh7XG4gICAgY29sbGVjdGlvbjogbWFwTGF5ZXJzLFxuICB9KVxuICBjb25zdCBtYXAgPSBsYXllckNvbGxlY3Rpb25Db250cm9sbGVyLm1ha2VNYXAoe1xuICAgIHpvb206IDIuNyxcbiAgICBtaW5ab29tOiAyLjMsXG4gICAgY2VudGVyOiBbMCwgMF0sXG4gICAgZWxlbWVudDogaW5zZXJ0aW9uRWxlbWVudCxcbiAgfSlcbiAgcmV0dXJuIG1hcFxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRGcm9tUG9zaXRpb24ocG9zaXRpb246IGFueSwgbWFwOiBhbnkpIHtcbiAgY29uc3QgZmVhdHVyZXM6IGFueSA9IFtdXG4gIG1hcC5mb3JFYWNoRmVhdHVyZUF0UGl4ZWwocG9zaXRpb24sIChmZWF0dXJlOiBhbnkpID0+IHtcbiAgICBmZWF0dXJlcy5wdXNoKGZlYXR1cmUpXG4gIH0pXG4gIGlmIChmZWF0dXJlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGZlYXR1cmVzWzBdLmdldElkKClcbiAgfVxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uOiBhbnksIG1hcDogYW55KSB7XG4gIGNvbnN0IGZlYXR1cmVzOiBhbnkgPSBbXVxuICBsZXQgaWQsIGxvY2F0aW9uSWRcbiAgbWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChwb3NpdGlvbiwgKGZlYXR1cmU6IGFueSkgPT4ge1xuICAgIGZlYXR1cmVzLnB1c2goZmVhdHVyZSlcbiAgfSlcbiAgaWYgKGZlYXR1cmVzLmxlbmd0aCA+IDApIHtcbiAgICBpZCA9IGZlYXR1cmVzWzBdLmdldElkKClcbiAgICBsb2NhdGlvbklkID0gZmVhdHVyZXNbMF0uZ2V0KCdsb2NhdGlvbklkJylcbiAgfVxuICByZXR1cm4geyBpZCwgbG9jYXRpb25JZCB9XG59XG5mdW5jdGlvbiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50OiBbbnVtYmVyLCBudW1iZXJdKSB7XG4gIGNvbnN0IGNvb3JkcyA9IFtwb2ludFswXSwgcG9pbnRbMV1dXG4gIHJldHVybiBPcGVubGF5ZXJzLnByb2oudHJhbnNmb3JtKFxuICAgIGNvb3JkcyBhcyBPcGVubGF5ZXJzLkNvb3JkaW5hdGUsXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG59XG5mdW5jdGlvbiB1bmNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQ6IFtudW1iZXIsIG51bWJlcl0pIHtcbiAgcmV0dXJuIE9wZW5sYXllcnMucHJvai50cmFuc2Zvcm0oXG4gICAgcG9pbnQsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKSxcbiAgICAnRVBTRzo0MzI2J1xuICApXG59XG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNjEzMykgRklYTUU6ICdsb25naXR1ZGUnIGlzIGRlY2xhcmVkIGJ1dCBpdHMgdmFsdWUgaXMgbmV2ZXIgcmVhLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmZ1bmN0aW9uIG9mZk1hcChbbG9uZ2l0dWRlLCBsYXRpdHVkZV0pIHtcbiAgcmV0dXJuIGxhdGl0dWRlIDwgLTkwIHx8IGxhdGl0dWRlID4gOTBcbn1cbi8vIFRoZSBleHRlbnNpb24gYXJndW1lbnQgaXMgYSBmdW5jdGlvbiB1c2VkIGluIHBhblRvRXh0ZW50XG4vLyBJdCBhbGxvd3MgZm9yIGN1c3RvbWl6YXRpb24gb2YgdGhlIHdheSB0aGUgbWFwIHBhbnMgdG8gcmVzdWx0c1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKFxuICBpbnNlcnRpb25FbGVtZW50OiBhbnksXG4gIF9zZWxlY3Rpb25JbnRlcmZhY2U6IGFueSxcbiAgX25vdGlmaWNhdGlvbkVsOiBhbnksXG4gIF9jb21wb25lbnRFbGVtZW50OiBhbnksXG4gIG1hcE1vZGVsOiBhbnksXG4gIG1hcExheWVyczogYW55XG4pIHtcbiAgbGV0IG92ZXJsYXlzID0ge31cbiAgbGV0IHNoYXBlczogYW55ID0gW11cbiAgY29uc3QgbWFwID0gY3JlYXRlTWFwKGluc2VydGlvbkVsZW1lbnQsIG1hcExheWVycylcblxuICBzZXR1cFRvb2x0aXAobWFwKVxuICBmdW5jdGlvbiBzZXR1cFRvb2x0aXAobWFwOiBhbnkpIHtcbiAgICBtYXAub24oJ3BvaW50ZXJtb3ZlJywgKGU6IGFueSkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB1bmNvbnZlcnRQb2ludENvb3JkaW5hdGUoZS5jb29yZGluYXRlKVxuICAgICAgaWYgKCFvZmZNYXAocG9pbnQpKSB7XG4gICAgICAgIG1hcE1vZGVsLnVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXMoe1xuICAgICAgICAgIGxhdDogcG9pbnRbMV0sXG4gICAgICAgICAgbG9uOiBwb2ludFswXSxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcE1vZGVsLmNsZWFyTW91c2VDb29yZGluYXRlcygpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBmdW5jdGlvbiByZXNpemVNYXAoKSB7XG4gICAgbWFwLnVwZGF0ZVNpemUoKVxuICB9XG4gIGNvbnN0IGRlYm91bmNlZFJlc2l6ZU1hcCA9IF9kZWJvdW5jZShyZXNpemVNYXAsIDI1MClcbiAgZnVuY3Rpb24gbGlzdGVuVG9SZXNpemUoKSB7XG4gICAgOyh3cmVxciBhcyBhbnkpLnZlbnQub24oJ3Jlc2l6ZScsIGRlYm91bmNlZFJlc2l6ZU1hcClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2VkUmVzaXplTWFwKVxuICB9XG4gIGZ1bmN0aW9uIHVubGlzdGVuVG9SZXNpemUoKSB7XG4gICAgOyh3cmVxciBhcyBhbnkpLnZlbnQub2ZmKCdyZXNpemUnLCBkZWJvdW5jZWRSZXNpemVNYXApXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlZFJlc2l6ZU1hcClcbiAgfVxuICBsaXN0ZW5Ub1Jlc2l6ZSgpXG4gIC8qXG4gICAqIFJldHVybnMgYSB2aXNpYmxlIGxhYmVsIHRoYXQgaXMgaW4gdGhlIHNhbWUgbG9jYXRpb24gYXMgdGhlIHByb3ZpZGVkIGxhYmVsIChnZW9tZXRyeUluc3RhbmNlKSBpZiBvbmUgZXhpc3RzLlxuICAgKiBJZiBmaW5kU2VsZWN0ZWQgaXMgdHJ1ZSwgdGhlIGZ1bmN0aW9uIHdpbGwgYWxzbyBjaGVjayBmb3IgaGlkZGVuIGxhYmVscyBpbiB0aGUgc2FtZSBsb2NhdGlvbiBidXQgYXJlIHNlbGVjdGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gZmluZE92ZXJsYXBwaW5nTGFiZWwoZmluZFNlbGVjdGVkOiBhbnksIGdlb21ldHJ5SW5zdGFuY2U6IGFueSkge1xuICAgIHJldHVybiBfLmZpbmQoXG4gICAgICBtYXBNb2RlbC5nZXQoJ2xhYmVscycpLFxuICAgICAgKGxhYmVsKSA9PlxuICAgICAgICBsYWJlbC5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdLmdldEdlb21ldHJ5KCkuZ2V0Q29vcmRpbmF0ZXMoKVswXSA9PT1cbiAgICAgICAgICBnZW9tZXRyeUluc3RhbmNlLmdldENvb3JkaW5hdGVzKClbMF0gJiZcbiAgICAgICAgbGFiZWwuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXS5nZXRHZW9tZXRyeSgpLmdldENvb3JkaW5hdGVzKClbMV0gPT09XG4gICAgICAgICAgZ2VvbWV0cnlJbnN0YW5jZS5nZXRDb29yZGluYXRlcygpWzFdICYmXG4gICAgICAgICgoZmluZFNlbGVjdGVkICYmIGxhYmVsLmdldCgnaXNTZWxlY3RlZCcpKSB8fCBsYWJlbC5nZXRWaXNpYmxlKCkpXG4gICAgKVxuICB9XG4gIC8qXG4gICAgICAgIE9ubHkgc2hvd3Mgb25lIGxhYmVsIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBsYWJlbHMgaW4gdGhlIHNhbWUgbG9jYXRpb24uXG4gIFxuICAgICAgICBTaG93IHRoZSBsYWJlbCBpbiB0aGUgZm9sbG93aW5nIGltcG9ydGFuY2U6XG4gICAgICAgICAgLSBpdCBpcyBzZWxlY3RlZFxuICAgICAgICAgIC0gdGhlcmUgaXMgbm8gb3RoZXIgbGFiZWwgZGlzcGxheWVkIGF0IHRoZSBzYW1lIGxvY2F0aW9uXG4gICAgICAgICAgLSBpdCBpcyB0aGUgbGFiZWwgdGhhdCB3YXMgZm91bmQgYnkgZmluZE92ZXJsYXBwaW5nTGFiZWxcbiAgXG4gICAgICAgIEFyZ3VtZW50cyBhcmU6XG4gICAgICAgICAgLSB0aGUgbGFiZWwgdG8gc2hvdy9oaWRlIChnZW9tZXRyeSwgZmVhdHVyZSlcbiAgICAgICAgICAtIGlmIHRoZSBsYWJlbCBpcyBzZWxlY3RlZFxuICAgICAgICAgIC0gaWYgdGhlIHNlYXJjaCBmb3Igb3ZlcmxhcHBpbmcgbGFiZWwgc2hvdWxkIGluY2x1ZGUgaGlkZGVuIHNlbGVjdGVkIGxhYmVsc1xuICAgICAgICAqL1xuICBmdW5jdGlvbiBzaG93SGlkZUxhYmVsKHsgZ2VvbWV0cnksIGZlYXR1cmUsIGZpbmRTZWxlY3RlZCA9IGZhbHNlIH06IGFueSkge1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBnZW9tZXRyeS5nZXQoJ2lzU2VsZWN0ZWQnKVxuICAgIGNvbnN0IGdlb21ldHJ5SW5zdGFuY2UgPSBmZWF0dXJlLmdldEdlb21ldHJ5KClcbiAgICBjb25zdCBsYWJlbFdpdGhTYW1lUG9zaXRpb24gPSBmaW5kT3ZlcmxhcHBpbmdMYWJlbChcbiAgICAgIGZpbmRTZWxlY3RlZCxcbiAgICAgIGdlb21ldHJ5SW5zdGFuY2VcbiAgICApXG4gICAgaWYgKFxuICAgICAgaXNTZWxlY3RlZCAmJlxuICAgICAgbGFiZWxXaXRoU2FtZVBvc2l0aW9uICYmXG4gICAgICAhbGFiZWxXaXRoU2FtZVBvc2l0aW9uLmdldCgnaXNTZWxlY3RlZCcpXG4gICAgKSB7XG4gICAgICBsYWJlbFdpdGhTYW1lUG9zaXRpb24uc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9XG4gICAgY29uc3Qgb3RoZXJMYWJlbE5vdFNlbGVjdGVkID0gbGFiZWxXaXRoU2FtZVBvc2l0aW9uXG4gICAgICA/ICFsYWJlbFdpdGhTYW1lUG9zaXRpb24uZ2V0KCdpc1NlbGVjdGVkJylcbiAgICAgIDogdHJ1ZVxuICAgIGNvbnN0IHZpc2libGUgPVxuICAgICAgKGlzU2VsZWN0ZWQgJiYgb3RoZXJMYWJlbE5vdFNlbGVjdGVkKSB8fFxuICAgICAgIWxhYmVsV2l0aFNhbWVQb3NpdGlvbiB8fFxuICAgICAgZ2VvbWV0cnkuZ2V0KCdpZCcpID09PSBsYWJlbFdpdGhTYW1lUG9zaXRpb24uZ2V0KCdpZCcpXG4gICAgZ2VvbWV0cnkuc2V0VmlzaWJsZSh2aXNpYmxlKVxuICB9XG4gIC8qXG4gICAgICAgIFNob3dzIGEgaGlkZGVuIGxhYmVsLiBVc2VkIHdoZW4gZGVsZXRpbmcgYSBsYWJlbCB0aGF0IGlzIHNob3duLlxuICAgICAgICAqL1xuICBmdW5jdGlvbiBzaG93SGlkZGVuTGFiZWwoZ2VvbWV0cnk6IGFueSkge1xuICAgIGlmICghZ2VvbWV0cnkuZ2V0VmlzaWJsZSgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGdlb21ldHJ5LmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF0uZ2V0R2VvbWV0cnkoKVxuICAgIGNvbnN0IGhpZGRlbkxhYmVsID0gXy5maW5kKFxuICAgICAgbWFwTW9kZWwuZ2V0KCdsYWJlbHMnKSxcbiAgICAgIChsYWJlbCkgPT5cbiAgICAgICAgbGFiZWwuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXS5nZXRHZW9tZXRyeSgpLmdldENvb3JkaW5hdGVzKClbMF0gPT09XG4gICAgICAgICAgZ2VvbWV0cnlJbnN0YW5jZS5nZXRDb29yZGluYXRlcygpWzBdICYmXG4gICAgICAgIGxhYmVsLmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF0uZ2V0R2VvbWV0cnkoKS5nZXRDb29yZGluYXRlcygpWzFdID09PVxuICAgICAgICAgIGdlb21ldHJ5SW5zdGFuY2UuZ2V0Q29vcmRpbmF0ZXMoKVsxXSAmJlxuICAgICAgICBsYWJlbC5nZXQoJ2lkJykgIT09IGdlb21ldHJ5LmdldCgnaWQnKSAmJlxuICAgICAgICAhbGFiZWwuZ2V0VmlzaWJsZSgpXG4gICAgKVxuICAgIGlmIChoaWRkZW5MYWJlbCkge1xuICAgICAgaGlkZGVuTGFiZWwuc2V0VmlzaWJsZSh0cnVlKVxuICAgIH1cbiAgfVxuICBsZXQgZ2VvRHJhZ0Rvd25MaXN0ZW5lcjogYW55XG4gIGxldCBnZW9EcmFnTW92ZUxpc3RlbmVyOiBhbnlcbiAgbGV0IGdlb0RyYWdVcExpc3RlbmVyOiBhbnlcbiAgbGV0IGxlZnRDbGlja01hcEFQSUxpc3RlbmVyOiBhbnlcbiAgY29uc3QgZXhwb3NlZE1ldGhvZHMgPSB7XG4gICAgb25Nb3VzZVRyYWNraW5nRm9yR2VvRHJhZyh7XG4gICAgICBtb3ZlRnJvbSxcbiAgICAgIGRvd24sXG4gICAgICBtb3ZlLFxuICAgICAgdXAsXG4gICAgfToge1xuICAgICAgbW92ZUZyb20/OiBhbnlcbiAgICAgIGRvd246IGFueVxuICAgICAgbW92ZTogYW55XG4gICAgICB1cDogYW55XG4gICAgfSkge1xuICAgICAgLy8gZGlzYWJsZSBwYW5uaW5nIG9mIHRoZSBtYXBcbiAgICAgIG1hcC5nZXRJbnRlcmFjdGlvbnMoKS5mb3JFYWNoKChpbnRlcmFjdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGlmIChpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIE9wZW5sYXllcnMuaW50ZXJhY3Rpb24uRHJhZ1Bhbikge1xuICAgICAgICAgIGludGVyYWN0aW9uLnNldEFjdGl2ZShmYWxzZSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gZW5hYmxlIGRyYWdnaW5nIGluZGl2aWR1YWwgZmVhdHVyZXNcbiAgICAgIGdlb0RyYWdEb3duTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihldmVudC5waXhlbCwgbWFwKVxuICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG1hcC5nZXRDb29yZGluYXRlRnJvbVBpeGVsKGV2ZW50LnBpeGVsKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHsgbGF0aXR1ZGU6IGNvb3JkaW5hdGVzWzFdLCBsb25naXR1ZGU6IGNvb3JkaW5hdGVzWzBdIH1cbiAgICAgICAgZG93bih7IHBvc2l0aW9uOiBwb3NpdGlvbiwgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCB9KVxuICAgICAgfVxuICAgICAgbWFwLm9uKCdwb2ludGVyZG93bicsIGdlb0RyYWdEb3duTGlzdGVuZXIpXG5cbiAgICAgIGdlb0RyYWdNb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihldmVudC5waXhlbCwgbWFwKVxuICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG1hcC5nZXRDb29yZGluYXRlRnJvbVBpeGVsKGV2ZW50LnBpeGVsKVxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG1vdmVGcm9tXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGxhdGl0dWRlOiBjb29yZGluYXRlc1sxXSAtIG1vdmVGcm9tLmxhdGl0dWRlLFxuICAgICAgICAgICAgICBsb25naXR1ZGU6IGNvb3JkaW5hdGVzWzBdIC0gbW92ZUZyb20ubG9uZ2l0dWRlLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogbnVsbFxuICAgICAgICBtb3ZlKHsgdHJhbnNsYXRpb246IHRyYW5zbGF0aW9uLCBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkIH0pXG4gICAgICB9XG4gICAgICBtYXAub24oJ3BvaW50ZXJkcmFnJywgZ2VvRHJhZ01vdmVMaXN0ZW5lcilcblxuICAgICAgZ2VvRHJhZ1VwTGlzdGVuZXIgPSB1cFxuICAgICAgbWFwLm9uKCdwb2ludGVydXAnLCBnZW9EcmFnVXBMaXN0ZW5lcilcbiAgICB9LFxuICAgIGNsZWFyTW91c2VUcmFja2luZ0Zvckdlb0RyYWcoKSB7XG4gICAgICAvLyByZS1lbmFibGUgcGFubmluZ1xuICAgICAgbWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goKGludGVyYWN0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGludGVyYWN0aW9uIGluc3RhbmNlb2YgT3BlbmxheWVycy5pbnRlcmFjdGlvbi5EcmFnUGFuKSB7XG4gICAgICAgICAgaW50ZXJhY3Rpb24uc2V0QWN0aXZlKHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBtYXAudW4oJ3BvaW50ZXJkb3duJywgZ2VvRHJhZ0Rvd25MaXN0ZW5lcilcbiAgICAgIG1hcC51bigncG9pbnRlcmRyYWcnLCBnZW9EcmFnTW92ZUxpc3RlbmVyKVxuICAgICAgbWFwLnVuKCdwb2ludGVydXAnLCBnZW9EcmFnVXBMaXN0ZW5lcilcbiAgICB9LFxuICAgIG9uTGVmdENsaWNrTWFwQVBJKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIGxlZnRDbGlja01hcEFQSUxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZXZlbnQucGl4ZWwsIG1hcClcbiAgICAgICAgY2FsbGJhY2sobG9jYXRpb25JZClcbiAgICAgIH1cbiAgICAgIG1hcC5vbignc2luZ2xlY2xpY2snLCBsZWZ0Q2xpY2tNYXBBUElMaXN0ZW5lcilcbiAgICB9LFxuICAgIGNsZWFyTGVmdENsaWNrTWFwQVBJKCkge1xuICAgICAgbWFwLnVuKCdzaW5nbGVjbGljaycsIGxlZnRDbGlja01hcEFQSUxpc3RlbmVyKVxuICAgIH0sXG4gICAgb25MZWZ0Q2xpY2soY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGNhbGxiYWNrKGUsIHtcbiAgICAgICAgICBtYXBUYXJnZXQ6IGRldGVybWluZUlkRnJvbVBvc2l0aW9uKFxuICAgICAgICAgICAgW2UuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0LCBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wXSxcbiAgICAgICAgICAgIG1hcFxuICAgICAgICAgICksXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgb25SaWdodENsaWNrKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgY2FsbGJhY2soZSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhclJpZ2h0Q2xpY2soKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9mZignY29udGV4dG1lbnUnKVxuICAgIH0sXG4gICAgb25Eb3VibGVDbGljaygpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ2RibGNsaWNrJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLmdldFRhcmdldEVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihcbiAgICAgICAgICBbZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BdLFxuICAgICAgICAgIG1hcFxuICAgICAgICApXG4gICAgICAgIGlmIChsb2NhdGlvbklkKSB7XG4gICAgICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignbG9jYXRpb246ZG91YmxlQ2xpY2snLCBsb2NhdGlvbklkKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJEb3VibGVDbGljaygpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub2ZmKCdkYmxjbGljaycpXG4gICAgfSxcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JQb3B1cChcbiAgICAgIGRvd25DYWxsYmFjazogYW55LFxuICAgICAgbW92ZUNhbGxiYWNrOiBhbnksXG4gICAgICB1cENhbGxiYWNrOiBhbnlcbiAgICApIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ21vdXNlZG93bicsICgpID0+IHtcbiAgICAgICAgZG93bkNhbGxiYWNrKClcbiAgICAgIH0pXG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9uKCdtb3VzZW1vdmUnLCAoKSA9PiB7XG4gICAgICAgIG1vdmVDYWxsYmFjaygpXG4gICAgICB9KVxuICAgICAgdGhpcy5vbkxlZnRDbGljayh1cENhbGxiYWNrKVxuICAgIH0sXG4gICAgb25Nb3VzZU1vdmUoY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLmdldFRhcmdldEVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IFtcbiAgICAgICAgICBlLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdCxcbiAgICAgICAgICBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wLFxuICAgICAgICBdXG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uLCBtYXApXG4gICAgICAgIGNhbGxiYWNrKGUsIHtcbiAgICAgICAgICBtYXBUYXJnZXQ6IGRldGVybWluZUlkRnJvbVBvc2l0aW9uKHBvc2l0aW9uLCBtYXApLFxuICAgICAgICAgIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJNb3VzZU1vdmUoKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9mZignbW91c2Vtb3ZlJylcbiAgICB9LFxuICAgIHRpbWVvdXRJZHM6IFtdIGFzIG51bWJlcltdLFxuICAgIG9uQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIHRoaXMudGltZW91dElkcy5mb3JFYWNoKCh0aW1lb3V0SWQ6IGFueSkgPT4ge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICAgIH0pXG4gICAgICB0aGlzLnRpbWVvdXRJZHMgPSBbXVxuICAgICAgbWFwLmFkZEV2ZW50TGlzdGVuZXIoJ21vdmVzdGFydCcsIGNhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIG1hcC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3Zlc3RhcnQnLCBjYWxsYmFjaylcbiAgICB9LFxuICAgIG9uQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBjb25zdCB0aW1lb3V0Q2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudGltZW91dElkcy5wdXNoKFxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICB9LCAzMDApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIG1hcC5hZGRFdmVudExpc3RlbmVyKCdtb3ZlZW5kJywgdGltZW91dENhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBtYXAucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW92ZWVuZCcsIGNhbGxiYWNrKVxuICAgIH0sXG4gICAgZG9QYW5ab29tKGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdKSB7XG4gICAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgICAgdGhhdC5wYW5ab29tT3V0KHsgZHVyYXRpb246IDEwMDAgfSwgKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGF0Lnpvb21Ub0V4dGVudChjb29yZHMsIHsgZHVyYXRpb246IDIwMDAgfSlcbiAgICAgICAgfSwgMClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwYW5ab29tT3V0KF9vcHRzOiBhbnksIG5leHQ6IGFueSkge1xuICAgICAgbmV4dCgpXG4gICAgfSxcbiAgICBwYW5Ub1Jlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IF8uZmxhdHRlbihcbiAgICAgICAgcmVzdWx0cy5tYXAoKHJlc3VsdDogYW55KSA9PiByZXN1bHQuZ2V0UG9pbnRzKCdsb2NhdGlvbicpKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICAgdGhpcy5wYW5Ub0V4dGVudChjb29yZGluYXRlcylcbiAgICB9LFxuICAgIHBhblRvRXh0ZW50KGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdKSB7XG4gICAgICBpZiAoY29vcmRzLmNvbnN0cnVjdG9yID09PSBBcnJheSAmJiBjb29yZHMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBsaW5lT2JqZWN0ID0gY29vcmRzLm1hcCgoY29vcmRpbmF0ZSkgPT5cbiAgICAgICAgICBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkaW5hdGUpXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgZXh0ZW50ID0gT3BlbmxheWVycy5leHRlbnQuYm91bmRpbmdFeHRlbnQobGluZU9iamVjdClcbiAgICAgICAgbWFwLmdldFZpZXcoKS5maXQoZXh0ZW50LCB7XG4gICAgICAgICAgc2l6ZTogbWFwLmdldFNpemUoKSxcbiAgICAgICAgICBtYXhab29tOiBtYXAuZ2V0VmlldygpLmdldFpvb20oKSxcbiAgICAgICAgICBkdXJhdGlvbjogNTAwLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0RXh0ZW50T2ZJZHMoaWRzOiBzdHJpbmdbXSkge1xuICAgICAgdmFyIGV4dGVudCA9IE9wZW5sYXllcnMuZXh0ZW50LmNyZWF0ZUVtcHR5KClcbiAgICAgIG1hcC5nZXRMYXllcnMoKS5mb3JFYWNoKChsYXllcjogYW55KSA9PiB7XG4gICAgICAgIC8vIG1pZ2h0IG5lZWQgdG8gaGFuZGxlIGdyb3VwcyBsYXRlciwgYnV0IG5vIHJlYXNvbiB0byB5ZXRcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGxheWVyIGluc3RhbmNlb2YgT3BlbmxheWVycy5sYXllci5WZWN0b3IgJiZcbiAgICAgICAgICBpZHMuaW5jbHVkZXMobGF5ZXIuZ2V0KCdpZCcpKVxuICAgICAgICApIHtcbiAgICAgICAgICBPcGVubGF5ZXJzLmV4dGVudC5leHRlbmQoZXh0ZW50LCBsYXllci5nZXRTb3VyY2UoKS5nZXRFeHRlbnQoKSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGlmIChleHRlbnRbMF0gPT09IEluZmluaXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZXh0ZW50IGZvdW5kIGZvciBpZHMnKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGV4dGVudFxuICAgIH0sXG4gICAgem9vbVRvSWRzKHsgaWRzLCBkdXJhdGlvbiA9IDUwMCB9OiB7IGlkczogc3RyaW5nW107IGR1cmF0aW9uPzogbnVtYmVyIH0pIHtcbiAgICAgIG1hcC5nZXRWaWV3KCkuZml0KHRoaXMuZ2V0RXh0ZW50T2ZJZHMoaWRzKSwge1xuICAgICAgICBkdXJhdGlvbixcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwYW5Ub1NoYXBlc0V4dGVudCh7IGR1cmF0aW9uID0gNTAwIH06IHsgZHVyYXRpb24/OiBudW1iZXIgfSA9IHt9KSB7XG4gICAgICB2YXIgZXh0ZW50ID0gT3BlbmxheWVycy5leHRlbnQuY3JlYXRlRW1wdHkoKVxuICAgICAgbWFwLmdldExheWVycygpLmZvckVhY2goKGxheWVyOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2YgT3BlbmxheWVycy5sYXllci5Hcm91cCkge1xuICAgICAgICAgIGxheWVyLmdldExheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTGF5ZXIpIHtcbiAgICAgICAgICAgIC8vSWYgdGhpcyBpcyBhIHZlY3RvciBsYXllciwgYWRkIGl0IHRvIG91ciBleHRlbnRcbiAgICAgICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIE9wZW5sYXllcnMubGF5ZXIuVmVjdG9yKVxuICAgICAgICAgICAgICBPcGVubGF5ZXJzLmV4dGVudC5leHRlbmQoXG4gICAgICAgICAgICAgICAgZXh0ZW50LFxuICAgICAgICAgICAgICAgIChncm91cExheWVyIGFzIGFueSkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgbGF5ZXIgaW5zdGFuY2VvZiBPcGVubGF5ZXJzLmxheWVyLlZlY3RvciAmJlxuICAgICAgICAgIGxheWVyLmdldCgnaWQnKVxuICAgICAgICApIHtcbiAgICAgICAgICBPcGVubGF5ZXJzLmV4dGVudC5leHRlbmQoZXh0ZW50LCBsYXllci5nZXRTb3VyY2UoKS5nZXRFeHRlbnQoKSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGlmIChleHRlbnRbMF0gIT09IEluZmluaXR5KSB7XG4gICAgICAgIG1hcC5nZXRWaWV3KCkuZml0KGV4dGVudCwge1xuICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0U2hhcGVzKCkge1xuICAgICAgcmV0dXJuIHNoYXBlc1xuICAgIH0sXG4gICAgem9vbVRvRXh0ZW50KGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdLCBvcHRzID0ge30pIHtcbiAgICAgIGNvbnN0IGxpbmVPYmplY3QgPSBjb29yZHMubWFwKChjb29yZGluYXRlOiBhbnkpID0+XG4gICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGV4dGVudCA9IE9wZW5sYXllcnMuZXh0ZW50LmJvdW5kaW5nRXh0ZW50KGxpbmVPYmplY3QpXG4gICAgICBtYXAuZ2V0VmlldygpLmZpdChleHRlbnQsIHtcbiAgICAgICAgc2l6ZTogbWFwLmdldFNpemUoKSxcbiAgICAgICAgbWF4Wm9vbTogbWFwLmdldFZpZXcoKS5nZXRab29tKCksXG4gICAgICAgIGR1cmF0aW9uOiA1MDAsXG4gICAgICAgIC4uLm9wdHMsXG4gICAgICB9KVxuICAgIH0sXG4gICAgem9vbVRvQm91bmRpbmdCb3goeyBub3J0aCwgZWFzdCwgc291dGgsIHdlc3QgfTogYW55KSB7XG4gICAgICB0aGlzLnpvb21Ub0V4dGVudChbXG4gICAgICAgIFt3ZXN0LCBzb3V0aF0sXG4gICAgICAgIFtlYXN0LCBub3J0aF0sXG4gICAgICBdKVxuICAgIH0sXG4gICAgbGltaXQodmFsdWU6IGFueSwgbWluOiBhbnksIG1heDogYW55KSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsdWUsIG1pbiksIG1heClcbiAgICB9LFxuICAgIGdldEJvdW5kaW5nQm94KCkge1xuICAgICAgY29uc3QgZXh0ZW50ID0gbWFwLmdldFZpZXcoKS5jYWxjdWxhdGVFeHRlbnQobWFwLmdldFNpemUoKSlcbiAgICAgIGxldCBsb25naXR1ZGVFYXN0ID0gd3JhcE51bShleHRlbnRbMl0sIC0xODAsIDE4MClcbiAgICAgIGNvbnN0IGxvbmdpdHVkZVdlc3QgPSB3cmFwTnVtKGV4dGVudFswXSwgLTE4MCwgMTgwKVxuICAgICAgLy9hZGQgMzYwIGRlZ3JlZXMgdG8gbG9uZ2l0dWRlRWFzdCB0byBhY2NvbW1vZGF0ZSBib3VuZGluZyBib3hlcyB0aGF0IHNwYW4gYWNyb3NzIHRoZSBhbnRpLW1lcmlkaWFuXG4gICAgICBpZiAobG9uZ2l0dWRlRWFzdCA8IGxvbmdpdHVkZVdlc3QpIHtcbiAgICAgICAgbG9uZ2l0dWRlRWFzdCArPSAzNjBcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vcnRoOiB0aGlzLmxpbWl0KGV4dGVudFszXSwgLTkwLCA5MCksXG4gICAgICAgIGVhc3Q6IGxvbmdpdHVkZUVhc3QsXG4gICAgICAgIHNvdXRoOiB0aGlzLmxpbWl0KGV4dGVudFsxXSwgLTkwLCA5MCksXG4gICAgICAgIHdlc3Q6IGxvbmdpdHVkZVdlc3QsXG4gICAgICB9XG4gICAgfSxcbiAgICBvdmVybGF5SW1hZ2UobW9kZWw6IExhenlRdWVyeVJlc3VsdCkge1xuICAgICAgY29uc3QgbWV0YWNhcmRJZCA9IG1vZGVsLnBsYWluLmlkXG4gICAgICB0aGlzLnJlbW92ZU92ZXJsYXkobWV0YWNhcmRJZClcbiAgICAgIGNvbnN0IGNvb3JkcyA9IG1vZGVsLmdldFBvaW50cygnbG9jYXRpb24nKVxuICAgICAgY29uc3QgYXJyYXkgPSBfLm1hcChjb29yZHMsIChjb29yZCkgPT4gY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZCkpXG4gICAgICBjb25zdCBwb2x5Z29uID0gbmV3IE9wZW5sYXllcnMuZ2VvbS5Qb2x5Z29uKFthcnJheV0pXG4gICAgICBjb25zdCBleHRlbnQgPSBwb2x5Z29uLmdldEV4dGVudCgpXG4gICAgICBjb25zdCBwcm9qZWN0aW9uID0gT3BlbmxheWVycy5wcm9qLmdldChcbiAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICAgICAgKVxuICAgICAgY29uc3Qgb3ZlcmxheUxheWVyID0gbmV3IE9wZW5sYXllcnMubGF5ZXIuSW1hZ2Uoe1xuICAgICAgICBzb3VyY2U6IG5ldyBPcGVubGF5ZXJzLnNvdXJjZS5JbWFnZVN0YXRpYyh7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICdzdHJpbmcgfCB1bmRlZmluZWQnIGlzIG5vdCBhc3NpZ25hYmxlIHRvIHR5cC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgdXJsOiBtb2RlbC5jdXJyZW50T3ZlcmxheVVybCxcbiAgICAgICAgICBwcm9qZWN0aW9uLFxuICAgICAgICAgIGltYWdlRXh0ZW50OiBleHRlbnQsXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcihvdmVybGF5TGF5ZXIpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIG92ZXJsYXlzW21ldGFjYXJkSWRdID0gb3ZlcmxheUxheWVyXG4gICAgfSxcbiAgICByZW1vdmVPdmVybGF5KG1ldGFjYXJkSWQ6IGFueSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBpZiAob3ZlcmxheXNbbWV0YWNhcmRJZF0pIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIG1hcC5yZW1vdmVMYXllcihvdmVybGF5c1ttZXRhY2FyZElkXSlcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGRlbGV0ZSBvdmVybGF5c1ttZXRhY2FyZElkXVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlQWxsT3ZlcmxheXMoKSB7XG4gICAgICBmb3IgKGNvbnN0IG92ZXJsYXkgaW4gb3ZlcmxheXMpIHtcbiAgICAgICAgaWYgKG92ZXJsYXlzLmhhc093blByb3BlcnR5KG92ZXJsYXkpKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgbWFwLnJlbW92ZUxheWVyKG92ZXJsYXlzW292ZXJsYXldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvdmVybGF5cyA9IHt9XG4gICAgfSxcbiAgICBnZXRDYXJ0b2dyYXBoaWNDZW50ZXJPZkNsdXN0ZXJJbkRlZ3JlZXMoY2x1c3RlcjogQ2x1c3RlclR5cGUpIHtcbiAgICAgIHJldHVybiB1dGlsaXR5LmNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cmllc0luRGVncmVlcyhcbiAgICAgICAgY2x1c3Rlci5yZXN1bHRzXG4gICAgICApXG4gICAgfSxcbiAgICBnZXRXaW5kb3dMb2NhdGlvbnNPZlJlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5ID1cbiAgICAgICAgICB1dGlsaXR5LmNhbGN1bGF0ZU9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5KHJlc3VsdClcbiAgICAgICAgY29uc3QgY2VudGVyID0gbWFwLmdldFBpeGVsRnJvbUNvb3JkaW5hdGUob3BlbmxheWVyc0NlbnRlck9mR2VvbWV0cnkpXG4gICAgICAgIGlmIChjZW50ZXIpIHtcbiAgICAgICAgICByZXR1cm4gY2VudGVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgLypcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBkaXN0YW5jZSAoaW4gbWV0ZXJzKSBiZXR3ZWVuIHRoZSB0d28gcG9zaXRpb25zIGluIHRoZSBnaXZlbiBhcnJheSBvZlxuICAgICAqIENvb3JkaW5hdGVzLlxuICAgICAqL1xuICAgIGNhbGN1bGF0ZURpc3RhbmNlQmV0d2VlblBvc2l0aW9ucyhjb29yZHM6IGFueSkge1xuICAgICAgY29uc3QgbGluZSA9IG5ldyBPcGVubGF5ZXJzLmdlb20uTGluZVN0cmluZyhjb29yZHMpXG4gICAgICBjb25zdCBzcGhlcmVMZW5ndGggPSBPcGVubGF5ZXJzLlNwaGVyZS5nZXRMZW5ndGgobGluZSlcbiAgICAgIHJldHVybiBzcGhlcmVMZW5ndGhcbiAgICB9LFxuICAgIC8qXG4gICAgICogRHJhd3MgYSBtYXJrZXIgb24gdGhlIG1hcCBkZXNpZ25hdGluZyBhIHN0YXJ0L2VuZCBwb2ludCBmb3IgdGhlIHJ1bGVyIG1lYXN1cmVtZW50LiBUaGUgZ2l2ZW5cbiAgICAgKiBjb29yZGluYXRlcyBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggJ2xhdCcgYW5kICdsb24nIGtleXMgd2l0aCBkZWdyZWVzIHZhbHVlcy4gVGhlIGdpdmVuXG4gICAgICogbWFya2VyIGxhYmVsIHNob3VsZCBiZSBhIHNpbmdsZSBjaGFyYWN0ZXIgb3IgZGlnaXQgdGhhdCBpcyBkaXNwbGF5ZWQgb24gdGhlIG1hcCBtYXJrZXIuXG4gICAgICovXG4gICAgYWRkUnVsZXJQb2ludChjb29yZGluYXRlczogYW55LCBtYXJrZXJMYWJlbDogYW55KSB7XG4gICAgICBjb25zdCB7IGxhdCwgbG9uIH0gPSBjb29yZGluYXRlc1xuICAgICAgY29uc3QgcG9pbnQgPSBbbG9uLCBsYXRdXG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBpZDogbWFya2VyTGFiZWwsXG4gICAgICAgIGNvbG9yOiBydWxlckNvbG9yLFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYWRkUG9pbnQocG9pbnQsIG9wdGlvbnMpXG4gICAgfSxcbiAgICAvKlxuICAgICAqIFJlbW92ZXMgdGhlIGdpdmVuIHBvaW50IExheWVyIGZyb20gdGhlIG1hcC5cbiAgICAgKi9cbiAgICByZW1vdmVSdWxlclBvaW50KHBvaW50TGF5ZXI6IGFueSkge1xuICAgICAgbWFwLnJlbW92ZUxheWVyKHBvaW50TGF5ZXIpXG4gICAgfSxcbiAgICBydWxlckxpbmU6IG51bGwgYXMgbnVsbCB8IE9wZW5sYXllcnMubGF5ZXIuVmVjdG9yLFxuICAgIC8qXG4gICAgICogRHJhd3MgYSBsaW5lIG9uIHRoZSBtYXAgYmV0d2VlbiB0aGUgcG9pbnRzIGluIHRoZSBnaXZlbiBhcnJheSBvZiBwb2ludCBWZWN0b3JzLlxuICAgICAqL1xuICAgIGFkZFJ1bGVyTGluZShwb2ludDogYW55KSB7XG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBpZDogJ3J1bGVyLWxpbmUnLFxuICAgICAgICB0aXRsZTogJ0xpbmUgZm9yIHJ1bGVyIG1lYXN1cmVtZW50JyxcbiAgICAgICAgY29sb3I6ICcjNTA2Rjg1JyxcbiAgICAgIH1cbiAgICAgIGNvbnN0IHN0YXJ0aW5nQ29vcmRpbmF0ZXMgPSBtYXBNb2RlbC5nZXQoJ3N0YXJ0aW5nQ29vcmRpbmF0ZXMnKVxuICAgICAgY29uc3QgbGluZVBvaW50cyA9IFtcbiAgICAgICAgW3N0YXJ0aW5nQ29vcmRpbmF0ZXNbJ2xvbiddLCBzdGFydGluZ0Nvb3JkaW5hdGVzWydsYXQnXV0sXG4gICAgICAgIFtwb2ludFsnbG9uJ10sIHBvaW50WydsYXQnXV0sXG4gICAgICBdXG4gICAgICB0aGlzLnJ1bGVyTGluZSA9IHRoaXMuYWRkTGluZShsaW5lUG9pbnRzLCBvcHRpb25zKVxuICAgICAgcmV0dXJuIHRoaXMucnVsZXJMaW5lXG4gICAgfSxcbiAgICAvKlxuICAgICAqIFVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHJ1bGVyIGxpbmVcbiAgICAgKi9cbiAgICBzZXRSdWxlckxpbmUocG9pbnQ6IGFueSkge1xuICAgICAgdGhpcy5yZW1vdmVSdWxlckxpbmUoKVxuICAgICAgdGhpcy5hZGRSdWxlckxpbmUocG9pbnQpXG4gICAgfSxcbiAgICAvKlxuICAgICAqIFJlbW92ZXMgdGhlIGdpdmVuIGxpbmUgTGF5ZXIgZnJvbSB0aGUgbWFwLlxuICAgICAqL1xuICAgIHJlbW92ZVJ1bGVyTGluZSgpIHtcbiAgICAgIG1hcC5yZW1vdmVMYXllcih0aGlzLnJ1bGVyTGluZSlcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICBBZGRzIGEgYmlsbGJvYXJkIHBvaW50IHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgKi9cbiAgICBhZGRQb2ludFdpdGhUZXh0KHBvaW50OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgcG9pbnRPYmplY3QgPSBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50KVxuICAgICAgY29uc3QgZmVhdHVyZSA9IG5ldyBPcGVubGF5ZXJzLkZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IE9wZW5sYXllcnMuZ2VvbS5Qb2ludChwb2ludE9iamVjdCksXG4gICAgICB9KVxuICAgICAgY29uc3QgYmFkZ2VPZmZzZXQgPSBvcHRpb25zLmJhZGdlT3B0aW9ucyA/IDggOiAwXG4gICAgICBjb25zdCBpbWdXaWR0aCA9IDQ0ICsgYmFkZ2VPZmZzZXRcbiAgICAgIGNvbnN0IGltZ0hlaWdodCA9IDQ0ICsgYmFkZ2VPZmZzZXRcblxuICAgICAgZmVhdHVyZS5zZXRJZChvcHRpb25zLmlkKVxuICAgICAgOyhmZWF0dXJlIGFzIGFueSkudW5zZWxlY3RlZFN0eWxlID0gbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICBpbWFnZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuSWNvbih7XG4gICAgICAgICAgaW1nOiBEcmF3aW5nVXRpbGl0eS5nZXRDaXJjbGVXaXRoVGV4dCh7XG4gICAgICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgaW1nU2l6ZTogW2ltZ1dpZHRoLCBpbWdIZWlnaHRdLFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICA7KGZlYXR1cmUgYXMgYW55KS5wYXJ0aWFsbHlTZWxlY3RlZFN0eWxlID0gbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICBpbWFnZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuSWNvbih7XG4gICAgICAgICAgaW1nOiBEcmF3aW5nVXRpbGl0eS5nZXRDaXJjbGVXaXRoVGV4dCh7XG4gICAgICAgICAgICBmaWxsQ29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnYmxhY2snLFxuICAgICAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBpbWdTaXplOiBbaW1nV2lkdGgsIGltZ0hlaWdodF0sXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgIDsoZmVhdHVyZSBhcyBhbnkpLnNlbGVjdGVkU3R5bGUgPSBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHlsZSh7XG4gICAgICAgIGltYWdlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5JY29uKHtcbiAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgICAgIGZpbGxDb2xvcjogJ29yYW5nZScsXG4gICAgICAgICAgICB0ZXh0OiBvcHRpb25zLmlkLmxlbmd0aCxcbiAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBpbWdTaXplOiBbaW1nV2lkdGgsIGltZ0hlaWdodF0sXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgIHN3aXRjaCAob3B0aW9ucy5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGNhc2UgJ3NlbGVjdGVkJzpcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKChmZWF0dXJlIGFzIGFueSkuc2VsZWN0ZWRTdHlsZSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdwYXJ0aWFsbHknOlxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoKGZlYXR1cmUgYXMgYW55KS5wYXJ0aWFsbHlTZWxlY3RlZFN0eWxlKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3Vuc2VsZWN0ZWQnOlxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoKGZlYXR1cmUgYXMgYW55KS51bnNlbGVjdGVkU3R5bGUpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHZlY3RvclNvdXJjZSA9IG5ldyBPcGVubGF5ZXJzLnNvdXJjZS5WZWN0b3Ioe1xuICAgICAgICBmZWF0dXJlczogW2ZlYXR1cmVdLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IHZlY3RvckxheWVyID0gbmV3IE9wZW5sYXllcnMubGF5ZXIuVmVjdG9yKHtcbiAgICAgICAgc291cmNlOiB2ZWN0b3JTb3VyY2UsXG4gICAgICAgIHpJbmRleDogMSxcbiAgICAgIH0pXG4gICAgICBtYXAuYWRkTGF5ZXIodmVjdG9yTGF5ZXIpXG4gICAgICByZXR1cm4gdmVjdG9yTGF5ZXJcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBiaWxsYm9hcmQgcG9pbnQgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICAgIE9wdGlvbnMgYXJlIGEgdmlldyB0byByZWxhdGUgdG8sIGFuZCBhbiBpZCwgYW5kIGEgY29sb3IuXG4gICAgICAgICAgICAqL1xuICAgIGFkZFBvaW50KHBvaW50OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgcG9pbnRPYmplY3QgPSBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50KVxuICAgICAgY29uc3QgZmVhdHVyZSA9IG5ldyBPcGVubGF5ZXJzLkZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IE9wZW5sYXllcnMuZ2VvbS5Qb2ludChwb2ludE9iamVjdCksXG4gICAgICAgIG5hbWU6IG9wdGlvbnMudGl0bGUsXG4gICAgICB9KVxuICAgICAgZmVhdHVyZS5zZXRJZChvcHRpb25zLmlkKVxuICAgICAgY29uc3QgYmFkZ2VPZmZzZXQgPSBvcHRpb25zLmJhZGdlT3B0aW9ucyA/IDggOiAwXG4gICAgICBsZXQgeCA9IDM5ICsgYmFkZ2VPZmZzZXQsXG4gICAgICAgIHkgPSA0MCArIGJhZGdlT2Zmc2V0XG4gICAgICBpZiAob3B0aW9ucy5zaXplKSB7XG4gICAgICAgIHggPSBvcHRpb25zLnNpemUueFxuICAgICAgICB5ID0gb3B0aW9ucy5zaXplLnlcbiAgICAgIH1cbiAgICAgIDsoZmVhdHVyZSBhcyBhbnkpLnVuc2VsZWN0ZWRTdHlsZSA9IG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgaW1hZ2U6IG5ldyBPcGVubGF5ZXJzLnN0eWxlLkljb24oe1xuICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0UGluKHtcbiAgICAgICAgICAgIGZpbGxDb2xvcjogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgaW1nU2l6ZTogW3gsIHldLFxuICAgICAgICAgIGFuY2hvcjogW3ggLyAyIC0gYmFkZ2VPZmZzZXQgLyAyLCAwXSxcbiAgICAgICAgICBhbmNob3JPcmlnaW46ICdib3R0b20tbGVmdCcsXG4gICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICBhbmNob3JZVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICA7KGZlYXR1cmUgYXMgYW55KS5zZWxlY3RlZFN0eWxlID0gbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICBpbWFnZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuSWNvbih7XG4gICAgICAgICAgaW1nOiBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICAgICAgZmlsbENvbG9yOiAnb3JhbmdlJyxcbiAgICAgICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgICAgIGJhZGdlT3B0aW9uczogb3B0aW9ucy5iYWRnZU9wdGlvbnMsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgaW1nU2l6ZTogW3gsIHldLFxuICAgICAgICAgIGFuY2hvcjogW3ggLyAyIC0gYmFkZ2VPZmZzZXQgLyAyLCAwXSxcbiAgICAgICAgICBhbmNob3JPcmlnaW46ICdib3R0b20tbGVmdCcsXG4gICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICBhbmNob3JZVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWRcbiAgICAgICAgICA/IChmZWF0dXJlIGFzIGFueSkuc2VsZWN0ZWRTdHlsZVxuICAgICAgICAgIDogKGZlYXR1cmUgYXMgYW55KS51bnNlbGVjdGVkU3R5bGVcbiAgICAgIClcbiAgICAgIGNvbnN0IHZlY3RvclNvdXJjZSA9IG5ldyBPcGVubGF5ZXJzLnNvdXJjZS5WZWN0b3Ioe1xuICAgICAgICBmZWF0dXJlczogW2ZlYXR1cmVdLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IHZlY3RvckxheWVyID0gbmV3IE9wZW5sYXllcnMubGF5ZXIuVmVjdG9yKHtcbiAgICAgICAgc291cmNlOiB2ZWN0b3JTb3VyY2UsXG4gICAgICAgIHpJbmRleDogMSxcbiAgICAgIH0pXG4gICAgICBtYXAuYWRkTGF5ZXIodmVjdG9yTGF5ZXIpXG4gICAgICByZXR1cm4gdmVjdG9yTGF5ZXJcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBsYWJlbCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2ludCBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYW4gaWQgYW5kIHRleHQuXG4gICAgICAgICAgICAqL1xuICAgIGFkZExhYmVsKHBvaW50OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgcG9pbnRPYmplY3QgPSBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50KVxuICAgICAgY29uc3QgZmVhdHVyZSA9IG5ldyBPcGVubGF5ZXJzLkZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IE9wZW5sYXllcnMuZ2VvbS5Qb2ludChwb2ludE9iamVjdCksXG4gICAgICAgIG5hbWU6IG9wdGlvbnMudGV4dCxcbiAgICAgICAgaXNMYWJlbDogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHlsZSh7XG4gICAgICAgICAgdGV4dDogbmV3IE9wZW5sYXllcnMuc3R5bGUuVGV4dCh7XG4gICAgICAgICAgICB0ZXh0OiBvcHRpb25zLnRleHQsXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgdGV4dDogYW55OyBvdmVyZmxvdzogYm9vbGVhbjsgLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIG92ZXJmbG93OiB0cnVlLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IE9wZW5sYXllcnMuc291cmNlLlZlY3Rvcih7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgY29uc3QgdmVjdG9yTGF5ZXIgPSBuZXcgT3BlbmxheWVycy5sYXllci5WZWN0b3Ioe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgICAgekluZGV4OiAxLFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgc291cmNlOiBPcGVubGF5ZXJzLnNvdXJjZS5WZWN0Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgaWQ6IG9wdGlvbnMuaWQsXG4gICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIG1hcE1vZGVsLmFkZExhYmVsKHZlY3RvckxheWVyKVxuICAgICAgcmV0dXJuIHZlY3RvckxheWVyXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgICBBZGRzIGEgcG9seWxpbmUgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gbGluZSBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgICAgICovXG4gICAgYWRkTGluZShsaW5lOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3QgbGluZU9iamVjdCA9IGxpbmUubWFwKChjb29yZGluYXRlOiBhbnkpID0+XG4gICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBuZXcgT3BlbmxheWVycy5GZWF0dXJlKHtcbiAgICAgICAgZ2VvbWV0cnk6IG5ldyBPcGVubGF5ZXJzLmdlb20uTGluZVN0cmluZyhsaW5lT2JqZWN0KSxcbiAgICAgICAgbmFtZTogb3B0aW9ucy50aXRsZSxcbiAgICAgIH0pXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICBjb25zdCBjb21tb25TdHlsZSA9IG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgc3Ryb2tlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHJva2Uoe1xuICAgICAgICAgIGNvbG9yOiBvcHRpb25zLmNvbG9yIHx8IGRlZmF1bHRDb2xvcixcbiAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgfSksXG4gICAgICB9KVxuICAgICAgOyhmZWF0dXJlIGFzIGFueSkudW5zZWxlY3RlZFN0eWxlID0gW1xuICAgICAgICBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHlsZSh7XG4gICAgICAgICAgc3Ryb2tlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHJva2Uoe1xuICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICAgIGNvbW1vblN0eWxlLFxuICAgICAgXVxuICAgICAgOyhmZWF0dXJlIGFzIGFueSkuc2VsZWN0ZWRTdHlsZSA9IFtcbiAgICAgICAgbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICAgIHN0cm9rZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuU3Ryb2tlKHtcbiAgICAgICAgICAgIGNvbG9yOiAnYmxhY2snLFxuICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pLFxuICAgICAgICBjb21tb25TdHlsZSxcbiAgICAgIF1cbiAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gKGZlYXR1cmUgYXMgYW55KS5zZWxlY3RlZFN0eWxlXG4gICAgICAgICAgOiAoZmVhdHVyZSBhcyBhbnkpLnVuc2VsZWN0ZWRTdHlsZVxuICAgICAgKVxuICAgICAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IE9wZW5sYXllcnMuc291cmNlLlZlY3Rvcih7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgY29uc3QgdmVjdG9yTGF5ZXIgPSBuZXcgT3BlbmxheWVycy5sYXllci5WZWN0b3Ioe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgIH0pXG4gICAgICBtYXAuYWRkTGF5ZXIodmVjdG9yTGF5ZXIpXG4gICAgICByZXR1cm4gdmVjdG9yTGF5ZXJcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBwb2x5Z29uIGZpbGwgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9seWdvbiBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRQb2x5Z29uKCkge30sXG4gICAgLypcbiAgICAgICAgICAgICBVcGRhdGVzIGEgcGFzc2VkIGluIGdlb21ldHJ5IHRvIHJlZmxlY3Qgd2hldGhlciBvciBub3QgaXQgaXMgc2VsZWN0ZWQuXG4gICAgICAgICAgICAgT3B0aW9ucyBwYXNzZWQgaW4gYXJlIGNvbG9yIGFuZCBpc1NlbGVjdGVkLlxuICAgICAgICAgICAgICovXG4gICAgdXBkYXRlQ2x1c3RlcihnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChnZW9tZXRyeS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgZ2VvbWV0cnkuZm9yRWFjaCgoaW5uZXJHZW9tZXRyeSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlQ2x1c3Rlcihpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdlb21ldHJ5LmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF1cbiAgICAgICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGZlYXR1cmUuZ2V0R2VvbWV0cnkoKVxuICAgICAgICBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gT3BlbmxheWVycy5nZW9tLlBvaW50KSB7XG4gICAgICAgICAgZ2VvbWV0cnkuc2V0WkluZGV4KG9wdGlvbnMuaXNTZWxlY3RlZCA/IDIgOiAxKVxuICAgICAgICAgIHN3aXRjaCAob3B0aW9ucy5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS5zZWxlY3RlZFN0eWxlKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAncGFydGlhbGx5JzpcbiAgICAgICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLnBhcnRpYWxseVNlbGVjdGVkU3R5bGUpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlICd1bnNlbGVjdGVkJzpcbiAgICAgICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShmZWF0dXJlLnVuc2VsZWN0ZWRTdHlsZSlcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gT3BlbmxheWVycy5nZW9tLkxpbmVTdHJpbmdcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICAgICAgbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICAgICAgICBzdHJva2U6IG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0cm9rZSh7XG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LCAuMSknLFxuICAgICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICAgICAgICBzdHJva2U6IG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0cm9rZSh7XG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsMCwwLCAuMSknLFxuICAgICAgICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF1cbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byByZWZsZWN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIHNlbGVjdGVkLlxuICAgICAgICAgICAgICBPcHRpb25zIHBhc3NlZCBpbiBhcmUgY29sb3IgYW5kIGlzU2VsZWN0ZWQuXG4gICAgICAgICAgICAqL1xuICAgIHVwZGF0ZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgaWYgKGdlb21ldHJ5LmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVHZW9tZXRyeShpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdlb21ldHJ5LmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF1cbiAgICAgICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGZlYXR1cmUuZ2V0R2VvbWV0cnkoKVxuICAgICAgICBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gT3BlbmxheWVycy5nZW9tLlBvaW50KSB7XG4gICAgICAgICAgZ2VvbWV0cnkuc2V0WkluZGV4KG9wdGlvbnMuaXNTZWxlY3RlZCA/IDIgOiAxKVxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWQgPyBmZWF0dXJlLnNlbGVjdGVkU3R5bGUgOiBmZWF0dXJlLnVuc2VsZWN0ZWRTdHlsZVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICBnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBPcGVubGF5ZXJzLmdlb20uTGluZVN0cmluZ1xuICAgICAgICApIHtcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICAgICAgb3B0aW9ucy5pc1NlbGVjdGVkID8gZmVhdHVyZS5zZWxlY3RlZFN0eWxlIDogZmVhdHVyZS51bnNlbGVjdGVkU3R5bGVcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldEdlb21ldHJ5U3R5bGUoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55LCBmZWF0dXJlOiBhbnkpIHtcbiAgICAgIGNvbnN0IGdlb21ldHJ5SW5zdGFuY2UgPSBmZWF0dXJlLmdldEdlb21ldHJ5KClcbiAgICAgIGlmIChnZW9tZXRyeUluc3RhbmNlLmdldFR5cGUoKSA9PT0gJ1BvaW50Jykge1xuICAgICAgICBsZXQgcG9pbnRXaWR0aCA9IDM5XG4gICAgICAgIGxldCBwb2ludEhlaWdodCA9IDQwXG4gICAgICAgIGlmIChvcHRpb25zLnNpemUpIHtcbiAgICAgICAgICBwb2ludFdpZHRoID0gb3B0aW9ucy5zaXplLnhcbiAgICAgICAgICBwb2ludEhlaWdodCA9IG9wdGlvbnMuc2l6ZS55XG4gICAgICAgIH1cbiAgICAgICAgZ2VvbWV0cnkuc2V0WkluZGV4KG9wdGlvbnMuaXNTZWxlY3RlZCA/IDIgOiAxKVxuICAgICAgICBpZiAoIWZlYXR1cmUuZ2V0UHJvcGVydGllcygpLmlzTGFiZWwpIHtcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICAgICAgbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICAgICAgICBpbWFnZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuSWNvbih7XG4gICAgICAgICAgICAgICAgaW1nOiBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmlzU2VsZWN0ZWQgPyAnb3JhbmdlJyA6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBpbWdTaXplOiBbcG9pbnRXaWR0aCwgcG9pbnRIZWlnaHRdLFxuICAgICAgICAgICAgICAgIGFuY2hvcjogW3BvaW50V2lkdGggLyAyLCAwXSxcbiAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46ICdib3R0b20tbGVmdCcsXG4gICAgICAgICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICAgICAgICBhbmNob3JZVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgICAgICBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHlsZSh7XG4gICAgICAgICAgICAgIHRleHQ6IHRoaXMuY3JlYXRlVGV4dFN0eWxlKFxuICAgICAgICAgICAgICAgIGZlYXR1cmUsXG4gICAgICAgICAgICAgICAgbWFwLmdldFZpZXcoKS5nZXRSZXNvbHV0aW9uKClcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICAgIGdlb21ldHJ5LnNldCgnaXNTZWxlY3RlZCcsIG9wdGlvbnMuaXNTZWxlY3RlZClcbiAgICAgICAgICBzaG93SGlkZUxhYmVsKHtcbiAgICAgICAgICAgIGdlb21ldHJ5LFxuICAgICAgICAgICAgZmVhdHVyZSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5SW5zdGFuY2UuZ2V0VHlwZSgpID09PSAnTGluZVN0cmluZycpIHtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICAgIG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgICAgIHN0cm9rZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuU3Ryb2tlKHtcbiAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICAgICAgc3Ryb2tlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHJva2Uoe1xuICAgICAgICAgICAgICBjb2xvcjogb3B0aW9ucy5jb2xvciB8fCBkZWZhdWx0Q29sb3IsXG4gICAgICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSksXG4gICAgICAgIF1cbiAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShzdHlsZXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBjcmVhdGVUZXh0U3R5bGUoZmVhdHVyZTogYW55LCByZXNvbHV0aW9uOiBhbnkpIHtcbiAgICAgIGNvbnN0IGZpbGxDb2xvciA9ICcjMDAwMDAwJ1xuICAgICAgY29uc3Qgb3V0bGluZUNvbG9yID0gJyNmZmZmZmYnXG4gICAgICBjb25zdCBvdXRsaW5lV2lkdGggPSAzXG4gICAgICByZXR1cm4gbmV3IE9wZW5sYXllcnMuc3R5bGUuVGV4dCh7XG4gICAgICAgIHRleHQ6IHRoaXMuZ2V0VGV4dChmZWF0dXJlLCByZXNvbHV0aW9uKSxcbiAgICAgICAgZmlsbDogbmV3IE9wZW5sYXllcnMuc3R5bGUuRmlsbCh7IGNvbG9yOiBmaWxsQ29sb3IgfSksXG4gICAgICAgIHN0cm9rZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuU3Ryb2tlKHtcbiAgICAgICAgICBjb2xvcjogb3V0bGluZUNvbG9yLFxuICAgICAgICAgIHdpZHRoOiBvdXRsaW5lV2lkdGgsXG4gICAgICAgIH0pLFxuICAgICAgICBvZmZzZXRYOiAyMCxcbiAgICAgICAgb2Zmc2V0WTogLTE1LFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgdGV4dDogYW55OyBmaWxsOiBPcGVubGF5ZXJzLnN0Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgcGxhY2VtZW50OiAncG9pbnQnLFxuICAgICAgICBtYXhBbmdsZTogNDUsXG4gICAgICAgIG92ZXJmbG93OiB0cnVlLFxuICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgIHBhZGRpbmc6IFs1LCA1LCA1LCA1XSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRUZXh0KGZlYXR1cmU6IGFueSwgcmVzb2x1dGlvbjogYW55KSB7XG4gICAgICBjb25zdCBtYXhSZXNvbHV0aW9uID0gMTIwMFxuICAgICAgY29uc3QgdGV4dCA9XG4gICAgICAgIHJlc29sdXRpb24gPiBtYXhSZXNvbHV0aW9uID8gJycgOiB0aGlzLnRydW5jKGZlYXR1cmUuZ2V0KCduYW1lJyksIDIwKVxuICAgICAgcmV0dXJuIHRleHRcbiAgICB9LFxuICAgIHRydW5jKHN0cjogYW55LCBuOiBhbnkpIHtcbiAgICAgIHJldHVybiBzdHIubGVuZ3RoID4gbiA/IHN0ci5zdWJzdHIoMCwgbiAtIDEpICsgJy4uLicgOiBzdHIuc3Vic3RyKDApXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgaGlkZGVuXG4gICAgICAgICAgICAgKi9cbiAgICBoaWRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgZ2VvbWV0cnkuc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byBiZSBzaG93blxuICAgICAgICAgICAgICovXG4gICAgc2hvd0dlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZW9tZXRyeS5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdXG4gICAgICBpZiAoZmVhdHVyZS5nZXRQcm9wZXJ0aWVzKCkuaXNMYWJlbCkge1xuICAgICAgICBzaG93SGlkZUxhYmVsKHtcbiAgICAgICAgICBnZW9tZXRyeSxcbiAgICAgICAgICBmZWF0dXJlLFxuICAgICAgICAgIGZpbmRTZWxlY3RlZDogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlb21ldHJ5LnNldFZpc2libGUodHJ1ZSlcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZW9tZXRyeS5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdXG4gICAgICBpZiAoZmVhdHVyZS5nZXRQcm9wZXJ0aWVzKCkuaXNMYWJlbCkge1xuICAgICAgICBtYXBNb2RlbC5yZW1vdmVMYWJlbChnZW9tZXRyeSlcbiAgICAgICAgc2hvd0hpZGRlbkxhYmVsKGdlb21ldHJ5KVxuICAgICAgfVxuICAgICAgbWFwLnJlbW92ZUxheWVyKGdlb21ldHJ5KVxuICAgIH0sXG4gICAgc2hvd011bHRpTGluZVNoYXBlKGxvY2F0aW9uTW9kZWw6IGFueSkge1xuICAgICAgbGV0IGxpbmVPYmplY3QgPSBsb2NhdGlvbk1vZGVsLmdldCgnbXVsdGlsaW5lJylcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMyKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICd1bmRlZmluZWQnLlxuICAgICAgaWYgKHZhbGlkYXRlR2VvKCdtdWx0aWxpbmUnLCBKU09OLnN0cmluZ2lmeShsaW5lT2JqZWN0KSkuZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBsaW5lT2JqZWN0ID0gbGluZU9iamVjdC5tYXAoKGxpbmU6IGFueSkgPT5cbiAgICAgICAgbGluZS5tYXAoKGNvb3JkczogYW55KSA9PiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkcykpXG4gICAgICApXG4gICAgICBsZXQgZmVhdHVyZSA9IG5ldyBPcGVubGF5ZXJzLkZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IE9wZW5sYXllcnMuZ2VvbS5NdWx0aUxpbmVTdHJpbmcobGluZU9iamVjdCksXG4gICAgICB9KVxuICAgICAgZmVhdHVyZS5zZXRJZChsb2NhdGlvbk1vZGVsLmNpZClcbiAgICAgIGNvbnN0IHN0eWxlcyA9IFtcbiAgICAgICAgbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICAgIHN0cm9rZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuU3Ryb2tlKHtcbiAgICAgICAgICAgIGNvbG9yOiBsb2NhdGlvbk1vZGVsLmdldCgnY29sb3InKSB8fCBkZWZhdWx0Q29sb3IsXG4gICAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICBdXG4gICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVZlY3RvckxheWVyKGxvY2F0aW9uTW9kZWwsIGZlYXR1cmUpXG4gICAgfSxcbiAgICBjcmVhdGVWZWN0b3JMYXllcihsb2NhdGlvbk1vZGVsOiBhbnksIGZlYXR1cmU6IGFueSkge1xuICAgICAgbGV0IHZlY3RvclNvdXJjZSA9IG5ldyBPcGVubGF5ZXJzLnNvdXJjZS5WZWN0b3Ioe1xuICAgICAgICBmZWF0dXJlczogW2ZlYXR1cmVdLFxuICAgICAgfSlcbiAgICAgIGxldCB2ZWN0b3JMYXllciA9IG5ldyBPcGVubGF5ZXJzLmxheWVyLlZlY3Rvcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgb3ZlcmxheXNbbG9jYXRpb25Nb2RlbC5jaWRdID0gdmVjdG9yTGF5ZXJcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgZGVzdHJveVNoYXBlKGNpZDogYW55KSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBjb25zdCBzaGFwZUluZGV4ID0gc2hhcGVzLmZpbmRJbmRleCgoc2hhcGUpID0+IGNpZCA9PT0gc2hhcGUubW9kZWwuY2lkKVxuICAgICAgaWYgKHNoYXBlSW5kZXggPj0gMCkge1xuICAgICAgICBzaGFwZXNbc2hhcGVJbmRleF0uZGVzdHJveSgpXG4gICAgICAgIHNoYXBlcy5zcGxpY2Uoc2hhcGVJbmRleCwgMSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlc3Ryb3lTaGFwZXMoKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcbiAgICAgICAgc2hhcGUuZGVzdHJveSgpXG4gICAgICB9KVxuICAgICAgc2hhcGVzID0gW11cbiAgICB9LFxuICAgIGdldE1hcCgpIHtcbiAgICAgIHJldHVybiBtYXBcbiAgICB9LFxuICAgIHpvb21JbigpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSBtYXAuZ2V0VmlldygpXG4gICAgICBjb25zdCB6b29tID0gdmlldy5nZXRab29tKClcbiAgICAgIHZpZXcuc2V0Wm9vbSh6b29tICsgMSlcbiAgICB9LFxuICAgIHpvb21PdXQoKSB7XG4gICAgICBjb25zdCB2aWV3ID0gbWFwLmdldFZpZXcoKVxuICAgICAgY29uc3Qgem9vbSA9IHZpZXcuZ2V0Wm9vbSgpXG4gICAgICB2aWV3LnNldFpvb20oem9vbSAtIDEpXG4gICAgfSxcbiAgICBkZXN0cm95KCkge1xuICAgICAgdW5saXN0ZW5Ub1Jlc2l6ZSgpXG4gICAgfSxcbiAgfVxuICByZXR1cm4gZXhwb3NlZE1ldGhvZHNcbn1cbiJdfQ==