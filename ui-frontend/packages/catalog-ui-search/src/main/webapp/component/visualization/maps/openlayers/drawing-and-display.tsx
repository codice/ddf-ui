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
import {
  getDrawModeFromModel,
  useDrawingAndDisplayModels,
} from '../drawing-and-display'
import { OpenlayersBboxDisplay } from './bbox-display'
import { OpenlayersBboxDrawing } from './bbox-drawing'
import { OpenlayersCircleDisplay } from './circle-display'
import { OpenlayersCircleDrawing } from './circle-drawing'
import { OpenlayersLineDisplay } from './line-display'
import { OpenlayersLineDrawing } from './line-drawing'
import { OpenlayersPolygonDisplay } from './polygon-display'
import { OpenlayersPolygonDrawing } from './polygon-drawing'

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

export const OpenlayersDrawings = ({
  map,
  selectionInterface,
}: {
  map: any
  selectionInterface: any
}) => {
  const { models, filterModels, drawingModels } = useDrawingAndDisplayModels({
    selectionInterface,
  })

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
            return <></>
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
            return <></>
        }
      })}
      {drawingModels.map((model) => {
        const drawMode = getDrawModeFromModel({ model })
        switch (drawMode) {
          case 'bbox':
            return (
              <OpenlayersBboxDrawing key={model.cid} model={model} map={map} />
            )
          case 'circle':
            return (
              <OpenlayersCircleDrawing
                key={model.cid}
                model={model}
                map={map}
              />
            )
          case 'line':
            return (
              <OpenlayersLineDrawing key={model.cid} model={model} map={map} />
            )
          case 'poly':
            return (
              <OpenlayersPolygonDrawing
                key={model.cid}
                model={model}
                map={map}
              />
            )
          default:
            return <></>
        }
      })}
    </>
  )
}
