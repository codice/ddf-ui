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
import $ from 'jquery'
import _ from 'underscore'
import Map from '../map'
import utility from './utility'
import DrawingUtility from '../DrawingUtility'
import wreqr from '../../../../js/wreqr'
import properties from '../../../../js/properties'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium'
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'cesium-drawhelper/DrawHelper' ... Remove this comment to see the full error message
import DrawHelper from 'cesium-drawhelper/DrawHelper'
import {
  CesiumImageryProviderTypes,
  CesiumLayers,
} from '../../../../js/controllers/cesium.layers'
import user from '../../../singletons/user-instance'
import User from '../../../../js/model/User'
import { Drawing } from '../../../singletons/drawing'
import { LazyQueryResult } from '../../../../js/model/LazyQueryResult/LazyQueryResult'
import { ClusterType } from '../react/geometries'
const defaultColor = '#3c6dd5'
const eyeOffset = new Cesium.Cartesian3(0, 0, 0)
const pixelOffset = new Cesium.Cartesian2(0.0, 0)
const rulerColor = new Cesium.Color(0.31, 0.43, 0.52)
const rulerPointColor = '#506f85'
const rulerLineHeight = 0
Cesium.BingMapsApi.defaultKey = (properties as any).bingKey || 0
const imageryProviderTypes = CesiumImageryProviderTypes
function setupTerrainProvider(viewer: any, terrainProvider: any) {
  if (terrainProvider == null || terrainProvider === undefined) {
    console.info(`Unknown terrain provider configuration.
              Default Cesium terrain provider will be used.`)
    return
  }
  const { type, ...terrainConfig } = terrainProvider
  const TerrainProvider = imageryProviderTypes[type]
  if (TerrainProvider === undefined) {
    console.warn(`
            Unknown terrain provider type: ${type}.
            Default Cesium terrain provider will be used.
        `)
    return
  }
  const defaultCesiumTerrainProvider = viewer.scene.terrainProvider
  const customTerrainProvider = new TerrainProvider(terrainConfig)
  customTerrainProvider.errorEvent.addEventListener(() => {
    console.warn(`
            Issue using terrain provider: ${JSON.stringify({
              type,
              ...terrainConfig,
            })}
            Falling back to default Cesium terrain provider.
        `)
    viewer.scene.terrainProvider = defaultCesiumTerrainProvider
  })
  viewer.scene.terrainProvider = customTerrainProvider
}
function createMap(insertionElement: any) {
  const layerPrefs = user.get('user>preferences>mapLayers')
  ;(User as any).updateMapLayers(layerPrefs)
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
  const layerCollectionController = new CesiumLayers({
    collection: layerPrefs,
  })
  const viewer = layerCollectionController.makeMap({
    element: insertionElement,
    cesiumOptions: {
      sceneMode: Cesium.SceneMode.SCENE3D,
      creditContainer: document.createElement('div'),
      animation: false,
      fullscreenButton: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      infoBox: false,
      //skyBox: false,
      //skyAtmosphere: false,
      baseLayerPicker: false,
      imageryProvider: false,
      mapMode2D: 0,
    },
  })
  const requestRender = () => {
    viewer.scene.requestRender()
  }
  ;(wreqr as any).vent.on('map:requestRender', requestRender)
  // disable right click drag to zoom (context menu instead);
  viewer.scene.screenSpaceCameraController.zoomEventTypes = [
    Cesium.CameraEventType.WHEEL,
    Cesium.CameraEventType.PINCH,
  ]
  viewer.screenSpaceEventHandler.setInputAction(() => {
    if (!Drawing.isDrawing()) {
      $('body').mousedown()
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
  viewer.screenSpaceEventHandler.setInputAction(() => {
    if (!Drawing.isDrawing()) {
      $('body').mousedown()
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_DOWN)
  setupTerrainProvider(viewer, (properties as any).terrainProvider)
  return {
    map: viewer,
    requestRenderHandler: requestRender,
  }
}
function determineIdFromPosition(position: any, map: any) {
  let id
  const pickedObject = map.scene.pick(position)
  if (pickedObject) {
    id = pickedObject.id
    if (id && id.constructor === Cesium.Entity) {
      id = id.resultId
    }
  }
  return id
}
function expandRectangle(rectangle: any) {
  const scalingFactor = 0.05
  let widthGap = Math.abs(rectangle.east) - Math.abs(rectangle.west)
  let heightGap = Math.abs(rectangle.north) - Math.abs(rectangle.south)
  //ensure rectangle has some size
  if (widthGap === 0) {
    widthGap = 1
  }
  if (heightGap === 0) {
    heightGap = 1
  }
  rectangle.east = rectangle.east + Math.abs(scalingFactor * widthGap)
  rectangle.north = rectangle.north + Math.abs(scalingFactor * heightGap)
  rectangle.south = rectangle.south - Math.abs(scalingFactor * heightGap)
  rectangle.west = rectangle.west - Math.abs(scalingFactor * widthGap)
  return rectangle
}
function getDestinationForVisiblePan(rectangle: any, map: any) {
  let destinationForZoom = expandRectangle(rectangle)
  if (map.scene.mode === Cesium.SceneMode.SCENE3D) {
    destinationForZoom = map.camera.getRectangleCameraCoordinates(
      destinationForZoom
    )
  }
  return destinationForZoom
}
function determineCesiumColor(color: any) {
  return !_.isUndefined(color)
    ? Cesium.Color.fromCssColorString(color)
    : Cesium.Color.fromCssColorString(defaultColor)
}
function convertPointCoordinate(coordinate: any) {
  return {
    latitude: coordinate[1],
    longitude: coordinate[0],
    altitude: coordinate[2],
  }
}
function isNotVisible(cartesian3CenterOfGeometry: any, occluder: any) {
  return !occluder.isPointVisible(cartesian3CenterOfGeometry)
}
// @ts-expect-error ts-migrate(6133) FIXME: 'notificationEl' is declared but its value is neve... Remove this comment to see the full error message
export default function CesiumMap(
  insertionElement: any,
  selectionInterface: any,
  notificationEl: any,
  componentElement: any,
  mapModel: any
) {
  let overlays = {}
  let shapes: any = []
  const { map, requestRenderHandler } = createMap(insertionElement)
  const drawHelper = new DrawHelper(map)
  map.drawHelper = drawHelper
  const billboardCollection = setupBillboardCollection()
  const labelCollection = setupLabelCollection()
  setupTooltip(map, selectionInterface)
  function updateCoordinatesTooltip(position: any) {
    const cartesian = map.camera.pickEllipsoid(
      position,
      map.scene.globe.ellipsoid
    )
    if (Cesium.defined(cartesian)) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      mapModel.updateMouseCoordinates({
        lat: cartographic.latitude * Cesium.Math.DEGREES_PER_RADIAN,
        lon: cartographic.longitude * Cesium.Math.DEGREES_PER_RADIAN,
      })
    } else {
      mapModel.clearMouseCoordinates()
    }
  }
  // @ts-expect-error ts-migrate(6133) FIXME: 'selectionInterface' is declared but its value is ... Remove this comment to see the full error message
  function setupTooltip(map: any, selectionInterface: any) {
    const handler = new Cesium.ScreenSpaceEventHandler(map.scene.canvas)
    handler.setInputAction((movement: any) => {
      $(componentElement).removeClass('has-feature')
      if (map.scene.mode === Cesium.SceneMode.MORPHING) {
        return
      }
      updateCoordinatesTooltip(movement.endPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }
  function setupBillboardCollection() {
    const billboardCollection = new Cesium.BillboardCollection()
    map.scene.primitives.add(billboardCollection)
    return billboardCollection
  }
  function setupLabelCollection() {
    const labelCollection = new Cesium.LabelCollection()
    map.scene.primitives.add(labelCollection)
    return labelCollection
  }
  /*
   * Returns a visible label that is in the same location as the provided label (geometryInstance) if one exists.
   * If findSelected is true, the function will also check for hidden labels in the same location but are selected.
   */
  function findOverlappingLabel(findSelected: any, geometry: any) {
    return _.find(
      mapModel.get('labels'),
      (label) =>
        label.position.x === geometry.position.x &&
        label.position.y === geometry.position.y &&
        ((findSelected && label.isSelected) || label.show)
    )
  }
  /*
        Only shows one label if there are multiple labels in the same location.
  
        Show the label in the following importance:
          - it is selected and the existing label is not
          - there is no other label displayed at the same location
          - it is the label that was found by findOverlappingLabel
  
        Arguments are:
          - the label to show/hide
          - if the label is selected
          - if the search for overlapping label should include hidden selected labels
        */
  function showHideLabel({ geometry, findSelected = false }: any) {
    const isSelected = geometry.isSelected
    const labelWithSamePosition = findOverlappingLabel(findSelected, geometry)
    if (
      isSelected &&
      labelWithSamePosition &&
      !labelWithSamePosition.isSelected
    ) {
      labelWithSamePosition.show = false
    }
    const otherLabelNotSelected = labelWithSamePosition
      ? !labelWithSamePosition.isSelected
      : true
    geometry.show =
      (isSelected && otherLabelNotSelected) ||
      !labelWithSamePosition ||
      geometry.id === labelWithSamePosition.id
  }
  /*
        Shows a hidden label. Used when deleting a label that is shown.
        */
  function showHiddenLabel(geometry: any) {
    if (!geometry.show) {
      return
    }
    const hiddenLabel = _.find(
      mapModel.get('labels'),
      (label) =>
        label.position.x === geometry.position.x &&
        label.position.y === geometry.position.y &&
        label.id !== geometry.id &&
        !label.show
    )
    if (hiddenLabel) {
      hiddenLabel.show = true
    }
  }
  const exposedMethods = _.extend({}, Map, {
    onLeftClick(callback: any) {
      $(map.scene.canvas).on('click', (e) => {
        const boundingRect = map.scene.canvas.getBoundingClientRect()
        callback(e, {
          mapTarget: determineIdFromPosition(
            {
              x: e.clientX - boundingRect.left,
              y: e.clientY - boundingRect.top,
            },
            map
          ),
        })
      })
    },
    onRightClick(callback: any) {
      $(map.scene.canvas).on('contextmenu', (e) => {
        callback(e)
      })
    },
    onMouseTrackingForPopup(
      downCallback: any,
      moveCallback: any,
      upCallback: any
    ) {
      map.screenSpaceEventHandlerForPopupPreview = new Cesium.ScreenSpaceEventHandler(
        map.canvas
      )
      map.screenSpaceEventHandlerForPopupPreview.setInputAction(() => {
        downCallback()
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
      map.screenSpaceEventHandlerForPopupPreview.setInputAction(() => {
        moveCallback()
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      this.onLeftClick(upCallback)
    },
    onMouseMove(callback: any) {
      $(map.scene.canvas).on('mousemove', (e) => {
        const boundingRect = map.scene.canvas.getBoundingClientRect()
        callback(e, {
          mapTarget: determineIdFromPosition(
            {
              x: e.clientX - boundingRect.left,
              y: e.clientY - boundingRect.top,
            },
            map
          ),
        })
      })
    },
    timeoutIds: [],
    onCameraMoveStart(callback: any) {
      clearTimeout(this.timeoutId)
      this.timeoutIds.forEach((timeoutId: any) => {
        clearTimeout(timeoutId)
      })
      this.timeoutIds = []
      map.scene.camera.moveStart.addEventListener(callback)
    },
    offCameraMoveStart(callback: any) {
      map.scene.camera.moveStart.removeEventListener(callback)
    },
    onCameraMoveEnd(callback: any) {
      const timeoutCallback = () => {
        this.timeoutIds.push(
          setTimeout(() => {
            callback()
          }, 300)
        )
      }
      map.scene.camera.moveEnd.addEventListener(timeoutCallback)
    },
    offCameraMoveEnd(callback: any) {
      map.scene.camera.moveEnd.removeEventListener(callback)
    },
    doPanZoom(coords: any) {
      if (coords.length === 0) {
        return
      }
      const cartArray = coords.map((coord: any) =>
        Cesium.Cartographic.fromDegrees(
          coord[0],
          coord[1],
          map.camera._positionCartographic.height
        )
      )
      if (cartArray.length === 1) {
        const point = Cesium.Ellipsoid.WGS84.cartographicToCartesian(
          cartArray[0]
        )
        this.panToCoordinate(point, 2.0)
      } else {
        const rectangle = Cesium.Rectangle.fromCartographicArray(cartArray)
        this.panToRectangle(rectangle, {
          duration: 2.0,
          correction: 1.0,
        })
      }
    },
    panToResults(results: any) {
      let rectangle, cartArray, point
      cartArray = _.flatten(
        results
          .filter((result: any) => result.hasGeometry())
          .map(
            (result: any) =>
              _.map(result.getPoints('location'), (coordinate) =>
                Cesium.Cartographic.fromDegrees(
                  coordinate[0],
                  coordinate[1],
                  map.camera._positionCartographic.height
                )
              ),
            true
          )
      )
      if (cartArray.length > 0) {
        if (cartArray.length === 1) {
          point = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartArray[0])
          this.panToCoordinate(point)
        } else {
          rectangle = Cesium.Rectangle.fromCartographicArray(cartArray)
          this.panToRectangle(rectangle)
        }
      }
    },
    panToCoordinate(coords: any, duration = 0.5) {
      map.scene.camera.flyTo({
        duration,
        destination: coords,
      })
    },
    panToExtent() {},
    panToShapesExtent() {
      const currentPrimitives = map.scene.primitives._primitives.filter(
        (prim: any) => prim.id
      )
      const actualPositions = currentPrimitives.reduce(
        (blob: any, prim: any) => {
          return blob.concat(
            prim._polylines.reduce((subblob: any, polyline: any) => {
              return subblob.concat(polyline._actualPositions)
            }, [])
          )
        },
        []
      )
      if (actualPositions.length > 0) {
        map.scene.camera.flyTo({
          duration: 0.5,
          destination: Cesium.Rectangle.fromCartesianArray(actualPositions),
          orientation: {
            heading: map.scene.camera.heading,
            pitch: map.scene.camera.pitch,
            roll: map.scene.camera.roll,
          },
        })
        return true
      }
      return false
    },
    panToRectangle(
      rectangle: any,
      opts = {
        duration: 0.5,
        correction: 0.25,
      }
    ) {
      map.scene.camera.flyTo({
        duration: opts.duration,
        destination: getDestinationForVisiblePan(rectangle, map),
        complete() {
          map.scene.camera.flyTo({
            duration: opts.correction,
            destination: getDestinationForVisiblePan(rectangle, map),
          })
        },
      })
    },
    getShapes() {
      return shapes
    },
    zoomToExtent() {},
    zoomToBoundingBox({ north, south, east, west }: any) {
      map.scene.camera.flyTo({
        duration: 0.5,
        destination: Cesium.Rectangle.fromDegrees(west, south, east, north),
      })
    },
    getBoundingBox() {
      const viewRectangle = map.scene.camera.computeViewRectangle()
      return _.mapObject(viewRectangle, (val) => Cesium.Math.toDegrees(val))
    },
    overlayImage(model: LazyQueryResult) {
      const metacardId = model.plain.id
      this.removeOverlay(metacardId)
      const coords = model.getPoints('location')
      const cartographics = _.map(coords, (coord) => {
        coord = convertPointCoordinate(coord)
        return Cesium.Cartographic.fromDegrees(
          coord.longitude,
          coord.latitude,
          coord.altitude
        )
      })
      const rectangle = Cesium.Rectangle.fromCartographicArray(cartographics)
      const overlayLayer = map.scene.imageryLayers.addImageryProvider(
        new Cesium.SingleTileImageryProvider({
          url: model.currentOverlayUrl,
          rectangle,
        })
      )
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      overlays[metacardId] = overlayLayer
    },
    removeOverlay(metacardId: any) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      if (overlays[metacardId]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        map.scene.imageryLayers.remove(overlays[metacardId])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        delete overlays[metacardId]
      }
    },
    removeAllOverlays() {
      for (const overlay in overlays) {
        if (overlays.hasOwnProperty(overlay)) {
          // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          map.scene.imageryLayers.remove(overlays[overlay])
        }
      }
      overlays = {}
    },
    getCartographicCenterOfClusterInDegrees(cluster: ClusterType) {
      return utility.calculateCartographicCenterOfGeometriesInDegrees(
        cluster.results
      )
    },
    getWindowLocationsOfResults(results: LazyQueryResult[]) {
      let occluder: any
      if (map.scene.mode === Cesium.SceneMode.SCENE3D) {
        occluder = new Cesium.EllipsoidalOccluder(
          Cesium.Ellipsoid.WGS84,
          map.scene.camera.position
        )
      }
      return results.map((result) => {
        const cartesian3CenterOfGeometry = utility.calculateCartesian3CenterOfGeometry(
          result
        )
        if (occluder && isNotVisible(cartesian3CenterOfGeometry, occluder)) {
          return undefined
        }
        const center = utility.calculateWindowCenterOfGeometry(
          cartesian3CenterOfGeometry,
          map
        )
        if (center) {
          return [center.x, center.y]
        } else {
          return undefined
        }
      })
    },
    /*
     * Draws a marker on the map designating a start/end point for the ruler measurement. The given
     * coordinates should be an object with 'lat' and 'lon' keys with degrees values. The given
     * marker label should be a single character or digit that is displayed on the map marker.
     */
    addRulerPoint(coordinates: any) {
      const { lat, lon } = coordinates
      // a point requires an altitude value so just use 0
      const point = [lon, lat, 0]
      const options = {
        id: ' ',
        title: `Selected ruler coordinate`,
        image: DrawingUtility.getCircle({
          fillColor: rulerPointColor,
          icon: null,
        }),
        view: this,
      }
      return this.addPoint(point, options)
    },
    /*
     * Removes the given Billboard from the map.
     */
    removeRulerPoint(billboardRef: any) {
      billboardCollection.remove(billboardRef)
      map.scene.requestRender()
    },
    /*
     * Draws a line on the map between the points in the given array of points.
     */
    addRulerLine(point: any) {
      let startingCoordinates = mapModel.get('startingCoordinates')
      // creates an array of Cartesian3 points
      // a PolylineGeometry allows the line to follow the curvature of the surface
      map.coordArray = [
        startingCoordinates['lon'],
        startingCoordinates['lat'],
        rulerLineHeight,
        point['lon'],
        point['lat'],
        rulerLineHeight,
      ]
      return map.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            return Cesium.Cartesian3.fromDegreesArrayHeights(map.coordArray)
          }, false),
          width: 5,
          show: true,
          material: rulerColor,
        },
      })
    },
    /*
     * Update the position of the ruler line
     */
    setRulerLine(point: any) {
      let startingCoordinates = mapModel.get('startingCoordinates')
      map.coordArray = [
        startingCoordinates['lon'],
        startingCoordinates['lat'],
        rulerLineHeight,
        point['lon'],
        point['lat'],
        rulerLineHeight,
      ]
      map.scene.requestRender()
    },
    /*
     * Removes the given polyline entity from the map.
     */
    removeRulerLine(polyline: any) {
      map.entities.remove(polyline)
      map.scene.requestRender()
    },
    /*
                Adds a billboard point utilizing the passed in point and options.
                Options are a view to relate to, and an id, and a color.
              */
    // @ts-expect-error ts-migrate(6133) FIXME: 'useCustomText' is declared but its value is never... Remove this comment to see the full error message
    addPointWithText(point: any, options: any, useCustomText = false) {
      const pointObject = convertPointCoordinate(point)
      const cartographicPosition = Cesium.Cartographic.fromDegrees(
        pointObject.longitude,
        pointObject.latitude,
        pointObject.altitude
      )
      let cartesianPosition = map.scene.globe.ellipsoid.cartographicToCartesian(
        cartographicPosition
      )
      const billboardRef = billboardCollection.add({
        image: undefined,
        position: cartesianPosition,
        id: options.id,
        eyeOffset,
      })
      billboardRef.unselectedImage = DrawingUtility.getCircleWithText({
        fillColor: options.color,
        text: options.id.length,
        strokeColor: 'white',
        textColor: 'white',
      })
      billboardRef.partiallySelectedImage = DrawingUtility.getCircleWithText({
        fillColor: options.color,
        text: options.id.length,
        strokeColor: 'black',
        textColor: 'white',
      })
      billboardRef.selectedImage = DrawingUtility.getCircleWithText({
        fillColor: options.color,
        text: options.id.length,
        strokeColor: 'black',
        textColor: 'black',
      })
      switch (options.isSelected) {
        case 'selected':
          billboardRef.image = billboardRef.selectedImage
          break
        case 'partially':
          billboardRef.image = billboardRef.partiallySelectedImage
          break
        case 'unselected':
          billboardRef.image = billboardRef.unselectedImage
          break
      }
      //if there is a terrain provider and no altitude has been specified, sample it from the configured terrain provider
      if (!pointObject.altitude && map.scene.terrainProvider) {
        const promise = Cesium.sampleTerrain(map.scene.terrainProvider, 5, [
          cartographicPosition,
        ])
        Cesium.when(promise, (updatedCartographic: any) => {
          if (updatedCartographic[0].height && !options.view.isDestroyed) {
            cartesianPosition = map.scene.globe.ellipsoid.cartographicToCartesian(
              updatedCartographic[0]
            )
            billboardRef.position = cartesianPosition
          }
        })
      }
      map.scene.requestRender()
      return billboardRef
    },
    /*
              Adds a billboard point utilizing the passed in point and options.
              Options are a view to relate to, and an id, and a color.
              */
    addPoint(point: any, options: any) {
      const pointObject = convertPointCoordinate(point)
      const cartographicPosition = Cesium.Cartographic.fromDegrees(
        pointObject.longitude,
        pointObject.latitude,
        pointObject.altitude
      )
      const cartesianPosition = map.scene.globe.ellipsoid.cartographicToCartesian(
        cartographicPosition
      )
      const billboardRef = billboardCollection.add({
        image: undefined,
        position: cartesianPosition,
        id: options.id,
        eyeOffset,
        pixelOffset,
        verticalOrigin: options.useVerticalOrigin
          ? Cesium.VerticalOrigin.BOTTOM
          : undefined,
        horizontalOrigin: options.useHorizontalOrigin
          ? Cesium.HorizontalOrigin.CENTER
          : undefined,
        view: options.view,
      })
      billboardRef.unselectedImage = DrawingUtility.getPin({
        fillColor: options.color,
        icon: options.icon,
      })
      billboardRef.selectedImage = DrawingUtility.getPin({
        fillColor: options.color,
        strokeColor: 'black',
        icon: options.icon,
      })
      billboardRef.image = options.isSelected
        ? billboardRef.selectedImage
        : billboardRef.unselectedImage
      //if there is a terrain provider and no altitude has been specified, sample it from the configured terrain provider
      if (!pointObject.altitude && map.scene.terrainProvider) {
        const promise = Cesium.sampleTerrain(map.scene.terrainProvider, 5, [
          cartographicPosition,
        ])
        Cesium.when(promise, (updatedCartographic: any) => {
          if (updatedCartographic[0].height && !options.view.isDestroyed) {
            billboardRef.position = map.scene.globe.ellipsoid.cartographicToCartesian(
              updatedCartographic[0]
            )
          }
        })
      }
      map.scene.requestRender()
      return billboardRef
    },
    /*
              Adds a label utilizing the passed in point and options.
              Options are a view to an id and text.
            */
    addLabel(point: any, options: any) {
      const pointObject = convertPointCoordinate(point)
      const cartographicPosition = Cesium.Cartographic.fromDegrees(
        pointObject.longitude,
        pointObject.latitude,
        pointObject.altitude
      )
      const cartesianPosition = map.scene.globe.ellipsoid.cartographicToCartesian(
        cartographicPosition
      )
      // X, Y offset values for the label
      const offset = new Cesium.Cartesian2(20, -15)
      // Cesium measurement for determining how to render the size of the label based on zoom
      const scaleZoom = new Cesium.NearFarScalar(1.5e4, 1.0, 8.0e6, 0.0)
      // Cesium measurement for determining how to render the translucency of the label based on zoom
      const translucencyZoom = new Cesium.NearFarScalar(1.5e6, 1.0, 8.0e6, 0.0)
      const labelRef = labelCollection.add({
        text: options.text,
        position: cartesianPosition,
        id: options.id,
        pixelOffset: offset,
        scale: 1.0,
        scaleByDistance: scaleZoom,
        translucencyByDistance: translucencyZoom,
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 10,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      })
      mapModel.addLabel(labelRef)
      return labelRef
    },
    /*
              Adds a polyline utilizing the passed in line and options.
              Options are a view to relate to, and an id, and a color.
            */
    addLine(line: any, options: any) {
      const lineObject = line.map((coordinate: any) =>
        convertPointCoordinate(coordinate)
      )
      const cartPoints = _.map(lineObject, (point) =>
        Cesium.Cartographic.fromDegrees(
          point.longitude,
          point.latitude,
          point.altitude
        )
      )
      const cartesian = map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(
        cartPoints
      )
      const polylineCollection = new Cesium.PolylineCollection()
      polylineCollection.unselectedMaterial = Cesium.Material.fromType(
        'PolylineOutline',
        {
          color: determineCesiumColor(options.color),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 4,
        }
      )
      polylineCollection.selectedMaterial = Cesium.Material.fromType(
        'PolylineOutline',
        {
          color: determineCesiumColor(options.color),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 4,
        }
      )
      const polyline = polylineCollection.add({
        width: 8,
        material: options.isSelected
          ? polylineCollection.selectedMaterial
          : polylineCollection.unselectedMaterial,
        id: options.id,
        positions: cartesian,
      })
      if (map.scene.terrainProvider) {
        const promise = Cesium.sampleTerrain(
          map.scene.terrainProvider,
          5,
          cartPoints
        )
        Cesium.when(promise, (updatedCartographic: any) => {
          const positions = map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(
            updatedCartographic
          )
          if (updatedCartographic[0].height && !options.view.isDestroyed) {
            polyline.positions = positions
          }
        })
      }
      map.scene.primitives.add(polylineCollection)
      return polylineCollection
    },
    /*
              Adds a polygon fill utilizing the passed in polygon and options.
              Options are a view to relate to, and an id.
            */
    addPolygon(polygon: any, options: any) {
      const polygonObject = polygon.map((coordinate: any) =>
        convertPointCoordinate(coordinate)
      )
      const cartPoints = _.map(polygonObject, (point) =>
        Cesium.Cartographic.fromDegrees(
          point.longitude,
          point.latitude,
          point.altitude
        )
      )
      let cartesian = map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(
        cartPoints
      )
      const unselectedPolygonRef = map.entities.add({
        polygon: {
          hierarchy: cartesian,
          material: new Cesium.GridMaterialProperty({
            color: Cesium.Color.WHITE,
            cellAlpha: 0.0,
            lineCount: new Cesium.Cartesian2(2, 2),
            lineThickness: new Cesium.Cartesian2(2.0, 2.0),
            lineOffset: new Cesium.Cartesian2(0.0, 0.0),
          }),
          perPositionHeight: true,
        },
        show: true,
        resultId: options.id,
        showWhenSelected: false,
      })
      const selectedPolygonRef = map.entities.add({
        polygon: {
          hierarchy: cartesian,
          material: new Cesium.GridMaterialProperty({
            color: Cesium.Color.BLACK,
            cellAlpha: 0.0,
            lineCount: new Cesium.Cartesian2(2, 2),
            lineThickness: new Cesium.Cartesian2(2.0, 2.0),
            lineOffset: new Cesium.Cartesian2(0.0, 0.0),
          }),
          perPositionHeight: true,
        },
        show: false,
        resultId: options.id,
        showWhenSelected: true,
      })
      if (map.scene.terrainProvider) {
        const promise = Cesium.sampleTerrain(
          map.scene.terrainProvider,
          5,
          cartPoints
        )
        Cesium.when(promise, (updatedCartographic: any) => {
          cartesian = map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(
            updatedCartographic
          )
          if (updatedCartographic[0].height && !options.view.isDestroyed) {
            unselectedPolygonRef.polygon.hierarchy.setValue(cartesian)
            selectedPolygonRef.polygon.hierarchy.setValue(cartesian)
          }
        })
      }
      return [unselectedPolygonRef, selectedPolygonRef]
    },
    /*
             Updates a passed in geometry to reflect whether or not it is selected.
             Options passed in are color and isSelected.
            */
    updateCluster(geometry: any, options: any) {
      if (geometry.constructor === Array) {
        geometry.forEach((innerGeometry) => {
          this.updateCluster(innerGeometry, options)
        })
      }
      if (geometry.constructor === Cesium.Billboard) {
        switch (options.isSelected) {
          case 'selected':
            geometry.image = geometry.selectedImage
            break
          case 'partially':
            geometry.image = geometry.partiallySelectedImage
            break
          case 'unselected':
            geometry.image = geometry.unselectedImage
            break
        }
        const isSelected = options.isSelected !== 'unselected'
        geometry.eyeOffset = new Cesium.Cartesian3(0, 0, isSelected ? -1 : 0)
      } else if (geometry.constructor === Cesium.PolylineCollection) {
        geometry._polylines.forEach((polyline: any) => {
          polyline.material = Cesium.Material.fromType('PolylineOutline', {
            color: determineCesiumColor('rgba(0,0,0, .1)'),
            outlineColor: determineCesiumColor('rgba(255,255,255, .1)'),
            outlineWidth: 4,
          })
        })
      } else if (geometry.showWhenSelected) {
        geometry.show = options.isSelected
      } else {
        geometry.show = !options.isSelected
      }
      map.scene.requestRender()
    },
    /*
              Updates a passed in geometry to reflect whether or not it is selected.
              Options passed in are color and isSelected.
              */
    updateGeometry(geometry: any, options: any) {
      if (geometry.constructor === Array) {
        geometry.forEach((innerGeometry) => {
          this.updateGeometry(innerGeometry, options)
        })
      }
      if (geometry.constructor === Cesium.Billboard) {
        geometry.image = options.isSelected
          ? geometry.selectedImage
          : geometry.unselectedImage
        geometry.eyeOffset = new Cesium.Cartesian3(
          0,
          0,
          options.isSelected ? -1 : 0
        )
      } else if (geometry.constructor === Cesium.Label) {
        geometry.isSelected = options.isSelected
        showHideLabel({
          geometry,
        })
      } else if (geometry.constructor === Cesium.PolylineCollection) {
        geometry._polylines.forEach((polyline: any) => {
          polyline.material = options.isSelected
            ? geometry.selectedMaterial
            : geometry.unselectedMaterial
        })
      } else if (geometry.showWhenSelected) {
        geometry.show = options.isSelected
      } else {
        geometry.show = !options.isSelected
      }
      map.scene.requestRender()
    },
    /*
             Updates a passed in geometry to be hidden
             */
    hideGeometry(geometry: any) {
      if (
        geometry.constructor === Cesium.Billboard ||
        geometry.constructor === Cesium.Label
      ) {
        geometry.show = false
      } else if (geometry.constructor === Cesium.PolylineCollection) {
        geometry._polylines.forEach((polyline: any) => {
          polyline.show = false
        })
      }
    },
    /*
             Updates a passed in geometry to be shown
             */
    showGeometry(geometry: any) {
      if (geometry.constructor === Cesium.Billboard) {
        geometry.show = true
      } else if (geometry.constructor === Cesium.Label) {
        showHideLabel({
          geometry,
          findSelected: true,
        })
      } else if (geometry.constructor === Cesium.PolylineCollection) {
        geometry._polylines.forEach((polyline: any) => {
          polyline.show = true
        })
      }
      map.scene.requestRender()
    },
    removeGeometry(geometry: any) {
      billboardCollection.remove(geometry)
      labelCollection.remove(geometry)
      map.scene.primitives.remove(geometry)
      //unminified cesium chokes if you feed a geometry with id as an Array
      if (geometry.constructor === Cesium.Entity) {
        map.entities.remove(geometry)
      }
      if (geometry.constructor === Cesium.Label) {
        mapModel.removeLabel(geometry)
        showHiddenLabel(geometry)
      }
      map.scene.requestRender()
    },
    destroyShapes() {
      // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'shape' implicitly has an 'any' type.
      shapes.forEach((shape) => {
        shape.destroy()
      })
      shapes = []
      if (map && map.scene) {
        map.scene.requestRender()
      }
    },
    getMap() {
      return map
    },
    destroy() {
      ;(wreqr as any).vent.off('map:requestRender', requestRenderHandler)
      map.destroy()
    },
  })
  return exposedMethods
}
