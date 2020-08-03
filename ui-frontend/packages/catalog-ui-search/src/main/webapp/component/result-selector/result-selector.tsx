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
import { useLazyResultsStatusFromSelectionInterface } from '../selection-interface/hooks'
const user = require('../singletons/user-instance.js')

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
}

const GridStyles = {
  padding: '0px 10px',
}

const ContainerStyles = {
  position: 'relative',
  padding: '10px',
} as React.CSSProperties

const ProgressStyles = {
  position: 'absolute',
  width: '100%',
  height: '10px',
  left: '0px',
  bottom: '0px',
  transition: 'opacity 1s ease-in-out',
} as React.CSSProperties

const ResultSelector = ({ selectionInterface, model }: Props) => {
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
  return (
    <React.Fragment>
      <Grid
        container
        alignItems="center"
        justify="center"
        direction="row"
        style={ContainerStyles}
      >
        <LinearProgress
          variant="query"
          style={{
            ...ProgressStyles,
            opacity: isSearching ? 1 : 0,
          }}
        />

        <Grid item style={GridStyles}>
          <Spellcheck
            key={Math.random()}
            selectionInterface={selectionInterface}
            model={model}
          />
        </Grid>
        <Grid item style={GridStyles}>
          <QueryFeed selectionInterface={selectionInterface} />
        </Grid>
        <Grid item style={GridStyles}>
          <Dropdown
            content={({ closeAndRefocus }) => {
              return (
                <BetterClickAwayListener onClickAway={closeAndRefocus}>
                  <Paper className="p-3" elevation={23}>
                    <ResultFilter closeDropdown={closeAndRefocus} />
                  </Paper>
                </BetterClickAwayListener>
              )
            }}
          >
            {({ handleClick }) => {
              return (
                <Button onClick={handleClick}>
                  Filter{' '}
                  <FilterListIcon
                    color={hasResultFilter ? 'secondary' : 'inherit'}
                  />
                </Button>
              )
            }}
          </Dropdown>
        </Grid>
        <Grid item style={GridStyles}>
          <Dropdown
            content={({ closeAndRefocus }) => {
              return (
                <BetterClickAwayListener onClickAway={closeAndRefocus}>
                  <Paper className="p-3" elevation={23}>
                    <EphemeralSearchSort closeDropdown={closeAndRefocus} />
                  </Paper>
                </BetterClickAwayListener>
              )
            }}
          >
            {({ handleClick }) => {
              return (
                <Button onClick={handleClick}>
                  Sort{' '}
                  <SortIcon color={hasResultSort ? 'secondary' : 'inherit'} />
                </Button>
              )
            }}
          </Dropdown>
        </Grid>

        <Grid item style={GridStyles}>
          <Paging selectionInterface={selectionInterface} />
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default hot(module)(ResultSelector)
