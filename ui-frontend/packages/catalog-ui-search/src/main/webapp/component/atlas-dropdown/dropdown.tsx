import * as React from 'react'
import Popper, { PopperProps } from '@material-ui/core/Popper'
import { PaperProps } from '@material-ui/core/Paper'
import { DropdownContext, DropdownContextType } from './dropdown.context'
import { Subtract } from '../../typescript'

type DropdownProps = {
  children: ({
    handleClick,
  }: {
    handleClick: (event: React.MouseEvent<any, MouseEvent>) => void
  }) => React.ReactElement
  content: (dropdownContext: DropdownContextType) => React.ReactElement
  paperProps?: PaperProps
  popperProps?: Subtract<
    PopperProps,
    {
      children: PopperProps['children']
      open: PopperProps['open']
      anchorEl: PopperProps['anchorEl']
    }
  >
}

export const Dropdown = ({ children, content, popperProps }: DropdownProps) => {
  const dropdownContext = React.useContext(DropdownContext)
  const [anchorEl, setAnchorEl] = React.useState(null)

  function handleClick(event: React.MouseEvent<any, MouseEvent>) {
    // @ts-ignore
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }
  const close = () => setAnchorEl(null)
  const open = Boolean(anchorEl)

  return (
    <DropdownContext.Provider
      value={{
        close: close,
        closeAndRefocus: close,
        parent: () => dropdownContext,
        parentOpen: open,
        deepCloseAndRefocus: dropdownContext.deepCloseAndRefocus,
        depthCloseAndRefocus: dropdownContext.depthCloseAndRefocus,
      }}
    >
      {children({ handleClick })}
      <Popper open={open} anchorEl={anchorEl} {...popperProps}>
        <DropdownContext.Consumer>{content}</DropdownContext.Consumer>
      </Popper>
    </DropdownContext.Provider>
  )
}
