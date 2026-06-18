import { __read } from "tslib";
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
/* global require*/
import React from 'react';
import _ from 'underscore';
import Backbone from 'backbone';
import { LayerItemCollectionViewReact } from '../layer-item/layer-item.collection.view';
import user from '../singletons/user-instance';
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
    return (_jsxs("div", { "data-id": "layers-container", ref: containerElementRef, children: [_jsx("div", { className: "text-xl text-center", children: "Layers" }), _jsx("div", { className: "layers", children: _jsx(LayerItemCollectionViewReact, { collection: layers, updateOrdering: function () {
                        var _a;
                        _.forEach(
                        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'NodeListOf<Element> | undefined'... Remove this comment to see the full error message
                        (_a = containerElementRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll(".layer-item"), function (element, index) {
                            layers.get(element.getAttribute('layer-id')).set('order', index);
                        });
                        layers.sort();
                        savePreferencesCallback();
                    }, focusModel: focusModel }) }), _jsx("div", { className: "footer", children: _jsx(Button, { "data-id": "reset-to-defaults-button", onClick: function () {
                        focusModel.clear();
                        layers.forEach(function (viewLayer) {
                            var name = viewLayer.get('name');
                            var defaultConfig = _.find(getImageryProviders(), function (layerObj) { return name === layerObj.name; });
                            viewLayer.set(defaultConfig);
                        });
                        layers.sort();
                        savePreferencesCallback();
                    }, children: _jsx("span", { children: "Reset to Defaults" }) }) })] }));
};
export default LayersViewReact;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5ZXJzLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xheWVycy9sYXllcnMudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osbUJBQW1CO0FBQ25CLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDBDQUEwQyxDQUFBO0FBQ3ZGLE9BQU8sSUFBSSxNQUFNLDZCQUE2QixDQUFBO0FBRTlDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRDQUE0QyxDQUFBO0FBQzdFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxREFBcUQsQ0FBQTtBQUNqRixPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQTtBQUV0Qyx3RUFBd0U7QUFDeEUsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDdkMsUUFBUSxFQUFFO1FBQ1IsRUFBRSxFQUFFLFNBQVM7UUFDYixTQUFTLEVBQUUsU0FBUztLQUNyQjtJQUNELFVBQVUsRUFBRTtRQUNWLEVBQUUsRUFBRSxJQUFJO1FBQ1IsSUFBSSxFQUFFLE1BQU07S0FDYjtJQUNELEtBQUs7UUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsRUFBRSxFQUFFLFNBQVM7WUFDYixTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsS0FBSyxZQUFDLEVBQU87UUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsRUFBRSxJQUFBO1lBQ0YsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMs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QW1CLEVBQUUsRUFDckIsVUFBQyxRQUFhLElBQUssT0FBQSxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksRUFBdEIsQ0FBc0IsQ0FDMUMsQ0FBQTs0QkFDRCxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO3dCQUM5QixDQUFDLENBQUMsQ0FBQTt3QkFDRixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7d0JBQ2IsdUJBQXVCLEVBQUUsQ0FBQTtvQkFDM0IsQ0FBQyxZQUVELCtDQUE4QixHQUN2QixHQUNMLElBQ0YsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxlQUFlLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qIGdsb2JhbCByZXF1aXJlKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgeyBMYXllckl0ZW1Db2xsZWN0aW9uVmlld1JlYWN0IH0gZnJvbSAnLi4vbGF5ZXItaXRlbS9sYXllci1pdGVtLmNvbGxlY3Rpb24udmlldydcbmltcG9ydCB1c2VyIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcblxuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCB7IHVzZUNvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL2NvbmZpZ3VyYXRpb24uaG9va3MnXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5cbi8vIHRoaXMgaXMgdG8gdHJhY2sgZm9jdXMsIHNpbmNlIG9uIHJlb3JkZXJpbmcgcmVyZW5kZXJzIGFuZCBsb3NlcyBmb2N1c1xuY29uc3QgRm9jdXNNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gIGRlZmF1bHRzOiB7XG4gICAgaWQ6IHVuZGVmaW5lZCxcbiAgICBkaXJlY3Rpb246IHVuZGVmaW5lZCxcbiAgfSxcbiAgZGlyZWN0aW9uczoge1xuICAgIHVwOiAndXAnLFxuICAgIGRvd246ICdkb3duJyxcbiAgfSxcbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zZXQoe1xuICAgICAgaWQ6IHVuZGVmaW5lZCxcbiAgICAgIGRpcmVjdGlvbjogdW5kZWZpbmVkLFxuICAgIH0pXG4gIH0sXG4gIHNldFVwKGlkOiBhbnkpIHtcbiAgICB0aGlzLnNldCh7XG4gICAgICBpZCxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb25zLnVwLFxuICAgIH0pXG4gIH0sXG4gIHNldERvd24oaWQ6IGFueSkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIGlkLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbnMuZG93bixcbiAgICB9KVxuICB9LFxuICBnZXREaXJlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkaXJlY3Rpb24nKVxuICB9LFxuICBpc1VwKCkge1xuICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvbigpID09PSB0aGlzLmRpcmVjdGlvbnMudXBcbiAgfSxcbiAgaXNEb3duKCkge1xuICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvbigpID09PSB0aGlzLmRpcmVjdGlvbnMuZG93blxuICB9LFxufSlcblxudHlwZSBMYXllcnNWaWV3UmVhY3RQcm9wcyA9IHtcbiAgbGF5ZXJzPzogQXJyYXk8YW55PlxufVxuXG5jb25zdCBMYXllcnNWaWV3UmVhY3QgPSAocHJvcHM6IExheWVyc1ZpZXdSZWFjdFByb3BzKSA9PiB7XG4gIGNvbnN0IHsgZ2V0SW1hZ2VyeVByb3ZpZGVycyB9ID0gdXNlQ29uZmlndXJhdGlvbigpXG4gIGNvbnN0IFtmb2N1c01vZGVsXSA9IFJlYWN0LnVzZVN0YXRlKG5ldyBGb2N1c01vZGVsKCkpXG4gIGNvbnN0IGNvbnRhaW5lckVsZW1lbnRSZWYgPSBSZWFjdC51c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG5cbiAgY29uc3QgbGF5ZXJzID0gcHJvcHMubGF5ZXJzID8/IHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzPm1hcExheWVycycpXG5cbiAgY29uc3Qgc2F2ZVByZWZlcmVuY2VzQ2FsbGJhY2sgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICBpZiAocHJvcHMubGF5ZXJzKSB7XG4gICAgICByZXR1cm4gKCkgPT4ge31cbiAgICB9XG4gICAgcmV0dXJuIGRlYm91bmNlKCgpID0+IHtcbiAgICAgIHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzJykuc2F2ZVByZWZlcmVuY2VzKClcbiAgICB9LCAxMDApXG4gIH0sIFtdKVxuICB1c2VMaXN0ZW5UbyhsYXllcnMsICdjaGFuZ2U6YWxwaGEgY2hhbmdlOnNob3cnLCAoKSA9PiB7XG4gICAgc2F2ZVByZWZlcmVuY2VzQ2FsbGJhY2soKVxuICB9KVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBkYXRhLWlkPVwibGF5ZXJzLWNvbnRhaW5lclwiIHJlZj17Y29udGFpbmVyRWxlbWVudFJlZn0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQteGwgdGV4dC1jZW50ZXJcIj5MYXllcnM8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGF5ZXJzXCI+XG4gICAgICAgIDxMYXllckl0ZW1Db2xsZWN0aW9uVmlld1JlYWN0XG4gICAgICAgICAgY29sbGVjdGlvbj17bGF5ZXJzfVxuICAgICAgICAgIHVwZGF0ZU9yZGVyaW5nPXsoKSA9PiB7XG4gICAgICAgICAgICBfLmZvckVhY2goXG4gICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAnTm9kZUxpc3RPZjxFbGVtZW50PiB8IHVuZGVmaW5lZCcuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgICBjb250YWluZXJFbGVtZW50UmVmLmN1cnJlbnQ/LnF1ZXJ5U2VsZWN0b3JBbGwoYC5sYXllci1pdGVtYCksXG4gICAgICAgICAgICAgIChlbGVtZW50OiBhbnksIGluZGV4OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBsYXllcnMuZ2V0KGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdsYXllci1pZCcpKS5zZXQoJ29yZGVyJywgaW5kZXgpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGxheWVycy5zb3J0KClcbiAgICAgICAgICAgIHNhdmVQcmVmZXJlbmNlc0NhbGxiYWNrKClcbiAgICAgICAgICB9fVxuICAgICAgICAgIGZvY3VzTW9kZWw9e2ZvY3VzTW9kZWx9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9vdGVyXCI+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBkYXRhLWlkPVwicmVzZXQtdG8tZGVmYXVsdHMtYnV0dG9uXCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBmb2N1c01vZGVsLmNsZWFyKClcbiAgICAgICAgICAgIGxheWVycy5mb3JFYWNoKCh2aWV3TGF5ZXI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gdmlld0xheWVyLmdldCgnbmFtZScpXG4gICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRDb25maWcgPSBfLmZpbmQoXG4gICAgICAgICAgICAgICAgZ2V0SW1hZ2VyeVByb3ZpZGVycygpLFxuICAgICAgICAgICAgICAgIChsYXllck9iajogYW55KSA9PiBuYW1lID09PSBsYXllck9iai5uYW1lXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgdmlld0xheWVyLnNldChkZWZhdWx0Q29uZmlnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGxheWVycy5zb3J0KClcbiAgICAgICAgICAgIHNhdmVQcmVmZXJlbmNlc0NhbGxiYWNrKClcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHNwYW4+UmVzZXQgdG8gRGVmYXVsdHM8L3NwYW4+XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgTGF5ZXJzVmlld1JlYWN0XG4iXX0=