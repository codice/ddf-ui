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
// import QueryAddView from '../../component/query-add/query-add'
// import MRC from '../../react-component/marionette-region-container'
// import Button from '@material-ui/core/Button'
// import ExtensionPoints from '../extension-points'
// import Paper from '@material-ui/core/Paper'
// import Grid from '@material-ui/core/Grid'

// import { Dropdown } from '@connexta/atlas/atoms/dropdown'
// import { BetterClickAwayListener } from '../../component/better-click-away-listener/better-click-away-listener'
// import MoreVert from '@material-ui/icons/MoreVert'

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

// const StatusViewWrapper = Marionette.LayoutView.extend({
//   className: 'customElement overflow-auto',
//   template() {
//     return (
//       <>
//         <MRC
//           view={QueryAddView}
//           viewOptions={{
//             selectionInterface: this.options.selectionInterface,
//             model: this.options.selectionInterface.getCurrentQuery(),
//           }}
//           style={{ height: 'auto' }}
//         />
//       </>
//     )
//   },
// })
export default [
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
    view: LazyInspectorView,
    singular: true,
  },
  // {
  //   id: 'status',
  //   title: 'Search',
  //   icon: 'fa fa-info',
  //   view: StatusViewWrapper,
  //   isClosable: false,
  //   singular: true,
  //   header: ({ selectionInterface }: { selectionInterface: any }) => {
  //     return (
  //       <ExtensionPoints.providers>
  //         <Grid container direction="row" wrap="nowrap">
  //           <Grid item className="px-3">
  //             <Dropdown
  //               content={context => {
  //                 return (
  //                   <BetterClickAwayListener
  //                     onClickAway={() => {
  //                       context.deepCloseAndRefocus.bind(context)()
  //                     }}
  //                   >
  //                     <Paper>
  //                       <ExtensionPoints.searchInteractions
  //                         model={selectionInterface.getCurrentQuery()}
  //                         onClose={() => {
  //                           context.deepCloseAndRefocus.bind(context)()
  //                         }}
  //                       />
  //                     </Paper>
  //                   </BetterClickAwayListener>
  //                 )
  //               }}
  //             >
  //               {({ handleClick }) => {
  //                 return (
  //                   <Button
  //                     variant="text"
  //                     color="inherit"
  //                     onClick={handleClick}
  //                     className="px-3"
  //                     style={{ height: 'auto', width: 'auto' }}
  //                   >
  //                     <MoreVert />
  //                   </Button>
  //                 )
  //               }}
  //             </Dropdown>
  //           </Grid>
  //         </Grid>
  //       </ExtensionPoints.providers>
  //     )
  //   },
  // },
]
