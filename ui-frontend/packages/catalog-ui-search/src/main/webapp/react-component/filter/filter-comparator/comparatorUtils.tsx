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
import { AttributeTypes } from '../../../js/model/Startup/startup.types'
import { getAttributeType } from '../filterHelper'
import React from 'react'

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
    label: 'WITHIN THE LAST',
  },
  {
    value: 'DURING',
    label: 'BETWEEN',
  },
  {
    value: 'IS NULL',
    label: 'IS EMPTY',
  },
  {
    value: 'AROUND',
    label: 'AROUND',
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
    value: 'BOOLEAN_TEXT_SEARCH',
    label: 'BOOLEAN',
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

export const TypeToComparators: { [key in AttributeTypes]: ComparatorType[] } =
  {
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
    XML: [],
    OBJECT: [],
    BINARY: [],
  }

export const getComparators = (attribute: string): ComparatorType[] => {
  let comparators = TypeToComparators[getAttributeType(attribute)] || []
  // IS NULL checks do not work on these
  if (attribute === 'anyGeo' || attribute === 'anyText') {
    comparators = comparators.filter(
      (comparator) => comparator.value !== 'IS NULL'
    )
  }
  return comparators
}

export const ComparatorContext = React.createContext({
  getComparators,
})

export function DefaultComparatorProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ComparatorContext.Provider value={{ getComparators }}>
      {children}
    </ComparatorContext.Provider>
  )
}

export function useComparators() {
  return React.useContext(ComparatorContext)
}

export function useGetComparators() {
  return useComparators().getComparators
}

export function useComparatorsForAttribute(attribute: string) {
  const comparators = useGetComparators()
  const [comparatorList, setComparatorList] = React.useState<ComparatorType[]>(
    comparators(attribute)
  )
  React.useEffect(() => {
    setComparatorList(comparators(attribute))
  }, [attribute, comparators])
  return comparatorList
}
