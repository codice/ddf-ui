import { __assign, __awaiter, __generator, __read, __rest, __spreadArray } from "tslib";
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
import url from 'url';
import qs from 'querystring';
import { Environment } from '../../../js/Environment';
import { v4 } from 'uuid';
export function checkForErrors(response) {
    var statusBySource = response.statusBySource;
    if (statusBySource) {
        var errors = Object.values(statusBySource).flatMap(function (source) { return source.errors; });
        if (errors.length > 0) {
            throwFetchErrorEvent(errors);
        }
    }
}
var fetch = window.fetch;
window.__global__fetch = fetch;
// patch global fetch to warn about usage during development
if (process.env.NODE_ENV !== 'production') {
    window.fetch = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var error = new Error([
            "Using 'window.fetch'.",
            'Are you sure you want to do this?',
            "Most code should use 'react-component/utils/fetch' which provides defaults compatible with the backend.",
            "To get rid of this message, use 'window.__global__fetch' instead.",
        ].join(' '));
        console.warn(error);
        // @ts-expect-error ts-migrate(2556) FIXME: Expected 1-2 arguments, but got 0 or more.
        return fetch.apply(void 0, __spreadArray([], __read(args), false));
    };
}
var cacheBust = function (urlString) {
    var _a = url.parse(urlString), query = _a.query, rest = __rest(_a, ["query"]);
    return url.format(__assign(__assign({}, rest), { 
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | null' is not assignable... Remove this comment to see the full error message
        search: '?' + qs.stringify(__assign(__assign({}, qs.parse(query)), { _: Date.now() })) }));
};
var fetchErrorEventName = v4(); // ensure we don't clash with other events
export function throwFetchErrorEvent(errors) {
    if (errors === void 0) { errors = []; }
    if (typeof window !== 'undefined') {
        var customEvent = new CustomEvent(fetchErrorEventName, {
            detail: {
                errors: errors,
            },
        });
        window.dispatchEvent(customEvent);
    }
}
export function listenForFetchErrorEvent(callback) {
    if (typeof window !== 'undefined') {
        window.addEventListener(fetchErrorEventName, callback);
        return function () {
            window.removeEventListener(fetchErrorEventName, callback);
        };
    }
    return function () { };
}
export default function (url, _a) {
    if (_a === void 0) { _a = {}; }
    var headers = _a.headers, opts = __rest(_a, ["headers"]);
    return __awaiter(this, void 0, void 0, function () {
        var MockApi_1, _b, _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!Environment.isTest()) return [3 /*break*/, 3];
                    return [4 /*yield*/, import('../../../test/mock-api')];
                case 1:
                    MockApi_1 = (_e.sent()).default;
                    _c = (_b = Promise).resolve;
                    _d = {};
                    return [4 /*yield*/, function () {
                            return MockApi_1(url);
                        }];
                case 2: return [2 /*return*/, _c.apply(_b, [(_d.json = _e.sent(),
                            _d)])];
                case 3: return [2 /*return*/, fetch(cacheBust(url), __assign(__assign({ credentials: 'same-origin', cache: 'no-cache' }, opts), { headers: __assign({ 'X-Requested-With': 'XMLHttpRequest' }, headers) })).then(function (response) {
                        if (response.status === 500) {
                            throwFetchErrorEvent([response.statusText || 'Internal Server Error']);
                        }
                        return response;
                    })];
            }
        });
    });
}
//# sourceMappingURL=fetch.js.map