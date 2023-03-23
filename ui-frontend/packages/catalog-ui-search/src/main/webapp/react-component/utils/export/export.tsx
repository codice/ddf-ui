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

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cont... Remove this comment to see the full error message
import contentDisposition from 'content-disposition'
import properties from '../../../js/properties'
import fetch from '../fetch'
import Sources from '../../../component/singletons/sources-instance'
import user from '../../../component/singletons/user-instance'
import saveFile from '../../utils/save-file'
import { DEFAULT_USER_QUERY_OPTIONS } from '../../../js/model/TypedQuery'
import { postAuditLog } from '../audit/audit-endpoint'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { AddSnack } from '../../../component/snack/snack.provider'

export enum Transformer {
  Metacard = 'metacard',
  Query = 'query',
}

export type ResultSet = {
  cql: string
  src?: string
  srcs?: string[]
  start?: number
  count: number
}

export type ExportBody = {
  searches: ResultSet[]
  count: number
  sorts: Object[]
  args?: Object
}

export interface ExportCountInfo {
  exportSize: string
  selectionInterface: any
  customExportCount: number
}

export type DownloadInfo = {
  exportFormat: string
  exportSize: string
  customExportCount: number
  selectionInterface: any
  filteredAttributes: any[]
}

export type ExportResponse = {
  displayName: string
  id: string
}

export type Option = {
  label: string
  value: string
}

type Source = {
  id: string
  hits: number
}

export const getExportResults = (results: LazyQueryResult[]) => {
  return results.map((result) => getExportResult(result))
}

const getResultId = (result: LazyQueryResult) => {
  const id = result.plain.id

  return encodeURIComponent(id)
}

const getResultSourceId = (result: LazyQueryResult) => {
  const sourceId = result.plain.metacard.properties['source-id']

  return encodeURIComponent(sourceId)
}

export const getExportResult = (result: LazyQueryResult) => {
  return {
    id: getResultId(result),
    source: getResultSourceId(result),
    attributes: Object.keys(result.plain.metacard.properties),
  }
}

export const getExportOptions = async (type: Transformer) => {
  const response = await fetch(`./internal/transformers/${type}`)
  return await response.json()
}

export const exportResult = async (
  source: string,
  id: string,
  transformer: string,
  attributes: string
) => {
  const response = await fetch(
    `/services/catalog/sources/${source}/${id}?transform=${transformer}&columnOrder=${attributes}`
  )
  await postAuditLog({
    action: 'exported',
    component: 'metacard',
    items: [{ id, 'source-id': source }],
  })
  return response
}

