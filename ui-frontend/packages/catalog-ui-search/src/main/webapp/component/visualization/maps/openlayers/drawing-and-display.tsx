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
import { useState, useEffect } from 'react'
import {
  getDrawModeFromModel,
  useDrawingAndDisplayModels,
  DrawModeType,
} from '../drawing-and-display'
import { OpenlayersBboxDisplay } from './bbox-display'
import { OpenlayersCircleDisplay } from './circle-display'
import { OpenlayersLineDisplay } from './line-display'
import { OpenlayersPolygonDisplay } from './polygon-display'
import styled from 'styled-components'
import { menu, geometry } from 'geospatialdraw'
import { Shape } from 'geospatialdraw/target/webapp/shape-utils'
import {
  GeometryJSON,
  makeGeometry,
  makePointRadiusGeo,
  makeLineGeo,
  makeBBoxGeo,
} from 'geospatialdraw/target/webapp/geometry'
import { transparentize } from 'polished'
import * as ol from 'openlayers'
import Common from '../../../../js/Common'
import wreqr from '../../../../js/wreqr'
import { Drawing } from '../../../../component/singletons/drawing'
import * as Turf from '@turf/turf'
import { Position, Point, Polygon, LineString } from '@turf/turf'
import { validateGeo } from '../../../../react-component/utils/validation'
import ShapeUtils from '../../../../js/ShapeUtils'
import _ from 'lodash'

// TODO should move all the common code to ddf-ui and have downstream import it

const Editor = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 38px;
  z-index: 1;
  > div:first-of-type {
    flex-wrap: wrap;
    > div:nth-of-type(2) {
      flex-wrap: wrap;
      width: 100%;
      background: inherit;
    }
  }
