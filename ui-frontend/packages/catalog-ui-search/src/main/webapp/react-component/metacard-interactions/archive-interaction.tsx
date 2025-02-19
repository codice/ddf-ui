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

import MetacardArchive from '../metacard-archive'
import { MetacardInteractionProps } from '.'
import { MetacardInteraction } from './metacard-interactions'

import { useDialog } from '../../component/dialog'
import { Divider } from './metacard-interactions'
import { TypedUserInstance } from '../../component/singletons/TypedUser'

export const ArchiveAction = (props: MetacardInteractionProps) => {
  if (!props.model || props.model.length <= 0) {
    return null
  }

  const isDeleteAction = props.model.some((result) => {
    return !result.isDeleted()
  })

  const canPerformOnAll = props.model.every((result) => {
    return (
      TypedUserInstance.isAdmin(result) &&
      !result.isRemote() &&
      result.isDeleted() !== isDeleteAction
    )
  })

  if (!canPerformOnAll) {
    return null
  }

  const dialogContext = useDialog()
  return (
    <>
      <Divider />
      <MetacardInteraction
        onClick={() => {
          props.onClose()
          if (props.model) {
            dialogContext.setProps({
              children: <MetacardArchive results={props.model} />,
              open: true,
            })
          }
        }}
        icon={isDeleteAction ? 'fa fa-trash' : 'fa fa-undo'}
        text={isDeleteAction ? 'Delete' : 'Restore'}
        help={
          isDeleteAction ? 'Move item(s) to trash' : 'Move item(s) from trash'
        }
      />
    </>
  )
}

export default ArchiveAction
