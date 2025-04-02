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
import React from 'react'

export type BaseEditableAttributes = () => Promise<string[]>

export const BaseFetchEditableAttributes: BaseEditableAttributes = async () => {
  return []
}

export const OverridableFetchEditableAttributes = new Overridable(
  BaseFetchEditableAttributes
)

export const useFetchEditableAttributes = () => {
  return useOverridable(OverridableFetchEditableAttributes)
}

let cachedFetchEditableAttributesPromise = null as null | Promise<string[]>
let cachedFetchEditableAttributesFunction = null as
  | null
  | (() => Promise<string[]>)

export const useCustomEditableAttributes = () => {
  const [customEditableAttributes, setCustomEditableAttributes] =
    React.useState<null | string[]>(null)
  const fetchEditableAttributes = useFetchEditableAttributes()

  React.useEffect(() => {
    if (
      cachedFetchEditableAttributesPromise === null ||
      cachedFetchEditableAttributesFunction !== fetchEditableAttributes
    ) {
      setCustomEditableAttributes(null)
      cachedFetchEditableAttributesFunction = fetchEditableAttributes
      cachedFetchEditableAttributesPromise = fetchEditableAttributes()
    }
    cachedFetchEditableAttributesPromise
      .then((editableAttributes) => {
        setCustomEditableAttributes(editableAttributes)
      })
      .catch(() => {
        setCustomEditableAttributes([])
      })
  }, [fetchEditableAttributes])

  return {
    loading: customEditableAttributes === null,
    customEditableAttributes,
  }
}
