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
import * as ReactDOM from 'react-dom'
import _ from 'underscore'
import _merge from 'lodash/merge'
import _debounce from 'lodash/debounce'
import $ from 'jquery'
import wreqr from '../../js/wreqr'
import GoldenLayout from 'golden-layout'
import properties from '../../js/properties'
import user from '../singletons/user-instance'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'sani... Remove this comment to see the full error message
import sanitize from 'sanitize-html'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import AllOutIcon from '@material-ui/icons/AllOut'
import MinimizeIcon from '@material-ui/icons/Minimize'
import MaximizeIcon from '@material-ui/icons/Add'
import CloseIcon from '@material-ui/icons/Close'
import ExtensionPoints from '../../extension-points/extension-points'
import { Visualizations } from '../visualization/visualizations'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../theme/theme'

const treeMap = (obj: any, fn: any, path = []): any => {
  if (Array.isArray(obj)) {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    return obj.map((v, i) => treeMap(v, fn, path.concat(i)))
  }
  if (obj !== null && typeof obj === 'object') {
    return (
      Object.keys(obj)
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        .map((k) => [k, treeMap(obj[k], fn, path.concat(k))])
        .reduce((o, [k, v]) => {
          // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          o[k] = v
          return o
        }, {})
    )
  }
  return fn(obj, path)
}
// @ts-expect-error ts-migrate(6133) FIXME: 'sanitizeTree' is declared but its value is never ... Remove this comment to see the full error message
const sanitizeTree = (tree: any) =>
  treeMap(tree, (obj: any) => {
    if (typeof obj === 'string') {
      return sanitize(obj, {
        allowedTags: [],
        allowedAttributes: [],
      })
    }
    return obj
  })
