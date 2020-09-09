import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { useLazyResultsStatusFromSelectionInterface } from '../selection-interface/hooks'

type Props = {
  selectionInterface: any
}

const determineIsOutdated = ({ selectionInterface }: Props) => {
  const search = selectionInterface.get('currentQuery')
  if (search) {
    return search.get('isOutdated') as boolean
  }
  return false
}

const Paging = ({ selectionInterface }: Props) => {
  useLazyResultsStatusFromSelectionInterface({ selectionInterface })
  const [isOutdated, setIsOutdated] = React.useState(
    determineIsOutdated({ selectionInterface })
  )
  const { listenTo, stopListening } = useBackbone()
  React.useEffect(() => {
    const search = selectionInterface.get('currentQuery')
    if (search) {
      listenTo(search, 'change:isOutdated', () => {
        setIsOutdated(determineIsOutdated({ selectionInterface }))
      })
    }
    return () => {
      if (search) {
        stopListening(search)
      }
    }
  })
  if (!selectionInterface.get('currentQuery')) {
    return null
  }

  const isPreviousDisabled =
    isOutdated ||
    selectionInterface.get('currentQuery').hasPreviousServerPage() === false
  const isNextDisabled =
    isOutdated ||
    selectionInterface.get('currentQuery').hasNextServerPage() === false
  return (
    <>
      <Button
        data-id="prev-page-button"
        className={`${isPreviousDisabled ? 'invisible' : ''}`}
        disabled={isPreviousDisabled}
        onClick={() => {
          selectionInterface.get('currentQuery').getPreviousServerPage()
        }}
      >
        Prev Page
      </Button>
      <Button
        data-id="next-page-button"
        className={`${isPreviousDisabled && isNextDisabled ? 'invisible' : ''}`}
        disabled={isNextDisabled}
        onClick={() => {
          selectionInterface.get('currentQuery').getNextServerPage()
        }}
      >
        Next Page
      </Button>
    </>
  )
}

export default hot(module)(Paging)
