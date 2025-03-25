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
import { combineReducers } from 'redux-immutable'
import { fromJS, Map } from 'immutable'
import traverse from 'traverse'
import ReactDOM from 'react-dom'
import { Theme } from '@material-ui/core/styles'
import { DetachedRootTheme } from '../../app-root/theme'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import Map2DIcon from '@material-ui/icons/Map'
import Map3DIcon from '@material-ui/icons/Public'
import TimelineIcon from '@material-ui/icons/Timeline'
import InspectorIcon from '@material-ui/icons/Info'
import HistogramIcon from '@material-ui/icons/BarChart'
import ResultsIcon from '@material-ui/icons/List'
import 'golden-layout/src/css/goldenlayout-base.css'
import 'golden-layout/src/css/goldenlayout-dark-theme.css'

window.React = React
window.ReactDOM = ReactDOM
const GoldenLayout = require('golden-layout')

const SET_CONFIG = 'default-layout/SET_CONFIG'
const SET_BUFFER = 'default-layout/SET_BUFFER'
const INIT_EDITOR = 'default-layout/INIT_EDITOR'
const START_SUBMIT = 'default-layout/START_SUBMIT'
const END_SUBMIT = 'default-layout/END_SUBMIT'
const MESSAGE = 'default-layout/MESSAGE'
const UPDATE = 'default-layout/UPDATE'
const RESET = 'default-layout/RESET'

interface VisualizationProps {
  children: React.ReactNode
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>
  theme?: Theme
}

class BaseVisualization extends React.Component<VisualizationProps> {
  render() {
    const { children, icon: Icon } = this.props
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div
          className="flex flex-row flex-nowrap items-center justify-center"
          style={{ color: 'white', textAlign: 'center', fontSize: '32px' }}
        >
          <Icon className="mr-2" style={{ fontSize: '40px' }} />
          <div>{children}</div>
        </div>
      </div>
    )
  }
}

const configPath = ['value', 'configurations', 0, 'properties']
const baseDefault = [
  {
    type: 'stack',
    content: [
      {
        type: 'component',
        component: 'cesium',
        componentName: 'cesium',
        title: '3D Map',
      },
      {
        type: 'component',
        component: 'inspector',
        componentName: 'inspector',
        title: 'Inspector',
      },
    ],
  },
]
const visualizationsDefault = [
  {
    name: 'openlayers',
    title: '2D Map',
    icon: Map2DIcon,
  },
  {
    name: 'cesium',
    title: '3D Map',
    icon: Map3DIcon,
  },
  {
    name: 'inspector',
    title: 'Inspector',
    icon: InspectorIcon,
  },
  {
    name: 'histogram',
    title: 'Histogram',
    icon: HistogramIcon,
  },
  {
    name: 'results',
    title: 'Results',
    icon: ResultsIcon,
  },
  {
    name: 'timeline',
    title: 'Timeline',
    icon: TimelineIcon,
  },
]

const select = (state: any) => state.get('layout')
const getConfig = (state: any) => select(state).get('config')
const getEditor = (state: any) => select(state).get('editor')
export const getBuffer = (state: any) => select(state).get('buffer')
export const isLoading = (state: any) => select(state).get('loading')
export const getMessage = (state: any) => select(state).get('msg')

export const hasChanges = (state: any) => {
  const buffer = getBuffer(state).get('buffer')
  const config = getConfig(state)
  try {
    const buffMap = fromJS(JSON.parse(buffer))
    const confMap = fromJS(config)
    return !confMap.equals(buffMap)
  } catch (e) {
    return false
  }
}

export const setConfig = (value: any) => ({
  type: SET_CONFIG,
  value,
})
export const setBuffer = (value: any) => ({
  type: SET_BUFFER,
  value,
})
export const setEditor = (value: any) => ({
  type: INIT_EDITOR,
  value,
})
export const start = () => ({
  type: START_SUBMIT,
})
export const end = () => ({
  type: END_SUBMIT,
})
export const message = (text: any, action?: any) => ({
  type: MESSAGE,
  text,
  action,
})

