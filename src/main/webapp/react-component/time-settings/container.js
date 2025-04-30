import { __assign, __extends } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
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
    return momentTimezone.tz(momentTimezone(), timeZone).format(format);
};
var generateZoneObjects = function () {
    var zoneNames = momentTimezone.tz.names();
    var zones = zoneNames.map(function (zoneName) {
        var date = new Date();
        var timestamp = date.getTime();
        var zone = momentTimezone.tz.zone(zoneName);
        var zonedDate = momentTimezone.tz(timestamp, zoneName);
        var offsetAsString = zonedDate.format('Z');
        var abbr = (zone === null || zone === void 0 ? void 0 : zone.abbr(timestamp)) || '';
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
        _this.render = function () { return (_jsx(TimeSettingsPresentation, __assign({}, _this.props, { currentTime: _this.state.currentTime, timeZone: _this.state.timeZone, timeZones: _this.state.timeZones, handleTimeZoneUpdate: function (timeZone) {
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
export default withListenTo(TimeSettingsContainer);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC90aW1lLXNldHRpbmdzL2NvbnRhaW5lci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUU5QixPQUFPLFlBQW1DLE1BQU0sdUJBQXVCLENBQUE7QUFFdkUsT0FBTyx3QkFBd0IsTUFBTSxnQkFBZ0IsQ0FBQTtBQUlyRCxPQUFPLGNBQWMsTUFBTSxpQkFBaUIsQ0FBQTtBQUM1QyxPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUNwQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFnQmpFLElBQU0sa0JBQWtCLEdBQUc7SUFDekIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUM1QyxDQUFDLENBQUE7QUFFRCxJQUFNLGVBQWUsR0FBRyxVQUFDLEtBQVM7SUFDaEMsSUFBTSxxQkFBcUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEtBQUssRUFBUCxDQUFPLENBQUMsQ0FBQTtJQUM3RSxJQUFJLHFCQUFxQjtRQUFFLE9BQU07SUFFakMsSUFBTSxXQUFXLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQTtJQUN4QyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3RCLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUMvQixDQUFDLENBQUE7QUFFRCxJQUFNLHdCQUF3QixHQUFHO0lBQy9CLE9BQUEsa0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUMsZ0JB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ZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IHdpdGhMaXN0ZW5UbywgeyBXaXRoQmFja2JvbmVQcm9wcyB9IGZyb20gJy4uL2JhY2tib25lLWNvbnRhaW5lcidcblxuaW1wb3J0IFRpbWVTZXR0aW5nc1ByZXNlbnRhdGlvbiBmcm9tICcuL3ByZXNlbnRhdGlvbidcbmltcG9ydCB7IFRpbWVab25lLCBUaW1lRm9ybWF0IH0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IFRpbWVQcmVjaXNpb24gfSBmcm9tICdAYmx1ZXByaW50anMvZGF0ZXRpbWUnXG5cbmltcG9ydCBtb21lbnRUaW1lem9uZSBmcm9tICdtb21lbnQtdGltZXpvbmUnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi8uLi9qcy9Db21tb24nXG5pbXBvcnQgeyBEYXRlSGVscGVycyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9maWVsZHMvZGF0ZS1oZWxwZXJzJ1xuXG50eXBlIFVzZXJQcmVmZXJlbmNlcyA9IHtcbiAgZ2V0OiAoa2V5OiBzdHJpbmcpID0+IGFueVxuICBzZXQ6ICh7fSkgPT4gdm9pZFxuICBzYXZlUHJlZmVyZW5jZXM6ICgpID0+IHZvaWRcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgY3VycmVudFRpbWU6IHN0cmluZ1xuICB0aW1lWm9uZXM6IFRpbWVab25lW11cbiAgdGltZVpvbmU6IHN0cmluZ1xuICB0aW1lRm9ybWF0OiBzdHJpbmdcbiAgdGltZVByZWNpc2lvbjogVGltZVByZWNpc2lvblxufVxuXG5jb25zdCBnZXRVc2VyUHJlZmVyZW5jZXMgPSAoKTogVXNlclByZWZlcmVuY2VzID0+IHtcbiAgcmV0dXJuIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpXG59XG5cbmNvbnN0IHNhdmVQcmVmZXJlbmNlcyA9IChtb2RlbDoge30pID0+IHtcbiAgY29uc3QgbnVsbE9yVW5kZWZpbmVkVmFsdWVzID0gIU9iamVjdC52YWx1ZXMobW9kZWwpLmV2ZXJ5KCh2YWx1ZSkgPT4gISF2YWx1ZSlcbiAgaWYgKG51bGxPclVuZGVmaW5lZFZhbHVlcykgcmV0dXJuXG5cbiAgY29uc3QgcHJlZmVyZW5jZXMgPSBnZXRVc2VyUHJlZmVyZW5jZXMoKVxuICBwcmVmZXJlbmNlcy5zZXQobW9kZWwpXG4gIHByZWZlcmVuY2VzLnNhdmVQcmVmZXJlbmNlcygpXG59XG5cbmNvbnN0IGdldEN1cnJlbnREYXRlVGltZUZvcm1hdCA9ICgpID0+XG4gIGdldFVzZXJQcmVmZXJlbmNlcygpLmdldCgnZGF0ZVRpbWVGb3JtYXQnKS5kYXRldGltZWZtdFxuXG5jb25zdCBnZXRDdXJyZW50VGltZVByZWNpc2lvbiA9IERhdGVIZWxwZXJzLkdlbmVyYWwuZ2V0VGltZVByZWNpc2lvblxuXG5jb25zdCBnZXRDdXJyZW50VGltZVpvbmUgPSAoKSA9PiBnZXRVc2VyUHJlZmVyZW5jZXMoKS5nZXQoJ3RpbWVab25lJylcblxuY29uc3QgZ2V0Q3VycmVudFRpbWUgPSAoXG4gIGZvcm1hdDogc3RyaW5nID0gZ2V0Q3VycmVudERhdGVUaW1lRm9ybWF0KCksXG4gIHRpbWVab25lOiBzdHJpbmcgPSBnZXRDdXJyZW50VGltZVpvbmUoKVxuKSA9PiBtb21lbnRUaW1lem9uZS50eihtb21lbnRUaW1lem9uZSgpLCB0aW1lWm9uZSkuZm9ybWF0KGZvcm1hdClcblxuY29uc3QgZ2VuZXJhdGVab25lT2JqZWN0cyA9ICgpOiBUaW1lWm9uZVtdID0+IHtcbiAgY29uc3Qgem9uZU5hbWVzID0gbW9tZW50VGltZXpvbmUudHoubmFtZXMoKVxuICBjb25zdCB6b25lcyA9IHpvbmVOYW1lcy5tYXAoKHpvbmVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKVxuXG4gICAgY29uc3QgdGltZXN0YW1wID0gZGF0ZS5nZXRUaW1lKClcbiAgICBjb25zdCB6b25lID0gbW9tZW50VGltZXpvbmUudHouem9uZSh6b25lTmFtZSlcbiAgICBjb25zdCB6b25lZERhdGUgPSBtb21lbnRUaW1lem9uZS50eih0aW1lc3RhbXAsIHpvbmVOYW1lKVxuICAgIGNvbnN0IG9mZnNldEFzU3RyaW5nID0gem9uZWREYXRlLmZvcm1hdCgnWicpXG4gICAgY29uc3QgYWJiciA9IHpvbmU/LmFiYnIodGltZXN0YW1wKSB8fCAnJ1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLFxuICAgICAgem9uZTogem9uZSxcbiAgICAgIHpvbmVkRGF0ZTogem9uZWREYXRlLFxuICAgICAgb2Zmc2V0QXNTdHJpbmc6IG9mZnNldEFzU3RyaW5nLFxuICAgICAgYWJicjogYWJicixcbiAgICAgIHpvbmVOYW1lOiB6b25lTmFtZSxcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHpvbmVzXG59XG5cbmNsYXNzIFRpbWVTZXR0aW5nc0NvbnRhaW5lciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxXaXRoQmFja2JvbmVQcm9wcywgU3RhdGU+IHtcbiAgdGltZXI6IGFueVxuICBjb25zdHJ1Y3Rvcihwcm9wczogV2l0aEJhY2tib25lUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjdXJyZW50VGltZTogZ2V0Q3VycmVudFRpbWUoKSxcbiAgICAgIHRpbWVab25lczogZ2VuZXJhdGVab25lT2JqZWN0cygpLFxuICAgICAgdGltZVpvbmU6IGdldEN1cnJlbnRUaW1lWm9uZSgpLFxuICAgICAgdGltZUZvcm1hdDpcbiAgICAgICAgQ29tbW9uLmdldERhdGVUaW1lRm9ybWF0c1JldmVyc2VNYXAoKVtnZXRDdXJyZW50RGF0ZVRpbWVGb3JtYXQoKV1cbiAgICAgICAgICAuZm9ybWF0LFxuICAgICAgdGltZVByZWNpc2lvbjogZ2V0Q3VycmVudFRpbWVQcmVjaXNpb24oKSxcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCA9ICgpID0+IHtcbiAgICBjb25zdCB1cGRhdGVDdXJyZW50VGltZUNsb2NrID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1cnJlbnRUaW1lOiBnZXRDdXJyZW50VGltZSgpIH0pXG4gICAgfVxuXG4gICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKHVwZGF0ZUN1cnJlbnRUaW1lQ2xvY2ssIDUwKVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQgPSAoKSA9PiB7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKVxuICB9XG5cbiAgcmVuZGVyID0gKCkgPT4gKFxuICAgIDxUaW1lU2V0dGluZ3NQcmVzZW50YXRpb25cbiAgICAgIHsuLi50aGlzLnByb3BzfVxuICAgICAgY3VycmVudFRpbWU9e3RoaXMuc3RhdGUuY3VycmVudFRpbWV9XG4gICAgICB0aW1lWm9uZT17dGhpcy5zdGF0ZS50aW1lWm9uZX1cbiAgICAgIHRpbWVab25lcz17dGhpcy5zdGF0ZS50aW1lWm9uZXN9XG4gICAgICBoYW5kbGVUaW1lWm9uZVVwZGF0ZT17KHRpbWVab25lOiBUaW1lWm9uZSkgPT4ge1xuICAgICAgICBzYXZlUHJlZmVyZW5jZXMoeyB0aW1lWm9uZTogdGltZVpvbmUuem9uZU5hbWUgfSlcbiAgICAgIH19XG4gICAgICBoYW5kbGVUaW1lRm9ybWF0VXBkYXRlPXsodGltZUZvcm1hdDogVGltZUZvcm1hdCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGltZUZvcm1hdDogdGltZUZvcm1hdC52YWx1ZSB9KVxuICAgICAgICBjb25zdCBkYXRlVGltZUZvcm1hdCA9XG4gICAgICAgICAgQ29tbW9uLmdldERhdGVUaW1lRm9ybWF0cygpW3RpbWVGb3JtYXQudmFsdWVdW1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS50aW1lUHJlY2lzaW9uXG4gICAgICAgICAgXVxuICAgICAgICBzYXZlUHJlZmVyZW5jZXMoeyBkYXRlVGltZUZvcm1hdCB9KVxuICAgICAgfX1cbiAgICAgIHRpbWVGb3JtYXQ9e3RoaXMuc3RhdGUudGltZUZvcm1hdH1cbiAgICAgIGhhbmRsZVRpbWVQcmVjaXNpb25VcGRhdGU9eyh0aW1lUHJlY2lzaW9uOiBUaW1lUHJlY2lzaW9uKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0aW1lUHJlY2lzaW9uIH0pXG4gICAgICAgIGNvbnN0IGRhdGVUaW1lRm9ybWF0ID1cbiAgICAgICAgICBDb21tb24uZ2V0RGF0ZVRpbWVGb3JtYXRzKClbdGhpcy5zdGF0ZS50aW1lRm9ybWF0XVt0aW1lUHJlY2lzaW9uXVxuICAgICAgICBzYXZlUHJlZmVyZW5jZXMoeyBkYXRlVGltZUZvcm1hdCB9KVxuICAgICAgfX1cbiAgICAgIHRpbWVQcmVjaXNpb249e3RoaXMuc3RhdGUudGltZVByZWNpc2lvbn1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IHdpdGhMaXN0ZW5UbyhUaW1lU2V0dGluZ3NDb250YWluZXIpXG4iXX0=