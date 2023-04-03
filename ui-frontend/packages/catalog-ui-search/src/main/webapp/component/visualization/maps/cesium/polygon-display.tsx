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
import React from 'react'
import DistanceUtils from '../../../../js/DistanceUtils'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium'
import { validateGeo } from '../../../../react-component/utils/validation'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { useRender } from '../../../hooks/useRender'
import { removeOldDrawing } from './drawing-and-display'
import ShapeUtils from '../../../../js/ShapeUtils'
import {
  constructSolidLinePrimitive,
  constructOutlinedLinePrimitive,
} from './line-display'
import { getIdFromModelForDisplay } from '../drawing-and-display'
import * as Turf from '@turf/turf'
import { Position } from '@turf/turf'
import _ from 'underscore'
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper'
import utility from './utility'
const toDeg = Cesium.Math.toDegrees

const polygonFillColor = 'rgba(0,0,255,0.2)'

const CAMERA_MAGNITUDE_THRESHOLD = 8000000

const getCurrentMagnitudeFromMap = ({ map }: { map: any }) => {
  return map.getMap().camera.getMagnitude()
}

const needsRedraw = ({
  map,
  drawnMagnitude,
}: {
  map: any
  drawnMagnitude: any
}) => {
  const currentMagnitude = getCurrentMagnitudeFromMap({ map })

  if (
    currentMagnitude < CAMERA_MAGNITUDE_THRESHOLD &&
    drawnMagnitude > CAMERA_MAGNITUDE_THRESHOLD
  ) {
    return true
  }
  if (
    currentMagnitude > CAMERA_MAGNITUDE_THRESHOLD &&
    drawnMagnitude < CAMERA_MAGNITUDE_THRESHOLD
  ) {
    return true
  }

  return false
}

const constructDottedLinePrimitive = ({
  coordinates,
  model,
}: {
  coordinates: any
  model: any
}) => {
  const color = model.get('color')

  return {
    width: 4,
    material: Cesium.Material.fromType('PolylineDash', {
      color: color
        ? Cesium.Color.fromCssColorString(color)
        : Cesium.Color.KHAKI,
      dashLength: 16.0,
      dashPattern: 7.0,
    }),
    id: 'userDrawing',
    positions: Cesium.Cartesian3.fromDegreesArray(_.flatten(coordinates)),
  }
}

type Polygon = {
  polygon: [number, number][]
}

const positionsToPolygon = (
  positions: Cesium.Cartesian3[],
  ellipsoid: Cesium.Ellipsoid
): Polygon => {
  return {
    polygon: positions.map((cartPos) => {
      const latLon = ellipsoid.cartesianToCartographic(cartPos)
      const lon = toDeg(latLon.longitude)
      const lat = toDeg(latLon.latitude)
      return [
        DistanceUtils.coordinateRound(lon),
        DistanceUtils.coordinateRound(lat),
      ]
    }),
  }
}

const validateAndFixPolygon = (polygonPoints: Position[]): boolean => {
  if (!polygonPoints || polygonPoints.length < 3) {
    return false
  }
  if (
    polygonPoints[0].toString() !==
    polygonPoints[polygonPoints.length - 1].toString()
  ) {
    polygonPoints.push(polygonPoints[0])
  }
  if (validateGeo('polygon', JSON.stringify(polygonPoints))?.error) {
    return false
  }
  polygonPoints.forEach((point: any) => {
    point[0] = DistanceUtils.coordinateRound(point[0])
    point[1] = DistanceUtils.coordinateRound(point[1])
  })
  return true
}

