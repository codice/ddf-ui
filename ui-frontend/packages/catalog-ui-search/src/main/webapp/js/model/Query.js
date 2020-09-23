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

const Backbone = require('backbone')
const $ = require('jquery')
const _ = require('underscore')
const properties = require('../properties.js')
const QueryResponse = require('./QueryResponse.js')
import Sources from '../../component/singletons/sources-instance'
const Common = require('../Common.js')
const CacheSourceSelector = require('../CacheSourceSelector.js')
const announcement = require('../../component/announcement/index.jsx')
const CQLUtils = require('../CQLUtils.js')
const cql = require('../cql')
const user = require('../../component/singletons/user-instance.js')
const _merge = require('lodash/merge')
require('backbone-associations')
import React from 'react'
import { readableColor } from 'polished'
import { LazyQueryResults } from './LazyQueryResult/LazyQueryResults'
const Query = {}

function getEphemeralSort() {
  return user.get('user').get('preferences').get('resultSort')
}

function mixinEphemeralFilter(originalCQL) {
  const ephermeralFilter = user
    .get('user')
    .get('preferences')
    .get('resultFilter')
  if (ephermeralFilter) {
    return {
      filters: [ephermeralFilter, originalCQL],
      type: 'AND',
    }
  } else {
    return originalCQL
  }
}

function limitToDeleted(cqlFilterTree) {
  return {
    type: 'AND',
    filters: [
      cqlFilterTree,
      {
        property: '"metacard-tags"',
        type: 'ILIKE',
        value: 'deleted',
      },
    ],
  }
}

function limitToHistoric(cqlFilterTree) {
  return {
    type: 'AND',
    filters: [
      cqlFilterTree,
      {
        property: '"metacard-tags"',
        type: 'ILIKE',
        value: 'revision',
      },
    ],
  }
}

const handleTieredSearchLocalFinish = function (ids) {
  const results = this.get('result').get('results').toJSON()

  const status = this.get('result').get('status').toJSON()

  const resultIds = results.map((result) => result.metacard.id)
  const missingResult = ids.some((id) => !resultIds.includes(id))
  if (!missingResult) {
    return
  }
  this.set('federation', 'enterprise')
  this.startSearch({ results, status })
}

