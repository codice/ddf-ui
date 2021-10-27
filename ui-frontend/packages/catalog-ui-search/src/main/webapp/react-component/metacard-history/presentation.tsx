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
import Checkbox from '@material-ui/core/Checkbox'

type Props = {
  onCheck: (event: any) => void
  diffVersions: () => void
  history: any
  selectedVersions: any
  loading: boolean
  canEdit: boolean
}

const Root = styled.div`
  overflow: auto;
  height: 100%;
  position: relative;

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
const Table = styled.table`
  margin: 16px 0 24px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`
const Th = styled.th`
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 4px;
  position: sticky;
  top: 0;
  background: #243540;
  z-index: 1;
`
const Td = styled.td`
  text-align: left;
  padding: 8px 4px;
  height: 60px;
`
/* stylelint-disable selector-type-no-unknown */
const Tr = styled.tr`
  &:hover ${Td} {
    background: rgba(255, 255, 255, 0.05);
  }
`
/* stylelint-enable */
const ThVersion = styled(Th)`
  text-align: center;
`
const TdVersion = styled(Td)`
  text-align: center;
`
const TdCheck = styled(Td)`
  width: 80px;
  text-align: center;
`
const CompareButton = styled(Button)`
  margin: 0 0 24px 16px;
`

const MetacardHistory = (props: Props) => {
  const { onCheck, diffVersions, history, selectedVersions, loading } = props
  return (
    <LoadingCompanion loading={loading}>
      <Root>
        <Table>
          <thead>
            <tr>
              <Th></Th>
              <ThVersion>Version</ThVersion>
              <Th>Date</Th>
              <Th>Modified by</Th>
            </tr>
          </thead>
          <tbody
            data-help="This is the history of changes to
            this item.  If you have the right permissions, you can click one of the items in the list
            and then click 'Revert to Selected Version' to restore the item to that specific state.  No history
            will be lost in the process.  Instead a new version will be created that is equal to the state you
            have chosen."
          >
            {history.map((historyItem: any) => {
              return (
                <Tr
                  className={`${
                    selectedVersions.includes(historyItem.id) && 'is-selected'
                  }`}
                  key={historyItem.id}
                >
                  <TdCheck>
                    <Checkbox
                      onClick={onCheck}
                      data-id={historyItem.id}
                      checked={selectedVersions.includes(historyItem.id)}
                    />
                  </TdCheck>
                  <TdVersion>{historyItem.versionNumber}</TdVersion>
                  <Td>{historyItem.niceDate}</Td>
                  <Td>{historyItem.editedBy}</Td>
                </Tr>
              )
            })}
          </tbody>
        </Table>
        {selectedVersions.length > 0 && (
          <CompareButton
            className="p-2"
            variant="contained"
            color="primary"
            onClick={diffVersions}
          >
            {selectedVersions.length == 1 &&
              'Compare selected version with the latest version'}
            {selectedVersions.length == 2 && 'Compare selected versions'}
          </CompareButton>
        )}
      </Root>
    </LoadingCompanion>
  )
}

export default hot(module)(MetacardHistory)
