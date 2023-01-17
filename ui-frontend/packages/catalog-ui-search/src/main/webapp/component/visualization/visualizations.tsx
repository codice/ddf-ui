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
import React from 'react'
import { LinearProgress } from '@material-ui/core'

type VisualizationType = {
  id: string
  title: string
  view: any
  icon: string
  options: any
  singular: boolean
}

const generateGenericDynamicComponentImport = ({
  path,
  componentName,
}: {
  path: string
  componentName: string
}) => {
  return (...args: any) => {
    const [Component, setComponent] = React.useState<any>(null)

    React.useEffect(() => {
      import(`${path}`).then((code) => {
        setComponent(() => {
          return code[componentName]
        })
      })
    }, [])

    if (Component) {
      return React.createElement(Component, ...args)
    }
    return <LinearProgress className="w-full h-2" variant="indeterminate" />
  }
}

export const Visualizations = [
  {
    id: 'openlayers',
    title: '2D Map',
    view: generateGenericDynamicComponentImport({
      path: './maps/openlayers/openlayers.view',
      componentName: 'OpenlayersMapViewReact',
    }),
    icon: 'fa fa-map',
    options: {
      desiredContainer: 'openlayers',
    },
    singular: true,
  },
  {
    id: 'cesium',
    title: '3D Map',
    view: generateGenericDynamicComponentImport({
      path: './maps/cesium/cesium.view',
      componentName: 'CesiumMapViewReact',
    }),
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
    view: generateGenericDynamicComponentImport({
      path: './histogram/histogram',
      componentName: 'Histogram',
    }),
    singular: true,
  },
  {
    id: 'results',
    title: 'Results',
    view: generateGenericDynamicComponentImport({
      path: './results-visual/index',
      componentName: 'default',
    }),
    icon: 'fa fa-table',
    singular: true,
  },
  {
    id: 'inspector',
    title: 'Inspector',
    icon: 'fa fa-info',
    view: generateGenericDynamicComponentImport({
      path: './inspector/audited-inspector',
      componentName: 'AuditedInspector',
    }),
    singular: true,
  },
  {
    id: 'timeline',
    title: 'Timeline',
    icon: 'fa fa-hourglass-half',
    view: generateGenericDynamicComponentImport({
      path: './timeline/timeline',
      componentName: 'default',
    }),
    singular: true,
  },
] as VisualizationType[]
