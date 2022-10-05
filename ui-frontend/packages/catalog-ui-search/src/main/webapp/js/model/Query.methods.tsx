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

import { isEqualWith } from 'lodash'
import {
  FilterBuilderClass,
  FilterClass,
  isFilterBuilderClass,
} from '../../component/filter-builder/filter.structure'

// slowly seperate out methods from Query model (which has a lot of dependencies) to here, where we can import them in a spec and test them

export type IndexForSourceGroupType = {
  [key: string]: number
}

export type SourceStatus = {
  id: string
  count: number
  hasReturned: boolean
  hits: number
  elapsed: number
  successful: boolean
  warnings: []
}

// key is going to be id in SourceStatus
export type QueryStatus = {
  [key: string]: SourceStatus
}

// given a current status, list of sources, and function to determine local, calculate next page
/**
 *  We use the current status + current index to calculate next index.
 *  Local sources get grouped into a single index.
 *
 *  If current index is blank it's assumed to be the start.
 *
 *  We throw an error if status is provided while current index is blank, as that doesn't make sense.
 *
 *  Notice that a good chunk of the logic is dedicated to ensuring we don't go beyond hits.
 *  Locally this doesn't matter, but remote sources tend to throw errors if we do.
 */
export const calculateNextIndexForSourceGroupNextPage = ({
  queryStatus = {},
  sources,
  isLocal,
  currentIndexForSourceGroup,
}: {
  queryStatus: QueryStatus
  sources: Array<string>
  isLocal: (id: string) => boolean
  currentIndexForSourceGroup: IndexForSourceGroupType
}): IndexForSourceGroupType => {
  if (
    Object.keys(queryStatus).length > 0 &&
    Object.keys(currentIndexForSourceGroup).length === 0
  ) {
    throw 'Invalid invocation:  queryStatus cannot be provided if currentIndexForSourceGroup is not'
  }
  const federatedSources = sources.filter((id) => {
    return !isLocal(id)
  })
  const maxLocalStart = Math.max(
    1,
    Object.values(queryStatus)
      .filter((indiviualStatus) => isLocal(indiviualStatus.id))
      .filter((indiviualStatus) => indiviualStatus.hits !== undefined)
      .reduce((blob, status) => {
        return blob + status.hits
      }, 1)
  )
  return Object.values(queryStatus).reduce(
    (blob, indiviualStatus) => {
      if (isLocal(indiviualStatus.id)) {
        blob['local'] = Math.min(
          maxLocalStart,
          blob['local'] + indiviualStatus.count
        )
      } else {
        blob[indiviualStatus.id] = Math.min(
          indiviualStatus.hits !== undefined ? indiviualStatus.hits + 1 : 1,
          blob[indiviualStatus.id] + indiviualStatus.count
        )
      }
      return blob
    },
    {
      local: 1,
      ...federatedSources.reduce((blob, id) => {
        blob[id] = 1
        return blob
      }, {} as { [key: string]: number }),
      ...currentIndexForSourceGroup,
    } as { [key: string]: number }
  )
}

export const getMaxIndexForSourceGroup = ({
  queryStatus,
  isLocal,
}: {
  queryStatus: QueryStatus
  isLocal: (id: string) => boolean
}): IndexForSourceGroupType => {
  if (Object.keys(queryStatus).length === 0) {
    console.log(
      'Invalid invocation:  queryStatus is required to determine max index for a query'
    )
    return {}
  }
  const maxLocalStart = Math.max(
    1,
    Object.values(queryStatus)
      .filter((indiviualStatus) => isLocal(indiviualStatus.id))
      .filter((indiviualStatus) => indiviualStatus.hits !== undefined)
      .reduce((blob, status) => {
        return blob + status.hits
      }, 0)
  )
  return Object.values(queryStatus).reduce(
    (blob, indiviualStatus) => {
      if (!isLocal(indiviualStatus.id)) {
        blob[indiviualStatus.id] = indiviualStatus.hits
      }
      return blob
    },
    {
      local: maxLocalStart,
    } as { [key: string]: number }
  )
}

export const hasPreviousPageForSourceGroup = ({
  currentIndexForSourceGroup,
}: {
  currentIndexForSourceGroup: IndexForSourceGroupType
}): boolean => {
  return (
    Object.values(currentIndexForSourceGroup).length > 0 &&
    Object.values(currentIndexForSourceGroup).some((start) => start !== 1)
  )
}

export const getNextPageForSourceGroup = ({
  currentIndexForSourceGroup,
  sources,
  isLocal,
  count,
}: {
  sources: Array<string>
  isLocal: (id: string) => boolean
  currentIndexForSourceGroup: IndexForSourceGroupType
  count: number
}): IndexForSourceGroupType => {
  if (Object.keys(currentIndexForSourceGroup).length > 0) {
    return Object.keys(currentIndexForSourceGroup).reduce(
      (blob, key) => {
        blob[key] = blob[key] + count
        return blob
      },
      { ...currentIndexForSourceGroup } as IndexForSourceGroupType
    )
  } else {
    return sources.reduce(
      (blob, sourceName) => {
        if (!isLocal(sourceName)) {
          blob[sourceName] = 1
        }
        return blob
      },
      {
        local: 1,
      } as IndexForSourceGroupType
    )
  }
}

