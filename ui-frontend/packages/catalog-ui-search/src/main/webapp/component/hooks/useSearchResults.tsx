import * as React from 'react'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useQuery } from '../../js/model/TypedQuery'
import {
  FilterBuilderClass,
  FilterClass,
} from '../filter-builder/filter.structure'
import SelectionInterfaceModel from '../selection-interface/selection-interface.model'
import { useResultsAndStatus } from '../../js/model/LazyQueryResult/hooks'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { debounce } from 'lodash'

type UseSearchResultsProps = {
  searchText: string
  archived?: boolean
}

type UseSearchResultsReturn = {
  lazyResults: LazyQueryResult[]
  loading: boolean
}

const createFilterTree = (
  searchText: string,
  archived: boolean
): FilterBuilderClass => {
  const baseFilters = [
    new FilterClass({
      property: 'title',
      value: `*${searchText}*`,
      type: 'ILIKE',
    }),
    new FilterClass({
      property: archived ? 'metacard.deleted.tags' : 'metacard-tags',
      value: 'query',
      type: 'ILIKE',
    }),
  ]

  if (archived) {
    baseFilters.push(
      new FilterClass({
        property: 'metacard-tags',
        value: '*',
        type: 'ILIKE',
      })
    )
  }

  return new FilterBuilderClass({
    type: 'AND',
    filters: baseFilters,
  })
}

const useDebounceSearch = (
  selectionInterface: typeof SelectionInterfaceModel,
  searchText: string,
  archived: boolean,
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const debouncedSearch = React.useCallback(
    debounce((query) => {
      query.startSearchFromFirstPage()
      setHasSearched(true)
    }, 500),
    [setHasSearched]
  )

  React.useEffect(() => {
    const currentQuery = selectionInterface.getCurrentQuery()
    currentQuery.set('filterTree', createFilterTree(searchText, archived))
    currentQuery.cancelCurrentSearches()
    debouncedSearch(currentQuery)

    return () => {
      debouncedSearch.cancel()
    }
  }, [
    searchText,
    archived,
    selectionInterface,
    setHasSearched,
    debouncedSearch,
  ])
}

export const useSearchResults = ({
  searchText,
  archived = false,
}: UseSearchResultsProps): UseSearchResultsReturn => {
  const [hasSearched, setHasSearched] = React.useState(false)
  const [queryModel] = useQuery({
    attributes: {
      sorts: [{ attribute: 'metacard.modified', direction: 'descending' }],
      filterTree: createFilterTree(searchText, archived),
    },
  })

  const selectionInterface = React.useMemo(
    () => new SelectionInterfaceModel({ currentQuery: queryModel }),
    [queryModel]
  )

  useDebounceSearch(selectionInterface, searchText, archived, setHasSearched)

  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const { status, results } = useResultsAndStatus({ lazyResults })

  return {
    lazyResults: results,
    loading: hasSearched ? status.isSearching : true,
  }
}
