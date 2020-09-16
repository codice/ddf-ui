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

import extension from '../../../extension-points'
import { DateField } from '../../../component/fields/date'
import { NearField } from '../../../component/fields/near'
import { TextField } from '../../../component/fields/text'
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
import Autocomplete from '@material-ui/lab/Autocomplete'
import MuiTextField from '@material-ui/core/TextField'
export type Props = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
}

const FilterInput = ({ filter, setFilter }: Props) => {
  const type = getAttributeType(filter.property)
  // call out to extension, if extension handles it, great, if not fallback to this
  const componentToReturn = extension.customFilterInput({
    filter,
    setFilter,
  })
  if (componentToReturn) {
    return componentToReturn as JSX.Element
  }
  const { value } = filter
  const onChange = (val: any) => {
    setFilter({
      ...filter,
      value: val,
    })
  }
  switch (filter.type) {
    case 'IS NULL':
      return null
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
      // @ts-ignore ts-migrate(2769) FIXME: Property 'value' does not exist on type 'Intrinsic... Remove this comment to see the full error message
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
  if (enumForAttr) {
    return (
      <Autocomplete
        // @ts-ignore fullWidth does exist on Autocomplete
        fullWidth
        size="small"
        options={enumForAttr}
        onChange={(_e: any, newValue: string) => {
          onChange(newValue)
        }}
        disableClearable
        value={textValue}
        renderInput={params => <MuiTextField {...params} variant="outlined" />}
      />
    )
  }

  return <TextField value={textValue} onChange={onChange} />
}

export default FilterInput
