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
import { hot } from 'react-hot-loader'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import { TimePrecision } from '@blueprintjs/datetime'

type Props = {
  timePrecision: TimePrecision
  handleTimePrecisionUpdate: (timePrecision: TimePrecision) => any
}

type PrecisionOption = {
  label: string,
  value: TimePrecision
}

const Options = [
  {
    label: "Milliseconds",
    value: "millisecond"
  },
  {
    label: "Seconds",
    value: "second"
  },
  {
    label: "Minutes",
    value: "minute"
  }
] as PrecisionOption[]

const TimePrecisionSelector = (props: Props) => {
  const initState = Options.find((option) => option.value === props.timePrecision)

  const [timePrecision, setTimePrecision] = React.useState(initState)

  return (
    <div>
      <Autocomplete
        id="time-precision-picker"
        disableClearable={true}
        autoComplete={true}
        size={'small'}
        onChange={(_event: any, newPrecision: PrecisionOption) => {
          props.handleTimePrecisionUpdate(newPrecision.value)
          setTimePrecision(newPrecision)
        }}
        getOptionSelected={(option, value) => {
          return option.value === value.value
        }}
        options={Options}
        getOptionLabel={(option) => option.label}
        style={{ width: '100%', paddingTop: '2em' }}
        renderInput={(params) => (
          <TextField {...params} label="Time Precision" variant="outlined" />
        )}
        value={timePrecision}
      />
    </div>
  )
}

export default hot(module)(TimePrecisionSelector)
