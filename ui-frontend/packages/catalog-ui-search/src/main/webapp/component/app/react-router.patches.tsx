import {
  UNSAFE_LocationContext,
  UNSAFE_NavigationContext,
} from 'react-router-dom'
import React from 'react'
import { Subscribable } from '../../js/model/Base/base-classes'
import { useSubscribable } from '../../js/model/Base/base-classes.hooks'
import { GoldenLayoutWindowCommunicationEvents } from '../golden-layout/cross-window-communication'

/**
 * This module provides a solution for sharing React Router v6 context across multiple React roots, as well as golden-layout subwindows (popouts).
 * See https://github.com/remix-run/react-router/issues/10089 for more details.
 *
 * Problem:
 * - React Router v6 uses internal history/location objects that aren't shared between different Router instances
 * - Our application uses multiple React roots due to golden-layout integration
 * - Golden-layout doesn't have native React support, so we need to patch the contexts somehow
 * - We need the ability to also handle popouts, which have their own Router instances.
 */

class SubscribableNavigationContextClass extends Subscribable<{
  thing: 'update'
}> {
  navigationContext: React.ContextType<typeof UNSAFE_NavigationContext> | null =
    null
  updateNavigationContext(
    navigationContext: React.ContextType<typeof UNSAFE_NavigationContext>
  ) {
    this.navigationContext = navigationContext
    this._notifySubscribers({ thing: 'update' })
  }
}

class SubscribableLocationContextClass extends Subscribable<{
  thing: 'update'
}> {
  locationContext: React.ContextType<typeof UNSAFE_LocationContext> | null =
    null
  updateLocationContext(
    locationContext: React.ContextType<typeof UNSAFE_LocationContext>
  ) {
    this.locationContext = locationContext
    this._notifySubscribers({ thing: 'update' })
  }
}

let SubscribableNavigationContext = new SubscribableNavigationContextClass()
let SubscribableLocationContext = new SubscribableLocationContextClass()

/**
 * Component that syncs the current React Router context to our shared variables.  While we could alternatively use prop drilling by
 * accessing context and passing it to the new root, this is much simpler.
 *
 * This should be rendered within the Router component of the primary React root
 */
export const SyncReactRouterContextToVariables = () => {
  const navigationContext = React.useContext(UNSAFE_NavigationContext)
  const locationContext = React.useContext(UNSAFE_LocationContext)

  React.useEffect(() => {
    SubscribableNavigationContext.updateNavigationContext(navigationContext)
  }, [navigationContext])
  React.useEffect(() => {
    SubscribableLocationContext.updateLocationContext(locationContext)
  }, [locationContext])

  return null
}

function useSharedNavigationContext() {
  const [navigationContext, setNavigationContext] =
    React.useState<React.ContextType<typeof UNSAFE_NavigationContext> | null>(
      SubscribableNavigationContext.navigationContext
    )
  useSubscribable(SubscribableNavigationContext, 'update', () => {
    setNavigationContext(SubscribableNavigationContext.navigationContext)
  })
  return navigationContext
}

function useSharedLocationContext() {
  const [locationContext, setLocationContext] =
    React.useState<React.ContextType<typeof UNSAFE_LocationContext> | null>(
      SubscribableLocationContext.locationContext
    )
  useSubscribable(SubscribableLocationContext, 'update', () => {
    setLocationContext(SubscribableLocationContext.locationContext)
  })
  return locationContext
}

/**
 * Provider component that provides the shared Router context to its children
 * This should be used in secondary React roots to receive the shared context
 */
export const PatchReactRouterContext = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const navigationContext = useSharedNavigationContext()
  const locationContext = useSharedLocationContext()
  if (!navigationContext || !locationContext) {
    throw new Error('Navigation or location context not found')
  }
  return (
    <UNSAFE_NavigationContext.Provider value={navigationContext}>
      <UNSAFE_LocationContext.Provider value={locationContext}>
        {children}
      </UNSAFE_LocationContext.Provider>
    </UNSAFE_NavigationContext.Provider>
  )
}

/**
 *  In subwindows (popouts) we want to redirect navigation events back to the main window through the event bus.
 */
function patchNavigationContextForGoldenLayoutSubwindows({
  navigationContext,
  goldenLayout,
}: {
  navigationContext: React.ContextType<typeof UNSAFE_NavigationContext> | null
  goldenLayout: any
}) {
  if (!navigationContext) {
    throw new Error('Navigation context not found')
  }
  const replaceWrapper = (to: string, options?: { state?: any }) => {
    goldenLayout.eventHub.emit(
      GoldenLayoutWindowCommunicationEvents.consumeNavigationChange,
      {
        replace: [to, { ...options, replace: true }],
      }
    )
  }
  const pushWrapper = (to: string, options?: { state?: any }) => {
    goldenLayout.eventHub.emit(
      GoldenLayoutWindowCommunicationEvents.consumeNavigationChange,
      {
        push: [to, options],
      }
    )
  }
  Object.defineProperty(navigationContext.navigator, 'replace', {
    value: replaceWrapper,
    writable: true,
  })
  Object.defineProperty(navigationContext.navigator, 'push', {
    value: pushWrapper,
    writable: true,
  })
  return navigationContext
}

/**
 * Hook that provides the shared Router context for golden layout subwindows (popouts)
 */
function useSharedNavigationContextForGoldenLayoutSubwindows({
  goldenLayout,
}: {
  goldenLayout: any
}) {
  const [navigationContext, setNavigationContext] =
    React.useState<React.ContextType<typeof UNSAFE_NavigationContext> | null>(
      patchNavigationContextForGoldenLayoutSubwindows({
        navigationContext: SubscribableNavigationContext.navigationContext,
        goldenLayout,
      })
    )
  useSubscribable(SubscribableNavigationContext, 'update', () => {
    setNavigationContext(
      patchNavigationContextForGoldenLayoutSubwindows({
        navigationContext: SubscribableNavigationContext.navigationContext,
        goldenLayout,
      })
    )
  })
  return navigationContext
}

/**
 * Provider component that patches the React Router context for golden layout subwindows (popouts), and also handles normal React roots when applicable.
 */
export const PatchReactRouterContextForGoldenLayoutSubwindows = ({
  children,
  goldenLayout,
}: {
  children: React.ReactNode
  goldenLayout: any
}) => {
  if (!goldenLayout || !goldenLayout.isSubWindow) {
    return <PatchReactRouterContext>{children}</PatchReactRouterContext>
  }
  const navigationContext = useSharedNavigationContextForGoldenLayoutSubwindows(
    {
      goldenLayout,
    }
  )
  const locationContext = useSharedLocationContext()
  if (!navigationContext || !locationContext) {
    throw new Error('Navigation or location context not found')
  }
  return (
    <UNSAFE_NavigationContext.Provider value={navigationContext}>
      <UNSAFE_LocationContext.Provider value={locationContext}>
        {children}
      </UNSAFE_LocationContext.Provider>
    </UNSAFE_NavigationContext.Provider>
  )
}
