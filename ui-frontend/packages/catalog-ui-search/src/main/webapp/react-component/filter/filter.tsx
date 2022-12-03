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
import { getFilteredAttributeList } from './filterHelper'
import Grid from '@material-ui/core/Grid'
import Autocomplete from '@material-ui/lab/Autocomplete'

import { hot } from 'react-hot-loader'
import TextField from '@material-ui/core/TextField'
import { FilterClass } from '../../component/filter-builder/filter.structure'
import { getComparators } from './filter-comparator/comparatorUtils'

type Props = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
}

export const FilterContext = React.createContext({
  limitedAttributeList: undefined as
    | undefined
    | {
        label: string
        value: string
        description: string | undefined
      }[],
})
const Filter = ({ filter, setFilter }: Props) => {
  const { limitedAttributeList } = React.useContext(FilterContext)
  const { property } = filter
  const attributeList =
    limitedAttributeList !== undefined
      ? limitedAttributeList
      : getFilteredAttributeList()
  const currentSelectedAttribute = attributeList.find(
    (attrInfo) => attrInfo.value === property
  )
  return (
    <Grid container direction="column" alignItems="center" className="w-full">
      <Grid item className="w-full pb-2">
        <Autocomplete
          data-id="filter-type-autocomplete"
          fullWidth
          size="small"
          options={attributeList}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, value) => option.value === value.value}
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
        <FilterInput filter={filter} setFilter={setFilter} />
      </Grid>
    </Grid>
  )
}

export default hot(module)(Filter)
