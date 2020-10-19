//DELETE AFTER CATALOG-UI-SEARCH CUT
import * as React from 'react'
import { hot } from 'react-hot-loader'
import moment from 'moment'
//@ts-ignore
import withListenTo, {
  WithBackboneProps,
  //@ts-ignore
} from '../backbone-container'

import TimeSettingsPresentation from './presentation'
import { TimeZone, TimeFormat } from './types'

import momentTimezone from 'moment-timezone'
const user = require('../../component/singletons/user-instance')

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

const getCurrentTimeZone = () => getUserPreferences().get('timeZone')

const getCurrentTime = (
  format: string = getCurrentDateTimeFormat(),
  timeZone: string = getCurrentTimeZone()
) => momentTimezone.tz(moment(), timeZone).format(format)

const generateZoneObjects = (): TimeZone[] => {
  const zoneNames = momentTimezone.tz.names()
  const zones = zoneNames.map((zoneName: string) => {
    const date = new Date()

    const timestamp = date.getTime()
    const zone = momentTimezone.tz.zone(zoneName)
    const zonedDate = momentTimezone.tz(timestamp, zoneName)
    const offsetAsString = zonedDate.format('Z')
    //@ts-ignore
    const abbr = zone.abbr(timestamp)

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
      timeFormat: getCurrentDateTimeFormat(),
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
        savePreferences({ dateTimeFormat: timeFormat.value })
      }}
      timeFormat={this.state.timeFormat}
    />
  )
}

export default hot(module)(withListenTo(TimeSettingsContainer))
