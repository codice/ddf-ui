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
import 'whatwg-fetch'
import { combineReducers } from 'redux-immutable'
import { fromJS, List, Map } from 'immutable'
import { isURL, matches } from 'validator'
import options from './options'

const select = (state: any) => state.get('layers')

const getConfig = (state: any) => select(state).get('config')
export const getProviders = (state: any) => select(state).get('providers')
export const isLoading = (state: any) => select(state).get('loading')
export const hasChanges = (state: any) => {
  const providers = getProviders(state).map((layer: any) => layer.get('layer'))
  const config = getConfig(state)
  return !providers.equals(config.get('imageryProviders'))
}
export const getMessage = (state: any) => select(state).get('msg')
export const getInvalid = (state: any) => select(state).get('invalid')

export const set = (value: any) => ({ type: 'map-layers/SET', value })
const start = () => ({ type: 'map-layers/START_SUBMIT' })
const end = () => ({ type: 'map-layers/END_SUBMIT' })
export const setInvalid = (buffer: any) => ({
  type: 'map-layers/SET_INVALID',
  buffer,
})
export const message = (text: any, action: any) => ({
  type: 'map-layers/MESSAGE',
  text,
  action,
})
export const update = (value: any, path: any) => ({
  type: 'map-layers/UPDATE',
  value,
  path,
})
export const reset = () => (dispatch: any, getState: any) =>
  dispatch({
    type: 'map-layers/SET',
    value: getConfig(getState()),
  })

const configPath = ['value', 'configurations', 0, 'properties']

