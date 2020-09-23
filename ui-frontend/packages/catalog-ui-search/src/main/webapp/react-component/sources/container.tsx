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
import Sources from './presentation'
import sources from '../../component/singletons/sources-instance'

type Props = {} & WithBackboneProps

type Source = {
  id: string
  sourceActions: any[]
  available: boolean
}

interface State {
  amountDown: number
  sources: Source[]
}

class SourcesSummaryContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      // @ts-ignore ts-migrate(2339) FIXME: Property 'filter' does not exist on type '{ getHar... Remove this comment to see the full error message
      amountDown: sources.filter(function (source: Backbone.Model) {
        return !source.get('available')
      }).length,
      // @ts-ignore ts-migrate(2322) FIXME: Property 'sourceActions' is missing in type '{ ava... Remove this comment to see the full error message
      sources: sources.toJSON(),
    }
  }
  componentDidMount() {
    this.props.listenTo(sources, 'all', this.handleChange.bind(this))
  }
  handleChange() {
    this.setState({
      // @ts-ignore ts-migrate(2339) FIXME: Property 'filter' does not exist on type '{ getHar... Remove this comment to see the full error message
      amountDown: sources.filter(function (source: Backbone.Model) {
        return !source.get('available')
      }).length,
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ available: boolean; contentTypes: { name: ... Remove this comment to see the full error message
      sources: sources.toJSON(),
    })
  }
  render() {
    return (
      <Sources
        sources={this.state.sources}
        // @ts-ignore ts-migrate(2339) FIXME: Property 'fetch' does not exist on type '{ getHarv... Remove this comment to see the full error message
        refreshSources={() => sources.fetch()}
        amountDown={this.state.amountDown}
      />
    )
  }
}

export default withListenTo(SourcesSummaryContainer)
