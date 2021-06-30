/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import * as React from 'react'
import Button from '@material-ui/core/Button'
import { hot } from 'react-hot-loader'
import { useMenuState } from '../../../component/menu-state/menu-state'
import HomeIcon from '@material-ui/icons/Home'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import Popover from '@material-ui/core/Popover'
import RoomIcon from '@material-ui/icons/Room'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../../../component/theme/theme'
type voidFunc = () => void

type Props = {
  goHome: voidFunc
  saveHome: voidFunc
}

const ZoomToHome = (props: Props) => {
  const { saveHome, goHome } = props
  const menuState = useMenuState()
  return (
    <>
      <div className="flex flex-row items-stretch">
        <Button
          size="small"
          data-id="home-button"
          {...menuState.MuiButtonProps}
          className="border border-r-2 Mui-border-divider"
          onClick={goHome}
        >
          <div className="flex flex-row items-center">
            <HomeIcon />
          </div>
        </Button>
        <div className="Mui-bg-default w-min my-2"></div>
        <Button
          size="small"
          data-id="home-dropdown"
          {...menuState.MuiButtonProps}
        >
          <KeyboardArrowDownIcon />
        </Button>
      </div>
      <Popover {...menuState.MuiPopoverProps}>
        <Paper elevation={Elevations.overlays} className="p-2">
          <Button
            size="small"
            data-id="set-home-button"
            className="p-2"
            onClick={() => {
              saveHome()
              menuState.handleClose()
            }}
            title="Save Current View as Home Location"
          >
            <span>
              Set Home
              <RoomIcon />
            </span>
          </Button>
        </Paper>
      </Popover>
    </>
  )
}

export default hot(module)(ZoomToHome)
