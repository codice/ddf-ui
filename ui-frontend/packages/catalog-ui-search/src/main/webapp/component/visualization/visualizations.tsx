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
import HistogramView from './histogram/lazy-histogram.view'
import Inspector from './inspector/inspector-lazy.view'
import LowBandwidthMapView from './low-bandwidth-map/low-bandwidth-map.view'
import Timeline from './timeline/timeline'
import ResultsView from '../results-visual'
const Marionette = require('marionette')

const ResultsViewWrapper = Marionette.LayoutView.extend({
  className: 'customElement bg-inherit',
  template() {
    return (
      <>
        <ResultsView selectionInterface={this.options.selectionInterface} />
      </>
    )
  },
})

const TimelineViewWrapper = Marionette.LayoutView.extend({
  className: 'customElement',
  template() {
    return <Timeline selectionInterface={this.options.selectionInterface} />
  },
})

type VisualizationType = {
  id: string
  title: string
  view: any
  icon: string
  options: any
  singular: boolean
}

export const Visualizations = [
  {
    id: 'openlayers',
    title: '2D Map',
    view: LowBandwidthMapView,
    icon: 'fa fa-map',
    options: {
      desiredContainer: 'openlayers',
    },
    singular: true,
  },
  {
    id: 'cesium',
    title: '3D Map',
    view: LowBandwidthMapView,
    icon: 'fa fa-globe',
    options: {
      desiredContainer: 'cesium',
    },
    singular: true,
  },
  {
    id: 'histogram',
    title: 'Histogram',
    icon: 'fa fa-bar-chart',
    view: HistogramView,
    singular: true,
  },
  {
    id: 'results',
    title: 'Results',
    view: ResultsViewWrapper,
    icon: 'fa fa-table',
    singular: true,
  },
  {
    id: 'inspector',
    title: 'Inspector',
    icon: 'fa fa-info',
    view: Inspector,
    singular: true,
  },
  {
    id: 'timeline',
    title: 'Timeline',
    icon: 'fa fa-hourglass-half',
    view: TimelineViewWrapper,
    singular: true,
  },
] as VisualizationType[]