function getGoldenLayoutSettings() {
  return {
    settings: {
      showPopoutIcon: false,
      responsiveMode: 'none',
    },
    dimensions: {
      borderWidth: 8,
      minItemHeight: 50,
      minItemWidth: 50,
      headerHeight: 44,
      dragProxyWidth: 300,
      dragProxyHeight: 200,
    },
    labels: {
      close: 'close',
      maximise: 'maximize',
      minimise: 'minimize',
      popout: 'open in new window',
      popin: 'pop in',
      tabDropdown: 'additional tabs',
    },
  }
}
const GoldenLayoutComponentHeader = ({
  viz,
  tab,
  options,
  componentState,
  container,
  name,
}: {
  viz: any
  tab: any
  options: any
  componentState: any
  container: any
  name: any
}) => {
  const [width, setWidth] = React.useState(tab.header.element.width())
  React.useEffect(() => {
    if (tab) {
      tab.header.parent.on('resize', () => {
        setWidth(tab.header.element.width())
      })
    }
  }, [tab])
  const isMinimized = width <= 100
  return (
    <ExtensionPoints.providers>
      <div
        data-id={`${name}-tab`}
        className={`flex flex-row items-center flex-nowrap ${
          isMinimized ? 'hidden' : ''
        }`}
      >
        <Grid item className="px-2 text-lg">
          <div>{tab.titleElement.text()}</div>
        </Grid>
        <Grid item>
          {viz.header ? (
            <viz.header
              {..._.extend({}, options, componentState, {
                container,
              })}
            />
          ) : null}
        </Grid>
        <Grid item>
          {tab.closeElement[0].style.display !== 'none' ? (
            <Button
              data-id="close-tab-button"
              onClick={(e) => {
                tab._onCloseClickFn(e)
              }}
            >
              <CloseIcon />
            </Button>
          ) : null}
        </Grid>
      </div>
    </ExtensionPoints.providers>
  )
}
const GoldenLayoutComponent = ({
  ComponentView,
  options,
  container,
}: {
  options: any
  ComponentView: any
  container: any
}) => {
  const [width, setWidth] = React.useState<number>(container.width)
  React.useEffect(() => {
    if (container) {
      container.on('resize', () => {
        setWidth(container.width)
      })
    }
  }, [container])
  const isMinimized = width <= 100
  return (
    <ExtensionPoints.providers>
      <Paper
        elevation={Elevations.panels}
        className={`w-full h-full ${isMinimized ? 'hidden' : ''}`}
        square
      >
        <ComponentView selectionInterface={options.selectionInterface} />
      </Paper>
    </ExtensionPoints.providers>
  )
}
// see https://github.com/deepstreamIO/golden-layout/issues/239 for details on why the setTimeout is necessary
// The short answer is it mostly has to do with making sure these ComponentViews are able to function normally (set up events, etc.)
function registerComponent(
  marionetteView: any,
  name: any,
  ComponentView: any,
  componentOptions: any,
  viz: any
) {
  const options = _.extend({}, marionetteView.options, componentOptions)
  marionetteView.goldenLayout.registerComponent(
    name,
    (container: any, componentState: any) => {
      container.on('open', () => {
        setTimeout(() => {
          ReactDOM.render(
            <GoldenLayoutComponent
              options={options}
              ComponentView={ComponentView}
              container={container}
            />,
            container.getElement()[0]
          )
          container.on('destroy', () => {
            ReactDOM.unmountComponentAtNode(container.getElement()[0])
          })
        }, 0)
      })
      container.on('tab', (tab: any) => {
        tab.closeElement.off('click').on('click', (event: any) => {
          if (
            tab.header.parent.isMaximised &&
            tab.header.parent.contentItems.length === 1
          ) {
            tab.header.parent.toggleMaximise()
          }
          tab._onCloseClickFn(event)
        })
        const root = document.createElement('div')
        tab.element.append(root)
        let intervalId = setInterval(() => {
          try {
            ReactDOM.render(
              <GoldenLayoutComponentHeader
                viz={viz}
                tab={tab}
                options={options}
                componentState={componentState}
                container={container}
                name={name}
              />,
              tab.element[0]
            )
            clearInterval(intervalId)
          } catch (err) {}
        }, 100)
      })
    }
  )
}
function removeActiveTabInformation(config: any): any {
  if (config.activeItemIndex !== undefined) {
    config.activeItemIndex = 0
  }
  if (config.content === undefined || config.content.length === 0) {
    return
  } else {
    return _.forEach(config.content, removeActiveTabInformation)
  }
}
function removeMaximisedInformation(config: any) {
  delete config.maximisedItemId
}
function removeEphemeralState(config: any) {
  removeMaximisedInformation(config)
  removeActiveTabInformation(config)
  return config
}
const FALLBACK_GOLDEN_LAYOUT = [
  {
    type: 'stack',
    content: [
      {
        type: 'component',
        componentName: 'cesium',
        title: '3D Map',
      },
      {
        type: 'component',
        componentName: 'inspector',
        title: 'Inspector',
      },
    ],
  },
]
export const DEFAULT_GOLDEN_LAYOUT_CONTENT = {
  content: (properties as any).defaultLayout || FALLBACK_GOLDEN_LAYOUT,
}
export const getStringifiedDefaultLayout = () => {
  try {
    return JSON.stringify(DEFAULT_GOLDEN_LAYOUT_CONTENT)
  } catch (err) {
    console.warn(err)
    return JSON.stringify(FALLBACK_GOLDEN_LAYOUT)
  }
}
type GoldenLayoutViewProps = {
  layoutResult?: LazyQueryResult['plain']
  editLayoutRef?: React.MutableRefObject<any>
  configName?: string
  selectionInterface: any
  setGoldenLayout: (instance: any) => void
}
function getGoldenLayoutConfig({
  layoutResult,
  editLayoutRef,
  configName,
}: GoldenLayoutViewProps) {
  let currentConfig = undefined
  if (layoutResult) {
    try {
      currentConfig = JSON.parse(layoutResult.metacard.properties.layout)
    } catch (err) {
      console.warn('issue parsing a saved layout, falling back to default')
    }
  } else if (editLayoutRef) {
    currentConfig = editLayoutRef.current
  } else {
    currentConfig = user.get('user').get('preferences').get(configName)
  }
  if (currentConfig === undefined) {
    currentConfig = DEFAULT_GOLDEN_LAYOUT_CONTENT
  }
  _merge(currentConfig, getGoldenLayoutSettings())
  return currentConfig
}
function registerGoldenLayoutComponents({
  goldenLayout,
  options,
}: {
  goldenLayout: any
  options: GoldenLayoutViewProps
}) {
  Visualizations.forEach((viz) => {
    try {
      registerComponent(
        { goldenLayout, options },
        viz.id,
        viz.view,
        viz.options,
        viz
      )
    } catch (err) {
      // likely already registered, in dev
    }
  })
}
export function getInstanceConfig({ goldenLayout }: { goldenLayout: any }) {
  const currentConfig = goldenLayout.toConfig()
  return removeEphemeralState(currentConfig)
}
function handleGoldenLayoutStateChange({
  options,
  goldenLayout,
  currentConfig,
  lastConfig,
}: {
  goldenLayout: any
  currentConfig: any
  options: GoldenLayoutViewProps
  lastConfig: React.MutableRefObject<any>
}) {
  ;(wreqr as any).vent.trigger('resize') // do we need this?
  if (
    _.isEqual(
      removeEphemeralState(lastConfig.current),
      removeEphemeralState(currentConfig)
    )
  ) {
    return
  }
  lastConfig.current = currentConfig
  /**
   * If we have this option, then we're editing a layout in the layout editor.
   * Otherwise, we're using a layout (or possibly custom) and need to take a change as indication of moving to custom.
   */
  if (options.editLayoutRef) {
    options.editLayoutRef.current = currentConfig
  } else {
    // can technically do detections of max or empty here
    //https://github.com/deepstreamIO/golden-layout/issues/253
    if (goldenLayout.isInitialised) {
      user.get('user').get('preferences').set(options.configName, currentConfig)
      ;(wreqr as any).vent.trigger('resize')
      //do not add a window resize event, that will cause an endless loop.  If you need something like that, listen to the wreqr resize event.
    }
    user.get('user').get('preferences').set(
      {
        layoutId: 'custom',
      },
      {
        internal: true,
      }
    )
  }
}
/**
 *  Replace the toolbar with our own
 */
