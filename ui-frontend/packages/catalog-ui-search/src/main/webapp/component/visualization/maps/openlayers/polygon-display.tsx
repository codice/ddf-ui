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
import ol from 'openlayers'
const _ = require('underscore')
const properties = require('../../../../js/properties.js')
const Turf = require('@turf/turf')
import { validateGeo } from '../../../../react-component/utils/validation'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { removeOldDrawing } from './drawing-and-display'
import ShapeUtils from '../../../../js/ShapeUtils'

export const translateFromOpenlayersCoordinates = (coords: any) => {
  return coords
    .map((value: any) =>
      value.map((point: any) => {
        const mappedPoint = ol.proj.transform(
          [
            DistanceUtils.coordinateRound(point[0]),
            DistanceUtils.coordinateRound(point[1]),
          ],
          properties.projection,
          'EPSG:4326'
        )
        if (mappedPoint[1] > 90) {
          mappedPoint[1] = 89.9
        } else if (mappedPoint[1] < -90) {
          mappedPoint[1] = -89.9
        }
        return mappedPoint
      })
    )
    .flatten()
}

const coordsToLineString = (rawCoords: any) => {
  const coords = [] as any[]
  const setArr = _.uniq(rawCoords)
  if (setArr.length < 3) {
    return
  }
  setArr.forEach((item: any) => {
    coords.push(
      ol.proj.transform([item[0], item[1]], 'EPSG:4326', properties.projection)
    )
  })

  // Ensure that the first and last coordinate are the same
  if (!_.isEqual(coords[0], coords[coords.length - 1])) {
    coords.push(coords[0])
  }
  return [coords]
}

const modelToPolygon = (model: any) => {
  const coords = model.get('polygon')
  if (
    coords === undefined ||
    validateGeo('polygon', JSON.stringify(coords))?.error
  ) {
    return
  }
  const isMultiPolygon = ShapeUtils.isArray3D(coords)
  const multiPolygon = isMultiPolygon ? coords : [coords]

  const polygons = [] as any[]

  multiPolygon.forEach((polygon: any) => {
    polygons.push(coordsToLineString(polygon))
  })

  return polygons
}

const adjustPoints = (geometries: any) => {
  // Structure of geometries is [geometry, geometry, ... ]
  geometries.forEach((geometry: any, outerIndex: any) => {
    // Structure of geometry is [coordinatePair, coordinatePair, ... ]
    geometry.forEach((_coordinatePair: any, innerIndex: any) => {
      // Structure of coordinatePair is [x, y]
      if (innerIndex + 1 < geometry.length) {
        const east = Number(geometry[innerIndex + 1][0])
        const west = Number(geometry[innerIndex][0])
        if (east - west < -180) {
          geometries[outerIndex][innerIndex + 1][0] = east + 360
        } else if (east - west > 180) {
          geometries[outerIndex][innerIndex][0] = west + 360
        }
      }
    })
    // Ensure that the first and last coordinate are the same
    geometries[outerIndex][0][0] =
      geometries[outerIndex][geometry.length - 1][0]
  })
  return geometries
}

export const drawPolygon = ({
  map,
  model,
  rectangle,
  id,
}: {
  map: any
  model: any
  rectangle: any
  id: string
}) => {
  if (!rectangle) {
    // Handles case where model changes to empty vars and we don't want to draw anymore
    return
  }

  const coordinates = (Array.isArray(rectangle) && rectangle) || [
    rectangle.getCoordinates(),
  ]

  // Structure of coordinates is [geometries, geometries, ... ]
  coordinates.forEach(
    (geometries, index) => (coordinates[index] = adjustPoints(geometries))
  )

  const bufferWidth =
    DistanceUtils.getDistanceInMeters(
      model.get('polygonBufferWidth'),
      model.get('polygonBufferUnits')
    ) || 1

  const drawnPolygonSegments = coordinates.map((set) => {
    return Turf.multiLineString([translateFromOpenlayersCoordinates(set)])
      .geometry.coordinates
  })

  const bufferPolygonSegments = coordinates.map((set) => {
    const polySegment = Turf.multiLineString([
      translateFromOpenlayersCoordinates(set),
    ])
    const bufferPolygons = Turf.buffer(
      polySegment,
      bufferWidth,
      'meters'
    ).geometry.coordinates.map((set: any) => {
      return Turf.polygon([set])
    })
    return Turf.union(...bufferPolygons).geometry.coordinates
  })

  const bufferGeometryRepresentation =
    (bufferPolygonSegments &&
      new ol.geom.MultiPolygon(bufferPolygonSegments)) ||
    coordinates

  const drawnGeometryRepresentation =
    (drawnPolygonSegments && new ol.geom.MultiPolygon(drawnPolygonSegments)) ||
    coordinates

  const billboard = new ol.Feature({
    geometry: bufferGeometryRepresentation,
  })

  billboard.setId(id)

  const drawnPolygonFeature = new ol.Feature({
    geometry: drawnGeometryRepresentation,
  })

  const color = model.get('color')

  const bufferPolygonIconStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: color ? color : '#914500',
      width: 3,
    }),
    zIndex: 1,
  })

  const drawnPolygonIconStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: color ? color : '#914500',
      width: 2,
      lineDash: [10, 5],
    }),
    zIndex: 0,
  })

  billboard.setStyle(bufferPolygonIconStyle)
  drawnPolygonFeature.setStyle(drawnPolygonIconStyle)

  const vectorSource = new ol.source.Vector({
    features: [billboard, drawnPolygonFeature],
  })

  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  })

  const mapRef = map.getMap() as ol.Map

  removeOldDrawing({ map: mapRef, id })
  vectorLayer.set('id', id)
  console.log(id)
  mapRef.addLayer(vectorLayer)
}

const updatePrimitive = ({
  map,
  model,
  id,
}: {
  map: any
  model: any
  id: string
}) => {
  const polygon = modelToPolygon(model)
  // Make sure the current model has width and height before drawing
  if (polygon !== undefined) {
    drawPolygon({ map, model, rectangle: polygon, id })
  }
}

const useListenToPolygonModel = ({ model, map }: { model: any; map: any }) => {
  const callback = React.useMemo(() => {
    return () => {
      if (model && map) {
        updatePrimitive({ map, model, id: model.cid + 'display' })
      }
    }
  }, [model, map])
  useListenTo(
    model,
    'change:polygon change:polygonBufferWidth change:polygonBufferUnits',
    callback
  )
  callback()
}

export const OpenlayersPolygonDisplay = ({
  map,
  model,
}: {
  map: any
  model: any
}) => {
  useListenToPolygonModel({ map, model })
  React.useEffect(() => {
    return () => {
      if (map && model) {
        removeOldDrawing({ map: map.getMap(), id: model.cid + 'display' })
      }
    }
  }, [map, model])
  return <></>
}
