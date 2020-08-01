import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import { useLazyResultsStatusFromSelectionInterface } from 'catalog-ui-search/src/main/webapp/component/selection-interface/hooks'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'

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

  return (
    <>
      <Button
        disabled={
          isOutdated ||
          selectionInterface.get('currentQuery').hasPreviousServerPage() ===
            false
        }
        onClick={() => {
          selectionInterface.get('currentQuery').getPreviousServerPage()
        }}
      >
        Prev Page
      </Button>
      <Button
        disabled={
          isOutdated ||
          selectionInterface.get('currentQuery').hasNextServerPage() === false
        }
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
