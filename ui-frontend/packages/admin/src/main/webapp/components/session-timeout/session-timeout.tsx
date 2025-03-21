import * as React from 'react'
import { URLS } from '../fetch/fetch'
import { useAppRootContext } from '../app-root/app-root.pure'
import { throttle } from 'lodash'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { ControlledModal } from '../modal/modal'
import { setType } from '../../typescript/hooks'

const idleNoticeDuration = 60000
// Length of inactivity that will trigger user timeout (15 minutes in ms by default)
// See STIG V-69243
const defaultIdleTimeoutThreshold = 900000

function getIdleTimeoutDate(idleTimeoutThreshold: number) {
  return idleTimeoutThreshold + Date.now()
}

function isLocalStorageAvailable() {
  var test = 'test'
  try {
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

const localStorageAvailable = isLocalStorageAvailable()

const logout = () => {
  window.location.replace(URLS.SESSION.INVALIDATE + window.location.href)
}

const handleLocalStorageChange = ({
  setIdleTimeoutDate,
}: {
  setIdleTimeoutDate: setType<number>
}) => {
  const idleTimeoutDate = localStorage.getItem('kanri.idleTimeoutDate')
  if (idleTimeoutDate) {
    setIdleTimeoutDate(parseInt(idleTimeoutDate))
  }
}

const resetIdleTimeoutDate = ({
  setIdleTimeoutDate,
  idleTimeoutThreshold,
}: {
  setIdleTimeoutDate: setType<number>
  idleTimeoutThreshold: number
}) => {
  var idleTimeoutDate = getIdleTimeoutDate(idleTimeoutThreshold)
  if (localStorageAvailable) {
    //@ts-ignore
    localStorage.setItem('kanri.idleTimeoutDate', idleTimeoutDate)
  }
  setIdleTimeoutDate(idleTimeoutDate)
}

const startListeningToStorage = ({
  setIdleTimeoutDate,
}: {
  setIdleTimeoutDate: setType<number>
}) => {
  if (localStorageAvailable)
    window.addEventListener('storage', () => {
      handleLocalStorageChange({ setIdleTimeoutDate })
    })
}

export const TimeLeftComp = ({
  idleTimeoutDate,
}: {
  idleTimeoutDate: number
}) => {
  const [num, setNum] = React.useState(0)
  React.useEffect(() => {
    setTimeout(() => {
      setNum(num + 1)
    })
  }, [num])
  return <>{((idleTimeoutDate - Date.now()) / 1000).toFixed(0)}</>
}

export const SessionTimeout = () => {
  const { platformConfig } = useAppRootContext()
  // Length of inactivity that will trigger user timeout (15 minutes in ms by default)
  // See STIG V-69243
  const [idleTimeoutThreshold, setIdleTimeoutThreshold] = React.useState(
    defaultIdleTimeoutThreshold
  )
  const [idleTimeoutDate, setIdleTimeoutDate] = React.useState(
    Date.now() + defaultIdleTimeoutThreshold
  )
  const [showPrompt, setShowPrompt] = React.useState(false)

  React.useEffect(() => {
    startListeningToStorage({ setIdleTimeoutDate })
    resetIdleTimeoutDate({ setIdleTimeoutDate, idleTimeoutThreshold })
  }, [])

  React.useEffect(() => {
    if (showPrompt === false) {
      const throttledReset = throttle(() => {
        resetIdleTimeoutDate({ setIdleTimeoutDate, idleTimeoutThreshold })
      }, 5000)
      document.addEventListener('keydown', throttledReset)
      document.addEventListener('mousedown', throttledReset)
      return () => {
        document.removeEventListener('keydown', throttledReset)
        document.removeEventListener('mousedown', throttledReset)
      }
    } else {
      return () => {}
    }
  }, [showPrompt])

  //todo investigate why platform config doesn't update timeout even though config changes
  React.useEffect(() => {
    let newThreshold = platformConfig.timeout
    newThreshold =
      newThreshold > 0 ? newThreshold * 60000 : defaultIdleTimeoutThreshold
    setIdleTimeoutThreshold(newThreshold)
  }, [platformConfig])

  React.useEffect(() => {
    setShowPrompt(false)
    const promptTimer = setTimeout(() => {
      setShowPrompt(true)
    }, idleTimeoutDate - idleNoticeDuration - Date.now())
    const logoutTimer = setTimeout(logout, idleTimeoutDate - Date.now())
    return () => {
      clearTimeout(promptTimer)
      clearTimeout(logoutTimer)
    }
  }, [idleTimeoutDate])
  return (
    <ControlledModal
      key={JSON.stringify(showPrompt)}
      defaultOpen={showPrompt}
      modalProps={{
        disableBackdropClick: true,
        style: {
          zIndex: 1301, //modals are normally 1300, this keeps the timeout on top
        },
      }}
      modalChildren={() => {
        return (
          <Grid
            container
            direction="column"
            spacing={3}
            style={{ padding: '20px' }}
          >
            <Grid item>
              <Typography variant="h4">Session Expiring</Typography>
            </Grid>
            <Grid item>
              <Typography>
                You will be logged out automatically in{' '}
                {<TimeLeftComp idleTimeoutDate={idleTimeoutDate} />} seconds.
                Press "Continue working" to remain logged in.
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  resetIdleTimeoutDate({
                    setIdleTimeoutDate,
                    idleTimeoutThreshold,
                  })
                }}
              >
                Continue Working
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
