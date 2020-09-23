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
import { DateInput, IDateInputProps } from '@blueprintjs/datetime'

// @ts-ignore ts-migrate(7016) FIXME: Could not find a declaration file for module '../s... Remove this comment to see the full error message
import user from '../singletons/user-instance'

export const getTimeZone = () => {
  return user.get('user').get('preferences').get('timeZone') as string
}

export const getDateFormat = () => {
  return user.get('user').get('preferences').get('dateTimeFormat')[
    'datetimefmt'
  ] as string
}

// @ts-ignore Can't find type declarations, but they exist
import moment from 'moment-timezone'
import { MuiOutlinedInputBorderClasses } from '../theme/theme'

/**
 * No need to convert timezone since we are already doing it in parseDate
 */
export const formatDate = (date: Date) => {
  const momentDate = moment(date)
  const format = getDateFormat()
  if (!momentDate.isValid()) {
    return ''
  }
  return momentDate.format(format)
}

export const parseDate = (input?: string) => {
  try {
    const timeZone = getTimeZone()
    const format = getDateFormat()
    if (!input) {
      return null
    }
    const date = moment.tz(
      input.substring(0, input.length - 1),
      format,
      timeZone
    )
    if (date.isValid()) {
      return moment.tz(input, format, timeZone).toDate()
    }
    return null
  } catch (err) {
    return null
  }
}

type DateFieldProps = {
  value: string
  onChange: (value: string) => void
  /**
   * Override if you absolutely must
   */
  BPDateProps?: IDateInputProps
}

const validateShape = ({ value, onChange }: DateFieldProps) => {
  if (parseDate(value) === null) {
    onChange(new Date().toISOString())
  }
}

export const DateField = ({ value, onChange, BPDateProps }: DateFieldProps) => {
  React.useEffect(() => {
    validateShape({ onChange, value })
  }, [])
  return (
    <DateInput
      className={MuiOutlinedInputBorderClasses}
      closeOnSelection={false}
      fill
      formatDate={formatDate}
      onChange={(selectedDate, isUserChange) => {
        if (onChange && selectedDate && isUserChange)
          onChange(selectedDate.toISOString())
      }}
      parseDate={parseDate}
      placeholder={'M/D/YYYY'}
      shortcuts
      timePrecision="minute"
      {...(value
        ? {
            value: new Date(value || ''),
          }
        : {})}
      {...BPDateProps}
    />
  )
}
