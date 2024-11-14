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
import React from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { dispatchEnterKeySubmitEvent } from '../../../component/custom-events/enter-key-submit'

export const EnumInput = ({
  options,
  onChange,
  value,
}: {
  options: string[]
  onChange: (val: any) => void
  value: string
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Autocomplete
      onOpen={() => {
        setIsOpen(true)
      }}
      onClose={() => {
        setIsOpen(false)
      }}
      open={isOpen}
      fullWidth
      size="small"
      options={options}
      onChange={(_e: any, newValue: string) => {
        onChange(newValue)
      }}
      disableClearable
      value={value}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      // in this case do press so since the dropdown will close before keyup fires
      onKeyPress={(e) => {
        if (e.key === 'Enter' && !isOpen) {
          dispatchEnterKeySubmitEvent(e)
        }
      }}
    />
  )
}
