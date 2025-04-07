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
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium'
import _ from 'underscore'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { useRender } from '../../../hooks/useRender'
import {
  removeOldDrawing,
  makeOldDrawingNonEditable,
} from './drawing-and-display'
import { getIdFromModelForDisplay } from '../drawing-and-display'
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper'
import DistanceUtils from '../../../../js/DistanceUtils'
import { contrastingColor } from '../../../../react-component/location/location-color-selector'
import { Translation } from '../interactions.provider'
const toDeg = Cesium.Math.toDegrees

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

type BBox = {
  north: number
  south: number
  east: number
  west: number
}

const rectangleToBbox = (rectangle: Cesium.Rectangle): BBox => {
  const north = toDeg(rectangle.north)
  const south = toDeg(rectangle.south)
  const east = toDeg(rectangle.east)
  const west = toDeg(rectangle.west)
  return {
    north: DistanceUtils.coordinateRound(north),
    south: DistanceUtils.coordinateRound(south),
    east: DistanceUtils.coordinateRound(east),
    west: DistanceUtils.coordinateRound(west),
  }
}

const drawGeometry = ({
  model,
  map,
  id,
  onDraw,
  translation,
  isInteractive,
}: {
  model: any
  map: any
  id: any
  setDrawnMagnitude: (number: any) => void
  onDraw?: (drawingLocation: BBox) => void
  translation?: Translation
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  const rectangle = modelToRectangle({ model })
  if (
    !rectangle ||
    [rectangle.north, rectangle.south, rectangle.west, rectangle.east].some(
      (coordinate) => isNaN(coordinate)
    ) ||
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

  if (translation) {
    const longitudeRadians = Cesium.Math.toRadians(translation.longitude)
    const latitudeRadians = Cesium.Math.toRadians(translation.latitude)

    for (const coord of coordinates) {
      coord[0] += longitudeRadians
      coord[1] += latitudeRadians
    }
  }

  let primitive

  if (onDraw) {
    primitive = new (DrawHelper.ExtentPrimitive as any)({
      extent: rectangle,
      height: 0,
      id,
      material: Cesium.Material.fromType('Color', {
        color: Cesium.Color.fromAlpha(contrastingColor, 0.2),
      }),
    })
    primitive.setEditable()
    primitive.addListener('onEdited', function (event: any) {
      const rectangle = event.extent
      const bbox = rectangleToBbox(rectangle)
      onDraw(bbox)
    })
  } else {
    const color = model.get('color')
    primitive = new Cesium.PolylineCollection()
    primitive.add({
      width: isInteractive ? 12 : 8,
      material: Cesium.Material.fromType('PolylineOutline', {
        color: isInteractive
          ? Cesium.Color.fromCssColorString(contrastingColor)
          : color
          ? Cesium.Color.fromCssColorString(color)
          : Cesium.Color.KHAKI,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: isInteractive ? 6 : 4,
      }),
      id: 'userDrawing',
      positions: Cesium.Cartesian3.fromRadiansArray(_.flatten(coordinates)),
    })
  }

  primitive.id = id
  primitive.locationId = model.attributes.locationId
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

const useListenToModel = ({
  model,
  map,
  onDraw,
  newBbox,
  translation,
  isInteractive,
}: {
  model: any
  map: any
  onDraw?: (drawingLocation: BBox) => void
  newBbox: BBox | null
  translation?: Translation
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  const [cameraMagnitude] = useCameraMagnitude({ map })
  const [drawnMagnitude, setDrawnMagnitude] = React.useState(0)
  const callback = React.useMemo(() => {
    return () => {
      if (map) {
        if (newBbox) {
          // Clone the model to display the new bbox drawn because we don't
          // want to update the existing model unless the user clicks Apply.
          const newModel = model.clone()
          newModel.set(newBbox)
          makeOldDrawingNonEditable({
            map,
            id: getIdFromModelForDisplay({ model }),
          })
          drawGeometry({
            map,
            model: newModel,
            id: getIdFromModelForDisplay({ model }),
            setDrawnMagnitude,
            onDraw,
          })
        } else if (model) {
          removeOldDrawing({ map, id: getIdFromModelForDisplay({ model }) })
          drawGeometry({
            map,
            model,
            id: getIdFromModelForDisplay({ model }),
            setDrawnMagnitude,
            onDraw,
            translation,
            isInteractive,
          })
        }
      }
    }
  }, [model, map, newBbox, translation, isInteractive])
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

const useStartMapDrawing = ({
  map,
  model,
  setNewBbox,
  onDraw,
}: {
  map: any
  model: any
  setNewBbox: (newBbox: BBox) => void
  onDraw: (newBbox: BBox) => void
}) => {
  React.useEffect(() => {
    if (map && model) {
      map.getMap().drawHelper[`startDrawingExtent`]({
        callback: (extent: Cesium.Rectangle) => {
          const bbox = rectangleToBbox(extent)
          setNewBbox(bbox)
          onDraw(bbox)
        },
        material: Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromAlpha(contrastingColor, 0.2),
        }),
      })
    }
  }, [map, model])
}

export const CesiumBboxDisplay = ({
  map,
  model,
  onDraw,
  translation,
  isInteractive,
}: {
  map: any
  model: any
  onDraw?: (newBbox: BBox) => void
  translation?: Translation
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  // Use state to store the bbox drawn by the user before they click Apply or Cancel.
  // When the user clicks Draw, they are allowed to edit the existing bbox (if it
  // exists), or draw a new bbox. If they draw a new bbox, save it to state then show
  // it instead of the draw model because we don't want to update the draw model
  // unless the user clicks Apply.
  const [newBbox, setNewBbox] = React.useState<BBox | null>(null)
  if (onDraw) {
    useStartMapDrawing({ map, model, onDraw, setNewBbox })
  }
  useListenToModel({ map, model, onDraw, newBbox, translation, isInteractive })
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
