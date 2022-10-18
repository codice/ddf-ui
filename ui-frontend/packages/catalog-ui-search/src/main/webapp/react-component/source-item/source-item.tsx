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
import { hot } from 'react-hot-loader'

type RootProps = {
  available: boolean
}

const Root = styled.div<RootProps>`
  width: 100%;
  height: auto;
  white-space: nowrap;
  padding: ${(props) => props.theme.minimumSpacing};
  overflow: hidden;

  .source-name,
  .source-available {
    white-space: normal;
    display: inline-block;
    vertical-align: top;
    font-size: ${(props) => props.theme.largeFontSize};
    line-height: ${(props) => props.theme.minimumButtonSize};
  }

  .source-name {
    padding: 0px ${(props) => props.theme.minimumSpacing};
    max-width: calc(100% - ${(props) => props.theme.minimumButtonSize});
    word-break: break-all;
  }

  .source-actions {
    display: block;
    padding-left: calc(2 * ${(props) => props.theme.minimumButtonSize});
  }

  .source-action > button {
    width: 100%;
    text-align: left;
    padding: 0px ${(props) => props.theme.minimumSpacing};
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .source-app {
    display: none;
  }

  .source-available {
    width: ${({ theme }) => theme.minimumButtonSize};
    text-align: center;
  }

  .is-available,
  .is-not-available {
    display: none;
  }

  .is-available {
    display: ${(props) => (props.available ? 'inline' : 'none')};
    color: ${(props) => props.theme.positiveColor};
  }

  .is-not-available {
    display: ${(props) => (props.available ? 'none' : 'inline')};
    color: ${(props) => props.theme.warningColor};
  }
`

type SourceAction = {
  title: string
  description: string
  url: string
  id: string
}

type Props = {
  sourceActions?: SourceAction[]
  id: string
  refreshSources: () => void
} & RootProps

export default hot(module)(({ id, available }: Props) => {
  return (
    <Root available={available}>
      <div className="source-available">
        <span className="is-available fa fa-check" />
        <span className="is-not-available fa fa-bolt" />
      </div>
      <div className="source-name" title={id}>
        {id}
      </div>
    </Root>
  )
})
