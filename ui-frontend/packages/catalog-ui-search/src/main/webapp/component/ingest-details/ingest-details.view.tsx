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
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
const wreqr = require('../../js/wreqr.js')
const Marionette = require('marionette')
const _ = require('underscore')
const $ = require('jquery')
const CustomElements = require('../../js/CustomElements.js')
const Dropzone = require('dropzone')
import { UploadItemCollection } from '../upload-item/upload-item.collection.view'
const UploadBatchModel = require('../../js/model/UploadBatch.js')
const Common = require('../../js/Common.js')
import { UploadSummaryViewReact } from '../upload-summary/upload-summary.view'

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

type IngestModeType = 'empty' | 'has-files' | 'is-uploading' | 'is-finished'

type IngestDetailsViewReactType = {
  extraHeaders?: any
  overrides?: any
  handleUploadSuccess?: any
  preIngestValidator?: any
}

const useDropzone = ({
  dropzoneElement,
  extraHeaders,
  overrides,
  handleUploadSuccess,
}: { dropzoneElement: HTMLElement | null } & IngestDetailsViewReactType) => {
  const [dropzone, setDropzone] = React.useState<any>(null)
  React.useEffect(() => {
    if (dropzone && handleUploadSuccess) {
      dropzone.on('success', handleUploadSuccess)
    }
  }, [dropzone])
  React.useEffect(() => {
    if (dropzoneElement) {
      setDropzone(
        new Dropzone(dropzoneElement, {
          paramName: 'parse.resource',
          url: './internal/catalog/',
          maxFilesize: 5000000, //MB
          method: 'post',
          autoProcessQueue: false,
          headers: extraHeaders,
          sending(_file: any, _xhr: any, formData: any) {
            _.each(overrides, (values: any, attribute: any) => {
              _.each(values, (value: any) => {
                formData.append('parse.' + attribute, value)
              })
            })
          },
        })
      )
    }
  }, [dropzoneElement])
  return dropzone
}

const useUploadBatchModel = ({
  dropzone,
}: {
  dropzone: any
}): { model: any; json: any } => {
  const [uploadBatchModel, setUploadBatchModel] = React.useState<any>(dropzone)
  const [uploadBatchModelJSON, setUploadBatchModelJSON] = React.useState<any>(
    null
  )
  const callback = React.useMemo(() => {
    return () => {
      setUploadBatchModelJSON(uploadBatchModel.toJSON())
    }
  }, [uploadBatchModel])

  useListenTo(
    uploadBatchModel,
    'add:uploads remove:uploads reset:uploads change:sending change:finished',
    callback
  )

  React.useEffect(() => {
    if (uploadBatchModel) {
      setUploadBatchModelJSON(uploadBatchModel.toJSON())
    }
  }, [uploadBatchModel])

  React.useEffect(() => {
    if (dropzone) {
      setUploadBatchModel(
        new UploadBatchModel(
          {},
          {
            dropzone,
          }
        )
      )
    }
  }, [dropzone])

  return {
    model: uploadBatchModel,
    json: uploadBatchModelJSON,
  }
}

function useIngestMode({
  uploadBatchModel,
  dropzone,
}: {
  uploadBatchModel: {
    model: any
    json: any
  }
  dropzone: any
}): [IngestModeType, React.Dispatch<React.SetStateAction<IngestModeType>>] {
  const [mode, setMode] = React.useState<IngestModeType>('empty')

  React.useEffect(() => {
    if (!uploadBatchModel.json) {
      setMode('empty')
      return
    }
    if (uploadBatchModel.json.sending) {
      setMode('is-uploading')
      return
    }
    if (uploadBatchModel.json.finished) {
      setMode('is-finished')
      return
    }
    if (uploadBatchModel.json.uploads.length > 0) {
      setMode('has-files')
    } else {
      setMode('empty')
    }
  }, [uploadBatchModel])

  React.useEffect(() => {
    if (mode === 'empty' && dropzone && uploadBatchModel.model) {
      // reset dropzone
      dropzone.options.autoProcessQueue = false
      dropzone.removeAllFiles(true)
      uploadBatchModel.model.clear()
      const defaults = uploadBatchModel.model.defaults()
      delete defaults.uploads
      uploadBatchModel.model.set(defaults)
      uploadBatchModel.model.unset('id')
      uploadBatchModel.model.get('uploads').reset()
      uploadBatchModel.model.unlistenToDropzone()
      uploadBatchModel.model.initialize(undefined, {
        dropzone,
      })
    }
  }, [mode, dropzone, uploadBatchModel.model])
  return [mode, setMode]
}

export const IngestDetailsViewReact = (props: IngestDetailsViewReactType) => {
  const [
    dropzoneElement,
    setDropzoneElement,
  ] = React.useState<HTMLDivElement | null>(null)
  const dropzone = useDropzone({
    dropzoneElement,
    ...props,
  })
  const uploadBatchModel = useUploadBatchModel({ dropzone })
  const [mode, setMode] = useIngestMode({ uploadBatchModel, dropzone })

  return (
    <div data-element="ingest-details">
      <div className="details-files">
        {uploadBatchModel.model ? (
          <UploadItemCollection
            collection={uploadBatchModel.model.get('uploads')}
          />
        ) : null}
      </div>
      <div className="details-dropzone" ref={setDropzoneElement}>
        <div
          className="dropzone-text"
          onClick={() => {
            if (dropzoneElement) {
              dropzoneElement.click()
            }
          }}
        >
          Drop files here or click to upload
        </div>
      </div>
      <div className="details-summary">
        {uploadBatchModel.model ? (
          <UploadSummaryViewReact model={uploadBatchModel.model} />
        ) : null}
      </div>
      <div className="details-footer">
        <button
          data-id="Clearc"
          className="old-button footer-clear is-negative"
          onClick={() => {
            setMode('empty')
          }}
        >
          <span className="fa fa-times"></span>
          <span>Clear</span>
        </button>
        <button
          data-id="start"
          className="old-button footer-start is-positive"
          onClick={() => {
            if (props.preIngestValidator) {
              props.preIngestValidator(
                _.bind(uploadBatchModel.model.start, uploadBatchModel.model)
              )
            } else {
              uploadBatchModel.model.start()
            }
          }}
        >
          <span className="fa fa-upload"></span>
          <span>Start</span>
        </button>
        <button
          data-id="stop"
          className="old-button footer-cancel is-negative"
          onClick={() => {
            uploadBatchModel.model.cancel()
          }}
        >
          <span className="fa fa-stop"></span>
          <span>Stop</span>
        </button>
        <button
          data-id="new"
          className="old-button footer-new is-positive"
          onClick={() => {
            setMode('empty')
          }}
        >
          <span className="fa fa-upload"></span>
          <span>New</span>
        </button>
      </div>
    </div>
  )
}
