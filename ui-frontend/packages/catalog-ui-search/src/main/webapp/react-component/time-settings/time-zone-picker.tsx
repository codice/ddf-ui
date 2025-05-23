import * as React from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { TimeZone } from './types'

type Props = {
  timeZone: string
  timeZones: TimeZone[]
  handleTimeZoneUpdate: (timeZone: TimeZone) => any
}

const TimeZoneSelector = (props: Props) => {
  const getDefaultTimeZone = (timeZoneName: string) => {
    return props.timeZones.find((zone) => zone.zoneName === timeZoneName)
  }

  let [currentTimeZone, setCurrentTimeZone] = React.useState(
    getDefaultTimeZone(props.timeZone)
  )

  return (
    <div>
      <Autocomplete
        id="time-zone-picker"
        disableClearable={true}
        autoComplete={true}
        size={'small'}
        onChange={(_event: any, newTimeZone: TimeZone) => {
          props.handleTimeZoneUpdate(newTimeZone)
          setCurrentTimeZone(newTimeZone)
        }}
        isOptionEqualToValue={(oldZone: TimeZone, newZone: TimeZone) => {
          return oldZone.zoneName === newZone.zoneName
        }}
        options={props.timeZones}
        getOptionLabel={(zone) =>
          `${zone.zoneName}, ${zone.abbr}, ${zone.offsetAsString}`
        }
        style={{ width: '100%' }}
        renderInput={(params) => (
          <TextField {...params} label="Time Zone" variant="outlined" />
        )}
        value={currentTimeZone}
      />
    </div>
  )
}

export default TimeZoneSelector
