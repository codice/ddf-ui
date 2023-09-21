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
import { __awaiter, __generator } from "tslib";
import { hot } from 'react-hot-loader';
import * as React from 'react';
import Button from '@mui/material/Button';
import ProgressButton from '../progress-button';
import { useDialog } from '../../component/dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useSnack from '../../component/hooks/useSnack';
var render = function (props) {
    var onArchiveConfirm = props.onArchiveConfirm, onRestoreConfirm = props.onRestoreConfirm, isDeleted = props.isDeleted, loading = props.loading;
    var addSnack = useSnack();
    var dialogContext = useDialog();
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogTitle, null,
            isDeleted ? 'Restore' : 'Delete',
            " Item(s)"),
        React.createElement(DialogContent, null,
            React.createElement(DialogContentText, null,
                "Are you sure you want to ",
                isDeleted ? 'restore' : 'delete',
                "?"),
            React.createElement(DialogContentText, null,
                "Doing so will ",
                isDeleted ? 'include' : 'remove',
                " the item(s)",
                ' ',
                isDeleted ? 'in' : 'from',
                " future search results.")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: function () {
                    dialogContext.setProps({ open: false });
                } }, "Cancel"),
            React.createElement(ProgressButton, { dataId: "archive-confirm", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, err_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 5, 6, 7]);
                                dialogContext.setProps({
                                    onClose: function (_event, reason) {
                                        if (reason === 'backdropClick' ||
                                            reason === 'escapeKeyDown') {
                                            return;
                                        }
                                        dialogContext.setProps({
                                            open: false,
                                        });
                                    },
                                });
                                if (!isDeleted) return [3 /*break*/, 2];
                                return [4 /*yield*/, onRestoreConfirm()];
                            case 1:
                                _a = _b.sent();
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, onArchiveConfirm()];
                            case 3:
                                _a = _b.sent();
                                _b.label = 4;
                            case 4:
                                _a;
                                addSnack("Successfully ".concat(isDeleted ? "restored" : "deleted"));
                                return [3 /*break*/, 7];
                            case 5:
                                err_1 = _b.sent();
                                console.log('Error: ', err_1);
                                addSnack("An error occurred while trying to ".concat(isDeleted ? 'restore' : 'delete', "."), {
                                    status: 'error',
                                });
                                return [3 /*break*/, 7];
                            case 6:
                                if (!loading)
                                    dialogContext.setProps({ open: false });
                                return [7 /*endfinally*/];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); }, variant: "contained", color: "primary", disabled: loading, loading: loading }, isDeleted ? 'Restore' : 'Delete'))));
};
export default hot(module)(render);
//# sourceMappingURL=presentation.js.map