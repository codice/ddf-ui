import { __read } from "tslib";
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
/* global require*/
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'sort... Remove this comment to see the full error message
import Sortable from 'sortablejs';
import * as React from 'react';
import LayerItem from '../../react-component/layer-item';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
function useSortable(_a) {
    var sortableElement = _a.sortableElement, updateOrdering = _a.updateOrdering, focusModel = _a.focusModel;
    var _b = __read(React.useState(null), 2), sortable = _b[0], setSortable = _b[1];
    React.useEffect(function () {
        if (sortableElement) {
            setSortable(Sortable.create(sortableElement, {
                handle: 'button.layer-rearrange',
                animation: 250,
                draggable: '>*',
                onEnd: function () {
                    focusModel.clear();
                    updateOrdering();
                },
            }));
        }
    }, [sortableElement]);
    return sortable;
}
export var LayerItemCollectionViewReact = function (_a) {
    var collection = _a.collection, updateOrdering = _a.updateOrdering, focusModel = _a.focusModel;
    var _b = __read(React.useState(Math.random()), 2), setForceRender = _b[1];
    var _c = __read(React.useState(null), 2), sortableElement = _c[0], setSortableElement = _c[1];
    var sortable = useSortable({ sortableElement: sortableElement, updateOrdering: updateOrdering, focusModel: focusModel });
    useListenTo(collection, 'sort', function () {
        setForceRender(Math.random());
    });
    return (React.createElement("div", { ref: setSortableElement }, collection.map(function (layer) {
        return (React.createElement(LayerItem, { key: layer.id, layer: layer, focusModel: focusModel, updateOrdering: updateOrdering, sortable: sortable }));
    })));
};
//# sourceMappingURL=layer-item.collection.view.js.map