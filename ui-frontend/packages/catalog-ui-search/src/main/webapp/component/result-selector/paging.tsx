import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@mui/material/Button'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { useLazyResultsStatusFromSelectionInterface } from '../selection-interface/hooks'
import CloseIcon from '@mui/icons-material/Close'
import TableExport from '../table-export/table-export'
import { useDialogState } from '../../component/hooks/useDialogState'
import Divider from '@mui/material/Divider'

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
  const { isSearching } = useLazyResultsStatusFromSelectionInterface({
    selectionInterface,
  })
  const exportDialogState = useDialogState()

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
  if (
    !selectionInterface.get('currentQuery') ||
    !selectionInterface.get('currentQuery').get('result')
  ) {
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
      <exportDialogState.MuiDialogComponents.Dialog
        {...exportDialogState.MuiDialogProps}
      >
        <exportDialogState.MuiDialogComponents.DialogTitle>
          <div className="flex flex-row items-center justify-between flex-nowrap w-full">
            Export Results
            <Button
              className="ml-auto"
              onClick={() => {
                exportDialogState.handleClose()
              }}
            >
              <CloseIcon />
            </Button>
          </div>
        </exportDialogState.MuiDialogComponents.DialogTitle>
        <Divider />
        <TableExport selectionInterface={selectionInterface} />
      </exportDialogState.MuiDialogComponents.Dialog>
      <Button
        data-id="export-table-button"
        className={`${isOutdated ? 'invisible' : ''}`}
        disabled={isSearching}
        onClick={() => {
          exportDialogState.handleClick()
        }}
        color="primary"
      >
        Export
      </Button>
    </>
  )
}

export default hot(module)(Paging)
