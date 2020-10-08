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
  return user
    .get('user')
    .get('preferences')
    .get('timeZone') as string
}

export const getDateFormat = () => {
  return user
    .get('user')
    .get('preferences')
    .get('dateTimeFormat')['datetimefmt'] as string
}

// @ts-ignore Can't find type declarations, but they exist
import moment from 'moment-timezone'
import { MuiOutlinedInputBorderClasses } from '../theme/theme'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'

/**
 *
 */
export const formatDate = (date: Date) => {
  try {
    let momentShiftedDate = moment.utc(date.toUTCString())
    const utcOffsetMinutesLocal = new Date().getTimezoneOffset()
    const utcOffsetMinutesTimezone = moment.tz(getTimeZone()).utcOffset()
    const totalOffset = utcOffsetMinutesLocal + utcOffsetMinutesTimezone
    momentShiftedDate.subtract(totalOffset, 'minutes')
    console.log(`offset: ${totalOffset}`)
    return user.getUserReadableDateTime(momentShiftedDate.toISOString())
  } catch (err) {
    return ''
  }
}

export const parseDate = (input?: string) => {
  try {
    console.log(`parseDate: ${input}`)
    const timeZone = getTimeZone()
    const format = getDateFormat()
    if (!input) {
      return null
    }
    const date = moment.tz(input, timeZone)
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
window.moment = moment
window.getTimeZone = getTimeZone
window.getDateFormat = getDateFormat

export const DateField = ({ value, onChange, BPDateProps }: DateFieldProps) => {
  const { listenTo } = useBackbone()
  const [forceRender, setForceRender] = React.useState(Math.random())
  React.useEffect(() => {
    validateShape({ onChange, value })
  }, [])
  let shiftedDate = value
  React.useEffect(() => {
    listenTo(
      user.getPreferences(),
      'change:dateTimeFormat change:timeZone',
      () => {
        setForceRender(Math.random())
      }
    )
  }, [])
  try {
    /**
     * The datepicker from blueprint doesn't handle timezones.  So if we want to make it feel like the user is in their
     * chosen timezone, we have to shift the date ourselves.  So what we do is
     */
    let momentShiftedDate = moment.tz(value, getTimeZone())
    const utcOffsetMinutesLocal = new Date().getTimezoneOffset()
    const utcOffsetMinutesTimezone = moment.tz(getTimeZone()).utcOffset()
    const totalOffset = utcOffsetMinutesLocal + utcOffsetMinutesTimezone
    console.log(`offset: ${totalOffset}`)
    shiftedDate = momentShiftedDate
      .add(totalOffset, 'minutes')
      .toDate()
      .toISOString()
  } catch (err) {}

  console.log(`compare: ${value} : ${shiftedDate}`)
  return (
    <>
      <DateInput
        className={MuiOutlinedInputBorderClasses}
        closeOnSelection={false}
        fill
        formatDate={formatDate}
        onChange={(selectedDate, isUserChange) => {
          console.log(`onchange: ${isUserChange}`)
          if (onChange && selectedDate && isUserChange) {
            const utcOffsetMinutesLocal = new Date().getTimezoneOffset()
            const utcOffsetMinutesTimezone = moment
              .tz(getTimeZone())
              .utcOffset()
            const totalOffset = utcOffsetMinutesLocal + utcOffsetMinutesTimezone
            let momentShiftedDate = moment.tz(
              selectedDate.toISOString(),
              getTimeZone()
            )
            onChange(
              momentShiftedDate
                .subtract(totalOffset, 'minutes')
                .toDate()
                .toISOString()
            )
          }
        }}
        parseDate={parseDate}
        placeholder={'M/D/YYYY'}
        shortcuts
        timePrecision="minute"
        {...(value
          ? {
              value: new Date(shiftedDate || ''),
            }
          : {})}
        {...BPDateProps}
      />
      <div>{value}</div>
      <div>{shiftedDate}</div>
      <div>{getDateFormat()}</div>
      <div>{getTimeZone()}</div>
    </>
  )
}
