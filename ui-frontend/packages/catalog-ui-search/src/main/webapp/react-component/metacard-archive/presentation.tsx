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
import styled from 'styled-components'
import LoadingCompanion from '../loading-companion'
import Button from '@material-ui/core/Button'
type Props = {
  handleArchive: () => void
  handleRestore: () => void
  isDeleted: boolean
  loading: boolean
}

// @ts-ignore ts-migrate(6133) FIXME: 'SubText' is declared but its value is never read.
const SubText = styled.span`
  display: block;
  font-size: ${props => props.theme.mediumFontSize};
`

const render = (props: Props) => {
  const { handleArchive, handleRestore, isDeleted, loading } = props
  return (
    <LoadingCompanion loading={loading}>
      {!isDeleted ? (
        <Button
          data-id="archive-items-button"
          fullWidth
          variant="contained"
          color="secondary"
          onClick={handleArchive}
          data-help="This will remove the item(s) from standard search results.
To restore archived items, you can click on 'File' in the toolbar,
and then click 'Restore Archived Items'."
        >
          <div className="w-full">Archive item(s)</div>
          <div>
            WARNING: This will remove the item(s) from standard search results.
          </div>
        </Button>
      ) : (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleRestore}
          data-help="This will restore the item(s) to standard search results."
        >
          <div>Restore item(s)</div>
        </Button>
      )}
    </LoadingCompanion>
  )
}

export default hot(module)(render)
