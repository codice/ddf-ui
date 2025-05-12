import { __extends } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
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
        return (_jsx(MapActionsPresentation, { hasMapActions: hasMapActions, overlayActions: this.getOverlayActions(), currentOverlayUrl: this.state.currentOverlayUrl, overlayImage: this.overlayImage }));
    };
    return MapActions;
}(React.Component));
export default MapActions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tYXAtYWN0aW9ucy9jb250YWluZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUVKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sS0FBSyxNQUFNLGdCQUFnQixDQUFBO0FBQ2xDLE9BQU8sc0JBQXNCLE1BQU0sZ0JBQWdCLENBQUE7QUFRbkQsSUFBTSxzQkFBc0IsR0FBRyxVQUM3QixPQUE0QyxFQUM1QyxFQUFVO0lBRVYsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQTtBQUM3RCxDQUFDLENBQUE7QUFDRDtJQUF5Qiw4QkFBNkI7SUFDcEQsb0JBQVksS0FBWTtRQUN0QixZQUFBLE1BQUssWUFBQyxLQUFLLENBQUMsU0FBQTtRQUtkLGdCQUFVLEdBQUc7WUFDWCxPQUFPLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUE7UUFDdkMsQ0FBQyxDQUFBO1FBQ0QsbUJBQWEsR0FBRztZQUNkLE9BQU8sc0JBQXNCLENBQzNCLEtBQUksQ0FBQyxVQUFVLEVBQUUsRUFDakIsNEJBQTRCLENBQzdCLENBQUE7UUFDSCxDQUFDLENBQUE7UUFDRCx1QkFBaUIsR0FBRztZQUNsQixJQUFNLG1CQUFtQixHQUFHLHNCQUFzQixDQUNoRCxLQUFJLENBQUMsVUFBVSxFQUFFLEVBQ2pCLG9DQUFvQyxDQUNyQyxDQUFBO1lBQ0QsT0FBTyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsVUFBQyxrQkFBa0I7Z0JBQ2hELE9BQU87b0JBQ0wsV0FBVyxFQUFFLGtCQUFrQixDQUFDLFdBQVc7b0JBQzNDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxHQUFHO29CQUMzQixXQUFXLEVBQUUsS0FBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUM7aUJBQ3pELENBQUE7WUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQTtRQUNELG9CQUFjLEdBQUcsVUFBQyxTQUFpQjtZQUNqQyxJQUFNLHdCQUF3QixHQUFHLFVBQVUsQ0FBQTtZQUMzQyxJQUFNLHVCQUF1QixHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQ25ELHdCQUF3QixDQUN6QixDQUFBO1lBQ0QsSUFBSSx1QkFBdUIsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDakMsSUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FDbEMsdUJBQXVCLEdBQUcsd0JBQXdCLENBQUMsTUFBTSxDQUMxRCxDQUFBO2dCQUNELE9BQU8sVUFBVSxHQUFHLFdBQVcsR0FBRyxhQUFhLENBQUE7WUFDakQsQ0FBQztZQUNELE9BQU8sRUFBRSxDQUFBO1FBQ1gsQ0FBQyxDQUFBO1FBQ0Qsa0JBQVksR0FBRyxVQUFDLEtBQVU7WUFDeEIsSUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUMvRCxJQUFNLGFBQWEsR0FBRyxpQkFBaUIsS0FBSyxLQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFBO1lBQ3hFLElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQ2xCLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQTtnQkFDOUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLEVBQUUsRUFBRSxDQUFDLENBQ3ZDO2dCQUFDLEtBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUMxQix5QkFBeUIsRUFDekIsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDMUIsQ0FBQTtZQUNILENBQUM7aUJBQU0sQ0FBQztnQkFDTixLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQTtnQkFDdEQsS0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FDdEQ7Z0JBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNwRSxDQUFDO1FBQ0gsQ0FBQyxDQUFBO1FBdERDLEtBQUksQ0FBQyxLQUFLLEdBQUc7WUFDWCxpQkFBaUIsRUFBRSxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsSUFBSSxFQUFFO1NBQzVELENBQUE7O0lBQ0gsQ0FBQztJQW9ERCwyQkFBTSxHQUFOO1FBQ0UsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUE7UUFDdkQsT0FBTyxDQUNMLEtBQUMsc0JBQXNCLElBQ3JCLGFBQWEsRUFBRSxhQUFhLEVBQzVCLGNBQWMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFDeEMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFDL0MsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLEdBQy9CLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFDSCxpQkFBQztBQUFELENBQUMsQUFyRUQsQ0FBeUIsS0FBSyxDQUFDLFNBQVMsR0FxRXZDO0FBQ0QsZUFBZSxVQUFVLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vanMvd3JlcXInXG5pbXBvcnQgTWFwQWN0aW9uc1ByZXNlbnRhdGlvbiBmcm9tICcuL3ByZXNlbnRhdGlvbidcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG50eXBlIFByb3BzID0ge1xuICBtb2RlbDogTGF6eVF1ZXJ5UmVzdWx0XG59XG50eXBlIFN0YXRlID0ge1xuICBjdXJyZW50T3ZlcmxheVVybDogc3RyaW5nXG59XG5jb25zdCBnZXRBY3Rpb25zV2l0aElkUHJlZml4ID0gKFxuICBhY3Rpb25zOiBMYXp5UXVlcnlSZXN1bHRbJ3BsYWluJ11bJ2FjdGlvbnMnXSxcbiAgaWQ6IHN0cmluZ1xuKSA9PiB7XG4gIHJldHVybiBhY3Rpb25zLmZpbHRlcigoYWN0aW9uKSA9PiBhY3Rpb24uaWQuc3RhcnRzV2l0aChpZCkpXG59XG5jbGFzcyBNYXBBY3Rpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PFByb3BzLCBTdGF0ZT4ge1xuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgY3VycmVudE92ZXJsYXlVcmw6IHRoaXMucHJvcHMubW9kZWwuY3VycmVudE92ZXJsYXlVcmwgfHwgJycsXG4gICAgfVxuICB9XG4gIGdldEFjdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMubW9kZWwucGxhaW4uYWN0aW9uc1xuICB9XG4gIGdldE1hcEFjdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGdldEFjdGlvbnNXaXRoSWRQcmVmaXgoXG4gICAgICB0aGlzLmdldEFjdGlvbnMoKSxcbiAgICAgICdjYXRhbG9nLmRhdGEubWV0YWNhcmQubWFwLidcbiAgICApXG4gIH1cbiAgZ2V0T3ZlcmxheUFjdGlvbnMgPSAoKSA9PiB7XG4gICAgY29uc3QgbW9kZWxPdmVybGF5QWN0aW9ucyA9IGdldEFjdGlvbnNXaXRoSWRQcmVmaXgoXG4gICAgICB0aGlzLmdldEFjdGlvbnMoKSxcbiAgICAgICdjYXRhbG9nLmRhdGEubWV0YWNhcmQubWFwLm92ZXJsYXkuJ1xuICAgIClcbiAgICByZXR1cm4gbW9kZWxPdmVybGF5QWN0aW9ucy5tYXAoKG1vZGVsT3ZlcmxheUFjdGlvbikgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGVzY3JpcHRpb246IG1vZGVsT3ZlcmxheUFjdGlvbi5kZXNjcmlwdGlvbixcbiAgICAgICAgdXJsOiBtb2RlbE92ZXJsYXlBY3Rpb24udXJsLFxuICAgICAgICBvdmVybGF5VGV4dDogdGhpcy5nZXRPdmVybGF5VGV4dChtb2RlbE92ZXJsYXlBY3Rpb24udXJsKSxcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGdldE92ZXJsYXlUZXh0ID0gKGFjdGlvblVybDogU3RyaW5nKSA9PiB7XG4gICAgY29uc3Qgb3ZlcmxheVRyYW5zZm9ybWVyUHJlZml4ID0gJ292ZXJsYXkuJ1xuICAgIGNvbnN0IG92ZXJsYXlUcmFuc2Zvcm1lckluZGV4ID0gYWN0aW9uVXJsLmxhc3RJbmRleE9mKFxuICAgICAgb3ZlcmxheVRyYW5zZm9ybWVyUHJlZml4XG4gICAgKVxuICAgIGlmIChvdmVybGF5VHJhbnNmb3JtZXJJbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBvdmVybGF5TmFtZSA9IGFjdGlvblVybC5zdWJzdHIoXG4gICAgICAgIG92ZXJsYXlUcmFuc2Zvcm1lckluZGV4ICsgb3ZlcmxheVRyYW5zZm9ybWVyUHJlZml4Lmxlbmd0aFxuICAgICAgKVxuICAgICAgcmV0dXJuICdPdmVybGF5ICcgKyBvdmVybGF5TmFtZSArICcgb24gdGhlIG1hcCdcbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH1cbiAgb3ZlcmxheUltYWdlID0gKGV2ZW50OiBhbnkpID0+IHtcbiAgICBjb25zdCBjbGlja2VkT3ZlcmxheVVybCA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJylcbiAgICBjb25zdCByZW1vdmVPdmVybGF5ID0gY2xpY2tlZE92ZXJsYXlVcmwgPT09IHRoaXMuc3RhdGUuY3VycmVudE92ZXJsYXlVcmxcbiAgICBpZiAocmVtb3ZlT3ZlcmxheSkge1xuICAgICAgdGhpcy5wcm9wcy5tb2RlbC5jdXJyZW50T3ZlcmxheVVybCA9IHVuZGVmaW5lZFxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1cnJlbnRPdmVybGF5VXJsOiAnJyB9KVxuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcihcbiAgICAgICAgJ21ldGFjYXJkOm92ZXJsYXk6cmVtb3ZlJyxcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5wbGFpbi5pZFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BzLm1vZGVsLmN1cnJlbnRPdmVybGF5VXJsID0gY2xpY2tlZE92ZXJsYXlVcmxcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXJyZW50T3ZlcmxheVVybDogY2xpY2tlZE92ZXJsYXlVcmwgfSlcbiAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ21ldGFjYXJkOm92ZXJsYXknLCB0aGlzLnByb3BzLm1vZGVsKVxuICAgIH1cbiAgfVxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgaGFzTWFwQWN0aW9ucyA9IHRoaXMuZ2V0TWFwQWN0aW9ucygpLmxlbmd0aCAhPT0gMFxuICAgIHJldHVybiAoXG4gICAgICA8TWFwQWN0aW9uc1ByZXNlbnRhdGlvblxuICAgICAgICBoYXNNYXBBY3Rpb25zPXtoYXNNYXBBY3Rpb25zfVxuICAgICAgICBvdmVybGF5QWN0aW9ucz17dGhpcy5nZXRPdmVybGF5QWN0aW9ucygpfVxuICAgICAgICBjdXJyZW50T3ZlcmxheVVybD17dGhpcy5zdGF0ZS5jdXJyZW50T3ZlcmxheVVybH1cbiAgICAgICAgb3ZlcmxheUltYWdlPXt0aGlzLm92ZXJsYXlJbWFnZX1cbiAgICAgIC8+XG4gICAgKVxuICB9XG59XG5leHBvcnQgZGVmYXVsdCBNYXBBY3Rpb25zXG4iXX0=