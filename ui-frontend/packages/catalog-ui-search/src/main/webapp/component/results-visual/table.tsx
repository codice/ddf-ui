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
import TableExport from '../table-export/table-export'
const lightboxInstance = require('../lightbox/lightbox.view.instance.js')
import Button from '@material-ui/core/Button'
const user = require('../singletons/user-instance.js')
const TableVisibility = require('../visualization/table/table-visibility.view')
const TableRearrange = require('../visualization/table/table-rearrange.view')
import { hot } from 'react-hot-loader'
import MRC from '../../react-component/marionette-region-container'
import { AutoVariableSizeList } from 'react-window-components'
import Grid from '@material-ui/core/Grid'
import { Header } from './table-header'
import ResultItemRow from './result-item-row'
import { getFilteredAttributes, getVisibleHeaders } from './table-header-utils'
import ViewColumnIcon from '@material-ui/icons/ViewColumn'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../theme/theme'
import Divider from '@material-ui/core/Divider'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { useStatusOfLazyResults } from '../../js/model/LazyQueryResult/hooks'
import LinearProgress from '@material-ui/core/LinearProgress'
import { DarkDivider } from '../dark-divider/dark-divider'
import useTheme from '@material-ui/core/styles/useTheme'
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda'
import TableChartIcon from '@material-ui/icons/TableChart'
import Box from '@material-ui/core/Box'
;(() => {
  const oldHandleSave = TableVisibility.prototype.handleSave
  TableVisibility.prototype.handleSave = function () {
    user.get('user').get('preferences').set('hasSelectedColumns', true)
    oldHandleSave.apply(this, arguments)
  }
  // const oldDestroy = TableVisibility.prototype.destroy
  // TableVisibility.prototype.destroy = function() {
  //   lightboxInstance.model.close()
  //   oldDestroy.apply(this, arguments)
  // }
})()

type Props = {
  selectionInterface: any
  mode: any
  setMode: any
}

