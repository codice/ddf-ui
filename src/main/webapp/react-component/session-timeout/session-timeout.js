import { __extends, __makeTemplateObject } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        return this.state.timeLeft < 0 ? (_jsx(SessionTimeoutRoot, { children: _jsx(Message, { children: "Session Expired. Please refresh the page to continue." }) })) : (_jsxs(SessionTimeoutRoot, { children: [_jsxs(Message, { children: ["You will be logged out automatically in", ' ', _jsx("label", { className: "timer", children: sessionTimeoutModel.getIdleSeconds() }), ' ', "seconds.", _jsx("div", { children: "Press \"Continue Working\" to remain logged in." })] }), _jsx(Button, { onClick: renewSession, variant: "contained", color: "primary", fullWidth: true, children: "Continue Working" })] }));
    };
    return SessionTimeout;
}(React.Component));
export default SessionTimeout;
var templateObject_1, templateObject_2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi10aW1lb3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9zZXNzaW9uLXRpbWVvdXQvc2Vzc2lvbi10aW1lb3V0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLG1CQUFtQixNQUFNLDRDQUE0QyxDQUFBO0FBRTVFLElBQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLEdBQUcsZ0pBQUEsNkVBS3BDLElBQUEsQ0FBQTtBQUNELElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLHNLQUFBLDRGQUliLEVBQW9DLEtBQ2hELEtBRFksVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBekIsQ0FBeUIsQ0FDaEQsQ0FBQTtBQU1ELElBQU0sWUFBWSxHQUFHO0lBQ25CLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFBO0FBQzdCLENBQUMsQ0FBQTtBQUVEO0lBQTZCLGtDQUEwQjtJQUVyRCx3QkFBWSxLQUFTO1FBQ25CLFlBQUEsTUFBSyxZQUFDLEtBQUssQ0FBQyxTQUFBO1FBQ1osS0FBSSxDQUFDLEtBQUssR0FBRztZQUNYLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxjQUFjLEVBQUU7U0FDL0MsQ0FBQTs7SUFDSCxDQUFDO0lBQ0QsMENBQWlCLEdBQWpCO1FBQUEsaUJBS0M7UUFKQyxJQUFJLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FDekIsY0FBTSxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxFQUFqRSxDQUFpRSxFQUN2RSxJQUFJLENBQ0wsQ0FBQTtJQUNILENBQUM7SUFDRCw2Q0FBb0IsR0FBcEI7UUFDRSxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzlCLENBQUM7SUFDRCwrQkFBTSxHQUFOO1FBQ0UsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQy9CLEtBQUMsa0JBQWtCLGNBQ2pCLEtBQUMsT0FBTyx3RUFBZ0UsR0FDckQsQ0FDdEIsQ0FBQyxDQUFDLENBQUMsQ0FDRixNQUFDLGtCQUFrQixlQUNqQixNQUFDLE9BQU8sMERBQ2tDLEdBQUcsRUFDM0MsZ0JBQU8sU0FBUyxFQUFDLE9BQU8sWUFDckIsbUJBQW1CLENBQUMsY0FBYyxFQUFFLEdBQy9CLEVBQUMsR0FBRyxjQUVaLDRFQUF3RCxJQUNoRCxFQUNWLEtBQUMsTUFBTSxJQUNMLE9BQU8sRUFBRSxZQUFZLEVBQ3JCLE9BQU8sRUFBQyxXQUFXLEVBQ25CLEtBQUssRUFBQyxTQUFTLEVBQ2YsU0FBUyx1Q0FHRixJQUNVLENBQ3RCLENBQUE7SUFDSCxDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBM0NELENBQTZCLEtBQUssQ0FBQyxTQUFTLEdBMkMzQztBQUVELGVBQWUsY0FBYyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5pbXBvcnQgc2Vzc2lvblRpbWVvdXRNb2RlbCBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy9zZXNzaW9uLXRpbWVvdXQnXG5cbmNvbnN0IFNlc3Npb25UaW1lb3V0Um9vdCA9IHN0eWxlZC5kaXZgXG4gIGhlaWdodDogMTAwJTtcbiAgd2lkdGg6IDEwMCU7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuYFxuY29uc3QgTWVzc2FnZSA9IHN0eWxlZC5kaXZgXG4gIG1heC1oZWlnaHQ6IGNhbGMoMTAwJSAtIDIuMjVyZW0pO1xuICBoZWlnaHQ6IGF1dG87XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgcGFkZGluZzogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1lZGl1bVNwYWNpbmd9O1xuYFxuXG50eXBlIFN0YXRlID0ge1xuICB0aW1lTGVmdDogbnVtYmVyXG59XG5cbmNvbnN0IHJlbmV3U2Vzc2lvbiA9ICgpID0+IHtcbiAgc2Vzc2lvblRpbWVvdXRNb2RlbC5yZW5ldygpXG59XG5cbmNsYXNzIFNlc3Npb25UaW1lb3V0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHt9LCBTdGF0ZT4ge1xuICBpbnRlcnZhbDogYW55XG4gIGNvbnN0cnVjdG9yKHByb3BzOiB7fSkge1xuICAgIHN1cGVyKHByb3BzKVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB0aW1lTGVmdDogc2Vzc2lvblRpbWVvdXRNb2RlbC5nZXRJZGxlU2Vjb25kcygpLFxuICAgIH1cbiAgfVxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoXG4gICAgICAoKSA9PiB0aGlzLnNldFN0YXRlKHsgdGltZUxlZnQ6IHNlc3Npb25UaW1lb3V0TW9kZWwuZ2V0SWRsZVNlY29uZHMoKSB9KSxcbiAgICAgIDEwMDBcbiAgICApXG4gIH1cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS50aW1lTGVmdCA8IDAgPyAoXG4gICAgICA8U2Vzc2lvblRpbWVvdXRSb290PlxuICAgICAgICA8TWVzc2FnZT5TZXNzaW9uIEV4cGlyZWQuIFBsZWFzZSByZWZyZXNoIHRoZSBwYWdlIHRvIGNvbnRpbnVlLjwvTWVzc2FnZT5cbiAgICAgIDwvU2Vzc2lvblRpbWVvdXRSb290PlxuICAgICkgOiAoXG4gICAgICA8U2Vzc2lvblRpbWVvdXRSb290PlxuICAgICAgICA8TWVzc2FnZT5cbiAgICAgICAgICBZb3Ugd2lsbCBiZSBsb2dnZWQgb3V0IGF1dG9tYXRpY2FsbHkgaW57JyAnfVxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0aW1lclwiPlxuICAgICAgICAgICAge3Nlc3Npb25UaW1lb3V0TW9kZWwuZ2V0SWRsZVNlY29uZHMoKX1cbiAgICAgICAgICA8L2xhYmVsPnsnICd9XG4gICAgICAgICAgc2Vjb25kcy5cbiAgICAgICAgICA8ZGl2PlByZXNzIFwiQ29udGludWUgV29ya2luZ1wiIHRvIHJlbWFpbiBsb2dnZWQgaW4uPC9kaXY+XG4gICAgICAgIDwvTWVzc2FnZT5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIG9uQ2xpY2s9e3JlbmV3U2Vzc2lvbn1cbiAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICA+XG4gICAgICAgICAgQ29udGludWUgV29ya2luZ1xuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvU2Vzc2lvblRpbWVvdXRSb290PlxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTZXNzaW9uVGltZW91dFxuIl19