import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import Divider from '@material-ui/core/Divider'
const properties = require('../../js/properties.js')
const user = require('../singletons/user-instance.js')
import { useDialog } from '../dialog'

function hasMessage() {
  return properties.ui.systemUsageTitle
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
  return properties.ui.systemUsageOncePerSession
}

function shouldDisplayMessage() {
  if (hasMessage()) {
    if (!shownOncePerSession() || user.get('user').isGuestUser()) {
      return true
    } else {
      return hasNotSeenMessage()
    }
  } else {
    return false
  }
}

const SystemUsageModal = () => {
  const dialogContext = useDialog()

  React.useEffect(() => {
    if (user.fetched && shouldDisplayMessage()) {
      openModal()
    } else {
      user.once('sync', () => {
        openModal()
      })
    }
  }, [])

  const openModal = () => {
    dialogContext.setProps({
      disableBackdropClick: true,
      open: true,
      children: (
        <>
          <DialogTitle style={{ textAlign: 'center' }}>
            {properties.ui.systemUsageTitle}
          </DialogTitle>
          <Divider />
          <DialogContent style={{ minHeight: '30em', minWidth: '60vh' }}>
            <div
              dangerouslySetInnerHTML={{
                __html: properties.ui.systemUsageMessage,
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
                  !user.get('user').isGuestUser() &&
                  properties.ui.systemUsageOncePerSession
                ) {
                  const systemUsage = JSON.parse(
                    // @ts-ignore ts-migrate(2345) FIXME: Type 'null' is not assignable to type 'string'.
                    window.sessionStorage.getItem('systemUsage')
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
