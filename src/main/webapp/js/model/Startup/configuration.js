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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9TdGFydHVwL2NvbmZpZ3VyYXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFHbkQsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBRzFCLFNBQVMsS0FBSyxDQUFDLFNBQWMsRUFBRSxTQUFjO0lBQzNDLE9BQU8sQ0FDTCxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztTQUNmLEdBQUcsQ0FBQyxVQUFDLEdBQUcsSUFBSyxPQUFBLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFmLENBQWUsQ0FBQztRQUM5QixtSkFBbUo7U0FDbEosSUFBSSxDQUFDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBckIsQ0FBcUIsQ0FBQztTQUN0QyxLQUFLLEVBQUUsS0FBSyxTQUFTLENBQ3pCLENBQUE7QUFDSCxDQUFDO0FBRUQ7SUFBNEIsaUNBQStDO0lBR3pFLHVCQUFZLFdBQXlCO1FBQXJDLFlBQ0UsaUJBQU8sU0FTUjtRQUNELG9CQUFjLEdBQUc7O1lBQ2YsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsaUJBQWlCLEtBQUksSUFBSSxDQUFBO1FBQy9DLENBQUMsQ0FBQTtRQUNELG9CQUFjLEdBQUc7O1lBQ2YsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsV0FBVyxLQUFJLEdBQUcsQ0FBQTtRQUN4QyxDQUFDLENBQUE7UUFDRCxtQkFBYSxHQUFHOztZQUNkLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLFVBQVUsS0FBSSxXQUFXLENBQUE7UUFDL0MsQ0FBQyxDQUFBO1FBQ0QsYUFBTyxHQUFHOztZQUNSLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLElBQUksS0FBSSxFQUFFLENBQUE7UUFDaEMsQ0FBQyxDQUFBO1FBQ0QseUJBQW1CLEdBQUc7O1lBQ3BCLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLGdCQUFnQixLQUFJLEVBQUUsQ0FBQTtRQUM1QyxDQUFDLENBQUE7UUFDRCxnQkFBVSxHQUFHLFVBQUMsU0FBaUI7WUFDN0IsT0FBTyxLQUFLLENBQUMsS0FBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQzdDLENBQUMsQ0FBQTtRQUNELGlCQUFXLEdBQUc7O1lBQ1osT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsUUFBUSxLQUFJLEVBQUUsQ0FBQTtRQUNwQyxDQUFDLENBQUE7UUFDRCxvQkFBYyxHQUFHOztZQUNmLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLFdBQVcsS0FBSSxFQUFFLENBQUE7UUFDdkMsQ0FBQyxDQUFBO1FBQ0QsaUNBQTJCLEdBQUc7O1lBQzVCLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLHdCQUF3QixLQUFJLEVBQUUsQ0FBQTtRQUNwRCxDQUFDLENBQUE7UUFDRCxvQ0FBOEIsR0FBRzs7WUFDL0IsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsMkJBQTJCLEtBQUksRUFBRSxDQUFBO1FBQ3ZELENBQUMsQ0FBQTtRQUNELHFDQUErQixHQUFHOztZQUNoQyxPQUFPLENBQUEsTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSw0QkFBNEIsS0FBSSxFQUFFLENBQUE7UUFDeEQsQ0FBQyxDQUFBO1FBQ0QseUJBQW1CLEdBQUc7O1lBQ3BCLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLGdCQUFnQixLQUFJLEVBQUUsQ0FBQTtRQUM1QyxDQUFDLENBQUE7UUFDRCx5QkFBbUIsR0FBRzs7WUFDcEIsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsZ0JBQWdCLEtBQUksRUFBRSxDQUFBO1FBQzVDLENBQUMsQ0FBQTtRQUNELHdCQUFrQixHQUFHOztZQUNuQixPQUFPLENBQUEsTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSxlQUFlLEtBQUksRUFBRSxDQUFBO1FBQzNDLENBQUMsQ0FBQTtRQUNELGdCQUFVLEdBQUc7O1lBQ1gsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsT0FBTyxLQUFJLEVBQUUsQ0FBQTtRQUNuQyxDQUFDLENBQUE7UUFDRCwyQkFBcUIsR0FBRzs7WUFDdEIsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLHVCQUF1QiwwQ0FBRSxrQkFBa0IsS0FBSSxFQUFFLENBQUE7UUFDL0QsQ0FBQyxDQUFBO1FBQ0QsYUFBYTtRQUNiLDBCQUFvQixHQUFHOztZQUNyQixPQUFPLENBQUEsTUFBQSxLQUFJLENBQUMsdUJBQXVCLDBDQUFFLE9BQU8sS0FBSSxFQUFFLENBQUE7UUFDcEQsQ0FBQyxDQUFBO1FBQ0QsNENBQXNDLEdBQUc7O1lBQ3ZDLE9BQU8sQ0FDTCxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsbUNBQW1DLEtBQUk7Z0JBQ2xELFNBQVM7Z0JBQ1QsV0FBVztnQkFDWCxVQUFVO2dCQUNWLGtCQUFrQjtnQkFDbEIsbUJBQW1CO2FBQ3BCLENBQ0YsQ0FBQTtRQUNILENBQUMsQ0FBQTtRQUNELGNBQVEsR0FBRzs7WUFDVCxPQUFPLENBQUEsTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSxLQUFLLEtBQUksRUFBRSxDQUFBO1FBQ2pDLENBQUMsQ0FBQTtRQUNELHdCQUFrQixHQUFHOztZQUNuQixPQUFPLENBQUEsTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSxlQUFlLEtBQUksS0FBSyxDQUFBO1FBQzlDLENBQUMsQ0FBQTtRQUNELG1CQUFhLEdBQUc7O1lBQ2QsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsVUFBVSxLQUFJLEVBQUUsQ0FBQTtRQUN0QyxDQUFDLENBQUE7UUFDRCxtQkFBYSxHQUFHOztZQUNkLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLFVBQVUsS0FBSSxFQUFFLENBQUE7UUFDdEMsQ0FBQyxDQUFBO1FBQ0QsNEJBQXNCLEdBQUc7O1lBQ3ZCLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLG1CQUFtQixLQUFJLEtBQUssQ0FBQTtRQUNsRCxDQUFDLENBQUE7UUFDRCwyQkFBcUIsR0FBRzs7WUFDdEIsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsa0JBQWtCLEtBQUksQ0FBQyxDQUFBO1FBQzdDLENBQUMsQ0FBQTtRQUNELGdCQUFVLEdBQUc7O1lBQ1gsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsT0FBTyxLQUFJLEVBQUUsQ0FBQTtRQUNuQyxDQUFDLENBQUE7UUFDRCxnQkFBVSxHQUFHOztZQUNYLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLE9BQU8sS0FBSSxFQUFFLENBQUE7UUFDbkMsQ0FBQyxDQUFBO1FBQ0QsdUJBQWlCLEdBQUc7O1lBQ2xCLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLGNBQWMsS0FBSSxFQUFFLENBQUE7UUFDMUMsQ0FBQyxDQUFBO1FBQ0QsdUJBQWlCLEdBQUc7O1lBQ2xCLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLGNBQWMsS0FBSSxFQUFFLENBQUE7UUFDMUMsQ0FBQyxDQUFBO1FBQ0QsZ0JBQVUsR0FBRzs7WUFDWCxPQUFPLENBQUEsTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSxPQUFPLEtBQUksRUFBRSxDQUFBO1FBQ25DLENBQUMsQ0FBQTtRQUNELG9CQUFjLEdBQUc7O1lBQ2YsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsV0FBVyxLQUFJLEVBQUUsQ0FBQTtRQUN2QyxDQUFDLENBQUE7UUFDRCxnQ0FBMEIsR0FBRzs7WUFDM0IsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsdUJBQXVCLEtBQUksRUFBRSxDQUFBO1FBQ25ELENBQUMsQ0FBQTtRQUNELHVCQUFpQixHQUFHOztZQUNsQixPQUFPLE1BQUEsS0FBSSxDQUFDLHVCQUF1QiwwQ0FBRSxNQUFNLENBQUE7UUFDN0MsQ0FBQyxDQUFBO1FBQ0QsdUJBQWlCLEdBQUc7O1lBQ2xCLE9BQU8sTUFBQSxLQUFJLENBQUMsdUJBQXVCLDBDQUFFLE1BQU0sQ0FBQTtRQUM3QyxDQUFDLENBQUE7UUFDRCwyQkFBcUIsR0FBRzs7WUFDdEIsT0FBTyxNQUFBLEtBQUksQ0FBQyx1QkFBdUIsMENBQUUsVUFBVSxDQUFBO1FBQ2pELENBQUMsQ0FBQTtRQUNELHNCQUFnQixHQUFHOztZQUNqQixPQUFPLE1BQUEsS0FBSSxDQUFDLHVCQUF1QiwwQ0FBRSxLQUFLLENBQUE7UUFDNUMsQ0FBQyxDQUFBO1FBQ0QsMEJBQW9CLEdBQUc7O1lBQ3JCLE9BQU8sTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSxpQkFBaUIsQ0FBQTtRQUN2QyxDQUFDLENBQUE7UUFDRCw2QkFBdUIsR0FBRzs7WUFDeEIsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsb0JBQW9CLEtBQUksVUFBVSxDQUFBO1FBQ3hELENBQUMsQ0FBQTtRQUNELHNCQUFnQixHQUFHOztZQUNqQixPQUFPLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsYUFBYSxDQUFBO1FBQ25DLENBQUMsQ0FBQTtRQUNELGtCQUFrQjtRQUNsQixzQkFBZ0IsR0FBRzs7WUFDakIsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsT0FBTyxLQUFJLE1BQU0sQ0FBQTtRQUN2QyxDQUFDLENBQUE7UUFDRCx1QkFBaUIsR0FBRzs7WUFDbEIsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUsY0FBYyxLQUFJLENBQUEsTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSxjQUFjLENBQUMsTUFBTSxJQUFHLENBQUM7Z0JBQzFFLENBQUMsQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLGNBQWM7Z0JBQzVCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2IsQ0FBQyxDQUFBO1FBQ0QsNEJBQXNCLEdBQUc7O1lBQ3ZCLE9BQU8sQ0FBQSxNQUFBLEtBQUksQ0FBQyxNQUFNLDBDQUFFLG1CQUFtQixLQUFJLEVBQUUsQ0FBQTtRQUMvQyxDQUFDLENBQUE7UUFDRCw4QkFBd0IsR0FBRzs7WUFDekIsT0FBTyxDQUFBLE1BQUEsS0FBSSxDQUFDLE1BQU0sMENBQUUscUJBQXFCLEtBQUksS0FBSyxDQUFBO1FBQ3BELENBQUMsQ0FBQTtRQUNELCtCQUF5QixHQUFHOztZQUMxQixPQUFPLENBQUEsTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSxzQkFBc0IsS0FBSSxLQUFLLENBQUE7UUFDckQsQ0FBQyxDQUFBO1FBQ0QsY0FBUSxHQUFHOztZQUNULE9BQU8sTUFBQSxLQUFJLENBQUMsTUFBTSwwQ0FBRSxLQUFLLENBQUE7UUFDM0IsQ0FBQyxDQUFBO1FBQ0Qsa0JBQVksR0FBRzs7WUFDYixPQUFPO2dCQUNMLE1BQU0sRUFBRSxDQUFBLE1BQUEsTUFBQSxLQUFJLENBQUMsUUFBUSxFQUFFLDBDQUFFLFNBQVMsMENBQUUsTUFBTSxLQUFJLEVBQUU7YUFDakQsQ0FBQTtRQUNILENBQUMsQ0FBQTtRQTdKQyxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsV0FBVyxDQUFDO1lBQ3ZCLGlCQUFpQixFQUFFLFNBQVM7WUFDNUIsUUFBUSxFQUFFLFVBQUMsY0FBYztnQkFDdkIsS0FBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFBO2dCQUNuQyxLQUFJLENBQUMsdUJBQXVCLEdBQUcsY0FBYyxDQUFDLHVCQUF1QixDQUFBO2dCQUNyRSxLQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQyxDQUFBO1lBQzVELENBQUM7U0FDRixDQUFDLENBQUE7O0lBQ0osQ0FBQztJQXNKSCxvQkFBQztBQUFELENBQUMsQUFuS0QsQ0FBNEIsWUFBWSxHQW1LdkM7QUFFRCxPQUFPLEVBQUUsYUFBYSxFQUFFLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdWJzY3JpYmFibGUgfSBmcm9tICcuLi9CYXNlL2Jhc2UtY2xhc3NlcydcbmltcG9ydCB7IFN0YXJ0dXBQYXlsb2FkVHlwZSB9IGZyb20gJy4vc3RhcnR1cC50eXBlcydcbmltcG9ydCB7IFN0YXJ0dXBEYXRhIH0gZnJvbSAnLi9zdGFydHVwJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB7IERhdGFUeXBlc0NvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvZGF0YXR5cGVzL2RhdGF0eXBlcydcblxuZnVuY3Rpb24gbWF0Y2gocmVnZXhMaXN0OiBhbnksIGF0dHJpYnV0ZTogYW55KSB7XG4gIHJldHVybiAoXG4gICAgXy5jaGFpbihyZWdleExpc3QpXG4gICAgICAubWFwKChzdHIpID0+IG5ldyBSZWdFeHAoc3RyKSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAnKHJlZ2V4OiBSZWdFeHApID0+IFJlZ0V4cEV4ZWNBcnIuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgLmZpbmQoKHJlZ2V4KSA9PiByZWdleC5leGVjKGF0dHJpYnV0ZSkpXG4gICAgICAudmFsdWUoKSAhPT0gdW5kZWZpbmVkXG4gIClcbn1cblxuY2xhc3MgQ29uZmlndXJhdGlvbiBleHRlbmRzIFN1YnNjcmliYWJsZTx7IHRoaW5nOiAnY29uZmlndXJhdGlvbi11cGRhdGUnIH0+IHtcbiAgY29uZmlnPzogU3RhcnR1cFBheWxvYWRUeXBlWydjb25maWcnXVxuICBwbGF0Zm9ybVVpQ29uZmlndXJhdGlvbj86IFN0YXJ0dXBQYXlsb2FkVHlwZVsncGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24nXVxuICBjb25zdHJ1Y3RvcihzdGFydHVwRGF0YT86IFN0YXJ0dXBEYXRhKSB7XG4gICAgc3VwZXIoKVxuICAgIHN0YXJ0dXBEYXRhPy5zdWJzY3JpYmVUbyh7XG4gICAgICBzdWJzY3JpYmFibGVUaGluZzogJ2ZldGNoZWQnLFxuICAgICAgY2FsbGJhY2s6IChzdGFydHVwUGF5bG9hZCkgPT4ge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHN0YXJ0dXBQYXlsb2FkLmNvbmZpZ1xuICAgICAgICB0aGlzLnBsYXRmb3JtVWlDb25maWd1cmF0aW9uID0gc3RhcnR1cFBheWxvYWQucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb25cbiAgICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ2NvbmZpZ3VyYXRpb24tdXBkYXRlJyB9KVxuICAgICAgfSxcbiAgICB9KVxuICB9XG4gIGdldEV4cG9ydExpbWl0ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uZXhwb3J0UmVzdWx0TGltaXQgfHwgMTAwMFxuICB9XG4gIGdldFJlc3VsdENvdW50ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8ucmVzdWx0Q291bnQgfHwgMjUwXG4gIH1cbiAgZ2V0UHJvamVjdGlvbiA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnByb2plY3Rpb24gfHwgJ0VQU0c6NDMyNidcbiAgfVxuICBnZXRJMThuID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uaTE4biB8fCB7fVxuICB9XG4gIGdldEF0dHJpYnV0ZUFsaWFzZXMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5hdHRyaWJ1dGVBbGlhc2VzIHx8IHt9XG4gIH1cbiAgaXNSZWFkT25seSA9IChhdHRyaWJ1dGU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiBtYXRjaCh0aGlzLmdldFJlYWRPbmx5KCksIGF0dHJpYnV0ZSlcbiAgfVxuICBnZXRSZWFkT25seSA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnJlYWRPbmx5IHx8IFtdXG4gIH1cbiAgZ2V0U3VtbWFyeVNob3cgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5zdW1tYXJ5U2hvdyB8fCBbXVxuICB9XG4gIGdldFJlcXVpcmVkRXhwb3J0QXR0cmlidXRlcyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnJlcXVpcmVkRXhwb3J0QXR0cmlidXRlcyB8fCBbXVxuICB9XG4gIGdldEV4cG9ydE1ldGFjYXJkRm9ybWF0T3B0aW9ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmV4cG9ydE1ldGFjYXJkRm9ybWF0T3B0aW9ucyB8fCBbXVxuICB9XG4gIGdldEV4cG9ydE1ldGFjYXJkc0Zvcm1hdE9wdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5leHBvcnRNZXRhY2FyZHNGb3JtYXRPcHRpb25zIHx8IFtdXG4gIH1cbiAgZ2V0Q29tbW9uQXR0cmlidXRlcyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmNvbW1vbkF0dHJpYnV0ZXMgfHwgW11cbiAgfVxuICBnZXRJbWFnZXJ5UHJvdmlkZXJzID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uaW1hZ2VyeVByb3ZpZGVycyB8fCBbXVxuICB9XG4gIGdldFRlcnJhaW5Qcm92aWRlciA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnRlcnJhaW5Qcm92aWRlciB8fCB7fVxuICB9XG4gIGdldEJpbmdLZXkgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5iaW5nS2V5IHx8ICcnXG4gIH1cbiAgZ2V0U3lzdGVtVXNhZ2VNZXNzYWdlID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnBsYXRmb3JtVWlDb25maWd1cmF0aW9uPy5zeXN0ZW1Vc2FnZU1lc3NhZ2UgfHwgJydcbiAgfVxuICAvLyBpbiBtaW51dGVzXG4gIGdldFBsYXRmb3JtVUlUaW1lb3V0ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnBsYXRmb3JtVWlDb25maWd1cmF0aW9uPy50aW1lb3V0IHx8IDE1XG4gIH1cbiAgZ2V0QmFzaWNTZWFyY2hUZW1wb3JhbFNlbGVjdGlvbkRlZmF1bHQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuY29uZmlnPy5iYXNpY1NlYXJjaFRlbXBvcmFsU2VsZWN0aW9uRGVmYXVsdCB8fCBbXG4gICAgICAgICdjcmVhdGVkJyxcbiAgICAgICAgJ2VmZmVjdGl2ZScsXG4gICAgICAgICdtb2RpZmllZCcsXG4gICAgICAgICdtZXRhY2FyZC5jcmVhdGVkJyxcbiAgICAgICAgJ21ldGFjYXJkLm1vZGlmaWVkJyxcbiAgICAgIF1cbiAgICApXG4gIH1cbiAgZ2V0RW51bXMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5lbnVtcyB8fCB7fVxuICB9XG4gIGdldE9ubGluZUdhemV0dGVlciA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/Lm9ubGluZUdhemV0dGVlciB8fCBmYWxzZVxuICB9XG4gIGdldFJlc3VsdFNob3cgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5yZXN1bHRTaG93IHx8IFtdXG4gIH1cbiAgZ2V0SWNvbkNvbmZpZyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/Lmljb25Db25maWcgfHwge31cbiAgfVxuICBnZXRTaG93UmVsZXZhbmNlU2NvcmVzID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uc2hvd1JlbGV2YW5jZVNjb3JlcyB8fCBmYWxzZVxuICB9XG4gIGdldFJlbGV2YW5jZVByZWNpc2lvbiA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnJlbGV2YW5jZVByZWNpc2lvbiB8fCAyXG4gIH1cbiAgZ2V0TWFwSG9tZSA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/Lm1hcEhvbWUgfHwgJydcbiAgfVxuICBnZXRIZWxwVXJsID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uaGVscFVybCB8fCAnJ1xuICB9XG4gIGdldEN1c3RvbUJyYW5kaW5nID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uY3VzdG9tQnJhbmRpbmcgfHwgJydcbiAgfVxuICBnZXRUb3BMZWZ0TG9nb1NyYyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnRvcExlZnRMb2dvU3JjIHx8ICcnXG4gIH1cbiAgZ2V0UHJvZHVjdCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnByb2R1Y3QgfHwgJydcbiAgfVxuICBnZXRNZW51SWNvblNyYyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/Lm1lbnVJY29uU3JjIHx8ICcnXG4gIH1cbiAgZ2V0Qm90dG9tTGVmdEJhY2tncm91bmRTcmMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5ib3R0b21MZWZ0QmFja2dyb3VuZFNyYyB8fCAnJ1xuICB9XG4gIGdldFBsYXRmb3JtSGVhZGVyID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnBsYXRmb3JtVWlDb25maWd1cmF0aW9uPy5oZWFkZXJcbiAgfVxuICBnZXRQbGF0Zm9ybUZvb3RlciA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvbj8uZm9vdGVyXG4gIH1cbiAgZ2V0UGxhdGZvcm1CYWNrZ3JvdW5kID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnBsYXRmb3JtVWlDb25maWd1cmF0aW9uPy5iYWNrZ3JvdW5kXG4gIH1cbiAgZ2V0UGxhdGZvcm1Db2xvciA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvbj8uY29sb3JcbiAgfVxuICBnZXRXZWJTb2NrZXRzRW5hYmxlZCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LndlYlNvY2tldHNFbmFibGVkXG4gIH1cbiAgZ2V0QmFzaWNTZWFyY2hNYXRjaFR5cGUgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5iYXNpY1NlYXJjaE1hdGNoVHlwZSB8fCAnZGF0YXR5cGUnXG4gIH1cbiAgZ2V0RGVmYXVsdExheW91dCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmRlZmF1bHRMYXlvdXRcbiAgfVxuICAvLyBpbiBtaWxsaXNlY29uZHNcbiAgZ2V0U2VhcmNoVGltZW91dCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LnRpbWVvdXQgfHwgMzAwMDAwXG4gIH1cbiAgZ2V0RGVmYXVsdFNvdXJjZXMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5kZWZhdWx0U291cmNlcyAmJiB0aGlzLmNvbmZpZz8uZGVmYXVsdFNvdXJjZXMubGVuZ3RoID4gMFxuICAgICAgPyB0aGlzLmNvbmZpZy5kZWZhdWx0U291cmNlc1xuICAgICAgOiBbJ2FsbCddXG4gIH1cbiAgZ2V0RGVmYXVsdFRhYmxlQ29sdW1ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmRlZmF1bHRUYWJsZUNvbHVtbnMgfHwgW11cbiAgfVxuICBnZXRJc0Z1enp5UmVzdWx0c0VuYWJsZWQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnPy5pc0Z1enp5UmVzdWx0c0VuYWJsZWQgfHwgZmFsc2VcbiAgfVxuICBnZXREaXNhYmxlVW5rbm93bkVycm9yQm94ID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uZGlzYWJsZVVua25vd25FcnJvckJveCB8fCBmYWxzZVxuICB9XG4gIGdldEV4dHJhID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZz8uZXh0cmFcbiAgfVxuICBnZXREYXRhVHlwZXMgPSAoKTogRGF0YVR5cGVzQ29uZmlndXJhdGlvbiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdyb3VwczogdGhpcy5nZXRFeHRyYSgpPy5kYXRhdHlwZXM/Lmdyb3VwcyB8fCB7fSxcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgQ29uZmlndXJhdGlvbiB9XG4iXX0=