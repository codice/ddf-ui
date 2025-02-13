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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5ZXJzLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xheWVycy9sYXllcnMudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixtQkFBbUI7QUFDbkIsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFDL0IsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMENBQTBDLENBQUE7QUFDdkYsT0FBTyxJQUFJLE1BQU0sNkJBQTZCLENBQUE7QUFDOUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRDQUE0QyxDQUFBO0FBQzdFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxREFBcUQsQ0FBQTtBQUNqRixPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQTtBQUV0Qyx3RUFBd0U7QUFDeEUsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDdkMsUUFBUSxFQUFFO1FBQ1IsRUFBRSxFQUFFLFNBQVM7UUFDYixTQUFTLEVBQUUsU0FBUztLQUNyQjtJQUNELFVBQVUsRUFBRTtRQUNWLEVBQUUsRUFBRSxJQUFJO1FBQ1IsSUFBSSxFQUFFLE1BQU07S0FDYjtJQUNELEtBQUs7UUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsRUFBRSxFQUFFLFNBQVM7WUFDYixTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsS0FBSyxZQUFDLEVBQU87UUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsRUFB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TSxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FDMUIsbUJBQW1CLEVBQUUsRUFDckIsVUFBQyxRQUFhLElBQUssT0FBQSxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksRUFBdEIsQ0FBc0IsQ0FDMUMsQ0FBQTt3QkFDRCxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO29CQUM5QixDQUFDLENBQUMsQ0FBQTtvQkFDRixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7b0JBQ2IsdUJBQXVCLEVBQUUsQ0FBQTtnQkFDM0IsQ0FBQztnQkFFRCxzREFBOEIsQ0FDdkIsQ0FDTCxDQUNGLENBQ1AsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG4vKiBnbG9iYWwgcmVxdWlyZSovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IHsgTGF5ZXJJdGVtQ29sbGVjdGlvblZpZXdSZWFjdCB9IGZyb20gJy4uL2xheWVyLWl0ZW0vbGF5ZXItaXRlbS5jb2xsZWN0aW9uLnZpZXcnXG5pbXBvcnQgdXNlciBmcm9tICcuLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCB7IHVzZUNvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL2NvbmZpZ3VyYXRpb24uaG9va3MnXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5cbi8vIHRoaXMgaXMgdG8gdHJhY2sgZm9jdXMsIHNpbmNlIG9uIHJlb3JkZXJpbmcgcmVyZW5kZXJzIGFuZCBsb3NlcyBmb2N1c1xuY29uc3QgRm9jdXNNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gIGRlZmF1bHRzOiB7XG4gICAgaWQ6IHVuZGVmaW5lZCxcbiAgICBkaXJlY3Rpb246IHVuZGVmaW5lZCxcbiAgfSxcbiAgZGlyZWN0aW9uczoge1xuICAgIHVwOiAndXAnLFxuICAgIGRvd246ICdkb3duJyxcbiAgfSxcbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zZXQoe1xuICAgICAgaWQ6IHVuZGVmaW5lZCxcbiAgICAgIGRpcmVjdGlvbjogdW5kZWZpbmVkLFxuICAgIH0pXG4gIH0sXG4gIHNldFVwKGlkOiBhbnkpIHtcbiAgICB0aGlzLnNldCh7XG4gICAgICBpZCxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb25zLnVwLFxuICAgIH0pXG4gIH0sXG4gIHNldERvd24oaWQ6IGFueSkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIGlkLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbnMuZG93bixcbiAgICB9KVxuICB9LFxuICBnZXREaXJlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkaXJlY3Rpb24nKVxuICB9LFxuICBpc1VwKCkge1xuICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvbigpID09PSB0aGlzLmRpcmVjdGlvbnMudXBcbiAgfSxcbiAgaXNEb3duKCkge1xuICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvbigpID09PSB0aGlzLmRpcmVjdGlvbnMuZG93blxuICB9LFxufSlcblxudHlwZSBMYXllcnNWaWV3UmVhY3RQcm9wcyA9IHtcbiAgbGF5ZXJzPzogQXJyYXk8YW55PlxufVxuXG5jb25zdCBMYXllcnNWaWV3UmVhY3QgPSAocHJvcHM6IExheWVyc1ZpZXdSZWFjdFByb3BzKSA9PiB7XG4gIGNvbnN0IHsgZ2V0SW1hZ2VyeVByb3ZpZGVycyB9ID0gdXNlQ29uZmlndXJhdGlvbigpXG4gIGNvbnN0IFtmb2N1c01vZGVsXSA9IFJlYWN0LnVzZVN0YXRlKG5ldyBGb2N1c01vZGVsKCkpXG4gIGNvbnN0IGNvbnRhaW5lckVsZW1lbnRSZWYgPSBSZWFjdC51c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG5cbiAgY29uc3QgbGF5ZXJzID0gcHJvcHMubGF5ZXJzID8/IHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzPm1hcExheWVycycpXG5cbiAgY29uc3Qgc2F2ZVByZWZlcmVuY2VzQ2FsbGJhY2sgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICBpZiAocHJvcHMubGF5ZXJzKSB7XG4gICAgICByZXR1cm4gKCkgPT4ge31cbiAgICB9XG4gICAgcmV0dXJuIGRlYm91bmNlKCgpID0+IHtcbiAgICAgIHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzJykuc2F2ZVByZWZlcmVuY2VzKClcbiAgICB9LCAxMDApXG4gIH0sIFtdKVxuICB1c2VMaXN0ZW5UbyhsYXllcnMsICdjaGFuZ2U6YWxwaGEgY2hhbmdlOnNob3cnLCAoKSA9PiB7XG4gICAgc2F2ZVByZWZlcmVuY2VzQ2FsbGJhY2soKVxuICB9KVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBkYXRhLWlkPVwibGF5ZXJzLWNvbnRhaW5lclwiIHJlZj17Y29udGFpbmVyRWxlbWVudFJlZn0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQteGwgdGV4dC1jZW50ZXJcIj5MYXllcnM8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGF5ZXJzXCI+XG4gICAgICAgIDxMYXllckl0ZW1Db2xsZWN0aW9uVmlld1JlYWN0XG4gICAgICAgICAgY29sbGVjdGlvbj17bGF5ZXJzfVxuICAgICAgICAgIHVwZGF0ZU9yZGVyaW5nPXsoKSA9PiB7XG4gICAgICAgICAgICBfLmZvckVhY2goXG4gICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAnTm9kZUxpc3RPZjxFbGVtZW50PiB8IHVuZGVmaW5lZCcuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgICBjb250YWluZXJFbGVtZW50UmVmLmN1cnJlbnQ/LnF1ZXJ5U2VsZWN0b3JBbGwoYC5sYXllci1pdGVtYCksXG4gICAgICAgICAgICAgIChlbGVtZW50OiBhbnksIGluZGV4OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBsYXllcnMuZ2V0KGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdsYXllci1pZCcpKS5zZXQoJ29yZGVyJywgaW5kZXgpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGxheWVycy5zb3J0KClcbiAgICAgICAgICAgIHNhdmVQcmVmZXJlbmNlc0NhbGxiYWNrKClcbiAgICAgICAgICB9fVxuICAgICAgICAgIGZvY3VzTW9kZWw9e2ZvY3VzTW9kZWx9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9vdGVyXCI+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBkYXRhLWlkPVwicmVzZXQtdG8tZGVmYXVsdHMtYnV0dG9uXCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBmb2N1c01vZGVsLmNsZWFyKClcbiAgICAgICAgICAgIGxheWVycy5mb3JFYWNoKCh2aWV3TGF5ZXI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gdmlld0xheWVyLmdldCgnbmFtZScpXG4gICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRDb25maWcgPSBfLmZpbmQoXG4gICAgICAgICAgICAgICAgZ2V0SW1hZ2VyeVByb3ZpZGVycygpLFxuICAgICAgICAgICAgICAgIChsYXllck9iajogYW55KSA9PiBuYW1lID09PSBsYXllck9iai5uYW1lXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgdmlld0xheWVyLnNldChkZWZhdWx0Q29uZmlnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGxheWVycy5zb3J0KClcbiAgICAgICAgICAgIHNhdmVQcmVmZXJlbmNlc0NhbGxiYWNrKClcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHNwYW4+UmVzZXQgdG8gRGVmYXVsdHM8L3NwYW4+XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoTGF5ZXJzVmlld1JlYWN0KVxuIl19