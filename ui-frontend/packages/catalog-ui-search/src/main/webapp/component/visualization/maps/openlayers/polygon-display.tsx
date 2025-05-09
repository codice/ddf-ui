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
import { Coordinate } from 'ol/coordinate'
import { transform as projTransform } from 'ol/proj'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import Feature from 'ol/Feature'
import Style from 'ol/style/Style'
import { Stroke } from 'ol/style'
import Map from 'ol/Map'
import MultiPolygon from 'ol/geom/MultiPolygon'
import Polygon from 'ol/geom/Polygon'
import _ from 'underscore'
import {
  multiLineString,
  buffer,
  bbox,
  polygon as turfPolygon,
  union,
  coordEach,
  featureCollection,
} from '@turf/turf'
import { validateGeo } from '../../../../react-component/utils/validation'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { removeOldDrawing } from './drawing-and-display'
import ShapeUtils from '../../../../js/ShapeUtils'
import { getIdFromModelForDisplay } from '../drawing-and-display'
import { StartupDataStore } from '../../../../js/model/Startup/startup'
import { Translation } from '../interactions.provider'
import { contrastingColor } from '../../../../react-component/location/location-color-selector'
export const translateFromOpenlayersCoordinates = (coords: any) => {
  return coords
    .map((value: any) =>
      value.map((point: any) => {
        const mappedPoint = projTransform(
          [
            DistanceUtils.coordinateRound(point[0]),
            DistanceUtils.coordinateRound(point[1]),
          ],
          StartupDataStore.Configuration.getProjection(),
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
  const setArr = _.uniq(rawCoords)
  if (setArr.length < 3) {
    return
  }
  const coords = setArr.map((item: any) =>
    projTransform(
      [item[0], item[1]],
      'EPSG:4326',
      StartupDataStore.Configuration.getProjection()
    )
  )
  // Ensure that the first and last coordinate are the same
  if (!_.isEqual(coords[0], coords[coords.length - 1])) {
    coords.push(coords[0])
  }
  return [coords]
}
const modelToPolygon = (model: any) => {
  const coords = model.get('polygon')

  if (coords && coords.length === 0) {
    return new MultiPolygon([])
  }

  if (
    coords &&
    coords.length > 0 &&
    coords[0].toString() !== coords[coords.length - 1].toString()
  ) {
    coords.push(coords[0])
  }

  if (
    coords === undefined ||
    validateGeo('polygon', JSON.stringify(coords))?.error
  ) {
    return
  }
  const isMultiPolygon = ShapeUtils.isArray3D(coords)
  const multiPolygon = isMultiPolygon ? coords : [coords]
  const polygons: Coordinate[][][] = []
  multiPolygon.forEach((polygon: any) => {
    const lineString = coordsToLineString(polygon)
    if (lineString) {
      polygons.push(lineString)
    }
  })
  return new MultiPolygon(polygons)
}
const adjustPolygonPoints = (polygon: Polygon) => {
  const extent = polygon.getExtent()
  const lon1 = extent[0]
  const lon2 = extent[2]
  const width = Math.abs(lon1 - lon2)
  if (width > 180) {
    const adjusted = polygon.getCoordinates()
    adjusted.forEach((ring) => {
      ring.forEach((coord) => {
        if (coord[0] < 0) {
          coord[0] += 360
        }
      })
    })
    polygon.setCoordinates(adjusted)
  }
}
const adjustMultiPolygonPoints = (polygons: MultiPolygon) => {
  const adjusted: Coordinate[][][] = []
  polygons.getPolygons().forEach((polygon) => {
    adjustPolygonPoints(polygon)
    adjusted.push(polygon.getCoordinates())
  })
  polygons.setCoordinates(adjusted)
}
export const drawPolygon = ({
  map,
  model,
  polygon,
  id,
  isInteractive,
  translation,
}: {
  map: any
  model: any
  polygon: MultiPolygon
  id: string
  isInteractive?: boolean
  translation?: Translation
}) => {
  if (!polygon) {
    // Handles case where model changes to empty vars and we don't want to draw anymore
    return
  }
  if (translation) {
    polygon.translate(translation.longitude, translation.latitude)
  }
  adjustMultiPolygonPoints(polygon)
  const coordinates = polygon.getCoordinates()
  const bufferWidth =
    DistanceUtils.getDistanceInMeters(
      model.get('polygonBufferWidth'),
      model.get('polygonBufferUnits')
    ) || 1
  const drawnPolygonSegments = coordinates.map((set) => {
    return multiLineString([translateFromOpenlayersCoordinates(set)]).geometry
      .coordinates
  })
  const bufferPolygonSegments = coordinates.map((set) => {
    const polySegment = multiLineString([
      translateFromOpenlayersCoordinates(set),
    ])
    const bufferedSegment = buffer(polySegment, bufferWidth, {
      units: 'meters',
    })
    if (!bufferedSegment) {
      return
    }
    const extent = bbox(bufferedSegment)
    const width = Math.abs(extent[0] - extent[2])
    // need to adjust the points again AFTER buffering, since buffering undoes the antimeridian adjustments
    if (width > 180) {
      coordEach(bufferedSegment, (coord) => {
        if (coord[0] < 0) {
          coord[0] += 360
        }
      })
    }
    const bufferPolygons = bufferedSegment.geometry.coordinates.map(
      (set: any) => {
        return turfPolygon([set])
      }
    )
    return bufferPolygons.reduce(
      (a, b) => union(featureCollection([a, b])),
      bufferPolygons[0]
    )?.geometry.coordinates
  })
  const bufferGeometryRepresentation = new MultiPolygon(
    bufferPolygonSegments as any
  )
  const drawnGeometryRepresentation = new MultiPolygon(
    drawnPolygonSegments as any
  )
  const billboard = new Feature({
    geometry: bufferGeometryRepresentation,
  })
  billboard.setId(id)
  billboard.set('locationId', model.get('locationId'))
  const drawnPolygonFeature = new Feature({
    geometry: drawnGeometryRepresentation,
  })
  const color = model.get('color')
  const bufferPolygonIconStyle = new Style({
    stroke: new Stroke({
      color: isInteractive ? contrastingColor : color ? color : '#914500',
      width: isInteractive ? 6 : 4,
    }),
    zIndex: 1,
  })
  const drawnPolygonIconStyle = new Style({
    stroke: new Stroke({
      color: isInteractive ? contrastingColor : color ? color : '#914500',
      width: isInteractive ? 5 : 3,
      lineDash: [10, 5],
    }),
    zIndex: 0,
  })
  billboard.setStyle(bufferPolygonIconStyle)
  drawnPolygonFeature.setStyle(drawnPolygonIconStyle)
  const vectorSource = new VectorSource({
    features: [billboard, drawnPolygonFeature],
  })
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  })
  const mapRef = map.getMap() as Map
  removeOldDrawing({ map: mapRef, id })
  vectorLayer.set('id', id)
  mapRef.addLayer(vectorLayer)
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
  const polygon = modelToPolygon(model)
  if (polygon !== undefined) {
    drawPolygon({ map, model, polygon, id, isInteractive, translation })
  }
}
const useListenToPolygonModel = ({
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
  isInteractive,
  translation,
}: {
  map: any
  model: any
  isInteractive?: boolean
  translation?: Translation
}) => {
  useListenToPolygonModel({ map, model, isInteractive, translation })
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
