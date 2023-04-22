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
import { useRef } from 'react'
import { DateInput, IDateInputProps } from '@blueprintjs/datetime'

import { DateHelpers, DefaultMaxDate, DefaultMinDate } from './date-helpers'
import { MuiOutlinedInputBorderClasses } from '../theme/theme'
import useTimePrefs from './useTimePrefs'

import user from '../singletons/user-instance'
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit'

import moment from 'moment-timezone'

type DateFieldProps = {
  value: string
  onChange: (value: string) => void
  /**
   * Override if you absolutely must
   */
  BPDateProps?: Partial<IDateInputProps>
}

const validateDate = (
  { value, onChange }: DateFieldProps,
  valueRef: React.MutableRefObject<string>
) => {
  //console.log('validating', value, DateHelpers.General.getDateFormat())
  const date = moment(value, DateHelpers.General.getDateFormat())
  if (!date.isValid()) {
    //console.log('INVALID DATE', value, DateHelpers.General.getDateFormat())
    const newDate = new Date()
    switch (DateHelpers.General.getTimePrecision()) {
      case 'minute':
        newDate.setUTCSeconds(0)
      // Intentional fall-through
      case 'second':
        newDate.setUTCMilliseconds(0)
    }
    valueRef.current = newDate.toISOString()
    onChange(newDate.toISOString())
  }
}

export const DateField = ({ value, onChange, BPDateProps }: DateFieldProps) => {
  //console.log('DateField', value)

  const valueRef = useRef(value)

  useTimePrefs(() => {
    const shiftedDate = DateHelpers.Blueprint.DateProps.generateValue(
      valueRef.current
    )
    const unshiftedDate =
      DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(shiftedDate)
    onChange(unshiftedDate.toISOString())
  })
  React.useEffect(() => {
    //console.log('RUNNING DateField EFFECT')
    validateDate({ onChange, value }, valueRef)
  }, [])

  return (
    <>
      <DateInput
        className={MuiOutlinedInputBorderClasses}
        minDate={DefaultMinDate}
        maxDate={DefaultMaxDate}
        closeOnSelection={false}
        fill
        formatDate={DateHelpers.Blueprint.commonProps.formatDate}
        onChange={DateHelpers.Blueprint.DateProps.generateOnChange((value) => {
          valueRef.current = value
          onChange(value)
        })}
        parseDate={DateHelpers.Blueprint.commonProps.parseDate}
        placeholder={DateHelpers.General.getDateFormat()}
        shortcuts
        timePrecision={DateHelpers.General.getTimePrecision()}
        outOfRangeMessage="Out of range"
        timePickerProps={{
          useAmPm: user.getAmPmDisplay(),
        }}
        inputProps={{
          ...EnterKeySubmitProps,
        }}
        popoverProps={{
          modifiers: {
            preventOverflow: { enabled: false },
            hide: { enabled: false },
          },
        }}
        {...(value
          ? {
              value: DateHelpers.Blueprint.DateProps.generateValue(value),
            }
          : {})}
        {...BPDateProps}
      />
    </>
  )
}