`

const DrawingMenu = menu.DrawingMenu
const makeEmptyGeometry = geometry.makeEmptyGeometry

const SHAPES: Shape[] = [
  'Bounding Box',
  'Line',
  'Point',
  'Point Radius',
  'Polygon',
]

const LINE_WIDTH = 2.5
const POINT_SIZE = 4.5
const SCALE_FACTOR = 1.5

const {
  CIRCLE_BUFFER_PROPERTY_VALUE,
  POLYGON_LINE_BUFFER_PROPERTY_VALUE,
  BUFFER_SHAPE_PROPERTY,
} = geometry

const CIRCLE_DRAWING_STYLE = (feature: ol.Feature): ol.style.Style =>
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

const CIRCLE_BUFFER_PROPERTY_VALUE_DRAWING_STYLE = (
  feature: ol.Feature
): ol.style.Style =>
  new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: feature.get('color'),
      width: LINE_WIDTH * SCALE_FACTOR,
    }),
    fill: new ol.style.Fill({
      color: transparentize(0.95, feature.get('color') || 'blue'),
    }),
  })

const GENERIC_DRAWING_STYLE = (feature: ol.Feature): ol.style.Style[] => [
  new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: feature.get('color'),
      width: LINE_WIDTH * SCALE_FACTOR,
    }),
    fill: new ol.style.Fill({
      color: transparentize(0.95, feature.get('color') || 'blue'),
    }),
    ...(feature.getGeometry().getType() === 'Point' && feature.get('buffer') > 0
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
    geometry: (feature: ol.Feature): ol.geom.Geometry => {
      const geometry = feature.getGeometry()
      let coordinates: [number, number][] = []
      if (geometry.getType() === 'Polygon') {
        coordinates = (geometry as ol.geom.Polygon).getCoordinates()[0]
      } else if (geometry.getType() === 'LineString') {
        coordinates = (geometry as ol.geom.LineString).getCoordinates()
      }
      return new ol.geom.MultiPoint(coordinates)
    },
  }),
]

const RENDERER_STYLE = (feature: ol.Feature): ol.style.Style =>
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

const DRAWING_STYLE = (
  feature: ol.Feature
): ol.style.Style[] | ol.style.Style => {
  if (feature.getGeometry().getType() === 'Circle') {
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

const DEFAULT_SHAPE = 'Polygon'
const DRAWING_COLOR = 'blue'

export const removeOldDrawing = ({ map, id }: { map: ol.Map; id: string }) => {
  const oldLayers = map
    .getLayers()
    .getArray()
    .filter((layer) => {
      return layer.get('id') === id
    })
  oldLayers.forEach((layer) => {
    map.removeLayer(layer)
  })
}

const getShapeFromDrawMode = (drawMode: DrawModeType): Shape => {
  switch (drawMode) {
    case 'bbox':
      return 'Bounding Box'
    case 'circle':
      return 'Point Radius'
    case 'line':
      return 'Line'
    case 'poly':
    default:
      return 'Polygon'
  }
}

const getDrawModeFromShape = (shape: Shape): DrawModeType => {
  switch (shape) {
    case 'Bounding Box':
      return 'bbox'
    case 'Point':
    case 'Point Radius':
      return 'circle'
    case 'Line':
      return 'line'
    case 'Polygon':
    default:
      return 'poly'
  }
}

// see generateAnyGeoFilter in CQLUtils.ts for types
const getGeoType = (geo: GeometryJSON) => {
  switch (geo.properties.shape) {
    case 'Line':
      return 'LINE'
    case 'Point':
      return 'POINT'
    case 'Point Radius':
      return 'POINTRADIUS'
    default:
      return 'POLYGON'
  }
}

const createPolygonModel = (geo: GeometryJSON) => {
  // Ignore Z coordinate if exists
  const polygon = (geo.geometry as Polygon).coordinates[0].map((position) =>
    position.length > 2 ? position.slice(0, 2) : position
  )
  return {
    polygon: Common.wrapMapCoordinatesArray(polygon as any).map((coords) =>
      coords.map((coord) => Number(coord.toFixed(6)))
    ),
    polygonBufferWidth: geo.properties.buffer?.toString() || '0',
    polygonBufferUnits: geo.properties.bufferUnit,
  }
}

const createLineStringModel = (geo: GeometryJSON) => {
  // Ignore Z coordinate if exists
  const line = (geo.geometry as LineString).coordinates.map((position) =>
    position.length > 2 ? position.slice(0, 2) : position
  )
  return {
    line: Common.wrapMapCoordinatesArray(line as any).map((coords) =>
      coords.map((coord) => Number(coord.toFixed(6)))
    ),
    lineWidth: geo.properties.buffer?.toString() || '0',
    lineUnits: geo.properties.bufferUnit,
  }
}

const createPointRadiusModel = (geo: GeometryJSON) => {
  const wrapped = Common.wrapMapCoordinatesArray([
    (geo.geometry as Point).coordinates,
  ] as any)
  return {
    lon: Number(wrapped[0][0].toFixed(6)),
    lat: Number(wrapped[0][1].toFixed(6)),
    radius: geo.properties.buffer?.toString() || '1',
    radiusUnits: geo.properties.bufferUnit,
  }
}

const createBoundingBoxModel = (geo: GeometryJSON) => {
  // bbox order: west, south, east, north
  const wrapped = Common.wrapMapCoordinatesArray([
    [geo.bbox[0], geo.bbox[1]],
    [geo.bbox[2], geo.bbox[3]],
  ])
  return {
    west: Number(wrapped[0][0].toFixed(6)),
    south: Number(wrapped[0][1].toFixed(6)),
    east: Number(wrapped[1][0].toFixed(6)),
    north: Number(wrapped[1][1].toFixed(6)),
  }
}

const createGeoModel = (geo: GeometryJSON) => {
  switch (geo.properties.shape) {
    case 'Polygon':
      return createPolygonModel(geo)
    case 'Line':
      return createLineStringModel(geo)
    case 'Point':
    case 'Point Radius':
      return createPointRadiusModel(geo)
    case 'Bounding Box':
      return createBoundingBoxModel(geo)
    default:
      return {}
  }
}

const modelToPolygon = (model: any): GeometryJSON | null => {
  const coords = model.get('polygon')
  if (
    coords === undefined ||
    validateGeo('polygon', JSON.stringify(coords))?.error
  ) {
    return null
  }
  const isMultiPolygon = ShapeUtils.isArray3D(coords)
  const polygon = isMultiPolygon ? coords : [coords]
  const buffer = model.get('polygonBufferWidth')
  const bufferUnit = model.get('polygonBufferUnits')
  return makeGeometry(
    Common.generateUUID(),
    Turf.polygon(polygon).geometry,
    DRAWING_COLOR,
    'Polygon',
    buffer ? parseInt(buffer) : undefined,
    bufferUnit || undefined
  )
}

const modelToLine = (model: any): GeometryJSON | null => {
  const coords = model.get('line')
  if (
    coords === undefined ||
    validateGeo('line', JSON.stringify(coords))?.error
  ) {
    return null
  }
  const buffer = model.get('lineWidth')
  const bufferUnit = model.get('lineUnits')
  return makeLineGeo(
    Common.generateUUID(),
    coords,
    buffer ? parseInt(buffer) : 0,
    bufferUnit || 'meters'
  )
}

const modelToPointRadius = (model: any): GeometryJSON | null => {
  const lon = model.get('lon')
  const lat = model.get('lat')
  if (lon === undefined || lat === undefined) {
    return null
  }
  const radius = model.get('radius')
  const radiusUnits = model.get('radiusUnits')
  return makePointRadiusGeo(
    Common.generateUUID(),
    lat,
    lon,
    radius ? parseInt(radius) : 1,
    radiusUnits || 'meters'
  )
}

const modelToBoundingBox = (model: any): GeometryJSON | null => {
  const west = model.get('west')
  const south = model.get('south')
  const east = model.get('east')
  const north = model.get('north')
  if (
    west === undefined ||
    south === undefined ||
    east === undefined ||
    north === undefined
  ) {
    return null
  }
  return makeBBoxGeo(Common.generateUUID(), [west, south, east, north])
}

const adjustGeoCoords = (geo: GeometryJSON) => {
  const geometry = geo.geometry
  const width = Math.abs(geo.bbox[0] - geo.bbox[2])
  const crossesAntiMeridian = width > 180
  switch (geo.properties.shape) {
    case 'Point':
      const pointCoords = [(geometry as Point).coordinates]
      if (crossesAntiMeridian) {
        geometry.coordinates = convertCoordsToDisplay(pointCoords)[0]
      }
      break
    case 'Line':
      const lineStringCoords = (geometry as LineString).coordinates
      if (crossesAntiMeridian) {
        geometry.coordinates = convertCoordsToDisplay(lineStringCoords)
      }
      break
    case 'Bounding Box':
    case 'Polygon':
      const coords = (geometry as Polygon).coordinates[0]
      if (crossesAntiMeridian) {
        geometry.coordinates[0] = convertCoordsToDisplay(coords)
      }
      break
  }
}

const convertCoordsToDisplay = (coordinates: Position[]) => {
  const coords = _.cloneDeep(coordinates)
  coords.forEach((coord) => {
    if (coord[0] < 0) {
      coord[0] += 360
    }
  })
  return coords
}

const getDrawingGeometryFromModel = (model: any): GeometryJSON | null => {
  const mode = model.get('mode')
  let geo
  switch (mode) {
    case 'bbox':
      geo = modelToBoundingBox(model)
      break
    case 'circle':
      geo = modelToPointRadius(model)
      break
    case 'line':
      geo = modelToLine(model)
      break
    case 'poly':
      geo = modelToPolygon(model)
      break
    default:
      return null
  }
  if (geo) {
    adjustGeoCoords(geo)
  }
  return geo
}

// This is not a piece of state because the geospatialdraw
// library rerenders bounding boxes unnecessarily
// If this was state, the resulting rerenders would
// break bounding boxes in the updateGeo method
let drawingLocation: GeometryJSON | null = makeEmptyGeometry(
  Common.generateUUID(),
  DEFAULT_SHAPE
)

export const OpenlayersDrawings = ({
  map,
  selectionInterface,
}: {
  map: any
  selectionInterface: any
}) => {
  const { models, filterModels, drawingModels } = useDrawingAndDisplayModels({
    selectionInterface,
    map,
  })

  const [drawingModel] =
    drawingModels.length > 0 ? drawingModels.slice(-1) : [undefined]

  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingShape, setDrawingShape] = useState<Shape>(DEFAULT_SHAPE)
  const [drawingGeometry, setDrawingGeometry] = useState<GeometryJSON | null>(
    null
  )

  useEffect(() => {
    setIsDrawing(!!drawingModel)
    if (drawingModel) {
      setDrawingShape(
        getShapeFromDrawMode(getDrawModeFromModel({ model: drawingModel }))
      )
      setDrawingGeometry(getDrawingGeometryFromModel(drawingModel))
    }
  }, [drawingModel])

  const cancelDrawing = () => {
    drawingModel.set('drawing', false)
    // the listener for this calls Drawing.turnOffDrawing()
    wreqr.vent.trigger('search:drawcancel', drawingModel)
    setIsDrawing(false)
    setDrawingShape(DEFAULT_SHAPE)
    setDrawingGeometry(null)
    drawingLocation = null
  }

  const convertToModel = (geo: GeometryJSON) => {
    return {
      ...createGeoModel(geo),
      type: getGeoType(geo),
      mode: getDrawModeFromShape(drawingShape),
    }
  }

  // called when the user clicks apply during geo drawing
  const finishDrawing = () => {
    if (drawingLocation === null) {
      cancelDrawing()
      return
    }
    wreqr.vent.trigger(
      `search:${getDrawModeFromShape(drawingShape)}-end`,
      drawingModel
    )
    Drawing.turnOffDrawing()
    drawingModel.set('drawing', false)
    drawingModel.set(convertToModel(drawingLocation))
    setIsDrawing(false)
    setDrawingGeometry(drawingLocation)
    drawingLocation = null
  }

  // called during drawing at random intervals
  const updateGeo = (geo: GeometryJSON) => {
    drawingLocation = geo
  }

  return (
    <>
      {filterModels.map((model) => {
        const drawMode = getDrawModeFromModel({ model })
        switch (drawMode) {
          case 'bbox':
            return (
              <OpenlayersBboxDisplay key={model.cid} model={model} map={map} />
            )
          case 'circle':
            return (
              <OpenlayersCircleDisplay
                key={model.cid}
                model={model}
                map={map}
              />
            )
          case 'line':
            return (
              <OpenlayersLineDisplay key={model.cid} model={model} map={map} />
            )
          case 'poly':
            return (
              <OpenlayersPolygonDisplay
                key={model.cid}
                model={model}
                map={map}
              />
            )
          default:
            return (
              <OpenlayersPolygonDisplay
                key={model.cid}
                model={model}
                map={map}
              />
            )
        }
      })}
      {models.map((model) => {
        const drawMode = getDrawModeFromModel({ model })
        switch (drawMode) {
          case 'bbox':
            return (
              <OpenlayersBboxDisplay key={model.cid} model={model} map={map} />
            )
          case 'circle':
            return (
              <OpenlayersCircleDisplay
                key={model.cid}
                model={model}
                map={map}
              />
            )
          case 'line':
            return (
              <OpenlayersLineDisplay key={model.cid} model={model} map={map} />
            )
          case 'poly':
            return (
              <OpenlayersPolygonDisplay
                key={model.cid}
                model={model}
                map={map}
              />
            )
          default:
            return (
              <OpenlayersPolygonDisplay
                key={model.cid}
                model={model}
                map={map}
              />
            )
        }
      })}
      {drawingModel && (
        <Editor data-id="map-draw-menu">
          <DrawingMenu
            shape={drawingShape}
            map={map.getMap()}
            isActive={isDrawing}
            geometry={isDrawing ? drawingGeometry : null}
            onCancel={cancelDrawing}
            onOk={finishDrawing}
            onSetShape={() => {}}
            disabledShapes={SHAPES.filter((shape) => shape !== drawingShape)}
            onUpdate={updateGeo}
            saveAndContinue={false}
            mapStyle={DRAWING_STYLE}
          />
        </Editor>
      )}
    </>
  )
}
