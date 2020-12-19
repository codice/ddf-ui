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

/**
 * With the update to having result filter run a real query, this isn't actually used anymore.
 *
 * It's possible it might be useful in the future if we add in faceting and need to start filtering on the frontend in complicated ways again,
 * but I think even in that circumstance we'll end up sending a query to the server rather than doing anything like this on the
 * client.
 *
 * WARNING: This likely needs to be updated to work with the new filter tree.  We don't do filtering on the frontend anymore at the moment, as stated above,
 * so we have not tackled updating it yet.
 */

import { ResultType } from '../Types'

const _ = require('underscore')
const metacardDefinitions = require('../../../component/singletons/metacard-definitions.js')
const Terraformer = require('terraformer')
const TerraformerWKTParser = require('terraformer-wkt-parser')
const CQLUtils = require('../../CQLUtils.js')
const Turf = require('@turf/turf')
const wkx = require('wkx')
const moment = require('moment')
import cql from '../../cql'
import {
  FilterBuilderClass,
  FilterClass,
  isFilterBuilderClass,
} from '../../../component/filter-builder/filter.structure'

// strip extra quotes
const stripQuotes = (value: any) => {
  return value.replace(/^"(.+(?="$))"$/, '$1')
}

const getDurationFromRelativeValue = (value: any) => {
  return value.substring(9, value.length - 1)
}

const polygonStringToCoordinates = (polygonString: any) => {
  try {
    return polygonString
      .substring('POLYGON(('.length, polygonString.length - '))'.length)
      .split(',')
      .map((stringPair: any) => {
        const pair = stringPair.split(' ')
        return [Number(pair[0]), Number(pair[1])]
      })
  } catch (error) {
    console.error(error)
    return []
  }
}

const createBufferedPolygon = (coordinates: any, distance: any) =>
  Turf.buffer(Turf.lineString(coordinates), Math.max(distance, 1), 'meters')

function checkTokenWithWildcard(token: any, filter: any) {
  const filterRegex = new RegExp(filter.split('*').join('.*'))
  return filterRegex.test(token)
}

function checkToken(token: any, filter: any) {
  if (filter.indexOf('*') >= 0) {
    return checkTokenWithWildcard(token, filter)
  } else if (token === filter) {
    return true
  }
  return false
}

function matchesILIKE(value: any, filter: any) {
  const valueToCheckFor = filter.value.toLowerCase()
  value = value.toString().toLowerCase()
  const tokens = value.split(' ')
  for (let i = 0; i <= tokens.length - 1; i++) {
    if (checkToken(tokens[i], valueToCheckFor)) {
      return true
    }
  }
  return false
}

function matchesLIKE(value: any, filter: any) {
  const valueToCheckFor = filter.value
  const tokens = value.toString().split(' ')
  for (let i = 0; i <= tokens.length - 1; i++) {
    if (checkToken(tokens[i], valueToCheckFor)) {
      return true
    }
  }
  return false
}

function matchesEQUALS(value: any, filter: any) {
  const valueToCheckFor = filter.value
  if (value.toString() === valueToCheckFor.toString()) {
    return true
  }
  return false
}

function matchesGreaterThan(value: any, filter: any) {
  const valueToCheckFor = filter.value
  if (value > valueToCheckFor) {
    return true
  }
  return false
}

function matchesGreaterThanOrEqualTo(value: any, filter: any) {
  const valueToCheckFor = filter.value
  if (value >= valueToCheckFor) {
    return true
  }
  return false
}

function matchesLessThan(value: any, filter: any) {
  const valueToCheckFor = filter.value
  if (value < valueToCheckFor) {
    return true
  }
  return false
}

function matchesLessThanOrEqualTo(value: any, filter: any) {
  const valueToCheckFor = filter.value
  if (value <= valueToCheckFor) {
    return true
  }
  return false
}

function matchesBETWEEN(value: any, filter: any) {
  return filter.lowerBoundary <= value && value <= filter.upperBoundary
}

