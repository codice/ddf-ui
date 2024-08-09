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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L3V0aWxzL2ZldGNoL2ZldGNoLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQTtBQUNyQixPQUFPLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDNUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBQ3JELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFxQnpCLE1BQU0sVUFBVSxjQUFjLENBQUMsUUFBMkI7SUFDaEQsSUFBQSxjQUFjLEdBQUssUUFBUSxlQUFiLENBQWE7SUFFbkMsSUFBSSxjQUFjLEVBQUU7UUFDbEIsSUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQ2xELFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLE1BQU0sRUFBYixDQUFhLENBQzFCLENBQUE7UUFFRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQzdCO0tBQ0Y7QUFDSCxDQUFDO0FBRUQsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FDekI7QUFBQyxNQUFjLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQTtBQUN4Qyw0REFBNEQ7QUFDNUQsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLEVBQUU7SUFDekMsTUFBTSxDQUFDLEtBQUssR0FBRztRQUFDLGNBQWM7YUFBZCxVQUFjLEVBQWQscUJBQWMsRUFBZCxJQUFjO1lBQWQseUJBQWM7O1FBQzVCLElBQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUNyQjtZQUNFLHVCQUF1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KipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCB1cmwgZnJvbSAndXJsJ1xuaW1wb3J0IHFzIGZyb20gJ3F1ZXJ5c3RyaW5nJ1xuaW1wb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tICcuLi8uLi8uLi9qcy9FbnZpcm9ubWVudCdcbmltcG9ydCB7IHY0IH0gZnJvbSAndXVpZCdcblxuZXhwb3J0IHR5cGUgUXVlcnlSZXNwb25zZVR5cGUgPSB7XG4gIHJlc3VsdHM6IGFueVxuICBzdGF0dXNCeVNvdXJjZToge1xuICAgIFtrZXk6IHN0cmluZ106IHtcbiAgICAgIGhpdHM6IG51bWJlclxuICAgICAgY291bnQ6IG51bWJlclxuICAgICAgZWxhcHNlZDogbnVtYmVyXG4gICAgICBpZDogc3RyaW5nXG4gICAgICBzdWNjZXNzZnVsOiBib29sZWFuXG4gICAgICB3YXJuaW5nczogYW55W11cbiAgICAgIGVycm9yczogc3RyaW5nW11cbiAgICB9XG4gIH1cbiAgdHlwZXM6IGFueVxuICBoaWdobGlnaHRzOiBhbnlcbiAgZGlkWW91TWVhbkZpZWxkczogYW55XG4gIHNob3dpbmdSZXN1bHRzRm9yRmllbGRzOiBhbnlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRm9yRXJyb3JzKHJlc3BvbnNlOiBRdWVyeVJlc3BvbnNlVHlwZSkge1xuICBjb25zdCB7IHN0YXR1c0J5U291cmNlIH0gPSByZXNwb25zZVxuXG4gIGlmIChzdGF0dXNCeVNvdXJjZSkge1xuICAgIGNvbnN0IGVycm9ycyA9IE9iamVjdC52YWx1ZXMoc3RhdHVzQnlTb3VyY2UpLmZsYXRNYXAoXG4gICAgICAoc291cmNlKSA9PiBzb3VyY2UuZXJyb3JzXG4gICAgKVxuXG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvd0ZldGNoRXJyb3JFdmVudChlcnJvcnMpXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGZldGNoID0gd2luZG93LmZldGNoXG47KHdpbmRvdyBhcyBhbnkpLl9fZ2xvYmFsX19mZXRjaCA9IGZldGNoXG4vLyBwYXRjaCBnbG9iYWwgZmV0Y2ggdG8gd2FybiBhYm91dCB1c2FnZSBkdXJpbmcgZGV2ZWxvcG1lbnRcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHdpbmRvdy5mZXRjaCA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgW1xuICAgICAgICBgVXNpbmcgJ3dpbmRvdy5mZXRjaCcuYCxcbiAgICAgICAgJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkbyB0aGlzPycsXG4gICAgICAgIGBNb3N0IGNvZGUgc2hvdWxkIHVzZSAncmVhY3QtY29tcG9uZW50L3V0aWxzL2ZldGNoJyB3aGljaCBwcm92aWRlcyBkZWZhdWx0cyBjb21wYXRpYmxlIHdpdGggdGhlIGJhY2tlbmQuYCxcbiAgICAgICAgYFRvIGdldCByaWQgb2YgdGhpcyBtZXNzYWdlLCB1c2UgJ3dpbmRvdy5fX2dsb2JhbF9fZmV0Y2gnIGluc3RlYWQuYCxcbiAgICAgIF0uam9pbignICcpXG4gICAgKVxuICAgIGNvbnNvbGUud2FybihlcnJvcilcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjU1NikgRklYTUU6IEV4cGVjdGVkIDEtMiBhcmd1bWVudHMsIGJ1dCBnb3QgMCBvciBtb3JlLlxuICAgIHJldHVybiBmZXRjaCguLi5hcmdzKVxuICB9XG59XG5jb25zdCBjYWNoZUJ1c3QgPSAodXJsU3RyaW5nOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgeyBxdWVyeSwgLi4ucmVzdCB9ID0gdXJsLnBhcnNlKHVybFN0cmluZylcbiAgcmV0dXJuIHVybC5mb3JtYXQoe1xuICAgIC4uLnJlc3QsXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICdzdHJpbmcgfCBudWxsJyBpcyBub3QgYXNzaWduYWJsZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgc2VhcmNoOiAnPycgKyBxcy5zdHJpbmdpZnkoeyAuLi5xcy5wYXJzZShxdWVyeSksIF86IERhdGUubm93KCkgfSksXG4gIH0pXG59XG5cbmV4cG9ydCB0eXBlIEZldGNoRXJyb3JFdmVudFR5cGUgPSBDdXN0b21FdmVudDx7XG4gIGVycm9yczogc3RyaW5nW11cbn0+XG5cbmNvbnN0IGZldGNoRXJyb3JFdmVudE5hbWUgPSB2NCgpIC8vIGVuc3VyZSB3ZSBkb24ndCBjbGFzaCB3aXRoIG90aGVyIGV2ZW50c1xuXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dGZXRjaEVycm9yRXZlbnQoZXJyb3JzOiBzdHJpbmdbXSA9IFtdKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnN0IGN1c3RvbUV2ZW50OiBGZXRjaEVycm9yRXZlbnRUeXBlID0gbmV3IEN1c3RvbUV2ZW50KFxuICAgICAgZmV0Y2hFcnJvckV2ZW50TmFtZSxcbiAgICAgIHtcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgZXJyb3JzLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIClcbiAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChjdXN0b21FdmVudClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuRm9yRmV0Y2hFcnJvckV2ZW50KFxuICBjYWxsYmFjazogKGV2ZW50OiBGZXRjaEVycm9yRXZlbnRUeXBlKSA9PiB2b2lkXG4pIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZmV0Y2hFcnJvckV2ZW50TmFtZSwgY2FsbGJhY2spXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKGZldGNoRXJyb3JFdmVudE5hbWUsIGNhbGxiYWNrKVxuICAgIH1cbiAgfVxuICByZXR1cm4gKCkgPT4ge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKFxuICB1cmw6IHN0cmluZyxcbiAgeyBoZWFkZXJzLCAuLi5vcHRzIH06IFJlcXVlc3RJbml0ID0ge31cbik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgaWYgKEVudmlyb25tZW50LmlzVGVzdCgpKSB7XG4gICAgY29uc3QgeyBkZWZhdWx0OiBNb2NrQXBpIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uLy4uL3Rlc3QvbW9jay1hcGknKVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAganNvbjogYXdhaXQgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gTW9ja0FwaSh1cmwpXG4gICAgICB9LFxuICAgIH0pIGFzIFByb21pc2U8UmVzcG9uc2U+XG4gIH1cbiAgcmV0dXJuIGZldGNoKGNhY2hlQnVzdCh1cmwpLCB7XG4gICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgLi4ub3B0cyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAuLi5oZWFkZXJzLFxuICAgIH0sXG4gIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNTAwKSB7XG4gICAgICB0aHJvd0ZldGNoRXJyb3JFdmVudChbcmVzcG9uc2Uuc3RhdHVzVGV4dCB8fCAnSW50ZXJuYWwgU2VydmVyIEVycm9yJ10pXG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZVxuICB9KVxufVxuIl19