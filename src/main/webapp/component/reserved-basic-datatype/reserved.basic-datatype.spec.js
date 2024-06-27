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
import { StartupDataStore } from '../../js/model/Startup/startup';
import { generateGroupsToValues, generateKnownGroups, generateSortedValues, getDataTypesConfiguration, } from './reserved.basic-datatype';
var DatatypesJSONConfig = {
    groups: {
        Object: {
            iconConfig: {
                class: 'fa fa-file-text-o',
            },
            values: {
                Person: {
                    attributes: {
                        description: ['person'],
                    },
                    iconConfig: {
                        class: 'fa fa-user',
                    },
                },
                Group: {
                    attributes: {
                        description: ['group'],
                    },
                    iconConfig: {
                        class: 'fa fa-users',
                    },
                },
                Equipment: {
                    attributes: {
                        description: ['equipment'],
                    },
                    iconConfig: {
                        class: 'fa fa-wrench',
                    },
                },
                Platform: {
                    attributes: {
                        description: ['platform'],
                    },
                    iconConfig: {
                        class: 'fa fa-industry',
                    },
                },
                Facility: {
                    attributes: {
                        description: ['facility'],
                    },
                    iconConfig: {
                        class: 'fa fa-building',
                    },
                },
            },
        },
        Happenings: {
            iconConfig: {
                class: 'fa fa-bolt',
            },
            values: {
                Civil: {
                    attributes: {
                        description: ['civil'],
                    },
                    iconConfig: {
                        class: 'fa fa-university',
                    },
                },
                Military: {
                    attributes: {
                        description: ['military'],
                    },
                    iconConfig: {
                        class: 'fa fa-shield',
                    },
                },
                Political: {
                    attributes: {
                        description: ['political'],
                    },
                    iconConfig: {
                        class: 'fa fa-balance-scale',
                    },
                },
                Natural: {
                    attributes: {
                        description: ['natural'],
                    },
                    iconConfig: {
                        class: 'fa fa-leaf',
                    },
                },
                Other: {
                    attributes: {
                        description: ['other'],
                    },
                },
            },
        },
        'Visual Media': {
            iconConfig: {
                class: 'fa fa-camera-retro',
            },
            values: {
                Image: {
                    attributes: {
                        datatype: ['Image'],
                    },
                    iconConfig: {
                        class: 'fa fa-picture-o',
                    },
                },
                'Moving Image': {
                    attributes: {
                        datatype: ['Moving Image'],
                    },
                    iconConfig: {
                        class: 'fa fa-film',
                    },
                },
                'Still Image': {
                    attributes: {
                        datatype: ['Still Image'],
                    },
                    iconConfig: {
                        class: 'fa fa-camera-retro',
                    },
                },
            },
        },
    },
};
describe('Reserved Basic Datatype', function () {
    it('should use defaults when extra json is not defined', function () {
        if (StartupDataStore.MetacardDefinitions.attributeMap) {
            StartupDataStore.MetacardDefinitions.attributeMap['datatype'] = {
                id: 'datatype',
                multivalued: false,
                type: 'STRING',
                enumerations: ['Image'],
                isInjected: true,
            };
        }
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.extra = {};
        }
        var resolvedConfiguration = getDataTypesConfiguration({
            Configuration: StartupDataStore.Configuration,
            MetacardDefinitions: StartupDataStore.MetacardDefinitions,
        });
        expect(resolvedConfiguration.groupMap).to.deep.equal({
            groups: {
                Other: {
                    values: {
                        Image: {
                            attributes: {
                                datatype: ['Image'],
                                'metadata-content-type': ['Image'],
                            },
                            iconConfig: {
                                class: undefined,
                            },
                        },
                    },
                },
            },
        });
    });
    it('should use defaults when extra json is not defined p2', function () {
        if (StartupDataStore.MetacardDefinitions.attributeMap) {
            StartupDataStore.MetacardDefinitions.attributeMap['datatype'] = {
                id: 'datatype',
                multivalued: false,
                type: 'STRING',
                enumerations: ['Image', 'Moving Image'],
                isInjected: true,
            };
        }
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.extra = {};
        }
        var resolvedConfiguration = getDataTypesConfiguration({
            Configuration: StartupDataStore.Configuration,
            MetacardDefinitions: StartupDataStore.MetacardDefinitions,
        });
        expect(resolvedConfiguration.groupMap).to.deep.equal({
            groups: {
                Other: {
                    values: {
                        Image: {
                            attributes: {
                                datatype: ['Image'],
                                'metadata-content-type': ['Image'],
                            },
                            iconConfig: {
                                class: undefined,
                            },
                        },
                        'Moving Image': {
                            attributes: {
                                datatype: ['Moving Image'],
                                'metadata-content-type': ['Moving Image'],
                            },
                            iconConfig: {
                                class: undefined,
                            },
                        },
                    },
                },
            },
        });
    });
    it('should use extra json when defined', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.extra = {
                datatypes: DatatypesJSONConfig,
            };
        }
        var resolvedConfiguration = getDataTypesConfiguration({
            Configuration: StartupDataStore.Configuration,
            MetacardDefinitions: StartupDataStore.MetacardDefinitions,
        });
        expect(resolvedConfiguration.groupMap).to.deep.equal(DatatypesJSONConfig);
    });
    it('should generate a proper value mapping', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.extra = {
                datatypes: DatatypesJSONConfig,
            };
        }
        var resolvedConfiguration = getDataTypesConfiguration({
            Configuration: StartupDataStore.Configuration,
            MetacardDefinitions: StartupDataStore.MetacardDefinitions,
        });
        expect(resolvedConfiguration.valueMap).to.deep.equal({
            Person: {
                group: {
                    name: 'Object',
                    iconConfig: {
                        class: 'fa fa-file-text-o',
                    },
                },
                attributes: {
                    description: ['person'],
                },
                iconConfig: {
                    class: 'fa fa-user',
                },
            },
            Group: {
                group: {
                    name: 'Object',
                    iconConfig: {
                        class: 'fa fa-file-text-o',
                    },
                },
                attributes: {
                    description: ['group'],
                },
                iconConfig: {
                    class: 'fa fa-users',
                },
            },
            Equipment: {
                group: {
                    name: 'Object',
                    iconConfig: {
                        class: 'fa fa-file-text-o',
                    },
                },
                attributes: {
                    description: ['equipment'],
                },
                iconConfig: {
                    class: 'fa fa-wrench',
                },
            },
            Platform: {
                group: {
                    name: 'Object',
                    iconConfig: {
                        class: 'fa fa-file-text-o',
                    },
                },
                attributes: {
                    description: ['platform'],
                },
                iconConfig: {
                    class: 'fa fa-industry',
                },
            },
            Facility: {
                group: {
                    name: 'Object',
                    iconConfig: {
                        class: 'fa fa-file-text-o',
                    },
                },
                attributes: {
                    description: ['facility'],
                },
                iconConfig: {
                    class: 'fa fa-building',
                },
            },
            Civil: {
                group: {
                    name: 'Happenings',
                    iconConfig: {
                        class: 'fa fa-bolt',
                    },
                },
                attributes: {
                    description: ['civil'],
                },
                iconConfig: {
                    class: 'fa fa-university',
                },
            },
            Military: {
                group: {
                    name: 'Happenings',
                    iconConfig: {
                        class: 'fa fa-bolt',
                    },
                },
                attributes: {
                    description: ['military'],
                },
                iconConfig: {
                    class: 'fa fa-shield',
                },
            },
            Political: {
                group: {
                    name: 'Happenings',
                    iconConfig: {
                        class: 'fa fa-bolt',
                    },
                },
                attributes: {
                    description: ['political'],
                },
                iconConfig: {
                    class: 'fa fa-balance-scale',
                },
            },
            Natural: {
                group: {
                    name: 'Happenings',
                    iconConfig: {
                        class: 'fa fa-bolt',
                    },
                },
                attributes: {
                    description: ['natural'],
                },
                iconConfig: {
                    class: 'fa fa-leaf',
                },
            },
            Other: {
                group: {
                    name: 'Happenings',
                    iconConfig: {
                        class: 'fa fa-bolt',
                    },
                },
                attributes: {
                    description: ['other'],
                },
            },
            Image: {
                group: {
                    name: 'Visual Media',
                    iconConfig: {
                        class: 'fa fa-camera-retro',
                    },
                },
                attributes: {
                    datatype: ['Image'],
                },
                iconConfig: {
                    class: 'fa fa-picture-o',
                },
            },
            'Moving Image': {
                group: {
                    name: 'Visual Media',
                    iconConfig: {
                        class: 'fa fa-camera-retro',
                    },
                },
                attributes: {
                    datatype: ['Moving Image'],
                },
                iconConfig: {
                    class: 'fa fa-film',
                },
            },
            'Still Image': {
                group: {
                    name: 'Visual Media',
                    iconConfig: {
                        class: 'fa fa-camera-retro',
                    },
                },
                attributes: {
                    datatype: ['Still Image'],
                },
                iconConfig: {
                    class: 'fa fa-camera-retro',
                },
            },
        });
    });
    it('should sort values appropriately, according to the key order in the json config, and alphabetically otherwise', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.extra = {
                datatypes: DatatypesJSONConfig,
            };
        }
        var resolvedConfiguration = getDataTypesConfiguration({
            Configuration: StartupDataStore.Configuration,
            MetacardDefinitions: StartupDataStore.MetacardDefinitions,
        });
        var sortedValues = generateSortedValues({
            dataTypesConfiguration: resolvedConfiguration,
        });
        expect(sortedValues).to.deep.equal([
            {
                label: 'Object',
                value: 'Object',
            },
            {
                label: 'Equipment',
                value: 'Equipment',
            },
            {
                label: 'Facility',
                value: 'Facility',
            },
            {
                label: 'Group',
                value: 'Group',
            },
            {
                label: 'Person',
                value: 'Person',
            },
            {
                label: 'Platform',
                value: 'Platform',
            },
            {
                label: 'Happenings',
                value: 'Happenings',
            },
            {
                label: 'Civil',
                value: 'Civil',
            },
            {
                label: 'Military',
                value: 'Military',
            },
            {
                label: 'Natural',
                value: 'Natural',
            },
            {
                label: 'Other',
                value: 'Other',
            },
            {
                label: 'Political',
                value: 'Political',
            },
            {
                label: 'Visual Media',
                value: 'Visual Media',
            },
            {
                label: 'Image',
                value: 'Image',
            },
            {
                label: 'Moving Image',
                value: 'Moving Image',
            },
            {
                label: 'Still Image',
                value: 'Still Image',
            },
        ]);
    });
    it('should use generate groups to values appropriately', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.extra = {
                datatypes: DatatypesJSONConfig,
            };
        }
        var resolvedConfiguration = getDataTypesConfiguration({
            Configuration: StartupDataStore.Configuration,
            MetacardDefinitions: StartupDataStore.MetacardDefinitions,
        });
        var groupsToValues = generateGroupsToValues({
            dataTypesConfiguration: resolvedConfiguration,
        });
        expect(groupsToValues).to.deep.equal({
            Object: ['Person', 'Group', 'Equipment', 'Platform', 'Facility'],
            Happenings: ['Civil', 'Military', 'Political', 'Natural', 'Other'],
            'Visual Media': ['Image', 'Moving Image', 'Still Image'],
        });
    });
    it('should use generate known groups appropriately', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.extra = {
                datatypes: DatatypesJSONConfig,
            };
        }
        var resolvedConfiguration = getDataTypesConfiguration({
            Configuration: StartupDataStore.Configuration,
            MetacardDefinitions: StartupDataStore.MetacardDefinitions,
        });
        var knownGroups = generateKnownGroups({
            dataTypesConfiguration: resolvedConfiguration,
        });
        expect(knownGroups).to.deep.equal(['Object', 'Happenings', 'Visual Media']);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcmVzZXJ2ZWQtYmFzaWMtZGF0YXR5cGUvcmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUuc3BlYy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFFN0IsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDakUsT0FBTyxFQUNMLHNCQUFzQixFQUN0QixtQkFBbUIsRUFDbkIsb0JBQW9CLEVBQ3BCLHlCQUF5QixHQUMxQixNQUFNLDJCQUEyQixDQUFBO0FBRWxDLElBQU0sbUJBQW1CLEdBQUc7SUFDMUIsTUFBTSxFQUFFO1FBQ04sTUFBTSxFQUFFO1lBQ04sVUFBVSxFQUFFO2dCQUNWLEtBQUssRUFBRSxtQkFBbUI7YUFDM0I7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sTUFBTSxFQUFFO29CQUNOLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUM7cUJBQ3hCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsWUFBWTtxQkFDcEI7aUJBQ0Y7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUM7cUJBQ3ZCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsYUFBYTtxQkFDckI7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUM7cUJBQzNCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsY0FBYztxQkFDdEI7aUJBQ0Y7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLFVBQVUs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O0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCB7IGV4cGVjdCB9IGZyb20gJ2NoYWknXG5pbXBvcnQgeyBEYXRhVHlwZXNDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vZGF0YXR5cGVzL2RhdGF0eXBlcydcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQge1xuICBnZW5lcmF0ZUdyb3Vwc1RvVmFsdWVzLFxuICBnZW5lcmF0ZUtub3duR3JvdXBzLFxuICBnZW5lcmF0ZVNvcnRlZFZhbHVlcyxcbiAgZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbixcbn0gZnJvbSAnLi9yZXNlcnZlZC5iYXNpYy1kYXRhdHlwZSdcblxuY29uc3QgRGF0YXR5cGVzSlNPTkNvbmZpZyA9IHtcbiAgZ3JvdXBzOiB7XG4gICAgT2JqZWN0OiB7XG4gICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgIGNsYXNzOiAnZmEgZmEtZmlsZS10ZXh0LW8nLFxuICAgICAgfSxcbiAgICAgIHZhbHVlczoge1xuICAgICAgICBQZXJzb246IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWydwZXJzb24nXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtdXNlcicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgR3JvdXA6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWydncm91cCddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS11c2VycycsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgRXF1aXBtZW50OiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsnZXF1aXBtZW50J10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLXdyZW5jaCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgUGxhdGZvcm06IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWydwbGF0Zm9ybSddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS1pbmR1c3RyeScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgRmFjaWxpdHk6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWydmYWNpbGl0eSddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS1idWlsZGluZycsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBIYXBwZW5pbmdzOiB7XG4gICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgIGNsYXNzOiAnZmEgZmEtYm9sdCcsXG4gICAgICB9LFxuICAgICAgdmFsdWVzOiB7XG4gICAgICAgIENpdmlsOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsnY2l2aWwnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtdW5pdmVyc2l0eScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgTWlsaXRhcnk6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWydtaWxpdGFyeSddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS1zaGllbGQnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIFBvbGl0aWNhbDoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ3BvbGl0aWNhbCddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS1iYWxhbmNlLXNjYWxlJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBOYXR1cmFsOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsnbmF0dXJhbCddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS1sZWFmJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBPdGhlcjoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ290aGVyJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAnVmlzdWFsIE1lZGlhJzoge1xuICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICBjbGFzczogJ2ZhIGZhLWNhbWVyYS1yZXRybycsXG4gICAgICB9LFxuICAgICAgdmFsdWVzOiB7XG4gICAgICAgIEltYWdlOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGF0YXR5cGU6IFsnSW1hZ2UnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtcGljdHVyZS1vJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAnTW92aW5nIEltYWdlJzoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRhdGF0eXBlOiBbJ01vdmluZyBJbWFnZSddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS1maWxtJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAnU3RpbGwgSW1hZ2UnOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGF0YXR5cGU6IFsnU3RpbGwgSW1hZ2UnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtY2FtZXJhLXJldHJvJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSBhcyBEYXRhVHlwZXNDb25maWd1cmF0aW9uXG5cbmRlc2NyaWJlKCdSZXNlcnZlZCBCYXNpYyBEYXRhdHlwZScsICgpID0+IHtcbiAgaXQoJ3Nob3VsZCB1c2UgZGVmYXVsdHMgd2hlbiBleHRyYSBqc29uIGlzIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuYXR0cmlidXRlTWFwKSB7XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuYXR0cmlidXRlTWFwWydkYXRhdHlwZSddID0ge1xuICAgICAgICBpZDogJ2RhdGF0eXBlJyxcbiAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgZW51bWVyYXRpb25zOiBbJ0ltYWdlJ10sXG4gICAgICAgIGlzSW5qZWN0ZWQ6IHRydWUsXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnKSB7XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnLmV4dHJhID0ge31cbiAgICB9XG5cbiAgICBjb25zdCByZXNvbHZlZENvbmZpZ3VyYXRpb24gPSBnZXREYXRhVHlwZXNDb25maWd1cmF0aW9uKHtcbiAgICAgIENvbmZpZ3VyYXRpb246IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbixcbiAgICAgIE1ldGFjYXJkRGVmaW5pdGlvbnM6IFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucyxcbiAgICB9KVxuICAgIGV4cGVjdChyZXNvbHZlZENvbmZpZ3VyYXRpb24uZ3JvdXBNYXApLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgZ3JvdXBzOiB7XG4gICAgICAgIE90aGVyOiB7XG4gICAgICAgICAgdmFsdWVzOiB7XG4gICAgICAgICAgICBJbWFnZToge1xuICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6IFsnSW1hZ2UnXSxcbiAgICAgICAgICAgICAgICAnbWV0YWRhdGEtY29udGVudC10eXBlJzogWydJbWFnZSddLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSlcbiAgfSlcbiAgaXQoJ3Nob3VsZCB1c2UgZGVmYXVsdHMgd2hlbiBleHRyYSBqc29uIGlzIG5vdCBkZWZpbmVkIHAyJywgKCkgPT4ge1xuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuYXR0cmlidXRlTWFwKSB7XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuYXR0cmlidXRlTWFwWydkYXRhdHlwZSddID0ge1xuICAgICAgICBpZDogJ2RhdGF0eXBlJyxcbiAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgZW51bWVyYXRpb25zOiBbJ0ltYWdlJywgJ01vdmluZyBJbWFnZSddLFxuICAgICAgICBpc0luamVjdGVkOiB0cnVlLFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZykge1xuICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZy5leHRyYSA9IHt9XG4gICAgfVxuICAgIGNvbnN0IHJlc29sdmVkQ29uZmlndXJhdGlvbiA9IGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb24oe1xuICAgICAgQ29uZmlndXJhdGlvbjogU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLFxuICAgICAgTWV0YWNhcmREZWZpbml0aW9uczogU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLFxuICAgIH0pXG4gICAgZXhwZWN0KHJlc29sdmVkQ29uZmlndXJhdGlvbi5ncm91cE1hcCkudG8uZGVlcC5lcXVhbCh7XG4gICAgICBncm91cHM6IHtcbiAgICAgICAgT3RoZXI6IHtcbiAgICAgICAgICB2YWx1ZXM6IHtcbiAgICAgICAgICAgIEltYWdlOiB7XG4gICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogWydJbWFnZSddLFxuICAgICAgICAgICAgICAgICdtZXRhZGF0YS1jb250ZW50LXR5cGUnOiBbJ0ltYWdlJ10sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgICAgICBjbGFzczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdNb3ZpbmcgSW1hZ2UnOiB7XG4gICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogWydNb3ZpbmcgSW1hZ2UnXSxcbiAgICAgICAgICAgICAgICAnbWV0YWRhdGEtY29udGVudC10eXBlJzogWydNb3ZpbmcgSW1hZ2UnXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgICAgIGNsYXNzOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pXG4gIH0pXG4gIGl0KCdzaG91bGQgdXNlIGV4dHJhIGpzb24gd2hlbiBkZWZpbmVkJywgKCkgPT4ge1xuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnKSB7XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnLmV4dHJhID0ge1xuICAgICAgICBkYXRhdHlwZXM6IERhdGF0eXBlc0pTT05Db25maWcsXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc29sdmVkQ29uZmlndXJhdGlvbiA9IGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb24oe1xuICAgICAgQ29uZmlndXJhdGlvbjogU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLFxuICAgICAgTWV0YWNhcmREZWZpbml0aW9uczogU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLFxuICAgIH0pXG4gICAgZXhwZWN0KHJlc29sdmVkQ29uZmlndXJhdGlvbi5ncm91cE1hcCkudG8uZGVlcC5lcXVhbChEYXRhdHlwZXNKU09OQ29uZmlnKVxuICB9KVxuICBpdCgnc2hvdWxkIGdlbmVyYXRlIGEgcHJvcGVyIHZhbHVlIG1hcHBpbmcnLCAoKSA9PiB7XG4gICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcpIHtcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcuZXh0cmEgPSB7XG4gICAgICAgIGRhdGF0eXBlczogRGF0YXR5cGVzSlNPTkNvbmZpZyxcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzb2x2ZWRDb25maWd1cmF0aW9uID0gZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbih7XG4gICAgICBDb25maWd1cmF0aW9uOiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24sXG4gICAgICBNZXRhY2FyZERlZmluaXRpb25zOiBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMsXG4gICAgfSlcbiAgICBleHBlY3QocmVzb2x2ZWRDb25maWd1cmF0aW9uLnZhbHVlTWFwKS50by5kZWVwLmVxdWFsKHtcbiAgICAgIFBlcnNvbjoge1xuICAgICAgICBncm91cDoge1xuICAgICAgICAgIG5hbWU6ICdPYmplY3QnLFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtZmlsZS10ZXh0LW8nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogWydwZXJzb24nXSxcbiAgICAgICAgfSxcbiAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgIGNsYXNzOiAnZmEgZmEtdXNlcicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgR3JvdXA6IHtcbiAgICAgICAgZ3JvdXA6IHtcbiAgICAgICAgICBuYW1lOiAnT2JqZWN0JyxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLWZpbGUtdGV4dC1vJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFsnZ3JvdXAnXSxcbiAgICAgICAgfSxcbiAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgIGNsYXNzOiAnZmEgZmEtdXNlcnMnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIEVxdWlwbWVudDoge1xuICAgICAgICBncm91cDoge1xuICAgICAgICAgIG5hbWU6ICdPYmplY3QnLFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtZmlsZS10ZXh0LW8nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogWydlcXVpcG1lbnQnXSxcbiAgICAgICAgfSxcbiAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgIGNsYXNzOiAnZmEgZmEtd3JlbmNoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBQbGF0Zm9ybToge1xuICAgICAgICBncm91cDoge1xuICAgICAgICAgIG5hbWU6ICdPYmplY3QnLFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtZmlsZS10ZXh0LW8nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogWydwbGF0Zm9ybSddLFxuICAgICAgICB9LFxuICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgY2xhc3M6ICdmYSBmYS1pbmR1c3RyeScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgRmFjaWxpdHk6IHtcbiAgICAgICAgZ3JvdXA6IHtcbiAgICAgICAgICBuYW1lOiAnT2JqZWN0JyxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLWZpbGUtdGV4dC1vJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFsnZmFjaWxpdHknXSxcbiAgICAgICAgfSxcbiAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgIGNsYXNzOiAnZmEgZmEtYnVpbGRpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIENpdmlsOiB7XG4gICAgICAgIGdyb3VwOiB7XG4gICAgICAgICAgbmFtZTogJ0hhcHBlbmluZ3MnLFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtYm9sdCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ2NpdmlsJ10sXG4gICAgICAgIH0sXG4gICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICBjbGFzczogJ2ZhIGZhLXVuaXZlcnNpdHknLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIE1pbGl0YXJ5OiB7XG4gICAgICAgIGdyb3VwOiB7XG4gICAgICAgICAgbmFtZTogJ0hhcHBlbmluZ3MnLFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtYm9sdCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ21pbGl0YXJ5J10sXG4gICAgICAgIH0sXG4gICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICBjbGFzczogJ2ZhIGZhLXNoaWVsZCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgUG9saXRpY2FsOiB7XG4gICAgICAgIGdyb3VwOiB7XG4gICAgICAgICAgbmFtZTogJ0hhcHBlbmluZ3MnLFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtYm9sdCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ3BvbGl0aWNhbCddLFxuICAgICAgICB9LFxuICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgY2xhc3M6ICdmYSBmYS1iYWxhbmNlLXNjYWxlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBOYXR1cmFsOiB7XG4gICAgICAgIGdyb3VwOiB7XG4gICAgICAgICAgbmFtZTogJ0hhcHBlbmluZ3MnLFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtYm9sdCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ25hdHVyYWwnXSxcbiAgICAgICAgfSxcbiAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgIGNsYXNzOiAnZmEgZmEtbGVhZicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgT3RoZXI6IHtcbiAgICAgICAgZ3JvdXA6IHtcbiAgICAgICAgICBuYW1lOiAnSGFwcGVuaW5ncycsXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS1ib2x0JyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFsnb3RoZXInXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBJbWFnZToge1xuICAgICAgICBncm91cDoge1xuICAgICAgICAgIG5hbWU6ICdWaXN1YWwgTWVkaWEnLFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtY2FtZXJhLXJldHJvJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgZGF0YXR5cGU6IFsnSW1hZ2UnXSxcbiAgICAgICAgfSxcbiAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgIGNsYXNzOiAnZmEgZmEtcGljdHVyZS1vJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAnTW92aW5nIEltYWdlJzoge1xuICAgICAgICBncm91cDoge1xuICAgICAgICAgIG5hbWU6ICdWaXN1YWwgTWVkaWEnLFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtY2FtZXJhLXJldHJvJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgZGF0YXR5cGU6IFsnTW92aW5nIEltYWdlJ10sXG4gICAgICAgIH0sXG4gICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICBjbGFzczogJ2ZhIGZhLWZpbG0nLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgICdTdGlsbCBJbWFnZSc6IHtcbiAgICAgICAgZ3JvdXA6IHtcbiAgICAgICAgICBuYW1lOiAnVmlzdWFsIE1lZGlhJyxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLWNhbWVyYS1yZXRybycsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIGRhdGF0eXBlOiBbJ1N0aWxsIEltYWdlJ10sXG4gICAgICAgIH0sXG4gICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICBjbGFzczogJ2ZhIGZhLWNhbWVyYS1yZXRybycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBzb3J0IHZhbHVlcyBhcHByb3ByaWF0ZWx5LCBhY2NvcmRpbmcgdG8gdGhlIGtleSBvcmRlciBpbiB0aGUganNvbiBjb25maWcsIGFuZCBhbHBoYWJldGljYWxseSBvdGhlcndpc2UnLCAoKSA9PiB7XG4gICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcpIHtcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcuZXh0cmEgPSB7XG4gICAgICAgIGRhdGF0eXBlczogRGF0YXR5cGVzSlNPTkNvbmZpZyxcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzb2x2ZWRDb25maWd1cmF0aW9uID0gZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbih7XG4gICAgICBDb25maWd1cmF0aW9uOiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24sXG4gICAgICBNZXRhY2FyZERlZmluaXRpb25zOiBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMsXG4gICAgfSlcbiAgICBjb25zdCBzb3J0ZWRWYWx1ZXMgPSBnZW5lcmF0ZVNvcnRlZFZhbHVlcyh7XG4gICAgICBkYXRhVHlwZXNDb25maWd1cmF0aW9uOiByZXNvbHZlZENvbmZpZ3VyYXRpb24sXG4gICAgfSlcbiAgICBleHBlY3Qoc29ydGVkVmFsdWVzKS50by5kZWVwLmVxdWFsKFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdPYmplY3QnLFxuICAgICAgICB2YWx1ZTogJ09iamVjdCcsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0VxdWlwbWVudCcsXG4gICAgICAgIHZhbHVlOiAnRXF1aXBtZW50JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnRmFjaWxpdHknLFxuICAgICAgICB2YWx1ZTogJ0ZhY2lsaXR5JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnR3JvdXAnLFxuICAgICAgICB2YWx1ZTogJ0dyb3VwJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnUGVyc29uJyxcbiAgICAgICAgdmFsdWU6ICdQZXJzb24nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdQbGF0Zm9ybScsXG4gICAgICAgIHZhbHVlOiAnUGxhdGZvcm0nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdIYXBwZW5pbmdzJyxcbiAgICAgICAgdmFsdWU6ICdIYXBwZW5pbmdzJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQ2l2aWwnLFxuICAgICAgICB2YWx1ZTogJ0NpdmlsJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnTWlsaXRhcnknLFxuICAgICAgICB2YWx1ZTogJ01pbGl0YXJ5JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnTmF0dXJhbCcsXG4gICAgICAgIHZhbHVlOiAnTmF0dXJhbCcsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ090aGVyJyxcbiAgICAgICAgdmFsdWU6ICdPdGhlcicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1BvbGl0aWNhbCcsXG4gICAgICAgIHZhbHVlOiAnUG9saXRpY2FsJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnVmlzdWFsIE1lZGlhJyxcbiAgICAgICAgdmFsdWU6ICdWaXN1YWwgTWVkaWEnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdJbWFnZScsXG4gICAgICAgIHZhbHVlOiAnSW1hZ2UnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdNb3ZpbmcgSW1hZ2UnLFxuICAgICAgICB2YWx1ZTogJ01vdmluZyBJbWFnZScsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1N0aWxsIEltYWdlJyxcbiAgICAgICAgdmFsdWU6ICdTdGlsbCBJbWFnZScsXG4gICAgICB9LFxuICAgIF0pXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCB1c2UgZ2VuZXJhdGUgZ3JvdXBzIHRvIHZhbHVlcyBhcHByb3ByaWF0ZWx5JywgKCkgPT4ge1xuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnKSB7XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnLmV4dHJhID0ge1xuICAgICAgICBkYXRhdHlwZXM6IERhdGF0eXBlc0pTT05Db25maWcsXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc29sdmVkQ29uZmlndXJhdGlvbiA9IGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb24oe1xuICAgICAgQ29uZmlndXJhdGlvbjogU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLFxuICAgICAgTWV0YWNhcmREZWZpbml0aW9uczogU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLFxuICAgIH0pXG4gICAgY29uc3QgZ3JvdXBzVG9WYWx1ZXMgPSBnZW5lcmF0ZUdyb3Vwc1RvVmFsdWVzKHtcbiAgICAgIGRhdGFUeXBlc0NvbmZpZ3VyYXRpb246IHJlc29sdmVkQ29uZmlndXJhdGlvbixcbiAgICB9KVxuICAgIGV4cGVjdChncm91cHNUb1ZhbHVlcykudG8uZGVlcC5lcXVhbCh7XG4gICAgICBPYmplY3Q6IFsnUGVyc29uJywgJ0dyb3VwJywgJ0VxdWlwbWVudCcsICdQbGF0Zm9ybScsICdGYWNpbGl0eSddLFxuICAgICAgSGFwcGVuaW5nczogWydDaXZpbCcsICdNaWxpdGFyeScsICdQb2xpdGljYWwnLCAnTmF0dXJhbCcsICdPdGhlciddLFxuICAgICAgJ1Zpc3VhbCBNZWRpYSc6IFsnSW1hZ2UnLCAnTW92aW5nIEltYWdlJywgJ1N0aWxsIEltYWdlJ10sXG4gICAgfSlcbiAgfSlcblxuICBpdCgnc2hvdWxkIHVzZSBnZW5lcmF0ZSBrbm93biBncm91cHMgYXBwcm9wcmlhdGVseScsICgpID0+IHtcbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZykge1xuICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZy5leHRyYSA9IHtcbiAgICAgICAgZGF0YXR5cGVzOiBEYXRhdHlwZXNKU09OQ29uZmlnLFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNvbHZlZENvbmZpZ3VyYXRpb24gPSBnZXREYXRhVHlwZXNDb25maWd1cmF0aW9uKHtcbiAgICAgIENvbmZpZ3VyYXRpb246IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbixcbiAgICAgIE1ldGFjYXJkRGVmaW5pdGlvbnM6IFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucyxcbiAgICB9KVxuICAgIGNvbnN0IGtub3duR3JvdXBzID0gZ2VuZXJhdGVLbm93bkdyb3Vwcyh7XG4gICAgICBkYXRhVHlwZXNDb25maWd1cmF0aW9uOiByZXNvbHZlZENvbmZpZ3VyYXRpb24sXG4gICAgfSlcbiAgICBleHBlY3Qoa25vd25Hcm91cHMpLnRvLmRlZXAuZXF1YWwoWydPYmplY3QnLCAnSGFwcGVuaW5ncycsICdWaXN1YWwgTWVkaWEnXSlcbiAgfSlcbn0pXG4iXX0=