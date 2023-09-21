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
import React from 'react';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import UploadItemViewReact from './upload-item.view';
export var UploadItemCollection = function (_a) {
    var collection = _a.collection;
    var _b = __read(React.useState(Math.random()), 2), setForceRender = _b[1];
    useListenTo(collection, 'add remove reset', function () {
        setForceRender(Math.random());
    });
    return (React.createElement("div", { className: " overflow-hidden flex flex-col space-y-2" }, collection.models.map(function (model) {
        return React.createElement(UploadItemViewReact, { key: model.cid, model: model });
    })));
};
//# sourceMappingURL=upload-item.collection.view.js.map