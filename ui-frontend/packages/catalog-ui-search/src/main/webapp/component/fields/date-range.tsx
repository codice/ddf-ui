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
import FormHelperText from '@mui/material/FormHelperText'
import LinearProgress from '@mui/material/LinearProgress'

type Props = {
  value: ValueTypes['during']
  onChange: (value: ValueTypes['during']) => void
  /**
   * Override if you absolutely must
   */
  BPDateRangeProps?: Partial<IDateRangeInputProps>
}

export function defaultValue() {
  const end = DateHelpers.General.withPrecision(new Date())
  const start = DateHelpers.General.withPrecision(
    new Date(end.valueOf() - 86_400_000)
  ) // start and end can't be equal or the backend will throw a fit
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

/**
 *  Used in the below components to test values for validity and to provide a message to the user if they are invalid.
 */
function isValidValue(value: Props['value']): {
  valid: boolean
  message: string
} {
  if (value && value.start && value.end) {
    // end has to be after start too, so convert from iso and check
    const startDate = new Date(value.start)
    const endDate = new Date(value.end)
    return {
      valid: startDate < endDate,
      message:
        'Start date must be before end date, using previous valid values:',
    }
  } else {
    return {
      valid: false,
      message: 'Start and end date must be set, using previous valid values:',
    }
  }
}

/**
 *  There are two things to check before passing values upwards to parent components through the onChange.
 *  1.  Start and end date need to be valid dates.
 *  2.  Start date must be before end date. (cannot be equal either)
 *
 *  Given those possibilities, we can construct a message to try and prod the user as to why a value is invalid.
 */
function useLocalValue({ value, onChange }: Props) {
  const [localValue, setLocalValue] = React.useState<Props['value']>(value) // since we don't get here with an invalid value, we can just set it to the value
  const [hasValidationIssues, setHasValidationIssues] = React.useState(false)
  const [constructedValidationText, setConstructedValidationText] =
    React.useState<React.ReactNode>(null)

  React.useEffect(() => {
    const validity = isValidValue(localValue)
    if (onChange && validity.valid) {
      setHasValidationIssues(false)
      setConstructedValidationText('')
      if (value !== localValue) onChange(localValue)
    } else {
      setConstructedValidationText(
        <>
          <div>{validity.message}</div>
          <div>start: {value.start}</div>
          <div>end: {value.end}</div>
        </>
      )
      setHasValidationIssues(true)
    }
  }, [localValue, value])

  return {
    localValue,
    setLocalValue,
    hasValidationIssues,
    constructedValidationText,
  }
}

/**
 *  If the initial value is invalid, we immediately call the onChange to make sure we start with a valid value.
 */
function useInitialValueValidation({ value, onChange }: Props) {
  React.useEffect(() => {
    if (!isValidValue(value).valid) {
      onChange(defaultValue())
    }
  }, [])
}

/**
 *  This component will always have a valid value (start and end date set and start < end), and onChange will never get an invalid value
 */
const DateRangeFieldWithoutInitialValidation = ({
  value,
  onChange,
  BPDateRangeProps,
}: Props) => {
  const {
    localValue,
    setLocalValue,
    hasValidationIssues,
    constructedValidationText,
  } = useLocalValue({ value, onChange })
  useTimePrefs(() => {
    const shiftedDates =
      DateHelpers.Blueprint.DateRangeProps.generateValue(value) // as said above, this will always be valid, so no need to fret on converting
    setLocalValue({
      start: DateHelpers.Blueprint.converters
        .UntimeshiftFromDatePicker(shiftedDates![0]!)
        .toISOString(),
      end: DateHelpers.Blueprint.converters
        .UntimeshiftFromDatePicker(shiftedDates![1]!)
        .toISOString(),
    })
  })
  return (
    <>
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
            setLocalValue(value)
          }
        )}
        popoverProps={{
          boundary: 'viewport',
          position: 'bottom',
        }}
        parseDate={DateHelpers.Blueprint.commonProps.parseDate}
        shortcuts
        timePrecision={DateHelpers.General.getTimePrecision()}
        placeholder={DateHelpers.General.getDateFormat()}
        value={DateHelpers.Blueprint.DateRangeProps.generateValue(localValue)}
        {...BPDateRangeProps}
      />
      {hasValidationIssues ? (
        <>
          <FormHelperText className="px-2 Mui-text-error">
            {constructedValidationText}
          </FormHelperText>
        </>
      ) : null}
    </>
  )
}

/**
 *  By updating invalid starting values before we go into the above component, we can make sure we always have a valid value to fall back to.
 */
export const DateRangeField = ({
  value,
  onChange,
  BPDateRangeProps,
}: Props) => {
  useInitialValueValidation({ value, onChange, BPDateRangeProps })
  const valueValidity = isValidValue(value)
  if (!valueValidity.valid) {
    return <LinearProgress className="w-full h-2" />
  }
  return (
    <DateRangeFieldWithoutInitialValidation
      value={value}
      onChange={onChange}
      BPDateRangeProps={BPDateRangeProps}
    />
  )
}
