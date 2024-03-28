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
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { useHistory } from 'react-router-dom';
var modelToJSON = function (model) {
    var modelJSON = model.toJSON();
    modelJSON.file = {
        name: modelJSON.file.name,
        size: (modelJSON.file.size / 1000000).toFixed(2) + 'MB, ',
        type: modelJSON.file.type,
    };
    return modelJSON;
};
export var UploadItemViewReact = function (_a) {
    var model = _a.model;
    var history = useHistory();
    var _b = __read(React.useState(modelToJSON(model)), 2), modelJson = _b[0], setModelJson = _b[1];
    var _c = __read(React.useState(false), 2), cancel = _c[0], setCancel = _c[1];
    useListenTo(model, 'change:percentage change:sending change:success change:error change:validating change:issues', function () {
        setModelJson(modelToJSON(model));
    });
    React.useEffect(function () {
        if (cancel && model) {
            model.cancel();
        }
    }, [cancel, model]);
    var isSending = modelJson.sending;
    var hasError = modelJson.error;
    var hasSuccess = modelJson.success;
    var hasIssues = modelJson.issues;
    var isValidating = modelJson.validating;
    return (React.createElement("div", { className: "flex flex-row items-center flex-nowrap w-full p-4 border-gray-600/25 border", onClick: function () {
            if (model.get('success') && !model.hasChildren()) {
                history.push({
                    pathname: "/metacards/".concat(model.get('id')),
                });
            }
        } },
        React.createElement("div", { className: "w-full shrink" },
            React.createElement("div", { className: "text-center" },
                React.createElement("div", null,
                    React.createElement("span", { className: "top-filename" }, modelJson.file.name)),
                React.createElement("div", null,
                    React.createElement("div", null,
                        React.createElement("span", { className: "bottom-filesize" }, modelJson.file.size),
                        React.createElement("span", { className: "bottom-filetype" }, modelJson.file.type)),
                    React.createElement("div", null, Math.floor(modelJson.percentage) + '%'))),
            !hasSuccess && !hasError && isSending ? (React.createElement(LinearProgress, { className: "h-2 w-full", value: modelJson.percentage, variant: "determinate" })) : null,
            hasSuccess ? (React.createElement("div", { className: "info-success text-center" },
                React.createElement("div", { className: "success-message" },
                    hasIssues ? (React.createElement("span", null, "Uploaded, but quality issues were found ")) : (React.createElement(React.Fragment, null)),
                    isValidating ? (React.createElement("span", { className: "success-validate fa fa-refresh fa-spin is-critical-animation" })) : (React.createElement(React.Fragment, null)),
                    hasIssues ? React.createElement("span", { className: "message-text" }) : React.createElement(React.Fragment, null)))) : null,
            hasError ? (React.createElement("div", { className: "info-error text-center" },
                React.createElement("div", { className: "error-message" }, modelJson.message))) : null),
        React.createElement("div", { className: "upload-actions shrink-0" },
            !isSending ? (React.createElement(Button, { onClick: function () {
                    setCancel(true);
                } }, "Remove")) : null,
            hasSuccess ? (React.createElement(Button, { onClick: function () {
                    history.push({
                        pathname: "/metacards/".concat(model.get('id')),
                    });
                } }, "Success")) : (React.createElement(React.Fragment, null)),
            hasError ? (React.createElement(React.Fragment, null,
                React.createElement("div", null, "Failures"))) : (React.createElement(React.Fragment, null)))));
};
export default hot(module)(UploadItemViewReact);
//# sourceMappingURL=upload-item.view.js.map