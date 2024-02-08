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
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { CellComponent } from './table-header'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import {
  useRerenderOnBackboneSync,
  useSelectionOfLazyResult,
} from '../../../js/model/LazyQueryResult/hooks'
import user from '../../singletons/user-instance'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { SelectionBackground } from './result-item'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import { TypedUserInstance } from '../../singletons/TypedUser'
import useCoordinateFormat from '../../tabs/metacard/useCoordinateFormat'
import Common from '../../../js/Common'
import Extensions from '../../../extension-points'
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks'
import wreqr from '../../../js/wreqr'
type ResultItemFullProps = {
  lazyResult: LazyQueryResult
  measure: () => void
  index: number
  results: LazyQueryResult[]
  selectionInterface: any
  headerColWidth: Map<string, string>
  actionWidth: number
  setMaxActionWidth: (width: number) => void
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
        className="h-full"
      >
        {isSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      </Button>
    </CellComponent>
  )
}
const RowComponent = ({
  lazyResult,
  measure: originalMeasure,
  index,
  results,
  selectionInterface,
  headerColWidth,
  actionWidth,
  setMaxActionWidth,
  addOnWidth,
  setMaxAddOnWidth,
}: ResultItemFullProps) => {
  const MetacardDefinitions = useMetacardDefinitions()
  const thumbnail = lazyResult.plain.metacard.properties.thumbnail
  const [decimalPrecision, setDecimalPrecision] = React.useState(
    TypedUserInstance.getDecimalPrecision()
  )
  const [shownAttributes, setShownAttributes] = React.useState(
    TypedUserInstance.getResultsAttributesShownTable()
  )
  const isLast = index === results.length - 1
  const { listenTo } = useBackbone()
  const convertToFormat = useCoordinateFormat()
  const convertToPrecision = (value: any) => {
    return value && decimalPrecision
      ? Number(value).toFixed(decimalPrecision)
      : value
  }
  useRerenderOnBackboneSync({ lazyResult })

  const actionRef = React.useRef<HTMLDivElement>(null)
  const addOnRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const actionWidth = actionRef.current?.getBoundingClientRect().width || 0
    setMaxActionWidth(actionWidth)
    const addOnWidth = addOnRef.current?.getBoundingClientRect().width || 0
    setMaxAddOnWidth(addOnWidth)
  })

  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:results-attributesShownTable',
      () => {
        setShownAttributes(TypedUserInstance.getResultsAttributesShownTable())
      }
    )
    listenTo(
      user.get('user').get('preferences'),
      'change:decimalPrecision',
      () => {
        setDecimalPrecision(TypedUserInstance.getDecimalPrecision())
      }
    )
  }, [])
  const imgsrc = Common.getImageSrc(thumbnail)
  const measure = () => {
    if (
      containerRef.current?.clientHeight &&
      containerRef.current?.clientHeight > 0
    ) {
      originalMeasure()
    }
  }
  React.useEffect(() => {
    measure()
  }, [shownAttributes, convertToFormat])
  const getDisplayValue = (value: any, property: string) => {
    if (value && MetacardDefinitions.getAttributeMap()[property]) {
      switch (MetacardDefinitions.getAttributeMap()[property].type) {
        case 'GEOMETRY':
          return convertToFormat(value)
        case 'LONG':
        case 'DOUBLE':
        case 'FLOAT':
          return convertToPrecision(value)
      }
    }
    return value
  }
  listenTo(wreqr.vent, 'activeContentItemChanged', () => {
    measure()
  })
  const containerRef = React.useRef<HTMLDivElement>(null)
  const ResultItemActionInstance = Extensions.resultItemAction({
    lazyResult,
    selectionInterface,
    itemContentRef: containerRef,
  })

  const ResultItemAddOnInstance = Extensions.resultItemRowAddOn({
    lazyResult,
    isTableView: true,
  })

  return (
    <div ref={containerRef}>
      <div
        className="bg-inherit flex items-strech flex-nowrap"
        style={{
          width: actionWidth + addOnWidth + shownAttributes.length * 200 + 'px',
        }}
      >
        <div
          key="resultItemAction"
          className={`bg-inherit Mui-border-divider border ${
            isLast ? '' : 'border-b-0'
          } border-l-0 ${index === 0 ? 'border-t-0' : ''}`}
        >
          {ResultItemActionInstance ? (
            <CellComponent
              key="resultItemAction"
              className="h-full"
              style={{
                width: 'auto',
                padding: 0,
              }}
              ref={actionRef}
            >
              <ResultItemActionInstance />
            </CellComponent>
          ) : (
            <div style={{ width: actionWidth }} />
          )}
        </div>
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
            style={{ width: addOnWidth + shownAttributes.length * 200 + 'px' }}
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
            className="outline-none rounded-none select-text p-0 text-left break-words h-full"
          >
            <div className="w-full h-full">
              <Grid container direction="row" className="h-full" wrap="nowrap">
                <div
                  key="resultItemAddOn"
                  className={`Mui-border-divider border border-t-0 border-l-0 ${
                    isLast ? '' : 'border-b-0'
                  } h-full`}
                >
                  <div style={{ width: addOnWidth }}>
                    {ResultItemAddOnInstance && (
                      <CellComponent
                        key="resultItemAddOn"
                        style={{
                          width: 'auto',
                        }}
                        className="pt-3"
                        ref={addOnRef}
                      >
                        {ResultItemAddOnInstance}
                      </CellComponent>
                    )}
                  </div>
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
                  if (
                    value &&
                    MetacardDefinitions.getAttributeMap()[property]
                  ) {
                    switch (
                      MetacardDefinitions.getAttributeMap()[property].type
                    ) {
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
                                        {MetacardDefinitions.getAlias(property)}
                                      </a>
                                    ) : (
                                      `${
                                        value.length > 1 &&
                                        index < value.length - 1
                                          ? getDisplayValue(
                                              curValue,
                                              property
                                            ) + ', '
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
    </div>
  )
}
export default hot(module)(RowComponent)
