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
import Button from '@mui/material/Button'
import user from '../../singletons/user-instance'
import { hot } from 'react-hot-loader'
import { AutoVariableSizeList } from 'react-window-components'
import Grid from '@mui/material/Grid'
import { Header } from './table-header'
import ResultItemRow from './result-item-row'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import Paper from '@mui/material/Paper'
import { Elevations } from '../../theme/theme'
import Divider from '@mui/material/Divider'
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks'
import { useStatusOfLazyResults } from '../../../js/model/LazyQueryResult/hooks'
import LinearProgress from '@mui/material/LinearProgress'
import { DarkDivider } from '../../dark-divider/dark-divider'
import { useTheme } from '@mui/material/styles';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import TableChartIcon from '@mui/icons-material/TableChart'
import TransferList from '../../tabs/metacard/transfer-list'
import { useDialog } from '../../dialog'
import { TypedUserInstance } from '../../singletons/TypedUser'
import useTimePrefs from '../../fields/useTimePrefs'
type Props = {
  selectionInterface: any
  mode: any
  setMode: any
}
type ResultsCommonControlsType = {
  getStartingLeft: () => string[]
  getStartingRight: () => string[]
  onSave: (active: string[]) => void
}
export const ResultsCommonControls = ({
  getStartingLeft,
  getStartingRight,
  onSave,
}: ResultsCommonControlsType) => {
  const dialogContext = useDialog()
  return (
    <>
      <Grid item className="ml-auto pr-8 ">
        <Button
          data-id="manage-attributes-button"
          onClick={() => {
            dialogContext.setProps({
              PaperProps: {
                style: {
                  minWidth: 'none',
                },
                elevation: Elevations.panels,
              },
              open: true,
              disableEnforceFocus: true,
              children: (
                <div
                  style={{
                    minHeight: '60vh',
                  }}
                >
                  <TransferList
                    startingLeft={getStartingLeft()}
                    startingRight={getStartingRight()}
                    onSave={(active) => {
                      onSave(active)
                    }}
                  />
                </div>
              ),
            })
          }}
          color="primary"
        >
          Manage Attributes
        </Button>
      </Grid>
    </>
  )
}
const TableVisual = ({ selectionInterface, mode, setMode }: Props) => {
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const results = Object.values(lazyResults.results)
  const theme = useTheme()
  const { isSearching, status } = useStatusOfLazyResults({ lazyResults })
  useTimePrefs()
  const headerRef = React.useRef<HTMLDivElement>(null)
  /**
   * Note that this scenario only plays out when the component is first created, so if this is open before a search is run it will already be mounted.
   *
   * This is solely to keep the illusion of responsiveness when switching from table mode to list mode (or dropping a new result visual in)
   */
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    const mountedTimeout = setTimeout(() => {
      setIsMounted(true)
    }, 1000)
    return () => {
      clearTimeout(mountedTimeout)
    }
  }, [])

  const prefs = user.get('user').get('preferences')
  const columnsWidth = new Map<string, string>(prefs.get('columnWidths'))
  const [headerColWidth, setHeaderColWidth] = React.useState(columnsWidth)

  const setWidth = (width: Map<string, string>) => {
    setHeaderColWidth(width)
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
          <ResultsCommonControls
            getStartingLeft={() => {
              return TypedUserInstance.getResultsAttributesShownTable()
            }}
            getStartingRight={() => {
              return TypedUserInstance.getResultsAttributesPossibleTable()
            }}
            onSave={(active) => {
              user
                .get('user')
                .get('preferences')
                .set('results-attributesShownTable', active)
              user.savePreferences()
            }}
          />
          <Grid item className="pr-2">
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
          {isMounted ? (
            <Grid
              container
              className="w-full h-full bg-inherit"
              direction="column"
              wrap="nowrap"
            >
              <Grid item className="bg-inherit">
                <div
                  className="w-auto overflow-auto scrollbars-hide bg-inherit"
                  ref={headerRef}
                >
                  <Header
                    lazyResults={lazyResults}
                    setHeaderColWidth={setWidth}
                    headerColWidth={headerColWidth}
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
                        headerRef.current.scrollLeft = (
                          e.target as any
                        ).scrollLeft
                      }
                    },
                  }}
                  defaultSize={76}
                  overscanCount={10}
                  controlledMeasuring={true}
                  items={results}
                  Item={({ itemRef, item, measure, index }) => {
                    return (
                      <div ref={itemRef} className="bg-inherit">
                        <ResultItemRow
                          lazyResult={item}
                          measure={measure}
                          index={index}
                          results={results}
                          headerColWidth={headerColWidth}
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
          ) : (
            <LinearProgress variant="indeterminate" />
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}
export default hot(module)(TableVisual)
