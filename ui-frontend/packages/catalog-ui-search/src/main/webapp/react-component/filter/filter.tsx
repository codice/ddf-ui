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
import { Attribute } from './filterHelper'
import Grid from '@mui/material/Grid'

import { hot } from 'react-hot-loader'
import { FilterClass } from '../../component/filter-builder/filter.structure'
import { ValidationResult } from '../location/validators'
import { FilterProperty } from './filter-property'
import { DefaultComparatorProvider } from './filter-comparator/comparatorUtils'

export type Props = {
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
  return (
    <Grid container direction="column" alignItems="center" className="w-full">
      <Grid item className="w-full pb-2">
        <FilterProperty
          filter={filter}
          setFilter={setFilter}
          errorListener={errorListener}
        />
      </Grid>
      <Grid item className="w-full pb-2">
        <DefaultComparatorProvider>
          <FilterComparator filter={filter} setFilter={setFilter} />
        </DefaultComparatorProvider>
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
