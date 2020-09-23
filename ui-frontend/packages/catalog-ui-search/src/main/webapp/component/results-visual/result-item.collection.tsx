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
// @ts-ignore ts-migrate(6133) FIXME: 'LazyQueryResults' is declared but its value is ne... Remove this comment to see the full error message
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
// @ts-ignore ts-migrate(6133) FIXME: 'Divider' is declared but its value is never read.
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'
import Paper from '@material-ui/core/Paper'
// @ts-ignore ts-migrate(6133) FIXME: 'dark' is declared but its value is never read.
import { Elevations, dark, light } from '../theme/theme'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { useStatusOfLazyResults } from '../../js/model/LazyQueryResult/hooks'
import useTheme from '@material-ui/core/styles/useTheme'
import LinearProgress from '@material-ui/core/LinearProgress'
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda'
import TableChartIcon from '@material-ui/icons/TableChart'
import { HeaderCheckbox } from './table-header'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import { DarkDivider } from '../dark-divider/dark-divider'

const user = require('../singletons/user-instance.js')

type Props = {
  mode: any
  setMode: any
  selectionInterface: any
}

const getShowThumbnails = () => {
  return user.get('user').get('preferences').get('resultDisplay') === 'Grid'
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
              showText
              lazyResults={lazyResults}
              buttonProps={{
                style: {
                  minWidth: 0,
                },
              }}
            />
          </Grid>
          <Grid item className="pl-8">
            <Button
              data-id="show-hide-thumbnails-button"
              onClick={() => {
                const prefs = user.get('user').get('preferences')
                prefs.set('resultDisplay', showThumbnails ? 'List' : 'Grid')
                prefs.savePreferences()
              }}
              color="primary"
            >
              {(() => {
                if (showThumbnails) {
                  return (
                    <>
                      <Box color="text.primary">
                        <CheckBoxIcon />
                      </Box>
                      <Box className="pl-2">Thumbnails</Box>
                    </>
                  )
                }
                return (
                  <>
                    <Box color="text.primary">
                      <CheckBoxOutlineBlankIcon />
                    </Box>
                    <Box className="pl-2">Thumbnails</Box>
                  </>
                )
              })()}
            </Button>
          </Grid>
          <Grid item className="ml-auto pr-2">
            <Button
              data-id="list-button"
              onClick={() => {
                setMode('card')
              }}
              style={{
                borderBottom:
                  mode === 'card'
                    ? `1px solid ${theme.palette.primary.main}`
                    : '1px solid transparent',
              }}
            >
              <ViewAgendaIcon />
              List
            </Button>
          </Grid>
          <Grid item>
            <Button
              data-id="table-button"
              onClick={() => {
                setMode('table')
              }}
              style={{
                borderBottom:
                  mode === 'table'
                    ? `1px solid ${theme.palette.primary.main}`
                    : '1px solid transparent',
              }}
            >
              <TableChartIcon />
              Table
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <DarkDivider className="w-full h-min my-2" />
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
