import * as React from 'react'
import { Step } from './step'
import { getDisplayName, InstallerContext } from './installer.pure'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'

import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { COMMANDS } from '../fetch/fetch'

const PROFILE_INSTALL_URL =
  '/admin/jolokia/exec/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/installFeature(java.lang.String)/'

type ModeType = 'normal' | 'installing' | 'error'

export const Profile = () => {
  const { profiles, profile, setProfile, nextStep, previousStep } =
    React.useContext(InstallerContext)
  const [mode, setMode] = React.useState('normal' as ModeType)
  React.useEffect(() => {
    if (mode === 'installing' && profile !== undefined) {
      COMMANDS.FETCH(PROFILE_INSTALL_URL + profile.name)
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 200) {
            nextStep()
          } else {
            setMode('error')
          }
        })
    }
  }, [mode])

  switch (mode) {
    case 'error':
    case 'normal':
      return (
        <Step
          content={
            <>
              <Typography variant="h4">
                Choose an installation profile
              </Typography>
              {profiles.length === 0 ? (
                <CircularProgress />
              ) : (
                <FormControl>
                  <FormLabel />
                  <RadioGroup
                    defaultValue={profile ? profile.name : profiles[0].name}
                    onChange={(e) => {
                      const profileToUse = profiles.filter(
                        (profile) =>
                          profile.name === (e.target as HTMLInputElement).value
                      )[0]
                      setProfile(profileToUse)
                    }}
                  >
                    {profiles.map((profile) => {
                      return (
                        <FormControlLabel
                          style={{ padding: '10px' }}
                          value={profile.name}
                          key={profile.name}
                          label={
                            <div>
                              <Typography variant="h5">
                                {getDisplayName(profile)}
                              </Typography>
                              <Typography variant="body1">
                                {profile.description}
                              </Typography>
                            </div>
                          }
                          // @ts-ignore
                          control={<Radio />}
                        />
                      )
                    })}
                  </RadioGroup>
                </FormControl>
              )}
            </>
          }
          footer={
            <>
              {mode === 'error' ? (
                <Typography variant="body1">
                  Unable to save selected profile, please check logs
                </Typography>
              ) : null}
              <Grid container spacing={3}>
                <Grid item>
                  <Button onClick={previousStep} variant="contained">
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={profiles.length === 0}
                    onClick={() => {
                      if (profile !== undefined) {
                        setMode('installing')
                      } else {
                        alert('Please select a profile first')
                      }
                    }}
                  >
                    Next
                  </Button>
                </Grid>
              </Grid>
            </>
          }
        />
      )
      break
    case 'installing':
      return (
        <Step
          content={
            <div>
              Installing {getDisplayName(profile)}
              <CircularProgress />
            </div>
          }
          footer={<div />}
        />
      )
      break
  }
}
