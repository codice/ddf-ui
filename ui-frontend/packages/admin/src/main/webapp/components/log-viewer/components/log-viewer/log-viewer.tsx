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

import React from 'react'
// @ts-ignore
import VisibilitySensor from 'react-visibility-sensor'

import LevelSelector from '../level-selector/level-selector'
import TextFilter from '../text-filter/text-filter'
import LogEntry from '../log-entry/log-entry'
import * as actions from '../../actions'
import filterLogs from '../../filter'
import PollingButton from '../polling-button/polling-button'
import ErrorMessage from '../error-message/error-message'
import { Divider } from '@material-ui/core'

export default ({
  dispatch,
  expandedHash,
  displaySize,
  logs,
  filter,
}: {
  dispatch: any
  expandedHash: any
  displaySize: any
  logs: any
  filter: any
}) => {
  const filteredLogs = filterLogs(filter, logs)

  const displayedLogs = filteredLogs
    .slice(0, displaySize)
    .map((row: any, i: any) => {
      return (
        <LogEntry
          key={i}
          entry={row.entry}
          marks={row.marks}
          expandedHash={expandedHash}
          dispatch={dispatch}
        />
      )
    })

  // grow the log display when the bottom is reached
  const growLogs = (isVisible: any) => {
    if (isVisible) {
      dispatch(actions.grow())
    }
  }

  // show loading bar is there are more logs, hide if the end is reached
  // @ts-ignore
  const loading = () => {
    if (filteredLogs.length > 0 && displayedLogs.length < filteredLogs.length) {
      return (
        <VisibilitySensor
          onChange={growLogs}
          partialVisibility={Boolean(true)}
          delay={200}
        >
          <div className="text-2xl text-center p-3">Loading...</div>
        </VisibilitySensor>
      )
    }
  }

  const select = (level: string) => {
    // @ts-ignore
    dispatch(actions.filter({ level: level }))
  }

  const textFilter = (field: any) => {
    const on = (filterObject: any) => {
      dispatch(actions.filter(filterObject))
    }

    return <TextFilter field={field} value={filter[field]} onChange={on} />
  }

  const deselect = () => {
    // @ts-ignore
    dispatch(actions.expandEntry())
  }

  return (
    <div className="p-4">
      <div className="w-full relative z-1 ">
        <table
          className="border-collapse table-fixed w-full"
          onClick={deselect}
        >
          <thead>
            <tr>
              <td className="p-2" style={{ width: '175px' }}>
                Time
              </td>
              <td className="p-2" style={{ width: '90px' }}>
                Level
              </td>
              <td className="p-2">Message</td>
              <td className="p-2" style={{ width: '200px' }}>
                Bundle
              </td>
            </tr>
            <tr>
              <td className="p-2">
                <PollingButton />
              </td>
              <td className="p-2">
                <LevelSelector selected={filter.level} onSelect={select} />
              </td>
              <td className="p-2">{textFilter('message')}</td>
              <td className="p-2">{textFilter('bundleName')}</td>
            </tr>
          </thead>
        </table>
        <ErrorMessage />
      </div>
      <Divider />
      <div className="overflow-y-auto overflow-x-hidden">
        <table
          className={`border-collapse table-fixed w-full ${
            expandedHash ? 'dimUnselected' : ''
          }`}
        >
          <tbody>{displayedLogs}</tbody>
        </table>
        {loading()}
      </div>
    </div>
  )
}
