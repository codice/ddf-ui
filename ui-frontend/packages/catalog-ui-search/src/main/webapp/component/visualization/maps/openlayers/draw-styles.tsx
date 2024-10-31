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
import { Openlayers as ol } from './ol-openlayers-adapter'
import Style from 'ol/style/Style'
import Geometry from 'ol/geom/Geometry'
import Polygon from 'ol/geom/Polygon'
import LineString from 'ol/geom/LineString'
import Feature from 'ol/Feature'
import Coordinate from 'ol/coordinate'
import { transparentize } from 'polished'
import { geometry } from 'geospatialdraw'
import { contrastingColor } from '../../../../react-component/location/location-color-selector'

const {
  CIRCLE_BUFFER_PROPERTY_VALUE,
  POLYGON_LINE_BUFFER_PROPERTY_VALUE,
  BUFFER_SHAPE_PROPERTY,
} = geometry

const LINE_WIDTH = 2.5
const POINT_SIZE = 4.5
const SCALE_FACTOR = 1.5

const RENDERER_STYLE = (feature: Feature): Style =>
  new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: feature.get('color'),
      width: LINE_WIDTH,
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 0, 0)',
    }),
    ...(feature.get(BUFFER_SHAPE_PROPERTY) === CIRCLE_BUFFER_PROPERTY_VALUE
      ? {}
      : {
          image: new ol.style.Circle({
            radius: POINT_SIZE,
            fill: new ol.style.Fill({
              color: feature.get('color'),
            }),
          }),
        }),
  })

const CIRCLE_DRAWING_STYLE = (feature: Feature): Style =>
  new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 0, 0, 0)',
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 0, 0)',
    }),
    image: new ol.style.Circle({
      radius: POINT_SIZE,
      fill: new ol.style.Fill({
        color: feature.get('color'),
      }),
    }),
  })

const CIRCLE_BUFFER_PROPERTY_VALUE_DRAWING_STYLE = (feature: Feature): Style =>
  new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: feature.get('color'),
      width: LINE_WIDTH * SCALE_FACTOR,
    }),
    fill: new ol.style.Fill({
      color: transparentize(0.95, feature.get('color') || contrastingColor),
    }),
  })

const GENERIC_DRAWING_STYLE = (feature: Feature): Style[] => [
  new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: feature.get('color'),
      width: LINE_WIDTH * SCALE_FACTOR,
    }),
    fill: new ol.style.Fill({
      color: transparentize(0.95, feature.get('color') || contrastingColor),
    }),
    ...(feature.getGeometry()?.getType() === 'Point' &&
    feature.get('buffer') > 0
      ? {}
      : {
          image: new ol.style.Circle({
            radius: POINT_SIZE * SCALE_FACTOR,
            fill: new ol.style.Fill({
              color: feature.get('color'),
            }),
          }),
        }),
  }),
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: POINT_SIZE,
      fill: new ol.style.Fill({
        color: feature.get('color'),
      }),
    }),
    geometry: (feature): Geometry | undefined => {
      const geometry = feature.getGeometry()
      if (!geometry) return undefined
      let coordinates: Coordinate.Coordinate[] = []
      if (geometry.getType() === 'Polygon') {
        coordinates = (geometry as Polygon).getCoordinates()[0]
      } else if (geometry.getType() === 'LineString') {
        coordinates = (geometry as LineString).getCoordinates()
      }
      return new ol.geom.MultiPoint(coordinates)
    },
  }),
]

const DRAWING_STYLE = (feature: Feature): Style[] | Style => {
  if (feature.getGeometry()?.getType() === 'Circle') {
    return CIRCLE_DRAWING_STYLE(feature)
  } else {
    const bufferShape = feature.get(BUFFER_SHAPE_PROPERTY)
    switch (bufferShape) {
      case POLYGON_LINE_BUFFER_PROPERTY_VALUE:
        return RENDERER_STYLE(feature)
      case CIRCLE_BUFFER_PROPERTY_VALUE:
        return CIRCLE_BUFFER_PROPERTY_VALUE_DRAWING_STYLE(feature)
      default:
        return GENERIC_DRAWING_STYLE(feature)
    }
  }
}

export { RENDERER_STYLE, DRAWING_STYLE }
