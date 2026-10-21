import { __assign, __extends, __makeTemplateObject } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        return (_jsx(CustomElement, { "data-id": "visualization-menu", onClick: this.handleChoice.bind(this), children: Object.values(configs).map(function (_a, index) {
                var title = _a.title, icon = _a.icon, componentName = _a.componentName;
                return (_jsxs(Visualization, { ref: function (x) {
                        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                        _this[componentName] = x;
                    }, onMouseDown: _this.handleMouseDown.bind(_this, componentName), onMouseUp: _this.handleMouseUp.bind(_this, componentName), className: JSON.stringify(_this.props.goldenLayout.toConfig()).includes("\"componentName\":\"".concat(componentName, "\""))
                        ? '' /** change to hidden to only allow one of each visual */
                        : '', children: [_jsx(VisualizationIcon, { className: icon }), _jsx(VisualizationText, { children: title })] }, index.toString()));
            }, this) }));
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
            var content = __assign({}, configs[choice]);
            if (this.props.goldenLayout.root.contentItems.length === 0) {
                this.props.goldenLayout.root.addChild({
                    type: 'column',
                    content: [content],
                });
            }
            else {
                if (this.props.goldenLayout.root.contentItems[0].isColumn) {
                    this.props.goldenLayout.root.contentItems[0].contentItems[0].addChild(content, 0);
                }
                else {
                    this.props.goldenLayout.root.contentItems[0].addChild(content, 0);
                }
            }
        }
        this.interimState = false;
    };
    return VisualizationSelector;
}(React.Component));
export default VisualizationSelector;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXphdGlvbi1zZWxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvdmlzdWFsaXphdGlvbi1zZWxlY3Rvci92aXN1YWxpemF0aW9uLXNlbGVjdG9yLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzdFLElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLDJIQUFBLHdEQUkvQixJQUFBLENBQUE7QUFDRCxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsR0FBRyxzTEFBQSxlQUNuQixFQUFxQyxnQkFDckMsRUFBbUMsZ0ZBTS9DLEtBUFksVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBMUIsQ0FBMEIsRUFDckMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBeEIsQ0FBd0IsQ0FNL0MsQ0FBQTtBQUNELElBQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLEdBQUcsbUtBQUEsb0NBRXpCLEVBQXdDLDBEQUdsRCxLQUhVLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBN0IsQ0FBNkIsQ0FHbEQsQ0FBQTtBQUNELElBQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLEdBQUcsOE5BQUEseUJBQ2IsRUFBd0MsbUJBQ2hELEVBQXFDLDJHQUtuRCxLQU5zQixVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQTdCLENBQTZCLEVBQ2hELFVBQUMsS0FBSyxJQUFLLE9B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RSxRQUFRO29CQUNkLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztpQkFDbkIsQ0FBQyxDQUFBO1lBQ0osQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDMUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUNuRSxPQUFPLEVBQ1AsQ0FBQyxDQUNGLENBQUE7Z0JBQ0gsQ0FBQztxQkFBTSxDQUFDO29CQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQTtnQkFDbkUsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7SUFDM0IsQ0FBQztJQUNILDRCQUFDO0FBQUQsQ0FBQyxBQWhIRCxDQUFvQyxLQUFLLENBQUMsU0FBUyxHQWdIbEQ7QUFDRCxlQUFlLHFCQUFxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IHsgVmlzdWFsaXphdGlvbnMgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvdmlzdWFsaXphdGlvbi92aXN1YWxpemF0aW9ucydcbmNvbnN0IEN1c3RvbUVsZW1lbnQgPSBzdHlsZWQuZGl2YFxuICBoZWlnaHQ6IDEwMCU7XG4gIHdpZHRoOiAxMDAlO1xuICBkaXNwbGF5OiBibG9jaztcbmBcbmNvbnN0IFZpc3VhbGl6YXRpb24gPSBzdHlsZWQuZGl2YFxuICBvcGFjaXR5OiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWluaW11bU9wYWNpdHl9O1xuICBwYWRkaW5nOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubGFyZ2VTcGFjaW5nfTtcbiAgOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAxO1xuICB9XG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIGN1cnNvcjogbW92ZTtcbmBcbmNvbnN0IFZpc3VhbGl6YXRpb25JY29uID0gc3R5bGVkLmRpdmBcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB3aWR0aDogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1pbmltdW1CdXR0b25TaXplfTtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuYFxuY29uc3QgVmlzdWFsaXphdGlvblRleHQgPSBzdHlsZWQuZGl2YFxuICB3aWR0aDogY2FsYygxMDAlIC0gJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1pbmltdW1CdXR0b25TaXplfSk7XG4gIGZvbnQtc2l6ZTogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1lZGl1bUZvbnRTaXplfTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbmBcbmNvbnN0IGNvbmZpZ3MgPSBWaXN1YWxpemF0aW9ucy5yZWR1Y2UoKGNmZywgdml6KSA9PiB7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzM5KSBGSVhNRTogUHJvcGVydHkgJ2lzQ2xvc2FibGUnIGRvZXMgbm90IGV4aXN0IG9uIHR5cGUgJ1Zpc3UuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICBjb25zdCB7IGlkLCB0aXRsZSwgaWNvbiwgaXNDbG9zYWJsZSA9IHRydWUgfSA9IHZpelxuICBjZmdbaWRdID0ge1xuICAgIHRpdGxlLFxuICAgIHR5cGU6ICdjb21wb25lbnQnLFxuICAgIGNvbXBvbmVudE5hbWU6IGlkLFxuICAgIGljb24sXG4gICAgY29tcG9uZW50U3RhdGU6IHt9LFxuICAgIGlzQ2xvc2FibGUsXG4gIH1cbiAgcmV0dXJuIGNmZ1xufSwge30gYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSlcbmV4cG9ydCBjb25zdCB1bk1heGltaXplID0gKGNvbnRlbnRJdGVtOiBhbnkpID0+IHtcbiAgaWYgKGNvbnRlbnRJdGVtLmlzTWF4aW1pc2VkKSB7XG4gICAgY29udGVudEl0ZW0udG9nZ2xlTWF4aW1pc2UoKVxuICAgIHJldHVybiB0cnVlXG4gIH0gZWxzZSBpZiAoY29udGVudEl0ZW0uY29udGVudEl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9IGVsc2Uge1xuICAgIHJldHVybiAoQXJyYXkgYXMgYW55KS5zb21lKFxuICAgICAgY29udGVudEl0ZW0uY29udGVudEl0ZW1zLFxuICAgICAgKHN1YkNvbnRlbnRJdGVtOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIHVuTWF4aW1pemUoc3ViQ29udGVudEl0ZW0pXG4gICAgICB9XG4gICAgKVxuICB9XG59XG5jbGFzcyBWaXN1YWxpemF0aW9uU2VsZWN0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8e1xuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBvbkNsb3NlOiAoKSA9PiB2b2lkXG59PiB7XG4gIGNlc2l1bTogYW55XG4gIGhpc3RvZ3JhbTogYW55XG4gIGluc3BlY3RvcjogYW55XG4gIGludGVyaW1DaG9pY2U6IGFueVxuICBpbnRlcmltU3RhdGU6IGFueVxuICBvcGVubGF5ZXJzOiBhbnlcbiAgdGFibGU6IGFueVxuICBkcmFnU291cmNlcyA9IFtdIGFzIGFueVtdXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBhbnkpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLm9wZW5sYXllcnMgPSBSZWFjdC5jcmVhdGVSZWYoKVxuICAgIHRoaXMuY2VzaXVtID0gUmVhY3QuY3JlYXRlUmVmKClcbiAgICB0aGlzLmluc3BlY3RvciA9IFJlYWN0LmNyZWF0ZVJlZigpXG4gICAgdGhpcy5oaXN0b2dyYW0gPSBSZWFjdC5jcmVhdGVSZWYoKVxuICAgIHRoaXMudGFibGUgPSBSZWFjdC5jcmVhdGVSZWYoKVxuICAgIHRoaXMucHJvcHMuZ29sZGVuTGF5b3V0Lm9uKCdzdGF0ZUNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKClcbiAgICB9KVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICA7KHdpbmRvdyBhcyBhbnkpLl9nbCA9IHRoaXMucHJvcHMuZ29sZGVuTGF5b3V0XG4gICAgcmV0dXJuIChcbiAgICAgIDxDdXN0b21FbGVtZW50XG4gICAgICAgIGRhdGEtaWQ9XCJ2aXN1YWxpemF0aW9uLW1lbnVcIlxuICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZUNob2ljZS5iaW5kKHRoaXMpfVxuICAgICAgPlxuICAgICAgICB7T2JqZWN0LnZhbHVlcyhjb25maWdzKS5tYXAoXG4gICAgICAgICAgKHsgdGl0bGUsIGljb24sIGNvbXBvbmVudE5hbWUgfSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDxWaXN1YWxpemF0aW9uXG4gICAgICAgICAgICAgIGtleT17aW5kZXgudG9TdHJpbmcoKX1cbiAgICAgICAgICAgICAgcmVmPXsoeDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICAgICAgdGhpc1tjb21wb25lbnROYW1lXSA9IHhcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3duLmJpbmQodGhpcywgY29tcG9uZW50TmFtZSl9XG4gICAgICAgICAgICAgIG9uTW91c2VVcD17dGhpcy5oYW5kbGVNb3VzZVVwLmJpbmQodGhpcywgY29tcG9uZW50TmFtZSl9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17XG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5nb2xkZW5MYXlvdXQudG9Db25maWcoKSkuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgICBgXCJjb21wb25lbnROYW1lXCI6XCIke2NvbXBvbmVudE5hbWV9XCJgXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgPyAnJyAvKiogY2hhbmdlIHRvIGhpZGRlbiB0byBvbmx5IGFsbG93IG9uZSBvZiBlYWNoIHZpc3VhbCAqL1xuICAgICAgICAgICAgICAgICAgOiAnJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxWaXN1YWxpemF0aW9uSWNvbiBjbGFzc05hbWU9e2ljb259IC8+XG4gICAgICAgICAgICAgIDxWaXN1YWxpemF0aW9uVGV4dD57dGl0bGV9PC9WaXN1YWxpemF0aW9uVGV4dD5cbiAgICAgICAgICAgIDwvVmlzdWFsaXphdGlvbj5cbiAgICAgICAgICApLFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKX1cbiAgICAgIDwvQ3VzdG9tRWxlbWVudD5cbiAgICApXG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5kcmFnU291cmNlcyA9IFtdIGFzIGFueVtdXG4gICAgdGhpcy5kcmFnU291cmNlcyA9IE9iamVjdC5rZXlzKGNvbmZpZ3MpLm1hcCgoa2V5KSA9PlxuICAgICAgdGhpcy5wcm9wcy5nb2xkZW5MYXlvdXQuY3JlYXRlRHJhZ1NvdXJjZSgodGhpcyBhcyBhbnkpW2tleV0sIGNvbmZpZ3Nba2V5XSlcbiAgICApXG4gICAgdGhpcy5saXN0ZW5Ub0RyYWdTb3VyY2VzKClcbiAgfVxuICBsaXN0ZW5Ub0RyYWdTdGFydChkcmFnU291cmNlOiBhbnkpIHtcbiAgICBkcmFnU291cmNlLl9kcmFnTGlzdGVuZXIub24oJ2RyYWdTdGFydCcsICgpID0+IHtcbiAgICAgIHRoaXMuaW50ZXJpbVN0YXRlID0gZmFsc2VcbiAgICB9KVxuICB9XG4gIGxpc3RlblRvRHJhZ1N0b3AoZHJhZ1NvdXJjZTogYW55KSB7XG4gICAgZHJhZ1NvdXJjZS5fZHJhZ0xpc3RlbmVyLm9uKCdkcmFnU3RvcCcsICgpID0+IHtcbiAgICAgIHRoaXMubGlzdGVuVG9EcmFnU3RhcnQoZHJhZ1NvdXJjZSlcbiAgICAgIHRoaXMubGlzdGVuVG9EcmFnU3RvcChkcmFnU291cmNlKVxuICAgIH0pXG4gIH1cbiAgbGlzdGVuVG9EcmFnU291cmNlcygpIHtcbiAgICB0aGlzLmRyYWdTb3VyY2VzLmZvckVhY2goKGRyYWdTb3VyY2UpID0+IHtcbiAgICAgIHRoaXMubGlzdGVuVG9EcmFnU3RhcnQoZHJhZ1NvdXJjZSlcbiAgICAgIHRoaXMubGlzdGVuVG9EcmFnU3RvcChkcmFnU291cmNlKVxuICAgIH0pXG4gIH1cbiAgaGFuZGxlQ2hvaWNlKCkge1xuICAgIHRoaXMucHJvcHMub25DbG9zZSgpXG4gIH1cbiAgaGFuZGxlTW91c2VEb3duKF9ldmVudDogYW55LCBjaG9pY2U6IGFueSkge1xuICAgIHVuTWF4aW1pemUodGhpcy5wcm9wcy5nb2xkZW5MYXlvdXQucm9vdClcbiAgICB0aGlzLmludGVyaW1TdGF0ZSA9IHRydWVcbiAgICB0aGlzLmludGVyaW1DaG9pY2UgPSBjaG9pY2VcbiAgfVxuICBoYW5kbGVNb3VzZVVwKGNob2ljZTogYW55KSB7XG4gICAgaWYgKHRoaXMuaW50ZXJpbVN0YXRlKSB7XG4gICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAuLi5jb25maWdzW2Nob2ljZV0sXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wcm9wcy5nb2xkZW5MYXlvdXQucm9vdC5jb250ZW50SXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMucHJvcHMuZ29sZGVuTGF5b3V0LnJvb3QuYWRkQ2hpbGQoe1xuICAgICAgICAgIHR5cGU6ICdjb2x1bW4nLFxuICAgICAgICAgIGNvbnRlbnQ6IFtjb250ZW50XSxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmdvbGRlbkxheW91dC5yb290LmNvbnRlbnRJdGVtc1swXS5pc0NvbHVtbikge1xuICAgICAgICAgIHRoaXMucHJvcHMuZ29sZGVuTGF5b3V0LnJvb3QuY29udGVudEl0ZW1zWzBdLmNvbnRlbnRJdGVtc1swXS5hZGRDaGlsZChcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAwXG4gICAgICAgICAgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucHJvcHMuZ29sZGVuTGF5b3V0LnJvb3QuY29udGVudEl0ZW1zWzBdLmFkZENoaWxkKGNvbnRlbnQsIDApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5pbnRlcmltU3RhdGUgPSBmYWxzZVxuICB9XG59XG5leHBvcnQgZGVmYXVsdCBWaXN1YWxpemF0aW9uU2VsZWN0b3JcbiJdfQ==