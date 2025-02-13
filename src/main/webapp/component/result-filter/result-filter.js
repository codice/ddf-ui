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
import { __assign, __read } from "tslib";
import { hot } from 'react-hot-loader';
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
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "min-w-120 max-w-120", ref: setElement },
            React.createElement(FilterBranch, { root: true, filter: filter, setFilter: setFilter })),
        React.createElement(Grid, { className: "w-full pt-2", container: true, direction: "row", alignItems: "center", wrap: "nowrap" },
            React.createElement(Grid, { item: true, className: "w-full" },
                React.createElement(Button, { "data-id": "remove-all-results-filters-button", fullWidth: true, variant: "text", color: "secondary", onClick: function () {
                        removeFilter();
                        closeDropdown();
                    } }, "Remove")),
            React.createElement(Grid, { item: true, className: "w-full" },
                React.createElement(Button, { "data-id": "save-results-filters-button", fullWidth: true, variant: "contained", color: "primary", onClick: function () {
                        saveFilter({ filter: filter });
                        closeDropdown();
                    } }, "Save")))));
};
export default hot(module)(ResultFilter);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LWZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcmVzdWx0LWZpbHRlci9yZXN1bHQtZmlsdGVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJOztBQUVKLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLFlBQVksTUFBTSxpQ0FBaUMsQ0FBQTtBQUMxRCxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLFdBQVcsR0FDWixNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JDLE9BQU8sSUFBSSxNQUFNLDZCQUE2QixDQUFBO0FBQzlDLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLG1DQUFtQyxDQUFBO0FBRWxGLElBQU0sZUFBZSxHQUFHO0lBQ3RCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2hFLENBQUMsQ0FBQTtBQUVELElBQU0sYUFBYSxHQUFHO0lBQ3BCLElBQU0sTUFBTSxHQUFHLGVBQWUsRUFBRSxDQUFBO0lBQ2hDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtRQUN4QixPQUFPLElBQUksa0JBQWtCLENBQUM7WUFDNUIsSUFBSSxFQUFFLEtBQUs7WUFDWCxPQUFPLEVBQUU7Z0JBQ1AsSUFBSSxXQUFXLENBQUM7b0JBQ2QsUUFBUSxFQUFFLFNBQVM7b0JBQ25CLEtBQUssRUFBRSxFQUFFO29CQUNULElBQUksRUFBRSxPQUFPO2lCQUNkLENBQUM7YUFDSDtZQUNELE9BQU8sRUFB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dCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEZpbHRlckJyYW5jaCBmcm9tICcuLi9maWx0ZXItYnVpbGRlci9maWx0ZXItYnJhbmNoJ1xuaW1wb3J0IHtcbiAgRmlsdGVyQnVpbGRlckNsYXNzLFxuICBGaWx0ZXJDbGFzcyxcbn0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgdXNlciBmcm9tICcuLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgeyB1c2VMaXN0ZW5Ub0VudGVyS2V5U3VibWl0RXZlbnQgfSBmcm9tICcuLi9jdXN0b20tZXZlbnRzL2VudGVyLWtleS1zdWJtaXQnXG5cbmNvbnN0IGdldFJlc3VsdEZpbHRlciA9ICgpID0+IHtcbiAgcmV0dXJuIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgncmVzdWx0RmlsdGVyJylcbn1cblxuY29uc3QgZ2V0QmFzZUZpbHRlciA9ICgpID0+IHtcbiAgY29uc3QgZmlsdGVyID0gZ2V0UmVzdWx0RmlsdGVyKClcbiAgaWYgKGZpbHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogJ0FORCcsXG4gICAgICBmaWx0ZXJzOiBbXG4gICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgcHJvcGVydHk6ICdhbnlUZXh0JyxcbiAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgfSlcbiAgfSBlbHNlIGlmIChmaWx0ZXIuZmlsdGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogJ0FORCcsXG4gICAgICBmaWx0ZXJzOiBbZmlsdGVyXSxcbiAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgIC4uLmZpbHRlcixcbiAgfSlcbn1cblxuY29uc3QgcmVtb3ZlRmlsdGVyID0gKCkgPT4ge1xuICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5zZXQoJ3Jlc3VsdEZpbHRlcicsICcnKVxuICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5zYXZlUHJlZmVyZW5jZXMoKVxufVxuXG5jb25zdCBzYXZlRmlsdGVyID0gKHsgZmlsdGVyIH06IGFueSkgPT4ge1xuICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5zZXQoJ3Jlc3VsdEZpbHRlcicsIGZpbHRlcilcbiAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuc2F2ZVByZWZlcmVuY2VzKClcbn1cblxuY29uc3QgUmVzdWx0RmlsdGVyID0gKHsgY2xvc2VEcm9wZG93biB9OiB7IGNsb3NlRHJvcGRvd246ICgpID0+IHZvaWQgfSkgPT4ge1xuICBjb25zdCBbZmlsdGVyLCBzZXRGaWx0ZXJdID0gUmVhY3QudXNlU3RhdGUoZ2V0QmFzZUZpbHRlcigpKVxuICBjb25zdCB7IHNldEVsZW1lbnQgfSA9IHVzZUxpc3RlblRvRW50ZXJLZXlTdWJtaXRFdmVudCh7XG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIHNhdmVGaWx0ZXIoeyBmaWx0ZXIgfSlcbiAgICAgIGNsb3NlRHJvcGRvd24oKVxuICAgIH0sXG4gIH0pXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLXctMTIwIG1heC13LTEyMFwiIHJlZj17c2V0RWxlbWVudH0+XG4gICAgICAgIDxGaWx0ZXJCcmFuY2ggcm9vdD17dHJ1ZX0gZmlsdGVyPXtmaWx0ZXJ9IHNldEZpbHRlcj17c2V0RmlsdGVyfSAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8R3JpZFxuICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHQtMlwiXG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICBkaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICA+XG4gICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsXCI+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgZGF0YS1pZD1cInJlbW92ZS1hbGwtcmVzdWx0cy1maWx0ZXJzLWJ1dHRvblwiXG4gICAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICAgIGNvbG9yPVwic2Vjb25kYXJ5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgcmVtb3ZlRmlsdGVyKClcbiAgICAgICAgICAgICAgY2xvc2VEcm9wZG93bigpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFJlbW92ZVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsXCI+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgZGF0YS1pZD1cInNhdmUtcmVzdWx0cy1maWx0ZXJzLWJ1dHRvblwiXG4gICAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2F2ZUZpbHRlcih7IGZpbHRlciB9KVxuICAgICAgICAgICAgICBjbG9zZURyb3Bkb3duKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgU2F2ZVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0dyaWQ+XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoUmVzdWx0RmlsdGVyKVxuIl19