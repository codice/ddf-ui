import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useParams } from 'react-router-dom'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { GoldenLayout } from '../golden-layout/golden-layout'
const Query = require('../../js/model/Query.js')
const SelectionInterfaceModel = require('../selection-interface/selection-interface.model.js')

const getFilterTreeForId = ({ id }: { id: string }) => {
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
    filterTree: getFilterTreeForId({ id }),
    federation: 'enterprise',
  })
}

const MetacardRoute = () => {
  const params = useParams<{ id: string; metacardId: string }>()
  const id = params.metacardId || params.id
  const [query] = React.useState(getQueryForId({ id }))
  const [selectionInterface] = React.useState(
    new SelectionInterfaceModel({
      currentQuery: query,
    })
  )

  React.useEffect(
    () => {
      query.set('filterTree', getFilterTreeForId({ id }))
      query.cancelCurrentSearches()
      query.startSearchFromFirstPage()
      return () => {
        query.cancelCurrentSearches()
      }
    },
    [id]
  )
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const filteredResults = Object.values(lazyResults.results)

  filteredResults.forEach(result => {
    result.setSelected(true)
  })

  return <GoldenLayout selectionInterface={selectionInterface} />
}

export default hot(module)(MetacardRoute)
