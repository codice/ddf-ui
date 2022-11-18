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
import LocationComponent, { LocationInputPropsType } from './location'
const { ddToWkt, dmsToWkt, usngToWkt } = require('./utils')
import { hot } from 'react-hot-loader'

const LocationNewModel = require('./location-new')

type LocationInputReactPropsType = {
  value: string
  onChange: (val: string) => void
}

export const LocationInputReact = ({
  value,
  onChange,
}: LocationInputReactPropsType) => {
  const [state, setState] = React.useState<LocationInputPropsType>(
    new LocationNewModel({ wkt: value, mode: 'wkt' }).toJSON()
  )

  React.useEffect(() => {
    if (state.valid) {
      switch (state.mode) {
        case 'wkt':
          onChange(state.wkt)
          break
        case 'dd':
          onChange(ddToWkt(state.dd))
          break
        case 'dms':
          onChange(dmsToWkt(state.dms))
          break
        case 'usng':
          onChange(usngToWkt(state.usng))
          break
        case 'keyword':
          onChange(state.keyword ? state.keyword.wkt : null)
          break
        default:
      }
    } else {
      onChange('INVALID')
    }
  }, [state])

  return <LocationComponent state={state} options={{}} setState={setState} />
}

export default hot(module)(LocationInputReact)
