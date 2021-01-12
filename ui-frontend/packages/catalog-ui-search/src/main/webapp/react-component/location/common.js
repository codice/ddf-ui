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
const React = require('react')

import styled from 'styled-components'

const Group = require('../group')
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
const Label = require('./label')

const Units = ({ value, onChange, children }) => (
  <Group>
    {children}
    <Autocomplete
      disableClearable
      options={[
        'meters',
        'kilometers',
        'feet',
        'yards',
        'miles',
        'nautical miles',
      ]}
      renderInput={(params) => {
        return <TextField {...params} label="" variant="outlined" />
      }}
      value={value}
      onChange={(_event, newVal) => {
        onChange(newVal)
      }}
      size="small"
    ></Autocomplete>
  </Group>
)

// create an array of 1-60 for zones
const range = [...Array(61).keys()].map((val) => val.toString()).slice(1)
const Zone = ({ value, onChange }) => (
  <Group>
    <Label>Zone</Label>
    <Autocomplete
      disableClearable
      options={range}
      renderInput={(params) => {
        return <TextField {...params} label="" variant="outlined" />
      }}
      value={value.toString()}
      onChange={(_event, newVal) => {
        onChange(parseInt(newVal))
      }}
      size="small"
    ></Autocomplete>
  </Group>
)

const Hemisphere = ({ value, onChange }) => (
  <Group>
    <Label>Hemisphere</Label>
    <Autocomplete
      disableClearable
      options={['Northern', 'Southern']}
      renderInput={(params) => {
        return <TextField {...params} label="" variant="outlined" />
      }}
      value={value}
      onChange={(_event, newVal) => {
        onChange(newVal)
      }}
      size="small"
    ></Autocomplete>
  </Group>
)

const MinimumSpacing = styled.div`
  height: ${(props) => props.theme.minimumSpacing};
`

module.exports = {
  Units,
  Zone,
  Hemisphere,
  MinimumSpacing,
}
