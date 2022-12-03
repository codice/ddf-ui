import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useParams } from 'react-router-dom'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { useStatusOfLazyResults } from '../../js/model/LazyQueryResult/hooks'
import CircularProgress from '@material-ui/core/CircularProgress'
import SelectionInterfaceModel from '../selection-interface/selection-interface.model.js'
import Grid from '@material-ui/core/Grid'
import { DEFAULT_QUERY_OPTIONS, useUserQuery } from '../../js/model/TypedQuery'
import {
  FilterBuilderClass,
  FilterClass,
} from '../filter-builder/filter.structure'
import { TypedUserInstance, useEphemeralFilter } from '../singletons/TypedUser'
import Button from '@material-ui/core/Button'
import { TitleView } from '../visualization/inspector/inspector'

export const getFilterTreeForId = ({ id }: { id: string }) => {
  return new FilterBuilderClass({
    type: 'AND',
    filters: [
      new FilterClass({
        type: '=',
        value: id,
        property: '"id"',
      }),
      new FilterClass({
        type: 'ILIKE',
        value: '*',
        property: '"metacard-tags"',
      }),
    ],
  })
}

const MetacardNavRoute = () => {
  const params = useParams<{ id: string; metacardId: string }>()
  const [id, setId] = React.useState(params.metacardId || params.id)
  React.useEffect(() => {
    setId(params.metacardId || params.id)
  }, [params.metacardId])
  const [query] = useUserQuery({
    attributes: {
      filterTree: getFilterTreeForId({ id }),
    },
    options: {
      transformDefaults: DEFAULT_QUERY_OPTIONS.transformDefaults,
    },
  })
  const ephemeralFilter = useEphemeralFilter()
  const [selectionInterface] = React.useState(
    new SelectionInterfaceModel({
      currentQuery: query,
    })
  )

  React.useEffect(() => {
    query.set('filterTree', getFilterTreeForId({ id }))
    query.cancelCurrentSearches()
    query.startSearchFromFirstPage()
    return () => {
      query.cancelCurrentSearches()
    }
  }, [id])
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const { isSearching } = useStatusOfLazyResults({ lazyResults })

  const filteredResults = Object.values(lazyResults.results)

  const notFoundYet = isSearching && filteredResults.length === 0
  if (notFoundYet) {
    return (
      <>
        <div>
          <CircularProgress color="inherit" />
        </div>
      </>
    )
  } else if (filteredResults.length === 0) {
    return (
      <div className="flex h-full items-center">
        <div> No result could be found.</div>
        {ephemeralFilter ? (
          <Button
            variant="outlined"
            color="primary"
            className="ml-2"
            onClick={() => {
              TypedUserInstance.removeEphemeralFilter()
            }}
          >
            Remove filter?
          </Button>
        ) : null}
      </div>
    )
  } else {
    return (
      <Grid container alignItems="center" className="w-full h-full">
        <Grid item className="max-w-full">
          <TitleView lazyResult={filteredResults[0]} />
        </Grid>
      </Grid>
    )
  }
}

export default hot(module)(MetacardNavRoute)
