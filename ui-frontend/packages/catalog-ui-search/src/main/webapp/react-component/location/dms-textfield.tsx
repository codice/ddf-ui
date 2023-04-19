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
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import {
  DmsLatitude,
  DmsLongitude,
} from '../../component/location-new/geo-components/coordinates'
import DirectionInput from '../../component/location-new/geo-components/direction'

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
      <div className="flex flex-row items-center flex-nowrap">
        <div className="flex flex-col space-y-2 flex-nowrap shrink w-full">
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
              // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
              // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
        </div>
        <div className="shrink-0 grow-0">
          <IconButton onClick={deletePoint} size="large">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default DmsTextfield
