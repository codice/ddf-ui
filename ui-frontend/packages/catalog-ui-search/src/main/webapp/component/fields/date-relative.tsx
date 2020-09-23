import * as React from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
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
  React.useEffect(() => {
    validateShape({ value, onChange })
  }, [])
  if (isInvalid({ value, onChange })) {
    // for most cases it doesn't matter if we render with invalid, but the select will immediately cause onChange which has some weird side effects
    return null
  }
  return (
    <Grid container direction="column" className="w-full">
      <Grid item className="w-full pb-2 pl-2">
        within the last
      </Grid>
      <Grid item className="w-full pb-2">
        <NumberField
          type="float"
          onChange={(val) => {
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
          onChange={(e) => {
            if (onChange)
              onChange({
                ...defaultValue,
                ...value,
                unit: e.target.value as ValueTypes['relative']['unit'],
              })
          }}
          size="small"
          value={value.unit}
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
