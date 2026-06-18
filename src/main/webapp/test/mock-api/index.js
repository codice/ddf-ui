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
    './internal/session/invalidate': '/logout?service=test-logout',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvdGVzdC9tb2NrLWFwaS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxJQUFJLE1BQU0scUJBQXFCLENBQUE7QUFDdEMsT0FBTyxnQkFBZ0IsTUFBTSxnQkFBZ0IsQ0FBQTtBQUM3QyxPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUE7QUFDN0IsT0FBTyxjQUFjLE1BQU0sZ0JBQWdCLENBQUE7QUFDM0MsT0FBTyxZQUFZLE1BQU0sWUFBWSxDQUFBO0FBQ3JDLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUMvQixPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUd6QyxJQUFNLGtCQUFrQixHQUF1QjtJQUM3QyxnQkFBZ0IsRUFBRSxFQUFFO0lBQ3BCLFlBQVksRUFBRTtRQUNaLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDdkUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUMzRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0tBQ3pFO0lBQ0QsTUFBTSxFQUFFO1FBQ04sS0FBSyxFQUFFLEVBQUU7UUFDVCxxQkFBcUIsRUFBRSxFQUFFO1FBQ3pCLG1DQUFtQyxFQUFFLENBQUMsU0FBUyxDQUFDO1FBQ2hELE9BQU8sRUFBRSxNQUFNO1FBQ2YsV0FBVyxFQUFFLEVBQUU7UUFDZixRQUFR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QUUsRUFBRTtJQUM3Qiw0QkFBNEIsRUFBRSxPQUFPO0lBQ3JDLDRCQUE0QixFQUFFLGtCQUFrQjtDQUNqRCxDQUFBO0FBQ0QsSUFBTSxhQUFhLEdBQUc7SUFDcEIseUJBQXlCLEVBQUUsWUFBWTtJQUN2QywrQkFBK0IsRUFBRSw2QkFBNkI7Q0FDL0QsQ0FBQTtBQUNELHlGQUF5RjtBQUN6RixnQkFBZSxVQUFDLEdBQUc7SUFDakIsbUpBQW1KO0lBQ25KLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUMzQixJQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7WUFDdEMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLG1KQUFtSjtnQkFDbkosSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM1QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBZ0IsR0FBRyxvQkFBaUIsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQTtBQUNiLENBQUMsRUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFVzZXIgZnJvbSAnLi4vLi4vanMvbW9kZWwvVXNlcidcbmltcG9ydCBNZXRhY2FyZFR5cGVKU09OIGZyb20gJy4vbWV0YWNhcmR0eXBlJ1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL2NvbmZpZydcbmltcG9ydCBQbGF0Zm9ybUNvbmZpZyBmcm9tICcuL21ldGFjYXJkdHlwZSdcbmltcG9ydCBEYXRhdHlwZUpTT04gZnJvbSAnLi9kYXRhdHlwZSdcbmltcG9ydCBTb3VyY2VzIGZyb20gJy4vc291cmNlcydcbmltcG9ydCBFbnVtZXJhdGlvbnMgZnJvbSAnLi9lbnVtZXJhdGlvbnMnXG5pbXBvcnQgeyBTdGFydHVwUGF5bG9hZFR5cGUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAudHlwZXMnXG5cbmNvbnN0IG1vY2tTdGFydHVwUGF5bG9hZDogU3RhcnR1cFBheWxvYWRUeXBlID0ge1xuICBoYXJ2ZXN0ZWRTb3VyY2VzOiBbXSxcbiAgYXR0cmlidXRlTWFwOiB7XG4gICAgaWQ6IHsgaWQ6ICdpZCcsIGlzSW5qZWN0ZWQ6IGZhbHNlLCBtdWx0aXZhbHVlZDogZmFsc2UsIHR5cGU6ICdTVFJJTkcnIH0sXG4gICAgbmFtZTogeyBpZDogJ25hbWUnLCBpc0luamVjdGVkOiBmYWxzZSwgbXVsdGl2YWx1ZWQ6IGZhbHNlLCB0eXBlOiAnU1RSSU5HJyB9LFxuICAgIGFnZTogeyBpZDogJ2FnZScsIGlzSW5qZWN0ZWQ6IGZhbHNlLCBtdWx0aXZhbHVlZDogZmFsc2UsIHR5cGU6ICdGTE9BVCcgfSxcbiAgfSxcbiAgY29uZmlnOiB7XG4gICAgZXh0cmE6IHt9LFxuICAgIGF0dHJpYnV0ZURlc2NyaXB0aW9uczogW10sXG4gICAgYmFzaWNTZWFyY2hUZW1wb3JhbFNlbGVjdGlvbkRlZmF1bHQ6IFsnY3JlYXRlZCddLFxuICAgIG1hcEhvbWU6ICdob21lJyxcbiAgICByZXN1bHRDb3VudDogMTAsXG4gICAgc2hvd0xvZ286IHRydWUsXG4gICAgcmVsZXZhbmNlUHJlY2lzaW9uOiAwLjg1LFxuICAgIGJyYW5kaW5nOiAnTXkgQ29tcGFueScsXG4gICAgYmFzaWNTZWFyY2hNYXRjaFR5cGU6ICdleGFjdCcsXG4gICAgb25saW5lR2F6ZXR0ZWVyOiB0cnVlLFxuICAgIGltYWdlcnlQcm92aWRlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3dtcycsXG4gICAgICAgIHVybDogJ2h0dHBzOi8vd21zLmV4YW1wbGUuY29tJyxcbiAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgIGltYWdlU2l6ZTogWzEwMjQsIDEwMjRdLFxuICAgICAgICB9LFxuICAgICAgICBhbHBoYTogMC43LFxuICAgICAgICBuYW1lOiAnRXhhbXBsZSBXTVMnLFxuICAgICAgICBzaG93OiB0cnVlLFxuICAgICAgICBwcm94eUVuYWJsZWQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxLFxuICAgICAgfSxcbiAgICAgIC8vIEFkZCBtb3JlIGltYWdlcnkgcHJvdmlkZXJzIGFzIG5lZWRlZFxuICAgIF0sXG4gICAgaXNDYWNoZURpc2FibGVkOiBmYWxzZSxcbiAgICBpc0N1c3RvbVRleHROb3RhdGlvbkVuYWJsZWQ6IHRydWUsXG4gICAgaXNWZXJzaW9uaW5nRW5hYmxlZDogdHJ1ZSxcbiAgICBpc1NwZWxsY2hlY2tFbmFibGVkOiB0cnVlLFxuICAgIGF0dHJpYnV0ZVN1Z2dlc3Rpb25MaXN0OiBbXSxcbiAgICByZXF1aXJlZEV4cG9ydEF0dHJpYnV0ZXM6IFtdLFxuICAgIGV4cG9ydE1ldGFjYXJkRm9ybWF0T3B0aW9uczogW10sXG4gICAgZXhwb3J0TWV0YWNhcmRzRm9ybWF0T3B0aW9uczogW10sXG4gICAgc3VtbWFyeVNob3c6IFsnbmFtZScsICdhZ2UnXSxcbiAgICByZWFkT25seTogW10sXG4gICAgdmVyc2lvbjogJzEuMi4zJyxcbiAgICBjb21tb25BdHRyaWJ1dGVzOiBbJ2lkJywgJ25hbWUnLCAnYWdlJ10sXG4gICAgaTE4bjoge1xuICAgICAgZ3JlZXRpbmc6ICdIZWxsbyEnLFxuICAgICAgd2VsY29tZU1lc3NhZ2U6ICdXZWxjb21lIHRvIG91ciBhcHAhJyxcbiAgICAgIC8vIEFkZCBtb3JlIGxvY2FsaXplZCBzdHJpbmdzIGFzIG5lZWRlZFxuICAgIH0sXG4gICAgY3VzdG9tVGV4dE5vdGF0aW9uQXR0cmlidXRlOiAnbm90ZScsXG4gICAgaXNFeHBlcmltZW50YWw6IGZhbHNlLFxuICAgIHNvdXJjZVBvbGxJbnRlcnZhbDogMzAwMDAsXG4gICAgcmVxdWlyZWRBdHRyaWJ1dGVzOiBbJ25hbWUnXSxcbiAgICBzY2hlZHVsZUZyZXF1ZW5jeUxpc3Q6IFsxLCA1LCAxMCwgMzBdLFxuICAgIGRlZmF1bHRTb3VyY2VzOiBbJ3NvdXJjZS0xJywgJ3NvdXJjZS0yJ10sXG4gICAgdGVycmFpblByb3ZpZGVyOiB7XG4gICAgICB0eXBlOiAnY2VzaXVtJyxcbiAgICAgIHVybDogJ2h0dHBzOi8vdGVycmFpbi5leGFtcGxlLmNvbScsXG4gICAgfSxcbiAgICB0b3BMZWZ0TG9nb1NyYzogJ2xvZ28tdG9wLWxlZnQucG5nJyxcbiAgICBoaWRkZW5BdHRyaWJ1dGVzOiBbJ2FnZSddLFxuICAgIHRpbWVvdXQ6IDEyMDAwMCxcbiAgICBhdHRyaWJ1dGVBbGlhc2VzOiB7XG4gICAgICBnaXZlbk5hbWU6ICdmaXJzdF9uYW1lJyxcbiAgICAgIGZhbWlseU5hbWU6ICdsYXN0X25hbWUnLFxuICAgIH0sXG4gICAgaWNvbkNvbmZpZzoge1xuICAgICAgdXNlcjoge1xuICAgICAgICBjb2RlOiAnMTIzNCcsXG4gICAgICAgIHNpemU6ICdsYXJnZScsXG4gICAgICAgIGNsYXNzTmFtZTogJ3VzZXItaWNvbicsXG4gICAgICAgIGZvbnQ6ICdGb250QXdlc29tZScsXG4gICAgICB9LFxuICAgICAgLy8gQWRkIG1vcmUgaWNvbiBjb25maWd1cmF0aW9ucyBhcyBuZWVkZWRcbiAgICB9LFxuICAgIGVudW1zOiB7XG4gICAgICBzdGF0dXM6IFsnQWN0aXZlJywgJ0luYWN0aXZlJywgJ1BlbmRpbmcnXSxcbiAgICAgIC8vIEFkZCBtb3JlIGVudW1lcmF0ZWQgdmFsdWVzIGFzIG5lZWRlZFxuICAgIH0sXG4gICAgZWRpdG9yQXR0cmlidXRlczogWydpZCcsICduYW1lJywgJ2FnZSddLFxuICAgIHJlc3VsdFNob3c6IFsnbmFtZScsICdhZ2UnXSxcbiAgICBkaXNhYmxlVW5rbm93bkVycm9yQm94OiBmYWxzZSxcbiAgICBpc0Z1enp5UmVzdWx0c0VuYWJsZWQ6IHRydWUsXG4gICAgdGhlbWU6ICdkYXJrJyxcbiAgICBwcm9qZWN0aW9uOiAnRVBTRzo0MzI2JyxcbiAgICBkZWZhdWx0TGF5b3V0OiBbXSxcbiAgICB3ZWJTb2NrZXRzRW5hYmxlZDogdHJ1ZSxcbiAgICBzaG93UmVsZXZhbmNlU2NvcmVzOiB0cnVlLFxuICAgIG1lbnVJY29uU3JjOiAnbWVudS1pY29uLnBuZycsXG4gICAgcHJvZHVjdDogJ015IEF3ZXNvbWUgQXBwJyxcbiAgICB0eXBlTmFtZU1hcHBpbmc6IHtcbiAgICAgIHBlcnNvbjogJ1BlcnNvblR5cGUnLFxuICAgICAgcGxhY2U6ICdQbGFjZVR5cGUnLFxuICAgIH0sXG4gICAgdmlzdWFsaXphdGlvbnM6IFtdLFxuICAgIGxhbmRpbmdQYWdlQmFja2dyb3VuZFNyYzogJ2xhbmRpbmctcGFnZS1iZy5wbmcnLFxuICAgIGJvdHRvbUxlZnRCYWNrZ3JvdW5kU3JjOiAnYm90dG9tLWxlZnQtYmcucG5nJyxcbiAgICBnYXpldHRlZXI6IHRydWUsXG4gICAgaXNQaG9uZXRpY3NFbmFibGVkOiB0cnVlLFxuICAgIGhlbHBVcmw6ICdodHRwczovL2hlbHAuZXhhbXBsZS5jb20nLFxuICAgIGN1c3RvbUJyYW5kaW5nOiAnI2ZmMDBmZicsXG4gICAgZGVmYXVsdFRhYmxlQ29sdW1uczogWydpZCcsICduYW1lJ10sXG4gICAgZXhwb3J0UmVzdWx0TGltaXQ6IDEwMDAsXG4gICAgYmluZ0tleTogJ0JJTkdfQVBJX0tFWScsXG4gICAgYm90dG9tTGVmdExvZ29TcmM6ICdsb2dvLWJvdHRvbS1sZWZ0LnBuZycsXG4gICAgdXNlSHlwaGVuc0luVXVpZDogdHJ1ZSxcbiAgICBkaXNhYmxlTG9jYWxDYXRhbG9nOiBmYWxzZSxcbiAgfSxcbiAgbG9jYWxTb3VyY2VJZDogJ2xvY2FsLXNvdXJjZS0xJyxcbiAgbWV0YWNhcmRUeXBlczoge1xuICAgICdtZXRhY2FyZC10eXBlLTEnOiB7XG4gICAgICBpZDogeyBpZDogJ2lkJywgaXNJbmplY3RlZDogZmFsc2UsIG11bHRpdmFsdWVkOiBmYWxzZSwgdHlwZTogJ1NUUklORycgfSxcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgaWQ6ICduYW1lJyxcbiAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICB9LFxuICAgICAgYWdlOiB7IGlkOiAnYWdlJywgaXNJbmplY3RlZDogZmFsc2UsIG11bHRpdmFsdWVkOiBmYWxzZSwgdHlwZTogJ0ZMT0FUJyB9LFxuICAgIH0sXG4gICAgLy8gQWRkIG1vcmUgbWV0YWNhcmQgdHlwZXMgYXMgbmVlZGVkXG4gIH0sXG4gIHBsYXRmb3JtVWlDb25maWd1cmF0aW9uOiB7XG4gICAgcHJvZHVjdEltYWdlOiAncHJvZHVjdC5wbmcnLFxuICAgIHZlbmRvckltYWdlOiAndmVuZG9yLnBuZycsXG4gICAgZmF2SWNvbjogJ2Zhdmljb24uaWNvJyxcbiAgICBoZWFkZXI6ICdNeSBBd2Vzb21lIEFwcCcsXG4gICAgY29sb3I6ICcjNDI4N2Y1JyxcbiAgICBmb290ZXI6ICfCqSAyMDIzIE15IENvbXBhbnkuIEFsbCByaWdodHMgcmVzZXJ2ZWQuJyxcbiAgICBiYWNrZ3JvdW5kOiAnI2YwZjBmMCcsXG4gICAgdGl0bGU6ICdNeSBTdGFydHVwJyxcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgIHRpbWVvdXQ6IDYwMDAwLFxuICB9LFxuICBzb3J0ZWRBdHRyaWJ1dGVzOiBbXG4gICAgeyBpZDogJ2lkJywgaXNJbmplY3RlZDogZmFsc2UsIG11bHRpdmFsdWVkOiBmYWxzZSwgdHlwZTogJ1NUUklORycgfSxcbiAgICB7IGlkOiAnbmFtZScsIGlzSW5qZWN0ZWQ6IGZhbHNlLCBtdWx0aXZhbHVlZDogZmFsc2UsIHR5cGU6ICdTVFJJTkcnIH0sXG4gICAgeyBpZDogJ2FnZScsIGlzSW5qZWN0ZWQ6IGZhbHNlLCBtdWx0aXZhbHVlZDogZmFsc2UsIHR5cGU6ICdGTE9BVCcgfSxcbiAgXSxcbiAgc291cmNlczogW1xuICAgIHtcbiAgICAgIHNvdXJjZUFjdGlvbnM6IFtdLFxuICAgICAgYXZhaWxhYmxlOiB0cnVlLFxuICAgICAgaWQ6ICdzb3VyY2UtMScsXG4gICAgICBjb250ZW50VHlwZXM6IFt7IG5hbWU6ICdUeXBlIEEnLCB2ZXJzaW9uOiAnMS4wJyB9XSxcbiAgICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgICBsb2NhbDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHNvdXJjZUFjdGlvbnM6IFtdLFxuICAgICAgYXZhaWxhYmxlOiB0cnVlLFxuICAgICAgaWQ6ICdzb3VyY2UtMicsXG4gICAgICBjb250ZW50VHlwZXM6IFt7IG5hbWU6ICdUeXBlIEInLCB2ZXJzaW9uOiAnMi4wJyB9XSxcbiAgICAgIHZlcnNpb246ICcyLjAuMCcsXG4gICAgICBsb2NhbDogZmFsc2UsXG4gICAgfSxcbiAgICAvLyBBZGQgbW9yZSBzb3VyY2VzIGFzIG5lZWRlZFxuICBdLFxuICB1c2VyOiB7XG4gICAgZW1haWw6ICd1c2VyQGV4YW1wbGUuY29tJyxcbiAgICBpc0d1ZXN0OiBmYWxzZSxcbiAgICBwcmVmZXJlbmNlczoge1xuICAgICAgaWQ6ICd1c2VyLTEyMycsXG4gICAgICByZXN1bHREaXNwbGF5OiAndGFibGUnLFxuICAgICAgcmVzdWx0UHJldmlldzogWydpZCcsICduYW1lJ10sXG4gICAgICAnaW5zcGVjdG9yLWhpZGVFbXB0eSc6IHRydWUsXG4gICAgICAnaW5zcGVjdG9yLXN1bW1hcnlTaG93bic6IFsnbmFtZScsICdhZ2UnXSxcbiAgICAgICdpbnNwZWN0b3Itc3VtbWFyeU9yZGVyJzogWyduYW1lJywgJ2FnZSddLFxuICAgICAgJ2luc3BlY3Rvci1kZXRhaWxzT3JkZXInOiBbJ25hbWUnLCAnYWdlJ10sXG4gICAgICAnaW5zcGVjdG9yLWRldGFpbHNIaWRkZW4nOiBbJ2lkJ10sXG4gICAgICAncmVzdWx0cy1hdHRyaWJ1dGVzU2hvd25UYWJsZSc6IFsnaWQnLCAnbmFtZSddLFxuICAgICAgJ3Jlc3VsdHMtYXR0cmlidXRlc1Nob3duTGlzdCc6IFsnaWQnLCAnbmFtZScsICdhZ2UnXSxcbiAgICAgIGhvbWVGaWx0ZXI6ICcnLFxuICAgICAgaG9tZVNvcnQ6ICduYW1lJyxcbiAgICAgIGhvbWVEaXNwbGF5OiAndGFibGUnLFxuICAgICAgZGVjaW1hbFByZWNpc2lvbjogMixcbiAgICAgIGFsZXJ0UGVyc2lzdGVuY2U6IHRydWUsXG4gICAgICBhbGVydEV4cGlyYXRpb246IDg2NDAwMDAwLFxuICAgICAgdmlzdWFsaXphdGlvbjogJ21hcCcsXG4gICAgICBjb2x1bW5IaWRlOiBbXSxcbiAgICAgIGNvbHVtbk9yZGVyOiBbJ2lkJywgJ25hbWUnLCAnYWdlJ10sXG4gICAgICBjb2x1bW5XaWR0aHM6IFtdLFxuICAgICAgaGFzU2VsZWN0ZWRDb2x1bW5zOiB0cnVlLFxuICAgICAgb2F1dGg6IFtdLFxuICAgICAgZm9udFNpemU6IDE0LFxuICAgICAgZGF0ZVRpbWVGb3JtYXQ6IHtcbiAgICAgICAgZGF0ZXRpbWVmbXQ6ICdZWVlZLU1NLUREIEhIOm1tOnNzJyxcbiAgICAgICAgdGltZWZtdDogJ0hIOm1tOnNzJyxcbiAgICAgIH0sXG4gICAgICB0aW1lWm9uZTogJ1VUQycsXG4gICAgICBjb29yZGluYXRlRm9ybWF0OiAnZGVncmVlcycsXG4gICAgICBhdXRvUGFuOiB0cnVlLFxuICAgICAgZ29sZGVuTGF5b3V0OiB7XG4gICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgaGFzSGVhZGVyczogdHJ1ZSxcbiAgICAgICAgICBjb25zdHJhaW5EcmFnVG9Db250YWluZXI6IHRydWUsXG4gICAgICAgICAgcmVvcmRlckVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgc2VsZWN0aW9uRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICBwb3BvdXRXaG9sZVN0YWNrOiBmYWxzZSxcbiAgICAgICAgICBibG9ja2VkUG9wb3V0c1Rocm93RXJyb3I6IGZhbHNlLFxuICAgICAgICAgIGNsb3NlUG9wb3V0c09uVW5sb2FkOiB0cnVlLFxuICAgICAgICAgIHNob3dQb3BvdXRJY29uOiB0cnVlLFxuICAgICAgICAgIHNob3dNYXhpbWlzZUljb246IHRydWUsXG4gICAgICAgICAgc2hvd0Nsb3NlSWNvbjogdHJ1ZSxcbiAgICAgICAgICByZXNwb25zaXZlTW9kZTogJ2Fsd2F5cy1vbicsXG4gICAgICAgIH0sXG4gICAgICAgIGRpbWVuc2lvbnM6IHtcbiAgICAgICAgICBib3JkZXJXaWR0aDogNSxcbiAgICAgICAgICBtaW5JdGVtSGVpZ2h0OiAyNTAsXG4gICAgICAgICAgbWluSXRlbVdpZHRoOiAzMDAsXG4gICAgICAgICAgaGVhZGVySGVpZ2h0OiAyMCxcbiAgICAgICAgICBkcmFnUHJveHlXaWR0aDogMzAwLFxuICAgICAgICAgIGRyYWdQcm94eUhlaWdodDogMjAwLFxuICAgICAgICB9LFxuICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICBjbG9zZTogJ0Nsb3NlJyxcbiAgICAgICAgICBtYXhpbWlzZTogJ01heGltaXplJyxcbiAgICAgICAgICBtaW5pbWlzZTogJ01pbmltaXplJyxcbiAgICAgICAgICBwb3BvdXQ6ICdQb3AgT3V0JyxcbiAgICAgICAgICBwb3BpbjogJ1BvcCBJbicsXG4gICAgICAgICAgdGFiRHJvcGRvd246ICdBZGRpdGlvbmFsIFRhYnMnLFxuICAgICAgICB9LFxuICAgICAgICBjb250ZW50OiBbXSxcbiAgICAgICAgaXNDbG9zYWJsZTogdHJ1ZSxcbiAgICAgICAgcmVvcmRlckVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRpdGxlOiAnTXkgTGF5b3V0JyxcbiAgICAgICAgb3BlblBvcG91dHM6IFtdLFxuICAgICAgfSxcbiAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgIGhvdmVyUHJldmlldzogdHJ1ZSxcbiAgICAgIGxheW91dElkOiAnbGF5b3V0LTEnLFxuICAgICAgbWFwTGF5ZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnd21zJyxcbiAgICAgICAgICB1cmw6ICdodHRwczovL3dtcy5leGFtcGxlLmNvbScsXG4gICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgaW1hZ2VTaXplOiBbMTAyNCwgMTAyNF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhbHBoYTogMC43LFxuICAgICAgICAgIG5hbWU6ICdFeGFtcGxlIFdNUycsXG4gICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICBwcm94eUVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgb3JkZXI6IDEsXG4gICAgICAgICAgbGFiZWw6ICdXTVMgTGF5ZXInLFxuICAgICAgICAgIGlkOiAnd21zLTEnLFxuICAgICAgICB9LFxuICAgICAgICAvLyBBZGQgbW9yZSBtYXAgbGF5ZXJzIGFzIG5lZWRlZFxuICAgICAgXSxcbiAgICAgIGFsZXJ0czogW10sXG4gICAgICB1cGxvYWRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB1bnNlZW46IGZhbHNlLFxuICAgICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgZXJyb3JzOiAwLFxuICAgICAgICAgIHN1Y2Nlc3NlczogMCxcbiAgICAgICAgICBjb21wbGV0ZTogMCxcbiAgICAgICAgICBhbW91bnQ6IDAsXG4gICAgICAgICAgaXNzdWVzOiAwLFxuICAgICAgICAgIHNlbmRpbmc6IGZhbHNlLFxuICAgICAgICAgIGZpbmlzaGVkOiBmYWxzZSxcbiAgICAgICAgICBpbnRlcnJ1cHRlZDogZmFsc2UsXG4gICAgICAgICAgc2VudEF0OiAwLFxuICAgICAgICAgIGlkOiAndXBsb2FkLTEnLFxuICAgICAgICAgIHVwbG9hZHM6IFtdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHRoZW1lOiB7XG4gICAgICAgIHBhbGV0dGU6ICdsaWdodCcsXG4gICAgICAgIHRoZW1lOiAnZGVmYXVsdCcsXG4gICAgICB9LFxuICAgICAgcXVlcnlTZXR0aW5nczoge1xuICAgICAgICB0eXBlOiAnYmFzaWMnLFxuICAgICAgICBzb3VyY2VzOiBbJ3NvdXJjZS0xJ10sXG4gICAgICAgIHNvcnRzOiBbXG4gICAgICAgICAgeyBhdHRyaWJ1dGU6ICduYW1lJywgZGlyZWN0aW9uOiAnYXNjJyB9LFxuICAgICAgICAgIHsgYXR0cmlidXRlOiAnYWdlJywgZGlyZWN0aW9uOiAnZGVzYycgfSxcbiAgICAgICAgXSxcbiAgICAgICAgc3BlbGxjaGVjazogdHJ1ZSxcbiAgICAgICAgcGhvbmV0aWNzOiBmYWxzZSxcbiAgICAgICAgYWRkaXRpb25hbE9wdGlvbnM6ICd7fScsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcm9sZXM6IFsndXNlcicsICdhZG1pbiddLFxuICAgIHVzZXJpZDogJ3VzZXIxMjMnLFxuICAgIHVzZXJuYW1lOiAndXNlcjEyMycsXG4gIH0sXG59XG5cbmNvbnN0IG1vY2tEYXRhTWFwID0ge1xuICAnLi9pbnRlcm5hbC9tZXRhY2FyZHR5cGUnOiBNZXRhY2FyZFR5cGVKU09OLFxuICAnLi9pbnRlcm5hbC9jb25maWcnOiBDb25maWcsXG4gICcuL2ludGVybmFsL3BsYXRmb3JtL2NvbmZpZy91aSc6IFBsYXRmb3JtQ29uZmlnLFxuICAnLi9pbnRlcm5hbC9lbnVtZXJhdGlvbnMvYXR0cmlidXRlL2RhdGF0eXBlJzogRGF0YXR5cGVKU09OLFxuICAnLi9pbnRlcm5hbC91c2VyJzogKFVzZXIgYXMgYW55KS5Nb2RlbC5wcm90b3R5cGUuZGVmYXVsdHMoKSxcbiAgJy4vaW50ZXJuYWwvbG9jYWxjYXRhbG9naWQnOiAnZGRmLmRpc3RyaWJ1dGlvbicsXG4gICcuL2ludGVybmFsL2Zvcm1zL3Jlc3VsdCc6IFtdLFxuICAnLi9pbnRlcm5hbC9jYXRhbG9nL3NvdXJjZXMnOiBTb3VyY2VzLFxuICAnLi9pbnRlcm5hbC9jb21wb3NlL3N0YXJ0dXAnOiBtb2NrU3RhcnR1cFBheWxvYWQsXG59XG5jb25zdCBtb2NrRGF0YUdsb2JzID0ge1xuICAnLi9pbnRlcm5hbC9lbnVtZXJhdGlvbnMnOiBFbnVtZXJhdGlvbnMsXG4gICcuL2ludGVybmFsL3Nlc3Npb24vaW52YWxpZGF0ZSc6ICcvbG9nb3V0P3NlcnZpY2U9dGVzdC1sb2dvdXQnLFxufVxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDYpIEZJWE1FOiBQYXJhbWV0ZXIgJ3VybCcgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZS5cbmV4cG9ydCBkZWZhdWx0ICh1cmwpID0+IHtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gIGxldCBkYXRhID0gbW9ja0RhdGFNYXBbdXJsXVxuICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgT2JqZWN0LmtleXMobW9ja0RhdGFHbG9icykuZm9yRWFjaCgoZ2xvYikgPT4ge1xuICAgICAgaWYgKHVybC5zdGFydHNXaXRoKGdsb2IpKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDUzKSBGSVhNRTogRWxlbWVudCBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlIGJlY2F1c2UgZXhwcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBkYXRhID0gbW9ja0RhdGFHbG9ic1tnbG9iXVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB1cmwgJyR7dXJsfScgZm9yIG1vY2sgYXBpLmApXG4gIH1cbiAgcmV0dXJuIGRhdGFcbn1cbiJdfQ==