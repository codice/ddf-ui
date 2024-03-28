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
// @ts-nocheck FIXME: Property 'collection' does not exist on type 'Intr
import { hot } from 'react-hot-loader';
import * as React from 'react';
import SortSelections from '../query-sort-selection/sort-selections';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
var render = function (_a) {
    var removeSort = _a.removeSort, saveSort = _a.saveSort, hasSort = _a.hasSort, collection = _a.collection;
    return (React.createElement("div", { className: "min-w-120" },
        React.createElement(SortSelections, { collection: collection }),
        React.createElement(Grid, { container: true, direction: "row", alignItems: "center", wrap: "nowrap" },
            hasSort ? (React.createElement(Grid, { item: true, className: "w-full" },
                React.createElement(Button, { fullWidth: true, onClick: removeSort, variant: "text", color: "secondary" }, "Remove Sort"))) : null,
            React.createElement(Grid, { item: true, className: "w-full" },
                React.createElement(Button, { fullWidth: true, onClick: saveSort, variant: "contained", color: "primary" }, "Save Sort")))));
};
export default hot(module)(render);
//# sourceMappingURL=presentation.js.map