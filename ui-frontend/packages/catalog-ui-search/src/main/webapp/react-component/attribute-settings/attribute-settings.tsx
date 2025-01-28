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
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import styled from 'styled-components'

const Root = styled.div`
  overflow: hidden;
  padding: ${(props) => props.theme.minimumSpacing};
`

type PrecisionOption = {
  label: string
  value: number
}

const Options = [
  {
    label: 'Default',
    value: undefined,
  },
  {
    label: 'One',
    value: 1,
  },
  {
    label: 'Two',
    value: 2,
  },
  {
    label: 'Three',
    value: 3,
  },
  {
    label: 'Four',
    value: 4,
  },
  {
    label: 'Five',
    value: 5,
  },
  {
    label: 'Six',
    value: 6,
  },
  {
    label: 'Seven',
    value: 7,
  },
  {
    label: 'Eight',
    value: 8,
  },
  {
    label: 'Nine',
    value: 9,
  },
  {
    label: 'Ten',
    value: 10,
  },
] as PrecisionOption[]

const getDecimalPrecision = () => {
  return user.get('user').get('preferences').get('decimalPrecision') as number
}

const AttributeSettings = () => {
  const initState = Options.find(
    (option) => option.value === getDecimalPrecision()
  )
  const [decimalPrecision, setDecimalPrecision] = React.useState(initState)

  return (
    <Root>
      <Autocomplete
        id="decimal-precision-picker"
        disableClearable={true}
        autoComplete={true}
        size={'small'}
        onChange={(_event: any, newPrecision: PrecisionOption) => {
          setDecimalPrecision(newPrecision)
          user.getPreferences().set({
            decimalPrecision: newPrecision.value,
          })
        }}
        isOptionEqualToValue={(option, value) => {
          return option.value === value.value
        }}
        options={Options}
        getOptionLabel={(option) => option.label}
        style={{ width: '100%', paddingTop: '2em' }}
        renderInput={(params) => (
          <TextField {...params} label="Decimal Precision" variant="outlined" />
        )}
        value={decimalPrecision}
      />
    </Root>
  )
}
export default AttributeSettings
