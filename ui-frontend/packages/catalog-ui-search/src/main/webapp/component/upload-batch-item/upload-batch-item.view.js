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

const wreqr = require('../../js/wreqr.js')
const Marionette = require('marionette')
const template = require('./upload-batch-item.hbs')
const CustomElements = require('../../js/CustomElements.js')
const Common = require('../../js/Common.js')
const user = require('../singletons/user-instance.js')
const UploadSummaryView = require('../upload-summary/upload-summary.view.js')
import { Link } from 'react-router-dom'
import * as React from 'react'

module.exports = Marionette.LayoutView.extend({
  template(data) {
    return (
      <React.Fragment>
        <Link
          to={`/uploads/${this.model.id}`}
          style={{ display: 'block', padding: '0px' }}
        >
          <div className="upload-details">
            <div className="details-date is-medium-font">
              <span className="fa fa-upload" />
              <span>{data.when}</span>
            </div>
            <div className="details-summary" />
          </div>
        </Link>
        <div className="upload-actions">
          <button className="old-button actions-stop is-negative">
            <span className="fa fa-stop" />
          </button>
          <button className="old-button actions-remove is-negative">
            <span className="fa fa-minus" />
          </button>
        </div>
      </React.Fragment>
    )
  },
  tagName: CustomElements.register('upload-batch-item'),
  modelEvents: {
    'change:finished': 'handleFinished',
  },
  events: {
    'click > .upload-actions .actions-stop': 'stopUpload',
    'click > .upload-actions .actions-remove': 'removeModel',
    'click > .upload-details': 'expandUpload',
  },
  regions: {
    uploadDetails: ' .upload-details .details-summary',
  },
  onBeforeShow() {
    this.uploadDetails.show(
      new UploadSummaryView({
        model: this.model,
      })
    )
    this.handleFinished()
  },
  handleFinished() {
    const finished = this.model.get('finished')
    this.$el.toggleClass('is-finished', finished)
  },
  removeModel() {
    this.$el.toggleClass('is-destroyed', true)
    setTimeout(() => {
      this.model.collection.remove(this.model)
      user.get('user').get('preferences').savePreferences()
    }, 250)
  },
  stopUpload() {
    this.model.cancel()
  },
  serializeData() {
    return {
      when: Common.getMomentDate(this.model.get('sentAt')),
    }
  },
})
