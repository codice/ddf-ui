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
import { useState, useEffect } from 'react'
import MapSettingsPresentation from './presentation'
import { hot } from 'react-hot-loader'
import withListenTo, {
  WithBackboneProps,
} from '../../react-component/backbone-container'
import Paper from '@material-ui/core/Paper'
import { useMenuState } from '../../component/menu-state/menu-state'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
const user = require('../../component/singletons/user-instance.js')
import SettingsIcon from '@material-ui/icons/Settings'

const MapSettings = (props: WithBackboneProps) => {
  const [coordFormat, setCoordFormat] = useState(
    user.get('user').get('preferences').get('coordinateFormat')
  )
  const [autoPan, setAutoPan] = useState(
    user.get('user').get('preferences').get('autoPan')
  )
  const menuState = useMenuState()

  useEffect(() => {
    props.listenTo(
      user.get('user').get('preferences'),
      'change:coordinateFormat',
      (_prefs: any, value: string) => setCoordFormat(value)
    )
    props.listenTo(
      user.get('user').get('preferences'),
      'change:autoPan',
      (_prefs: any, value: boolean) => setAutoPan(value)
    )
  }, [])

  const updateCoordFormat = (coordinateFormat: string) => {
    const preferences = user
      .get('user')
      .get('preferences')
      .set({ coordinateFormat })
    preferences.savePreferences()
  }

  const updateAutoPan = (
    _event: React.ChangeEvent<HTMLInputElement>,
    autoPan: boolean
  ) => {
    const preferences = user.get('user').get('preferences').set({ autoPan })
    preferences.savePreferences()
  }

  return (
    <>
      <Button
        size="small"
        data-id="settings-button"
        {...menuState.MuiButtonProps}
      >
        <span className="interaction-text">Settings</span>
        <SettingsIcon />
      </Button>
      <Popover {...menuState.MuiPopoverProps}>
        <Paper>
          <MapSettingsPresentation
            coordFormat={coordFormat}
            updateCoordFormat={updateCoordFormat}
            autoPan={autoPan}
            updateAutoPan={updateAutoPan}
          />
        </Paper>
      </Popover>
    </>
  )
}

export default hot(module)(withListenTo(MapSettings))
