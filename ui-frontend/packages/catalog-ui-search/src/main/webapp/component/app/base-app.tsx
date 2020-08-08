import * as React from 'react'
import App, {
  IndividualRouteType,
  useDefaultWelcome,
  useDefaultHelp,
} from './app'
import { hot } from 'react-hot-loader/root'
import MRC from '../../react-component/marionette-region-container'
const IngestView = require('../ingest/ingest.view')
import { HomePage } from '../pages/home/home'

import SourcesPage from '../../react-component/sources'
import SourcesPageIcon from '@material-ui/icons/Cloud'
import AboutPage from '../../react-component/about'
import AboutPageIcon from '@material-ui/icons/Info'
import SearchIcon from '@material-ui/icons/Search'
import ImageSearch from '@material-ui/icons/ImageSearch'
import UserNotifications from '../../react-component/user-notifications/user-notifications'
import { BaseSettings } from '../../react-component/user-settings/user-settings'
import { providers as Providers } from '../../extension-points/providers'

const RouteInformation = [
  {
    name: 'Search',
    shortName: 'Search',
    Icon: SearchIcon,
    routeProps: {
      exact: true,
      path: ['/home'],
      children: () => {
        return <HomePage />
      },
    },
    linkProps: {
      to: '/home',
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
          <MRC
            style={{
              height: '100%',
              width: '100%',
            }}
            view={IngestView}
          />
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
        return <SourcesPage />
      },
    },
    linkProps: {
      to: '/sources',
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
        return <AboutPage />
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
