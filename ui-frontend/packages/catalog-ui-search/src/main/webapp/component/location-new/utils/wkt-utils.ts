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

import wkx from 'wkx';

import errorMessages from './errors';
import DistanceUtils from '../../../js/DistanceUtils'

function convertUserValueToWKT(val: any) {
  val = val.split(' (').join('(').split(', ').join(',')
  val = val
    .split('MULTIPOINT')
    // @ts-expect-error ts-migrate(6133) FIXME: 'index' is declared but its value is never read.
    .map((value: any, index: any) => {
      if (value.indexOf('((') === 0) {
        const endOfMultiPoint = value.indexOf('))') + 2
        let multipointStr = value.substring(0, endOfMultiPoint)
        multipointStr = multipointStr
          .split('((')
          .join('(')
          .split('),(')
          .join(',')
          .split('))')
          .join(')')
        return multipointStr + value.substring(endOfMultiPoint)
      } else {
        return value
      }
    })
    .join('MULTIPOINT')
  return val
}

function removeTrailingZeros(wkt: any) {
  return wkt.replace(/[-+]?[0-9]*\.?[0-9]+/g, (number: any) => Number(number));
}

function checkCoordinateOrder(coordinate: any) {
  return (
    coordinate[0] >= -180 &&
    coordinate[0] <= 180 &&
    coordinate[1] >= -90 &&
    coordinate[1] <= 90
  )
}

function checkGeometryCoordinateOrdering(geometry: any) {
  switch (geometry.type) {
    case 'Point':
      return checkCoordinateOrder(geometry.coordinates)
    case 'LineString':
    case 'MultiPoint':
      return geometry.coordinates.every((coordinate: any) => checkCoordinateOrder(coordinate)
      );
    case 'Polygon':
    case 'MultiLineString':
      return geometry.coordinates.every((line: any) => line.every((coordinate: any) => checkCoordinateOrder(coordinate))
      );
    case 'MultiPolygon':
      return geometry.coordinates.every((multipolygon: any) => multipolygon.every((polygon: any) => polygon.every((coordinate: any) => checkCoordinateOrder(coordinate))
      )
      );
    case 'GeometryCollection':
      return geometry.geometries.every((subgeometry: any) => checkGeometryCoordinateOrdering(subgeometry)
      );
  }
}

function checkForm(wkt: any) {
  try {
    const test = wkx.Geometry.parse(wkt)
    return test.toWkt() === removeTrailingZeros(convertUserValueToWKT(wkt))
  } catch (err) {
    return false
  }
}

function checkLonLatOrdering(wkt: any) {
  try {
    const test = wkx.Geometry.parse(wkt)
    return checkGeometryCoordinateOrdering(test.toGeoJSON())
  } catch (err) {
    return false
  }
}

function inputIsBlank(wkt: any) {
  return !wkt || wkt.length === 0
}

function validateWkt(wkt: any) {
  if (inputIsBlank(wkt)) {
    return { valid: true, error: null }
  }

  let valid = true
  let error = null
  if (!checkForm(wkt)) {
    valid = false
    error = errorMessages.malformedWkt
  } else if (!checkLonLatOrdering(wkt)) {
    valid = false
    error = errorMessages.invalidWktCoordinates
  }
  return { valid, error }
}

function createCoordPair(coordinate: any) {
  return coordinate.map((val: any) => DistanceUtils.coordinateRound(val)).join(' ');
}

function createLineString(coordinates: any) {
  return '(' +
  coordinates
    .map((coord: any) => {
      return createCoordPair(coord)
    })
    .join(', ') +
  ')';
}

function createMultiLineString(coordinates: any) {
  return '(' +
  coordinates
    .map((line: any) => {
      return createLineString(line)
    })
    .join(', ') +
  ')';
}

function createMultiPolygon(coordinates: any) {
  return '(' +
  coordinates
    .map((line: any) => {
      return createMultiLineString(line)
    })
    .join(', ') +
  ')';
}

// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function createRoundedWktGeo(geoJson: any) {
  switch (geoJson.type) {
    case 'Point':
      return (
        geoJson.type.toUpperCase() +
        '(' +
        createCoordPair(geoJson.coordinates) +
        ')'
      )
    case 'LineString':
    case 'MultiPoint':
      return geoJson.type.toUpperCase() + createLineString(geoJson.coordinates)
    case 'Polygon':
    case 'MultiLineString':
      return (
        geoJson.type.toUpperCase() + createMultiLineString(geoJson.coordinates)
      )
    case 'MultiPolygon':
      return (
        geoJson.type.toUpperCase() + createMultiPolygon(geoJson.coordinates)
      )
    case 'GeometryCollection':
      return geoJson.type.toUpperCase() +
      '(' +
      geoJson.geometries.map((geo: any) => createRoundedWktGeo(geo)).join(', ') +
      ')';
  }
}

function roundWktCoords(wkt: any) {
  if (!inputIsBlank(wkt) && checkForm(wkt) && checkLonLatOrdering(wkt)) {
    let parsed = wkx.Geometry.parse(wkt)
    let geoJson = parsed.toGeoJSON()
    return createRoundedWktGeo(geoJson)
  } else {
    return wkt
  }
}

export default {
  validateWkt,
  roundWktCoords,
};
