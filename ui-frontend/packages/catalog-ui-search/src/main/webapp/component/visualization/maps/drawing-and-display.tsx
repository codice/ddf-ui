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
import wreqr from '../../../js/wreqr'
import {
  useBackbone,
  useListenTo,
} from '../../selection-checkbox/useBackbone.hook'
import { useIsDrawing } from '../../singletons/drawing'
import { TypedUserInstance } from '../../singletons/TypedUser'
import { zoomToHome } from './home'
import LocationModel from '../../location-old/location-old'
import { Shape } from 'geospatialdraw/target/webapp/shape-utils'
import { useLazyResultsFilterTreeFromSelectionInterface } from '../../selection-interface/hooks'
import { EventHandler } from 'backbone'
export const SHAPE_ID_PREFIX = 'shape'
export const getIdFromModelForDisplay = ({ model }: { model: any }) => {
  return `${SHAPE_ID_PREFIX}-${model.cid}-display`
}
export const getIdFromModelForDrawing = ({ model }: { model: any }) => {
  return `${SHAPE_ID_PREFIX}-${model.cid}-drawing`
}
export type DrawModeType = 'line' | 'poly' | 'circle' | 'bbox' | 'keyword'
// from these all other drawings are constructed
const BasicDrawModeTypes: Array<DrawModeType> = [
  'bbox',
  'circle',
  'line',
  'poly',
]
type LocationTypeType =
  | 'LINE'
  | 'POLYGON'
  | 'MULTIPOLYGON'
  | 'BBOX'
  | 'POINTRADIUS'
  | 'POINT'
