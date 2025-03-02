import React from 'react'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import type { GoldenLayoutViewProps } from './golden-layout.view'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
import { useNavigate, useLocation } from 'react-router-dom'
import _cloneDeep from 'lodash.clonedeep'
import _isEqualWith from 'lodash.isequalwith'
import { TypedUserInstance } from '../singletons/TypedUser'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import wreqr from '../../js/wreqr'
import GoldenLayout from 'golden-layout'
import { getRootColumnContent, rootIsNotAColumn } from './stack-toolbar'
import { unMaximize } from '../../react-component/visualization-selector/visualization-selector'
import { v4 as uuid } from 'uuid'

const windowId = uuid()

/**
 *  This function is used to extract the 'gl-window' parameter from the URL that was made by the golden layout library
 */
function getGLWindowParam(urlString: string): string | null {
  // Parse the URL
  const url = new URL(urlString)

  // Check 'gl-window' in the query string
  const searchParams = new URLSearchParams(url.search)
  if (searchParams.has('gl-window')) {
    return searchParams.get('gl-window')
  }

  // Check 'gl-window' in the fragment (hash)
  if (url.hash) {
    const hash = url.hash.substring(1) // Remove the leading '#'

    // If the hash contains a path followed by query parameters
    const hashIndex = hash.indexOf('?')
    if (hashIndex !== -1) {
      const hashQueryString = hash.substring(hashIndex + 1)
      const hashParams = new URLSearchParams(hashQueryString)
      if (hashParams.has('gl-window')) {
        return hashParams.get('gl-window')
      }
    } else {
      // Handle the case where the hash itself is a query string
      const hashParams = new URLSearchParams(hash)
      if (hashParams.has('gl-window')) {
        return hashParams.get('gl-window')
      }
    }
  }

  // Return null if 'gl-window' is not found
  return null
}

/**
 *  This patches the popout url that golden layout creates so that it goes to the popout specific route, rather than the current route, which can have side effects.
 *  Notice we have to grab the window param and reattach it.
 */
function patchCreateUrl() {
  const oldCreateUrl = (GoldenLayout as any).__lm.controls.BrowserPopout
    .prototype._createUrl
  ;(GoldenLayout as any).__lm.controls.BrowserPopout.prototype._createUrl =
    function () {
      const oldCreatedUrl = oldCreateUrl.apply(this, arguments)
      const glWindowParam = getGLWindowParam(oldCreatedUrl)
      // determine if ?gl-window=' or &gl-window=, then redo the first part and tack that part on
      const newCreatedUrl =
        document.location.origin +
        document.location.pathname +
        '#/_gl_popout?gl-window=' +
        glWindowParam
      return newCreatedUrl
    }
}
patchCreateUrl()

/**
 *  The popin function in golden layout has issues, particularly when there is a single stack in the main window at root.
 *  It also, like many other things in golden layout, doesn't play well with maximize.
 *
 *  This patch detects maximize and removes it (since it doesn't make sense when popping in)
 *  It also detects if the root is not a column, and if so, makes it a column so that popin works in all cases.
 */
function patchPopinFunction() {
  const oldPopin = (GoldenLayout as any).__lm.controls.BrowserPopout.prototype
    .popIn
  ;(GoldenLayout as any).__lm.controls.BrowserPopout.prototype.popIn =
    function () {
      const goldenLayoutRoot = this._layoutManager.root
      unMaximize(goldenLayoutRoot)
      if (rootIsNotAColumn(goldenLayoutRoot)) {
        const existingRootContent = getRootColumnContent(goldenLayoutRoot)
        goldenLayoutRoot.removeChild(existingRootContent as any, true) // for some reason removeChild is overly restrictive on type of "thing" so we have to cast

        // we need a column for minimize to work, so make a new column and add the existing root to it
        const newColumnItem = this._layoutManager._$normalizeContentItem({
          type: 'column',
        })
        newColumnItem.addChild(existingRootContent)
        goldenLayoutRoot.addChild(newColumnItem)
      }
      oldPopin.apply(this, arguments)
    }
}
patchPopinFunction()

