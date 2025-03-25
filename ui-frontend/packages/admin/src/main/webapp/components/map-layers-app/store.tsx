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
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import { Map } from 'immutable'

import reducer from './reducer'

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const exceptionLoggger = () => (next: any) => (action: any) => {
  try {
    return next(action)
  } catch (e) {
    console.error(e)
    throw e
  }
}

export const createMapLayersStore = () => {
  return createStore(
    reducer,
    Map(),
    composeEnhancers(applyMiddleware(exceptionLoggger, thunk))
  )
}

export default createMapLayersStore()
