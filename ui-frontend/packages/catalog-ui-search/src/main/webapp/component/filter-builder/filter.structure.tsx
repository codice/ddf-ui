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

export class FilterBuilderClass {
  operator: 'AND' | 'OR' | 'NOT OR' | 'NOT AND'
  filters: (FilterBuilderClass | FilterClass)[]
  negated: boolean
  id: string
  constructor({
    operator = 'AND',
    filters = [new FilterClass()],
    negated = false,
  }: {
    operator?: FilterBuilderClass['operator']
    filters?: FilterBuilderClass['filters']
    negated?: FilterBuilderClass['negated']
  } = {}) {
    this.operator = operator
    /**
     * If for some reason filters come in that aren't classed, this will handle it.
     */
    this.filters = filters.map(childFilter => {
      if (isFilterBuilderClass(childFilter)) {
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
    this.id = Math.random().toString()
  }
}

export class FilterClass {
  type:
    | 'BEFORE'
    | 'AFTER'
    | '='
    | 'DURING'
    | 'INTERSECTS'
    | 'DWITHIN'
    | 'ILIKE'
    | 'LIKE'
    | 'IS NULL'
    | '>'
    | '<'
    | '='
    | '<='
    | '>='
    | 'BETWEEN'
  property:
    | string
    | {
        type: 'FILTER_FUNCTION'
        filterFunctionName: 'proximity'
        params: [string, number, string]
      }
  value: string | boolean | null
  negated: boolean | undefined
  id: string
  constructor({
    type = 'ILIKE',
    property = 'anyText',
    value = '',
    negated = false,
  }: {
    type?: FilterClass['type']
    property?: FilterClass['property']
    value?: FilterClass['value']
    negated?: FilterClass['negated']
  } = {}) {
    this.type = type
    this.property = property
    this.value = value
    this.negated = negated
    this.id = Math.random().toString()
  }
}

export const isFilterBuilderClass = (
  filter: FilterBuilderClass | FilterClass
): filter is FilterBuilderClass => {
  return (filter as FilterBuilderClass).filters !== undefined
}