export const getLocationTypeFromModel = ({ model }: { model: any }) => {
  const type = model.get('type') as LocationTypeType
  return type
}
export const getDrawModeFromModel = ({
  model,
}: {
  model: any
}): DrawModeType => {
  const mode = model.get('mode')
  if (BasicDrawModeTypes.includes(mode)) {
    return mode
  }
  const fallbackType = getLocationTypeFromModel({ model })
  switch (fallbackType) {
    case 'BBOX':
      return 'bbox'
    case 'LINE':
      return 'line'
    case 'MULTIPOLYGON':
      return 'poly'
    case 'POINTRADIUS':
      return 'circle'
    case 'POINT':
      return 'circle'
    case 'POLYGON':
      return 'poly'
    default:
      return 'poly'
  }
}
export const getShapeFromDrawMode = (drawMode: DrawModeType): Shape => {
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
export const getDrawModeFromShape = (shape: Shape): DrawModeType => {
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
const extractModelsFromFilter = ({
  filter,
  extractedModels,
  listenTo,
  onChange,
}: {
  filter: any
  extractedModels: any[]
  listenTo?: (object: any, events: string, callback: EventHandler) => void
  onChange?: () => void
}) => {
  if (filter.filters) {
    filter.filters.forEach((subfilter: any) => {
      extractModelsFromFilter({
        filter: subfilter,
        extractedModels,
        listenTo,
        onChange,
      })
    })
  } else {
    if (filter.type === 'GEOMETRY') {
      if (filter.value?.areaDetails?.locations) {
        filter.value.areaDetails.locations.map((location: any) => {
          const newLocationModel = new LocationModel(location)
          newLocationModel.set('locationId', undefined)
          extractedModels.push(newLocationModel)
        })
      } else {
        const newLocationModel = new LocationModel(filter.value)
        if (newLocationModel.get('hasKeyword')) {
          newLocationModel.set('locationId', undefined)
        } else {
          listenTo?.(
            newLocationModel,
            'change:mapNorth change:mapSouth change:mapEast change:mapWest change:lat change:lon change:line change:polygon',
            (model) => {
              filter.value = model.toJSON()
              onChange?.()
            }
          )
        }

        extractedModels.push(newLocationModel)
      }
    }
  }
}
function useOnceIsNearFirstRender({
  howNear = 1000,
  callback,
}: {
  howNear?: number
  callback: () => void
}) {
  const [firstRender, setFirstRender] = React.useState(true)
  const [hasFired, setHasFired] = React.useState(false)
  React.useEffect(() => {
    setFirstRender(false)
  }, [])
  React.useEffect(() => {
    if (!firstRender && !hasFired) {
      const timeoutId = window.setTimeout(() => {
        callback()
        setHasFired(true)
      }, howNear)
      return () => {
        window.clearTimeout(timeoutId)
      }
    }
    return () => {}
  }, [firstRender, howNear, hasFired, callback])
}
export const useDrawingAndDisplayModels = ({
  selectionInterface,
  map,
}: {
  selectionInterface: any
  map: any
}) => {
  // All of these arrays hold different sets of the same models, but where they come from differs
  // models are from geometry inputs that are in the dom aka textfields etc. (aka, someone is editing a geo input)
  const [models, setModels] = React.useState<Array<any>>([])
  // filter models are grabbed from the filter tree on a search
  const [filterModels, setFilterModels] = React.useState<Array<any>>([])
  // drawing models are when the user is actively drawing / editing a shape on the maps themselves (aka the draw tools)
  const [drawingModels, setDrawingModels] = React.useState<Array<any>>([])
  const isDrawing = useIsDrawing()
  const filterTree = useLazyResultsFilterTreeFromSelectionInterface({
    selectionInterface,
  })
  const { listenTo, stopListening } = useBackbone()
  useListenTo(
    (wreqr as any).vent,
    'search:linedisplay search:polydisplay search:bboxdisplay search:circledisplay search:keyworddisplay search:areadisplay',
    (model: any) => {
      setModels((currentModels) => {
        let newModels = currentModels
        if (Array.isArray(model)) {
          newModels = currentModels.concat(
            model.filter((newModel) => !currentModels.includes(newModel))
          )
        } else if (!currentModels.includes(model)) {
          newModels = [...currentModels, model]
        }
        return newModels
      })
    }
  )
  useListenTo((wreqr as any).vent, 'search:removedisplay', (model: any) => {
    setModels((currentModels) => {
      let newModels
      if (Array.isArray(model)) {
        newModels = currentModels.filter((m) => !model.includes(m))
      } else {
        newModels = currentModels.filter((m) => m !== model)
      }
      return newModels
    })
  })
  React.useEffect(() => {
    ;(wreqr as any).vent.trigger('search:requestlocationmodels')
  }, [])
  const updateFilterModels = React.useCallback(() => {
    for (const model of filterModels) {
      stopListening(model)
    }
    const resultFilter = TypedUserInstance.getEphemeralFilter()
    const extractedModels = [] as any[]
    if (filterTree) {
      extractModelsFromFilter({
        filter: filterTree,
        extractedModels,
      })
    }
    if (resultFilter) {
      // We have to use this alternate method of updating the filter when dealing with
      // the resultFilter. When the location input is unmounted, it resets its location
      // model and removes it from here via the search:removedisplay event, so we can't
      // use it to update the filter. The location input is unmounted when the result
      // filter menu is closed, which it usually is. So, we update the filter in the
      // prefs model ourselves, which causes this function to be run again with the new
      // filter, and we can display it correctly.
      extractModelsFromFilter({
        filter: resultFilter,
        extractedModels,
        listenTo,
        onChange: () => {
          TypedUserInstance.getPreferences().set(
            'resultFilter',
            JSON.parse(JSON.stringify(resultFilter))
          )
          TypedUserInstance.savePreferences()
        },
      })
    }
    // If we have a model for a particular locationId in both models and filterModels,
    // then keep only the one in models, since that is the source of truth. Removing
    // the one in filterModels prevents some flickering when releasing the mouse on a
    // move operation.
    const locationIds = new Set(models.map((m) => m.get('locationId')))
    const dedupedModels = extractedModels.filter(
      (m) => !locationIds.has(m.get('locationId'))
    )
    setFilterModels(dedupedModels)
  }, [filterTree, models])
  React.useEffect(() => {
    updateFilterModels()
  }, [updateFilterModels])
  useListenTo(selectionInterface, 'change:currentQuery', updateFilterModels)
  useListenTo(
    TypedUserInstance.getPreferences(),
    'change:resultFilter',
    updateFilterModels
  )
  useListenTo(
    (wreqr as any).vent,
    'search:drawline search:drawpoly search:drawbbox search:drawcircle',
    (model: any) => {
      if (!drawingModels.includes(model)) {
        setDrawingModels([...drawingModels, model])
      }
    }
  )
  useListenTo(
    (wreqr as any).vent,
    'search:line-end search:poly-end search:bbox-end search:circle-end search:drawcancel search:drawend',
    (model: any) => {
      if (!Array.isArray(model)) {
        model = [model]
      }
      model.forEach((submodel: any) => {
        if (drawingModels.includes(submodel)) {
          setDrawingModels(
            drawingModels.filter((drawingModel) => drawingModel !== submodel)
          )
        }
      })
    }
  )
  React.useEffect(() => {
    if (map && isDrawing) {
      ;(wreqr as any).vent.trigger('search:requestdrawingmodels')
    }
  }, [map])
  React.useEffect(() => {
    if (!isDrawing) {
      setDrawingModels([])
    }
  }, [isDrawing])
  const callback = React.useMemo(() => {
    return () => {
      if (map) {
        const shapesExist = map.panToShapesExtent()
        if (!shapesExist) {
          zoomToHome({ map })
        }
      }
    }
  }, [filterModels, models, map])
  useOnceIsNearFirstRender({ callback })
  return {
    models,
    drawingModels,
    filterModels,
  }
}
