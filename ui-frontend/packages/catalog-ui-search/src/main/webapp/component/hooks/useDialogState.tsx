import { ButtonProps } from '@material-ui/core/Button'
import { DialogProps } from '@material-ui/core/Dialog'
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
