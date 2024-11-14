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
import user from '../../component/singletons/user-instance'
import QuerySettings from '../../component/query-settings/query-settings'
import { UserQuery } from '../../js/model/TypedQuery'
import styled from 'styled-components'
import { hot } from 'react-hot-loader'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Slider from '@mui/material/Slider'
import Input from '@mui/material/Input'
import Swath from '../../component/swath/swath'
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'
import {
  MuiOutlinedInputBorderClasses,
  Elevations,
} from '../../component/theme/theme'
import Tooltip from '@mui/material/Tooltip'
import Paper from '@mui/material/Paper'
import { useConfiguration } from '../../js/model/Startup/configuration.hooks'
const Root = styled.div`
  overflow: hidden;
  padding: ${(props) => props.theme.minimumSpacing};
`
const getResultCount = () => {
  return user.get('user').get('preferences').get('resultCount') as number
}
const SearchSettings = () => {
  const { config } = useConfiguration()
  const configuredMaxResultCount = config?.resultCount || 250
  const [queryModel] = React.useState(
    UserQuery() // we pass this to query settings
  )
  const [resultCount, setResultCount] = React.useState(getResultCount())
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(user.get('user').get('preferences'), 'change:resultCount', () => {
      setResultCount(getResultCount())
    })
  }, [])
  React.useEffect(() => {
    return () => {
      const { sorts, phonetics, spellcheck, sources } = queryModel.toJSON()
      user.getPreferences().get('querySettings').set({
        sorts,
        phonetics,
        spellcheck,
        sources,
      })
      user.savePreferences()
    }
  }, [])
  return (
    <Root>
      <Tooltip
        placement="right"
        title={
          <Paper elevation={Elevations.overlays} className="p-3">
            <Typography variant="h6">For example:</Typography>
            <Typography>
              Searching 3 data sources with the current setting could return as
              many as {resultCount * 3} results in a single page.
            </Typography>
          </Paper>
        }
      >
        <div>
          <Typography id="resultcount-slider" className="pb-2">
            Results per page per data source
          </Typography>

          <Grid
            className={`w-full ${MuiOutlinedInputBorderClasses}`}
            container
            alignItems="center"
            direction="column"
          >
            <Grid item className="w-full">
              <Input
                fullWidth
                value={resultCount}
                margin="dense"
                onChange={(e) => {
                  user.getPreferences().set({
                    resultCount: Math.min(
                      parseInt(e.target.value),
                      configuredMaxResultCount
                    ),
                  })
                }}
                inputProps={{
                  className: 'text-center',
                  step: 10,
                  min: 1,
                  max: configuredMaxResultCount,
                  type: 'number',
                  'aria-labelledby': 'resultcount-slider',
                }}
              />
            </Grid>
            <Grid item className="w-full px-10">
              <Slider
                value={resultCount}
                onChange={(_e, newValue) => {
                  user.getPreferences().set({
                    resultCount: newValue,
                  })
                }}
                aria-labelledby="input-slider"
                min={1}
                max={configuredMaxResultCount}
                step={10}
                marks={[
                  {
                    value: 1,
                    label: '1',
                  },
                  {
                    value: configuredMaxResultCount,
                    label: `${configuredMaxResultCount}`,
                  },
                ]}
              />
            </Grid>
          </Grid>
        </div>
      </Tooltip>
      <div className="py-5">
        <Swath className="w-full h-1" />
      </div>
      <Typography variant="h5">Defaults for New Searches</Typography>
      <QuerySettings model={queryModel} />
    </Root>
  )
}
export default hot(module)(SearchSettings)
