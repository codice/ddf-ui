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
import utility from './utility'
import DrawingUtility from '../DrawingUtility'
import wreqr from '../../../../js/wreqr'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium'
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper'
import {
  CesiumImageryProviderTypes,
  CesiumLayers,
} from '../../../../js/controllers/cesium.layers'
import user from '../../../singletons/user-instance'
import User from '../../../../js/model/User'
import { Drawing } from '../../../singletons/drawing'
import { LazyQueryResult } from '../../../../js/model/LazyQueryResult/LazyQueryResult'
import { ClusterType } from '../react/geometries'
import { StartupDataStore } from '../../../../js/model/Startup/startup'
const defaultColor = '#3c6dd5'
const eyeOffset = new Cesium.Cartesian3(0, 0, 0)
const pixelOffset = new Cesium.Cartesian2(0.0, 0)
const rulerColor = new Cesium.Color(0.31, 0.43, 0.52)
const rulerPointColor = '#506f85'
const rulerLineHeight = 0
Cesium.BingMapsApi.defaultKey = StartupDataStore.Configuration.getBingKey() || 0
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
  setupTerrainProvider(
    viewer,
    StartupDataStore.Configuration.getTerrainProvider()
  )
  return {
    map: viewer,
    requestRenderHandler: requestRender,
  }
}
function determineIdsFromPosition(position: any, map: any) {
  let id, locationId
  const pickedObject = map.scene.pick(position)
  if (pickedObject) {
    id = pickedObject.id
    if (id && id.constructor === Cesium.Entity) {
      id = id.resultId
    }
    locationId = pickedObject.collection?.locationId
  }
  return { id, locationId }
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
    destinationForZoom =
      map.camera.getRectangleCameraCoordinates(destinationForZoom)
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

// https://cesium.com/learn/cesiumjs/ref-doc/Camera.html
export const LookingStraightDownOrientation = {
  heading: 0, // North is up - like compass direction
  pitch: -Cesium.Math.PI_OVER_TWO, // Looking straight down - like a level from up to down
  roll: 0, // No roll - like a level from left to right
}

export default function CesiumMap(
  insertionElement: any,
  selectionInterface: any,
  _notificationEl: any,
  componentElement: any,
  mapModel: any
) {
  let overlays = {}
  let shapes: any = []
  const { map, requestRenderHandler } = createMap(insertionElement)
  const drawHelper = new (DrawHelper as any)(map)
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

  const minimumHeightAboveTerrain = 2
  const exposedMethods = {
    onLeftClick(callback: any) {
      $(map.scene.canvas).on('click', (e) => {
        const boundingRect = map.scene.canvas.getBoundingClientRect()
        const { id } = determineIdsFromPosition(
          {
            x: e.clientX - boundingRect.left,
            y: e.clientY - boundingRect.top,
          },
          map
        )
        callback(e, { mapTarget: id })
      })
    },
    onLeftClickMapAPI(callback: any) {
      let lastClickTime = 0
      let clickTimeout = 0
      map.clickEventHandler = new Cesium.ScreenSpaceEventHandler(map.canvas)
      map.clickEventHandler.setInputAction((e: any) => {
        // On a double-click, Cesium will fire 2 left-click events, too. We will only handle a
        // click if 1) another click did not happen in the last 250 ms, and 2) another click
        // does not happen in the next 250 ms.
        if (clickTimeout > 0) {
          clearTimeout(clickTimeout)
        }
        const currentClickTime = Date.now()
        if (currentClickTime - lastClickTime > 250) {
          clickTimeout = window.setTimeout(() => {
            const { locationId } = determineIdsFromPosition(e.position, map)
            callback(locationId)
          }, 250)
        }
        lastClickTime = currentClickTime
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    clearLeftClickMapAPI() {
      map.clickEventHandler?.destroy()
    },
    onRightClick(callback: any) {
      $(map.scene.canvas).on('contextmenu', (e) => {
        callback(e)
      })
    },
    clearRightClick() {
      $(map.scene.canvas).off('contextmenu')
    },
    onDoubleClick() {
      map.doubleClickEventHandler = new Cesium.ScreenSpaceEventHandler(
        map.canvas
      )
      map.doubleClickEventHandler.setInputAction((e: any) => {
        const { locationId } = determineIdsFromPosition(e.position, map)
        if (locationId) {
          ;(wreqr as any).vent.trigger('location:doubleClick', locationId)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    },
    clearDoubleClick() {
      map.doubleClickEventHandler?.destroy()
    },
    onMouseTrackingForGeoDrag({
      moveFrom,
      down,
      move,
      up,
    }: {
      moveFrom?: Cesium.Cartographic
      down: any
      move: any
      up: any
    }) {
      map.scene.screenSpaceCameraController.enableRotate = false
      map.dragAndDropEventHandler = new Cesium.ScreenSpaceEventHandler(
        map.canvas
      )
      map.dragAndDropEventHandler.setInputAction((e: any) => {
        const { locationId } = determineIdsFromPosition(e.position, map)
        const cartesian = map.scene.camera.pickEllipsoid(
          e.position,
          map.scene.globe.ellipsoid
        )
        const cartographic = Cesium.Cartographic.fromCartesian(
          cartesian,
          map.scene.globe.ellipsoid
        )
        down({ position: cartographic, mapLocationId: locationId })
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
      map.dragAndDropEventHandler.setInputAction((e: any) => {
        const { locationId } = determineIdsFromPosition(e.endPosition, map)
        const cartesian = map.scene.camera.pickEllipsoid(
          e.endPosition,
          map.scene.globe.ellipsoid
        )
        const cartographic = Cesium.Cartographic.fromCartesian(
          cartesian,
          map.scene.globe.ellipsoid
        )
        const translation = moveFrom
          ? {
              longitude: Cesium.Math.toDegrees(
                cartographic.longitude - moveFrom.longitude
              ),
              latitude: Cesium.Math.toDegrees(
                cartographic.latitude - moveFrom.latitude
              ),
            }
          : null
        move({ translation, mapLocationId: locationId })
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      map.dragAndDropEventHandler.setInputAction(
        up,
        Cesium.ScreenSpaceEventType.LEFT_UP
      )
    },
    clearMouseTrackingForGeoDrag() {
      map.scene.screenSpaceCameraController.enableRotate = true
      map.dragAndDropEventHandler?.destroy()
    },
    onMouseTrackingForPopup(
      downCallback: any,
      moveCallback: any,
      upCallback: any
    ) {
      map.screenSpaceEventHandlerForPopupPreview =
        new Cesium.ScreenSpaceEventHandler(map.canvas)
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
        const position = {
          x: e.clientX - boundingRect.left,
          y: e.clientY - boundingRect.top,
        }
        const { id, locationId } = determineIdsFromPosition(position, map)
        callback(e, {
          mapTarget: id,
          mapLocationId: locationId,
        })
      })
    },
    clearMouseMove() {
      $(map.scene.canvas).off('mousemove')
    },
    timeoutIds: [] as number[],
    onCameraMoveStart(callback: any) {
      this.timeoutIds.forEach((timeoutId: any) => {
        window.clearTimeout(timeoutId)
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
          window.setTimeout(() => {
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
    panToShapesExtent({
      duration = 500,
    }: {
      duration?: number // take in milliseconds for normalization with openlayers duration being milliseconds
    } = {}) {
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
          duration: duration / 1000, // change to seconds
          destination: Cesium.Rectangle.fromCartesianArray(actualPositions),
          orientation: LookingStraightDownOrientation,
        })
        return true
      }
      return false
    },
    getCenterPositionOfPrimitiveIds(primitiveIds: string[]) {
      const primitives = map.scene.primitives
      let positions = [] as any[]

      // Iterate over primitives and compute bounding spheres
      for (let i = 0; i < primitives.length; i++) {
        let primitive = primitives.get(i)
        if (primitiveIds.includes(primitive.id)) {
          for (let j = 0; j < primitive.length; j++) {
            let point = primitive.get(j)
            positions = positions.concat(point.positions)
          }
        }
      }

      let boundingSphere = Cesium.BoundingSphere.fromPoints(positions)

      if (
        Cesium.BoundingSphere.equals(
          boundingSphere,
          Cesium.BoundingSphere.fromPoints([]) // empty
        )
      ) {
        throw new Error('No positions to zoom to')
      }

      // here, notice we use flyTo instead of flyToBoundingSphere, as with the latter the orientation can't be controlled in this version and ends up tilted
      // Calculate the position above the center of the bounding sphere
      let radius = boundingSphere.radius
      let center = boundingSphere.center
      let up = Cesium.Cartesian3.clone(center) // Get the up direction from the center of the Earth to the position
      Cesium.Cartesian3.normalize(up, up)

      let position = Cesium.Cartesian3.multiplyByScalar(
        up,
        radius * 2,
        new Cesium.Cartesian3()
      ) // Adjust multiplier for desired altitude
      Cesium.Cartesian3.add(center, position, position) // Move position above the center

      return position
    },
    zoomToIds({
      ids,
      duration = 500,
    }: {
      ids: string[]
      duration?: number // take in milliseconds for normalization with openlayers duration being milliseconds
    }) {
      // use flyTo instead of flyToBoundingSphere, as with the latter the orientation can't be controlled in this version and it ends up tilted
      map.camera.flyTo({
        destination: this.getCenterPositionOfPrimitiveIds(ids),
        orientation: LookingStraightDownOrientation,
        duration: duration / 1000, // change to seconds
      })
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
        const cartesian3CenterOfGeometry =
          utility.calculateCartesian3CenterOfGeometry(result)
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
    addPointWithText(point: any, options: any) {
      const pointObject = convertPointCoordinate(point)
      const cartographicPosition = Cesium.Cartographic.fromDegrees(
        pointObject.longitude,
        pointObject.latitude,
        pointObject.altitude
      )
      let cartesianPosition =
        map.scene.globe.ellipsoid.cartographicToCartesian(cartographicPosition)
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
        badgeOptions: options.badgeOptions,
      })
      billboardRef.partiallySelectedImage = DrawingUtility.getCircleWithText({
        fillColor: options.color,
        text: options.id.length,
        strokeColor: 'black',
        textColor: 'white',
        badgeOptions: options.badgeOptions,
      })
      billboardRef.selectedImage = DrawingUtility.getCircleWithText({
        fillColor: 'orange',
        text: options.id.length,
        strokeColor: 'white',
        textColor: 'white',
        badgeOptions: options.badgeOptions,
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
            cartesianPosition =
              map.scene.globe.ellipsoid.cartographicToCartesian(
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
      const cartesianPosition =
        map.scene.globe.ellipsoid.cartographicToCartesian(cartographicPosition)
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
        badgeOptions: options.badgeOptions,
      })
      billboardRef.selectedImage = DrawingUtility.getPin({
        fillColor: 'orange',
        icon: options.icon,
        badgeOptions: options.badgeOptions,
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
            billboardRef.position =
              map.scene.globe.ellipsoid.cartographicToCartesian(
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
      const cartesianPosition =
        map.scene.globe.ellipsoid.cartographicToCartesian(cartographicPosition)
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
      const cartesian =
        map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(cartPoints)
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
          const positions =
            map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(
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
      let cartesian =
        map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(cartPoints)
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
          cartesian =
            map.scene.globe.ellipsoid.cartographicArrayToCartesianArray(
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
    zoomIn() {
      const cameraPositionCartographic =
        map.scene.globe.ellipsoid.cartesianToCartographic(
          map.scene.camera.position
        )

      const terrainHeight = map.scene.globe.getHeight(
        cameraPositionCartographic
      )

      const heightAboveGround =
        cameraPositionCartographic.height - terrainHeight

      const zoomAmount = heightAboveGround / 2 // basically double the current zoom

      const maxZoomAmount = heightAboveGround - minimumHeightAboveTerrain

      // if the zoom amount is greater than the max zoom amount, zoom to the max zoom amount
      map.scene.camera.zoomIn(Math.min(maxZoomAmount, zoomAmount))
    },
    zoomOut() {
      const cameraPositionCartographic =
        map.scene.globe.ellipsoid.cartesianToCartographic(
          map.scene.camera.position
        )

      const terrainHeight = map.scene.globe.getHeight(
        cameraPositionCartographic
      )

      const heightAboveGround =
        cameraPositionCartographic.height - terrainHeight
      map.scene.camera.zoomOut(heightAboveGround)
    },
    destroy() {
      ;(wreqr as any).vent.off('map:requestRender', requestRenderHandler)
      map.destroy()
    },
  }
  return exposedMethods
}
