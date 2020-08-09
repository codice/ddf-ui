import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import {
  Switch,
  Route,
  useLocation,
  useHistory,
  RouteProps,
  LinkProps,
} from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'

const properties = require('../../js/properties.js')

import Grid from '@material-ui/core/Grid'
const $ = require('jquery')
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
import queryString from 'query-string'
import { Link } from '../link/link'
import { Memo } from '../memo/memo'
import HelpIcon from '@material-ui/icons/Help'
import NotificationsIcon from '@material-ui/icons/Notifications'
import PersonIcon from '@material-ui/icons/Person'
const userInstance = require('../singletons/user-instance.js')
import UserView from '../../react-component/user'
import UserSettings, {
  SettingsComponentType,
} from '../../react-component/user-settings/user-settings'

const HelpView = require('../help/help.view.js')
import { GlobalStyles } from './global-styles'
import CancelDrawing from './cancel-drawing'
import { PermissiveComponentType } from '../../typescript'
import Box from '@material-ui/core/Box'
export const handleBase64EncodedImages = (url: string) => {
  if (url && url.startsWith('data:')) {
    return url
  }
  return `data:image/png;base64,${url}`
}

export type RouteShownInNavType = {
  name: string
  shortName: string
  Icon?: any
  routeProps: RouteProps
  linkProps: LinkProps
  showInNav: true
}

export type RouteNotShownInNavType = {
  routeProps: RouteProps
  showInNav: false
}
export type IndividualRouteType = RouteShownInNavType | RouteNotShownInNavType

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
    return (
      pathname.startsWith(`${routeInfo.routeProps.path}/`) ||
      pathname.endsWith(`${routeInfo.routeProps.path}`)
    )
  } else if (
    routeInfo.routeProps.path &&
    routeInfo.routeProps.path.constructor === Array
  ) {
    return routeInfo.routeProps.path.some(
      possibleRoute =>
        pathname.startsWith(`${possibleRoute}/`) ||
        pathname.endsWith(`${possibleRoute}`)
    )
  }
  return false
}

type AppPropsType = {
  RouteInformation: IndividualRouteType[]
  NotificationsComponent: PermissiveComponentType
  SettingsComponents: SettingsComponentType
}

/**
 * If you're not using a custom loading screen,
 * this handles removing the default one for you on first render
 * of the app.
 */
export const useDefaultWelcome = () => {
  React.useEffect(() => {
    const loadingElement = document.querySelector('#loading')
    if (loadingElement) {
      loadingElement.classList.remove('is-open')
    }
  }, [])
}

export const useDefaultHelp = () => {
  const location = useLocation()
  const history = useHistory()

  const queryParams = queryString.parse(location.search)

  React.useEffect(() => {
    const openHelp = Boolean(queryParams['global-help'])

    HelpView.onClose = () => {
      delete queryParams['global-help']
      history.push(`${location.pathname}?${queryString.stringify(queryParams)}`)
    }
    if (openHelp && !HelpView.hintOn) {
      HelpView.toggleHints()
    } else if (!openHelp && HelpView.hintOn) {
      HelpView.toggleHints()
    }
  })
}

