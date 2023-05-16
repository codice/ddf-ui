import * as React from 'react'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit'

type Props = {
  value?: string
  onChange?: (val: string) => void
  type: 'integer' | 'float'
  TextFieldProps?: TextFieldProps
}

export const NumberField = ({
  value,
  onChange,
  type,
  TextFieldProps,
}: Props) => {
  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      value={value}
      type="number"
      onChange={(e) => {
        if (onChange) {
          if (type === 'integer') {
            onChange(parseInt(e.target.value).toString())
          } else {
            onChange(parseFloat(e.target.value).toString())
          }
        }
      }}
      {...TextFieldProps}
      {...EnterKeySubmitProps}
    />
  )
}
