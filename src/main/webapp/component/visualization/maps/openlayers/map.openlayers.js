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
//# sourceMappingURL=map.openlayers.js.map