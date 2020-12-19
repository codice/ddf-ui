import * as React from 'react'
import { hot } from 'react-hot-loader'
import ResultItemCollection from './result-item.collection'
import Grid from '@material-ui/core/Grid'
import TableVisual from './table'
// @ts-ignore ts-migrate(6133) FIXME: 'CircularProgress' is declared but its value is ne... Remove this comment to see the full error message
import CircularProgress from '@material-ui/core/CircularProgress'
// @ts-ignore ts-migrate(6133) FIXME: 'useLazyResultsFromSelectionInterface' is declared... Remove this comment to see the full error message
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
// @ts-ignore ts-migrate(6133) FIXME: 'useStatusOfLazyResults' is declared but its value... Remove this comment to see the full error message
import { useStatusOfLazyResults } from '../../js/model/LazyQueryResult/hooks'

type Props = {
  selectionInterface: any
}

type ModeType = 'card' | 'table'

const ResultsView = ({ selectionInterface }: Props) => {
  const [mode, setMode] = React.useState('card' as ModeType)
  console.log(mode)
  return (
    <Grid
      container
      direction="column"
      className="w-full h-full bg-inherit"
      wrap="nowrap"
    >
      <Grid className="w-full h-full bg-inherit">
        {(() => {
          if (mode === 'card') {
            return (
              <ResultItemCollection
                mode={mode}
                setMode={setMode}
                selectionInterface={selectionInterface}
              />
            )
          } else {
            return (
              <TableVisual
                selectionInterface={selectionInterface}
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
