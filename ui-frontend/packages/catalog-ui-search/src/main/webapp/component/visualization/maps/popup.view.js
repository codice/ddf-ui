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

const DRAG_SENSITIVITY = 10

const PopupPreviewView = Marionette.ItemView.extend({
  selectionInterface: store,
  drag: 0,
  initialize(options) {
    this.map = options.map
    this.mapModel = options.mapModel

    this.map.onMouseTrackingForPopup(
      this.onMouseDown.bind(this),
      this.onMouseMove.bind(this),
      this.onMouseUp.bind(this)
    )

    this.listenForCameraChange()
  },
  template() {
    this.component = <PopupPreview map={this.mapModel} />
    return this.component
  },
  /**
   * Determine whether the component should be shown
   */
  getTarget() {
    return (
      this.mapModel.get('popupMetacard') ||
      this.mapModel.get('popupClusterModels')
    )
  },
  /**
   * Decide if the target references a cluster of metacards
   */
  targetIsCluster(targetMetacard, mapTarget) {
    return !targetMetacard && typeof mapTarget.mapTarget === 'object'
  },
  /**
   * Make popup mutually exclusive for metacards and clusters
   */
  setPopupMetacard(targetMetacard, location) {
    this.mapModel.setPopupClusterModels(undefined)
    this.mapModel.setPopupMetacard(targetMetacard, location)
  },
  /**
   * Make popup mutually exclusive for metacards and clusters
   */
  setPopupClusterModels(models, location) {
    this.mapModel.setPopupMetacard(undefined)
    this.mapModel.setPopupClusterModels(models, location)
  },
  onMouseDown() {
    this.drag = 0
  },
  /**
   * Do not hide the popup if the drag is greater than the designated DRAG_SENSITIVITY
   */
  onMouseMove() {
    this.drag += 1
  },
  /**
   * Update the event position in the model, will trigger popup to check if it needs to be shown
   */
  onMouseUp(event, mapTarget) {
    if (DRAG_SENSITIVITY > this.drag) {
      const targetMetacard = this.mapModel.get('targetMetacard')

      if (!this.targetIsCluster(targetMetacard, mapTarget)) {
        const location = this.getLocation(targetMetacard)
        this.setPopupMetacard(targetMetacard, location)
      } else {
        // give popup the cluster models
        const models = this.selectionInterface
          .getActiveSearchResults()
          .filter(m => mapTarget.mapTarget.includes(m.id))
        const location = this.getLocation(models)

        this.setPopupClusterModels(models, location)
      }
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
    if (this.getTarget()) {
      this.startPopupAnimating()
    }
  },
  handleCameraMoveEnd() {
    if (this.getTarget()) {
      window.cancelAnimationFrame(this.popupAnimationFrameId)
    }
  },
  /**
   * Get the pixel location from a metacard(s)
   * returns { left, top } relative to the map view
   */
  getLocation(target) {
    if (target) {
      target = Array.isArray(target) ? target : [target]
      const location = this.map.getWindowLocationsOfResults(target)
      const coordinates = location ? location[0] : undefined
      return coordinates
        ? { left: coordinates[0], top: coordinates[1] }
        : undefined
    }
  },
  startPopupAnimating() {
    if (this.getTarget()) {
      const mapModel = this.mapModel
      this.popupAnimationFrameId = window.requestAnimationFrame(() => {
        const location = this.getLocation(this.getTarget())
        mapModel.setPopupLocation(location)
        this.startPopupAnimating()
      })
    }
  },
})

module.exports = PopupPreviewView
