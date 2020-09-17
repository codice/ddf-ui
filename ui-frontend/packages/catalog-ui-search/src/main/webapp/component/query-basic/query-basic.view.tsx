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
import { hot } from 'react-hot-loader'
const Marionette = require('marionette')
const _ = require('underscore')
const memoize = require('lodash/memoize')
const $ = require('jquery')
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
import QueryTimeReactView, {
  BasicFilterClass,
} from '../query-time/query-time.view'
import query from '../../react-component/utils/query'

const METADATA_CONTENT_TYPE = 'metadata-content-type'
import { Drawing } from '../singletons/drawing'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { FilterClass } from '../filter-builder/filter.structure'
import Typography from '@material-ui/core/Typography'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import MenuItem from '@material-ui/core/MenuItem'
import FilterInput from '../../react-component/filter/filter-input'
import Swath from '../swath/swath'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TypedMetacardDefs from '../tabs/metacard/metacardDefinitions'

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

function getAllValidValuesForMatchTypeAttribute(): {
  [key: string]: {
    label: string
    value: string
    class: string
  }
} {
  const matchTypeAttr = getMatchTypeAttribute()
  return metacardDefinitions.enums[matchTypeAttr]
    ? metacardDefinitions.enums[matchTypeAttr].reduce((blob, value: any) => {
        blob[value] = {
          label: value,
          value,
          class: 'icon ' + IconHelper.getClassByName(value),
        }
        return blob
      }, {})
    : {}
}

