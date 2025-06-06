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

import styled from 'styled-components'
import { CustomElement } from '../styles/mixins'

import Divider from '@mui/material/Divider'

interface Props {
  branding: string
  product: string
  version: string
  commitHash: string
  commitDate: string
  isDirty: boolean
  date: string
}

const Root = styled.div`
  ${CustomElement} overflow: auto;
  padding: ${(props) => props.theme.minimumSpacing} 0px;

  .about-content {
    margin: auto;
    max-width: ${(props) => {
      return props.theme.screenBelow(props.theme.mediumScreenSize)
        ? '100%'
        : '1200px'
    }};
    padding: 0px
      ${(props) =>
        props.theme.screenBelow(props.theme.mediumScreenSize)
          ? '20px'
          : '100px'};
  }

  .content-version,
  .version-message {
    padding: ${(props) => props.theme.minimumSpacing};
  }
`

export default (props: Props) => {
  return (
    <Root>
      <div className="about-content is-large-font">
        <div>
          <span data-id="branding-label" className="is-bold">
            {props.branding}
          </span>
          <span data-id="product-label"> {props.product}</span>
        </div>
        <Divider
          orientation="horizontal"
          variant="fullWidth"
          className="my-3"
        />
        <div className="content-version">
          <div>
            <div className="version-title">Version</div>
            <div
              data-id="version-label"
              className="version-message is-medium-font"
            >
              {props.version}
            </div>
          </div>
          <Divider
            orientation="horizontal"
            variant="fullWidth"
            className="my-3"
          />
          <div>
            <div className="version-title">Unique Identifier</div>
            <div
              data-id="unique-identifier-label"
              className="version-message is-medium-font"
            >
              {`${props.commitHash} ${props.isDirty ? 'with Changes' : ''}`}
            </div>
          </div>
          <Divider
            orientation="horizontal"
            variant="fullWidth"
            className="my-3"
          />
          <div>
            <div className="version-title">Release Date</div>
            <div
              data-id="release-date-label"
              className="version-message is-medium-font"
            >
              {props.date}
            </div>
          </div>
        </div>
      </div>
    </Root>
  )
}
