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
import Sources from '../../component/singletons/sources-instance'
import {
  getExportOptions,
  Transformer,
} from '../../react-component/utils/export'
const user = require('../../component/singletons/user-instance.js')
import {
  exportResultSet,
  ExportCountInfo,
  DownloadInfo,
} from '../../react-component/utils/export'
import saveFile from '../../react-component/utils/save-file'
const announcement = require('../../component/announcement/index.jsx')
const properties = require('../../js/properties.js')
const contentDisposition = require('content-disposition')

type ExportResponse = {
  displayName: string
  id: string
}

export type Props = {
  selectionInterface: any
  filteredAttributes: string[]
}

type Source = {
  id: string
  hits: number
}

export function getStartIndex(
  // @ts-ignore ts-migrate(6133) FIXME: 'src' is declared but its value is never read.
  src: string,
  // @ts-ignore ts-migrate(6133) FIXME: 'exportSize' is declared but its value is never re... Remove this comment to see the full error message
  exportSize: any,
  selectionInterface: any
) {
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
export function getSrcCount(
  src: any,
  count: any,
  exportSize: any,
  selectionInterface: any
) {
  const result = selectionInterface.getCurrentQuery().get('result')
  return exportSize === 'currentPage'
    ? Object.values(
        result.get('lazyResults').status as {
          [key: string]: any
        }
      ).find((status: any) => status.id === src).count
    : count
}
function getColumnOrder(): string[] {
  return user.get('user').get('preferences').get('columnOrder')
}
function getHiddenFields(): string[] {
  return user.get('user').get('preferences').get('columnHide')
}
function getSearches(
  exportSize: string,
  srcs: string[],
  cql: string,
  count: any,
  selectionInterface: any
): any {
  if (exportSize !== 'currentPage') {
    return srcs.length > 0
      ? [
          {
            srcs,
            cql,
            count,
          },
        ]
      : []
  }
  return srcs.map((src: string) => {
    const start = getStartIndex(src, exportSize, selectionInterface)
    const srcCount = getSrcCount(src, count, exportSize, selectionInterface)
    return {
      src,
      cql,
      start,
      count: srcCount,
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
function getSorts(selectionInterface: any) {
  return selectionInterface.getCurrentQuery().get('sorts')
}
export const getWarning = (exportCountInfo: ExportCountInfo): string => {
  const exportCount = getExportCount(exportCountInfo)
  const result = exportCountInfo.selectionInterface
    .getCurrentQuery()
    .get('result')
  const totalHits = getHits(Object.values(result.get('lazyResults').status))
  const limitWarning = `You cannot export more than the administrator configured limit of ${properties.exportResultLimit}.`
  let warningMessage = ''
  if (exportCount > properties.exportResultLimit) {
    if (exportCountInfo.exportSize === 'custom') {
      return limitWarning
    }
    warningMessage =
      limitWarning +
      `  Only ${properties.exportResultLimit} ${
        properties.exportResultLimit === 1 ? `result` : `results`
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
    properties.exportResultLimit > 100
  ) {
    warningMessage += `  This may take a long time.`
  }
  return warningMessage
}

export const getDownloadBody = (downloadInfo: DownloadInfo) => {
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
    properties.exportResultLimit
  )

  const query = selectionInterface.getCurrentQuery()
  const cql = query.getEphemeralMixinCql(query.get('filterTree'))
  const srcs = getSrcs(selectionInterface)
  const sorts = getSorts(selectionInterface)
  const args = {
    hiddenFields: hiddenFields.length > 0 ? hiddenFields : [],
    columnOrder: columnOrder.length > 0 ? columnOrder : [],
    columnAliasMap: properties.attributeAliases,
  }

  const searches = getSearches(exportSize, srcs, cql, count, selectionInterface)

  return {
    searches,
    count,
    sorts,
    args,
  }
}

export const onDownloadClick = async (downloadInfo: DownloadInfo) => {
  const exportFormat = encodeURIComponent(downloadInfo.exportFormat)
  try {
    const body = getDownloadBody(downloadInfo)
    const response = await exportResultSet(exportFormat, body)
    onDownloadSuccess(response)
  } catch (error) {
    console.error(error)
  }
}
export const onDownloadSuccess = async (response: Response) => {
  if (response.status === 200) {
    const data = await response.blob()
    const contentType = response.headers.get('content-type')
    const filename = contentDisposition.parse(
      response.headers.get('content-disposition')
    ).parameters.filename
    saveFile(filename, 'data:' + contentType, data)
  } else {
    announcement.announce({
      title: 'Error',
      message: 'Could not export results.',
      type: 'error',
    })
  }
}

const TableExports = (props: Props) => {
  const [formats, setFormats] = useState([])

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
      selectionInterface={props.selectionInterface}
      getWarning={getWarning}
      onDownloadClick={onDownloadClick}
      filteredAttributes={props.filteredAttributes}
    />
  )
}

export default TableExports
