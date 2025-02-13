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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub3RpZmljYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC91c2VyLW5vdGlmaWNhdGlvbnMvdXNlci1ub3RpZmljYXRpb25zLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sWUFBbUMsTUFBTSx1QkFBdUIsQ0FBQTtBQUN2RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw0REFBNEQsQ0FBQTtBQUN2RyxPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUE7QUFDM0IsT0FBTyxpQkFBaUIsTUFBTSwrQ0FBK0MsQ0FBQTtBQUk3RSxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxrTUFBQSw0QkFDRSxFQUF5Qyx3RUFHcEQsRUFBb0MsZ0JBQ3RDLEVBQW9DLEtBQ2hELEtBTHlCLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBOUIsQ0FBOEIsRUFHcEQsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBekIsQ0FBeUIsRUFDdEMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBekIsQ0FBeUIsQ0FDaEQsQ0FBQTtBQUNELElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLDJIQUFBLHdEQUl0QixJQUFBLENBQUE7QUFDRCxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsR0FBRyw2SUFBQSxtRUFJbkIsRUFBb0MsS0FDaEQsS0FEWSxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxL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WSxDQUFDLGlCQUFpQixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCB3aXRoTGlzdGVuVG8sIHsgV2l0aEJhY2tib25lUHJvcHMgfSBmcm9tICcuLi9iYWNrYm9uZS1jb250YWluZXInXG5pbXBvcnQgeyBOb3RpZmljYXRpb25Hcm91cFZpZXdSZWFjdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9ub3RpZmljYXRpb24tZ3JvdXAvbm90aWZpY2F0aW9uLWdyb3VwLnZpZXcnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnXG5pbXBvcnQgdXNlck5vdGlmaWNhdGlvbnMgZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvdXNlci1ub3RpZmljYXRpb25zJ1xuXG50eXBlIFByb3BzID0gV2l0aEJhY2tib25lUHJvcHNcblxuY29uc3QgRW1wdHkgPSBzdHlsZWQuZGl2YFxuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLmNvcmVUcmFuc2l0aW9uVGltZX0gbGluZWFyO1xuICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIGZvbnQtc2l6ZTogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLmxhcmdlRm9udFNpemV9O1xuICBwYWRkaW5nOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWVkaXVtU3BhY2luZ307XG5gXG5jb25zdCBSb290ID0gc3R5bGVkLmRpdmBcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMTAwJTtcbiAgb3ZlcmZsb3c6IGF1dG87XG5gXG5jb25zdCBOb3RpZmljYXRpb25zID0gc3R5bGVkLmRpdmBcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMTAwJTtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHBhZGRpbmc6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5tZWRpdW1TcGFjaW5nfTtcbmBcblxuY29uc3QgaW5mb3JtYWxOYW1lID0gKGRheXNBZ286IGFueSkgPT4ge1xuICBzd2l0Y2ggKGRheXNBZ28pIHtcbiAgICBjYXNlIC0xOlxuICAgICAgcmV0dXJuICdGdXR1cmUnXG4gICAgICBicmVha1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiAnVG9kYXknXG4gICAgICBicmVha1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiAnWWVzdGVyZGF5J1xuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG1vbWVudCgpLnN1YnRyYWN0KGRheXNBZ28sICdkYXlzJykuZm9ybWF0KCdkZGRkJylcbiAgICAgIGJyZWFrXG4gIH1cbn1cblxuY29uc3QgZ2V0RmlsdGVyRm9yRGF5ID0gKG51bURheXM6IG51bWJlcikgPT4ge1xuICBpZiAobnVtRGF5cyA8IDApIHtcbiAgICByZXR1cm4gKG1vZGVsOiBhbnkpID0+IHtcbiAgICAgIHJldHVybiBtb21lbnQoKS5kaWZmKG1vZGVsLmdldCgnc2VudEF0JyksICdkYXlzJykgPCAwXG4gICAgfVxuICB9IGVsc2UgaWYgKG51bURheXMgPCA3KSB7XG4gICAgcmV0dXJuIChtb2RlbDogYW55KSA9PiB7XG4gICAgICByZXR1cm4gbW9tZW50KCkuZGlmZihtb2RlbC5nZXQoJ3NlbnRBdCcpLCAnZGF5cycpID09PSBudW1EYXlzXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiAobW9kZWw6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIG1vbWVudCgpLmRpZmYobW9kZWwuZ2V0KCdzZW50QXQnKSwgJ2RheXMnKSA+PSA3XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGRheVJhbmdlID0gWy0xLCAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XVxuXG5jbGFzcyBVc2VyTm90aWZpY2F0aW9ucyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcywge30+IHtcbiAgbm90aWZpY2F0aW9uR3JvdXBzOiBhbnlcbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5wcm9wcy5saXN0ZW5Ubyh1c2VyTm90aWZpY2F0aW9ucywgJ2FkZCByZW1vdmUgdXBkYXRlJywgKCkgPT5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe30pXG4gICAgKVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gdXNlck5vdGlmaWNhdGlvbnMuaXNFbXB0eSgpID8gKFxuICAgICAgPEVtcHR5PlxuICAgICAgICA8ZGl2Pk5vIE5vdGlmaWNhdGlvbnM8L2Rpdj5cbiAgICAgIDwvRW1wdHk+XG4gICAgKSA6IChcbiAgICAgIDxSb290PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxOb3RpZmljYXRpb25zPlxuICAgICAgICAgICAge2RheVJhbmdlLm1hcCgoZGF5KSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPE5vdGlmaWNhdGlvbkdyb3VwVmlld1JlYWN0XG4gICAgICAgICAgICAgICAgICBrZXk9e2RheX1cbiAgICAgICAgICAgICAgICAgIGZpbHRlcj17Z2V0RmlsdGVyRm9yRGF5KGRheSl9XG4gICAgICAgICAgICAgICAgICBkYXRlPXtkYXkgPT09IDggPyAnT2xkZXInIDogaW5mb3JtYWxOYW1lKGRheSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgPC9Ob3RpZmljYXRpb25zPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUm9vdD5cbiAgICApXG4gIH1cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdXNlck5vdGlmaWNhdGlvbnMuc2V0U2VlbigpXG4gICAgdXNlci5zYXZlUHJlZmVyZW5jZXMoKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHdpdGhMaXN0ZW5UbyhVc2VyTm90aWZpY2F0aW9ucylcbiJdfQ==