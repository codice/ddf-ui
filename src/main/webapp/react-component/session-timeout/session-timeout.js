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
//# sourceMappingURL=session-timeout.js.map