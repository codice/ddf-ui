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
import { Openlayers as ol } from './ol-openlayers-adapter'
import MultiLineString from 'ol/geom/MultiLineString'
import LineString from 'ol/geom/LineString'
import Map from 'ol/Map'
import { Coordinate } from 'ol/coordinate'
import _ from 'underscore'
import * as Turf from '@turf/turf'
import { validateGeo } from '../../../../react-component/utils/validation'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { removeOldDrawing } from './drawing-and-display'
import { getIdFromModelForDisplay } from '../drawing-and-display'
import { StartupDataStore } from '../../../../js/model/Startup/startup'
import { contrastingColor } from '../../../../react-component/location/location-color-selector'
import { Translation } from '../interactions.provider'

export function translateFromOpenlayersCoordinates(coords: Coordinate[]) {
  const coordinates = [] as Coordinate[]
  coords.forEach((point) => {
    point = ol.proj.transform(
      [
        DistanceUtils.coordinateRound(point[0]),
        DistanceUtils.coordinateRound(point[1]),
      ],
      StartupDataStore.Configuration.getProjection(),
      'EPSG:4326'
    )
    if (point[1] > 90) {
      point[1] = 89.9
    } else if (point[1] < -90) {
      point[1] = -89.9
    }
    coordinates.push(point)
  })
  return coordinates
}
export function translateToOpenlayersCoordinates(coords: Coordinate[]) {
  const coordinates = [] as Coordinate[]
  coords.forEach((item) => {
    if (Array.isArray(item[0])) {
      coordinates.push(
        translateToOpenlayersCoordinates(
          item as unknown as Coordinate[]
        ) as unknown as Coordinate
      )
    } else {
      coordinates.push(
        ol.proj.transform(
          [item[0], item[1]],
          'EPSG:4326',
          StartupDataStore.Configuration.getProjection()
        )
      )
    }
  })
  return coordinates
}
const modelToLineString = (model: any) => {
  const line = model.get('line')
  const setArr = _.uniq(line)
  if (setArr.length < 2) {
    return
  }
  return new ol.geom.LineString(translateToOpenlayersCoordinates(setArr))
}
const adjustLinePoints = (line: LineString) => {
  const extent = line.getExtent()
  const lon1 = extent[0]
  const lon2 = extent[2]
  const width = Math.abs(lon2 - lon1)
  if (width > 180) {
    const adjusted = line.getCoordinates()
    adjusted.forEach((coord) => {
      if (coord[0] < 0) {
        coord[0] += 360
      }
    })
    line.setCoordinates(adjusted)
  }
}
const adjustMultiLinePoints = (lines: MultiLineString) => {
  const adjusted: Coordinate[][] = []
  lines.getLineStrings().forEach((line) => {
    adjustLinePoints(line)
    adjusted.push(line.getCoordinates())
  })
  lines.setCoordinates(adjusted)
}
export const drawLine = ({
  map,
  model,
  line,
  id,
  isInteractive,
  translation,
}: {
  map: any
  model: any
  line: LineString
  id: string
  isInteractive?: boolean
  translation?: Translation
}) => {
  if (!line) {
    // Handles case where model changes to empty vars and we don't want to draw anymore
    return
  }
  const lineWidth =
    DistanceUtils.getDistanceInMeters(
      model.get('lineWidth'),
      model.get('lineUnits')
    ) || 1
  if (translation) {
    line.translate(translation.longitude, translation.latitude)
  }
  adjustLinePoints(line)
  const turfLine = Turf.lineString(
    translateFromOpenlayersCoordinates(line.getCoordinates())
  )
  const bufferedLine = Turf.buffer(turfLine, lineWidth, { units: 'meters' })
  if (!bufferedLine) {
    return
  }
  const geometryRepresentation = new ol.geom.MultiLineString(
    translateToOpenlayersCoordinates(
      bufferedLine.geometry.coordinates as any
    ) as unknown as any
  )
  const drawnGeometryRepresentation = new ol.geom.LineString(
    translateToOpenlayersCoordinates(
      turfLine.geometry.coordinates as any
    ) as unknown as any
  )
  // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
  adjustMultiLinePoints(geometryRepresentation)
  const billboard = new ol.Feature({
    geometry: geometryRepresentation,
  })
  billboard.setId(id)
  billboard.set('locationId', model.get('locationId'))
  const drawnLineFeature = new ol.Feature({
    geometry: drawnGeometryRepresentation,
  })
  const color = model.get('color')
  const iconStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: isInteractive ? contrastingColor : color ? color : '#914500',
      width: isInteractive ? 6 : 4,
    }),
  })
  const drawnLineIconStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: isInteractive ? contrastingColor : color ? color : '#914500',
      width: 2,
      lineDash: [10, 5],
    }),
  })
  billboard.setStyle(iconStyle)
  drawnLineFeature.setStyle(drawnLineIconStyle)
  const vectorSource = new ol.source.Vector({
    features: [billboard, drawnLineFeature],
  })
  let vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  })
  vectorLayer.set('id', id)
  const mapRef = map.getMap() as Map
  removeOldDrawing({ map: mapRef, id })
  map.getMap().addLayer(vectorLayer)
}
const updatePrimitive = ({
  map,
  model,
  id,
  isInteractive,
  translation,
}: {
  map: any
  model: any
  id: string
  isInteractive?: boolean
  translation?: Translation
}) => {
  const line = modelToLineString(model)
  // Make sure the current model has width and height before drawing
  if (
    line !== undefined &&
    !validateGeo('line', JSON.stringify(line.getCoordinates()))?.error
  ) {
    drawLine({ map, model, line, id, isInteractive, translation })
  }
}
const useListenToLineModel = ({
  model,
  map,
  isInteractive,
  translation,
}: {
  model: any
  map: any
  isInteractive?: boolean
  translation?: Translation
}) => {
  const callback = React.useMemo(() => {
    return () => {
      if (model && map) {
        updatePrimitive({
          map,
          model,
          id: getIdFromModelForDisplay({ model }),
          isInteractive,
          translation,
        })
      }
    }
  }, [model, map, isInteractive, translation])
  useListenTo(model, 'change:line change:lineWidth change:lineUnits', callback)
  callback()
}
export const OpenlayersLineDisplay = ({
  map,
  model,
  isInteractive,
  translation,
}: {
  map: any
  model: any
  isInteractive?: boolean
  translation?: Translation
}) => {
  useListenToLineModel({ map, model, isInteractive, translation })
  React.useEffect(() => {
    return () => {
      if (map && model) {
        removeOldDrawing({
          map: map.getMap(),
          id: getIdFromModelForDisplay({ model }),
        })
      }
    }
  }, [map, model])
  return <></>
}