Query.Model = Backbone.AssociatedModel.extend({
  relations: [
    {
      type: Backbone.One,
      key: 'result',
      relatedModel: QueryResponse,
      isTransient: true,
    },
  ],
  set(data) {
    if (
      typeof data === 'object' &&
      data.filterTree !== undefined &&
      typeof data.filterTree === 'string'
    ) {
      // for backwards compatability
      try {
        data.filterTree = JSON.parse(data.filterTree)
      } catch (e) {
        data.filterTree = CQLUtils.transformCQLToFilter(data.cql)
      }
    }
    return Backbone.AssociatedModel.prototype.set.apply(this, arguments)
  },
  toJSON(...args) {
    const json = Backbone.AssociatedModel.prototype.toJSON.call(this, ...args)
    if (typeof json.filterTree === 'object') {
      json.filterTree = JSON.stringify(json.filterTree)
    }
    return json
  },
  //in the search we are checking for whether or not the model
  //only contains 5 items to know if we can search or not
  //as soon as the model contains more than 5 items, we assume
  //that we have enough values to search
  defaults() {
    return _merge(
      {
        cql: "anyText ILIKE ''",
        filterTree: { property: 'anyText', value: '', type: 'ILIKE' },
        associatedFormModel: undefined,
        excludeUnnecessaryAttributes: true,
        count: properties.resultCount,
        start: 1,
        federation: 'enterprise',
        sorts: [
          {
            attribute: 'modified',
            direction: 'descending',
          },
        ],
        result: undefined,
        type: 'text',
        isLocal: false,
        isOutdated: false,
        'detail-level': undefined,
        spellcheck: false,
        phonetics: false,
      },
      user.getQuerySettings().toJSON()
    )
  },
  resetToDefaults(overridenDefaults) {
    const defaults = _.omit(this.defaults(), ['isLocal', 'result'])
    this.set(_merge(defaults, overridenDefaults))
    this.trigger('resetToDefaults')
  },
  applyDefaults() {
    this.set(_.pick(this.defaults(), ['sorts', 'federation', 'sources']))
  },
  revert() {
    this.trigger('revert')
  },
  isLocal() {
    return this.get('isLocal')
  },
  initialize() {
    _.bindAll.apply(_, [this].concat(_.functions(this))) // underscore bindAll does not take array arg
    this.set('id', this.getId())
    this.listenTo(
      this,
      'change:cql change:sources change:sorts change:spellcheck change:phonetics',
      () => {
        this.set('isOutdated', true)
        // this.resetCurrentIndexForSourceGroup()
      }
    )
    this.listenTo(
      user.get('user').get('preferences'),
      'change:resultCount',
      () => {
        this.set('isOutdated', true)
        // this.resetCurrentIndexForSourceGroup()
      }
    )
    this.listenTo(
      user.get('user').get('preferences'),
      'change:resultFilter',
      () => {
        this.startSearchFromFirstPage()
      }
    )
    this.listenTo(
      user.get('user').get('preferences'),
      'change:resultSort',
      () => {
        this.startSearchFromFirstPage()
      }
    )
  },
  getSelectedSources() {
    const selectedSources = this.get('sources')
    let sourceArray = selectedSources
    if (selectedSources.includes('all')) {
      sourceArray = _.pluck(Sources.toJSON(), 'id')
    }
    if (selectedSources.includes('local')) {
      sourceArray = sourceArray
        .concat(Sources.getHarvested())
        .filter((src) => src !== 'local')
    }
    if (selectedSources.includes('remote')) {
      sourceArray = sourceArray
        .concat(
          _.pluck(Sources.toJSON(), 'id').filter(
            (src) => !Sources.getHarvested().includes(src)
          )
        )
        .filter((src) => src !== 'remote')
    }
    return sourceArray
  },
  buildSearchData() {
    const data = this.toJSON()
    data.sources = this.getSelectedSources()

    data.count = user.get('user').get('preferences').get('resultCount')

    data.sorts = getEphemeralSort() || this.get('sorts')

    return _.pick(
      data,
      'sources',
      'start',
      'count',
      'timeout',
      'cql',
      'sorts',
      'id',
      'spellcheck',
      'phonetics'
    )
  },
  isOutdated() {
    return this.get('isOutdated')
  },
  startTieredSearchIfOutdated(ids) {
    if (this.isOutdated()) {
      this.startTieredSearch(ids)
    }
  },
  startSearchIfOutdated() {
    if (this.isOutdated()) {
      this.startSearch()
    }
  },
  startSearchFromFirstPage(options) {
    this.trigger('update')
    this.resetCurrentIndexForSourceGroup()
    this.startSearch(options)
  },
  startTieredSearch(ids) {
    this.set('federation', 'local')
    this.startSearch(undefined, (searches) => {
      $.when(...searches).then(() => {
        const queryResponse = this.get('result')
        if (queryResponse && queryResponse.isUnmerged()) {
          this.listenToOnce(
            queryResponse,
            'change:merged',
            handleTieredSearchLocalFinish.bind(this, ids)
          )
        } else {
          handleTieredSearchLocalFinish.call(this, ids)
        }
      })
    })
  },
  startSearch(options, done) {
    this.set('isOutdated', false)
    if (this.get('cql') === '') {
      return
    }
    options = _.extend(
      {
        limitToDeleted: false,
        limitToHistoric: false,
      },
      options
    )
    this.cancelCurrentSearches()

    const data = Common.duplicate(this.buildSearchData())
    data.batchId = Common.generateUUID()

    // Data.sources is set in `buildSearchData` based on which sources you have selected.
    const sources = data.sources
    let result = this.get('result')
    if (result) {
      result.get('lazyResults').reset({
        sorts: this.get('sorts'),
        sources,
      })
    } else {
      result = new QueryResponse({
        lazyResults: new LazyQueryResults({
          sorts: this.get('sorts'),
          sources,
        }),
      })
      this.set({
        result,
      })
    }

    let cqlFilterTree = this.get('filterTree')
    if (options.limitToDeleted) {
      cqlFilterTree = limitToDeleted(cqlFilterTree)
    } else if (options.limitToHistoric) {
      cqlFilterTree = limitToHistoric(cqlFilterTree)
    }
    cqlFilterTree = mixinEphemeralFilter(cqlFilterTree)
    let cqlString = cql.write(cqlFilterTree)

    const selectedSources = data.sources

    const harvestedSources = Sources.getHarvested()

    const isHarvested = (id) => harvestedSources.includes(id)
    const isFederated = (id) => !harvestedSources.includes(id)

    this.currentIndexForSourceGroup = this.nextIndexForSourceGroup
    const localSearchToRun = {
      ...data,
      cql: cqlString,
      srcs: selectedSources.filter(isHarvested),
      start: this.currentIndexForSourceGroup.local,
    }

    const federatedSearchesToRun = selectedSources
      .filter(isFederated)
      .map((source) => ({
        ...data,
        cql: cqlString,
        srcs: [source],
        start: this.currentIndexForSourceGroup[source],
      }))

    const searchesToRun = [localSearchToRun, ...federatedSearchesToRun].filter(
      (search) => search.srcs.length > 0
    )

    if (searchesToRun.length === 0) {
      announcement.announce({
        title: 'Search "' + this.get('title') + '" cannot be run.',
        message: properties.i18n['search.sources.selected.none.message'],
        type: 'warn',
      })
      this.currentSearches = []
      return
    }

    this.currentSearches = searchesToRun.map((search) => {
      delete search.sources // This key isn't used on the backend and only serves to confuse those debugging this code.

      // `result` is QueryResponse
      return result.fetch({
        customErrorHandling: true,
        data: JSON.stringify(search),
        remove: false,
        dataType: 'json',
        contentType: 'application/json',
        method: 'POST',
        processData: false,
        timeout: properties.timeout,
        success(model, response, options) {
          response.options = options
        },
        error(model, response, options) {
          if (response.status === 401) {
            const providerUrl = response.responseJSON.url
            const sourceId = response.responseJSON.id

            const link = React.createElement(
              'a',
              {
                href: providerUrl,
                target: '_blank',
                style: {
                  color: `${(props) =>
                    readableColor(props.theme.negativeColor)}`,
                },
              },
              `Click Here To Authenticate ${sourceId}`
            )
            announcement.announce({
              title: `Source ${sourceId} is Not Authenticated`,
              message: link,
              type: 'error',
            })
          }

          response.options = options
        },
      })
    })
    if (typeof done === 'function') {
      done(this.currentSearches)
    }
  },
  currentSearches: [],
  cancelCurrentSearches() {
    this.currentSearches.forEach((request) => {
      request.abort('Canceled')
    })
    const result = this.get('result')
    if (result) {
      result.get('lazyResults').cancel()
    }
    this.currentSearches = []
  },
  clearResults() {
    this.cancelCurrentSearches()
    this.set({
      result: undefined,
    })
  },
  setSources(sources) {
    const sourceArr = []
    sources.each((src) => {
      if (src.get('available') === true) {
        sourceArr.push(src.get('id'))
      }
    })
    if (sourceArr.length > 0) {
      this.set('sources', sourceArr.join(','))
    } else {
      this.set('sources', '')
    }
  },
  getId() {
    if (this.get('id')) {
      return this.get('id')
    } else {
      const id = this._cloneOf || this.id || Common.generateUUID()
      this.set('id')
      return id
    }
  },
  setColor(color) {
    this.set('color', color)
  },
  getColor() {
    return this.get('color')
  },
  color() {
    return this.get('color')
  },
  getPreviousServerPage() {
    this.setNextIndexForSourceGroupToPrevPage()
    this.startSearch()
  },
  /**
   * Much simpler than seeing if a next page exists
   */
  hasPreviousServerPage() {
    return this.pastIndexesForSourceGroup.length > 0
  },
  hasNextServerPage() {
    const currentStatus = this.get('result')
      ? this.get('result').get('lazyResults').status
      : {}
    const harvestedSources = Sources.getHarvested()
    const isLocal = (id) => {
      return harvestedSources.includes(id)
    }
    const maxIndexSeenLocal =
      Object.values(currentStatus)
        .filter((status) => isLocal(status.id))
        .reduce((amt, status) => {
          amt = amt + status.count
          return amt
        }, 0) + this.currentIndexForSourceGroup.local
    const maxIndexPossibleLocal = Object.values(currentStatus)
      .filter((status) => isLocal(status.id))
      .reduce((amt, status) => {
        amt = amt + status.hits
        return amt
      }, 0)
    if (maxIndexSeenLocal <= maxIndexPossibleLocal) {
      return true
    }

    return Object.values(currentStatus)
      .filter((status) => !isLocal(status.id))
      .some((status) => {
        const maxIndexPossible = status.hits
        const count = status.count
        const maxIndexSeen = count + this.currentIndexForSourceGroup[status.id]
        return maxIndexSeen <= maxIndexPossible
      })
  },
  getNextServerPage() {
    this.setNextIndexForSourceGroupToNextPage(this.getSelectedSources())
    this.startSearch()
  },
  resetCurrentIndexForSourceGroup() {
    this.currentIndexForSourceGroup = {}
    if (this.get('result')) {
      this.get('result').get('lazyResults')._resetSources([])
    }
    this.setNextIndexForSourceGroupToNextPage(this.getSelectedSources())
    this.pastIndexesForSourceGroup = []
  },
  currentIndexForSourceGroup: {},
  pastIndexesForSourceGroup: [],
  nextIndexForSourceGroup: {},
  /**
   * Update the next index to be the prev page
   */
  setNextIndexForSourceGroupToPrevPage() {
    if (this.pastIndexesForSourceGroup.length > 0) {
      this.nextIndexForSourceGroup = this.pastIndexesForSourceGroup.pop()
    } else {
      console.log('this should not happen')
    }
  },
  /**
   * Update the next index to be the next page
   */
  setNextIndexForSourceGroupToNextPage(sources) {
    this.pastIndexesForSourceGroup.push(this.nextIndexForSourceGroup)
    this.nextIndexForSourceGroup = this._calculateNextIndexForSourceGroupNextPage(
      sources
    )
  },
  /**
   * Get what the next index should be for going forward
   */
  _calculateNextIndexForSourceGroupNextPage(sources) {
    const harvestedSources = Sources.getHarvested()
    const isLocal = (id) => {
      return harvestedSources.includes(id)
    }
    const federatedSources = sources.filter((id) => {
      return !isLocal(id)
    })
    const currentStatus = this.get('result')
      ? this.get('result').get('lazyResults').status
      : {}

    const maxLocalStart = Math.max(
      1,
      Object.values(currentStatus)
        .filter((status) => isLocal(status.id))
        .filter((status) => status.hits !== undefined)
        .reduce((blob, status) => {
          return blob + status.hits
        }, 1)
    )
    return Object.values(currentStatus).reduce(
      (blob, status) => {
        if (isLocal(status.id)) {
          blob['local'] = Math.min(maxLocalStart, blob['local'] + status.count)
        } else {
          blob[status.id] = Math.min(
            status.hits !== undefined ? status.hits + 1 : 1,
            blob[status.id] + status.count
          )
        }
        return blob
      },
      {
        local: 1,
        ...federatedSources.reduce((blob, id) => {
          blob[id] = 1
          return blob
        }, {}),
        ...this.currentIndexForSourceGroup,
      }
    )
  },
})
module.exports = Query
