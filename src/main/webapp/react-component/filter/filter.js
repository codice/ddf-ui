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
import FilterComparator from './filter-comparator';
import FilterInput from './filter-input';
import Grid from '@mui/material/Grid';
import { hot } from 'react-hot-loader';
import { FilterProperty } from './filter-property';
export var FilterContext = React.createContext({
    limitedAttributeList: undefined,
});
var Filter = function (_a) {
    var filter = _a.filter, setFilter = _a.setFilter, errorListener = _a.errorListener;
    return (React.createElement(Grid, { container: true, direction: "column", alignItems: "center", className: "w-full" },
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(FilterProperty, { filter: filter, setFilter: setFilter, errorListener: errorListener })),
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(FilterComparator, { filter: filter, setFilter: setFilter })),
        React.createElement(Grid, { "data-id": "filter-input", item: true, className: "w-full" },
            React.createElement(FilterInput, { filter: filter, setFilter: setFilter, errorListener: errorListener }))));
};
export default hot(module)(Filter);
//# sourceMappingURL=filter.js.map