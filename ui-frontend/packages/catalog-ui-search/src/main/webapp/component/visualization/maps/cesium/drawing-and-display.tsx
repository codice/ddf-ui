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
  getShapeFromDrawMode,
  getDrawModeFromShape,
  useDrawingAndDisplayModels,
} from '../drawing-and-display'
import { CesiumBboxDisplay } from './bbox-display'
import { CesiumCircleDisplay } from './circle-display'
import { CesiumLineDisplay } from './line-display'
import { CesiumPolygonDisplay } from './polygon-display'
import { Editor } from '../draw-menu'
import { menu } from 'geospatialdraw'
import { Shape } from 'geospatialdraw/target/webapp/shape-utils'
import { DRAWING_STYLE } from '../openlayers/draw-styles'
import wreqr from '../../../../js/wreqr'
import _ from 'lodash'
import { InteractionsContext } from '../interactions.provider'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium'

const DrawingMenu = menu.DrawingMenu

const SHAPES: Shape[] = [
  'Bounding Box',
  'Line',
  'Point',
  'Point Radius',
  'Polygon',
]
const DEFAULT_SHAPE = 'Polygon'

export const removeOldDrawing = ({ map, id }: { map: any; id: string }) => {
  const relevantPrimitives = map
    .getMap()
    .scene.primitives._primitives.filter((prim: any) => {
      return prim.id === id
    })
  relevantPrimitives.forEach((relevantPrimitive: any) => {
    if (typeof relevantPrimitive.setEditMode === 'function') {
      // Need to call this to remove the editing billboards and click handlers
      relevantPrimitive.setEditMode(false)
    }
    map.getMap().scene.primitives.remove(relevantPrimitive)
  })
  relevantPrimitives.length > 0 && map.getMap().scene.requestRender()
}

let drawingLocation: any

const updateDrawingLocation = (newDrawingLocation: any) => {
  drawingLocation = newDrawingLocation
}

const ensurePolygonIsClosed = (polygon: any) => {
  const points = polygon?.polygon
  if (Array.isArray(points) && points.length > 0) {
    const first = points[0]
    const last = points[points.length - 1]
    if (!_.isEqual(first, last)) {
      points.push(first)
    }
  }
}

