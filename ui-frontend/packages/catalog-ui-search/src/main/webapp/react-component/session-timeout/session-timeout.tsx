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

import Button from '@material-ui/core/Button'
import * as React from 'react'
import styled from 'styled-components'
const sessionTimeoutModel = require('../../component/singletons/session-timeout')

const SessionTimeoutRoot = styled.div`
  height: 100%;
  width: 100%;
  display: block;
  overflow: hidden;
`
const Message = styled.div`
  max-height: calc(100% - 2.25rem);
  height: auto;
  text-align: center;
  padding: ${(props) => props.theme.mediumSpacing};
`

type State = {
  timeLeft: number
}

const renewSession = () => {
  sessionTimeoutModel.renew()
}

class SessionTimeout extends React.Component<{}, State> {
  interval: any
  constructor(props: {}) {
    super(props)
    this.state = {
      timeLeft: sessionTimeoutModel.getIdleSeconds(),
    }
  }
  componentDidMount() {
    this.interval = setInterval(
      () => this.setState({ timeLeft: sessionTimeoutModel.getIdleSeconds() }),
      1000
    )
  }
  componentWillUnmount() {
    clearInterval(this.interval)
  }
  render() {
    return this.state.timeLeft < 0 ? (
      <SessionTimeoutRoot>
        <Message>Session Expired. Please refresh the page to continue.</Message>
      </SessionTimeoutRoot>
    ) : (
      <SessionTimeoutRoot>
        <Message>
          You will be logged out automatically in{' '}
          <label className="timer">
            {sessionTimeoutModel.getIdleSeconds()}
          </label>{' '}
          seconds.
          <div>Press "Continue Working" to remain logged in.</div>
        </Message>
        <Button
          onClick={renewSession}
          variant="contained"
          color="primary"
          fullWidth
        >
          Continue Working
        </Button>
      </SessionTimeoutRoot>
    )
  }
}

export default SessionTimeout