const TableVisual = ({ selectionInterface, mode, setMode }: Props) => {
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const results = Object.values(lazyResults.results)
  const theme = useTheme()
  const { isSearching, status } = useStatusOfLazyResults({ lazyResults })
  const { listenTo } = useBackbone()
  const headerRef = React.useRef<HTMLDivElement>(null)
  const [filteredAttributes, setFilteredAttributes] = React.useState(
    getFilteredAttributes(lazyResults)
  )
  const [visibleHeaders, setVisibleHeaders] = React.useState(
    getVisibleHeaders(filteredAttributes)
  )

  React.useEffect(() => {
    setFilteredAttributes(getFilteredAttributes(lazyResults))
  }, [lazyResults.results])

  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:columnHide change:columnOrder',
      () => {
        setFilteredAttributes(getFilteredAttributes(lazyResults))
      }
    )
  }, [])

  React.useEffect(() => {
    setVisibleHeaders(getVisibleHeaders(filteredAttributes))
  }, [filteredAttributes])

  const openExportModal = () => {
    lightboxInstance.model.updateTitle('Export Results')
    lightboxInstance.model.open()
    lightboxInstance.showContent(
      <div>
        <CircularProgress />
      </div>
    )
    setTimeout(() => {
      lightboxInstance.showContent(
        <TableExport
          selectionInterface={selectionInterface}
          filteredAttributes={[]}
        />
      )
    }, 250)
  }

  const openRearrangeModel = () => {
    lightboxInstance.model.updateTitle('Rearrange')
    lightboxInstance.model.open()
    lightboxInstance.showContent(
      <div>
        <CircularProgress />
      </div>
    )

    setTimeout(() => {
      lightboxInstance.showContent(
        <MRC
          key={JSON.stringify(visibleHeaders)}
          view={TableRearrange}
          viewOptions={{
            selectionInterface,
            filteredAttributes,
            destroy: () => {
              lightboxInstance.model.close()
            },
          }}
        />
      )
    }, 250)
  }

  const openVisibilityModel = () => {
    lightboxInstance.model.updateTitle('Visibility')
    lightboxInstance.model.open()
    lightboxInstance.showContent(
      <div>
        <CircularProgress />
      </div>
    )
    setTimeout(() => {
      lightboxInstance.showContent(
        <MRC
          key={JSON.stringify(visibleHeaders)}
          view={TableVisibility}
          viewOptions={{
            selectionInterface,
            filteredAttributes,
            destroy: () => {
              lightboxInstance.model.close()
            },
          }}
        />
      )
    }, 250)
  }

  return (
    <Grid
      container
      className="w-full h-full bg-inherit"
      direction="column"
      wrap="nowrap"
    >
      <Grid item>
        <Grid
          container
          className="w-full pt-2 px-2"
          direction="row"
          alignItems="center"
        >
          <Grid item className="pl-8">
            <Button
              data-id="rearrange-column-button"
              onClick={openRearrangeModel}
              color="primary"
            >
              <Box color="text.primary">
                <span className="fa fa-columns pr-2"> </span>
              </Box>
              Rearrange Column
            </Button>
          </Grid>
          <Grid item className="pl-8">
            <Button
              data-id="hide-show-column-button"
              onClick={openVisibilityModel}
              color="primary"
            >
              <Box color="text.primary">
                <span className="fa fa-eye pr-2"> </span>
              </Box>
              Hide / Show Columns
            </Button>
          </Grid>
          <Grid item className="pl-8">
            <Button
              data-id="reset-shown-to-defaults-button"
              onClick={() => {
                const prefs = user.get('user').get('preferences')
                prefs.set('columnHide', [])
                prefs.set('hasSelectedColumns', false)
              }}
              color="primary"
            >
              <Box color="text.primary">
                <ViewColumnIcon className="pr-2" />
              </Box>
              Reset Shown to Defaults
            </Button>
          </Grid>
          <Grid item className="pl-8">
            <Button
              data-id="export-table-button"
              onClick={openExportModal}
              color="primary"
            >
              <Box color="text.primary">
                <span className="fa fa-share pr-2"> </span>
              </Box>
              Export
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

      <Grid item className="overflow-hidden bg-inherit w-full h-full p-2">
        <Paper elevation={Elevations.paper} className="w-full h-full">
          <Grid
            container
            className="w-full h-full bg-inherit"
            direction="column"
            wrap="nowrap"
          >
            <Grid item className="overflow-hidden bg-inherit">
              <div
                className="w-auto overflow-auto scrollbars-hide bg-inherit"
                ref={headerRef}
              >
                <Header
                  visibleHeaders={visibleHeaders}
                  lazyResults={lazyResults}
                />
              </div>
            </Grid>
            <Grid item>
              <Divider className="w-full h-min" />
            </Grid>
            <Grid item className="w-full h-full overflow-hidden bg-inherit">
              <AutoVariableSizeList<LazyQueryResult, HTMLDivElement>
                outerElementProps={{
                  onScroll: (e) => {
                    if (headerRef.current) {
                      // @ts-ignore ts-migrate(2339) FIXME: Property 'scrollLeft' does not exist on type 'Even... Remove this comment to see the full error message
                      headerRef.current.scrollLeft = e.target.scrollLeft
                    }
                  },
                }}
                key={JSON.stringify(visibleHeaders)}
                defaultSize={76}
                overscanCount={10}
                controlledMeasuring={true}
                items={results}
                Item={({ itemRef, item, measure, index }) => {
                  return (
                    <div ref={itemRef} className="bg-inherit">
                      <ResultItemRow
                        lazyResult={item}
                        visibleHeaders={visibleHeaders}
                        measure={measure}
                        index={index}
                      />
                    </div>
                  )
                }}
                Empty={() => {
                  if (Object.values(status).length === 0) {
                    return (
                      <div className="p-2">Search has not yet been run.</div>
                    )
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
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default hot(module)(TableVisual)
