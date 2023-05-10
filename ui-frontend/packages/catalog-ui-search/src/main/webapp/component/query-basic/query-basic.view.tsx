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
import _ from 'underscore'
import IconHelper from '../../js/IconHelper'
import properties from '../../js/properties'
import cql from '../../js/cql'
import metacardDefinitions from '../singletons/metacard-definitions'
import CQLUtils from '../../js/CQLUtils'
import QuerySettings from '../query-settings/query-settings'
import QueryTimeReactView, {
  BasicFilterClass,
} from '../query-time/query-time.view'
const METADATA_CONTENT_TYPE = 'metadata-content-type'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import {
  BooleanTextType,
  FilterBuilderClass,
  FilterClass,
} from '../filter-builder/filter.structure'
import Typography from '@mui/material/Typography'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import FilterInput from '../../react-component/filter/filter-input'
import Swath from '../swath/swath'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'
import TypedMetacardDefs from '../tabs/metacard/metacardDefinitions'
import BooleanSearchBar from '../boolean-search-bar/boolean-search-bar'
import { ValidationResult } from '../../react-component/location/validators'
function isNested(filter: any) {
  let nested = false
  filter.filters.forEach((subfilter: any) => {
    nested = nested || subfilter.filters
  })
  return nested
}
function getMatchTypeAttribute() {
  return metacardDefinitions.metacardTypes[
    (properties as any).basicSearchMatchType
  ]
    ? (properties as any).basicSearchMatchType
    : 'datatype'
}
function getAllValidValuesForMatchTypeAttribute(): {
  [key: string]: {
    label: string
    value: string
    class: string
  }
} {
  const matchTypeAttr = getMatchTypeAttribute()
  return metacardDefinitions.enums[matchTypeAttr]
    ? (metacardDefinitions.enums[matchTypeAttr] as Array<string>).reduce(
        (blob, value: any) => {
          blob[value] = {
            label: value,
            value,
            class: 'icon ' + IconHelper.getClassByName(value),
          }
          return blob
        },
        {} as {
          [key: string]: {
            label: string
            value: string
            class: string
          }
        }
      )
    : {}
}
const determinePropertiesToApplyTo = ({
  value,
}: {
  value: PropertyValueMapType['anyType']['properties']
}): Array<{
  label: string
  value: string
}> => {
  return value.map((property) => {
    return {
      label: TypedMetacardDefs.getAlias({ attr: property }),
      value: property,
    }
  })
}
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
const stripQuotes = (property = 'anyText') => {
  return property?.replace(/^"(.+(?="$))"$/, '$1')
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
export function downgradeFilterTreeToBasic(
  filter: FilterBuilderClass
): FilterBuilderClass {
  return constructFilterFromBasicFilter({
    basicFilter: translateFilterToBasicMap(filter).propertyValueMap,
  })
}
function translateFilterToBasicMap(filter: FilterBuilderClass) {
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
        type: 'BOOLEAN_TEXT_SEARCH',
        property: 'anyText',
        value: '',
      })
    )
  }
  // if datatype exists, this maps to "anyType" (we expand to multiple attributes going out, but can look at just datatype when coming in)
  if (propertyValueMap.datatype) {
    propertyValueMap.anyType.on = true
    propertyValueMap.anyType.properties = propertyValueMap.datatype
      .map((filter: FilterClass) => filter.value)
      .filter((val: string) => val !== '*') // allows us to depend on directly on filterTree with minimal weirdness, see constructFilterFromBasicFilter method for why this is necessary
  }
  return {
    propertyValueMap,
    downConversion,
  } as {
    propertyValueMap: PropertyValueMapType
    downConversion: boolean
  }
}
function getFilterTree(model: any): FilterBuilderClass {
  if (typeof model.get('filterTree') === 'object') {
    return model.get('filterTree')
  }
  return cql.simplify(cql.read(model.get('cql')))
}
type QueryBasicProps = {
  model: any
  errorListener?: (validationResults: {
    [key: string]: ValidationResult | undefined
  }) => void
}
const constructFilterFromBasicFilter = ({
  basicFilter,
}: {
  basicFilter: PropertyValueMapType
}): FilterBuilderClass => {
  const filters = [] as FilterBuilderClass['filters']
  if (basicFilter.anyText[0].value !== '') {
    filters.push(basicFilter.anyText[0])
  }
  if (basicFilter.anyDate[0] !== undefined) {
    filters.push(
      new FilterBuilderClass({
        type: 'OR',
        filters:
          basicFilter.anyDate[0].property.length !== 0
            ? basicFilter.anyDate[0].property.map((property) => {
                return {
                  ...basicFilter.anyDate[0],
                  property,
                }
              })
            : [
                {
                  ...basicFilter.anyDate[0],
                  property: 'anyDate',
                },
              ], // we need a default since we rely on the filterTree solely
      })
    )
  }
  if (basicFilter.anyGeo[0] !== undefined) {
    filters.push(basicFilter.anyGeo[0])
  }
  if (basicFilter.anyType.on && basicFilter.anyType.properties.length > 0) {
    filters.push(
      new FilterBuilderClass({
        type: 'OR',
        filters: basicFilter.anyType.properties
          .map((property) => {
            return new FilterClass({
              property: 'datatype',
              value: property,
              type: 'ILIKE',
            })
          })
          .concat(
            basicFilter.anyType.properties.map((property) => {
              return new FilterClass({
                property: 'metadata-content-type',
                value: property,
                type: 'ILIKE',
              })
            })
          ),
      })
    )
  } else if (basicFilter.anyType.on) {
    // a bit of an unfortunate hack so we can depend directly on filterTree (this will only happen if properties is blank!)
    // see the anyDate part of translateFilterToBasicMap for more details
    filters.push(
      new FilterClass({
        property: 'datatype',
        value: '*',
        type: 'ILIKE',
      })
    )
  }
  return new FilterBuilderClass({
    type: 'AND',
    filters,
  })
}
/**
 * We want to reset the basic filter whenever the filter tree changes on the model.
 *
 * We also want to update the filter tree once whenver the component is first
 */
