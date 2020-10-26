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
import ExpandingButton from '../button/expanding-button'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
// @ts-ignore ts-migrate(6133) FIXME: 'ListItem' is declared but its value is never read... Remove this comment to see the full error message
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
const notifications = require('../singletons/user-notifications.js')
import SystemUsageModal from '../system-usage/system-usage'

import UserView from '../../react-component/user'
import UserSettings, {
  SettingsComponentType,
} from '../../react-component/user-settings/user-settings'
const wreqr = require('../../js/wreqr.js')
const HelpView = require('../help/help.view.js')
import { GlobalStyles } from './global-styles'
import CancelDrawing from './cancel-drawing'
import { PermissiveComponentType } from '../../typescript'
import Box from '@material-ui/core/Box'
import scrollIntoView from 'scroll-into-view-if-needed'
import { Elevations } from '../theme/theme'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
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
    // @ts-ignore FIXME TS2339: Property 'some' does not exist on type 'string | string[]
    return routeInfo.routeProps.path.some(
      // @ts-ignore FIXME implicit any
      (possibleRoute) =>
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

const scrollCurrentRouteIntoView = () => {
  setTimeout(() => {
    const currentroute = document.querySelector('[data-currentroute]')
    if (currentroute) {
      scrollIntoView(currentroute, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
      })
    }
  }, 0)
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
  const [hasUnseenNotifications, setHasUnseenNotifications] = React.useState(
    notifications.hasUnseen() as boolean
  )
  const { listenTo } = useBackbone()
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

  // todo favicon branding
  // $(window.document).ready(() => {
  //   window.document.title = properties.branding + ' ' + properties.product
  //   const favicon = document.querySelector('#favicon') as HTMLAnchorElement
  //   favicon.href = brandingInformation.topLeftLogoSrc
  //   favicon.remove()
  //   document.head.appendChild(favicon)
  // })

  /**
   * Keep the current route visible to the user since it's useful info.
   * This also ensures it's visible upon first load of the page.
   */
  React.useEffect(() => {
    scrollCurrentRouteIntoView()
  }, [location])
  React.useEffect(() => {
    listenTo(notifications, 'change add remove reset update', () => {
      setHasUnseenNotifications(notifications.hasUnseen() as boolean)
    })
    listenTo(wreqr.vent, 'router:navigate', ({ fragment }: any) => {
      history.push(`/${fragment}`)
    })
  }, [])
  return (
    <Box bgcolor="background.default" className="h-full w-full overflow-hidden">
      {/* Don't move CSSBaseline or GlobalStyles to providers, since we have multiple react roots.   */}
      <CssBaseline />
      <GlobalStyles />
      <CancelDrawing />
      <SystemUsageModal />
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
              } transition-all duration-200 ease-in-out relative z-10 mr-2 flex-shrink-0 pb-2 pt-2 pl-2 group`}
              onMouseLeave={() => {
                scrollCurrentRouteIntoView()
              }}
            >
              <Paper elevation={Elevations.navbar} className="h-full">
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
                                className="max-h-full max-w-full absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 p-4"
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
                                  <Typography>
                                    {properties.customBranding}
                                  </Typography>
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
                  <Grid
                    item
                    className="overflow-auto p-0 flex-shrink-0 scrollbars-min"
                    style={{
                      maxHeight: `calc(100% - ${7 * 4}rem)`, //
                    }}
                  >
                    {RouteInformation.filter(
                      (routeInfo) => routeInfo.showInNav
                    ).map((routeInfo: RouteShownInNavType) => {
                      const isSelected = matchesRoute({
                        routeInfo,
                        pathname: location.pathname,
                      })
                      return (
                        <ExpandingButton
                          key={routeInfo.linkProps.to.toString()}
                          // @ts-ignore ts-migrate(2322) FIXME: Type 'null' is not assignable to type 'string | nu... Remove this comment to see the full error message
                          component={Link}
                          to={routeInfo.linkProps.to}
                          className={`group-hover:opacity-100 ${
                            !isSelected ? 'opacity-25' : ''
                          } focus-visible:opacity-100 hover:opacity-100 transition-opacity`}
                          Icon={routeInfo.Icon ? routeInfo.Icon : undefined}
                          expanded={navOpen}
                          iconPosition="start"
                          expandedText={routeInfo.name}
                          unexpandedText={routeInfo.shortName}
                          focusVisibleClassName="focus-visible"
                          {...(isSelected
                            ? {
                                ['data-currentroute']: true,
                              }
                            : {})}
                        />
                      )
                    })}
                  </Grid>
                  <Divider />
                  <Grid
                    item
                    className="relative overflow-hidden flex-shrink-1 h-full min-w-full"
                  >
                    {properties.bottomLeftBackgroundSrc ? (
                      <img
                        className={`group-hover:opacity-100 opacity-50 duration-200 ease-in-out transition-all w-auto h-full absolute max-w-none m-auto min-h-80`}
                        src={handleBase64EncodedImages(
                          properties.bottomLeftBackgroundSrc
                        )}
                      />
                    ) : null}
                  </Grid>
                  <Divider />
                  <Grid
                    item
                    className="mt-auto overflow-hidden w-full flex-shrink-0 flex-grow-0"
                  >
                    {/** The song and dance around 'a' vs Link has to do with react router not supporting these outside links */}
                    <ExpandingButton
                      // @ts-ignore ts-migrate(2322) FIXME: Type 'ForwardRefExoticComponent<LinkProps<UnknownF... Remove this comment to see the full error message
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
                      className={`group-hover:opacity-100 opacity-25  hover:opacity-100 focus-visible:opacity-100 transition-opacity`}
                      Icon={HelpIcon}
                      iconPosition="start"
                      expandedText="Help"
                      unexpandedText="Help"
                      expanded={navOpen}
                      focusVisibleClassName="focus-visible"
                    />
                    {(() => {
                      const open = Boolean(queryParams['global-settings'])
                      return (
                        <>
                          <ExpandingButton
                            // @ts-ignore ts-migrate(2322) FIXME: Type 'ForwardRefExoticComponent<LinkProps<UnknownF... Remove this comment to see the full error message
                            component={Link}
                            to={{
                              pathname: `${location.pathname}`,
                              search: `${queryString.stringify({
                                ...queryParams,
                                'global-settings': 'Settings',
                              })}`,
                            }}
                            className={`group-hover:opacity-100 opacity-25 relative py-3 hover:opacity-100 focus-visible:opacity-100 transition-opacity`}
                            Icon={SettingsIcon}
                            iconPosition="start"
                            expandedText="Settings"
                            unexpandedText="Settings"
                            expanded={navOpen}
                            focusVisibleClassName="focus-visible"
                          />
                          <Drawer
                            anchor="left"
                            open={open}
                            onClose={() => {
                              delete queryParams['global-settings']
                              history.push(
                                `${location.pathname}?${queryString.stringify(
                                  queryParams
                                )}`
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

                    {(() => {
                      const open = Boolean(queryParams['global-notifications'])

                      return (
                        <>
                          <Box
                            color={hasUnseenNotifications ? 'warning.main' : ''}
                            className={
                              hasUnseenNotifications ? 'animate-wiggle' : ''
                            }
                          >
                            <ExpandingButton
                              // @ts-ignore ts-migrate(2322) FIXME: Type 'ForwardRefExoticComponent<LinkProps<UnknownF... Remove this comment to see the full error message
                              component={Link}
                              to={{
                                pathname: `${location.pathname}`,
                                search: `${queryString.stringify({
                                  ...queryParams,
                                  'global-notifications': 'Notifications',
                                })}`,
                              }}
                              className={`${
                                !hasUnseenNotifications ? 'opacity-25' : ''
                              } group-hover:opacity-100  relative py-3 hover:opacity-100 focus-visible:opacity-100 transition-opacity`}
                              iconPosition="start"
                              Icon={NotificationsIcon}
                              expandedText="Notifications"
                              unexpandedText="Notices"
                              expanded={navOpen}
                              focusVisibleClassName="focus-visible"
                            />
                          </Box>
                          <Drawer
                            anchor="left"
                            open={open}
                            onClose={() => {
                              delete queryParams['global-notifications']
                              history.push(
                                `${location.pathname}?${queryString.stringify(
                                  queryParams
                                )}`
                              )
                              notifications.setSeen()
                              userInstance.savePreferences()
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
                    {(() => {
                      const open = Boolean(queryParams['global-user'])
                      return (
                        <>
                          <ExpandingButton
                            // @ts-ignore ts-migrate(2322) FIXME: Type 'ForwardRefExoticComponent<LinkProps<UnknownF... Remove this comment to see the full error message
                            component={Link}
                            to={{
                              pathname: `${location.pathname}`,
                              search: `${queryString.stringify({
                                ...queryParams,
                                'global-user': 'User',
                              })}`,
                            }}
                            className={`group-hover:opacity-100 opacity-25 relative py-3 hover:opacity-100 focus-visible:opacity-100 transition-opacity`}
                            Icon={PersonIcon}
                            iconPosition="start"
                            expandedText={userInstance.getUserName()}
                            unexpandedText={userInstance.getUserName()}
                            dataId="user-profile"
                            expanded={navOpen}
                            focusVisibleClassName="focus-visible"
                          />
                          <Drawer
                            anchor="left"
                            open={open}
                            onClose={() => {
                              delete queryParams['global-user']
                              history.push(
                                `${location.pathname}?${queryString.stringify(
                                  queryParams
                                )}`
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
              </Paper>
            </Grid>
            {/**
             * So this is slightly annoying, but the grid won't properly resize without overflow hidden set.
             *
             * That makes handling padding / margins / spacing more complicated in our app, because with overflow hidden set
             * dropshadows on elements will get cut off.  So we have to let the contents instead dictate their padding, that way
             * their dropshadows can be seen.
             *
             * Folks will probably struggle a bit with it at first, but the css utilities actually make it pretty easy.
             * Just add pb-2 for the correct bottom spacing, pt-2 for correct top spacing, etc. etc.
             */}
            <Grid
              item
              className="w-full h-full relative z-0 flex-shrink-1 overflow-x-hidden" // do not remove this overflow hidden, see comment above for more
            >
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
