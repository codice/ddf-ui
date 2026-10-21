import { __extends, __makeTemplateObject } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
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
import moment from 'moment-timezone';
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
        return userNotifications.isEmpty() ? (_jsx(Empty, { children: _jsx("div", { children: "No Notifications" }) })) : (_jsx(Root, { children: _jsx("div", { children: _jsx(Notifications, { children: dayRange.map(function (day) {
                        return (_jsx(NotificationGroupViewReact, { filter: getFilterForDay(day), date: day === 8 ? 'Older' : informalName(day) }, day));
                    }) }) }) }));
    };
    UserNotifications.prototype.componentWillUnmount = function () {
        userNotifications.setSeen();
        user.savePreferences();
    };
    return UserNotifications;
}(React.Component));
export default withListenTo(UserNotifications);
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub3RpZmljYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC91c2VyLW5vdGlmaWNhdGlvbnMvdXNlci1ub3RpZmljYXRpb25zLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLFlBQW1DLE1BQU0sdUJBQXVCLENBQUE7QUFDdkUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sNERBQTRELENBQUE7QUFDdkcsT0FBTyxJQUFJLE1BQU0sMENBQTBDLENBQUE7QUFDM0QsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUE7QUFDcEMsT0FBTyxpQkFBaUIsTUFBTSwrQ0FBK0MsQ0FBQTtBQUk3RSxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxrTUFBQSw0QkFDRSxFQUF5Qyx3RUFHcEQsRUFBb0MsZ0JBQ3RDLEVBQW9DLEtBQ2hELEtBTHlCLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBOUIsQ0FBOEIsRUFHcEQsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBekIsQ0FBeUIsRUFDdEMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBekIsQ0FBeUIsQ0FDaEQsQ0FBQTtBQUNELElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLDJIQUFBLHdEQUl0QixJQUFBLENBQUE7QUFDRCxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsR0FBRyw2SUFBQSxtRUFJbkIsRUFBb0MsS0FDaEQsS0FEWSxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUF6QixDQUF5QixDQUNoRCxDQUFBO0FBRUQsSUFBTSxZQUFZLEdBQUcsVUFBQyxPQUFZO0lBQ2hDLFFBQVEsT0FBTyxFQUFFLENBQUM7UUFDaEIsS0FBSyxDQUFDLENBQUM7WUFDTCxPQUFPLFFBQVEsQ0FBQTtZQUNmLE1BQUs7UUFDUCxLQUFLLENBQUM7WUFDSixPQUFPLE9BQU8sQ0FBQTtZQUNkLE1BQUs7UUFDUCxLQUFLLENBQUM7WUFDSixPQUFPLFdBQVcsQ0FBQTtZQUNsQixNQUFLO1FBQ1A7WUFDRSxPQUFPLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3hELE1BQUs7SUFDVCxDQUFDO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsSUFBTSxlQUFlLEdBQUcsVUFBQyxPQUFlO0lBQ3RDLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sVUFBQyxLQUFVO1lBQ2hCLE9BQU8sTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZELENBQUMsQ0FBQTtJQUNILENBQUM7U0FBTSxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN2QixPQUFPLFVBQUMsS0FBVTtZQUNoQixPQUFPLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLE9BQU8sQ0FBQTtRQUMvRCxDQUFDLENBQUE7SUFDSCxDQUFDO1NBQU0sQ0FBQztRQUNOLE9BQU8sVUFBQyxLQUFVO1lBQ2hCLE9BQU8sTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3hELENBQUMsQ0FBQTtJQUNILENBQUM7QUFDSCxDQUFDLENBQUE7QUFFRCxJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFFaEQ7SUFBZ0MscUNBQTBCO0lBRXhELDJCQUFZLEtBQVk7UUFDdEIsWUFBQSxNQUFLLFlBQUMsS0FBSyxDQUFDLFNBQUE7UUFDWixLQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRTtZQUMxRCxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQWpCLENBQWlCLENBQ2xCLENBQUE7O0lBQ0gsQ0FBQztJQUNELGtDQUFNLEdBQU47UUFDRSxPQUFPLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUNuQyxLQUFDLEtBQUssY0FDSiw2Q0FBMkIsR0FDckIsQ0FDVCxDQUFDLENBQUMsQ0FBQyxDQUNGLEtBQUMsSUFBSSxjQUNILHdCQUNFLEtBQUMsYUFBYSxjQUNYLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQyxHQUFHO3dCQUNoQixPQUFPLENBQ0wsS0FBQywwQkFBMEIsSUFFekIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFDNUIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUZ4QyxHQUFHLENBR1IsQ0FDSCxDQUFBO29CQUNILENBQUMsQ0FBQyxHQUNZLEdBQ1osR0FDRCxDQUNSLENBQUE7SUFDSCxDQUFDO0lBQ0QsZ0RBQW9CLEdBQXBCO1FBQ0UsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDM0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0lBQ3hCLENBQUM7SUFDSCx3QkFBQztBQUFELENBQUMsQUFuQ0QsQ0FBZ0MsS0FBSyxDQUFDLFNBQVMsR0FtQzlDO0FBRUQsZUFBZSxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IHdpdGhMaXN0ZW5UbywgeyBXaXRoQmFja2JvbmVQcm9wcyB9IGZyb20gJy4uL2JhY2tib25lLWNvbnRhaW5lcidcbmltcG9ydCB7IE5vdGlmaWNhdGlvbkdyb3VwVmlld1JlYWN0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L25vdGlmaWNhdGlvbi1ncm91cC9ub3RpZmljYXRpb24tZ3JvdXAudmlldydcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudC10aW1lem9uZSdcbmltcG9ydCB1c2VyTm90aWZpY2F0aW9ucyBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLW5vdGlmaWNhdGlvbnMnXG5cbnR5cGUgUHJvcHMgPSBXaXRoQmFja2JvbmVQcm9wc1xuXG5jb25zdCBFbXB0eSA9IHN0eWxlZC5kaXZgXG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUuY29yZVRyYW5zaXRpb25UaW1lfSBsaW5lYXI7XG4gIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgZm9udC1zaXplOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubGFyZ2VGb250U2l6ZX07XG4gIHBhZGRpbmc6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5tZWRpdW1TcGFjaW5nfTtcbmBcbmNvbnN0IFJvb3QgPSBzdHlsZWQuZGl2YFxuICBoZWlnaHQ6IDEwMCU7XG4gIHdpZHRoOiAxMDAlO1xuICBvdmVyZmxvdzogYXV0bztcbmBcbmNvbnN0IE5vdGlmaWNhdGlvbnMgPSBzdHlsZWQuZGl2YFxuICBoZWlnaHQ6IDEwMCU7XG4gIHdpZHRoOiAxMDAlO1xuICBkaXNwbGF5OiBibG9jaztcbiAgcGFkZGluZzogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1lZGl1bVNwYWNpbmd9O1xuYFxuXG5jb25zdCBpbmZvcm1hbE5hbWUgPSAoZGF5c0FnbzogYW55KSA9PiB7XG4gIHN3aXRjaCAoZGF5c0Fnbykge1xuICAgIGNhc2UgLTE6XG4gICAgICByZXR1cm4gJ0Z1dHVyZSdcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuICdUb2RheSdcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuICdZZXN0ZXJkYXknXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbW9tZW50KCkuc3VidHJhY3QoZGF5c0FnbywgJ2RheXMnKS5mb3JtYXQoJ2RkZGQnKVxuICAgICAgYnJlYWtcbiAgfVxufVxuXG5jb25zdCBnZXRGaWx0ZXJGb3JEYXkgPSAobnVtRGF5czogbnVtYmVyKSA9PiB7XG4gIGlmIChudW1EYXlzIDwgMCkge1xuICAgIHJldHVybiAobW9kZWw6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIG1vbWVudCgpLmRpZmYobW9kZWwuZ2V0KCdzZW50QXQnKSwgJ2RheXMnKSA8IDBcbiAgICB9XG4gIH0gZWxzZSBpZiAobnVtRGF5cyA8IDcpIHtcbiAgICByZXR1cm4gKG1vZGVsOiBhbnkpID0+IHtcbiAgICAgIHJldHVybiBtb21lbnQoKS5kaWZmKG1vZGVsLmdldCgnc2VudEF0JyksICdkYXlzJykgPT09IG51bURheXNcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChtb2RlbDogYW55KSA9PiB7XG4gICAgICByZXR1cm4gbW9tZW50KCkuZGlmZihtb2RlbC5nZXQoJ3NlbnRBdCcpLCAnZGF5cycpID49IDdcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgZGF5UmFuZ2UgPSBbLTEsIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDhdXG5cbmNsYXNzIFVzZXJOb3RpZmljYXRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PFByb3BzLCB7fT4ge1xuICBub3RpZmljYXRpb25Hcm91cHM6IGFueVxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnByb3BzLmxpc3RlblRvKHVzZXJOb3RpZmljYXRpb25zLCAnYWRkIHJlbW92ZSB1cGRhdGUnLCAoKSA9PlxuICAgICAgdGhpcy5zZXRTdGF0ZSh7fSlcbiAgICApXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiB1c2VyTm90aWZpY2F0aW9ucy5pc0VtcHR5KCkgPyAoXG4gICAgICA8RW1wdHk+XG4gICAgICAgIDxkaXY+Tm8gTm90aWZpY2F0aW9uczwvZGl2PlxuICAgICAgPC9FbXB0eT5cbiAgICApIDogKFxuICAgICAgPFJvb3Q+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPE5vdGlmaWNhdGlvbnM+XG4gICAgICAgICAgICB7ZGF5UmFuZ2UubWFwKChkYXkpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8Tm90aWZpY2F0aW9uR3JvdXBWaWV3UmVhY3RcbiAgICAgICAgICAgICAgICAgIGtleT17ZGF5fVxuICAgICAgICAgICAgICAgICAgZmlsdGVyPXtnZXRGaWx0ZXJGb3JEYXkoZGF5KX1cbiAgICAgICAgICAgICAgICAgIGRhdGU9e2RheSA9PT0gOCA/ICdPbGRlcicgOiBpbmZvcm1hbE5hbWUoZGF5KX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA8L05vdGlmaWNhdGlvbnM+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9Sb290PlxuICAgIClcbiAgfVxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB1c2VyTm90aWZpY2F0aW9ucy5zZXRTZWVuKClcbiAgICB1c2VyLnNhdmVQcmVmZXJlbmNlcygpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgd2l0aExpc3RlblRvKFVzZXJOb3RpZmljYXRpb25zKVxuIl19