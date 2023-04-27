export declare const TypedProperties: {
    isHidden: (attribute: string) => boolean;
    isReadOnly: (attribute: string) => boolean;
    getHiddenAttributes: () => string[];
    getSummaryShow: () => string[];
    getResultsAttributesShownTable: () => string[];
    getResultsAttributesShownList: () => string[];
    getReadOnly: () => string[];
    isPhoneticsEnabled: () => boolean;
    isFuzzyResultsEnabled: () => boolean;
    getIconConfig: () => {
        [key: string]: {
            code: string;
            size: string;
            className: string;
            font: string;
        };
    };
    getEnums: () => {
        [key: string]: string[];
    };
    getBasicSearchMatchType: () => string;
    getBasicSearchTemporalSelectionDefault: () => string[];
    getWebSocketsEnabled: () => boolean;
    isDevelopment: () => boolean;
    isMetacardPreviewEnabled: () => boolean;
};
