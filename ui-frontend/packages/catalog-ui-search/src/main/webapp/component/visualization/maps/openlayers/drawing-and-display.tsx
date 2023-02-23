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
import { Point, Polygon, LineString } from '@turf/turf'
import { validateGeo } from '../../../../react-component/utils/validation'
import ShapeUtils from '../../../../js/ShapeUtils'

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

class TemporaryColorGeneratorUntilWeGetAColorPicker {
  colors: string[]
  selectedIndex: number
  constructor() {
    this.colors = [
      '#ff0000',
      '#00ff00',
      '#a020f0',
      '#ffd700',
      '#ff00ff',
      '#ffff00',
      '#a52a2a',
      '#ffa500',
      '#ffc0cb',
      '#000064',
      '#006400',
      '#640000',
      '#0000ff',
    ]
    this.selectedIndex = 0
  }
  nextColor(): string {
    const selected = this.colors[this.selectedIndex]
    this.selectedIndex++
    if (this.selectedIndex >= this.colors.length) {
      this.selectedIndex = 0
    }
    return selected
  }
}

const ColorGenerator = new TemporaryColorGeneratorUntilWeGetAColorPicker()

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

// TODO I see a reference to 'POINTRADIUS' for the type in location-old
// see generateAnyGeoFilter in CQLUtils.ts
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
    polygon,
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
    line,
    lineWidth: geo.properties.buffer?.toString() || '0',
    lineUnits: geo.properties.bufferUnit,
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
      return {
        lon: (geo.geometry as Point).coordinates[0],
        lat: (geo.geometry as Point).coordinates[1],
        radius: geo.properties.buffer?.toString() || '1',
        radiusUnits: geo.properties.bufferUnit,
      }
    case 'Bounding Box':
      return {
        west: geo.bbox[0],
        south: geo.bbox[1],
        east: geo.bbox[2],
        north: geo.bbox[3],
      }
    default:
      return {}
  }
}

// TODO do we need to do any polygon 'fixing' here? Or does the validation take care of that?
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
    ColorGenerator.nextColor(),
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

const getDrawingGeometryFromModel = (model: any): GeometryJSON | null => {
  const mode = model.get('mode')
  switch (mode) {
    case 'bbox':
      return modelToBoundingBox(model)
    case 'circle':
      return modelToPointRadius(model)
    case 'line':
      return modelToLine(model)
    case 'poly':
      return modelToPolygon(model)
    default:
      return null
  }
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

  // TODO does this need to be state?
  const [drawingModel] =
    drawingModels.length > 0 ? drawingModels.slice(-1) : [undefined]

  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingShape, setDrawingShape] = useState<Shape>(DEFAULT_SHAPE)
  const [drawingGeometry, setDrawingGeometry] = useState<GeometryJSON | null>(
    null
  )

  useEffect(() => {
    console.log('running drawingModel effect!', drawingModel)
    setIsDrawing(!!drawingModel)
    if (drawingModel) {
      setDrawingShape(
        getShapeFromDrawMode(getDrawModeFromModel({ model: drawingModel }))
      )
      setDrawingGeometry(getDrawingGeometryFromModel(drawingModel))
    }
  }, [drawingModel]) // TODO should this be [drawingModels] instead?

  const cancelDrawing = () => {
    drawingModel.set('drawing', false)
    // the listener for this calls Drawing.turnOffDrawing()
    wreqr.vent.trigger('search:drawcancel', drawingModel)
    setIsDrawing(false)
    setDrawingShape(DEFAULT_SHAPE)
    setDrawingGeometry(null)
    drawingLocation = null
  }

  // TODO what is type for?
  const convertToModel = (geo: GeometryJSON) => {
    console.log('geo', JSON.parse(JSON.stringify(geo)))
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