export const GoldenLayoutWindowCommunicationEvents = {
  requestInitialState: 'requestInitialState',
  consumeInitialState: 'consumeInitialState',
  consumeStateChange: 'consumeStateChange',
  consumePreferencesChange: 'consumePreferencesChange',
  consumeSubwindowLayoutChange: 'consumeSubwindowLayoutChange',
  consumeNavigationChange: 'consumeNavigationChange',
  consumeWreqrEvent: 'consumeWreqrEvent',
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
      const filterTreeSubscription = lazyResults.subscribeTo({
        subscribableThing: 'filterTree',
        callback,
      })
      return () => {
        filteredResultsSubscription()
        selectedResultsSubscription()
        statusSubscription()
        filterTreeSubscription()
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
          filterTree: eventData.lazyResults.filterTree,
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
        const filterTree = lazyResults.filterTree
        const callbackFilterTree = eventData.lazyResults.filterTree
        if (
          !_isEqualWith(results, callbackResults) ||
          !_isEqualWith(filterTree, callbackFilterTree)
        ) {
          lazyResults.reset({
            filterTree: eventData.lazyResults.filterTree,
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
          fromWindowId: windowId,
        }
      )
    }
  })
  React.useEffect(() => {
    if (goldenLayout && isInitialized) {
      goldenLayout.eventHub.on(
        GoldenLayoutWindowCommunicationEvents.consumePreferencesChange,
        ({
          preferences,
          fromWindowId,
        }: {
          preferences: any
          fromWindowId: string
        }) => {
          if (windowId !== fromWindowId) {
            TypedUserInstance.sync(preferences)
          }
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

/**
 *  Notice that we are only forwarding events that start with 'search' for now, as these are drawing events.
 */
const useProvideWreqrEvents = ({
  goldenLayout,
  isInitialized,
}: {
  goldenLayout: any
  isInitialized: boolean
}) => {
  useListenTo(
    wreqr.vent,
    'all',
    (event: string, args: any, { doNotPropagate = false } = {}) => {
      if (goldenLayout && isInitialized) {
        if (event.startsWith('search') && !doNotPropagate) {
          goldenLayout.eventHub._childEventSource = null // golden layout doesn't properly clear this flag
          goldenLayout.eventHub.emit(
            GoldenLayoutWindowCommunicationEvents.consumeWreqrEvent,
            {
              event,
              args,
            }
          )
        }
      }
    }
  )
}

const useConsumeWreqrEvents = ({
  goldenLayout,
  isInitialized,
}: {
  goldenLayout: any
  isInitialized: boolean
}) => {
  React.useEffect(() => {
    if (goldenLayout && isInitialized) {
      goldenLayout.eventHub.on(
        GoldenLayoutWindowCommunicationEvents.consumeWreqrEvent,
        ({ event, args }: { event: string; args: any[] }) => {
          wreqr.vent.trigger(event, args, { doNotPropagate: true })
        }
      )
      return () => {
        goldenLayout.eventHub.off(
          GoldenLayoutWindowCommunicationEvents.consumeWreqrEvent
        )
      }
    }
    return () => {}
  }, [goldenLayout, isInitialized])
}

/**
 *  Overrides navigation functionality within subwindows of golden layout, so that navigation is handled by the main window.
 *
 *  We could rewrite it as a hook and put it further down in the tree, but this is the same thing so no need.
 *
 *  Also notice we attach this at the visual level for that reason, rather than at the single golden layout instance level.
 */
export const UseSubwindowConsumeNavigationChange = ({
  goldenLayout,
}: {
  goldenLayout: any
}) => {
  React.useEffect(() => {
    if (goldenLayout && goldenLayout.isSubWindow) {
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
      return () => {
        document.removeEventListener('click', callback)
      }
    }
    return () => {}
  }, [goldenLayout])
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
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    if (
      isInitialized &&
      goldenLayout &&
      navigate &&
      !goldenLayout.isSubWindow
    ) {
      const callback = (params: any) => {
        if (params.href && params.href.startsWith('http')) {
          // didn't not see a way to handle full urls with react router dom, but location works just as well I think
          window.location.href = params.href
        } else if (params.href) {
          navigate(params.href)
        } else if (params.replace) {
          navigate(params.replace[0], params.replace[1])
        } else if (params.push) {
          navigate(params.push[0], params.push[1])
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
  }, [navigate, location, goldenLayout, isInitialized])
  return null
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

export const useCrossWindowGoldenLayoutCommunication = ({
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
  useProvideWreqrEvents({ goldenLayout, isInitialized })
  useConsumeWreqrEvents({ goldenLayout, isInitialized })
}
