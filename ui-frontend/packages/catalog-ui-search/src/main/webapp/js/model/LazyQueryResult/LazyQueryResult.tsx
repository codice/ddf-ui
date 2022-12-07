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
import QueryResult from '../QueryResult'
import { LazyQueryResults, AttributeHighlights } from './LazyQueryResults'
import cql from '../../cql'
import _ from 'underscore'
import Sources from '../../../component/singletons/sources-instance'
import metacardDefinitions from '../../../component/singletons/metacard-definitions'
import { TypedMetacardDefs } from '../../../component/tabs/metacard/metacardDefinitions'
import properties from '../../properties'
import TurfMeta from '@turf/meta'
import wkx from 'wkx'
import {
  FilterBuilderClass,
  FilterClass,
} from '../../../component/filter-builder/filter.structure'
import Common from '../../Common'
const debounceTime = 50
import $ from 'jquery'
function getThumbnailAction(result: ResultType) {
  return result.actions.find(
    (action) => action.id === 'catalog.data.metacard.thumbnail'
  )
}
function cacheBustUrl(url: string): string {
  if (url && url.indexOf('_=') === -1) {
    let newUrl = url
    if (url.indexOf('?') >= 0) {
      newUrl += '&'
    } else {
      newUrl += '?'
    }
    newUrl += '_=' + Date.now()
    return newUrl
  }
  return url
}
function cacheBustThumbnail(plain: ResultType) {
  let url = plain.metacard.properties.thumbnail
  if (url) {
    plain.metacard.properties.thumbnail = cacheBustUrl(url)
  }
}
function humanizeResourceSize(plain: ResultType) {
  if (plain.metacard.properties['resource-size']) {
    plain.metacard.properties['resource-size'] = Common.getFileSize(
      plain.metacard.properties['resource-size']
    )
  }
}
/**
 * Add defaults, etc.  We need to make sure everything has a tag at the very least
 */
const transformPlain = ({
  plain,
}: {
  plain: LazyQueryResult['plain']
}): LazyQueryResult['plain'] => {
  if (!plain.metacard.properties['metacard-tags']) {
    plain.metacard.properties['metacard-tags'] = ['resource']
  }
  const thumbnailAction = getThumbnailAction(plain)
  if (thumbnailAction) {
    plain.metacard.properties.thumbnail = thumbnailAction.url
  }
  plain.metacardType = plain.metacard.properties['metacard-type']
  if (
    plain.metacardType === 'metacard.query' ||
    (plain.metacard.properties['metacard.deleted.tags'] &&
      plain.metacard.properties['metacard.deleted.tags'].includes('query'))
  ) {
    // since the plain cql search endpoint doesn't understand more complex properties on metacards, we can handle them like this
    // plain.metacard.properties.filterTree =
    //   plain.metacard.properties.filterTree &&
    //   typeof plain.metacard.properties.filterTree === 'string'
    //     ? JSON.parse(plain.metacard.properties.filterTree)
    //     : plain.metacard.properties.filterTree
    // we could do the same thing we do for filterTree in query to get rid of this, but it requires a lot of tech debt cleanup I think
    try {
      plain.metacard.properties.sorts =
        plain.metacard.properties.sorts &&
        typeof plain.metacard.properties.sorts[0] === 'string'
          ? (plain.metacard.properties.sorts as string[]).map((sort) => {
              const attribute = sort
                .split('attribute=')[1]
                .split(', direction=')[0]
              const direction = sort.split(', direction=')[1].slice(0, -1)
              return {
                attribute,
                direction,
              }
            })
          : plain.metacard.properties.sorts
    } catch (err) {
      plain.metacard.properties.sorts =
        plain.metacard.properties.sorts &&
        typeof plain.metacard.properties.sorts[0] === 'string'
          ? (plain.metacard.properties.sorts as string[]).map((sort) => {
              const attribute = sort.split(',')[0]
              const direction = sort.split(',')[1]
              return {
                attribute,
                direction,
              }
            })
          : plain.metacard.properties.sorts
    }
  }
  plain.metacard.id = plain.metacard.properties.id
  plain.id = plain.metacard.properties.id
  return plain
}
type SubscribableType =
  | 'backboneCreated'
  | 'selected'
  | 'filtered'
  | 'backboneSync'
