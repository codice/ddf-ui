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
import React from 'react';
import _ from 'underscore';
import Backbone from 'backbone';
import { LayerItemCollectionViewReact } from '../layer-item/layer-item.collection.view';
import user from '../singletons/user-instance';
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
import { useListenTo } from '../../component/selection-checkbox/useBackbone.hook';
import debounce from 'lodash.debounce';
// this is to track focus, since on reordering rerenders and loses focus
var FocusModel = Backbone.Model.extend({
    defaults: {
        id: undefined,
        direction: undefined,
    },
    directions: {
        up: 'up',
        down: 'down',
    },
    clear: function () {
        this.set({
            id: undefined,
            direction: undefined,
        });
    },
    setUp: function (id) {
        this.set({
            id: id,
            direction: this.directions.up,
        });
    },
    setDown: function (id) {
        this.set({
            id: id,
            direction: this.directions.down,
        });
    },
    getDirection: function () {
        return this.get('direction');
    },
    isUp: function () {
        return this.getDirection() === this.directions.up;
    },
    isDown: function () {
        return this.getDirection() === this.directions.down;
    },
});
var LayersViewReact = function (props) {
    var _a;
    var getImageryProviders = useConfiguration().getImageryProviders;
    var _b = __read(React.useState(new FocusModel()), 1), focusModel = _b[0];
    var containerElementRef = React.useRef(null);
    var layers = (_a = props.layers) !== null && _a !== void 0 ? _a : user.get('user>preferences>mapLayers');
    var savePreferencesCallback = React.useMemo(function () {
        if (props.layers) {
            return function () { };
        }
        return debounce(function () {
            user.get('user>preferences').savePreferences();
        }, 100);
    }, []);
    useListenTo(layers, 'change:alpha change:show', function () {
        savePreferencesCallback();
    });
    return (React.createElement("div", { "data-id": "layers-container", ref: containerElementRef },
        React.createElement("div", { className: "text-xl text-center" }, "Layers"),
        React.createElement("div", { className: "layers" },
            React.createElement(LayerItemCollectionViewReact, { collection: layers, updateOrdering: function () {
                    var _a;
                    _.forEach(
                    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'NodeListOf<Element> | undefined'... Remove this comment to see the full error message
                    (_a = containerElementRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll(".layer-item"), function (element, index) {
                        layers.get(element.getAttribute('layer-id')).set('order', index);
                    });
                    layers.sort();
                    savePreferencesCallback();
                }, focusModel: focusModel })),
        React.createElement("div", { className: "footer" },
            React.createElement(Button, { "data-id": "reset-to-defaults-button", onClick: function () {
                    focusModel.clear();
                    layers.forEach(function (viewLayer) {
                        var name = viewLayer.get('name');
                        var defaultConfig = _.find(getImageryProviders(), function (layerObj) { return name === layerObj.name; });
                        viewLayer.set(defaultConfig);
                    });
                    layers.sort();
                    savePreferencesCallback();
                } },
                React.createElement("span", null, "Reset to Defaults")))));
};
export default hot(module)(LayersViewReact);
//# sourceMappingURL=layers.view.js.map