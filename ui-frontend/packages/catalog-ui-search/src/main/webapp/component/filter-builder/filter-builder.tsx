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
const cql = require('../../js/cql.js')

// @ts-ignore ts-migrate(6192) FIXME: All imports in import declaration are unused.
import { serialize, deserialize } from './filter-serialization'
import FilterBranch from './filter-branch'

import { FilterBuilderClass, isFilterBuilderClass } from './filter.structure'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'

type Props = {
  model: any
}

const getBaseFilter = ({ model }: { model: any }): FilterBuilderClass => {
  const filter = model.get('filterTree')
  if (filter.filters === undefined) {
    return validateFilter(
      new FilterBuilderClass({
        type: 'AND',
        filters: [filter],
        negated: false,
      })
    )
  }
  return validateFilter(
    new FilterBuilderClass({
      ...filter,
    })
  )
}

/**
 * Updates filter to accomodate WFS sources which don't handle blanks
 */
const validateFilter = (filter: FilterBuilderClass) => {
  if (filter.filters.length === 1) {
    if (
      !isFilterBuilderClass(filter.filters[0]) &&
      filter.filters[0].property === 'anyText' &&
      filter.filters[0].type === 'ILIKE' &&
      filter.filters[0].value === ''
    ) {
      filter.filters[0].value = '*'
    }
  }
  return filter
}

const generateSaveCallback = (model: any, filter: FilterBuilderClass) => {
  return () => {
    model.set('cql', cql.write(filter))
    model.set('filterTree', filter)
  }
}

export const FilterBuilderRoot = ({ model }: Props) => {
  const [filter, setFilter] = React.useState(getBaseFilter({ model }))
  const { listenTo, stopListening } = useBackbone()
  const saveCallbackRef = React.useRef(generateSaveCallback(model, filter))
  React.useEffect(
    () => {
      saveCallbackRef.current = generateSaveCallback(model, filter)
    },
    [filter, model]
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
        setFilter(getBaseFilter({ model }))
      }
      // for perf, only update when necessary
      listenTo(model, 'update', callback)
      listenTo(model, 'change:filterTree', callback2)
      return () => {
        stopListening(model, 'update', callback)
        stopListening(model, 'change:filterTree', callback2)
      }
    },
    [model, filter]
  )
  return (
    <FilterBranch
      filter={filter}
      setFilter={update => {
        setFilter(update)
      }}
      root={true}
    />
  )
}
