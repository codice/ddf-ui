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
import { CesiumBboxDisplay } from './bbox-display'
import { CesiumBboxDrawing } from './bbox-drawing'
import { CesiumCircleDisplay } from './circle-display'
import { CesiumCircleDrawing } from './circle-drawing'
import { CesiumLineDisplay } from './line-display'
import { CesiumLineDrawing } from './line-drawing'
import { CesiumPolygonDisplay } from './polygon-display'
import { CesiumPolygonDrawing } from './polygon-drawing'

export const removeOldDrawing = ({ map, id }: { map: any; id: string }) => {
  const relevantPrimitives = map
    .getMap()
    .scene.primitives._primitives.filter((prim: any) => {
      return prim.id === id
    })
  relevantPrimitives.forEach((relevantPrimitive: any) => {
    map.getMap().scene.primitives.remove(relevantPrimitive)
    relevantPrimitive.destroy()
    map.getMap().scene.requestRender()
  })
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
  })

  return (
    <>
      {filterModels.map((model) => {
        const drawMode = getDrawModeFromModel({ model })
        switch (drawMode) {
          case 'bbox':
            return <CesiumBboxDisplay key={model.cid} model={model} map={map} />
          case 'circle':
            return (
              <CesiumCircleDisplay key={model.cid} model={model} map={map} />
            )
          case 'line':
            return <CesiumLineDisplay key={model.cid} model={model} map={map} />
          case 'poly':
            return (
              <CesiumPolygonDisplay key={model.cid} model={model} map={map} />
            )
          default:
            return <></>
        }
      })}
      {models.map((model) => {
        const drawMode = getDrawModeFromModel({ model })
        switch (drawMode) {
          case 'bbox':
            return <CesiumBboxDisplay key={model.cid} model={model} map={map} />
          case 'circle':
            return (
              <CesiumCircleDisplay key={model.cid} model={model} map={map} />
            )
          case 'line':
            return <CesiumLineDisplay key={model.cid} model={model} map={map} />
          case 'poly':
            return (
              <CesiumPolygonDisplay key={model.cid} model={model} map={map} />
            )
          default:
            return <></>
        }
      })}
      {drawingModels.map((model) => {
        const drawMode = getDrawModeFromModel({ model })
        switch (drawMode) {
          case 'bbox':
            return <CesiumBboxDrawing key={model.cid} model={model} map={map} />
          case 'circle':
            return (
              <CesiumCircleDrawing key={model.cid} model={model} map={map} />
            )
          case 'line':
            return <CesiumLineDrawing key={model.cid} model={model} map={map} />
          case 'poly':
            return (
              <CesiumPolygonDrawing key={model.cid} model={model} map={map} />
            )
          default:
            return <></>
        }
      })}
    </>
  )
}