// terraformer doesn't offically support Point, MultiPoint, FeatureCollection, or GeometryCollection
// terraformer incorrectly supports MultiPolygon, so turn it into a Polygon first
function intersects(terraformerObject: any, value: any): any {
  let intersected = false
  switch (value.type) {
    case 'Point':
      return terraformerObject.contains(value)
    case 'MultiPoint':
      value.coordinates.forEach((coordinate: any) => {
        intersected =
          intersected ||
          intersects(terraformerObject, {
            type: 'Point',
            coordinates: coordinate,
          })
      })
      return intersected
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
      return terraformerObject.intersects(value)
    case 'MultiPolygon':
      value.coordinates.forEach((coordinate: any) => {
        intersected =
          intersected ||
          intersects(terraformerObject, {
            type: 'Polygon',
            coordinates: coordinate,
          })
      })
      return intersected
    case 'Feature':
      return intersects(terraformerObject, value.geometry)
    case 'FeatureCollection':
      value.features.forEach((feature: any) => {
        intersected = intersected || intersects(terraformerObject, feature)
      })
      return intersected
    case 'GeometryCollection':
      value.geometries.forEach((geometry: any) => {
        intersected = intersected || intersects(terraformerObject, geometry)
      })
      return intersected
    default:
      return intersected
  }
}

function matchesPOLYGON(value: any, filter: any) {
  const polygonToCheck = TerraformerWKTParser.parse(filter.value)
  if (intersects(polygonToCheck, value)) {
    return true
  }
  return false
}

const matchesBufferedPOLYGON = (value: any, filter: any) => {
  const bufferedPolygon = createBufferedPolygon(
    polygonStringToCoordinates(filter.value),
    filter.distance
  )
  const teraformedPolygon = new Terraformer.Polygon({
    type: 'Polygon',
    coordinates: bufferedPolygon.geometry.coordinates,
  })
  return intersects(teraformedPolygon, value)
}

function matchesCIRCLE(value: any, filter: any) {
  if (filter.distance <= 0) {
    return false
  }
  const points = filter.value.substring(6, filter.value.length - 1).split(' ')
  const circleToCheck = new Terraformer.Circle(points, filter.distance, 64)
  const polygonCircleToCheck = new Terraformer.Polygon(circleToCheck.geometry)
  if (intersects(polygonCircleToCheck, value)) {
    return true
  }
  return false
}

function matchesLINESTRING(value: any, filter: any) {
  let pointText = filter.value.substring(11)
  pointText = pointText.substring(0, pointText.length - 1)
  const lineWidth = filter.distance || 0
  if (lineWidth <= 0) {
    return false
  }
  const line = pointText
    .split(',')
    .map((coordinate: any) =>
      coordinate.split(' ').map((value: any) => Number(value))
    )
  const turfLine = Turf.lineString(line)
  const bufferedLine = Turf.buffer(turfLine, lineWidth, 'meters')
  const polygonToCheck = new Terraformer.Polygon({
    type: 'Polygon',
    coordinates: bufferedLine.geometry.coordinates,
  })
  if (intersects(polygonToCheck, value)) {
    return true
  }
  return false
}

function matchesBEFORE(value: any, filter: any) {
  const date1 = moment(value)
  const date2 = moment(filter.value)
  if (date1 <= date2) {
    return true
  }
  return false
}

function matchesAFTER(value: any, filter: any) {
  const date1 = moment(value)
  const date2 = moment(filter.value)
  if (date1 >= date2) {
    return true
  }
  return false
}

function matchesRelative(value: any, filter: any) {
  const date1 = moment(value)
  const date2 = moment().subtract(
    moment.duration(getDurationFromRelativeValue(filter.value))
  )
  if (date1 >= date2) {
    return true
  }
  return false
}

function matchesDURING(value: any, filter: any) {
  return (
    filter.from && filter.to && moment(value).isBetween(filter.from, filter.to)
  )
}

/*
    Because the relative and = matchers use the same comparator we need to differentiate them by type
*/
function determineEqualsMatcher(filter: any) {
  if (
    metacardDefinitions.metacardTypes[stripQuotes(filter.property)].type ===
    'DATE'
  ) {
    return matchesRelative
  } else {
    return matchesEQUALS
  }
}

function flattenMultivalueProperties(valuesToCheck: any) {
  return _.flatten(valuesToCheck, true)
}