const App = ({
  RouteInformation,
  NotificationsComponent,
  SettingsComponents,
}: AppPropsType) => {
  const location = useLocation()
  const history = useHistory()
  const queryParams = queryString.parse(location.search)
  let defaultOpen =
    localStorage.getItem('shell.drawer') === 'true' ? true : false
  const [navOpen, setNavOpen] = React.useState(defaultOpen)
  const [withinNav, setWithinNav] = React.useState(false)

  function handleDrawerOpen() {
    localStorage.setItem('shell.drawer', 'true')
    setNavOpen(true)
    setTimeout(() => {
      $(window).resize() // needed for golden layout to resize
    }, 250)
  }

  function handleDrawerClose() {
    localStorage.setItem('shell.drawer', 'false')
    setNavOpen(false)
    setTimeout(() => {
      $(window).resize() // needed for golden layout to resize
    }, 250)
  }

  React.useEffect(
    () => {
      setWithinNav(false)
    },
    [location]
  )

  // todo favicon branding
  // $(window.document).ready(() => {
  //   window.document.title = properties.branding + ' ' + properties.product
  //   const favicon = document.querySelector('#favicon') as HTMLAnchorElement
  //   favicon.href = brandingInformation.topLeftLogoSrc
  //   favicon.remove()
  //   document.head.appendChild(favicon)
  // })

  return (
    <Box bgcolor="background.default" className="h-full w-full overflow-hidden">
      {/* Don't move CSSBaseline or GlobalStyles to providers, since we have multiple react roots.   */}
      <CssBaseline />
      <GlobalStyles />
      <CancelDrawing />
      <Grid
        container
        alignItems="center"
        className="h-full w-full overflow-hidden"
        direction="column"
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
        <Grid item className="w-full h-full relative overflow-hidden p-2">
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
              } transition-all duration-200 ease-in-out relative z-10 mr-2 flex-shrink-0`}
              onMouseEnter={() => {
                setWithinNav(true)
              }}
              onMouseLeave={() => {
                setWithinNav(false)
              }}
            >
              <Paper elevation={6} className="h-full">
                <Grid
                  container
                  direction="column"
                  className="h-full w-full"
                  wrap="nowrap"
                >
                  <Grid item className="w-full h-16 flex-shrink-0">
                    {navOpen ? (
                      <>
                        <Grid
                          container
                          wrap="nowrap"
                          alignItems="center"
                          className="w-full h-full overflow-hidden"
                        >
                          <Grid
                            item
                            className="pl-3 py-1 pr-1 w-full relative h-full"
                          >
                            {properties.topLeftLogoSrc ? (
                              <img
                                className="max-h-full max-w-full absolute left-0 transform -translate-y-1/2 top-1/2"
                                src={handleBase64EncodedImages(
                                  properties.topLeftLogoSrc
                                )}
                              />
                            ) : (
                              <Grid
                                container
                                direction="column"
                                className="pl-3"
                                justify="center"
                              >
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
                        className="w-full h-full p-2"
                      >
                        {properties.menuIconSrc ? (
                          <>
                            <img
                              src={handleBase64EncodedImages(
                                properties.menuIconSrc
                              )}
                              className="max-h-16 max-w-full"
                            />
                          </>
                        ) : (
                          <MenuIcon />
                        )}
                      </Button>
                    )}
                  </Grid>
                  <Divider />
                  <Grid item className="flex-shrink-0">
                    <List className="overflow-hidden p-0">
                      {RouteInformation.filter(
                        routeInfo => routeInfo.showInNav
                      ).map((routeInfo: RouteShownInNavType) => {
                        const isSelected = matchesRoute({
                          routeInfo,
                          pathname: location.pathname,
                        })
                        return (
                          <ListItem
                            key={routeInfo.name}
                            button
                            component={Link}
                            to={routeInfo.linkProps.to}
                            className={`${
                              !withinNav && !isSelected ? 'opacity-25' : ''
                            } relative py-3 focus:opacity-100 hover:opacity-100 transition-opacity`}
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
                              {routeInfo.Icon ? (
                                <Typography
                                  variant="body2"
                                  className={`${
                                    navOpen ? 'opacity-0' : 'opacity-100'
                                  } transform -translate-x-1/2 -translate-y-1 absolute left-1/2 bottom-0 transition duration-200 ease-in-out`}
                                >
                                  {routeInfo.shortName}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="body2"
                                  className={`${
                                    navOpen ? 'opacity-0' : 'opacity-100'
                                  } transform -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 transition duration-200 ease-in-out`}
                                >
                                  {routeInfo.shortName}
                                </Typography>
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primaryTypographyProps={{
                                className: 'whitespace-no-wrap',
                              }}
                              primary={routeInfo.name}
                            />
                          </ListItem>
                        )
                      })}
                    </List>
                  </Grid>
                  <Divider />
                  <Grid item className="relative h-full overflow-hidden">
                    {properties.bottomLeftBackgroundSrc ? (
                      <img
                        className={`${
                          withinNav ? 'opacity-100' : 'opacity-50'
                        } duration-200 ease-in-out transition-all w-auto h-full absolute max-w-none`}
                        src={handleBase64EncodedImages(
                          properties.bottomLeftBackgroundSrc
                        )}
                      />
                    ) : null}
                  </Grid>
                  <Grid
                    item
                    className="mt-auto overflow-hidden w-full flex-shrink-0"
                  >
                    <Divider />
                    <Grid
                      container
                      className="w-full"
                      alignItems="center"
                      direction="column"
                      wrap="nowrap"
                    >
                      <Grid item className="w-full">
                        {/** The song and dance around 'a' vs Link has to do with react router not supporting these outside links */}
                        <ListItem
                          button
                          component={properties.helpUrl ? 'a' : Link}
                          href={properties.helpUrl}
                          to={
                            properties.helpUrl
                              ? properties.helpurl
                              : {
                                  pathname: `${location.pathname}`,
                                  search: `${queryString.stringify({
                                    ...queryParams,
                                    'global-help': 'Help',
                                  })}`,
                                }
                          }
                          target={properties.helpUrl ? '_blank' : undefined}
                          className={`${
                            !withinNav ? 'opacity-25' : ''
                          } relative py-3 hover:opacity-100 focus:opacity-100 transition-opacity`}
                        >
                          <ListItemIcon>
                            <HelpIcon
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
                              Help
                            </Typography>
                          </ListItemIcon>
                          <ListItemText primary={'Help'} />
                        </ListItem>
                      </Grid>
                      <Grid item className="w-full">
                        {(() => {
                          const open = Boolean(queryParams['global-settings'])
                          return (
                            <>
                              <ListItem
                                button
                                component={Link}
                                to={{
                                  pathname: `${location.pathname}`,
                                  search: `${queryString.stringify({
                                    ...queryParams,
                                    'global-settings': 'Settings',
                                  })}`,
                                }}
                                className={`${
                                  !withinNav ? 'opacity-25' : ''
                                } relative py-3 hover:opacity-100 focus:opacity-100 transition-opacity`}
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
                                  delete queryParams['global-settings']
                                  history.push(
                                    `${
                                      location.pathname
                                    }?${queryString.stringify(queryParams)}`
                                  )
                                }}
                                PaperProps={{
                                  className: 'min-w-120 max-w-4/5 ',
                                }}
                              >
                                <UserSettings
                                  SettingsComponents={SettingsComponents}
                                />
                              </Drawer>
                            </>
                          )
                        })()}
                      </Grid>

                      <Grid item className="w-full">
                        {(() => {
                          const open = Boolean(
                            queryParams['global-notifications']
                          )

                          return (
                            <>
                              <ListItem
                                button
                                component={Link}
                                to={{
                                  pathname: `${location.pathname}`,
                                  search: `${queryString.stringify({
                                    ...queryParams,
                                    'global-notifications': 'Notifications',
                                  })}`,
                                }}
                                className={`${
                                  !withinNav ? 'opacity-25' : ''
                                } relative py-3 hover:opacity-100 focus:opacity-100 transition-opacity`}
                              >
                                <ListItemIcon>
                                  <NotificationsIcon
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
                                    Notices
                                  </Typography>
                                </ListItemIcon>
                                <ListItemText primary={'Notifications'} />
                              </ListItem>
                              <Drawer
                                anchor="left"
                                open={open}
                                onClose={() => {
                                  delete queryParams['global-notifications']
                                  history.push(
                                    `${
                                      location.pathname
                                    }?${queryString.stringify(queryParams)}`
                                  )
                                }}
                                PaperProps={{
                                  className: 'min-w-120 max-w-4/5 ',
                                }}
                              >
                                <NotificationsComponent />
                              </Drawer>
                            </>
                          )
                        })()}
                      </Grid>
                      <Grid item className="w-full">
                        {(() => {
                          const open = Boolean(queryParams['global-user'])
                          return (
                            <>
                              <ListItem
                                button
                                component={Link}
                                to={{
                                  pathname: `${location.pathname}`,
                                  search: `${queryString.stringify({
                                    ...queryParams,
                                    'global-user': 'User',
                                  })}`,
                                }}
                                className={`${
                                  !withinNav ? 'opacity-25' : ''
                                } relative py-3 hover:opacity-100 focus:opacity-100 transition-opacity`}
                              >
                                <ListItemIcon>
                                  <PersonIcon
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
                                    } transform -translate-x-1/2 -translate-y-1 absolute left-1/2 bottom-0 transition duration-200 ease-in-out max-w-full truncate px-1`}
                                  >
                                    {userInstance.getUserName()}
                                  </Typography>
                                </ListItemIcon>
                                <ListItemText
                                  primaryTypographyProps={{
                                    className: 'truncate',
                                  }}
                                  primary={userInstance.getUserName()}
                                />
                              </ListItem>
                              <Drawer
                                anchor="left"
                                open={open}
                                onClose={() => {
                                  delete queryParams['global-user']
                                  history.push(
                                    `${
                                      location.pathname
                                    }?${queryString.stringify(queryParams)}`
                                  )
                                }}
                                PaperProps={{
                                  className: 'min-w-120 max-w-4/5 ',
                                }}
                              >
                                <UserView />
                              </Drawer>
                            </>
                          )
                        })()}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item className="w-full h-full relative z-0 flex-shrink-1">
              <Memo>
                <Switch>
                  {RouteInformation.map((routeInfo: RouteShownInNavType) => {
                    return (
                      <Route key={routeInfo.name} {...routeInfo.routeProps} />
                    )
                  })}
                </Switch>
              </Memo>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className="w-full">
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
    </Box>
  )
}

export default hot(App)
