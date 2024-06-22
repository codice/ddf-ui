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
//# sourceMappingURL=reserved.basic-datatype.spec.js.map