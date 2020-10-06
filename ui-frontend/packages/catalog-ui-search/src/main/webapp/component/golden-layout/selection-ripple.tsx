import * as React from 'react'
import { hot } from 'react-hot-loader'
import Box from '@material-ui/core/Box'
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../selection-interface/hooks'
import useTheme from '@material-ui/core/styles/useTheme'

const SelectionRipple = ({
  selectionInterface,
}: {
  selectionInterface: any
}) => {
  const theme = useTheme()
  const selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResultsArray = Object.values(selectedResults)
  const [hasSelection, setHasSelection] = React.useState(
    selectedResultsArray.length !== 0
  )
  React.useEffect(() => {
    setHasSelection(selectedResultsArray.length !== 0)
  })
  return (
    <div
      className={` w-full h-full absolute z-0 left-0 top-0 transition-transform  transform overflow-visible  ease-in-out ${
        hasSelection ? 'duration-1000' : 'duration-0'
      }`}
      style={{
        transform: hasSelection
          ? 'scale(100) translateX(0%) translateY(0%)'
          : 'scale(1) translateX(0%) translateY(0%)',
        background: theme.palette.secondary.main,
        opacity: hasSelection
          ? theme.palette.type === 'dark'
            ? 0.05
            : 0.05
          : 0,
      }}
    />
  )
}

export default hot(module)(SelectionRipple)
