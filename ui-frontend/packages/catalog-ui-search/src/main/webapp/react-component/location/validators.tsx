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
const dmsUtils = require('../../component/location-new/utils/dms-utils.js')
import { validateGeo } from '../utils/validation'

const dmsRegex = new RegExp('^([0-9_]*)°([0-9_]*)\'([0-9_]*\\.?[0-9_]*)"$')

type Direction = 'N' | 'S' | 'E' | 'W'

type Point = {
  latDirection: Direction
  lonDirection: Direction
  lat: string
  lon: string
}

type DmsCoordinate = {
  degrees: string
  minutes: string
  seconds: string
  direction: Direction
}

type UtmUpsPoint = {
  easting: number
  northing: number
  zoneNumber: number
  hemisphere: 'NORTHERN' | 'SOUTHERN'
}

function validateUsngGrid(grid: string) {
  return converter.isUSNG(grid) !== 0
}

function gridIsBlank(grid: string) {
  return grid.length === 0
}

function dmsPointIsBlank(point: Point) {
  return point.lat === '' || point.lon === ''
}

function utmUpsIsBlank(point: UtmUpsPoint) {
  return point.easting || point.hemisphere || point.northing || point.zoneNumber
    ? false
    : true
}

function validateUtmUpsPoint(point: UtmUpsPoint) {
  const validation = validateGeo('easting', point)
  return !validation?.error
}

function inValidRange(coordinate: DmsCoordinate, maximum: number) {
  const degrees = parseInt(coordinate.degrees)
  const minutes = parseInt(coordinate.minutes)
  const seconds = parseFloat(coordinate.seconds)
  if (isNaN(seconds)) {
    return false
  }
  if (degrees > maximum || minutes > 60 || seconds > 60) {
    return false
  }
  if (degrees === maximum && (minutes > 0 || seconds > 0)) {
    return false
  }
  return true
}

function replacePlaceholderWithZeros(numString = '') {
  while (numString.includes('_')) {
    if (numString.includes('.')) {
      numString = numString.replace('_', '0')
    } else {
      numString = numString.replace('_', '')
      numString = '0' + numString
    }
  }
  return numString
}

function parseDmsCoordinate(coordinate: string) {
  if (coordinate === undefined) {
    return undefined
  }

  const matches = dmsRegex.exec(coordinate)
  if (!matches) {
    return undefined
  }
  const degrees = replacePlaceholderWithZeros(matches[1])
  const minutes = replacePlaceholderWithZeros(matches[2])
  const seconds = replacePlaceholderWithZeros(matches[3])
  return { degrees, minutes, seconds } as DmsCoordinate
}

function validateDmsPoint(point: Point) {
  const latitude = parseDmsCoordinate(point.lat)
  const longitude = parseDmsCoordinate(point.lon)
  if (latitude && longitude) {
    return inValidRange(latitude, 90) && inValidRange(longitude, 180)
  }
  return false
}

function validateDmsLineOrPoly(dms: Point[], type: 'line' | 'polygon') {
  let defaultValue
  if (dms.some(dmsPointIsBlank)) {
    return { error: true, message: errorMessages.invalidList, defaultValue }
  }
  let error = false
  let message = null
  switch (type) {
    case 'line':
      if (!dms.every(validateDmsPoint)) {
        error = true
        message = errorMessages.invalidList
      } else if (dms.length < 2) {
        error = true
        message = errorMessages.tooFewPointsLine
      }
      break
    case 'polygon':
      if (!dms.every(validateDmsPoint)) {
        error = true
        message = errorMessages.invalidList
      } else if (dms.length < 4) {
        //curiously our inspector expects 3 as the minimum, but the map expects at least 4
        error = true
        message = 'Polygons must contain 4 or more points'
      }
      break
  }
  return { error, message, defaultValue }
}

function validateUsngLineOrPoly(usng: string[], type: 'line' | 'polygon') {
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

function validateUtmUpsLineOrPoly(
  utmups: UtmUpsPoint[],
  type: 'line' | 'polygon'
) {
  let defaultValue
  if (utmups.some(utmUpsIsBlank)) {
    return { error: true, message: errorMessages.invalidList, defaultValue }
  }
  let error = false
  let message = null
  switch (type) {
    case 'line':
      if (!utmups.every(validateUtmUpsPoint)) {
        error = true
        message = errorMessages.invalidList
      } else if (utmups.length < 2) {
        error = true
        message = errorMessages.tooFewPointsLine
      }
      break
    case 'polygon':
      if (!utmups.every(validateUtmUpsPoint)) {
        error = true
        message = errorMessages.invalidList
      } else if (utmups.length < 4) {
        //curiously our inspector expects 3 as the minimum, but the map expects at least 4
        error = true
        message = 'Polygons must contain 4 or more points'
      }
      break
  }
  return { error, message, defaultValue }
}

module.exports = {
  validateUsngLineOrPoly,
  validateDmsLineOrPoly,
  parseDmsCoordinate,
  validateUtmUpsLineOrPoly,
}
