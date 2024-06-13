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

import { StartupDataStore } from '../../js/model/Startup/startup'
import { TypedUserInstance } from '../singletons/TypedUser'

export const RESULTS_ATTRIBUTES_TABLE = 'results-attributesShownTable'
export const RESULTS_ATTRIBUTES_LIST = 'results-attributesShownList'
export const RESULTS_MODE = 'results-mode'

export const CESIUM_MAP_LAYERS = 'cesium-mapLayers'
export const OPENLAYERS_MAP_LAYERS = 'openlayers-mapLayers'

export const getDefaultResultsShownList = () => {
  if (StartupDataStore.Configuration.getResultShow().length > 0) {
    return StartupDataStore.Configuration.getResultShow()
  }
  return ['title', 'thumbnail']
}

export const getDefaultResultsShownTable = () => {
  if (StartupDataStore.Configuration.getDefaultTableColumns().length > 0) {
    return StartupDataStore.Configuration.getDefaultTableColumns()
  }
  return ['title', 'thumbnail']
}

export const getDefaultCoordinateFormat = () => {
  return TypedUserInstance.getCoordinateFormat()
}
