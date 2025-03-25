import * as React from 'react'
import { useAppRootContext } from '../app-root/app-root.pure'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { ControlledModal } from '../modal/modal'

export const SystemUsage = () => {
  const { platformConfig } = useAppRootContext()
  const hasSeen = sessionStorage.getItem('system-usage') === 'true'

  if (platformConfig.systemUsageMessage === undefined) {
    return null
  }
  if (platformConfig.systemUsageOncePerSession === true && hasSeen === true) {
    return null
  }
  return (
    <ControlledModal
      defaultOpen={true}
      modalProps={{
        disableBackdropClick: true,
        style: {
          zIndex: 1301, // higher than others
        },
      }}
      paperProps={{
        style: {
          height: '100%',
        },
      }}
      modalChildren={({ setOpen }) => {
        return (
          <Grid
            container
            direction="column"
            style={{ overflow: 'auto', height: '100%' }}
            wrap="nowrap"
            spacing={3}
          >
            <Grid item>
              <Typography variant="h4">
                {platformConfig.systemUsageTitle}
              </Typography>
            </Grid>
            <Grid item style={{ overflow: 'auto' }}>
              {platformConfig.systemUsageMessage}
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  sessionStorage.setItem('system-usage', 'true')
                  setOpen(false)
                }}
              >
                OK
              </Button>
            </Grid>
          </Grid>
        )
      }}
    >
      {() => <></>}
    </ControlledModal>
  )
}
