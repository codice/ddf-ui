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
            if (Array.isArray(coords) && coords.length > 0) {
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
            if (Array.isArray(geometry)) {
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
            if (Array.isArray(geometry)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLm9wZW5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9vcGVubGF5ZXJzL21hcC5vcGVubGF5ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osNEJBQTRCO0FBQzVCLE9BQU8sT0FBTyxNQUFNLHFEQUFxRCxDQUFBO0FBQ3pFLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sY0FBYyxNQUFNLG1CQUFtQixDQUFBO0FBQzlDLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUNuQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUMvRSxPQUFPLEtBQUssTUFBTSxzQkFBc0IsQ0FBQTtBQUN4QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFHMUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFDdkUsT0FBTyxTQUFTLE1BQU0saUJBQWlCLENBQUE7QUFDdkMsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFBO0FBQzlCLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQTtBQUM1QixTQUFTLFNBQVMsQ0FBQyxnQkFBcUIsRUFBRSxTQUFjO0lBQ3RELElBQU0seUJBQXlCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQztRQUNyRCxVQUFVLEVBQUUsU0FBUztLQUN0QixDQUFDLENBQUE7SUFDRixJQUFNLEdBQUcsR0FBRyx5QkFBeUIsQ0FBQyxPQUFPLENBQUM7UUFDNUMsSUFBSSxFQUFFLEdBQUc7UUFDVCxPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxDQUFDLENBQUMs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Q0QsTUFBTTtZQUNKLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUMxQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDeEIsQ0FBQztRQUNELE9BQU87WUFDTCxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDMUIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLENBQUM7UUFDRCxPQUFPO1lBQ0wsZ0JBQWdCLEVBQUUsQ0FBQTtRQUNwQixDQUFDO0tBQ0YsQ0FBQTtJQUNELE9BQU8sY0FBYyxDQUFBO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qIGdsb2JhbCByZXF1aXJlLCB3aW5kb3cgKi9cbmltcG9ydCB3cmFwTnVtIGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy93cmFwLW51bS93cmFwLW51bSdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuL3V0aWxpdHknXG5pbXBvcnQgRHJhd2luZ1V0aWxpdHkgZnJvbSAnLi4vRHJhd2luZ1V0aWxpdHknXG5pbXBvcnQgT3BlbmxheWVycyBmcm9tICdvcGVubGF5ZXJzJ1xuaW1wb3J0IHsgT3BlbmxheWVyc0xheWVycyB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL2NvbnRyb2xsZXJzL29wZW5sYXllcnMubGF5ZXJzJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IHsgdmFsaWRhdGVHZW8gfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCB7IENsdXN0ZXJUeXBlIH0gZnJvbSAnLi4vcmVhY3QvZ2VvbWV0cmllcydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IF9kZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5jb25zdCBkZWZhdWx0Q29sb3IgPSAnIzNjNmRkNSdcbmNvbnN0IHJ1bGVyQ29sb3IgPSAnIzUwNmY4NSdcbmZ1bmN0aW9uIGNyZWF0ZU1hcChpbnNlcnRpb25FbGVtZW50OiBhbnksIG1hcExheWVyczogYW55KSB7XG4gIGNvbnN0IGxheWVyQ29sbGVjdGlvbkNvbnRyb2xsZXIgPSBuZXcgT3BlbmxheWVyc0xheWVycyh7XG4gICAgY29sbGVjdGlvbjogbWFwTGF5ZXJzLFxuICB9KVxuICBjb25zdCBtYXAgPSBsYXllckNvbGxlY3Rpb25Db250cm9sbGVyLm1ha2VNYXAoe1xuICAgIHpvb206IDIuNyxcbiAgICBtaW5ab29tOiAyLjMsXG4gICAgY2VudGVyOiBbMCwgMF0sXG4gICAgZWxlbWVudDogaW5zZXJ0aW9uRWxlbWVudCxcbiAgfSlcbiAgcmV0dXJuIG1hcFxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRGcm9tUG9zaXRpb24ocG9zaXRpb246IGFueSwgbWFwOiBhbnkpIHtcbiAgY29uc3QgZmVhdHVyZXM6IGFueSA9IFtdXG4gIG1hcC5mb3JFYWNoRmVhdHVyZUF0UGl4ZWwocG9zaXRpb24sIChmZWF0dXJlOiBhbnkpID0+IHtcbiAgICBmZWF0dXJlcy5wdXNoKGZlYXR1cmUpXG4gIH0pXG4gIGlmIChmZWF0dXJlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGZlYXR1cmVzWzBdLmdldElkKClcbiAgfVxufVxuZnVuY3Rpb24gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uOiBhbnksIG1hcDogYW55KSB7XG4gIGNvbnN0IGZlYXR1cmVzOiBhbnkgPSBbXVxuICBsZXQgaWQsIGxvY2F0aW9uSWRcbiAgbWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChwb3NpdGlvbiwgKGZlYXR1cmU6IGFueSkgPT4ge1xuICAgIGZlYXR1cmVzLnB1c2goZmVhdHVyZSlcbiAgfSlcbiAgaWYgKGZlYXR1cmVzLmxlbmd0aCA+IDApIHtcbiAgICBpZCA9IGZlYXR1cmVzWzBdLmdldElkKClcbiAgICBsb2NhdGlvbklkID0gZmVhdHVyZXNbMF0uZ2V0KCdsb2NhdGlvbklkJylcbiAgfVxuICByZXR1cm4geyBpZCwgbG9jYXRpb25JZCB9XG59XG5mdW5jdGlvbiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50OiBbbnVtYmVyLCBudW1iZXJdKSB7XG4gIGNvbnN0IGNvb3JkcyA9IFtwb2ludFswXSwgcG9pbnRbMV1dXG4gIHJldHVybiBPcGVubGF5ZXJzLnByb2oudHJhbnNmb3JtKFxuICAgIGNvb3JkcyBhcyBPcGVubGF5ZXJzLkNvb3JkaW5hdGUsXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG59XG5mdW5jdGlvbiB1bmNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQ6IFtudW1iZXIsIG51bWJlcl0pIHtcbiAgcmV0dXJuIE9wZW5sYXllcnMucHJvai50cmFuc2Zvcm0oXG4gICAgcG9pbnQsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKSxcbiAgICAnRVBTRzo0MzI2J1xuICApXG59XG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNjEzMykgRklYTUU6ICdsb25naXR1ZGUnIGlzIGRlY2xhcmVkIGJ1dCBpdHMgdmFsdWUgaXMgbmV2ZXIgcmVhLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmZ1bmN0aW9uIG9mZk1hcChbbG9uZ2l0dWRlLCBsYXRpdHVkZV0pIHtcbiAgcmV0dXJuIGxhdGl0dWRlIDwgLTkwIHx8IGxhdGl0dWRlID4gOTBcbn1cbi8vIFRoZSBleHRlbnNpb24gYXJndW1lbnQgaXMgYSBmdW5jdGlvbiB1c2VkIGluIHBhblRvRXh0ZW50XG4vLyBJdCBhbGxvd3MgZm9yIGN1c3RvbWl6YXRpb24gb2YgdGhlIHdheSB0aGUgbWFwIHBhbnMgdG8gcmVzdWx0c1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKFxuICBpbnNlcnRpb25FbGVtZW50OiBhbnksXG4gIF9zZWxlY3Rpb25JbnRlcmZhY2U6IGFueSxcbiAgX25vdGlmaWNhdGlvbkVsOiBhbnksXG4gIF9jb21wb25lbnRFbGVtZW50OiBhbnksXG4gIG1hcE1vZGVsOiBhbnksXG4gIG1hcExheWVyczogYW55XG4pIHtcbiAgbGV0IG92ZXJsYXlzID0ge31cbiAgbGV0IHNoYXBlczogYW55ID0gW11cbiAgY29uc3QgbWFwID0gY3JlYXRlTWFwKGluc2VydGlvbkVsZW1lbnQsIG1hcExheWVycylcblxuICBzZXR1cFRvb2x0aXAobWFwKVxuICBmdW5jdGlvbiBzZXR1cFRvb2x0aXAobWFwOiBhbnkpIHtcbiAgICBtYXAub24oJ3BvaW50ZXJtb3ZlJywgKGU6IGFueSkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB1bmNvbnZlcnRQb2ludENvb3JkaW5hdGUoZS5jb29yZGluYXRlKVxuICAgICAgaWYgKCFvZmZNYXAocG9pbnQpKSB7XG4gICAgICAgIG1hcE1vZGVsLnVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXMoe1xuICAgICAgICAgIGxhdDogcG9pbnRbMV0sXG4gICAgICAgICAgbG9uOiBwb2ludFswXSxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcE1vZGVsLmNsZWFyTW91c2VDb29yZGluYXRlcygpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBmdW5jdGlvbiByZXNpemVNYXAoKSB7XG4gICAgbWFwLnVwZGF0ZVNpemUoKVxuICB9XG4gIGNvbnN0IGRlYm91bmNlZFJlc2l6ZU1hcCA9IF9kZWJvdW5jZShyZXNpemVNYXAsIDI1MClcbiAgZnVuY3Rpb24gbGlzdGVuVG9SZXNpemUoKSB7XG4gICAgOyh3cmVxciBhcyBhbnkpLnZlbnQub24oJ3Jlc2l6ZScsIGRlYm91bmNlZFJlc2l6ZU1hcClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2VkUmVzaXplTWFwKVxuICB9XG4gIGZ1bmN0aW9uIHVubGlzdGVuVG9SZXNpemUoKSB7XG4gICAgOyh3cmVxciBhcyBhbnkpLnZlbnQub2ZmKCdyZXNpemUnLCBkZWJvdW5jZWRSZXNpemVNYXApXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlZFJlc2l6ZU1hcClcbiAgfVxuICBsaXN0ZW5Ub1Jlc2l6ZSgpXG4gIC8qXG4gICAqIFJldHVybnMgYSB2aXNpYmxlIGxhYmVsIHRoYXQgaXMgaW4gdGhlIHNhbWUgbG9jYXRpb24gYXMgdGhlIHByb3ZpZGVkIGxhYmVsIChnZW9tZXRyeUluc3RhbmNlKSBpZiBvbmUgZXhpc3RzLlxuICAgKiBJZiBmaW5kU2VsZWN0ZWQgaXMgdHJ1ZSwgdGhlIGZ1bmN0aW9uIHdpbGwgYWxzbyBjaGVjayBmb3IgaGlkZGVuIGxhYmVscyBpbiB0aGUgc2FtZSBsb2NhdGlvbiBidXQgYXJlIHNlbGVjdGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gZmluZE92ZXJsYXBwaW5nTGFiZWwoZmluZFNlbGVjdGVkOiBhbnksIGdlb21ldHJ5SW5zdGFuY2U6IGFueSkge1xuICAgIHJldHVybiBfLmZpbmQoXG4gICAgICBtYXBNb2RlbC5nZXQoJ2xhYmVscycpLFxuICAgICAgKGxhYmVsKSA9PlxuICAgICAgICBsYWJlbC5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdLmdldEdlb21ldHJ5KCkuZ2V0Q29vcmRpbmF0ZXMoKVswXSA9PT1cbiAgICAgICAgICBnZW9tZXRyeUluc3RhbmNlLmdldENvb3JkaW5hdGVzKClbMF0gJiZcbiAgICAgICAgbGFiZWwuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXS5nZXRHZW9tZXRyeSgpLmdldENvb3JkaW5hdGVzKClbMV0gPT09XG4gICAgICAgICAgZ2VvbWV0cnlJbnN0YW5jZS5nZXRDb29yZGluYXRlcygpWzFdICYmXG4gICAgICAgICgoZmluZFNlbGVjdGVkICYmIGxhYmVsLmdldCgnaXNTZWxlY3RlZCcpKSB8fCBsYWJlbC5nZXRWaXNpYmxlKCkpXG4gICAgKVxuICB9XG4gIC8qXG4gICAgICAgIE9ubHkgc2hvd3Mgb25lIGxhYmVsIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBsYWJlbHMgaW4gdGhlIHNhbWUgbG9jYXRpb24uXG4gIFxuICAgICAgICBTaG93IHRoZSBsYWJlbCBpbiB0aGUgZm9sbG93aW5nIGltcG9ydGFuY2U6XG4gICAgICAgICAgLSBpdCBpcyBzZWxlY3RlZFxuICAgICAgICAgIC0gdGhlcmUgaXMgbm8gb3RoZXIgbGFiZWwgZGlzcGxheWVkIGF0IHRoZSBzYW1lIGxvY2F0aW9uXG4gICAgICAgICAgLSBpdCBpcyB0aGUgbGFiZWwgdGhhdCB3YXMgZm91bmQgYnkgZmluZE92ZXJsYXBwaW5nTGFiZWxcbiAgXG4gICAgICAgIEFyZ3VtZW50cyBhcmU6XG4gICAgICAgICAgLSB0aGUgbGFiZWwgdG8gc2hvdy9oaWRlIChnZW9tZXRyeSwgZmVhdHVyZSlcbiAgICAgICAgICAtIGlmIHRoZSBsYWJlbCBpcyBzZWxlY3RlZFxuICAgICAgICAgIC0gaWYgdGhlIHNlYXJjaCBmb3Igb3ZlcmxhcHBpbmcgbGFiZWwgc2hvdWxkIGluY2x1ZGUgaGlkZGVuIHNlbGVjdGVkIGxhYmVsc1xuICAgICAgICAqL1xuICBmdW5jdGlvbiBzaG93SGlkZUxhYmVsKHsgZ2VvbWV0cnksIGZlYXR1cmUsIGZpbmRTZWxlY3RlZCA9IGZhbHNlIH06IGFueSkge1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBnZW9tZXRyeS5nZXQoJ2lzU2VsZWN0ZWQnKVxuICAgIGNvbnN0IGdlb21ldHJ5SW5zdGFuY2UgPSBmZWF0dXJlLmdldEdlb21ldHJ5KClcbiAgICBjb25zdCBsYWJlbFdpdGhTYW1lUG9zaXRpb24gPSBmaW5kT3ZlcmxhcHBpbmdMYWJlbChcbiAgICAgIGZpbmRTZWxlY3RlZCxcbiAgICAgIGdlb21ldHJ5SW5zdGFuY2VcbiAgICApXG4gICAgaWYgKFxuICAgICAgaXNTZWxlY3RlZCAmJlxuICAgICAgbGFiZWxXaXRoU2FtZVBvc2l0aW9uICYmXG4gICAgICAhbGFiZWxXaXRoU2FtZVBvc2l0aW9uLmdldCgnaXNTZWxlY3RlZCcpXG4gICAgKSB7XG4gICAgICBsYWJlbFdpdGhTYW1lUG9zaXRpb24uc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9XG4gICAgY29uc3Qgb3RoZXJMYWJlbE5vdFNlbGVjdGVkID0gbGFiZWxXaXRoU2FtZVBvc2l0aW9uXG4gICAgICA/ICFsYWJlbFdpdGhTYW1lUG9zaXRpb24uZ2V0KCdpc1NlbGVjdGVkJylcbiAgICAgIDogdHJ1ZVxuICAgIGNvbnN0IHZpc2libGUgPVxuICAgICAgKGlzU2VsZWN0ZWQgJiYgb3RoZXJMYWJlbE5vdFNlbGVjdGVkKSB8fFxuICAgICAgIWxhYmVsV2l0aFNhbWVQb3NpdGlvbiB8fFxuICAgICAgZ2VvbWV0cnkuZ2V0KCdpZCcpID09PSBsYWJlbFdpdGhTYW1lUG9zaXRpb24uZ2V0KCdpZCcpXG4gICAgZ2VvbWV0cnkuc2V0VmlzaWJsZSh2aXNpYmxlKVxuICB9XG4gIC8qXG4gICAgICAgIFNob3dzIGEgaGlkZGVuIGxhYmVsLiBVc2VkIHdoZW4gZGVsZXRpbmcgYSBsYWJlbCB0aGF0IGlzIHNob3duLlxuICAgICAgICAqL1xuICBmdW5jdGlvbiBzaG93SGlkZGVuTGFiZWwoZ2VvbWV0cnk6IGFueSkge1xuICAgIGlmICghZ2VvbWV0cnkuZ2V0VmlzaWJsZSgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGdlb21ldHJ5LmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF0uZ2V0R2VvbWV0cnkoKVxuICAgIGNvbnN0IGhpZGRlbkxhYmVsID0gXy5maW5kKFxuICAgICAgbWFwTW9kZWwuZ2V0KCdsYWJlbHMnKSxcbiAgICAgIChsYWJlbCkgPT5cbiAgICAgICAgbGFiZWwuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXS5nZXRHZW9tZXRyeSgpLmdldENvb3JkaW5hdGVzKClbMF0gPT09XG4gICAgICAgICAgZ2VvbWV0cnlJbnN0YW5jZS5nZXRDb29yZGluYXRlcygpWzBdICYmXG4gICAgICAgIGxhYmVsLmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF0uZ2V0R2VvbWV0cnkoKS5nZXRDb29yZGluYXRlcygpWzFdID09PVxuICAgICAgICAgIGdlb21ldHJ5SW5zdGFuY2UuZ2V0Q29vcmRpbmF0ZXMoKVsxXSAmJlxuICAgICAgICBsYWJlbC5nZXQoJ2lkJykgIT09IGdlb21ldHJ5LmdldCgnaWQnKSAmJlxuICAgICAgICAhbGFiZWwuZ2V0VmlzaWJsZSgpXG4gICAgKVxuICAgIGlmIChoaWRkZW5MYWJlbCkge1xuICAgICAgaGlkZGVuTGFiZWwuc2V0VmlzaWJsZSh0cnVlKVxuICAgIH1cbiAgfVxuICBsZXQgZ2VvRHJhZ0Rvd25MaXN0ZW5lcjogYW55XG4gIGxldCBnZW9EcmFnTW92ZUxpc3RlbmVyOiBhbnlcbiAgbGV0IGdlb0RyYWdVcExpc3RlbmVyOiBhbnlcbiAgbGV0IGxlZnRDbGlja01hcEFQSUxpc3RlbmVyOiBhbnlcbiAgY29uc3QgZXhwb3NlZE1ldGhvZHMgPSB7XG4gICAgb25Nb3VzZVRyYWNraW5nRm9yR2VvRHJhZyh7XG4gICAgICBtb3ZlRnJvbSxcbiAgICAgIGRvd24sXG4gICAgICBtb3ZlLFxuICAgICAgdXAsXG4gICAgfToge1xuICAgICAgbW92ZUZyb20/OiBhbnlcbiAgICAgIGRvd246IGFueVxuICAgICAgbW92ZTogYW55XG4gICAgICB1cDogYW55XG4gICAgfSkge1xuICAgICAgLy8gZGlzYWJsZSBwYW5uaW5nIG9mIHRoZSBtYXBcbiAgICAgIG1hcC5nZXRJbnRlcmFjdGlvbnMoKS5mb3JFYWNoKChpbnRlcmFjdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGlmIChpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIE9wZW5sYXllcnMuaW50ZXJhY3Rpb24uRHJhZ1Bhbikge1xuICAgICAgICAgIGludGVyYWN0aW9uLnNldEFjdGl2ZShmYWxzZSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gZW5hYmxlIGRyYWdnaW5nIGluZGl2aWR1YWwgZmVhdHVyZXNcbiAgICAgIGdlb0RyYWdEb3duTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihldmVudC5waXhlbCwgbWFwKVxuICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG1hcC5nZXRDb29yZGluYXRlRnJvbVBpeGVsKGV2ZW50LnBpeGVsKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHsgbGF0aXR1ZGU6IGNvb3JkaW5hdGVzWzFdLCBsb25naXR1ZGU6IGNvb3JkaW5hdGVzWzBdIH1cbiAgICAgICAgZG93bih7IHBvc2l0aW9uOiBwb3NpdGlvbiwgbWFwTG9jYXRpb25JZDogbG9jYXRpb25JZCB9KVxuICAgICAgfVxuICAgICAgbWFwLm9uKCdwb2ludGVyZG93bicsIGdlb0RyYWdEb3duTGlzdGVuZXIpXG5cbiAgICAgIGdlb0RyYWdNb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihldmVudC5waXhlbCwgbWFwKVxuICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG1hcC5nZXRDb29yZGluYXRlRnJvbVBpeGVsKGV2ZW50LnBpeGVsKVxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG1vdmVGcm9tXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGxhdGl0dWRlOiBjb29yZGluYXRlc1sxXSAtIG1vdmVGcm9tLmxhdGl0dWRlLFxuICAgICAgICAgICAgICBsb25naXR1ZGU6IGNvb3JkaW5hdGVzWzBdIC0gbW92ZUZyb20ubG9uZ2l0dWRlLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogbnVsbFxuICAgICAgICBtb3ZlKHsgdHJhbnNsYXRpb246IHRyYW5zbGF0aW9uLCBtYXBMb2NhdGlvbklkOiBsb2NhdGlvbklkIH0pXG4gICAgICB9XG4gICAgICBtYXAub24oJ3BvaW50ZXJkcmFnJywgZ2VvRHJhZ01vdmVMaXN0ZW5lcilcblxuICAgICAgZ2VvRHJhZ1VwTGlzdGVuZXIgPSB1cFxuICAgICAgbWFwLm9uKCdwb2ludGVydXAnLCBnZW9EcmFnVXBMaXN0ZW5lcilcbiAgICB9LFxuICAgIGNsZWFyTW91c2VUcmFja2luZ0Zvckdlb0RyYWcoKSB7XG4gICAgICAvLyByZS1lbmFibGUgcGFubmluZ1xuICAgICAgbWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goKGludGVyYWN0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGludGVyYWN0aW9uIGluc3RhbmNlb2YgT3BlbmxheWVycy5pbnRlcmFjdGlvbi5EcmFnUGFuKSB7XG4gICAgICAgICAgaW50ZXJhY3Rpb24uc2V0QWN0aXZlKHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBtYXAudW4oJ3BvaW50ZXJkb3duJywgZ2VvRHJhZ0Rvd25MaXN0ZW5lcilcbiAgICAgIG1hcC51bigncG9pbnRlcmRyYWcnLCBnZW9EcmFnTW92ZUxpc3RlbmVyKVxuICAgICAgbWFwLnVuKCdwb2ludGVydXAnLCBnZW9EcmFnVXBMaXN0ZW5lcilcbiAgICB9LFxuICAgIG9uTGVmdENsaWNrTWFwQVBJKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIGxlZnRDbGlja01hcEFQSUxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgeyBsb2NhdGlvbklkIH0gPSBkZXRlcm1pbmVJZHNGcm9tUG9zaXRpb24oZXZlbnQucGl4ZWwsIG1hcClcbiAgICAgICAgY2FsbGJhY2sobG9jYXRpb25JZClcbiAgICAgIH1cbiAgICAgIG1hcC5vbignc2luZ2xlY2xpY2snLCBsZWZ0Q2xpY2tNYXBBUElMaXN0ZW5lcilcbiAgICB9LFxuICAgIGNsZWFyTGVmdENsaWNrTWFwQVBJKCkge1xuICAgICAgbWFwLnVuKCdzaW5nbGVjbGljaycsIGxlZnRDbGlja01hcEFQSUxpc3RlbmVyKVxuICAgIH0sXG4gICAgb25MZWZ0Q2xpY2soY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGNhbGxiYWNrKGUsIHtcbiAgICAgICAgICBtYXBUYXJnZXQ6IGRldGVybWluZUlkRnJvbVBvc2l0aW9uKFxuICAgICAgICAgICAgW2UuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0LCBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wXSxcbiAgICAgICAgICAgIG1hcFxuICAgICAgICAgICksXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgb25SaWdodENsaWNrKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgY2FsbGJhY2soZSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhclJpZ2h0Q2xpY2soKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9mZignY29udGV4dG1lbnUnKVxuICAgIH0sXG4gICAgb25Eb3VibGVDbGljaygpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ2RibGNsaWNrJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLmdldFRhcmdldEVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCB7IGxvY2F0aW9uSWQgfSA9IGRldGVybWluZUlkc0Zyb21Qb3NpdGlvbihcbiAgICAgICAgICBbZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BdLFxuICAgICAgICAgIG1hcFxuICAgICAgICApXG4gICAgICAgIGlmIChsb2NhdGlvbklkKSB7XG4gICAgICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignbG9jYXRpb246ZG91YmxlQ2xpY2snLCBsb2NhdGlvbklkKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJEb3VibGVDbGljaygpIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub2ZmKCdkYmxjbGljaycpXG4gICAgfSxcbiAgICBvbk1vdXNlVHJhY2tpbmdGb3JQb3B1cChcbiAgICAgIGRvd25DYWxsYmFjazogYW55LFxuICAgICAgbW92ZUNhbGxiYWNrOiBhbnksXG4gICAgICB1cENhbGxiYWNrOiBhbnlcbiAgICApIHtcbiAgICAgICQobWFwLmdldFRhcmdldEVsZW1lbnQoKSkub24oJ21vdXNlZG93bicsICgpID0+IHtcbiAgICAgICAgZG93bkNhbGxiYWNrKClcbiAgICAgIH0pXG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9uKCdtb3VzZW1vdmUnLCAoKSA9PiB7XG4gICAgICAgIG1vdmVDYWxsYmFjaygpXG4gICAgICB9KVxuICAgICAgdGhpcy5vbkxlZnRDbGljayh1cENhbGxiYWNrKVxuICAgIH0sXG4gICAgb25Nb3VzZU1vdmUoY2FsbGJhY2s6IGFueSkge1xuICAgICAgJChtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpKS5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gbWFwLmdldFRhcmdldEVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IFtcbiAgICAgICAgICBlLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdCxcbiAgICAgICAgICBlLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wLFxuICAgICAgICBdXG4gICAgICAgIGNvbnN0IHsgbG9jYXRpb25JZCB9ID0gZGV0ZXJtaW5lSWRzRnJvbVBvc2l0aW9uKHBvc2l0aW9uLCBtYXApXG4gICAgICAgIGNhbGxiYWNrKGUsIHtcbiAgICAgICAgICBtYXBUYXJnZXQ6IGRldGVybWluZUlkRnJvbVBvc2l0aW9uKHBvc2l0aW9uLCBtYXApLFxuICAgICAgICAgIG1hcExvY2F0aW9uSWQ6IGxvY2F0aW9uSWQsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xlYXJNb3VzZU1vdmUoKSB7XG4gICAgICAkKG1hcC5nZXRUYXJnZXRFbGVtZW50KCkpLm9mZignbW91c2Vtb3ZlJylcbiAgICB9LFxuICAgIHRpbWVvdXRJZHM6IFtdIGFzIG51bWJlcltdLFxuICAgIG9uQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIHRoaXMudGltZW91dElkcy5mb3JFYWNoKCh0aW1lb3V0SWQ6IGFueSkgPT4ge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICAgIH0pXG4gICAgICB0aGlzLnRpbWVvdXRJZHMgPSBbXVxuICAgICAgbWFwLmFkZEV2ZW50TGlzdGVuZXIoJ21vdmVzdGFydCcsIGNhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZVN0YXJ0KGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgIG1hcC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3Zlc3RhcnQnLCBjYWxsYmFjaylcbiAgICB9LFxuICAgIG9uQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBjb25zdCB0aW1lb3V0Q2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudGltZW91dElkcy5wdXNoKFxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICB9LCAzMDApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIG1hcC5hZGRFdmVudExpc3RlbmVyKCdtb3ZlZW5kJywgdGltZW91dENhbGxiYWNrKVxuICAgIH0sXG4gICAgb2ZmQ2FtZXJhTW92ZUVuZChjYWxsYmFjazogYW55KSB7XG4gICAgICBtYXAucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW92ZWVuZCcsIGNhbGxiYWNrKVxuICAgIH0sXG4gICAgZG9QYW5ab29tKGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdKSB7XG4gICAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgICAgdGhhdC5wYW5ab29tT3V0KHsgZHVyYXRpb246IDEwMDAgfSwgKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGF0Lnpvb21Ub0V4dGVudChjb29yZHMsIHsgZHVyYXRpb246IDIwMDAgfSlcbiAgICAgICAgfSwgMClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwYW5ab29tT3V0KF9vcHRzOiBhbnksIG5leHQ6IGFueSkge1xuICAgICAgbmV4dCgpXG4gICAgfSxcbiAgICBwYW5Ub1Jlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IF8uZmxhdHRlbihcbiAgICAgICAgcmVzdWx0cy5tYXAoKHJlc3VsdDogYW55KSA9PiByZXN1bHQuZ2V0UG9pbnRzKCdsb2NhdGlvbicpKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICAgdGhpcy5wYW5Ub0V4dGVudChjb29yZGluYXRlcylcbiAgICB9LFxuICAgIHBhblRvRXh0ZW50KGNvb3JkczogW251bWJlciwgbnVtYmVyXVtdKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjb29yZHMpICYmIGNvb3Jkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxpbmVPYmplY3QgPSBjb29yZHMubWFwKChjb29yZGluYXRlKSA9PlxuICAgICAgICAgIGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSlcbiAgICAgICAgKVxuICAgICAgICBjb25zdCBleHRlbnQgPSBPcGVubGF5ZXJzLmV4dGVudC5ib3VuZGluZ0V4dGVudChsaW5lT2JqZWN0KVxuICAgICAgICBtYXAuZ2V0VmlldygpLmZpdChleHRlbnQsIHtcbiAgICAgICAgICBzaXplOiBtYXAuZ2V0U2l6ZSgpLFxuICAgICAgICAgIG1heFpvb206IG1hcC5nZXRWaWV3KCkuZ2V0Wm9vbSgpLFxuICAgICAgICAgIGR1cmF0aW9uOiA1MDAsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRFeHRlbnRPZklkcyhpZHM6IHN0cmluZ1tdKSB7XG4gICAgICB2YXIgZXh0ZW50ID0gT3BlbmxheWVycy5leHRlbnQuY3JlYXRlRW1wdHkoKVxuICAgICAgbWFwLmdldExheWVycygpLmZvckVhY2goKGxheWVyOiBhbnkpID0+IHtcbiAgICAgICAgLy8gbWlnaHQgbmVlZCB0byBoYW5kbGUgZ3JvdXBzIGxhdGVyLCBidXQgbm8gcmVhc29uIHRvIHlldFxuICAgICAgICBpZiAoXG4gICAgICAgICAgbGF5ZXIgaW5zdGFuY2VvZiBPcGVubGF5ZXJzLmxheWVyLlZlY3RvciAmJlxuICAgICAgICAgIGlkcy5pbmNsdWRlcyhsYXllci5nZXQoJ2lkJykpXG4gICAgICAgICkge1xuICAgICAgICAgIE9wZW5sYXllcnMuZXh0ZW50LmV4dGVuZChleHRlbnQsIGxheWVyLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGV4dGVudFswXSA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBleHRlbnQgZm91bmQgZm9yIGlkcycpXG4gICAgICB9XG4gICAgICByZXR1cm4gZXh0ZW50XG4gICAgfSxcbiAgICB6b29tVG9JZHMoeyBpZHMsIGR1cmF0aW9uID0gNTAwIH06IHsgaWRzOiBzdHJpbmdbXTsgZHVyYXRpb24/OiBudW1iZXIgfSkge1xuICAgICAgbWFwLmdldFZpZXcoKS5maXQodGhpcy5nZXRFeHRlbnRPZklkcyhpZHMpLCB7XG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgfSlcbiAgICB9LFxuICAgIHBhblRvU2hhcGVzRXh0ZW50KHsgZHVyYXRpb24gPSA1MDAgfTogeyBkdXJhdGlvbj86IG51bWJlciB9ID0ge30pIHtcbiAgICAgIHZhciBleHRlbnQgPSBPcGVubGF5ZXJzLmV4dGVudC5jcmVhdGVFbXB0eSgpXG4gICAgICBtYXAuZ2V0TGF5ZXJzKCkuZm9yRWFjaCgobGF5ZXI6IGFueSkgPT4ge1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBPcGVubGF5ZXJzLmxheWVyLkdyb3VwKSB7XG4gICAgICAgICAgbGF5ZXIuZ2V0TGF5ZXJzKCkuZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXBMYXllcikge1xuICAgICAgICAgICAgLy9JZiB0aGlzIGlzIGEgdmVjdG9yIGxheWVyLCBhZGQgaXQgdG8gb3VyIGV4dGVudFxuICAgICAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2YgT3BlbmxheWVycy5sYXllci5WZWN0b3IpXG4gICAgICAgICAgICAgIE9wZW5sYXllcnMuZXh0ZW50LmV4dGVuZChcbiAgICAgICAgICAgICAgICBleHRlbnQsXG4gICAgICAgICAgICAgICAgKGdyb3VwTGF5ZXIgYXMgYW55KS5nZXRTb3VyY2UoKS5nZXRFeHRlbnQoKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICBsYXllciBpbnN0YW5jZW9mIE9wZW5sYXllcnMubGF5ZXIuVmVjdG9yICYmXG4gICAgICAgICAgbGF5ZXIuZ2V0KCdpZCcpXG4gICAgICAgICkge1xuICAgICAgICAgIE9wZW5sYXllcnMuZXh0ZW50LmV4dGVuZChleHRlbnQsIGxheWVyLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGV4dGVudFswXSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgbWFwLmdldFZpZXcoKS5maXQoZXh0ZW50LCB7XG4gICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRTaGFwZXMoKSB7XG4gICAgICByZXR1cm4gc2hhcGVzXG4gICAgfSxcbiAgICB6b29tVG9FeHRlbnQoY29vcmRzOiBbbnVtYmVyLCBudW1iZXJdW10sIG9wdHMgPSB7fSkge1xuICAgICAgY29uc3QgbGluZU9iamVjdCA9IGNvb3Jkcy5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT5cbiAgICAgICAgY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKVxuICAgICAgKVxuICAgICAgY29uc3QgZXh0ZW50ID0gT3BlbmxheWVycy5leHRlbnQuYm91bmRpbmdFeHRlbnQobGluZU9iamVjdClcbiAgICAgIG1hcC5nZXRWaWV3KCkuZml0KGV4dGVudCwge1xuICAgICAgICBzaXplOiBtYXAuZ2V0U2l6ZSgpLFxuICAgICAgICBtYXhab29tOiBtYXAuZ2V0VmlldygpLmdldFpvb20oKSxcbiAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgLi4ub3B0cyxcbiAgICAgIH0pXG4gICAgfSxcbiAgICB6b29tVG9Cb3VuZGluZ0JveCh7IG5vcnRoLCBlYXN0LCBzb3V0aCwgd2VzdCB9OiBhbnkpIHtcbiAgICAgIHRoaXMuem9vbVRvRXh0ZW50KFtcbiAgICAgICAgW3dlc3QsIHNvdXRoXSxcbiAgICAgICAgW2Vhc3QsIG5vcnRoXSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBsaW1pdCh2YWx1ZTogYW55LCBtaW46IGFueSwgbWF4OiBhbnkpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWx1ZSwgbWluKSwgbWF4KVxuICAgIH0sXG4gICAgZ2V0Qm91bmRpbmdCb3goKSB7XG4gICAgICBjb25zdCBleHRlbnQgPSBtYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudChtYXAuZ2V0U2l6ZSgpKVxuICAgICAgbGV0IGxvbmdpdHVkZUVhc3QgPSB3cmFwTnVtKGV4dGVudFsyXSwgLTE4MCwgMTgwKVxuICAgICAgY29uc3QgbG9uZ2l0dWRlV2VzdCA9IHdyYXBOdW0oZXh0ZW50WzBdLCAtMTgwLCAxODApXG4gICAgICAvL2FkZCAzNjAgZGVncmVlcyB0byBsb25naXR1ZGVFYXN0IHRvIGFjY29tbW9kYXRlIGJvdW5kaW5nIGJveGVzIHRoYXQgc3BhbiBhY3Jvc3MgdGhlIGFudGktbWVyaWRpYW5cbiAgICAgIGlmIChsb25naXR1ZGVFYXN0IDwgbG9uZ2l0dWRlV2VzdCkge1xuICAgICAgICBsb25naXR1ZGVFYXN0ICs9IDM2MFxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9ydGg6IHRoaXMubGltaXQoZXh0ZW50WzNdLCAtOTAsIDkwKSxcbiAgICAgICAgZWFzdDogbG9uZ2l0dWRlRWFzdCxcbiAgICAgICAgc291dGg6IHRoaXMubGltaXQoZXh0ZW50WzFdLCAtOTAsIDkwKSxcbiAgICAgICAgd2VzdDogbG9uZ2l0dWRlV2VzdCxcbiAgICAgIH1cbiAgICB9LFxuICAgIG92ZXJsYXlJbWFnZShtb2RlbDogTGF6eVF1ZXJ5UmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhY2FyZElkID0gbW9kZWwucGxhaW4uaWRcbiAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheShtZXRhY2FyZElkKVxuICAgICAgY29uc3QgY29vcmRzID0gbW9kZWwuZ2V0UG9pbnRzKCdsb2NhdGlvbicpXG4gICAgICBjb25zdCBhcnJheSA9IF8ubWFwKGNvb3JkcywgKGNvb3JkKSA9PiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkKSlcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBuZXcgT3BlbmxheWVycy5nZW9tLlBvbHlnb24oW2FycmF5XSlcbiAgICAgIGNvbnN0IGV4dGVudCA9IHBvbHlnb24uZ2V0RXh0ZW50KClcbiAgICAgIGNvbnN0IHByb2plY3Rpb24gPSBPcGVubGF5ZXJzLnByb2ouZ2V0KFxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gICAgICApXG4gICAgICBjb25zdCBvdmVybGF5TGF5ZXIgPSBuZXcgT3BlbmxheWVycy5sYXllci5JbWFnZSh7XG4gICAgICAgIHNvdXJjZTogbmV3IE9wZW5sYXllcnMuc291cmNlLkltYWdlU3RhdGljKHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3N0cmluZyB8IHVuZGVmaW5lZCcgaXMgbm90IGFzc2lnbmFibGUgdG8gdHlwLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICB1cmw6IG1vZGVsLmN1cnJlbnRPdmVybGF5VXJsLFxuICAgICAgICAgIHByb2plY3Rpb24sXG4gICAgICAgICAgaW1hZ2VFeHRlbnQ6IGV4dGVudCxcbiAgICAgICAgfSksXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKG92ZXJsYXlMYXllcilcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgb3ZlcmxheXNbbWV0YWNhcmRJZF0gPSBvdmVybGF5TGF5ZXJcbiAgICB9LFxuICAgIHJlbW92ZU92ZXJsYXkobWV0YWNhcmRJZDogYW55KSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIGlmIChvdmVybGF5c1ttZXRhY2FyZElkXSkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbWFwLnJlbW92ZUxheWVyKG92ZXJsYXlzW21ldGFjYXJkSWRdKVxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgZGVsZXRlIG92ZXJsYXlzW21ldGFjYXJkSWRdXG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVBbGxPdmVybGF5cygpIHtcbiAgICAgIGZvciAoY29uc3Qgb3ZlcmxheSBpbiBvdmVybGF5cykge1xuICAgICAgICBpZiAob3ZlcmxheXMuaGFzT3duUHJvcGVydHkob3ZlcmxheSkpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICBtYXAucmVtb3ZlTGF5ZXIob3ZlcmxheXNbb3ZlcmxheV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG92ZXJsYXlzID0ge31cbiAgICB9LFxuICAgIGdldENhcnRvZ3JhcGhpY0NlbnRlck9mQ2x1c3RlckluRGVncmVlcyhjbHVzdGVyOiBDbHVzdGVyVHlwZSkge1xuICAgICAgcmV0dXJuIHV0aWxpdHkuY2FsY3VsYXRlQ2FydG9ncmFwaGljQ2VudGVyT2ZHZW9tZXRyaWVzSW5EZWdyZWVzKFxuICAgICAgICBjbHVzdGVyLnJlc3VsdHNcbiAgICAgIClcbiAgICB9LFxuICAgIGdldFdpbmRvd0xvY2F0aW9uc09mUmVzdWx0cyhyZXN1bHRzOiBhbnkpIHtcbiAgICAgIHJldHVybiByZXN1bHRzLm1hcCgocmVzdWx0OiBhbnkpID0+IHtcbiAgICAgICAgY29uc3Qgb3BlbmxheWVyc0NlbnRlck9mR2VvbWV0cnkgPVxuICAgICAgICAgIHV0aWxpdHkuY2FsY3VsYXRlT3BlbmxheWVyc0NlbnRlck9mR2VvbWV0cnkocmVzdWx0KVxuICAgICAgICBjb25zdCBjZW50ZXIgPSBtYXAuZ2V0UGl4ZWxGcm9tQ29vcmRpbmF0ZShvcGVubGF5ZXJzQ2VudGVyT2ZHZW9tZXRyeSlcbiAgICAgICAgaWYgKGNlbnRlcikge1xuICAgICAgICAgIHJldHVybiBjZW50ZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcbiAgICAvKlxuICAgICAqIENhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlIChpbiBtZXRlcnMpIGJldHdlZW4gdGhlIHR3byBwb3NpdGlvbnMgaW4gdGhlIGdpdmVuIGFycmF5IG9mXG4gICAgICogQ29vcmRpbmF0ZXMuXG4gICAgICovXG4gICAgY2FsY3VsYXRlRGlzdGFuY2VCZXR3ZWVuUG9zaXRpb25zKGNvb3JkczogYW55KSB7XG4gICAgICBjb25zdCBsaW5lID0gbmV3IE9wZW5sYXllcnMuZ2VvbS5MaW5lU3RyaW5nKGNvb3JkcylcbiAgICAgIGNvbnN0IHNwaGVyZUxlbmd0aCA9IE9wZW5sYXllcnMuU3BoZXJlLmdldExlbmd0aChsaW5lKVxuICAgICAgcmV0dXJuIHNwaGVyZUxlbmd0aFxuICAgIH0sXG4gICAgLypcbiAgICAgKiBEcmF3cyBhIG1hcmtlciBvbiB0aGUgbWFwIGRlc2lnbmF0aW5nIGEgc3RhcnQvZW5kIHBvaW50IGZvciB0aGUgcnVsZXIgbWVhc3VyZW1lbnQuIFRoZSBnaXZlblxuICAgICAqIGNvb3JkaW5hdGVzIHNob3VsZCBiZSBhbiBvYmplY3Qgd2l0aCAnbGF0JyBhbmQgJ2xvbicga2V5cyB3aXRoIGRlZ3JlZXMgdmFsdWVzLiBUaGUgZ2l2ZW5cbiAgICAgKiBtYXJrZXIgbGFiZWwgc2hvdWxkIGJlIGEgc2luZ2xlIGNoYXJhY3RlciBvciBkaWdpdCB0aGF0IGlzIGRpc3BsYXllZCBvbiB0aGUgbWFwIG1hcmtlci5cbiAgICAgKi9cbiAgICBhZGRSdWxlclBvaW50KGNvb3JkaW5hdGVzOiBhbnksIG1hcmtlckxhYmVsOiBhbnkpIHtcbiAgICAgIGNvbnN0IHsgbGF0LCBsb24gfSA9IGNvb3JkaW5hdGVzXG4gICAgICBjb25zdCBwb2ludCA9IFtsb24sIGxhdF1cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGlkOiBtYXJrZXJMYWJlbCxcbiAgICAgICAgY29sb3I6IHJ1bGVyQ29sb3IsXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5hZGRQb2ludChwb2ludCwgb3B0aW9ucylcbiAgICB9LFxuICAgIC8qXG4gICAgICogUmVtb3ZlcyB0aGUgZ2l2ZW4gcG9pbnQgTGF5ZXIgZnJvbSB0aGUgbWFwLlxuICAgICAqL1xuICAgIHJlbW92ZVJ1bGVyUG9pbnQocG9pbnRMYXllcjogYW55KSB7XG4gICAgICBtYXAucmVtb3ZlTGF5ZXIocG9pbnRMYXllcilcbiAgICB9LFxuICAgIHJ1bGVyTGluZTogbnVsbCBhcyBudWxsIHwgT3BlbmxheWVycy5sYXllci5WZWN0b3IsXG4gICAgLypcbiAgICAgKiBEcmF3cyBhIGxpbmUgb24gdGhlIG1hcCBiZXR3ZWVuIHRoZSBwb2ludHMgaW4gdGhlIGdpdmVuIGFycmF5IG9mIHBvaW50IFZlY3RvcnMuXG4gICAgICovXG4gICAgYWRkUnVsZXJMaW5lKHBvaW50OiBhbnkpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGlkOiAncnVsZXItbGluZScsXG4gICAgICAgIHRpdGxlOiAnTGluZSBmb3IgcnVsZXIgbWVhc3VyZW1lbnQnLFxuICAgICAgICBjb2xvcjogJyM1MDZGODUnLFxuICAgICAgfVxuICAgICAgY29uc3Qgc3RhcnRpbmdDb29yZGluYXRlcyA9IG1hcE1vZGVsLmdldCgnc3RhcnRpbmdDb29yZGluYXRlcycpXG4gICAgICBjb25zdCBsaW5lUG9pbnRzID0gW1xuICAgICAgICBbc3RhcnRpbmdDb29yZGluYXRlc1snbG9uJ10sIHN0YXJ0aW5nQ29vcmRpbmF0ZXNbJ2xhdCddXSxcbiAgICAgICAgW3BvaW50Wydsb24nXSwgcG9pbnRbJ2xhdCddXSxcbiAgICAgIF1cbiAgICAgIHRoaXMucnVsZXJMaW5lID0gdGhpcy5hZGRMaW5lKGxpbmVQb2ludHMsIG9wdGlvbnMpXG4gICAgICByZXR1cm4gdGhpcy5ydWxlckxpbmVcbiAgICB9LFxuICAgIC8qXG4gICAgICogVXBkYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgcnVsZXIgbGluZVxuICAgICAqL1xuICAgIHNldFJ1bGVyTGluZShwb2ludDogYW55KSB7XG4gICAgICB0aGlzLnJlbW92ZVJ1bGVyTGluZSgpXG4gICAgICB0aGlzLmFkZFJ1bGVyTGluZShwb2ludClcbiAgICB9LFxuICAgIC8qXG4gICAgICogUmVtb3ZlcyB0aGUgZ2l2ZW4gbGluZSBMYXllciBmcm9tIHRoZSBtYXAuXG4gICAgICovXG4gICAgcmVtb3ZlUnVsZXJMaW5lKCkge1xuICAgICAgbWFwLnJlbW92ZUxheWVyKHRoaXMucnVsZXJMaW5lKVxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgIEFkZHMgYSBiaWxsYm9hcmQgcG9pbnQgdXRpbGl6aW5nIHRoZSBwYXNzZWQgaW4gcG9pbnQgYW5kIG9wdGlvbnMuXG4gICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAqL1xuICAgIGFkZFBvaW50V2l0aFRleHQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBmZWF0dXJlID0gbmV3IE9wZW5sYXllcnMuRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgT3BlbmxheWVycy5nZW9tLlBvaW50KHBvaW50T2JqZWN0KSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBiYWRnZU9mZnNldCA9IG9wdGlvbnMuYmFkZ2VPcHRpb25zID8gOCA6IDBcbiAgICAgIGNvbnN0IGltZ1dpZHRoID0gNDQgKyBiYWRnZU9mZnNldFxuICAgICAgY29uc3QgaW1nSGVpZ2h0ID0gNDQgKyBiYWRnZU9mZnNldFxuXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICA7KGZlYXR1cmUgYXMgYW55KS51bnNlbGVjdGVkU3R5bGUgPSBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHlsZSh7XG4gICAgICAgIGltYWdlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5JY29uKHtcbiAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgICAgIGZpbGxDb2xvcjogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBpbWdTaXplOiBbaW1nV2lkdGgsIGltZ0hlaWdodF0sXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgIDsoZmVhdHVyZSBhcyBhbnkpLnBhcnRpYWxseVNlbGVjdGVkU3R5bGUgPSBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHlsZSh7XG4gICAgICAgIGltYWdlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5JY29uKHtcbiAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldENpcmNsZVdpdGhUZXh0KHtcbiAgICAgICAgICAgIGZpbGxDb2xvcjogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGltZ1NpemU6IFtpbWdXaWR0aCwgaW1nSGVpZ2h0XSxcbiAgICAgICAgfSksXG4gICAgICB9KVxuICAgICAgOyhmZWF0dXJlIGFzIGFueSkuc2VsZWN0ZWRTdHlsZSA9IG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgaW1hZ2U6IG5ldyBPcGVubGF5ZXJzLnN0eWxlLkljb24oe1xuICAgICAgICAgIGltZzogRHJhd2luZ1V0aWxpdHkuZ2V0Q2lyY2xlV2l0aFRleHQoe1xuICAgICAgICAgICAgZmlsbENvbG9yOiAnb3JhbmdlJyxcbiAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMuaWQubGVuZ3RoLFxuICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICBiYWRnZU9wdGlvbnM6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGltZ1NpemU6IFtpbWdXaWR0aCwgaW1nSGVpZ2h0XSxcbiAgICAgICAgfSksXG4gICAgICB9KVxuICAgICAgc3dpdGNoIChvcHRpb25zLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoKGZlYXR1cmUgYXMgYW55KS5zZWxlY3RlZFN0eWxlKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3BhcnRpYWxseSc6XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZSgoZmVhdHVyZSBhcyBhbnkpLnBhcnRpYWxseVNlbGVjdGVkU3R5bGUpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAndW5zZWxlY3RlZCc6XG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZSgoZmVhdHVyZSBhcyBhbnkpLnVuc2VsZWN0ZWRTdHlsZSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IE9wZW5sYXllcnMuc291cmNlLlZlY3Rvcih7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgY29uc3QgdmVjdG9yTGF5ZXIgPSBuZXcgT3BlbmxheWVycy5sYXllci5WZWN0b3Ioe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgICAgekluZGV4OiAxLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIGJpbGxib2FyZCBwb2ludCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2ludCBhbmQgb3B0aW9ucy5cbiAgICAgICAgICAgICAgT3B0aW9ucyBhcmUgYSB2aWV3IHRvIHJlbGF0ZSB0bywgYW5kIGFuIGlkLCBhbmQgYSBjb2xvci5cbiAgICAgICAgICAgICovXG4gICAgYWRkUG9pbnQocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBmZWF0dXJlID0gbmV3IE9wZW5sYXllcnMuRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgT3BlbmxheWVycy5nZW9tLlBvaW50KHBvaW50T2JqZWN0KSxcbiAgICAgICAgbmFtZTogb3B0aW9ucy50aXRsZSxcbiAgICAgIH0pXG4gICAgICBmZWF0dXJlLnNldElkKG9wdGlvbnMuaWQpXG4gICAgICBjb25zdCBiYWRnZU9mZnNldCA9IG9wdGlvbnMuYmFkZ2VPcHRpb25zID8gOCA6IDBcbiAgICAgIGxldCB4ID0gMzkgKyBiYWRnZU9mZnNldCxcbiAgICAgICAgeSA9IDQwICsgYmFkZ2VPZmZzZXRcbiAgICAgIGlmIChvcHRpb25zLnNpemUpIHtcbiAgICAgICAgeCA9IG9wdGlvbnMuc2l6ZS54XG4gICAgICAgIHkgPSBvcHRpb25zLnNpemUueVxuICAgICAgfVxuICAgICAgOyhmZWF0dXJlIGFzIGFueSkudW5zZWxlY3RlZFN0eWxlID0gbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICBpbWFnZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuSWNvbih7XG4gICAgICAgICAgaW1nOiBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBpbWdTaXplOiBbeCwgeV0sXG4gICAgICAgICAgYW5jaG9yOiBbeCAvIDIgLSBiYWRnZU9mZnNldCAvIDIsIDBdLFxuICAgICAgICAgIGFuY2hvck9yaWdpbjogJ2JvdHRvbS1sZWZ0JyxcbiAgICAgICAgICBhbmNob3JYVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgIGFuY2hvcllVbml0czogJ3BpeGVscycsXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgIDsoZmVhdHVyZSBhcyBhbnkpLnNlbGVjdGVkU3R5bGUgPSBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHlsZSh7XG4gICAgICAgIGltYWdlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5JY29uKHtcbiAgICAgICAgICBpbWc6IERyYXdpbmdVdGlsaXR5LmdldFBpbih7XG4gICAgICAgICAgICBmaWxsQ29sb3I6ICdvcmFuZ2UnLFxuICAgICAgICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgICAgICAgYmFkZ2VPcHRpb25zOiBvcHRpb25zLmJhZGdlT3B0aW9ucyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBpbWdTaXplOiBbeCwgeV0sXG4gICAgICAgICAgYW5jaG9yOiBbeCAvIDIgLSBiYWRnZU9mZnNldCAvIDIsIDBdLFxuICAgICAgICAgIGFuY2hvck9yaWdpbjogJ2JvdHRvbS1sZWZ0JyxcbiAgICAgICAgICBhbmNob3JYVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgIGFuY2hvcllVbml0czogJ3BpeGVscycsXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgIG9wdGlvbnMuaXNTZWxlY3RlZFxuICAgICAgICAgID8gKGZlYXR1cmUgYXMgYW55KS5zZWxlY3RlZFN0eWxlXG4gICAgICAgICAgOiAoZmVhdHVyZSBhcyBhbnkpLnVuc2VsZWN0ZWRTdHlsZVxuICAgICAgKVxuICAgICAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IE9wZW5sYXllcnMuc291cmNlLlZlY3Rvcih7XG4gICAgICAgIGZlYXR1cmVzOiBbZmVhdHVyZV0sXG4gICAgICB9KVxuICAgICAgY29uc3QgdmVjdG9yTGF5ZXIgPSBuZXcgT3BlbmxheWVycy5sYXllci5WZWN0b3Ioe1xuICAgICAgICBzb3VyY2U6IHZlY3RvclNvdXJjZSxcbiAgICAgICAgekluZGV4OiAxLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIGxhYmVsIHV0aWxpemluZyB0aGUgcGFzc2VkIGluIHBvaW50IGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhbiBpZCBhbmQgdGV4dC5cbiAgICAgICAgICAgICovXG4gICAgYWRkTGFiZWwocG9pbnQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBwb2ludE9iamVjdCA9IGNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQpXG4gICAgICBjb25zdCBmZWF0dXJlID0gbmV3IE9wZW5sYXllcnMuRmVhdHVyZSh7XG4gICAgICAgIGdlb21ldHJ5OiBuZXcgT3BlbmxheWVycy5nZW9tLlBvaW50KHBvaW50T2JqZWN0KSxcbiAgICAgICAgbmFtZTogb3B0aW9ucy50ZXh0LFxuICAgICAgICBpc0xhYmVsOiB0cnVlLFxuICAgICAgfSlcbiAgICAgIGZlYXR1cmUuc2V0SWQob3B0aW9ucy5pZClcbiAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgIG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgICB0ZXh0OiBuZXcgT3BlbmxheWVycy5zdHlsZS5UZXh0KHtcbiAgICAgICAgICAgIHRleHQ6IG9wdGlvbnMudGV4dCxcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyB0ZXh0OiBhbnk7IG92ZXJmbG93OiBib29sZWFuOyAuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgb3ZlcmZsb3c6IHRydWUsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBjb25zdCB2ZWN0b3JTb3VyY2UgPSBuZXcgT3BlbmxheWVycy5zb3VyY2UuVmVjdG9yKHtcbiAgICAgICAgZmVhdHVyZXM6IFtmZWF0dXJlXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCB2ZWN0b3JMYXllciA9IG5ldyBPcGVubGF5ZXJzLmxheWVyLlZlY3Rvcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgICB6SW5kZXg6IDEsXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAneyBzb3VyY2U6IE9wZW5sYXllcnMuc291cmNlLlZlY3QuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBpZDogb3B0aW9ucy5pZCxcbiAgICAgICAgaXNTZWxlY3RlZDogZmFsc2UsXG4gICAgICB9KVxuICAgICAgbWFwLmFkZExheWVyKHZlY3RvckxheWVyKVxuICAgICAgbWFwTW9kZWwuYWRkTGFiZWwodmVjdG9yTGF5ZXIpXG4gICAgICByZXR1cm4gdmVjdG9yTGF5ZXJcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIEFkZHMgYSBwb2x5bGluZSB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBsaW5lIGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQsIGFuZCBhIGNvbG9yLlxuICAgICAgICAgICAgKi9cbiAgICBhZGRMaW5lKGxpbmU6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBjb25zdCBsaW5lT2JqZWN0ID0gbGluZS5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT5cbiAgICAgICAgY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKVxuICAgICAgKVxuICAgICAgY29uc3QgZmVhdHVyZSA9IG5ldyBPcGVubGF5ZXJzLkZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IE9wZW5sYXllcnMuZ2VvbS5MaW5lU3RyaW5nKGxpbmVPYmplY3QpLFxuICAgICAgICBuYW1lOiBvcHRpb25zLnRpdGxlLFxuICAgICAgfSlcbiAgICAgIGZlYXR1cmUuc2V0SWQob3B0aW9ucy5pZClcbiAgICAgIGNvbnN0IGNvbW1vblN0eWxlID0gbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICBzdHJva2U6IG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0cm9rZSh7XG4gICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29sb3IgfHwgZGVmYXVsdENvbG9yLFxuICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICA7KGZlYXR1cmUgYXMgYW55KS51bnNlbGVjdGVkU3R5bGUgPSBbXG4gICAgICAgIG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgICBzdHJva2U6IG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0cm9rZSh7XG4gICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KSxcbiAgICAgICAgY29tbW9uU3R5bGUsXG4gICAgICBdXG4gICAgICA7KGZlYXR1cmUgYXMgYW55KS5zZWxlY3RlZFN0eWxlID0gW1xuICAgICAgICBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHlsZSh7XG4gICAgICAgICAgc3Ryb2tlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHJva2Uoe1xuICAgICAgICAgICAgY29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICAgIGNvbW1vblN0eWxlLFxuICAgICAgXVxuICAgICAgZmVhdHVyZS5zZXRTdHlsZShcbiAgICAgICAgb3B0aW9ucy5pc1NlbGVjdGVkXG4gICAgICAgICAgPyAoZmVhdHVyZSBhcyBhbnkpLnNlbGVjdGVkU3R5bGVcbiAgICAgICAgICA6IChmZWF0dXJlIGFzIGFueSkudW5zZWxlY3RlZFN0eWxlXG4gICAgICApXG4gICAgICBjb25zdCB2ZWN0b3JTb3VyY2UgPSBuZXcgT3BlbmxheWVycy5zb3VyY2UuVmVjdG9yKHtcbiAgICAgICAgZmVhdHVyZXM6IFtmZWF0dXJlXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCB2ZWN0b3JMYXllciA9IG5ldyBPcGVubGF5ZXJzLmxheWVyLlZlY3Rvcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgLypcbiAgICAgICAgICAgICAgQWRkcyBhIHBvbHlnb24gZmlsbCB1dGlsaXppbmcgdGhlIHBhc3NlZCBpbiBwb2x5Z29uIGFuZCBvcHRpb25zLlxuICAgICAgICAgICAgICBPcHRpb25zIGFyZSBhIHZpZXcgdG8gcmVsYXRlIHRvLCBhbmQgYW4gaWQuXG4gICAgICAgICAgICAqL1xuICAgIGFkZFBvbHlnb24oKSB7fSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gcmVmbGVjdCB3aGV0aGVyIG9yIG5vdCBpdCBpcyBzZWxlY3RlZC5cbiAgICAgICAgICAgICBPcHRpb25zIHBhc3NlZCBpbiBhcmUgY29sb3IgYW5kIGlzU2VsZWN0ZWQuXG4gICAgICAgICAgICAgKi9cbiAgICB1cGRhdGVDbHVzdGVyKGdlb21ldHJ5OiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZ2VvbWV0cnkpKSB7XG4gICAgICAgIGdlb21ldHJ5LmZvckVhY2goKGlubmVyR2VvbWV0cnkpID0+IHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUNsdXN0ZXIoaW5uZXJHZW9tZXRyeSwgb3B0aW9ucylcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZW9tZXRyeS5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdXG4gICAgICAgIGNvbnN0IGdlb21ldHJ5SW5zdGFuY2UgPSBmZWF0dXJlLmdldEdlb21ldHJ5KClcbiAgICAgICAgaWYgKGdlb21ldHJ5SW5zdGFuY2UuY29uc3RydWN0b3IgPT09IE9wZW5sYXllcnMuZ2VvbS5Qb2ludCkge1xuICAgICAgICAgIGdlb21ldHJ5LnNldFpJbmRleChvcHRpb25zLmlzU2VsZWN0ZWQgPyAyIDogMSlcbiAgICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKGZlYXR1cmUuc2VsZWN0ZWRTdHlsZSlcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRpYWxseSc6XG4gICAgICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS5wYXJ0aWFsbHlTZWxlY3RlZFN0eWxlKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAndW5zZWxlY3RlZCc6XG4gICAgICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoZmVhdHVyZS51bnNlbGVjdGVkU3R5bGUpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIGdlb21ldHJ5SW5zdGFuY2UuY29uc3RydWN0b3IgPT09IE9wZW5sYXllcnMuZ2VvbS5MaW5lU3RyaW5nXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IFtcbiAgICAgICAgICAgIG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgICAgICAgc3Ryb2tlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHJva2Uoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwgLjEpJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgICAgICAgc3Ryb2tlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHJva2Uoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLDAsMCwgLjEpJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdXG4gICAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShzdHlsZXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gcmVmbGVjdCB3aGV0aGVyIG9yIG5vdCBpdCBpcyBzZWxlY3RlZC5cbiAgICAgICAgICAgICAgT3B0aW9ucyBwYXNzZWQgaW4gYXJlIGNvbG9yIGFuZCBpc1NlbGVjdGVkLlxuICAgICAgICAgICAgKi9cbiAgICB1cGRhdGVHZW9tZXRyeShnZW9tZXRyeTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGdlb21ldHJ5KSkge1xuICAgICAgICBnZW9tZXRyeS5mb3JFYWNoKChpbm5lckdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVHZW9tZXRyeShpbm5lckdlb21ldHJ5LCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdlb21ldHJ5LmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKClbMF1cbiAgICAgICAgY29uc3QgZ2VvbWV0cnlJbnN0YW5jZSA9IGZlYXR1cmUuZ2V0R2VvbWV0cnkoKVxuICAgICAgICBpZiAoZ2VvbWV0cnlJbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gT3BlbmxheWVycy5nZW9tLlBvaW50KSB7XG4gICAgICAgICAgZ2VvbWV0cnkuc2V0WkluZGV4KG9wdGlvbnMuaXNTZWxlY3RlZCA/IDIgOiAxKVxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgICAgICBvcHRpb25zLmlzU2VsZWN0ZWQgPyBmZWF0dXJlLnNlbGVjdGVkU3R5bGUgOiBmZWF0dXJlLnVuc2VsZWN0ZWRTdHlsZVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICBnZW9tZXRyeUluc3RhbmNlLmNvbnN0cnVjdG9yID09PSBPcGVubGF5ZXJzLmdlb20uTGluZVN0cmluZ1xuICAgICAgICApIHtcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICAgICAgb3B0aW9ucy5pc1NlbGVjdGVkID8gZmVhdHVyZS5zZWxlY3RlZFN0eWxlIDogZmVhdHVyZS51bnNlbGVjdGVkU3R5bGVcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldEdlb21ldHJ5U3R5bGUoZ2VvbWV0cnk6IGFueSwgb3B0aW9uczogYW55LCBmZWF0dXJlOiBhbnkpIHtcbiAgICAgIGNvbnN0IGdlb21ldHJ5SW5zdGFuY2UgPSBmZWF0dXJlLmdldEdlb21ldHJ5KClcbiAgICAgIGlmIChnZW9tZXRyeUluc3RhbmNlLmdldFR5cGUoKSA9PT0gJ1BvaW50Jykge1xuICAgICAgICBsZXQgcG9pbnRXaWR0aCA9IDM5XG4gICAgICAgIGxldCBwb2ludEhlaWdodCA9IDQwXG4gICAgICAgIGlmIChvcHRpb25zLnNpemUpIHtcbiAgICAgICAgICBwb2ludFdpZHRoID0gb3B0aW9ucy5zaXplLnhcbiAgICAgICAgICBwb2ludEhlaWdodCA9IG9wdGlvbnMuc2l6ZS55XG4gICAgICAgIH1cbiAgICAgICAgZ2VvbWV0cnkuc2V0WkluZGV4KG9wdGlvbnMuaXNTZWxlY3RlZCA/IDIgOiAxKVxuICAgICAgICBpZiAoIWZlYXR1cmUuZ2V0UHJvcGVydGllcygpLmlzTGFiZWwpIHtcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKFxuICAgICAgICAgICAgbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICAgICAgICBpbWFnZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuSWNvbih7XG4gICAgICAgICAgICAgICAgaW1nOiBEcmF3aW5nVXRpbGl0eS5nZXRQaW4oe1xuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiBvcHRpb25zLmlzU2VsZWN0ZWQgPyAnb3JhbmdlJyA6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICAgIGljb246IG9wdGlvbnMuaWNvbixcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBpbWdTaXplOiBbcG9pbnRXaWR0aCwgcG9pbnRIZWlnaHRdLFxuICAgICAgICAgICAgICAgIGFuY2hvcjogW3BvaW50V2lkdGggLyAyLCAwXSxcbiAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46ICdib3R0b20tbGVmdCcsXG4gICAgICAgICAgICAgICAgYW5jaG9yWFVuaXRzOiAncGl4ZWxzJyxcbiAgICAgICAgICAgICAgICBhbmNob3JZVW5pdHM6ICdwaXhlbHMnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoXG4gICAgICAgICAgICBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHlsZSh7XG4gICAgICAgICAgICAgIHRleHQ6IHRoaXMuY3JlYXRlVGV4dFN0eWxlKFxuICAgICAgICAgICAgICAgIGZlYXR1cmUsXG4gICAgICAgICAgICAgICAgbWFwLmdldFZpZXcoKS5nZXRSZXNvbHV0aW9uKClcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICAgIGdlb21ldHJ5LnNldCgnaXNTZWxlY3RlZCcsIG9wdGlvbnMuaXNTZWxlY3RlZClcbiAgICAgICAgICBzaG93SGlkZUxhYmVsKHtcbiAgICAgICAgICAgIGdlb21ldHJ5LFxuICAgICAgICAgICAgZmVhdHVyZSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5SW5zdGFuY2UuZ2V0VHlwZSgpID09PSAnTGluZVN0cmluZycpIHtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICAgIG5ldyBPcGVubGF5ZXJzLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgICAgIHN0cm9rZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuU3Ryb2tlKHtcbiAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICAgICAgc3Ryb2tlOiBuZXcgT3BlbmxheWVycy5zdHlsZS5TdHJva2Uoe1xuICAgICAgICAgICAgICBjb2xvcjogb3B0aW9ucy5jb2xvciB8fCBkZWZhdWx0Q29sb3IsXG4gICAgICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSksXG4gICAgICAgIF1cbiAgICAgICAgZmVhdHVyZS5zZXRTdHlsZShzdHlsZXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBjcmVhdGVUZXh0U3R5bGUoZmVhdHVyZTogYW55LCByZXNvbHV0aW9uOiBhbnkpIHtcbiAgICAgIGNvbnN0IGZpbGxDb2xvciA9ICcjMDAwMDAwJ1xuICAgICAgY29uc3Qgb3V0bGluZUNvbG9yID0gJyNmZmZmZmYnXG4gICAgICBjb25zdCBvdXRsaW5lV2lkdGggPSAzXG4gICAgICByZXR1cm4gbmV3IE9wZW5sYXllcnMuc3R5bGUuVGV4dCh7XG4gICAgICAgIHRleHQ6IHRoaXMuZ2V0VGV4dChmZWF0dXJlLCByZXNvbHV0aW9uKSxcbiAgICAgICAgZmlsbDogbmV3IE9wZW5sYXllcnMuc3R5bGUuRmlsbCh7IGNvbG9yOiBmaWxsQ29sb3IgfSksXG4gICAgICAgIHN0cm9rZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuU3Ryb2tlKHtcbiAgICAgICAgICBjb2xvcjogb3V0bGluZUNvbG9yLFxuICAgICAgICAgIHdpZHRoOiBvdXRsaW5lV2lkdGgsXG4gICAgICAgIH0pLFxuICAgICAgICBvZmZzZXRYOiAyMCxcbiAgICAgICAgb2Zmc2V0WTogLTE1LFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3sgdGV4dDogYW55OyBmaWxsOiBPcGVubGF5ZXJzLnN0Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgcGxhY2VtZW50OiAncG9pbnQnLFxuICAgICAgICBtYXhBbmdsZTogNDUsXG4gICAgICAgIG92ZXJmbG93OiB0cnVlLFxuICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgIHBhZGRpbmc6IFs1LCA1LCA1LCA1XSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRUZXh0KGZlYXR1cmU6IGFueSwgcmVzb2x1dGlvbjogYW55KSB7XG4gICAgICBjb25zdCBtYXhSZXNvbHV0aW9uID0gMTIwMFxuICAgICAgY29uc3QgdGV4dCA9XG4gICAgICAgIHJlc29sdXRpb24gPiBtYXhSZXNvbHV0aW9uID8gJycgOiB0aGlzLnRydW5jKGZlYXR1cmUuZ2V0KCduYW1lJyksIDIwKVxuICAgICAgcmV0dXJuIHRleHRcbiAgICB9LFxuICAgIHRydW5jKHN0cjogYW55LCBuOiBhbnkpIHtcbiAgICAgIHJldHVybiBzdHIubGVuZ3RoID4gbiA/IHN0ci5zdWJzdHIoMCwgbiAtIDEpICsgJy4uLicgOiBzdHIuc3Vic3RyKDApXG4gICAgfSxcbiAgICAvKlxuICAgICAgICAgICAgIFVwZGF0ZXMgYSBwYXNzZWQgaW4gZ2VvbWV0cnkgdG8gYmUgaGlkZGVuXG4gICAgICAgICAgICAgKi9cbiAgICBoaWRlR2VvbWV0cnkoZ2VvbWV0cnk6IGFueSkge1xuICAgICAgZ2VvbWV0cnkuc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9LFxuICAgIC8qXG4gICAgICAgICAgICAgVXBkYXRlcyBhIHBhc3NlZCBpbiBnZW9tZXRyeSB0byBiZSBzaG93blxuICAgICAgICAgICAgICovXG4gICAgc2hvd0dlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZW9tZXRyeS5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdXG4gICAgICBpZiAoZmVhdHVyZS5nZXRQcm9wZXJ0aWVzKCkuaXNMYWJlbCkge1xuICAgICAgICBzaG93SGlkZUxhYmVsKHtcbiAgICAgICAgICBnZW9tZXRyeSxcbiAgICAgICAgICBmZWF0dXJlLFxuICAgICAgICAgIGZpbmRTZWxlY3RlZDogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlb21ldHJ5LnNldFZpc2libGUodHJ1ZSlcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZUdlb21ldHJ5KGdlb21ldHJ5OiBhbnkpIHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZW9tZXRyeS5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdXG4gICAgICBpZiAoZmVhdHVyZS5nZXRQcm9wZXJ0aWVzKCkuaXNMYWJlbCkge1xuICAgICAgICBtYXBNb2RlbC5yZW1vdmVMYWJlbChnZW9tZXRyeSlcbiAgICAgICAgc2hvd0hpZGRlbkxhYmVsKGdlb21ldHJ5KVxuICAgICAgfVxuICAgICAgbWFwLnJlbW92ZUxheWVyKGdlb21ldHJ5KVxuICAgIH0sXG4gICAgc2hvd011bHRpTGluZVNoYXBlKGxvY2F0aW9uTW9kZWw6IGFueSkge1xuICAgICAgbGV0IGxpbmVPYmplY3QgPSBsb2NhdGlvbk1vZGVsLmdldCgnbXVsdGlsaW5lJylcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMyKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICd1bmRlZmluZWQnLlxuICAgICAgaWYgKHZhbGlkYXRlR2VvKCdtdWx0aWxpbmUnLCBKU09OLnN0cmluZ2lmeShsaW5lT2JqZWN0KSkuZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBsaW5lT2JqZWN0ID0gbGluZU9iamVjdC5tYXAoKGxpbmU6IGFueSkgPT5cbiAgICAgICAgbGluZS5tYXAoKGNvb3JkczogYW55KSA9PiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKGNvb3JkcykpXG4gICAgICApXG4gICAgICBsZXQgZmVhdHVyZSA9IG5ldyBPcGVubGF5ZXJzLkZlYXR1cmUoe1xuICAgICAgICBnZW9tZXRyeTogbmV3IE9wZW5sYXllcnMuZ2VvbS5NdWx0aUxpbmVTdHJpbmcobGluZU9iamVjdCksXG4gICAgICB9KVxuICAgICAgZmVhdHVyZS5zZXRJZChsb2NhdGlvbk1vZGVsLmNpZClcbiAgICAgIGNvbnN0IHN0eWxlcyA9IFtcbiAgICAgICAgbmV3IE9wZW5sYXllcnMuc3R5bGUuU3R5bGUoe1xuICAgICAgICAgIHN0cm9rZTogbmV3IE9wZW5sYXllcnMuc3R5bGUuU3Ryb2tlKHtcbiAgICAgICAgICAgIGNvbG9yOiBsb2NhdGlvbk1vZGVsLmdldCgnY29sb3InKSB8fCBkZWZhdWx0Q29sb3IsXG4gICAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICBdXG4gICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlcylcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVZlY3RvckxheWVyKGxvY2F0aW9uTW9kZWwsIGZlYXR1cmUpXG4gICAgfSxcbiAgICBjcmVhdGVWZWN0b3JMYXllcihsb2NhdGlvbk1vZGVsOiBhbnksIGZlYXR1cmU6IGFueSkge1xuICAgICAgbGV0IHZlY3RvclNvdXJjZSA9IG5ldyBPcGVubGF5ZXJzLnNvdXJjZS5WZWN0b3Ioe1xuICAgICAgICBmZWF0dXJlczogW2ZlYXR1cmVdLFxuICAgICAgfSlcbiAgICAgIGxldCB2ZWN0b3JMYXllciA9IG5ldyBPcGVubGF5ZXJzLmxheWVyLlZlY3Rvcih7XG4gICAgICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICAgICAgfSlcbiAgICAgIG1hcC5hZGRMYXllcih2ZWN0b3JMYXllcilcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgb3ZlcmxheXNbbG9jYXRpb25Nb2RlbC5jaWRdID0gdmVjdG9yTGF5ZXJcbiAgICAgIHJldHVybiB2ZWN0b3JMYXllclxuICAgIH0sXG4gICAgZGVzdHJveVNoYXBlKGNpZDogYW55KSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBjb25zdCBzaGFwZUluZGV4ID0gc2hhcGVzLmZpbmRJbmRleCgoc2hhcGUpID0+IGNpZCA9PT0gc2hhcGUubW9kZWwuY2lkKVxuICAgICAgaWYgKHNoYXBlSW5kZXggPj0gMCkge1xuICAgICAgICBzaGFwZXNbc2hhcGVJbmRleF0uZGVzdHJveSgpXG4gICAgICAgIHNoYXBlcy5zcGxpY2Uoc2hhcGVJbmRleCwgMSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlc3Ryb3lTaGFwZXMoKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwNikgRklYTUU6IFBhcmFtZXRlciAnc2hhcGUnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG4gICAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcbiAgICAgICAgc2hhcGUuZGVzdHJveSgpXG4gICAgICB9KVxuICAgICAgc2hhcGVzID0gW11cbiAgICB9LFxuICAgIGdldE1hcCgpIHtcbiAgICAgIHJldHVybiBtYXBcbiAgICB9LFxuICAgIHpvb21JbigpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSBtYXAuZ2V0VmlldygpXG4gICAgICBjb25zdCB6b29tID0gdmlldy5nZXRab29tKClcbiAgICAgIHZpZXcuc2V0Wm9vbSh6b29tICsgMSlcbiAgICB9LFxuICAgIHpvb21PdXQoKSB7XG4gICAgICBjb25zdCB2aWV3ID0gbWFwLmdldFZpZXcoKVxuICAgICAgY29uc3Qgem9vbSA9IHZpZXcuZ2V0Wm9vbSgpXG4gICAgICB2aWV3LnNldFpvb20oem9vbSAtIDEpXG4gICAgfSxcbiAgICBkZXN0cm95KCkge1xuICAgICAgdW5saXN0ZW5Ub1Jlc2l6ZSgpXG4gICAgfSxcbiAgfVxuICByZXR1cm4gZXhwb3NlZE1ldGhvZHNcbn1cbiJdfQ==