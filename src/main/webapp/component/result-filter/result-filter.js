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
//# sourceMappingURL=result-filter.js.map