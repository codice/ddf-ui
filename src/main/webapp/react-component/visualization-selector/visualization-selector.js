import { __assign, __extends, __makeTemplateObject } from "tslib";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXphdGlvbi1zZWxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvdmlzdWFsaXphdGlvbi1zZWxlY3Rvci92aXN1YWxpemF0aW9uLXNlbGVjdG9yLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDN0UsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLEdBQUcsMkhBQUEsd0RBSS9CLElBQUEsQ0FBQTtBQUNELElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLHNMQUFBLGVBQ25CLEVBQXFDLGdCQUNyQyxFQUFtQyxnRkFNL0MsS0FQWSxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUExQixDQUEwQixFQUNyQyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUF4QixDQUF3QixDQU0vQyxDQUFBO0FBQ0QsSUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsR0FBRyxtS0FBQSxvQ0FFekIsRUFBd0MsMERBR2xELEtBSFUsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUE3QixDQUE2QixDQUdsRCxDQUFBO0FBQ0QsSUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsR0FBRyw4TkFBQSx5QkFDYixFQUF3QyxtQkFDaEQsRUFBcUMsMkdBS25ELEtBTnNCLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBN0IsQ0FBNkIsRUFDaEQsVUFBQyxLQUFLLElBQUssT0FB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TyxDQUFDO2lCQUNuQixDQUFDLENBQUE7YUFDSDtpQkFBTTtnQkFDTCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO29CQUN6RCxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQ25FLE9BQU8sRUFDUCxDQUFDLENBQ0YsQ0FBQTtpQkFDRjtxQkFBTTtvQkFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUE7aUJBQ2xFO2FBQ0Y7U0FDRjtRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFBO0lBQzNCLENBQUM7SUFDSCw0QkFBQztBQUFELENBQUMsQUFoSEQsQ0FBb0MsS0FBSyxDQUFDLFNBQVMsR0FnSGxEO0FBQ0QsZUFBZSxxQkFBcUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCB7IFZpc3VhbGl6YXRpb25zIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vdmlzdWFsaXphdGlvbnMnXG5jb25zdCBDdXN0b21FbGVtZW50ID0gc3R5bGVkLmRpdmBcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMTAwJTtcbiAgZGlzcGxheTogYmxvY2s7XG5gXG5jb25zdCBWaXN1YWxpemF0aW9uID0gc3R5bGVkLmRpdmBcbiAgb3BhY2l0eTogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1pbmltdW1PcGFjaXR5fTtcbiAgcGFkZGluZzogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLmxhcmdlU3BhY2luZ307XG4gIDpob3ZlciB7XG4gICAgb3BhY2l0eTogMTtcbiAgfVxuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICBjdXJzb3I6IG1vdmU7XG5gXG5jb25zdCBWaXN1YWxpemF0aW9uSWNvbiA9IHN0eWxlZC5kaXZgXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgd2lkdGg6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5taW5pbXVtQnV0dG9uU2l6ZX07XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbmBcbmNvbnN0IFZpc3VhbGl6YXRpb25UZXh0ID0gc3R5bGVkLmRpdmBcbiAgd2lkdGg6IGNhbGMoMTAwJSAtICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5taW5pbXVtQnV0dG9uU2l6ZX0pO1xuICBmb250LXNpemU6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5tZWRpdW1Gb250U2l6ZX07XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG5gXG5jb25zdCBjb25maWdzID0gVmlzdWFsaXphdGlvbnMucmVkdWNlKChjZmcsIHZpeikgPT4ge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMzOSkgRklYTUU6IFByb3BlcnR5ICdpc0Nsb3NhYmxlJyBkb2VzIG5vdCBleGlzdCBvbiB0eXBlICdWaXN1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgY29uc3QgeyBpZCwgdGl0bGUsIGljb24sIGlzQ2xvc2FibGUgPSB0cnVlIH0gPSB2aXpcbiAgY2ZnW2lkXSA9IHtcbiAgICB0aXRsZSxcbiAgICB0eXBlOiAnY29tcG9uZW50JyxcbiAgICBjb21wb25lbnROYW1lOiBpZCxcbiAgICBpY29uLFxuICAgIGNvbXBvbmVudFN0YXRlOiB7fSxcbiAgICBpc0Nsb3NhYmxlLFxuICB9XG4gIHJldHVybiBjZmdcbn0sIHt9IGFzIHsgW2tleTogc3RyaW5nXTogYW55IH0pXG5leHBvcnQgY29uc3QgdW5NYXhpbWl6ZSA9IChjb250ZW50SXRlbTogYW55KSA9PiB7XG4gIGlmIChjb250ZW50SXRlbS5pc01heGltaXNlZCkge1xuICAgIGNvbnRlbnRJdGVtLnRvZ2dsZU1heGltaXNlKClcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGVsc2UgaWYgKGNvbnRlbnRJdGVtLmNvbnRlbnRJdGVtcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKEFycmF5IGFzIGFueSkuc29tZShcbiAgICAgIGNvbnRlbnRJdGVtLmNvbnRlbnRJdGVtcyxcbiAgICAgIChzdWJDb250ZW50SXRlbTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiB1bk1heGltaXplKHN1YkNvbnRlbnRJdGVtKVxuICAgICAgfVxuICAgIClcbiAgfVxufVxuY2xhc3MgVmlzdWFsaXphdGlvblNlbGVjdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgb25DbG9zZTogKCkgPT4gdm9pZFxufT4ge1xuICBjZXNpdW06IGFueVxuICBoaXN0b2dyYW06IGFueVxuICBpbnNwZWN0b3I6IGFueVxuICBpbnRlcmltQ2hvaWNlOiBhbnlcbiAgaW50ZXJpbVN0YXRlOiBhbnlcbiAgb3BlbmxheWVyczogYW55XG4gIHRhYmxlOiBhbnlcbiAgZHJhZ1NvdXJjZXMgPSBbXSBhcyBhbnlbXVxuICBjb25zdHJ1Y3Rvcihwcm9wczogYW55KSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5vcGVubGF5ZXJzID0gUmVhY3QuY3JlYXRlUmVmKClcbiAgICB0aGlzLmNlc2l1bSA9IFJlYWN0LmNyZWF0ZVJlZigpXG4gICAgdGhpcy5pbnNwZWN0b3IgPSBSZWFjdC5jcmVhdGVSZWYoKVxuICAgIHRoaXMuaGlzdG9ncmFtID0gUmVhY3QuY3JlYXRlUmVmKClcbiAgICB0aGlzLnRhYmxlID0gUmVhY3QuY3JlYXRlUmVmKClcbiAgICB0aGlzLnByb3BzLmdvbGRlbkxheW91dC5vbignc3RhdGVDaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpXG4gICAgfSlcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgOyh3aW5kb3cgYXMgYW55KS5fZ2wgPSB0aGlzLnByb3BzLmdvbGRlbkxheW91dFxuICAgIHJldHVybiAoXG4gICAgICA8Q3VzdG9tRWxlbWVudFxuICAgICAgICBkYXRhLWlkPVwidmlzdWFsaXphdGlvbi1tZW51XCJcbiAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVDaG9pY2UuYmluZCh0aGlzKX1cbiAgICAgID5cbiAgICAgICAge09iamVjdC52YWx1ZXMoY29uZmlncykubWFwKFxuICAgICAgICAgICh7IHRpdGxlLCBpY29uLCBjb21wb25lbnROYW1lIH0sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8VmlzdWFsaXphdGlvblxuICAgICAgICAgICAgICBrZXk9e2luZGV4LnRvU3RyaW5nKCl9XG4gICAgICAgICAgICAgIHJlZj17KHg6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgICAgIHRoaXNbY29tcG9uZW50TmFtZV0gPSB4XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bi5iaW5kKHRoaXMsIGNvbXBvbmVudE5hbWUpfVxuICAgICAgICAgICAgICBvbk1vdXNlVXA9e3RoaXMuaGFuZGxlTW91c2VVcC5iaW5kKHRoaXMsIGNvbXBvbmVudE5hbWUpfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e1xuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMuZ29sZGVuTGF5b3V0LnRvQ29uZmlnKCkpLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgICAgYFwiY29tcG9uZW50TmFtZVwiOlwiJHtjb21wb25lbnROYW1lfVwiYFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgID8gJycgLyoqIGNoYW5nZSB0byBoaWRkZW4gdG8gb25seSBhbGxvdyBvbmUgb2YgZWFjaCB2aXN1YWwgKi9cbiAgICAgICAgICAgICAgICAgIDogJydcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8VmlzdWFsaXphdGlvbkljb24gY2xhc3NOYW1lPXtpY29ufSAvPlxuICAgICAgICAgICAgICA8VmlzdWFsaXphdGlvblRleHQ+e3RpdGxlfTwvVmlzdWFsaXphdGlvblRleHQ+XG4gICAgICAgICAgICA8L1Zpc3VhbGl6YXRpb24+XG4gICAgICAgICAgKSxcbiAgICAgICAgICB0aGlzXG4gICAgICAgICl9XG4gICAgICA8L0N1c3RvbUVsZW1lbnQ+XG4gICAgKVxuICB9XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuZHJhZ1NvdXJjZXMgPSBbXSBhcyBhbnlbXVxuICAgIHRoaXMuZHJhZ1NvdXJjZXMgPSBPYmplY3Qua2V5cyhjb25maWdzKS5tYXAoKGtleSkgPT5cbiAgICAgIHRoaXMucHJvcHMuZ29sZGVuTGF5b3V0LmNyZWF0ZURyYWdTb3VyY2UoKHRoaXMgYXMgYW55KVtrZXldLCBjb25maWdzW2tleV0pXG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG9EcmFnU291cmNlcygpXG4gIH1cbiAgbGlzdGVuVG9EcmFnU3RhcnQoZHJhZ1NvdXJjZTogYW55KSB7XG4gICAgZHJhZ1NvdXJjZS5fZHJhZ0xpc3RlbmVyLm9uKCdkcmFnU3RhcnQnLCAoKSA9PiB7XG4gICAgICB0aGlzLmludGVyaW1TdGF0ZSA9IGZhbHNlXG4gICAgfSlcbiAgfVxuICBsaXN0ZW5Ub0RyYWdTdG9wKGRyYWdTb3VyY2U6IGFueSkge1xuICAgIGRyYWdTb3VyY2UuX2RyYWdMaXN0ZW5lci5vbignZHJhZ1N0b3AnLCAoKSA9PiB7XG4gICAgICB0aGlzLmxpc3RlblRvRHJhZ1N0YXJ0KGRyYWdTb3VyY2UpXG4gICAgICB0aGlzLmxpc3RlblRvRHJhZ1N0b3AoZHJhZ1NvdXJjZSlcbiAgICB9KVxuICB9XG4gIGxpc3RlblRvRHJhZ1NvdXJjZXMoKSB7XG4gICAgdGhpcy5kcmFnU291cmNlcy5mb3JFYWNoKChkcmFnU291cmNlKSA9PiB7XG4gICAgICB0aGlzLmxpc3RlblRvRHJhZ1N0YXJ0KGRyYWdTb3VyY2UpXG4gICAgICB0aGlzLmxpc3RlblRvRHJhZ1N0b3AoZHJhZ1NvdXJjZSlcbiAgICB9KVxuICB9XG4gIGhhbmRsZUNob2ljZSgpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2xvc2UoKVxuICB9XG4gIGhhbmRsZU1vdXNlRG93bihfZXZlbnQ6IGFueSwgY2hvaWNlOiBhbnkpIHtcbiAgICB1bk1heGltaXplKHRoaXMucHJvcHMuZ29sZGVuTGF5b3V0LnJvb3QpXG4gICAgdGhpcy5pbnRlcmltU3RhdGUgPSB0cnVlXG4gICAgdGhpcy5pbnRlcmltQ2hvaWNlID0gY2hvaWNlXG4gIH1cbiAgaGFuZGxlTW91c2VVcChjaG9pY2U6IGFueSkge1xuICAgIGlmICh0aGlzLmludGVyaW1TdGF0ZSkge1xuICAgICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgICAgLi4uY29uZmlnc1tjaG9pY2VdLFxuICAgICAgfVxuICAgICAgaWYgKHRoaXMucHJvcHMuZ29sZGVuTGF5b3V0LnJvb3QuY29udGVudEl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLnByb3BzLmdvbGRlbkxheW91dC5yb290LmFkZENoaWxkKHtcbiAgICAgICAgICB0eXBlOiAnY29sdW1uJyxcbiAgICAgICAgICBjb250ZW50OiBbY29udGVudF0sXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5nb2xkZW5MYXlvdXQucm9vdC5jb250ZW50SXRlbXNbMF0uaXNDb2x1bW4pIHtcbiAgICAgICAgICB0aGlzLnByb3BzLmdvbGRlbkxheW91dC5yb290LmNvbnRlbnRJdGVtc1swXS5jb250ZW50SXRlbXNbMF0uYWRkQ2hpbGQoXG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgMFxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnByb3BzLmdvbGRlbkxheW91dC5yb290LmNvbnRlbnRJdGVtc1swXS5hZGRDaGlsZChjb250ZW50LCAwKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuaW50ZXJpbVN0YXRlID0gZmFsc2VcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgVmlzdWFsaXphdGlvblNlbGVjdG9yXG4iXX0=