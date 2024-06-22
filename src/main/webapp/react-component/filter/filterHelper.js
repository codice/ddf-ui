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
import { BasicDataTypePropertyName } from '../../component/filter-builder/reserved.properties';
import { StartupDataStore } from '../../js/model/Startup/startup';
var toAttribute = function (attribute, group) {
    var _a;
    return {
        label: attribute.alias || attribute.id,
        value: attribute.id,
        description: (((_a = StartupDataStore.Configuration.config) === null || _a === void 0 ? void 0 : _a.attributeDescriptions) || {})[attribute.id],
        group: group,
    };
};
export var getGroupedFilteredAttributes = function () {
    var allAttributes = StartupDataStore.MetacardDefinitions.getSortedAttributes().reduce(function (attributes, attr) {
        attributes[attr.id] = attr;
        return attributes;
    }, {});
    var validCommonAttributes = StartupDataStore.Configuration.getCommonAttributes().reduce(function (attributes, id) {
        var attribute = allAttributes[id];
        if (attribute) {
            attributes.push(toAttribute(attribute, 'Commonly Used Attributes'));
        }
        return attributes;
    }, []);
    var basicDataTypeAttributeDefinition = StartupDataStore.MetacardDefinitions.getAttributeDefinition(BasicDataTypePropertyName);
    var groupedFilteredAttributes = validCommonAttributes
        .concat([
        toAttribute(basicDataTypeAttributeDefinition, 'Special Attributes'),
    ])
        .concat(getFilteredAttributeList('All Attributes'));
    var groups = validCommonAttributes.length > 0
        ? ['Commonly Used Attributes', 'Special Attributes', 'All Attributes']
        : ['Special Attributes', 'All Attributes'];
    return {
        groups: groups,
        attributes: groupedFilteredAttributes,
    };
};
export var getFilteredAttributeList = function (group) {
    return StartupDataStore.MetacardDefinitions.getSortedAttributes()
        .filter(function (_a) {
        var id = _a.id;
        return id === 'anyText' ||
            id === 'anyGeo' ||
            id === BasicDataTypePropertyName ||
            (!StartupDataStore.MetacardDefinitions.isHiddenAttribute(id) &&
                id !== 'thumbnail');
    })
        .map(function (attr) { return toAttribute(attr, group); });
};
export var getAttributeType = function (attribute) {
    var _a;
    var type = (_a = StartupDataStore.MetacardDefinitions.getAttributeMap()[attribute]) === null || _a === void 0 ? void 0 : _a.type;
    if (type === 'GEOMETRY')
        return 'LOCATION';
    if (isIntegerType(type))
        return 'INTEGER';
    if (isFloatType(type))
        return 'FLOAT';
    return type;
};
var isIntegerType = function (type) {
    return type === 'INTEGER' || type === 'SHORT' || type === 'LONG';
};
var isFloatType = function (type) {
    return type === 'FLOAT' || type === 'DOUBLE';
};
//# sourceMappingURL=filterHelper.js.map