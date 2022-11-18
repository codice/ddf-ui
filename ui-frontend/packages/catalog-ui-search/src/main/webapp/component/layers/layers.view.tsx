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
/* global require*/
import React from 'react'
const _ = require('underscore')
const Backbone = require('backbone')
const properties = require('../../js/properties.js')
import { LayerItemCollectionViewReact } from '../layer-item/layer-item.collection.view'
const user = require('../singletons/user-instance.js')
import { hot } from 'react-hot-loader'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import debounce from 'lodash.debounce'

// this is to track focus, since on reordering rerenders and loses focus
const FocusModel = Backbone.Model.extend({
  defaults: {
    id: undefined,
    direction: undefined,
  },
  directions: {
    up: 'up',
    down: 'down',
  },
  clear() {
    this.set({
      id: undefined,
      direction: undefined,
    })
  },
  setUp(id: any) {
    this.set({
      id,
      direction: this.directions.up,
    })
  },
  setDown(id: any) {
    this.set({
      id,
      direction: this.directions.down,
    })
  },
  getDirection() {
    return this.get('direction')
  },
  isUp() {
    return this.getDirection() === this.directions.up
  },
  isDown() {
    return this.getDirection() === this.directions.down
  },
})

const LayersViewReact = () => {
  const [focusModel] = React.useState(new FocusModel())
  const containerElementRef = React.useRef<HTMLDivElement>(null)
  const saveCallback = React.useMemo(() => {
    return debounce(() => {
      user.get('user>preferences').save()
    }, 100)
  }, [])
  useListenTo(
    user.get('user>preferences').get('mapLayers'),
    'change:alpha change:show',
    saveCallback
  )

  return (
    <div data-id="layers-container" ref={containerElementRef}>
      <div className="is-header">Layers</div>
      <div className="layers">
        <LayerItemCollectionViewReact
          collection={user.get('user>preferences').get('mapLayers')}
          updateOrdering={() => {
            _.forEach(
              containerElementRef.current?.querySelectorAll(`.layer-item`),
              (element: any, index: any) => {
                user
                  .get('user>preferences')
                  .get('mapLayers')
                  .get(element.getAttribute('layer-id'))
                  .set('order', index)
              }
            )
            user.get('user>preferences').get('mapLayers').sort()
            // user.get('user>preferences').save()
          }}
          focusModel={focusModel}
        />
      </div>
      <div className="footer">
        <button
          data-id="reset-to-defaults-button"
          className="old-button is-button"
          onClick={() => {
            focusModel.clear()
            user
              .get('user>preferences')
              .get('mapLayers')
              .forEach((viewLayer: any) => {
                const name = viewLayer.get('name')
                const defaultConfig = _.find(
                  properties.imageryProviders,
                  (layerObj: any) => name === layerObj.name
                )
                viewLayer.set(defaultConfig)
              })
            user.get('user>preferences').get('mapLayers').sort()
            user.get('user>preferences').save()
          }}
        >
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  )
}

export default hot(module)(LayersViewReact)
