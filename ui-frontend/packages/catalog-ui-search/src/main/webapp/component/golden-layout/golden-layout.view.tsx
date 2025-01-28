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
import _debounce from 'lodash/debounce'
import _cloneDeep from 'lodash.clonedeep'
import _isEqualWith from 'lodash.isequalwith'
import $ from 'jquery'
import wreqr from '../../js/wreqr'
import GoldenLayout from 'golden-layout'
import Button from '@mui/material/Button'
import ExtensionPoints from '../../extension-points/extension-points'
import { Visualizations } from '../visualization/visualizations'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import Paper from '@mui/material/Paper'
import { Elevations } from '../theme/theme'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { StackToolbar, MinimizedHeight } from './stack-toolbar'
import { GoldenLayoutComponentHeader } from './visual-toolbar'
import {
  UseSubwindowConsumeNavigationChange,
  useCrossWindowGoldenLayoutCommunication,
  GoldenLayoutWindowCommunicationEvents,
} from './cross-window-communication'
import { useVerifyMapExistsWhenDrawing } from './verify-map'
import { VisualSettingsProvider } from './visual-settings.provider'
import { getInstanceConfig } from './golden-layout.layout-config-handling'
import { getGoldenLayoutConfig } from './golden-layout.layout-config-handling'
import { handleGoldenLayoutStateChange } from './golden-layout.layout-config-handling'
import { getGoldenLayoutSettings } from './golden-layout.layout-config-handling'

/**
 *  For some reason golden layout removes configs from local storage upon first load of popout window, which means refreshing doesn't work.
 *  This prevents this line from doing so: https://github.com/golden-layout/golden-layout/blob/v1.5.9/src/js/LayoutManager.js#L797
 */
import { getDefaultComponentState } from '../visualization/settings-helpers'
import { ComponentNameType } from './golden-layout.types'
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

const GoldenLayoutComponent = ({
  ComponentView,
  options,
  container,
  goldenLayout,
  componentState,
}: {
  goldenLayout: any
  options: any
  ComponentView: any
  container: GoldenLayout.Container
  componentState: {
    componentName: ComponentNameType
  }
}) => {
  const { height } = useContainerSize(container)
  const isMinimized = height && height <= MinimizedHeight
  const normalizedComponentState = React.useMemo(() => {
    return {
      ...getDefaultComponentState(componentState.componentName),
      componentState,
    }
  }, [componentState])

  return (
    <ExtensionPoints.providers>
      <VisualSettingsProvider container={container} goldenLayout={goldenLayout}>
        <UseSubwindowConsumeNavigationChange goldenLayout={goldenLayout} />
        <UseMissingParentWindow goldenLayout={goldenLayout} />
        <Paper
          elevation={Elevations.panels}
          className={`w-full h-full ${isMinimized ? 'hidden' : ''}`}
          square
        >
          <ComponentView
            selectionInterface={options.selectionInterface}
            componentState={normalizedComponentState}
          />
        </Paper>
      </VisualSettingsProvider>
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
              componentState={componentState}
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
            tab.header.on('destroy', () => {
              renderRoot.unmount()
            })
            clearInterval(intervalId)
          } catch (err) {}
        }, 100)
      })
    }
  )
}
export type GoldenLayoutViewProps = {
  layoutResult?: LazyQueryResult['plain']
  editLayoutRef?: React.MutableRefObject<any>
  configName?: string
  selectionInterface: any
  setGoldenLayout: (instance: any) => void
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

/**
 *  Replace the toolbar with our own
 */
function handleGoldenLayoutStackCreated(stack: any) {
  let intervalId = setInterval(() => {
    try {
      const renderRoot = createRoot(stack.header.controlsContainer[0])
      renderRoot.render(<StackToolbar stack={stack} />)
      stack.on('activeContentItemChanged', function (contentItem: any) {
        wreqr.vent.trigger('activeContentItemChanged', contentItem)
      })
      stack.on('destroy', () => {
        renderRoot.unmount()
      })
      clearInterval(intervalId)
    } catch (err) {}
  }, 100)
}

function useContainerSize(container: GoldenLayout.Container) {
  const [width, setWidth] = React.useState<number | undefined>(container.width)
  const [height, setHeight] = React.useState<number | undefined>(
    container.height
  )

  React.useEffect(() => {
    if (container) {
      const resizeCallback = () => {
        setWidth(container.width)
        setHeight(container.height)
      }
      container.on('resize', resizeCallback)
      return () => {
        container.off('resize', resizeCallback)
      }
    }
    return () => {}
  }, [container])
  return { height, width }
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

  useVerifyMapExistsWhenDrawing({
    goldenLayout,
    isInitialized: !error && finished,
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

export default GoldenLayoutViewReact
