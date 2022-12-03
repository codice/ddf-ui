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
import * as React from 'react'
import styled from 'styled-components'
import withListenTo, { WithBackboneProps } from '../backbone-container'
import { NotificationGroupViewReact } from '../../component/notification-group/notification-group.view'
import user from '../../component/singletons/user-instance.js'
import moment from 'moment'
import userNotifications from '../../component/singletons/user-notifications.js'

type Props = WithBackboneProps

const Empty = styled.div`
  transition: transform ${(props) => props.theme.coreTransitionTime} linear;
  transform: scale(1);
  text-align: center;
  font-size: ${(props) => props.theme.largeFontSize};
  padding: ${(props) => props.theme.mediumSpacing};
`
const Root = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
`
const Notifications = styled.div`
  height: 100%;
  width: 100%;
  display: block;
  padding: ${(props) => props.theme.mediumSpacing};
`

const informalName = (daysAgo: any) => {
  switch (daysAgo) {
    case -1:
      return 'Future'
      break
    case 0:
      return 'Today'
      break
    case 1:
      return 'Yesterday'
      break
    default:
      return moment().subtract(daysAgo, 'days').format('dddd')
      break
  }
}

const getFilterForDay = (numDays: number) => {
  if (numDays < 0) {
    return (model: any) => {
      return moment().diff(model.get('sentAt'), 'days') < 0
    }
  } else if (numDays < 7) {
    return (model: any) => {
      return moment().diff(model.get('sentAt'), 'days') === numDays
    }
  } else {
    return (model: any) => {
      return moment().diff(model.get('sentAt'), 'days') >= 7
    }
  }
}

const dayRange = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8]

class UserNotifications extends React.Component<Props, {}> {
  notificationGroups: any
  constructor(props: Props) {
    super(props)
    this.props.listenTo(userNotifications, 'add remove update', () =>
      this.setState({})
    )
  }
  render() {
    return userNotifications.isEmpty() ? (
      <Empty>
        <div>No Notifications</div>
      </Empty>
    ) : (
      <Root>
        <div>
          <Notifications>
            {dayRange.map((day) => {
              return (
                <NotificationGroupViewReact
                  key={day}
                  filter={getFilterForDay(day)}
                  date={day === 8 ? 'Older' : informalName(day)}
                />
              )
            })}
          </Notifications>
        </div>
      </Root>
    )
  }
  componentWillUnmount() {
    userNotifications.setSeen()
    user.savePreferences()
  }
}

export default withListenTo(UserNotifications)
