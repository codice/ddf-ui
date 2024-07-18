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
import QueryResponse from './QueryResponse'
import { postSimpleAuditLog } from '../../react-component/utils/audit/audit-endpoint'
import cql from '../cql'
import _merge from 'lodash/merge'
import _cloneDeep from 'lodash.clonedeep'
import { v4 } from 'uuid'
import 'backbone-associations'
import { LazyQueryResults } from './LazyQueryResult/LazyQueryResults'
import {
  FilterBuilderClass,
  FilterClass,
  isFilterBuilderClass,
} from '../../component/filter-builder/filter.structure'
import { downgradeFilterTreeToBasic } from '../../component/query-basic/query-basic.view'
import {
  getConstrainedFinalPageForSourceGroup,
  getCurrentStartAndEndForSourceGroup,
  getNextPageForSourceGroup,
  getPreviousPageForSourceGroup,
  hasNextPageForSourceGroup,
  hasPreviousPageForSourceGroup,
  IndexForSourceGroupType,
  QueryStartAndEndType,
} from './Query.methods'
import wreqr from '../wreqr'
import { CommonAjaxSettings } from '../AjaxSettings'
import { StartupDataStore } from './Startup/startup'
export type QueryType = {
  constructor: (_attributes: any, options: any) => void
  set: (p1: any, p2?: any, p3?: any) => void
  toJSON: () => any
  defaults: () => any
  resetToDefaults: (overridenDefaults: any) => void
  applyDefaults: () => void
  revert: () => void
  isLocal: () => boolean
  _handleDeprecatedFederation: (attributes: any) => void
  initialize: (attributes: any) => void
  getSelectedSources: () => Array<any>
  buildSearchData: () => any
  isOutdated: () => boolean
  startSearchIfOutdated: () => void
  updateCqlBasedOnFilterTree: () => void
  initializeResult: (options?: any) => {
    data: any
    selectedSources: any
    isHarvested: any
    isFederated: any
    result: any
    resultOptions: any
  }
  startSearchFromFirstPage: (options?: any, done?: any) => void
  startSearch: (options?: any, done?: any) => void
  currentSearches: Array<any>
  cancelCurrentSearches: () => void
  clearResults: () => void
  setSources: (sources: any) => void
  setColor: (color: any) => void
  getColor: () => any
  color: () => any
  currentIndexForSourceGroup: IndexForSourceGroupType
  nextIndexForSourceGroup: IndexForSourceGroupType
  pastIndexesForSourceGroup: Array<IndexForSourceGroupType>
  getPreviousServerPage: () => void
  hasPreviousServerPage: () => boolean
  hasNextServerPage: () => boolean
  getNextServerPage: () => void
  getHasFirstServerPage: () => boolean
  getFirstServerPage: () => void
  getHasLastServerPage: () => boolean
  getLastServerPage: () => void
  resetCurrentIndexForSourceGroup: () => void
  setNextIndexForSourceGroupToPrevPage: () => void
  setNextIndexForSourceGroupToNextPage: (sources: string[]) => void
  getCurrentStartAndEndForSourceGroup: () => QueryStartAndEndType
  [key: string]: any
}
function limitToDeleted(cqlFilterTree: any) {
  return new FilterBuilderClass({
    type: 'AND',
    filters: [
      cqlFilterTree,
      new FilterClass({
        property: '"metacard-tags"',
        type: 'ILIKE',
        value: 'deleted',
      }),
      new FilterClass({
        property: '"metacard.deleted.tags"',
        type: 'ILIKE',
        value: 'resource',
      }),
    ],
  })
}
function limitToHistoric(cqlFilterTree: any) {
  return new FilterBuilderClass({
    type: 'AND',
    filters: [
      cqlFilterTree,
      new FilterClass({
        property: '"metacard-tags"',
        type: 'ILIKE',
        value: 'revision',
      }),
    ],
  })
}
export default Backbone.AssociatedModel.extend({
  relations: [
    {
      type: Backbone.One,
      key: 'result',
      relatedModel: QueryResponse,
      isTransient: true,
    },
  ],
  // override constructor slightly to ensure options / attributes are available on the self ref immediately
  constructor(attributes: any, options: any) {
    if (
      !options ||
      !options.transformDefaults ||
      !options.transformFilterTree ||
      !options.transformSorts ||
      !options.transformCount
    ) {
      throw new Error(
        'Options for transformDefaults, transformFilterTree, transformSorts, and transformCount must be provided'
      )
    }
    this._constructorAttributes = attributes || {}
    this.options = options
    return Backbone.AssociatedModel.apply(this, arguments)
  },
  set(data: any, value: any, options: any) {
    try {
      switch (typeof data) {
        case 'object':
          if (
            data.filterTree !== undefined &&
            typeof data.filterTree === 'string'
          ) {
            data.filterTree = JSON.parse(data.filterTree)
          }
          if (!isFilterBuilderClass(data.filterTree)) {
            data.filterTree = new FilterBuilderClass(data.filter)
          }
          break
        case 'string':
          if (data === 'filterTree') {
            if (typeof value === 'string') {
              value = JSON.parse(value)
            }
            if (!isFilterBuilderClass(value)) {
              value = new FilterBuilderClass(value)
            }
          }
          break
      }
    } catch (e) {
      console.error(e)
    }
    return Backbone.AssociatedModel.prototype.set.apply(this, [
      data,
      value,
      options,
    ])
  },
  toJSON(...args: any) {
    const json = Backbone.AssociatedModel.prototype.toJSON.call(this, ...args)
    if (typeof json.filterTree === 'object') {
      json.filterTree = JSON.stringify(json.filterTree)
    }
    return json
  },
  defaults() {
    const filterTree = this._constructorAttributes?.filterTree
    let constructedFilterTree: FilterBuilderClass
    let constructedCql = this._constructorAttributes?.cql || "anyText ILIKE '*'"
    if (filterTree && typeof filterTree === 'string') {
      constructedFilterTree = new FilterBuilderClass(JSON.parse(filterTree))
    } else if (!filterTree || filterTree.id === undefined) {
      // when we make drastic changes to filter tree it will be necessary to fall back to cql and reconstruct a filter tree that's compatible
      constructedFilterTree = cql.read(constructedCql)
      console.warn('migrating a filter tree to the latest structure')
      // allow downstream projects to handle how they want to inform users of migrations
      ;(wreqr as any).vent.trigger('filterTree:migration', {
        search: this,
      })
    } else {
      constructedFilterTree = new FilterBuilderClass(filterTree)
    }
    return this.options.transformDefaults({
      originalDefaults: {
        cql: constructedCql,
        filterTree: constructedFilterTree,
        associatedFormModel: undefined,
        excludeUnnecessaryAttributes: true,
        count: StartupDataStore.Configuration.getResultCount(),
        start: 1,
        sorts: [
          {
            attribute: 'modified',
            direction: 'descending',
          },
        ],
        sources: ['all'],
        // initialize this here so we can avoid creating spurious references to LazyQueryResults objects
        result: new QueryResponse({
          lazyResults: new LazyQueryResults({
            filterTree: constructedFilterTree,
            sorts: [],
            sources: [],
            transformSorts: ({ originalSorts }) => {
              return this.options.transformSorts({
                originalSorts,
                queryRef: this,
              })
            },
          }),
        }),
        type: 'text',
        isLocal: false,
        isOutdated: false,
        'detail-level': undefined,
        spellcheck: false,
        phonetics: false,
        additionalOptions: '{}',
      },
      queryRef: this,
    })
  },
  /**
   *  Add filterTree in here, since initialize is only run once (and defaults can't have filterTree)
   */
  resetToDefaults(overridenDefaults: any) {
    const defaults = _.omit(
      {
        ...this.defaults(),
        filterTree: new FilterBuilderClass({
          filters: [
            new FilterClass({
              property: 'anyText',
              value: '*',
              type: 'ILIKE',
            }),
          ],
          type: 'AND',
        }),
      },
      ['isLocal', 'result']
    )
    this.set(_merge(defaults, overridenDefaults))
    this.trigger('resetToDefaults')
  },
  applyDefaults() {
    this.set(_.pick(this.defaults(), ['sorts', 'sources']))
  },
  revert() {
    this.trigger('revert')
  },
  isLocal() {
    return this.get('isLocal')
  },
  _handleDeprecatedFederation(attributes: any) {
    if (attributes && attributes.federation) {
      console.error(
        'Attempt to set federation on a search.  This attribute is deprecated.  Did you mean to set sources?'
      )
    }
  },
  initialize(attributes: any) {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    _.bindAll.apply(_, [this].concat(_.functions(this))) // underscore bindAll does not take array arg
    this._handleDeprecatedFederation(attributes)
    this.listenTo(
      this,
      'change:cql change:filterTree change:sources change:sorts change:spellcheck change:phonetics change:count change:additionalOptions',
      () => {
        this.set('isOutdated', true)
      }
    )
    this.listenTo(this, 'change:filterTree', () => {
      this.get('result')
        .get('lazyResults')
        ._resetFilterTree(this.get('filterTree'))
    })
    // basically remove invalid filters when going from basic to advanced, and make it basic compatible
    this.listenTo(this, 'change:type', () => {
      if (this.get('type') === 'basic') {
        const cleanedUpFilterTree = cql.removeInvalidFilters(
          this.get('filterTree')
        )
        this.set(
          'filterTree',
          downgradeFilterTreeToBasic(cleanedUpFilterTree as any)
        )
      }
    })
  },
  getSelectedSources() {
    const Sources = StartupDataStore.Sources.sources
    const sourceIds = Sources.map((src) => src.id)
    const localSourceIds = Sources.filter((source) => source.harvested).map(
      (src) => src.id
    )
    const remoteSourceIds = Sources.filter((source) => !source.harvested).map(
      (src) => src.id
    )
    const selectedSources = this.get('sources')
    let sourceArray = selectedSources
    if (selectedSources.includes('all')) {
      sourceArray = sourceIds
    }
    if (selectedSources.includes('local')) {
      sourceArray = sourceArray
        .concat(localSourceIds)
        .filter((src: any) => src !== 'local')
    }
    if (selectedSources.includes('remote')) {
      sourceArray = sourceArray
        .concat(remoteSourceIds)
        .filter((src: any) => src !== 'remote')
    }
    return sourceArray
  },
  buildSearchData() {
    const data = this.toJSON()
    data.sources = this.getSelectedSources()
    data.count = this.options.transformCount({
      originalCount: this.get('count'),
      queryRef: this,
    })
    data.sorts = this.options.transformSorts({
      originalSorts: this.get('sorts'),
      queryRef: this,
    })
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
      'phonetics',
      'additionalOptions'
    )
  },
  isOutdated() {
    return this.get('isOutdated')
  },
  startSearchIfOutdated() {
    if (this.isOutdated()) {
      this.startSearch()
    }
  },
  /**
   * We only keep filterTree up to date, then when we interact with the server we write out what it means
   *
   * We do this for performance, and because transformation is lossy.
   *
   * Also notice that we do a slight bit of validation, so anything that has no filters will translate to a star query (everything)
   */
  updateCqlBasedOnFilterTree() {
    const filterTree = this.get('filterTree')
    if (
      !filterTree ||
      filterTree.filters === undefined ||
      filterTree.filters.length === 0
    ) {
      this.set(
        'filterTree',
        new FilterBuilderClass({
          filters: [
            new FilterClass({ value: '*', property: 'anyText', type: 'ILIKE' }),
          ],
          type: 'AND',
        })
      )
      this.updateCqlBasedOnFilterTree()
    } else {
      this.set('cql', cql.write(filterTree))
    }
  },
  startSearchFromFirstPage(options: any, done: any) {
    this.updateCqlBasedOnFilterTree()
    this.resetCurrentIndexForSourceGroup()
    this.startSearch(options, done)
  },
  initializeResult(options: any) {
    const Sources = StartupDataStore.Sources.sources
    options = _.extend(
      {
        limitToDeleted: false,
        limitToHistoric: false,
      },
      options
    )
    const data = _cloneDeep(this.buildSearchData())
    data.batchId = v4()
    // Data.sources is set in `buildSearchData` based on which sources you have selected.
    let selectedSources = data.sources
    const harvestedSources = Sources.filter((source) => source.harvested).map(
      (source) => source.id
    )
    const isHarvested = (id: any) => harvestedSources.includes(id)
    const isFederated = (id: any) => !harvestedSources.includes(id)
    if (options.limitToDeleted) {
      selectedSources = data.sources.filter(isHarvested)
    }
    let result = this.get('result')
    result.get('lazyResults').reset({
      filterTree: this.get('filterTree'),
      sorts: this.get('sorts'),
      sources: selectedSources,
      transformSorts: ({ originalSorts }: any) => {
        return this.options.transformSorts({ originalSorts, queryRef: this })
      },
    })
    return {
      data,
      selectedSources,
      isHarvested,
      isFederated,
      result,
      resultOptions: options,
    }
  },
  startSearch(options: any, done: any) {
    this.trigger('panToShapesExtent')
    this.set('isOutdated', false)
    if (this.get('cql') === '') {
      return
    }
    this.cancelCurrentSearches()
    const {
      data,
      selectedSources,
      isHarvested,
      isFederated,
      result,
      resultOptions,
    } = this.initializeResult(options)
    data.fromUI = true
    let cqlFilterTree = this.get('filterTree')
    if (resultOptions.limitToDeleted) {
      cqlFilterTree = limitToDeleted(cqlFilterTree)
    } else if (resultOptions.limitToHistoric) {
      cqlFilterTree = limitToHistoric(cqlFilterTree)
    }
    let cqlString = this.options.transformFilterTree({
      originalFilterTree: cqlFilterTree,
      queryRef: this,
    })
    this.currentIndexForSourceGroup = this.nextIndexForSourceGroup

    postSimpleAuditLog({
      action: 'SEARCH_SUBMITTED',
      component:
        'query: [' + cqlString + '] sources: [' + selectedSources + ']',
    })

    const localSearchToRun = {
      ...data,
      cql: cqlString,
      srcs: selectedSources.filter(isHarvested),
      start: this.currentIndexForSourceGroup.local,
    }
    const federatedSearchesToRun = selectedSources
      .filter(isFederated)
      .map((source: any) => ({
        ...data,
        cql: cqlString,
        srcs: [source],
        start: this.currentIndexForSourceGroup[source],
      }))
    const searchesToRun = [localSearchToRun, ...federatedSearchesToRun].filter(
      (search) => search.srcs.length > 0
    )
    if (searchesToRun.length === 0) {
      // reset to all and run
      this.set('sources', ['all'])
      this.startSearchFromFirstPage()
      return
    }
    this.currentSearches = searchesToRun.map((search) => {
      delete search.sources // This key isn't used on the backend and only serves to confuse those debugging this code.
      // `result` is QueryResponse
      return result.fetch({
        ...CommonAjaxSettings,
        customErrorHandling: true,
        data: JSON.stringify(search),
        remove: false,
        dataType: 'json',
        contentType: 'application/json',
        method: 'POST',
        processData: false,
        timeout: StartupDataStore.Configuration.getSearchTimeout(),
        success(_model: any, response: any, options: any) {
          response.options = options
        },
        error(_model: any, response: any, options: any) {
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
    this.currentSearches.forEach((request: any) => {
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
  setSources(sources: any) {
    const sourceArr = [] as any
    sources.each((src: any) => {
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
  setColor(color: any) {
    this.set('color', color)
  },
  getColor() {
    return this.get('color')
  },
  color() {
    return this.get('color')
  },
  getPreviousServerPage() {
    this.nextIndexForSourceGroup = getPreviousPageForSourceGroup({
      currentIndexForSourceGroup: this.currentIndexForSourceGroup,
      count: this.get('count'),
    })
    // this.setNextIndexForSourceGroupToPrevPage()
    this.startSearch()
  },
  /**
   * Much simpler than seeing if a next page exists
   */
  hasPreviousServerPage() {
    return hasPreviousPageForSourceGroup({
      currentIndexForSourceGroup: this.currentIndexForSourceGroup,
    })
  },
  hasNextServerPage() {
    const Sources = StartupDataStore.Sources.sources
    const harvestedSources = Sources.filter((source) => source.harvested).map(
      (source) => source.id
    )
    return hasNextPageForSourceGroup({
      queryStatus: this.get('result')?.get('lazyResults')?.status,
      isLocal: (id) => {
        return harvestedSources.includes(id)
      },
      currentIndexForSourceGroup: this.currentIndexForSourceGroup,
      count: this.get('count'),
    })
  },
  getNextServerPage() {
    this.setNextIndexForSourceGroupToNextPage(this.getSelectedSources())
    this.startSearch()
  },
  getHasFirstServerPage() {
    // so technically always "true" but what we really mean is, are we not on page 1 already
    return this.hasPreviousServerPage()
  },
  getFirstServerPage() {
    this.startSearchFromFirstPage()
  },
  getHasLastServerPage() {
    // so technically always "true" but what we really mean is, are we not on last page already
    return this.hasNextServerPage()
  },
  getLastServerPage() {
    const Sources = StartupDataStore.Sources.sources
    const harvestedSources = Sources.filter((source) => source.harvested).map(
      (source) => source.id
    )
    this.nextIndexForSourceGroup = getConstrainedFinalPageForSourceGroup({
      queryStatus: this.get('result')?.get('lazyResults')?.status,
      isLocal: (id) => {
        return harvestedSources.includes(id)
      },
      count: this.get('count'),
    })
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
      this.nextIndexForSourceGroup = this.pastIndexesForSourceGroup.pop() || {}
    } else {
      console.error('this should not happen')
    }
  },
  /**
   * Update the next index to be the next page
   */
  setNextIndexForSourceGroupToNextPage(sources: string[]) {
    const Sources = StartupDataStore.Sources.sources
    const harvestedSources = Sources.filter((source) => source.harvested).map(
      (source) => source.id
    )
    this.pastIndexesForSourceGroup.push(this.nextIndexForSourceGroup)
    this.nextIndexForSourceGroup = getNextPageForSourceGroup({
      sources,
      currentIndexForSourceGroup: this.currentIndexForSourceGroup,
      count: this.get('count'),
      isLocal: (id) => {
        return harvestedSources.includes(id)
      },
    })
  },
  getCurrentStartAndEndForSourceGroup() {
    return getCurrentStartAndEndForSourceGroup({
      currentIndexForSourceGroup: this.currentIndexForSourceGroup,
      queryStatus: this.get('result')?.get('lazyResults')?.status,
    })
  },
} as QueryType)
