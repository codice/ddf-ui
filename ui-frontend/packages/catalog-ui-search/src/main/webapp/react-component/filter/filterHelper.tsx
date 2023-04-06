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
export type Attribute = {
  label: string
  value: string
  description: string | undefined
  group?: string
}
const toAttribute = (
  attribute: { id: string; alias: string },
  group?: string
): Attribute => {
  return {
    label: attribute.alias || attribute.id,
    value: attribute.id,
    description: (properties.attributeDescriptions || {})[attribute.id],
    group,
  }
}
export const getGroupedFilteredAttributes = (): {
  groups: string[]
  attributes: Attribute[]
} => {
  const allAttributes = metacardDefinitions.sortedMetacardTypes.reduce(
    (
      attributes: { [key: string]: { id: string; alias: string } },
      attr: { id: string; alias: string }
    ) => {
      attributes[attr.id] = attr
      return attributes
    },
    {}
  )
  const validCommonAttributes = (
    properties.commonAttributes as string[]
  ).reduce((attributes: Attribute[], id: string) => {
    const attribute = allAttributes[id]
    if (attribute) {
      attributes.push(toAttribute(attribute, 'Commonly Used Attributes'))
    }
    return attributes
  }, [])
  const groupedFilteredAttributes = validCommonAttributes.concat(
    getFilteredAttributeList('All Attributes')
  )
  const groups =
    validCommonAttributes.length > 0
      ? ['Commonly Used Attributes', 'All Attributes']
      : []
  return {
    groups,
    attributes: groupedFilteredAttributes,
  }
}
export const getFilteredAttributeList = (group?: string): Attribute[] => {
  return metacardDefinitions.sortedMetacardTypes
    .filter(
      ({ id }: any) =>
        !properties.isHidden(id) && !metacardDefinitions.isHiddenType(id)
    )
    .map((attr: { id: string; alias: string }) => toAttribute(attr, group))
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
