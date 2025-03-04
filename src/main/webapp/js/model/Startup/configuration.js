import { __extends } from "tslib";
import { Subscribable } from '../Base/base-classes';
import _ from 'underscore';
function match(regexList, attribute) {
    return (_.chain(regexList)
        .map(function (str) { return new RegExp(str); })
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(regex: RegExp) => RegExpExecArr... Remove this comment to see the full error message
        .find(function (regex) { return regex.exec(attribute); })
        .value() !== undefined);
}
var Configuration = /** @class */ (function (_super) {
    __extends(Configuration, _super);
    function Configuration(startupData) {
        var _this = _super.call(this) || this;
        _this.getExportLimit = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.exportResultLimit) || 1000;
        };
        _this.getResultCount = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.resultCount) || 250;
        };
        _this.getProjection = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.projection) || 'EPSG:4326';
        };
        _this.getI18n = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.i18n) || {};
        };
        _this.getAttributeAliases = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.attributeAliases) || {};
        };
        _this.isReadOnly = function (attribute) {
            return match(_this.getReadOnly(), attribute);
        };
        _this.getReadOnly = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.readOnly) || [];
        };
        _this.getSummaryShow = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.summaryShow) || [];
        };
        _this.getRequiredExportAttributes = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.requiredExportAttributes) || [];
        };
        _this.getExportMetacardFormatOptions = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.exportMetacardFormatOptions) || [];
        };
        _this.getExportMetacardsFormatOptions = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.exportMetacardsFormatOptions) || [];
        };
        _this.getCommonAttributes = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.commonAttributes) || [];
        };
        _this.getImageryProviders = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.imageryProviders) || [];
        };
        _this.getTerrainProvider = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.terrainProvider) || {};
        };
        _this.getBingKey = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.bingKey) || '';
        };
        _this.getSystemUsageMessage = function () {
            var _a;
            return ((_a = _this.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.systemUsageMessage) || '';
        };
        // in minutes
        _this.getPlatformUITimeout = function () {
            var _a;
            return ((_a = _this.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.timeout) || 15;
        };
        _this.getBasicSearchTemporalSelectionDefault = function () {
            var _a;
            return (((_a = _this.config) === null || _a === void 0 ? void 0 : _a.basicSearchTemporalSelectionDefault) || [
                'created',
                'effective',
                'modified',
                'metacard.created',
                'metacard.modified',
            ]);
        };
        _this.getEnums = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.enums) || {};
        };
        _this.getOnlineGazetteer = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.onlineGazetteer) || false;
        };
        _this.getResultShow = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.resultShow) || [];
        };
        _this.getIconConfig = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.iconConfig) || {};
        };
        _this.getShowRelevanceScores = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.showRelevanceScores) || false;
        };
        _this.getRelevancePrecision = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.relevancePrecision) || 2;
        };
        _this.getMapHome = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.mapHome) || '';
        };
        _this.getHelpUrl = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.helpUrl) || '';
        };
        _this.getCustomBranding = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.customBranding) || '';
        };
        _this.getTopLeftLogoSrc = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.topLeftLogoSrc) || '';
        };
        _this.getProduct = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.product) || '';
        };
        _this.getMenuIconSrc = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.menuIconSrc) || '';
        };
        _this.getBottomLeftBackgroundSrc = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.bottomLeftBackgroundSrc) || '';
        };
        _this.getPlatformHeader = function () {
            var _a;
            return (_a = _this.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.header;
        };
        _this.getPlatformFooter = function () {
            var _a;
            return (_a = _this.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.footer;
        };
        _this.getPlatformBackground = function () {
            var _a;
            return (_a = _this.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.background;
        };
        _this.getPlatformColor = function () {
            var _a;
            return (_a = _this.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.color;
        };
        _this.getWebSocketsEnabled = function () {
            var _a;
            return (_a = _this.config) === null || _a === void 0 ? void 0 : _a.webSocketsEnabled;
        };
        _this.getBasicSearchMatchType = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.basicSearchMatchType) || 'datatype';
        };
        _this.getDefaultLayout = function () {
            var _a;
            return (_a = _this.config) === null || _a === void 0 ? void 0 : _a.defaultLayout;
        };
        // in milliseconds
        _this.getSearchTimeout = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.timeout) || 300000;
        };
        _this.getDefaultSources = function () {
            var _a, _b;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.defaultSources) && ((_b = _this.config) === null || _b === void 0 ? void 0 : _b.defaultSources.length) > 0
                ? _this.config.defaultSources
                : ['all'];
        };
        _this.getDefaultTableColumns = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.defaultTableColumns) || [];
        };
        _this.getIsFuzzyResultsEnabled = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.isFuzzyResultsEnabled) || false;
        };
        _this.getDisableUnknownErrorBox = function () {
            var _a;
            return ((_a = _this.config) === null || _a === void 0 ? void 0 : _a.disableUnknownErrorBox) || false;
        };
        _this.getExtra = function () {
            var _a;
            return (_a = _this.config) === null || _a === void 0 ? void 0 : _a.extra;
        };
        _this.getDataTypes = function () {
            var _a, _b;
            return {
                groups: ((_b = (_a = _this.getExtra()) === null || _a === void 0 ? void 0 : _a.datatypes) === null || _b === void 0 ? void 0 : _b.groups) || {},
            };
        };
        _this.getResourceSizeIdentifiers = function () {
            var _a;
            return ((_a = _this.getExtra()) === null || _a === void 0 ? void 0 : _a.resourceSizeIdentifiers) || [];
        };
        startupData === null || startupData === void 0 ? void 0 : startupData.subscribeTo({
            subscribableThing: 'fetched',
            callback: function (startupPayload) {
                _this.config = startupPayload.config;
                _this.platformUiConfiguration = startupPayload.platformUiConfiguration;
                _this._notifySubscribers({ thing: 'configuration-update' });
            },
        });
        return _this;
    }
    return Configuration;
}(Subscribable));
export { Configuration };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9TdGFydHVwL2NvbmZpZ3VyYXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFHbkQsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBRzFCLFNBQVMsS0FBSyxDQUFDLFNBQWMsRUFBRSxTQUFjO0lBQzNDLE9BQU8sQ0FDTCxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztTQUNmLEdBQUcsQ0FBQyxVQUFDLEdBQUcsSUFBSyxPQUFBLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFmLENBQWUsQ0FBQztRQUM5QixtSkFBbUo7U0FDbEosSUFBSSxDQUFDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBckIsQ0FBcUIsQ0FBQztTQUN0QyxLQUFLLEVBQUUsS0FBSyxTQUFTLENBQ3pCLENBQUE7QUFDSCxDQUFDO0FBRUQ7SUFBNEIsaUNBQStDO0lBR3pFLHVCQUFZLFdBQXlCO1FBQ25DLFlBQUEsTUFBSyxXQUFFLFNBQUE7UUFVVCxvQkFBYyxHQUFHOztZQUNmLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLGlCQUFpQixLQUFJLElBQUksQ0FBQTtRQUMvQyxDQUFDLENBQUE7UUFDRCxvQkFBYyxHQUFHOztZQUNmLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLFdBQVcsS0FBSSxHQUFHLENBQUE7UUFDeEMsQ0FBQyxDQUFBO1FBQ0QsbUJBQWEsR0FBRzs7WUFDZCxPQUFPLENBQUEsTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSxVQUFVLEtBQUksV0FBVyxDQUFBO1FBQy9DLENBQUMsQ0FBQTtRQUNELGFBQU8sR0FBRzs7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QUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxDQUFDLENBQUE7WUFDNUQsQ0FBQztTQUNGLENBQUMsQ0FBQTs7SUFDSixDQUFDO0lBeUpILG9CQUFDO0FBQUQsQ0FBQyxBQXRLRCxDQUE0QixZQUFZLEdBc0t2QztBQUVELE9BQU8sRUFBRSxhQUFhLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YnNjcmliYWJsZSB9IGZyb20gJy4uL0Jhc2UvYmFzZS1jbGFzc2VzJ1xuaW1wb3J0IHsgU3RhcnR1cFBheWxvYWRUeXBlIH0gZnJvbSAnLi9zdGFydHVwLnR5cGVzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGEgfSBmcm9tICcuL3N0YXJ0dXAnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHsgRGF0YVR5cGVzQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uLy4uL2NvbXBvbmVudC9kYXRhdHlwZXMvZGF0YXR5cGVzJ1xuXG5mdW5jdGlvbiBtYXRjaChyZWdleExpc3Q6IGFueSwgYXR0cmlidXRlOiBhbnkpIHtcbiAgcmV0dXJuIChcbiAgICBfLmNoYWluKHJlZ2V4TGlzdClcbiAgICAgIC5tYXAoKHN0cikgPT4gbmV3IFJlZ0V4cChzdHIpKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICcocmVnZXg6IFJlZ0V4cCkgPT4gUmVnRXhwRXhlY0Fyci4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAuZmluZCgocmVnZXgpID0+IHJlZ2V4LmV4ZWMoYXR0cmlidXRlKSlcbiAgICAgIC52YWx1ZSgpICE9PSB1bmRlZmluZWRcbiAgKVxufVxuXG5jbGFzcyBDb25maWd1cmF0aW9uIGV4dGVuZHMgU3Vic2NyaWJhYmxlPHsgdGhpbmc6ICdjb25maWd1cmF0aW9uLXVwZGF0ZScgfT4ge1xuICBjb25maWc/OiBTdGFydHVwUGF5bG9hZFR5cGVbJ2NvbmZpZyddXG4gIHBsYXRmb3JtVWlDb25maWd1cmF0aW9uPzogU3RhcnR1cFBheWxvYWRUeXBlWydwbGF0Zm9ybVVpQ29uZmlndXJhdGlvbiddXG4gIGNvbnN0cnVjdG9yKHN0YXJ0dXBEYXRhPzogU3RhcnR1cERhdGEpIHtcbiAgICBzdXBlcigpXG4gICAgc3RhcnR1cERhdGE/LnN1YnNjcmliZVRvKHtcbiAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnZmV0Y2hlZCcsXG4gICAgICBjYWxsYmFjazogKHN0YXJ0dXBQYXlsb2FkKSA9PiB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gc3RhcnR1cFBheWxvYWQuY29uZmlnXG4gICAgICAgIHRoaXMucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24gPSBzdGFydHVwUGF5bG9hZC5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvblxuICAgICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAnY29uZmlndXJhdGlvbi11cGRhdGUnIH0pXG4gICAgICB9LFxuICAgIH0pXG4gIH1cbiAgZ2V0RXhwb3J0TGltaXQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5leHBvcnRSZXN1bHRMaW1pdCB8fCAxMDAwXG4gIH1cbiAgZ2V0UmVzdWx0Q291bnQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5yZXN1bHRDb3VudCB8fCAyNTBcbiAgfVxuICBnZXRQcm9qZWN0aW9uID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ucHJvamVjdGlvbiB8fCAnRVBTRzo0MzI2J1xuICB9XG4gIGdldEkxOG4gPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5pMThuIHx8IHt9XG4gIH1cbiAgZ2V0QXR0cmlidXRlQWxpYXNlcyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmF0dHJpYnV0ZUFsaWFzZXMgfHwge31cbiAgfVxuICBpc1JlYWRPbmx5ID0gKGF0dHJpYnV0ZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIG1hdGNoKHRoaXMuZ2V0UmVhZE9ubHkoKSwgYXR0cmlidXRlKVxuICB9XG4gIGdldFJlYWRPbmx5ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ucmVhZE9ubHkgfHwgW11cbiAgfVxuICBnZXRTdW1tYXJ5U2hvdyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnN1bW1hcnlTaG93IHx8IFtdXG4gIH1cbiAgZ2V0UmVxdWlyZWRFeHBvcnRBdHRyaWJ1dGVzID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ucmVxdWlyZWRFeHBvcnRBdHRyaWJ1dGVzIHx8IFtdXG4gIH1cbiAgZ2V0RXhwb3J0TWV0YWNhcmRGb3JtYXRPcHRpb25zID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uZXhwb3J0TWV0YWNhcmRGb3JtYXRPcHRpb25zIHx8IFtdXG4gIH1cbiAgZ2V0RXhwb3J0TWV0YWNhcmRzRm9ybWF0T3B0aW9ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmV4cG9ydE1ldGFjYXJkc0Zvcm1hdE9wdGlvbnMgfHwgW11cbiAgfVxuICBnZXRDb21tb25BdHRyaWJ1dGVzID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uY29tbW9uQXR0cmlidXRlcyB8fCBbXVxuICB9XG4gIGdldEltYWdlcnlQcm92aWRlcnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5pbWFnZXJ5UHJvdmlkZXJzIHx8IFtdXG4gIH1cbiAgZ2V0VGVycmFpblByb3ZpZGVyID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8udGVycmFpblByb3ZpZGVyIHx8IHt9XG4gIH1cbiAgZ2V0QmluZ0tleSA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmJpbmdLZXkgfHwgJydcbiAgfVxuICBnZXRTeXN0ZW1Vc2FnZU1lc3NhZ2UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24/LnN5c3RlbVVzYWdlTWVzc2FnZSB8fCAnJ1xuICB9XG4gIC8vIGluIG1pbnV0ZXNcbiAgZ2V0UGxhdGZvcm1VSVRpbWVvdXQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24/LnRpbWVvdXQgfHwgMTVcbiAgfVxuICBnZXRCYXNpY1NlYXJjaFRlbXBvcmFsU2VsZWN0aW9uRGVmYXVsdCA9ICgpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5jb25maWc/LmJhc2ljU2VhcmNoVGVtcG9yYWxTZWxlY3Rpb25EZWZhdWx0IHx8IFtcbiAgICAgICAgJ2NyZWF0ZWQnLFxuICAgICAgICAnZWZmZWN0aXZlJyxcbiAgICAgICAgJ21vZGlmaWVkJyxcbiAgICAgICAgJ21ldGFjYXJkLmNyZWF0ZWQnLFxuICAgICAgICAnbWV0YWNhcmQubW9kaWZpZWQnLFxuICAgICAgXVxuICAgIClcbiAgfVxuICBnZXRFbnVtcyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmVudW1zIHx8IHt9XG4gIH1cbiAgZ2V0T25saW5lR2F6ZXR0ZWVyID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ub25saW5lR2F6ZXR0ZWVyIHx8IGZhbHNlXG4gIH1cbiAgZ2V0UmVzdWx0U2hvdyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnJlc3VsdFNob3cgfHwgW11cbiAgfVxuICBnZXRJY29uQ29uZmlnID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uaWNvbkNvbmZpZyB8fCB7fVxuICB9XG4gIGdldFNob3dSZWxldmFuY2VTY29yZXMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5zaG93UmVsZXZhbmNlU2NvcmVzIHx8IGZhbHNlXG4gIH1cbiAgZ2V0UmVsZXZhbmNlUHJlY2lzaW9uID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ucmVsZXZhbmNlUHJlY2lzaW9uIHx8IDJcbiAgfVxuICBnZXRNYXBIb21lID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ubWFwSG9tZSB8fCAnJ1xuICB9XG4gIGdldEhlbHBVcmwgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5oZWxwVXJsIHx8ICcnXG4gIH1cbiAgZ2V0Q3VzdG9tQnJhbmRpbmcgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5jdXN0b21CcmFuZGluZyB8fCAnJ1xuICB9XG4gIGdldFRvcExlZnRMb2dvU3JjID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8udG9wTGVmdExvZ29TcmMgfHwgJydcbiAgfVxuICBnZXRQcm9kdWN0ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ucHJvZHVjdCB8fCAnJ1xuICB9XG4gIGdldE1lbnVJY29uU3JjID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ubWVudUljb25TcmMgfHwgJydcbiAgfVxuICBnZXRCb3R0b21MZWZ0QmFja2dyb3VuZFNyYyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmJvdHRvbUxlZnRCYWNrZ3JvdW5kU3JjIHx8ICcnXG4gIH1cbiAgZ2V0UGxhdGZvcm1IZWFkZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24/LmhlYWRlclxuICB9XG4gIGdldFBsYXRmb3JtRm9vdGVyID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnBsYXRmb3JtVWlDb25maWd1cmF0aW9uPy5mb290ZXJcbiAgfVxuICBnZXRQbGF0Zm9ybUJhY2tncm91bmQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24/LmJhY2tncm91bmRcbiAgfVxuICBnZXRQbGF0Zm9ybUNvbG9yID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnBsYXRmb3JtVWlDb25maWd1cmF0aW9uPy5jb2xvclxuICB9XG4gIGdldFdlYlNvY2tldHNFbmFibGVkID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ud2ViU29ja2V0c0VuYWJsZWRcbiAgfVxuICBnZXRCYXNpY1NlYXJjaE1hdGNoVHlwZSA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmJhc2ljU2VhcmNoTWF0Y2hUeXBlIHx8ICdkYXRhdHlwZSdcbiAgfVxuICBnZXREZWZhdWx0TGF5b3V0ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uZGVmYXVsdExheW91dFxuICB9XG4gIC8vIGluIG1pbGxpc2Vjb25kc1xuICBnZXRTZWFyY2hUaW1lb3V0ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8udGltZW91dCB8fCAzMDAwMDBcbiAgfVxuICBnZXREZWZhdWx0U291cmNlcyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmRlZmF1bHRTb3VyY2VzICYmIHRoaXMuY29uZmlnPy5kZWZhdWx0U291cmNlcy5sZW5ndGggPiAwXG4gICAgICA/IHRoaXMuY29uZmlnLmRlZmF1bHRTb3VyY2VzXG4gICAgICA6IFsnYWxsJ11cbiAgfVxuICBnZXREZWZhdWx0VGFibGVDb2x1bW5zID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uZGVmYXVsdFRhYmxlQ29sdW1ucyB8fCBbXVxuICB9XG4gIGdldElzRnV6enlSZXN1bHRzRW5hYmxlZCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmlzRnV6enlSZXN1bHRzRW5hYmxlZCB8fCBmYWxzZVxuICB9XG4gIGdldERpc2FibGVVbmtub3duRXJyb3JCb3ggPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5kaXNhYmxlVW5rbm93bkVycm9yQm94IHx8IGZhbHNlXG4gIH1cbiAgZ2V0RXh0cmEgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5leHRyYVxuICB9XG4gIGdldERhdGFUeXBlcyA9ICgpOiBEYXRhVHlwZXNDb25maWd1cmF0aW9uID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgZ3JvdXBzOiB0aGlzLmdldEV4dHJhKCk/LmRhdGF0eXBlcz8uZ3JvdXBzIHx8IHt9LFxuICAgIH1cbiAgfVxuICBnZXRSZXNvdXJjZVNpemVJZGVudGlmaWVycyA9ICgpOiBzdHJpbmdbXSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RXh0cmEoKT8ucmVzb3VyY2VTaXplSWRlbnRpZmllcnMgfHwgW11cbiAgfVxufVxuXG5leHBvcnQgeyBDb25maWd1cmF0aW9uIH1cbiJdfQ==