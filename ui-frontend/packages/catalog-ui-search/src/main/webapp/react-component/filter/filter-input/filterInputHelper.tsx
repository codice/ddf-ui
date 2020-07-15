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
import LocationInput from './filter-location-input'

import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

import extension from '../../../extension-points'
import { DateField } from '../../../component/fields/date'
import { NearValueType, NearField } from '../../../component/fields/near'
import { NumberRangeField } from '../../../component/fields/number-range'
import { NumberField } from '../../../component/fields/number'
import {
  DateRangeField,
  DateRangeValueType,
  deserialize as deserializeDateRange,
  serialize as serializeDateRange,
} from '../../../component/fields/date-range'
import {
  DateRelativeField,
  deserialize as deserializeRelativeDate,
  serialize as serializeRelativeDate,
} from '../../../component/fields/date-relative'

type RangeValueType = {
  lower: number
  upper: number
}

type ValueType =
  | string
  | number
  | boolean
  | RangeValueType
  | NearValueType
  | DateRangeValueType

export type DetermineInputType = {
  comparator:
    | 'BEFORE'
    | 'AFTER'
    | 'IS EMPTY'
    | 'NEAR'
    | 'BETWEEN'
    | 'RELATIVE'
    | 'RANGE'
    | 'CONTAINS'
    | 'MATCHCASE'
    | '='
    | 'INTERSECTS'
  type: 'STRING' | 'BOOLEAN' | 'DATE' | 'LOCATION' | 'FLOAT' | 'INTEGER'
  value: ValueType
  onChange: (value: ValueType) => void // call this when you change values
}

export const determineInput = ({
  comparator,
  type,
  value,
  onChange,
}: DetermineInputType) => {
  // call out to extension, if extension handles it, great, if not fallback to this
  const componentToReturn = extension.customFilterInput({
    comparator,
    type,
    value,
    onChange,
  })
  if (componentToReturn) {
    return componentToReturn
  }
  const props = { value, onChange }
  console.log(props)
  switch (comparator) {
    case 'IS EMPTY':
      return null
    case 'NEAR':
      return <NearField value={value as NearValueType} onChange={onChange} />
    case 'BETWEEN':
      return (
        <DateRangeField
          value={deserializeDateRange(value as string)}
          onChange={val => {
            onChange(serializeDateRange(val))
          }}
        />
      )
    case 'RELATIVE':
      return (
        <DateRelativeField
          value={deserializeRelativeDate(value as string)}
          onChange={val => {
            onChange(serializeRelativeDate(val))
          }}
        />
      )
    case 'RANGE':
      return (
        <NumberRangeField
          value={value as RangeValueType}
          type={type === 'INTEGER' ? 'integer' : 'float'}
          onChange={onChange}
        />
      )
  }

  switch (type) {
    case 'BOOLEAN':
      return (
        <TextField
          fullWidth
          select
          variant="outlined"
          value={value.toString() === 'true'}
          onChange={e => {
            onChange(e.target.value === 'true')
          }}
        >
          <MenuItem value={'false'}>false</MenuItem>
          <MenuItem value={'true'}>true</MenuItem>
        </TextField>
      )
    case 'DATE':
      return <DateField onChange={onChange} value={value as string} />
    case 'LOCATION':
      return <LocationInput {...props} />
    case 'FLOAT':
      return (
        <NumberField value={value as string} onChange={onChange} type="float" />
      )
    case 'INTEGER':
      return (
        <NumberField
          value={value as string}
          onChange={onChange}
          type="integer"
        />
      )
  }

  return (
    <TextField
      fullWidth
      multiline
      rowsMax={3}
      variant="outlined"
      placeholder="Use * for wildcard."
      value={value || ''}
      onChange={e => {
        onChange(e.target.value)
      }}
    />
  )
}
