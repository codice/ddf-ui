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
import Timeline from './timeline/timeline'
import ResultsView from '../results-visual'
import { OpenlayersMapViewReact } from './maps/openlayers/openlayers.view'
import { CesiumMapViewReact } from './maps/cesium/cesium.view'
import { Histogram } from './histogram/histogram'
import { AuditedInspector } from './inspector/audited-inspector'

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
    view: OpenlayersMapViewReact,
    icon: 'fa fa-map',
    options: {
      desiredContainer: 'openlayers',
    },
    singular: true,
  },
  {
    id: 'cesium',
    title: '3D Map',
    view: CesiumMapViewReact,
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
    view: Histogram,
    singular: true,
  },
  {
    id: 'results',
    title: 'Results',
    view: ResultsView,
    icon: 'fa fa-table',
    singular: true,
  },
  {
    id: 'inspector',
    title: 'Inspector',
    icon: 'fa fa-info',
    view: AuditedInspector,
    singular: true,
  },
  {
    id: 'timeline',
    title: 'Timeline',
    icon: 'fa fa-hourglass-half',
    view: Timeline,
    singular: true,
  },
] as VisualizationType[]
