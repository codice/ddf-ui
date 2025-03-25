import * as React from 'react'
import {
  SnackbarProvider as Provider,
  withSnackbar as withSnackbarShadow,
  useSnackbar as useSnackbarShadow,
  WithSnackbarProps,
} from 'notistack'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'

export const SnackbarProvider = Provider
export const withSnackbar = withSnackbarShadow
export const useSnackbar = useSnackbarShadow

export const generateDismissSnackbarAction = ({
  closeSnackbar,
}: {
  closeSnackbar: WithSnackbarProps['closeSnackbar']
}) => {
  return (key: string) => {
    return (
      <Button
        variant="text"
        color="inherit"
        onClick={() => {
          closeSnackbar(key)
        }}
      >
        <CloseIcon />
      </Button>
    )
  }
}
