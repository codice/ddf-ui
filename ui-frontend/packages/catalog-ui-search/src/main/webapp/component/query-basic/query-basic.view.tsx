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
const _ = require('underscore')
const memoize = require('lodash/memoize')
const $ = require('jquery')
const CustomElements = require('../../js/CustomElements.js')
const wreqr = require('../../js/wreqr.js')
const IconHelper = require('../../js/IconHelper.js')
const PropertyView = require('../property/property.view.js')
const Property = require('../property/property.js')
const properties = require('../../js/properties.js')
const cql = require('../../js/cql.js')
const metacardDefinitions = require('../singletons/metacard-definitions.js')
import sources from '../singletons/sources-instance'
const CQLUtils = require('../../js/CQLUtils.js')
import QuerySettings from '../query-settings/query-settings'
const QueryTimeView = require('../query-time/query-time.view.js')
import query from '../../react-component/utils/query'

const METADATA_CONTENT_TYPE = 'metadata-content-type'
import { Drawing } from '../singletons/drawing'

function isNested(filter: any) {
  let nested = false
  filter.filters.forEach((subfilter: any) => {
    nested = nested || subfilter.filters
  })
  return nested
}

const requestMapRender = () => {
  // Required to force rendering of the 3D map after drawing is cleared.
  wreqr.vent.trigger('map:requestRender')
}

const turnOffDrawing = () => {
  wreqr.vent.trigger('search:drawend', Drawing.getDrawModel())
  requestMapRender()
}

function getMatchTypeAttribute() {
  return metacardDefinitions.metacardTypes[properties.basicSearchMatchType]
    ? properties.basicSearchMatchType
    : 'datatype'
}

const getMatchTypesPresentInResults = memoize(async () => {
  const matchTypeAttr = getMatchTypeAttribute()
  const json = await query({
    count: 0,
    cql: "anyText ILIKE '*'",
    facets: [matchTypeAttr],
  })
  const facets = json.facets[matchTypeAttr] || []
  return facets
    .map((facet: any) => facet.value)
    .sort((a: any, b: any) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((value: any) => ({
      label: value,
      value,
      class: 'icon ' + IconHelper.getClassByName(value),
    }))
})

function getAllValidValuesForMatchTypeAttribute() {
  const matchTypeAttr = getMatchTypeAttribute()
  return metacardDefinitions.enums[matchTypeAttr]
    ? metacardDefinitions.enums[matchTypeAttr].reduce(
        (enumMap: any, value: any) => {
          enumMap[value] = {
            label: value,
            value,
            class: 'icon ' + IconHelper.getClassByName(value),
          }
          return enumMap
        },
        {}
      )
    : {}
}

function getPredefinedMatchTypes() {
  const matchTypesMap = sources
    .toJSON()
    // @ts-ignore ts-migrate(2339) FIXME: Property 'flatMap' does not exist on type '{ avail... Remove this comment to see the full error message
    .flatMap((source: any) => source.contentTypes)
    .reduce((enumMap: any, contentType: any) => {
      if (contentType.value && !enumMap[contentType.value]) {
        enumMap[contentType.value] = {
          label: contentType.name,
          value: contentType.value,
          class: 'icon ' + IconHelper.getClassByName(contentType.value),
        }
      }
      return enumMap
    }, getAllValidValuesForMatchTypeAttribute())
  return Object.values(matchTypesMap)
}

async function getMatchTypes() {
  try {
    const facetedMatchTypes = await getMatchTypesPresentInResults()
    if (facetedMatchTypes.length > 0) {
      return Promise.resolve(facetedMatchTypes)
    }
    const predefinedMatchTypes = getPredefinedMatchTypes()
    return Promise.resolve(predefinedMatchTypes)
  } catch (error) {
    return Promise.reject(error)
  }
}

const NoMatchTypesView = Marionette.ItemView.extend({
  template() {
    return `No types found for '${getMatchTypeAttribute()}'.`
  },
})

function isTypeLimiter(filter: any) {
  const typesFound = _.uniq(filter.filters.map(CQLUtils.getProperty))
  const metadataContentTypeSupported = Boolean(
    metacardDefinitions.metacardTypes[METADATA_CONTENT_TYPE]
  )
  if (metadataContentTypeSupported) {
    return (
      typesFound.length === 2 &&
      typesFound.includes(METADATA_CONTENT_TYPE) &&
      typesFound.includes(getMatchTypeAttribute())
    )
  } else {
    return typesFound.length === 1 && typesFound[0] === getMatchTypeAttribute()
  }
}

// strip extra quotes
const stripQuotes = (property: any) => {
  return property.replace(/^"(.+(?="$))"$/, '$1')
}

