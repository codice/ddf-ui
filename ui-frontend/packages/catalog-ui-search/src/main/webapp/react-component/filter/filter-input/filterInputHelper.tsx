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
const BooleanInput = require('./filter-boolean-input')
const LocationInput = require('./filter-location-input')
const {
  FloatInput,
  IntegerInput,
  RangeInput,
} = require('./filter-number-inputs')
const {
  DateInput,
  RelativeTimeInput,
  BetweenTimeInput,
} = require('./filter-date-inputs')
const { TextInput, NearInput, EnumInput } = require('./filter-text-inputs')
import extension from '../../../extension-points'

export type determineInputType = {
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
  suggestions: any[]
  value: string | number
  onChange: (value: string | number) => void // call this when you change values
}

export const determineInput = ({
  comparator,
  type,
  suggestions,
  value,
  onChange,
}: determineInputType) => {
  // call out to extension, if extension handles it, great, if not fallback to this
  const componentToReturn = extension.customFilterInput({
    comparator,
    type,
    suggestions,
    value,
    onChange,
  })
  if (componentToReturn) {
    return componentToReturn
  }
  const props = { value, onChange }
  switch (comparator) {
    case 'IS EMPTY':
      return null
    case 'NEAR':
      return <NearInput {...props} />
    case 'BETWEEN':
      return <BetweenTimeInput {...props} />
    case 'RELATIVE':
      return <RelativeTimeInput {...props} />
    case 'RANGE':
      return <RangeInput {...props} isInteger={type === 'INTEGER'} />
  }

  switch (type) {
    case 'BOOLEAN':
      return <BooleanInput {...props} />
    case 'DATE':
      return <DateInput {...props} />
    case 'LOCATION':
      return <LocationInput {...props} />
    case 'FLOAT':
      return <FloatInput {...props} />
    case 'INTEGER':
      return <IntegerInput {...props} />
  }

  if (suggestions && suggestions.length > 0) {
    return (
      <EnumInput
        {...props}
        matchCase={['MATCHCASE', '='].includes(comparator)}
        suggestions={suggestions}
      />
    )
  }
  return <TextInput {...props} />
}
