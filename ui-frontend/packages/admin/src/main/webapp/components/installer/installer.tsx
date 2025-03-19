import * as React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import LinearProgress from '@material-ui/core/LinearProgress'

import { Welcome } from './welcome'
import { Profile } from './profile'
import { GuestClaims } from './guest-claims'
import { SystemConfiguration } from './system-configuration'
import { Certificates } from './certificates'
import { SSO } from './sso'
import { ProfileType, InstallerContext } from './installer.pure'
import { Finish } from './finish'
import Paper from '@material-ui/core/Paper'
import { InstanceRouteContextProvider } from '../app-root/route'
import { COMMANDS } from '../fetch/fetch'

const PROFILES_URL =
  '/admin/jolokia/read/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/InstallationProfiles/'

type Props = {}

const Step = ({ step, loading }: { loading: boolean; step: number }) => {
  if (loading) {
    return <CircularProgress />
  }
  switch (step) {
    case 0:
      return <Welcome />
    case 1:
      return <Profile />
    case 2:
      return <GuestClaims />
    case 3:
      return <SystemConfiguration />
    case 4:
      return <Certificates />
    case 5:
      return <SSO />
    case 6:
      return <Finish />
    default:
      return <div>Unknown step</div>
  }
}

const ProgressBar = ({
  step,
  totalSteps,
}: {
  step: number
  totalSteps: number
}) => {
  return (
    <LinearProgress
      variant="determinate"
      value={step === 0 ? 0 : (step / totalSteps) * 100}
      style={{ marginTop: '10px', height: '10px' }}
    />
  )
}

export const Installer = ({}: Props) => {
  const [step, setStep] = React.useState(0)
  const [totalSteps] = React.useState(6)
  const [profiles, setProfiles] = React.useState([] as ProfileType[])
  const [profile, setProfile] = React.useState(
    undefined as ProfileType | undefined
  )
  const [loading] = React.useState(false)

  const nextStep = () => {
    setStep(step + 1)
  }
  const previousStep = () => {
    setStep(step - 1)
  }
  React.useEffect(() => {
    COMMANDS.FETCH(PROFILES_URL)
      .then((response) => response.json())
      .then((profiles) => {
        setProfiles(profiles.value)
        setProfile(profiles.value[0])
      })
  }, [])

  return (
    <InstanceRouteContextProvider>
      <InstallerContext.Provider
        value={{
          profiles,
          profile,
          setProfile,
          nextStep,
          previousStep,
        }}
      >
        <Paper style={{ padding: '20px' }}>
          <Step step={step} loading={loading} />
          <ProgressBar step={step} totalSteps={totalSteps} />
        </Paper>
      </InstallerContext.Provider>
    </InstanceRouteContextProvider>
  )
}
