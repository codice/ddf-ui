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
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { Order, Visibility } from '.'
import LayerItemPresentation from './presentation/layer-item'
import { useListenTo } from '../../component/selection-checkbox/useBackbone.hook'

const CustomElements = require('../../js/CustomElements')
const Component = CustomElements.register('layer-item')

type State = {
  order: Order
  visibility: Visibility
}

type ContainerProps = {
  layer: Backbone.Model
  sortable: any
  updateOrdering: any
  focusModel: any
}

const mapPropsToState = (props: ContainerProps) => {
  const { layer } = props
  const show = layer.get('show')
  const alpha = layer.get('alpha')
  const order = layer.get('order')
  const isBottom = layer.collection.last().id === layer.id
  const isTop = layer.collection.first().id === layer.id

  return {
    order: { order, isBottom, isTop },
    visibility: { show, alpha },
  }
}

const LayerItem = (props: ContainerProps) => {
  const [state, setState] = React.useState<State>(mapPropsToState(props))
  useListenTo(props.layer, 'change:show change:alpha change:order', () => {
    setState(mapPropsToState(props))
  })
  useListenTo(props.layer.collection, 'sort remove add', () => {
    setState(mapPropsToState(props))
  })

  const { layer } = props
  const id = layer.get('id')
  const layerInfo = {
    name: layer.get('name'),
    warning: layer.get('warning'),
    isRemovable: layer.has('userRemovable'),
    id,
  }

  const actions = {
    updateLayerShow: () => {
      const show = state.visibility.show
      props.layer.set('show', !show)
    },
    updateLayerAlpha: (e: any) => {
      props.layer.set('alpha', e.target.value)
    },
    moveDown: () => {
      const { focusModel, layer, sortable, updateOrdering } = props
      const ordering = sortable.toArray()
      const currentIndex = ordering.indexOf(layer.id)
      ordering.splice(currentIndex, 1)
      ordering.splice(currentIndex + 1, 0, layer.id)
      sortable.sort(ordering)
      focusModel.setDown(layer.id)
      updateOrdering()
    },
    moveUp: () => {
      const { layer, sortable, focusModel, updateOrdering } = props
      const ordering = sortable.toArray()
      const currentIndex = ordering.indexOf(layer.id)
      ordering.splice(currentIndex - 1, 0, layer.id)
      ordering.splice(currentIndex + 1, 1)
      sortable.sort(ordering)
      focusModel.setUp(layer.id)
      updateOrdering()
    },
    onRemove: () => {
      const { layer } = props
      layer.collection.remove(layer)
    },
  }

  const presProps = {
    ...state,
    layerInfo,
    actions: actions,
    options: { focusModel: props.focusModel },
  }

  return (
    <Component data-id={id} layer-id={id}>
      <LayerItemPresentation {...presProps} />
    </Component>
  )
}

export default hot(module)(LayerItem)
