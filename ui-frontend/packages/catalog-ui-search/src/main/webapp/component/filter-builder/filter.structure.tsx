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

export class FilterBuilder {
  operator: 'AND' | 'OR' | 'NOT OR' | 'NOT AND'
  filters: (FilterBuilder | Filter)[]
  constructor({
    operator = 'AND',
    filters = [new Filter()],
  }: {
    operator?: FilterBuilder['operator']
    filters: FilterBuilder['filters']
  }) {
    this.operator = operator
    this.filters = filters
  }
}

export class Filter {
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
  constructor({
    type = 'ILIKE',
    property = 'anyText',
    value = '',
  }: {
    type?: Filter['type']
    property?: Filter['property']
    value?: Filter['value']
  } = {}) {
    this.type = type
    this.property = property
    this.value = value
  }
}
