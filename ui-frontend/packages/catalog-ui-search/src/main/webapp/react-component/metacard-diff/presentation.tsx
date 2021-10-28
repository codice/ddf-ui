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
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
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
  display: flex;
  flex-direction: column;
  height: 100%;

  .diffHighlight {
    background-color: rgba(75, 200, 200, 0.3);
  }
`

const ShowSwitch = styled(FormGroup)`
  margin: 16px;
  font-size: 1.4rem;
  align-items: flex-end;
`
const ShowSwitchLabel = styled.span`
  font-size: 1rem;
`

const TableWrapper = styled.div`
  overflow: auto;
  height: 100%;
  padding-bottom: 16px;
  position: relative;
`
const Table = styled.table`
  margin: 0 0 24px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`
const Th = styled.th`
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 4px;
  position: sticky;
  top: 0;
  background: #243540;
  z-index: 1;
`
const Td = styled.td`
  text-align: center;
  padding: 8px 4px;
  height: 60px;
  word-break: break-word;
`
/* stylelint-disable selector-type-no-unknown */
const Tr = styled.tr`
  &:hover ${Td} {
    background: rgba(255, 255, 255, 0.05);
  }
`
/* stylelint-enable */
const ThAttribute = styled(Th)`
  width: 20%;
`
const ThBaseVersion = styled(Th)`
  width: 40%;
`
const ThChangeVersion = styled(Th)`
  width: 40%;
`
const RevertBtnWrapper = styled.div`
  margin: 0 16px 16px;
  position: sticky;
  bottom: 0;
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
        <ShowSwitch>
          <FormControlLabel
            control={
              <Switch onChange={toggleShowAll} checked={showAll} size="small" />
            }
            label={<ShowSwitchLabel>Show matching attributes</ShowSwitchLabel>}
          />
        </ShowSwitch>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <ThAttribute>Attribute</ThAttribute>
                <ThBaseVersion>{baseInfo.version}</ThBaseVersion>
                <ThChangeVersion>{changeInfo.version}</ThChangeVersion>
              </tr>
            </thead>
            <tbody>
              {diffData.map((diffItem: any) => {
                if (!showAll && !diffItem.isDiff) {
                  return
                }
                return (
                  <Tr
                    key={diffItem.name}
                    className={
                      showAll && diffItem.isDiff ? 'diffHighlight' : ''
                    }
                  >
                    <Td>{diffItem.name}</Td>
                    <Td>{diffItem.base}</Td>
                    <Td>{diffItem.change}</Td>
                  </Tr>
                )
              })}
            </tbody>
          </Table>

          {canRevert && (
            <RevertBtnWrapper>
              <Button
                fullWidth
                className="p-2"
                variant="contained"
                color="primary"
                onClick={revertToSelectedVersion}
              >
                Revert to {baseInfo.version}
              </Button>
            </RevertBtnWrapper>
          )}
        </TableWrapper>
      </Root>
    </LoadingCompanion>
  )
}

export default hot(module)(MetacardDiff)
