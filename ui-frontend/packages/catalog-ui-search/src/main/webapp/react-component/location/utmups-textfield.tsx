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
import Grid from '@material-ui/core/Grid/Grid'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
const TextField = require('../text-field')
const { Zone, Hemisphere } = require('./common')

const hemisphere = {
  NORTHERN: 'Northern',
  SOUTHERN: 'Southern',
}

type UtmUpsPoint = {
  easting: number
  northing: number
  zoneNumber: number
  hemisphere: 'NORTHERN' | 'SOUTHERN'
}

const UtmupsTextfield = ({
  point,
  setPoint,
  deletePoint,
}: {
  point: UtmUpsPoint
  setPoint: (point: UtmUpsPoint) => void
  deletePoint: () => void
}) => {
  return (
    <div>
      <Grid container alignItems="center">
        <Grid item xs={11}>
          <TextField
            label="Easting"
            value={point.easting}
            onChange={(value: number) => {
              setPoint({
                ...point,
                easting: value,
              })
            }}
            addon="m"
          />
          <TextField
            label="Northing"
            value={point.northing}
            onChange={(value: number) => {
              setPoint({
                ...point,
                northing: value,
              })
            }}
            addon="m"
          />
          <Zone
            value={point.zoneNumber}
            onChange={(value: number) => {
              setPoint({
                ...point,
                zoneNumber: value,
              })
            }}
          />
          <Hemisphere
            //IMPLEMENT ON CHANGE HERE
            value={hemisphere[point.hemisphere]}
          />
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={deletePoint}>
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
    </div>
  )
}

module.exports = UtmupsTextfield
