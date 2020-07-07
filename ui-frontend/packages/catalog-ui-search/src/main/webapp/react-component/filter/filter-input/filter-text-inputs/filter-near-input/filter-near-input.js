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
import React, { useState, useEffect } from 'react'
import { deserializeDistance, serialize } from './nearFilterHelper'
import { deserializeValue } from '../textFilterHelper'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'

const NearInput = props => {
  const [value, setValue] = useState(deserializeValue(props.value))
  const [distance, setDistance] = useState(deserializeDistance(props.value))

  useEffect(
    () => {
      props.onChange(serialize(value, distance))
    },
    [value, distance]
  )

  return (
    <Grid
      container
      className="w-full"
      direction="column"
      alignItems="flex-start"
      wrap="nowrap"
    >
      <Grid item className="w-full">
        <TextField
          fullWidth
          multiline
          rowsMax={3}
          variant="outlined"
          type="text"
          value={value}
          onChange={e => {
            setValue(e.target.value)
          }}
        />
      </Grid>
      <Grid item className="w-full py-1">
        <div>within</div>
      </Grid>
      <Grid item className="w-full">
        <TextField
          fullWidth
          type="number"
          variant="outlined"
          value={distance}
          onChange={e => {
            setDistance(e.target.value)
          }}
        />
      </Grid>
    </Grid>
  )
}

export default NearInput
