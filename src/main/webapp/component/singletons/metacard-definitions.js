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
import { __assign } from "tslib";
import Backbone from 'backbone';
import _ from 'underscore';
import properties from '../../js/properties';
import moment from 'moment';
import fetch from '../../react-component/utils/fetch';
function transformEnumResponse(metacardTypes, response) {
    return _.reduce(response, function (result, value, key) {
        switch (metacardTypes[key].type) {
            case 'DATE':
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                result[key] = value.map(function (subval) {
                    if (subval) {
                        return moment(subval).toISOString();
                    }
                    return subval;
                });
                break;
            case 'LONG':
            case 'DOUBLE':
            case 'FLOAT':
            case 'INTEGER':
            case 'SHORT': //needed until enum response correctly returns numbers as numbers
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                result[key] = value.map(function (
                //handle cases of unnecessary number padding -> 22.0000
                subval) { return Number(subval); });
                break;
            default:
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                result[key] = value;
                break;
        }
        return result;
    }, {});
}
var metacardStartingTypes = {
    anyText: {
        alias: properties.attributeAliases['anyText'],
        id: 'anyText',
        type: 'STRING',
        multivalued: false
    },
    anyGeo: {
        alias: properties.attributeAliases['anyGeo'],
        id: 'anyGeo',
        type: 'LOCATION',
        multivalued: false
    },
    anyDate: {
        alias: properties.attributeAliases['anyDate'],
        id: 'anyDate',
        type: 'DATE',
        multivalued: false,
        hidden: true
    },
    'metacard-type': {
        alias: properties.attributeAliases['metacard-type'],
        id: 'metacard-type',
        type: 'STRING',
        multivalued: false,
        readOnly: true
    },
    'source-id': {
        alias: properties.attributeAliases['source-id'],
        id: 'source-id',
        type: 'STRING',
        multivalued: false,
        readOnly: true
    },
    cached: {
        alias: properties.attributeAliases['cached'],
        id: 'cached',
        type: 'STRING',
        multivalued: false
    },
    'metacard-tags': {
        alias: properties.attributeAliases['metacard-tags'],
        id: 'metacard-tags',
        type: 'STRING',
        multivalued: true
    }
};
function metacardStartingTypesWithTemporal() {
    // needed to handle erroneous or currently unknown attributes (they could be picked up after searching a source)
    var metacardStartingTypeWithTemporal = __assign({}, metacardStartingTypes);
    if (properties.basicSearchTemporalSelectionDefault) {
        properties.basicSearchTemporalSelectionDefault.forEach(function (proposedType) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            metacardStartingTypeWithTemporal[proposedType] = {
                id: proposedType,
                type: 'DATE',
                alias: properties.attributeAliases[proposedType],
                hidden: properties.isHidden(proposedType)
            };
        });
    }
    return metacardStartingTypeWithTemporal;
}
export default new (Backbone.Model.extend({
    initialize: function () {
        this.updateSortedMetacardTypes();
        this.getMetacardTypes();
        this.getDatatypeEnum();
    },
    isHiddenTypeExceptThumbnail: function (id) {
        if (id === 'thumbnail') {
            return false;
        }
        else {
            return this.isHiddenType(id);
        }
    },
    isHiddenType: function (id) {
        return (this.metacardTypes[id] === undefined ||
            this.metacardTypes[id].type === 'XML' ||
            this.metacardTypes[id].type === 'BINARY' ||
            this.metacardTypes[id].type === 'OBJECT' ||
            properties.isHidden(id));
    },
    getDatatypeEnum: function () {
        var _this = this;
        fetch('./internal/enumerations/attribute/datatype')
            .then(function (response) { return response.json(); })
            .then(function (response) {
            _.extend(_this.enums, response);
        });
    },
    getEnumForMetacardDefinition: function (metacardDefinition) {
        var _this = this;
        fetch('./internal/enumerations/metacardtype/' + metacardDefinition)
            .then(function (response) { return response.json(); })
            .then(function (response) {
            _.extend(_this.enums, transformEnumResponse(_this.metacardTypes, response));
        });
    },
    getDeprecatedEnumForMetacardDefinition: function (metacardDefinition) {
        var _this = this;
        fetch('./internal/enumerations/deprecated/' + metacardDefinition)
            .then(function (response) { return response.json(); })
            .then(function (response) {
            _.extend(_this.deprecatedEnums, transformEnumResponse(_this.metacardTypes, response));
        });
    },
    addMetacardDefinition: function (metacardDefinitionName, metacardDefinition) {
        if (Object.keys(this.metacardDefinitions).indexOf(metacardDefinitionName) ===
            -1) {
            this.getEnumForMetacardDefinition(metacardDefinitionName);
            this.getDeprecatedEnumForMetacardDefinition(metacardDefinitionName);
            this.metacardDefinitions[metacardDefinitionName] = metacardDefinition;
            for (var type in metacardDefinition) {
                if (metacardDefinition.hasOwnProperty(type)) {
                    this.metacardTypes[type] = metacardDefinition[type];
                    this.metacardTypes[type].id = this.metacardTypes[type].id || type;
                    this.metacardTypes[type].type =
                        this.metacardTypes[type].type || this.metacardTypes[type].format;
                    this.metacardTypes[type].alias = properties.attributeAliases[type];
                    this.metacardTypes[type].hidden =
                        properties.isHidden(this.metacardTypes[type].id) ||
                            this.isHiddenTypeExceptThumbnail(this.metacardTypes[type].id);
                    this.metacardTypes[type].readOnly = properties.isReadOnly(this.metacardTypes[type].id);
                }
            }
            return true;
        }
        return false;
    },
    addMetacardDefinitions: function (metacardDefinitions) {
        var updated = false;
        for (var metacardDefinition in metacardDefinitions) {
            if (metacardDefinitions.hasOwnProperty(metacardDefinition)) {
                updated =
                    this.addMetacardDefinition(metacardDefinition, metacardDefinitions[metacardDefinition]) || updated;
            }
        }
        if (updated) {
            this.updateSortedMetacardTypes();
        }
    },
    typesFetched: false,
    getMetacardTypes: function () {
        var _this = this;
        fetch('./internal/metacardtype')
            .then(function (response) { return response.json(); })
            .then(function (metacardDefinitions) {
            _this.addMetacardDefinitions(metacardDefinitions);
            _this.typesFetched = true;
        });
    },
    attributeComparator: function (a, b) {
        var attrToCompareA = this.getLabel(a).toLowerCase();
        var attrToCompareB = this.getLabel(b).toLowerCase();
        if (attrToCompareA < attrToCompareB) {
            return -1;
        }
        if (attrToCompareA > attrToCompareB) {
            return 1;
        }
        return 0;
    },
    sortMetacardTypes: function (metacardTypes) {
        return metacardTypes.sort(function (a, b) {
            var attrToCompareA = (a.alias || a.id).toLowerCase();
            var attrToCompareB = (b.alias || b.id).toLowerCase();
            if (attrToCompareA < attrToCompareB) {
                return -1;
            }
            if (attrToCompareA > attrToCompareB) {
                return 1;
            }
            return 0;
        });
    },
    updateSortedMetacardTypes: function () {
        this.sortedMetacardTypes = [];
        for (var propertyType in this.metacardTypes) {
            if (this.metacardTypes.hasOwnProperty(propertyType)) {
                this.sortedMetacardTypes.push(this.metacardTypes[propertyType]);
            }
        }
        this.sortMetacardTypes(this.sortedMetacardTypes);
    },
    getLabel: function (id) {
        var definition = this.metacardTypes[id];
        return definition ? definition.alias || id : id;
    },
    getMetacardStartingTypes: function () {
        return metacardStartingTypes;
    },
    metacardDefinitions: [],
    sortedMetacardTypes: [],
    metacardTypes: _.extendOwn({}, metacardStartingTypesWithTemporal()),
    validation: {},
    enums: properties.enums,
    deprecatedEnums: {}
}))();
//# sourceMappingURL=metacard-definitions.js.map