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
import _ from 'underscore';
import MetacardActionsPresentation from './presentation';
import { OverridableGetColumnOrder, aliasMap } from '../utils/export';
var MetacardActions = function (props) {
    var model = props.result;
    var exportActions = _.sortBy(model.getExportActions().map(function (action) { return ({
        url: action.url +
            "&columnOrder=".concat(OverridableGetColumnOrder.get()(), "&aliases=").concat(aliasMap),
        title: action.displayName,
    }); }), function (action) { return action.title.toLowerCase(); });
    var otherActions = _.sortBy(model.getOtherActions().map(function (action) { return ({
        url: action.url,
        title: action.title,
    }); }), function (action) { return action.title.toLowerCase(); });
    return (React.createElement(MetacardActionsPresentation, { model: model, exportActions: exportActions, otherActions: otherActions }));
};
export default hot(module)(MetacardActions);
//# sourceMappingURL=container.js.map