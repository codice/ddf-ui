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
import Button from '@mui/material/Button';
import user from '../../component/singletons/user-instance';
import TransferList from '../../component/tabs/metacard/transfer-list';
import { Elevations } from '../../component/theme/theme';
import { useDialog } from '../../component/dialog';
import { TypedUserInstance } from '../../component/singletons/TypedUser';
import { StartupDataStore } from '../../js/model/Startup/startup';
export default (function (_a) {
    var _b = _a.isExport, isExport = _b === void 0 ? false : _b;
    var requiredAttributes = StartupDataStore.Configuration.getRequiredExportAttributes();
    var dialogContext = useDialog();
    return (React.createElement(Button, { "data-id": "manage-attributes-button", onClick: function () {
            dialogContext.setProps({
                PaperProps: {
                    style: {
                        minWidth: 'none',
                    },
                    elevation: Elevations.panels,
                },
                open: true,
                disableEnforceFocus: true,
                children: (React.createElement("div", { style: {
                        minHeight: '60vh',
                    } },
                    React.createElement(TransferList, { startingLeft: TypedUserInstance.getResultsAttributesSummaryShown(), requiredAttributes: requiredAttributes, startingRight: TypedUserInstance.getResultsAttributesPossibleSummaryShown(), startingHideEmpty: user
                            .get('user')
                            .get('preferences')
                            .get('inspector-hideEmpty'), onSave: function (active, newHideEmpty) {
                            user.get('user').get('preferences').set({
                                'inspector-summaryShown': active,
                                'inspector-hideEmpty': newHideEmpty,
                            });
                            user.savePreferences();
                        } }))),
            });
        }, color: "primary", size: "small", style: { height: 'auto' } }, isExport ? 'Select Attributes to Export' : 'Manage Attributes'));
});
//# sourceMappingURL=summary-manage-attributes.js.map