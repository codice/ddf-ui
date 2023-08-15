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
import { v4 } from 'uuid'
import {
  getDrawModeFromModel,
  useDrawingAndDisplayModels,
  getShapeFromDrawMode,
  getDrawModeFromShape,
} from '../drawing-and-display'
import { OpenlayersBboxDisplay } from './bbox-display'
import { OpenlayersCircleDisplay } from './circle-display'
import { OpenlayersLineDisplay } from './line-display'
import { OpenlayersPolygonDisplay } from './polygon-display'
import { Editor } from '../draw-menu'
import { DRAWING_STYLE } from './draw-styles'
import { menu, geometry } from 'geospatialdraw'
import { Shape } from 'geospatialdraw/target/webapp/shape-utils'
import {
  GeometryJSON,
  makeGeometry,
  makePointRadiusGeo,
  makeLineGeo,
  makeBBoxGeo,
} from 'geospatialdraw/target/webapp/geometry'
import * as ol from 'openlayers'
import Common from '../../../../js/Common'
import wreqr from '../../../../js/wreqr'
import { Drawing } from '../../../../component/singletons/drawing'
import * as Turf from '@turf/turf'
import { Point, Polygon, LineString } from '@turf/turf'
import { validateGeo } from '../../../../react-component/utils/validation'
import ShapeUtils from '../../../../js/ShapeUtils'
import _ from 'lodash'
import utility from './utility'
import { contrastingColor } from '../../../../react-component/location/location-color-selector'

const DrawingMenu = menu.DrawingMenu
const makeEmptyGeometry = geometry.makeEmptyGeometry

const SHAPES: Shape[] = [
  'Bounding Box',
  'Line',
  'Point',
  'Point Radius',
  'Polygon',
]

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
  const west = Number(wrapped[0][0].toFixed(6))
  const south = Number(wrapped[0][1].toFixed(6))
  const east = Number(wrapped[1][0].toFixed(6))
  const north = Number(wrapped[1][1].toFixed(6))
  return {
    west,
    mapWest: west,
    south,
    mapSouth: south,
    east,
    mapEast: east,
    north,
    mapNorth: north,
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
  const buffer = Number(model.get('polygonBufferWidth'))
  const bufferUnit = model.get('polygonBufferUnits')
  return makeGeometry(
    v4(),
    Turf.polygon(polygon).geometry,
    DRAWING_COLOR,
    'Polygon',
    Number.isNaN(buffer) ? 0 : buffer,
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
  const buffer = Number(model.get('lineWidth'))
  const bufferUnit = model.get('lineUnits')
  return makeLineGeo(
    v4(),
    coords,
    Number.isNaN(buffer) ? 0 : buffer,
    bufferUnit || 'meters'
  )
}

const modelToPointRadius = (model: any): GeometryJSON | null => {
  const lon = model.get('lon')
  const lat = model.get('lat')
  if (lon === undefined || lat === undefined) {
    return null
  }
  const radius = Number(model.get('radius'))
  const radiusUnits = model.get('radiusUnits')
  return makePointRadiusGeo(
    v4(),
    lat,
    lon,
    Number.isNaN(radius) ? 1 : radius,
    radiusUnits || 'meters'
  )
}

const isAnyNaN = (numbers: number[]) => {
  return numbers.some((n) => n === undefined || n === null || Number.isNaN(n))
}

const modelToBoundingBox = (model: any): GeometryJSON | null => {
  const west = model.get('west')
  const south = model.get('south')
  const east = model.get('east')
  const north = model.get('north')
  if (isAnyNaN([west, south, east, north])) {
    return null
  }
  return makeBBoxGeo(v4(), [west, south, east, north])
}

export const getDrawingGeometryFromModel = (
  model: any
): GeometryJSON | null => {
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
    utility.adjustGeoCoords(geo)
    if (geo.properties?.color) {
      geo.properties.color = contrastingColor
    }
  }
  return geo
}

export const convertToModel = (geo: GeometryJSON, shape: Shape) => {
  return {
    ...createGeoModel(geo),
    type: getGeoType(geo),
    mode: getDrawModeFromShape(shape),
  }
}

// This is not a piece of state because the geospatialdraw
// library rerenders bounding boxes unnecessarily
// If this was state, the resulting rerenders would
// break bounding boxes in the updateGeo method
let drawingLocation: GeometryJSON | null = makeEmptyGeometry(
  v4(),
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
    drawingModel.set(convertToModel(drawingLocation, drawingShape))
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
