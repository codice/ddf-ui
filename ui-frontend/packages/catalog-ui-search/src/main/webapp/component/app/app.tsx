import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import {
  HashRouter as Router,
  Switch,
  Route,
  useLocation,
  useHistory,
  useParams,
  RouteProps,
} from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { Shell } from '../shell/shell'
import { Links } from '../shell/links'
import { Banner } from '../shell/banner'
import { default as SearchIcon } from '@material-ui/icons/Search'
import ImageSearch from '@material-ui/icons/ImageSearch'
import Subtitles from '@material-ui/icons/Subtitles'

import LandingPageIcon from '@material-ui/icons/Home'
import { providers as Providers } from '../../extension-points/providers'
const properties = require('catalog-ui-search/src/main/webapp/js/properties.js')
import NavigationRight from 'catalog-ui-search/src/main/webapp/react-component/navigation-right'
import SourcesPage from 'catalog-ui-search/src/main/webapp/react-component/sources'
import SourcesPageIcon from '@material-ui/icons/Cloud'
import AboutPage from 'catalog-ui-search/src/main/webapp/react-component/about'
import AboutPageIcon from '@material-ui/icons/Info'
import Grid from '@material-ui/core/Grid'
const BackboneRouterModel = require('catalog-ui-search/src/main/webapp/component/router/router.js')

import { Location } from 'history'
const wreqr = require('catalog-ui-search/src/main/webapp/js/wreqr.js')
const $ = require('jquery')
import { createGlobalStyle } from 'styled-components'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import MRC from '../../react-component/marionette-region-container'
import { HomePage } from '../pages/home/home'
const IngestView = require('../ingest/ingest.view')

const BootstrapFixGlobalStyle = createGlobalStyle`
  /* Only needed because we import 'bootstrap.less' in catalog-ui-search. */
  legend {
    /* Unset all properties */
    all: unset;

    /* Place back material-ui styling */
    padding: 0 !important;
    text-align: left !important;
    transition: width 200ms cubic-bezier(0, 0, 0.2, 1) 0ms;
    line-height: 11px !important;
  }
  
  /* renormalize */
  intrigue-slideout, intrigue-confirmation {
    z-index: 101 !important;
  }

  /* So we match Material */
  .navigation-item + .navigation-item {
    margin-left: 10px;
  }
  .navigation-item:not(:last-of-type) {
    border-radius: 25px; 
  }

  .inspector-content {
    transform: none;
  }
  .MuiPickersModal-dialogRootWider {
    min-width: 500px !important;
  }
  .MuiPickersBasePicker-pickerView {
    max-width: none !important;
  }
  .MuiDialog-paperWidthSm {
    max-width: none !important;
  }

  .no-resource {
    *[data-id='Overwrite'] {
      display: none !important;
    }
  }
  .federated {
    *[data-id='Notes'] {
      display: none !important;
    }
  }
`

/**
 * Get around styling issues with links until we remove bootstrap, etc.
 */
const SpecialLink = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  return <div {...props} />
}

type IndividualRouteType = {
  name: string
  shortName: string
  Icon: any
  navRouteProps: RouteProps
  routeProps: RouteProps
}

const RouteInformation = [
  {
    name: 'Home',
    shortName: 'Home',
    Icon: LandingPageIcon,
    navRouteProps: {
      exact: true,
      path: '/home',
      children: <div>LandingPage</div>,
    },
    routeProps: {
      exact: true,
      path: ['/home'],
      children: () => {
        return <HomePage />
      },
    },
  },
  {
    name: 'Upload',
    shortName: 'Upload',
    Icon: ImageSearch,
    navRouteProps: {
      path: '/upload',
    },
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
  },
  {
    name: 'Sources',
    shortName: 'Sources',
    Icon: SourcesPageIcon,
    navRouteProps: {
      path: '/sources',
    },
    routeProps: {
      path: '/sources',
      children: () => {
        return <SourcesPage />
      },
    },
  },
  {
    name: 'About',
    shortName: 'About',
    Icon: AboutPageIcon,
    navRouteProps: {
      path: '/about',
      children: () => {
        return <div>About</div>
      },
    },
    routeProps: {
      path: '/about',
      children: () => {
        return <AboutPage />
      },
    },
  },
] as IndividualRouteType[]

const getNavRoutes = () => (
  <Switch>
    {RouteInformation.map(routeInfo => {
      return <Route key={routeInfo.name} {...routeInfo.navRouteProps} />
    })}
  </Switch>
)

