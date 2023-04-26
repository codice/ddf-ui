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
import fetch from '../fetch';
import { postAuditLog } from '../audit/audit-endpoint';
export var Transformer;
(function (Transformer) {
    Transformer["Metacard"] = "metacard";
    Transformer["Query"] = "query";
})(Transformer || (Transformer = {}));
export var getExportResults = function (results) {
    return results.map(function (result) { return getExportResult(result); });
};
var getResultId = function (result) {
    var id = result.plain.id;
    return encodeURIComponent(id);
};
var getResultSourceId = function (result) {
    var sourceId = result.plain.metacard.properties['source-id'];
    return encodeURIComponent(sourceId);
};
export var getExportResult = function (result) {
    return {
        id: getResultId(result),
        source: getResultSourceId(result),
        attributes: Object.keys(result.plain.metacard.properties)
    };
};
export var getExportOptions = function (type) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("./internal/transformers/".concat(type))];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
export var exportResult = function (source, id, transformer, attributes) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("/services/catalog/sources/".concat(source, "/").concat(id, "?transform=").concat(transformer, "&columnOrder=").concat(attributes))];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, postAuditLog({
                        action: 'exported',
                        component: 'metacard',
                        items: [{ id: id, 'source-id': source }]
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, response];
        }
    });
}); };
export var exportResultSet = function (transformer, body) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("./internal/cql/transform/".concat(transformer), {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
//# sourceMappingURL=export.js.map