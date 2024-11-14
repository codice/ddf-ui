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
import React from 'react'
import { UploadBatchItemViewReact } from '../upload-batch-item/upload-batch-item.view'
import userNotifications from '../singletons/user-notifications'
import user from '../singletons/user-instance'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import { useDialogState } from '../hooks/useDialogState'

type NotificationGroupViewReactType = {
  date: any
  filter: any
}

export const NotificationGroupViewReact = ({
  date,
  filter,
}: NotificationGroupViewReactType) => {
  const dialog = useDialogState()
  const relevantNotifications = userNotifications.filter(filter)

  if (relevantNotifications.length === 0) {
    return null
  }
  return (
    <React.Fragment>
      <dialog.MuiDialogComponents.Dialog {...dialog.MuiDialogProps}>
        <dialog.MuiDialogComponents.DialogTitle>
          Remove all notifications for {date}?
        </dialog.MuiDialogComponents.DialogTitle>
        <dialog.MuiDialogComponents.DialogActions>
          <Button
            onClick={() => {
              dialog.handleClose()
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => {
              dialog.handleClose()
              userNotifications.filter(filter).forEach((model: any) => {
                model.collection.remove(model)
              })
              user.get('user').get('preferences').savePreferences()
            }}
          >
            Confirm
          </Button>
        </dialog.MuiDialogComponents.DialogActions>
      </dialog.MuiDialogComponents.Dialog>
      <div className="flex flex-row items-center w-full">
        <div className="header-when w-full">{date}</div>
        <Button size="large" {...dialog.MuiButtonProps}>
          <CloseIcon></CloseIcon>
        </Button>
      </div>
      <div className="w-full flex flex-col space-y-4">
        {userNotifications.filter(filter).map((notification: any) => {
          return (
            <UploadBatchItemViewReact
              key={notification.id}
              model={notification}
            />
          )
        })}
      </div>
    </React.Fragment>
  )
}
