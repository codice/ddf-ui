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
  const hasLocal = sources.some((id) => isLocal(id))
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
      ...(hasLocal ? { local: 1 } : {}),
      ...federatedSources.reduce((blob, id) => {
        blob[id] = 1
        return blob
      }, {} as { [key: string]: number }),
      ...currentIndexForSourceGroup,
    } as { [key: string]: number }
  )
}

export const getIndexOfNoMoreResultsForSourceGroup = ({
  queryStatus,
  isLocal,
}: {
  queryStatus: QueryStatus
  isLocal: (id: string) => boolean
}): IndexForSourceGroupType => {
  const indexOfLastResultForSourceGroup = getIndexOfLastResultForSourceGroup({
    queryStatus,
    isLocal,
  })
  return Object.keys(indexOfLastResultForSourceGroup).reduce((blob, key) => {
    blob[key] = indexOfLastResultForSourceGroup[key] + 1
    return blob
  }, {} as IndexForSourceGroupType)
}

/**
 *  This is the index of the final result for a source group.
 */
export const getIndexOfLastResultForSourceGroup = ({
  queryStatus,
  isLocal,
}: {
  queryStatus: QueryStatus
  isLocal: (id: string) => boolean
}): IndexForSourceGroupType => {
  if (Object.keys(queryStatus).length === 0) {
    console.warn(
      'Invalid invocation:  queryStatus is required to determine max index for a query'
    )
    return {}
  }
  const hasLocal = Object.values(queryStatus).some((status) =>
    isLocal(status.id)
  )
  const maxLocalStart = Math.max(
    0,
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
      ...(hasLocal ? { local: maxLocalStart } : {}),
    } as IndexForSourceGroupType
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

// should not be used outside of calculating the constrained next page
const getNextPageForSourceGroup = ({
  currentIndexForSourceGroup,
  sources,
  isLocal,
  count,
  queryStatus,
}: {
  sources: Array<string>
  isLocal: (id: string) => boolean
  currentIndexForSourceGroup: IndexForSourceGroupType
  count: number
  queryStatus: QueryStatus
}): IndexForSourceGroupType => {
  const finalIndexForSourceGroup = getFinalPageForSourceGroup({
    queryStatus,
    isLocal,
    count,
  })

  if (Object.keys(currentIndexForSourceGroup).length > 0) {
    return Object.keys(currentIndexForSourceGroup).reduce(
      (blob, key) => {
        blob[key] = Math.min(blob[key] + count, finalIndexForSourceGroup[key])
        return blob
      },
      { ...currentIndexForSourceGroup } as IndexForSourceGroupType
    )
  } else {
    const hasLocal = sources.some((id) => isLocal(id))
    return sources.reduce(
      (blob, sourceName) => {
        if (!isLocal(sourceName)) {
          blob[sourceName] =
            Math.min(1, finalIndexForSourceGroup[sourceName]) || 1
        }
        return blob
      },
      {
        ...(hasLocal ? { local: 1 } : {}),
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

  const indexOfLastResultForSourceGroup = getIndexOfLastResultForSourceGroup({
    queryStatus,
    isLocal,
  })

  return Object.keys(indexOfLastResultForSourceGroup).some((key) => {
    return (
      currentIndexForSourceGroup[key] + count - 1 <
      indexOfLastResultForSourceGroup[key]
    )
  })
}

// should not be used outside of calculating the constrained previous page
const getPreviousPageForSourceGroup = ({
  currentIndexForSourceGroup,
  sources,
  isLocal,
  count,
  queryStatus,
}: {
  sources: Array<string>
  isLocal: (id: string) => boolean
  currentIndexForSourceGroup: IndexForSourceGroupType
  count: number
  queryStatus: QueryStatus
}): IndexForSourceGroupType => {
  const finalIndexForSourceGroup = getFinalPageForSourceGroup({
    queryStatus,
    isLocal,
    count,
  })

  if (Object.keys(currentIndexForSourceGroup).length > 0) {
    return Object.keys(currentIndexForSourceGroup).reduce(
      (blob, key) => {
        blob[key] = Math.max(
          Math.min(blob[key] - count, finalIndexForSourceGroup[key]),
          1
        )
        return blob
      },
      { ...currentIndexForSourceGroup } as IndexForSourceGroupType
    )
  } else {
    const hasLocal = sources.some((id) => isLocal(id))
    return sources.reduce(
      (blob, sourceName) => {
        if (!isLocal(sourceName)) {
          blob[sourceName] =
            Math.min(1, finalIndexForSourceGroup[sourceName]) || 1
        }
        return blob
      },
      {
        ...(hasLocal ? { local: 1 } : {}),
      } as IndexForSourceGroupType
    )
  }
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

const getFinalPageForSourceGroup = ({
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
  const indexOfLastResultForSourceGroup = getIndexOfLastResultForSourceGroup({
    queryStatus,
    isLocal,
  })
  return Object.keys(indexOfLastResultForSourceGroup).reduce(
    (blob, sourceName) => {
      let remainderOnFinalPage =
        indexOfLastResultForSourceGroup[sourceName] % count
      remainderOnFinalPage =
        remainderOnFinalPage === 0 ? count : remainderOnFinalPage
      blob[sourceName] = Math.max(
        indexOfLastResultForSourceGroup[sourceName] - remainderOnFinalPage + 1,
        1
      )
      return blob
    },
    {
      ...indexOfLastResultForSourceGroup,
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
  isLocal,
}: {
  queryStatus: QueryStatus
  currentIndexForSourceGroup: IndexForSourceGroupType
  isLocal: (id: string) => boolean
}): QueryStartAndEndType => {
  if (!queryStatus || Object.keys(queryStatus).length === 0) {
    return {
      start: 0,
      end: 0,
      hits: 0,
    }
  }
  const lastIndexForSourceGroup = getIndexOfLastResultForSourceGroup({
    queryStatus,
    isLocal,
  })

  let start = 1
  const isBeginning = Object.values(currentIndexForSourceGroup).every(
    (start) => start === 1
  )

  if (!isBeginning) {
    start = Object.keys(currentIndexForSourceGroup).reduce((blob, key) => {
      return (
        blob +
        Math.min(currentIndexForSourceGroup[key], lastIndexForSourceGroup[key])
      ) // if we go beyond the hits, we should only add the total hits for that source
    }, 0)
  }

  const end = Object.keys(queryStatus).reduce((blob, key) => {
    return blob + queryStatus[key].count
  }, start - 1)

  const hits = Object.keys(queryStatus).reduce((blob, key) => {
    return blob + queryStatus[key].hits
  }, 0)

  return {
    start: Math.min(start, hits),
    end: Math.min(Math.max(start, end), hits),
    hits,
  }
}

function getFarthestIndexForSourceGroup(
  sourceGroup: IndexForSourceGroupType
): number {
  // find the max index for the source group
  return Math.max(...Object.values(sourceGroup))
}

/**
 * Ensures that the next page indices for a group of sources make sense.  We do this by examining the farthest index, since paging is done individually for each source.
 * If the farthest index is beyond the hits for a source, we essentially "lock" the source to the end to ensure we don't recieve further results.
 **/
export const getConstrainedNextPageForSourceGroup = ({
  currentIndexForSourceGroup,
  sources,
  isLocal,
  count,
  queryStatus,
}: {
  sources: Array<string>
  isLocal: (id: string) => boolean
  currentIndexForSourceGroup: IndexForSourceGroupType
  count: number
  queryStatus: QueryStatus
}): IndexForSourceGroupType => {
  const nextPageForSourceGroup = getNextPageForSourceGroup({
    queryStatus,
    isLocal,
    count,
    currentIndexForSourceGroup,
    sources,
  })
  const farthestIndexForSourceGroup = getFarthestIndexForSourceGroup(
    nextPageForSourceGroup
  )
  const indexOfNoMoreResultsForSourceGroup =
    getIndexOfNoMoreResultsForSourceGroup({
      queryStatus,
      isLocal,
    })
  return Object.keys(nextPageForSourceGroup).reduce(
    (blob, sourceName) => {
      if (blob[sourceName] < farthestIndexForSourceGroup) {
        blob[sourceName] = indexOfNoMoreResultsForSourceGroup[sourceName] // lock the source to the end, since we've gone beyond the hits (will ensure no results come back)
      }
      return blob
    },
    {
      ...nextPageForSourceGroup,
    } as { [key: string]: number }
  )
}

/**
 *  The final index for a source group is not the same as the final index when thinking about the very last page, since we have multiple sources.
 *  Some sources may have already "exhausted" their results, so we need to make sure that if we don't return results that we've already "passed".
 */
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
  const indexOfNoMoreResultsForSourceGroup =
    getIndexOfNoMoreResultsForSourceGroup({
      queryStatus,
      isLocal,
    })
  return Object.keys(finalPageForSourceGroup).reduce(
    (blob, sourceName) => {
      if (blob[sourceName] < maxFinalPageIndexForSourceGroup) {
        blob[sourceName] = indexOfNoMoreResultsForSourceGroup[sourceName]
      }
      return blob
    },
    {
      ...finalPageForSourceGroup,
    } as { [key: string]: number }
  )
}

/**
 * Ensures that the next page indices for a group of sources make sense.  We do this by examining the farthest index, since paging is done individually for each source.
 * If the farthest index is beyond the hits for a source, we essentially "lock" the source to the end to ensure we don't recieve further results.
 **/
export const getConstrainedPreviousPageForSourceGroup = ({
  currentIndexForSourceGroup,
  sources,
  isLocal,
  count,
  queryStatus,
}: {
  sources: Array<string>
  isLocal: (id: string) => boolean
  currentIndexForSourceGroup: IndexForSourceGroupType
  count: number
  queryStatus: QueryStatus
}): IndexForSourceGroupType => {
  if (!queryStatus || Object.keys(queryStatus).length === 0) {
    return getFirstPageForSourceGroup({
      sources,
      isLocal,
    })
  }
  const previousPageForSourceGroup = getPreviousPageForSourceGroup({
    queryStatus,
    isLocal,
    count,
    currentIndexForSourceGroup,
    sources,
  })
  const farthestIndexForSourceGroup = getFarthestIndexForSourceGroup(
    previousPageForSourceGroup
  )
  const indexOfNoMoreResultsForSourceGroup =
    getIndexOfNoMoreResultsForSourceGroup({
      queryStatus,
      isLocal,
    })
  return Object.keys(previousPageForSourceGroup).reduce(
    (blob, sourceName) => {
      if (blob[sourceName] < farthestIndexForSourceGroup) {
        // never go beyond the no more results index, but make sure we keep indexes in sync when going backwards
        blob[sourceName] = Math.min(
          indexOfNoMoreResultsForSourceGroup[sourceName],
          farthestIndexForSourceGroup
        )
      }
      return blob
    },
    {
      ...previousPageForSourceGroup,
    } as { [key: string]: number }
  )
}
