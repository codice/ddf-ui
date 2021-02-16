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
import { DateHelpers, DefaultMaxDate, DefaultMinDate } from './date-helpers'
import { ValueTypes } from '../filter-builder/filter.structure'
import { MuiOutlinedInputBorderClasses } from '../theme/theme'
import useTimePrefs from './useTimePrefs'

type Props = {
  value: ValueTypes['during']
  onChange: (value: ValueTypes['during']) => void
  /**
   * Override if you absolutely must
   */
  BPDateRangeProps?: Partial<IDateRangeInputProps>
}

const validateShape = ({ value, onChange }: Props) => {
  if (
    value === undefined ||
    value.start === undefined ||
    value.end === undefined
  ) {
    const start = new Date()
    start.setDate(start.getDate() - 1) // start and end can't be equal or the backend will throw a fit
    onChange({
      start: start.toISOString(),
      end: new Date().toISOString(),
    })
  }
}

export const DateRangeField = ({
  value,
  onChange,
  BPDateRangeProps,
}: Props) => {
  useTimePrefs()
  React.useEffect(() => {
    validateShape({ value, onChange, BPDateRangeProps })
  }, [])
  return (
    <DateRangeInput
      allowSingleDayRange
      minDate={DefaultMinDate}
      maxDate={DefaultMaxDate}
      endInputProps={{
        fill: true,
        className: MuiOutlinedInputBorderClasses,
      }}
      startInputProps={{
        fill: true,
        className: MuiOutlinedInputBorderClasses,
      }}
      className="where"
      closeOnSelection={false}
      formatDate={DateHelpers.Blueprint.commonProps.formatDate}
      onChange={DateHelpers.Blueprint.DateRangeProps.generateOnChange(onChange)}
      parseDate={DateHelpers.Blueprint.commonProps.parseDate}
      shortcuts
      timePrecision="millisecond"
      {...(value
        ? {
            value: DateHelpers.Blueprint.DateRangeProps.generateValue(value),
          }
        : {})}
      {...BPDateRangeProps}
    />
  )
}
