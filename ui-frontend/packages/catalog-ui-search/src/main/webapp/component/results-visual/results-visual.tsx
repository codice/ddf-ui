import * as React from 'react'
import { hot } from 'react-hot-loader'
import ResultItemCollection from './result-item.collection'
import Grid from '@material-ui/core/Grid'
import TableVisual from './table'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { useStatusOfLazyResults } from '../../js/model/LazyQueryResult/hooks'

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
  const results = Object.values(lazyResults.results)
  return (
    <Grid
      container
      direction="column"
      className="w-full h-full bg-inherit"
      wrap="nowrap"
    >
      <Grid className="w-full h-full bg-inherit">
        {(() => {
          if (isSearching && results.length === 0) {
            return <CircularProgress />
          } else if (mode === 'card') {
            return (
              <ResultItemCollection
                results={results}
                mode={mode}
                setMode={setMode}
                lazyResults={lazyResults}
              />
            )
          } else {
            return (
              <TableVisual
                selectionInterface={selectionInterface}
                results={results}
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
