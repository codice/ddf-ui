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
import metacardDefinitions from '../../component/singletons/metacard-definitions'
import properties from '../../js/properties'
type Attribute = {
  label: string
  value: string
  description: string | undefined
}
type StringNumberMap = { [key: string]: number }
export const getFilteredAttributeList = (): Attribute[] => {
  const featuredSorts: StringNumberMap = properties.featuredAttributes.reduce((sorts: StringNumberMap, attr: string, index: number) => {
    // don't want 0 in the map so we can do truth checks on the map's values
    sorts[attr] = index + 1
    return sorts
  }, {})
  return metacardDefinitions.sortedMetacardTypes
    .reduce((filteredAttributes: Attribute[], attribute: { alias: string, id: string }) => {
      if (!properties.isHidden(attribute.id) && !metacardDefinitions.isHiddenType(attribute.id)) {
        filteredAttributes.push({
          label: attribute.alias || attribute.id,
          value: attribute.id,
          description: (properties.attributeDescriptions || {})[attribute.id],
        })
      }
      return filteredAttributes
    }, [])
    .sort((a: Attribute, b: Attribute) => {
      const aSort = featuredSorts[a.value] || Number.MAX_SAFE_INTEGER
      const bSort = featuredSorts[b.value] || Number.MAX_SAFE_INTEGER
      // for non-featured attributes, we can return 0 instead of the comparison of the attributes
      // since the original list was sorted
      return aSort - bSort
    })
}
export const getAttributeType = (attribute: string): string => {
  const type = metacardDefinitions.metacardTypes[attribute].type
  if (type === 'GEOMETRY') return 'LOCATION'
  if (isIntegerType(type)) return 'INTEGER'
  if (isFloatType(type)) return 'FLOAT'
  return type
}
const isIntegerType = (type: string) => {
  return type === 'INTEGER' || type === 'SHORT' || type === 'LONG'
}
const isFloatType = (type: string) => {
  return type === 'FLOAT' || type === 'DOUBLE'
}
