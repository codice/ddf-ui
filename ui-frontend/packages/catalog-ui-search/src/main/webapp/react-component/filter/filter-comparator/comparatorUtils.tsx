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

type ComparatorType = { value: string; label: string }
// verified
export const dateComparators = [
  {
    value: 'BEFORE',
    label: 'BEFORE',
  },
  {
    value: 'AFTER',
    label: 'AFTER',
  },
  {
    value: 'RELATIVE',
    label: 'RELATIVE',
  },
  {
    value: 'DURING',
    label: 'BETWEEN',
  },
  {
    value: 'IS NULL',
    label: 'IS EMPTY',
  },
] as ComparatorType[]
// verified
export const geometryComparators = [
  {
    value: 'GEOMETRY',
    label: 'INTERSECTS',
  },
  {
    value: 'IS NULL',
    label: 'IS EMPTY',
  },
] as ComparatorType[]
// verified
export const stringComparators = [
  {
    value: 'ILIKE',
    label: 'CONTAINS',
  },
  {
    value: 'LIKE',
    label: 'MATCHCASE',
  },
  {
    value: '=',
    label: '=',
  },
  {
    value: 'FILTER FUNCTION proximity',
    label: 'NEAR',
  },
  {
    value: 'IS NULL',
    label: 'IS EMPTY',
  },
] as ComparatorType[]
// verified
export const numberComparators = [
  {
    value: '>',
    label: '>',
  },
  {
    value: '<',
    label: '<',
  },
  {
    value: '=',
    label: '=',
  },
  {
    value: '>=',
    label: '>=',
  },
  {
    value: '<=',
    label: '<=',
  },
  {
    value: 'BETWEEN',
    label: 'RANGE',
  },
  {
    value: 'IS NULL',
    label: 'IS EMPTY',
  },
]
// verified
export const booleanComparators = [
  {
    value: '=',
    label: '=',
  },
  {
    value: 'IS NULL',
    label: 'IS EMPTY',
  },
] as ComparatorType[]

import { getAttributeType } from '../filterHelper'

const typeToComparators = {
  STRING: stringComparators,
  DATE: dateComparators,
  LONG: numberComparators,
  DOUBLE: numberComparators,
  FLOAT: numberComparators,
  INTEGER: numberComparators,
  SHORT: numberComparators,
  LOCATION: geometryComparators,
  GEOMETRY: geometryComparators,
  BOOLEAN: booleanComparators,
} as {
  [key: string]: { value: string; label: string }[]
}

export const getComparators = (attribute: string): ComparatorType[] => {
  let comparators = typeToComparators[getAttributeType(attribute)]
  // IS NULL checks do not work on these
  if (attribute === 'anyGeo' || attribute === 'anyText') {
    comparators = comparators.filter(
      (comparator) => comparator.value !== 'IS NULL'
    )
  }
  return comparators
}
