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
import { createGlobalStyle } from 'styled-components'
import ThemeSettings from '../theme-settings'
import AlertSettings from '../alert-settings'
import SearchSettings from '../search-settings'
const MapSettings = require('../../component/layers/layers.view.js')
import TimeSettings from '../time-settings'

import { hot } from 'react-hot-loader'
import MarionetteRegionContainer from '../marionette-region-container'
import Button from '@material-ui/core/Button'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import { useLocation, useHistory } from 'react-router-dom'
import queryString from 'query-string'
import { Link } from '../../component/link/link'

type ComponentType = () => JSX.Element

const ThemeGlobalStyle = createGlobalStyle`
.MuiBackdrop-root {
  opacity: 0 !important;
}
.MuiDrawer-root > .MuiPaper-root {
  transform: scale(.8) translateY(40%) translateX(-10%) !important;
}
`

export const BaseSettings = {
  Settings: {
    component: () => {
      return <SettingsScreen />
    },
  },
  Theme: {
    component: () => {
      return (
        <>
          <ThemeGlobalStyle />
          <ThemeSettings />
        </>
      )
    },
  },
  Notifications: {
    component: () => {
      return <AlertSettings />
    },
  },
  Map: {
    component: () => {
      return <MarionetteRegionContainer view={MapSettings} />
    },
  },
  'Search Options': {
    component: () => {
      return <SearchSettings showFooter={false} />
    },
  },
  Time: {
    component: () => {
      return <TimeSettings />
    },
  },
} as {
  [key: string]: {
    component: ComponentType
  }
}

const SettingsScreen = () => {
  const location = useLocation()
  const queryParams = queryString.parse(location.search)
  return (
    <Grid container direction="column" className="w-full h-full">
      {Object.keys(BaseSettings)
        .filter(name => name !== 'Settings')
        .map(name => {
          return (
            <Grid item className="w-full">
              <Button
                component={Link}
                to={`${location.pathname}?${queryString.stringify({
                  ...queryParams,
                  'global-settings': name,
                })}`}
                fullWidth
              >
                <div className="text-left w-full">{name}</div>
              </Button>
            </Grid>
          )
        })}
    </Grid>
  )
}

const getName = (setting: ComponentType) => {
  const matchedSetting = Object.entries(BaseSettings).find(entry => {
    return entry[1].component === setting
  })
  if (matchedSetting) {
    return matchedSetting[0]
  }
  return ''
}

const getComponent = (name: string) => {
  const matchedSetting = Object.entries(BaseSettings).find(entry => {
    return entry[0] === name
  })
  if (matchedSetting) {
    return matchedSetting[1].component
  }
  return BaseSettings.Settings.component
}

const UserSettings = () => {
  const location = useLocation()
  const history = useHistory()
  const queryParams = queryString.parse(location.search)

  const CurrentSetting = getComponent((queryParams['global-settings'] ||
    '') as string)
  const name = getName(CurrentSetting)
  return (
    <Grid container direction="column" className="w-full h-full" wrap="nowrap">
      <Grid item className="w-full p-3">
        <Grid container direction="row" alignItems="center">
          <Grid item>
            <Button
              component={Link}
              to={`${location.pathname}?${queryString.stringify({
                ...queryParams,
                'global-settings': 'Settings',
              })}`}
            >
              <Typography variant="h5">
                {name !== 'Settings' ? 'Back to ' : null}
                Settings
              </Typography>
            </Button>
          </Grid>
          {name !== 'Settings' ? (
            <>
              <Grid item>
                <ChevronRight />
              </Grid>
              <Grid item>
                <Typography variant="h5">{name}</Typography>
              </Grid>
            </>
          ) : null}
        </Grid>
      </Grid>
      <Grid item>
        <Divider />
      </Grid>
      <Grid item className="w-full h-full p-3">
        <CurrentSetting />
      </Grid>
    </Grid>
  )
}

export default hot(module)(UserSettings)
