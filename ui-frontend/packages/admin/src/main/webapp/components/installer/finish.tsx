import * as React from 'react'
import { Step } from './step'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useRouteContext, useAppRootContext } from '../app-root/app-root.pure'
import { COMMANDS } from '../fetch/fetch'

const INSTALL_URL =
  '/admin/jolokia/exec/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/installFeature(java.lang.String)/'
const UNINSTALL_URL =
  '/admin/jolokia/exec/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/uninstallFeature(java.lang.String)/'
const RESTART_URL =
  '/admin/jolokia/exec/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/restart()/'

const UNINSTALL_FEATURE = 'admin-modules-installer'
const INSTALL_FEATURE = 'admin-post-install-modules'

type ModeType = 'normal' | 'restart now' | 'restart later'

export const Finish = () => {
  const { fetchApplications, fetchModules } = useAppRootContext()
  const { routeProps } = useRouteContext()
  const [mode, setMode] = React.useState('normal' as ModeType)
  const fetchAndRedirect = async () => {
    await fetchApplications()
    await fetchModules()
    routeProps.history.push('/')
  }
  React.useEffect(() => {
    if (mode === 'restart now' || mode === 'restart later') {
      COMMANDS.FETCH(UNINSTALL_URL + UNINSTALL_FEATURE).then(() => {
        return COMMANDS.FETCH(INSTALL_URL + INSTALL_FEATURE).then(() => {
          if (mode === 'restart later') {
            fetchAndRedirect()
          } else if (mode === 'restart now') {
            COMMANDS.FETCH(RESTART_URL).then(() => {
              setTimeout(() => {
                routeProps.history.push('/')
                window.location.reload() // we have to sign in again unfortunately
              }, 60000)
            })
          }
        })
      })
    }
  }, [mode])
  switch (mode) {
    case 'restart later':
      return (
        <Step
          content={
            <>
              <Typography>Redirecting</Typography>
              <CircularProgress />
            </>
          }
        />
      )
    case 'restart now':
      return (
        <Step
          content={
            <>
              <Typography>Restarting</Typography>
              <CircularProgress />
            </>
          }
        />
      )
    case 'normal':
      return (
        <Step
          content={
            <Grid container direction="column" spacing={3}>
              <Grid item>
                <Typography variant="h4">Finished</Typography>
              </Grid>
              <Grid item>
                <Typography variant="h5">
                  Congratulations! Your system is now configured.
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h5">
                  After installation is complete there are additional
                  configurations that can be made to change hostname, ports and
                  certificates.
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h5">
                  Global system properties can be configured in the
                  INSTALL_HOME/etc/custom.system.properties file and
                  certificates for the host can be added to the
                  serverKeystore/serverTruststore in the
                  INSTALL_HOME/etc/keystores directory.
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h5">
                  A system restart is required each time these files are
                  modified in order for the changes to take effect.
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h5">
                  Click the 'Restart Now' button below to conclude the setup and
                  restart the system.{' '}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h5">
                  Click the 'Restart Later' button below to avoid restarting. A
                  manual restart will be required to use the system.
                </Typography>
              </Grid>
            </Grid>
          }
          footer={
            <Grid container>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => {
                    setMode('restart now')
                  }}
                >
                  Restart Now
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    setMode('restart later')
                  }}
                >
                  Restart Later
                </Button>
              </Grid>
            </Grid>
          }
        />
      )
    default:
      return (
        <Step
          content={<Typography>Unknown Mode</Typography>}
          footer={
            <Grid container>
              <Grid item>
                <Button variant="contained" onClick={() => {}}>
                  Restart Now
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {}}
                  disabled
                >
                  Restart Later
                </Button>
              </Grid>
            </Grid>
          }
        />
      )
  }
}
