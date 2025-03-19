import * as React from 'react'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Badge from '@material-ui/core/Badge'
import Grid from '@material-ui/core/Grid'
import { Route, Switch, RouteComponentProps, Link } from 'react-router-dom'
import SettingsIcon from '@material-ui/icons/Settings'
import NotificationsIcon from '@material-ui/icons/Notifications'

import { Settings } from './settings'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import { Alerts } from '../alerts/alerts'
import { useAppRootContext } from './app-root.pure'
import Tune from '@material-ui/icons/Tune'
import { DeveloperSettings } from '../developer/settings'
import { Search } from './search'
import { ExtractedServicesProvider } from '../services/services.provider'
import { ControlledDrawer } from '../drawer/drawer'
import { setType } from '../../typescript/hooks'
const generateBreadcrumbs = ({ location }: RouteComponentProps) => {
  const crumbs = location.pathname
    .substring(1)
    .split('/')
    .map((bit: string) => bit.replace(/\//g, ''))
  return (
    <Breadcrumbs maxItems={2} itemsAfterCollapse={2} itemsBeforeCollapse={0}>
      {crumbs.map((crumb) => {
        const crumbPath = location.pathname.split(crumb)[0]
        const crumbUrl = `${crumbPath}${crumb}`
        return (
          <Link
            key={crumbUrl}
            to={crumbUrl}
            style={{
              maxWidth: '200px',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {decodeURIComponent(crumb)}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}

const NotificationsComp = ({ setOpen }: { setOpen: setType<boolean> }) => {
  const { alerts } = useAppRootContext()
  return (
    <Badge
      badgeContent={alerts?.length}
      color="secondary"
      variant="standard"
      overlap="circle"
    >
      <IconButton
        color="inherit"
        onClick={() => {
          setOpen(true)
        }}
      >
        <NotificationsIcon />
      </IconButton>
    </Badge>
  )
}

export const Header = () => {
  const { modules } = useAppRootContext()
  return (
    <Grid container alignItems="center" spacing={3} wrap="nowrap">
      <Grid item>
        <Switch>
          <Route component={generateBreadcrumbs} />
        </Switch>
      </Grid>
      <Grid item style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <Grid container alignItems="center" spacing={3}>
          {__ENV__ === 'mocks' ? (
            <Grid item>
              <ControlledDrawer
                drawerProps={{
                  variant: 'temporary',
                  anchor: 'right',
                  PaperProps: {
                    style: {
                      minWidth: '400px',
                      maxWidth: '70vw',
                      padding: '20px',
                      overflow: 'hidden',
                    },
                  },
                }}
                drawerChildren={() => {
                  return <DeveloperSettings />
                }}
              >
                {({ setOpen }) => {
                  return (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        setOpen(true)
                      }}
                    >
                      <Tune />
                      Developer
                    </Button>
                  )
                }}
              </ControlledDrawer>
            </Grid>
          ) : (
            ''
          )}
          {modules.length > 1 ? (
            <Grid item>
              <ExtractedServicesProvider>
                <Search />
              </ExtractedServicesProvider>
            </Grid>
          ) : null}
          <Grid item>
            <ControlledDrawer
              drawerProps={{
                variant: 'temporary',
                anchor: 'right',
                PaperProps: {
                  style: {
                    minWidth: '400px',
                    maxWidth: '70vw',
                    padding: '20px',
                    overflow: 'hidden',
                  },
                },
              }}
              drawerChildren={() => {
                return <Settings />
              }}
            >
              {({ setOpen }) => {
                return (
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      setOpen(true)
                    }}
                  >
                    <SettingsIcon />
                  </IconButton>
                )
              }}
            </ControlledDrawer>
          </Grid>
          <Grid item>
            <ControlledDrawer
              drawerProps={{
                variant: 'temporary',
                anchor: 'right',
                PaperProps: {
                  style: {
                    minWidth: '400px',
                    maxWidth: '70vw',
                    padding: '20px',
                    overflow: 'hidden',
                  },
                },
              }}
              drawerChildren={() => {
                return <Alerts />
              }}
            >
              {({ setOpen }) => {
                return <NotificationsComp setOpen={setOpen} />
              }}
            </ControlledDrawer>
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                window.location.href = '/logout?service=' + window.location.href
              }}
              variant="text"
              color="inherit"
            >
              Log out
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
