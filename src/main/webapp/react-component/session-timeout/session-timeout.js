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
import { __extends, __makeTemplateObject } from "tslib";
import Button from '@mui/material/Button';
import * as React from 'react';
import styled from 'styled-components';
import sessionTimeoutModel from '../../component/singletons/session-timeout';
var SessionTimeoutRoot = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  height: 100%;\n  width: 100%;\n  display: block;\n  overflow: hidden;\n"], ["\n  height: 100%;\n  width: 100%;\n  display: block;\n  overflow: hidden;\n"])));
var Message = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  max-height: calc(100% - 2.25rem);\n  height: auto;\n  text-align: center;\n  padding: ", ";\n"], ["\n  max-height: calc(100% - 2.25rem);\n  height: auto;\n  text-align: center;\n  padding: ", ";\n"])), function (props) { return props.theme.mediumSpacing; });
var renewSession = function () {
    sessionTimeoutModel.renew();
};
var SessionTimeout = /** @class */ (function (_super) {
    __extends(SessionTimeout, _super);
    function SessionTimeout(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            timeLeft: sessionTimeoutModel.getIdleSeconds(),
        };
        return _this;
    }
    SessionTimeout.prototype.componentDidMount = function () {
        var _this = this;
        this.interval = setInterval(function () { return _this.setState({ timeLeft: sessionTimeoutModel.getIdleSeconds() }); }, 1000);
    };
    SessionTimeout.prototype.componentWillUnmount = function () {
        clearInterval(this.interval);
    };
    SessionTimeout.prototype.render = function () {
        return this.state.timeLeft < 0 ? (React.createElement(SessionTimeoutRoot, null,
            React.createElement(Message, null, "Session Expired. Please refresh the page to continue."))) : (React.createElement(SessionTimeoutRoot, null,
            React.createElement(Message, null,
                "You will be logged out automatically in",
                ' ',
                React.createElement("label", { className: "timer" }, sessionTimeoutModel.getIdleSeconds()),
                ' ',
                "seconds.",
                React.createElement("div", null, "Press \"Continue Working\" to remain logged in.")),
            React.createElement(Button, { onClick: renewSession, variant: "contained", color: "primary", fullWidth: true }, "Continue Working")));
    };
    return SessionTimeout;
}(React.Component));
export default SessionTimeout;
var templateObject_1, templateObject_2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi10aW1lb3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9zZXNzaW9uLXRpbWVvdXQvc2Vzc2lvbi10aW1lb3V0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJOztBQUVKLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sbUJBQW1CLE1BQU0sNENBQTRDLENBQUE7QUFFNUUsSUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsR0FBRyxnSkFBQSw2RUFLcEMsSUFBQSxDQUFBO0FBQ0QsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsc0tBQUEsNEZBSWIsRUFBb0MsS0FDaEQsS0FEWSxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUF6QixDQUF5QixDQUNoRCxDQUFBO0FBTUQsSUFBTSxZQUFZLEdBQUc7SUFDbkIsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDN0IsQ0FBQyxDQUFBO0FBRUQ7SUFBNkIsa0NBQTBCO0lBRXJELHdCQUFZLEtBQVM7UUFBckIsWUFDRSxrQkFBTSxLQUFLLENBQUMsU0FJYjtRQUhDLEtBQUksQ0FBQyxLQUFLLEdBQUc7WUFDWCxRQUFRLEVBQUUsbUJBQW1CLENBQUMsY0FBYyxFQUFFO1NBQy9DLENBQUE7O0lBQ0gsQ0FBQztJQUNELDBDQUFpQixHQUFqQjtRQUFBLGlCQUtDO1FBSkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQ3pCLGNBQU0sT0FBQSxLQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsRUFBakUsQ0FBaUUsRUFDdkUsSUFBSSxDQUNMLENBQUE7SUFDSCxDQUFDO0lBQ0QsNkNBQW9CLEdBQXBCO1FBQ0UsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUM5QixDQUFDO0lBQ0QsK0JBQU0sR0FBTjtRQUNFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUMvQixvQkFBQyxrQkFBa0I7WUFDakIsb0JBQUMsT0FBTyxnRUFBZ0UsQ0FDckQsQ0FDdEIsQ0FBQyxDQUFDLENBQUMsQ0FDRixvQkFBQyxrQkFBa0I7WUFDakIsb0JBQUMsT0FBTzs7Z0JBQ2tDLEdBQUc7Z0JBQzNDLCtCQUFPLFNBQVMsRUFBQyxPQUFPLElBQ3JCLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxDQUMvQjtnQkFBQyxHQUFHOztnQkFFWixtRkFBd0QsQ0FDaEQ7WUFDVixvQkFBQyxNQUFNLElBQ0wsT0FBTyxFQUFFLFlBQVksRUFDckIsT0FBTyxFQUFDLFdBQVcsRUFDbkIsS0FBSyxFQUFDLFNBQVMsRUFDZixTQUFTLDZCQUdGLENBQ1UsQ0FDdEIsQ0FBQTtJQUNILENBQUM7SUFDSCxxQkFBQztBQUFELENBQUMsQUEzQ0QsQ0FBNkIsS0FBSyxDQUFDLFNBQVMsR0EyQzNDO0FBRUQsZUFBZSxjQUFjLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCBzZXNzaW9uVGltZW91dE1vZGVsIGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL3Nlc3Npb24tdGltZW91dCdcblxuY29uc3QgU2Vzc2lvblRpbWVvdXRSb290ID0gc3R5bGVkLmRpdmBcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMTAwJTtcbiAgZGlzcGxheTogYmxvY2s7XG4gIG92ZXJmbG93OiBoaWRkZW47XG5gXG5jb25zdCBNZXNzYWdlID0gc3R5bGVkLmRpdmBcbiAgbWF4LWhlaWdodDogY2FsYygxMDAlIC0gMi4yNXJlbSk7XG4gIGhlaWdodDogYXV0bztcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBwYWRkaW5nOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWVkaXVtU3BhY2luZ307XG5gXG5cbnR5cGUgU3RhdGUgPSB7XG4gIHRpbWVMZWZ0OiBudW1iZXJcbn1cblxuY29uc3QgcmVuZXdTZXNzaW9uID0gKCkgPT4ge1xuICBzZXNzaW9uVGltZW91dE1vZGVsLnJlbmV3KClcbn1cblxuY2xhc3MgU2Vzc2lvblRpbWVvdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8e30sIFN0YXRlPiB7XG4gIGludGVydmFsOiBhbnlcbiAgY29uc3RydWN0b3IocHJvcHM6IHt9KSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHRpbWVMZWZ0OiBzZXNzaW9uVGltZW91dE1vZGVsLmdldElkbGVTZWNvbmRzKCksXG4gICAgfVxuICB9XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChcbiAgICAgICgpID0+IHRoaXMuc2V0U3RhdGUoeyB0aW1lTGVmdDogc2Vzc2lvblRpbWVvdXRNb2RlbC5nZXRJZGxlU2Vjb25kcygpIH0pLFxuICAgICAgMTAwMFxuICAgIClcbiAgfVxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnRpbWVMZWZ0IDwgMCA/IChcbiAgICAgIDxTZXNzaW9uVGltZW91dFJvb3Q+XG4gICAgICAgIDxNZXNzYWdlPlNlc3Npb24gRXhwaXJlZC4gUGxlYXNlIHJlZnJlc2ggdGhlIHBhZ2UgdG8gY29udGludWUuPC9NZXNzYWdlPlxuICAgICAgPC9TZXNzaW9uVGltZW91dFJvb3Q+XG4gICAgKSA6IChcbiAgICAgIDxTZXNzaW9uVGltZW91dFJvb3Q+XG4gICAgICAgIDxNZXNzYWdlPlxuICAgICAgICAgIFlvdSB3aWxsIGJlIGxvZ2dlZCBvdXQgYXV0b21hdGljYWxseSBpbnsnICd9XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRpbWVyXCI+XG4gICAgICAgICAgICB7c2Vzc2lvblRpbWVvdXRNb2RlbC5nZXRJZGxlU2Vjb25kcygpfVxuICAgICAgICAgIDwvbGFiZWw+eycgJ31cbiAgICAgICAgICBzZWNvbmRzLlxuICAgICAgICAgIDxkaXY+UHJlc3MgXCJDb250aW51ZSBXb3JraW5nXCIgdG8gcmVtYWluIGxvZ2dlZCBpbi48L2Rpdj5cbiAgICAgICAgPC9NZXNzYWdlPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgb25DbGljaz17cmVuZXdTZXNzaW9ufVxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgID5cbiAgICAgICAgICBDb250aW51ZSBXb3JraW5nXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9TZXNzaW9uVGltZW91dFJvb3Q+XG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlc3Npb25UaW1lb3V0XG4iXX0=