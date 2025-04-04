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

import { includes } from 'lodash'

import { getLevels } from './levels'
const levels = getLevels()

// returns a single object created from an array of objects
// the keys in the return object are each array object's key's value
// arrayToObject('a', [{a:b}]) => {b:{a:b}}
const arrayToObject = (key: any, array: any) => {
  return array.reduce((o: any, element: any) => {
    o[element[key]] = element
    return o
  }, {})
}

// filter logic for log level and regex matching.
// also adds <mark/> tags for filter highlighting
export default (filters: any, logs: any) => {
  const level = filters.level || 'ALL'

  const fields = Object.keys(filters).filter((field) => {
    return field !== 'level' && filters[field] !== ''
  })

  const regexps = fields.reduce((o: any, field: any) => {
    try {
      o[field] = new RegExp(filters[field], 'i')
    } catch (e) {
      // do nothing
    }
    return o
  }, {})

  // fields that have a valid regex
  const validFields = Object.keys(regexps)

  const hasMarks = (row: any) => {
    return Object.keys(row.marks).length === validFields.length
  }

  const getMarks = (entry: any) => {
    var marks = validFields
      // @ts-ignore
      .map((field: any) => {
        if (entry[field]) {
          var match = entry[field].match(regexps[field])
          if (match !== null) {
            return {
              field: field,
              start: match.index,
              end: match[0].length + match.index,
            }
          }
        }
      })
      .filter((m: any) => {
        return m !== undefined
      })

    return {
      entry: entry,
      marks: arrayToObject('field', marks),
    }
  }

  const levelLogs = logs
    .filter((entry: any) => {
      return (
        level === 'ALL' ||
        includes(levels.slice(levels.indexOf(level)), entry.level)
      )
    })
    .map(getMarks)

  return fields.length > 0 ? levelLogs.filter(hasMarks) : levelLogs
}
