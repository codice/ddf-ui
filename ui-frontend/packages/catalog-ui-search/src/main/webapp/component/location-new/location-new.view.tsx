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
import { ddToWkt, dmsToWkt, usngToWkt } from './utils'

import LocationNewModel from './location-new'

type LocationInputReactPropsType = {
  value: string
  onChange: (val: string) => void
  isStateDirty?: boolean
  resetIsStateDirty?: () => void
}

export const LocationInputReact = ({
  value,
  onChange,
  isStateDirty = false,
  resetIsStateDirty = () => {},
}: LocationInputReactPropsType) => {
  const [state, setState] = React.useState<LocationInputPropsType>(
    new LocationNewModel({ wkt: value, mode: 'wkt' }).toJSON()
  )

  React.useEffect(() => {
    if (isStateDirty) {
      setState(new LocationNewModel({ wkt: value, mode: state.mode }).toJSON())
      resetIsStateDirty()
    }
  }, [isStateDirty])

  React.useEffect(() => {
    if (state.valid) {
      switch (state.mode) {
        case 'wkt':
          onChange(state.wkt)
          break
        case 'dd':
          onChange(ddToWkt(state.dd) as any)
          break
        case 'dms':
          onChange(dmsToWkt(state.dms) as any)
          break
        case 'usng':
          onChange(usngToWkt(state.usng) as any)
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

export default LocationInputReact
