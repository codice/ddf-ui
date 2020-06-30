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
import ExtensionPoints from 'catalog-ui-search/src/main/webapp/extension-points'
import * as React from 'react'
const lightboxInstance = require('catalog-ui-search/src/main/webapp/component/lightbox/lightbox.view.instance.js')
import Button from '@material-ui/core/Button'
const user = require('catalog-ui-search/src/main/webapp/component/singletons/user-instance.js')
const properties = require('catalog-ui-search/src/main/webapp/js/properties.js')
const TableVisibility = require('catalog-ui-search/src/main/webapp/component/visualization/table/table-visibility.view')
const TableRearrange = require('catalog-ui-search/src/main/webapp/component/visualization/table/table-rearrange.view')
import { hot } from 'react-hot-loader'
import MRC from 'catalog-ui-search/src/main/webapp/react-component/marionette-region-container'
import { AutoVariableSizeList } from 'react-window-components'
import Grid from '@material-ui/core/Grid'
import styled from 'styled-components'
import { Header } from './table-header'
import ResultItemRow from './result-item-row'
import { useTheme } from '@material-ui/core/styles'
import { LazyQueryResult } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/LazyQueryResult'
import { LazyQueryResults } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/LazyQueryResults'
import { getFilteredAttributes, getVisibleHeaders } from './table-header-utils'
import ViewColumnIcon from '@material-ui/icons/ViewColumn'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
;(() => {
  const oldHandleSave = TableVisibility.prototype.handleSave
  TableVisibility.prototype.handleSave = function() {
    user
      .get('user')
      .get('preferences')
      .set('hasSelectedColumns', true)
    oldHandleSave.apply(this, arguments)
  }
  // const oldDestroy = TableVisibility.prototype.destroy
  // TableVisibility.prototype.destroy = function() {
  //   lightboxInstance.model.close()
  //   oldDestroy.apply(this, arguments)
  // }
})()

const HeaderDiv = styled.div`
  ::-webkit-scrollbar {
    display: none;
  }
`

type Props = {
  selectionInterface: any
  lazyResults: LazyQueryResults
  results: LazyQueryResult[]
  mode: any
  setMode: any
}

const TableVisual = ({
  selectionInterface,
  results,
  lazyResults,
  mode,
  setMode,
}: Props) => {
  const { listenTo } = useBackbone()
  const theme = useTheme()
  const headerRef = React.useRef<HTMLDivElement>(null)
  const [filteredAttributes, setFilteredAttributes] = React.useState(
    getFilteredAttributes(lazyResults)
  )
  const [visibleHeaders, setVisibleHeaders] = React.useState(
    getVisibleHeaders(filteredAttributes)
  )

  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:columnHide change:columnOrder',
      () => {
        setFilteredAttributes(getFilteredAttributes(lazyResults))
      }
    )
  }, [])

  React.useEffect(
    () => {
      setVisibleHeaders(getVisibleHeaders(filteredAttributes))
    },
    [filteredAttributes]
  )

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
        <ExtensionPoints.tableExport selectionInterface={selectionInterface} />
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
      style={{ height: '100%', width: '100%', background: 'inherit' }}
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
        <Button onClick={openRearrangeModel}>
          <span className="fa fa-columns"> Rearrange Column</span>
        </Button>
        <Button onClick={openVisibilityModel}>
          <span className="fa fa-eye"> Hide / Show Columns</span>
        </Button>
        <Button
          onClick={() => {
            const prefs = user.get('user').get('preferences')
            prefs.set('columnHide', [])
            prefs.set('hasSelectedColumns', false)
          }}
        >
          <ViewColumnIcon />
          Reset Shown to Defaults
        </Button>
        <Button onClick={openExportModal}>
          <span className="fa fa-share"> Export</span>
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
      <Grid item style={{ overflow: 'hidden', background: 'inherit' }}>
        <HeaderDiv style={{ width: 'auto', overflow: 'auto' }} ref={headerRef}>
          <Header visibleHeaders={visibleHeaders} lazyResults={lazyResults} />
        </HeaderDiv>
      </Grid>
      <Grid
        item
        style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          background: theme.palette.background.paper,
        }}
      >
        <AutoVariableSizeList<LazyQueryResult, HTMLDivElement>
          outerElementProps={{
            onScroll: e => {
              if (headerRef.current) {
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
              <div ref={itemRef} style={{ background: 'inherit' }}>
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

export default hot(module)(TableVisual)
