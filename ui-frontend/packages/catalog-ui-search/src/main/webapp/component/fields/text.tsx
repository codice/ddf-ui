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

import MuiTextField from '@material-ui/core/TextField'
import { ValueTypes } from '../filter-builder/filter.structure'

type TextFieldProps = {
  value: ValueTypes['text']
  onChange: (val: ValueTypes['text']) => void
}

const defaultValue = ''

const validateShape = ({ value, onChange }: TextFieldProps) => {
  if (typeof value !== 'string') {
    onChange(defaultValue)
  }
}

export const TextField = ({ value, onChange }: TextFieldProps) => {
  React.useEffect(() => {
    validateShape({ value, onChange })
  }, [])
  return (
    <MuiTextField
      fullWidth
      multiline
      rowsMax={3}
      variant="outlined"
      placeholder="Use * for wildcard."
      value={value || ''}
      onChange={e => {
        onChange(e.target.value)
      }}
      className="whitespace-normal"
      size="small"
    />
  )
}
