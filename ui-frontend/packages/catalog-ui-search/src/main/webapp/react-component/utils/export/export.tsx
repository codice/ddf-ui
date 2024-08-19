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
import fetch from '../fetch'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { StartupDataStore } from '../../../js/model/Startup/startup'
import { TypedUserInstance } from '../../../component/singletons/TypedUser'
import { Overridable } from '../../../js/model/Base/base-classes'

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

export type ExportFormat = {
  id: string
  displayName: string
}

export interface ExportCountInfo {
  exportSize: string
  selectionInterface: any
  customExportCount: number
}

export type ExportInfo = {
  exportFormat: string
  exportSize: string
  customExportCount: number
  selectionInterface: any
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
    isDeleted: result.isDeleted(),
  }
}

export const getExportOptions = async (type: Transformer) => {
  const response = await fetch(`./internal/transformers/${type}`)
    .then((response) => response.json())
    .then((exportFormats) => {
      const configuredFormats =
        type == Transformer.Metacard
          ? StartupDataStore.Configuration.getExportMetacardFormatOptions()
          : StartupDataStore.Configuration.getExportMetacardsFormatOptions()

      if (configuredFormats.length > 0) {
        const newFormats = configuredFormats
          .map((configuredFormat: string) => {
            const validFormat = exportFormats.find(
              (exportFormat: ExportFormat) =>
                exportFormat.id === configuredFormat
            )
            if (validFormat == undefined)
              console.log(
                configuredFormat +
                  ' does not match any valid transformers; cannot include format in export list.'
              )
            return validFormat
          })
          .filter((format) => format !== undefined)

        if (newFormats.length > 0) return newFormats
        else
          console.log(
            "Could not match admin's configured export options to any valid transformers. \
          Returning list of all valid transformers instead."
          )
      } else {
        console.log(
          'Export formats not configured. Using list of all valid transformers instead.'
        )
      }
      return exportFormats
    })

  return response
}

export const getColumnOrder = () => {
  return TypedUserInstance.getResultsAttributesSummaryShown()
}

export const OverridableGetColumnOrder = new Overridable(getColumnOrder)

export const aliasMap = () => {
  return encodeURIComponent(
    Object.entries(
      StartupDataStore.Configuration.config?.attributeAliases || {}
    )
      .map(([k, v]) => {
        return `${k}=${v}`
      })
      .toString()
  )
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
