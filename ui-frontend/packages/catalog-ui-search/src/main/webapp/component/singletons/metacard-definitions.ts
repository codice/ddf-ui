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

import Backbone from 'backbone'
import _ from 'underscore'
import properties from '../../js/properties'
import moment from 'moment'
import fetch from '../../react-component/utils/fetch'
const PRIORITY_ATTRIBUTES = ['anyText', 'anyGeo']
function transformEnumResponse(metacardTypes: any, response: any) {
  return _.reduce(
    response,
    (result, value, key) => {
      switch (metacardTypes[key].type) {
        case 'DATE':
          // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          result[key] = value.map((subval: any) => {
            if (subval) {
              return moment(subval).toISOString()
            }
            return subval
          })
          break
        case 'LONG':
        case 'DOUBLE':
        case 'FLOAT':
        case 'INTEGER':
        case 'SHORT': //needed until enum response correctly returns numbers as numbers
          // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          result[key] = value.map(
            (
              //handle cases of unnecessary number padding -> 22.0000
              subval: any
            ) => Number(subval)
          )
          break
        default:
          // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          result[key] = value
          break
      }
      return result
    },
    {}
  )
}

const metacardStartingTypes = {
  anyText: {
    alias: properties.attributeAliases['anyText'],
    id: 'anyText',
    type: 'STRING',
    multivalued: false,
  },
  anyGeo: {
    alias: properties.attributeAliases['anyGeo'],
    id: 'anyGeo',
    type: 'LOCATION',
    multivalued: false,
  },
  anyDate: {
    alias: properties.attributeAliases['anyDate'],
    id: 'anyDate',
    type: 'DATE',
    multivalued: false,
    hidden: true, // need to investigate if this is common, it looks like we defer to the properties file instead, think we need to overhaul our data structures for this
  },
  'metacard-type': {
    alias: properties.attributeAliases['metacard-type'],
    id: 'metacard-type',
    type: 'STRING',
    multivalued: false,
    readOnly: true,
  },
  'source-id': {
    alias: properties.attributeAliases['source-id'],
    id: 'source-id',
    type: 'STRING',
    multivalued: false,
    readOnly: true,
  },
  cached: {
    alias: properties.attributeAliases['cached'],
    id: 'cached',
    type: 'STRING',
    multivalued: false,
  },
  'metacard-tags': {
    alias: properties.attributeAliases['metacard-tags'],
    id: 'metacard-tags',
    type: 'STRING',
    multivalued: true,
  },
}

function metacardStartingTypesWithTemporal() {
  // needed to handle erroneous or currently unknown attributes (they could be picked up after searching a source)
  let metacardStartingTypeWithTemporal = { ...metacardStartingTypes }

  if (properties.basicSearchTemporalSelectionDefault) {
    properties.basicSearchTemporalSelectionDefault.forEach(
      (proposedType: any) => {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        metacardStartingTypeWithTemporal[proposedType] = {
          id: proposedType,
          type: 'DATE',
          alias: properties.attributeAliases[proposedType],
          hidden: properties.isHidden(proposedType),
        }
      }
    )
  }

  return metacardStartingTypeWithTemporal
}

