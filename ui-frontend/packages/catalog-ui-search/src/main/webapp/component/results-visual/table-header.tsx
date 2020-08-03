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
import Grid, { GridProps } from '@material-ui/core/Grid'
import { useTheme } from '@material-ui/core/styles'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
const _ = require('underscore')
const $ = require('jquery')
const user = require('../singletons/user-instance.js')
require('jquery-ui/ui/widgets/resizable')

export type Header = {
  hidden: boolean
  id: string
  label?: string
  sortable: boolean
}

type HeaderProps = {
  visibleHeaders: Header[]
  lazyResults: LazyQueryResults
}

type Sort = {
  attribute: string
  direction: 'ascending' | 'descending'
}

export const RowComponent = (
  props: React.AllHTMLAttributes<HTMLDivElement>
) => {
  return <div {...props} style={{ whiteSpace: 'nowrap' }} />
}

export const CellComponent = (props: GridProps) => {
  const { style, ...otherProps } = props
  return (
    <Grid
      item
      {...otherProps}
      style={{
        width: '200px',
        maxHeight: '200px',
        textOverflow: 'ellipsis',
        border: '1px solid gray',
        overflow: 'hidden',
        padding: '10px',
        ...style,
      }}
      zeroMinWidth
    />
  )
}

const updateSort = (attribute: string) => {
  const prefs = user.get('user').get('preferences')
  const prefResultSort = prefs.get('resultSort') as Sort[]
  const currSort =
    prefResultSort && prefResultSort.length
      ? prefResultSort.find(sort => sort.attribute === attribute)
      : undefined

  const sort: Sort[] = [
    {
      attribute,
      direction: 'ascending',
    },
  ]

  if (currSort) {
    sort[0].direction =
      currSort.direction === 'ascending' ? 'descending' : 'ascending'
  }

  prefs.set('resultSort', sort)
  prefs.savePreferences()
}

const getSortDirectionClass = (attribute: string) => {
  const sorts = user
    .get('user')
    .get('preferences')
    .get('resultSort') as Sort[]
  const matchedSort = sorts && sorts.find(sort => sort.attribute === attribute)
  if (matchedSort && matchedSort.direction) {
    if (matchedSort.direction === 'ascending') {
      return 'fa fa-sort-asc'
    } else if (matchedSort.direction === 'descending') {
      return 'fa fa-sort-desc'
    } else {
      return ''
    }
  } else {
    return ''
  }
}

export const Header = ({ visibleHeaders, lazyResults }: HeaderProps) => {
  const [forceRender, setForceRender] = React.useState(Math.random())
  const { listenTo } = useBackbone()
  const theme = useTheme()
  const handleSortClick = _.debounce(updateSort, 500, true)

  return (
    <React.Fragment>
      <Grid
        container
        direction="row"
        wrap="nowrap"
        style={{
          width: visibleHeaders.length * 200 + 'px',
          background: 'inherit',
        }}
      >
        {visibleHeaders.map(header => {
          const { label, id, sortable } = header
          return (
            <CellComponent
              key={id}
              className={`${sortable ? 'is-sortable' : ''}`}
              data-propertyid={`${id}`}
              data-propertytext={`${label ? `${label} ${id}` : `${id}`}`}
            >
              <button
                disabled={!sortable}
                onClick={() => handleSortClick(id)}
                style={{ width: '100%' }}
              >
                <span
                  className="column-text"
                  title={`${label ? `${label} ${id}` : `${id}`}`}
                >
                  {`${label ? `${label} ${id}` : `${id}`}`}
                </span>
                <span
                  className={getSortDirectionClass(id)}
                  style={{ paddingLeft: '3px' }}
                />
              </button>
            </CellComponent>
          )
        })}
      </Grid>
    </React.Fragment>
  )
}

export default hot(module)(Header)
