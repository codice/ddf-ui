import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { DarkDivider } from '../dark-divider/dark-divider'
import {
  FilterBuilderClass,
  FilterClass,
} from '../filter-builder/filter.structure'
import { useQuery, useUserQuery } from '../../js/model/TypedQuery'
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../selection-interface/hooks'
import { Elevations } from '../theme/theme'
import SelectionInterface from '../selection-interface/selection-interface.model'
import _debounce from 'lodash.debounce'
import LinearProgress from '@material-ui/core/LinearProgress'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import QueryFeed from '../result-selector/query-feed'
import Paging from '../result-selector/paging'
import { getSortDirectionOptions } from '../../react-component/query-sort-selection/sort-selection-helpers'
import ResultsVisual from '../visualization/results-visual/results-visual'
import { SplitPane } from '../resizable-grid/resizable-grid'
import { GoldenLayout } from '../golden-layout/golden-layout'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
import { Memo } from '../memo/memo'
import { useUpdateEffect } from 'react-use'

type ModifySearchParams = {
  search: any
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
  search.set('filterTree', filterBuilder)
  search.set('sorts', sorts)
  return search
}

type SortAttributeType = 'title' | 'last modified'
type SortDirectionType = 'ascending' | 'descending'

const buildSearchFromSelection = ({
  search,
  lazyResults,
}: {
  search: any
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
  search.set('filterTree', totalFilterTree)
  return search
}

const SelectionInfoPane = ({
  searchSelectionInterface,
}: {
  searchSelectionInterface: any
}) => {
  const [search] = useUserQuery()
  const lazyResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface: searchSelectionInterface,
  })
  const [selectionInterface] = React.useState(
    new SelectionInterface({
      currentQuery: buildSearchFromSelection({ lazyResults, search }),
    })
  )
  React.useEffect(() => {
    if (Object.keys(lazyResults).length > 0) {
      buildSearchFromSelection({
        search,
        lazyResults,
      })
      selectionInterface.getCurrentQuery().startSearchFromFirstPage()
    } else {
      selectionInterface.getCurrentQuery().cancelCurrentSearches()
    }
  }, [lazyResults])
  return (
    <>
      <div className="block w-full h-full relative">
        <div
          className={
            Object.keys(lazyResults).length > 0
              ? 'hidden'
              : 'block py-2 pr-2 w-full h-full left-0 top-0 absolute z-10'
          }
        >
          <div className="p-2 w-full h-full relative">
            <div className="opacity-75 bg-black absolute left-0 top-0 w-full h-full z-0"></div>
            <div className="block text-xl text-white z-10 relative">
              <span className="bg-black p-2">
                Select a search(s) from the left to preview.
              </span>
            </div>
          </div>
        </div>
        <GoldenLayout selectionInterface={selectionInterface} />
      </div>
    </>
  )
}

const SavedSearches = () => {
  const [filter, setFilter] = React.useState('')
  const [sortAttribute, setSortAttribute] = React.useState(
    'last modified' as SortAttributeType
  )
  const [sortDirection, setSortDirection] = React.useState(
    'descending' as SortDirectionType
  )
  const [search] = useQuery()
  const selectionInterface = React.useMemo(() => {
    return new SelectionInterface({
      currentQuery: search,
    })
  }, [])
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
    <div className="w-full h-full flex flex-col flex-nowrap overflow-hidden ">
      <div className="shrink-0 w-full pt-2 pr-2">
        <Paper
          elevation={Elevations.panels}
          className="min-h-16 w-full shrink-0 p-2 flex flex-row items-center flex-wrap"
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
      <div className="relative h-full overflow-hidden w-full shrink">
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
