import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useParams } from 'react-router-dom'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import { GoldenLayout } from '../golden-layout/golden-layout'
import { DEFAULT_QUERY_OPTIONS, useUserQuery } from '../../js/model/TypedQuery'
import {
  FilterBuilderClass,
  FilterClass,
} from '../filter-builder/filter.structure'
import { getFilterTreeForId } from './metacard-nav'
const SelectionInterfaceModel = require('../selection-interface/selection-interface.model.js')
const user = require('../singletons/user-instance.js')
const _ = require('underscore')

type UploadType = Backbone.Model<{
  uploads: Backbone.Model<{ id: string; children: string[] }>[]
}>

export const getFilterTreeForUpload = ({
  upload,
}: {
  upload: UploadType
}): FilterBuilderClass => {
  return new FilterBuilderClass({
    type: 'OR',
    filters: _.flatten(
      upload
        .get('uploads')
        .filter((file) => file.id || file.get('children') !== undefined)
        .map((file) => {
          if (file.get('children') !== undefined) {
            return file.get('children').map(
              (child) =>
                new FilterClass({
                  type: '=',
                  value: child,
                  property: 'id',
                })
            )
          } else {
            return new FilterClass({
              type: '=',
              value: file.id,
              property: 'id',
            })
          }
        })
        .concat(
          new FilterClass({
            type: '=',
            value: '-1',
            property: 'id',
          })
        )
    ),
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
  const [query] = useUserQuery({
    attributes: getFilterTreeForId({ id }),
    options: {
      transformDefaults: DEFAULT_QUERY_OPTIONS.transformDefaults,
    },
  })
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
        query.set('filterTree', getFilterTreeForUpload({ upload }))
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
