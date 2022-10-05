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
const userInstance = require('../singletons/user-instance.js')
const notifications = require('../singletons/user-notifications.js')
import SystemUsageModal from '../system-usage/system-usage'

import UserView, {
  RoleDisplay,
  RoleIcon,
  SmallRoleDisplay,
} from '../../react-component/user/user'
import UserSettings, {
  SettingsComponentType,
} from '../../react-component/user-settings/user-settings'
const wreqr = require('../../js/wreqr.js')
import { GlobalStyles } from './global-styles'
import CancelDrawing from './cancel-drawing'
import { PermissiveComponentType } from '../../typescript'
import scrollIntoView from 'scroll-into-view-if-needed'
import { Elevations } from '../theme/theme'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import {
  AsyncTasks,
  useRenderOnAsyncTasksAddOrRemove,
} from '../../js/model/AsyncTask/async-task'
import useSnack from '../hooks/useSnack'
import LinearProgress from '@material-ui/core/LinearProgress'
import { BaseProps } from '../button/expanding-button'
export const handleBase64EncodedImages = (url: string) => {
  if (url && url.startsWith('data:')) {
    return url
  }
  return `data:image/png;base64,${url}`
}

type ForNavButtonType = Omit<BaseProps, 'expanded'> &
  Required<Pick<BaseProps, 'dataId'>>

export type RouteShownInNavType = {
  routeProps: RouteProps
  linkProps: LinkProps
  showInNav: true
  navButtonProps: ForNavButtonType
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

function sidebarDataIdTag(name: string) {
  return `sidebar-${name}-button`
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
      setTimeout(() => {
        loadingElement.remove()
      }, 500)
    }
  }, [])
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

