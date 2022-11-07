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
const _ = require('underscore')
const Dropzone = require('dropzone')
import { UploadItemCollection } from '../upload-item/upload-item.collection.view'
const UploadBatchModel = require('../../js/model/UploadBatch.js')
import { UploadSummaryViewReact } from '../upload-summary/upload-summary.view'
import Button from '@material-ui/core/Button'

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
      if (((dropzoneElement as unknown) as any).dropzone) {
        setDropzone(((dropzoneElement as unknown) as any).dropzone)
      } else {
        setDropzone(
          new Dropzone(dropzoneElement, {
            previewsContainer: false,
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
    }
  }, [dropzoneElement])
  return dropzone
}

const useUploadBatchModel = ({
  dropzone,
  getNewUploadBatchModel,
  setGetNewUploadBatchModel,
}: {
  dropzone: any
  getNewUploadBatchModel: boolean
  setGetNewUploadBatchModel: (val: boolean) => void
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
  console.log(uploadBatchModelJSON)
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
    if (dropzone && getNewUploadBatchModel) {
      setUploadBatchModel(
        new UploadBatchModel(
          {},
          {
            dropzone,
          }
        )
      )
      setGetNewUploadBatchModel(false)
    }
  }, [dropzone, getNewUploadBatchModel])

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
    if (uploadBatchModel.json.finished) {
      setMode('is-finished')
      return
    }
    if (uploadBatchModel.json.sending) {
      setMode('is-uploading')
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
      uploadBatchModel.model.unset('id')
      dropzone.options.autoProcessQueue = false
      dropzone.removeAllFiles(true)
      uploadBatchModel.model.clear()
      const defaults = uploadBatchModel.model.defaults()
      delete defaults.uploads
      uploadBatchModel.model.set(defaults)
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
  const [getNewUploadBatchModel, setGetNewUploadBatchModel] = React.useState(
    true
  )
  const uploadBatchModel = useUploadBatchModel({
    dropzone,
    getNewUploadBatchModel,
    setGetNewUploadBatchModel,
  })
  const [mode] = useIngestMode({ uploadBatchModel, dropzone })

  return (
    <div className="ingest-details p-2 w-full h-full flex flex-col items-center flex-no-wrap overflow-hidden space-y-2">
      <div className="details-files w-full overflow-auto">
        {uploadBatchModel.model ? (
          <UploadItemCollection
            collection={uploadBatchModel.model.get('uploads')}
          />
        ) : null}
      </div>
      {mode === 'empty' || mode === 'has-files' ? (
        <div
          className="details-dropzone border border-dashed w-full h-full flex flex-col justify-center items-center cursor-pointer"
          ref={setDropzoneElement}
        >
          <div
            className="text-4xl cursor-pointer"
            onClick={() => {
              if (dropzoneElement) {
                dropzoneElement.click()
              }
            }}
          >
            Drop files here or click to upload
          </div>
        </div>
      ) : null}
      {mode === 'is-finished' || mode === 'is-uploading' ? (
        <div className="details-summary w-full mt-2">
          {uploadBatchModel.model ? (
            <UploadSummaryViewReact model={uploadBatchModel.model} />
          ) : null}
        </div>
      ) : null}
      <div className="details-footer w-full flex flex-row items-center flex-no-wrap overflow-hidden flex-shrink-0 mt-2">
        {mode === 'has-files' ? (
          <>
            <Button
              onClick={() => {
                setGetNewUploadBatchModel(true)
              }}
              className="w-full"
            >
              Clear
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (props.preIngestValidator) {
                  props.preIngestValidator(
                    _.bind(uploadBatchModel.model.start, uploadBatchModel.model)
                  )
                } else {
                  uploadBatchModel.model.start()
                }
              }}
              className="w-full"
            >
              Start
            </Button>
          </>
        ) : null}
        {mode === 'is-uploading' ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              uploadBatchModel.model.cancel()
            }}
            className="w-full"
          >
            Stop
          </Button>
        ) : null}
        {mode === 'is-finished' ? (
          <Button
            variant="contained"
            color="primary"
            data-id="new"
            onClick={() => {
              setGetNewUploadBatchModel(true)
            }}
            className="w-full"
          >
            New
          </Button>
        ) : null}
      </div>
    </div>
  )
}
