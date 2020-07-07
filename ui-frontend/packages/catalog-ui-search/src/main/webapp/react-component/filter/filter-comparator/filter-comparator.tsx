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
import styled from 'styled-components'
import { getComparators } from './comparatorUtils'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

type Props = {
  attribute: string
  comparator: string
  editing: boolean
  onChange: any
}

const FilterComparator = ({
  attribute,
  comparator,
  editing,
  onChange,
}: Props) => {
  useEffect(
    () => {
      const comparators = getComparators(attribute)
      if (!comparators.includes(comparator)) {
        onChange(comparators[0])
      }
    },
    [attribute]
  )

  const comparators = getComparators(attribute)
  return (
    <TextField
      fullWidth
      variant="outlined"
      select
      value={comparator}
      onChange={e => {
        console.log(e.target.value)
        onChange(e.target.value)
      }}
    >
      {comparators.map(comparator => (
        <MenuItem value={comparator} key={comparator}>
          {comparator}
        </MenuItem>
      ))}
    </TextField>
  )
}

export default FilterComparator
