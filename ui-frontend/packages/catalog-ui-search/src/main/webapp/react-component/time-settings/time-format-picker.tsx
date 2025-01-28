import * as React from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { TimeFormat } from './types'

type Props = {
  timeFormat: string
  handleTimeFormatUpdate: (timeFormat: TimeFormat) => any
}

const timeFormats = [
  {
    label: 'ISO 8601',
    value: 'ISO',
  },
  {
    label: '24 Hour Standard',
    value: '24',
  },
  {
    label: '12 Hour Standard',
    value: '12',
  },
] as TimeFormat[]

const TimeFormatSelector = (props: Props) => {
  const initState = timeFormats.find((tf) => tf.value === props.timeFormat)

  const [currentTimeFormat, setCurrentTimeFormat] = React.useState(initState)

  return (
    <div>
      <Autocomplete
        id="time-format-picker"
        disableClearable={true}
        autoComplete={true}
        size={'small'}
        onChange={(_event: any, newTimeFormat: TimeFormat) => {
          props.handleTimeFormatUpdate(newTimeFormat)
          setCurrentTimeFormat(newTimeFormat)
        }}
        isOptionEqualToValue={(option: TimeFormat, value: TimeFormat) => {
          return option.value === value.value
        }}
        options={timeFormats}
        getOptionLabel={(format) => format.label}
        style={{ width: '100%', paddingTop: '2em' }}
        renderInput={(params) => (
          <TextField {...params} label="Time Format" variant="outlined" />
        )}
        value={currentTimeFormat}
      />
    </div>
  )
}

export default TimeFormatSelector
