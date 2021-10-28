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

import { hot } from 'react-hot-loader'
import * as React from 'react'
import fetch from '../utils/fetch'

import MetacardDiffPresentation from './presentation'
import TypedMetacardDefs from '../../component/tabs/metacard/metacardDefinitions'

type Props = {
  sourceId: any
  baseInfo: any
  changeInfo: any
  canRevert: boolean
  revert: () => void
}

type State = {
  diffData: any
  loading: boolean
  showAll: boolean
}

class MetacardDiff extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      diffData: [],
      loading: true,
      showAll: false,
    }
  }
  model: Backbone.Model
  componentDidMount() {
    this.loadData()
  }

  toggleShowAll = async () => {
    this.setState({ showAll: !this.state.showAll })
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.baseInfo != this.props.baseInfo ||
      prevProps.changeInfo != this.props.changeInfo
    ) {
      this.setState({
        diffData: [],
        loading: true,
        showAll: false,
      })
      this.loadData()
    }
  }

  loadData() {
    setTimeout(async () => {
      const base = this.props.baseInfo.id
      const change = this.props.changeInfo.id
      const res = await fetch(
        `./internal/history/diff/${base}/${change}/${this.props.sourceId}`
      )

      if (!res.ok || res.status === 204) {
        this.setState({ diffData: [], loading: false })
        return
      }

      const diffData = await res.json()
      const fullData = []
      for (let key in diffData.matching) {
        fullData.push({
          name: TypedMetacardDefs.getAlias({
            attr: key,
          }),
          base: diffData.matching[key],
          change: diffData.matching[key],
          isDiff: false,
        })
      }
      diffData.changes.forEach((change: any) => {
        change.isDiff = true
        change.name = TypedMetacardDefs.getAlias({
          attr: change.name,
        })

        fullData.push(change)
      })
      fullData.sort((att1: any, att2: any) => {
        return att1.name.toLowerCase().localeCompare(att2.name.toLowerCase())
      })
      this.setState({ diffData: fullData, loading: false })
    }, 1000)
  }

  render() {
    const { diffData, loading, showAll } = this.state
    return (
      <MetacardDiffPresentation
        toggleShowAll={this.toggleShowAll}
        revertToSelectedVersion={this.props.revert}
        canRevert={this.props.canRevert}
        diffData={diffData}
        baseInfo={this.props.baseInfo}
        changeInfo={this.props.changeInfo}
        loading={loading}
        showAll={showAll}
      />
    )
  }
}

export default hot(module)(MetacardDiff)
