import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useParams } from 'react-router-dom'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { GoldenLayout } from '../golden-layout/golden-layout'
const Query = require('../../js/model/Query.js')
const SelectionInterfaceModel = require('../selection-interface/selection-interface.model.js')
const user = require('../singletons/user-instance.js')
const _ = require('underscore')

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
  })
}

const MetacardRoute = () => {
  const params = useParams<{
    id: string
    metacardId: string
    uploadId: string
  }>()

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
    if (id === undefined && params.uploadId) {
      const upload = user
        .get('user')
        .get('preferences')
        .get('uploads')
        .get(params.uploadId)
      if (upload) {
        query.set('filterTree', {
          type: 'OR',
          filters: _.flatten(
            upload
              .get('uploads')
              .filter(
                (file: any) => file.id || file.get('children') !== undefined
              )
              .map((file: any) => {
                if (file.get('children') !== undefined) {
                  return file.get('children').map((child: any) => ({
                    type: '=',
                    value: child,
                    property: 'id',
                  }))
                } else {
                  return {
                    type: '=',
                    value: file.id,
                    property: 'id',
                  }
                }
              })
              .concat({
                type: '=',
                value: '-1',
                property: 'id',
              })
          ),
        })
        query.cancelCurrentSearches()
        query.startSearchFromFirstPage()
      }
    }
  }, [id, params.uploadId])

  React.useEffect(
    // @ts-ignore ts-migrate(7030) FIXME: Not all code paths return a value.
    () => {
      if (id) {
        query.set('filterTree', getFilterTreeForId({ id }))
        query.cancelCurrentSearches()
        query.startSearchFromFirstPage()
        return () => {
          query.cancelCurrentSearches()
        }
      }
    },
    [id]
  )
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const filteredResults = Object.values(lazyResults.results)

  filteredResults.forEach((result) => {
    result.setSelected(true)
  })

  return <GoldenLayout selectionInterface={selectionInterface} />
}

export default hot(module)(MetacardRoute)
