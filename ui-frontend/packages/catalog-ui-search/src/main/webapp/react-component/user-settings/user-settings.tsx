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
import ThemeSettings from '../theme-settings'
import AlertSettings from '../alert-settings'
import SearchSettings from '../search-settings'
const MapSettings = require('../../component/layers/layers.view.js')
import TimeSettings from '../time-settings'

import styled from 'styled-components'
import { hot } from 'react-hot-loader'
import MarionetteRegionContainer from '../marionette-region-container'
import Button from '@material-ui/core/Button'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'

import Timer from '@material-ui/icons/Timer'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'

export type SettingsProps = {
  children: React.ReactNode[]
}

export type ComponentProps = {
  updateComponent?: (component?: React.ReactNode) => void
}

export const BaseSettings = {
  Theme: {
    component: () => {
      return <ThemeSettings />
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

const SettingsScreen = ({ setComponent }: { setComponent: any }) => {
  return (
    <Grid container direction="column" className="w-full h-full">
      {Object.entries(BaseSettings).map(([name, { component }]) => {
        return (
          <Grid item className="w-full">
            <Button
              fullWidth
              onClick={() => {
                setComponent(component)
              }}
            >
              <div className="text-left w-full">{name}</div>
            </Button>
          </Grid>
        )
      })}
    </Grid>
  )
}

/**
 * Explicit typing needed on the return (to avoid we'd need to return an object instead of an array)
 */
function useFunctionAsState<T>(initialFunction: T) {
  const [state, setState] = React.useState(() => initialFunction)

  return [
    state as T,
    (newFunction: T) => {
      setState(() => newFunction)
    },
  ] as [T, (newFunction: T) => void]
}

type ComponentType = (
  { setComponent }: { setComponent: (arg0: ComponentType) => void }
) => JSX.Element

const getName = (setting: ComponentType) => {
  const matchedSetting = Object.entries(BaseSettings).find(entry => {
    return entry[1].component === setting
  })
  if (matchedSetting) {
    return matchedSetting[0]
  }
  return ''
}

const UserSettings = () => {
  const [CurrentSetting, setCurrentSetting] = useFunctionAsState<ComponentType>(
    SettingsScreen
  )
  const name = getName(CurrentSetting)
  return (
    <Grid container direction="column" className="w-full h-full" wrap="nowrap">
      <Grid item className="w-full p-3">
        <Grid container direction="row" alignItems="center">
          <Grid item>
            <Button
              onClick={() => {
                setCurrentSetting(SettingsScreen)
              }}
            >
              <Typography variant="h5">
                {name ? 'Back to ' : null}
                Settings
              </Typography>
            </Button>
          </Grid>
          {name ? (
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
        <CurrentSetting setComponent={setCurrentSetting} />
      </Grid>
    </Grid>
  )
}

export default hot(module)(UserSettings)
