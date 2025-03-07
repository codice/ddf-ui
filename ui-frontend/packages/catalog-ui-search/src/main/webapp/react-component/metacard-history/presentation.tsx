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

import Button from '@mui/material/Button'
import styled from 'styled-components'
import LinearProgress from '@mui/material/LinearProgress'

type Props = {
  onClick: (event: any) => void
  revertToSelectedVersion: () => void
  history: any
  selectedVersion: any
  loading: boolean
  canEdit: boolean
}

const Root = styled.div`
  overflow: auto;
  height: 100%;

  .metacardHistory-cell {
    float: left;
    padding: 10px;
    text-align: center;
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

const Version = styled.div`
  width: 20%;
`

const Date = styled.div`
  width: 50%;
`

const Modified = styled.div`
  width: 30%;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MetacardHistory = (props: Props) => {
  const {
    onClick,
    revertToSelectedVersion,
    history,
    selectedVersion,
    loading,
    canEdit,
  } = props
  return loading ? (
    <LinearProgress className="w-full h-2" />
  ) : (
    <>
      <Root>
        <Header>
          <Row>
            <Version className="metacardHistory-cell">Version</Version>
            <Date className="metacardHistory-cell">Date</Date>
            <Modified className="metacardHistory-cell">Modified by</Modified>
          </Row>
        </Header>
        <Body
          className="metacardHistory-body"
          data-help="This is the history of changes to
this item.  If you have the right permissions, you can click one of the items in the list
and then click 'Revert to Selected Version' to restore the item to that specific state.  No history
will be lost in the process.  Instead a new version will be created that is equal to the state you
have chosen."
        >
          {history.map((historyItem: any) => {
            return (
              <Row
                className={`${
                  selectedVersion === historyItem.id &&
                  ' bg-gray-600 bg-opacity-25'
                }`}
                data-id={historyItem.id}
                key={historyItem.id}
                onClick={onClick}
              >
                <Version className="metacardHistory-cell">
                  {historyItem.versionNumber}
                </Version>
                <Date className="metacardHistory-cell">
                  {historyItem.niceDate}
                </Date>
                <Modified className="metacardHistory-cell">
                  {historyItem.editedBy}
                </Modified>
              </Row>
            )
          })}
        </Body>
        {selectedVersion && canEdit && (
          <Button
            fullWidth
            className="p-2"
            variant="contained"
            color="primary"
            onClick={revertToSelectedVersion}
          >
            Revert to selected version
          </Button>
        )}
      </Root>
    </>
  )
}

export default MetacardHistory
