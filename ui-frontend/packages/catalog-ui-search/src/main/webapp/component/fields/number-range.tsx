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

import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import { Omit } from '@material-ui/types'
import Grid from '@material-ui/core/Grid'

type RangeValueType = {
  lower: number
  upper: number
}

type NumberRangeFieldProps = {
  value: RangeValueType
  onChange: (val: RangeValueType) => void
  type: 'integer' | 'float'
  TextFieldProps?: Omit<TextFieldProps, 'onChange' | 'value'>
}

export const NumberRangeField = ({
  value,
  onChange,
  type,
  TextFieldProps,
}: NumberRangeFieldProps) => {
  return (
    <Grid container direction="column">
      <Grid item className="w-full py-1">
        <div>from</div>
      </Grid>
      <Grid item>
        <TextField
          fullWidth
          variant="outlined"
          value={value.lower}
          placeholder="lower bound"
          type="number"
          onChange={e => {
            const newVal =
              type === 'integer'
                ? parseInt(e.target.value)
                : parseFloat(e.target.value)
            onChange({
              lower: newVal,
              upper: value.upper,
            })
          }}
          {...TextFieldProps}
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
          value={value.upper}
          type="number"
          onChange={e => {
            const newVal =
              type === 'integer'
                ? parseInt(e.target.value)
                : parseFloat(e.target.value)
            onChange({
              lower: value.lower,
              upper: newVal,
            })
          }}
          {...TextFieldProps}
        />
      </Grid>
    </Grid>
  )
}
