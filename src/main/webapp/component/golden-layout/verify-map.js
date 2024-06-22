import { __read, __spreadArray } from "tslib";
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
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import wreqr from '../../js/wreqr';
import { Visualizations } from '../visualization/visualizations';
function findMap(item) {
    return item.componentName === 'openlayers' || item.componentName === 'cesium';
}
function searchPopouts(popouts) {
    var popoutItems = [];
    popouts.forEach(function (popout) {
        popoutItems.push.apply(popoutItems, __spreadArray([], __read(popout.getGlInstance().root.getItemsByFilter(findMap)), false));
    });
    return popoutItems;
}
/**
 *  Notice that we are only forwarding events that start with 'search' for now, as these are drawing events.
 */
export var useVerifyMapExistsWhenDrawing = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized;
    useListenTo(wreqr.vent, 'search:drawline search:drawpoly search:drawbbox search:drawcircle', function () {
        if (goldenLayout && isInitialized) {
            //     // Launch the 2D Map (openlayers) if it's not already open
            var contentItems = goldenLayout.root.getItemsByFilter(findMap);
            var popoutItems = searchPopouts(goldenLayout.openPopouts);
            if (contentItems.length === 0 && popoutItems.length === 0) {
                var configs = Visualizations.reduce(function (cfg, viz) {
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isClosable' does not exist on type 'Visu... Remove this comment to see the full error message
                    var id = viz.id, title = viz.title, icon = viz.icon, _a = viz.isClosable, isClosable = _a === void 0 ? true : _a;
                    cfg[id] = {
                        title: title,
                        type: 'component',
                        componentName: id,
                        icon: icon,
                        componentState: {},
                        isClosable: isClosable,
                    };
                    return cfg;
                }, {});
                if (goldenLayout.root.contentItems.length === 0) {
                    goldenLayout.root.addChild({
                        type: 'column',
                        content: [configs['openlayers']],
                    });
                }
                else {
                    if (goldenLayout.root.contentItems[0].isColumn) {
                        goldenLayout.root.contentItems[0].contentItems[0].addChild(configs['openlayers'], 0);
                    }
                    else {
                        goldenLayout.root.contentItems[0].addChild(configs['openlayers'], 0);
                    }
                }
            }
        }
    });
};
//# sourceMappingURL=verify-map.js.map