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
// @ts-ignore ts-migrate(7016) FIXME: Could not find a declaration file for module '../.... Remove this comment to see the full error message
import CQLUtils from '../../js/CQLUtils'
import { SpreadOperatorProtectedClass } from '../../typescript/classes'
import ExtensionPoints from '../../extension-points'
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

export const deserialize = {
  /**
   * example inputs:  // ' are part of input
   * 'RELATIVE(PT1S)' // last 1 seconds
   * 'RELATIVE(PT1M)' // last 1 minutes
   * 'RELATIVE(PT1H)' // last 1 hours
   * 'RELATIVE(P1D)' // last 1 days
   * 'RELATIVE(P7D)' // last 1 weeks (notice we get mod of 7 days)
   * 'RELATIVE(P1M)' // last 1 month
   * 'RELATIVE(P1Y)' // last 1 year
   **/
  dateRelative: (val: string): ValueTypes['relative'] => {
    let last = ''
    const guts = val.split('(')[1].split(')')[0].substring(1) // get the thing between the parens, notice we don't care about P either
    let unit = guts.charAt(guts.length - 1) // notice that we still need to know if it's minutes or months, the unit is the same between them!
    if (guts.charAt(0) === 'T') {
      last = guts.substring(1, guts.length - 1)
      unit = unit.toLowerCase()
    } else {
      last = guts.substring(0, guts.length - 1)
      if (unit !== 'M') {
        unit = unit.toLowerCase() // only M differs given the conflict between minutes / months
      }
      if (unit === 'd') {
        if (Number(last) % 7 === 0) {
          // manually convert to weeks since it's not "really" a cql supported unit for relative
          last = (Number(last) / 7).toString()
          unit = 'w'
        }
      }
    }
    return {
      last,
      unit,
    } as ValueTypes['relative']
  },
}

export const serialize = {
  dateRelative: ({ last, unit }: ValueTypes['relative']) => {
    if (unit === undefined || !parseFloat(last)) {
      return ''
    }
    //Weeks is not a valid unit, so convert this to days
    if (unit === 'w') {
      let convertedUnit = 'd'
      let convertedLast = (parseInt(last) * 7).toString()
      return `RELATIVE(${'P' + convertedLast + convertedUnit.toUpperCase()})`
    }
    const prefix = unit === 's' || unit === 'm' || unit === 'h' ? 'PT' : 'P'
    return `RELATIVE(${prefix + last + unit.toUpperCase()})`
  },
  dateAround: (value: ValueTypes['around']) => {
    if (value.buffer === undefined || value.date === undefined) {
      return ''
    }
    let before = moment(value.date)
      .subtract(value.buffer.amount, value.buffer.unit)
      .toISOString()
    let after = moment(value.date)
      .add(value.buffer.amount, value.buffer.unit)
      .toISOString()
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
    const transformation = ExtensionPoints.serializeLocation(property, value)
    if (transformation !== null) {
      return transformation
    }
    return CQLUtils.generateAnyGeoFilter(property, value)
  },
}

class BaseFilterBuilderClass extends SpreadOperatorProtectedClass {
  readonly type: string
  readonly filters: Array<any>
  readonly negated: boolean
  readonly id: string
  constructor({
    type = 'AND',
    filters = [new FilterClass()],
    negated = false,
    id = Math.random().toString(),
  }: {
    type?: BaseFilterBuilderClass['type']
    filters?: BaseFilterBuilderClass['filters']
    negated?: BaseFilterBuilderClass['negated']
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
export class FilterBuilderClass extends BaseFilterBuilderClass {
  readonly type: 'AND' | 'OR'
  readonly filters: Array<FilterBuilderClass | FilterClass>
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
    super({ type, filters, negated, id })
  }
}

export class CQLStandardFilterBuilderClass extends BaseFilterBuilderClass {
  readonly type: 'AND' | 'OR' | 'NOT'
  readonly filters: Array<
    FilterClass | CQLStandardFilterBuilderClass | FilterBuilderClass
  >
  constructor({
    type = 'AND',
    filters = [new FilterClass()],
    negated = false,
    id = Math.random().toString(),
  }: {
    type?: CQLStandardFilterBuilderClass['type']
    filters?: CQLStandardFilterBuilderClass['filters']
    negated?: CQLStandardFilterBuilderClass['negated']
    id?: string
  } = {}) {
    super({ type, filters, negated, id })
  }
}

export type ValueTypes = {
  proximity: {
    first: string
    second: string
    distance: number
  }
  date: string
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
  location: // this is all we technically need to reconstruct (lo fidelity)
  | {
        type: 'LINE'
        mode: 'line'
        lineWidth?: string
        line: Array<Array<number>>
      }
    | {
        type: 'POLYGON'
        polygonBufferWidth?: number | string
        polygonBufferUnits?: 'meters'
        polygon: Array<Array<number>>
        locationType?: 'dd'
        polyType?: 'polygon'
        mode: 'poly'
      } //POINTRADIUS
    | {
        type: 'POINTRADIUS'
        radius: number | string
        radiusUnits?: 'meters'
        mode: 'circle'
        lat: number
        lon: number
        locationType?: 'dd'
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
    | CQLStandardFilterBuilderClass
    | Partial<FilterBuilderClass>
    | Partial<FilterClass>
    | Partial<CQLStandardFilterBuilderClass>
): filter is FilterBuilderClass => {
  return filter.constructor === FilterBuilderClass
}
