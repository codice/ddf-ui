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
import { DataTypesConfiguration } from '../../../component/datatypes/datatypes';
export type AttributeTypes = 'BINARY' | 'DATE' | 'LOCATION' | 'GEOMETRY' | 'LONG' | 'DOUBLE' | 'FLOAT' | 'INTEGER' | 'SHORT' | 'STRING' | 'BOOLEAN' | 'XML' | 'OBJECT';
export type AttributeDefinitionType = {
    id: string;
    isInjected: boolean;
    multivalued: boolean;
    type: AttributeTypes;
    alias?: string;
    enumerations?: string[];
    deprecatedEnumerations?: string[];
    hidden?: boolean;
};
export type AttributeMapType = {
    [key: string]: AttributeDefinitionType;
};
export type MetacardDefinitionType = AttributeMapType;
export type MetacardDefinitionsType = {
    [key: string]: MetacardDefinitionType;
};
export type SearchResultAttributeDefinitionType = {
    format: AttributeTypes;
    indexed: boolean;
    multivalued: boolean;
};
export type SearchResultAttributeMap = {
    [key: string]: SearchResultAttributeDefinitionType;
};
export type SearchResultMetacardDefinitionType = SearchResultAttributeMap;
export type SortedAttributesType = Array<AttributeDefinitionType>;
export interface ImageryProvider {
    type: string;
    url: string;
    parameters: {
        format?: string;
        transparent?: boolean;
        imageSize?: number[];
    };
    alpha: number;
    name: string;
    show: boolean;
    proxyEnabled: boolean;
    order: number;
}
export interface IconConfig {
    [key: string]: {
        code: string;
        size: string;
        className: string;
        font: string;
    };
}
export interface VisualizationType {
    type: string;
    title: string;
    content: {
        type: string;
        title: string;
        width: number;
        content: {
            type: string;
            component: string;
            componentName: string;
            title: string;
        }[];
    }[];
}
export interface UIConfigType {
    mapHome: string;
    resultCount: number;
    showLogo: boolean;
    relevancePrecision: number;
    attributeDescriptions: Record<string, any>;
    basicSearchTemporalSelectionDefault: string[];
    branding: string;
    basicSearchMatchType: string;
    onlineGazetteer: boolean;
    imageryProviders: ImageryProvider[];
    requiredExportAttributes: string[];
    exportMetacardFormatOptions: string[];
    exportMetacardsFormatOptions: string[];
    isCacheDisabled: boolean;
    isCustomTextNotationEnabled: boolean;
    isVersioningEnabled: boolean;
    isSpellcheckEnabled: boolean;
    attributeSuggestionList: any[];
    summaryShow: string[];
    readOnly: string[];
    version: string;
    commonAttributes: string[];
    i18n: Record<string, string>;
    customTextNotationAttribute: string;
    isExperimental: boolean;
    sourcePollInterval: number;
    requiredAttributes: any[];
    scheduleFrequencyList: number[];
    defaultSources: any[];
    terrainProvider: {
        type: string;
        url: string;
    };
    topLeftLogoSrc: string;
    hiddenAttributes: string[];
    timeout: number;
    attributeAliases: Record<string, string>;
    iconConfig: IconConfig;
    enums: Record<string, any>;
    extra: {
        [key: string]: any;
        datatypes?: DataTypesConfiguration;
    };
    editorAttributes: string[];
    resultShow: string[];
    disableUnknownErrorBox: boolean;
    isFuzzyResultsEnabled: boolean;
    theme: string;
    projection: string;
    defaultLayout: VisualizationType[];
    webSocketsEnabled: boolean;
    showRelevanceScores: boolean;
    menuIconSrc: string;
    product: string;
    typeNameMapping: Record<string, string>;
    visualizations: VisualizationType[];
    landingPageBackgroundSrc: string;
    bottomLeftBackgroundSrc: string;
    gazetteer: boolean;
    isPhoneticsEnabled: boolean;
    helpUrl: string;
    customBranding: string;
    defaultTableColumns: string[];
    exportResultLimit: number;
    bingKey: string;
    bottomLeftLogoSrc: string;
    useHyphensInUuid: boolean;
    disableLocalCatalog: boolean;
}
export type localSourceIdType = string;
export type platformConfigType = {
    productImage: string;
    color?: string;
    footer?: string;
    background?: string;
    vendorImage: string;
    favIcon: string;
    header?: string;
    title: string;
    version: string;
    timeout: number;
    systemUsageMessage?: string;
    systemUsageOncePerSession?: boolean;
    systemUsageTitle?: string;
};
type SourceType = {
    sourceActions: any[];
    available: boolean;
    id: string;
    contentTypes: Array<{
        name: string;
        version: string;
    }>;
    version: string;
    local?: boolean;
    harvested?: boolean;
};
type SourcesType = Array<SourceType>;
interface PreferencesType {
    id: string;
    resultDisplay: string;
    resultPreview: string[];
    'inspector-hideEmpty': boolean;
    'inspector-summaryShown': any[];
    'inspector-summaryOrder': any[];
    'inspector-detailsOrder': string[];
    'inspector-detailsHidden': any[];
    'results-attributesShownTable': any[];
    'results-attributesShownList': any[];
    homeFilter: string;
    homeSort: string;
    homeDisplay: string;
    decimalPrecision: number;
    alertPersistence: boolean;
    alertExpiration: number;
    visualization: string;
    columnHide: any[];
    columnOrder: string[];
    columnWidths: any[];
    hasSelectedColumns: boolean;
    oauth: any[];
    fontSize: number;
    dateTimeFormat: {
        datetimefmt: string;
        timefmt: string;
    };
    timeZone: string;
    coordinateFormat: string;
    autoPan: boolean;
    goldenLayout: {
        settings: {
            hasHeaders: boolean;
            constrainDragToContainer: boolean;
            reorderEnabled: boolean;
            selectionEnabled: boolean;
            popoutWholeStack: boolean;
            blockedPopoutsThrowError: boolean;
            closePopoutsOnUnload: boolean;
            showPopoutIcon: boolean;
            showMaximiseIcon: boolean;
            showCloseIcon: boolean;
            responsiveMode: string;
        };
        dimensions: {
            borderWidth: number;
            minItemHeight: number;
            minItemWidth: number;
            headerHeight: number;
            dragProxyWidth: number;
            dragProxyHeight: number;
        };
        labels: {
            close: string;
            maximise: string;
            minimise: string;
            popout: string;
            popin: string;
            tabDropdown: string;
        };
        content: any[];
        isClosable: boolean;
        reorderEnabled: boolean;
        title: string;
        openPopouts: any[];
    };
    animation: boolean;
    hoverPreview: boolean;
    actingRole: string;
    layoutId: string;
    mapLayers: {
        type: string;
        url: string;
        parameters: {
            format?: string;
            transparent?: boolean;
            imageSize?: number[];
        };
        alpha: number;
        name: string;
        show: boolean;
        proxyEnabled: boolean;
        order: number;
        label: string;
        id: string;
    }[];
    alerts: any[];
    uploads: {
        unseen: boolean;
        percentage: number;
        errors: number;
        successes: number;
        complete: number;
        amount: number;
        issues: number;
        sending: boolean;
        finished: boolean;
        interrupted: boolean;
        sentAt: number;
        id: string;
        uploads: {
            file: {
                upload: {
                    progress: number;
                    total: number;
                    bytesSent: number;
                };
                status: string;
                accepted: boolean;
                processing: boolean;
                xhr: object;
            };
            id: string;
            percentage: number;
            sending: boolean;
            success: boolean;
            error: boolean;
            message: string;
            validating: boolean;
            issues: boolean;
        }[];
    }[];
    theme: {
        palette: string;
        theme: string;
    };
    querySettings: {
        type: string;
        sources: string[];
        sorts: {
            attribute: string;
            direction: string;
        }[];
        spellcheck: boolean;
        phonetics: boolean;
        additionalOptions?: string;
    };
}
export type UserType = {
    email: string;
    isGuest: boolean;
    preferences: PreferencesType;
    roles: Array<string>;
    userid: string;
    username: string;
};
export type StartupPayloadType = {
    attributeMap: AttributeMapType;
    config: UIConfigType;
    localSourceId: localSourceIdType;
    metacardTypes: MetacardDefinitionsType;
    platformUiConfiguration: platformConfigType;
    sortedAttributes: SortedAttributesType;
    sources: SourcesType;
    user: UserType;
    harvestedSources: string[];
};
export type DatatypeQueryMap = {
    datatype: string;
    attributes: {
        name: string;
        values: string[];
    }[];
};
export {};
