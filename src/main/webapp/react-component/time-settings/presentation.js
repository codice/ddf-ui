import { __assign, __extends, __makeTemplateObject } from "tslib";
//DELETE AFTER CATALOG-UI-SEARCH CUT
import * as React from 'react';
import { hot } from 'react-hot-loader';
import styled from 'styled-components';
import TimeZoneSelector from './time-zone-picker';
import TimeFormatSelector from './time-format-picker';
import TimePrecisionSelector from './time-precision-picker';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  overflow: auto;\n  padding: ", ";\n"], ["\n  overflow: auto;\n  padding: ", ";\n"])), function (props) { return props.theme.minimumSpacing; });
var Time = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  width: 100%;\n  font-weight: bolder;\n  padding-top: ", ";\n  padding-right: ", ";\n  padding-bottom: ", ";\n  padding-left: ", ";\n"], ["\n  width: 100%;\n  font-weight: bolder;\n  padding-top: ", ";\n  padding-right: ", ";\n  padding-bottom: ", ";\n  padding-left: ", ";\n"])), function (props) { return props.theme.minimumSpacing; }, function (props) { return props.theme.minimumSpacing; }, function (props) { return props.theme.minimumSpacing; }, function (props) { return props.theme.minimumSpacing; });
var TimeLabel = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  padding-top: ", ";\n  padding-bottom: ", ";\n"], ["\n  padding-top: ", ";\n  padding-bottom: ", ";\n"])), function (props) { return props.theme.minimumSpacing; }, function (props) { return props.theme.minimumSpacing; });
var TimeValue = styled.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  padding-top: ", ";\n  padding-left: ", ";\n"], ["\n  padding-top: ", ";\n  padding-left: ", ";\n"])), function (props) { return props.theme.minimumSpacing; }, function (props) { return props.theme.minimumSpacing; });
var TimeSettingsPresentation = /** @class */ (function (_super) {
    __extends(TimeSettingsPresentation, _super);
    function TimeSettingsPresentation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.render = function () {
            return (React.createElement(Root, __assign({}, _this.props),
                React.createElement(TimeZoneSelector, { timeZone: _this.props.timeZone, timeZones: _this.props.timeZones, handleTimeZoneUpdate: _this.props.handleTimeZoneUpdate }),
                React.createElement(TimeFormatSelector, { timeFormat: _this.props.timeFormat, handleTimeFormatUpdate: _this.props.handleTimeFormatUpdate }),
                React.createElement(TimePrecisionSelector, { timePrecision: _this.props.timePrecision, handleTimePrecisionUpdate: _this.props.handleTimePrecisionUpdate }),
                React.createElement(Time, null,
                    React.createElement(TimeLabel, null, "Current Time"),
                    React.createElement(TimeValue, null, _this.props.currentTime))));
        };
        return _this;
    }
    return TimeSettingsPresentation;
}(React.Component));
export default hot(module)(TimeSettingsPresentation);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=presentation.js.map