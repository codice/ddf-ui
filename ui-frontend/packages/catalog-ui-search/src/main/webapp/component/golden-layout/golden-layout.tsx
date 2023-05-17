import * as React from 'react'
import { useResizableGridContext } from '../resizable-grid/resizable-grid'
import { GoldenLayoutViewReact } from './golden-layout.view'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import ResultSelector from '../result-selector/result-selector'
import { Elevations } from '../theme/theme'

type Props = {
  selectionInterface: any
}

export const GoldenLayout = ({ selectionInterface }: Props) => {
  const [goldenLayout, setGoldenLayout] = React.useState<any>(null)
  const { closed } = useResizableGridContext()

  React.useEffect(() => {
    setTimeout(() => {
      if (goldenLayout) goldenLayout.updateSize()
    }, 100)
  }, [closed, goldenLayout])

  React.useEffect(() => {
    setTimeout(() => {
      if (goldenLayout) goldenLayout.updateSize()
    }, 1000)
  }, [goldenLayout])
  return (
    <Grid
      data-id="results-container"
      container
      direction="column"
      className="w-full h-full"
      wrap="nowrap"
    >
      <Grid item className="w-full relative z-1 pb-2 pt-2 pr-2 shrink-0">
        <Paper
          elevation={Elevations.panels}
          className="w-full py-1 px-2 overflow-hidden"
        >
          {goldenLayout ? (
            <ResultSelector
              selectionInterface={selectionInterface}
              model={selectionInterface.getCurrentQuery()}
              goldenLayout={goldenLayout}
            />
          ) : null}
        </Paper>
      </Grid>

      <Grid item className="w-full h-full overflow-hidden shrink-1 pb-2 pr-2">
        <GoldenLayoutViewReact
          selectionInterface={selectionInterface}
          configName="goldenLayout"
          setGoldenLayout={setGoldenLayout}
        />
      </Grid>
    </Grid>
  )
}
