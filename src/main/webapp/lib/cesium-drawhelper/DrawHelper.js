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
        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawingPolyshape(true, options);
    };
    _.prototype.startDrawingPolyline = function (options) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhd0hlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9saWIvY2VzaXVtLWRyYXdoZWxwZXIvRHJhd0hlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKOzs7Ozs7OztHQVFHO0FBQ0gsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFBO0FBQ2xDLE9BQU8sT0FBTyxNQUFNLG1EQUFtRCxDQUFBO0FBQ3ZFLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLFdBQVcsTUFBTSw4QkFBOEIsQ0FBQTtBQUN0RCxPQUFPLFNBQVMsTUFBTSwyQkFBMkIsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQTtBQUN6Riw4REFBOEQ7QUFDOUQsSUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQ2hCLElBQU0sVUFBVSxHQUFHLENBQUM7SUFDbEIsbUJBQW1CO0lBQ25CLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFBO0lBQ3hDLGNBQWM7SUFDZCxTQUFTLENBQUMsQ0FBWSxZQUFpQjtRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUE7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ3JELElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBO1FBQ25CLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQ3pCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0lBQzFCLENBQUM7SUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHO1FBQy9CLElBQU0sS0FBSyxH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QyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUE7UUFDckMsQ0FBQyxDQUFBO1FBQ0QsT0FBTyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsS0FBVSxFQUFFLGVBQW9CO1lBQ25FLElBQ0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUN0QyxDQUFDO2dCQUNELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQTtnQkFDYixPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQzNDLENBQUM7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxlQUFlLEVBQUUsQ0FBQztvQkFDcEIsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUN4QixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQTtJQUNILENBQUM7SUFDRCxPQUFPLENBQUMsQ0FBQTtBQUNWLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFDSixlQUFlLFVBQVUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLyoqXG4gKiBDcmVhdGVkIGJ5IHRob21hcyBvbiA5LzAxLzE0LlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIChjKSB3d3cuZ2VvY2VudG8uY29tXG4gKiB3d3cubWV0YWFwcy5jb21cbiAqXG4gKi9cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcbmltcG9ydCAqIGFzIFR1cmYgZnJvbSAnQHR1cmYvdHVyZidcbmltcG9ydCB1dGlsaXR5IGZyb20gJy4uLy4uL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvY2VzaXVtL3V0aWxpdHknXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgZHJhZ0hhbGZTdmcgZnJvbSAnISFyYXctbG9hZGVyIS4vZHJhZy1oYWxmLnN2ZydcbmltcG9ydCB2ZXJ0ZXhTdmcgZnJvbSAnISFyYXctbG9hZGVyIS4vdmVydGV4LnN2ZydcbmltcG9ydCB7IGNvbnRyYXN0aW5nQ29sb3IgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvbG9jYXRpb24vbG9jYXRpb24tY29sb3Itc2VsZWN0b3InXG4vLyBBdm9pZCBjb25mbGljdCB3aXRoIHRoZSBuYW1lIF8sIHdoaWNoIERyYXdIZWxwZXIgdXNlcyBhIGxvdFxuY29uc3QgbG9kYXNoID0gX1xuY29uc3QgRHJhd0hlbHBlciA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIHN0YXRpYyB2YXJpYWJsZXNcbiAgY29uc3QgZWxsaXBzb2lkID0gQ2VzaXVtLkVsbGlwc29pZC5XR1M4NFxuICAvLyBjb25zdHJ1Y3RvclxuICBmdW5jdGlvbiBfKHRoaXM6IGFueSwgY2VzaXVtV2lkZ2V0OiBhbnkpIHtcbiAgICB0aGlzLl9zY2VuZSA9IGNlc2l1bVdpZGdldC5zY2VuZVxuICAgIHRoaXMuX3Rvb2x0aXAgPSBjcmVhdGVUb29sdGlwKGNlc2l1bVdpZGdldC5jb250YWluZXIpXG4gICAgdGhpcy5fc3VyZmFjZXMgPSBbXVxuICAgIHRoaXMuaW5pdGlhbGlzZUhhbmRsZXJzKClcbiAgICB0aGlzLmVuaGFuY2VQcmltaXRpdmVzKClcbiAgfVxuICBfLnByb3RvdHlwZS5pbml0aWFsaXNlSGFuZGxlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qgc2NlbmUgPSB0aGlzLl9zY2VuZVxuICAgIC8vIHNjZW5lIGV2ZW50c1xuICAgIGNvbnN0IGhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKHNjZW5lLmNhbnZhcylcbiAgICBmdW5jdGlvbiBjYWxsUHJpbWl0aXZlQ2FsbGJhY2sobmFtZTogYW55LCBwb3NpdGlvbjogYW55KSB7XG4gICAgICBjb25zdCBwaWNrZWRPYmplY3QgPSBzY2VuZS5waWNrKHBvc2l0aW9uKVxuICAgICAgaWYgKFxuICAgICAgICBwaWNrZWRPYmplY3QgJiZcbiAgICAgICAgcGlja2VkT2JqZWN0LnByaW1pdGl2ZSAmJlxuICAgICAgICBwaWNrZWRPYmplY3QucHJpbWl0aXZlW25hbWVdXG4gICAgICApIHtcbiAgICAgICAgcGlja2VkT2JqZWN0LnByaW1pdGl2ZVtuYW1lXShwb3NpdGlvbilcbiAgICAgIH1cbiAgICB9XG4gICAgaGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgY2FsbFByaW1pdGl2ZUNhbGxiYWNrKCdsZWZ0Q2xpY2snLCBtb3ZlbWVudC5wb3NpdGlvbilcbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9DTElDSylcbiAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjYWxsUHJpbWl0aXZlQ2FsbGJhY2soJ2xlZnREb3VibGVDbGljaycsIG1vdmVtZW50LnBvc2l0aW9uKVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0RPVUJMRV9DTElDSylcbiAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjYWxsUHJpbWl0aXZlQ2FsbGJhY2soJ3JpZ2h0Q2xpY2snLCBtb3ZlbWVudC5wb3NpdGlvbilcbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuUklHSFRfQ0xJQ0spXG4gICAgbGV0IG1vdXNlT3V0T2JqZWN0OiBhbnlcbiAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBsZXQgcGlja2VkT2JqZWN0ID0gc2NlbmUucGljayhtb3ZlbWVudC5lbmRQb3NpdGlvbilcbiAgICAgIGlmIChcbiAgICAgICAgbW91c2VPdXRPYmplY3QgJiZcbiAgICAgICAgKCFwaWNrZWRPYmplY3QgfHwgbW91c2VPdXRPYmplY3QgIT0gcGlja2VkT2JqZWN0LnByaW1pdGl2ZSlcbiAgICAgICkge1xuICAgICAgICAhKG1vdXNlT3V0T2JqZWN0LmlzRGVzdHJveWVkICYmIG1vdXNlT3V0T2JqZWN0LmlzRGVzdHJveWVkKCkpICYmXG4gICAgICAgICAgbW91c2VPdXRPYmplY3QubW91c2VPdXQobW92ZW1lbnQuZW5kUG9zaXRpb24pXG4gICAgICAgIG1vdXNlT3V0T2JqZWN0ID0gbnVsbFxuICAgICAgfVxuICAgICAgaWYgKHBpY2tlZE9iamVjdCAmJiBwaWNrZWRPYmplY3QucHJpbWl0aXZlKSB7XG4gICAgICAgIHBpY2tlZE9iamVjdCA9IHBpY2tlZE9iamVjdC5wcmltaXRpdmVcbiAgICAgICAgaWYgKHBpY2tlZE9iamVjdC5tb3VzZU91dCkge1xuICAgICAgICAgIG1vdXNlT3V0T2JqZWN0ID0gcGlja2VkT2JqZWN0XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBpY2tlZE9iamVjdC5tb3VzZU1vdmUpIHtcbiAgICAgICAgICBwaWNrZWRPYmplY3QubW91c2VNb3ZlKG1vdmVtZW50LmVuZFBvc2l0aW9uKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLk1PVVNFX01PVkUpXG4gICAgaGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgY2FsbFByaW1pdGl2ZUNhbGxiYWNrKCdsZWZ0VXAnLCBtb3ZlbWVudC5wb3NpdGlvbilcbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9VUClcbiAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjYWxsUHJpbWl0aXZlQ2FsbGJhY2soJ2xlZnREb3duJywgbW92ZW1lbnQucG9zaXRpb24pXG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfRE9XTilcbiAgfVxuICBfLnByb3RvdHlwZS5zZXRMaXN0ZW5lciA9IGZ1bmN0aW9uIChcbiAgICBwcmltaXRpdmU6IGFueSxcbiAgICB0eXBlOiBhbnksXG4gICAgY2FsbGJhY2s6IGFueVxuICApIHtcbiAgICBwcmltaXRpdmVbdHlwZV0gPSBjYWxsYmFja1xuICB9XG4gIC8vIHJlZ2lzdGVyIGV2ZW50IGhhbmRsaW5nIGZvciBhbiBlZGl0YWJsZSBzaGFwZVxuICAvLyBzaGFwZSBzaG91bGQgaW1wbGVtZW50IHNldEVkaXRNb2RlIGFuZCBzZXRIaWdobGlnaHRlZFxuICBfLnByb3RvdHlwZS5yZWdpc3RlckVkaXRhYmxlU2hhcGUgPSBmdW5jdGlvbiAoc3VyZmFjZTogYW55KSB7XG4gICAgY29uc3QgX3NlbGYgPSB0aGlzXG4gICAgLy8gaGFuZGxlcnMgZm9yIGludGVyYWN0aW9uc1xuICAgIC8vIGhpZ2hsaWdodCBwb2x5Z29uIHdoZW4gbW91c2UgaXMgZW50ZXJpbmdcbiAgICBzZXRMaXN0ZW5lcihzdXJmYWNlLCAnbW91c2VNb3ZlJywgKHBvc2l0aW9uOiBhbnkpID0+IHtcbiAgICAgIHN1cmZhY2Uuc2V0SGlnaGxpZ2h0ZWQodHJ1ZSlcbiAgICAgIGlmICghc3VyZmFjZS5fZWRpdE1vZGUpIHtcbiAgICAgICAgX3NlbGYuX3Rvb2x0aXAuc2hvd0F0KHBvc2l0aW9uLCAnQ2xpY2sgdG8gZWRpdCB0aGlzIHNoYXBlJylcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vIGhpZGUgdGhlIGhpZ2hsaWdodGluZyB3aGVuIG1vdXNlIGlzIGxlYXZpbmcgdGhlIHBvbHlnb25cbiAgICBzZXRMaXN0ZW5lcihzdXJmYWNlLCAnbW91c2VPdXQnLCAoKSA9PiB7XG4gICAgICBzdXJmYWNlLnNldEhpZ2hsaWdodGVkKGZhbHNlKVxuICAgICAgX3NlbGYuX3Rvb2x0aXAuc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9KVxuICAgIHNldExpc3RlbmVyKHN1cmZhY2UsICdsZWZ0Q2xpY2snLCAoKSA9PiB7XG4gICAgICBzdXJmYWNlLnNldEVkaXRNb2RlKHRydWUpXG4gICAgfSlcbiAgfVxuICBfLnByb3RvdHlwZS5zdGFydERyYXdpbmcgPSBmdW5jdGlvbiAoY2xlYW5VcDogYW55KSB7XG4gICAgLy8gY2hlY2sgZm9yIGNsZWFuVXAgZmlyc3RcbiAgICBpZiAodGhpcy5lZGl0Q2xlYW5VcCkge1xuICAgICAgdGhpcy5lZGl0Q2xlYW5VcCgpXG4gICAgfVxuICAgIHRoaXMuZWRpdENsZWFuVXAgPSBjbGVhblVwXG4gIH1cbiAgXy5wcm90b3R5cGUuc3RvcERyYXdpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gY2hlY2sgZm9yIGNsZWFuVXAgZmlyc3RcbiAgICBpZiAodGhpcy5lZGl0Q2xlYW5VcCkge1xuICAgICAgdGhpcy5lZGl0Q2xlYW5VcCgpXG4gICAgICB0aGlzLmVkaXRDbGVhblVwID0gbnVsbFxuICAgIH1cbiAgfVxuICAvLyBtYWtlIHN1cmUgb25seSBvbmUgc2hhcGUgaXMgaGlnaGxpZ2h0ZWQgYXQgYSB0aW1lXG4gIF8ucHJvdG90eXBlLmRpc2FibGVBbGxIaWdobGlnaHRzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0SGlnaGxpZ2h0ZWQodW5kZWZpbmVkKVxuICB9XG4gIF8ucHJvdG90eXBlLnNldEhpZ2hsaWdodGVkID0gZnVuY3Rpb24gKHN1cmZhY2U6IGFueSkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuX2hpZ2hsaWdodGVkU3VyZmFjZSAmJlxuICAgICAgIXRoaXMuX2hpZ2hsaWdodGVkU3VyZmFjZS5pc0Rlc3Ryb3llZCgpICYmXG4gICAgICB0aGlzLl9oaWdobGlnaHRlZFN1cmZhY2UgIT0gc3VyZmFjZVxuICAgICkge1xuICAgICAgdGhpcy5faGlnaGxpZ2h0ZWRTdXJmYWNlLnNldEhpZ2hsaWdodGVkKGZhbHNlKVxuICAgIH1cbiAgICB0aGlzLl9oaWdobGlnaHRlZFN1cmZhY2UgPSBzdXJmYWNlXG4gIH1cbiAgXy5wcm90b3R5cGUuZGlzYWJsZUFsbEVkaXRNb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0RWRpdGVkKHVuZGVmaW5lZClcbiAgfVxuICBfLnByb3RvdHlwZS5zZXRFZGl0ZWQgPSBmdW5jdGlvbiAoc3VyZmFjZTogYW55KSB7XG4gICAgaWYgKHRoaXMuX2VkaXRlZFN1cmZhY2UgJiYgIXRoaXMuX2VkaXRlZFN1cmZhY2UuaXNEZXN0cm95ZWQoKSkge1xuICAgICAgdGhpcy5fZWRpdGVkU3VyZmFjZS5zZXRFZGl0TW9kZShmYWxzZSlcbiAgICB9XG4gICAgdGhpcy5fZWRpdGVkU3VyZmFjZSA9IHN1cmZhY2VcbiAgfVxuICBjb25zdCBtYXRlcmlhbCA9IENlc2l1bS5NYXRlcmlhbC5mcm9tVHlwZShDZXNpdW0uTWF0ZXJpYWwuQ29sb3JUeXBlKVxuICBtYXRlcmlhbC51bmlmb3Jtcy5jb2xvciA9IG5ldyBDZXNpdW0uQ29sb3IoMS4wLCAxLjAsIDAuMCwgMC41KVxuICBjb25zdCBkZWZhdWx0U2hhcGVPcHRpb25zID0ge1xuICAgIGVsbGlwc29pZDogQ2VzaXVtLkVsbGlwc29pZC5XR1M4NCxcbiAgICB0ZXh0dXJlUm90YXRpb25BbmdsZTogMC4wLFxuICAgIGhlaWdodDogMC4wLFxuICAgIGFzeW5jaHJvbm91czogdHJ1ZSxcbiAgICBzaG93OiB0cnVlLFxuICAgIGRlYnVnU2hvd0JvdW5kaW5nVm9sdW1lOiBmYWxzZSxcbiAgfVxuICBsZXQgZGVmYXVsdFN1cmZhY2VPcHRpb25zID0gY29weU9wdGlvbnMoZGVmYXVsdFNoYXBlT3B0aW9ucywge1xuICAgIGFwcGVhcmFuY2U6IG5ldyBDZXNpdW0uRWxsaXBzb2lkU3VyZmFjZUFwcGVhcmFuY2Uoe1xuICAgICAgYWJvdmVHcm91bmQ6IGZhbHNlLFxuICAgIH0pLFxuICAgIG1hdGVyaWFsLFxuICAgIGdyYW51bGFyaXR5OiBNYXRoLlBJIC8gMTgwLjAsXG4gIH0pXG4gIGxldCBkZWZhdWx0UG9seWdvbk9wdGlvbnMgPSBjb3B5T3B0aW9ucyhkZWZhdWx0U2hhcGVPcHRpb25zLCB7fSlcbiAgbGV0IGRlZmF1bHRFeHRlbnRPcHRpb25zID0gY29weU9wdGlvbnMoZGVmYXVsdFNoYXBlT3B0aW9ucywge30pXG4gIGxldCBkZWZhdWx0Q2lyY2xlT3B0aW9ucyA9IGNvcHlPcHRpb25zKGRlZmF1bHRTaGFwZU9wdGlvbnMsIHt9KVxuICBsZXQgZGVmYXVsdEVsbGlwc2VPcHRpb25zID0gY29weU9wdGlvbnMoZGVmYXVsdFN1cmZhY2VPcHRpb25zLCB7XG4gICAgcm90YXRpb246IDAsXG4gIH0pXG4gIGxldCBkZWZhdWx0UG9seWxpbmVPcHRpb25zID0gY29weU9wdGlvbnMoZGVmYXVsdFNoYXBlT3B0aW9ucywge1xuICAgIHdpZHRoOiA1LFxuICAgIGdlb2Rlc2ljOiB0cnVlLFxuICAgIGdyYW51bGFyaXR5OiAxMDAwMCxcbiAgICBhcHBlYXJhbmNlOiBuZXcgQ2VzaXVtLlBvbHlsaW5lTWF0ZXJpYWxBcHBlYXJhbmNlKHtcbiAgICAgIGFib3ZlR3JvdW5kOiBmYWxzZSxcbiAgICB9KSxcbiAgICBtYXRlcmlhbCxcbiAgfSlcbiAgLy8gICAgQ2VzaXVtLlBvbHlnb24ucHJvdG90eXBlLnNldFN0cm9rZVN0eWxlID0gc2V0U3Ryb2tlU3R5bGU7XG4gIC8vXG4gIC8vICAgIENlc2l1bS5Qb2x5Z29uLnByb3RvdHlwZS5kcmF3T3V0bGluZSA9IGRyYXdPdXRsaW5lO1xuICAvL1xuICBjb25zdCBDaGFuZ2VhYmxlUHJpbWl0aXZlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBfKCkge31cbiAgICBfLnByb3RvdHlwZS5pbml0aWFsaXNlT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zOiBhbnkpIHtcbiAgICAgIGZpbGxPcHRpb25zKHRoaXMsIG9wdGlvbnMpXG4gICAgICB0aGlzLl9lbGxpcHNvaWQgPSB1bmRlZmluZWRcbiAgICAgIHRoaXMuX2dyYW51bGFyaXR5ID0gdW5kZWZpbmVkXG4gICAgICB0aGlzLl9oZWlnaHQgPSB1bmRlZmluZWRcbiAgICAgIHRoaXMuX3RleHR1cmVSb3RhdGlvbkFuZ2xlID0gdW5kZWZpbmVkXG4gICAgICB0aGlzLl9pZCA9IHVuZGVmaW5lZFxuICAgICAgLy8gc2V0IHRoZSBmbGFncyB0byBpbml0aWF0ZSBhIGZpcnN0IGRyYXdpbmdcbiAgICAgIHRoaXMuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgIHRoaXMuX3ByaW1pdGl2ZSA9IHVuZGVmaW5lZFxuICAgICAgdGhpcy5fb3V0bGluZVBvbHlnb24gPSB1bmRlZmluZWRcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuc2V0QXR0cmlidXRlID0gZnVuY3Rpb24gKG5hbWU6IGFueSwgdmFsdWU6IGFueSkge1xuICAgICAgdGhpc1tuYW1lXSA9IHZhbHVlXG4gICAgICB0aGlzLl9jcmVhdGVQcmltaXRpdmUgPSB0cnVlXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lOiBhbnkpIHtcbiAgICAgIHJldHVybiB0aGlzW25hbWVdXG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgXy5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKFxuICAgICAgY29udGV4dDogYW55LFxuICAgICAgZnJhbWVTdGF0ZTogYW55LFxuICAgICAgY29tbWFuZExpc3Q6IGFueVxuICAgICkge1xuICAgICAgaWYgKCFDZXNpdW0uZGVmaW5lZCh0aGlzLmVsbGlwc29pZCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IENlc2l1bS5EZXZlbG9wZXJFcnJvcigndGhpcy5lbGxpcHNvaWQgbXVzdCBiZSBkZWZpbmVkLicpXG4gICAgICB9XG4gICAgICBpZiAoIUNlc2l1bS5kZWZpbmVkKHRoaXMuYXBwZWFyYW5jZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IENlc2l1bS5EZXZlbG9wZXJFcnJvcigndGhpcy5tYXRlcmlhbCBtdXN0IGJlIGRlZmluZWQuJylcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmdyYW51bGFyaXR5IDwgMC4wKSB7XG4gICAgICAgIHRocm93IG5ldyBDZXNpdW0uRGV2ZWxvcGVyRXJyb3IoXG4gICAgICAgICAgJ3RoaXMuZ3JhbnVsYXJpdHkgYW5kIHNjZW5lMkQvc2NlbmUzRCBvdmVycmlkZXMgbXVzdCBiZSBncmVhdGVyIHRoYW4gemVyby4nXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5zaG93KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLl9jcmVhdGVQcmltaXRpdmUgJiYgIUNlc2l1bS5kZWZpbmVkKHRoaXMuX3ByaW1pdGl2ZSkpIHtcbiAgICAgICAgLy8gTm8gcG9zaXRpb25zL2hpZXJhcmNoeSB0byBkcmF3XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICB0aGlzLl9jcmVhdGVQcmltaXRpdmUgfHxcbiAgICAgICAgdGhpcy5fZWxsaXBzb2lkICE9PSB0aGlzLmVsbGlwc29pZCB8fFxuICAgICAgICB0aGlzLl9ncmFudWxhcml0eSAhPT0gdGhpcy5ncmFudWxhcml0eSB8fFxuICAgICAgICB0aGlzLl9oZWlnaHQgIT09IHRoaXMuaGVpZ2h0IHx8XG4gICAgICAgIHRoaXMuX3RleHR1cmVSb3RhdGlvbkFuZ2xlICE9PSB0aGlzLnRleHR1cmVSb3RhdGlvbkFuZ2xlIHx8XG4gICAgICAgIHRoaXMuX2lkICE9PSB0aGlzLmlkXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB0aGlzLmdldEdlb21ldHJ5KClcbiAgICAgICAgaWYgKCFnZW9tZXRyeSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NyZWF0ZVByaW1pdGl2ZSA9IGZhbHNlXG4gICAgICAgIHRoaXMuX2VsbGlwc29pZCA9IHRoaXMuZWxsaXBzb2lkXG4gICAgICAgIHRoaXMuX2dyYW51bGFyaXR5ID0gdGhpcy5ncmFudWxhcml0eVxuICAgICAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLmhlaWdodFxuICAgICAgICB0aGlzLl90ZXh0dXJlUm90YXRpb25BbmdsZSA9IHRoaXMudGV4dHVyZVJvdGF0aW9uQW5nbGVcbiAgICAgICAgdGhpcy5faWQgPSB0aGlzLmlkXG4gICAgICAgIHRoaXMuX3ByaW1pdGl2ZSA9IHRoaXMuX3ByaW1pdGl2ZSAmJiB0aGlzLl9wcmltaXRpdmUuZGVzdHJveSgpXG4gICAgICAgIHRoaXMuX3ByaW1pdGl2ZSA9IG5ldyBDZXNpdW0uUHJpbWl0aXZlKHtcbiAgICAgICAgICBnZW9tZXRyeUluc3RhbmNlczogbmV3IENlc2l1bS5HZW9tZXRyeUluc3RhbmNlKHtcbiAgICAgICAgICAgIGdlb21ldHJ5LFxuICAgICAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgICBwaWNrUHJpbWl0aXZlOiB0aGlzLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGFwcGVhcmFuY2U6IHRoaXMuYXBwZWFyYW5jZSxcbiAgICAgICAgICBhc3luY2hyb25vdXM6IHRoaXMuYXN5bmNocm9ub3VzLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLl9vdXRsaW5lUG9seWdvbiA9XG4gICAgICAgICAgdGhpcy5fb3V0bGluZVBvbHlnb24gJiYgdGhpcy5fb3V0bGluZVBvbHlnb24uZGVzdHJveSgpXG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlciAmJiB0aGlzLmdldE91dGxpbmVHZW9tZXRyeSkge1xuICAgICAgICAgIGNvbnN0IG91dGxpbmVHZW9tZXRyeSA9IHRoaXMuZ2V0T3V0bGluZUdlb21ldHJ5KClcbiAgICAgICAgICBpZiAob3V0bGluZUdlb21ldHJ5KSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGhpZ2hsaWdodGluZyBmcmFtZVxuICAgICAgICAgICAgdGhpcy5fb3V0bGluZVBvbHlnb24gPSBuZXcgQ2VzaXVtLlByaW1pdGl2ZSh7XG4gICAgICAgICAgICAgIGdlb21ldHJ5SW5zdGFuY2VzOiBuZXcgQ2VzaXVtLkdlb21ldHJ5SW5zdGFuY2Uoe1xuICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBvdXRsaW5lR2VvbWV0cnksXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgICAgY29sb3I6IENlc2l1bS5Db2xvckdlb21ldHJ5SW5zdGFuY2VBdHRyaWJ1dGUuZnJvbUNvbG9yKFxuICAgICAgICAgICAgICAgICAgICBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGNvbnRyYXN0aW5nQ29sb3IpXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBhcHBlYXJhbmNlOiBuZXcgQ2VzaXVtLlBvbHlsaW5lTWF0ZXJpYWxBcHBlYXJhbmNlKHtcbiAgICAgICAgICAgICAgICBtYXRlcmlhbDogQ2VzaXVtLk1hdGVyaWFsLmZyb21UeXBlKCdDb2xvcicsIHtcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKGNvbnRyYXN0aW5nQ29sb3IpLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBwcmltaXRpdmUgPSB0aGlzLl9wcmltaXRpdmVcbiAgICAgIHByaW1pdGl2ZS5hcHBlYXJhbmNlLm1hdGVyaWFsID0gdGhpcy5tYXRlcmlhbFxuICAgICAgcHJpbWl0aXZlLmRlYnVnU2hvd0JvdW5kaW5nVm9sdW1lID0gdGhpcy5kZWJ1Z1Nob3dCb3VuZGluZ1ZvbHVtZVxuICAgICAgcHJpbWl0aXZlLnVwZGF0ZShjb250ZXh0LCBmcmFtZVN0YXRlLCBjb21tYW5kTGlzdClcbiAgICAgIGlmICh0aGlzLl9vdXRsaW5lUG9seWdvbikge1xuICAgICAgICB0aGlzLl9vdXRsaW5lUG9seWdvbi51cGRhdGUoY29udGV4dCwgZnJhbWVTdGF0ZSwgY29tbWFuZExpc3QpXG4gICAgICB9XG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmlzRGVzdHJveWVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLl9wcmltaXRpdmUgPSB0aGlzLl9wcmltaXRpdmUgJiYgdGhpcy5fcHJpbWl0aXZlLmRlc3Ryb3koKVxuICAgICAgcmV0dXJuIENlc2l1bS5kZXN0cm95T2JqZWN0KHRoaXMpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLnNldFN0cm9rZVN0eWxlID0gZnVuY3Rpb24gKHN0cm9rZUNvbG9yOiBhbnksIHN0cm9rZVdpZHRoOiBhbnkpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuc3Ryb2tlQ29sb3IgfHxcbiAgICAgICAgIXRoaXMuc3Ryb2tlQ29sb3IuZXF1YWxzKHN0cm9rZUNvbG9yKSB8fFxuICAgICAgICB0aGlzLnN0cm9rZVdpZHRoICE9IHN0cm9rZVdpZHRoXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5fY3JlYXRlUHJpbWl0aXZlID0gdHJ1ZVxuICAgICAgICB0aGlzLnN0cm9rZUNvbG9yID0gc3Ryb2tlQ29sb3JcbiAgICAgICAgdGhpcy5zdHJva2VXaWR0aCA9IHN0cm9rZVdpZHRoXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfXG4gIH0pKClcbiAgXy5FeHRlbnRQcmltaXRpdmUgPSAoZnVuY3Rpb24gKCkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzAwKSBGSVhNRTogRHVwbGljYXRlIGlkZW50aWZpZXIgJ3RoaXMnLlxuICAgIGZ1bmN0aW9uIF8odGhpczogYW55LCB0aGlzOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgaWYgKCFDZXNpdW0uZGVmaW5lZChvcHRpb25zLmV4dGVudCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IENlc2l1bS5EZXZlbG9wZXJFcnJvcignRXh0ZW50IGlzIHJlcXVpcmVkJylcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0U3VyZmFjZU9wdGlvbnMpXG4gICAgICB0aGlzLmluaXRpYWxpc2VPcHRpb25zKG9wdGlvbnMpXG4gICAgICB0aGlzLnNldEV4dGVudChvcHRpb25zLmV4dGVudClcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgXy5wcm90b3R5cGUgPSBuZXcgQ2hhbmdlYWJsZVByaW1pdGl2ZSgpXG4gICAgXy5wcm90b3R5cGUuc2V0RXh0ZW50ID0gZnVuY3Rpb24gKGV4dGVudDogYW55KSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZXh0ZW50JywgZXh0ZW50KVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRFeHRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2V4dGVudCcpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldEdlb21ldHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFDZXNpdW0uZGVmaW5lZCh0aGlzLmV4dGVudCkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXG4gICAgICAgIENlc2l1bS5DYXJ0ZXNpYW4zLmZyb21SYWRpYW5zKHRoaXMuZXh0ZW50Lndlc3QsIHRoaXMuZXh0ZW50LnNvdXRoKSxcbiAgICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbVJhZGlhbnModGhpcy5leHRlbnQud2VzdCwgdGhpcy5leHRlbnQubm9ydGgpLFxuICAgICAgICBDZXNpdW0uQ2FydGVzaWFuMy5mcm9tUmFkaWFucyh0aGlzLmV4dGVudC5lYXN0LCB0aGlzLmV4dGVudC5ub3J0aCksXG4gICAgICAgIENlc2l1bS5DYXJ0ZXNpYW4zLmZyb21SYWRpYW5zKHRoaXMuZXh0ZW50LmVhc3QsIHRoaXMuZXh0ZW50LnNvdXRoKSxcbiAgICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbVJhZGlhbnModGhpcy5leHRlbnQud2VzdCwgdGhpcy5leHRlbnQuc291dGgpLFxuICAgICAgXVxuICAgICAgLy8gRGlzcGxheSBhIFBvbHlnb25HZW9tZXRyeSBpbnN0ZWFkIG9mIGEgUmVjdGFuZ2xlR2VvbWV0cnkgYmVjYXVzZSBSZWN0YW5nbGVHZW9tZXRyaWVzXG4gICAgICAvLyBhcHBlYXIgdG8gYWx3YXlzIHdyYXAgdGhlIGxvbmcgd2F5IGFyb3VuZCB0aGUgYW50aW1lcmlkaWFuLlxuICAgICAgcmV0dXJuIENlc2l1bS5Qb2x5Z29uR2VvbWV0cnkuZnJvbVBvc2l0aW9ucyh7XG4gICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgc3RSb3RhdGlvbjogdGhpcy50ZXh0dXJlUm90YXRpb25BbmdsZSxcbiAgICAgICAgZWxsaXBzb2lkOiB0aGlzLmVsbGlwc29pZCxcbiAgICAgICAgZ3JhbnVsYXJpdHk6IHRoaXMuZ3JhbnVsYXJpdHksXG4gICAgICB9KVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRPdXRsaW5lR2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IENlc2l1bS5SZWN0YW5nbGVPdXRsaW5lR2VvbWV0cnkoe1xuICAgICAgICByZWN0YW5nbGU6IHRoaXMuZXh0ZW50LFxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIF9cbiAgfSkoKVxuICBfLlBvbHlnb25QcmltaXRpdmUgPSAoZnVuY3Rpb24gKCkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzAwKSBGSVhNRTogRHVwbGljYXRlIGlkZW50aWZpZXIgJ3RoaXMnLlxuICAgIGZ1bmN0aW9uIF8odGhpczogYW55LCB0aGlzOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgb3B0aW9ucyA9IGNvcHlPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRTdXJmYWNlT3B0aW9ucylcbiAgICAgIHRoaXMuaW5pdGlhbGlzZU9wdGlvbnMob3B0aW9ucylcbiAgICAgIHRoaXMuaXNQb2x5Z29uID0gdHJ1ZVxuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBfLnByb3RvdHlwZSA9IG5ldyBDaGFuZ2VhYmxlUHJpbWl0aXZlKClcbiAgICBfLnByb3RvdHlwZS5zZXRQb3NpdGlvbnMgPSBmdW5jdGlvbiAocG9zaXRpb25zOiBhbnkpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdwb3NpdGlvbnMnLCBwb3NpdGlvbnMpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgncG9zaXRpb25zJylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0R2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIUNlc2l1bS5kZWZpbmVkKHRoaXMucG9zaXRpb25zKSB8fCB0aGlzLnBvc2l0aW9ucy5sZW5ndGggPCAzKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgcmV0dXJuIENlc2l1bS5Qb2x5Z29uR2VvbWV0cnkuZnJvbVBvc2l0aW9ucyh7XG4gICAgICAgIHBvc2l0aW9uczogdGhpcy5wb3NpdGlvbnMsXG4gICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIHN0Um90YXRpb246IHRoaXMudGV4dHVyZVJvdGF0aW9uQW5nbGUsXG4gICAgICAgIGVsbGlwc29pZDogdGhpcy5lbGxpcHNvaWQsXG4gICAgICAgIGdyYW51bGFyaXR5OiB0aGlzLmdyYW51bGFyaXR5LFxuICAgICAgfSlcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0T3V0bGluZUdlb21ldHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKFxuICAgICAgICAhQ2VzaXVtLmRlZmluZWQodGhpcy5wb3NpdGlvbnMpIHx8XG4gICAgICAgIHRoaXMucG9zaXRpb25zLmxlbmd0aCA8IDMgfHxcbiAgICAgICAgIXRoaXMuYnVmZmVyXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IHRoaXMucG9zaXRpb25zLm1hcCgocG9zOiBDZXNpdW0uQ2FydGVzaWFuMykgPT4ge1xuICAgICAgICBjb25zdCBjYXJ0b2dyYXBoaWMgPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21DYXJ0ZXNpYW4ocG9zKVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIENlc2l1bS5NYXRoLnRvRGVncmVlcyhjYXJ0b2dyYXBoaWMubG9uZ2l0dWRlKSxcbiAgICAgICAgICBDZXNpdW0uTWF0aC50b0RlZ3JlZXMoY2FydG9ncmFwaGljLmxhdGl0dWRlKSxcbiAgICAgICAgICBjYXJ0b2dyYXBoaWMuYWx0aXR1ZGUsXG4gICAgICAgIF1cbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGFkanVzdGVkUG9seWdvbiA9IFR1cmYucG9seWdvbihbY29vcmRpbmF0ZXNdKVxuICAgICAgdXRpbGl0eS5hZGp1c3RHZW9Db29yZHMoYWRqdXN0ZWRQb2x5Z29uKVxuXG4gICAgICBjb25zdCBidWZmZXJlZFBvbHlnb24gPSBUdXJmLmJ1ZmZlcihcbiAgICAgICAgYWRqdXN0ZWRQb2x5Z29uLFxuICAgICAgICBNYXRoLm1heCh0aGlzLmJ1ZmZlciwgMSksXG4gICAgICAgIHtcbiAgICAgICAgICB1bml0czogJ21ldGVycycsXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIGlmICghYnVmZmVyZWRQb2x5Z29uKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8gbmVlZCB0byBhZGp1c3QgdGhlIHBvaW50cyBhZ2FpbiBBRlRFUiBidWZmZXJpbmcsIHNpbmNlIGJ1ZmZlcmluZyB1bmRvZXMgdGhlIGFudGltZXJpZGlhbiBhZGp1c3RtZW50c1xuICAgICAgdXRpbGl0eS5hZGp1c3RHZW9Db29yZHMoYnVmZmVyZWRQb2x5Z29uKVxuICAgICAgY29uc3Qgb3V0bGluZVBvc2l0aW9ucyA9IGJ1ZmZlcmVkUG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXS5tYXAoXG4gICAgICAgIChjb29yZCkgPT4gQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbURlZ3JlZXMoY29vcmRbMF0sIGNvb3JkWzFdLCBjb29yZFsyXSlcbiAgICAgIClcbiAgICAgIHJldHVybiBuZXcgQ2VzaXVtLlBvbHlsaW5lR2VvbWV0cnkoe1xuICAgICAgICBwb3NpdGlvbnM6IG91dGxpbmVQb3NpdGlvbnMsXG4gICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIHdpZHRoOiB0aGlzLndpZHRoIDwgMSA/IDEgOiB0aGlzLndpZHRoLFxuICAgICAgICBlbGxpcHNvaWQ6IHRoaXMuZWxsaXBzb2lkLFxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIF9cbiAgfSkoKVxuICBfLkNpcmNsZVByaW1pdGl2ZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMDApIEZJWE1FOiBEdXBsaWNhdGUgaWRlbnRpZmllciAndGhpcycuXG4gICAgZnVuY3Rpb24gXyh0aGlzOiBhbnksIHRoaXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBpZiAoIShDZXNpdW0uZGVmaW5lZChvcHRpb25zLmNlbnRlcikgJiYgQ2VzaXVtLmRlZmluZWQob3B0aW9ucy5yYWRpdXMpKSkge1xuICAgICAgICB0aHJvdyBuZXcgQ2VzaXVtLkRldmVsb3BlckVycm9yKCdDZW50ZXIgYW5kIHJhZGl1cyBhcmUgcmVxdWlyZWQnKVxuICAgICAgfVxuICAgICAgb3B0aW9ucyA9IGNvcHlPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRTdXJmYWNlT3B0aW9ucylcbiAgICAgIHRoaXMuaW5pdGlhbGlzZU9wdGlvbnMob3B0aW9ucylcbiAgICAgIHRoaXMuc2V0UmFkaXVzKG9wdGlvbnMucmFkaXVzKVxuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBfLnByb3RvdHlwZSA9IG5ldyBDaGFuZ2VhYmxlUHJpbWl0aXZlKClcbiAgICBfLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbiAoY2VudGVyOiBhbnkpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdjZW50ZXInLCBjZW50ZXIpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLnNldFJhZGl1cyA9IGZ1bmN0aW9uIChyYWRpdXM6IGFueSkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3JhZGl1cycsIE1hdGgubWF4KDAuMSwgcmFkaXVzKSlcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0Q2VudGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdjZW50ZXInKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRSYWRpdXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ3JhZGl1cycpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldEdlb21ldHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCEoQ2VzaXVtLmRlZmluZWQodGhpcy5jZW50ZXIpICYmIENlc2l1bS5kZWZpbmVkKHRoaXMucmFkaXVzKSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IENlc2l1bS5DaXJjbGVHZW9tZXRyeSh7XG4gICAgICAgIGNlbnRlcjogdGhpcy5jZW50ZXIsXG4gICAgICAgIHJhZGl1czogdGhpcy5yYWRpdXMsXG4gICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIHN0Um90YXRpb246IHRoaXMudGV4dHVyZVJvdGF0aW9uQW5nbGUsXG4gICAgICAgIGVsbGlwc29pZDogdGhpcy5lbGxpcHNvaWQsXG4gICAgICAgIGdyYW51bGFyaXR5OiB0aGlzLmdyYW51bGFyaXR5LFxuICAgICAgfSlcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0T3V0bGluZUdlb21ldHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBDZXNpdW0uQ2lyY2xlT3V0bGluZUdlb21ldHJ5KHtcbiAgICAgICAgY2VudGVyOiB0aGlzLmdldENlbnRlcigpLFxuICAgICAgICByYWRpdXM6IHRoaXMuZ2V0UmFkaXVzKCksXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gX1xuICB9KSgpXG4gIF8uRWxsaXBzZVByaW1pdGl2ZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gXyh0aGlzOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgaWYgKFxuICAgICAgICAhKFxuICAgICAgICAgIENlc2l1bS5kZWZpbmVkKG9wdGlvbnMuY2VudGVyKSAmJlxuICAgICAgICAgIENlc2l1bS5kZWZpbmVkKG9wdGlvbnMuc2VtaU1ham9yQXhpcykgJiZcbiAgICAgICAgICBDZXNpdW0uZGVmaW5lZChvcHRpb25zLnNlbWlNaW5vckF4aXMpXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgQ2VzaXVtLkRldmVsb3BlckVycm9yKFxuICAgICAgICAgICdDZW50ZXIgYW5kIHNlbWkgbWFqb3IgYW5kIHNlbWkgbWlub3IgYXhpcyBhcmUgcmVxdWlyZWQnXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0RWxsaXBzZU9wdGlvbnMpXG4gICAgICB0aGlzLmluaXRpYWxpc2VPcHRpb25zKG9wdGlvbnMpXG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgIF8ucHJvdG90eXBlID0gbmV3IENoYW5nZWFibGVQcmltaXRpdmUoKVxuICAgIF8ucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uIChjZW50ZXI6IGFueSkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2NlbnRlcicsIGNlbnRlcilcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuc2V0U2VtaU1ham9yQXhpcyA9IGZ1bmN0aW9uIChzZW1pTWFqb3JBeGlzOiBhbnkpIHtcbiAgICAgIGlmIChzZW1pTWFqb3JBeGlzIDwgdGhpcy5nZXRTZW1pTWlub3JBeGlzKCkpIHJldHVyblxuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3NlbWlNYWpvckF4aXMnLCBzZW1pTWFqb3JBeGlzKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5zZXRTZW1pTWlub3JBeGlzID0gZnVuY3Rpb24gKHNlbWlNaW5vckF4aXM6IGFueSkge1xuICAgICAgaWYgKHNlbWlNaW5vckF4aXMgPiB0aGlzLmdldFNlbWlNYWpvckF4aXMoKSkgcmV0dXJuXG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnc2VtaU1pbm9yQXhpcycsIHNlbWlNaW5vckF4aXMpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLnNldFJvdGF0aW9uID0gZnVuY3Rpb24gKHJvdGF0aW9uOiBhbnkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldEF0dHJpYnV0ZSgncm90YXRpb24nLCByb3RhdGlvbilcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0Q2VudGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdjZW50ZXInKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5nZXRTZW1pTWFqb3JBeGlzID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdzZW1pTWFqb3JBeGlzJylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0U2VtaU1pbm9yQXhpcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgnc2VtaU1pbm9yQXhpcycpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldFJvdGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdyb3RhdGlvbicpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldEdlb21ldHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKFxuICAgICAgICAhKFxuICAgICAgICAgIENlc2l1bS5kZWZpbmVkKHRoaXMuY2VudGVyKSAmJlxuICAgICAgICAgIENlc2l1bS5kZWZpbmVkKHRoaXMuc2VtaU1ham9yQXhpcykgJiZcbiAgICAgICAgICBDZXNpdW0uZGVmaW5lZCh0aGlzLnNlbWlNaW5vckF4aXMpXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQ2VzaXVtLkVsbGlwc2VHZW9tZXRyeSh7XG4gICAgICAgIGVsbGlwc29pZDogdGhpcy5lbGxpcHNvaWQsXG4gICAgICAgIGNlbnRlcjogdGhpcy5jZW50ZXIsXG4gICAgICAgIHNlbWlNYWpvckF4aXM6IHRoaXMuc2VtaU1ham9yQXhpcyxcbiAgICAgICAgc2VtaU1pbm9yQXhpczogdGhpcy5zZW1pTWlub3JBeGlzLFxuICAgICAgICByb3RhdGlvbjogdGhpcy5yb3RhdGlvbixcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgdmVydGV4Rm9ybWF0OiBDZXNpdW0uRWxsaXBzb2lkU3VyZmFjZUFwcGVhcmFuY2UuVkVSVEVYX0ZPUk1BVCxcbiAgICAgICAgc3RSb3RhdGlvbjogdGhpcy50ZXh0dXJlUm90YXRpb25BbmdsZSxcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDExMTcpIEZJWE1FOiBBbiBvYmplY3QgbGl0ZXJhbCBjYW5ub3QgaGF2ZSBtdWx0aXBsZSBwcm9wZXJ0aWVzIC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGVsbGlwc29pZDogdGhpcy5lbGxpcHNvaWQsXG4gICAgICAgIGdyYW51bGFyaXR5OiB0aGlzLmdyYW51bGFyaXR5LFxuICAgICAgfSlcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0T3V0bGluZUdlb21ldHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBDZXNpdW0uRWxsaXBzZU91dGxpbmVHZW9tZXRyeSh7XG4gICAgICAgIGNlbnRlcjogdGhpcy5nZXRDZW50ZXIoKSxcbiAgICAgICAgc2VtaU1ham9yQXhpczogdGhpcy5nZXRTZW1pTWFqb3JBeGlzKCksXG4gICAgICAgIHNlbWlNaW5vckF4aXM6IHRoaXMuZ2V0U2VtaU1pbm9yQXhpcygpLFxuICAgICAgICByb3RhdGlvbjogdGhpcy5nZXRSb3RhdGlvbigpLFxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIF9cbiAgfSkoKVxuICBfLlBvbHlsaW5lUHJpbWl0aXZlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBfKHRoaXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICBvcHRpb25zID0gY29weU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdFBvbHlsaW5lT3B0aW9ucylcbiAgICAgIHRoaXMuaW5pdGlhbGlzZU9wdGlvbnMob3B0aW9ucylcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgXy5wcm90b3R5cGUgPSBuZXcgQ2hhbmdlYWJsZVByaW1pdGl2ZSgpXG4gICAgXy5wcm90b3R5cGUuc2V0UG9zaXRpb25zID0gZnVuY3Rpb24gKHBvc2l0aW9uczogYW55KSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgncG9zaXRpb25zJywgcG9zaXRpb25zKVxuICAgIH1cbiAgICBfLnByb3RvdHlwZS5zZXRXaWR0aCA9IGZ1bmN0aW9uICh3aWR0aDogYW55KSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB3aWR0aClcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuc2V0R2VvZGVzaWMgPSBmdW5jdGlvbiAoZ2VvZGVzaWM6IGFueSkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2dlb2Rlc2ljJywgZ2VvZGVzaWMpXG4gICAgfVxuICAgIF8ucHJvdG90eXBlLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgncG9zaXRpb25zJylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0V2lkdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ3dpZHRoJylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0R2VvZGVzaWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2dlb2Rlc2ljJylcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0R2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIUNlc2l1bS5kZWZpbmVkKHRoaXMucG9zaXRpb25zKSB8fCB0aGlzLnBvc2l0aW9ucy5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDZXNpdW0uUG9seWxpbmVHZW9tZXRyeSh7XG4gICAgICAgIHBvc2l0aW9uczogdGhpcy5wb3NpdGlvbnMsXG4gICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIHdpZHRoOiB0aGlzLndpZHRoIDwgMSA/IDEgOiB0aGlzLndpZHRoLFxuICAgICAgICB2ZXJ0ZXhGb3JtYXQ6IENlc2l1bS5FbGxpcHNvaWRTdXJmYWNlQXBwZWFyYW5jZS5WRVJURVhfRk9STUFULFxuICAgICAgICBlbGxpcHNvaWQ6IHRoaXMuZWxsaXBzb2lkLFxuICAgICAgfSlcbiAgICB9XG4gICAgXy5wcm90b3R5cGUuZ2V0T3V0bGluZUdlb21ldHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKFxuICAgICAgICAhQ2VzaXVtLmRlZmluZWQodGhpcy5wb3NpdGlvbnMpIHx8XG4gICAgICAgIHRoaXMucG9zaXRpb25zLmxlbmd0aCA8IDIgfHxcbiAgICAgICAgIXRoaXMuYnVmZmVyXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IHRoaXMucG9zaXRpb25zLm1hcCgocG9zOiBDZXNpdW0uQ2FydGVzaWFuMykgPT4ge1xuICAgICAgICBjb25zdCBjYXJ0b2dyYXBoaWMgPSBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21DYXJ0ZXNpYW4ocG9zKVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIENlc2l1bS5NYXRoLnRvRGVncmVlcyhjYXJ0b2dyYXBoaWMubG9uZ2l0dWRlKSxcbiAgICAgICAgICBDZXNpdW0uTWF0aC50b0RlZ3JlZXMoY2FydG9ncmFwaGljLmxhdGl0dWRlKSxcbiAgICAgICAgICBjYXJ0b2dyYXBoaWMuYWx0aXR1ZGUsXG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgICBjb25zdCB0dXJmTGluZSA9IFR1cmYubGluZVN0cmluZyhjb29yZGluYXRlcylcbiAgICAgIHV0aWxpdHkuYWRqdXN0R2VvQ29vcmRzKHR1cmZMaW5lKVxuICAgICAgY29uc3QgYnVmZmVyZWRMaW5lID0gVHVyZi5idWZmZXIodHVyZkxpbmUsIE1hdGgubWF4KHRoaXMuYnVmZmVyLCAxKSwge1xuICAgICAgICB1bml0czogJ21ldGVycycsXG4gICAgICB9KVxuICAgICAgaWYgKCFidWZmZXJlZExpbmUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBuZWVkIHRvIGFkanVzdCB0aGUgcG9pbnRzIGFnYWluIEFGVEVSIGJ1ZmZlcmluZywgc2luY2UgYnVmZmVyaW5nIHVuZG9lcyB0aGUgYW50aW1lcmlkaWFuIGFkanVzdG1lbnRzXG4gICAgICB1dGlsaXR5LmFkanVzdEdlb0Nvb3JkcyhidWZmZXJlZExpbmUpXG4gICAgICBjb25zdCBvdXRsaW5lUG9zaXRpb25zID0gYnVmZmVyZWRMaW5lLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLm1hcChcbiAgICAgICAgKGNvb3JkKSA9PiBDZXNpdW0uQ2FydGVzaWFuMy5mcm9tRGVncmVlcyhjb29yZFswXSwgY29vcmRbMV0sIGNvb3JkWzJdKVxuICAgICAgKVxuICAgICAgcmV0dXJuIG5ldyBDZXNpdW0uUG9seWxpbmVHZW9tZXRyeSh7XG4gICAgICAgIHBvc2l0aW9uczogb3V0bGluZVBvc2l0aW9ucyxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGggPCAxID8gMSA6IHRoaXMud2lkdGgsXG4gICAgICAgIHZlcnRleEZvcm1hdDogQ2VzaXVtLkVsbGlwc29pZFN1cmZhY2VBcHBlYXJhbmNlLlZFUlRFWF9GT1JNQVQsXG4gICAgICAgIGVsbGlwc29pZDogdGhpcy5lbGxpcHNvaWQsXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gX1xuICB9KSgpXG4gIC8qXG4gICAgQ3JlYXRlIG91ciBvd24gSW1hZ2Ugb2JqZWN0cyBhbmQgcGFzcyB0aGVtLCBpbnN0ZWFkIG9mIFVSTFMsIHRvIHRoZVxuICAgIEJpbGxib2FyZENvbGxlY3Rpb25zLiBUaGlzIGVuc3VyZXMgdGhlIHNoYXBlIGVkaXRpbmcgY29udHJvbHMgd2lsbCBhbHdheXNcbiAgICBiZSBkaXNwbGF5ZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHVzZXIgY2xpY2tzIHRoZSBEcmF3IGJ1dHRvbiwgYW5kIHdpdGhvdXRcbiAgICByZXF1aXJpbmcgYW55IHVzZXIgaW50ZXJhY3Rpb24gd2l0aCB0aGUgbWFwLiBJZiB3ZSB1c2VkIHVubG9hZGVkIGltYWdlc1xuICAgIChlLmcuLCBpbWFnZSBVUkxzKSwgYXMgd2UgZGlkIHByZXZpb3VzbHksIHRoZW4gc29tZXRpbWVzIHRoZSBzaGFwZSBlZGl0aW5nXG4gICAgY29udHJvbHMgd291bGQgbm90IGJlIGRpc3BsYXllZCB1bnRpbCB0aGUgdXNlciBpbnRlcmFjdGVkIHdpdGggdGhlIG1hcCxcbiAgICBsaWtlIG1vdmluZyBpdCBvciB6b29taW5nIGluIG9yIG91dC4gVGhpcyBpcyBiZWNhdXNlIHdlIGhhdmUgQ2VzaXVtJ3NcbiAgICByZXF1ZXN0UmVuZGVyTW9kZSBlbmFibGVkLiBTb21ldGltZXMsIHRoZSBpbWFnZSB3YXMgbm90IGxvYWRlZCBieSB0aGUgdGltZVxuICAgIHRoZSByZW5kZXIgcmVxdWVzdCBmb3IgdGhlIGRyYXdpbmcgcHJpbWl0aXZlIHdhcyBtYWRlLCBhbmQgYW5vdGhlciByZW5kZXJcbiAgICByZXF1ZXN0ICh0cmlnZ2VyZWQsIGZvciBleGFtcGxlLCBieSBtb3ZpbmcgdGhlIG1hcCkgaGFkIHRvIGJlIG1hZGUgZm9yXG4gICAgaXQgdG8gYmUgc2hvd24uXG4gICovXG4gIGNvbnN0IHZlcnRleEltYWdlID0gbmV3IEltYWdlKClcbiAgdmVydGV4SW1hZ2Uuc3JjID0gYGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJHt3aW5kb3cuYnRvYSh2ZXJ0ZXhTdmcpfWBcbiAgY29uc3QgZHJhZ0hhbGZJbWFnZSA9IG5ldyBJbWFnZSgpXG4gIGRyYWdIYWxmSW1hZ2Uuc3JjID0gYGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJHt3aW5kb3cuYnRvYShkcmFnSGFsZlN2Zyl9YFxuICBjb25zdCBkZWZhdWx0QmlsbGJvYXJkID0ge1xuICAgIGltYWdlOiB2ZXJ0ZXhJbWFnZSxcbiAgICBzaGlmdFg6IDAsXG4gICAgc2hpZnRZOiAwLFxuICB9XG4gIGNvbnN0IGRyYWdCaWxsYm9hcmQgPSB7XG4gICAgaW1hZ2U6IHZlcnRleEltYWdlLFxuICAgIHNoaWZ0WDogMCxcbiAgICBzaGlmdFk6IDAsXG4gIH1cbiAgY29uc3QgZHJhZ0hhbGZCaWxsYm9hcmQgPSB7XG4gICAgaW1hZ2U6IGRyYWdIYWxmSW1hZ2UsXG4gICAgc2hpZnRYOiAwLFxuICAgIHNoaWZ0WTogMCxcbiAgfVxuICBfLnByb3RvdHlwZS5jcmVhdGVCaWxsYm9hcmRHcm91cCA9IGZ1bmN0aW9uIChcbiAgICBwb2ludHM6IGFueSxcbiAgICBvcHRpb25zOiBhbnksXG4gICAgY2FsbGJhY2tzOiBhbnlcbiAgKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgY29uc3QgbWFya2VycyA9IG5ldyBfLkJpbGxib2FyZEdyb3VwKHRoaXMsIG9wdGlvbnMpXG4gICAgbWFya2Vycy5hZGRCaWxsYm9hcmRzKHBvaW50cywgY2FsbGJhY2tzKVxuICAgIHJldHVybiBtYXJrZXJzXG4gIH1cbiAgXy5CaWxsYm9hcmRHcm91cCA9IGZ1bmN0aW9uIChkcmF3SGVscGVyOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIDsodGhpcyBhcyBhbnkpLl9kcmF3SGVscGVyID0gZHJhd0hlbHBlclxuICAgIDsodGhpcyBhcyBhbnkpLl9zY2VuZSA9IGRyYXdIZWxwZXIuX3NjZW5lXG4gICAgOyh0aGlzIGFzIGFueSkuX29wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0QmlsbGJvYXJkKVxuICAgIC8vIGNyZWF0ZSBvbmUgY29tbW9uIGJpbGxib2FyZCBjb2xsZWN0aW9uIGZvciBhbGwgYmlsbGJvYXJkc1xuICAgIGNvbnN0IGIgPSBuZXcgQ2VzaXVtLkJpbGxib2FyZENvbGxlY3Rpb24oKVxuICAgIDsodGhpcyBhcyBhbnkpLl9zY2VuZS5wcmltaXRpdmVzLmFkZChiKVxuICAgIDsodGhpcyBhcyBhbnkpLl9iaWxsYm9hcmRzID0gYlxuICAgIC8vIGtlZXAgYW4gb3JkZXJlZCBsaXN0IG9mIGJpbGxib2FyZHNcbiAgICA7KHRoaXMgYXMgYW55KS5fb3JkZXJlZEJpbGxib2FyZHMgPSBbXVxuICB9XG4gIF8uQmlsbGJvYXJkR3JvdXAucHJvdG90eXBlLmNyZWF0ZUJpbGxib2FyZCA9IGZ1bmN0aW9uIChcbiAgICBwb3NpdGlvbjogYW55LFxuICAgIGNhbGxiYWNrczogYW55XG4gICkge1xuICAgIGNvbnN0IGJpbGxib2FyZCA9IHRoaXMuX2JpbGxib2FyZHMuYWRkKHtcbiAgICAgIHNob3c6IHRydWUsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIHBpeGVsT2Zmc2V0OiBuZXcgQ2VzaXVtLkNhcnRlc2lhbjIoXG4gICAgICAgIHRoaXMuX29wdGlvbnMuc2hpZnRYLFxuICAgICAgICB0aGlzLl9vcHRpb25zLnNoaWZ0WVxuICAgICAgKSxcbiAgICAgIGV5ZU9mZnNldDogbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKDAuMCwgMC4wLCAwLjApLFxuICAgICAgaG9yaXpvbnRhbE9yaWdpbjogQ2VzaXVtLkhvcml6b250YWxPcmlnaW4uQ0VOVEVSLFxuICAgICAgdmVydGljYWxPcmlnaW46IENlc2l1bS5WZXJ0aWNhbE9yaWdpbi5DRU5URVIsXG4gICAgICBzY2FsZTogMS4wLFxuICAgICAgaW1hZ2U6IHRoaXMuX29wdGlvbnMuaW1hZ2UsXG4gICAgICBjb2xvcjogbmV3IENlc2l1bS5Db2xvcigxLjAsIDEuMCwgMS4wLCAxLjApLFxuICAgIH0pXG4gICAgLy8gaWYgZWRpdGFibGVcbiAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICB2YXIgX3NlbGYgPSB0aGlzXG4gICAgICBjb25zdCBzY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIgPVxuICAgICAgICB0aGlzLl9zY2VuZS5zY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgxMjUyKSBGSVhNRTogRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBub3QgYWxsb3dlZCBpbnNpZGUgYmxvY2suLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgZnVuY3Rpb24gZW5hYmxlUm90YXRpb24oZW5hYmxlOiBhbnkpIHtcbiAgICAgICAgc2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyLmVuYWJsZVJvdGF0ZSA9IGVuYWJsZVxuICAgICAgfVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDEyNTIpIEZJWE1FOiBGdW5jdGlvbiBkZWNsYXJhdGlvbnMgYXJlIG5vdCBhbGxvd2VkIGluc2lkZSBibG9jay4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBmdW5jdGlvbiBnZXRJbmRleCgpIHtcbiAgICAgICAgLy8gZmluZCBpbmRleFxuICAgICAgICBmb3IgKFxuICAgICAgICAgIHZhciBpID0gMCwgSSA9IF9zZWxmLl9vcmRlcmVkQmlsbGJvYXJkcy5sZW5ndGg7XG4gICAgICAgICAgaSA8IEkgJiYgX3NlbGYuX29yZGVyZWRCaWxsYm9hcmRzW2ldICE9IGJpbGxib2FyZDtcbiAgICAgICAgICArK2lcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGlcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFja3MuZHJhZ0hhbmRsZXJzKSB7XG4gICAgICAgIHZhciBfc2VsZiA9IHRoaXNcbiAgICAgICAgc2V0TGlzdGVuZXIoYmlsbGJvYXJkLCAnbGVmdERvd24nLCAocG9zaXRpb246IGFueSkgPT4ge1xuICAgICAgICAgIC8vIFRPRE8gLSBzdGFydCB0aGUgZHJhZyBoYW5kbGVycyBoZXJlXG4gICAgICAgICAgLy8gY3JlYXRlIGhhbmRsZXJzIGZvciBtb3VzZU91dCBhbmQgbGVmdFVwIGZvciB0aGUgYmlsbGJvYXJkIGFuZCBhIG1vdXNlTW92ZVxuICAgICAgICAgIGZ1bmN0aW9uIG9uRHJhZyhwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICBiaWxsYm9hcmQucG9zaXRpb24gPSBwb3NpdGlvblxuICAgICAgICAgICAgLy8gZmluZCBpbmRleFxuICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgbGV0IGkgPSAwLCBJID0gX3NlbGYuX29yZGVyZWRCaWxsYm9hcmRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgaSA8IEkgJiYgX3NlbGYuX29yZGVyZWRCaWxsYm9hcmRzW2ldICE9IGJpbGxib2FyZDtcbiAgICAgICAgICAgICAgKytpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FsbGJhY2tzLmRyYWdIYW5kbGVycy5vbkRyYWcgJiZcbiAgICAgICAgICAgICAgY2FsbGJhY2tzLmRyYWdIYW5kbGVycy5vbkRyYWcoZ2V0SW5kZXgoKSwgcG9zaXRpb24pXG4gICAgICAgICAgfVxuICAgICAgICAgIGZ1bmN0aW9uIG9uRHJhZ0VuZChwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICBoYW5kbGVyLmRlc3Ryb3koKVxuICAgICAgICAgICAgZW5hYmxlUm90YXRpb24odHJ1ZSlcbiAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnSGFuZGxlcnMub25EcmFnRW5kICYmXG4gICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnSGFuZGxlcnMub25EcmFnRW5kKGdldEluZGV4KCksIHBvc2l0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgaGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoX3NlbGYuX3NjZW5lLmNhbnZhcylcbiAgICAgICAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBfc2VsZi5fc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQoXG4gICAgICAgICAgICAgIG1vdmVtZW50LmVuZFBvc2l0aW9uLFxuICAgICAgICAgICAgICBlbGxpcHNvaWRcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICAgICAgb25EcmFnKGNhcnRlc2lhbilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG9uRHJhZ0VuZChjYXJ0ZXNpYW4pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLk1PVVNFX01PVkUpXG4gICAgICAgICAgaGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgb25EcmFnRW5kKFxuICAgICAgICAgICAgICBfc2VsZi5fc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQobW92ZW1lbnQucG9zaXRpb24sIGVsbGlwc29pZClcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9VUClcbiAgICAgICAgICBlbmFibGVSb3RhdGlvbihmYWxzZSlcbiAgICAgICAgICBjYWxsYmFja3MuZHJhZ0hhbmRsZXJzLm9uRHJhZ1N0YXJ0ICYmXG4gICAgICAgICAgICBjYWxsYmFja3MuZHJhZ0hhbmRsZXJzLm9uRHJhZ1N0YXJ0KFxuICAgICAgICAgICAgICBnZXRJbmRleCgpLFxuICAgICAgICAgICAgICBfc2VsZi5fc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQocG9zaXRpb24sIGVsbGlwc29pZClcbiAgICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFja3Mub25SaWdodENsaWNrKSB7XG4gICAgICAgIHNldExpc3RlbmVyKGJpbGxib2FyZCwgJ3JpZ2h0Q2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgY2FsbGJhY2tzLm9uUmlnaHRDbGljayhnZXRJbmRleCgpKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrcy5vbkNsaWNrKSB7XG4gICAgICAgIHNldExpc3RlbmVyKGJpbGxib2FyZCwgJ2xlZnRDbGljaycsICgpID0+IHtcbiAgICAgICAgICBjYWxsYmFja3Mub25DbGljayhnZXRJbmRleCgpKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrcy50b29sdGlwKSB7XG4gICAgICAgIHNldExpc3RlbmVyKGJpbGxib2FyZCwgJ21vdXNlTW92ZScsIChwb3NpdGlvbjogYW55KSA9PiB7XG4gICAgICAgICAgX3NlbGYuX2RyYXdIZWxwZXIuX3Rvb2x0aXAuc2hvd0F0KHBvc2l0aW9uLCBjYWxsYmFja3MudG9vbHRpcCgpKVxuICAgICAgICB9KVxuICAgICAgICBzZXRMaXN0ZW5lcihiaWxsYm9hcmQsICdtb3VzZU91dCcsICgpID0+IHtcbiAgICAgICAgICBfc2VsZi5fZHJhd0hlbHBlci5fdG9vbHRpcC5zZXRWaXNpYmxlKGZhbHNlKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmlsbGJvYXJkXG4gIH1cbiAgXy5CaWxsYm9hcmRHcm91cC5wcm90b3R5cGUuaW5zZXJ0QmlsbGJvYXJkID0gZnVuY3Rpb24gKFxuICAgIGluZGV4OiBhbnksXG4gICAgcG9zaXRpb246IGFueSxcbiAgICBjYWxsYmFja3M6IGFueVxuICApIHtcbiAgICB0aGlzLl9vcmRlcmVkQmlsbGJvYXJkcy5zcGxpY2UoXG4gICAgICBpbmRleCxcbiAgICAgIDAsXG4gICAgICB0aGlzLmNyZWF0ZUJpbGxib2FyZChwb3NpdGlvbiwgY2FsbGJhY2tzKVxuICAgIClcbiAgfVxuICBfLkJpbGxib2FyZEdyb3VwLnByb3RvdHlwZS5hZGRCaWxsYm9hcmQgPSBmdW5jdGlvbiAoXG4gICAgcG9zaXRpb246IGFueSxcbiAgICBjYWxsYmFja3M6IGFueVxuICApIHtcbiAgICB0aGlzLl9vcmRlcmVkQmlsbGJvYXJkcy5wdXNoKHRoaXMuY3JlYXRlQmlsbGJvYXJkKHBvc2l0aW9uLCBjYWxsYmFja3MpKVxuICB9XG4gIF8uQmlsbGJvYXJkR3JvdXAucHJvdG90eXBlLmFkZEJpbGxib2FyZHMgPSBmdW5jdGlvbiAoXG4gICAgcG9zaXRpb25zOiBhbnksXG4gICAgY2FsbGJhY2tzOiBhbnlcbiAgKSB7XG4gICAgbGV0IGluZGV4ID0gMFxuICAgIGZvciAoOyBpbmRleCA8IHBvc2l0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHRoaXMuYWRkQmlsbGJvYXJkKHBvc2l0aW9uc1tpbmRleF0sIGNhbGxiYWNrcylcbiAgICB9XG4gIH1cbiAgXy5CaWxsYm9hcmRHcm91cC5wcm90b3R5cGUudXBkYXRlQmlsbGJvYXJkc1Bvc2l0aW9ucyA9IGZ1bmN0aW9uIChcbiAgICBwb3NpdGlvbnM6IGFueVxuICApIHtcbiAgICBsZXQgaW5kZXggPSAwXG4gICAgZm9yICg7IGluZGV4IDwgcG9zaXRpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdGhpcy5nZXRCaWxsYm9hcmQoaW5kZXgpLnBvc2l0aW9uID0gcG9zaXRpb25zW2luZGV4XVxuICAgIH1cbiAgfVxuICBfLkJpbGxib2FyZEdyb3VwLnByb3RvdHlwZS5jb3VudEJpbGxib2FyZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyZWRCaWxsYm9hcmRzLmxlbmd0aFxuICB9XG4gIF8uQmlsbGJvYXJkR3JvdXAucHJvdG90eXBlLmdldEJpbGxib2FyZCA9IGZ1bmN0aW9uIChpbmRleDogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyZWRCaWxsYm9hcmRzW2luZGV4XVxuICB9XG4gIF8uQmlsbGJvYXJkR3JvdXAucHJvdG90eXBlLnJlbW92ZUJpbGxib2FyZCA9IGZ1bmN0aW9uIChpbmRleDogYW55KSB7XG4gICAgdGhpcy5fYmlsbGJvYXJkcy5yZW1vdmUodGhpcy5nZXRCaWxsYm9hcmQoaW5kZXgpKVxuICAgIHRoaXMuX29yZGVyZWRCaWxsYm9hcmRzLnNwbGljZShpbmRleCwgMSlcbiAgfVxuICBfLkJpbGxib2FyZEdyb3VwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYmlsbGJvYXJkcyA9XG4gICAgICB0aGlzLl9iaWxsYm9hcmRzICYmXG4gICAgICB0aGlzLl9zY2VuZS5wcmltaXRpdmVzLnJlbW92ZSh0aGlzLl9iaWxsYm9hcmRzKSAmJlxuICAgICAgdGhpcy5fYmlsbGJvYXJkcy5yZW1vdmVBbGwoKSAmJlxuICAgICAgdGhpcy5fYmlsbGJvYXJkcy5kZXN0cm95KClcbiAgfVxuICBfLkJpbGxib2FyZEdyb3VwLnByb3RvdHlwZS5zZXRPblRvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9zY2VuZS5wcmltaXRpdmVzLnJhaXNlVG9Ub3AodGhpcy5fYmlsbGJvYXJkcylcbiAgfVxuICBfLnByb3RvdHlwZS5zdGFydERyYXdpbmdNYXJrZXIgPSBmdW5jdGlvbiAob3B0aW9uczogYW55KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0QmlsbGJvYXJkKVxuICAgIHRoaXMuc3RhcnREcmF3aW5nKCgpID0+IHtcbiAgICAgIG1hcmtlcnMucmVtb3ZlKClcbiAgICAgIG1vdXNlSGFuZGxlci5kZXN0cm95KClcbiAgICAgIHRvb2x0aXAuc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9KVxuICAgIGNvbnN0IF9zZWxmID0gdGhpc1xuICAgIGNvbnN0IHNjZW5lID0gdGhpcy5fc2NlbmVcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNjEzMykgRklYTUU6ICdwcmltaXRpdmVzJyBpcyBkZWNsYXJlZCBidXQgaXRzIHZhbHVlIGlzIG5ldmVyIHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICBjb25zdCBwcmltaXRpdmVzID0gc2NlbmUucHJpbWl0aXZlc1xuICAgIGNvbnN0IHRvb2x0aXAgPSB0aGlzLl90b29sdGlwXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgY29uc3QgbWFya2VycyA9IG5ldyBfLkJpbGxib2FyZEdyb3VwKHRoaXMsIG9wdGlvbnMpXG4gICAgY29uc3QgbW91c2VIYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihzY2VuZS5jYW52YXMpXG4gICAgLy8gTm93IHdhaXQgZm9yIHN0YXJ0XG4gICAgbW91c2VIYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBpZiAobW92ZW1lbnQucG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBzY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChcbiAgICAgICAgICBtb3ZlbWVudC5wb3NpdGlvbixcbiAgICAgICAgICBlbGxpcHNvaWRcbiAgICAgICAgKVxuICAgICAgICBpZiAoY2FydGVzaWFuKSB7XG4gICAgICAgICAgbWFya2Vycy5hZGRCaWxsYm9hcmQoY2FydGVzaWFuKVxuICAgICAgICAgIF9zZWxmLnN0b3BEcmF3aW5nKClcbiAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrKGNhcnRlc2lhbilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0NMSUNLKVxuICAgIG1vdXNlSGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBtb3ZlbWVudC5lbmRQb3NpdGlvblxuICAgICAgaWYgKHBvc2l0aW9uICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgY2FydGVzaWFuID0gc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQocG9zaXRpb24sIGVsbGlwc29pZClcbiAgICAgICAgaWYgKGNhcnRlc2lhbikge1xuICAgICAgICAgIHRvb2x0aXAuc2hvd0F0KFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICAnPHA+Q2xpY2sgdG8gYWRkIHlvdXIgbWFya2VyLiBQb3NpdGlvbiBpczogPC9wPicgK1xuICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjU1NCkgRklYTUU6IEV4cGVjdGVkIDIgYXJndW1lbnRzLCBidXQgZ290IDEuXG4gICAgICAgICAgICAgIGdldERpc3BsYXlMYXRMbmdTdHJpbmcoXG4gICAgICAgICAgICAgICAgZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKGNhcnRlc2lhbilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b29sdGlwLnNob3dBdChcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgJzxwPkNsaWNrIG9uIHRoZSBnbG9iZSB0byBhZGQgeW91ciBtYXJrZXIuPC9wPidcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgfVxuICBfLnByb3RvdHlwZS5zdGFydERyYXdpbmdQb2x5Z29uID0gZnVuY3Rpb24gKG9wdGlvbnM6IGFueSkge1xuICAgIHZhciBvcHRpb25zID0gY29weU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdFN1cmZhY2VPcHRpb25zKVxuICAgIHRoaXMuc3RhcnREcmF3aW5nUG9seXNoYXBlKHRydWUsIG9wdGlvbnMpXG4gIH1cbiAgXy5wcm90b3R5cGUuc3RhcnREcmF3aW5nUG9seWxpbmUgPSBmdW5jdGlvbiAob3B0aW9uczogYW55KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0UG9seWxpbmVPcHRpb25zKVxuICAgIHRoaXMuc3RhcnREcmF3aW5nUG9seXNoYXBlKGZhbHNlLCBvcHRpb25zKVxuICB9XG4gIF8ucHJvdG90eXBlLnN0YXJ0RHJhd2luZ1BvbHlzaGFwZSA9IGZ1bmN0aW9uIChpc1BvbHlnb246IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5zdGFydERyYXdpbmcoKCkgPT4ge1xuICAgICAgcHJpbWl0aXZlcy5yZW1vdmUocG9seSlcbiAgICAgIG1hcmtlcnMucmVtb3ZlKClcbiAgICAgIG1vdXNlSGFuZGxlci5kZXN0cm95KClcbiAgICAgIHRvb2x0aXAuc2V0VmlzaWJsZShmYWxzZSlcbiAgICB9KVxuICAgIGNvbnN0IF9zZWxmID0gdGhpc1xuICAgIGNvbnN0IHNjZW5lID0gdGhpcy5fc2NlbmVcbiAgICBjb25zdCBwcmltaXRpdmVzID0gc2NlbmUucHJpbWl0aXZlc1xuICAgIGNvbnN0IHRvb2x0aXAgPSB0aGlzLl90b29sdGlwXG4gICAgY29uc3QgbWluUG9pbnRzID0gaXNQb2x5Z29uID8gMyA6IDJcbiAgICBsZXQgcG9seTogYW55XG4gICAgaWYgKGlzUG9seWdvbikge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgICAgcG9seSA9IG5ldyBEcmF3SGVscGVyLlBvbHlnb25QcmltaXRpdmUob3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICBwb2x5ID0gbmV3IERyYXdIZWxwZXIuUG9seWxpbmVQcmltaXRpdmUob3B0aW9ucylcbiAgICB9XG4gICAgcG9seS5hc3luY2hyb25vdXMgPSBmYWxzZVxuICAgIHByaW1pdGl2ZXMuYWRkKHBvbHkpXG4gICAgY29uc3QgcG9zaXRpb25zOiBhbnkgPSBbXVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgIGNvbnN0IG1hcmtlcnMgPSBuZXcgXy5CaWxsYm9hcmRHcm91cCh0aGlzLCBkZWZhdWx0QmlsbGJvYXJkKVxuICAgIGNvbnN0IG1vdXNlSGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoc2NlbmUuY2FudmFzKVxuICAgIC8vIE5vdyB3YWl0IGZvciBzdGFydFxuICAgIG1vdXNlSGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgaWYgKG1vdmVtZW50LnBvc2l0aW9uICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgY2FydGVzaWFuID0gc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQoXG4gICAgICAgICAgbW92ZW1lbnQucG9zaXRpb24sXG4gICAgICAgICAgZWxsaXBzb2lkXG4gICAgICAgIClcbiAgICAgICAgaWYgKGNhcnRlc2lhbikge1xuICAgICAgICAgIC8vIGZpcnN0IGNsaWNrXG4gICAgICAgICAgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgLy8gSWYgdXNlciBjbGlja3MsIHRoZXkgaGF2ZSBzdGFydGVkIGRyYXdpbmcsIHNvIGRpc2FibGUgZWRpdGluZ1xuICAgICAgICAgICAgX3NlbGYuZGlzYWJsZUFsbEVkaXRNb2RlKClcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKGNhcnRlc2lhbi5jbG9uZSgpKVxuICAgICAgICAgICAgbWFya2Vycy5hZGRCaWxsYm9hcmQocG9zaXRpb25zWzBdKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocG9zaXRpb25zLmxlbmd0aCA+PSBtaW5Qb2ludHMpIHtcbiAgICAgICAgICAgIHBvbHkucG9zaXRpb25zID0gcG9zaXRpb25zXG4gICAgICAgICAgICBwb2x5Ll9jcmVhdGVQcmltaXRpdmUgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGFkZCBuZXcgcG9pbnQgdG8gcG9seWdvblxuICAgICAgICAgIC8vIHRoaXMgb25lIHdpbGwgbW92ZSB3aXRoIHRoZSBtb3VzZVxuICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKGNhcnRlc2lhbilcbiAgICAgICAgICAvLyBhZGQgbWFya2VyIGF0IHRoZSBuZXcgcG9zaXRpb25cbiAgICAgICAgICBtYXJrZXJzLmFkZEJpbGxib2FyZChjYXJ0ZXNpYW4pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9DTElDSylcbiAgICBtb3VzZUhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW92ZW1lbnQuZW5kUG9zaXRpb25cbiAgICAgIGlmIChwb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICBjb25zdCBmZWF0dXJlID0gc2NlbmUucGljayhwb3NpdGlvbilcbiAgICAgICAgICBjb25zdCBpc0JpbGxib2FyZCA9XG4gICAgICAgICAgICBmZWF0dXJlPy5wcmltaXRpdmUgJiYgZmVhdHVyZS5wcmltaXRpdmUgaW5zdGFuY2VvZiBDZXNpdW0uQmlsbGJvYXJkXG4gICAgICAgICAgLy8gU2hvdyB0aGlzIHRvb2x0aXAgb25seSBpZiB0aGUgbW91c2UgaXNuJ3Qgb3ZlciBhIGJpbGxib2FyZC4gVGhlIGJpbGxib2FyZHMgc2hvd24gZm9yXG4gICAgICAgICAgLy8gZWRpdGluZyBoYXZlIHRoZWlyIG93biB0b29sdGlwcyBhbmQgd2Ugd2FudCB0byBzaG93IHRob3NlIGluc3RlYWQuXG4gICAgICAgICAgaWYgKCFpc0JpbGxib2FyZCkge1xuICAgICAgICAgICAgdG9vbHRpcC5zaG93QXQocG9zaXRpb24sICdDbGljayB0byBhZGQgZmlyc3QgcG9pbnQnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBzY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChwb3NpdGlvbiwgZWxsaXBzb2lkKVxuICAgICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wb3AoKVxuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIGl0IGlzIHNsaWdodGx5IGRpZmZlcmVudFxuICAgICAgICAgICAgY2FydGVzaWFuLnkgKz0gMSArIE1hdGgucmFuZG9tKClcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKGNhcnRlc2lhbilcbiAgICAgICAgICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoID49IG1pblBvaW50cykge1xuICAgICAgICAgICAgICBwb2x5LnBvc2l0aW9ucyA9IHBvc2l0aW9uc1xuICAgICAgICAgICAgICBwb2x5Ll9jcmVhdGVQcmltaXRpdmUgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgbWFya2VyXG4gICAgICAgICAgICBtYXJrZXJzLmdldEJpbGxib2FyZChwb3NpdGlvbnMubGVuZ3RoIC0gMSkucG9zaXRpb24gPSBjYXJ0ZXNpYW5cbiAgICAgICAgICAgIC8vIHNob3cgdG9vbHRpcFxuICAgICAgICAgICAgdG9vbHRpcC5zaG93QXQoXG4gICAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgICBgQ2xpY2sgdG8gYWRkIG5ldyBwb2ludCAoJHtwb3NpdGlvbnMubGVuZ3RofSlcbiAgICAgICAgICAgICAgICR7XG4gICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5sZW5ndGggPj0gbWluUG9pbnRzXG4gICAgICAgICAgICAgICAgICAgPyAnPGJyPkRvdWJsZSBjbGljayB0byBmaW5pc2ggZHJhd2luZydcbiAgICAgICAgICAgICAgICAgICA6ICcnXG4gICAgICAgICAgICAgICB9YFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaWYgKGlzUG9seWdvbiAmJiBwb3NpdGlvbnMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgIC8vIFJlcXVlc3QgYSByZW5kZXIgc28gdGhlIGZpcnN0IHBvbHlnb24gcG9pbnQgd2lsbCBiZSBkaXNwbGF5ZWQgYmVmb3JlIHRoZSB1c2VyXG4gICAgICAgICAgICAgIC8vIGhhcyBjbGlja2VkIHRoZSBzZWNvbmQgcG9pbnQuIEFmdGVyIHRoZSB1c2VyIGhhcyBjbGlja2VkIHRvIGNyZWF0ZSBhIHBvaW50LFxuICAgICAgICAgICAgICAvLyB0aGUgbGVuZ3RoIG9mIHBvc2l0aW9ucyB3aWxsIGJlICgjIG9mIHBvaW50cykgKyAxLCBiZWNhdXNlIHRoZSBsYXN0IHBvaW50IGlzXG4gICAgICAgICAgICAgIC8vIHdoZXJldmVyIHRoZSBtb3VzZSBpcy4gUmVuZGVycyB3aWxsIGFsd2F5cyBoYXBwZW4gb24gbW91c2UgbW92ZW1lbnQgd2hlblxuICAgICAgICAgICAgICAvLyBwb3NpdGlvbnMubGVuZ3RoIGlzIGdyZWF0ZXIgdGhhbiAyLCBkdWUgdG8gX2NyZWF0ZVByaW1pdGl2ZSBiZWluZyBlbmFibGVkIGFib3ZlLlxuICAgICAgICAgICAgICBzY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgICBtb3VzZUhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW92ZW1lbnQucG9zaXRpb25cbiAgICAgIGlmIChwb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoIDwgbWluUG9pbnRzICsgMikge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IHNjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKHBvc2l0aW9uLCBlbGxpcHNvaWQpXG4gICAgICAgICAgaWYgKGNhcnRlc2lhbikge1xuICAgICAgICAgICAgX3NlbGYuc3RvcERyYXdpbmcoKVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgLy9odHRwczovL2dpdGh1Yi5jb20vbGVmb3J0aG9tYXMvY2VzaXVtLWRyYXdoZWxwZXIvaXNzdWVzLzEzXG4gICAgICAgICAgICAgIC8vbmVlZCB0byByZW1vdmUgbGFzdCAyIHBvc2l0aW9ucyBzaW5jZSB0aG9zZSBhcmUgZnJvbSBmaW5pc2hpbmcgdGhlIGRyYXdpbmdcbiAgICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayhwb3NpdGlvbnMuc2xpY2UoMCwgcG9zaXRpb25zLmxlbmd0aCAtIDIpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0RPVUJMRV9DTElDSylcbiAgfVxuICBmdW5jdGlvbiBnZXRFeHRlbnRDb3JuZXJzKHZhbHVlOiBhbnkpIHtcbiAgICByZXR1cm4gZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY0FycmF5VG9DYXJ0ZXNpYW5BcnJheShbXG4gICAgICBDZXNpdW0uUmVjdGFuZ2xlLm5vcnRod2VzdCh2YWx1ZSksXG4gICAgICBDZXNpdW0uUmVjdGFuZ2xlLm5vcnRoZWFzdCh2YWx1ZSksXG4gICAgICBDZXNpdW0uUmVjdGFuZ2xlLnNvdXRoZWFzdCh2YWx1ZSksXG4gICAgICBDZXNpdW0uUmVjdGFuZ2xlLnNvdXRod2VzdCh2YWx1ZSksXG4gICAgXSlcbiAgfVxuICBfLnByb3RvdHlwZS5zdGFydERyYXdpbmdFeHRlbnQgPSBmdW5jdGlvbiAob3B0aW9uczogYW55KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0U3VyZmFjZU9wdGlvbnMpXG4gICAgdGhpcy5zdGFydERyYXdpbmcoKCkgPT4ge1xuICAgICAgaWYgKGV4dGVudCAhPSBudWxsKSB7XG4gICAgICAgIHByaW1pdGl2ZXMucmVtb3ZlKGV4dGVudClcbiAgICAgIH1cbiAgICAgIG1hcmtlcnM/LnJlbW92ZSgpXG4gICAgICBtb3VzZUhhbmRsZXIuZGVzdHJveSgpXG4gICAgICB0b29sdGlwLnNldFZpc2libGUoZmFsc2UpXG4gICAgfSlcbiAgICBjb25zdCBfc2VsZiA9IHRoaXNcbiAgICBjb25zdCBzY2VuZSA9IHRoaXMuX3NjZW5lXG4gICAgY29uc3QgcHJpbWl0aXZlcyA9IHRoaXMuX3NjZW5lLnByaW1pdGl2ZXNcbiAgICBjb25zdCB0b29sdGlwID0gdGhpcy5fdG9vbHRpcFxuICAgIGxldCBmaXJzdFBvaW50OiBhbnkgPSBudWxsXG4gICAgbGV0IGV4dGVudDogYW55ID0gbnVsbFxuICAgIGxldCBtYXJrZXJzOiBhbnkgPSBudWxsXG4gICAgY29uc3QgbW91c2VIYW5kbGVyID0gbmV3IENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50SGFuZGxlcihzY2VuZS5jYW52YXMpXG4gICAgZnVuY3Rpb24gdXBkYXRlRXh0ZW50KHZhbHVlOiBhbnkpIHtcbiAgICAgIGlmIChleHRlbnQgPT0gbnVsbCkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjU1NCkgRklYTUU6IEV4cGVjdGVkIDIgYXJndW1lbnRzLCBidXQgZ290IDEuXG4gICAgICAgIGV4dGVudCA9IG5ldyBEcmF3SGVscGVyLkV4dGVudFByaW1pdGl2ZSh7IC4uLm9wdGlvbnMsIGV4dGVudDogdmFsdWUgfSlcbiAgICAgICAgZXh0ZW50LmFzeW5jaHJvbm91cyA9IGZhbHNlXG4gICAgICAgIHByaW1pdGl2ZXMuYWRkKGV4dGVudClcbiAgICAgIH1cbiAgICAgIGV4dGVudC5leHRlbnQgPSB2YWx1ZVxuICAgICAgLy8gdXBkYXRlIHRoZSBtYXJrZXJzXG4gICAgICBjb25zdCBjb3JuZXJzID0gZ2V0RXh0ZW50Q29ybmVycyh2YWx1ZSlcbiAgICAgIC8vIGNyZWF0ZSBpZiB0aGV5IGRvIG5vdCB5ZXQgZXhpc3RcbiAgICAgIGlmIChtYXJrZXJzID09IG51bGwpIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIG1hcmtlcnMgPSBuZXcgXy5CaWxsYm9hcmRHcm91cChfc2VsZiwgZGVmYXVsdEJpbGxib2FyZClcbiAgICAgICAgbWFya2Vycy5hZGRCaWxsYm9hcmRzKGNvcm5lcnMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXJrZXJzLnVwZGF0ZUJpbGxib2FyZHNQb3NpdGlvbnMoY29ybmVycylcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTm93IHdhaXQgZm9yIHN0YXJ0XG4gICAgbW91c2VIYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBpZiAobW92ZW1lbnQucG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBzY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChcbiAgICAgICAgICBtb3ZlbWVudC5wb3NpdGlvbixcbiAgICAgICAgICBlbGxpcHNvaWRcbiAgICAgICAgKVxuICAgICAgICBpZiAoY2FydGVzaWFuKSB7XG4gICAgICAgICAgaWYgKGV4dGVudCA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBJZiB1c2VyIGNsaWNrcywgdGhleSBoYXZlIHN0YXJ0ZWQgZHJhd2luZywgc28gZGlzYWJsZSBlZGl0aW5nXG4gICAgICAgICAgICBfc2VsZi5kaXNhYmxlQWxsRWRpdE1vZGUoKVxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSByZWN0YW5nbGVcbiAgICAgICAgICAgIGZpcnN0UG9pbnQgPSBlbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoY2FydGVzaWFuKVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRFeHRlbnQoZmlyc3RQb2ludCwgZmlyc3RQb2ludClcbiAgICAgICAgICAgIHVwZGF0ZUV4dGVudCh2YWx1ZSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3NlbGYuc3RvcERyYXdpbmcoKVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICBnZXRFeHRlbnQoXG4gICAgICAgICAgICAgICAgICBmaXJzdFBvaW50LFxuICAgICAgICAgICAgICAgICAgZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKGNhcnRlc2lhbilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTEVGVF9DTElDSylcbiAgICBtb3VzZUhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW92ZW1lbnQuZW5kUG9zaXRpb25cbiAgICAgIGlmIChwb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIGlmIChleHRlbnQgPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IGZlYXR1cmUgPSBzY2VuZS5waWNrKHBvc2l0aW9uKVxuICAgICAgICAgIGNvbnN0IGlzQmlsbGJvYXJkID1cbiAgICAgICAgICAgIGZlYXR1cmU/LnByaW1pdGl2ZSAmJiBmZWF0dXJlLnByaW1pdGl2ZSBpbnN0YW5jZW9mIENlc2l1bS5CaWxsYm9hcmRcbiAgICAgICAgICAvLyBTaG93IHRoaXMgdG9vbHRpcCBvbmx5IGlmIHRoZSBtb3VzZSBpc24ndCBvdmVyIGEgYmlsbGJvYXJkLiBUaGUgYmlsbGJvYXJkcyBzaG93biBmb3JcbiAgICAgICAgICAvLyBlZGl0aW5nIGhhdmUgdGhlaXIgb3duIHRvb2x0aXBzIGFuZCB3ZSB3YW50IHRvIHNob3cgdGhvc2UgaW5zdGVhZC5cbiAgICAgICAgICBpZiAoIWlzQmlsbGJvYXJkKSB7XG4gICAgICAgICAgICB0b29sdGlwLnNob3dBdChwb3NpdGlvbiwgJ0NsaWNrIHRvIHN0YXJ0IGRyYXdpbmcgcmVjdGFuZ2xlJylcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgY2FydGVzaWFuID0gc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQocG9zaXRpb24sIGVsbGlwc29pZClcbiAgICAgICAgICBpZiAoY2FydGVzaWFuKSB7XG4gICAgICAgICAgICBleHRlbnQuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZ2V0RXh0ZW50KFxuICAgICAgICAgICAgICBmaXJzdFBvaW50LFxuICAgICAgICAgICAgICBlbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoY2FydGVzaWFuKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgdXBkYXRlRXh0ZW50KHZhbHVlKVxuICAgICAgICAgICAgdG9vbHRpcC5zaG93QXQoXG4gICAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgICAnRHJhZyB0byBjaGFuZ2UgcmVjdGFuZ2xlIGV4dGVudDxicj5DbGljayBhZ2FpbiB0byBmaW5pc2ggZHJhd2luZydcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudFR5cGUuTU9VU0VfTU9WRSlcbiAgfVxuICBfLnByb3RvdHlwZS5zdGFydERyYXdpbmdDaXJjbGUgPSBmdW5jdGlvbiAob3B0aW9uczogYW55KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0U3VyZmFjZU9wdGlvbnMpXG4gICAgdGhpcy5zdGFydERyYXdpbmcoZnVuY3Rpb24gY2xlYW5VcCgpIHtcbiAgICAgIGlmIChjaXJjbGUgIT0gbnVsbCkge1xuICAgICAgICBwcmltaXRpdmVzLnJlbW92ZShjaXJjbGUpXG4gICAgICB9XG4gICAgICBtYXJrZXJzPy5yZW1vdmUoKVxuICAgICAgbW91c2VIYW5kbGVyLmRlc3Ryb3koKVxuICAgICAgdG9vbHRpcC5zZXRWaXNpYmxlKGZhbHNlKVxuICAgIH0pXG4gICAgY29uc3QgX3NlbGYgPSB0aGlzXG4gICAgY29uc3Qgc2NlbmUgPSB0aGlzLl9zY2VuZVxuICAgIGNvbnN0IHByaW1pdGl2ZXMgPSB0aGlzLl9zY2VuZS5wcmltaXRpdmVzXG4gICAgY29uc3QgdG9vbHRpcCA9IHRoaXMuX3Rvb2x0aXBcbiAgICBsZXQgY2lyY2xlOiBhbnkgPSBudWxsXG4gICAgbGV0IG1hcmtlcnM6IGFueSA9IG51bGxcbiAgICBjb25zdCBtb3VzZUhhbmRsZXIgPSBuZXcgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRIYW5kbGVyKHNjZW5lLmNhbnZhcylcbiAgICAvLyBOb3cgd2FpdCBmb3Igc3RhcnRcbiAgICBtb3VzZUhhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgIGlmIChtb3ZlbWVudC5wb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IHNjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgIG1vdmVtZW50LnBvc2l0aW9uLFxuICAgICAgICAgIGVsbGlwc29pZFxuICAgICAgICApXG4gICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICBpZiAoY2lyY2xlID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIElmIHVzZXIgY2xpY2tzLCB0aGV5IGhhdmUgc3RhcnRlZCBkcmF3aW5nLCBzbyBkaXNhYmxlIGVkaXRpbmdcbiAgICAgICAgICAgIF9zZWxmLmRpc2FibGVBbGxFZGl0TW9kZSgpXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGNpcmNsZVxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgICAgICAgICAgY2lyY2xlID0gbmV3IF8uQ2lyY2xlUHJpbWl0aXZlKHtcbiAgICAgICAgICAgICAgY2VudGVyOiBjYXJ0ZXNpYW4sXG4gICAgICAgICAgICAgIHJhZGl1czogMCxcbiAgICAgICAgICAgICAgYXN5bmNocm9ub3VzOiBmYWxzZSxcbiAgICAgICAgICAgICAgbWF0ZXJpYWw6IG9wdGlvbnMubWF0ZXJpYWwsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcHJpbWl0aXZlcy5hZGQoY2lyY2xlKVxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICBtYXJrZXJzID0gbmV3IF8uQmlsbGJvYXJkR3JvdXAoX3NlbGYsIGRlZmF1bHRCaWxsYm9hcmQpXG4gICAgICAgICAgICBtYXJrZXJzLmFkZEJpbGxib2FyZHMoW2NhcnRlc2lhbl0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2soY2lyY2xlLmdldENlbnRlcigpLCBjaXJjbGUuZ2V0UmFkaXVzKCkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfc2VsZi5zdG9wRHJhd2luZygpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLkxFRlRfQ0xJQ0spXG4gICAgbW91c2VIYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IG1vdmVtZW50LmVuZFBvc2l0aW9uXG4gICAgICBpZiAocG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2lyY2xlID09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCBmZWF0dXJlID0gc2NlbmUucGljayhwb3NpdGlvbilcbiAgICAgICAgICBjb25zdCBpc0JpbGxib2FyZCA9XG4gICAgICAgICAgICBmZWF0dXJlPy5wcmltaXRpdmUgJiYgZmVhdHVyZS5wcmltaXRpdmUgaW5zdGFuY2VvZiBDZXNpdW0uQmlsbGJvYXJkXG4gICAgICAgICAgLy8gU2hvdyB0aGlzIHRvb2x0aXAgb25seSBpZiB0aGUgbW91c2UgaXNuJ3Qgb3ZlciBhIGJpbGxib2FyZC4gVGhlIGJpbGxib2FyZHMgc2hvd24gZm9yXG4gICAgICAgICAgLy8gZWRpdGluZyBoYXZlIHRoZWlyIG93biB0b29sdGlwcyBhbmQgd2Ugd2FudCB0byBzaG93IHRob3NlIGluc3RlYWQuXG4gICAgICAgICAgaWYgKCFpc0JpbGxib2FyZCkge1xuICAgICAgICAgICAgdG9vbHRpcC5zaG93QXQocG9zaXRpb24sICdDbGljayB0byBzdGFydCBkcmF3aW5nIHRoZSBjaXJjbGUnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjYXJ0ZXNpYW4gPSBzY2VuZS5jYW1lcmEucGlja0VsbGlwc29pZChwb3NpdGlvbiwgZWxsaXBzb2lkKVxuICAgICAgICAgIGlmIChjYXJ0ZXNpYW4pIHtcbiAgICAgICAgICAgIGNpcmNsZS5zZXRSYWRpdXMoXG4gICAgICAgICAgICAgIENlc2l1bS5DYXJ0ZXNpYW4zLmRpc3RhbmNlKGNpcmNsZS5nZXRDZW50ZXIoKSwgY2FydGVzaWFuKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgbWFya2Vycy51cGRhdGVCaWxsYm9hcmRzUG9zaXRpb25zKGNhcnRlc2lhbilcbiAgICAgICAgICAgIHRvb2x0aXAuc2hvd0F0KFxuICAgICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgICAgJ01vdmUgbW91c2UgdG8gY2hhbmdlIGNpcmNsZSByYWRpdXM8YnI+Q2xpY2sgYWdhaW4gdG8gZmluaXNoIGRyYXdpbmcnXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgQ2VzaXVtLlNjcmVlblNwYWNlRXZlbnRUeXBlLk1PVVNFX01PVkUpXG4gIH1cbiAgXy5wcm90b3R5cGUuZW5oYW5jZVByaW1pdGl2ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZHJhd0hlbHBlciA9IHRoaXNcbiAgICBDZXNpdW0uQmlsbGJvYXJkLnByb3RvdHlwZS5zZXRFZGl0YWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9lZGl0YWJsZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuX2VkaXRhYmxlID0gdHJ1ZVxuICAgICAgY29uc3QgYmlsbGJvYXJkID0gdGhpc1xuICAgICAgY29uc3QgX3NlbGYgPSB0aGlzXG4gICAgICBmdW5jdGlvbiBlbmFibGVSb3RhdGlvbihlbmFibGU6IGFueSkge1xuICAgICAgICBkcmF3SGVscGVyLl9zY2VuZS5zY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIuZW5hYmxlUm90YXRlID0gZW5hYmxlXG4gICAgICB9XG4gICAgICBzZXRMaXN0ZW5lcihiaWxsYm9hcmQsICdsZWZ0RG93bicsICgpID0+IHtcbiAgICAgICAgLy8gVE9ETyAtIHN0YXJ0IHRoZSBkcmFnIGhhbmRsZXJzIGhlcmVcbiAgICAgICAgLy8gY3JlYXRlIGhhbmRsZXJzIGZvciBtb3VzZU91dCBhbmQgbGVmdFVwIGZvciB0aGUgYmlsbGJvYXJkIGFuZCBhIG1vdXNlTW92ZVxuICAgICAgICBmdW5jdGlvbiBvbkRyYWcocG9zaXRpb246IGFueSkge1xuICAgICAgICAgIGJpbGxib2FyZC5wb3NpdGlvbiA9IHBvc2l0aW9uXG4gICAgICAgICAgX3NlbGYuZXhlY3V0ZUxpc3RlbmVycyh7IG5hbWU6ICdkcmFnJywgcG9zaXRpb25zOiBwb3NpdGlvbiB9KVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG9uRHJhZ0VuZChwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgaGFuZGxlci5kZXN0cm95KClcbiAgICAgICAgICBlbmFibGVSb3RhdGlvbih0cnVlKVxuICAgICAgICAgIF9zZWxmLmV4ZWN1dGVMaXN0ZW5lcnMoeyBuYW1lOiAnZHJhZ0VuZCcsIHBvc2l0aW9uczogcG9zaXRpb24gfSlcbiAgICAgICAgfVxuICAgICAgICB2YXIgaGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoXG4gICAgICAgICAgZHJhd0hlbHBlci5fc2NlbmUuY2FudmFzXG4gICAgICAgIClcbiAgICAgICAgaGFuZGxlci5zZXRJbnB1dEFjdGlvbigobW92ZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNhcnRlc2lhbiA9IGRyYXdIZWxwZXIuX3NjZW5lLmNhbWVyYS5waWNrRWxsaXBzb2lkKFxuICAgICAgICAgICAgbW92ZW1lbnQuZW5kUG9zaXRpb24sXG4gICAgICAgICAgICBlbGxpcHNvaWRcbiAgICAgICAgICApXG4gICAgICAgICAgaWYgKGNhcnRlc2lhbikge1xuICAgICAgICAgICAgb25EcmFnKGNhcnRlc2lhbilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25EcmFnRW5kKGNhcnRlc2lhbilcbiAgICAgICAgICB9XG4gICAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5NT1VTRV9NT1ZFKVxuICAgICAgICBoYW5kbGVyLnNldElucHV0QWN0aW9uKChtb3ZlbWVudDogYW55KSA9PiB7XG4gICAgICAgICAgb25EcmFnRW5kKFxuICAgICAgICAgICAgZHJhd0hlbHBlci5fc2NlbmUuY2FtZXJhLnBpY2tFbGxpcHNvaWQobW92ZW1lbnQucG9zaXRpb24sIGVsbGlwc29pZClcbiAgICAgICAgICApXG4gICAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX1VQKVxuICAgICAgICBlbmFibGVSb3RhdGlvbihmYWxzZSlcbiAgICAgIH0pXG4gICAgICBlbmhhbmNlV2l0aExpc3RlbmVycyhiaWxsYm9hcmQpXG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldEhpZ2hsaWdodGVkKHRoaXM6IGFueSwgaGlnaGxpZ2h0ZWQ6IGFueSkge1xuICAgICAgLy8gaWYgbm8gY2hhbmdlXG4gICAgICAvLyBpZiBhbHJlYWR5IGhpZ2hsaWdodGVkLCB0aGUgb3V0bGluZSBwb2x5Z29uIHdpbGwgYmUgYXZhaWxhYmxlXG4gICAgICBpZiAodGhpcy5faGlnaGxpZ2h0ZWQgJiYgdGhpcy5faGlnaGxpZ2h0ZWQgPT0gaGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBkaXNhYmxlIGlmIGFscmVhZHkgaW4gZWRpdCBtb2RlXG4gICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLl9oaWdobGlnaHRlZCA9IGhpZ2hsaWdodGVkXG4gICAgICAvLyBoaWdobGlnaHQgYnkgY3JlYXRpbmcgYW4gb3V0bGluZSBwb2x5Z29uIG1hdGNoaW5nIHRoZSBwb2x5Z29uIHBvaW50c1xuICAgICAgaWYgKGhpZ2hsaWdodGVkKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSBhbGwgb3RoZXIgc2hhcGVzIGFyZSBub3QgaGlnaGxpZ2h0ZWRcbiAgICAgICAgZHJhd0hlbHBlci5zZXRIaWdobGlnaHRlZCh0aGlzKVxuICAgICAgICB0aGlzLl9zdHJva2VDb2xvciA9IHRoaXMuc3Ryb2tlQ29sb3JcbiAgICAgICAgdGhpcy5zZXRTdHJva2VTdHlsZShcbiAgICAgICAgICBDZXNpdW0uQ29sb3IuZnJvbUNzc0NvbG9yU3RyaW5nKCd3aGl0ZScpLFxuICAgICAgICAgIHRoaXMuc3Ryb2tlV2lkdGhcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuX3N0cm9rZUNvbG9yKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdHJva2VTdHlsZSh0aGlzLl9zdHJva2VDb2xvciwgdGhpcy5zdHJva2VXaWR0aClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldFN0cm9rZVN0eWxlKHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldEVkaXRNb2RlKHRoaXM6IGFueSwgZWRpdE1vZGU6IGFueSkge1xuICAgICAgLy8gaWYgbm8gY2hhbmdlXG4gICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT0gZWRpdE1vZGUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBtYWtlIHN1cmUgYWxsIG90aGVyIHNoYXBlcyBhcmUgbm90IGluIGVkaXQgbW9kZSBiZWZvcmUgc3RhcnRpbmcgdGhlIGVkaXRpbmcgb2YgdGhpcyBzaGFwZVxuICAgICAgZHJhd0hlbHBlci5kaXNhYmxlQWxsSGlnaGxpZ2h0cygpXG4gICAgICAvLyBkaXNwbGF5IG1hcmtlcnNcbiAgICAgIGlmIChlZGl0TW9kZSkge1xuICAgICAgICBkcmF3SGVscGVyLnNldEVkaXRlZCh0aGlzKVxuICAgICAgICBjb25zdCBfc2VsZiA9IHRoaXNcbiAgICAgICAgLy8gY3JlYXRlIHRoZSBtYXJrZXJzIGFuZCBoYW5kbGVycyBmb3IgdGhlIGVkaXRpbmdcbiAgICAgICAgaWYgKHRoaXMuX21hcmtlcnMgPT0gbnVsbCkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIGNvbnN0IG1hcmtlcnMgPSBuZXcgXy5CaWxsYm9hcmRHcm91cChkcmF3SGVscGVyLCBkcmFnQmlsbGJvYXJkKVxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIGNvbnN0IGVkaXRNYXJrZXJzID0gbmV3IF8uQmlsbGJvYXJkR3JvdXAoXG4gICAgICAgICAgICBkcmF3SGVscGVyLFxuICAgICAgICAgICAgZHJhZ0hhbGZCaWxsYm9hcmRcbiAgICAgICAgICApXG4gICAgICAgICAgLy8gZnVuY3Rpb24gZm9yIHVwZGF0aW5nIHRoZSBlZGl0IG1hcmtlcnMgYXJvdW5kIGEgY2VydGFpbiBwb2ludFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgxMjUyKSBGSVhNRTogRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBub3QgYWxsb3dlZCBpbnNpZGUgYmxvY2suLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUhhbGZNYXJrZXJzKGluZGV4OiBhbnksIHBvc2l0aW9uczogYW55KSB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGhhbGYgbWFya2VycyBiZWZvcmUgYW5kIGFmdGVyIHRoZSBpbmRleFxuICAgICAgICAgICAgbGV0IGVkaXRJbmRleCA9IGluZGV4IC0gMSA8IDAgPyBwb3NpdGlvbnMubGVuZ3RoIC0gMSA6IGluZGV4IC0gMVxuICAgICAgICAgICAgaWYgKGVkaXRJbmRleCA8IGVkaXRNYXJrZXJzLmNvdW50QmlsbGJvYXJkcygpKSB7XG4gICAgICAgICAgICAgIGVkaXRNYXJrZXJzLmdldEJpbGxib2FyZChlZGl0SW5kZXgpLnBvc2l0aW9uID1cbiAgICAgICAgICAgICAgICBjYWxjdWxhdGVIYWxmTWFya2VyUG9zaXRpb24oZWRpdEluZGV4KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWRpdEluZGV4ID0gaW5kZXhcbiAgICAgICAgICAgIGlmIChlZGl0SW5kZXggPCBlZGl0TWFya2Vycy5jb3VudEJpbGxib2FyZHMoKSkge1xuICAgICAgICAgICAgICBlZGl0TWFya2Vycy5nZXRCaWxsYm9hcmQoZWRpdEluZGV4KS5wb3NpdGlvbiA9XG4gICAgICAgICAgICAgICAgY2FsY3VsYXRlSGFsZk1hcmtlclBvc2l0aW9uKGVkaXRJbmRleClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDEyNTIpIEZJWE1FOiBGdW5jdGlvbiBkZWNsYXJhdGlvbnMgYXJlIG5vdCBhbGxvd2VkIGluc2lkZSBibG9jay4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgZnVuY3Rpb24gb25FZGl0ZWQoKSB7XG4gICAgICAgICAgICBfc2VsZi5leGVjdXRlTGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgbmFtZTogJ29uRWRpdGVkJyxcbiAgICAgICAgICAgICAgcG9zaXRpb25zOiBfc2VsZi5wb3NpdGlvbnMsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBoYW5kbGVNYXJrZXJDaGFuZ2VzID0ge1xuICAgICAgICAgICAgZHJhZ0hhbmRsZXJzOiB7XG4gICAgICAgICAgICAgIG9uRHJhZyhpbmRleDogYW55LCBwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICAgICAgX3NlbGYucG9zaXRpb25zW2luZGV4XSA9IHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgdXBkYXRlSGFsZk1hcmtlcnMoaW5kZXgsIF9zZWxmLnBvc2l0aW9ucylcbiAgICAgICAgICAgICAgICBfc2VsZi5fY3JlYXRlUHJpbWl0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBvbkRyYWdFbmQoKSB7XG4gICAgICAgICAgICAgICAgX3NlbGYuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgICBvbkVkaXRlZCgpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SaWdodENsaWNrKGluZGV4OiBhbnkpIHtcbiAgICAgICAgICAgICAgLy8gTmVlZCB0byBjb3VudCB1bmlxdWUgcG9pbnRzIGJlY2F1c2UgcG9seWdvbi1kaXNwbGF5IGFkZHMgdGhlIGZpcnN0IHBvaW50IHRvIHRoZSBlbmQuXG4gICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZVBvaW50cyA9IGxvZGFzaC51bmlxV2l0aChcbiAgICAgICAgICAgICAgICBfc2VsZi5wb3NpdGlvbnMsXG4gICAgICAgICAgICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZXF1YWxzXG4gICAgICAgICAgICAgICkubGVuZ3RoXG4gICAgICAgICAgICAgIGNvbnN0IG1pblBvaW50c0ZvclJlbW92YWwgPSBfc2VsZi5pc1BvbHlnb24gPyA0IDogM1xuICAgICAgICAgICAgICBpZiAodW5pcXVlUG9pbnRzIDwgbWluUG9pbnRzRm9yUmVtb3ZhbCkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgcG9pbnQgYW5kIHRoZSBjb3JyZXNwb25kaW5nIG1hcmtlcnNcbiAgICAgICAgICAgICAgX3NlbGYucG9zaXRpb25zLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgX3NlbGYuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgbWFya2Vycy5yZW1vdmVCaWxsYm9hcmQoaW5kZXgpXG4gICAgICAgICAgICAgIGVkaXRNYXJrZXJzLnJlbW92ZUJpbGxib2FyZChpbmRleClcbiAgICAgICAgICAgICAgdXBkYXRlSGFsZk1hcmtlcnMoaW5kZXgsIF9zZWxmLnBvc2l0aW9ucylcbiAgICAgICAgICAgICAgb25FZGl0ZWQoKVxuICAgICAgICAgICAgICBkcmF3SGVscGVyLl9zY2VuZS5yZXF1ZXN0UmVuZGVyKClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0b29sdGlwKCkge1xuICAgICAgICAgICAgICBsZXQgbXNnID0gJ0RyYWcgdG8gbW92ZSdcbiAgICAgICAgICAgICAgLy8gTmVlZCB0byBjb3VudCB1bmlxdWUgcG9pbnRzIGJlY2F1c2UgcG9seWdvbi1kaXNwbGF5IGFkZHMgdGhlIGZpcnN0IHBvaW50IHRvIHRoZSBlbmQuXG4gICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZVBvaW50cyA9IGxvZGFzaC51bmlxV2l0aChcbiAgICAgICAgICAgICAgICBfc2VsZi5wb3NpdGlvbnMsXG4gICAgICAgICAgICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZXF1YWxzXG4gICAgICAgICAgICAgICkubGVuZ3RoXG4gICAgICAgICAgICAgIGNvbnN0IG1pblBvaW50c0ZvclJlbW92YWwgPSBfc2VsZi5pc1BvbHlnb24gPyA0IDogM1xuICAgICAgICAgICAgICBpZiAodW5pcXVlUG9pbnRzID49IG1pblBvaW50c0ZvclJlbW92YWwpIHtcbiAgICAgICAgICAgICAgICBtc2cgKz0gJzxicj5SaWdodCBjbGljayB0byByZW1vdmUnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1zZ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gYWRkIGJpbGxib2FyZHMgYW5kIGtlZXAgYW4gb3JkZXJlZCBsaXN0IG9mIHRoZW0gZm9yIHRoZSBwb2x5Z29uIGVkZ2VzXG4gICAgICAgICAgbWFya2Vycy5hZGRCaWxsYm9hcmRzKF9zZWxmLnBvc2l0aW9ucywgaGFuZGxlTWFya2VyQ2hhbmdlcylcbiAgICAgICAgICB0aGlzLl9tYXJrZXJzID0gbWFya2Vyc1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgxMjUyKSBGSVhNRTogRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBub3QgYWxsb3dlZCBpbnNpZGUgYmxvY2suLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhhbGZNYXJrZXJQb3NpdGlvbihpbmRleDogYW55KSB7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBfc2VsZi5wb3NpdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBlbGxpcHNvaWQuY2FydG9ncmFwaGljVG9DYXJ0ZXNpYW4oXG4gICAgICAgICAgICAgIG5ldyBDZXNpdW0uRWxsaXBzb2lkR2VvZGVzaWMoXG4gICAgICAgICAgICAgICAgZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKHBvc2l0aW9uc1tpbmRleF0pLFxuICAgICAgICAgICAgICAgIGVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyhcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uc1tpbmRleCA8IHBvc2l0aW9ucy5sZW5ndGggLSAxID8gaW5kZXggKyAxIDogMF1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkuaW50ZXJwb2xhdGVVc2luZ0ZyYWN0aW9uKDAuNSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaGFsZlBvc2l0aW9ucyA9IFtdXG4gICAgICAgICAgbGV0IGluZGV4ID0gMFxuICAgICAgICAgIGxldCBsZW5ndGggPSBfc2VsZi5wb3NpdGlvbnMubGVuZ3RoICsgKHRoaXMuaXNQb2x5Z29uID8gMCA6IC0xKVxuICAgICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgaGFsZlBvc2l0aW9ucy5wdXNoKGNhbGN1bGF0ZUhhbGZNYXJrZXJQb3NpdGlvbihpbmRleCkpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGhhbmRsZUVkaXRNYXJrZXJDaGFuZ2VzID0ge1xuICAgICAgICAgICAgZHJhZ0hhbmRsZXJzOiB7XG4gICAgICAgICAgICAgIG9uRHJhZ1N0YXJ0KGluZGV4OiBhbnksIHBvc2l0aW9uOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAvLyBhZGQgYSBuZXcgcG9zaXRpb24gdG8gdGhlIHBvbHlnb24gYnV0IG5vdCBhIG5ldyBtYXJrZXIgeWV0XG4gICAgICAgICAgICAgICAgOyh0aGlzIGFzIGFueSkuaW5kZXggPSBpbmRleCArIDFcbiAgICAgICAgICAgICAgICBfc2VsZi5wb3NpdGlvbnMuc3BsaWNlKCh0aGlzIGFzIGFueSkuaW5kZXgsIDAsIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIF9zZWxmLl9jcmVhdGVQcmltaXRpdmUgPSB0cnVlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG9uRHJhZyhfaW5kZXg6IGFueSwgcG9zaXRpb246IGFueSkge1xuICAgICAgICAgICAgICAgIF9zZWxmLnBvc2l0aW9uc1sodGhpcyBhcyBhbnkpLmluZGV4XSA9IHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgX3NlbGYuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgb25EcmFnRW5kKF9pbmRleDogYW55LCBwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBzZXRzIG9mIG1ha2VycyBmb3IgZWRpdGluZ1xuICAgICAgICAgICAgICAgIG1hcmtlcnMuaW5zZXJ0QmlsbGJvYXJkKFxuICAgICAgICAgICAgICAgICAgKHRoaXMgYXMgYW55KS5pbmRleCxcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgaGFuZGxlTWFya2VyQ2hhbmdlc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBlZGl0TWFya2Vycy5nZXRCaWxsYm9hcmQoKHRoaXMgYXMgYW55KS5pbmRleCAtIDEpLnBvc2l0aW9uID1cbiAgICAgICAgICAgICAgICAgIGNhbGN1bGF0ZUhhbGZNYXJrZXJQb3NpdGlvbigodGhpcyBhcyBhbnkpLmluZGV4IC0gMSlcbiAgICAgICAgICAgICAgICBlZGl0TWFya2Vycy5pbnNlcnRCaWxsYm9hcmQoXG4gICAgICAgICAgICAgICAgICAodGhpcyBhcyBhbnkpLmluZGV4LFxuICAgICAgICAgICAgICAgICAgY2FsY3VsYXRlSGFsZk1hcmtlclBvc2l0aW9uKCh0aGlzIGFzIGFueSkuaW5kZXgpLFxuICAgICAgICAgICAgICAgICAgaGFuZGxlRWRpdE1hcmtlckNoYW5nZXNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgX3NlbGYuX2NyZWF0ZVByaW1pdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgICBvbkVkaXRlZCgpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9vbHRpcCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdEcmFnIHRvIGNyZWF0ZSBhIG5ldyBwb2ludCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICAgIGVkaXRNYXJrZXJzLmFkZEJpbGxib2FyZHMoaGFsZlBvc2l0aW9ucywgaGFuZGxlRWRpdE1hcmtlckNoYW5nZXMpXG4gICAgICAgICAgdGhpcy5fZWRpdE1hcmtlcnMgPSBlZGl0TWFya2Vyc1xuICAgICAgICAgIC8vIHNldCBvbiB0b3Agb2YgdGhlIHBvbHlnb25cbiAgICAgICAgICBtYXJrZXJzLnNldE9uVG9wKClcbiAgICAgICAgICBlZGl0TWFya2Vycy5zZXRPblRvcCgpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZWRpdE1vZGUgPSB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5fbWFya2VycyAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fbWFya2Vycy5yZW1vdmUoKVxuICAgICAgICAgIHRoaXMuX2VkaXRNYXJrZXJzLnJlbW92ZSgpXG4gICAgICAgICAgdGhpcy5fbWFya2VycyA9IG51bGxcbiAgICAgICAgICB0aGlzLl9lZGl0TWFya2VycyA9IG51bGxcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lZGl0TW9kZSA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIERyYXdIZWxwZXIuUG9seWxpbmVQcmltaXRpdmUucHJvdG90eXBlLnNldEVkaXRhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuc2V0RWRpdE1vZGUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBwb2x5bGluZSA9IHRoaXNcbiAgICAgIHBvbHlsaW5lLmlzUG9seWdvbiA9IGZhbHNlXG4gICAgICBwb2x5bGluZS5hc3luY2hyb25vdXMgPSBmYWxzZVxuICAgICAgcG9seWxpbmUuc2V0RWRpdE1vZGUgPSBzZXRFZGl0TW9kZVxuICAgICAgY29uc3Qgb3JpZ2luYWxXaWR0aCA9IHRoaXMud2lkdGhcbiAgICAgIHBvbHlsaW5lLnNldEhpZ2hsaWdodGVkID0gZnVuY3Rpb24gKGhpZ2hsaWdodGVkOiBhbnkpIHtcbiAgICAgICAgLy8gZGlzYWJsZSBpZiBhbHJlYWR5IGluIGVkaXQgbW9kZVxuICAgICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICBkcmF3SGVscGVyLnNldEhpZ2hsaWdodGVkKHRoaXMpXG4gICAgICAgICAgdGhpcy5zZXRXaWR0aChvcmlnaW5hbFdpZHRoICogMilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldFdpZHRoKG9yaWdpbmFsV2lkdGgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHBvbHlsaW5lLmdldEV4dGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIENlc2l1bS5FeHRlbnQuZnJvbUNhcnRvZ3JhcGhpY0FycmF5KFxuICAgICAgICAgIGVsbGlwc29pZC5jYXJ0ZXNpYW5BcnJheVRvQ2FydG9ncmFwaGljQXJyYXkodGhpcy5wb3NpdGlvbnMpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGVuaGFuY2VXaXRoTGlzdGVuZXJzKHBvbHlsaW5lKVxuICAgICAgcG9seWxpbmUuc2V0RWRpdE1vZGUodHJ1ZSlcbiAgICB9XG4gICAgRHJhd0hlbHBlci5Qb2x5Z29uUHJpbWl0aXZlLnByb3RvdHlwZS5zZXRFZGl0YWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnNldEVkaXRNb2RlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgcG9seWdvbiA9IHRoaXNcbiAgICAgIHBvbHlnb24uYXN5bmNocm9ub3VzID0gZmFsc2VcbiAgICAgIHBvbHlnb24uc2V0RWRpdE1vZGUgPSBzZXRFZGl0TW9kZVxuICAgICAgcG9seWdvbi5zZXRIaWdobGlnaHRlZCA9IHNldEhpZ2hsaWdodGVkXG4gICAgICBlbmhhbmNlV2l0aExpc3RlbmVycyhwb2x5Z29uKVxuICAgICAgcG9seWdvbi5zZXRFZGl0TW9kZSh0cnVlKVxuICAgIH1cbiAgICBEcmF3SGVscGVyLkV4dGVudFByaW1pdGl2ZS5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5zZXRFZGl0TW9kZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGV4dGVudCA9IHRoaXNcbiAgICAgIGV4dGVudC5hc3luY2hyb25vdXMgPSBmYWxzZVxuICAgICAgZXh0ZW50LnNldEVkaXRNb2RlID0gZnVuY3Rpb24gKGVkaXRNb2RlOiBhbnkpIHtcbiAgICAgICAgLy8gaWYgbm8gY2hhbmdlXG4gICAgICAgIGlmICh0aGlzLl9lZGl0TW9kZSA9PSBlZGl0TW9kZSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGRyYXdIZWxwZXIuZGlzYWJsZUFsbEhpZ2hsaWdodHMoKVxuICAgICAgICAvLyBkaXNwbGF5IG1hcmtlcnNcbiAgICAgICAgaWYgKGVkaXRNb2RlKSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIGFsbCBvdGhlciBzaGFwZXMgYXJlIG5vdCBpbiBlZGl0IG1vZGUgYmVmb3JlIHN0YXJ0aW5nIHRoZSBlZGl0aW5nIG9mIHRoaXMgc2hhcGVcbiAgICAgICAgICBkcmF3SGVscGVyLnNldEVkaXRlZCh0aGlzKVxuICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgbWFya2VycyBhbmQgaGFuZGxlcnMgZm9yIHRoZSBlZGl0aW5nXG4gICAgICAgICAgaWYgKHRoaXMuX21hcmtlcnMgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICBjb25zdCBtYXJrZXJzID0gbmV3IF8uQmlsbGJvYXJkR3JvdXAoZHJhd0hlbHBlciwgZHJhZ0JpbGxib2FyZClcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgxMjUyKSBGSVhNRTogRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBub3QgYWxsb3dlZCBpbnNpZGUgYmxvY2suLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgZnVuY3Rpb24gb25FZGl0ZWQoKSB7XG4gICAgICAgICAgICAgIGV4dGVudC5leGVjdXRlTGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnb25FZGl0ZWQnLFxuICAgICAgICAgICAgICAgIGV4dGVudDogZXh0ZW50LmV4dGVudCxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZU1hcmtlckNoYW5nZXMgPSB7XG4gICAgICAgICAgICAgIGRyYWdIYW5kbGVyczoge1xuICAgICAgICAgICAgICAgIG9uRHJhZyhpbmRleDogYW55LCBwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjb3JuZXIgPSBtYXJrZXJzLmdldEJpbGxib2FyZCgoaW5kZXggKyAyKSAlIDQpLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICBleHRlbnQuc2V0RXh0ZW50KFxuICAgICAgICAgICAgICAgICAgICBnZXRFeHRlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKGNvcm5lciksXG4gICAgICAgICAgICAgICAgICAgICAgZWxsaXBzb2lkLmNhcnRlc2lhblRvQ2FydG9ncmFwaGljKHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICBtYXJrZXJzLnVwZGF0ZUJpbGxib2FyZHNQb3NpdGlvbnMoXG4gICAgICAgICAgICAgICAgICAgIGdldEV4dGVudENvcm5lcnMoZXh0ZW50LmV4dGVudClcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uRHJhZ0VuZCgpIHtcbiAgICAgICAgICAgICAgICAgIG9uRWRpdGVkKClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0b29sdGlwKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnRHJhZyB0byBjaGFuZ2UgdGhlIGNvcm5lcnMgb2YgdGhpcyBleHRlbnQnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXJrZXJzLmFkZEJpbGxib2FyZHMoXG4gICAgICAgICAgICAgIGdldEV4dGVudENvcm5lcnMoZXh0ZW50LmV4dGVudCksXG4gICAgICAgICAgICAgIGhhbmRsZU1hcmtlckNoYW5nZXNcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHRoaXMuX21hcmtlcnMgPSBtYXJrZXJzXG4gICAgICAgICAgICBtYXJrZXJzLnNldE9uVG9wKClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fZWRpdE1vZGUgPSB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuX21hcmtlcnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fbWFya2Vycy5yZW1vdmUoKVxuICAgICAgICAgICAgdGhpcy5fbWFya2VycyA9IG51bGxcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fZWRpdE1vZGUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBleHRlbnQuc2V0SGlnaGxpZ2h0ZWQgPSBzZXRIaWdobGlnaHRlZFxuICAgICAgZW5oYW5jZVdpdGhMaXN0ZW5lcnMoZXh0ZW50KVxuICAgICAgZXh0ZW50LnNldEVkaXRNb2RlKHRydWUpXG4gICAgfVxuICAgIF8uRWxsaXBzZVByaW1pdGl2ZS5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5zZXRFZGl0TW9kZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGVsbGlwc2UgPSB0aGlzXG4gICAgICBjb25zdCBzY2VuZSA9IGRyYXdIZWxwZXIuX3NjZW5lXG4gICAgICBlbGxpcHNlLmFzeW5jaHJvbm91cyA9IGZhbHNlXG4gICAgICBkcmF3SGVscGVyLnJlZ2lzdGVyRWRpdGFibGVTaGFwZShlbGxpcHNlKVxuICAgICAgZWxsaXBzZS5zZXRFZGl0TW9kZSA9IGZ1bmN0aW9uIChlZGl0TW9kZTogYW55KSB7XG4gICAgICAgIC8vIGlmIG5vIGNoYW5nZVxuICAgICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT0gZWRpdE1vZGUpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBkcmF3SGVscGVyLmRpc2FibGVBbGxIaWdobGlnaHRzKClcbiAgICAgICAgLy8gZGlzcGxheSBtYXJrZXJzXG4gICAgICAgIGlmIChlZGl0TW9kZSkge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSBhbGwgb3RoZXIgc2hhcGVzIGFyZSBub3QgaW4gZWRpdCBtb2RlIGJlZm9yZSBzdGFydGluZyB0aGUgZWRpdGluZyBvZiB0aGlzIHNoYXBlXG4gICAgICAgICAgZHJhd0hlbHBlci5zZXRFZGl0ZWQodGhpcylcbiAgICAgICAgICBjb25zdCBfc2VsZiA9IHRoaXNcbiAgICAgICAgICAvLyBjcmVhdGUgdGhlIG1hcmtlcnMgYW5kIGhhbmRsZXJzIGZvciB0aGUgZWRpdGluZ1xuICAgICAgICAgIGlmICh0aGlzLl9tYXJrZXJzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgY29uc3QgbWFya2VycyA9IG5ldyBfLkJpbGxib2FyZEdyb3VwKGRyYXdIZWxwZXIsIGRyYWdCaWxsYm9hcmQpXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMTI1MikgRklYTUU6IEZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBhcmUgbm90IGFsbG93ZWQgaW5zaWRlIGJsb2NrLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldE1hcmtlclBvc2l0aW9ucygpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIENlc2l1bS5TaGFwZXMuY29tcHV0ZUVsbGlwc2VCb3VuZGFyeShcbiAgICAgICAgICAgICAgICBlbGxpcHNvaWQsXG4gICAgICAgICAgICAgICAgZWxsaXBzZS5nZXRDZW50ZXIoKSxcbiAgICAgICAgICAgICAgICBlbGxpcHNlLmdldFNlbWlNYWpvckF4aXMoKSxcbiAgICAgICAgICAgICAgICBlbGxpcHNlLmdldFNlbWlNaW5vckF4aXMoKSxcbiAgICAgICAgICAgICAgICBlbGxpcHNlLmdldFJvdGF0aW9uKCkgKyBNYXRoLlBJIC8gMixcbiAgICAgICAgICAgICAgICBNYXRoLlBJIC8gMi4wXG4gICAgICAgICAgICAgICkuc3BsaWNlKDAsIDQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMTI1MikgRklYTUU6IEZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBhcmUgbm90IGFsbG93ZWQgaW5zaWRlIGJsb2NrLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uRWRpdGVkKCkge1xuICAgICAgICAgICAgICBlbGxpcHNlLmV4ZWN1dGVMaXN0ZW5lcnMoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdvbkVkaXRlZCcsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBlbGxpcHNlLmdldENlbnRlcigpLFxuICAgICAgICAgICAgICAgIHNlbWlNYWpvckF4aXM6IGVsbGlwc2UuZ2V0U2VtaU1ham9yQXhpcygpLFxuICAgICAgICAgICAgICAgIHNlbWlNaW5vckF4aXM6IGVsbGlwc2UuZ2V0U2VtaU1pbm9yQXhpcygpLFxuICAgICAgICAgICAgICAgIHJvdGF0aW9uOiAwLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaGFuZGxlTWFya2VyQ2hhbmdlcyA9IHtcbiAgICAgICAgICAgICAgZHJhZ0hhbmRsZXJzOiB7XG4gICAgICAgICAgICAgICAgb25EcmFnKGluZGV4OiBhbnksIHBvc2l0aW9uOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gQ2VzaXVtLkNhcnRlc2lhbjMuZGlzdGFuY2UoXG4gICAgICAgICAgICAgICAgICAgIGVsbGlwc2UuZ2V0Q2VudGVyKCksXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICBpZiAoaW5kZXggJSAyID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZWxsaXBzZS5zZXRTZW1pTWFqb3JBeGlzKGRpc3RhbmNlKVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxsaXBzZS5zZXRTZW1pTWlub3JBeGlzKGRpc3RhbmNlKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgbWFya2Vycy51cGRhdGVCaWxsYm9hcmRzUG9zaXRpb25zKGdldE1hcmtlclBvc2l0aW9ucygpKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25EcmFnRW5kKCkge1xuICAgICAgICAgICAgICAgICAgb25FZGl0ZWQoKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRvb2x0aXAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdEcmFnIHRvIGNoYW5nZSB0aGUgZXhjZW50cmljaXR5IGFuZCByYWRpdXMnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXJrZXJzLmFkZEJpbGxib2FyZHMoZ2V0TWFya2VyUG9zaXRpb25zKCksIGhhbmRsZU1hcmtlckNoYW5nZXMpXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXJzID0gbWFya2Vyc1xuICAgICAgICAgICAgLy8gYWRkIGEgaGFuZGxlciBmb3IgY2xpY2tpbmcgaW4gdGhlIGdsb2JlXG4gICAgICAgICAgICB0aGlzLl9nbG9iZUNsaWNraGFuZGxlciA9IG5ldyBDZXNpdW0uU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIoXG4gICAgICAgICAgICAgIHNjZW5lLmNhbnZhc1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgdGhpcy5fZ2xvYmVDbGlja2hhbmRsZXIuc2V0SW5wdXRBY3Rpb24oKG1vdmVtZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcGlja2VkT2JqZWN0ID0gc2NlbmUucGljayhtb3ZlbWVudC5wb3NpdGlvbilcbiAgICAgICAgICAgICAgaWYgKCEocGlja2VkT2JqZWN0ICYmIHBpY2tlZE9iamVjdC5wcmltaXRpdmUpKSB7XG4gICAgICAgICAgICAgICAgX3NlbGYuc2V0RWRpdE1vZGUoZmFsc2UpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIENlc2l1bS5TY3JlZW5TcGFjZUV2ZW50VHlwZS5MRUZUX0NMSUNLKVxuICAgICAgICAgICAgLy8gc2V0IG9uIHRvcCBvZiB0aGUgcG9seWdvblxuICAgICAgICAgICAgbWFya2Vycy5zZXRPblRvcCgpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2VkaXRNb2RlID0gdHJ1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLl9tYXJrZXJzICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX21hcmtlcnMucmVtb3ZlKClcbiAgICAgICAgICAgIHRoaXMuX21hcmtlcnMgPSBudWxsXG4gICAgICAgICAgICB0aGlzLl9nbG9iZUNsaWNraGFuZGxlci5kZXN0cm95KClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fZWRpdE1vZGUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbGxpcHNlLnNldEhpZ2hsaWdodGVkID0gc2V0SGlnaGxpZ2h0ZWRcbiAgICAgIGVuaGFuY2VXaXRoTGlzdGVuZXJzKGVsbGlwc2UpXG4gICAgICBlbGxpcHNlLnNldEVkaXRNb2RlKGZhbHNlKVxuICAgIH1cbiAgICBfLkNpcmNsZVByaW1pdGl2ZS5wcm90b3R5cGUuZ2V0Q2lyY2xlQ2FydGVzaWFuQ29vcmRpbmF0ZXMgPSBmdW5jdGlvbiAoXG4gICAgICBncmFudWxhcml0eTogYW55XG4gICAgKSB7XG4gICAgICBjb25zdCBnZW9tZXRyeSA9IENlc2l1bS5DaXJjbGVPdXRsaW5lR2VvbWV0cnkuY3JlYXRlR2VvbWV0cnkoXG4gICAgICAgIG5ldyBDZXNpdW0uQ2lyY2xlT3V0bGluZUdlb21ldHJ5KHtcbiAgICAgICAgICBlbGxpcHNvaWQsXG4gICAgICAgICAgY2VudGVyOiB0aGlzLmdldENlbnRlcigpLFxuICAgICAgICAgIHJhZGl1czogdGhpcy5nZXRSYWRpdXMoKSxcbiAgICAgICAgICBncmFudWxhcml0eSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIGxldCBjb3VudCA9IDAsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICB2YWx1ZXMgPSBbXVxuICAgICAgZm9yICg7IGNvdW50IDwgZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi52YWx1ZXMubGVuZ3RoOyBjb3VudCArPSAzKSB7XG4gICAgICAgIHZhbHVlID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi52YWx1ZXNcbiAgICAgICAgdmFsdWVzLnB1c2goXG4gICAgICAgICAgbmV3IENlc2l1bS5DYXJ0ZXNpYW4zKFxuICAgICAgICAgICAgdmFsdWVbY291bnRdLFxuICAgICAgICAgICAgdmFsdWVbY291bnQgKyAxXSxcbiAgICAgICAgICAgIHZhbHVlW2NvdW50ICsgMl1cbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZXNcbiAgICB9XG4gICAgXy5DaXJjbGVQcmltaXRpdmUucHJvdG90eXBlLnNldEVkaXRhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuc2V0RWRpdE1vZGUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBjaXJjbGUgPSB0aGlzXG4gICAgICBjaXJjbGUuYXN5bmNocm9ub3VzID0gZmFsc2VcbiAgICAgIGNpcmNsZS5zZXRFZGl0TW9kZSA9IGZ1bmN0aW9uIChlZGl0TW9kZTogYW55KSB7XG4gICAgICAgIC8vIGlmIG5vIGNoYW5nZVxuICAgICAgICBpZiAodGhpcy5fZWRpdE1vZGUgPT0gZWRpdE1vZGUpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBkcmF3SGVscGVyLmRpc2FibGVBbGxIaWdobGlnaHRzKClcbiAgICAgICAgLy8gZGlzcGxheSBtYXJrZXJzXG4gICAgICAgIGlmIChlZGl0TW9kZSkge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSBhbGwgb3RoZXIgc2hhcGVzIGFyZSBub3QgaW4gZWRpdCBtb2RlIGJlZm9yZSBzdGFydGluZyB0aGUgZWRpdGluZyBvZiB0aGlzIHNoYXBlXG4gICAgICAgICAgZHJhd0hlbHBlci5zZXRFZGl0ZWQodGhpcylcbiAgICAgICAgICBjb25zdCBfc2VsZiA9IHRoaXNcbiAgICAgICAgICAvLyBjcmVhdGUgdGhlIG1hcmtlcnMgYW5kIGhhbmRsZXJzIGZvciB0aGUgZWRpdGluZ1xuICAgICAgICAgIGlmICh0aGlzLl9tYXJrZXJzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA5KSBGSVhNRTogJ25ldycgZXhwcmVzc2lvbiwgd2hvc2UgdGFyZ2V0IGxhY2tzIGEgY29uc3RydWN0IHMuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgY29uc3QgbWFya2VycyA9IG5ldyBfLkJpbGxib2FyZEdyb3VwKGRyYXdIZWxwZXIsIGRyYWdCaWxsYm9hcmQpXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMTI1MikgRklYTUU6IEZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBhcmUgbm90IGFsbG93ZWQgaW5zaWRlIGJsb2NrLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldE1hcmtlclBvc2l0aW9ucygpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9zZWxmLmdldENpcmNsZUNhcnRlc2lhbkNvb3JkaW5hdGVzKFxuICAgICAgICAgICAgICAgIENlc2l1bS5NYXRoLlBJX09WRVJfVFdPXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgxMjUyKSBGSVhNRTogRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBub3QgYWxsb3dlZCBpbnNpZGUgYmxvY2suLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgZnVuY3Rpb24gb25FZGl0ZWQoKSB7XG4gICAgICAgICAgICAgIGNpcmNsZS5leGVjdXRlTGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnb25FZGl0ZWQnLFxuICAgICAgICAgICAgICAgIGNlbnRlcjogY2lyY2xlLmdldENlbnRlcigpLFxuICAgICAgICAgICAgICAgIHJhZGl1czogY2lyY2xlLmdldFJhZGl1cygpLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaGFuZGxlTWFya2VyQ2hhbmdlcyA9IHtcbiAgICAgICAgICAgICAgZHJhZ0hhbmRsZXJzOiB7XG4gICAgICAgICAgICAgICAgb25EcmFnKF9pbmRleDogYW55LCBwb3NpdGlvbjogYW55KSB7XG4gICAgICAgICAgICAgICAgICBjaXJjbGUuc2V0UmFkaXVzKFxuICAgICAgICAgICAgICAgICAgICBDZXNpdW0uQ2FydGVzaWFuMy5kaXN0YW5jZShjaXJjbGUuZ2V0Q2VudGVyKCksIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgbWFya2Vycy51cGRhdGVCaWxsYm9hcmRzUG9zaXRpb25zKGdldE1hcmtlclBvc2l0aW9ucygpKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25EcmFnRW5kKCkge1xuICAgICAgICAgICAgICAgICAgb25FZGl0ZWQoKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRvb2x0aXAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdEcmFnIHRvIGNoYW5nZSB0aGUgcmFkaXVzJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFya2Vycy5hZGRCaWxsYm9hcmRzKGdldE1hcmtlclBvc2l0aW9ucygpLCBoYW5kbGVNYXJrZXJDaGFuZ2VzKVxuICAgICAgICAgICAgdGhpcy5fbWFya2VycyA9IG1hcmtlcnNcbiAgICAgICAgICAgIG1hcmtlcnMuc2V0T25Ub3AoKVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9lZGl0TW9kZSA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5fbWFya2VycyAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXJrZXJzLnJlbW92ZSgpXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXJzID0gbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9lZGl0TW9kZSA9IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNpcmNsZS5zZXRIaWdobGlnaHRlZCA9IHNldEhpZ2hsaWdodGVkXG4gICAgICBlbmhhbmNlV2l0aExpc3RlbmVycyhjaXJjbGUpXG4gICAgICBjaXJjbGUuc2V0RWRpdE1vZGUodHJ1ZSlcbiAgICB9XG4gIH1cbiAgXy5EcmF3SGVscGVyV2lkZ2V0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjb25zdHJ1Y3RvclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzAwKSBGSVhNRTogRHVwbGljYXRlIGlkZW50aWZpZXIgJ3RoaXMnLlxuICAgIGZ1bmN0aW9uIF8odGhpczogYW55LCB0aGlzOiBhbnksIGRyYXdIZWxwZXI6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICAvLyBjb250YWluZXIgbXVzdCBiZSBzcGVjaWZpZWRcbiAgICAgIGlmICghQ2VzaXVtLmRlZmluZWQob3B0aW9ucy5jb250YWluZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBDZXNpdW0uRGV2ZWxvcGVyRXJyb3IoJ0NvbnRhaW5lciBpcyByZXF1aXJlZCcpXG4gICAgICB9XG4gICAgICBjb25zdCBkcmF3T3B0aW9ucyA9IHtcbiAgICAgICAgbWFya2VySWNvbjogJy4vaW1nL2dseXBoaWNvbnNfMjQyX2dvb2dsZV9tYXBzLnBuZycsXG4gICAgICAgIHBvbHlsaW5lSWNvbjogJy4vaW1nL2dseXBoaWNvbnNfMDk3X3ZlY3Rvcl9wYXRoX2xpbmUucG5nJyxcbiAgICAgICAgcG9seWdvbkljb246ICcuL2ltZy9nbHlwaGljb25zXzA5Nl92ZWN0b3JfcGF0aF9wb2x5Z29uLnBuZycsXG4gICAgICAgIGNpcmNsZUljb246ICcuL2ltZy9nbHlwaGljb25zXzA5NV92ZWN0b3JfcGF0aF9jaXJjbGUucG5nJyxcbiAgICAgICAgZXh0ZW50SWNvbjogJy4vaW1nL2dseXBoaWNvbnNfMDk0X3ZlY3Rvcl9wYXRoX3NxdWFyZS5wbmcnLFxuICAgICAgICBjbGVhckljb246ICcuL2ltZy9nbHlwaGljb25zXzA2N19jbGVhbmluZy5wbmcnLFxuICAgICAgICBwb2x5bGluZURyYXdpbmdPcHRpb25zOiBkZWZhdWx0UG9seWxpbmVPcHRpb25zLFxuICAgICAgICBwb2x5Z29uRHJhd2luZ09wdGlvbnM6IGRlZmF1bHRQb2x5Z29uT3B0aW9ucyxcbiAgICAgICAgZXh0ZW50RHJhd2luZ09wdGlvbnM6IGRlZmF1bHRFeHRlbnRPcHRpb25zLFxuICAgICAgICBjaXJjbGVEcmF3aW5nT3B0aW9uczogZGVmYXVsdENpcmNsZU9wdGlvbnMsXG4gICAgICB9XG4gICAgICBmaWxsT3B0aW9ucyhvcHRpb25zLCBkcmF3T3B0aW9ucylcbiAgICAgIGNvbnN0IF9zZWxmID0gdGhpc1xuICAgICAgY29uc3QgdG9vbGJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpXG4gICAgICB0b29sYmFyLmNsYXNzTmFtZSA9ICd0b29sYmFyJ1xuICAgICAgb3B0aW9ucy5jb250YWluZXIuYXBwZW5kQ2hpbGQodG9vbGJhcilcbiAgICAgIGZ1bmN0aW9uIGFkZEljb24oX2lkOiBhbnksIHVybDogYW55LCB0aXRsZTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpXG4gICAgICAgIGRpdi5jbGFzc05hbWUgPSAnYnV0dG9uJ1xuICAgICAgICBkaXYudGl0bGUgPSB0aXRsZVxuICAgICAgICB0b29sYmFyLmFwcGVuZENoaWxkKGRpdilcbiAgICAgICAgZGl2Lm9uY2xpY2sgPSBjYWxsYmFja1xuICAgICAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnU1BBTicpXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChzcGFuKVxuICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0lNRycpXG4gICAgICAgIDsoaW1hZ2UgYXMgYW55KS5zcmMgPSB1cmxcbiAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZChpbWFnZSlcbiAgICAgICAgcmV0dXJuIGRpdlxuICAgICAgfVxuICAgICAgY29uc3Qgc2NlbmUgPSBkcmF3SGVscGVyLl9zY2VuZVxuICAgICAgYWRkSWNvbihcbiAgICAgICAgJ21hcmtlcicsXG4gICAgICAgIG9wdGlvbnMubWFya2VySWNvbixcbiAgICAgICAgJ0NsaWNrIHRvIHN0YXJ0IGRyYXdpbmcgYSAyRCBtYXJrZXInLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgZHJhd0hlbHBlci5zdGFydERyYXdpbmdNYXJrZXIoe1xuICAgICAgICAgICAgY2FsbGJhY2socG9zaXRpb246IGFueSkge1xuICAgICAgICAgICAgICBfc2VsZi5leGVjdXRlTGlzdGVuZXJzKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnbWFya2VyQ3JlYXRlZCcsXG4gICAgICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIGFkZEljb24oXG4gICAgICAgICdwb2x5bGluZScsXG4gICAgICAgIG9wdGlvbnMucG9seWxpbmVJY29uLFxuICAgICAgICAnQ2xpY2sgdG8gc3RhcnQgZHJhd2luZyBhIDJEIHBvbHlsaW5lJyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGRyYXdIZWxwZXIuc3RhcnREcmF3aW5nUG9seWxpbmUoe1xuICAgICAgICAgICAgY2FsbGJhY2socG9zaXRpb25zOiBhbnkpIHtcbiAgICAgICAgICAgICAgX3NlbGYuZXhlY3V0ZUxpc3RlbmVycyh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3BvbHlsaW5lQ3JlYXRlZCcsXG4gICAgICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApXG4gICAgICBhZGRJY29uKFxuICAgICAgICAncG9seWdvbicsXG4gICAgICAgIG9wdGlvbnMucG9seWdvbkljb24sXG4gICAgICAgICdDbGljayB0byBzdGFydCBkcmF3aW5nIGEgMkQgcG9seWdvbicsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBkcmF3SGVscGVyLnN0YXJ0RHJhd2luZ1BvbHlnb24oe1xuICAgICAgICAgICAgY2FsbGJhY2socG9zaXRpb25zOiBhbnkpIHtcbiAgICAgICAgICAgICAgX3NlbGYuZXhlY3V0ZUxpc3RlbmVycyh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3BvbHlnb25DcmVhdGVkJyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnMsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIGFkZEljb24oXG4gICAgICAgICdleHRlbnQnLFxuICAgICAgICBvcHRpb25zLmV4dGVudEljb24sXG4gICAgICAgICdDbGljayB0byBzdGFydCBkcmF3aW5nIGFuIEV4dGVudCcsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBkcmF3SGVscGVyLnN0YXJ0RHJhd2luZ0V4dGVudCh7XG4gICAgICAgICAgICBjYWxsYmFjayhleHRlbnQ6IGFueSkge1xuICAgICAgICAgICAgICBfc2VsZi5leGVjdXRlTGlzdGVuZXJzKHsgbmFtZTogJ2V4dGVudENyZWF0ZWQnLCBleHRlbnQgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgYWRkSWNvbihcbiAgICAgICAgJ2NpcmNsZScsXG4gICAgICAgIG9wdGlvbnMuY2lyY2xlSWNvbixcbiAgICAgICAgJ0NsaWNrIHRvIHN0YXJ0IGRyYXdpbmcgYSBDaXJjbGUnLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgZHJhd0hlbHBlci5zdGFydERyYXdpbmdDaXJjbGUoe1xuICAgICAgICAgICAgY2FsbGJhY2soY2VudGVyOiBhbnksIHJhZGl1czogYW55KSB7XG4gICAgICAgICAgICAgIF9zZWxmLmV4ZWN1dGVMaXN0ZW5lcnMoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdjaXJjbGVDcmVhdGVkJyxcbiAgICAgICAgICAgICAgICBjZW50ZXIsXG4gICAgICAgICAgICAgICAgcmFkaXVzLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApXG4gICAgICAvLyBhZGQgYSBjbGVhciBidXR0b24gYXQgdGhlIGVuZFxuICAgICAgLy8gYWRkIGEgZGl2aWRlciBmaXJzdFxuICAgICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpXG4gICAgICBkaXYuY2xhc3NOYW1lID0gJ2RpdmlkZXInXG4gICAgICB0b29sYmFyLmFwcGVuZENoaWxkKGRpdilcbiAgICAgIGFkZEljb24oJ2NsZWFyJywgb3B0aW9ucy5jbGVhckljb24sICdSZW1vdmUgYWxsIHByaW1pdGl2ZXMnLCAoKSA9PiB7XG4gICAgICAgIHNjZW5lLnByaW1pdGl2ZXMucmVtb3ZlQWxsKClcbiAgICAgIH0pXG4gICAgICBlbmhhbmNlV2l0aExpc3RlbmVycyh0aGlzKVxuICAgIH1cbiAgICByZXR1cm4gX1xuICB9KSgpXG4gIF8ucHJvdG90eXBlLmFkZFRvb2xiYXIgPSBmdW5jdGlvbiAoY29udGFpbmVyOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIG9wdGlvbnMgPSBjb3B5T3B0aW9ucyhvcHRpb25zLCB7IGNvbnRhaW5lciB9KVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTU0KSBGSVhNRTogRXhwZWN0ZWQgMyBhcmd1bWVudHMsIGJ1dCBnb3QgMi5cbiAgICByZXR1cm4gbmV3IF8uRHJhd0hlbHBlcldpZGdldCh0aGlzLCBvcHRpb25zKVxuICB9XG4gIGZ1bmN0aW9uIGdldEV4dGVudChtbjogYW55LCBteDogYW55KSB7XG4gICAgY29uc3QgZSA9IG5ldyBDZXNpdW0uUmVjdGFuZ2xlKClcbiAgICAvLyBSZS1vcmRlciBzbyB3ZXN0IDwgZWFzdCBhbmQgc291dGggPCBub3J0aFxuICAgIGUud2VzdCA9IE1hdGgubWluKG1uLmxvbmdpdHVkZSwgbXgubG9uZ2l0dWRlKVxuICAgIGUuZWFzdCA9IE1hdGgubWF4KG1uLmxvbmdpdHVkZSwgbXgubG9uZ2l0dWRlKVxuICAgIGUuc291dGggPSBNYXRoLm1pbihtbi5sYXRpdHVkZSwgbXgubGF0aXR1ZGUpXG4gICAgZS5ub3J0aCA9IE1hdGgubWF4KG1uLmxhdGl0dWRlLCBteC5sYXRpdHVkZSlcbiAgICAvLyBDaGVjayBmb3IgYXBwcm94IGVxdWFsIChzaG91bGRuJ3QgcmVxdWlyZSBhYnMgZHVlIHRvIHJlLW9yZGVyKVxuICAgIGNvbnN0IGVwc2lsb24gPSBDZXNpdW0uTWF0aC5FUFNJTE9ON1xuICAgIGlmIChlLmVhc3QgLSBlLndlc3QgPCBlcHNpbG9uKSB7XG4gICAgICBlLmVhc3QgKz0gZXBzaWxvbiAqIDIuMFxuICAgIH1cbiAgICBpZiAoZS5ub3J0aCAtIGUuc291dGggPCBlcHNpbG9uKSB7XG4gICAgICBlLm5vcnRoICs9IGVwc2lsb24gKiAyLjBcbiAgICB9XG4gICAgcmV0dXJuIGVcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb29sdGlwKGZyYW1lRGl2OiBhbnkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMwMCkgRklYTUU6IER1cGxpY2F0ZSBpZGVudGlmaWVyICd0aGlzJy5cbiAgICBjb25zdCB0b29sdGlwID0gZnVuY3Rpb24gKHRoaXM6IGFueSwgdGhpczogYW55LCBmcmFtZURpdjogYW55KSB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKVxuICAgICAgZGl2LmNsYXNzTmFtZSA9ICd0d2lwc3kgcmlnaHQgcG9pbnRlci1ldmVudHMtbm9uZSdcbiAgICAgIGNvbnN0IGFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJylcbiAgICAgIGFycm93LmNsYXNzTmFtZSA9ICd0d2lwc3ktYXJyb3cnXG4gICAgICBkaXYuYXBwZW5kQ2hpbGQoYXJyb3cpXG4gICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpXG4gICAgICB0aXRsZS5jbGFzc05hbWUgPSAndHdpcHN5LWlubmVyJ1xuICAgICAgZGl2LmFwcGVuZENoaWxkKHRpdGxlKVxuICAgICAgdGhpcy5fZGl2ID0gZGl2XG4gICAgICB0aGlzLl90aXRsZSA9IHRpdGxlXG4gICAgICAvLyBhZGQgdG8gZnJhbWUgZGl2IGFuZCBkaXNwbGF5IGNvb3JkaW5hdGVzXG4gICAgICBmcmFtZURpdi5hcHBlbmRDaGlsZChkaXYpXG4gICAgfVxuICAgIHRvb2x0aXAucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbiAodmlzaWJsZTogYW55KSB7XG4gICAgICB0aGlzLl9kaXYuc3R5bGUuZGlzcGxheSA9IHZpc2libGUgPyAnYmxvY2snIDogJ25vbmUnXG4gICAgfVxuICAgIHRvb2x0aXAucHJvdG90eXBlLnNob3dBdCA9IGZ1bmN0aW9uIChwb3NpdGlvbjogYW55LCBtZXNzYWdlOiBhbnkpIHtcbiAgICAgIGlmIChwb3NpdGlvbiAmJiBtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuc2V0VmlzaWJsZSh0cnVlKVxuICAgICAgICB0aGlzLl90aXRsZS5pbm5lckhUTUwgPSBtZXNzYWdlXG4gICAgICAgIHRoaXMuX2Rpdi5zdHlsZS5sZWZ0ID0gcG9zaXRpb24ueCArIDE1ICsgJ3B4J1xuICAgICAgICB0aGlzLl9kaXYuc3R5bGUudG9wID0gcG9zaXRpb24ueSArIDcgLSB0aGlzLl9kaXYuY2xpZW50SGVpZ2h0IC8gMiArICdweCdcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgIHJldHVybiBuZXcgdG9vbHRpcChmcmFtZURpdilcbiAgfVxuICBmdW5jdGlvbiBnZXREaXNwbGF5TGF0TG5nU3RyaW5nKGNhcnRvZ3JhcGhpYzogYW55LCBwcmVjaXNpb246IGFueSkge1xuICAgIHJldHVybiAoXG4gICAgICBjYXJ0b2dyYXBoaWMubG9uZ2l0dWRlLnRvRml4ZWQocHJlY2lzaW9uIHx8IDMpICtcbiAgICAgICcsICcgK1xuICAgICAgY2FydG9ncmFwaGljLmxhdGl0dWRlLnRvRml4ZWQocHJlY2lzaW9uIHx8IDMpXG4gICAgKVxuICB9XG4gIGZ1bmN0aW9uIGNsb25lKGZyb206IGFueSwgdG86IGFueSkge1xuICAgIGlmIChmcm9tID09IG51bGwgfHwgdHlwZW9mIGZyb20gIT0gJ29iamVjdCcpIHJldHVybiBmcm9tXG4gICAgaWYgKGZyb20uY29uc3RydWN0b3IgIT0gT2JqZWN0ICYmIGZyb20uY29uc3RydWN0b3IgIT0gQXJyYXkpIHJldHVybiBmcm9tXG4gICAgaWYgKFxuICAgICAgZnJvbS5jb25zdHJ1Y3RvciA9PSBEYXRlIHx8XG4gICAgICBmcm9tLmNvbnN0cnVjdG9yID09IFJlZ0V4cCB8fFxuICAgICAgZnJvbS5jb25zdHJ1Y3RvciA9PSBGdW5jdGlvbiB8fFxuICAgICAgZnJvbS5jb25zdHJ1Y3RvciA9PSBTdHJpbmcgfHxcbiAgICAgIGZyb20uY29uc3RydWN0b3IgPT0gTnVtYmVyIHx8XG4gICAgICBmcm9tLmNvbnN0cnVjdG9yID09IEJvb2xlYW5cbiAgICApXG4gICAgICByZXR1cm4gbmV3IGZyb20uY29uc3RydWN0b3IoZnJvbSlcbiAgICB0byA9IHRvIHx8IG5ldyBmcm9tLmNvbnN0cnVjdG9yKClcbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gZnJvbSkge1xuICAgICAgdG9bbmFtZV0gPVxuICAgICAgICB0eXBlb2YgdG9bbmFtZV0gPT0gJ3VuZGVmaW5lZCcgPyBjbG9uZShmcm9tW25hbWVdLCBudWxsKSA6IHRvW25hbWVdXG4gICAgfVxuICAgIHJldHVybiB0b1xuICB9XG4gIGZ1bmN0aW9uIGZpbGxPcHRpb25zKG9wdGlvbnM6IGFueSwgZGVmYXVsdE9wdGlvbnM6IGFueSkge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgbGV0IG9wdGlvblxuICAgIGZvciAob3B0aW9uIGluIGRlZmF1bHRPcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9uc1tvcHRpb25dID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgICAgICBvcHRpb25zW29wdGlvbl0gPSBjbG9uZShkZWZhdWx0T3B0aW9uc1tvcHRpb25dKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBzaGFsbG93IGNvcHlcbiAgZnVuY3Rpb24gY29weU9wdGlvbnMob3B0aW9uczogYW55LCBkZWZhdWx0T3B0aW9uczogYW55KSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgIGxldCBuZXdPcHRpb25zID0gY2xvbmUob3B0aW9ucyksXG4gICAgICBvcHRpb25cbiAgICBmb3IgKG9wdGlvbiBpbiBkZWZhdWx0T3B0aW9ucykge1xuICAgICAgaWYgKG5ld09wdGlvbnNbb3B0aW9uXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTU0KSBGSVhNRTogRXhwZWN0ZWQgMiBhcmd1bWVudHMsIGJ1dCBnb3QgMS5cbiAgICAgICAgbmV3T3B0aW9uc1tvcHRpb25dID0gY2xvbmUoZGVmYXVsdE9wdGlvbnNbb3B0aW9uXSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ld09wdGlvbnNcbiAgfVxuICBmdW5jdGlvbiBzZXRMaXN0ZW5lcihwcmltaXRpdmU6IGFueSwgdHlwZTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgcHJpbWl0aXZlW3R5cGVdID0gY2FsbGJhY2tcbiAgfVxuICBmdW5jdGlvbiBlbmhhbmNlV2l0aExpc3RlbmVycyhlbGVtZW50OiBhbnkpIHtcbiAgICBlbGVtZW50Ll9saXN0ZW5lcnMgPSB7fVxuICAgIGVsZW1lbnQuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiAobmFtZTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgICB0aGlzLl9saXN0ZW5lcnNbbmFtZV0gPSB0aGlzLl9saXN0ZW5lcnNbbmFtZV0gfHwgW11cbiAgICAgIHRoaXMuX2xpc3RlbmVyc1tuYW1lXS5wdXNoKGNhbGxiYWNrKVxuICAgICAgcmV0dXJuIHRoaXMuX2xpc3RlbmVyc1tuYW1lXS5sZW5ndGhcbiAgICB9XG4gICAgZWxlbWVudC5leGVjdXRlTGlzdGVuZXJzID0gZnVuY3Rpb24gKGV2ZW50OiBhbnksIGRlZmF1bHRDYWxsYmFjazogYW55KSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX2xpc3RlbmVyc1tldmVudC5uYW1lXSAmJlxuICAgICAgICB0aGlzLl9saXN0ZW5lcnNbZXZlbnQubmFtZV0ubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIGxldCBpbmRleCA9IDBcbiAgICAgICAgZm9yICg7IGluZGV4IDwgdGhpcy5fbGlzdGVuZXJzW2V2ZW50Lm5hbWVdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tldmVudC5uYW1lXVtpbmRleF0oZXZlbnQpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChkZWZhdWx0Q2FsbGJhY2spIHtcbiAgICAgICAgICBkZWZhdWx0Q2FsbGJhY2soZXZlbnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIF9cbn0pKClcbmV4cG9ydCBkZWZhdWx0IERyYXdIZWxwZXJcbiJdfQ==