import { __awaiter, __generator, __read } from "tslib";
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
import { StartupDataStore } from '../../../js/model/Startup/startup';
import { TypedUserInstance } from '../../../component/singletons/TypedUser';
import { Overridable } from '../../../js/model/Base/base-classes';
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
        attributes: Object.keys(result.plain.metacard.properties),
    };
};
export var getExportOptions = function (type) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("./internal/transformers/".concat(type))
                    .then(function (response) { return response.json(); })
                    .then(function (exportFormats) {
                    var configuredFormats = type == Transformer.Metacard
                        ? StartupDataStore.Configuration.getExportMetacardFormatOptions()
                        : StartupDataStore.Configuration.getExportMetacardsFormatOptions();
                    if (configuredFormats.length > 0) {
                        var newFormats = configuredFormats
                            .map(function (configuredFormat) {
                            var validFormat = exportFormats.find(function (exportFormat) {
                                return exportFormat.id === configuredFormat;
                            });
                            if (validFormat == undefined)
                                console.log(configuredFormat +
                                    ' does not match any valid transformers; cannot include format in export list.');
                            return validFormat;
                        })
                            .filter(function (format) { return format !== undefined; });
                        if (newFormats.length > 0)
                            return newFormats;
                        else
                            console.log("Could not match admin's configured export options to any valid transformers. \
          Returning list of all valid transformers instead.");
                    }
                    else {
                        console.log('Export formats not configured. Using list of all valid transformers instead.');
                    }
                    return exportFormats;
                })];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response];
        }
    });
}); };
export var getColumnOrder = function () {
    return TypedUserInstance.getResultsAttributesSummaryShown();
};
export var OverridableGetColumnOrder = new Overridable(getColumnOrder);
export var aliasMap = function () {
    var _a;
    return encodeURIComponent(Object.entries(((_a = StartupDataStore.Configuration.config) === null || _a === void 0 ? void 0 : _a.attributeAliases) || {})
        .map(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        return "".concat(k, "=").concat(v);
    })
        .toString());
};
export var exportResultSet = function (transformer, body) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("./internal/cql/transform/".concat(transformer), {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
//# sourceMappingURL=export.js.map