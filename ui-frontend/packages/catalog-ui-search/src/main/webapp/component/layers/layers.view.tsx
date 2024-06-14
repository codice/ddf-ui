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
import _ from 'underscore'
import Backbone from 'backbone'
import { LayerItemCollectionViewReact } from '../layer-item/layer-item.collection.view'
import user from '../singletons/user-instance'
import { hot } from 'react-hot-loader'
import Button from '@mui/material/Button'
import { useConfiguration } from '../../js/model/Startup/configuration.hooks'

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

type LayersViewReactProps = {
  layers?: Array<any>
}

const LayersViewReact = (props: LayersViewReactProps) => {
  const { getImageryProviders } = useConfiguration()
  const [focusModel] = React.useState(new FocusModel())
  const containerElementRef = React.useRef<HTMLDivElement>(null)

  const layers = props.layers ?? user.get('user>preferences>mapLayers')

  return (
    <div data-id="layers-container" ref={containerElementRef}>
      <div className="text-xl text-center">Layers</div>
      <div className="layers">
        <LayerItemCollectionViewReact
          collection={layers}
          updateOrdering={() => {
            _.forEach(
              // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'NodeListOf<Element> | undefined'... Remove this comment to see the full error message
              containerElementRef.current?.querySelectorAll(`.layer-item`),
              (element: any, index: any) => {
                layers.get(element.getAttribute('layer-id')).set('order', index)
              }
            )
            layers.sort()
          }}
          focusModel={focusModel}
        />
      </div>
      <div className="footer">
        <Button
          data-id="reset-to-defaults-button"
          onClick={() => {
            focusModel.clear()
            layers.forEach((viewLayer: any) => {
              const name = viewLayer.get('name')
              const defaultConfig = _.find(
                getImageryProviders(),
                (layerObj: any) => name === layerObj.name
              )
              viewLayer.set(defaultConfig)
            })
            layers.sort()
          }}
        >
          <span>Reset to Defaults</span>
        </Button>
      </div>
    </div>
  )
}

export default hot(module)(LayersViewReact)
