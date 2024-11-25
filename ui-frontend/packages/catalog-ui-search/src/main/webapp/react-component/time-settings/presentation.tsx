import * as React from 'react'
import { hot } from 'react-hot-loader'
import styled from 'styled-components'

import TimeZoneSelector from './time-zone-picker'
import TimeFormatSelector from './time-format-picker'
import TimePrecisionSelector from './time-precision-picker'
import { TimeZone, TimeFormat } from './types'
import { TimePrecision } from '@blueprintjs/datetime'

const Root = styled.div`
  overflow: auto;
  padding: ${(props: any) => props.theme.minimumSpacing};
`

const Time = styled.div`
  width: 100%;
  font-weight: bolder;
  padding-top: ${(props: any) => props.theme.minimumSpacing};
  padding-right: ${(props: any) => props.theme.minimumSpacing};
  padding-bottom: ${(props: any) => props.theme.minimumSpacing};
  padding-left: ${(props: any) => props.theme.minimumSpacing};
`

const TimeLabel = styled.div`
  padding-top: ${(props: any) => props.theme.minimumSpacing};
  padding-bottom: ${(props: any) => props.theme.minimumSpacing};
`

const TimeValue = styled.div`
  padding-top: ${(props: any) => props.theme.minimumSpacing};
  padding-left: ${(props: any) => props.theme.minimumSpacing};
`

type Props = {
  currentTime: string
  timeZone: string
  timeFormat: string
  timeZones: TimeZone[]
  timePrecision: TimePrecision
  handleTimeZoneUpdate: (timeZone: TimeZone) => any
  handleTimeFormatUpdate: (timeFormat: TimeFormat) => any
  handleTimePrecisionUpdate: (timePrecision: TimePrecision) => any
}

class TimeSettingsPresentation extends React.Component<Props, {}> {
  render = () => {
    return (
      <Root {...this.props}>
        <TimeZoneSelector
          timeZone={this.props.timeZone}
          timeZones={this.props.timeZones}
          handleTimeZoneUpdate={this.props.handleTimeZoneUpdate}
        />
        <TimeFormatSelector
          timeFormat={this.props.timeFormat}
          handleTimeFormatUpdate={this.props.handleTimeFormatUpdate}
        />
        <TimePrecisionSelector
          timePrecision={this.props.timePrecision}
          handleTimePrecisionUpdate={this.props.handleTimePrecisionUpdate}
        />
        <Time>
          <TimeLabel>Current Time</TimeLabel>
          <TimeValue>{this.props.currentTime}</TimeValue>
        </Time>
      </Root>
    )
  }
}

export default hot(module)(TimeSettingsPresentation)
