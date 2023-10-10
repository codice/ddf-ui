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
import React from 'react';
import styled from 'styled-components';
import { Visualizations } from '../../component/visualization/visualizations';
var CustomElement = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  height: 100%;\n  width: 100%;\n  display: block;\n"], ["\n  height: 100%;\n  width: 100%;\n  display: block;\n"])));
var Visualization = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  opacity: ", ";\n  padding: ", ";\n  :hover {\n    opacity: 1;\n  }\n  white-space: nowrap;\n  cursor: move;\n"], ["\n  opacity: ", ";\n  padding: ", ";\n  :hover {\n    opacity: 1;\n  }\n  white-space: nowrap;\n  cursor: move;\n"])), function (props) { return props.theme.minimumOpacity; }, function (props) { return props.theme.largeSpacing; });
var VisualizationIcon = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  text-align: center;\n  width: ", ";\n  display: inline-block;\n  vertical-align: middle;\n"], ["\n  text-align: center;\n  width: ", ";\n  display: inline-block;\n  vertical-align: middle;\n"])), function (props) { return props.theme.minimumButtonSize; });
var VisualizationText = styled.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  width: calc(100% - ", ");\n  font-size: ", ";\n  overflow: hidden;\n  text-overflow: ellipsis;\n  display: inline-block;\n  vertical-align: middle;\n"], ["\n  width: calc(100% - ", ");\n  font-size: ", ";\n  overflow: hidden;\n  text-overflow: ellipsis;\n  display: inline-block;\n  vertical-align: middle;\n"])), function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.mediumFontSize; });
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
export var unMaximize = function (contentItem) {
    if (contentItem.isMaximised) {
        contentItem.toggleMaximise();
        return true;
    }
    else if (contentItem.contentItems.length === 0) {
        return false;
    }
    else {
        return Array.some(contentItem.contentItems, function (subContentItem) {
            return unMaximize(subContentItem);
        });
    }
};
var VisualizationSelector = /** @class */ (function (_super) {
    __extends(VisualizationSelector, _super);
    function VisualizationSelector(props) {
        var _this = _super.call(this, props) || this;
        _this.dragSources = [];
        _this.openlayers = React.createRef();
        _this.cesium = React.createRef();
        _this.inspector = React.createRef();
        _this.histogram = React.createRef();
        _this.table = React.createRef();
        _this.props.goldenLayout.on('stateChanged', function () {
            _this.forceUpdate();
        });
        return _this;
    }
    VisualizationSelector.prototype.render = function () {
        var _this = this;
        ;
        window._gl = this.props.goldenLayout;
        return (React.createElement(CustomElement, { "data-id": "visualization-menu", onClick: this.handleChoice.bind(this) }, Object.values(configs).map(function (_a, index) {
            var title = _a.title, icon = _a.icon, componentName = _a.componentName;
            return (React.createElement(Visualization, { key: index.toString(), ref: function (x) {
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    _this[componentName] = x;
                }, onMouseDown: _this.handleMouseDown.bind(_this, componentName), onMouseUp: _this.handleMouseUp.bind(_this, componentName), className: JSON.stringify(_this.props.goldenLayout.toConfig()).includes("\"componentName\":\"".concat(componentName, "\""))
                    ? '' /** change to hidden to only allow one of each visual */
                    : '' },
                React.createElement(VisualizationIcon, { className: icon }),
                React.createElement(VisualizationText, null, title)));
        }, this)));
    };
    VisualizationSelector.prototype.componentDidMount = function () {
        var _this = this;
        this.dragSources = [];
        this.dragSources = Object.keys(configs).map(function (key) {
            return _this.props.goldenLayout.createDragSource(_this[key], configs[key]);
        });
        this.listenToDragSources();
    };
    VisualizationSelector.prototype.listenToDragStart = function (dragSource) {
        var _this = this;
        dragSource._dragListener.on('dragStart', function () {
            _this.interimState = false;
        });
    };
    VisualizationSelector.prototype.listenToDragStop = function (dragSource) {
        var _this = this;
        dragSource._dragListener.on('dragStop', function () {
            _this.listenToDragStart(dragSource);
            _this.listenToDragStop(dragSource);
        });
    };
    VisualizationSelector.prototype.listenToDragSources = function () {
        var _this = this;
        this.dragSources.forEach(function (dragSource) {
            _this.listenToDragStart(dragSource);
            _this.listenToDragStop(dragSource);
        });
    };
    VisualizationSelector.prototype.handleChoice = function () {
        this.props.onClose();
    };
    VisualizationSelector.prototype.handleMouseDown = function (_event, choice) {
        unMaximize(this.props.goldenLayout.root);
        this.interimState = true;
        this.interimChoice = choice;
    };
    VisualizationSelector.prototype.handleMouseUp = function (choice) {
        if (this.interimState) {
            if (this.props.goldenLayout.root.contentItems.length === 0) {
                this.props.goldenLayout.root.addChild({
                    type: 'column',
                    content: [configs[choice]],
                });
            }
            else {
                if (this.props.goldenLayout.root.contentItems[0].isColumn) {
                    this.props.goldenLayout.root.contentItems[0].contentItems[0].addChild(configs[choice], 0);
                }
                else {
                    this.props.goldenLayout.root.contentItems[0].addChild(configs[choice], 0);
                }
            }
        }
        this.interimState = false;
    };
    return VisualizationSelector;
}(React.Component));
export default VisualizationSelector;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=visualization-selector.js.map