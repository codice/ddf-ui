import * as React from 'react'
import clsx from 'clsx'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'

import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'

import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import { Header } from './header'
import { Links } from './links'
import { Content } from './content'
import { useAppRootContext } from './app-root.pure'
import { InstanceRouteContextProvider } from './route'
import Grid from '@material-ui/core/Grid'
import { BannerHeader, BannerFooter } from '../banners/banners'

const drawerWidth = 240

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      flexGrow: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(0, 1),
      marginLeft: '16px',
      [theme.breakpoints.down('sm')]: {
        marginLeft: '8px',
      },
      ...theme.mixins.toolbar,
    },
    branding: {
      transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  })
)

export const Shell = () => {
  const { platformConfig, adminConfig, theme } = useAppRootContext()
  let previousData = localStorage.getItem('kanri.shell.drawer')
  let defaultOpen = true
  if (previousData !== null) {
    defaultOpen = previousData === 'true'
  }
  const classes = useStyles()
  const [open, setOpen] = React.useState(defaultOpen)

  function handleDrawerOpen() {
    localStorage.setItem('kanri.shell.drawer', 'true')
    setOpen(true)
  }

  function handleDrawerClose() {
    localStorage.setItem('kanri.shell.drawer', 'false')
    setOpen(false)
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="w-full flex-shrink-0 flex-grow-0">
        <BannerHeader />
      </div>

      <div className="flex flex-col flex-grow overflow-hidden">
        <AppBar
          position="static"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar style={{ height: '64px' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(classes.menuButton, {
                [classes.hide]: open,
              })}
            >
              <MenuIcon />
            </IconButton>
            <Header />
          </Toolbar>
        </AppBar>

        <div className="flex flex-grow overflow-hidden">
          <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              }),
            }}
            open={open}
          >
            <div className={classes.toolbar}>
              <Grid container direction="column">
                <Grid item>
                  <Typography>{adminConfig.branding}</Typography>
                </Grid>
                <Grid item>
                  <Typography>Admin Console</Typography>
                </Grid>
              </Grid>

              <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <InstanceRouteContextProvider>
              <Links open={open} />
            </InstanceRouteContextProvider>

            <Divider />
            {platformConfig.productImage ? (
              <div style={{ marginTop: 'auto', padding: '10px' }}>
                <a href="../../">
                  <img
                    className={classes.branding}
                    style={{
                      width: open ? `${drawerWidth - 20}px` : '52px',
                      filter:
                        theme === 'dark'
                          ? 'invert(100%) hue-rotate(180deg)'
                          : '',
                    }}
                    src={`data:image/png;base64,${platformConfig.productImage}`}
                  />
                </a>
              </div>
            ) : null}
          </Drawer>

          <main
            className={`flex-shrink flex-grow overflow-y-auto w-full h-full overflow-x-hidden`}
          >
            <Content />
          </main>
        </div>
      </div>

      <div className="w-full flex-shrink-0 flex-grow-0">
        <BannerFooter />
      </div>
    </div>
  )
}
