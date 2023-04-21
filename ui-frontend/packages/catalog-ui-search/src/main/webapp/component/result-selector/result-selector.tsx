import * as React from 'react'
import Spellcheck from '../spellcheck/spellcheck'
import Grid from '@mui/material/Grid'
import { hot } from 'react-hot-loader'
import QueryFeed from './query-feed'
import LinearProgress from '@mui/material/LinearProgress'
import Paging from './paging'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import FilterListIcon from '@mui/icons-material/FilterList'
import ResultFilter from '../result-filter/result-filter'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import EphemeralSearchSort from '../../react-component/query-sort-selection/ephemeral-search-sort'
import {
  useLazyResultsStatusFromSelectionInterface,
  useLazyResultsSelectedResultsFromSelectionInterface,
} from '../selection-interface/hooks'

import VisualizationSelector from '../../react-component/visualization-selector/visualization-selector'
import LayoutDropdownIcon from '@mui/icons-material/ViewComfy'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import user from '../singletons/user-instance'
import MoreIcon from '@mui/icons-material/MoreVert'

import LazyMetacardInteractions from '../visualization/results-visual/lazy-metacard-interactions'
import { Elevations } from '../theme/theme'
import SelectionRipple from '../golden-layout/selection-ripple'
import { ResultType } from '../../js/model/Types'
import Extensions from '../../extension-points'
import { useMenuState } from '../menu-state/menu-state'
import Popover from '@mui/material/Popover'
import Badge from '@mui/material/Badge'

const SelectedResults = ({ selectionInterface }: any) => {
  const selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResultsArray = Object.values(selectedResults)
  const { MuiButtonProps, MuiPopoverProps, handleClose } = useMenuState()

  return (
    <>
      <Button
        data-id="result-selector-more-vert-button"
        className={`relative ${
          selectedResultsArray.length === 0 ? 'invisible' : ''
        }`}
        color="primary"
        disabled={selectedResultsArray.length === 0}
        style={{ height: '100%' }}
        size="small"
        {...MuiButtonProps}
      >
        {selectedResultsArray.length} selected
        <div
          className={
            selectedResultsArray.length === 0 ? '' : 'Mui-text-text-primary'
          }
        >
          <MoreIcon />
        </div>
      </Button>
      <Popover {...MuiPopoverProps} keepMounted={true}>
        <Paper>
          <LazyMetacardInteractions
            lazyResults={selectedResultsArray}
            onClose={handleClose}
          />
        </Paper>
      </Popover>
    </>
  )
}

const determineResultFilterSize = () => {
  const resultFilters = user.get('user').get('preferences').get('resultFilter')
  if (!resultFilters || !resultFilters.filters) {
    return 0
  }
  return resultFilters.filters.length
}

const determineResultSortSize = () => {
  const resultSorts = user.get('user').get('preferences').get('resultSort')
  if (!resultSorts) {
    return 0
  }
  return resultSorts.length
}

type Props = {
  selectionInterface: any
  model: any
  goldenLayout: any
  layoutResult?: ResultType
  editLayoutRef?: any
}

const ResultSelector = ({
  selectionInterface,
  model,
  goldenLayout,
  layoutResult,
  editLayoutRef,
}: Props) => {
  const { isSearching } = useLazyResultsStatusFromSelectionInterface({
    selectionInterface,
  })
  const [resultFilterSize, setResultFilterSize] = React.useState(
    determineResultFilterSize()
  )
  const [resultSortSize, setResultSortSize] = React.useState(
    determineResultSortSize()
  )
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(user.get('user').get('preferences'), 'change:resultFilter', () => {
      setResultFilterSize(determineResultFilterSize())
    })
    listenTo(user.get('user').get('preferences'), 'change:resultSort', () => {
      setResultSortSize(determineResultSortSize())
    })
  }, [])
  const LayoutDropdown = Extensions.layoutDropdown({
    goldenLayout,
    layoutResult,
    editLayoutRef,
  })
  const resultFilterMenuState = useMenuState()
  const resultSortMenuState = useMenuState()
  const layoutMenuState = useMenuState()
  return (
    <React.Fragment>
      <Grid
        container
        alignItems="center"
        justifyContent="flex-start"
        direction="row"
      >
        {isSearching ? (
          <LinearProgress
            variant="query"
            className="opacity-100 absolute w-full h-1 left-0 bottom-0"
          />
        ) : null}

        <Grid item>
          <Spellcheck
            key={Math.random()}
            selectionInterface={selectionInterface}
            model={model}
          />
        </Grid>
        <Grid item className="relative z-10">
          <QueryFeed selectionInterface={selectionInterface} />
        </Grid>

        <Grid item className="relative z-0">
          <SelectionRipple selectionInterface={selectionInterface} />
          <SelectedResults selectionInterface={selectionInterface} />
        </Grid>
        <Grid item className="pl-2 mx-auto">
          <Paging selectionInterface={selectionInterface} />
        </Grid>
        <Grid item className="ml-auto">
          <Button
            data-id="filter-button"
            variant="text"
            color="primary"
            {...resultFilterMenuState.MuiButtonProps}
          >
            <Badge
              color="secondary"
              badgeContent={resultFilterSize}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              className="items-center"
            >
              <FilterListIcon className="Mui-text-text-primary" />
              Filter
            </Badge>
          </Button>
          <Popover {...resultFilterMenuState.MuiPopoverProps}>
            <Paper className="p-3" elevation={Elevations.overlays}>
              <ResultFilter closeDropdown={resultFilterMenuState.handleClose} />
            </Paper>
          </Popover>
        </Grid>
        <Grid item className="pl-2">
          <Button
            data-id="sort-button"
            variant="text"
            color="primary"
            {...resultSortMenuState.MuiButtonProps}
          >
            <Badge
              color="secondary"
              badgeContent={resultSortSize}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              className="items-center"
            >
              <ArrowDownwardIcon className="Mui-text-text-primary" />
              Sort
            </Badge>
          </Button>
          <Popover {...resultSortMenuState.MuiPopoverProps}>
            <Paper className="p-3" elevation={Elevations.overlays}>
              <EphemeralSearchSort
                closeDropdown={resultSortMenuState.handleClose}
              />
            </Paper>
          </Popover>
        </Grid>
        <Grid item className="pl-2">
          <Button
            data-id="layout-button"
            color="primary"
            {...layoutMenuState.MuiButtonProps}
          >
            <LayoutDropdownIcon className="Mui-text-text-primary" />
            <div className="pl-1">Layout</div>
          </Button>
          <Popover {...layoutMenuState.MuiPopoverProps}>
            <Paper className="p-3" elevation={Elevations.overlays}>
              {LayoutDropdown || (
                <VisualizationSelector
                  onClose={layoutMenuState.handleClose}
                  goldenLayout={goldenLayout}
                />
              )}
            </Paper>
          </Popover>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default hot(module)(ResultSelector)
