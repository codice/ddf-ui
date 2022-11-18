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
const moment = require('moment')
import MetacardHistoryPresentation from './presentation'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { TypedUserInstance } from '../../component/singletons/TypedUser'
import Common from '../../js/Common'
const wreqr = require('../../js/wreqr.js')

type Props = {
  result: LazyQueryResult
}

type State = {
  history: any
  selectedVersion: any
  loading: boolean
}

class MetacardHistory extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.model = props.result

    this.state = {
      history: [],
      selectedVersion: undefined,
      loading: true,
    }
  }
  model: LazyQueryResult
  componentDidMount() {
    this.loadData()
  }

  getSourceId() {
    const metacardSourceId = this.model.plain.metacard.properties['source-id']
    const harvestedSourceId = this.model.plain.metacard.properties[
      'ext.harvested-from'
    ]
    return harvestedSourceId || metacardSourceId
  }

  loadData() {
    setTimeout(async () => {
      const id = this.model.plain.id
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

  onClick = (event: any) => {
    const selectedVersion = event.currentTarget.getAttribute('data-id')
    this.setState({ selectedVersion })
  }

  revertToSelectedVersion = async () => {
    this.setState({ loading: true })

    const id = this.model.plain.id
    const revertId = this.state.selectedVersion

    const res = await fetch(
      `./internal/history/revert/${id}/${revertId}/${this.getSourceId()}`
    )

    if (!res.ok) {
      this.setState({ loading: false })
      wreqr.vent.trigger('snack', {
        message: 'Unable to revert to the selected version',
        snackProps: {
          alertProps: {
            severity: 'error',
          },
        },
      })
      return
    }

    this.model.plain.metacard.properties['metacard-tags'] = ['revision']
    this.model.syncWithPlain()
    this.model.refreshDataOverNetwork()

    setTimeout(() => {
      //let solr flush
      this.model.syncWithPlain()
      if (
        this.model.plain.metacard.properties['metacard-tags'].indexOf(
          'revision'
        ) >= 0
      ) {
        wreqr.vent.trigger('snack', {
          message: `Waiting on Reverted Data: It's taking an unusually long time for the reverted data to come back.  The item will be put in a revision-like state (read-only) until data returns.`,
          snackProps: {
            alertProps: {
              severity: 'warn',
            },
          },
        })
      }
      this.loadData()
    }, 2000)
  }

  render() {
    const { history, selectedVersion, loading } = this.state
    return (
      <MetacardHistoryPresentation
        onClick={this.onClick}
        revertToSelectedVersion={this.revertToSelectedVersion}
        history={history}
        selectedVersion={selectedVersion}
        loading={loading}
        canEdit={TypedUserInstance.canWrite(this.model)}
      />
    )
  }
}

export default hot(module)(MetacardHistory)
