import { __extends } from "tslib";
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
import { hot } from 'react-hot-loader';
import * as React from 'react';
import wreqr from '../../js/wreqr';
import MapActionsPresentation from './presentation';
var getActionsWithIdPrefix = function (actions, id) {
    return actions.filter(function (action) { return action.id.startsWith(id); });
};
var MapActions = /** @class */ (function (_super) {
    __extends(MapActions, _super);
    function MapActions(props) {
        var _this = _super.call(this, props) || this;
        _this.getActions = function () {
            return _this.props.model.plain.actions;
        };
        _this.getMapActions = function () {
            return getActionsWithIdPrefix(_this.getActions(), 'catalog.data.metacard.map.');
        };
        _this.getOverlayActions = function () {
            var modelOverlayActions = getActionsWithIdPrefix(_this.getActions(), 'catalog.data.metacard.map.overlay.');
            return modelOverlayActions.map(function (modelOverlayAction) {
                return {
                    description: modelOverlayAction.description,
                    url: modelOverlayAction.url,
                    overlayText: _this.getOverlayText(modelOverlayAction.url),
                };
            });
        };
        _this.getOverlayText = function (actionUrl) {
            var overlayTransformerPrefix = 'overlay.';
            var overlayTransformerIndex = actionUrl.lastIndexOf(overlayTransformerPrefix);
            if (overlayTransformerIndex >= 0) {
                var overlayName = actionUrl.substr(overlayTransformerIndex + overlayTransformerPrefix.length);
                return 'Overlay ' + overlayName + ' on the map';
            }
            return '';
        };
        _this.overlayImage = function (event) {
            var clickedOverlayUrl = event.target.getAttribute('data-url');
            var removeOverlay = clickedOverlayUrl === _this.state.currentOverlayUrl;
            if (removeOverlay) {
                _this.props.model.currentOverlayUrl = undefined;
                _this.setState({ currentOverlayUrl: '' });
                wreqr.vent.trigger('metacard:overlay:remove', _this.props.model.plain.id);
            }
            else {
                _this.props.model.currentOverlayUrl = clickedOverlayUrl;
                _this.setState({ currentOverlayUrl: clickedOverlayUrl });
                wreqr.vent.trigger('metacard:overlay', _this.props.model);
            }
        };
        _this.state = {
            currentOverlayUrl: _this.props.model.currentOverlayUrl || '',
        };
        return _this;
    }
    MapActions.prototype.render = function () {
        var hasMapActions = this.getMapActions().length !== 0;
        return (React.createElement(MapActionsPresentation, { hasMapActions: hasMapActions, overlayActions: this.getOverlayActions(), currentOverlayUrl: this.state.currentOverlayUrl, overlayImage: this.overlayImage }));
    };
    return MapActions;
}(React.Component));
export default hot(module)(MapActions);
//# sourceMappingURL=container.js.map