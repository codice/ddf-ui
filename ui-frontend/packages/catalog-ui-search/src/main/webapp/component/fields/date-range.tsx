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

import user from '../singletons/user-instance'
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit'

type Props = {
  value: ValueTypes['during']
  onChange: (value: ValueTypes['during']) => void
  /**
   * Override if you absolutely must
   */
  BPDateRangeProps?: Partial<IDateRangeInputProps>
}

const validateDates = (
  { value, onChange }: Props,
  valueRef: React.MutableRefObject<{ start: string; end: string }>
) => {
  if (
    value === undefined ||
    value.start === undefined ||
    value.end === undefined
  ) {
    const end = new Date()
    const start = new Date(end.valueOf() - 86_400_000) // start and end can't be equal or the backend will throw a fit
    switch (DateHelpers.General.getTimePrecision()) {
      case 'minute':
        start.setUTCSeconds(0)
        end.setUTCSeconds(0)
      // Intentional fall-through
      case 'second':
        start.setUTCMilliseconds(0)
        end.setUTCMilliseconds(0)
    }
    const newValue = {
      start: start.toISOString(),
      end: end.toISOString(),
    }
    valueRef.current = newValue
    onChange(newValue)
  }
}

export const DateRangeField = ({
  value,
  onChange,
  BPDateRangeProps,
}: Props) => {
  const valueRef = React.useRef(value)

  useTimePrefs(() => {
    const shiftedDates = DateHelpers.Blueprint.DateRangeProps.generateValue(
      valueRef.current
    )
    onChange({
      start: DateHelpers.Blueprint.converters
        .UntimeshiftFromDatePicker(shiftedDates![0]!)
        .toISOString(),
      end: DateHelpers.Blueprint.converters
        .UntimeshiftFromDatePicker(shiftedDates![1]!)
        .toISOString(),
    })
  })
  React.useEffect(() => {
    validateDates({ value, onChange, BPDateRangeProps }, valueRef)
  }, [])
  return (
    <DateRangeInput
      timePickerProps={{
        useAmPm: user.getAmPmDisplay(),
      }}
      allowSingleDayRange
      minDate={DefaultMinDate}
      maxDate={DefaultMaxDate}
      endInputProps={{
        fill: true,
        className: MuiOutlinedInputBorderClasses,
        ...EnterKeySubmitProps,
      }}
      startInputProps={{
        fill: true,
        className: MuiOutlinedInputBorderClasses,
        ...EnterKeySubmitProps,
      }}
      className="where"
      closeOnSelection={false}
      formatDate={DateHelpers.Blueprint.commonProps.formatDate}
      onChange={DateHelpers.Blueprint.DateRangeProps.generateOnChange(
        (value) => {
          valueRef.current = value
          onChange(value)
        }
      )}
      parseDate={DateHelpers.Blueprint.commonProps.parseDate}
      shortcuts
      timePrecision={DateHelpers.General.getTimePrecision()}
      placeholder={DateHelpers.General.getDateFormat()}
      {...(value
        ? {
            value: DateHelpers.Blueprint.DateRangeProps.generateValue(value),
          }
        : {})}
      {...BPDateRangeProps}
    />
  )
}
