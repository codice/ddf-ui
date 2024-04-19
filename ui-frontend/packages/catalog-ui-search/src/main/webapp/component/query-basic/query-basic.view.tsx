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
import cql from '../../js/cql'
import CQLUtils from '../../js/CQLUtils'
import QuerySettings from '../query-settings/query-settings'
import QueryTimeReactView from '../query-time/query-time.view'
import {
  BasicDatatypeFilter,
  BasicFilterClass,
  isBasicDatatypeClass,
  isFilterBuilderClass,
} from '../filter-builder/filter.structure'
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
import BooleanSearchBar from '../boolean-search-bar/boolean-search-bar'
import { ValidationResult } from '../../react-component/location/validators'
import { StartupDataStore } from '../../js/model/Startup/startup'
import { useMetacardDefinitions } from '../../js/model/Startup/metacard-definitions.hooks'
import { ReservedBasicDatatype } from '../reserved-basic-datatype/reserved.basic-datatype'
import { BasicDataTypePropertyName } from '../filter-builder/reserved.properties'
function isNested(filter: any) {
  let nested = false
  filter.filters.forEach((subfilter: any) => {
    nested = nested || subfilter.filters
  })
  return nested
}

// strip extra quotes
const stripQuotes = (property = 'anyText') => {
  return property?.replace(/^"(.+(?="$))"$/, '$1')
}
function isAnyDate(filter: any) {
  if (!filter.filters) {
    return (
      StartupDataStore.MetacardDefinitions.getAttributeMap()[
        stripQuotes(filter.property)
      ].type === 'DATE'
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
      StartupDataStore.MetacardDefinitions.getAttributeMap()[
        stripQuotes(attributes[0])
      ].type === 'DATE'
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
  [BasicDataTypePropertyName]: {
    on: boolean
    value: BasicDatatypeFilter
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
export function translateFilterToBasicMap(filter: FilterBuilderClass) {
  const propertyValueMap = {
    anyDate: [],
    anyText: [],
    anyGeo: [],
    [BasicDataTypePropertyName]: {
      on: false,
      value: new BasicDatatypeFilter({
        value: [],
      }),
    },
  } as PropertyValueMapType
  let downConversion = false
  if (!filter.filters && isAnyDate(filter)) {
    handleAnyDateFilter(propertyValueMap, filter)
  }
  if (isFilterBuilderClass(filter)) {
    filter.filters.forEach((subfilter) => {
      if (!isFilterBuilderClass(subfilter) && isAnyDate(subfilter)) {
        handleAnyDateFilter(propertyValueMap, subfilter)
      } else if (
        !isFilterBuilderClass(subfilter) &&
        isBasicDatatypeClass(subfilter)
      ) {
        propertyValueMap[BasicDataTypePropertyName].on = true
        propertyValueMap[BasicDataTypePropertyName].value = subfilter
      } else if (!isFilterBuilderClass(subfilter)) {
        if (['anyDate', 'anyText', 'anyGeo'].includes(subfilter.property)) {
          propertyValueMap[CQLUtils.getProperty(subfilter)] =
            propertyValueMap[CQLUtils.getProperty(subfilter)] || []
          if (
            propertyValueMap[CQLUtils.getProperty(subfilter)].filter(
              (existingFilter: any) => existingFilter.type === subfilter.type
            ).length === 0
          ) {
            propertyValueMap[CQLUtils.getProperty(subfilter)].push(subfilter)
          }
        }
      } else if (!isNested(subfilter) && isAnyDate(subfilter)) {
        handleAnyDateFilter(propertyValueMap, subfilter)
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
  Extensions?: React.FunctionComponent
}
export const constructFilterFromBasicFilter = ({
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
  if (
    basicFilter[BasicDataTypePropertyName].on &&
    basicFilter[BasicDataTypePropertyName].value.value.length > 0
  ) {
    filters.push(basicFilter[BasicDataTypePropertyName].value)
  } else if (basicFilter[BasicDataTypePropertyName].on) {
    // a bit of an unfortunate hack so we can depend directly on filterTree (this will only happen if properties is blank!)
    // see the anyDate part of translateFilterToBasicMap for more details
    filters.push(
      new BasicDatatypeFilter({
        value: [],
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
 * We also want to update the filter tree once whenever the component is first
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

const QueryBasic = ({ model, errorListener, Extensions }: QueryBasicProps) => {
  const MetacardDefinitions = useMetacardDefinitions()
  const inputRef = React.useRef<HTMLDivElement>()
  const basicFilter = useBasicFilterFromModel({ model })

  /**
   * Because of how things render, auto focusing to the input is more complicated than I wish.
   * This ensures it works every time, whereas autoFocus prop is unreliable
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
        <div className="">
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
            label={MetacardDefinitions.getAlias('location')}
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
        <div className="">
          <FormControlLabel
            labelPlacement="end"
            control={
              <Checkbox
                color="default"
                checked={basicFilter[BasicDataTypePropertyName].on}
                onChange={(e) => {
                  basicFilter[BasicDataTypePropertyName].on = e.target.checked
                  model.set(
                    'filterTree',
                    constructFilterFromBasicFilter({ basicFilter })
                  )
                }}
              />
            }
            label={MetacardDefinitions.getAlias(BasicDataTypePropertyName)}
          />
          {basicFilter[BasicDataTypePropertyName].on ? (
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
                <ReservedBasicDatatype
                  value={basicFilter[BasicDataTypePropertyName].value.value}
                  onChange={(newValue) => {
                    basicFilter[BasicDataTypePropertyName].value.value =
                      newValue
                    model.set(
                      'filterTree',
                      constructFilterFromBasicFilter({ basicFilter })
                    )
                  }}
                />
              </Grid>
            </Grid>
          ) : null}
        </div>
        <div className="py-2 w-full">
          <Swath className="w-full h-1" />
        </div>
        <div className="basic-settings">
          <QuerySettings model={model} Extensions={Extensions} />
        </div>
      </div>
    </>
  )
}
export default hot(module)(QueryBasic)
