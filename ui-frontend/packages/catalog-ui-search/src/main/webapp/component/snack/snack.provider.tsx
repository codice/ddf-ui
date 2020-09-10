import React, { createContext, useState, useEffect, useMemo } from 'react'
import Button from '@material-ui/core/Button'
import SnackBar, { SnackbarProps } from '@material-ui/core/Snackbar'
import Alert, { AlertProps } from '@material-ui/lab/Alert'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Portal from '@material-ui/core/Portal'

type AddSnack = (message: string, props?: SnackProps) => void

type Snack = {
  message?: string
} & SnackProps

export type SnackProps = {
  status?: AlertProps['severity']
  closeable?: boolean
  clickawayCloseable?: boolean
  timeout?: number
  undo?: () => void
  snackBarProps?: SnackbarProps
  alertProps?: AlertProps
}

const AUTO_DISMISS = 5000

// Gives the addSnack function the correct type signature
export const SnackBarContext = createContext<AddSnack>({} as AddSnack)

export function SnackProvider({ children }: any) {
  const [snacks, setSnacks] = useState([] as Snack[])
  const [currentSnack, setCurrentSnack] = useState({} as Snack)

  const addSnack = (message: string, props: SnackProps = {}) => {
    setSnacks(snacks => [{ message, ...props }, ...snacks])
  }

  // Set current snack to be displayed
  useEffect(
    () => {
      if (snacks.length > 0) {
        setCurrentSnack(snacks[snacks.length - 1])
      }
    },
    [snacks]
  )

  // Remove snack after timeout
  useEffect(
    () => {
      if (currentSnack.message) {
        const timeout = currentSnack.timeout || AUTO_DISMISS

        const timer = setTimeout(() => {
          removeCurrentSnack()
        }, timeout)

        return () => clearTimeout(timer)
      }

      return
    },
    [currentSnack]
  )

  // @ts-expect-error ts-migrate(6133) FIXME: 'e' is declared but its value is never read.
  const handleClose = (e: any, reason: string) => {
    if (reason === 'clickaway' && currentSnack.clickawayCloseable) {
      removeCurrentSnack()
    } else if (reason !== 'clickaway' && currentSnack.closeable) {
      removeCurrentSnack()
    }
  }

  const handleUndo = () => {
    currentSnack.undo && currentSnack.undo()
    removeCurrentSnack()
  }

  const removeCurrentSnack = () => {
    setCurrentSnack({})
    setSnacks(snacks => snacks.slice(0, snacks.length - 1))
  }

  const value = useMemo(() => addSnack, [])
  const {
    message,
    status,
    closeable,
    undo,
    snackBarProps,
    alertProps,
  } = currentSnack
  return (
    <SnackBarContext.Provider value={value}>
      {children}
      {message && (
        <Portal>
          <SnackBar
            key={message}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={true}
            onClose={handleClose}
            {...snackBarProps}
          >
            <Alert
              style={{
                minWidth: '18rem',
                alignItems: 'center',
              }}
              action={
                <>
                  {undo && (
                    <Button
                      color="inherit"
                      size="small"
                      style={{ fontSize: '.75rem' }}
                      onClick={handleUndo}
                    >
                      UNDO
                    </Button>
                  )}
                  {closeable && (
                    // @ts-expect-error ts-migrate(2769) FIXME: Type '(e: any, reason: string) => void' is not ass... Remove this comment to see the full error message
                    <IconButton
                      style={{ padding: '3px' }}
                      color="inherit"
                      onClick={handleClose}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </>
              }
              severity={status}
              {...alertProps}
            >
              {message}
            </Alert>
          </SnackBar>
        </Portal>
      )}
    </SnackBarContext.Provider>
  )
}
