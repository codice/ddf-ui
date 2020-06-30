import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import { useLazyResultsStatusFromSelectionInterface } from 'catalog-ui-search/src/main/webapp/component/selection-interface/hooks'

type Props = {
  selectionInterface: any
}

const Paging = ({ selectionInterface }: Props) => {
  useLazyResultsStatusFromSelectionInterface({ selectionInterface })
  if (!selectionInterface.get('currentQuery')) {
    return null
  }
  return (
    <>
      <Button
        disabled={
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
