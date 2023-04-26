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
import properties from '../js/properties';
export var waitForReady = function () { return __awaiter(void 0, void 0, void 0, function () {
    var propertyDependentWaitForReady;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                properties.init();
                if (!properties.fetched) return [3 /*break*/, 4];
                return [4 /*yield*/, import('./PropertiesDependentDependencies')];
            case 1: return [4 /*yield*/, (_a.sent())["default"]];
            case 2:
                propertyDependentWaitForReady = (_a.sent()).propertyDependentWaitForReady;
                return [4 /*yield*/, propertyDependentWaitForReady()];
            case 3:
                _a.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 60); })];
            case 5:
                _a.sent();
                return [2 /*return*/, waitForReady()];
            case 6: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=WaitForReady.js.map