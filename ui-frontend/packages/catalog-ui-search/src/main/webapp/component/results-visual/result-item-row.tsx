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
import { useTheme } from '@material-ui/core/styles'
import { useSelectionOfLazyResult } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/hooks'
import { LazyQueryResult } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/LazyQueryResult'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useBackbone } from '../hooks/useBackbone.hook'
import { CellComponent, Header } from './table-header'
import styled from 'styled-components'

const metacardDefinitions = require('catalog-ui-search/src/main/webapp/component/singletons/metacard-definitions.js')
const user = require('catalog-ui-search/src/main/webapp/component/singletons/user-instance.js')
const HandleBarsHelpers = require('catalog-ui-search/src/main/webapp/js/HandlebarsHelpers')

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

const SpecialButton = styled(Button)`
  && {
    height: auto;
    .MuiButton-label {
      display: block;
    }
    text-transform: none;
    text-align: left;
    overflow: hidden;
    word-break: break-word;
    padding: 0px;
  }
`

const RowComponent = ({
  lazyResult,
  visibleHeaders,
  measure,
  index,
}: ResultItemFullProps) => {
  const theme = useTheme()
  const isSelected = useSelectionOfLazyResult({ lazyResult })
  // console.log(`rendered: ${index}`)

  const visibleProperties: Property[] = visibleHeaders.map(property => {
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
            val =>
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

  const thumbnail = lazyResult.plain.metacard.properties.thumbnail

  const imgsrc = HandleBarsHelpers.getImageSrc(thumbnail)

  React.useEffect(() => {
    measure()
  })

  return (
    <React.Fragment>
      <SpecialButton
        onClick={event => {
          if (event.shiftKey) {
            lazyResult.shiftSelect()
          } else if (event.ctrlKey || event.metaKey) {
            lazyResult.controlSelect()
          } else {
            lazyResult.select()
          }
        }}
      >
        <Grid
          container
          direction="row"
          wrap="nowrap"
          style={{
            width: visibleProperties.length * 200 + 'px',
            background: isSelected
              ? theme.palette.type === 'dark'
                ? 'rgba(50,50,50,1)'
                : 'rgba(200, 200, 200, 1)'
              : theme.palette.background.paper,
          }}
        >
          {visibleProperties.map((property, index) => {
            const alias = HandleBarsHelpers.getAlias(property.property)

            return (
              <CellComponent
                key={property.property}
                data-property={`${property.property}`}
                className={`${property.class} ${
                  property.hidden ? 'is-hidden-column' : ''
                }`}
                data-value={`${property.value}`}
              >
                {property.property === 'thumbnail' && thumbnail ? (
                  <img
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
                    <div style={{ wordBreak: 'break-word' }}>
                      {property.value.map((value, index) => {
                        return (
                          <span
                            key={index}
                            data-value={`${value}`}
                            title={`${alias}: ${value}`}
                          >
                            {value.toString().substring(0, 4) === 'http' ? (
                              <a
                                href={`${value}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {HandleBarsHelpers.getAlias(property.property)}
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
      </SpecialButton>
    </React.Fragment>
  )
}

export default hot(module)(RowComponent)
