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
import * as React from 'react'
import { useEffect, useState } from 'react'
import TableExport from '../../react-component/table-export'
import {
  getExportOptions,
  Transformer,
  getColumnOrder,
} from '../../react-component/utils/export'
import user from '../../component/singletons/user-instance'
import {
  exportResultSet,
  ExportCountInfo,
  DownloadInfo,
} from '../../react-component/utils/export'
import saveFile from '../../react-component/utils/save-file'
import { DEFAULT_USER_QUERY_OPTIONS } from '../../js/model/TypedQuery'
import useSnack from '../hooks/useSnack'
import { AddSnack } from '../snack/snack.provider'
import properties from '../../js/properties'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cont... Remove this comment to see the full error message
import contentDisposition from 'content-disposition'
import { getResultSetCql } from '../../react-component/utils/cql'

type ExportResponse = {
  displayName: string
  id: string
}

export type Props = {
  selectionInterface: any
}

type Source = {
  id: string
  hits: number
}

function getSrcs(selectionInterface: any) {
  return selectionInterface.getCurrentQuery().getSelectedSources()
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
      } only ${totalHits}.  Only ${totalHits} ${
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

export const getDownloadBody = (downloadInfo: DownloadInfo) => {
  const { exportSize, customExportCount, selectionInterface } = downloadInfo

  const hiddenFields = getHiddenFields()
  const columnOrder = getColumnOrder()
  const srcs = getSrcs(selectionInterface)
  const sorts = getSorts(selectionInterface)
  const query = selectionInterface.getCurrentQuery()
  const cacheId = query.get('cacheId')
  const phonetics = query.get('phonetics')
  const spellcheck = query.get('spellcheck')
  const results = Object.keys(query.get('result').get('lazyResults').results)
  const pageSize = results.length
  const exportCount = Math.min(
    getExportCount({ exportSize, selectionInterface, customExportCount }),
    (properties as any).exportResultLimit
  )
  const args = {
    hiddenFields: hiddenFields.length > 0 ? hiddenFields : [],
    columnOrder: columnOrder.length > 0 ? columnOrder : [],
    columnAliasMap: properties.attributeAliases,
  }

  let queryCount = exportCount
  let cql = DEFAULT_USER_QUERY_OPTIONS.transformFilterTree({
    originalFilterTree: query.get('filterTree'),
    queryRef: query,
  })
  if (downloadInfo.exportSize !== 'all') {
    queryCount = pageSize
    cql = getResultSetCql(results)
  }

  const searches = [
    {
      srcs,
      cql,
      count: queryCount,
      cacheId,
    },
  ]

  return {
    phonetics,
    spellcheck,
    searches,
    count: exportCount,
    sorts,
    args,
  }
}

const generateOnDownloadClick = (addSnack: AddSnack) => {
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

const TableExports = ({ selectionInterface }: Props) => {
  const [formats, setFormats] = useState([])
  const addSnack = useSnack()
  useEffect(() => {
    const fetchFormats = async () => {
      const exportFormats = await getExportOptions(Transformer.Query)
      const sortedExportFormats = exportFormats.sort(
        (format1: ExportResponse, format2: ExportResponse) => {
          return format1.displayName.localeCompare(format2.displayName)
        }
      )
      setFormats(
        sortedExportFormats.map((exportFormat: ExportResponse) => ({
          label: exportFormat.displayName,
          value: exportFormat.id,
        }))
      )
    }
    fetchFormats()
  }, [])

  return (
    <TableExport
      exportFormats={formats}
      selectionInterface={selectionInterface}
      getWarning={getWarning}
      onDownloadClick={generateOnDownloadClick(addSnack)}
    />
  )
}
export default TableExports
