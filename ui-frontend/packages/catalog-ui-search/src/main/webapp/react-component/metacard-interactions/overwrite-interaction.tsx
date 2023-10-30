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
import * as React from 'react'
import { MetacardInteractionProps } from '.'
import { MetacardInteraction } from './metacard-interactions'
import { hot } from 'react-hot-loader'
import { useDialog } from '../../component/dialog'
import { TypedUserInstance } from '../../component/singletons/TypedUser'
import { MetacardOverwrite } from '../../component/metacard-overwrite/metacard-overwrite.view'

export const OverwriteAction = (props: MetacardInteractionProps) => {
  if (!props.model || props.model.length !== 1) {
    return null
  }

  const result = props.model[0]

  if (
    result.isDeleted() ||
    result.isRevision() ||
    result.isRemote() ||
    !TypedUserInstance.canWrite(result)
  ) {
    return null
  }

  const dialogContext = useDialog()
  return (
    <MetacardInteraction
      onClick={() => {
        props.onClose()
        if (props.model) {
          dialogContext.setProps({
            children: (
              <MetacardOverwrite title={'Overwrite'} lazyResult={result} />
            ),
            open: true,
          })
        }
      }}
      icon="fa fa-files-o"
      text={'Overwrite'}
      help="This will overwrite the item content. To restore a previous content, you can click on 'File' in the toolbar, and then click 'Restore Archived Items'."
    />
  )
}

export default hot(module)(OverwriteAction)