const drawGeometry = ({
  model,
  map,
  id,
  setDrawnMagnitude,
  onDraw,
}: {
  model: any
  map: any
  id: any
  setDrawnMagnitude: (number: any) => void
  onDraw?: (drawingLocation: Polygon) => void
}) => {
  const json = model.toJSON()
  if (!Array.isArray(json.polygon)) {
    map.getMap().scene.requestRender()
    return
  }
  const isMultiPolygon = ShapeUtils.isArray3D(json.polygon)
  // Create a deep copy since we may modify some of these positions for display purposes
  const polygons: Position[][] = JSON.parse(
    JSON.stringify(isMultiPolygon ? json.polygon : [json.polygon])
  )

  const cameraMagnitude = map.getMap().camera.getMagnitude()
  setDrawnMagnitude(cameraMagnitude)

  removeOldDrawing({ map, id })

  const buffer = DistanceUtils.getDistanceInMeters(
    json.polygonBufferWidth,
    model.get('polygonBufferUnits')
  )

  if (onDraw) {
    polygons.forEach((polygonPoints) => {
      if (!validateAndFixPolygon(polygonPoints)) {
        return
      }

      const drawPrimitive = new (DrawHelper.PolygonPrimitive as any)(
        constructSolidLinePrimitive({
          coordinates: polygonPoints,
          model,
          id,
          color: polygonFillColor,
          buffer,
        })
      )
      drawPrimitive.setEditable()
      drawPrimitive.addListener('onEdited', function (event: any) {
        const polygon = positionsToPolygon(
          event.positions,
          map.getMap().scene.globe.ellipsoid
        )
        onDraw(polygon)
      })
      map.getMap().scene.primitives.add(drawPrimitive)
    })
  } else {
    const pc = new Cesium.PolylineCollection()
    pc.id = id
    polygons.forEach((polygonPoints) => {
      if (!validateAndFixPolygon(polygonPoints)) {
        return
      }

      if (buffer > 0) {
        const adjustedPolygon = Turf.polygon([polygonPoints])
        utility.adjustGeoCoords(adjustedPolygon)

        const bufferedPolygonPoints = Turf.buffer(
          adjustedPolygon,
          Math.max(buffer, 1),
          {
            units: 'meters',
          }
        )

        if (!bufferedPolygonPoints) {
          return
        }

        // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
        utility.adjustGeoCoords(bufferedPolygonPoints)

        const bufferedPolygons = bufferedPolygonPoints.geometry.coordinates.map(
          (set) => Turf.polygon([set])
        )

        const bufferedPolygon = bufferedPolygons.reduce(
          (a, b) => Turf.union(a, b),
          bufferedPolygons[0]
        )

        bufferedPolygon?.geometry.coordinates.forEach((coords: any) =>
          pc.add(
            constructOutlinedLinePrimitive({ coordinates: coords, model, id })
          )
        )
        pc.add(
          constructDottedLinePrimitive({ coordinates: polygonPoints, model })
        )
      } else {
        pc.add(
          constructOutlinedLinePrimitive({
            coordinates: polygonPoints,
            model,
            id,
          })
        )
      }
    })

    map.getMap().scene.primitives.add(pc)
  }

  map.getMap().scene.requestRender()
}

const useCameraMagnitude = ({
  map,
}: {
  map: any
}): [number, React.Dispatch<React.SetStateAction<number>>] => {
  const [cameraMagnitude, setCameraMagnitude] = React.useState(0)
  const [isMoving, setIsMoving] = React.useState(false)
  const render = useRender()
  React.useEffect(() => {
    const startListener = () => setIsMoving(true)
    const endListener = () => setIsMoving(false)
    map?.getMap().scene.camera.moveStart.addEventListener(startListener)
    map?.getMap().scene.camera.moveEnd.addEventListener(endListener)
    return () => {
      map?.getMap().scene.camera.moveStart.removeEventListener(startListener)
      map?.getMap().scene.camera.moveEnd.removeEventListener(endListener)
    }
  }, [map])
  React.useEffect(() => {
    if (isMoving) {
      const animationId = window.requestAnimationFrame(() => {
        setCameraMagnitude(getCurrentMagnitudeFromMap({ map }))
      })
      return () => {
        window.cancelAnimationFrame(animationId)
      }
    }
    return () => {}
  }, [isMoving, render])
  return [cameraMagnitude, setCameraMagnitude]
}