export const validateJson = (json: any) => {
  try {
    JSON.parse(json)
    return 'valid'
  } catch (e) {
    return 'invalid'
  }
}

export const update = (value: any) => (dispatch: any, getState: any) => {
  const isValid = validateJson(value)
  if (isValid === 'valid') {
    updateLayout(value, getState)

    return dispatch({
      type: UPDATE,
      value,
    })
  }
}

export const reset = () => (dispatch: any, getState: any) => {
  const config = getConfig(getState())

  updateLayout(config.get('defaultLayout'), getState)

  return dispatch({
    type: RESET,
    value: config,
  })
}

export const updateLayout = (value: any, getState: any) => {
  const state = getState()
  const editor = getEditor(state)

  const settings = editor.config
  const prevSettings = settings.content
  try {
    settings.content = convertLayout(value, true)
    editor.destroy()
    editor.config = settings
    editor.init()
  } catch (e) {
    editor.destroy()
    editor.config.content = prevSettings
    editor.init()
  }
}

// @ts-ignore
export const rendered = () => (dispatch: any, getState: any) => {}
export const fetch = () => (dispatch: any, getState: any) => {
  dispatch(start())
  const url = [
    '/admin',
    'jolokia',
    'exec',
    'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
    'getService',
    '(service.pid=org.codice.ddf.catalog.ui)',
  ].join('/')

  window
    .fetch(url, {
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    .then((res) => res.json())
    .then((json) => {
      const config = fromJS(json).getIn(configPath)
      dispatch(setConfig(config))
      setupEditor(dispatch, getState)
      dispatch(end())
    })
    .catch((e) => {
      dispatch(end())
      dispatch(message(`Unable to retrieve map layers: ${e.message}`))
    })
}

export const save = () => (dispatch: any, getState: any) => {
  const state = getState()
  const url =
    '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/add'
  const buffer = getBuffer(state)

  if (validate(buffer) !== undefined) {
    return dispatch(message('Cannot save because of validation errors'))
  }
  dispatch(start())

  const layout = convertLayout(buffer.get('buffer'), false)
  let config = getConfig(state).set('defaultLayout', layout)

  const body = {
    type: 'EXEC',
    mbean:
      'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
    operation: 'update',
    arguments: [
      'org.codice.ddf.catalog.ui',
      config.update('defaultLayout', JSON.stringify).toJS(),
    ],
  }

  const opts = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(body),
  }

  window
    .fetch(url, opts as any)
    .then((res) => res.text())
    .then((body) => {
      const res = JSON.parse(
        body.replace(
          /(\[Ljava\.lang\.(Long|String);@[^,]+)/g,
          (_, str) => `"${str}"`
        )
      )
      if (res.status !== 200) {
        throw new Error(res.error)
      }
      config = getConfig(state).set('defaultLayout', JSON.stringify(layout))
      dispatch(setConfig(config))
      dispatch(end())
      dispatch(message('Successfully saved default layout'))
    })
    .catch((e) => {
      dispatch(end())
      dispatch(message(`Unable to save default layout: ${e.message}`))
    })
}

export const validate = (buffer: any) => {
  let error
  const conf = buffer.get('buffer')
  try {
    JSON.parse(conf)
  } catch (e) {
    error = `Invalid JSON configuration`
  }
  return error
}

export const convertLayout = (configStr: any, toReact: any) => {
  const config = JSON.parse(configStr)
  const omit = ['isClosable', 'reorderEnabled', 'activeItemIndex', 'header']
  return traverse(config).map(function () {
    // @ts-ignore
    if (this.key === 'componentName') {
      // @ts-ignore
      this.update(toReact ? 'lm-react-component' : this.parent.node.component)
    }
    // @ts-ignore
    if (omit.includes(this.key)) {
      // @ts-ignore
      this.remove()
    }
  })
}

const setupEditor = (dispatch: any, getState: any) => {
  const state = getState()
  const config = getConfig(state).get('defaultLayout')
  const baseConf = {
    settings: {
      showPopoutIcon: false,
      showMaximiseIcon: false,
    },
    content: convertLayout(config, true),
  }

  let layout = new GoldenLayout(baseConf, '#layoutContainer')
  const visualizations = visualizationsDefault
  visualizations.forEach((component: any) => {
    console.log('component', component)
    layout.registerComponent(
      component.name,
      class VisualizationComponent extends React.Component {
        render() {
          return (
            <DetachedRootTheme>
              <BaseVisualization icon={component.icon}>
                {component.title}
              </BaseVisualization>
            </DetachedRootTheme>
          )
        }
      }
    )
  })

  layout.on('initialised', function () {
    dispatch(setEditor(layout))
  })

  layout.on('stateChanged', function () {
    if (layout.isInitialised) {
      var glConf = layout.toConfig().content
      var content = JSON.stringify(glConf, null, 2)
      dispatch(setBuffer(content))
    }
  })

  layout.init()

  interface LayoutOptionProps {
    item: {
      name: string
      title: string
      icon: React.ComponentType<{
        style?: React.CSSProperties
        className?: string
      }>
    }
  }

  class LayoutOption extends React.Component<LayoutOptionProps> {
    private component: any

    componentDidMount() {
      layout.createDragSource(ReactDOM.findDOMNode(this), this.component)
    }

    constructor(props: LayoutOptionProps) {
      super(props)
      this.component = {
        type: 'react-component',
        component: props.item.name,
        componentName: props.item.name,
        title: props.item.title,
      }
    }

    handleClick = () => {
      if (layout.root.contentItems.length === 0) {
        layout.root.addChild({
          type: 'stack',
          content: [this.component],
        })
      } else {
        layout.root.contentItems[0].addChild(this.component)
      }
    }

    render() {
      const Icon = this.props.item.icon
      return (
        <MenuItem onClick={this.handleClick}>
          <Icon className="mr-2" /> {this.props.item.title}
        </MenuItem>
      )
    }
  }

  const MenuList = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
      setAnchorEl(null)
    }

    return (
      <DetachedRootTheme>
        <>
          <IconButton onClick={handleClick}>
            <AddIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {visualizationsDefault.map((component: any, i: number) => (
              <LayoutOption key={i} item={component} />
            ))}
          </Menu>
        </>
      </DetachedRootTheme>
    )
  }

  ReactDOM.render(<MenuList />, document.getElementById('layoutMenu'))
}

