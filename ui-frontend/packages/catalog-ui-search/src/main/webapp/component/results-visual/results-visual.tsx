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
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import Button from '@material-ui/core/Button'
import BackgroundInheritingDiv from '../theme/background-inheriting-div'
type Props = {
  selectionInterface: any
}

type ModeType = 'card' | 'table'

export const ResultsViewContext = React.createContext({
  edit: null as null | LazyQueryResult,
  setEdit: (() => {}) as React.Dispatch<null | LazyQueryResult>,
})

const ResultsView = ({ selectionInterface }: Props) => {
  const [mode, setMode] = React.useState('card' as ModeType)
  const [edit, setEdit] = React.useState(null as null | LazyQueryResult)
  console.log(mode)
  return (
    <ResultsViewContext.Provider value={{ edit, setEdit }}>
      <Grid
        container
        direction="column"
        className="w-full h-full bg-inherit"
        wrap="nowrap"
      >
        <Grid className="w-full h-full bg-inherit relative ">
          {edit !== null ? (
            <BackgroundInheritingDiv className="absolute left-0 top-0 w-full h-full z-10">
              <div className="w-full h-full p-2">
                Currently editing: {edit.plain.metacard.properties.title}
                <Button
                  onClick={() => {
                    setEdit(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </BackgroundInheritingDiv>
          ) : null}
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
    </ResultsViewContext.Provider>
  )
}

export default hot(module)(ResultsView)
