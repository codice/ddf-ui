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
import React from 'react'
const wreqr = require('../../js/wreqr.js')
const Marionette = require('marionette')
const _ = require('underscore')
const $ = require('jquery')
const CustomElements = require('../../js/CustomElements.js')
const Dropzone = require('dropzone')
import { UploadItemCollection } from '../upload-item/upload-item.collection.view'
const UploadBatchModel = require('../../js/model/UploadBatch.js')
const Common = require('../../js/Common.js')
const UploadSummary = require('../upload-summary/upload-summary.view.js')

function namespacedEvent(event: any, view: any) {
  return event + '.' + view.cid
}

function updateDropzoneHeight(view: any) {
  const filesHeight = view.$el.find('.details-files').height()
  const elementHeight = view.$el.height()
  view.$el
    .find('.details-dropzone')
    .css(
      'height',
      'calc(' +
        elementHeight +
        'px - ' +
        filesHeight +
        'px - 20px - 2.75rem' +
        ')'
    )
}

export default Marionette.LayoutView.extend({
  template: function () {
    return (
      <>
        <div className="details-files">
          {this.uploadBatchModel ? (
            <UploadItemCollection
              collection={this.uploadBatchModel.get('uploads')}
            />
          ) : null}
        </div>
        <div className="details-dropzone">
          <div
            className="dropzone-text"
            onClick={() => {
              this.addFiles()
            }}
          >
            Drop files here or click to upload
          </div>
        </div>
        <div className="details-summary"></div>
        <div className="details-footer">
          <button
            data-id="Clearc"
            className="old-button footer-clear is-negative"
            onClick={() => {
              this.newUpload()
            }}
          >
            <span className="fa fa-times"></span>
            <span>Clear</span>
          </button>
          <button
            data-id="start"
            className="old-button footer-start is-positive"
            onClick={() => {
              this.startUpload()
            }}
          >
            <span className="fa fa-upload"></span>
            <span>Start</span>
          </button>
          <button
            data-id="stop"
            className="old-button footer-cancel is-negative"
            onClick={() => {
              this.cancelUpload()
            }}
          >
            <span className="fa fa-stop"></span>
            <span>Stop</span>
          </button>
          <button
            data-id="new"
            className="old-button footer-new is-positive"
            onClick={() => {
              this.newUpload()
            }}
          >
            <span className="fa fa-upload"></span>
            <span>New</span>
          </button>
        </div>
      </>
    )
  },
  tagName: CustomElements.register('ingest-details'),
  regions: {
    summary: '> .details-summary',
  },
  overrides: {},
  dropzone: undefined,
  uploadBatchModel: undefined,
  dropzoneAnimationRequestDetails: undefined,
  resetDropzone() {
    this.dropzone.options.autoProcessQueue = false
    this.dropzone.removeAllFiles(true)
  },
  triggerNewUpload() {
    this.resetDropzone()
    this.render()
    this.onBeforeShow()
  },
  onFirstRender() {
    this.setupDropzone()
    setTimeout(() => {
      this.triggerNewUpload()
    }, 100)
  },
  onBeforeShow() {
    this.setupBatchModel()
    this.showSummary()
    this.$el.removeClass()
    this.handleUploadUpdate()
  },
  setupBatchModel() {
    if (!this.uploadBatchModel) {
      this.uploadBatchModel = new UploadBatchModel(
        {},
        {
          dropzone: this.dropzone,
        }
      )
      this.setupBatchModelListeners()
    } else {
      this.uploadBatchModel.clear()
      const defaults = this.uploadBatchModel.defaults()
      delete defaults.uploads
      this.uploadBatchModel.set(defaults)
      this.uploadBatchModel.unset('id')
      this.uploadBatchModel.get('uploads').reset()
      this.uploadBatchModel.unlistenToDropzone()
      this.uploadBatchModel.initialize(undefined, {
        dropzone: this.dropzone,
      })
    }
  },
  setupBatchModelListeners() {
    this.listenTo(
      this.uploadBatchModel,
      'add:uploads remove:uploads reset:uploads',
      this.handleUploadUpdate
    )
    this.listenTo(this.uploadBatchModel, 'change:sending', this.handleSending)
    this.listenTo(this.uploadBatchModel, 'change:finished', this.handleFinished)
  },
  handleFinished() {
    this.$el.toggleClass('is-finished', this.uploadBatchModel.get('finished'))
  },
  handleSending() {
    this.$el.toggleClass('is-sending', this.uploadBatchModel.get('sending'))
  },
  handleUploadUpdate() {
    if (
      this.uploadBatchModel.get('uploads').length === 0 &&
      !this.uploadBatchModel.get('sending')
    ) {
      Common.cancelRepaintForTimeframe(this.dropzoneAnimationRequestDetails)
      this.$el.toggleClass('has-files', false)
      this.unlistenToResize()
      this.$el.find('.details-dropzone').css('height', '')
    } else {
      this.$el.toggleClass('has-files', true)
      this.updateDropzoneHeight()
    }
  },
  setupDropzone() {
    const _this = this
    this.dropzone = new Dropzone(this.el.querySelector('.details-dropzone'), {
      paramName: 'parse.resource',
      url: './internal/catalog/',
      maxFilesize: 5000000, //MB
      method: 'post',
      autoProcessQueue: false,
      headers: this.options.extraHeaders,
      sending(file: any, xhr: any, formData: any) {
        _.each(_this.overrides, (values: any, attribute: any) => {
          _.each(values, (value: any) => {
            formData.append('parse.' + attribute, value)
          })
        })
      },
    })
    if (this.options.handleUploadSuccess) {
      this.dropzone.on('success', this.options.handleUploadSuccess)
    }
  },
  addFiles() {
    this.$el.find('.details-dropzone').click()
  },
  showSummary() {
    this.summary.show(
      new UploadSummary({
        model: this.uploadBatchModel,
      })
    )
  },
  clearUploads() {
    this.uploadBatchModel.clear()
  },
  startUpload() {
    if (this.options.preIngestValidator) {
      this.options.preIngestValidator(
        _.bind(this.uploadBatchModel.start, this.uploadBatchModel)
      )
    } else {
      this.uploadBatchModel.start()
    }
  },
  cancelUpload() {
    this.uploadBatchModel.cancel()
  },
  newUpload() {
    this.$el.addClass('starting-new')
    setTimeout(() => {
      this.triggerNewUpload()
    }, 250)
  },
  expandUpload() {
    wreqr.vent.trigger('router:navigate', {
      fragment: 'uploads/' + this.uploadBatchModel.id,
      options: {
        trigger: true,
      },
    })
  },
  updateDropzoneHeight() {
    updateDropzoneHeight(this)
    this.listenToResize()
    Common.cancelRepaintForTimeframe(this.dropzoneAnimationRequestDetails)
    this.dropzoneAnimationRequestDetails = Common.repaintForTimeframe(
      2000,
      updateDropzoneHeight.bind(this, this)
    )
  },
  listenToResize() {
    $(window)
      .off(namespacedEvent('resize', this))
      .on(namespacedEvent('resize', this), this.updateDropzoneHeight.bind(this))
  },
  unlistenToResize() {
    $(window).off(namespacedEvent('resize', this))
  },
  onBeforeDestroy() {
    this.stopListening(this.uploadBatchModel)
    this.unlistenToResize()
  },
  setOverrides(json: any) {
    this.overrides = json
  },
})
