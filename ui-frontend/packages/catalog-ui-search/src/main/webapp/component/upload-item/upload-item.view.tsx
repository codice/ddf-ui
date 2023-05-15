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
import { hot } from 'react-hot-loader'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import wreqr from '../../js/wreqr'
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
      className={`flex flex-row items-center flex-nowrap w-full p-4 border-gray-600/25 border`}
      onClick={() => {
        if (model.get('success') && !model.hasChildren()) {
          ;(wreqr as any).vent.trigger('router:navigate', {
            fragment: 'metacards/' + model.get('id'),
            options: {
              trigger: true,
            },
          })
        }
      }}
    >
      <div className="w-full shrink">
        <div className="text-center">
          <div>
            <span className="top-filename">{modelJson.file.name}</span>
          </div>
          <div>
            <div>
              <span className="bottom-filesize">{modelJson.file.size}</span>
              <span className="bottom-filetype">{modelJson.file.type}</span>
            </div>
            <div>{Math.floor(modelJson.percentage) + '%'}</div>
          </div>
        </div>
        {!hasSuccess && !hasError && isSending ? (
          <LinearProgress
            className="h-2 w-full"
            value={modelJson.percentage}
            variant="determinate"
          />
        ) : null}

        {hasSuccess ? (
          <div className="info-success text-center">
            <div className="success-message">
              {hasIssues ? (
                <span>Uploaded, but quality issues were found </span>
              ) : (
                <></>
              )}
              {isValidating ? (
                <span className="success-validate fa fa-refresh fa-spin is-critical-animation"></span>
              ) : (
                <></>
              )}
              {hasIssues ? <span className="message-text"></span> : <></>}
            </div>
          </div>
        ) : null}
        {hasError ? (
          <div className="info-error text-center">
            <div className="error-message">{modelJson.message}</div>
          </div>
        ) : null}
      </div>

      <div className="upload-actions shrink-0">
        {!isSending ? (
          <Button
            onClick={() => {
              setCancel(true)
            }}
          >
            Remove
          </Button>
        ) : null}

        {hasSuccess ? (
          <Button
            onClick={() => {
              ;(wreqr as any).vent.trigger('router:navigate', {
                fragment: 'metacards/' + model.get('id'),
                options: {
                  trigger: true,
                },
              })
            }}
          >
            Success
          </Button>
        ) : (
          <></>
        )}

        {hasError ? (
          <>
            <div>Failures</div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
export default hot(module)(UploadItemViewReact)
