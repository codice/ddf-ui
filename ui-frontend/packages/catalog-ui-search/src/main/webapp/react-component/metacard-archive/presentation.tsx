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
import LinearProgress from '@material-ui/core/LinearProgress'
import Button from '@material-ui/core/Button'
import { useDialogState } from '../../component/hooks/useDialogState'
type Props = {
  onArchiveConfirm: () => Promise<void>
  onRestoreConfirm: () => Promise<void>
  isDeleted: boolean
  loading: boolean
}

// @ts-expect-error ts-migrate(6133) FIXME: 'SubText' is declared but its value is never read.
const SubText = styled.span`
  display: block;
  font-size: ${(props) => props.theme.mediumFontSize};
`

const render = (props: Props) => {
  const { onArchiveConfirm, onRestoreConfirm, isDeleted, loading } = props
  const archiveDialogState = useDialogState()
  const restoreDialogState = useDialogState()
  return !loading ? (
    <>
      <archiveDialogState.MuiDialogComponents.Dialog
        {...archiveDialogState.MuiDialogProps}
      >
        <archiveDialogState.MuiDialogComponents.DialogTitle>
          Are you sure you want to delete?
          <div>
            Doing so will remove the item(s) from future search results.
          </div>
        </archiveDialogState.MuiDialogComponents.DialogTitle>
        <archiveDialogState.MuiDialogComponents.DialogActions>
          <Button
            onClick={() => {
              archiveDialogState.handleClose()
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              archiveDialogState.handleClose()
              onArchiveConfirm()
            }}
          >
            Delete
          </Button>
        </archiveDialogState.MuiDialogComponents.DialogActions>
      </archiveDialogState.MuiDialogComponents.Dialog>
      <archiveDialogState.MuiDialogComponents.Dialog
        {...restoreDialogState.MuiDialogProps}
      >
        <archiveDialogState.MuiDialogComponents.DialogTitle>
          Are you sure you want to restore? Doing so will include the item(s) in
          future search results.
        </archiveDialogState.MuiDialogComponents.DialogTitle>
        <archiveDialogState.MuiDialogComponents.DialogActions>
          <Button
            onClick={() => {
              restoreDialogState.handleClose()
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              restoreDialogState.handleClose()
              onRestoreConfirm()
            }}
          >
            Restore
          </Button>
        </archiveDialogState.MuiDialogComponents.DialogActions>
      </archiveDialogState.MuiDialogComponents.Dialog>
      {!isDeleted ? (
        <Button
          {...archiveDialogState.MuiButtonProps}
          data-id="archive-items-button"
          fullWidth
          variant="contained"
          color="secondary"
          data-help="This will remove the item(s) from standard search results.
To restore deleted items, you can click on 'File' in the toolbar,
and then click 'Restore Deleted Items'."
        >
          <div className="w-full">Delete item(s)</div>
          <div>
            WARNING: This will remove the item(s) from standard search results.
          </div>
        </Button>
      ) : (
        <Button
          {...restoreDialogState.MuiButtonProps}
          fullWidth
          variant="contained"
          color="primary"
          data-help="This will restore the item(s) to standard search results."
        >
          <div>Restore item(s)</div>
        </Button>
      )}
    </>
  ) : (
    <LinearProgress className="w-full h-2" />
  )
}

export default hot(module)(render)
