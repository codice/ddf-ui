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
import user from '../singletons/user-instance';
import { UploadSummaryViewReact } from '../upload-summary/upload-summary.view';
import { Link } from 'react-router-dom';
import * as React from 'react';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import Common from '../../js/Common';
import { TypedUserInstance } from '../singletons/TypedUser';
export var UploadBatchItemViewReact = function (_a) {
    var model = _a.model;
    var _b = __read(React.useState(model.toJSON()), 2), modelJson = _b[0], setModelJson = _b[1];
    useListenTo(model, 'change:finished', function () {
        setModelJson(model.toJSON());
    });
    var id = modelJson.id, finished = modelJson.finished, sentAt = modelJson.sentAt, interrupted = modelJson.interrupted;
    var when = Common.getRelativeDate(sentAt);
    var specificWhen = TypedUserInstance.getMomentDate(sentAt);
    return (React.createElement(Paper, { className: "".concat(finished ? 'is-finished' : '', "  flex flex-row items-stretch flex-nowrap w-full justify-between p-2") },
        React.createElement(Link, { to: "/uploads/".concat(id), style: { display: 'block', padding: '0px' }, className: "w-full shrink no-underline", title: specificWhen },
            React.createElement("div", { className: "upload-details" },
                React.createElement("div", { className: "details-date is-medium-font" },
                    React.createElement("span", { className: "fa fa-upload p-2" }),
                    React.createElement("span", null, when)),
                React.createElement("div", { className: "details-summary mt-2" },
                    React.createElement(UploadSummaryViewReact, { model: model })))),
        React.createElement("div", { className: "upload-actions shrink-0 " }, finished || interrupted ? (React.createElement(React.Fragment, null,
            React.createElement(Button, { className: " h-full w-12", onClick: function () {
                    model.collection.remove(model);
                    user.get('user').get('preferences').savePreferences();
                } },
                React.createElement(CloseIcon, null)))) : (React.createElement(React.Fragment, null,
            React.createElement(Button, { className: " h-full w-12", onClick: function () {
                    model.cancel();
                } },
                React.createElement("span", { className: "fa fa-stop" })))))));
};
//# sourceMappingURL=upload-batch-item.view.js.map