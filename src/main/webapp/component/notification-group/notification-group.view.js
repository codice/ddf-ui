import { __assign } from "tslib";
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
import { UploadBatchItemViewReact } from '../upload-batch-item/upload-batch-item.view';
import userNotifications from '../singletons/user-notifications';
import user from '../singletons/user-instance';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { useDialogState } from '../hooks/useDialogState';
export var NotificationGroupViewReact = function (_a) {
    var date = _a.date, filter = _a.filter;
    var dialog = useDialogState();
    var relevantNotifications = userNotifications.filter(filter);
    if (relevantNotifications.length === 0) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(dialog.MuiDialogComponents.Dialog, __assign({}, dialog.MuiDialogProps),
            React.createElement(dialog.MuiDialogComponents.DialogTitle, null,
                "Remove all notifications for ",
                date,
                "?"),
            React.createElement(dialog.MuiDialogComponents.DialogActions, null,
                React.createElement(Button, { onClick: function () {
                        dialog.handleClose();
                    } }, "Cancel"),
                React.createElement(Button, { color: "primary", onClick: function () {
                        dialog.handleClose();
                        userNotifications.filter(filter).forEach(function (model) {
                            model.collection.remove(model);
                        });
                        user.get('user').get('preferences').savePreferences();
                    } }, "Confirm"))),
        React.createElement("div", { className: "flex flex-row items-center w-full" },
            React.createElement("div", { className: "header-when w-full" }, date),
            React.createElement(Button, __assign({ size: "large" }, dialog.MuiButtonProps),
                React.createElement(CloseIcon, null))),
        React.createElement("div", { className: "w-full flex flex-col space-y-4" }, userNotifications.filter(filter).map(function (notification) {
            return (React.createElement(UploadBatchItemViewReact, { key: notification.id, model: notification }));
        }))));
};
//# sourceMappingURL=notification-group.view.js.map