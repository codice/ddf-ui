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
import { useRender } from '../../../hooks/useRender'
const wreqr = require('../../../../js/wreqr.js')
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { useIsDrawing } from '../../../singletons/drawing'
import { TypedUserInstance } from '../../../singletons/TypedUser'
import { OpenlayersBboxDisplay } from './bbox-display'
import { OpenlayersBboxDrawing } from './bbox-drawing'
import { OpenlayersCircleDisplay } from './circle-display'
import { OpenlayersCircleDrawing } from './circle-drawing'
import { OpenlayersLineDisplay } from './line-display'
import { OpenlayersLineDrawing } from './line-drawing'
import { OpenlayersPolygonDisplay } from './polygon-display'
import { OpenlayersPolygonDrawing } from './polygon-drawing'
const LocationModel = require('../../../location-old/location-old.js')

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

type DrawModeType = 'line' | 'poly' | 'circle' | 'bbox'

const getDrawModeFromModel = ({ model }: { model: any }): DrawModeType => {
  return model.get('mode')
}

const extractModelsFromFilter = ({
  filter,
  extractedModels,
}: {
  filter: any
  extractedModels: any[]
}) => {
  if (filter.filters) {
    filter.filters.forEach((subfilter: any) => {
      extractModelsFromFilter({ filter: subfilter, extractedModels })
    })
  } else {
    if (filter.type === 'GEOMETRY') {
      extractedModels.push(new LocationModel(filter.value))
    }
  }
}

export const OpenlayersDrawings = ({
  map,
  selectionInterface,
}: {
  map: any
  selectionInterface: any
}) => {
  const render = useRender()
  const [models, setModels] = React.useState<Array<any>>([])
  const [filterModels, setFilterModels] = React.useState<Array<any>>([])
  const [drawingModels, setDrawingModels] = React.useState<Array<any>>([])
  const isDrawing = useIsDrawing()
  console.log(filterModels)
  useListenTo(
    wreqr.vent,
    'search:linedisplay search:polydisplay search:bboxdisplay search:circledisplay',
    (model: any) => {
      if (!models.includes(model)) {
        setModels([...models, model])
      }
      render()
    }
  )
  const updateFilterModels = React.useMemo(() => {
    return () => {
      const currentQuery = selectionInterface.get('currentQuery')
      const resultFilter = TypedUserInstance.getEphemeralFilter()
      const extractedModels = [] as any[]
      if (currentQuery) {
        extractModelsFromFilter({
          filter: currentQuery.get('filterTree'),
          extractedModels,
        })
      }

      if (resultFilter) {
        extractModelsFromFilter({
          filter: resultFilter,
          extractedModels,
        })
      }
      setFilterModels(extractedModels)
    }
  }, [selectionInterface])
  useListenTo(selectionInterface, 'change:currentQuery', updateFilterModels)
  useListenTo(
    wreqr.vent,
    'search:drawline search:drawpoly search:drawbbox search:drawcircle',
    (model: any) => {
      if (!drawingModels.includes(model)) {
        setDrawingModels([...drawingModels, model])
      }
    }
  )
  useListenTo(
    wreqr.vent,
    'search:drawline-end search:drawpoly-end search:drawbbox-end search:drawcircle-end',
    (model: any) => {
      if (drawingModels.includes(model)) {
        setDrawingModels(
          drawingModels.filter((drawingModel) => drawingModel !== model)
        )
      }
    }
  )
  useListenTo(wreqr.vent, 'search:drawend', (model: any) => {
    if (drawingModels.includes(model)) {
      setDrawingModels(
        drawingModels.filter((drawingModel) => drawingModel !== model)
      )
    }
  })
  React.useEffect(() => {
    if (!isDrawing) {
      setDrawingModels([])
    }
  }, [isDrawing])
  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      updateFilterModels()
    }, 1000)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      {filterModels.map((model) => {
        const drawMode = getDrawModeFromModel({ model })
        switch (drawMode) {
          case 'bbox':
            return (
              <OpenlayersBboxDisplay key={model.id} model={model} map={map} />
            )
          case 'circle':
            return (
              <OpenlayersCircleDisplay key={model.id} model={model} map={map} />
            )
          case 'line':
            return (
              <OpenlayersLineDisplay key={model.id} model={model} map={map} />
            )
          case 'poly':
            return (
              <OpenlayersPolygonDisplay
                key={model.id}
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
              <OpenlayersBboxDisplay key={model.id} model={model} map={map} />
            )
          case 'circle':
            return (
              <OpenlayersCircleDisplay key={model.id} model={model} map={map} />
            )
          case 'line':
            return (
              <OpenlayersLineDisplay key={model.id} model={model} map={map} />
            )
          case 'poly':
            return (
              <OpenlayersPolygonDisplay
                key={model.id}
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
              <OpenlayersBboxDrawing key={model.id} model={model} map={map} />
            )
          case 'circle':
            return (
              <OpenlayersCircleDrawing key={model.id} model={model} map={map} />
            )
          case 'line':
            return (
              <OpenlayersLineDrawing key={model.id} model={model} map={map} />
            )
          case 'poly':
            return (
              <OpenlayersPolygonDrawing
                key={model.id}
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
