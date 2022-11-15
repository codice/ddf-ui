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
const wreqr = require('../../../js/wreqr.js')
import { useListenTo } from '../../selection-checkbox/useBackbone.hook'
import { useIsDrawing } from '../../singletons/drawing'
import { TypedUserInstance } from '../../singletons/TypedUser'
const LocationModel = require('../../location-old/location-old.js')

type DrawModeType = 'line' | 'poly' | 'circle' | 'bbox'

export const getDrawModeFromModel = ({
  model,
}: {
  model: any
}): DrawModeType => {
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

export const useDrawingAndDisplayModels = ({
  selectionInterface,
}: {
  selectionInterface: any
}) => {
  const [models, setModels] = React.useState<Array<any>>([])
  const [filterModels, setFilterModels] = React.useState<Array<any>>([])
  const [drawingModels, setDrawingModels] = React.useState<Array<any>>([])
  const isDrawing = useIsDrawing()
  console.log('models:')
  console.log(models)
  console.log('filterModels:')

  console.log(filterModels)
  console.log('drawing Models:')

  console.log(drawingModels)
  useListenTo(
    wreqr.vent,
    'search:linedisplay search:polydisplay search:bboxdisplay search:circledisplay',
    (model: any) => {
      if (!models.includes(model)) {
        setModels([...models, model])
      }
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
    TypedUserInstance.getPreferences(),
    'change:resultFilter',
    updateFilterModels
  )
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
    if (models.includes(model)) {
      setModels(models.filter((drawingModel) => drawingModel !== model))
    }
  })
  useListenTo(wreqr.vent, 'search:destroyAllDraw', (model: any) => {
    console.log('destroyAllDraw')
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

  return {
    models,
    drawingModels,
    filterModels,
  }
}
