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
import { UploadItemViewReact } from './upload-item.view'

type UploadItemCollectionType = {
  collection: any
}

export const UploadItemCollection = ({
  collection,
}: UploadItemCollectionType) => {
  const [, setForceRender] = React.useState(Math.random())
  useListenTo(collection, 'add remove reset', () => {
    setForceRender(Math.random())
  })
  console.log(collection.models)
  return (
    <div className="is-list has-list-highlighting overflow-hidden">
      {collection.models.map((model: any) => {
        return <UploadItemViewReact key={model.cid} model={model} />
      })}
    </div>
  )
}
