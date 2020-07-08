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
import { default as SearchIcon } from '@material-ui/icons/Search'
import ImageSearch from '@material-ui/icons/ImageSearch'
import Subtitles from '@material-ui/icons/Subtitles'

import LandingPageIcon from '@material-ui/icons/Home'
import { providers as Providers } from '../../extension-points/providers'
const properties = require('catalog-ui-search/src/main/webapp/js/properties.js')
import SourcesPage from 'catalog-ui-search/src/main/webapp/react-component/sources'
import SourcesPageIcon from '@material-ui/icons/Cloud'
import AboutPage from 'catalog-ui-search/src/main/webapp/react-component/about'
import AboutPageIcon from '@material-ui/icons/Info'
import Grid from '@material-ui/core/Grid'
const BackboneRouterModel = require('catalog-ui-search/src/main/webapp/component/router/router.js')
import UserSettings from '../../react-component/user-settings/user-settings'

import { Location } from 'history'
const wreqr = require('catalog-ui-search/src/main/webapp/js/wreqr.js')
const $ = require('jquery')
import { createGlobalStyle } from 'styled-components'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import MRC from '../../react-component/marionette-region-container'
import { HomePage } from '../pages/home/home'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ListItem from '@material-ui/core/ListItem'
import MenuIcon from '@material-ui/icons/Menu'
import SettingsIcon from '@material-ui/icons/Settings'
import Drawer from '@material-ui/core/Drawer'

const IngestView = require('../ingest/ingest.view')

const drawerWidth = 240

export const handleBase64EncodedImages = (url: string) => {
  if (url && url.startsWith('data:')) {
    return url
  }
  return `data:image/png;base64,${url}`
}

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

