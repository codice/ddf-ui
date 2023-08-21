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
import { createRoot } from 'react-dom/client'
import _ from 'underscore'
import _merge from 'lodash/merge'
import _debounce from 'lodash/debounce'
import _cloneDeep from 'lodash.clonedeep'
import _isEqualWith from 'lodash.isequalwith'
import $ from 'jquery'
import wreqr from '../../js/wreqr'
import GoldenLayout from 'golden-layout'
import user from '../singletons/user-instance'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'sani... Remove this comment to see the full error message
import sanitize from 'sanitize-html'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import AllOutIcon from '@mui/icons-material/AllOut'
import MinimizeIcon from '@mui/icons-material/Minimize'
import MaximizeIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import ExtensionPoints from '../../extension-points/extension-points'
import { Visualizations } from '../visualization/visualizations'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import Paper from '@mui/material/Paper'
import { Elevations } from '../theme/theme'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
import { TypedUserInstance } from '../singletons/TypedUser'
import PopoutIcon from '@mui/icons-material/OpenInNew'
import { useHistory } from 'react-router-dom'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { StartupDataStore } from '../../js/model/Startup/startup'

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
      popoutWholeStack: true,
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

const GoldenLayoutWindowCommunicationEvents = {
  requestInitialState: 'requestInitialState',
  consumeInitialState: 'consumeInitialState',
  consumeStateChange: 'consumeStateChange',
  consumePreferencesChange: 'consumePreferencesChange',
  consumeSubwindowLayoutChange: 'consumeSubwindowLayoutChange',
  consumeNavigationChange: 'consumeNavigationChange',
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
          {!tab.contentItem.layoutManager.isSubWindow &&
          tab.closeElement[0].style.display !== 'none' ? (
            <Button
              data-id="popout-tab-button"
              onClick={() => {
                tab.contentItem.popout()
              }}
            >
              <PopoutIcon />
            </Button>
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

/**
 *  For some reason golden layout removes configs from local storage upon first load of popout window, which means refreshing doesn't work.
 *  This prevents this line from doing so: https://github.com/golden-layout/golden-layout/blob/v1.5.9/src/js/LayoutManager.js#L797
 */
;(function preventRemovalFromStorage() {
  const normalRemoveItem = window.localStorage.removeItem
  window.localStorage.removeItem = (key: string) => {
    if (key.includes('gl-window')) {
      return
    } else {
      normalRemoveItem(key)
    }
  }
})()

/**
 *  Overrides navigation functionality within subwindows of golden layout, so that navigation is handled by the main window.
 *
 *  Notice we do this as a component rather than a hook so we can override the same useHistory instance that the visualization is using.
 *  (we temporarily eject from react to use golden layout, and rewrap each visual in it's own instance of the various providers, like react router)
 *
 *  We could rewrite it as a hook and put it further down in the tree, but this is the same thing so no need.
 *
 *  Also notice we attach this at the visual level for that reason, rather than at the single golden layout instance level.
 */
const UseSubwindowConsumeNavigationChange = ({
  goldenLayout,
}: {
  goldenLayout: any
}) => {
  const history = useHistory()
  React.useEffect(() => {
    if (goldenLayout && history && goldenLayout.isSubWindow) {
      const callback = (e: MouseEvent) => {
        if (
          e.target?.constructor === HTMLAnchorElement &&
          !(e.target as HTMLAnchorElement)?.href.startsWith('blob')
        ) {
          e.preventDefault()
          goldenLayout.eventHub.emit(
            GoldenLayoutWindowCommunicationEvents.consumeNavigationChange,
            {
              href: (e.target as HTMLAnchorElement).href,
            }
          )
        }
      }
      document.addEventListener('click', callback)
      history.replace = (...args) => {
        goldenLayout.eventHub.emit(
          GoldenLayoutWindowCommunicationEvents.consumeNavigationChange,
          {
            replace: args,
          }
        )
      }
      history.push = (...args) => {
        goldenLayout.eventHub.emit(
          GoldenLayoutWindowCommunicationEvents.consumeNavigationChange,
          {
            push: args,
          }
        )
      }
      return () => {
        document.removeEventListener('click', callback)
      }
    }
    return () => {}
  }, [history, goldenLayout])
  return null
}

/**
 *  We attach this at the component level due to how popouts work.
 *  Essentially golden layout disconnects us from React and our providers in popouts to fullscreen visuals,
 *  so we can't use Dialog further up the tree.
 */
const UseMissingParentWindow = ({ goldenLayout }: { goldenLayout: any }) => {
  const [missingWindow, setMissingWindow] = React.useState(false)
  React.useEffect(() => {
    if (goldenLayout && goldenLayout.isSubWindow && window.opener === null) {
      setMissingWindow(true)
    }
  }, [goldenLayout])

  if (missingWindow) {
    return (
      <Dialog open={true} className=" z-[1000000]">
        <DialogTitle>Could not find parent visualization</DialogTitle>
        <DialogContent>Please close the window.</DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              window.close()
            }}
            color="primary"
          >
            Close Window
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
  return null
}

/**
 *  Tells the main window of golden layout to listen for navigation changes in the subwindow.  These are translated to be handled by the main window instead.
 *  Notice we attach this in the single instance of gl, not the individual components like the subwindows who send the event.
 */
const useWindowConsumeNavigationChange = ({
  goldenLayout,
  isInitialized,
}: {
  goldenLayout: any
  isInitialized: boolean
}) => {
  const history = useHistory()
  React.useEffect(() => {
    if (isInitialized && goldenLayout && history && !goldenLayout.isSubWindow) {
      const callback = (params: any) => {
        if (params.href && params.href.startsWith('http')) {
          // didn't not see a way to handle full urls with react router dom, but location works just as well I think
          location = params.href
        } else if (params.href) {
          history.location = params.href
        } else if (params.replace) {
          history.replace.apply(undefined, params.replace)
        } else if (params.push) {
          history.push.apply(undefined, params.push)
        }
      }
      goldenLayout.eventHub.on(
        GoldenLayoutWindowCommunicationEvents.consumeNavigationChange,
        callback
      )

      return () => {
        goldenLayout.eventHub.off(
          GoldenLayoutWindowCommunicationEvents.consumeNavigationChange,
          callback
        )
      }
    }
    return () => {}
  }, [history, goldenLayout, isInitialized])
  return null
}

const GoldenLayoutComponent = ({
  ComponentView,
  options,
  container,
  goldenLayout,
}: {
  goldenLayout: any
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
      <UseSubwindowConsumeNavigationChange goldenLayout={goldenLayout} />
      <UseMissingParentWindow goldenLayout={goldenLayout} />
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
  marionetteView: { goldenLayout: any; options: any },
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
          const root = createRoot(container.getElement()[0])
          root.render(
            <GoldenLayoutComponent
              goldenLayout={marionetteView.goldenLayout}
              options={options}
              ComponentView={ComponentView}
              container={container}
            />
          )
          container.on('destroy', () => {
            root.unmount()
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
            const renderRoot = createRoot(tab.element[0])
            renderRoot.render(
              <GoldenLayoutComponentHeader
                viz={viz}
                tab={tab}
                options={options}
                componentState={componentState}
                container={container}
                name={name}
              />
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

function removeOpenPopoutDimensionInformation(config: any): any {
  delete config.dimensions
  if (config.openPopouts === undefined || config.openPopouts.length === 0) {
    return
  } else {
    return _.forEach(config.openPopouts, removeOpenPopoutDimensionInformation)
  }
}

function removeEphemeralState(config: any) {
  removeMaximisedInformation(config)
  removeActiveTabInformation(config)
  removeOpenPopoutDimensionInformation(config)
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
  content:
    StartupDataStore.Configuration.getDefaultLayout() || FALLBACK_GOLDEN_LAYOUT,
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

function handleGoldenLayoutStateChangeInSubwindow({
  goldenLayout,
}: {
  goldenLayout: any
}) {
  // shouldn't need to send anything, as the main window can determine the config from the subwindow
  goldenLayout.eventHub.emit(
    GoldenLayoutWindowCommunicationEvents.consumeSubwindowLayoutChange,
    null
  )
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
      const renderRoot = createRoot(stack.header.controlsContainer[0])
      renderRoot.render(<GoldenLayoutToolbar stack={stack} />)
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
            {stack.layoutManager.isSubWindow ? null : (
              <Grid item>
                <Button
                  data-id="popout-layout-button"
                  onClick={() => {
                    stack.popout()
                  }}
                >
                  <PopoutIcon />
                </Button>
              </Grid>
            )}

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

const useUpdateGoldenLayoutSize = ({
  wreqr,
  goldenLayout,
}: {
  wreqr: any
  goldenLayout: any
}) => {
  useListenTo((wreqr as any).vent, 'gl-updateSize', () => {
    if (goldenLayout && goldenLayout.isInitialised) goldenLayout.updateSize()
  })
  React.useEffect(() => {
    if (goldenLayout) {
      const randomString = Math.random().toString()
      $(window).on(
        'resize.' + randomString,
        _debounce(
          () => {
            if (goldenLayout.isInitialised) goldenLayout.updateSize()
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
    }
    return () => {}
  }, [goldenLayout])
}

const useSendGoldenLayoutReferenceUpwards = ({
  options,
  goldenLayout,
}: {
  goldenLayout: any
  options: GoldenLayoutViewProps
}) => {
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
}

const useAttachGoldenLayout = ({
  goldenLayoutAttachElement,
  setGoldenLayout,
  options,
}: {
  options: GoldenLayoutViewProps
  setGoldenLayout: React.Dispatch<any>
  goldenLayoutAttachElement: HTMLDivElement | null
}) => {
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
}

const useRegisterGoldenLayoutComponents = ({
  options,
  goldenLayout,
}: {
  options: GoldenLayoutViewProps
  goldenLayout: any
}) => {
  const [finished, setFinished] = React.useState(false)
  React.useEffect(() => {
    if (goldenLayout) {
      registerGoldenLayoutComponents({
        goldenLayout,
        options,
      })
      setFinished(true)
    }
  }, [goldenLayout])
  return finished
}

const useListenToGoldenLayoutStateChanges = ({
  options,
  goldenLayout,
  lastConfig,
}: {
  options: GoldenLayoutViewProps
  goldenLayout: any
  lastConfig: React.MutableRefObject<any>
}) => {
  const [finished, setFinished] = React.useState(false)

  React.useEffect(() => {
    if (goldenLayout) {
      const debouncedHandleGoldenLayoutStateChange = _.debounce(
        ({ currentConfig }: { currentConfig: any }) => {
          ;(wreqr as any).vent.trigger('resize') // trigger resize of things like map
          if (!goldenLayout.isSubWindow) {
            // this function applies only to the main window, we have to communicate subwindow updates back to the original window instead
            handleGoldenLayoutStateChange({
              options,
              currentConfig,
              goldenLayout,
              lastConfig,
            })
          } else {
            handleGoldenLayoutStateChangeInSubwindow({ goldenLayout })
          }
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
      goldenLayout.on('stateChanged', (event: any) => {
        if (!event) {
          return
        }
        const fullyInitialized =
          goldenLayout.isInitialised &&
          !(goldenLayout?.openPopouts as Array<any>)?.some(
            (popout: any) => !popout.isInitialised
          )
        if (!fullyInitialized) {
          setTimeout(() => {
            goldenLayout.emit('stateChanged', 'retry')
          }, 200)
          return
        }
        const currentConfig = getInstanceConfig({ goldenLayout })
        /**
         *  Get the config instantly, that way if we navigate away and the component is removed from the document we still get the correct config
         *  However, delay the actual attempt to save the config, so we don't save too often.
         */
        debouncedHandleGoldenLayoutStateChange({
          currentConfig,
        })
      })
      setFinished(true)
      return () => {
        goldenLayout.off('stateChanged')
      }
    }
    return () => {}
  }, [goldenLayout])
  return finished
}

const useListenToGoldenLayoutWindowClosed = ({
  goldenLayout,
  isInitialized,
}: {
  goldenLayout: any
  isInitialized: boolean
}) => {
  React.useEffect(() => {
    if (goldenLayout && isInitialized && !goldenLayout.isSubWindow) {
      goldenLayout.on('windowClosed', (event: any) => {
        // order of eventing is a bit off in golden layout, so we need to wait for reconciliation of windows to actually finish
        // while gl does emit a stateChanged, it's missing an event, and it's before the popouts reconcile
        setTimeout(() => {
          goldenLayout.emit('stateChanged', event)
        }, 0)
      })
      return () => {
        goldenLayout.off('windowClosed')
      }
    }
    return () => {}
  }, [goldenLayout, isInitialized])
}

/**
 *  This will attach our custom toolbar to the golden layout stack header
 */
const useListenToGoldenLayoutStackCreated = ({
  goldenLayout,
}: {
  goldenLayout: any
}) => {
  const [finished, setFinished] = React.useState(false)

  React.useEffect(() => {
    if (goldenLayout) {
      goldenLayout.on('stackCreated', handleGoldenLayoutStackCreated)
      setFinished(true)
      return () => {
        goldenLayout.off('stackCreated')
      }
    }
    return () => {}
  }, [goldenLayout])
  return finished
}

type popupHandlingStateType = 'allowed' | 'blocked' | 'proceed'

const useInitGoldenLayout = ({
  dependencies,
  goldenLayout,
}: {
  dependencies: Array<boolean>
  goldenLayout: any
}) => {
  const [finished, setFinished] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [popupHandlingState, setPopupHandlingState] =
    React.useState<popupHandlingStateType>('allowed')

  React.useEffect(() => {
    if (dependencies.every((dependency) => dependency)) {
      if (goldenLayout.isSubWindow && window.opener === null) {
        setError(true)
      }
      const onInit = () => {
        setFinished(true)
      }
      goldenLayout.on('initialised', onInit)
      if (goldenLayout.isSubWindow) {
        // for some reason subwindow stacks lose dimensions, specifically the header height (see _createConfig in golden layout source code)
        goldenLayout.config.dimensions = getGoldenLayoutSettings().dimensions
      }
      try {
        goldenLayout.init()
      } catch (e) {
        if (e.type === 'popoutBlocked') {
          setPopupHandlingState('blocked')
          goldenLayout.openPopouts?.forEach((popout: any) => {
            popout.close()
          })
        }
      }

      return () => {
        goldenLayout.off('initialised', onInit)
      }
    }
    return () => {}
  }, [...dependencies, popupHandlingState])
  return {
    finished,
    error,
    setPopupHandlingState,
    popupHandlingState,
  }
}

const useProvideStateChange = ({
  goldenLayout,
  lazyResults,
  isInitialized,
}: {
  goldenLayout: any
  lazyResults: LazyQueryResults
  isInitialized: boolean
}) => {
  React.useEffect(() => {
    if (isInitialized && goldenLayout && lazyResults) {
      const callback = () => {
        goldenLayout.eventHub._childEventSource = null
        goldenLayout.eventHub.emit(
          GoldenLayoutWindowCommunicationEvents.consumeStateChange,
          {
            lazyResults,
          }
        )
      }

      const filteredResultsSubscription = lazyResults.subscribeTo({
        subscribableThing: 'filteredResults',
        callback,
      })
      const selectedResultsSubscription = lazyResults.subscribeTo({
        subscribableThing: 'selectedResults',
        callback,
      })
      const statusSubscription = lazyResults.subscribeTo({
        subscribableThing: 'status',
        callback,
      })
      return () => {
        filteredResultsSubscription()
        selectedResultsSubscription()
        statusSubscription()
      }
    }
    return () => {}
  }, [lazyResults, lazyResults?.results, isInitialized, goldenLayout])
}

const useProvideInitialState = ({
  goldenLayout,
  isInitialized,
  lazyResults,
}: {
  goldenLayout: any
  isInitialized: boolean
  lazyResults: LazyQueryResults
}) => {
  React.useEffect(() => {
    if (
      isInitialized &&
      goldenLayout &&
      lazyResults &&
      !goldenLayout.isSubWindow
    ) {
      const handleInitializeState = () => {
        // golden layout doesn't properly clear this flag
        goldenLayout.eventHub._childEventSource = null
        goldenLayout.eventHub.emit(
          GoldenLayoutWindowCommunicationEvents.consumeInitialState,
          {
            lazyResults,
          }
        )
      }

      goldenLayout.eventHub.on(
        GoldenLayoutWindowCommunicationEvents.requestInitialState,
        handleInitializeState
      )
      return () => {
        try {
          goldenLayout.eventHub.off(
            GoldenLayoutWindowCommunicationEvents.requestInitialState
          )
        } catch (err) {
          console.log(err)
        }
      }
    }
    return () => {}
  }, [isInitialized, goldenLayout, lazyResults, lazyResults?.results])
}

const useConsumeInitialState = ({
  goldenLayout,
  lazyResults,
  isInitialized,
}: {
  goldenLayout: any
  lazyResults: LazyQueryResults
  isInitialized: boolean
}) => {
  const [hasConsumedInitialState, setHasConsumedInitialState] =
    React.useState(false)

  React.useEffect(() => {
    if (
      isInitialized &&
      !hasConsumedInitialState &&
      goldenLayout &&
      lazyResults &&
      goldenLayout.isSubWindow
    ) {
      const onSyncStateCallback = (eventData: {
        lazyResults: LazyQueryResults
      }) => {
        setHasConsumedInitialState(true)
        lazyResults.reset({
          results: Object.values(eventData.lazyResults.results).map((result) =>
            _cloneDeep(result.plain)
          ),
          highlights: eventData.lazyResults.highlights,
          sorts: eventData.lazyResults.persistantSorts,
          sources: eventData.lazyResults.sources,
          status: eventData.lazyResults.status,
          didYouMeanFields: eventData.lazyResults.didYouMeanFields,
          showingResultsForFields:
            eventData.lazyResults.showingResultsForFields,
        })
        lazyResults._resetSelectedResults()
        Object.values(eventData.lazyResults.selectedResults).forEach(
          (result) => {
            lazyResults.results[result.plain.id].controlSelect()
          }
        )
      }

      goldenLayout.eventHub.on(
        GoldenLayoutWindowCommunicationEvents.consumeInitialState,
        onSyncStateCallback
      )
      goldenLayout.eventHub.emit(
        GoldenLayoutWindowCommunicationEvents.requestInitialState,
        {}
      )
      return () => {
        goldenLayout.eventHub.off(
          GoldenLayoutWindowCommunicationEvents.consumeInitialState,
          onSyncStateCallback
        )
      }
    }
    return () => {}
  }, [goldenLayout, lazyResults, isInitialized])
}

const useConsumeStateChange = ({
  goldenLayout,
  lazyResults,
  isInitialized,
}: {
  goldenLayout: any
  lazyResults: LazyQueryResults
  isInitialized: boolean
}) => {
  React.useEffect(() => {
    if (goldenLayout && lazyResults && isInitialized) {
      const onSyncStateCallback = (eventData: {
        lazyResults: LazyQueryResults
      }) => {
        const results = Object.values(lazyResults.results).map((lazyResult) => {
          return {
            plain: lazyResult.plain,
            isSelected: lazyResult.isSelected,
          }
        })
        const callbackResults = Object.values(
          eventData.lazyResults.results
        ).map((lazyResult) => {
          return {
            plain: lazyResult.plain,
            isSelected: lazyResult.isSelected,
          }
        })
        if (!_isEqualWith(results, callbackResults)) {
          lazyResults.reset({
            results: Object.values(eventData.lazyResults.results).map(
              (result) => _cloneDeep(result.plain)
            ),
            highlights: eventData.lazyResults.highlights,
            sorts: eventData.lazyResults.persistantSorts,
            sources: eventData.lazyResults.sources,
            status: eventData.lazyResults.status,
            didYouMeanFields: eventData.lazyResults.didYouMeanFields,
            showingResultsForFields:
              eventData.lazyResults.showingResultsForFields,
          })
          lazyResults._resetSelectedResults()
          Object.values(eventData.lazyResults.selectedResults).forEach(
            (result) => {
              lazyResults.results[result.plain.id].controlSelect()
            }
          )
        }
      }

      goldenLayout.eventHub.on(
        GoldenLayoutWindowCommunicationEvents.consumeStateChange,
        onSyncStateCallback
      )
      return () => {
        goldenLayout.eventHub.off(
          GoldenLayoutWindowCommunicationEvents.consumeStateChange,
          onSyncStateCallback
        )
      }
    }
    return () => {}
  }, [goldenLayout, lazyResults, isInitialized])
}

const useConsumePreferencesChange = ({
  goldenLayout,
  isInitialized,
}: {
  goldenLayout: any
  isInitialized: boolean
}) => {
  useListenTo(TypedUserInstance.getPreferences(), 'sync', () => {
    if (goldenLayout && isInitialized) {
      goldenLayout.eventHub.emit(
        GoldenLayoutWindowCommunicationEvents.consumePreferencesChange,
        {
          preferences: TypedUserInstance.getPreferences().toJSON(),
        }
      )
    }
  })
  React.useEffect(() => {
    if (goldenLayout && isInitialized) {
      goldenLayout.eventHub.on(
        GoldenLayoutWindowCommunicationEvents.consumePreferencesChange,
        ({ preferences }: { preferences: any }) => {
          TypedUserInstance.sync(preferences)
        }
      )
      return () => {}
    }
    return () => {}
  }, [goldenLayout, isInitialized])
}

function useConsumeSubwindowLayoutChange({
  goldenLayout,
  isInitialized,
}: {
  goldenLayout: any
  isInitialized: boolean
}) {
  React.useEffect(() => {
    if (goldenLayout && isInitialized && !goldenLayout.isSubWindow) {
      goldenLayout.eventHub.on(
        GoldenLayoutWindowCommunicationEvents.consumeSubwindowLayoutChange,
        () => {
          goldenLayout.emit('stateChanged', 'subwindow')
        }
      )
      return () => {
        goldenLayout.eventHub.off(
          GoldenLayoutWindowCommunicationEvents.consumeSubwindowLayoutChange
        )
      }
    }
    return () => {}
  }, [goldenLayout, isInitialized])
}

const useCrossWindowGoldenLayoutCommunication = ({
  goldenLayout,
  isInitialized,
  options,
}: {
  goldenLayout: any
  isInitialized: boolean
  options: GoldenLayoutViewProps
}) => {
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface: options.selectionInterface,
  })
  useProvideStateChange({
    goldenLayout,
    lazyResults,
    isInitialized,
  })
  useProvideInitialState({ goldenLayout, isInitialized, lazyResults })
  useConsumeInitialState({ goldenLayout, lazyResults, isInitialized })
  useConsumeStateChange({ goldenLayout, lazyResults, isInitialized })
  useConsumePreferencesChange({ goldenLayout, isInitialized })
  useConsumeSubwindowLayoutChange({ goldenLayout, isInitialized })
  useListenToGoldenLayoutWindowClosed({ goldenLayout, isInitialized })
  useWindowConsumeNavigationChange({ goldenLayout, isInitialized })
}

const HandlePopoutsBlocked = ({
  setPopupHandlingState,
  goldenLayout,
}: {
  goldenLayout: any
  setPopupHandlingState: React.Dispatch<popupHandlingStateType>
}) => {
  return (
    <Dialog open={true}>
      <DialogTitle>Visualization popups blocked</DialogTitle>
      <DialogContent>
        Please allow popups for this site, then click the button below to retry
        loading your visualization layout.
      </DialogContent>
      <DialogActions>
        <Button
          color="error"
          onClick={() => {
            goldenLayout.config.openPopouts = []
            setPopupHandlingState('proceed')
          }}
        >
          Proceed without popups
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            // try opening two windows, as one is allowed since the user interacts with the button
            const window1 = window.open('', '_blank')
            const window2 = window.open('', '_blank')
            if (window1 && window2) {
              setPopupHandlingState('allowed')
            }
            window1?.close()
            window2?.close()
          }}
        >
          Retry
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const GoldenLayoutViewReact = (options: GoldenLayoutViewProps) => {
  const [goldenLayoutAttachElement, setGoldenLayoutAttachElement] =
    React.useState<HTMLDivElement | null>(null)
  const [goldenLayout, setGoldenLayout] = React.useState<any>(null)
  const lastConfig = React.useRef<any>(getGoldenLayoutConfig(options))
  useUpdateGoldenLayoutSize({ wreqr, goldenLayout })
  useSendGoldenLayoutReferenceUpwards({ options, goldenLayout })
  useAttachGoldenLayout({ goldenLayoutAttachElement, setGoldenLayout, options })
  const goldenLayoutComponentsRegistered = useRegisterGoldenLayoutComponents({
    options,
    goldenLayout,
  })
  const listeningToGoldenLayoutStateChanges =
    useListenToGoldenLayoutStateChanges({ options, goldenLayout, lastConfig })
  const listeningToGoldenLayoutStackCreated =
    useListenToGoldenLayoutStackCreated({ goldenLayout })

  const { finished, error, setPopupHandlingState, popupHandlingState } =
    useInitGoldenLayout({
      dependencies: [
        goldenLayoutComponentsRegistered,
        listeningToGoldenLayoutStateChanges,
        listeningToGoldenLayoutStackCreated,
      ],
      goldenLayout,
    })

  useCrossWindowGoldenLayoutCommunication({
    goldenLayout,
    isInitialized: !error && finished,
    options,
  })

  return (
    <div data-element="golden-layout" className="is-minimised h-full w-full">
      {popupHandlingState === 'blocked' ? (
        <HandlePopoutsBlocked
          goldenLayout={goldenLayout}
          setPopupHandlingState={setPopupHandlingState}
        />
      ) : null}
      <div
        ref={setGoldenLayoutAttachElement}
        className="golden-layout-container w-full h-full"
      />
    </div>
  )
}
