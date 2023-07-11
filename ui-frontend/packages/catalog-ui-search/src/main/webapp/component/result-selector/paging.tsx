import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@mui/material/Button'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { useLazyResultsStatusFromSelectionInterface } from '../selection-interface/hooks'
import { Elevations } from '../theme/theme'
import CloseIcon from '@mui/icons-material/Close'
import TableExport from '../table-export/table-export'
import { useDialog } from '../dialog'
import { DarkDivider } from '../dark-divider/dark-divider'

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
  const dialogContext = useDialog()

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
      <Button
        data-id="export-table-button"
        className={`${isOutdated ? 'invisible' : ''}`}
        disabled={isSearching}
        onClick={() => {
          dialogContext.setProps({
            PaperProps: {
              style: {
                minWidth: 'none',
              },
              elevation: Elevations.panels,
            },
            open: true,
            disableEnforceFocus: true, // otherwise we can't click inside 3rd party libraries using portals (like date picker from blueprint)
            children: (
              <div
                className="min-w-screen-1/2"
                style={{
                  minHeight: '60vh',
                }}
              >
                <div className="text-2xl text-center px-2 pb-2 pt-4 font-normal relative">
                  Export
                  <Button
                    data-id="close-button"
                    className="absolute right-0 top-0 mr-1 mt-1"
                    variant="text"
                    size="small"
                    onClick={() => {
                      dialogContext.setProps({
                        open: false,
                        children: null,
                      })
                    }}
                  >
                    <CloseIcon />
                  </Button>
                </div>
                <DarkDivider className="w-full h-min" />
                <TableExport selectionInterface={selectionInterface} />
              </div>
            ),
          })
        }}
        color="primary"
      >
        Export
      </Button>
    </>
  )
}

export default hot(module)(Paging)
