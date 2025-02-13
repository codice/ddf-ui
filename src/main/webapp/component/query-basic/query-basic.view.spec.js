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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktYmFzaWMudmlldy5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9xdWVyeS1iYXNpYy9xdWVyeS1iYXNpYy52aWV3LnNwZWMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBQzdCLE9BQU8sRUFDTCw4QkFBOEIsRUFDOUIseUJBQXlCLEdBQzFCLE1BQU0sb0JBQW9CLENBQUE7QUFDM0IsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixXQUFXLEdBQ1osTUFBTSxvQ0FBb0MsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUVqRSx1RUFBdUU7QUFDdkUsU0FBUyxRQUFRLENBQUMsR0FBUTtJQUN4QixJQUFJLEdBQUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHO1lBQzNCLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtnQkFDaEIsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDaEI7aUJBQU07Z0JBQ0wsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO2FBQ25CO1FBQ0gsQ0FBQyxDQUFDLENBQUE7S0FDSDtJQUNELE9BQU8sR0FBRyxDQUFBO0FBQ1osQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQUMsR0FBUTtJQUNuQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQ3hDLENBQUM7QUFFRCxRQUFRLENBQUMseUZBQXlGLEVBQUU7SUFDbEcsRUFBRSxDQUFDLHVCQUF1QixFQUFF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eXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnY2hhaSdcbmltcG9ydCB7XG4gIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcixcbiAgdHJhbnNsYXRlRmlsdGVyVG9CYXNpY01hcCxcbn0gZnJvbSAnLi9xdWVyeS1iYXNpYy52aWV3J1xuaW1wb3J0IHtcbiAgRmlsdGVyQnVpbGRlckNsYXNzLFxuICBGaWx0ZXJDbGFzcyxcbn0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5cbi8vIGZ1bmN0aW9uIHRvIHJlbW92ZSBhbnkga2V5IHdpdGggaWQgZnJvbSBhbiBhcmJpdHJhcmlseSBuZXN0ZWQgb2JqZWN0XG5mdW5jdGlvbiByZW1vdmVJZChvYmo6IGFueSkge1xuICBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmIChrZXkgPT09ICdpZCcpIHtcbiAgICAgICAgZGVsZXRlIG9ialtrZXldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW1vdmVJZChvYmpba2V5XSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ3VzdG9tQ2xhc3NlcyhvYmo6IGFueSkge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKVxufVxuXG5kZXNjcmliZSgndmVyaWZ5IGdvaW5nIGJhY2sgYW5kIGZvcnRoIGZyb20gZmlsdGVyIHRvIHN0YXRlIGluIHF1ZXJ5IGJhc2ljIGlzIG5vdCBsb3NzeSBvciBcIndyb25nXCInLCAoKSA9PiB7XG4gIGl0KCdoYW5kbGVzIGp1c3Qga2V5d29yZCAnLCAoKSA9PiB7XG4gICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5hdHRyaWJ1dGVNYXApIHtcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5hdHRyaWJ1dGVNYXAgPSB7XG4gICAgICAgIGFueVRleHQ6IHtcbiAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICBpZDogJ2FueVRleHQnLFxuICAgICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc3RhcnRpbmdGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgZmlsdGVyczogW1xuICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgIHR5cGU6ICdCT09MRUFOX1RFWFRfU0VBUkNIJyxcbiAgICAgICAgICBwcm9wZXJ0eTogJ2FueVRleHQnLFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICB0ZXh0OiAndCcsXG4gICAgICAgICAgICBjcWw6IFwiKGFueVRleHQgSUxJS0UgJ3QnKVwiLFxuICAgICAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgIH0pXG5cbiAgICBleHBlY3QoXG4gICAgICByZW1vdmVDdXN0b21DbGFzc2VzKFxuICAgICAgICByZW1vdmVJZChcbiAgICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoe1xuICAgICAgICAgICAgYmFzaWNGaWx0ZXI6XG4gICAgICAgICAgICAgIHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAoc3RhcnRpbmdGaWx0ZXIpLnByb3BlcnR5VmFsdWVNYXAsXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICkudG8uZGVlcC5lcXVhbChyZW1vdmVDdXN0b21DbGFzc2VzKHJlbW92ZUlkKHN0YXJ0aW5nRmlsdGVyKSkpXG4gIH0pXG5cbiAgaXQoJ2hhbmRsZXMganVzdCB0aW1lICcsICgpID0+IHtcbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmF0dHJpYnV0ZU1hcCkge1xuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmF0dHJpYnV0ZU1hcCA9IHtcbiAgICAgICAgYW55VGV4dDoge1xuICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgIGlkOiAnYW55VGV4dCcsXG4gICAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiB7XG4gICAgICAgICAgdHlwZTogJ0RBVEUnLFxuICAgICAgICAgIGlkOiAnY3JlYXRlZCcsXG4gICAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBlZmZlY3RpdmU6IHtcbiAgICAgICAgICB0eXBlOiAnREFURScsXG4gICAgICAgICAgaWQ6ICdlZmZlY3RpdmUnLFxuICAgICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgbW9kaWZpZWQ6IHtcbiAgICAgICAgICB0eXBlOiAnREFURScsXG4gICAgICAgICAgaWQ6ICdtb2RpZmllZCcsXG4gICAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICAnbWV0YWNhcmQuY3JlYXRlZCc6IHtcbiAgICAgICAgICB0eXBlOiAnREFURScsXG4gICAgICAgICAgaWQ6ICdtZXRhY2FyZC5jcmVhdGVkJyxcbiAgICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhY2FyZC5tb2RpZmllZCc6IHtcbiAgICAgICAgICB0eXBlOiAnREFURScsXG4gICAgICAgICAgaWQ6ICdtZXRhY2FyZC5tb2RpZmllZCcsXG4gICAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzdGFydGluZ0ZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogJ0FORCcsXG4gICAgICBmaWx0ZXJzOiBbXG4gICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIHRleHQ6ICd0JyxcbiAgICAgICAgICAgIGNxbDogXCIoYW55VGV4dCBJTElLRSAndCcpXCIsXG4gICAgICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgIHR5cGU6ICdPUicsXG4gICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgdHlwZTogJ0JFRk9SRScsXG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnY3JlYXRlZCcsXG4gICAgICAgICAgICAgIHZhbHVlOiAnMjAyNC0wNC0xOFQyMjozOTowNS45NDZaJyxcbiAgICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgIHR5cGU6ICdCRUZPUkUnLFxuICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2VmZmVjdGl2ZScsXG4gICAgICAgICAgICAgIHZhbHVlOiAnMjAyNC0wNC0xOFQyMjozOTowNS45NDZaJyxcbiAgICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgIHR5cGU6ICdCRUZPUkUnLFxuICAgICAgICAgICAgICBwcm9wZXJ0eTogJ21vZGlmaWVkJyxcbiAgICAgICAgICAgICAgdmFsdWU6ICcyMDI0LTA0LTE4VDIyOjM5OjA1Ljk0NlonLFxuICAgICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgdHlwZTogJ0JFRk9SRScsXG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnbWV0YWNhcmQuY3JlYXRlZCcsXG4gICAgICAgICAgICAgIHZhbHVlOiAnMjAyNC0wNC0xOFQyMjozOTowNS45NDZaJyxcbiAgICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgIHR5cGU6ICdCRUZPUkUnLFxuICAgICAgICAgICAgICBwcm9wZXJ0eTogJ21ldGFjYXJkLm1vZGlmaWVkJyxcbiAgICAgICAgICAgICAgdmFsdWU6ICcyMDI0LTA0LTE4VDIyOjM5OjA1Ljk0NlonLFxuICAgICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgIH0pXG5cbiAgICBleHBlY3QoXG4gICAgICByZW1vdmVDdXN0b21DbGFzc2VzKFxuICAgICAgICByZW1vdmVJZChcbiAgICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoe1xuICAgICAgICAgICAgYmFzaWNGaWx0ZXI6XG4gICAgICAgICAgICAgIHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAoc3RhcnRpbmdGaWx0ZXIpLnByb3BlcnR5VmFsdWVNYXAsXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICkudG8uZGVlcC5lcXVhbChyZW1vdmVDdXN0b21DbGFzc2VzKHJlbW92ZUlkKHN0YXJ0aW5nRmlsdGVyKSkpXG4gIH0pXG5cbiAgaXQoJ2hhbmRsZXMganVzdCBsb2NhdGlvbiAnLCAoKSA9PiB7XG4gICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5hdHRyaWJ1dGVNYXApIHtcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5hdHRyaWJ1dGVNYXAgPSB7XG4gICAgICAgIGFueVRleHQ6IHtcbiAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICBpZDogJ2FueVRleHQnLFxuICAgICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgYW55R2VvOiB7XG4gICAgICAgICAgdHlwZTogJ0xPQ0FUSU9OJyxcbiAgICAgICAgICBpZDogJ2FueUdlbycsXG4gICAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzdGFydGluZ0ZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogJ0FORCcsXG4gICAgICBmaWx0ZXJzOiBbXG4gICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIHRleHQ6ICd0JyxcbiAgICAgICAgICAgIGNxbDogXCIoYW55VGV4dCBJTElLRSAndCcpXCIsXG4gICAgICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICBpZDogJzAuMDQ0MTY0NTk4MzcxMDE3MDUnLFxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgbG9jYXRpb25JZDogMTcxMzQ4MDU3NjA3OCxcbiAgICAgICAgICAgIGNvbG9yOiAnIzhFNzlERCcsXG4gICAgICAgICAgICBkcmF3aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGRtc05vcnRoRGlyZWN0aW9uOiAnTicsXG4gICAgICAgICAgICBkbXNTb3V0aERpcmVjdGlvbjogJ04nLFxuICAgICAgICAgICAgZG1zRWFzdERpcmVjdGlvbjogJ0UnLFxuICAgICAgICAgICAgZG1zV2VzdERpcmVjdGlvbjogJ0UnLFxuICAgICAgICAgICAgcmFkaXVzVW5pdHM6ICdtZXRlcnMnLFxuICAgICAgICAgICAgcmFkaXVzOiA5NTUuMTcxMzg5NzkwMDczNSxcbiAgICAgICAgICAgIGxvY2F0aW9uVHlwZTogJ2RkJyxcbiAgICAgICAgICAgIHByZXZMb2NhdGlvblR5cGU6ICdkZCcsXG4gICAgICAgICAgICBsYXQ6IDQ0LjM1MjU2NyxcbiAgICAgICAgICAgIGxvbjogLTEwOC4xMzQwNSxcbiAgICAgICAgICAgIGRtc0xhdDogJzQ0wrAyMVxcJzA5LjI0MVwiJyxcbiAgICAgICAgICAgIGRtc0xvbjogJzEwOMKwMDhcXCcwMi41OFwiJyxcbiAgICAgICAgICAgIGRtc0xhdERpcmVjdGlvbjogJ04nLFxuICAgICAgICAgICAgZG1zTG9uRGlyZWN0aW9uOiAnVycsXG4gICAgICAgICAgICB1c25nOiAnMTJUIFlRIDI4NDEyIDE1MDI4JyxcbiAgICAgICAgICAgIGxpbmVXaWR0aDogJycsXG4gICAgICAgICAgICBsaW5lVW5pdHM6ICdtZXRlcnMnLFxuICAgICAgICAgICAgcG9seWdvbkJ1ZmZlcldpZHRoOiAnJyxcbiAgICAgICAgICAgIHBvbHlnb25CdWZmZXJVbml0czogJ21ldGVycycsXG4gICAgICAgICAgICBoYXNLZXl3b3JkOiBmYWxzZSxcbiAgICAgICAgICAgIHV0bVVwc1VwcGVyTGVmdEhlbWlzcGhlcmU6ICdOb3J0aGVybicsXG4gICAgICAgICAgICB1dG1VcHNVcHBlckxlZnRab25lOiAxLFxuICAgICAgICAgICAgdXRtVXBzTG93ZXJSaWdodEhlbWlzcGhlcmU6ICdOb3J0aGVybicsXG4gICAgICAgICAgICB1dG1VcHNMb3dlclJpZ2h0Wm9uZTogMSxcbiAgICAgICAgICAgIHV0bVVwc0Vhc3Rpbmc6IDcyODQxMi4yNTYwOTM3NTQyLFxuICAgICAgICAgICAgdXRtVXBzTm9ydGhpbmc6IDQ5MTUwMjguMTIwMjEzNzYzLFxuICAgICAgICAgICAgdXRtVXBzWm9uZTogMTIsXG4gICAgICAgICAgICB1dG1VcHNIZW1pc3BoZXJlOiAnTm9ydGhlcm4nLFxuICAgICAgICAgICAgbW9kZTogJ2NpcmNsZScsXG4gICAgICAgICAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgIH0pXG5cbiAgICBleHBlY3QoXG4gICAgICByZW1vdmVDdXN0b21DbGFzc2VzKFxuICAgICAgICByZW1vdmVJZChcbiAgICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoe1xuICAgICAgICAgICAgYmFzaWNGaWx0ZXI6XG4gICAgICAgICAgICAgIHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAoc3RhcnRpbmdGaWx0ZXIpLnByb3BlcnR5VmFsdWVNYXAsXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICkudG8uZGVlcC5lcXVhbChyZW1vdmVDdXN0b21DbGFzc2VzKHJlbW92ZUlkKHN0YXJ0aW5nRmlsdGVyKSkpXG4gIH0pXG5cbiAgaXQoJ2hhbmRsZXMganVzdCB0eXBlcyBidXQgd2hlbiBibGFuayAnLCAoKSA9PiB7XG4gICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5hdHRyaWJ1dGVNYXApIHtcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5hdHRyaWJ1dGVNYXAgPSB7XG4gICAgICAgIGFueVRleHQ6IHtcbiAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICBpZDogJ2FueVRleHQnLFxuICAgICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3Jlc2VydmVkLmJhc2ljLWRhdGF0eXBlJzoge1xuICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgIGlkOiAncmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLFxuICAgICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzdGFydGluZ0ZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogJ0FORCcsXG4gICAgICBmaWx0ZXJzOiBbXG4gICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIHRleHQ6ICd0JyxcbiAgICAgICAgICAgIGNxbDogXCIoYW55VGV4dCBJTElLRSAndCcpXCIsXG4gICAgICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICBwcm9wZXJ0eTogJ3Jlc2VydmVkLmJhc2ljLWRhdGF0eXBlJyxcbiAgICAgICAgICB2YWx1ZTogW10sXG4gICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgIH0pXG5cbiAgICBleHBlY3QoXG4gICAgICByZW1vdmVDdXN0b21DbGFzc2VzKFxuICAgICAgICByZW1vdmVJZChcbiAgICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoe1xuICAgICAgICAgICAgYmFzaWNGaWx0ZXI6XG4gICAgICAgICAgICAgIHRyYW5zbGF0ZUZpbHRlclRvQmFzaWNNYXAoc3RhcnRpbmdGaWx0ZXIpLnByb3BlcnR5VmFsdWVNYXAsXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICkudG8uZGVlcC5lcXVhbChyZW1vdmVDdXN0b21DbGFzc2VzKHJlbW92ZUlkKHN0YXJ0aW5nRmlsdGVyKSkpXG4gIH0pXG5cbiAgaXQoJ2hhbmRsZXMganVzdCB0eXBlcyB3aGVuIHR5cGVzIGFyZSBmaWxsZWQgb3V0ICcsICgpID0+IHtcbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmF0dHJpYnV0ZU1hcCkge1xuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmF0dHJpYnV0ZU1hcCA9IHtcbiAgICAgICAgYW55VGV4dDoge1xuICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgIGlkOiAnYW55VGV4dCcsXG4gICAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICAncmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnOiB7XG4gICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgaWQ6ICdyZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsXG4gICAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzdGFydGluZ0ZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogJ0FORCcsXG4gICAgICBmaWx0ZXJzOiBbXG4gICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIHRleHQ6ICd0JyxcbiAgICAgICAgICAgIGNxbDogXCIoYW55VGV4dCBJTElLRSAndCcpXCIsXG4gICAgICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICBwcm9wZXJ0eTogJ3Jlc2VydmVkLmJhc2ljLWRhdGF0eXBlJyxcbiAgICAgICAgICB2YWx1ZTogWydFcXVpcG1lbnQnXSxcbiAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgfSlcblxuICAgIGV4cGVjdChcbiAgICAgIHJlbW92ZUN1c3RvbUNsYXNzZXMoXG4gICAgICAgIHJlbW92ZUlkKFxuICAgICAgICAgIGNvbnN0cnVjdEZpbHRlckZyb21CYXNpY0ZpbHRlcih7XG4gICAgICAgICAgICBiYXNpY0ZpbHRlcjpcbiAgICAgICAgICAgICAgdHJhbnNsYXRlRmlsdGVyVG9CYXNpY01hcChzdGFydGluZ0ZpbHRlcikucHJvcGVydHlWYWx1ZU1hcCxcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKS50by5kZWVwLmVxdWFsKHJlbW92ZUN1c3RvbUNsYXNzZXMocmVtb3ZlSWQoc3RhcnRpbmdGaWx0ZXIpKSlcbiAgfSlcblxuICBpdCgnaGFuZGxlcyBqdXN0IHR5cGVzIHdoZW4gZXZlcnl0aGluZyBpcyBmaWxsZWQgb3V0ICcsICgpID0+IHtcbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmF0dHJpYnV0ZU1hcCkge1xuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmF0dHJpYnV0ZU1hcCA9IHtcbiAgICAgICAgYW55VGV4dDoge1xuICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgIGlkOiAnYW55VGV4dCcsXG4gICAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBhbnlHZW86IHtcbiAgICAgICAgICB0eXBlOiAnTE9DQVRJT04nLFxuICAgICAgICAgIGlkOiAnYW55R2VvJyxcbiAgICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IHtcbiAgICAgICAgICB0eXBlOiAnREFURScsXG4gICAgICAgICAgaWQ6ICdjcmVhdGVkJyxcbiAgICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIGVmZmVjdGl2ZToge1xuICAgICAgICAgIHR5cGU6ICdEQVRFJyxcbiAgICAgICAgICBpZDogJ2VmZmVjdGl2ZScsXG4gICAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBtb2RpZmllZDoge1xuICAgICAgICAgIHR5cGU6ICdEQVRFJyxcbiAgICAgICAgICBpZDogJ21vZGlmaWVkJyxcbiAgICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhY2FyZC5jcmVhdGVkJzoge1xuICAgICAgICAgIHR5cGU6ICdEQVRFJyxcbiAgICAgICAgICBpZDogJ21ldGFjYXJkLmNyZWF0ZWQnLFxuICAgICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgJ21ldGFjYXJkLm1vZGlmaWVkJzoge1xuICAgICAgICAgIHR5cGU6ICdEQVRFJyxcbiAgICAgICAgICBpZDogJ21ldGFjYXJkLm1vZGlmaWVkJyxcbiAgICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgICdyZXNlcnZlZC5iYXNpYy1kYXRhdHlwZSc6IHtcbiAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICBpZDogJ3Jlc2VydmVkLmJhc2ljLWRhdGF0eXBlJyxcbiAgICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHN0YXJ0aW5nRmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICB0eXBlOiAnQU5EJyxcbiAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICB0eXBlOiAnQk9PTEVBTl9URVhUX1NFQVJDSCcsXG4gICAgICAgICAgcHJvcGVydHk6ICdhbnlUZXh0JyxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgdGV4dDogJ3QnLFxuICAgICAgICAgICAgY3FsOiBcIihhbnlUZXh0IElMSUtFICd0JylcIixcbiAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICB0eXBlOiAnQkVGT1JFJyxcbiAgICAgICAgICAgICAgcHJvcGVydHk6ICdjcmVhdGVkJyxcbiAgICAgICAgICAgICAgdmFsdWU6ICcyMDI0LTA0LTE4VDIyOjM5OjA1Ljk0NlonLFxuICAgICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgdHlwZTogJ0JFRk9SRScsXG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnZWZmZWN0aXZlJyxcbiAgICAgICAgICAgICAgdmFsdWU6ICcyMDI0LTA0LTE4VDIyOjM5OjA1Ljk0NlonLFxuICAgICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgdHlwZTogJ0JFRk9SRScsXG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnbW9kaWZpZWQnLFxuICAgICAgICAgICAgICB2YWx1ZTogJzIwMjQtMDQtMThUMjI6Mzk6MDUuOTQ2WicsXG4gICAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICB0eXBlOiAnQkVGT1JFJyxcbiAgICAgICAgICAgICAgcHJvcGVydHk6ICdtZXRhY2FyZC5jcmVhdGVkJyxcbiAgICAgICAgICAgICAgdmFsdWU6ICcyMDI0LTA0LTE4VDIyOjM5OjA1Ljk0NlonLFxuICAgICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgdHlwZTogJ0JFRk9SRScsXG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnbWV0YWNhcmQubW9kaWZpZWQnLFxuICAgICAgICAgICAgICB2YWx1ZTogJzIwMjQtMDQtMThUMjI6Mzk6MDUuOTQ2WicsXG4gICAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgXSxcbiAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGxvY2F0aW9uSWQ6IDE3MTM0ODA1NzYwNzgsXG4gICAgICAgICAgICBjb2xvcjogJyM4RTc5REQnLFxuICAgICAgICAgICAgZHJhd2luZzogZmFsc2UsXG4gICAgICAgICAgICBkbXNOb3J0aERpcmVjdGlvbjogJ04nLFxuICAgICAgICAgICAgZG1zU291dGhEaXJlY3Rpb246ICdOJyxcbiAgICAgICAgICAgIGRtc0Vhc3REaXJlY3Rpb246ICdFJyxcbiAgICAgICAgICAgIGRtc1dlc3REaXJlY3Rpb246ICdFJyxcbiAgICAgICAgICAgIHJhZGl1c1VuaXRzOiAnbWV0ZXJzJyxcbiAgICAgICAgICAgIHJhZGl1czogOTU1LjE3MTM4OTc5MDA3MzUsXG4gICAgICAgICAgICBsb2NhdGlvblR5cGU6ICdkZCcsXG4gICAgICAgICAgICBwcmV2TG9jYXRpb25UeXBlOiAnZGQnLFxuICAgICAgICAgICAgbGF0OiA0NC4zNTI1NjcsXG4gICAgICAgICAgICBsb246IC0xMDguMTM0MDUsXG4gICAgICAgICAgICBkbXNMYXQ6ICc0NMKwMjFcXCcwOS4yNDFcIicsXG4gICAgICAgICAgICBkbXNMb246ICcxMDjCsDA4XFwnMDIuNThcIicsXG4gICAgICAgICAgICBkbXNMYXREaXJlY3Rpb246ICdOJyxcbiAgICAgICAgICAgIGRtc0xvbkRpcmVjdGlvbjogJ1cnLFxuICAgICAgICAgICAgdXNuZzogJzEyVCBZUSAyODQxMiAxNTAyOCcsXG4gICAgICAgICAgICBsaW5lV2lkdGg6ICcnLFxuICAgICAgICAgICAgbGluZVVuaXRzOiAnbWV0ZXJzJyxcbiAgICAgICAgICAgIHBvbHlnb25CdWZmZXJXaWR0aDogJycsXG4gICAgICAgICAgICBwb2x5Z29uQnVmZmVyVW5pdHM6ICdtZXRlcnMnLFxuICAgICAgICAgICAgaGFzS2V5d29yZDogZmFsc2UsXG4gICAgICAgICAgICB1dG1VcHNVcHBlckxlZnRIZW1pc3BoZXJlOiAnTm9ydGhlcm4nLFxuICAgICAgICAgICAgdXRtVXBzVXBwZXJMZWZ0Wm9uZTogMSxcbiAgICAgICAgICAgIHV0bVVwc0xvd2VyUmlnaHRIZW1pc3BoZXJlOiAnTm9ydGhlcm4nLFxuICAgICAgICAgICAgdXRtVXBzTG93ZXJSaWdodFpvbmU6IDEsXG4gICAgICAgICAgICB1dG1VcHNFYXN0aW5nOiA3Mjg0MTIuMjU2MDkzNzU0MixcbiAgICAgICAgICAgIHV0bVVwc05vcnRoaW5nOiA0OTE1MDI4LjEyMDIxMzc2MyxcbiAgICAgICAgICAgIHV0bVVwc1pvbmU6IDEyLFxuICAgICAgICAgICAgdXRtVXBzSGVtaXNwaGVyZTogJ05vcnRoZXJuJyxcbiAgICAgICAgICAgIG1vZGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgdHlwZTogJ1BPSU5UUkFESVVTJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgIHByb3BlcnR5OiAncmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLFxuICAgICAgICAgIHZhbHVlOiBbJ0VxdWlwbWVudCddLFxuICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB9KSxcbiAgICAgIF0sXG4gICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICB9KVxuXG4gICAgY29uc3QgcmVzdWx0ID0gcmVtb3ZlQ3VzdG9tQ2xhc3NlcyhcbiAgICAgIHJlbW92ZUlkKFxuICAgICAgICBjb25zdHJ1Y3RGaWx0ZXJGcm9tQmFzaWNGaWx0ZXIoe1xuICAgICAgICAgIGJhc2ljRmlsdGVyOlxuICAgICAgICAgICAgdHJhbnNsYXRlRmlsdGVyVG9CYXNpY01hcChzdGFydGluZ0ZpbHRlcikucHJvcGVydHlWYWx1ZU1hcCxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICApXG5cbiAgICBleHBlY3QocmVzdWx0KS50by5kZWVwLmVxdWFsKHJlbW92ZUN1c3RvbUNsYXNzZXMocmVtb3ZlSWQoc3RhcnRpbmdGaWx0ZXIpKSlcbiAgfSlcbn0pXG4iXX0=