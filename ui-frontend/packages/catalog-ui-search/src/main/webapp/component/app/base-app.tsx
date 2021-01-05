import * as React from 'react'
import App, {
  IndividualRouteType,
  useDefaultWelcome,
  useDefaultHelp,
} from './app'
import { hot } from 'react-hot-loader/root'
import MRC from '../../react-component/marionette-region-container'
const IngestView = require('../ingest/ingest.view')
import { HomePage } from '../pages/search'

import SourcesPage from '../../react-component/sources'
import SourcesPageIcon from '@material-ui/icons/Cloud'
import AboutPage from '../../react-component/about'
import AboutPageIcon from '@material-ui/icons/Info'
import FolderIcon from '@material-ui/icons/Folder'
import TrashIcon from '@material-ui/icons/Delete'
import SearchIcon from '@material-ui/icons/Search'
import ImageSearch from '@material-ui/icons/ImageSearch'
import UserNotifications from '../../react-component/user-notifications/user-notifications'
import { BaseSettings } from '../../react-component/user-settings/user-settings'
import { providers as Providers } from '../../extension-points/providers'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../theme/theme'
import { Redirect } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import MetacardNavRoute from '../pages/metacard-nav'
import MetacardRoute from '../pages/metacard'
import SavedSearches from '../pages/browse'
import Open from '../pages/open'
import Restore from '../pages/restore'
import Create from '../pages/create'
import AddIcon from '@material-ui/icons/Add'
import ViewListIcon from '@material-ui/icons/ViewList'
const RouteInformation = [
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
    name: 'Search',
    shortName: 'Search',
    Icon: SearchIcon,
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
    name: 'Create',
    shortName: 'Create',
    Icon: AddIcon,
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
    name: 'Open',
    shortName: 'Open',
    Icon: FolderIcon,
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
    name: 'Browse',
    shortName: 'Browse',
    Icon: ViewListIcon,
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
    name: 'Upload',
    shortName: 'Upload',
    Icon: ImageSearch,
    routeProps: {
      path: '/upload',
      children: () => {
        return (
          <div className="w-full h-full pb-2 pt-2 pr-2">
            <Paper elevation={Elevations.panels} className="w-full h-full">
              <MRC view={IngestView} />
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
    name: 'Sources',
    shortName: 'Sources',
    Icon: SourcesPageIcon,
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
    name: 'Restore',
    shortName: 'Restore',
    Icon: TrashIcon,
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
    name: 'About',
    shortName: 'About',
    Icon: AboutPageIcon,
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
] as IndividualRouteType[]

/**
 * Shows how downstream apps utilize the shell this app provides
 */
const BaseApp = () => {
  useDefaultWelcome()
  useDefaultHelp()
  return (
    <App
      RouteInformation={RouteInformation}
      NotificationsComponent={UserNotifications}
      SettingsComponents={BaseSettings}
    />
  )
}

const WrappedWithProviders = () => {
  return (
    <Providers>
      <BaseApp />
    </Providers>
  )
}

export default hot(WrappedWithProviders)
