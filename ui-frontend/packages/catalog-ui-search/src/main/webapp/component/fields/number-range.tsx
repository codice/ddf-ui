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

type NumberRangeFieldProps = {
  value: ValueTypes['between']
  onChange: (val: ValueTypes['between']) => void
  type: 'integer' | 'float'
}

const defaultValue = {
  start: 0,
  end: 1,
} as ValueTypes['between']

const validateShape = ({ value, onChange }: NumberRangeFieldProps) => {
  if (value.start === undefined || value.end === undefined) {
    onChange(defaultValue)
  }
}

export const NumberRangeField = ({
  value,
  onChange,
  type,
}: NumberRangeFieldProps) => {
  React.useEffect(() => {
    validateShape({ value, onChange, type })
  }, [])
  return (
    <Grid container direction="column">
      <Grid item className="w-full py-1">
        <div>from</div>
      </Grid>
      <Grid item>
        <TextField
          fullWidth
          variant="outlined"
          value={value.start}
          placeholder="lower bound"
          type="number"
          onChange={(e) => {
            const newVal =
              type === 'integer'
                ? parseInt(e.target.value)
                : parseFloat(e.target.value)
            onChange({
              ...value,
              start: newVal,
            })
          }}
          size="small"
        />
      </Grid>
      <Grid item className="w-full py-1">
        <div>to</div>
      </Grid>
      <Grid item>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="upper bound"
          value={value.end}
          type="number"
          onChange={(e) => {
            const newVal =
              type === 'integer'
                ? parseInt(e.target.value)
                : parseFloat(e.target.value)
            onChange({
              ...value,
              end: newVal,
            })
          }}
          size="small"
        />
      </Grid>
    </Grid>
  )
}
