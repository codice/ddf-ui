import { __awaiter, __generator, __read } from "tslib";
/* Copyright (c) Connexta, LLC */
import fetch from '../../react-component/utils/fetch';
export var getRandomId = function () {
    return "a".concat(Math.round(Math.random() * 10000000000000).toString());
};
export var suggestionsToOptions = function (suggestions) {
    if (suggestions === undefined || Object.keys(suggestions).length === 0) {
        return [];
    }
    else {
        return Object.entries(suggestions).flatMap(function (_a) {
            var _b = __read(_a, 2), category = _b[0], tokens = _b[1];
            return tokens.map(function (token) { return ({
                type: category,
                token: token,
            }); });
        });
    }
};
export var fetchSuggestions = function (_a) {
    var text = _a.text, callback = _a.callback, signal = _a.signal;
    return __awaiter(void 0, void 0, void 0, function () {
        var res, json;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("./internal/boolean-search/suggest?q=".concat(encodeURIComponent(text)), {
                        signal: signal,
                    })];
                case 1:
                    res = _b.sent();
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    }
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = _b.sent();
                    callback({
                        options: suggestionsToOptions(json.suggestions),
                        error: json.error,
                    });
                    return [2 /*return*/];
            }
        });
    });
};
export var fetchCql = function (_a) {
    var searchText = _a.searchText, searchProperty = _a.searchProperty, callback = _a.callback, signal = _a.signal;
    return __awaiter(void 0, void 0, void 0, function () {
        var trimmedInput, res, json;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    trimmedInput = searchText.trim();
                    if (!trimmedInput) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetch("./internal/boolean-search/cql?q=".concat(encodeURIComponent(trimmedInput), "&e=").concat(encodeURIComponent(searchProperty)), {
                            signal: signal,
                        })];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = (_b.sent());
                    callback(json);
                    return [3 /*break*/, 4];
                case 3:
                    callback({ cql: '' });
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=boolean-search-utils.js.map