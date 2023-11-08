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
  onChange,
  listenTo,
}: {
  filter: any
  extractedModels: any[]
  onChange: () => void
  listenTo: (object: any, events: string, callback: EventHandler) => void
}) => {
  if (filter.filters) {
    filter.filters.forEach((subfilter: any) => {
      extractModelsFromFilter({
        filter: subfilter,
        extractedModels,
        onChange,
        listenTo,
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
          listenTo(
            newLocationModel,
            'change:mapNorth change:mapSouth change:mapEast change:mapWest change:lat change:lon change:line change:polygon',
            () => {
              console.log('LOCATION CHANGED')
              filter.value = newLocationModel.toJSON()
              onChange()
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
  //const [query] = useQuery()
  const filterTree = useLazyResultsFilterTreeFromSelectionInterface({
    selectionInterface,
  })
  const { listenTo, stopListening: _stopListening } = useBackbone()
  useListenTo(
    (wreqr as any).vent,
    'search:linedisplay search:polydisplay search:bboxdisplay search:circledisplay search:keyworddisplay',
    (model: any) => {
      console.log('display event!')
      if (Array.isArray(model)) {
        setModels(
          [...models].concat(
            model.filter((newModel) => !models.includes(newModel))
          )
        )
      } else if (!models.includes(model)) {
        setModels([...models, model])
      }
    }
  )
  React.useEffect(() => {
    ;(wreqr as any).vent.trigger('search:requestlocationmodels')
  }, [])
  const updateFilterModels = React.useMemo(() => {
    return () => {
      // TODO I'm not sure that we want this. Is there a way to remove only the handler I added?
      /*for (const model of filterModels) {
        stopListening(model)
      }*/
      console.log('updating filter models')
      const resultFilter = TypedUserInstance.getEphemeralFilter()
      const extractedModels = [] as any[]
      if (filterTree) {
        console.log('current filterTree', filterTree)
        extractModelsFromFilter({
          filter: filterTree,
          extractedModels,
          onChange: () => {
            console.log('updated filterTree', filterTree)
            selectionInterface.getCurrentQuery().set('filterTree', filterTree)
          },
          listenTo,
        })
      }
      if (resultFilter) {
        extractModelsFromFilter({
          filter: resultFilter,
          extractedModels,
          onChange: () => {
            TypedUserInstance.getPreferences().set('resultFilter', resultFilter)
          },
          listenTo,
        })
      }
      setFilterModels(extractedModels)
    }
  }, [filterTree, selectionInterface, selectionInterface.getCurrentQuery()])
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
        if (models.includes(submodel)) {
          setModels(models.filter((displayModel) => displayModel !== submodel))
        }
      })
    }
  )
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
