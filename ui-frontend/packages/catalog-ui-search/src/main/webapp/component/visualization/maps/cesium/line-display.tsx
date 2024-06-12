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
import _cloneDeep from 'lodash/cloneDeep'
import * as Turf from '@turf/turf'
import { validateGeo } from '../../../../react-component/utils/validation'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { useRender } from '../../../hooks/useRender'
import { removeOldDrawing, removeOrLockOldDrawing } from './drawing-and-display'
import { getIdFromModelForDisplay } from '../drawing-and-display'
import DrawHelper from '../../../../lib/cesium-drawhelper/DrawHelper'
import utility from './utility'
import { contrastingColor } from '../../../../react-component/location/location-color-selector'
import { Translation } from '../interactions.provider'
const toDeg = Cesium.Math.toDegrees

const CAMERA_MAGNITUDE_THRESHOLD = 8000000

type Line = {
  line: [number, number][]
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

export const constructSolidLinePrimitive = ({
  coordinates,
  model,
  id,
  color,
  buffer,
  isInteractive,
}: {
  coordinates: any
  model: any
  id: string
  color?: string
  buffer?: number
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  const _color = color || model.get('color')

  return {
    width: isInteractive ? 6 : 4,
    material: Cesium.Material.fromType('Color', {
      color: isInteractive
        ? Cesium.Color.fromCssColorString(contrastingColor)
        : _color
        ? Cesium.Color.fromCssColorString(_color)
        : Cesium.Color.KHAKI,
    }),
    id,
    positions: Cesium.Cartesian3.fromDegreesArray(_.flatten(coordinates)),
    buffer,
  }
}

export const constructOutlinedLinePrimitive = ({
  coordinates,
  model,
  id,
  color,
  buffer,
  isInteractive,
}: {
  coordinates: any
  model: any
  id: string
  color?: string
  buffer?: number
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  const _color = color || model.get('color')
  return {
    ...constructSolidLinePrimitive({
      coordinates,
      model,
      id,
      color,
      buffer,
      isInteractive,
    }),
    width: isInteractive ? 12 : 8,
    material: Cesium.Material.fromType('PolylineOutline', {
      color: isInteractive
        ? Cesium.Color.fromCssColorString(contrastingColor)
        : _color
        ? Cesium.Color.fromCssColorString(_color)
        : Cesium.Color.KHAKI,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: isInteractive ? 6 : 4,
    }),
  }
}

export const constructDottedLinePrimitive = ({
  coordinates,
  model,
  isInteractive,
}: {
  coordinates: any
  model: any
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  const color = model.get('color')

  return {
    width: isInteractive ? 3 : 2,
    material: Cesium.Material.fromType('PolylineDash', {
      color: isInteractive
        ? Cesium.Color.fromCssColorString(contrastingColor)
        : color
        ? Cesium.Color.fromCssColorString(color)
        : Cesium.Color.KHAKI,
      dashLength: 20,
      dashPattern: 255,
    }),
    id: 'userDrawing',
    positions: Cesium.Cartesian3.fromDegreesArray(_.flatten(coordinates)),
  }
}

const positionsToLine = (
  positions: Cesium.Cartesian3[],
  ellipsoid: Cesium.Ellipsoid
): Line => {
  return {
    line: positions.map((cartPos) => {
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

const drawGeometry = ({
  model,
  map,
  id,
  setDrawnMagnitude,
  onDraw,
  translation,
  isInteractive,
}: {
  model: any
  map: any
  id: any
  setDrawnMagnitude: (number: any) => void
  onDraw?: (drawingLocation: Line) => void
  translation?: Translation
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  const json = model.toJSON()
  let linePoints = json.line
  if (
    linePoints === undefined ||
    validateGeo('line', JSON.stringify(linePoints))?.error
  ) {
    map.getMap().scene.requestRender()
    return
  }

  // Create a deep copy since we may modify some of these positions for display purposes
  linePoints = _cloneDeep(json.line)

  linePoints.forEach((point: any) => {
    if (translation) {
      point[0] += translation.longitude
      point[1] += translation.latitude
    }
    point[0] = DistanceUtils.coordinateRound(point[0])
    point[1] = DistanceUtils.coordinateRound(point[1])
  })

  const setArr = _.uniq(linePoints)
  if (setArr.length < 2) {
    return
  }

  const turfLine = Turf.lineString(setArr) as
    | Turf.Feature<Turf.LineString>
    | Turf.Feature<Turf.Polygon | Turf.MultiPolygon>
  const lineWidth = DistanceUtils.getDistanceInMeters(
    json.lineWidth,
    model.get('lineUnits')
  )
  const cameraMagnitude = map.getMap().camera.getMagnitude()
  setDrawnMagnitude(cameraMagnitude)

  removeOrLockOldDrawing(Boolean(isInteractive), id, map, model)

  let primitive

  if (onDraw) {
    primitive = new (DrawHelper.PolylinePrimitive as any)(
      constructSolidLinePrimitive({
        coordinates: turfLine.geometry.coordinates,
        model,
        id,
        color: contrastingColor,
        buffer: lineWidth,
      })
    )
    primitive.setEditable()
    primitive.addListener('onEdited', function (event: any) {
      const line = positionsToLine(
        event.positions,
        map.getMap().scene.globe.ellipsoid
      )
      onDraw(line)
    })
  } else {
    let bufferedLine = turfLine
    const isBuffered = lineWidth > 0
    if (isBuffered) {
      utility.adjustGeoCoords(turfLine)
      bufferedLine = Turf.buffer(turfLine, Math.max(lineWidth, 1), {
        units: 'meters',
      })
      if (!bufferedLine) {
        return
      }
      // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
      utility.adjustGeoCoords(bufferedLine)
    }

    primitive = new Cesium.PolylineCollection()
    primitive.id = id
    primitive.locationId = json.locationId
    primitive.add(
      constructOutlinedLinePrimitive({
        coordinates: bufferedLine.geometry.coordinates,
        model,
        id,
        isInteractive,
      })
    )
    primitive.add(
      constructDottedLinePrimitive({
        coordinates: turfLine.geometry.coordinates,
        model,
        isInteractive,
      })
    )
  }

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

const useListenToLineModel = ({
  model,
  map,
  onDraw,
  newLine,
  translation,
  isInteractive,
}: {
  model: any
  map: any
  onDraw?: (drawingLocation: Line) => void
  newLine: Line | null
  translation?: Translation
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  const [cameraMagnitude] = useCameraMagnitude({ map })
  const [drawnMagnitude, setDrawnMagnitude] = React.useState(0)
  const callback = React.useMemo(() => {
    return () => {
      if (map) {
        if (newLine) {
          // Clone the model to display the new line drawn because we don't
          // want to update the existing model unless the user clicks Apply.
          const newModel = model.clone()
          newModel.set(newLine)
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
            translation,
            isInteractive,
          })
        }
      }
    }
  }, [model, map, newLine, translation, isInteractive])
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

const useStartMapDrawing = ({
  map,
  model,
  setNewLine,
  onDraw,
}: {
  map: any
  model: any
  setNewLine: (newLine: Line) => void
  onDraw: (newLine: Line) => void
}) => {
  React.useEffect(() => {
    if (map && model) {
      map.getMap().drawHelper[`startDrawingPolyline`]({
        callback: (positions: Cesium.Cartesian3[]) => {
          const drawnLine = positionsToLine(
            positions,
            map.getMap().scene.globe.ellipsoid
          )
          const line = drawnLine.line
          //this shouldn't ever get hit because the draw library should protect against it, but just in case it does, remove the point
          if (
            line.length > 3 &&
            line[line.length - 1][0] === line[line.length - 2][0] &&
            line[line.length - 1][1] === line[line.length - 2][1]
          ) {
            line.pop()
          }
          setNewLine(drawnLine)
          onDraw(drawnLine)
        },
        material: Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromCssColorString(contrastingColor),
        }),
      })
    }
  }, [map, model])
}

export const CesiumLineDisplay = ({
  map,
  model,
  onDraw,
  translation,
  isInteractive,
}: {
  map: any
  model: any
  onDraw?: (newLine: Line) => void
  translation?: Translation
  isInteractive?: boolean // note: 'interactive' is different from drawing
}) => {
  // Use state to store the line drawn by the user before they click Apply or Cancel.
  // When the user clicks Draw, they are allowed to edit the existing line (if it
  // exists), or draw a new line. If they draw a new line, save it to state then show
  // it instead of the draw model because we don't want to update the draw model
  // unless the user clicks Apply.
  const [newLine, setNewLine] = React.useState<Line | null>(null)
  if (onDraw) {
    useStartMapDrawing({ map, model, onDraw, setNewLine })
  }
  useListenToLineModel({
    map,
    model,
    onDraw,
    newLine,
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
