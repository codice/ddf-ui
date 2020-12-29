import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { DarkDivider } from '../dark-divider/dark-divider'
import {
  FilterBuilderClass,
  FilterClass,
} from '../filter-builder/filter.structure'
import {
  // useLazyResultsFromSelectionInterface,
  useLazyResultsSelectedResultsFromSelectionInterface,
} from '../selection-interface/hooks'
import { Elevations } from '../theme/theme'
const SelectionInterface = require('../selection-interface/selection-interface.model.js')
const Query = require('../../js/model/Query.js')
import _debounce from 'lodash.debounce'
import LinearProgress from '@material-ui/core/LinearProgress'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
// import SortIcon from '@material-ui/icons/Sort'
import QueryFeed from '../result-selector/query-feed'
import Paging from '../result-selector/paging'
import { getSortDirectionOptions } from '../../react-component/query-sort-selection/sort-selection-helpers'
// import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
// import { AutoVariableSizeList } from 'react-window-components'
import ResultsVisual from '../results-visual/results-visual'
import { SplitPane } from '../resizable-grid/resizable-grid'
import { GoldenLayout } from '../golden-layout/golden-layout'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
import { Memo } from '../memo/memo'
import { useUpdateEffect } from 'react-use'

// const Common = require('../../js/Common.js')

type ModifySearchParams = {
  search?: any
  filter: string
  sortAttribute: SortAttributeType
  sortDirection: SortDirectionType
}

const modifySearch = ({
  search,
  filter,
  sortAttribute,
  sortDirection,
}: ModifySearchParams) => {
  const filterBuilder = new FilterBuilderClass({
    type: 'AND',
    filters: [
      new FilterClass({
        type: '=', // =
        property: 'metacard-tags',
        value: 'query', // query
      }),
    ],
  })
  if (filter.length > 0) {
    filterBuilder.filters.push(
      new FilterClass({
        type: 'ILIKE',
        property: 'title',
        value: `*${filter}*`,
      })
    )
  }
  const sorts = [
    {
      attribute: sortAttribute === 'title' ? 'title' : 'metacard.modified',
      direction: sortDirection.toLowerCase(),
    },
  ]
  console.log(search)
  if (search) {
    search.set('filterTree', filterBuilder)
    search.set('sorts', sorts)
  } else {
    return new Query.Model({
      filterTree: filterBuilder,
      sorts: sorts,
    })
  }
}

type SortAttributeType = 'title' | 'last modified'
type SortDirectionType = 'ascending' | 'descending'

// const SearchItem = ({
//   lazyResult,
//   measure,
// }: {
//   lazyResult: LazyQueryResult
//   measure: () => void
// }) => {
//   const when = Common.getMomentDate(
//     lazyResult.plain.metacard.properties.modified
//   ).split(' : ')
//   React.useEffect(() => {
//     measure()
//   }, [])
//   return (
//     <Paper elevation={Elevations.paper} className="p-2 mb-2">
//       <div>{lazyResult.plain.metacard.properties.title || 'Untitled'}</div>
//       <div>{when[0]}</div>
//     </Paper>
//   )
// }

const buildSearchFromSelection = ({
  search,
  lazyResults,
}: {
  search?: any
  lazyResults: LazyQueryResults['results']
}) => {
  const totalFilterTree = Object.values(lazyResults).reduce(
    (filterTree, lazyResult) => {
      filterTree.filters.push(
        new FilterBuilderClass(
          JSON.parse(lazyResult.plain.metacard.properties.filterTree)
        )
      )
      return filterTree
    },
    new FilterBuilderClass({ type: 'OR', filters: [] })
  )
  if (search) {
    search.set('filterTree', totalFilterTree)
  } else {
    return new Query.Model({ filterTree: totalFilterTree })
  }
}

const SelectionInfoPane = ({
  searchSelectionInterface,
}: {
  searchSelectionInterface: any
}) => {
  const lazyResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface: searchSelectionInterface,
  })
  const [selectionInterface] = React.useState(
    new SelectionInterface({
      currentQuery: buildSearchFromSelection({ lazyResults }),
    })
  )
  React.useEffect(() => {
    if (Object.keys(lazyResults).length > 0) {
      buildSearchFromSelection({
        search: selectionInterface.getCurrentQuery(),
        lazyResults,
      })
      selectionInterface.getCurrentQuery().startSearchFromFirstPage()
    } else {
      selectionInterface.getCurrentQuery().cancelCurrentSearches()
    }
  }, [lazyResults])
  return <GoldenLayout selectionInterface={selectionInterface} />
}

