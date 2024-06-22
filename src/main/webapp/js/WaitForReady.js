import { __awaiter, __generator } from "tslib";
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
import { StartupDataStore } from '../js/model/Startup/startup';
function sleep(ms) {
    if (ms === void 0) { ms = 60; }
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
export var waitForReady = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!StartupDataStore.Configuration.config) return [3 /*break*/, 2];
                return [4 /*yield*/, sleep()];
            case 1:
                _a.sent();
                return [2 /*return*/, waitForReady()];
            case 2: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=WaitForReady.js.map