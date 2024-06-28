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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLWdyb3VwLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L25vdGlmaWNhdGlvbi1ncm91cC9ub3RpZmljYXRpb24tZ3JvdXAudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sNkNBQTZDLENBQUE7QUFDdEYsT0FBTyxpQkFBaUIsTUFBTSxrQ0FBa0MsQ0FBQTtBQUNoRSxPQUFPLElBQUksTUFBTSw2QkFBNkIsQ0FBQTtBQUM5QyxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLFNBQVMsTUFBTSwyQkFBMkIsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFPeEQsTUFBTSxDQUFDLElBQU0sMEJBQTBCLEdBQUcsVUFBQyxFQUdWO1FBRi9CLElBQUksVUFBQSxFQUNKLE1BQU0sWUFBQTtJQUVOLElBQU0sTUFBTSxHQUFHLGNBQWMsRUFBRSxDQUFBO0lBQy9CLElBQU0scUJBQXFCLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRTlELElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN0QyxPQUFPLElBQUksQ0FBQTtLQUNaO0lBQ0QsT0FBTyxDQUNMLG9CQUFDLEtBQUssQ0FBQyxRQUFRO1FBQ2Isb0JBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sZUFBSyxNQUFNLENBQUMsY0FBYztZQUMxRCxvQkFBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsV0FBVzs7Z0JBQ1AsSUFBSTtvQkFDSztZQUN6QyxvQkFBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsYUFBYTtnQkFDdkMsb0JBQUMsTUFBTSxJQUNMLE9BQU8sRUFBRTt3QkFDUCxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7b0JBQ3RCLENBQUMsYUFHTTtnQkFDVCxvQkFBQyxNQUFNLElBQ0wsS0FBSyxFQUFDLFNBQVMsRUFDZixPQUFPLEVBQUU7d0JBQ1AsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFBO3dCQUNwQixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBVTs0QkFDbEQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7d0JBQ2hDLENBQUMsQ0FBQyxDQUFBO3dCQUNGLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFBO29CQUN2RCxDQUFDLGNBR00sQ0FDZ0MsQ0FDVDtRQUNwQyw2QkFBSyxTQUFTLEVBQUMsbUNBQW1DO1lBQ2hELDZCQUFLLFNBQVMsRUFBQyxvQkFBb0IsSUFBRSxJQUFJLENBQU87WUFDaEQsb0JBQUMsTUFBTSxhQUFDLElBQUksRUFBQyxPQUFPLElBQUssTUFBTSxDQUFDLGNBQWM7Z0JBQzVDLG9CQUFDLFNBQVMsT0FBYSxDQUNoQixDQUNMO1FBQ04sNkJBQUssU0FBUyxFQUFDLGdDQUFnQyxJQUM1QyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsWUFBaUI7WUFDdEQsT0FBTyxDQUNMLG9CQUFDLHdCQUF3QixJQUN2QixHQUFHLEVBQUUsWUFBWSxDQUFDLEVBQUUsRUFDcEIsS0FBSyxFQUFFLFlBQVksR0FDbkIsQ0FDSCxDQUFBO1FBQ0gsQ0FBQyxDQUFDLENBQ0UsQ0FDUyxDQUNsQixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBVcGxvYWRCYXRjaEl0ZW1WaWV3UmVhY3QgfSBmcm9tICcuLi91cGxvYWQtYmF0Y2gtaXRlbS91cGxvYWQtYmF0Y2gtaXRlbS52aWV3J1xuaW1wb3J0IHVzZXJOb3RpZmljYXRpb25zIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1ub3RpZmljYXRpb25zJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBDbG9zZUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9DbG9zZSdcbmltcG9ydCB7IHVzZURpYWxvZ1N0YXRlIH0gZnJvbSAnLi4vaG9va3MvdXNlRGlhbG9nU3RhdGUnXG5cbnR5cGUgTm90aWZpY2F0aW9uR3JvdXBWaWV3UmVhY3RUeXBlID0ge1xuICBkYXRlOiBhbnlcbiAgZmlsdGVyOiBhbnlcbn1cblxuZXhwb3J0IGNvbnN0IE5vdGlmaWNhdGlvbkdyb3VwVmlld1JlYWN0ID0gKHtcbiAgZGF0ZSxcbiAgZmlsdGVyLFxufTogTm90aWZpY2F0aW9uR3JvdXBWaWV3UmVhY3RUeXBlKSA9PiB7XG4gIGNvbnN0IGRpYWxvZyA9IHVzZURpYWxvZ1N0YXRlKClcbiAgY29uc3QgcmVsZXZhbnROb3RpZmljYXRpb25zID0gdXNlck5vdGlmaWNhdGlvbnMuZmlsdGVyKGZpbHRlcilcblxuICBpZiAocmVsZXZhbnROb3RpZmljYXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICA8ZGlhbG9nLk11aURpYWxvZ0NvbXBvbmVudHMuRGlhbG9nIHsuLi5kaWFsb2cuTXVpRGlhbG9nUHJvcHN9PlxuICAgICAgICA8ZGlhbG9nLk11aURpYWxvZ0NvbXBvbmVudHMuRGlhbG9nVGl0bGU+XG4gICAgICAgICAgUmVtb3ZlIGFsbCBub3RpZmljYXRpb25zIGZvciB7ZGF0ZX0/XG4gICAgICAgIDwvZGlhbG9nLk11aURpYWxvZ0NvbXBvbmVudHMuRGlhbG9nVGl0bGU+XG4gICAgICAgIDxkaWFsb2cuTXVpRGlhbG9nQ29tcG9uZW50cy5EaWFsb2dBY3Rpb25zPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgZGlhbG9nLmhhbmRsZUNsb3NlKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgZGlhbG9nLmhhbmRsZUNsb3NlKClcbiAgICAgICAgICAgICAgdXNlck5vdGlmaWNhdGlvbnMuZmlsdGVyKGZpbHRlcikuZm9yRWFjaCgobW9kZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIG1vZGVsLmNvbGxlY3Rpb24ucmVtb3ZlKG1vZGVsKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5zYXZlUHJlZmVyZW5jZXMoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBDb25maXJtXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvZGlhbG9nLk11aURpYWxvZ0NvbXBvbmVudHMuRGlhbG9nQWN0aW9ucz5cbiAgICAgIDwvZGlhbG9nLk11aURpYWxvZ0NvbXBvbmVudHMuRGlhbG9nPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtcm93IGl0ZW1zLWNlbnRlciB3LWZ1bGxcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoZWFkZXItd2hlbiB3LWZ1bGxcIj57ZGF0ZX08L2Rpdj5cbiAgICAgICAgPEJ1dHRvbiBzaXplPVwibGFyZ2VcIiB7Li4uZGlhbG9nLk11aUJ1dHRvblByb3BzfT5cbiAgICAgICAgICA8Q2xvc2VJY29uPjwvQ2xvc2VJY29uPlxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgZmxleCBmbGV4LWNvbCBzcGFjZS15LTRcIj5cbiAgICAgICAge3VzZXJOb3RpZmljYXRpb25zLmZpbHRlcihmaWx0ZXIpLm1hcCgobm90aWZpY2F0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFVwbG9hZEJhdGNoSXRlbVZpZXdSZWFjdFxuICAgICAgICAgICAgICBrZXk9e25vdGlmaWNhdGlvbi5pZH1cbiAgICAgICAgICAgICAgbW9kZWw9e25vdGlmaWNhdGlvbn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gIClcbn1cbiJdfQ==