function handleGoldenLayoutStackCreated(stack: any) {
  let intervalId = setInterval(() => {
    try {
      ReactDOM.render(
        <GoldenLayoutToolbar stack={stack} />,
        stack.header.controlsContainer[0]
      )
      clearInterval(intervalId)
    } catch (err) {}
  }, 100)
}
const GoldenLayoutToolbar = ({ stack }: { stack: any }) => {
  const [width, setWidth] = React.useState<number>(stack.header.element.width())
  React.useEffect(() => {
    if (stack) {
      stack.on('resize', () => {
        setWidth(stack.header.element.width())
      })
    }
  }, [stack])
  const isMinimized = width <= 100
  return (
    <ExtensionPoints.providers>
      <Grid container direction="row" wrap="nowrap">
        {isMinimized ? (
          <>
            {' '}
            <Grid item>
              <Button
                data-id="maximise-tab-button"
                onClick={() => {
                  const prevWidth = stack.config.prevWidth || 500
                  const prevHeight = stack.config.prevHeight || 500
                  stack.contentItems[0].container.setSize(prevWidth, prevHeight)
                }}
              >
                <MaximizeIcon />
              </Button>
            </Grid>
          </>
        ) : (
          <>
            <Grid item>
              <Button
                data-id="minimise-layout-button"
                onClick={() => {
                  stack.config.prevWidth =
                    stack.getActiveContentItem().container.width
                  stack.config.prevHeight =
                    stack.getActiveContentItem().container.height
                  stack.contentItems[0].container.setSize(10, 45)
                }}
              >
                <MinimizeIcon />
              </Button>
            </Grid>
            <Grid item>
              <Button
                data-id="maximise-layout-button"
                onClick={() => {
                  stack.toggleMaximise()
                }}
              >
                <AllOutIcon />
              </Button>
            </Grid>
            <Grid item>
              {stack.header._isClosable() ? (
                <Button
                  data-id="close-layout-button"
                  onClick={() => {
                    if (stack.isMaximised) {
                      stack.toggleMaximise()
                    }
                    stack.remove()
                  }}
                >
                  <CloseIcon />
                </Button>
              ) : null}
            </Grid>
          </>
        )}
      </Grid>
    </ExtensionPoints.providers>
  )
}
export const GoldenLayoutViewReact = (options: GoldenLayoutViewProps) => {
  const [goldenLayoutAttachElement, setGoldenLayoutAttachElement] =
    React.useState<HTMLDivElement | null>(null)
  const [goldenLayout, setGoldenLayout] = React.useState<any>(null)
  const lastConfig = React.useRef<any>(null)
  useListenTo((wreqr as any).vent, 'gl-updateSize', () => {
    goldenLayout.updateSize()
  })
  React.useEffect(() => {
    if (goldenLayout) {
      options.setGoldenLayout(goldenLayout)
    }
    return () => {
      if (goldenLayout) {
        goldenLayout.destroy()
      }
    }
  }, [goldenLayout])
  React.useEffect(() => {
    const randomString = Math.random().toString()
    $(window).on(
      'resize.' + randomString,
      _debounce(
        () => {
          goldenLayout.updateSize()
        },
        100,
        {
          leading: false,
          trailing: true,
        }
      )
    )
    return () => {
      $(window).off('resize.' + randomString)
    }
  }, [goldenLayout])
  React.useEffect(() => {
    if (goldenLayoutAttachElement) {
      setGoldenLayout(
        new GoldenLayout(
          getGoldenLayoutConfig(options),
          goldenLayoutAttachElement
        )
      )
    }
  }, [goldenLayoutAttachElement])
  React.useEffect(() => {
    if (goldenLayout) {
      registerGoldenLayoutComponents({
        goldenLayout,
        options,
      })

      const debouncedHandleGoldenLayoutStateChange = _.debounce(
        ({ currentConfig }: { currentConfig: any }) => {
          handleGoldenLayoutStateChange({
            options,
            currentConfig,
            goldenLayout,
            lastConfig,
          })
        },
        200
      )
      /**
       *  There is a bug in golden layout as follows:
       *  If you have a layout with 2 items (inspector above inspector for instance), close an item, then close the other,
       *  the final state change event is not triggered to show content as [] or empty.  Oddly enough it works in other scenarios.
       *  I haven't determined a workaround for this, but it's not bothering users as far as I know at the moment.
       *  Basically the bug is that empty layouts aren't guaranteed to be saved, but non empty will always save appropriately.
       */
      goldenLayout.on('stateChanged', () => {
        const currentConfig = getInstanceConfig({ goldenLayout })
        /**
         *  Get the config instantly, that way if we navigate away and the component is removed from the document we still get the correct config
         *  However, delay the actual attempt to save the config, so we don't save too often.
         */
        debouncedHandleGoldenLayoutStateChange({
          currentConfig,
        })
      })
      goldenLayout.on('stackCreated', handleGoldenLayoutStackCreated)
      goldenLayout.on('initialised', () => {
        // can do empty and max detections here
        /**
         *  This is necessary to properly save pref on the first change that happens from a completely empty layout on first load.
         *  Used to be done in handleStateChange (if null, set), but that did not trigger for empty layouts on first load.
         */
        lastConfig.current = getInstanceConfig({ goldenLayout })
      })
      goldenLayout.init()
      return () => {
        goldenLayout.off('stateChanged')
        goldenLayout.off('stackCreated')
      }
    }
    return () => {}
  }, [goldenLayout])
  return (
    <div data-element="golden-layout" className="is-minimised h-full w-full">
      <div
        ref={setGoldenLayoutAttachElement}
        className="golden-layout-container w-full h-full"
      />
    </div>
  )
}
