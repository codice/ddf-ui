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
const metacardDefinitions = require('../singletons/metacard-definitions.js')
const properties = require('../../js/properties.js')
const user = require('../singletons/user-instance.js')
const Backbone = require('backbone')
import { Header } from './table-header'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
const _ = require('underscore')

const filteredAttributesModel = Backbone.Model.extend({
  defaults: {
    filteredAttributes: [],
  },
})

const defaultTableColumns = properties.defaultTableColumns
  ? properties.defaultTableColumns.map((attr: string) => attr.toLowerCase())
  : []

const setDefaultColumns = (filteredAttributes: any) => {
  const hasSelectedColumns = user
    .get('user')
    .get('preferences')
    .get('hasSelectedColumns')
  const availableAttributes = filteredAttributes.get('filteredAttributes')

  if (
    !hasSelectedColumns &&
    availableAttributes.length &&
    defaultTableColumns.length
  ) {
    const hiddenAttributes = availableAttributes.filter(
      (attr: string) => !defaultTableColumns.includes(attr.toLowerCase())
    )
    user
      .get('user')
      .get('preferences')
      .set('columnHide', hiddenAttributes)
  }
}

export const getFilteredAttributes = (lazyResults: LazyQueryResults) => {
  const filteredAttributes = new filteredAttributesModel({
    filteredAttributes: lazyResults.getCurrentAttributes(),
  })
  setDefaultColumns(filteredAttributes)
  return filteredAttributes
}

export const getVisibleHeaders = (filteredAttributes: any) => {
  const sortAttributes = _.filter(
    metacardDefinitions.sortedMetacardTypes,
    (type: any) => !metacardDefinitions.isHiddenTypeExceptThumbnail(type.id)
  ).map((type: any) => type.id)

  const prefs = user.get('user').get('preferences')

  let preferredHeader = prefs.get('columnOrder') as string[]

  const hiddenColumns = prefs.get('columnHide') as string[]

  const availableAttributes = filteredAttributes.get('filteredAttributes')

  // tack on unknown attributes to end (sorted), then save
  preferredHeader = _.union(preferredHeader, availableAttributes)
  prefs.set('columnOrder', preferredHeader)
  prefs.savePreferences()

  const headers = preferredHeader
    .filter(property => availableAttributes.indexOf(property) !== -1)
    .map(property => ({
      label: properties.attributeAliases[property],
      id: property,

      hidden:
        hiddenColumns.indexOf(property) >= 0 ||
        properties.isHidden(property) ||
        metacardDefinitions.isHiddenTypeExceptThumbnail(property),

      sortable: sortAttributes.indexOf(property) >= 0,
    }))

  return headers.filter(header => !header.hidden) as Header[]
}
