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
import React from 'react'
import { getAttributeType } from '../filterHelper'
import LocationInput from './filter-location-input'

import { DateField } from '../../../component/fields/date'
import { NearField } from '../../../component/fields/near'
import { NumberRangeField } from '../../../component/fields/number-range'
import { DateRangeField } from '../../../component/fields/date-range'
import { DateRelativeField } from '../../../component/fields/date-relative'
import {
  FilterClass,
  ValueTypes,
} from '../../../component/filter-builder/filter.structure'
import { IntegerField } from '../../../component/fields/integer'
import { FloatField } from '../../../component/fields/float'
import { BooleanField } from '../../../component/fields/boolean'
import MetacardDefinitions from '../../../component/tabs/metacard/metacardDefinitions'
import { DateAroundField } from '../../../component/fields/date-around'
import { CustomInputOrDefault } from './customInputOrDefault'
import BooleanSearchBar from '../../../component/boolean-search-bar/boolean-search-bar'
import { EnterKeySubmitProps } from '../../../component/custom-events/enter-key-submit'
import { EnumInput } from './enum-input'
export type Props = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
}

const FilterInput = ({ filter, setFilter }: Props) => {
  const type = getAttributeType(filter.property)
  const { value } = filter
  const onChange = (val: any) => {
    setFilter(
      new FilterClass({
        ...filter,
        value: val,
      })
    )
  }
  switch (filter.type) {
    case 'IS NULL':
      return null
    case 'BOOLEAN_TEXT_SEARCH':
      return (
        <BooleanSearchBar
          value={value as ValueTypes['booleanText']}
          onChange={onChange}
          property={filter.property}
        />
      )
    case 'FILTER FUNCTION proximity':
      return (
        <NearField
          value={value as ValueTypes['proximity']}
          onChange={onChange}
        />
      )
    case 'DURING':
      return (
        <DateRangeField
          value={value as ValueTypes['during']}
          onChange={onChange}
        />
      )
    case 'RELATIVE':
      return (
        <DateRelativeField
          value={value as ValueTypes['relative']}
          onChange={onChange}
        />
      )
    case 'AROUND':
      return (
        <DateAroundField
          value={value as ValueTypes['around']}
          onChange={onChange}
        />
      )
    case 'BETWEEN':
      return (
        <NumberRangeField
          value={value as ValueTypes['between']}
          type={type === 'INTEGER' ? 'integer' : 'float'}
          onChange={onChange}
        />
      )
  }

  switch (type) {
    case 'BOOLEAN':
      return (
        <BooleanField
          value={value as ValueTypes['boolean']}
          onChange={onChange}
        />
      )
    case 'DATE':
      return <DateField onChange={onChange} value={value as string} />
    case 'LOCATION':
      return <LocationInput value={value} onChange={onChange} />
    case 'FLOAT':
      return (
        <FloatField value={value as ValueTypes['float']} onChange={onChange} />
      )
    case 'INTEGER':
      return (
        <IntegerField
          value={value as ValueTypes['integer']}
          onChange={onChange}
        />
      )
  }
  const textValue = value as string
  const enumForAttr = MetacardDefinitions.getEnum({ attr: filter.property })
  const deprecatedEnumForAttr = MetacardDefinitions.getDeprecatedEnum({
    attr: filter.property,
  })

  if (enumForAttr || deprecatedEnumForAttr) {
    let allEnumForAttr = [] as string[]
    if (enumForAttr) {
      allEnumForAttr = allEnumForAttr.concat(enumForAttr)
    }
    if (deprecatedEnumForAttr) {
      allEnumForAttr = allEnumForAttr.concat(deprecatedEnumForAttr)
    }
    return (
      <EnumInput
        options={allEnumForAttr}
        onChange={onChange}
        value={textValue}
        {...EnterKeySubmitProps}
      />
    )
  }

  return (
    <CustomInputOrDefault
      value={textValue}
      onChange={onChange}
      props={{
        fullWidth: true,
        variant: 'outlined',
        type: 'text',
        size: 'small',
      }}
    />
  )
}

export default FilterInput
