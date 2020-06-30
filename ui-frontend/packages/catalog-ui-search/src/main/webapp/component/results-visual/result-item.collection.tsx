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
import ResultItem from './result-item'
import { hot } from 'react-hot-loader'
import { AutoVariableSizeList } from 'react-window-components'
import { LazyQueryResult } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/LazyQueryResult'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { LazyQueryResults } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/LazyQueryResults'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
const user = require('catalog-ui-search/src/main/webapp/component/singletons/user-instance.js')

type Props = {
  results: LazyQueryResult[]
  mode: any
  setMode: any
  lazyResults: LazyQueryResults
}

const getShowThumbnails = () => {
  return (
    user
      .get('user')
      .get('preferences')
      .get('resultDisplay') === 'Grid'
  )
}

const ResultCards = ({ results, mode, setMode, lazyResults }: Props) => {
  const [showThumbnails, setShowThumbnails] = React.useState(
    getShowThumbnails()
  )
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(user, 'change:user>preferences>resultDisplay', () => {
      setShowThumbnails(getShowThumbnails())
    })
  }, [])
  return (
    <Grid
      container
      style={{ height: '100%', width: '100%' }}
      direction="column"
      wrap="nowrap"
    >
      <Grid item>
        <Button
          onClick={() => {
            setMode(mode === 'card' ? 'table' : 'card')
          }}
        >
          Switch to {mode === 'card' ? 'Table' : 'Card'} View
        </Button>
        <Button
          onClick={() => {
            const prefs = user.get('user').get('preferences')
            prefs.set('resultDisplay', showThumbnails ? 'List' : 'Grid')
            prefs.savePreferences()
          }}
        >
          {showThumbnails ? 'Hide Thumbnails' : 'Show Thumbnails'}
        </Button>
        <Button
          onClick={() => {
            Object.values(lazyResults.filteredResults).forEach(lazyResult => {
              lazyResult.setSelected(true)
            })
          }}
        >
          Select All
        </Button>
      </Grid>
      <Grid item style={{ height: '100%', width: '100%' }}>
        <AutoVariableSizeList<LazyQueryResult, HTMLDivElement>
          controlledMeasuring={true}
          items={results}
          defaultSize={76}
          overscanCount={10}
          Item={({ itemRef, item, measure, index, width }) => {
            return (
              <div ref={itemRef}>
                {index !== 0 ? <div style={{ height: '10px' }} /> : null}
                <ResultItem
                  lazyResult={item}
                  measure={measure}
                  index={index}
                  width={width}
                />
              </div>
            )
          }}
          Empty={() => {
            return (
              <div className="result-item-collection-empty">
                No Results Found
              </div>
            )
          }}
        />
      </Grid>
    </Grid>
  )
}

export default hot(module)(ResultCards)
