import * as React from 'react'
import { Step } from './step'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { InstallerContext } from './installer.pure'

export const Welcome = () => {
  const { nextStep } = React.useContext(InstallerContext)
  return (
    <Step
      content={
        <>
          <Typography variant="h3" style={{ marginBottom: '10px' }}>
            Welcome
          </Typography>
          <Typography variant="h5">
            Let's set up your system for initial use!
          </Typography>
          <Typography variant="h5">
            Keep the following things in mind while progressing through the set
            up:
          </Typography>
          <Typography variant="h6">
            Update values from their defaults
          </Typography>
          <Typography variant="body1">
            All settings come with defaults set, but it is recommended that they
            are changed for the setup environment.
          </Typography>
          <Typography variant="h6">
            Changes can be made to settings after the setup
          </Typography>
          <Typography variant="body1">
            If you would like to change a setting after this setup has been run,
            you can do so by using the administrative web console.
          </Typography>
          <Typography variant="h6">
            Check the documentation for updates
          </Typography>
          <Typography variant="body1">
            The provided documentation contains additional information on
            settings and other advanced configurations outside of this
            installer.
          </Typography>
        </>
      }
      footer={
        <Grid container>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                nextStep()
              }}
            >
              Start
            </Button>
          </Grid>
        </Grid>
      }
    />
  )
}
