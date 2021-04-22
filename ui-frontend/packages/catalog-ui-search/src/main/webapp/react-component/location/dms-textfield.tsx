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
import CloseIcon from '@material-ui/icons/Close'
import Grid from '@material-ui/core/Grid/Grid'
import IconButton from '@material-ui/core/IconButton'
const {
  DmsLatitude,
  DmsLongitude,
} = require('../../component/location-new/geo-components/coordinates.js')
const DirectionInput = require('../../component/location-new/geo-components/direction.js')

type Direction = 'N' | 'S' | 'E' | 'W'

type Point = {
  latDirection: Direction
  lonDirection: Direction
  lat: string
  lon: string
}

const DmsTextfield = ({
  point,
  setPoint,
  deletePoint,
}: {
  point: Point
  setPoint: (point: Point) => void
  deletePoint: () => void
}) => {
  return (
    <div>
      <Grid container alignItems="center">
        <Grid item xs={11}>
          <DmsLatitude
            label="Latitude"
            value={point.lat}
            onChange={(value: string) => {
              setPoint({
                ...point,
                lat: value,
              })
            }}
          >
            <DirectionInput
              options={['N', 'S']}
              value={point.latDirection}
              onChange={(value: any) => {
                setPoint({
                  ...point,
                  latDirection: value,
                })
              }}
            />
          </DmsLatitude>
          <DmsLongitude
            label="Longitude"
            value={point.lon}
            onChange={(value: string) => {
              setPoint({
                ...point,
                lon: value,
              })
            }}
          >
            <DirectionInput
              options={['E', 'W']}
              value={point.lonDirection}
              onChange={(value: any) => {
                setPoint({
                  ...point,
                  lonDirection: value,
                })
              }}
            />
          </DmsLongitude>
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

module.exports = DmsTextfield
