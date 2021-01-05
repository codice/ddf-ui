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

export default hot(module)(useMenuState)
