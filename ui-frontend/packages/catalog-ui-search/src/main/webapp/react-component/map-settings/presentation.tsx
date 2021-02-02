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
import Enum from '../enum'
import ExampleCoordinates from './example-coordinates'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'

type Props = {
  coordFormat: string
  updateCoordFormat: (selected: string) => void
  panOnSearch: boolean
  updatePanOnSearch:
    | ((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void)
    | undefined
}

const Root = styled.div`
  overflow: auto;
  min-width: ${(props) => props.theme.minimumScreenSize};
  padding: ${(props) => props.theme.minimumSpacing};
`

const render = (props: Props) => {
  const {
    coordFormat,
    updateCoordFormat,
    panOnSearch,
    updatePanOnSearch,
  } = props
  return (
    <Root>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={panOnSearch}
              onChange={updatePanOnSearch}
              color="primary"
              name="panOnSearch"
            />
          }
          label={<Typography variant="body2">Auto-Pan</Typography>}
          labelPlacement="start"
          style={{ paddingLeft: '10px' }}
        />
      </FormGroup>

      <div style={{ marginLeft: '-14px' }}>
        <Enum
          options={[
            { label: 'Degrees, Minutes, Seconds', value: 'degrees' },
            { label: 'Decimal', value: 'decimal' },
            { label: 'MGRS', value: 'mgrs' },
            { label: 'UTM/UPS', value: 'utm' },
          ]}
          value={coordFormat}
          label="Coordinate Format"
          onChange={updateCoordFormat}
        />
      </div>

      <ExampleCoordinates selected={coordFormat} />
    </Root>
  )
}

export default hot(module)(render)
export const testComponent = render