type IndividualRouteType = {
  name: string
  shortName: string
  Icon: any
  routeProps: RouteProps
}

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
  },
] as IndividualRouteType[]

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
  const { listenTo } = useBackbone()
  let defaultOpen =
    localStorage.getItem('shell.drawer') === 'true' ? true : false
  console.log(defaultOpen)
  const [navOpen, setNavOpen] = React.useState(defaultOpen)
  const [withinNav, setWithinNav] = React.useState(false)

  function handleDrawerOpen() {
    localStorage.setItem('shell.drawer', 'true')
    setNavOpen(true)
  }

  function handleDrawerClose() {
    localStorage.setItem('shell.drawer', 'false')
    setNavOpen(false)
  }

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

  // todo add branding in
  //@ts-ignore
  const menuIcon, upperLeftLogo, lowerLeftBackground, lowerLeftLogo

  return (
    <Grid
      container
      className="h-full w-full overflow-hidden"
      direction="column"
      justify="space-between"
      wrap="nowrap"
    >
      <Grid item className="w-full">
        {properties.ui.header ? (
          <Typography
            align="center"
            style={{
              background: properties.ui.background,
              color: properties.ui.color,
            }}
          >
            {properties.ui.header}
          </Typography>
        ) : null}
      </Grid>
      <Grid item className="w-full h-full relative overflow-hidden">
        <Grid
          container
          direction="row"
          wrap="nowrap"
          alignItems="stretch"
          className="w-full h-full"
        >
          <Grid
            item
            className={`${
              navOpen ? 'w-64' : 'w-20'
            } transition-all duration-200 ease-in-out relative z-10`}
            onMouseEnter={() => {
              setWithinNav(true)
            }}
            onMouseLeave={() => {
              setWithinNav(false)
            }}
          >
            <Paper elevation={6} className="h-full">
              <Grid container direction="column" className="h-full w-full">
                <Grid item className="w-full">
                  {navOpen ? (
                    <>
                      <Grid
                        container
                        wrap="nowrap"
                        alignItems="center"
                        className="w-full h-full overflow-hidden"
                        style={{
                          maxHeight: '64px',
                        }}
                      >
                        <Grid
                          item
                          className="w-full relative"
                          style={{
                            height: upperLeftLogo ? '100%' : 'auto',
                          }}
                        >
                          {upperLeftLogo ? (
                            <img
                              className="max-h-full max-w-full absolute left-0 transform -translate-y-1/2 top-1/2"
                              style={{
                                padding: '5px 0px',
                              }}
                              src={handleBase64EncodedImages(upperLeftLogo)}
                            />
                          ) : (
                            <Grid container direction="column" className="pl-3">
                              <Grid item>
                                <Typography>{properties.branding}</Typography>
                              </Grid>
                              <Grid item>
                                <Typography>{properties.product}</Typography>
                              </Grid>
                            </Grid>
                          )}
                        </Grid>
                        <Grid item className="ml-auto">
                          <IconButton
                            className="h-auto"
                            onClick={handleDrawerClose}
                          >
                            <ChevronLeftIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <Button
                      color="inherit"
                      aria-label="open drawer"
                      onClick={handleDrawerOpen}
                      className="w-full h-auto"
                      style={{
                        padding: menuIcon ? '0px' : '12px',
                      }}
                    >
                      {menuIcon ? (
                        <>
                          <img
                            src={handleBase64EncodedImages(menuIcon)}
                            style={{ width: '51.42px' }}
                          />
                        </>
                      ) : (
                        <MenuIcon />
                      )}
                    </Button>
                  )}

                  <Divider />
                  <List className="overflow-hidden ">
                    {RouteInformation.map(routeInfo => {
                      const isSelected = matchesRoute({
                        routeInfo,
                        pathname: location.pathname,
                      })
                      return (
                        <div
                          key={routeInfo.name}
                          onClick={() => {
                            if (routeInfo.routeProps.path) {
                              const path =
                                typeof routeInfo.routeProps.path === 'string'
                                  ? routeInfo.routeProps.path
                                  : routeInfo.routeProps.path[0]
                              history.push(path)
                            }
                          }}
                        >
                          <ListItem
                            button
                            tabIndex={-1}
                            className={`${
                              !withinNav && !isSelected ? 'opacity-25' : ''
                            } relative py-3 hover:opacity-100 transition-opacity`}
                          >
                            <ListItemIcon>
                              {routeInfo.Icon ? (
                                <routeInfo.Icon
                                  className="transition duration-200 ease-in-out"
                                  style={{
                                    transform: navOpen
                                      ? 'none'
                                      : 'translateX(2px) translateY(-10px)',
                                  }}
                                />
                              ) : null}
                              <Typography
                                variant="body2"
                                className={`${
                                  navOpen ? 'opacity-0' : 'opacity-100'
                                } transform -translate-x-1/2 -translate-y-1 absolute left-1/2 bottom-0 transition duration-200 ease-in-out`}
                              >
                                {routeInfo.shortName}
                              </Typography>
                            </ListItemIcon>
                            <ListItemText primary={routeInfo.name} />
                          </ListItem>
                        </div>
                      )
                    })}
                  </List>

                  <Divider />
                </Grid>
                <Grid item className="mt-auto overflow-hidden w-full">
                  {(() => {
                    const [open, setOpen] = React.useState(false)
                    return (
                      <>
                        <ListItem
                          button
                          tabIndex={-1}
                          className={`${
                            !withinNav ? 'opacity-25' : ''
                          } relative py-3 hover:opacity-100 transition-opacity`}
                          onClick={() => {
                            setOpen(true)
                          }}
                        >
                          <ListItemIcon>
                            <SettingsIcon
                              className="transition duration-200 ease-in-out"
                              style={{
                                transform: navOpen
                                  ? 'none'
                                  : 'translateX(2px) translateY(-10px)',
                              }}
                            />
                            <Typography
                              variant="body2"
                              className={`${
                                navOpen ? 'opacity-0' : 'opacity-100'
                              } transform -translate-x-1/2 -translate-y-1 absolute left-1/2 bottom-0 transition duration-200 ease-in-out`}
                            >
                              Settings
                            </Typography>
                          </ListItemIcon>
                          <ListItemText primary={'Settings'} />
                        </ListItem>
                        <Drawer
                          anchor="left"
                          open={open}
                          onClose={() => {
                            setOpen(false)
                          }}
                          PaperProps={{
                            className: 'min-w-120 max-w-4/5',
                          }}
                        >
                          <UserSettings />
                        </Drawer>
                      </>
                    )
                  })()}
                </Grid>
                <Grid item className="w-full">
                  <div className="h-full overflow-hidden relative">
                    {lowerLeftBackground ? (
                      <img
                        className={
                          'h-full absolute scale-200 opacity-50 -z-1 transform'
                        }
                        src={handleBase64EncodedImages(lowerLeftBackground)}
                      />
                    ) : null}
                    <a
                      href="../"
                      className="absolute bottom-0 bg-transparent p-0 left-1/2 transform -translate-x-1/2"
                    >
                      <img
                        style={{
                          width: navOpen ? `${drawerWidth - 20}px` : '52px',
                          padding: navOpen ? `20px` : '5px',
                        }}
                        src={handleBase64EncodedImages(
                          lowerLeftLogo || properties.ui.productImage
                        )}
                      />
                    </a>
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item className="w-full h-full overflow-hidden relative z-0">
            <Paper className="w-full h-full">
              <Switch>
                {RouteInformation.map(routeInfo => {
                  return (
                    <Route key={routeInfo.name} {...routeInfo.routeProps} />
                  )
                })}
              </Switch>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Grid item style={{ width: '100%' }}>
        {properties.ui.footer ? (
          <Typography
            align="center"
            style={{
              background: properties.ui.background,
              color: properties.ui.color,
            }}
          >
            {properties.ui.footer}
          </Typography>
        ) : null}
      </Grid>
    </Grid>
  )
}

/**
 * You're asking why don't we push this into the above component?
 *
 * Main reason is we need to use some context that router provides.  So we need to separate at least the Router component to be above it.
 */
const AppComponent = function() {
  return (
    <Providers>
      <CssBaseline />
      <BootstrapFixGlobalStyle />
      <Router>
        <App />
      </Router>
    </Providers>
  )
}

export default hot(AppComponent)
