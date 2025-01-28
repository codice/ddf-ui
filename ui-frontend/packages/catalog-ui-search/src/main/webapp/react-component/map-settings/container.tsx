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

import withListenTo, {
  WithBackboneProps,
} from '../../react-component/backbone-container'
import Paper from '@mui/material/Paper'
import { useMenuState } from '../../component/menu-state/menu-state'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import user from '../../component/singletons/user-instance'
import SettingsIcon from '@mui/icons-material/Settings'
import { Elevations } from '../../component/theme/theme'
import { getUserCoordinateFormat } from '../../component/visualization/settings-helpers'
import { LayoutContext } from '../../component/golden-layout/visual-settings.provider'

const MapSettings = (props: WithBackboneProps) => {
  const { getValue, setValue, onStateChanged, visualTitle, hasLayoutContext } =
    React.useContext(LayoutContext)

  const [coordFormat, setCoordFormat] = useState('degrees')

  const [autoPan, setAutoPan] = useState(
    user.get('user').get('preferences').get('autoPan')
  )
  const menuState = useMenuState()
  const coordFormatKey = `${visualTitle}-coordFormat`

  useEffect(() => {
    const userDefaultFormat = getUserCoordinateFormat()
    if (hasLayoutContext) {
      setCoordFormat(getValue(coordFormatKey, userDefaultFormat))
      onStateChanged(() => {
        const coordFormat = getValue(coordFormatKey, getUserCoordinateFormat())
        setCoordFormat(coordFormat)
      })
    } else {
      setCoordFormat(userDefaultFormat)
      props.listenTo(
        user.get('user').get('preferences'),
        'change:coordinateFormat',
        () => setCoordFormat(getUserCoordinateFormat())
      )
    }

    props.listenTo(
      user.get('user').get('preferences'),
      'change:autoPan',
      (_prefs: any, value: boolean) => setAutoPan(value)
    )
  }, [])

  const updateCoordFormat = (coordinateFormat: string) => {
    if (hasLayoutContext) {
      setValue(coordFormatKey, coordinateFormat)
    } else {
      const preferences = user
        .get('user')
        .get('preferences')
        .set({ coordinateFormat })
      preferences.savePreferences()
    }
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
        <SettingsIcon />
      </Button>
      <Popover {...menuState.MuiPopoverProps}>
        <Paper elevation={Elevations.overlays}>
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

export default withListenTo(MapSettings)
