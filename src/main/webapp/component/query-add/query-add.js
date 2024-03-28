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
import { __read } from "tslib";
import * as React from 'react';
import QueryBasic from '../../component/query-basic/query-basic.view';
import QueryAdvanced from '../../component/query-advanced/query-advanced';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
export var queryForms = [
    { id: 'basic', title: 'Basic Search', view: QueryBasic },
    {
        id: 'advanced',
        title: 'Advanced Search',
        view: QueryAdvanced,
    },
];
export var QueryAddReact = function (_a) {
    var model = _a.model, errorListener = _a.errorListener, Extensions = _a.Extensions;
    var _b = __read(React.useState(Math.random()), 2), setForceRender = _b[1];
    useListenTo(model, 'resetToDefaults change:type', function () {
        setForceRender(Math.random());
    });
    var formType = model.get('type');
    var form = queryForms.find(function (form) { return form.id === formType; }) || queryForms[0];
    return (React.createElement(React.Fragment, null,
        React.createElement("form", { target: "autocomplete", action: "/search/catalog/blank.html", className: "w-full" }, (function () {
            if (form.id === 'basic') {
                return (React.createElement(QueryBasic, { model: model, key: model.id, errorListener: errorListener, Extensions: Extensions }));
            }
            else {
                return (React.createElement(QueryAdvanced, { model: model, key: model.id, errorListener: errorListener, Extensions: Extensions }));
            }
        })())));
};
//# sourceMappingURL=query-add.js.map