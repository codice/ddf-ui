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

import _ from 'underscore'
import { useEffect, useState } from 'react'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cont... Remove this comment to see the full error message
import contentDisposition from 'content-disposition'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import useSnack from '../hooks/useSnack'
import { AddSnack } from '../snack/snack.provider'
import { StartupDataStore } from '../../js/model/Startup/startup'
import {
  getExportOptions,
  Transformer,
  OverridableGetColumnOrder,
  exportResultSet,
  ExportCountInfo,
  ExportInfo,
  ExportFormat,
} from '../../react-component/utils/export'
import user from '../../component/singletons/user-instance'
import { DEFAULT_USER_QUERY_OPTIONS } from '../../js/model/TypedQuery'

import { getResultSetCql } from '../../react-component/utils/cql'
import SummaryManageAttributes from '../../react-component/summary-manage-attributes/summary-manage-attributes'
import { OverridableSaveFile } from '../../react-component/utils/save-file/save-file'
import ProgressButton from '../../react-component/progress-button/progress-button'
import DialogContent from '@mui/material/DialogContent/DialogContent'
import DialogActions from '@mui/material/DialogActions/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { limitToDeleted, limitToHistoric } from '../../js/model/Query'

export type Props = {
  selectionInterface: any
  onClose?: any
  exportSuccessful?: boolean
  setExportSuccessful?: any
}

type Source = {
  id: string
  hits: number
}

