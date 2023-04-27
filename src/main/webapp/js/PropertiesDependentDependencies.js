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
import { __awaiter, __generator } from "tslib";
/**
 * Should be a top priority to figure out how to decouple these from needing to be run only after properties are done fetching, otherwise
 * we bottleneck the app.
 */
import user from '../component/singletons/user-instance';
import SourcesInstance from '../component/singletons/sources-instance';
import MetacardDefinitions from '../component/tabs/metacard/metacardDefinitions';
var propertyDependentWaitForReady = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(user.fetched &&
                    SourcesInstance.fetched &&
                    MetacardDefinitions.typesFetched())) return [3 /*break*/, 1];
                return [2 /*return*/];
            case 1: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 60); })];
            case 2:
                _a.sent();
                return [2 /*return*/, propertyDependentWaitForReady()];
        }
    });
}); };
export default {
    propertyDependentWaitForReady: propertyDependentWaitForReady
};
//# sourceMappingURL=PropertiesDependentDependencies.js.map