const useListenToLineModel = ({
  model,
  map,
  onDraw,
  newPoly,
}: {
  model: any
  map: any
  onDraw?: (drawingLocation: Polygon) => void
  newPoly: Polygon | null
}) => {
  const [cameraMagnitude] = useCameraMagnitude({ map })
  const [drawnMagnitude, setDrawnMagnitude] = React.useState(0)
  const callback = React.useMemo(() => {
    return () => {
      if (map) {
        if (newPoly) {
          // Clone the model to display the new polygon drawn because we don't
          // want to update the existing model unless the user clicks Apply.
          const newModel = model.clone()
          newModel.set(newPoly)
          drawGeometry({
            map,
            model: newModel,
            id: getIdFromModelForDisplay({ model }),
            setDrawnMagnitude,
            onDraw,
          })
        } else if (model) {
          drawGeometry({
            map,
            model,
            id: getIdFromModelForDisplay({ model }),
            setDrawnMagnitude,
            onDraw,
          })
        }
      }
    }
  }, [model, map, newPoly])
  useListenTo(
    model,
    'change:polygon change:polygonBufferWidth change:polygonBufferUnits',
    callback
  )
  React.useEffect(() => {
    if (map && needsRedraw({ map, drawnMagnitude })) {
      callback()
    }
  }, [cameraMagnitude, drawnMagnitude, callback, map])
  React.useEffect(() => {
    callback()
  }, [callback])
}

const useStartMapDrawing = ({
  map,
  model,
  setNewPoly,
  onDraw,
}: {
  map: any
  model: any
  setNewPoly: (newPoly: Polygon) => void
  onDraw: (newPoly: Polygon) => void
}) => {
  React.useEffect(() => {
    if (map && model) {
      const material = Cesium.Material.fromType('Color', {
        color: Cesium.Color.fromCssColorString(polygonFillColor),
      })
      map.getMap().drawHelper[`startDrawingPolygon`]({
        callback: (positions: Cesium.Cartesian3[]) => {
          const drawnPolygon = positionsToPolygon(
            positions,
            map.getMap().scene.globe.ellipsoid
          )
          const polygon = drawnPolygon.polygon
          //this shouldn't ever get hit because the draw library should protect against it, but just in case it does, remove the point
          if (
            polygon.length > 3 &&
            polygon[polygon.length - 1][0] === polygon[polygon.length - 2][0] &&
            polygon[polygon.length - 1][1] === polygon[polygon.length - 2][1]
          ) {
            polygon.pop()
          }
          setNewPoly(drawnPolygon)
          onDraw(drawnPolygon)
        },
        appearance: new Cesium.MaterialAppearance({
          material,
        }),
        material,
      })
    }
    return () => {}
  }, [map, model])
}

export const CesiumPolygonDisplay = ({
  map,
  model,
  onDraw,
}: {
  map: any
  model: any
  onDraw?: (newPoly: Polygon) => void
}) => {
  // Use state to store the polygon drawn by the user before they click Apply or Cancel.
  // When the user clicks Draw, they are allowed to edit the existing polygon (if it
  // exists), or draw a new polygon. If they draw a new polygon, save it to state then show
  // it instead of the draw model because we don't want to update the draw model
  // unless the user clicks Apply.
  const [newPoly, setNewPoly] = React.useState<Polygon | null>(null)
  if (onDraw) {
    useStartMapDrawing({ map, model, setNewPoly, onDraw })
  }
  useListenToLineModel({ map, model, newPoly, onDraw })
  React.useEffect(() => {
    return () => {
      if (model && map) {
        removeOldDrawing({ map, id: getIdFromModelForDisplay({ model }) })
        map.getMap().drawHelper.stopDrawing()
      }
    }
  }, [map, model])
  return <></>
}
