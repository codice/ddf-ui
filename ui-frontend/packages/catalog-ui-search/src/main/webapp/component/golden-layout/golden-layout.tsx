import * as React from 'react'
import MRC from 'catalog-ui-search/exports/marionette-region-container'
import Paper from '@material-ui/core/Paper'
const GoldenLayoutView = require('catalog-ui-search/src/main/webapp/component/golden-layout/golden-layout.view.js')

type Props = {
  selectionInterface: any
  width: any
  closed: boolean
}

export const GoldenLayout = ({ selectionInterface, width, closed }: Props) => {
  const [goldenlayoutInstance, setGoldenlayoutInstance] = React.useState(
    new GoldenLayoutView({
      selectionInterface,
      configName: 'goldenLayout',
    })
  )

  React.useEffect(
    () => {
      if (goldenlayoutInstance.goldenLayout) goldenlayoutInstance.updateSize()
    },
    [width, closed]
  )

  React.useEffect(() => {
    setTimeout(() => {
      if (goldenlayoutInstance.goldenLayout) goldenlayoutInstance.updateSize()
    }, 1000)
  }, [])

  return (
    <Paper className="h-full w-full" elevation={1}>
      <MRC view={goldenlayoutInstance} style={{ background: 'inherit' }} />
    </Paper>
  )
}
