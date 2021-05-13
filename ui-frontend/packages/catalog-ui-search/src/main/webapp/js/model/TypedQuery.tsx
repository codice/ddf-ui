/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import React from 'react'
import { FilterBuilderClass } from '../../component/filter-builder/filter.structure'
import { useListenTo } from '../../component/selection-checkbox/useBackbone.hook'
import { TypedUserInstance } from '../../component/singletons/TypedUser'
import cql from '../cql'
import { QueryAttributesType, SortType } from './Query.shared-types'
const UntypedQuery = require('./Query.js')

/**
 * Mainly used by lazy query results, since it gets passed a function that adds in the query ref for it
 */
export type TransformSortsComposedFunctionType = ({
  originalSorts,
}: {
  originalSorts: SortType[]
}) => SortType[]

export type TransformSortsFunctionType = ({
  originalSorts,
  queryRef,
}: {
  originalSorts: SortType[]
  queryRef: Backbone.Model<any>
}) => SortType[]

export type QueryOptions = {
  /**
   * Pass a function that returns the defaults to use
   */
  transformDefaults?: ({
    originalDefaults,
    queryRef,
  }: {
    originalDefaults: QueryAttributesType
    queryRef: Backbone.Model<any>
  }) => QueryAttributesType
  /**
   *  Pass a function that returns the cql given a filter tree, allowing such things as mixing in ephemeral filters
   */
  transformFilterTree?: ({
    originalFilterTree,
    queryRef,
  }: {
    originalFilterTree: FilterBuilderClass
    queryRef: Backbone.Model<any>
  }) => string
  /**
   * Pass a function that returns the sorts to use, allowing such things as substituting ephemeral sorts
   */
  transformSorts?: TransformSortsFunctionType
  limitToDeleted?: boolean
  limitToHistoric?: boolean
}

export const DEFAULT_QUERY_OPTIONS: Readonly<Required<QueryOptions>> = {
  transformDefaults: ({ originalDefaults }) => {
    return originalDefaults
  },
  transformFilterTree: ({ originalFilterTree }) => {
    return cql.write(originalFilterTree)
  },
  transformSorts: ({ originalSorts }) => {
    return originalSorts
  },
  limitToHistoric: false,
  limitToDeleted: false,
}

export const Query = (
  attributes?: QueryAttributesType,
  options?: QueryOptions
) => {
  const mergedOptions: Required<QueryOptions> = {
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  }
  return new UntypedQuery.Model(attributes, mergedOptions)
}

function mixinEphemeralFilter(
  originalCQL: FilterBuilderClass
): FilterBuilderClass {
  const ephemeralFilter = TypedUserInstance.getEphemeralFilter()
  try {
    if (ephemeralFilter) {
      return new FilterBuilderClass({
        filters: [ephemeralFilter, originalCQL],
        type: 'AND',
      })
    } else {
      return originalCQL
    }
  } catch (err) {
    console.error(err)
    return originalCQL
  }
}

export const DEFAULT_USER_QUERY_OPTIONS: Readonly<Required<QueryOptions>> = {
  transformDefaults: ({ originalDefaults }) => {
    return { ...originalDefaults, ...TypedUserInstance.getQuerySettings() }
  },
  transformFilterTree: ({ originalFilterTree }) => {
    return cql.write(mixinEphemeralFilter(originalFilterTree))
  },
  transformSorts: ({ originalSorts }) => {
    return TypedUserInstance.getEphemeralSorts() || originalSorts
  },
  limitToDeleted: false,
  limitToHistoric: false,
}

/**
 * This should be used in place of useUserQuery _only_ if you do not intend to listen to changes to user prefs.
 */
export const UserQuery = (
  attributes?: QueryAttributesType,
  options?: QueryOptions
) => {
  const mergedOptions: Required<QueryOptions> = {
    ...DEFAULT_USER_QUERY_OPTIONS,
    ...options,
  }
  return Query(attributes, mergedOptions)
}

export const useQuery = ({
  attributes,
  options,
}: {
  attributes?: QueryAttributesType
  options?: QueryOptions
} = {}) => {
  const [query, setQuery] = React.useState(Query(attributes, options))
  return [query, setQuery]
}

export const useUserQuery = ({
  attributes,
  options,
}: {
  attributes?: QueryAttributesType
  options?: QueryOptions
} = {}) => {
  const [query, setQuery] = React.useState(UserQuery(attributes, options))
  useListenTo(TypedUserInstance.getPreferences(), 'change:resultCount', () => {
    query.set('isOutdated', true)
  })
  useListenTo(TypedUserInstance.getPreferences(), 'change:resultFilter', () => {
    query.startSearchFromFirstPage()
  })
  useListenTo(TypedUserInstance.getPreferences(), 'change:resultSort', () => {
    query.startSearchFromFirstPage()
  })
  return [query, setQuery]
}
