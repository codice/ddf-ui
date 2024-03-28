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
import QuerySettings from '../query-settings/query-settings';
import { FilterBuilderRoot } from '../filter-builder/filter-builder';
import { hot } from 'react-hot-loader';
import Swath from '../swath/swath';
export var QueryAdvanced = function (_a) {
    var model = _a.model, errorListener = _a.errorListener, Extensions = _a.Extensions;
    return (React.createElement("div", { className: "w-full h-full" },
        React.createElement("div", { "data-id": "advanced-search-container", className: "w-full h-full px-2 pt-2 overflow-auto" },
            React.createElement("div", { className: "query-advanced w-full" },
                React.createElement(FilterBuilderRoot, { model: model, errorListener: errorListener })),
            React.createElement("div", { className: "py-5 w-full" },
                React.createElement(Swath, { className: "w-full h-1" })),
            React.createElement("div", { className: "query-settings w-full" },
                React.createElement(QuerySettings, { model: model, Extensions: Extensions })))));
};
export default hot(module)(QueryAdvanced);
//# sourceMappingURL=query-advanced.js.map