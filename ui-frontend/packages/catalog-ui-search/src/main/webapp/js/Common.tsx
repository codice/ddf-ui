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
/*jshint bitwise: false*/
import $ from 'jquery'
import moment from 'moment'
import './requestAnimationFramePolyfill'
import { TimePrecision } from '@blueprintjs/datetime'
import { cacheBustUrl } from './cache-bust-url'
const timeZones = {
  UTC: 'Etc/UTC',
  '-12': 'Etc/GMT+12',
  '-11': 'Etc/GMT+11',
  '-10': 'Etc/GMT+10',
  '-9': 'Etc/GMT+9',
  '-8': 'Etc/GMT+8',
  '-7': 'Etc/GMT+7',
  '-6': 'Etc/GMT+6',
  '-5': 'Etc/GMT+5',
  '-4': 'Etc/GMT+4',
  '-3': 'Etc/GMT+3',
  '-2': 'Etc/GMT+2',
  '-1': 'Etc/GMT+1',
  1: 'Etc/GMT-1',
  2: 'Etc/GMT-2',
  3: 'Etc/GMT-3',
  4: 'Etc/GMT-4',
  5: 'Etc/GMT-5',
  6: 'Etc/GMT-6',
  7: 'Etc/GMT-7',
  8: 'Etc/GMT-8',
  9: 'Etc/GMT-9',
  10: 'Etc/GMT-10',
  11: 'Etc/GMT-11',
  12: 'Etc/GMT-12',
}
const dateTimeFormats = {
  ISO: {
    millisecond: {
      datetimefmt: 'YYYY-MM-DD[T]HH:mm:ss.SSSZ',
      timefmt: 'HH:mm:ssZ',
    },
    second: { datetimefmt: 'YYYY-MM-DD[T]HH:mm:ssZ', timefmt: 'HH:mm:ssZ' },
    minute: { datetimefmt: 'YYYY-MM-DD[T]HH:mmZ', timefmt: 'HH:mmZ' },
  },
  '24': {
    millisecond: {
      datetimefmt: 'DD MMM YYYY HH:mm:ss.SSS Z',
      timefmt: 'HH:mm:ss Z',
    },
    second: {
      datetimefmt: 'DD MMM YYYY HH:mm:ss Z',
      timefmt: 'HH:mm:ss Z',
    },
    minute: {
      datetimefmt: 'DD MMM YYYY HH:mm Z',
      timefmt: 'HH:mm Z',
    },
  },
  '12': {
    millisecond: {
      datetimefmt: 'DD MMM YYYY hh:mm:ss.SSS a Z',
      timefmt: 'hh:mm:ss a Z',
    },
    second: {
      datetimefmt: 'DD MMM YYYY hh:mm:ss a Z',
      timefmt: 'hh:mm:ss a Z',
    },
    minute: {
      datetimefmt: 'DD MMM YYYY hh:mm a Z',
      timefmt: 'hh:mm a Z',
    },
  },
} as {
  [key: string]: {
    [key in keyof TimePrecision as TimePrecision]: {
      datetimefmt: string
      timefmt: string
    }
  }
}
const dateTimeFormatsReverseMap = Object.entries(dateTimeFormats).reduce(
  (map, val) => {
    const format = val[0]
    for (const [precision, formats] of Object.entries(val[1])) {
      map[formats.datetimefmt] = {
        format,
        precision: precision as TimePrecision,
      }
    }
    return map
  },
  {} as { [key: string]: { format: string; precision: TimePrecision } }
)
const timeFormatsReverseMap = Object.entries(dateTimeFormats).reduce(
  (map, val) => {
    const format = val[0]
    for (const [precision, formats] of Object.entries(val[1])) {
      map[formats.timefmt] = { format, precision: precision as TimePrecision }
    }
    return map
  },
  {} as { [key: string]: { format: string; precision: TimePrecision } }
)
export const Common = {
  //randomly generated guid guaranteed to be unique ;)
  undefined: '2686dcb5-7578-4957-974d-aaa9289cd2f0',
  coreTransitionTime: 250,
  cqlToHumanReadable(cql?: string) {
    if (cql === undefined) {
      return cql
    }
    cql = cql.replace(new RegExp('anyText ILIKE ', 'g'), '~')
    cql = cql.replace(new RegExp('anyText LIKE ', 'g'), '')
    cql = cql.replace(new RegExp('AFTER', 'g'), '>')
    cql = cql.replace(new RegExp('DURING', 'g'), 'BETWEEN')
    return cql
  },
  getFileSize(item?: string) {
    if (item === undefined || item === null) {
      return 'Unknown Size'
    }
    const givenProductSize = item?.replace(/[,]+/g, '').trim() || ''
    //remove any commas and trailing whitespace
    const bytes = parseInt(givenProductSize, 10)
    const noUnitsGiven = /[0-9]$/
    //number without a word following
    const reformattedProductSize = givenProductSize.replace(/\s\s+/g, ' ')
    //remove extra whitespaces
    const finalFormatProductSize = reformattedProductSize.replace(
      /([0-9])([a-zA-Z])/g,
      '$1 $2'
    )
    //make sure there is exactly one space between number and unit
    const sizeArray = finalFormatProductSize.split(' ')
    //splits size into number and unit
    if (isNaN(bytes)) {
      return 'Unknown Size'
    }
    if (noUnitsGiven.test(givenProductSize)) {
      //need to parse number given and add units, number is assumed to be bytes
      let size,
        index,
        type = ['bytes', 'KB', 'MB', 'GB', 'TB']
      if (bytes === 0) {
        return '0 bytes'
      } else {
        index = Math.floor(Math.log(bytes) / Math.log(1024))
        if (index > 4) {
          index = 4
        }
        size = (bytes / Math.pow(1024, index)).toFixed(index < 2 ? 0 : 1)
      }
      return size + ' ' + type[index]
    } else {
      //units were included with size
      switch (sizeArray[1].toLowerCase()) {
        case 'bytes':
          return sizeArray[0] + ' bytes'
        case 'b':
          return sizeArray[0] + ' bytes'
        case 'kb':
          return sizeArray[0] + ' KB'
        case 'kilobytes':
          return sizeArray[0] + ' KB'
        case 'kbytes':
          return sizeArray[0] + ' KB'
        case 'mb':
          return sizeArray[0] + ' MB'
        case 'megabytes':
          return sizeArray[0] + ' MB'
        case 'mbytes':
          return sizeArray[0] + ' MB'
        case 'gb':
          return sizeArray[0] + ' GB'
        case 'gigabytes':
          return sizeArray[0] + ' GB'
        case 'gbytes':
          return sizeArray[0] + ' GB'
        case 'tb':
          return sizeArray[0] + ' TB'
        case 'terabytes':
          return sizeArray[0] + ' TB'
        case 'tbytes':
          return sizeArray[0] + ' TB'
        default:
          return 'Unknown Size'
      }
    }
  },
  //can be deleted once histogram changes are merged
  getHumanReadableDateTime(date: string) {
    return moment(date).format(dateTimeFormats['24']['second']['datetimefmt'])
  },
  getDateTimeFormats() {
    return dateTimeFormats
  },
  getDateTimeFormatsReverseMap() {
    return dateTimeFormatsReverseMap
  },
  getTimeFormatsReverseMap() {
    return timeFormatsReverseMap
  },
  getTimeZones() {
    return timeZones
  },
  getRelativeDate(date: string) {
    return `${moment(date).fromNow()}`
  },
  getImageSrc(img: string) {
    if (
      typeof img === 'string' &&
      (img === '' || img.substring(0, 4) === 'http')
    )
      return cacheBustUrl(img)
    return 'data:image/png;base64,' + img
  },
  getResourceUrlFromThumbUrl(url: string) {
    return url.replace(/=thumbnail[_=&\d\w\s;]+/, '=resource')
  },
  cancelRepaintForTimeframe(requestDetails: any) {
    if (requestDetails) {
      window.cancelAnimationFrame(requestDetails.requestId)
    }
  },
  repaintForTimeframe(time: any, callback: any) {
    const requestDetails = {
      requestId: undefined,
    } as any
    const timeEnd = Date.now() + time
    const repaint = function () {
      callback()
      if (Date.now() < timeEnd) {
        requestDetails.requestId = window.requestAnimationFrame(() => {
          repaint()
        })
      }
    }
    requestDetails.requestId = window.requestAnimationFrame(() => {
      repaint()
    })
    return requestDetails
  },
  escapeHTML(value: string) {
    return $('<div>').text(value).html()
  },
  wrapMapCoordinates(x: number, [min, max]: [number, number]) {
    const d = max - min
    return ((((x - min) % d) + d) % d) + min
  },
  wrapMapCoordinatesArray(coordinates: Array<[number, number]>) {
    return coordinates.map(([lon, lat]) => [
      this.wrapMapCoordinates(lon, [-180, 180]),
      this.wrapMapCoordinates(lat, [-90, 90]),
    ])
  },
}
export default Common