const getRoutes = () => (
  <Switch>
    {RouteInformation.map(routeInfo => {
      return <Route key={routeInfo.name} {...routeInfo.routeProps} />
    })}
  </Switch>
)

BackboneRouterModel.set({
  name: '',
  path: '',
  args: [''],
})

/**
 * Backbone based routes use name to see if they're open, so we use this
 */
const pathnameToName = ({ location }: { location: Location<any> }) => {
  if (location.pathname.includes('/metacards/')) {
    return 'openMetacard'
  }
  return ''
}

const matchesRoute = ({
  routeInfo,
  pathname,
}: {
  routeInfo: IndividualRouteType
  pathname: string
}) => {
  if (
    routeInfo.routeProps.path &&
    typeof routeInfo.routeProps.path === 'string'
  ) {
    return routeInfo.routeProps.path.startsWith(pathname)
  } else if (
    routeInfo.routeProps.path &&
    routeInfo.routeProps.path.constructor === Array
  ) {
    return routeInfo.routeProps.path.some(possibleRoute =>
      possibleRoute.startsWith(pathname)
    )
  }
  return false
}

const App = () => {
  const location = useLocation()
  const history = useHistory()
  const params = useParams()
  const { listenTo } = useBackbone()

  React.useEffect(() => {
    /**
     * Makes it so the old way of updating the route still works with React Router
     */
    listenTo(
      wreqr.vent,
      'router:navigate',
      ({ fragment, options }: { fragment: string; options: any }) => {
        history.push(`/${fragment}`)
        console.log(fragment)
        console.log(options)
      }
    )
    /**
     * Updates the slideouts to not care about cutting things off
     */
    const slideouts = document.querySelectorAll('intrigue-slideout')
    slideouts.forEach(slideout => {
      slideout.classList.add('is-right')
    })
  }, [])

  React.useEffect(() => {
    /**
     * Makes it so routes that depend on the backbone router way of doing things still work
     */
    if (BackboneRouterModel.toJSON().path !== location.pathname) {
      const urlParts = location.pathname.split('/')
      BackboneRouterModel.set({
        name: pathnameToName({ location }),
        path: location.pathname,
        args: [urlParts[urlParts.length - 1]],
      })
      setTimeout(() => {
        $(window).resize()
        wreqr.vent.trigger('resize')
      }, 500)
    }
  })

  const LinksToRender = Links({
    items: RouteInformation.map(routeInfo => {
      return {
        isSelected: matchesRoute({ routeInfo, pathname: location.pathname }),
        name: routeInfo.name,
        shortName: routeInfo.shortName,
        Icon: routeInfo.Icon,
        WrapperComponent: SpecialLink,
        wrapperComponentProps: {
          onClick: () => {
            if (routeInfo.routeProps.path) {
              const path =
                typeof routeInfo.routeProps.path === 'string'
                  ? routeInfo.routeProps.path
                  : routeInfo.routeProps.path[0]
              history.push(path)
            }
          },
        },
      }
    }),
  })

  return (
    <Shell
      productImage={properties.ui.productImage}
      branding={properties.branding}
      productName={properties.product}
      Header={() => {
        return (
          <>
            <Grid container alignItems="center" wrap="nowrap">
              <Grid item style={{ flexGrow: 1, overflow: 'hidden' }}>
                {getNavRoutes()}
              </Grid>
              <Grid item style={{ marginRight: 'auto' }}>
                <NavigationRight />
              </Grid>
            </Grid>
          </>
        )
      }}
      Links={LinksToRender}
      Content={() => {
        return getRoutes()
      }}
      BannerHeader={
        properties.ui.header ? (
          <Banner
            text={properties.ui.header}
            color={properties.ui.color}
            background={properties.ui.background}
          />
        ) : null
      }
      BannerFooter={
        properties.ui.footer ? (
          <Banner
            text={properties.ui.footer}
            color={properties.ui.color}
            background={properties.ui.background}
          />
        ) : null
      }
    />
  )
}

const AppComponent = function() {
  return (
    <Providers>
      <CssBaseline />
      <Router>
        <Switch>
          <Route path="/">
            <App />
            <BootstrapFixGlobalStyle />
          </Route>
        </Switch>
      </Router>
    </Providers>
  )
}

export default hot(AppComponent)
