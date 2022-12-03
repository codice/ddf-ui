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
import metacardDefinitions from '../../component/singletons/metacard-definitions'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mt-g... Remove this comment to see the full error message
import mtgeo from 'mt-geo'
import * as usngs  from 'usng.js'

// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
const converter = new usngs.Converter()
const usngPrecision = 6

import { Attribute, Coordinates, Format, validCoordinates } from '.'
import Common from '../../js/Common'

export const formatAttribute = ({ name, value }: Attribute): string | null => {
  const definition = metacardDefinitions.metacardTypes[name]
  if (definition === undefined) {
    return null
  }

  const isDate = definition.type === 'DATE'
  const displayName = definition.alias || name

  return `${displayName.toUpperCase()}: ${
    isDate ? Common.getHumanReadableDateTime(value) : value
  }`
}

const formatter = {
  degrees: ({ lat, lon }: Coordinates) =>
    `${mtgeo.toLat(lat)} ${mtgeo.toLon(lon)}`,
  decimal: ({ lat, lon }: Coordinates) => decimalComponent({ lat, lon }),
  mgrs: ({ lat, lon }: Coordinates) =>
    lat > 84 || lat < -80
      ? 'In UPS Space'
      : converter.LLtoUSNG(lat, lon, usngPrecision),
  utm: ({ lat, lon }: Coordinates) => converter.LLtoUTMUPS(lat, lon),
  wkt: ({ lat, lon }: Coordinates) => `POINT (${lon} ${lat})`,
}

export const formatCoordinates = ({
  coordinates,
  format,
}: {
  coordinates: Coordinates
  format: Format
}) => {
  if (!(format in formatter)) {
    throw `Unrecognized coordinate format value [${format}]`
  }

  return validCoordinates(coordinates)
    ? formatter[format](coordinates)
    : undefined
}

const decimalComponent = ({ lat, lon }: Coordinates) => {
  const numPlaces = 6
  const latPadding = numPlaces + 4
  const lonPadding = numPlaces + 5

  const formattedLat = lat
    .toFixed(numPlaces)
    .toString()
    .padStart(latPadding, ' ')

  const formattedLon = lon
    .toFixed(numPlaces)
    .toString()
    .padStart(lonPadding, ' ')

  return `${formattedLat} ${formattedLon}`
}
