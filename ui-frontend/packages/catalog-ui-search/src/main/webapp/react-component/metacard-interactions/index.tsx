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
import withListenTo, { WithBackboneProps } from '../backbone-container'
import { hot } from 'react-hot-loader'
// @ts-expect-error ts-migrate(6133) FIXME: 'user' is declared but its value is never read.
const user = require('../../component/singletons/user-instance')
import { Divider } from './metacard-interactions'
import ExtensionPoints from '../../extension-points'

export type Props = {
  model: {} | any
  onClose: () => void
} & WithBackboneProps

export type Result = {
  get: (key: any) => any
  isResource: () => boolean
  isRevision: () => boolean
  isDeleted: () => boolean
  isRemote: () => boolean
}

export type Model = {
  map: (
    result: Result | any
  ) =>
    | {
        id?: any
        title?: any
      }
    | {}
  toJSON: () => any
  first: () => any
  forEach: (result: Result | any) => void
  find: (result: Result | any) => boolean
} & Array<any>

type State = {
  model: any
}

const mapPropsToState = (props: Props) => {
  return {
    model: props.model,
  }
}

class MetacardInteractions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = mapPropsToState(props)
  }
  componentDidMount = () => {
    const setState = (model: Model) => this.setState({ model: model })

    this.props.listenTo(
      this.props.model,
      'change:metacard>properties',
      setState
    )
  }

  render = () => {
    return (
      <>
        {ExtensionPoints.metacardInteractions.map(
          (Component: any, i: number) => {
            const componentName = Component.toString()
            const key = componentName + '-' + i
            return <Component key={key} {...this.props} />
          }
        )}
      </>
    )
  }
}

const Component = withListenTo(MetacardInteractions)

export default hot(module)(Component)

export { Divider }

export { MetacardInteraction } from './metacard-interactions'
