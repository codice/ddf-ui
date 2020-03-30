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
//@ts-ignore
import BooleanInput from './filter-boolean-input'
//@ts-ignore
import LocationInput from './filter-location-input'
//@ts-ignore
import { FloatInput, IntegerInput, RangeInput } from './filter-number-inputs'
import {
  DateInput,
  RelativeTimeInput,
  BetweenTimeInput,
  //@ts-ignore
} from './filter-date-inputs'
//@ts-ignore
import { TextInput, NearInput, EnumInput } from './filter-text-inputs'
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
