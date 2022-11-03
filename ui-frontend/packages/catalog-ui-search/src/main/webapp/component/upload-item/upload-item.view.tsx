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

type UploadItemViewReactType = {
  model: any
}

const modelToJSON = (model: any) => {
  const modelJSON = model.toJSON()
  modelJSON.file = {
    name: modelJSON.file.name,
    size: (modelJSON.file.size / 1000000).toFixed(2) + 'MB, ',
    type: modelJSON.file.type,
  }
  return modelJSON
}

export const UploadItemViewReact = ({ model }: UploadItemViewReactType) => {
  const [modelJson, setModelJson] = React.useState(modelToJSON(model))
  const [cancel, setCancel] = React.useState(false)
  useListenTo(
    model,
    'change:percentage change:sending change:success change:error change:validating change:issues',
    () => {
      setModelJson(modelToJSON(model))
    }
  )

  React.useEffect(() => {
    if (cancel && model) {
      model.cancel()
    }
  }, [cancel, model])

  const isSending = modelJson.sending
  const hasError = modelJson.error
  const hasSuccess = modelJson.success
  const hasIssues = modelJson.issues
  const isValidating = modelJson.validating

  return (
    <div
      data-element="upload-item"
      className={`${isSending ? 'show-progress' : ''} ${
        hasError ? 'has-error' : ''
      } ${hasSuccess ? 'has-success' : ''} ${
        hasIssues ? 'has-validation-issues' : ''
      } ${isValidating ? 'checking-validation' : ''} ${
        cancel ? 'is-removed' : ''
      }`}
      onClick={() => {
        if (model.get('success') && !model.hasChildren()) {
          wreqr.vent.trigger('router:navigate', {
            fragment: 'metacards/' + model.get('id'),
            options: {
              trigger: true,
            },
          })
        }
      }}
    >
      <div className="upload-info">
        <div className="info-details">
          <div className="details-top">
            <span className="top-filename">{modelJson.file.name}</span>
          </div>
          <div className="details-bottom">
            <div className="bottom-info">
              <span className="bottom-filesize">{modelJson.file.size}</span>
              <span className="bottom-filetype">{modelJson.file.type}</span>
            </div>
            <div className="bottom-percentage">
              {Math.floor(modelJson.percentage) + '%'}
            </div>
          </div>
        </div>
        <div
          className="info-progress"
          style={{
            width: `${modelJson.percentage}%`,
          }}
        ></div>
        <div className="info-success">
          <div className="success-message">
            <span className="success-issues fa fa-exclamation-triangle"></span>
            <span className="success-validate fa fa-refresh fa-spin is-critical-animation"></span>
            <span className="message-text">{modelJson.message}</span>
          </div>
        </div>
        <div className="info-error">
          <div className="error-message">{modelJson.message}</div>
        </div>
      </div>

      <div className="upload-actions">
        <button
          className="old-button upload-cancel is-negative"
          onClick={() => {
            setCancel(true)
          }}
        >
          <span className="fa fa-minus"></span>
        </button>

        <div
          className="upload-expand is-positive"
          onClick={() => {
            wreqr.vent.trigger('router:navigate', {
              fragment: 'metacards/' + model.get('id'),
              options: {
                trigger: true,
              },
            })
          }}
        >
          <span className="fa fa-check"></span>
        </div>

        <div className="upload-fail is-negative">
          <span className="fa fa-exclamation-triangle"></span>
        </div>
      </div>
    </div>
  )
}
