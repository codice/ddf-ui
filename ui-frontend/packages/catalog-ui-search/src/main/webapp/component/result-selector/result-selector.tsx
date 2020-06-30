import * as React from 'react'
import MRC from 'catalog-ui-search/exports/marionette-region-container'
import Spellcheck from '../spellcheck/spellcheck'
import Grid from '@material-ui/core/Grid'
const ResultFilterDropdownView = require('catalog-ui-search/src/main/webapp/component/dropdown/result-filter/dropdown.result-filter.view.js')
const ResultSortDropdownView = require('catalog-ui-search/src/main/webapp/component/dropdown/result-sort/dropdown.result-sort.view.js')
const DropdownModel = require('catalog-ui-search/src/main/webapp/component/dropdown/dropdown.js')
import { hot } from 'react-hot-loader'
import QueryFeed from './query-feed'
import { useLazyResultsStatusFromSelectionInterface } from 'catalog-ui-search/src/main/webapp/component/selection-interface/hooks'
import LinearProgress from '@material-ui/core/LinearProgress'
import Paging from './paging'
type Props = {
  selectionInterface: any
  model: any
}

const GridStyles = {
  padding: '0px 10px',
}

const ContainerStyles = {
  position: 'relative',
  padding: '10px',
} as React.CSSProperties

const ProgressStyles = {
  position: 'absolute',
  width: '100%',
  height: '10px',
  left: '0px',
  bottom: '0px',
  transition: 'opacity 1s ease-in-out',
} as React.CSSProperties

const ResultSelector = ({ selectionInterface, model }: Props) => {
  const { isSearching } = useLazyResultsStatusFromSelectionInterface({
    selectionInterface,
  })

  return (
    <React.Fragment>
      <Grid
        container
        alignItems="center"
        justify="center"
        direction="row"
        style={ContainerStyles}
      >
        <LinearProgress
          variant="query"
          style={{
            ...ProgressStyles,
            opacity: isSearching ? 1 : 0,
          }}
        />

        <Grid item style={GridStyles}>
          <Spellcheck
            key={Math.random()}
            selectionInterface={selectionInterface}
            model={model}
          />
        </Grid>
        <Grid item style={GridStyles}>
          <QueryFeed selectionInterface={selectionInterface} />
        </Grid>
        <Grid item style={GridStyles}>
          <MRC
            view={ResultFilterDropdownView}
            viewOptions={{
              model: new DropdownModel(),
            }}
          />
        </Grid>
        <Grid item style={GridStyles}>
          <MRC
            view={ResultSortDropdownView}
            viewOptions={{
              model: new DropdownModel(),
            }}
          />
        </Grid>

        <Grid item style={GridStyles}>
          <Paging selectionInterface={selectionInterface} />
          {/* <MRC
            className="resultSelector-paging"
            view={PagingView}
            viewOptions={{
              model: collapsedResults,
              selectionInterface: selectionInterface,
            }}
          /> */}
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default hot(module)(ResultSelector)
