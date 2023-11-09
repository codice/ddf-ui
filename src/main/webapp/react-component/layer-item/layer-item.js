import { __assign, __read } from "tslib";
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
import * as React from 'react';
import { hot } from 'react-hot-loader';
import LayerItemPresentation from './presentation/layer-item';
import { useListenTo } from '../../component/selection-checkbox/useBackbone.hook';
var mapPropsToState = function (props) {
    var layer = props.layer;
    var show = layer.get('show');
    var alpha = layer.get('alpha');
    var order = layer.get('order');
    var isBottom = layer.collection.last().id === layer.id;
    var isTop = layer.collection.first().id === layer.id;
    return {
        order: { order: order, isBottom: isBottom, isTop: isTop },
        visibility: { show: show, alpha: alpha },
    };
};
var LayerItem = function (props) {
    var _a = __read(React.useState(mapPropsToState(props)), 2), state = _a[0], setState = _a[1];
    useListenTo(props.layer, 'change:show change:alpha change:order', function () {
        setState(mapPropsToState(props));
    });
    useListenTo(props.layer.collection, 'sort remove add', function () {
        setState(mapPropsToState(props));
    });
    var layer = props.layer;
    var id = layer.get('id');
    var layerInfo = {
        name: layer.get('name'),
        warning: layer.get('warning'),
        isRemovable: layer.has('userRemovable'),
        id: id,
    };
    var actions = {
        updateLayerShow: function () {
            var show = state.visibility.show;
            props.layer.set('show', !show);
        },
        updateLayerAlpha: function (e) {
            props.layer.set('alpha', e.target.value);
        },
        moveDown: function () {
            var focusModel = props.focusModel, layer = props.layer, sortable = props.sortable, updateOrdering = props.updateOrdering;
            var ordering = sortable.toArray();
            var currentIndex = ordering.indexOf(layer.id);
            ordering.splice(currentIndex, 1);
            ordering.splice(currentIndex + 1, 0, layer.id);
            sortable.sort(ordering);
            focusModel.setDown(layer.id);
            updateOrdering();
        },
        moveUp: function () {
            var layer = props.layer, sortable = props.sortable, focusModel = props.focusModel, updateOrdering = props.updateOrdering;
            var ordering = sortable.toArray();
            var currentIndex = ordering.indexOf(layer.id);
            ordering.splice(currentIndex - 1, 0, layer.id);
            ordering.splice(currentIndex + 1, 1);
            sortable.sort(ordering);
            focusModel.setUp(layer.id);
            updateOrdering();
        },
        onRemove: function () {
            var layer = props.layer;
            layer.collection.remove(layer);
        },
    };
    var presProps = __assign(__assign({}, state), { layerInfo: layerInfo, actions: actions, options: { focusModel: props.focusModel } });
    return (React.createElement("div", { className: "layer-item", "data-id": id, "layer-id": id },
        React.createElement(LayerItemPresentation, __assign({}, presProps))));
};
export default hot(module)(LayerItem);
//# sourceMappingURL=layer-item.js.map