function matchesFilter(
  metacard: ResultType['metacard'],
  filter: FilterBuilderClass | FilterClass
): boolean {
  if (!isFilterBuilderClass(filter)) {
    let valuesToCheck = []
    let propertyToCheck = filter.property
    if (
      metacardDefinitions.metacardTypes[propertyToCheck] &&
      metacardDefinitions.metacardTypes[propertyToCheck].type === 'GEOMETRY'
    ) {
      propertyToCheck = 'anyGeo'
    }
    switch (propertyToCheck) {
      case 'anyText':
        valuesToCheck = Object.keys(metacard.properties)
          .filter(
            (property) =>
              Boolean(metacardDefinitions.metacardTypes[property]) &&
              metacardDefinitions.metacardTypes[property].type === 'STRING'
          )
          .map((property) => metacard.properties[property])
        break
      case 'anyGeo':
        valuesToCheck = Object.keys(metacard.properties)
          .filter(
            (property) =>
              Boolean(metacardDefinitions.metacardTypes[property]) &&
              metacardDefinitions.metacardTypes[property].type === 'GEOMETRY'
          )
          .map(
            (property) =>
              new Terraformer.Primitive(
                wkx.Geometry.parse(metacard.properties[property]).toGeoJSON()
              )
          )
        break
      default:
        const valueToCheck =
          metacard.properties[propertyToCheck.replace(/['"]+/g, '')]
        if (valueToCheck !== undefined) {
          valuesToCheck.push(valueToCheck)
        }
        break
    }

    if (valuesToCheck.length === 0) {
      return filter.value === '' // aligns with how querying works on the server
    }

    valuesToCheck = flattenMultivalueProperties(valuesToCheck)

    for (let i = 0; i <= valuesToCheck.length - 1; i++) {
      switch (filter.type) {
        case 'ILIKE':
          if (matchesILIKE(valuesToCheck[i], filter)) {
            return true
          }
          break
        case 'LIKE':
          if (matchesLIKE(valuesToCheck[i], filter)) {
            return true
          }
          break
        case '=':
          if (determineEqualsMatcher(filter)(valuesToCheck[i], filter)) {
            return true
          }
          break
        case '>':
          if (matchesGreaterThan(valuesToCheck[i], filter)) {
            return true
          }
          break
        case '>=':
          if (matchesGreaterThanOrEqualTo(valuesToCheck[i], filter)) {
            return true
          }
          break
        case '<':
          if (matchesLessThan(valuesToCheck[i], filter)) {
            return true
          }
          break
        case '<=':
          if (matchesLessThanOrEqualTo(valuesToCheck[i], filter)) {
            return true
          }
          break
        case 'BETWEEN':
          if (matchesBETWEEN(valuesToCheck[i], filter)) {
            return true
          }
          break
        case 'GEOMETRY':
          if (matchesPOLYGON(valuesToCheck[i], filter)) {
            return true
          }
          break
        case 'DWITHIN':
          if (CQLUtils.isPointRadiusFilter(filter)) {
            if (matchesCIRCLE(valuesToCheck[i], filter)) {
              return true
            }
          } else if (CQLUtils.isPolygonFilter(filter)) {
            if (matchesBufferedPOLYGON(valuesToCheck[i], filter)) {
              return true
            }
          } else if (matchesLINESTRING(valuesToCheck[i], filter)) {
            return true
          }
          break
        case 'AFTER':
          if (matchesAFTER(valuesToCheck[i], filter)) {
            return true
          }
          break
        case 'BEFORE':
          if (matchesBEFORE(valuesToCheck[i], filter)) {
            return true
          }
          break
        case 'DURING':
          if (matchesDURING(valuesToCheck[i], filter)) {
            return true
          }
          break
      }
    }
    return false
  } else {
    return matchesFilters(metacard, filter)
  }
}

export function matchesFilters(
  metacard: ResultType['metacard'],
  resultFilter: FilterBuilderClass | FilterClass
) {
  let i
  switch (resultFilter.type) {
    case 'AND':
      if (resultFilter.negated) {
        for (i = 0; i <= resultFilter.filters.length - 1; i++) {
          if (!matchesFilter(metacard, resultFilter.filters[i])) {
            return true
          }
        }
        return false
      }
      for (i = 0; i <= resultFilter.filters.length - 1; i++) {
        if (!matchesFilter(metacard, resultFilter.filters[i])) {
          return false
        }
      }
      return true
    case 'OR':
      if (resultFilter.negated) {
        for (i = 0; i <= resultFilter.filters.length - 1; i++) {
          if (matchesFilter(metacard, resultFilter.filters[i])) {
            return false
          }
        }
        return true
      }
      for (i = 0; i <= resultFilter.filters.length - 1; i++) {
        if (matchesFilter(metacard, resultFilter.filters[i])) {
          return true
        }
      }
      return false
    default:
      return matchesFilter(metacard, resultFilter)
  }
}

export function matchesCql(
  metacardJSON: ResultType['metacard'],
  cqlString: string
) {
  if (cqlString === '') {
    return true
  }
  return matchesFilters(metacardJSON, cql.read(cqlString))
}
