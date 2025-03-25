import * as React from 'react'
import { COMMANDS } from '../fetch/fetch'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { useAppRootContext } from '../app-root/app-root.pure'
import Button from '@material-ui/core/Button'
import CloseIcon from '@material-ui/icons/Close'

const ALERTS_DISMISS_URL =
  '/admin/jolokia/exec/org.codice.ddf.ui.admin.api:type=AdminAlertMBean/dismissAlert'

const createPayload = (alertId: string) => {
  return {
    type: 'EXEC',
    mbean: 'org.codice.ddf.ui.admin.api:type=AdminAlertMBean',
    operation: 'dismissAlert',
    arguments: [alertId],
  }
}

export const Alerts = () => {
  const { alerts, fetchAlerts } = useAppRootContext()
  const [loading, setLoading] = React.useState(false)
  return (
    <>
      <Typography variant="h4" align="center" style={{ marginBottom: '20px' }}>
        Alerts
      </Typography>
      <Grid
        container
        direction="column"
        wrap="nowrap"
        spacing={3}
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
      >
        {alerts.map((alert) => {
          return (
            <Grid item key={alert.id}>
              <Paper style={{ padding: '20px' }}>
                <Grid container direction="column" spacing={3}>
                  <Grid item>
                    <Grid container justify="space-between" alignItems="center">
                      <Grid item>
                        <Typography variant="h6">{alert.title}</Typography>
                      </Grid>
                      <Grid item>
                        {alert.id ? (
                          <Button
                            disabled={loading}
                            color="secondary"
                            onClick={async () => {
                              if (alert.id === undefined) {
                                return
                              }
                              setLoading(true)
                              await COMMANDS.FETCH(ALERTS_DISMISS_URL, {
                                method: 'POST',
                                body: JSON.stringify(createPayload(alert.id)),
                              })
                              await fetchAlerts()
                              setLoading(false)
                            }}
                          >
                            <CloseIcon />
                          </Button>
                        ) : null}
                      </Grid>
                    </Grid>
                  </Grid>
                  {alert.id ? (
                    <Grid item>
                      <Typography>
                        Dismiss this alert at your own risk. This alert may be
                        repopulated if the issue persists.
                      </Typography>
                      <Typography>
                        Host: {alert.hostName} : {alert.hostAddress}
                      </Typography>
                    </Grid>
                  ) : null}

                  {alert.details.map((detail, index) => {
                    return (
                      <Grid item key={index}>
                        <Typography>{detail}</Typography>
                      </Grid>
                    )
                  })}
                </Grid>
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
