import { __assign, __extends } from "tslib";
//DELETE AFTER CATALOG-UI-SEARCH CUT
import * as React from 'react';
import { hot } from 'react-hot-loader';
import moment from 'moment';
import withListenTo from '../backbone-container';
import TimeSettingsPresentation from './presentation';
import momentTimezone from 'moment-timezone';
import user from '../../component/singletons/user-instance';
import Common from '../../js/Common';
import { DateHelpers } from '../../component/fields/date-helpers';
var getUserPreferences = function () {
    return user.get('user').get('preferences');
};
var savePreferences = function (model) {
    var nullOrUndefinedValues = !Object.values(model).every(function (value) { return !!value; });
    if (nullOrUndefinedValues)
        return;
    var preferences = getUserPreferences();
    preferences.set(model);
    preferences.savePreferences();
};
var getCurrentDateTimeFormat = function () {
    return getUserPreferences().get('dateTimeFormat').datetimefmt;
};
var getCurrentTimePrecision = DateHelpers.General.getTimePrecision;
var getCurrentTimeZone = function () { return getUserPreferences().get('timeZone'); };
var getCurrentTime = function (format, timeZone) {
    if (format === void 0) { format = getCurrentDateTimeFormat(); }
    if (timeZone === void 0) { timeZone = getCurrentTimeZone(); }
    return momentTimezone.tz(moment(), timeZone).format(format);
};
var generateZoneObjects = function () {
    var zoneNames = momentTimezone.tz.names();
    var zones = zoneNames.map(function (zoneName) {
        var date = new Date();
        var timestamp = date.getTime();
        var zone = momentTimezone.tz.zone(zoneName);
        var zonedDate = momentTimezone.tz(timestamp, zoneName);
        var offsetAsString = zonedDate.format('Z');
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        var abbr = zone.abbr(timestamp);
        return {
            timestamp: timestamp,
            zone: zone,
            zonedDate: zonedDate,
            offsetAsString: offsetAsString,
            abbr: abbr,
            zoneName: zoneName,
        };
    });
    return zones;
};
var TimeSettingsContainer = /** @class */ (function (_super) {
    __extends(TimeSettingsContainer, _super);
    function TimeSettingsContainer(props) {
        var _this = _super.call(this, props) || this;
        _this.componentDidMount = function () {
            var updateCurrentTimeClock = function () {
                _this.setState({ currentTime: getCurrentTime() });
            };
            _this.timer = setInterval(updateCurrentTimeClock, 50);
        };
        _this.componentWillUnmount = function () {
            clearInterval(_this.timer);
        };
        _this.render = function () { return (React.createElement(TimeSettingsPresentation, __assign({}, _this.props, { currentTime: _this.state.currentTime, timeZone: _this.state.timeZone, timeZones: _this.state.timeZones, handleTimeZoneUpdate: function (timeZone) {
                savePreferences({ timeZone: timeZone.zoneName });
            }, handleTimeFormatUpdate: function (timeFormat) {
                _this.setState({ timeFormat: timeFormat.value });
                var dateTimeFormat = Common.getDateTimeFormats()[timeFormat.value][_this.state.timePrecision];
                savePreferences({ dateTimeFormat: dateTimeFormat });
            }, timeFormat: _this.state.timeFormat, handleTimePrecisionUpdate: function (timePrecision) {
                _this.setState({ timePrecision: timePrecision });
                var dateTimeFormat = Common.getDateTimeFormats()[_this.state.timeFormat][timePrecision];
                savePreferences({ dateTimeFormat: dateTimeFormat });
            }, timePrecision: _this.state.timePrecision }))); };
        _this.state = {
            currentTime: getCurrentTime(),
            timeZones: generateZoneObjects(),
            timeZone: getCurrentTimeZone(),
            timeFormat: Common.getDateTimeFormatsReverseMap()[getCurrentDateTimeFormat()]
                .format,
            timePrecision: getCurrentTimePrecision(),
        };
        return _this;
    }
    return TimeSettingsContainer;
}(React.Component));
export default hot(module)(withListenTo(TimeSettingsContainer));
//# sourceMappingURL=container.js.map