const useBasicFilterFromModel = ({ model }: QueryBasicProps) => {
  const [basicFilter, setBasicFilter] = React.useState(
    translateFilterToBasicMap(getFilterTree(model)).propertyValueMap
  )
  const { listenTo, stopListening } = useBackbone()
  React.useEffect(() => {
    const callback = () => {
      setBasicFilter(
        translateFilterToBasicMap(getFilterTree(model)).propertyValueMap
      )
    }
    listenTo(model, 'change:filterTree', callback)
    return () => {
      stopListening(model, 'change:filterTree', callback)
    }
  }, [model])
  return basicFilter
}
const QueryBasic = ({ model, errorListener }: QueryBasicProps) => {
  const inputRef = React.useRef<HTMLDivElement>()
  const basicFilter = useBasicFilterFromModel({ model })
  const [typeAttributes] = React.useState(
    getAllValidValuesForMatchTypeAttribute()
  )
  /**
   * Because of how things render, auto focusing to the input is more complicated than I wish.  This ensures it works everytime, whereas autoFocus prop is unreliable
   */
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])
  const anyTextValue: BooleanTextType = (() => {
    if (basicFilter.anyText) {
      if (typeof basicFilter.anyText[0].value === 'string') {
        return {
          text: basicFilter.anyText[0].value,
          cql: '',
          error: false,
        }
      } else {
        return basicFilter.anyText[0].value as BooleanTextType
      }
    } else {
      return {
        text: '',
        cql: '',
        error: false,
      }
    }
  })()
  return (
    <>
      <div className="editor-properties px-2 py-3">
        <div>
          <Typography className="pb-2">Keyword</Typography>
          <BooleanSearchBar
            value={anyTextValue}
            key={model.id}
            onChange={({ text, cql, error }) => {
              // we want the string value, the cql value, and if it's correct
              basicFilter.anyText[0] = new FilterClass({
                ...basicFilter.anyText[0],
                type: 'BOOLEAN_TEXT_SEARCH',
                value: {
                  text,
                  cql,
                  error,
                },
              })
              model.set(
                'filterTree',
                constructFilterFromBasicFilter({ basicFilter })
              )
            }}
          />
        </div>
        <div className="pt-2">
          <QueryTimeReactView
            value={basicFilter.anyDate[0]}
            onChange={(newValue) => {
              basicFilter.anyDate[0] = newValue
              model.set(
                'filterTree',
                constructFilterFromBasicFilter({ basicFilter })
              )
            }}
          />
        </div>
        <div className="pt-2">
          <FormControlLabel
            labelPlacement="end"
            control={
              <Checkbox
                color="default"
                checked={Boolean(basicFilter.anyGeo[0])}
                onChange={(e) => {
                  if (!e.target.checked) {
                    basicFilter.anyGeo.pop()
                  } else {
                    basicFilter.anyGeo.push(
                      new FilterClass({
                        type: 'GEOMETRY',
                        property: 'anyGeo',
                        value: '',
                      })
                    )
                  }
                  model.set(
                    'filterTree',
                    constructFilterFromBasicFilter({ basicFilter })
                  )
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
                  filter={
                    new FilterClass({
                      ...basicFilter.anyGeo[0],
                      property: basicFilter.anyGeo[0].property,
                    })
                  }
                  setFilter={(val: any) => {
                    basicFilter.anyGeo[0] = val
                    model.set(
                      'filterTree',
                      constructFilterFromBasicFilter({ basicFilter })
                    )
                  }}
                  errorListener={errorListener}
                />
              </Grid>
            </Grid>
          ) : null}
        </div>
        <div className="pt-2">
          <FormControlLabel
            labelPlacement="end"
            control={
              <Checkbox
                color="default"
                checked={basicFilter.anyType.on}
                onChange={(e) => {
                  basicFilter.anyType.on = e.target.checked
                  model.set(
                    'filterTree',
                    constructFilterFromBasicFilter({ basicFilter })
                  )
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
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  onChange={(_e, newValue) => {
                    basicFilter.anyType.properties = newValue.map(
                      (val) => val.value
                    )
                    model.set(
                      'filterTree',
                      constructFilterFromBasicFilter({ basicFilter })
                    )
                  }}
                  size="small"
                  renderOption={(props, { label, value }) => {
                    return (
                      <li {...props}>
                        <div
                          className={`pr-2 icon ${typeAttributes[value].class}`}
                        />
                        {label}
                      </li>
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
                  renderInput={(params) => (
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
export default hot(module)(QueryBasic)
