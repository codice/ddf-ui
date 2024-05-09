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
import { expect } from 'chai'
import user from '../../component/singletons/user-instance'
import { StartupDataStore } from './Startup/startup'
import _ from 'underscore'
import { userModifiableLayerProperties } from './User'

const exampleProviders1 = [
  {
    proxyEnabled: true,
    withCredentials: false,
    alpha: 1,
    name: 'World Topo Map - 1',
    show: true,
    type: 'AGM',
    parameters: {
      transparent: true,
      format: 'image/png',
    },
    url: './proxy/catalog20',
    order: 0,
  },
  {
    proxyEnabled: true,
    withCredentials: false,
    alpha: 1,
    name: 'World Imagery - 3',
    show: true,
    type: 'AGM',
    parameters: {
      transparent: true,
      format: 'image/png',
    },
    url: './proxy/catalog21',
    order: 1,
  },
]

// same as one, but with user modifiable properties changed (order, alpha, show)
const exampleProviders2 = [
  {
    proxyEnabled: true,
    withCredentials: false,
    alpha: 0.7,
    name: 'World Imagery - 3',
    show: false,
    type: 'AGM',
    parameters: {
      transparent: true,
      format: 'image/png',
    },
    url: './proxy/catalog21',
    order: 0,
  },
  {
    proxyEnabled: true,
    withCredentials: false,
    alpha: 0.7,
    name: 'World Topo Map - 1',
    show: true,
    type: 'AGM',
    parameters: {
      transparent: true,
      format: 'image/png',
    },
    url: './proxy/catalog20',
    order: 1,
  },
]

// same as one, but with one layer removed
const exampleProviders3 = [
  {
    proxyEnabled: true,
    withCredentials: false,
    alpha: 1,
    name: 'World Topo Map - 1',
    show: true,
    type: 'AGM',
    parameters: {
      transparent: true,
      format: 'image/png',
    },
    url: './proxy/catalog20',
    order: 0,
  },
]

describe('user preferences and such are handled correctly', () => {
  it('should overwrite user layers if none exist', () => {
    if (StartupDataStore.Configuration.config) {
      StartupDataStore.Configuration.config.imageryProviders = exampleProviders1
    }
    const userLayers = user.get('user>preferences>mapLayers')
    userLayers.reset([])

    expect(
      userLayers
        .toJSON()
        .map((layer: any) => _.omit(layer, userModifiableLayerProperties))
    ).to.deep.equal(
      exampleProviders1.map((layer) =>
        _.omit(layer, userModifiableLayerProperties)
      )
    )
  })

  it('should leave user layers alone if the configuration has not updated', () => {
    if (StartupDataStore.Configuration.config) {
      StartupDataStore.Configuration.config.imageryProviders = exampleProviders1
    }
    const userLayers = user.get('user>preferences>mapLayers')
    userLayers.reset(exampleProviders2)

    expect(
      userLayers
        .toJSON()
        .map((layer: any) => _.omit(layer, userModifiableLayerProperties))
    ).to.deep.equal(
      exampleProviders2.map((layer) =>
        _.omit(layer, userModifiableLayerProperties)
      )
    )
  })

  it('should remove layers that have been removed', () => {
    if (StartupDataStore.Configuration.config) {
      StartupDataStore.Configuration.config.imageryProviders = exampleProviders3
    }
    const userLayers = user.get('user>preferences>mapLayers')
    userLayers.reset(exampleProviders1)

    expect(
      userLayers
        .toJSON()
        .map((layer: any) => _.omit(layer, userModifiableLayerProperties))
    ).to.deep.equal(
      exampleProviders3.map((layer) =>
        _.omit(layer, userModifiableLayerProperties)
      )
    )
  })

  it('should add layers that have been added', () => {
    if (StartupDataStore.Configuration.config) {
      StartupDataStore.Configuration.config.imageryProviders = exampleProviders1
    }
    const userLayers = user.get('user>preferences>mapLayers')
    userLayers.reset(exampleProviders3)

    expect(
      userLayers
        .toJSON()
        .map((layer: any) => _.omit(layer, userModifiableLayerProperties))
    ).to.deep.equal(
      exampleProviders1.map((layer) =>
        _.omit(layer, userModifiableLayerProperties)
      )
    )
  })

  it('should handle empty imagery providers', () => {
    if (StartupDataStore.Configuration.config) {
      StartupDataStore.Configuration.config.imageryProviders = []
    }
    const userLayers = user.get('user>preferences>mapLayers')
    userLayers.reset(exampleProviders3)

    expect(
      userLayers
        .toJSON()
        .map((layer: any) => _.omit(layer, userModifiableLayerProperties))
    ).to.deep.equal(
      [].map((layer) => _.omit(layer, userModifiableLayerProperties))
    )
  })
})
