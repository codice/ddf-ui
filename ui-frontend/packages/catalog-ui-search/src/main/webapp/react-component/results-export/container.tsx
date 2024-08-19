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
import { hot } from 'react-hot-loader'
import ResultsExportComponent from './presentation'
import {
  exportResultSet,
  OverridableGetColumnOrder,
  getExportOptions,
  Transformer,
  ExportFormat,
} from '../utils/export'
import { getResultSetCql, joinWithOr, limitCqlToDeleted } from '../utils/cql'
import withListenTo, { WithBackboneProps } from '../backbone-container'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cont... Remove this comment to see the full error message
import contentDisposition from 'content-disposition'
import { StartupDataStore } from '../../js/model/Startup/startup'
import { OverridableSaveFile } from '../utils/save-file/save-file'
import { AddSnack } from '../../component/snack/snack.provider'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'

type Result = {
  id: string
  source: string
  attributes: string[]
}

type Props = {
  results: Result[]
  lazyQueryResults: LazyQueryResults
  isZipped?: boolean
  onClose?: any
  exportSuccessful?: boolean
  setExportSuccessful?: any
  loading?: boolean
  setLoading?: any
} & WithBackboneProps

type State = {
  exportDisabled: boolean
  selectedFormat: string
  exportFormats: ExportFormat[]
  loading?: boolean
  exportSuccessful?: boolean
}

class ResultsExport extends React.Component<Props, State> {
  setExportSuccessful: any
  onClose: any
  setLoading: any
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedFormat: 'Binary Resource',
      exportFormats: [],
      exportDisabled: true,
      loading: false,
      exportSuccessful: false,
    }
    this.onClose = props.onClose
    this.setExportSuccessful = props.setExportSuccessful
    this.setLoading = props.setLoading
  }

  componentDidUpdate(_prevProps: Props) {
    if (
      _prevProps.results !== this.props.results ||
      _prevProps.isZipped !== this.props.isZipped
    ) {
      this.fetchExportOptions()
      this.setState({
        selectedFormat: 'Binary Resource',
        exportDisabled: true,
      })
    }
  }

  getTransformerType = () => {
    return !this.props.isZipped && this.props.results.length > 1
      ? Transformer.Query
      : Transformer.Metacard
  }

  componentDidMount() {
    this.fetchExportOptions()
  }

  fetchExportOptions = async () => {
    const formats = await getExportOptions(this.getTransformerType())
    this.setState({
      exportFormats: formats,
    })
  }

  getResultSources() {
    return new Set(
      this.props.results
        .map((result: Result) => result.source)
        .map((source: string) => decodeURIComponent(source))
    )
  }

  getSelectedExportFormatId() {
    const selectedFormat = this.state.selectedFormat
    const format = this.state.exportFormats.find(
      (format) => format.displayName === selectedFormat
    )

    if (format !== undefined) {
      return encodeURIComponent(format.id)
    }

    return undefined
  }

  getExportCql = () => {
    const resultIds = this.props.results.map((result: Result) => result.id)
    const queryResults = Object.values(this.props.lazyQueryResults.results)

    let cql
    if (queryResults.some((result: LazyQueryResult) => result.isDeleted())) {
      const deletedIds = queryResults
        .filter((result: LazyQueryResult) => result.isDeleted())
        .map((result: LazyQueryResult) => result.plain.id)

      cql = limitCqlToDeleted(getResultSetCql(deletedIds))

      if (deletedIds.length < resultIds.length) {
        const validIds = resultIds.filter(
          (id: string) => !deletedIds.includes(id)
        )
        const validItemsCql = getResultSetCql(validIds)
        cql = joinWithOr([validItemsCql, cql])
      }
    } else {
      cql = getResultSetCql(resultIds)
    }
    return cql
  }

  onExportClick = async (addSnack: AddSnack) => {
    const uriEncodedTransformerId = this.getSelectedExportFormatId()

    try {
      console.log(this.state.loading)
      this.setState({ loading: true })
      console.log(this.state.loading)

      if (uriEncodedTransformerId === undefined) {
        return
      }

      let response = null
      const count = this.props.results.length
      const cql = this.getExportCql()

      const srcs = Array.from(this.getResultSources())
      const searches = [
        {
          srcs,
          cql,
          count,
        },
      ]
      const columnOrder = OverridableGetColumnOrder.get()()
      if (this.props.isZipped) {
        response = await exportResultSet('zipCompression', {
          searches,
          count,
          sorts: [],
          args: {
            transformerId: uriEncodedTransformerId,
          },
        })
      } else {
        response = await exportResultSet(uriEncodedTransformerId, {
          searches,
          count,
          sorts: this.props.lazyQueryResults?.transformSorts({
            originalSorts: this.props.lazyQueryResults?.persistantSorts,
          }),
          args: {
            hiddenFields: [],
            columnOrder: columnOrder,
            columnAliasMap:
              StartupDataStore.Configuration.config?.attributeAliases || {},
          },
        })
      }

      if (response.status === 200) {
        const filename = contentDisposition.parse(
          response.headers.get('content-disposition')
        ).parameters.filename
        const contentType = response.headers.get('content-type')
        const data = await response.blob()
        OverridableSaveFile.get()(filename, 'data:' + contentType, data)
        this.setExportSuccessful(true)
        this.onClose()
      } else {
        this.setState({ exportSuccessful: false })
        this.setState({ loading: false })
        addSnack('Error: Could not export results.', {
          alertProps: { severity: 'error' },
        })
      }
    } catch (error) {
      console.error(error)
      this.setState({ exportSuccessful: false })
      this.setState({ loading: false })
    } finally {
      this.setState({ loading: false })
    }
  }

  handleExportOptionChange(name: string) {
    this.setState({
      selectedFormat: name,
      exportDisabled: false,
    })
  }
  render() {
    return (
      <ResultsExportComponent
        selectedFormat={this.state.selectedFormat}
        exportFormats={this.state.exportFormats}
        exportDisabled={this.state.exportDisabled}
        onExportClick={this.onExportClick.bind(this)}
        handleExportOptionChange={this.handleExportOptionChange.bind(this)}
        onClose={this.onClose.bind(this)}
        loading={this.state.loading}
        setLoading={this.setLoading.bind(this)}
        exportSuccessful={this.state.exportSuccessful}
        setExportSuccessful={this.setLoading.bind(this)}
      />
    )
  }
}

export default hot(module)(withListenTo(ResultsExport))
