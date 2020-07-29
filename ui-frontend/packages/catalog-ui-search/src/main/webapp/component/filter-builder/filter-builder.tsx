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
// @ts-ignore
import { serialize, deserialize } from './filter-serialization'
import FilterBranch from './filter-branch'

import { FilterBuilderClass } from './filter.structure'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'

type Props = {
  model: any
}

const getBaseFilter = ({ model }: { model: any }): FilterBuilderClass => {
  const filter = model.get('filterTree')
  if (filter.filters === undefined) {
    return new FilterBuilderClass({
      type: 'AND',
      filters: [filter],
      negated: false,
    })
  }
  return new FilterBuilderClass({
    ...filter,
  })
}

export const FilterBuilderRoot = ({ model }: Props) => {
  const [filter, setFilter] = React.useState(getBaseFilter({ model }))
  const { listenTo, stopListening } = useBackbone()
  React.useEffect(
    () => {
      listenTo(model, 'update', () => {
        model.set('cql', cql.write(filter))
        model.set('filterTree', filter)
        console.log(model.get('cql'))
      })
      return () => {
        stopListening(model, 'update')
      }
    },
    [filter]
  )
  console.log(filter)
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
