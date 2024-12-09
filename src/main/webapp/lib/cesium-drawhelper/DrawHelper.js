import { __assign } from "tslib";
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
/**
 * Created by thomas on 9/01/14.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * (c) www.geocento.com
 * www.metaaps.com
 *
 */
/* eslint-disable */
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium';
import * as Turf from '@turf/turf';
import utility from '../../component/visualization/maps/cesium/utility';
import _ from 'lodash';
import dragHalfSvg from '!!raw-loader!./drag-half.svg';
import vertexSvg from '!!raw-loader!./vertex.svg';
import { contrastingColor } from '../../react-component/location/location-color-selector';
// Avoid conflict with the name _, which DrawHelper uses a lot
var lodash = _;
var DrawHelper = (function () {
    // static variables
    var ellipsoid = Cesium.Ellipsoid.WGS84;
    // constructor
    function _(cesiumWidget) {
        this._scene = cesiumWidget.scene;
        this._tooltip = createTooltip(cesiumWidget.container);
        this._surfaces = [];
        this.initialiseHandlers();
        this.enhancePrimitives();
    }
    _.prototype.initialiseHandlers = function () {
        var scene = this._scene;
        // scene events
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        function callPrimitiveCallback(name, position) {
            var pickedObject = scene.pick(position);
            if (pickedObject &&
                pickedObject.primitive &&
                pickedObject.primitive[name]) {
                pickedObject.primitive[name](position);
            }
        }
        handler.setInputAction(function (movement) {
            callPrimitiveCallback('leftClick', movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(function (movement) {
            callPrimitiveCallback('leftDoubleClick', movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        handler.setInputAction(function (movement) {
            callPrimitiveCallback('rightClick', movement.position);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        var mouseOutObject;
        handler.setInputAction(function (movement) {
            var pickedObject = scene.pick(movement.endPosition);
            if (mouseOutObject &&
                (!pickedObject || mouseOutObject != pickedObject.primitive)) {
                !(mouseOutObject.isDestroyed && mouseOutObject.isDestroyed()) &&
                    mouseOutObject.mouseOut(movement.endPosition);
                mouseOutObject = null;
            }
            if (pickedObject && pickedObject.primitive) {
                pickedObject = pickedObject.primitive;
                if (pickedObject.mouseOut) {
                    mouseOutObject = pickedObject;
                }
                if (pickedObject.mouseMove) {
                    pickedObject.mouseMove(movement.endPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(function (movement) {
            callPrimitiveCallback('leftUp', movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
        handler.setInputAction(function (movement) {
            callPrimitiveCallback('leftDown', movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    };
    _.prototype.setListener = function (primitive, type, callback) {
        primitive[type] = callback;
    };
    // register event handling for an editable shape
    // shape should implement setEditMode and setHighlighted
    _.prototype.registerEditableShape = function (surface) {
        var _self = this;
        // handlers for interactions
        // highlight polygon when mouse is entering
        setListener(surface, 'mouseMove', function (position) {
            surface.setHighlighted(true);
            if (!surface._editMode) {
                _self._tooltip.showAt(position, 'Click to edit this shape');
            }
        });
        // hide the highlighting when mouse is leaving the polygon
        setListener(surface, 'mouseOut', function () {
            surface.setHighlighted(false);
            _self._tooltip.setVisible(false);
        });
        setListener(surface, 'leftClick', function () {
            surface.setEditMode(true);
        });
    };
    _.prototype.startDrawing = function (cleanUp) {
        // check for cleanUp first
        if (this.editCleanUp) {
            this.editCleanUp();
        }
        this.editCleanUp = cleanUp;
    };
    _.prototype.stopDrawing = function () {
        // check for cleanUp first
        if (this.editCleanUp) {
            this.editCleanUp();
            this.editCleanUp = null;
        }
    };
    // make sure only one shape is highlighted at a time
    _.prototype.disableAllHighlights = function () {
        this.setHighlighted(undefined);
    };
    _.prototype.setHighlighted = function (surface) {
        if (this._highlightedSurface &&
            !this._highlightedSurface.isDestroyed() &&
            this._highlightedSurface != surface) {
            this._highlightedSurface.setHighlighted(false);
        }
        this._highlightedSurface = surface;
    };
    _.prototype.disableAllEditMode = function () {
        this.setEdited(undefined);
    };
    _.prototype.setEdited = function (surface) {
        if (this._editedSurface && !this._editedSurface.isDestroyed()) {
            this._editedSurface.setEditMode(false);
        }
        this._editedSurface = surface;
    };
    var material = Cesium.Material.fromType(Cesium.Material.ColorType);
    material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
    var defaultShapeOptions = {
        ellipsoid: Cesium.Ellipsoid.WGS84,
        textureRotationAngle: 0.0,
        height: 0.0,
        asynchronous: true,
        show: true,
        debugShowBoundingVolume: false,
    };
    var defaultSurfaceOptions = copyOptions(defaultShapeOptions, {
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: false,
        }),
        material: material,
        granularity: Math.PI / 180.0,
    });
    var defaultPolygonOptions = copyOptions(defaultShapeOptions, {});
    var defaultExtentOptions = copyOptions(defaultShapeOptions, {});
    var defaultCircleOptions = copyOptions(defaultShapeOptions, {});
    var defaultEllipseOptions = copyOptions(defaultSurfaceOptions, {
        rotation: 0,
    });
    var defaultPolylineOptions = copyOptions(defaultShapeOptions, {
        width: 5,
        geodesic: true,
        granularity: 10000,
        appearance: new Cesium.PolylineMaterialAppearance({
            aboveGround: false,
        }),
        material: material,
    });
    //    Cesium.Polygon.prototype.setStrokeStyle = setStrokeStyle;
    //
    //    Cesium.Polygon.prototype.drawOutline = drawOutline;
    //
    var ChangeablePrimitive = (function () {
        function _() { }
        _.prototype.initialiseOptions = function (options) {
            fillOptions(this, options);
            this._ellipsoid = undefined;
            this._granularity = undefined;
            this._height = undefined;
            this._textureRotationAngle = undefined;
            this._id = undefined;
            // set the flags to initiate a first drawing
            this._createPrimitive = true;
            this._primitive = undefined;
            this._outlinePolygon = undefined;
        };
        _.prototype.setAttribute = function (name, value) {
            this[name] = value;
            this._createPrimitive = true;
        };
        _.prototype.getAttribute = function (name) {
            return this[name];
        };
        /**
         * @private
         */
        _.prototype.update = function (context, frameState, commandList) {
            if (!Cesium.defined(this.ellipsoid)) {
                throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
            }
            if (!Cesium.defined(this.appearance)) {
                throw new Cesium.DeveloperError('this.material must be defined.');
            }
            if (this.granularity < 0.0) {
                throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
            }
            if (!this.show) {
                return;
            }
            if (!this._createPrimitive && !Cesium.defined(this._primitive)) {
                // No positions/hierarchy to draw
                return;
            }
            if (this._createPrimitive ||
                this._ellipsoid !== this.ellipsoid ||
                this._granularity !== this.granularity ||
                this._height !== this.height ||
                this._textureRotationAngle !== this.textureRotationAngle ||
                this._id !== this.id) {
                var geometry = this.getGeometry();
                if (!geometry) {
                    return;
                }
                this._createPrimitive = false;
                this._ellipsoid = this.ellipsoid;
                this._granularity = this.granularity;
                this._height = this.height;
                this._textureRotationAngle = this.textureRotationAngle;
                this._id = this.id;
                this._primitive = this._primitive && this._primitive.destroy();
                this._primitive = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry,
                        id: this.id,
                        pickPrimitive: this,
                    }),
                    appearance: this.appearance,
                    asynchronous: this.asynchronous,
                });
                this._outlinePolygon =
                    this._outlinePolygon && this._outlinePolygon.destroy();
                if (this.buffer && this.getOutlineGeometry) {
                    var outlineGeometry = this.getOutlineGeometry();
                    if (outlineGeometry) {
                        // create the highlighting frame
                        this._outlinePolygon = new Cesium.Primitive({
                            geometryInstances: new Cesium.GeometryInstance({
                                geometry: outlineGeometry,
                                attributes: {
                                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(contrastingColor)),
                                },
                            }),
                            appearance: new Cesium.PolylineMaterialAppearance({
                                material: Cesium.Material.fromType('Color', {
                                    color: Cesium.Color.fromCssColorString(contrastingColor),
                                }),
                            }),
                        });
                    }
                }
            }
            var primitive = this._primitive;
            primitive.appearance.material = this.material;
            primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
            primitive.update(context, frameState, commandList);
            if (this._outlinePolygon) {
                this._outlinePolygon.update(context, frameState, commandList);
            }
        };
        _.prototype.isDestroyed = function () {
            return false;
        };
        _.prototype.destroy = function () {
            this._primitive = this._primitive && this._primitive.destroy();
            return Cesium.destroyObject(this);
        };
        _.prototype.setStrokeStyle = function (strokeColor, strokeWidth) {
            if (!this.strokeColor ||
                !this.strokeColor.equals(strokeColor) ||
                this.strokeWidth != strokeWidth) {
                this._createPrimitive = true;
                this.strokeColor = strokeColor;
                this.strokeWidth = strokeWidth;
            }
        };
        return _;
    })();
    _.ExtentPrimitive = (function () {
        // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
        function _(options) {
            if (!Cesium.defined(options.extent)) {
                throw new Cesium.DeveloperError('Extent is required');
            }
            options = copyOptions(options, defaultSurfaceOptions);
            this.initialiseOptions(options);
            this.setExtent(options.extent);
        }
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        _.prototype = new ChangeablePrimitive();
        _.prototype.setExtent = function (extent) {
            this.setAttribute('extent', extent);
        };
        _.prototype.getExtent = function () {
            return this.getAttribute('extent');
        };
        _.prototype.getGeometry = function () {
            if (!Cesium.defined(this.extent)) {
                return;
            }
            var positions = [
                Cesium.Cartesian3.fromRadians(this.extent.west, this.extent.south),
                Cesium.Cartesian3.fromRadians(this.extent.west, this.extent.north),
                Cesium.Cartesian3.fromRadians(this.extent.east, this.extent.north),
                Cesium.Cartesian3.fromRadians(this.extent.east, this.extent.south),
                Cesium.Cartesian3.fromRadians(this.extent.west, this.extent.south),
            ];
            // Display a PolygonGeometry instead of a RectangleGeometry because RectangleGeometries
            // appear to always wrap the long way around the antimeridian.
            return Cesium.PolygonGeometry.fromPositions({
                positions: positions,
                height: this.height,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity,
            });
        };
        _.prototype.getOutlineGeometry = function () {
            return new Cesium.RectangleOutlineGeometry({
                rectangle: this.extent,
            });
        };
        return _;
    })();
    _.PolygonPrimitive = (function () {
        // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
        function _(options) {
            options = copyOptions(options, defaultSurfaceOptions);
            this.initialiseOptions(options);
            this.isPolygon = true;
        }
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        _.prototype = new ChangeablePrimitive();
        _.prototype.setPositions = function (positions) {
            this.setAttribute('positions', positions);
        };
        _.prototype.getPositions = function () {
            return this.getAttribute('positions');
        };
        _.prototype.getGeometry = function () {
            if (!Cesium.defined(this.positions) || this.positions.length < 3) {
                return;
            }
            return Cesium.PolygonGeometry.fromPositions({
                positions: this.positions,
                height: this.height,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity,
            });
        };
        _.prototype.getOutlineGeometry = function () {
            if (!Cesium.defined(this.positions) ||
                this.positions.length < 3 ||
                !this.buffer) {
                return;
            }
            var coordinates = this.positions.map(function (pos) {
                var cartographic = Cesium.Cartographic.fromCartesian(pos);
                return [
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.latitude),
                    cartographic.altitude,
                ];
            });
            var adjustedPolygon = Turf.polygon([coordinates]);
            utility.adjustGeoCoords(adjustedPolygon);
            var bufferedPolygon = Turf.buffer(adjustedPolygon, Math.max(this.buffer, 1), {
                units: 'meters',
            });
            if (!bufferedPolygon) {
                return;
            }
            // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
            utility.adjustGeoCoords(bufferedPolygon);
            var outlinePositions = bufferedPolygon.geometry.coordinates[0].map(function (coord) { return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord[2]); });
            return new Cesium.PolylineGeometry({
                positions: outlinePositions,
                height: this.height,
                width: this.width < 1 ? 1 : this.width,
                ellipsoid: this.ellipsoid,
            });
        };
        return _;
    })();
    _.CirclePrimitive = (function () {
        // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
        function _(options) {
            if (!(Cesium.defined(options.center) && Cesium.defined(options.radius))) {
                throw new Cesium.DeveloperError('Center and radius are required');
            }
            options = copyOptions(options, defaultSurfaceOptions);
            this.initialiseOptions(options);
            this.setRadius(options.radius);
        }
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        _.prototype = new ChangeablePrimitive();
        _.prototype.setCenter = function (center) {
            this.setAttribute('center', center);
        };
        _.prototype.setRadius = function (radius) {
            this.setAttribute('radius', Math.max(0.1, radius));
        };
        _.prototype.getCenter = function () {
            return this.getAttribute('center');
        };
        _.prototype.getRadius = function () {
            return this.getAttribute('radius');
        };
        _.prototype.getGeometry = function () {
            if (!(Cesium.defined(this.center) && Cesium.defined(this.radius))) {
                return;
            }
            return new Cesium.CircleGeometry({
                center: this.center,
                radius: this.radius,
                height: this.height,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity,
            });
        };
        _.prototype.getOutlineGeometry = function () {
            return new Cesium.CircleOutlineGeometry({
                center: this.getCenter(),
                radius: this.getRadius(),
            });
        };
        return _;
    })();
    _.EllipsePrimitive = (function () {
        function _(options) {
            if (!(Cesium.defined(options.center) &&
                Cesium.defined(options.semiMajorAxis) &&
                Cesium.defined(options.semiMinorAxis))) {
                throw new Cesium.DeveloperError('Center and semi major and semi minor axis are required');
            }
            options = copyOptions(options, defaultEllipseOptions);
            this.initialiseOptions(options);
        }
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        _.prototype = new ChangeablePrimitive();
        _.prototype.setCenter = function (center) {
            this.setAttribute('center', center);
        };
        _.prototype.setSemiMajorAxis = function (semiMajorAxis) {
            if (semiMajorAxis < this.getSemiMinorAxis())
                return;
            this.setAttribute('semiMajorAxis', semiMajorAxis);
        };
        _.prototype.setSemiMinorAxis = function (semiMinorAxis) {
            if (semiMinorAxis > this.getSemiMajorAxis())
                return;
            this.setAttribute('semiMinorAxis', semiMinorAxis);
        };
        _.prototype.setRotation = function (rotation) {
            return this.setAttribute('rotation', rotation);
        };
        _.prototype.getCenter = function () {
            return this.getAttribute('center');
        };
        _.prototype.getSemiMajorAxis = function () {
            return this.getAttribute('semiMajorAxis');
        };
        _.prototype.getSemiMinorAxis = function () {
            return this.getAttribute('semiMinorAxis');
        };
        _.prototype.getRotation = function () {
            return this.getAttribute('rotation');
        };
        _.prototype.getGeometry = function () {
            if (!(Cesium.defined(this.center) &&
                Cesium.defined(this.semiMajorAxis) &&
                Cesium.defined(this.semiMinorAxis))) {
                return;
            }
            return new Cesium.EllipseGeometry({
                ellipsoid: this.ellipsoid,
                center: this.center,
                semiMajorAxis: this.semiMajorAxis,
                semiMinorAxis: this.semiMinorAxis,
                rotation: this.rotation,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                // @ts-expect-error ts-migrate(1117) FIXME: An object literal cannot have multiple properties ... Remove this comment to see the full error message
                ellipsoid: this.ellipsoid,
                granularity: this.granularity,
            });
        };
        _.prototype.getOutlineGeometry = function () {
            return new Cesium.EllipseOutlineGeometry({
                center: this.getCenter(),
                semiMajorAxis: this.getSemiMajorAxis(),
                semiMinorAxis: this.getSemiMinorAxis(),
                rotation: this.getRotation(),
            });
        };
        return _;
    })();
    _.PolylinePrimitive = (function () {
        function _(options) {
            options = copyOptions(options, defaultPolylineOptions);
            this.initialiseOptions(options);
        }
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        _.prototype = new ChangeablePrimitive();
        _.prototype.setPositions = function (positions) {
            this.setAttribute('positions', positions);
        };
        _.prototype.setWidth = function (width) {
            this.setAttribute('width', width);
        };
        _.prototype.setGeodesic = function (geodesic) {
            this.setAttribute('geodesic', geodesic);
        };
        _.prototype.getPositions = function () {
            return this.getAttribute('positions');
        };
        _.prototype.getWidth = function () {
            return this.getAttribute('width');
        };
        _.prototype.getGeodesic = function () {
            return this.getAttribute('geodesic');
        };
        _.prototype.getGeometry = function () {
            if (!Cesium.defined(this.positions) || this.positions.length < 2) {
                return;
            }
            return new Cesium.PolylineGeometry({
                positions: this.positions,
                height: this.height,
                width: this.width < 1 ? 1 : this.width,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                ellipsoid: this.ellipsoid,
            });
        };
        _.prototype.getOutlineGeometry = function () {
            if (!Cesium.defined(this.positions) ||
                this.positions.length < 2 ||
                !this.buffer) {
                return;
            }
            var coordinates = this.positions.map(function (pos) {
                var cartographic = Cesium.Cartographic.fromCartesian(pos);
                return [
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.latitude),
                    cartographic.altitude,
                ];
            });
            var turfLine = Turf.lineString(coordinates);
            utility.adjustGeoCoords(turfLine);
            var bufferedLine = Turf.buffer(turfLine, Math.max(this.buffer, 1), {
                units: 'meters',
            });
            if (!bufferedLine) {
                return;
            }
            // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
            utility.adjustGeoCoords(bufferedLine);
            var outlinePositions = bufferedLine.geometry.coordinates[0].map(function (coord) { return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord[2]); });
            return new Cesium.PolylineGeometry({
                positions: outlinePositions,
                height: this.height,
                width: this.width < 1 ? 1 : this.width,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                ellipsoid: this.ellipsoid,
            });
        };
        return _;
    })();
    /*
      Create our own Image objects and pass them, instead of URLS, to the
      BillboardCollections. This ensures the shape editing controls will always
      be displayed immediately after the user clicks the Draw button, and without
      requiring any user interaction with the map. If we used unloaded images
      (e.g., image URLs), as we did previously, then sometimes the shape editing
      controls would not be displayed until the user interacted with the map,
      like moving it or zooming in or out. This is because we have Cesium's
      requestRenderMode enabled. Sometimes, the image was not loaded by the time
      the render request for the drawing primitive was made, and another render
      request (triggered, for example, by moving the map) had to be made for
      it to be shown.
    */
    var vertexImage = new Image();
    vertexImage.src = "data:image/svg+xml;base64,".concat(window.btoa(vertexSvg));
    var dragHalfImage = new Image();
    dragHalfImage.src = "data:image/svg+xml;base64,".concat(window.btoa(dragHalfSvg));
    var defaultBillboard = {
        image: vertexImage,
        shiftX: 0,
        shiftY: 0,
    };
    var dragBillboard = {
        image: vertexImage,
        shiftX: 0,
        shiftY: 0,
    };
    var dragHalfBillboard = {
        image: dragHalfImage,
        shiftX: 0,
        shiftY: 0,
    };
    _.prototype.createBillboardGroup = function (points, options, callbacks) {
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        var markers = new _.BillboardGroup(this, options);
        markers.addBillboards(points, callbacks);
        return markers;
    };
    _.BillboardGroup = function (drawHelper, options) {
        ;
        this._drawHelper = drawHelper;
        this._scene = drawHelper._scene;
        this._options = copyOptions(options, defaultBillboard);
        // create one common billboard collection for all billboards
        var b = new Cesium.BillboardCollection();
        this._scene.primitives.add(b);
        this._billboards = b;
        this._orderedBillboards = [];
    };
    _.BillboardGroup.prototype.createBillboard = function (position, callbacks) {
        var billboard = this._billboards.add({
            show: true,
            position: position,
            pixelOffset: new Cesium.Cartesian2(this._options.shiftX, this._options.shiftY),
            eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            scale: 1.0,
            image: this._options.image,
            color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
        });
        // if editable
        if (callbacks) {
            var _self = this;
            var screenSpaceCameraController_1 = this._scene.screenSpaceCameraController;
            // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
            function enableRotation(enable) {
                screenSpaceCameraController_1.enableRotate = enable;
            }
            // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
            function getIndex() {
                // find index
                for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i)
                    ;
                return i;
            }
            if (callbacks.dragHandlers) {
                // eslint-disable-next-line no-redeclare
                var _self = this;
                setListener(billboard, 'leftDown', function (position) {
                    // TODO - start the drag handlers here
                    // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                    function onDrag(position) {
                        billboard.position = position;
                        // find index
                        for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i)
                            ;
                        callbacks.dragHandlers.onDrag &&
                            callbacks.dragHandlers.onDrag(getIndex(), position);
                    }
                    function onDragEnd(position) {
                        handler.destroy();
                        enableRotation(true);
                        callbacks.dragHandlers.onDragEnd &&
                            callbacks.dragHandlers.onDragEnd(getIndex(), position);
                    }
                    var handler = new Cesium.ScreenSpaceEventHandler(_self._scene.canvas);
                    handler.setInputAction(function (movement) {
                        var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian) {
                            onDrag(cartesian);
                        }
                        else {
                            onDragEnd(cartesian);
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    handler.setInputAction(function (movement) {
                        onDragEnd(_self._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);
                    enableRotation(false);
                    callbacks.dragHandlers.onDragStart &&
                        callbacks.dragHandlers.onDragStart(getIndex(), _self._scene.camera.pickEllipsoid(position, ellipsoid));
                });
            }
            if (callbacks.onRightClick) {
                setListener(billboard, 'rightClick', function () {
                    callbacks.onRightClick(getIndex());
                });
            }
            if (callbacks.onClick) {
                setListener(billboard, 'leftClick', function () {
                    callbacks.onClick(getIndex());
                });
            }
            if (callbacks.tooltip) {
                setListener(billboard, 'mouseMove', function (position) {
                    _self._drawHelper._tooltip.showAt(position, callbacks.tooltip());
                });
                setListener(billboard, 'mouseOut', function () {
                    _self._drawHelper._tooltip.setVisible(false);
                });
            }
        }
        return billboard;
    };
    _.BillboardGroup.prototype.insertBillboard = function (index, position, callbacks) {
        this._orderedBillboards.splice(index, 0, this.createBillboard(position, callbacks));
    };
    _.BillboardGroup.prototype.addBillboard = function (position, callbacks) {
        this._orderedBillboards.push(this.createBillboard(position, callbacks));
    };
    _.BillboardGroup.prototype.addBillboards = function (positions, callbacks) {
        var index = 0;
        for (; index < positions.length; index++) {
            this.addBillboard(positions[index], callbacks);
        }
    };
    _.BillboardGroup.prototype.updateBillboardsPositions = function (positions) {
        var index = 0;
        for (; index < positions.length; index++) {
            this.getBillboard(index).position = positions[index];
        }
    };
    _.BillboardGroup.prototype.countBillboards = function () {
        return this._orderedBillboards.length;
    };
    _.BillboardGroup.prototype.getBillboard = function (index) {
        return this._orderedBillboards[index];
    };
    _.BillboardGroup.prototype.removeBillboard = function (index) {
        this._billboards.remove(this.getBillboard(index));
        this._orderedBillboards.splice(index, 1);
    };
    _.BillboardGroup.prototype.remove = function () {
        this._billboards =
            this._billboards &&
                this._scene.primitives.remove(this._billboards) &&
                this._billboards.removeAll() &&
                this._billboards.destroy();
    };
    _.BillboardGroup.prototype.setOnTop = function () {
        this._scene.primitives.raiseToTop(this._billboards);
    };
    _.prototype.startDrawingMarker = function (options) {
        // eslint-disable-next-line no-redeclare
        var options = copyOptions(options, defaultBillboard);
        this.startDrawing(function () {
            markers.remove();
            mouseHandler.destroy();
            tooltip.setVisible(false);
        });
        var _self = this;
        var scene = this._scene;
        // @ts-expect-error ts-migrate(6133) FIXME: 'primitives' is declared but its value is never re... Remove this comment to see the full error message
        var primitives = scene.primitives;
        var tooltip = this._tooltip;
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        var markers = new _.BillboardGroup(this, options);
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        // Now wait for start
        mouseHandler.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    markers.addBillboard(cartesian);
                    _self.stopDrawing();
                    options.callback(cartesian);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                if (cartesian) {
                    tooltip.showAt(position, '<p>Click to add your marker. Position is: </p>' +
                        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                        getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));
                }
                else {
                    tooltip.showAt(position, '<p>Click on the globe to add your marker.</p>');
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    _.prototype.startDrawingPolygon = function (options) {
        // eslint-disable-next-line no-redeclare
        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawingPolyshape(true, options);
    };
    _.prototype.startDrawingPolyline = function (options) {
        // eslint-disable-next-line no-redeclare
        var options = copyOptions(options, defaultPolylineOptions);
        this.startDrawingPolyshape(false, options);
    };
    _.prototype.startDrawingPolyshape = function (isPolygon, options) {
        this.startDrawing(function () {
            primitives.remove(poly);
            markers.remove();
            mouseHandler.destroy();
            tooltip.setVisible(false);
        });
        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;
        var minPoints = isPolygon ? 3 : 2;
        var poly;
        if (isPolygon) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            poly = new DrawHelper.PolygonPrimitive(options);
        }
        else {
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            poly = new DrawHelper.PolylinePrimitive(options);
        }
        poly.asynchronous = false;
        primitives.add(poly);
        var positions = [];
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        var markers = new _.BillboardGroup(this, defaultBillboard);
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        // Now wait for start
        mouseHandler.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    // first click
                    if (positions.length == 0) {
                        // If user clicks, they have started drawing, so disable editing
                        _self.disableAllEditMode();
                        positions.push(cartesian.clone());
                        markers.addBillboard(positions[0]);
                    }
                    if (positions.length >= minPoints) {
                        poly.positions = positions;
                        poly._createPrimitive = true;
                    }
                    // add new point to polygon
                    // this one will move with the mouse
                    positions.push(cartesian);
                    // add marker at the new position
                    markers.addBillboard(cartesian);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (positions.length == 0) {
                    var feature = scene.pick(position);
                    var isBillboard = (feature === null || feature === void 0 ? void 0 : feature.primitive) && feature.primitive instanceof Cesium.Billboard;
                    // Show this tooltip only if the mouse isn't over a billboard. The billboards shown for
                    // editing have their own tooltips and we want to show those instead.
                    if (!isBillboard) {
                        tooltip.showAt(position, 'Click to add first point');
                    }
                }
                else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        positions.pop();
                        // make sure it is slightly different
                        cartesian.y += 1 + Math.random();
                        positions.push(cartesian);
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        // update marker
                        markers.getBillboard(positions.length - 1).position = cartesian;
                        // show tooltip
                        tooltip.showAt(position, "Click to add new point (".concat(positions.length, ")\n               ").concat(positions.length >= minPoints
                            ? '<br>Double click to finish drawing'
                            : ''));
                        if (isPolygon && positions.length === 2) {
                            // Request a render so the first polygon point will be displayed before the user
                            // has clicked the second point. After the user has clicked to create a point,
                            // the length of positions will be (# of points) + 1, because the last point is
                            // wherever the mouse is. Renders will always happen on mouse movement when
                            // positions.length is greater than 2, due to _createPrimitive being enabled above.
                            scene.requestRender();
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement) {
            var position = movement.position;
            if (position != null) {
                if (positions.length < minPoints + 2) {
                    return;
                }
                else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        _self.stopDrawing();
                        if (typeof options.callback == 'function') {
                            //https://github.com/leforthomas/cesium-drawhelper/issues/13
                            //need to remove last 2 positions since those are from finishing the drawing
                            options.callback(positions.slice(0, positions.length - 2));
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };
    function getExtentCorners(value) {
        return ellipsoid.cartographicArrayToCartesianArray([
            Cesium.Rectangle.northwest(value),
            Cesium.Rectangle.northeast(value),
            Cesium.Rectangle.southeast(value),
            Cesium.Rectangle.southwest(value),
        ]);
    }
    _.prototype.startDrawingExtent = function (options) {
        // eslint-disable-next-line no-redeclare
        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawing(function () {
            if (extent != null) {
                primitives.remove(extent);
            }
            markers === null || markers === void 0 ? void 0 : markers.remove();
            mouseHandler.destroy();
            tooltip.setVisible(false);
        });
        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var tooltip = this._tooltip;
        var firstPoint = null;
        var extent = null;
        var markers = null;
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        function updateExtent(value) {
            if (extent == null) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                extent = new DrawHelper.ExtentPrimitive(__assign(__assign({}, options), { extent: value }));
                extent.asynchronous = false;
                primitives.add(extent);
            }
            extent.extent = value;
            // update the markers
            var corners = getExtentCorners(value);
            // create if they do not yet exist
            if (markers == null) {
                // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                markers = new _.BillboardGroup(_self, defaultBillboard);
                markers.addBillboards(corners);
            }
            else {
                markers.updateBillboardsPositions(corners);
            }
        }
        // Now wait for start
        mouseHandler.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    if (extent == null) {
                        // If user clicks, they have started drawing, so disable editing
                        _self.disableAllEditMode();
                        // create the rectangle
                        firstPoint = ellipsoid.cartesianToCartographic(cartesian);
                        var value = getExtent(firstPoint, firstPoint);
                        updateExtent(value);
                    }
                    else {
                        _self.stopDrawing();
                        if (typeof options.callback == 'function') {
                            options.callback(getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian)));
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (extent == null) {
                    var feature = scene.pick(position);
                    var isBillboard = (feature === null || feature === void 0 ? void 0 : feature.primitive) && feature.primitive instanceof Cesium.Billboard;
                    // Show this tooltip only if the mouse isn't over a billboard. The billboards shown for
                    // editing have their own tooltips and we want to show those instead.
                    if (!isBillboard) {
                        tooltip.showAt(position, 'Click to start drawing rectangle');
                    }
                }
                else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        extent._createPrimitive = true;
                        var value = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
                        updateExtent(value);
                        tooltip.showAt(position, 'Drag to change rectangle extent<br>Click again to finish drawing');
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    _.prototype.startDrawingCircle = function (options) {
        // eslint-disable-next-line no-redeclare
        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawing(function cleanUp() {
            if (circle != null) {
                primitives.remove(circle);
            }
            markers === null || markers === void 0 ? void 0 : markers.remove();
            mouseHandler.destroy();
            tooltip.setVisible(false);
        });
        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var tooltip = this._tooltip;
        var circle = null;
        var markers = null;
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        // Now wait for start
        mouseHandler.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    if (circle == null) {
                        // If user clicks, they have started drawing, so disable editing
                        _self.disableAllEditMode();
                        // create the circle
                        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                        circle = new _.CirclePrimitive({
                            center: cartesian,
                            radius: 0,
                            asynchronous: false,
                            material: options.material,
                        });
                        primitives.add(circle);
                        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                        markers = new _.BillboardGroup(_self, defaultBillboard);
                        markers.addBillboards([cartesian]);
                    }
                    else {
                        if (typeof options.callback == 'function') {
                            options.callback(circle.getCenter(), circle.getRadius());
                        }
                        _self.stopDrawing();
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (circle == null) {
                    var feature = scene.pick(position);
                    var isBillboard = (feature === null || feature === void 0 ? void 0 : feature.primitive) && feature.primitive instanceof Cesium.Billboard;
                    // Show this tooltip only if the mouse isn't over a billboard. The billboards shown for
                    // editing have their own tooltips and we want to show those instead.
                    if (!isBillboard) {
                        tooltip.showAt(position, 'Click to start drawing the circle');
                    }
                }
                else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        circle.setRadius(Cesium.Cartesian3.distance(circle.getCenter(), cartesian));
                        markers.updateBillboardsPositions(cartesian);
                        tooltip.showAt(position, 'Move mouse to change circle radius<br>Click again to finish drawing');
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    _.prototype.enhancePrimitives = function () {
        var drawHelper = this;
        Cesium.Billboard.prototype.setEditable = function () {
            if (this._editable) {
                return;
            }
            this._editable = true;
            var billboard = this;
            var _self = this;
            function enableRotation(enable) {
                drawHelper._scene.screenSpaceCameraController.enableRotate = enable;
            }
            setListener(billboard, 'leftDown', function () {
                // TODO - start the drag handlers here
                // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                function onDrag(position) {
                    billboard.position = position;
                    _self.executeListeners({ name: 'drag', positions: position });
                }
                function onDragEnd(position) {
                    handler.destroy();
                    enableRotation(true);
                    _self.executeListeners({ name: 'dragEnd', positions: position });
                }
                var handler = new Cesium.ScreenSpaceEventHandler(drawHelper._scene.canvas);
                handler.setInputAction(function (movement) {
                    var cartesian = drawHelper._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                    if (cartesian) {
                        onDrag(cartesian);
                    }
                    else {
                        onDragEnd(cartesian);
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                handler.setInputAction(function (movement) {
                    onDragEnd(drawHelper._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                }, Cesium.ScreenSpaceEventType.LEFT_UP);
                enableRotation(false);
            });
            enhanceWithListeners(billboard);
        };
        function setHighlighted(highlighted) {
            // if no change
            // if already highlighted, the outline polygon will be available
            if (this._highlighted && this._highlighted == highlighted) {
                return;
            }
            // disable if already in edit mode
            if (this._editMode === true) {
                return;
            }
            this._highlighted = highlighted;
            // highlight by creating an outline polygon matching the polygon points
            if (highlighted) {
                // make sure all other shapes are not highlighted
                drawHelper.setHighlighted(this);
                this._strokeColor = this.strokeColor;
                this.setStrokeStyle(Cesium.Color.fromCssColorString('white'), this.strokeWidth);
            }
            else {
                if (this._strokeColor) {
                    this.setStrokeStyle(this._strokeColor, this.strokeWidth);
                }
                else {
                    this.setStrokeStyle(undefined, undefined);
                }
            }
        }
        function setEditMode(editMode) {
            // if no change
            if (this._editMode == editMode) {
                return;
            }
            // make sure all other shapes are not in edit mode before starting the editing of this shape
            drawHelper.disableAllHighlights();
            // display markers
            if (editMode) {
                drawHelper.setEdited(this);
                var _self_1 = this;
                // create the markers and handlers for the editing
                if (this._markers == null) {
                    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                    var markers_1 = new _.BillboardGroup(drawHelper, dragBillboard);
                    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                    var editMarkers_1 = new _.BillboardGroup(drawHelper, dragHalfBillboard);
                    // function for updating the edit markers around a certain point
                    // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
                    function updateHalfMarkers(index, positions) {
                        // update the half markers before and after the index
                        var editIndex = index - 1 < 0 ? positions.length - 1 : index - 1;
                        if (editIndex < editMarkers_1.countBillboards()) {
                            editMarkers_1.getBillboard(editIndex).position =
                                calculateHalfMarkerPosition(editIndex);
                        }
                        editIndex = index;
                        if (editIndex < editMarkers_1.countBillboards()) {
                            editMarkers_1.getBillboard(editIndex).position =
                                calculateHalfMarkerPosition(editIndex);
                        }
                    }
                    // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
                    function onEdited() {
                        _self_1.executeListeners({
                            name: 'onEdited',
                            positions: _self_1.positions,
                        });
                    }
                    var handleMarkerChanges_1 = {
                        dragHandlers: {
                            onDrag: function (index, position) {
                                _self_1.positions[index] = position;
                                updateHalfMarkers(index, _self_1.positions);
                                _self_1._createPrimitive = true;
                            },
                            onDragEnd: function () {
                                _self_1._createPrimitive = true;
                                onEdited();
                            },
                        },
                        onRightClick: function (index) {
                            // Need to count unique points because polygon-display adds the first point to the end.
                            var uniquePoints = lodash.uniqWith(_self_1.positions, Cesium.Cartesian3.equals).length;
                            var minPointsForRemoval = _self_1.isPolygon ? 4 : 3;
                            if (uniquePoints < minPointsForRemoval) {
                                return;
                            }
                            // remove the point and the corresponding markers
                            _self_1.positions.splice(index, 1);
                            _self_1._createPrimitive = true;
                            markers_1.removeBillboard(index);
                            editMarkers_1.removeBillboard(index);
                            updateHalfMarkers(index, _self_1.positions);
                            onEdited();
                            drawHelper._scene.requestRender();
                        },
                        tooltip: function () {
                            var msg = 'Drag to move';
                            // Need to count unique points because polygon-display adds the first point to the end.
                            var uniquePoints = lodash.uniqWith(_self_1.positions, Cesium.Cartesian3.equals).length;
                            var minPointsForRemoval = _self_1.isPolygon ? 4 : 3;
                            if (uniquePoints >= minPointsForRemoval) {
                                msg += '<br>Right click to remove';
                            }
                            return msg;
                        },
                    };
                    // add billboards and keep an ordered list of them for the polygon edges
                    markers_1.addBillboards(_self_1.positions, handleMarkerChanges_1);
                    this._markers = markers_1;
                    // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
                    function calculateHalfMarkerPosition(index) {
                        var positions = _self_1.positions;
                        return ellipsoid.cartographicToCartesian(new Cesium.EllipsoidGeodesic(ellipsoid.cartesianToCartographic(positions[index]), ellipsoid.cartesianToCartographic(positions[index < positions.length - 1 ? index + 1 : 0])).interpolateUsingFraction(0.5));
                    }
                    var halfPositions = [];
                    var index = 0;
                    var length_1 = _self_1.positions.length + (this.isPolygon ? 0 : -1);
                    for (; index < length_1; index++) {
                        halfPositions.push(calculateHalfMarkerPosition(index));
                    }
                    var handleEditMarkerChanges_1 = {
                        dragHandlers: {
                            onDragStart: function (index, position) {
                                // add a new position to the polygon but not a new marker yet
                                ;
                                this.index = index + 1;
                                _self_1.positions.splice(this.index, 0, position);
                                _self_1._createPrimitive = true;
                            },
                            onDrag: function (_index, position) {
                                _self_1.positions[this.index] = position;
                                _self_1._createPrimitive = true;
                            },
                            onDragEnd: function (_index, position) {
                                // create new sets of makers for editing
                                markers_1.insertBillboard(this.index, position, handleMarkerChanges_1);
                                editMarkers_1.getBillboard(this.index - 1).position =
                                    calculateHalfMarkerPosition(this.index - 1);
                                editMarkers_1.insertBillboard(this.index, calculateHalfMarkerPosition(this.index), handleEditMarkerChanges_1);
                                _self_1._createPrimitive = true;
                                onEdited();
                            },
                        },
                        tooltip: function () {
                            return 'Drag to create a new point';
                        },
                    };
                    editMarkers_1.addBillboards(halfPositions, handleEditMarkerChanges_1);
                    this._editMarkers = editMarkers_1;
                    // set on top of the polygon
                    markers_1.setOnTop();
                    editMarkers_1.setOnTop();
                }
                this._editMode = true;
            }
            else {
                if (this._markers != null) {
                    this._markers.remove();
                    this._editMarkers.remove();
                    this._markers = null;
                    this._editMarkers = null;
                }
                this._editMode = false;
            }
        }
        DrawHelper.PolylinePrimitive.prototype.setEditable = function () {
            if (this.setEditMode) {
                return;
            }
            var polyline = this;
            polyline.isPolygon = false;
            polyline.asynchronous = false;
            polyline.setEditMode = setEditMode;
            var originalWidth = this.width;
            polyline.setHighlighted = function (highlighted) {
                // disable if already in edit mode
                if (this._editMode === true) {
                    return;
                }
                if (highlighted) {
                    drawHelper.setHighlighted(this);
                    this.setWidth(originalWidth * 2);
                }
                else {
                    this.setWidth(originalWidth);
                }
            };
            polyline.getExtent = function () {
                return Cesium.Extent.fromCartographicArray(ellipsoid.cartesianArrayToCartographicArray(this.positions));
            };
            enhanceWithListeners(polyline);
            polyline.setEditMode(true);
        };
        DrawHelper.PolygonPrimitive.prototype.setEditable = function () {
            if (this.setEditMode) {
                return;
            }
            var polygon = this;
            polygon.asynchronous = false;
            polygon.setEditMode = setEditMode;
            polygon.setHighlighted = setHighlighted;
            enhanceWithListeners(polygon);
            polygon.setEditMode(true);
        };
        DrawHelper.ExtentPrimitive.prototype.setEditable = function () {
            if (this.setEditMode) {
                return;
            }
            var extent = this;
            extent.asynchronous = false;
            extent.setEditMode = function (editMode) {
                // if no change
                if (this._editMode == editMode) {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode) {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    // create the markers and handlers for the editing
                    if (this._markers == null) {
                        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                        var markers_2 = new _.BillboardGroup(drawHelper, dragBillboard);
                        // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
                        function onEdited() {
                            extent.executeListeners({
                                name: 'onEdited',
                                extent: extent.extent,
                            });
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function (index, position) {
                                    var corner = markers_2.getBillboard((index + 2) % 4).position;
                                    extent.setExtent(getExtent(ellipsoid.cartesianToCartographic(corner), ellipsoid.cartesianToCartographic(position)));
                                    markers_2.updateBillboardsPositions(getExtentCorners(extent.extent));
                                },
                                onDragEnd: function () {
                                    onEdited();
                                },
                            },
                            tooltip: function () {
                                return 'Drag to change the corners of this extent';
                            },
                        };
                        markers_2.addBillboards(getExtentCorners(extent.extent), handleMarkerChanges);
                        this._markers = markers_2;
                        markers_2.setOnTop();
                    }
                    this._editMode = true;
                }
                else {
                    if (this._markers != null) {
                        this._markers.remove();
                        this._markers = null;
                    }
                    this._editMode = false;
                }
            };
            extent.setHighlighted = setHighlighted;
            enhanceWithListeners(extent);
            extent.setEditMode(true);
        };
        _.EllipsePrimitive.prototype.setEditable = function () {
            if (this.setEditMode) {
                return;
            }
            var ellipse = this;
            var scene = drawHelper._scene;
            ellipse.asynchronous = false;
            drawHelper.registerEditableShape(ellipse);
            ellipse.setEditMode = function (editMode) {
                // if no change
                if (this._editMode == editMode) {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode) {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    var _self_2 = this;
                    // create the markers and handlers for the editing
                    if (this._markers == null) {
                        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                        var markers_3 = new _.BillboardGroup(drawHelper, dragBillboard);
                        // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
                        function getMarkerPositions() {
                            return Cesium.Shapes.computeEllipseBoundary(ellipsoid, ellipse.getCenter(), ellipse.getSemiMajorAxis(), ellipse.getSemiMinorAxis(), ellipse.getRotation() + Math.PI / 2, Math.PI / 2.0).splice(0, 4);
                        }
                        // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
                        function onEdited() {
                            ellipse.executeListeners({
                                name: 'onEdited',
                                center: ellipse.getCenter(),
                                semiMajorAxis: ellipse.getSemiMajorAxis(),
                                semiMinorAxis: ellipse.getSemiMinorAxis(),
                                rotation: 0,
                            });
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function (index, position) {
                                    var distance = Cesium.Cartesian3.distance(ellipse.getCenter(), position);
                                    if (index % 2 == 0) {
                                        ellipse.setSemiMajorAxis(distance);
                                    }
                                    else {
                                        ellipse.setSemiMinorAxis(distance);
                                    }
                                    markers_3.updateBillboardsPositions(getMarkerPositions());
                                },
                                onDragEnd: function () {
                                    onEdited();
                                },
                            },
                            tooltip: function () {
                                return 'Drag to change the excentricity and radius';
                            },
                        };
                        markers_3.addBillboards(getMarkerPositions(), handleMarkerChanges);
                        this._markers = markers_3;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(function (movement) {
                            var pickedObject = scene.pick(movement.position);
                            if (!(pickedObject && pickedObject.primitive)) {
                                _self_2.setEditMode(false);
                            }
                        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        // set on top of the polygon
                        markers_3.setOnTop();
                    }
                    this._editMode = true;
                }
                else {
                    if (this._markers != null) {
                        this._markers.remove();
                        this._markers = null;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            };
            ellipse.setHighlighted = setHighlighted;
            enhanceWithListeners(ellipse);
            ellipse.setEditMode(false);
        };
        _.CirclePrimitive.prototype.getCircleCartesianCoordinates = function (granularity) {
            var geometry = Cesium.CircleOutlineGeometry.createGeometry(new Cesium.CircleOutlineGeometry({
                ellipsoid: ellipsoid,
                center: this.getCenter(),
                radius: this.getRadius(),
                granularity: granularity,
            }));
            var count = 0, value, values = [];
            for (; count < geometry.attributes.position.values.length; count += 3) {
                value = geometry.attributes.position.values;
                values.push(new Cesium.Cartesian3(value[count], value[count + 1], value[count + 2]));
            }
            return values;
        };
        _.CirclePrimitive.prototype.setEditable = function () {
            if (this.setEditMode) {
                return;
            }
            var circle = this;
            circle.asynchronous = false;
            circle.setEditMode = function (editMode) {
                // if no change
                if (this._editMode == editMode) {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode) {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    var _self_3 = this;
                    // create the markers and handlers for the editing
                    if (this._markers == null) {
                        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                        var markers_4 = new _.BillboardGroup(drawHelper, dragBillboard);
                        // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
                        function getMarkerPositions() {
                            return _self_3.getCircleCartesianCoordinates(Cesium.Math.PI_OVER_TWO);
                        }
                        // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
                        function onEdited() {
                            circle.executeListeners({
                                name: 'onEdited',
                                center: circle.getCenter(),
                                radius: circle.getRadius(),
                            });
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function (_index, position) {
                                    circle.setRadius(Cesium.Cartesian3.distance(circle.getCenter(), position));
                                    markers_4.updateBillboardsPositions(getMarkerPositions());
                                },
                                onDragEnd: function () {
                                    onEdited();
                                },
                            },
                            tooltip: function () {
                                return 'Drag to change the radius';
                            },
                        };
                        markers_4.addBillboards(getMarkerPositions(), handleMarkerChanges);
                        this._markers = markers_4;
                        markers_4.setOnTop();
                    }
                    this._editMode = true;
                }
                else {
                    if (this._markers != null) {
                        this._markers.remove();
                        this._markers = null;
                    }
                    this._editMode = false;
                }
            };
            circle.setHighlighted = setHighlighted;
            enhanceWithListeners(circle);
            circle.setEditMode(true);
        };
    };
    _.DrawHelperWidget = (function () {
        // constructor
        // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
        function _(drawHelper, options) {
            // container must be specified
            if (!Cesium.defined(options.container)) {
                throw new Cesium.DeveloperError('Container is required');
            }
            var drawOptions = {
                markerIcon: './img/glyphicons_242_google_maps.png',
                polylineIcon: './img/glyphicons_097_vector_path_line.png',
                polygonIcon: './img/glyphicons_096_vector_path_polygon.png',
                circleIcon: './img/glyphicons_095_vector_path_circle.png',
                extentIcon: './img/glyphicons_094_vector_path_square.png',
                clearIcon: './img/glyphicons_067_cleaning.png',
                polylineDrawingOptions: defaultPolylineOptions,
                polygonDrawingOptions: defaultPolygonOptions,
                extentDrawingOptions: defaultExtentOptions,
                circleDrawingOptions: defaultCircleOptions,
            };
            fillOptions(options, drawOptions);
            var _self = this;
            var toolbar = document.createElement('DIV');
            toolbar.className = 'toolbar';
            options.container.appendChild(toolbar);
            function addIcon(_id, url, title, callback) {
                var div = document.createElement('DIV');
                div.className = 'button';
                div.title = title;
                toolbar.appendChild(div);
                div.onclick = callback;
                var span = document.createElement('SPAN');
                div.appendChild(span);
                var image = document.createElement('IMG');
                image.src = url;
                span.appendChild(image);
                return div;
            }
            var scene = drawHelper._scene;
            addIcon('marker', options.markerIcon, 'Click to start drawing a 2D marker', function () {
                drawHelper.startDrawingMarker({
                    callback: function (position) {
                        _self.executeListeners({
                            name: 'markerCreated',
                            position: position,
                        });
                    },
                });
            });
            addIcon('polyline', options.polylineIcon, 'Click to start drawing a 2D polyline', function () {
                drawHelper.startDrawingPolyline({
                    callback: function (positions) {
                        _self.executeListeners({
                            name: 'polylineCreated',
                            positions: positions,
                        });
                    },
                });
            });
            addIcon('polygon', options.polygonIcon, 'Click to start drawing a 2D polygon', function () {
                drawHelper.startDrawingPolygon({
                    callback: function (positions) {
                        _self.executeListeners({
                            name: 'polygonCreated',
                            positions: positions,
                        });
                    },
                });
            });
            addIcon('extent', options.extentIcon, 'Click to start drawing an Extent', function () {
                drawHelper.startDrawingExtent({
                    callback: function (extent) {
                        _self.executeListeners({ name: 'extentCreated', extent: extent });
                    },
                });
            });
            addIcon('circle', options.circleIcon, 'Click to start drawing a Circle', function () {
                drawHelper.startDrawingCircle({
                    callback: function (center, radius) {
                        _self.executeListeners({
                            name: 'circleCreated',
                            center: center,
                            radius: radius,
                        });
                    },
                });
            });
            // add a clear button at the end
            // add a divider first
            var div = document.createElement('DIV');
            div.className = 'divider';
            toolbar.appendChild(div);
            addIcon('clear', options.clearIcon, 'Remove all primitives', function () {
                scene.primitives.removeAll();
            });
            enhanceWithListeners(this);
        }
        return _;
    })();
    _.prototype.addToolbar = function (container, options) {
        options = copyOptions(options, { container: container });
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        return new _.DrawHelperWidget(this, options);
    };
    function getExtent(mn, mx) {
        var e = new Cesium.Rectangle();
        // Re-order so west < east and south < north
        e.west = Math.min(mn.longitude, mx.longitude);
        e.east = Math.max(mn.longitude, mx.longitude);
        e.south = Math.min(mn.latitude, mx.latitude);
        e.north = Math.max(mn.latitude, mx.latitude);
        // Check for approx equal (shouldn't require abs due to re-order)
        var epsilon = Cesium.Math.EPSILON7;
        if (e.east - e.west < epsilon) {
            e.east += epsilon * 2.0;
        }
        if (e.north - e.south < epsilon) {
            e.north += epsilon * 2.0;
        }
        return e;
    }
    function createTooltip(frameDiv) {
        // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
        var tooltip = function (frameDiv) {
            var div = document.createElement('DIV');
            div.className = 'twipsy right pointer-events-none';
            var arrow = document.createElement('DIV');
            arrow.className = 'twipsy-arrow';
            div.appendChild(arrow);
            var title = document.createElement('DIV');
            title.className = 'twipsy-inner';
            div.appendChild(title);
            this._div = div;
            this._title = title;
            // add to frame div and display coordinates
            frameDiv.appendChild(div);
        };
        tooltip.prototype.setVisible = function (visible) {
            this._div.style.display = visible ? 'block' : 'none';
        };
        tooltip.prototype.showAt = function (position, message) {
            if (position && message) {
                this.setVisible(true);
                this._title.innerHTML = message;
                this._div.style.left = position.x + 15 + 'px';
                this._div.style.top = position.y + 7 - this._div.clientHeight / 2 + 'px';
            }
        };
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        return new tooltip(frameDiv);
    }
    function getDisplayLatLngString(cartographic, precision) {
        return (cartographic.longitude.toFixed(precision || 3) +
            ', ' +
            cartographic.latitude.toFixed(precision || 3));
    }
    function clone(from, to) {
        if (from == null || typeof from != 'object')
            return from;
        if (from.constructor != Object && from.constructor != Array)
            return from;
        if (from.constructor == Date ||
            from.constructor == RegExp ||
            from.constructor == Function ||
            from.constructor == String ||
            from.constructor == Number ||
            from.constructor == Boolean)
            return new from.constructor(from);
        to = to || new from.constructor();
        for (var name_1 in from) {
            to[name_1] =
                typeof to[name_1] == 'undefined' ? clone(from[name_1], null) : to[name_1];
        }
        return to;
    }
    function fillOptions(options, defaultOptions) {
        options = options || {};
        var option;
        for (option in defaultOptions) {
            if (options[option] === undefined) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                options[option] = clone(defaultOptions[option]);
            }
        }
    }
    // shallow copy
    function copyOptions(options, defaultOptions) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        var newOptions = clone(options), option;
        for (option in defaultOptions) {
            if (newOptions[option] === undefined) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                newOptions[option] = clone(defaultOptions[option]);
            }
        }
        return newOptions;
    }
    function setListener(primitive, type, callback) {
        primitive[type] = callback;
    }
    function enhanceWithListeners(element) {
        element._listeners = {};
        element.addListener = function (name, callback) {
            this._listeners[name] = this._listeners[name] || [];
            this._listeners[name].push(callback);
            return this._listeners[name].length;
        };
        element.executeListeners = function (event, defaultCallback) {
            if (this._listeners[event.name] &&
                this._listeners[event.name].length > 0) {
                var index = 0;
                for (; index < this._listeners[event.name].length; index++) {
                    this._listeners[event.name][index](event);
                }
            }
            else {
                if (defaultCallback) {
                    defaultCallback(event);
                }
            }
        };
    }
    return _;
})();
export default DrawHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhd0hlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9saWIvY2VzaXVtLWRyYXdoZWxwZXIvRHJhd0hlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKOzs7Ozs7OztHQVFHO0FBQ0gsb0JBQW9CO0FBQ3BCLG1KQUFtSjtBQUNuSixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUMvQyxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksQ0FBQTtBQUNsQyxPQUFPLE9BQU8sTUFBTSxtREFBbUQsQ0FBQTtBQUN2RSxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxXQUFXLE1BQU0sOEJBQThCLENBQUE7QUFDdEQsT0FBTyxTQUFTLE1BQU0sMkJBQTJCLENBQUE7QUFDakQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sd0RBQXdELENBQUE7QUFDekYsOERBQThEO0FBQzlELElBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQTtBQUNoQixJQUFNLFVBQVUsR0FBRyxDQUFDO0lBQ2xCLG1CQUFtQjtJQUNuQixJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQTtJQUN4QyxjQUFjO0lBQ2QsU0FBUyxDQUFDLENBQVksWUFBaUI7UUFDckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFBO1FBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNyRCxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQTtRQUNuQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtRQUN6QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtJQUMxQixDQUFDO0lBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRztRQUMvQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQ3pCLGVBQWU7UUFDZixJQUFNLE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDaEUsU0FBUyxxQkFBcUIsQ0FBQyxJQUFTLEVBQUUsUUFBYTtZQUNyRCxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ3pDLElBQ0UsWUFBWTtnQkFDWixZQUFZLENBQUMsU0FBUztnQkFDdEIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDNUI7Z0JBQ0EsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQTthQUN2QztRQUNILENBQUM7UUFDRCxPQUFPLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUNuQyxxQkFBcUIsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3ZELENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDMUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxVQUFDLFFBQWE7WUFDbkMscUJBQXFCLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzdELENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUNqRCxPQUFPLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUNuQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3hELENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDM0MsSUFBSSxjQUFtQixDQUFBO1FBQ3ZCLE9BQU8sQ0FBQyxjQUFjLENBQUMsVUFBQyxRQUFhO1lBQ25DLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQ25ELElBQ0UsY0FBYztnQkFDZCxDQUFDLENBQUMsWUFBWSxJQUFJLGNBQWMsSUFBSSxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQzNEO2dCQUNBLENBQUMsQ0FBQyxjQUFjLENBQUMsV0FBVyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDM0QsY0FBYyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUE7Z0JBQy9DLGNBQWMsR0FBRyxJQUFJLENBQUE7YUFDdEI7WUFDRCxJQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFO2dCQUMxQyxZQUFZLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQTtnQkFDckMsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFO29CQUN6QixjQUFjLEdBQUcsWUFBWSxDQUFBO2lCQUM5QjtnQkFDRCxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUU7b0JBQzFCLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFBO2lCQUM3QzthQUNGO1FBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUMxQyxPQUFPLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUNuQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3BELENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDdkMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxVQUFDLFFBQWE7WUFDbkMscUJBQXFCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN0RCxDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQzNDLENBQUMsQ0FBQTtJQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQ3hCLFNBQWMsRUFDZCxJQUFTLEVBQ1QsUUFBYTtRQUViLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUE7SUFDNUIsQ0FBQyxDQUFBO0lBQ0QsZ0RBQWdEO0lBQ2hELHdEQUF3RDtJQUN4RCxDQUFDLENBQUMsU0FBUyxDQUFDLHFCQUFxQixHQUFHLFVBQVUsT0FBWTtRQUN4RCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUE7UUFDbEIsNEJBQTRCO1FBQzVCLDJDQUEyQztRQUMzQyxXQUFXLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFDLFFBQWE7WUFDOUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtnQkFDdEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLDBCQUEwQixDQUFDLENBQUE7YUFDNUQ7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNGLDBEQUEwRDtRQUMxRCxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRTtZQUMvQixPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQzdCLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQyxDQUFBO1FBQ0YsV0FBVyxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUU7WUFDaEMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMzQixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQTtJQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsT0FBWTtRQUMvQywwQkFBMEI7UUFDMUIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtTQUNuQjtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFBO0lBQzVCLENBQUMsQ0FBQTtJQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHO1FBQ3hCLDBCQUEwQjtRQUMxQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1lBQ2xCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO1NBQ3hCO0lBQ0gsQ0FBQyxDQUFBO0lBQ0Qsb0RBQW9EO0lBQ3BELENBQUMsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEdBQUc7UUFDakMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNoQyxDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFVLE9BQVk7UUFDakQsSUFDRSxJQUFJLENBQUMsbUJBQW1CO1lBQ3hCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRTtZQUN2QyxJQUFJLENBQUMsbUJBQW1CLElBQUksT0FBTyxFQUNuQztZQUNBLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7U0FDL0M7UUFDRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFBO0lBQ3BDLENBQUMsQ0FBQTtJQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEdBQUc7UUFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUMzQixDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFVLE9BQVk7UUFDNUMsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUM3RCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUN2QztRQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFBO0lBQy9CLENBQUMsQ0FBQTtJQUNELElBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDcEUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQzlELElBQU0sbUJBQW1CLEdBQUc7UUFDMUIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSztRQUNqQyxvQkFBb0IsRUFBRSxHQUFHO1FBQ3pCLE1BQU0sRUFBRSxHQUFHO1FBQ1gsWUFBWSxFQUFFLElBQUk7UUFDbEIsSUFBSSxFQUFFLElBQUk7UUFDVix1QkFBdUIsRUFBRSxLQUFLO0tBQy9CLENBQUE7SUFDRCxJQUFJLHFCQUFxQixHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRTtRQUMzRCxVQUFVLEVBQUUsSUFBSSxNQUFNLENBQUMsMEJBQTBCLENBQUM7WUFDaEQsV0FBVyxFQUFFLEtBQUs7U0FDbkIsQ0FBQztRQUNGLFFBQVEsVUFBQTtRQUNSLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUs7S0FDN0IsQ0FBQyxDQUFBO0lBQ0YsSUFBSSxxQkFBcUIsR0FBRyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDaEUsSUFBSSxvQkFBb0IsR0FBRyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDL0QsSUFBSSxvQkFBb0IsR0FBRyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDL0QsSUFBSSxxQkFBcUIsR0FBRyxXQUFXLENBQUMscUJBQXFCLEVBQUU7UUFDN0QsUUFBUSxFQUFFLENBQUM7S0FDWixDQUFDLENBQUE7SUFDRixJQUFJLHNCQUFzQixHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRTtRQUM1RCxLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxJQUFJO1FBQ2QsV0FBVyxFQUFFLEtBQUs7UUFDbEIsVUFBVSxFQUFFLElBQUksTUFBTSxDQUFDLDBCQUEwQixDQUFDO1lBQ2hELFdBQVcsRUFBRSxLQUFLO1NBQ25CLENBQUM7UUFDRixRQUFRLFVBQUE7S0FDVCxDQUFDLENBQUE7SUFDRiwrREFBK0Q7SUFDL0QsRUFBRTtJQUNGLHlEQUF5RDtJQUN6RCxFQUFFO0lBQ0YsSUFBTSxtQkFBbUIsR0FBRyxDQUFDO1FBQzNCLFNBQVMsQ0FBQyxLQUFJLENBQUM7UUFDZixDQUFDLENBQUMsU0FBUyxDQUFDLGlCQUFpQixHQUFHLFVBQVUsT0FBWTtZQUNwRCxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1lBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFBO1lBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFBO1lBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFBO1lBQ3hCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxTQUFTLENBQUE7WUFDdEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUE7WUFDcEIsNENBQTRDO1lBQzVDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7WUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUE7WUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUE7UUFDbEMsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxJQUFTLEVBQUUsS0FBVTtZQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFBO1lBQ2xCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7UUFDOUIsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxJQUFTO1lBQzVDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ25CLENBQUMsQ0FBQTtRQUNEOztXQUVHO1FBQ0gsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFDbkIsT0FBWSxFQUNaLFVBQWUsRUFDZixXQUFnQjtZQUVoQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7YUFDbkU7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7YUFDbEU7WUFDRCxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxFQUFFO2dCQUMxQixNQUFNLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FDN0IsMkVBQTJFLENBQzVFLENBQUE7YUFDRjtZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNkLE9BQU07YUFDUDtZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDOUQsaUNBQWlDO2dCQUNqQyxPQUFNO2FBQ1A7WUFDRCxJQUNFLElBQUksQ0FBQyxnQkFBZ0I7Z0JBQ3JCLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLFNBQVM7Z0JBQ2xDLElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLFdBQVc7Z0JBQ3RDLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE1BQU07Z0JBQzVCLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxJQUFJLENBQUMsb0JBQW9CO2dCQUN4RCxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxFQUFFLEVBQ3BCO2dCQUNBLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtnQkFDbkMsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDYixPQUFNO2lCQUNQO2dCQUNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUE7Z0JBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQTtnQkFDaEMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFBO2dCQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7Z0JBQzFCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUE7Z0JBQ3RELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQTtnQkFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7Z0JBQzlELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDO29CQUNyQyxpQkFBaUIsRUFBRSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQzt3QkFDN0MsUUFBUSxVQUFBO3dCQUNSLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFDWCxhQUFhLEVBQUUsSUFBSTtxQkFDcEIsQ0FBQztvQkFDRixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7b0JBQzNCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtpQkFDaEMsQ0FBQyxDQUFBO2dCQUNGLElBQUksQ0FBQyxlQUFlO29CQUNsQixJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUE7Z0JBQ3hELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7b0JBQzFDLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO29CQUNqRCxJQUFJLGVBQWUsRUFBRTt3QkFDbkIsZ0NBQWdDO3dCQUNoQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQzs0QkFDMUMsaUJBQWlCLEVBQUUsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7Z0NBQzdDLFFBQVEsRUFBRSxlQUFlO2dDQUN6QixVQUFVLEVBQUU7b0NBQ1YsS0FBSyxFQUFFLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLENBQ3BELE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FDbEQ7aUNBQ0Y7NkJBQ0YsQ0FBQzs0QkFDRixVQUFVLEVBQUUsSUFBSSxNQUFNLENBQUMsMEJBQTBCLENBQUM7Z0NBQ2hELFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUU7b0NBQzFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDO2lDQUN6RCxDQUFDOzZCQUNILENBQUM7eUJBQ0gsQ0FBQyxDQUFBO3FCQUNIO2lCQUNGO2FBQ0Y7WUFDRCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFBO1lBQ2pDLFNBQVMsQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7WUFDN0MsU0FBUyxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQTtZQUNoRSxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUE7WUFDbEQsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFBO2FBQzlEO1FBQ0gsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUc7WUFDeEIsT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRztZQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUM5RCxPQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDbkMsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBVSxXQUFnQixFQUFFLFdBQWdCO1lBQ3ZFLElBQ0UsQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDakIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxFQUMvQjtnQkFDQSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO2dCQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTtnQkFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7YUFDL0I7UUFDSCxDQUFDLENBQUE7UUFDRCxPQUFPLENBQUMsQ0FBQTtJQUNWLENBQUMsQ0FBQyxFQUFFLENBQUE7SUFDSixDQUFDLENBQUMsZUFBZSxHQUFHLENBQUM7UUFDbkIsd0VBQXdFO1FBQ3hFLFNBQVMsQ0FBQyxDQUF1QixPQUFZO1lBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDbkMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQTthQUN0RDtZQUNELE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUE7WUFDckQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2hDLENBQUM7UUFDRCxtSkFBbUo7UUFDbkosQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUE7UUFDdkMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxNQUFXO1lBQzNDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3JDLENBQUMsQ0FBQTtRQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNwQyxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRztZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2hDLE9BQU07YUFDUDtZQUNELElBQU0sU0FBUyxHQUFHO2dCQUNoQixNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDbEUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ2xFLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNsRSxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDbEUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7YUFDbkUsQ0FBQTtZQUNELHVGQUF1RjtZQUN2Riw4REFBOEQ7WUFDOUQsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQztnQkFDMUMsU0FBUyxXQUFBO2dCQUNULE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbkIsVUFBVSxFQUFFLElBQUksQ0FBQyxvQkFBb0I7Z0JBQ3JDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDekIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO2FBQzlCLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQTtRQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEdBQUc7WUFDL0IsT0FBTyxJQUFJLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQztnQkFDekMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3ZCLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQTtRQUNELE9BQU8sQ0FBQyxDQUFBO0lBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUNKLENBQUMsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDO1FBQ3BCLHdFQUF3RTtRQUN4RSxTQUFTLENBQUMsQ0FBdUIsT0FBWTtZQUMzQyxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFBO1lBQ3JELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtRQUN2QixDQUFDO1FBQ0QsbUpBQW1KO1FBQ25KLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFBO1FBQ3ZDLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsU0FBYztZQUNqRCxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUMzQyxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRztZQUN6QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDdkMsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUc7WUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDaEUsT0FBTTthQUNQO1lBQ0QsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQztnQkFDMUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ25CLFVBQVUsRUFBRSxJQUFJLENBQUMsb0JBQW9CO2dCQUNyQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3pCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVzthQUM5QixDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHO1lBQy9CLElBQ0UsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ3pCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFDWjtnQkFDQSxPQUFNO2FBQ1A7WUFDRCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEdBQXNCO2dCQUM1RCxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDM0QsT0FBTztvQkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDO29CQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO29CQUM1QyxZQUFZLENBQUMsUUFBUTtpQkFDdEIsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFBO1lBRUYsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7WUFDbkQsT0FBTyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQTtZQUV4QyxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUNqQyxlQUFlLEVBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUN4QjtnQkFDRSxLQUFLLEVBQUUsUUFBUTthQUNoQixDQUNGLENBQUE7WUFDRCxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUNwQixPQUFNO2FBQ1A7WUFDRCx1R0FBdUc7WUFDdkcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQTtZQUN4QyxJQUFNLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FDbEUsVUFBQyxLQUFLLElBQUssT0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUEzRCxDQUEyRCxDQUN2RSxDQUFBO1lBQ0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDakMsU0FBUyxFQUFFLGdCQUFnQjtnQkFDM0IsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUs7Z0JBQ3RDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUzthQUMxQixDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7UUFDRCxPQUFPLENBQUMsQ0FBQTtJQUNWLENBQUMsQ0FBQyxFQUFFLENBQUE7SUFDSixDQUFDLENBQUMsZUFBZSxHQUFHLENBQUM7UUFDbkIsd0VBQXdFO1FBQ3hFLFNBQVMsQ0FBQyxDQUF1QixPQUFZO1lBQzNDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZFLE1BQU0sSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7YUFDbEU7WUFDRCxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFBO1lBQ3JELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNoQyxDQUFDO1FBQ0QsbUpBQW1KO1FBQ25KLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFBO1FBQ3ZDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVUsTUFBVztZQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNyQyxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFVLE1BQVc7WUFDM0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtRQUNwRCxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRztZQUN0QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDcEMsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUc7WUFDdEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3BDLENBQUMsQ0FBQTtRQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHO1lBQ3hCLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pFLE9BQU07YUFDUDtZQUNELE9BQU8sSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDO2dCQUMvQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ25CLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNuQixVQUFVLEVBQUUsSUFBSSxDQUFDLG9CQUFvQjtnQkFDckMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6QixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDOUIsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRztZQUMvQixPQUFPLElBQUksTUFBTSxDQUFDLHFCQUFxQixDQUFDO2dCQUN0QyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7YUFDekIsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO1FBQ0QsT0FBTyxDQUFDLENBQUE7SUFDVixDQUFDLENBQUMsRUFBRSxDQUFBO0lBQ0osQ0FBQyxDQUFDLGdCQUFnQixHQUFHLENBQUM7UUFDcEIsU0FBUyxDQUFDLENBQVksT0FBWTtZQUNoQyxJQUNFLENBQUMsQ0FDQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztnQkFDckMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQ3RDLEVBQ0Q7Z0JBQ0EsTUFBTSxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQzdCLHdEQUF3RCxDQUN6RCxDQUFBO2FBQ0Y7WUFDRCxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFBO1lBQ3JELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNqQyxDQUFDO1FBQ0QsbUpBQW1KO1FBQ25KLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFBO1FBQ3ZDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVUsTUFBVztZQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNyQyxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsYUFBa0I7WUFDekQsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUFFLE9BQU07WUFDbkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUE7UUFDbkQsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLGFBQWtCO1lBQ3pELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFBRSxPQUFNO1lBQ25ELElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQ25ELENBQUMsQ0FBQTtRQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsUUFBYTtZQUMvQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ2hELENBQUMsQ0FBQTtRQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNwQyxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHO1lBQzdCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQTtRQUMzQyxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHO1lBQzdCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQTtRQUMzQyxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRztZQUN4QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDdEMsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUc7WUFDeEIsSUFDRSxDQUFDLENBQ0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2xDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUNuQyxFQUNEO2dCQUNBLE9BQU07YUFDUDtZQUNELE9BQU8sSUFBSSxNQUFNLENBQUMsZUFBZSxDQUFDO2dCQUNoQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbkIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO2dCQUNqQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7Z0JBQ2pDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDdkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNuQixZQUFZLEVBQUUsTUFBTSxDQUFDLDBCQUEwQixDQUFDLGFBQWE7Z0JBQzdELFVBQVUsRUFBRSxJQUFJLENBQUMsb0JBQW9CO2dCQUNyQyxtSkFBbUo7Z0JBQ25KLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDekIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO2FBQzlCLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQTtRQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEdBQUc7WUFDL0IsT0FBTyxJQUFJLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQztnQkFDdkMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3hCLGFBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3RDLGFBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3RDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO2FBQzdCLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQTtRQUNELE9BQU8sQ0FBQyxDQUFBO0lBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUNKLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxDQUFDO1FBQ3JCLFNBQVMsQ0FBQyxDQUFZLE9BQVk7WUFDaEMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtZQUN0RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDakMsQ0FBQztRQUNELG1KQUFtSjtRQUNuSixDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQTtRQUN2QyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLFNBQWM7WUFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDM0MsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxLQUFVO1lBQ3pDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ25DLENBQUMsQ0FBQTtRQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsUUFBYTtZQUMvQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN6QyxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRztZQUN6QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDdkMsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUc7WUFDckIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ25DLENBQUMsQ0FBQTtRQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUN0QyxDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRztZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNoRSxPQUFNO2FBQ1A7WUFDRCxPQUFPLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDO2dCQUNqQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLO2dCQUN0QyxZQUFZLEVBQUUsTUFBTSxDQUFDLDBCQUEwQixDQUFDLGFBQWE7Z0JBQzdELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUzthQUMxQixDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHO1lBQy9CLElBQ0UsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ3pCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFDWjtnQkFDQSxPQUFNO2FBQ1A7WUFDRCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEdBQXNCO2dCQUM1RCxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDM0QsT0FBTztvQkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDO29CQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO29CQUM1QyxZQUFZLENBQUMsUUFBUTtpQkFDdEIsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFBO1lBQ0YsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUM3QyxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ2pDLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDbkUsS0FBSyxFQUFFLFFBQVE7YUFDaEIsQ0FBQyxDQUFBO1lBQ0YsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDakIsT0FBTTthQUNQO1lBQ0QsdUdBQXVHO1lBQ3ZHLE9BQU8sQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUE7WUFDckMsSUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQy9ELFVBQUMsS0FBSyxJQUFLLE9BQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBM0QsQ0FBMkQsQ0FDdkUsQ0FBQTtZQUNELE9BQU8sSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ2pDLFNBQVMsRUFBRSxnQkFBZ0I7Z0JBQzNCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLO2dCQUN0QyxZQUFZLEVBQUUsTUFBTSxDQUFDLDBCQUEwQixDQUFDLGFBQWE7Z0JBQzdELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUzthQUMxQixDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7UUFDRCxPQUFPLENBQUMsQ0FBQTtJQUNWLENBQUMsQ0FBQyxFQUFFLENBQUE7SUFDSjs7Ozs7Ozs7Ozs7O01BWUU7SUFDRixJQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFBO0lBQy9CLFdBQVcsQ0FBQyxHQUFHLEdBQUcsb0NBQTZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUUsQ0FBQTtJQUN2RSxJQUFNLGFBQWEsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFBO0lBQ2pDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsb0NBQTZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUUsQ0FBQTtJQUMzRSxJQUFNLGdCQUFnQixHQUFHO1FBQ3ZCLEtBQUssRUFBRSxXQUFXO1FBQ2xCLE1BQU0sRUFBRSxDQUFDO1FBQ1QsTUFBTSxFQUFFLENBQUM7S0FDVixDQUFBO0lBQ0QsSUFBTSxhQUFhLEdBQUc7UUFDcEIsS0FBSyxFQUFFLFdBQVc7UUFDbEIsTUFBTSxFQUFFLENBQUM7UUFDVCxNQUFNLEVBQUUsQ0FBQztLQUNWLENBQUE7SUFDRCxJQUFNLGlCQUFpQixHQUFHO1FBQ3hCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxDQUFDO1FBQ1QsTUFBTSxFQUFFLENBQUM7S0FDVixDQUFBO0lBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxVQUNqQyxNQUFXLEVBQ1gsT0FBWSxFQUNaLFNBQWM7UUFFZCxtSkFBbUo7UUFDbkosSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNuRCxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUN4QyxPQUFPLE9BQU8sQ0FBQTtJQUNoQixDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsY0FBYyxHQUFHLFVBQVUsVUFBZSxFQUFFLE9BQVk7UUFDeEQsQ0FBQztRQUFDLElBQVksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUN0QztRQUFDLElBQVksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FDeEM7UUFBQyxJQUFZLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtRQUNoRSw0REFBNEQ7UUFDNUQsSUFBTSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FDekM7UUFBQyxJQUFZLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQ3RDO1FBQUMsSUFBWSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBRTdCO1FBQUMsSUFBWSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQTtJQUN4QyxDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFDM0MsUUFBYSxFQUNiLFNBQWM7UUFFZCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztZQUNyQyxJQUFJLEVBQUUsSUFBSTtZQUNWLFFBQVEsVUFBQTtZQUNSLFdBQVcsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDckI7WUFDRCxTQUFTLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQy9DLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNO1lBQ2hELGNBQWMsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU07WUFDNUMsS0FBSyxFQUFFLEdBQUc7WUFDVixLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQzFCLEtBQUssRUFBRSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1NBQzVDLENBQUMsQ0FBQTtRQUNGLGNBQWM7UUFDZCxJQUFJLFNBQVMsRUFBRTtZQUNiLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQTtZQUNoQixJQUFNLDZCQUEyQixHQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFBO1lBQ3pDLG1KQUFtSjtZQUNuSixTQUFTLGNBQWMsQ0FBQyxNQUFXO2dCQUNqQyw2QkFBMkIsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFBO1lBQ25ELENBQUM7WUFDRCxtSkFBbUo7WUFDbkosU0FBUyxRQUFRO2dCQUNmLGFBQWE7Z0JBQ2IsS0FDRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQzlDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsRUFDakQsRUFBRSxDQUFDO29CQUNKLENBQUM7Z0JBQ0YsT0FBTyxDQUFDLENBQUE7WUFDVixDQUFDO1lBQ0QsSUFBSSxTQUFTLENBQUMsWUFBWSxFQUFFO2dCQUMxQix3Q0FBd0M7Z0JBQ3hDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQTtnQkFDaEIsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBQyxRQUFhO29CQUMvQyxzQ0FBc0M7b0JBQ3RDLDRFQUE0RTtvQkFDNUUsU0FBUyxNQUFNLENBQUMsUUFBYTt3QkFDM0IsU0FBUyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7d0JBQzdCLGFBQWE7d0JBQ2IsS0FDRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQzlDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsRUFDakQsRUFBRSxDQUFDOzRCQUNKLENBQUM7d0JBQ0YsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNOzRCQUMzQixTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQTtvQkFDdkQsQ0FBQztvQkFDRCxTQUFTLFNBQVMsQ0FBQyxRQUFhO3dCQUM5QixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7d0JBQ2pCLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDcEIsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTOzRCQUM5QixTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQTtvQkFDMUQsQ0FBQztvQkFDRCxJQUFJLE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO29CQUNyRSxPQUFPLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTt3QkFDbkMsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUNqRCxRQUFRLENBQUMsV0FBVyxFQUNwQixTQUFTLENBQ1YsQ0FBQTt3QkFDRCxJQUFJLFNBQVMsRUFBRTs0QkFDYixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7eUJBQ2xCOzZCQUFNOzRCQUNMLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQTt5QkFDckI7b0JBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtvQkFDMUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxVQUFDLFFBQWE7d0JBQ25DLFNBQVMsQ0FDUCxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FDaEUsQ0FBQTtvQkFDSCxDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFBO29CQUN2QyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ3JCLFNBQVMsQ0FBQyxZQUFZLENBQUMsV0FBVzt3QkFDaEMsU0FBUyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQ2hDLFFBQVEsRUFBRSxFQUNWLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQ3ZELENBQUE7Z0JBQ0wsQ0FBQyxDQUFDLENBQUE7YUFDSDtZQUNELElBQUksU0FBUyxDQUFDLFlBQVksRUFBRTtnQkFDMUIsV0FBVyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUU7b0JBQ25DLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtnQkFDcEMsQ0FBQyxDQUFDLENBQUE7YUFDSDtZQUNELElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtnQkFDckIsV0FBVyxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUU7b0JBQ2xDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtnQkFDL0IsQ0FBQyxDQUFDLENBQUE7YUFDSDtZQUNELElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtnQkFDckIsV0FBVyxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBQyxRQUFhO29CQUNoRCxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUNsRSxDQUFDLENBQUMsQ0FBQTtnQkFDRixXQUFXLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRTtvQkFDakMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUM5QyxDQUFDLENBQUMsQ0FBQTthQUNIO1NBQ0Y7UUFDRCxPQUFPLFNBQVMsQ0FBQTtJQUNsQixDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFDM0MsS0FBVSxFQUNWLFFBQWEsRUFDYixTQUFjO1FBRWQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FDNUIsS0FBSyxFQUNMLENBQUMsRUFDRCxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FDMUMsQ0FBQTtJQUNILENBQUMsQ0FBQTtJQUNELENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUN4QyxRQUFhLEVBQ2IsU0FBYztRQUVkLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQTtJQUN6RSxDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFDekMsU0FBYyxFQUNkLFNBQWM7UUFFZCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUE7UUFDYixPQUFPLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1NBQy9DO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMseUJBQXlCLEdBQUcsVUFDckQsU0FBYztRQUVkLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQTtRQUNiLE9BQU8sS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO1NBQ3JEO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHO1FBQzNDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQTtJQUN2QyxDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxLQUFVO1FBQzVELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3ZDLENBQUMsQ0FBQTtJQUNELENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxVQUFVLEtBQVU7UUFDL0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQ2pELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQzFDLENBQUMsQ0FBQTtJQUNELENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRztRQUNsQyxJQUFJLENBQUMsV0FBVztZQUNkLElBQUksQ0FBQyxXQUFXO2dCQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDOUIsQ0FBQyxDQUFBO0lBQ0QsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHO1FBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDckQsQ0FBQyxDQUFBO0lBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxVQUFVLE9BQVk7UUFDckQsd0NBQXdDO1FBQ3hDLElBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtRQUNwRCxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtZQUNoQixZQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDdEIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMzQixDQUFDLENBQUMsQ0FBQTtRQUNGLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQTtRQUNsQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQ3pCLG1KQUFtSjtRQUNuSixJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFBO1FBQ25DLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7UUFDN0IsbUpBQW1KO1FBQ25KLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDbkQsSUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3JFLHFCQUFxQjtRQUNyQixZQUFZLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUN4QyxJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUM3QixJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FDMUMsUUFBUSxDQUFDLFFBQVEsRUFDakIsU0FBUyxDQUNWLENBQUE7Z0JBQ0QsSUFBSSxTQUFTLEVBQUU7b0JBQ2IsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQTtvQkFDL0IsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFBO29CQUNuQixPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFBO2lCQUM1QjthQUNGO1FBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUMxQyxZQUFZLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUN4QyxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFBO1lBQ3JDLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDcEIsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFBO2dCQUNqRSxJQUFJLFNBQVMsRUFBRTtvQkFDYixPQUFPLENBQUMsTUFBTSxDQUNaLFFBQVEsRUFDUixnREFBZ0Q7d0JBQzlDLDRFQUE0RTt3QkFDNUUsc0JBQXNCLENBQ3BCLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FDN0MsQ0FDSixDQUFBO2lCQUNGO3FCQUFNO29CQUNMLE9BQU8sQ0FBQyxNQUFNLENBQ1osUUFBUSxFQUNSLCtDQUErQyxDQUNoRCxDQUFBO2lCQUNGO2FBQ0Y7UUFDSCxDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQzVDLENBQUMsQ0FBQTtJQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxPQUFZO1FBQ3RELHdDQUF3QztRQUN4QyxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUE7UUFDekQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUMzQyxDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLG9CQUFvQixHQUFHLFVBQVUsT0FBWTtRQUN2RCx3Q0FBd0M7UUFDeEMsSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxDQUFBO1FBQzFELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDNUMsQ0FBQyxDQUFBO0lBQ0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsR0FBRyxVQUFVLFNBQWMsRUFBRSxPQUFZO1FBQ3hFLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDaEIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUN2QixPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7WUFDaEIsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQ3RCLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDM0IsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUE7UUFDbEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUN6QixJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFBO1FBQ25DLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7UUFDN0IsSUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQyxJQUFJLElBQVMsQ0FBQTtRQUNiLElBQUksU0FBUyxFQUFFO1lBQ2IsNEVBQTRFO1lBQzVFLElBQUksR0FBRyxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUNoRDthQUFNO1lBQ0wsbUpBQW1KO1lBQ25KLElBQUksR0FBRyxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUNqRDtRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFBO1FBQ3pCLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDcEIsSUFBTSxTQUFTLEdBQVEsRUFBRSxDQUFBO1FBQ3pCLG1KQUFtSjtRQUNuSixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUE7UUFDNUQsSUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3JFLHFCQUFxQjtRQUNyQixZQUFZLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUN4QyxJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUM3QixJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FDMUMsUUFBUSxDQUFDLFFBQVEsRUFDakIsU0FBUyxDQUNWLENBQUE7Z0JBQ0QsSUFBSSxTQUFTLEVBQUU7b0JBQ2IsY0FBYztvQkFDZCxJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO3dCQUN6QixnRUFBZ0U7d0JBQ2hFLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO3dCQUMxQixTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO3dCQUNqQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO3FCQUNuQztvQkFDRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFFO3dCQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTt3QkFDMUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQTtxQkFDN0I7b0JBQ0QsMkJBQTJCO29CQUMzQixvQ0FBb0M7b0JBQ3BDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7b0JBQ3pCLGlDQUFpQztvQkFDakMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQTtpQkFDaEM7YUFDRjtRQUNILENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDMUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxVQUFDLFFBQWE7WUFDeEMsSUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQTtZQUNyQyxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3BCLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ3pCLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7b0JBQ3BDLElBQU0sV0FBVyxHQUNmLENBQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFNBQVMsS0FBSSxPQUFPLENBQUMsU0FBUyxZQUFZLE1BQU0sQ0FBQyxTQUFTLENBQUE7b0JBQ3JFLHVGQUF1RjtvQkFDdkYscUVBQXFFO29CQUNyRSxJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUNoQixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSwwQkFBMEIsQ0FBQyxDQUFBO3FCQUNyRDtpQkFDRjtxQkFBTTtvQkFDTCxJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUE7b0JBQ2pFLElBQUksU0FBUyxFQUFFO3dCQUNiLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTt3QkFDZixxQ0FBcUM7d0JBQ3JDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTt3QkFDaEMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTt3QkFDekIsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBRTs0QkFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7NEJBQzFCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7eUJBQzdCO3dCQUNELGdCQUFnQjt3QkFDaEIsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUE7d0JBQy9ELGVBQWU7d0JBQ2YsT0FBTyxDQUFDLE1BQU0sQ0FDWixRQUFRLEVBQ1Isa0NBQTJCLFNBQVMsQ0FBQyxNQUFNLCtCQUV4QyxTQUFTLENBQUMsTUFBTSxJQUFJLFNBQVM7NEJBQzNCLENBQUMsQ0FBQyxvQ0FBb0M7NEJBQ3RDLENBQUMsQ0FBQyxFQUFFLENBQ04sQ0FDSixDQUFBO3dCQUNELElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUN2QyxnRkFBZ0Y7NEJBQ2hGLDhFQUE4RTs0QkFDOUUsK0VBQStFOzRCQUMvRSwyRUFBMkU7NEJBQzNFLG1GQUFtRjs0QkFDbkYsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFBO3lCQUN0QjtxQkFDRjtpQkFDRjthQUNGO1FBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUMxQyxZQUFZLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUN4QyxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFBO1lBQ2xDLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDcEIsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUU7b0JBQ3BDLE9BQU07aUJBQ1A7cUJBQU07b0JBQ0wsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFBO29CQUNqRSxJQUFJLFNBQVMsRUFBRTt3QkFDYixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUE7d0JBQ25CLElBQUksT0FBTyxPQUFPLENBQUMsUUFBUSxJQUFJLFVBQVUsRUFBRTs0QkFDekMsNERBQTREOzRCQUM1RCw0RUFBNEU7NEJBQzVFLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO3lCQUMzRDtxQkFDRjtpQkFDRjthQUNGO1FBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBQ25ELENBQUMsQ0FBQTtJQUNELFNBQVMsZ0JBQWdCLENBQUMsS0FBVTtRQUNsQyxPQUFPLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQztZQUNqRCxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUNqQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7U0FDbEMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxPQUFZO1FBQ3JELHdDQUF3QztRQUN4QyxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUE7UUFDekQsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNoQixJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7Z0JBQ2xCLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7YUFDMUI7WUFDRCxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsTUFBTSxFQUFFLENBQUE7WUFDakIsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQ3RCLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDM0IsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUE7UUFDbEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUN6QixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQTtRQUN6QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO1FBQzdCLElBQUksVUFBVSxHQUFRLElBQUksQ0FBQTtRQUMxQixJQUFJLE1BQU0sR0FBUSxJQUFJLENBQUE7UUFDdEIsSUFBSSxPQUFPLEdBQVEsSUFBSSxDQUFBO1FBQ3ZCLElBQU0sWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNyRSxTQUFTLFlBQVksQ0FBQyxLQUFVO1lBQzlCLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtnQkFDbEIsNEVBQTRFO2dCQUM1RSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsZUFBZSx1QkFBTSxPQUFPLEtBQUUsTUFBTSxFQUFFLEtBQUssSUFBRyxDQUFBO2dCQUN0RSxNQUFNLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQTtnQkFDM0IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTthQUN2QjtZQUNELE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO1lBQ3JCLHFCQUFxQjtZQUNyQixJQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN2QyxrQ0FBa0M7WUFDbEMsSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO2dCQUNuQixtSkFBbUo7Z0JBQ25KLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQUE7Z0JBQ3ZELE9BQU8sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUE7YUFDL0I7aUJBQU07Z0JBQ0wsT0FBTyxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFBO2FBQzNDO1FBQ0gsQ0FBQztRQUNELHFCQUFxQjtRQUNyQixZQUFZLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUN4QyxJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUM3QixJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FDMUMsUUFBUSxDQUFDLFFBQVEsRUFDakIsU0FBUyxDQUNWLENBQUE7Z0JBQ0QsSUFBSSxTQUFTLEVBQUU7b0JBQ2IsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO3dCQUNsQixnRUFBZ0U7d0JBQ2hFLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO3dCQUMxQix1QkFBdUI7d0JBQ3ZCLFVBQVUsR0FBRyxTQUFTLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUE7d0JBQ3pELElBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUE7d0JBQy9DLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTtxQkFDcEI7eUJBQU07d0JBQ0wsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFBO3dCQUNuQixJQUFJLE9BQU8sT0FBTyxDQUFDLFFBQVEsSUFBSSxVQUFVLEVBQUU7NEJBQ3pDLE9BQU8sQ0FBQyxRQUFRLENBQ2QsU0FBUyxDQUNQLFVBQVUsRUFDVixTQUFTLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQzdDLENBQ0YsQ0FBQTt5QkFDRjtxQkFDRjtpQkFDRjthQUNGO1FBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUMxQyxZQUFZLENBQUMsY0FBYyxDQUFDLFVBQUMsUUFBYTtZQUN4QyxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFBO1lBQ3JDLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDcEIsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO29CQUNsQixJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO29CQUNwQyxJQUFNLFdBQVcsR0FDZixDQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxTQUFTLEtBQUksT0FBTyxDQUFDLFNBQVMsWUFBWSxNQUFNLENBQUMsU0FBUyxDQUFBO29CQUNyRSx1RkFBdUY7b0JBQ3ZGLHFFQUFxRTtvQkFDckUsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDaEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsa0NBQWtDLENBQUMsQ0FBQTtxQkFDN0Q7aUJBQ0Y7cUJBQU07b0JBQ0wsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFBO29CQUNqRSxJQUFJLFNBQVMsRUFBRTt3QkFDYixNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO3dCQUM5QixJQUFNLEtBQUssR0FBRyxTQUFTLENBQ3JCLFVBQVUsRUFDVixTQUFTLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQzdDLENBQUE7d0JBQ0QsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFBO3dCQUNuQixPQUFPLENBQUMsTUFBTSxDQUNaLFFBQVEsRUFDUixrRUFBa0UsQ0FDbkUsQ0FBQTtxQkFDRjtpQkFDRjthQUNGO1FBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUM1QyxDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHLFVBQVUsT0FBWTtRQUNyRCx3Q0FBd0M7UUFDeEMsSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFBO1FBQ3pELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxPQUFPO1lBQ2hDLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtnQkFDbEIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTthQUMxQjtZQUNELE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxNQUFNLEVBQUUsQ0FBQTtZQUNqQixZQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDdEIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMzQixDQUFDLENBQUMsQ0FBQTtRQUNGLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQTtRQUNsQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQ3pCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFBO1FBQ3pDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7UUFDN0IsSUFBSSxNQUFNLEdBQVEsSUFBSSxDQUFBO1FBQ3RCLElBQUksT0FBTyxHQUFRLElBQUksQ0FBQTtRQUN2QixJQUFNLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDckUscUJBQXFCO1FBQ3JCLFlBQVksQ0FBQyxjQUFjLENBQUMsVUFBQyxRQUFhO1lBQ3hDLElBQUksUUFBUSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQzdCLElBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUMxQyxRQUFRLENBQUMsUUFBUSxFQUNqQixTQUFTLENBQ1YsQ0FBQTtnQkFDRCxJQUFJLFNBQVMsRUFBRTtvQkFDYixJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7d0JBQ2xCLGdFQUFnRTt3QkFDaEUsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUE7d0JBQzFCLG9CQUFvQjt3QkFDcEIsNEVBQTRFO3dCQUM1RSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDOzRCQUM3QixNQUFNLEVBQUUsU0FBUzs0QkFDakIsTUFBTSxFQUFFLENBQUM7NEJBQ1QsWUFBWSxFQUFFLEtBQUs7NEJBQ25CLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTt5QkFDM0IsQ0FBQyxDQUFBO3dCQUNGLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7d0JBQ3RCLG1KQUFtSjt3QkFDbkosT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTt3QkFDdkQsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7cUJBQ25DO3lCQUFNO3dCQUNMLElBQUksT0FBTyxPQUFPLENBQUMsUUFBUSxJQUFJLFVBQVUsRUFBRTs0QkFDekMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7eUJBQ3pEO3dCQUNELEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQTtxQkFDcEI7aUJBQ0Y7YUFDRjtRQUNILENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDMUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxVQUFDLFFBQWE7WUFDeEMsSUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQTtZQUNyQyxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3BCLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtvQkFDbEIsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtvQkFDcEMsSUFBTSxXQUFXLEdBQ2YsQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsU0FBUyxLQUFJLE9BQU8sQ0FBQyxTQUFTLFlBQVksTUFBTSxDQUFDLFNBQVMsQ0FBQTtvQkFDckUsdUZBQXVGO29CQUN2RixxRUFBcUU7b0JBQ3JFLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ2hCLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLG1DQUFtQyxDQUFDLENBQUE7cUJBQzlEO2lCQUNGO3FCQUFNO29CQUNMLElBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQTtvQkFDakUsSUFBSSxTQUFTLEVBQUU7d0JBQ2IsTUFBTSxDQUFDLFNBQVMsQ0FDZCxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQzFELENBQUE7d0JBQ0QsT0FBTyxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxDQUFBO3dCQUM1QyxPQUFPLENBQUMsTUFBTSxDQUNaLFFBQVEsRUFDUixxRUFBcUUsQ0FDdEUsQ0FBQTtxQkFDRjtpQkFDRjthQUNGO1FBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUM1QyxDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLGlCQUFpQixHQUFHO1FBQzlCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQTtRQUN2QixNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUc7WUFDdkMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixPQUFNO2FBQ1A7WUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtZQUNyQixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUE7WUFDdEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFBO1lBQ2xCLFNBQVMsY0FBYyxDQUFDLE1BQVc7Z0JBQ2pDLFVBQVUsQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQTtZQUNyRSxDQUFDO1lBQ0QsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUU7Z0JBQ2pDLHNDQUFzQztnQkFDdEMsNEVBQTRFO2dCQUM1RSxTQUFTLE1BQU0sQ0FBQyxRQUFhO29CQUMzQixTQUFTLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtvQkFDN0IsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQTtnQkFDL0QsQ0FBQztnQkFDRCxTQUFTLFNBQVMsQ0FBQyxRQUFhO29CQUM5QixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7b0JBQ2pCLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtvQkFDcEIsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQTtnQkFDbEUsQ0FBQztnQkFDRCxJQUFJLE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FDOUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQ3pCLENBQUE7Z0JBQ0QsT0FBTyxDQUFDLGNBQWMsQ0FBQyxVQUFDLFFBQWE7b0JBQ25DLElBQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FDdEQsUUFBUSxDQUFDLFdBQVcsRUFDcEIsU0FBUyxDQUNWLENBQUE7b0JBQ0QsSUFBSSxTQUFTLEVBQUU7d0JBQ2IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO3FCQUNsQjt5QkFBTTt3QkFDTCxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUE7cUJBQ3JCO2dCQUNILENBQUMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBQzFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsVUFBQyxRQUFhO29CQUNuQyxTQUFTLENBQ1AsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQ3JFLENBQUE7Z0JBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtnQkFDdkMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3ZCLENBQUMsQ0FBQyxDQUFBO1lBQ0Ysb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDakMsQ0FBQyxDQUFBO1FBQ0QsU0FBUyxjQUFjLENBQVksV0FBZ0I7WUFDakQsZUFBZTtZQUNmLGdFQUFnRTtZQUNoRSxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxXQUFXLEVBQUU7Z0JBQ3pELE9BQU07YUFDUDtZQUNELGtDQUFrQztZQUNsQyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUMzQixPQUFNO2FBQ1A7WUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQTtZQUMvQix1RUFBdUU7WUFDdkUsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsaURBQWlEO2dCQUNqRCxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUMvQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUE7Z0JBQ3BDLElBQUksQ0FBQyxjQUFjLENBQ2pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEVBQ3hDLElBQUksQ0FBQyxXQUFXLENBQ2pCLENBQUE7YUFDRjtpQkFBTTtnQkFDTCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7aUJBQ3pEO3FCQUFNO29CQUNMLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFBO2lCQUMxQzthQUNGO1FBQ0gsQ0FBQztRQUNELFNBQVMsV0FBVyxDQUFZLFFBQWE7WUFDM0MsZUFBZTtZQUNmLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxRQUFRLEVBQUU7Z0JBQzlCLE9BQU07YUFDUDtZQUNELDRGQUE0RjtZQUM1RixVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtZQUNqQyxrQkFBa0I7WUFDbEIsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDMUIsSUFBTSxPQUFLLEdBQUcsSUFBSSxDQUFBO2dCQUNsQixrREFBa0Q7Z0JBQ2xELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7b0JBQ3pCLG1KQUFtSjtvQkFDbkosSUFBTSxTQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQTtvQkFDL0QsbUpBQW1KO29CQUNuSixJQUFNLGFBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQ3RDLFVBQVUsRUFDVixpQkFBaUIsQ0FDbEIsQ0FBQTtvQkFDRCxnRUFBZ0U7b0JBQ2hFLG1KQUFtSjtvQkFDbkosU0FBUyxpQkFBaUIsQ0FBQyxLQUFVLEVBQUUsU0FBYzt3QkFDbkQscURBQXFEO3dCQUNyRCxJQUFJLFNBQVMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUE7d0JBQ2hFLElBQUksU0FBUyxHQUFHLGFBQVcsQ0FBQyxlQUFlLEVBQUUsRUFBRTs0QkFDN0MsYUFBVyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRO2dDQUMxQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQTt5QkFDekM7d0JBQ0QsU0FBUyxHQUFHLEtBQUssQ0FBQTt3QkFDakIsSUFBSSxTQUFTLEdBQUcsYUFBVyxDQUFDLGVBQWUsRUFBRSxFQUFFOzRCQUM3QyxhQUFXLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVE7Z0NBQzFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFBO3lCQUN6QztvQkFDSCxDQUFDO29CQUNELG1KQUFtSjtvQkFDbkosU0FBUyxRQUFRO3dCQUNmLE9BQUssQ0FBQyxnQkFBZ0IsQ0FBQzs0QkFDckIsSUFBSSxFQUFFLFVBQVU7NEJBQ2hCLFNBQVMsRUFBRSxPQUFLLENBQUMsU0FBUzt5QkFDM0IsQ0FBQyxDQUFBO29CQUNKLENBQUM7b0JBQ0QsSUFBTSxxQkFBbUIsR0FBRzt3QkFDMUIsWUFBWSxFQUFFOzRCQUNaLE1BQU0sWUFBQyxLQUFVLEVBQUUsUUFBYTtnQ0FDOUIsT0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUE7Z0NBQ2pDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxPQUFLLENBQUMsU0FBUyxDQUFDLENBQUE7Z0NBQ3pDLE9BQUssQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7NEJBQy9CLENBQUM7NEJBQ0QsU0FBUztnQ0FDUCxPQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO2dDQUM3QixRQUFRLEVBQUUsQ0FBQTs0QkFDWixDQUFDO3lCQUNGO3dCQUNELFlBQVksWUFBQyxLQUFVOzRCQUNyQix1RkFBdUY7NEJBQ3ZGLElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQ2xDLE9BQUssQ0FBQyxTQUFTLEVBQ2YsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQ3pCLENBQUMsTUFBTSxDQUFBOzRCQUNSLElBQU0sbUJBQW1CLEdBQUcsT0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7NEJBQ25ELElBQUksWUFBWSxHQUFHLG1CQUFtQixFQUFFO2dDQUN0QyxPQUFNOzZCQUNQOzRCQUNELGlEQUFpRDs0QkFDakQsT0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFBOzRCQUNoQyxPQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBOzRCQUM3QixTQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFBOzRCQUM5QixhQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFBOzRCQUNsQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsT0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBOzRCQUN6QyxRQUFRLEVBQUUsQ0FBQTs0QkFDVixVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFBO3dCQUNuQyxDQUFDO3dCQUNELE9BQU87NEJBQ0wsSUFBSSxHQUFHLEdBQUcsY0FBYyxDQUFBOzRCQUN4Qix1RkFBdUY7NEJBQ3ZGLElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQ2xDLE9BQUssQ0FBQyxTQUFTLEVBQ2YsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQ3pCLENBQUMsTUFBTSxDQUFBOzRCQUNSLElBQU0sbUJBQW1CLEdBQUcsT0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7NEJBQ25ELElBQUksWUFBWSxJQUFJLG1CQUFtQixFQUFFO2dDQUN2QyxHQUFHLElBQUksMkJBQTJCLENBQUE7NkJBQ25DOzRCQUNELE9BQU8sR0FBRyxDQUFBO3dCQUNaLENBQUM7cUJBQ0YsQ0FBQTtvQkFDRCx3RUFBd0U7b0JBQ3hFLFNBQU8sQ0FBQyxhQUFhLENBQUMsT0FBSyxDQUFDLFNBQVMsRUFBRSxxQkFBbUIsQ0FBQyxDQUFBO29CQUMzRCxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQU8sQ0FBQTtvQkFDdkIsbUpBQW1KO29CQUNuSixTQUFTLDJCQUEyQixDQUFDLEtBQVU7d0JBQzdDLElBQU0sU0FBUyxHQUFHLE9BQUssQ0FBQyxTQUFTLENBQUE7d0JBQ2pDLE9BQU8sU0FBUyxDQUFDLHVCQUF1QixDQUN0QyxJQUFJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FDMUIsU0FBUyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUNuRCxTQUFTLENBQUMsdUJBQXVCLENBQy9CLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUN4RCxDQUNGLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQ2hDLENBQUE7b0JBQ0gsQ0FBQztvQkFDRCxJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUE7b0JBQ3hCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQTtvQkFDYixJQUFJLFFBQU0sR0FBRyxPQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtvQkFDL0QsT0FBTyxLQUFLLEdBQUcsUUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO3dCQUM5QixhQUFhLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7cUJBQ3ZEO29CQUNELElBQU0seUJBQXVCLEdBQUc7d0JBQzlCLFlBQVksRUFBRTs0QkFDWixXQUFXLFlBQUMsS0FBVSxFQUFFLFFBQWE7Z0NBQ25DLDZEQUE2RDtnQ0FDN0QsQ0FBQztnQ0FBQyxJQUFZLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7Z0NBQ2hDLE9BQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFFLElBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFBO2dDQUN4RCxPQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBOzRCQUMvQixDQUFDOzRCQUNELE1BQU0sWUFBQyxNQUFXLEVBQUUsUUFBYTtnQ0FDL0IsT0FBSyxDQUFDLFNBQVMsQ0FBRSxJQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFBO2dDQUMvQyxPQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBOzRCQUMvQixDQUFDOzRCQUNELFNBQVMsWUFBQyxNQUFXLEVBQUUsUUFBYTtnQ0FDbEMsd0NBQXdDO2dDQUN4QyxTQUFPLENBQUMsZUFBZSxDQUNwQixJQUFZLENBQUMsS0FBSyxFQUNuQixRQUFRLEVBQ1IscUJBQW1CLENBQ3BCLENBQUE7Z0NBQ0QsYUFBVyxDQUFDLFlBQVksQ0FBRSxJQUFZLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVE7b0NBQ3hELDJCQUEyQixDQUFFLElBQVksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUE7Z0NBQ3RELGFBQVcsQ0FBQyxlQUFlLENBQ3hCLElBQVksQ0FBQyxLQUFLLEVBQ25CLDJCQUEyQixDQUFFLElBQVksQ0FBQyxLQUFLLENBQUMsRUFDaEQseUJBQXVCLENBQ3hCLENBQUE7Z0NBQ0QsT0FBSyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQTtnQ0FDN0IsUUFBUSxFQUFFLENBQUE7NEJBQ1osQ0FBQzt5QkFDRjt3QkFDRCxPQUFPOzRCQUNMLE9BQU8sNEJBQTRCLENBQUE7d0JBQ3JDLENBQUM7cUJBQ0YsQ0FBQTtvQkFDRCxhQUFXLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSx5QkFBdUIsQ0FBQyxDQUFBO29CQUNqRSxJQUFJLENBQUMsWUFBWSxHQUFHLGFBQVcsQ0FBQTtvQkFDL0IsNEJBQTRCO29CQUM1QixTQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7b0JBQ2xCLGFBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtpQkFDdkI7Z0JBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7YUFDdEI7aUJBQU07Z0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtvQkFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtvQkFDdEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtvQkFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7b0JBQ3BCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO2lCQUN6QjtnQkFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTthQUN2QjtRQUNILENBQUM7UUFDRCxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRztZQUNuRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3BCLE9BQU07YUFDUDtZQUNELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQTtZQUNyQixRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtZQUMxQixRQUFRLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQTtZQUM3QixRQUFRLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTtZQUNsQyxJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO1lBQ2hDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsVUFBVSxXQUFnQjtnQkFDbEQsa0NBQWtDO2dCQUNsQyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO29CQUMzQixPQUFNO2lCQUNQO2dCQUNELElBQUksV0FBVyxFQUFFO29CQUNmLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFBO2lCQUNqQztxQkFBTTtvQkFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFBO2lCQUM3QjtZQUNILENBQUMsQ0FBQTtZQUNELFFBQVEsQ0FBQyxTQUFTLEdBQUc7Z0JBQ25CLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FDeEMsU0FBUyxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FDNUQsQ0FBQTtZQUNILENBQUMsQ0FBQTtZQUNELG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQzlCLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDNUIsQ0FBQyxDQUFBO1FBQ0QsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUc7WUFDbEQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNwQixPQUFNO2FBQ1A7WUFDRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUE7WUFDcEIsT0FBTyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7WUFDNUIsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7WUFDakMsT0FBTyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUE7WUFDdkMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDN0IsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMzQixDQUFDLENBQUE7UUFDRCxVQUFVLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUc7WUFDakQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNwQixPQUFNO2FBQ1A7WUFDRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUE7WUFDbkIsTUFBTSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7WUFDM0IsTUFBTSxDQUFDLFdBQVcsR0FBRyxVQUFVLFFBQWE7Z0JBQzFDLGVBQWU7Z0JBQ2YsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLFFBQVEsRUFBRTtvQkFDOUIsT0FBTTtpQkFDUDtnQkFDRCxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtnQkFDakMsa0JBQWtCO2dCQUNsQixJQUFJLFFBQVEsRUFBRTtvQkFDWiw0RkFBNEY7b0JBQzVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQzFCLGtEQUFrRDtvQkFDbEQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTt3QkFDekIsbUpBQW1KO3dCQUNuSixJQUFNLFNBQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFBO3dCQUMvRCxtSkFBbUo7d0JBQ25KLFNBQVMsUUFBUTs0QkFDZixNQUFNLENBQUMsZ0JBQWdCLENBQUM7Z0NBQ3RCLElBQUksRUFBRSxVQUFVO2dDQUNoQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07NkJBQ3RCLENBQUMsQ0FBQTt3QkFDSixDQUFDO3dCQUNELElBQU0sbUJBQW1CLEdBQUc7NEJBQzFCLFlBQVksRUFBRTtnQ0FDWixNQUFNLFlBQUMsS0FBVSxFQUFFLFFBQWE7b0NBQzlCLElBQU0sTUFBTSxHQUFHLFNBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFBO29DQUM3RCxNQUFNLENBQUMsU0FBUyxDQUNkLFNBQVMsQ0FDUCxTQUFTLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLEVBQ3pDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FDNUMsQ0FDRixDQUFBO29DQUNELFNBQU8sQ0FBQyx5QkFBeUIsQ0FDL0IsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNoQyxDQUFBO2dDQUNILENBQUM7Z0NBQ0QsU0FBUztvQ0FDUCxRQUFRLEVBQUUsQ0FBQTtnQ0FDWixDQUFDOzZCQUNGOzRCQUNELE9BQU87Z0NBQ0wsT0FBTywyQ0FBMkMsQ0FBQTs0QkFDcEQsQ0FBQzt5QkFDRixDQUFBO3dCQUNELFNBQU8sQ0FBQyxhQUFhLENBQ25CLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFDL0IsbUJBQW1CLENBQ3BCLENBQUE7d0JBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFPLENBQUE7d0JBQ3ZCLFNBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQTtxQkFDbkI7b0JBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7aUJBQ3RCO3FCQUFNO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7d0JBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUE7d0JBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO3FCQUNyQjtvQkFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtpQkFDdkI7WUFDSCxDQUFDLENBQUE7WUFDRCxNQUFNLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQTtZQUN0QyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUM1QixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzFCLENBQUMsQ0FBQTtRQUNELENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHO1lBQ3pDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDcEIsT0FBTTthQUNQO1lBQ0QsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFBO1lBQ3BCLElBQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUE7WUFDL0IsT0FBTyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7WUFDNUIsVUFBVSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ3pDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsVUFBVSxRQUFhO2dCQUMzQyxlQUFlO2dCQUNmLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxRQUFRLEVBQUU7b0JBQzlCLE9BQU07aUJBQ1A7Z0JBQ0QsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUE7Z0JBQ2pDLGtCQUFrQjtnQkFDbEIsSUFBSSxRQUFRLEVBQUU7b0JBQ1osNEZBQTRGO29CQUM1RixVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUMxQixJQUFNLE9BQUssR0FBRyxJQUFJLENBQUE7b0JBQ2xCLGtEQUFrRDtvQkFDbEQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTt3QkFDekIsbUpBQW1KO3dCQUNuSixJQUFNLFNBQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFBO3dCQUMvRCxtSkFBbUo7d0JBQ25KLFNBQVMsa0JBQWtCOzRCQUN6QixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQ3pDLFNBQVMsRUFDVCxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQ25CLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUMxQixPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFDMUIsT0FBTyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUNuQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FDZCxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7d0JBQ2hCLENBQUM7d0JBQ0QsbUpBQW1KO3dCQUNuSixTQUFTLFFBQVE7NEJBQ2YsT0FBTyxDQUFDLGdCQUFnQixDQUFDO2dDQUN2QixJQUFJLEVBQUUsVUFBVTtnQ0FDaEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUU7Z0NBQzNCLGFBQWEsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7Z0NBQ3pDLGFBQWEsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7Z0NBQ3pDLFFBQVEsRUFBRSxDQUFDOzZCQUNaLENBQUMsQ0FBQTt3QkFDSixDQUFDO3dCQUNELElBQU0sbUJBQW1CLEdBQUc7NEJBQzFCLFlBQVksRUFBRTtnQ0FDWixNQUFNLFlBQUMsS0FBVSxFQUFFLFFBQWE7b0NBQzlCLElBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUN6QyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQ25CLFFBQVEsQ0FDVCxDQUFBO29DQUNELElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7d0NBQ2xCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQTtxQ0FDbkM7eUNBQU07d0NBQ0wsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFBO3FDQUNuQztvQ0FDRCxTQUFPLENBQUMseUJBQXlCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFBO2dDQUN6RCxDQUFDO2dDQUNELFNBQVM7b0NBQ1AsUUFBUSxFQUFFLENBQUE7Z0NBQ1osQ0FBQzs2QkFDRjs0QkFDRCxPQUFPO2dDQUNMLE9BQU8sNENBQTRDLENBQUE7NEJBQ3JELENBQUM7eUJBQ0YsQ0FBQTt3QkFDRCxTQUFPLENBQUMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTt3QkFDaEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFPLENBQUE7d0JBQ3ZCLDBDQUEwQzt3QkFDMUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUMxRCxLQUFLLENBQUMsTUFBTSxDQUNiLENBQUE7d0JBQ0QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxVQUFDLFFBQWE7NEJBQ25ELElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBOzRCQUNsRCxJQUFJLENBQUMsQ0FBQyxZQUFZLElBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dDQUM3QyxPQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFBOzZCQUN6Qjt3QkFDSCxDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFBO3dCQUMxQyw0QkFBNEI7d0JBQzVCLFNBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQTtxQkFDbkI7b0JBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7aUJBQ3RCO3FCQUFNO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7d0JBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUE7d0JBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO3dCQUNwQixJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUE7cUJBQ2xDO29CQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFBO2lCQUN2QjtZQUNILENBQUMsQ0FBQTtZQUNELE9BQU8sQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBO1lBQ3ZDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzdCLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDNUIsQ0FBQyxDQUFBO1FBQ0QsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsNkJBQTZCLEdBQUcsVUFDMUQsV0FBZ0I7WUFFaEIsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FDMUQsSUFBSSxNQUFNLENBQUMscUJBQXFCLENBQUM7Z0JBQy9CLFNBQVMsV0FBQTtnQkFDVCxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3hCLFdBQVcsYUFBQTthQUNaLENBQUMsQ0FDSCxDQUFBO1lBQ0QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUNYLEtBQUssRUFDTCxNQUFNLEdBQUcsRUFBRSxDQUFBO1lBQ2IsT0FBTyxLQUFLLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO2dCQUNyRSxLQUFLLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFBO2dCQUMzQyxNQUFNLENBQUMsSUFBSSxDQUNULElBQUksTUFBTSxDQUFDLFVBQVUsQ0FDbkIsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUNaLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQ2hCLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQ2pCLENBQ0YsQ0FBQTthQUNGO1lBQ0QsT0FBTyxNQUFNLENBQUE7UUFDZixDQUFDLENBQUE7UUFDRCxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUc7WUFDeEMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNwQixPQUFNO2FBQ1A7WUFDRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUE7WUFDbkIsTUFBTSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7WUFDM0IsTUFBTSxDQUFDLFdBQVcsR0FBRyxVQUFVLFFBQWE7Z0JBQzFDLGVBQWU7Z0JBQ2YsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLFFBQVEsRUFBRTtvQkFDOUIsT0FBTTtpQkFDUDtnQkFDRCxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtnQkFDakMsa0JBQWtCO2dCQUNsQixJQUFJLFFBQVEsRUFBRTtvQkFDWiw0RkFBNEY7b0JBQzVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQzFCLElBQU0sT0FBSyxHQUFHLElBQUksQ0FBQTtvQkFDbEIsa0RBQWtEO29CQUNsRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO3dCQUN6QixtSkFBbUo7d0JBQ25KLElBQU0sU0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUE7d0JBQy9ELG1KQUFtSjt3QkFDbkosU0FBUyxrQkFBa0I7NEJBQ3pCLE9BQU8sT0FBSyxDQUFDLDZCQUE2QixDQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FDeEIsQ0FBQTt3QkFDSCxDQUFDO3dCQUNELG1KQUFtSjt3QkFDbkosU0FBUyxRQUFROzRCQUNmLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztnQ0FDdEIsSUFBSSxFQUFFLFVBQVU7Z0NBQ2hCLE1BQU0sRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFO2dDQUMxQixNQUFNLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRTs2QkFDM0IsQ0FBQyxDQUFBO3dCQUNKLENBQUM7d0JBQ0QsSUFBTSxtQkFBbUIsR0FBRzs0QkFDMUIsWUFBWSxFQUFFO2dDQUNaLE1BQU0sWUFBQyxNQUFXLEVBQUUsUUFBYTtvQ0FDL0IsTUFBTSxDQUFDLFNBQVMsQ0FDZCxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQ3pELENBQUE7b0NBQ0QsU0FBTyxDQUFDLHlCQUF5QixDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtnQ0FDekQsQ0FBQztnQ0FDRCxTQUFTO29DQUNQLFFBQVEsRUFBRSxDQUFBO2dDQUNaLENBQUM7NkJBQ0Y7NEJBQ0QsT0FBTztnQ0FDTCxPQUFPLDJCQUEyQixDQUFBOzRCQUNwQyxDQUFDO3lCQUNGLENBQUE7d0JBQ0QsU0FBTyxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLG1CQUFtQixDQUFDLENBQUE7d0JBQ2hFLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBTyxDQUFBO3dCQUN2QixTQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7cUJBQ25CO29CQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO2lCQUN0QjtxQkFBTTtvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO3dCQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFBO3dCQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtxQkFDckI7b0JBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUE7aUJBQ3ZCO1lBQ0gsQ0FBQyxDQUFBO1lBQ0QsTUFBTSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUE7WUFDdEMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDNUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMxQixDQUFDLENBQUE7SUFDSCxDQUFDLENBQUE7SUFDRCxDQUFDLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQztRQUNwQixjQUFjO1FBQ2Qsd0VBQXdFO1FBQ3hFLFNBQVMsQ0FBQyxDQUF1QixVQUFlLEVBQUUsT0FBWTtZQUM1RCw4QkFBOEI7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN0QyxNQUFNLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO2FBQ3pEO1lBQ0QsSUFBTSxXQUFXLEdBQUc7Z0JBQ2xCLFVBQVUsRUFBRSxzQ0FBc0M7Z0JBQ2xELFlBQVksRUFBRSwyQ0FBMkM7Z0JBQ3pELFdBQVcsRUFBRSw4Q0FBOEM7Z0JBQzNELFVBQVUsRUFBRSw2Q0FBNkM7Z0JBQ3pELFVBQVUsRUFBRSw2Q0FBNkM7Z0JBQ3pELFNBQVMsRUFBRSxtQ0FBbUM7Z0JBQzlDLHNCQUFzQixFQUFFLHNCQUFzQjtnQkFDOUMscUJBQXFCLEVBQUUscUJBQXFCO2dCQUM1QyxvQkFBb0IsRUFBRSxvQkFBb0I7Z0JBQzFDLG9CQUFvQixFQUFFLG9CQUFvQjthQUMzQyxDQUFBO1lBQ0QsV0FBVyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQTtZQUNqQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUE7WUFDbEIsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUM3QyxPQUFPLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtZQUM3QixPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUN0QyxTQUFTLE9BQU8sQ0FBQyxHQUFRLEVBQUUsR0FBUSxFQUFFLEtBQVUsRUFBRSxRQUFhO2dCQUM1RCxJQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUN6QyxHQUFHLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQTtnQkFDeEIsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7Z0JBQ2pCLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ3hCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFBO2dCQUN0QixJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2dCQUMzQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNyQixJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUMxQztnQkFBQyxLQUFhLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtnQkFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDdkIsT0FBTyxHQUFHLENBQUE7WUFDWixDQUFDO1lBQ0QsSUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQTtZQUMvQixPQUFPLENBQ0wsUUFBUSxFQUNSLE9BQU8sQ0FBQyxVQUFVLEVBQ2xCLG9DQUFvQyxFQUNwQztnQkFDRSxVQUFVLENBQUMsa0JBQWtCLENBQUM7b0JBQzVCLFFBQVEsWUFBQyxRQUFhO3dCQUNwQixLQUFLLENBQUMsZ0JBQWdCLENBQUM7NEJBQ3JCLElBQUksRUFBRSxlQUFlOzRCQUNyQixRQUFRLFVBQUE7eUJBQ1QsQ0FBQyxDQUFBO29CQUNKLENBQUM7aUJBQ0YsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxDQUNGLENBQUE7WUFDRCxPQUFPLENBQ0wsVUFBVSxFQUNWLE9BQU8sQ0FBQyxZQUFZLEVBQ3BCLHNDQUFzQyxFQUN0QztnQkFDRSxVQUFVLENBQUMsb0JBQW9CLENBQUM7b0JBQzlCLFFBQVEsWUFBQyxTQUFjO3dCQUNyQixLQUFLLENBQUMsZ0JBQWdCLENBQUM7NEJBQ3JCLElBQUksRUFBRSxpQkFBaUI7NEJBQ3ZCLFNBQVMsV0FBQTt5QkFDVixDQUFDLENBQUE7b0JBQ0osQ0FBQztpQkFDRixDQUFDLENBQUE7WUFDSixDQUFDLENBQ0YsQ0FBQTtZQUNELE9BQU8sQ0FDTCxTQUFTLEVBQ1QsT0FBTyxDQUFDLFdBQVcsRUFDbkIscUNBQXFDLEVBQ3JDO2dCQUNFLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQztvQkFDN0IsUUFBUSxZQUFDLFNBQWM7d0JBQ3JCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQzs0QkFDckIsSUFBSSxFQUFFLGdCQUFnQjs0QkFDdEIsU0FBUyxXQUFBO3lCQUNWLENBQUMsQ0FBQTtvQkFDSixDQUFDO2lCQUNGLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FDRixDQUFBO1lBQ0QsT0FBTyxDQUNMLFFBQVEsRUFDUixPQUFPLENBQUMsVUFBVSxFQUNsQixrQ0FBa0MsRUFDbEM7Z0JBQ0UsVUFBVSxDQUFDLGtCQUFrQixDQUFDO29CQUM1QixRQUFRLFlBQUMsTUFBVzt3QkFDbEIsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxNQUFNLFFBQUEsRUFBRSxDQUFDLENBQUE7b0JBQzNELENBQUM7aUJBQ0YsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxDQUNGLENBQUE7WUFDRCxPQUFPLENBQ0wsUUFBUSxFQUNSLE9BQU8sQ0FBQyxVQUFVLEVBQ2xCLGlDQUFpQyxFQUNqQztnQkFDRSxVQUFVLENBQUMsa0JBQWtCLENBQUM7b0JBQzVCLFFBQVEsWUFBQyxNQUFXLEVBQUUsTUFBVzt3QkFDL0IsS0FBSyxDQUFDLGdCQUFnQixDQUFDOzRCQUNyQixJQUFJLEVBQUUsZUFBZTs0QkFDckIsTUFBTSxRQUFBOzRCQUNOLE1BQU0sUUFBQTt5QkFDUCxDQUFDLENBQUE7b0JBQ0osQ0FBQztpQkFDRixDQUFDLENBQUE7WUFDSixDQUFDLENBQ0YsQ0FBQTtZQUNELGdDQUFnQztZQUNoQyxzQkFBc0I7WUFDdEIsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN2QyxHQUFHLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtZQUN6QixPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3hCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsRUFBRTtnQkFDM0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtZQUM5QixDQUFDLENBQUMsQ0FBQTtZQUNGLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVCLENBQUM7UUFDRCxPQUFPLENBQUMsQ0FBQTtJQUNWLENBQUMsQ0FBQyxFQUFFLENBQUE7SUFDSixDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFVLFNBQWMsRUFBRSxPQUFZO1FBQzdELE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxXQUFBLEVBQUUsQ0FBQyxDQUFBO1FBQzdDLDRFQUE0RTtRQUM1RSxPQUFPLElBQUksQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUM5QyxDQUFDLENBQUE7SUFDRCxTQUFTLFNBQVMsQ0FBQyxFQUFPLEVBQUUsRUFBTztRQUNqQyxJQUFNLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUNoQyw0Q0FBNEM7UUFDNUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQzdDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUM3QyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLGlFQUFpRTtRQUNqRSxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUNwQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxPQUFPLEVBQUU7WUFDN0IsQ0FBQyxDQUFDLElBQUksSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFBO1NBQ3hCO1FBQ0QsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsT0FBTyxFQUFFO1lBQy9CLENBQUMsQ0FBQyxLQUFLLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQTtTQUN6QjtRQUNELE9BQU8sQ0FBQyxDQUFBO0lBQ1YsQ0FBQztJQUNELFNBQVMsYUFBYSxDQUFDLFFBQWE7UUFDbEMsd0VBQXdFO1FBQ3hFLElBQU0sT0FBTyxHQUFHLFVBQWdDLFFBQWE7WUFDM0QsSUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN6QyxHQUFHLENBQUMsU0FBUyxHQUFHLGtDQUFrQyxDQUFBO1lBQ2xELElBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDM0MsS0FBSyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUE7WUFDaEMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN0QixJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQzNDLEtBQUssQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFBO1lBQ2hDLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUE7WUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtZQUNuQiwyQ0FBMkM7WUFDM0MsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMzQixDQUFDLENBQUE7UUFDRCxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFVLE9BQVk7WUFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUE7UUFDdEQsQ0FBQyxDQUFBO1FBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxRQUFhLEVBQUUsT0FBWTtZQUM5RCxJQUFJLFFBQVEsSUFBSSxPQUFPLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQTtnQkFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQTtnQkFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7YUFDekU7UUFDSCxDQUFDLENBQUE7UUFDRCw0RUFBNEU7UUFDNUUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUM5QixDQUFDO0lBQ0QsU0FBUyxzQkFBc0IsQ0FBQyxZQUFpQixFQUFFLFNBQWM7UUFDL0QsT0FBTyxDQUNMLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7WUFDOUMsSUFBSTtZQUNKLFlBQVksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FDOUMsQ0FBQTtJQUNILENBQUM7SUFDRCxTQUFTLEtBQUssQ0FBQyxJQUFTLEVBQUUsRUFBTztRQUMvQixJQUFJLElBQUksSUFBSSxJQUFJLElBQUksT0FBTyxJQUFJLElBQUksUUFBUTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3hELElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxLQUFLO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDeEUsSUFDRSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUk7WUFDeEIsSUFBSSxDQUFDLFdBQVcsSUFBSSxNQUFNO1lBQzFCLElBQUksQ0FBQyxXQUFXLElBQUksUUFBUTtZQUM1QixJQUFJLENBQUMsV0FBVyxJQUFJLE1BQU07WUFDMUIsSUFBSSxDQUFDLFdBQVcsSUFBSSxNQUFNO1lBQzFCLElBQUksQ0FBQyxXQUFXLElBQUksT0FBTztZQUUzQixPQUFPLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNuQyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ2pDLEtBQUssSUFBTSxNQUFJLElBQUksSUFBSSxFQUFFO1lBQ3ZCLEVBQUUsQ0FBQyxNQUFJLENBQUM7Z0JBQ04sT0FBTyxFQUFFLENBQUMsTUFBSSxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBSSxDQUFDLENBQUE7U0FDdEU7UUFDRCxPQUFPLEVBQUUsQ0FBQTtJQUNYLENBQUM7SUFDRCxTQUFTLFdBQVcsQ0FBQyxPQUFZLEVBQUUsY0FBbUI7UUFDcEQsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7UUFDdkIsSUFBSSxNQUFNLENBQUE7UUFDVixLQUFLLE1BQU0sSUFBSSxjQUFjLEVBQUU7WUFDN0IsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssU0FBUyxFQUFFO2dCQUNqQyw0RUFBNEU7Z0JBQzVFLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7YUFDaEQ7U0FDRjtJQUNILENBQUM7SUFDRCxlQUFlO0lBQ2YsU0FBUyxXQUFXLENBQUMsT0FBWSxFQUFFLGNBQW1CO1FBQ3BELDRFQUE0RTtRQUM1RSxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQzdCLE1BQU0sQ0FBQTtRQUNSLEtBQUssTUFBTSxJQUFJLGNBQWMsRUFBRTtZQUM3QixJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BDLDRFQUE0RTtnQkFDNUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTthQUNuRDtTQUNGO1FBQ0QsT0FBTyxVQUFVLENBQUE7SUFDbkIsQ0FBQztJQUNELFNBQVMsV0FBVyxDQUFDLFNBQWMsRUFBRSxJQUFTLEVBQUUsUUFBYTtRQUMzRCxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFBO0lBQzVCLENBQUM7SUFDRCxTQUFTLG9CQUFvQixDQUFDLE9BQVk7UUFDeEMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUE7UUFDdkIsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFVLElBQVMsRUFBRSxRQUFhO1lBQ3RELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDbkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDcEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQTtRQUNyQyxDQUFDLENBQUE7UUFDRCxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxLQUFVLEVBQUUsZUFBb0I7WUFDbkUsSUFDRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ3RDO2dCQUNBLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQTtnQkFDYixPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7b0JBQzFELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO2lCQUMxQzthQUNGO2lCQUFNO2dCQUNMLElBQUksZUFBZSxFQUFFO29CQUNuQixlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7aUJBQ3ZCO2FBQ0Y7UUFDSCxDQUFDLENBQUE7SUFDSCxDQUFDO0lBQ0QsT0FBTyxDQUFDLENBQUE7QUFDVixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ0osZUFBZSxVQUFVLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qKlxuICogQ3JlYXRlZCBieSB0aG9tYXMgb24gOS8wMS8xNC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiAoYykgd3d3Lmdlb2NlbnRvLmNvbVxuICogd3d3Lm1ldGFhcHMuY29tXG4gKlxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnY2VzaS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgQ2VzaXVtIGZyb20gJ2Nlc2l1bS9CdWlsZC9DZXNpdW0vQ2VzaXVtJ1xuaW1wb3J0ICogYXMgVHVyZiBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi4vLi4vY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9jZXNpdW0vdXRpbGl0eSdcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCdcbmltcG9ydCBkcmFnSGFsZlN2ZyBmcm9tICchIXJhdy1sb2FkZXIhLi9kcmFnLWhhbGYuc3ZnJ1xuaW1wb3J0IHZlcnRleFN2ZyBmcm9tICchIXJhdy1sb2FkZXIhLi92ZXJ0ZXguc3ZnJ1xuaW1wb3J0IHsgY29udHJhc3RpbmdDb2xvciB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9sb2NhdGlvbi1jb2xvci1zZWxlY3Rvcidcbi8vIEF2b2lkIGNvbmZsaWN0IHdpdGggdGhlIG5hbWUgXywgd2hpY2ggRHJhd0hlbHBlciB1c2VzIGEgbG90XG5jb25zdCBsb2Rhc2ggPSBfXG5jb25zdCBEcmF3SGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gc3RhdGljIHZhcmlhYmxlc1xuICBjb25zdCBlbGxpcHNvaWQgPSBDZXNpdW0uRWxsaXBzb2lkLldHUzg0XG4gIC8vIGNvbnN0cnVjdG9yXG4gIGZ1bmN0aW9uIF8odGhpczogYW55LCBjZXNpdW1XaWRnZXQ6IGFueSkge1xuICAgIHRoaXMuX3NjZW5lID0gY2VzaXVtV2lkZ2V0LnNjZW5lXG4gICAgdGhpcy5fdG9vbHRpcCA9IGNyZWF0ZVRvb2x0aXAoY2VzaXVtV2lkZ2V0LmNvbnRhaW5lcilcbiAgICB0aGlzLl9zdXJmYWNlcyA9IFtdXG4gICAgdGhpcy5pbml0aWFsaXNlSGFuZGxlcnMoKVxuICAgIHRoaXMuZW5oYW5jZVByaW1pdGl2ZXMoKVxuICB9XG4gIF8ucHJvdG90eXBlLmluaXRpYWxpc2VIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzY2VuZSA9IHRoaXMuX3NjZW5lXG4gICAgLy8gc2NlbmUgZXZlbnRzXG4gICAgY29uc3QgaGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoc2NlbmUuY2FudmFzKVxuICAgIGZ1bmN0aW9uIGNhbGxQcmltaXRpdmVDYWxsYmFjayhuYW1lOiBhbnksIHBvc2l0aW9uOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBpY2tlZE9iamVjdCA9IHNjZW5lLnBpY2socG9zaXRpb24pXG4gICAgICBpZiAoXG4gICAgICAgIHBpY2tlZE9iamVjdCAmJlxuICAgICAgICBwaWNrZWRPYmplY3QucHJpbWl0aXZlICYmXG4gICAgICAgIHBpY2tlZE9iamVjdC5wcmltaXRpdmVbbmFtZV1cbiAgICAgICkge1xuICAgICAgICBwaWNrZWRPYmplY3QucHJpbWl0aXZlW25hbWVdKHBvc2l0aW9uKVxuICAgICAgfVxuICAgIH1cbiAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjYWxsUHJpbWl0aXZlQ2FsbGJhY2soJ2xlZnRDbGljaycsIG1vdmVtZW50LnBvc2l0aW9uKVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0NMSUNLKVxuICAgIGhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGNhbGxQcmltaXRpdmVDYWxsYmFjaygnbGVmdERvdWJsZUNsaWNrJywgbW92ZW1lbnQucG9zaXRpb24pXG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfRE9VQkxFX0NMSUNLKVxuICAgIGhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGNhbGxQcmltaXRpdmVDYWxsYmFjaygncmlnaHRDbGljaycsIG1vdmVtZW50LnBvc2l0aW9uKVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5SSUdIVF9DTElDSylcbiAgICBsZXQgbW91c2VPdXRPYmplY3Q6IGFueVxuICAgIGhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGxldCBwaWNrZWRPYmplY3QgPSBzY2VuZS5waWNrKG1vdmVtZW50LmVuZFBvc2l0aW9uKVxuICAgICAgaWYgKFxuICAgICAgICBtb3VzZU91dE9iamVjdCAmJlxuICAgICAgICAoIXBpY2tlZE9iamVjdCB8fCBtb3VzZU91dE9iamVjdCAhPSBwaWNrZWRPYmplY3QucHJpbWl0aXZlKVxuICAgICAgKSB7XG4gICAgICAgICEobW91c2VPdXRPYmplY3QuaXNEZXN0cm95ZWQgJiYgbW91c2VPdXRPYmplY3QuaXNEZXN0cm95ZWQoKSkgJiZcbiAgICAgICAgICBtb3VzZU91dE9iamVjdC5tb3VzZU91dChtb3ZlbWVudC5lbmRQb3NpdGlvbilcbiAgICAgICAgbW91c2VPdXRPYmplY3QgPSBudWxsXG4gICAgICB9XG4gICAgICBpZiAocGlja2VkT2JqZWN0ICYmIHBpY2tlZE9iamVjdC5wcmltaXRpdmUpIHtcbiAgICAgICAgcGlja2VkT2JqZWN0ID0gcGlja2VkT2JqZWN0LnByaW1pdGl2ZVxuICAgICAgICBpZiAocGlja2VkT2JqZWN0Lm1vdXNlT3V0KSB7XG4gICAgICAgICAgbW91c2VPdXRPYmplY3QgPSBwaWNrZWRPYmplY3RcbiAgICAgICAgfVxuICAgICAgICBpZiAocGlja2VkT2JqZWN0Lm1vdXNlTW92ZSkge1xuICAgICAgICAgIHBpY2tlZE9iamVjdC5tb3VzZU1vdmUobW92ZW1lbnQuZW5kUG9zaXRpb24pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjYWxsUHJpbWl0aXZlQ2FsbGJhY2soJ2xlZnRVcCcsIG1vdmVtZW50LnBvc2l0aW9uKVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX1VQKVxuICAgIGhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGNhbGxQcmltaXRpdmVDYWxsYmFjaygnbGVmdERvd24nLCBtb3ZlbWVudC5wb3NpdGlvbilcbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9ET1dOKVxuICB9XG4gIF8ucHJvdG90eXBlLnNldExpc3RlbmVyID0gZnVuY3Rpb24gKFxuICAgIHByaW1pdGl2ZTogYW55LFxuICAgIHR5cGU6IGFueSxcbiAgICBjYWxsYmFjazogYW55XG4gICkge1xuICAgIHByaW1pdGl2ZVt0eXBlXSA9IGNhbGxiYWNrXG4gIH1cbiAgLy8gcmVnaXN0ZXIgZXZlbnQgaGFuZGxpbmcgZm9yIGFuIGVkaXRhYmxlIHNoYXBlXG4gIC8vIHNoYXBlIHNob3VsZCBpbXBsZW1lbnQgc2V0RWRpdE1vZGUgYW5kIHNldEhpZ2hsaWdodGVkXG4gIF8ucHJvdG90eXBlLnJlZ2lzdGVyRWRpdGFibGVTaGFwZSA9IGZ1bmN0aW9uIChzdXJmYWNlOiBhbnkpIHtcbiAgICBjb25zdCBfc2VsZiA9IHRoaXNcbiAgICAvLyBoYW5kbGVycyBmb3IgaW50ZXJhY3Rpb25zXG4gICAgLy8gaGlnaGxpZ2h0IHBvbHlnb24gd2hlbiBtb3VzZSBpcyBlbnRlcmluZ1xuICAgIHNldExpc3RlbmVyKHN1cmZhY2UsICdtb3VzZU1vdmUnLCAocG9zaXRpb246IGFueSkgPT4ge1xuICAgICAgc3VyZmFjZS5zZXRIaWdobGlnaHRlZCh0cnVlKVxuICAgICAgaWYgKCFzdXJmYWNlLl9lZGl0TW9kZSkge1xuICAgICAgICBfc2VsZi5fdG9vbHRpcC5zaG93QXQocG9zaXRpb24sICdDbGljayB0byBlZGl0IHRoaXMgc2hhcGUnKVxuICAgICAgfVxuICAgIH0pXG4gICAgLy8gaGlkZSB0aGUgaGlnaGxpZ2h0aW5nIHdoZW4gbW91c2UgaXMgbGVhdmluZyB0aGUgcG9seWdvblxuICAgIHNldExpc3RlbmVyKHN1cmZhY2UsICdtb3VzZU91dCcsICgpID0+IHtcbiAgICAgIHN1cmZhY2Uuc2V0SGlnaGxpZ2h0ZWQoZmFsc2UpXG4gICAgICBfc2VsZi5fdG9vbHRpcC5zZXRWaXNpYmxlKGZhbHNlKVxuICAgIH0pXG4gICAgc2V0TGlzdGVuZXIoc3VyZmFjZSwgJ2xlZnRDbGljaycsICgpID0+IHtcbiAgICAgIHN1cmZhY2Uuc2V0RWRpdE1vZGUodHJ1ZSlcbiAgICB9KVxuICB9XG4gIF8ucHJvdG90eXBlLnN0YXJ0RHJhd2luZyA9IGZ1bmN0aW9uIChjbGVhblVwOiBhbnkpIHtcbiAgICAvLyBjaGVjayBmb3IgY2xlYW5VcCBmaXJzdFxuICAgIGlmICh0aGlzLmVkaXRDbGVhblVwKSB7XG4gICAgICB0aGlzLmVkaXRDbGVhblVwKClcbiAgICB9XG4gICAgdGhpcy5lZGl0Q2xlYW5VcCA9IGNsZWFuVXBcbiAgfVxuICBfLnByb3RvdHlwZS5zdG9wRHJhd2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjaGVjayBmb3IgY2xlYW5VcCBmaXJzdFxuICAgIGlmICh0aGlzLmVkaXRDbGVhblVwKSB7XG4gICAgICB0aGlzLmVkaXRDbGVhblVwKClcbiAgICAgIHRoaXMuZWRpdENsZWFuVXAgPSBudWxsXG4gICAgfVxuICB9XG4gIC8vIG1ha2Ugc3VyZSBvbmx5IG9uZSBzaGFwZSBpcyBoaWdobGlnaHRlZCBhdCBhIHRpbWVcbiAgXy5wcm90b3R5cGUuZGlzYWJsZUFsbEhpZ2hsaWdodHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRIaWdobGlnaHRlZCh1bmRlZmluZWQpXG4gIH1cbiAgXy5wcm90b3R5cGUuc2V0SGlnaGxpZ2h0ZWQgPSBmdW5jdGlvbiAoc3VyZmFjZTogYW55KSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5faGlnaGxpZ2h0ZWRTdXJmYWNlICYmXG4gICAgICAhdGhpcy5faGlnaGxpZ2h0ZWRTdXJmYWNlLmlzRGVzdHJveWVkKCkgJiZcbiAgICAgIHRoaXMuX2hpZ2hsaWdodGVkU3VyZmFjZSAhPSBzdXJmYWNlXG4gICAgKSB7XG4gICAgICB0aGlzLl9oaWdobGlnaHRlZFN1cmZhY2Uuc2V0SGlnaGxpZ2h0ZWQoZmFsc2UpXG4gICAgfVxuICAgIHRoaXMuX2hpZ2hsaWdodGVkU3VyZmFjZSA9IHN1cmZhY2VcbiAgfVxuICBfLnByb3RvdHlwZS5kaXNhYmxlQWxsRWRpdE1vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRFZGl0ZWQodW5kZWZpbmVkKVxuICB9XG4gIF8ucHJvdG90eXBlLnNldEVkaXRlZCA9IGZ1bmN0aW9uIChzdXJmYWNlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5fZWRpdGVkU3VyZmFjZSAmJiAhdGhpcy5fZWRpdGVkU3VyZmFjZS5pc0Rlc3Ryb3llZCgpKSB7XG4gICAgICB0aGlzLl9lZGl0ZWRTdXJmYWNlLnNldEVkaXRNb2RlKGZhbHNlKVxuICAgIH1cbiAgICB0aGlzLl9lZGl0ZWRTdXJmYWNlID0gc3VyZmFjZVxuICB9XG4gIGNvbnN0IG1hdGVyaWFsID0gQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKENlc2l1bS5NYXRlcmlhbC5Db2xvclR5cGUpXG4gIG1hdGVyaWFsLnVuaWZvcm1zLmNvbG9yID0gbmV3IENlc2l1bS5Db2xvcigxLjAsIDEuMCwgMC4wLCAwLjUpXG4gIGNvbnN0IGRlZmF1bHRTaGFwZU9wdGlvbnMgPSB7XG4gICAgZWxsaXBzb2lkOiBDZXNpdW0uRWxsaXBzb2lkLldHUzg0LFxuICAgIHRleHR1cmVSb3RhdGlvbkFuZ2xlOiAwLjAsXG4gICAgaGVpZ2h0OiAwLjAsXG4gICAgYXN5bmNocm9ub3VzOiB0cnVlLFxuICAgIHNob3c6IHRydWUsXG4gICAgZGVidWdTaG93Qm91bmRpbmdWb2x1bWU6IGZhbHNlLFxuICB9XG4gIGxldCBkZWZhdWx0U3VyZmFjZU9wdGlvbnMgPSBjb3B5T3B0aW9ucyhkZWZhdWx0U2hhcGVPcHRpb25zLCB7XG4gICAgYXBwZWFyYW5jZTogbmV3IENlc2l1bS5FbGxpcHNvaWRTdXJmYWNlQXBwZWFyYW5jZSh7XG4gICAgICBhYm92ZUdyb3VuZDogZmFsc2UsXG4gICAgfSksXG4gICAgbWF0ZXJpYWwsXG4gICAgZ3JhbnVsYXJpdHk6IE1hdGguUEkgLyAxODAuMCxcbiAgfSlcbiAgbGV0IGRlZmF1bHRQb2x5Z29uT3B0aW9ucyA9IGNvcHlPcHRpb25zKGRlZmF1bHRTaGFwZU9wdGlvbnMsIHt9KVxuICBsZXQgZGVmYXVsdEV4dGVudE9wdGlvbnMgPSBjb3B5T3B0aW9ucyhkZWZhdWx0U2hhcGVPcHRpb25zLCB7fSlcbiAgbGV0IGRlZmF1bHRDaXJjbGVPcHRpb25zID0gY29weU9wdGlvbnMoZGVmYXVsdFNoYXBlT3B0aW9ucywge30pXG4gIGxldCBkZWZhdWx0RWxsaXBzZU9wdGlvbnMgPSBjb3B5T3B0aW9ucyhkZWZhdWx0U3VyZmFjZU9wdGlvbnMsIHtcbiAgICByb3RhdGlvbjogMCxcbiAgfSlcbiAgbGV0IGRlZmF1bHRQb2x5bGluZU9wdGlvbnMgPSBjb3B5T3B0aW9ucyhkZWZhdWx0U2hhcGVPcHRpb25zLCB7XG4gICAgd2lkdGg6IDUsXG4gICAgZ2VvZGVzaWM6IHRydWUsXG4gICAgZ3JhbnVsYXJpdHk6IDEwMDAwLFxuICAgIGFwcGVhcmFuY2U6IG5ldyBDZXNpdW0uUG9seWxpbmVNYXRlcmlhbEFwcGVhcmFuY2Uoe1xuICAgICAgYWJvdmVHcm91bmQ6IGZhbHNlLFxuICAgIH0pLFxuICAgIG1hdGVyaWFsLFxuICB9KVxuICAvLyAgICBDZXNpdW0uUG9seWdvbi5wcm90b3R5cGUuc2V0U3Ryb2tlU3R5bGUgPSBzZXRTdHJva2VTdHlsZTtcbiAgLy9cbiAgLy8gICAgQ2VzaXVtLlBvbHlnb24ucHJvdG90eXBlLmRyYXdPdXRsaW5lID0gZHJhd091dGxpbmU7XG4gIC8vXG4gIGNvbnN0IENoYW5nZWFibGVQcmltaXRpdmUgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIF8oKSB7fVxuICAgIF8ucHJvdG90eXBlLmluaXRpYWxpc2VPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnM6IGFueSkge1xuICAgICAgZmlsbE9wdGlvbnModGhpcywgb3B0aW9ucylcbiAgICAgIHRoaXMuX2VsbGlwc29pZCA9IHVuZGVmaW5lZFxuICAgICAgdGhpcy5fZ3JhbnVsYXJpdHkgPSB1bmRlZmluZWRcbiAgICAgIHRoaXMuX2hlaWdodCA9IHVuZGVmaW5lZFxuICAgICAgdGhpcy5fdGV4dHVyZVJvdGF0aW9uQW5nbGUgPSB1bmRlZmluZWRcbiAgICAgIHRoaXMuX2lkID0gdW5kZWZpbmVkXG4gICAgICAvLyBzZXQgdGhlIGZsYWdzIHRvIGluaXRpYXRlIGEgZmlyc3QgZHJhd2luZ1xuICAgICAgdGhpcy5fY3JlYXRlUHJpbWl0aXZlID0gdHJ1ZVxuICAgICAgdGhpcy5fcHJpbWl0aXZlID0gdW5kZWZpbmVkXG4gICAgICB0aGlzLl9vdXRsaW5lUG9seWdvbiA9IHVuZGVmaW5lZFxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZTogYW55LCB2YWx1ZTogYW55KSB7XG4gICAgICB0aGlzW25hbWVdID0gdmFsdWVcbiAgICAgIHRoaXMuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0QXR0cmlidXRlID0gZnVuY3Rpb24gKG5hbWU6IGFueSkge1xuICAgICAgcmV0dXJuIHRoaXNbbmFtZV1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoXG4gICAgICBjb250ZXh0OiBhbnksXG4gICAgICBmcmFtZVN0YXRlOiBhbnksXG4gICAgICBjb21tYW5kTGlzdDogYW55XG4gICAgKSB7XG4gICAgICBpZiAoIUNlc2l1bS5kZWZpbmVkKHRoaXMuZWxsaXBzb2lkKSkge1xuICAgICAgICB0aHJvdyBuZXcgQ2VzaXVtLkRldmVsb3BlckVycm9yKCd0aGlzLmVsbGlwc29pZCBtdXN0IGJlIGRlZmluZWQuJylcbiAgICAgIH1cbiAgICAgIGlmICghQ2VzaXVtLmRlZmluZWQodGhpcy5hcHBlYXJhbmNlKSkge1xuICAgICAgICB0aHJvdyBuZXcgQ2VzaXVtLkRldmVsb3BlckVycm9yKCd0aGlzLm1hdGVyaWFsIG11c3QgYmUgZGVmaW5lZC4nKVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZ3JhbnVsYXJpdHkgPCAwLjApIHtcbiAgICAgICAgdGhyb3cgbmV3IENlc2l1bS5EZXZlbG9wZXJFcnJvcihcbiAgICAgICAgICAndGhpcy5ncmFudWxhcml0eSBhbmQgc2NlbmUyRC9zY2VuZTNEIG92ZXJyaWRlcyBtdXN0IGJlIGdyZWF0ZXIgdGhhbiB6ZXJvLidcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnNob3cpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX2NyZWF0ZVByaW1pdGl2ZSAmJiAhQ2VzaXVtLmRlZmluZWQodGhpcy5fcHJpbWl0aXZlKSkge1xuICAgICAgICAvLyBObyBwb3NpdGlvbnMvaGllcmFyY2h5IHRvIGRyYXdcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX2NyZWF0ZVByaW1pdGl2ZSB8fFxuICAgICAgICB0aGlzLl9lbGxpcHNvaWQgIT09IHRoaXMuZWxsaXBzb2lkIHx8XG4gICAgICAgIHRoaXMuX2dyYW51bGFyaXR5ICE9PSB0aGlzLmdyYW51bGFyaXR5IHx8XG4gICAgICAgIHRoaXMuX2hlaWdodCAhPT0gdGhpcy5oZWlnaHQgfHxcbiAgICAgICAgdGhpcy5fdGV4dHVyZVJvdGF0aW9uQW5nbGUgIT09IHRoaXMudGV4dHVyZVJvdGF0aW9uQW5nbGUgfHxcbiAgICAgICAgdGhpcy5faWQgIT09IHRoaXMuaWRcbiAgICAgICkge1xuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IHRoaXMuZ2V0R2VvbWV0cnkoKVxuICAgICAgICBpZiAoIWdlb21ldHJ5KSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3JlYXRlUHJpbWl0aXZlID0gZmFsc2VcbiAgICAgICAgdGhpcy5fZWxsaXBzb2lkID0gdGhpcy5lbGxpcHNvaWRcbiAgICAgICAgdGhpcy5fZ3JhbnVsYXJpdHkgPSB0aGlzLmdyYW51bGFyaXR5XG4gICAgICAgIHRoaXMuX2hlaWdodCA9IHRoaXMuaGVpZ2h0XG4gICAgICAgIHRoaXMuX3RleHR1cmVSb3RhdGlvbkFuZ2xlID0gdGhpcy50ZXh0dXJlUm90YXRpb25BbmdsZVxuICAgICAgICB0aGlzLl9pZCA9IHRoaXMuaWRcbiAgICAgICAgdGhpcy5fcHJpbWl0aXZlID0gdGhpcy5fcHJpbWl0aXZlICYmIHRoaXMuX3ByaW1pdGl2ZS5kZXN0cm95KClcbiAgICAgICAgdGhpcy5fcHJpbWl0aXZlID0gbmV3IENlc2l1bS5QcmltaXRpdmUoe1xuICAgICAgICAgIGdlb21ldHJ5SW5zdGFuY2VzOiBuZXcgQ2VzaXVtLkdlb21ldHJ5SW5zdGFuY2Uoe1xuICAgICAgICAgICAgZ2VvbWV0cnksXG4gICAgICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgICAgIHBpY2tQcmltaXRpdmU6IHRoaXMsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgYXBwZWFyYW5jZTogdGhpcy5hcHBlYXJhbmNlLFxuICAgICAgICAgIGFzeW5jaHJvbm91czogdGhpcy5hc3luY2hyb25vdXMsXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuX291dGxpbmVQb2x5Z29uID1cbiAgICAgICAgICB0aGlzLl9vdXRsaW5lUG9seWdvbiAmJiB0aGlzLl9vdXRsaW5lUG9seWdvbi5kZXN0cm95KClcbiAgICAgICAgaWYgKHRoaXMuYnVmZmVyICYmIHRoaXMuZ2V0T3V0bGluZUdlb21ldHJ5KSB7XG4gICAgICAgICAgY29uc3Qgb3V0bGluZUdlb21ldHJ5ID0gdGhpcy5nZXRPdXRsaW5lR2VvbWV0cnkoKVxuICAgICAgICAgIGlmIChvdXRsaW5lR2VvbWV0cnkpIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgaGlnaGxpZ2h0aW5nIGZyYW1lXG4gICAgICAgICAgICB0aGlzLl9vdXRsaW5lUG9seWdvbiA9IG5ldyBDZXNpdW0uUHJpbWl0aXZlKHtcbiAgICAgICAgICAgICAgZ2VvbWV0cnlJbnN0YW5jZXM6IG5ldyBDZXNpdW0uR2VvbWV0cnlJbnN0YW5jZSh7XG4gICAgICAgICAgICAgICAgZ2VvbWV0cnk6IG91dGxpbmVHZW9tZXRyeSxcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogQ2VzaXVtLkNvbG9yR2VvbWV0cnlJbnN0YW5jZUF0dHJpYnV0ZS5mcm9tQ29sb3IoXG4gICAgICAgICAgICAgICAgICAgIENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29udHJhc3RpbmdDb2xvcilcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGFwcGVhcmFuY2U6IG5ldyBDZXNpdW0uUG9seWxpbmVNYXRlcmlhbEFwcGVhcmFuY2Uoe1xuICAgICAgICAgICAgICAgIG1hdGVyaWFsOiBDZXNpdW0uTWF0ZXJpYWwuZnJvbVR5cGUoJ0NvbG9yJywge1xuICAgICAgICAgICAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvci5mcm9tQ3NzQ29sb3JTdHJpbmcoY29udHJhc3RpbmdDb2xvciksXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHByaW1pdGl2ZSA9IHRoaXMuX3ByaW1pdGl2ZVxuICAgICAgcHJpbWl0aXZlLmFwcGVhcmFuY2UubWF0ZXJpYWwgPSB0aGlzLm1hdGVyaWFsXG4gICAgICBwcmltaXRpdmUuZGVidWdTaG93Qm91bmRpbmdWb2x1bWUgPSB0aGlzLmRlYnVnU2hvd0JvdW5kaW5nVm9sdW1lXG4gICAgICBwcmltaXRpdmUudXBkYXRlKGNvbnRleHQsIGZyYW1lU3RhdGUsIGNvbW1hbmRMaXN0KVxuICAgICAgaWYgKHRoaXMuX291dGxpbmVQb2x5Z29uKSB7XG4gICAgICAgIHRoaXMuX291dGxpbmVQb2x5Z29uLnVwZGF0ZShjb250ZXh0LCBmcmFtZVN0YXRlLCBjb21tYW5kTGlzdClcbiAgICAgIH1cbiAgICB9XG4gICAgXy5wcm90b3R5cGUuaXNEZXN0cm95ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX3ByaW1pdGl2ZSA9IHRoaXMuX3ByaW1pdGl2ZSAmJiB0aGlzLl9wcmltaXRpdmUuZGVzdHJveSgpXG4gICAgICByZXR1cm4gQ2VzaXVtLmRlc3Ryb3lPYmplY3QodGhpcylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuc2V0U3Ryb2tlU3R5bGUgPSBmdW5jdGlvbiAoc3Ryb2tlQ29sb3I6IGFueSwgc3Ryb2tlV2lkdGg6IGFueSkge1xuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5zdHJva2VDb2xvciB8fFxuICAgICAgICAhdGhpcy5zdHJva2VDb2xvci5lcXVhbHMoc3Ryb2tlQ29sb3IpIHx8XG4gICAgICAgIHRoaXMuc3Ryb2tlV2lkdGggIT0gc3Ryb2tlV2lkdGhcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9jcmVhdGVQcmltaXRpdmUgPSB0cnVlXG4gICAgICAgIHRoaXMuc3Ryb2tlQ29sb3IgPSBzdHJva2VDb2xvclxuICAgICAgICB0aGlzLnN0cm9rZVdpZHRoID0gc3Ryb2tlV2lkdGhcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9cbiAgfSkoKVxuICBfLkV4dGVudFByaW1pdGl2ZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMDApIEZJWE1FOiBEdXBsaWNhdGUgaWRlbnRpZmllciAndGhpcycuXG4gICAgZnVuY3Rpb24gXyh0aGlzOiBhbnksIHRoaXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBpZiAoIUNlc2l1bS5kZWZpbmVkKG9wdGlvbnMuZXh0ZW50KSkge1xuICAgICAgICB0aHJvdyBuZXcgQ2VzaXVtLkRldmVsb3BlckVycm9yKCdFeHRlbnQgaXMgcmVxdWlyZWQnKVxuICAgICAgfVxuICAgICAgb3B0aW9ucyA9IGNvcHlPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRTdXJmYWNlT3B0aW9ucylcbiAgICAgIHRoaXMuaW5pdGlhbGlzZU9wdGlvbnMob3B0aW9ucylcbiAgICAgIHRoaXMuc2V0RXh0ZW50KG9wdGlvbnMuZXh0ZW50KVxuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBfLnByb3RvdHlwZSA9IG5ldyBDaGFuZ2VhYmxlUHJpbWl0aXZlKClcbiAgICBfLnByb3RvdHlwZS5zZXRFeHRlbnQgPSBmdW5jdGlvbiAoZXh0ZW50OiBhbnkpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdleHRlbnQnLCBleHRlbnQpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldEV4dGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgnZXh0ZW50JylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0R2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIUNlc2l1bS5kZWZpbmVkKHRoaXMuZXh0ZW50KSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtcbiAgICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbVJhZGlhbnModGhpcy5leHRlbnQud2VzdCwgdGhpcy5leHRlbnQuc291dGgpLFxuICAgICAgICBDZXNpdW0uQ2FydGVzaWFuMy5mcm9tUmFkaWFucyh0aGlzLmV4dGVudC53ZXN0LCB0aGlzLmV4dGVudC5ub3J0aCksXG4gICAgICAgIENlc2l1bS5DYXJ0ZXNpYW4zLmZyb21SYWRpYW5zKHRoaXMuZXh0ZW50LmVhc3QsIHRoaXMuZXh0ZW50Lm5vcnRoKSxcbiAgICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbVJhZGlhbnModGhpcy5leHRlbnQuZWFzdCwgdGhpcy5leHRlbnQuc291dGgpLFxuICAgICAgICBDZXNpdW0uQ2FydGVzaWFuMy5mcm9tUmFkaWFucyh0aGlzLmV4dGVudC53ZXN0LCB0aGlzLmV4dGVudC5zb3V0aCksXG4gICAgICBdXG4gICAgICAvLyBEaXNwbGF5IGEgUG9seWdvbkdlb21ldHJ5IGluc3RlYWQgb2YgYSBSZWN0YW5nbGVHZW9tZXRyeSBiZWNhdXNlIFJlY3RhbmdsZUdlb21ldHJpZXNcbiAgICAgIC8vIGFwcGVhciB0byBhbHdheXMgd3JhcCB0aGUgbG9uZyB3YXkgYXJvdW5kIHRoZSBhbnRpbWVyaWRpYW4uXG4gICAgICByZXR1cm4gQ2VzaXVtLlBvbHlnb25HZW9tZXRyeS5mcm9tUG9zaXRpb25zKHtcbiAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICBzdFJvdGF0aW9uOiB0aGlzLnRleHR1cmVSb3RhdGlvbkFuZ2xlLFxuICAgICAgICBlbGxpcHNvaWQ6IHRoaXMuZWxsaXBzb2lkLFxuICAgICAgICBncmFudWxhcml0eTogdGhpcy5ncmFudWxhcml0eSxcbiAgICAgIH0pXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldE91dGxpbmVHZW9tZXRyeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgQ2VzaXVtLlJlY3RhbmdsZU91dGxpbmVHZW9tZXRyeSh7XG4gICAgICAgIHJlY3RhbmdsZTogdGhpcy5leHRlbnQsXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gX1xuICB9KSgpXG4gIF8uUG9seWdvblByaW1pdGl2ZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMDApIEZJWE1FOiBEdXBsaWNhdGUgaWRlbnRpZmllciAndGhpcycuXG4gICAgZnVuY3Rpb24gXyh0aGlzOiBhbnksIHRoaXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBvcHRpb25zID0gY29weU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdFN1cmZhY2VPcHRpb25zKVxuICAgICAgdGhpcy5pbml0aWFsaXNlT3B0aW9ucyhvcHRpb25zKVxuICAgICAgdGhpcy5pc1BvbHlnb24gPSB0cnVlXG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgIF8ucHJvdG90eXBlID0gbmV3IENoYW5nZWFibGVQcmltaXRpdmUoKVxuICAgIF8ucHJvdG90eXBlLnNldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIChwb3NpdGlvbnM6IGFueSkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9ucycsIHBvc2l0aW9ucylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0UG9zaXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbnMnKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRHZW9tZXRyeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghQ2VzaXVtLmRlZmluZWQodGhpcy5wb3NpdGlvbnMpIHx8IHRoaXMucG9zaXRpb25zLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICByZXR1cm4gQ2VzaXVtLlBvbHlnb25HZW9tZXRyeS5mcm9tUG9zaXRpb25zKHtcbiAgICAgICAgcG9zaXRpb25zOiB0aGlzLnBvc2l0aW9ucyxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgc3RSb3RhdGlvbjogdGhpcy50ZXh0dXJlUm90YXRpb25BbmdsZSxcbiAgICAgICAgZWxsaXBzb2lkOiB0aGlzLmVsbGlwc29pZCxcbiAgICAgICAgZ3JhbnVsYXJpdHk6IHRoaXMuZ3JhbnVsYXJpdHksXG4gICAgICB9KVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRPdXRsaW5lR2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoXG4gICAgICAgICFDZXNpdW0uZGVmaW5lZCh0aGlzLnBvc2l0aW9ucykgfHxcbiAgICAgICAgdGhpcy5wb3NpdGlvbnMubGVuZ3RoIDwgMyB8fFxuICAgICAgICAhdGhpcy5idWZmZXJcbiAgICAgICkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gdGhpcy5wb3NpdGlvbnMubWFwKChwb3M6IENlc2l1bS5DYXJ0ZXNpYW4zKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpYyA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbUNhcnRlc2lhbihwb3MpXG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgQ2VzaXVtLk1hdGgudG9EZWdyZWVzKGNhcnRvZ3JhcGhpYy5sb25naXR1ZGUpLFxuICAgICAgICAgIENlc2l1bS5NYXRoLnRvRGVncmVlcyhjYXJ0b2dyYXBoaWMubGF0aXR1ZGUpLFxuICAgICAgICAgIGNhcnRvZ3JhcGhpYy5hbHRpdHVkZSxcbiAgICAgICAgXVxuICAgICAgfSlcblxuICAgICAgY29uc3QgYWRqdXN0ZWRQb2x5Z29uID0gVHVyZi5wb2x5Z29uKFtjb29yZGluYXRlc10pXG4gICAgICB1dGlsaXR5LmFkanVzdEdlb0Nvb3JkcyhhZGp1c3RlZFBvbHlnb24pXG5cbiAgICAgIGNvbnN0IGJ1ZmZlcmVkUG9seWdvbiA9IFR1cmYuYnVmZmVyKFxuICAgICAgICBhZGp1c3RlZFBvbHlnb24sXG4gICAgICAgIE1hdGgubWF4KHRoaXMuYnVmZmVyLCAxKSxcbiAgICAgICAge1xuICAgICAgICAgIHVuaXRzOiAnbWV0ZXJzJyxcbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgaWYgKCFidWZmZXJlZFBvbHlnb24pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBuZWVkIHRvIGFkanVzdCB0aGUgcG9pbnRzIGFnYWluIEFGVEVSIGJ1ZmZlcmluZywgc2luY2UgYnVmZmVyaW5nIHVuZG9lcyB0aGUgYW50aW1lcmlkaWFuIGFkanVzdG1lbnRzXG4gICAgICB1dGlsaXR5LmFkanVzdEdlb0Nvb3JkcyhidWZmZXJlZFBvbHlnb24pXG4gICAgICBjb25zdCBvdXRsaW5lUG9zaXRpb25zID0gYnVmZmVyZWRQb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLm1hcChcbiAgICAgICAgKGNvb3JkKSA9PiBDZXNpdW0uQ2FydGVzaWFuMy5mcm9tRGVncmVlcyhjb29yZFswXSwgY29vcmRbMV0sIGNvb3JkWzJdKVxuICAgICAgKVxuICAgICAgcmV0dXJuIG5ldyBDZXNpdW0uUG9seWxpbmVHZW9tZXRyeSh7XG4gICAgICAgIHBvc2l0aW9uczogb3V0bGluZVBvc2l0aW9ucyxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGggPCAxID8gMSA6IHRoaXMud2lkdGgsXG4gICAgICAgIGVsbGlwc29pZDogdGhpcy5lbGxpcHNvaWQsXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gX1xuICB9KSgpXG4gIF8uQ2lyY2xlUHJpbWl0aXZlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMwMCkgRklYTUU6IER1cGxpY2F0ZSBpZGVudGlmaWVyICd0aGlzJy5cbiAgICBmdW5jdGlvbiBfKHRoaXM6IGFueSwgdGhpczogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIGlmICghKENlc2l1bS5kZWZpbmVkKG9wdGlvbnMuY2VudGVyKSAmJiBDZXNpdW0uZGVmaW5lZChvcHRpb25zLnJhZGl1cykpKSB7XG4gICAgICAgIHRocm93IG5ldyBDZXNpdW0uRGV2ZWxvcGVyRXJyb3IoJ0NlbnRlciBhbmQgcmFkaXVzIGFyZSByZXF1aXJlZCcpXG4gICAgICB9XG4gICAgICBvcHRpb25zID0gY29weU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdFN1cmZhY2VPcHRpb25zKVxuICAgICAgdGhpcy5pbml0aWFsaXNlT3B0aW9ucyhvcHRpb25zKVxuICAgICAgdGhpcy5zZXRSYWRpdXMob3B0aW9ucy5yYWRpdXMpXG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgIF8ucHJvdG90eXBlID0gbmV3IENoYW5nZWFibGVQcmltaXRpdmUoKVxuICAgIF8ucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uIChjZW50ZXI6IGFueSkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2NlbnRlcicsIGNlbnRlcilcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuc2V0UmFkaXVzID0gZnVuY3Rpb24gKHJhZGl1czogYW55KSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgncmFkaXVzJywgTWF0aC5tYXgoMC4xLCByYWRpdXMpKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2NlbnRlcicpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldFJhZGl1cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgncmFkaXVzJylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0R2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIShDZXNpdW0uZGVmaW5lZCh0aGlzLmNlbnRlcikgJiYgQ2VzaXVtLmRlZmluZWQodGhpcy5yYWRpdXMpKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQ2VzaXVtLkNpcmNsZUdlb21ldHJ5KHtcbiAgICAgICAgY2VudGVyOiB0aGlzLmNlbnRlcixcbiAgICAgICAgcmFkaXVzOiB0aGlzLnJhZGl1cyxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgc3RSb3RhdGlvbjogdGhpcy50ZXh0dXJlUm90YXRpb25BbmdsZSxcbiAgICAgICAgZWxsaXBzb2lkOiB0aGlzLmVsbGlwc29pZCxcbiAgICAgICAgZ3JhbnVsYXJpdHk6IHRoaXMuZ3JhbnVsYXJpdHksXG4gICAgICB9KVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRPdXRsaW5lR2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IENlc2l1bS5DaXJjbGVPdXRsaW5lR2VvbWV0cnkoe1xuICAgICAgICBjZW50ZXI6IHRoaXMuZ2V0Q2VudGVyKCksXG4gICAgICAgIHJhZGl1czogdGhpcy5nZXRSYWRpdXMoKSxcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBfXG4gIH0pKClcbiAgXy5FbGxpcHNlUHJpbWl0aXZlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBfKHRoaXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBpZiAoXG4gICAgICAgICEoXG4gICAgICAgICAgQ2VzaXVtLmRlZmluZWQob3B0aW9ucy5jZW50ZXIpICYmXG4gICAgICAgICAgQ2VzaXVtLmRlZmluZWQob3B0aW9ucy5zZW1pTWFqb3JBeGlzKSAmJlxuICAgICAgICAgIENlc2l1bS5kZWZpbmVkKG9wdGlvbnMuc2VtaU1pbm9yQXhpcylcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBDZXNpdW0uRGV2ZWxvcGVyRXJyb3IoXG4gICAgICAgICAgJ0NlbnRlciBhbmQgc2VtaSBtYWpvciBhbmQgc2VtaSBtaW5vciBheGlzIGFyZSByZXF1aXJlZCdcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgb3B0aW9ucyA9IGNvcHlPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRFbGxpcHNlT3B0aW9ucylcbiAgICAgIHRoaXMuaW5pdGlhbGlzZU9wdGlvbnMob3B0aW9ucylcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgXy5wcm90b3R5cGUgPSBuZXcgQ2hhbmdlYWJsZVByaW1pdGl2ZSgpXG4gICAgXy5wcm90b3R5cGUuc2V0Q2VudGVyID0gZnVuY3Rpb24gKGNlbnRlcjogYW55KSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnY2VudGVyJywgY2VudGVyKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5zZXRTZW1pTWFqb3JBeGlzID0gZnVuY3Rpb24gKHNlbWlNYWpvckF4aXM6IGFueSkge1xuICAgICAgaWYgKHNlbWlNYWpvckF4aXMgPCB0aGlzLmdldFNlbWlNaW5vckF4aXMoKSkgcmV0dXJuXG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnc2VtaU1ham9yQXhpcycsIHNlbWlNYWpvckF4aXMpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLnNldFNlbWlNaW5vckF4aXMgPSBmdW5jdGlvbiAoc2VtaU1pbm9yQXhpczogYW55KSB7XG4gICAgICBpZiAoc2VtaU1pbm9yQXhpcyA+IHRoaXMuZ2V0U2VtaU1ham9yQXhpcygpKSByZXR1cm5cbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdzZW1pTWlub3JBeGlzJywgc2VtaU1pbm9yQXhpcylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuc2V0Um90YXRpb24gPSBmdW5jdGlvbiAocm90YXRpb246IGFueSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cmlidXRlKCdyb3RhdGlvbicsIHJvdGF0aW9uKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2NlbnRlcicpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldFNlbWlNYWpvckF4aXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ3NlbWlNYWpvckF4aXMnKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRTZW1pTWlub3JBeGlzID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdzZW1pTWlub3JBeGlzJylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0Um90YXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ3JvdGF0aW9uJylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0R2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoXG4gICAgICAgICEoXG4gICAgICAgICAgQ2VzaXVtLmRlZmluZWQodGhpcy5jZW50ZXIpICYmXG4gICAgICAgICAgQ2VzaXVtLmRlZmluZWQodGhpcy5zZW1pTWFqb3JBeGlzKSAmJlxuICAgICAgICAgIENlc2l1bS5kZWZpbmVkKHRoaXMuc2VtaU1pbm9yQXhpcylcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDZXNpdW0uRWxsaXBzZUdlb21ldHJ5KHtcbiAgICAgICAgZWxsaXBzb2lkOiB0aGlzLmVsbGlwc29pZCxcbiAgICAgICAgY2VudGVyOiB0aGlzLmNlbnRlcixcbiAgICAgICAgc2VtaU1ham9yQXhpczogdGhpcy5zZW1pTWFqb3JBeGlzLFxuICAgICAgICBzZW1pTWlub3JBeGlzOiB0aGlzLnNlbWlNaW5vckF4aXMsXG4gICAgICAgIHJvdGF0aW9uOiB0aGlzLnJvdGF0aW9uLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICB2ZXJ0ZXhGb3JtYXQ6IENlc2l1bS5FbGxpcHNvaWRTdXJmYWNlQXBwZWFyYW5jZS5WRVJURVhfRk9STUFULFxuICAgICAgICBzdFJvdGF0aW9uOiB0aGlzLnRleHR1cmVSb3RhdGlvbkFuZ2xlLFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMTExNykgRklYTUU6IEFuIG9iamVjdCBsaXRlcmFsIGNhbm5vdCBoYXZlIG11bHRpcGxlIHByb3BlcnRpZXMgLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgZWxsaXBzb2lkOiB0aGlzLmVsbGlwc29pZCxcbiAgICAgICAgZ3JhbnVsYXJpdHk6IHRoaXMuZ3JhbnVsYXJpdHksXG4gICAgICB9KVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRPdXRsaW5lR2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IENlc2l1bS5FbGxpcHNlT3V0bGluZUdlb21ldHJ5KHtcbiAgICAgICAgY2VudGVyOiB0aGlzLmdldENlbnRlcigpLFxuICAgICAgICBzZW1pTWFqb3JBeGlzOiB0aGlzLmdldFNlbWlNYWpvckF4aXMoKSxcbiAgICAgICAgc2VtaU1pbm9yQXhpczogdGhpcy5nZXRTZW1pTWlub3JBeGlzKCksXG4gICAgICAgIHJvdGF0aW9uOiB0aGlzLmdldFJvdGF0aW9uKCksXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gX1xuICB9KSgpXG4gIF8uUG9seWxpbmVQcmltaXRpdmUgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIF8odGhpczogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0UG9seWxpbmVPcHRpb25zKVxuICAgICAgdGhpcy5pbml0aWFsaXNlT3B0aW9ucyhvcHRpb25zKVxuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBfLnByb3RvdHlwZSA9IG5ldyBDaGFuZ2VhYmxlUHJpbWl0aXZlKClcbiAgICBfLnByb3RvdHlwZS5zZXRQb3NpdGlvbnMgPSBmdW5jdGlvbiAocG9zaXRpb25zOiBhbnkpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdwb3NpdGlvbnMnLCBwb3NpdGlvbnMpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLnNldFdpZHRoID0gZnVuY3Rpb24gKHdpZHRoOiBhbnkpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHdpZHRoKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5zZXRHZW9kZXNpYyA9IGZ1bmN0aW9uIChnZW9kZXNpYzogYW55KSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZ2VvZGVzaWMnLCBnZW9kZXNpYylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0UG9zaXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbnMnKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRXaWR0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgnd2lkdGgnKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRHZW9kZXNpYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgnZ2VvZGVzaWMnKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRHZW9tZXRyeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghQ2VzaXVtLmRlZmluZWQodGhpcy5wb3NpdGlvbnMpIHx8IHRoaXMucG9zaXRpb25zLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IENlc2l1bS5Qb2x5bGluZUdlb21ldHJ5KHtcbiAgICAgICAgcG9zaXRpb25zOiB0aGlzLnBvc2l0aW9ucyxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGggPCAxID8gMSA6IHRoaXMud2lkdGgsXG4gICAgICAgIHZlcnRleEZvcm1hdDogQ2VzaXVtLkVsbGlwc29pZFN1cmZhY2VBcHBlYXJhbmNlLlZFUlRFWF9GT1JNQVQsXG4gICAgICAgIGVsbGlwc29pZDogdGhpcy5lbGxpcHNvaWQsXG4gICAgICB9KVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRPdXRsaW5lR2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoXG4gICAgICAgICFDZXNpdW0uZGVmaW5lZCh0aGlzLnBvc2l0aW9ucykgfHxcbiAgICAgICAgdGhpcy5wb3NpdGlvbnMubGVuZ3RoIDwgMiB8fFxuICAgICAgICAhdGhpcy5idWZmZXJcbiAgICAgICkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gdGhpcy5wb3NpdGlvbnMubWFwKChwb3M6IENlc2l1bS5DYXJ0ZXNpYW4zKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhcnRvZ3JhcGhpYyA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbUNhcnRlc2lhbihwb3MpXG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgQ2VzaXVtLk1hdGgudG9EZWdyZWVzKGNhcnRvZ3JhcGhpYy5sb25naXR1ZGUpLFxuICAgICAgICAgIENlc2l1bS5NYXRoLnRvRGVncmVlcyhjYXJ0b2dyYXBoaWMubGF0aXR1ZGUpLFxuICAgICAgICAgIGNhcnRvZ3JhcGhpYy5hbHRpdHVkZSxcbiAgICAgICAgXVxuICAgICAgfSlcbiAgICAgIGNvbnN0IHR1cmZMaW5lID0gVHVyZi5saW5lU3RyaW5nKGNvb3JkaW5hdGVzKVxuICAgICAgdXRpbGl0eS5hZGp1c3RHZW9Db29yZHModHVyZkxpbmUpXG4gICAgICBjb25zdCBidWZmZXJlZExpbmUgPSBUdXJmLmJ1ZmZlcih0dXJmTGluZSwgTWF0aC5tYXgodGhpcy5idWZmZXIsIDEpLCB7XG4gICAgICAgIHVuaXRzOiAnbWV0ZXJzJyxcbiAgICAgIH0pXG4gICAgICBpZiAoIWJ1ZmZlcmVkTGluZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIG5lZWQgdG8gYWRqdXN0IHRoZSBwb2ludHMgYWdhaW4gQUZURVIgYnVmZmVyaW5nLCBzaW5jZSBidWZmZXJpbmcgdW5kb2VzIHRoZSBhbnRpbWVyaWRpYW4gYWRqdXN0bWVudHNcbiAgICAgIHV0aWxpdHkuYWRqdXN0R2VvQ29vcmRzKGJ1ZmZlcmVkTGluZSlcbiAgICAgIGNvbnN0IG91dGxpbmVQb3NpdGlvbnMgPSBidWZmZXJlZExpbmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0ubWFwKFxuICAgICAgICAoY29vcmQpID0+IENlc2l1bS5DYXJ0ZXNpYW4zLmZyb21EZWdyZWVzKGNvb3JkWzBdLCBjb29yZFsxXSwgY29vcmRbMl0pXG4gICAgICApXG4gICAgICByZXR1cm4gbmV3IENlc2l1bS5Qb2x5bGluZUdlb21ldHJ5KHtcbiAgICAgICAgcG9zaXRpb25zOiBvdXRsaW5lUG9zaXRpb25zLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICB3aWR0aDogdGhpcy53aWR0aCA8IDEgPyAxIDogdGhpcy53aWR0aCxcbiAgICAgICAgdmVydGV4Rm9ybWF0OiBDZXNpdW0uRWxsaXBzb2lkU3VyZmFjZUFwcGVhcmFuY2UuVkVSVEVYX0ZPUk1BVCxcbiAgICAgICAgZWxsaXBzb2lkOiB0aGlzLmVsbGlwc29pZCxcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBfXG4gIH0pKClcbiAgLypcbiAgICBDcmVhdGUgb3VyIG93biBJbWFnZSBvYmplY3RzIGFuZCBwYXNzIHRoZW0sIGluc3RlYWQgb2YgVVJMUywgdG8gdGhlXG4gICAgQmlsbGJvYXJkQ29sbGVjdGlvbnMuIFRoaXMgZW5zdXJlcyB0aGUgc2hhcGUgZWRpdGluZyBjb250cm9scyB3aWxsIGFsd2F5c1xuICAgIGJlIGRpc3BsYXllZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgdXNlciBjbGlja3MgdGhlIERyYXcgYnV0dG9uLCBhbmQgd2l0aG91dFxuICAgIHJlcXVpcmluZyBhbnkgdXNlciBpbnRlcmFjdGlvbiB3aXRoIHRoZSBtYXAuIElmIHdlIHVzZWQgdW5sb2FkZWQgaW1hZ2VzXG4gICAgKGUuZy4sIGltYWdlIFVSTHMpLCBhcyB3ZSBkaWQgcHJldmlvdXNseSwgdGhlbiBzb21ldGltZXMgdGhlIHNoYXBlIGVkaXRpbmdcbiAgICBjb250cm9scyB3b3VsZCBub3QgYmUgZGlzcGxheWVkIHVudGlsIHRoZSB1c2VyIGludGVyYWN0ZWQgd2l0aCB0aGUgbWFwLFxuICAgIGxpa2UgbW92aW5nIGl0IG9yIHpvb21pbmcgaW4gb3Igb3V0LiBUaGlzIGlzIGJlY2F1c2Ugd2UgaGF2ZSBDZXNpdW0nc1xuICAgIHJlcXVlc3RSZW5kZXJNb2RlIGVuYWJsZWQuIFNvbWV0aW1lcywgdGhlIGltYWdlIHdhcyBub3QgbG9hZGVkIGJ5IHRoZSB0aW1lXG4gICAgdGhlIHJlbmRlciByZXF1ZXN0IGZvciB0aGUgZHJhd2luZyBwcmltaXRpdmUgd2FzIG1hZGUsIGFuZCBhbm90aGVyIHJlbmRlclxuICAgIHJlcXVlc3QgKHRyaWdnZXJlZCwgZm9yIGV4YW1wbGUsIGJ5IG1vdmluZyB0aGUgbWFwKSBoYWQgdG8gYmUgbWFkZSBmb3JcbiAgICBpdCB0byBiZSBzaG93bi5cbiAgKi9cbiAgY29uc3QgdmVydGV4SW1hZ2UgPSBuZXcgSW1hZ2UoKVxuICB2ZXJ0ZXhJbWFnZS5zcmMgPSBgZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCwke3dpbmRvdy5idG9hKHZlcnRleFN2Zyl9YFxuICBjb25zdCBkcmFnSGFsZkltYWdlID0gbmV3IEltYWdlKClcbiAgZHJhZ0hhbGZJbWFnZS5zcmMgPSBgZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCwke3dpbmRvdy5idG9hKGRyYWdIYWxmU3ZnKX1gXG4gIGNvbnN0IGRlZmF1bHRCaWxsYm9hcmQgPSB7XG4gICAgaW1hZ2U6IHZlcnRleEltYWdlLFxuICAgIHNoaWZ0WDogMCxcbiAgICBzaGlmdFk6IDAsXG4gIH1cbiAgY29uc3QgZHJhZ0JpbGxib2FyZCA9IHtcbiAgICBpbWFnZTogdmVydGV4SW1hZ2UsXG4gICAgc2hpZnRYOiAwLFxuICAgIHNoaWZ0WTogMCxcbiAgfVxuICBjb25zdCBkcmFnSGFsZkJpbGxib2FyZCA9IHtcbiAgICBpbWFnZTogZHJhZ0hhbGZJbWFnZSxcbiAgICBzaGlmdFg6IDAsXG4gICAgc2hpZnRZOiAwLFxuICB9XG4gIF8ucHJvdG90eXBlLmNyZWF0ZUJpbGxib2FyZEdyb3VwID0gZnVuY3Rpb24gKFxuICAgIHBvaW50czogYW55LFxuICAgIG9wdGlvbnM6IGFueSxcbiAgICBjYWxsYmFja3M6IGFueVxuICApIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBjb25zdCBtYXJrZXJzID0gbmV3IF8uQmlsbGJvYXJkR3JvdXAodGhpcywgb3B0aW9ucylcbiAgICBtYXJrZXJzLmFkZEJpbGxib2FyZHMocG9pbnRzLCBjYWxsYmFja3MpXG4gICAgcmV0dXJuIG1hcmtlcnNcbiAgfVxuICBfLkJpbGxib2FyZEdyb3VwID0gZnVuY3Rpb24gKGRyYXdIZWxwZXI6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgOyh0aGlzIGFzIGFueSkuX2RyYXdIZWxwZXIgPSBkcmF3SGVscGVyXG4gICAgOyh0aGlzIGFzIGFueSkuX3NjZW5lID0gZHJhd0hlbHBlci5fc2NlbmVcbiAgICA7KHRoaXMgYXMgYW55KS5fb3B0aW9ucyA9IGNvcHlPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRCaWxsYm9hcmQpXG4gICAgLy8gY3JlYXRlIG9uZSBjb21tb24gYmlsbGJvYXJkIGNvbGxlY3Rpb24gZm9yIGFsbCBiaWxsYm9hcmRzXG4gICAgY29uc3QgYiA9IG5ldyBDZXNpdW0uQmlsbGJvYXJkQ29sbGVjdGlvbigpXG4gICAgOyh0aGlzIGFzIGFueSkuX3NjZW5lLnByaW1pdGl2ZXMuYWRkKGIpXG4gICAgOyh0aGlzIGFzIGFueSkuX2JpbGxib2FyZHMgPSBiXG4gICAgLy8ga2VlcCBhbiBvcmRlcmVkIGxpc3Qgb2YgYmlsbGJvYXJkc1xuICAgIDsodGhpcyBhcyBhbnkpLl9vcmRlcmVkQmlsbGJvYXJkcyA9IFtdXG4gIH1cbiAgXy5CaWxsYm9hcmRHcm91cC5wcm90b3R5cGUuY3JlYXRlQmlsbGJvYXJkID0gZnVuY3Rpb24gKFxuICAgIHBvc2l0aW9uOiBhbnksXG4gICAgY2FsbGJhY2tzOiBhbnlcbiAgKSB7XG4gICAgY29uc3QgYmlsbGJvYXJkID0gdGhpcy5fYmlsbGJvYXJkcy5hZGQoe1xuICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgIHBvc2l0aW9uLFxuICAgICAgcGl4ZWxPZmZzZXQ6IG5ldyBDZXNpdW0uQ2FydGVzaWFuMihcbiAgICAgICAgdGhpcy5fb3B0aW9ucy5zaGlmdFgsXG4gICAgICAgIHRoaXMuX29wdGlvbnMuc2hpZnRZXG4gICAgICApLFxuICAgICAgZXllT2Zmc2V0OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjMoMC4wLCAwLjAsIDAuMCksXG4gICAgICBob3Jpem9udGFsT3JpZ2luOiBDZXNpdW0uSG9yaXpvbnRhbE9yaWdpbi5DRU5URVIsXG4gICAgICB2ZXJ0aWNhbE9yaWdpbjogQ2VzaXVtLlZlcnRpY2FsT3JpZ2luLkNFTlRFUixcbiAgICAgIHNjYWxlOiAxLjAsXG4gICAgICBpbWFnZTogdGhpcy5fb3B0aW9ucy5pbWFnZSxcbiAgICAgIGNvbG9yOiBuZXcgQ2VzaXVtLkNvbG9yKDEuMCwgMS4wLCAxLjAsIDEuMCksXG4gICAgfSlcbiAgICAvLyBpZiBlZGl0YWJsZVxuICAgIGlmIChjYWxsYmFja3MpIHtcbiAgICAgIHZhciBfc2VsZiA9IHRoaXNcbiAgICAgIGNvbnN0IHNjcmVlblNwYWNlQ2FtZXJhQ29udHJvbGxlciA9XG4gICAgICAgIHRoaXMuX3NjZW5lLnNjcmVlblNwYWNlQ2FtZXJhQ29udHJvbGxlclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDEyNTIpIEZJWE1FOiBGdW5jdGlvbiBkZWNsYXJhdGlvbnMgYXJlIG5vdCBhbGxvd2VkIGluc2lkZSBibG9jay4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBmdW5jdGlvbiBlbmFibGVSb3RhdGlvbihlbmFibGU6IGFueSkge1xuICAgICAgICBzY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIuZW5hYmxlUm90YXRlID0gZW5hYmxlXG4gICAgICB9XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMTI1MikgRklYTUU6IEZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBhcmUgbm90IGFsbG93ZWQgaW5zaWRlIGJsb2NrLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIGZ1bmN0aW9uIGdldEluZGV4KCkge1xuICAgICAgICAvLyBmaW5kIGluZGV4XG4gICAgICAgIGZvciAoXG4gICAgICAgICAgdmFyIGkgPSAwLCBJID0gX3NlbGYuX29yZGVyZWRCaWxsYm9hcmRzLmxlbmd0aDtcbiAgICAgICAgICBpIDwgSSAmJiBfc2VsZi5fb3JkZXJlZEJpbGxib2FyZHNbaV0gIT0gYmlsbGJvYXJkO1xuICAgICAgICAgICsraVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gaVxuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrcy5kcmFnSGFuZGxlcnMpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlZGVjbGFyZVxuICAgICAgICB2YXIgX3NlbGYgPSB0aGlzXG4gICAgICAgIHNldExpc3RlbmVyKGJpbGxib2FyZCwgJ2xlZnREb3duJywgKHBvc2l0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgICAvLyBUT0RPIC0gc3RhcnQgdGhlIGRyYWcgaGFuZGxlcnMgaGVyZVxuICAgICAgICAgIC8vIGNyZWF0ZSBoYW5kbGVycyBmb3IgbW91c2VPdXQgYW5kIGxlZnRVcCBmb3IgdGhlIGJpbGxib2FyZCBhbmQgYSBtb3VzZU1vdmVcbiAgICAgICAgICBmdW5jdGlvbiBvbkRyYWcocG9zaXRpb246IGFueSkge1xuICAgICAgICAgICAgYmlsbGJvYXJkLnBvc2l0aW9uID0gcG9zaXRpb25cbiAgICAgICAgICAgIC8vIGZpbmQgaW5kZXhcbiAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgIGxldCBpID0gMCwgSSA9IF9zZWxmLl9vcmRlcmVkQmlsbGJvYXJkcy5sZW5ndGg7XG4gICAgICAgICAgICAgIGkgPCBJICYmIF9zZWxmLl9vcmRlcmVkQmlsbGJvYXJkc1tpXSAhPSBiaWxsYm9hcmQ7XG4gICAgICAgICAgICAgICsraVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnSGFuZGxlcnMub25EcmFnICYmXG4gICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnSGFuZGxlcnMub25EcmFnKGdldEluZGV4KCksIHBvc2l0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgICBmdW5jdGlvbiBvbkRyYWdFbmQocG9zaXRpb246IGFueSkge1xuICAgICAgICAgICAgaGFuZGxlci5kZXN0cm95KClcbiAgICAgICAgICAgIGVuYWJsZVJvdGF0aW9uKHRydWUpXG4gICAgICAgICAgICBjYWxsYmFja3MuZHJhZ0hhbmRsZXJzLm9uRHJhZ0VuZCAmJlxuICAgICAgICAgICAgICBjYWxsYmFja3MuZHJhZ0hhbmRsZXJzLm9uRHJhZ0VuZChnZXRJbmRleCgpLCBwb3NpdGlvbilcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKF9zZWxmLl9zY2VuZS5jYW52YXMpXG4gICAgICAgICAgaGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FydGVzaWFuID0gX3NlbGYuX3NjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgICAgICBtb3ZlbWVudC5lbmRQb3NpdGlvbixcbiAgICAgICAgICAgICAgZWxsaXBzb2lkXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBpZiAoY2FydGVzaWFuKSB7XG4gICAgICAgICAgICAgIG9uRHJhZyhjYXJ0ZXNpYW4pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBvbkRyYWdFbmQoY2FydGVzaWFuKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICAgICAgICAgIGhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgIG9uRHJhZ0VuZChcbiAgICAgICAgICAgICAgX3NlbGYuX3NjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKG1vdmVtZW50LnBvc2l0aW9uLCBlbGxpcHNvaWQpXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfVVApXG4gICAgICAgICAgZW5hYmxlUm90YXRpb24oZmFsc2UpXG4gICAgICAgICAgY2FsbGJhY2tzLmRyYWdIYW5kbGVycy5vbkRyYWdTdGFydCAmJlxuICAgICAgICAgICAgY2FsbGJhY2tzLmRyYWdIYW5kbGVycy5vbkRyYWdTdGFydChcbiAgICAgICAgICAgICAgZ2V0SW5kZXgoKSxcbiAgICAgICAgICAgICAgX3NlbGYuX3NjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKHBvc2l0aW9uLCBlbGxpcHNvaWQpXG4gICAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAoY2FsbGJhY2tzLm9uUmlnaHRDbGljaykge1xuICAgICAgICBzZXRMaXN0ZW5lcihiaWxsYm9hcmQsICdyaWdodENsaWNrJywgKCkgPT4ge1xuICAgICAgICAgIGNhbGxiYWNrcy5vblJpZ2h0Q2xpY2soZ2V0SW5kZXgoKSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFja3Mub25DbGljaykge1xuICAgICAgICBzZXRMaXN0ZW5lcihiaWxsYm9hcmQsICdsZWZ0Q2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgY2FsbGJhY2tzLm9uQ2xpY2soZ2V0SW5kZXgoKSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFja3MudG9vbHRpcCkge1xuICAgICAgICBzZXRMaXN0ZW5lcihiaWxsYm9hcmQsICdtb3VzZU1vdmUnLCAocG9zaXRpb246IGFueSkgPT4ge1xuICAgICAgICAgIF9zZWxmLl9kcmF3SGVscGVyLl90b29sdGlwLnNob3dBdChwb3NpdGlvbiwgY2FsbGJhY2tzLnRvb2x0aXAoKSlcbiAgICAgICAgfSlcbiAgICAgICAgc2V0TGlzdGVuZXIoYmlsbGJvYXJkLCAnbW91c2VPdXQnLCAoKSA9PiB7XG4gICAgICAgICAgX3NlbGYuX2RyYXdIZWxwZXIuX3Rvb2x0aXAuc2V0VmlzaWJsZShmYWxzZSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJpbGxib2FyZFxuICB9XG4gIF8uQmlsbGJvYXJkR3JvdXAucHJvdG90eXBlLmluc2VydEJpbGxib2FyZCA9IGZ1bmN0aW9uIChcbiAgICBpbmRleDogYW55LFxuICAgIHBvc2l0aW9uOiBhbnksXG4gICAgY2FsbGJhY2tzOiBhbnlcbiAgKSB7XG4gICAgdGhpcy5fb3JkZXJlZEJpbGxib2FyZHMuc3BsaWNlKFxuICAgICAgaW5kZXgsXG4gICAgICAwLFxuICAgICAgdGhpcy5jcmVhdGVCaWxsYm9hcmQocG9zaXRpb24sIGNhbGxiYWNrcylcbiAgICApXG4gIH1cbiAgXy5CaWxsYm9hcmRHcm91cC5wcm90b3R5cGUuYWRkQmlsbGJvYXJkID0gZnVuY3Rpb24gKFxuICAgIHBvc2l0aW9uOiBhbnksXG4gICAgY2FsbGJhY2tzOiBhbnlcbiAgKSB7XG4gICAgdGhpcy5fb3JkZXJlZEJpbGxib2FyZHMucHVzaCh0aGlzLmNyZWF0ZUJpbGxib2FyZChwb3NpdGlvbiwgY2FsbGJhY2tzKSlcbiAgfVxuICBfLkJpbGxib2FyZEdyb3VwLnByb3RvdHlwZS5hZGRCaWxsYm9hcmRzID0gZnVuY3Rpb24gKFxuICAgIHBvc2l0aW9uczogYW55LFxuICAgIGNhbGxiYWNrczogYW55XG4gICkge1xuICAgIGxldCBpbmRleCA9IDBcbiAgICBmb3IgKDsgaW5kZXggPCBwb3NpdGlvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB0aGlzLmFkZEJpbGxib2FyZChwb3NpdGlvbnNbaW5kZXhdLCBjYWxsYmFja3MpXG4gICAgfVxuICB9XG4gIF8uQmlsbGJvYXJkR3JvdXAucHJvdG90eXBlLnVwZGF0ZUJpbGxib2FyZHNQb3NpdGlvbnMgPSBmdW5jdGlvbiAoXG4gICAgcG9zaXRpb25zOiBhbnlcbiAgKSB7XG4gICAgbGV0IGluZGV4ID0gMFxuICAgIGZvciAoOyBpbmRleCA8IHBvc2l0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMuZ2V0QmlsbGJvYXJkKGluZGV4KS5wb3NpdGlvbiA9IHBvc2l0aW9uc1tpbmRleF1cbiAgICB9XG4gIH1cbiAgXy5CaWxsYm9hcmRHcm91cC5wcm90b3R5cGUuY291bnRCaWxsYm9hcmRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlcmVkQmlsbGJvYXJkcy5sZW5ndGhcbiAgfVxuICBfLkJpbGxib2FyZEdyb3VwLnByb3RvdHlwZS5nZXRCaWxsYm9hcmQgPSBmdW5jdGlvbiAoaW5kZXg6IGFueSkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlcmVkQmlsbGJvYXJkc1tpbmRleF1cbiAgfVxuICBfLkJpbGxib2FyZEdyb3VwLnByb3RvdHlwZS5yZW1vdmVCaWxsYm9hcmQgPSBmdW5jdGlvbiAoaW5kZXg6IGFueSkge1xuICAgIHRoaXMuX2JpbGxib2FyZHMucmVtb3ZlKHRoaXMuZ2V0QmlsbGJvYXJkKGluZGV4KSlcbiAgICB0aGlzLl9vcmRlcmVkQmlsbGJvYXJkcy5zcGxpY2UoaW5kZXgsIDEpXG4gIH1cbiAgXy5CaWxsYm9hcmRHcm91cC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2JpbGxib2FyZHMgPVxuICAgICAgdGhpcy5fYmlsbGJvYXJkcyAmJlxuICAgICAgdGhpcy5fc2NlbmUucHJpbWl0aXZlcy5yZW1vdmUodGhpcy5fYmlsbGJvYXJkcykgJiZcbiAgICAgIHRoaXMuX2JpbGxib2FyZHMucmVtb3ZlQWxsKCkgJiZcbiAgICAgIHRoaXMuX2JpbGxib2FyZHMuZGVzdHJveSgpXG4gIH1cbiAgXy5CaWxsYm9hcmRHcm91cC5wcm90b3R5cGUuc2V0T25Ub3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fc2NlbmUucHJpbWl0aXZlcy5yYWlzZVRvVG9wKHRoaXMuX2JpbGxib2FyZHMpXG4gIH1cbiAgXy5wcm90b3R5cGUuc3RhcnREcmF3aW5nTWFya2VyID0gZnVuY3Rpb24gKG9wdGlvbnM6IGFueSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZWRlY2xhcmVcbiAgICB2YXIgb3B0aW9ucyA9IGNvcHlPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRCaWxsYm9hcmQpXG4gICAgdGhpcy5zdGFydERyYXdpbmcoKCkgPT4ge1xuICAgICAgbWFya2Vycy5yZW1vdmUoKVxuICAgICAgbW91c2VIYW5kbGVyLmRlc3Ryb3koKVxuICAgICAgdG9vbHRpcC5zZXRWaXNpYmxlKGZhbHNlKVxuICAgIH0pXG4gICAgY29uc3QgX3NlbGYgPSB0aGlzXG4gICAgY29uc3Qgc2NlbmUgPSB0aGlzLl9zY2VuZVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg2MTMzKSBGSVhNRTogJ3ByaW1pdGl2ZXMnIGlzIGRlY2xhcmVkIGJ1dCBpdHMgdmFsdWUgaXMgbmV2ZXIgcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgIGNvbnN0IHByaW1pdGl2ZXMgPSBzY2VuZS5wcmltaXRpdmVzXG4gICAgY29uc3QgdG9vbHRpcCA9IHRoaXMuX3Rvb2x0aXBcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBjb25zdCBtYXJrZXJzID0gbmV3IF8uQmlsbGJvYXJkR3JvdXAodGhpcywgb3B0aW9ucylcbiAgICBjb25zdCBtb3VzZUhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKHNjZW5lLmNhbnZhcylcbiAgICAvLyBOb3cgd2FpdCBmb3Igc3RhcnRcbiAgICBtb3VzZUhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGlmIChtb3ZlbWVudC5wb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IHNjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgIG1vdmVtZW50LnBvc2l0aW9uLFxuICAgICAgICAgIGVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICBtYXJrZXJzLmFkZEJpbGxib2FyZChjYXJ0ZXNpYW4pXG4gICAgICAgICAgX3NlbGYuc3RvcERyYXdpbmcoKVxuICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2soY2FydGVzaWFuKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfQ0xJQ0spXG4gICAgbW91c2VIYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IG1vdmVtZW50LmVuZFBvc2l0aW9uXG4gICAgICBpZiAocG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBzY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChwb3NpdGlvbiwgZWxsaXBzb2lkKVxuICAgICAgICBpZiAoY2FydGVzaWFuKSB7XG4gICAgICAgICAgdG9vbHRpcC5zaG93QXQoXG4gICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgICc8cD5DbGljayB0byBhZGQgeW91ciBtYXJrZXIuIFBvc2l0aW9uIGlzOiA8L3A+JyArXG4gICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTU0KSBGSVhNRTogRXhwZWN0ZWQgMiBhcmd1bWVudHMsIGJ1dCBnb3QgMS5cbiAgICAgICAgICAgICAgZ2V0RGlzcGxheUxhdExuZ1N0cmluZyhcbiAgICAgICAgICAgICAgICBlbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoY2FydGVzaWFuKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvb2x0aXAuc2hvd0F0KFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICAnPHA+Q2xpY2sgb24gdGhlIGdsb2JlIHRvIGFkZCB5b3VyIG1hcmtlci48L3A+J1xuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICB9XG4gIF8ucHJvdG90eXBlLnN0YXJ0RHJhd2luZ1BvbHlnb24gPSBmdW5jdGlvbiAob3B0aW9uczogYW55KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlZGVjbGFyZVxuICAgIHZhciBvcHRpb25zID0gY29weU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdFN1cmZhY2VPcHRpb25zKVxuICAgIHRoaXMuc3RhcnREcmF3aW5nUG9seXNoYXBlKHRydWUsIG9wdGlvbnMpXG4gIH1cbiAgXy5wcm90b3R5cGUuc3RhcnREcmF3aW5nUG9seWxpbmUgPSBmdW5jdGlvbiAob3B0aW9uczogYW55KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlZGVjbGFyZVxuICAgIHZhciBvcHRpb25zID0gY29weU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdFBvbHlsaW5lT3B0aW9ucylcbiAgICB0aGlzLnN0YXJ0RHJhd2luZ1BvbHlzaGFwZShmYWxzZSwgb3B0aW9ucylcbiAgfVxuICBfLnByb3RvdHlwZS5zdGFydERyYXdpbmdQb2x5c2hhcGUgPSBmdW5jdGlvbiAoaXNQb2x5Z29uOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIHRoaXMuc3RhcnREcmF3aW5nKCgpID0+IHtcbiAgICAgIHByaW1pdGl2ZXMucmVtb3ZlKHBvbHkpXG4gICAgICBtYXJrZXJzLnJlbW92ZSgpXG4gICAgICBtb3VzZUhhbmRsZXIuZGVzdHJveSgpXG4gICAgICB0b29sdGlwLnNldFZpc2libGUoZmFsc2UpXG4gICAgfSlcbiAgICBjb25zdCBfc2VsZiA9IHRoaXNcbiAgICBjb25zdCBzY2VuZSA9IHRoaXMuX3NjZW5lXG4gICAgY29uc3QgcHJpbWl0aXZlcyA9IHNjZW5lLnByaW1pdGl2ZXNcbiAgICBjb25zdCB0b29sdGlwID0gdGhpcy5fdG9vbHRpcFxuICAgIGNvbnN0IG1pblBvaW50cyA9IGlzUG9seWdvbiA/IDMgOiAyXG4gICAgbGV0IHBvbHk6IGFueVxuICAgIGlmIChpc1BvbHlnb24pIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTU0KSBGSVhNRTogRXhwZWN0ZWQgMiBhcmd1bWVudHMsIGJ1dCBnb3QgMS5cbiAgICAgIHBvbHkgPSBuZXcgRHJhd0hlbHBlci5Qb2x5Z29uUHJpbWl0aXZlKG9wdGlvbnMpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgcG9seSA9IG5ldyBEcmF3SGVscGVyLlBvbHlsaW5lUHJpbWl0aXZlKG9wdGlvbnMpXG4gICAgfVxuICAgIHBvbHkuYXN5bmNocm9ub3VzID0gZmFsc2VcbiAgICBwcmltaXRpdmVzLmFkZChwb2x5KVxuICAgIGNvbnN0IHBvc2l0aW9uczogYW55ID0gW11cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBjb25zdCBtYXJrZXJzID0gbmV3IF8uQmlsbGJvYXJkR3JvdXAodGhpcywgZGVmYXVsdEJpbGxib2FyZClcbiAgICBjb25zdCBtb3VzZUhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKHNjZW5lLmNhbnZhcylcbiAgICAvLyBOb3cgd2FpdCBmb3Igc3RhcnRcbiAgICBtb3VzZUhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGlmIChtb3ZlbWVudC5wb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IHNjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgIG1vdmVtZW50LnBvc2l0aW9uLFxuICAgICAgICAgIGVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICAvLyBmaXJzdCBjbGlja1xuICAgICAgICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIC8vIElmIHVzZXIgY2xpY2tzLCB0aGV5IGhhdmUgc3RhcnRlZCBkcmF3aW5nLCBzbyBkaXNhYmxlIGVkaXRpbmdcbiAgICAgICAgICAgIF9zZWxmLmRpc2FibGVBbGxFZGl0TW9kZSgpXG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaChjYXJ0ZXNpYW4uY2xvbmUoKSlcbiAgICAgICAgICAgIG1hcmtlcnMuYWRkQmlsbGJvYXJkKHBvc2l0aW9uc1swXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBvc2l0aW9ucy5sZW5ndGggPj0gbWluUG9pbnRzKSB7XG4gICAgICAgICAgICBwb2x5LnBvc2l0aW9ucyA9IHBvc2l0aW9uc1xuICAgICAgICAgICAgcG9seS5fY3JlYXRlUHJpbWl0aXZlID0gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBhZGQgbmV3IHBvaW50IHRvIHBvbHlnb25cbiAgICAgICAgICAvLyB0aGlzIG9uZSB3aWxsIG1vdmUgd2l0aCB0aGUgbW91c2VcbiAgICAgICAgICBwb3NpdGlvbnMucHVzaChjYXJ0ZXNpYW4pXG4gICAgICAgICAgLy8gYWRkIG1hcmtlciBhdCB0aGUgbmV3IHBvc2l0aW9uXG4gICAgICAgICAgbWFya2Vycy5hZGRCaWxsYm9hcmQoY2FydGVzaWFuKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfQ0xJQ0spXG4gICAgbW91c2VIYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IG1vdmVtZW50LmVuZFBvc2l0aW9uXG4gICAgICBpZiAocG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgICBpZiAocG9zaXRpb25zLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgY29uc3QgZmVhdHVyZSA9IHNjZW5lLnBpY2socG9zaXRpb24pXG4gICAgICAgICAgY29uc3QgaXNCaWxsYm9hcmQgPVxuICAgICAgICAgICAgZmVhdHVyZT8ucHJpbWl0aXZlICYmIGZlYXR1cmUucHJpbWl0aXZlIGluc3RhbmNlb2YgQ2VzaXVtLkJpbGxib2FyZFxuICAgICAgICAgIC8vIFNob3cgdGhpcyB0b29sdGlwIG9ubHkgaWYgdGhlIG1vdXNlIGlzbid0IG92ZXIgYSBiaWxsYm9hcmQuIFRoZSBiaWxsYm9hcmRzIHNob3duIGZvclxuICAgICAgICAgIC8vIGVkaXRpbmcgaGF2ZSB0aGVpciBvd24gdG9vbHRpcHMgYW5kIHdlIHdhbnQgdG8gc2hvdyB0aG9zZSBpbnN0ZWFkLlxuICAgICAgICAgIGlmICghaXNCaWxsYm9hcmQpIHtcbiAgICAgICAgICAgIHRvb2x0aXAuc2hvd0F0KHBvc2l0aW9uLCAnQ2xpY2sgdG8gYWRkIGZpcnN0IHBvaW50JylcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgY2FydGVzaWFuID0gc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQocG9zaXRpb24sIGVsbGlwc29pZClcbiAgICAgICAgICBpZiAoY2FydGVzaWFuKSB7XG4gICAgICAgICAgICBwb3NpdGlvbnMucG9wKClcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSBpdCBpcyBzbGlnaHRseSBkaWZmZXJlbnRcbiAgICAgICAgICAgIGNhcnRlc2lhbi55ICs9IDEgKyBNYXRoLnJhbmRvbSgpXG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaChjYXJ0ZXNpYW4pXG4gICAgICAgICAgICBpZiAocG9zaXRpb25zLmxlbmd0aCA+PSBtaW5Qb2ludHMpIHtcbiAgICAgICAgICAgICAgcG9seS5wb3NpdGlvbnMgPSBwb3NpdGlvbnNcbiAgICAgICAgICAgICAgcG9seS5fY3JlYXRlUHJpbWl0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdXBkYXRlIG1hcmtlclxuICAgICAgICAgICAgbWFya2Vycy5nZXRCaWxsYm9hcmQocG9zaXRpb25zLmxlbmd0aCAtIDEpLnBvc2l0aW9uID0gY2FydGVzaWFuXG4gICAgICAgICAgICAvLyBzaG93IHRvb2x0aXBcbiAgICAgICAgICAgIHRvb2x0aXAuc2hvd0F0KFxuICAgICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgICAgYENsaWNrIHRvIGFkZCBuZXcgcG9pbnQgKCR7cG9zaXRpb25zLmxlbmd0aH0pXG4gICAgICAgICAgICAgICAke1xuICAgICAgICAgICAgICAgICBwb3NpdGlvbnMubGVuZ3RoID49IG1pblBvaW50c1xuICAgICAgICAgICAgICAgICAgID8gJzxicj5Eb3VibGUgY2xpY2sgdG8gZmluaXNoIGRyYXdpbmcnXG4gICAgICAgICAgICAgICAgICAgOiAnJ1xuICAgICAgICAgICAgICAgfWBcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGlmIChpc1BvbHlnb24gJiYgcG9zaXRpb25zLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAvLyBSZXF1ZXN0IGEgcmVuZGVyIHNvIHRoZSBmaXJzdCBwb2x5Z29uIHBvaW50IHdpbGwgYmUgZGlzcGxheWVkIGJlZm9yZSB0aGUgdXNlclxuICAgICAgICAgICAgICAvLyBoYXMgY2xpY2tlZCB0aGUgc2Vjb25kIHBvaW50LiBBZnRlciB0aGUgdXNlciBoYXMgY2xpY2tlZCB0byBjcmVhdGUgYSBwb2ludCxcbiAgICAgICAgICAgICAgLy8gdGhlIGxlbmd0aCBvZiBwb3NpdGlvbnMgd2lsbCBiZSAoIyBvZiBwb2ludHMpICsgMSwgYmVjYXVzZSB0aGUgbGFzdCBwb2ludCBpc1xuICAgICAgICAgICAgICAvLyB3aGVyZXZlciB0aGUgbW91c2UgaXMuIFJlbmRlcnMgd2lsbCBhbHdheXMgaGFwcGVuIG9uIG1vdXNlIG1vdmVtZW50IHdoZW5cbiAgICAgICAgICAgICAgLy8gcG9zaXRpb25zLmxlbmd0aCBpcyBncmVhdGVyIHRoYW4gMiwgZHVlIHRvIF9jcmVhdGVQcmltaXRpdmUgYmVpbmcgZW5hYmxlZCBhYm92ZS5cbiAgICAgICAgICAgICAgc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLk1PVVNFX01PVkUpXG4gICAgbW91c2VIYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IG1vdmVtZW50LnBvc2l0aW9uXG4gICAgICBpZiAocG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgICBpZiAocG9zaXRpb25zLmxlbmd0aCA8IG1pblBvaW50cyArIDIpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBzY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChwb3NpdGlvbiwgZWxsaXBzb2lkKVxuICAgICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICAgIF9zZWxmLnN0b3BEcmF3aW5nKClcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL2xlZm9ydGhvbWFzL2Nlc2l1bS1kcmF3aGVscGVyL2lzc3Vlcy8xM1xuICAgICAgICAgICAgICAvL25lZWQgdG8gcmVtb3ZlIGxhc3QgMiBwb3NpdGlvbnMgc2luY2UgdGhvc2UgYXJlIGZyb20gZmluaXNoaW5nIHRoZSBkcmF3aW5nXG4gICAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2socG9zaXRpb25zLnNsaWNlKDAsIHBvc2l0aW9ucy5sZW5ndGggLSAyKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9ET1VCTEVfQ0xJQ0spXG4gIH1cbiAgZnVuY3Rpb24gZ2V0RXh0ZW50Q29ybmVycyh2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIGVsbGlwc29pZC5jYXJ0b2dyYXBoaWNBcnJheVRvQ2FydGVzaWFuQXJyYXkoW1xuICAgICAgQ2VzaXVtLlJlY3RhbmdsZS5ub3J0aHdlc3QodmFsdWUpLFxuICAgICAgQ2VzaXVtLlJlY3RhbmdsZS5ub3J0aGVhc3QodmFsdWUpLFxuICAgICAgQ2VzaXVtLlJlY3RhbmdsZS5zb3V0aGVhc3QodmFsdWUpLFxuICAgICAgQ2VzaXVtLlJlY3RhbmdsZS5zb3V0aHdlc3QodmFsdWUpLFxuICAgIF0pXG4gIH1cbiAgXy5wcm90b3R5cGUuc3RhcnREcmF3aW5nRXh0ZW50ID0gZnVuY3Rpb24gKG9wdGlvbnM6IGFueSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZWRlY2xhcmVcbiAgICB2YXIgb3B0aW9ucyA9IGNvcHlPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRTdXJmYWNlT3B0aW9ucylcbiAgICB0aGlzLnN0YXJ0RHJhd2luZygoKSA9PiB7XG4gICAgICBpZiAoZXh0ZW50ICE9IG51bGwpIHtcbiAgICAgICAgcHJpbWl0aXZlcy5yZW1vdmUoZXh0ZW50KVxuICAgICAgfVxuICAgICAgbWFya2Vycz8ucmVtb3ZlKClcbiAgICAgIG1vdXNlSGFuZGxlci5kZXN0cm95KClcbiAgICAgIHRvb2x0aXAuc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9KVxuICAgIGNvbnN0IF9zZWxmID0gdGhpc1xuICAgIGNvbnN0IHNjZW5lID0gdGhpcy5fc2NlbmVcbiAgICBjb25zdCBwcmltaXRpdmVzID0gdGhpcy5fc2NlbmUucHJpbWl0aXZlc1xuICAgIGNvbnN0IHRvb2x0aXAgPSB0aGlzLl90b29sdGlwXG4gICAgbGV0IGZpcnN0UG9pbnQ6IGFueSA9IG51bGxcbiAgICBsZXQgZXh0ZW50OiBhbnkgPSBudWxsXG4gICAgbGV0IG1hcmtlcnM6IGFueSA9IG51bGxcbiAgICBjb25zdCBtb3VzZUhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKHNjZW5lLmNhbnZhcylcbiAgICBmdW5jdGlvbiB1cGRhdGVFeHRlbnQodmFsdWU6IGFueSkge1xuICAgICAgaWYgKGV4dGVudCA9PSBudWxsKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTU0KSBGSVhNRTogRXhwZWN0ZWQgMiBhcmd1bWVudHMsIGJ1dCBnb3QgMS5cbiAgICAgICAgZXh0ZW50ID0gbmV3IERyYXdIZWxwZXIuRXh0ZW50UHJpbWl0aXZlKHsgLi4ub3B0aW9ucywgZXh0ZW50OiB2YWx1ZSB9KVxuICAgICAgICBleHRlbnQuYXN5bmNocm9ub3VzID0gZmFsc2VcbiAgICAgICAgcHJpbWl0aXZlcy5hZGQoZXh0ZW50KVxuICAgICAgfVxuICAgICAgZXh0ZW50LmV4dGVudCA9IHZhbHVlXG4gICAgICAvLyB1cGRhdGUgdGhlIG1hcmtlcnNcbiAgICAgIGNvbnN0IGNvcm5lcnMgPSBnZXRFeHRlbnRDb3JuZXJzKHZhbHVlKVxuICAgICAgLy8gY3JlYXRlIGlmIHRoZXkgZG8gbm90IHlldCBleGlzdFxuICAgICAgaWYgKG1hcmtlcnMgPT0gbnVsbCkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgbWFya2VycyA9IG5ldyBfLkJpbGxib2FyZEdyb3VwKF9zZWxmLCBkZWZhdWx0QmlsbGJvYXJkKVxuICAgICAgICBtYXJrZXJzLmFkZEJpbGxib2FyZHMoY29ybmVycylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcmtlcnMudXBkYXRlQmlsbGJvYXJkc1Bvc2l0aW9ucyhjb3JuZXJzKVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBOb3cgd2FpdCBmb3Igc3RhcnRcbiAgICBtb3VzZUhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGlmIChtb3ZlbWVudC5wb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IHNjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgIG1vdmVtZW50LnBvc2l0aW9uLFxuICAgICAgICAgIGVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICBpZiAoZXh0ZW50ID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIElmIHVzZXIgY2xpY2tzLCB0aGV5IGhhdmUgc3RhcnRlZCBkcmF3aW5nLCBzbyBkaXNhYmxlIGVkaXRpbmdcbiAgICAgICAgICAgIF9zZWxmLmRpc2FibGVBbGxFZGl0TW9kZSgpXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHJlY3RhbmdsZVxuICAgICAgICAgICAgZmlyc3RQb2ludCA9IGVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyhjYXJ0ZXNpYW4pXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldEV4dGVudChmaXJzdFBvaW50LCBmaXJzdFBvaW50KVxuICAgICAgICAgICAgdXBkYXRlRXh0ZW50KHZhbHVlKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfc2VsZi5zdG9wRHJhd2luZygpXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgIGdldEV4dGVudChcbiAgICAgICAgICAgICAgICAgIGZpcnN0UG9pbnQsXG4gICAgICAgICAgICAgICAgICBlbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoY2FydGVzaWFuKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0NMSUNLKVxuICAgIG1vdXNlSGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBtb3ZlbWVudC5lbmRQb3NpdGlvblxuICAgICAgaWYgKHBvc2l0aW9uICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGV4dGVudCA9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgZmVhdHVyZSA9IHNjZW5lLnBpY2socG9zaXRpb24pXG4gICAgICAgICAgY29uc3QgaXNCaWxsYm9hcmQgPVxuICAgICAgICAgICAgZmVhdHVyZT8ucHJpbWl0aXZlICYmIGZlYXR1cmUucHJpbWl0aXZlIGluc3RhbmNlb2YgQ2VzaXVtLkJpbGxib2FyZFxuICAgICAgICAgIC8vIFNob3cgdGhpcyB0b29sdGlwIG9ubHkgaWYgdGhlIG1vdXNlIGlzbid0IG92ZXIgYSBiaWxsYm9hcmQuIFRoZSBiaWxsYm9hcmRzIHNob3duIGZvclxuICAgICAgICAgIC8vIGVkaXRpbmcgaGF2ZSB0aGVpciBvd24gdG9vbHRpcHMgYW5kIHdlIHdhbnQgdG8gc2hvdyB0aG9zZSBpbnN0ZWFkLlxuICAgICAgICAgIGlmICghaXNCaWxsYm9hcmQpIHtcbiAgICAgICAgICAgIHRvb2x0aXAuc2hvd0F0KHBvc2l0aW9uLCAnQ2xpY2sgdG8gc3RhcnQgZHJhd2luZyByZWN0YW5nbGUnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBzY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChwb3NpdGlvbiwgZWxsaXBzb2lkKVxuICAgICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICAgIGV4dGVudC5fY3JlYXRlUHJpbWl0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRFeHRlbnQoXG4gICAgICAgICAgICAgIGZpcnN0UG9pbnQsXG4gICAgICAgICAgICAgIGVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyhjYXJ0ZXNpYW4pXG4gICAgICAgICAgICApXG4gICAgICAgICAgICB1cGRhdGVFeHRlbnQodmFsdWUpXG4gICAgICAgICAgICB0b29sdGlwLnNob3dBdChcbiAgICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICAgICdEcmFnIHRvIGNoYW5nZSByZWN0YW5nbGUgZXh0ZW50PGJyPkNsaWNrIGFnYWluIHRvIGZpbmlzaCBkcmF3aW5nJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICB9XG4gIF8ucHJvdG90eXBlLnN0YXJ0RHJhd2luZ0NpcmNsZSA9IGZ1bmN0aW9uIChvcHRpb25zOiBhbnkpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVkZWNsYXJlXG4gICAgdmFyIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0U3VyZmFjZU9wdGlvbnMpXG4gICAgdGhpcy5zdGFydERyYXdpbmcoZnVuY3Rpb24gY2xlYW5VcCgpIHtcbiAgICAgIGlmIChjaXJjbGUgIT0gbnVsbCkge1xuICAgICAgICBwcmltaXRpdmVzLnJlbW92ZShjaXJjbGUpXG4gICAgICB9XG4gICAgICBtYXJrZXJzPy5yZW1vdmUoKVxuICAgICAgbW91c2VIYW5kbGVyLmRlc3Ryb3koKVxuICAgICAgdG9vbHRpcC5zZXRWaXNpYmxlKGZhbHNlKVxuICAgIH0pXG4gICAgY29uc3QgX3NlbGYgPSB0aGlzXG4gICAgY29uc3Qgc2NlbmUgPSB0aGlzLl9zY2VuZVxuICAgIGNvbnN0IHByaW1pdGl2ZXMgPSB0aGlzLl9zY2VuZS5wcmltaXRpdmVzXG4gICAgY29uc3QgdG9vbHRpcCA9IHRoaXMuX3Rvb2x0aXBcbiAgICBsZXQgY2lyY2xlOiBhbnkgPSBudWxsXG4gICAgbGV0IG1hcmtlcnM6IGFueSA9IG51bGxcbiAgICBjb25zdCBtb3VzZUhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKHNjZW5lLmNhbnZhcylcbiAgICAvLyBOb3cgd2FpdCBmb3Igc3RhcnRcbiAgICBtb3VzZUhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGlmIChtb3ZlbWVudC5wb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IHNjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgIG1vdmVtZW50LnBvc2l0aW9uLFxuICAgICAgICAgIGVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICBpZiAoY2lyY2xlID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIElmIHVzZXIgY2xpY2tzLCB0aGV5IGhhdmUgc3RhcnRlZCBkcmF3aW5nLCBzbyBkaXNhYmxlIGVkaXRpbmdcbiAgICAgICAgICAgIF9zZWxmLmRpc2FibGVBbGxFZGl0TW9kZSgpXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGNpcmNsZVxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgICAgICAgICAgY2lyY2xlID0gbmV3IF8uQ2lyY2xlUHJpbWl0aXZlKHtcbiAgICAgICAgICAgICAgY2VudGVyOiBjYXJ0ZXNpYW4sXG4gICAgICAgICAgICAgIHJhZGl1czogMCxcbiAgICAgICAgICAgICAgYXN5bmNocm9ub3VzOiBmYWxzZSxcbiAgICAgICAgICAgICAgbWF0ZXJpYWw6IG9wdGlvbnMubWF0ZXJpYWwsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcHJpbWl0aXZlcy5hZGQoY2lyY2xlKVxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICBtYXJrZXJzID0gbmV3IF8uQmlsbGJvYXJkR3JvdXAoX3NlbGYsIGRlZmF1bHRCaWxsYm9hcmQpXG4gICAgICAgICAgICBtYXJrZXJzLmFkZEJpbGxib2FyZHMoW2NhcnRlc2lhbl0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2soY2lyY2xlLmdldENlbnRlcigpLCBjaXJjbGUuZ2V0UmFkaXVzKCkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfc2VsZi5zdG9wRHJhd2luZygpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfQ0xJQ0spXG4gICAgbW91c2VIYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IG1vdmVtZW50LmVuZFBvc2l0aW9uXG4gICAgICBpZiAocG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2lyY2xlID09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCBmZWF0dXJlID0gc2NlbmUucGljayhwb3NpdGlvbilcbiAgICAgICAgICBjb25zdCBpc0JpbGxib2FyZCA9XG4gICAgICAgICAgICBmZWF0dXJlPy5wcmltaXRpdmUgJiYgZmVhdHVyZS5wcmltaXRpdmUgaW5zdGFuY2VvZiBDZXNpdW0uQmlsbGJvYXJkXG4gICAgICAgICAgLy8gU2hvdyB0aGlzIHRvb2x0aXAgb25seSBpZiB0aGUgbW91c2UgaXNuJ3Qgb3ZlciBhIGJpbGxib2FyZC4gVGhlIGJpbGxib2FyZHMgc2hvd24gZm9yXG4gICAgICAgICAgLy8gZWRpdGluZyBoYXZlIHRoZWlyIG93biB0b29sdGlwcyBhbmQgd2Ugd2FudCB0byBzaG93IHRob3NlIGluc3RlYWQuXG4gICAgICAgICAgaWYgKCFpc0JpbGxib2FyZCkge1xuICAgICAgICAgICAgdG9vbHRpcC5zaG93QXQocG9zaXRpb24sICdDbGljayB0byBzdGFydCBkcmF3aW5nIHRoZSBjaXJjbGUnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBzY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChwb3NpdGlvbiwgZWxsaXBzb2lkKVxuICAgICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICAgIGNpcmNsZS5zZXRSYWRpdXMoXG4gICAgICAgICAgICAgIENlc2l1bS5DYXJ0ZXNpYW4zLmRpc3RhbmNlKGNpcmNsZS5nZXRDZW50ZXIoKSwgY2FydGVzaWFuKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgbWFya2Vycy51cGRhdGVCaWxsYm9hcmRzUG9zaXRpb25zKGNhcnRlc2lhbilcbiAgICAgICAgICAgIHRvb2x0aXAuc2hvd0F0KFxuICAgICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgICAgJ01vdmUgbW91c2UgdG8gY2hhbmdlIGNpcmNsZSByYWRpdXM8YnI+Q2xpY2sgYWdhaW4gdG8gZmluaXNoIGRyYXdpbmcnXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLk1PVVNFX01PVkUpXG4gIH1cbiAgXy5wcm90b3R5cGUuZW5oYW5jZVByaW1pdGl2ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZHJhd0hlbHBlciA9IHRoaXNcbiAgICBDZXNpdW0uQmlsbGJvYXJkLnByb3RvdHlwZS5zZXRFZGl0YWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9lZGl0YWJsZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuX2VkaXRhYmxlID0gdHJ1ZVxuICAgICAgY29uc3QgYmlsbGJvYXJkID0gdGhpc1xuICAgICAgY29uc3QgX3NlbGYgPSB0aGlzXG4gICAgICBmdW5jdGlvbiBlbmFibGVSb3RhdGlvbihlbmFibGU6IGFueSkge1xuICAgICAgICBkcmF3SGVscGVyLl9zY2VuZS5zY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIuZW5hYmxlUm90YXRlID0gZW5hYmxlXG4gICAgICB9XG4gICAgICBzZXRMaXN0ZW5lcihiaWxsYm9hcmQsICdsZWZ0RG93bicsICgpID0+IHtcbiAgICAgICAgLy8gVE9ETyAtIHN0YXJ0IHRoZSBkcmFnIGhhbmRsZXJzIGhlcmVcbiAgICAgICAgLy8gY3JlYXRlIGhhbmRsZXJzIGZvciBtb3VzZU91dCBhbmQgbGVmdFVwIGZvciB0aGUgYmlsbGJvYXJkIGFuZCBhIG1vdXNlTW92ZVxuICAgICAgICBmdW5jdGlvbiBvbkRyYWcocG9zaXRpb246IGFueSkge1xuICAgICAgICAgIGJpbGxib2FyZC5wb3NpdGlvbiA9IHBvc2l0aW9uXG4gICAgICAgICAgX3NlbGYuZXhlY3V0ZUxpc3RlbmVycyh7IG5hbWU6ICdkcmFnJywgcG9zaXRpb25zOiBwb3NpdGlvbiB9KVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG9uRHJhZ0VuZChwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgaGFuZGxlci5kZXN0cm95KClcbiAgICAgICAgICBlbmFibGVSb3RhdGlvbih0cnVlKVxuICAgICAgICAgIF9zZWxmLmV4ZWN1dGVMaXN0ZW5lcnMoeyBuYW1lOiAnZHJhZ0VuZCcsIHBvc2l0aW9uczogcG9zaXRpb24gfSlcbiAgICAgICAgfVxuICAgICAgICB2YXIgaGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoXG4gICAgICAgICAgZHJhd0hlbHBlci5fc2NlbmUuY2FudmFzXG4gICAgICAgIClcbiAgICAgICAgaGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IGRyYXdIZWxwZXIuX3NjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgICAgbW92ZW1lbnQuZW5kUG9zaXRpb24sXG4gICAgICAgICAgICBlbGxpcHNvaWRcbiAgICAgICAgICApXG4gICAgICAgICAgaWYgKGNhcnRlc2lhbikge1xuICAgICAgICAgICAgb25EcmFnKGNhcnRlc2lhbilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25EcmFnRW5kKGNhcnRlc2lhbilcbiAgICAgICAgICB9XG4gICAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICAgICAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICAgICAgb25EcmFnRW5kKFxuICAgICAgICAgICAgZHJhd0hlbHBlci5fc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQobW92ZW1lbnQucG9zaXRpb24sIGVsbGlwc29pZClcbiAgICAgICAgICApXG4gICAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX1VQKVxuICAgICAgICBlbmFibGVSb3RhdGlvbihmYWxzZSlcbiAgICAgIH0pXG4gICAgICBlbmhhbmNlV2l0aExpc3RlbmVycyhiaWxsYm9hcmQpXG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldEhpZ2hsaWdodGVkKHRoaXM6IGFueSwgaGlnaGxpZ2h0ZWQ6IGFueSkge1xuICAgICAgLy8gaWYgbm8gY2hhbmdlXG4gICAgICAvLyBpZiBhbHJlYWR5IGhpZ2hsaWdodGVkLCB0aGUgb3V0bGluZSBwb2x5Z29uIHdpbGwgYmUgYXZhaWxhYmxlXG4gICAgICBpZiAodGhpcy5faGlnaGxpZ2h0ZWQgJiYgdGhpcy5faGlnaGxpZ2h0ZWQgPT0gaGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBkaXNhYmxlIGlmIGFscmVhZHkgaW4gZWRpdCBtb2RlXG4gICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLl9oaWdobGlnaHRlZCA9IGhpZ2hsaWdodGVkXG4gICAgICAvLyBoaWdobGlnaHQgYnkgY3JlYXRpbmcgYW4gb3V0bGluZSBwb2x5Z29uIG1hdGNoaW5nIHRoZSBwb2x5Z29uIHBvaW50c1xuICAgICAgaWYgKGhpZ2hsaWdodGVkKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSBhbGwgb3RoZXIgc2hhcGVzIGFyZSBub3QgaGlnaGxpZ2h0ZWRcbiAgICAgICAgZHJhd0hlbHBlci5zZXRIaWdobGlnaHRlZCh0aGlzKVxuICAgICAgICB0aGlzLl9zdHJva2VDb2xvciA9IHRoaXMuc3Ryb2tlQ29sb3JcbiAgICAgICAgdGhpcy5zZXRTdHJva2VTdHlsZShcbiAgICAgICAgICBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKCd3aGl0ZScpLFxuICAgICAgICAgIHRoaXMuc3Ryb2tlV2lkdGhcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuX3N0cm9rZUNvbG9yKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdHJva2VTdHlsZSh0aGlzLl9zdHJva2VDb2xvciwgdGhpcy5zdHJva2VXaWR0aClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldFN0cm9rZVN0eWxlKHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldEVkaXRNb2RlKHRoaXM6IGFueSwgZWRpdE1vZGU6IGFueSkge1xuICAgICAgLy8gaWYgbm8gY2hhbmdlXG4gICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT0gZWRpdE1vZGUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBtYWtlIHN1cmUgYWxsIG90aGVyIHNoYXBlcyBhcmUgbm90IGluIGVkaXQgbW9kZSBiZWZvcmUgc3RhcnRpbmcgdGhlIGVkaXRpbmcgb2YgdGhpcyBzaGFwZVxuICAgICAgZHJhd0hlbHBlci5kaXNhYmxlQWxsSGlnaGxpZ2h0cygpXG4gICAgICAvLyBkaXNwbGF5IG1hcmtlcnNcbiAgICAgIGlmIChlZGl0TW9kZSkge1xuICAgICAgICBkcmF3SGVscGVyLnNldEVkaXRlZCh0aGlzKVxuICAgICAgICBjb25zdCBfc2VsZiA9IHRoaXNcbiAgICAgICAgLy8gY3JlYXRlIHRoZSBtYXJrZXJzIGFuZCBoYW5kbGVycyBmb3IgdGhlIGVkaXRpbmdcbiAgICAgICAgaWYgKHRoaXMuX21hcmtlcnMgPT0gbnVsbCkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIGNvbnN0IG1hcmtlcnMgPSBuZXcgXy5CaWxsYm9hcmRHcm91cChkcmF3SGVscGVyLCBkcmFnQmlsbGJvYXJkKVxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIGNvbnN0IGVkaXRNYXJrZXJzID0gbmV3IF8uQmlsbGJvYXJkR3JvdXAoXG4gICAgICAgICAgICBkcmF3SGVscGVyLFxuICAgICAgICAgICAgZHJhZ0hhbGZCaWxsYm9hcmRcbiAgICAgICAgICApXG4gICAgICAgICAgLy8gZnVuY3Rpb24gZm9yIHVwZGF0aW5nIHRoZSBlZGl0IG1hcmtlcnMgYXJvdW5kIGEgY2VydGFpbiBwb2ludFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgxMjUyKSBGSVhNRTogRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBub3QgYWxsb3dlZCBpbnNpZGUgYmxvY2suLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUhhbGZNYXJrZXJzKGluZGV4OiBhbnksIHBvc2l0aW9uczogYW55KSB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGhhbGYgbWFya2VycyBiZWZvcmUgYW5kIGFmdGVyIHRoZSBpbmRleFxuICAgICAgICAgICAgbGV0IGVkaXRJbmRleCA9IGluZGV4IC0gMSA8IDAgPyBwb3NpdGlvbnMubGVuZ3RoIC0gMSA6IGluZGV4IC0gMVxuICAgICAgICAgICAgaWYgKGVkaXRJbmRleCA8IGVkaXRNYXJrZXJzLmNvdW50QmlsbGJvYXJkcygpKSB7XG4gICAgICAgICAgICAgIGVkaXRNYXJrZXJzLmdldEJpbGxib2FyZChlZGl0SW5kZXgpLnBvc2l0aW9uID1cbiAgICAgICAgICAgICAgICBjYWxjdWxhdGVIYWxmTWFya2VyUG9zaXRpb24oZWRpdEluZGV4KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWRpdEluZGV4ID0gaW5kZXhcbiAgICAgICAgICAgIGlmIChlZGl0SW5kZXggPCBlZGl0TWFya2Vycy5jb3VudEJpbGxib2FyZHMoKSkge1xuICAgICAgICAgICAgICBlZGl0TWFya2Vycy5nZXRCaWxsYm9hcmQoZWRpdEluZGV4KS5wb3NpdGlvbiA9XG4gICAgICAgICAgICAgICAgY2FsY3VsYXRlSGFsZk1hcmtlclBvc2l0aW9uKGVkaXRJbmRleClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDEyNTIpIEZJWE1FOiBGdW5jdGlvbiBkZWNsYXJhdGlvbnMgYXJlIG5vdCBhbGxvd2VkIGluc2lkZSBibG9jay4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgZnVuY3Rpb24gb25FZGl0ZWQoKSB7XG4gICAgICAgICAgICBfc2VsZi5leGVjdXRlTGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgbmFtZTogJ29uRWRpdGVkJyxcbiAgICAgICAgICAgICAgcG9zaXRpb25zOiBfc2VsZi5wb3NpdGlvbnMsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBoYW5kbGVNYXJrZXJDaGFuZ2VzID0ge1xuICAgICAgICAgICAgZHJhZ0hhbmRsZXJzOiB7XG4gICAgICAgICAgICAgIG9uRHJhZyhpbmRleDogYW55LCBwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICAgICAgX3NlbGYucG9zaXRpb25zW2luZGV4XSA9IHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgdXBkYXRlSGFsZk1hcmtlcnMoaW5kZXgsIF9zZWxmLnBvc2l0aW9ucylcbiAgICAgICAgICAgICAgICBfc2VsZi5fY3JlYXRlUHJpbWl0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBvbkRyYWdFbmQoKSB7XG4gICAgICAgICAgICAgICAgX3NlbGYuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgICBvbkVkaXRlZCgpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SaWdodENsaWNrKGluZGV4OiBhbnkpIHtcbiAgICAgICAgICAgICAgLy8gTmVlZCB0byBjb3VudCB1bmlxdWUgcG9pbnRzIGJlY2F1c2UgcG9seWdvbi1kaXNwbGF5IGFkZHMgdGhlIGZpcnN0IHBvaW50IHRvIHRoZSBlbmQuXG4gICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZVBvaW50cyA9IGxvZGFzaC51bmlxV2l0aChcbiAgICAgICAgICAgICAgICBfc2VsZi5wb3NpdGlvbnMsXG4gICAgICAgICAgICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZXF1YWxzXG4gICAgICAgICAgICAgICkubGVuZ3RoXG4gICAgICAgICAgICAgIGNvbnN0IG1pblBvaW50c0ZvclJlbW92YWwgPSBfc2VsZi5pc1BvbHlnb24gPyA0IDogM1xuICAgICAgICAgICAgICBpZiAodW5pcXVlUG9pbnRzIDwgbWluUG9pbnRzRm9yUmVtb3ZhbCkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgcG9pbnQgYW5kIHRoZSBjb3JyZXNwb25kaW5nIG1hcmtlcnNcbiAgICAgICAgICAgICAgX3NlbGYucG9zaXRpb25zLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgX3NlbGYuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgbWFya2Vycy5yZW1vdmVCaWxsYm9hcmQoaW5kZXgpXG4gICAgICAgICAgICAgIGVkaXRNYXJrZXJzLnJlbW92ZUJpbGxib2FyZChpbmRleClcbiAgICAgICAgICAgICAgdXBkYXRlSGFsZk1hcmtlcnMoaW5kZXgsIF9zZWxmLnBvc2l0aW9ucylcbiAgICAgICAgICAgICAgb25FZGl0ZWQoKVxuICAgICAgICAgICAgICBkcmF3SGVscGVyLl9zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0b29sdGlwKCkge1xuICAgICAgICAgICAgICBsZXQgbXNnID0gJ0RyYWcgdG8gbW92ZSdcbiAgICAgICAgICAgICAgLy8gTmVlZCB0byBjb3VudCB1bmlxdWUgcG9pbnRzIGJlY2F1c2UgcG9seWdvbi1kaXNwbGF5IGFkZHMgdGhlIGZpcnN0IHBvaW50IHRvIHRoZSBlbmQuXG4gICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZVBvaW50cyA9IGxvZGFzaC51bmlxV2l0aChcbiAgICAgICAgICAgICAgICBfc2VsZi5wb3NpdGlvbnMsXG4gICAgICAgICAgICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZXF1YWxzXG4gICAgICAgICAgICAgICkubGVuZ3RoXG4gICAgICAgICAgICAgIGNvbnN0IG1pblBvaW50c0ZvclJlbW92YWwgPSBfc2VsZi5pc1BvbHlnb24gPyA0IDogM1xuICAgICAgICAgICAgICBpZiAodW5pcXVlUG9pbnRzID49IG1pblBvaW50c0ZvclJlbW92YWwpIHtcbiAgICAgICAgICAgICAgICBtc2cgKz0gJzxicj5SaWdodCBjbGljayB0byByZW1vdmUnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1zZ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gYWRkIGJpbGxib2FyZHMgYW5kIGtlZXAgYW4gb3JkZXJlZCBsaXN0IG9mIHRoZW0gZm9yIHRoZSBwb2x5Z29uIGVkZ2VzXG4gICAgICAgICAgbWFya2Vycy5hZGRCaWxsYm9hcmRzKF9zZWxmLnBvc2l0aW9ucywgaGFuZGxlTWFya2VyQ2hhbmdlcylcbiAgICAgICAgICB0aGlzLl9tYXJrZXJzID0gbWFya2Vyc1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgxMjUyKSBGSVhNRTogRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBub3QgYWxsb3dlZCBpbnNpZGUgYmxvY2suLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhhbGZNYXJrZXJQb3NpdGlvbihpbmRleDogYW55KSB7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBfc2VsZi5wb3NpdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBlbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oXG4gICAgICAgICAgICAgIG5ldyBDZXNpdW0uRWxsaXBzb2lkR2VvZGVzaWMoXG4gICAgICAgICAgICAgICAgZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKHBvc2l0aW9uc1tpbmRleF0pLFxuICAgICAgICAgICAgICAgIGVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyhcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uc1tpbmRleCA8IHBvc2l0aW9ucy5sZW5ndGggLSAxID8gaW5kZXggKyAxIDogMF1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkuaW50ZXJwb2xhdGVVc2luZ0ZyYWN0aW9uKDAuNSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaGFsZlBvc2l0aW9ucyA9IFtdXG4gICAgICAgICAgbGV0IGluZGV4ID0gMFxuICAgICAgICAgIGxldCBsZW5ndGggPSBfc2VsZi5wb3NpdGlvbnMubGVuZ3RoICsgKHRoaXMuaXNQb2x5Z29uID8gMCA6IC0xKVxuICAgICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgaGFsZlBvc2l0aW9ucy5wdXNoKGNhbGN1bGF0ZUhhbGZNYXJrZXJQb3NpdGlvbihpbmRleCkpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGhhbmRsZUVkaXRNYXJrZXJDaGFuZ2VzID0ge1xuICAgICAgICAgICAgZHJhZ0hhbmRsZXJzOiB7XG4gICAgICAgICAgICAgIG9uRHJhZ1N0YXJ0KGluZGV4OiBhbnksIHBvc2l0aW9uOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAvLyBhZGQgYSBuZXcgcG9zaXRpb24gdG8gdGhlIHBvbHlnb24gYnV0IG5vdCBhIG5ldyBtYXJrZXIgeWV0XG4gICAgICAgICAgICAgICAgOyh0aGlzIGFzIGFueSkuaW5kZXggPSBpbmRleCArIDFcbiAgICAgICAgICAgICAgICBfc2VsZi5wb3NpdGlvbnMuc3BsaWNlKCh0aGlzIGFzIGFueSkuaW5kZXgsIDAsIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIF9zZWxmLl9jcmVhdGVQcmltaXRpdmUgPSB0cnVlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG9uRHJhZyhfaW5kZXg6IGFueSwgcG9zaXRpb246IGFueSkge1xuICAgICAgICAgICAgICAgIF9zZWxmLnBvc2l0aW9uc1sodGhpcyBhcyBhbnkpLmluZGV4XSA9IHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgX3NlbGYuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgb25EcmFnRW5kKF9pbmRleDogYW55LCBwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBzZXRzIG9mIG1ha2VycyBmb3IgZWRpdGluZ1xuICAgICAgICAgICAgICAgIG1hcmtlcnMuaW5zZXJ0QmlsbGJvYXJkKFxuICAgICAgICAgICAgICAgICAgKHRoaXMgYXMgYW55KS5pbmRleCxcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgaGFuZGxlTWFya2VyQ2hhbmdlc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBlZGl0TWFya2Vycy5nZXRCaWxsYm9hcmQoKHRoaXMgYXMgYW55KS5pbmRleCAtIDEpLnBvc2l0aW9uID1cbiAgICAgICAgICAgICAgICAgIGNhbGN1bGF0ZUhhbGZNYXJrZXJQb3NpdGlvbigodGhpcyBhcyBhbnkpLmluZGV4IC0gMSlcbiAgICAgICAgICAgICAgICBlZGl0TWFya2Vycy5pbnNlcnRCaWxsYm9hcmQoXG4gICAgICAgICAgICAgICAgICAodGhpcyBhcyBhbnkpLmluZGV4LFxuICAgICAgICAgICAgICAgICAgY2FsY3VsYXRlSGFsZk1hcmtlclBvc2l0aW9uKCh0aGlzIGFzIGFueSkuaW5kZXgpLFxuICAgICAgICAgICAgICAgICAgaGFuZGxlRWRpdE1hcmtlckNoYW5nZXNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgX3NlbGYuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgICBvbkVkaXRlZCgpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9vbHRpcCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdEcmFnIHRvIGNyZWF0ZSBhIG5ldyBwb2ludCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICAgIGVkaXRNYXJrZXJzLmFkZEJpbGxib2FyZHMoaGFsZlBvc2l0aW9ucywgaGFuZGxlRWRpdE1hcmtlckNoYW5nZXMpXG4gICAgICAgICAgdGhpcy5fZWRpdE1hcmtlcnMgPSBlZGl0TWFya2Vyc1xuICAgICAgICAgIC8vIHNldCBvbiB0b3Agb2YgdGhlIHBvbHlnb25cbiAgICAgICAgICBtYXJrZXJzLnNldE9uVG9wKClcbiAgICAgICAgICBlZGl0TWFya2Vycy5zZXRPblRvcCgpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZWRpdE1vZGUgPSB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5fbWFya2VycyAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fbWFya2Vycy5yZW1vdmUoKVxuICAgICAgICAgIHRoaXMuX2VkaXRNYXJrZXJzLnJlbW92ZSgpXG4gICAgICAgICAgdGhpcy5fbWFya2VycyA9IG51bGxcbiAgICAgICAgICB0aGlzLl9lZGl0TWFya2VycyA9IG51bGxcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lZGl0TW9kZSA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIERyYXdIZWxwZXIuUG9seWxpbmVQcmltaXRpdmUucHJvdG90eXBlLnNldEVkaXRhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuc2V0RWRpdE1vZGUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBwb2x5bGluZSA9IHRoaXNcbiAgICAgIHBvbHlsaW5lLmlzUG9seWdvbiA9IGZhbHNlXG4gICAgICBwb2x5bGluZS5hc3luY2hyb25vdXMgPSBmYWxzZVxuICAgICAgcG9seWxpbmUuc2V0RWRpdE1vZGUgPSBzZXRFZGl0TW9kZVxuICAgICAgY29uc3Qgb3JpZ2luYWxXaWR0aCA9IHRoaXMud2lkdGhcbiAgICAgIHBvbHlsaW5lLnNldEhpZ2hsaWdodGVkID0gZnVuY3Rpb24gKGhpZ2hsaWdodGVkOiBhbnkpIHtcbiAgICAgICAgLy8gZGlzYWJsZSBpZiBhbHJlYWR5IGluIGVkaXQgbW9kZVxuICAgICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICBkcmF3SGVscGVyLnNldEhpZ2hsaWdodGVkKHRoaXMpXG4gICAgICAgICAgdGhpcy5zZXRXaWR0aChvcmlnaW5hbFdpZHRoICogMilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldFdpZHRoKG9yaWdpbmFsV2lkdGgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHBvbHlsaW5lLmdldEV4dGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIENlc2l1bS5FeHRlbnQuZnJvbUNhcnRvZ3JhcGhpY0FycmF5KFxuICAgICAgICAgIGVsbGlwc29pZC5jYXJ0ZXNpYW5BcnJheVRvQ2FydG9ncmFwaGljQXJyYXkodGhpcy5wb3NpdGlvbnMpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGVuaGFuY2VXaXRoTGlzdGVuZXJzKHBvbHlsaW5lKVxuICAgICAgcG9seWxpbmUuc2V0RWRpdE1vZGUodHJ1ZSlcbiAgICB9XG4gICAgRHJhd0hlbHBlci5Qb2x5Z29uUHJpbWl0aXZlLnByb3RvdHlwZS5zZXRFZGl0YWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnNldEVkaXRNb2RlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgcG9seWdvbiA9IHRoaXNcbiAgICAgIHBvbHlnb24uYXN5bmNocm9ub3VzID0gZmFsc2VcbiAgICAgIHBvbHlnb24uc2V0RWRpdE1vZGUgPSBzZXRFZGl0TW9kZVxuICAgICAgcG9seWdvbi5zZXRIaWdobGlnaHRlZCA9IHNldEhpZ2hsaWdodGVkXG4gICAgICBlbmhhbmNlV2l0aExpc3RlbmVycyhwb2x5Z29uKVxuICAgICAgcG9seWdvbi5zZXRFZGl0TW9kZSh0cnVlKVxuICAgIH1cbiAgICBEcmF3SGVscGVyLkV4dGVudFByaW1pdGl2ZS5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5zZXRFZGl0TW9kZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGV4dGVudCA9IHRoaXNcbiAgICAgIGV4dGVudC5hc3luY2hyb25vdXMgPSBmYWxzZVxuICAgICAgZXh0ZW50LnNldEVkaXRNb2RlID0gZnVuY3Rpb24gKGVkaXRNb2RlOiBhbnkpIHtcbiAgICAgICAgLy8gaWYgbm8gY2hhbmdlXG4gICAgICAgIGlmICh0aGlzLl9lZGl0TW9kZSA9PSBlZGl0TW9kZSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGRyYXdIZWxwZXIuZGlzYWJsZUFsbEhpZ2hsaWdodHMoKVxuICAgICAgICAvLyBkaXNwbGF5IG1hcmtlcnNcbiAgICAgICAgaWYgKGVkaXRNb2RlKSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIGFsbCBvdGhlciBzaGFwZXMgYXJlIG5vdCBpbiBlZGl0IG1vZGUgYmVmb3JlIHN0YXJ0aW5nIHRoZSBlZGl0aW5nIG9mIHRoaXMgc2hhcGVcbiAgICAgICAgICBkcmF3SGVscGVyLnNldEVkaXRlZCh0aGlzKVxuICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgbWFya2VycyBhbmQgaGFuZGxlcnMgZm9yIHRoZSBlZGl0aW5nXG4gICAgICAgICAgaWYgKHRoaXMuX21hcmtlcnMgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICBjb25zdCBtYXJrZXJzID0gbmV3IF8uQmlsbGJvYXJkR3JvdXAoZHJhd0hlbHBlciwgZHJhZ0JpbGxib2FyZClcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgxMjUyKSBGSVhNRTogRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBub3QgYWxsb3dlZCBpbnNpZGUgYmxvY2suLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgZnVuY3Rpb24gb25FZGl0ZWQoKSB7XG4gICAgICAgICAgICAgIGV4dGVudC5leGVjdXRlTGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnb25FZGl0ZWQnLFxuICAgICAgICAgICAgICAgIGV4dGVudDogZXh0ZW50LmV4dGVudCxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZU1hcmtlckNoYW5nZXMgPSB7XG4gICAgICAgICAgICAgIGRyYWdIYW5kbGVyczoge1xuICAgICAgICAgICAgICAgIG9uRHJhZyhpbmRleDogYW55LCBwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjb3JuZXIgPSBtYXJrZXJzLmdldEJpbGxib2FyZCgoaW5kZXggKyAyKSAlIDQpLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICBleHRlbnQuc2V0RXh0ZW50KFxuICAgICAgICAgICAgICAgICAgICBnZXRFeHRlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKGNvcm5lciksXG4gICAgICAgICAgICAgICAgICAgICAgZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICBtYXJrZXJzLnVwZGF0ZUJpbGxib2FyZHNQb3NpdGlvbnMoXG4gICAgICAgICAgICAgICAgICAgIGdldEV4dGVudENvcm5lcnMoZXh0ZW50LmV4dGVudClcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uRHJhZ0VuZCgpIHtcbiAgICAgICAgICAgICAgICAgIG9uRWRpdGVkKClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0b29sdGlwKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnRHJhZyB0byBjaGFuZ2UgdGhlIGNvcm5lcnMgb2YgdGhpcyBleHRlbnQnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXJrZXJzLmFkZEJpbGxib2FyZHMoXG4gICAgICAgICAgICAgIGdldEV4dGVudENvcm5lcnMoZXh0ZW50LmV4dGVudCksXG4gICAgICAgICAgICAgIGhhbmRsZU1hcmtlckNoYW5nZXNcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHRoaXMuX21hcmtlcnMgPSBtYXJrZXJzXG4gICAgICAgICAgICBtYXJrZXJzLnNldE9uVG9wKClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fZWRpdE1vZGUgPSB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuX21hcmtlcnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fbWFya2Vycy5yZW1vdmUoKVxuICAgICAgICAgICAgdGhpcy5fbWFya2VycyA9IG51bGxcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fZWRpdE1vZGUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBleHRlbnQuc2V0SGlnaGxpZ2h0ZWQgPSBzZXRIaWdobGlnaHRlZFxuICAgICAgZW5oYW5jZVdpdGhMaXN0ZW5lcnMoZXh0ZW50KVxuICAgICAgZXh0ZW50LnNldEVkaXRNb2RlKHRydWUpXG4gICAgfVxuICAgIF8uRWxsaXBzZVByaW1pdGl2ZS5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5zZXRFZGl0TW9kZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGVsbGlwc2UgPSB0aGlzXG4gICAgICBjb25zdCBzY2VuZSA9IGRyYXdIZWxwZXIuX3NjZW5lXG4gICAgICBlbGxpcHNlLmFzeW5jaHJvbm91cyA9IGZhbHNlXG4gICAgICBkcmF3SGVscGVyLnJlZ2lzdGVyRWRpdGFibGVTaGFwZShlbGxpcHNlKVxuICAgICAgZWxsaXBzZS5zZXRFZGl0TW9kZSA9IGZ1bmN0aW9uIChlZGl0TW9kZTogYW55KSB7XG4gICAgICAgIC8vIGlmIG5vIGNoYW5nZVxuICAgICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT0gZWRpdE1vZGUpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBkcmF3SGVscGVyLmRpc2FibGVBbGxIaWdobGlnaHRzKClcbiAgICAgICAgLy8gZGlzcGxheSBtYXJrZXJzXG4gICAgICAgIGlmIChlZGl0TW9kZSkge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSBhbGwgb3RoZXIgc2hhcGVzIGFyZSBub3QgaW4gZWRpdCBtb2RlIGJlZm9yZSBzdGFydGluZyB0aGUgZWRpdGluZyBvZiB0aGlzIHNoYXBlXG4gICAgICAgICAgZHJhd0hlbHBlci5zZXRFZGl0ZWQodGhpcylcbiAgICAgICAgICBjb25zdCBfc2VsZiA9IHRoaXNcbiAgICAgICAgICAvLyBjcmVhdGUgdGhlIG1hcmtlcnMgYW5kIGhhbmRsZXJzIGZvciB0aGUgZWRpdGluZ1xuICAgICAgICAgIGlmICh0aGlzLl9tYXJrZXJzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgY29uc3QgbWFya2VycyA9IG5ldyBfLkJpbGxib2FyZEdyb3VwKGRyYXdIZWxwZXIsIGRyYWdCaWxsYm9hcmQpXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMTI1MikgRklYTUU6IEZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBhcmUgbm90IGFsbG93ZWQgaW5zaWRlIGJsb2NrLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldE1hcmtlclBvc2l0aW9ucygpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIENlc2l1bS5TaGFwZXMuY29tcHV0ZUVsbGlwc2VCb3VuZGFyeShcbiAgICAgICAgICAgICAgICBlbGxpcHNvaWQsXG4gICAgICAgICAgICAgICAgZWxsaXBzZS5nZXRDZW50ZXIoKSxcbiAgICAgICAgICAgICAgICBlbGxpcHNlLmdldFNlbWlNYWpvckF4aXMoKSxcbiAgICAgICAgICAgICAgICBlbGxpcHNlLmdldFNlbWlNaW5vckF4aXMoKSxcbiAgICAgICAgICAgICAgICBlbGxpcHNlLmdldFJvdGF0aW9uKCkgKyBNYXRoLlBJIC8gMixcbiAgICAgICAgICAgICAgICBNYXRoLlBJIC8gMi4wXG4gICAgICAgICAgICAgICkuc3BsaWNlKDAsIDQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMTI1MikgRklYTUU6IEZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBhcmUgbm90IGFsbG93ZWQgaW5zaWRlIGJsb2NrLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uRWRpdGVkKCkge1xuICAgICAgICAgICAgICBlbGxpcHNlLmV4ZWN1dGVMaXN0ZW5lcnMoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdvbkVkaXRlZCcsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBlbGxpcHNlLmdldENlbnRlcigpLFxuICAgICAgICAgICAgICAgIHNlbWlNYWpvckF4aXM6IGVsbGlwc2UuZ2V0U2VtaU1ham9yQXhpcygpLFxuICAgICAgICAgICAgICAgIHNlbWlNaW5vckF4aXM6IGVsbGlwc2UuZ2V0U2VtaU1pbm9yQXhpcygpLFxuICAgICAgICAgICAgICAgIHJvdGF0aW9uOiAwLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaGFuZGxlTWFya2VyQ2hhbmdlcyA9IHtcbiAgICAgICAgICAgICAgZHJhZ0hhbmRsZXJzOiB7XG4gICAgICAgICAgICAgICAgb25EcmFnKGluZGV4OiBhbnksIHBvc2l0aW9uOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gQ2VzaXVtLkNhcnRlc2lhbjMuZGlzdGFuY2UoXG4gICAgICAgICAgICAgICAgICAgIGVsbGlwc2UuZ2V0Q2VudGVyKCksXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICBpZiAoaW5kZXggJSAyID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZWxsaXBzZS5zZXRTZW1pTWFqb3JBeGlzKGRpc3RhbmNlKVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxsaXBzZS5zZXRTZW1pTWlub3JBeGlzKGRpc3RhbmNlKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgbWFya2Vycy51cGRhdGVCaWxsYm9hcmRzUG9zaXRpb25zKGdldE1hcmtlclBvc2l0aW9ucygpKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25EcmFnRW5kKCkge1xuICAgICAgICAgICAgICAgICAgb25FZGl0ZWQoKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRvb2x0aXAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdEcmFnIHRvIGNoYW5nZSB0aGUgZXhjZW50cmljaXR5IGFuZCByYWRpdXMnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXJrZXJzLmFkZEJpbGxib2FyZHMoZ2V0TWFya2VyUG9zaXRpb25zKCksIGhhbmRsZU1hcmtlckNoYW5nZXMpXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXJzID0gbWFya2Vyc1xuICAgICAgICAgICAgLy8gYWRkIGEgaGFuZGxlciBmb3IgY2xpY2tpbmcgaW4gdGhlIGdsb2JlXG4gICAgICAgICAgICB0aGlzLl9nbG9iZUNsaWNraGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoXG4gICAgICAgICAgICAgIHNjZW5lLmNhbnZhc1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgdGhpcy5fZ2xvYmVDbGlja2hhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcGlja2VkT2JqZWN0ID0gc2NlbmUucGljayhtb3ZlbWVudC5wb3NpdGlvbilcbiAgICAgICAgICAgICAgaWYgKCEocGlja2VkT2JqZWN0ICYmIHBpY2tlZE9iamVjdC5wcmltaXRpdmUpKSB7XG4gICAgICAgICAgICAgICAgX3NlbGYuc2V0RWRpdE1vZGUoZmFsc2UpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0NMSUNLKVxuICAgICAgICAgICAgLy8gc2V0IG9uIHRvcCBvZiB0aGUgcG9seWdvblxuICAgICAgICAgICAgbWFya2Vycy5zZXRPblRvcCgpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2VkaXRNb2RlID0gdHJ1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLl9tYXJrZXJzICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX21hcmtlcnMucmVtb3ZlKClcbiAgICAgICAgICAgIHRoaXMuX21hcmtlcnMgPSBudWxsXG4gICAgICAgICAgICB0aGlzLl9nbG9iZUNsaWNraGFuZGxlci5kZXN0cm95KClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fZWRpdE1vZGUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbGxpcHNlLnNldEhpZ2hsaWdodGVkID0gc2V0SGlnaGxpZ2h0ZWRcbiAgICAgIGVuaGFuY2VXaXRoTGlzdGVuZXJzKGVsbGlwc2UpXG4gICAgICBlbGxpcHNlLnNldEVkaXRNb2RlKGZhbHNlKVxuICAgIH1cbiAgICBfLkNpcmNsZVByaW1pdGl2ZS5wcm90b3R5cGUuZ2V0Q2lyY2xlQ2FydGVzaWFuQ29vcmRpbmF0ZXMgPSBmdW5jdGlvbiAoXG4gICAgICBncmFudWxhcml0eTogYW55XG4gICAgKSB7XG4gICAgICBjb25zdCBnZW9tZXRyeSA9IENlc2l1bS5DaXJjbGVPdXRsaW5lR2VvbWV0cnkuY3JlYXRlR2VvbWV0cnkoXG4gICAgICAgIG5ldyBDZXNpdW0uQ2lyY2xlT3V0bGluZUdlb21ldHJ5KHtcbiAgICAgICAgICBlbGxpcHNvaWQsXG4gICAgICAgICAgY2VudGVyOiB0aGlzLmdldENlbnRlcigpLFxuICAgICAgICAgIHJhZGl1czogdGhpcy5nZXRSYWRpdXMoKSxcbiAgICAgICAgICBncmFudWxhcml0eSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGxldCBjb3VudCA9IDAsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICB2YWx1ZXMgPSBbXVxuICAgICAgZm9yICg7IGNvdW50IDwgZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi52YWx1ZXMubGVuZ3RoOyBjb3VudCArPSAzKSB7XG4gICAgICAgIHZhbHVlID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi52YWx1ZXNcbiAgICAgICAgdmFsdWVzLnB1c2goXG4gICAgICAgICAgbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKFxuICAgICAgICAgICAgdmFsdWVbY291bnRdLFxuICAgICAgICAgICAgdmFsdWVbY291bnQgKyAxXSxcbiAgICAgICAgICAgIHZhbHVlW2NvdW50ICsgMl1cbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZXNcbiAgICB9XG4gICAgXy5DaXJjbGVQcmltaXRpdmUucHJvdG90eXBlLnNldEVkaXRhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuc2V0RWRpdE1vZGUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBjaXJjbGUgPSB0aGlzXG4gICAgICBjaXJjbGUuYXN5bmNocm9ub3VzID0gZmFsc2VcbiAgICAgIGNpcmNsZS5zZXRFZGl0TW9kZSA9IGZ1bmN0aW9uIChlZGl0TW9kZTogYW55KSB7XG4gICAgICAgIC8vIGlmIG5vIGNoYW5nZVxuICAgICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT0gZWRpdE1vZGUpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBkcmF3SGVscGVyLmRpc2FibGVBbGxIaWdobGlnaHRzKClcbiAgICAgICAgLy8gZGlzcGxheSBtYXJrZXJzXG4gICAgICAgIGlmIChlZGl0TW9kZSkge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSBhbGwgb3RoZXIgc2hhcGVzIGFyZSBub3QgaW4gZWRpdCBtb2RlIGJlZm9yZSBzdGFydGluZyB0aGUgZWRpdGluZyBvZiB0aGlzIHNoYXBlXG4gICAgICAgICAgZHJhd0hlbHBlci5zZXRFZGl0ZWQodGhpcylcbiAgICAgICAgICBjb25zdCBfc2VsZiA9IHRoaXNcbiAgICAgICAgICAvLyBjcmVhdGUgdGhlIG1hcmtlcnMgYW5kIGhhbmRsZXJzIGZvciB0aGUgZWRpdGluZ1xuICAgICAgICAgIGlmICh0aGlzLl9tYXJrZXJzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgY29uc3QgbWFya2VycyA9IG5ldyBfLkJpbGxib2FyZEdyb3VwKGRyYXdIZWxwZXIsIGRyYWdCaWxsYm9hcmQpXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMTI1MikgRklYTUU6IEZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBhcmUgbm90IGFsbG93ZWQgaW5zaWRlIGJsb2NrLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldE1hcmtlclBvc2l0aW9ucygpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9zZWxmLmdldENpcmNsZUNhcnRlc2lhbkNvb3JkaW5hdGVzKFxuICAgICAgICAgICAgICAgIENlc2l1bS5NYXRoLlBJX09WRVJfVFdPXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgxMjUyKSBGSVhNRTogRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBub3QgYWxsb3dlZCBpbnNpZGUgYmxvY2suLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgZnVuY3Rpb24gb25FZGl0ZWQoKSB7XG4gICAgICAgICAgICAgIGNpcmNsZS5leGVjdXRlTGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnb25FZGl0ZWQnLFxuICAgICAgICAgICAgICAgIGNlbnRlcjogY2lyY2xlLmdldENlbnRlcigpLFxuICAgICAgICAgICAgICAgIHJhZGl1czogY2lyY2xlLmdldFJhZGl1cygpLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaGFuZGxlTWFya2VyQ2hhbmdlcyA9IHtcbiAgICAgICAgICAgICAgZHJhZ0hhbmRsZXJzOiB7XG4gICAgICAgICAgICAgICAgb25EcmFnKF9pbmRleDogYW55LCBwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICAgICAgICBjaXJjbGUuc2V0UmFkaXVzKFxuICAgICAgICAgICAgICAgICAgICBDZXNpdW0uQ2FydGVzaWFuMy5kaXN0YW5jZShjaXJjbGUuZ2V0Q2VudGVyKCksIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgbWFya2Vycy51cGRhdGVCaWxsYm9hcmRzUG9zaXRpb25zKGdldE1hcmtlclBvc2l0aW9ucygpKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25EcmFnRW5kKCkge1xuICAgICAgICAgICAgICAgICAgb25FZGl0ZWQoKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRvb2x0aXAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdEcmFnIHRvIGNoYW5nZSB0aGUgcmFkaXVzJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFya2Vycy5hZGRCaWxsYm9hcmRzKGdldE1hcmtlclBvc2l0aW9ucygpLCBoYW5kbGVNYXJrZXJDaGFuZ2VzKVxuICAgICAgICAgICAgdGhpcy5fbWFya2VycyA9IG1hcmtlcnNcbiAgICAgICAgICAgIG1hcmtlcnMuc2V0T25Ub3AoKVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9lZGl0TW9kZSA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5fbWFya2VycyAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXJrZXJzLnJlbW92ZSgpXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXJzID0gbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9lZGl0TW9kZSA9IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNpcmNsZS5zZXRIaWdobGlnaHRlZCA9IHNldEhpZ2hsaWdodGVkXG4gICAgICBlbmhhbmNlV2l0aExpc3RlbmVycyhjaXJjbGUpXG4gICAgICBjaXJjbGUuc2V0RWRpdE1vZGUodHJ1ZSlcbiAgICB9XG4gIH1cbiAgXy5EcmF3SGVscGVyV2lkZ2V0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjb25zdHJ1Y3RvclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzAwKSBGSVhNRTogRHVwbGljYXRlIGlkZW50aWZpZXIgJ3RoaXMnLlxuICAgIGZ1bmN0aW9uIF8odGhpczogYW55LCB0aGlzOiBhbnksIGRyYXdIZWxwZXI6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICAvLyBjb250YWluZXIgbXVzdCBiZSBzcGVjaWZpZWRcbiAgICAgIGlmICghQ2VzaXVtLmRlZmluZWQob3B0aW9ucy5jb250YWluZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBDZXNpdW0uRGV2ZWxvcGVyRXJyb3IoJ0NvbnRhaW5lciBpcyByZXF1aXJlZCcpXG4gICAgICB9XG4gICAgICBjb25zdCBkcmF3T3B0aW9ucyA9IHtcbiAgICAgICAgbWFya2VySWNvbjogJy4vaW1nL2dseXBoaWNvbnNfMjQyX2dvb2dsZV9tYXBzLnBuZycsXG4gICAgICAgIHBvbHlsaW5lSWNvbjogJy4vaW1nL2dseXBoaWNvbnNfMDk3X3ZlY3Rvcl9wYXRoX2xpbmUucG5nJyxcbiAgICAgICAgcG9seWdvbkljb246ICcuL2ltZy9nbHlwaGljb25zXzA5Nl92ZWN0b3JfcGF0aF9wb2x5Z29uLnBuZycsXG4gICAgICAgIGNpcmNsZUljb246ICcuL2ltZy9nbHlwaGljb25zXzA5NV92ZWN0b3JfcGF0aF9jaXJjbGUucG5nJyxcbiAgICAgICAgZXh0ZW50SWNvbjogJy4vaW1nL2dseXBoaWNvbnNfMDk0X3ZlY3Rvcl9wYXRoX3NxdWFyZS5wbmcnLFxuICAgICAgICBjbGVhckljb246ICcuL2ltZy9nbHlwaGljb25zXzA2N19jbGVhbmluZy5wbmcnLFxuICAgICAgICBwb2x5bGluZURyYXdpbmdPcHRpb25zOiBkZWZhdWx0UG9seWxpbmVPcHRpb25zLFxuICAgICAgICBwb2x5Z29uRHJhd2luZ09wdGlvbnM6IGRlZmF1bHRQb2x5Z29uT3B0aW9ucyxcbiAgICAgICAgZXh0ZW50RHJhd2luZ09wdGlvbnM6IGRlZmF1bHRFeHRlbnRPcHRpb25zLFxuICAgICAgICBjaXJjbGVEcmF3aW5nT3B0aW9uczogZGVmYXVsdENpcmNsZU9wdGlvbnMsXG4gICAgICB9XG4gICAgICBmaWxsT3B0aW9ucyhvcHRpb25zLCBkcmF3T3B0aW9ucylcbiAgICAgIGNvbnN0IF9zZWxmID0gdGhpc1xuICAgICAgY29uc3QgdG9vbGJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpXG4gICAgICB0b29sYmFyLmNsYXNzTmFtZSA9ICd0b29sYmFyJ1xuICAgICAgb3B0aW9ucy5jb250YWluZXIuYXBwZW5kQ2hpbGQodG9vbGJhcilcbiAgICAgIGZ1bmN0aW9uIGFkZEljb24oX2lkOiBhbnksIHVybDogYW55LCB0aXRsZTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpXG4gICAgICAgIGRpdi5jbGFzc05hbWUgPSAnYnV0dG9uJ1xuICAgICAgICBkaXYudGl0bGUgPSB0aXRsZVxuICAgICAgICB0b29sYmFyLmFwcGVuZENoaWxkKGRpdilcbiAgICAgICAgZGl2Lm9uY2xpY2sgPSBjYWxsYmFja1xuICAgICAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnU1BBTicpXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChzcGFuKVxuICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0lNRycpXG4gICAgICAgIDsoaW1hZ2UgYXMgYW55KS5zcmMgPSB1cmxcbiAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZChpbWFnZSlcbiAgICAgICAgcmV0dXJuIGRpdlxuICAgICAgfVxuICAgICAgY29uc3Qgc2NlbmUgPSBkcmF3SGVscGVyLl9zY2VuZVxuICAgICAgYWRkSWNvbihcbiAgICAgICAgJ21hcmtlcicsXG4gICAgICAgIG9wdGlvbnMubWFya2VySWNvbixcbiAgICAgICAgJ0NsaWNrIHRvIHN0YXJ0IGRyYXdpbmcgYSAyRCBtYXJrZXInLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgZHJhd0hlbHBlci5zdGFydERyYXdpbmdNYXJrZXIoe1xuICAgICAgICAgICAgY2FsbGJhY2socG9zaXRpb246IGFueSkge1xuICAgICAgICAgICAgICBfc2VsZi5leGVjdXRlTGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnbWFya2VyQ3JlYXRlZCcsXG4gICAgICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIGFkZEljb24oXG4gICAgICAgICdwb2x5bGluZScsXG4gICAgICAgIG9wdGlvbnMucG9seWxpbmVJY29uLFxuICAgICAgICAnQ2xpY2sgdG8gc3RhcnQgZHJhd2luZyBhIDJEIHBvbHlsaW5lJyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGRyYXdIZWxwZXIuc3RhcnREcmF3aW5nUG9seWxpbmUoe1xuICAgICAgICAgICAgY2FsbGJhY2socG9zaXRpb25zOiBhbnkpIHtcbiAgICAgICAgICAgICAgX3NlbGYuZXhlY3V0ZUxpc3RlbmVycyh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3BvbHlsaW5lQ3JlYXRlZCcsXG4gICAgICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApXG4gICAgICBhZGRJY29uKFxuICAgICAgICAncG9seWdvbicsXG4gICAgICAgIG9wdGlvbnMucG9seWdvbkljb24sXG4gICAgICAgICdDbGljayB0byBzdGFydCBkcmF3aW5nIGEgMkQgcG9seWdvbicsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBkcmF3SGVscGVyLnN0YXJ0RHJhd2luZ1BvbHlnb24oe1xuICAgICAgICAgICAgY2FsbGJhY2socG9zaXRpb25zOiBhbnkpIHtcbiAgICAgICAgICAgICAgX3NlbGYuZXhlY3V0ZUxpc3RlbmVycyh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3BvbHlnb25DcmVhdGVkJyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnMsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIGFkZEljb24oXG4gICAgICAgICdleHRlbnQnLFxuICAgICAgICBvcHRpb25zLmV4dGVudEljb24sXG4gICAgICAgICdDbGljayB0byBzdGFydCBkcmF3aW5nIGFuIEV4dGVudCcsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBkcmF3SGVscGVyLnN0YXJ0RHJhd2luZ0V4dGVudCh7XG4gICAgICAgICAgICBjYWxsYmFjayhleHRlbnQ6IGFueSkge1xuICAgICAgICAgICAgICBfc2VsZi5leGVjdXRlTGlzdGVuZXJzKHsgbmFtZTogJ2V4dGVudENyZWF0ZWQnLCBleHRlbnQgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgYWRkSWNvbihcbiAgICAgICAgJ2NpcmNsZScsXG4gICAgICAgIG9wdGlvbnMuY2lyY2xlSWNvbixcbiAgICAgICAgJ0NsaWNrIHRvIHN0YXJ0IGRyYXdpbmcgYSBDaXJjbGUnLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgZHJhd0hlbHBlci5zdGFydERyYXdpbmdDaXJjbGUoe1xuICAgICAgICAgICAgY2FsbGJhY2soY2VudGVyOiBhbnksIHJhZGl1czogYW55KSB7XG4gICAgICAgICAgICAgIF9zZWxmLmV4ZWN1dGVMaXN0ZW5lcnMoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdjaXJjbGVDcmVhdGVkJyxcbiAgICAgICAgICAgICAgICBjZW50ZXIsXG4gICAgICAgICAgICAgICAgcmFkaXVzLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApXG4gICAgICAvLyBhZGQgYSBjbGVhciBidXR0b24gYXQgdGhlIGVuZFxuICAgICAgLy8gYWRkIGEgZGl2aWRlciBmaXJzdFxuICAgICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpXG4gICAgICBkaXYuY2xhc3NOYW1lID0gJ2RpdmlkZXInXG4gICAgICB0b29sYmFyLmFwcGVuZENoaWxkKGRpdilcbiAgICAgIGFkZEljb24oJ2NsZWFyJywgb3B0aW9ucy5jbGVhckljb24sICdSZW1vdmUgYWxsIHByaW1pdGl2ZXMnLCAoKSA9PiB7XG4gICAgICAgIHNjZW5lLnByaW1pdGl2ZXMucmVtb3ZlQWxsKClcbiAgICAgIH0pXG4gICAgICBlbmhhbmNlV2l0aExpc3RlbmVycyh0aGlzKVxuICAgIH1cbiAgICByZXR1cm4gX1xuICB9KSgpXG4gIF8ucHJvdG90eXBlLmFkZFRvb2xiYXIgPSBmdW5jdGlvbiAoY29udGFpbmVyOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCB7IGNvbnRhaW5lciB9KVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTU0KSBGSVhNRTogRXhwZWN0ZWQgMyBhcmd1bWVudHMsIGJ1dCBnb3QgMi5cbiAgICByZXR1cm4gbmV3IF8uRHJhd0hlbHBlcldpZGdldCh0aGlzLCBvcHRpb25zKVxuICB9XG4gIGZ1bmN0aW9uIGdldEV4dGVudChtbjogYW55LCBteDogYW55KSB7XG4gICAgY29uc3QgZSA9IG5ldyBDZXNpdW0uUmVjdGFuZ2xlKClcbiAgICAvLyBSZS1vcmRlciBzbyB3ZXN0IDwgZWFzdCBhbmQgc291dGggPCBub3J0aFxuICAgIGUud2VzdCA9IE1hdGgubWluKG1uLmxvbmdpdHVkZSwgbXgubG9uZ2l0dWRlKVxuICAgIGUuZWFzdCA9IE1hdGgubWF4KG1uLmxvbmdpdHVkZSwgbXgubG9uZ2l0dWRlKVxuICAgIGUuc291dGggPSBNYXRoLm1pbihtbi5sYXRpdHVkZSwgbXgubGF0aXR1ZGUpXG4gICAgZS5ub3J0aCA9IE1hdGgubWF4KG1uLmxhdGl0dWRlLCBteC5sYXRpdHVkZSlcbiAgICAvLyBDaGVjayBmb3IgYXBwcm94IGVxdWFsIChzaG91bGRuJ3QgcmVxdWlyZSBhYnMgZHVlIHRvIHJlLW9yZGVyKVxuICAgIGNvbnN0IGVwc2lsb24gPSBDZXNpdW0uTWF0aC5FUFNJTE9ON1xuICAgIGlmIChlLmVhc3QgLSBlLndlc3QgPCBlcHNpbG9uKSB7XG4gICAgICBlLmVhc3QgKz0gZXBzaWxvbiAqIDIuMFxuICAgIH1cbiAgICBpZiAoZS5ub3J0aCAtIGUuc291dGggPCBlcHNpbG9uKSB7XG4gICAgICBlLm5vcnRoICs9IGVwc2lsb24gKiAyLjBcbiAgICB9XG4gICAgcmV0dXJuIGVcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb29sdGlwKGZyYW1lRGl2OiBhbnkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMwMCkgRklYTUU6IER1cGxpY2F0ZSBpZGVudGlmaWVyICd0aGlzJy5cbiAgICBjb25zdCB0b29sdGlwID0gZnVuY3Rpb24gKHRoaXM6IGFueSwgdGhpczogYW55LCBmcmFtZURpdjogYW55KSB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKVxuICAgICAgZGl2LmNsYXNzTmFtZSA9ICd0d2lwc3kgcmlnaHQgcG9pbnRlci1ldmVudHMtbm9uZSdcbiAgICAgIGNvbnN0IGFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJylcbiAgICAgIGFycm93LmNsYXNzTmFtZSA9ICd0d2lwc3ktYXJyb3cnXG4gICAgICBkaXYuYXBwZW5kQ2hpbGQoYXJyb3cpXG4gICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpXG4gICAgICB0aXRsZS5jbGFzc05hbWUgPSAndHdpcHN5LWlubmVyJ1xuICAgICAgZGl2LmFwcGVuZENoaWxkKHRpdGxlKVxuICAgICAgdGhpcy5fZGl2ID0gZGl2XG4gICAgICB0aGlzLl90aXRsZSA9IHRpdGxlXG4gICAgICAvLyBhZGQgdG8gZnJhbWUgZGl2IGFuZCBkaXNwbGF5IGNvb3JkaW5hdGVzXG4gICAgICBmcmFtZURpdi5hcHBlbmRDaGlsZChkaXYpXG4gICAgfVxuICAgIHRvb2x0aXAucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbiAodmlzaWJsZTogYW55KSB7XG4gICAgICB0aGlzLl9kaXYuc3R5bGUuZGlzcGxheSA9IHZpc2libGUgPyAnYmxvY2snIDogJ25vbmUnXG4gICAgfVxuICAgIHRvb2x0aXAucHJvdG90eXBlLnNob3dBdCA9IGZ1bmN0aW9uIChwb3NpdGlvbjogYW55LCBtZXNzYWdlOiBhbnkpIHtcbiAgICAgIGlmIChwb3NpdGlvbiAmJiBtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuc2V0VmlzaWJsZSh0cnVlKVxuICAgICAgICB0aGlzLl90aXRsZS5pbm5lckhUTUwgPSBtZXNzYWdlXG4gICAgICAgIHRoaXMuX2Rpdi5zdHlsZS5sZWZ0ID0gcG9zaXRpb24ueCArIDE1ICsgJ3B4J1xuICAgICAgICB0aGlzLl9kaXYuc3R5bGUudG9wID0gcG9zaXRpb24ueSArIDcgLSB0aGlzLl9kaXYuY2xpZW50SGVpZ2h0IC8gMiArICdweCdcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgIHJldHVybiBuZXcgdG9vbHRpcChmcmFtZURpdilcbiAgfVxuICBmdW5jdGlvbiBnZXREaXNwbGF5TGF0TG5nU3RyaW5nKGNhcnRvZ3JhcGhpYzogYW55LCBwcmVjaXNpb246IGFueSkge1xuICAgIHJldHVybiAoXG4gICAgICBjYXJ0b2dyYXBoaWMubG9uZ2l0dWRlLnRvRml4ZWQocHJlY2lzaW9uIHx8IDMpICtcbiAgICAgICcsICcgK1xuICAgICAgY2FydG9ncmFwaGljLmxhdGl0dWRlLnRvRml4ZWQocHJlY2lzaW9uIHx8IDMpXG4gICAgKVxuICB9XG4gIGZ1bmN0aW9uIGNsb25lKGZyb206IGFueSwgdG86IGFueSkge1xuICAgIGlmIChmcm9tID09IG51bGwgfHwgdHlwZW9mIGZyb20gIT0gJ29iamVjdCcpIHJldHVybiBmcm9tXG4gICAgaWYgKGZyb20uY29uc3RydWN0b3IgIT0gT2JqZWN0ICYmIGZyb20uY29uc3RydWN0b3IgIT0gQXJyYXkpIHJldHVybiBmcm9tXG4gICAgaWYgKFxuICAgICAgZnJvbS5jb25zdHJ1Y3RvciA9PSBEYXRlIHx8XG4gICAgICBmcm9tLmNvbnN0cnVjdG9yID09IFJlZ0V4cCB8fFxuICAgICAgZnJvbS5jb25zdHJ1Y3RvciA9PSBGdW5jdGlvbiB8fFxuICAgICAgZnJvbS5jb25zdHJ1Y3RvciA9PSBTdHJpbmcgfHxcbiAgICAgIGZyb20uY29uc3RydWN0b3IgPT0gTnVtYmVyIHx8XG4gICAgICBmcm9tLmNvbnN0cnVjdG9yID09IEJvb2xlYW5cbiAgICApXG4gICAgICByZXR1cm4gbmV3IGZyb20uY29uc3RydWN0b3IoZnJvbSlcbiAgICB0byA9IHRvIHx8IG5ldyBmcm9tLmNvbnN0cnVjdG9yKClcbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gZnJvbSkge1xuICAgICAgdG9bbmFtZV0gPVxuICAgICAgICB0eXBlb2YgdG9bbmFtZV0gPT0gJ3VuZGVmaW5lZCcgPyBjbG9uZShmcm9tW25hbWVdLCBudWxsKSA6IHRvW25hbWVdXG4gICAgfVxuICAgIHJldHVybiB0b1xuICB9XG4gIGZ1bmN0aW9uIGZpbGxPcHRpb25zKG9wdGlvbnM6IGFueSwgZGVmYXVsdE9wdGlvbnM6IGFueSkge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgbGV0IG9wdGlvblxuICAgIGZvciAob3B0aW9uIGluIGRlZmF1bHRPcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9uc1tvcHRpb25dID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgICAgICBvcHRpb25zW29wdGlvbl0gPSBjbG9uZShkZWZhdWx0T3B0aW9uc1tvcHRpb25dKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBzaGFsbG93IGNvcHlcbiAgZnVuY3Rpb24gY29weU9wdGlvbnMob3B0aW9uczogYW55LCBkZWZhdWx0T3B0aW9uczogYW55KSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgIGxldCBuZXdPcHRpb25zID0gY2xvbmUob3B0aW9ucyksXG4gICAgICBvcHRpb25cbiAgICBmb3IgKG9wdGlvbiBpbiBkZWZhdWx0T3B0aW9ucykge1xuICAgICAgaWYgKG5ld09wdGlvbnNbb3B0aW9uXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTU0KSBGSVhNRTogRXhwZWN0ZWQgMiBhcmd1bWVudHMsIGJ1dCBnb3QgMS5cbiAgICAgICAgbmV3T3B0aW9uc1tvcHRpb25dID0gY2xvbmUoZGVmYXVsdE9wdGlvbnNbb3B0aW9uXSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ld09wdGlvbnNcbiAgfVxuICBmdW5jdGlvbiBzZXRMaXN0ZW5lcihwcmltaXRpdmU6IGFueSwgdHlwZTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgcHJpbWl0aXZlW3R5cGVdID0gY2FsbGJhY2tcbiAgfVxuICBmdW5jdGlvbiBlbmhhbmNlV2l0aExpc3RlbmVycyhlbGVtZW50OiBhbnkpIHtcbiAgICBlbGVtZW50Ll9saXN0ZW5lcnMgPSB7fVxuICAgIGVsZW1lbnQuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiAobmFtZTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgICB0aGlzLl9saXN0ZW5lcnNbbmFtZV0gPSB0aGlzLl9saXN0ZW5lcnNbbmFtZV0gfHwgW11cbiAgICAgIHRoaXMuX2xpc3RlbmVyc1tuYW1lXS5wdXNoKGNhbGxiYWNrKVxuICAgICAgcmV0dXJuIHRoaXMuX2xpc3RlbmVyc1tuYW1lXS5sZW5ndGhcbiAgICB9XG4gICAgZWxlbWVudC5leGVjdXRlTGlzdGVuZXJzID0gZnVuY3Rpb24gKGV2ZW50OiBhbnksIGRlZmF1bHRDYWxsYmFjazogYW55KSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX2xpc3RlbmVyc1tldmVudC5uYW1lXSAmJlxuICAgICAgICB0aGlzLl9saXN0ZW5lcnNbZXZlbnQubmFtZV0ubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIGxldCBpbmRleCA9IDBcbiAgICAgICAgZm9yICg7IGluZGV4IDwgdGhpcy5fbGlzdGVuZXJzW2V2ZW50Lm5hbWVdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tldmVudC5uYW1lXVtpbmRleF0oZXZlbnQpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChkZWZhdWx0Q2FsbGJhY2spIHtcbiAgICAgICAgICBkZWZhdWx0Q2FsbGJhY2soZXZlbnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIF9cbn0pKClcbmV4cG9ydCBkZWZhdWx0IERyYXdIZWxwZXJcbiJdfQ==