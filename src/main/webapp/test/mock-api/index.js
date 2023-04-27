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
import User from '../../js/model/User';
import MetacardTypeJSON from './metacardtype';
import Config from './config';
import PlatformConfig from './metacardtype';
import DatatypeJSON from './datatype';
import Sources from './sources';
import Enumerations from './enumerations';
var mockDataMap = {
    './internal/metacardtype': MetacardTypeJSON,
    './internal/config': Config,
    './internal/platform/config/ui': PlatformConfig,
    './internal/enumerations/attribute/datatype': DatatypeJSON,
    './internal/user': User.Model.prototype.defaults(),
    './internal/localcatalogid': 'ddf.distribution',
    './internal/forms/result': [],
    './internal/catalog/sources': Sources
};
var mockDataGlobs = {
    './internal/enumerations': Enumerations
};
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'url' implicitly has an 'any' type.
export default (function (url) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var data = mockDataMap[url];
    if (data === undefined) {
        Object.keys(mockDataGlobs).forEach(function (glob) {
            if (url.startsWith(glob)) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                data = mockDataGlobs[glob];
            }
        });
    }
    if (data === undefined) {
        throw new Error("Unknown url '".concat(url, "' for mock api."));
    }
    return data;
});
//# sourceMappingURL=index.js.map