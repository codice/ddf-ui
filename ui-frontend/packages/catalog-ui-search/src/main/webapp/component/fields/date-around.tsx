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
import { DateHelpers, DefaultMaxDate, DefaultMinDate } from './date-helpers'
import { MuiOutlinedInputBorderClasses } from '../theme/theme'
import useTimePrefs from './useTimePrefs'
import { ValueTypes } from '../filter-builder/filter.structure'
import Grid from '@mui/material/Grid/Grid'
import { NumberField } from './number'
import TextField from '@mui/material/TextField/TextField'
import MenuItem from '@mui/material/MenuItem/MenuItem'

import user from '../singletons/user-instance'
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit'

type DateAroundProps = {
  value: ValueTypes['around']
  onChange: (val: ValueTypes['around']) => void
}

const defaultValue = () => {
  return {
    date: new Date().toISOString(),
    buffer: {
      amount: '1',
      unit: 'd',
    },
    direction: 'both',
  } as ValueTypes['around']
}

const validateDate = (
  { value, onChange }: DateAroundProps,
  dateRef: React.MutableRefObject<string>
) => {
  if (
    !value.date ||
    !value.buffer ||
    !value.direction ||
    DateHelpers.Blueprint.commonProps.parseDate(value.date) === null
  ) {
    const newDate = DateHelpers.General.withPrecision(new Date())
    dateRef.current = newDate.toISOString()
    onChange({ ...defaultValue(), date: newDate.toISOString() })
  }
}

export const DateAroundField = ({ value, onChange }: DateAroundProps) => {
  const dateRef = React.useRef(value.date)

  useTimePrefs(() => {
    const shiftedDate = DateHelpers.Blueprint.DateProps.generateValue(
      dateRef.current
    )
    const unshiftedDate =
      DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(shiftedDate)
    dateRef.current = unshiftedDate.toISOString()
    onChange({
      ...defaultValue(),
      ...value,
      date: unshiftedDate.toISOString(),
    })
  })

  React.useEffect(() => {
    validateDate({ onChange, value }, dateRef)
  }, [])

  return (
    <Grid container alignItems="stretch" direction="column" wrap="nowrap">
      <Grid item className="w-full pb-2">
        <DateInput
          timePickerProps={{
            useAmPm: user.getAmPmDisplay(),
          }}
          className={MuiOutlinedInputBorderClasses}
          minDate={DefaultMinDate}
          maxDate={DefaultMaxDate}
          closeOnSelection={false}
          fill
          formatDate={DateHelpers.Blueprint.commonProps.formatDate}
          onChange={DateHelpers.Blueprint.DateProps.generateOnChange((date) => {
            dateRef.current = date
            onChange({
              ...defaultValue(),
              ...value,
              date,
            })
          })}
          parseDate={DateHelpers.Blueprint.commonProps.parseDate}
          placeholder={DateHelpers.General.getDateFormat()}
          shortcuts
          timePrecision={DateHelpers.General.getTimePrecision()}
          inputProps={{
            ...EnterKeySubmitProps,
          }}
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
                  ...defaultValue(),
                  ...value,
                  buffer: {
                    ...defaultValue().buffer,
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
                  ...defaultValue(),
                  ...value,
                  buffer: {
                    ...defaultValue().buffer,
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
      <TextField
        variant="outlined"
        select
        value={value.direction || 'both'}
        onChange={(e) => {
          if (onChange)
            onChange({
              ...defaultValue(),
              ...value,
              direction: e.target.value as ValueTypes['around']['direction'],
            })
        }}
        size="small"
      >
        <MenuItem value="both">Before and After</MenuItem>
        <MenuItem value="before">Before</MenuItem>
        <MenuItem value="after">After</MenuItem>
      </TextField>
    </Grid>
  )
}
