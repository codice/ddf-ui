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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9TdGFydHVwL2NvbmZpZ3VyYXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFHbkQsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBRzFCLFNBQVMsS0FBSyxDQUFDLFNBQWMsRUFBRSxTQUFjO0lBQzNDLE9BQU8sQ0FDTCxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztTQUNmLEdBQUcsQ0FBQyxVQUFDLEdBQUcsSUFBSyxPQUFBLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFmLENBQWUsQ0FBQztRQUM5QixtSkFBbUo7U0FDbEosSUFBSSxDQUFDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBckIsQ0FBcUIsQ0FBQztTQUN0QyxLQUFLLEVBQUUsS0FBSyxTQUFTLENBQ3pCLENBQUE7QUFDSCxDQUFDO0FBRUQ7SUFBNEIsaUNBQStDO0lBR3pFLHVCQUFZLFdBQXlCO1FBQXJDLFlBQ0UsaUJBQU8sU0FTUjtRQUNELG9CQUFjLEdBQUc7O1lBQ2YsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsaUJBQWlCLEtBQUksSUFBSSxDQUFBO1FBQy9DLENBQUMsQ0FBQTtRQUNELG9CQUFjLEdBQUc7O1lBQ2YsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsV0FBVyxLQUFJLEdBQUcsQ0FBQTtRQUN4QyxDQUFDLENBQUE7UUFDRCxtQkFBYSxHQUFHOztZQUNkLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLFVBQVUsS0FBSSxXQUFXLENBQUE7UUFDL0MsQ0FBQyxDQUFBO1FBQ0QsYUFBTyxHQUFHOztZQUNS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QUFDLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLENBQUMsQ0FBQTtZQUM1RCxDQUFDO1NBQ0YsQ0FBQyxDQUFBOztJQUNKLENBQUM7SUF5Skgsb0JBQUM7QUFBRCxDQUFDLEFBdEtELENBQTRCLFlBQVksR0FzS3ZDO0FBRUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3Vic2NyaWJhYmxlIH0gZnJvbSAnLi4vQmFzZS9iYXNlLWNsYXNzZXMnXG5pbXBvcnQgeyBTdGFydHVwUGF5bG9hZFR5cGUgfSBmcm9tICcuL3N0YXJ0dXAudHlwZXMnXG5pbXBvcnQgeyBTdGFydHVwRGF0YSB9IGZyb20gJy4vc3RhcnR1cCdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgeyBEYXRhVHlwZXNDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L2RhdGF0eXBlcy9kYXRhdHlwZXMnXG5cbmZ1bmN0aW9uIG1hdGNoKHJlZ2V4TGlzdDogYW55LCBhdHRyaWJ1dGU6IGFueSkge1xuICByZXR1cm4gKFxuICAgIF8uY2hhaW4ocmVnZXhMaXN0KVxuICAgICAgLm1hcCgoc3RyKSA9PiBuZXcgUmVnRXhwKHN0cikpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJyhyZWdleDogUmVnRXhwKSA9PiBSZWdFeHBFeGVjQXJyLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIC5maW5kKChyZWdleCkgPT4gcmVnZXguZXhlYyhhdHRyaWJ1dGUpKVxuICAgICAgLnZhbHVlKCkgIT09IHVuZGVmaW5lZFxuICApXG59XG5cbmNsYXNzIENvbmZpZ3VyYXRpb24gZXh0ZW5kcyBTdWJzY3JpYmFibGU8eyB0aGluZzogJ2NvbmZpZ3VyYXRpb24tdXBkYXRlJyB9PiB7XG4gIGNvbmZpZz86IFN0YXJ0dXBQYXlsb2FkVHlwZVsnY29uZmlnJ11cbiAgcGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24/OiBTdGFydHVwUGF5bG9hZFR5cGVbJ3BsYXRmb3JtVWlDb25maWd1cmF0aW9uJ11cbiAgY29uc3RydWN0b3Ioc3RhcnR1cERhdGE/OiBTdGFydHVwRGF0YSkge1xuICAgIHN1cGVyKClcbiAgICBzdGFydHVwRGF0YT8uc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdmZXRjaGVkJyxcbiAgICAgIGNhbGxiYWNrOiAoc3RhcnR1cFBheWxvYWQpID0+IHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBzdGFydHVwUGF5bG9hZC5jb25maWdcbiAgICAgICAgdGhpcy5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvbiA9IHN0YXJ0dXBQYXlsb2FkLnBsYXRmb3JtVWlDb25maWd1cmF0aW9uXG4gICAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKHsgdGhpbmc6ICdjb25maWd1cmF0aW9uLXVwZGF0ZScgfSlcbiAgICAgIH0sXG4gICAgfSlcbiAgfVxuICBnZXRFeHBvcnRMaW1pdCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmV4cG9ydFJlc3VsdExpbWl0IHx8IDEwMDBcbiAgfVxuICBnZXRSZXN1bHRDb3VudCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnJlc3VsdENvdW50IHx8IDI1MFxuICB9XG4gIGdldFByb2plY3Rpb24gPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5wcm9qZWN0aW9uIHx8ICdFUFNHOjQzMjYnXG4gIH1cbiAgZ2V0STE4biA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmkxOG4gfHwge31cbiAgfVxuICBnZXRBdHRyaWJ1dGVBbGlhc2VzID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uYXR0cmlidXRlQWxpYXNlcyB8fCB7fVxuICB9XG4gIGlzUmVhZE9ubHkgPSAoYXR0cmlidXRlOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gbWF0Y2godGhpcy5nZXRSZWFkT25seSgpLCBhdHRyaWJ1dGUpXG4gIH1cbiAgZ2V0UmVhZE9ubHkgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5yZWFkT25seSB8fCBbXVxuICB9XG4gIGdldFN1bW1hcnlTaG93ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uc3VtbWFyeVNob3cgfHwgW11cbiAgfVxuICBnZXRSZXF1aXJlZEV4cG9ydEF0dHJpYnV0ZXMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5yZXF1aXJlZEV4cG9ydEF0dHJpYnV0ZXMgfHwgW11cbiAgfVxuICBnZXRFeHBvcnRNZXRhY2FyZEZvcm1hdE9wdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5leHBvcnRNZXRhY2FyZEZvcm1hdE9wdGlvbnMgfHwgW11cbiAgfVxuICBnZXRFeHBvcnRNZXRhY2FyZHNGb3JtYXRPcHRpb25zID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uZXhwb3J0TWV0YWNhcmRzRm9ybWF0T3B0aW9ucyB8fCBbXVxuICB9XG4gIGdldENvbW1vbkF0dHJpYnV0ZXMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5jb21tb25BdHRyaWJ1dGVzIHx8IFtdXG4gIH1cbiAgZ2V0SW1hZ2VyeVByb3ZpZGVycyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmltYWdlcnlQcm92aWRlcnMgfHwgW11cbiAgfVxuICBnZXRUZXJyYWluUHJvdmlkZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy50ZXJyYWluUHJvdmlkZXIgfHwge31cbiAgfVxuICBnZXRCaW5nS2V5ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uYmluZ0tleSB8fCAnJ1xuICB9XG4gIGdldFN5c3RlbVVzYWdlTWVzc2FnZSA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvbj8uc3lzdGVtVXNhZ2VNZXNzYWdlIHx8ICcnXG4gIH1cbiAgLy8gaW4gbWludXRlc1xuICBnZXRQbGF0Zm9ybVVJVGltZW91dCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvbj8udGltZW91dCB8fCAxNVxuICB9XG4gIGdldEJhc2ljU2VhcmNoVGVtcG9yYWxTZWxlY3Rpb25EZWZhdWx0ID0gKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmNvbmZpZz8uYmFzaWNTZWFyY2hUZW1wb3JhbFNlbGVjdGlvbkRlZmF1bHQgfHwgW1xuICAgICAgICAnY3JlYXRlZCcsXG4gICAgICAgICdlZmZlY3RpdmUnLFxuICAgICAgICAnbW9kaWZpZWQnLFxuICAgICAgICAnbWV0YWNhcmQuY3JlYXRlZCcsXG4gICAgICAgICdtZXRhY2FyZC5tb2RpZmllZCcsXG4gICAgICBdXG4gICAgKVxuICB9XG4gIGdldEVudW1zID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uZW51bXMgfHwge31cbiAgfVxuICBnZXRPbmxpbmVHYXpldHRlZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5vbmxpbmVHYXpldHRlZXIgfHwgZmFsc2VcbiAgfVxuICBnZXRSZXN1bHRTaG93ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ucmVzdWx0U2hvdyB8fCBbXVxuICB9XG4gIGdldEljb25Db25maWcgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5pY29uQ29uZmlnIHx8IHt9XG4gIH1cbiAgZ2V0U2hvd1JlbGV2YW5jZVNjb3JlcyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnNob3dSZWxldmFuY2VTY29yZXMgfHwgZmFsc2VcbiAgfVxuICBnZXRSZWxldmFuY2VQcmVjaXNpb24gPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5yZWxldmFuY2VQcmVjaXNpb24gfHwgMlxuICB9XG4gIGdldE1hcEhvbWUgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5tYXBIb21lIHx8ICcnXG4gIH1cbiAgZ2V0SGVscFVybCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmhlbHBVcmwgfHwgJydcbiAgfVxuICBnZXRDdXN0b21CcmFuZGluZyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmN1c3RvbUJyYW5kaW5nIHx8ICcnXG4gIH1cbiAgZ2V0VG9wTGVmdExvZ29TcmMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy50b3BMZWZ0TG9nb1NyYyB8fCAnJ1xuICB9XG4gIGdldFByb2R1Y3QgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5wcm9kdWN0IHx8ICcnXG4gIH1cbiAgZ2V0TWVudUljb25TcmMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5tZW51SWNvblNyYyB8fCAnJ1xuICB9XG4gIGdldEJvdHRvbUxlZnRCYWNrZ3JvdW5kU3JjID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uYm90dG9tTGVmdEJhY2tncm91bmRTcmMgfHwgJydcbiAgfVxuICBnZXRQbGF0Zm9ybUhlYWRlciA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvbj8uaGVhZGVyXG4gIH1cbiAgZ2V0UGxhdGZvcm1Gb290ZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24/LmZvb3RlclxuICB9XG4gIGdldFBsYXRmb3JtQmFja2dyb3VuZCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvbj8uYmFja2dyb3VuZFxuICB9XG4gIGdldFBsYXRmb3JtQ29sb3IgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24/LmNvbG9yXG4gIH1cbiAgZ2V0V2ViU29ja2V0c0VuYWJsZWQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy53ZWJTb2NrZXRzRW5hYmxlZFxuICB9XG4gIGdldEJhc2ljU2VhcmNoTWF0Y2hUeXBlID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uYmFzaWNTZWFyY2hNYXRjaFR5cGUgfHwgJ2RhdGF0eXBlJ1xuICB9XG4gIGdldERlZmF1bHRMYXlvdXQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5kZWZhdWx0TGF5b3V0XG4gIH1cbiAgLy8gaW4gbWlsbGlzZWNvbmRzXG4gIGdldFNlYXJjaFRpbWVvdXQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy50aW1lb3V0IHx8IDMwMDAwMFxuICB9XG4gIGdldERlZmF1bHRTb3VyY2VzID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uZGVmYXVsdFNvdXJjZXMgJiYgdGhpcy5jb25maWc/LmRlZmF1bHRTb3VyY2VzLmxlbmd0aCA+IDBcbiAgICAgID8gdGhpcy5jb25maWcuZGVmYXVsdFNvdXJjZXNcbiAgICAgIDogWydhbGwnXVxuICB9XG4gIGdldERlZmF1bHRUYWJsZUNvbHVtbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5kZWZhdWx0VGFibGVDb2x1bW5zIHx8IFtdXG4gIH1cbiAgZ2V0SXNGdXp6eVJlc3VsdHNFbmFibGVkID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uaXNGdXp6eVJlc3VsdHNFbmFibGVkIHx8IGZhbHNlXG4gIH1cbiAgZ2V0RGlzYWJsZVVua25vd25FcnJvckJveCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmRpc2FibGVVbmtub3duRXJyb3JCb3ggfHwgZmFsc2VcbiAgfVxuICBnZXRFeHRyYSA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmV4dHJhXG4gIH1cbiAgZ2V0RGF0YVR5cGVzID0gKCk6IERhdGFUeXBlc0NvbmZpZ3VyYXRpb24gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBncm91cHM6IHRoaXMuZ2V0RXh0cmEoKT8uZGF0YXR5cGVzPy5ncm91cHMgfHwge30sXG4gICAgfVxuICB9XG4gIGdldFJlc291cmNlU2l6ZUlkZW50aWZpZXJzID0gKCk6IHN0cmluZ1tdID0+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRFeHRyYSgpPy5yZXNvdXJjZVNpemVJZGVudGlmaWVycyB8fCBbXVxuICB9XG59XG5cbmV4cG9ydCB7IENvbmZpZ3VyYXRpb24gfVxuIl19