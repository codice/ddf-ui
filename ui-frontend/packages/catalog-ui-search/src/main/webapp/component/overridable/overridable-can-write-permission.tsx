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
import { Overridable } from '../../js/model/Base/base-classes'
import { useOverridable } from '../../js/model/Base/base-classes.hooks'
import type { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import type { TypedUserInstanceType } from '../singletons/TypedUser'
import type { useConfigurationType } from '../../js/model/Startup/configuration.hooks'

export type CanWritePermissionType = (props: {
  attribute: string
  lazyResult: LazyQueryResult
  user: any
  editableAttributes: string[]
  typedUserInstance: TypedUserInstanceType
  configuration: ReturnType<useConfigurationType>
}) => boolean

// export this as a fallback for downstream to use
export const BaseCanWritePermission: CanWritePermissionType = (props) => {
  const { attribute, lazyResult, typedUserInstance, configuration } = props
  const canWrite =
    !lazyResult.isRemote() &&
    typedUserInstance.canWrite(lazyResult) &&
    !configuration.isReadOnly(attribute)
  return canWrite
}

export const OverridableCanWritePermission = new Overridable(
  BaseCanWritePermission
)

export const useCanWritePermission = () => {
  return useOverridable(OverridableCanWritePermission)
}
