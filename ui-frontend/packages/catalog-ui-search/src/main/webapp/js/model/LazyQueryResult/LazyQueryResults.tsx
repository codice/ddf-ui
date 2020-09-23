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
import { ResultType } from '../Types'
import { generateCompareFunction } from './sort'
import { LazyQueryResult } from './LazyQueryResult'
// @ts-ignore ts-migrate(6133) FIXME: 'FilterType' is declared but its value is never re... Remove this comment to see the full error message
import { QuerySortType, FilterType } from './types'
import { Status } from './status'
const _ = require('underscore')
const debounceTime = 50

const user = require('../../../component/singletons/user-instance.js')
const Backbone = require('backbone')

export type SearchStatus = {
  [key: string]: Status
}

export type AttributeHighlight = {
  highlight: string
  attribute: string
  endIndex: string
  startIndex: string
}

export type AttributeHighlights = {
  [key: string]: Array<AttributeHighlight>
}

export type ResponseHighlightType = Array<{
  id: string
  highlights: Array<AttributeHighlight>
}>

// update to store as attr map to highlight details
type TransformedHighlightsType = {
  [key: string]: AttributeHighlights
}

type ConstructorProps = {
  results?: ResultType[]
  sorts?: QuerySortType[]
  sources?: string[]
}

type SubscribableType = 'status' | 'filteredResults' | 'selectedResults'
type SubscriptionType = { [key: string]: () => void }
/**
 * Constructed with performance in mind, taking advantage of maps whenever possible.
 * This is the heart of our app, so take care when updating / adding things here to
 * do it with performance in mind.
 *
 */
