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
import User from '../../js/model/User';
import MetacardTypeJSON from './metacardtype';
import Config from './config';
import PlatformConfig from './metacardtype';
import DatatypeJSON from './datatype';
import Sources from './sources';
import Enumerations from './enumerations';
var mockStartupPayload = {
    harvestedSources: [],
    attributeMap: {
        id: { id: 'id', isInjected: false, multivalued: false, type: 'STRING' },
        name: { id: 'name', isInjected: false, multivalued: false, type: 'STRING' },
        age: { id: 'age', isInjected: false, multivalued: false, type: 'FLOAT' },
    },
    config: {
        extra: {},
        attributeDescriptions: [],
        basicSearchTemporalSelectionDefault: ['created'],
        mapHome: 'home',
        resultCount: 10,
        showLogo: true,
        relevancePrecision: 0.85,
        branding: 'My Company',
        basicSearchMatchType: 'exact',
        onlineGazetteer: true,
        imageryProviders: [
            {
                type: 'wms',
                url: 'https://wms.example.com',
                parameters: {
                    imageSize: [1024, 1024],
                },
                alpha: 0.7,
                name: 'Example WMS',
                show: true,
                proxyEnabled: true,
                order: 1,
            },
            // Add more imagery providers as needed
        ],
        isCacheDisabled: false,
        isCustomTextNotationEnabled: true,
        isVersioningEnabled: true,
        isSpellcheckEnabled: true,
        attributeSuggestionList: [],
        requiredExportAttributes: [],
        exportMetacardFormatOptions: [],
        exportMetacardsFormatOptions: [],
        summaryShow: ['name', 'age'],
        readOnly: [],
        version: '1.2.3',
        commonAttributes: ['id', 'name', 'age'],
        i18n: {
            greeting: 'Hello!',
            welcomeMessage: 'Welcome to our app!',
            // Add more localized strings as needed
        },
        customTextNotationAttribute: 'note',
        isExperimental: false,
        sourcePollInterval: 30000,
        requiredAttributes: ['name'],
        scheduleFrequencyList: [1, 5, 10, 30],
        defaultSources: ['source-1', 'source-2'],
        terrainProvider: {
            type: 'cesium',
            url: 'https://terrain.example.com',
        },
        topLeftLogoSrc: 'logo-top-left.png',
        hiddenAttributes: ['age'],
        timeout: 120000,
        attributeAliases: {
            givenName: 'first_name',
            familyName: 'last_name',
        },
        iconConfig: {
            user: {
                code: '1234',
                size: 'large',
                className: 'user-icon',
                font: 'FontAwesome',
            },
            // Add more icon configurations as needed
        },
        enums: {
            status: ['Active', 'Inactive', 'Pending'],
            // Add more enumerated values as needed
        },
        editorAttributes: ['id', 'name', 'age'],
        resultShow: ['name', 'age'],
        disableUnknownErrorBox: false,
        isFuzzyResultsEnabled: true,
        theme: 'dark',
        projection: 'EPSG:4326',
        defaultLayout: [],
        webSocketsEnabled: true,
        showRelevanceScores: true,
        menuIconSrc: 'menu-icon.png',
        product: 'My Awesome App',
        typeNameMapping: {
            person: 'PersonType',
            place: 'PlaceType',
        },
        visualizations: [],
        landingPageBackgroundSrc: 'landing-page-bg.png',
        bottomLeftBackgroundSrc: 'bottom-left-bg.png',
        gazetteer: true,
        isPhoneticsEnabled: true,
        helpUrl: 'https://help.example.com',
        customBranding: '#ff00ff',
        defaultTableColumns: ['id', 'name'],
        exportResultLimit: 1000,
        bingKey: 'BING_API_KEY',
        bottomLeftLogoSrc: 'logo-bottom-left.png',
        useHyphensInUuid: true,
        disableLocalCatalog: false,
    },
    localSourceId: 'local-source-1',
    metacardTypes: {
        'metacard-type-1': {
            id: { id: 'id', isInjected: false, multivalued: false, type: 'STRING' },
            name: {
                id: 'name',
                isInjected: false,
                multivalued: false,
                type: 'STRING',
            },
            age: { id: 'age', isInjected: false, multivalued: false, type: 'FLOAT' },
        },
        // Add more metacard types as needed
    },
    platformUiConfiguration: {
        productImage: 'product.png',
        vendorImage: 'vendor.png',
        favIcon: 'favicon.ico',
        header: 'My Awesome App',
        color: '#4287f5',
        footer: '© 2023 My Company. All rights reserved.',
        background: '#f0f0f0',
        title: 'My Startup',
        version: '1.0.0',
        timeout: 60000,
    },
    sortedAttributes: [
        { id: 'id', isInjected: false, multivalued: false, type: 'STRING' },
        { id: 'name', isInjected: false, multivalued: false, type: 'STRING' },
        { id: 'age', isInjected: false, multivalued: false, type: 'FLOAT' },
    ],
    sources: [
        {
            sourceActions: [],
            available: true,
            id: 'source-1',
            contentTypes: [{ name: 'Type A', version: '1.0' }],
            version: '1.0.0',
            local: true,
        },
        {
            sourceActions: [],
            available: true,
            id: 'source-2',
            contentTypes: [{ name: 'Type B', version: '2.0' }],
            version: '2.0.0',
            local: false,
        },
        // Add more sources as needed
    ],
    user: {
        email: 'user@example.com',
        isGuest: false,
        preferences: {
            id: 'user-123',
            resultDisplay: 'table',
            resultPreview: ['id', 'name'],
            'inspector-hideEmpty': true,
            'inspector-summaryShown': ['name', 'age'],
            'inspector-summaryOrder': ['name', 'age'],
            'inspector-detailsOrder': ['name', 'age'],
            'inspector-detailsHidden': ['id'],
            'results-attributesShownTable': ['id', 'name'],
            'results-attributesShownList': ['id', 'name', 'age'],
            homeFilter: '',
            homeSort: 'name',
            homeDisplay: 'table',
            decimalPrecision: 2,
            alertPersistence: true,
            alertExpiration: 86400000,
            visualization: 'map',
            columnHide: [],
            columnOrder: ['id', 'name', 'age'],
            columnWidths: [],
            hasSelectedColumns: true,
            oauth: [],
            fontSize: 14,
            dateTimeFormat: {
                datetimefmt: 'YYYY-MM-DD HH:mm:ss',
                timefmt: 'HH:mm:ss',
            },
            timeZone: 'UTC',
            coordinateFormat: 'degrees',
            autoPan: true,
            goldenLayout: {
                settings: {
                    hasHeaders: true,
                    constrainDragToContainer: true,
                    reorderEnabled: true,
                    selectionEnabled: true,
                    popoutWholeStack: false,
                    blockedPopoutsThrowError: false,
                    closePopoutsOnUnload: true,
                    showPopoutIcon: true,
                    showMaximiseIcon: true,
                    showCloseIcon: true,
                    responsiveMode: 'always-on',
                },
                dimensions: {
                    borderWidth: 5,
                    minItemHeight: 250,
                    minItemWidth: 300,
                    headerHeight: 20,
                    dragProxyWidth: 300,
                    dragProxyHeight: 200,
                },
                labels: {
                    close: 'Close',
                    maximise: 'Maximize',
                    minimise: 'Minimize',
                    popout: 'Pop Out',
                    popin: 'Pop In',
                    tabDropdown: 'Additional Tabs',
                },
                content: [],
                isClosable: true,
                reorderEnabled: true,
                title: 'My Layout',
                openPopouts: [],
            },
            animation: true,
            hoverPreview: true,
            actingRole: 'user',
            layoutId: 'layout-1',
            mapLayers: [
                {
                    type: 'wms',
                    url: 'https://wms.example.com',
                    parameters: {
                        imageSize: [1024, 1024],
                    },
                    alpha: 0.7,
                    name: 'Example WMS',
                    show: true,
                    proxyEnabled: true,
                    order: 1,
                    label: 'WMS Layer',
                    id: 'wms-1',
                },
                // Add more map layers as needed
            ],
            alerts: [],
            uploads: [
                {
                    unseen: false,
                    percentage: 0,
                    errors: 0,
                    successes: 0,
                    complete: 0,
                    amount: 0,
                    issues: 0,
                    sending: false,
                    finished: false,
                    interrupted: false,
                    sentAt: 0,
                    id: 'upload-1',
                    uploads: [],
                },
            ],
            theme: {
                palette: 'light',
                theme: 'default',
            },
            querySettings: {
                type: 'basic',
                sources: ['source-1'],
                sorts: [
                    { attribute: 'name', direction: 'asc' },
                    { attribute: 'age', direction: 'desc' },
                ],
                spellcheck: true,
                phonetics: false,
                additionalOptions: '{}',
            },
        },
        roles: ['user', 'admin'],
        userid: 'user123',
        username: 'user123',
    },
};
var mockDataMap = {
    './internal/metacardtype': MetacardTypeJSON,
    './internal/config': Config,
    './internal/platform/config/ui': PlatformConfig,
    './internal/enumerations/attribute/datatype': DatatypeJSON,
    './internal/user': User.Model.prototype.defaults(),
    './internal/localcatalogid': 'ddf.distribution',
    './internal/forms/result': [],
    './internal/catalog/sources': Sources,
    './internal/compose/startup': mockStartupPayload,
};
var mockDataGlobs = {
    './internal/enumerations': Enumerations,
};
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'url' implicitly has an 'any' type.
export default (function (url) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var data = mockDataMap[url];
    if (data === undefined) {
        Object.keys(mockDataGlobs).forEach(function (glob) {
            if (url.startsWith(glob)) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                data = mockDataGlobs[glob];
            }
        });
    }
    if (data === undefined) {
        throw new Error("Unknown url '".concat(url, "' for mock api."));
    }
    return data;
});
//# sourceMappingURL=index.js.map