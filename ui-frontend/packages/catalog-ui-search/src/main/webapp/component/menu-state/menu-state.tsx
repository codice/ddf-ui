import { PopoverProps } from '@material-ui/core/Popover'
import * as React from 'react'
import { hot } from 'react-hot-loader'

export const useMenuState = () => {
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)

  const handleClick = () => {
    setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
  }
  return {
    anchorRef,
    open,
    handleClick,
    handleClose,
  }
}

export const POPOVER_DEFAULTS = {
  onEntered: (element) => {
    element.style.maxHeight = `calc(100% - ${element.style.top} - 10px)`
  },
  generateOnEnter: (minHeight) => {
    return (element) => {
      element.style.minHeight = minHeight
    }
  },
} as {
  onEntered: PopoverProps['onEntered']
  /**
   *  Use this to set a minHeight on a popover
   */
  generateOnEnter: (
    minHeight: CSSStyleDeclaration['minHeight']
  ) => PopoverProps['onEnter']
}

export default hot(module)(useMenuState)