export const CesiumDrawings = ({
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

  const { interactiveGeo, translation, setInteractiveModel } =
    React.useContext(InteractionsContext)

  const nonDrawingModels = models.concat(filterModels)

  useEffect(() => {
    const model = nonDrawingModels.find(
      (m) => m.get('locationId') === interactiveGeo
    )
    setInteractiveModel(model)
  }, [interactiveGeo])

  const handleKeydown = React.useCallback(
    (e: any) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        finishDrawing()
      }
      if (e.key === 'Escape') {
        cancelDrawing()
      }
    },
    [drawingModel, drawingShape, drawingLocation]
  )

  useEffect(() => {
    setIsDrawing(!!drawingModel)
    if (drawingModel) {
      window.addEventListener('keydown', handleKeydown)
      setDrawingShape(
        getShapeFromDrawMode(getDrawModeFromModel({ model: drawingModel }))
      )
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [drawingModel])

  const cancelDrawing = () => {
    drawingModel.set('drawing', false)
    // the listener for this calls Drawing.turnOffDrawing()
    wreqr.vent.trigger('search:drawcancel', drawingModel)
    setIsDrawing(false)
    drawingLocation = null
  }

  const finishDrawing = () => {
    if (!drawingLocation) {
      cancelDrawing()
      return
    }

    wreqr.vent.trigger(
      `search:${getDrawModeFromShape(drawingShape)}-end`,
      drawingModel
    )
    wreqr.vent.trigger(`search:drawend`, drawingModel)
    if (drawingShape === 'Polygon') {
      ensurePolygonIsClosed(drawingLocation)
    }
    drawingModel.set({ ...drawingLocation, drawing: false })
    setIsDrawing(false)
    drawingLocation = null
  }

  const pickLocation = (model?: any) => {
    const mode = getDrawModeFromModel({ model })
    switch (mode) {
      case 'bbox':
        return _.pick(model.attributes, 'north', 'south', 'east', 'west')
      case 'circle':
        return _.pick(model.attributes, 'lat', 'lon')
      case 'line':
        return _.pick(model.attributes, 'line')
      case 'poly':
        return _.pick(model.attributes, 'polygon')
      default:
        return {}
    }
  }

  const isNotBeingEdited = (model: any) =>
    !drawingModel || !_.isEqual(pickLocation(model), pickLocation(drawingModel))

  /*
    When editing a shape, don't display the other models that correspond to that shape. Because
    we don't display shapes on the surface of the globe, we can't use Cesium's APIs to force the
    shape being edited to the top. If the corresponding models were shown, then multiple overlapping
    shapes would be drawn on the map, and the sole editable shape is not guaranteed to be visible
    or able to be interacted with.
    Note that we cannot compare the filterModel IDs to that of the drawingModel, because while a
    filterModel and a drawingModel may represent the same shape, they are different model object
    instances and have different IDs. Instead, we check for equivalent location attributes on the
    models.
    The models array is a different story, since it can contain the same model object instances
    as drawingModels, but we use the non-ID-based comparison method described above for it, too,
    to ensure consistent behavior.
  */
  return (
    <>
      {nonDrawingModels.filter(isNotBeingEdited).map((model) => {
        const drawMode = getDrawModeFromModel({ model })
        const shapeTranslation =
          translation && model.get('locationId') === interactiveGeo
            ? translation
            : undefined
        switch (drawMode) {
          case 'bbox':
            return (
              <CesiumBboxDisplay
                key={model.cid}
                model={model}
                map={map}
                translation={shapeTranslation}
              />
            )
          case 'circle':
            return (
              <CesiumCircleDisplay
                key={model.cid}
                model={model}
                map={map}
                translation={shapeTranslation}
              />
            )
          case 'line':
            return (
              <CesiumLineDisplay
                key={model.cid}
                model={model}
                map={map}
                translation={shapeTranslation}
              />
            )
          case 'poly':
            return (
              <CesiumPolygonDisplay
                key={model.cid}
                model={model}
                map={map}
                translation={shapeTranslation}
              />
            )
          default:
            return <></>
        }
      })}
      {drawingModels.map((model) => {
        const drawMode = getDrawModeFromModel({ model })
        switch (drawMode) {
          case 'bbox':
            return (
              <CesiumBboxDisplay
                key={model.cid}
                model={model}
                map={map}
                onDraw={updateDrawingLocation}
              />
            )
          case 'circle':
            return (
              <CesiumCircleDisplay
                key={model.cid}
                model={model}
                map={map}
                onDraw={updateDrawingLocation}
              />
            )
          case 'line':
            return (
              <CesiumLineDisplay
                key={model.cid}
                model={model}
                map={map}
                onDraw={updateDrawingLocation}
              />
            )
          case 'poly':
            return (
              <CesiumPolygonDisplay
                key={model.cid}
                model={model}
                map={map}
                onDraw={updateDrawingLocation}
              />
            )
          default:
            return <></>
        }
      })}

      {/*
        Use geospatialdraw's toolbar even though geospatialdraw does not support Cesium.
        We don't actually use the library for drawing, but we want the drawing experience
        on the 3D map to look like it does on the 2D map. This is why we only care about
        the shape icon displayed on the toolbar and the apply/cancel handlers; everything
        else is just no-ops.
      */}
      {drawingModel && (
        <Editor data-id="map-draw-menu">
          <DrawingMenu
            shape={drawingShape}
            map={{
              addLayer: () => {},
              removeInteraction: () => {},
              addInteraction: () => {},
            }}
            isActive={isDrawing}
            geometry={null}
            onCancel={cancelDrawing}
            onOk={finishDrawing}
            onSetShape={() => {}}
            disabledShapes={SHAPES.filter((shape) => shape !== drawingShape)}
            onUpdate={() => {}}
            saveAndContinue={false}
            mapStyle={DRAWING_STYLE}
          />
        </Editor>
      )}
    </>
  )
}