function isAnyDate(filter: any) {
  if (!filter.filters) {
    return (
      metacardDefinitions.metacardTypes[stripQuotes(filter.property)].type ===
      'DATE'
    )
  }
  let typesFound = {} as any
  let valuesFound = {} as any
  filter.filters.forEach((subfilter: any) => {
    typesFound[subfilter.type] = true
    valuesFound[subfilter.value] = true
  })
  typesFound = Object.keys(typesFound)
  valuesFound = Object.keys(valuesFound)
  if (typesFound.length > 1 || valuesFound.length > 1) {
    return false
  } else {
    const attributes = filter.filters.map(
      (subfilter: any) => subfilter.property
    )
    return (
      metacardDefinitions.metacardTypes[stripQuotes(attributes[0])].type ===
      'DATE'
    )
  }
}

function handleAnyDateFilter(propertyValueMap: any, filter: any) {
  propertyValueMap['anyDate'] = propertyValueMap['anyDate'] || []
  let existingFilter = propertyValueMap['anyDate'].filter(
    (anyDateFilter: any) =>
      anyDateFilter.type ===
      (filter.filters ? filter.filters[0].type : filter.type)
  )[0]
  if (!existingFilter) {
    existingFilter = {
      property: [],
    }
    propertyValueMap['anyDate'].push(existingFilter)
  }
  existingFilter.property = existingFilter.property.concat(
    filter.filters
      ? filter.filters.map((subfilter: any) => stripQuotes(subfilter.property))
      : [stripQuotes(filter.property)]
  )
  existingFilter.type = filter.filters ? filter.filters[0].type : filter.type
  existingFilter.value = filter.filters ? filter.filters[0].value : filter.value

  if (existingFilter.type === 'DURING') {
    existingFilter.from = filter.filters ? filter.filters[0].from : filter.from
    existingFilter.to = filter.filters ? filter.filters[0].to : filter.to
  }
}

function translateFilterToBasicMap(filter: any) {
  const propertyValueMap = {} as any
  let downConversion = false

  if (!filter.filters && isAnyDate(filter)) {
    handleAnyDateFilter(propertyValueMap, filter)
  }

  if (filter.filters) {
    filter.filters.forEach((filter: any) => {
      if (!filter.filters && isAnyDate(filter)) {
        handleAnyDateFilter(propertyValueMap, filter)
      } else if (!filter.filters) {
        propertyValueMap[CQLUtils.getProperty(filter)] =
          propertyValueMap[CQLUtils.getProperty(filter)] || []
        if (
          propertyValueMap[CQLUtils.getProperty(filter)].filter(
            (existingFilter: any) => existingFilter.type === filter.type
          ).length === 0
        ) {
          propertyValueMap[CQLUtils.getProperty(filter)].push(filter)
        }
      } else if (!isNested(filter) && isAnyDate(filter)) {
        handleAnyDateFilter(propertyValueMap, filter)
      } else if (!isNested(filter) && isTypeLimiter(filter)) {
        propertyValueMap[CQLUtils.getProperty(filter.filters[0])] =
          propertyValueMap[CQLUtils.getProperty(filter.filters[0])] || []
        filter.filters.forEach((subfilter: any) => {
          propertyValueMap[CQLUtils.getProperty(filter.filters[0])].push(
            subfilter
          )
        })
      } else {
        downConversion = true
      }
    })
  } else {
    propertyValueMap[CQLUtils.getProperty(filter)] =
      propertyValueMap[CQLUtils.getProperty(filter)] || []
    propertyValueMap[CQLUtils.getProperty(filter)].push(filter)
  }
  return {
    propertyValueMap,
    downConversion,
  }
}

function getFilterTree(model: any) {
  if (typeof model.get('filterTree') === 'object') {
    return model.get('filterTree')
  }
  return cql.simplify(cql.read(model.get('cql')))
}

