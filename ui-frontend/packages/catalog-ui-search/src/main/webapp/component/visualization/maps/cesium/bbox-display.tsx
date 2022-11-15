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
const Cesium = require('cesium')
const _ = require('underscore')
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

const modelToRectangle = ({ model }: { model: any }) => {
  const toRad = Cesium.Math.toRadians
  const obj = model.toJSON()
  _.each(obj, (val: any, key: any) => {
    obj[key] = toRad(val)
  })
  const rectangle = new Cesium.Rectangle()
  if (
    obj.north === undefined ||
    isNaN(obj.north) ||
    obj.south === undefined ||
    isNaN(obj.south) ||
    obj.east === undefined ||
    isNaN(obj.east) ||
    obj.west === undefined ||
    isNaN(obj.west)
  ) {
    return null
  }

  rectangle.north = obj.mapNorth
  rectangle.south = obj.mapSouth
  rectangle.east = obj.mapEast
  rectangle.west = obj.mapWest
  return rectangle
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
  const rectangle = modelToRectangle({ model })
  if (
    !rectangle ||
    [
      rectangle.north,
      rectangle.south,
      rectangle.west,
      rectangle.east,
    ].some((coordinate) => isNaN(coordinate)) ||
    rectangle.north <= rectangle.south ||
    rectangle.east === rectangle.west
  ) {
    return
  }

  const coordinates = [
    [rectangle.east, rectangle.north],
    [rectangle.west, rectangle.north],
    [rectangle.west, rectangle.south],
    [rectangle.east, rectangle.south],
    [rectangle.east, rectangle.north],
  ]

  const color = model.get('color')

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
    positions: Cesium.Cartesian3.fromRadiansArray(_.flatten(coordinates)),
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
          id: model.cid + 'display',
          setDrawnMagnitude,
        })
      }
    }
  }, [model, map])
  useListenTo(
    model,
    'change:mapNorth change:mapSouth change:mapEast change:mapWest',
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

export const CesiumBboxDisplay = ({ map, model }: { map: any; model: any }) => {
  useListenToModel({ map, model })
  React.useEffect(() => {
    return () => {
      if (model && map) {
        removeOldDrawing({ map, id: model.cid + 'display' })
      }
    }
  }, [map, model])
  return <></>
}
