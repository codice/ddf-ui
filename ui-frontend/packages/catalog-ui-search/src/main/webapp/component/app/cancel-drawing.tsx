import * as React from 'react'
import Button from '@material-ui/core/Button'
import { hot } from 'react-hot-loader'
import { Drawing } from '../singletons/drawing'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'

const CancelDrawing = () => {
  const [isDrawing, setIsDrawing] = React.useState(Drawing.isDrawing())
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(Drawing, 'change:drawing', () => {
      setIsDrawing(Drawing.isDrawing())
    })
  }, [])
  return (
    <Button
      variant="contained"
      color="secondary"
      className={`${
        isDrawing ? 'block' : 'hidden'
      } fixed left-0 top-0 w-full h-16 z-50`}
      onClick={() => {
        Drawing.turnOffDrawing()
      }}
    >
      Cancel Drawing
    </Button>
  )
}

export default hot(module)(CancelDrawing)
