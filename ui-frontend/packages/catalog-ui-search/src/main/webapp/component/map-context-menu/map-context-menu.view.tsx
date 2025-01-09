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

import { useMenuState } from '../menu-state/menu-state'
import Popover from '@mui/material/Popover'
import Paper from '@mui/material/Paper'
import { Elevations } from '../theme/theme'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import CopyCoordinates from '../../react-component/copy-coordinates'

const MapContextDropdown = ({ mapModel }: { mapModel: any }) => {
  const [coordinates, setCoordinates] = React.useState(
    mapModel.toJSON().coordinateValues
  )
  const menuState = useMenuState()
  const { mouseX, mouseY, mouseLat } = mapModel.toJSON()

  useListenTo(mapModel, 'change:open', () => {
    if (mapModel.get('open')) {
      menuState.handleClick()
    } else {
      menuState.handleClose()
    }
  })
  useListenTo(mapModel, 'change:coordinateValues', () => {
    setCoordinates(mapModel.toJSON().coordinateValues)
  })
  React.useEffect(() => {
    if (menuState.open && mouseLat === undefined) {
      menuState.handleClose()
    }
    if (!menuState.open) {
      mapModel.set('open', false)
    }
  }, [menuState.open])
  return (
    <>
      <div
        className="absolute"
        ref={menuState.anchorRef}
        style={{
          left: mouseX,
          top: mouseY,
        }}
      ></div>
      <Popover {...menuState.MuiPopoverProps}>
        <Paper elevation={Elevations.overlays}>
          <CopyCoordinates
            key={JSON.stringify(coordinates)}
            coordinateValues={coordinates}
            closeParent={() => {
              menuState.handleClose()
            }}
          />
        </Paper>
      </Popover>
    </>
  )
}

export default MapContextDropdown