type SubscriptionType = {
  [key: string]: () => void
}
export class LazyQueryResult {
  ['subscriptionsToMe.backboneCreated']: {
    [key: string]: () => void
  };
  ['subscriptionsToMe.backboneSync']: {
    [key: string]: () => void
  };
  ['subscriptionsToMe.selected']: {
    [key: string]: () => void
  };
  ['subscriptionsToMe.filtered']: {
    [key: string]: () => void
  }
  subscribeTo({
    subscribableThing,
    callback,
  }: {
    subscribableThing: SubscribableType
    callback: () => void
  }) {
    const id = Math.random().toString()
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    this[`subscriptionsToMe.${subscribableThing}`][id] = callback
    return () => {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      delete this[`subscriptionsToMe.${subscribableThing}`][id]
    }
  }
  _notifySubscribers(subscribableThing: SubscribableType) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const subscribers = this[
      `subscriptionsToMe.${subscribableThing}`
    ] as SubscriptionType
    Object.values(subscribers).forEach((callback) => callback())
  }
  ['_notifySubscribers.backboneCreated']() {
    this._notifySubscribers('backboneCreated')
  }
  ['_notifySubscribers.backboneSync']() {
    this._notifySubscribers('backboneSync')
  }
  ['_notifySubscribers.selected']() {
    this._notifySubscribers('selected')
  }
  ['_notifySubscribers.filtered']() {
    this._notifySubscribers('filtered')
  }
  _turnOnDebouncing() {
    this['_notifySubscribers.backboneCreated'] = _.debounce(
      this['_notifySubscribers.backboneCreated'],
      debounceTime
    )
    this['_notifySubscribers.backboneSync'] = _.debounce(
      this['_notifySubscribers.backboneSync'],
      debounceTime
    )
    this['_notifySubscribers.selected'] = _.debounce(
      this['_notifySubscribers.selected'],
      debounceTime
    )
    this['_notifySubscribers.filtered'] = _.debounce(
      this['_notifySubscribers.filtered'],
      debounceTime
    )
  }
  index: number
  prev?: LazyQueryResult
  next?: LazyQueryResult
  parent?: LazyQueryResults
  plain: ResultType
  backbone?: any
  isResourceLocal: boolean
  highlights: AttributeHighlights
  type: 'query-result';
  ['metacard.id']: string
  isSelected: boolean
  isFiltered: boolean
  constructor(plain: ResultType, highlights: AttributeHighlights = {}) {
    this.highlights = highlights
    this.type = 'query-result'
    this.plain = transformPlain({ plain })
    this.isResourceLocal = false || plain.isResourceLocal
    this['subscriptionsToMe.backboneCreated'] = {}
    this['subscriptionsToMe.backboneSync'] = {}
    this['subscriptionsToMe.selected'] = {}
    this['subscriptionsToMe.filtered'] = {}
    this['metacard.id'] = plain.metacard.properties.id
    this.isSelected = false
    this.isFiltered = false
    humanizeResourceSize(plain)
    cacheBustThumbnail(plain)
  }
  syncWithBackbone() {
    if (this.backbone) {
      this.plain = transformPlain({ plain: this.backbone.toJSON() })
      humanizeResourceSize(this.plain)
      cacheBustThumbnail(this.plain)
      this['_notifySubscribers.backboneSync']()
    }
  }
  syncWithPlain() {
    this.plain = transformPlain({ plain: { ...this.plain } })
    humanizeResourceSize(this.plain)
    cacheBustThumbnail(this.plain)
    this['_notifySubscribers.backboneSync']()
  }
  // this is a partial update (like title only or something)
  refreshFromEditResponse(
    response: [
      {
        ids: string[]
        attributes: [
          {
            attribute: string
            values: string[]
          }
        ]
      }
    ]
  ) {
    response.forEach((part) =>
      part.attributes.forEach((attribute) => {
        this.plain.metacard.properties[
          attribute.attribute
        ] = TypedMetacardDefs.isMulti({ attr: attribute.attribute })
          ? attribute.values
          : attribute.values[0]
      })
    )
    this.syncWithPlain()
  }
  // we have the entire metacard sent back
  refreshData(
    metacardProperties: LazyQueryResult['plain']['metacard']['properties']
  ) {
    if (metacardProperties !== undefined) {
      this.plain.metacard.properties = metacardProperties
      this.syncWithPlain()
    } else {
      this.refreshDataOverNetwork()
    }
  }
  // just ask the source of truth
  refreshDataOverNetwork() {
    //let solr flush
    setTimeout(() => {
      const req = {
        count: 1,
        cql: cql.write(
          new FilterBuilderClass({
            type: 'AND',
            filters: [
              new FilterBuilderClass({
                type: 'OR',
                filters: [
                  new FilterClass({
                    type: '=',
                    property: '"id"',
                    value:
                      this.plain.metacard.properties['metacard.deleted.id'] ||
                      this.plain.id,
                  }),
                  new FilterClass({
                    type: '=',
                    property: '"metacard.deleted.id"',
                    value: this.plain.id,
                  }),
                ],
              }),
              new FilterClass({
                type: 'ILIKE',
                property: '"metacard-tags"',
                value: '*',
              }),
            ],
          })
        ),
        id: '0',
        sort: 'modified:desc',
        src: this.plain.metacard.properties['source-id'],
        start: 1,
      }
      $.ajax({
        type: 'POST',
        url: './internal/cql',
        data: JSON.stringify(req),
        contentType: 'application/json',
      }).then(this.parseRefresh.bind(this), this.handleRefreshError.bind(this))
    }, 1000)
  }
  handleRefreshError() {
    //do nothing for now, should we announce this?
  }
  parseRefresh(response: { results: ResultType[] }) {
    response.results.forEach((result) => {
      this.plain = result
    })
    this.syncWithPlain()
  }
  isDownloadable(): boolean {
    return this.plain.metacard.properties['resource-download-url'] !== undefined
  }
  getPreview(): string {
    return this.plain.metacard.properties['ext.extracted.text']
  }
  hasPreview(): boolean {
    return this.plain.metacard.properties['ext.extracted.text'] !== undefined
  }
  isSearch(): boolean {
    return this.plain.metacard.properties['metacard-type'] === 'metacard.query'
  }
  isResource(): boolean {
    return (
      this.plain.metacard.properties['metacard-tags'].indexOf('resource') >= 0
    )
  }
  isRevision(): boolean {
    return (
      this.plain.metacard.properties['metacard-tags'].indexOf('revision') >= 0
    )
  }
  isDeleted(): boolean {
    return (
      this.plain.metacard.properties['metacard-tags'].indexOf('deleted') >= 0
    )
  }
  isRemote(): boolean {
    return (
      Sources.getHarvested().includes(
        this.plain.metacard.properties['source-id']
      ) === false
    )
  }
  hasGeometry(attribute?: any): boolean {
    return (
      _.filter(
        this.plain.metacard.properties,
        (_value: any, key: string) =>
          (attribute === undefined || attribute === key) &&
          metacardDefinitions.metacardTypes[key] &&
          metacardDefinitions.metacardTypes[key].type === 'GEOMETRY'
      ).length > 0
    )
  }
  getGeometries(attribute?: any): any {
    return _.filter(
      this.plain.metacard.properties,
      (_value: any, key: string) =>
        !properties.isHidden(key) &&
        (attribute === undefined || attribute === key) &&
        metacardDefinitions.metacardTypes[key] &&
        metacardDefinitions.metacardTypes[key].type === 'GEOMETRY'
    )
  }
  getPoints(attribute?: any): any {
    try {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      return this.getGeometries(attribute).reduce(
        (pointArray: any, wkt: any) =>
          pointArray.concat(
            TurfMeta.coordAll(wkx.Geometry.parse(wkt).toGeoJSON())
          ),
        []
      )
    } catch (err) {
      console.error(err)
      return []
    }
  }
  getMapActions() {
    return this.plain.actions.filter(
      (action) => action.id.indexOf('catalog.data.metacard.map.') === 0
    )
  }
  hasMapActions(): boolean {
    return this.getMapActions().length > 0
  }
  getExportActions() {
    const otherActions = this.getMapActions()
    return this.plain.actions
      .filter((action) => action.title.indexOf('Export') === 0)
      .filter((action) => otherActions.indexOf(action) === -1)
  }
  hasExportActions(): boolean {
    return this.getExportActions().length > 0
  }
  getOtherActions() {
    const otherActions = this.getExportActions().concat(this.getMapActions())
    return this.plain.actions.filter(
      (action) => otherActions.indexOf(action) === -1
    )
  }
  hasRelevance() {
    return Boolean(this.plain.relevance)
  }
  getRoundedRelevance() {
    return this.plain.relevance.toPrecision(
      (properties as any).relevancePrecision
    )
  }
  hasErrors() {
    return Boolean(this.getErrors())
  }
  getErrors() {
    return this.plain.metacard.properties['validation-errors']
  }
  hasWarnings() {
    return Boolean(this.getWarnings())
  }
  getWarnings() {
    return this.plain.metacard.properties['validation-warnings']
  }
  getColor() {
    return '#004949'
  }
  getBackbone() {
    if (this.backbone === undefined) {
      this._setBackbone(new QueryResult(this.plain))
    }
    return this.backbone
  }
  _setBackbone(backboneModel: Backbone.Model) {
    this.backbone = backboneModel
    this['_notifySubscribers.backboneCreated']()
  }
  setSelected(isSelected: boolean) {
    if (this.isSelected !== isSelected) {
      this.isSelected = isSelected
      this['_notifySubscribers.selected']()
      return true
    } else {
      return false
    }
  }
  shiftSelect() {
    if (this.parent) {
      this.parent.shiftSelect(this)
    }
  }
  controlSelect() {
    if (this.parent) {
      this.parent.controlSelect(this)
    }
  }
  select() {
    if (this.parent) {
      this.parent.select(this)
    }
  }
  setFiltered(isFiltered: boolean) {
    if (this.isFiltered !== isFiltered) {
      this.isFiltered = isFiltered
      this['_notifySubscribers.filtered']()
      return true
    } else {
      return false
    }
  }
  currentOverlayUrl?: string
}
