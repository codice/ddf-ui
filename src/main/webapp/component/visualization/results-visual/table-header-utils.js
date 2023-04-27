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
import metacardDefinitions from '../../singletons/metacard-definitions';
import properties from '../../../js/properties';
import user from '../../singletons/user-instance';
import Backbone from 'backbone';
import _ from 'underscore';
var filteredAttributesModel = Backbone.Model.extend({
    defaults: {
        filteredAttributes: []
    }
});
var defaultTableColumns = properties.defaultTableColumns
    ? properties.defaultTableColumns.map(function (attr) {
        return attr.toLowerCase();
    })
    : [];
var setDefaultColumns = function (filteredAttributes) {
    var hasSelectedColumns = user
        .get('user')
        .get('preferences')
        .get('hasSelectedColumns');
    var availableAttributes = filteredAttributes.get('filteredAttributes');
    if (!hasSelectedColumns &&
        availableAttributes.length &&
        defaultTableColumns.length) {
        var hiddenAttributes = availableAttributes.filter(function (attr) { return !defaultTableColumns.includes(attr.toLowerCase()); });
        user.get('user').get('preferences').set('columnHide', hiddenAttributes);
    }
};
export var getFilteredAttributes = function (lazyResults) {
    var filteredAttributes = new filteredAttributesModel({
        filteredAttributes: lazyResults.getCurrentAttributes()
    });
    setDefaultColumns(filteredAttributes);
    return filteredAttributes;
};
export var getVisibleHeaders = function (filteredAttributes) {
    var sortAttributes = _.filter(metacardDefinitions.sortedMetacardTypes, function (type) { return !metacardDefinitions.isHiddenTypeExceptThumbnail(type.id); }).map(function (type) { return type.id; });
    var prefs = user.get('user').get('preferences');
    var preferredHeader = prefs.get('columnOrder');
    var hiddenColumns = prefs.get('columnHide');
    var availableAttributes = filteredAttributes.get('filteredAttributes');
    // tack on unknown attributes to end (sorted), then save
    preferredHeader = _.union(preferredHeader, availableAttributes);
    prefs.set('columnOrder', preferredHeader);
    prefs.savePreferences();
    var headers = preferredHeader
        .filter(function (property) { return availableAttributes.indexOf(property) !== -1; })
        .map(function (property) { return ({
        label: properties.attributeAliases[property],
        id: property,
        hidden: hiddenColumns.indexOf(property) >= 0 ||
            properties.isHidden(property) ||
            metacardDefinitions.isHiddenTypeExceptThumbnail(property),
        sortable: sortAttributes.indexOf(property) >= 0
    }); });
    return headers.filter(function (header) { return !header.hidden; });
};
//# sourceMappingURL=table-header-utils.js.map