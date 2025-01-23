import * as React from 'react'

import withListenTo, { WithBackboneProps } from '../backbone-container'

import TimeSettingsPresentation from './presentation'
import { TimeZone, TimeFormat } from './types'
import { TimePrecision } from '@blueprintjs/datetime'

import momentTimezone from 'moment-timezone'
import user from '../../component/singletons/user-instance'
import Common from '../../js/Common'
import { DateHelpers } from '../../component/fields/date-helpers'

type UserPreferences = {
  get: (key: string) => any
  set: ({}) => void
  savePreferences: () => void
}

type State = {
  currentTime: string
  timeZones: TimeZone[]
  timeZone: string
  timeFormat: string
  timePrecision: TimePrecision
}

const getUserPreferences = (): UserPreferences => {
  return user.get('user').get('preferences')
}

const savePreferences = (model: {}) => {
  const nullOrUndefinedValues = !Object.values(model).every((value) => !!value)
  if (nullOrUndefinedValues) return

  const preferences = getUserPreferences()
  preferences.set(model)
  preferences.savePreferences()
}

const getCurrentDateTimeFormat = () =>
  getUserPreferences().get('dateTimeFormat').datetimefmt

const getCurrentTimePrecision = DateHelpers.General.getTimePrecision

const getCurrentTimeZone = () => getUserPreferences().get('timeZone')

const getCurrentTime = (
  format: string = getCurrentDateTimeFormat(),
  timeZone: string = getCurrentTimeZone()
) => momentTimezone.tz(momentTimezone(), timeZone).format(format)

const generateZoneObjects = (): TimeZone[] => {
  const zoneNames = momentTimezone.tz.names()
  const zones = zoneNames.map((zoneName: string) => {
    const date = new Date()

    const timestamp = date.getTime()
    const zone = momentTimezone.tz.zone(zoneName)
    const zonedDate = momentTimezone.tz(timestamp, zoneName)
    const offsetAsString = zonedDate.format('Z')
    const abbr = zone?.abbr(timestamp) || ''

    return {
      timestamp: timestamp,
      zone: zone,
      zonedDate: zonedDate,
      offsetAsString: offsetAsString,
      abbr: abbr,
      zoneName: zoneName,
    }
  })

  return zones
}

class TimeSettingsContainer extends React.Component<WithBackboneProps, State> {
  timer: any
  constructor(props: WithBackboneProps) {
    super(props)

    this.state = {
      currentTime: getCurrentTime(),
      timeZones: generateZoneObjects(),
      timeZone: getCurrentTimeZone(),
      timeFormat:
        Common.getDateTimeFormatsReverseMap()[getCurrentDateTimeFormat()]
          .format,
      timePrecision: getCurrentTimePrecision(),
    }
  }

  componentDidMount = () => {
    const updateCurrentTimeClock = () => {
      this.setState({ currentTime: getCurrentTime() })
    }

    this.timer = setInterval(updateCurrentTimeClock, 50)
  }

  componentWillUnmount = () => {
    clearInterval(this.timer)
  }

  render = () => (
    <TimeSettingsPresentation
      {...this.props}
      currentTime={this.state.currentTime}
      timeZone={this.state.timeZone}
      timeZones={this.state.timeZones}
      handleTimeZoneUpdate={(timeZone: TimeZone) => {
        savePreferences({ timeZone: timeZone.zoneName })
      }}
      handleTimeFormatUpdate={(timeFormat: TimeFormat) => {
        this.setState({ timeFormat: timeFormat.value })
        const dateTimeFormat =
          Common.getDateTimeFormats()[timeFormat.value][
            this.state.timePrecision
          ]
        savePreferences({ dateTimeFormat })
      }}
      timeFormat={this.state.timeFormat}
      handleTimePrecisionUpdate={(timePrecision: TimePrecision) => {
        this.setState({ timePrecision })
        const dateTimeFormat =
          Common.getDateTimeFormats()[this.state.timeFormat][timePrecision]
        savePreferences({ dateTimeFormat })
      }}
      timePrecision={this.state.timePrecision}
    />
  )
}

export default withListenTo(TimeSettingsContainer)