export default Marionette.LayoutView.extend({
  template() {
    return (
      <>
        <div data-id="basic-search-container" className="editor-properties">
          <div
            className="basic-text"
            data-help="Search by free text using the
    grammar of the underlying source.
    For wildcard searches, use * after or before partial keywords (e.g. *earth*)."
          />
          <div
            className="basic-text-match"
            data-help="Take casing of characters into account when searching by free text."
          />
          <div
            className="basic-time-details"
            data-help="Search based on absolute or relative
    time of the created, modified, or effective date."
          />
          <div
            className="basic-location-details"
            data-help="Search by latitude/longitude or the USNG
    using a line, polygon, point-radius, bounding box, or keyword. A keyword can be the name of a region, country, or city."
          >
            <div className="basic-location" />
            <div className="basic-location-specific" />
          </div>
          <div
            className="basic-type-details"
            data-help="Search for specific content types."
          >
            <div className="basic-type" />
            <div className="basic-type-specific" />
          </div>
          <div className="basic-settings">
            <QuerySettings model={this.model} />
          </div>
        </div>
      </>
    )
  },
  tagName: CustomElements.register('query-basic'),
  modelEvents: {},
  events: {
    'click .editor-edit': 'edit',
    'click .editor-cancel': 'cancel',
    'click .editor-save': 'save',
  },
  regions: {
    basicText: '.basic-text',
    basicTextMatch: '.basic-text-match',
    basicTime: '.basic-time-details',
    basicLocation: '.basic-location',
    basicLocationSpecific: '.basic-location-specific',
    basicType: '.basic-type',
    basicTypeSpecific: '.basic-type-specific',
  },
  ui: {},
  filter: undefined,
  onFirstRender() {
    this.listenTo(this.model, 'update', () => {
      this.save()
    })
  },
  onBeforeShow() {
    const filter = getFilterTree(this.model)
    const translationToBasicMap = translateFilterToBasicMap(filter)
    this.filter = translationToBasicMap.propertyValueMap
    this.handleDownConversion(translationToBasicMap.downConversion)
    this.setupTime()
    this.setupTextInput()
    this.setupTextMatchInput()

    this.setupLocation()
    this.setupLocationInput()
    this.setupType()
    this.setupTypeSpecific()

    this.listenTo(
      this.basicLocation.currentView.model,
      'change:value',
      this.handleLocationValue
    )
    this.listenTo(
      this.basicType.currentView.model,
      'change:value',
      this.handleTypeValue
    )

    this.handleLocationValue()
    this.handleTypeValue()
    this.edit()
  },
  setupTime() {
    this.basicTime.show(
      new QueryTimeView({
        model: this.model,
        filter: this.filter,
      })
    )
  },
  getFilterValuesForAttribute(attribute: any) {
    return this.filter[attribute]
      ? this.filter[attribute].map((subfilter: any) => subfilter.value)
      : []
  },
  getCurrentSpecificTypesValue() {
    const metadataContentTypeValuesInFilter = this.getFilterValuesForAttribute(
      METADATA_CONTENT_TYPE
    )
    const matchTypeAttributeValuesInFilter = this.getFilterValuesForAttribute(
      getMatchTypeAttribute()
    )
    return _.union(
      metadataContentTypeValuesInFilter,
      matchTypeAttributeValuesInFilter
    )
  },
  setupTypeSpecific() {
    const currentValue = this.getCurrentSpecificTypesValue()
    getMatchTypes()
      .then(enums => this.showBasicTypeSpecific(enums, [currentValue]))
      // @ts-ignore ts-migrate(6133) FIXME: 'error' is declared but its value is never read.
      .catch(error => this.showBasicTypeSpecific())
  },
  showBasicTypeSpecific(enums = [], currentValue = [[]]) {
    if (this.basicTypeSpecific) {
      if (enums && enums.length > 0) {
        this.basicTypeSpecific.show(
          new PropertyView({
            model: new Property({
              enumFiltering: true,
              showValidationIssues: false,
              enumMulti: true,
              enum: enums,
              value: currentValue,
              id: 'Types',
            }),
          })
        )
        this.basicTypeSpecific.currentView.turnOnEditing()
      } else {
        this.basicTypeSpecific.show(new NoMatchTypesView())
      }
    }
  },
  setupType() {
    let currentValue = 'any'
    if (
      this.filter[METADATA_CONTENT_TYPE] ||
      this.filter[getMatchTypeAttribute()]
    ) {
      currentValue = 'specific'
    }
    this.basicType.show(
      new PropertyView({
        model: new Property({
          value: [currentValue],
          id: 'Match Types',
          radio: [
            {
              label: 'Any',
              value: 'any',
            },
            {
              label: 'Specific',
              value: 'specific',
            },
          ],
        }),
      })
    )
  },
  setupLocation() {
    let currentValue = 'any'
    if (this.filter.anyGeo) {
      currentValue = 'specific'
    }
    this.basicLocation.show(
      new PropertyView({
        model: new Property({
          value: [currentValue],
          id: 'Located',
          radio: [
            {
              label: 'Anywhere',
              value: 'any',
            },
            {
              label: 'Somewhere Specific',
              value: 'specific',
            },
          ],
        }),
      })
    )
  },
  setupLocationInput() {
    let currentValue = ''
    if (this.filter.anyGeo) {
      currentValue = this.filter.anyGeo[0]
    }
    const currentView = this.basicLocationSpecific.currentView
    if (currentView && currentView.model) {
      this.stopListening(currentView.model)
    }

    this.basicLocationSpecific.show(
      new PropertyView({
        model: new Property({
          value: [currentValue],
          id: 'Location',
          type: 'LOCATION',
        }),
      })
    )

    this.listenTo(
      this.basicLocationSpecific.currentView.model,
      'change:value',
      requestMapRender
    )
  },
  handleTypeValue() {
    const type = this.basicType.currentView.model.getValue()[0]
    this.$el.toggleClass('is-type-any', type === 'any')
    this.$el.toggleClass('is-type-specific', type === 'specific')
  },
  handleLocationValue() {
    const location = this.basicLocation.currentView.model.getValue()[0]
    this.$el.toggleClass('is-location-any', location === 'any')
    this.$el.toggleClass('is-location-specific', location === 'specific')
    if (location === 'any') {
      turnOffDrawing()
      this.setupLocationInput()
    }
  },
  setupTextMatchInput() {
    this.basicTextMatch.show(
      new PropertyView({
        model: new Property({
          value: [
            this.filter.anyText && this.filter.anyText[0].type === 'LIKE'
              ? 'LIKE'
              : 'ILIKE',
          ],
          id: 'Match Case',
          placeholder: 'Text to search for.  Use "*" for wildcard.',
          radio: [
            {
              id: 'match-case-yes',
              label: 'Yes',
              value: 'LIKE',
            },
            {
              id: 'match-case-no',
              label: 'No',
              value: 'ILIKE',
            },
          ],
        }),
      })
    )
  },
  setupTextInput() {
    this.basicText.show(
      new PropertyView({
        model: new Property({
          value: [this.filter.anyText ? this.filter.anyText[0].value : ''],
          id: 'Text',
          placeholder: 'Text to search for.  Use "*" for wildcard.',
        }),
      })
    )
  },
  turnOffEdit() {
    this.regionManager.forEach((region: any) => {
      if (region.currentView && region.currentView.turnOffEditing) {
        region.currentView.turnOffEditing()
      }
    })
  },
  edit() {
    this.$el.addClass('is-editing')
    this.regionManager.forEach((region: any) => {
      if (region.currentView && region.currentView.turnOnEditing) {
        region.currentView.turnOnEditing()
      }
    })
    const tabbable = _.filter(
      this.$el.find('[tabindex], input, button'),
      (element: any) => element.offsetParent !== null
    )
    if (tabbable.length > 0) {
      $(tabbable[0]).focus()
    }
  },
  focus() {
    this.basicText.currentView.focus()
  },
  cancel() {
    this.$el.removeClass('is-editing')
    this.onBeforeShow()
  },
  handleDownConversion(downConversion: any) {
    this.$el.toggleClass('is-down-converted', downConversion)
  },
  save() {
    this.$el.removeClass('is-editing')

    const filter = this.constructFilter()
    const generatedCQL = cql.write(filter)
    this.model.set({
      filterTree: filter,
      cql: generatedCQL,
    })
  },
  constructFilter() {
    const filters = []

    const text = this.basicText.currentView.model.getValue()[0]
    if (text !== '') {
      const matchCase = this.basicTextMatch.currentView.model.getValue()[0]
      filters.push(CQLUtils.generateFilter(matchCase, 'anyText', text))
    }

    this.basicTime.currentView.constructFilter().forEach((timeFilter: any) => {
      filters.push(timeFilter)
    })

    const locationSpecific = this.basicLocation.currentView.model.getValue()[0]
    const location = this.basicLocationSpecific.currentView.model.getValue()[0]
    const locationFilter = CQLUtils.generateFilter(
      undefined,
      'anyGeo',
      location
    )
    if (locationSpecific === 'specific' && locationFilter) {
      filters.push(locationFilter)
    }

    const types = this.basicType.currentView.model.getValue()[0]
    const specificTypes =
      this.basicTypeSpecific.currentView.model !== undefined
        ? this.basicTypeSpecific.currentView.model.getValue()[0]
        : []
    if (types === 'specific' && specificTypes.length !== 0) {
      const filterAttributeIsSupported = (filter: any) => filter !== null
      const typeFilter = {
        type: 'OR',
        filters: specificTypes
          .map((specificType: any) => [
            CQLUtils.generateFilter(
              'ILIKE',
              METADATA_CONTENT_TYPE,
              specificType
            ),
            CQLUtils.generateFilter(
              'ILIKE',
              getMatchTypeAttribute(),
              specificType
            ),
          ])
          .flat()
          .filter(filterAttributeIsSupported),
      }
      if (typeFilter.filters.length > 0) {
        filters.push(typeFilter)
      }
    }

    if (filters.length === 0) {
      filters.unshift(CQLUtils.generateFilter('ILIKE', 'anyText', '*'))
    }

    return {
      type: 'AND',
      filters,
    }
  },
  setDefaultTitle() {
    const text = this.basicText.currentView.model.getValue()[0]
    let title
    if (text === '') {
      title = this.model.get('cql')
    } else {
      title = text
    }
    this.model.set('title', title)
  },
})
