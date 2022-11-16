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
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { useRender } from '../../../hooks/useRender'
import { removeOldDrawing } from './drawing-and-display'
import { getIdFromModelForDisplay } from '../drawing-and-display'
const TurfCircle = require('@turf/circle')

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

const defaultAttrs = ['lat', 'lon', 'radius']

const isModelReset = ({ modelProp }: { modelProp: any }) => {
  if (
    _.every(defaultAttrs, (val: any) => _.isUndefined(modelProp[val])) ||
    _.isEmpty(modelProp)
  ) {
    return true
  }
  return false
}

const drawGeometry = ({
  model,
  map,
  id,
}: {
  model: any
  map: any
  id: any
  setDrawnMagnitude: (number: any) => void
}) => {
  // if model has been reset

  const modelProp = model.toJSON()
  if (
    isModelReset({ modelProp }) ||
    typeof modelProp.lat !== 'number' ||
    Number.isNaN(modelProp.lat) ||
    typeof modelProp.lon !== 'number' ||
    Number.isNaN(modelProp.lon)
  ) {
    map.getMap().scene.requestRender()
    return
  }

  const color = model.get('color')

  const centerPt = Turf.point([modelProp.lon, modelProp.lat])
  const circleToCheck = new TurfCircle(
    centerPt,
    DistanceUtils.getDistanceInMeters(modelProp.radius, modelProp.radiusUnits),
    64,
    'meters'
  )

  const primitive = new Cesium.PolylineCollection()
  primitive.add({
    width: 8,
    material: Cesium.Material.fromType('PolylineOutline', {
      color: color
        ? Cesium.Color.fromCssColorString(color)
        : Cesium.Color.KHAKI,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 4,
    }),
    id: 'userDrawing',
    positions: Cesium.Cartesian3.fromDegreesArray(
      _.flatten(circleToCheck.geometry.coordinates)
    ),
  })

  primitive.id = id
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

const useListenToModel = ({ model, map }: { model: any; map: any }) => {
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
  useListenTo(model, 'change:lat change:lon change:radius', callback)
  React.useEffect(() => {
    if (map && needsRedraw({ map, drawnMagnitude })) {
      callback()
    }
  }, [cameraMagnitude, drawnMagnitude, callback, map])
  React.useEffect(() => {
    callback()
  }, [callback])
}

export const CesiumCircleDisplay = ({
  map,
  model,
}: {
  map: any
  model: any
}) => {
  useListenToModel({ map, model })
  React.useEffect(() => {
    return () => {
      if (model && map) {
        removeOldDrawing({ map, id: getIdFromModelForDisplay({ model }) })
      }
    }
  }, [map, model])
  return <></>
}