export const fetch = () => (dispatch: any) => {
  dispatch(start())

  const url = [
    '/admin',
    'jolokia',
    'exec',
    'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
    'getService',
    '(service.pid=org.codice.ddf.catalog.ui)',
  ].join('/')

  window
    .fetch(url, {
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    .then((res) => res.json())
    .then((json) => {
      const config = fromJS(json)
        .getIn(configPath)
        .update('imageryProviders', (providers: any) => {
          if (providers === undefined || providers === '') {
            return fromJS([])
          }
          try {
            const parsed = JSON.parse(providers)
            const err = validateStructure(parsed)
            if (err !== undefined) {
              throw Error(err)
            }
            return fromJS(parsed)
          } catch (e) {
            dispatch(setInvalid(providers))
            dispatch(
              message(`Existing map layers are invalid: ${e.message}`, '')
            )
            return fromJS([])
          }
        })
      dispatch(set(config))
      dispatch(end())
    })
    .catch((e) => {
      dispatch(end())
      dispatch(message(`Unable to retrieve map layers: ${e.message}`, ''))
    })
}

export const save = () => (dispatch: any, getState: any) => {
  const state = getState()
  const url =
    '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/add'

  const providers = getProviders(state)

  if (!validate(providers).isEmpty()) {
    return dispatch(message('Cannot save because of validation errors', ''))
  }

  dispatch(start())

  const config = getConfig(state).set(
    'imageryProviders',
    providers.map((provider: any) => provider.get('layer'))
  )

  const body = {
    type: 'EXEC',
    mbean:
      'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
    operation: 'update',
    arguments: [
      'org.codice.ddf.catalog.ui',
      config.update('imageryProviders', JSON.stringify).toJS(),
    ],
  }

  const opts = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(body),
  }

  window
    .fetch(url, opts as any)
    .then((res) => res.text())
    .then((body) => {
      const res = JSON.parse(
        body.replace(
          /(\[Ljava\.lang\.(Long|String);@[^,]+)/g,
          (_, str) => `"${str}"`
        )
      )
      if (res.status !== 200) {
        throw new Error(res.error)
      }
      dispatch(set(config))
      dispatch(end())
      dispatch(message('Successfully saved map layers', 'open intrigue'))
    })
    .catch((e) => {
      dispatch(end())
      dispatch(message(`Unable to save map layers: ${e.message}`, ''))
    })
}

export const validateJson = (json: any) => {
  try {
    JSON.parse(json)
    return undefined
  } catch (e) {
    return 'Invalid JSON configuration'
  }
}

export const validateStructure = (providers: any) => {
  if (!Array.isArray(providers)) {
    return 'Providers should be an array'
  }

  if (providers.some((obj) => Array.isArray(obj) || typeof obj !== 'object')) {
    return 'All provider entries must be objects'
  }

  return undefined
}

export const validate = (providers: any) => {
  let errors = List()

  providers.forEach((provider: any, i: any) => {
    const layer = provider.get('layer')

    const name = layer.get('name')
    const existing = providers.findIndex(function (o: any, q: any) {
      return o.get('layer').get('name') === name && q !== i
    })

    if (name === '' || name === undefined) {
      errors = errors.setIn([i, 'name'], 'Name cannot be empty')
    } else if (!matches(name, '^[\\w\\-\\s]+$')) {
      errors = errors.setIn([i, 'name'], 'Name must be alphanumeric')
    } else if (existing < i && existing !== -1) {
      errors = errors.setIn(
        [i, 'name'],
        'Name is already in use and must be unique'
      )
    }

    const alpha = layer.get('alpha')

    if (alpha === '') {
      errors = errors.setIn([i, 'alpha'], 'Alpha cannot be empty')
    } else if (typeof alpha !== 'number') {
      errors = errors.setIn([i, 'alpha'], 'Alpha must be a number')
    } else if (alpha < 0) {
      errors = errors.setIn([i, 'alpha'], 'Alpha too small')
    } else if (alpha > 1) {
      errors = errors.setIn([i, 'alpha'], 'Alpha too large')
    }

    const proxyEnabled = layer.get('proxyEnabled')

    if (typeof proxyEnabled !== 'boolean') {
      errors = errors.setIn(
        [i, 'proxyEnabled'],
        'Proxy enabled must be true or false'
      )
    }

    const show = layer.get('show')

    if (typeof show !== 'boolean') {
      errors = errors.setIn([i, 'show'], 'Show must be true or false')
    }

    const type = layer.get('type')

    if (type === '') {
      errors = errors.setIn([i, 'type'], 'Type cannot be empty')
    } else if (!Object.keys(options).includes(type)) {
      errors = errors.setIn([i, 'type'], `Invalid type: ${type}`)
    }

    const url = layer.get('url')

    const opts = {
      protocols: ['http', 'https'],
      require_protocol: true,
    }

    if (url === '') {
      errors = errors.setIn([i, 'url'], 'URL cannot be empty')
    } else if (typeof url !== 'string') {
      errors = errors.setIn([i, 'url'], 'URL must be a string')
    } else if (!isURL(url, opts)) {
      errors = errors.setIn([i, 'url'], 'Invalid URL')
    }

    const err = validateJson(provider.get('buffer'))

    if (err !== undefined) {
      errors = errors.setIn([i, 'buffer'], err)
    }

    const order = layer.get('order')

    if (order === '' || order === undefined) {
      errors = errors.setIn([i, 'order'], 'Order cannot be empty')
    } else if (typeof order !== 'number') {
      errors = errors.setIn([i, 'order'], 'Order must be a number')
    } else if (order < 0 || order > providers.size - 1) {
      errors = errors.setIn(
        [i, 'order'],
        `Order should be between 0 and ${providers.size - 1}`
      )
    } else {
      const previous = providers
        .slice(0, i)
        .find((provider: any) => order === provider.getIn(['layer', 'order']))
      if (previous !== undefined) {
        errors = errors.setIn(
          [i, 'order'],
          `Order ${order} previously used for ${previous.getIn([
            'layer',
            'name',
          ])}`
        )
      }
    }

    const redirects = layer.get('withCredentials')

    if (typeof redirects !== 'boolean') {
      errors = errors.setIn(
        [i, 'withCredentials'],
        'With credentials must be true or false'
      )
    }
  })

  return errors
}

const emptyProvider = (index: any) => {
  const layer = {
    name: '',
    url: '',
    type: '',
    alpha: '',
    proxyEnabled: true,
    withCredentials: false,
    show: true,
    parameters: {
      transparent: false,
      format: '',
    },
    order: index,
  }
  const buffer = JSON.stringify(layer, null, 2)
  return fromJS({ buffer, layer })
}

const applyDefaults =
  (previousType = '') =>
  (provider: any) => {
    const layer = provider.get('layer')

    if (previousType === '' && previousType !== layer.get('type')) {
      const opts = options[layer.get('type') as keyof typeof options]
      const defaults = fromJS({ layer: opts !== undefined ? opts.config : {} })
      return defaults.mergeDeep(provider)
    }

    return provider
  }

const updateLayerFromBuffer = (provider: any) => {
  try {
    const layer = fromJS(JSON.parse(provider.get('buffer')))
    return provider.set('layer', layer)
  } catch (e) {
    return provider
  }
}

const updateBufferFromLayer = (provider: any) => {
  const layer = provider.get('layer')
  const buffer = JSON.stringify(layer, null, 2)
  return provider.set('buffer', buffer)
}

const providers = (
  state = List(),
  {
    type,
    path,
    value = emptyProvider(state.size),
  }: { type: any; path: any; value: any }
) => {
  switch (type) {
    case 'map-layers/SET':
      return value
        .get('imageryProviders')
        .map((layer: any) =>
          fromJS({ layer, buffer: JSON.stringify(layer, null, 2) })
        )
    case 'map-layers/UPDATE':
      const [index] = path

      if (value === null) {
        return state
          .remove(index)
          .map((layer: any, i: any) =>
            layer.setIn(['layer', 'order'], i).update(updateBufferFromLayer)
          )
      }

      const previousType = state.getIn([index, 'layer', 'type'])

      const updater = path.includes('buffer')
        ? updateLayerFromBuffer
        : updateBufferFromLayer

      return state
        .setIn(path, fromJS(value))
        .update(index, applyDefaults(previousType))
        .update(index, updater)
        .sortBy((provider: any) => provider.getIn(['layer', 'order']))
    default:
      return state
  }
}

const loading = (state = false, { type }: { type: any }) => {
  switch (type) {
    case 'map-layers/END_SUBMIT':
      return false
    case 'map-layers/START_SUBMIT':
      return true
    default:
      return state
  }
}

const config = (state = Map(), { type, value }: { type: any; value: any }) => {
  switch (type) {
    case 'map-layers/SET':
      return value.mergeDeep(value)
    default:
      return state
  }
}

const msg = (
  state = {},
  { type, text, action }: { type: any; text: any; action: any }
) => {
  switch (type) {
    case 'map-layers/MESSAGE':
      return { text, action }
    default:
      return state
  }
}

const invalid = (
  state = null,
  { type, buffer }: { type: any; buffer: any }
) => {
  switch (type) {
    case 'map-layers/SET_INVALID':
      return buffer
    default:
      return state
  }
}

export default combineReducers({
  config,
  providers,
  loading,
  msg,
  invalid,
} as any)
