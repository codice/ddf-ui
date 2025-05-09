import * as React from 'react'
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  RouteProps,
  LinkProps,
} from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import $ from 'jquery'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ExpandingButton from '../button/expanding-button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import Drawer from '@mui/material/Drawer'
import queryString from 'query-string'
import { Link } from '../link/link'
import { Memo } from '../memo/memo'
import HelpIcon from '@mui/icons-material/Help'
import NotificationsIcon from '@mui/icons-material/Notifications'
import userInstance from '../singletons/user-instance'
import notifications from '../singletons/user-notifications'
import SystemUsageModal from '../system-usage/system-usage'

import UserView, { RoleDisplay } from '../../react-component/user/user'
import UserSettings, {
  SettingsComponentType,
} from '../../react-component/user-settings/user-settings'
import { PermissiveComponentType } from '../../typescript'
import scrollIntoView from 'scroll-into-view-if-needed'
import { Elevations } from '../theme/theme'
import {
  useBackbone,
  useListenTo,
} from '../selection-checkbox/useBackbone.hook'
import {
  AsyncTasks,
  useRenderOnAsyncTasksAddOrRemove,
} from '../../js/model/AsyncTask/async-task'
import useSnack from '../hooks/useSnack'
import LinearProgress from '@mui/material/LinearProgress'
import { BaseProps } from '../button/expanding-button'
import { useDialogState } from '../hooks/useDialogState'
import SessionTimeout from '../../react-component/session-timeout'
import { AjaxErrorHandling } from './ajax-error-handling'
import { WreqrSnacks } from './wreqr-snacks'
import sessionTimeoutModel from '../singletons/session-timeout'
import Extensions from '../../extension-points'
import { useConfiguration } from '../../js/model/Startup/configuration.hooks'
import { SuspenseWrapper } from './suspense'
import { SyncReactRouterContextToVariables } from './react-router.patches'
export const handleBase64EncodedImages = (url: string) => {
  if (url && url.startsWith('data:')) {
    return url
  }
  return `data:image/png;base64,${url}`
}
type ForNavButtonType = Omit<BaseProps, 'expanded'> &
  Required<Pick<BaseProps, 'dataId'>>

type CustomRouteProps = Omit<RouteProps, 'element'>

