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
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import TextField from '../text-field'
import { Zone, Hemisphere } from './common'

type UtmUpsPoint = {
  easting: number
  northing: number
  zoneNumber: number
  hemisphere: 'Northern' | 'Southern'
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
      <div className="flex flex-row items-center flex-nowrap">
        <div className="flex flex-col space-y-2 flex-nowrap shrink w-full">
          <TextField
            label="Easting"
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string | ... Remove this comment to see the full error message
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
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string | ... Remove this comment to see the full error message
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
            value={point.hemisphere}
            onChange={(value: 'Northern' | 'Southern') => {
              setPoint({
                ...point,
                hemisphere: value,
              })
            }}
          />
        </div>
        <div className="shrink-0 grow-0">
          <IconButton onClick={deletePoint} size="large">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

export default UtmupsTextfield
