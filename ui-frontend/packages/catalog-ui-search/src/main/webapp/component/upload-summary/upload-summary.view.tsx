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
import LinearProgress from '@material-ui/core/LinearProgress'
import Button from '@material-ui/core/Button'
const wreqr = require('../../js/wreqr.js')

type UploadSummaryViewReactType = {
  model: any
}

export const UploadSummaryViewReact = ({
  model,
}: UploadSummaryViewReactType) => {
  const [modelJson, setModelJson] = React.useState(model.toJSON())
  useListenTo(
    model,
    'change:amount change:errors change:complete change:percentage change:sending change:issues',
    () => {
      setModelJson(model.toJSON())
    }
  )

  const {
    amount,
    complete,
    percentage,
    success,
    sending,
    error,
    issues,
    interrupted,
    finished,
  } = modelJson

  const isSending = sending
  const hasError = error
  const hasSuccess = success
  const hasIssues = issues > 0
  const wasInterrupted = interrupted
  return (
    <Button
      className={`${isSending ? 'show-progress' : ''} ${
        hasError ? 'has-error' : ''
      } ${hasSuccess ? 'has-success' : ''} ${hasIssues ? 'has-issues' : ''} ${
        wasInterrupted ? 'was-interrupted' : ''
      }`}
      fullWidth
      onClick={() => {
        wreqr.vent.trigger('router:navigate', {
          fragment: 'uploads/' + model.id,
          options: {
            trigger: true,
          },
        })
      }}
    >
      <div className="upload-summary is-medium-font">
        <div className="summary-info flex flex-col justify-start items-center">
          <div className="info-files">
            <span className="files-issues fa fa-exclamation-triangle mr-2"></span>
            <span className="files-text">{`${
              complete + ' / ' + amount + ' Completed'
            }`}</span>
          </div>
          {!finished && !wasInterrupted ? (
            <>
              <div className="info-percentage">
                {Math.floor(percentage) + '%'}
              </div>
              <LinearProgress
                className="w-full h-2"
                variant="determinate"
                value={percentage}
              />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </Button>
  )
}
