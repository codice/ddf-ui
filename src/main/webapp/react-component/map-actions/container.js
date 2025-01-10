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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tYXAtYWN0aW9ucy9jb250YWluZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sS0FBSyxNQUFNLGdCQUFnQixDQUFBO0FBQ2xDLE9BQU8sc0JBQXNCLE1BQU0sZ0JBQWdCLENBQUE7QUFRbkQsSUFBTSxzQkFBc0IsR0FBRyxVQUM3QixPQUE0QyxFQUM1QyxFQUFVO0lBRVYsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQTtBQUM3RCxDQUFDLENBQUE7QUFDRDtJQUF5Qiw4QkFBNkI7SUFDcEQsb0JBQVksS0FBWTtRQUF4QixZQUNFLGtCQUFNLEtBQUssQ0FBQyxTQUliO1FBQ0QsZ0JBQVUsR0FBRztZQUNYLE9BQU8sS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQTtRQUN2QyxDQUFDLENBQUE7UUFDRCxtQkFBYSxHQUFHO1lBQ2QsT0FBTyxzQkFBc0IsQ0FDM0IsS0FBSSxDQUFDLFVBQVUsRUFBRSxFQUNqQiw0QkFBNEIsQ0FDN0IsQ0FBQTtRQUNILENBQUMsQ0FBQTtRQUNELHVCQUFpQixHQUFHO1lBQ2xCLElBQU0sbUJBQW1CLEdBQUcsc0JBQXNCLENBQ2hELEtBQUksQ0FBQyxVQUFVLEVBQUUsRUFDakIsb0NBQW9DLENBQ3JDLENBQUE7WUFDRCxPQUFPLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxVQUFDLGtCQUFrQjtnQkFDaEQsT0FBTztvQkFDTCxXQUFXLEVBQUUsa0JBQWtCLENBQUMsV0FBVztvQkFDM0MsR0FBRyxFQUFFLGtCQUFrQixDQUFDLEdBQUc7b0JBQzNCLFdBQVcsRUFBRSxLQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQztpQkFDekQsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO1FBQ0Qsb0JBQWMsR0FBRyxVQUFDLFNBQWlCO1lBQ2pDLElBQU0sd0JBQXdCLEdBQUcsVUFBVSxDQUFBO1lBQzNDLElBQU0sdUJBQXVCLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FDbkQsd0JBQXdCLENBQ3pCLENBQUE7WUFDRCxJQUFJLHVCQUF1QixJQUFJLENBQUMsRUFBRTtnQkFDaEMsSUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FDbEMsdUJBQXVCLEdBQUcsd0JBQXdCLENBQUMsTUFBTSxDQUMxRCxDQUFBO2dCQUNELE9BQU8sVUFBVSxHQUFHLFdBQVcsR0FBRyxhQUFhLENBQUE7YUFDaEQ7WUFDRCxPQUFPLEVBQUUsQ0FBQTtRQUNYLENBQUMsQ0FBQTtRQUNELGtCQUFZLEdBQUcsVUFBQyxLQUFVO1lBQ3hCLElBQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDL0QsSUFBTSxhQUFhLEdBQUcsaUJBQWlCLEtBQUssS0FBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQTtZQUN4RSxJQUFJLGFBQWEsRUFBRTtnQkFDakIsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFBO2dCQUM5QyxLQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FDdkM7Z0JBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQzFCLHlCQUF5QixFQUN6QixLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUMxQixDQUFBO2FBQ0Y7aUJBQU07Z0JBQ0wsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUE7Z0JBQ3RELEtBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQ3REO2dCQUFDLEtBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDbkU7UUFDSCxDQUFDLENBQUE7UUF0REMsS0FBSSxDQUFDLEtBQUssR0FBRztZQUNYLGlCQUFpQixFQUFFLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixJQUFJLEVBQUU7U0FDNUQsQ0FBQTs7SUFDSCxDQUFDO0lBb0RELDJCQUFNLEdBQU47UUFDRSxJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQTtRQUN2RCxPQUFPLENBQ0wsb0JBQUMsc0JBQXNCLElBQ3JCLGFBQWEsRUFBRSxhQUFhLEVBQzVCLGNBQWMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFDeEMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFDL0MsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLEdBQy9CLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFDSCxpQkFBQztBQUFELENBQUMsQUFyRUQsQ0FBeUIsS0FBSyxDQUFDLFNBQVMsR0FxRXZDO0FBQ0QsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi9qcy93cmVxcidcbmltcG9ydCBNYXBBY3Rpb25zUHJlc2VudGF0aW9uIGZyb20gJy4vcHJlc2VudGF0aW9uJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbnR5cGUgUHJvcHMgPSB7XG4gIG1vZGVsOiBMYXp5UXVlcnlSZXN1bHRcbn1cbnR5cGUgU3RhdGUgPSB7XG4gIGN1cnJlbnRPdmVybGF5VXJsOiBzdHJpbmdcbn1cbmNvbnN0IGdldEFjdGlvbnNXaXRoSWRQcmVmaXggPSAoXG4gIGFjdGlvbnM6IExhenlRdWVyeVJlc3VsdFsncGxhaW4nXVsnYWN0aW9ucyddLFxuICBpZDogc3RyaW5nXG4pID0+IHtcbiAgcmV0dXJuIGFjdGlvbnMuZmlsdGVyKChhY3Rpb24pID0+IGFjdGlvbi5pZC5zdGFydHNXaXRoKGlkKSlcbn1cbmNsYXNzIE1hcEFjdGlvbnMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8UHJvcHMsIFN0YXRlPiB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjdXJyZW50T3ZlcmxheVVybDogdGhpcy5wcm9wcy5tb2RlbC5jdXJyZW50T3ZlcmxheVVybCB8fCAnJyxcbiAgICB9XG4gIH1cbiAgZ2V0QWN0aW9ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5tb2RlbC5wbGFpbi5hY3Rpb25zXG4gIH1cbiAgZ2V0TWFwQWN0aW9ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gZ2V0QWN0aW9uc1dpdGhJZFByZWZpeChcbiAgICAgIHRoaXMuZ2V0QWN0aW9ucygpLFxuICAgICAgJ2NhdGFsb2cuZGF0YS5tZXRhY2FyZC5tYXAuJ1xuICAgIClcbiAgfVxuICBnZXRPdmVybGF5QWN0aW9ucyA9ICgpID0+IHtcbiAgICBjb25zdCBtb2RlbE92ZXJsYXlBY3Rpb25zID0gZ2V0QWN0aW9uc1dpdGhJZFByZWZpeChcbiAgICAgIHRoaXMuZ2V0QWN0aW9ucygpLFxuICAgICAgJ2NhdGFsb2cuZGF0YS5tZXRhY2FyZC5tYXAub3ZlcmxheS4nXG4gICAgKVxuICAgIHJldHVybiBtb2RlbE92ZXJsYXlBY3Rpb25zLm1hcCgobW9kZWxPdmVybGF5QWN0aW9uKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkZXNjcmlwdGlvbjogbW9kZWxPdmVybGF5QWN0aW9uLmRlc2NyaXB0aW9uLFxuICAgICAgICB1cmw6IG1vZGVsT3ZlcmxheUFjdGlvbi51cmwsXG4gICAgICAgIG92ZXJsYXlUZXh0OiB0aGlzLmdldE92ZXJsYXlUZXh0KG1vZGVsT3ZlcmxheUFjdGlvbi51cmwpLFxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgZ2V0T3ZlcmxheVRleHQgPSAoYWN0aW9uVXJsOiBTdHJpbmcpID0+IHtcbiAgICBjb25zdCBvdmVybGF5VHJhbnNmb3JtZXJQcmVmaXggPSAnb3ZlcmxheS4nXG4gICAgY29uc3Qgb3ZlcmxheVRyYW5zZm9ybWVySW5kZXggPSBhY3Rpb25VcmwubGFzdEluZGV4T2YoXG4gICAgICBvdmVybGF5VHJhbnNmb3JtZXJQcmVmaXhcbiAgICApXG4gICAgaWYgKG92ZXJsYXlUcmFuc2Zvcm1lckluZGV4ID49IDApIHtcbiAgICAgIGNvbnN0IG92ZXJsYXlOYW1lID0gYWN0aW9uVXJsLnN1YnN0cihcbiAgICAgICAgb3ZlcmxheVRyYW5zZm9ybWVySW5kZXggKyBvdmVybGF5VHJhbnNmb3JtZXJQcmVmaXgubGVuZ3RoXG4gICAgICApXG4gICAgICByZXR1cm4gJ092ZXJsYXkgJyArIG92ZXJsYXlOYW1lICsgJyBvbiB0aGUgbWFwJ1xuICAgIH1cbiAgICByZXR1cm4gJydcbiAgfVxuICBvdmVybGF5SW1hZ2UgPSAoZXZlbnQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IGNsaWNrZWRPdmVybGF5VXJsID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKVxuICAgIGNvbnN0IHJlbW92ZU92ZXJsYXkgPSBjbGlja2VkT3ZlcmxheVVybCA9PT0gdGhpcy5zdGF0ZS5jdXJyZW50T3ZlcmxheVVybFxuICAgIGlmIChyZW1vdmVPdmVybGF5KSB7XG4gICAgICB0aGlzLnByb3BzLm1vZGVsLmN1cnJlbnRPdmVybGF5VXJsID0gdW5kZWZpbmVkXG4gICAgICB0aGlzLnNldFN0YXRlKHsgY3VycmVudE92ZXJsYXlVcmw6ICcnIH0pXG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKFxuICAgICAgICAnbWV0YWNhcmQ6b3ZlcmxheTpyZW1vdmUnLFxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnBsYWluLmlkXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHMubW9kZWwuY3VycmVudE92ZXJsYXlVcmwgPSBjbGlja2VkT3ZlcmxheVVybFxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1cnJlbnRPdmVybGF5VXJsOiBjbGlja2VkT3ZlcmxheVVybCB9KVxuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignbWV0YWNhcmQ6b3ZlcmxheScsIHRoaXMucHJvcHMubW9kZWwpXG4gICAgfVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBoYXNNYXBBY3Rpb25zID0gdGhpcy5nZXRNYXBBY3Rpb25zKCkubGVuZ3RoICE9PSAwXG4gICAgcmV0dXJuIChcbiAgICAgIDxNYXBBY3Rpb25zUHJlc2VudGF0aW9uXG4gICAgICAgIGhhc01hcEFjdGlvbnM9e2hhc01hcEFjdGlvbnN9XG4gICAgICAgIG92ZXJsYXlBY3Rpb25zPXt0aGlzLmdldE92ZXJsYXlBY3Rpb25zKCl9XG4gICAgICAgIGN1cnJlbnRPdmVybGF5VXJsPXt0aGlzLnN0YXRlLmN1cnJlbnRPdmVybGF5VXJsfVxuICAgICAgICBvdmVybGF5SW1hZ2U9e3RoaXMub3ZlcmxheUltYWdlfVxuICAgICAgLz5cbiAgICApXG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKE1hcEFjdGlvbnMpXG4iXX0=