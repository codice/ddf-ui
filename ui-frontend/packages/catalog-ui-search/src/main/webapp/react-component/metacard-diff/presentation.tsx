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

import { hot } from 'react-hot-loader'
import * as React from 'react'
import Button from '@material-ui/core/Button'
import styled from 'styled-components'
import LoadingCompanion from '../loading-companion'

type Props = {
  toggleShowAll: () => void
  revertToSelectedVersion: () => void
  canRevert: boolean
  diffData: any
  baseInfo: any
  changeInfo: any
  loading: boolean
  showAll: boolean
}

const Root = styled.div`
  overflow: auto;
  height: 100%;

  .metacardHistory-cell {
    float: left;
    padding: 10px;
    text-align: center;
  }

  .diffHighlight {
    background-color: rgba(75, 200, 200, 0.3);
  }

  ${(props) => {
    if (props.theme.screenBelow(props.theme.smallScreenSize)) {
      return `
        .metacardHistory-body {
          max-height: none;
          overflow: auto;
        }
  
        .metacardHistory-cell {
          display: block;
          width: 100%;
        }
    `
    }
    return
  }};
`

const Header = styled.div`
  height: 50px;
`

const Row = styled.div`
  transition: padding ${(props) => props.theme.transitionTime} linear;
`

// prettier-ignore
const Body = styled.div`
  max-height: calc(100% - ${props => props.theme.minimumButtonSize}*2 - 20px - ${props => props.theme.minimumSpacing});
  overflow: auto;
  overflow-x: hidden;
  width: 100%;
  cursor: pointer;
  display: table;
  content: " ";
  > *,
  > * > td {
    display: inline-block;
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  > *:hover,
  > *:hover > td {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
`

const Attribute = styled.div`
  width: 20%;
`

const Base = styled.div`
  width: 40%;
`

const Change = styled.div`
  width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ShowButton = styled.button`
  color: #69e1e8;
  background: transparent;
  width: auto;
  transition: none;
  box-shadow: none;
  padding: 20px 8px;
`

const MetacardDiff = (props: Props) => {
  const {
    toggleShowAll,
    revertToSelectedVersion,
    diffData,
    baseInfo,
    changeInfo,
    canRevert,
    loading,
    showAll,
  } = props
  return (
    <LoadingCompanion loading={loading}>
      <Root>
        <ShowButton className="p-2" color="primary" onClick={toggleShowAll}>
          {!showAll && 'Show Matching Attributes'}
          {showAll && 'Hide Matching Attributes'}
        </ShowButton>
        <Header>
          <Row>
            <Attribute className="metacardHistory-cell">Attribute</Attribute>
            <Base className="metacardHistory-cell">{baseInfo.version}</Base>
            <Change className="metacardHistory-cell">
              {changeInfo.version}
            </Change>
          </Row>
        </Header>
        <Body
          className="metacardHistory-body"
          data-help="This is the comparison of two version of the item.  If you compare to the current version and have the right permissions, you can click the 'Revert to <version>' to restore the item to that specific state.  No history
will be lost in the process.  Instead a new version will be created that is equal to the state you
have chosen."
        >
          {diffData.map((diffItem: any) => {
            if (!showAll && !diffItem.isDiff) {
              return
            }
            return (
              <Row
                key={diffItem.name}
                className={showAll && diffItem.isDiff ? 'diffHighlight' : ''}
              >
                <Attribute className="metacardHistory-cell">
                  {diffItem.name}
                </Attribute>
                <Base className="metacardHistory-cell">{diffItem.base}</Base>
                <Change className="metacardHistory-cell">
                  {diffItem.change}
                </Change>
              </Row>
            )
          })}
        </Body>
        {canRevert && (
          <Button
            fullWidth
            className="p-2"
            variant="contained"
            color="primary"
            onClick={revertToSelectedVersion}
          >
            Revert to {baseInfo.version}
          </Button>
        )}
      </Root>
    </LoadingCompanion>
  )
}

export default hot(module)(MetacardDiff)
