import * as React from 'react'
import { hot } from 'react-hot-loader'
import ResultItemCollection from './result-item.collection'
import Grid from '@material-ui/core/Grid'
import TableVisual from './table'
import { useLazyResultsFromSelectionInterface } from 'catalog-ui-search/src/main/webapp/component/selection-interface/hooks'
import { useStatusOfLazyResults } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/hooks'
import CircularProgress from '@material-ui/core/CircularProgress'

type Props = {
  selectionInterface: any
}

type ModeType = 'card' | 'table'

const ResultsView = ({ selectionInterface }: Props) => {
  const [mode, setMode] = React.useState('card' as ModeType)
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const { isSearching } = useStatusOfLazyResults({ lazyResults })
  const filteredResults = Object.values(lazyResults.filteredResults)
  return (
    <Grid
      container
      direction="column"
      style={{ width: '100%', height: '100%', padding: '20px' }}
      wrap="nowrap"
    >
      <Grid item />
      <Grid item style={{ width: '100%', height: '100%' }}>
        {(() => {
          if (isSearching && filteredResults.length === 0) {
            return <CircularProgress />
          } else if (mode === 'card') {
            return (
              <ResultItemCollection
                results={filteredResults}
                mode={mode}
                setMode={setMode}
                lazyResults={lazyResults}
              />
            )
          } else {
            return (
              <TableVisual
                selectionInterface={selectionInterface}
                results={filteredResults}
                lazyResults={lazyResults}
                mode={mode}
                setMode={setMode}
              />
            )
          }
        })()}
      </Grid>
    </Grid>
  )
}

export default hot(module)(ResultsView)
