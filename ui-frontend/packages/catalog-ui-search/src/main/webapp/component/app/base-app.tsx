import React, { lazy, SuspenseProps } from 'react'
import App, { IndividualRouteType, useDefaultWelcome } from './app'

import SourcesPageIcon from '@mui/icons-material/Cloud'
import AboutPageIcon from '@mui/icons-material/Info'
import FolderIcon from '@mui/icons-material/Folder'
import TrashIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import ImageSearch from '@mui/icons-material/ImageSearch'
import ExtensionPoints from '../../extension-points/extension-points'
import { BaseSettings } from '../../react-component/user-settings/user-settings'
import Paper from '@mui/material/Paper'
import { Elevations } from '../theme/theme'
import { HashRouter, Navigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import ViewListIcon from '@mui/icons-material/ViewList'
import selectionInterfaceModel from '../selection-interface/selection-interface.model'
import { Query } from '../../js/model/TypedQuery'
import { SuspenseWrapper } from './suspense'
import Skeleton from '@mui/material/Skeleton'

const UserNotifications = lazy(
  () => import('../../react-component/user-notifications/user-notifications')
)
const Help = lazy(() => import('../help/help.view'))
const HomePage = lazy(() => import('../pages/search'))
const IngestDetailsViewReact = lazy(() =>
  import('../ingest-details/ingest-details.view').then((m) => ({
    default: m.IngestDetailsViewReact,
  }))
)
const SourcesPage = lazy(
  () => import('../../react-component/sources/presentation')
)
const AboutPage = lazy(() => import('../../react-component/about'))
const MetacardNavRoute = lazy(() => import('../pages/metacard-nav'))
const MetacardRoute = lazy(() => import('../pages/metacard'))
const SavedSearches = lazy(() => import('../pages/browse'))
const Open = lazy(() => import('../pages/open'))
const Restore = lazy(() => import('../pages/restore'))
const Create = lazy(() => import('../pages/create'))
const GoldenLayoutViewReact = lazy(
  () => import('../golden-layout/golden-layout.view')
)

/**
 *  Wraps each route in suspense and provides a loading fallback - use the provided components that wrap this (CommonRouteContainer, ComplexRouteContainer)
 */
const RouteContainer = ({
  children,
  className,
  isSingleContainer = true,
  suspenseProps,
}: {
  children: React.ReactNode
  className?: string
  isSingleContainer?: boolean
  suspenseProps?: SuspenseProps
}) => {
  return (
    <div
      className={`w-full h-full overflow-hidden ${
        isSingleContainer ? 'pb-2 pt-2 pr-2' : ''
      } ${className}`}
    >
      <SuspenseWrapper
        {...suspenseProps}
        fallback={
          suspenseProps?.fallback || (
            <Paper elevation={Elevations.panels} className="w-full h-full">
              <Skeleton variant="rectangular" width="100%" height="100%" />
            </Paper>
          )
        }
      >
        {isSingleContainer ? (
          <Paper elevation={Elevations.panels} className="w-full h-full">
            {children}
          </Paper>
        ) : (
          children
        )}
      </SuspenseWrapper>
    </div>
  )
}

// for routes that are just a single paper element
export const CommonRouteContainer = ({
  children,
  className,
  suspenseProps,
}: {
  children: React.ReactNode
  className?: string
  suspenseProps?: SuspenseProps
}) => {
  return (
    <RouteContainer
      isSingleContainer={true}
      className={className}
      suspenseProps={suspenseProps}
    >
      {children}
    </RouteContainer>
  )
}

// for routes that need finer control over the layout (separate header and content for example)
export const ComplexRouteContainer = ({
  children,
  suspenseProps,
}: {
  children: React.ReactNode
  suspenseProps?: SuspenseProps
}) => {
  return (
    <RouteContainer isSingleContainer={false} suspenseProps={suspenseProps}>
      {children}
    </RouteContainer>
  )
}

/**
 * The issue with the original golden layout code for popout is that it will go to the current route and then load gl and all that.
 *
 * However, usually there are things on the route we don't want to run (for performance sometimes, and for other times because they reset prefs or whatnot to clear things)
 *
 * As a result, we have this route that is just for the popout, it doesn't show in the nav, and it doesn't run the other things on the route
 *
 * We have to have an instance of golden layout for the popout to attach to, which this provides, with a query that's blank (just so we can transfer results and what not to it)
 */
export const GoldenLayoutPopoutRoute: IndividualRouteType = {
  routeProps: {
    path: '/_gl_popout',
    Component: () => {
      const baseQuery = Query()
      return (
        <CommonRouteContainer>
          <GoldenLayoutViewReact
            selectionInterface={
              new selectionInterfaceModel({ currentQuery: baseQuery })
            }
            setGoldenLayout={() => {}}
            configName="goldenLayout"
          />
        </CommonRouteContainer>
      )
    },
  },
  showInNav: false,
}

const RouteInformation: IndividualRouteType[] = [
  {
    showInNav: false,
    routeProps: {
      path: '/',
      Component: () => <Navigate to="/search" replace />,
    },
  },
  {
    showInNav: false,
    routeProps: {
      path: '/uploads/:uploadId',
      Component: () => (
        <CommonRouteContainer>
          <MetacardRoute />
        </CommonRouteContainer>
      ),
    },
  },
  {
    showInNav: false,
    routeProps: {
      path: '/metacards/:metacardId',
      Component: () => (
        <ComplexRouteContainer>
          <div className="flex flex-col w-full h-full">
            <div className="w-full h-16 z-1 relative pt-2 pr-2">
              <Paper
                elevation={Elevations.panels}
                className="w-full h-full px-3"
              >
                <SuspenseWrapper>
                  <MetacardNavRoute />
                </SuspenseWrapper>
              </Paper>
            </div>
            <div className="w-full h-full z-0 relative overflow-hidden">
              <SuspenseWrapper>
                <MetacardRoute />
              </SuspenseWrapper>
            </div>
          </div>
        </ComplexRouteContainer>
      ),
    },
  },
  {
    navButtonProps: {
      expandedLabel: 'Search',
      unexpandedLabel: 'Search',
      Icon: SearchIcon,
      dataId: 'search',
    },
    routeProps: {
      path: '/search',
      Component: () => (
        <ComplexRouteContainer
          suspenseProps={{
            fallback: (
              <div className="w-full h-full flex flex-row flex-nowrap">
                <div className="w-[550px] h-full py-2 shrink-0 grow-0">
                  <Paper
                    elevation={Elevations.panels}
                    className="w-full h-full"
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height="100%"
                    />
                  </Paper>
                </div>
                <div className="w-full h-full shrink grow py-2 px-2">
                  <Paper
                    elevation={Elevations.panels}
                    className="w-full h-full"
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height="100%"
                    />
                  </Paper>
                </div>
              </div>
            ),
          }}
        >
          <HomePage />
        </ComplexRouteContainer>
      ),
    },
    linkProps: {
      to: '/search',
    },
    showInNav: true,
  },
  {
    showInNav: false,
    routeProps: {
      path: '/search/:id',
      Component: () => (
        <ComplexRouteContainer
          suspenseProps={{
            fallback: (
              <div className="w-full h-full flex flex-row flex-nowrap">
                <div className="w-[550px] h-full py-2 shrink-0 grow-0">
                  <Paper
                    elevation={Elevations.panels}
                    className="w-full h-full"
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height="100%"
                    />
                  </Paper>
                </div>
                <div className="w-full h-full shrink grow py-2 px-2">
                  <Paper
                    elevation={Elevations.panels}
                    className="w-full h-full"
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height="100%"
                    />
                  </Paper>
                </div>
              </div>
            ),
          }}
        >
          <HomePage />
        </ComplexRouteContainer>
      ),
    },
  },
  {
    navButtonProps: {
      expandedLabel: 'Create',
      unexpandedLabel: 'Create',
      Icon: AddIcon,
      dataId: 'create',
    },
    routeProps: {
      path: '/create',
      Component: () => (
        <CommonRouteContainer>
          <Create />
        </CommonRouteContainer>
      ),
    },
    linkProps: {
      to: '/create',
    },
    showInNav: true,
  },
  {
    navButtonProps: {
      expandedLabel: 'Open',
      unexpandedLabel: 'Open',
      Icon: FolderIcon,
      dataId: 'open',
    },
    routeProps: {
      path: '/open',
      Component: () => (
        <CommonRouteContainer>
          <Open />
        </CommonRouteContainer>
      ),
    },
    linkProps: {
      to: '/open',
    },
    showInNav: true,
  },
  {
    navButtonProps: {
      expandedLabel: 'Browse',
      unexpandedLabel: 'Browse',
      Icon: ViewListIcon,
      dataId: 'browse',
    },
    routeProps: {
      path: '/browse',
      Component: () => (
        <CommonRouteContainer>
          <SavedSearches />
        </CommonRouteContainer>
      ),
    },
    linkProps: {
      to: '/browse',
    },
    showInNav: true,
  },
  {
    navButtonProps: {
      expandedLabel: 'Upload',
      unexpandedLabel: 'Upload',
      Icon: ImageSearch,
      dataId: 'upload',
    },
    routeProps: {
      path: '/upload',
      Component: () => (
        <CommonRouteContainer>
          <IngestDetailsViewReact />
        </CommonRouteContainer>
      ),
    },
    linkProps: {
      to: '/upload',
    },
    showInNav: true,
  },
  {
    navButtonProps: {
      expandedLabel: 'Sources',
      unexpandedLabel: 'Sources',
      Icon: SourcesPageIcon,
      dataId: 'sources',
    },
    routeProps: {
      path: '/sources',
      Component: () => (
        <CommonRouteContainer>
          <SourcesPage />
        </CommonRouteContainer>
      ),
    },
    linkProps: {
      to: '/sources',
    },
    showInNav: true,
  },
  {
    navButtonProps: {
      expandedLabel: 'Restore',
      unexpandedLabel: 'Restore',
      Icon: TrashIcon,
      dataId: 'restore',
    },
    routeProps: {
      path: '/restore',
      Component: () => (
        <CommonRouteContainer>
          <Restore />
        </CommonRouteContainer>
      ),
    },
    linkProps: {
      to: '/restore',
    },
    showInNav: true,
  },
  {
    navButtonProps: {
      expandedLabel: 'About',
      unexpandedLabel: 'About',
      Icon: AboutPageIcon,
      dataId: 'about',
    },
    routeProps: {
      path: '/about',
      Component: () => (
        <CommonRouteContainer>
          <AboutPage />
        </CommonRouteContainer>
      ),
    },
    linkProps: {
      to: '/about',
    },
    showInNav: true,
  },
  GoldenLayoutPopoutRoute,
]

/**
 * Shows how downstream apps utilize the shell this app provides
 */
const BaseApp = () => {
  useDefaultWelcome()
  return (
    <>
      <SuspenseWrapper>
        <Help />
      </SuspenseWrapper>
      <App
        RouteInformation={RouteInformation}
        NotificationsComponent={() => <UserNotifications />}
        SettingsComponents={BaseSettings}
      />
    </>
  )
}

const WrappedWithProviders = () => {
  return (
    <HashRouter
      future={{
        v7_startTransition: true,
      }}
    >
      <ExtensionPoints.providers>
        <BaseApp />
      </ExtensionPoints.providers>
    </HashRouter>
  )
}

export default WrappedWithProviders
