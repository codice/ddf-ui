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
import Button from '@mui/material/Button'
import ProgressButton from '../progress-button'
import { useDialog } from '../../component/dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import useSnack from '../../component/hooks/useSnack'

type Props = {
  onArchiveConfirm: () => Promise<void>
  onRestoreConfirm: () => Promise<void>
  isDeleted: boolean
  loading: boolean
}

const render = (props: Props) => {
  const { onArchiveConfirm, onRestoreConfirm, isDeleted, loading } = props
  const addSnack = useSnack()
  const dialogContext = useDialog()
  return (
    <>
      <DialogTitle>{isDeleted ? 'Restore' : 'Delete'} Item(s)</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to {isDeleted ? 'restore' : 'delete'}?
        </DialogContentText>
        <DialogContentText>
          Doing so will {isDeleted ? 'include' : 'remove'} the item(s){' '}
          {isDeleted ? 'in' : 'from'} future search results.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            dialogContext.setProps({ open: false })
          }}
        >
          Cancel
        </Button>
        <ProgressButton
          dataId="archive-confirm"
          onClick={async () => {
            try {
              dialogContext.setProps({
                onClose: (_event, reason) => {
                  if (
                    reason === 'backdropClick' ||
                    reason === 'escapeKeyDown'
                  ) {
                    return
                  }
                  dialogContext.setProps({
                    open: false,
                  })
                },
              })
              isDeleted ? await onRestoreConfirm() : await onArchiveConfirm()
              addSnack(`Successfully ${isDeleted ? `restored` : `deleted`}`)
            } catch (err) {
              console.log('Error: ', err)
              addSnack(
                `An error occurred while trying to ${
                  isDeleted ? 'restore' : 'delete'
                }.`,
                {
                  status: 'error',
                }
              )
            } finally {
              if (!loading) dialogContext.setProps({ open: false })
            }
          }}
          variant="contained"
          color="primary"
          disabled={loading}
          loading={loading}
        >
          {isDeleted ? 'Restore' : 'Delete'}
        </ProgressButton>
      </DialogActions>
    </>
  )
}

export default hot(module)(render)