const determinePropertiesToApplyTo = ({
  value,
}: {
  value: PropertyValueMapType['anyType']['properties']
}): Array<{ label: string; value: string }> => {
  return value.map(property => {
    return {
      label: TypedMetacardDefs.getAlias({ attr: property }),
      value: property,
    }
  })
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

type PropertyValueMapType = {
  anyText: Array<FilterClass>
  anyDate: Array<BasicFilterClass>
  anyGeo: Array<FilterClass>
  anyType: {
    on: boolean
    properties: string[]
  }
  [key: string]: any
}

function translateFilterToBasicMap(filter: any) {
  const propertyValueMap = {
    anyDate: [],
    anyText: [],
    anyGeo: [],
    anyType: {
      on: false,
      properties: [],
    },
  } as PropertyValueMapType
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
        filter.filters
          .filter(
            (subfilter: FilterClass) =>
              CQLUtils.getProperty(subfilter) ===
              CQLUtils.getProperty(filter.filters[0])
          )
          .forEach((subfilter: FilterClass) => {
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

  if (propertyValueMap.anyText.length === 0) {
    propertyValueMap.anyText.push(
      new FilterClass({
        type: 'ILIKE',
        property: 'anyText',
        value: '',
      })
    )
  }
  // if datatype exists, this maps to "anyType" (we expand to multiple attributes going out, but can look at just datatype when coming in)
  if (propertyValueMap.datatype) {
    propertyValueMap.anyType.on = true
    propertyValueMap.anyType.properties = propertyValueMap.datatype.map(
      (filter: FilterClass) => filter.value
    )
  }
  return {
    propertyValueMap,
    downConversion,
  } as {
    propertyValueMap: PropertyValueMapType
    downConversion: boolean
  }
}

function getFilterTree(model: any) {
  if (typeof model.get('filterTree') === 'object') {
    return model.get('filterTree')
  }
  return cql.simplify(cql.read(model.get('cql')))
}

type CurrentValueType = { text: string; matchcase: boolean; basicTime: any }

type QueryBasicProps = {
  model: any
}

const constructFilterFromBasicFilter = ({
  basicFilter,
}: {
  basicFilter: PropertyValueMapType
}) => {
  const filters = []
  if (basicFilter.anyText[0].value !== '') {
    filters.push(basicFilter.anyText[0])
  }

  if (basicFilter.anyDate[0] !== undefined) {
    filters.push({
      type: 'OR',
      filters: basicFilter.anyDate[0].property.map(property => {
        return {
          ...basicFilter.anyDate[0],
          property,
        }
      }),
    })
  }

  if (basicFilter.anyGeo[0] !== undefined) {
    filters.push(basicFilter.anyGeo[0])
  }

  if (basicFilter.anyType.on && basicFilter.anyType.properties.length > 0) {
    filters.push({
      type: 'OR',
      filters: basicFilter.anyType.properties
        .map(property => {
          return new FilterClass({
            property: 'datatype',
            value: property,
            type: 'ILIKE',
          })
        })
        .concat(
          basicFilter.anyType.properties.map(property => {
            return new FilterClass({
              property: 'metadata-content-type',
              value: property,
              type: 'ILIKE',
            })
          })
        ),
    })
  }

  if (filters.length === 0) {
    filters.unshift(CQLUtils.generateFilter('ILIKE', 'anyText', '*'))
  }

  return {
    type: 'AND',
    filters,
  }
}

const QueryBasic = ({ model }: QueryBasicProps) => {
  const [basicFilter, setBasicFilter] = React.useState(
    translateFilterToBasicMap(getFilterTree(model)).propertyValueMap
  )
  const [typeAttributes] = React.useState(
    getAllValidValuesForMatchTypeAttribute()
  )

  const { listenTo, stopListening } = useBackbone()
  const saveCallbackRef = React.useRef(() => {
    model.set('cql', cql.write(constructFilterFromBasicFilter({ basicFilter })))
    model.set('filterTree', constructFilterFromBasicFilter({ basicFilter }))
  })
  React.useEffect(
    () => {
      saveCallbackRef.current = () => {
        model.set(
          'cql',
          cql.write(constructFilterFromBasicFilter({ basicFilter }))
        )
        model.set('filterTree', constructFilterFromBasicFilter({ basicFilter }))
      }
    },
    [basicFilter, model]
  )
  React.useEffect(() => {
    return () => {
      saveCallbackRef.current()
    }
  }, [])
  React.useEffect(
    () => {
      const callback = () => {
        saveCallbackRef.current()
      }
      const callback2 = () => {
        setBasicFilter(
          translateFilterToBasicMap(getFilterTree(model)).propertyValueMap
        )
      }
      // for perf, only update when necessary
      listenTo(model, 'update', callback)
      listenTo(model, 'change:filterTree', callback2)
      return () => {
        stopListening(model, 'update', callback)
        stopListening(model, 'change:filterTree', callback2)
      }
    },
    [model, basicFilter]
  )
  return (
    <>
      <div className="editor-properties px-2 py-3">
        <div className="">
          <Typography className="pb-2">Keyword</Typography>
          <TextField
            fullWidth
            value={basicFilter.anyText ? basicFilter.anyText[0].value : ''}
            placeholder={`Text to search for. Use "*" for wildcard.`}
            id="Text"
            onChange={e => {
              basicFilter.anyText[0].value = e.target.value
              setBasicFilter({
                ...basicFilter,
              })
            }}
            size="small"
            variant="outlined"
          />
        </div>
        {/* <div className="pt-2">
          <FormControlLabel
            labelPlacement="start"
            control={
              <Checkbox
                color="default"
                checked={
                  basicFilter.anyText && basicFilter.anyText[0].type === 'LIKE'
                }
                onChange={e => {
                  basicFilter.anyText[0].type = e.target.checked
                    ? 'LIKE'
                    : 'ILIKE'
                  setBasicFilter({
                    ...basicFilter,
                  })
                }}
              />
            }
            label="Matchcase"
          />
        </div> */}
        <div className="pt-2">
          <QueryTimeReactView
            value={basicFilter.anyDate[0]}
            onChange={newValue => {
              basicFilter.anyDate[0] = newValue

              setBasicFilter({
                ...basicFilter,
              })
            }}
          />
        </div>
        <div className="pt-2">
          <FormControlLabel
            labelPlacement="start"
            control={
              <Checkbox
                color="default"
                checked={Boolean(basicFilter.anyGeo[0])}
                onChange={e => {
                  if (!e.target.checked) {
                    basicFilter.anyGeo.pop()
                    setBasicFilter({
                      ...basicFilter,
                    })
                  } else {
                    basicFilter.anyGeo.push(
                      new FilterClass({
                        type: 'GEOMETRY',
                        property: 'anyGeo',
                        value: '',
                      })
                    )
                    setBasicFilter({
                      ...basicFilter,
                    })
                  }
                }}
              />
            }
            label="Location"
          />
          {basicFilter.anyGeo[0] ? (
            <Grid
              container
              alignItems="stretch"
              direction="row"
              wrap="nowrap"
              className="pt-2"
            >
              <Grid item>
                <Swath className="w-1 h-full" />
              </Grid>
              <Grid item className="w-full pl-2">
                <FilterInput
                  filter={{
                    ...basicFilter.anyGeo[0],
                    property: basicFilter.anyGeo[0].property,
                  }}
                  setFilter={(val: any) => {
                    basicFilter.anyGeo[0] = val

                    setBasicFilter({
                      ...basicFilter,
                    })
                  }}
                />
              </Grid>
            </Grid>
          ) : null}
        </div>
        <div className="pt-2">
          <FormControlLabel
            labelPlacement="start"
            control={
              <Checkbox
                color="default"
                checked={basicFilter.anyType.on}
                onChange={e => {
                  basicFilter.anyType.on = e.target.checked
                  setBasicFilter({
                    ...basicFilter,
                  })
                }}
              />
            }
            label="Types"
          />
          {basicFilter.anyType.on ? (
            <Grid
              container
              alignItems="stretch"
              direction="row"
              wrap="nowrap"
              className="pt-2"
            >
              <Grid item>
                <Swath className="w-1 h-full" />
              </Grid>
              <Grid item className="w-full pl-2">
                <Autocomplete
                  fullWidth
                  multiple
                  options={Object.values(typeAttributes)}
                  disableCloseOnSelect
                  getOptionLabel={option => option.label}
                  getOptionSelected={(option, value) =>
                    option.value === value.value
                  }
                  onChange={(e, newValue) => {
                    basicFilter.anyType.properties = newValue.map(
                      val => val.value
                    )
                    setBasicFilter({
                      ...basicFilter,
                    })
                  }}
                  size="small"
                  renderOption={({ label, value }) => {
                    return (
                      <>
                        <div
                          className={`pr-2 icon ${typeAttributes[value].class}`}
                        />
                        {label}
                      </>
                    )
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        variant="outlined"
                        color="default"
                        label={
                          <>
                            <div
                              className={`pr-2 icon ${
                                typeAttributes[option.value].class
                              }`}
                            />
                            {option.label}
                          </>
                        }
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  value={determinePropertiesToApplyTo({
                    value: basicFilter.anyType.properties,
                  })}
                  renderInput={params => (
                    <TextField {...params} variant="outlined" />
                  )}
                />
              </Grid>
            </Grid>
          ) : null}
        </div>
        <div className="py-5 w-full">
          <Swath className="w-full h-1" />
        </div>
        <div className="basic-settings">
          <QuerySettings model={model} />
        </div>
      </div>
    </>
  )
}

Marionette.LayoutView.extend({
  tagName: 'div',
  modelEvents: {},
  events: {
    'click .editor-edit': 'edit',
    'click .editor-cancel': 'cancel',
    'click .editor-save': 'save',
  },
  regions: {
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
  currentValue: undefined as undefined | CurrentValueType,
  initialize() {
    const filter = getFilterTree(this.model)
    const translationToBasicMap = translateFilterToBasicMap(filter)
    this.filter = translationToBasicMap.propertyValueMap
    this.handleDownConversion(translationToBasicMap.downConversion)
    this.currentValue = {
      text: this.filter.anyText ? this.filter.anyText[0].value : '',
      matchcase:
        this.filter.anyText && this.filter.anyText[0].type === 'LIKE'
          ? true
          : false,
      basicTime: this.filter,
    }
  },
  onBeforeShow() {
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
    const currentValue = this.currentValue as CurrentValueType
    const text = currentValue.text
    if (text !== '') {
      const matchCase = currentValue.matchcase ? 'LIKE' : 'ILIKE'
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
})

export default hot(module)(QueryBasic)
