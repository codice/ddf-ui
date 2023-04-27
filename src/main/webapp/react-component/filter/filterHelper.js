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
import metacardDefinitions from '../../component/singletons/metacard-definitions';
import properties from '../../js/properties';
var toAttribute = function (attribute, group) {
    return {
        label: attribute.alias || attribute.id,
        value: attribute.id,
        description: (properties.attributeDescriptions || {})[attribute.id],
        group: group
    };
};
export var getGroupedFilteredAttributes = function () {
    var allAttributes = metacardDefinitions.sortedMetacardTypes.reduce(function (attributes, attr) {
        attributes[attr.id] = attr;
        return attributes;
    }, {});
    var validCommonAttributes = properties.commonAttributes.reduce(function (attributes, id) {
        var attribute = allAttributes[id];
        if (attribute) {
            attributes.push(toAttribute(attribute, 'Commonly Used Attributes'));
        }
        return attributes;
    }, []);
    var groupedFilteredAttributes = validCommonAttributes.concat(getFilteredAttributeList('All Attributes'));
    var groups = validCommonAttributes.length > 0
        ? ['Commonly Used Attributes', 'All Attributes']
        : [];
    return {
        groups: groups,
        attributes: groupedFilteredAttributes
    };
};
export var getFilteredAttributeList = function (group) {
    return metacardDefinitions.sortedMetacardTypes
        .filter(function (_a) {
        var id = _a.id;
        return !properties.isHidden(id) && !metacardDefinitions.isHiddenType(id);
    })
        .map(function (attr) { return toAttribute(attr, group); });
};
export var getAttributeType = function (attribute) {
    var type = metacardDefinitions.metacardTypes[attribute].type;
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