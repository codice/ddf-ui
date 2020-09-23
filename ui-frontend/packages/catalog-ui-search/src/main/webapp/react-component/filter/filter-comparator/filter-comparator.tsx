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
import React, { useEffect } from 'react'
import { getComparators } from './comparatorUtils'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import { FilterClass } from '../../../component/filter-builder/filter.structure'

type Props = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
}

const FilterComparator = ({ filter, setFilter }: Props) => {
  useEffect(() => {
    const comparators = getComparators(filter.property)
    if (
      !comparators.map((comparator) => comparator.value).includes(filter.type)
    ) {
      setFilter({
        ...filter,
        type: comparators[0].value as FilterClass['type'],
      })
    }
  }, [filter])

  useEffect(() => {}, [filter])

  const comparators = getComparators(filter.property)
  return (
    <TextField
      data-id="filter-comparator-select"
      fullWidth
      variant="outlined"
      select
      value={filter.type}
      onChange={(e) => {
        const newType = e.target.value as FilterClass['type']
        setFilter({
          ...filter,
          type: newType,
        })
      }}
      size="small"
    >
      {comparators.map((comparator) => (
        <MenuItem value={comparator.value} key={comparator.label}>
          {comparator.label}
        </MenuItem>
      ))}
    </TextField>
  )
}

export default FilterComparator
