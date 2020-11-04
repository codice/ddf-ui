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
// @ts-ignore Can't find type declarations, but they exist
import moment from 'moment-timezone'
import { ValuesType } from 'utility-types'
// @ts-ignore ts-migrate(6133) FIXME: 'locationSerialize' is declared but its value is n... Remove this comment to see the full error message
import { serialize as locationSerialize } from '../location-old/location-serialization'
// @ts-ignore ts-migrate(7016) FIXME: Could not find a declaration file for module '../.... Remove this comment to see the full error message
import CQLUtils from '../../js/CQLUtils'
import { SpreadOperatorProtectedClass } from '../../typescript/classes'
const moment = require('moment')

// @ts-ignore ts-migrate(6133) FIXME: 'comparatorToCQL' is declared but its value is nev... Remove this comment to see the full error message
const comparatorToCQL = {
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
  RELATIVE: '=',
  BETWEEN: 'DURING',
  INTERSECTS: 'INTERSECTS',
  DWITHIN: 'DWITHIN',
  CONTAINS: 'ILIKE',
  MATCHCASE: 'LIKE',
  EQUALS: '=',
  'IS EMPTY': 'IS NULL',
  '>': '>',
  '<': '<',
  '=': '=',
  '<=': '<=',
  '>=': '>=',
  RANGE: 'BETWEEN',
}

export const serialize = {
  dateRelative: ({ last, unit }: ValueTypes['relative']) => {
    if (unit === undefined || !parseFloat(last)) {
      return ''
    }
    //Weeks is not a valid unit, so convert this to days
    if(unit === 'w') {
      let convertedUnit = 'd'
      let convertedLast = (parseInt(last) * 7).toString()
      return `RELATIVE(${'P' + convertedLast + convertedUnit.toUpperCase()})`
    }
    const prefix = unit === 's' || unit === 'm' || unit === 'h' ? 'PT' : 'P'
    return `RELATIVE(${prefix + last + unit.toUpperCase()})`
  },
  dateAround: (value: ValueTypes['around']) => {
    if(value.buffer === undefined || value.date === undefined) {
      return ''
    }
    let before = moment(value.date).subtract(value.buffer.amount, value.buffer.unit).toISOString()
    let after = moment(value.date).add(value.buffer.amount, value.buffer.unit).toISOString()
    return `DURING ${before}/${after}`
  },
  dateBetween: (value: ValueTypes['between']) => {
    const from = moment(value.start)
    const to = moment(value.end)
    if (from.isAfter(to)) {
      return (to.toISOString() || '') + '/' + (from.toISOString() || '')
    }
    return (from.toISOString() || '') + '/' + (to.toISOString() || '')
  },
  location: (property: string, value: ValueTypes['location']) => {
    return CQLUtils.generateAnyGeoFilter(property, value)
  },
}

export class FilterBuilderClass extends SpreadOperatorProtectedClass {
  readonly type: 'AND' | 'OR' | 'NOT OR' | 'NOT AND'
  readonly filters: (FilterBuilderClass | FilterClass)[]
  readonly negated: boolean
  readonly id: string
  constructor({
    type = 'AND',
    filters = [new FilterClass()],
    negated = false,
    id = Math.random().toString(),
  }: {
    type?: FilterBuilderClass['type']
    filters?: FilterBuilderClass['filters']
    negated?: FilterBuilderClass['negated']
    id?: string
  } = {}) {
    super()
    this.type = type
    /**
     * If for some reason filters come in that aren't classed, this will handle it.
     */
    this.filters = filters.map((childFilter) => {
      if (
        isFilterBuilderClass(childFilter) ||
        shouldBeFilterBuilderClass(childFilter)
      ) {
        return new FilterBuilderClass({
          ...childFilter,
        })
      } else {
        return new FilterClass({
          ...childFilter,
        })
      }
    })
    this.negated = negated
    this.id = id
  }
}

export type ValueTypes = {
  proximity: {
    first: string
    second: string
    distance: number
  }
  boolean: boolean
  text: string
  float: number
  integer: number
  relative: {
    last: string
    //NOTE: Weeks is not a valid unit, but we allow it in our system.
    //This is converted to days to become valid cql
    unit: 'm' | 'h' | 'd' | 'M' | 'y' | 's' | 'w' 
  }
  around: {
    date: string
    buffer: {
      amount: string
      unit: 'm' | 'h' | 'd' | 'M' | 'y' | 's' | 'w' 
    }
  }
  during: {
    start: string
    end: string
  }
  between: {
    start: number
    end: number
  }
  location:
    | any //POLYGON
    | {
        type: 'POLYGON'
        polygonBufferWidth: number
        polygonBufferUnits: 'meters'
        polygon: Array<Array<number>>
        locationType: 'dd'
        polyType: 'polygon'
        mode: 'poly'
      } //POINTRADIUS
    | {
        type: 'POINTRADIUS'
        radius: number
        radiusUnits: 'meters'
        mode: 'circle'
        lat: number
        lon: number
        locationType: 'dd'
      }
}

export class FilterClass extends SpreadOperatorProtectedClass {
  type:
    | 'BEFORE'
    | 'AFTER'
    | 'RELATIVE'
    | '='
    | 'DURING'
    | 'GEOMETRY'
    | 'DWITHIN'
    | 'ILIKE'
    | 'LIKE'
    | 'IS NULL'
    | '>'
    | '<'
    | '='
    | '<='
    | '>='
    | 'DURING'
    | 'BETWEEN'
    | 'FILTER FUNCTION proximity'
    | 'AROUND' // This isn't valid cql, but something we support
  readonly property: string
  readonly value: string | boolean | null | ValuesType<ValueTypes>
  readonly negated: boolean | undefined
  readonly id: string
  constructor({
    type = 'ILIKE',
    property = 'anyText',
    value = '',
    negated = false,
    id = Math.random().toString(),
  }: {
    type?: FilterClass['type']
    property?: FilterClass['property']
    value?: FilterClass['value']
    negated?: FilterClass['negated']
    id?: string
  } = {}) {
    super()
    this.type = type
    this.property = property
    this.value = value
    this.negated = negated
    this.id = id
  }
}

/**
 * determine it is actually an plain object form of the filter builder class
 */
export const shouldBeFilterBuilderClass = (
  filter: any
): filter is FilterBuilderClass => {
  return !isFilterBuilderClass(filter) && filter.filters !== undefined
}

/**
 *determine it is actually an instantiation of the filter builder class
 */
export const isFilterBuilderClass = (
  filter:
    | FilterBuilderClass
    | FilterClass
    | Partial<FilterBuilderClass>
    | Partial<FilterClass>
): filter is FilterBuilderClass => {
  return filter.constructor === FilterBuilderClass
}
