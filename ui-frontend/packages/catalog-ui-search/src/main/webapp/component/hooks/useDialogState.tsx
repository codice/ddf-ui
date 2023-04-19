import { ButtonProps } from '@mui/material/Button'
import { DialogProps } from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
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
