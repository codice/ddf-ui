import * as React from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import { NumberField } from './number'

export const serialize = ({ last, unit }: DateRelativeValueType) => {
  if (unit === undefined || !parseFloat(last)) {
    return ''
  }
  const prefix = unit === 'm' || unit === 'h' ? 'PT' : 'P'
  return `RELATIVE(${prefix + last + unit.toUpperCase()})`
}

export const deserialize = (value: string): DateRelativeValueType => {
  if (typeof value !== 'string') {
    return {
      last: '1',
      unit: 'm',
    }
  }

  const match = value.match(/RELATIVE\(Z?([A-Z]*)(\d+\.*\d*)(.)\)/)
  if (!match) {
    return {
      last: '1',
      unit: 'm',
    }
  }

  let [, prefix, last, unit] = match
  unit = unit.toLowerCase()
  if (prefix === 'P' && unit === 'm') {
    //must capitalize months
    unit = unit.toUpperCase()
  }

  return {
    last: parseFloat(last).toString(),
    unit,
  }
}

type DateRelativeValueType = {
  last: string
  unit: string
}

type Props = {
  value?: DateRelativeValueType
  onChange?: (val: DateRelativeValueType) => void
}

const defaultValue = {
  last: '1',
  unit: 'm',
} as DateRelativeValueType

export const DateRelativeField = ({ value, onChange }: Props) => {
  return (
    <Grid container direction="column" className="w-full">
      <Grid item className="w-full pb-2 pl-2">
        within the last
      </Grid>
      <Grid item className="w-full pb-2">
        <NumberField
          type="float"
          onChange={val => {
            if (onChange)
              onChange({
                ...defaultValue,
                ...value,
                last: val,
              })
          }}
          {...(value
            ? {
                value: value.last,
              }
            : {})}
        />
      </Grid>
      <Grid item className="w-full">
        <TextField
          fullWidth
          variant="outlined"
          select
          onChange={e => {
            if (onChange)
              onChange({
                ...defaultValue,
                ...value,
                unit: e.target.value,
              })
          }}
          {...(value
            ? {
                value: value.unit,
              }
            : {})}
        >
          <MenuItem value="m">Minutes</MenuItem>
          <MenuItem value="h">Hours</MenuItem>
          <MenuItem value="d">Days</MenuItem>
          <MenuItem value="M">Months</MenuItem>
          <MenuItem value="y">Years</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  )
}
