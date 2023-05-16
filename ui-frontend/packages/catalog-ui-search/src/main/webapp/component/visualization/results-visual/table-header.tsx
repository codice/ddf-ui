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
import { LazyQueryResults } from '../../../js/model/LazyQueryResult/LazyQueryResults'
import _ from 'underscore'
import user from '../../singletons/user-instance'
import Button, { ButtonProps } from '@mui/material/Button'
import { useSelectionOfLazyResults } from '../../../js/model/LazyQueryResult/hooks'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'
import { TypedUserInstance } from '../../singletons/TypedUser'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import { TypedMetacardDefs } from '../../tabs/metacard/metacardDefinitions'
export type Header = {
  hidden: boolean
  id: string
  label?: string
  sortable: boolean
}

type HeaderProps = {
  lazyResults: LazyQueryResults
  setHeaderColWidth: Function
  headerColWidth: Map<string, string>
  addOnWidth: number
}

type Sort = {
  attribute: string
  direction: 'ascending' | 'descending'
}

export const CellComponent = React.forwardRef(
  (
    props: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    ref: React.Ref<any>
  ) => {
    const { style, className, ...otherProps } = props
    return (
      <div
        {...otherProps}
        className={`inline-block ${className} p-2 overflow-auto whitespace-normal break-all `}
        style={{
          width: '200px',
          maxHeight: '200px',
          ...style,
        }}
        ref={ref}
      />
    )
  }
)