export default new (Backbone.Model.extend({
  initialize() {
    this.updateSortedMetacardTypes()
    this.getMetacardTypes()
    this.getDatatypeEnum()
  },
  isHiddenTypeExceptThumbnail(id: any) {
    if (id === 'thumbnail') {
      return false
    } else {
      return this.isHiddenType(id)
    }
  },
  isHiddenType(id: any) {
    return (
      this.metacardTypes[id] === undefined ||
      this.metacardTypes[id].type === 'XML' ||
      this.metacardTypes[id].type === 'BINARY' ||
      this.metacardTypes[id].type === 'OBJECT' ||
      properties.isHidden(id)
    )
  },
  getDatatypeEnum() {
    fetch('./internal/enumerations/attribute/datatype')
      .then((response) => response.json())
      .then((response) => {
        _.extend(this.enums, response)
      })
  },
  getEnumForMetacardDefinition(metacardDefinition: any) {
    fetch('./internal/enumerations/metacardtype/' + metacardDefinition)
      .then((response) => response.json())
      .then((response) => {
        _.extend(
          this.enums,
          transformEnumResponse(this.metacardTypes, response)
        )
      })
  },
  getDeprecatedEnumForMetacardDefinition(metacardDefinition: any) {
    fetch('./internal/enumerations/deprecated/' + metacardDefinition)
      .then((response) => response.json())
      .then((response) => {
        _.extend(
          this.deprecatedEnums,
          transformEnumResponse(this.metacardTypes, response)
        )
      })
  },
  addMetacardDefinition(metacardDefinitionName: any, metacardDefinition: any) {
    if (
      Object.keys(this.metacardDefinitions).indexOf(metacardDefinitionName) ===
      -1
    ) {
      this.getEnumForMetacardDefinition(metacardDefinitionName)
      this.getDeprecatedEnumForMetacardDefinition(metacardDefinitionName)
      this.metacardDefinitions[metacardDefinitionName] = metacardDefinition
      for (const type in metacardDefinition) {
        if (metacardDefinition.hasOwnProperty(type)) {
          this.metacardTypes[type] = metacardDefinition[type]
          this.metacardTypes[type].id = this.metacardTypes[type].id || type
          this.metacardTypes[type].type =
            this.metacardTypes[type].type || this.metacardTypes[type].format
          this.metacardTypes[type].alias = properties.attributeAliases[type]
          this.metacardTypes[type].hidden =
            properties.isHidden(this.metacardTypes[type].id) ||
            this.isHiddenTypeExceptThumbnail(this.metacardTypes[type].id)
          this.metacardTypes[type].readOnly = properties.isReadOnly(
            this.metacardTypes[type].id
          )
        }
      }
      return true
    }
    return false
  },
  addMetacardDefinitions(metacardDefinitions: any) {
    let updated = false
    for (const metacardDefinition in metacardDefinitions) {
      if (metacardDefinitions.hasOwnProperty(metacardDefinition)) {
        updated =
          this.addMetacardDefinition(
            metacardDefinition,
            metacardDefinitions[metacardDefinition]
          ) || updated
      }
    }
    if (updated) {
      this.updateSortedMetacardTypes()
    }
  },
  typesFetched: false,
  getMetacardTypes() {
    fetch('./internal/metacardtype')
      .then((response) => response.json())
      .then((metacardDefinitions) => {
        this.addMetacardDefinitions(metacardDefinitions)
        this.typesFetched = true
      })
  },
  attributeComparator(a: any, b: any) {
    const attrToCompareA = this.getLabel(a).toLowerCase()
    const attrToCompareB = this.getLabel(b).toLowerCase()
    if (attrToCompareA < attrToCompareB) {
      return -1
    }
    if (attrToCompareA > attrToCompareB) {
      return 1
    }
    return 0
  },
  sortMetacardTypes(metacardTypes: any) {
    return metacardTypes.sort((a: any, b: any) => {
      const attrToCompareA = (a.alias || a.id).toLowerCase()
      const attrToCompareB = (b.alias || b.id).toLowerCase()
      if (PRIORITY_ATTRIBUTES.includes(a.id)) return -1
      if (PRIORITY_ATTRIBUTES.includes(b.id)) return 1
      if (attrToCompareA < attrToCompareB) {
        return -1
      }
      if (attrToCompareA > attrToCompareB) {
        return 1
      }
      return 0
    })
  },
  updateSortedMetacardTypes() {
    this.sortedMetacardTypes = []
    for (const propertyType in this.metacardTypes) {
      if (this.metacardTypes.hasOwnProperty(propertyType)) {
        this.sortedMetacardTypes.push(this.metacardTypes[propertyType])
      }
    }
    this.sortMetacardTypes(this.sortedMetacardTypes)
  },
  getLabel(id: any) {
    const definition = this.metacardTypes[id]
    return definition ? definition.alias || id : id
  },
  getMetacardStartingTypes() {
    return metacardStartingTypes
  },
  metacardDefinitions: [],
  sortedMetacardTypes: [],
  metacardTypes: _.extendOwn({}, metacardStartingTypesWithTemporal()),
  validation: {},
  enums: properties.enums,
  deprecatedEnums: {},
}))()
