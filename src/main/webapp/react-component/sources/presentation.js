import { __makeTemplateObject } from "tslib";
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
import SourceItem from '../source-item';
import SourcesSummary from '../sources-summary';
import { useSources } from '../../js/model/Startup/sources.hooks';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: block;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n"], ["\n  display: block;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n"])));
var SourcesCenter = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  margin: auto;\n  max-width: ", ";\n  padding: 0px\n    ", ";\n  overflow: auto;\n  height: 100%;\n"], ["\n  margin: auto;\n  max-width: ", ";\n  padding: 0px\n    ", ";\n  overflow: auto;\n  height: 100%;\n"])), function (props) {
    return props.theme.screenBelow(props.theme.mediumScreenSize)
        ? '100%'
        : '1200px';
}, function (props) {
    return props.theme.screenBelow(props.theme.mediumScreenSize) ? '20px' : '100px';
});
export default (function () {
    var sources = useSources().sources;
    var amountDown = sources.reduce(function (blob, source) {
        if (source.available === false) {
            return blob + 1;
        }
        return blob;
    }, 0);
    return (React.createElement(Root, null,
        React.createElement(SourcesCenter, null,
            React.createElement(SourcesSummary, { amountDown: amountDown }),
            sources.map(function (source) {
                return (React.createElement(SourceItem, { key: source.id, sourceActions: source.sourceActions, id: source.id, available: source.available }));
            }))));
});
var templateObject_1, templateObject_2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9zb3VyY2VzL3ByZXNlbnRhdGlvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLFVBQVUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUN2QyxPQUFPLGNBQWMsTUFBTSxvQkFBb0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFFakUsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsZ0pBQUEsNkVBS3RCLElBQUEsQ0FBQTtBQUVELElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLDJLQUFBLGtDQUVqQixFQUlaLHlCQUVHLEVBQ3dFLHlDQUc3RSxLQVZjLFVBQUMsS0FBSztJQUNqQixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7UUFDMUQsQ0FBQyxDQUFDLE1BQU07UUFDUixDQUFDLENBQUMsUUFBUSxDQUFBO0FBQ2QsQ0FBQyxFQUVHLFVBQUMsS0FBSztJQUNOLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU87QUFBeEUsQ0FBd0UsQ0FHN0UsQ0FBQTtBQUVELGdCQUFlO0lBQ0wsSUFBQSxPQUFPLEdBQUssVUFBVSxFQUFFLFFBQWpCLENBQWlCO0lBQ2hDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsTUFBTTtRQUM3QyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEtBQUssS0FBSyxFQUFFO1lBQzlCLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQTtTQUNoQjtRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ0wsT0FBTyxDQUNMLG9CQUFDLElBQUk7UUFDSCxvQkFBQyxhQUFhO1lBQ1osb0JBQUMsY0FBYyxJQUFDLFVBQVUsRUFBRSxVQUFVLEdBQUk7WUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU07Z0JBQ2xCLE9BQU8sQ0FDTCxvQkFBQyxVQUFVLElBQ1QsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQ2QsYUFBYSxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQ25DLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUNiLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxHQUMzQixDQUNILENBQUE7WUFDSCxDQUFDLENBQUMsQ0FDWSxDQUNYLENBQ1IsQ0FBQTtBQUNILENBQUMsRUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IFNvdXJjZUl0ZW0gZnJvbSAnLi4vc291cmNlLWl0ZW0nXG5pbXBvcnQgU291cmNlc1N1bW1hcnkgZnJvbSAnLi4vc291cmNlcy1zdW1tYXJ5J1xuaW1wb3J0IHsgdXNlU291cmNlcyB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc291cmNlcy5ob29rcydcblxuY29uc3QgUm9vdCA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGJsb2NrO1xuICBoZWlnaHQ6IDEwMCU7XG4gIHdpZHRoOiAxMDAlO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuYFxuXG5jb25zdCBTb3VyY2VzQ2VudGVyID0gc3R5bGVkLmRpdmBcbiAgbWFyZ2luOiBhdXRvO1xuICBtYXgtd2lkdGg6ICR7KHByb3BzKSA9PiB7XG4gICAgcmV0dXJuIHByb3BzLnRoZW1lLnNjcmVlbkJlbG93KHByb3BzLnRoZW1lLm1lZGl1bVNjcmVlblNpemUpXG4gICAgICA/ICcxMDAlJ1xuICAgICAgOiAnMTIwMHB4J1xuICB9fTtcbiAgcGFkZGluZzogMHB4XG4gICAgJHsocHJvcHMpID0+XG4gICAgICBwcm9wcy50aGVtZS5zY3JlZW5CZWxvdyhwcm9wcy50aGVtZS5tZWRpdW1TY3JlZW5TaXplKSA/ICcyMHB4JyA6ICcxMDBweCd9O1xuICBvdmVyZmxvdzogYXV0bztcbiAgaGVpZ2h0OiAxMDAlO1xuYFxuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIGNvbnN0IHsgc291cmNlcyB9ID0gdXNlU291cmNlcygpXG4gIGNvbnN0IGFtb3VudERvd24gPSBzb3VyY2VzLnJlZHVjZSgoYmxvYiwgc291cmNlKSA9PiB7XG4gICAgaWYgKHNvdXJjZS5hdmFpbGFibGUgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gYmxvYiArIDFcbiAgICB9XG4gICAgcmV0dXJuIGJsb2JcbiAgfSwgMClcbiAgcmV0dXJuIChcbiAgICA8Um9vdD5cbiAgICAgIDxTb3VyY2VzQ2VudGVyPlxuICAgICAgICA8U291cmNlc1N1bW1hcnkgYW1vdW50RG93bj17YW1vdW50RG93bn0gLz5cbiAgICAgICAge3NvdXJjZXMubWFwKChzb3VyY2UpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFNvdXJjZUl0ZW1cbiAgICAgICAgICAgICAga2V5PXtzb3VyY2UuaWR9XG4gICAgICAgICAgICAgIHNvdXJjZUFjdGlvbnM9e3NvdXJjZS5zb3VyY2VBY3Rpb25zfVxuICAgICAgICAgICAgICBpZD17c291cmNlLmlkfVxuICAgICAgICAgICAgICBhdmFpbGFibGU9e3NvdXJjZS5hdmFpbGFibGV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIClcbiAgICAgICAgfSl9XG4gICAgICA8L1NvdXJjZXNDZW50ZXI+XG4gICAgPC9Sb290PlxuICApXG59XG4iXX0=