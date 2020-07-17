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
    value: 'BETWEEN',
    label: 'BETWEEN',
  },
  {
    value: 'EMPTY',
    label: 'EMPTY',
  },
] as ComparatorType[]
export const geometryComparators = [
  {
    value: 'INTERSECTS',
    label: 'INTERSECTS',
  },
  {
    value: 'IS EMPTY',
    label: 'IS EMPTY',
  },
] as ComparatorType[]
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
    value: 'NEAR',
    label: 'NEAR',
  },
  {
    value: 'IS NULL',
    label: 'IS EMPTY',
  },
] as ComparatorType[]
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
    value: 'RANGE',
    label: 'RANGE',
  },
  {
    value: 'IS EMPTY',
    label: 'IS EMPTY',
  },
]
export const booleanComparators = [
  {
    value: '=',
    label: '=',
  },
  {
    value: 'IS EMPTY',
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
  if (attribute === 'anyGeo' || attribute === 'anyText') {
    comparators = comparators.filter(
      comparator => comparator.value !== 'IS NULL'
    )
  }
  return comparators
}
