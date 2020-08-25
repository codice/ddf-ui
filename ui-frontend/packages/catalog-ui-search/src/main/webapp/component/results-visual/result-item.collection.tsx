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
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'
import Paper from '@material-ui/core/Paper'
import { Elevations, dark, light } from '../theme/theme'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { useStatusOfLazyResults } from '../../js/model/LazyQueryResult/hooks'
import useTheme from '@material-ui/core/styles/useTheme'
import LinearProgress from '@material-ui/core/LinearProgress'
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda'
import TableChartIcon from '@material-ui/icons/TableChart'
import { HeaderCheckbox } from './table-header'

const user = require('../singletons/user-instance.js')

type Props = {
  mode: any
  setMode: any
  selectionInterface: any
}

const getShowThumbnails = () => {
  return (
    user
      .get('user')
      .get('preferences')
      .get('resultDisplay') === 'Grid'
  )
}

const ResultCards = ({ mode, setMode, selectionInterface }: Props) => {
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const results = Object.values(lazyResults.results)
  const theme = useTheme()
  const { isSearching, status } = useStatusOfLazyResults({ lazyResults })
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
    <Grid container className="w-full h-full" direction="column" wrap="nowrap">
      <Grid item className="w-full">
        <Grid
          container
          className="w-full pt-2 px-2"
          direction="row"
          alignItems="center"
        >
          <Grid item className="pl-6">
            <HeaderCheckbox
              lazyResults={lazyResults}
              buttonProps={{
                style: {
                  minWidth: 0,
                },
              }}
            />
          </Grid>
          <Grid item className="pl-16">
            <Button
              onClick={() => {
                const prefs = user.get('user').get('preferences')
                prefs.set('resultDisplay', showThumbnails ? 'List' : 'Grid')
                prefs.savePreferences()
              }}
            >
              {showThumbnails ? 'Hide Thumbnails' : 'Show Thumbnails'}
            </Button>
          </Grid>
          <Grid item className="ml-auto pr-2">
            <Button
              onClick={() => {
                setMode('card')
              }}
              style={{
                borderBottom:
                  mode === 'card'
                    ? `1px solid ${theme.palette.secondary.main}`
                    : '1px solid transparent',
              }}
            >
              <ViewAgendaIcon />
              List
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                setMode('table')
              }}
              style={{
                borderBottom:
                  mode === 'table'
                    ? `1px solid ${theme.palette.secondary.main}`
                    : '1px solid transparent',
              }}
            >
              <TableChartIcon />
              Table
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Box
        className="w-full h-min my-2"
        style={{
          background:
            theme.palette.type === 'dark' ? dark.background : light.background,
        }}
      />
      <Grid item className="w-full h-full p-2">
        <Paper elevation={Elevations.paper} className="w-full h-full ">
          <AutoVariableSizeList<LazyQueryResult, HTMLDivElement>
            controlledMeasuring={true}
            items={results}
            defaultSize={76}
            overscanCount={10}
            Item={({ itemRef, item, measure, index, width }) => {
              return (
                <div ref={itemRef} className="relative">
                  {index !== 0 ? (
                    <>
                      <Box className="h-min w-full" bgcolor={'divider'} />
                    </>
                  ) : null}
                  <ResultItem
                    lazyResults={results}
                    lazyResult={item}
                    selectionInterface={selectionInterface}
                    measure={measure}
                    index={index}
                    width={width}
                  />
                  {index === results.length - 1 ? (
                    <>
                      <Box className="h-min w-full" bgcolor={'divider'} />
                    </>
                  ) : null}
                </div>
              )
            }}
            Empty={() => {
              if (Object.values(status).length === 0) {
                return <div className="p-2">Search has not yet been run.</div>
              }
              if (isSearching) {
                return <LinearProgress variant="indeterminate" />
              }
              return (
                <div className="result-item-collection-empty p-2">
                  No Results Found
                </div>
              )
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  )
}

export default hot(module)(ResultCards)
