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
import MetacardArchive from '../metacard-archive';
import { MetacardInteraction } from './metacard-interactions';
import { hot } from 'react-hot-loader';
import { useDialog } from '../../component/dialog';
import { Divider } from './metacard-interactions';
import { TypedUserInstance } from '../../component/singletons/TypedUser';
export var ArchiveAction = function (props) {
    if (!props.model || props.model.length <= 0) {
        return null;
    }
    var isDeleteAction = props.model.some(function (result) {
        return !result.isDeleted();
    });
    var canPerformOnAll = props.model.every(function (result) {
        return (TypedUserInstance.isAdmin(result) &&
            !result.isRemote() &&
            result.isDeleted() !== isDeleteAction);
    });
    if (!canPerformOnAll) {
        return null;
    }
    var dialogContext = useDialog();
    return (React.createElement(React.Fragment, null,
        React.createElement(Divider, null),
        React.createElement(MetacardInteraction, { onClick: function () {
                props.onClose();
                if (props.model) {
                    dialogContext.setProps({
                        children: React.createElement(MetacardArchive, { results: props.model }),
                        open: true,
                    });
                }
            }, icon: isDeleteAction ? 'fa fa-trash' : 'fa fa-undo', text: isDeleteAction ? 'Delete' : 'Restore', help: isDeleteAction ? 'Move item(s) to trash' : 'Move item(s) from trash' })));
};
export default hot(module)(ArchiveAction);
//# sourceMappingURL=archive-interaction.js.map