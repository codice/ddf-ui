import * as React from 'react'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { NumberField } from './number'
import { ValueTypes } from '../filter-builder/filter.structure'

type Props = {
  value: ValueTypes['relative']
  onChange: (val: ValueTypes['relative']) => void
}

const defaultValue = {
  last: '1',
  unit: 'm',
} as ValueTypes['relative']

const validateShape = ({ value, onChange }: Props) => {
  if (isInvalid({ value, onChange })) {
    onChange(defaultValue)
  }
}

const isInvalid = ({ value }: Props) => {
  return value.last === undefined || value.unit === undefined
}

export const DateRelativeField = ({ value, onChange }: Props) => {
  const validValue = {
    ...defaultValue,
    ...value,
  }
  React.useEffect(() => {
    validateShape({ value, onChange })
  }, [])
  if (isInvalid({ value, onChange })) {
    // for most cases it doesn't matter if we render with invalid, but the select will immediately cause onChange which has some weird side effects
    return null
  }
  return (
    <Grid container direction="row" className="w-full">
      <Grid item xs={4}>
        <NumberField
          type="float"
          onChange={(val) => {
            if (onChange)
              onChange({
                ...validValue,
                last: val.toString(),
              })
          }}
          validation={(val) => val > 0}
          validationText="Must be greater than 0, using previous value of "
          value={validValue.last}
        />
      </Grid>
      <Grid item xs={8} className="pl-2">
        <TextField
          fullWidth
          variant="outlined"
          select
          onChange={(e) => {
            if (onChange)
              onChange({
                ...validValue,
                unit: e.target.value as ValueTypes['relative']['unit'],
              })
          }}
          size="small"
          value={validValue.unit}
        >
          <MenuItem value="s">Seconds</MenuItem>
          <MenuItem value="m">Minutes</MenuItem>
          <MenuItem value="h">Hours</MenuItem>
          <MenuItem value="d">Days</MenuItem>
          <MenuItem value="w">Weeks</MenuItem>
          <MenuItem value="M">Months</MenuItem>
          <MenuItem value="y">Years</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  )
}
