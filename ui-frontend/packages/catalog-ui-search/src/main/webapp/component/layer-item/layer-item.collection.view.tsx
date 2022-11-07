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
/* global require*/
const Sortable = require('sortablejs')
import * as React from 'react'
import LayerItem from '../../react-component/layer-item'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'

function useSortable({
  sortableElement,
  updateOrdering,
  focusModel,
}: {
  sortableElement: HTMLDivElement | null
  updateOrdering: any
  focusModel: any
}) {
  const [sortable, setSortable] = React.useState<any>(null)

  React.useEffect(() => {
    if (sortableElement) {
      setSortable(
        Sortable.create(sortableElement, {
          handle: 'button.layer-rearrange',
          animation: 250,
          draggable: '>*', // TODO: make a PR to sortable so this won't be necessary
          onEnd: () => {
            focusModel.clear()
            updateOrdering()
          },
        })
      )
    }
  }, [sortableElement])

  return sortable
}

export const LayerItemCollectionViewReact = ({
  collection,
  updateOrdering,
  focusModel,
}: {
  collection: Array<any>
  updateOrdering: any
  focusModel: any
}) => {
  const [, setForceRender] = React.useState(Math.random())
  const [
    sortableElement,
    setSortableElement,
  ] = React.useState<HTMLDivElement | null>(null)
  const sortable = useSortable({ sortableElement, updateOrdering, focusModel })
  useListenTo(collection, 'sort', () => {
    setForceRender(Math.random())
  })

  return (
    <div ref={setSortableElement}>
      {collection.map((layer) => {
        return (
          <LayerItem
            key={layer.id}
            layer={layer}
            focusModel={focusModel}
            updateOrdering={updateOrdering}
            sortable={sortable}
          />
        )
      })}
    </div>
  )
}
