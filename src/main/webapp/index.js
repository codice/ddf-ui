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
// check browser before loading the rest of the app
import { isSupportedBrowser } from './check-browser';
import { removeRedirectQueryParams } from './handle-query-params';
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isSupportedBrowser()) return [3 /*break*/, 4];
                removeRedirectQueryParams();
                return [4 /*yield*/, import('./js/WaitForReady')];
            case 1: 
            // wait for critical data to be fetched
            return [4 /*yield*/, (_a.sent()).waitForReady()];
            case 2:
                // wait for critical data to be fetched
                _a.sent();
                return [4 /*yield*/, import('./app')];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=index.js.map