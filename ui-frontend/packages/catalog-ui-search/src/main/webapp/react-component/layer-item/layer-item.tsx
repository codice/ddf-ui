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
import { Box, Button, Slider } from '@mui/material'
import { useListenTo } from '../../component/selection-checkbox/useBackbone.hook'

export type LayerInfo = {
  name: string
  id: string
  warning: string
  isRemovable: boolean
}

export type Order = {
  order: number
  isBottom: boolean
  isTop: boolean
}

export type Visibility = {
  alpha: number
  show: boolean
}

export type Actions = {
  updateLayerShow: () => void
  updateLayerAlpha: (e: any) => void
  moveDown: (e: any) => void
  moveUp: (e: any) => void
  onRemove: () => void
}

export type PresentationProps = {
  layerInfo: LayerInfo
  order: Order
  visibility: Visibility
  actions: Actions
  options?: any
}

const LayerName = (props: PresentationProps) => {
  const { name = 'Untitled' } = props.layerInfo
  const { show } = props.visibility

  return (
    <Box
      title={name}
      className={`overflow-hidden text-ellipsis leading-[40px] ${
        !show && 'opacity-50 cursor-text'
      }`}
    >
      {name}
    </Box>
  )
}

const LayerAlpha = (props: PresentationProps) => {
  const { show, alpha } = props.visibility
  const { updateLayerAlpha } = props.actions

  return (
    <Slider
      data-id="alpha-slider"
      onChange={updateLayerAlpha}
      value={alpha}
      min={0}
      max={1}
      step={0.01}
      disabled={!show}
      className="inline-block align-middle"
    />
  )
}

const LayerInteractions = (props: PresentationProps) => {
  const { isRemovable, warning = '' } = props.layerInfo
  const { updateLayerShow, onRemove } = props.actions
  const { show } = props.visibility

  return (
    <Box className="text-right">
      {warning !== '' && (
        <Button
          data-id="view-warnings-button"
          title={warning}
          className="w-[40px] h-[40px] align-top text-warning"
        >
          <span className="fa fa-warning" />
        </Button>
      )}

      {isRemovable && (
        <Button
          data-id="remove-layer-button"
          title="Remove map layer from user preferences."
          onClick={onRemove}
          className="w-[40px] h-[40px] align-top"
        >
          <span className="fa fa-minus" />
        </Button>
      )}

      <Button
        data-id="visibility-button"
        title="Toggle layer visibility."
        onClick={updateLayerShow}
        className="w-[40px] h-[40px] align-middle relative inline-block"
      >
        <span
          className={`fa ${
            show ? 'fa-eye' : 'fa-eye-slash'
          } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}
        />
      </Button>
    </Box>
  )
}

const LayerRearrange = (props: PresentationProps) => {
  const upRef = React.useRef<HTMLButtonElement>(null)
  const downRef = React.useRef<HTMLButtonElement>(null)
  const { isTop, isBottom } = props.order
  const { moveUp, moveDown } = props.actions
  const { id } = props.layerInfo
  const { focusModel } = props.options

  React.useEffect(() => {
    if (focusModel.id === id) {
      let focusRef = focusModel.isUp() ? upRef : downRef
      focusRef = isTop ? downRef : focusRef
      focusRef = isBottom ? upRef : focusRef
      setTimeout(() => focusRef.current?.focus(), 0)
    }
  }, [])

  return (
    <div className="relative grow-0 shrink-0 w-[40px]">
      {!isTop && (
        <Button
          ref={upRef}
          onClick={moveUp}
          className="absolute z-10 top-0 h-[20px] w-full leading-[20px] opacity-0 focus:opacity-100 hover:opacity-100"
        >
          <span className="fa fa-angle-up absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </Button>
      )}
      {!isBottom && (
        <Button
          ref={downRef}
          onClick={moveDown}
          className="absolute z-10 bottom-0 h-[20px] w-full leading-[20px] opacity-0 focus:opacity-100 hover:opacity-100"
        >
          <span className="fa fa-angle-down absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </Button>
      )}
      <Button
        data-id="layer-rearrange-button"
        className="layer-rearrange w-full h-full cursor-grab active:cursor-grabbing relative z-0"
      >
        <span className="fa fa-arrows-v" />
      </Button>
    </div>
  )
}

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
    <div className="layer-item" data-id={id} layer-id={id}>
      <div
        className={`flex flex-row items-stretch whitespace-nowrap w-full overflow-hidden relative border-2 border-white/10 ${
          !state.order.isTop && 'border-t-0'
        } min-w-[400px]`}
      >
        <LayerRearrange {...presProps} />
        <Box className="inline-block align-middle px-4 w-full border-l-2 border-white/10 grow shrink">
          <LayerName {...presProps} />
          <LayerAlpha {...presProps} />
          <LayerInteractions {...presProps} />
        </Box>
      </div>
    </div>
  )
}

export default LayerItem
