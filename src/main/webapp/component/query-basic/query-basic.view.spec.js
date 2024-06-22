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
import { expect } from 'chai';
import { constructFilterFromBasicFilter, translateFilterToBasicMap, } from './query-basic.view';
import { FilterBuilderClass, FilterClass, } from '../filter-builder/filter.structure';
import { StartupDataStore } from '../../js/model/Startup/startup';
// function to remove any key with id from an arbitrarily nested object
function removeId(obj) {
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(function (key) {
            if (key === 'id') {
                delete obj[key];
            }
            else {
                removeId(obj[key]);
            }
        });
    }
    return obj;
}
function removeCustomClasses(obj) {
    return JSON.parse(JSON.stringify(obj));
}
describe('verify going back and forth from filter to state in query basic is not lossy or "wrong"', function () {
    it('handles just keyword ', function () {
        if (StartupDataStore.MetacardDefinitions.attributeMap) {
            StartupDataStore.MetacardDefinitions.attributeMap = {
                anyText: {
                    type: 'STRING',
                    id: 'anyText',
                    multivalued: false,
                    isInjected: false,
                },
            };
        }
        var startingFilter = new FilterBuilderClass({
            type: 'AND',
            filters: [
                new FilterClass({
                    type: 'BOOLEAN_TEXT_SEARCH',
                    property: 'anyText',
                    value: {
                        text: 't',
                        cql: "(anyText ILIKE 't')",
                        error: false,
                    },
                    negated: false,
                }),
            ],
            negated: false,
        });
        expect(removeCustomClasses(removeId(constructFilterFromBasicFilter({
            basicFilter: translateFilterToBasicMap(startingFilter).propertyValueMap,
        })))).to.deep.equal(removeCustomClasses(removeId(startingFilter)));
    });
    it('handles just time ', function () {
        if (StartupDataStore.MetacardDefinitions.attributeMap) {
            StartupDataStore.MetacardDefinitions.attributeMap = {
                anyText: {
                    type: 'STRING',
                    id: 'anyText',
                    multivalued: false,
                    isInjected: false,
                },
                created: {
                    type: 'DATE',
                    id: 'created',
                    multivalued: false,
                    isInjected: false,
                },
                effective: {
                    type: 'DATE',
                    id: 'effective',
                    multivalued: false,
                    isInjected: false,
                },
                modified: {
                    type: 'DATE',
                    id: 'modified',
                    multivalued: false,
                    isInjected: false,
                },
                'metacard.created': {
                    type: 'DATE',
                    id: 'metacard.created',
                    multivalued: false,
                    isInjected: false,
                },
                'metacard.modified': {
                    type: 'DATE',
                    id: 'metacard.modified',
                    multivalued: false,
                    isInjected: false,
                },
            };
        }
        var startingFilter = new FilterBuilderClass({
            type: 'AND',
            filters: [
                new FilterClass({
                    type: 'BOOLEAN_TEXT_SEARCH',
                    property: 'anyText',
                    value: {
                        text: 't',
                        cql: "(anyText ILIKE 't')",
                        error: false,
                    },
                    negated: false,
                }),
                new FilterBuilderClass({
                    type: 'OR',
                    filters: [
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'created',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'effective',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'modified',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'metacard.created',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'metacard.modified',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                    ],
                    negated: false,
                }),
            ],
            negated: false,
        });
        expect(removeCustomClasses(removeId(constructFilterFromBasicFilter({
            basicFilter: translateFilterToBasicMap(startingFilter).propertyValueMap,
        })))).to.deep.equal(removeCustomClasses(removeId(startingFilter)));
    });
    it('handles just location ', function () {
        if (StartupDataStore.MetacardDefinitions.attributeMap) {
            StartupDataStore.MetacardDefinitions.attributeMap = {
                anyText: {
                    type: 'STRING',
                    id: 'anyText',
                    multivalued: false,
                    isInjected: false,
                },
                anyGeo: {
                    type: 'LOCATION',
                    id: 'anyGeo',
                    multivalued: false,
                    isInjected: false,
                },
            };
        }
        var startingFilter = new FilterBuilderClass({
            type: 'AND',
            filters: [
                new FilterClass({
                    type: 'BOOLEAN_TEXT_SEARCH',
                    property: 'anyText',
                    value: {
                        text: 't',
                        cql: "(anyText ILIKE 't')",
                        error: false,
                    },
                    negated: false,
                    id: '0.04416459837101705',
                }),
                new FilterClass({
                    type: 'GEOMETRY',
                    property: 'anyGeo',
                    value: {
                        // @ts-ignore
                        locationId: 1713480576078,
                        color: '#8E79DD',
                        drawing: false,
                        dmsNorthDirection: 'N',
                        dmsSouthDirection: 'N',
                        dmsEastDirection: 'E',
                        dmsWestDirection: 'E',
                        radiusUnits: 'meters',
                        radius: 955.1713897900735,
                        locationType: 'dd',
                        prevLocationType: 'dd',
                        lat: 44.352567,
                        lon: -108.13405,
                        dmsLat: '44°21\'09.241"',
                        dmsLon: '108°08\'02.58"',
                        dmsLatDirection: 'N',
                        dmsLonDirection: 'W',
                        usng: '12T YQ 28412 15028',
                        lineWidth: '',
                        lineUnits: 'meters',
                        polygonBufferWidth: '',
                        polygonBufferUnits: 'meters',
                        hasKeyword: false,
                        utmUpsUpperLeftHemisphere: 'Northern',
                        utmUpsUpperLeftZone: 1,
                        utmUpsLowerRightHemisphere: 'Northern',
                        utmUpsLowerRightZone: 1,
                        utmUpsEasting: 728412.2560937542,
                        utmUpsNorthing: 4915028.120213763,
                        utmUpsZone: 12,
                        utmUpsHemisphere: 'Northern',
                        mode: 'circle',
                        type: 'POINTRADIUS',
                    },
                    negated: false,
                }),
            ],
            negated: false,
        });
        expect(removeCustomClasses(removeId(constructFilterFromBasicFilter({
            basicFilter: translateFilterToBasicMap(startingFilter).propertyValueMap,
        })))).to.deep.equal(removeCustomClasses(removeId(startingFilter)));
    });
    it('handles just types but when blank ', function () {
        if (StartupDataStore.MetacardDefinitions.attributeMap) {
            StartupDataStore.MetacardDefinitions.attributeMap = {
                anyText: {
                    type: 'STRING',
                    id: 'anyText',
                    multivalued: false,
                    isInjected: false,
                },
                'reserved.basic-datatype': {
                    type: 'STRING',
                    id: 'reserved.basic-datatype',
                    multivalued: false,
                    isInjected: false,
                },
            };
        }
        var startingFilter = new FilterBuilderClass({
            type: 'AND',
            filters: [
                new FilterClass({
                    type: 'BOOLEAN_TEXT_SEARCH',
                    property: 'anyText',
                    value: {
                        text: 't',
                        cql: "(anyText ILIKE 't')",
                        error: false,
                    },
                    negated: false,
                }),
                new FilterClass({
                    type: 'ILIKE',
                    property: 'reserved.basic-datatype',
                    value: [],
                    negated: false,
                }),
            ],
            negated: false,
        });
        expect(removeCustomClasses(removeId(constructFilterFromBasicFilter({
            basicFilter: translateFilterToBasicMap(startingFilter).propertyValueMap,
        })))).to.deep.equal(removeCustomClasses(removeId(startingFilter)));
    });
    it('handles just types when types are filled out ', function () {
        if (StartupDataStore.MetacardDefinitions.attributeMap) {
            StartupDataStore.MetacardDefinitions.attributeMap = {
                anyText: {
                    type: 'STRING',
                    id: 'anyText',
                    multivalued: false,
                    isInjected: false,
                },
                'reserved.basic-datatype': {
                    type: 'STRING',
                    id: 'reserved.basic-datatype',
                    multivalued: false,
                    isInjected: false,
                },
            };
        }
        var startingFilter = new FilterBuilderClass({
            type: 'AND',
            filters: [
                new FilterClass({
                    type: 'BOOLEAN_TEXT_SEARCH',
                    property: 'anyText',
                    value: {
                        text: 't',
                        cql: "(anyText ILIKE 't')",
                        error: false,
                    },
                    negated: false,
                }),
                new FilterClass({
                    type: 'ILIKE',
                    property: 'reserved.basic-datatype',
                    value: ['Equipment'],
                    negated: false,
                }),
            ],
            negated: false,
        });
        expect(removeCustomClasses(removeId(constructFilterFromBasicFilter({
            basicFilter: translateFilterToBasicMap(startingFilter).propertyValueMap,
        })))).to.deep.equal(removeCustomClasses(removeId(startingFilter)));
    });
    it('handles just types when everything is filled out ', function () {
        if (StartupDataStore.MetacardDefinitions.attributeMap) {
            StartupDataStore.MetacardDefinitions.attributeMap = {
                anyText: {
                    type: 'STRING',
                    id: 'anyText',
                    multivalued: false,
                    isInjected: false,
                },
                anyGeo: {
                    type: 'LOCATION',
                    id: 'anyGeo',
                    multivalued: false,
                    isInjected: false,
                },
                created: {
                    type: 'DATE',
                    id: 'created',
                    multivalued: false,
                    isInjected: false,
                },
                effective: {
                    type: 'DATE',
                    id: 'effective',
                    multivalued: false,
                    isInjected: false,
                },
                modified: {
                    type: 'DATE',
                    id: 'modified',
                    multivalued: false,
                    isInjected: false,
                },
                'metacard.created': {
                    type: 'DATE',
                    id: 'metacard.created',
                    multivalued: false,
                    isInjected: false,
                },
                'metacard.modified': {
                    type: 'DATE',
                    id: 'metacard.modified',
                    multivalued: false,
                    isInjected: false,
                },
                'reserved.basic-datatype': {
                    type: 'STRING',
                    id: 'reserved.basic-datatype',
                    multivalued: false,
                    isInjected: false,
                },
            };
        }
        var startingFilter = new FilterBuilderClass({
            type: 'AND',
            filters: [
                new FilterClass({
                    type: 'BOOLEAN_TEXT_SEARCH',
                    property: 'anyText',
                    value: {
                        text: 't',
                        cql: "(anyText ILIKE 't')",
                        error: false,
                    },
                    negated: false,
                }),
                new FilterBuilderClass({
                    type: 'OR',
                    filters: [
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'created',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'effective',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'modified',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'metacard.created',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                        new FilterClass({
                            type: 'BEFORE',
                            property: 'metacard.modified',
                            value: '2024-04-18T22:39:05.946Z',
                            negated: false,
                        }),
                    ],
                    negated: false,
                }),
                new FilterClass({
                    type: 'GEOMETRY',
                    property: 'anyGeo',
                    value: {
                        // @ts-ignore
                        locationId: 1713480576078,
                        color: '#8E79DD',
                        drawing: false,
                        dmsNorthDirection: 'N',
                        dmsSouthDirection: 'N',
                        dmsEastDirection: 'E',
                        dmsWestDirection: 'E',
                        radiusUnits: 'meters',
                        radius: 955.1713897900735,
                        locationType: 'dd',
                        prevLocationType: 'dd',
                        lat: 44.352567,
                        lon: -108.13405,
                        dmsLat: '44°21\'09.241"',
                        dmsLon: '108°08\'02.58"',
                        dmsLatDirection: 'N',
                        dmsLonDirection: 'W',
                        usng: '12T YQ 28412 15028',
                        lineWidth: '',
                        lineUnits: 'meters',
                        polygonBufferWidth: '',
                        polygonBufferUnits: 'meters',
                        hasKeyword: false,
                        utmUpsUpperLeftHemisphere: 'Northern',
                        utmUpsUpperLeftZone: 1,
                        utmUpsLowerRightHemisphere: 'Northern',
                        utmUpsLowerRightZone: 1,
                        utmUpsEasting: 728412.2560937542,
                        utmUpsNorthing: 4915028.120213763,
                        utmUpsZone: 12,
                        utmUpsHemisphere: 'Northern',
                        mode: 'circle',
                        type: 'POINTRADIUS',
                    },
                    negated: false,
                }),
                new FilterClass({
                    type: 'ILIKE',
                    property: 'reserved.basic-datatype',
                    value: ['Equipment'],
                    negated: false,
                }),
            ],
            negated: false,
        });
        var result = removeCustomClasses(removeId(constructFilterFromBasicFilter({
            basicFilter: translateFilterToBasicMap(startingFilter).propertyValueMap,
        })));
        expect(result).to.deep.equal(removeCustomClasses(removeId(startingFilter)));
    });
});
//# sourceMappingURL=query-basic.view.spec.js.map