const loading = (state = false, { type }: any) => {
  switch (type) {
    case END_SUBMIT:
      return false
    case START_SUBMIT:
      return true
    default:
      return state
  }
}

export const config = (state = Map(), { type, value }: any) => {
  switch (type) {
    case SET_CONFIG:
      if (!value.get('defaultLayout')) {
        value = value.set('defaultLayout', JSON.stringify(baseDefault))
      }
      if (!value.get('visualizations')) {
        value = value.set(
          'visualizations',
          JSON.stringify(visualizationsDefault)
        )
      }
      return value
    case RESET:
      return state
    default:
      return state
  }
}

const editor = (state = Map(), { type, value = undefined }: any) => {
  switch (type) {
    case INIT_EDITOR:
      return value
    default:
      return state
  }
}

export const buffer = (state = Map(), { type, value }: any) => {
  switch (type) {
    case SET_BUFFER:
      const parsed = convertLayout(value, false)
      return state.set('buffer', JSON.stringify(parsed, null, 2))
    case RESET:
      const defaultConf = JSON.parse(value.get('defaultLayout'))
      return state.set('buffer', JSON.stringify(defaultConf, null, 2))
    default:
      return state
  }
}

const msg = (state = {}, { type, text, action }: any) => {
  switch (type) {
    case MESSAGE:
      return { text, action }
    default:
      return state
  }
}

export default combineReducers({ config, buffer, editor, loading, msg })