const updateSort = (attribute: string) => {
  const prefs = user.get('user').get('preferences')
  const prefResultSort = prefs.get('resultSort') as Sort[]
  const currSort =
    prefResultSort && prefResultSort.length
      ? prefResultSort.find((sort) => sort.attribute === attribute)
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
  const sorts = user.get('user').get('preferences').get('resultSort') as Sort[]
  const matchedSort =
    sorts && sorts.find((sort) => sort.attribute === attribute)
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
      onClick={(event) => {
        event.stopPropagation()
        if (selection === 'selected') {
          Object.values(lazyResults.results).forEach((lazyResult) => {
            lazyResult.setSelected(false)
          })
        } else {
          Object.values(lazyResults.results).forEach((lazyResult) => {
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

export const Header = ({
  lazyResults,
  setHeaderColWidth,
  headerColWidth,
  addOnWidth,
}: HeaderProps) => {
  const handleSortClick = _.debounce(updateSort, 500, true)
  const [shownAttributes, setShownAttributes] = React.useState(
    TypedUserInstance.getResultsAttributesShownTable()
  )
  const { listenTo } = useBackbone()

  const [activeIndex, setActiveIndex] = React.useState(null)

  const columnRefs = React.useRef(
    shownAttributes.map(() => React.createRef<HTMLDivElement>())
  )
  const prefs = user.get('user').get('preferences')

  const mouseDown = (index: any) => {
    setActiveIndex(index)
  }

  const mouseMove = React.useCallback(
    (e: any) => {
      const columnsWidth = new Map<string, string>([...headerColWidth])

      if (headerColWidth.size === 0) {
        shownAttributes.map((col) => {
          columnsWidth.set(col, '200px')
        })
      }

      shownAttributes.map((col, i) => {
        if (i === activeIndex) {
          const currRef = columnRefs.current[i].current
          const offset = currRef?.getBoundingClientRect().x
          if (offset) {
            const width = e.clientX - offset
            if (currRef) {
              currRef.style.width = `${width}px`
              columnsWidth.set(col, `${width}px`)
            }
          }
        }
      })
      setHeaderColWidth(columnsWidth)
      prefs.set('columnWidths', columnsWidth)
      prefs.savePreferences()
    },
    [activeIndex, shownAttributes]
  )
  const resetColumnWidth = (col: string) => {
    const columnsWidth = new Map<string, string>([...headerColWidth])
    columnsWidth.set(col, '200px')
    setHeaderColWidth(columnsWidth)
    prefs.set('columnWidths', columnsWidth)
    prefs.savePreferences()
  }

  const removeListeners = React.useCallback(() => {
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('mouseup', removeListeners)
  }, [mouseMove])

  const mouseUp = React.useCallback(() => {
    setActiveIndex(null)
    removeListeners()
  }, [setActiveIndex, removeListeners])

  React.useEffect(() => {
    if (activeIndex !== null) {
      window.addEventListener('mousemove', mouseMove)
      window.addEventListener('mouseup', mouseUp)
    }

    return () => {
      removeListeners()
    }
  }, [activeIndex, mouseMove, mouseUp, removeListeners])

  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:results-attributesShownTable',
      () => {
        setShownAttributes(TypedUserInstance.getResultsAttributesShownTable())
        columnRefs.current =
          TypedUserInstance.getResultsAttributesShownTable().map(() =>
            React.createRef<HTMLDivElement>()
          )
      }
    )
  }, [])
  return (
    <React.Fragment>
      <div
        data-id="table-container"
        className="bg-inherit whitespace-nowrap flex items-strech flex-nowrap"
        style={{
          width: shownAttributes.length * 200 + 'px',
          display: 'grid',
          gridTemplateColumns: `repeat(${shownAttributes.length + 3}, 1fr)`,
        }}
      >
        <div className="sticky left-0 w-auto z-10 bg-inherit Mui-border-divider border border-t-0 border-l-0 border-b-0">
          <CellComponent
            className="bg-inherit"
            style={{ width: 'auto', paddingLeft: '0px', paddingRight: '0px' }}
          >
            <HeaderCheckbox lazyResults={lazyResults} />
          </CellComponent>
        </div>
        <div
          key="resultItemAddOn"
          className="bg-inherit Mui-border-divider border border-t-0 border-l-0 border-b-0"
        >
          <div
            style={{
              width: addOnWidth,
            }}
          />
        </div>
        {shownAttributes.map((attr, index) => {
          const label = TypedMetacardDefs.getAlias({ attr })
          const sortable = true
          return (
            <div
              key={attr}
              style={{
                display: 'flex',
                width: `${headerColWidth.get(attr)}`,
                minWidth: '200px',
              }}
              ref={columnRefs.current[index]}
            >
              <CellComponent
                className={`${
                  sortable ? 'is-sortable' : ''
                } Mui-border-divider border border-t-0 border-l-0 border-b-0`}
                data-propertyid={`${attr}`}
                data-propertytext={`${label ? `${label}` : `${attr}`}`}
                style={{
                  width: '100%',
                  minWidth: '200px',
                  display: 'flex',
                  padding: 0,
                }}
              >
                <Button
                  disabled={!sortable}
                  className="w-full outline-none is-bold h-full"
                  onClick={() => handleSortClick(attr)}
                  style={{ width: '100%', marginRight: '5px' }}
                >
                  <div className="w-full text-left">
                    <span
                      className="column-text is-bold"
                      title={`${label ? `${label}` : `${attr}`}`}
                    >
                      {`${label ? `${label}` : `${attr}`}`}
                    </span>
                    <span
                      className={getSortDirectionClass(attr)}
                      style={{ paddingLeft: '3px' }}
                    />
                  </div>
                </Button>
                <div
                  style={{ width: '10px', cursor: 'col-resize' }}
                  className="hover:border-solid"
                  onDoubleClick={() => {
                    resetColumnWidth(attr)
                    const currRef = columnRefs.current[index].current
                    if (currRef) {
                      currRef.style.width = '200px'
                    }
                  }}
                  onMouseDown={() => {
                    mouseDown(index)
                  }}
                ></div>
              </CellComponent>
            </div>
          )
        })}
        <CellComponent style={{ width: '8px' }}></CellComponent>{' '}
        {/** // 8px is the scrollbar width and they only affect the body, so we need to account for it */}
      </div>
    </React.Fragment>
  )
}

export default hot(module)(Header)
