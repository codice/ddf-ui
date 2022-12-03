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
import Map from '../map';
import utility from './utility';
import DrawingUtility from '../DrawingUtility';
import properties from '../../../../js/properties';
import Openlayers from 'openlayers';
import { OpenlayersLayers } from '../../../../js/controllers/openlayers.layers';
import user from '../../../singletons/user-instance';
import User from '../../../../js/model/User';
import wreqr from '../../../../js/wreqr';
import { validateGeo } from '../../../../react-component/utils/validation';
import { ClusterType } from '../react/geometries';
import { LazyQueryResult } from '../../../../js/model/LazyQueryResult/LazyQueryResult';
const defaultColor = '#3c6dd5';
const rulerColor = '#506f85';
function createMap(insertionElement: any) {
    const layerPrefs = user.get('user>preferences>mapLayers');
    (User as any).updateMapLayers(layerPrefs);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    const layerCollectionController = new OpenlayersLayers({
        collection: layerPrefs,
    });
    const map = layerCollectionController.makeMap({
        zoom: 2.7,
        minZoom: 2.3,
        center: [0, 0],
        element: insertionElement,
    });
    return map;
}
function determineIdFromPosition(position: any, map: any) {
    const features: any = [];
    map.forEachFeatureAtPixel(position, (feature: any) => {
        features.push(feature);
    });
    if (features.length > 0) {
        return features[0].getId();
    }
}
function convertPointCoordinate(point: any) {
    const coords = [point[0], point[1]];
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any[]' is not assignable to para... Remove this comment to see the full error message
    return Openlayers.proj.transform(coords, 'EPSG:4326', (properties as any).projection);
}
function unconvertPointCoordinate(point: any) {
    return Openlayers.proj.transform(point, (properties as any).projection, 'EPSG:4326');
}
// @ts-expect-error ts-migrate(6133) FIXME: 'longitude' is declared but its value is never rea... Remove this comment to see the full error message
function offMap([longitude, latitude]) {
    return latitude < -90 || latitude > 90;
}
// The extension argument is a function used in panToExtent
// It allows for customization of the way the map pans to results
// @ts-expect-error ts-migrate(6133) FIXME: 'selectionInterface' is declared but its value is ... Remove this comment to see the full error message
export default function (insertionElement: any, selectionInterface: any, notificationEl: any, componentElement: any, mapModel: any) {
    let overlays = {};
    let shapes: any = [];
    const map = createMap(insertionElement);
    listenToResize();
    setupTooltip(map);
    function setupTooltip(map: any) {
        map.on('pointermove', (e: any) => {
            const point = unconvertPointCoordinate(e.coordinate);
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
    function listenToResize() {
        (wreqr as any).vent.on('resize', resizeMap);
    }
    function unlistenToResize() {
        (wreqr as any).vent.off('resize', resizeMap);
    }
    /*
     * Returns a visible label that is in the same location as the provided label (geometryInstance) if one exists.
     * If findSelected is true, the function will also check for hidden labels in the same location but are selected.
     */
    function findOverlappingLabel(findSelected: any, geometryInstance: any) {
        return _.find(mapModel.get('labels'), (label) => label.getSource().getFeatures()[0].getGeometry().getCoordinates()[0] ===
            geometryInstance.getCoordinates()[0] &&
            label.getSource().getFeatures()[0].getGeometry().getCoordinates()[1] ===
                geometryInstance.getCoordinates()[1] &&
            ((findSelected && label.get('isSelected')) || label.getVisible()));
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
    function showHideLabel({ geometry, feature, findSelected = false }: any) {
        const isSelected = geometry.get('isSelected');
        const geometryInstance = feature.getGeometry();
        const labelWithSamePosition = findOverlappingLabel(findSelected, geometryInstance);
        if (isSelected &&
            labelWithSamePosition &&
            !labelWithSamePosition.get('isSelected')) {
            labelWithSamePosition.setVisible(false);
        }
        const otherLabelNotSelected = labelWithSamePosition
            ? !labelWithSamePosition.get('isSelected')
            : true;
        const visible = (isSelected && otherLabelNotSelected) ||
            !labelWithSamePosition ||
            geometry.get('id') === labelWithSamePosition.get('id');
        geometry.setVisible(visible);
    }
    /*
        Shows a hidden label. Used when deleting a label that is shown.
        */
    function showHiddenLabel(geometry: any) {
        if (!geometry.getVisible()) {
            return;
        }
        const geometryInstance = geometry.getSource().getFeatures()[0].getGeometry();
        const hiddenLabel = _.find(mapModel.get('labels'), (label) => label.getSource().getFeatures()[0].getGeometry().getCoordinates()[0] ===
            geometryInstance.getCoordinates()[0] &&
            label.getSource().getFeatures()[0].getGeometry().getCoordinates()[1] ===
                geometryInstance.getCoordinates()[1] &&
            label.get('id') !== geometry.get('id') &&
            !label.getVisible());
        if (hiddenLabel) {
            hiddenLabel.setVisible(true);
        }
    }
    const exposedMethods = _.extend({}, Map, {
        onLeftClick(callback: any) {
            $(map.getTargetElement()).on('click', (e) => {
                const boundingRect = map.getTargetElement().getBoundingClientRect();
                callback(e, {
                    mapTarget: determineIdFromPosition([e.clientX - boundingRect.left, e.clientY - boundingRect.top], map),
                });
            });
        },
        onRightClick(callback: any) {
            $(map.getTargetElement()).on('contextmenu', (e) => {
                callback(e);
            });
        },
        onMouseTrackingForPopup(downCallback: any, moveCallback: any, upCallback: any) {
            // @ts-expect-error ts-migrate(6133) FIXME: 'e' is declared but its value is never read.
            $(map.getTargetElement()).on('mousedown', (e) => {
                downCallback();
            });
            // @ts-expect-error ts-migrate(6133) FIXME: 'e' is declared but its value is never read.
            $(map.getTargetElement()).on('mousemove', (e) => {
                moveCallback();
            });
            this.onLeftClick(upCallback);
        },
        onMouseMove(callback: any) {
            $(map.getTargetElement()).on('mousemove', (e) => {
                const boundingRect = map.getTargetElement().getBoundingClientRect();
                callback(e, {
                    mapTarget: determineIdFromPosition([e.clientX - boundingRect.left, e.clientY - boundingRect.top], map),
                });
            });
        },
        timeoutIds: [],
        onCameraMoveStart(callback: any) {
            clearTimeout(this.timeoutId);
            this.timeoutIds.forEach((timeoutId: any) => {
                clearTimeout(timeoutId);
            });
            this.timeoutIds = [];
            map.addEventListener('movestart', callback);
        },
        offCameraMoveStart(callback: any) {
            map.removeEventListener('movestart', callback);
        },
        onCameraMoveEnd(callback: any) {
            const timeoutCallback = () => {
                this.timeoutIds.push(setTimeout(() => {
                    callback();
                }, 300));
            };
            map.addEventListener('moveend', timeoutCallback);
        },
        offCameraMoveEnd(callback: any) {
            map.removeEventListener('moveend', callback);
        },
        doPanZoom(coords: any) {
            const that = this;
            that.zoomOut({ duration: 1000 }, () => {
                setTimeout(() => {
                    that.zoomToExtent(coords, { duration: 2000 });
                }, 0);
            });
        },
        // @ts-expect-error ts-migrate(6133) FIXME: 'opts' is declared but its value is never read.
        zoomOut(opts: any, next: any) {
            next();
        },
        panToResults(results: any) {
            const coordinates = _.flatten(results.map((result: any) => result.getPoints('location')), true);
            this.panToExtent(coordinates);
        },
        panToExtent(coords: any) {
            if (coords.constructor === Array && coords.length > 0) {
                const lineObject = coords.map((coordinate) => convertPointCoordinate(coordinate));
                const extent = Openlayers.extent.boundingExtent(lineObject);
                map.getView().fit(extent, {
                    size: map.getSize(),
                    maxZoom: map.getView().getZoom(),
                    duration: 500,
                });
            }
        },
        panToShapesExtent() {
            var extent = Openlayers.extent.createEmpty();
            map.getLayers().forEach((layer: any) => {
                if (layer instanceof Openlayers.layer.Group) {
                    layer.getLayers().forEach(function (groupLayer) {
                        //If this is a vector layer, add it to our extent
                        if (layer instanceof Openlayers.layer.Vector)
                            Openlayers.extent.extend(extent, (groupLayer as any).getSource().getExtent());
                    });
                }
                else if (layer instanceof Openlayers.layer.Vector &&
                    layer.get('id')) {
                    Openlayers.extent.extend(extent, layer.getSource().getExtent());
                }
            });
            if (extent[0] !== Infinity) {
                map.getView().fit(extent, {
                    size: map.getSize(),
                    maxZoom: map.getView().getZoom(),
                    duration: 500,
                });
            }
        },
        getShapes() {
            return shapes;
        },
        zoomToExtent(coords: any, opts = {}) {
            const lineObject = coords.map((coordinate: any) => convertPointCoordinate(coordinate));
            const extent = Openlayers.extent.boundingExtent(lineObject);
            map.getView().fit(extent, {
                size: map.getSize(),
                maxZoom: map.getView().getZoom(),
                duration: 500,
                ...opts,
            });
        },
        zoomToBoundingBox({ north, east, south, west }: any) {
            this.zoomToExtent([
                [west, south],
                [east, north],
            ]);
        },
        limit(value: any, min: any, max: any) {
            return Math.min(Math.max(value, min), max);
        },
        getBoundingBox() {
            const extent = map.getView().calculateExtent(map.getSize());
            let longitudeEast = wrapNum(extent[2], -180, 180);
            const longitudeWest = wrapNum(extent[0], -180, 180);
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
        overlayImage(model: LazyQueryResult) {
            const metacardId = model.plain.id;
            this.removeOverlay(metacardId);
            const coords = model.getPoints('location');
            const array = _.map(coords, (coord) => convertPointCoordinate(coord));
            const polygon = new Openlayers.geom.Polygon([array]);
            const extent = polygon.getExtent();
            const projection = Openlayers.proj.get((properties as any).projection);
            const overlayLayer = new Openlayers.layer.Image({
                source: new Openlayers.source.ImageStatic({
                    // @ts-expect-error ts-migrate(2322) FIXME: Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message
                    url: model.currentOverlayUrl,
                    projection,
                    imageExtent: extent,
                }),
            });
            map.addLayer(overlayLayer);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            overlays[metacardId] = overlayLayer;
        },
        removeOverlay(metacardId: any) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (overlays[metacardId]) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                map.removeLayer(overlays[metacardId]);
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                delete overlays[metacardId];
            }
        },
        removeAllOverlays() {
            for (const overlay in overlays) {
                if (overlays.hasOwnProperty(overlay)) {
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    map.removeLayer(overlays[overlay]);
                }
            }
            overlays = {};
        },
        getCartographicCenterOfClusterInDegrees(cluster: ClusterType) {
            return utility.calculateCartographicCenterOfGeometriesInDegrees(cluster.results);
        },
        getWindowLocationsOfResults(results: any) {
            return results.map((result: any) => {
                const openlayersCenterOfGeometry = utility.calculateOpenlayersCenterOfGeometry(result);
                const center = map.getPixelFromCoordinate(openlayersCenterOfGeometry);
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
        calculateDistanceBetweenPositions(coords: any) {
            const line = new Openlayers.geom.LineString(coords);
            const sphereLength = Openlayers.Sphere.getLength(line);
            return sphereLength;
        },
        /*
         * Draws a marker on the map designating a start/end point for the ruler measurement. The given
         * coordinates should be an object with 'lat' and 'lon' keys with degrees values. The given
         * marker label should be a single character or digit that is displayed on the map marker.
         */
        addRulerPoint(coordinates: any, markerLabel: any) {
            const { lat, lon } = coordinates;
            const point = [lon, lat];
            const options = {
                id: markerLabel,
                color: rulerColor,
            };
            return this.addPoint(point, options);
        },
        /*
         * Removes the given point Layer from the map.
         */
        removeRulerPoint(pointLayer: any) {
            map.removeLayer(pointLayer);
        },
        /*
         * Draws a line on the map between the points in the given array of point Vectors.
         */
        addRulerLine(point: any) {
            const options = {
                id: 'ruler-line',
                title: 'Line for ruler measurement',
                color: '#506F85',
            };
            const startingCoordinates = mapModel.get('startingCoordinates');
            const linePoints = [
                [startingCoordinates['lon'], startingCoordinates['lat']],
                [point['lon'], point['lat']],
            ];
            this.rulerLine = this.addLine(linePoints, options);
            return this.rulerLine;
        },
        /*
         * Update the position of the ruler line
         */
        setRulerLine(point: any) {
            this.removeRulerLine(this.rulerLine);
            this.addRulerLine(point);
        },
        /*
         * Removes the given line Layer from the map.
         */
        // @ts-expect-error ts-migrate(6133) FIXME: 'line' is declared but its value is never read.
        removeRulerLine(line: any) {
            map.removeLayer(this.rulerLine);
        },
        /*
            Adds a billboard point utilizing the passed in point and options.
            Options are a view to relate to, and an id, and a color.
        */
        // @ts-expect-error ts-migrate(6133) FIXME: 'useCustomText' is declared but its value is never... Remove this comment to see the full error message
        addPointWithText(point: any, options: any, useCustomText = false) {
            const pointObject = convertPointCoordinate(point);
            const feature = new Openlayers.Feature({
                geometry: new Openlayers.geom.Point(pointObject),
            });
            feature.setId(options.id);
            (feature as any).unselectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getCircleWithText({
                        fillColor: options.color,
                        text: options.id.length,
                    }),
                    imgSize: [44, 44],
                }),
            });
            (feature as any).partiallySelectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getCircleWithText({
                        fillColor: options.color,
                        text: options.id.length,
                        strokeColor: 'black',
                        textColor: 'white',
                    }),
                    imgSize: [44, 44],
                }),
            });
            (feature as any).selectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getCircleWithText({
                        fillColor: options.color,
                        text: options.id.length,
                        strokeColor: 'black',
                        textColor: 'black',
                    }),
                    imgSize: [44, 44],
                }),
            });
            switch (options.isSelected) {
                case 'selected':
                    feature.setStyle((feature as any).selectedStyle);
                    break;
                case 'partially':
                    feature.setStyle((feature as any).partiallySelectedStyle);
                    break;
                case 'unselected':
                    feature.setStyle((feature as any).unselectedStyle);
                    break;
            }
            const vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            const vectorLayer = new Openlayers.layer.Vector({
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
        addPoint(point: any, options: any) {
            const pointObject = convertPointCoordinate(point);
            const feature = new Openlayers.Feature({
                geometry: new Openlayers.geom.Point(pointObject),
                name: options.title,
            });
            feature.setId(options.id);
            let x = 39, y = 40;
            if (options.size) {
                x = options.size.x;
                y = options.size.y;
            }
            (feature as any).unselectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getPin({
                        fillColor: options.color,
                        icon: options.icon,
                    }),
                    imgSize: [x, y],
                    anchor: [x / 2, 0],
                    anchorOrigin: 'bottom-left',
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                }),
            });
            (feature as any).selectedStyle = new Openlayers.style.Style({
                image: new Openlayers.style.Icon({
                    img: DrawingUtility.getPin({
                        fillColor: options.color,
                        strokeColor: 'black',
                        icon: options.icon,
                    }),
                    imgSize: [x, y],
                    anchor: [x / 2, 0],
                    anchorOrigin: 'bottom-left',
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                }),
            });
            feature.setStyle(options.isSelected ? (feature as any).selectedStyle : (feature as any).unselectedStyle);
            const vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            const vectorLayer = new Openlayers.layer.Vector({
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
        addLabel(point: any, options: any) {
            const pointObject = convertPointCoordinate(point);
            const feature = new Openlayers.Feature({
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
            const vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            const vectorLayer = new Openlayers.layer.Vector({
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
        addLine(line: any, options: any) {
            const lineObject = line.map((coordinate: any) => convertPointCoordinate(coordinate));
            const feature = new Openlayers.Feature({
                geometry: new Openlayers.geom.LineString(lineObject),
                name: options.title,
            });
            feature.setId(options.id);
            const commonStyle = new Openlayers.style.Style({
                stroke: new Openlayers.style.Stroke({
                    color: options.color || defaultColor,
                    width: 4,
                }),
            });
            (feature as any).unselectedStyle = [
                new Openlayers.style.Style({
                    stroke: new Openlayers.style.Stroke({
                        color: 'white',
                        width: 8,
                    }),
                }),
                commonStyle,
            ];
            (feature as any).selectedStyle = [
                new Openlayers.style.Style({
                    stroke: new Openlayers.style.Stroke({
                        color: 'black',
                        width: 8,
                    }),
                }),
                commonStyle,
            ];
            feature.setStyle(options.isSelected ? (feature as any).selectedStyle : (feature as any).unselectedStyle);
            const vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            const vectorLayer = new Openlayers.layer.Vector({
                source: vectorSource,
            });
            map.addLayer(vectorLayer);
            return vectorLayer;
        },
        /*
              Adds a polygon fill utilizing the passed in polygon and options.
              Options are a view to relate to, and an id.
            */
        // @ts-expect-error ts-migrate(6133) FIXME: 'polygon' is declared but its value is never read.
        addPolygon(polygon: any, options: any) { },
        /*
             Updates a passed in geometry to reflect whether or not it is selected.
             Options passed in are color and isSelected.
             */
        updateCluster(geometry: any, options: any) {
            if (geometry.constructor === Array) {
                geometry.forEach((innerGeometry) => {
                    this.updateCluster(innerGeometry, options);
                });
            }
            else {
                const feature = geometry.getSource().getFeatures()[0];
                const geometryInstance = feature.getGeometry();
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
                    const styles = [
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
        updateGeometry(geometry: any, options: any) {
            if (geometry.constructor === Array) {
                geometry.forEach((innerGeometry) => {
                    this.updateGeometry(innerGeometry, options);
                });
            }
            else {
                const feature = geometry.getSource().getFeatures()[0];
                const geometryInstance = feature.getGeometry();
                if (geometryInstance.constructor === Openlayers.geom.Point) {
                    geometry.setZIndex(options.isSelected ? 2 : 1);
                    feature.setStyle(options.isSelected ? feature.selectedStyle : feature.unselectedStyle);
                }
                else if (geometryInstance.constructor === Openlayers.geom.LineString) {
                    feature.setStyle(options.isSelected ? feature.selectedStyle : feature.unselectedStyle);
                }
            }
        },
        setGeometryStyle(geometry: any, options: any, feature: any) {
            const geometryInstance = feature.getGeometry();
            if (geometryInstance.getType() === 'Point') {
                let pointWidth = 39;
                let pointHeight = 40;
                if (options.size) {
                    pointWidth = options.size.x;
                    pointHeight = options.size.y;
                }
                geometry.setZIndex(options.isSelected ? 2 : 1);
                if (!feature.getProperties().isLabel) {
                    feature.setStyle(new Openlayers.style.Style({
                        image: new Openlayers.style.Icon({
                            img: DrawingUtility.getPin({
                                fillColor: options.color,
                                strokeColor: options.isSelected ? 'black' : 'white',
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
                        geometry,
                        feature,
                    });
                }
            }
            else if (geometryInstance.getType() === 'LineString') {
                const styles = [
                    new Openlayers.style.Style({
                        stroke: new Openlayers.style.Stroke({
                            color: options.isSelected ? 'black' : 'white',
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
        createTextStyle(feature: any, resolution: any) {
            const fillColor = '#000000';
            const outlineColor = '#ffffff';
            const outlineWidth = 3;
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
        getText(feature: any, resolution: any) {
            const maxResolution = 1200;
            const text = resolution > maxResolution ? '' : this.trunc(feature.get('name'), 20);
            return text;
        },
        trunc(str: any, n: any) {
            return str.length > n ? str.substr(0, n - 1) + '...' : str.substr(0);
        },
        /*
             Updates a passed in geometry to be hidden
             */
        hideGeometry(geometry: any) {
            geometry.setVisible(false);
        },
        /*
             Updates a passed in geometry to be shown
             */
        showGeometry(geometry: any) {
            const feature = geometry.getSource().getFeatures()[0];
            if (feature.getProperties().isLabel) {
                showHideLabel({
                    geometry,
                    feature,
                    findSelected: true,
                });
            }
            else {
                geometry.setVisible(true);
            }
        },
        removeGeometry(geometry: any) {
            const feature = geometry.getSource().getFeatures()[0];
            if (feature.getProperties().isLabel) {
                mapModel.removeLabel(geometry);
                showHiddenLabel(geometry);
            }
            map.removeLayer(geometry);
        },
        showMultiLineShape(locationModel: any) {
            let lineObject = locationModel.get('multiline');
            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
            if (validateGeo('multiline', JSON.stringify(lineObject)).error) {
                return;
            }
            lineObject = lineObject.map((line: any) => line.map((coords: any) => convertPointCoordinate(coords)));
            let feature = new Openlayers.Feature({
                geometry: new Openlayers.geom.MultiLineString(lineObject),
            });
            feature.setId(locationModel.cid);
            const styles = [
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
        createVectorLayer(locationModel: any, feature: any) {
            let vectorSource = new Openlayers.source.Vector({
                features: [feature],
            });
            let vectorLayer = new Openlayers.layer.Vector({
                source: vectorSource,
            });
            map.addLayer(vectorLayer);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            overlays[locationModel.cid] = vectorLayer;
            return vectorLayer;
        },
        destroyShape(cid: any) {
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'shape' implicitly has an 'any' type.
            const shapeIndex = shapes.findIndex((shape) => cid === shape.model.cid);
            if (shapeIndex >= 0) {
                shapes[shapeIndex].destroy();
                shapes.splice(shapeIndex, 1);
            }
        },
        destroyShapes() {
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'shape' implicitly has an 'any' type.
            shapes.forEach((shape) => {
                shape.destroy();
            });
            shapes = [];
        },
        getMap() {
            return map;
        },
        destroy() {
            unlistenToResize();
        },
    });
    return exposedMethods;
}
