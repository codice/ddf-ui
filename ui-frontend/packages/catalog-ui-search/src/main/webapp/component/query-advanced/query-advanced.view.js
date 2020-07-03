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
const Marionette = require('marionette')
const memoize = require('lodash/memoize')
const $ = require('jquery')
const template = require('./query-advanced.hbs')
const CustomElements = require('../../js/CustomElements.js')
import FilterBuilderView from '../filter-builder/filter-builder.tsx'
const cql = require('../../js/cql.js')
const QuerySettingsView = require('../query-settings/query-settings.view.js')
const properties = require('../../js/properties.js')
import { getFilterErrors } from '../../react-component/utils/validation'

import query from '../../react-component/utils/query'

const fetchSuggestions = memoize(async attr => {
  const json = await query({
    count: 0,
    cql: cql.ANYTEXT_WILDCARD,
    facets: [attr],
  })

  const suggestions = json.facets[attr]

  if (suggestions === undefined) {
    return []
  }

  return suggestions.map(({ value }) => value)
})

const isValidFacetAttribute = (id, type) => {
  if (!['STRING', 'INTEGER', 'FLOAT'].includes(type)) {
    return false
  }
  if (id === 'anyText') {
    return false
  }
  if (!properties.attributeSuggestionList.includes(id)) {
    return false
  }
  return true
}

const { createAction } = require('imperio')

const { register, unregister } = createAction({
  type: 'workspace/query/SET-FILTER',
  docs: 'Set the current advanced query filter in the current workspace.',
})

module.exports = Marionette.LayoutView.extend({
  template,
  tagName: CustomElements.register('query-advanced'),
  modelEvents: {},
  events: {
    'click .editor-edit': 'edit',
    'click .editor-cancel': 'cancel',
    'click .editor-save': 'save',
  },
  regions: {
    querySettings: '.query-settings',
    queryAdvanced: '.query-advanced',
  },
  ui: {},
  initialize() {
    // this.intervalId = setInterval(() => {
    //   this.save()
    // }, 10000)
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

    this.action = register({
      el: this.el,
      params: [
        {
          filter: {
            type: 'ILIKE',
            property: 'anyText',
            value: '',
          },
        },
      ],
      fn: ({ filter }) => {
        this.showAdvanced(filter)
      },
    })
    this.listenTo(
      this.querySettings.currentView.model,
      'change:src',
      function() {
        this.showAdvanced(this.queryAdvanced.currentView.getFilters())
      }
    )
  },
  onDestroy() {
    unregister(this.action)
    clearInterval(this.intervalId)
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

    this.edit()
  },
  focus() {
    // eslint-disable-next-line no-undef
    const tabbable = _.filter(
      this.$el.find('[tabindex], input, button'),
      element => element.offsetParent !== null
    )
    if (tabbable.length > 0) {
      $(tabbable[0]).focus()
    }
  },
  edit() {
    this.$el.toggleClass(
      'is-empty',
      this.model.get('comparator') === 'IS EMPTY'
    )
    this.$el.addClass('is-editing')
    this.querySettings.currentView.turnOnEditing()
  },
  cancel() {
    fetchSuggestions.cache.clear()
    this.$el.removeClass('is-editing')
    this.onBeforeShow()
    if (typeof this.options.onCancel === 'function') {
      this.options.onCancel()
    }
  },
  save() {
    fetchSuggestions.cache.clear()
    this.querySettings.currentView.saveToModel()

    this.model.set({
      cql: this.queryAdvanced.currentView.transformToCql(),
      filterTree: cql.simplify(this.queryAdvanced.currentView.getFilters()),
    })
    if (typeof this.options.onSave === 'function') {
      this.options.onSave()
    }
  },
  getErrorMessages() {
    return this.querySettings.currentView
      .getErrorMessages()
      .concat(
        getFilterErrors(
          this.queryAdvanced.currentView.getFilters().filters || []
        )
      )
  },
  setDefaultTitle() {
    this.model.set('title', this.model.get('cql'))
  },
  serializeTemplateParameters() {
    return {
      filterTree: this.queryAdvanced.currentView.getFilters(),
      filterSettings: this.querySettings.currentView.toJSON(),
    }
  },
})
