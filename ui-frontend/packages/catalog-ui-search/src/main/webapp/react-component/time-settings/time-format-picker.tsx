import * as React from 'react'
import { hot } from 'react-hot-loader'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { TextField } from '@material-ui/core'
import { TimeFormat } from './types'

const Common = require('../../js/Common')

type Props = {
  timeFormat: string
  handleTimeFormatUpdate: (timeFormat: TimeFormat) => any
}

const timeFormats = [
  {
    label: 'ISO 8601',
    value: Common.getDateTimeFormats()['ISO'],
  },
  {
    label: '24 Hour Standard',
    value: Common.getDateTimeFormats()['24'],
  },
  {
    label: '12 Hour Standard',
    value: Common.getDateTimeFormats()['12'],
  },
] as TimeFormat[]

const TimeFormatSelector = (props: Props) => {
  const getDefaultFormat = (timeFormat: string) => {
    return timeFormats.find(format => format.value.datetimefmt === timeFormat)
  }

  let [currentTimeFormat, setCurrentTimeFormat] = React.useState(
    getDefaultFormat(props.timeFormat)
  )

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
        getOptionSelected={(oldFormat: TimeFormat, newFormat: TimeFormat) => {
          return oldFormat.value.datetimefmt !== newFormat.value.datetimefmt
        }}
        options={timeFormats}
        getOptionLabel={format => `${format.label}`}
        style={{ width: '100%', paddingTop: '2em' }}
        renderInput={params => (
          <TextField {...params} label="Time Format" variant="outlined" />
        )}
        value={currentTimeFormat}
      />
    </div>
  )
}

export default hot(module)(TimeFormatSelector)
