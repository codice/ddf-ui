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
import Backbone from 'backbone'
import { hot } from 'react-hot-loader'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import { useMenuState } from '../menu-state/menu-state'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import { Elevations } from '../theme/theme'
import Paper from '@mui/material/Paper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import ListIcon from '@mui/icons-material/List'
import FilterListIcon from '@mui/icons-material/FilterList'
//keep around the previously used (not a preference, so only per session)
export const StateModel = new Backbone.Model({
  display: 'list' as 'list' | 'graph',
  filter: 'all' as 'all' | 'parent' | 'child',
})

const FilterMenu = () => {
  const menuState = useMenuState()
  const [choices] = React.useState<{ label: string; value: string }[]>([
    {
      label: 'All associations',
      value: 'all',
    },
    {
      label: 'Outgoing associations',
      value: 'child',
    },
    {
      label: 'Incoming associations',
      value: 'parent',
    },
  ])
  const [value, setValue] = React.useState<string>(
    StateModel.get('filter') || 'all'
  )

  useListenTo(StateModel, `change:filter`, () => {
    setValue(StateModel.get('filter') || 'all')
  })

  const currentChoice =
    choices.find((choice) => choice.value === value) || choices[0]
  return (
    <>
      <Button {...menuState.MuiButtonProps} color="primary">
        <FilterListIcon className="Mui-text-text-primary" />
        {currentChoice.label}
      </Button>
      <Popover {...menuState.MuiPopoverProps}>
        <Paper elevation={Elevations.overlays}>
          <MenuList key={currentChoice.value}>
            {choices.map((choice) => {
              return (
                <MenuItem
                  onClick={() => {
                    StateModel.set('filter', choice.value as unknown as any)
                    menuState.handleClose()
                  }}
                  autoFocus={choice === currentChoice}
                >
                  {choice.label}
                </MenuItem>
              )
            })}
          </MenuList>
        </Paper>
      </Popover>
    </>
  )
}

const DisplayMenu = () => {
  const menuState = useMenuState()
  const [choices] = React.useState<{ label: string; value: string }[]>([
    {
      label: 'List',
      value: 'list',
    },
    {
      label: 'Graph',
      value: 'graph',
    },
  ])
  const [value, setValue] = React.useState<string>(
    StateModel.get('display') || 'list'
  )

  useListenTo(StateModel, `change:display`, () => {
    setValue(StateModel.get('display') || 'list')
  })

  const currentChoice =
    choices.find((choice) => choice.value === value) || choices[0]
  return (
    <>
      <Button {...menuState.MuiButtonProps} color="primary">
        {currentChoice.value === 'list' ? (
          <ListIcon className="Mui-text-text-primary" />
        ) : (
          <BubbleChartIcon className="Mui-text-text-primary" />
        )}
        {currentChoice.label}
      </Button>
      <Popover {...menuState.MuiPopoverProps}>
        <Paper elevation={Elevations.overlays}>
          <MenuList key={currentChoice.value}>
            {choices.map((choice) => {
              return (
                <MenuItem
                  onClick={() => {
                    StateModel.set('display', choice.value as unknown as any)
                    menuState.handleClose()
                  }}
                  autoFocus={choice === currentChoice}
                >
                  {choice.label}
                </MenuItem>
              )
            })}
          </MenuList>
        </Paper>
      </Popover>
    </>
  )
}

const AssociationsMenu = () => {
  return (
    <div className="flex flex-row flex-nowrap items-center justify-center w-full">
      <div className="p-2 ">
        <FilterMenu />
      </div>
      <div className="p-2 ">
        <DisplayMenu />
      </div>
    </div>
  )
}

export default hot(module)(AssociationsMenu)
