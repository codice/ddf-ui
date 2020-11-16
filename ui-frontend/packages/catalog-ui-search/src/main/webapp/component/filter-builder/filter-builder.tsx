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

// @ts-ignore ts-migrate(6192) FIXME: All imports in import declaration are unused.
import { serialize, deserialize } from './filter-serialization'
import FilterBranch from './filter-branch'

import { FilterBuilderClass, isFilterBuilderClass } from './filter.structure'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { FilterTextFieldIdentifier } from '../fields/text'

type Props = {
  model: any
}

const convertToFilterIfNecessary = ({
  filter,
}: {
  filter: any
}): FilterBuilderClass => {
  if (isFilterBuilderClass(filter)) {
    return filter
  }
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

const getBaseFilter = ({ model }: { model: any }): FilterBuilderClass => {
  const filter = model.get('filterTree')
  return convertToFilterIfNecessary({ filter })
}

/**
 * We use the filterTree of the model as the single source of truth, so it's always up to date.
 * As a result, we have to listen to updates to it.
 */
export const FilterBuilderRoot = ({ model }: Props) => {
  const [filter, setFilter] = React.useState(getBaseFilter({ model }))
  const { listenTo, stopListening } = useBackbone()
  React.useEffect(() => {
    const callback = () => {
      setFilter(getBaseFilter({ model }))
    }
    listenTo(model, 'change:filterTree', callback)
    return () => {
      stopListening(model, 'change:filterTree', callback)
    }
  }, [model])
  return (
    <div
      onKeyUp={(e) => {
        if (e.keyCode === 13) {
          const targetElement = e.target as HTMLInputElement
          if (targetElement.classList.contains(FilterTextFieldIdentifier)) {
            model.startSearchFromFirstPage()
          }
        }
      }}
    >
      <FilterBranch
        filter={filter}
        setFilter={(update) => {
          model.set('filterTree', update) // update the filterTree directly so it's always in sync and we're ready to search
        }}
        root={true}
      />
    </div>
  )
}
