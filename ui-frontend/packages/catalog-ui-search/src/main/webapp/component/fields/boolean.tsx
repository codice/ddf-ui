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

import TextField from '@material-ui/core/TextField'
import { ValueTypes } from '../filter-builder/filter.structure'
import MenuItem from '@material-ui/core/MenuItem'

type Props = {
  value: ValueTypes['boolean']
  onChange: (val: ValueTypes['boolean']) => void
}

const defaultValue = false

const validateShape = ({ value, onChange }: Props) => {
  if (typeof value !== 'boolean') {
    onChange(defaultValue)
  }
}

export const BooleanField = ({ value, onChange }: Props) => {
  React.useEffect(() => {
    validateShape({ value, onChange })
  }, [])
  return (
    <TextField
      fullWidth
      select
      variant="outlined"
      value={value.toString() === 'true'}
      onChange={e => {
        onChange(e.target.value === 'true')
      }}
      size="small"
    >
      <MenuItem value={'false'}>false</MenuItem>
      <MenuItem value={'true'}>true</MenuItem>
    </TextField>
  )
}
