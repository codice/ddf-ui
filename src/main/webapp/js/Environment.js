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
// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__ENV__'.
console.info(__ENV__); // moving this here as it's useful to see at least once
export var Environment = {
    isTest: function () {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__ENV__'.
        return __ENV__ === 'test';
    },
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__COMMIT_HASH__'.
    commitHash: __COMMIT_HASH__,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__IS_DIRTY__'.
    isDirty: __IS_DIRTY__,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__COMMIT_DATE__'.
    commitDate: __COMMIT_DATE__,
};
//# sourceMappingURL=Environment.js.map