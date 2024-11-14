import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import user from '../singletons/user-instance'
import { useDialog } from '../dialog'
import { StartupDataStore } from '../../js/model/Startup/startup'
import { useConfiguration } from '../../js/model/Startup/configuration.hooks'
function hasMessage() {
  return StartupDataStore.Configuration.platformUiConfiguration
    ?.systemUsageTitle
}
function hasNotSeenMessage() {
  const systemUsage = window.sessionStorage.getItem('systemUsage')
  if (systemUsage === null) {
    window.sessionStorage.setItem('systemUsage', '{}')
    return true
  } else {
    return (
      JSON.parse(systemUsage)[user.get('user').get('username')] === undefined
    )
  }
}
function shownOncePerSession() {
  return StartupDataStore.Configuration.platformUiConfiguration
    ?.systemUsageOncePerSession
}
function shouldDisplayMessage() {
  if (hasMessage()) {
    if (!shownOncePerSession()) {
      return true
    } else {
      return hasNotSeenMessage()
    }
  } else {
    return false
  }
}
const SystemUsageModal = () => {
  const Configuration = useConfiguration()
  const dialogContext = useDialog()
  React.useEffect(() => {
    if (shouldDisplayMessage()) {
      openModal()
    } else {
      user.once('sync', () => {
        openModal()
      })
    }
  }, [])
  const openModal = () => {
    dialogContext.setProps({
      onClose: (_event, reason) => {
        if (reason === 'backdropClick') {
          return
        }
        dialogContext.setProps({
          open: false,
        })
      },
      open: true,
      children: (
        <>
          <DialogTitle style={{ textAlign: 'center' }}>
            {Configuration.platformUiConfiguration?.systemUsageTitle}
          </DialogTitle>
          <Divider />
          <DialogContent style={{ minHeight: '30em', minWidth: '60vh' }}>
            <div
              dangerouslySetInnerHTML={{
                __html: Configuration.getSystemUsageMessage(),
              }}
            />
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (
                  Configuration.platformUiConfiguration
                    ?.systemUsageOncePerSession
                ) {
                  const systemUsage = JSON.parse(
                    window.sessionStorage.getItem('systemUsage') as any
                  )
                  systemUsage[user.get('user').get('username')] = 'true'
                  window.sessionStorage.setItem(
                    'systemUsage',
                    JSON.stringify(systemUsage)
                  )
                }
                dialogContext.setProps({
                  open: false,
                })
              }}
            >
              Acknowledge
            </Button>
          </DialogActions>
        </>
      ),
    })
  }
  return <></>
}
export default hot(module)(SystemUsageModal)
