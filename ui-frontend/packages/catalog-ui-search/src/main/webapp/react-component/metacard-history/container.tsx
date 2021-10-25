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
const Common = require('../../js/Common.js')
const moment = require('moment')
const user = require('../../component/singletons/user-instance.js')
import MetacardHistoryPresentation from './presentation'
import MetacardDiff from '../metacard-diff'
const lightboxInstance = require('../../component/lightbox/lightbox.view.instance.js')
const ResultUtils = require('../../js/ResultUtils.js')
const announcement = require('component/announcement')

type Props = {
  selectionInterface: any
}

type State = {
  history: any
  selectedVersions: any
  loading: boolean
}

class MetacardHistory extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const selectionInterface = props.selectionInterface
    this.model = selectionInterface.getSelectedResults().first()

    this.state = {
      history: [],
      selectedVersions: [],
      loading: true,
    }
  }
  model: Backbone.Model
  componentDidMount() {
    this.loadData()
  }

  getSourceId() {
    const metacardSourceId = this.model
      .get('metacard')
      .get('properties')
      .get('source-id')
    const harvestedSourceId = this.model
      .get('metacard')
      .get('properties')
      .get('ext.harvested-from')
    return harvestedSourceId || metacardSourceId
  }

  loadData() {
    setTimeout(async () => {
      const id = this.model.get('metacard').get('id')
      const res = await fetch(`./internal/history/${id}/${this.getSourceId()}`)

      if (!res.ok || res.status === 204) {
        this.setState({ history: [], loading: false })
        return
      }

      const history = await res.json()
      history.sort((historyItem1: any, historyItem2: any) => {
        return (
          moment.unix(historyItem2.versioned.seconds) -
          moment.unix(historyItem1.versioned.seconds)
        )
      })
      history.forEach((historyItem: any, index: any) => {
        historyItem.niceDate = Common.getMomentDate(
          moment.unix(historyItem.versioned.seconds).valueOf()
        )
        historyItem.versionNumber = history.length - index
      })

      this.setState({ history, loading: false })
    }, 1000)
  }

  onCheck = (event: any) => {
    const itemId = event.currentTarget.getAttribute('data-id')
    const selected = event.target.checked
    const items = this.state.selectedVersions
    if (selected) {
      items.push(itemId)
    } else {
      items.splice(items.indexOf(itemId), 1)
    }
    if (items.length > 2) {
      items.shift()
    }
    this.setState({ selectedVersions: items })
  }

  diffVersions = async () => {
    const id = this.model.get('metacard').get('id')
    const items = this.state.selectedVersions
    let base = items[0]
    let change = id
    if (items.length > 1) {
      //figure out which one is older
      if (this.getHistoryIndex(items[0]) > this.getHistoryIndex(items[1])) {
        change = items[1]
      } else {
        base = items[1]
        change = items[0]
      }
    }
    const baseHistory = this.state.history[this.getHistoryIndex(base)]
    const changeHistory = this.state.history[this.getHistoryIndex(change)]
    lightboxInstance.model.updateTitle('Comparing Versions')
    lightboxInstance.model.open()
    lightboxInstance.showContent(
      <MetacardDiff
        sourceId={this.getSourceId()}
        baseInfo={{
          id: base,
          version:
            'Version: ' +
            baseHistory.versionNumber +
            ' - ' +
            baseHistory.niceDate,
        }}
        changeInfo={{
          id: change,
          version:
            id == change
              ? 'Version: Current'
              : 'Version: ' +
                changeHistory.versionNumber +
                ' - ' +
                changeHistory.niceDate,
        }}
        canRevert={user.canWrite(this.model) && id == change}
        revert={() => {
          this.revertToSelectedVersion(base)
        }}
      />
    )
  }

  getHistoryIndex = (item: any) => {
    let index = -1
    this.state.history.find((curValue: any, curIndex: number) => {
      if (curValue.id == item) {
        index = curIndex
        return true
      }
      return false
    })
    return index
  }

  revertToSelectedVersion = async (revertId: any) => {
    this.setState({ loading: true })

    const id = this.model.get('metacard').get('id')
    lightboxInstance.model.close()
    const res = await fetch(
      `./internal/history/revert/${id}/${revertId}/${this.getSourceId()}`
    )

    if (!res.ok) {
      this.setState({ loading: false })
      announcement.announce({
        title: 'Unable to revert to the selected version',
        message: 'Something went wrong.',
        type: 'error',
      })
      return
    }

    this.model
      .get('metacard')
      .get('properties')
      .set('metacard-tags', ['revision'])
    ResultUtils.refreshResult(this.model)

    setTimeout(() => {
      //let solr flush
      this.model.trigger('refreshdata')
      if (
        this.model
          .get('metacard')
          .get('properties')
          .get('metacard-tags')
          .indexOf('revision') >= 0
      ) {
        announcement.announce({
          title: 'Waiting on Reverted Data',
          message: [
            "It's taking an unusually long time for the reverted data to come back.",
            'The item will be put in a revision-like state (read-only) until data returns.',
          ],
          type: 'warn',
        })
      }
      this.loadData()
    }, 2000)
  }

  render() {
    const { history, selectedVersions, loading } = this.state
    return (
      <MetacardHistoryPresentation
        onCheck={this.onCheck}
        diffVersions={this.diffVersions}
        history={history}
        selectedVersions={selectedVersions}
        loading={loading}
        canEdit={user.canWrite(this.model)}
      />
    )
  }
}

export default hot(module)(MetacardHistory)
