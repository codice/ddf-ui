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
import { Divider } from './metacard-interactions'
import ExtensionPoints from '../../extension-points'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'

export type MetacardInteractionProps = {
  model?: LazyQueryResult[]
  onClose: () => void
}

export type Result = {
  get: (key: any) => any
  isResource: () => boolean
  isRevision: () => boolean
  isDeleted: () => boolean
  isRemote: () => boolean
}

const MetacardInteractions = (props: MetacardInteractionProps) => {
  return (
    <>
      {ExtensionPoints.metacardInteractions.map((Component, i) => {
        const componentName = Component.toString()
        const key = componentName + '-' + i
        return <Component key={key} {...props} />
      })}
    </>
  )
}

const Component = MetacardInteractions

export default hot(module)(Component)

export { Divider }

export { MetacardInteraction } from './metacard-interactions'
