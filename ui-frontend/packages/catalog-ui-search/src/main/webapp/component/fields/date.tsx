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

import {
  DateHelpers,
  DefaultMaxDate,
  DefaultMinDate,
  ISO_8601_FORMAT_ZONED,
} from './date-helpers'
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
  isNullable?: boolean
}

const validateDate = (
  { value, onChange, isNullable }: DateFieldProps,
  valueRef: React.MutableRefObject<string>
) => {
  if (value === null && isNullable) return

  const date = moment(value, ISO_8601_FORMAT_ZONED)
  if (!date.isValid()) {
    const newDate = DateHelpers.General.withPrecision(new Date())
    valueRef.current = newDate.toISOString()
    onChange(newDate.toISOString())
  }
}

export const DateField = ({ value, onChange, BPDateProps, isNullable }: DateFieldProps) => {
  const valueRef = useRef(value)
  const blueprintDateRef = useRef<DateInput>(null)

  useTimePrefs(() => {
    const shiftedDate = DateHelpers.Blueprint.DateProps.generateValue(
      valueRef.current
    )
    const unshiftedDate =
      DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(shiftedDate)
    onChange(unshiftedDate.toISOString())
  })
  React.useEffect(() => {
    validateDate({ onChange, value, isNullable }, valueRef)
  }, [])

  return (
    <>
      <DateInput
        ref={blueprintDateRef}
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
          onClose: () => {
            setTimeout(() => {
              blueprintDateRef.current?.setState({ isOpen: false })
            }, 0)
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
