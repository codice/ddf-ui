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
import { DateHelpers } from './date-helpers'
import { MuiOutlinedInputBorderClasses } from '../theme/theme'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'

type DateFieldProps = {
  value: string
  onChange: (value: string) => void
  /**
   * Override if you absolutely must
   */
  BPDateProps?: IDateInputProps
}

const validateShape = ({ value, onChange }: DateFieldProps) => {
  if (DateHelpers.Blueprint.commonProps.parseDate(value) === null) {
    onChange(new Date().toISOString())
  }
}

export const DateField = ({ value, onChange, BPDateProps }: DateFieldProps) => {
  const { listenTo } = useBackbone()
  const [forceRender, setForceRender] = React.useState(Math.random())
  React.useEffect(() => {
    validateShape({ onChange, value })
  }, [])
  React.useEffect(() => {
    listenTo(
      user.getPreferences(),
      'change:dateTimeFormat change:timeZone',
      () => {
        setForceRender(Math.random())
      }
    )
  }, [])

  return (
    <>
      <DateInput
        className={MuiOutlinedInputBorderClasses}
        closeOnSelection={false}
        fill
        formatDate={DateHelpers.Blueprint.commonProps.formatDate}
        onChange={DateHelpers.Blueprint.DateProps.generateOnChange(onChange)}
        parseDate={DateHelpers.Blueprint.commonProps.parseDate}
        placeholder={'M/D/YYYY'}
        shortcuts
        timePrecision="minute"
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
