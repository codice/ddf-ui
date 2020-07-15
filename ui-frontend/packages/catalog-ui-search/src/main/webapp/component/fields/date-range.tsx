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
import { DateRangeInput, IDateRangeInputProps } from '@blueprintjs/datetime'
import { formatDate, parseDate } from './date'
import moment from 'moment-timezone'

export const serialize = (value: DateRangeValueType) => {
  const from = moment(value.start)
  const to = moment(value.end)
  if (from.isAfter(to)) {
    return (to.toISOString() || '') + '/' + (from.toISOString() || '')
  }
  return (from.toISOString() || '') + '/' + (to.toISOString() || '')
}

export const deserialize = (value: string): DateRangeValueType => {
  if (value.includes('/')) {
    const [start, end] = value.split('/') as [string, string]
    return {
      start,
      end,
    }
  }
  return {
    start: '',
    end: '',
  }
}

export type DateRangeValueType = {
  start: string
  end: string
}

type Props = {
  value?: DateRangeValueType
  onChange?: (value: DateRangeValueType) => void
  /**
   * Override if you absolutely must
   */
  BPDateRangeProps?: IDateRangeInputProps
}

export const DateRangeField = ({
  value,
  onChange,
  BPDateRangeProps,
}: Props) => {
  return (
    <DateRangeInput
      allowSingleDayRange
      endInputProps={{
        fill: true,
        className:
          'MuiOutlinedInput-root MuiOutlinedInput-multiline MuiOutlinedInput-notchedOutline border',
      }}
      startInputProps={{
        fill: true,
        className:
          'MuiOutlinedInput-root MuiOutlinedInput-multiline MuiOutlinedInput-notchedOutline border',
      }}
      className="where"
      closeOnSelection={false}
      formatDate={formatDate}
      onChange={([start, end]) => {
        if (onChange) {
          onChange({
            start: start ? start.toISOString() : '',
            end: end ? end.toISOString() : '',
          })
        }
      }}
      parseDate={parseDate}
      shortcuts
      timePrecision="minute"
      {...(value
        ? {
            value: [new Date(value.start), new Date(value.end)],
          }
        : {})}
      {...BPDateRangeProps}
    />
  )
}