export type RouteShownInNavType = {
  routeProps: CustomRouteProps
  linkProps: LinkProps
  showInNav: true
  navButtonProps: ForNavButtonType
}
export type RouteNotShownInNavType = {
  routeProps: CustomRouteProps
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
    Array.isArray(routeInfo.routeProps.path)
  ) {
    return routeInfo.routeProps.path.some(
      (possibleRoute: string) =>
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
  const navigate = useNavigate()
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
                  navigate(`/search/${task.lazyResult.plain.id}`)
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
          className="w-full absolute h-2 left-0 top-0 -mt-2"
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
  const { getHelpUrl } = useConfiguration()
  const location = useLocation()
  const queryParams = queryString.parse(location.search)
  const { navOpen } = useNavContextProvider()
  return (
    <ExpandingButton
      component={getHelpUrl() ? 'a' : (Link as unknown as any)}
      href={getHelpUrl()}
      to={
        getHelpUrl()
          ? getHelpUrl()
          : {
              pathname: `${location.pathname}`,
              search: `${queryString.stringify({
                ...queryParams,
                'global-help': 'Help',
              })}`,
            }
      }
      target={getHelpUrl() ? '_blank' : undefined}
      className={`group-hover:opacity-100 opacity-25  hover:opacity-100 focus-visible:opacity-100 transition-opacity`}
      Icon={HelpIcon}
      expandedLabel="Help"
      unexpandedLabel=""
      dataId={sidebarDataIdTag('help')}
      expanded={navOpen}
      focusVisibleClassName="focus-visible"
    />
  )
}

function DrawerWrapperComponent({ children }: { children: React.ReactNode }) {
  return (
    <SuspenseWrapper>
      <div className="w-full h-full flex flex-col flex-nowrap overflow-hidden">
        {Extensions.includeNavigationButtons ? (
          <div className="w-full shrink-0 grow-0 overflow-hidden">
            <SideBarNavigationButtons showText />
            <Divider />
          </div>
        ) : null}
        <div className="w-full h-full grow shrink overflow-auto">
          {children}
        </div>
      </div>
    </SuspenseWrapper>
  )
}

const SettingsButton = () => {
  const { SettingsComponents } = useTopLevelAppContext()
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = queryString.parse(location.search)
  const open = Boolean(queryParams['global-settings'])
  const { navOpen } = useNavContextProvider()
  return (
    <>
      <ExpandingButton
        component={Link as any}
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
        unexpandedLabel=""
        dataId={sidebarDataIdTag('settings')}
        expanded={navOpen}
        focusVisibleClassName="focus-visible"
      />
      <Drawer
        anchor="left"
        open={open}
        onClose={() => {
          delete queryParams['global-settings']
          navigate(`${location.pathname}?${queryString.stringify(queryParams)}`)
        }}
        PaperProps={{
          className: 'min-w-120 max-w-4/5 ',
        }}
      >
        <DrawerWrapperComponent>
          <UserSettings SettingsComponents={SettingsComponents} />
        </DrawerWrapperComponent>
      </Drawer>
    </>
  )
}
const NotificationsButton = () => {
  const hasUnseenNotifications = useIndicateHasUnseenNotifications()
  const { NotificationsComponent } = useTopLevelAppContext()
  const location = useLocation()
  const navigate = useNavigate()
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
          component={Link as any}
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
          unexpandedLabel=""
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
          navigate(`${location.pathname}?${queryString.stringify(queryParams)}`)
          notifications.setSeen()
          userInstance.savePreferences()
        }}
        PaperProps={{
          className: 'min-w-120 max-w-4/5 ',
        }}
      >
        <DrawerWrapperComponent>
          <NotificationsComponent />
        </DrawerWrapperComponent>
      </Drawer>
    </>
  )
}
const UserButton = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = queryString.parse(location.search)
  const open = Boolean(queryParams['global-user'])
  const { navOpen } = useNavContextProvider()

  const getLabel = () => {
    return (
      <div className="w-full">
        <div className="w-full truncate">{userInstance.getUserName()}</div>
        <div className="text-xs truncate w-full">
          <RoleDisplay />
        </div>
      </div>
    )
  }

  return (
    <>
      <ExpandingButton
        component={Link as any}
        to={{
          pathname: `${location.pathname}`,
          search: `${queryString.stringify({
            ...queryParams,
            'global-user': 'User',
          })}`,
        }}
        className={`group-hover:opacity-100 opacity-25 relative hover:opacity-100 focus-visible:opacity-100 transition-opacity`}
        Icon={PersonIcon}
        expandedLabel={getLabel()}
        unexpandedLabel={getLabel()}
        dataId={sidebarDataIdTag('user-profile')}
        expanded={navOpen}
        focusVisibleClassName="focus-visible"
      />
      <Drawer
        anchor="left"
        open={open}
        onClose={() => {
          delete queryParams['global-user']
          navigate(`${location.pathname}?${queryString.stringify(queryParams)}`)
        }}
        PaperProps={{
          className: 'min-w-120 max-w-4/5 ',
        }}
      >
        <DrawerWrapperComponent>
          <UserView />
        </DrawerWrapperComponent>
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
      component={Link as any}
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
    <div
      className="overflow-auto p-0 shrink-0 scrollbars-min"
      style={{ maxHeight: `calc(100% - ${7 * 4}rem)` }}
    >
      {RouteInformation.filter((routeInfo) => routeInfo.showInNav).map(
        (routeInfo: RouteShownInNavType) => {
          return (
            <RouteButton
              routeInfo={routeInfo}
              key={routeInfo.routeProps.path?.toString()}
            />
          )
        }
      )}
      {<Extensions.extraRoutes />}
    </div>
  )
}
const SideBarNavigationButtons = ({
  showText = false,
}: { showText?: boolean } = {}) => {
  const navigate = useNavigate()
  const { navOpen } = useNavContextProvider()
  const showExpandedText = navOpen || showText
  return (
    <>
      <div className="w-full p-2 shrink-0">
        <div className="w-full h-full overflow-hidden flex items-center flex-nowrap">
          <div className="mr-auto">
            <Button onClick={() => navigate(-1)}>
              <ArrowBackIcon fontSize="small" />
              {showExpandedText && 'Back'}
            </Button>
          </div>
          <div className="ml-auto">
            <Button onClick={() => navigate(1)}>
              {showExpandedText && 'Forward'}
              <ArrowForwardIcon fontSize="small" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

const SideBarToggleButton = () => {
  const { navOpen, setNavOpen } = useNavContextProvider()
  const { getTopLeftLogoSrc, getCustomBranding, getProduct, getMenuIconSrc } =
    useConfiguration()
  return (
    <>
      <div className="w-full h-16 shrink-0">
        {navOpen ? (
          <>
            <div className="w-full h-full overflow-hidden flex items-center flex-nowrap">
              <div className="pl-3 py-1 pr-1 w-full relative h-full">
                {getTopLeftLogoSrc() ? (
                  <img
                    className="max-h-full max-w-full absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 p-4"
                    src={handleBase64EncodedImages(getTopLeftLogoSrc())}
                  />
                ) : (
                  <div className="pl-3 flex flex-col justify-center">
                    <div>
                      <Typography>{getCustomBranding()}</Typography>
                    </div>
                    <div>
                      <Typography>{getProduct()}</Typography>
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-auto">
                <IconButton
                  className="h-auto"
                  onClick={() => setNavOpen(false)}
                  size="large"
                >
                  <ChevronLeftIcon />
                </IconButton>
              </div>
            </div>
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
            {getMenuIconSrc() ? (
              <>
                <img
                  src={handleBase64EncodedImages(getMenuIconSrc())}
                  className="max-h-16 max-w-full"
                />
              </>
            ) : (
              <MenuIcon />
            )}
          </Button>
        )}
      </div>
    </>
  )
}
const SideBar = () => {
  const { navOpen } = useNavContextProvider()
  return (
    <div
      className={`${
        navOpen ? 'w-64' : 'w-20'
      } transition-all duration-200 ease-in-out relative z-10 mr-2 shrink-0 pb-2 pt-2 pl-2 group`}
      onMouseLeave={() => {
        scrollCurrentRouteIntoView()
      }}
    >
      <Paper elevation={Elevations.navbar} className="h-full">
        <div className="h-full w-full flex flex-col flex-nowrap overflow-hidden">
          {Extensions.includeNavigationButtons && (
            <>
              <SideBarNavigationButtons />
              <Divider />
            </>
          )}
          <SideBarToggleButton />
          <Divider />
          <SideBarRoutes />
          <Divider />
          <SideBarBackground />
          <Divider />
          <div className="mt-auto overflow-hidden w-full shrink-0 grow-0">
            {Extensions.extraSidebarButtons && (
              <Extensions.extraSidebarButtons />
            )}
            <HelpButton />
            <SettingsButton />
            <NotificationsButton />
            <UserButton />
          </div>
        </div>
      </Paper>
    </div>
  )
}
const Header = () => {
  const { getPlatformBackground, getPlatformColor, getPlatformHeader } =
    useConfiguration()
  return (
    <div className="w-full">
      {getPlatformHeader() ? (
        <Typography
          align="center"
          style={{
            background: getPlatformBackground(),
            color: getPlatformColor(),
          }}
        >
          {getPlatformHeader()}
        </Typography>
      ) : null}
    </div>
  )
}
const Footer = () => {
  const { getPlatformBackground, getPlatformColor, getPlatformFooter } =
    useConfiguration()
  return (
    <div className="w-full">
      {getPlatformFooter() ? (
        <Typography
          align="center"
          style={{
            background: getPlatformBackground(),
            color: getPlatformColor(),
          }}
        >
          {getPlatformFooter()}
        </Typography>
      ) : null}
    </div>
  )
}
const SideBarBackground = () => {
  const { getBottomLeftBackgroundSrc } = useConfiguration()
  return (
    <div className="relative overflow-hidden shrink-1 h-full min-w-full">
      {getBottomLeftBackgroundSrc() ? (
        <img
          className={`group-hover:opacity-100 opacity-50 duration-200 ease-in-out transition-all w-auto h-full absolute max-w-none m-auto min-h-80`}
          src={handleBase64EncodedImages(getBottomLeftBackgroundSrc())}
        />
      ) : null}
    </div>
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
    <div className="w-full h-full relative z-0 shrink-1 overflow-x-hidden">
      <Memo>
        <Routes>
          {RouteInformation.map((routeInfo: RouteNotShownInNavType) => {
            return (
              <Route
                key={routeInfo.routeProps.path?.toString() || Math.random()}
                path={routeInfo.routeProps.path}
                Component={() => {
                  // due to how Components work in v6 react router, we'll want to memo these to avoid unnecessary component rerenders
                  const Component = routeInfo.routeProps.Component
                  if (!Component) {
                    return null
                  }
                  return (
                    <Memo>
                      <Component />
                    </Memo>
                  )
                }}
              />
            )
          })}
        </Routes>
      </Memo>
    </div>
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
const ScrollCurrentRouteIntoViewOnLocationChange = () => {
  const location = useLocation()
  React.useEffect(() => {
    scrollCurrentRouteIntoView()
  }, [location])
  return <></>
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

// @ts-ignore
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
const SessionTimeoutComponent = () => {
  const sessionTimeoutDialogState = useDialogState()
  useListenTo(sessionTimeoutModel, 'change:showPrompt', () => {
    if (sessionTimeoutModel.get('showPrompt')) {
      sessionTimeoutDialogState.handleClick()
    } else {
      sessionTimeoutDialogState.handleClose()
    }
  })
  return (
    <sessionTimeoutDialogState.MuiDialogComponents.Dialog
      {...sessionTimeoutDialogState.MuiDialogProps}
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          return
        }
        sessionTimeoutDialogState.MuiDialogProps.onClose(event, reason)
      }}
    >
      <SessionTimeout />
    </sessionTimeoutDialogState.MuiDialogComponents.Dialog>
  )
}

const App = ({
  RouteInformation,
  NotificationsComponent,
  SettingsComponents,
}: AppPropsType) => {
  const { navOpen, setNavOpen } = useNavOpen()
  return (
    <TopLevelAppContext.Provider
      value={{ RouteInformation, NotificationsComponent, SettingsComponents }}
    >
      <NavContextProvider.Provider value={{ navOpen, setNavOpen }}>
        <SyncReactRouterContextToVariables />
        <ScrollCurrentRouteIntoViewOnLocationChange />
        <CssBaseline />
        <SystemUsageModal />
        <SessionTimeoutComponent />
        <AjaxErrorHandling />
        <WreqrSnacks />
        <Header />
        <Extensions.extraHeader />
        <div className="w-full h-full relative overflow-hidden">
          <AsyncTasksComponent />
          <div className="w-full h-full flex flex-row flex-nowrap items-stretch">
            <SideBar />
            <RouteContents />
          </div>
        </div>
        <Extensions.extraFooter />
        <Footer />
      </NavContextProvider.Provider>
    </TopLevelAppContext.Provider>
  )
}
export default App
