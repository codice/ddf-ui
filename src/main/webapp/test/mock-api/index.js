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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvdGVzdC9tb2NrLWFwaS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxJQUFJLE1BQU0scUJBQXFCLENBQUE7QUFDdEMsT0FBTyxnQkFBZ0IsTUFBTSxnQkFBZ0IsQ0FBQTtBQUM3QyxPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUE7QUFDN0IsT0FBTyxjQUFjLE1BQU0sZ0JBQWdCLENBQUE7QUFDM0MsT0FBTyxZQUFZLE1BQU0sWUFBWSxDQUFBO0FBQ3JDLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUMvQixPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUd6QyxJQUFNLGtCQUFrQixHQUF1QjtJQUM3QyxnQkFBZ0IsRUFBRSxFQUFFO0lBQ3BCLFlBQVksRUFBRTtRQUNaLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDdkUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUMzRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0tBQ3pFO0lBQ0QsTUFBTSxFQUFFO1FBQ04sS0FBSyxFQUFFLEVBQUU7UUFDVCxxQkFBcUIsRUFBRSxFQUFFO1FBQ3pCLG1DQUFtQyxFQUFFLENBQUMsU0FBUyxDQUFDO1FBQ2hELE9BQU8sRUFBRSxNQUFNO1FBQ2YsV0FBVyxFQUFFLEVBQUU7UUFDZixRQUFR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QUUsRUFBRTtJQUM3Qiw0QkFBNEIsRUFBRSxPQUFPO0lBQ3JDLDRCQUE0QixFQUFFLGtCQUFrQjtDQUNqRCxDQUFBO0FBQ0QsSUFBTSxhQUFhLEdBQUc7SUFDcEIseUJBQXlCLEVBQUUsWUFBWTtDQUN4QyxDQUFBO0FBQ0QseUZBQXlGO0FBQ3pGLGdCQUFlLFVBQUMsR0FBRztJQUNqQixtSkFBbUo7SUFDbkosSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtRQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7WUFDdEMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN4QixtSkFBbUo7Z0JBQ25KLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDM0I7UUFDSCxDQUFDLENBQUMsQ0FBQTtLQUNIO0lBQ0QsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQWdCLEdBQUcsb0JBQWlCLENBQUMsQ0FBQTtLQUN0RDtJQUNELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQyxFQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgVXNlciBmcm9tICcuLi8uLi9qcy9tb2RlbC9Vc2VyJ1xuaW1wb3J0IE1ldGFjYXJkVHlwZUpTT04gZnJvbSAnLi9tZXRhY2FyZHR5cGUnXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IFBsYXRmb3JtQ29uZmlnIGZyb20gJy4vbWV0YWNhcmR0eXBlJ1xuaW1wb3J0IERhdGF0eXBlSlNPTiBmcm9tICcuL2RhdGF0eXBlJ1xuaW1wb3J0IFNvdXJjZXMgZnJvbSAnLi9zb3VyY2VzJ1xuaW1wb3J0IEVudW1lcmF0aW9ucyBmcm9tICcuL2VudW1lcmF0aW9ucydcbmltcG9ydCB7IFN0YXJ0dXBQYXlsb2FkVHlwZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cC50eXBlcydcblxuY29uc3QgbW9ja1N0YXJ0dXBQYXlsb2FkOiBTdGFydHVwUGF5bG9hZFR5cGUgPSB7XG4gIGhhcnZlc3RlZFNvdXJjZXM6IFtdLFxuICBhdHRyaWJ1dGVNYXA6IHtcbiAgICBpZDogeyBpZDogJ2lkJywgaXNJbmplY3RlZDogZmFsc2UsIG11bHRpdmFsdWVkOiBmYWxzZSwgdHlwZTogJ1NUUklORycgfSxcbiAgICBuYW1lOiB7IGlkOiAnbmFtZScsIGlzSW5qZWN0ZWQ6IGZhbHNlLCBtdWx0aXZhbHVlZDogZmFsc2UsIHR5cGU6ICdTVFJJTkcnIH0sXG4gICAgYWdlOiB7IGlkOiAnYWdlJywgaXNJbmplY3RlZDogZmFsc2UsIG11bHRpdmFsdWVkOiBmYWxzZSwgdHlwZTogJ0ZMT0FUJyB9LFxuICB9LFxuICBjb25maWc6IHtcbiAgICBleHRyYToge30sXG4gICAgYXR0cmlidXRlRGVzY3JpcHRpb25zOiBbXSxcbiAgICBiYXNpY1NlYXJjaFRlbXBvcmFsU2VsZWN0aW9uRGVmYXVsdDogWydjcmVhdGVkJ10sXG4gICAgbWFwSG9tZTogJ2hvbWUnLFxuICAgIHJlc3VsdENvdW50OiAxMCxcbiAgICBzaG93TG9nbzogdHJ1ZSxcbiAgICByZWxldmFuY2VQcmVjaXNpb246IDAuODUsXG4gICAgYnJhbmRpbmc6ICdNeSBDb21wYW55JyxcbiAgICBiYXNpY1NlYXJjaE1hdGNoVHlwZTogJ2V4YWN0JyxcbiAgICBvbmxpbmVHYXpldHRlZXI6IHRydWUsXG4gICAgaW1hZ2VyeVByb3ZpZGVyczogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnd21zJyxcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly93bXMuZXhhbXBsZS5jb20nLFxuICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgaW1hZ2VTaXplOiBbMTAyNCwgMTAyNF0sXG4gICAgICAgIH0sXG4gICAgICAgIGFscGhhOiAwLjcsXG4gICAgICAgIG5hbWU6ICdFeGFtcGxlIFdNUycsXG4gICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgIHByb3h5RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDEsXG4gICAgICB9LFxuICAgICAgLy8gQWRkIG1vcmUgaW1hZ2VyeSBwcm92aWRlcnMgYXMgbmVlZGVkXG4gICAgXSxcbiAgICBpc0NhY2hlRGlzYWJsZWQ6IGZhbHNlLFxuICAgIGlzQ3VzdG9tVGV4dE5vdGF0aW9uRW5hYmxlZDogdHJ1ZSxcbiAgICBpc1ZlcnNpb25pbmdFbmFibGVkOiB0cnVlLFxuICAgIGlzU3BlbGxjaGVja0VuYWJsZWQ6IHRydWUsXG4gICAgYXR0cmlidXRlU3VnZ2VzdGlvbkxpc3Q6IFtdLFxuICAgIHJlcXVpcmVkRXhwb3J0QXR0cmlidXRlczogW10sXG4gICAgZXhwb3J0TWV0YWNhcmRGb3JtYXRPcHRpb25zOiBbXSxcbiAgICBleHBvcnRNZXRhY2FyZHNGb3JtYXRPcHRpb25zOiBbXSxcbiAgICBzdW1tYXJ5U2hvdzogWyduYW1lJywgJ2FnZSddLFxuICAgIHJlYWRPbmx5OiBbXSxcbiAgICB2ZXJzaW9uOiAnMS4yLjMnLFxuICAgIGNvbW1vbkF0dHJpYnV0ZXM6IFsnaWQnLCAnbmFtZScsICdhZ2UnXSxcbiAgICBpMThuOiB7XG4gICAgICBncmVldGluZzogJ0hlbGxvIScsXG4gICAgICB3ZWxjb21lTWVzc2FnZTogJ1dlbGNvbWUgdG8gb3VyIGFwcCEnLFxuICAgICAgLy8gQWRkIG1vcmUgbG9jYWxpemVkIHN0cmluZ3MgYXMgbmVlZGVkXG4gICAgfSxcbiAgICBjdXN0b21UZXh0Tm90YXRpb25BdHRyaWJ1dGU6ICdub3RlJyxcbiAgICBpc0V4cGVyaW1lbnRhbDogZmFsc2UsXG4gICAgc291cmNlUG9sbEludGVydmFsOiAzMDAwMCxcbiAgICByZXF1aXJlZEF0dHJpYnV0ZXM6IFsnbmFtZSddLFxuICAgIHNjaGVkdWxlRnJlcXVlbmN5TGlzdDogWzEsIDUsIDEwLCAzMF0sXG4gICAgZGVmYXVsdFNvdXJjZXM6IFsnc291cmNlLTEnLCAnc291cmNlLTInXSxcbiAgICB0ZXJyYWluUHJvdmlkZXI6IHtcbiAgICAgIHR5cGU6ICdjZXNpdW0nLFxuICAgICAgdXJsOiAnaHR0cHM6Ly90ZXJyYWluLmV4YW1wbGUuY29tJyxcbiAgICB9LFxuICAgIHRvcExlZnRMb2dvU3JjOiAnbG9nby10b3AtbGVmdC5wbmcnLFxuICAgIGhpZGRlbkF0dHJpYnV0ZXM6IFsnYWdlJ10sXG4gICAgdGltZW91dDogMTIwMDAwLFxuICAgIGF0dHJpYnV0ZUFsaWFzZXM6IHtcbiAgICAgIGdpdmVuTmFtZTogJ2ZpcnN0X25hbWUnLFxuICAgICAgZmFtaWx5TmFtZTogJ2xhc3RfbmFtZScsXG4gICAgfSxcbiAgICBpY29uQ29uZmlnOiB7XG4gICAgICB1c2VyOiB7XG4gICAgICAgIGNvZGU6ICcxMjM0JyxcbiAgICAgICAgc2l6ZTogJ2xhcmdlJyxcbiAgICAgICAgY2xhc3NOYW1lOiAndXNlci1pY29uJyxcbiAgICAgICAgZm9udDogJ0ZvbnRBd2Vzb21lJyxcbiAgICAgIH0sXG4gICAgICAvLyBBZGQgbW9yZSBpY29uIGNvbmZpZ3VyYXRpb25zIGFzIG5lZWRlZFxuICAgIH0sXG4gICAgZW51bXM6IHtcbiAgICAgIHN0YXR1czogWydBY3RpdmUnLCAnSW5hY3RpdmUnLCAnUGVuZGluZyddLFxuICAgICAgLy8gQWRkIG1vcmUgZW51bWVyYXRlZCB2YWx1ZXMgYXMgbmVlZGVkXG4gICAgfSxcbiAgICBlZGl0b3JBdHRyaWJ1dGVzOiBbJ2lkJywgJ25hbWUnLCAnYWdlJ10sXG4gICAgcmVzdWx0U2hvdzogWyduYW1lJywgJ2FnZSddLFxuICAgIGRpc2FibGVVbmtub3duRXJyb3JCb3g6IGZhbHNlLFxuICAgIGlzRnV6enlSZXN1bHRzRW5hYmxlZDogdHJ1ZSxcbiAgICB0aGVtZTogJ2RhcmsnLFxuICAgIHByb2plY3Rpb246ICdFUFNHOjQzMjYnLFxuICAgIGRlZmF1bHRMYXlvdXQ6IFtdLFxuICAgIHdlYlNvY2tldHNFbmFibGVkOiB0cnVlLFxuICAgIHNob3dSZWxldmFuY2VTY29yZXM6IHRydWUsXG4gICAgbWVudUljb25TcmM6ICdtZW51LWljb24ucG5nJyxcbiAgICBwcm9kdWN0OiAnTXkgQXdlc29tZSBBcHAnLFxuICAgIHR5cGVOYW1lTWFwcGluZzoge1xuICAgICAgcGVyc29uOiAnUGVyc29uVHlwZScsXG4gICAgICBwbGFjZTogJ1BsYWNlVHlwZScsXG4gICAgfSxcbiAgICB2aXN1YWxpemF0aW9uczogW10sXG4gICAgbGFuZGluZ1BhZ2VCYWNrZ3JvdW5kU3JjOiAnbGFuZGluZy1wYWdlLWJnLnBuZycsXG4gICAgYm90dG9tTGVmdEJhY2tncm91bmRTcmM6ICdib3R0b20tbGVmdC1iZy5wbmcnLFxuICAgIGdhemV0dGVlcjogdHJ1ZSxcbiAgICBpc1Bob25ldGljc0VuYWJsZWQ6IHRydWUsXG4gICAgaGVscFVybDogJ2h0dHBzOi8vaGVscC5leGFtcGxlLmNvbScsXG4gICAgY3VzdG9tQnJhbmRpbmc6ICcjZmYwMGZmJyxcbiAgICBkZWZhdWx0VGFibGVDb2x1bW5zOiBbJ2lkJywgJ25hbWUnXSxcbiAgICBleHBvcnRSZXN1bHRMaW1pdDogMTAwMCxcbiAgICBiaW5nS2V5OiAnQklOR19BUElfS0VZJyxcbiAgICBib3R0b21MZWZ0TG9nb1NyYzogJ2xvZ28tYm90dG9tLWxlZnQucG5nJyxcbiAgICB1c2VIeXBoZW5zSW5VdWlkOiB0cnVlLFxuICAgIGRpc2FibGVMb2NhbENhdGFsb2c6IGZhbHNlLFxuICB9LFxuICBsb2NhbFNvdXJjZUlkOiAnbG9jYWwtc291cmNlLTEnLFxuICBtZXRhY2FyZFR5cGVzOiB7XG4gICAgJ21ldGFjYXJkLXR5cGUtMSc6IHtcbiAgICAgIGlkOiB7IGlkOiAnaWQnLCBpc0luamVjdGVkOiBmYWxzZSwgbXVsdGl2YWx1ZWQ6IGZhbHNlLCB0eXBlOiAnU1RSSU5HJyB9LFxuICAgICAgbmFtZToge1xuICAgICAgICBpZDogJ25hbWUnLFxuICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgIH0sXG4gICAgICBhZ2U6IHsgaWQ6ICdhZ2UnLCBpc0luamVjdGVkOiBmYWxzZSwgbXVsdGl2YWx1ZWQ6IGZhbHNlLCB0eXBlOiAnRkxPQVQnIH0sXG4gICAgfSxcbiAgICAvLyBBZGQgbW9yZSBtZXRhY2FyZCB0eXBlcyBhcyBuZWVkZWRcbiAgfSxcbiAgcGxhdGZvcm1VaUNvbmZpZ3VyYXRpb246IHtcbiAgICBwcm9kdWN0SW1hZ2U6ICdwcm9kdWN0LnBuZycsXG4gICAgdmVuZG9ySW1hZ2U6ICd2ZW5kb3IucG5nJyxcbiAgICBmYXZJY29uOiAnZmF2aWNvbi5pY28nLFxuICAgIGhlYWRlcjogJ015IEF3ZXNvbWUgQXBwJyxcbiAgICBjb2xvcjogJyM0Mjg3ZjUnLFxuICAgIGZvb3RlcjogJ8KpIDIwMjMgTXkgQ29tcGFueS4gQWxsIHJpZ2h0cyByZXNlcnZlZC4nLFxuICAgIGJhY2tncm91bmQ6ICcjZjBmMGYwJyxcbiAgICB0aXRsZTogJ015IFN0YXJ0dXAnLFxuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgdGltZW91dDogNjAwMDAsXG4gIH0sXG4gIHNvcnRlZEF0dHJpYnV0ZXM6IFtcbiAgICB7IGlkOiAnaWQnLCBpc0luamVjdGVkOiBmYWxzZSwgbXVsdGl2YWx1ZWQ6IGZhbHNlLCB0eXBlOiAnU1RSSU5HJyB9LFxuICAgIHsgaWQ6ICduYW1lJywgaXNJbmplY3RlZDogZmFsc2UsIG11bHRpdmFsdWVkOiBmYWxzZSwgdHlwZTogJ1NUUklORycgfSxcbiAgICB7IGlkOiAnYWdlJywgaXNJbmplY3RlZDogZmFsc2UsIG11bHRpdmFsdWVkOiBmYWxzZSwgdHlwZTogJ0ZMT0FUJyB9LFxuICBdLFxuICBzb3VyY2VzOiBbXG4gICAge1xuICAgICAgc291cmNlQWN0aW9uczogW10sXG4gICAgICBhdmFpbGFibGU6IHRydWUsXG4gICAgICBpZDogJ3NvdXJjZS0xJyxcbiAgICAgIGNvbnRlbnRUeXBlczogW3sgbmFtZTogJ1R5cGUgQScsIHZlcnNpb246ICcxLjAnIH1dLFxuICAgICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICAgIGxvY2FsOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgc291cmNlQWN0aW9uczogW10sXG4gICAgICBhdmFpbGFibGU6IHRydWUsXG4gICAgICBpZDogJ3NvdXJjZS0yJyxcbiAgICAgIGNvbnRlbnRUeXBlczogW3sgbmFtZTogJ1R5cGUgQicsIHZlcnNpb246ICcyLjAnIH1dLFxuICAgICAgdmVyc2lvbjogJzIuMC4wJyxcbiAgICAgIGxvY2FsOiBmYWxzZSxcbiAgICB9LFxuICAgIC8vIEFkZCBtb3JlIHNvdXJjZXMgYXMgbmVlZGVkXG4gIF0sXG4gIHVzZXI6IHtcbiAgICBlbWFpbDogJ3VzZXJAZXhhbXBsZS5jb20nLFxuICAgIGlzR3Vlc3Q6IGZhbHNlLFxuICAgIHByZWZlcmVuY2VzOiB7XG4gICAgICBpZDogJ3VzZXItMTIzJyxcbiAgICAgIHJlc3VsdERpc3BsYXk6ICd0YWJsZScsXG4gICAgICByZXN1bHRQcmV2aWV3OiBbJ2lkJywgJ25hbWUnXSxcbiAgICAgICdpbnNwZWN0b3ItaGlkZUVtcHR5JzogdHJ1ZSxcbiAgICAgICdpbnNwZWN0b3Itc3VtbWFyeVNob3duJzogWyduYW1lJywgJ2FnZSddLFxuICAgICAgJ2luc3BlY3Rvci1zdW1tYXJ5T3JkZXInOiBbJ25hbWUnLCAnYWdlJ10sXG4gICAgICAnaW5zcGVjdG9yLWRldGFpbHNPcmRlcic6IFsnbmFtZScsICdhZ2UnXSxcbiAgICAgICdpbnNwZWN0b3ItZGV0YWlsc0hpZGRlbic6IFsnaWQnXSxcbiAgICAgICdyZXN1bHRzLWF0dHJpYnV0ZXNTaG93blRhYmxlJzogWydpZCcsICduYW1lJ10sXG4gICAgICAncmVzdWx0cy1hdHRyaWJ1dGVzU2hvd25MaXN0JzogWydpZCcsICduYW1lJywgJ2FnZSddLFxuICAgICAgaG9tZUZpbHRlcjogJycsXG4gICAgICBob21lU29ydDogJ25hbWUnLFxuICAgICAgaG9tZURpc3BsYXk6ICd0YWJsZScsXG4gICAgICBkZWNpbWFsUHJlY2lzaW9uOiAyLFxuICAgICAgYWxlcnRQZXJzaXN0ZW5jZTogdHJ1ZSxcbiAgICAgIGFsZXJ0RXhwaXJhdGlvbjogODY0MDAwMDAsXG4gICAgICB2aXN1YWxpemF0aW9uOiAnbWFwJyxcbiAgICAgIGNvbHVtbkhpZGU6IFtdLFxuICAgICAgY29sdW1uT3JkZXI6IFsnaWQnLCAnbmFtZScsICdhZ2UnXSxcbiAgICAgIGNvbHVtbldpZHRoczogW10sXG4gICAgICBoYXNTZWxlY3RlZENvbHVtbnM6IHRydWUsXG4gICAgICBvYXV0aDogW10sXG4gICAgICBmb250U2l6ZTogMTQsXG4gICAgICBkYXRlVGltZUZvcm1hdDoge1xuICAgICAgICBkYXRldGltZWZtdDogJ1lZWVktTU0tREQgSEg6bW06c3MnLFxuICAgICAgICB0aW1lZm10OiAnSEg6bW06c3MnLFxuICAgICAgfSxcbiAgICAgIHRpbWVab25lOiAnVVRDJyxcbiAgICAgIGNvb3JkaW5hdGVGb3JtYXQ6ICdkZWdyZWVzJyxcbiAgICAgIGF1dG9QYW46IHRydWUsXG4gICAgICBnb2xkZW5MYXlvdXQ6IHtcbiAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICBoYXNIZWFkZXJzOiB0cnVlLFxuICAgICAgICAgIGNvbnN0cmFpbkRyYWdUb0NvbnRhaW5lcjogdHJ1ZSxcbiAgICAgICAgICByZW9yZGVyRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICBzZWxlY3Rpb25FbmFibGVkOiB0cnVlLFxuICAgICAgICAgIHBvcG91dFdob2xlU3RhY2s6IGZhbHNlLFxuICAgICAgICAgIGJsb2NrZWRQb3BvdXRzVGhyb3dFcnJvcjogZmFsc2UsXG4gICAgICAgICAgY2xvc2VQb3BvdXRzT25VbmxvYWQ6IHRydWUsXG4gICAgICAgICAgc2hvd1BvcG91dEljb246IHRydWUsXG4gICAgICAgICAgc2hvd01heGltaXNlSWNvbjogdHJ1ZSxcbiAgICAgICAgICBzaG93Q2xvc2VJY29uOiB0cnVlLFxuICAgICAgICAgIHJlc3BvbnNpdmVNb2RlOiAnYWx3YXlzLW9uJyxcbiAgICAgICAgfSxcbiAgICAgICAgZGltZW5zaW9uczoge1xuICAgICAgICAgIGJvcmRlcldpZHRoOiA1LFxuICAgICAgICAgIG1pbkl0ZW1IZWlnaHQ6IDI1MCxcbiAgICAgICAgICBtaW5JdGVtV2lkdGg6IDMwMCxcbiAgICAgICAgICBoZWFkZXJIZWlnaHQ6IDIwLFxuICAgICAgICAgIGRyYWdQcm94eVdpZHRoOiAzMDAsXG4gICAgICAgICAgZHJhZ1Byb3h5SGVpZ2h0OiAyMDAsXG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsczoge1xuICAgICAgICAgIGNsb3NlOiAnQ2xvc2UnLFxuICAgICAgICAgIG1heGltaXNlOiAnTWF4aW1pemUnLFxuICAgICAgICAgIG1pbmltaXNlOiAnTWluaW1pemUnLFxuICAgICAgICAgIHBvcG91dDogJ1BvcCBPdXQnLFxuICAgICAgICAgIHBvcGluOiAnUG9wIEluJyxcbiAgICAgICAgICB0YWJEcm9wZG93bjogJ0FkZGl0aW9uYWwgVGFicycsXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnQ6IFtdLFxuICAgICAgICBpc0Nsb3NhYmxlOiB0cnVlLFxuICAgICAgICByZW9yZGVyRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6ICdNeSBMYXlvdXQnLFxuICAgICAgICBvcGVuUG9wb3V0czogW10sXG4gICAgICB9LFxuICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgaG92ZXJQcmV2aWV3OiB0cnVlLFxuICAgICAgbGF5b3V0SWQ6ICdsYXlvdXQtMScsXG4gICAgICBtYXBMYXllcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICd3bXMnLFxuICAgICAgICAgIHVybDogJ2h0dHBzOi8vd21zLmV4YW1wbGUuY29tJyxcbiAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICBpbWFnZVNpemU6IFsxMDI0LCAxMDI0XSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFscGhhOiAwLjcsXG4gICAgICAgICAgbmFtZTogJ0V4YW1wbGUgV01TJyxcbiAgICAgICAgICBzaG93OiB0cnVlLFxuICAgICAgICAgIHByb3h5RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICBvcmRlcjogMSxcbiAgICAgICAgICBsYWJlbDogJ1dNUyBMYXllcicsXG4gICAgICAgICAgaWQ6ICd3bXMtMScsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIEFkZCBtb3JlIG1hcCBsYXllcnMgYXMgbmVlZGVkXG4gICAgICBdLFxuICAgICAgYWxlcnRzOiBbXSxcbiAgICAgIHVwbG9hZHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHVuc2VlbjogZmFsc2UsXG4gICAgICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgICAgICBlcnJvcnM6IDAsXG4gICAgICAgICAgc3VjY2Vzc2VzOiAwLFxuICAgICAgICAgIGNvbXBsZXRlOiAwLFxuICAgICAgICAgIGFtb3VudDogMCxcbiAgICAgICAgICBpc3N1ZXM6IDAsXG4gICAgICAgICAgc2VuZGluZzogZmFsc2UsXG4gICAgICAgICAgZmluaXNoZWQ6IGZhbHNlLFxuICAgICAgICAgIGludGVycnVwdGVkOiBmYWxzZSxcbiAgICAgICAgICBzZW50QXQ6IDAsXG4gICAgICAgICAgaWQ6ICd1cGxvYWQtMScsXG4gICAgICAgICAgdXBsb2FkczogW10sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgdGhlbWU6IHtcbiAgICAgICAgcGFsZXR0ZTogJ2xpZ2h0JyxcbiAgICAgICAgdGhlbWU6ICdkZWZhdWx0JyxcbiAgICAgIH0sXG4gICAgICBxdWVyeVNldHRpbmdzOiB7XG4gICAgICAgIHR5cGU6ICdiYXNpYycsXG4gICAgICAgIHNvdXJjZXM6IFsnc291cmNlLTEnXSxcbiAgICAgICAgc29ydHM6IFtcbiAgICAgICAgICB7IGF0dHJpYnV0ZTogJ25hbWUnLCBkaXJlY3Rpb246ICdhc2MnIH0sXG4gICAgICAgICAgeyBhdHRyaWJ1dGU6ICdhZ2UnLCBkaXJlY3Rpb246ICdkZXNjJyB9LFxuICAgICAgICBdLFxuICAgICAgICBzcGVsbGNoZWNrOiB0cnVlLFxuICAgICAgICBwaG9uZXRpY3M6IGZhbHNlLFxuICAgICAgICBhZGRpdGlvbmFsT3B0aW9uczogJ3t9JyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByb2xlczogWyd1c2VyJywgJ2FkbWluJ10sXG4gICAgdXNlcmlkOiAndXNlcjEyMycsXG4gICAgdXNlcm5hbWU6ICd1c2VyMTIzJyxcbiAgfSxcbn1cblxuY29uc3QgbW9ja0RhdGFNYXAgPSB7XG4gICcuL2ludGVybmFsL21ldGFjYXJkdHlwZSc6IE1ldGFjYXJkVHlwZUpTT04sXG4gICcuL2ludGVybmFsL2NvbmZpZyc6IENvbmZpZyxcbiAgJy4vaW50ZXJuYWwvcGxhdGZvcm0vY29uZmlnL3VpJzogUGxhdGZvcm1Db25maWcsXG4gICcuL2ludGVybmFsL2VudW1lcmF0aW9ucy9hdHRyaWJ1dGUvZGF0YXR5cGUnOiBEYXRhdHlwZUpTT04sXG4gICcuL2ludGVybmFsL3VzZXInOiAoVXNlciBhcyBhbnkpLk1vZGVsLnByb3RvdHlwZS5kZWZhdWx0cygpLFxuICAnLi9pbnRlcm5hbC9sb2NhbGNhdGFsb2dpZCc6ICdkZGYuZGlzdHJpYnV0aW9uJyxcbiAgJy4vaW50ZXJuYWwvZm9ybXMvcmVzdWx0JzogW10sXG4gICcuL2ludGVybmFsL2NhdGFsb2cvc291cmNlcyc6IFNvdXJjZXMsXG4gICcuL2ludGVybmFsL2NvbXBvc2Uvc3RhcnR1cCc6IG1vY2tTdGFydHVwUGF5bG9hZCxcbn1cbmNvbnN0IG1vY2tEYXRhR2xvYnMgPSB7XG4gICcuL2ludGVybmFsL2VudW1lcmF0aW9ucyc6IEVudW1lcmF0aW9ucyxcbn1cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDA2KSBGSVhNRTogUGFyYW1ldGVyICd1cmwnIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXG5leHBvcnQgZGVmYXVsdCAodXJsKSA9PiB7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICBsZXQgZGF0YSA9IG1vY2tEYXRhTWFwW3VybF1cbiAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgIE9iamVjdC5rZXlzKG1vY2tEYXRhR2xvYnMpLmZvckVhY2goKGdsb2IpID0+IHtcbiAgICAgIGlmICh1cmwuc3RhcnRzV2l0aChnbG9iKSkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgZGF0YSA9IG1vY2tEYXRhR2xvYnNbZ2xvYl1cbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdXJsICcke3VybH0nIGZvciBtb2NrIGFwaS5gKVxuICB9XG4gIHJldHVybiBkYXRhXG59XG4iXX0=