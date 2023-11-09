import { __extends, __makeTemplateObject } from "tslib";
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
import styled from 'styled-components';
import withListenTo from '../backbone-container';
import { NotificationGroupViewReact } from '../../component/notification-group/notification-group.view';
import user from '../../component/singletons/user-instance';
import moment from 'moment';
import userNotifications from '../../component/singletons/user-notifications';
var Empty = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  transition: transform ", " linear;\n  transform: scale(1);\n  text-align: center;\n  font-size: ", ";\n  padding: ", ";\n"], ["\n  transition: transform ", " linear;\n  transform: scale(1);\n  text-align: center;\n  font-size: ", ";\n  padding: ", ";\n"])), function (props) { return props.theme.coreTransitionTime; }, function (props) { return props.theme.largeFontSize; }, function (props) { return props.theme.mediumSpacing; });
var Root = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  height: 100%;\n  width: 100%;\n  overflow: auto;\n"], ["\n  height: 100%;\n  width: 100%;\n  overflow: auto;\n"])));
var Notifications = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  height: 100%;\n  width: 100%;\n  display: block;\n  padding: ", ";\n"], ["\n  height: 100%;\n  width: 100%;\n  display: block;\n  padding: ", ";\n"])), function (props) { return props.theme.mediumSpacing; });
var informalName = function (daysAgo) {
    switch (daysAgo) {
        case -1:
            return 'Future';
            break;
        case 0:
            return 'Today';
            break;
        case 1:
            return 'Yesterday';
            break;
        default:
            return moment().subtract(daysAgo, 'days').format('dddd');
            break;
    }
};
var getFilterForDay = function (numDays) {
    if (numDays < 0) {
        return function (model) {
            return moment().diff(model.get('sentAt'), 'days') < 0;
        };
    }
    else if (numDays < 7) {
        return function (model) {
            return moment().diff(model.get('sentAt'), 'days') === numDays;
        };
    }
    else {
        return function (model) {
            return moment().diff(model.get('sentAt'), 'days') >= 7;
        };
    }
};
var dayRange = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
var UserNotifications = /** @class */ (function (_super) {
    __extends(UserNotifications, _super);
    function UserNotifications(props) {
        var _this = _super.call(this, props) || this;
        _this.props.listenTo(userNotifications, 'add remove update', function () {
            return _this.setState({});
        });
        return _this;
    }
    UserNotifications.prototype.render = function () {
        return userNotifications.isEmpty() ? (React.createElement(Empty, null,
            React.createElement("div", null, "No Notifications"))) : (React.createElement(Root, null,
            React.createElement("div", null,
                React.createElement(Notifications, null, dayRange.map(function (day) {
                    return (React.createElement(NotificationGroupViewReact, { key: day, filter: getFilterForDay(day), date: day === 8 ? 'Older' : informalName(day) }));
                })))));
    };
    UserNotifications.prototype.componentWillUnmount = function () {
        userNotifications.setSeen();
        user.savePreferences();
    };
    return UserNotifications;
}(React.Component));
export default withListenTo(UserNotifications);
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=user-notifications.js.map