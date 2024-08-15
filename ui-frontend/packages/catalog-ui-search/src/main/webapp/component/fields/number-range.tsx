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

import Grid from '@mui/material/Grid'
import { ValueTypes } from '../filter-builder/filter.structure'
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit'
import { NumberField } from './number'

type NumberRangeFieldProps = {
  value: Partial<ValueTypes['between']>
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
  const validValue = {
    ...defaultValue,
    ...value,
  }
  React.useEffect(() => {
    validateShape({ value, onChange, type })
  }, [])
  return (
    <Grid container direction="column">
      <Grid item className="w-full py-1">
        <div>from</div>
      </Grid>
      <Grid item>
        <NumberField
          value={validValue.start.toString()}
          TextFieldProps={{
            placeholder: 'lower bound',
          }}
          type={type}
          onChange={(val) => {
            onChange({
              ...validValue,
              start: val,
            })
          }}
          {...EnterKeySubmitProps}
        />
      </Grid>
      <Grid item className="w-full py-1">
        <div>to</div>
      </Grid>
      <Grid item>
        <NumberField
          TextFieldProps={{
            placeholder: 'upper bound',
          }}
          value={validValue.end.toString()}
          type={type}
          onChange={(val) => {
            onChange({
              ...validValue,
              end: val,
            })
          }}
          {...EnterKeySubmitProps}
        />
      </Grid>
    </Grid>
  )
}
