import { createContext, useState, useEffect, useMemo } from 'react'
import Button from '@mui/material/Button'
import SnackBar, { SnackbarProps } from '@mui/material/Snackbar'
import Alert, { AlertProps } from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Portal from '@mui/material/Portal'

export type AddSnack = (message: string, props?: SnackProps) => () => void

type Snack = {
  message?: string
} & SnackProps

export type SnackProps = {
  id?: string
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

  const addSnack: AddSnack = (message, props = {}) => {
    const newSnack = { message, ...props }
    setSnacks((snacks) => {
      if (props.id) {
        const snackIndex = snacks.findIndex((s) => s.id === props.id)
        if (snackIndex >= 0) {
          snacks.splice(snackIndex, 1)
        }
      }
      return [newSnack, ...snacks]
    })

    const closeSnack = () => {
      setSnacks((snacks) => snacks.filter((snack) => snack !== newSnack))
    }

    return closeSnack
  }

  // Set current snack to be displayed
  useEffect(() => {
    if (snacks.length > 0) {
      setCurrentSnack(snacks[snacks.length - 1])
    }
  }, [snacks])

  // Remove snack after timeout
  useEffect(() => {
    if (currentSnack.message) {
      const timeout = currentSnack.timeout || AUTO_DISMISS

      const timer = setTimeout(() => {
        removeCurrentSnack()
      }, timeout)

      return () => clearTimeout(timer)
    }

    return
  }, [currentSnack])

  const handleClose = (_e: any, reason: string) => {
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
    setSnacks((snacks) => snacks.slice(0, snacks.length - 1))
  }

  const value = useMemo(() => addSnack, [])
  const { message, status, closeable, undo, snackBarProps, alertProps } =
    currentSnack
  return (
    <SnackBarContext.Provider value={value}>
      {children}
      {message && (
        <Portal>
          <SnackBar
            key={message}
            className="left-0 bottom-0 p-4 max-w-full"
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
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    <IconButton
                      style={{ padding: '3px' }}
                      color="inherit"
                      onClick={handleClose}
                      size="large"
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
