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
const _ = require('underscore')
const Turf = require('@turf/turf')
import { validateGeo } from '../../../../react-component/utils/validation'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { useRender } from '../../../hooks/useRender'
import { removeOldDrawing } from './drawing-and-display'

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

export const constructLinePrimitive = ({
  coordinates,
  model,
}: {
  coordinates: any
  model: any
}) => {
  const color = model.get('color')

  return {
    width: 8,
    material: Cesium.Material.fromType('PolylineOutline', {
      color: color
        ? Cesium.Color.fromCssColorString(color)
        : Cesium.Color.KHAKI,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 4,
    }),
    id: 'userDrawing',
    positions: Cesium.Cartesian3.fromDegreesArray(_.flatten(coordinates)),
  }
}

export const constructDottedLinePrimitive = ({
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
  let linePoints = json.line
  const lineWidth =
    DistanceUtils.getDistanceInMeters(json.lineWidth, model.get('lineUnits')) ||
    1
  if (
    linePoints === undefined ||
    validateGeo('line', JSON.stringify(linePoints))?.error
  ) {
    map.getMap().scene.requestRender()
    return
  }

  linePoints.forEach((point: any) => {
    point[0] = DistanceUtils.coordinateRound(point[0])
    point[1] = DistanceUtils.coordinateRound(point[1])
  })

  const setArr = _.uniq(linePoints)
  if (setArr.length < 2) {
    return
  }

  const turfLine = Turf.lineString(setArr)
  let bufferedLine = turfLine
  const cameraMagnitude = map.getMap().camera.getMagnitude()
  setDrawnMagnitude(cameraMagnitude)
  if (lineWidth > 100 || cameraMagnitude < CAMERA_MAGNITUDE_THRESHOLD) {
    bufferedLine = Turf.buffer(turfLine, Math.max(lineWidth, 1), 'meters')
  }

  const primitive = new Cesium.PolylineCollection()
  primitive.id = id
  primitive.add(
    constructLinePrimitive({
      coordinates: bufferedLine.geometry.coordinates,
      model,
    })
  )
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
          id: model.cid + 'display',
          setDrawnMagnitude,
        })
      }
    }
  }, [model, map])
  useListenTo(model, 'change:line change:lineWidth change:lineUnits', callback)
  React.useEffect(() => {
    if (map && needsRedraw({ map, drawnMagnitude })) {
      callback()
    }
  }, [cameraMagnitude, drawnMagnitude, callback, map])
  React.useEffect(() => {
    callback()
  }, [callback])
}

export const CesiumLineDisplay = ({ map, model }: { map: any; model: any }) => {
  useListenToLineModel({ map, model })
  React.useEffect(() => {
    return () => {
      if (model && map) {
        removeOldDrawing({ map, id: model.cid + 'display' })
      }
    }
  }, [map, model])
  return <></>
}
