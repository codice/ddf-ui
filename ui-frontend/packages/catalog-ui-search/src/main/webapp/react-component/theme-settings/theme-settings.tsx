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
/*global require*/
import * as React from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'
import user from '../../component/singletons/user-instance'
import { hot } from 'react-hot-loader'
import Grid from '@mui/material/Grid'
import ColorTool from './color-tool'
;(window as any).user = user
type ThemeType = {
  theme: 'dark' | 'light'
  palette: 'default' | 'custom'
}
const getPreferences = () => {
  return user.get('user').get('preferences')
}
const getAnimationMode = () => {
  return Boolean(getPreferences().get('animation'))
}
const getCurrentTheme = (): ThemeType => {
  return getPreferences().get('theme').toJSON()
}
const AnimationSetting = () => {
  const [animationMode, setAnimationMode] = React.useState(getAnimationMode())
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(user.get('user').get('preferences'), 'change:animation', () => {
      setAnimationMode(getAnimationMode())
    })
  }, [])
  return (
    <FormControlLabel
      labelPlacement="start"
      control={
        <Checkbox
          color="default"
          checked={animationMode}
          onChange={(e) => {
            getPreferences().set('animation', e.target.checked)
            getPreferences().savePreferences()
          }}
        />
      }
      label="Animation"
    />
  )
}
const ThemeMode = () => {
  const [darkMode, setDarkMode] = React.useState(
    getCurrentTheme().theme === 'dark'
  )
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(user.get('user').get('preferences'), 'change:theme', () => {
      setDarkMode(getCurrentTheme().theme === 'dark')
    })
  }, [])
  return (
    <FormControlLabel
      labelPlacement="start"
      control={
        <Checkbox
          color="default"
          checked={darkMode}
          onChange={(e) => {
            getPreferences()
              .get('theme')
              .set('theme', e.target.checked ? 'dark' : 'light')
            getPreferences().savePreferences()
          }}
        />
      }
      label="Dark Mode"
    />
  )
}
const ThemePalette = () => {
  const [palette, setPalette] = React.useState(
    getCurrentTheme().palette === 'custom'
  )
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(user.get('user').get('preferences'), 'change:theme', () => {
      setPalette(getCurrentTheme().palette === 'custom')
    })
  }, [])
  return (
    <>
      <Grid item>
        <FormControlLabel
          labelPlacement="start"
          control={
            <Checkbox
              color="default"
              checked={palette}
              onChange={(e) => {
                getPreferences()
                  .get('theme')
                  .set('palette', e.target.checked ? 'custom' : 'default')
                getPreferences().savePreferences()
              }}
            />
          }
          label="Custom Palette"
        />
      </Grid>
      <Grid item className={`w-full ${palette ? '' : 'hidden'}`}>
        <ColorTool />
      </Grid>
    </>
  )
}
const ThemeSettings = () => {
  return (
    <Grid container direction="column" wrap="nowrap">
      <Grid item className="w-full">
        <AnimationSetting />
      </Grid>
      <Grid item className="w-full">
        <ThemeMode />
      </Grid>
      <ThemePalette />
    </Grid>
  )
}
export default hot(module)(ThemeSettings)
