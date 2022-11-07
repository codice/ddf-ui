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
const Marionette = require('marionette')
const Backbone = require('backbone')
const properties = require('../../js/properties.js')
import { LayerItemCollectionViewReact } from '../layer-item/layer-item.collection.view'
const user = require('../singletons/user-instance.js')
const CustomElements = require('../../js/CustomElements.js')

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
export default Marionette.LayoutView.extend({
  attributes() {
    return {
      'data-id': 'layers-container',
    }
  },
  tagName: CustomElements.register('layers'),
  setDefaultModel() {
    this.model = user.get('user>preferences')
  },
  events: {
    'click > .footer button': 'resetDefaults',
  },
  template() {
    return (
      <React.Fragment>
        <div className="is-header">Layers</div>
        <div className="layers">
          <LayerItemCollectionViewReact
            collection={this.model.get('mapLayers')}
            updateOrdering={this.updateOrdering.bind(this)}
            focusModel={this.focusModel}
          />
        </div>
        <div className="footer">
          <button
            data-id="reset-to-defaults-button"
            className="old-button is-button"
          >
            <span>Reset to Defaults</span>
          </button>
        </div>
      </React.Fragment>
    )
  },
  regions: {
    layers: '> .layers',
  },
  initialize(options: any) {
    if (options.model === undefined) {
      this.setDefaultModel()
    }
    this.listenToModel()
    this.setupFocusModel()
  },
  setupFocusModel() {
    this.focusModel = new FocusModel()
  },
  listenToModel() {
    this.stopListeningToModel()
    this.listenTo(
      this.model.get('mapLayers'),
      'change:alpha change:show',
      this.save
    )
  },
  stopListeningToModel() {
    this.stopListening(
      this.model.get('mapLayers'),
      'change:alpha change:show',
      this.save
    )
  },
  resetDefaults() {
    this.focusModel.clear()
    this.stopListeningToModel()
    this.model.get('mapLayers').forEach((viewLayer: any) => {
      const name = viewLayer.get('name')
      const defaultConfig = _.find(
        properties.imageryProviders,
        (layerObj: any) => name === layerObj.name
      )
      viewLayer.set(defaultConfig)
    })
    this.model.get('mapLayers').sort()
    this.save()
    this.listenToModel()
  },
  updateOrdering() {
    _.forEach(
      this.$el.find(`${CustomElements.getNamespace()}layer-item`),
      (element: any, index: any) => {
        this.model
          .get('mapLayers')
          .get(element.getAttribute('layer-id'))
          .set('order', index)
      }
    )
    this.model.get('mapLayers').sort()
    this.save()
  },
  save() {
    this.model.savePreferences()
  },
})
