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

import user from '../singletons/user-instance'
import { UploadSummaryViewReact } from '../upload-summary/upload-summary.view'
import { Link } from 'react-router-dom'
import * as React from 'react'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import CloseIcon from '@material-ui/icons/Close'
import Common from '../../js/Common'
import { TypedUserInstance } from '../singletons/TypedUser'

export const UploadBatchItemViewReact = ({ model }: { model: any }) => {
  const [modelJson, setModelJson] = React.useState(model.toJSON())
  useListenTo(model, 'change:finished', () => {
    setModelJson(model.toJSON())
  })
  const { id, finished, sentAt, interrupted } = modelJson
  const when = Common.getRelativeDate(sentAt)
  const specificWhen = TypedUserInstance.getMomentDate(sentAt)

  return (
    <Paper
      className={`${
        finished ? 'is-finished' : ''
      }  flex flex-row items-stretch flex-nowrap w-full justify-between p-2`}
    >
      <Link
        to={`/uploads/${id}`}
        style={{ display: 'block', padding: '0px' }}
        className="w-full flex-shrink no-underline"
        title={specificWhen}
      >
        <div className="upload-details">
          <div className="details-date is-medium-font">
            <span className="fa fa-upload p-2" />
            <span>{when}</span>
          </div>
          <div className="details-summary mt-2">
            <UploadSummaryViewReact model={model} />
          </div>
        </div>
      </Link>
      <div className="upload-actions shrink-0 ">
        {finished || interrupted ? (
          <>
            <Button
              className=" h-full w-12"
              onClick={() => {
                model.collection.remove(model)
                user.get('user').get('preferences').savePreferences()
              }}
            >
              <CloseIcon />
            </Button>
          </>
        ) : (
          <>
            <Button
              className=" h-full w-12"
              onClick={() => {
                model.cancel()
              }}
            >
              <span className="fa fa-stop" />
            </Button>
          </>
        )}
      </div>
    </Paper>
  )
}
