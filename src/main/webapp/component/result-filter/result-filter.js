import { __assign, __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import FilterBranch from '../filter-builder/filter-branch';
import { FilterBuilderClass, FilterClass, } from '../filter-builder/filter.structure';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import user from '../singletons/user-instance';
import { useListenToEnterKeySubmitEvent } from '../custom-events/enter-key-submit';
var getResultFilter = function () {
    return user.get('user').get('preferences').get('resultFilter');
};
var getBaseFilter = function () {
    var filter = getResultFilter();
    if (filter === undefined) {
        return new FilterBuilderClass({
            type: 'AND',
            filters: [
                new FilterClass({
                    property: 'anyText',
                    value: '',
                    type: 'ILIKE',
                }),
            ],
            negated: false,
        });
    }
    else if (filter.filters === undefined) {
        return new FilterBuilderClass({
            type: 'AND',
            filters: [filter],
            negated: false,
        });
    }
    return new FilterBuilderClass(__assign({}, filter));
};
var removeFilter = function () {
    user.get('user').get('preferences').set('resultFilter', '');
    user.get('user').get('preferences').savePreferences();
};
var saveFilter = function (_a) {
    var filter = _a.filter;
    user.get('user').get('preferences').set('resultFilter', filter);
    user.get('user').get('preferences').savePreferences();
};
var ResultFilter = function (_a) {
    var closeDropdown = _a.closeDropdown;
    var _b = __read(React.useState(getBaseFilter()), 2), filter = _b[0], setFilter = _b[1];
    var setElement = useListenToEnterKeySubmitEvent({
        callback: function () {
            saveFilter({ filter: filter });
            closeDropdown();
        },
    }).setElement;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "min-w-120 max-w-120", ref: setElement, children: _jsx(FilterBranch, { root: true, filter: filter, setFilter: setFilter }) }), _jsxs(Grid, { className: "w-full pt-2", container: true, direction: "row", alignItems: "center", wrap: "nowrap", children: [_jsx(Grid, { item: true, className: "w-full", children: _jsx(Button, { "data-id": "remove-all-results-filters-button", fullWidth: true, variant: "text", color: "secondary", onClick: function () {
                                removeFilter();
                                closeDropdown();
                            }, children: "Remove" }) }), _jsx(Grid, { item: true, className: "w-full", children: _jsx(Button, { "data-id": "save-results-filters-button", fullWidth: true, variant: "contained", color: "primary", onClick: function () {
                                saveFilter({ filter: filter });
                                closeDropdown();
                            }, children: "Save" }) })] })] }));
};
export default ResultFilter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LWZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcmVzdWx0LWZpbHRlci9yZXN1bHQtZmlsdGVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLFlBQVksTUFBTSxpQ0FBaUMsQ0FBQTtBQUMxRCxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLFdBQVcsR0FDWixNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JDLE9BQU8sSUFBSSxNQUFNLDZCQUE2QixDQUFBO0FBQzlDLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLG1DQUFtQyxDQUFBO0FBRWxGLElBQU0sZUFBZSxHQUFHO0lBQ3RCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2hFLENBQUMsQ0FBQTtBQUVELElBQU0sYUFBYSxHQUFHO0lBQ3BCLElBQU0sTUFBTSxHQUFHLGVBQWUsRUFBRSxDQUFBO0lBQ2hDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQztZQUM1QixJQUFJLEVBQUUsS0FBSztZQUNYLE9BQU8sRUFBRTtnQkFDUCxJQUFJLFdBQVcsQ0FBQztvQkFDZCxRQUFRLEVBQUUsU0FBUztvQkFDbkIsS0FBSyxFQUFFLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLE9BQU87aUJBQ2QsQ0FBQzthQUNIO1lBQ0QsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUE7SUFDSixDQUFDO1NBQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQztZQUM1QixJQUFJLEVBQUUsS0FBSztZQUNYLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNqQixPQUFPLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxPQUFPLElBQUksa0JBQWtCLGNBQ3hCLE1BQU0sRUFDVCxDQUFBO0FBQ0osQ0FBQyxDQUFBO0FBRUQsSUFBTSxZQUFZLEdBQUc7SUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUMzRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUN2RCxDQUFDLENBQUE7QUFFRCxJQUFNLFVBQVUsR0FBRyxVQUFDLEVBQWU7UUFBYixNQUFNLFlBQUE7SUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUMvRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUN2RCxDQUFDLENBQUE7QUFFRCxJQUFNLFlBQVksR0FBRyxVQUFDLEVBQWdEO1FBQTlDLGFBQWEsbUJBQUE7SUFDN0IsSUFBQSxLQUFBLE9BQXNCLEtBQUssQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBQSxFQUFwRCxNQUFNLFFBQUEsRUFBRSxTQUFTLFFBQW1DLENBQUE7SUFDbkQsSUFBQSxVQUFVLEdBQUssOEJBQThCLENBQUM7UUFDcEQsUUFBUSxFQUFFO1lBQ1IsVUFBVSxDQUFDLEVBQUUsTUFBTSxRQUFBLEVBQUUsQ0FBQyxDQUFBO1lBQ3RCLGFBQWEsRUFBRSxDQUFBO1FBQ2pCLENBQUM7S0FDRixDQUFDLFdBTGdCLENBS2hCO0lBQ0YsT0FBTyxDQUNMLDhCQUNFLGNBQUssU0FBUyxFQUFDLHFCQUFxQixFQUFDLEdBQUcsRUFBRSxVQUFVLFlBQ2xELEtBQUMsWUFBWSxJQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsU0FBUyxHQUFJLEdBQzlELEVBQ04sTUFBQyxJQUFJLElBQ0gsU0FBUyxFQUFDLGFBQWEsRUFDdkIsU0FBUyxRQUNULFNBQVMsRUFBQyxLQUFLLEVBQ2YsVUFBVSxFQUFDLFFBQVEsRUFDbkIsSUFBSSxFQUFDLFFBQVEsYUFFYixLQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLFFBQVEsWUFDM0IsS0FBQyxNQUFNLGVBQ0csbUNBQW1DLEVBQzNDLFNBQVMsUUFDVCxPQUFPLEVBQUMsTUFBTSxFQUNkLEtBQUssRUFBQyxXQUFXLEVBQ2pCLE9BQU8sRUFBRTtnQ0FDUCxZQUFZLEVBQUUsQ0FBQTtnQ0FDZCxhQUFhLEVBQUUsQ0FBQTs0QkFDakIsQ0FBQyx1QkFHTSxHQUNKLEVBQ1AsS0FBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxRQUFRLFlBQzNCLEtBQUMsTUFBTSxlQUNHLDZCQUE2QixFQUNyQyxTQUFTLFFBQ1QsT0FBTyxFQUFDLFdBQVcsRUFDbkIsS0FBSyxFQUFDLFNBQVMsRUFDZixPQUFPLEVBQUU7Z0NBQ1AsVUFBVSxDQUFDLEVBQUUsTUFBTSxRQUFBLEVBQUUsQ0FBQyxDQUFBO2dDQUN0QixhQUFhLEVBQUUsQ0FBQTs0QkFDakIsQ0FBQyxxQkFHTSxHQUNKLElBQ0YsSUFDTixDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFlBQVksQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBGaWx0ZXJCcmFuY2ggZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLWJyYW5jaCdcbmltcG9ydCB7XG4gIEZpbHRlckJ1aWxkZXJDbGFzcyxcbiAgRmlsdGVyQ2xhc3MsXG59IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IHsgdXNlTGlzdGVuVG9FbnRlcktleVN1Ym1pdEV2ZW50IH0gZnJvbSAnLi4vY3VzdG9tLWV2ZW50cy9lbnRlci1rZXktc3VibWl0J1xuXG5jb25zdCBnZXRSZXN1bHRGaWx0ZXIgPSAoKSA9PiB7XG4gIHJldHVybiB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ3Jlc3VsdEZpbHRlcicpXG59XG5cbmNvbnN0IGdldEJhc2VGaWx0ZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGZpbHRlciA9IGdldFJlc3VsdEZpbHRlcigpXG4gIGlmIChmaWx0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgZmlsdGVyczogW1xuICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgIH0pXG4gIH0gZWxzZSBpZiAoZmlsdGVyLmZpbHRlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgZmlsdGVyczogW2ZpbHRlcl0sXG4gICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICB9KVxuICB9XG4gIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAuLi5maWx0ZXIsXG4gIH0pXG59XG5cbmNvbnN0IHJlbW92ZUZpbHRlciA9ICgpID0+IHtcbiAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuc2V0KCdyZXN1bHRGaWx0ZXInLCAnJylcbiAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuc2F2ZVByZWZlcmVuY2VzKClcbn1cblxuY29uc3Qgc2F2ZUZpbHRlciA9ICh7IGZpbHRlciB9OiBhbnkpID0+IHtcbiAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuc2V0KCdyZXN1bHRGaWx0ZXInLCBmaWx0ZXIpXG4gIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLnNhdmVQcmVmZXJlbmNlcygpXG59XG5cbmNvbnN0IFJlc3VsdEZpbHRlciA9ICh7IGNsb3NlRHJvcGRvd24gfTogeyBjbG9zZURyb3Bkb3duOiAoKSA9PiB2b2lkIH0pID0+IHtcbiAgY29uc3QgW2ZpbHRlciwgc2V0RmlsdGVyXSA9IFJlYWN0LnVzZVN0YXRlKGdldEJhc2VGaWx0ZXIoKSlcbiAgY29uc3QgeyBzZXRFbGVtZW50IH0gPSB1c2VMaXN0ZW5Ub0VudGVyS2V5U3VibWl0RXZlbnQoe1xuICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICBzYXZlRmlsdGVyKHsgZmlsdGVyIH0pXG4gICAgICBjbG9zZURyb3Bkb3duKClcbiAgICB9LFxuICB9KVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi13LTEyMCBtYXgtdy0xMjBcIiByZWY9e3NldEVsZW1lbnR9PlxuICAgICAgICA8RmlsdGVyQnJhbmNoIHJvb3Q9e3RydWV9IGZpbHRlcj17ZmlsdGVyfSBzZXRGaWx0ZXI9e3NldEZpbHRlcn0gLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPEdyaWRcbiAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB0LTJcIlxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgZGlyZWN0aW9uPVwicm93XCJcbiAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgPlxuICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbFwiPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGRhdGEtaWQ9XCJyZW1vdmUtYWxsLXJlc3VsdHMtZmlsdGVycy1idXR0b25cIlxuICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICB2YXJpYW50PVwidGV4dFwiXG4gICAgICAgICAgICBjb2xvcj1cInNlY29uZGFyeVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHJlbW92ZUZpbHRlcigpXG4gICAgICAgICAgICAgIGNsb3NlRHJvcGRvd24oKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBSZW1vdmVcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9HcmlkPlxuICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbFwiPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGRhdGEtaWQ9XCJzYXZlLXJlc3VsdHMtZmlsdGVycy1idXR0b25cIlxuICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNhdmVGaWx0ZXIoeyBmaWx0ZXIgfSlcbiAgICAgICAgICAgICAgY2xvc2VEcm9wZG93bigpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFNhdmVcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9HcmlkPlxuICAgICAgPC9HcmlkPlxuICAgIDwvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlc3VsdEZpbHRlclxuIl19