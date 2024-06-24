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

/**
 *  We might want to not export anything beyond the default state functions, but for now we can leave this and refactor when we have time.
 *  The idea is this state should be flowing in at the top when we make the component, and not be getting fetched in the leaves.  Maybe we can add it to the context.
 */
import { ComponentNameType } from '../golden-layout/golden-layout.types'
import { TypedUserInstance } from '../singletons/TypedUser'
import { ModeType } from './results-visual/results-visual'

export const RESULTS_ATTRIBUTES_TABLE = 'results-attributesShownTable'
export const RESULTS_ATTRIBUTES_LIST = 'results-attributesShownList'
export const RESULTS_MODE = 'results-mode'

export const MAP_LAYERS = 'mapLayers'

export function getDefaultComponentState(component: ComponentNameType) {
  switch (component) {
    case 'cesium':
      return {
        [MAP_LAYERS]: getUserPreferencesMapLayersJSON(),
      }
    case 'openlayers':
      return {
        [MAP_LAYERS]: getUserPreferencesMapLayersJSON(),
      }
    case 'results':
      return {
        [RESULTS_ATTRIBUTES_TABLE]: getDefaultResultsShownTable(),
        [RESULTS_ATTRIBUTES_LIST]: getDefaultResultsShownList(),
        [RESULTS_MODE]: getDefaultResultsMode(),
      }
    default:
      return {}
  }
}

export const getUserPreferencesMapLayersJSON = () => {
  return TypedUserInstance.getMapLayers().toJSON()
}

export const getDefaultResultsMode = (): ModeType => {
  return 'card'
}

export const getDefaultResultsShownList = () => {
  const defaultAttributes = TypedUserInstance.getResultsAttributesShownList()
  if (defaultAttributes && defaultAttributes.length > 0) {
    return defaultAttributes
  }
  return ['title', 'thumbnail']
}

export const getDefaultResultsShownTable = () => {
  const defaultAttributes = TypedUserInstance.getResultsAttributesShownTable()
  if (defaultAttributes && defaultAttributes.length > 0) {
    return defaultAttributes
  }
  return ['title', 'thumbnail']
}

export const getUserCoordinateFormat = () => {
  return TypedUserInstance.getCoordinateFormat()
}
