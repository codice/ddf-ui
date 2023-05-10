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
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { CellComponent } from './table-header'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import {
  useRerenderOnBackboneSync,
  useSelectionOfLazyResult,
} from '../../../js/model/LazyQueryResult/hooks'
import metacardDefinitions from '../../singletons/metacard-definitions'
import user from '../../singletons/user-instance'
import TypedMetacardDefs from '../../tabs/metacard/metacardDefinitions'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { SelectionBackground } from './result-item'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import { TypedUserInstance } from '../../singletons/TypedUser'
import useCoordinateFormat from '../../tabs/metacard/useCoordinateFormat'
import Common from '../../../js/Common'
import Extensions from '../../../extension-points'
type ResultItemFullProps = {
  lazyResult: LazyQueryResult
  measure: () => void
  index: number
  results: LazyQueryResult[]
  headerColWidth: Map<string, string>
  addOnWidth: number
  setMaxAddOnWidth: (width: number) => void
}
export function clearSelection() {
  if (window.getSelection) {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    window.getSelection().removeAllRanges()
  } else if ((document as any).selection) {
    ;(document as any).selection.empty()
  }
}
export function hasSelection(): boolean {
  if (window.getSelection) {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    return window.getSelection().toString() !== ''
  } else if ((document as any).selection) {
    return (document as any).selection.toString() !== ''
  } else {
    return false
  }
}
const CheckboxCell = ({ lazyResult }: { lazyResult: LazyQueryResult }) => {
  const isSelected = useSelectionOfLazyResult({ lazyResult })
  return (
    <CellComponent className="h-full" style={{ width: 'auto', padding: '0px' }}>
      <Button
        data-id="select-checkbox"
        onClick={(event) => {
          event.stopPropagation()
          if (event.shiftKey) {
            lazyResult.shiftSelect()
          } else {
            lazyResult.controlSelect()
          }
        }}
        className="h-full children-block children-h-full"
      >
        {isSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      </Button>
    </CellComponent>
  )
}
const RowComponent = ({
  lazyResult,
  measure,
  index,
  results,
  headerColWidth,
  addOnWidth,
  setMaxAddOnWidth,
}: ResultItemFullProps) => {
  const thumbnail = lazyResult.plain.metacard.properties.thumbnail
  const [shownAttributes, setShownAttributes] = React.useState(
    TypedUserInstance.getResultsAttributesShownTable()
  )
  const isLast = index === results.length - 1
  const { listenTo } = useBackbone()
  const convertToFormat = useCoordinateFormat()
  useRerenderOnBackboneSync({ lazyResult })

  const addOnRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const width = addOnRef.current?.getBoundingClientRect().width || 0
    setMaxAddOnWidth(width)
  })

  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:results-attributesShownTable',
      () => {
        setShownAttributes(TypedUserInstance.getResultsAttributesShownTable())
      }
    )
  }, [])
  const imgsrc = Common.getImageSrc(thumbnail)
  React.useEffect(() => {
    measure()
  }, [shownAttributes, convertToFormat])
  const getDisplayValue = (value: any, property: string) => {
    if (value && metacardDefinitions.metacardTypes[property]) {
      switch (metacardDefinitions.metacardTypes[property].type) {
        case 'GEOMETRY':
          return convertToFormat(value)
      }
    }
    return value
  }
  const ResultItemAddOnInstance = Extensions.resultItemRowAddOn({ lazyResult })
  return (
    <React.Fragment>
      <div
        className="bg-inherit flex items-strech flex-nowrap"
        style={{
          width: shownAttributes.length * 200 + 'px',
        }}
      >
        <div
          className={`sticky left-0 w-auto z-10 bg-inherit Mui-border-divider border ${
            isLast ? '' : 'border-b-0'
          } border-l-0 ${index === 0 ? 'border-t-0' : ''}`}
        >
          <SelectionBackground lazyResult={lazyResult} />
          <CheckboxCell lazyResult={lazyResult} />
        </div>
        <div
          className={`relative Mui-border-divider border border-b-0 border-r-0 border-l-0 ${
            index === 0 ? 'border-t-0' : ''
          }`}
        >
          <SelectionBackground
            lazyResult={lazyResult}
            style={{ width: shownAttributes.length * 200 + 'px' }}
          />
          <Button
            data-id="result-item-row-container-button"
            onMouseDown={(event) => {
              /**
               * Shift key can cause selections since we set the class to allow text selection,
               * so the only scenario we want to prevent that in is when shift clicking
               */
              if (event.shiftKey) {
                clearSelection()
              }
            }}
            onClick={(event) => {
              if (hasSelection()) {
                return
              }
              if (event.shiftKey) {
                lazyResult.shiftSelect()
              } else if (event.ctrlKey || event.metaKey) {
                lazyResult.controlSelect()
              } else {
                lazyResult.select()
              }
            }}
            disableFocusRipple
            disableRipple
            disableTouchRipple
            className="outline-none rounded-none select-text p-0 text-left break-words h-full children-h-full"
          >
            <div className="w-full h-full">
              <Grid container direction="row" className="h-full" wrap="nowrap">
                <div
                  key="resultItemAddOn"
                  className={`Mui-border-divider border border-t-0 border-l-0 ${
                    isLast ? '' : 'border-b-0'
                  } h-full`}
                >
                  {ResultItemAddOnInstance ? (
                    // The sole purpose of this div is to attach the ref, since functional components
                    // (in this case, CellComponent) can't accept refs.
                    <div ref={addOnRef}>
                      <CellComponent
                        key="resultItemAddOn"
                        style={{
                          width: 'auto',
                        }}
                        className="pt-3 pr-4"
                      >
                        <div>{ResultItemAddOnInstance}</div>
                      </CellComponent>
                    </div>
                  ) : (
                    <div style={{ width: addOnWidth }} />
                  )}
                </div>
                {shownAttributes.map((property) => {
                  let value = lazyResult.plain.metacard.properties[
                    property
                  ] as any
                  if (value === undefined) {
                    value = ''
                  }
                  if (value.constructor !== Array) {
                    value = [value]
                  }
                  if (value && metacardDefinitions.metacardTypes[property]) {
                    switch (metacardDefinitions.metacardTypes[property].type) {
                      case 'DATE':
                        value = value.map((val: any) =>
                          val !== undefined && val !== ''
                            ? user.getUserReadableDateTime(val)
                            : ''
                        )
                        break
                      default:
                        break
                    }
                  }
                  return (
                    <div key={property}>
                      <CellComponent
                        key={property}
                        data-property={`${property}`}
                        className={`Mui-border-divider border border-t-0 border-l-0 ${
                          isLast ? '' : 'border-b-0'
                        } h-full`}
                        data-value={`${value}`}
                        style={{
                          width: `${headerColWidth.get(property)}`,
                          minWidth: '200px',
                        }}
                      >
                        {property === 'thumbnail' && thumbnail ? (
                          <img
                            data-id="thumbnail-value"
                            src={imgsrc}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                            }}
                            onLoad={() => {
                              measure()
                            }}
                            onError={() => {
                              measure()
                            }}
                          />
                        ) : (
                          <React.Fragment>
                            <div
                              data-id={`${property}-value`}
                              style={{ wordBreak: 'break-word' }}
                            >
                              {value.map((curValue: any, index: number) => {
                                return (
                                  <span key={index} data-value={`${curValue}`}>
                                    {curValue.toString().startsWith('http') ? (
                                      <a
                                        href={`${curValue}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {TypedMetacardDefs.getAlias({
                                          attr: property,
                                        })}
                                      </a>
                                    ) : (
                                      `${
                                        value.length > 1 &&
                                        index < value.length - 1
                                          ? curValue + ', '
                                          : getDisplayValue(curValue, property)
                                      }`
                                    )}
                                  </span>
                                )
                              })}
                            </div>
                          </React.Fragment>
                        )}
                      </CellComponent>
                    </div>
                  )
                })}
              </Grid>
            </div>
          </Button>
        </div>
      </div>
    </React.Fragment>
  )
}
export default hot(module)(RowComponent)
