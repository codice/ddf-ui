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
// @ts-ignore ts-migrate(6133) FIXME: 'useTheme' is declared but its value is never read... Remove this comment to see the full error message
import useTheme from '@material-ui/core/styles/useTheme'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { CellComponent } from './table-header'
// @ts-ignore ts-migrate(6133) FIXME: 'styled' is declared but its value is never read.
import styled from 'styled-components'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useSelectionOfLazyResult } from '../../js/model/LazyQueryResult/hooks'

const metacardDefinitions = require('../singletons/metacard-definitions.js')
const user = require('../singletons/user-instance.js')
const Common = require('../../js/Common.js')
import TypedMetacardDefs from '../tabs/metacard/metacardDefinitions'
import Box from '@material-ui/core/Box'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
// @ts-ignore ts-migrate(6133) FIXME: 'CheckIcon' is declared but its value is never rea... Remove this comment to see the full error message
import CheckIcon from '@material-ui/icons/Check'
import Divider from '@material-ui/core/Divider'
type Property = {
  class: string
  hidden: boolean
  property: string
  value: string[]
}

type ResultItemBasicProps = {
  lazyResult: LazyQueryResult
  visibleHeaders: any
}

type ResultItemFullProps = ResultItemBasicProps & {
  measure: () => void
  index: number
}

export function clearSelection() {
  if (window.getSelection) {
    // @ts-ignore ts-migrate(2531) FIXME: Object is possibly 'null'.
    window.getSelection().removeAllRanges()
    // @ts-ignore ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Docum... Remove this comment to see the full error message
  } else if (document.selection) {
    // @ts-ignore ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Docum... Remove this comment to see the full error message
    document.selection.empty()
  }
}

export function hasSelection(): boolean {
  if (window.getSelection) {
    // @ts-ignore ts-migrate(2531) FIXME: Object is possibly 'null'.
    return window.getSelection().toString() !== ''
    // @ts-ignore ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Docum... Remove this comment to see the full error message
  } else if (document.selection) {
    // @ts-ignore ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Docum... Remove this comment to see the full error message
    return document.selection.toString() !== ''
  } else {
    return false
  }
}

const RowComponent = ({
  lazyResult,
  visibleHeaders,
  measure,
  // @ts-ignore ts-migrate(6133) FIXME: 'index' is declared but its value is never read.
  index,
}: ResultItemFullProps) => {
  const isSelected = useSelectionOfLazyResult({ lazyResult })

  const visibleProperties: Property[] = React.useMemo(
    () => {
      return visibleHeaders.map((property: any) => {
        let value = lazyResult.plain.metacard.properties[property.id]
        if (value === undefined) {
          value = ''
        }
        if (value.constructor !== Array) {
          value = [value]
        }
        let className = 'is-text'
        if (value && metacardDefinitions.metacardTypes[property.id]) {
          switch (metacardDefinitions.metacardTypes[property.id].type) {
            case 'DATE':
              value = value.map(
                (val: any) =>
                  val !== undefined && val !== ''
                    ? user.getUserReadableDateTime(val)
                    : ''
              )
              break
            default:
              break
          }
        }
        if (property.id === 'thumbnail') {
          className = 'is-thumbnail'
        }
        return {
          property: property.id,
          value,
          class: className,
          hidden: property.hidden,
        }
      })
    },
    [visibleHeaders]
  )

  const thumbnail = lazyResult.plain.metacard.properties.thumbnail

  const imgsrc = Common.getImageSrc(thumbnail)

  React.useEffect(() => {
    measure()
  })
  // console.log('row rendered:' + index)
  return (
    <React.Fragment>
      <Grid
        container
        className="bg-inherit relative"
        direction="row"
        wrap="nowrap"
        style={{
          width: visibleProperties.length * 200 + 'px',
        }}
      >
        <Divider
          orientation="horizontal"
          className="absolute bottom-0 z-20 w-full h-min"
        />
        <Box
          className="absolute left-0 top-0 z-0 w-full h-full"
          bgcolor="secondary.main"
          style={{
            opacity: isSelected ? 0.05 : 0,
          }}
        />
        <Grid item className="sticky left-0 w-auto z-10 bg-inherit">
          <Box
            className="absolute left-0 top-0 -z-1 w-full h-full"
            bgcolor="secondary.main"
            style={{
              opacity: isSelected ? 0.05 : 0,
            }}
          />
          <CellComponent className="" style={{ width: 'auto', padding: '0px' }}>
            <Button
              data-id="select-checkbox"
              onClick={event => {
                event.stopPropagation()

                if (event.shiftKey) {
                  lazyResult.shiftSelect()
                } else {
                  lazyResult.controlSelect()
                }
              }}
            >
              {isSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            </Button>
          </CellComponent>
        </Grid>
        <Grid item>
          <Button
            data-id="result-item-row-container-button"
            onMouseDown={event => {
              /**
               * Shift key can cause selections since we set the class to allow text selection,
               * so the only scenario we want to prevent that in is when shift clicking
               */
              if (event.shiftKey) {
                clearSelection()
              }
            }}
            onClick={event => {
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
            className="relative outline-none rounded-none select-text p-0 text-left break-words"
          >
            <div className="w-full">
              <Box
                className="absolute left-0 top-0 -z-1 w-full h-full"
                bgcolor="secondary.main"
                style={{
                  opacity: isSelected ? 0.05 : 0,
                }}
              />
              <Grid
                container
                direction="row"
                wrap="nowrap"
                style={{
                  width: visibleProperties.length * 200 + 'px',
                }}
              >
                {visibleProperties.map(property => {
                  const alias = TypedMetacardDefs.getAlias({
                    attr: property.property,
                  })

                  return (
                    <CellComponent
                      key={property.property}
                      data-property={`${property.property}`}
                      className={`${property.class} ${
                        property.hidden ? 'is-hidden-column' : ''
                      } relative`}
                      data-value={`${property.value}`}
                    >
                      <>
                        <Box
                          className="w-min h-full absolute left-0 top-0"
                          bgcolor="divider"
                        />
                      </>
                      {property.property === 'thumbnail' && thumbnail ? (
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
                            data-id={`${property.property}-value`}
                            style={{ wordBreak: 'break-word' }}
                          >
                            {property.value.map((value, index) => {
                              return (
                                <span
                                  key={index}
                                  data-value={`${value}`}
                                  title={`${alias}: ${value}`}
                                >
                                  {value.toString().substring(0, 4) ===
                                  'http' ? (
                                    <a
                                      href={`${value}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {TypedMetacardDefs.getAlias({
                                        attr: property.property,
                                      })}
                                    </a>
                                  ) : (
                                    `${value}`
                                  )}
                                </span>
                              )
                            })}
                          </div>
                        </React.Fragment>
                      )}
                    </CellComponent>
                  )
                })}
              </Grid>
            </div>
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default hot(module)(RowComponent)
