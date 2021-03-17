import React, { useState, useEffect, useRef } from 'react'
import _ from 'underscore'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
// const _ = require('underscore')
const $ = require('jquery')
const Dropzone = require('dropzone')
const UploadBatchModel = require('../../js/model/UploadBatch.js')
const Common = require('../../js/Common.js')

type Props = {
  url: string
  extraHeaders: any
  handleUploadSuccess: any
  preIngestValidator: (value: any) => void
}

export const IngestDetailView = (props: Props) => {
  const root = useRef<HTMLDivElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const [dropzone, setDropzone] = useState()
  const [uploadBatchModel, setUploadBatchModel] = useState()
  const { listenTo } = useBackbone()

  useEffect(() => {
    if (!dropzone && dropzoneRef.current) {
      const drop = new Dropzone(dropzoneRef.current, {
        paramName: 'parse.resource',
        url: props.url,
        maxFilesize: 5000000, //MB
        method: 'post',
        autoProcessQueue: false,
        headers: props.extraHeaders,
        sending(file, xhr, formData) {
          _.each({}, (values, attribute) => {
            _.each(values, (value) => {
              formData.append('parse.' + attribute, value)
            })
          })
        },
      })

      setDropzone(drop)
      const uploadBatch = new UploadBatchModel({}, { dropzone: drop })

      setUploadBatchModel(uploadBatch)
      listenTo(
        uploadBatch,
        'add:uploads remove:uploads reset:uploads',
        () => {}
      )
      listenTo(uploadBatch, 'change:sending', () => {})
      listenTo(uploadBatch, 'change:finished', () => {})
    }
  }, [dropzoneRef.current])

  const newUpload = () => {
    root.current?.classList.add('starting-new')
    setTimeout(() => {
      // triggerNewUpload()
    }, 250)
  }

  const startUpload = () => {
    if (props.preIngestValidator) {
      props.preIngestValidator(_.bind(uploadBatchModel.start, uploadBatchModel))
    } else {
      uploadBatchModel.start()
    }
  }

  const cancelUpload = () => uploadBatchModel.cancel()

  // const handleUploadUpdate = () => {
  //   if (
  //     uploadBatchModel.get('uploads').length === 0 &&
  //     uploadBatchModel.get('sending')
  //   ) {
  //     Common.cancelRepaintForTimeframe(dropzoneAnimationRequestDetails)
  //     root.current?.classList.toggle('has-files', false)
  //     unlistenToResize()
  //     dropzoneRef.current?.style.setProperty('height', '')
  //     // $el.find('.details-dropzone').css('height', '')
  //   } else {
  //     root.current.classList.toggle('has-files', true)
  //     updateDropzoneHeight()
  //   }
  // }

  // updateDropzoneHeight() {
  //   updateDropzoneHeight(this)
  //   listenToResize()
  //   Common.cancelRepaintForTimeframe(dropzoneAnimationRequestDetails)
  //   dropzoneAnimationRequestDetails = Common.repaintForTimeframe(
  //     2000,
  //     updateDropzoneHeight.bind(this, this)
  //   )
  // }

  return (
    <div ref={root} className="ingest-details">
      <div className="details-files">
        {/* <MRC
          view={UploadItemCollectionView}
          viewOptions={{ collection: uploadBatchModel.get('uploads') }}
        /> */}
      </div>
      <div ref={dropzoneRef} className="details-dropzone">
        <div className="dropzone-text">Drop files here or click to upload</div>
      </div>
      <div className="details-summary"></div>
      <div className="details-footer">
        <button
          data-id="Clearc"
          className="old-button footer-clear is-negative"
          onClick={() => newUpload()}
        >
          <span className="fa fa-times"></span>
          <span>Clear</span>
        </button>
        <button
          data-id="start"
          className="old-button footer-start is-positive"
          onClick={() => startUpload()}
        >
          <span className="fa fa-upload"></span>
          <span>Starterjelkj</span>
        </button>
        <button
          data-id="stop"
          className="old-button footer-cancel is-negative"
          onClick={() => cancelUpload()}
        >
          <span className="fa fa-stop"></span>
          <span>Stop</span>
        </button>
        <button
          data-id="new"
          className="old-button footer-new is-positive"
          onClick={() => newUpload()}
        >
          <span className="fa fa-upload"></span>
          <span>New</span>
        </button>
      </div>
    </div>
  )
}