export const exportResultSet = async (
  transformer: string,
  body: ExportBody
) => {
  return await fetch(`./internal/cql/transform/${transformer}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export const getWarning = (exportCountInfo: ExportCountInfo): string => {
  const exportCount = getExportCount(exportCountInfo)
  const result = exportCountInfo.selectionInterface
    .getCurrentQuery()
    .get('result')
  const totalHits = getHits(Object.values(result.get('lazyResults').status))
  const limitWarning = `You cannot export more than the administrator configured limit of ${
    (properties as any).exportResultLimit
  }.`
  let warningMessage = ''
  if (exportCount > (properties as any).exportResultLimit) {
    if (exportCountInfo.exportSize === 'custom') {
      return limitWarning
    }
    warningMessage =
      limitWarning +
      `  Only ${(properties as any).exportResultLimit} ${
        (properties as any).exportResultLimit === 1 ? `result` : `results`
      } will be exported.`
  }
  if (exportCountInfo.exportSize === 'custom') {
    if (exportCount > totalHits) {
      warningMessage = `You are trying to export ${exportCount} results but there ${
        totalHits === 1 ? `is` : `are`
      } only ${totalHits}. \nOnly ${totalHits} ${
        totalHits === 1 ? `result` : `results`
      } will be exported.`
    }
  }
  if (
    totalHits > 100 &&
    exportCount > 100 &&
    (properties as any).exportResultLimit > 100
  ) {
    warningMessage += `  This may take a long time.`
  }
  return warningMessage
}

export const generateOnDownloadClick = ({
  addSnack,
}: {
  addSnack: AddSnack
}) => {
  return async (downloadInfo: DownloadInfo) => {
    const exportFormat = encodeURIComponent(downloadInfo.exportFormat)
    try {
      const body = getDownloadBody(downloadInfo)
      const response = await exportResultSet(exportFormat, body)
      if (response.status === 200) {
        const data = await response.blob()
        const contentType = response.headers.get('content-type')
        const filename = contentDisposition.parse(
          response.headers.get('content-disposition')
        ).parameters.filename
        saveFile(filename, 'data:' + contentType, data)
      } else {
        addSnack('Error: Could not export results.', {
          alertProps: { severity: 'error' },
        })
      }
    } catch (error) {
      console.error(error)
    }
  }
}

function getStartIndex(src: string, selectionInterface: any) {
  const srcIndexMap = selectionInterface.getCurrentQuery()
    .nextIndexForSourceGroup
  if (src === Sources.localCatalog) {
    return srcIndexMap['local']
  }
  return srcIndexMap[src]
}

function getSrcs(selectionInterface: any) {
  return selectionInterface.getCurrentQuery().getSelectedSources()
}

function getSrcCount(src: any, selectionInterface: any) {
  const result = selectionInterface.getCurrentQuery().get('result')
  return Object.values(
    result.get('lazyResults').status as {
      [key: string]: any
    }
  ).find((status: any) => status.id === src).count
}

function getColumnOrder(): string[] {
  return user.get('user').get('preferences').get('columnOrder')
}

function getHiddenFields(): string[] {
  return user.get('user').get('preferences').get('columnHide')
}

function getSorts(selectionInterface: any) {
  return (
    user.get('user').get('preferences').get('resultSort') ||
    selectionInterface.getCurrentQuery().get('sorts')
  )
}

function getSearches(
  exportSize: string,
  srcs: string[],
  cql: string,
  selectionInterface: any
): any {
  const cacheId = selectionInterface.getCurrentQuery().get('cacheId')
  if (exportSize !== 'currentPage') {
    const result = selectionInterface.getCurrentQuery().get('result')
    const pageSize = Object.keys(result.get('lazyResults').results).length
    return srcs.length > 0
      ? [
          {
            srcs,
            cql,
            count: pageSize,
            cacheId,
          },
        ]
      : []
  }
  return srcs.map((src: string) => {
    const start = getStartIndex(src, selectionInterface)
    const srcCount = getSrcCount(src, selectionInterface)
    return {
      src,
      cql,
      start,
      count: srcCount,
      cacheId,
    }
  })
}

function getHits(sources: Source[]): number {
  return sources
    .filter((source) => source.id !== 'cache')
    .reduce((hits, source) => (source.hits ? hits + source.hits : hits), 0)
}

function getExportCount({
  exportSize,
  selectionInterface,
  customExportCount,
}: ExportCountInfo): number {
  if (exportSize === 'custom') {
    return customExportCount
  }
  const result = selectionInterface.getCurrentQuery().get('result')
  return exportSize === 'all'
    ? getHits(Object.values(result.get('lazyResults').status))
    : Object.keys(result.get('lazyResults').results).length
}

function getDownloadBody(downloadInfo: DownloadInfo) {
  const {
    exportSize,
    customExportCount,
    selectionInterface,
    filteredAttributes,
  } = downloadInfo
  const hiddenFields = getHiddenFields()
  const columnOrder = getColumnOrder().filter(
    (property: string) =>
      filteredAttributes.includes(property) && !properties.isHidden(property)
  )
  const count = Math.min(
    getExportCount({ exportSize, selectionInterface, customExportCount }),
    (properties as any).exportResultLimit
  )
  const query = selectionInterface.getCurrentQuery()
  const cql = DEFAULT_USER_QUERY_OPTIONS.transformFilterTree({
    originalFilterTree: query.get('filterTree'),
    queryRef: query,
  })
  const srcs = getSrcs(selectionInterface)
  const sorts = getSorts(selectionInterface)
  const phonetics = query.get('phonetics')
  const spellcheck = query.get('spellcheck')
  const args = {
    hiddenFields: hiddenFields.length > 0 ? hiddenFields : [],
    columnOrder: columnOrder.length > 0 ? columnOrder : [],
    columnAliasMap: properties.attributeAliases,
  }
  const searches = getSearches(exportSize, srcs, cql, selectionInterface)
  return {
    phonetics,
    spellcheck,
    searches,
    count,
    sorts,
    args,
  }
}