export class LazyQueryResults {
  ['subscriptionsToOthers.result.isSelected']: (() => void)[];
  ['subscriptionsToOthers.result.backboneCreated']: (() => void)[];
  ['subscriptionsToMe.status']: SubscriptionType;
  ['subscriptionsToMe.filteredResults']: SubscriptionType;
  ['subscriptionsToMe.selectedResults']: SubscriptionType
  subscribeTo({
    subscribableThing,
    callback,
  }: {
    subscribableThing: SubscribableType
    callback: () => void
  }) {
    const id = Math.random().toString()

    // @ts-ignore ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
    this[`subscriptionsToMe.${subscribableThing}`][id] = callback
    return () => {
      // @ts-ignore ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
      delete this[`subscriptionsToMe.${subscribableThing}`][id]
    }
  }
  _notifySubscribers(subscribableThing: SubscribableType) {
    // @ts-ignore ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
    const subscribers = this[
      `subscriptionsToMe.${subscribableThing}`
    ] as SubscriptionType
    Object.values(subscribers).forEach((callback) => callback())
  }
  ['_notifySubscribers.status']() {
    this._notifySubscribers('status')
  }
  ['_notifySubscribers.filteredResults']() {
    this._notifySubscribers('filteredResults')
  }
  ['_notifySubscribers.selectedResults']() {
    this._notifySubscribers('selectedResults')
  }
  _turnOnDebouncing() {
    this['_notifySubscribers.status'] = _.debounce(
      this['_notifySubscribers.status'],
      debounceTime
    )
    this['_notifySubscribers.filteredResults'] = _.debounce(
      this['_notifySubscribers.filteredResults'],
      debounceTime
    )
    this['_notifySubscribers.selectedResults'] = _.debounce(
      this['_notifySubscribers.selectedResults'],
      debounceTime
    )
  }
  compareFunction: (a: LazyQueryResult, b: LazyQueryResult) => number
  results: {
    [key: string]: LazyQueryResult
  }
  selectedResults: {
    [key: string]: LazyQueryResult
  }
  _getMaxIndexOfSelectedResults() {
    return Object.values(this.selectedResults).reduce((max, result) => {
      return Math.max(max, result.index)
    }, -1)
  }
  _getMinIndexOfSelectedResults() {
    return Object.values(this.selectedResults).reduce((min, result) => {
      return Math.min(min, result.index)
    }, Object.keys(this.results).length)
  }
  /**
   * This is used mostly by
   */
  groupSelect() {}
  /**
   * This will set swathes of sorted results to be selected.  It does not deselect anything.
   * Primarily used in the list view (card / table)
   */
  shiftSelect(target: LazyQueryResult) {
    const firstIndex = this._getMinIndexOfSelectedResults()
    const lastIndex = this._getMaxIndexOfSelectedResults()
    const indexClicked = target.index
    if (Object.keys(this.selectedResults).length === 0) {
      target.setSelected(target.isSelected)
    } else if (indexClicked <= firstIndex) {
      // traverse from target to next until firstIndex
      let currentItem = target as LazyQueryResult | undefined
      while (currentItem && currentItem.index <= firstIndex) {
        currentItem.setSelected(true)
        currentItem = currentItem.next
      }
    } else if (indexClicked >= lastIndex) {
      // traverse from target to prev until lastIndex
      let currentItem = target as LazyQueryResult | undefined
      while (currentItem && currentItem.index >= lastIndex) {
        currentItem.setSelected(true)
        currentItem = currentItem.prev
      }
    } else {
      // traverse from target to prev until something doesn't change
      let currentItem = target as LazyQueryResult | undefined
      let changed = true
      while (currentItem && changed) {
        changed = currentItem.setSelected(true) && changed
        currentItem = currentItem.prev
      }
    }
  }
  /**
   * This takes a list of ids to set to selected, and will deselect all others.
   */
  selectByIds(targets: string[]) {
    this.deselect()
    targets.forEach((id) => {
      if (this.results[id]) {
        this.results[id].setSelected(true)
      }
    })
  }
  controlSelect(target: LazyQueryResult) {
    target.setSelected(!target.isSelected)
  }
  /**
   * This will toggle selection of the lazyResult passed in, and deselect all others.
   */
  select(target: LazyQueryResult) {
    const isSelected = !target.isSelected
    this.deselect()
    target.setSelected(isSelected)
  }
  deselect() {
    Object.values(this.selectedResults).forEach((result) => {
      result.setSelected(false)
    })
  }
  backboneModel: Backbone.Model
  /**
   * Can contain distance / best text match
   * (this matches what the query requested)
   */
  persistantSorts: QuerySortType[]
  /**
   * on the fly sorts (user prefs), so no distance or best text match
   * (this is a user pref aka client side only)
   */
  ephemeralSorts: QuerySortType[]
  /**
   *  Should really only be set at constructor time (moment a query is done)
   */
  _updatePersistantSorts(sorts: QuerySortType[]) {
    this.persistantSorts = sorts
  }
  /**
   *  Should be updated based on user prefs at the current moment,
   *  And respond to updates to those prefs on the fly.
   */
  _updateEphemeralSorts() {
    this.ephemeralSorts = user.getPreferences().get('resultSort') || []
  }
  _getSortedResults(results: LazyQueryResult[]) {
    return results.sort(
      generateCompareFunction(
        this.ephemeralSorts.length > 0
          ? this.ephemeralSorts
          : this.persistantSorts
      )
    )
  }
  /**
   * The map of results will ultimately be the source of truth here
   * Maps guarantee chronological order for Object.keys operations,
   * so we turn it into an array to sort then feed it back into a map.
   *
   * On resort we have to update the links between results (used for selecting performantly),
   * as well as the indexes which are used similarly
   *
   */
  _resort() {
    this.results = this._getSortedResults(Object.values(this.results)).reduce(
      (blob, result, index, results) => {
        result.index = index
        result.prev = results[index - 1]
        result.next = results[index + 1]
        blob[result['metacard.id']] = result
        return blob
      },
      {} as { [key: string]: LazyQueryResult }
    )
  }
  constructor({
    results = [],
    sorts = [],
    sources = [],
  }: ConstructorProps = {}) {
    this._updateEphemeralSorts()
    this.reset({ results, sorts, sources })

    this.backboneModel = new Backbone.Model({
      id: Math.random().toString(),
    })
    this.backboneModel.listenTo(
      user,
      'change:user>preferences>resultSort',
      () => {
        this._updateEphemeralSorts()
        /**
         * No need to resort because the query will re-execute.  We do need to update things though, so when all sources return we can sort appropriately.
         */
        // this._resort()
        // this['_notifySubscribers.filteredResults']()
      }
    )
  }
  init() {
    this.currentAsOf = Date.now()
    if (this['subscriptionsToOthers.result.isSelected'])
      this['subscriptionsToOthers.result.isSelected'].forEach((unsubscribe) => {
        unsubscribe()
      })
    if (this['subscriptionsToOthers.result.backboneCreated'])
      this['subscriptionsToOthers.result.backboneCreated'].forEach(
        (unsubscribe) => {
          unsubscribe()
        }
      )
    this['subscriptionsToOthers.result.backboneCreated'] = []
    this['subscriptionsToOthers.result.isSelected'] = []
    this._resetSelectedResults()
    if (this['subscriptionsToMe.filteredResults'] === undefined)
      this['subscriptionsToMe.filteredResults'] = {}
    if (this['subscriptionsToMe.selectedResults'] === undefined)
      this['subscriptionsToMe.selectedResults'] = {}
    if (this['subscriptionsToMe.status'] === undefined)
      this['subscriptionsToMe.status'] = {}
    this.results = {}
    this.types = {}
    this.sources = []
    this.status = {}
  }
  _resetSelectedResults() {
    const shouldNotify =
      this.selectedResults !== undefined &&
      Object.keys(this.selectedResults).length > 0
    this.selectedResults = {}
    if (shouldNotify) this['_notifySubscribers.selectedResults']()
  }
  reset({ results = [], sorts = [], sources = [] }: ConstructorProps = {}) {
    this.init()
    this.resetDidYouMeanFields()
    this.resetShowingResultsForFields()
    this._resetSources(sources)
    this._updatePersistantSorts(sorts)
    this.add({ results })
  }
  destroy() {
    this.backboneModel.stopListening()
  }
  isEmpty() {
    return Object.keys(this.results).length === 0
  }
  add({
    results = [],
    highlights = [],
  }: { results?: ResultType[]; highlights?: ResponseHighlightType } = {}) {
    const highlightMap = highlights.reduce((blob, highlight) => {
      blob[highlight.id] = highlight.highlights.reduce(
        (innerblob, subhighlight) => {
          innerblob[subhighlight.attribute] = highlight.highlights.filter(
            (hl) => hl.attribute === subhighlight.attribute
          )
          return innerblob
        },
        {} as { [key: string]: Array<AttributeHighlight> }
      )
      return blob
    }, {} as TransformedHighlightsType)
    results.forEach((result) => {
      const lazyResult = new LazyQueryResult(
        result,
        highlightMap[result.metacard.properties.id]
      )
      this.results[lazyResult['metacard.id']] = lazyResult
      lazyResult.parent = this
      /**
       * Keep a fast lookup of what results are selected
       */
      this['subscriptionsToOthers.result.isSelected'].push(
        lazyResult.subscribeTo({
          subscribableThing: 'selected',
          callback: () => {
            this._updateSelectedResults({ lazyResult })
          },
        })
      )
      /**
       * When a backbone model is created we want to start listening for updates so the plain object has the same information
       */
      this['subscriptionsToOthers.result.backboneCreated'].push(
        lazyResult.subscribeTo({
          subscribableThing: 'backboneCreated',
          callback: () => {
            this.backboneModel.listenTo(
              lazyResult.getBackbone(),
              'change:metacard>properties refreshdata',
              () => {
                lazyResult.syncWithBackbone()
                /**
                 * Commenting this part out for now, as this is an expensive thing and I'm not 100% users would actually expect a result to resort on the fly after updating it.
                 */
                // this._resort()
                // this['_notifySubscribers.filteredResults']()
              }
            )
          },
        })
      )
    })
    this._resort()
    this['_notifySubscribers.filteredResults']()
  }
  _updateSelectedResults({ lazyResult }: { lazyResult: LazyQueryResult }) {
    if (lazyResult.isSelected) {
      this.selectedResults[lazyResult['metacard.id']] = lazyResult
    } else {
      delete this.selectedResults[lazyResult['metacard.id']]
    }
    this['_notifySubscribers.selectedResults']()
  }
  types: MetacardTypes
  addTypes(types: MetacardTypes) {
    this.types = {
      ...this.types,
      ...types,
    }
  }
  getCurrentAttributes() {
    return Object.keys(
      Object.values(this.types).reduce((blob, definition) => {
        return {
          ...blob,
          ...definition,
        }
      }, {})
    )
  }
  sources: string[]
  _resetSources(sources: string[]) {
    this.sources = sources
    this._resetStatus()
  }
  _resetStatus() {
    this.status = this.sources.reduce((blob, source) => {
      blob[source] = new Status({ id: source })
      return blob
    }, {} as SearchStatus)
    this._updateIsSearching()
    this['_notifySubscribers.status']()
  }
  cancel() {
    Object.keys(status).forEach((id) => {
      if (this.status[id].hasReturned === false) {
        this.status[id].updateStatus({
          hasReturned: true,
          message: 'Canceled by user',
          successful: false,
        })
      }
    })
    this._updateIsSearching()
    this['_notifySubscribers.status']()
  }
  updateStatus(status: SearchStatus) {
    Object.keys(status).forEach((id) => {
      this.status[id].updateStatus(status[id])
    })
    this._updateIsSearching()
    this['_notifySubscribers.status']()
  }
  updateStatusWithError({
    sources,
    message,
  }: {
    sources: string[]
    message: string
  }) {
    sources.forEach((id) => {
      if (this.status[id])
        this.status[id].updateStatus({
          message,
          successful: false,
        })
    })
    this._updateIsSearching()
    this['_notifySubscribers.status']()
  }
  _updateIsSearching() {
    this.isSearching = Object.values(this.status).some((status) => {
      return !status.hasReturned
    })
  }
  isSearching: boolean
  currentAsOf: number
  status: SearchStatus
  updateDidYouMeanFields(update: any[] | null) {
    if (update !== null)
      this.didYouMeanFields = [...this.didYouMeanFields, ...update]
  }
  resetDidYouMeanFields() {
    this.didYouMeanFields = []
  }
  didYouMeanFields: any[]
  updateShowingResultsForFields(update: any[] | null) {
    if (update !== null)
      this.showingResultsForFields = [
        ...this.showingResultsForFields,
        ...update,
      ]
  }
  resetShowingResultsForFields() {
    this.showingResultsForFields = []
  }
  showingResultsForFields: any[]
}

type MetacardTypes = {
  [key: string]: {
    [key: string]: {
      format: string
      multivalued: boolean
      indexed: boolean
    }
  }
}
