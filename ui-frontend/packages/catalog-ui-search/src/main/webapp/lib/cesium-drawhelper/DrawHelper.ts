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
import Cesium from 'cesium'
import * as Turf from '@turf/turf'
import utility from '../../component/visualization/maps/cesium/utility'
import _ from 'lodash'
// Avoid conflict with the name _, which DrawHelper uses a lot
const lodash = _
const DrawHelper = (function () {
  // static variables
  const ellipsoid = Cesium.Ellipsoid.WGS84
  // constructor
  function _(this: any, cesiumWidget: any) {
    this._scene = cesiumWidget.scene
    this._tooltip = createTooltip(cesiumWidget.container)
    this._surfaces = []
    this.initialiseHandlers()
    this.enhancePrimitives()
  }
  _.prototype.initialiseHandlers = function () {
    const scene = this._scene
    // scene events
    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
    function callPrimitiveCallback(name: any, position: any) {
      const pickedObject = scene.pick(position)
      if (
        pickedObject &&
        pickedObject.primitive &&
        pickedObject.primitive[name]
      ) {
        pickedObject.primitive[name](position)
      }
    }
    handler.setInputAction((movement: any) => {
      callPrimitiveCallback('leftClick', movement.position)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    handler.setInputAction((movement: any) => {
      callPrimitiveCallback('leftDoubleClick', movement.position)
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    handler.setInputAction((movement: any) => {
      callPrimitiveCallback('rightClick', movement.position)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    let mouseOutObject: any
    handler.setInputAction((movement: any) => {
      let pickedObject = scene.pick(movement.endPosition)
      if (
        mouseOutObject &&
        (!pickedObject || mouseOutObject != pickedObject.primitive)
      ) {
        !(mouseOutObject.isDestroyed && mouseOutObject.isDestroyed()) &&
          mouseOutObject.mouseOut(movement.endPosition)
        mouseOutObject = null
      }
      if (pickedObject && pickedObject.primitive) {
        pickedObject = pickedObject.primitive
        if (pickedObject.mouseOut) {
          mouseOutObject = pickedObject
        }
        if (pickedObject.mouseMove) {
          pickedObject.mouseMove(movement.endPosition)
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    handler.setInputAction((movement: any) => {
      callPrimitiveCallback('leftUp', movement.position)
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
    handler.setInputAction((movement: any) => {
      callPrimitiveCallback('leftDown', movement.position)
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
  }
  _.prototype.setListener = function (
    primitive: any,
    type: any,
    callback: any
  ) {
    primitive[type] = callback
  }
  // register event handling for an editable shape
  // shape should implement setEditMode and setHighlighted
  _.prototype.registerEditableShape = function (surface: any) {
    const _self = this
    // handlers for interactions
    // highlight polygon when mouse is entering
    setListener(surface, 'mouseMove', (position: any) => {
      surface.setHighlighted(true)
      if (!surface._editMode) {
        _self._tooltip.showAt(position, 'Click to edit this shape')
      }
    })
    // hide the highlighting when mouse is leaving the polygon
    setListener(surface, 'mouseOut', () => {
      surface.setHighlighted(false)
      _self._tooltip.setVisible(false)
    })
    setListener(surface, 'leftClick', () => {
      surface.setEditMode(true)
    })
  }
  _.prototype.startDrawing = function (cleanUp: any) {
    // check for cleanUp first
    if (this.editCleanUp) {
      this.editCleanUp()
    }
    this.editCleanUp = cleanUp
  }
  _.prototype.stopDrawing = function () {
    // check for cleanUp first
    if (this.editCleanUp) {
      this.editCleanUp()
      this.editCleanUp = null
    }
  }
  // make sure only one shape is highlighted at a time
  _.prototype.disableAllHighlights = function () {
    this.setHighlighted(undefined)
  }
  _.prototype.setHighlighted = function (surface: any) {
    if (
      this._highlightedSurface &&
      !this._highlightedSurface.isDestroyed() &&
      this._highlightedSurface != surface
    ) {
      this._highlightedSurface.setHighlighted(false)
    }
    this._highlightedSurface = surface
  }
  _.prototype.disableAllEditMode = function () {
    this.setEdited(undefined)
  }
  _.prototype.setEdited = function (surface: any) {
    if (this._editedSurface && !this._editedSurface.isDestroyed()) {
      this._editedSurface.setEditMode(false)
    }
    this._editedSurface = surface
  }
  const material = Cesium.Material.fromType(Cesium.Material.ColorType)
  material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5)
  const defaultShapeOptions = {
    ellipsoid: Cesium.Ellipsoid.WGS84,
    textureRotationAngle: 0.0,
    height: 0.0,
    asynchronous: true,
    show: true,
    debugShowBoundingVolume: false,
  }
  let defaultSurfaceOptions = copyOptions(defaultShapeOptions, {
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: false,
    }),
    material,
    granularity: Math.PI / 180.0,
  })
  let defaultPolygonOptions = copyOptions(defaultShapeOptions, {})
  let defaultExtentOptions = copyOptions(defaultShapeOptions, {})
  let defaultCircleOptions = copyOptions(defaultShapeOptions, {})
  let defaultEllipseOptions = copyOptions(defaultSurfaceOptions, {
    rotation: 0,
  })
  let defaultPolylineOptions = copyOptions(defaultShapeOptions, {
    width: 5,
    geodesic: true,
    granularity: 10000,
    appearance: new Cesium.PolylineMaterialAppearance({
      aboveGround: false,
    }),
    material,
  })
  //    Cesium.Polygon.prototype.setStrokeStyle = setStrokeStyle;
  //
  //    Cesium.Polygon.prototype.drawOutline = drawOutline;
  //
  const ChangeablePrimitive = (function () {
    function _() {}
    _.prototype.initialiseOptions = function (options: any) {
      fillOptions(this, options)
      this._ellipsoid = undefined
      this._granularity = undefined
      this._height = undefined
      this._textureRotationAngle = undefined
      this._id = undefined
      // set the flags to initiate a first drawing
      this._createPrimitive = true
      this._primitive = undefined
      this._outlinePolygon = undefined
    }
    _.prototype.setAttribute = function (name: any, value: any) {
      this[name] = value
      this._createPrimitive = true
    }
    _.prototype.getAttribute = function (name: any) {
      return this[name]
    }
    /**
     * @private
     */
    _.prototype.update = function (
      context: any,
      frameState: any,
      commandList: any
    ) {
      if (!Cesium.defined(this.ellipsoid)) {
        throw new Cesium.DeveloperError('this.ellipsoid must be defined.')
      }
      if (!Cesium.defined(this.appearance)) {
        throw new Cesium.DeveloperError('this.material must be defined.')
      }
      if (this.granularity < 0.0) {
        throw new Cesium.DeveloperError(
          'this.granularity and scene2D/scene3D overrides must be greater than zero.'
        )
      }
      if (!this.show) {
        return
      }
      if (!this._createPrimitive && !Cesium.defined(this._primitive)) {
        // No positions/hierarchy to draw
        return
      }
      if (
        this._createPrimitive ||
        this._ellipsoid !== this.ellipsoid ||
        this._granularity !== this.granularity ||
        this._height !== this.height ||
        this._textureRotationAngle !== this.textureRotationAngle ||
        this._id !== this.id
      ) {
        const geometry = this.getGeometry()
        if (!geometry) {
          return
        }
        this._createPrimitive = false
        this._ellipsoid = this.ellipsoid
        this._granularity = this.granularity
        this._height = this.height
        this._textureRotationAngle = this.textureRotationAngle
        this._id = this.id
        this._primitive = this._primitive && this._primitive.destroy()
        this._primitive = new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry,
            id: this.id,
            pickPrimitive: this,
          }),
          appearance: this.appearance,
          asynchronous: this.asynchronous,
        })
        this._outlinePolygon =
          this._outlinePolygon && this._outlinePolygon.destroy()
        if (this.buffer && this.getOutlineGeometry) {
          const outlineGeometry = this.getOutlineGeometry()
          if (outlineGeometry) {
            // create the highlighting frame
            this._outlinePolygon = new Cesium.Primitive({
              geometryInstances: new Cesium.GeometryInstance({
                geometry: outlineGeometry,
                attributes: {
                  color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.BLUE
                  ),
                },
              }),
              appearance: new Cesium.PolylineMaterialAppearance({
                material: Cesium.Material.fromType('Color', {
                  color: Cesium.Color.BLUE,
                }),
              }),
            })
          }
        }
      }
      const primitive = this._primitive
      primitive.appearance.material = this.material
      primitive.debugShowBoundingVolume = this.debugShowBoundingVolume
      primitive.update(context, frameState, commandList)
      if (this._outlinePolygon) {
        this._outlinePolygon.update(context, frameState, commandList)
      }
    }
    _.prototype.isDestroyed = function () {
      return false
    }
    _.prototype.destroy = function () {
      this._primitive = this._primitive && this._primitive.destroy()
      return Cesium.destroyObject(this)
    }
    _.prototype.setStrokeStyle = function (strokeColor: any, strokeWidth: any) {
      if (
        !this.strokeColor ||
        !this.strokeColor.equals(strokeColor) ||
        this.strokeWidth != strokeWidth
      ) {
        this._createPrimitive = true
        this.strokeColor = strokeColor
        this.strokeWidth = strokeWidth
      }
    }
    return _
  })()
  _.ExtentPrimitive = (function () {
    // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
    function _(this: any, this: any, options: any) {
      if (!Cesium.defined(options.extent)) {
        throw new Cesium.DeveloperError('Extent is required')
      }
      options = copyOptions(options, defaultSurfaceOptions)
      this.initialiseOptions(options)
      this.setExtent(options.extent)
    }
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    _.prototype = new ChangeablePrimitive()
    _.prototype.setExtent = function (extent: any) {
      this.setAttribute('extent', extent)
    }
    _.prototype.getExtent = function () {
      return this.getAttribute('extent')
    }
    _.prototype.getGeometry = function () {
      if (!Cesium.defined(this.extent)) {
        return
      }
      const positions = [
        Cesium.Cartesian3.fromRadians(this.extent.west, this.extent.south),
        Cesium.Cartesian3.fromRadians(this.extent.west, this.extent.north),
        Cesium.Cartesian3.fromRadians(this.extent.east, this.extent.north),
        Cesium.Cartesian3.fromRadians(this.extent.east, this.extent.south),
        Cesium.Cartesian3.fromRadians(this.extent.west, this.extent.south),
      ]
      // Display a PolygonGeometry instead of a RectangleGeometry because RectangleGeometries
      // appear to always wrap the long way around the antimeridian.
      return Cesium.PolygonGeometry.fromPositions({
        positions,
        height: this.height,
        stRotation: this.textureRotationAngle,
        ellipsoid: this.ellipsoid,
        granularity: this.granularity,
      })
    }
    _.prototype.getOutlineGeometry = function () {
      return new Cesium.RectangleOutlineGeometry({
        rectangle: this.extent,
      })
    }
    return _
  })()
  _.PolygonPrimitive = (function () {
    // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
    function _(this: any, this: any, options: any) {
      options = copyOptions(options, defaultSurfaceOptions)
      this.initialiseOptions(options)
      this.isPolygon = true
    }
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    _.prototype = new ChangeablePrimitive()
    _.prototype.setPositions = function (positions: any) {
      this.setAttribute('positions', positions)
    }
    _.prototype.getPositions = function () {
      return this.getAttribute('positions')
    }
    _.prototype.getGeometry = function () {
      if (!Cesium.defined(this.positions) || this.positions.length < 3) {
        return
      }
      return Cesium.PolygonGeometry.fromPositions({
        positions: this.positions,
        height: this.height,
        stRotation: this.textureRotationAngle,
        ellipsoid: this.ellipsoid,
        granularity: this.granularity,
      })
    }
    _.prototype.getOutlineGeometry = function () {
      if (
        !Cesium.defined(this.positions) ||
        this.positions.length < 3 ||
        !this.buffer
      ) {
        return
      }
      const coordinates = this.positions.map((pos: Cesium.Cartesian3) => {
        const cartographic = Cesium.Cartographic.fromCartesian(pos)
        return [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
          cartographic.altitude,
        ]
      })

      const adjustedPolygon = Turf.polygon([coordinates])
      utility.adjustGeoCoords(adjustedPolygon)

      const bufferedPolygon = Turf.buffer(
        adjustedPolygon,
        Math.max(this.buffer, 1),
        {
          units: 'meters',
        }
      )
      if (!bufferedPolygon) {
        return
      }
      // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
      utility.adjustGeoCoords(bufferedPolygon)
      const outlinePositions = bufferedPolygon.geometry.coordinates[0].map(
        (coord) => Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord[2])
      )
      return new Cesium.PolylineGeometry({
        positions: outlinePositions,
        height: this.height,
        width: this.width < 1 ? 1 : this.width,
        ellipsoid: this.ellipsoid,
        followSurface: false,
      })
    }
    return _
  })()
  _.CirclePrimitive = (function () {
    // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
    function _(this: any, this: any, options: any) {
      if (!(Cesium.defined(options.center) && Cesium.defined(options.radius))) {
        throw new Cesium.DeveloperError('Center and radius are required')
      }
      options = copyOptions(options, defaultSurfaceOptions)
      this.initialiseOptions(options)
      this.setRadius(options.radius)
    }
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    _.prototype = new ChangeablePrimitive()
    _.prototype.setCenter = function (center: any) {
      this.setAttribute('center', center)
    }
    _.prototype.setRadius = function (radius: any) {
      this.setAttribute('radius', Math.max(0.1, radius))
    }
    _.prototype.getCenter = function () {
      return this.getAttribute('center')
    }
    _.prototype.getRadius = function () {
      return this.getAttribute('radius')
    }
    _.prototype.getGeometry = function () {
      if (!(Cesium.defined(this.center) && Cesium.defined(this.radius))) {
        return
      }
      return new Cesium.CircleGeometry({
        center: this.center,
        radius: this.radius,
        height: this.height,
        stRotation: this.textureRotationAngle,
        ellipsoid: this.ellipsoid,
        granularity: this.granularity,
      })
    }
    _.prototype.getOutlineGeometry = function () {
      return new Cesium.CircleOutlineGeometry({
        center: this.getCenter(),
        radius: this.getRadius(),
      })
    }
    return _
  })()
  _.EllipsePrimitive = (function () {
    function _(this: any, options: any) {
      if (
        !(
          Cesium.defined(options.center) &&
          Cesium.defined(options.semiMajorAxis) &&
          Cesium.defined(options.semiMinorAxis)
        )
      ) {
        throw new Cesium.DeveloperError(
          'Center and semi major and semi minor axis are required'
        )
      }
      options = copyOptions(options, defaultEllipseOptions)
      this.initialiseOptions(options)
    }
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    _.prototype = new ChangeablePrimitive()
    _.prototype.setCenter = function (center: any) {
      this.setAttribute('center', center)
    }
    _.prototype.setSemiMajorAxis = function (semiMajorAxis: any) {
      if (semiMajorAxis < this.getSemiMinorAxis()) return
      this.setAttribute('semiMajorAxis', semiMajorAxis)
    }
    _.prototype.setSemiMinorAxis = function (semiMinorAxis: any) {
      if (semiMinorAxis > this.getSemiMajorAxis()) return
      this.setAttribute('semiMinorAxis', semiMinorAxis)
    }
    _.prototype.setRotation = function (rotation: any) {
      return this.setAttribute('rotation', rotation)
    }
    _.prototype.getCenter = function () {
      return this.getAttribute('center')
    }
    _.prototype.getSemiMajorAxis = function () {
      return this.getAttribute('semiMajorAxis')
    }
    _.prototype.getSemiMinorAxis = function () {
      return this.getAttribute('semiMinorAxis')
    }
    _.prototype.getRotation = function () {
      return this.getAttribute('rotation')
    }
    _.prototype.getGeometry = function () {
      if (
        !(
          Cesium.defined(this.center) &&
          Cesium.defined(this.semiMajorAxis) &&
          Cesium.defined(this.semiMinorAxis)
        )
      ) {
        return
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
      })
    }
    _.prototype.getOutlineGeometry = function () {
      return new Cesium.EllipseOutlineGeometry({
        center: this.getCenter(),
        semiMajorAxis: this.getSemiMajorAxis(),
        semiMinorAxis: this.getSemiMinorAxis(),
        rotation: this.getRotation(),
      })
    }
    return _
  })()
  _.PolylinePrimitive = (function () {
    function _(this: any, options: any) {
      options = copyOptions(options, defaultPolylineOptions)
      this.initialiseOptions(options)
    }
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    _.prototype = new ChangeablePrimitive()
    _.prototype.setPositions = function (positions: any) {
      this.setAttribute('positions', positions)
    }
    _.prototype.setWidth = function (width: any) {
      this.setAttribute('width', width)
    }
    _.prototype.setGeodesic = function (geodesic: any) {
      this.setAttribute('geodesic', geodesic)
    }
    _.prototype.getPositions = function () {
      return this.getAttribute('positions')
    }
    _.prototype.getWidth = function () {
      return this.getAttribute('width')
    }
    _.prototype.getGeodesic = function () {
      return this.getAttribute('geodesic')
    }
    _.prototype.getGeometry = function () {
      if (!Cesium.defined(this.positions) || this.positions.length < 2) {
        return
      }
      return new Cesium.PolylineGeometry({
        positions: this.positions,
        height: this.height,
        width: this.width < 1 ? 1 : this.width,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        ellipsoid: this.ellipsoid,
        followSurface: false,
      })
    }
    _.prototype.getOutlineGeometry = function () {
      if (
        !Cesium.defined(this.positions) ||
        this.positions.length < 2 ||
        !this.buffer
      ) {
        return
      }
      const coordinates = this.positions.map((pos: Cesium.Cartesian3) => {
        const cartographic = Cesium.Cartographic.fromCartesian(pos)
        return [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
          cartographic.altitude,
        ]
      })
      const turfLine = Turf.lineString(coordinates)
      utility.adjustGeoCoords(turfLine)
      const bufferedLine = Turf.buffer(turfLine, Math.max(this.buffer, 1), {
        units: 'meters',
      })
      if (!bufferedLine) {
        return
      }
      // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
      utility.adjustGeoCoords(bufferedLine)
      const outlinePositions = bufferedLine.geometry.coordinates[0].map(
        (coord) => Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord[2])
      )
      return new Cesium.PolylineGeometry({
        positions: outlinePositions,
        height: this.height,
        width: this.width < 1 ? 1 : this.width,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        ellipsoid: this.ellipsoid,
        followSurface: false,
      })
    }
    return _
  })()
  const vertexSvg = `
  <svg width="10" height="10" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="5" r="5" fill="blue"/>
  </svg>
  `
  const dragHalfSvg = `
  <svg width="8" height="8" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="8" height="8" fill="blue"/>
    <line x1="1" y1="4" x2="7" y2="4" stroke-width="2" stroke="white"/>
    <line x1="4" y1="1" x2="4" y2="7" stroke-width="2" stroke="white"/>
  </svg>
  `
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
  const vertexImage = new Image()
  vertexImage.src = `data:image/svg+xml;base64,${window.btoa(vertexSvg)}`
  const dragHalfImage = new Image()
  dragHalfImage.src = `data:image/svg+xml;base64,${window.btoa(dragHalfSvg)}`
  const defaultBillboard = {
    image: vertexImage,
    shiftX: 0,
    shiftY: 0,
  }
  const dragBillboard = {
    image: vertexImage,
    shiftX: 0,
    shiftY: 0,
  }
  const dragHalfBillboard = {
    image: dragHalfImage,
    shiftX: 0,
    shiftY: 0,
  }
  _.prototype.createBillboardGroup = function (
    points: any,
    options: any,
    callbacks: any
  ) {
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    const markers = new _.BillboardGroup(this, options)
    markers.addBillboards(points, callbacks)
    return markers
  }
  _.BillboardGroup = function (drawHelper: any, options: any) {
    ;(this as any)._drawHelper = drawHelper
    ;(this as any)._scene = drawHelper._scene
    ;(this as any)._options = copyOptions(options, defaultBillboard)
    // create one common billboard collection for all billboards
    const b = new Cesium.BillboardCollection()
    ;(this as any)._scene.primitives.add(b)
    ;(this as any)._billboards = b
    // keep an ordered list of billboards
    ;(this as any)._orderedBillboards = []
  }
  _.BillboardGroup.prototype.createBillboard = function (
    position: any,
    callbacks: any
  ) {
    const billboard = this._billboards.add({
      show: true,
      position,
      pixelOffset: new Cesium.Cartesian2(
        this._options.shiftX,
        this._options.shiftY
      ),
      eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      scale: 1.0,
      image: this._options.image,
      color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
    })
    // if editable
    if (callbacks) {
      var _self = this
      const screenSpaceCameraController = this._scene
        .screenSpaceCameraController
      // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
      function enableRotation(enable: any) {
        screenSpaceCameraController.enableRotate = enable
      }
      // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
      function getIndex() {
        // find index
        for (
          var i = 0, I = _self._orderedBillboards.length;
          i < I && _self._orderedBillboards[i] != billboard;
          ++i
        );
        return i
      }
      if (callbacks.dragHandlers) {
        // eslint-disable-next-line no-redeclare
        var _self = this
        setListener(billboard, 'leftDown', (position: any) => {
          // TODO - start the drag handlers here
          // create handlers for mouseOut and leftUp for the billboard and a mouseMove
          function onDrag(position: any) {
            billboard.position = position
            // find index
            for (
              let i = 0, I = _self._orderedBillboards.length;
              i < I && _self._orderedBillboards[i] != billboard;
              ++i
            );
            callbacks.dragHandlers.onDrag &&
              callbacks.dragHandlers.onDrag(getIndex(), position)
          }
          function onDragEnd(position: any) {
            handler.destroy()
            enableRotation(true)
            callbacks.dragHandlers.onDragEnd &&
              callbacks.dragHandlers.onDragEnd(getIndex(), position)
          }
          var handler = new Cesium.ScreenSpaceEventHandler(_self._scene.canvas)
          handler.setInputAction((movement: any) => {
            const cartesian = _self._scene.camera.pickEllipsoid(
              movement.endPosition,
              ellipsoid
            )
            if (cartesian) {
              onDrag(cartesian)
            } else {
              onDragEnd(cartesian)
            }
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
          handler.setInputAction((movement: any) => {
            onDragEnd(
              _self._scene.camera.pickEllipsoid(movement.position, ellipsoid)
            )
          }, Cesium.ScreenSpaceEventType.LEFT_UP)
          enableRotation(false)
          callbacks.dragHandlers.onDragStart &&
            callbacks.dragHandlers.onDragStart(
              getIndex(),
              _self._scene.camera.pickEllipsoid(position, ellipsoid)
            )
        })
      }
      if (callbacks.onRightClick) {
        setListener(billboard, 'rightClick', () => {
          callbacks.onRightClick(getIndex())
        })
      }
      if (callbacks.onClick) {
        setListener(billboard, 'leftClick', () => {
          callbacks.onClick(getIndex())
        })
      }
      if (callbacks.tooltip) {
        setListener(billboard, 'mouseMove', (position: any) => {
          _self._drawHelper._tooltip.showAt(position, callbacks.tooltip())
        })
        setListener(billboard, 'mouseOut', () => {
          _self._drawHelper._tooltip.setVisible(false)
        })
      }
    }
    return billboard
  }
  _.BillboardGroup.prototype.insertBillboard = function (
    index: any,
    position: any,
    callbacks: any
  ) {
    this._orderedBillboards.splice(
      index,
      0,
      this.createBillboard(position, callbacks)
    )
  }
  _.BillboardGroup.prototype.addBillboard = function (
    position: any,
    callbacks: any
  ) {
    this._orderedBillboards.push(this.createBillboard(position, callbacks))
  }
  _.BillboardGroup.prototype.addBillboards = function (
    positions: any,
    callbacks: any
  ) {
    let index = 0
    for (; index < positions.length; index++) {
      this.addBillboard(positions[index], callbacks)
    }
  }
  _.BillboardGroup.prototype.updateBillboardsPositions = function (
    positions: any
  ) {
    let index = 0
    for (; index < positions.length; index++) {
      this.getBillboard(index).position = positions[index]
    }
  }
  _.BillboardGroup.prototype.countBillboards = function () {
    return this._orderedBillboards.length
  }
  _.BillboardGroup.prototype.getBillboard = function (index: any) {
    return this._orderedBillboards[index]
  }
  _.BillboardGroup.prototype.removeBillboard = function (index: any) {
    this._billboards.remove(this.getBillboard(index))
    this._orderedBillboards.splice(index, 1)
  }
  _.BillboardGroup.prototype.remove = function () {
    this._billboards =
      this._billboards &&
      this._scene.primitives.remove(this._billboards) &&
      this._billboards.removeAll() &&
      this._billboards.destroy()
  }
  _.BillboardGroup.prototype.setOnTop = function () {
    this._scene.primitives.raiseToTop(this._billboards)
  }
  _.prototype.startDrawingMarker = function (options: any) {
    // eslint-disable-next-line no-redeclare
    var options = copyOptions(options, defaultBillboard)
    this.startDrawing(() => {
      markers.remove()
      mouseHandler.destroy()
      tooltip.setVisible(false)
    })
    const _self = this
    const scene = this._scene
    // @ts-expect-error ts-migrate(6133) FIXME: 'primitives' is declared but its value is never re... Remove this comment to see the full error message
    const primitives = scene.primitives
    const tooltip = this._tooltip
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    const markers = new _.BillboardGroup(this, options)
    const mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
    // Now wait for start
    mouseHandler.setInputAction((movement: any) => {
      if (movement.position != null) {
        const cartesian = scene.camera.pickEllipsoid(
          movement.position,
          ellipsoid
        )
        if (cartesian) {
          markers.addBillboard(cartesian)
          _self.stopDrawing()
          options.callback(cartesian)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    mouseHandler.setInputAction((movement: any) => {
      const position = movement.endPosition
      if (position != null) {
        const cartesian = scene.camera.pickEllipsoid(position, ellipsoid)
        if (cartesian) {
          tooltip.showAt(
            position,
            '<p>Click to add your marker. Position is: </p>' +
              // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
              getDisplayLatLngString(
                ellipsoid.cartesianToCartographic(cartesian)
              )
          )
        } else {
          tooltip.showAt(
            position,
            '<p>Click on the globe to add your marker.</p>'
          )
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }
  _.prototype.startDrawingPolygon = function (options: any) {
    // eslint-disable-next-line no-redeclare
    var options = copyOptions(options, defaultSurfaceOptions)
    this.startDrawingPolyshape(true, options)
  }
  _.prototype.startDrawingPolyline = function (options: any) {
    // eslint-disable-next-line no-redeclare
    var options = copyOptions(options, defaultPolylineOptions)
    this.startDrawingPolyshape(false, options)
  }
  _.prototype.startDrawingPolyshape = function (isPolygon: any, options: any) {
    this.startDrawing(() => {
      primitives.remove(poly)
      markers.remove()
      mouseHandler.destroy()
      tooltip.setVisible(false)
    })
    const _self = this
    const scene = this._scene
    const primitives = scene.primitives
    const tooltip = this._tooltip
    const minPoints = isPolygon ? 3 : 2
    let poly: any
    if (isPolygon) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      poly = new DrawHelper.PolygonPrimitive(options)
    } else {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      poly = new DrawHelper.PolylinePrimitive(options)
    }
    poly.asynchronous = false
    primitives.add(poly)
    const positions: any = []
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    const markers = new _.BillboardGroup(this, defaultBillboard)
    const mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
    // Now wait for start
    mouseHandler.setInputAction((movement: any) => {
      if (movement.position != null) {
        const cartesian = scene.camera.pickEllipsoid(
          movement.position,
          ellipsoid
        )
        if (cartesian) {
          // first click
          if (positions.length == 0) {
            // If user clicks, they have started drawing, so disable editing
            _self.disableAllEditMode()
            positions.push(cartesian.clone())
            markers.addBillboard(positions[0])
          }
          if (positions.length >= minPoints) {
            poly.positions = positions
            poly._createPrimitive = true
          }
          // add new point to polygon
          // this one will move with the mouse
          positions.push(cartesian)
          // add marker at the new position
          markers.addBillboard(cartesian)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    mouseHandler.setInputAction((movement: any) => {
      const position = movement.endPosition
      if (position != null) {
        if (positions.length == 0) {
          const feature = scene.pick(position)
          const isBillboard =
            feature?.primitive && feature.primitive instanceof Cesium.Billboard
          if (!isBillboard) {
            tooltip.showAt(position, 'Click to add first point')
          }
        } else {
          const cartesian = scene.camera.pickEllipsoid(position, ellipsoid)
          if (cartesian) {
            positions.pop()
            // make sure it is slightly different
            cartesian.y += 1 + Math.random()
            positions.push(cartesian)
            if (positions.length >= minPoints) {
              poly.positions = positions
              poly._createPrimitive = true
            }
            // update marker
            markers.getBillboard(positions.length - 1).position = cartesian
            // show tooltip
            tooltip.showAt(
              position,
              `Click to add new point (${positions.length})
               ${
                 positions.length >= minPoints
                   ? '<br>Double click to finish drawing'
                   : ''
               }`
            )
            if (isPolygon && positions.length === 2) {
              // Request a render so the first polygon point will be displayed before the user
              // has clicked the second point. After the user has clicked to create a point,
              // the length of positions will be (# of points) + 1, because the last point is
              // wherever the mouse is. Renders will always happen on mouse movement when
              // positions.length is greater than 2, due to _createPrimitive being enabled above.
              scene.requestRender()
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    mouseHandler.setInputAction((movement: any) => {
      const position = movement.position
      if (position != null) {
        if (positions.length < minPoints + 2) {
          return
        } else {
          const cartesian = scene.camera.pickEllipsoid(position, ellipsoid)
          if (cartesian) {
            _self.stopDrawing()
            if (typeof options.callback == 'function') {
              //https://github.com/leforthomas/cesium-drawhelper/issues/13
              //need to remove last 2 positions since those are from finishing the drawing
              options.callback(positions.slice(0, positions.length - 2))
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
  }
  function getExtentCorners(value: any) {
    return ellipsoid.cartographicArrayToCartesianArray([
      Cesium.Rectangle.northwest(value),
      Cesium.Rectangle.northeast(value),
      Cesium.Rectangle.southeast(value),
      Cesium.Rectangle.southwest(value),
    ])
  }
  _.prototype.startDrawingExtent = function (options: any) {
    // eslint-disable-next-line no-redeclare
    var options = copyOptions(options, defaultSurfaceOptions)
    this.startDrawing(() => {
      if (extent != null) {
        primitives.remove(extent)
      }
      markers?.remove()
      mouseHandler.destroy()
      tooltip.setVisible(false)
    })
    const _self = this
    const scene = this._scene
    const primitives = this._scene.primitives
    const tooltip = this._tooltip
    let firstPoint: any = null
    let extent: any = null
    let markers: any = null
    const mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
    function updateExtent(value: any) {
      if (extent == null) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        extent = new DrawHelper.ExtentPrimitive({ ...options, extent: value })
        extent.asynchronous = false
        primitives.add(extent)
      }
      extent.extent = value
      // update the markers
      const corners = getExtentCorners(value)
      // create if they do not yet exist
      if (markers == null) {
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        markers = new _.BillboardGroup(_self, defaultBillboard)
        markers.addBillboards(corners)
      } else {
        markers.updateBillboardsPositions(corners)
      }
    }
    // Now wait for start
    mouseHandler.setInputAction((movement: any) => {
      if (movement.position != null) {
        const cartesian = scene.camera.pickEllipsoid(
          movement.position,
          ellipsoid
        )
        if (cartesian) {
          if (extent == null) {
            // If user clicks, they have started drawing, so disable editing
            _self.disableAllEditMode()
            // create the rectangle
            firstPoint = ellipsoid.cartesianToCartographic(cartesian)
            const value = getExtent(firstPoint, firstPoint)
            updateExtent(value)
          } else {
            _self.stopDrawing()
            if (typeof options.callback == 'function') {
              options.callback(
                getExtent(
                  firstPoint,
                  ellipsoid.cartesianToCartographic(cartesian)
                )
              )
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    mouseHandler.setInputAction((movement: any) => {
      const position = movement.endPosition
      if (position != null) {
        if (extent == null) {
          const feature = scene.pick(position)
          const isBillboard =
            feature?.primitive && feature.primitive instanceof Cesium.Billboard
          if (!isBillboard) {
            tooltip.showAt(position, 'Click to start drawing rectangle')
          }
        } else {
          const cartesian = scene.camera.pickEllipsoid(position, ellipsoid)
          if (cartesian) {
            extent._createPrimitive = true
            const value = getExtent(
              firstPoint,
              ellipsoid.cartesianToCartographic(cartesian)
            )
            updateExtent(value)
            tooltip.showAt(
              position,
              'Drag to change rectangle extent<br>Click again to finish drawing'
            )
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }
  _.prototype.startDrawingCircle = function (options: any) {
    // eslint-disable-next-line no-redeclare
    var options = copyOptions(options, defaultSurfaceOptions)
    this.startDrawing(function cleanUp() {
      if (circle != null) {
        primitives.remove(circle)
      }
      markers?.remove()
      mouseHandler.destroy()
      tooltip.setVisible(false)
    })
    const _self = this
    const scene = this._scene
    const primitives = this._scene.primitives
    const tooltip = this._tooltip
    let circle: any = null
    let markers: any = null
    const mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
    // Now wait for start
    mouseHandler.setInputAction((movement: any) => {
      if (movement.position != null) {
        const cartesian = scene.camera.pickEllipsoid(
          movement.position,
          ellipsoid
        )
        if (cartesian) {
          if (circle == null) {
            // If user clicks, they have started drawing, so disable editing
            _self.disableAllEditMode()
            // create the circle
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            circle = new _.CirclePrimitive({
              center: cartesian,
              radius: 0,
              asynchronous: false,
              material: options.material,
            })
            primitives.add(circle)
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            markers = new _.BillboardGroup(_self, defaultBillboard)
            markers.addBillboards([cartesian])
          } else {
            if (typeof options.callback == 'function') {
              options.callback(circle.getCenter(), circle.getRadius())
            }
            _self.stopDrawing()
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    mouseHandler.setInputAction((movement: any) => {
      const position = movement.endPosition
      if (position != null) {
        if (circle == null) {
          const feature = scene.pick(position)
          const isBillboard =
            feature?.primitive && feature.primitive instanceof Cesium.Billboard
          if (!isBillboard) {
            tooltip.showAt(position, 'Click to start drawing the circle')
          }
        } else {
          const cartesian = scene.camera.pickEllipsoid(position, ellipsoid)
          if (cartesian) {
            circle.setRadius(
              Cesium.Cartesian3.distance(circle.getCenter(), cartesian)
            )
            markers.updateBillboardsPositions(cartesian)
            tooltip.showAt(
              position,
              'Move mouse to change circle radius<br>Click again to finish drawing'
            )
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }
  _.prototype.enhancePrimitives = function () {
    const drawHelper = this
    Cesium.Billboard.prototype.setEditable = function () {
      if (this._editable) {
        return
      }
      this._editable = true
      const billboard = this
      const _self = this
      function enableRotation(enable: any) {
        drawHelper._scene.screenSpaceCameraController.enableRotate = enable
      }
      setListener(billboard, 'leftDown', () => {
        // TODO - start the drag handlers here
        // create handlers for mouseOut and leftUp for the billboard and a mouseMove
        function onDrag(position: any) {
          billboard.position = position
          _self.executeListeners({ name: 'drag', positions: position })
        }
        function onDragEnd(position: any) {
          handler.destroy()
          enableRotation(true)
          _self.executeListeners({ name: 'dragEnd', positions: position })
        }
        var handler = new Cesium.ScreenSpaceEventHandler(
          drawHelper._scene.canvas
        )
        handler.setInputAction((movement: any) => {
          const cartesian = drawHelper._scene.camera.pickEllipsoid(
            movement.endPosition,
            ellipsoid
          )
          if (cartesian) {
            onDrag(cartesian)
          } else {
            onDragEnd(cartesian)
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        handler.setInputAction((movement: any) => {
          onDragEnd(
            drawHelper._scene.camera.pickEllipsoid(movement.position, ellipsoid)
          )
        }, Cesium.ScreenSpaceEventType.LEFT_UP)
        enableRotation(false)
      })
      enhanceWithListeners(billboard)
    }
    function setHighlighted(this: any, highlighted: any) {
      // if no change
      // if already highlighted, the outline polygon will be available
      if (this._highlighted && this._highlighted == highlighted) {
        return
      }
      // disable if already in edit mode
      if (this._editMode === true) {
        return
      }
      this._highlighted = highlighted
      // highlight by creating an outline polygon matching the polygon points
      if (highlighted) {
        // make sure all other shapes are not highlighted
        drawHelper.setHighlighted(this)
        this._strokeColor = this.strokeColor
        this.setStrokeStyle(
          Cesium.Color.fromCssColorString('white'),
          this.strokeWidth
        )
      } else {
        if (this._strokeColor) {
          this.setStrokeStyle(this._strokeColor, this.strokeWidth)
        } else {
          this.setStrokeStyle(undefined, undefined)
        }
      }
    }
    function setEditMode(this: any, editMode: any) {
      // if no change
      if (this._editMode == editMode) {
        return
      }
      // make sure all other shapes are not in edit mode before starting the editing of this shape
      drawHelper.disableAllHighlights()
      // display markers
      if (editMode) {
        drawHelper.setEdited(this)
        const _self = this
        // create the markers and handlers for the editing
        if (this._markers == null) {
          // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
          const markers = new _.BillboardGroup(drawHelper, dragBillboard)
          // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
          const editMarkers = new _.BillboardGroup(
            drawHelper,
            dragHalfBillboard
          )
          // function for updating the edit markers around a certain point
          // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
          function updateHalfMarkers(index: any, positions: any) {
            // update the half markers before and after the index
            let editIndex = index - 1 < 0 ? positions.length - 1 : index - 1
            if (editIndex < editMarkers.countBillboards()) {
              editMarkers.getBillboard(
                editIndex
              ).position = calculateHalfMarkerPosition(editIndex)
            }
            editIndex = index
            if (editIndex < editMarkers.countBillboards()) {
              editMarkers.getBillboard(
                editIndex
              ).position = calculateHalfMarkerPosition(editIndex)
            }
          }
          // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
          function onEdited() {
            _self.executeListeners({
              name: 'onEdited',
              positions: _self.positions,
            })
          }
          const handleMarkerChanges = {
            dragHandlers: {
              onDrag(index: any, position: any) {
                _self.positions[index] = position
                updateHalfMarkers(index, _self.positions)
                _self._createPrimitive = true
              },
              onDragEnd() {
                _self._createPrimitive = true
                onEdited()
              },
            },
            onRightClick(index: any) {
              // Need to count unique points because polygon-display adds the first point to the end.
              const uniquePoints = lodash.uniqWith(
                _self.positions,
                Cesium.Cartesian3.equals
              ).length
              const minPointsForRemoval = _self.isPolygon ? 4 : 3
              if (uniquePoints < minPointsForRemoval) {
                return
              }
              // remove the point and the corresponding markers
              _self.positions.splice(index, 1)
              _self._createPrimitive = true
              markers.removeBillboard(index)
              editMarkers.removeBillboard(index)
              updateHalfMarkers(index, _self.positions)
              onEdited()
              drawHelper._scene.requestRender()
            },
            tooltip() {
              let msg = 'Drag to move'
              // Need to count unique points because polygon-display adds the first point to the end.
              const uniquePoints = lodash.uniqWith(
                _self.positions,
                Cesium.Cartesian3.equals
              ).length
              const minPointsForRemoval = _self.isPolygon ? 4 : 3
              if (uniquePoints >= minPointsForRemoval) {
                msg += '<br>Right click to remove'
              }
              return msg
            },
          }
          // add billboards and keep an ordered list of them for the polygon edges
          markers.addBillboards(_self.positions, handleMarkerChanges)
          this._markers = markers
          // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
          function calculateHalfMarkerPosition(index: any) {
            const positions = _self.positions
            return ellipsoid.cartographicToCartesian(
              new Cesium.EllipsoidGeodesic(
                ellipsoid.cartesianToCartographic(positions[index]),
                ellipsoid.cartesianToCartographic(
                  positions[index < positions.length - 1 ? index + 1 : 0]
                )
              ).interpolateUsingFraction(0.5)
            )
          }
          const halfPositions = []
          let index = 0
          let length = _self.positions.length + (this.isPolygon ? 0 : -1)
          for (; index < length; index++) {
            halfPositions.push(calculateHalfMarkerPosition(index))
          }
          const handleEditMarkerChanges = {
            dragHandlers: {
              onDragStart(index: any, position: any) {
                // add a new position to the polygon but not a new marker yet
                ;(this as any).index = index + 1
                _self.positions.splice((this as any).index, 0, position)
                _self._createPrimitive = true
              },
              onDrag(_index: any, position: any) {
                _self.positions[(this as any).index] = position
                _self._createPrimitive = true
              },
              onDragEnd(_index: any, position: any) {
                // create new sets of makers for editing
                markers.insertBillboard(
                  (this as any).index,
                  position,
                  handleMarkerChanges
                )
                editMarkers.getBillboard(
                  (this as any).index - 1
                ).position = calculateHalfMarkerPosition(
                  (this as any).index - 1
                )
                editMarkers.insertBillboard(
                  (this as any).index,
                  calculateHalfMarkerPosition((this as any).index),
                  handleEditMarkerChanges
                )
                _self._createPrimitive = true
                onEdited()
              },
            },
            tooltip() {
              return 'Drag to create a new point'
            },
          }
          editMarkers.addBillboards(halfPositions, handleEditMarkerChanges)
          this._editMarkers = editMarkers
          // set on top of the polygon
          markers.setOnTop()
          editMarkers.setOnTop()
        }
        this._editMode = true
      } else {
        if (this._markers != null) {
          this._markers.remove()
          this._editMarkers.remove()
          this._markers = null
          this._editMarkers = null
        }
        this._editMode = false
      }
    }
    DrawHelper.PolylinePrimitive.prototype.setEditable = function () {
      if (this.setEditMode) {
        return
      }
      const polyline = this
      polyline.isPolygon = false
      polyline.asynchronous = false
      polyline.setEditMode = setEditMode
      const originalWidth = this.width
      polyline.setHighlighted = function (highlighted: any) {
        // disable if already in edit mode
        if (this._editMode === true) {
          return
        }
        if (highlighted) {
          drawHelper.setHighlighted(this)
          this.setWidth(originalWidth * 2)
        } else {
          this.setWidth(originalWidth)
        }
      }
      polyline.getExtent = function () {
        return Cesium.Extent.fromCartographicArray(
          ellipsoid.cartesianArrayToCartographicArray(this.positions)
        )
      }
      enhanceWithListeners(polyline)
      polyline.setEditMode(true)
    }
    DrawHelper.PolygonPrimitive.prototype.setEditable = function () {
      if (this.setEditMode) {
        return
      }
      const polygon = this
      polygon.asynchronous = false
      polygon.setEditMode = setEditMode
      polygon.setHighlighted = setHighlighted
      enhanceWithListeners(polygon)
      polygon.setEditMode(true)
    }
    DrawHelper.ExtentPrimitive.prototype.setEditable = function () {
      if (this.setEditMode) {
        return
      }
      const extent = this
      extent.asynchronous = false
      extent.setEditMode = function (editMode: any) {
        // if no change
        if (this._editMode == editMode) {
          return
        }
        drawHelper.disableAllHighlights()
        // display markers
        if (editMode) {
          // make sure all other shapes are not in edit mode before starting the editing of this shape
          drawHelper.setEdited(this)
          // create the markers and handlers for the editing
          if (this._markers == null) {
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            const markers = new _.BillboardGroup(drawHelper, dragBillboard)
            // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
            function onEdited() {
              extent.executeListeners({
                name: 'onEdited',
                extent: extent.extent,
              })
            }
            const handleMarkerChanges = {
              dragHandlers: {
                onDrag(index: any, position: any) {
                  const corner = markers.getBillboard((index + 2) % 4).position
                  extent.setExtent(
                    getExtent(
                      ellipsoid.cartesianToCartographic(corner),
                      ellipsoid.cartesianToCartographic(position)
                    )
                  )
                  markers.updateBillboardsPositions(
                    getExtentCorners(extent.extent)
                  )
                },
                onDragEnd() {
                  onEdited()
                },
              },
              tooltip() {
                return 'Drag to change the corners of this extent'
              },
            }
            markers.addBillboards(
              getExtentCorners(extent.extent),
              handleMarkerChanges
            )
            this._markers = markers
            markers.setOnTop()
          }
          this._editMode = true
        } else {
          if (this._markers != null) {
            this._markers.remove()
            this._markers = null
          }
          this._editMode = false
        }
      }
      extent.setHighlighted = setHighlighted
      enhanceWithListeners(extent)
      extent.setEditMode(true)
    }
    _.EllipsePrimitive.prototype.setEditable = function () {
      if (this.setEditMode) {
        return
      }
      const ellipse = this
      const scene = drawHelper._scene
      ellipse.asynchronous = false
      drawHelper.registerEditableShape(ellipse)
      ellipse.setEditMode = function (editMode: any) {
        // if no change
        if (this._editMode == editMode) {
          return
        }
        drawHelper.disableAllHighlights()
        // display markers
        if (editMode) {
          // make sure all other shapes are not in edit mode before starting the editing of this shape
          drawHelper.setEdited(this)
          const _self = this
          // create the markers and handlers for the editing
          if (this._markers == null) {
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            const markers = new _.BillboardGroup(drawHelper, dragBillboard)
            // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
            function getMarkerPositions() {
              return Cesium.Shapes.computeEllipseBoundary(
                ellipsoid,
                ellipse.getCenter(),
                ellipse.getSemiMajorAxis(),
                ellipse.getSemiMinorAxis(),
                ellipse.getRotation() + Math.PI / 2,
                Math.PI / 2.0
              ).splice(0, 4)
            }
            // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
            function onEdited() {
              ellipse.executeListeners({
                name: 'onEdited',
                center: ellipse.getCenter(),
                semiMajorAxis: ellipse.getSemiMajorAxis(),
                semiMinorAxis: ellipse.getSemiMinorAxis(),
                rotation: 0,
              })
            }
            const handleMarkerChanges = {
              dragHandlers: {
                onDrag(index: any, position: any) {
                  const distance = Cesium.Cartesian3.distance(
                    ellipse.getCenter(),
                    position
                  )
                  if (index % 2 == 0) {
                    ellipse.setSemiMajorAxis(distance)
                  } else {
                    ellipse.setSemiMinorAxis(distance)
                  }
                  markers.updateBillboardsPositions(getMarkerPositions())
                },
                onDragEnd() {
                  onEdited()
                },
              },
              tooltip() {
                return 'Drag to change the excentricity and radius'
              },
            }
            markers.addBillboards(getMarkerPositions(), handleMarkerChanges)
            this._markers = markers
            // add a handler for clicking in the globe
            this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(
              scene.canvas
            )
            this._globeClickhandler.setInputAction((movement: any) => {
              const pickedObject = scene.pick(movement.position)
              if (!(pickedObject && pickedObject.primitive)) {
                _self.setEditMode(false)
              }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
            // set on top of the polygon
            markers.setOnTop()
          }
          this._editMode = true
        } else {
          if (this._markers != null) {
            this._markers.remove()
            this._markers = null
            this._globeClickhandler.destroy()
          }
          this._editMode = false
        }
      }
      ellipse.setHighlighted = setHighlighted
      enhanceWithListeners(ellipse)
      ellipse.setEditMode(false)
    }
    _.CirclePrimitive.prototype.getCircleCartesianCoordinates = function (
      granularity: any
    ) {
      const geometry = Cesium.CircleOutlineGeometry.createGeometry(
        new Cesium.CircleOutlineGeometry({
          ellipsoid,
          center: this.getCenter(),
          radius: this.getRadius(),
          granularity,
        })
      )
      let count = 0,
        value,
        values = []
      for (; count < geometry.attributes.position.values.length; count += 3) {
        value = geometry.attributes.position.values
        values.push(
          new Cesium.Cartesian3(
            value[count],
            value[count + 1],
            value[count + 2]
          )
        )
      }
      return values
    }
    _.CirclePrimitive.prototype.setEditable = function () {
      if (this.setEditMode) {
        return
      }
      const circle = this
      circle.asynchronous = false
      circle.setEditMode = function (editMode: any) {
        // if no change
        if (this._editMode == editMode) {
          return
        }
        drawHelper.disableAllHighlights()
        // display markers
        if (editMode) {
          // make sure all other shapes are not in edit mode before starting the editing of this shape
          drawHelper.setEdited(this)
          const _self = this
          // create the markers and handlers for the editing
          if (this._markers == null) {
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            const markers = new _.BillboardGroup(drawHelper, dragBillboard)
            // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
            function getMarkerPositions() {
              return _self.getCircleCartesianCoordinates(
                Cesium.Math.PI_OVER_TWO
              )
            }
            // @ts-expect-error ts-migrate(1252) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
            function onEdited() {
              circle.executeListeners({
                name: 'onEdited',
                center: circle.getCenter(),
                radius: circle.getRadius(),
              })
            }
            const handleMarkerChanges = {
              dragHandlers: {
                onDrag(_index: any, position: any) {
                  circle.setRadius(
                    Cesium.Cartesian3.distance(circle.getCenter(), position)
                  )
                  markers.updateBillboardsPositions(getMarkerPositions())
                },
                onDragEnd() {
                  onEdited()
                },
              },
              tooltip() {
                return 'Drag to change the radius'
              },
            }
            markers.addBillboards(getMarkerPositions(), handleMarkerChanges)
            this._markers = markers
            markers.setOnTop()
          }
          this._editMode = true
        } else {
          if (this._markers != null) {
            this._markers.remove()
            this._markers = null
          }
          this._editMode = false
        }
      }
      circle.setHighlighted = setHighlighted
      enhanceWithListeners(circle)
      circle.setEditMode(true)
    }
  }
  _.DrawHelperWidget = (function () {
    // constructor
    // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
    function _(this: any, this: any, drawHelper: any, options: any) {
      // container must be specified
      if (!Cesium.defined(options.container)) {
        throw new Cesium.DeveloperError('Container is required')
      }
      const drawOptions = {
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
      }
      fillOptions(options, drawOptions)
      const _self = this
      const toolbar = document.createElement('DIV')
      toolbar.className = 'toolbar'
      options.container.appendChild(toolbar)
      function addIcon(_id: any, url: any, title: any, callback: any) {
        const div = document.createElement('DIV')
        div.className = 'button'
        div.title = title
        toolbar.appendChild(div)
        div.onclick = callback
        const span = document.createElement('SPAN')
        div.appendChild(span)
        const image = document.createElement('IMG')
        ;(image as any).src = url
        span.appendChild(image)
        return div
      }
      const scene = drawHelper._scene
      addIcon(
        'marker',
        options.markerIcon,
        'Click to start drawing a 2D marker',
        () => {
          drawHelper.startDrawingMarker({
            callback(position: any) {
              _self.executeListeners({
                name: 'markerCreated',
                position,
              })
            },
          })
        }
      )
      addIcon(
        'polyline',
        options.polylineIcon,
        'Click to start drawing a 2D polyline',
        () => {
          drawHelper.startDrawingPolyline({
            callback(positions: any) {
              _self.executeListeners({
                name: 'polylineCreated',
                positions,
              })
            },
          })
        }
      )
      addIcon(
        'polygon',
        options.polygonIcon,
        'Click to start drawing a 2D polygon',
        () => {
          drawHelper.startDrawingPolygon({
            callback(positions: any) {
              _self.executeListeners({
                name: 'polygonCreated',
                positions,
              })
            },
          })
        }
      )
      addIcon(
        'extent',
        options.extentIcon,
        'Click to start drawing an Extent',
        () => {
          drawHelper.startDrawingExtent({
            callback(extent: any) {
              _self.executeListeners({ name: 'extentCreated', extent })
            },
          })
        }
      )
      addIcon(
        'circle',
        options.circleIcon,
        'Click to start drawing a Circle',
        () => {
          drawHelper.startDrawingCircle({
            callback(center: any, radius: any) {
              _self.executeListeners({
                name: 'circleCreated',
                center,
                radius,
              })
            },
          })
        }
      )
      // add a clear button at the end
      // add a divider first
      let div = document.createElement('DIV')
      div.className = 'divider'
      toolbar.appendChild(div)
      addIcon('clear', options.clearIcon, 'Remove all primitives', () => {
        scene.primitives.removeAll()
      })
      enhanceWithListeners(this)
    }
    return _
  })()
  _.prototype.addToolbar = function (container: any, options: any) {
    options = copyOptions(options, { container })
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    return new _.DrawHelperWidget(this, options)
  }
  function getExtent(mn: any, mx: any) {
    const e = new Cesium.Rectangle()
    // Re-order so west < east and south < north
    e.west = Math.min(mn.longitude, mx.longitude)
    e.east = Math.max(mn.longitude, mx.longitude)
    e.south = Math.min(mn.latitude, mx.latitude)
    e.north = Math.max(mn.latitude, mx.latitude)
    // Check for approx equal (shouldn't require abs due to re-order)
    const epsilon = Cesium.Math.EPSILON7
    if (e.east - e.west < epsilon) {
      e.east += epsilon * 2.0
    }
    if (e.north - e.south < epsilon) {
      e.north += epsilon * 2.0
    }
    return e
  }
  function createTooltip(frameDiv: any) {
    // @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
    const tooltip = function (this: any, this: any, frameDiv: any) {
      const div = document.createElement('DIV')
      div.className = 'twipsy right'
      const arrow = document.createElement('DIV')
      arrow.className = 'twipsy-arrow'
      div.appendChild(arrow)
      const title = document.createElement('DIV')
      title.className = 'twipsy-inner'
      div.appendChild(title)
      this._div = div
      this._title = title
      // add to frame div and display coordinates
      frameDiv.appendChild(div)
    }
    tooltip.prototype.setVisible = function (visible: any) {
      this._div.style.display = visible ? 'block' : 'none'
    }
    tooltip.prototype.showAt = function (position: any, message: any) {
      if (position && message) {
        this.setVisible(true)
        this._title.innerHTML = message
        this._div.style.left = position.x + 10 + 'px'
        this._div.style.top = position.y - this._div.clientHeight / 2 + 'px'
      }
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    return new tooltip(frameDiv)
  }
  function getDisplayLatLngString(cartographic: any, precision: any) {
    return (
      cartographic.longitude.toFixed(precision || 3) +
      ', ' +
      cartographic.latitude.toFixed(precision || 3)
    )
  }
  function clone(from: any, to: any) {
    if (from == null || typeof from != 'object') return from
    if (from.constructor != Object && from.constructor != Array) return from
    if (
      from.constructor == Date ||
      from.constructor == RegExp ||
      from.constructor == Function ||
      from.constructor == String ||
      from.constructor == Number ||
      from.constructor == Boolean
    )
      return new from.constructor(from)
    to = to || new from.constructor()
    for (const name in from) {
      to[name] =
        typeof to[name] == 'undefined' ? clone(from[name], null) : to[name]
    }
    return to
  }
  function fillOptions(options: any, defaultOptions: any) {
    options = options || {}
    let option
    for (option in defaultOptions) {
      if (options[option] === undefined) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        options[option] = clone(defaultOptions[option])
      }
    }
  }
  // shallow copy
  function copyOptions(options: any, defaultOptions: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    let newOptions = clone(options),
      option
    for (option in defaultOptions) {
      if (newOptions[option] === undefined) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        newOptions[option] = clone(defaultOptions[option])
      }
    }
    return newOptions
  }
  function setListener(primitive: any, type: any, callback: any) {
    primitive[type] = callback
  }
  function enhanceWithListeners(element: any) {
    element._listeners = {}
    element.addListener = function (name: any, callback: any) {
      this._listeners[name] = this._listeners[name] || []
      this._listeners[name].push(callback)
      return this._listeners[name].length
    }
    element.executeListeners = function (event: any, defaultCallback: any) {
      if (
        this._listeners[event.name] &&
        this._listeners[event.name].length > 0
      ) {
        let index = 0
        for (; index < this._listeners[event.name].length; index++) {
          this._listeners[event.name][index](event)
        }
      } else {
        if (defaultCallback) {
          defaultCallback(event)
        }
      }
    }
  }
  return _
})()
export default DrawHelper
