import * as React from 'react'
import Spellcheck from '../spellcheck/spellcheck'
import Grid from '@material-ui/core/Grid'
import { hot } from 'react-hot-loader'
import QueryFeed from './query-feed'
import LinearProgress from '@material-ui/core/LinearProgress'
import Paging from './paging'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import FilterListIcon from '@material-ui/icons/FilterList'
// @ts-ignore ts-migrate(6133) FIXME: 'SortIcon' is declared but its value is never read... Remove this comment to see the full error message
import SortIcon from '@material-ui/icons/Sort'
import ResultFilter from '../result-filter/result-filter'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import EphemeralSearchSort from '../../react-component/query-sort-selection/ephemeral-search-sort'
import {
  useLazyResultsStatusFromSelectionInterface,
  useLazyResultsSelectedResultsFromSelectionInterface,
} from '../selection-interface/hooks'

// @ts-ignore ts-migrate(7016) FIXME: Could not find a declaration file for module '../.... Remove this comment to see the full error message
import VisualizationSelector from '../../react-component/visualization-selector/visualization-selector'
import ViewCompactIcon from '@material-ui/icons/ViewCompact'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
const user = require('../singletons/user-instance.js')
import MoreIcon from '@material-ui/icons/MoreVert'

import LazyMetacardInteractions from '../results-visual/lazy-metacard-interactions'
import { Elevations } from '../theme/theme'
import useTheme from '@material-ui/core/styles/useTheme'
import SelectionRipple from '../golden-layout/selection-ripple'
import { ResultType } from '../../js/model/Types'
import Extensions from '../../extension-points'
import { useMenuState } from '../menu-state/menu-state'
import Popover from '@material-ui/core/Popover'

const SelectedResults = ({ selectionInterface }: any) => {
  const selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResultsArray = Object.values(selectedResults)
  const { MuiButtonProps, MuiPopoverProps } = useMenuState()

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
      <Popover {...MuiPopoverProps}>
        <Paper>
          <LazyMetacardInteractions
            lazyResults={selectedResultsArray}
            onClose={() => {
              close()
            }}
          />
        </Paper>
      </Popover>
    </>
  )
}

const determineHasResultFilter = () => {
  return user.get('user').get('preferences').get('resultFilter') !== undefined
}

const determineHasResultSort = () => {
  return user.get('user').get('preferences').get('resultSort') !== undefined
}

type Props = {
  selectionInterface: any
  model: any
  goldenLayoutViewInstance: any
  layoutResult?: ResultType
  editLayoutRef?: any
}

const ResultSelector = ({
  selectionInterface,
  model,
  goldenLayoutViewInstance,
  layoutResult,
  editLayoutRef,
}: Props) => {
  const { isSearching } = useLazyResultsStatusFromSelectionInterface({
    selectionInterface,
  })
  const [hasResultFilter, setHasResultFilter] = React.useState(
    determineHasResultFilter()
  )
  const [hasResultSort, setHasResultSort] = React.useState(
    determineHasResultSort()
  )
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(user.get('user').get('preferences'), 'change:resultFilter', () => {
      setHasResultFilter(determineHasResultFilter())
    })
    listenTo(user.get('user').get('preferences'), 'change:resultSort', () => {
      setHasResultSort(determineHasResultSort())
    })
  }, [])
  const theme = useTheme()
  const LayoutDropdown = Extensions.layoutDropdown({
    goldenLayout: goldenLayoutViewInstance,
    layoutResult,
    editLayoutRef,
  })
  const resultFilterMenuState = useMenuState()
  const resultSortMenuState = useMenuState()
  const layoutMenuState = useMenuState()
  return (
    <React.Fragment>
      <Grid container alignItems="center" justify="flex-start" direction="row">
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
            style={{
              borderBottom: hasResultFilter
                ? `1px solid ${theme.palette.warning.main}`
                : '0px',
            }}
            {...resultFilterMenuState.MuiButtonProps}
          >
            <FilterListIcon className="Mui-text-text-primary" />
            Filter
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
            style={{
              borderBottom: hasResultSort
                ? `1px solid ${theme.palette.warning.main}`
                : '0px',
            }}
            {...resultSortMenuState.MuiButtonProps}
          >
            <ArrowDownwardIcon className="Mui-text-text-primary" />
            Sort
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
            <ViewCompactIcon className="Mui-text-text-primary" />
            <div className="pl-1">Layout</div>
          </Button>
          <Popover {...layoutMenuState.MuiPopoverProps}>
            <Paper className="p-3" elevation={Elevations.overlays}>
              {LayoutDropdown || (
                <VisualizationSelector
                  onClose={layoutMenuState.handleClose}
                  goldenLayout={goldenLayoutViewInstance.goldenLayout}
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
