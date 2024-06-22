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
import Backbone from 'backbone';
import _ from 'underscore';
import * as TurfMeta from '@turf/meta';
import wkx from 'wkx';
import 'backbone-associations';
import { StartupDataStore } from './Startup/startup';
export default Backbone.AssociatedModel.extend({
    type: 'metacard-properties',
    defaults: function () {
        return {
            'metacard-tags': ['resource'],
        };
    },
    hasGeometry: function (attribute) {
        return (_.filter(this.toJSON(), function (_value, key) {
            return (attribute === undefined || attribute === key) &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key] &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key].type ===
                    'GEOMETRY';
        }).length > 0);
    },
    getCombinedGeoJSON: function () {
        return;
    },
    getPoints: function (attribute) {
        try {
            return this.getGeometries(attribute).reduce(function (pointArray, wkt) {
                return pointArray.concat(
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
                TurfMeta.coordAll(wkx.Geometry.parse(wkt).toGeoJSON()));
            }, []);
        }
        catch (err) {
            console.error(err);
            return [];
        }
    },
    getGeometries: function (attribute) {
        return _.filter(this.toJSON(), function (_value, key) {
            return !StartupDataStore.MetacardDefinitions.isHiddenAttribute(key) &&
                (attribute === undefined || attribute === key) &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key] &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key].type ===
                    'GEOMETRY';
        });
    },
});
//# sourceMappingURL=MetacardProperties.js.map