type Option = {
  label: string
  value: string
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
  const exportResultLimit = StartupDataStore.Configuration.getExportLimit()
  const exportCount = getExportCount(exportCountInfo)
  const result = exportCountInfo.selectionInterface
    .getCurrentQuery()
    .get('result')
  const totalHits = getHits(Object.values(result.get('lazyResults').status))
  const limitWarning = `You cannot export more than the administrator configured limit of ${exportResultLimit}.`
  let warningMessage = ''
  if (exportCount > exportResultLimit) {
    if (exportCountInfo.exportSize === 'custom') {
      return limitWarning
    }
    warningMessage =
      limitWarning +
      `  Only ${exportResultLimit} ${
        exportResultLimit === 1 ? `result` : `results`
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
  if (totalHits > 100 && exportCount > 100 && exportResultLimit > 100) {
    warningMessage += `  This may take a long time.`
  }
  return warningMessage
}

type SourceIdPair = {
  id: string
  sourceId: string
}

export const getExportBody = async (ExportInfo: ExportInfo) => {
  const { exportSize, customExportCount, selectionInterface } = ExportInfo
  const exportResultLimit = StartupDataStore.Configuration.getExportLimit()
  const hiddenFields = getHiddenFields()
  const columnOrder = OverridableGetColumnOrder.get()()
  const srcs = getSrcs(selectionInterface)
  const sorts = getSorts(selectionInterface)
  const query = selectionInterface.getCurrentQuery()
  const cacheId = query.get('cacheId')
  const phonetics = query.get('phonetics')
  const spellcheck = query.get('spellcheck')
  let additionalOptions = JSON.parse(query.get('additionalOptions') || '{}')

  let cqlFilterTree = query.get('filterTree')
  if (query.options.limitToDeleted) {
    cqlFilterTree = limitToDeleted(cqlFilterTree)
  } else if (query.options.limitToHistoric) {
    cqlFilterTree = limitToHistoric(cqlFilterTree)
  }

  if (query.options.additionalOptions) {
    additionalOptions = _.extend(
      additionalOptions,
      query.options.additionalOptions
    )
  }

  const exportCount = Math.min(
    getExportCount({ exportSize, selectionInterface, customExportCount }),
    exportResultLimit
  )
  const args = {
    hiddenFields: hiddenFields.length > 0 ? hiddenFields : [],
    columnOrder: columnOrder.length > 0 ? columnOrder : [],
    columnAliasMap: StartupDataStore.Configuration.config?.attributeAliases,
  }
  const searches = []
  let queryCount = exportCount
  let cql = DEFAULT_USER_QUERY_OPTIONS.transformFilterTree({
    originalFilterTree: cqlFilterTree,
    queryRef: query,
  })
  if (ExportInfo.exportSize === 'currentPage') {
    const resultIdSourcePairs: SourceIdPair[] = Object.values(
      query.get('result').get('lazyResults').results
    ).map((result: LazyQueryResult) => ({
      id: result.plain.metacard.properties['id'],
      sourceId: result.plain.metacard.properties['source-id'],
    }))

    const srcMap: Record<string, string[]> = resultIdSourcePairs.reduce(
      (srcMap: Record<string, string[]>, curPair: SourceIdPair) => {
        if (!srcMap[curPair.sourceId]) {
          srcMap[curPair.sourceId] = []
        }
        srcMap[curPair.sourceId].push(curPair.id)
        return srcMap
      },
      {} as Record<string, string[]>
    )
    Object.keys(srcMap).forEach((src) => {
      searches.push({
        srcs: [src],
        cql: getResultSetCql(srcMap[src]),
        count: srcMap[src].length,
        cacheId,
      })
    })
  } else {
    searches.push({
      srcs,
      cql,
      count: queryCount,
      cacheId,
    })
  }

  return {
    phonetics,
    spellcheck,
    additionalOptions: JSON.stringify(additionalOptions),
    searches,
    count: exportCount,
    sorts,
    args,
  }
}

const TableExports = ({
  selectionInterface,
  onClose,
  setExportSuccessful,
  exportSuccessful,
}: Props) => {
  const exportLimit = StartupDataStore.Configuration.getExportLimit()
  const [formats, setFormats] = useState<Option[]>([])
  const [exportFormat, setExportFormat] = useState('')
  const [exportSize, setExportSize] = useState('all')
  const [warning, setWarning] = useState('')
  const [customExportCount, setCustomExportCount] = useState(exportLimit)
  const [loading, setLoading] = useState(false)

  const onExportClick = async (addSnack: AddSnack, ExportInfo: ExportInfo) => {
    const exportFormat = encodeURIComponent(ExportInfo.exportFormat)
    try {
      setLoading(true)
      const body = await getExportBody(ExportInfo)
      const response = await exportResultSet(exportFormat, body)
      if (response.status === 200) {
        const data = await response.blob()
        const contentType = response.headers.get('content-type')
        const filename = contentDisposition.parse(
          response.headers.get('content-disposition')
        ).parameters.filename
        OverridableSaveFile.get()(filename, 'data:' + contentType, data)
        setExportSuccessful(true)
      } else {
        setExportSuccessful(false)
        addSnack('Error: Could not export results.', {
          alertProps: { severity: 'error' },
        })
      }
    } catch (error) {
      console.error(error)
      setExportSuccessful(false)
    } finally {
      setLoading(false)
    }
  }

  if (exportSuccessful) {
    onClose()
  }

  const exportSizes: Option[] = [
    {
      label: 'Current Page',
      value: 'currentPage',
    },
    {
      label: 'All Results',
      value: 'all',
    },
    {
      label: 'Specific Number of Results',
      value: 'custom',
    },
  ]

  const addSnack = useSnack()
  useEffect(() => {
    const fetchFormats = async () => {
      const formats = await getExportOptions(Transformer.Query)

      setFormats(
        formats.map((exportFormat: ExportFormat) => ({
          label: exportFormat.displayName,
          value: exportFormat.id,
        }))
      )

      formats.length && setExportFormat(formats[0].id)
    }
    fetchFormats()
  }, [])

  useEffect(() => {
    setWarning(
      getWarning({
        exportSize,
        selectionInterface,
        customExportCount,
      })
    )
  }, [exportSize, customExportCount])

  return formats.length === 0 ? (
    <LinearProgress className="w-full h-2" />
  ) : (
    <>
      <DialogContent>
        <DialogContentText>
          <div className="p-4" style={{ minWidth: '400px' }}>
            <div className="pt-2">
              <Autocomplete
                size="small"
                options={exportSizes}
                onChange={(_e: any, newValue) => {
                  setExportSize(newValue.value)
                }}
                isOptionEqualToValue={(option) => option.value === exportSize}
                getOptionLabel={(option) => {
                  return option.label
                }}
                disableClearable
                value={exportSizes.find(
                  (choice) => choice.value === exportSize
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Export" variant="outlined" />
                )}
              />
            </div>
            {exportSize === 'custom' ? (
              <div className="pt-2">
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label=""
                  placeholder="Enter number of results you would like to export"
                  name="customExport"
                  value={customExportCount}
                  onChange={(e) => {
                    setCustomExportCount(Number(e.target.value))
                  }}
                  variant="outlined"
                />
              </div>
            ) : (
              <div />
            )}
            <div className="pt-2 export-format">
              <Autocomplete
                size="small"
                options={formats}
                onChange={(_e: any, newValue) => {
                  setExportFormat(newValue.value)
                }}
                isOptionEqualToValue={(option) => option.value === exportFormat}
                getOptionLabel={(option) => {
                  return option.label
                }}
                disableClearable
                value={formats.find((choice) => choice.value === exportFormat)}
                renderInput={(params) => (
                  <TextField {...params} label="as" variant="outlined" />
                )}
              />
            </div>
            {['csv', 'rtf', 'xlsx'].includes(exportFormat) ? (
              <SummaryManageAttributes isExport={true} />
            ) : null}
            {warning && (
              <div className="warning text-center pt-1">
                <i className="fa fa-warning" />
                <span>{warning}</span>
              </div>
            )}
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <div
          className="pt-2"
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button
            className="mr-2"
            disabled={loading}
            variant="text"
            onClick={() => {
              onClose()
            }}
          >
            Cancel
          </Button>
          <ProgressButton
            variant="contained"
            color="primary"
            loading={loading}
            disabled={
              loading &&
              exportSize === 'custom' &&
              customExportCount > exportLimit
            }
            onClick={() => {
              onExportClick(addSnack, {
                exportFormat,
                exportSize,
                customExportCount,
                selectionInterface,
              })
            }}
          >
            Export
          </ProgressButton>
        </div>
      </DialogActions>
    </>
  )
}

export default TableExports
