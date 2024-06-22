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
//# sourceMappingURL=configuration.js.map