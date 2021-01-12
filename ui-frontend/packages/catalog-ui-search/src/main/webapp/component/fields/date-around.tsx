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
import { DateInput } from '@blueprintjs/datetime'

// @ts-ignore ts-migrate(7016) FIXME: Could not find a declaration file for module '../s... Remove this comment to see the full error message
import user from '../singletons/user-instance'
import { DateHelpers, DefaultMaxDate, DefaultMinDate } from './date-helpers'
import { MuiOutlinedInputBorderClasses } from '../theme/theme'
import useTimePrefs from './useTimePrefs'
import { ValueTypes } from '../filter-builder/filter.structure'
import Grid from '@material-ui/core/Grid/Grid'
import { NumberField } from './number'
import TextField from '@material-ui/core/TextField/TextField'
import MenuItem from '@material-ui/core/MenuItem/MenuItem'

type DateAroundProps = {
  value: ValueTypes['around']
  onChange: (val: ValueTypes['around']) => void
}

const defaultValue = {
  date: new Date().toISOString(),
  buffer: {
    amount: '1',
    unit: 'd',
  },
} as ValueTypes['around']

const validateShape = ({ value, onChange }: DateAroundProps) => {
  if (
    !value.date ||
    !value.buffer ||
    DateHelpers.Blueprint.commonProps.parseDate(value.date) === null
  ) {
    onChange(defaultValue)
  }
}

export const DateAroundField = ({ value, onChange }: DateAroundProps) => {
  const [date, setDate] = React.useState(new Date().toISOString())

  useTimePrefs()
  React.useEffect(() => {
    validateShape({ onChange, value })
  }, [])
  React.useEffect(() => {
    onChange({
      ...defaultValue,
      ...value,
      date: date,
    })
  }, [date])

  return (
    <Grid container alignItems="stretch" direction="column" wrap="nowrap">
      <Grid item className="w-full pb-2">
        <DateInput
          className={MuiOutlinedInputBorderClasses}
          minDate={DefaultMinDate}
          maxDate={DefaultMaxDate}
          closeOnSelection={false}
          fill
          formatDate={DateHelpers.Blueprint.commonProps.formatDate}
          onChange={DateHelpers.Blueprint.DateProps.generateOnChange(setDate)}
          parseDate={DateHelpers.Blueprint.commonProps.parseDate}
          placeholder={'M/D/YYYY'}
          shortcuts
          timePrecision="millisecond"
          {...(value.date
            ? {
                value: DateHelpers.Blueprint.DateProps.generateValue(
                  value.date
                ),
              }
            : {})}
        />
      </Grid>
      <Grid item className="w-full pb-2">
        with buffer of
      </Grid>
      <Grid container direction="row" className="w-full">
        <Grid item xs={4} className="pb-2">
          <NumberField
            type="float"
            onChange={(val) => {
              if (onChange)
                onChange({
                  ...defaultValue,
                  ...value,
                  buffer: {
                    ...defaultValue.buffer,
                    ...value.buffer,
                    amount: val,
                  },
                })
            }}
            {...(value.buffer
              ? {
                  value: value.buffer.amount,
                }
              : {})}
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
                  ...defaultValue,
                  ...value,
                  buffer: {
                    ...defaultValue.buffer,
                    ...value.buffer,
                    unit: e.target
                      .value as ValueTypes['around']['buffer']['unit'],
                  },
                })
            }}
            size="small"
            {...(value.buffer
              ? {
                  value: value.buffer.unit,
                }
              : { value: 'd' })}
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
    </Grid>
  )
}
