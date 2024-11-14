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
import LinearProgress from '@mui/material/LinearProgress'

type VisualizationType = {
  id: string
  title: string
  view: any
  icon: string
  options: any
  singular: boolean
}

/**
 * Swapping to not doing string interpolation and generation of dynamic imports, as this increases build time and ends up producing larger bundles in the end downstream.
 */
const DynamicCesiumImport = (...args: any) => {
  const [Component, setComponent] = React.useState<any>(null)

  React.useEffect(() => {
    import(`./maps/cesium/cesium.view`).then((code) => {
      setComponent(() => {
        return code.CesiumMapViewReact
      })
    })
  }, [])

  if (Component) {
    return React.createElement(Component, ...args)
  }
  return <LinearProgress className="w-full h-2" variant="indeterminate" />
}

const DynamicOpenlayersImport = (...args: any) => {
  const [Component, setComponent] = React.useState<any>(null)

  React.useEffect(() => {
    import('./maps/openlayers/openlayers.view').then((code) => {
      setComponent(() => {
        return code.OpenlayersMapViewReact
      })
    })
  }, [])

  if (Component) {
    return React.createElement(Component, ...args)
  }
  return <LinearProgress className="w-full h-2" variant="indeterminate" />
}

const DynamicHistogramImport = (...args: any) => {
  const [Component, setComponent] = React.useState<any>(null)

  React.useEffect(() => {
    import('./histogram/histogram').then((code) => {
      setComponent(() => {
        return code.Histogram
      })
    })
  }, [])

  if (Component) {
    return React.createElement(Component, ...args)
  }
  return <LinearProgress className="w-full h-2" variant="indeterminate" />
}

const DynamicInspectorImport = (...args: any) => {
  const [Component, setComponent] = React.useState<any>(null)

  React.useEffect(() => {
    import('./inspector/audited-inspector').then((code) => {
      setComponent(() => {
        return code.AuditedInspector
      })
    })
  }, [])

  if (Component) {
    return React.createElement(Component, ...args)
  }
  return <LinearProgress className="w-full h-2" variant="indeterminate" />
}

const DynamicResultsImport = (...args: any) => {
  const [Component, setComponent] = React.useState<any>(null)

  React.useEffect(() => {
    import('./results-visual').then((code) => {
      setComponent(() => {
        return code.default
      })
    })
  }, [])

  if (Component) {
    return React.createElement(Component, ...args)
  }
  return <LinearProgress className="w-full h-2" variant="indeterminate" />
}

const DynamicTimelineImport = (...args: any) => {
  const [Component, setComponent] = React.useState<any>(null)

  React.useEffect(() => {
    import('./timeline/timeline').then((code) => {
      setComponent(() => {
        return code.default
      })
    })
  }, [])

  if (Component) {
    return React.createElement(Component, ...args)
  }
  return <LinearProgress className="w-full h-2" variant="indeterminate" />
}

export const Visualizations = [
  {
    id: 'openlayers',
    title: '2D Map',
    view: DynamicOpenlayersImport,
    icon: 'fa fa-map',
    options: {
      desiredContainer: 'openlayers',
    },
    singular: true,
  },
  {
    id: 'cesium',
    title: '3D Map',
    view: DynamicCesiumImport,
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
    view: DynamicHistogramImport,
    singular: true,
  },
  {
    id: 'results',
    title: 'Results',
    view: DynamicResultsImport,
    icon: 'fa fa-table',
    singular: true,
  },
  {
    id: 'inspector',
    title: 'Inspector',
    icon: 'fa fa-info',
    view: DynamicInspectorImport,
    singular: true,
  },
  {
    id: 'timeline',
    title: 'Timeline',
    icon: 'fa fa-hourglass-half',
    view: DynamicTimelineImport,
    singular: true,
  },
] as VisualizationType[]
