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
const Cesium = require('cesium')
const Turf = require('@turf/turf')
import { validateGeo } from '../../../../react-component/utils/validation'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { useRender } from '../../../hooks/useRender'
import { removeOldDrawing } from './drawing-and-display'
import ShapeUtils from '../../../../js/ShapeUtils'
import {
  constructDottedLinePrimitive,
  constructLinePrimitive,
} from './line-display'
import { getIdFromModelForDisplay } from '../drawing-and-display'

const createBufferedPolygonPointsFromModel = ({
  polygonPoints,
  model,
}: {
  polygonPoints: any
  model: any
}) => {
  const width =
    DistanceUtils.getDistanceInMeters(
      model.toJSON().polygonBufferWidth,
      model.get('polygonBufferUnits')
    ) || 1

  return createBufferedPolygonPoints({ polygonPoints, width })
}

const createBufferedPolygonPoints = ({
  polygonPoints,
  width,
}: {
  polygonPoints: any
  width: any
}) => {
  return Turf.buffer(
    Turf.lineString(polygonPoints),
    Math.max(width, 1),
    'meters'
  )
}

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

const drawGeometry = ({
  model,
  map,
  id,
  setDrawnMagnitude,
}: {
  model: any
  map: any
  id: any
  setDrawnMagnitude: (number: any) => void
}) => {
  const json = model.toJSON()
  if (!Array.isArray(json.polygon)) {
    map.getMap().scene.requestRender()
    return
  }
  const isMultiPolygon = ShapeUtils.isArray3D(json.polygon)
  const polygons = isMultiPolygon ? json.polygon : [json.polygon]

  const primitive = new Cesium.PolylineCollection()
  primitive.id = id
  const cameraMagnitude = map.getMap().camera.getMagnitude()
  setDrawnMagnitude(cameraMagnitude)
  ;(polygons || []).forEach((polygonPoints: any) => {
    if (!polygonPoints || polygonPoints.length < 3) {
      return
    }
    if (
      polygonPoints[0].toString() !==
      polygonPoints[polygonPoints.length - 1].toString()
    ) {
      polygonPoints.push(polygonPoints[0])
    }
    if (validateGeo('polygon', JSON.stringify(polygonPoints))?.error) {
      return
    }
    polygonPoints.forEach((point: any) => {
      point[0] = DistanceUtils.coordinateRound(point[0])
      point[1] = DistanceUtils.coordinateRound(point[1])
    })

    const drawnPolygonPoints = createBufferedPolygonPoints({
      polygonPoints,
      width: 1,
    })

    const bufferedPolygonPoints = createBufferedPolygonPointsFromModel({
      polygonPoints,
      model,
    })
    const bufferedPolygons = bufferedPolygonPoints.geometry.coordinates.map(
      (set: any) => Turf.polygon([set])
    )
    const bufferedPolygon = Turf.union(...bufferedPolygons)

    bufferedPolygon.geometry.coordinates.forEach((set: any) =>
      primitive.add(constructLinePrimitive({ coordinates: set, model }))
    )
    drawnPolygonPoints.geometry.coordinates.forEach((set: any) =>
      primitive.add(constructDottedLinePrimitive({ coordinates: set, model }))
    )
  })

  removeOldDrawing({ map, id })
  map.getMap().scene.primitives.add(primitive)
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
    if (map) {
      map.getMap().scene.camera.moveStart.addEventListener(() => {
        setIsMoving(true)
      })
      map.getMap().scene.camera.moveEnd.addEventListener(() => {
        setIsMoving(false)
      })
    }
    return () => {}
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

const useListenToLineModel = ({ model, map }: { model: any; map: any }) => {
  const [cameraMagnitude] = useCameraMagnitude({ map })
  const [drawnMagnitude, setDrawnMagnitude] = React.useState(0)
  const callback = React.useMemo(() => {
    return () => {
      if (map && model) {
        drawGeometry({
          map,
          model,
          id: getIdFromModelForDisplay({ model }),
          setDrawnMagnitude,
        })
      }
    }
  }, [model, map])
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

export const CesiumPolygonDisplay = ({
  map,
  model,
}: {
  map: any
  model: any
}) => {
  useListenToLineModel({ map, model })
  React.useEffect(() => {
    return () => {
      if (model && map) {
        removeOldDrawing({ map, id: getIdFromModelForDisplay({ model }) })
      }
    }
  }, [map, model])
  return <></>
}
