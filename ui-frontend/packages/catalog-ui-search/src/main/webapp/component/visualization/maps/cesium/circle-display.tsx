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
import Cesium from 'cesium/Build/Cesium/Cesium'
import _ from 'underscore'
import * as Turf from '@turf/turf'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { useRender } from '../../../hooks/useRender'
import {
  removeOldDrawing,
  makeOldDrawingNonEditable,
} from './drawing-and-display'
import { getIdFromModelForDisplay } from '../drawing-and-display'
import TurfCircle from '@turf/circle'
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper'
import { contrastingColor } from '../../../../react-component/location/location-color-selector'
import { Translation } from '../interactions.provider'
const toDeg = Cesium.Math.toDegrees

const CAMERA_MAGNITUDE_THRESHOLD = 8000000

type Circle = {
  lon: number
  lat: number
  radius: number
  radiusUnits: string
}

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

const cartesian3ToCircle = (
  center: Cesium.Cartesian3,
  radius: number,
  ellipsoid: Cesium.Ellipsoid
): Circle => {
  const latLon = ellipsoid.cartesianToCartographic(center)
  const lon = toDeg(latLon.longitude)
  const lat = toDeg(latLon.latitude)
  let radiusUnits = 'meters'
  if (radius >= 1000) {
    radius /= 1000
    radiusUnits = 'kilometers'
  }
  return {
    lon: DistanceUtils.coordinateRound(lon),
    lat: DistanceUtils.coordinateRound(lat),
    radius,
    radiusUnits,
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
  onDraw?: (drawingLocation: Circle) => void
  translation?: Translation
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  // if model has been reset

  const modelProp = model.toJSON()
  if (isModelReset({ modelProp })) {
    map.getMap().scene.requestRender()
    return
  }
  modelProp.lat = parseFloat(modelProp.lat)
  modelProp.lon = parseFloat(modelProp.lon)
  if (Number.isNaN(modelProp.lat) || Number.isNaN(modelProp.lon)) {
    map.getMap().scene.requestRender()
    return
  }

  if (translation) {
    modelProp.lon += translation.longitude
    modelProp.lat += translation.latitude
  }

  let primitive

  if (onDraw) {
    primitive = new (DrawHelper.CirclePrimitive as any)({
      center: Cesium.Cartesian3.fromDegrees(modelProp.lon, modelProp.lat),
      radius: DistanceUtils.getDistanceInMeters(
        modelProp.radius,
        modelProp.radiusUnits
      ),
      height: 0,
      id,
      material: Cesium.Material.fromType('Color', {
        color: Cesium.Color.fromAlpha(contrastingColor, 0.2),
      }),
    })
    primitive.setEditable()
    primitive.addListener('onEdited', function (event: any) {
      const circle = cartesian3ToCircle(
        event.center,
        event.radius,
        map.getMap().scene.globe.ellipsoid
      )
      onDraw(circle)
    })
  } else {
    const color = model.get('color')

    const centerPt = Turf.point([modelProp.lon, modelProp.lat])
    const circleToCheck = TurfCircle(
      centerPt,
      DistanceUtils.getDistanceInMeters(
        modelProp.radius,
        modelProp.radiusUnits
      ),
      { units: 'meters', steps: 64 }
    )

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
      positions: Cesium.Cartesian3.fromDegreesArray(
        _.flatten(circleToCheck.geometry.coordinates)
      ),
    })
  }

  primitive.id = id
  primitive.locationId = modelProp.locationId
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
  newCircle,
  onDraw,
  translation,
  isInteractive,
}: {
  model: any
  map: any
  newCircle: Circle | null
  onDraw?: (drawingLocation: Circle) => void
  translation?: Translation
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  const [cameraMagnitude] = useCameraMagnitude({ map })
  const [drawnMagnitude, setDrawnMagnitude] = React.useState(0)
  const callback = React.useMemo(() => {
    return () => {
      if (map) {
        if (newCircle) {
          // Clone the model to display the new circle drawn because we don't
          // want to update the existing model unless the user clicks Apply.
          const newModel = model.clone()
          newModel.set(newCircle)
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
  }, [model, map, newCircle, translation, isInteractive])
  useListenTo(
    model,
    'change:lat change:lon change:radius change:color',
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
  setNewCircle,
  onDraw,
}: {
  map: any
  model: any
  setNewCircle: (newCircle: Circle) => void
  onDraw: (newCircle: Circle) => void
}) => {
  React.useEffect(() => {
    if (map && model) {
      map.getMap().drawHelper[`startDrawingCircle`]({
        callback: (center: Cesium.Cartesian3, radius: number) => {
          const circle = cartesian3ToCircle(
            center,
            radius,
            map.getMap().scene.globe.ellipsoid
          )
          setNewCircle(circle)
          onDraw(circle)
        },
        material: Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromAlpha(contrastingColor, 0.2),
        }),
      })
    }
  }, [map, model])
}

export const CesiumCircleDisplay = ({
  map,
  model,
  onDraw,
  translation,
  isInteractive,
}: {
  map: any
  model: any
  onDraw?: (newCircle: Circle) => void
  translation?: Translation
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  // Use state to store the circle drawn by the user before they click Apply or Cancel.
  // When the user clicks Draw, they are allowed to edit the existing circle (if it
  // exists), or draw a new circle. If they draw a new circle, save it to state then show
  // it instead of the draw model because we don't want to update the draw model
  // unless the user clicks Apply.
  const [newCircle, setNewCircle] = React.useState<Circle | null>(null)
  if (onDraw) {
    useStartMapDrawing({ map, model, setNewCircle, onDraw })
  }
  useListenToModel({
    map,
    model,
    newCircle,
    onDraw,
    translation,
    isInteractive,
  })
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