export const hasNextPageForSourceGroup = ({
  queryStatus,
  isLocal,
  currentIndexForSourceGroup,
  count,
}: {
  queryStatus: QueryStatus
  isLocal: (id: string) => boolean
  currentIndexForSourceGroup: IndexForSourceGroupType
  count: number
}): boolean => {
  if (!queryStatus) {
    return false
  }

  const maxIndexforSourceGroup = getMaxIndexForSourceGroup({
    queryStatus,
    isLocal,
  })

  return Object.keys(maxIndexforSourceGroup).some((key) => {
    return (
      currentIndexForSourceGroup[key] + count - 1 < maxIndexforSourceGroup[key]
    )
  })
}

export const getPreviousPageForSourceGroup = ({
  currentIndexForSourceGroup,
  count,
}: {
  currentIndexForSourceGroup: IndexForSourceGroupType
  count: number
}): IndexForSourceGroupType => {
  return Object.keys(currentIndexForSourceGroup).reduce(
    (blob, key) => {
      blob[key] = Math.max(1, blob[key] - count)
      return blob
    },
    { ...currentIndexForSourceGroup } as IndexForSourceGroupType
  )
}

export const getFirstPageForSourceGroup = ({
  sources,
  isLocal,
}: {
  sources: Array<string>
  isLocal: (id: string) => boolean
}): IndexForSourceGroupType => {
  return calculateNextIndexForSourceGroupNextPage({
    sources,
    isLocal,
    queryStatus: {},
    currentIndexForSourceGroup: {},
  })
}

export const getFinalPageForSourceGroup = ({
  queryStatus,
  isLocal,
  count,
}: {
  queryStatus: QueryStatus
  isLocal: (id: string) => boolean
  count: number
}): IndexForSourceGroupType => {
  if (!queryStatus) {
    return {}
  }
  const maxIndexforSourceGroup = getMaxIndexForSourceGroup({
    queryStatus,
    isLocal,
  })
  return Object.keys(maxIndexforSourceGroup).reduce(
    (blob, sourceName) => {
      let remainderOnFinalPage = maxIndexforSourceGroup[sourceName] % count
      remainderOnFinalPage =
        remainderOnFinalPage === 0 ? count : remainderOnFinalPage
      blob[sourceName] =
        maxIndexforSourceGroup[sourceName] - remainderOnFinalPage + 1
      return blob
    },
    {
      ...maxIndexforSourceGroup,
    } as { [key: string]: number }
  )
}

export type QueryStartAndEndType = {
  start: number
  end: number
  hits: number
}

export const getCurrentStartAndEndForSourceGroup = ({
  queryStatus,
  currentIndexForSourceGroup,
}: {
  queryStatus: QueryStatus
  currentIndexForSourceGroup: IndexForSourceGroupType
}): QueryStartAndEndType => {
  if (!queryStatus) {
    return {
      start: 0,
      end: 0,
      hits: 0,
    }
  }
  const relativeStart = Object.keys(currentIndexForSourceGroup).reduce(
    (_blob, key) => {
      return currentIndexForSourceGroup[key]
    },
    0
  )

  const start =
    relativeStart === 1
      ? relativeStart
      : Object.keys(queryStatus).reduce((blob, key) => {
          return (
            blob +
            Math.min(
              queryStatus[key].hits,
              currentIndexForSourceGroup[key] |
                currentIndexForSourceGroup['local']
            )
          )
        }, 0)

  const end = Object.keys(queryStatus).reduce((blob, key) => {
    return blob + queryStatus[key].count
  }, start - 1)

  const hits = Object.keys(queryStatus).reduce((blob, key) => {
    return blob + queryStatus[key].hits
  }, 0)

  return {
    start,
    end: Math.max(start, end),
    hits,
  }
}

export const getConstrainedFinalPageForSourceGroup = ({
  queryStatus,
  isLocal,
  count,
}: {
  queryStatus: QueryStatus
  isLocal: (id: string) => boolean
  count: number
}): IndexForSourceGroupType => {
  const finalPageForSourceGroup = getFinalPageForSourceGroup({
    queryStatus,
    isLocal,
    count,
  })
  const maxFinalPageIndexForSourceGroup = Math.max(
    ...Object.values(finalPageForSourceGroup)
  )
  console.log(maxFinalPageIndexForSourceGroup)
  return Object.keys(finalPageForSourceGroup).reduce(
    (blob, sourceName) => {
      if (blob[sourceName] < maxFinalPageIndexForSourceGroup) {
        blob[sourceName] = maxFinalPageIndexForSourceGroup
      }
      return blob
    },
    {
      ...finalPageForSourceGroup,
    } as { [key: string]: number }
  )
}