const AsyncTasksComponent = () => {
  const [showBar, setShowBar] = React.useState(false)
  useRenderOnAsyncTasksAddOrRemove()
  const addSnack = useSnack()
  const history = useHistory()
  React.useEffect(() => {
    let timeoutid = undefined as number | undefined
    timeoutid = window.setTimeout(() => {
      setShowBar(false)
    }, 1000)
    return () => {
      clearTimeout(timeoutid)
    }
  }, [showBar])
  React.useEffect(() => {
    let timeoutid = undefined as number | undefined
    if (AsyncTasks.hasShowableTasks()) {
      setShowBar(true)
      window.onbeforeunload = () => {
        setShowBar(true)
        return `Are you sure you want to leave? ${AsyncTasks.list.length} tasks are still running.`
      }
    } else {
      setShowBar(false)
    }
    timeoutid = window.setTimeout(() => {
      setShowBar(false)
    }, 1000)
    return () => {
      clearTimeout(timeoutid)
      window.onbeforeunload = null
    }
  }, [AsyncTasks.list.length])
  React.useEffect(() => {
    const unsubs = AsyncTasks.list.map((task) => {
      return task.subscribeTo({
        subscribableThing: 'update',
        callback: () => {
          AsyncTasks.remove(task)
          if (AsyncTasks.isRestoreTask(task)) {
            addSnack(
              `Restore of ${task.lazyResult.plain.metacard.properties.title} complete.`,
              {
                timeout: 5000,
                closeable: true,
                alertProps: {
                  action: (
                    <Button
                      component={Link}
                      to={`/search/${task.lazyResult.plain.metacard.properties['metacard.deleted.id']}`}
                    >
                      Go to
                    </Button>
                  ),
                },
              }
            )
          }
          if (AsyncTasks.isDeleteTask(task)) {
            addSnack(
              `Delete of ${task.lazyResult.plain.metacard.properties.title} complete.`,
              {
                undo: () => {
                  history.push({
                    pathname: `/search/${task.lazyResult.plain.id}`,
                    search: '',
                  })
                  AsyncTasks.restore({ lazyResult: task.lazyResult })
                },
              }
            )
          }
          if (AsyncTasks.isCreateSearchTask(task)) {
            addSnack(`Creation of ${task.data.title} complete.`)
          }
        },
      })
    })
    return () => {
      unsubs.forEach((unsub) => {
        unsub()
      })
    }
  })
  if (AsyncTasks.list.length > 0) {
    return (
      <div
        className={`${
          showBar ? 'translate-y-0' : 'translate-y-full'
        } absolute left-0 bottom-0 w-full bg-black bg-opacity-75 h-16 z-50 transition transform ease-in-out duration-500 hover:translate-y-0`}
      >
        <LinearProgress
          className="w-full absolute h-2 absolute left-0 top-0 -mt-2"
          variant="indeterminate"
        />
        <div className="flex flex-col overflow-auto h-full w-full items-center justify-center text-white">
          {AsyncTasks.list.map((asyncTask) => {
            if (AsyncTasks.isRestoreTask(asyncTask)) {
              return (
                <div className="bg-black p-2">
                  Restoring '
                  {asyncTask.lazyResult.plain.metacard.properties.title}'
                </div>
              )
            }
            if (AsyncTasks.isDeleteTask(asyncTask)) {
              return (
                <div className="bg-black p-2">
                  Deleting '
                  {asyncTask.lazyResult.plain.metacard.properties.title}'
                </div>
              )
            }
            if (AsyncTasks.isCreateSearchTask(asyncTask)) {
              return (
                <div className="bg-black p-2">
                  Creating '{asyncTask.data.title}'
                </div>
              )
            }
            if (AsyncTasks.isSaveSearchTask(asyncTask)) {
              return (
                <div className="bg-black p-2">
                  Saving '{asyncTask.data.title}'
                </div>
              )
            }
            if (AsyncTasks.isCreateTask(asyncTask)) {
              return (
                <div className="bg-black p-2">
                  Creating '{asyncTask.data.title}'
                </div>
              )
            }
            if (AsyncTasks.isSaveTask(asyncTask)) {
              return (
                <div className="bg-black p-2">
                  Saving '{asyncTask.data.title}'
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    )
  }
  return null
}

/** The song and dance around 'a' vs Link has to do with react router not supporting these outside links */
const HelpButton = () => {
  const location = useLocation()
  const queryParams = queryString.parse(location.search)
  const { navOpen } = useNavContextProvider()
  return (
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
      expandedLabel="Help"
      dataId={sidebarDataIdTag('help')}
      expanded={navOpen}
      focusVisibleClassName="focus-visible"
    />
  )
}

const SettingsButton = () => {
  const { SettingsComponents } = useTopLevelAppContext()
  const location = useLocation()
  const history = useHistory()
  const queryParams = queryString.parse(location.search)
  const open = Boolean(queryParams['global-settings'])
  const { navOpen } = useNavContextProvider()

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
        className={`group-hover:opacity-100 opacity-25 relative hover:opacity-100 focus-visible:opacity-100 transition-opacity`}
        Icon={SettingsIcon}
        expandedLabel="Settings"
        dataId={sidebarDataIdTag('settings')}
        expanded={navOpen}
        focusVisibleClassName="focus-visible"
      />
      <Drawer
        anchor="left"
        open={open}
        onClose={() => {
          delete queryParams['global-settings']
          history.push(
            `${location.pathname}?${queryString.stringify(queryParams)}`
          )
        }}
        PaperProps={{
          className: 'min-w-120 max-w-4/5 ',
        }}
      >
        <UserSettings SettingsComponents={SettingsComponents} />
      </Drawer>
    </>
  )
}

const NotificationsButton = () => {
  const hasUnseenNotifications = useIndicateHasUnseenNotifications()
  const { NotificationsComponent } = useTopLevelAppContext()
  const location = useLocation()
  const history = useHistory()
  const queryParams = queryString.parse(location.search)
  const open = Boolean(queryParams['global-notifications'])
  const { navOpen } = useNavContextProvider()

  return (
    <>
      <div
        className={
          hasUnseenNotifications ? 'animate-wiggle Mui-text-warning' : ''
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
          } group-hover:opacity-100  relative hover:opacity-100 focus-visible:opacity-100 transition-opacity`}
          Icon={NotificationsIcon}
          expandedLabel="Notifications"
          dataId={sidebarDataIdTag('notifications')}
          expanded={navOpen}
          focusVisibleClassName="focus-visible"
          orientation="vertical"
        />
      </div>
      <Drawer
        anchor="left"
        open={open}
        onClose={() => {
          delete queryParams['global-notifications']
          history.push(
            `${location.pathname}?${queryString.stringify(queryParams)}`
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
}

const UserButton = () => {
  const location = useLocation()
  const history = useHistory()
  const queryParams = queryString.parse(location.search)
  const open = Boolean(queryParams['global-user'])
  const { navOpen } = useNavContextProvider()
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
        className={`group-hover:opacity-100 opacity-25 relative hover:opacity-100 focus-visible:opacity-100 transition-opacity`}
        Icon={RoleIcon}
        expandedLabel={
          <div className="w-full">
            <div className="truncate w-full">{userInstance.getUserName()}</div>
            <div className="text-base truncate w-full">
              <RoleDisplay />
            </div>
          </div>
        }
        unexpandedLabel={
          <div className="w-full">
            <div className="w-full truncate">{userInstance.getUserName()}</div>
            <div className="text-xs truncate w-full">
              <SmallRoleDisplay />
            </div>
          </div>
        }
        dataId={sidebarDataIdTag('user-profile')}
        expanded={navOpen}
        focusVisibleClassName="focus-visible"
      />
      <Drawer
        anchor="left"
        open={open}
        onClose={() => {
          delete queryParams['global-user']
          history.push(
            `${location.pathname}?${queryString.stringify(queryParams)}`
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
}

const RouteButton = ({ routeInfo }: { routeInfo: RouteShownInNavType }) => {
  const location = useLocation()
  const { navOpen } = useNavContextProvider()
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
      expanded={navOpen}
      {...routeInfo.navButtonProps}
      focusVisibleClassName="focus-visible"
      dataId={sidebarDataIdTag(routeInfo.navButtonProps.dataId)}
      {...(isSelected
        ? {
            ['data-currentroute']: true,
          }
        : {})}
    />
  )
}

const SideBarRoutes = () => {
  const { RouteInformation } = useTopLevelAppContext()
  return (
    <Grid
      item
      className="overflow-auto p-0 flex-shrink-0 scrollbars-min"
      style={{
        maxHeight: `calc(100% - ${7 * 4}rem)`, //
      }}
    >
      {RouteInformation.filter((routeInfo) => routeInfo.showInNav).map(
        (routeInfo: RouteShownInNavType) => {
          return <RouteButton routeInfo={routeInfo} />
        }
      )}
    </Grid>
  )
}

const SideBarToggleButton = () => {
  const { navOpen, setNavOpen } = useNavContextProvider()
  return (
    <>
      <Grid item className="w-full h-16 flex-shrink-0">
        {navOpen ? (
          <>
            <Grid
              container
              wrap="nowrap"
              alignItems="center"
              className="w-full h-full overflow-hidden"
            >
              <Grid item className="pl-3 py-1 pr-1 w-full relative h-full">
                {properties.topLeftLogoSrc ? (
                  <img
                    className="max-h-full max-w-full absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 p-4"
                    src={handleBase64EncodedImages(properties.topLeftLogoSrc)}
                  />
                ) : (
                  <Grid
                    container
                    direction="column"
                    className="pl-3"
                    justify="center"
                  >
                    <Grid item>
                      <Typography>{properties.customBranding}</Typography>
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
                  onClick={() => {
                    setNavOpen(false)
                  }}
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
            onClick={() => {
              setNavOpen(true)
            }}
            className="w-full h-full p-2"
          >
            {properties.menuIconSrc ? (
              <>
                <img
                  src={handleBase64EncodedImages(properties.menuIconSrc)}
                  className="max-h-16 max-w-full"
                />
              </>
            ) : (
              <MenuIcon />
            )}
          </Button>
        )}
      </Grid>
    </>
  )
}

const SideBar = () => {
  const { navOpen } = useNavContextProvider()
  return (
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
          <SideBarToggleButton />
          <Divider />
          <SideBarRoutes />
          <Divider />
          <SideBarBackground />
          <Divider />
          <Grid
            item
            className="mt-auto overflow-hidden w-full flex-shrink-0 flex-grow-0"
          >
            <HelpButton />
            <SettingsButton />

            <NotificationsButton />
            <UserButton />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
}

const Header = () => {
  return (
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
  )
}

const Footer = () => {
  return (
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
  )
}

const SideBarBackground = () => {
  return (
    <Grid
      item
      className="relative overflow-hidden flex-shrink-1 h-full min-w-full"
    >
      {properties.bottomLeftBackgroundSrc ? (
        <img
          className={`group-hover:opacity-100 opacity-50 duration-200 ease-in-out transition-all w-auto h-full absolute max-w-none m-auto min-h-80`}
          src={handleBase64EncodedImages(properties.bottomLeftBackgroundSrc)}
        />
      ) : null}
    </Grid>
  )
}

const RouteContents = () => {
  const { RouteInformation } = useTopLevelAppContext()
  /**
   * So this is slightly annoying, but the grid won't properly resize without overflow hidden set.
   *
   * That makes handling padding / margins / spacing more complicated in our app, because with overflow hidden set
   * dropshadows on elements will get cut off.  So we have to let the contents instead dictate their padding, that way
   * their dropshadows can be seen.
   *
   * Folks will probably struggle a bit with it at first, but the css utilities actually make it pretty easy.
   * Just add pb-2 for the correct bottom spacing, pt-2 for correct top spacing, etc. etc.
   */
  return (
    <Grid
      item
      className="w-full h-full relative z-0 flex-shrink-1 overflow-x-hidden" // do not remove this overflow hidden, see comment above for more
    >
      <Memo>
        <Switch>
          {RouteInformation.map((routeInfo: RouteNotShownInNavType) => {
            return (
              <Route
                key={
                  routeInfo.routeProps.path
                    ? routeInfo.routeProps.path.toString()
                    : Math.random()
                }
                {...routeInfo.routeProps}
              />
            )
          })}
        </Switch>
      </Memo>
    </Grid>
  )
}

const NavContextProvider = React.createContext({
  setNavOpen: (_navOpen: boolean) => {},
  navOpen: false,
})

export const useNavContextProvider = () => {
  const navContext = React.useContext(NavContextProvider)
  return navContext
}

/**
 * Keep the current route visible to the user since it's useful info.
 * This also ensures it's visible upon first load of the page.
 */
const useScrollCurrentRouteIntoViewOnLocationChange = () => {
  const location = useLocation()
  React.useEffect(() => {
    scrollCurrentRouteIntoView()
  }, [location])
}

const useIndicateHasUnseenNotifications = () => {
  const { listenTo } = useBackbone()
  const [hasUnseenNotifications, setHasUnseenNotifications] = React.useState(
    notifications.hasUnseen() as boolean
  )
  React.useEffect(() => {
    listenTo(notifications, 'change add remove reset update', () => {
      setHasUnseenNotifications(notifications.hasUnseen() as boolean)
    })
  }, [])
  return hasUnseenNotifications
}

const useBackboneRouteReactRouterCompatibility = () => {
  const { listenTo } = useBackbone()
  const history = useHistory()

  React.useEffect(() => {
    listenTo(wreqr.vent, 'router:navigate', ({ fragment }: any) => {
      history.push(`/${fragment}`)
    })
  }, [])
}

const useFaviconBranding = () => {
  // todo favicon branding
  // $(window.document).ready(() => {
  //   window.document.title = properties.branding + ' ' + properties.product
  //   const favicon = document.querySelector('#favicon') as HTMLAnchorElement
  //   favicon.href = brandingInformation.topLeftLogoSrc
  //   favicon.remove()
  //   document.head.appendChild(favicon)
  // })
}

const useNavOpen = () => {
  let defaultOpen =
    localStorage.getItem('shell.drawer') === 'true' ? true : false
  const [navOpen, setNavOpen] = React.useState(defaultOpen)
  React.useEffect(() => {
    localStorage.setItem('shell.drawer', navOpen.toString())
    setTimeout(() => {
      $(window).resize() // needed for golden layout to resize
    }, 250)
  }, [navOpen])
  return {
    navOpen,
    setNavOpen,
  }
}

const TopLevelAppContext = React.createContext({
  RouteInformation: [],
  NotificationsComponent: () => null,
  SettingsComponents: {},
} as AppPropsType)

const useTopLevelAppContext = () => {
  const topLevelAppContext = React.useContext(TopLevelAppContext)
  return topLevelAppContext
}

const App = ({
  RouteInformation,
  NotificationsComponent,
  SettingsComponents,
}: AppPropsType) => {
  const { navOpen, setNavOpen } = useNavOpen()
  useFaviconBranding()
  useBackboneRouteReactRouterCompatibility()
  useScrollCurrentRouteIntoViewOnLocationChange()

  return (
    <TopLevelAppContext.Provider
      value={{ RouteInformation, NotificationsComponent, SettingsComponents }}
    >
      <NavContextProvider.Provider value={{ navOpen, setNavOpen }}>
        <div className="h-full w-full overflow-hidden Mui-bg-default">
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
            <Header />
            <Grid item className="w-full h-full relative overflow-hidden">
              <AsyncTasksComponent />
              <Grid
                container
                direction="row"
                wrap="nowrap"
                alignItems="stretch"
                className="w-full h-full"
              >
                <SideBar />
                <RouteContents />
              </Grid>
            </Grid>
            <Footer />
          </Grid>
        </div>
      </NavContextProvider.Provider>
    </TopLevelAppContext.Provider>
  )
}

export default hot(App)
