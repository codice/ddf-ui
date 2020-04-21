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

import * as React from 'react'
const Marionette = require('marionette')
const store = require('../../../js/store.js')

import PopupPreview from '../../../react-component/popup-preview'

const PopupPreviewView = Marionette.ItemView.extend({
  selectionInterface: store,
  initialize(options) {
    this.map = options.map
    this.mapModel = options.mapModel

    this.map.onLeftClick(this.onLeftClick.bind(this))

    this.listenForCameraChange()
  },
  template() {
    this.component = <PopupPreview map={this.mapModel} />
    return this.component
  },
  /**
   * Determine whether the component should be shown
   */
  getMetacard() {
    return this.mapModel.get('popupMetacard')
  },
  /**
    Update the event position in the model, will trigger popup to check if it needs to be shown
   */
  onLeftClick(event, mapEvent) {
    event.preventDefault()
    const targetMetacard = this.mapModel.get('targetMetacard')
    const location = this.getMetacardLocation(targetMetacard)
    if (location) {
      this.mapModel.setPopupMetacard(targetMetacard, location)
    } else {
      this.mapModel.setPopupMetacard(targetMetacard)
    }
  },
  /**
   * Methods for moving the popup when there is camera movement
   */
  listenForCameraChange() {
    this.map.onCameraMoveStart(this.handleCameraMoveStart.bind(this))
    this.map.onCameraMoveEnd(this.handleCameraMoveEnd.bind(this))
  },
  handleCameraMoveStart() {
    if (this.getMetacard()) {
      this.startPopupAnimating()
    }
  },
  handleCameraMoveEnd() {
    if (this.getMetacard()) {
      window.cancelAnimationFrame(this.popupAnimationFrameId)
    }
  },
  getMetacardLocation(metacard) {
    if (metacard) {
      const location = this.map.getWindowLocationsOfResults([metacard])
      const coordinates = location ? location[0] : undefined
      return coordinates ? {left: coordinates[0], top: coordinates[1]} : undefined
    }
  },
  startPopupAnimating() {
    if (this.getMetacard()) {
      const map = this.map
      const mapModel = this.mapModel
      this.popupAnimationFrameId = window.requestAnimationFrame(() => {
        const location = this.getMetacardLocation(this.getMetacard())
        if (location && location.left > 0 && location.top > 0) {
          mapModel.setPopupLocation(location)
        }
        this.startPopupAnimating()
      })
    }
  },
})

module.exports = PopupPreviewView
