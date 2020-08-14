import * as React from 'react'
import Spellcheck from '../spellcheck/spellcheck'
import Grid from '@material-ui/core/Grid'
import { hot } from 'react-hot-loader'
import QueryFeed from './query-feed'
import LinearProgress from '@material-ui/core/LinearProgress'
import Paging from './paging'
import { Dropdown } from '@connexta/atlas/atoms/dropdown'
import Paper from '@material-ui/core/Paper'
import { BetterClickAwayListener } from '../better-click-away-listener/better-click-away-listener'
import Button from '@material-ui/core/Button'
import FilterListIcon from '@material-ui/icons/FilterList'
import SortIcon from '@material-ui/icons/Sort'
import ResultFilter from '../result-filter/result-filter'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import EphemeralSearchSort from '../../react-component/query-sort-selection/ephemeral-search-sort'
import {
  useLazyResultsStatusFromSelectionInterface,
  useLazyResultsSelectedResultsFromSelectionInterface,
} from '../selection-interface/hooks'
import Box from '@material-ui/core/Box'
//@ts-ignore
import VisualizationSelector from '../../react-component/visualization-selector/visualization-selector'
import ViewCompactIcon from '@material-ui/icons/ViewCompact'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
const user = require('../singletons/user-instance.js')
import MoreIcon from '@material-ui/icons/MoreVert'

import LazyMetacardInteractions from '../results-visual/lazy-metacard-interactions'
import { Elevations } from '../theme/theme'
import useTheme from '@material-ui/core/styles/useTheme'
import SelectionRipple from '../golden-layout/selection-ripple'
const SelectedResults = ({ selectionInterface }: any) => {
  const selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResultsArray = Object.values(selectedResults)

  return (
    <Dropdown
      content={({ close }) => {
        return (
          <BetterClickAwayListener onClickAway={close}>
            <Paper>
              <LazyMetacardInteractions
                lazyResults={selectedResultsArray}
                onClose={() => {
                  close()
                }}
              />
            </Paper>
          </BetterClickAwayListener>
        )
      }}
    >
      {({ handleClick }) => {
        return (
          <Button
            className={
              selectedResultsArray.length === 0 ? 'relative' : 'relative'
            }
            color="primary"
            disabled={selectedResultsArray.length === 0}
            onClick={handleClick}
            style={{ height: '100%' }}
            size="small"
          >
            {selectedResultsArray.length} selected
            <Box
              color={selectedResultsArray.length === 0 ? '' : 'text.primary'}
            >
              <MoreIcon />
            </Box>
          </Button>
        )
      }}
    </Dropdown>
  )
}

const determineHasResultFilter = () => {
  return (
    user
      .get('user')
      .get('preferences')
      .get('resultFilter') !== undefined
  )
}

const determineHasResultSort = () => {
  return (
    user
      .get('user')
      .get('preferences')
      .get('resultSort') !== undefined
  )
}

type Props = {
  selectionInterface: any
  model: any
  goldenLayoutViewInstance: any
}

const ResultSelector = ({
  selectionInterface,
  model,
  goldenLayoutViewInstance,
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
  return (
    <React.Fragment>
      <Grid container alignItems="center" justify="flex-start" direction="row">
        <LinearProgress
          variant="query"
          className={`${
            isSearching ? 'opacity-100' : 'opacity-0'
          } absolute w-full h-1 left-0 bottom-0 transition-opacity`}
        />

        <Grid item>
          <Spellcheck
            key={Math.random()}
            selectionInterface={selectionInterface}
            model={model}
          />
        </Grid>
        <Grid item>
          <QueryFeed selectionInterface={selectionInterface} />
        </Grid>
        <Grid item className="relative">
          <SelectionRipple selectionInterface={selectionInterface} />
          <SelectedResults selectionInterface={selectionInterface} />
        </Grid>
        <Grid item className="pl-2 mx-auto">
          <Paging selectionInterface={selectionInterface} />
        </Grid>
        <Grid item className="ml-auto">
          <Dropdown
            content={({ closeAndRefocus }) => {
              return (
                <BetterClickAwayListener onClickAway={closeAndRefocus}>
                  <Paper className="p-3" elevation={Elevations.overlays}>
                    <ResultFilter closeDropdown={closeAndRefocus} />
                  </Paper>
                </BetterClickAwayListener>
              )
            }}
          >
            {({ handleClick }) => {
              return (
                <Button
                  onClick={handleClick}
                  variant="text"
                  color="primary"
                  style={{
                    borderBottom: hasResultFilter
                      ? `1px solid ${theme.palette.warning.main}`
                      : '0px',
                  }}
                >
                  <Box color="text.primary">
                    <FilterListIcon />
                  </Box>
                  Filter
                </Button>
              )
            }}
          </Dropdown>
        </Grid>
        <Grid item className="pl-2">
          <Dropdown
            content={({ closeAndRefocus }) => {
              return (
                <BetterClickAwayListener onClickAway={closeAndRefocus}>
                  <Paper className="p-3" elevation={Elevations.overlays}>
                    <EphemeralSearchSort closeDropdown={closeAndRefocus} />
                  </Paper>
                </BetterClickAwayListener>
              )
            }}
          >
            {({ handleClick }) => {
              return (
                <Button
                  onClick={handleClick}
                  variant="text"
                  color="primary"
                  style={{
                    borderBottom: hasResultSort
                      ? `1px solid ${theme.palette.warning.main}`
                      : '0px',
                  }}
                >
                  <Box color="text.primary">
                    <ArrowDownwardIcon />
                  </Box>
                  Sort
                </Button>
              )
            }}
          </Dropdown>
        </Grid>
        <Grid item className="pl-2">
          <Dropdown
            content={({ closeAndRefocus }) => {
              return (
                <BetterClickAwayListener onClickAway={closeAndRefocus}>
                  <Paper className="p-3" elevation={Elevations.overlays}>
                    <VisualizationSelector
                      onClose={closeAndRefocus}
                      goldenLayout={goldenLayoutViewInstance.goldenLayout}
                    />
                  </Paper>
                </BetterClickAwayListener>
              )
            }}
          >
            {({ handleClick }) => {
              return (
                <Button color="primary" onClick={handleClick}>
                  <Box color="text.primary">
                    <ViewCompactIcon />
                  </Box>
                  <Box className="pl-1">Layout</Box>
                </Button>
              )
            }}
          </Dropdown>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default hot(module)(ResultSelector)
