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
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
const _ = require('underscore')
// @ts-ignore ts-migrate(6133) FIXME: '$' is declared but its value is never read.
const $ = require('jquery')
const user = require('../singletons/user-instance.js')
require('jquery-ui/ui/widgets/resizable')
import Button, { ButtonProps } from '@material-ui/core/Button'
import { useSelectionOfLazyResults } from '../../js/model/LazyQueryResult/hooks'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
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

export const CellComponent = (props: GridProps) => {
  const { style, className, ...otherProps } = props
  return (
    <div
      {...otherProps}
      className={`inline-block ${className} p-2 overflow-hidden whitespace-normal break-all `}
      style={{
        width: '200px',
        maxHeight: '200px',
        ...style,
      }}
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

export const HeaderCheckbox = ({
  showText = false,
  lazyResults,
  buttonProps,
}: {
  showText?: boolean
  lazyResults: HeaderProps['lazyResults']
  buttonProps?: ButtonProps
}) => {
  const selection = useSelectionOfLazyResults({
    lazyResults: Object.values(lazyResults.results),
  })
  return (
    <Button
      data-id="select-all-checkbox"
      color="primary"
      onClick={event => {
        event.stopPropagation()
        if (selection === 'selected') {
          Object.values(lazyResults.results).forEach(lazyResult => {
            lazyResult.setSelected(false)
          })
        } else {
          Object.values(lazyResults.results).forEach(lazyResult => {
            lazyResult.setSelected(true)
          })
        }
      }}
      {...buttonProps}
    >
      {(() => {
        switch (selection) {
          case 'partially':
            return (
              <>
                <IndeterminateCheckBoxIcon className="Mui-text-text-primary" />
                {showText ? <div className="pl-2">Select All</div> : null}
              </>
            )
          case 'selected':
            return (
              <>
                <CheckBoxIcon className="Mui-text-text-primary" />
                {showText ? <div className="pl-2">Deselect All</div> : null}
              </>
            )
          case 'unselected':
            return (
              <>
                <div className="Mui-text-text-primary">
                  <CheckBoxOutlineBlankIcon />
                </div>
                {showText ? <div className="pl-2">Select All</div> : null}
              </>
            )
        }
      })()}
    </Button>
  )
}

export const Header = ({ visibleHeaders, lazyResults }: HeaderProps) => {
  const handleSortClick = _.debounce(updateSort, 500, true)

  return (
    <React.Fragment>
      <div
        data-id="table-container"
        className="bg-inherit whitespace-no-wrap flex items-stretch"
        style={{
          width: visibleHeaders.length * 200 + 'px',
        }}
      >
        <div className="inline-block left-0 w-auto z-10 bg-inherit">
          <CellComponent
            className="bg-inherit"
            style={{ width: 'auto', paddingLeft: '0px', paddingRight: '0px' }}
          >
            <HeaderCheckbox lazyResults={lazyResults} />
          </CellComponent>
        </div>
        {visibleHeaders.map((header, index) => {
          const last = visibleHeaders.length - 1 === index
          const { label, id, sortable } = header
          return (
            <CellComponent
              key={id}
              className={`${
                sortable ? 'is-sortable' : ''
              } Mui-border-divider border border-t-0 border-r-0 border-b-0`}
              data-propertyid={`${id}`}
              data-propertytext={`${label ? `${label} ${id}` : `${id}`}`}
              style={{
                padding: 0,
                minWidth: last ? '208px' : '200px', // 8px is the scrollbar width and they only affect the body, so we need to account for it in the last header cell
              }}
            >
              <Button
                disabled={!sortable}
                className="w-full outline-none is-bold h-full"
                onClick={() => handleSortClick(id)}
                style={{ width: '100%' }}
              >
                <div className="w-full text-left">
                  <span
                    className="column-text is-bold"
                    title={`${label ? `${label} ${id}` : `${id}`}`}
                  >
                    {`${label ? `${label} ${id}` : `${id}`}`}
                  </span>
                  <span
                    className={getSortDirectionClass(id)}
                    style={{ paddingLeft: '3px' }}
                  />
                </div>
              </Button>
            </CellComponent>
          )
        })}
      </div>
    </React.Fragment>
  )
}

export default hot(module)(Header)
