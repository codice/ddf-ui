import * as React from 'react'
import { GoldenLayout } from '../../golden-layout/golden-layout'
import { SplitPane } from '../../resizable-grid/resizable-grid'
const SelectionInterfaceModel = require('../../selection-interface/selection-interface.model')
const Query = require('catalog-ui-search/src/main/webapp/js/model/Query.js')
const CQLUtils = require('catalog-ui-search/src/main/webapp/js/CQLUtils.js')
const user = require('catalog-ui-search/src/main/webapp/component/singletons/user-instance.js')
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import QueryEditor from './query-editor'
import QueryAddView from '../../query-add/query-add'

import MRC from 'catalog-ui-search/exports/marionette-region-container'
import { Memo } from '../../memo/memo'
import ResultSelector from '../../result-selector/result-selector'
import CompareArrows from '@material-ui/icons/CompareArrows'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import SearchIcon from '@material-ui/icons/Search'
import Stop from '@material-ui/icons/Stop'
import Button from '@material-ui/core/Button'
import { Dropdown } from '@connexta/atlas/atoms/dropdown'
import ExtensionPoints from '../../../extension-points/extension-points'
import { BetterClickAwayListener } from '../../better-click-away-listener/better-click-away-listener'
export const HomePage = () => {
  let urlBasedQuery = location.hash.split('?defaultQuery=')[1]
  if (urlBasedQuery) {
    urlBasedQuery = new Query.Model(
      JSON.parse(decodeURIComponent(urlBasedQuery))
    )
    ;(urlBasedQuery as any).startSearchFromFirstPage()
  }
  const [isSaved, setIsSaved] = React.useState(false)

  const [queryModel, setQueryModel] = React.useState(
    urlBasedQuery || new Query.Model()
  )
  const [selectionInterface] = React.useState(
    new SelectionInterfaceModel({
      currentQuery: queryModel,
    })
  )
  return (
    <div className="w-full h-full">
      <SplitPane variant="horizontal">
        <MRC
          view={QueryAddView}
          viewOptions={{
            selectionInterface: selectionInterface,
            model: selectionInterface.getCurrentQuery(),
          }}
          style={{ height: 'auto' }}
        />
        <Grid
          container
          direction="column"
          className="w-full h-full"
          wrap="nowrap"
        >
          <Grid item className="w-full">
            <Paper elevation={23} className="w-full">
              <Grid
                container
                direction="row"
                wrap="nowrap"
                alignItems="center"
                justify="center"
              >
                <Grid item>
                  <Grid container direction="row" wrap="nowrap">
                    <Grid item>
                      <Button
                        className="px-3"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          selectionInterface
                            .getCurrentQuery()
                            .startSearchFromFirstPage()
                        }}
                      >
                        <SearchIcon />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <ResultSelector
                    selectionInterface={selectionInterface}
                    model={queryModel}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item className="w-full h-full">
            <GoldenLayout
              selectionInterface={selectionInterface}
              width={0}
              closed={true}
            />
          </Grid>
        </Grid>
      </SplitPane>
    </div>
  )
}
