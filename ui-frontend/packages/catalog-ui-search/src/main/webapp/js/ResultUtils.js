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
const _ = require('underscore')
const metacardDefinitions = require('../component/singletons/metacard-definitions.js')

module.exports = {
  refreshResult(result, metacardProperties) {
    const id = result.get('metacard').id
    result.refreshData(metacardProperties)
  },
  updateResults(results, response) {
    const attributeMap = response.reduce(
      (attributeMap, changes) =>
        changes.attributes.reduce((attrMap, chnges) => {
          attrMap[chnges.attribute] = metacardDefinitions.metacardTypes[
            chnges.attribute
          ].multivalued
            ? chnges.values
            : chnges.values[0]
          if (
            attrMap[chnges.attribute] &&
            attrMap[chnges.attribute].constructor === Array &&
            attrMap[chnges.attribute].length === 0
          ) {
            attrMap[chnges.attribute] = undefined
          }
          return attrMap
        }, attributeMap),
      {}
    )
    const unsetAttributes = []
    _.forEach(attributeMap, (value, key) => {
      if (
        value === undefined ||
        (value.constructor === Array && value.length === 0)
      ) {
        unsetAttributes.push(key)
        delete attributeMap[key]
      }
    })
    if (results.length === undefined) {
      results = [results]
    }
    const ids = results.map((result) => result.get('metacard').id)
    results.forEach((metacard) => {
      metacard.get('metacard').get('properties').set(attributeMap)
      unsetAttributes.forEach((attribute) => {
        metacard.get('metacard').get('properties').unset(attribute)
      })
    })
  },
}
