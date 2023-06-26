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
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import Paper from '@mui/material/Paper'
import { Elevations } from '../../theme/theme'
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks'
import {
  useSelectedResults,
  useStatusOfLazyResults,
} from '../../../js/model/LazyQueryResult/hooks'
import { useTheme } from '@mui/material/styles'
import LinearProgress from '@mui/material/LinearProgress'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import TableChartIcon from '@mui/icons-material/TableChart'
import { HeaderCheckbox } from './table-header'
import { DarkDivider } from '../../dark-divider/dark-divider'
import { ResultsCommonControls } from './table'
import { TypedUserInstance } from '../../singletons/TypedUser'
import user from '../../singletons/user-instance'
import { VariableSizeList } from 'react-window'
import { Memo } from '../../memo/memo'

type Props = {
  mode: any
  setMode: any
  selectionInterface: any
}

function scrollToItem({
  listRef,
  index,
  animationFrameId,
  currentScrollOffset,
  lastChangedTime,
}: {
  listRef: VariableSizeList
  index: number
  animationFrameId: React.MutableRefObject<number | null>
  currentScrollOffset: React.MutableRefObject<number | null>
  lastChangedTime: React.MutableRefObject<number | null>
}) {
  animationFrameId.current = window.requestAnimationFrame(() => {
    const timeSinceLastChange = Date.now() - lastChangedTime.current!
    if (timeSinceLastChange > 1000) {
      return
    }
    if ((listRef.state as any).scrollOffset !== currentScrollOffset.current) {
      lastChangedTime.current = Date.now()
      currentScrollOffset.current = (listRef.state as any).scrollOffset
    }
    if (!(listRef.state as any).isScrolling) {
      listRef.scrollToItem(index, 'smart')
    }
    scrollToItem({
      listRef,
      index,
      animationFrameId,
      currentScrollOffset,
      lastChangedTime,
    })
  })
}

function startScrollingToItem({
  listRef,
  index,
  animationFrameId,
  currentScrollOffset,
  lastChangedTime,
}: {
  listRef: VariableSizeList
  index: number
  animationFrameId: React.MutableRefObject<number | null>
  currentScrollOffset: React.MutableRefObject<number | null>
  lastChangedTime: React.MutableRefObject<number | null>
}) {
  lastChangedTime.current = Date.now()
  currentScrollOffset.current = (listRef.state as any).scrollOffset
  listRef.scrollToItem(index, 'smart')
  scrollToItem({
    listRef,
    index,
    animationFrameId,
    currentScrollOffset,
    lastChangedTime,
  })
}

export const useScrollToItemOnSelection = ({
  selectionInterface,
}: {
  selectionInterface: Props['selectionInterface']
}) => {
  const [lastInteraction, setLastInteraction] = React.useState<number | null>(
    null
  )
  const listRef = React.useRef<VariableSizeList | null>(null)
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResults = useSelectedResults({ lazyResults })
  const animationFrameId = React.useRef<number | null>(null)
  const currentScrollOffset = React.useRef<number | null>(null)
  const lastChangedTime = React.useRef<number | null>(null)

  React.useEffect(() => {
    const allResults = Object.values(lazyResults.results)
    const selected = Object.values(selectedResults)
    if (
      listRef.current &&
      selected.length >= 1 &&
      Date.now() - (lastInteraction || 0) > 500
    ) {
      startScrollingToItem({
        listRef: listRef.current,
        index: allResults.indexOf(selected[0]),
        animationFrameId,
        currentScrollOffset,
        lastChangedTime,
      })
    }
    return () => {
      window.cancelAnimationFrame(animationFrameId.current as number)
    }
  }, [selectedResults, lazyResults, lastInteraction])
  return { listRef, setLastInteraction }
}

const ResultCards = ({ mode, setMode, selectionInterface }: Props) => {
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const results = Object.values(lazyResults.results)
  const theme = useTheme()
  const { isSearching, status } = useStatusOfLazyResults({ lazyResults })

  /**
   * Note that this scenario only plays out when the component is first created, so if this is open before a search is run it will already be mounted.
   *
   * This is solely to keep the illusion of responsiveness when switching from table mode to list mode (or dropping a new result visual in)
   */
  const [isMounted, setIsMounted] = React.useState(false)

  const { listRef, setLastInteraction } = useScrollToItemOnSelection({
    selectionInterface,
  })

  React.useEffect(() => {
    const mountedTimeout = setTimeout(() => {
      setIsMounted(true)
    }, 1000)
    return () => {
      clearTimeout(mountedTimeout)
    }
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
          <ResultsCommonControls
            getStartingLeft={() => {
              return TypedUserInstance.getResultsAttributesShownList()
            }}
            getStartingRight={() => {
              return TypedUserInstance.getResultsAttributesPossibleList()
            }}
            onSave={(active) => {
              user
                .get('user')
                .get('preferences')
                .set('results-attributesShownList', active)
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
      <Grid item className="w-full h-full p-2">
        <Paper elevation={Elevations.paper} className="w-full h-full">
          {isMounted ? (
            <Memo
              dependencies={[
                listRef.current,
                lazyResults.results,
                isSearching,
                status,
              ]}
            >
              <AutoVariableSizeList<LazyQueryResult, HTMLDivElement>
                controlledMeasuring={true}
                items={results}
                defaultSize={60}
                overscanCount={10}
                Item={({ itemRef, item, measure, index, width }) => {
                  return (
                    <div ref={itemRef} className="relative">
                      {index !== 0 ? (
                        <>
                          <div className="h-min w-full Mui-bg-divider" />
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
                          <div className="h-min w-full Mui-bg-divider" />
                        </>
                      ) : null}
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
                outerElementProps={{
                  onMouseEnter: () => {
                    setLastInteraction(Date.now())
                  },
                  onMouseUp: () => {
                    setLastInteraction(Date.now())
                  },
                }}
                variableSizeListRef={listRef}
              />
            </Memo>
          ) : (
            <LinearProgress variant="indeterminate" />
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}

export default hot(module)(ResultCards)
