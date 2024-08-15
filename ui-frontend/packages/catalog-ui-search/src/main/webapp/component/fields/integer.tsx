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

import { ValueTypes } from '../filter-builder/filter.structure'
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit'
import { NumberField } from './number'

type IntegerFieldProps = {
  value: ValueTypes['integer']
  onChange: (val: ValueTypes['integer']) => void
}

const defaultValue = 0

const validateShape = ({ value, onChange }: IntegerFieldProps) => {
  if (typeof value !== 'number') {
    onChange(defaultValue)
  }
}

export const IntegerField = ({ value, onChange }: IntegerFieldProps) => {
  React.useEffect(() => {
    validateShape({ value, onChange })
  }, [])
  return (
    <NumberField
      type="integer"
      value={value.toString()}
      onChange={(e) => {
        onChange(e)
      }}
      {...EnterKeySubmitProps}
    />
  )
}
