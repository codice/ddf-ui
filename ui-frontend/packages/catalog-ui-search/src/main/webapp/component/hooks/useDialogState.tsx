import { ButtonProps } from '@material-ui/core/Button'
import { DialogProps } from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import React from 'react'

export function useDialogState() {
  const [open, setOpen] = React.useState(false)
  const handleClick = () => {
    setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return {
    open,
    handleClick,
    handleClose,
    /**
     * Handy prop bundles for passing to common components
     */
    dropdownProps: {
      open,
      handleClose,
    },
    MuiButtonComponents: {
      Button,
    },
    MuiDialogComponents: {
      Dialog,
      DialogContent,
      DialogTitle,
      DialogActions,
      DialogContentText,
    },
    MuiDialogProps: {
      open,
      onClose: handleClose,
    } as Required<Pick<DialogProps, 'open' | 'onClose'>>,
    MuiButtonProps: {
      onClick: handleClick,
    } as Required<Pick<ButtonProps, 'onClick'>>,
    buttonProps: {
      onClick: handleClick,
    },
  }
}
