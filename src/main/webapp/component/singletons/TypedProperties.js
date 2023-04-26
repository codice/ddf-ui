import properties from '../../js/properties';
export var TypedProperties = {
    isHidden: function (attribute) {
        return properties.isHidden(attribute);
    },
    isReadOnly: function (attribute) {
        return properties.isReadOnly(attribute);
    },
    getHiddenAttributes: function () {
        return properties.hiddenAttributes;
    },
    getSummaryShow: function () {
        return properties.summaryShow;
    },
    getResultsAttributesShownTable: function () {
        return properties.defaultTableColumns;
    },
    getResultsAttributesShownList: function () {
        return properties.resultShow;
    },
    getReadOnly: function () {
        return properties.readOnly;
    },
    isPhoneticsEnabled: function () {
        return properties.isPhoneticsEnabled;
    },
    isFuzzyResultsEnabled: function () {
        return properties.isFuzzyResultsEnabled;
    },
    getIconConfig: function () {
        return properties.iconConfig;
    },
    getEnums: function () {
        return properties.enums;
    },
    getBasicSearchMatchType: function () {
        return properties.basicSearchMatchType;
    },
    getBasicSearchTemporalSelectionDefault: function () {
        return properties.basicSearchTemporalSelectionDefault;
    },
    getWebSocketsEnabled: function () {
        return properties.webSocketsEnabled;
    },
    isDevelopment: function () {
        return properties.isDevelopment();
    },
    isMetacardPreviewEnabled: function () {
        return properties.isMetacardPreviewEnabled();
    }
};
//# sourceMappingURL=TypedProperties.js.map