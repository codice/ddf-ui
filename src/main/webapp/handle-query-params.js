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
// some systems like keycloak attach query params which interfere with react router / golden layout and their use of query params (when using hash routing)
export function removeRedirectQueryParams() {
    if (location.href.includes("".concat(location.pathname, "?"))) {
        var preHashStuff = location.href.split('?')[0];
        location.href = preHashStuff + location.hash;
    }
}
//# sourceMappingURL=handle-query-params.js.map