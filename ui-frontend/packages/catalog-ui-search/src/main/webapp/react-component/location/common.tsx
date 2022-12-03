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
import React from 'react';

import styled from 'styled-components'

import Group from '../group';
// @ts-expect-error ts-migrate(6133) FIXME: 'Menu' is declared but its value is never read.
import Menu from '@material-ui/core/Menu'
// @ts-expect-error ts-migrate(6133) FIXME: 'MenuItem' is declared but its value is never read... Remove this comment to see the full error message
import MenuItem from '@material-ui/core/MenuItem'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Label from './label';

const Units = ({
  value,
  onChange,
  children
}: any) => (
  <Group>
    {children}
    <Autocomplete
      fullWidth
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
      style={{ minWidth: '200px' }}
    ></Autocomplete>
  </Group>
)

// create an array of 1-60 for zones
const range = [...Array(61).keys()].map((val) => val.toString()).slice(1)
const Zone = ({
  value,
  onChange
}: any) => (
  <Group>
    <Label>Zone</Label>
    <Autocomplete
      className="w-full flex-shrink"
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

const Hemisphere = ({
  value,
  onChange
}: any) => (
  <Group>
    <Label>Hemisphere</Label>
    <Autocomplete
      className="w-full flex-shrink"
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

export {
  Units,
  Zone,
  Hemisphere,
  MinimumSpacing,
};
