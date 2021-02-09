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
const usng = require('usng.js')
const converter = new usng.Converter()
const errorMessages = require('../../component/location-new/utils/errors')

function validateUsngGrid(grid: string) {
  return converter.isUSNG(grid) !== 0
}

function gridIsBlank(grid: string) {
  return grid.length === 0
}

export default function validateUsngLineOrPoly(
  usng: string[],
  type: 'line' | 'polygon'
) {
  let defaultValue
  if (usng.some(gridIsBlank)) {
    return { error: true, message: errorMessages.invalidList, defaultValue }
  }
  let error = false
  let message = null
  switch (type) {
    case 'line':
      if (!usng.every(validateUsngGrid)) {
        error = true
        message = errorMessages.invalidList
      } else if (usng.length < 2) {
        error = true
        message = errorMessages.tooFewPointsLine
      }
      break
    case 'polygon':
      if (!usng.every(validateUsngGrid)) {
        error = true
        message = errorMessages.invalidList
      } else if (usng.length < 4) {
        //curiously our inspector expects 3 as the minimum, but the map expects at least 4
        error = true
        message = 'Polygons must contain 4 or more points'
      }
      break
  }
  return { error, message, defaultValue }
}
