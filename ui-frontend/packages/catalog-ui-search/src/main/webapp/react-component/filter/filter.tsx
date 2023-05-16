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

import FilterComparator from './filter-comparator'
import FilterInput from './filter-input'
import { Attribute, getGroupedFilteredAttributes } from './filterHelper'
import Grid from '@mui/material/Grid'
import Autocomplete from '@mui/material/Autocomplete'

import { hot } from 'react-hot-loader'
import TextField from '@mui/material/TextField'
import { FilterClass } from '../../component/filter-builder/filter.structure'
import { getComparators } from './filter-comparator/comparatorUtils'
import { ValidationResult } from '../location/validators'

type Props = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
  errorListener?: (validationResults: {
    [key: string]: ValidationResult | undefined
  }) => void
}

export const FilterContext = React.createContext({
  limitedAttributeList: undefined as undefined | Attribute[],
})
const Filter = ({ filter, setFilter, errorListener }: Props) => {
  const { limitedAttributeList } = React.useContext(FilterContext)
  let attributeList = limitedAttributeList
  let groups = 1
  if (!attributeList) {
    const groupedFilteredAttributes = getGroupedFilteredAttributes()
    attributeList = groupedFilteredAttributes.attributes
    groups = groupedFilteredAttributes.groups.length
  }
  const { property } = filter
  const currentSelectedAttribute = attributeList.find(
    (attrInfo) => attrInfo.value === property
  )
  const groupBy = groups > 1 ? (option: Attribute) => option.group! : undefined
  return (
    <Grid container direction="column" alignItems="center" className="w-full">
      <Grid item className="w-full pb-2">
        <Autocomplete
          data-id="filter-type-autocomplete"
          fullWidth
          size="small"
          options={attributeList}
          groupBy={groupBy}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(_e, newValue) => {
            /**
             * should update both the property and the type, since type is restricted based on property
             */
            const newProperty = newValue.value as FilterClass['property']
            const comparators = getComparators(newProperty)
            const updates = {
              property: newProperty,
              type: !comparators
                .map((comparator) => comparator.value)
                .includes(filter.type)
                ? (comparators[0].value as FilterClass['type'])
                : filter.type,
            }

            setFilter(
              new FilterClass({
                ...filter,
                ...updates,
              })
            )
          }}
          disableClearable
          value={currentSelectedAttribute}
          renderInput={(params) => <TextField {...params} variant="outlined" />}
        />
      </Grid>
      <Grid item className="w-full pb-2">
        <FilterComparator filter={filter} setFilter={setFilter} />
      </Grid>
      <Grid data-id="filter-input" item className="w-full">
        <FilterInput
          filter={filter}
          setFilter={setFilter}
          errorListener={errorListener}
        />
      </Grid>
    </Grid>
  )
}

export default hot(module)(Filter)
