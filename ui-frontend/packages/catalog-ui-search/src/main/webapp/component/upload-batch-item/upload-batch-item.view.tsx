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

const Common = require('../../js/Common.js')
const user = require('../singletons/user-instance.js')
import { UploadSummaryViewReact } from '../upload-summary/upload-summary.view'
import { Link } from 'react-router-dom'
import * as React from 'react'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'

export const UploadBatchItemViewReact = ({ model }: { model: any }) => {
  const [modelJson, setModelJson] = React.useState(model.toJSON())
  const [remove, setRemove] = React.useState(false)
  useListenTo(model, 'change:finished', () => {
    setModelJson(model.toJSON())
  })
  React.useEffect(() => {
    if (remove && model) {
      setTimeout(() => {
        model.collection.remove(model)
        user.get('user').get('preferences').savePreferences()
      }, 250)
    }
  }, [remove, model])
  const { id, finished, sentAt } = modelJson
  const when = Common.getMomentDate(sentAt)

  return (
    <div
      data-element="upload-batch-item"
      className={`${finished ? 'is-finished' : ''} ${
        remove ? 'is-destroyed' : ''
      }`}
    >
      <Link to={`/uploads/${id}`} style={{ display: 'block', padding: '0px' }}>
        <div className="upload-details">
          <div className="details-date is-medium-font">
            <span className="fa fa-upload" />
            <span>{when}</span>
          </div>
          <div className="details-summary">
            <UploadSummaryViewReact model={model} />
          </div>
        </div>
      </Link>
      <div className="upload-actions">
        <button
          className="old-button actions-stop is-negative"
          onClick={() => {
            model.cancel()
          }}
        >
          <span className="fa fa-stop" />
        </button>
        <button
          className="old-button actions-remove is-negative"
          onClick={() => {
            setRemove(true)
          }}
        >
          <span className="fa fa-minus" />
        </button>
      </div>
    </div>
  )
}
