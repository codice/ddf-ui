import * as React from 'react'
import MRC from '../../react-component/marionette-region-container'
import Paper from '@material-ui/core/Paper'
import { useResizableGridContext } from '../resizable-grid/resizable-grid'
const GoldenLayoutView = require('./golden-layout.view.js')

type Props = {
  selectionInterface: any
  width: any
  closed: boolean
}

export const GoldenLayout = ({ selectionInterface, width }: Props) => {
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
    <MRC
      className="h-full w-full"
      view={goldenlayoutInstance}
      style={{ background: 'inherit' }}
    />
  )
}
