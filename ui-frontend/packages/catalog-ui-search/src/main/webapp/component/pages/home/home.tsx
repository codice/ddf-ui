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

import MRC from 'catalog-ui-search/exports/marionette-region-container'
import { Memo } from '../../memo/memo'
import ResultSelector from '../../result-selector/result-selector'

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
      <Grid
        container
        direction="column"
        className="w-full h-full"
        wrap="nowrap"
      >
        <Grid item className="w-full h-full">
          <SplitPane variant="vertical">
            <Memo dependencies={[queryModel]}>
              <QueryEditor query={queryModel} />
            </Memo>
            <Memo>
              <GoldenLayout
                selectionInterface={selectionInterface}
                width={0}
                closed={true}
              />
            </Memo>
          </SplitPane>
        </Grid>
        <Grid item className="w-full">
          <ResultSelector
            selectionInterface={selectionInterface}
            model={queryModel}
          />
        </Grid>
      </Grid>
    </div>
  )
}
