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
import styled from 'styled-components'
import { hot } from 'react-hot-loader'
import ExampleCoordinates from './example-coordinates'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

type Props = {
  coordFormat: string
  updateCoordFormat: (selected: string) => void
  autoPan: boolean
  updateAutoPan: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLButtonElement>,
    checked: boolean
  ) => void
}

const Root = styled.div`
  overflow: auto;
  min-width: ${(props) => props.theme.minimumScreenSize};
  padding: ${(props) => props.theme.minimumSpacing};
`

const coordinateFormatOptions = [
  { label: 'Degrees, Minutes, Seconds', value: 'degrees' },
  { label: 'Decimal', value: 'decimal' },
  { label: 'MGRS', value: 'mgrs' },
  { label: 'UTM/UPS', value: 'utm' },
  { label: 'Well Known Text', value: 'wkt' },
]

const render = ({
  coordFormat,
  updateCoordFormat,
  autoPan,
  updateAutoPan,
}: Props) => {
  return (
    <Root>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              id="auto-pan-checkbox"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  updateAutoPan(e, !autoPan)
                }
              }}
              checked={autoPan}
              onChange={updateAutoPan}
              color="primary"
              name="autoPan"
            />
          }
          label={<Typography variant="body2">Auto-Pan</Typography>}
          labelPlacement="start"
          style={{ paddingLeft: '10px' }}
        />
      </FormGroup>

      <div style={{ padding: '0 10px' }}>
        <Typography variant="body2">Coordinate Format</Typography>
        <Select
          id="coordinate-format-select"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateCoordFormat(event.target.value)
          }}
          value={coordFormat}
          variant="outlined"
          margin="dense"
          fullWidth
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
          }}
        >
          {coordinateFormatOptions.map((option) => {
            return (
              <MenuItem key={option.value} value={option.value}>
                <Typography variant="subtitle2">{option.label}</Typography>
              </MenuItem>
            )
          })}
        </Select>
      </div>

      <ExampleCoordinates selected={coordFormat} />
    </Root>
  )
}

export default hot(module)(render)
export const testComponent = render
