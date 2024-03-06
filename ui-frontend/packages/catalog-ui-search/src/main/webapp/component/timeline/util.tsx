import * as d3 from 'd3'
import moment, { Moment } from 'moment-timezone'
import { TimelineItem } from './timeline'
import user from '../singletons/user-instance'

/** Python's "range" function */
export const range = (n: number) => Array.from(Array(n).keys())

const getDataPoint = (
  num: number,
  createdYear: number,
  modifiedYear: number,
  publishedYear: number
) => {
  const month = Math.floor(Math.random() * 12)
  const year = Math.floor(Math.random() * 40)
  const day = Math.floor(Math.random() * 28)

  return {
    id: `Result ${(num + 1).toString()}`,
    selected: false,
    attributes: {
      created: [
        moment(new Date(createdYear + year, 0, 1))
          .add(month, 'months')
          .add(day, 'days'),
      ],

      modified: [moment(new Date(modifiedYear + year, 0, 1))],

      published_date: [
        moment(new Date(publishedYear + year, 0, 1)).add(day, 'days'),
      ],
    },
  }
}

export const createTestData = (n: number): TimelineItem[] => {
  if (typeof n !== 'number' || n < 1) {
    return []
  }

  return range(n).map((num) => getDataPoint(num, 1980, 1983, 1987))
}

export const formatDate = (value: Moment, format: string) =>
  value.format(format)

export const convertToDisplayable = (
  value: Moment,
  timezone: string,
  format: string
) => moment(value).tz(timezone).format(format)

export const dateWithinRange = (date: Moment, range: Moment[]) =>
  range[0] < date && date < range[1]

const is12HourFormat = (format: string) => format.includes('h')

const timeFormat = (format: string) => {
  return (date: Date) => moment(date).tz(user.getTimeZone()).format(format)
}

const formatMillisecond = timeFormat(':SSS')
const formatSecond = timeFormat(':ss')
const formatDay = timeFormat('ddd DD')
const formatWeek = timeFormat('MMM DD')
const formatMonth = timeFormat('MMMM')
const formatYear = timeFormat('YYYY')

export const multiFormat = (date: Date) => {
  if (d3.utcSecond(date) < date) {
    return formatMillisecond(date) // milliseconds :259
  } else if (d3.utcMinute(date) < date) {
    return formatSecond(date) // seconds :59
  } else if (d3.utcHour(date) < date) {
    const formatMinute = is12HourFormat(user.getDateTimeFormat())
      ? timeFormat('hh:mm')
      : timeFormat('HH:mm')
    return formatMinute(date) // 12:00
  } else if (d3.utcDay(date) < date) {
    const formatHour = is12HourFormat(user.getDateTimeFormat())
      ? timeFormat('hh A')
      : timeFormat('HH:mm')
    return formatHour(date) // 12 AM or 12:00
  } else if (d3.utcMonth(date) < date) {
    if (d3.utcWeek(date) < date) {
      return formatDay(date) // Wed 08
    } else {
      return formatWeek(date) // Feb 08
    }
  } else if (d3.utcYear(date) < date) {
    return formatMonth(date) // February
  } else {
    return formatYear(date) // 2003
  }
}
