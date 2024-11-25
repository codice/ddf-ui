
import App, { IndividualRouteType, useDefaultWelcome } from './app'
import Help from '../help/help.view'

import { hot } from 'react-hot-loader/root'
import { IngestDetailsViewReact } from '../ingest-details/ingest-details.view'
import { HomePage } from '../pages/search'

import SourcesPage from '../../react-component/sources/presentation'
import SourcesPageIcon from '@mui/icons-material/Cloud'
import AboutPage from '../../react-component/about'
import AboutPageIcon from '@mui/icons-material/Info'
import FolderIcon from '@mui/icons-material/Folder'
import TrashIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import ImageSearch from '@mui/icons-material/ImageSearch'
import UserNotifications from '../../react-component/user-notifications/user-notifications'
import { BaseSettings } from '../../react-component/user-settings/user-settings'
import ExtensionPoints from '../../extension-points/extension-points'
import Paper from '@mui/material/Paper'
import { Elevations } from '../theme/theme'
import { Redirect } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import MetacardNavRoute from '../pages/metacard-nav'
import MetacardRoute from '../pages/metacard'
import SavedSearches from '../pages/browse'
import Open from '../pages/open'
import Restore from '../pages/restore'
import Create from '../pages/create'
import AddIcon from '@mui/icons-material/Add'
import ViewListIcon from '@mui/icons-material/ViewList'
import { GoldenLayoutViewReact } from '../golden-layout/golden-layout.view'
import selectionInterfaceModel from '../selection-interface/selection-interface.model'
import { Query } from '../../js/model/TypedQuery'

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
    children: () => {
      const baseQuery = Query()
      return (
        <div className="w-full h-full pb-2 pt-2 pr-2">
          <Paper elevation={Elevations.panels} className="w-full h-full">
            <GoldenLayoutViewReact
              selectionInterface={
                new selectionInterfaceModel({ currentQuery: baseQuery })
              }
              setGoldenLayout={() => {}}
              configName="goldenLayout"
            />
          </Paper>
        </div>
      )
    },
  },
  showInNav: false,
}

const RouteInformation: IndividualRouteType[] = [
  {
    showInNav: false,
    routeProps: {
      exact: true,
      path: '/',
      children: () => {
        return <Redirect to="/search" />
      },
    },
  },
  {
    showInNav: false,
    routeProps: {
      exact: true,
      path: '/uploads/:uploadId',
      children: () => {
        return (
          <Grid
            container
            direction="column"
            className="w-full h-full"
            wrap="nowrap"
          >
            <Grid item className="w-full h-full z-0 relative overflow-hidden">
              <MetacardRoute />
            </Grid>
          </Grid>
        )
      },
    },
  },
  {
    showInNav: false,
    routeProps: {
      exact: true,
      path: '/metacards/:metacardId',
      children: () => {
        return (
          <Grid
            container
            direction="column"
            className="w-full h-full"
            wrap="nowrap"
          >
            <Grid item className="w-full h-16 z-1 relative pt-2 pr-2">
              <Paper
                elevation={Elevations.panels}
                className="w-full h-full px-3"
              >
                <MetacardNavRoute />
              </Paper>
            </Grid>
            <Grid item className="w-full h-full z-0 relative overflow-hidden">
              <MetacardRoute />
            </Grid>
          </Grid>
        )
      },
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
      exact: false,
      path: ['/search/:id', '/search'],
      children: () => {
        return <HomePage />
      },
    },
    linkProps: {
      to: '/search',
    },
    showInNav: true,
  },
  {
    navButtonProps: {
      expandedLabel: 'Create',
      unexpandedLabel: 'Create',
      Icon: AddIcon,
      dataId: 'create',
    },
    routeProps: {
      exact: true,
      path: ['/create'],
      children: () => {
        return (
          <div className="py-2 pr-2 w-full h-full">
            <Paper elevation={Elevations.panels} className="w-full h-full">
              <Create />
            </Paper>
          </div>
        )
      },
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
      exact: true,
      path: ['/open'],
      children: () => {
        return (
          <div className="py-2 pr-2 w-full h-full">
            <Paper elevation={Elevations.panels} className="w-full h-full">
              <Open />
            </Paper>
          </div>
        )
      },
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
      exact: true,
      path: ['/browse'],
      children: () => {
        return (
          <div className="w-full h-full">
            <SavedSearches />
          </div>
        )
      },
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
      children: () => {
        return (
          <div className="w-full h-full pb-2 pt-2 pr-2">
            <Paper elevation={Elevations.panels} className="w-full h-full">
              <IngestDetailsViewReact />
            </Paper>
          </div>
        )
      },
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
      children: () => {
        return (
          <div className="w-full h-full pb-2 pt-2 pr-2">
            <Paper elevation={Elevations.panels} className="w-full h-full">
              <SourcesPage />
            </Paper>
          </div>
        )
      },
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
      exact: true,
      path: ['/restore'],
      children: () => {
        return (
          <div className="py-2 pr-2 w-full h-full">
            <Paper elevation={Elevations.panels} className="w-full h-full">
              <Restore />
            </Paper>
          </div>
        )
      },
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
      children: () => {
        return (
          <div className="w-full h-full pb-2 pt-2 pr-2">
            <Paper elevation={Elevations.panels} className="w-full h-full">
              <AboutPage />
            </Paper>
          </div>
        )
      },
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
      <Help />
      <App
        RouteInformation={RouteInformation}
        NotificationsComponent={UserNotifications}
        SettingsComponents={BaseSettings}
      />
    </>
  )
}

const WrappedWithProviders = () => {
  return (
    <ExtensionPoints.providers>
      <BaseApp />
    </ExtensionPoints.providers>
  )
}

export default hot(WrappedWithProviders)
