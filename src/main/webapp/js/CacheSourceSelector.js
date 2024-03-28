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
import cql from './cql';
import CQLUtils from './CQLUtils';
function buildCacheSourcesCql(sources) {
    return {
        type: 'OR',
        filters: sources
            .filter(function (source) { return source !== 'cache'; })
            .map(function (source) { return ({
            property: '"metacard_source"',
            type: '=',
            value: source,
        }); }),
    };
}
function limitCacheSources(cql, sources) {
    return {
        type: 'AND',
        filters: [cql, buildCacheSourcesCql(sources)],
    };
}
export default {
    trimCacheSources: function (cqlString, sources) {
        return CQLUtils.sanitizeGeometryCql('(' +
            cql.write(
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ type: string; filters: any[]; ... Remove this comment to see the full error message
            limitCacheSources(cql.simplify(cql.read(cqlString)), sources)) +
            ')');
    },
};
//# sourceMappingURL=CacheSourceSelector.js.map