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
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import { useHistory } from 'react-router-dom';
export var UploadSummaryViewReact = function (_a) {
    var model = _a.model;
    var history = useHistory();
    var _b = __read(React.useState(model.toJSON()), 2), modelJson = _b[0], setModelJson = _b[1];
    useListenTo(model, 'change:amount change:errors change:complete change:percentage change:sending change:issues', function () {
        setModelJson(model.toJSON());
    });
    var amount = modelJson.amount, complete = modelJson.complete, percentage = modelJson.percentage, success = modelJson.success, sending = modelJson.sending, error = modelJson.error, issues = modelJson.issues, interrupted = modelJson.interrupted, finished = modelJson.finished;
    var isSending = sending;
    var hasError = error;
    var hasSuccess = success;
    var hasIssues = issues > 0;
    var wasInterrupted = interrupted;
    return (React.createElement(Button, { className: "".concat(isSending ? 'show-progress' : '', " ").concat(hasError ? 'has-error' : '', " ").concat(hasSuccess ? 'has-success' : '', " ").concat(hasIssues ? 'has-issues' : '', " ").concat(wasInterrupted ? 'was-interrupted' : ''), fullWidth: true, onClick: function () {
            history.push({
                pathname: "/uploads/".concat(model.id),
            });
        } },
        React.createElement("div", { className: "upload-summary is-medium-font" },
            React.createElement("div", { className: "summary-info flex flex-col justify-start items-center" },
                React.createElement("div", { className: "info-files" },
                    React.createElement("span", { className: "files-issues fa fa-exclamation-triangle mr-2" }),
                    React.createElement("span", { className: "files-text" }, "".concat(complete + ' / ' + amount + ' Completed'))),
                !finished && !wasInterrupted ? (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "info-percentage" }, Math.floor(percentage) + '%'),
                    React.createElement(LinearProgress, { className: "w-full h-2", variant: "determinate", value: percentage }))) : (React.createElement(React.Fragment, null))))));
};
//# sourceMappingURL=upload-summary.view.js.map