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
import _ from 'underscore';
import Backbone from 'backbone';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'back... Remove this comment to see the full error message
import poller from 'backbone-poller';
import properties from '../properties';
import { CommonAjaxSettings } from '../AjaxSettings';
import fetch from '../../react-component/utils/fetch';
function removeLocalCatalogIfNeeded(response, localCatalog) {
    if (properties.isDisableLocalCatalog()) {
        response = _.filter(response, function (source) { return source.id !== localCatalog; });
    }
    return response;
}
function removeCache(response) {
    response = _.filter(response, function (source) { return source.id !== 'cache'; });
    return response;
}
var Types = Backbone.Collection.extend({});
var computeTypes = function (sources) {
    if (_.size(properties.typeNameMapping) > 0) {
        // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
        return _.map(properties.typeNameMapping, function (value, key) {
            if (_.isArray(value)) {
                return {
                    name: key,
                    value: value.join(',')
                };
            }
        });
    }
    else {
        return _.chain(sources)
            .map(function (source) { return source.contentTypes; })
            .flatten()
            .filter(function (element) { return element.name !== ''; })
            .sortBy(function (element) { return element.name.toUpperCase(); })
            .uniq(false, function (type) { return type.name; })
            .map(function (element) {
            element.value = element.name;
            return element;
        })
            .value();
    }
};
export default Backbone.Collection.extend({
    url: './internal/catalog/sources',
    // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
    comparator: function (a, b) {
        var aName = a.id.toLowerCase();
        var bName = b.id.toLowerCase();
        var aAvailable = a.get('available');
        var bAvailable = b.get('available');
        if ((aAvailable && bAvailable) || (!aAvailable && !bAvailable)) {
            if (aName < bName) {
                return -1;
            }
            if (aName > bName) {
                return 1;
            }
            return 0;
        }
        else if (!aAvailable) {
            return -1;
        }
        else if (!bAvailable) {
            return 1;
        }
    },
    initialize: function () {
        this.listenTo(this, 'change', this.sort);
        this._types = new Types();
        this.determineLocalCatalog();
        this.listenTo(this, 'sync', this.updateLocalCatalog);
    },
    types: function () {
        return this._types;
    },
    fetched: false,
    parse: function (response) {
        response = removeLocalCatalogIfNeeded(response, this.localCatalog);
        response = removeCache(response);
        response.sort(function (a, b) {
            return a.id.toLowerCase().localeCompare(b.id.toLowerCase()); // case insensitive sort
        });
        this._types.set(computeTypes(response));
        this.fetched = true;
        return response;
    },
    getHarvested: function () {
        return [this.localCatalog];
    },
    determineLocalCatalog: function () {
        var _this = this;
        fetch('./internal/localcatalogid')
            .then(function (data) { return data.json(); })
            .then(function (data) {
            _this.localCatalog = data['local-catalog-id'];
            poller
                .get(_this, {
                delay: properties.sourcePollInterval,
                delayed: properties.sourcePollInterval,
                continueOnError: true
            })
                .start();
            _this.fetch(CommonAjaxSettings);
        });
    },
    updateLocalCatalog: function () {
        if (this.get(this.localCatalog)) {
            this.get(this.localCatalog).set('local', true);
        }
    },
    localCatalog: 'local'
});
//# sourceMappingURL=Sources.js.map