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
import Grid from '@material-ui/core/Grid'
import { ValueTypes } from '../filter-builder/filter.structure'

type NearFieldProps = {
  value: ValueTypes['proximity']
  onChange: (val: ValueTypes['proximity']) => void
}

const defaultValue = {
  first: '',
  second: '',
  distance: 2,
} as ValueTypes['proximity']

const validateShape = ({ value, onChange }: NearFieldProps) => {
  if (
    value.distance === undefined ||
    value.first === undefined ||
    value.second === undefined
  ) {
    onChange(defaultValue)
  }
}

export const NearField = ({ value, onChange }: NearFieldProps) => {
  React.useEffect(() => {
    validateShape({ value, onChange })
  }, [])
  return (
    <Grid
      container
      className="w-full"
      direction="column"
      alignItems="flex-start"
      wrap="nowrap"
    >
      <Grid item className="w-full pb-2">
        <TextField
          fullWidth
          multiline
          rowsMax={3}
          variant="outlined"
          type="text"
          value={value.second}
          onChange={e => {
            onChange({
              ...value,
              second: e.target.value,
            })
          }}
          size="small"
        />
      </Grid>
      <Grid item className="w-full pb-2 pl-2">
        within
      </Grid>
      <Grid item className="w-full pb-2">
        <TextField
          fullWidth
          type="number"
          variant="outlined"
          value={value.distance}
          onChange={e => {
            onChange({
              ...value,
              distance: Math.max(1, parseInt(e.target.value) || 0),
            })
          }}
          size="small"
        />
      </Grid>
      <Grid item className="w-full pb-2 pl-2">
        of
      </Grid>
      <Grid item className="w-full">
        <TextField
          fullWidth
          multiline
          rowsMax={3}
          variant="outlined"
          type="text"
          value={value.first}
          onChange={e => {
            onChange({
              ...value,
              first: e.target.value,
            })
          }}
          size="small"
        />
      </Grid>
    </Grid>
  )
}
