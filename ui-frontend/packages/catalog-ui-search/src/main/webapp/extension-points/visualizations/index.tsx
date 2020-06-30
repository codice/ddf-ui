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
import HistogramView from '../../component/visualization/histogram/lazy-histogram.view'
import LazyInspectorView from '../../component/visualization/inspector/inspector-lazy.view'
const LowBandwidthMapView = require('../../component/visualization/low-bandwidth-map/low-bandwidth-map.view.js')
import ResultsView from '../../component/results-visual'
const Marionette = require('catalog-ui-search/src/main/webapp/lib/marionette')
import ResultSelector from '../../component/result-selector/result-selector'
import { QueryEditor } from '../../component/pages/home/query-editor'

const ResultsViewWrapper = Marionette.LayoutView.extend({
  className: 'customElement',
  template() {
    return (
      <>
        <ResultsView selectionInterface={this.options.selectionInterface} />
      </>
    )
  },
})

const StatusViewWrapper = Marionette.LayoutView.extend({
  className: 'customElement',
  template() {
    return (
      <>
        <QueryEditor
          query={this.options.selectionInterface.getCurrentQuery()}
        />
        <ResultSelector
          selectionInterface={this.options.selectionInterface}
          model={this.options.selectionInterface.getCurrentQuery()}
        />
      </>
    )
  },
})
export default [
  {
    id: 'openlayers',
    title: '2D Map',
    view: LowBandwidthMapView,
    icon: 'fa fa-map',
    options: {
      desiredContainer: 'openlayers',
    },
  },
  {
    id: 'cesium',
    title: '3D Map',
    view: LowBandwidthMapView,
    icon: 'fa fa-globe',
    options: {
      desiredContainer: 'cesium',
    },
  },
  {
    id: 'histogram',
    title: 'Histogram',
    icon: 'fa fa-bar-chart',
    view: HistogramView,
  },
  {
    id: 'results',
    title: 'Results',
    view: ResultsViewWrapper,
    icon: 'fa fa-table',
  },
  {
    id: 'inspector',
    title: 'Inspector',
    icon: 'fa fa-info',
    view: LazyInspectorView,
  },
  {
    id: 'status',
    title: 'Status',
    icon: 'fa fa-info',
    view: StatusViewWrapper,
  },
]
