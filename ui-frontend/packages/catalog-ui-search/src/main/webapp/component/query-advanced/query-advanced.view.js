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
import * as React from 'react'
const Marionette = require('marionette')
const memoize = require('lodash/memoize')
const $ = require('jquery')
const CustomElements = require('../../js/CustomElements.js')
import FilterBuilderView from '../filter-builder/filter-builder.tsx'
import FilterBranch from '../filter-builder/filter-branch'
const cql = require('../../js/cql.js')
const QuerySettingsView = require('../query-settings/query-settings.view.js')
const properties = require('../../js/properties.js')
import { getFilterErrors } from '../../react-component/utils/validation'

module.exports = Marionette.LayoutView.extend({
  template() {
    return (
      <form
        target="autocomplete"
        action="/search/catalog/blank.html"
        novalidate
      >
        <div class="editor-properties">
          <div class="query-advanced" />
          <div class="query-settings" />
        </div>
      </form>
    )
  },
  tagName: CustomElements.register('query-advanced'),
  regions: {
    querySettings: '.query-settings',
    queryAdvanced: '.query-advanced',
  },
  onBeforeShow() {
    this.querySettings.show(
      new QuerySettingsView({
        model: this.model,
      })
    )

    let filter
    if (this.model.get('filterTree') !== undefined) {
      filter = this.model.get('filterTree')
    } else if (this.options.isAdd) {
      filter = cql.read(cql.ANYTEXT_WILDCARD)
    } else if (this.model.get('cql')) {
      filter = cql.simplify(cql.read(this.model.get('cql')))
    }

    this.showAdvanced(filter)

    this.listenTo(
      this.querySettings.currentView.model,
      'change:src',
      function() {
        this.showAdvanced(this.queryAdvanced.currentView.getFilters())
      }
    )
  },
  showAdvanced(filter) {
    this.queryAdvanced.show(
      new FilterBuilderView({
        suggester: async ({ id, type }) => {
          if (!isValidFacetAttribute(id, type)) {
            return []
          }

          return fetchSuggestions(id)
        },
        filter,
        supportedAttributes: this.querySettings.currentView.model.attributes
          .src,
      })
    )
  },
  save() {
    this.querySettings.currentView.saveToModel()

    this.model.set({
      cql: this.queryAdvanced.currentView.transformToCql(),
      filterTree: cql.simplify(this.queryAdvanced.currentView.getFilters()),
    })
    if (typeof this.options.onSave === 'function') {
      this.options.onSave()
    }
  },
})