const selectionInterface = new SelectionInterface({
  currentQuery: new Query.Model(undefined, {
    ephemeralFilter: false,
    ephemeralSort: false,
  }),
})

const SavedSearches = () => {
  const [filter, setFilter] = React.useState('')
  const [sortAttribute, setSortAttribute] = React.useState(
    'last modified' as SortAttributeType
  )
  const [sortDirection, setSortDirection] = React.useState(
    'descending' as SortDirectionType
  )
  const debouncedUpdate = React.useRef(
    _debounce(
      ({
        filter,
        sortAttribute,
        sortDirection,
        search,
      }: ModifySearchParams) => {
        modifySearch({ filter, sortAttribute, sortDirection, search })
        selectionInterface.getCurrentQuery().startSearchFromFirstPage()
        setIsUpdating(false)
      },
      500
    )
  )
  const [isUpdating, setIsUpdating] = React.useState(false)
  React.useEffect(() => {
    setIsUpdating(true)
    debouncedUpdate.current({
      filter,
      sortAttribute,
      sortDirection,
      search: selectionInterface.getCurrentQuery(),
    })
  }, [filter, sortAttribute, sortDirection])
  useUpdateEffect(() => {
    /**
     * This makes sense, because we only have title and last modified.
     *
     * The natural inclination is inverted for sort direction for alphabetical vs time.
     */
    setSortDirection(sortAttribute === 'title' ? 'ascending' : 'descending')
  }, [sortAttribute])
  return (
    <div className="w-full h-full flex flex-col flex-no-wrap overflow-hidden ">
      <div className="flex-shrink-0 w-full pt-2 pr-2">
        <Paper
          elevation={Elevations.panels}
          className="min-h-16 w-full flex-shrink-0 p-2 flex flex-row items-center flex-wrap"
        >
          <TextField
            label="Filter"
            size="small"
            value={filter}
            variant="outlined"
            autoFocus
            onChange={(e) => {
              setFilter(e.target.value)
            }}
          />
          {/* <div className="text-lg">Sort by</div> */}
          <Autocomplete
            className="w-48 ml-2"
            options={['title', 'last modified'] as SortAttributeType[]}
            renderOption={(option) => {
              return <>{option}</>
            }}
            value={sortAttribute}
            onChange={(_e, newValue) => {
              setSortAttribute(newValue || 'title')
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Sort by"
                  variant="outlined"
                  size="small"
                  inputProps={{ ...params.inputProps }}
                />
              )
            }}
          />
          <Button
            className="ml-2"
            size="small"
            variant="text"
            onClick={() => {
              setSortDirection(
                sortDirection === 'ascending' ? 'descending' : 'ascending'
              )
            }}
          >
            {
              getSortDirectionOptions(
                sortAttribute === 'title' ? 'title' : 'metacard.modified'
              ).find((option) => option.value === sortDirection)?.label
            }
          </Button>
          <div className="ml-auto">
            <QueryFeed selectionInterface={selectionInterface} />
          </div>
          <div className="ml-2">
            <Paging selectionInterface={selectionInterface} />
          </div>
        </Paper>
      </div>
      <DarkDivider />
      <div className="relative h-full overflow-hidden w-full flex-shrink">
        {isUpdating ? (
          <LinearProgress
            variant="indeterminate"
            className="absolute left-0 top-0 w-full h-min"
          />
        ) : null}
        <Memo dependencies={[]}>
          <SplitPane variant="horizontal">
            <div className="py-2 w-full h-full">
              <Paper elevation={Elevations.panels} className="w-full h-full">
                <ResultsVisual selectionInterface={selectionInterface} />
              </Paper>
            </div>
            <SelectionInfoPane searchSelectionInterface={selectionInterface} />
          </SplitPane>
        </Memo>
      </div>
    </div>
  )
}

export default hot(module)(SavedSearches)
