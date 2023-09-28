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
import properties from '../../../js/properties'
import user from '../../../component/singletons/user-instance'

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

export const getColumnOrder = () => {
  const userchoices = user
    .get('user')
    .get('preferences')
    .get('inspector-summaryShown')
  if (userchoices.length > 0) {
    return userchoices
  }
  if ((properties as any).summaryShow.length > 0) {
    return (properties as any).summaryShow
  }
  return ['title', 'created', 'thumbnail']
}

export const aliasMap = encodeURIComponent(
  Object.entries(properties.attributeAliases)
    .map(([k, v]) => {
      return `${k}=${v}`
    })
    .toString()
)

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
