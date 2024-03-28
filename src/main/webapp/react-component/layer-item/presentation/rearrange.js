import { __extends, __makeTemplateObject } from "tslib";
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
import styled from 'styled-components';
import { hot } from 'react-hot-loader';
import { IsButton, HighlightBehavior, GrabCursor } from '.';
/* stylelint-disable block-no-empty */
var Rearrange = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject([""], [""])));
var RearrangeButton = styled.button(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  ", ";\n  ", ";\n  z-index: 1;\n  position: absolute;\n  height: calc(0.5 * ", ");\n  line-height: calc(0.5 * ", ");\n"], ["\n  ", ";\n  ", ";\n  z-index: 1;\n  position: absolute;\n  height: calc(0.5 * ", ");\n  line-height: calc(0.5 * ", ");\n"])), function (props) { return IsButton(props.theme); }, HighlightBehavior({ initialOpacity: 0 }), function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; });
var Down = styled(RearrangeButton)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  top: calc(100% - 0.5 * ", ");\n"], ["\n  top: calc(100% - 0.5 * ", ");\n"])), function (props) { return props.theme.minimumButtonSize; });
var Up = styled(RearrangeButton)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  top: 0px;\n"], ["\n  top: 0px;\n"])));
var RearrangeIcon = styled.span(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translateX(-50%) translateY(-50%);\n"], ["\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translateX(-50%) translateY(-50%);\n"])));
var Drag = styled.button(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  ", ";\n  ", ";\n  ", ";\n  vertical-align: middle;\n  position: absolute;\n  top: 0px;\n  height: 100%;\n"], ["\n  ", ";\n  ", ";\n  ", ";\n  vertical-align: middle;\n  position: absolute;\n  top: 0px;\n  height: 100%;\n"])), function (props) { return IsButton(props.theme); }, function (props) {
    return HighlightBehavior({ initialOpacity: props.theme.minimumOpacity });
}, GrabCursor);
var RearrangeUp = function (props, forwardedRef) {
    var isTop = props.order.isTop;
    var handleClick = props.actions.moveUp;
    return (!isTop && (React.createElement(Up, { ref: forwardedRef, onClick: handleClick },
        React.createElement(RearrangeIcon, { className: "fa fa-angle-up" }))));
};
var RearrangeDown = function (props, forwardedRef) {
    var isBottom = props.order.isBottom;
    var handleClick = props.actions.moveDown;
    return (!isBottom && (React.createElement(Down, { ref: forwardedRef, onClick: handleClick },
        React.createElement(RearrangeIcon, { className: "fa fa-angle-down" }))));
};
var LayerRearrange = /** @class */ (function (_super) {
    __extends(LayerRearrange, _super);
    function LayerRearrange(props) {
        var _this = _super.call(this, props) || this;
        _this.down = React.createRef();
        _this.up = React.createRef();
        return _this;
    }
    LayerRearrange.prototype.componentDidMount = function () {
        var _a = this.props.order, isTop = _a.isTop, isBottom = _a.isBottom;
        var id = this.props.layerInfo.id;
        var focusModel = this.props.options.focusModel;
        if (focusModel.id === id) {
            var focusRef_1 = focusModel.isUp() ? this.up : this.down;
            focusRef_1 = isTop ? this.down : focusRef_1;
            focusRef_1 = isBottom ? this.up : focusRef_1;
            setTimeout(function () { return focusRef_1.current.focus(); }, 0);
        }
    };
    LayerRearrange.prototype.render = function () {
        return (React.createElement(Rearrange, null,
            RearrangeUp(this.props, this.up),
            RearrangeDown(this.props, this.down),
            React.createElement(Drag, { "data-id": "layer-rearrange-button", className: "layer-rearrange" },
                React.createElement("span", { className: "fa fa-arrows-v" }))));
    };
    return LayerRearrange;
}(React.Component));
export default hot(module)(LayerRearrange);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
//# sourceMappingURL=rearrange.js.map