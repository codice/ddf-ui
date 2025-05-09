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

import { createGlobalStyle } from 'styled-components'

import Button from '@mui/material/Button'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { useLocation } from 'react-router-dom'
import queryString from 'query-string'
import { Link } from 'react-router-dom'
import { SuspenseWrapper } from '../../component/app/suspense'
import { lazy } from 'react'

const ThemeSettings = lazy(() => import('../theme-settings'))
const AlertSettings = lazy(() => import('../alert-settings'))
const AttributeSettings = lazy(() => import('../attribute-settings'))
const SearchSettings = lazy(() => import('../search-settings'))
const TimeSettings = lazy(() => import('../time-settings'))
const MapUserSettings = lazy(
  () => import('../map-user-settings/map-user-settings')
)

const ThemeGlobalStyle = createGlobalStyle`
.MuiBackdrop-root {
  opacity: 0 !important;
}
.MuiDrawer-root > .MuiPaper-root {
  transform: scale(.8) translateY(10%) translateX(-10%) !important;
}
`

type IndividualSettingsComponentType = ({
  SettingsComponents,
}: {
  SettingsComponents: SettingsComponentType
}) => React.ReactNode

export type SettingsComponentType = {
  [key: string]: {
    component: IndividualSettingsComponentType
  }
}

export const BaseSettings = {
  Settings: {
    component: ({ SettingsComponents }) => {
      return <SettingsScreen SettingsComponents={SettingsComponents} />
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
      return <MapUserSettings />
    },
  },
  'Search Options': {
    component: () => {
      return <SearchSettings />
    },
  },
  'Attribute Options': {
    component: () => {
      return <AttributeSettings />
    },
  },
  Time: {
    component: () => {
      return <TimeSettings />
    },
  },
} as SettingsComponentType

const SettingsScreen = ({
  SettingsComponents,
}: {
  SettingsComponents: SettingsComponentType
}) => {
  const location = useLocation()
  const queryParams = queryString.parse(location.search)
  return (
    <Grid container direction="column" className="w-full h-full">
      {Object.keys(SettingsComponents)
        .filter((name) => name !== 'Settings')
        .map((name) => {
          return (
            <Grid key={name} item className="w-full">
              <Button
                component={Link as any}
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

const getName = ({
  CurrentSetting,
  SettingsComponents,
}: {
  CurrentSetting: IndividualSettingsComponentType
  SettingsComponents: SettingsComponentType
}) => {
  const matchedSetting = Object.entries(SettingsComponents).find((entry) => {
    return entry[1].component === CurrentSetting
  })
  if (matchedSetting) {
    return matchedSetting[0]
  }
  return ''
}

const getComponent = ({
  name,
  SettingsComponents,
}: {
  name: string
  SettingsComponents: SettingsComponentType
}) => {
  const matchedSetting = Object.entries(SettingsComponents).find((entry) => {
    return entry[0] === name
  })
  if (matchedSetting) {
    return matchedSetting[1].component
  }
  return SettingsComponents.Settings.component
}

type UserSettingsProps = {
  SettingsComponents: SettingsComponentType
}

const UserSettings = ({ SettingsComponents }: UserSettingsProps) => {
  const location = useLocation()
  const queryParams = queryString.parse(location.search)

  const CurrentSetting = getComponent({
    name: (queryParams['global-settings'] || '') as string,
    SettingsComponents,
  })
  const name = getName({ CurrentSetting, SettingsComponents })
  return (
    <Grid container direction="column" className="w-full h-full" wrap="nowrap">
      <Grid item className="w-full p-3">
        <Grid container direction="row" alignItems="center">
          <Grid item>
            <Button
              component={Link as any}
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
        <SuspenseWrapper>
          <CurrentSetting SettingsComponents={SettingsComponents} />
        </SuspenseWrapper>
      </Grid>
    </Grid>
  )
}

export default UserSettings
