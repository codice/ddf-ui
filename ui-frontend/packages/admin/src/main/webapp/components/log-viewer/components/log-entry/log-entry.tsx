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
import moment from 'moment'
import { connect } from 'react-redux'

import { getColorForLevel } from '../../levels'
import * as actions from '../../actions'

const format = (time: any) => {
  return moment(time).format('D MMM YYYY, HH:mm:ss')
}

// log entry to display
export const LogEntry = ({
  entry,
  marks,
  expandedHash,
  dispatch,
  isPolling,
}: {
  entry: any
  marks: any
  expandedHash: any
  dispatch: any
  isPolling: any
}) => {
  // check if marks exist for filter highlighting
  const tryMark = (key: any) => {
    const mark = marks[key]
    const displayString = entry[key]
    if (mark) {
      const first = displayString.slice(0, mark.start)
      const second = displayString.slice(mark.start, mark.end)
      const third = displayString.slice(mark.end)
      return (
        <span>
          <span className="dim">{first}</span>
          <mark>{second}</mark>
          <span className="dim">{third}</span>
        </span>
      )
    } else {
      return <span>{displayString}</span>
    }
  }

  const expandEntry = () => {
    if (isPolling) {
      dispatch(actions.togglePolling())
    }
    dispatch(actions.expandEntry(entry.hash))
  }

  const colorClassForLevel = getColorForLevel(entry.level)
  const isExpanded = entry.hash === expandedHash
  const hasExpanded = expandedHash !== null
  return (
    <tr
      onClick={expandEntry}
      className={`cursor-pointer border-b border-gray-300 relative animate-slideAnimation ${colorClassForLevel} ${
        isExpanded ? 'selectedRow' : ''
      } ${hasExpanded && !isExpanded ? 'opacity-60' : ''}`}
    >
      <td className="break-words p-1" style={{ width: '175px' }}>
        {format(entry.timestamp)}
      </td>
      <td className="break-words p-1" style={{ width: '90px' }}>
        {entry.level}
      </td>
      <td
        className={`break-words p-1 ${
          isExpanded ? ' whitespace-normal' : ' truncate w-full'
        }`}
      >
        {tryMark('message')}
      </td>
      <td className="break-words p-1" style={{ width: '200px' }}>
        {tryMark('bundleName')}
      </td>
    </tr>
  )
}

const mapStateToProps = ({ isPolling }: { isPolling: any }) => ({ isPolling })

export default connect(mapStateToProps, {})(LogEntry)
