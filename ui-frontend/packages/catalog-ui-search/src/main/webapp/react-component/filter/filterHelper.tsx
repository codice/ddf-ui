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
import { BasicDataTypePropertyName } from '../../component/filter-builder/reserved.properties'
import { StartupDataStore } from '../../js/model/Startup/startup'
import {
  AttributeDefinitionType,
  AttributeMapType,
} from '../../js/model/Startup/startup.types'
export type Attribute = {
  label: string
  value: string
  description: string | undefined
  group?: string
}
const toAttribute = (
  attribute: AttributeDefinitionType,
  group?: string
): Attribute => {
  return {
    label: attribute.alias || attribute.id,
    value: attribute.id,
    description: (StartupDataStore.Configuration.config
      ?.attributeDescriptions || {})[attribute.id],
    group,
  }
}
export const getGroupedFilteredAttributes = (): {
  groups: string[]
  attributes: Attribute[]
} => {
  const allAttributes =
    StartupDataStore.MetacardDefinitions.getSortedAttributes().reduce(
      (attributes, attr) => {
        attributes[attr.id] = attr
        return attributes
      },
      {} as AttributeMapType
    )
  const validCommonAttributes =
    StartupDataStore.Configuration.getCommonAttributes().reduce(
      (attributes: Attribute[], id: string) => {
        const attribute = allAttributes[id]
        if (attribute) {
          attributes.push(toAttribute(attribute, 'Commonly Used Attributes'))
        }
        return attributes
      },
      []
    )
  const groupedFilteredAttributes = validCommonAttributes.concat(
    getFilteredAttributeList('All Attributes')
  )
  const reservedDatatypeAttr = groupedFilteredAttributes.find((thing) => {
    return thing.value === BasicDataTypePropertyName
  })
  if (reservedDatatypeAttr) {
    reservedDatatypeAttr.group = 'Special Attributes'
  }
  const groups =
    validCommonAttributes.length > 0
      ? ['Commonly Used Attributes', 'Special Attributes', 'All Attributes']
      : ['Special Attributes', 'All Attributes']
  return {
    groups,
    attributes: groupedFilteredAttributes,
  }
}
export const getFilteredAttributeList = (group?: string): Attribute[] => {
  return StartupDataStore.MetacardDefinitions.getSortedAttributes()
    .filter(
      ({ id }: any) =>
        !StartupDataStore.Configuration.isHiddenAttribute(id) &&
        !StartupDataStore.MetacardDefinitions.isHiddenType(id)
    )
    .map((attr) => toAttribute(attr, group))
}
export const getAttributeType = (attribute: string): string => {
  const type =
    StartupDataStore.MetacardDefinitions.getAttributeMap()[attribute]?.type
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
