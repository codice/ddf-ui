import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useParams } from 'react-router-dom'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { useStatusOfLazyResults } from '../../js/model/LazyQueryResult/hooks'
import CircularProgress from '@material-ui/core/CircularProgress'
const Query = require('../../js/model/Query.js')
const SelectionInterfaceModel = require('../selection-interface/selection-interface.model.js')
const Backbone = require('backbone')
const MetacardTitleView = require('../metacard-title/metacard-title.view.js')
import MRC from '../../react-component/marionette-region-container'
import Grid from '@material-ui/core/Grid'

const getCqlForId = ({ id }: { id: string }) => {
  return {
    type: 'AND',
    filters: [
      {
        type: '=',
        value: id,
        property: '"id"',
      },
      {
        type: 'ILIKE',
        value: '*',
        property: '"metacard-tags"',
      },
    ],
  }
}

const getQueryForId = ({ id }: { id: string }) => {
  return new Query.Model({
    cql: getCqlForId({ id }),
  })
}

const MetacardNavRoute = () => {
  const params = useParams<{ id: string; metacardId: string }>()
  const [id, setId] = React.useState(params.metacardId || params.id)
  React.useEffect(() => {
    setId(params.metacardId || params.id)
  }, [params.metacardId])
  const [query] = React.useState(getQueryForId({ id }))
  const [selectionInterface] = React.useState(
    new SelectionInterfaceModel({
      currentQuery: query,
    })
  )

  React.useEffect(() => {
    query.set('filterTree', getCqlForId({ id }))
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
    return <div>No result could be found</div>
  } else {
    return (
      <Grid container alignItems="center" className="w-full h-full">
        <Grid item className="w-full">
          <MRC
            className="w-full h-full"
            view={
              new MetacardTitleView({
                model: new Backbone.Collection(
                  filteredResults[0].getBackbone()
                ),
              })
            }
          />
        </Grid>
      </Grid>
    )
  }
}

export default hot(module)(MetacardNavRoute)
