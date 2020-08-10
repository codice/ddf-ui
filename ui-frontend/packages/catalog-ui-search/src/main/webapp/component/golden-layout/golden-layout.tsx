import * as React from 'react'
import MRC from '../../react-component/marionette-region-container'
import { useResizableGridContext } from '../resizable-grid/resizable-grid'
import GoldenLayoutView from './golden-layout.view'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import ResultSelector from '../result-selector/result-selector'

type Props = {
  selectionInterface: any
}

export const GoldenLayout = ({ selectionInterface }: Props) => {
  const [goldenlayoutInstance, setGoldenlayoutInstance] = React.useState(
    new GoldenLayoutView({
      selectionInterface,
      configName: 'goldenLayout',
    })
  )
  const { closed } = useResizableGridContext()

  React.useEffect(
    () => {
      console.log('happens')
      setTimeout(() => {
        if (goldenlayoutInstance.goldenLayout) goldenlayoutInstance.updateSize()
      }, 100)
    },
    [closed]
  )

  React.useEffect(() => {
    setTimeout(() => {
      if (goldenlayoutInstance.goldenLayout) goldenlayoutInstance.updateSize()
    }, 1000)
  }, [])

  return (
    <Grid container direction="column" className="w-full h-full" wrap="nowrap">
      <Grid item className="w-full relative z-1 pb-2 pt-2 pr-2 flex-shrink-0">
        <Paper elevation={2} className="w-full p-3">
          <ResultSelector
            selectionInterface={selectionInterface}
            model={selectionInterface.getCurrentQuery()}
            goldenLayoutViewInstance={goldenlayoutInstance}
          />
        </Paper>
      </Grid>

      <Grid
        item
        className="w-full h-full overflow-hidden flex-shrink-1 pb-2 pr-2"
      >
        <MRC
          className="h-full w-full"
          view={goldenlayoutInstance}
          style={{ background: 'inherit' }}
        />
      </Grid>
    </Grid>
  )
}
