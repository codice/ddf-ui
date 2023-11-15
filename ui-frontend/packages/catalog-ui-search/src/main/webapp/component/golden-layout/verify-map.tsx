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
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import wreqr from '../../js/wreqr'
import { Visualizations } from '../visualization/visualizations'

function findOpenlayers(item: any) {
  return item.componentName === 'openlayers'
}

/**
 *  Notice that we are only forwarding events that start with 'search' for now, as these are drawing events.
 */
export const useVerifyMapExistsWhenDrawing = ({
  goldenLayout,
  isInitialized,
}: {
  goldenLayout: any
  isInitialized: boolean
}) => {
  useListenTo(
    (wreqr as any).vent,
    'search:drawline search:drawpoly search:drawbbox search:drawcircle',
    () => {
      if (goldenLayout && isInitialized) {
        //     // Launch the 2D Map (openlayers) if it's not already open
        const contentItems = goldenLayout.root.getItemsByFilter(findOpenlayers)
        if (contentItems.length === 0) {
          const configs = Visualizations.reduce((cfg, viz) => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'isClosable' does not exist on type 'Visu... Remove this comment to see the full error message
            const { id, title, icon, isClosable = true } = viz
            cfg[id] = {
              title,
              type: 'component',
              componentName: id,
              icon,
              componentState: {},
              isClosable,
            }
            return cfg
          }, {} as { [key: string]: any })
          if (goldenLayout.root.contentItems.length === 0) {
            goldenLayout.root.addChild({
              type: 'column',
              content: [configs['openlayers']],
            })
          } else {
            if (goldenLayout.root.contentItems[0].isColumn) {
              goldenLayout.root.contentItems[0].contentItems[0].addChild(
                configs['openlayers'],
                0
              )
            } else {
              goldenLayout.root.contentItems[0].addChild(
                configs['openlayers'],
                0
              )
            }
          }
        }
      }
    }
  )
}
